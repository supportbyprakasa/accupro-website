# Accupro International — static website

A complete static rebuild of `accuprointernational.co.id`, generated from one data file
and a set of templates. No framework, no build dependencies beyond Node.

**36 HTML pages · plain CSS · 4 KB of vanilla JS · responsive at 390 / 768 / 1440 px**
**270 image slots, every one filled with a category-matched stock fallback**

---

## 1. Where the content came from

Every sentence of prose in this site is copied **verbatim** from
`https://accuprointernational.co.id/en/`. Nothing was invented, paraphrased, or
translated by hand.

Everything that does **not** exist on the current site is marked with a
`[SQUARE BRACKET]` placeholder, rendered as a small amber tag on the page. Search for
`ph-tag` in the HTML, or `PH(` in `build.mjs`, to find them all.

That distinction matters, because of what the audit found: **24 of the site's service
pages contain zero words.** They serve only a title, `By super admin`, `Maret 5, 2025`,
and the WordPress theme's demo string *"Build strong & impressive websites using our
premade templates"*. So the 24 service detail pages here are fully built and styled but
deliberately unwritten — they are the writing brief, not finished copy.

Rough volume still to write: **24,000–31,000 words**, before English → Indonesian →
Mandarin translation.

---

## 2. Running it

Any static server. From this folder:

```bash
npx serve dist          # or: python3 -m http.server -d dist 8000
```

Opening `dist/index.html` directly from the filesystem also works — all paths are relative.

## 3. Rebuilding

```bash
node build.mjs          # regenerates every page into dist/
node verify.mjs         # link integrity + renders all pages at 3 widths
```

`verify.mjs` needs Playwright and Chromium. It fails loudly on horizontal overflow,
broken internal links, tap targets under 40 px, and JS errors — run it before every deploy.

---

## 4. Structure

```
data/site.json         ← all content and the service catalogue. Edit this, not the HTML.
src/icons.mjs          ← inline SVG icon set (no icon font, no sprite request)
src/layout.mjs         ← <head>, header, footer, CTA band, breadcrumbs, image slots
src/photos.mjs         ← stock fallback photo sets, one per category (see §5)
build.mjs              ← page templates + the generator
verify.mjs             ← automated checks
dist/                  ← generated output; safe to delete and rebuild
  index.html  about.html  services.html  tools.html  articles.html  contact.html  404.html
  sitemap.xml  robots.txt
  services/<category>/index.html          ×5   category pages
  services/<category>/<service>.html      ×24  service detail pages
  assets/css/style.css
  assets/js/main.js
  assets/img/logo-accupro.png
```

`dist/` is generated. Never hand-edit the HTML, `sitemap.xml`, or `robots.txt` — your
changes are overwritten on the next build. Edit `data/site.json`, `src/*`, or `build.mjs`.

One exception: `build.mjs` does **not** generate `dist/assets/`. The stylesheet, `main.js`
and the logo are hand-maintained files that happen to live under `dist/`, and they survive
a rebuild. `dist/assets/css/style.css` is therefore the right place to edit CSS — but it
sits in a directory the rest of this section tells you never to touch, which is a trap
worth remembering (or worth moving to `src/` next time this is opened up).

---

## 5. Replacing the image placeholders

There are 270 image slots across the 36 pages. Each one states the shot it needs, the
aspect ratio, and a minimum pixel width — so the set doubles as a photo brief for a shoot.

**Every slot already renders a photo.** Until the real shoot happens, each one falls back
to a licensed stock photo from the Pexels CDN, chosen to match what that slot is asking
for. The pages read as finished rather than empty, and nothing is ever a blank box.

### How the fallback works

`src/photos.mjs` holds the photo sets, one per **category** — `meeting`, `tax-docs`,
`passport`, `portrait`, `signing`, `stamp`, `reception`, `screen`, `filed-docs`,
`handover`, `team-work`, `certificate`, `branding`, `city`. `slot()` resolves a URL from
the category, cropped by the CDN to that slot's own aspect ratio, and layers it over the
placeholder:

```html
<div class="imgslot imgslot--photo" style="--ratio:16 / 9">
  <svg>…</svg><span class="imgslot__label">Photo: …</span>   <!-- the brief, underneath -->
  <img src="https://images.pexels.com/photos/…" alt="…"
       loading="lazy" onload="this.dataset.ok=1" onerror="this.hidden=true">
</div>
```

The brief stays in the DOM underneath. So a slot shows the brief while the photo loads,
the photo once it lands, and the brief again if the CDN is unreachable — three states, no
blank box. `onload` sets `data-ok`, which is what hides the brief; `onerror` sets
`hidden`, which reveals it.

Which photo a slot gets is decided by a stable hash of its seed, so it is the same on
every build, and sibling slots (the four team portraits, the 24 service pages) each get a
different frame instead of all repeating one.

### Choosing the category

Explicitly, at the call site or in the data — this is preferred:

```js
slot('Photo: the required paperwork laid out on a desk',
     { ratio: '4 / 3', px: 'min 1000px', cat: 'tax-docs', seed: s.slug })
```

```json
{ "slug": "work-kitas", "name": "Work KITAS Processing",
  "cat": "stay-permits-visa", "photo": "passport", "shot": "Photo: …" }
```

