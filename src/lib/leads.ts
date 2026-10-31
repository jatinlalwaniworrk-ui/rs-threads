// Every lead the website collects goes through this file.
// Netlify Forms (email notification, only when the site is hosted on Netlify) and a Google Sheet (Apps Script web app).
// To add a CRM later (Zoho, Interakt, AiSensy or similar), add one more sender to SENDERS.

import site from '../data/site.json';
import { isSet } from './todo';
import { getUtm, UTM_FIELDS } from './utm';

export type LeadForm = 'enquiry' | 'dealer';
export type LeadFields = Record<string, string>;

type Sender = (form: LeadForm, fields: LeadFields) => Promise<boolean>;

const encode = (data: LeadFields) => new URLSearchParams(data).toString();

const toNetlify: Sender = async (form, fields) => {
  const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: encode({ 'form-name': form, ...fields }),
    keepalive: true,
  });
  return res.ok;
};

const toGoogleSheet: Sender = async (form, fields) => {
  // Apps Script doesn't send CORS headers, so the reply can't be read. A sent request counts as success.
  await fetch(site.leads.appsScriptUrl, {
    method: 'POST',
    mode: 'no-cors',
    body: new URLSearchParams({ form, ...fields }),
    keepalive: true,
  });
  return true;
};

const SENDERS: Sender[] = [
  ...(__NETLIFY__ ? [toNetlify] : []),
  ...(isSet(site.leads.appsScriptUrl) ? [toGoogleSheet] : []),
];

/** False while leads have nowhere to go (not on Netlify, no Google Sheet yet). Forms then rely on WhatsApp. */
export const canSendLeads = SENDERS.length > 0;

/** Page URL, UTM tags and consent timestamp, added to every lead. */
export function contextFields(consentGiven: boolean): LeadFields {
  const utm = getUtm();
  return {
    page_url: location.href,
    ...Object.fromEntries(UTM_FIELDS.map((f) => [f, utm[f] ?? ''])),
    consent: consentGiven ? 'yes' : 'no',
    consent_at: consentGiven ? new Date().toISOString() : '',
  };
}

/** Send a lead everywhere it should go. True if at least one destination took it. */
export async function sendLead(form: LeadForm, fields: LeadFields): Promise<boolean> {
  if (fields['bot-field']) return true; // Honeypot filled in: a spam bot. Pretend it worked.
  const results = await Promise.allSettled(SENDERS.map((send) => send(form, fields)));
  return results.some((r) => r.status === 'fulfilled' && r.value);
}
