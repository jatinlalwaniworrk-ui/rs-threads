import site from '../data/site.json';
import { isSet } from './todo';
import { NOT_FOUND } from './paths';

/** wa.me link with a prefilled message, or the 404 page while the number is a TODO. */
export function whatsappHref(message: string): string {
  const digits = site.whatsapp.replace(/\D/g, '');
  if (!isSet(site.whatsapp) || digits.length < 10) return NOT_FOUND;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
