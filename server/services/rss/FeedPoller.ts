import { XMLParser } from "fast-xml-parser";
import crypto from "crypto";
import { URL } from "url";
import { validateSafeUrl } from "../../lib/ssrfGuard.ts";
import { db, RssFeed, RssItem, StoryCluster } from "../db/store.ts";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
  processEntities: false, // Prevents XML External Entity (XXE) attacks
});

/**
 * Normalizes URLs by stripping advertising and tracking query parameters (utm_*, fbclid, etc.)
 * while preserving legitimate content-routing parameters (id, p, article, etc.).
 */
export function normalizeArticleUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const trackingParams = [
      "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
      "fbclid", "gclid", "_ga", "ref", "mc_cid", "mc_eid"
    ];
    for (const param of trackingParams) {
      parsed.searchParams.delete(param);
    }
    // Remove trailing slashes and hash fragments
    let clean = parsed.toString().split("#")[0];
    if (clean.endsWith("/") && parsed.pathname !== "/") {
      clean = clean.slice(0, -1);
    }
    return clean;
  } catch {
    return rawUrl.trim();
  }
}

/**
 * Strips HTML tags and normalizes body text for analysis and audio scripting.
 */
export function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export interface PollResult {
  feedId: string;
  itemsFetched: number;
  itemsNew: number;
  statusCode: number;
  notModified: boolean;
  error?: string;
}

/**
 * Polls a single configured RSS or Atom feed safely.
 */
