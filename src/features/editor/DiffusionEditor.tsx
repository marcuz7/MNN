import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Layers, 
  Volume2, 
  VolumeX, 
  Film, 
  Sparkles, 
  Mic, 
  Briefcase, 
  Download, 
  Share2, 
  Send, 
  Check, 
  Copy, 
  Terminal, 
  Smartphone, 
  Monitor, 
  ExternalLink,
  MessageSquare,
  Wand2,
  Plus
} from 'lucide-react';
import { 
  TimelineTrack, 
  TimelineClip, 
  AspectRatioType, 
  AgencyBatchVariant 
} from './types';
import { createCtaTrigger } from './ctaEngine';
import { AgencyBatchModal, AGENCY_VARIANTS } from './AgencyBatchModal';
import { VoxCpmStudioModal } from '../voxcpm/VoxCpmStudioModal';
import { speakNaturalSpeech, stopNaturalSpeech, getStoredVoiceSettings } from '../../lib/naturalSpeech';

const INITIAL_TRACKS: TimelineTrack[] = [
  {
    id: 'track-visuals',
    name: 'Visuals & B-Roll',
    type: 'video',
    isMuted: false,
    isLocked: false,
    volume: 1.0,
    clips: [
      {
        id: 'clip-v1',
        trackId: 'track-visuals',
        title: 'Hook Cutout + Glow',
        type: 'video',
        startSec: 0,
        endSec: 8,
        durationSec: 8,
        color: '#ef4444',
        data: { text: 'Pixel Marcus Lead Anchor Hook' }
      },
      {
        id: 'clip-v2',
        trackId: 'track-visuals',
        title: 'Terminal Setup Walkthrough',
        type: 'video',
        startSec: 8,
        endSec: 18,
        durationSec: 10,
        color: '#f59e0b',
        data: { text: 'git clone https://github.com/diffusionstudio/editor' }
      },
      {
        id: 'clip-v3',
        trackId: 'track-visuals',
        title: 'WebCodecs Timeline Engine',
        type: 'video',
        startSec: 18,
        endSec: 28,
        durationSec: 10,
        color: '#3b82f6',
        data: { text: 'In-Browser Multi-Track Compositor' }
      }
    ]
  },
  {
    id: 'track-audio',
    name: 'VoxCPM 48kHz Voiceover',
    type: 'audio',
    isMuted: false,
    isLocked: false,
    volume: 1.0,
    clips: [
      {
        id: 'clip-a1',
        trackId: 'track-audio',
        title: 'Marcus Anchor Voice Beat 1',
        type: 'audio',
        startSec: 0,
        endSec: 8,
        durationSec: 8,
        color: '#10b981',
        data: { 
          speaker: 'Pixel Marcus Leng',
          text: 'Most creators spend six hours editing video manually. This open-source repository runs the entire timeline directly in Chrome with WebCodecs.' 
        }
      },
      {
        id: 'clip-a2',
        trackId: 'track-audio',
        title: 'Marcus Anchor Voice Beat 2',
        type: 'audio',
        startSec: 8,
        endSec: 18,
        durationSec: 10,
        color: '#10b981',
        data: { 
          speaker: 'Pixel Marcus Leng',
          text: 'In three commands you have high-performance GPU compositing, canvas layer blending, and automated export.' 
        }
      },
      {
        id: 'clip-a3',
        trackId: 'track-audio',
        title: 'Marcus Outro Beat',
        type: 'audio',
        startSec: 18,
        endSec: 28,
        durationSec: 10,
        color: '#10b981',
        data: { 
          speaker: 'Pixel Marcus Leng',
          text: 'Comment EDITOR below and I will instantly DM you the repository and agency batching scripts straight to your Messenger.' 
        }
      }
    ]
  },
  {
    id: 'track-captions',
    name: 'Kinetic Subtitles',
    type: 'caption',
    isMuted: false,
    isLocked: false,
    volume: 1.0,
    clips: [
      {
        id: 'clip-c1',
        trackId: 'track-captions',
        title: 'Kinetic Words 1',
        type: 'caption',
        startSec: 0,
        endSec: 8,
        durationSec: 8,
        color: '#8b5cf6',
        data: {
          words: [
            { word: 'STOP', start: 0, end: 1.2, isHighlight: true, color: '#f87171' },
            { word: 'WASTING', start: 1.2, end: 2.2 },
            { word: '6 HOURS', start: 2.2, end: 3.8, isHighlight: true, color: '#fbbf24' },
            { word: 'EDITING', start: 3.8, end: 5.0 },
            { word: 'VIDEOS', start: 5.0, end: 8.0, isHighlight: true, color: '#38bdf8' }
          ]
        }
      },
      {
        id: 'clip-c2',
        trackId: 'track-captions',
        title: 'Kinetic Words 2',
        type: 'caption',
        startSec: 8,
        endSec: 18,
        durationSec: 10,
        color: '#8b5cf6',
        data: {
          words: [
            { word: 'WEBCODECS', start: 8, end: 11, isHighlight: true, color: '#34d399' },
            { word: 'IN-BROWSER', start: 11, end: 14 },
            { word: 'TIMELINE', start: 14, end: 18, isHighlight: true, color: '#38bdf8' }
          ]
        }
      }
    ]
  },
  {
    id: 'track-cta',
    name: 'Lead Gen CTA Overlay',
    type: 'overlay',
    isMuted: false,
    isLocked: false,
    volume: 1.0,
    clips: [
      {
        id: 'clip-cta1',
        trackId: 'track-cta',
        title: 'Comment "EDITOR" Trigger Banner',
        type: 'overlay',
        startSec: 18,
        endSec: 28,
        durationSec: 10,
        color: '#ec4899',
        data: {
          ctaKeyword: 'EDITOR',
          ctaPlatform: 'Messenger'
        }
      }
    ]
  }
];

