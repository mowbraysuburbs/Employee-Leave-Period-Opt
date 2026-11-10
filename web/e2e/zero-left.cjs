// Run with the dev server up (npm run dev), then: npm run test:e2e
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:5173/';
const res = []; const check = (n, ok, x = '') => res.push((ok ? 'PASS ' : 'FAIL ') + n + (x !== '' ? '  [' + x + ']' : ''));
(async () => {
  const b = await chromium.launch(); const errors = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, deviceScaleFactor: 2 });
  p.on('pageerror', e => errors.push(e.message));
  await p.addInitScript(() => { localStorage.setItem('stretchmyleave.welcomeSeen', '1') });
  await p.goto(BASE); await p.evaluate(() => { localStorage.removeItem('stretchmyleave.desktopBreaks'); localStorage.removeItem('stretchmyleave.settings') }); await p.reload(); await p.waitForTimeout(300);
  await p.getByRole('navigation', { name: 'Leave periods' }).getByRole('button', { name: 'Christmas' }).click();
  await p.locator('[data-tour=settings]').click(); await p.locator('#plan-sheet-limit').selectOption('4'); await p.getByRole('dialog', { name: 'Plan settings' }).getByRole('radio', { name: /^4/ }).click();
  await p.getByRole('dialog', { name: 'Plan settings' }).getByRole('button', { name: 'Show results' }).click();
  // Nothing is ticked: pick the first row (Christmas + New Year, 4 leave days).
  await p.getByRole('table', { name: 'Options to pick from' }).locator('input:not(:disabled)').first().check(); 
  await p.getByRole('button', { name: /Add to summary/ }).click();
  await p.getByRole('navigation', { name: 'Pages' }).getByRole('button', { name: 'Calendar' }).click(); await p.waitForTimeout(300);
  // The public holidays filter starts on and hides months with no holiday; clear it (hold Filters) to see the whole range.
  { const f = p.getByRole('button', { name: /^Filters/ }); check('public holidays filter is on by default', /1 on/.test(await f.getAttribute('aria-label')), await f.getAttribute('aria-label'));
    const fb = await f.boundingBox(); await p.mouse.move(fb.x + fb.width / 2, fb.y + fb.height / 2); await p.mouse.down(); await p.waitForTimeout(700); await p.mouse.up(); await p.waitForTimeout(200); }
  const months = await p.locator('section[aria-label=Calendar] h2, main h2').allInnerTexts();
  // The range: from this month to January of the year after next.
  const now = new Date();
  const thisMonth = now.toLocaleString('en-GB', { month: 'long' }) + ' ' + now.getFullYear();
  const lastMonth = 'January ' + (now.getFullYear() + 2);
  check('range: first month is this month, last is January after next year', months[0].includes(thisMonth) && months[months.length - 1].includes(lastMonth), months[0] + ' … ' + months[months.length - 1] + ' (' + months.length + ')');
  const left = p.locator('[data-tour=snap]');
  check('"0 left" shown', /^0 left/.test((await left.innerText()).trim()), await left.innerText());
  await left.click();
  { const hint = p.getByRole('status').filter({ hasText: 'No leave left' }); check('tap hint explains', (await hint.count()) === 1, await hint.allInnerTexts()); }
  const lb = await left.boundingBox();
  await p.mouse.move(lb.x + lb.width / 2, lb.y + lb.height / 2); await p.mouse.down(); await p.waitForTimeout(700); await p.mouse.up();
  const strip = p.getByRole('slider', { name: 'Leave days' });
  check('hold at 0 left: leave days become 0', (await strip.getAttribute('aria-valuenow')) === '0');
  const cells = p.locator('button[data-date]');
  const enabled = await cells.evaluateAll(els => els.filter(e => !e.disabled).length);
  const holidayLabels = await cells.evaluateAll(els => els.filter(e => /: /.test(e.getAttribute('aria-label') || '')).map(e => e.getAttribute('aria-label')));
  check('no date can be tapped (no leave breaks)', enabled === 0, String(enabled));
  check('only public holidays are labelled / coloured', holidayLabels.length > 5 && holidayLabels.every(l => !/days off/.test(l)), holidayLabels.slice(0, 3).join(' | '));
  // The next Christmas Day in the range.
  const xmasYear = now.getMonth() === 11 && now.getDate() > 25 ? now.getFullYear() + 1 : now.getFullYear();
  const dec25 = await p.locator(`button[data-date="${xmasYear}-12-25"]`).evaluate(e => getComputedStyle(e).backgroundColor);
  check('Christmas is shown in the holiday colour', dec25 === 'rgb(251, 146, 60)', dec25);
  await strip.focus(); await p.keyboard.press('ArrowRight');
  check('choosing 1 brings the breaks back', (await cells.evaluateAll(els => els.filter(e => !e.disabled).length)) > 50);
  // Desktop: Snap with 0 left gives the same view
  const d = p; await d.setViewportSize({ width: 1280, height: 800 });
  await d.evaluate(() => { localStorage.setItem('stretchmyleave.calendarTourSeen', '1'); localStorage.setItem('stretchmyleave.railCollapsed', 'false') });
  await d.goto(BASE); await d.getByRole('button', { name: 'Calendar', exact: true }).click();
  await d.getByRole('switch', { name: /Snap to days left/ }).click(); await d.waitForTimeout(200);
  check('desktop: snap at 0 left = holidays only, nothing clickable', (await d.locator('button[data-date]').evaluateAll(els => els.filter(e => !e.disabled).length)) === 0);
  check('no errors', errors.length === 0, errors.join(' | '));
  console.log(res.join('\n')); if (res.some(r => r.startsWith('FAIL'))) process.exitCode = 1; await b.close();
})();
