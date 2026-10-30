import { speakVoxCpm, stopVoxCpmAudio } from './voxcpmClient';


export interface VoiceOption {
  voice: SpeechSynthesisVoice;
  displayName: string;
  isNeural: boolean;
  score: number;
  gender: 'male' | 'female' | 'neutral';
}

export interface SpeechSettings {
  selectedVoiceURI: string | null;
  rate: number;          // Default ~0.95 (conversational, broadcast pace)
  pitch: number;         // Default ~0.97 (warm anchor resonance)
  volume: number;        // 0 to 1
  warmthBoost: boolean;  // Broadcast presence
  useVoxCpm: boolean;    // Enable OpenBMB VoxCPM 48kHz Studio Engine
  voxCpmVoiceId: string; // Active VoxCPM Persona ID
}

const STORAGE_KEY = 'mnn_studio_voice_settings';

// Synthesizers that sound mechanical, robotic, or harsh
const ROBOTIC_BLACKLIST = [
  'espeak',
  'festival',
  'mbrola',
  'robotic',
  'sampler',
  'croak',
  'whisper',
  'klatt',
  'bad',
  'synth',
  'kal',
  'deranged',
  'cellos',
  'pipe organ',
  'trinoids',
  'zarvox',
  'bells',
  'boing',
  'bubbles',
  'bad news',
  'good news',
  'hysterical'
];

// Top tier neural / natural voices
const NEURAL_PRIORITY = [
  'natural',
  'neural',
  'online (natural)',
  'google us english',
  'google uk english male',
  'en-us-neural',
  'christopher online',
  'guy online',
  'aria online',
  'jenny online',
  'ava (premium)',
  'samantha (enhanced)',
  'alex (enhanced)',
  'daniel (enhanced)',
  'oliver (enhanced)',
  'serena (enhanced)'
];

const CLEAN_HUMAN_VOICES = [
  'samantha',
  'alex',
  'daniel',
  'karen',
  'tom',
  'moira',
  'david',
  'zira',
  'mark',
  'george',
  'rishi',
  'hazel',
  'siri',
  'google'
];

let cachedVoices: SpeechSynthesisVoice[] = [];
let voiceChangeListeners: Array<() => void> = [];

export function getStoredVoiceSettings(): SpeechSettings {
  if (typeof window === 'undefined') {
    return { selectedVoiceURI: null, rate: 0.95, pitch: 0.97, volume: 1.0, warmthBoost: true, useVoxCpm: true, voxCpmVoiceId: 'marcus-anchor' };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { 
        rate: 0.95, 
        pitch: 0.97, 
        volume: 1.0, 
        warmthBoost: true, 
        useVoxCpm: true, 
        voxCpmVoiceId: 'marcus-anchor', 
        ...JSON.parse(raw) 
      };
    }
  } catch (e) {
    console.warn('Failed to load voice settings:', e);
  }
  return { selectedVoiceURI: null, rate: 0.95, pitch: 0.97, volume: 1.0, warmthBoost: true, useVoxCpm: true, voxCpmVoiceId: 'marcus-anchor' };
}

export function saveStoredVoiceSettings(settings: Partial<SpeechSettings>): SpeechSettings {
  const current = getStoredVoiceSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save voice settings:', e);
  }
  return updated;
}

/**
 * Score and classify a speech synthesis voice
 */
