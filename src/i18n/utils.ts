import { translations, type TranslationKey } from './translations';
import { languages, defaultLang, type Lang } from './languages';

// Get language from URL
export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang in languages) return lang as Lang;
  return defaultLang;
}

// Get translations function
export function useTranslations(lang: Lang) {
  return function t(key: TranslationKey): string {
    return translations[lang]?.[key] || translations[defaultLang][key] || key;
  }
}

// Generate translated path
export function useTranslatedPath(lang: Lang) {
  return function translatePath(path: string, targetLang?: Lang): string {
    const l = targetLang || lang;
    // Remove leading slash and any existing language prefix
    const cleanPath = path.replace(/^\//, '').replace(/^(es|en|pt|zh|ar)\//, '');
    
    // Default language doesn't need prefix
    if (l === defaultLang) {
      return `/${cleanPath}`;
    }
    
    return `/${l}/${cleanPath}`;
  }
}

// Get current route without language prefix
export function getRouteFromUrl(url: URL): string {
  const pathname = url.pathname;
  const [, possibleLang, ...rest] = pathname.split('/');
  
  if (possibleLang in languages) {
    return rest.join('/') || '';
  }
  
  return pathname.slice(1) || '';
}

// Export languages for components
export { languages, defaultLang };
export type { Lang };
