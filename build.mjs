import fs from 'fs';
import path from 'path';
import { ic } from './src/icons.mjs';
import { head, header, footer, ctaBand, slot, crumbs, avatar, up, NOINDEX } from './src/layout.mjs';

const S = JSON.parse(fs.readFileSync('data/site.json', 'utf8'));
const C = S.company, CAT = S.categories, SVC = S.services;
const OUT = 'dist';
const byCat = c => SVC.filter(s => s.cat === c);
const cat = slug => CAT.find(c => c.slug === slug);
const wrapTables = h => h.replace(/<table class="dtable"([\s\S]*?)<\/table>/g,
  (m) => `<div class="tablewrap">${m}</div>`);
const write = (rel, html) => {
  html = wrapTables(html);
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html);
  return rel;
};
const PH = t => `<span class="ph-tag">${t}</span>`;
const pages = [];

/* ============================== HOME ============================== */
pages.push(write('index.html',
head({ title: `${C.legalName} — Tax, Legal & Business Services in Jakarta`, desc: C.tagline.slice(0, 155), d: 0 }) +
header('home', 0, C) + `
<main id="main">

  <!-- hero -->
  <section class="section">
    <div class="container split split--wide">
      <div class="stack" style="--s:20px">
        <div class="cluster">
          <span class="pill">${ic('badge', 14)} Certified consultant (CTL)</span>
          <span class="pill">${ic('globe', 14)} Serving PMA &amp; expatriates</span>
        </div>
        <h1>${S.hero.primary}</h1>
        <p class="lede">${C.tagline}</p>
        <div class="cluster">
          <a class="btn btn--primary" href="contact.html">${S.cta.heading.replace('!','')} ${ic('arrow', 17)}</a>
          <a class="btn btn--gold" href="https://wa.me/${C.whatsappIntl}" target="_blank" rel="noopener">${ic('whatsapp', 18)} WhatsApp</a>
        </div>
        <ul class="grid g4 g-stats" style="gap:20px;margin-top:8px">
          ${S.stats.filter(s => !s.flag).map(s => `<li><span class="stat__v">${s.value}</span>
            <span class="tiny" style="display:block;margin-top:6px">${s.label}</span></li>`).join('\n          ')}
        </ul>
      </div>

      <!-- service finder -->
      <form class="card card--navy card--pad" id="finder" data-base="" novalidate>
        <span class="eyebrow">Service finder</span>
        <h3 style="margin:6px 0 4px">What do you need?</h3>
        <p class="small" style="margin-bottom:18px">Two steps to the right service page.</p>
        <div class="stack" style="--s:14px">
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
          <button class="btn btn--primary btn--block" type="submit">Go to service ${ic('arrow', 17)}</button>
        </div>
        <p class="tiny" style="margin-top:14px;text-align:center">or <a href="services.html">browse all 24 services</a></p>
      </form>
    </div>
    <div class="container" style="margin-top:clamp(28px,4vw,48px)">
      ${slot('Photo: the Accupro team in a client meeting at the office — real faces, real workspace', { ratio: '21 / 9', px: 'min 1920px', icon: 'users', cat: 'team-work', eager: true })}
    </div>
  </section>

  <!-- three pillars, verbatim from the current site -->
  <section class="section section--surface">
    <div class="container">
      <div class="between" style="margin-bottom:clamp(24px,3vw,40px)">
        <div><span class="eyebrow">What we do</span><h2 style="margin-top:8px">${S.sectionHeading}</h2></div>
        <a class="btn btn--ghost btn--sm" href="services.html">All 24 services ${ic('arrow', 16)}</a>
      </div>
      <div class="grid g3">
        ${S.pillars.map(p => `<article class="card card--link">
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
      <p class="lede" style="max-width:62ch">Every service page carries the document checklist and an estimated turnaround, so you know what to prepare before you commit.</p>
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
          ${S.tools.slice(0, 6).map(t => `<li class="card card--pad" style="padding:16px">
            <span class="${t.kind === 'own' ? 'icon-lead icon-lead--gold' : 'icon-lead'}" style="margin-bottom:8px">${ic(t.kind === 'own' ? 'spark' : 'calc', 20)}</span>
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
        ${S.testimonials.map(t => `<figure class="card card--pad">
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
            <span style="color:var(--faint)">${ic(i, 20)}</span></div>
          <h4>${t}</h4><p class="small" style="margin-top:6px">${x}</p></article>`).join('\n        ')}
      </div>
      <div style="margin-top:clamp(24px,3vw,32px)">
        ${slot('Photo: handing finished documents to a client', { ratio: '21 / 9', px: 'min 1920px', cat: 'handover' })}
      </div>
    </div>
  </section>

  ${ctaBand(0, C, S.cta)}
</main>` + footer(0, C)));

/* ============================== ABOUT ============================== */
pages.push(write('about.html',
head({ title: `About Us — ${C.legalName}`, desc: C.tagline.slice(0, 155), d: 0 }) +
header('about', 0, C) + `
<main id="main">
  <div class="container">${crumbs(0, [{ href: 'index.html', label: 'Home' }, { label: 'About Us' }])}</div>

  <section class="section section--tight">
    <div class="container split split--wide">
      <div class="stack" style="--s:18px">
        <span class="eyebrow">About us</span>
        <h1>${C.legalName}</h1>
        <p class="lede">${C.tagline}</p>
        <ul class="grid g4" style="gap:16px">
          ${S.stats.map(s => `<li class="card card--surface card--pad" style="padding:16px">
            <span class="stat__v" style="font-size:1.6rem">${s.value}</span>
            <span class="tiny" style="display:block;margin-top:5px">${s.label}</span></li>`).join('\n          ')}
        </ul>
        <p class="tiny">The first two figures are reproduced from the current site. ${PH('Recommended: replace with a measurable number or remove')} — neither has a unit or a source.</p>
      </div>
      ${slot('Photo: the office building or reception, portrait format', { ratio: '3 / 4', px: 'min 1200px', icon: 'pin', cat: 'reception' })}
    </div>
  </section>

  <section class="section section--surface">
    <div class="container">
      <span class="eyebrow">Our principles</span>
      <h2 style="margin:8px 0 clamp(24px,3vw,36px)">Integrity, Professionalism and Innovation</h2>
      <div class="grid g3">
        ${[['scale','Integrity','${PH}'],['badge','Professionalism','${PH}'],['spark','Innovation','${PH}']]
          .map(([i,t]) => `<article class="card card--pad">
          <span class="icon-lead">${ic(i, 26)}</span><h3>${t}</h3>
          <p class="small" style="margin-top:8px">${PH('WRITE ONE CONCRETE SENTENCE')} — the current site names this value but never says what it means in practice.</p></article>`).join('\n        ')}
      </div>
      <div class="split split--wide" style="margin-top:clamp(28px,4vw,48px)">
        <div class="prose">
          <h2>Why we exist</h2>
          <p class="small" style="margin-top:12px">${PH('WRITE 2–3 PARAGRAPHS')} — no equivalent text exists on the current site. Explain concretely why the firm was founded and which clients come to you most often. Avoid sentences that any firm could use.</p>
        </div>
        ${slot('Photo: the team at work — desks, discussion, documents', { ratio: '16 / 9', px: 'min 1400px', icon: 'users', cat: 'team-work' })}
      </div>
    </div>
  </section>

  <section class="section" id="team">
    <div class="container">
      <span class="eyebrow">Our team</span>
      <h2 style="margin:8px 0 12px">Four people behind the work</h2>
      <p class="lede" style="max-width:60ch">These four profiles already exist in the current site's database, but their pages return an HTTP 500 error and have never been visible.</p>
      <div class="grid g4" style="margin-top:clamp(24px,3vw,40px)">
        ${S.team.map((m, i) => `<article class="card">
          ${slot(m.shot, { ratio: '3 / 4', px: 'min 800px', icon: 'users', cls: 'card__media', cat: m.photo, seed: m.name })}
          <div class="card__body card__body--badged">
            <span class="card__badge">${ic(i === 0 ? 'badge' : i === 1 ? 'users' : 'doc', 20)}</span>
            <h4>${m.name}</h4>
            <p class="eyebrow" style="margin-top:6px">${m.role}</p>
            <p class="small" style="margin-top:8px">${PH('SERVICES HANDLED')}</p>
          </div></article>`).join('\n        ')}
      </div>
      <p class="tiny" style="margin-top:14px">Naming the services each person handles lets you link here from every service page ("Handled by…").</p>
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
            <h4>${t}</h4><p class="small" style="margin-top:6px">${PH('NUMBER / YEAR')}</p>
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
          <h4>${C.hours}</h4>
          <a class="btn btn--primary btn--sm" href="contact.html" style="align-self:flex-start">Contact us ${ic('arrow', 16)}</a>
        </div>
      </div>
      <div style="margin-top:clamp(20px,3vw,28px)">${slot('Map: both office locations pinned', { ratio: '21 / 9', icon: 'pin', cat: 'city' })}</div>
    </div>
  </section>

  ${ctaBand(0, C, S.cta)}
</main>` + footer(0, C)));

/* ========================= SERVICES INDEX ========================= */
pages.push(write('services.html',
head({ title: `Services — 24 tax, legal and licensing services | ${C.shortName}`, desc: 'Tax and reporting, registration and CORETAX accounts, company legality, stay permits and visa, trademark and IP — 24 services in five areas.', d: 0 }) +
header('services', 0, C) + `
<main id="main">
  <div class="container">${crumbs(0, [{ href: 'index.html', label: 'Home' }, { label: 'Services' }])}</div>

  <section class="section section--tight">
    <div class="container split split--wide">
      <div class="stack" style="--s:18px">
        <span class="eyebrow">Services</span>
        <h1>24 tax, legal and licensing services</h1>
        <p class="lede">Search directly, or browse by area. Every service page carries the document checklist and an estimated turnaround.</p>
        <form role="search" class="cluster" style="gap:10px">
          <label class="field" style="flex:1 1 260px">
            <span class="field__label">Search services</span>
            <input class="field__input" type="search" id="service-search" placeholder="e.g. KITAS, NPWP, annual return, PT setup" autocomplete="off">
          </label>
        </form>
      </div>
      ${slot('Photo: neatly filed client documents — conveys the breadth of the catalogue', { ratio: '4 / 3', px: 'min 1200px', cat: 'filed-docs' })}
    </div>
  </section>

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
            <span class="icon-lead" style="margin-bottom:10px;color:var(--faint)">${ic(c.icon, 19)}</span>
            <h4 style="min-height:2.6em">${s.name}</h4>
            <div class="card__meta"><span>${ic('clock', 14)} ${PH('EST.')}</span></div>
            <span class="card__more">Details ${ic('arrow', 15)}</span></a>`).join('\n          ')}
        </div>
      </div>
    </section>`).join('\n    ')}

    <p id="service-empty" class="container section" hidden style="text-align:center">
      <span class="icon-lead">${ic('search', 30)}</span><br>
      No service matches that search. <a href="contact.html">Ask us instead</a> — many needs combine several services.
    </p>
  </div>

  ${ctaBand(0, C, S.cta)}
</main>` + footer(0, C)));

