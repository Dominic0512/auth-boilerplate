import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | undefined;
  setAccessToken: (accessToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        accessToken: undefined,
        setAccessToken: (accessToken: string) =>
          set((state) => ({ ...state, accessToken })),
      }),
      { name: 'authStore' },
    ),
  ),
);
