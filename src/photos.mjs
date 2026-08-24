/* ---------------------------------------------------------------------------
   Fallback photography — Pexels CDN.

   Every image slot on this site is a placeholder waiting for real Accupro
   photography. Until that shoot happens, each slot renders a licensed stock
   photo from the Pexels CDN so the pages read as finished rather than empty.

   These are FALLBACKS, not final art. When a real photo arrives, pass
   `src: '<path>'` to slot() and the stock image is bypassed entirely.

   Every ID below was verified twice: it resolves 200 on images.pexels.com,
   and the frame was inspected to confirm the subject matches its category.
   Pexels licence: free for commercial use, no attribution required.
   Do not add an ID here without loading it and looking at it first.
--------------------------------------------------------------------------- */

export const PHOTOS = {
  /* consultant and client across a desk — the core trust shot */
  meeting:       [7876198, 8112152, 36765732, 7642130, 8439694],
  /* legal-flavoured consultation: scales of justice, deeds on the table */
  'legal-consult': [7876154, 8441780],
  /* handing a finished document or folder to a client; handshakes */
  handover:      [7821676, 17682895, 7693144],
  /* tax forms and returns being worked on at a desk */
  'tax-docs':    [6927557, 6927546, 6863510],
  /* archived, filed, binder-shelf paperwork — breadth of a catalogue */
  'filed-docs':  [357514, 34293525, 6620969],
  /* the team at their desks, wide collaborative office scenes */
  'team-work':   [7654133, 6326260, 8204363, 12902858],
  /* single-person business portraits for team cards and avatars */
  portrait:      [37148308, 31869537, 29995581, 28446973, 8278853, 26728094],
  /* laptop, calculator, spreadsheet — stands in for tool screenshots */
  screen:        [16098005, 8296979, 8962447],
  /* office reception, lobby, building interior */
  reception:     [36894415, 36887759, 518244, 19893582],
  /* pen on paper: deeds, contracts, declarations */
  signing:       [8730372, 8815843, 8729723, 11296101],
  /* stamped passport pages, work-permit badges, immigration counters.
     Deliberately no identifiable national passport cover — an Indonesian
     firm's KITAS page showing a Russian or EU passport reads as a mistake. */
  passport:      [4922356, 4922086, 8453017, 12903186, 18687845],
  /* rubber stamp meeting paper — legalisation, endorsement */
  stamp:         [9858904, 6358834],
  /* framed certificate, award, formal recognition */
  certificate:   [8112119, 9858904],
  /* Jakarta skyline — stands in for maps and location bands */
  city:          [15932376, 20643406, 2443735],
  /* branding / identity / trademark work */
  branding:      [7661590]
};

/* Slots that stock photography genuinely cannot fill. These keep the empty
   placeholder on purpose — a stock photo here would be a lie.
     logo → client logos must come from the clients themselves.        */
export const NO_PHOTO = new Set(['logo']);

/* Stable string hash, so a given label always resolves to the same photo.
   Deterministic across builds; no counters, no build-order dependency. */
const hash = s => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

/* Keyword inference — the safety net for any slot that forgets to name its
   category. Order matters: first match wins, so put the specific before the
   generic. Anything that falls through gets `meeting`. */
const KEYWORDS = [
  [/logo/i,                                    'logo'],
  [/passport|visa|kitas|immigration|expatriate/i, 'passport'],
  [/trademark|brand/i,                         'branding'],
  [/certificate|diploma|award/i,               'certificate'],
  [/stamp|deed|notar|legalis/i,                'stamp'],
  [/sign|contract|agreement/i,                 'signing'],
  [/screenshot|calculator|screen|dashboard|coretax|online/i, 'screen'],
  [/map|location|city|office building/i,       'city'],
  [/reception|lobby|building|counter/i,        'reception'],
  [/portrait|headshot/i,                       'portrait'],
  [/filed|archive|binder|catalogue|folder/i,   'filed-docs'],
  [/handing|handover|hand over/i,              'handover'],
  [/team|desks|colleagues|at work/i,           'team-work'],
  [/tax|return|npwp|efin|report|paperwork|document|ledger|financial/i, 'tax-docs'],
  [/client|consult|discussion|meeting/i,       'meeting']
];

export const categoryFor = label => {
  for (const [re, cat] of KEYWORDS) if (re.test(label)) return cat;
  return 'meeting';
};

/* Resolve a Pexels CDN URL for a category, cropped to the slot's own ratio so
   the browser downloads what it displays instead of a wrong-shape original. */
export const photoUrl = (cat, seed, { ratio = '16 / 9', w = 1200 } = {}) => {
  const set = PHOTOS[cat];
  if (!set || !set.length) return '';
  const id = set[hash(seed) % set.length];
  const [rw, rh] = ratio.split('/').map(n => parseFloat(n.trim()));
  const width = Math.min(w, 1920);
  const height = Math.round((width * rh) / rw);
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg`
       + `?auto=compress&cs=tinysrgb&fit=crop&w=${width}&h=${height}`;
};

/* 'min 1400px' → 1400. No hint means a mid-size slot. */
export const widthFromPx = px => {
  const m = /(\d+)/.exec(px || '');
  return m ? Number(m[1]) : 1200;
};

/* One place to decide whether a slot gets a photo at all. `cat` may be an
   explicit category, or omitted to infer from the label. */
export const resolvePhoto = (label, { cat, ratio, px, seed } = {}) => {
  const c = cat || categoryFor(label);
  if (NO_PHOTO.has(c)) return '';
  return photoUrl(c, seed || label, { ratio, w: widthFromPx(px) });
};
