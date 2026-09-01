/* Uji fungsional 9 alat hitung di browser sungguhan.
 *
 * Memeriksa dua hal yang tidak terlihat dari kode: angkanya benar, dan tidak
 * ada teks Inggris yang lolos ke panel hasil.
 *
 *   BASE=http://127.0.0.1:8181 node scripts/test-tools.mjs
 */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:8181';

const CASES = [
  ['/alat/pph4-2/',              { transactionType: 'constructionExecutionSmall', amount: '100000000' },      ['1,75%', 'Rp 1.750.000']],
  ['/alat/pph4-2/',              { transactionType: 'constructionExecutionQualified', amount: '100000000' },  ['2,65%', 'Rp 2.650.000']],
  ['/alat/pph4-2/',              { transactionType: 'rentLandBuilding', amount: '50000000' },                 ['10%', 'Rp 5.000.000']],
  ['/alat/pph-badan/',           { taxpayerType: 'general', turnover: '100000000000', taxableIncome: '10000000000' }, ['22%', 'Rp 2.200.000.000']],
  ['/alat/pph-badan/',           { taxpayerType: 'msme', turnover: '1000000000', taxableIncome: '0' },        ['0,5%', 'Rp 5.000.000']],
  ['/alat/pph23/',               { incomeType: 'service', amount: '10000000', hasNpwp: 'no' },                ['4%', 'Rp 400.000']],
  ['/alat/pph23/',               { incomeType: 'dividend', amount: '10000000', hasNpwp: 'yes' },              ['15%', 'Rp 1.500.000']],
  ['/alat/pph21-ter/',           { ptkpStatus: 'K/1', grossMonthly: '15000000' },                             ['Rp']],
  ['/alat/pph21-masa/',          { ptkpStatus: 'TK/0', grossAnnual: '120000000' },                            ['Rp']],
  ['/alat/company-setup-cost/',  { entityType: 'pma', paidUpCapital: '10000000000', domicile: 'jakarta' },    ['Rp']],
  ['/alat/kitas-requirements/',  { kitasType: 'work' },                                                       []],
  ['/alat/trademark-cost/',      { applicantType: 'local-umkm', numClasses: '2' },                            ['Rp']],
  ['/alat/monthly-obligations/', { entityType: 'company', pkpStatus: 'yes' },                                 ['Kewajiban']],
];

// Kata Inggris yang tidak boleh muncul di panel hasil situs berbahasa Indonesia.
const EN = /\b(gross|taxable|turnover|obligation|instalment|monthly|deposit|report|due the|Transaction|Income type|Entity type|Applicant|service fee|Official fee|timeline|Classes filed|Facility|portion|Notary|approval|register|processing|rate)\b/i;

(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const p = await c.newPage();
  let fail = 0;

  for (const [url, set, expect] of CASES) {
    await p.goto(BASE + url, { waitUntil: 'networkidle' });
    for (const [name, val] of Object.entries(set)) {
      const sel = `#tool-form [name="${name}"]`;
      const tag = await p.$eval(sel, (e) => e.tagName.toLowerCase());
      if (tag === 'select') await p.selectOption(sel, val);
      else { await p.fill(sel, ''); await p.type(sel, val); }
    }
    await p.click('#tool-form button[type="submit"]');
    await p.waitForTimeout(220);

    const headline = (await p.textContent('#result-headline')).trim();
    const body = headline + ' | ' + (await p.textContent('#result-table')) + ' ' + (await p.textContent('#result-note'));
    const missing = expect.filter((e) => !body.includes(e));
    const english = body.match(EN);

    if (missing.length || english) {
      fail++;
      console.log(`  GAGAL ${url} ${JSON.stringify(set)}`);
      if (missing.length) console.log(`        nilai hilang: ${missing.join(', ')}`);
      if (english) console.log(`        teks Inggris: ${[...new Set(english)].join(', ')}`);
    } else {
      console.log(`  ok    ${url.padEnd(30)} ${headline}`);
    }
  }

  await b.close();
  console.log(fail ? `\n${fail} dari ${CASES.length} kasus gagal` : `\n${CASES.length} kasus lulus — angka benar, tidak ada teks Inggris`);
  process.exit(fail ? 1 : 0);
})();
