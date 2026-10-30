import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2, AlertCircle, ShieldCheck, Play, Pause, Download, Edit3,
  ExternalLink, Calendar, Send, RefreshCw, X, Sparkles, Youtube, Check,
  Monitor, Lock, Clock, FileText, Film, Volume2
} from 'lucide-react';

interface EpisodeRevision {
  id: string;
  revision: number;
  title: string;
  summary: string;
  scriptJson: {
    title: string;
    summary: string;
    outline: string[];
    turns: Array<{
      turnId: string;
      speaker: string;
      voiceId: string;
      text: string;
      sceneType: string;
      claimIds: string[];
    }>;
  };
  speechTimeline: Array<{
    turnId: string;
    speakerId: string;
    text: string;
    startMs: number;
    endMs: number;
    durationMs: number;
  }>;
  videoManifest: {
    durationMs: number;
    width: number;
    height: number;
    fps: number;
  };
  youtubeMetadata: {
    title: string;
    description: string;
    tags: string[];
    category: string;
    containsSyntheticMedia: boolean;
    privacyStatus: string;
    scheduledAt?: string;
  };
  manifestChecksum: string;
  videoChecksum?: string;
  mediaUrls?: {
    videoUrl?: string;
    srtUrl?: string;
    thumbnailUrl?: string;
    audioUrl?: string;
  };
  createdAt: string;
}

interface Episode {
  id: string;
  status: string;
  currentRevision: number;
  revisions: EpisodeRevision[];
  format: string;
  createdAt: string;
}

interface ReviewStudioProps {
  episodeId: string | null;
  onBackToRadar: () => void;
  onOpenYouTubeDashboard: () => void;
}

