// Small helpers shared by the enquiry and dealer forms.

/** Form values as plain strings. Checkbox groups keep only the last value; callers join those themselves. */
export const formFields = (form: HTMLFormElement): Record<string, string> =>
  Object.fromEntries([...new FormData(form)].map(([k, v]) => [k, String(v).trim()]));

/** Show error messages next to their fields. Returns true when there were errors. */
export function showErrors(form: HTMLFormElement, errors: Record<string, string>): boolean {
  form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((el) => {
    const name = el.dataset.errorFor!;
    el.textContent = errors[name] ?? '';
    form.querySelectorAll(`[name="${name}"]`).forEach((input) =>
      errors[name] ? input.setAttribute('aria-invalid', 'true') : input.removeAttribute('aria-invalid'),
    );
  });
  const first = Object.keys(errors)[0];
  if (!first) return false;
  const target = form.querySelector<HTMLElement>(`[name="${first}"]`) ?? form.querySelector<HTMLElement>(`[data-error-for="${first}"]`);
  target?.focus();
  return true;
}

/** 10-digit Indian mobile number starting with 6 to 9, with an optional +91. Null if invalid. */
export function indianMobile(value: string): string | null {
  const match = value.replace(/[\s\-()]/g, '').match(/^(?:\+?91)?([6-9]\d{9})$/);
  return match ? match[1] : null;
}

export const looksLikeGstin = (value: string): boolean =>
  /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(value.trim().toUpperCase());
