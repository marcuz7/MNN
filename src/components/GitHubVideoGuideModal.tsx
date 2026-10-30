import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, BookOpen, ExternalLink, Code2, Copy, Check, Sparkles, Layers,
  Terminal, Video, Cpu, ArrowRight, Zap, CheckCircle2, ShieldAlert
} from 'lucide-react';

interface GitHubVideoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GitHubVideoGuideModal({ isOpen, onClose }: GitHubVideoGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'repos' | 'news_skill' | 'recipes'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-5xl bg-neutral-950 border border-red-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-red-500/20 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>AI Video Generation &amp; GitHub Stack Blueprint</span>
                <span className="px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 text-[10px] font-black uppercase tracking-wider border border-red-500/40">
                  Engineering Guide
                </span>
              </h3>
              <p className="text-xs text-white/50 font-medium">
                Remotion vs HyperFrames, Wan2GP, MoneyPrinterTurbo, and mvanhorn/last30days-skill
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-white/5 bg-neutral-950 flex items-center gap-2 overflow-x-auto scrollbar-hide py-2">
          {[
            { id: 'overview', label: '1. Video Pipeline Blueprint' },
            { id: 'comparison', label: '2. Remotion vs HyperFrames' },
            { id: 'repos', label: '3. GitHub Repos Stack' },
            { id: 'news_skill', label: '4. last30days AI News Skill' },
            { id: 'recipes', label: '5. CLI & Code Recipes' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white font-extrabold shadow-md shadow-red-950/50'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm font-sans leading-relaxed text-white/80">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 space-y-2">
                <h4 className="text-sm font-bold text-red-300 uppercase tracking-wide flex items-center gap-2">
                  <Zap className="w-4 h-4 text-red-400" />
                  How Modern AI News Channels (like Marcus News Network - MNN) Generate Continuous Video
                </h4>
                <p className="text-xs text-white/70">
                  Full AI video generation operates in a 5-step automated pipeline running locally or on cloud workers for under $5/day:
                </p>
              </div>

              {/* 5-Step Visual Flowchart */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold font-mono">1</div>
                  <div className="font-bold text-white">Source News</div>
                  <p className="text-[11px] text-white/50">Scrape trending AI breakthroughs using <code>last30days-skill</code> (Reddit, GitHub, X, HN).</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono">2</div>
                  <div className="font-bold text-white">Script &amp; Parody</div>
                  <p className="text-[11px] text-white/50">Gemini 2.5 Flash crafts satirical 16-bit news banter with anchor Marcus Leng &amp; correspondents.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold font-mono">3</div>
                  <div className="font-bold text-white">Voice &amp; Audio</div>
                  <p className="text-[11px] text-white/50">Edge-TTS / ElevenLabs synthesizes vintage news voices; Lyria generates 16-bit chiptune stingers.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold font-mono">4</div>
                  <div className="font-bold text-white">Video Frames</div>
                  <p className="text-[11px] text-white/50">Wan2GP or LongCat-Video generates B-roll; Remotion or HTML canvas animates Marcus Leng's anchor desk.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono">5</div>
                  <div className="font-bold text-white">Repurpose &amp; Publish</div>
                  <p className="text-[11px] text-white/50">OpenShorts cuts 9:16 vertical clips with auto captions; YouTube Data API uploads 24/7.</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-white text-sm">Quick Choice: What Tool Should You Use Right Now?</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-900 border border-white/5 flex items-start gap-3">
                    <span className="font-bold text-emerald-400 shrink-0">1-Click Fast Video:</span>
                    <span>Use <strong>MoneyPrinterTurbo</strong>. It takes one prompt or news topic, fetches script, voiceover, subtitles, and stock footage, and outputs an MP4 in 60 seconds.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-white/5 flex items-start gap-3">
                    <span className="font-bold text-cyan-400 shrink-0">Custom Broadcast Brand:</span>
                    <span>Use <strong>Remotion</strong>. Write your UI layout in React (as in this app), animate the avatar, scanlines, and audio waves frame-by-frame, and render at 60fps.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-white/5 flex items-start gap-3">
                    <span className="font-bold text-amber-400 shrink-0">Autonomous AI Agent:</span>
                    <span>Use <strong>HyperFrames</strong>. Ideal if an LLM is generating HTML/CSS code on the fly and you want instant programmatic video without a React bundler.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REMOTION VS HYPERFRAMES */}
          {activeTab === 'comparison' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 space-y-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                  Remotion vs. HyperFrames: Which One Is Better?
                </h4>
                <p className="text-xs text-white/70">
                  Both compose video programmatically from web code, but they serve two distinct architectural paradigms:
                </p>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-xs text-left">
                  <thead className="bg-white/5 text-white/90 border-b border-white/10 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Feature</th>
                      <th className="p-3.5 text-cyan-400">Remotion (React-Native)</th>
                      <th className="p-3.5 text-purple-400">HyperFrames (Agent-Native)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/75 font-mono">
                    <tr>
                      <td className="p-3.5 font-bold text-white font-sans">Core Philosophy</td>
                      <td className="p-3.5">Video as React components with hooks (<code>useCurrentFrame</code>, <code>interpolate</code>).</td>
                      <td className="p-3.5">Video as pure HTML/CSS timeline tags rendered by an agent.</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-white font-sans">Maturity &amp; Community</td>
                      <td className="p-3.5 text-emerald-400">★★★★★ Production-tested by thousands of SaaS apps, YouTube automation tools.</td>
                      <td className="p-3.5 text-amber-400">★★★☆☆ Modern, agent-focused experiment; actively evolving.</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-white font-sans">Audio Reactivity</td>
                      <td className="p-3.5 text-emerald-400">Built-in audio FFT analyzer, waveform visualizers, beat sync.</td>
                      <td className="p-3.5">Basic audio tracks via HTML <code>&lt;audio&gt;</code>.</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-white font-sans">Renderer Backend</td>
                      <td className="p-3.5">Headless Chromium + WebGL + FFmpeg pipe.</td>
                      <td className="p-3.5">Browser snapshotting engine.</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-white font-sans">Best For</td>
                      <td className="p-3.5 font-sans font-bold text-white">Full web apps, podcast video generators, complex animations, Tailwind CSS.</td>
                      <td className="p-3.5 font-sans font-bold text-white">Autonomous LLM coding agents outputting declarative HTML without React.</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-white font-sans">Verdict</td>
                      <td className="p-3.5 text-cyan-300 font-sans font-bold">WINNER for MNN: Reuse your existing React components &amp; Tailwind styles directly!</td>
                      <td className="p-3.5 text-purple-300 font-sans font-bold">Great lightweight alternative if you want zero npm dependencies.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-1 text-cyan-200">
                <span className="font-bold text-white">Our Recommendation:</span> For Marcus Leng News Network (MNN), <strong>Remotion</strong> is superior because you already have the 16-bit avatar, spectrum bars, and crawler in React. You can directly copy your React JSX into a Remotion composition.
              </div>
            </div>
          )}

          {/* TAB 3: GITHUB REPOS STACK */}
          {activeTab === 'repos' && (
            <div className="space-y-4">
              <p className="text-xs text-white/60">
                Here is the verified breakdown of every GitHub repository in the AI video ecosystem:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* 1. Generation: Wan2GP & LongCat */}
                <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold uppercase">GENERATION</span>
                    <span className="text-[10px] text-white/40 font-mono">Local / GPU</span>
                  </div>
                  <h5 className="font-bold text-white text-sm">Wan2GP &amp; LongCat-Video</h5>
                  <p className="text-white/60 text-[11px]">
                    <strong>Wan2GP:</strong> Lightweight inference for Alibaba's Wan 2.1 video model on consumer NVIDIA RTX cards (under 12GB VRAM).<br />
                    <strong>LongCat-Video:</strong> Generates seamless, ultra-long coherent video scenes using latent flow without degrading into glitch artifacts.
                  </p>
                </div>

                {/* 2. Quick Video: MoneyPrinterTurbo */}
                <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold uppercase">QUICK VIDEO</span>
                    <span className="text-[10px] text-white/40 font-mono">1-Click Shorts</span>
                  </div>
                  <h5 className="font-bold text-white text-sm">MoneyPrinterTurbo</h5>
                  <p className="text-white/60 text-[11px]">
                    The leading open-source end-to-end automated video engine. Type a prompt &rarr; generates script with LLM &rarr; synthesizes TTS &rarr; matches high-definition video B-roll &rarr; adds karaoke-style animated subtitles &rarr; exports TikTok/Shorts MP4.
                  </p>
                </div>

                {/* 3. Reference: Hypit */}
                <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold uppercase">REFERENCE</span>
                    <span className="text-[10px] text-white/40 font-mono">Style Anchoring</span>
                  </div>
                  <h5 className="font-bold text-white text-sm">Hypit</h5>
                  <p className="text-white/60 text-[11px]">
                    Maintains visual character consistency across sequential video generations by using reference anchors (e.g. keeping Marcus Leng's pixel jacket and hair identical across every scene).
                  </p>
                </div>

                {/* 4. Repurpose: OpenShorts */}
                <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold uppercase">REPURPOSE</span>
                    <span className="text-[10px] text-white/40 font-mono">Clips &amp; Reels</span>
                  </div>
                  <h5 className="font-bold text-white text-sm">OpenShorts</h5>
                  <p className="text-white/60 text-[11px]">
                    Takes long horizontal broadcast videos (like a full 5-minute MNN episode), detects active faces using computer vision, crops to vertical 9:16, extracts punchy soundbites, and burns word-level animated subtitles.
                  </p>
                </div>

                {/* 5. Edit / Repair: video-use */}
                <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold uppercase">EDIT / REPAIR</span>
                    <span className="text-[10px] text-white/40 font-mono">Post-Processing</span>
                  </div>
                  <h5 className="font-bold text-white text-sm">video-use</h5>
                  <p className="text-white/60 text-[11px]">
                    CLI suite for AI-based video repair, inpainting unwanted watermarks, frame interpolation (upscaling 15fps to 60fps), and removing audio silence/filler words.
                  </p>
                </div>

                {/* 6. Explainer: Showtime & Manim */}
                <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold uppercase">EXPLAINER</span>
                    <span className="text-[10px] text-white/40 font-mono">3Blue1Brown Style</span>
                  </div>
                  <h5 className="font-bold text-white text-sm">Showtime / Manim</h5>
                  <p className="text-white/60 text-[11px]">
                    Python animation engine for technical explainers. Renders vector diagrams, neural network graphs, and math visualizers synchronized to narration.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LAST30DAYS AI NEWS SKILL */}
          {activeTab === 'news_skill' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-cyan-400" />
                    mvanhorn/last30days-skill (AI News Summarizer)
                  </h4>
                  <a
                    href="https://github.com/mvanhorn/last30days-skill"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-cyan-400 hover:underline font-mono"
                  >
                    View on GitHub &rarr;
                  </a>
                </div>
                <p className="text-xs text-white/70">
                  This skill allows an AI agent to research and synthesize the top trending AI developments across GitHub, Reddit (r/LocalLLaMA, r/MachineLearning), Twitter/X, and Hacker News over the preceding 30 days.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-white text-xs uppercase tracking-wider">How to Run with Claude Code, Cursor, or Shell:</h5>
                <div className="relative p-3.5 rounded-xl bg-black font-mono text-xs text-cyan-300 border border-white/10 overflow-x-auto">
                  <button
                    onClick={() => copyToClipboard('git clone https://github.com/mvanhorn/last30days-skill\ncd last30days-skill\npip install -r requirements.txt\npython summarize.py --topic "AI open-source models" --days 30', 'clone_skill')}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    {copiedKey === 'clone_skill' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre>
git clone https://github.com/mvanhorn/last30days-skill<br />
cd last30days-skill<br />
pip install -r requirements.txt<br />
python summarize.py --topic "AI open-source models" --days 30
                  </pre>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-2 text-amber-200">
                <div className="font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Direct Prompt Template for MNN (Marcus Leng News Network):
                </div>
                <p className="text-[11px] text-white/75">
                  Once <code>last30days-skill</code> gives you the news summary JSON, paste it into MNN with this prompt:
                </p>
                <div className="p-3 rounded-lg bg-black/60 font-mono text-[11px] text-yellow-300 border border-white/10">
                  "Take these top 3 AI news developments from the last 30 days [PASTE JSON HERE] and generate an MNN Morning Rush satirical 16-bit news broadcast. Anchor Marcus Leng explains the breakthroughs in deadpan parody, with tech correspondent Glitch and an NPC lawsuit."
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CODE RECIPES */}
          {activeTab === 'recipes' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" /> Remotion Composition (React Video Engine)
                  </span>
                  <button
                    onClick={() => copyToClipboard(`import { Composition } from 'remotion';\nimport { MarcusBroadcastStage } from './MarcusBroadcastStage';\n\nexport const Root = () => {\n  return (\n    <Composition\n      id="MNNBroadcast"\n      component={MarcusBroadcastStage}\n      durationInFrames={30 * 60} // 60 seconds @ 30fps\n      fps={30}\n      width={1920}\n      height={1080}\n      defaultProps={{\n        anchorName: 'Marcus Leng',\n        showTitle: 'MNN Morning Rush',\n        audioUrl: '/audio/stream.mp3'\n      }}\n    />\n  );\n};`, 'remotion_recipe')}
                    className="text-[11px] text-white/60 hover:text-white flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg"
                  >
                    {copiedKey === 'remotion_recipe' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy Code</span>
                  </button>
                </div>
                <div className="p-3.5 rounded-xl bg-black font-mono text-[11px] text-cyan-300 border border-white/10 overflow-x-auto">
                  <pre>{`import { Composition } from 'remotion';
import { MarcusBroadcastStage } from './MarcusBroadcastStage';

export const Root = () => {
  return (
    <Composition
      id="MNNBroadcast"
      component={MarcusBroadcastStage}
      durationInFrames={30 * 60} // 60 seconds @ 30fps
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        anchorName: 'Marcus Leng',
        showTitle: 'MNN Morning Rush',
        audioUrl: '/audio/stream.mp3'
      }}
    />
  );
};`}</pre>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-amber-400" /> FFmpeg One-Liner (Mux Audio + Video + Subtitles)
                  </span>
                  <button
                    onClick={() => copyToClipboard('ffmpeg -loop 1 -i pixel_marcus_studio.jpg -i speech_audio.mp3 -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest mnn_broadcast.mp4', 'ffmpeg_recipe')}
                    className="text-[11px] text-white/60 hover:text-white flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg"
                  >
                    {copiedKey === 'ffmpeg_recipe' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy Command</span>
                  </button>
                </div>
                <div className="p-3.5 rounded-xl bg-black font-mono text-[11px] text-amber-300 border border-white/10 overflow-x-auto">
                  <code>ffmpeg -loop 1 -i pixel_marcus_studio.jpg -i speech_audio.mp3 -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest mnn_broadcast.mp4</code>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-red-500/20 bg-neutral-900/60 flex items-center justify-between">
          <span className="text-xs text-white/50 font-mono">
            Marcus Leng News Network • LengShow AI Video Automation
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white text-black font-black uppercase tracking-wider text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </motion.div>
    </div>
  );
}
