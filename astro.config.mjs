import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import site from './src/data/site.json' with { type: 'json' };

// The live address: the domain from site.json once it's set, otherwise the host's own address
// (GitHub Pages sets SITE_ORIGIN and BASE_PATH in .github/workflows/deploy.yml, Netlify sets URL).
const isTodo = (v) => !v || String(v).includes('[TODO');
const siteUrl = !isTodo(site.domain)
  ? `https://${site.domain.replace(/^https?:\/\//, '').replace(/\/$/, '')}`
  : process.env.SITE_ORIGIN || process.env.URL || 'http://localhost:4321';

export default defineConfig({
  site: siteUrl,
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({ filter: (page) => !page.endsWith('/404') }),
  ],
  vite: {
    // Keep every script in its own file so the content security policy can stay strict.
    build: { assetsInlineLimit: 0 },
    define: { __NETLIFY__: JSON.stringify(process.env.NETLIFY === 'true') },
  },
});
