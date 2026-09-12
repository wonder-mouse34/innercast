import { useSyncExternalStore } from 'react';

import { useProfileStore } from '@/lib/store/profile';

/**
 * AsyncStorage rehydration is async, so the very first render of a persisted
 * store still holds defaults. Screens that branch on stored state (onboarding
 * gate, empty states) wait for this before deciding.
 */
export function useProfileHydrated(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => useProfileStore.persist.onFinishHydration(onStoreChange),
    () => useProfileStore.persist.hasHydrated(),
  );
}
