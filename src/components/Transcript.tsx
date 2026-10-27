import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TranscriptLine } from '../types';

interface TranscriptProps {
  transcript: TranscriptLine[];
  currentTime: number;
  onSeek: (time: number) => void;
}

export function Transcript({ transcript, currentTime, onSeek }: TranscriptProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  const activeIndex = transcript.findIndex(line => currentTime >= line.start && currentTime < line.end);
  const lastIndexRef = useRef<number>(-1);

  useEffect(() => {
    if (activeIndex !== lastIndexRef.current && activeIndex !== -1) {
      const isJump = Math.abs(activeIndex - lastIndexRef.current) > 1;
      lastIndexRef.current = activeIndex;
      
      const container = containerRef.current;
      const element = document.getElementById(`transcript-line-${activeIndex}`);
      
      if (container && element) {
        let targetScrollTop = 0;
        const prevElement = document.getElementById(`transcript-line-${activeIndex - 1}`);
        
        if (prevElement) {
          // Align the previous element to the top, accounting for the 80px (pt-20) padding
          // This perfectly positions the active element as "second from the top"
          targetScrollTop = prevElement.offsetTop - 80;
        }
        
        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: isJump ? 'auto' : 'smooth'
        });
      }
    }
  }, [activeIndex]);

  return (
    <div 
      ref={containerRef}
      className="relative h-full overflow-y-auto scrollbar-hide px-8 pt-20 pb-80"
    >
      <div className="flex flex-col gap-10">
        {transcript.map((line, index) => {
          const isActive = currentTime >= line.start && currentTime < line.end;
          
          return (
            <motion.div
              key={`${line.start}-${index}`}
              id={`transcript-line-${index}`}
              ref={isActive ? activeLineRef : null}
              initial={{ opacity: 0.1 }}
              animate={{ 
                opacity: 1,
              }}
              onClick={() => onSeek(line.start)}
              className="relative cursor-pointer transition-all duration-500 group pl-12"
            >
              {isActive && (
                <motion.div 
                  layoutId="activeBar"
                  className="absolute left-0 top-1 bottom-1 w-1 bg-gradient-to-b from-[#4285f4] to-[#f4b400] rounded-full shadow-[0_0_15px_rgba(66,133,244,0.4)]"
                />
              )}
              
              <div className="flex gap-14 items-start">
                <span className={`font-mono text-xs pt-0.5 tracking-wider w-12 shrink-0 ${isActive ? 'text-[#5770ff] font-bold' : 'text-[#353e6d] font-semibold'}`}>
                  {formatTime(line.start)}
                </span>
                <div className="flex flex-col gap-2.5">
                  {line.speaker && (
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase tracking-[0.2em] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        line.speaker.toLowerCase().includes('marcus') || line.speaker.toLowerCase().includes('pixel')
                          ? (isActive ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-red-500/10 text-red-400/80')
                          : (isActive ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-neutral-800 text-neutral-400')
                      }`}>
                        {line.speaker.toLowerCase().includes('marcus') || line.speaker.toLowerCase().includes('pixel') ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            {line.speaker} • HOST
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            {line.speaker}
                          </>
                        )}
                      </span>
                    </div>
                  )}
                  <p className={`leading-snug transition-all duration-500 text-lg font-medium tracking-tight ${
                    isActive 
                      ? 'text-white' 
                      : 'text-neutral-500 group-hover:text-neutral-300'
                  }`}>
                    {line.text}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
