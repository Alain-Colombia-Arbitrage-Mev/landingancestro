import { atom, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import { languages, defaultLang, type Lang } from '../i18n/languages';
import { translations, type TranslationKey } from '../i18n/translations';

// ===== CURRENT LANGUAGE STATE =====
export const currentLang = persistentAtom<Lang>('ancestro:lang', defaultLang);

// ===== LANGUAGE INFO =====
export const currentLanguageInfo = computed(currentLang, (lang) => languages[lang]);

// ===== LANGUAGE ACTIONS =====
export function setLanguage(lang: Lang) {
  if (lang in languages) {
    currentLang.set(lang);
    
    // Update URL to reflect language change
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const route = getRouteWithoutLang(currentPath);
      const newPath = lang === defaultLang ? `/${route}` : `/${lang}/${route}`;
      
      // Use history.pushState to update URL without full page reload
      // Note: For full i18n with server-rendered content, a full navigation is needed
      window.location.href = newPath;
    }
  }
}

// Helper to get route without language prefix
function getRouteWithoutLang(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  
  if (parts.length > 0 && parts[0] in languages) {
    return parts.slice(1).join('/');
  }
  
  return parts.join('/');
}

// ===== TRANSLATION FUNCTION =====
export function t(key: TranslationKey): string {
  const lang = currentLang.get();
  return translations[lang]?.[key] || translations[defaultLang][key] || key;
}

// ===== REACTIVE TRANSLATION =====
export const useT = computed(currentLang, (lang) => {
  return (key: TranslationKey): string => {
    return translations[lang]?.[key] || translations[defaultLang][key] || key;
  };
});

// ===== ALL LANGUAGES =====
export const availableLanguages = Object.entries(languages).map(([code, info]) => ({
  code: code as Lang,
  ...info,
}));

// ===== DETECT BROWSER LANGUAGE =====
export function detectBrowserLanguage(): Lang {
  if (typeof navigator === 'undefined') return defaultLang;
  
  const browserLang = navigator.language.split('-')[0];
  
  if (browserLang in languages) {
    return browserLang as Lang;
  }
  
  return defaultLang;
}

// ===== AUTO-DETECT ON FIRST VISIT =====
export function initLanguage() {
  if (typeof window === 'undefined') return;
  
  const hasVisited = localStorage.getItem('ancestro:visited');
  
  if (!hasVisited) {
    const detected = detectBrowserLanguage();
    currentLang.set(detected);
    localStorage.setItem('ancestro:visited', 'true');
  }
}
