import { forwardRef } from 'react';

export type LyricStatus = 'past' | 'active' | 'next' | 'future' | 'hidden';

interface Props {
  text: string;
  status: LyricStatus;
  fontScale?: number;
  onClick?: () => void;
}

const opacityMap: Record<LyricStatus, number> = {
  hidden: 0,
  past: 0.22,
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

const TRANSITION = 'opacity 0.32s ease, color 0.32s ease, font-size 0.32s ease, padding 0.32s ease';

const LyricsLine = forwardRef<HTMLDivElement, Props>(
  ({ text, status, fontScale = 1, onClick }, ref) => {
    if (!text) return <div ref={ref} style={{ height: '0.5rem' }} aria-hidden="true" />;

    const isActive = status === 'active';
    const isHidden = status === 'hidden';
    const activeFontRem = Math.min(2.0 * fontScale, 2.8);
    const normalFontRem = Math.min(1.2 * fontScale, 1.6);

    return (
      <div
        ref={ref}
        className="text-center select-none w-full"
        style={{
          fontSize: `${isActive ? activeFontRem : normalFontRem}rem`,
          fontWeight: isActive ? 700 : status === 'next' ? 500 : 400,
          lineHeight: isActive ? 1.3 : 1.6,
          padding: isActive ? '0.5rem 1.2rem' : '0.25rem 1.2rem',
          letterSpacing: isActive ? '-0.01em' : '0',
          opacity: opacityMap[status],
          color: colorMap[status],
          textShadow: isActive ? '0 0 28px rgba(168,85,247,0.45)' : 'none',
          transition: TRANSITION,
          willChange: 'opacity, color',
          cursor: onClick && !isHidden ? 'pointer' : 'default',
          pointerEvents: isHidden ? 'none' : 'auto',
          WebkitTapHighlightColor: 'transparent',
        }}
        onClick={!isHidden ? onClick : undefined}
        role={onClick && !isHidden ? 'button' : undefined}
        tabIndex={onClick && !isHidden ? 0 : undefined}
        aria-current={isActive ? 'true' : undefined}
        onKeyDown={onClick && !isHidden ? (e) => e.key === 'Enter' && onClick() : undefined}
      >
        <span style={{ position: 'relative', display: 'inline-block' }}>
          {text}
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: '-3px',
              left: '50%',
              transform: 'translateX(-50%)',
              height: '2px',
              width: isActive ? '50%' : '0%',
              borderRadius: '9999px',
              background: 'linear-gradient(90deg, #a855f7, #ec4899)',
              transition: 'width 0.32s ease',
              display: 'block',
            }}
          />
        </span>
      </div>
    );
  }
);

LyricsLine.displayName = 'LyricsLine';
export default LyricsLine;