/* ======================== CATEGORY PAGES (5) ======================== */
CAT.forEach(c => {
  const items = byCat(c.slug);
  pages.push(write(`services/${c.slug}/index.html`,
  head({ title: `${c.name} — ${items.length} services | ${C.shortName}`, desc: c.blurb, d: 2 }) +
  header('services', 2, C) + `
<main id="main">
  <div class="container">${crumbs(2, [{ href: 'index.html', label: 'Home' }, { href: 'services.html', label: 'Services' }, { label: c.name }])}</div>

  <section class="section section--tight">
    <div class="container split split--wide">
      <div class="stack" style="--s:18px">
        <div class="cluster" style="gap:11px">
          <span style="color:var(--navy)">${ic(c.icon, 30)}</span>
          <span class="tag">${items.length} services</span>
        </div>
        <h1>${c.name}</h1>
        <p class="lede">${c.blurb}</p>
        <div class="cluster">
          <a class="btn btn--primary" href="${up(2)}contact.html">Free consultation ${ic('arrow', 17)}</a>
          <a class="btn btn--gold" href="https://wa.me/${C.whatsappIntl}" target="_blank" rel="noopener">${ic('whatsapp', 18)} Ask on WhatsApp</a>
        </div>
      </div>
      <div class="stack" style="--s:18px">
        ${slot(c.shot, { ratio: '4 / 3', px: 'min 1200px', cat: c.photo })}
        <div class="card card--surface card--pad">
          <span class="eyebrow">At a glance</span>
          <table class="dtable" style="margin-top:12px">
            <tr><th scope="row" style="width:45%">Who it is for</th><td>${PH('WHO')}</td></tr>
            <tr><th scope="row">Estimated turnaround</th><td>${PH('RANGE')}</td></tr>
            <tr><th scope="row">Cost range</th><td>${PH('RANGE')}</td></tr>
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
              <p class="small" style="margin-top:6px">${PH('ONE-LINE SUMMARY')}</p>
            </div>
            <div class="rowcard__end">
              <span class="tiny">${ic('clock', 14)} ${PH('EST.')}</span>
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
          ${items.slice(0, 4).map(s => `<tr><td>${PH('SITUATION')}</td><td><a href="${s.slug}.html"><strong>${s.name}</strong></a></td><td>${PH('REQUIREMENT')}</td></tr>`).join('\n          ')}
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
        ${[1,2,3,4].map(n => `<div class="acc__item">
          <button class="acc__btn" id="q${c.slug}${n}" aria-expanded="false" aria-controls="a${c.slug}${n}">
            ${PH('QUESTION ' + n)} ${ic('chevron', 20)}</button>
          <div class="acc__panel" id="a${c.slug}${n}" role="region" aria-labelledby="q${c.slug}${n}" hidden>
            ${PH('ANSWER')} — write the answers your team already gives over WhatsApp. Mark this section up with FAQ schema so it can appear in search results.</div>
        </div>`).join('\n        ')}
      </div>
    </div>
  </section>

  ${ctaBand(2, C, S.cta)}
</main>` + footer(2, C)));
});

