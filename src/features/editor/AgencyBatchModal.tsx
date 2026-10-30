import React, { useState } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  DollarSign, 
  Check, 
  Copy, 
  X, 
  Video, 
  Layers, 
  TrendingUp, 
  Play, 
  Download,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { AgencyBatchVariant } from './types';

interface AgencyBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadVariant: (variant: AgencyBatchVariant) => void;
}

export const AGENCY_VARIANTS: AgencyBatchVariant[] = [
  {
    id: 'batch-var-1',
    title: 'Aggressive Punch Hook (0-21s)',
    hookAngle: 'Stop building video pipelines from scratch. Here is how DiffusionStudio cuts rendering costs by 80%.',
    targetDurationSec: 21,
    pacingStyle: 'Aggressive Punch',
    startSec: 0,
    endSec: 21,
    clientType: 'SaaS Founders',
    estimatedViews: '150k - 300k'
  },
  {
    id: 'batch-var-2',
    title: 'Speedrun Setup Challenge (0-30s)',
    hookAngle: 'Can you launch a full multi-track in-browser video editor in 3 terminal commands? Watch this.',
    targetDurationSec: 30,
    pacingStyle: 'Speedrun Challenge',
    startSec: 0,
    endSec: 30,
    clientType: 'Content Creators',
    estimatedViews: '250k - 500k'
  },
  {
    id: 'batch-var-3',
    title: 'Agency Gross Margin Breakdown (0-45s)',
    hookAngle: 'How creator agencies charge $3,500/month for automated batch short-form clipping using open source WebCodecs.',
    targetDurationSec: 45,
    pacingStyle: 'Analytical Breakdown',
    startSec: 0,
    endSec: 45,
    clientType: 'E-commerce Brands',
    estimatedViews: '80k - 180k'
  }
];

export const AgencyBatchModal: React.FC<AgencyBatchModalProps> = ({
  isOpen,
  onClose,
  onLoadVariant
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyPitch = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white uppercase tracking-wide">
                  Agency Retainer Batching Engine
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                  $3,500/MO MODEL
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Generate 3 high-retention video variants from a single repository or product in one click.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-emerald-500/10 border border-amber-500/20 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                Agency Monetization Formula
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">
                Batch 10 Videos / Client • $350 Per Batch • 10 Active Retainers = $35k MRR
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Automated multi-track composition with VoxCPM 48kHz voiceover and automated Comment-to-DM lead generation.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {AGENCY_VARIANTS.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">
                      {v.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-zinc-800 text-amber-300 border border-zinc-700">
                      {v.pacingStyle}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-blue-500/20 text-blue-300">
                      {v.targetDurationSec}s
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    "{v.hookAngle}"
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono pt-1">
                    <span>Target: {v.clientType}</span>
                    <span>•</span>
                    <span>Est. Reach: {v.estimatedViews}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopyPitch(v.hookAngle, v.id)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 flex items-center gap-1.5 transition-colors border border-zinc-700/60"
                  >
                    {copiedId === v.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === v.id ? 'Copied' : 'Copy Hook'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onLoadVariant(v);
                      onClose();
                    }}
                    className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-950/40"
                  >
                    <Video className="w-3.5 h-3.5 fill-current" />
                    <span>Load Sequence</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Ready to render all 3 cuts with VoxCPM 48kHz neural voiceover</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
