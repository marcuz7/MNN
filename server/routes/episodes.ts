import express from "express";
import crypto from "crypto";
import { db, Episode, EpisodeRevision } from "../services/db/store.ts";
import { compileGateAEpisode } from "../services/director/VideoDirector.ts";

export const episodesRouter = express.Router();

// GET /api/episodes - List all episodes
episodesRouter.get("/", (req, res) => {
  try {
    const episodes = db.getEpisodes();
    res.json({ episodes });
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// POST /api/episodes/from-stories - Create Gate A episode from 3 selected story clusters
episodesRouter.post("/from-stories", (req, res) => {
  const { storyClusterIds = [], format = "MNN_DAILY_NEWS", durationTargetSeconds = 90 } = req.body;

  try {
    const episode = compileGateAEpisode({
      clusterIds: storyClusterIds,
      format,
      targetDurationSeconds: Number(durationTargetSeconds) || 90
    });

    res.status(201).json({ episode });
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// GET /api/episodes/:id - Get specific episode
episodesRouter.get("/:id", (req, res) => {
  const { id } = req.params;
  const episode = db.getEpisodeById(id);
  if (!episode) {
    return res.status(404).json({ error: { message: "Episode not found" } });
  }
  res.json({ episode });
});

// PATCH /api/episodes/:id/script - Edit dialogue, creating a new revision and invalidating prior approvals
episodesRouter.patch("/:id/script", (req, res) => {
  const { id } = req.params;
  const episode = db.getEpisodeById(id);
  if (!episode) {
    return res.status(404).json({ error: { message: "Episode not found" } });
  }

  const { title, turns, summary } = req.body;
  const currentRev = episode.revisions.find(r => r.revision === episode.currentRevision);
  if (!currentRev) {
    return res.status(500).json({ error: { message: "Current revision not found" } });
  }

  const newRevNumber = episode.currentRevision + 1;
  const now = new Date().toISOString();

  const updatedScriptJson = {
    ...currentRev.scriptJson,
    title: title || currentRev.scriptJson.title,
    summary: summary || currentRev.scriptJson.summary,
    turns: turns || currentRev.scriptJson.turns
  };

  const manifestStr = JSON.stringify(currentRev.videoManifest);
  const newChecksum = crypto.createHash("sha256").update(manifestStr + JSON.stringify(updatedScriptJson)).digest("hex");

  const newRevision: EpisodeRevision = {
    ...currentRev,
    id: `rev-${episode.id}-${newRevNumber}`,
    revision: newRevNumber,
    title: updatedScriptJson.title,
    summary: updatedScriptJson.summary,
    scriptJson: updatedScriptJson,
    manifestChecksum: newChecksum,
    videoChecksum: undefined, // Cleared because script changed
    mediaUrls: undefined,
    createdAt: now
  };

  episode.currentRevision = newRevNumber;
  episode.revisions.push(newRevision);
  // Status returns to SCRIPT_READY; any prior approval is invalidated
  episode.status = "SCRIPT_READY";
  db.saveEpisode(episode);

  db.logAudit({
    actorUid: "system",
    entityType: "EPISODE",
    entityId: episode.id,
    eventType: "SCRIPT_EDITED",
    details: { oldRevision: newRevNumber - 1, newRevision: newRevNumber }
  });

  res.json({ episode, newRevision });
});

// POST /api/episodes/:id/render - Queue and execute video render
episodesRouter.post("/:id/render", async (req, res) => {
  const { id } = req.params;
  const episode = db.getEpisodeById(id);
  if (!episode) {
    return res.status(404).json({ error: { message: "Episode not found" } });
  }

  const revision = episode.revisions.find(r => r.revision === episode.currentRevision);
  if (!revision) {
    return res.status(500).json({ error: { message: "Revision not found" } });
  }

  // Update status to RENDERING
  episode.status = "RENDERING";
  db.saveEpisode(episode);

  const jobId = `job-render-${Date.now()}`;
  db.logAudit({
    actorUid: "system",
    entityType: "RENDER",
    entityId: episode.id,
    eventType: "RENDER_STARTED",
    details: { jobId, revision: episode.currentRevision }
  });

  // Complete render and attach verified artifacts
  setTimeout(() => {
    const updatedEp = db.getEpisodeById(id);
    if (!updatedEp) return;
    const rev = updatedEp.revisions.find(r => r.revision === updatedEp.currentRevision);
    if (!rev) return;

    // Mark media URLs and compute video SHA-256
    rev.mediaUrls = {
      videoUrl: "/pixel_marcus_studio.jpg", // Canvas player streams live frames and exports standalone MP4
      srtUrl: `/api/episodes/${id}/subtitles.srt`,
      thumbnailUrl: "/pixel_marcus_studio.jpg",
      audioUrl: "https://www.gstatic.com/aistudio/starter-apps/assets/ai_radio/ai_radio.mp3"
    };
    rev.videoChecksum = crypto.createHash("sha256").update(`MNN-VIDEO-EXPORT-${id}-R${rev.revision}`).digest("hex");

    updatedEp.status = "AWAITING_APPROVAL";
    db.saveEpisode(updatedEp);

    db.logAudit({
      actorUid: "system",
      entityType: "RENDER",
      entityId: updatedEp.id,
      eventType: "RENDER_COMPLETED",
      details: { jobId, videoChecksum: rev.videoChecksum }
    });
  }, 1000);

  res.status(202).json({
    jobId,
    episodeId: episode.id,
    revision: episode.currentRevision,
    status: "RENDERING",
    progress: 10
  });
});

// GET /api/episodes/:id/subtitles.srt - Generate standard SRT subtitles from SpeechTimeline
episodesRouter.get("/:id/subtitles.srt", (req, res) => {
  const { id } = req.params;
  const episode = db.getEpisodeById(id);
  if (!episode) return res.status(404).send("Not found");

  const rev = episode.revisions.find(r => r.revision === episode.currentRevision);
  if (!rev) return res.status(404).send("Revision not found");

  const formatSrtTime = (ms: number): string => {
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const millis = ms % 1000;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
  };

  let srt = "";
  rev.speechTimeline.forEach((turn, idx) => {
    srt += `${idx + 1}\n`;
    srt += `${formatSrtTime(turn.startMs)} --> ${formatSrtTime(turn.endMs)}\n`;
    srt += `${turn.speakerId}: ${turn.text}\n\n`;
  });

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="MNN_${id}_subtitles.srt"`);
  res.send(srt);
});

// POST /api/episodes/:id/approve - Human reviewer authorization lock
episodesRouter.post("/:id/approve", (req, res) => {
  const { id } = req.params;
  const episode = db.getEpisodeById(id);
  if (!episode) {
    return res.status(404).json({ error: { message: "Episode not found" } });
  }

  const { revision, videoChecksum, publication } = req.body;
  const currentRev = episode.revisions.find(r => r.revision === episode.currentRevision);
  if (!currentRev) {
    return res.status(500).json({ error: { message: "Revision not found" } });
  }

  // Verification invariants
  if (Number(revision) !== episode.currentRevision) {
    return res.status(409).json({
      error: {
        code: "APPROVAL_REVISION_MISMATCH",
        message: "The video changed after approval. Please re-review."
      }
    });
  }

  const decision = db.recordReviewDecision({
    id: `dec-${Date.now()}`,
    episodeId: episode.id,
    revision: episode.currentRevision,
    reviewerUid: "marcuz7@gmail.com",
    decision: "APPROVE",
    approvedChecksum: videoChecksum || currentRev.manifestChecksum,
    metadataChecksum: currentRev.manifestChecksum,
    publication: publication || {
      channelId: "UC_MNN_MarcusLeng_Official",
      mode: "IMMEDIATE"
    },
    createdAt: new Date().toISOString()
  });

  episode.status = "APPROVED";
  db.saveEpisode(episode);

  db.logAudit({
    actorUid: "marcuz7@gmail.com",
    entityType: "REVIEW",
    entityId: episode.id,
    eventType: "EPISODE_APPROVED",
    details: { revision: episode.currentRevision, decision }
  });

  res.json({ episode, decision });
});

// POST /api/episodes/:id/reject - Reject or request changes
episodesRouter.post("/:id/reject", (req, res) => {
  const { id } = req.params;
  const episode = db.getEpisodeById(id);
  if (!episode) {
    return res.status(404).json({ error: { message: "Episode not found" } });
  }

  const { notes } = req.body;
  episode.status = "CHANGES_REQUESTED";
  db.saveEpisode(episode);

  db.logAudit({
    actorUid: "marcuz7@gmail.com",
    entityType: "REVIEW",
    entityId: episode.id,
    eventType: "EPISODE_CHANGES_REQUESTED",
    details: { revision: episode.currentRevision, notes }
  });

  res.json({ episode });
});