/* ====================== SERVICE DETAIL (24) ====================== */
SVC.forEach(s => {
  const c = cat(s.cat);
  const siblings = byCat(s.cat).filter(x => x.slug !== s.slug);
  pages.push(write(`services/${s.cat}/${s.slug}.html`,
  head({ title: `${s.name} | ${C.shortName}`, desc: `${s.name} handled end to end by ${C.legalName}, Jakarta.`, d: 2 }) +
  header('services', 2, C) + `
<main id="main">
  <div class="container">${crumbs(2, [{ href: 'index.html', label: 'Home' }, { href: 'services.html', label: 'Services' }, { href: `services/${c.slug}/`, label: c.name }, { label: s.name }])}</div>

  <section class="section section--tight">
    <div class="container split split--wide" style="align-items:start">
      <div class="stack" style="--s:18px">
        <span class="tag">${c.name}</span>
        <h1>${s.name}</h1>
        <p class="lede">${PH('WRITE THE ONE-SENTENCE SUMMARY')} — say what is handled, from which starting point to which finished document.</p>
        ${slot(s.shot, { ratio: '16 / 9', px: 'min 1400px', cat: s.photo, seed: s.slug })}
        <ul class="facts">
          ${[['clock','Turnaround','EST.'],['doc','Documents from you','N ITEMS'],['users','Who it is for','WHO'],['badge','You receive','OUTPUT']]
            .map(([i,k,v]) => `<li class="fact">${ic(i, 19, 'icon-lead')}
            <span class="fact__k">${k}</span><span class="fact__v">${PH(v)}</span></li>`).join('\n          ')}
        </ul>
      </div>

      <aside class="stack" style="--s:16px">
        <div class="card card--navy card--pad">
          <span class="eyebrow">Start here</span>
          <h3 style="margin:6px 0 8px">Free consultation first</h3>
          <p class="small">Send us your situation and we reply with the document list and a cost estimate.</p>
          <div class="stack" style="--s:10px;margin-top:16px">
            <a class="btn btn--gold btn--block" href="https://wa.me/${C.whatsappIntl}" target="_blank" rel="noopener">${ic('whatsapp', 18)} ${C.whatsapp}</a>
            <a class="btn btn--primary btn--block" href="${up(2)}contact.html">Request a quote ${ic('arrow', 17)}</a>
            <a class="btn btn--ghost btn--block" href="${up(2)}tools.html">${ic('calc', 17)} Related tools</a>
          </div>
          <div style="margin-top:18px;padding-top:16px;border-top:1px solid var(--line)">
            <p class="eyebrow" style="margin-bottom:10px">Handled by</p>
            <div class="cluster" style="gap:11px">
              ${avatar(S.team[0].name)}
              <span><span style="display:block;font-family:var(--display);font-weight:700;font-size:.875rem;color:var(--ink)">${S.team[0].name}</span>
              <span class="tiny">${S.team[0].role}</span></span>
            </div>
          </div>
        </div>
        <div class="card card--surface card--pad">
          <span class="eyebrow">Not what you need?</span>
          <ul style="margin-top:10px">
            ${siblings.slice(0, 3).map(x => `<li style="padding:9px 0;border-bottom:1px solid var(--line)">
            <a href="${x.slug}.html" style="display:flex;gap:9px;align-items:flex-start;font-size:.9375rem;font-weight:600">
            ${ic(c.icon, 16)} ${x.name}</a></li>`).join('\n            ')}
          </ul>
        </div>
      </aside>
    </div>
  </section>

  <section class="section section--surface">
    <div class="container split split--wide" style="align-items:start">
      <div class="prose">
        <h2>What this is</h2>
        <p class="small" style="margin-top:12px">${PH('WRITE 2–3 PARAGRAPHS')} — the current site has no text at all on this page. Explain it in the words your clients use, not the words the regulation uses. Cite the legal basis at the end, not the beginning.</p>
        <h2 style="margin-top:clamp(24px,3vw,36px)">You need this if</h2>
        <ul class="grid g2" style="margin-top:14px">
          ${[1,2,3,4].map(n => `<li class="card card--pad" style="padding:15px">
          <span class="icon-lead" style="margin-bottom:8px">${ic(c.icon, 18)}</span>
          <p class="small">${PH('TRIGGER SITUATION ' + n)}</p></li>`).join('\n          ')}
        </ul>
      </div>
      <div class="stack" style="--s:16px">
        ${slot(`Photo: real-world context for ${s.name.toLowerCase()}`, { ratio: '4 / 3', px: 'min 1000px', cat: s.photo, seed: s.slug + '-context' })}
        <div class="card card--gold card--pad">
          <span class="icon-lead icon-lead--gold">${ic('spark', 24)}</span>
          <h4>Often taken together with</h4>
          <ul style="margin-top:8px">
            ${siblings.slice(0, 2).map(x => `<li style="padding:5px 0"><a href="${x.slug}.html" class="small" style="font-weight:600">${x.name} →</a></li>`).join('\n            ')}
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <span class="eyebrow">Requirements</span>
      <h2 style="margin:8px 0 12px">Document checklist</h2>
      <p class="lede" style="max-width:64ch">Written as a checklist rather than prose, because clients open this page while they are gathering the documents.</p>
      <div class="grid g3" style="margin-top:clamp(24px,3vw,36px);align-items:start">
        <div>
          <div class="cluster" style="gap:9px;margin-bottom:12px"><span style="color:var(--navy)">${ic('building', 19)}</span><span class="eyebrow">From the company</span></div>
          <ul class="checklist">${[1,2,3,4,5].map(n => `<li>${ic('check', 16)} ${PH('DOCUMENT ' + n)}</li>`).join('')}</ul>
        </div>
        <div>
          <div class="cluster" style="gap:9px;margin-bottom:12px"><span style="color:var(--navy)">${ic('users', 19)}</span><span class="eyebrow">From the individual</span></div>
          <ul class="checklist">${[1,2,3,4,5].map(n => `<li>${ic('check', 16)} ${PH('DOCUMENT ' + n)}</li>`).join('')}</ul>
        </div>
        <div class="stack" style="--s:14px">
          ${slot('Photo: the required paperwork laid out on a desk', { ratio: '4 / 3', px: 'min 1000px', icon: 'doc', cat: 'tax-docs', seed: s.slug + '-docs' })}
          <div class="card card--surface card--pad">
            <span class="icon-lead">${ic('doc', 22)}</span>
            <h4>Download the checklist (PDF)</h4>
            <p class="small" style="margin-top:6px">Offer it in exchange for an email address — it doubles as a lead source.</p>
            <a class="btn btn--quiet" style="margin-top:12px" href="#">Download ${ic('arrow', 15)}</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--surface">
    <div class="container">
      <span class="eyebrow">Process</span>
      <h2 style="margin:8px 0 clamp(20px,3vw,32px)">Stage by stage</h2>
      <ol class="grid g4">
        ${[['whatsapp','Consultation &amp; document check'],['doc','Filing'],['clock','Authority processing'],['check','Handover &amp; reporting']]
          .map(([i,t],n) => `<li class="card card--pad">
          <div class="between" style="gap:10px;margin-bottom:10px">
            <span style="font-family:var(--display);font-weight:800;font-size:1.3rem;color:var(--navy)">0${n+1}</span>
            <span style="color:var(--faint)">${ic(i, 19)}</span></div>
          <h4>${t}</h4><p class="tiny" style="margin-top:6px">${PH('EST.')}</p></li>`).join('\n        ')}
      </ol>
      <div style="margin-top:clamp(22px,3vw,30px)">${slot('Photo: the process in progress, or the document handover', { ratio: '21 / 9', px: 'min 1600px', cat: 'handover', seed: s.slug + '-handover' })}</div>
    </div>
  </section>

  <section class="section">
    <div class="container split split--wide" style="align-items:start">
      <div>
        <div class="cluster" style="gap:9px;margin-bottom:10px"><span style="color:var(--navy)">${ic('chart', 20)}</span><span class="eyebrow">Cost</span></div>
        <h2 style="margin-bottom:12px">What makes up the fee</h2>
        <p class="small" style="margin-bottom:16px">If you are not ready to publish a figure, publish the <strong>components</strong>. That is far more credible than saying nothing, and it does not tie you to one number.</p>
        <table class="dtable">
          <thead><tr><th>Component</th><th>What it covers</th><th style="width:24%">Range</th></tr></thead>
          <tbody>
            <tr><td>Professional fee</td><td>Advice, preparation and filing</td><td>${PH('RANGE')}</td></tr>
            <tr><td>Government charges</td><td>Paid to the state at the official tariff</td><td>${PH('RANGE')}</td></tr>
            <tr><td>Third-party costs</td><td>${PH('IF ANY')}</td><td>${PH('RANGE')}</td></tr>
          </tbody>
        </table>
        <h2 style="margin:clamp(26px,3vw,38px) 0 clamp(16px,2vw,22px)">Frequently asked</h2>
        <div class="acc">
          ${[1,2,3,4].map(n => `<div class="acc__item">
            <button class="acc__btn" id="fq${n}" aria-expanded="false" aria-controls="fa${n}">${PH('QUESTION ' + n)} ${ic('chevron', 20)}</button>
            <div class="acc__panel" id="fa${n}" role="region" aria-labelledby="fq${n}" hidden>${PH('ANSWER')}</div>
          </div>`).join('\n          ')}
        </div>
      </div>
      <aside class="stack" style="--s:16px">
        <div class="card card--pad">
          <span class="icon-lead">${ic('scale', 24)}</span>
          <h4>Legal basis</h4>
          <p class="small" style="margin-top:6px">${PH('CITE THE REGULATIONS — NUMBER AND YEAR')}</p>
          <p class="tiny" style="margin-top:10px">Last reviewed: ${PH('DATE')}</p>
        </div>
        <div class="card">
          ${slot('Image: related article', { ratio: '16 / 9', cls: 'card__media', cat: 'filed-docs', seed: s.slug + '-related' })}
          <div class="card__body" style="padding:16px">
            <span class="eyebrow">Related reading</span>
            <p class="small" style="margin-top:8px">${PH('ARTICLE TITLE')} →</p>
          </div>
        </div>
      </aside>
    </div>
  </section>

  ${ctaBand(2, C, S.cta)}
</main>` + footer(2, C)));
});

