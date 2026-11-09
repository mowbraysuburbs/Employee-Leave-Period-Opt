// Run with the dev server up (npm run dev), then: npm run test:e2e
// Calendar Dates: From / To months (like the Overview's Custom card). From
// starts on the 1st (this month: today), To ends on the month's last day; the
// other moves along so From ≤ To, and nothing goes past January of the year after next.
// The Overview's Custom card picks whole months too (From / To).
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:5173/';
const res = []; const check = (n, ok, x = '') => res.push((ok ? 'PASS ' : 'FAIL ') + n + (x ? '  [' + x + ']' : ''));

const now = new Date();
const month = n => { const d = new Date(now.getFullYear(), now.getMonth() + n, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` };
const LAST = `${now.getFullYear() + 2}-01`;
const NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const title = m => `${NAMES[Number(m.slice(5)) - 1]} ${m.slice(0, 4)}`;

(async () => {
  const b = await chromium.launch();
  const errors = [];
  const d = await b.newPage({ viewport: { width: 1280, height: 800 } });
  d.on('pageerror', e => errors.push(e.message));
  await d.addInitScript(() => { localStorage.setItem('stretchmyleave.welcomeSeen', '1'); localStorage.setItem('stretchmyleave.calendarTourSeen', '1'); localStorage.setItem('stretchmyleave.railCollapsed', 'false') });
  await d.goto(BASE); await d.getByRole('button', { name: 'Calendar', exact: true }).click();
  const from = d.locator('#rail-period-from'), to = d.locator('#rail-period-to');
  check('desktop: months by default this month to the last month', (await from.inputValue()) === month(0) && (await to.inputValue()) === LAST, (await from.inputValue()) + '–' + (await to.inputValue()));
  const options = await from.locator('option').evaluateAll(os => os.map(o => o.value));
  check('desktop: the months stop at the last month', options[0] === month(0) && options.at(-1) === LAST, options[0] + '…' + options.at(-1));
  await to.selectOption(month(3)); await from.selectOption(month(2));
  const titles = await d.locator('main h2, section h2').allInnerTexts();
  check('desktop: two months picked → the calendar shows those two', titles.includes(title(month(2))) && titles.includes(title(month(3))) && !titles.includes(title(month(4))) && !titles.includes(title(month(1))), titles.join(', '));
  check('desktop: changed months show Reset', (await d.getByRole('group', { name: 'Date period (months)' }).getByRole('button', { name: 'Reset' }).count()) === 1);
  await from.selectOption(month(5));
  check('desktop: From past To moves To along', (await to.inputValue()) === month(5), (await from.inputValue()) + '–' + (await to.inputValue()));
  await to.selectOption(month(1));
  check('desktop: To before From moves From back', (await from.inputValue()) === month(1), (await from.inputValue()) + '–' + (await to.inputValue()));
  await d.getByRole('group', { name: 'Date period (months)' }).getByRole('button', { name: 'Reset' }).click();
  check('desktop: Reset goes back to the whole period', (await from.inputValue()) === month(0) && (await to.inputValue()) === LAST);

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
  check('Overview: Custom months stop at the last date\'s month', months.at(-1) === LAST, months.at(-1));

  const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
  p.on('pageerror', e => errors.push(e.message));
  await p.addInitScript(() => localStorage.setItem('stretchmyleave.welcomeSeen', '1'));
  await p.goto(BASE); await p.getByRole('navigation', { name: 'Pages' }).getByRole('button', { name: 'Calendar' }).click();
  await p.getByRole('button', { name: /^Filters/ }).click(); await p.getByRole('button', { name: 'More…' }).click();
  const pf = p.locator('#mobile-period-from'), pt = p.locator('#mobile-period-to');
  await pt.selectOption(month(2)); await pf.selectOption(month(4));
  check('phone: From past To moves To along', (await pt.inputValue()) === month(4), (await pf.inputValue()) + '–' + (await pt.inputValue()));
  check('no errors', errors.length === 0, errors.join(' | '));
  console.log(res.join('\n')); if (res.some(r => r.startsWith('FAIL'))) process.exitCode = 1;
  await b.close();
})();
