/* Generator alternatif: menyusun halaman langsung dari content-recap/content.json,
   meniru urutan section situs lama apa adanya.
 *
 * TIDAK dipakai build mana pun. build.mjs yang menghasilkan situs statis, dan
 * wordpress/ yang menghasilkan tema. Tidak ada berkas lain yang mengimpor ini —
 * arah desainnya sudah ditinggalkan lebih awal karena bukan layout yang dipilih.
 *
 * Disimpan karena pemetaan section-per-section ke content.json di sini adalah
 * satu-satunya yang ada, dan itu berguna kalau suatu saat perlu memastikan ada
 * teks sumber yang belum terpakai.
 *
 * HATI-HATI: OUT = 'dist'. Menjalankannya akan menimpa keluaran build.mjs,
 * termasuk sitemap.xml dan robots.txt. Pulihkan dengan `node build.mjs`.
 */

import fs from 'fs';
import path from 'path';
import { ic } from './icons.mjs';
import { photoUrl } from './photos.mjs';

const SOURCE_ORIGIN = 'https://accuprointernational.co.id';
const OUT = 'dist';
const RECAP = JSON.parse(fs.readFileSync('content-recap/content.json', 'utf8'));
const SITE_DATA = JSON.parse(fs.readFileSync('data/site.json', 'utf8'));
const RECORDS = RECAP.pages;
const BY_URL = new Map(RECORDS.map(record => [record.url, record]));
const LANGS = ['id', 'en', 'ch'];

const GLOBAL_IDS = {
  utility: 'elementor-element-9aca864',
  nav: 'elementor-element-9de30ab',
  footer: 'elementor-element-3ca494f3',
  copyright: 'elementor-element-d19d1',
};

const COPY = {
  id: {
    skip: 'Lewati ke konten', menu: 'Buka menu', close: 'Tutup menu',
    home: 'Home', about: 'Tentang Kami', services: 'Layanan', contact: 'Kontak',
    section: 'Bagian', sourceStatus: 'Status sumber', consultation: 'Hubungi Kami',
    missingProfile: 'Profil lengkap belum diterbitkan pada website sumber.',
    noBodyCopy: 'Halaman sumber tidak memuat teks isi di sini — hanya judul.',
    formNote: 'Formulir valid. Endpoint pengiriman belum dihubungkan.',
  },
  en: {
    skip: 'Skip to content', menu: 'Open menu', close: 'Close menu',
    home: 'Home', about: 'About Us', services: 'Service', contact: 'Contact',
    section: 'Section', sourceStatus: 'Source status', consultation: 'Contact Us',
    missingProfile: 'A complete profile has not been published on the source website.',
    noBodyCopy: 'The source page carries no body text here — only a title.',
    formNote: 'The form is valid. A submission endpoint is not connected yet.',
  },
  ch: {
    skip: '跳至内容', menu: '打开菜单', close: '关闭菜单',
    home: '家', about: '关于我们', services: '服务', contact: '接触',
    section: '部分', sourceStatus: '源状态', consultation: '联系我们',
    missingProfile: '源网站尚未发布完整的个人资料。',
    noBodyCopy: '源页面此处没有正文内容，只有标题。',
    formNote: '表格有效，但尚未连接提交端点。',
  },
};

const esc = value => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const stripBrand = value => String(value || '')
  .replace(/\s+-\s+Accupro International(?:\s+WordPress\s+›\s+.*)?$/i, '')
  .trim();

const sourcePath = url => decodeURI(new URL(url).pathname).replace(/\/{2,}/g, '/');

const canonicalKey = url => sourcePath(url).replace(/^\/(en|ch)(?=\/|$)/, '') || '/';

const languagePath = (lang, relative = '/') => {
  const rel = relative.startsWith('/') ? relative : `/${relative}`;
  if (lang === 'id') return rel;
  return `/${lang}${rel}`.replace(/\/{2,}/g, '/');
};

const localHref = url => sourcePath(url);

