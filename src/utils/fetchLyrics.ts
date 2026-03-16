import type { LyricsResult } from '../types';
import { parseLrc, plainTextToLrcLines } from './parseLrc';

function cleanTitle(raw: string): string {
  return raw
    .replace(/\s*[([][^\])}]*[)\]]/g, '') 
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function cleanArtist(raw: string): string {
  return raw
    .replace(/vevo$/i, '')
    .replace(/\bofficial\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function extractSongInfo(
  rawTitle: string,
  rawChannel: string
): { artist: string; title: string } {
  
  const dashMatch = rawTitle.match(/^(.+?)\s*[-–—]\s*(.+)$/);
  if (dashMatch) {
    return {
      artist: cleanArtist(dashMatch[1].trim()),
      title: cleanTitle(dashMatch[2].trim()),
    };
  }
  
  return {
    artist: cleanArtist(rawChannel),
    title: cleanTitle(rawTitle),
  };
}

async function fetchFromLrclib(
  artist: string,
  title: string
): Promise<LyricsResult | null> {
  try {
    const q = encodeURIComponent(`${artist} ${title}`);
    const res = await fetch(`https://lrclib.net/api/search?q=${q}`);
    if (!res.ok) return null;
    const results: unknown[] = await res.json();
    if (!Array.isArray(results) || results.length === 0) return null;

    type LrcEntry = { syncedLyrics?: string; plainLyrics?: string };
    const best: LrcEntry =
      (results as LrcEntry[]).find(r => r.syncedLyrics) ??
      (results[0] as LrcEntry);

    if (best.syncedLyrics) {
      const lines = parseLrc(best.syncedLyrics);
      if (lines.length > 0) return { lines, synced: true, source: 'lrclib' };
    }
    if (best.plainLyrics) {
      return { lines: plainTextToLrcLines(best.plainLyrics), synced: false, source: 'lrclib' };
    }
  } catch {
    
  }
  return null;
}

async function fetchFromLyricsOvh(
  artist: string,
  title: string
): Promise<LyricsResult | null> {
  try {
    const res = await fetch(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
    );
    if (!res.ok) return null;
    const data: { lyrics?: string } = await res.json();
    if (!data.lyrics) return null;
    return { lines: plainTextToLrcLines(data.lyrics), synced: false, source: 'lyrics.ovh' };
  } catch {
    return null;
  }
}

export async function fetchLyrics(
  rawChannel: string,
  rawTitle: string
): Promise<LyricsResult> {
  const { artist, title } = extractSongInfo(rawTitle, rawChannel);

  
  const lrclib = await fetchFromLrclib(artist, title);
  if (lrclib) return lrclib;

  
  const ovh = await fetchFromLyricsOvh(artist, title);
  if (ovh) return ovh;

  
  return { lines: [], synced: false, source: 'none' };
}
