/**
 * OpenBMB VoxCPM Type Definitions
 * Based on OpenBMB/VoxCPM and VoxCPM2 48kHz Tokenizer-Free Architecture
 * https://github.com/OpenBMB/VoxCPM
 */

export interface VoxCpmVoiceProfile {
  id: string;
  name: string;
  role: string;
  gender: 'male' | 'female' | 'neutral';
  voicePrompt: string; // Natural language voice design prompt
  defaultCfg: number; // Guidance scale (typical: 2.0)
  defaultTimesteps: number; // Diffusion timesteps (typical: 10)
  defaultSpeed: number; // Speech rate multiplier (typical: 0.95 - 1.0)
  pitchProfile: 'baritone' | 'tenor' | 'alto' | 'soprano' | 'neutral';
  acousticCharacteristics: {
    timbre: string;
    cadence: string;
    warmth: number; // 0.0 - 1.0
    clarity: number; // 0.0 - 1.0
  };
  samplePreviewText: string;
  isCustom?: boolean;
}

export interface VoxCpmGenerateRequest {
  text: string;
  voiceId?: string;
  voicePrompt?: string; // For zero-shot Voice Design
  referenceAudioBase64?: string; // For Voice Cloning
  referenceText?: string;
  cfgScale?: number; // 1.0 to 5.0, default 2.0
  inferenceTimesteps?: number; // 5 to 30, default 10
  speed?: number; // 0.8 to 1.3, default 1.0
  pitch?: number; // 0.8 to 1.2, default 1.0
  sampleRate?: 48000 | 24000; // Native AudioVAE is 48000 Hz
  format?: 'wav' | 'json';
}

export interface VoxCpmGenerateResponse {
  audioBase64: string;
  mimeType: 'audio/wav';
  sampleRate: number;
  durationSec: number;
  voiceUsed: {
    id: string;
    name: string;
    voicePrompt: string;
  };
  metadata: {
    engine: 'remote_cluster' | 'local_cli' | 'studio_audiovae_neural';
    cfgScale: number;
    inferenceTimesteps: number;
    latencyMs: number;
    timestamp: string;
    model: 'openbmb/VoxCPM2';
  };
}

export interface VoxCpmEngineStatus {
  status: 'ready' | 'initializing' | 'offline';
  model: 'openbmb/VoxCPM2';
  engineMode: 'remote_cluster' | 'local_cli' | 'studio_audiovae_neural';
  nativeSampleRate: 48000;
  activeVoicesCount: number;
  features: {
    voiceDesign: boolean;
    voiceCloning: boolean;
    streamingAudio: boolean;
    continuousAcousticLatents: boolean;
    audioVaeSuperResolution: boolean;
  };
}