export const DiffusionEditor: React.FC = () => {
  const [tracks, setTracks] = useState<TimelineTrack[]>(INITIAL_TRACKS);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('9:16');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(28);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>('clip-v1');
  const [isAgencyModalOpen, setIsAgencyModalOpen] = useState<boolean>(false);
  const [isVoxCpmModalOpen, setIsVoxCpmModalOpen] = useState<boolean>(false);
  const [isCtaTesting, setIsCtaTesting] = useState<boolean>(false);
  const [simulatedDmResult, setSimulatedDmResult] = useState<any | null>(null);

  // Playhead timer ref
  const playheadIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeAudioClipIndexRef = useRef<number>(-1);

  // Current active audio clip
  const currentAudioClip = tracks.find(t => t.type === 'audio')?.clips.find(
    c => currentTime >= c.startSec && currentTime < c.endSec
  );

  // Current active caption clip
  const currentCaptionClip = tracks.find(t => t.type === 'caption')?.clips.find(
    c => currentTime >= c.startSec && currentTime < c.endSec
  );

  // Active word in current caption
  const activeWord = currentCaptionClip?.data.words?.find(
    w => currentTime >= w.start && currentTime <= w.end
  );

  // Active CTA Overlay
  const isCtaActive = currentTime >= 18;

  useEffect(() => {
    return () => {
      if (playheadIntervalRef.current) clearInterval(playheadIntervalRef.current);
      stopNaturalSpeech();
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (playheadIntervalRef.current) clearInterval(playheadIntervalRef.current);
      stopNaturalSpeech();
    } else {
      setIsPlaying(true);
      let t = currentTime;
      if (t >= totalDuration) {
        t = 0;
        setCurrentTime(0);
      }

      // Speak active clip text with VoxCPM
      if (currentAudioClip?.data.text) {
        speakNaturalSpeech(currentAudioClip.data.text, { voiceId: 'marcus-anchor' });
      }

      playheadIntervalRef.current = setInterval(() => {
        t += 0.2;
        if (t >= totalDuration) {
          t = totalDuration;
          if (playheadIntervalRef.current) clearInterval(playheadIntervalRef.current);
          setIsPlaying(false);
          stopNaturalSpeech();
        }
        setCurrentTime(t);

        // Check if audio clip changed
        const audioTrack = tracks.find(tr => tr.type === 'audio');
        const nextClipIdx = audioTrack?.clips.findIndex(c => t >= c.startSec && t < c.endSec) ?? -1;
        if (nextClipIdx !== -1 && nextClipIdx !== activeAudioClipIndexRef.current) {
          activeAudioClipIndexRef.current = nextClipIdx;
          const nextClip = audioTrack?.clips[nextClipIdx];
          if (nextClip?.data.text) {
            speakNaturalSpeech(nextClip.data.text, { voiceId: 'marcus-anchor' });
          }
        }
      }, 200);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    if (playheadIntervalRef.current) clearInterval(playheadIntervalRef.current);
    setCurrentTime(0);
    activeAudioClipIndexRef.current = -1;
    stopNaturalSpeech();
  };

  const handleTestCtaWebhook = async () => {
    setIsCtaTesting(true);
    const trigger = createCtaTrigger({
      keyword: 'EDITOR',
      platform: 'Messenger',
      repoName: 'diffusionstudio/editor',
      repoUrl: 'https://github.com/diffusionstudio/editor',
      deliverableTitle: 'WebCodecs In-Browser Timeline Engine'
    });

    const res = await trigger.executeSimulatedDm();
    setSimulatedDmResult(res);
    setIsCtaTesting(false);
  };

  const handleLoadAgencyVariant = (variant: AgencyBatchVariant) => {
    setTotalDuration(variant.targetDurationSec);
    setCurrentTime(0);
    // Adjust tracks to variant duration
    setTracks(prev => prev.map(tr => ({
      ...tr,
      clips: tr.clips.map(cl => ({
        ...cl,
        endSec: Math.min(cl.endSec, variant.targetDurationSec),
        durationSec: Math.min(cl.durationSec, variant.targetDurationSec)
      }))
    })));
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Studio Top Control Bar */}
      <div className="px-6 py-3 border-b border-red-500/20 bg-black/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-orange-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-red-950/60 border border-red-400/40">
            <Film className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-white font-sans">
                Diffusion Studio Video Sequencer
              </h1>
              <span className="px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-300 text-[10px] font-mono font-bold border border-blue-500/40">
                WEBCODECS
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/40">
                VOXCPM 48kHz
              </span>
            </div>
            <p className="text-[11px] text-white/50">
              In-browser timeline multi-track sequencer with automated Comment-to-DM CTA automation.
            </p>
          </div>
        </div>

        {/* Aspect Ratio & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Aspect Ratio Switcher */}
          <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/10 text-xs font-mono">
            {(['9:16', '16:9', '1:1'] as AspectRatioType[]).map((ar) => (
              <button
                key={ar}
                onClick={() => setAspectRatio(ar)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  aspectRatio === ar ? 'bg-red-600 text-white shadow' : 'text-white/60 hover:text-white'
                }`}
              >
                {ar}
              </button>
            ))}
          </div>

          {/* VoxCPM Voice Studio Button */}
          <button
            onClick={() => setIsVoxCpmModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Mic className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>VoxCPM Voice</span>
          </button>

          {/* Agency Retainer Batch Button */}
          <button
            onClick={() => setIsAgencyModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-950/40"
          >
            <Briefcase className="w-3.5 h-3.5 fill-current" />
            <span>$3.5k Agency Batch</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body: Canvas Preview + Inspector */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Canvas Stage */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-neutral-900/60 relative overflow-hidden">
          {/* Aspect Ratio Viewport Canvas */}
          <div
            className={`relative rounded-2xl overflow-hidden border-2 border-red-500/40 shadow-2xl bg-black flex flex-col items-center justify-between p-4 transition-all duration-300 ${
              aspectRatio === '9:16'
                ? 'w-[280px] sm:w-[320px] h-[500px] sm:h-[560px]'
                : aspectRatio === '16:9'
                ? 'w-[480px] sm:w-[620px] h-[270px] sm:h-[350px]'
                : 'w-[360px] sm:w-[420px] h-[360px] sm:h-[420px]'
            }`}
          >
            {/* Top Stage Header: Safe zone */}
            <div className="w-full flex items-center justify-between text-[10px] font-mono text-white/50 border-b border-white/10 pb-2 z-20">
              <span className="flex items-center gap-1 text-red-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                CANVAS {aspectRatio}
              </span>
              <span>{currentTime.toFixed(1)}s / {totalDuration}s</span>
            </div>

            {/* Center Stage Mockup: Terminal + Multi-track visual */}
            <div className="relative flex-1 w-full flex flex-col items-center justify-center text-center z-10 space-y-3">
              <div className="w-full max-w-[260px] p-3 rounded-xl bg-neutral-950 border border-white/10 text-left font-mono text-[10px] text-emerald-400 space-y-1 shadow-2xl">
                <div className="flex items-center gap-1.5 text-white/40 pb-1 border-b border-white/10">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[9px] text-white/50 ml-1">diffusionstudio/editor</span>
                </div>
                <p className="text-white">$ git clone https://github.com/diffusionstudio/editor</p>
                <p className="text-amber-300">✓ WebCodecs pipeline mounted on Canvas</p>
                <p className="text-cyan-400">⚡ Audio track: OpenBMB VoxCPM 48kHz</p>
              </div>

              {/* Dynamic Kinetic Typography */}
              {activeWord && (
                <div className="text-2xl sm:text-3xl font-extrabold uppercase font-sans tracking-tight text-white drop-shadow-[0_0_15px_rgba(56,189,248,0.8)] scale-110 transition-all">
                  <span style={{ color: activeWord.color || '#38bdf8' }}>
                    {activeWord.word}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom CTA Overlay Banner (when active) */}
            {isCtaActive && (
              <div className="w-full p-2.5 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white text-center shadow-xl animate-bounce z-20">
                <div className="text-[10px] font-mono font-bold tracking-wider uppercase">
                  ⚡ COMMENT "EDITOR" BELOW
                </div>
                <div className="text-[9px] text-white/90">
                  Direct GitHub Link + 1-Click Setup DM'd Instantly to Messenger!
                </div>
              </div>
            )}
          </div>

          {/* Transport Controls Bar */}
          <div className="mt-4 flex items-center gap-3 p-2 rounded-2xl bg-neutral-900 border border-white/10 shadow-xl">
            <button
              onClick={togglePlay}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase flex items-center gap-1.5 shadow-md shadow-red-950/60"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play Timeline'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono text-white/60 px-2">
              {currentTime.toFixed(1)}s / {totalDuration}s
            </span>
          </div>
        </div>

        {/* Inspector Sidebar: CTA Trigger Testing & Clip Data */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/10 bg-neutral-950 p-4 space-y-4 overflow-y-auto">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-pink-400" />
              Functional CTA Generator
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Automated Messenger / Instagram DM webhook rules triggered when viewers comment.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900 border border-white/10 space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-mono text-white/40 block">TRIGGER KEYWORD</span>
              <span className="font-mono font-black text-amber-400 text-sm">EDITOR</span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-white/40 block">TARGET REPOSITORY</span>
              <span className="text-white font-semibold">diffusionstudio/editor</span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-white/40 block">DELIVERABLE</span>
              <span className="text-zinc-300">WebCodecs In-Browser Multi-Track Editor</span>
            </div>

            <button
              onClick={handleTestCtaWebhook}
              disabled={isCtaTesting}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-blue-950/60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isCtaTesting ? 'Sending Webhook...' : 'Test Simulated DM'}</span>
            </button>

            {simulatedDmResult && (
              <div className="p-2.5 rounded-xl bg-black/80 border border-emerald-500/40 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-emerald-400 font-bold font-mono">
                  <span>✓ Delivered at {simulatedDmResult.deliveredAt}</span>
                </div>
                <p className="text-zinc-300 font-sans leading-relaxed">
                  "{simulatedDmResult.messagePreview}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Timeline Multi-Track Sequencer */}
      <div className="h-56 bg-neutral-950 border-t border-white/10 p-3 flex flex-col shrink-0">
        <div className="flex items-center justify-between text-[11px] font-mono text-white/40 mb-2 px-2">
          <span>SEQUENCER (4 TRACKS)</span>
          <div className="flex items-center gap-4">
            <span>Playhead: {currentTime.toFixed(2)}s</span>
            <span>Scale: 100%</span>
          </div>
        </div>

        {/* Tracks Sequencer Container */}
        <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
          {tracks.map((track) => (
            <div key={track.id} className="flex items-center gap-2 h-9 bg-neutral-900/80 rounded-xl px-2 border border-white/5">
              {/* Track Header */}
              <div className="w-36 flex items-center justify-between text-xs font-mono text-white/70 shrink-0">
                <span className="truncate font-semibold">{track.name}</span>
              </div>

              {/* Track Timeline Area */}
              <div className="flex-1 h-6 bg-black/40 rounded-lg relative overflow-hidden flex items-center">
                {/* Clips */}
                {track.clips.map((clip) => {
                  const leftPercent = (clip.startSec / totalDuration) * 100;
                  const widthPercent = (clip.durationSec / totalDuration) * 100;

                  return (
                    <div
                      key={clip.id}
                      onClick={() => setSelectedClipId(clip.id)}
                      className="absolute h-5 rounded-md px-2 text-[10px] font-mono text-white flex items-center justify-between truncate cursor-pointer transition-all hover:brightness-110 shadow"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                        backgroundColor: clip.color
                      }}
                    >
                      <span className="truncate">{clip.title}</span>
                      <span className="text-[9px] opacity-75">{clip.durationSec}s</span>
                    </div>
                  );
                })}

                {/* Scrubber Playhead Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none"
                  style={{ left: `${(currentTime / totalDuration) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AgencyBatchModal
        isOpen={isAgencyModalOpen}
        onClose={() => setIsAgencyModalOpen(false)}
        onLoadVariant={handleLoadAgencyVariant}
      />

      <VoxCpmStudioModal
        isOpen={isVoxCpmModalOpen}
        onClose={() => setIsVoxCpmModalOpen(false)}
      />
    </div>
  );
};
