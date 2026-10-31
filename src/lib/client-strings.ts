import type { Strings } from '../i18n';
import { fill } from './todo';

type ClientStrings = Strings['client'];

let cache: ClientStrings | undefined;

/** UI text for browser scripts, read from the JSON the layout writes into each page (so Hindi pages get Hindi). */
export function strings(): ClientStrings {
  cache ??= JSON.parse(document.getElementById('client-strings')!.textContent!) as ClientStrings;
  return cache;
}

export const say = (key: keyof ClientStrings, vars: Record<string, string | number> = {}): string =>
  fill(strings()[key], vars);

/** Short polite announcement for screen readers. */
export function announce(message: string): void {
  const region = document.getElementById('live-region');
  if (!region) return;
  region.textContent = '';
  requestAnimationFrame(() => (region.textContent = message));
}
