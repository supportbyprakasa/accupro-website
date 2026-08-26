/* Accupro International — tool calculators.
   Loaded only on tools.html's detail pages (tools/<slug>.html). Nothing here
   ever leaves the browser: no fetch, no analytics beacon — results and
   history live in localStorage on the visitor's own device.

   IMPORTANT — accuracy: the five tax calculators (PPH_BADAN, PPH21_TER,
   PPH21_ANNUAL, PPH23, PPH4_2) encode rates and brackets from UU HPP,
   PP 55/2022 and PMK 168/2023 as best understood at the time this was
   written. The PPh 21 TER bracket tables in particular run to 40+ rows per
   category and were reconstructed from memory, not transcribed from the
   published PMK 168/2023 lampiran — verify every bracket against the
   official gazette before relying on this for real payroll or filing
   decisions. The four "Accupro-only" simulators use placeholder business
   figures (see TOOL_CONFIG, injected per-page from data/site.json) that are
   clearly not real — replace them in data/site.json, not here. */
(function () {
  'use strict';

  /* ---- number formatting -------------------------------------------- */
  var idr = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
  function fmtRp(n) { return 'Rp ' + idr.format(Math.round(n || 0)); }
  function fmtPct(n) { return (Math.round(n * 1000) / 10) + '%'; }
  function parseNum(v) {
    if (typeof v !== 'string') return Number(v) || 0;
    var cleaned = v.replace(/[^\d]/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
  }
  /* Live-format a Rp input as the user types: "50000000" -> "50.000.000". */
  function wireRupiahInput(input) {
    input.addEventListener('input', function () {
      var digits = input.value.replace(/[^\d]/g, '');
      input.value = digits ? idr.format(parseInt(digits, 10)) : '';
    });
  }

  /* ---- PPh Badan (corporate income tax) ------------------------------
     Standard 22%, 19% for a listed company with >=40% public float
     (Pasal 17 ayat 2b), 0.5% final on gross turnover for MSMEs with
     turnover <= Rp 4.8B (PP 55/2022), and the Article 31E 50% discount on
     the Rp 4.8B-equivalent portion of taxable income for turnover between
     Rp 4.8B and Rp 50B. */
  function calcPphBadan(f) {
    var turnover = parseNum(f.turnover.value);
    var taxableIncome = parseNum(f.taxableIncome.value);
    var type = f.taxpayerType.value;

    if (type === 'msme') {
      var msmeTax = turnover * 0.005;
      return {
        headline: fmtRp(msmeTax),
        rows: [
          ['Tax base', fmtRp(turnover) + ' (gross turnover)'],
          ['Applicable rate', '0.5% — final tax, PP 55/2022'],
          ['Facility applied', 'MSME final tax regime']
        ],
        note: 'MSME final tax is calculated on gross turnover, not taxable income — the taxable income field above is not used for this option.'
      };
    }

    var baseRate = type === 'listed' ? 0.19 : 0.22;
    if (turnover > 50000000000) {
      var tax = taxableIncome * baseRate;
      return {
        headline: fmtRp(tax),
        rows: [
          ['Tax base', fmtRp(taxableIncome) + ' (taxable income)'],
          ['Applicable rate', fmtPct(baseRate)],
          ['Facility applied', 'None — turnover above Rp 50 billion']
        ]
      };
    }
    var eligibleRatio = Math.min(1, 4800000000 / (turnover || 1));
    var eligiblePortion = taxableIncome * eligibleRatio;
    var restPortion = taxableIncome - eligiblePortion;
    var totalTax = eligiblePortion * (baseRate * 0.5) + restPortion * baseRate;
    return {
      headline: fmtRp(totalTax),
      rows: [
        ['Tax base', fmtRp(taxableIncome) + ' (taxable income)'],
        ['Facility portion (50% off)', fmtRp(eligiblePortion)],
        ['Full-rate portion', fmtRp(restPortion)],
        ['Applicable rate', fmtPct(baseRate) + ' standard, ' + fmtPct(baseRate * 0.5) + ' on the facility portion'],
        ['Facility applied', 'Article 31E']
      ]
    };
  }

  /* ---- PPh 21 TER (monthly withholding, PMK 168/2023) -----------------
     TER replaced the old "net income x progressive rate" monthly
     withholding method. The flat effective rate below already accounts for
     PTKP, so it applies straight to gross monthly income. */
  var TER_CATEGORY = { 'TK/0': 'A', 'TK/1': 'A', 'K/0': 'A', 'TK/2': 'B', 'TK/3': 'B', 'K/1': 'B', 'K/2': 'B', 'K/3': 'C' };
  var TER_TABLE = {
    A: [[5400000, 0], [5650000, 0.0025], [5950000, 0.005], [6300000, 0.0075], [6750000, 0.01], [7500000, 0.0125], [8550000, 0.015], [9650000, 0.0175], [10050000, 0.02], [10350000, 0.0225], [10700000, 0.025], [11050000, 0.03], [11600000, 0.035], [12500000, 0.04], [13750000, 0.05], [15100000, 0.06], [16950000, 0.07], [19750000, 0.08], [24150000, 0.09], [26450000, 0.10], [28000000, 0.11], [30050000, 0.12], [32400000, 0.13], [35400000, 0.14], [39100000, 0.15], [43850000, 0.16], [47800000, 0.17], [51400000, 0.18], [56300000, 0.19], [62200000, 0.20], [68600000, 0.21], [77500000, 0.22], [89000000, 0.23], [103000000, 0.24], [125000000, 0.25], [157000000, 0.26], [206000000, 0.27], [337000000, 0.28], [454000000, 0.29], [550000000, 0.30], [695000000, 0.31], [910000000, 0.32], [1400000000, 0.33], [Infinity, 0.34]],
    B: [[6200000, 0], [6500000, 0.0025], [6850000, 0.005], [7300000, 0.0075], [9200000, 0.01], [10750000, 0.015], [11250000, 0.02], [11600000, 0.025], [12600000, 0.03], [13600000, 0.04], [14950000, 0.05], [16400000, 0.06], [18450000, 0.07], [21850000, 0.08], [26000000, 0.09], [27700000, 0.10], [29350000, 0.11], [31450000, 0.12], [33950000, 0.13], [37100000, 0.14], [41100000, 0.15], [45800000, 0.16], [49500000, 0.17], [53800000, 0.18], [58500000, 0.19], [64000000, 0.20], [71000000, 0.21], [80000000, 0.22], [93000000, 0.23], [109000000, 0.24], [129000000, 0.25], [163000000, 0.26], [211000000, 0.27], [374000000, 0.28], [459000000, 0.29], [555000000, 0.30], [704000000, 0.31], [957000000, 0.32], [1405000000, 0.33], [Infinity, 0.34]],
    C: [[6600000, 0], [6950000, 0.0025], [7350000, 0.005], [7800000, 0.0075], [8850000, 0.01], [10000000, 0.0125], [11050000, 0.015], [12250000, 0.0175], [13750000, 0.02], [14200000, 0.025], [15050000, 0.03], [16680000, 0.04], [18000000, 0.05], [19600000, 0.06], [21800000, 0.07], [26000000, 0.08], [28100000, 0.09], [30100000, 0.10], [32000000, 0.11], [34400000, 0.12], [37500000, 0.13], [40950000, 0.14], [45050000, 0.15], [49950000, 0.16], [53950000, 0.17], [58650000, 0.18], [64000000, 0.19], [69500000, 0.20], [79000000, 0.21], [88000000, 0.22], [101000000, 0.23], [116000000, 0.24], [140000000, 0.25], [176000000, 0.26], [230000000, 0.27], [400000000, 0.28], [475000000, 0.29], [570000000, 0.30], [720000000, 0.31], [970000000, 0.32], [1419000000, 0.33], [Infinity, 0.34]]
  };
  function terRate(category, monthlyGross) {
    var table = TER_TABLE[category];
    for (var i = 0; i < table.length; i++) if (monthlyGross <= table[i][0]) return table[i][1];
    return table[table.length - 1][1];
  }
  function calcPph21Ter(f) {
    var status = f.ptkpStatus.value;
    var gross = parseNum(f.grossMonthly.value);
    var category = TER_CATEGORY[status];
    var rate = terRate(category, gross);
    var tax = gross * rate;
    return {
      headline: fmtRp(tax),
      rows: [
        ['Gross monthly income', fmtRp(gross)],
        ['PTKP status', status],
        ['TER category', category],
        ['Effective rate', fmtPct(rate)]
      ],
      note: 'TER already accounts for PTKP — this is the full monthly withholding, no further PTKP deduction needed.'
    };
  }

  /* ---- PPh 21 annual/final period (progressive, UU HPP) --------------
     Used for the annual reconciliation (Masa Desember) rather than a
     regular month: gross income less biaya jabatan and PTKP, taxed at the
     progressive brackets. */
  var PTKP = { 'TK/0': 54000000, 'TK/1': 58500000, 'TK/2': 63000000, 'TK/3': 67500000, 'K/0': 58500000, 'K/1': 63000000, 'K/2': 67500000, 'K/3': 72000000 };
  var PROGRESSIVE = [[60000000, 0.05], [250000000, 0.15], [500000000, 0.25], [5000000000, 0.30], [Infinity, 0.35]];
  function progressiveTax(base) {
    var remaining = base, lastCap = 0, tax = 0;
    for (var i = 0; i < PROGRESSIVE.length && remaining > 0; i++) {
      var bandCap = PROGRESSIVE[i][0], rate = PROGRESSIVE[i][1];
      var bandSize = Math.min(remaining, bandCap - lastCap);
      tax += bandSize * rate;
      remaining -= bandSize;
      lastCap = bandCap;
    }
    return tax;
  }
  function calcPph21Annual(f) {
    var status = f.ptkpStatus.value;
    var grossAnnual = parseNum(f.grossAnnual.value);
    var biayaJabatan = Math.min(grossAnnual * 0.05, 6000000);
    var ptkp = PTKP[status];
    var netIncome = Math.max(0, grossAnnual - biayaJabatan - ptkp);
    var tax = progressiveTax(netIncome);
    return {
      headline: fmtRp(tax),
      rows: [
        ['Gross annual income', fmtRp(grossAnnual)],
        ['Biaya jabatan (5%, capped Rp 6,000,000/yr)', fmtRp(biayaJabatan)],
        ['PTKP (' + status + ')', fmtRp(ptkp)],
        ['Net taxable income', fmtRp(netIncome)]
      ],
      note: 'Progressive rates: 5% to Rp 60M, 15% to Rp 250M, 25% to Rp 500M, 30% to Rp 5B, 35% above.'
    };
  }

  /* ---- PPh 23 -----------------------------------------------------------
     15% on dividends/interest/royalties/prizes; 2% on rent of movable
     assets and service fees. Non-NPWP withholding is doubled
     (Pasal 23 ayat (1a), UU PPh). */
  var PPH23_TYPES = {
    dividend: { label: 'Dividends', rate: 0.15 },
    interest: { label: 'Interest / loan guarantee reward', rate: 0.15 },
    royalty: { label: 'Royalties', rate: 0.15 },
    prize: { label: 'Prizes and awards (not via PPh 21)', rate: 0.15 },
    rent: { label: 'Rent of assets (other than land/buildings)', rate: 0.02 },
    service: { label: 'Technical, management or consulting fees', rate: 0.02 },
    otherService: { label: 'Other services (PMK 141/2015 list)', rate: 0.02 }
  };
  function calcPph23(f) {
    var type = f.incomeType.value;
    var amount = parseNum(f.amount.value);
    var hasNpwp = f.hasNpwp.value === 'yes';
    var def = PPH23_TYPES[type];
    var rate = def.rate * (hasNpwp ? 1 : 2);
    var tax = amount * rate;
    return {
      headline: fmtRp(tax),
      rows: [
        ['Income type', def.label],
        ['Gross amount', fmtRp(amount)],
        ['Base rate', fmtPct(def.rate)],
        ['NPWP status', hasNpwp ? 'Registered' : 'Not registered — rate doubled'],
        ['Applied rate', fmtPct(rate)]
      ]
    };
  }

  /* ---- PPh Pasal 4(2) — final tax ------------------------------------- */
  var PPH4_2_TYPES = {
    rentLandBuilding: { label: 'Rent of land / buildings', rate: 0.10 },
    saleLandBuilding: { label: 'Sale/transfer of land or buildings (general)', rate: 0.025 },
    saleLandBuildingRSS: { label: 'Sale/transfer — simple housing (RSS/RS) by a developer', rate: 0.01 },
    constructionExecutionQualified: { label: 'Construction execution — certified/qualified contractor', rate: 0.0265 },
    constructionExecutionSmall: { label: 'Construction execution — small qualified contractor', rate: 0.0175 },
    constructionExecutionUnqualified: { label: 'Construction execution — no certification', rate: 0.04 },
    constructionSupervisionQualified: { label: 'Construction planning/supervision — qualified', rate: 0.035 },
    constructionSupervisionUnqualified: { label: 'Construction planning/supervision — unqualified', rate: 0.06 }
  };
  function calcPph4_2(f) {
    var type = f.transactionType.value;
    var amount = parseNum(f.amount.value);
    var def = PPH4_2_TYPES[type];
    var tax = amount * def.rate;
    return {
      headline: fmtRp(tax),
      rows: [
        ['Transaction type', def.label],
        ['Gross amount', fmtRp(amount)],
        ['Final rate', fmtPct(def.rate)]
      ],
      note: 'This is a final tax (PPh Final) — it is not creditable against annual PPh Badan/21 like PPh 23 is.'
    };
  }

  /* ---- Company Setup Cost Simulator (placeholder business figures) ---- */
  function calcCompanySetup(f, cfg) {
    var entity = f.entityType.value;
    var capital = parseNum(f.paidUpCapital.value);
    var domicile = f.domicile.value;
    var notary = cfg.notaryFee[entity] || 0;
    var oss = cfg.ossFee || 0;
    var office = cfg.virtualOffice[domicile] || 0;
    var total = notary + oss + office;
    var timeline = cfg.timelineDays[entity] || cfg.timelineDays.default;
    return {
      headline: fmtRp(total),
      rows: [
        ['Entity type', entity],
        ['Notary & deed of establishment', fmtRp(notary)],
        ['NIB / OSS processing', fmtRp(oss)],
        ['Registered address (1 year, ' + domicile + ')', fmtRp(office)],
        ['Estimated timeline', timeline + ' working days']
      ],
      note: 'Paid-up capital (' + fmtRp(capital) + ') is not itself a cost — it is capital you retain in the company.'
    };
  }

  /* ---- KITAS Requirements & Timeline Checker --------------------------- */
  var KITAS_DOCS = {
    work: ['RPTKA approval', 'Work permit notification', 'Sponsor letter from the company', 'Passport valid 18+ months', 'DPKK payment proof'],
    investor: ['Shareholder register showing paid-up capital', "Company's deed of establishment", 'Passport valid 18+ months', 'Proof of paid-up capital matching shareholding'],
    family: ["Sponsor's valid KITAS", 'Marriage certificate (legalised if issued abroad)', "Children's birth certificates, if applicable", 'Passports valid 18+ months for each family member']
  };
  function calcKitas(f, cfg) {
    var type = f.kitasType.value;
    var docs = KITAS_DOCS[type];
    var timeline = cfg.timelineWeeks[type] || cfg.timelineWeeks.default;
    return {
      headline: timeline + ' weeks',
      rows: docs.map(function (d, i) { return ['Document ' + (i + 1), d]; }),
      note: 'Estimated timeline from application to a printed KITAS card, assuming documents are complete on first submission.'
    };
  }

  /* ---- Trademark Filing Cost Simulator ---------------------------------- */
  function calcTrademarkCost(f, cfg) {
    var applicant = f.applicantType.value;
    var classes = Math.max(1, parseNum(f.numClasses.value) || 1);
    var officialFeePerClass = cfg.officialFeePerClass[applicant] || 0;
    var serviceFee = cfg.serviceFee || 0;
    var total = officialFeePerClass * classes + serviceFee;
    return {
      headline: fmtRp(total),
      rows: [
        ['Applicant type', applicant],
        ['Classes filed', String(classes)],
        ['DJKI official fee (per class)', fmtRp(officialFeePerClass)],
        ['Official fees total', fmtRp(officialFeePerClass * classes)],
        ['Accupro service fee', fmtRp(serviceFee)]
      ],
      note: 'DJKI fees are set by regulation and may change — this uses the last figure Accupro confirmed.'
    };
  }

  /* ---- Monthly Tax Obligation Checker ----------------------------------- */
  function calcMonthlyObligations(f) {
    var entity = f.entityType.value;
    var isPkp = f.pkpStatus.value === 'yes';
    var items = [];
    if (entity === 'company') {
      items.push('PPh 25 — monthly instalment, due the 15th');
      items.push('PPh 21 — if the company has employees, due the 10th (deposit) / 20th (report)');
      items.push('PPh 23 — if any applicable transactions occurred, due the 10th (deposit) / 20th (report)');
    } else {
      items.push('PPh 21 — if self-employed with no employer withholding, due the 15th');
    }
    if (isPkp) items.push('PPN — monthly VAT return, due the end of the following month');
    return {
      headline: items.length + ' obligation' + (items.length === 1 ? '' : 's') + ' this month',
      rows: items.map(function (t, i) { return ['Obligation ' + (i + 1), t]; }),
      note: 'This assumes standard registration status — ask us if any of these have been formally waived or deferred for your entity.'
    };
  }

  var CALCULATORS = {
    'pph-badan': calcPphBadan,
    'pph21-ter': calcPph21Ter,
    'pph21-masa': calcPph21Annual,
    'pph23': calcPph23,
    'pph4-2': calcPph4_2,
    'company-setup-cost': calcCompanySetup,
    'kitas-requirements': calcKitas,
    'trademark-cost': calcTrademarkCost,
    'monthly-obligations': calcMonthlyObligations
  };

  /* ---- history (localStorage) ------------------------------------------- */
  function historyKeyFor(slug) { return 'accupro-calc-' + slug; }
  function loadHistory(slug) {
    try { return JSON.parse(localStorage.getItem(historyKeyFor(slug)) || '[]'); }
    catch (e) { return []; }
  }
  function saveHistory(slug, entries) {
    try { localStorage.setItem(historyKeyFor(slug), JSON.stringify(entries.slice(0, 10))); }
    catch (e) { /* storage unavailable (private mode, quota) — history just won't persist */ }
  }
  function renderHistory(slug, listEl) {
    var entries = loadHistory(slug);
    if (!entries.length) {
      listEl.innerHTML = '<li class="tiny" style="color:var(--faint)">No calculations yet — your history stays on this device.</li>';
      return;
    }
    listEl.innerHTML = entries.map(function (e) {
      return '<li style="padding:8px 0;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:10px">' +
        '<span class="small">' + e.summary + '</span>' +
        '<span class="tiny" style="white-space:nowrap;color:var(--faint)">' + e.headline + '</span></li>';
    }).join('');
  }

  /* ---- form wiring -------------------------------------------------------- */
  document.querySelectorAll('.field__input[inputmode="numeric"]').forEach(wireRupiahInput);

  var form = document.getElementById('tool-form');
  if (!form) return;
  var slug = form.dataset.tool;
  var calc = CALCULATORS[slug];
  if (!calc) return;

  var cfg = window.TOOL_CONFIG || {};
  var resultHeadline = document.getElementById('result-headline');
  var resultTable = document.getElementById('result-table');
  var resultNote = document.getElementById('result-note');
  var historyList = document.getElementById('calc-history');
  var lastResult = null;

  renderHistory(slug, historyList);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var result;
    try {
      result = calc(form.elements, cfg);
    } catch (err) {
      resultHeadline.textContent = 'Check the inputs above';
      resultTable.querySelector('tbody') && (resultTable.innerHTML = '');
      resultNote.textContent = 'Fill in every field, then calculate again.';
      return;
    }
    lastResult = result;
    resultHeadline.textContent = result.headline;
    resultTable.innerHTML = '<tbody>' + result.rows.map(function (r) {
      return '<tr><th scope="row">' + r[0] + '</th><td>' + r[1] + '</td></tr>';
    }).join('') + '</tbody>';
    resultNote.textContent = result.note || '';

    var entries = loadHistory(slug);
    entries.unshift({
      when: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      summary: result.rows[0] ? result.rows[0][1] : '',
      headline: result.headline
    });
    saveHistory(slug, entries);
    renderHistory(slug, historyList);
  });

  var copyBtn = document.getElementById('btn-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      if (!lastResult) return;
      var text = lastResult.headline + '\n' + lastResult.rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () {
          var original = copyBtn.textContent;
          copyBtn.textContent = 'Copied';
          setTimeout(function () { copyBtn.textContent = original; }, 1500);
        });
      }
    });
  }

  var clearBtn = document.getElementById('btn-clear-history');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      saveHistory(slug, []);
      renderHistory(slug, historyList);
    });
  }
})();