Note the two different fields: `cat` is the **service category** (must match a `slug` in
`categories`); `photo` is the **photo category** (must match a key in `PHOTOS`). Omit
`photo` and `photos.mjs` infers one from the wording of the `shot` — a safety net, not the
intended path.

### Two rules for the photo sets

1. **Never add an ID without loading it and looking at it.** A 200 from the CDN proves the
   file exists, not that it shows what you think. Every ID in `photos.mjs` was rendered
   and inspected.
2. **Watch for wrong-context frames.** A generic stock search returns US 1040 forms and
   Russian passport covers; on an Indonesian tax consultancy either one reads as a
   mistake. The `passport` set is deliberately restricted to stamped pages and work-permit
   badges with no identifiable national cover.

The six **client logo** slots on the homepage stay empty on purpose — they are listed in
`NO_PHOTO`. A stock photo cannot stand in for a real client's logo.

### Swapping in a real photo

Pass `src` and the stock fallback is bypassed entirely:

```js
slot('Photo: the Accupro team in a client meeting', { ratio: '21 / 9', src: 'assets/img/team-meeting.jpg' })
```

Use `eager: true` for the first image on a page (it sets `fetchpriority="high"` instead of
`loading="lazy"`). Change the `slot()` call in `build.mjs` or the data in
`data/site.json` — never the generated HTML, which is overwritten on the next build.

Pexels licence: free for commercial use, no attribution required. These are placeholders
for a real shoot, not a permanent substitute for photography of the actual firm.

---

## 6. Adding or editing a service

Add one object to `services` in `data/site.json` and rebuild. The service page, its
listing on `services.html`, its row on the category page, the homepage finder dropdown,
the contact form's `<optgroup>`, and `sitemap.xml` all update themselves.

```json
{ "slug": "new-service", "name": "New Service", "cat": "tax-reporting",
  "photo": "tax-docs", "shot": "Photo: …" }
```

`cat` must match a `slug` in `categories`. `photo` must match a key in `PHOTOS`
(`src/photos.mjs`) — omit it and one is inferred from the `shot` wording, which is usually
right but worth checking. See §5.

---

## 7. Deliberately not built

| Item | Status |
|---|---|
| Calculator logic | Shells only, as agreed. Nine tools are laid out and styled; no arithmetic. Wire it up in `assets/js/main.js`, and keep history in `localStorage` so it survives a reload. |
| Form submission | Front-end validation only. `contact.html`'s form has no `action`. Point it at your handler, WP `admin-post.php`, or an email service. See `data-demo-form` in `main.js`. |
| Indonesian & Mandarin | The language switcher is in place but inert — it links to `#`. Content came from `/en/`, so only English is built. Generating `/id/` and `/zh/` is a loop in `build.mjs` once the copy exists. |
| Privacy Policy & Terms | Footer links point to `#`. Both pages need writing — the contact form collects personal data and the current site has no policy at all. |
| Google Maps embed | A slot is reserved on `about.html` and `contact.html`. Drop the iframe in. |
| Real photography | 90+ slots, each with a written brief. |

---

## 8. What was fixed relative to the current site

- **24 service pages** now have a real structure: summary, fact strip (turnaround,
  documents, who it is for, output), what it is, who needs it, document checklist,
  stage-by-stage process, cost components, legal basis, FAQ.
- **Five category pages** — a tier the current site does not have at all.
- **Navigation** goes from 4 items to 6, and the 24 services become reachable.
- **Search and category filter** on `services.html` (client-side, no dependency).
- **A 404 page.** Unknown URLs on the current site return HTTP 500.
- **`sitemap.xml`** lists all 35 real URLs — and no placeholder blog posts.
- **Team page** — four profiles that currently 500.
- **Testimonials** given a real home; four exist and are reproduced verbatim.
- **Consistent contact details.** The current site shows three different phone numbers
  and two different Gmail addresses across its pages. One set is used here; pick which.
- Accessibility: skip link, landmarks, `aria-current`, labelled form fields, keyboard
  accordions, visible focus rings, 44 px minimum tap targets.

---

## 9. Converting to a WordPress theme

The templates map almost one to one:

| This repo | WordPress |
|---|---|
| `src/layout.mjs` → `header()` / `footer()` | `header.php` / `footer.php` |
| `index.html` | `front-page.php` |
| service detail template in `build.mjs` | `single-layanan.php` |
| category template | `taxonomy-layanan_kategori.php` |
| `services.html` | `archive-layanan.php` |
| `data/site.json` `services[]` | the existing `layanan` custom post type |
| `[BRACKET]` placeholders | ACF fields (turnaround, cost range, checklist, FAQ) |

The 24 service URLs already exist in WordPress, so keep the current permalinks and
redirect only where the slug changes.

---

## 10. Brand

Sampled from the supplied logo:

| Token | Value | Use |
|---|---|---|
| `--navy` | `#2A3490` | Primary: headings, buttons, icons |
| `--gold` | `#C09725` | Accent: WhatsApp CTAs, PMA/foreign-client sections |
| `--ink` | `#1B1B18` | Body headings |

Type: **Plus Jakarta Sans** (display) + **Source Sans 3** (body), both Google Fonts.
Change them in one place — the `@import` and the `--display` / `--sans` tokens at the top
of `dist/assets/css/style.css`.
