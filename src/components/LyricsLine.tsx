import { forwardRef } from 'react';
import { motion } from 'framer-motion';

export type LyricStatus = 'past' | 'active' | 'next' | 'future' | 'hidden';

interface Props {
  text: string;
  status: LyricStatus;
  fontScale?: number; 
  onClick?: () => void;
}

const opacityMap: Record<LyricStatus, number> = {
  hidden: 0,
  past: 0.2,
  active: 1,
  next: 0.55,
  future: 0.18,
};

const colorMap: Record<LyricStatus, string> = {
  hidden: 'transparent',
  past: 'var(--text-secondary)',
  active: '#ffffff',
  next: 'var(--text-secondary)',
  future: 'var(--text-muted)',
};

const LyricsLine = forwardRef<HTMLDivElement, Props>(
  ({ text, status, fontScale = 1, onClick }, ref) => {
    if (!text) return <div ref={ref} style={{ height: '0.5rem' }} aria-hidden="true" />;

    const isActive = status === 'active';
    const isHidden = status === 'hidden';

    
    const activeSizeRem = 2.0 * fontScale;
    const normalSizeRem = 1.2 * fontScale;

    return (
      <motion.div
        ref={ref}
        
        initial={{ opacity: 0, y: 14 }}
        animate={{
          opacity: opacityMap[status],
          color: colorMap[status],
          y: 0,
        }}
        transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
        className="text-center select-none w-full"
        style={{
          
          fontSize: `${isActive ? activeSizeRem : normalSizeRem}rem`,
          fontWeight: isActive ? 700 : status === 'next' ? 500 : 400,
          lineHeight: isActive ? 1.25 : 1.5,
          padding: isActive ? '0.55rem 1.5rem' : '0.3rem 1.5rem',
          letterSpacing: isActive ? '-0.01em' : '0',
          textShadow: isActive
            ? '0 0 40px rgba(168,85,247,0.7), 0 0 80px rgba(168,85,247,0.3)'
            : 'none',
          transition: 'font-size 0.38s cubic-bezier(0.4,0,0.2,1), padding 0.38s cubic-bezier(0.4,0,0.2,1)',
          cursor: onClick && !isHidden ? 'pointer' : 'default',
          pointerEvents: isHidden ? 'none' : 'auto',
        }}
        onClick={!isHidden ? onClick : undefined}
        role={onClick && !isHidden ? 'button' : undefined}
        tabIndex={onClick && !isHidden ? 0 : undefined}
        aria-current={isActive ? 'true' : undefined}
        onKeyDown={onClick && !isHidden ? (e) => e.key === 'Enter' && onClick() : undefined}
      >
        {isActive ? (
          <span className="relative inline-block">
            {text}
            <motion.span
              layoutId="active-underline"
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #a855f7, #ec4899)',
                width: '55%',
              }}
            />
          </span>
        ) : (
          text
        )}
      </motion.div>
    );
  }
);

LyricsLine.displayName = 'LyricsLine';
export default LyricsLine;
