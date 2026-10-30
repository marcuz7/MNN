import express from "express";
import { db } from "../services/db/store.ts";
import { compileGateAEpisode } from "../services/director/VideoDirector.ts";

export const storiesRouter = express.Router();

// GET /api/stories - Ranked news radar clusters
storiesRouter.get("/", (req, res) => {
  try {
    const clusters = db.getClusters();
    res.json({ clusters, total: clusters.length });
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// GET /api/stories/:id - Specific story cluster and evidence packet
storiesRouter.get("/:id", (req, res) => {
  const { id } = req.params;
  const cluster = db.getClusterById(id);
  if (!cluster) {
    return res.status(404).json({ error: { message: "Story cluster not found" } });
  }
  res.json({ cluster });
});

// POST /api/stories/:id/produce - Produce draft episode from this story
storiesRouter.post("/:id/produce", (req, res) => {
  const { id } = req.params;
  const cluster = db.getClusterById(id);
  if (!cluster) {
    return res.status(404).json({ error: { message: "Story cluster not found" } });
  }

  try {
    const episode = compileGateAEpisode({
      clusterIds: [id],
      targetDurationSeconds: 90
    });

    cluster.status = "PRODUCED";
    db.saveCluster(cluster);

    res.status(201).json({ episode });
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// POST /api/stories/produce-selected - Produce Gate A 90s episode from user-picked 3 clusters
storiesRouter.post("/produce-selected", (req, res) => {
  try {
    const { clusterIds, targetDurationSeconds = 90 } = req.body || {};
    if (!Array.isArray(clusterIds) || clusterIds.length === 0) {
      return res.status(400).json({ error: { message: "clusterIds array is required" } });
    }

    const episode = compileGateAEpisode({
      clusterIds,
      targetDurationSeconds
    });

    // Mark clusters as PRODUCED
    for (const id of clusterIds) {
      const c = db.getClusterById(id);
      if (c) {
        c.status = "PRODUCED";
        db.saveCluster(c);
      }
    }

    res.status(201).json({ episode });
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message } });
  }
});

