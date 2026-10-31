# Rose Embroidery Thread website

The B2B website for Mirchumal Panjumal (Rose, RS and Jai Plus embroidery thread).

Live (for now on GitHub Pages): https://jatinlalwaniworrk-ui.github.io/rs-threads

Every change you push to the `main` branch on GitHub goes live by itself in about two minutes.

Anything still missing shows on the site as a yellow `[TODO]`. `TODO.md` lists them all, page by page.

## Where things live

| What | File |
|---|---|
| Business details, links, WhatsApp number, IDs | `src/data/site.json` |
| Products | `src/data/products.json` |
| Shades | `src/data/shades.json` |
| Dealers | `src/data/dealers.json` |
| Testimonials | `src/data/testimonials.json` |
| All other website text (buttons, headings, page copy) | `src/i18n/en.json` |
| Privacy policy, Terms of use, Terms of trade | `src/content/en/*.md` |
| PDF downloads | `public/downloads/` |
| Logo files | `public/` (made by `scripts/make-logos.py`) |
| Where form leads are sent | `src/lib/leads.ts` |

You can edit any of these on github.com: open the file, click the pencil, change it, then "Commit changes". The site updates on its own.

## Change business details

Open `src/data/site.json` and replace the `[TODO...]` text with the real value. Keep the quotes. Examples:

```json
"gstin": "08XXXXX0000X1Z5",
"phone": "+91 98765 43210",
"hours": "Mon to Sat, 10 AM to 7 PM",
"links": { "indiamart": "https://www.indiamart.com/your-page/" }
```

