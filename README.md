# Accupro International — static website

A multilingual static rebuild of `accuprointernational.co.id`, generated from one data
file and a set of templates. No framework and no build dependency beyond Node.

**135 HTML pages · ID / EN / 中文 · plain CSS and vanilla JS · responsive at 390 / 768 / 1440 px**
**45 page routes per language · one shared asset tree · functional calculators and language switcher**

---

## 1. Where the content came from

The source crawl is checked into `content-recap/`. Copy that exists on the live site in
all three languages is stored verbatim in `data/site.json`: homepage slides, pillars,
statistics labels, CTA copy, testimonials, company tagline and hours, core navigation
labels, and all 24 service titles.

The rebuild also contains new sections that have no equivalent source copy: category
descriptions, tools, FAQ text, credentials, article cards, and supporting interface copy.
Those sections are authored for this rebuild and intentionally remain English in all
three outputs. They are not presented as translations from `content-recap/`.

The 24 service detail routes are intentionally concise because the live source provides
titles but no usable detail copy. Each route clearly says that details are coming soon
and sends visitors to WhatsApp or the contact form; no `[PH]` tags are exposed to users.

---

## 2. Running it

Any static server. From this folder:

```bash
npx serve dist          # or: python3 -m http.server -d dist 8000
```

Language roots are:

- Indonesian: `/`
- English: `/en/`
- Chinese: `/ch/`

Opening `dist/index.html` directly from the filesystem also works because internal paths
are relative.

## 3. Rebuilding

```bash
node build.mjs          # regenerates every page into dist/
node verify.mjs         # link integrity + renders all pages at 3 widths
```

`verify.mjs` needs Playwright and Chromium. It fails loudly on horizontal overflow,
broken internal links, tap targets under 40 px, and JS errors — run it before every deploy.

`node build.mjs` creates an indexable production build by default. Set `PREVIEW=1` for a
staging build with `noindex, nofollow` and `robots.txt: Disallow: /`. Set `SITE_URL` when
the deploy host differs from `https://accuprointernational.co.id`.

---

## 4. Structure

```
content-recap/         ← audited source crawl for ID / EN / CH
data/site.json         ← localized source copy, authored copy and catalogues
src/icons.mjs          ← inline SVG icon set (no icon font, no sprite request)
src/layout.mjs         ← language-aware head/header/footer/CTA, breadcrumbs, image slots
src/photos.mjs         ← stock fallback photo sets, one per category (see §5)
build.mjs              ← page templates + three-language generator
verify.mjs             ← automated checks
dist/                  ← generated output; safe to delete and rebuild
  index.html … 404.html                    Indonesian, 45 pages
  en/index.html … en/404.html             English, 45 pages
  ch/index.html … ch/404.html             Chinese, 45 pages
  services/<category>/index.html          ×5 per language
  services/<category>/<service>.html      ×24 per language
  tools/<calculator>.html                 ×9 per language
  sitemap.xml                              132 indexable URLs (404 excluded)
  robots.txt
  assets/css/style.css
  assets/js/main.js
  assets/js/calculators.js
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

Each page template has image slots that state the shot it needs, the aspect ratio, and a
minimum pixel width, so the set doubles as a photo brief for a shoot. The same visual
assets and stock-photo resolver are shared by all three language trees.

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
{ "slug": "work-kitas", "name": "Pembuatan KITAS Kerja",
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
| Calculator logic | Built. All nine calculator/simulator pages use `dist/assets/js/calculators.js`; calculation history is stored locally in the browser. |
| Form submission | Front-end validation only. `contact.html`'s form has no `action`. Point it at your handler, WP `admin-post.php`, or an email service. See `data-demo-form` in `main.js`. |
| Privacy Policy & Terms | Footer links point to `#`. Both pages need writing — the contact form collects personal data and the current site has no policy at all. |
| Google Maps embed | A slot is reserved on `about.html` and `contact.html`. Drop the iframe in. |
| Real photography | Stock fallbacks are active; replace them with approved Accupro photography before treating the imagery as final. |

---

## 8. Three-language architecture

`build.mjs` loops over `id`, `en` and `ch`. Indonesian is generated at the site root;
English and Chinese mirror the same tree under `/en/` and `/ch/`. The language switcher
uses the current page's relative path, so switching language on a category, service or
calculator route stays on the matching route instead of returning to the homepage.

The build localizes the source-backed copy listed in §1. Rebuild-authored copy is shared
in English by design because `content-recap/` contains no authoritative ID/CH equivalent.
Updating `content-recap/` does not update the website automatically: the approved source
copy must be copied into the localized fields in `data/site.json`, then rebuilt.

`<html lang>`, canonical URLs, shared asset paths, breadcrumbs, header/footer chrome,
utility-bar hours, CTA copy, sitemap paths and `robots.txt` are generated with language
context. The current output contains 135 HTML pages and 132 sitemap URLs.

---

## 9. What was fixed relative to the current site

- **24 service routes** are reachable and use the verbatim source titles; pages without
  authoritative detail copy route visitors clearly to a human instead of showing fake facts.
- **Five category pages** — a tier the current site does not have at all.
- **Navigation** goes from 4 items to 6, and the 24 services become reachable.
- **Search and category filter** on `services.html` (client-side, no dependency).
- **Nine working calculators and simulators** with reusable results and local history.
- **Three synchronized language trees** with page-to-page switching on matching routes.
- **A 404 page.** Unknown URLs on the current site return HTTP 500.
- **`sitemap.xml`** lists 132 production URLs — 44 per language, excluding 404 pages.
- **Team page** — four profiles that currently 500.
- **Testimonials** given a real home; four exist and are reproduced verbatim.
- **Consistent contact details.** The current site shows three different phone numbers
  and two different Gmail addresses across its pages. One set is used here; pick which.
- Accessibility: skip link, landmarks, `aria-current`, labelled form fields, keyboard
  accordions, visible focus rings, 44 px minimum tap targets.

---

## 10. Converting to a WordPress theme

The templates map almost one to one:

| This repo | WordPress |
|---|---|
| `src/layout.mjs` → `header()` / `footer()` | `header.php` / `footer.php` |
| `index.html` | `front-page.php` |
| service detail template in `build.mjs` | `single-layanan.php` |
| category template | `taxonomy-layanan_kategori.php` |
| `services.html` | `archive-layanan.php` |
| `data/site.json` `services[]` | the existing `layanan` custom post type |
| authored service/category fields | ACF fields (turnaround, cost range, checklist, FAQ) |

The 24 service URLs already exist in WordPress, so keep the current permalinks and
redirect only where the slug changes.

---

## 11. Brand

Sampled from the supplied logo:

| Token | Value | Use |
|---|---|---|
| `--navy` | `#2A3490` | Primary: headings, buttons, icons |
| `--gold` | `#C09725` | Accent: WhatsApp CTAs, PMA/foreign-client sections |
| `--ink` | `#1B1B18` | Body headings |

Type: **Plus Jakarta Sans** (display) + **Source Sans 3** (body), both Google Fonts.
Change them in one place — the `@import` and the `--display` / `--sans` tokens at the top
of `dist/assets/css/style.css`.
