// Cookie notice. Google Analytics and the Meta Pixel load only after "Accept", and only once their IDs are in site.json.
import site from '../data/site.json';
import { isSet } from '../lib/todo';
import { readJson, writeJson } from '../lib/storage';

type Choice = { choice: 'accepted' | 'declined'; at: string };

const KEY = 'rs-cookie-consent';
const bar = document.getElementById('cookie-bar');
let loaded = false;

function addScript(src: string): void {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.append(s);
}

function loadTrackers(): void {
  if (loaded) return;
  loaded = true;

  const ga = site.analytics.ga4;
  if (isSet(ga)) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // gtag expects the arguments object itself, not an array.
      window.dataLayer!.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', ga);
    addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`);
  }

  const pixel = site.analytics.metaPixel;
  if (site.analytics.metaPixelEnabled && isSet(pixel)) {
    // Meta's standard loader, written out so it runs from this file instead of an inline script.
    type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue: unknown[]; push: Fbq; loaded: boolean; version: string };
    const fbq = function (this: unknown) {
      fbq.callMethod ? fbq.callMethod.apply(fbq, arguments as unknown as unknown[]) : fbq.queue.push(arguments);
    } as unknown as Fbq;
    fbq.queue = [];
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    window.fbq = fbq;
    (window as unknown as { _fbq: Fbq })._fbq = fbq;
    addScript('https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', pixel);
    fbq('track', 'PageView');
  }
}

/** After "Decline": stop Google Analytics and delete its cookies (and the Pixel's). */
function forget(): void {
  if (isSet(site.analytics.ga4)) (window as unknown as Record<string, boolean>)[`ga-disable-${site.analytics.ga4}`] = true;
  const host = location.hostname;
  const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`];
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim();
    if (!/^(_ga|_gid|_gat|_fbp)/.test(name)) continue;
    for (const d of domains) document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ''}`;
  }
}

const saved = readJson<Choice | null>('local', KEY, null);
if (saved?.choice === 'accepted') loadTrackers();
if (!saved && bar) bar.hidden = false;

bar?.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>('[data-cookie]');
  if (!button) return;
  const choice = button.dataset.cookie as Choice['choice'];
  writeJson('local', KEY, { choice, at: new Date().toISOString() } satisfies Choice);
  bar.hidden = true;
  if (choice === 'accepted') loadTrackers();
  else forget();
});

document.querySelectorAll<HTMLButtonElement>('[data-cookie-settings]').forEach((button) =>
  button.addEventListener('click', () => {
    if (!bar) return;
    bar.hidden = false;
    bar.querySelector<HTMLButtonElement>('[data-cookie]')?.focus();
  }),
);
