import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, ExternalLink, ShieldCheck, Code2, BarChart3, BookOpen, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { VibeKnowledgeProject, VibeStatementBeat } from './types';

interface KineticVideoStageProps {
  project: VibeKnowledgeProject;
  currentBeatIndex: number;
  onBeatChange: (index: number) => void;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  audioUrl?: string;
}

export const KineticVideoStage: React.FC<KineticVideoStageProps> = ({
  project,
  currentBeatIndex,
  onBeatChange,
  audioRef,
  audioUrl
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeFootnoteIndex, setActiveFootnoteIndex] = useState<number | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>(project.aspectRatio || '9:16');
  
  const stageRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);

  const currentBeat: VibeStatementBeat | undefined = project.beats[currentBeatIndex];
  const totalDurationMs = project.beats.reduce((acc, b) => acc + (b.durationMs || 4500), 0);

  // Calculate cumulative start time of each beat
  const beatStartTimes: number[] = [];
  let cum = 0;
  for (const b of project.beats) {
    beatStartTimes.push(cum);
    cum += b.durationMs || 4500;
  }

  // Handle Play/Pause
  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (audioRef?.current) {
        audioRef.current.pause();
      }
    } else {
      if (elapsedMs >= totalDurationMs) {
        setElapsedMs(0);
        onBeatChange(0);
      }
      setIsPlaying(true);
      lastTickTimeRef.current = performance.now();
      if (audioRef?.current && audioUrl) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const tick = (now: number) => {
      const delta = (now - lastTickTimeRef.current) * playbackSpeed;
      lastTickTimeRef.current = now;

      setElapsedMs(prev => {
        const next = prev + delta;
        if (next >= totalDurationMs) {
          setIsPlaying(false);
          return totalDurationMs;
        }

        // Determine current beat based on next elapsed time
        let activeIdx = 0;
        for (let i = beatStartTimes.length - 1; i >= 0; i--) {
          if (next >= beatStartTimes[i]) {
            activeIdx = i;
            break;
          }
        }
        if (activeIdx !== currentBeatIndex) {
          onBeatChange(activeIdx);
        }
        return next;
      });

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    lastTickTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, totalDurationMs, currentBeatIndex, beatStartTimes, onBeatChange]);

  const handleReset = () => {
    setIsPlaying(false);
    setElapsedMs(0);
    onBeatChange(0);
    if (audioRef?.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleSeek = (newMs: number) => {
    setElapsedMs(newMs);
    let activeIdx = 0;
    for (let i = beatStartTimes.length - 1; i >= 0; i--) {
      if (newMs >= beatStartTimes[i]) {
        activeIdx = i;
        break;
      }
    }
    onBeatChange(activeIdx);
    if (audioRef?.current && audioUrl) {
      audioRef.current.currentTime = newMs / 1000;
    }
  };

  const nextBeat = () => {
    if (currentBeatIndex < project.beats.length - 1) {
      const target = currentBeatIndex + 1;
      onBeatChange(target);
      handleSeek(beatStartTimes[target]);
    }
  };

  const prevBeat = () => {
    if (currentBeatIndex > 0) {
      const target = currentBeatIndex - 1;
      onBeatChange(target);
      handleSeek(beatStartTimes[target]);
    }
  };

  // Helper to render words with kinetic highlight matching
  const renderKineticStatement = (statement: string, highlights: string[]) => {
    if (!statement) return null;
    const words = statement.split(' ');
    
    // Normalize highlight words for case-insensitive matching
    const normalizedHighlights = highlights.map(h => h.toLowerCase().trim());

    return (
      <p className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white leading-relaxed md:leading-snug tracking-tight text-wrap-balance">
        {words.map((word, idx) => {
          const cleanWord = word.replace(/[^a-zA-Z0-9%]/g, '').toLowerCase();
          const isHighlighted = normalizedHighlights.some(h => h.includes(cleanWord) && cleanWord.length > 2);
          
          return (
            <span
              key={idx}
              className={`inline-block mr-2 transition-all duration-300 ${
                isHighlighted
                  ? 'text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded-md border border-amber-500/40 shadow-sm shadow-amber-900/40 font-black'
                  : 'text-neutral-100 hover:text-white'
              }`}
            >
              {word}
            </span>
          );
        })}
      </p>
    );
  };

  // Beat label helper
  const getBeatLabel = (type: string) => {
    switch (type) {
      case 'HOOK': return '01 · The Bottleneck';
      case 'MECHANISM': return '02 · Core Mechanism';
      case 'EVIDENCE': return '03 · Empirical Evidence';
      case 'IMPLICATION': return '04 · System Implication';
      case 'TAKEAWAY': return '05 · Key Takeaway';
      default: return 'Knowledge Beat';
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-full">
      {/* Aspect Ratio & Stage Toolbar */}
      <div className="w-full flex items-center justify-between gap-3 mb-3 px-2">
        <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-1">
          <button
            onClick={() => setAspectRatio('9:16')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              aspectRatio === '9:16'
                ? 'bg-red-600 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            9:16 Shorts
          </button>
          <button
            onClick={() => setAspectRatio('16:9')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              aspectRatio === '16:9'
                ? 'bg-red-600 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            16:9 Landscape
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-400 tabular-nums">
            {Math.floor(elapsedMs / 1000)}s / {Math.floor(totalDurationMs / 1000)}s
          </span>
          <button
            onClick={() => setPlaybackSpeed(s => (s === 1 ? 1.25 : s === 1.25 ? 1.5 : 1))}
            className="px-2 py-1 text-xs font-mono bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 rounded transition-colors"
          >
            {playbackSpeed}x
          </button>
        </div>
      </div>

      {/* Video Viewport Frame */}
      <div
        ref={stageRef}
        className={`relative overflow-hidden rounded-2xl bg-neutral-950 border border-neutral-800/80 shadow-2xl transition-all duration-300 flex flex-col justify-between ${
          aspectRatio === '9:16'
            ? 'w-[320px] sm:w-[360px] h-[570px] sm:h-[640px]'
            : 'w-full max-w-[760px] h-[430px]'
        }`}
        style={{
          background: 'radial-gradient(circle at 50% 20%, #171720 0%, #09090b 80%)'
        }}
      >
        {/* Top Header Watermark & Beat Indicator */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-neutral-800/50 bg-neutral-950/40 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-red-600 flex items-center justify-center text-[10px] font-black text-white">
              VK
            </div>
            <span className="text-xs font-bold tracking-tight text-neutral-300 uppercase">
              VIBE KNOWLEDGE
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-[11px] font-mono text-neutral-400 uppercase">
              {currentBeat ? getBeatLabel(currentBeat.type) : 'FRAME'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-950/50 border border-amber-800/50">
              BEAT 0{currentBeatIndex + 1}/0{project.beats.length}
            </span>
          </div>
        </div>

        {/* Center Kinetic Typography Canvas Area */}
        <div className="flex-1 px-5 sm:px-8 py-4 flex flex-col justify-center items-center text-center relative z-10 overflow-y-auto">
          {currentBeat ? (
            <div className="space-y-4 max-w-lg animate-in fade-in zoom-in-95 duration-200">
              {/* Kinetic Statement */}
              {renderKineticStatement(currentBeat.statement, currentBeat.highlightWords)}

              {/* Visual Snippet / Technical Evidence */}
              {currentBeat.visualSnippet && (
                <div className="mt-3 pt-2">
                  {currentBeat.visualSnippet.codeContent && (
                    <div className="bg-neutral-900/90 border border-neutral-700/80 rounded-xl p-3 text-left font-mono text-xs text-neutral-200 shadow-lg">
                      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-neutral-800 text-[10px] text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Code2 className="w-3 h-3 text-red-400" />
                          {currentBeat.visualSnippet.codeLanguage || 'code'}
                        </span>
                        <span>IMMUTABLE EVIDENCE</span>
                      </div>
                      <pre className="overflow-x-auto text-[11px] leading-relaxed text-emerald-300">
                        <code>{currentBeat.visualSnippet.codeContent}</code>
                      </pre>
                    </div>
                  )}

                  {currentBeat.visualSnippet.metricValue && (
                    <div className="inline-flex items-center gap-3 bg-neutral-900/90 border border-amber-500/30 rounded-xl px-4 py-2 text-center shadow-lg">
                      <BarChart3 className="w-5 h-5 text-amber-400 shrink-0" />
                      <div className="text-left">
                        <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                          {currentBeat.visualSnippet.metricLabel || 'Benchmark Impact'}
                        </div>
                        <div className="text-base sm:text-lg font-black text-white font-mono">
                          {currentBeat.visualSnippet.metricValue}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-neutral-500 text-sm">No beats in project</div>
          )}
        </div>

        {/* Bottom Citation Footnote Drawer */}
        <div className="p-4 sm:p-5 border-t border-neutral-800/60 bg-neutral-950/70 backdrop-blur-md z-10">
          {currentBeat && currentBeat.sources && currentBeat.sources.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span className="flex items-center gap-1 font-semibold text-neutral-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  VERIFIED CLAIM CITATION
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded">
                  {currentBeat.sources[0].verificationStatus}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-neutral-200 truncate">
                    {currentBeat.sources[0].title}
                  </span>
                  <a
                    href={currentBeat.sources[0].url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 shrink-0 transition-colors"
                    title="View Original Source Document"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="text-[10px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                  <span>{currentBeat.sources[0].publisher}</span>
                  {currentBeat.sources[0].quoteExcerpt && (
                    <>
                      <span>·</span>
                      <span className="italic truncate">"{currentBeat.sources[0].quoteExcerpt}"</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ambient Grid overlay styling */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
      </div>

      {/* Control Bar */}
      <div className="w-full max-w-[760px] mt-4 p-3 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-3">
        {/* Progress Bar Scrubber with Beat Segment Markers */}
        <div className="relative w-full h-3 bg-neutral-950 rounded-full overflow-hidden cursor-pointer border border-neutral-800 flex"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            handleSeek(clickRatio * totalDurationMs);
          }}
        >
          {project.beats.map((b, idx) => {
            const beatDuration = b.durationMs || 4500;
            const widthPct = (beatDuration / totalDurationMs) * 100;
            const isPassed = elapsedMs >= (beatStartTimes[idx] + beatDuration);
            const isCurrent = currentBeatIndex === idx;

            return (
              <div
                key={b.id}
                style={{ width: `${widthPct}%` }}
                className={`h-full border-r border-neutral-900/80 transition-colors relative ${
                  isPassed
                    ? 'bg-red-600'
                    : isCurrent
                    ? 'bg-red-500/80 animate-pulse'
                    : 'bg-neutral-800'
                }`}
              />
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevBeat}
              disabled={currentBeatIndex === 0}
              className="p-2 text-neutral-400 hover:text-white disabled:opacity-40 rounded-lg hover:bg-neutral-800 transition-colors"
              title="Previous Beat"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlay}
              className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-full transition-transform active:scale-95 shadow-md shadow-red-950/60"
              title={isPlaying ? 'Pause Video' : 'Play Video'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button
              onClick={nextBeat}
              disabled={currentBeatIndex === project.beats.length - 1}
              className="p-2 text-neutral-400 hover:text-white disabled:opacity-40 rounded-lg hover:bg-neutral-800 transition-colors"
              title="Next Beat"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
              title="Reset Video"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Beat Selector Pills */}
          <div className="hidden sm:flex items-center gap-1">
            {project.beats.map((b, idx) => (
              <button
                key={b.id}
                onClick={() => {
                  onBeatChange(idx);
                  handleSeek(beatStartTimes[idx]);
                }}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                  currentBeatIndex === idx
                    ? 'bg-neutral-100 text-neutral-900 font-bold'
                    : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                0{idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
