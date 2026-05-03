import { create } from 'zustand';
import type { PrayerName } from '@/types';

/**
 * `context` lets surfaces above the audio layer tell *why* something is
 * playing, so the now-playing banner only shows for scheduled Athan firings
 * (not manual previews from the AthanPlayer test button or radio streams).
 */
export type AudioContext = 'athan' | 'manual' | 'radio';

export interface AudioMeta {
  context: AudioContext;
  /** Which prayer triggered this — set on scheduled Athan firings + the
   *  notifications-dialog test fire. Undefined for radio + manual previews. */
  prayerName?: PrayerName;
  /** Reciter id extracted from the Athan URL (e.g. `'makkah'`). Helpful for
   *  display because the URL's basename is the source of truth. */
  reciterId?: string;
}

interface AudioState {
  playing: boolean;
  src: string | null;
  queue: string[];
  volume: number;
  progress: number;
  duration: number;
  meta: AudioMeta | null;
  play: (src: string, meta?: AudioMeta) => void;
  playChain: (srcs: string[], meta?: AudioMeta) => void;
  advance: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
  setProgress: (p: number) => void;
  setDuration: (d: number) => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  playing: false,
  src: null,
  queue: [],
  volume: 0.8,
  progress: 0,
  duration: 0,
  meta: null,
  play: (src, meta) => set({ playing: true, src, queue: [], meta: meta ?? null }),
  playChain: (srcs, meta) => {
    if (srcs.length === 0) return;
    set({ playing: true, src: srcs[0], queue: srcs.slice(1), meta: meta ?? null });
  },
  advance: () => {
    const { queue, meta } = get();
    if (queue.length === 0) {
      set({ playing: false, src: null, progress: 0, duration: 0, meta: null });
      return;
    }
    const [next, ...rest] = queue;
    // Preserve `meta` across chained sources (Athan → Dua-after) so the
    // now-playing banner stays through the whole sequence.
    set({ playing: true, src: next, queue: rest, progress: 0, duration: 0, meta });
  },
  stop: () => set({ playing: false, src: null, queue: [], progress: 0, duration: 0, meta: null }),
  setVolume: (volume) => set({ volume }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
}));
