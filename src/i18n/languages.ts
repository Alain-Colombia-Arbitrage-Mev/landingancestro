// Supported languages configuration
export const languages = {
  es: { name: 'Español', flag: '🇪🇸', code: 'es' },
  en: { name: 'English', flag: '🇺🇸', code: 'en' },
  pt: { name: 'Português', flag: '🇧🇷', code: 'pt' },
  zh: { name: '中文', flag: '🇨🇳', code: 'zh' },
  ar: { name: 'العربية', flag: '🇸🇦', code: 'ar' },
} as const;

export const defaultLang = 'es';

export type Lang = keyof typeof languages;
