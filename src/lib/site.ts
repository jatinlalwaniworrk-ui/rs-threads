import site from '../data/site.json';
import products from '../data/products.json';
import shades from '../data/shades.json';
import { clean, isSet } from './todo';

export { site, products, shades };
export type Product = (typeof products)[number];
export type Shade = (typeof shades)[number];

export const siteName = clean(site.siteName);
export const year = new Date().getFullYear();

/** A link from site.json, or the 404 page while it is still a TODO. */
export const linkOr404 = (url: string): string => (isSet(url) ? url : '/404');

export const telHref = isSet(site.phone) ? `tel:${site.phone.replace(/[^\d+]/g, '')}` : '/404';
export const mailHref = isSet(site.email) ? `mailto:${site.email}` : '/404';

export const gstPortalUrl = 'https://services.gst.gov.in/services/searchtp';

/** "Rose™", or "Rose®" once site.json says the mark is registered. */
export function withMark(brand: string): string {
  const entry = site.brands.find((b) => b.name === brand);
  if (!entry) return brand;
  return `${brand}${entry.trademark === 'registered' ? '®' : '™'}`;
}

const { street, city, state, pin } = site.address;
export const fullAddress = `${street}, ${city}, ${state} ${pin}`;
export const addressIsSet = isSet(street) && isSet(city) && isSet(pin);

/** Values that copy in en.json can use as {tokens}. */
export const siteVars = {
  legalName: site.legalName,
  siteName,
  phone: site.phone,
  email: site.email,
  city: site.address.city,
  state: site.address.state,
  established: site.established,
  callback: site.dealerCallbackTime,
  jurisdiction: site.jurisdictionCity,
  year,
};

export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);
export const shadesFor = (slug: string) => shades.filter((s) => s.products.includes(slug));
