import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2,
  SkipBack, SkipForward, Volume1
} from 'lucide-react';
import type { PlayerState } from '../types';
import ProgressBar from './ProgressBar';
import { useState } from 'react';

interface Props {
  playerState: PlayerState;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  isFullscreen: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (t: number) => void;
  onVolumeChange: (v: number) => void;
  onMute: () => void;
  onUnmute: () => void;
  onFullscreen: () => void;
}

const btn =
  'flex items-center justify-center rounded-full transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500';

export default function PlayerControls({
  playerState,
  currentTime,
  duration,
  volume,
  muted,
  isFullscreen,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onMute,
  onUnmute,
  onFullscreen,
}: Props) {
  const [showVolume, setShowVolume] = useState(false);
  const isPlaying = playerState === 'playing';
  const isBuffering = playerState === 'buffering';

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <div className="w-full flex flex-col gap-3 px-2" role="toolbar" aria-label="Player controls">
      <ProgressBar currentTime={currentTime} duration={duration} onSeek={onSeek} />

      {}
      <div className="grid items-center" style={{ gridTemplateColumns: '1fr auto 1fr' }}>

        {}
        <div className="flex justify-start items-center">
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.88 }}
              className={`${btn} w-9 h-9 text-white/60 hover:text-white`}
              onClick={() => {
                setShowVolume(v => !v);
                (muted ? onUnmute : onMute)();
              }}
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              <VolumeIcon size={18} />
            </motion.button>

            <AnimatePresence>
              {showVolume && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 glass rounded-xl p-3 z-50"
                >
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={muted ? 0 : volume}
                    onChange={e => {
                      const v = Number(e.target.value);
                      onVolumeChange(v);
                      if (v > 0 && muted) onUnmute();
                      if (v === 0) onMute();
                    }}
                    className="w-24 accent-purple-500"
                    style={{ writingMode: 'vertical-lr', direction: 'rtl', height: 80 }}
                    aria-label="Volume"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {}
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.88 }}
            className={`${btn} w-9 h-9 text-white/50 hover:text-white`}
            onClick={() => onSeek(Math.max(currentTime - 10, 0))}
            aria-label="Rewind 10 seconds"
          >
            <SkipBack size={18} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.06 }}
            className={`${btn} w-14 h-14 bg-white text-black hover:bg-purple-300`}
            style={{ boxShadow: '0 0 24px rgba(168,85,247,0.5)' }}
            onClick={isPlaying ? onPause : onPlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            disabled={isBuffering}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isBuffering ? (
                <motion.div
                  key="spin"
                  className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                />
              ) : isPlaying ? (
                <motion.span key="pause" initial={{ scale: 0.7 }} animate={{ scale: 1 }}>
                  <Pause size={22} fill="black" />
                </motion.span>
              ) : (
                <motion.span key="play" initial={{ scale: 0.7 }} animate={{ scale: 1 }}>
                  <Play size={22} fill="black" className="ml-0.5" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.88 }}
            className={`${btn} w-9 h-9 text-white/50 hover:text-white`}
            onClick={() => onSeek(Math.min(currentTime + 10, duration))}
            aria-label="Skip 10 seconds"
          >
            <SkipForward size={18} />
          </motion.button>
        </div>

        {}
        <div className="flex justify-end items-center">
          <motion.button
            whileTap={{ scale: 0.88 }}
            className={`${btn} w-9 h-9 text-white/60 hover:text-white`}
            onClick={onFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