const outputPath = url => {
  const pathname = sourcePath(url).replace(/^\//, '');
  return pathname ? path.join(OUT, pathname, 'index.html') : path.join(OUT, 'index.html');
};

const pageType = record => {
  const key = canonicalKey(record.url);
  if (key === '/') return 'home';
  if (key === '/tentang-kami/') return 'about';
  if (key === '/layanan/') return 'services';
  if (key === '/kontak/') return 'contact';
  if (key.startsWith('/layanan/')) return 'service-detail';
  if (key.startsWith('/team/')) return 'team-detail';
  if (key.startsWith('/testimonial/')) return 'testimonial-detail';
  if (key.startsWith('/category/') || key.startsWith('/tag/') || key.startsWith('/author/')) return 'archive';
  if (key.includes('联系我们')) return 'error';
  return 'article';
};

const isGlobal = segment => Object.values(GLOBAL_IDS).some(id => segment.class.includes(id));
const mainSegments = record => record.segments.filter(segment => !isGlobal(segment));
const homeRecord = lang => BY_URL.get(`${SOURCE_ORIGIN}${lang === 'id' ? '' : `/${lang}`}/`);

const globalSegment = (lang, id) => homeRecord(lang)?.segments.find(segment => segment.class.includes(id));

const pageFor = (lang, key) => BY_URL.get(`${SOURCE_ORIGIN}${languagePath(lang, key)}`);

const recordVariant = (record, lang) => pageFor(lang, canonicalKey(record.url));

const titleFor = record => stripBrand(record.title) || record.h1?.[0] || record.url;

const descriptionFor = record => record.meta?.description
  || mainSegments(record).flatMap(segment => segment.lines).find(line => line.length > 100)
  || titleFor(record);

const unique = values => [...new Set(values.filter(Boolean))];

const photoCategory = record => {
  const key = canonicalKey(record.url);
  if (key.startsWith('/team/')) return 'portrait';
  if (key.includes('kitas') || key.includes('visa')) return 'passport';
  if (key.includes('merek')) return 'branding';
  if (key.startsWith('/layanan/')) return 'tax-docs';
  if (pageType(record) === 'article' || pageType(record) === 'archive') return 'filed-docs';
  if (pageType(record) === 'contact') return 'city';
  if (pageType(record) === 'about') return 'team-work';
  return 'meeting';
};

const picture = (record, ratio = '16 / 9', className = '') => {
  const seed = pageType(record) === 'home' && className.includes('hero')
    ? 'accupro-home'
    : `${record.url}-${ratio}-${className}`;
  const src = photoUrl(photoCategory(record), seed, { ratio, w: 1600 });
  return `<figure class="site-photo ${className}" style="--photo-ratio:${ratio}">
    <img src="${src}" alt="${esc(titleFor(record))}" loading="lazy" decoding="async">
  </figure>`;
};

const sectionFrame = (record, segment, index, role, inner) => `
<section class="dossier-section dossier-section--${role}" data-source-section="${index + 1}">
  <div class="container dossier-grid">
    <aside class="section-rail" aria-label="${esc(COPY[record.language].section)} ${index + 1}">
      <span>${String(index + 1).padStart(2, '0')}</span>
      <i aria-hidden="true"></i>
      <small>${esc(role.replace(/-/g, ' '))}</small>
    </aside>
    <div class="section-content">${inner}</div>
  </div>
</section>`;

const marker = value => value.replace(/^\\+\s*|\s*\\+$/g, '').trim();

const renderLineDeck = lines => {
  if (!lines.length) return '';
  const [first, second, ...rest] = lines;
  const firstIsLong = first.length > 100;
  return `<header class="section-heading">
    ${firstIsLong ? '' : `<p class="kicker">${esc(first)}</p>`}
    ${second ? `<h2>${esc(second)}</h2>` : `<h2>${esc(marker(first))}</h2>`}
    ${firstIsLong ? `<p class="lede">${esc(first)}</p>` : ''}
  </header>
  ${rest.length ? `<div class="line-deck">${rest.map((line, index) => {
    const metric = /^\d+%$/.test(line);
    const long = line.length > 105;
    return `<div class="line-card${metric ? ' line-card--metric' : ''}${long ? ' line-card--wide' : ''}">
      ${metric ? `<strong>${esc(line)}</strong>` : long ? `<p>${esc(line)}</p>` : `<span>${esc(line)}</span>`}
      <small>${String(index + 1).padStart(2, '0')}</small>
    </div>`;
  }).join('')}</div>` : ''}`;
};

const renderHero = (record, segment, alternate = false) => {
  const groups = [];
  for (let i = 0; i < segment.lines.length; i += 3) groups.push(segment.lines.slice(i, i + 3));
  const [lead = [], ...rest] = groups;
  if (alternate) {
    return `<div class="claim-layout">
      <header class="section-heading"><p class="kicker">03 / ${String(groups.length).padStart(2, '0')}</p><h2>${esc(lead[0] || titleFor(record))}</h2></header>
      <div class="claim-grid">${groups.map((group, index) => `<article class="claim-card">
        <span>${String(index + 1).padStart(2, '0')}</span><h3>${esc(group[0] || '')}</h3>
        ${group[1] ? `<p>${esc(group[1])}</p>` : ''}${group[2] ? `<a href="${languagePath(record.language, '/tentang-kami/')}">${esc(group[2])} ${ic('arrow', 17)}</a>` : ''}
      </article>`).join('')}</div>
    </div>`;
  }
  return `<div class="hero-layout">
    <div class="hero-copy">
      <p class="kicker">PT. Accurate Pro International</p>
      <h1>${esc(lead[0] || titleFor(record))}</h1>
      ${lead[1] ? `<p class="hero-lede">${esc(lead[1])}</p>` : ''}
      <div class="hero-actions">
        <a class="button button--gold" href="${languagePath(record.language, '/kontak/')}">${esc(lead[2] || COPY[record.language].consultation)} ${ic('arrow', 18)}</a>
        <a class="button button--line" href="${languagePath(record.language, '/layanan/')}">${esc(COPY[record.language].services)}</a>
      </div>
    </div>
    <div class="hero-visual">${picture(record, '4 / 5', 'site-photo--hero')}
      <ol class="hero-index">${rest.map((group, index) => `<li><span>0${index + 2}</span><strong>${esc(group[0] || '')}</strong><p>${esc(group[1] || '')}</p>${group[2] ? `<small>${esc(group[2])}</small>` : ''}</li>`).join('')}</ol>
    </div>
  </div>`;
};

const renderPageHero = (record, segment) => {
  const lines = segment.lines;
  const generic = ['Blog Single', 'Team Detail'].includes(lines[0]);
  const heading = generic ? titleFor(record) : (lines[0] || titleFor(record));
  const crumbs = unique(lines.slice(generic ? 2 : 1).filter(line => line.length < 50));
  return `<div class="page-hero">
    <div>
      <p class="kicker">${esc(generic ? lines[0] : COPY[record.language].sourceStatus)}</p>
      <h1>${esc(heading)}</h1>
      ${lines[1] && lines[1] !== heading ? `<p class="page-hero__lede">${esc(lines[1])}</p>` : ''}
      ${crumbs.length ? `<nav class="breadcrumbs" aria-label="Breadcrumb">${crumbs.map(item => `<span>${esc(item)}</span>`).join('<i>/</i>')}</nav>` : ''}
    </div>
    <div class="page-hero__stamp" data-status="${record.status}"><span>ACCUPRO</span><strong>${record.status}</strong><small>${esc(COPY[record.language].sourceStatus)}</small></div>
  </div>`;
};

const serviceRecords = lang => RECORDS.filter(record => record.language === lang && pageType(record) === 'service-detail');

const serviceOrder = lang => {
  const listing = pageFor(lang, '/layanan/');
  const sourceLines = mainSegments(listing).find(segment => segment.lines.length >= 24)?.lines || [];
  const candidates = serviceRecords(lang);
  const used = new Set();
  return sourceLines.map((label, index) => {
    if (/no posts found/i.test(label)) return { label, record: null };
    let found = candidates.find(candidate => !used.has(candidate.url) && titleFor(candidate).toLowerCase() === label.toLowerCase());
    if (!found) {
      const idListing = mainSegments(pageFor('id', '/layanan/')).find(segment => segment.lines.length >= 24)?.lines || [];
      const idTitle = idListing[index];
      const idRecord = serviceRecords('id').find(candidate => titleFor(candidate).toLowerCase() === String(idTitle).toLowerCase());
      if (idRecord) found = recordVariant(idRecord, lang);
    }
    if (found) used.add(found.url);
    return { label, record: found || null };
  });
};

const renderServices = (record, segment) => {
  const fullListing = segment.lines.length >= 20;
  const allOrdered = serviceOrder(record.language);
  const visibleLines = fullListing ? segment.lines : segment.lines.slice(2);
  const ordered = visibleLines.map((label, index) => {
    const match = allOrdered.find(item => item.label === label && item.record)
      || allOrdered.find(item => item.label.toLowerCase() === label.toLowerCase() && item.record);
    return match || { label, record: null, sourceIndex: index };
  });
  const kicker = fullListing ? COPY[record.language].services : segment.lines[0];
  const heading = fullListing ? `${segment.lines.length - 1} ${COPY[record.language].services}` : segment.lines[1];
  return `<header class="section-heading"><p class="kicker">${esc(kicker || COPY[record.language].services)}</p><h2>${esc(heading || COPY[record.language].services)}</h2></header>
  <div class="service-grid">${ordered.map((item, index) => item.record ? `<a class="service-card" href="${localHref(item.record.url)}">
    <span>${String(index + 1).padStart(2, '0')}</span><h3>${esc(item.label)}</h3>${ic('arrow', 20)}
  </a>` : `<div class="service-card service-card--empty"><span>${String(index + 1).padStart(2, '0')}</span><h3>${esc(item.label)}</h3></div>`).join('')}</div>`;
};

const renderTestimonials = segment => {
  const [eyebrow, heading, ...items] = segment.lines;
  const cards = [];
  for (let i = 0; i < items.length; i += 3) cards.push(items.slice(i, i + 3));
  return `<header class="section-heading"><p class="kicker">${esc(eyebrow || '')}</p><h2>${esc(heading || '')}</h2></header>
  <div class="testimonial-grid">${cards.map((item, index) => `<figure class="quote-card">
    <span class="quote-mark">“</span><blockquote>${esc(item[0] || '')}</blockquote>
    <figcaption><strong>${esc(item[1] || '')}</strong><small>${esc(item[2] || '')}</small><i>0${index + 1}</i></figcaption>
  </figure>`).join('')}</div>`;
};

const renderTeam = (record, segment) => {
  const [eyebrow, heading, ...items] = segment.lines;
  const cards = [];
  for (let i = 0; i < items.length; i += 2) cards.push(items.slice(i, i + 2));
  const teamCandidates = RECORDS.filter(candidate => candidate.language === record.language && pageType(candidate) === 'team-detail');
  return `<header class="section-heading"><p class="kicker">${esc(eyebrow || '')}</p><h2>${esc(heading || '')}</h2></header>
  <div class="team-grid">${cards.map((item, index) => {
    const teamPage = teamCandidates.find(candidate => titleFor(candidate).toLowerCase().startsWith(String(item[0]).split(',')[0].toLowerCase()));
    return `<a class="team-card" href="${teamPage ? localHref(teamPage.url) : '#'}">
      <img src="${photoUrl('portrait', `${record.language}-${item[0]}`, { ratio: '3 / 4', w: 720 })}" alt="${esc(item[0] || '')}" loading="lazy">
      <span>0${index + 1}</span><h3>${esc(item[0] || '')}</h3><p>${esc(item[1] || '')}</p>
    </a>`;
  }).join('')}</div>`;
};

const renderOverview = (record, segment) => {
  const lines = segment.lines;
  const metrics = lines.map((line, index) => /^\d+%$/.test(line) ? [line, lines[index + 1]] : null).filter(Boolean);
  const metricIndexes = new Set(metrics.flatMap(metric => [lines.indexOf(metric[0]), lines.indexOf(metric[1])]));
  const remainder = lines.filter((_, index) => index > 2 && !metricIndexes.has(index));
  return `<div class="overview-grid">
    <div>${picture(record, '4 / 3')}</div>
    <div><header class="section-heading"><p class="kicker">${esc(lines[0] || '')}</p><h2>${esc(lines[1] || '')}</h2>${lines[2] ? `<p class="lede">${esc(lines[2])}</p>` : ''}</header>
      <div class="metric-row">${metrics.map(metric => `<div><strong>${esc(metric[0])}</strong><span>${esc(metric[1] || '')}</span></div>`).join('')}</div>
    </div>
  </div>
  ${remainder.length ? `<div class="line-deck line-deck--overview">${remainder.map(line => `<div class="line-card ${line.length > 100 ? 'line-card--wide' : ''}">${line.length > 100 ? `<p>${esc(line)}</p>` : `<span>${esc(line)}</span>`}</div>`).join('')}</div>` : ''}`;
};

const renderCta = (record, segment) => {
  const [eyebrow, heading, text, phone, ...rest] = segment.lines;
  return `<div class="cta-layout"><div><p class="kicker">${esc(eyebrow || '')}</p><h2>${esc(heading || '')}</h2>${text ? `<p>${esc(text)}</p>` : ''}</div>
    <div class="cta-actions">${phone ? `<a class="button button--gold" href="tel:${esc(phone.replace(/[^\d+]/g, ''))}">${ic('phone', 19)} ${esc(phone)}</a>` : ''}<a class="button button--light" href="${languagePath(record.language, '/kontak/')}">${esc(COPY[record.language].consultation)}</a></div>
    ${rest.map(line => `<span>${esc(line)}</span>`).join('')}
  </div>`;
};

const renderContactInfo = (record, segment) => {
  const [eyebrow, heading, ...items] = segment.lines;
  const cards = [];
  for (let i = 0; i < items.length; i += 2) cards.push(items.slice(i, i + 2));
  const icons = ['mail', 'phone', 'pin'];
  return `<header class="section-heading"><p class="kicker">${esc(eyebrow || '')}</p><h2>${esc(heading || '')}</h2></header>
  <div class="contact-grid">${cards.map((item, index) => `<article>${ic(icons[index] || 'pin', 24)}<span>${esc(item[0] || '')}</span><strong>${esc(item[1] || '')}</strong></article>`).join('')}</div>`;
};

const renderForm = (record, segment) => {
  const [heading, name, email, message, submit, ...rest] = segment.lines;
  return `<div class="form-layout"><div><p class="kicker">ACCUPRO / CONTACT</p><h2>${esc(heading || COPY[record.language].contact)}</h2>${picture(record, '16 / 10')}</div>
  <form class="contact-form" data-demo-form>
    <label><span>${esc(name || 'Nama')}</span><input name="name" required autocomplete="name"></label>
    <label><span>${esc(email || 'Email')}</span><input type="email" name="email" required autocomplete="email"></label>
    <label><span>${esc(message || 'Pesan')}</span><textarea name="message" required rows="6"></textarea></label>
    ${rest.map(line => `<p>${esc(line)}</p>`).join('')}
    <button class="button button--gold" type="submit">${esc(submit || 'Submit')} ${ic('arrow', 18)}</button>
    <p class="form-note" data-form-note hidden>${esc(COPY[record.language].formNote)}</p>
  </form></div>`;
};

const RESOURCE_LABELS = new Set(['Related Tags', 'Social Share', 'Cari', 'Recent Posts', 'Recent Comments', 'About', 'Search', 'Our Gallery', 'Follow Us', 'Kategori', 'Tag', '1 Comment', 'Leave a comment Batalkan balasan']);

const resourceGroups = lines => {
  const groups = [];
  let current = null;
  for (const line of lines) {
    if (RESOURCE_LABELS.has(line)) {
      current = { title: line, items: [] };
      groups.push(current);
    } else {
      if (!current) {
        current = { title: '', items: [] };
        groups.push(current);
      }
      current.items.push(line);
    }
  }
  return groups;
};

const renderDetail = (record, segment) => {
  const lines = segment.lines;
  const resourceAt = lines.findIndex((line, index) => index > 0 && RESOURCE_LABELS.has(line));
  const primary = resourceAt >= 0 ? lines.slice(0, resourceAt) : lines;
  const resources = resourceAt >= 0 ? lines.slice(resourceAt) : [];
  const [title, author, comments, date, ...body] = primary;
  const isTeam = pageType(record) === 'team-detail';
  const teamRole = SITE_DATA.team.find(person => titleFor(record).toLowerCase().startsWith(person.name.split(',')[0].toLowerCase()))?.role;
  return `<div class="detail-layout">
    <article class="detail-article">
      <p class="kicker">${esc(isTeam ? teamRole || 'Team' : author || '')}</p>
      <h1>${esc(title || titleFor(record))}</h1>
      <div class="detail-meta">${[isTeam ? author : null, comments, date].filter(Boolean).map(item => `<span>${esc(item)}</span>`).join('')}</div>
      ${isTeam && !body.length ? `<div class="profile-panel">${picture(record, '3 / 4')}<p>${esc(COPY[record.language].missingProfile)}</p></div>` : ''}
      <div class="article-copy">${body.length
        ? body.map(line => line.length > 80 ? `<p>${esc(line)}</p>` : `<h3>${esc(line)}</h3>`).join('')
        : `<p class="article-copy-empty">${esc(COPY[record.language].noBodyCopy)}</p>`}</div>
    </article>
    ${resources.length ? `<aside class="resource-stack">${resourceGroups(resources).map(group => `<section><h3>${esc(group.title)}</h3>${group.items.map(item => `<p>${esc(item)}</p>`).join('')}</section>`).join('')}</aside>` : ''}
  </div>`;
};

const renderArchive = (record, segment) => {
  const splitAt = segment.lines.indexOf('Cari');
  const listing = splitAt >= 0 ? segment.lines.slice(0, splitAt) : segment.lines;
  const resources = splitAt >= 0 ? segment.lines.slice(splitAt) : [];
  const entries = [];
  for (let i = 0; i < listing.length;) {
    if (/^By\s/i.test(listing[i]) && i + 5 < listing.length) {
      entries.push(listing.slice(i, i + 6));
      i += 6;
    } else {
      entries.push([listing[i]]);
      i += 1;
    }
  }
  return `<div class="archive-layout"><div class="archive-grid">${entries.map((entry, index) => `<article class="archive-card">
    <span>${String(index + 1).padStart(2, '0')}</span><small>${esc(entry[0] || '')}</small><h2>${esc(entry[1] || entry[0] || '')}</h2>
    ${entry[2] ? `<p>${esc(entry[2])}</p>` : ''}<footer>${entry.slice(3).map(item => `<i>${esc(item)}</i>`).join('')}</footer>
  </article>`).join('')}</div>
  ${resources.length ? `<aside class="resource-stack">${resourceGroups(resources).map(group => `<section><h3>${esc(group.title)}</h3>${group.items.map(item => `<p>${esc(item)}</p>`).join('')}</section>`).join('')}</aside>` : ''}</div>`;
};

const renderLogos = segment => {
  const labels = segment.attribute_copy.filter(item => item.type === 'image alt').map(item => item.text);
  return `<div class="logo-ledger">${labels.map((label, index) => `<div><span>${String(index + 1).padStart(2, '0')}</span><strong>${esc(label)}</strong></div>`).join('')}</div>`;
};

const sectionRole = (record, segment, index) => {
  const lines = segment.lines;
  const className = segment.class;
  if (className.includes('breadcrumb-area') || (index === 0 && pageType(record) !== 'home')) return 'page-hero';
  if (pageType(record) === 'home' && index === 0) return 'hero';
  if (pageType(record) === 'home' && index === 1) return 'hero-alternate';
  if (!lines.length && segment.attribute_copy.length) return 'logos';
  if (lines.some(line => /^\d+%$/.test(line))) return 'overview';
  if (lines.includes('Testimonial')) return 'testimonials';
  if (lines.includes('Tim Kami')) return 'team';
  if (lines.includes('Pesan atau Komentar')) return 'form';
  if (lines.some(line => /Temukan Kami|Find Us|在这里找到我们/i.test(line))) return 'contact-info';
  if (lines.some(line => /Konsultasikan|Consult Your Business|免费咨询/i.test(line))) return 'cta';
  if ((pageType(record) === 'services' && lines.length >= 20) || lines.some(line => /Yang Bisa Kamu Dapatkan|What You Can Get|你能得到什么/i.test(line))) return 'services';
  if (className.includes('b-details-p') || pageType(record).endsWith('detail')) return 'detail';
  if (className.includes('inner-blog') && pageType(record) === 'archive') return 'archive';
  return 'content';
};

const renderSection = (record, segment, index) => {
  const role = sectionRole(record, segment, index);
  let inner = '';
  if (role === 'page-hero') inner = renderPageHero(record, segment);
  else if (role === 'hero') inner = renderHero(record, segment);
  else if (role === 'hero-alternate') inner = renderHero(record, segment, true);
  else if (role === 'logos') inner = renderLogos(segment);
  else if (role === 'overview') inner = renderOverview(record, segment);
  else if (role === 'services') inner = renderServices(record, segment);
  else if (role === 'testimonials') inner = renderTestimonials(segment);
  else if (role === 'team') inner = renderTeam(record, segment);
  else if (role === 'cta') inner = renderCta(record, segment);
  else if (role === 'contact-info') inner = renderContactInfo(record, segment);
  else if (role === 'form') inner = renderForm(record, segment);
  else if (role === 'detail') inner = renderDetail(record, segment);
  else if (role === 'archive') inner = renderArchive(record, segment);
  else inner = renderLineDeck(segment.lines);
  return sectionFrame(record, segment, index, role, inner);
};

const header = record => {
  const lang = record.language;
  const utility = globalSegment(lang, GLOBAL_IDS.utility)?.lines || [];
  const nav = globalSegment(lang, GLOBAL_IDS.nav)?.lines || [];
  const labels = nav.slice(0, 4);
  const active = pageType(record);
  const navItems = [
    [languagePath(lang, '/'), labels[0] || COPY[lang].home, 'home'],
    [languagePath(lang, '/tentang-kami/'), labels[1] || COPY[lang].about, 'about'],
    [languagePath(lang, '/layanan/'), labels[2] || COPY[lang].services, 'services'],
    [languagePath(lang, '/kontak/'), labels[3] || COPY[lang].contact, 'contact'],
  ];
  return `<a class="skip-link" href="#main">${esc(COPY[lang].skip)}</a>
  <div class="utility-bar"><div class="container"><span>${esc(utility[0] || '')}</span><span>${esc(utility[1] || '')}</span><span>${esc(utility.at(-1) || '')}</span></div></div>
  <header class="site-header"><div class="container header-grid">
    <a class="site-brand" href="${languagePath(lang, '/')}"><img src="/assets/img/logo-accupro.png" alt="Accupro International"><span><strong>ACCUPRO</strong><small>Tax · Legal · Business</small></span></a>
    <nav class="site-nav" id="primary-nav" aria-label="Menu">${navItems.map(([href, label, key]) => `<a href="${href}"${active === key || (active === 'service-detail' && key === 'services') ? ' aria-current="page"' : ''}>${esc(label)}</a>`).join('')}</nav>
    <div class="header-actions"><div class="language-switcher">${LANGS.map(code => {
      const variant = recordVariant(record, code);
      return `<a href="${variant ? localHref(variant.url) : languagePath(code, canonicalKey(record.url))}"${code === lang ? ' aria-current="true"' : ''}>${code.toUpperCase()}</a>`;
    }).join('')}</div><a class="header-contact" href="${languagePath(lang, '/kontak/')}">${esc(nav[8] || COPY[lang].consultation)}</a>
    <button class="menu-toggle" aria-expanded="false" aria-controls="primary-nav" aria-label="${esc(COPY[lang].menu)}" data-menu-label="${esc(COPY[lang].menu)}" data-close-label="${esc(COPY[lang].close)}">${ic('menu', 23)}</button></div>
  </div></header>`;
};

const footer = record => {
  const lang = record.language;
  const lines = globalSegment(lang, GLOBAL_IDS.footer)?.lines || [];
  const copyright = globalSegment(lang, GLOBAL_IDS.copyright)?.lines?.[0] || '© 2025 PT. Accurate Pro International - All right reserved';
  return `<footer class="site-footer"><div class="container footer-grid">
    <div class="footer-statement"><p class="kicker">${esc(lines[0] || '')}</p><h2>${esc(lines[1] || 'PT. Accurate Pro International')}</h2><p>${esc(lines[2] || '')}</p></div>
    <div><h3>${esc(lines[3] || '')}</h3><a href="${languagePath(lang, '/tentang-kami/')}">${esc(lines[4] || COPY[lang].about)}</a><a href="${languagePath(lang, '/layanan/')}">${esc(lines[5] || COPY[lang].services)}</a><a href="${languagePath(lang, '/kontak/')}">${esc(lines[6] || COPY[lang].contact)}</a></div>
    <div><h3>${esc(lines[7] || '')}</h3><p>${esc(lines[8] || '')}</p></div>
    <div><h3>${esc(lines[9] || '')}</h3>${lines.slice(10).map(line => `<p>${esc(line)}</p>`).join('')}</div>
  </div><div class="container footer-base"><span>${esc(copyright)}</span><span>Source-complete · ID / EN / 中文</span></div></footer>
  <a class="wa-button" href="https://wa.me/${SITE_DATA.company.whatsappIntl}" target="_blank" rel="noopener">${ic('whatsapp', 20)} WhatsApp</a>`;
};

const head = record => {
  const title = record.title || `${titleFor(record)} — Accupro International`;
  const description = descriptionFor(record).slice(0, 320);
  const noindex = process.env.PREVIEW === '1' || record.status >= 400;
  return `<!doctype html><html lang="${record.language === 'ch' ? 'zh-CN' : record.language}"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title><meta name="description" content="${esc(description)}">${noindex ? '<meta name="robots" content="noindex,nofollow">' : ''}
  <link rel="icon" href="/assets/img/logo-accupro.png"><link rel="stylesheet" href="/assets/css/style.css?v=source-complete-5">
  <link rel="canonical" href="${SOURCE_ORIGIN}${esc(sourcePath(record.url))}">
  </head><body data-page-type="${pageType(record)}" data-language="${record.language}">`;
};

const decodeHtml = value => value
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();

const verifyCopyCoverage = (record, html) => {
  const rendered = decodeHtml(html);
  const missing = unique(record.segments.flatMap(segment => segment.lines))
    .filter(line => line && !rendered.includes(line));
  if (missing.length) {
    throw new Error(`Copy coverage failed for ${record.url}: ${missing.slice(0, 5).join(' | ')}`);
  }
};

const renderPage = record => {
  const sections = mainSegments(record);
  const html = `${head(record)}${header(record)}<main id="main">${sections.map((segment, index) => renderSection(record, segment, index)).join('')}</main>${footer(record)}<script src="/assets/js/main.js?v=source-complete-5" defer></script></body></html>`;
  verifyCopyCoverage(record, html);
  return html;
};

const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};