/* ============================== TOOLS ============================== */
pages.push(write('tools.html',
head({ title: `Tools & Calculators — free, no sign-up | ${C.shortName}`, desc: 'Nine free tools: five Indonesian tax calculators plus cost and requirement simulators for company setup, KITAS and trademark filing.', d: 0 }) +
header('tools', 0, C) + `
<main id="main">
  <div class="container">${crumbs(0, [{ href: 'index.html', label: 'Home' }, { label: 'Tools' }])}</div>

  <section class="section section--tight">
    <div class="container split split--wide">
      <div class="stack" style="--s:18px">
        <span class="eyebrow">Free tools</span>
        <h1>Work out the numbers yourself first</h1>
        <p class="lede">Nine tools for estimating tax, cost and processing time. Nothing is sent to a server — results stay in your browser.</p>
        <div class="cluster">
          <button class="chip" aria-pressed="true">All 9</button>
          <button class="chip">${ic('calc', 15)} Tax calculators (5)</button>
          <button class="chip chip--gold">${ic('spark', 15)} Cost &amp; requirement simulators (4)</button>
        </div>
      </div>
      ${slot('Screenshot: one calculator with results filled in, on desktop', { ratio: '16 / 9', px: 'min 1600px', icon: 'screen', cat: 'screen' })}
    </div>
  </section>

  <section class="section section--surface">
    <div class="container">
      <span class="eyebrow">Tax calculators</span>
      <h2 style="margin:8px 0 clamp(20px,3vw,32px)">Five Indonesian income-tax calculators</h2>
      <div class="grid g3">
        ${S.tools.filter(t => t.kind === 'tax').map(t => `<article class="card card--pad">
          <span class="icon-lead">${ic('calc', 24)}</span>
          <h3>${t.name}</h3>
          <p class="small" style="margin-top:8px">${t.note}</p>
          <p class="tiny" style="margin-top:12px">${PH('SHELL ONLY — CALCULATION LOGIC NOT BUILT')}</p>
        </article>`).join('\n        ')}
      </div>

      <span class="eyebrow eyebrow--gold" style="display:block;margin-top:clamp(32px,4vw,52px)">Accupro-only</span>
      <h2 style="margin:8px 0 clamp(20px,3vw,32px)">Four simulators no competitor offers</h2>
      <div class="grid g4">
        ${S.tools.filter(t => t.kind === 'own').map(t => `<article class="card card--gold">
          ${slot(`Screenshot: ${t.name}`, { ratio: '16 / 9', px: 'min 1200px', icon: 'screen', cls: 'card__media', cat: 'screen', seed: t.name })}
          <div class="card__body card__body--badged">
            <span class="card__badge card__badge--gold">${ic('spark', 20)}</span>
            <h4>${t.name}</h4>
            <p class="small" style="margin-top:8px">${t.note}</p>
          </div></article>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <span class="eyebrow">Anatomy</span>
      <h2 style="margin:8px 0 12px">How each tool is laid out</h2>
      <p class="lede" style="max-width:66ch">The shell below is built and styled. The calculation logic is deliberately not wired up — see README.md for where to add it.</p>
      <div class="grid g2" style="margin-top:clamp(24px,3vw,36px);align-items:start">
        <form class="card card--pad" onsubmit="return false">
          <div class="cluster" style="gap:9px;margin-bottom:14px"><span style="color:var(--navy)">${ic('calc', 20)}</span><span class="eyebrow">Input</span></div>
          <div class="card card--gold card--pad" style="padding:15px;margin-bottom:16px">
            <div class="cluster" style="gap:8px;margin-bottom:6px"><span style="color:var(--gold-700)">${ic('scale', 16)}</span>
            <span class="eyebrow eyebrow--gold" style="font-size:.6875rem">Rate guidance — shown before you fill anything in</span></div>
            <p class="small">State the applicable rates and the legal basis up front, so the user can see where the number comes from.</p>
          </div>
          <div class="stack" style="--s:14px">
            <label class="field"><span class="field__label">Taxpayer type</span>
              <select class="field__select"><option>General corporate</option><option>Listed company (Tbk.)</option><option>MSME</option></select></label>
            <label class="field"><span class="field__label">Gross turnover</span>
              <input class="field__input" type="text" inputmode="numeric" placeholder="Rp"></label>
            <label class="field"><span class="field__label">Taxable income</span>
              <input class="field__input" type="text" inputmode="numeric" placeholder="Rp"></label>
            <label class="field"><span class="field__label">Rate</span>
              <input class="field__input" type="text" value="Automatic from the selection above" readonly></label>
            <div class="cluster"><button class="btn btn--primary" style="flex:1 1 auto">Calculate</button><button class="btn btn--quiet" type="reset">Reset</button></div>
          </div>
        </form>
        <div class="stack" style="--s:16px">
          <div class="card card--navy card--pad">
            <div class="cluster" style="gap:9px;margin-bottom:12px"><span style="color:var(--navy)">${ic('chart', 20)}</span><span class="eyebrow">Result</span></div>
            <p class="eyebrow" style="color:var(--faint)">Tax payable</p>
            <p class="stat__v" style="font-size:2.4rem;margin:4px 0 14px">Rp 0</p>
            <table class="dtable">
              <tr><th scope="row">Tax base</th><td>Rp 0</td></tr>
              <tr><th scope="row">Applicable rate</th><td>0%</td></tr>
              <tr><th scope="row">Facility applied</th><td>—</td></tr>
            </table>
            <div class="cluster" style="margin-top:14px"><button class="btn btn--quiet">Copy result</button><button class="btn btn--quiet">Download PDF</button></div>
          </div>
          <div class="card card--surface card--pad">
            <div class="cluster" style="gap:9px;margin-bottom:8px"><span style="color:var(--navy)">${ic('clock', 19)}</span><span class="eyebrow">Calculation history</span></div>
            <p class="small">Keep it in <code>localStorage</code> so it survives a page reload. The competitor's version discards history the moment the tab closes.</p>
          </div>
          <div class="card card--gold card--pad">
            <div class="cluster" style="gap:9px;margin-bottom:8px"><span style="color:var(--gold-700)">${ic('arrow', 19)}</span><span class="eyebrow eyebrow--gold">Bridge to a service</span></div>
            <h4>Need help filing this?</h4>
            <p class="small" style="margin-top:6px">Link to the service that matches the result. This is where a free tool turns into an enquiry.</p>
            <a class="btn btn--gold btn--sm" style="margin-top:12px" href="services.html">See services ${ic('arrow', 15)}</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--surface">
    <div class="container">
      <div class="card card--pad cluster" style="gap:22px;flex-wrap:wrap">
        <span class="icon-lead" style="margin:0">${ic('scale', 30)}</span>
        <div><h3>These results are estimates</h3>
        <p class="small" style="margin-top:6px">Publish a clear disclaimer: figures are indicative and do not replace an official computation. Then offer verification by your team — that is the most natural way in.</p></div>
        <a class="btn btn--primary" href="contact.html">Ask us to verify ${ic('arrow', 17)}</a>
      </div>
    </div>
  </section>

  ${ctaBand(0, C, S.cta)}
</main>` + footer(0, C)));

/* ============================== ARTICLES ============================== */
pages.push(write('articles.html',
head({ title: `Articles — tax, legal and licensing insight | ${C.shortName}`, desc: 'Practical explanations of rule changes, commonly misunderstood requirements, and costs to budget for.', d: 0 }) +
header('articles', 0, C) + `
<main id="main">
  <div class="container">${crumbs(0, [{ href: 'index.html', label: 'Home' }, { label: 'Articles' }])}</div>

  <section class="section section--tight">
    <div class="container">
      <div class="card card--gold card--pad">
        <div class="cluster" style="gap:11px;margin-bottom:8px"><span style="color:var(--gold-700)">${ic('spark', 22)}</span>
        <h3>Clear the old posts before this page goes live</h3></div>
        <p class="small">The current site still serves seven placeholder posts, indexed by search engines: <code>hello-world</code>, two <code>lorem ipsum</code> variants, two <code>we-denounce-with-of-righteous-one-indignation</code> variants and two <code>with-our-vastly-improved-notifications-system</code> variants — complete with fake comments and a fake pull quote, dated March 2021. Delete them, then request URL removal in Search Console.</p>
      </div>
    </div>
  </section>

  <section class="section section--tight">
    <div class="container stack" style="--s:16px">
      <span class="eyebrow">Articles</span>
      <h1>Tax, legal &amp; licensing insight</h1>
      <p class="lede" style="max-width:62ch">Practical explanations of rules that changed, requirements that are commonly misunderstood, and costs worth budgeting for.</p>
    </div>
  </section>

  <section class="section section--tight">
    <div class="container split split--wide" style="align-items:start">
      <article class="card card--link">
        ${slot('Lead image for the featured article', { ratio: '16 / 9', px: 'min 1600px', cls: 'card__media', cat: 'meeting' })}
        <div class="card__body card__body--badged">
          <span class="card__badge">${ic('chart', 21)}</span>
          <div class="cluster" style="gap:10px"><span class="tag">${PH('CATEGORY')}</span>
          <span class="tiny">${PH('AUTHOR')} · ${PH('DATE')} · ${PH('N')} min read</span></div>
          <h2 style="margin-top:11px">${PH('FEATURED ARTICLE HEADLINE')}</h2>
          <p class="small" style="margin-top:10px">${PH('TWO-LINE SUMMARY')} — answer "why should I read this".</p>
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
              <span class="tiny">${PH('N')}</span></li>`).join('\n            ')}
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
            <h4 style="margin-top:10px">${PH('ARTICLE TITLE')}</h4>
            <p class="tiny" style="margin-top:8px">${PH('DATE')} · ${PH('N')} min read</p>
          </div></article>`).join('\n        ')}
      </div>
      <nav class="cluster" style="justify-content:center;margin-top:clamp(28px,3vw,40px)" aria-label="Pagination">
        ${['‹','1','2','3','›'].map((n, i) => `<a class="chip" href="#"${i === 1 ? ' aria-pressed="true"' : ''} style="min-width:44px;justify-content:center">${n}</a>`).join('')}
      </nav>
    </div>
  </section>

  ${ctaBand(0, C, S.cta)}
