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
   language's own root. langHref computes the link from the current page
   (depth `d` within its own language root) to that sibling: climb out of
   the current language root (one extra '../' unless we're already at the
   true root, i.e. lang 'id'), then step into the target language's root
   (skip that step for 'id'), then append the shared relPath. */
/* dist/assets/ is shared by all three language trees rather than duplicated
   under en/ and ch/ — so a page also needs one extra '../' to reach it
   whenever it sits inside a language subfolder. Same escape distance as
   langHref needs to reach another language's root. */
export const toDistRoot = (d, lang) => up(d) + (lang === 'id' ? '' : '../');

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

/* A single, fixed-height (400px) banner used as the first section on every
   page except the home page (which gets the slider instead). Replaces
   whatever richer, page-specific "hero" content used to open each page —
   that content (photo, facts, stats, forms) moves into its own section
   right below, nothing is dropped, just re-ordered. */
export const pageBanner = (d, { eyebrow = '', title, lede = '', trail, photoCat = '', photoSeed = '' }) => `
<section class="page-banner">
  ${photoCat ? `<div class="page-banner__bg"><img src="${photoUrl(photoCat, photoSeed, { ratio: '21 / 9', w: 1600 })}" alt="" loading="eager"></div>` : ''}
  <div class="container page-banner__content">
    ${trail ? crumbs(d, trail) : ''}
    ${eyebrow ? `<span class="tag">${eyebrow}</span>` : ''}
    <h1>${title}</h1>
    ${lede ? `<p class="lede">${lede}</p>` : ''}
  </div>
</section>`;

/* Preview builds carry a robots meta tag on every page. This site is a verbatim
   rebuild of a live client site, so an indexable staging copy would compete with
   the real domain as duplicate content. Set PREVIEW=1 for a staging build. */
export const NOINDEX = process.env.PREVIEW === '1';

export const head = ({ title, desc, d = 0, lang = 'en', T }) => `<!doctype html>
<html lang="${lang === 'ch' ? 'zh-CN' : lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">${NOINDEX ? '\n<meta name="robots" content="noindex, nofollow">' : ''}
<link rel="icon" href="${toDistRoot(d, lang)}assets/img/logo-accupro.png">
<link rel="stylesheet" href="${toDistRoot(d, lang)}assets/css/style.css">
</head>
<body>
<a class="skip" href="#main">${T.skip}</a>`;

/* Section 1 on every single recapped page (see the .md files under
   content-recap/pages/) is this utility bar — email, office hours, social
   links — always in that order, on every language. It's real, page-wide
   content, so it belongs above the header on every page here too, not just
   in the footer. */
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
   any language — so like 'tools'/'articles' in the header, it stays in
   English everywhere. Only the two fields that ARE real per-language copy
   (the tagline, and the office hours) are localized here. */
export const footer = (d, C, lang = 'en') => `
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
<script src="${toDistRoot(d, lang)}assets/js/main.js" defer></script>
</body>
</html>`;
