type Params = Record<string, string | number>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const LEAD_EVENTS = new Set(['enquiry_send', 'dealer_form_submit']);

/**
 * Send an event to Google Analytics (and the Meta Pixel for leads).
 * Does nothing until the visitor accepts cookies, because the trackers aren't loaded before that.
 */
export function track(event: string, params: Params = {}): void {
  window.gtag?.('event', event, { page_path: location.pathname, ...params });
  if (LEAD_EVENTS.has(event)) window.fbq?.('track', 'Lead');
}
