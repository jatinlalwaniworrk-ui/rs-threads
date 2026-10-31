// Loaded on every page.
import { captureUtm } from '../lib/utm';
import { track } from '../lib/analytics';
import './menu';
import './consent';
import './enquiry-panel';

captureUtm();

// Analytics for WhatsApp buttons (which button, which page) and downloads.
document.addEventListener('click', (event) => {
  const el = (event.target as Element).closest<HTMLElement>('[data-wa], [data-download]');
  if (el?.dataset.wa) track('whatsapp_click', { button: el.dataset.wa });
  if (el?.dataset.download) track('download_click', { file: el.dataset.download });
});
