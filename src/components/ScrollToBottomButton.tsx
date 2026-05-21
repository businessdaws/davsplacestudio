import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function ScrollToBottomButton() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      const totalScrollable = documentHeight - windowHeight;
      if (totalScrollable <= 100) {
        setIsVisible(false);
        return;
      }

      setIsVisible(true);
      const progress = totalScrollable > 0 ? (scrollY / totalScrollable) : 0;
      setScrollProgress(progress);

      // If we've scrolled more than 65% of the page, switch the direction to scroll back up
      setIsNearBottom(progress >= 0.65);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once at startup
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollAction = () => {
    if (isNearBottom) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div id="scroll-bottom-indicator-wrapper" className="fixed bottom-20 left-4 lg:bottom-8 lg:left-8 z-[90]">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.8 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative group"
        >
          {/* Gentle Floating Wrapper */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 3.5,
              ease: "easeInOut"
            }}
            className="relative flex flex-col items-center justify-center"
          >
            {/* Tooltip */}
            <span 
              id="scroll-btn-tooltip"
              className="absolute left-1/2 -translate-x-1/2 -top-10 px-3 py-1 bg-bg-secondary text-text-primary text-[10px] font-black uppercase tracking-wider rounded-lg border border-border-subtle shadow-xl opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none whitespace-nowrap"
            >
              {isNearBottom ? 'Ke Atas' : 'Ke Bawah'}
            </span>

            {/* Core Floating Button */}
            <button
              id="floating-scroll-nav-btn"
              onClick={handleScrollAction}
              aria-label={isNearBottom ? "Scroll ke atas" : "Scroll ke bawah"}
              className={cn(
                "relative w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer overflow-hidden",
                "bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle shadow-[0_10px_30px_rgba(0,0,0,0.5)]",
                "group-hover:border-accent-yellow/40 active:scale-95"
              )}
            >
              {/* Visual Ring Progress Backdrop */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 select-none pointer-events-none opacity-30 group-hover:opacity-60 transition-opacity">
                <circle
                  cx="24"
                  cy="24"
                  r="21"
                  className="stroke-bg-tertiary"
                  strokeWidth="2"
                  fill="none"
                />
                <motion.circle
                  cx="24"
                  cy="24"
                  r="21"
                  className="stroke-accent-yellow"
                  strokeWidth="2"
                  strokeDasharray={2 * Math.PI * 21}
                  animate={{ strokeDashoffset: (2 * Math.PI * 21) * (1 - scrollProgress) }}
                  transition={{ duration: 0.1, ease: 'easeOut' }}
                  fill="none"
                />
              </svg>

              {/* Scrolling Indicator Arrow Icon */}
              <div className="relative z-10 text-white group-hover:text-accent-yellow transition-colors duration-200">
                <AnimatePresence mode="wait">
                  {isNearBottom ? (
                    <motion.div
                      key="up-arrow"
                      initial={{ rotate: -180, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 180, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <ChevronUp className="w-5 h-5 animate-pulse" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="down-arrow"
                      initial={{ rotate: 180, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -180, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <ChevronDown className="w-5 h-5 animate-bounce" style={{ animationDuration: '2s' }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
