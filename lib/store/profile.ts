import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { TRAIT_AXES, type TraitAxis, type TraitVector } from '@/lib/types';

export const DEFAULT_TRAITS: TraitVector = {
  comfort: 62,
  humor: 55,
  intensity: 45,
  pace: 45,
  escapism: 50,
  ensemble: 58,
  catharsis: 50,
};

type ProfileState = {
  name: string;
  traits: TraitVector;
  /** Free-text topics the person does not want to be sent toward. */
  avoidTopics: string[];
  hasOnboarded: boolean;
  setName: (name: string) => void;
  setTrait: (axis: TraitAxis, value: number) => void;
  setTraits: (traits: TraitVector) => void;
  addAvoidTopic: (topic: string) => void;
  removeAvoidTopic: (topic: string) => void;
  completeOnboarding: () => void;
  resetTraits: () => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      name: '',
      traits: { ...DEFAULT_TRAITS },
      avoidTopics: [],
      hasOnboarded: false,
      setName: (name) => set({ name }),
      setTrait: (axis, value) =>
        set((state) => ({
          traits: { ...state.traits, [axis]: Math.round(Math.min(100, Math.max(0, value))) },
        })),
      setTraits: (traits) => set({ traits }),
      addAvoidTopic: (topic) =>
        set((state) => {
          const value = topic.trim();
          if (!value || state.avoidTopics.includes(value)) return state;
          return { avoidTopics: [...state.avoidTopics, value] };
        }),
      removeAvoidTopic: (topic) =>
        set((state) => ({ avoidTopics: state.avoidTopics.filter((item) => item !== topic) })),
      completeOnboarding: () => set({ hasOnboarded: true }),
      resetTraits: () => set({ traits: { ...DEFAULT_TRAITS } }),
    }),
    {
      name: 'lantern-profile',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      partialize: (state) => ({
        name: state.name,
        traits: state.traits,
        avoidTopics: state.avoidTopics,
        hasOnboarded: state.hasOnboarded,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<ProfileState>;
        const traits = { ...DEFAULT_TRAITS, ...saved.traits };
        for (const axis of TRAIT_AXES) {
          if (typeof traits[axis] !== 'number') traits[axis] = DEFAULT_TRAITS[axis];
        }
        return { ...current, ...saved, traits };
      },
    },
  ),
);
