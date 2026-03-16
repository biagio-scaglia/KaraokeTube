import { useState, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { LrcLine } from '../types';

export function useLyricsSync(
  lines: LrcLine[],
  currentTimeRef: RefObject<number>,
  synced: boolean,
  scrollContainerRef: RefObject<HTMLDivElement | null>,
  syncOffset: number
) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevIdxRef = useRef(-1);

  useEffect(() => {
    if (!synced || lines.length === 0) {
      setActiveIndex(-1);
      prevIdxRef.current = -1;
      return;
    }

    const id = setInterval(() => {
      const t = (currentTimeRef.current ?? 0) + syncOffset;
      let idx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].time <= t) idx = i;
        else break;
      }
      if (idx !== prevIdxRef.current) {
        prevIdxRef.current = idx;
        setActiveIndex(idx);
      }
    }, 80);

    return () => clearInterval(id);
  }, [lines, synced, currentTimeRef, syncOffset]);

  useEffect(() => {
    if (activeIndex < 0) return;
    const container = scrollContainerRef.current;
    const el = lineRefs.current[activeIndex];
    if (el && container) {
      const target = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
      container.scrollTo({ top: target, behavior: 'smooth' });
    }
  }, [activeIndex, scrollContainerRef]);

  return { activeIndex, lineRefs };
}
