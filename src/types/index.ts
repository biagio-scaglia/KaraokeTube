export interface LrcLine {
  time: number; 
  text: string;
  words?: LrcWord[];
}

export interface LrcWord {
  time: number;
  text: string;
}

export interface SongMeta {
  videoId: string;
  title: string;
  author: string;
  thumbnailUrl: string;
  url: string;
}

export interface LyricsResult {
  lines: LrcLine[];
  synced: boolean;
  source: 'lrclib' | 'lyrics.ovh' | 'none';
}

export type PlayerState = 'unstarted' | 'playing' | 'paused' | 'buffering' | 'ended';

export interface PlayerControls {
  play: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  mute: () => void;
  unmute: () => void;
  toggleFullscreen: () => void;
}

export interface TrendingExample {
  videoId: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
}
