import { ic, logoMark } from './icons.mjs';
import { resolvePhoto, photoUrl } from './photos.mjs';

export const up = d => '../'.repeat(d);

export const NAVITEMS = [
  { href: 'index.html',    label: 'Home',     key: 'home' },
  { href: 'services.html', label: 'Services', key: 'services' },
  { href: 'tools.html',    label: 'Tools',    key: 'tools' },
  { href: 'about.html',    label: 'About Us', key: 'about' },
  { href: 'articles.html', label: 'Articles', key: 'articles' },
  { href: 'contact.html',  label: 'Contact',  key: 'contact' }
];

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

/* Preview builds carry a robots meta tag on every page. This site is a verbatim
   rebuild of a live client site, so an indexable staging copy would compete with
   the real domain as duplicate content. Set PREVIEW=1 for a staging build. */
export const NOINDEX = process.env.PREVIEW === '1';

/* Matches the SITE_URL build environment variable already declared in
   netlify.toml, so link previews resolve to the deployed preview URL without
   a second place to configure it. */
const SITE_URL = (process.env.SITE_URL || 'https://accupro-preview.netlify.app').replace(/\/$/, '');

/* `path` is the page's own dist-relative URL (e.g. 'services/tax-reporting/
   corporate-tax-processing.html') — used for the canonical link and og:url.
   `ogCat`/`ogSeed` reuse the same photo category + hash seed as that page's
   own hero image, via the same photoUrl() the hero itself calls, so the link
   preview shows the page's real hero photo instead of a generic placeholder
   or nothing at all. */
export const head = ({ title, desc, d = 0, path = '', ogCat = 'team-work', ogSeed = '' }) => {
  const url = `${SITE_URL}/${path.replace(/index\.html$/, '')}`;
  const image = photoUrl(ogCat, ogSeed || path || title, { ratio: '1200 / 630', w: 1200 });
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${attr(desc)}">${NOINDEX ? '\n<meta name="robots" content="noindex, nofollow">' : ''}
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Accupro">
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
<link rel="icon" href="${up(d)}assets/img/logo-accupro.png">
<link rel="stylesheet" href="https://unpkg.com/lenis@1.3.26/dist/lenis.css">
<link rel="stylesheet" href="${up(d)}assets/css/style.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>`;
};

export const header = (active, d = 0, C) => `
<header class="header">
  <div class="container header__bar">
    <a class="brand" href="${up(d)}index.html" aria-label="${C.legalName} — home">
      ${logoMark()}
      <span class="brand__name">ACCUPRO<span class="brand__sub">Tax · Legal · Business</span></span>
    </a>
    <nav class="nav" id="primary-nav" aria-label="Primary">
      ${NAVITEMS.map(n => `<a class="nav__link" href="${up(d)}${n.href}"${n.key === active ? ' aria-current="page"' : ''}>${n.label}</a>`).join('\n      ')}
      <div class="langs" aria-label="Language">
        <a href="#" hreflang="id">ID</a><a href="#" hreflang="en" aria-current="true">EN</a><a href="#" hreflang="zh">中文</a>
      </div>
    </nav>
    <div class="header__end">
      <div class="langs" aria-label="Language">
        <a href="#" hreflang="id">ID</a><a href="#" hreflang="en" aria-current="true">EN</a><a href="#" hreflang="zh">中文</a>
      </div>
      <a class="btn btn--primary btn--sm" href="${up(d)}contact.html">Free consultation</a>
      <button class="burger" aria-expanded="false" aria-controls="primary-nav" aria-label="Open menu">${ic('menu', 22)}</button>
    </div>
  </div>
</header>`;

export const ctaBand = (d, C, CTA) => `
<section class="section section--navy">
  <div class="container split split--wide">
    <div class="stack" style="--s:18px">
      <span class="eyebrow eyebrow--gold">Free consultation</span>
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

export const footer = (d, C) => `
<footer class="footer">
  <div class="container">
    <div class="footer__grid">
      <div>
        <a class="brand" href="${up(d)}index.html" style="margin-bottom:14px">${logoMark()}<span class="brand__name" style="color:#fff">ACCUPRO</span></a>
        <p>${C.tagline}</p>
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
        <li>${C.hours}</li>
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
<script src="${up(d)}assets/js/main.js" defer></script>
</body>
</html>`;
