import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mic2, AlertCircle, RefreshCw, Type, Timer } from 'lucide-react';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { useLyricsSync } from '../hooks/useLyricsSync';
import { fetchYouTubeMeta } from '../utils/fetchYouTubeMeta';
import { fetchLyrics } from '../utils/fetchLyrics';
import PlayerControls from './PlayerControls';
import LyricsLine from './LyricsLine';
import type { LyricStatus } from './LyricsLine';
import type { SongMeta, LyricsResult } from '../types';

interface Props {
  videoId: string;
  onBack: () => void;
}

type LyricsSize = 'normal' | 'large' | 'party';
const fontScaleMap: Record<LyricsSize, number> = { normal: 1, large: 1.25, party: 1.6 };

const PLAYER_ID = 'yt-player';

export default function KaraokeScreen({ videoId, onBack }: Props) {
  const [meta, setMeta] = useState<SongMeta | null>(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState('');

  const [lyrics, setLyrics] = useState<LyricsResult | null>(null);
  const lyricsLoading = meta !== null && lyrics === null;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lyricsSize, setLyricsSize] = useState<LyricsSize>('normal');
  const [showVideo, setShowVideo] = useState(false);
  const [syncOffset, setSyncOffset] = useState(0);

  const [manuallyHidden, setManuallyHidden] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    playerState, currentTime, currentTimeRef, duration, volume, muted, ready,
    play, pause, seek, setVolume, mute, unmute,
  } = useYouTubePlayer(PLAYER_ID, videoId);

  const lines = lyrics?.lines ?? [];
  const { activeIndex, lineRefs } = useLyricsSync(
    lines, currentTimeRef, lyrics?.synced ?? false, scrollContainerRef, syncOffset
  );

  useEffect(() => {
    let cancelled = false;
    fetchYouTubeMeta(videoId)
      .then(data => { if (!cancelled) setMeta(data); })
      .catch(() => { if (!cancelled) setMetaError('Could not load video info'); })
      .finally(() => { if (!cancelled) setMetaLoading(false); });
    return () => { cancelled = true; };
  }, [videoId]);

  useEffect(() => {
    if (!meta) return;
    let cancelled = false;
    fetchLyrics(meta.author, meta.title)
      .then(result => { if (!cancelled) setLyrics(result); });
    return () => { cancelled = true; };
  }, [meta]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  useEffect(() => {
    if (playerState !== 'playing') {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      return;
    }
    hideTimer.current = setTimeout(() => setManuallyHidden(true), 3500);
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [playerState]);

  const showControls = useCallback(() => {
    setManuallyHidden(false);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (playerState === 'playing') {
      hideTimer.current = setTimeout(() => setManuallyHidden(true), 3500);
    }
  }, [playerState]);

  const visibleControls = playerState !== 'playing' || !manuallyHidden;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showControls();
        if (playerState === 'playing') pause();
        else play();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [playerState, play, pause, showControls]);

  const getStatus = useCallback((i: number): LyricStatus => {
    if (activeIndex < 0) {
      if (i < 3) return 'future';
      return 'hidden';
    }
    if (i === activeIndex) return 'active';
    if (i < activeIndex) return i >= activeIndex - 6 ? 'past' : 'hidden';
    if (i === activeIndex + 1) return 'next';
    if (i <= activeIndex + 4) return 'future';
    return 'hidden';
  }, [activeIndex]);

  const retryLyrics = useCallback(() => {
    if (!meta) return;
    setLyrics(null);
    fetchLyrics(meta.author, meta.title).then(setLyrics);
  }, [meta]);

  const fontScale = fontScaleMap[lyricsSize];

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
      onMouseMove={showControls}
      onTouchStart={showControls}
    >
      {meta?.thumbnailUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img src={meta.thumbnailUrl} alt="" aria-hidden="true"
            className="w-full h-full object-cover scale-110 blur-3xl opacity-10" />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(10,10,15,0.7) 0%, rgba(10,10,15,0.95) 100%)' }} />
        </div>
      )}

      <AnimatePresence>
        {visibleControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="relative z-20 flex items-center px-4 py-3"
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium glass hover:bg-white/10 transition-colors shrink-0"
              aria-label="Back to homepage"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </motion.button>

            <div className="absolute left-0 right-0 flex justify-center pointer-events-none" aria-live="polite">
              <div className="px-32 sm:px-40 text-center min-w-0 max-w-lg w-full">
                {metaLoading ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-4 w-40 rounded bg-white/10 animate-pulse" />
                    <div className="h-3 w-28 rounded bg-white/10 animate-pulse" />
                  </div>
                ) : meta ? (
                  <>
                    <p className="font-semibold text-white text-sm truncate">{meta.title}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{meta.author}</p>
                  </>
                ) : (
                  <p className="text-sm text-red-400">{metaError}</p>
                )}
              </div>
            </div>

            <div className="ml-auto flex items-center gap-1 shrink-0">
              {lyrics?.synced && (
                <div className="flex items-center gap-0.5 glass rounded-xl px-1 py-1">
                  <motion.button whileTap={{ scale: 0.88 }}
                    onClick={() => setSyncOffset(o => Math.max(o - 0.5, -10))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors text-sm font-bold"
                    aria-label="Delay lyrics by 0.5s"
                  >−</motion.button>
                  <div className="flex items-center gap-1 px-1 text-xs tabular-nums"
                    style={{ color: syncOffset !== 0 ? '#a855f7' : 'var(--text-muted)', minWidth: '3rem', textAlign: 'center' }}>
                    <Timer size={10} />
                    {syncOffset > 0 ? `+${syncOffset.toFixed(1)}` : syncOffset.toFixed(1)}s
                  </div>
                  <motion.button whileTap={{ scale: 0.88 }}
                    onClick={() => setSyncOffset(o => Math.min(o + 0.5, 10))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors text-sm font-bold"
                    aria-label="Advance lyrics by 0.5s"
                  >+</motion.button>
                </div>
              )}

              <motion.button whileTap={{ scale: 0.9 }}
                onClick={() => setLyricsSize(s => s === 'normal' ? 'large' : s === 'large' ? 'party' : 'normal')}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium glass hover:bg-white/10 transition-colors"
                aria-label="Toggle lyrics size" title={`Size: ${lyricsSize}`}
              >
                <Type size={14} />
                <span className="hidden sm:inline capitalize">{lyricsSize}</span>
              </motion.button>

              <motion.button whileTap={{ scale: 0.9 }}
                onClick={() => setShowVideo(v => !v)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium glass hover:bg-white/10 transition-colors"
                aria-label={showVideo ? 'Hide video' : 'Show video'}
              >
                {showVideo ? 'Hide Video' : 'Show Video'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex-1 flex flex-col md:flex-row gap-4 px-4 pb-4 min-h-0">
        <div
          className="shrink-0 w-full md:w-2/5"
          style={{ display: showVideo ? 'block' : 'none' }}
        >
          <div className="relative w-full rounded-2xl overflow-hidden" style={{ paddingTop: '56.25%', background: '#000' }}>
            <div id={PLAYER_ID} className="absolute inset-0 w-full h-full" aria-label="YouTube video player" />
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl">
                <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {!showVideo && (
          <div aria-hidden="true"
            style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <div id={PLAYER_ID} />
          </div>
        )}

        <div className="flex-1 relative min-h-0 lyrics-container" aria-live="polite" aria-label="Lyrics">
          {lyricsLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
              <Mic2 size={28} style={{ color: '#a855f7' }} className="animate-pulse" />
              {[60, 80, 50, 70, 45].map((w, i) => (
                <div key={i} className="h-5 rounded-full animate-pulse"
                  style={{ width: `${w}%`, background: 'rgba(255,255,255,0.07)', animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
          ) : lyrics?.lines.length === 0 || lyrics?.source === 'none' ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
              <AlertCircle size={32} style={{ color: 'var(--text-muted)' }} />
              <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No lyrics found for this song</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try searching with a different version of the title</p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={retryLyrics}
                className="flex items-center gap-2 mt-2 px-4 py-2 rounded-xl glass text-sm hover:bg-white/10">
                <RefreshCw size={14} />Retry
              </motion.button>
            </div>
          ) : !lyrics?.synced ? (
            <div className="absolute inset-0 overflow-y-auto overscroll-contain" style={{ scrollbarWidth: 'none' }}>
              <div className="flex flex-col items-center py-16 gap-0">
                {lines.map((line, i) => (
                  <div key={i} className="text-center px-6 py-1 w-full"
                    style={{ color: 'var(--text-secondary)', fontSize: `${1 * fontScale}rem`, lineHeight: 1.8 }}>
                    {line.text}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div ref={scrollContainerRef}
              className="absolute inset-0 overflow-y-auto overscroll-contain"
              style={{ scrollbarWidth: 'none' }}>
              <div className="flex flex-col items-center" style={{ paddingTop: '45vh', paddingBottom: '45vh' }}>
                {lines.map((line, i) => (
                  <LyricsLine
                    key={i}
                    ref={el => { lineRefs.current[i] = el; }}
                    text={line.text}
                    status={getStatus(i)}
                    fontScale={fontScale}
                    onClick={line.time > 0 ? () => seek(line.time) : undefined}
                  />
                ))}
              </div>
            </div>
          )}

          {lyrics && lyrics.source !== 'none' && (
            <div className="absolute bottom-2 right-2 z-10">
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(0,0,0,0.6)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {lyrics.synced ? '♪ Synced' : '● Unsynced'} · {lyrics.source}
              </span>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {visibleControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="relative z-20 px-4 pb-6 pt-2 player-bg"
            role="region" aria-label="Playback controls"
          >
            <PlayerControls
              playerState={playerState} currentTime={currentTime} duration={duration}
              volume={volume} muted={muted} isFullscreen={isFullscreen}
              onPlay={play} onPause={pause} onSeek={seek}
              onVolumeChange={setVolume} onMute={mute} onUnmute={unmute}
              onFullscreen={toggleFullscreen}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!visibleControls && (
        <button className="absolute inset-0 z-10 w-full h-full"
          aria-label="Tap to show controls" onClick={showControls} />
      )}
    </div>
  );
}
