/* Audit layout Accupro.
 *
 * Memeriksa lima hal di sembilan halaman × lima lebar layar:
 *   overflow  halaman bisa digulir menyamping
 *   escape    anak keluar dari kotak induknya
 *   collide   dua elemen setara saling menimpa
 *   tight     jarak antar-elemen di bawah 8px (diukur teks ke teks)
 *   tap       target sentuh di bawah 30px di layar ≤768px
 *
 * Jalankan dengan WordPress lokal hidup:
 *   npm i playwright && npx playwright install chromium
 *   BASE=http://127.0.0.1:8181 node scripts/audit-layout.mjs
 *
 * Keluar dengan status 1 kalau ada temuan, jadi bisa dipakai di CI.
 */
const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:8181';
const PAGES = [
  ['/', 'beranda'],
  ['/layanan/', 'katalog layanan'],
  ['/layanan/pengurusan-pajak-badan/', 'satu layanan'],
  ['/layanan-kategori/tax-reporting/', 'kategori'],
  ['/alat/', 'arsip alat'],
  ['/alat/pph4-2/', 'satu alat'],
  ['/tentang-kami/', 'tentang kami'],
  ['/kontak/', 'kontak'],
  ['/halaman-tidak-ada/', '404'],
];
const VIEWPORTS = [
  [360, 780, 'HP kecil'],
  [414, 896, 'HP'],
  [768, 1024, 'tablet'],
  [1024, 900, 'laptop kecil'],
  [1440, 900, 'desktop'],
];

const AUDIT = () => {
  const out = { overflow: [], collide: [], escape: [], tap: [], tight: [] };
  const vw = document.documentElement.clientWidth;

  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0';
  };
  const label = (el) => {
    const c = (el.className && typeof el.className === 'string') ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
    const t = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 28);
    return el.tagName.toLowerCase() + c + (t ? ` "${t}"` : '');
  };

  /* 1. overflow horizontal halaman */
  if (document.documentElement.scrollWidth > vw + 1) {
    document.querySelectorAll('body *').forEach((el) => {
      if (!visible(el)) return;
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 || r.left < -1) {
        // abaikan yang memang berada dalam wadah bisa digulir
        let p = el.parentElement, scrollable = false;
        while (p && p !== document.body) {
          const o = getComputedStyle(p).overflowX;
          if (o === 'auto' || o === 'scroll') { scrollable = true; break; }
          p = p.parentElement;
        }
        if (!scrollable) out.overflow.push({ el: label(el), left: Math.round(r.left), right: Math.round(r.right) });
      }
    });
  }

  // Padding elemen (atau anak tunggalnya) ikut menjadi jarak yang terlihat.
  const padOf = (el, side) => {
    const own = parseFloat(getComputedStyle(el)['padding' + side]) || 0;
    const kid = el.children.length === 1 ? parseFloat(getComputedStyle(el.children[0])['padding' + side]) || 0 : 0;
    return Math.max(own, kid);
  };

  /* 2. anak keluar dari kotak induknya (horizontal) */
  document.querySelectorAll('.container, .card, .grid > *, .rowcard, .pagehero__content, .hero__content').forEach((box) => {
    if (!visible(box)) return;
    const b = box.getBoundingClientRect();
    if (getComputedStyle(box).overflow !== 'visible') return;
    box.querySelectorAll(':scope > *').forEach((ch) => {
      if (!visible(ch)) return;
      const c = ch.getBoundingClientRect();
      if (c.right > b.right + 2 || c.left < b.left - 2) {
        out.escape.push({ parent: label(box), child: label(ch), over: Math.round(Math.max(c.right - b.right, b.left - c.left)) });
      }
    });
  });

  /* 3. elemen setara yang bertabrakan atau berhimpit (< 4px) */
  const GAP = 4;
  document.querySelectorAll('.grid, .cluster, .stack, .header__bar, .footer__grid, .hero__nav, .utility-bar__row').forEach((wrap) => {
    if (!visible(wrap)) return;
    const kids = [...wrap.children].filter(visible);
    for (let i = 0; i < kids.length; i++) {
      for (let j = i + 1; j < kids.length; j++) {
        const a = kids[i].getBoundingClientRect(), b = kids[j].getBoundingClientRect();
        const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (ox > 1 && oy > 1) {
          out.collide.push({ wrap: label(wrap), a: label(kids[i]), b: label(kids[j]), ox: Math.round(ox), oy: Math.round(oy) });
        } else if (ox > 1 && oy <= 1) {
          const seen = -oy + padOf(kids[i], 'Bottom') + padOf(kids[j], 'Top');
          if (seen < GAP) out.tight.push({ wrap: label(wrap), a: label(kids[i]), b: label(kids[j]), gap: Math.round(seen) });
        } else if (oy > 1 && ox <= 1) {
          const seen = -ox + padOf(kids[i], 'Right') + padOf(kids[j], 'Left');
          if (seen < GAP) out.tight.push({ wrap: label(wrap), a: label(kids[i]), b: label(kids[j]), gap: Math.round(seen) });
        }
      }
    }
  });

  /* 3b. blok bersaudara yang jaraknya terlalu rapat */
  const MIN_GAP = 8;
  document.querySelectorAll('.card--pad, .prose, .pagehero__content, .hero__content, .section > .container, .rowcard__body, .card__body').forEach((box) => {
    if (!visible(box)) return;
    const kids = [...box.children].filter((k) => {
      if (!visible(k)) return false;
      const d = getComputedStyle(k).display;
      return d.startsWith('block') || d === 'flex' || d === 'grid' || d === 'list-item';
    });
    for (let i = 0; i + 1 < kids.length; i++) {
      const a = kids[i].getBoundingClientRect(), b = kids[i + 1].getBoundingClientRect();
      // hanya pasangan yang benar-benar bertumpuk vertikal
      if (b.top < a.bottom - 1) continue;
      // Jarak yang dilihat mata adalah jarak antar-teks, bukan antar-kotak.
      // Kalau elemennya (atau anak tunggalnya) punya padding vertikal, padding
      // itu bagian dari jarak — dua <li> yang kotaknya bersentuhan tapi
      // isinya berpadding 9px terlihat berjarak 18px, dan memang begitu.
      const gap = (b.top - a.bottom) + padOf(kids[i], 'Bottom') + padOf(kids[i + 1], 'Top');
      // Pasangan label: keterangan kecil tepat di bawah judulnya (nama +
      // jabatan, angka + satuan) memang dirapatkan supaya terbaca sebagai satu
      // kesatuan. Yang dianggap terlalu rapat untuk pasangan begini hanya di
      // bawah 4px; sisanya tetap memakai ambang normal.
      const caption = /^h[1-6]$/i.test(kids[i].tagName)
        && (kids[i + 1].classList.contains('tiny') || kids[i + 1].classList.contains('eyebrow'));
      const floor = caption ? 4 : MIN_GAP;
      if (gap < floor) {
        out.tight.push({ box: label(box), a: label(kids[i]), b: label(kids[i + 1]), gap: Math.round(gap) });
      }
    }
  });

  /* 3c. teks menempel tepi kartu */
  document.querySelectorAll('.card--pad').forEach((card) => {
    if (!visible(card)) return;
    const r = card.getBoundingClientRect();
    const pad = parseFloat(getComputedStyle(card).paddingLeft) || 0;
    if (pad < 12) out.tight.push({ box: label(card), a: 'padding kartu', b: '-', gap: Math.round(pad) });
    card.querySelectorAll('h1,h2,h3,h4,p,li,span').forEach((t) => {
      if (!visible(t)) return;
      const c = t.getBoundingClientRect();
      if (c.left < r.left + 2 || c.right > r.right - 2) {
        out.tight.push({ box: label(card), a: label(t), b: 'tepi kartu', gap: Math.round(Math.min(c.left - r.left, r.right - c.right)) });
      }
    });
  });

  /* 4. target sentuh terlalu kecil */
  if (vw <= 768) {
    document.querySelectorAll('a, button, input, select').forEach((el) => {
      if (!visible(el)) return;
      const r = el.getBoundingClientRect();
      // Sebagian target kecil sengaja diperluas lewat ::after berposisi
      // absolut dengan inset negatif — tampilannya tetap kecil, area
      // sentuhnya tidak. getBoundingClientRect() tidak melihat itu, jadi
      // insetnya dihitung sendiri.
      const after = getComputedStyle(el, '::after');
      let grow = 0;
      if (after && after.content !== 'none' && after.position === 'absolute') {
        const t = parseFloat(after.top) || 0, b = parseFloat(after.bottom) || 0;
        if (t < 0 && b < 0) grow = -(t + b);
      }
      const hit = r.height + grow;
      if (hit < 30 && !el.classList.contains('skip') && el.closest('.footer') === null && el.closest('.utility-bar') === null && el.closest('.crumbs') === null) {
        out.tap.push({ el: label(el), h: Math.round(hit) });
      }
    });
  }

  return out;
};

