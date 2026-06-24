import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../api/client'
import i18n from '../libs/i18n';

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
    user: User | null;
    language: string;
    isLoading: boolean;
    setAuth: (token: string, user: User) => Promise<void>;
    updateUser: (user: User) => Promise<void>;
    setLanguage: (lang: string) => Promise<void>;
    logout: () => Promise<void>;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    language: 'it',
    isLoading: true,

    setAuth: async (token, user) => {
        await SecureStore.setItemAsync('auth_token', token);
        await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({ token, user, isLoading: false });
    },

    updateUser: async (user) => {
        await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
        set({ user });
    },

    setLanguage: async (lang) => {
        await SecureStore.setItemAsync('app_lang', lang);
        i18n.changeLanguage(lang);
        set({ language: lang });
    },

    logout: async () => {
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('auth_user');
        delete apiClient.defaults.headers.common['Authorization'];
        set({ token: null, user: null, isLoading: false });
    },

    initialize: async () => {
        try {
            const token = await SecureStore.getItemAsync('auth_token');
            const userJson = await SecureStore.getItemAsync('auth_user');
            const savedLang = await SecureStore.getItemAsync('app_lang');

            if (savedLang) {
                i18n.changeLanguage(savedLang);
            }

            if (token && userJson) {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                set({
                    token,
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