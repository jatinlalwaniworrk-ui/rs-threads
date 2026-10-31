// The site can live in a subfolder (GitHub Pages: /rs-threads) or at the root of a domain (Netlify).
// Every internal link goes through withBase so it works in both.

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** "/about" becomes "/rs-threads/about" on GitHub Pages and stays "/about" on Netlify. */
export const withBase = (path: string): string => `${base}${path}`;

/** The path without the subfolder, e.g. "/rs-threads/about" becomes "/about". */
export const stripBase = (path: string): string =>
  (base && path.startsWith(base) ? path.slice(base.length) : path) || '/';

export const NOT_FOUND = withBase('/404');
