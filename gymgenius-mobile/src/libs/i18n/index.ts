import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import it from './locales/it.json';

const resources = {
    en: { translation: en },
    it: { translation: it },
};

const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';

i18n.use(initReactI18next).init({
    resources: {
        it: {translation: it},
        en: {translation: en},
    },
    lng: deviceLanguage,
    fallbackLng: 'it',
    // compatibilityJSON: 'v3',
    interpolation: {
        escapeValue: false,
    },
});
export default i18n;