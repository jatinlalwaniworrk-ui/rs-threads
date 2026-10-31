// Become-a-dealer form: validate, send the lead, then offer "Also send on WhatsApp" with the details filled in.
import { contextFields, sendLead } from '../lib/leads';
import { formFields, indianMobile, looksLikeGstin, showErrors } from '../lib/forms';
import { strings } from '../lib/client-strings';
import { whatsappHref } from '../lib/whatsapp';
import { track } from '../lib/analytics';

const form = document.querySelector<HTMLFormElement>('[data-dealer-form]');

if (form) {
  const s = strings();
  const success = document.querySelector<HTMLElement>('[data-dealer-success]')!;
  const status = form.querySelector<HTMLElement>('[data-form-status]')!;
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const alsoWa = success.querySelector<HTMLAnchorElement>('[data-wa]')!;
  const intro = success.dataset.intro ?? '';

  // The field's visible label, without "(optional)", for the WhatsApp message.
  const labelOf = (name: string): string => {
    const input = form.querySelector<HTMLInputElement>(`[name="${name}"]`);
    const text = input?.type === 'checkbox'
      ? input.closest('fieldset')?.querySelector('legend')?.textContent
      : form.querySelector(`label[for="${input?.id}"]`)?.textContent;
    return (text ?? name).replace(/\s*\(.*\)\s*$/, '').trim();
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fields = formFields(form);
    const products = [...form.querySelectorAll<HTMLInputElement>('input[name="products"]:checked')].map((i) => i.value);

    const errors: Record<string, string> = {};
    for (const name of ['name', 'firm', 'city', 'state']) if (!fields[name]) errors[name] = s.errRequired;
    const mobile = indianMobile(fields.whatsapp ?? '');
    if (!mobile) errors.whatsapp = s.errPhone;
    if (fields.gstin && !looksLikeGstin(fields.gstin)) errors.gstin = s.errGstin;
    if (!fields.consent) errors.consent = s.errConsent;
    if (showErrors(form, errors)) return;

    const lead = {
      ...fields,
      whatsapp: `+91${mobile}`,
      gstin: fields.gstin.toUpperCase(),
      products: products.join(', '),
      ...contextFields(true),
    };

    const label = submit.textContent;
    submit.disabled = true;
    submit.textContent = s.sending;
    status.hidden = true;
    const ok = await sendLead('dealer', lead);
    submit.disabled = false;
    submit.textContent = label;

    if (!ok) {
      status.hidden = false;
      return;
    }

    track('dealer_form_submit');
    const lines = ['name', 'firm', 'city', 'state', 'whatsapp', 'gstin', 'volume', 'products', 'brands_now']
      .filter((key) => lead[key as keyof typeof lead])
      .map((key) => `${labelOf(key)}: ${lead[key as keyof typeof lead]}`);
    alsoWa.href = whatsappHref([intro, '', ...lines, '', s.msgVia].join('\n'));

    form.hidden = true;
    success.hidden = false;
    success.focus();
  });
}
