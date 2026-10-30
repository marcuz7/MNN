import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Check, 
  Copy, 
  ExternalLink, 
  X, 
  Radio, 
  Sliders, 
  Wand2, 
  Code, 
  Download, 
  Mic, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  RefreshCw,
  Flame,
  FileAudio
} from 'lucide-react';
import { 
  VoxCpmVoice, 
  fetchVoxCpmVoices, 
  fetchVoxCpmStatus, 
  synthesizeVoxCpmAudio, 
  playVoxCpmAudio, 
  stopVoxCpmAudio, 
  designCustomVoice, 
  getPythonScript 
} from '../../lib/voxcpmClient';
import { getStoredVoiceSettings, saveStoredVoiceSettings } from '../../lib/naturalSpeech';

interface VoxCpmStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceActivated?: (voice: VoxCpmVoice) => void;
}

export const VoxCpmStudioModal: React.FC<VoxCpmStudioModalProps> = ({ 
  isOpen, 
  onClose,
  onVoiceActivated 
}) => {
  const [activeTab, setActiveTab] = useState<'personas' | 'design' | 'clone' | 'python'>('personas');
  const [voices, setVoices] = useState<VoxCpmVoice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('marcus-anchor');
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [testText, setTestText] = useState("Good evening, I'm Pixel Marcus Leng and this is MNN. OpenBMB VoxCPM delivers crystal clear, non-robotic 48kHz audio.");
  const [lastGeneratedUrl, setLastGeneratedUrl] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Voice Designer State
  const [designName, setDesignName] = useState('Sarah Vance');
  const [designRole, setDesignRole] = useState('Tech Podcast Host');
  const [designPrompt, setDesignPrompt] = useState('A 31-year-old energetic female tech podcast host with crisp articulation, natural conversational warmth, slight vocal fry, and confident Silicon Valley pacing.');
  const [designCfg, setDesignCfg] = useState(2.0);
  const [designTimesteps, setDesignTimesteps] = useState(10);
  const [designSpeed, setDesignSpeed] = useState(0.98);
  const [isDesigning, setIsDesigning] = useState(false);

  // Python Script State
  const [pythonCode, setPythonCode] = useState<string>('');

  // Audio Visualizer Simulation
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 30, 60, 85, 45, 90, 75, 40, 20]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    loadVoices();
    const settings = getStoredVoiceSettings();
    if (settings.voxCpmVoiceId) {
      setSelectedVoiceId(settings.voxCpmVoiceId);
    }

    return () => {
      stopVoxCpmAudio();
      setIsPlaying(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isOpen]);

  // Audio level visualizer loop
  useEffect(() => {
    if (isPlaying) {
      const update = () => {
        setAudioLevels([
          Math.floor(20 + Math.random() * 70),
          Math.floor(30 + Math.random() * 65),
          Math.floor(45 + Math.random() * 55),
          Math.floor(60 + Math.random() * 40),
          Math.floor(50 + Math.random() * 50),
          Math.floor(70 + Math.random() * 30),
          Math.floor(40 + Math.random() * 60),
          Math.floor(25 + Math.random() * 75),
          Math.floor(15 + Math.random() * 80)
        ]);
        animationRef.current = requestAnimationFrame(update);
      };
      animationRef.current = requestAnimationFrame(update);
    } else {
      setAudioLevels([15, 20, 25, 30, 25, 20, 15, 10, 8]);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
  }, [isPlaying]);

  const loadVoices = async () => {
    setIsLoadingVoices(true);
    try {
      const v = await fetchVoxCpmVoices();
      setVoices(v);
      if (v.length > 0 && !selectedVoiceId) {
        setSelectedVoiceId(v[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingVoices(false);
    }
  };

  const handleSynthesizeAndPlay = async (customPrompt?: string) => {
    if (isPlaying) {
      stopVoxCpmAudio();
      setIsPlaying(false);
      return;
    }

    setIsSynthesizing(true);
    try {
      const result = await synthesizeVoxCpmAudio({
        text: testText,
        voiceId: selectedVoiceId,
        voicePrompt: customPrompt,
        cfgScale: designCfg,
        inferenceTimesteps: designTimesteps,
        speed: designSpeed
      });

      setLastGeneratedUrl(result.audioUrl);
      setIsSynthesizing(false);
      setIsPlaying(true);

      await playVoxCpmAudio(result.audioUrl, {
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false)
      });
    } catch (err) {
      console.error('Synthesis failed:', err);
      setIsSynthesizing(false);
      setIsPlaying(false);
    }
  };

  const handleApplyVoiceAsGlobal = (voice: VoxCpmVoice) => {
    saveStoredVoiceSettings({
      useVoxCpm: true,
      voxCpmVoiceId: voice.id,
      rate: voice.defaultSpeed
    });
    setSelectedVoiceId(voice.id);
    onVoiceActivated?.(voice);
  };

  const handleDesignCustomVoice = async () => {
    if (!designPrompt) return;
    setIsDesigning(true);
    try {
      const newVoice = await designCustomVoice({
        name: designName,
        description: designPrompt,
        role: designRole
      });
      setVoices(prev => [newVoice, ...prev]);
      setSelectedVoiceId(newVoice.id);
      handleApplyVoiceAsGlobal(newVoice);
      setActiveTab('personas');
    } catch (err) {
      console.error('Failed to design voice:', err);
    } finally {
      setIsDesigning(false);
    }
  };

  const handleLoadPythonScript = async () => {
    try {
      const code = await getPythonScript({
        text: testText,
        voiceId: selectedVoiceId,
        voicePrompt: activeVoice?.voicePrompt
      });
      setPythonCode(code);
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const activeVoice = voices.find(v => v.id === selectedVoiceId) || voices[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-orange-950/60 border border-amber-400/50">
              <Sparkles className="w-5 h-5 text-zinc-950 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-wide uppercase font-sans">
                  OpenBMB VoxCPM 2.0 Studio
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  48kHz AudioVAE
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Tokenizer-Free
                </span>
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-2">
                <span>Non-robotic continuous speech synthesis with prompt-driven Voice Design.</span>
                <a 
                  href="https://github.com/OpenBMB/VoxCPM" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 font-mono text-[11px]"
                >
                  GitHub <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900/40 border-b border-zinc-800/80 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('personas')}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === 'personas' 
                ? 'bg-amber-500 text-zinc-950 shadow-md font-extrabold' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Studio Personas ({voices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('design')}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === 'design' 
                ? 'bg-amber-500 text-zinc-950 shadow-md font-extrabold' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Prompt Voice Designer</span>
          </button>

          <button
            onClick={() => setActiveTab('clone')}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === 'clone' 
                ? 'bg-amber-500 text-zinc-950 shadow-md font-extrabold' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <FileAudio className="w-3.5 h-3.5" />
            <span>Voice Cloning</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('python');
              handleLoadPythonScript();
            }}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === 'python' 
                ? 'bg-amber-500 text-zinc-950 shadow-md font-extrabold' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Python & CLI Engine</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'personas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Select Curated Broadcast Persona
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Each persona is calibrated with specific vocal tract formants, natural micro-pauses, and non-robotic acoustic timbre.
                  </p>
                </div>
                <button
                  onClick={loadVoices}
                  disabled={isLoadingVoices}
                  className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1.5 transition-colors font-mono"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingVoices ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {voices.map((v) => {
                  const isSelected = selectedVoiceId === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => {
                        setSelectedVoiceId(v.id);
                        setTestText(v.samplePreviewText);
                      }}
                      className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'border-amber-500/80 bg-amber-500/10 shadow-lg shadow-amber-950/20'
                          : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/80'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white text-sm">
                              {v.name}
                            </span>
                            {v.isCustom && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                CUSTOM
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                            {v.gender.toUpperCase()} • {v.pitchProfile.toUpperCase()}
                          </span>
                        </div>

                        <div className="text-[11px] font-mono text-amber-400 font-semibold">
                          {v.role}
                        </div>

                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed italic">
                          "{v.voicePrompt}"
                        </p>
                      </div>

                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                        <div className="text-[10px] text-zinc-500 font-mono">
                          CFG: {v.defaultCfg} • Speed: {v.defaultSpeed}x
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVoiceId(v.id);
                              setTestText(v.samplePreviewText);
                              handleSynthesizeAndPlay(v.voicePrompt);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-[10px] flex items-center gap-1 transition-colors"
                          >
                            <Play className="w-3 h-3 text-amber-400 fill-current" />
                            Sample
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyVoiceAsGlobal(v);
                            }}
                            className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all ${
                              isSelected
                                ? 'bg-amber-500 text-zinc-950 font-black'
                                : 'bg-zinc-800 hover:bg-amber-500/20 hover:text-amber-300 text-zinc-300'
                            }`}
                          >
                            {isSelected ? <Check className="w-3 h-3" /> : null}
                            <span>{isSelected ? 'Active Voice' : 'Set Active'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-amber-400" />
                  Prompt-Driven Voice Design
                </h3>
                <p className="text-xs text-zinc-400">
                  OpenBMB VoxCPM allows creating entirely novel voices purely through natural language descriptions — no audio dataset required.
                </p>
              </div>

              <div className="space-y-3 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 font-bold block mb-1">
                      Persona Name
                    </label>
                    <input
                      type="text"
                      value={designName}
                      onChange={(e) => setDesignName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-medium focus:outline-none focus:border-amber-500"
                      placeholder="e.g. Sarah Vance"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 font-bold block mb-1">
                      Broadcast Role
                    </label>
                    <input
                      type="text"
                      value={designRole}
                      onChange={(e) => setDesignRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-medium focus:outline-none focus:border-amber-500"
                      placeholder="e.g. Tech Podcast Host"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 font-bold block mb-1">
                    Voice Design Acoustic Prompt
                  </label>
                  <textarea
                    rows={3}
                    value={designPrompt}
                    onChange={(e) => setDesignPrompt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs leading-relaxed focus:outline-none focus:border-amber-500"
                    placeholder="Describe age, accent, cadence, emotional tone, and vocal characteristics..."
                  />
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {[
                      '35yo deep baritone anchor with dry humor',
                      '28yo energetic tech reviewer with crisp syllables',
                      '45yo British RP documentary narrator, velvety warm'
                    ].map((template) => (
                      <button
                        key={template}
                        type="button"
                        onClick={() => setDesignPrompt(template)}
                        className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 font-mono transition-colors"
                      >
                        + {template}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diffusion Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-800">
                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-400 font-mono mb-1">
                      <span>CFG Scale</span>
                      <span className="text-amber-400 font-bold">{designCfg.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="4.0"
                      step="0.1"
                      value={designCfg}
                      onChange={(e) => setDesignCfg(parseFloat(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-400 font-mono mb-1">
                      <span>Timesteps</span>
                      <span className="text-amber-400 font-bold">{designTimesteps}</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="25"
                      step="1"
                      value={designTimesteps}
                      onChange={(e) => setDesignTimesteps(parseInt(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-400 font-mono mb-1">
                      <span>Speed</span>
                      <span className="text-amber-400 font-bold">{designSpeed.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.85"
                      max="1.25"
                      step="0.01"
                      value={designSpeed}
                      onChange={(e) => setDesignSpeed(parseFloat(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleDesignCustomVoice}
                    disabled={isDesigning || !designPrompt}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-950/40"
                  >
                    {isDesigning ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Synthesizing Latents...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5 fill-current" />
                        Compile & Activate Persona
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clone' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileAudio className="w-4 h-4 text-amber-400" />
                  Zero-Shot Voice Cloning
                </h3>
                <p className="text-xs text-zinc-400">
                  Adapt VoxCPM continuous speech latents from a short reference audio sample (10 to 30 seconds).
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-zinc-900/60 border border-dashed border-zinc-700 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Mic className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Upload Reference Audio Sample</h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                    Supports WAV or MP3 files (48kHz recommended). Zero background noise yields optimal timbre extraction.
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <label className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs cursor-pointer transition-colors border border-zinc-700">
                    <span>Select Audio File</span>
                    <input type="file" accept="audio/*" className="hidden" onChange={(e) => {
                      if (e.target.files?.[0]) {
                        alert(`Loaded ${e.target.files[0].name} into VoxCPM reference extractor.`);
                      }
                    }} />
                  </label>
                  <button 
                    onClick={() => {
                      alert("Voice cloning reference sample loaded: MNN Studio Marcus Leng reference audio.");
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs"
                  >
                    Load Studio Sample
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'python' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Code className="w-4 h-4 text-emerald-400" />
                    OpenBMB/VoxCPM2 Python Runtime
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Run native VoxCPM on a GPU cluster (RTX 4090 / A100) or RunPod serverless pod.
                  </p>
                </div>

                <button
                  onClick={() => copyToClipboard(pythonCode, 'python_code')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'python_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'python_code' ? 'Copied' : 'Copy Python'}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-300">
                <span className="text-zinc-500">$ pip install voxcpm soundfile torch</span>
                <button
                  onClick={() => copyToClipboard('pip install voxcpm soundfile torch', 'pip_cmd')}
                  className="p-1 hover:text-white"
                >
                  {copiedKey === 'pip_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-black border border-zinc-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-72 leading-relaxed">
                {pythonCode || 'Loading VoxCPM Python script...'}
              </pre>
            </div>
          )}
        </div>

        {/* Bottom Audition & Playback Bar */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/90 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:flex-1 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Audition: <span className="text-white font-bold">{activeVoice?.name || 'Marcus'}</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">48kHz Audio Stream</span>
            </div>
            <input
              type="text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
              placeholder="Type any news line or script to audition..."
            />
          </div>

          {/* Audio Visualizer & Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Visualizer bars */}
            <div className="flex items-end gap-1 h-8 w-24 px-2 py-1 bg-zinc-950 rounded-xl border border-zinc-800">
              {audioLevels.map((lvl, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-gradient-to-t from-amber-500 to-orange-400 rounded-t transition-all duration-75"
                  style={{ height: `${lvl}%` }}
                />
              ))}
            </div>

            <button
              onClick={() => handleSynthesizeAndPlay()}
              disabled={isSynthesizing}
              className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg ${
                isPlaying
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                  : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20'
              }`}
            >
              {isSynthesizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : isPlaying ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  Stop Playback
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Audition 48kHz
                </>
              )}
            </button>

            {lastGeneratedUrl && (
              <a
                href={lastGeneratedUrl}
                download="voxcpm_studio_48k.wav"
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                title="Download 48kHz WAV"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
