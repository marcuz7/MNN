import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radio, Sparkles, CheckCircle2, AlertCircle, RefreshCw, ExternalLink,
  ShieldCheck, ArrowRight, Play, Film, Clock, Layers, Filter, Check,
  X, ChevronRight, Zap, Flame, Compass, HeartHandshake, TrendingUp
} from 'lucide-react';

interface StoryCluster {
  id: string;
  leadItemId: string;
  title: string;
  summary: string;
  category: string;
  sourceItemIds: string[];
  sources: Array<{ id: string; title: string; url: string; publisher: string; publishedAt: string }>;
  firstSeenAt: string;
  lastSeenAt: string;
  duplicateCount: number;
  score: number;
  status: 'DISCOVERED' | 'VERIFYING' | 'VERIFIED' | 'NEEDS_FACT_REVIEW' | 'PRODUCED' | 'SKIPPED';
  claims: Array<{
    id: string;
    claimText: string;
    verdict: string;
    evidenceExcerpt: string;
    sourceUrl: string;
    sourceTitle: string;
    confidence: number;
  }>;
}

interface NewsRadarProps {
  onProduceEpisode: (clusterIds: string[]) => void;
  onOpenReview: (episodeId: string) => void;
}

interface UserPreferences {
  categoryCounts: Record<string, number>;
  publisherCounts: Record<string, number>;
  totalPicks: number;
}

