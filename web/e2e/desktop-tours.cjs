// Run with the dev server up (npm run dev), then: npm run test:e2e
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:5173/';
const res = []; const check = (n, ok, x = '') => res.push((ok ? 'PASS ' : 'FAIL ') + n + (x ? '  [' + x + ']' : ''));
async function runTour(p, expected) {
  const seen = [];
  for (let i = 0; i < expected.length + 2; i++) {
    const dlg = p.getByRole('dialog', { name: 'Tour' });
    if (!(await dlg.count())) break;
    const title = await dlg.locator('h2').innerText();
    const exp = expected[i];
    const visible = exp ? await p.evaluate(sel => { const el = [...document.querySelectorAll(sel)].find(e => e.getClientRects().length > 0); if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight }, exp.startsWith('date:') ? '[data-date]' : '[data-tour="' + exp + '"]') : false;
    seen.push(title + (visible ? '' : ' (NO TARGET: ' + exp + ')'));
    await dlg.locator('button.bg-sky-700').last().click(); await p.waitForTimeout(300);
  }
  return seen;
}
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => m.type() === 'error' && errors.push(m.text()));
  await p.goto(BASE); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('stretchmyleave.railCollapsed', 'true'); localStorage.setItem('stretchmyleave.panelCollapsed', 'true') }); await p.reload(); await p.waitForTimeout(600);
  const ov = await runTour(p, ['period', 'limit', 'advanced', 'results', 'plan-add', 'panel', 'nav-calendar', 'help']);
  check('Overview tour: 8 steps, every step highlights something', ov.length === 8 && ov.every(t => !t.includes('NO TARGET')), ov.join(' → '));
  check('Overview tour does not come back after finishing', (await p.getByRole('dialog', { name: 'Tour' }).count()) === 0);
  await p.getByRole('button', { name: 'Calendar', exact: true }).click(); await p.waitForTimeout(500);
  check('first time on the Calendar: its tour starts', (await p.getByRole('dialog', { name: 'Tour' }).count()) === 1);
  const ct = await runTour(p, ['leave', 'colours', 'dates', 'show', 'date:', 'add', 'breaks', 'collapse', 'help']);
  check('Calendar tour: 9 steps, every step highlights something (columns opened)', ct.length === 9 && ct.every(t => !t.includes('NO TARGET')), ct.join(' → '));
  await p.getByRole('button', { name: 'Overview' }).click(); await p.getByRole('button', { name: 'Calendar', exact: true }).click(); await p.waitForTimeout(400);
  check('Calendar tour only once', (await p.getByRole('dialog', { name: 'Tour' }).count()) === 0);
  // Help: diagrams + replay per page
  await p.locator('[data-tour=help]').click();
  const help = p.getByRole('dialog', { name: 'How it works' });
  const figs = await help.locator('figure').count();
  check('How it works shows 3 diagrams', figs === 3, String(figs));
  check('desktop Calendar steps in How it works', /Leave days card/.test(await help.innerText()));
  await help.getByRole('button', { name: /Take the tour/ }).click(); await p.waitForTimeout(400);
  check('Take the tour on the Calendar replays the Calendar tour', /Your leave days/.test(await p.getByRole('dialog', { name: 'Tour' }).locator('h2').innerText()));
  await p.getByRole('dialog', { name: 'Tour' }).getByRole('button', { name: 'Skip' }).click();
  await p.getByRole('button', { name: 'Overview' }).click();
  await p.locator('[data-tour=help]').click();
  await p.getByRole('dialog', { name: 'How it works' }).getByRole('button', { name: /Take the tour/ }).click(); await p.waitForTimeout(400);
  check('Take the tour on the Overview replays the Overview tour', /Pick a leave period/.test(await p.getByRole('dialog', { name: 'Tour' }).locator('h2').innerText()));
  check('no console errors', errors.length === 0, errors.join(' | ').slice(0, 200));
  console.log(res.join('\n')); if (res.some(r => r.startsWith('FAIL'))) process.exitCode = 1;
  await b.close();
})();
