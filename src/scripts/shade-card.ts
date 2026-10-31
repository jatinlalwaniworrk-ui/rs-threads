// Shade card: filter by product, colour family and shade number; tap a swatch to add or remove it.
import { addShade, getItems, hasShade, onChange, removeShade } from '../lib/enquiry';
import { announce, say } from '../lib/client-strings';
import { fill } from '../lib/todo';

const root = document.querySelector<HTMLElement>('[data-shade-card]');

if (root) {
  const rows = root.querySelectorAll<HTMLLIElement>('li[data-shade]');
  const search = root.querySelector<HTMLInputElement>('[data-filter-search]')!;
  const productSelect = root.querySelector<HTMLSelectElement>('[data-filter-product]')!;
  const count = root.querySelector<HTMLElement>('[data-shade-count]')!;
  const none = root.querySelector<HTMLElement>('[data-shade-none]')!;
  const bar = document.getElementById('shade-bar');
  const barText = bar?.querySelector<HTMLElement>('[data-bar-text]');
  const family = () => root.querySelector<HTMLInputElement>('input[name="family"]:checked')?.value ?? '';
  const product = () => productSelect.value || null;

  // Start from ?product= (product pages link here) and ?family=.
  const params = new URLSearchParams(location.search);
  const wantedProduct = params.get('product');
  if (wantedProduct && [...productSelect.options].some((o) => o.value === wantedProduct)) productSelect.value = wantedProduct;
  const wantedFamily = params.get('family');
  if (wantedFamily) {
    const input = root.querySelector<HTMLInputElement>(`input[name="family"][value="${CSS.escape(wantedFamily)}"]`);
    if (input) input.checked = true;
  }

  function syncSelection(): void {
    const p = product();
    rows.forEach((row) => row.querySelector('button')!.setAttribute('aria-pressed', String(hasShade(row.dataset.shade!, p))));
    const shadeCount = getItems().filter((i) => i.shade).length;
    if (bar && barText) {
      bar.hidden = shadeCount === 0;
      barText.textContent = shadeCount === 1 ? say('shadeInList') : say('shadesInList', { count: shadeCount });
    }
  }

  function apply(): void {
    const p = product();
    const f = family();
    const q = search.value.trim().toUpperCase();
    let shown = 0;
    rows.forEach((row) => {
      const show =
        (!p || row.dataset.products!.split(' ').includes(p)) &&
        (!f || row.dataset.family === f) &&
        (!q || row.dataset.shade!.toUpperCase().includes(q));
      row.hidden = !show;
      if (show) shown++;
    });
    count.textContent = shown === 1 ? root!.dataset.countOne! : fill(root!.dataset.countMany!, { count: shown });
    none.hidden = shown > 0;

    const url = new URL(location.href);
    p ? url.searchParams.set('product', p) : url.searchParams.delete('product');
    f ? url.searchParams.set('family', f) : url.searchParams.delete('family');
    history.replaceState(null, '', url);
    syncSelection();
  }

  root.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-swatch]');
    if (!button) return;
    const row = button.closest<HTMLLIElement>('li')!;
    const shade = row.dataset.shade!;
    if (button.getAttribute('aria-pressed') === 'true') {
      removeShade(shade, product());
      announce(say('shadeRemoved', { shade }));
    } else {
      addShade({ number: shade, hex: button.dataset.hex!, products: row.dataset.products!.split(' ') }, product());
      announce(say('shadeAdded', { shade }));
    }
  });

  root.addEventListener('input', apply);
  root.addEventListener('change', apply);
  onChange(syncSelection);
  apply();
}