export function NewsRadar({ onProduceEpisode, onOpenReview }: NewsRadarProps) {
  const [clusters, setClusters] = useState<StoryCluster[]>([]);
  const [loading, setLoading] = useState(true);
  // 3-slot broadcast queue: exactly up to 3 slots
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [inspectingCluster, setInspectingCluster] = useState<StoryCluster | null>(null);
  const [isProducing, setIsProducing] = useState(false);

  // Preference learning state
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const stored = localStorage.getItem('mnn_user_preferences');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      categoryCounts: {
        'GitHub Repo of the Day': 3,
        'Hottest X.com AI News': 3,
        'Substack AI Thinkers': 2,
        'AI & Agents': 1
      },
      publisherCounts: {
        'GitHub Trending Repos of the Day': 2,
        'Ben\'s Bites (Hottest X.com AI News)': 2,
        'Interconnects AI': 1
      },
      totalPicks: 8
    };
  });

  const fetchClusters = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stories');
      if (res.ok) {
        const data = await res.json();
        const loaded: StoryCluster[] = data.clusters || [];
        setClusters(loaded);

        // Pre-select top 3 slots by default if empty
        if (selectedSlotIds.length === 0 && loaded.length >= 3) {
          setSelectedSlotIds(loaded.slice(0, 3).map(c => c.id));
        }
      }
    } catch (err) {
      console.error('Failed to fetch story clusters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClusters();
  }, []);

  // Compute affinity score (0 - 100%) for a cluster based on user's past choices
  const getAffinityMatchScore = (cluster: StoryCluster): number => {
    const catWeight = preferences.categoryCounts[cluster.category] || 0;
    const pub = cluster.sources[0]?.publisher || '';
    const pubWeight = preferences.publisherCounts[pub] || 0;

    // Base score + affinity weighting
    const ratio = Math.min(1, (catWeight * 2 + pubWeight * 3) / Math.max(preferences.totalPicks, 1));
    const bonus = Math.round(ratio * 25);
    const score = Math.min(99, Math.max(70, Math.round(cluster.score * 0.75 + bonus)));
    return score;
  };

  // Record user selection to learn preferences
  const recordSelection = (cluster: StoryCluster) => {
    setPreferences(prev => {
      const updated: UserPreferences = {
        categoryCounts: {
          ...prev.categoryCounts,
          [cluster.category]: (prev.categoryCounts[cluster.category] || 0) + 1
        },
        publisherCounts: {
          ...prev.publisherCounts,
          [cluster.sources[0]?.publisher || 'General']: (prev.publisherCounts[cluster.sources[0]?.publisher || 'General'] || 0) + 1
        },
        totalPicks: prev.totalPicks + 1
      };
      try {
        localStorage.setItem('mnn_user_preferences', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Slot management: click toggles or places in next open slot (max 3)
  const handleToggleSlot = (cluster: StoryCluster) => {
    setSelectedSlotIds(prev => {
      if (prev.includes(cluster.id)) {
        return prev.filter(id => id !== cluster.id);
      }
      if (prev.length >= 3) {
        // Replace last slot if full
        recordSelection(cluster);
        return [prev[0], prev[1], cluster.id];
      }
      recordSelection(cluster);
      return [...prev, cluster.id];
    });
  };

  const removeSlot = (id: string) => {
    setSelectedSlotIds(prev => prev.filter(x => x !== id));
  };

  // 1-Click Auto-Pick Top 3 based on learned preferences
  const handleAutoPickForMyTaste = () => {
    const sorted = [...clusters].sort((a, b) => getAffinityMatchScore(b) - getAffinityMatchScore(a));
    const top3 = sorted.slice(0, 3).map(c => c.id);
    setSelectedSlotIds(top3);
  };

  const handleProduceGateAEpisode = async () => {
    if (selectedSlotIds.length === 0) return;
    setIsProducing(true);
    try {
      const res = await fetch('/api/stories/produce-selected', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clusterIds: selectedSlotIds,
          targetDurationSeconds: 90
        })
      });
      if (res.ok) {
        const data = await res.json();
        onProduceEpisode(selectedSlotIds);
        if (data.episode?.id) {
          onOpenReview(data.episode.id);
        }
      }
    } catch (err) {
      console.error('Produce episode error:', err);
    } finally {
      setIsProducing(false);
    }
  };

  // Filter & sort clusters
  let displayClusters = [...clusters];
  if (activeFilter === 'FOR_YOU') {
    displayClusters.sort((a, b) => getAffinityMatchScore(b) - getAffinityMatchScore(a));
  } else if (activeFilter !== 'ALL') {
    displayClusters = displayClusters.filter(c =>
      c.category.toUpperCase().includes(activeFilter.toUpperCase())
    );
  }

  const slotClusters = selectedSlotIds.map(id => clusters.find(c => c.id === id)).filter(Boolean) as StoryCluster[];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-24">
      {/* Top News Radar Hub Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-neutral-900/90 border border-red-500/30 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-red-950/60 shrink-0">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-tight">AI News Radar &bull; Multi-Story Scanner</h2>
              <span className="px-2 py-0.5 rounded-full bg-red-600/20 border border-red-500/30 text-red-300 text-[10px] font-mono font-bold uppercase">
                GitHub &bull; X.com &bull; Substack
              </span>
            </div>
            <p className="text-xs text-white/50 font-medium">
              Scans 12+ real-time stories. Pick any 3 stories for your 90s broadcast. MNN learns your taste over time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={fetchClusters}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-400' : ''}`} />
            <span>Scan Feeds</span>
          </button>

          <button
            onClick={handleAutoPickForMyTaste}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Auto-pick top 3 stories matching your historical reading preferences"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Auto-Pick for My Taste</span>
          </button>
        </div>
      </div>

      {/* 3-Step Production Progress Flow */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs font-mono">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 text-red-400 font-bold">
            <span className="w-5 h-5 rounded-full bg-red-950 border border-red-500 flex items-center justify-center text-[10px] text-white">1</span>
            <span>Pick 3 Stories ({selectedSlotIds.length}/3)</span>
          </div>
          <span className="text-neutral-600">→</span>
          <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
            <span className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px]">2</span>
            <span>Produce 90s Broadcast</span>
          </div>
          <span className="text-neutral-600">→</span>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px]">3</span>
            <span>Review Studio</span>
          </div>
        </div>
        <div className="text-[11px] text-neutral-400">
          {selectedSlotIds.length < 3 ? (
            <span>Pick {3 - selectedSlotIds.length} more stories below to complete lineup</span>
          ) : (
            <span className="text-emerald-400 font-bold">✓ Ready! Click "Produce 90s Broadcast" to proceed to Review Studio</span>
          )}
        </div>
      </div>

      {/* 3-Slot Broadcast Queue Tray (PRD Section 3 Requirement) */}
      <div className="p-4 rounded-3xl bg-neutral-950/90 border-2 border-red-500/40 shadow-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-red-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Selected Broadcast Queue ({selectedSlotIds.length}/3 Stories Picked)
            </h3>
            <span className="text-[10px] font-mono text-white/40 hidden sm:inline">&bull; 90s Broadcast Lineup</span>
          </div>

          <button
            onClick={handleProduceGateAEpisode}
            disabled={selectedSlotIds.length === 0 || isProducing}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
              selectedSlotIds.length > 0 && !isProducing
                ? 'bg-gradient-to-r from-red-600 via-red-500 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-950/60 active:scale-95'
                : 'bg-neutral-800 text-white/40 cursor-not-allowed'
            }`}
          >
            {isProducing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Directing 90s Broadcast...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Produce 90s Broadcast ({selectedSlotIds.length} Stories)</span>
              </>
            )}
          </button>
        </div>

        {/* 3 Slots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[0, 1, 2].map(slotIndex => {
            const cluster = slotClusters[slotIndex];
            const slotLabels = [
              'Slot 1: Lead Headline (Anchor Desk)',
              'Slot 2: Deep Dive (Split Screen)',
              'Slot 3: Tech Wrap (Explainer)'
            ];

            return (
              <div
                key={slotIndex}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between min-h-[96px] ${
                  cluster
                    ? 'bg-red-950/30 border-red-500/50 shadow-md ring-1 ring-red-500/30'
                    : 'bg-white/[0.02] border-dashed border-white/10'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                  <span className="font-bold text-amber-400">{slotLabels[slotIndex]}</span>
                  {cluster && (
                    <button
                      onClick={() => removeSlot(cluster.id)}
                      className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white cursor-pointer"
                      title="Remove from slot"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {cluster ? (
                  <div className="space-y-1 mt-1.5">
                    <h4 className="text-xs font-bold text-white line-clamp-1">
                      {cluster.title}
                    </h4>
                    <p className="text-[10px] text-white/50 line-clamp-1">
                      {cluster.sources[0]?.publisher || 'Verified Feed'} &bull; {cluster.category}
                    </p>
                  </div>
                ) : (
                  <div className="my-auto text-center py-2">
                    <p className="text-[11px] text-white/30 font-medium">Empty slot &bull; Click any card below to assign</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs & Preference Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {[
            { id: 'ALL', label: 'All Stories' },
            { id: 'FOR_YOU', label: '✨ For You (Learned Taste)' },
            { id: 'GITHUB', label: 'GitHub Repos' },
            { id: 'HOTTEST X', label: 'Hottest X.com' },
            { id: 'SUBSTACK', label: 'Substack Thinkers' },
            { id: 'AGENTS', label: 'AI & Agents' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === filter.id
                  ? 'bg-red-600 text-white font-black shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/40">
          <HeartHandshake className="w-3.5 h-3.5 text-red-400" />
          <span>Preference Engine: {preferences.totalPicks} picks learned</span>
        </div>
      </div>

      {/* Scanned Candidate Story Cards Grid (>10 items) */}
      {loading ? (
        <div className="p-12 text-center text-white/50 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-red-400" />
          <p className="text-xs font-mono">Deduplicating and scoring incoming RSS feeds from GitHub, X.com &amp; Substack...</p>
        </div>
      ) : displayClusters.length === 0 ? (
        <div className="p-12 text-center text-white/50 space-y-2 bg-neutral-900/40 rounded-3xl border border-white/5">
          <AlertCircle className="w-8 h-8 mx-auto text-amber-400" />
          <p className="text-sm font-bold text-white">No story clusters found</p>
          <p className="text-xs text-white/40">Try switching filters or scanning feeds in the Feed Manager.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayClusters.map(cluster => {
            const isSelected = selectedSlotIds.includes(cluster.id);
            const slotIndex = selectedSlotIds.indexOf(cluster.id);
            const affinityScore = getAffinityMatchScore(cluster);

            return (
              <div
                key={cluster.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 relative ${
                  isSelected
                    ? 'bg-red-950/30 border-red-500/60 shadow-lg shadow-red-950/40 ring-1 ring-red-500/40'
                    : 'bg-neutral-900/70 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header: Category & Taste Affinity */}
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/70 border border-white/10 uppercase">
                      {cluster.category}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-amber-300 font-bold flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        {affinityScore}% Match
                      </span>
                      <span className="text-white/25">|</span>
                      <span className="text-emerald-400 font-black">★ {cluster.score}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-black text-sm text-white/95 leading-snug line-clamp-2">
                    {cluster.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-white/60 leading-relaxed line-clamp-3">
                    {cluster.summary}
                  </p>
                </div>

                {/* Card Footer: Sources & Action buttons */}
                <div className="pt-3 border-t border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white/40 truncate max-w-[170px]" title={cluster.sources[0]?.publisher}>
                      {cluster.sources[0]?.publisher || "Verified Feed"}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {cluster.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSlot(cluster)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-red-600 text-white font-black shadow-md'
                          : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Slot {slotIndex + 1} Selected</span>
                        </>
                      ) : (
                        <span>Pick for Broadcast</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setInspectingCluster(cluster)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer border border-white/5"
                      title="Inspect Fact Claims & Sources"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect Evidence Modal */}
      <AnimatePresence>
        {inspectingCluster && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-950 border border-red-500/40 rounded-3xl max-w-2xl w-full p-6 space-y-5 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold block mb-1">
                    [Evidence &bull; Fact Packet]
                  </span>
                  <h3 className="text-base font-black text-white">{inspectingCluster.title}</h3>
                </div>
                <button
                  onClick={() => setInspectingCluster(null)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 cursor-pointer text-lg leading-none"
                >
                  &times;
                </button>
              </div>

              {/* Claims Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/40">Atomic Fact Verification Claims</h4>
                {inspectingCluster.claims?.map(claim => (
                  <div key={claim.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold">
                        {claim.verdict} &bull; {(claim.confidence * 100).toFixed(0)}% CONFIDENCE
                      </span>
                      <a
                        href={claim.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1 text-[10px] font-mono"
                      >
                        Source Link <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <p className="font-semibold text-white/90">"{claim.claimText}"</p>
                    <p className="text-white/60 text-[11px] leading-relaxed">
                      <strong>Evidence Excerpt:</strong> {claim.evidenceExcerpt}
                    </p>
                  </div>
                ))}
              </div>

              {/* Sources */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/40">Corroborating Feeds</h4>
                <div className="space-y-1">
                  {inspectingCluster.sources?.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="font-bold text-white/80">{s.publisher}</span>
                      <a href={s.url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline text-[11px] truncate max-w-xs">
                        {s.url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    handleToggleSlot(inspectingCluster);
                    setInspectingCluster(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
                >
                  {selectedSlotIds.includes(inspectingCluster.id) ? 'Remove from Queue' : 'Add to 3-Story Queue'}
                </button>
                <button
                  type="button"
                  onClick={() => setInspectingCluster(null)}
                  className="px-5 py-2 rounded-xl bg-white text-black font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
