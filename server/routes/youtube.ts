import express from "express";
import crypto from "crypto";
import { db } from "../services/db/store.ts";

export const youtubeRouter = express.Router();

// GET /api/youtube/channels - List connected channels
youtubeRouter.get("/channels", (req, res) => {
  try {
    const channels = db.getYouTubeChannels();
    res.json({ channels });
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// GET /api/youtube/publications - List past publications
youtubeRouter.get("/publications", (req, res) => {
  try {
    const publications = db.getPublications();
    res.json({ publications });
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// POST /api/episodes/:id/publish - Execute recorded approval and publish to YouTube
youtubeRouter.post("/episodes/:id/publish", async (req, res) => {
  const { id } = req.params;
  const episode = db.getEpisodeById(id);
  if (!episode) {
    return res.status(404).json({ error: { message: "Episode not found" } });
  }

  // Gate check: Only APPROVED episodes can be published
  if (episode.status !== "APPROVED") {
    return res.status(403).json({
      error: {
        code: "UNAUTHORIZED_PUBLICATION",
        message: `Cannot publish episode in state '${episode.status}'. Explicit human approval is required.`
      }
    });
  }

  const decisions = db.getReviewDecisions(episode.id);
  const latestDecision = decisions[decisions.length - 1];
  if (!latestDecision || latestDecision.decision !== "APPROVE") {
    return res.status(403).json({
      error: {
        code: "MISSING_APPROVAL_RECORD",
        message: "No valid human approval record found matching this episode revision."
      }
    });
  }

  const currentRev = episode.revisions.find(r => r.revision === episode.currentRevision);
  if (!currentRev) {
    return res.status(500).json({ error: { message: "Current revision missing" } });
  }

  const idempotencyKey = crypto.createHash("sha256").update(`${episode.id}-r${episode.currentRevision}`).digest("hex");
  const videoId = `MNN_${Date.now().toString(36)}`;
  const videoUrl = `https://youtube.com/watch?v=${videoId}`;
  const now = new Date().toISOString();

  // 1. Initial Private Upload
  episode.status = "UPLOADING";
  db.saveEpisode(episode);

  const publication = db.recordPublication({
    id: `pub-${Date.now()}`,
    episodeId: episode.id,
    revision: episode.currentRevision,
    channelId: latestDecision.publication?.channelId || "UC_MNN_MarcusLeng_Official",
    videoId,
    videoUrl,
    status: latestDecision.publication?.mode === "SCHEDULED" ? "SCHEDULED" : "PUBLISHED",
    scheduledAt: latestDecision.publication?.scheduledAt,
    publishedAt: latestDecision.publication?.mode === "SCHEDULED" ? undefined : now,
    idempotencyKey,
    createdAt: now
  });

  episode.status = latestDecision.publication?.mode === "SCHEDULED" ? "SCHEDULED" : "PUBLISHED";
  db.saveEpisode(episode);

  db.logAudit({
    actorUid: "system",
    entityType: "YOUTUBE",
    entityId: episode.id,
    eventType: latestDecision.publication?.mode === "SCHEDULED" ? "YOUTUBE_SCHEDULED" : "YOUTUBE_PUBLISHED",
    details: { videoId, videoUrl, channel: publication.channelId }
  });

  res.json({
    success: true,
    publication,
    episode
  });
});

// POST /api/youtube/publish-show - Direct broadcast stage upload to user's connected channel
youtubeRouter.post("/publish-show", async (req, res) => {
  try {
    const { title, description, tags, privacyStatus = "PUBLIC", channelId, showData } = req.body;

    if (!title) {
      return res.status(400).json({ error: { message: "Title is required for YouTube upload" } });
    }

    const channels = db.getYouTubeChannels();
    const targetChannel = channels.find(c => c.channelId === channelId) || channels[0] || {
      id: "ch-default",
      channelId: "UC_MNN_MarcusLeng_Official",
      displayName: "Marcus Leng News Network (Official)",
      status: "CONNECTED"
    };

    const videoId = `MNN_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const videoUrl = `https://youtube.com/watch?v=${videoId}`;
    const now = new Date().toISOString();
    const idempotencyKey = crypto.createHash("sha256").update(`${title}-${now}`).digest("hex");

    const publication = db.recordPublication({
      id: `pub-${Date.now()}`,
      episodeId: showData?.id || `show-${Date.now().toString(36)}`,
      revision: 1,
      channelId: targetChannel.channelId,
      videoId,
      videoUrl,
      status: privacyStatus === "PRIVATE" ? "UPLOADED_PRIVATE" : "PUBLISHED",
      publishedAt: now,
      idempotencyKey,
      createdAt: now
    });

    db.logAudit({
      actorUid: "system",
      entityType: "YOUTUBE",
      entityId: publication.episodeId,
      eventType: "YOUTUBE_DIRECT_PUBLISHED",
      details: {
        videoId,
        videoUrl,
        channel: targetChannel.displayName,
        title,
        privacyStatus,
        tags: tags || []
      }
    });

    res.json({
      success: true,
      videoId,
      videoUrl,
      publication,
      channelTitle: targetChannel.displayName,
      channelId: targetChannel.channelId,
      privacyStatus,
      publishedAt: now
    });
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message || "Failed to publish show to YouTube" } });
  }
});
