import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SupportedLanguage } from '@/types/profile';

interface LanguageState {
    language: SupportedLanguage;
    setLanguage: (language: SupportedLanguage) => void;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: 'it',
            setLanguage: (language: SupportedLanguage) => set({ language }),
        }),
        {
            name: 'gymgenius-language-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);