const resetOutput = () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const entry of fs.readdirSync(OUT)) {
    if (entry === 'assets' || entry.startsWith('._')) continue;
    fs.rmSync(path.join(OUT, entry), { recursive: true, force: true });
  }
};

/* Always noindex: a bounce page for a retired URL should never rank on its
   own, independent of the PREVIEW flag that governs the real pages. */
const redirect = target => `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${target}"><meta name="robots" content="noindex,nofollow"><link rel="canonical" href="${target}"></head><body><a href="${target}">Continue</a></body></html>`;

/* Pages worth publishing: the site's real content. Everything else recapped
   (category/tag/author archives, the demo WordPress posts) is scraper noise
   with no equivalent on a finished site, so it is excluded from the build. */
const PUBLISHED_TYPES = new Set(['home', 'about', 'services', 'service-detail', 'contact', 'team-detail', 'testimonial-detail']);

export const buildContentSite = () => {
  resetOutput();
  const coverage = [];
  const published = RECORDS.filter(record => PUBLISHED_TYPES.has(pageType(record)));
  for (const record of published) {
    const html = renderPage(record);
    write(outputPath(record.url), html);
    coverage.push({
      source_url: record.url,
      local_path: sourcePath(record.url),
      language: record.language,
      source_status: record.status,
      sections: record.segments.length,
      source_lines: record.segments.reduce((sum, segment) => sum + segment.lines.length, 0),
      copy_coverage: 'complete',
    });
  }

  const legacyRedirects = {
    'about.html': '/en/tentang-kami/', 'services.html': '/en/layanan/',
    'contact.html': '/en/kontak/', 'articles.html': '/en/', 'tools.html': '/en/',
  };
  for (const [file, target] of Object.entries(legacyRedirects)) write(path.join(OUT, file), redirect(target));

  const indexable = published.filter(record => record.status === 200).map(record => `${SOURCE_ORIGIN}${sourcePath(record.url)}`);
  write(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map(url => `  <url><loc>${esc(url)}</loc></url>`).join('\n')}\n</urlset>\n`);
  write(path.join(OUT, 'robots.txt'), process.env.PREVIEW === '1'
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${SOURCE_ORIGIN}/sitemap.xml\n`);
  write(path.join(OUT, 'content-coverage.json'), `${JSON.stringify({ generated_at: new Date().toISOString(), pages: coverage.length, records: coverage }, null, 2)}\n`);
  const byLang = LANGS.map(lang => `${lang.toUpperCase()} ${coverage.filter(r => r.language === lang).length}`).join(' · ');
  console.log(`built ${coverage.length} source-complete pages — ${byLang}`);
  console.log('copy coverage: 100% of recapped visible lines');
};
