import React, { useState } from 'react';
import { 
  Rss, Globe, UserCheck, Youtube, Play, Sparkles, ShieldCheck, Flame, 
  DollarSign, Mic, Film, BookOpen, Menu, X, ChevronRight 
} from 'lucide-react';
import { VoxCpmStudioModal } from '../features/voxcpm/VoxCpmStudioModal';

interface MNNNavBarProps {
  currentView: 'home' | 'player' | 'generating' | 'radar' | 'reaction' | 'gitrepo' | 'stepps' | 'feeds' | 'review' | 'youtube' | 'editor' | 'vibe';
  onNavigate: (view: 'home' | 'player' | 'radar' | 'reaction' | 'gitrepo' | 'stepps' | 'feeds' | 'review' | 'youtube' | 'editor' | 'vibe') => void;
}

export const MNNNavBar: React.FC<MNNNavBarProps> = ({ currentView, onNavigate }) => {
  const [isVoxCpmOpen, setIsVoxCpmOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'home',
      label: 'Topic Gen',
      badge: 'Prompt AI',
      icon: Sparkles,
      desc: 'Prompt-based custom AI radio show generator'
    },
    {
      id: 'vibe',
      label: 'Vibe Knowledge',
      badge: 'andyhuo520',
      icon: BookOpen,
      desc: 'Single knowledge point to kinetic short educational video with verified citations'
    },
    {
      id: 'editor',
      label: 'Video Editor',
      badge: 'Diffusion',
      icon: Film,
      desc: 'Diffusion Studio multi-track in-browser video editor with VoxCPM 48kHz audio'
    },
    {
      id: 'stepps',
      label: 'STEPPS News',
      badge: 'PRD v1.0',
      icon: ShieldCheck,
      desc: 'Immutable verified facts, STEPPS diagnosis & 3-angle generation'
    },
    {
      id: 'gitrepo',
      label: 'Git Repo Money',
      badge: '9:16 Shorts',
      icon: DollarSign,
      desc: 'Marcus Git Repo Money Making 9:16 channel template with ManyChat CTA'
    },
    {
      id: 'reaction',
      label: 'Reaction Clip',
      badge: 'Hypit DSL',
      icon: Flame,
      desc: 'Viral video replicate & avatar pseudo reaction studio'
    },
    {
      id: 'radar',
      label: 'News Radar',
      badge: '3-Story Pick',
      icon: Rss,
      desc: 'Scanned AI story clusters & multi-story broadcast picker'
    },
    {
      id: 'feeds',
      label: 'Feeds',
      badge: 'GitHub/X/Substack',
      icon: Globe,
      desc: 'Active RSS feeds & polling diagnostics'
    },
    {
      id: 'review',
      label: 'Review Studio',
      badge: 'Gate A',
      icon: UserCheck,
      desc: 'Supervised approval, script timeline & 16:9 canvas'
    },
    {
      id: 'youtube',
      label: 'YouTube Hub',
      badge: 'Distribution',
      icon: Youtube,
      desc: 'Channel linking & supervised private-first queue'
    },
    {
      id: 'player',
      label: 'Broadcast Stage',
      badge: '16-Bit',
      icon: Play,
      desc: 'Pixel Marcus 24/7 retro player'
    }
  ] as const;

  const handleSelectNav = (id: any) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-neutral-950/95 backdrop-blur-md border-b border-red-500/20 shrink-0 z-40 px-3 sm:px-6 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Official MNN Brand Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSelectNav('home')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
            title="Marcus News Network - Return Home"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-red-600 via-red-700 to-amber-700 flex flex-col items-center justify-center font-black text-white shadow-lg shadow-red-950/80 group-hover:scale-105 transition-all border border-red-400/40">
                <span className="text-[11px] sm:text-[12px] tracking-tighter leading-none font-sans font-black">MNN</span>
                <span className="text-[5px] sm:text-[6px] tracking-widest text-amber-200 uppercase leading-none font-mono mt-0.5">NEWS</span>
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-neutral-950 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black tracking-wider text-white uppercase font-sans group-hover:text-red-400 transition-colors">
                  Marcus News Network
                </span>
                <span className="hidden xl:inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-500/15 border border-red-500/30 text-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  SUPERVISED V1.2
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-white/50 font-medium hidden md:block">
                RSS · GitHub · X.com · Substack · 90s Broadcast
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation - Clean wrapping & compact styling */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 flex-wrap justify-end">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isTopicGen = item.id === 'home';
            return (
              <button
                key={item.id}
                onClick={() => handleSelectNav(item.id)}
                title={item.desc}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                  isActive
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/50'
                    : isTopicGen
                    ? 'bg-gradient-to-r from-red-950/60 to-neutral-900 text-amber-300 hover:text-white hover:bg-red-900/40 border-amber-500/40 shadow-sm'
                    : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : isTopicGen ? 'text-amber-400' : 'text-white/60'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1 py-0.2 rounded hidden 2xl:inline-block ${
                      isActive
                        ? 'bg-black/30 text-white/90'
                        : isTopicGen
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-white/5 text-white/40'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action strip (VoxCPM + Hamburger) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVoxCpmOpen(true)}
            className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 px-2.5 sm:px-3 py-1.5 rounded-xl cursor-pointer transition-all shadow-sm"
            title="OpenBMB VoxCPM 48kHz Voice Synthesis Studio"
          >
            <Mic className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">VoxCPM Voice</span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/30 text-amber-200">
              48kHz
            </span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-red-400" /> : <Menu className="w-5 h-5 text-neutral-300" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-2 pt-2 border-t border-neutral-800 bg-neutral-950/98 rounded-2xl p-3 shadow-2xl animate-in slide-in-from-top-2 duration-150">
          <div className="text-[10px] font-mono text-neutral-500 uppercase px-2 mb-2">
            MNN Studio Navigation ({navItems.length} Sections)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[70vh] overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectNav(item.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-red-600 text-white border border-red-500'
                      : 'bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-neutral-400" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/40 text-neutral-400">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-normal text-neutral-400 line-clamp-1">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* OpenBMB VoxCPM Studio Modal */}
      <VoxCpmStudioModal
        isOpen={isVoxCpmOpen}
        onClose={() => setIsVoxCpmOpen(false)}
      />
    </header>
  );
};
