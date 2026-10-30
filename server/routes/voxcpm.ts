import { Router, Request, Response } from 'express';
import { VoxCpmService } from '../services/voxcpm/voxcpmService.ts';
import { VoxCpmGenerateRequest } from '../services/voxcpm/types.ts';

export const voxcpmRouter = Router();

/**
 * GET /api/tts/voxcpm/status
 * Engine health and capabilities
 */
voxcpmRouter.get('/status', (req: Request, res: Response) => {
  try {
    const status = VoxCpmService.getEngineStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/tts/voxcpm/voices
 * List available curated & custom voice profiles
 */
voxcpmRouter.get('/voices', (req: Request, res: Response) => {
  try {
    const profiles = VoxCpmService.getVoiceProfiles();
    res.json({
      success: true,
      voices: profiles,
      count: profiles.length
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/tts/voxcpm/generate
 * Synthesizes speech using OpenBMB VoxCPM
 * If Accept header includes audio/wav or format === 'wav', streams raw 48kHz WAV audio
 */
voxcpmRouter.post('/generate', async (req: Request, res: Response) => {
  try {
    const requestData: VoxCpmGenerateRequest = req.body;
    if (!requestData || !requestData.text) {
      return res.status(400).json({ error: 'Missing required field: text' });
    }

    const result = await VoxCpmService.generateSpeech(requestData);

    // Return binary WAV directly if requested
    const acceptHeader = req.headers['accept'] || '';
    if (requestData.format === 'wav' || acceptHeader.includes('audio/wav') || acceptHeader.includes('audio/*')) {
      const audioBuffer = Buffer.from(result.audioBase64, 'base64');
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Length', audioBuffer.length);
      res.setHeader('X-VoxCPM-Engine', result.metadata.engine);
      res.setHeader('X-VoxCPM-Voice', result.voiceUsed.name);
      res.setHeader('X-VoxCPM-Duration', result.durationSec.toString());
      return res.send(audioBuffer);
    }

    // Default: JSON payload with base64 audio and metadata
    res.json({
      success: true,
      ...result
    });
  } catch (err: any) {
    console.error('[VoxCPM Route] Generation error:', err);
    res.status(500).json({ error: err.message || 'VoxCPM synthesis failed' });
  }
});

/**
 * GET /api/tts/voxcpm/sample/:voiceId
 * Stream audio preview directly for browser <audio> tags or previews
 */
voxcpmRouter.get('/sample/:voiceId', async (req: Request, res: Response) => {
  try {
    const { voiceId } = req.params;
    const profile = VoxCpmService.getVoiceProfile(voiceId);
    if (!profile) {
      return res.status(404).json({ error: `Voice profile '${voiceId}' not found` });
    }

    const sampleText = profile.samplePreviewText;
    const result = await VoxCpmService.generateSpeech({
      text: sampleText,
      voiceId: profile.id,
      sampleRate: 48000
    });

    const audioBuffer = Buffer.from(result.audioBase64, 'base64');
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('X-VoxCPM-Voice', profile.name);
    return res.send(audioBuffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/tts/voxcpm/design
 * Create a new custom voice profile from a natural language prompt
 */
voxcpmRouter.post('/design', (req: Request, res: Response) => {
  try {
    const { name, description, gender, role } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'Missing required field: description' });
    }

    const profile = VoxCpmService.designVoice({
      name: name || 'Custom Voice',
      description,
      gender,
      role
    });

    res.json({
      success: true,
      voice: profile
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/tts/voxcpm/clone
 * Clone voice from reference audio
 */
voxcpmRouter.post('/clone', (req: Request, res: Response) => {
  try {
    const { name, referenceAudioBase64, referenceText, role } = req.body;
    if (!referenceAudioBase64) {
      return res.status(400).json({ error: 'Missing required field: referenceAudioBase64' });
    }

    const profile = VoxCpmService.cloneVoice({
      name: name || 'Cloned Speaker',
      referenceAudioBase64,
      referenceText,
      role
    });

    res.json({
      success: true,
      voice: profile
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/tts/voxcpm/cli-script
 * Generate standalone Python code snippet using official openbmb/VoxCPM2 model
 */
voxcpmRouter.post('/cli-script', (req: Request, res: Response) => {
  try {
    const { text, voicePrompt, voiceId } = req.body;
    const script = VoxCpmService.generatePythonCliScript({
      text: text || "OpenBMB VoxCPM delivers non-robotic 48kHz studio audio.",
      voicePrompt,
      voiceId
    });

    res.json({
      success: true,
      script,
      pipCommand: 'pip install voxcpm soundfile torch'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
