import express from "express";
import { steppsEngine } from "../services/stepps/SteppsEngine.ts";

export const steppsRouter = express.Router();

// GET /api/mnn/stepps/stories - List all verified stories
steppsRouter.get("/stories", (req, res) => {
  try {
    const stories = steppsEngine.getVerifiedStories();
    res.json({ stories, total: stories.length });
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// POST /api/mnn/stepps/diagnose - Diagnose story along 6 STEPPS dimensions (PRD §41)
steppsRouter.post("/diagnose", (req, res) => {
  try {
    const { storyId } = req.body || {};
    if (!storyId) {
      return res.status(400).json({ error: { message: "storyId is required" } });
    }
    const story = steppsEngine.getVerifiedStoryById(storyId);
    if (!story) {
      return res.status(404).json({ error: { message: `Verified story ${storyId} not found` } });
    }

    const diagnosis = steppsEngine.diagnoseStory(story);
    res.json({ diagnosis });
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// POST /api/mnn/stepps/angles - Generate 3 distinct editorial angles (PRD §42)
steppsRouter.post("/angles", (req, res) => {
  try {
    const { storyId, audience = "founders" } = req.body || {};
    if (!storyId) {
      return res.status(400).json({ error: { message: "storyId is required" } });
    }
    const angles = steppsEngine.generateEditorialAngles(storyId, audience);
    res.json({ angles });
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// POST /api/mnn/content-master - Create ContentMaster object (PRD §43)
steppsRouter.post("/content-master", (req, res) => {
  try {
    const { storyId, editorialAngleId } = req.body || {};
    if (!storyId || !editorialAngleId) {
      return res.status(400).json({ error: { message: "storyId and editorialAngleId are required" } });
    }
    const contentMaster = steppsEngine.createContentMaster(storyId, editorialAngleId);
    res.json({ contentMaster });
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// POST /api/mnn/stepps/script - Generate broadcast script beats with Fact QC
steppsRouter.post("/script", (req, res) => {
  try {
    const { contentMasterId } = req.body || {};
    if (!contentMasterId) {
      return res.status(400).json({ error: { message: "contentMasterId is required" } });
    }
    const script = steppsEngine.generateScript(contentMasterId);
    res.json({ script });
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// POST /api/mnn/stepps/autopilot - Run full autonomous newsroom pipeline (PRD §34, §47)
steppsRouter.post("/autopilot", async (req, res) => {
  try {
    const result = await steppsEngine.runAutopilot();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message } });
  }
});
