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
  const isDragging = useRef(false);
  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  const seekFromClientX = useCallback(
    (clientX: number) => {
      if (!trackRef.current || duration === 0) return;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min((clientX - rect.left) / rect.width, 1));
      onSeek(ratio * duration);
    },
    [duration, onSeek]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      isDragging.current = true;
      seekFromClientX(e.clientX);
      const onMove = (ev: MouseEvent) => { if (isDragging.current) seekFromClientX(ev.clientX); };
      const onUp = () => { isDragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [seekFromClientX]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      e.preventDefault();
      seekFromClientX(e.touches[0].clientX);
    },
    [seekFromClientX]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      e.preventDefault();
      seekFromClientX(e.touches[0].clientX);
    },
    [seekFromClientX]
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
        aria-valuenow={Math.floor(currentTime)}
        aria-label="Seek"
        tabIndex={0}
        className="relative cursor-pointer group"
        style={{ height: 20, display: 'flex', alignItems: 'center', touchAction: 'none' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onKeyDown={handleKeyDown}
      >
        <div
          className="absolute inset-x-0 rounded-full"
          style={{ height: 4, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)' }}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{
              width: `${progress * 100}%`,
              background: 'linear-gradient(90deg, #a855f7, #ec4899)',
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white"
            style={{
              left: `calc(${progress * 100}% - 7px)`,
              opacity: 1,
              boxShadow: '0 0 6px rgba(168,85,247,0.6)',
              transition: 'transform 0.1s ease',
            }}
          />
        </div>
      </div>

      <div className="flex justify-between text-xs tabular-nums select-none px-0.5"
        style={{ color: 'var(--text-muted)' }}>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
