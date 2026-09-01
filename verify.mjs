import fs from 'fs'; import path from 'path'; import { chromium } from 'playwright';
const pages = [];
(function walk(d){ for (const e of fs.readdirSync(d,{withFileTypes:true})) {
  const p = path.join(d,e.name);
  if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html')) pages.push(p);
}})('dist');
pages.sort();

/* --- link integrity (static) --- */
const missing = [];
for (const p of pages) {
  const html = fs.readFileSync(p,'utf8');
  for (const m of html.matchAll(/(?:href|src)="([^"#][^"]*)"/g)) {
    let u = m[1].split('#')[0];
    if (!u || /^(https?:|mailto:|tel:|data:)/.test(u)) continue;
    let t = path.normalize(path.join(path.dirname(p), u));
    if (t.endsWith('/')) t = path.join(t,'index.html');
    if (!fs.existsSync(t)) missing.push(`${p} -> ${u}`);
  }
}
console.log(missing.length ? 'BROKEN LINKS:\n' + [...new Set(missing)].join('\n') : `link check: OK (${pages.length} pages)`);

/* --- render at three widths --- */
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const widths = [{w:390,h:844,n:'mobile'},{w:768,h:1024,n:'tablet'},{w:1440,h:900,n:'desktop'}];
const problems = [];
for (const vp of widths) {
  const page = await b.newPage({viewport:{width:vp.w,height:vp.h}});
  const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0,120)));
  for (const p of pages) {
    await page.goto('file://' + process.cwd() + '/' + p);
    await page.waitForTimeout(90);
    const r = await page.evaluate(() => {
      const de = document.documentElement;
      const out = { hScroll: de.scrollWidth - de.clientWidth, wide: [], small: [] };
      document.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && (r.left < -1 || r.right > window.innerWidth + 1))
          out.wide.push(el.tagName.toLowerCase() + '.' + (el.className||'').toString().split(' ')[0] + ' ' + Math.round(r.right));
      });
      document.querySelectorAll('a.btn,button,.chip,.nav__link,input:not([type=checkbox]):not([type=radio]),select,textarea').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.height > 0 && r.height < 40) out.small.push(el.tagName.toLowerCase() + '.' + (el.className||'').toString().split(' ')[0] + ' h=' + Math.round(r.height));
      });
      return out;
    });
    if (r.hScroll > 1) problems.push(`${vp.n} ${p}: horizontal scroll +${r.hScroll}px | ${[...new Set(r.wide)].slice(0,3).join(', ')}`);
    if (r.small.length) problems.push(`${vp.n} ${p}: tap target <40px — ${[...new Set(r.small)].slice(0,3).join(', ')}`);
  }
  if (errs.length) problems.push(`${vp.n}: JS errors — ${[...new Set(errs)].slice(0,3).join(' | ')}`);
  await page.close();
  console.log(`rendered all ${pages.length} pages @ ${vp.w}px`);
}
await b.close();
console.log(problems.length ? '\nPROBLEMS:\n' + problems.slice(0,25).join('\n') + (problems.length>25?`\n… +${problems.length-25} more`:'') : '\nresponsive check: OK at 390 / 768 / 1440');