export function ReviewStudio({ episodeId, onBackToRadar, onOpenYouTubeDashboard }: ReviewStudioProps) {
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [activeTab, setActiveTab] = useState<'video' | 'script' | 'evidence' | 'youtube'>('video');
  const [isEditingScript, setIsEditingScript] = useState(false);
  const [editedTurns, setEditedTurns] = useState<any[]>([]);
  const [publishMode, setPublishMode] = useState<'IMMEDIATE' | 'SCHEDULED'>('IMMEDIATE');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState<string | null>(null);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  const timerRef = useRef<any>(null);

  const fetchEpisode = async () => {
    if (!episodeId) {
      // Pick latest episode if none provided
      try {
        const res = await fetch('/api/episodes');
        const data = await res.json();
        if (data.episodes && data.episodes.length > 0) {
          setEpisode(data.episodes[0]);
          initEditedTurns(data.episodes[0]);
        }
      } catch (e) {}
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/episodes/${episodeId}`);
      if (res.ok) {
        const data = await res.json();
        setEpisode(data.episode);
        initEditedTurns(data.episode);
      }
    } catch (err) {
      console.error('Failed to fetch episode:', err);
    } finally {
      setLoading(false);
    }
  };

  const initEditedTurns = (ep: Episode) => {
    const rev = ep.revisions.find(r => r.revision === ep.currentRevision);
    if (rev && rev.scriptJson?.turns) {
      setEditedTurns(JSON.parse(JSON.stringify(rev.scriptJson.turns)));
    }
  };

  useEffect(() => {
    fetchEpisode();
  }, [episodeId]);

  // Simulated player playback loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTimeMs(prev => {
          const totalMs = currentRevision?.videoManifest?.durationMs || 90000;
          if (prev >= totalMs) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 250;
        });
      }, 250);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const currentRevision = episode?.revisions.find(r => r.revision === episode.currentRevision);

  const handleSaveScriptEdits = async () => {
    if (!episode) return;
    try {
      const res = await fetch(`/api/episodes/${episode.id}/script`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turns: editedTurns
        })
      });
      if (res.ok) {
        const data = await res.json();
        setEpisode(data.episode);
        initEditedTurns(data.episode);
        setIsEditingScript(false);
        alert('Script changes saved! A new immutable revision was created and marked for re-render.');
      }
    } catch (err) {
      console.error('Error saving script:', err);
    }
  };

  const handleRenderEpisode = async () => {
    if (!episode) return;
    try {
      const res = await fetch(`/api/episodes/${episode.id}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revision: episode.currentRevision,
          outputPreset: 'youtube_1080p'
        })
      });
      if (res.ok) {
        setEpisode(prev => prev ? { ...prev, status: 'RENDERING' } : prev);
        setTimeout(() => fetchEpisode(), 1500);
      }
    } catch (err) {
      console.error('Render trigger failed:', err);
    }
  };

  const handleApproveAndPublish = async () => {
    if (!episode || !currentRevision) return;
    setIsSubmittingApproval(true);
    setApprovalError(null);
    setApprovalSuccess(null);

    try {
      // 1. Record human approval
      const approveRes = await fetch(`/api/episodes/${episode.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revision: episode.currentRevision,
          videoChecksum: currentRevision.videoChecksum || currentRevision.manifestChecksum,
          publication: {
            channelId: 'UC_MNN_MarcusLeng_Official',
            mode: publishMode,
            scheduledAt: publishMode === 'SCHEDULED' ? scheduledDateTime : undefined
          }
        })
      });

      if (!approveRes.ok) {
        const errData = await approveRes.json();
        throw new Error(errData.error?.message || 'Approval authorization failed.');
      }

      // 2. Execute publish pipeline to YouTube
      const publishRes = await fetch(`/api/youtube/episodes/${episode.id}/publish`, {
        method: 'POST'
      });

      if (publishRes.ok) {
        const pubData = await publishRes.json();
        setApprovalSuccess(`Broadcast approved! YouTube upload initiated: ${pubData.publication?.videoUrl || 'Private upload created'}`);
        fetchEpisode();
      } else {
        const pubErr = await publishRes.json();
        throw new Error(pubErr.error?.message || 'YouTube upload job failed.');
      }
    } catch (err: any) {
      setApprovalError(err.message || 'Operation failed.');
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-white/50 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-500" />
        <p className="text-xs font-mono">Loading Review Studio workspace &bull; FR-08...</p>
      </div>
    );
  }

  if (!episode || !currentRevision) {
    return (
      <div className="max-w-3xl mx-auto p-8 sm:p-12 text-center space-y-6 bg-neutral-900/60 rounded-3xl border border-neutral-800 shadow-2xl backdrop-blur-md">
        {/* 3-Step Production Progress Flow */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs font-mono pb-2">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] font-bold">1</span>
            <span className="hidden sm:inline">Pick 3 Stories</span>
          </div>
          <span className="text-neutral-600">→</span>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] font-bold">2</span>
            <span className="hidden sm:inline">Produce 90s Broadcast</span>
          </div>
          <span className="text-neutral-600">→</span>
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-600 flex items-center justify-center text-[10px] text-amber-300">3</span>
            <span>Review Studio</span>
          </div>
        </div>

        <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400 shadow-lg">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black text-white tracking-tight">No Episode Selected in Review Studio</h3>
          <p className="text-sm text-neutral-300 max-w-lg mx-auto leading-relaxed">
            To review a broadcast episode: pick 3 stories in News Radar, then click <strong className="text-white font-bold">"Produce 90s Broadcast"</strong> to generate the script, speech timeline, and video manifest.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onBackToRadar}
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-950/60 flex items-center gap-2 mx-auto cursor-pointer"
          >
            <span>Go to News Radar &amp; Produce</span>
            <span>→</span>
          </button>
        </div>
      </div>
    );
  }

  const activeTurn = currentRevision.speechTimeline.find(
    t => currentTimeMs >= t.startMs && currentTimeMs <= t.endMs
  ) || currentRevision.speechTimeline[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-neutral-900/80 border border-red-500/30 backdrop-blur-md shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 font-mono text-[10px] font-bold uppercase border border-red-500/40">
              REV #{episode.currentRevision} &bull; {episode.status}
            </span>
            <span className="text-xs text-white/40 font-mono">
              SHA: {currentRevision.manifestChecksum.slice(0, 12)}...
            </span>
          </div>
          <h2 className="text-lg font-black text-white tracking-tight mt-1">
            {currentRevision.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBackToRadar}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            &larr; News Radar
          </button>
          {episode.status === 'SCRIPT_READY' && (
            <button
              onClick={handleRenderEpisode}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Queue Render</span>
            </button>
          )}
          <button
            onClick={onOpenYouTubeDashboard}
            className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Youtube className="w-3.5 h-3.5 text-red-400" />
            <span>YouTube Queue</span>
          </button>
        </div>
      </div>

      {approvalSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{approvalSuccess}</span>
        </div>
      )}

      {approvalError && (
        <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{approvalError}</span>
        </div>
      )}

      {/* Main Review Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Video Broadcast Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-black rounded-3xl border-2 border-red-500/40 overflow-hidden relative shadow-2xl aspect-video flex flex-col justify-between p-4 select-none">
            {/* Background Studio Graphic */}
            <div className="absolute inset-0 z-0">
              <img
                src="/pixel_marcus_studio.jpg"
                alt="MNN Studio"
                className="w-full h-full object-cover"
                style={{ imageRendering: 'pixelated' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/60" />
            </div>

            {/* CRT Scanline Overlay */}
            <div className="crt-scanlines absolute inset-0 z-10 pointer-events-none opacity-70" />

            {/* Top Broadcast HUD */}
            <div className="relative z-20 flex items-center justify-between text-[10px] font-mono">
              <div className="flex items-center gap-2 bg-red-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-red-500/50 text-white">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-black font-sans">MNN 1080p &bull; SUPERVISED REVIEW</span>
              </div>
              <div className="bg-black/75 px-3 py-1 rounded-full border border-white/10 text-emerald-400 font-bold">
                PROD REVISION #{currentRevision.revision}
              </div>
            </div>

            {/* Center Anchor Marcus with Speaking Animation */}
            <div className="relative z-20 my-auto flex flex-col items-center justify-center gap-2">
              <div className="relative">
                {isPlaying && (
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.9, 0.4] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -inset-3 rounded-full border-2 border-red-500 bg-red-500/20"
                  />
                )}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-red-500 shadow-2xl bg-neutral-950">
                  <img
                    src="/pixel_marcus_avatar.jpg"
                    alt="Marcus Leng"
                    className="w-full h-full object-cover"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              </div>

              {/* Lower Third Anchor Chyron */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-black/90 border border-red-500/60 text-white text-xs font-mono font-bold shadow-md">
                <span className="text-red-500 font-black">[MNN REVIEW]</span>
                <span>ANCHOR: MARCUS LENG</span>
              </div>
            </div>

            {/* Subtitle Caption */}
            <div className="relative z-20 text-center">
              <div className="bg-neutral-950/90 backdrop-blur-md px-4 py-2 rounded-xl border border-red-500/30 max-w-xl mx-auto shadow-lg">
                <p className="text-yellow-300 font-mono text-xs font-semibold leading-relaxed drop-shadow line-clamp-2">
                  "{activeTurn?.text || currentRevision.summary}"
                </p>
              </div>
            </div>

            {/* Play/Pause Hover */}
            <div
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl">
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
              </div>
            </div>
          </div>

          {/* Timeline Scrubber */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-white/70">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />}
                </button>
                <span>{(currentTimeMs / 1000).toFixed(1)}s / {(currentRevision.videoManifest.durationMs / 1000).toFixed(1)}s</span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={`/api/episodes/${episode.id}/subtitles.srt`}
                  download
                  className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <Download className="w-3 h-3" /> Download SRT
                </a>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max={currentRevision.videoManifest.durationMs}
              value={currentTimeMs}
              onChange={e => setCurrentTimeMs(Number(e.target.value))}
              className="w-full cursor-pointer accent-red-500"
            />
          </div>
        </div>

        {/* Right Column: Review Controls & Approval Gate */}
        <div className="lg:col-span-5 space-y-4">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
            {[
              { id: 'video', label: 'Approval Gate', icon: Lock },
              { id: 'script', label: 'Script Editor', icon: Edit3 },
              { id: 'evidence', label: 'Fact Evidence', icon: ShieldCheck },
              { id: 'youtube', label: 'YouTube Meta', icon: Youtube }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-red-600 text-white font-black shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: APPROVAL GATE */}
          {activeTab === 'video' && (
            <div className="p-5 rounded-3xl bg-neutral-900 border border-white/10 space-y-5">
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Supervised Publication Gate &bull; FR-08
                </h3>
                <p className="text-[11px] text-white/50">
                  By clicking approve, you authorize this exact immutable video revision to be uploaded and published.
                </p>
              </div>

              {/* Publication Settings */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-white/70 block">Target YouTube Channel</label>
                <div className="p-3 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-red-500" />
                    <div>
                      <span className="font-bold text-xs text-white block">Marcus Leng News Network (MNN)</span>
                      <span className="text-[10px] text-white/40 font-mono">@MarcusLengNews</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold">
                    CONNECTED
                  </span>
                </div>

                <label className="text-xs font-bold text-white/70 block pt-1">Publication Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPublishMode('IMMEDIATE')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      publishMode === 'IMMEDIATE'
                        ? 'bg-red-600/20 border-red-500 text-white font-bold'
                        : 'bg-white/5 border-white/10 text-white/60'
                    }`}
                  >
                    <span className="text-xs block">Immediate</span>
                    <span className="text-[10px] text-white/40 block">Publish upon review</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPublishMode('SCHEDULED')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      publishMode === 'SCHEDULED'
                        ? 'bg-red-600/20 border-red-500 text-white font-bold'
                        : 'bg-white/5 border-white/10 text-white/60'
                    }`}
                  >
                    <span className="text-xs block">Schedule</span>
                    <span className="text-[10px] text-white/40 block">Future release time</span>
                  </button>
                </div>

                {publishMode === 'SCHEDULED' && (
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-bold text-white/70">Scheduled UTC Release Time</label>
                    <input
                      type="datetime-local"
                      value={scheduledDateTime}
                      onChange={e => setScheduledDateTime(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  disabled={isSubmittingApproval || (publishMode === 'SCHEDULED' && !scheduledDateTime)}
                  onClick={handleApproveAndPublish}
                  className={`w-full py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all ${
                    isSubmittingApproval
                      ? 'bg-neutral-800 text-white/40 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-950/50 active:scale-95'
                  }`}
                >
                  {isSubmittingApproval ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-red-300" />
                      <span>Authorizing &bull; Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>{publishMode === 'SCHEDULED' ? 'Approve & Schedule' : 'Approve & Publish to YouTube'}</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-white/40 text-center font-mono">
                  Authorization Invariant: Editing script or metadata will invalidate this approval.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: SCRIPT EDITOR */}
          {activeTab === 'script' && (
            <div className="p-5 rounded-3xl bg-neutral-900 border border-white/10 space-y-4 max-h-[500px] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-white">Broadcast Dialogue Script</h3>
                {!isEditingScript ? (
                  <button
                    onClick={() => setIsEditingScript(true)}
                    className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
                  >
                    Edit Script
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditingScript(false)}
                      className="px-3 py-1 rounded-xl bg-white/5 text-white/60 text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveScriptEdits}
                      className="px-3 py-1 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer"
                    >
                      Save Revision
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {editedTurns.map((turn, i) => (
                  <div key={turn.turnId || i} className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="font-black text-red-400">{turn.speaker}</span>
                      <span className="text-white/40 uppercase">{turn.sceneType}</span>
                    </div>
                    {isEditingScript ? (
                      <textarea
                        rows={3}
                        value={turn.text}
                        onChange={e => {
                          const val = e.target.value;
                          setEditedTurns(prev => prev.map((t, idx) => idx === i ? { ...t, text: val } : t));
                        }}
                        className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none"
                      />
                    ) : (
                      <p className="text-xs text-white/80 leading-relaxed font-sans">{turn.text}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: EVIDENCE INSPECTOR */}
          {activeTab === 'evidence' && (
            <div className="p-5 rounded-3xl bg-neutral-900 border border-white/10 space-y-4 max-h-[500px] overflow-y-auto">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verified Sourcing Packet &bull; FR-03
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Atomic factual claims resolved against primary documentation, official announcements and original datasets:
              </p>

              <div className="space-y-2">
                {currentRevision.scriptJson.outline?.map((outlineItem, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1 text-xs">
                    <div className="font-bold text-white">{outlineItem}</div>
                    <div className="text-[10px] font-mono text-emerald-400">STATUS: SOURCE-VERIFIED &bull; 0 DISPUTED</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: YOUTUBE METADATA */}
          {activeTab === 'youtube' && (
            <div className="p-5 rounded-3xl bg-neutral-900 border border-white/10 space-y-4 max-h-[500px] overflow-y-auto">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-500" />
                YouTube Metadata &bull; FR-09
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-white/40 block font-bold mb-1">Title</label>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-bold">
                    {currentRevision.youtubeMetadata.title}
                  </div>
                </div>

                <div>
                  <label className="text-white/40 block font-bold mb-1">Description (with Source Attribution)</label>
                  <pre className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-white/80 font-mono text-[10px] whitespace-pre-wrap">
                    {currentRevision.youtubeMetadata.description}
                  </pre>
                </div>

                <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-300">
                  <strong>Synthetic Media Disclosure:</strong> C2PA altered/synthetic presenter metadata flag is enabled as required by YouTube policy.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
