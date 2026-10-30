import React from 'react';
import { motion } from 'motion/react';
import { Terminal, Tv, Sparkles, CheckCircle2, ShieldCheck, Wifi, Flame } from 'lucide-react';
import { GitRepoVideoTemplate } from './types';

interface FloatingDeviceStageProps {
  template: GitRepoVideoTemplate;
  currentTime: number;
  activeStepIndex: number;
}

export const FloatingDeviceStage: React.FC<FloatingDeviceStageProps> = ({
  template,
  currentTime,
  activeStepIndex
}) => {
  // Current active step command snippet
  const activeStep = template.steps[activeStepIndex] || template.steps[0];

  return (
    <div className="relative w-full h-[280px] sm:h-[320px] flex items-center justify-center overflow-hidden my-1 select-none">
      {/* Background Tech Studio Grid & Radial Glow */}
      <div className="absolute inset-0 bg-radial from-blue-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Floating Target Device Screen (e.g. Smart TV, Mobile UI, or Output Dashboard) */}
      <motion.div
        animate={{ y: [0, -6, 0], rotate: [2, 1.5, 2] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ perspective: 1000 }}
        className="absolute top-2 right-2 sm:right-6 w-[200px] sm:w-[240px] z-10"
      >
        <div className="relative rounded-xl overflow-hidden border-2 border-neutral-700/80 bg-neutral-900 shadow-2xl shadow-black/80">
          {/* Smart TV / Screen Top Bezel Bar */}
          <div className="px-2.5 py-1 bg-black/90 flex items-center justify-between text-[9px] font-mono text-white/60 border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="font-semibold text-white/80">Google TV 4K</span>
            </div>
            <div className="flex items-center gap-1 text-[8px] text-amber-400 font-bold">
              <Wifi className="w-2.5 h-2.5" />
              <span>ADB 5555</span>
            </div>
          </div>

          {/* Screen Content Showcase */}
          <div className="relative h-[110px] sm:h-[130px] bg-neutral-950 overflow-hidden flex flex-col justify-between p-2.5">
            {/* TV Navigation Bar */}
            <div className="flex items-center justify-between text-[8px] font-medium text-white/50 border-b border-white/5 pb-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">For you</span>
                <span>Movies</span>
                <span>Shows</span>
                <span>Apps</span>
                <span>Library</span>
              </div>
              <span className="font-mono text-white/30">7:42 PM</span>
            </div>

            {/* Smart TV Banner: "The All New Horizon SUV" from reference image IMG_6716 */}
            <div className="relative my-auto rounded-lg overflow-hidden border border-white/10 bg-gradient-to-r from-neutral-900 via-neutral-850 to-neutral-900 p-2 shadow-inner">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1">
                    <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[7px] font-bold uppercase tracking-wider">
                      Sponsored
                    </span>
                    <span className="text-[7px] text-red-400 font-mono font-bold animate-pulse">
                      [BLOCKED BY REPO]
                    </span>
                  </div>
                  <h4 className="text-[10px] sm:text-[11px] font-black text-white leading-tight mt-0.5 line-clamp-1">
                    The All New Horizon SUV
                  </h4>
                  <p className="text-[8px] text-white/50">Built for every road. Test drive today.</p>
                </div>
                {/* Mini Car/Ad Graphic */}
                <div className="w-10 h-7 rounded bg-red-950/40 border border-red-500/30 flex items-center justify-center shrink-0">
                  <span className="text-[8px] text-red-300 font-bold">4K AD</span>
                </div>
              </div>

              {/* Red Strike-Through when Debloater Step is Active */}
              {activeStepIndex >= 2 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className="absolute inset-0 bg-red-600/30 backdrop-blur-[1px] flex items-center justify-center border-2 border-red-500"
                >
                  <span className="px-2 py-0.5 bg-red-600 text-white font-mono font-black text-[9px] rounded shadow-lg uppercase tracking-wider">
                    ✓ AD PURGED
                  </span>
                </motion.div>
              )}
            </div>

            {/* TV Bottom Apps Strip */}
            <div className="flex items-center gap-1.5 pt-1">
              {['Netflix', 'YouTube', 'Prime', 'Plex', 'Kodi'].map((app, i) => (
                <div
                  key={app}
                  className={`px-1.5 py-0.5 rounded text-[7px] font-medium border ${
                    i === 1
                      ? 'bg-red-600/30 border-red-500/60 text-white'
                      : 'bg-white/5 border-white/10 text-white/60'
                  }`}
                >
                  {app}
                </div>
              ))}
            </div>
          </div>

          {/* TV Bottom Stand Bar */}
          <div className="h-1.5 bg-neutral-800 w-full flex items-center justify-center">
            <div className="w-12 h-0.5 bg-neutral-600 rounded-full" />
          </div>
        </div>
      </motion.div>

      {/* Floating Wireless ADB Bridge Beam (Connecting Laptop to TV) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
        <defs>
          <linearGradient id="beamGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <motion.path
          d="M 140 220 C 180 180, 210 130, 270 95"
          fill="none"
          stroke="url(#beamGradient)"
          strokeWidth="2"
          strokeDasharray="4 4"
          animate={{ strokeDashoffset: [0, -24] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </svg>

      {/* Floating Laptop Mockup with Interactive Terminal Window */}
      <motion.div
        animate={{ y: [0, -4, 0], rotate: [-2, -2.5, -2] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-2 left-2 sm:left-4 w-[220px] sm:w-[260px] z-20"
      >
        {/* Laptop Screen Bezel */}
        <div className="rounded-t-xl bg-neutral-900 border-2 border-neutral-700 p-1.5 shadow-2xl shadow-black">
          {/* Terminal Title Bar */}
          <div className="flex items-center justify-between pb-1 px-1 border-b border-neutral-800">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500/80 inline-block" />
              <span className="w-2 h-2 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2 h-2 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-[8px] font-mono text-white/50 ml-1">tv-claude</span>
            </div>
            <div className="flex items-center gap-1 text-[7px] font-mono text-emerald-400">
              <Terminal className="w-2.5 h-2.5" />
              <span>BASH</span>
            </div>
          </div>

          {/* Terminal Screen Body */}
          <div className="h-[95px] sm:h-[110px] bg-black/95 rounded p-2 font-mono text-[8px] sm:text-[9px] text-emerald-400 overflow-hidden flex flex-col justify-between">
            <div className="space-y-1">
              <div className="text-white/80">
                <span className="text-blue-400 font-bold">{template.terminalPrompt}</span>
                <span className="text-amber-300 font-semibold">{activeStep.commandSnippet}</span>
              </div>
              <div className="text-[7px] text-white/60 leading-tight">
                {template.terminalOutput[Math.min(activeStepIndex, template.terminalOutput.length - 1)]}
              </div>
              {activeStepIndex >= 1 && (
                <div className="text-[7px] text-cyan-300 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  <span>ADB handshake verified (192.168.1.145)</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[7px] text-white/40 pt-1 border-t border-white/10">
              <span>{template.repoName}</span>
              <span className="text-emerald-400 font-bold">READY</span>
            </div>
          </div>
        </div>

        {/* Laptop Metallic Base / Keyboard Deck */}
        <div className="h-2.5 bg-gradient-to-b from-neutral-600 via-neutral-700 to-neutral-800 rounded-b-md shadow-lg border-t border-white/20 flex items-center justify-center">
          <div className="w-10 h-1 bg-neutral-900/80 rounded-t-sm" />
        </div>
      </motion.div>
    </div>
  );
};
