// Products page: filter by range (group) and fibre. Without JavaScript every product shows.
import { fill } from '../lib/todo';

const root = document.querySelector<HTMLElement>('[data-product-filter]');

if (root) {
  const rows = root.querySelectorAll<HTMLLIElement>('[data-products] > li');
  const count = root.querySelector<HTMLElement>('[data-product-count]')!;
  const none = root.querySelector<HTMLElement>('[data-product-none]')!;
  const value = (name: string) => root.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value ?? '';

  // Start from ?group= and ?fibre= in the URL, e.g. links from the home page.
  const params = new URLSearchParams(location.search);
  for (const name of ['group', 'fibre']) {
    const wanted = params.get(name);
    const input = wanted && root.querySelector<HTMLInputElement>(`input[name="${name}"][value="${CSS.escape(wanted)}"]`);
    if (input) input.checked = true;
  }

  function apply(): void {
    const group = value('group');
    const fibre = value('fibre');
    let shown = 0;
    rows.forEach((row) => {
      const show = (!group || row.dataset.group === group) && (!fibre || row.dataset.fibre === fibre);
      row.hidden = !show;
      if (show) shown++;
    });
    count.textContent = shown === 1 ? root!.dataset.countOne! : fill(root!.dataset.countMany!, { count: shown });
    none.hidden = shown > 0;

    const url = new URL(location.href);
    group ? url.searchParams.set('group', group) : url.searchParams.delete('group');
    fibre ? url.searchParams.set('fibre', fibre) : url.searchParams.delete('fibre');
    history.replaceState(null, '', url);
  }

  root.addEventListener('change', apply);
  apply();
}
