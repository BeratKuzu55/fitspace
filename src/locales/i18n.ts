import i18n from 'i18next';
import type { LanguageDetectorAsyncModule } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import { localStorage } from '../utils/localStorage';

import enTranslation from './en/translation.json';
import enAuth from './en/auth.json';
import trTranslation from './tr/translation.json';
import trAuth from './tr/auth.json';

const resources = {
  en: {
    translation: enTranslation,
    auth: enAuth,
  },
  tr: {
    translation: trTranslation,
    auth: trAuth,
  },
} as const;

type Resources = typeof resources;
export type SupportedLanguage = keyof Resources;
export const defaultNS = 'translation';

export const SUPPORTED_LANGUAGES = Object.keys(
  resources,
) as SupportedLanguage[];
export const LANGUAGE_PREFERENCE_KEY = 'appLanguage';

export const normalizeLanguageCode = (
  code?: string | readonly string[] | null,
): SupportedLanguage => {
  if (Array.isArray(code)) {
    return normalizeLanguageCode(code[0]);
  }

  if (typeof code !== 'string' || !code.length) {
    return 'en';
  }

  const normalized = code.toLowerCase().split(/[-_]/)[0];

  return SUPPORTED_LANGUAGES.includes(normalized as SupportedLanguage)
    ? (normalized as SupportedLanguage)
    : 'en';
};

export const detectDeviceLanguage = (): SupportedLanguage => {
  try {
    const locales = getLocales();

    if (locales && locales.length > 0) {
      // İlk dil tercihini al (cihazın ana dili)
      const deviceLanguage = locales[0].languageCode?.toLowerCase();

      // Türkçe ise 'tr', değilse 'en' döndür
      if (deviceLanguage === 'tr') {
        return 'tr';
      }
      return 'en';
    }

    return 'en';
  } catch {
    return 'en';
  }
};

const languageDetector: LanguageDetectorAsyncModule = {
  type: 'languageDetector',
  async: true,
  detect: callback => {
    // 1. Yardımcı fonksiyon (Tekrarı önlemek için)
    const resolveLanguage = (lng: SupportedLanguage) => {
      callback(lng);
    };

    try {
      // 2. MMKV ile veriyi SENKRON olarak okuyoruz (await yok!)
      const stored = localStorage.getString(LANGUAGE_PREFERENCE_KEY);

      if (stored) {
        // Kayıtlı dil varsa onu kullan
        resolveLanguage(normalizeLanguageCode(stored));
      } else {
        // Kayıtlı dil yoksa cihaz diline dön
        resolveLanguage(detectDeviceLanguage());
      }
    } catch (error) {
      // Olası bir hatada (çok nadirdir) yine cihaz diline dön
      resolveLanguage(detectDeviceLanguage());
    }
  },
  init: () => {},
  cacheUserLanguage: lng => {
    localStorage.set(LANGUAGE_PREFERENCE_KEY, normalizeLanguageCode(lng));
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    ns: ['translation', 'auth'],
    defaultNS,
    fallbackNS: defaultNS,
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
  });

export default i18n;

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: Resources;
  }
}
