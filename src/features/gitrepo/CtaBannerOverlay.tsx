import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Check, Copy, Sparkles, Inbox, ArrowRight } from 'lucide-react';

interface CtaBannerOverlayProps {
  keyword: string;
  platform: 'Messenger' | 'Inbox' | 'Instagram DM';
  repoUrl: string;
  repoName: string;
  isVisible: boolean;
}

export const CtaBannerOverlay: React.FC<CtaBannerOverlayProps> = ({
  keyword,
  platform,
  repoUrl,
  repoName,
  isVisible
}) => {
  const [copied, setCopied] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const pinnedCommentCopy = `👇 Comment "${keyword}" below and I'll DM you the direct GitHub link (${repoName}), 1-click debloat script, and step-by-step setup guide straight to your ${platform}!`;

  const copyComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(pinnedCommentCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute bottom-20 left-3 right-3 z-35"
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-neutral-900 to-blue-600 p-[1.5px] shadow-2xl shadow-red-950/80">
              <div className="bg-neutral-950/95 backdrop-blur-xl rounded-[15px] p-2.5 sm:p-3 flex items-center justify-between gap-2.5">
                {/* Left: Icon & Pitch */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/30">
                    <MessageSquare className="w-5 h-5 animate-bounce" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-black tracking-wider text-amber-300 font-mono">
                        AUTOMATED LEAD GEN
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <p className="text-xs sm:text-sm font-extrabold text-white tracking-tight leading-tight truncate">
                      Comment <span className="text-cyan-300 underline underline-offset-2 font-black">"{keyword}"</span> for Link in {platform}
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsDemoModalOpen(true)}
                    className="cursor-pointer px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 text-[10px] font-bold transition-colors hidden sm:flex items-center gap-1"
                  >
                    <span>Preview DM</span>
                  </button>
                  <button
                    type="button"
                    onClick={copyComment}
                    className="cursor-pointer px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[10px] font-bold transition-all flex items-center gap-1"
                    title="Copy pinned comment for ManyChat / Social posting"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy CTA</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulated Inbox / Messenger Delivery Drawer Modal */}
      <AnimatePresence>
        {isDemoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-neutral-900 border border-blue-500/40 rounded-2xl p-5 shadow-2xl text-white space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-sm">Simulated {platform} Direct Message</h3>
                </div>
                <button
                  onClick={() => setIsDemoModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Chat Bubble Delivery */}
              <div className="bg-black/40 rounded-xl p-3 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-black">M</div>
                  <span className="font-semibold text-white">Marcus Leng Bot</span>
                  <span className="text-[10px] text-white/40">Just now</span>
                </div>
                <p className="text-xs text-white/90 leading-relaxed">
                  Hey! Here is the open-source GitHub repo you requested from my video:
                </p>
                <div className="p-2.5 rounded-lg bg-neutral-800/80 border border-blue-500/30 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-cyan-300 font-mono">{repoName}</p>
                    <p className="text-[10px] text-white/60 truncate">{repoUrl}</p>
                  </div>
                  <a
                    href={repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 rounded bg-blue-600 text-white text-[10px] font-bold flex items-center gap-1"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </a>
                </div>
                <p className="text-[11px] text-emerald-400">
                  ✓ Includes setup instructions & 3-step monetization blueprint!
                </p>
              </div>

              <div className="text-[11px] text-white/50 space-y-1">
                <p className="font-semibold text-white/80">How ManyChat Automation Works:</p>
                <p>1. Post video to TikTok, Instagram Reels, or YouTube Shorts.</p>
                <p>2. Paste the copied CTA into your caption and pin your first comment.</p>
                <p>3. When viewers comment "{keyword}", your bot sends them the direct link automatically!</p>
              </div>

              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
