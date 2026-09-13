import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { WatchEntry, WatchStatus } from '@/lib/types';

type WatchlistState = {
  entries: WatchEntry[];
  startedWatchingByShow: Record<string, boolean | undefined>;
  setStatus: (showId: string, status: WatchStatus, fromSessionId?: string) => void;
  setStartedWatching: (showId: string, started: boolean) => void;
  removeShow: (showId: string) => void;
};

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set) => ({
      entries: [],
      startedWatchingByShow: {},
      setStatus: (showId, status, fromSessionId) =>
        set((state) => {
          const next: WatchEntry = {
            showId,
            status,
            updatedAt: new Date().toISOString(),
            fromSessionId,
          };
          const existing = state.entries.findIndex((entry) => entry.showId === showId);
          if (existing === -1) return { entries: [next, ...state.entries] };
          const entries = [...state.entries];
          entries[existing] = { ...entries[existing], ...next };
          return { entries };
        }),
      setStartedWatching: (showId, started) =>
        set((state) => ({
          startedWatchingByShow: { ...state.startedWatchingByShow, [showId]: started },
        })),
      removeShow: (showId) =>
        set((state) => ({ entries: state.entries.filter((entry) => entry.showId !== showId) })),
    }),
    {
      name: 'lantern-watchlist',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<WatchlistState>;
        return {
          ...current,
          ...saved,
          entries: saved.entries ?? [],
          startedWatchingByShow: saved.startedWatchingByShow ?? {},
        };
      },
    },
  ),
);
