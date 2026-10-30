import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, Pause, RefreshCw, Sparkles, Video, Share2, Copy, Check,
  Download, Film, Smartphone, Monitor, Layers, Volume2, VolumeX,
  ExternalLink, Zap, Flame, User, MessageSquare
} from 'lucide-react';

interface ViralClipPreset {
  id: string;
  title: string;
  source: string;
  platform: 'X.com' | 'TikTok' | 'GitHub' | 'YouTube';
  videoPreviewUrl: string;
  durationSeconds: number;
  hypitDslHook: string;
  reactions: Array<{
    timeSec: number;
    expression: 'shock' | 'laugh' | 'skeptical' | 'hype' | 'deadpan';
    commentary: string;
    captionWords: Array<{ word: string; start: number; end: number }>;
  }>;
}

const VIRAL_PRESETS: ViralClipPreset[] = [
  {
    id: 'sora-physics-viral',
    title: 'OpenAI Sora Ultra-Fluid Water Simulation',
    source: 'Viral X.com / 2.8M views',
    platform: 'X.com',
    videoPreviewUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    durationSeconds: 14,
    hypitDslHook: '00:00-00:03: High-speed water splash | 00:04-00:09: Light refraction zoom | 00:10-00:14: Physics anomaly',
    reactions: [
      {
        timeSec: 1,
        expression: 'shock',
        commentary: 'Hold on! Look at the surface tension on that fluid simulation!',
        captionWords: [
          { word: 'Hold', start: 1.0, end: 1.3 },
          { word: 'on!', start: 1.3, end: 1.6 },
          { word: 'Look', start: 1.6, end: 1.9 },
          { word: 'at', start: 1.9, end: 2.1 },
          { word: 'the', start: 2.1, end: 2.3 },
          { word: 'surface', start: 2.3, end: 2.7 },
          { word: 'tension!', start: 2.7, end: 3.2 }
        ]
      },
      {
        timeSec: 5,
        expression: 'hype',
        commentary: 'Zero polygon tearing. Hypit DSL cloned the keyframe pacing in 3 seconds flat.',
        captionWords: [
          { word: 'Zero', start: 5.0, end: 5.4 },
          { word: 'polygon', start: 5.4, end: 5.8 },
          { word: 'tearing.', start: 5.8, end: 6.3 },
          { word: 'Hypit', start: 6.3, end: 6.7 },
          { word: 'DSL', start: 6.7, end: 7.1 },
          { word: 'cloned', start: 7.1, end: 7.5 },
          { word: 'the', start: 7.5, end: 7.7 },
          { word: 'keyframes!', start: 7.7, end: 8.3 }
        ]
      },
      {
        timeSec: 10,
        expression: 'deadpan',
        commentary: 'My GPU fan just spun up just watching this preview render.',
        captionWords: [
          { word: 'My', start: 10.0, end: 10.3 },
          { word: 'GPU', start: 10.3, end: 10.7 },
          { word: 'fan', start: 10.7, end: 11.0 },
          { word: 'just', start: 11.0, end: 11.3 },
          { word: 'spun', start: 11.3, end: 11.6 },
          { word: 'up!', start: 11.6, end: 12.2 }
        ]
      }
    ]
  },
  {
    id: 'figure-robot-dexterity',
    title: 'Figure 02 Humanoid Delicate Egg Handling Stunt',
    source: 'Trending X.com / 4.1M views',
    platform: 'X.com',
    videoPreviewUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
    durationSeconds: 16,
    hypitDslHook: '00:00-00:04: Grip approach | 00:05-00:10: Delicate tactile squeeze | 00:11-00:16: Pan to engineer smile',
    reactions: [
      {
        timeSec: 1,
        expression: 'skeptical',
        commentary: 'If this robot cracks that egg, breakfast is on the research lab.',
        captionWords: [
          { word: 'If', start: 1.0, end: 1.2 },
          { word: 'this', start: 1.2, end: 1.5 },
          { word: 'robot', start: 1.5, end: 1.9 },
          { word: 'cracks', start: 1.9, end: 2.3 },
          { word: 'that', start: 2.3, end: 2.6 },
          { word: 'egg...', start: 2.6, end: 3.1 }
        ]
      },
      {
        timeSec: 6,
        expression: 'shock',
        commentary: 'Wait, look at the tactile feedback sensors! Perfect 0.2 Newton grip.',
        captionWords: [
          { word: 'Wait,', start: 6.0, end: 6.4 },
          { word: 'look', start: 6.4, end: 6.7 },
          { word: 'at', start: 6.7, end: 6.9 },
          { word: 'the', start: 6.9, end: 7.1 },
          { word: 'tactile', start: 7.1, end: 7.6 },
          { word: 'sensors!', start: 7.6, end: 8.2 }
        ]
      },
      {
        timeSec: 12,
        expression: 'hype',
        commentary: 'Marcus Leng approved. Now teach it to brew 16-bit retro espresso.',
        captionWords: [
          { word: 'Marcus', start: 12.0, end: 12.4 },
          { word: 'Leng', start: 12.4, end: 12.8 },
          { word: 'approved!', start: 12.8, end: 13.5 }
        ]
      }
    ]
  },
  {
    id: 'claude-60s-app',
    title: 'Autonomous Coding Agent Builds & Deploys App in 60s',
    source: 'GitHub & Viral X.com / 1.5M views',
    platform: 'GitHub',
    videoPreviewUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    durationSeconds: 15,
    hypitDslHook: '00:00-00:03: Terminal prompt | 00:04-00:09: Fast-forward code generation | 00:10-00:15: Live browser preview',
    reactions: [
      {
        timeSec: 1,
        expression: 'hype',
        commentary: '60 seconds? I take 60 seconds just choosing a variable name!',
        captionWords: [
          { word: '60', start: 1.0, end: 1.3 },
          { word: 'seconds?', start: 1.3, end: 1.8 },
          { word: 'I', start: 1.8, end: 2.0 },
          { word: 'take', start: 2.0, end: 2.3 },
          { word: '60s', start: 2.3, end: 2.7 },
          { word: 'just', start: 2.7, end: 3.0 },
          { word: 'naming', start: 3.0, end: 3.4 },
          { word: 'variables!', start: 3.4, end: 4.0 }
        ]
      },
      {
        timeSec: 7,
        expression: 'shock',
        commentary: 'Look at the Vite compilation speed. It fixed its own TypeScript error live!',
        captionWords: [
          { word: 'It', start: 7.0, end: 7.2 },
          { word: 'fixed', start: 7.2, end: 7.6 },
          { word: 'its', start: 7.6, end: 7.8 },
          { word: 'own', start: 7.8, end: 8.1 },
          { word: 'TypeScript', start: 8.1, end: 8.6 },
          { word: 'error', start: 8.6, end: 9.0 },
          { word: 'live!', start: 9.0, end: 9.6 }
        ]
      },
      {
        timeSec: 12,
        expression: 'laugh',
        commentary: 'Senior engineers are officially sweating in 16-bit.',
        captionWords: [
          { word: 'Senior', start: 12.0, end: 12.4 },
          { word: 'engineers', start: 12.4, end: 12.9 },
          { word: 'are', start: 12.9, end: 13.1 },
          { word: 'sweating!', start: 13.1, end: 13.8 }
        ]
      }
    ]
  }
];

