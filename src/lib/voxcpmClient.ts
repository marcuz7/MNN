/**
 * Client library for OpenBMB VoxCPM 2.0 Voice Synthesis Engine
 * https://github.com/OpenBMB/VoxCPM
 */

export interface VoxCpmVoice {
  id: string;
  name: string;
  role: string;
  gender: 'male' | 'female' | 'neutral';
  voicePrompt: string;
  defaultCfg: number;
  defaultTimesteps: number;
  defaultSpeed: number;
  pitchProfile: string;
  acousticCharacteristics: {
    timbre: string;
    cadence: string;
    warmth: number;
    clarity: number;
  };
  samplePreviewText: string;
  isCustom?: boolean;
}

export interface VoxCpmStatus {
  status: 'ready' | 'initializing' | 'offline';
  model: string;
  engineMode: 'remote_cluster' | 'local_cli' | 'studio_audiovae_neural';
  nativeSampleRate: number;
  activeVoicesCount: number;
  features: {
    voiceDesign: boolean;
    voiceCloning: boolean;
    streamingAudio: boolean;
    continuousAcousticLatents: boolean;
    audioVaeSuperResolution: boolean;
  };
}

// In-memory audio blob cache to avoid re-synthesizing identical sentences
const audioBlobCache = new Map<string, { url: string; duration: number }>();
let currentActiveAudio: HTMLAudioElement | null = null;

/**
 * Fetch available voices from backend VoxCPM service
 */
export async function fetchVoxCpmVoices(): Promise<VoxCpmVoice[]> {
  try {
    const res = await fetch('/api/tts/voxcpm/voices');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.voices || [];
  } catch (err) {
    console.warn('[VoxCPM Client] Failed to fetch voices, using defaults:', err);
    return [];
  }
}

/**
 * Fetch VoxCPM engine status
 */
export async function fetchVoxCpmStatus(): Promise<VoxCpmStatus | null> {
  try {
    const res = await fetch('/api/tts/voxcpm/status');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Synthesize speech via VoxCPM backend
 */
export async function synthesizeVoxCpmAudio(params: {
  text: string;
  voiceId?: string;
  voicePrompt?: string;
  cfgScale?: number;
  inferenceTimesteps?: number;
  speed?: number;
  pitch?: number;
}): Promise<{ audioUrl: string; durationSec: number; metadata: any }> {
  const cacheKey = `${params.voiceId || 'default'}_${params.speed || 1.0}_${params.text.trim()}`;
  if (audioBlobCache.has(cacheKey)) {
    const cached = audioBlobCache.get(cacheKey)!;
    return {
      audioUrl: cached.url,
      durationSec: cached.duration,
      metadata: { cached: true, engine: 'cache' }
    };
  }

  const res = await fetch('/api/tts/voxcpm/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      text: params.text,
      voiceId: params.voiceId,
      voicePrompt: params.voicePrompt,
      cfgScale: params.cfgScale,
      inferenceTimesteps: params.inferenceTimesteps,
      speed: params.speed,
      pitch: params.pitch,
      format: 'json'
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Synthesis failed with HTTP ${res.status}`);
  }

  const data = await res.json();
  const binaryString = atob(data.audioBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: 'audio/wav' });
  const audioUrl = URL.createObjectURL(blob);
  const durationSec = data.durationSec || 2.0;

  audioBlobCache.set(cacheKey, { url: audioUrl, duration: durationSec });

  return {
    audioUrl,
    durationSec,
    metadata: data.metadata
  };
}

/**
 * Play VoxCPM audio with complete lifecycle callbacks
 */
export async function playVoxCpmAudio(
  audioUrl: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): Promise<HTMLAudioElement> {
  stopVoxCpmAudio();

  const audio = new Audio(audioUrl);
  currentActiveAudio = audio;

  audio.onplay = () => {
    callbacks?.onStart?.();
  };

  audio.onended = () => {
    currentActiveAudio = null;
    callbacks?.onEnd?.();
  };

  audio.onerror = (e) => {
    currentActiveAudio = null;
    callbacks?.onError?.(e);
  };

  try {
    await audio.play();
  } catch (err) {
    callbacks?.onError?.(err);
  }

  return audio;
}

/**
 * Stop active VoxCPM audio playback immediately
 */
export function stopVoxCpmAudio() {
  if (currentActiveAudio) {
    currentActiveAudio.pause();
    currentActiveAudio.currentTime = 0;
    currentActiveAudio = null;
  }
}

/**
 * Synthesize and play speech in a single call
 */
export async function speakVoxCpm(
  text: string,
  options?: {
    voiceId?: string;
    speed?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): Promise<HTMLAudioElement> {
  const result = await synthesizeVoxCpmAudio({
    text,
    voiceId: options?.voiceId,
    speed: options?.speed,
    pitch: options?.pitch
  });

  return playVoxCpmAudio(result.audioUrl, {
    onStart: options?.onStart,
    onEnd: options?.onEnd,
    onError: options?.onError
  });
}

/**
 * Design a new custom voice profile from a text description
 */
export async function designCustomVoice(params: {
  name: string;
  description: string;
  gender?: 'male' | 'female' | 'neutral';
  role?: string;
}): Promise<VoxCpmVoice> {
  const res = await fetch('/api/tts/voxcpm/design', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    throw new Error('Voice design request failed');
  }

  const data = await res.json();
  return data.voice;
}

/**
 * Generate Python CLI code snippet
 */
export async function getPythonScript(params: {
  text: string;
  voiceId?: string;
  voicePrompt?: string;
}): Promise<string> {
  const res = await fetch('/api/tts/voxcpm/cli-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!res.ok) throw new Error('Failed to generate script');
  const data = await res.json();
  return data.script;
}
