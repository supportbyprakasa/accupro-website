import { ic, logoMark } from './icons.mjs';
import { resolvePhoto, photoUrl } from './photos.mjs';

export const up = d => '../'.repeat(d);

export const LANGS = ['id', 'en', 'ch'];

/* Only 'home' / 'services' / 'about' / 'contact' have a real, per-language
   label on the live site (see data/site.json's i18n block, sourced from
   content-recap). 'tools' and 'articles' are new navigation this rebuild
   adds — there is nothing to translate, so they stay in English in every
   language build. */
export const navItems = T => [
  { href: 'index.html',    label: T.home,     key: 'home' },
  { href: 'services.html', label: T.services, key: 'services' },
  { href: 'tools.html',    label: 'Tools',    key: 'tools' },
  { href: 'about.html',    label: T.about,    key: 'about' },
  { href: 'articles.html', label: 'Articles', key: 'articles' },
  { href: 'contact.html',  label: T.contact,  key: 'contact' }
];

/* Every language build mirrors the same relative tree under dist/ — id at
   the root, en/ch each one level further down (dist/en/, dist/ch/) — so the
   sibling page in another language sits at the same relPath under that
   language's own root. toDistRoot climbs from a page at depth `d` in
   language `lang` out to the true dist/ root (one extra '../' unless lang
   is 'id', which IS that root); langHref continues from there into the
   target language's root and appends the shared relPath. Shared assets
   (dist/assets/) need the same escape distance, since they too are not
   duplicated per language. */
export const toDistRoot = (d, lang) => up(d) + (lang === 'id' ? '' : '../');

/* Shared assets live outside the language trees. A small build-time version
   prevents a production deploy from serving stale CSS/JS after an update. */
const ASSET_VERSION = process.env.ASSET_VERSION || '20260901-2';
const assetHref = (d, lang, rel) => `${toDistRoot(d, lang)}${rel}${rel.includes('?') ? '&' : '?'}v=${ASSET_VERSION}`;

export const langHref = (d, lang, target, relPath) => {
  const into = target === 'id' ? '' : `${target}/`;
  return toDistRoot(d, lang) + into + relPath || '.';
};

