import { useEffect, useRef, useState, useCallback } from 'react';
import type { PlayerState } from '../types';

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

let apiLoading = false;
let apiReady = false;
const readyCallbacks: Array<() => void> = [];

function loadYTApi(): Promise<void> {
  return new Promise(resolve => {
    if (apiReady) { resolve(); return; }
    readyCallbacks.push(resolve);
    if (!apiLoading) {
      apiLoading = true;
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = () => {
        apiReady = true;
        readyCallbacks.forEach(cb => cb());
        readyCallbacks.length = 0;
      };
    }
  });
}

export function useYouTubePlayer(containerId: string, videoId: string | null) {
  const playerRef = useRef<YT.Player | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>('unstarted');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentTimeRef = useRef(0);

  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (playerRef.current) {
        try {
          const t = playerRef.current.getCurrentTime?.() ?? 0;
          const d = playerRef.current.getDuration?.() ?? 0;
          currentTimeRef.current = t;
          setCurrentTime(t);
          setDuration(d);
        } catch { }
      }
    }, 250);
  }, []);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!videoId) return;
    let destroyed = false;

    loadYTApi().then(() => {
      if (destroyed) return;
      const el = document.getElementById(containerId);
      if (!el) return;

      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch { }
        playerRef.current = null;
      }

      playerRef.current = new window.YT.Player(containerId, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3,
          cc_load_policy: 0,
          fs: 0,
        },
        events: {
          onReady: (e: YT.PlayerEvent) => {
            if (destroyed) return;
            e.target.setVolume(volume);
            setDuration(e.target.getDuration?.() ?? 0);
            setReady(true);
          },
          onStateChange: (e: YT.OnStateChangeEvent) => {
            const stateMap: Record<number, PlayerState> = {
              [-1]: 'unstarted',
              [0]: 'ended',
              [1]: 'playing',
              [2]: 'paused',
              [3]: 'buffering',
            };
            const st = stateMap[e.data] ?? 'unstarted';
            setPlayerState(st);
            if (st === 'playing') startPolling();
            else stopPolling();
          },
        },
      });
    });

    return () => {
      destroyed = true;
      stopPolling();
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch { }
        playerRef.current = null;
      }
      setReady(false);
      setCurrentTime(0);
      setDuration(0);
      setPlayerState('unstarted');
    };
  }, [videoId, containerId]); 

  const play = useCallback(() => playerRef.current?.playVideo?.(), []);
  const pause = useCallback(() => playerRef.current?.pauseVideo?.(), []);
  const seek = useCallback((s: number) => {
    playerRef.current?.seekTo?.(s, true);
    currentTimeRef.current = s;
    setCurrentTime(s);
  }, []);
  const setVolume = useCallback((v: number) => {
    playerRef.current?.setVolume?.(v);
    setVolumeState(v);
  }, []);
  const mute = useCallback(() => {
    playerRef.current?.mute?.();
    setMuted(true);
  }, []);
  const unmute = useCallback(() => {
    playerRef.current?.unMute?.();
    setMuted(false);
  }, []);

  return {
    playerState,
    currentTime,
    currentTimeRef,
    duration,
    volume,
    muted,
    ready,
    play,
    pause,
    seek,
    setVolume,
    mute,
    unmute,
  };
}
