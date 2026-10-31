// Browser storage can be missing or blocked (private mode, strict settings), so every call is guarded.

export function readJson<T>(store: 'local' | 'session', key: string, fallback: T): T {
  try {
    const raw = (store === 'local' ? localStorage : sessionStorage).getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(store: 'local' | 'session', key: string, value: unknown): void {
  try {
    (store === 'local' ? localStorage : sessionStorage).setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: the list still works until the page closes.
  }
}
