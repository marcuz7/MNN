import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  Sparkles, 
  Check, 
  X, 
  Play, 
  Square, 
  Settings2, 
  Radio, 
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { 
  getAvailableNaturalVoices, 
  getStoredVoiceSettings, 
  saveStoredVoiceSettings, 
  previewBroadcastVoice, 
  stopNaturalSpeech,
  VoiceOption,
  SpeechSettings
} from '../lib/naturalSpeech';
import { VoxCpmStudioModal } from '../features/voxcpm/VoxCpmStudioModal';

interface VoiceStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceStudioModal: React.FC<VoiceStudioModalProps> = ({ isOpen, onClose }) => {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [settings, setSettings] = useState<SpeechSettings>(getStoredVoiceSettings());
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isVoxCpmModalOpen, setIsVoxCpmModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const load = () => {
      const v = getAvailableNaturalVoices('anchor');
      setVoices(v);
      const current = getStoredVoiceSettings();
      setSettings(current);
    };

    load();

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = load;
    }

    return () => {
      stopNaturalSpeech();
      setIsPlayingPreview(false);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectVoice = (uri: string) => {
    const updated = saveStoredVoiceSettings({ selectedVoiceURI: uri });
    setSettings(updated);
  };

  const handleRateChange = (rate: number) => {
    const updated = saveStoredVoiceSettings({ rate });
    setSettings(updated);
  };

  const handlePitchChange = (pitch: number) => {
    const updated = saveStoredVoiceSettings({ pitch });
    setSettings(updated);
  };

  const handleToggleWarmth = () => {
    const updated = saveStoredVoiceSettings({ warmthBoost: !settings.warmthBoost });
    setSettings(updated);
  };

  const handleTestPreview = (voiceURI?: string) => {
    if (isPlayingPreview) {
      stopNaturalSpeech();
      setIsPlayingPreview(false);
      return;
    }

    const targetURI = voiceURI || settings.selectedVoiceURI || (voices[0]?.voice.voiceURI ?? '');
    if (!targetURI) return;

    setIsPlayingPreview(true);
    previewBroadcastVoice(targetURI, () => {
      setIsPlayingPreview(false);
    });
  };

  const activeVoice = voices.find(v => v.voice.voiceURI === settings.selectedVoiceURI) || voices[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                STUDIO VOICE CALIBRATION
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Anti-Robotic Neural Engine
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Studio audio filtering eliminates mechanical eSpeak & boosts human broadcast presence.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* OpenBMB VoxCPM 2.0 Studio Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-950/40 to-zinc-900 border border-amber-500/40 shadow-xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-zinc-950 font-black flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Sparkles className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white">
                      OpenBMB VoxCPM 2.0 Studio
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                      ACTIVE • 48kHz
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    Tokenizer-free continuous speech synthesis. Eliminates robotic artifacts with prompt-driven Voice Design.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsVoxCpmModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shrink-0"
              >
                <span>Open VoxCPM Studio</span>
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2">
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-amber-400 font-bold">Persona: {settings.voxCpmVoiceId || 'marcus-anchor'}</span>
                <span>•</span>
                <span>Native Sample Rate: 48,000 Hz</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={settings.useVoxCpm !== false}
                  onChange={(e) => {
                    const updated = saveStoredVoiceSettings({ useVoxCpm: e.target.checked });
                    setSettings(updated);
                  }}
                  className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-white">Enable VoxCPM Studio Voice</span>
              </label>
            </div>
          </div>

          {/* Quick Preview Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-emerald-500/10 border border-amber-500/20 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase text-amber-400 font-semibold mb-1 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Active Anchor Voice
              </div>
              <div className="text-sm font-semibold text-white">
                {settings.useVoxCpm !== false ? `VoxCPM 2.0 (${settings.voxCpmVoiceId || 'marcus-anchor'})` : (activeVoice ? activeVoice.voice.name : 'Searching high-fidelity voices...')}
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">
                {settings.useVoxCpm !== false ? '✨ OpenBMB 48kHz Studio Neural Voice' : (activeVoice?.isNeural ? '✨ Enhanced Neural Voice (HD Natural)' : 'Studio OS Clean Audio')} • Cadence {settings.rate}x • Pitch {settings.pitch}
              </div>
            </div>

            <button
              onClick={() => handleTestPreview(activeVoice?.voice.voiceURI)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg ${
                isPlayingPreview
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                  : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20 font-black'
              }`}
            >
              {isPlayingPreview ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  Stop Sample
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Test Audio Feed
                </>
              )}
            </button>
          </div>

          {/* Prosody Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-zinc-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Broadcast Cadence (Speed)
                </span>
                <span className="font-mono text-amber-400 font-bold">{settings.rate.toFixed(2)}x</span>
              </div>
              <input 
                type="range"
                min="0.85"
                max="1.15"
                step="0.01"
                value={settings.rate}
                onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                <span>0.85x (Deliberate)</span>
                <span className="text-amber-500 font-semibold">0.95x (MNN Standard)</span>
                <span>1.15x (Fast)</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-medium text-zinc-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Anchor Tone & Resonance (Pitch)
                </span>
                <span className="font-mono text-emerald-400 font-bold">{settings.pitch.toFixed(2)}</span>
              </div>
              <input 
                type="range"
                min="0.85"
                max="1.15"
                step="0.01"
                value={settings.pitch}
                onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                <span>0.85 (Deep Baritone)</span>
                <span className="text-emerald-500 font-semibold">0.97 (Warm Anchor)</span>
                <span>1.15 (High Energy)</span>
              </div>
            </div>
          </div>

          {/* Detected Human Voices List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-mono uppercase text-zinc-400 font-bold tracking-wider flex items-center gap-2">
                <span>Verified Natural & Neural Voices ({voices.length})</span>
                <span className="text-[10px] font-normal text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Robotic Synthesizers Filtered
                </span>
              </label>
            </div>

            {voices.length === 0 ? (
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 text-center text-xs text-zinc-400">
                Detecting browser speech engines... Please ensure speech synthesis is allowed.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {voices.map((v) => {
                  const isSelected = (settings.selectedVoiceURI === v.voice.voiceURI) || 
                                     (!settings.selectedVoiceURI && v === voices[0]);

                  return (
                    <div 
                      key={v.voice.voiceURI}
                      onClick={() => handleSelectVoice(v.voice.voiceURI)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                        isSelected 
                          ? 'border-amber-500/60 bg-amber-500/10 text-white' 
                          : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-[10px] ${
                          isSelected ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {isSelected ? <Check className="w-3.5 h-3.5" /> : v.gender === 'male' ? 'M' : v.gender === 'female' ? 'F' : 'N'}
                        </div>
                        <div>
                          <div className="font-semibold text-white flex items-center gap-2">
                            {v.voice.name}
                            {v.isNeural && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                NEURAL HD
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400 font-mono">
                            {v.voice.lang} • {v.voice.localService ? 'Offline / Low Latency' : 'High Bitrate Cloud'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestPreview(v.voice.voiceURI);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-200 font-mono flex items-center gap-1 border border-zinc-700/60 transition-colors"
                      >
                        <Volume2 className="w-3 h-3 text-amber-400" />
                        Sample
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/40">
          <div className="text-[11px] text-zinc-500 flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active filter auto-suppresses mechanical artifacts across all news shows & video reels.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>

      {/* Embedded OpenBMB VoxCPM Studio Modal */}
      <VoxCpmStudioModal
        isOpen={isVoxCpmModalOpen}
        onClose={() => {
          setIsVoxCpmModalOpen(false);
          setSettings(getStoredVoiceSettings());
        }}
        onVoiceActivated={(voice) => {
          setSettings(getStoredVoiceSettings());
        }}
      />
    </div>
  );
};