- A link left as `[TODO...]` goes to the 404 page, so nothing breaks while you fill things in.
- **Udyam:** to remove the row completely, set `"udyam": ""`.
- **Trademarks:** set `"trademark": "registered"` only for a brand where you hold the registration certificate for that exact mark. It then shows ®. Anything else shows ™.
- **IndiaMART badge:** set `"indiamartBadge": "TrustSEAL"` (or similar) only if you hold it. Set it to `""` to hide the row.
- **Domain:** set `"domain": "yourdomain.in"` (no https://). Then add the same domain where the site is hosted (Netlify: Domain management. GitHub Pages: Settings, Pages, Custom domain). Until it is set, search engines are asked not to list the site, so the temporary address never competes with the real one.
- **Google Search Console:** paste only the code from the verification tag into `analytics.searchConsole`.
- **Google Analytics:** paste the ID (`G-XXXXXXX`) into `analytics.ga4`. It loads only after a visitor taps "Accept".

Use exactly the same business name, address and phone number as on IndiaMART and Google Business Profile.

## Change the WhatsApp number

In `src/data/site.json`, set `whatsapp` to the number with country code and no spaces or plus sign:

```json
"whatsapp": "919876543210"
```

Every WhatsApp button, the floating button and the enquiry list use this one value. Until it is set, they go to the 404 page. To test the enquiry list before launch, put your own number here.

## Add a product

Copy one product block in `src/data/products.json`, paste it at the end of the list (add a comma before it) and edit it:

```json
{
  "slug": "rose-ss-8000",
  "name": "Rose SS 8000",
  "brand": "Rose",
  "group": "embroidery-thread",
  "fibre": "polyester",
  "putUp": "Y-cone",
  "length": "8,000 m",
  "packing": "6 cones per box",
  "unit": "box",
  "description": "Polyester embroidery thread on Y-cones of 8,000 m, packed 6 cones per box."
}
```

- `slug` becomes the web address (`/products/rose-ss-8000`). Lowercase letters, numbers and dashes only. Don't change it later, or old links break.
- `group`: `embroidery-nylon` or `embroidery-thread`.
- `fibre`: `nylon`, `polyester`, `viscose`, `zari` or `metallic`. For a new fibre, also add it under `fibres` in `src/i18n/en.json`.
- `unit`: what buyers order in: `box`, `packet` or `bag`. For a new unit, add it under `client.units` in `src/i18n/en.json`.

The product page, the catalogue, the dealer form checkboxes and the sitemap update themselves.

## Add a shade

Add a line to `src/data/shades.json`:

```json
{ "number": "1021", "name": "Bottle green", "hex": "#0B5D3B", "family": "greens", "products": ["rose-ss-4000", "rose-viscose"] }
```

- `name` is optional. Use `""` if there isn't one.
- `hex` is the screen colour. Match it to the physical shade card as closely as you can.
- `family`: `reds`, `pinks`, `oranges`, `yellows`, `greens`, `blues`, `purples`, `browns`, `greys`, `whites` or `metallics`.
- `products` lists the product slugs this shade comes in.
- The 24 shades there now (P01 to P24) are placeholders marked `"placeholder": true`. Delete them when the real shades go in. The yellow notes on Home and the shade card disappear once no placeholders are left.

## Add a dealer

Add an entry to `src/data/dealers.json`:

```json
[
  { "firm": "Dealer firm name", "city": "Surat", "state": "Gujarat", "phone": "+91 98765 43210", "mapUrl": "https://maps.app.goo.gl/..." }
]
```

Find a dealer lists them by state and city. While the list is empty, it shows "We're building our dealer network" with a link to the dealer form.

## Add a testimonial

Only with the customer's written permission. Add to `src/data/testimonials.json`:

```json
[
  { "quote": "The customer's words, exactly as approved.", "name": "Customer name", "firm": "Firm name", "city": "City", "permission": true }
]
```

Entries without `"permission": true` are not shown.

## Add a PDF download

Put the file in `public/downloads/` with one of these exact names:

- `company-profile.pdf`
- `product-catalogue.pdf`
- `shade-card.pdf`

Its button on the Downloads page starts working on the next deploy. Keep each PDF small (under 5 MB) so it opens on a phone. Never upload the GST certificate or bank details.

## Add photos

1. Save photos as WebP, about 1600 px wide (use squoosh.app), in `public/images/`.
2. Replace the matching placeholder in the page file under `src/views/`, for example:
   `<img src="/images/rose-ss-4000-box.webp" alt="Rose SS 4000 box" width="1600" height="1200" loading="lazy" />`

Never use stock photos of thread.

## Form leads

Each form submission goes to two places (see `src/lib/leads.ts`):

1. **Netlify Forms** (only once the site is on Netlify). In Netlify: Forms. If it asks, click "Enable form detection", then redeploy once. Turn on email notifications for the `enquiry` and `dealer` forms (Forms, Form notifications, Add notification, Email).
2. **Google Sheet.** Follow the steps at the top of `scripts/google-apps-script.gs`, then put the web app URL in `leads.appsScriptUrl` in `site.json`.

While neither is set up (GitHub Pages, no Google Sheet yet), the dealer form skips saving and asks the dealer to send their details on WhatsApp instead. Enquiries always go out on WhatsApp.

To add a CRM later (Zoho, Interakt, AiSensy or similar), add one more sender in `src/lib/leads.ts`. Nothing else needs to change.

## Legal pages

The text is in `src/content/en/`. Values like `{legalName}` and `{jurisdiction}` are filled from `site.json`.

Once a lawyer has reviewed a page, remove the "Draft, pending legal review" note by adding `draft={false}` to its file in `src/pages/`, for example `src/pages/privacy.astro`:

```astro
<Legal lang="en" page="privacy" draft={false} />
```

## Hindi pages (later)

The site is ready for Hindi under `/hi/`:

1. Copy `src/i18n/en.json` to `src/i18n/hi.json` and translate the text (keep the keys).
2. Add `hi` in `src/i18n/index.ts` (`const dictionaries = { en, hi }`).
3. Copy each file in `src/pages/` into `src/pages/hi/` and change `lang="en"` to `lang="hi"`.
4. Add translated legal pages in `src/content/hi/`.

The "हिंदी" link in the header then points to the Hindi version of the same page.

## Redeploy

Every push to `main` deploys automatically (`.github/workflows/deploy.yml`). To redeploy without a change: on GitHub, Actions, "Deploy to GitHub Pages", Run workflow.

## Move to Netlify

GitHub Pages is free and fine for sharing. Netlify adds email alerts for every form lead and the security headers in `netlify.toml`, and lets the repo stay private.

1. Netlify: Add new site, Import from Git, GitHub, choose `rs-threads`. It reads the build settings from `netlify.toml`.
2. Set up form notifications (see Form leads above).
3. On GitHub: delete `.github/workflows/deploy.yml`, then Settings, Pages, and unpublish the site.

Links and forms adjust themselves. Nothing else changes.

## Work on it locally

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # builds into dist/
npm run todos    # builds, then rewrites TODO.md
```

Needs Node 22.23 or newer.
