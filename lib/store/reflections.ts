import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createId } from '@/lib/utils';
import type { MoodScore, Reflection, ReflectionAnswer, SituationId } from '@/lib/types';

export type NewReflection = {
  showId?: string;
  situationText?: string;
  situations: SituationId[];
  moodBefore: MoodScore;
  moodAfter?: MoodScore;
  answers: ReflectionAnswer[];
  takeaway?: string;
};

type ReflectionState = {
  entries: Reflection[];
  addReflection: (input: NewReflection) => Reflection;
  updateReflection: (id: string, patch: Partial<Omit<Reflection, 'id'>>) => void;
  removeReflection: (id: string) => void;
  markShared: (id: string, circleId: string) => void;
};

export const useReflectionStore = create<ReflectionState>()(
  persist(
    (set) => ({
      entries: [],
      addReflection: (input) => {
        const entry: Reflection = {
          id: createId(),
          createdAt: new Date().toISOString(),
          sharedToCircleIds: [],
          ...input,
        };
        set((state) => ({ entries: [entry, ...state.entries] }));
        return entry;
      },
      updateReflection: (id, patch) =>
        set((state) => ({
          entries: state.entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
        })),
      removeReflection: (id) =>
        set((state) => ({ entries: state.entries.filter((entry) => entry.id !== id) })),
      markShared: (id, circleId) =>
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id && !entry.sharedToCircleIds.includes(circleId)
              ? { ...entry, sharedToCircleIds: [...entry.sharedToCircleIds, circleId] }
              : entry,
          ),
        })),
    }),
    {
      name: 'lantern-reflections',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);
