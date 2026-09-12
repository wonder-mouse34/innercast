import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { MatchSession } from '@/lib/types';

type SessionState = {
  sessions: MatchSession[];
  addSession: (session: MatchSession) => void;
  clearSessions: () => void;
};

const MAX_SESSIONS = 40;

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessions: [],
      addSession: (session) =>
        set((state) => ({ sessions: [session, ...state.sessions].slice(0, MAX_SESSIONS) })),
      clearSessions: () => set({ sessions: [] }),
    }),
    {
      name: 'lantern-sessions',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);
