import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import site from './src/data/site.json' with { type: 'json' };

// The live address: the domain from site.json once it's set, otherwise the Netlify URL.
const isTodo = (v) => !v || String(v).includes('[TODO');
const siteUrl = !isTodo(site.domain)
  ? `https://${site.domain.replace(/^https?:\/\//, '').replace(/\/$/, '')}`
  : process.env.URL || 'http://localhost:4321';

export default defineConfig({
  site: siteUrl,
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({ filter: (page) => !page.endsWith('/404') }),
  ],
  vite: {
    // Keep every script in its own file so the content security policy can stay strict.
    build: { assetsInlineLimit: 0 },
  },
});