export async function pollFeed(feed: RssFeed): Promise<PollResult> {
  try {
    // 1. SSRF and protocol validation
    const safeUrl = await validateSafeUrl(feed.url);

    // 2. Conditional HTTP headers
    const headers: Record<string, string> = {
      "User-Agent": "MNN-News-Robot/1.0 (MarcusLeng News Network RSS-to-Video Engine)",
      "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
    };
    if (feed.etag) {
      headers["If-None-Match"] = feed.etag;
    }
    if (feed.lastModified) {
      headers["If-Modified-Since"] = feed.lastModified;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(safeUrl.toString(), {
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    // 3. Handle 304 Not Modified
    if (res.status === 304) {
      feed.lastPolledAt = new Date().toISOString();
      feed.lastError = null;
      db.saveFeed(feed);
      return {
        feedId: feed.id,
        itemsFetched: 0,
        itemsNew: 0,
        statusCode: 304,
        notModified: true
      };
    }

    if (!res.ok) {
      const errMsg = `HTTP Error ${res.status}: ${res.statusText}`;
      feed.lastError = errMsg;
      feed.lastPolledAt = new Date().toISOString();
      db.saveFeed(feed);
      return {
        feedId: feed.id,
        itemsFetched: 0,
        itemsNew: 0,
        statusCode: res.status,
        notModified: false,
        error: errMsg
      };
    }

    // Save etag and last-modified for future conditional requests
    feed.etag = res.headers.get("etag") || undefined;
    feed.lastModified = res.headers.get("last-modified") || undefined;

    const xmlText = await res.text();
    const parsed = parser.parse(xmlText);

    // Support RSS 2.0 (<rss><channel><item>) and Atom (<feed><entry>)
    let rawItems: any[] = [];
    if (parsed.rss?.channel?.item) {
      rawItems = Array.isArray(parsed.rss.channel.item)
        ? parsed.rss.channel.item
        : [parsed.rss.channel.item];
    } else if (parsed.feed?.entry) {
      rawItems = Array.isArray(parsed.feed.entry)
        ? parsed.feed.entry
        : [parsed.feed.entry];
    } else if (parsed["rdf:RDF"]?.item) {
      rawItems = Array.isArray(parsed["rdf:RDF"].item)
        ? parsed["rdf:RDF"].item
        : [parsed["rdf:RDF"].item];
    }

    const parsedItems: RssItem[] = [];
    const now = new Date().toISOString();

    for (const raw of rawItems) {
      const rawTitle = raw.title?.["#text"] || raw.title || "Untitled AI Story";
      const cleanTitle = stripHtml(String(rawTitle)).trim();
      if (!cleanTitle) continue;

      let link = "";
      if (typeof raw.link === "string") {
        link = raw.link;
      } else if (raw.link?.["@_href"]) {
        link = raw.link["@_href"];
      } else if (raw.guid && typeof raw.guid === "string" && raw.guid.startsWith("http")) {
        link = raw.guid;
      }
      const canonicalUrl = normalizeArticleUrl(link || feed.url);

      const guid = String(raw.guid?.["#text"] || raw.guid || raw.id || canonicalUrl);
      const pubDate = raw.pubDate || raw.published || raw.updated || now;
      const body = stripHtml(String(raw.description || raw.summary || raw["content:encoded"] || ""));
      const author = String(raw["dc:creator"] || raw.author?.name || raw.author || feed.title);

      const contentHash = crypto
        .createHash("sha256")
        .update(`${cleanTitle}|${canonicalUrl}|${body.slice(0, 100)}`)
        .digest("hex");

      parsedItems.push({
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        feedId: feed.id,
        feedTitle: feed.title,
        guid,
        canonicalUrl,
        title: cleanTitle,
        author,
        publishedAt: new Date(pubDate).toISOString(),
        fetchedAt: now,
        contentHash,
        bodyText: body
      });
    }

    // 4. Upsert items idempotently
    const addedCount = db.upsertItems(parsedItems);

    // 5. Cluster new items into story opportunities
    for (const item of parsedItems) {
      autoClusterItem(item, feed.category);
    }

    feed.lastPolledAt = now;
    feed.lastError = null;
    db.saveFeed(feed);

    return {
      feedId: feed.id,
      itemsFetched: parsedItems.length,
      itemsNew: addedCount,
      statusCode: 200,
      notModified: false
    };

  } catch (err: any) {
    const errMsg = err.message || "Failed to poll feed";
    feed.lastError = errMsg;
    feed.lastPolledAt = new Date().toISOString();
    db.saveFeed(feed);

    return {
      feedId: feed.id,
      itemsFetched: 0,
      itemsNew: 0,
      statusCode: 500,
      notModified: false,
      error: errMsg
    };
  }
}

/**
 * Deduplicates and clusters an item into an existing StoryCluster or creates a new one.
 */
function autoClusterItem(item: RssItem, defaultCategory: string): StoryCluster {
  const existingClusters = db.getClusters();

  // Normalized title token matching
  const itemTokens = new Set(
    item.title.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(w => w.length > 3)
  );

  let bestMatch: StoryCluster | null = null;
  let highestOverlap = 0;

  for (const cluster of existingClusters) {
    const clusterTokens = cluster.title.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(w => w.length > 3);
    let overlap = 0;
    for (const token of clusterTokens) {
      if (itemTokens.has(token)) overlap++;
    }
    const ratio = overlap / Math.max(1, clusterTokens.length);
    if (ratio > 0.65 && ratio > highestOverlap) {
      highestOverlap = ratio;
      bestMatch = cluster;
    }
  }

  // Merge into existing cluster
  if (bestMatch) {
    if (!bestMatch.sourceItemIds.includes(item.id)) {
      bestMatch.sourceItemIds.push(item.id);
      bestMatch.sources.push({
        id: item.id,
        title: item.title,
        url: item.canonicalUrl,
        publisher: item.feedTitle,
        publishedAt: item.publishedAt
      });
      bestMatch.duplicateCount++;
      bestMatch.lastSeenAt = new Date().toISOString();
      // Increase score when corroborated by multiple independent sources
      bestMatch.score = Math.min(99, bestMatch.score + 10);
      db.saveCluster(bestMatch);
    }
    return bestMatch;
  }

  // Otherwise, create a new StoryCluster
  const now = new Date().toISOString();
  const newCluster: StoryCluster = {
    id: `cluster-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ownerUid: "system",
    leadItemId: item.id,
    title: item.title,
    summary: item.bodyText.slice(0, 240) || item.title,
    category: defaultCategory || "AI",
    sourceItemIds: [item.id],
    sources: [
      {
        id: item.id,
        title: item.title,
        url: item.canonicalUrl,
        publisher: item.feedTitle,
        publishedAt: item.publishedAt
      }
    ],
    firstSeenAt: now,
    lastSeenAt: now,
    duplicateCount: 1,
    score: 80, // initial baseline opportunity score
    status: 'VERIFIED',
    claims: [
      {
        id: `claim-${Date.now()}`,
        clusterId: `cluster-${Date.now()}`,
        claimText: item.title,
        verdict: 'SUPPORTED',
        evidenceExcerpt: item.bodyText.slice(0, 180) || item.title,
        sourceUrl: item.canonicalUrl,
        sourceTitle: item.feedTitle,
        confidence: 0.90,
        isSatirical: false
      }
    ]
  };

  db.saveCluster(newCluster);
  return newCluster;
}

/**
 * Polls all enabled feeds in the database.
 */
export async function pollAllEnabledFeeds(): Promise<PollResult[]> {
  const feeds = db.getFeeds().filter(f => f.enabled);
  const results: PollResult[] = [];
  for (const feed of feeds) {
    const result = await pollFeed(feed);
    results.push(result);
  }
  return results;
}
