import { languages, defaultLang, type Lang } from './languages';

// Get all non-default languages for dynamic routes
export function getLanguagePaths() {
  return Object.keys(languages)
    .filter(lang => lang !== defaultLang)
    .map(lang => ({ params: { lang } }));
}

// All languages including default
export function getAllLanguagePaths() {
  return Object.keys(languages).map(lang => ({ params: { lang } }));
}

export { languages, defaultLang };
export type { Lang };
