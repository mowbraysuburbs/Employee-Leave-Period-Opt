// Run with the dev server up (npm run dev), then: npm run test:e2e
// Calendar "Leave fills a gap": only breaks where the leave sits between two
// free stretches (a weekend or holiday on both sides) stay coloured.
// December 2026: 2 days → Reconciliation (starts 12–14, 16–17); 4 days → three breaks.
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:5173/';
const res = []; const check = (n, ok, x = '') => res.push((ok ? 'PASS ' : 'FAIL ') + n + (x ? '  [' + x + ']' : ''));

(async () => {
  const b = await chromium.launch();
  const errors = [];
  const d = await b.newPage({ viewport: { width: 1280, height: 800 } });
  d.on('pageerror', e => errors.push(e.message));
  await d.addInitScript(() => { localStorage.setItem('stretchmyleave.welcomeSeen', '1'); localStorage.setItem('stretchmyleave.calendarTourSeen', '1'); localStorage.setItem('stretchmyleave.railCollapsed', 'false') });
  await d.goto(BASE); await d.getByRole('button', { name: 'Calendar', exact: true }).click();
  await d.locator('#rail-period-to').fill('2026-12-31'); await d.locator('#rail-period-from').fill('2026-12-01');
  // Nothing narrowing but the period: the holidays filter off, so every day is coloured.
  await d.getByRole('button', { name: /^Public holidays:/ }).first().click();
  check('Public holidays filter says "All", not "All holidays"', /Public holidays:\s*All\s*$/.test(await d.getByRole('button', { name: /^Public holidays:/ }).first().innerText()), await d.getByRole('button', { name: /^Public holidays:/ }).first().innerText());
  await d.getByRole('button', { name: 'Clear all' }).click(); await d.getByRole('button', { name: 'Done' }).click();
  await d.getByRole('radio', { name: '2 leave days', exact: true }).first().click();
  const coloured = () => d.locator('button[data-date^="2026-12"]').evaluateAll(els => els.filter(e => { const st = e.getAttribute('style') || ''; return !e.disabled && !st.includes('slate-100') && !st.includes('transparent') }).map(e => e.dataset.date.slice(8)));
  const off = await coloured();
  const gap = d.getByRole('button', { name: /^Leave fills a gap/ });
  await gap.click();
  const on2 = await coloured();
  check('2 days, filter on: only the Reconciliation breaks', on2.join(',') === '12,13,14,16,17', on2.join(','));
  check('2 days, filter off: many more days coloured', off.length > on2.length + 5, off.length + ' vs ' + on2.length);
  check('the filter counts as an active filter', /Clear filters \(\d\)/.test(await d.getByRole('button', { name: /Clear filters/ }).innerText()));
  await d.getByRole('radio', { name: '4 leave days', exact: true }).first().click();
  const on4 = await coloured();
  check('4 days: the three December breaks', on4.join(',') === '12,13,14,19,20,21,25,26,27,28', on4.join(','));
  await d.getByRole('button', { name: /Clear filters/ }).click();
  check('Clear filters turns it off', (await gap.getAttribute('aria-pressed')) === 'false');

  // Phone: the same switch in More filters.
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
  p.on('pageerror', e => errors.push(e.message));
  await p.addInitScript(() => localStorage.setItem('stretchmyleave.welcomeSeen', '1'));
  await p.goto(BASE); await p.getByRole('navigation', { name: 'Pages' }).getByRole('button', { name: 'Calendar' }).click();
  await p.getByRole('button', { name: /^Filters/ }).click(); await p.getByRole('button', { name: 'More…' }).click();
  const pg = p.getByRole('button', { name: /Leave fills a gap/ });
  await pg.click();
  check('phone: Leave fills a gap in More filters', (await pg.getAttribute('aria-pressed')) === 'true');

  check('no page errors', errors.length === 0, errors.join(' | '));
  console.log(res.join('\n'));
  await b.close();
})();
