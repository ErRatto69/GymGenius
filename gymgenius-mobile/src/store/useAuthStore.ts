import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { createMMKV } from 'react-native-mmkv';
import i18n from '../libs/i18n';

export const storage = createMMKV();

export interface User {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    preferredFoods?: string[];
    dislikedFoods?: string[];
    allergies?: string[];
    injuries?: string[];
    fitnessGoal?: string;
    availableEquipment?: string;
}

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: User | null;
    language: string;
    isLoading: boolean;
    setAuth: (token: string, refreshToken: string, user: User) => Promise<void>;
    setTokens: (token: string, refreshToken: string) => Promise<void>;
    updateUser: (user: User) => Promise<void>;
    setLanguage: (lang: string) => Promise<void>;
    logout: () => Promise<void>;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    refreshToken: null,
    user: null,
    language: 'it',
    isLoading: true,

    setAuth: async (token, refreshToken, user) => {
        await SecureStore.setItemAsync('auth_token', token);
        await SecureStore.setItemAsync('auth_refresh_token', refreshToken);

        storage.set('auth_user', JSON.stringify(user));

        set({ token, refreshToken, user, isLoading: false });
    },

    setTokens: async (token, refreshToken) => {
        await SecureStore.setItemAsync('auth_token', token);
        await SecureStore.setItemAsync('auth_refresh_token', refreshToken);
        set({ token, refreshToken });
    },

    updateUser: async (user) => {
        storage.set('auth_user', JSON.stringify(user));
        set({ user });
    },

    setLanguage: async (lang) => {
        storage.set('app_lang', lang);
        i18n.changeLanguage(lang);
        set({ language: lang });
    },

    logout: async () => {
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('auth_refresh_token');
        storage.remove('auth_user');

        set({ token: null, refreshToken: null, user: null, isLoading: false });
    },

    initialize: async () => {
        try {
            const token = await SecureStore.getItemAsync('auth_token');
            const refreshToken = await SecureStore.getItemAsync('auth_refresh_token');

            const userJson = storage.getString('auth_user');
            const savedLang = storage.getString('app_lang');

            if (savedLang) {
                i18n.changeLanguage(savedLang);
            }

            if (token && refreshToken && userJson) {
                set({
                    token,
                    refreshToken,
                    user: JSON.parse(userJson),
                    language: savedLang || 'it',
                    isLoading: false
                });
            } else {
                set({
                    isLoading: false,
                    language: savedLang || 'it',
                });
            }
        } catch {
            set({ isLoading: false });
        }
    },
}));