import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Language Files Import
import en from './en.json';
import gj from './gj.json';
import hi from './hi.json';
import kn from './kn.json';
import mh from './mh.json';
import tl from './tl.json';
import tn from './tn.json';
import bn from './bn.json';

// 1. I18n Instance Configuration
const i18n = new I18n({
  en, gj, hi, kn, mh, tl, tn, bn,
});

// 2. Basic Configuration
i18n.enableFallback = true;
i18n.defaultLocale = 'en';
i18n.locale = 'en';

// 3. Fallback chain for missing languages
i18n.fallbacks = {
  'gj': 'en',
  'hi': 'en',
  'kn': 'en',
  'mh': 'en',
  'tl': 'en',
  'tn': 'en',
  'bn': 'en',
};

// 4. Store original translate function
const originalTranslate = i18n.t.bind(i18n);

/**
 * CRASH-PROOF: Override i18n.t with safe wrapper
 * This prevents 'missingTranslation.get is not a function' error
 */
i18n.t = function(scope: string, options?: any): string {
  try {
    if (!scope || typeof scope !== 'string') {
      console.warn('⚠️ Invalid translation key:', scope);
      return '';
    }

    // Call original translate with default value fallback
    const result = originalTranslate(scope, {
      defaultValue: scope,
      ...options,
    });

    // Ensure we return a string
    return String(result || scope);
  } catch (error) {
    console.warn(`⚠️ Translation error for key "${scope}":`, error);
    return scope;
  }
} as any;

// --- HELPER FUNCTIONS ---

/**
 * Safe Translation Function (use this everywhere)
 * Agar translation na mile, app crash nahi hoga
 */
export const translate = (key: string, options?: any): string => {
  return i18n.t(key, options);
};

/**
 * App start hote waqt saved language load karne ke liye
 */
export const loadLocale = async (): Promise<string> => {
  try {
    const savedLang = await AsyncStorage.getItem('@app_language');

    if (savedLang && typeof savedLang === 'string') {
      const supportedLocales = ['en', 'gj', 'hi', 'kn', 'mh', 'tl', 'tn', 'bn'];

      if (supportedLocales.includes(savedLang)) {
        i18n.locale = savedLang;
        console.log(`✅ Language loaded: ${savedLang}`);
        return savedLang;
      } else {
        console.warn(`⚠️ Unsupported language: ${savedLang}, using English`);
        i18n.locale = 'en';
        return 'en';
      }
    }

    i18n.locale = 'en';
    return 'en';
  } catch (error) {
    console.error('❌ Error loading language from storage', error);
    i18n.locale = 'en';
    return 'en';
  }
};

/**
 * Language change karne aur save karne ke liye
 */
export const setLocale = async (langCode: string): Promise<boolean> => {
  try {
    const supportedLocales = ['en', 'gj', 'hi', 'kn', 'mh', 'tl', 'tn', 'bn'];

    if (!supportedLocales.includes(langCode)) {
      console.error(`❌ Unsupported language code: ${langCode}`);
      return false;
    }

    i18n.locale = langCode;
    await AsyncStorage.setItem('@app_language', langCode);
    console.log(`✅ Language changed to: ${langCode}`);
    return true;
  } catch (error) {
    console.error('❌ Error saving language preference', error);
    return false;
  }
};

/**
 * Get current locale
 */
export const getCurrentLocale = (): string => {
  return i18n.locale;
};

/**
 * Get all supported locales
 */
export const getSupportedLocales = (): string[] => {
  return ['en', 'gj', 'hi', 'kn', 'mh', 'tl', 'tn', 'bn'];
};

/**
 * Check if a specific key exists in current locale
 */
export const hasTranslation = (key: string): boolean => {
  try {
    const locale = i18n.locale;
    const localeData = i18n.translations[locale as keyof typeof i18n.translations];

    if (!localeData) return false;

    // Handle nested keys like "home.title"
    const keys = key.split('.');
    let current: any = localeData;

    for (const k of keys) {
      current = current?.[k];
      if (current === undefined || current === null) return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking translation:', error);
    return false;
  }
};

/**
 * Batch translate multiple keys
 * Useful for screens with many translations
 */
export const translateMany = (keys: string[]): Record<string, string> => {
  return keys.reduce((acc, key) => {
    acc[key] = translate(key);
    return acc;
  }, {} as Record<string, string>);
};

// Initialize locale on app startup
loadLocale();

export default i18n;