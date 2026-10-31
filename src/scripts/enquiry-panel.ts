// Enquiry list: header count, the panel, "Add to enquiry list" buttons and sending the list on WhatsApp.
import {
  addProduct, buildMessage, clearItems, getItems, onChange, productName, removeItem, unitLabel, updateItem, type Item,
} from '../lib/enquiry';
import { announce, say, strings } from '../lib/client-strings';
import { whatsappHref } from '../lib/whatsapp';
import { contextFields, sendLead } from '../lib/leads';
import { formFields, showErrors } from '../lib/forms';
import { track } from '../lib/analytics';

const panel = document.getElementById('enquiry-panel') as HTMLDialogElement | null;

if (panel) {
  const s = strings();
  const list = panel.querySelector<HTMLUListElement>('[data-enquiry-items]')!;
  const empty = panel.querySelector<HTMLElement>('[data-enquiry-empty]')!;
  const form = panel.querySelector<HTMLFormElement>('[data-enquiry-form]')!;
  const sent = panel.querySelector<HTMLElement>('[data-enquiry-sent]')!;
  const template = panel.querySelector<HTMLTemplateElement>('#enquiry-item')!;
  const shadeCardHref = panel.querySelector<HTMLAnchorElement>('[data-pick-shade]')?.getAttribute('href') ?? '/shade-card';

  // While the visitor edits an item, don't rebuild the list (it would steal focus from the field).
  let editing = false;
  const edit = (id: string, patch: Partial<Item>) => {
    editing = true;
    updateItem(id, patch);
    editing = false;
  };

  const countLabel = (n: number) => (n === 1 ? s.itemOne : say('itemMany', { count: n }));

  function renderCount(): void {
    const n = getItems().length;
    document.querySelectorAll<HTMLElement>('[data-enquiry-count]').forEach((badge) => {
      badge.textContent = String(n);
      badge.hidden = n === 0;
    });
    document.querySelectorAll<HTMLElement>('[data-open-enquiry][data-label]').forEach((button) =>
      button.setAttribute('aria-label', n ? `${button.dataset.label}, ${countLabel(n)}` : button.dataset.label!),
    );
    document.querySelectorAll<HTMLButtonElement>('[data-add-product]').forEach((button) => {
      const inList = getItems().some((i) => i.product === button.dataset.addProduct && !i.shade);
      button.querySelector('[data-add-label]')!.textContent = inList ? s.inList : button.dataset.label!;
    });
  }

  function renderItem(item: Item): HTMLLIElement {
    const li = template.content.firstElementChild!.cloneNode(true) as HTMLLIElement;
    li.dataset.id = item.id;
    const ids = { product: `enq-product-${item.id}`, shade: `enq-shade-${item.id}` };
    li.querySelectorAll<HTMLLabelElement>('label[data-for]').forEach((l) => (l.htmlFor = ids[l.dataset.for as keyof typeof ids]));
    li.querySelectorAll<HTMLElement>('[data-id]').forEach((el) => (el.id = ids[el.dataset.id as keyof typeof ids]));

    const dot = li.querySelector<HTMLElement>('.item__dot')!;
    if (item.hex) dot.style.setProperty('--c', item.hex);
    else dot.classList.add('item__dot--none');

    const fromShadeCard = Boolean(item.hex);
    li.querySelector('[data-name]')!.textContent = item.product
      ? productName(item.product)
      : `${s.shade} ${item.shade}`;
    li.querySelector('[data-shade-label]')!.textContent = fromShadeCard && item.product ? `${s.shade} ${item.shade}` : '';

    // Product picker: for shades added with "All products", limited to products that come in that shade.
    const productField = li.querySelector<HTMLElement>('[data-product-field]')!;
    const select = li.querySelector<HTMLSelectElement>('[data-product]')!;
    const options = item.options ?? [];
    productField.hidden = options.length < 2;
    for (const slug of options) select.add(new Option(productName(slug), slug, false, slug === item.product));
    select.addEventListener('change', () => {
      edit(item.id, { product: select.value || null });
      li.querySelector('[data-name]')!.textContent = select.value ? productName(select.value) : `${s.shade} ${item.shade}`;
      li.querySelector('[data-shade-label]')!.textContent = select.value ? `${s.shade} ${item.shade}` : '';
      li.querySelector('[data-unit]')!.textContent = unitLabel(select.value || null, item.qty, s.units);
    });

    // Shade number box: for products added from a product page.
    const shadeField = li.querySelector<HTMLElement>('[data-shade-field]')!;
    const shadeInput = li.querySelector<HTMLInputElement>('[data-shade]')!;
    shadeField.hidden = fromShadeCard;
    shadeInput.value = item.shade ?? '';
    shadeInput.addEventListener('input', () => edit(item.id, { shade: shadeInput.value.trim() || null }));
    li.querySelector<HTMLAnchorElement>('[data-pick-shade]')!.href = `${shadeCardHref}?product=${item.product}`;

    const qty = li.querySelector<HTMLInputElement>('[data-qty]')!;
    const unit = li.querySelector<HTMLElement>('[data-unit]')!;
    const setQty = (n: number) => {
      const value = Math.min(9999, Math.max(1, Math.round(n) || 1));
      qty.value = String(value);
      unit.textContent = unitLabel(select.value || item.product, value, s.units);
      edit(item.id, { qty: value });
    };
    qty.value = String(item.qty);
    unit.textContent = unitLabel(item.product, item.qty, s.units);
    qty.addEventListener('change', () => setQty(Number(qty.value)));
    li.querySelector('[data-dec]')!.addEventListener('click', () => setQty(Number(qty.value) - 1));
    li.querySelector('[data-inc]')!.addEventListener('click', () => setQty(Number(qty.value) + 1));

    const remove = li.querySelector<HTMLButtonElement>('[data-remove]')!;
    const itemName = item.product ? productName(item.product) : `${s.shade} ${item.shade}`;
    remove.setAttribute('aria-label', say('remove', { item: item.shade && item.product ? `${itemName}, ${s.shade} ${item.shade}` : itemName }));
    remove.addEventListener('click', () => {
      const next = li.nextElementSibling ?? li.previousElementSibling;
      removeItem(item.id);
      announce(s.removed);
      (next?.querySelector<HTMLElement>('[data-remove]') ?? panel!.querySelector<HTMLElement>('[data-close-enquiry]'))?.focus();
    });

    return li;
  }

  function renderItems(): void {
    const items = getItems();
    empty.hidden = items.length > 0;
    list.hidden = items.length === 0;
    if (sent.hidden) form.hidden = items.length === 0;
    list.replaceChildren(...items.map(renderItem));
  }

  function open(): void {
    sent.hidden = true;
    renderItems();
    if (!panel!.open) panel!.showModal();
  }

  document.addEventListener('click', (event) => {
    const target = event.target as Element;
    if (target.closest('[data-open-enquiry]')) open();

    const add = target.closest<HTMLButtonElement>('[data-add-product]');
    if (add) {
      if (addProduct(add.dataset.addProduct!)) announce(s.added);
      else open();
    }
  });

  panel.querySelector('[data-close-enquiry]')!.addEventListener('click', () => panel.close());
  // Tap outside the panel to close it.
  panel.addEventListener('click', (event) => event.target === panel && panel.close());

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const items = getItems();
    const fields = formFields(form);
    const errors: Record<string, string> = {};
    if (!fields.name) errors.name = s.errRequired;
    if (!fields.city) errors.city = s.errRequired;
    if (!fields.consent) errors.consent = s.errConsent;
    if (items.some((i) => !i.product)) errors.items = s.errProduct;
    if (showErrors(form, errors)) return;

    const message = buildMessage(items, { name: fields.name, firm: fields.firm, city: fields.city }, s);
    // Open WhatsApp first, inside the tap, so phones don't block it. The lead is logged in the background.
    window.open(whatsappHref(message), '_blank', 'noopener');

    const summary = items
      .map((i) => `${productName(i.product)} | ${i.shade ?? '-'} | ${i.qty} ${unitLabel(i.product, i.qty, s.units)}`)
      .join('; ');
    void sendLead('enquiry', { ...fields, ...contextFields(true), items: summary, message });
    track('enquiry_send', { items: items.length });

    form.hidden = true;
    list.hidden = true;
    sent.hidden = false;
    sent.focus();
  });

  panel.querySelector('[data-clear-enquiry]')!.addEventListener('click', () => {
    clearItems();
    sent.hidden = true;
    form.reset();
    renderItems();
    panel.querySelector<HTMLElement>('[data-close-enquiry]')!.focus();
  });

  panel.querySelector('[data-keep-enquiry]')!.addEventListener('click', () => {
    sent.hidden = true;
    renderItems();
    form.querySelector<HTMLElement>('button[type="submit"]')!.focus();
  });

  onChange(() => {
    renderCount();
    if (!editing && panel.open) renderItems();
  });
  renderCount();
}
