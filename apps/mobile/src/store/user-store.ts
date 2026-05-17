// =============================================================================
// Zustand Store — Global app state
// =============================================================================

import { create } from 'zustand';

interface UserState {
  userId: string | null;
  isOnboarded: boolean;
  setUserId: (id: string) => void;
  setOnboarded: (value: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  isOnboarded: false,
  setUserId: (id) => set({ userId: id }),
  setOnboarded: (value) => set({ isOnboarded: value }),
}));
