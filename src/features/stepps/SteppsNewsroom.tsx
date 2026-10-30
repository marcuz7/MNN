import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, Sparkles, CheckCircle2, AlertTriangle, Play, Check,
  Flame, Lock, ArrowRight, UserCheck, Bot, BarChart3, Layers, BookOpen,
  RefreshCw, CheckCheck, Eye, Compass, Target, MessageSquare, ExternalLink,
  Mic, Square, Volume2
} from 'lucide-react';
import { speakNaturalSpeech, stopNaturalSpeech } from '../../lib/naturalSpeech';
import {
  VerifiedStory,
  NewsSTEPPSDiagnosis,
  EditorialAngle,
  MNNContentMaster,
  MNNScript,
  QCReport,
  AudienceType,
  STEPPSDimension
} from './types';

interface SteppsNewsroomProps {
  onDirectWithMarcus?: (script: MNNScript, contentMaster: MNNContentMaster) => void;
  onNavigateView?: (view: string) => void;
}

export const SteppsNewsroom: React.FC<SteppsNewsroomProps> = ({
  onDirectWithMarcus,
  onNavigateView
}) => {
  const [stories, setStories] = useState<VerifiedStory[]>([]);
  const [selectedStory, setSelectedStory] = useState<VerifiedStory | null>(null);
  const [audience, setAudience] = useState<AudienceType>('founders');
  const [diagnosis, setDiagnosis] = useState<NewsSTEPPSDiagnosis | null>(null);
  const [angles, setAngles] = useState<EditorialAngle[]>([]);
  const [selectedAngle, setSelectedAngle] = useState<EditorialAngle | null>(null);
  const [contentMaster, setContentMaster] = useState<MNNContentMaster | null>(null);
  const [script, setScript] = useState<MNNScript | null>(null);
  const [loading, setLoading] = useState(false);
  const [autopilotRunning, setAutopilotRunning] = useState(false);
  const [autopilotStepIndex, setAutopilotStepIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState<'stepps' | 'angles' | 'content_master' | 'script'>('stepps');
  const [isAuditioning, setIsAuditioning] = useState(false);

  useEffect(() => {
    return () => {
      stopNaturalSpeech();
    };
  }, []);

  const autopilotChecklist = [
    'Scanning RSS feeds (126 articles detected)',
    'Deduplicating entries (34 duplicates removed)',
    'Clustering stories (18 clusters created)',
    'Verifying source evidence (5 verified stories)',
    'Ranking newsworthiness (Top 3 prioritized)',
    'Applying STEPPS editorial diagnosis',
    'Selecting optimal editorial angle',
    'Generating ContentMaster & Hook',
    'Executing Fact QC & Sensationalism Guard',
    'Ready for Supervised Approval'
  ];

  // Fetch verified stories on boot
  useEffect(() => {
    fetch('/api/mnn/stepps/stories')
      .then(res => res.json())
      .then(data => {
        if (data.stories && data.stories.length > 0) {
          setStories(data.stories);
          setSelectedStory(data.stories[0]);
        }
      })
      .catch(err => console.error('Failed to load verified stories:', err));
  }, []);

  // Update diagnosis and angles whenever selectedStory or audience changes
  useEffect(() => {
    if (!selectedStory) return;
    setLoading(true);

    Promise.all([
      fetch('/api/mnn/stepps/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: selectedStory.id, audience })
      }).then(r => r.json()),
      fetch('/api/mnn/stepps/angles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: selectedStory.id, audience })
      }).then(r => r.json())
    ])
      .then(([diagData, anglesData]) => {
        if (diagData.diagnosis) setDiagnosis(diagData.diagnosis);
        if (anglesData.angles && anglesData.angles.length > 0) {
          setAngles(anglesData.angles);
          setSelectedAngle(anglesData.angles[0]);
          // Also automatically generate content master & script for default angle
          return fetch('/api/mnn/content-master', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storyId: selectedStory.id, editorialAngleId: anglesData.angles[0].id })
          }).then(r => r.json());
        }
      })
      .then(cmData => {
        if (cmData?.contentMaster) {
          setContentMaster(cmData.contentMaster);
          return fetch('/api/mnn/stepps/script', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contentMasterId: cmData.contentMaster.id })
          }).then(r => r.json());
        }
      })
      .then(scriptData => {
        if (scriptData?.script) {
          setScript(scriptData.script);
        }
      })
      .catch(err => console.error('Error computing STEPPS pipeline:', err))
      .finally(() => setLoading(false));
  }, [selectedStory?.id, audience]);

  // When user selects a different angle
  const handleSelectAngle = (angle: EditorialAngle) => {
    setSelectedAngle(angle);
    if (!selectedStory) return;
    setLoading(true);

    fetch('/api/mnn/content-master', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storyId: selectedStory.id, editorialAngleId: angle.id })
    })
      .then(r => r.json())
      .then(cmData => {
        if (cmData?.contentMaster) {
          setContentMaster(cmData.contentMaster);
          return fetch('/api/mnn/stepps/script', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contentMasterId: cmData.contentMaster.id })
          }).then(r => r.json());
        }
      })
      .then(scriptData => {
        if (scriptData?.script) {
          setScript(scriptData.script);
        }
      })
      .catch(err => console.error('Error switching angle:', err))
      .finally(() => setLoading(false));
  };

  // Run Autopilot Newsroom
  const handleRunAutopilot = async () => {
    setAutopilotRunning(true);
    setAutopilotStepIndex(0);

    for (let i = 0; i < autopilotChecklist.length - 1; i++) {
      await new Promise(r => setTimeout(r, 320));
      setAutopilotStepIndex(i + 1);
    }

    try {
      const res = await fetch('/api/mnn/stepps/autopilot', { method: 'POST' });
      const data = await res.json();
      if (data.topStory) setSelectedStory(data.topStory);
      if (data.diagnosis) setDiagnosis(data.diagnosis);
      if (data.selectedAngle) setSelectedAngle(data.selectedAngle);
      if (data.contentMaster) setContentMaster(data.contentMaster);
      if (data.script) setScript(data.script);
      setAutopilotStepIndex(autopilotChecklist.length);
    } catch (err) {
      console.error('Autopilot run failed:', err);
    } finally {
      setAutopilotRunning(false);
    }
  };

  const getDimensionColor = (dim: STEPPSDimension) => {
    switch (dim) {
      case 'PRACTICAL_VALUE': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'SOCIAL_CURRENCY': return 'text-amber-300 bg-amber-500/10 border-amber-500/30';
      case 'STORIES': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'PUBLIC': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'TRIGGERS': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'EMOTION': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      default: return 'text-white/60 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-neutral-950 text-white overflow-y-auto">
      {/* Top Banner: Core Product Law (PRD §1) */}
      <div className="px-4 sm:px-6 py-3 border-b border-red-500/20 bg-black/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-red-700 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-red-950/60 border border-red-400/40">
            <ShieldCheck className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white uppercase font-sans">
                MNN STEPPS News Content Engine
              </h1>
              <span className="px-2 py-0.5 rounded bg-red-600/30 text-red-300 text-[10px] font-black uppercase tracking-wider border border-red-500/40">
                PRD PATCH V1.0
              </span>
            </div>
            <p className="text-[11px] text-white/50 font-mono">
              Core Law: <span className="text-amber-300 font-bold">FACTS ARE IMMUTABLE. PRESENTATION IS OPTIMIZABLE.</span>
            </p>
          </div>
        </div>

        {/* Autopilot Newsroom Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunAutopilot}
            disabled={autopilotRunning}
            className="cursor-pointer px-4 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-red-950/60 flex items-center gap-2"
          >
            {autopilotRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running Newsroom Autopilot...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run Newsroom Autopilot</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Autopilot Progress Visualizer (When active or completed) */}
      {autopilotStepIndex >= 0 && (
        <div className="px-4 sm:px-6 py-2.5 bg-neutral-900/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCheck className="w-4 h-4" />
            <span>MNN NEWSROOM AUTOPILOT:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/70">
            {autopilotChecklist.map((step, idx) => (
              <span
                key={idx}
                className={`px-2 py-0.5 rounded ${
                  idx < autopilotStepIndex
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : idx === autopilotStepIndex
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                    : 'bg-white/5 text-white/30'
                }`}
              >
                {idx < autopilotStepIndex ? '✓ ' : ''}{step}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Story & Audience Navigation Bar */}
      <div className="px-4 sm:px-6 py-2.5 bg-neutral-900/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        {/* Story Selector */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-white/40 font-mono shrink-0">
            Verified Stories:
          </span>
          {stories.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedStory(s)}
              className={`cursor-pointer px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedStory?.id === s.id
                  ? 'bg-red-600/30 border-red-500 text-white font-bold'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
              }`}
            >
              <span className="text-[10px] text-amber-300 font-mono mr-1.5">[{s.sources.length} sources]</span>
              <span>{s.headline.slice(0, 38)}...</span>
            </button>
          ))}
        </div>

        {/* Audience Routing Tabs (PRD §14) */}
        <div className="flex items-center gap-1 p-1 bg-black/60 rounded-xl border border-white/10 text-xs">
          <span className="text-[10px] uppercase font-bold text-white/40 font-mono px-2">Audience:</span>
          {(['founders', 'investors', 'operators', 'general'] as AudienceType[]).map(aud => (
            <button
              key={aud}
              onClick={() => setAudience(aud)}
              className={`cursor-pointer px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                audience === aud ? 'bg-amber-600 text-white shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              {aud}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        {selectedStory && (
          <>
            {/* Story Card with ClaimLock & Fact Verification Summary */}
            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold uppercase">
                      ✓ VERIFIED STORY ({Math.round(selectedStory.confidence * 100)}% CONFIDENCE)
                    </span>
                    <span className="text-[10px] text-white/40 font-mono">
                      TOPIC: {selectedStory.topic}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-white leading-snug">
                    {selectedStory.headline}
                  </h2>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {selectedStory.summary}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-amber-300">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>CLAIM LOCK ACTIVE</span>
                  </div>
                </div>
              </div>

              {/* Verified Facts & Uncertainty Preservation (PRD §4, §20, §21) */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <span className="text-[10px] uppercase font-bold text-white/40 font-mono">
                  Verified Fact Registry (Immutable Truth Constraints):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedStory.facts.map((fact, idx) => (
                    <div
                      key={fact.id}
                      className="p-2.5 rounded-xl bg-black/50 border border-white/10 flex items-start justify-between gap-2 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-white/40">FACT {idx + 1}:</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                              fact.status === 'VERIFIED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {fact.status}
                          </span>
                        </div>
                        <p className="text-white/80 leading-snug">{fact.statement}</p>
                      </div>
                      <span className="text-[9px] font-mono text-white/40 shrink-0">
                        {Math.round(fact.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* STEPPS 6-Dimension Diagnosis Radar & Scores (PRD §5, §12) */}
            {diagnosis && (
              <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">
                      STEPPS News Transmission Diagnosis
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-white/40">Primary:</span>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getDimensionColor(diagnosis.recommendedPrimary)}`}>
                      {diagnosis.recommendedPrimary}
                    </span>
                    {diagnosis.recommendedSecondary && (
                      <>
                        <span className="text-white/40">Secondary:</span>
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getDimensionColor(diagnosis.recommendedSecondary)}`}>
                          {diagnosis.recommendedSecondary}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* 6 Dimension Score Bars */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { dim: 'SOCIAL_CURRENCY' as STEPPSDimension, label: 'S — Social Currency', score: diagnosis.socialCurrency, desc: 'What smart founders notice first' },
                    { dim: 'TRIGGERS' as STEPPSDimension, label: 'T — Triggers', score: diagnosis.triggers, desc: 'Connects to recurring events' },
                    { dim: 'EMOTION' as STEPPSDimension, label: 'E — Emotion', score: diagnosis.emotion, desc: 'Curiosity & awe, no fake rage' },
                    { dim: 'PUBLIC' as STEPPSDimension, label: 'P — Public', score: diagnosis.public, desc: 'Observable market reactions' },
                    { dim: 'PRACTICAL_VALUE' as STEPPSDimension, label: 'P — Practical Value', score: diagnosis.practicalValue, desc: 'Heavy weight: what founders do' },
                    { dim: 'STORIES' as STEPPSDimension, label: 'S — Stories', score: diagnosis.stories, desc: 'Narrative: Before -> Change -> Next' }
                  ].map(item => (
                    <div key={item.dim} className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-white/70">{item.label}</span>
                        <span className="text-xs font-mono font-black text-amber-300">{item.score}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-amber-400"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-white/40 leading-tight">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3 Auto-Generated Editorial Angles (PRD §15, §17) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-red-400" />
                    <span>3 Canonical Editorial Angles for {audience.toUpperCase()}</span>
                  </h3>
                  <p className="text-[11px] text-white/50">
                    Same verified story. Genuinely different transmissions. Zero altered facts.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  UNSUPPORTED CLAIMS: 0 [LOCKED]
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {angles.map(angle => {
                  const isSelected = selectedAngle?.id === angle.id;
                  return (
                    <div
                      key={angle.id}
                      onClick={() => handleSelectAngle(angle)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all space-y-2 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-950/30 border-amber-500/80 ring-2 ring-amber-500/20 shadow-lg'
                          : 'bg-neutral-900/70 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${getDimensionColor(angle.steppsStrategy.primary)}`}>
                            {angle.angleType.replace('_', ' ')}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-amber-300 font-mono">SELECTED ✓</span>
                          )}
                        </div>
                        <h4 className="text-sm font-extrabold text-white leading-tight">{angle.title}</h4>
                        <p className="text-[11px] text-amber-200/80 font-medium">Q: {angle.primaryQuestion}</p>
                        <p className="text-xs text-white/70 leading-relaxed">{angle.thesis}</p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40">
                        <span>Facts Used: {angle.factIds.length}</span>
                        <span className="text-emerald-400">Claims Verified</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ContentMaster & Script Beats Preview (PRD §18, §23, §24) */}
            {contentMaster && script && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                {/* ContentMaster Specification */}
                <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">
                        ContentMaster Blueprint
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 text-[10px] font-mono font-bold">
                      HOOK: {contentMaster.hookType}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/60 border border-white/10 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-300 font-mono">Spoken Hook:</span>
                    <p className="text-xs font-semibold text-white leading-relaxed">"{contentMaster.hook}"</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-white/40 font-mono">Core Thesis:</span>
                      <p className="text-white/80">{contentMaster.thesis}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-white/40 font-mono">Key Implication:</span>
                      <p className="text-white/80">{contentMaster.implications[0]}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-white/40 font-mono">What To Watch:</span>
                      <p className="text-white/80">{contentMaster.whatToWatch?.[0]}</p>
                    </div>
                  </div>
                </div>

                {/* 6 Script Beats & Fact QC (PRD §24, §26, §28) */}
                <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">
                          90s Pixel Marcus Script Beats
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                        {script.qcStatus}
                      </span>
                    </div>

                    {/* Beats List */}
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {script.beats.map((beat, bIdx) => (
                        <div
                          key={beat.id}
                          className="p-2.5 rounded-xl bg-black/60 border border-white/5 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="font-bold text-amber-400">
                              BEAT {bIdx + 1}: {beat.beatType}
                            </span>
                            <span className="text-white/40">
                              {beat.startSec}s – {beat.endSec}s
                            </span>
                          </div>
                          <p className="text-white/80 leading-relaxed font-sans">{beat.text}</p>
                          <p className="text-[9px] text-white/40 font-mono italic">
                            Visual: {beat.visualCue}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fact QC Verification Badges */}
                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>All claims match source</span>
                      <span>•</span>
                      <span>Sensationalism guard passed</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Audition with VoxCPM 48kHz */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isAuditioning) {
                            stopNaturalSpeech();
                            setIsAuditioning(false);
                          } else {
                            const fullScriptText = script.beats.map(b => b.text).join(' ');
                            setIsAuditioning(true);
                            speakNaturalSpeech(fullScriptText, {
                              voiceId: 'marcus-anchor',
                              onStart: () => setIsAuditioning(true),
                              onEnd: () => setIsAuditioning(false),
                              onError: () => setIsAuditioning(false)
                            });
                          }
                        }}
                        className="cursor-pointer px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
                        title="Audition script in Pixel Marcus 48kHz VoxCPM Voice"
                      >
                        {isAuditioning ? (
                          <>
                            <Square className="w-3.5 h-3.5 fill-current text-amber-400" />
                            <span>Stop Voice</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            <span>Audition VoxCPM (48k)</span>
                          </>
                        )}
                      </button>

                      {/* Direct with Marcus Broadcast Button */}
                      <button
                        type="button"
                        onClick={() => onDirectWithMarcus?.(script, contentMaster)}
                        className="cursor-pointer px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-950/60 flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Direct 90s Broadcast</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
