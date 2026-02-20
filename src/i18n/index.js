/**
 * @fileoverview Internationalization (i18n) module for Visualify.js
 * @module i18n
 *
 * Provides multi-language support with:
 * - 4+ languages (English, Chinese, Spanish, German)
 * - RTL (Right-to-Left) layout support
 * - Locale-aware formatting (dates, numbers, currency)
 * - Language detection (browser, URL parameter, config)
 * - Manual language override
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import zh from './locales/zh.json';
import es from './locales/es.json';
import de from './locales/de.json';
import ar from './locales/ar.json';
import he from './locales/he.json';

// Translation resources
const resources = {
  en: { translation: en },
  zh: { translation: zh },
  es: { translation: es },
  de: { translation: de },
  ar: { translation: ar },
  he: { translation: he },
};

// RTL (Right-to-Left) languages
const RTL_LANGUAGES = ['ar', 'he'];

/**
 * Check if a language is RTL
 * @param {string} lng - Language code
 * @returns {boolean} True if RTL language
 */
export function isRTLLanguage(lng) {
  return RTL_LANGUAGES.includes(lng);
}

/**
 * Get the current text direction
 * @returns {string} 'rtl' or 'ltr'
 */
export function getTextDirection() {
  const lng = i18n.language || 'en';
  return isRTLLanguage(lng) ? 'rtl' : 'ltr';
}

/**
 * Set the HTML dir attribute based on current language
 */
export function setDocumentDirection() {
  const dir = getTextDirection();
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', i18n.language);
  }
}

/**
 * Initialize i18n with configuration
 * @param {Object} config - i18n configuration
 * @param {string} config.locale - Locale setting ('auto' or specific language code)
 * @param {string} config.fallbackLocale - Fallback locale
 * @returns {Object} i18n instance
 */
export function initializeI18n(config = {}) {
  const {
    locale = 'auto',
    fallbackLocale = 'en',
  } = config;

  const detectionOptions = locale === 'auto' ? {
    order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
    lookupQuerystring: 'lang',
    lookupLocalStorage: 'visualify-language',
    caches: ['localStorage'],
  } : {
    order: ['localStorage'],
    lookupLocalStorage: 'visualify-language',
    caches: ['localStorage'],
  };

  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      debug: false, // Suppress default logger warnings in production
      lng: locale === 'auto' ? undefined : locale,
      fallbackLng: fallbackLocale,
      detection: detectionOptions,
      interpolation: {
        escapeValue: false, // React already escapes values
        prefix: '{',
        suffix: '}',
      },
      react: {
        useSuspense: false,
      },
    });

  // Set initial document direction
  setDocumentDirection();

  // Listen for language changes to update direction
  i18n.on('languageChanged', setDocumentDirection);

  return i18n;
}

/**
 * Change the current language
 * @param {string} lng - Language code
 */
export function changeLanguage(lng) {
  if (resources[lng]) {
    i18n.changeLanguage(lng);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('visualify-language', lng);
    }
  } else {
    console.warn(`[i18n] Language '${lng}' not available. Falling back to 'en'.`);
    i18n.changeLanguage('en');
  }
}

/**
 * Get available languages
 * @returns {Array<{code: string, name: string, nativeName: string, rtl: boolean}>}
 */
export function getAvailableLanguages() {
  return [
    { code: 'en', name: 'English', nativeName: 'English', rtl: false },
    { code: 'zh', name: 'Chinese', nativeName: '中文', rtl: false },
    { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false },
    { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית', rtl: true },
  ];
}

/**
 * Translate a key with interpolation
 * @param {string} key - Translation key
 * @param {Object} options - Interpolation options
 * @returns {string} Translated string
 */
export function t(key, options = {}) {
  return i18n.t(key, options);
}

/**
 * Get current language
 * @returns {string} Current language code
 */
export function getCurrentLanguage() {
  return i18n.language || 'en';
}

// Export the i18n instance as default
export default i18n;
