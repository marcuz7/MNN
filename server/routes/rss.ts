import express from "express";
import { db, RssFeed } from "../services/db/store.ts";
import { pollFeed, pollAllEnabledFeeds } from "../services/rss/FeedPoller.ts";
import { validateSafeUrl } from "../lib/ssrfGuard.ts";

export const rssRouter = express.Router();

// GET /api/rss/feeds - List configured feeds
rssRouter.get("/feeds", (req, res) => {
  try {
    const feeds = db.getFeeds();
    res.json({ feeds });
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// POST /api/rss/feeds/validate - Validate feed URL before persistence
rssRouter.post("/feeds/validate", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: { message: "Missing URL parameter" } });
  }

  try {
    const safeUrl = await validateSafeUrl(url);
    const headRes = await fetch(safeUrl.toString(), {
      method: "HEAD",
      headers: { "User-Agent": "MNN-Validator/1.0" },
    });
    res.json({
      valid: headRes.ok,
      status: headRes.status,
      contentType: headRes.headers.get("content-type") || "unknown",
      url: safeUrl.toString()
    });
  } catch (err: any) {
    res.status(422).json({ error: { message: err.message, valid: false } });
  }
});

// POST /api/rss/feeds - Add new feed
rssRouter.post("/feeds", async (req, res) => {
  const { url, title, category = "AI", language = "en", priority = 8, pollIntervalMinutes = 30, enabled = true } = req.body;
  if (!url || !title) {
    return res.status(400).json({ error: { message: "URL and title are required." } });
  }

  try {
    const safeUrl = await validateSafeUrl(url);
    const existing = db.getFeeds().find(f => f.url === safeUrl.toString());
    if (existing) {
      return res.status(409).json({ error: { message: "Feed URL already exists." } });
    }

    const now = new Date().toISOString();
    const newFeed: RssFeed = {
      id: `feed-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ownerUid: "system",
      url: safeUrl.toString(),
      title: title.trim(),
      category: category.trim(),
      language,
      priority: Number(priority),
      enabled: Boolean(enabled),
      pollIntervalMinutes: Number(pollIntervalMinutes),
      createdAt: now,
      updatedAt: now
    };

    db.saveFeed(newFeed);
    db.logAudit({
      actorUid: "system",
      entityType: "FEED",
      entityId: newFeed.id,
      eventType: "FEED_CREATED",
      details: { url: newFeed.url, title: newFeed.title }
    });

    // Auto-poll newly added feed
    pollFeed(newFeed).catch(e => console.warn(`[RSS] Initial poll failed for ${newFeed.title}:`, e));

    res.status(201).json({ feed: newFeed });
  } catch (err: any) {
    res.status(422).json({ error: { message: err.message } });
  }
});

// PATCH /api/rss/feeds/:id - Update feed
rssRouter.patch("/feeds/:id", (req, res) => {
  const { id } = req.params;
  const feed = db.getFeedById(id);
  if (!feed) {
    return res.status(404).json({ error: { message: "Feed not found." } });
  }

  const { title, category, priority, pollIntervalMinutes, enabled } = req.body;
  if (title !== undefined) feed.title = String(title).trim();
  if (category !== undefined) feed.category = String(category).trim();
  if (priority !== undefined) feed.priority = Number(priority);
  if (pollIntervalMinutes !== undefined) feed.pollIntervalMinutes = Number(pollIntervalMinutes);
  if (enabled !== undefined) feed.enabled = Boolean(enabled);

  db.saveFeed(feed);
  res.json({ feed });
});

// DELETE /api/rss/feeds/:id - Delete feed
rssRouter.delete("/feeds/:id", (req, res) => {
  const { id } = req.params;
  const success = db.deleteFeed(id);
  if (!success) {
    return res.status(404).json({ error: { message: "Feed not found." } });
  }
  res.json({ success: true });
});

// POST /api/rss/feeds/:id/poll - Manual poll single feed
rssRouter.post("/feeds/:id/poll", async (req, res) => {
  const { id } = req.params;
  const feed = db.getFeedById(id);
  if (!feed) {
    return res.status(404).json({ error: { message: "Feed not found." } });
  }

  try {
    const result = await pollFeed(feed);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// POST /api/rss/poll-all - Manual poll all feeds
rssRouter.post("/poll-all", async (req, res) => {
  try {
    const results = await pollAllEnabledFeeds();
    res.json({ results });
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// GET /api/rss/items - List ingested items
rssRouter.get("/items", (req, res) => {
  try {
    const items = db.getItems();
    res.json({ items, count: items.length });
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message } });
  }
});
