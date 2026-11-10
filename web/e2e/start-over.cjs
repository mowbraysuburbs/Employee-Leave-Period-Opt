// Run with the dev server up (npm run dev), then: npm run test:e2e
// Option B: the Summary is the one real plan. Kept breaks can be moved to an
// equal start date; Clear all (with a "Start over?" check) empties it.
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:5173/';
const res = []; const check = (n, ok, x = '') => res.push((ok ? 'PASS ' : 'FAIL ') + n + (x !== '' ? '  [' + x + ']' : ''));

(async () => {
  const b = await chromium.launch(); const errors = [];
  const d = await b.newPage({ viewport: { width: 1280, height: 800 } });
  d.on('pageerror', e => errors.push(e.message));
  await d.addInitScript(() => { localStorage.setItem('stretchmyleave.welcomeSeen', '1'); localStorage.setItem('stretchmyleave.calendarTourSeen', '1'); localStorage.setItem('stretchmyleave.panelCollapsed', 'false'); localStorage.setItem('stretchmyleave.railCollapsed', 'false') });
  await d.goto(BASE); await d.evaluate(() => { localStorage.removeItem('stretchmyleave.desktopBreaks'); localStorage.removeItem('stretchmyleave.settings') }); await d.reload();
  // Keep a break that has other equal start dates: Custom February (no holidays), 3 leave days:
  // Wed – Sun, which can also start Thu, Fri or Sat. Then put the limit back to 10.
  const nextYear = new Date().getFullYear() + 1;
  await d.getByRole('navigation', { name: 'Leave periods' }).getByRole('button', { name: 'Custom dates' }).click();
  await d.selectOption('#overview-from-month', `${nextYear}-02`);
  await d.selectOption('#overview-to-month', `${nextYear}-02`);
  await d.getByRole('radiogroup', { name: 'Leave days to plan' }).getByRole('radio', { name: /^3/ }).click();
  await d.getByRole('table', { name: 'Options to pick from' }).getByRole('checkbox').first().check();
  await d.getByRole('button', { name: /Add to summary/ }).click();
  await d.getByRole('radiogroup', { name: 'Leave days to plan' }).getByRole('radio', { name: /^10/ }).click();
  await d.getByRole('button', { name: 'Calendar', exact: true }).click(); await d.waitForTimeout(200);
  const panel = d.locator('aside').last();
  await panel.getByRole('tab', { name: /Summary/ }).click();
  const table = panel.getByRole('table', { name: 'Saved breaks' });
  const before = await table.innerText();
  const n = (await panel.getByRole('button', { name: /^Remove .* break$/ }).count());
  check('the kept plan is in the Summary', n > 0, String(n));

  // Open each kept break until one has another equal start date, then move it.
  let moved = false;
  for (let i = 0; i < n && !moved; i++) {
    await panel.getByRole('tab', { name: /Summary/ }).click();
    await table.locator('button.hover\\:underline').nth(i).click(); await d.waitForTimeout(150);
    await panel.getByRole('tab', { name: 'Details' }).click();
    if (i === 0) check('a kept break says "In your Summary"', (await panel.getByText('✓ In your Summary').count()) === 1);
    const all = await d.getByRole('button', { name: /^Start on / }).evaluateAll(els => els.map(e => e.getAttribute('aria-label')));
    const target = all.find(l => !/selected/.test(l));
    if (target) {
      await d.getByRole('button', { name: target }).click(); await d.waitForTimeout(150);
      await panel.getByRole('tab', { name: /Summary/ }).click();
      const after = await table.innerText();
      const n2 = await panel.getByRole('button', { name: /^Remove .* break$/ }).count();
      check('moving a kept break keeps the same number of breaks', n2 === n, n + ' → ' + n2);
      check('…and changes its dates in the Summary', after !== before);
      moved = true;
    }
  }
  check('a kept break was moved to another equal start date', moved);

  // Clear all: Cancel keeps everything; Clear all empties.
  await panel.getByRole('tab', { name: /Summary/ }).click();
  await panel.getByRole('button', { name: 'Clear all' }).click();
  const dlg = panel.getByRole('alertdialog', { name: 'Start over?' });
  check('Clear all asks "Start over?" first', await dlg.isVisible());
  await dlg.getByRole('button', { name: 'Cancel' }).click();
  check('Cancel keeps the breaks', (await panel.getByRole('button', { name: /^Remove .* break$/ }).count()) === n);
  await panel.getByRole('button', { name: 'Clear all' }).click();
  await panel.getByRole('alertdialog', { name: 'Start over?' }).getByRole('button', { name: 'Clear all' }).click();
  check('Clear all empties the Summary', (await panel.getByRole('button', { name: /^Remove .* break$/ }).count()) === 0 && /No breaks yet/.test(await panel.innerText()));
  const leftNow = await d.getByRole('region', { name: 'Leave days' }).first().innerText();
  check('leave left is back to the limit', /\b10 left\b/.test(leftNow), (leftNow.match(/\d+ left/) || ['?'])[0]);
  check('the limit stays', await d.getByLabel('Your leave limit').first().inputValue() === '10');

  // Phone: Clear all from the Summary sheet.
  const p = d; await p.setViewportSize({ width: 390, height: 844 }); await p.reload(); await p.waitForTimeout(300);
  await p.getByRole('navigation', { name: 'Leave periods' }).getByRole('button', { name: 'Christmas' }).click();
  // Christmas starts with nothing ticked: pick the first row.
  await p.getByRole('table', { name: 'Options to pick from' }).locator('input:not(:disabled)').first().check(); 
  await p.getByRole('button', { name: /Add to summary/ }).click();
  await p.locator('header [data-tour=summary]').click();
  const sheet = p.getByRole('dialog', { name: 'My breaks' });
  await sheet.getByRole('button', { name: 'Clear all' }).click();
  await sheet.getByRole('alertdialog', { name: 'Start over?' }).getByRole('button', { name: 'Clear all' }).click();
  check('phone: Clear all from the Summary sheet', /No breaks yet/.test(await sheet.innerText()) && /0 break/.test(await p.locator('header [data-tour=summary]').getAttribute('aria-label')));
  check('no errors', errors.length === 0, errors.join(' | '));
  console.log(res.join('\n')); if (res.some(r => r.startsWith('FAIL'))) process.exitCode = 1;
  await b.close();
})();
