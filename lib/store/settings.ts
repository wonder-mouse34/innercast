import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_MODEL_SETTINGS, type ModelSettings } from '@/lib/rag/llmClient';

type SettingsState = {
  model: ModelSettings;
  lastTestedAt?: string;
  lastTestOk?: boolean;
  lastTestMessage?: string;
  discoveredModels: string[];
  updateModel: (patch: Partial<ModelSettings>) => void;
  recordTest: (ok: boolean, message: string, models: string[]) => void;
  resetModel: () => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      model: { ...DEFAULT_MODEL_SETTINGS },
      discoveredModels: [],
      updateModel: (patch) => set((state) => ({ model: { ...state.model, ...patch } })),
      recordTest: (ok, message, models) =>
        set({
          lastTestedAt: new Date().toISOString(),
          lastTestOk: ok,
          lastTestMessage: message,
          discoveredModels: models,
        }),
      resetModel: () => set({ model: { ...DEFAULT_MODEL_SETTINGS } }),
    }),
    {
      name: 'lantern-model-settings',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<SettingsState>;
        return {
          ...current,
          ...saved,
          model: { ...DEFAULT_MODEL_SETTINGS },
          discoveredModels: [],
          lastTestedAt: undefined,
          lastTestOk: undefined,
          lastTestMessage: undefined,
        };
      },
    },
  ),
);
