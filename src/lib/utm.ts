import { readJson, writeJson } from './storage';

const KEY = 'rs-utm';
export const UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

/** Remember UTM tags from the landing URL for the rest of the visit, so a form on a later page still gets them. */
export function captureUtm(): void {
  const params = new URLSearchParams(location.search);
  const found = Object.fromEntries(UTM_FIELDS.filter((f) => params.get(f)).map((f) => [f, params.get(f)!]));
  if (Object.keys(found).length) writeJson('session', KEY, found);
}

export const getUtm = (): Record<string, string> => readJson('session', KEY, {});
