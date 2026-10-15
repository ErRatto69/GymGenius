import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserProfile, LoginResponse } from '@/types/auth';

interface AuthState {
    user: UserProfile | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    hasHydrated: boolean;
    setAuth: (data: LoginResponse) => void;
    setTokens: (accessToken: string, refreshToken: string) => void;
    updateUserNames: (firstName: string, lastName: string) => void;
    logout: () => void;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            hasHydrated: false,

            setAuth: (data: LoginResponse) =>
                set({
                    user: {
                        email: data.email,
                        username: data.username,
                        firstName: data.firstName,
                        lastName: data.lastName,
                    },
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                    isAuthenticated: true,
                }),

            setTokens: (accessToken: string, refreshToken: string) =>
                set({
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                }),

            updateUserNames: (firstName: string, lastName: string) =>
                set((state) => ({
                    user: state.user
                        ? {
                            ...state.user,
                            firstName,
                            lastName,
                        }
                        : null,
                })),

            logout: () =>
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                }),

            setHasHydrated: (state: boolean) =>
                set({
                    hasHydrated: state,
                }),
        }),
        {
            name: 'gymgenius-auth-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);