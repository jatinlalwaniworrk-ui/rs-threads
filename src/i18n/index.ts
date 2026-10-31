import en from './en.json';

// To add Hindi: create hi.json with the same keys, add it here, and add route files under src/pages/hi/.
const dictionaries = { en } as const;

export type Lang = 'en' | 'hi';
export type Strings = typeof en;

export const hasLang = (lang: string): boolean => lang in dictionaries;

export const useStrings = (lang: Lang): Strings =>
  (dictionaries as Record<string, Strings>)[lang] ?? en;

/** "/about" in English, "/hi/about" in Hindi. */
export function localePath(lang: Lang, path: string): string {
  if (lang === 'en') return path;
  return path === '/' ? `/${lang}` : `/${lang}${path}`;
}

/** The path without its language prefix. */
export const stripLang = (path: string): string => path.replace(/^\/hi(?=\/|$)/, '') || '/';
