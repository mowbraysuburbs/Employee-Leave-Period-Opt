// Run with the dev server up (npm run dev), then: npm run test:e2e
// Start / End: either can move on its own; the other follows (same number of
// days) and nothing goes past the last date (31 Jan of the year after next).
// The Overview's Custom card picks whole months instead (From / To).
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:5173/';
const res = []; const check = (n, ok, x = '') => res.push((ok ? 'PASS ' : 'FAIL ') + n + (x ? '  [' + x + ']' : ''));

const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return iso(d) };
const now = new Date();
const LAST = `${now.getFullYear() + 2}-01-31`;
// A 60-day window starting about a month from now, and a later start past its end.
const A = addDays(iso(now), 30), B = addDays(A, 60), LATER = addDays(A, 150);

(async () => {
  const b = await chromium.launch();
  const errors = [];
  const d = await b.newPage({ viewport: { width: 1280, height: 800 } });
  d.on('pageerror', e => errors.push(e.message));
  await d.addInitScript(() => { localStorage.setItem('stretchmyleave.welcomeSeen', '1'); localStorage.setItem('stretchmyleave.calendarTourSeen', '1'); localStorage.setItem('stretchmyleave.railCollapsed', 'false') });
  await d.goto(BASE); await d.getByRole('button', { name: 'Calendar', exact: true }).click();
  const from = d.locator('#rail-period-from'), to = d.locator('#rail-period-to');
  await to.fill(B); await from.fill(A);
  await from.fill(LATER);
  check('desktop: Start past End moves End by the same days', (await to.inputValue()) === addDays(B, 150), (await from.inputValue()) + ' → ' + (await to.inputValue()));
  await to.fill(addDays(LATER, -30));
  check('desktop: End before Start moves Start back by the same days', (await from.inputValue()) === addDays(LATER, -60 - 30) || (await from.inputValue()) < (await to.inputValue()), (await from.inputValue()) + ' → ' + (await to.inputValue()));
  await from.fill(addDays(LAST, -10));
  check('desktop: End stops at the last date', (await to.inputValue()) === LAST, await to.inputValue());

  // The Overview's Custom card uses whole months (From / To), the other follows so From ≤ To.
  await d.getByRole('button', { name: 'Overview' }).click();
  const nav = d.getByRole('navigation', { name: 'Leave periods' });
  const s = d.locator('#overview-from-month'), e = d.locator('#overview-to-month');
  await nav.getByRole('button', { name: /^School holidays/ }).click();
  const months = await s.locator('option:not([disabled])').evaluateAll(os => os.map(o => o.value));
  const end0 = await e.inputValue();
  const later = months.find(m => m > end0) ?? months.at(-1);
  await s.selectOption(later);
  check('Overview: From past To moves To along', (await e.inputValue()) === later, (await s.inputValue()) + '–' + (await e.inputValue()));
  check('Overview: the plan becomes Custom', /Custom dates/.test(await d.getByRole('article').locator('h3').innerText()));
  check('Overview: Custom months stop at the last date\'s month', months.at(-1) === LAST.slice(0, 7), months.at(-1));

  const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
  p.on('pageerror', e => errors.push(e.message));
  await p.addInitScript(() => localStorage.setItem('stretchmyleave.welcomeSeen', '1'));
  await p.goto(BASE); await p.getByRole('navigation', { name: 'Pages' }).getByRole('button', { name: 'Calendar' }).click();
  await p.getByRole('button', { name: /^Filters/ }).click(); await p.getByRole('button', { name: 'More…' }).click();
  const pf = p.locator('#mobile-period-from'), pt = p.locator('#mobile-period-to');
  await pt.fill(B); await pf.fill(A); await pf.fill(LATER);
  check('phone: Start past End moves End by the same days', (await pt.inputValue()) === addDays(B, 150), await pt.inputValue());
  check('no errors', errors.length === 0, errors.join(' | '));
  console.log(res.join('\n')); if (res.some(r => r.startsWith('FAIL'))) process.exitCode = 1;
  await b.close();
})();
