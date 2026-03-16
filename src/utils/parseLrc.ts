import type { LrcLine } from '../types';

const TIME_REGEX = /\[(\d{1,2}):(\d{2})[.::](\d{2,3})\]/g;
const LINE_REGEX = /^(\[[\d:.]+\])+(.*)$/;

export function parseLrc(lrcText: string): LrcLine[] {
  const lines: LrcLine[] = [];
  const rawLines = lrcText.split('\n');

  for (const raw of rawLines) {
    const trimmed = raw.trim();
    if (!trimmed || !LINE_REGEX.test(trimmed)) continue;

    
    const timestamps: number[] = [];
    let match: RegExpExecArray | null;
    TIME_REGEX.lastIndex = 0;
    while ((match = TIME_REGEX.exec(trimmed)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const centiseconds = parseInt(match[3].padEnd(3, '0'), 10);
      timestamps.push(minutes * 60 + seconds + centiseconds / 1000);
    }

    
    const textPart = trimmed.replace(/^(\[[\d:.]+\])+/, '').trim();

    
    if (/^\[?[a-zA-Z]+:/.test(textPart)) continue;

    for (const t of timestamps) {
      lines.push({ time: t, text: textPart });
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}

export function plainTextToLrcLines(text: string, totalDuration = 0): LrcLine[] {
  const rawLines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (rawLines.length === 0) return [];

  if (totalDuration > 0) {
    const step = totalDuration / rawLines.length;
    return rawLines.map((text, i) => ({ time: i * step, text }));
  }

  
  return rawLines.map(text => ({ time: 0, text }));
}
