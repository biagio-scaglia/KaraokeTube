import { motion } from 'framer-motion';
import { useCallback, useRef } from 'react';

interface Props {
  currentTime: number;
  duration: number;
  onSeek: (t: number) => void;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function ProgressBar({ currentTime, duration, onSeek }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!trackRef.current || duration === 0) return;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      onSeek(Math.max(0, Math.min(ratio * duration, duration)));
    },
    [duration, onSeek]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') onSeek(Math.min(currentTime + 5, duration));
      if (e.key === 'ArrowLeft') onSeek(Math.max(currentTime - 5, 0));
    },
    [currentTime, duration, onSeek]
  );

  return (
    <div className="w-full flex flex-col gap-1" aria-label="Progress bar">
      <div
        ref={trackRef}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        aria-label="Seek"
        tabIndex={0}
        className="relative h-1.5 rounded-full cursor-pointer group"
        style={{ background: 'rgba(255,255,255,0.12)' }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {}
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #a855f7, #ec4899)',
            width: `${progress * 100}%`,
          }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
        {}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progress * 100}% - 6px)` }}
          whileHover={{ scale: 1.3 }}
        />
        {}
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress * 100}%`,
              background: 'rgba(168,85,247,0.15)',
            }}
          />
        </div>
      </div>

      {}
      <div className="flex justify-between text-xs tabular-nums select-none"
        style={{ color: 'var(--text-muted)' }}>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