export function scoreVoice(v: SpeechSynthesisVoice, targetGender: 'male' | 'female' | 'anchor' = 'anchor'): number {
  const name = v.name.toLowerCase();
  const lang = v.lang.toLowerCase();

  // Instant disqualification if matching robotic synthesizers
  for (const blacklisted of ROBOTIC_BLACKLIST) {
    if (name.includes(blacklisted)) return -5000;
  }

  let score = 0;

  // Language check: English primary
  if (lang.startsWith('en-us')) score += 100;
  else if (lang.startsWith('en-gb') || lang.startsWith('en-ca') || lang.startsWith('en-au')) score += 80;
  else if (lang.startsWith('en')) score += 60;
  else return -2000; // Deprioritize non-English for English news broadcast

  // Neural / Natural tier
  for (const n of NEURAL_PRIORITY) {
    if (name.includes(n)) {
      score += 1500;
      break;
    }
  }

  // Clean OS voices tier
  for (const c of CLEAN_HUMAN_VOICES) {
    if (name.includes(c)) {
      score += 500;
      break;
    }
  }

  // Gender alignment
  const isMale = name.includes('male') || name.includes('david') || name.includes('guy') || 
                 name.includes('christopher') || name.includes('alex') || name.includes('daniel') || 
                 name.includes('george') || name.includes('mark') || name.includes('tom');
                 
  const isFemale = name.includes('female') || name.includes('zira') || name.includes('aria') || 
                   name.includes('jenny') || name.includes('samantha') || name.includes('karen') || 
                   name.includes('moira') || name.includes('hazel');

  if (targetGender === 'anchor' || targetGender === 'male') {
    if (isMale) score += 300;
    if (name.includes('guy') || name.includes('christopher') || name.includes('alex')) score += 200;
  } else if (targetGender === 'female') {
    if (isFemale) score += 300;
    if (name.includes('aria') || name.includes('jenny') || name.includes('samantha')) score += 200;
  }

  // Prefer local service over remote if both exist, but online neural over old local espeak
  if (v.localService) score += 10;

  return score;
}

/**
 * Get prioritized list of natural human voices
 */
export function getAvailableNaturalVoices(targetGender: 'male' | 'female' | 'anchor' = 'anchor'): VoiceOption[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];

  const rawVoices = window.speechSynthesis.getVoices();
  if (rawVoices.length === 0) return [];

  const scored = rawVoices
    .map(v => {
      const s = scoreVoice(v, targetGender);
      const name = v.name.toLowerCase();
      const isNeural = NEURAL_PRIORITY.some(n => name.includes(n));
      const isMale = name.includes('male') || name.includes('david') || name.includes('guy') || 
                     name.includes('christopher') || name.includes('alex') || name.includes('daniel');
      const isFemale = name.includes('female') || name.includes('zira') || name.includes('aria') || 
                       name.includes('jenny') || name.includes('samantha') || name.includes('karen');

      return {
        voice: v,
        displayName: `${v.name} (${v.lang})`,
        isNeural,
        score: s,
        gender: isMale ? 'male' as const : isFemale ? 'female' as const : 'neutral' as const
      };
    })
    .filter(item => item.score > -1000) // Exclude blacklisted robotic voices
    .sort((a, b) => b.score - a.score);

  return scored;
}

/**
 * Clean text to ensure fluid human cadence and avoid phonetic errors
 */
