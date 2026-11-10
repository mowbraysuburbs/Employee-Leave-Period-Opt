// Run with the dev server up (npm run dev), then: npm run test:e2e
// The Overview plans with what's left after the Summary, and adding a plan
// doesn't re-plan the list.
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:5173/';
const res = []; const check = (n, ok, x = '') => res.push((ok ? 'PASS ' : 'FAIL ') + n + (x !== '' ? '  [' + x + ']' : ''));

(async () => {
  const b = await chromium.launch(); const errors = [];
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.on('pageerror', e => errors.push(e.message));
  await p.addInitScript(() => { localStorage.setItem('stretchmyleave.welcomeSeen', '1'); localStorage.setItem('stretchmyleave.calendarTourSeen', '1'); localStorage.setItem('stretchmyleave.panelCollapsed', 'false') });
  await p.goto(BASE); await p.evaluate(() => { localStorage.removeItem('stretchmyleave.desktopBreaks'); localStorage.removeItem('stretchmyleave.settings') }); await p.reload();
  const nav = p.getByRole('navigation', { name: 'Leave periods' });
  // Step 2's leave card: the limit is its dropdown; then pick that many leave days if the number can be picked.
  const pickLimit = async n => {
    await p.locator('#overview-limit').selectOption(String(n));
    const r = p.getByRole('radiogroup', { name: 'Leave days to plan' }).getByRole('radio', { name: new RegExp(`^${n}( |$)`) });
    if (await r.isEnabled()) await r.click();
  };
  // Leave used by the plan: the "leave days" tile in Details.
  const planLeave = async () => {
    await p.locator('[data-tour=panel]').getByRole('tab', { name: 'Details' }).click();
    const t = await p.locator('[data-tour=panel]').innerText();
    const m = t.match(/(\d+)\s*\n\s*leave days/);
    return m ? Number(m[1]) : 0;
  };
  const rows = async () => (await p.getByRole('article').innerText()).replace(/Add to summary \(\d+\)|Added ✓/, '');

  await pickLimit(6);
  await nav.getByRole('button', { name: /^Christmas/ }).click();
  // Christmas starts with nothing ticked: pick the first row.
  await p.getByRole('table', { name: 'Options to pick from' }).locator('input:not(:disabled)').first().check(); 
  const used = await planLeave();
  check('nothing in the Summary: plan uses up to the limit (6)', used > 0 && used <= 6, String(used));
  const before = await rows();
  await p.getByRole('button', { name: /Add to summary/ }).click(); await p.waitForTimeout(200);
  const after = await rows();
  check('after Add, the list stays the same', before === after);
  check('after Add, it shows Added ✓', (await p.getByRole('button', { name: 'Added ✓' }).count()) === 1);

  await pickLimit(10);
  await nav.getByRole('button', { name: /^School holidays/ }).click();
  const used2 = await planLeave();
  check('another period plans with what\'s left (10 − ' + used + ')', used2 > 0 && used2 <= 10 - used, used2 + ' ≤ ' + (10 - used));
  const note = await p.locator('[data-tour=limit]').innerText();
  check('the leave card shows what\'s left and locks the rest', /\d+ left · \d+ used/.test(note) && /only \d+ left/.test(note), note.replace(/\n/g, ' '));

  // Limit down to what's in the Summary: nothing left.
  await pickLimit(used);
  await nav.getByRole('button', { name: /^Easter/ }).click();
  const msg = await p.getByRole('article').innerText();
  check('nothing left: the results say so, with Raise my limit / Open Summary', /leave days? (is|are) in your Summary/.test(msg) && (await p.getByRole('button', { name: 'Raise my limit' }).count()) === 1 && (await p.getByRole('button', { name: 'Open Summary' }).count()) === 1, msg.slice(0, 120));
  await p.getByRole('button', { name: 'Open Summary' }).click();
  check('Open Summary shows the Summary tab', (await p.locator('[data-tour=panel]').getByRole('tab', { name: /Summary/ }).getAttribute('aria-selected')) === 'true');
  check('no errors', errors.length === 0, errors.join(' | '));
  console.log(res.join('\n')); if (res.some(r => r.startsWith('FAIL'))) process.exitCode = 1;
  await b.close();
})();