(async () => {
  const browser = await chromium.launch();
  const totals = { overflow: 0, collide: 0, escape: 0, tap: 0, tight: 0 };
  const seen = new Set();

  for (const [w, h, vpName] of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: h },
      deviceScaleFactor: 1,
      // .reveal menganimasikan translateY(28px). Diukur saat animasi berjalan,
      // dua blok bisa terlihat bertabrakan padahal layout-nya benar.
      reducedMotion: 'reduce',
    });
    const page = await ctx.newPage();
    for (const [path, pageName] of PAGES) {
      const res = await page.goto(BASE + path, { waitUntil: 'networkidle' }).catch(() => null);
      if (!res) { console.log(`  !! gagal memuat ${path}`); continue; }
      await page.evaluate(async () => {
        // Gulir sampai bawah lalu kembali: memicu lazy-load gambar dan
        // memastikan tidak ada blok yang tingginya masih 0 saat diukur.
        for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 16)); }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(250);
      const r = await page.evaluate(AUDIT);
      for (const kind of Object.keys(totals)) {
        for (const item of r[kind]) {
          const key = kind + '|' + pageName + '|' + JSON.stringify(item);
          if (seen.has(key)) continue;
          seen.add(key);
          totals[kind]++;
          if (totals[kind] <= 40) {
            console.log(`[${kind}] ${vpName} ${w}px · ${pageName}`);
            console.log(`         ${JSON.stringify(item)}`);
          }
        }
      }
    }
    await ctx.close();
  }
  await browser.close();
  console.log('\n=== RINGKASAN ===');
  for (const [k, v] of Object.entries(totals)) console.log(`  ${k.padEnd(9)} ${v}`);
  process.exit(Object.values(totals).reduce((a, b) => a + b, 0) ? 1 : 0);
})();
