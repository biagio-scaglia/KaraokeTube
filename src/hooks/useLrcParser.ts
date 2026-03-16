import { useMemo } from 'react';
import { parseLrc } from '../utils/parseLrc';
import type { LrcLine } from '../types';

export function useLrcParser(lrcText: string | null): LrcLine[] {
  return useMemo(() => {
    if (!lrcText) return [];
    return parseLrc(lrcText);
  }, [lrcText]);
}