</main>` + footer(0, C)));

/* ============================== CONTACT ============================== */
pages.push(write('contact.html',
head({ title: `Contact — ${C.legalName}`, desc: `Contact ${C.legalName} in North Jakarta. ${C.hours}`, d: 0 }) +
header('contact', 0, C) + `
<main id="main">
  <div class="container">${crumbs(0, [{ href: 'index.html', label: 'Home' }, { label: 'Contact' }])}</div>

  <section class="section section--tight">
    <div class="container split split--wide">
      <div class="stack" style="--s:16px">
        <span class="eyebrow">Contact</span>
        <h1>Let's talk</h1>
        <p class="lede">Pick whichever channel suits you. For a quick question WhatsApp is usually fastest; for anything that needs a quote, use the form below.</p>
      </div>
      ${slot('Photo: reception or meeting room — gives the contact page a face', { ratio: '16 / 9', px: 'min 1400px', icon: 'pin', cat: 'reception' })}
    </div>
    <div class="container">
      <ul class="grid g4" style="margin-top:clamp(24px,3vw,36px)">
        ${[['whatsapp','WhatsApp', C.whatsapp, 'Answered during office hours', `https://wa.me/${C.whatsappIntl}`, true],
           ['phone','Phone', C.phones[0], C.hours, `tel:${C.phones[0].replace(/-/g,'')}`, false],
           ['phone','Second line', C.phones[1], 'Also listed on the current site', `tel:${C.phones[1].replace(/-/g,'')}`, false],
           ['mail','Email', C.emails[0], 'Move this to your own domain', `mailto:${C.emails[0]}`, false]]
          .map(([i,t,v,s,href,gold]) => `<li class="card ${gold ? 'card--gold' : ''} card--pad">
          <span class="${gold ? 'icon-lead icon-lead--gold' : 'icon-lead'}">${ic(i, 24)}</span>
          <h4>${t}</h4>
          <p style="font-weight:600;margin:3px 0 4px"><a href="${href}"${gold ? ' target="_blank" rel="noopener"' : ''}>${v}</a></p>
          <p class="tiny">${s}</p></li>`).join('\n        ')}
      </ul>
      <p class="tiny" style="margin-top:14px">${PH('Consolidate these')} — the current site shows three different phone numbers and two different Gmail addresses across its pages. Pick one set and use it everywhere.</p>
    </div>
  </section>

  <section class="section section--surface">
    <div class="container split split--wide" style="align-items:start">
      <form class="card card--pad" data-demo-form novalidate>
        <div class="cluster" style="gap:9px;margin-bottom:6px"><span style="color:var(--navy)">${ic('doc', 20)}</span><h2 style="font-size:1.5rem">Request a quote</h2></div>
        <p class="small" style="margin-bottom:20px">Answered within ${PH('RESPONSE TIME')}, with concrete next steps and an estimate.</p>
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
            <span>I agree that my data may be processed in line with the <a href="#">Privacy Policy</a>. ${PH('This page does not exist yet')}</span></label>
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
          <div class="cluster" style="gap:10px"><span style="color:var(--navy)">${ic('clock', 19)}</span><p class="small">${C.hours}</p></div>
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
            <div class="acc__panel" id="ca${n}" role="region" aria-labelledby="cq${n}" hidden>${PH('ANSWER')} — write the answer your team already gives.</div>
          </div>`).join('\n          ')}
        </div>
      </div>
    </div>
  </section>
</main>` + footer(0, C)));