interface ReactionStudioProps {
  avatarUrl: string;
  onNavigate: (view: 'home' | 'player' | 'radar' | 'feeds' | 'review' | 'youtube') => void;
}

export function ReactionStudio({ avatarUrl, onNavigate }: ReactionStudioProps) {
  const [selectedPreset, setSelectedPreset] = useState<ViralClipPreset>(VIRAL_PRESETS[0]);
  const [layoutMode, setLayoutMode] = useState<'vertical_9_16' | 'split_16_9' | 'pip'>('vertical_9_16');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // Playback timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(t => {
          if (t >= selectedPreset.durationSeconds) {
            setIsPlaying(false);
            return 0;
          }
          return Number((t + 0.1).toFixed(1));
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedPreset]);

  // Current active reaction
  const activeReaction = [...selectedPreset.reactions]
    .reverse()
    .find(r => currentTime >= r.timeSec) || selectedPreset.reactions[0];

  // Active word highlight
  const activeWord = activeReaction.captionWords.find(
    w => currentTime >= w.start && currentTime <= w.end
  );

  const hypitDslJson = {
    schemaVersion: "hypit-dsl-v1.2",
    clipId: selectedPreset.id,
    sourceViralUrl: selectedPreset.source,
    durationMs: selectedPreset.durationSeconds * 1000,
    aspectRatio: layoutMode === 'vertical_9_16' ? "9:16" : "16:9",
    avatarHost: "Marcus Leng (MNN Lead Anchor)",
    wordAnchoredTimeline: selectedPreset.reactions.flatMap(r => r.captionWords.map(w => ({
      word: w.word,
      startMs: Math.round(w.start * 1000),
      endMs: Math.round(w.end * 1000),
      expression: r.expression
    }))),
    hookDirectives: selectedPreset.hypitDslHook
  };

  const copyHypitDsl = () => {
    navigator.clipboard.writeText(JSON.stringify(hypitDslJson, null, 2));
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  };

  const handleExportReactionShort = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 3000);
    }, 1800);
  };

  return (
    <div className="w-full h-full overflow-y-auto px-4 py-6 md:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-neutral-900/90 border border-red-500/30 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-red-950/60 shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-tight">
                Pseudo Reaction Studio &bull; Hypit DSL
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-red-600/30 border border-red-500/40 text-red-300 text-[10px] font-mono font-bold uppercase">
                9:16 Viral Shorts &bull; Avatar Sync
              </span>
            </div>
            <p className="text-xs text-white/50 font-medium">
              Replicate viral video pacing with hypit-ai/hypit DSL, then use your Pixel Marcus avatar to deliver synchronized commentary &amp; roasts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={copyHypitDsl}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Copy Hypit DSL Timeline JSON"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'DSL Copied!' : 'Copy Hypit DSL'}</span>
          </button>

          <button
            onClick={handleExportReactionShort}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-950/60 active:scale-95 transition-all"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Rendering Short...</span>
              </>
            ) : exportComplete ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-200" />
                <span>Short Ready!</span>
              </>
            ) : (
              <>
                <Film className="w-3.5 h-3.5" />
                <span>Export 9:16 Short</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Viral Presets & DSL Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Preset Selector */}
          <div className="p-4 rounded-3xl bg-neutral-900/60 border border-white/10 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Select Viral Source Video</span>
            </h3>

            <div className="space-y-2">
              {VIRAL_PRESETS.map(preset => {
                const isSelected = selectedPreset.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedPreset(preset);
                      setCurrentTime(0);
                      setIsPlaying(false);
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-red-950/40 border-red-500/60 shadow-md ring-1 ring-red-500/40'
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-amber-300 font-bold uppercase">
                          {preset.platform}
                        </span>
                        <span className="text-[10px] text-white/40">{preset.source}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white/90 truncate mt-1">
                        {preset.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-white/40 shrink-0">
                      {preset.durationSeconds}s
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hypit DSL Timeline Inspector */}
          <div className="p-4 rounded-3xl bg-neutral-900/60 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                <CodeIcon className="w-3.5 h-3.5 text-red-400" />
                <span>Hypit Word-Anchored Video DSL</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">WHISPER-X SYNC</span>
            </div>

            <div className="bg-black/60 p-3 rounded-xl border border-white/5 font-mono text-[11px] space-y-2 max-h-48 overflow-y-auto">
              <div className="text-amber-400 font-semibold">{selectedPreset.hypitDslHook}</div>
              <div className="space-y-1 pt-1 border-t border-white/5">
                {selectedPreset.reactions.map((r, i) => (
                  <div key={i} className="text-white/60">
                    <span className="text-red-400 font-bold">[{r.timeSec}s]</span>{' '}
                    <span className="text-cyan-300 uppercase text-[9px] font-bold">({r.expression})</span>:{' '}
                    <span>{r.commentary}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Reaction Video Player Stage (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Layout Controls Bar */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-900/60 border border-white/10">
            <span className="text-xs font-bold text-white/60">Stage Layout:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setLayoutMode('vertical_9_16')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  layoutMode === 'vertical_9_16'
                    ? 'bg-red-600 text-white font-black shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-white/70'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>9:16 Shorts</span>
              </button>
              <button
                onClick={() => setLayoutMode('split_16_9')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  layoutMode === 'split_16_9'
                    ? 'bg-red-600 text-white font-black shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-white/70'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>16:9 Split</span>
              </button>
              <button
                onClick={() => setLayoutMode('pip')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  layoutMode === 'pip'
                    ? 'bg-red-600 text-white font-black shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-white/70'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>PiP Corner</span>
              </button>
            </div>
          </div>

          {/* Interactive Player Canvas */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-red-500/40 bg-neutral-950 shadow-2xl flex flex-col items-center justify-center min-h-[440px]">
            {/* Top HUD */}
            <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between text-[10px] font-mono pointer-events-none">
              <div className="bg-red-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-red-500/50 text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold">MNN REACTION LIVE</span>
              </div>
              <div className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-amber-300">
                {currentTime.toFixed(1)}s / {selectedPreset.durationSeconds}s
              </div>
            </div>

            {/* Layout rendering */}
            {layoutMode === 'vertical_9_16' ? (
              // 9:16 Vertical Shorts Style (Viral Video on Top, Avatar on Bottom)
              <div className="w-[280px] sm:w-[320px] aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-white/15 shadow-2xl flex flex-col relative my-4">
                {/* Top Half: Viral Video */}
                <div className="h-1/2 relative overflow-hidden bg-neutral-900 border-b border-red-500/30">
                  <img
                    src={selectedPreset.videoPreviewUrl}
                    alt="Viral Video"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/75 px-2 py-0.5 rounded text-[9px] font-mono text-white/90">
                    VIRAL SOURCE &bull; {selectedPreset.platform}
                  </div>
                </div>

                {/* Bottom Half: Avatar Reaction Desk */}
                <div className="h-1/2 relative overflow-hidden bg-gradient-to-t from-black via-neutral-950 to-neutral-900 flex flex-col items-center justify-center p-3">
                  <div className="relative flex items-center justify-center mb-2">
                    {isPlaying && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.9, 0.4] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="absolute -inset-2 rounded-full bg-red-500/30 border border-red-500/60"
                      />
                    )}
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-500 shadow-xl bg-neutral-950">
                      <img
                        src={avatarUrl}
                        alt="Marcus Reaction Avatar"
                        className="w-full h-full object-cover"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>
                  </div>

                  {/* Reaction Tag */}
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-red-600/30 border border-red-500/40 text-red-300">
                    {activeReaction.expression} MODE
                  </span>

                  {/* Karaoke Word-Anchored Captions */}
                  <div className="mt-2 text-center px-2">
                    <p className="text-xs font-black tracking-tight leading-snug drop-shadow-md">
                      {activeReaction.captionWords.map((cw, idx) => {
                        const isCurrent = activeWord?.word === cw.word;
                        return (
                          <span
                            key={idx}
                            className={`inline-block mr-1 transition-colors ${
                              isCurrent
                                ? 'text-amber-300 scale-110 font-black underline decoration-red-500'
                                : 'text-white/80'
                            }`}
                          >
                            {cw.word}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ) : layoutMode === 'split_16_9' ? (
              // 16:9 Split Screen (Viral Left, Avatar Right)
              <div className="w-full h-full flex flex-col sm:flex-row items-center p-4 gap-4">
                <div className="flex-1 w-full h-56 sm:h-72 rounded-2xl overflow-hidden relative border border-white/10">
                  <img src={selectedPreset.videoPreviewUrl} alt="Viral" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-white">
                    VIRAL CLIP ({selectedPreset.platform})
                  </div>
                </div>
                <div className="w-full sm:w-64 h-56 sm:h-72 rounded-2xl bg-neutral-900/90 border border-red-500/30 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-red-500 mb-2">
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
                  </div>
                  <span className="text-[10px] font-mono text-red-400 font-bold uppercase">{activeReaction.expression}</span>
                  <p className="text-xs font-bold text-yellow-300 mt-2 font-mono leading-tight">
                    "{activeReaction.commentary}"
                  </p>
                </div>
              </div>
            ) : (
              // PiP (Picture in Picture)
              <div className="w-full h-80 relative overflow-hidden">
                <img src={selectedPreset.videoPreviewUrl} alt="Viral" className="w-full h-full object-cover" />
                <div className="absolute bottom-4 right-4 w-28 h-28 rounded-2xl overflow-hidden border-2 border-red-500 shadow-2xl bg-black/90 p-1 flex flex-col items-center justify-center">
                  <img src={avatarUrl} alt="Avatar" className="w-14 h-14 rounded-full object-cover border border-red-400" style={{ imageRendering: 'pixelated' }} />
                  <span className="text-[9px] font-mono text-red-300 font-bold uppercase mt-1">{activeReaction.expression}</span>
                </div>
                <div className="absolute bottom-4 left-4 max-w-sm bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-red-500/40">
                  <p className="text-yellow-300 text-xs font-mono font-bold leading-tight">"{activeReaction.commentary}"</p>
                </div>
              </div>
            )}

            {/* Bottom Scrubber & Transport Bar */}
            <div className="w-full bg-neutral-950/90 border-t border-white/10 p-4 flex items-center justify-between gap-4 z-30">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center cursor-pointer shadow-md transition-all active:scale-95 shrink-0"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
              </button>

              <div className="flex-1 flex items-center gap-3">
                <span className="text-[10px] font-mono text-white/50 w-8">{currentTime.toFixed(0)}s</span>
                <input
                  type="range"
                  min="0"
                  max={selectedPreset.durationSeconds}
                  step="0.1"
                  value={currentTime}
                  onChange={(e) => {
                    setCurrentTime(Number(e.target.value));
                    setIsPlaying(false);
                  }}
                  className="w-full cursor-pointer accent-red-500"
                />
                <span className="text-[10px] font-mono text-white/50 w-8">{selectedPreset.durationSeconds}s</span>
              </div>

              <button
                onClick={() => onNavigate('home')}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-bold cursor-pointer transition-all border border-white/5 shrink-0"
              >
                Topic Gen &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
