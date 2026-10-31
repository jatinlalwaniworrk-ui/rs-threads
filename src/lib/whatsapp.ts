import site from '../data/site.json';
import { isSet } from './todo';

/** wa.me link with a prefilled message, or the 404 page while the number is a TODO. */
export function whatsappHref(message: string): string {
  const digits = site.whatsapp.replace(/\D/g, '');
  if (!isSet(site.whatsapp) || digits.length < 10) return '/404';
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
