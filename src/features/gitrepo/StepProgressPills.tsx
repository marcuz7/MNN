import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { RepoStep } from './types';

interface StepProgressPillsProps {
  steps: RepoStep[];
  activeStepIndex: number;
  onSelectStep?: (index: number) => void;
}

export const StepProgressPills: React.FC<StepProgressPillsProps> = ({
  steps,
  activeStepIndex,
  onSelectStep
}) => {
  return (
    <div className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-1 select-none overflow-x-auto no-scrollbar">
      {steps.map((step, idx) => {
        const isPast = idx < activeStepIndex;
        const isActive = idx === activeStepIndex;
        const isUpcoming = idx > activeStepIndex;

        return (
          <button
            key={step.id || idx}
            type="button"
            onClick={() => onSelectStep?.(idx)}
            className={`cursor-pointer transition-all duration-200 group flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap shadow-md ${
              isActive
                ? 'bg-[#1a56db] text-white border border-blue-400/80 shadow-blue-900/60 ring-2 ring-blue-500/30'
                : isPast
                ? 'bg-[#1e293b]/90 text-blue-200/90 border border-blue-500/40'
                : 'bg-black/60 text-white/40 border border-white/10 hover:border-white/30'
            }`}
          >
            {/* Step Icon / Number Indicator */}
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                isActive
                  ? 'bg-white text-blue-700'
                  : isPast
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/60'
              }`}
            >
              {isPast ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : step.stepNumber}
            </span>

            {/* Step Label */}
            <span className="tracking-tight">{step.label}</span>

            {/* Active Glow Dot */}
            {isActive && (
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-cyan-300 ml-0.5"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
