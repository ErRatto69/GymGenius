import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

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
    isLoading: boolean;
    setAuth: (token: string, user: User) => Promise<void>;
    updateUser: (user: User) => Promise<void>;
    logout: () => Promise<void>;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null, user: null, isLoading: true,

    setAuth: async (token, user) => {
        await SecureStore.setItemAsync('auth_token', token);
        await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
        set({ token, user, isLoading: false });
    },

    updateUser: async (user) => {
        await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
        set({ user });
    },

    logout: async () => {
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('auth_user');
        set({ token: null, user: null, isLoading: false });
    },

    initialize: async () => {
        try {
            const token = await SecureStore.getItemAsync('auth_token');
            const userJson = await SecureStore.getItemAsync('auth_user');
            if (token && userJson) set({ token, user: JSON.parse(userJson), isLoading: false });
            else set({ isLoading: false });
        } catch {
            set({ isLoading: false });
        }
    },
}));