/* ============================== 404 ============================== */
pages.push(write('404.html',
head({ title: `Page not found — ${C.shortName}`, desc: 'That page does not exist.', d: 0 }) +
header('', 0, C) + `
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
</main>` + footer(0, C)));

/* ===================== sitemap.xml + robots.txt ===================== */
/* Production domain by default; a preview deploy overrides it with SITE_URL so
   the sitemap advertises the host it is actually served from. */
const BASE = process.env.SITE_URL || 'https://accuprointernational.co.id';
const urls = ['index.html','about.html','services.html','tools.html','articles.html','contact.html']
  .map(u => ({ loc: u === 'index.html' ? '/' : '/' + u, pri: u === 'index.html' ? '1.0' : '0.8' }))
  .concat(CAT.map(c => ({ loc: `/services/${c.slug}/`, pri: '0.7' })))
  .concat(SVC.map(s => ({ loc: `/services/${s.cat}/${s.slug}.html`, pri: '0.6' })));
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${BASE}${u.loc}</loc><priority>${u.pri}</priority></url>`).join('\n')}
</urlset>
`);
/* A preview build tells crawlers to stay out entirely — see NOINDEX in layout.mjs.
   The per-page meta robots tag is the reliable half: a project-subpath deploy
   serves robots.txt at /<repo>/robots.txt, which crawlers do not read. */
write('robots.txt', NOINDEX
  ? `User-agent: *\nDisallow: /\n`
  : `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);
console.log(`sitemap.xml: ${urls.length} URLs`);

/* ---------------------------- report ---------------------------- */
const g = { root: 0, category: 0, service: 0 };
pages.forEach(p => { if (!p.includes('/')) g.root++; else if (p.endsWith('index.html')) g.category++; else g.service++; });
console.log(`built ${pages.length} pages —`, g);
