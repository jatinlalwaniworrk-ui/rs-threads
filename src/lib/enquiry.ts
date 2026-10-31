// The enquiry list: products and shades a visitor collects, saved in the browser.

import products from '../data/products.json';
import type { Strings } from '../i18n';
import { readJson, writeJson } from './storage';
import { fill } from './todo';

export type Item = {
  id: string;
  product: string | null; // product slug; null until the visitor picks one
  shade: string | null; // shade number; null when added from a product page
  hex?: string;
  options?: string[]; // products this shade comes in, for the product picker
  qty: number;
};

export type Details = { name: string; firm: string; city: string };

const KEY = 'rs-enquiry-v1';
const EVENT = 'enquiry:change';

const isItem = (x: unknown): x is Item =>
  typeof x === 'object' && x !== null && typeof (x as Item).id === 'string' && Number((x as Item).qty) >= 1;

export const getItems = (): Item[] => readJson<unknown[]>('local', KEY, []).filter(isItem);

function save(items: Item[]): void {
  writeJson('local', KEY, items);
  window.dispatchEvent(new CustomEvent(EVENT));
}

/** Run fn whenever the list changes, in this tab or another one. */
export function onChange(fn: () => void): void {
  window.addEventListener(EVENT, fn);
  window.addEventListener('storage', (e) => e.key === KEY && fn());
}

const newId = () => Math.random().toString(36).slice(2, 10);

/** Add a product without a shade. False if it's already in the list. */
export function addProduct(slug: string): boolean {
  const items = getItems();
  if (items.some((i) => i.product === slug && !i.shade)) return false;
  save([...items, { id: newId(), product: slug, shade: null, qty: 1 }]);
  return true;
}

export const hasShade = (shade: string, product: string | null): boolean =>
  getItems().some((i) => i.shade === shade && (!product || i.product === product));

export function addShade(shade: { number: string; hex: string; products: string[] }, product: string | null): void {
  const options = product ? undefined : shade.products;
  const picked = product ?? (shade.products.length === 1 ? shade.products[0] : null);
  save([...getItems(), { id: newId(), product: picked, shade: shade.number, hex: shade.hex, options, qty: 1 }]);
}

export function removeShade(shade: string, product: string | null): void {
  save(getItems().filter((i) => !(i.shade === shade && (!product || i.product === product))));
}

export function updateItem(id: string, patch: Partial<Item>): void {
  save(getItems().map((i) => (i.id === id ? { ...i, ...patch } : i)));
}

export const removeItem = (id: string): void => save(getItems().filter((i) => i.id !== id));
export const clearItems = (): void => save([]);

export const productName = (slug: string | null): string =>
  products.find((p) => p.slug === slug)?.name ?? '';

export function unitLabel(slug: string | null, qty: number, units: Strings['client']['units']): string {
  const unit = (products.find((p) => p.slug === slug)?.unit ?? 'box') as keyof typeof units;
  const [one, many] = units[unit] ?? units.box;
  return qty === 1 ? one : many;
}

/** The WhatsApp message: every item, then the buyer's details, ending with "(via website)". */
export function buildMessage(items: Item[], d: Details, s: Strings['client']): string {
  const lines = items.map((item, n) => {
    const shade = item.shade ? fill(s.msgShade, { shade: item.shade }) : s.msgNoShade;
    return `${n + 1}. ${productName(item.product)}, ${shade}, ${item.qty} ${unitLabel(item.product, item.qty, s.units)}`;
  });
  const who = [`${s.msgName}: ${d.name}`];
  if (d.firm) who.push(`${s.msgFirm}: ${d.firm}`);
  who.push(`${s.msgCity}: ${d.city}`);
  return [s.msgIntro, '', ...lines, '', ...who, '', s.msgVia].join('\n');
}