export function cleanTextForNaturalSpeech(text: string): string {
  if (!text) return '';

  let cleaned = text
    // Remove markdown formatting
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#+\s+/gm, '')
    // Expand URLs
    .replace(/https?:\/\/(?:www\.)?github\.com\/([^\s]+)/gi, 'GitHub repository $1')
    .replace(/https?:\/\/[^\s]+/gi, 'link')
    // Expand tech acronyms & currency
    .replace(/\$([0-9,]+)\/mo/gi, '$1 dollars per month')
    .replace(/\$([0-9,]+)/gi, '$1 dollars')
    .replace(/\b9:16\b/g, 'nine by sixteen')
    .replace(/\b16:9\b/g, 'sixteen by nine')
    .replace(/\b1:1\b/g, 'one by one')
    .replace(/\bCTA\b/g, 'call to action')
    .replace(/\bDM\b/g, 'direct message')
    .replace(/\bUI\b/g, 'user interface')
    .replace(/\bAPI\b/g, 'A P I')
    .replace(/\bSaaS\b/gi, 'sass')
    .replace(/\bPRD\b/g, 'P R D')
    .replace(/\bRSS\b/g, 'R S S')
    .replace(/\bQC\b/g, 'quality control')
    .replace(/\bSTEPPS\b/g, 'steps')
    .replace(/->/g, ' leads to ')
    .replace(/=>/g, ' yields ')
    .replace(/\/\//g, ' note: ')
    // Remove emojis or strange unicode symbols
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    // Normalize punctuation pauses
    .replace(/([.?!])\s*/g, '$1 ')
    .replace(/,\s*/g, ', ')
    .trim();

  return cleaned;
}

/**
 * High quality speech synthesis invocation with OpenBMB VoxCPM studio engine & browser fallback
 */
export function speakNaturalSpeech(
  text: string,
  options?: {
    gender?: 'male' | 'female' | 'anchor';
    rate?: number;
    pitch?: number;
    voiceId?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): { stop: () => void } {
  const cleanedText = cleanTextForNaturalSpeech(text);
  if (!cleanedText) return { stop: () => {} };

  const settings = getStoredVoiceSettings();
  stopNaturalSpeech();

  // Primary Path: OpenBMB VoxCPM 48kHz Tokenizer-Free Studio Audio
  if (settings.useVoxCpm !== false) {
    const targetVoiceId = options?.voiceId || settings.voxCpmVoiceId || (
      options?.gender === 'female' ? 'alice-reporter' : 'marcus-anchor'
    );

    speakVoxCpm(cleanedText, {
      voiceId: targetVoiceId,
      speed: options?.rate ?? settings.rate ?? 0.96,
      pitch: options?.pitch ?? settings.pitch ?? 1.0,
      onStart: () => options?.onStart?.(),
      onEnd: () => options?.onEnd?.(),
      onError: (err) => {
        console.warn('[VoxCPM fallback] Engine error, falling back to clean browser synthesizer:', err);
        fallbackBrowserSpeech();
      }
    }).catch(err => {
      console.warn('[VoxCPM fallback] Network exception, falling back:', err);
      fallbackBrowserSpeech();
    });

    return {
      stop: () => stopNaturalSpeech()
    };
  }

  // Secondary Fallback: Clean browser synthesizer with robotic blacklisting
  function fallbackBrowserSpeech() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      const targetGender = options?.gender || 'anchor';
      const candidateVoices = getAvailableNaturalVoices(targetGender);
      let selectedVoice: SpeechSynthesisVoice | null = null;

      if (settings.selectedVoiceURI) {
        selectedVoice = candidateVoices.find(v => v.voice.voiceURI === settings.selectedVoiceURI)?.voice || null;
      }
      if (!selectedVoice && candidateVoices.length > 0) {
        selectedVoice = candidateVoices[0].voice;
      }
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      const baseRate = options?.rate ?? settings.rate ?? 0.95;
      const basePitch = options?.pitch ?? (targetGender === 'female' ? 1.02 : (settings.pitch ?? 0.97));
      utterance.rate = Math.max(0.85, Math.min(1.2, baseRate));
      utterance.pitch = Math.max(0.85, Math.min(1.15, basePitch));
      utterance.volume = settings.volume ?? 1.0;

      utterance.onstart = () => options?.onStart?.();
      utterance.onend = () => options?.onEnd?.();
      utterance.onerror = (e) => {
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.warn('Speech synthesis error:', e);
        }
        options?.onError?.(e);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      options?.onError?.(e);
    }
  }

  fallbackBrowserSpeech();
  return {
    stop: () => stopNaturalSpeech()
  };
}

/**
 * Stop active speech immediately (both VoxCPM audio & browser synthesis)
 */
export function stopNaturalSpeech() {
  stopVoxCpmAudio();
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Play a short test broadcast to sample voice quality
 */
export function previewBroadcastVoice(voiceURI: string, onDone?: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  const originalSetting = getStoredVoiceSettings();
  saveStoredVoiceSettings({ selectedVoiceURI: voiceURI });

  speakNaturalSpeech(
    "Pixel Marcus here from MNN. The studio audio feed is locked in, crystal clear, and ready for broadcast.",
    {
      gender: 'anchor',
      onEnd: () => {
        onDone?.();
      },
      onError: () => {
        onDone?.();
      }
    }
  );
}
