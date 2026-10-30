import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, Pause, RotateCcw, Sparkles, Video, Share2, Copy, Check,
  Download, Film, Smartphone, Monitor, Layers, Volume2, VolumeX,
  ExternalLink, Zap, Flame, User, MessageSquare, Terminal, DollarSign,
  Briefcase, TrendingUp, Send, CheckCircle2, Search, ArrowRight, Github, Mic
} from 'lucide-react';
import { GIT_REPO_PRESETS } from './presets';
import { GitRepoVideoTemplate, MonetizationAngle } from './types';
import { StepProgressPills } from './StepProgressPills';
import { FloatingDeviceStage } from './FloatingDeviceStage';
import { CtaBannerOverlay } from './CtaBannerOverlay';
import { speakNaturalSpeech, stopNaturalSpeech } from '../../lib/naturalSpeech';
import { VoiceStudioModal } from '../../components/VoiceStudioModal';
import { VoxCpmStudioModal } from '../voxcpm/VoxCpmStudioModal';

interface GitRepoMoneyStudioProps {
  avatarUrl: string;
  onNavigateHome?: () => void;
}

export const GitRepoMoneyStudio: React.FC<GitRepoMoneyStudioProps> = ({
  avatarUrl,
  onNavigateHome
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<GitRepoVideoTemplate>(GIT_REPO_PRESETS[0]);
  const [customRepoUrl, setCustomRepoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'monetization' | 'cta' | 'code'>('preview');

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [selectedMonetization, setSelectedMonetization] = useState<MonetizationAngle>(selectedTemplate.monetizationAngles[0]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // CTA configuration
  const [ctaKeyword, setCtaKeyword] = useState(selectedTemplate.ctaKeyword || 'REPO');
  const [ctaPlatform, setCtaPlatform] = useState<'Messenger' | 'Inbox' | 'Instagram DM'>(selectedTemplate.ctaPlatform || 'Messenger');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isVoxCpmModalOpen, setIsVoxCpmModalOpen] = useState(false);

  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentSegmentIndexRef = useRef<number>(-1);

  // Sync selected monetization when template changes
  useEffect(() => {
    setSelectedMonetization(selectedTemplate.monetizationAngles[0]);
    setCtaKeyword(selectedTemplate.ctaKeyword || 'REPO');
    setCtaPlatform(selectedTemplate.ctaPlatform || 'Messenger');
    setCurrentTime(0);
    setIsPlaying(false);
    setIsSpeaking(false);
    stopNaturalSpeech();
  }, [selectedTemplate]);

  // Determine current script segment
  const currentSegment = selectedTemplate.scriptSegments.find(
    s => currentTime >= s.start && currentTime < s.end
  ) || selectedTemplate.scriptSegments[0];

  const activeStepIndex = currentSegment?.stepIndex ?? 0;

  // Determine active word in kinetic caption
  const currentWord = currentSegment?.captionWords?.find(
    w => currentTime >= w.start && currentTime <= w.end
  );

  // Is CTA visible (in final 7 seconds or when step 2 is active near the end)
  const isCtaVisible = currentTime >= selectedTemplate.totalDuration - 8;

  // Natural Neural Speech synthesis playback (Anti-Robotic Neural Engine)
  const speakSegment = (text: string) => {
    speakNaturalSpeech(text, {
      gender: 'anchor',
      rate: 0.95 * playbackRate,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setIsSpeaking(false);
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      stopNaturalSpeech();
    } else {
      setIsPlaying(true);
      let t = currentTime;
      if (t >= selectedTemplate.totalDuration) {
        t = 0;
        setCurrentTime(0);
      }
      if (currentSegment) {
        speakSegment(currentSegment.text);
      }

      playbackTimerRef.current = setInterval(() => {
        t += 0.25 * playbackRate;
        if (t >= selectedTemplate.totalDuration) {
          t = selectedTemplate.totalDuration;
          if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
          setIsPlaying(false);
          setIsSpeaking(false);
        }
        setCurrentTime(t);

        // Check if segment changed to trigger speech
        const segIdx = selectedTemplate.scriptSegments.findIndex(
          s => t >= s.start && t < s.end
        );
        if (segIdx !== -1 && segIdx !== currentSegmentIndexRef.current) {
          currentSegmentIndexRef.current = segIdx;
          speakSegment(selectedTemplate.scriptSegments[segIdx].text);
        }
      }, 250);
    }
  };

  const resetPlay = () => {
    setIsPlaying(false);
    setIsSpeaking(false);
    setCurrentTime(0);
    currentSegmentIndexRef.current = -1;
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    stopNaturalSpeech();
  };

  // Jump to step
  const handleSelectStep = (index: number) => {
    const step = selectedTemplate.steps[index];
    if (step) {
      setCurrentTime(step.timeSec);
      if (isPlaying) {
        speakSegment(selectedTemplate.scriptSegments[index]?.text || '');
      }
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Handle custom URL analysis
  const handleAnalyzeCustomRepo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRepoUrl.trim()) return;

    setIsAnalyzing(true);
    // Parse owner and repo name from URL
    const match = customRepoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    const owner = match ? match[1] : 'developer';
    const repo = match ? match[2].replace(/\.git$/, '') : 'awesome-repo';

    setTimeout(() => {
      const generatedTemplate: GitRepoVideoTemplate = {
        id: `custom-${repo}`,
        repoUrl: customRepoUrl,
        repoName: repo,
        owner: owner,
        stars: 4890,
        primaryLanguage: 'TypeScript / Python',
        tagline: `Automated monetization breakdown for ${owner}/${repo}. Turn open-source code into cashflow.`,
        problemHook: `Most developers do not know you can turn ${repo} into a $3,000/mo automated business with 3 commands.`,
        hashtags: [`#${repo}`, '#opensource', '#github', '#sidehustle', '#techbusiness'],
        steps: [
          {
            id: 'cs1',
            stepNumber: 1,
            label: 'Clone repo',
            timeSec: 0,
            commandSnippet: `git clone https://github.com/${owner}/${repo}.git`,
            explanation: `Fetch the official open-source code for ${repo}.`
          },
          {
            id: 'cs2',
            stepNumber: 2,
            label: 'Run setup',
            timeSec: 8,
            commandSnippet: `cd ${repo} && npm install && npm run build`,
            explanation: 'Initialize environment dependencies and verify build.'
          },
          {
            id: 'cs3',
            stepNumber: 3,
            label: 'Monetize',
            timeSec: 16,
            commandSnippet: `npx ${repo} --monetize --serve`,
            explanation: 'Launch the automated client service or hosted micro-SaaS instance.'
          }
        ],
        monetizationAngles: [
          {
            id: 'cm1',
            title: `Hosted ${repo} Micro-SaaS`,
            model: 'Micro-SaaS',
            monthlyPotential: '$3,800/mo',
            pricingExample: '$29/mo per active user',
            targetClient: 'Small business owners and non-technical operators.',
            pitchScript: `Offer a cloud-hosted version of ${repo} so clients don't have to touch a terminal.`
          },
          {
            id: 'cm2',
            title: 'Turnkey Implementation Agency',
            model: 'Agency Service',
            monthlyPotential: '$4,500/mo',
            pricingExample: '$750 per client installation',
            targetClient: 'Agencies and e-commerce brands needing custom setup.',
            pitchScript: `Charge a one-time fee to integrate ${repo} directly into the client's existing stack.`
          },
          {
            id: 'cm3',
            title: 'Affiliate & Sponsored Tutorial Channel',
            model: 'Affiliate & Content',
            monthlyPotential: '$1,900/mo',
            pricingExample: 'Ad revenue + affiliate tools',
            targetClient: 'YouTube Shorts and TikTok developers.',
            pitchScript: `Post high-retention 9:16 walkthroughs showing exact setup with affiliate cloud GPU links.`
          }
        ],
        terminalPrompt: `~/${repo} $ `,
        terminalOutput: [
          `Cloning https://github.com/${owner}/${repo}...`,
          'Dependencies installed successfully [0 vulnerabilities]',
          'Compiling server daemon... READY on port 8080',
          'Database connected. Ready to serve client requests!'
        ],
        targetScreenType: 'saas_dashboard',
        targetScreenTitle: `${repo} Cloud Engine`,
        targetScreenSubtitle: 'Open Source Monetization Framework',
        targetScreenBadge: '4.8K GITHUB STARS',
        scriptSegments: [
          {
            start: 0,
            end: 7,
            speaker: 'Marcus Leng',
            text: `Stop ignoring GitHub repos that could be making you thousands every single month.`,
            stepIndex: 0,
            captionWords: [
              { word: 'STOP', start: 0.1, end: 0.5, isHighlight: true, color: '#ef4444' },
              { word: 'ignoring', start: 0.5, end: 1.0 },
              { word: 'GITHUB', start: 1.0, end: 1.6, isHighlight: true, color: '#38bdf8' },
              { word: 'REPOS', start: 1.6, end: 2.1, isHighlight: true, color: '#38bdf8' },
              { word: 'that', start: 2.1, end: 2.3 },
              { word: 'MAKE', start: 2.3, end: 2.8, isHighlight: true, color: '#10b981' },
              { word: 'MONEY.', start: 2.8, end: 3.5, isHighlight: true, color: '#10b981' }
            ]
          },
          {
            start: 7,
            end: 15,
            speaker: 'Marcus Leng',
            text: `This project called ${repo} takes three simple commands to set up on your laptop.`,
            stepIndex: 1,
            captionWords: [
              { word: 'This', start: 7.1, end: 7.4 },
              { word: 'PROJECT', start: 7.4, end: 8.0, isHighlight: true, color: '#fbbf24' },
              { word: 'takes', start: 8.0, end: 8.3 },
              { word: 'THREE', start: 8.3, end: 8.8, isHighlight: true, color: '#38bdf8' },
              { word: 'COMMANDS', start: 8.8, end: 9.5, isHighlight: true, color: '#38bdf8' },
              { word: 'to', start: 9.5, end: 9.7 },
              { word: 'RUN.', start: 9.7, end: 10.4, isHighlight: true, color: '#10b981' }
            ]
          },
          {
            start: 15,
            end: 22,
            speaker: 'Marcus Leng',
            text: `You can wrap it into a micro SaaS or charge businesses seven hundred dollars to install it.`,
            stepIndex: 2,
            captionWords: [
              { word: 'WRAP', start: 15.1, end: 15.6, isHighlight: true, color: '#38bdf8' },
              { word: 'IT', start: 15.6, end: 15.8 },
              { word: 'INTO', start: 15.8, end: 16.1 },
              { word: 'A', start: 16.1, end: 16.2 },
              { word: 'MICRO', start: 16.2, end: 16.7, isHighlight: true, color: '#10b981' },
              { word: 'SAAS', start: 16.7, end: 17.3, isHighlight: true, color: '#10b981' },
              { word: 'OR', start: 17.3, end: 17.6 },
              { word: 'CHARGE', start: 17.6, end: 18.2, isHighlight: true, color: '#fbbf24' },
              { word: '$750.', start: 18.2, end: 19.0, isHighlight: true, color: '#10b981' }
            ]
          },
          {
            start: 22,
            end: 30,
            speaker: 'Marcus Leng',
            text: `Comment REPO below and Marcus will send you the direct GitHub link and setup script in your Messenger or Inbox!`,
            stepIndex: 2,
            captionWords: [
              { word: 'COMMENT', start: 22.1, end: 22.6, isHighlight: true, color: '#ef4444' },
              { word: '"REPO"', start: 22.6, end: 23.3, isHighlight: true, color: '#fbbf24' },
              { word: 'BELOW', start: 23.3, end: 23.7 },
              { word: 'FOR', start: 23.7, end: 24.0 },
              { word: 'DIRECT', start: 24.0, end: 24.5 },
              { word: 'INBOX', start: 24.5, end: 25.1, isHighlight: true, color: '#38bdf8' },
              { word: 'LINK!', start: 25.1, end: 25.8, isHighlight: true, color: '#10b981' }
            ]
          }
        ],
        totalDuration: 30,
        ctaKeyword: 'REPO',
        ctaPlatform: 'Messenger'
      };

      setSelectedTemplate(generatedTemplate);
      setIsAnalyzing(false);
      setCustomRepoUrl('');
    }, 900);
  };

  // Hypit DSL code generation
  const hypitDslJson = JSON.stringify({
    version: '1.2.0',
    format: '9:16',
    fps: 60,
    resolution: { width: 1080, height: 1920 },
    templateName: 'Marcus Git Repo Money Making Channel',
    repo: {
      name: selectedTemplate.repoName,
      url: selectedTemplate.repoUrl,
      stars: selectedTemplate.stars
    },
    monetization: {
      model: selectedMonetization.model,
      potential: selectedMonetization.monthlyPotential,
      pricing: selectedMonetization.pricingExample
    },
    cta: {
      keyword: ctaKeyword,
      platform: ctaPlatform,
      triggerMessage: `Comment "${ctaKeyword}" for link in ${ctaPlatform}`
    },
    steps: selectedTemplate.steps,
    transcript: selectedTemplate.scriptSegments
  }, null, 2);

  // Remotion Component code
  const remotionCodeSnippet = `// Remotion 9:16 Short-Form Composition: Marcus Git Repo Money Making Channel
import { Composition, Sequence, useCurrentFrame, interpolate } from 'remotion';
import { FloatingTerminal } from './FloatingTerminal';
import { StepPills } from './StepPills';
import { KineticCaptions } from './KineticCaptions';
import { MarcusCornerAvatar } from './MarcusCornerAvatar';

export const GitRepoMoneyShort = () => {
  return (
    <Composition
      id="GitRepoMoney_${selectedTemplate.repoName}"
      component={VideoScene}
      durationInFrames={${Math.round(selectedTemplate.totalDuration * 60)}}
      fps={60}
      width={1080}
      height={1920}
      defaultProps={{
        repoName: "${selectedTemplate.repoName}",
        ctaKeyword: "${ctaKeyword}",
        ctaPlatform: "${ctaPlatform}"
      }}
    />
  );
};`;

  return (
    <div className="w-full flex-1 flex flex-col bg-neutral-950 text-white overflow-y-auto">
      {/* Studio Header Bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-red-500/20 bg-black/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-amber-600 to-red-800 flex items-center justify-center text-white shadow-lg shadow-red-950/60 border border-red-400/40">
            <Flame className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white uppercase font-sans">
                Marcus Git Repo Money Making Channel
              </h1>
              <span className="px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-300 text-[10px] font-black border border-blue-500/40">
                9:16 VIRAL SHORTS
              </span>
            </div>
            <p className="text-[11px] text-white/50">
              Turn any GitHub repo URL into an animated 9:16 monetization video with Comment-to-DM CTA automation.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('preview')}
            className={`cursor-pointer px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'preview' ? 'bg-red-600 text-white shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            9:16 Canvas
          </button>
          <button
            onClick={() => setActiveTab('monetization')}
            className={`cursor-pointer px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'monetization' ? 'bg-amber-600 text-white shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            Money Playbook
          </button>
          <button
            onClick={() => setActiveTab('cta')}
            className={`cursor-pointer px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'cta' ? 'bg-blue-600 text-white shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            Lead Gen & CTA
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`cursor-pointer px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'code' ? 'bg-neutral-800 text-white shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            Hypit DSL / Remotion
          </button>
        </div>
      </div>

      {/* GitHub URL Ingestion & Preset Switcher Bar */}
      <div className="px-4 sm:px-6 py-2.5 bg-neutral-900/80 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        {/* URL Input Form */}
        <form onSubmit={handleAnalyzeCustomRepo} className="flex-1 min-w-[280px] max-w-xl flex items-center gap-2">
          <div className="relative flex-1">
            <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="url"
              placeholder="Paste GitHub URL: https://github.com/owner/repo"
              value={customRepoUrl}
              onChange={e => setCustomRepoUrl(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/70 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-red-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isAnalyzing}
            className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 shadow-lg shadow-red-950/60"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Formulating...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Turn into Video</span>
              </>
            )}
          </button>
        </form>

        {/* Curated Presets Quick Selector */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-white/40 font-mono shrink-0">Presets:</span>
          {GIT_REPO_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => setSelectedTemplate(preset)}
              className={`cursor-pointer px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                selectedTemplate.id === preset.id
                  ? 'bg-red-600/30 border-red-500 text-white font-bold'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {preset.repoName}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="flex-1 p-3 sm:p-6 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 max-w-7xl mx-auto w-full">
        {/* Left Column: 9:16 Vertical Video Frame (Modeled after reference image IMG_6716.png) */}
        <div className="flex flex-col items-center shrink-0">
          {/* Phone Bezel Container */}
          <div className="relative w-[340px] sm:w-[380px] h-[640px] sm:h-[680px] rounded-[36px] bg-neutral-950 border-[6px] border-neutral-800 shadow-2xl shadow-black overflow-hidden flex flex-col justify-between select-none">
            {/* Top Phone Sensor Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-neutral-900 rounded-b-xl z-40 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-black/60 mr-2" />
              <div className="w-8 h-1 bg-neutral-700 rounded-full" />
            </div>

            {/* Top Area: SEO Problem Statement & Hashtags (Matching IMG_6716) */}
            <div className="pt-5 px-3.5 pb-1 z-30 space-y-1 bg-gradient-to-b from-black via-black/80 to-transparent">
              <p className="text-[10px] sm:text-[11px] font-sans font-medium text-white/85 leading-snug line-clamp-3">
                {selectedTemplate.problemHook}
              </p>
              <div className="flex flex-wrap gap-1 text-[9px] font-bold text-blue-400">
                {selectedTemplate.hashtags.map(tag => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              {/* Step Progression Pills (Matching IMG_6716: [✓ Developer mode] [2 USB debugging] [3 Claude Code]) */}
              <div className="pt-1.5">
                <StepProgressPills
                  steps={selectedTemplate.steps}
                  activeStepIndex={activeStepIndex}
                  onSelectStep={handleSelectStep}
                />
              </div>
            </div>

            {/* Center Area: 3D Floating Dual Mockup (Laptop Terminal + Target Screen) */}
            <div className="relative flex-1 flex items-center justify-center">
              <FloatingDeviceStage
                template={selectedTemplate}
                currentTime={currentTime}
                activeStepIndex={activeStepIndex}
              />

              {/* Dynamic Kinetic Subtitle Layer (Large, Bold, Colored Keywords like "LAPTOP") */}
              <div className="absolute bottom-6 left-3 right-24 z-30">
                <div className="text-left font-sans font-black tracking-tight leading-none drop-shadow-2xl">
                  {currentSegment?.captionWords?.map((item, idx) => {
                    const isWordActive = currentTime >= item.start && currentTime <= item.end;
                    const isPassed = currentTime > item.end;

                    return (
                      <span
                        key={idx}
                        className={`inline-block mr-1.5 transition-all duration-100 ${
                          item.isHighlight
                            ? 'text-3xl sm:text-4xl font-extrabold uppercase'
                            : 'text-xl sm:text-2xl font-bold text-white'
                        } ${
                          isWordActive
                            ? 'scale-110 drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]'
                            : isPassed
                            ? 'opacity-90'
                            : 'opacity-40'
                        }`}
                        style={{
                          color: item.isHighlight ? (item.color || '#38bdf8') : undefined
                        }}
                      >
                        {item.word}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Talking Head Marcus Cutout in Bottom-Right Corner (Matching IMG_6716) */}
              <div className="absolute bottom-3 right-3 z-30 flex flex-col items-center">
                <div className="relative">
                  {/* Audio reactive glow ring */}
                  <motion.div
                    animate={
                      isSpeaking
                        ? { scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }
                        : { scale: 1, opacity: 0.2 }
                    }
                    transition={{ duration: 0.45, repeat: Infinity }}
                    className="absolute -inset-2 rounded-full border-2 border-red-500 bg-red-600/20"
                  />
                  {/* Avatar Circle */}
                  <motion.div
                    animate={
                      isSpeaking
                        ? {
                            y: [0, -3.5, 0.6, -2, 0],
                            scale: [1, 1.05, 0.99, 1.04, 1],
                            rotate: [0, -1, 0.8, -0.5, 0]
                          }
                        : isPlaying
                        ? { y: [0, -1, 0] }
                        : { y: 0, scale: 1, rotate: 0 }
                    }
                    transition={{ duration: isSpeaking ? 0.42 : 1.4, repeat: Infinity }}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-red-500 bg-neutral-900 shadow-2xl relative z-10"
                  >
                    <img
                      src={avatarUrl}
                      alt="Marcus Leng"
                      className="w-full h-full object-cover"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </motion.div>

                  {/* Audio Volume Icon Badge */}
                  <div className="absolute -bottom-1 -right-1 z-20 w-6 h-6 rounded-full bg-black/90 border border-white/20 flex items-center justify-center text-white shadow-lg">
                    {isSpeaking ? (
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5 text-white/40" />
                    )}
                  </div>
                </div>
              </div>

              {/* Outro Call To Action Overlay: Comment for Link in Messenger / Inbox */}
              <CtaBannerOverlay
                keyword={ctaKeyword}
                platform={ctaPlatform}
                repoUrl={selectedTemplate.repoUrl}
                repoName={selectedTemplate.repoName}
                isVisible={isCtaVisible}
              />
            </div>

            {/* Bottom Timeline Progress Bar */}
            <div className="p-2.5 z-40 bg-gradient-to-t from-black via-black/80 to-transparent">
              <div className="flex items-center justify-between text-[9px] font-mono text-white/50 mb-1">
                <span>{currentTime.toFixed(1)}s</span>
                <span className="text-amber-300 font-bold">
                  {isCtaVisible ? 'CTA OUTRO BEAT' : `STEP ${activeStepIndex + 1}: ${selectedTemplate.steps[activeStepIndex]?.label}`}
                </span>
                <span>{selectedTemplate.totalDuration}s</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-blue-500 transition-all duration-100"
                  style={{ width: `${(currentTime / selectedTemplate.totalDuration) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Player Media Controls Bar */}
          <div className="w-full max-w-[380px] mt-3 flex items-center justify-between gap-2 p-2 rounded-2xl bg-neutral-900/90 border border-white/10 shadow-lg">
            <button
              onClick={togglePlay}
              className="cursor-pointer px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-red-950/60"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play Short</span>
                </>
              )}
            </button>

            <button
              onClick={resetPlay}
              className="cursor-pointer p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 text-xs">
              {[1.0, 1.25, 1.5].map(rate => (
                <button
                  key={rate}
                  onClick={() => setPlaybackRate(rate)}
                  className={`cursor-pointer px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
                    playbackRate === rate
                      ? 'bg-blue-600 text-white'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            <button
              onClick={() => copyToClipboard(selectedTemplate.repoUrl, 'repo_url')}
              className="cursor-pointer px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-[11px] font-medium flex items-center gap-1 transition-colors"
            >
              {copiedKey === 'repo_url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Link</span>
            </button>

            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="cursor-pointer px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
              title="Calibrate Studio Voice & Remove Robotic Tones"
            >
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span>Voice</span>
            </button>

            <button
              onClick={() => setIsVoxCpmModalOpen(true)}
              className="cursor-pointer px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 text-amber-300 border border-orange-500/40 text-[11px] font-black flex items-center gap-1 transition-all shadow-sm"
              title="OpenBMB VoxCPM 48kHz Tokenizer-Free Studio Engine"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span>VoxCPM</span>
              <span className="text-[9px] font-mono text-amber-200 bg-amber-500/30 px-1 rounded">48k</span>
            </button>
          </div>
        </div>

        {/* Right Column: Detailed Panels (Tabs: Monetization Playbook, Lead Gen CTA, Hypit DSL) */}
        <div className="flex-1 w-full max-w-xl space-y-4">
          {activeTab === 'preview' && (
            <div className="space-y-4">
              {/* Repo Summary Card */}
              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-red-400">
                      FEATURED OPEN SOURCE REPO
                    </span>
                    <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                      <span>{selectedTemplate.owner} / {selectedTemplate.repoName}</span>
                      <a
                        href={selectedTemplate.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/40 hover:text-white"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </h2>
                    <p className="text-xs text-white/60 mt-1">{selectedTemplate.tagline}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs">
                      ★ {selectedTemplate.stars.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 3 Steps Overview */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="text-[10px] uppercase font-bold text-white/40 font-mono">
                    3-Step Demonstration Pacing:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {selectedTemplate.steps.map((st, i) => (
                      <div
                        key={st.id}
                        onClick={() => handleSelectStep(i)}
                        className={`cursor-pointer p-2.5 rounded-xl border text-left transition-all ${
                          i === activeStepIndex
                            ? 'bg-blue-600/20 border-blue-500/60 text-white'
                            : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                          <span className="text-blue-400">STEP {st.stepNumber}</span>
                          <span>{st.timeSec}s</span>
                        </div>
                        <p className="text-xs font-bold text-white leading-tight">{st.label}</p>
                        <p className="text-[10px] text-white/50 mt-1 font-mono truncate">{st.commandSnippet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Monetization Angle Highlight */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-neutral-900 to-neutral-900 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-extrabold uppercase tracking-wide text-amber-300">
                      Primary Money-Making Blueprint
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs">
                    {selectedMonetization.monthlyPotential}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{selectedMonetization.title}</h3>
                <p className="text-xs text-white/70">{selectedMonetization.pitchScript}</p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-white/50 font-mono">
                  <span>Model: {selectedMonetization.model}</span>
                  <span>Pricing: {selectedMonetization.pricingExample}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'monetization' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-1">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>3 Ways to Monetize This Open Source Repo</span>
                </h3>
                <p className="text-xs text-white/50">
                  Select a business angle to tailor Marcus's script and call-to-action delivery.
                </p>
              </div>

              {selectedTemplate.monetizationAngles.map(angle => (
                <div
                  key={angle.id}
                  onClick={() => setSelectedMonetization(angle)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all space-y-2 ${
                    selectedMonetization.id === angle.id
                      ? 'bg-amber-950/30 border-amber-500/60 ring-2 ring-amber-500/20 shadow-lg'
                      : 'bg-neutral-900/70 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-white/10 text-white/80 text-[10px] font-mono font-bold uppercase">
                      {angle.model}
                    </span>
                    <span className="text-emerald-400 font-mono font-black text-xs">
                      {angle.monthlyPotential}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white">{angle.title}</h4>
                  <p className="text-xs text-white/70 leading-relaxed">{angle.pitchScript}</p>
                  <div className="pt-1.5 flex items-center justify-between text-[11px] text-white/50 font-mono border-t border-white/5">
                    <span>Target: {angle.targetClient}</span>
                    <span className="text-amber-300 font-bold">{angle.pricingExample}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'cta' && (
            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-blue-500/30 space-y-4">
              <div>
                <div className="flex items-center gap-2 text-blue-400">
                  <MessageSquare className="w-4 h-4" />
                  <h3 className="text-sm font-extrabold uppercase tracking-wide">
                    Comment-to-DM Call To Action Settings
                  </h3>
                </div>
                <p className="text-xs text-white/60 mt-1">
                  When viewers comment your trigger word, your ManyChat or Instagram bot automatically delivers the direct GitHub link and setup script to their Inbox.
                </p>
              </div>

              {/* Trigger Keyword & Platform Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-white/50">Trigger Keyword</label>
                  <input
                    type="text"
                    value={ctaKeyword}
                    onChange={e => setCtaKeyword(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 rounded-xl bg-black/80 border border-white/15 text-xs text-cyan-300 font-mono font-black uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-white/50">Delivery Platform</label>
                  <select
                    value={ctaPlatform}
                    onChange={e => setCtaPlatform(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl bg-black/80 border border-white/15 text-xs text-white font-semibold"
                  >
                    <option value="Messenger">Facebook Messenger</option>
                    <option value="Inbox">Direct Inbox</option>
                    <option value="Instagram DM">Instagram DM</option>
                  </select>
                </div>
              </div>

              {/* Ready-to-Paste Pinned Comment Copy */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">
                    Ready-To-Paste Pinned Comment:
                  </span>
                  <button
                    onClick={() => copyToClipboard(`👇 Comment "${ctaKeyword}" below and I'll DM you the direct GitHub link (${selectedTemplate.repoName}), 1-click setup script, and monetization blueprint straight to your ${ctaPlatform}!`, 'pinned_comment')}
                    className="cursor-pointer text-[10px] text-white/70 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'pinned_comment' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'pinned_comment' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-white/80 font-mono leading-relaxed bg-neutral-950 p-2.5 rounded-lg border border-white/5">
                  👇 Comment "{ctaKeyword}" below and I'll DM you the direct GitHub link ({selectedTemplate.repoName}), 1-click setup script, and monetization blueprint straight to your {ctaPlatform}!
                </p>
              </div>

              {/* Ready-to-Paste Post Caption */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold text-blue-400">
                    Viral Video Post Caption:
                  </span>
                  <button
                    onClick={() => copyToClipboard(`${selectedTemplate.problemHook}\n\nHere is how to set up ${selectedTemplate.repoName} in 3 steps.\n\n💬 Comment "${ctaKeyword}" to get the repo link + setup script delivered to your ${ctaPlatform}!\n\n${selectedTemplate.hashtags.join(' ')}`, 'caption')}
                    className="cursor-pointer text-[10px] text-white/70 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'caption' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'caption' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-white/70 font-mono leading-relaxed bg-neutral-950 p-2.5 rounded-lg border border-white/5 line-clamp-4">
                  {selectedTemplate.problemHook}
                  <br /><br />
                  💬 Comment "{ctaKeyword}" to get the repo link + setup script delivered to your {ctaPlatform}!
                  <br /><br />
                  {selectedTemplate.hashtags.join(' ')}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              {/* Hypit DSL Export */}
              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-bold text-white uppercase font-mono">
                      Hypit Video DSL JSON
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(hypitDslJson, 'hypit_dsl')}
                    className="cursor-pointer px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1"
                  >
                    {copiedKey === 'hypit_dsl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'hypit_dsl' ? 'Copied' : 'Copy DSL'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-black/95 text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-56 leading-relaxed border border-white/10">
                  {hypitDslJson}
                </pre>
              </div>

              {/* Remotion React Composition Export */}
              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white uppercase font-mono">
                      Remotion 9:16 JSX Script
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(remotionCodeSnippet, 'remotion_code')}
                    className="cursor-pointer px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1"
                  >
                    {copiedKey === 'remotion_code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'remotion_code' ? 'Copied' : 'Copy JSX'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-black/95 text-[10px] font-mono text-cyan-300 overflow-x-auto max-h-48 leading-relaxed border border-white/10">
                  {remotionCodeSnippet}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Voice Studio Calibration Modal */}
      <VoiceStudioModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />

      {/* OpenBMB VoxCPM 2.0 Studio Modal */}
      <VoxCpmStudioModal
        isOpen={isVoxCpmModalOpen}
        onClose={() => setIsVoxCpmModalOpen(false)}
      />
    </div>
  );
};
