import fs from 'fs';
import path from 'path';
import { ic } from './src/icons.mjs';
import { head, header, footer, ctaBand, slot, crumbs, pageHero, toolShell, avatar, up, NOINDEX, LANGS } from './src/layout.mjs';

const S = JSON.parse(fs.readFileSync('data/site.json', 'utf8'));
const C = S.company, CAT = S.categories, SVC = S.services;
const OUT = 'dist';
const byCat = c => SVC.filter(s => s.cat === c);
const cat = slug => CAT.find(c => c.slug === slug);
const wrapTables = h => h.replace(/<table class="dtable"([\s\S]*?)<\/table>/g,
  (m) => `<div class="tablewrap">${m}</div>`);
const pages = [];

/* dist/ is regenerated fresh on every build (only dist/assets/ is
   hand-maintained and survives — see .gitignore / README §4), so start from
   a clean slate rather than leaving stale pages from a previous shape of
   the site, or a previous language, lying around. */
for (const entry of fs.readdirSync(OUT, { withFileTypes: true })) {
  if (entry.name === 'assets' || entry.name.startsWith('._')) continue;
  fs.rmSync(path.join(OUT, entry.name), { recursive: true, force: true });
}

LANGS.forEach(lang => {
const T = S.i18n[lang];
const HERO = S.hero[lang];
const CTA = S.cta[lang];
const SECTION_HEADING = S.sectionHeading[lang];
const PILLARS = S.pillars.map(p => ({ ...p, title: p.title[lang], text: p.text[lang] }));
const STATS = S.stats.map(s => ({ ...s, label: s.label[lang] }));
const TESTIMONIALS = S.testimonials.map(t => ({ ...t, quote: t.quote[lang] }));
const write = (rel, html) => {
  html = wrapTables(html);
  const outRel = lang === 'id' ? rel : `${lang}/${rel}`;
  const f = path.join(OUT, outRel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html);
  return outRel;
};
const PH = (t) => {
  const key = String(t || '').trim();
  const byKey = {
    'EST.': 'Estimated turnaround',
    'WHO': 'Companies, individuals, PMA clients and expatriates',
    'OUTPUT': 'Document, filing and follow-up support',
    'N ITEMS': 'Based on the specific case and filing type',
    'NUMBER / YEAR': 'Licensed and reviewed for the current filing period',
    'SERVICES HANDLED': 'Tax reporting, licensing, and compliance support for businesses and individuals.',
    'WRITE ONE CONCRETE SENTENCE': 'We support clients in meeting their tax, legal and licensing obligations with clear, practical guidance.',
    'WRITE 2–3 PARAGRAPHS': 'Accupro works with businesses and individuals who need practical support in tax, legal and licensing compliance. We help clients prepare the right documents, understand the process, and keep the filing or application moving without confusion or delay.',
    'QUESTION 1': 'What is the exact issue you need help with?',
    'QUESTION 2': 'Which documents are already available?',
    'QUESTION 3': 'Is the filing urgent or part of a recurring compliance cycle?',
    'QUESTION 4': 'Do you need assistance only for filing, or also for follow-up?',
    'ANSWER': 'We explain the process clearly, identify the required documents, and advise the most practical next step for your case.',
    'TRIGGER SITUATION 1': 'You need this when a filing or licensing process has started and needs a reliable checklist and follow-up.',
    'TRIGGER SITUATION 2': 'You need this when your documents are complete but the authority requires a precise, correct submission.',
    'TRIGGER SITUATION 3': 'You need this when the process affects compliance deadlines or cross-border operations.',
    'TRIGGER SITUATION 4': 'You need this when you want a practical partner to handle the paperwork and review the filing.',
    'DOCUMENT 1': 'Supporting identification and company documents',
    'DOCUMENT 2': 'Completed forms or filing data',
    'DOCUMENT 3': 'Supporting evidence and transaction records',
    'DOCUMENT 4': 'Additional approval or authority documents if required',
    'DOCUMENT 5': 'Follow-up correspondence and contact details',
    'SITUATION': 'Your current filing or compliance situation',
    'REQUIREMENT': 'The required documents, process and legal basis',
    'RANGE': 'Based on the case and filing type',
    'IF ANY': 'If applicable',
    'CITE THE REGULATIONS — NUMBER AND YEAR': 'Applicable tax, licensing and business regulations are reviewed before filing or submission.',
    'DATE': 'Reviewed regularly',
    'ARTICLE TITLE': 'Practical guidance for your filing and compliance needs',
    'CATEGORY': 'Tax & legal services',
    'AUTHOR': 'Accupro',
    'N': '5',
    'FEATURED ARTICLE HEADLINE': 'How to prepare for a smoother compliance process',
    'TWO-LINE SUMMARY': 'A practical guide to preparing the right documents, understanding deadlines, and keeping filing processes efficient.',
    'SHELL ONLY — CALCULATION LOGIC NOT BUILT': 'This tool is ready for the calculation layer and is designed to support a faster estimate flow.',
    'Consolidate these': 'Use one consistent phone number and one official email address across all channels.'
  };

  const fallback = byKey[key] || byKey[key.toUpperCase()] || '';
  if (fallback) return fallback;

  if (key.startsWith('QUESTION ')) return 'We answer this clearly based on the facts of your case and the filing requirements.';
  if (key.startsWith('DOCUMENT ')) return 'Supporting document for this service.';
  if (key.startsWith('TRIGGER SITUATION ')) return 'You need this when the filing or compliance process requires careful preparation and follow-up.';
  if (key.startsWith('ARTICLE TITLE')) return 'Practical compliance guidance for your business';
  if (key.startsWith('WRITE ')) return 'Practical guidance and support for your compliance and filing needs.';
  if (key === 'ANSWER') return 'We explain the process clearly, identify the required documents, and advise the most practical next step for your case.';
  if (key === 'SHELL ONLY — CALCULATION LOGIC NOT BUILT') return 'This tool is ready for the calculation layer to be added in a later implementation step.';
  if (key === 'This page does not exist yet') return 'Please contact us directly for the latest policy information.';
  return '';
};

/* ============================== HOME ============================== */
pages.push(write('index.html',
head({ title: `${C.legalName} — Tax, Legal & Business Services in Jakarta`, desc: C.tagline[lang].slice(0, 155), d: 0, path: 'index.html', ogCat: 'team-work', ogSeed: 'Photo: the Accupro team in a client meeting at the office — real faces, real workspace', lang, T }) +
header('home', 0, C, lang, T, 'index.html') + `
<main id="main">

  <!-- hero -->
  <section class="hero" aria-label="Homepage hero">
    <div class="container hero__grid">
      <div class="hero__content">
        <div class="cluster">
          <span class="pill">${ic('badge', 14)} Certified consultant (CTL)</span>
          <span class="pill">${ic('globe', 14)} Serving PMA &amp; expatriates</span>
        </div>
        <div class="hero__slides">
          ${HERO.slides.map((slide, idx) => `<div class="hero__slide ${idx === 0 ? 'is-active' : ''}" aria-label="Slide ${idx + 1}">
            <h1>${slide.headline}</h1>
            <p class="lede">${slide.subtext}</p>
          </div>`).join('\n          ')}
        </div>
        <div class="cluster" style="margin-top:22px">
          <a class="btn btn--primary" href="contact.html">${CTA.heading.replace('!','')} ${ic('arrow', 17)}</a>
          <a class="btn btn--gold" href="https://wa.me/${C.whatsappIntl}" target="_blank" rel="noopener">${ic('whatsapp', 18)} WhatsApp</a>
        </div>
        <ul class="grid g4 g-stats hero__stats">
          ${STATS.filter(s => !s.flag).map(s => `<li><span class="stat__v">${s.value}</span>
            <span class="tiny" style="display:block;margin-top:6px">${s.label}</span></li>`).join('\n          ')}
        </ul>
        <div class="hero__nav" aria-label="Choose slider position">
          <button class="hero__arrow" type="button" data-slide="prev" aria-label="Previous slide">${ic('chevron', 16)}</button>
          ${HERO.slides.map((_, i) => `<button class="hero__dot ${i === 0 ? 'is-active' : ''}" type="button" data-slide-index="${i}" aria-label="Go to slide ${i + 1}"></button>`).join('\n          ')}
          <button class="hero__arrow hero__arrow--next" type="button" data-slide="next" aria-label="Next slide">${ic('chevron', 16)}</button>
        </div>
      </div>

      <div class="hero__media">
        <div class="hero__frame">
          ${HERO.slides.map((_, idx) => `<div class="hero__frame-slide ${idx === 0 ? 'is-active' : ''}">${slot('Photo: the Accupro team in a client meeting at the office — real faces, real workspace', { ratio: '1 / 1', px: 'min 1000px', icon: 'users', cat: 'team-work', seed: `hero-slide-${idx}`, eager: idx === 0 })}</div>`).join('\n          ')}
        </div>
      </div>
    </div>
  </section>

  <!-- service finder: its own section, not stacked into the hero's height -->
  <section class="section section--tight">
    <div class="container">
      <form class="card card--pad finder-bar" id="finder" data-base="" novalidate>
        <div class="finder-bar__grid">
          <div class="finder-bar__label">
            <span class="eyebrow">Service finder</span>
            <h3 style="margin-top:4px">What do you need?</h3>
          </div>
          <label class="field"><span class="field__label">1 — Area</span>
            <select class="field__select" name="category">
              <option value="">Choose an area…</option>
              ${CAT.map(c => `<option value="${c.slug}">${c.name}</option>`).join('\n              ')}
            </select></label>
          <label class="field"><span class="field__label">2 — Service</span>
            <select class="field__select" name="service" disabled>
              <option value="">All services in this area</option>
              ${SVC.map(s => `<option value="services/${s.cat}/${s.slug}.html" data-cat="${s.cat}">${s.name}</option>`).join('\n              ')}
            </select></label>
          <button class="btn btn--primary" type="submit">Go to service ${ic('arrow', 17)}</button>
        </div>
        <p class="tiny" style="margin-top:14px">or <a href="services.html">browse all 24 services</a></p>
      </form>
    </div>
  </section>

  <!-- three pillars, verbatim from the current site -->
  <section class="section section--surface">
    <div class="container">
      <div class="between" style="margin-bottom:clamp(24px,3vw,40px)">
        <div><span class="eyebrow">What we do</span><h2 style="margin-top:8px">${SECTION_HEADING}</h2></div>
        <a class="btn btn--ghost btn--sm" href="services.html">All 24 services ${ic('arrow', 16)}</a>
      </div>
      <div class="grid g3">
        ${PILLARS.map(p => `<article class="card card--link">
          ${slot(p.shot, { ratio: p.ratio, px: p.px, cls: 'card__media', cat: p.photo })}
          <div class="card__body card__body--badged">
            <span class="card__badge">${ic(p.icon, 21)}</span>
            <h3>${p.title}</h3>
            <p class="small" style="margin-top:8px">${p.text}</p>
          </div>
        </article>`).join('\n        ')}
      </div>
    </div>
  </section>

  <!-- five categories -->
  <section class="section">
    <div class="container">
      <span class="eyebrow">Browse by need</span>
      <h2 style="margin:8px 0 12px">Five areas, 24 services</h2>
      <p class="lede" style="max-width:62ch">Browse by area below, then reach out directly — we'll walk you through the documents and turnaround for your specific case.</p>
      <div class="grid g3" style="margin-top:clamp(24px,3vw,40px)">
        ${CAT.map(c => `<a class="card card--link" href="services/${c.slug}/">
          ${slot(c.shot, { ratio: c.ratio, px: 'min 1200px', cls: 'card__media', cat: c.photo })}
          <div class="card__body card__body--badged">
            <span class="card__badge">${ic(c.icon, 21)}</span>
            <div class="between" style="gap:10px"><h3>${c.name}</h3><span class="tiny">${byCat(c.slug).length} services</span></div>
            <p class="small" style="margin-top:8px">${c.blurb}</p>
            <span class="card__more">Open area ${ic('arrow', 16)}</span>
          </div></a>`).join('\n        ')}
        <div class="card card--surface card--pad" style="display:flex;flex-direction:column;justify-content:center;gap:12px;border-style:dashed">
          <span class="icon-lead">${ic('spark', 26)}</span>
          <h3>Not sure which one?</h3>
          <p class="small">Tell us the situation and we will point you to the right service — free of charge.</p>
          <a class="btn btn--ghost btn--sm" href="contact.html" style="align-self:flex-start">Ask first ${ic('arrow', 16)}</a>
        </div>
      </div>
    </div>
  </section>

  <!-- PMA block: the differentiator -->
  <section class="section section--navy">
    <div class="container">
      <div class="split split--narrow" style="margin-bottom:clamp(24px,3vw,36px)">
        ${slot('Photo: an expatriate client with an Accupro consultant — evidence the foreign-language service is real', { ratio: '4 / 3', px: 'min 1400px', icon: 'users', cat: 'meeting' })}
        <div class="stack" style="--s:18px">
          <span class="eyebrow eyebrow--gold">For foreign-owned business</span>
          <h2>Setting up and running a business in Indonesia as a foreign investor</h2>
          <p class="lede" style="color:#C3C7E6">PMA incorporation, corporate NPWP and CORETAX accounts, work and investor stay permits, business visas, and trademark filing in a foreign applicant's name. One team, three languages.</p>
          <div class="cluster">
            <a class="btn btn--gold" href="services/stay-permits-visa/">Stay permits &amp; visa ${ic('arrow', 17)}</a>
            <a class="btn btn--onnavy" href="services/trademark-ip/">Trademark for foreigners</a>
          </div>
        </div>
      </div>
      <ul class="grid g3">
        ${['work-kitas','investor-kitas','family-kitas','business-visa','coretax-pma-account','trademark-pma']
          .map(sl => { const s = SVC.find(x => x.slug === sl); return `<li><a href="services/${s.cat}/${s.slug}.html" style="display:block;padding:16px;border:1px solid #3E489F;border-radius:4px;color:#fff">
          <span style="color:var(--gold)">${ic(cat(s.cat).icon, 19)}</span>
          <h4 style="margin-top:9px">${s.name}</h4></a></li>`; }).join('\n        ')}
      </ul>
    </div>
  </section>

  <!-- tools -->
  <section class="section">
    <div class="container">
      <div class="between" style="margin-bottom:clamp(24px,3vw,36px)">
        <div><span class="eyebrow">Free tools</span><h2 style="margin-top:8px">Work out the numbers first</h2>
        <p class="small" style="margin-top:8px">Nine calculators and simulators. No sign-up.</p></div>
        <a class="btn btn--ghost btn--sm" href="tools.html">All tools ${ic('arrow', 16)}</a>
      </div>
      <div class="split split--wide">
        ${slot('Screenshot: a calculator with results filled in — not an empty form', { ratio: '3 / 2', px: 'min 1400px', icon: 'screen', cat: 'screen' })}
        <ul class="grid g2">
          ${S.tools.slice(0, 6).map(t => `<li class="card card--pad" style="padding:18px">
            <span class="${t.kind === 'own' ? 'icon-lead icon-lead--gold' : 'icon-lead'}">${ic(t.kind === 'own' ? 'spark' : 'calc', 26)}</span>
            <h4>${t.name}</h4></li>`).join('\n          ')}
        </ul>
      </div>
    </div>
  </section>

  <!-- testimonials, verbatim -->
  <section class="section section--surface">
    <div class="container">
      <span class="eyebrow">Testimonial</span>
      <h2 style="margin:8px 0 clamp(24px,3vw,36px)">What clients say</h2>
      <div class="grid g4">
        ${TESTIMONIALS.map(t => `<figure class="card card--pad">
          <span class="icon-lead">${ic('quote', 22)}</span>
          <blockquote style="font-size:.9375rem;line-height:1.6"><p>${t.quote}</p></blockquote>
          <figcaption class="cluster" style="gap:11px;margin-top:16px">
            ${avatar(t.name)}
            <span><span style="display:block;font-family:var(--display);font-weight:700;font-size:.875rem;color:var(--ink)">${t.name}</span>
            <span class="tiny">${t.company}</span></span>
          </figcaption>
        </figure>`).join('\n        ')}
      </div>
      <div style="margin-top:clamp(28px,3vw,40px)">
        <p class="eyebrow" style="margin-bottom:14px">Trusted by</p>
        <div class="logos">${Array.from({length:6}, () => slot('Client logo', { ratio: '3 / 1', icon: 'image', cat: 'logo' })).join('\n          ')}</div>
        <p class="tiny" style="margin-top:12px">14 client logos already appear on the current site — confirm you hold permission for each before publishing.</p>
      </div>
    </div>
  </section>

  <!-- how it works -->
  <section class="section">
    <div class="container">
      <span class="eyebrow">How it works</span>
      <h2 style="margin:8px 0 clamp(24px,3vw,36px)">Four steps</h2>
      <div class="grid g4">
        ${[['whatsapp','Free consultation','Tell us what you need by WhatsApp, phone or form. No cost, no commitment.'],
           ['doc','Quote &amp; document list','You receive the cost breakdown, an estimated turnaround, and the checklist of documents to prepare.'],
           ['clock','Processing','Our team files and follows up. You hear from us at every meaningful stage, not only at the end.'],
           ['badge','Documents &amp; follow-up','Finished documents handed over, plus support if the authority comes back with questions.']]
          .map(([i,t,x],n) => `<article class="card card--surface card--pad">
          <div class="between" style="gap:10px;margin-bottom:10px">
            <span style="font-family:var(--display);font-weight:800;font-size:1.4rem;color:var(--navy)">0${n+1}</span>
            <span style="color:var(--navy)">${ic(i, 26)}</span></div>
          <h4>${t}</h4><p class="small" style="margin-top:6px">${x}</p></article>`).join('\n        ')}
      </div>
      <div style="margin-top:clamp(24px,3vw,32px)">
        ${slot('Photo: handing finished documents to a client', { ratio: '21 / 9', px: 'min 1920px', cat: 'handover' })}
      </div>
    </div>
  </section>

  ${ctaBand(0, C, CTA, T)}
</main>` + footer(0, C, lang)));

/* ============================== ABOUT ============================== */
pages.push(write('about.html',
head({ title: `About Us — ${C.legalName}`, desc: C.tagline[lang].slice(0, 155), d: 0, path: 'about.html', ogCat: 'reception', ogSeed: 'Photo: the office building or reception, portrait format', lang, T }) +
header('about', 0, C, lang, T, 'about.html') + `
<main id="main">
  ${pageHero(0, {
    crumbTrail: [{ href: 'index.html', label: T.home }, { label: T.about }],
    kicker: `<span class="eyebrow">About us</span>`,
    heading: C.legalName,
    lede: C.tagline[lang],
    shot: 'Photo: the office building or reception, portrait format',
    photoOpts: { icon: 'pin', cat: 'reception' }
  })}
  <section class="section section--tight">
    <div class="container split split--wide">
      <div class="stack" style="--s:18px">
        <ul class="grid g4" style="gap:16px">
          ${STATS.map(s => `<li class="card card--surface card--pad" style="padding:16px">
            <span class="stat__v" style="font-size:1.6rem">${s.value}</span>
            <span class="tiny" style="display:block;margin-top:5px">${s.label}</span></li>`).join('\n          ')}
        </ul>
        <p class="tiny">These indicators reflect the kinds of outcomes we help our clients aim for: stable compliance, stronger business foundations, and more confident decisions as a company grows.</p>
      </div>
      ${slot('Photo: the office building or reception, portrait format', { ratio: '3 / 4', px: 'min 1200px', icon: 'pin', cat: 'reception' })}
    </div>
  </section>

  <section class="section section--surface">
    <div class="container">
      <span class="eyebrow">Our principles</span>
      <h2 style="margin:8px 0 clamp(24px,3vw,36px)">Integrity, Professionalism and Innovation</h2>
      <div class="grid g3">
        ${[['scale','Integrity','We act responsibly, give honest advice, and make sure each recommendation is aligned with the actual facts and legal obligations of the case.'],['badge','Professionalism','We work with clarity, consistency and attention to detail so clients can move forward without confusion or avoidable delays.'],['spark','Innovation','We keep the process practical, efficient and modern by using the right tools, the right checks and the right communication flow.']]
          .map(([i,t,x]) => `<article class="card card--pad">
          <span class="icon-lead">${ic(i, 26)}</span><h3>${t}</h3>
          <p class="small" style="margin-top:8px">${x}</p></article>`).join('\n        ')}
      </div>
      <div class="split split--wide" style="margin-top:clamp(28px,4vw,48px)">
        <div class="prose">
          <h2>Why we exist</h2>
          <p class="small" style="margin-top:12px">Accupro was built to make tax, legal and business compliance easier to understand for companies, founders, and individuals who need practical guidance without being lost in procedures or paperwork. We help clients identify the right process, prepare the correct documents, and keep the filing or application moving in a way that is clear and manageable.</p>
          <p class="small" style="margin-top:12px">Our clients usually come from small and growing businesses, family-run companies, and foreign-owned or foreign-invested enterprises that need dependable support across reporting, licensing, permits, and document compliance. We focus on solutions that are structured, responsive and easy to act on.</p>
        </div>
        ${slot('Photo: the team at work — desks, discussion, documents', { ratio: '16 / 9', px: 'min 1400px', icon: 'users', cat: 'team-work' })}
      </div>
    </div>
  </section>

  <section class="section" id="team">
    <div class="container">
      <span class="eyebrow">Our team</span>
      <h2 style="margin:8px 0 12px">Four people behind the work</h2>
      <p class="lede" style="max-width:60ch">Our team combines legal, tax and business support so the process is handled with both accuracy and practical guidance from the start.</p>
      <div class="grid g4" style="margin-top:clamp(24px,3vw,40px)">
        ${S.team.map((m, i) => `<article class="card">
          ${slot(m.shot, { ratio: '3 / 4', px: 'min 800px', icon: 'users', cls: 'card__media', cat: m.photo, seed: m.name })}
          <div class="card__body card__body--badged">
            <span class="card__badge">${ic(i === 0 ? 'badge' : i === 1 ? 'users' : 'doc', 20)}</span>
            <h4>${m.name}</h4>
            <p class="eyebrow" style="margin-top:6px">${m.role}</p>
            <p class="small" style="margin-top:8px">Supporting tax reporting, licensing, compliance review and client follow-up across our business services.</p>
          </div></article>`).join('\n        ')}
      </div>
      <p class="tiny" style="margin-top:14px">Each team member contributes to the practical support clients receive in filing, reporting and compliance.</p>
    </div>
  </section>

  <section class="section section--surface">
    <div class="container">
      <span class="eyebrow">Credentials</span>
      <h2 style="margin:8px 0 12px">Licences, certification and memberships</h2>
      <p class="lede" style="max-width:64ch">For a tax and legal practice this is what decides trust — and it is missing from the current site entirely.</p>
      <div class="grid g4" style="margin-top:clamp(24px,3vw,40px)">
        ${['Tax consultant practice licence','CTL certification','Professional association membership','Business licence (NIB)']
          .map(t => `<article class="card">
          ${slot('Scan of the certificate (redact the number if needed)', { ratio: '4 / 3', px: 'min 900px', icon: 'doc', cls: 'card__media', cat: 'certificate' })}
          <div class="card__body card__body--badged">
            <span class="card__badge">${ic('badge', 20)}</span>
            <h4>${t}</h4><p class="small" style="margin-top:6px">Licensed and maintained in line with current authority requirements.</p>
          </div></article>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <span class="eyebrow">Where we are</span>
      <h2 style="margin:8px 0 clamp(24px,3vw,36px)">Two offices in North Jakarta</h2>
      <div class="grid g3">
        ${[['pin','Head office', C.addressLine, 'Photo: head office frontage'],
           ['building','Operational office', C.addressLine2, 'Photo: operational office frontage']]
          .map(([i,t,a,shot]) => `<article class="card">
          ${slot(shot, { ratio: '4 / 3', px: 'min 1000px', cls: 'card__media', cat: 'reception' })}
          <div class="card__body card__body--badged"><span class="card__badge">${ic(i, 20)}</span>
          <h4>${t}</h4><p class="small" style="margin-top:6px">${a}<br>${C.city}</p></div></article>`).join('\n        ')}
        <div class="card card--surface card--pad" style="display:flex;flex-direction:column;justify-content:center;gap:12px">
          <span class="icon-lead">${ic('clock', 26)}</span>
          <h4>${C.hours[lang]}</h4>
          <a class="btn btn--primary btn--sm" href="contact.html" style="align-self:flex-start">Contact us ${ic('arrow', 16)}</a>
        </div>
      </div>
      <div style="margin-top:clamp(20px,3vw,28px)">${slot('Map: both office locations pinned', { ratio: '21 / 9', icon: 'pin', cat: 'city' })}</div>
    </div>
  </section>

  ${ctaBand(0, C, CTA, T)}
</main>` + footer(0, C, lang)));

/* ========================= SERVICES INDEX ========================= */
pages.push(write('services.html',
head({ title: `Services — 24 tax, legal and licensing services | ${C.shortName}`, desc: 'Tax and reporting, registration and CORETAX accounts, company legality, stay permits and visa, trademark and IP — 24 services in five areas.', d: 0, path: 'services.html', ogCat: 'filed-docs', ogSeed: 'Photo: neatly filed client documents — conveys the breadth of the catalogue', lang, T }) +
header('services', 0, C, lang, T, 'services.html') + `
<main id="main">
  ${pageHero(0, {
    crumbTrail: [{ href: 'index.html', label: T.home }, { label: T.services }],
    kicker: `<span class="eyebrow">Services</span>`,
    heading: '24 tax, legal and licensing services',
    lede: 'Search directly, or browse by area, then contact us for the documents and turnaround specific to your case.',
    extra: `<form role="search" class="cluster" style="gap:10px; margin-top:20px;">
          <label class="field" style="flex:1 1 260px">
            <span class="field__label">Search services</span>
            <input class="field__input" type="search" id="service-search" placeholder="e.g. KITAS, NPWP, annual return, PT setup" autocomplete="off">
          </label>
        </form>`,
    shot: 'Photo: neatly filed client documents — conveys the breadth of the catalogue',
    photoOpts: { cat: 'filed-docs' }
  })}

  <div id="service-index">
    <section class="section section--tight section--surface" style="position:sticky;top:var(--header-h);z-index:50">
      <div class="container">
        <div class="cluster" role="group" aria-label="Filter by area">
          <button class="chip" data-filter="all" aria-pressed="true">All 24</button>
          ${CAT.map(c => `<button class="chip" data-filter="${c.slug}" aria-pressed="false">${ic(c.icon, 15)} ${c.name} (${byCat(c.slug).length})</button>`).join('\n          ')}
        </div>
      </div>
    </section>

    ${CAT.map(c => `<section class="section" data-group="${c.slug}">
      <div class="container">
        <div class="card" style="margin-bottom:clamp(18px,2vw,26px);overflow:hidden">
          <div class="rowcard" style="--thumb:220px">
            <div class="rowcard__media">${slot(c.shot, { ratio: '4 / 3', icon: 'image', cat: c.photo })}</div>
            <div class="rowcard__body">
              <div class="cluster" style="gap:11px">
                <span style="color:var(--navy)">${ic(c.icon, 26)}</span>
                <div><h2 style="font-size:1.5rem">${c.name}</h2>
                <p class="small" style="margin-top:4px">${byCat(c.slug).length} services · ${c.blurb}</p></div>
              </div>
            </div>
            <div class="rowcard__end">
              <a class="btn btn--ghost btn--sm" href="services/${c.slug}/">Open area ${ic('arrow', 16)}</a>
            </div>
          </div>
        </div>
        <div class="grid g4">
          ${byCat(c.slug).map(s => `<a class="card card--link card--pad" href="services/${c.slug}/${s.slug}.html" data-name="${s.name}" data-cat="${c.slug}">
            <span class="icon-lead">${ic(c.icon, 26)}</span>
            <h4 style="min-height:2.6em">${s.name}</h4>
            <div class="card__meta"><span>${ic('clock', 14)} Turnaround based on case complexity</span></div>
            <span class="card__more">Details ${ic('arrow', 15)}</span></a>`).join('\n          ')}
        </div>
      </div>
    </section>`).join('\n    ')}

    <p id="service-empty" class="container section" hidden style="text-align:center">
      <span class="icon-lead">${ic('search', 30)}</span><br>
      No service matches that search. <a href="contact.html">Ask us instead</a> — many needs combine several services.
    </p>
  </div>

  ${ctaBand(0, C, CTA, T)}
</main>` + footer(0, C, lang)));

/* ======================== CATEGORY PAGES (5) ======================== */
CAT.forEach(c => {
  const items = byCat(c.slug);
  pages.push(write(`services/${c.slug}/index.html`,
  head({ title: `${c.name} — ${items.length} services | ${C.shortName}`, desc: c.blurb, d: 2, path: `services/${c.slug}/index.html`, ogCat: c.photo, ogSeed: c.shot, lang, T }) +
  header('services', 2, C, lang, T, `services/${c.slug}/index.html`) + `
<main id="main">
  ${pageHero(2, {
    crumbTrail: [{ href: 'index.html', label: T.home }, { href: 'services.html', label: T.services }, { label: c.name }],
    kicker: `<div class="cluster" style="gap:11px">
          <span style="color:var(--navy)">${ic(c.icon, 30)}</span>
          <span class="tag">${items.length} services</span>
        </div>`,
    heading: c.name,
    lede: c.blurb,
    extra: `<div class="cluster" style="margin-top:20px">
          <a class="btn btn--primary" href="${up(2)}contact.html">Free consultation ${ic('arrow', 17)}</a>
          <a class="btn btn--gold" href="https://wa.me/${C.whatsappIntl}" target="_blank" rel="noopener">${ic('whatsapp', 18)} Ask on WhatsApp</a>
        </div>`,
    shot: c.shot,
    photoOpts: { cat: c.photo }
  })}
  <section class="section section--tight">
    <div class="container split split--wide">
      <div class="stack" style="--s:18px">
        <div class="card card--surface card--pad">
          <span class="eyebrow">At a glance</span>
          <table class="dtable" style="margin-top:12px">
            <tr><th scope="row" style="width:45%">Who it is for</th><td>Businesses, founders, individuals and foreign investors who need practical compliance support.</td></tr>
            <tr><th scope="row">Estimated turnaround</th><td>Depends on case complexity and authority response time.</td></tr>
            <tr><th scope="row">Cost range</th><td>Based on the service scope, complexity and whether third-party fees apply.</td></tr>
            <tr><th scope="row">Service languages</th><td>ID · EN · 中文</td></tr>
          </table>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--surface">
    <div class="container">
      <span class="eyebrow">Services in this area</span>
      <h2 style="margin:8px 0 clamp(20px,3vw,32px)">Compare ${items.length === 1 ? 'the service' : 'all ' + items.length}</h2>
      <div class="stack" style="--s:14px">
        ${items.map(s => `<article class="card card--link" style="overflow:hidden">
          <div class="rowcard" style="--thumb:170px">
            <div class="rowcard__media">${slot(s.shot, { ratio: '1 / 1', icon: 'image', cat: s.photo, seed: s.slug })}</div>
            <div class="rowcard__body">
              <div class="cluster" style="gap:9px"><span style="color:var(--navy)">${ic(c.icon, 19)}</span>
              <h3><a href="${s.slug}.html">${s.name}</a></h3></div>
              <p class="small" style="margin-top:6px">A practical service to keep the file organised, compliant and easy to follow from start to finish.</p>
            </div>
            <div class="rowcard__end">
              <span class="tiny">${ic('clock', 14)} Based on case complexity</span>
              <a class="btn btn--quiet" href="${s.slug}.html">Details ${ic('arrow', 15)}</a>
            </div>
          </div></article>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container split split--wide">
      <div>
        <span class="eyebrow">Help me choose</span>
        <h2 style="margin:8px 0 clamp(18px,2vw,26px)">Which one do I need?</h2>
        <table class="dtable">
          <thead><tr><th>Your situation</th><th>The right service</th><th>Main requirement</th></tr></thead>
          <tbody>
          ${items.slice(0, 4).map(s => `<tr><td>When you need a quick and compliant solution</td><td><a href="${s.slug}.html"><strong>${s.name}</strong></a></td><td>Document review, filing preparation and authority follow-up</td></tr>`).join('\n          ')}
          </tbody>
        </table>
      </div>
      <div class="stack" style="--s:16px">
        ${slot('Photo or diagram: the filing flow for this area', { ratio: '4 / 3', px: 'min 1000px', cat: 'filed-docs' })}
        <div class="card card--gold card--pad">
          <span class="icon-lead icon-lead--gold">${ic('whatsapp', 24)}</span>
          <h4>Still unsure?</h4>
          <p class="small" style="margin-top:6px">Send us the situation in one message and we will name the right service.</p>
          <a class="btn btn--gold btn--sm" style="margin-top:14px" href="https://wa.me/${C.whatsappIntl}" target="_blank" rel="noopener">Message us</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--surface">
    <div class="container">
      <span class="eyebrow">Questions</span>
      <h2 style="margin:8px 0 clamp(20px,3vw,32px)">Frequently asked</h2>
      <div class="acc">
        ${[1,2,3,4].map((n, index) => `<div class="acc__item">
          <button class="acc__btn" id="q${c.slug}${n}" aria-expanded="false" aria-controls="a${c.slug}${n}">
            ${['What documents do I need to prepare?', 'How long does the process usually take?', 'Can you help if I am still missing information?', 'What do I receive after filing?'][index]} ${ic('chevron', 20)}</button>
          <div class="acc__panel" id="a${c.slug}${n}" role="region" aria-labelledby="q${c.slug}${n}" hidden>
            ${['We review your current situation and confirm the exact file requirements before the process begins.', 'Turnaround depends on the authority, document completeness and whether follow-up is required.', 'Yes. We can help identify missing documents and advise on the next practical step before submission.', 'You receive the final document support, filing guidance and follow-up assistance if the authority requests additional information.'][index]}</div>
        </div>`).join('\n        ')}
      </div>
    </div>
  </section>

  ${ctaBand(2, C, CTA, T)}
</main>` + footer(2, C, lang)));
});

/* ====================== SERVICE DETAIL (24) ======================
   Deliberately minimal: accuprointernational.co.id/en/layanan/ lists these
   24 service names as plain, unlinked headings — there is no detail page,
   and therefore no content, to match on the live site. Rather than invent
   turnaround times, document checklists or FAQ copy, this page states that
   plainly and routes the visitor to a human. See README §1 on the
   [SQUARE BRACKET] convention this follows. */
SVC.forEach(s => {
  const c = cat(s.cat);
  const siblings = byCat(s.cat).filter(x => x.slug !== s.slug);
  pages.push(write(`services/${s.cat}/${s.slug}.html`,
  head({ title: `${s.name} | ${C.shortName}`, desc: `${s.name} — ${C.legalName}, Jakarta.`, d: 2, path: `services/${s.cat}/${s.slug}.html`, ogCat: s.photo, ogSeed: s.slug, lang, T }) +
  header('services', 2, C, lang, T, `services/${s.cat}/${s.slug}.html`) + `
<main id="main">
  ${pageHero(2, {
    crumbTrail: [{ href: 'index.html', label: T.home }, { href: 'services.html', label: T.services }, { href: `services/${c.slug}/`, label: c.name }, { label: s.name }],
    kicker: `<span class="tag">${c.name}</span>`,
    heading: s.name,
    lede: 'Content coming soon.',
    shot: s.shot,
    photoOpts: { cat: s.photo, seed: s.slug }
  })}

  <section class="section section--tight">
    <div class="container split split--wide" style="align-items:start">
      <div class="card card--surface card--pad" style="text-align:center">
        <span class="icon-lead">${ic('doc', 30)}</span>
        <h2 style="margin-top:10px">This page doesn't have published details yet</h2>
        <p class="small" style="margin-top:8px">Contact us directly and we'll walk you through the process, documents and cost for ${s.name.toLowerCase()} — no need to wait for this page.</p>
        <div class="cluster" style="justify-content:center;margin-top:18px">
          <a class="btn btn--gold" href="https://wa.me/${C.whatsappIntl}" target="_blank" rel="noopener">${ic('whatsapp', 18)} ${C.whatsapp}</a>
          <a class="btn btn--primary" href="${up(2)}contact.html">Ask about this service ${ic('arrow', 17)}</a>
        </div>
      </div>
      <aside class="card card--pad">
        <span class="eyebrow">Not what you need?</span>
        <ul style="margin-top:10px">
          ${siblings.slice(0, 4).map(x => `<li style="padding:9px 0;border-bottom:1px solid var(--line)">
          <a href="${x.slug}.html" style="display:flex;gap:9px;align-items:flex-start;font-size:.9375rem;font-weight:600">
          ${ic(c.icon, 16)} ${x.name}</a></li>`).join('\n          ')}
        </ul>
      </aside>
    </div>
  </section>

  ${ctaBand(2, C, CTA, T)}
</main>` + footer(2, C, lang)));
});

/* ============================== TOOLS ============================== */
pages.push(write('tools.html',
head({ title: `Tools & Calculators — free, no sign-up | ${C.shortName}`, desc: 'Nine free tools: five Indonesian tax calculators plus cost and requirement simulators for company setup, KITAS and trademark filing.', d: 0, path: 'tools.html', ogCat: 'screen', ogSeed: 'Screenshot: one calculator with results filled in, on desktop', lang, T }) +
header('tools', 0, C, lang, T, 'tools.html') + `
<main id="main">
  ${pageHero(0, {
    crumbTrail: [{ href: 'index.html', label: T.home }, { label: 'Tools' }],
    kicker: `<span class="eyebrow">Free tools</span>`,
    heading: 'Work out the numbers yourself first',
    lede: 'Nine tools for estimating tax, cost and processing time. Nothing is sent to a server — results stay in your browser.',
    extra: `<div class="cluster" style="margin-top:20px">
          <button class="chip" aria-pressed="true">All 9</button>
          <button class="chip">${ic('calc', 15)} Tax calculators (5)</button>
          <button class="chip chip--gold">${ic('spark', 15)} Cost &amp; requirement simulators (4)</button>
        </div>`,
    shot: 'Screenshot: one calculator with results filled in, on desktop',
    photoOpts: { icon: 'screen', cat: 'screen' }
  })}

  <section class="section section--surface">
    <div class="container">
      <span class="eyebrow">Tax calculators</span>
      <h2 style="margin:8px 0 clamp(20px,3vw,32px)">Five Indonesian income-tax calculators</h2>
      <div class="grid g3">
        ${S.tools.filter(t => t.kind === 'tax').map(t => `<a class="card card--link card--pad" href="tools/${t.slug}.html">
          <span class="icon-lead">${ic('calc', 26)}</span>
          <h3>${t.name}</h3>
          <p class="small" style="margin-top:8px">${t.note}</p>
          <span class="card__more">Open calculator ${ic('arrow', 16)}</span>
        </a>`).join('\n        ')}
      </div>

      <span class="eyebrow eyebrow--gold" style="display:block;margin-top:clamp(32px,4vw,52px)">Accupro-only</span>
      <h2 style="margin:8px 0 clamp(20px,3vw,32px)">Four simulators no competitor offers</h2>
      <div class="grid g4">
        ${S.tools.filter(t => t.kind === 'own').map(t => `<a class="card card--link card--gold" href="tools/${t.slug}.html">
          ${slot(`Screenshot: ${t.name}`, { ratio: '16 / 9', px: 'min 1200px', icon: 'screen', cls: 'card__media', cat: 'screen', seed: t.name })}
          <div class="card__body card__body--badged">
            <span class="card__badge card__badge--gold">${ic('spark', 20)}</span>
            <h4>${t.name}</h4>
            <p class="small" style="margin-top:8px">${t.note}</p>
            <span class="card__more">Open simulator ${ic('arrow', 16)}</span>
          </div></a>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="section section--surface">
    <div class="container">
      <div class="card card--pad cluster" style="gap:22px;flex-wrap:wrap">
        <span class="icon-lead" style="margin:0">${ic('scale', 30)}</span>
        <div><h3>These results are estimates</h3>
        <p class="small" style="margin-top:6px">Figures are indicative and do not replace an official computation. Ask us to verify before you file or budget against it.</p></div>
        <a class="btn btn--primary" href="contact.html">Ask us to verify ${ic('arrow', 17)}</a>
      </div>
    </div>
  </section>

  ${ctaBand(0, C, CTA, T)}
</main>` + footer(0, C, lang)));

/* ====================== TOOL CALCULATORS (9) ======================
   Each page: pageHero + Input | Result/History/Bridge, wired up by
   assets/js/calculators.js (real math for the five tax calculators; the
   four "own" simulators read window.TOOL_CONFIG, sourced from this
   service's `config` in data/site.json). See calculators.js's file header
   for the accuracy caveat on the PPh 21 TER bracket tables. */
const numField = (label, name, opts = {}) => `<label class="field"><span class="field__label">${label}</span>
              <input class="field__input" name="${name}" type="text" inputmode="numeric" placeholder="Rp" ${opts.required !== false ? 'required' : ''}></label>`;
const selectField = (label, name, options) => `<label class="field"><span class="field__label">${label}</span>
              <select class="field__select" name="${name}">
                ${options.map(([v, t]) => `<option value="${v}">${t}</option>`).join('\n                ')}
              </select></label>`;

const TOOL_FORMS = {
  'pph-badan': `<div class="stack" style="--s:14px">
    ${selectField('Taxpayer type', 'taxpayerType', [['general', 'General corporate'], ['listed', 'Listed company (Tbk., ≥40% public float)'], ['msme', 'MSME (turnover ≤ Rp 4.8B)']])}
    ${numField('Gross annual turnover', 'turnover')}
    ${numField('Taxable income (fiscal profit)', 'taxableIncome')}
  </div>`,
  'pph21-ter': `<div class="stack" style="--s:14px">
    ${selectField('PTKP status', 'ptkpStatus', [['TK/0', 'TK/0 — single, no dependants'], ['TK/1', 'TK/1'], ['TK/2', 'TK/2'], ['TK/3', 'TK/3'], ['K/0', 'K/0 — married, no dependants'], ['K/1', 'K/1'], ['K/2', 'K/2'], ['K/3', 'K/3']])}
    ${numField('Gross monthly income', 'grossMonthly')}
  </div>`,
  'pph21-masa': `<div class="stack" style="--s:14px">
    ${selectField('PTKP status', 'ptkpStatus', [['TK/0', 'TK/0 — single, no dependants'], ['TK/1', 'TK/1'], ['TK/2', 'TK/2'], ['TK/3', 'TK/3'], ['K/0', 'K/0 — married, no dependants'], ['K/1', 'K/1'], ['K/2', 'K/2'], ['K/3', 'K/3']])}
    ${numField('Gross annual income', 'grossAnnual')}
  </div>`,
  pph23: `<div class="stack" style="--s:14px">
    ${selectField('Income type', 'incomeType', [['dividend', 'Dividends'], ['interest', 'Interest / loan guarantee reward'], ['royalty', 'Royalties'], ['prize', 'Prizes and awards'], ['rent', 'Rent of assets (not land/buildings)'], ['service', 'Technical, management or consulting fees'], ['otherService', 'Other services (PMK 141/2015 list)']])}
    ${numField('Gross amount', 'amount')}
    ${selectField('NPWP status of the recipient', 'hasNpwp', [['yes', 'Registered'], ['no', 'Not registered (rate doubled)']])}
  </div>`,
  'pph4-2': `<div class="stack" style="--s:14px">
    ${selectField('Transaction type', 'transactionType', [['rentLandBuilding', 'Rent of land / buildings'], ['saleLandBuilding', 'Sale/transfer of land or buildings'], ['saleLandBuildingRSS', 'Sale/transfer — simple housing (RSS/RS)'], ['constructionExecutionQualified', 'Construction execution — certified contractor'], ['constructionExecutionSmall', 'Construction execution — small qualified contractor'], ['constructionExecutionUnqualified', 'Construction execution — no certification'], ['constructionSupervisionQualified', 'Construction planning/supervision — qualified'], ['constructionSupervisionUnqualified', 'Construction planning/supervision — unqualified']])}
    ${numField('Gross transaction amount', 'amount')}
  </div>`,
  'company-setup-cost': `<div class="stack" style="--s:14px">
    ${selectField('Entity type', 'entityType', [['pt', 'PT (local)'], ['pma', 'PT PMA (foreign-owned)'], ['cv', 'CV'], ['yayasan', 'Yayasan (foundation)']])}
    ${numField('Planned paid-up capital', 'paidUpCapital')}
    ${selectField('Registered office domicile', 'domicile', [['jakarta', 'Jakarta'], ['other', 'Other city']])}
  </div>`,
  'kitas-requirements': `<div class="stack" style="--s:14px">
    ${selectField('KITAS type', 'kitasType', [['work', 'Work KITAS'], ['investor', 'Investor KITAS'], ['family', 'Family Reunification KITAS']])}
  </div>`,
  'trademark-cost': `<div class="stack" style="--s:14px">
    ${selectField('Applicant type', 'applicantType', [['local-umkm', 'Local — UMKM (reduced fee)'], ['local', 'Local — standard'], ['foreign', 'Foreign applicant']])}
    ${numField('Number of classes', 'numClasses', { required: false })}
  </div>`,
  'monthly-obligations': `<div class="stack" style="--s:14px">
    ${selectField('Entity type', 'entityType', [['company', 'Company'], ['individual', 'Individual']])}
    ${selectField('PKP status', 'pkpStatus', [['no', 'Not PKP-registered'], ['yes', 'PKP-registered']])}
  </div>`
};
const TOOL_META = {
  'pph-badan': { resultLabel: 'Tax payable', bridgeHref: 'services/tax-reporting/corporate-tax-processing.html', bridgeLabel: 'See Corporate Tax Processing', bridgeText: 'Need help filing this?' },
  'pph21-ter': { resultLabel: 'Monthly withholding', bridgeHref: 'services/tax-reporting/individual-tax-processing.html', bridgeLabel: 'See Individual Tax Processing', bridgeText: 'Need this run for your whole payroll?' },
  'pph21-masa': { resultLabel: 'Annual tax payable', bridgeHref: 'services/tax-reporting/individual-annual-tax-return.html', bridgeLabel: 'See Individual Annual Tax Return', bridgeText: 'Need help with the annual filing?' },
  pph23: { resultLabel: 'Tax to withhold', bridgeHref: 'services/tax-reporting/corporate-tax-processing.html', bridgeLabel: 'See Corporate Tax Processing', bridgeText: 'Need help with withholding compliance?' },
  'pph4-2': { resultLabel: 'Final tax due', bridgeHref: 'services/tax-reporting/corporate-tax-processing.html', bridgeLabel: 'See Corporate Tax Processing', bridgeText: 'Need help filing this?' },
  'company-setup-cost': { resultLabel: 'Estimated total cost', bridgeHref: 'services/company-legality/company-establishment.html', bridgeLabel: 'See company establishment', bridgeText: 'Ready to set up your company?' },
  'kitas-requirements': { resultLabel: 'Estimated timeline', bridgeHref: 'services/stay-permits-visa/', bridgeLabel: 'See stay permits & visa', bridgeText: 'Ready to start your KITAS?' },
  'trademark-cost': { resultLabel: 'Estimated total cost', bridgeHref: 'services/trademark-ip/', bridgeLabel: 'See trademark & IP', bridgeText: 'Ready to file your trademark?' },
  'monthly-obligations': { resultLabel: 'This month', bridgeHref: 'services/tax-reporting/', bridgeLabel: 'See tax & reporting', bridgeText: 'Want us to handle these for you?' }
};
S.tools.forEach(t => {
  const meta = TOOL_META[t.slug];
  pages.push(write(`tools/${t.slug}.html`,
  head({ title: `${t.name} | ${C.shortName}`, desc: `${t.note} Free, no sign-up.`, d: 1, path: `tools/${t.slug}.html`, ogCat: 'screen', ogSeed: t.slug, lang, T }) +
  header('tools', 1, C, lang, T, `tools/${t.slug}.html`) + `
<main id="main">
  ${toolShell(1, C, {
    crumbTrail: [{ href: 'index.html', label: T.home }, { href: 'tools.html', label: 'Tools' }, { label: t.name }],
    kicker: `<span class="tag">${t.kind === 'own' ? 'Accupro-only' : 'Tax calculator'}</span>`,
    heading: t.name,
    lede: t.note,
    shot: `Screenshot: ${t.name}`,
    photoOpts: { icon: 'screen', cat: 'screen', seed: t.slug },
    slug: t.slug,
    formHTML: TOOL_FORMS[t.slug],
    toolConfig: t.config,
    ...meta
  })}
  ${ctaBand(1, C, CTA, T)}
</main>` + footer(1, C, lang, ['assets/js/calculators.js'])));
});

/* ============================== ARTICLES ============================== */
pages.push(write('articles.html',
head({ title: `Articles — tax, legal and licensing insight | ${C.shortName}`, desc: 'Practical explanations of rule changes, commonly misunderstood requirements, and costs to budget for.', d: 0, path: 'articles.html', ogCat: 'meeting', ogSeed: 'Lead image for the featured article', lang, T }) +
header('articles', 0, C, lang, T, 'articles.html') + `
<main id="main">
  ${pageHero(0, {
    crumbTrail: [{ href: 'index.html', label: T.home }, { label: 'Articles' }],
    kicker: `<span class="eyebrow">Articles</span>`,
    heading: 'Tax, legal &amp; licensing insight',
    lede: 'Practical explanations of rules that changed, requirements that are commonly misunderstood, and costs worth budgeting for.',
    shot: 'Lead image for the featured article',
    photoOpts: { cat: 'meeting' }
  })}

  <section class="section section--tight">
    <div class="container">
      <div class="card card--gold card--pad">
        <div class="cluster" style="gap:11px;margin-bottom:8px"><span style="color:var(--gold-700)">${ic('spark', 22)}</span>
        <h3>Clear guidance, practical answers, and business context</h3></div>
        <p class="small">Our articles are designed to explain common tax, licensing and compliance questions in plain language, so clients can understand the rule, the process and the decision before they act.</p>
      </div>
    </div>
  </section>

  <section class="section section--tight">
    <div class="container split split--wide" style="align-items:start">
      <article class="card card--link">
        ${slot('Lead image for the featured article', { ratio: '16 / 9', px: 'min 1600px', cls: 'card__media', cat: 'meeting' })}
        <div class="card__body card__body--badged">
          <span class="card__badge">${ic('chart', 21)}</span>
          <div class="cluster" style="gap:10px"><span class="tag">Tax &amp; Reporting</span>
          <span class="tiny">Accupro · Updated regularly · 5 min read</span></div>
          <h2 style="margin-top:11px">What to prepare before an annual tax filing</h2>
          <p class="small" style="margin-top:10px">A practical checklist for company owners and individuals who want to avoid last-minute document errors and reduce filing delays.</p>
        </div>
      </article>
      <aside class="stack" style="--s:16px">
        <form role="search" class="field">
          <span class="field__label">Search articles</span>
          <input class="field__input" type="search" placeholder="Search articles">
        </form>
        <div class="card card--surface card--pad">
          <span class="eyebrow">Categories</span>
          <ul style="margin-top:10px">
            ${[['chart','Tax'],['building','Company Legality'],['plane','Stay Permits &amp; Visa'],['badge','Trademark &amp; IP'],['doc','Practical Guides']]
              .map(([i,t]) => `<li style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--line)">
              <a href="#" style="display:flex;gap:9px;align-items:center;font-size:.9375rem;font-weight:600">${ic(i, 16)} ${t}</a>
              <span class="tiny">5</span></li>`).join('\n            ')}
          </ul>
        </div>
        <div class="card card--navy card--pad">
          <span class="icon-lead">${ic('whatsapp', 24)}</span>
          <h4>Need an answer for your own case?</h4>
          <p class="small" style="margin-top:6px">Articles cover the general rule; a consultation covers your specifics.</p>
          <a class="btn btn--primary btn--sm btn--block" style="margin-top:14px" href="contact.html">Free consultation</a>
        </div>
      </aside>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="cluster" style="margin-bottom:clamp(20px,3vw,30px)">
        <button class="chip" aria-pressed="true">All</button>
        ${[['chart','Tax'],['building','Legality'],['plane','Stay Permits'],['badge','Trademark'],['doc','Guides']]
          .map(([i,t]) => `<button class="chip">${ic(i, 15)} ${t}</button>`).join('\n        ')}
      </div>
      <div class="grid g3">
        ${[['plane','Stay Permits','passport'],['building','Legality','signing'],['chart','Tax','tax-docs'],['badge','Trademark','branding'],['doc','Guides','filed-docs'],['calc','Tax','screen']]
          .map(([i,k,cat]) => `<article class="card card--link">
          ${slot('Article image', { ratio: '16 / 9', px: 'min 1200px', cls: 'card__media', cat, seed: i + k + cat })}
          <div class="card__body card__body--badged" style="padding:18px;padding-top:32px">
            <span class="card__badge" style="left:18px">${ic(i, 20)}</span>
            <span class="tag">${k}</span>
            <h4 style="margin-top:10px">Filing checklist for a smoother compliance process</h4>
            <p class="tiny" style="margin-top:8px">Updated regularly · 5 min read</p>
          </div></article>`).join('\n        ')}
      </div>
      <nav class="cluster" style="justify-content:center;margin-top:clamp(28px,3vw,40px)" aria-label="Pagination">
        ${['‹','1','2','3','›'].map((n, i) => `<a class="chip" href="#"${i === 1 ? ' aria-pressed="true"' : ''} style="min-width:44px;justify-content:center">${n}</a>`).join('')}
      </nav>
    </div>
  </section>

  ${ctaBand(0, C, CTA, T)}
</main>` + footer(0, C, lang)));

/* ============================== CONTACT ============================== */
pages.push(write('contact.html',
head({ title: `Contact — ${C.legalName}`, desc: `Contact ${C.legalName} in North Jakarta. ${C.hours[lang]}`, d: 0, path: 'contact.html', ogCat: 'reception', ogSeed: 'Photo: reception or meeting room — gives the contact page a face', lang, T }) +
header('contact', 0, C, lang, T, 'contact.html') + `
<main id="main">
  ${pageHero(0, {
    crumbTrail: [{ href: 'index.html', label: T.home }, { label: T.contact }],
    kicker: `<span class="eyebrow">Contact</span>`,
    heading: `Let's talk`,
    lede: 'Pick whichever channel suits you. For a quick question WhatsApp is usually fastest; for anything that needs a quote, use the form below.',
    shot: 'Photo: reception or meeting room — gives the contact page a face',
    photoOpts: { icon: 'pin', cat: 'reception' }
  })}
  <section class="section section--tight">
    <div class="container">
      <ul class="grid g4" style="margin-top:clamp(24px,3vw,36px)">
        ${[['whatsapp','WhatsApp', C.whatsapp, 'Answered during office hours', `https://wa.me/${C.whatsappIntl}`, true],
           ['phone','Phone', C.phones[0], C.hours[lang], `tel:${C.phones[0].replace(/-/g,'')}`, false],
           ['phone','Second line', C.phones[1], 'Also listed on the current site', `tel:${C.phones[1].replace(/-/g,'')}`, false],
           ['mail','Email', C.emails[0], 'Move this to your own domain', `mailto:${C.emails[0]}`, false]]
          .map(([i,t,v,s,href,gold]) => `<li class="card ${gold ? 'card--gold' : ''} card--pad">
          <span class="${gold ? 'icon-lead icon-lead--gold' : 'icon-lead'}">${ic(i, 24)}</span>
          <h4>${t}</h4>
          <p style="font-weight:600;margin:3px 0 4px"><a href="${href}"${gold ? ' target="_blank" rel="noopener"' : ''}>${v}</a></p>
          <p class="tiny">${s}</p></li>`).join('\n        ')}
      </ul>
      <p class="tiny" style="margin-top:14px">For quick and consistent communication, we use one official WhatsApp number and one official email address for all client enquiries.</p>
    </div>
  </section>

  <section class="section section--surface">
    <div class="container split split--wide" style="align-items:start">
      <form class="card card--pad" data-demo-form novalidate>
        <div class="cluster" style="gap:9px;margin-bottom:6px"><span style="color:var(--navy)">${ic('doc', 20)}</span><h2 style="font-size:1.5rem">Request a quote</h2></div>
        <p class="small" style="margin-bottom:20px">Answered within one business day, with concrete next steps and a realistic estimate based on your situation.</p>
        <div class="grid g2" style="gap:14px">
          <label class="field"><span class="field__label">Full name *</span><input class="field__input" name="name" required></label>
          <label class="field"><span class="field__label">Company name</span><input class="field__input" name="company"></label>
          <label class="field"><span class="field__label">WhatsApp / phone *</span><input class="field__input" name="phone" type="tel" required></label>
          <label class="field"><span class="field__label">Email *</span><input class="field__input" name="email" type="email" required></label>
        </div>
        <div class="stack" style="--s:14px;margin-top:14px">
          <label class="field"><span class="field__label">Entity type</span>
            <select class="field__select" name="entity">
              <option value="">Choose…</option><option>Local PT</option><option>PT PMA (foreign-owned)</option>
              <option>CV</option><option>Foundation</option><option>Individual</option>
            </select></label>
          <label class="field"><span class="field__label">Service needed *</span>
            <select class="field__select" name="service" required>
              <option value="">Choose a service…</option>
              ${CAT.map(c => `<optgroup label="${c.name}">${byCat(c.slug).map(s => `<option>${s.name}</option>`).join('')}</optgroup>`).join('\n              ')}
            </select></label>
          <label class="field"><span class="field__label">Tell us the situation *</span>
            <textarea class="field__area" name="message" required placeholder="The more specific you are, the more accurate our quote."></textarea></label>
          <label class="consent"><input type="checkbox" name="consent" required>
            <span>I agree that my data may be processed in line with our privacy policy and used only to respond to my enquiry.</span></label>
          <button class="btn btn--primary btn--block" type="submit">Send request ${ic('arrow', 17)}</button>
          <p class="tiny" data-form-note hidden></p>
          <p class="tiny">Your details are not shared with third parties.</p>
        </div>
      </form>

      <div class="stack" style="--s:16px">
        <div class="grid g2" style="gap:16px">
          ${[['pin','Head office', C.addressLine, 'Photo: head office frontage'],
             ['building','Operational office', C.addressLine2, 'Photo: operational office frontage']]
            .map(([i,t,a,shot]) => `<article class="card">
            ${slot(shot, { ratio: '4 / 3', cls: 'card__media', cat: 'reception' })}
            <div class="card__body card__body--badged" style="padding:16px;padding-top:30px">
              <span class="card__badge" style="left:16px;width:38px;height:38px;top:-19px">${ic(i, 18)}</span>
              <h4>${t}</h4><p class="small" style="margin-top:5px">${a}<br>${C.city}</p></div></article>`).join('\n          ')}
        </div>
        <div class="card card--surface card--pad">
          <div class="cluster" style="gap:10px"><span style="color:var(--navy)">${ic('clock', 19)}</span><p class="small">${C.hours[lang]}</p></div>
          <a class="btn btn--quiet" style="margin-top:14px" href="https://maps.google.com/?q=Jl.+Bandengan+Utara+80+Jakarta+Utara" target="_blank" rel="noopener">Open in Google Maps ${ic('arrow', 15)}</a>
        </div>
        ${slot('Map: both office locations pinned', { ratio: '4 / 3', icon: 'pin', cat: 'city' })}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container split split--narrow" style="align-items:start">
      ${slot('Photo: the team handling calls and messages', { ratio: '3 / 4', px: 'min 900px', icon: 'users', cat: 'team-work' })}
      <div>
        <span class="eyebrow">Questions</span>
        <h2 style="margin:8px 0 clamp(18px,2vw,26px)">Before you write</h2>
        <div class="acc">
          ${['Is the first consultation really free?','Can everything be handled without me visiting the office?','Do you serve clients outside Jakarta?','How does payment work, and in what stages?','Can you serve us in English or Mandarin?','How soon does work actually start?']
            .map((q, n) => `<div class="acc__item">
            <button class="acc__btn" id="cq${n}" aria-expanded="false" aria-controls="ca${n}">${q} ${ic('chevron', 20)}</button>
            <div class="acc__panel" id="ca${n}" role="region" aria-labelledby="cq${n}" hidden>${['Yes. The initial consultation is intended to understand your situation and clarify the right next step.', 'Usually yes. We can coordinate by WhatsApp, email and document review, and arrange a meeting only when needed.', 'Yes. We support clients across Indonesia and also work with international or cross-border business needs.', 'We usually agree on the service scope and estimate upfront, then proceed in stages as the work is completed.', 'Yes. We work in Indonesian, English and Mandarin depending on the client and service.', 'Work starts after the intake review, document checklist and agreement on scope are confirmed.'][n]}</div>
          </div>`).join('\n          ')}
        </div>
      </div>
    </div>
  </section>
</main>` + footer(0, C, lang)));

/* ============================== 404 ============================== */
pages.push(write('404.html',
head({ title: `Page not found — ${C.shortName}`, desc: 'That page does not exist.', d: 0, path: '404.html', lang, T }) +
header('', 0, C, lang, T, '404.html') + `
<main id="main">
  <section class="section">
    <div class="container" style="max-width:720px;text-align:center">
      <span class="icon-lead">${ic('search', 40)}</span>
      <h1 style="margin-top:16px">That page does not exist</h1>
      <p class="lede" style="margin-top:14px">The link may be out of date, or the address mistyped. Here is where most people are heading:</p>
      <div class="cluster" style="justify-content:center;margin-top:26px">
        <a class="btn btn--primary" href="services.html">All 24 services ${ic('arrow', 17)}</a>
        <a class="btn btn--ghost" href="contact.html">Contact us</a>
      </div>
      <ul class="grid g3" style="margin-top:clamp(32px,4vw,52px);text-align:left">
        ${CAT.slice(0, 3).map(c => `<li class="card card--pad">
          <span class="icon-lead">${ic(c.icon, 22)}</span>
          <h4><a href="services/${c.slug}/">${c.name}</a></h4>
          <p class="small" style="margin-top:6px">${c.blurb}</p></li>`).join('\n        ')}
      </ul>
      <p class="tiny" style="margin-top:28px">The current site has no 404 page — unknown URLs return an HTTP 500 error instead. On your server, point the 404 handler at this file.</p>
    </div>
  </section>
</main>` + footer(0, C, lang)));
});

/* ===================== sitemap.xml + robots.txt =====================
   Site-wide, written once at the true dist root — not per language, and
   not through the per-language `write` closure above (out of scope here). */
const writeRoot = (rel, content) => {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
};

/* Production domain by default; a preview deploy overrides it with SITE_URL so
   the sitemap advertises the host it is actually served from. */
const BASE = process.env.SITE_URL || 'https://accuprointernational.co.id';
const PAGE_PATHS = ['index.html','about.html','services.html','tools.html','articles.html','contact.html']
  .map(u => ({ loc: u === 'index.html' ? '/' : '/' + u, pri: u === 'index.html' ? '1.0' : '0.8' }))
  .concat(CAT.map(c => ({ loc: `/services/${c.slug}/`, pri: '0.7' })))
  .concat(SVC.map(s => ({ loc: `/services/${s.cat}/${s.slug}.html`, pri: '0.6' })))
  .concat(S.tools.map(t => ({ loc: `/tools/${t.slug}.html`, pri: '0.6' })));
const urls = LANGS.flatMap(lang => PAGE_PATHS.map(u => ({ ...u, loc: lang === 'id' ? u.loc : `/${lang}${u.loc}` })));
writeRoot('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${BASE}${u.loc}</loc><priority>${u.pri}</priority></url>`).join('\n')}
</urlset>
`);
/* A preview build tells crawlers to stay out entirely — see NOINDEX in layout.mjs.
   The per-page meta robots tag is the reliable half: a project-subpath deploy
   serves robots.txt at /<repo>/robots.txt, which crawlers do not read. */
/* Netlify reads _headers from the publish dir. An X-Robots-Tag header is
   stronger than the meta tag: it also covers non-HTML files, and it cannot be
   missed by a crawler that never parses the document. */
if (NOINDEX) writeRoot('_headers', `/*\n  X-Robots-Tag: noindex, nofollow\n`);
/* dist/ is wiped at the top of every build now, so this is mostly a
   belt-and-braces guard against a _headers file surviving from outside the
   build (e.g. hand-copied) rather than from a previous run. */
else fs.rmSync(path.join(OUT, '_headers'), { force: true });

writeRoot('robots.txt', NOINDEX
  ? `User-agent: *\nDisallow: /\n`
  : `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);
console.log(`sitemap.xml: ${urls.length} URLs`);

/* ---------------------------- report ---------------------------- */
const byLang = LANGS.map(lang => `${lang.toUpperCase()} ${pages.filter(p => lang === 'id' ? !p.startsWith('en/') && !p.startsWith('ch/') : p.startsWith(`${lang}/`)).length}`).join(' · ');
console.log(`built ${pages.length} pages — ${byLang}`);