const attr = s => String(s).replace(/"/g, '&quot;');

/* The slot label is a photo brief ("Photo: the team at work — real faces").
   Alt text wants the subject only, without the brief's prefix or its aside. */
const altFrom = label => attr(
  label.replace(/^(Photo|Screenshot|Image|Map|Scan|Portrait photo|Lead image)\s*(:|\b)\s*/i, '')
       .replace(/\s+—.*$/, '')
       .trim() || label
);

/* Image slot.
   Renders the stock fallback photo for its category on top of the empty
   placeholder. The placeholder stays in the DOM underneath — if the CDN image
   fails to load, `onerror` hides the <img> and the placeholder shows through,
   so a slot is never blank.
   Pass `src` to use a real Accupro photo and skip the stock fallback entirely;
   pass `cat` to name the photo category explicitly instead of inferring it. */
export const slot = (label, { ratio = '16 / 9', px = '', icon = 'image', cls = '', fill = false, cat = '', src = '', seed = '', eager = false } = {}) => {
  const photo = src || resolvePhoto(label, { cat, ratio, px, seed });
  const cls_ = `imgslot${photo ? ' imgslot--photo' : ''}${fill ? ' imgslot--fill' : ''}${cls ? ' ' + cls : ''}`;
  const box = fill ? '' : ` style="--ratio:${ratio}"`;
  const ph = `${ic(icon, 26)}
  <span class="imgslot__label">${label}</span>${px ? `\n  <span class="imgslot__spec">${ratio.replace(/\s/g,'')} · ${px}</span>` : ''}`;

  if (!photo) return `<div class="${cls_}"${box} role="img" aria-label="${attr(label)}">
  ${ph}
</div>`;

  return `<div class="${cls_}"${box}>
  ${ph}
  <img src="${photo}" alt="${altFrom(label)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" onload="this.dataset.ok=1" onerror="this.hidden=true">
</div>`;
};

export const avatar = (label = 'Portrait', { src = '' } = {}) => {
  const photo = src || photoUrl('portrait', label, { ratio: '1 / 1', w: 96 });
  return `<div class="imgslot imgslot--avatar imgslot--photo">${ic('users', 18)}<img src="${photo}" alt="${attr(label)}" loading="lazy" decoding="async" onload="this.dataset.ok=1" onerror="this.hidden=true"></div>`;
};

export const crumbs = (d, trail) =>
`<nav class="crumbs" aria-label="Breadcrumb"><ol>
${trail.map((t, i) => i === trail.length - 1
  ? `  <li><span aria-current="page">${t.label}</span></li>`
  : `  <li><a href="${up(d)}${t.href}">${t.label}</a><span aria-hidden="true">/</span></li>`).join('\n')}
</ol></nav>`;

/* Every sub-page's banner: breadcrumb, then a contained split (text beside a
   framed photo) rather than a full-bleed photo band with text stacked below
   it. The old stacked version added the photo's height on top of the text's
   height; here they share the same row, so the section is only ever as tall
   as the taller of the two — consistently a few hundred px shorter, and it
   matches the homepage hero's visual language instead of a different pattern.
   `kicker` is the pre-rendered eyebrow/tag/icon row above the heading;
   `extra` is optional pre-rendered HTML after the lede (a search field, filter
   chips, buttons) for the handful of pages that need it. */
export const pageHero = (d, { crumbTrail, kicker, heading, lede, extra = '', shot, photoOpts = {} }) => `
<div class="container">${crumbs(d, crumbTrail)}</div>
<section class="pagehero">
  <div class="container pagehero__grid">
    <div class="pagehero__content">
      ${kicker}
      <h1>${heading}</h1>
      <p class="lede">${lede}</p>
      ${extra}
    </div>
    <div class="pagehero__frame">
      ${slot(shot, { ratio: '4 / 3', px: 'min 1000px', ...photoOpts })}
    </div>
  </div>
</section>`;

/* One tool's detail page: pageHero, then Input | Result+History+Bridge.
   `formHTML` is the only per-tool part — everything else (result rendering,
   history, copy button) is generic and driven by assets/js/calculators.js,
   keyed off `slug` via the form's data-tool attribute. `toolConfig` is
   inlined as window.TOOL_CONFIG for the four "Accupro-only" simulators,
   whose numbers are business placeholders meant to be edited in
   data/site.json — the five tax calculators use real, hardcoded rates
   instead and ignore this. */
export const toolShell = (d, C, { crumbTrail, kicker, heading, lede, shot, photoOpts, slug, formHTML, bridgeHref, bridgeLabel, bridgeText, resultLabel, toolConfig }) => `
${pageHero(d, { crumbTrail, kicker, heading, lede, shot, photoOpts })}
<section class="section">
  <div class="container">
    <div class="grid g2" style="align-items:start">
      <form class="card card--pad" id="tool-form" data-tool="${slug}" novalidate>
        <div class="cluster" style="gap:9px;margin-bottom:14px"><span style="color:var(--navy)">${ic('calc', 20)}</span><span class="eyebrow">Input</span></div>
        ${formHTML}
        <div class="cluster" style="margin-top:18px"><button class="btn btn--primary" type="submit" style="flex:1 1 auto">Calculate</button><button class="btn btn--quiet" type="reset">Reset</button></div>
      </form>
      <div class="stack" style="--s:16px">
        <div class="card card--navy card--pad">
          <div class="cluster" style="gap:9px;margin-bottom:12px"><span style="color:var(--navy)">${ic('chart', 20)}</span><span class="eyebrow">Result</span></div>
          <p class="eyebrow" style="color:var(--faint)">${resultLabel}</p>
          <p class="stat__v" id="result-headline" style="font-size:2.2rem;margin:4px 0 14px;word-break:break-word">—</p>
          <table class="dtable" id="result-table"><tbody></tbody></table>
          <p class="tiny" id="result-note" style="margin-top:10px"></p>
          <div class="cluster" style="margin-top:14px"><button class="btn btn--quiet" type="button" id="btn-copy">Copy result</button></div>
        </div>
        <div class="card card--surface card--pad">
          <div class="cluster" style="gap:9px;margin-bottom:8px"><span style="color:var(--navy)">${ic('clock', 19)}</span><span class="eyebrow">Calculation history</span></div>
          <ul class="stack" style="--s:8px" id="calc-history"></ul>
          <button class="btn btn--quiet btn--sm" type="button" id="btn-clear-history" style="margin-top:12px">Clear history</button>
        </div>
        <div class="card card--gold card--pad">
          <div class="cluster" style="gap:9px;margin-bottom:8px"><span style="color:var(--gold-700)">${ic('arrow', 19)}</span><span class="eyebrow eyebrow--gold">Bridge to a service</span></div>
          <h4>${bridgeText}</h4>
          <p class="small" style="margin-top:6px">We can verify this figure and handle the filing or application for you.</p>
          <a class="btn btn--gold btn--sm" style="margin-top:12px" href="${up(d)}${bridgeHref}">${bridgeLabel} ${ic('arrow', 15)}</a>
        </div>
      </div>
    </div>
  </div>
</section>
<section class="section section--surface">
  <div class="container">
    <div class="card card--pad cluster" style="gap:22px;flex-wrap:wrap">
      <span class="icon-lead" style="margin:0">${ic('scale', 30)}</span>
      <div><h3>This result is an estimate</h3>
      <p class="small" style="margin-top:6px">Figures are indicative and do not replace an official computation. Ask us to verify before you file or budget against it.</p></div>
      <a class="btn btn--primary" href="${up(d)}contact.html">Ask us to verify ${ic('arrow', 17)}</a>
    </div>
  </div>
</section>
${toolConfig ? `<script>window.TOOL_CONFIG = ${JSON.stringify(toolConfig)};</script>` : ''}
`;

/* Preview builds carry a robots meta tag on every page. This site is a verbatim
   rebuild of a live client site, so an indexable staging copy would compete with
   the real domain as duplicate content. Set PREVIEW=1 for a staging build. */
export const NOINDEX = process.env.PREVIEW === '1';

/* Keep canonical and social-preview URLs aligned with sitemap.xml. Preview
   builds override SITE_URL with their actual host; production defaults to the
   public Accupro domain. */
const SITE_URL = (process.env.SITE_URL || 'https://accuprointernational.co.id').replace(/\/$/, '');

/* `path` is the page's own dist-relative URL (e.g. 'services/tax-reporting/
   corporate-tax-processing.html') — used for the canonical link and og:url.
   `ogCat`/`ogSeed` reuse the same photo category + hash seed as that page's
   own hero image, via the same photoUrl() the hero itself calls, so the link
   preview shows the page's real hero photo instead of a generic placeholder
   or nothing at all. */
export const head = ({ title, desc, d = 0, path = '', ogCat = 'team-work', ogSeed = '', lang = 'en', T }) => {
  const pagePath = path.replace(/index\.html$/, '');
  const localizedUrl = code => `${SITE_URL}/${code === 'id' ? '' : `${code}/`}${pagePath}`;
  const url = localizedUrl(lang);
  const image = photoUrl(ogCat, ogSeed || path || title, { ratio: '1200 / 630', w: 1200 });
  return `<!doctype html>
<html lang="${lang === 'ch' ? 'zh-CN' : lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${attr(desc)}">${NOINDEX ? '\n<meta name="robots" content="noindex, nofollow">' : ''}
<link rel="canonical" href="${url}">
${LANGS.map(code => `<link rel="alternate" hreflang="${code === 'ch' ? 'zh-CN' : code}" href="${localizedUrl(code)}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${localizedUrl('id')}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Accupro">
<meta property="og:locale" content="${lang === 'ch' ? 'zh_CN' : lang === 'id' ? 'id_ID' : 'en_US'}">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${attr(title)}">
<meta name="twitter:description" content="${attr(desc)}">
<meta name="twitter:image" content="${image}">
<link rel="icon" href="${toDistRoot(d, lang)}assets/img/logo-accupro.png">
<link rel="stylesheet" href="https://unpkg.com/lenis@1.3.26/dist/lenis.css">
<link rel="stylesheet" href="${assetHref(d, lang, 'assets/css/style.css')}">
</head>
<body>
<a class="skip" href="#main">${T.skip}</a>`;
};

/* Section 1 on every single recapped page of the live site (see the .md
   files under content-recap/pages/) is this utility bar — email, office
   hours, social links, always in that order. It's real, page-wide content,
   so it belongs above the header here too, not just in the footer. */
export const utilityBar = (C, lang) => `
<div class="utility-bar"><div class="container utility-bar__row">
  <a href="mailto:${C.emails[0]}">${ic('mail', 14)} ${C.emails[0]}</a>
  <span class="utility-bar__hours">${ic('clock', 14)} ${C.hours[lang]}</span>
  <span class="utility-bar__socials">
    <a href="${C.social.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ic('ig', 15)}</a>
    <a href="${C.social.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${ic('fb', 15)}</a>
    <a href="${C.social.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn">${ic('li', 15)}</a>
  </span>
</div></div>`;

export const header = (active, d = 0, C, lang = 'en', T, relPath = '') => `
${utilityBar(C, lang)}
<header class="header">
  <div class="container header__bar">
    <a class="brand" href="${up(d)}index.html" aria-label="${C.legalName} — home">
      ${logoMark()}
      <span class="brand__name">ACCUPRO<span class="brand__sub">Tax · Legal · Business</span></span>
    </a>
    <nav class="nav" id="primary-nav" aria-label="Primary">
      ${navItems(T).map(n => `<a class="nav__link" href="${up(d)}${n.href}"${n.key === active ? ' aria-current="page"' : ''}>${n.label}</a>`).join('\n      ')}
      <div class="langs" aria-label="Language">
        ${LANGS.map(code => `<a href="${langHref(d, lang, code, relPath)}" hreflang="${code === 'ch' ? 'zh' : code}"${code === lang ? ' aria-current="true"' : ''}>${code === 'ch' ? '中文' : code.toUpperCase()}</a>`).join('')}
      </div>
    </nav>
    <div class="header__end">
      <div class="langs" aria-label="Language">
        ${LANGS.map(code => `<a href="${langHref(d, lang, code, relPath)}" hreflang="${code === 'ch' ? 'zh' : code}"${code === lang ? ' aria-current="true"' : ''}>${code === 'ch' ? '中文' : code.toUpperCase()}</a>`).join('')}
      </div>
      <a class="btn btn--primary btn--sm" href="${up(d)}contact.html">${T.headerCta}</a>
      <button class="burger" aria-expanded="false" aria-controls="primary-nav" aria-label="${T.menu}" data-menu-label="${T.menu}" data-close-label="${T.close}">${ic('menu', 22)}</button>
    </div>
  </div>
</header>`;

export const ctaBand = (d, C, CTA, T) => `
<section class="section section--navy">
  <div class="container split split--wide">
    <div class="stack" style="--s:18px">
      <span class="eyebrow eyebrow--gold">${T.freeConsultationEyebrow}</span>
      <h2>${CTA.heading}</h2>
      <p class="lede" style="color:#C3C7E6">${CTA.text}</p>
      <div class="cluster">
        <a class="btn btn--gold" href="https://wa.me/${C.whatsappIntl}" target="_blank" rel="noopener">${ic('whatsapp', 18)} ${C.whatsapp}</a>
        <a class="btn btn--onnavy" href="${up(d)}contact.html">Send an enquiry ${ic('arrow', 17)}</a>
      </div>
    </div>
    ${slot('Photo: consultant and client in discussion at the office', { ratio: '4 / 3', px: 'min 1400px', icon: 'users', cat: 'meeting' })}
  </div>
</section>`;

/* The footer's own column structure (Services / Company / Get in touch) is
   new navigation this rebuild adds, with no equivalent on the live site in
   any language — so, like 'tools'/'articles' in the header, it stays in
   English everywhere. Only the two fields that ARE real per-language copy
   (the tagline, and the office hours) are localized here. */
export const footer = (d, C, lang = 'en', extraJS = []) => `
<footer class="footer">
  <div class="container">
    <div class="footer__grid">
      <div>
        <a class="brand" href="${up(d)}index.html" style="margin-bottom:14px">${logoMark()}<span class="brand__name" style="color:#fff">ACCUPRO</span></a>
        <p>${C.tagline[lang]}</p>
        <div class="footer__socials">
          <a href="${C.social.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ic('ig', 19)}</a>
          <a href="${C.social.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${ic('fb', 19)}</a>
          <a href="${C.social.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn">${ic('li', 19)}</a>
          <a href="${C.social.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${ic('tt', 19)}</a>
        </div>
      </div>
      <div><h4>Services</h4><ul>
        <li><a href="${up(d)}services/tax-reporting/">Tax &amp; Reporting</a></li>
        <li><a href="${up(d)}services/tax-registration/">Registration &amp; Tax Accounts</a></li>
        <li><a href="${up(d)}services/company-legality/">Company Legality</a></li>
        <li><a href="${up(d)}services/stay-permits-visa/">Stay Permits &amp; Visa</a></li>
        <li><a href="${up(d)}services/trademark-ip/">Trademark &amp; IP</a></li>
      </ul></div>
      <div><h4>Company</h4><ul>
        <li><a href="${up(d)}about.html">About Us</a></li>
        <li><a href="${up(d)}about.html#team">Our Team</a></li>
        <li><a href="${up(d)}tools.html">Tools &amp; Calculators</a></li>
        <li><a href="${up(d)}articles.html">Articles</a></li>
        <li><a href="${up(d)}contact.html">Contact</a></li>
      </ul></div>
      <div><h4>Get in touch</h4><ul>
        <li>${C.addressLine}</li>
        <li>${C.addressLine2}</li>
        <li>${C.city}</li>
        <li><a href="tel:${C.phones[0].replace(/-/g,'')}">${C.phones[0]}</a></li>
        <li><a href="https://wa.me/${C.whatsappIntl}" target="_blank" rel="noopener">WhatsApp ${C.whatsapp}</a></li>
        <li><a href="mailto:${C.emails[0]}">${C.emails[0]}</a></li>
        <li>${C.hours[lang]}</li>
      </ul></div>
    </div>
    <div class="footer__base">
      <p>© <span data-year>2026</span> ${C.legalName}. All rights reserved.</p>
      <p><a href="#">Privacy Policy</a> · <a href="#">Terms</a> · <a href="${up(d)}services.html">Sitemap</a></p>
    </div>
  </div>
</footer>
<a class="wa-float" href="https://wa.me/${C.whatsappIntl}" target="_blank" rel="noopener">${ic('whatsapp', 20)} Chat with us</a>
<script src="https://unpkg.com/lenis@1.3.26/dist/lenis.min.js" defer></script>
<script src="${assetHref(d, lang, 'assets/js/main.js')}" defer></script>
${extraJS.map(src => `<script src="${assetHref(d, lang, src)}" defer></script>`).join('\n')}
</body>
</html>`;
