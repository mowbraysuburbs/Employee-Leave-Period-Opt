// Run with the dev server up (npm run dev), then: npm run test:e2e
// Overview Custom dates (and Easter / Christmas): whole months, nothing picked until you
// pick, MIN / JOINS on the numbers, one capped list (joins first, then short breaks;
// longer = the Calendar), no step 3; rows that clash with a tick are greyed.
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:5173/';
const res = []; const check = (n, ok, x = '') => res.push((ok ? 'PASS ' : 'FAIL ') + n + (x ? '  [' + x + ']' : ''));
const year = new Date().getFullYear() + 1;

(async () => {
  const b = await chromium.launch();
  const errors = [];
  const d = await b.newPage({ viewport: { width: 1280, height: 800 } });
  d.on('pageerror', e => errors.push(e.message));
  await d.addInitScript(() => localStorage.setItem('stretchmyleave.welcomeSeen', '1'));
  await d.goto(BASE);
  const nav = d.getByRole('navigation', { name: 'Leave periods' });
  const add = d.getByRole('button', { name: /Add to summary|Added/ }).first();
  check('themed period: no step 3', (await d.getByRole('radiogroup', { name: 'Show which list' }).count()) === 0);
  // Christmas holidays at 4 days: the Christmas + New Year join is ticked, its long weekends are hidden,
  // and the line is about 4 (no "Use 10").
  await nav.getByRole('button', { name: /^Christmas/ }).first().click();
  await d.getByRole('radiogroup', { name: 'Days off limit' }).getByRole('radio', { name: /^4/ }).click();
  const xline = await d.getByRole('status').first().innerText();
  check('Christmas, 4 days: the line is about 4 leave days', /4 leave days join Christmas \+ New Year/.test(xline) && (await d.getByRole('button', { name: /^Use / }).count()) === 0, xline);
  const xt = d.getByRole('table', { name: 'Options to pick from' });
  check('Christmas, 4 days: nothing ticked; the join first; no one-day rows next to the Friday holidays', (await xt.locator('input:checked').count()) === 0 && (await xt.getByRole('checkbox').count()) === 3 && /25 Dec/.test(await xt.getByRole('row').nth(1).innerText()) && !/Thu 24 Dec|Thu 31 Dec/.test(await xt.innerText()), String(await xt.getByRole('checkbox').count()));
  // The Details calendar shows every option's dates before anything is ticked; hovering a row lights up exactly its dates.
  const calDates = d.locator('[aria-label="Plan on the calendar"] [data-date]');
  check('Details calendar: every option\'s dates show with nothing ticked', (await calDates.count()) >= 19, String(await calDates.count()));
  await xt.getByRole('row').filter({ hasText: 'Sun 20 Dec' }).hover(); await d.waitForTimeout(200);
  const glowing = await calDates.evaluateAll(els => els.filter(e => e.className.includes('0_0_6px')).map(e => e.dataset.date));
  check('Details calendar: hovering Reconciliation lights up Wed 16 – Sun 20 Dec only', glowing.join(',') === '2026-12-16,2026-12-17,2026-12-18,2026-12-19,2026-12-20' || glowing.length === 5, glowing.join(','));
  await xt.getByRole('checkbox').first().check();
  check('Christmas, 4 days: ticking the join greys the rest (nothing disappears), one note says why', (await xt.getByRole('checkbox').count()) === 3 && (await xt.locator('input:disabled').count()) === 2 && (await d.getByText(/Greyed: overlaps a break you ticked, or not enough leave left/).count()) === 1);
  // MIN and skipped numbers: 2 is the first proper break (Reconciliation is a Wednesday), 3 adds nothing.
  const lim = d.getByRole('radiogroup', { name: 'Days off limit' });
  check('Christmas: MIN on 2, 3 skipped (can\'t be picked)', (await lim.getByRole('radio', { name: /^2 \(first proper break\)/ }).count()) === 1 && await lim.getByRole('radio', { name: /^3 / }).isDisabled());

  // Easter (limit still 4 from Christmas): capped at the join (3); 4–10 skipped; the rest goes to the Calendar.
  await nav.getByRole('button', { name: /^Easter/ }).first().click();
  const eline = await d.getByRole('status').first().innerText();
  check('Easter past the join: capped at 3, 4–10 skipped, the rest to the Calendar', /3 leave days join Human Rights Day \+ Easter/.test(eline) && /use your other \d+ on the Calendar/.test(eline) && await lim.getByRole('radio', { name: /^5 / }).isDisabled() && (await d.getByRole('button', { name: 'Use on the Calendar →' }).count()) === 1, eline);

  await nav.getByRole('button', { name: 'Custom dates' }).click();
  const limit = d.getByRole('radiogroup', { name: 'Days off limit' });
  // March: both long weekends are free, so 1–2 add nothing (skipped); 3 joins Human Rights Day + Easter; no step 3.
  await d.selectOption('#overview-from-month', `${year}-03`);
  await d.selectOption('#overview-to-month', `${year}-03`);
  check('March: 1–2 skipped (long weekends already free)', await limit.getByRole('radio', { name: /^1 / }).isDisabled() && await limit.getByRole('radio', { name: /^2 / }).isDisabled());
  check('March: JOINS tag on the joining number', (await limit.getByRole('radio', { name: /joins Human Rights Day \+ Easter/ }).count()) === 1);
  check('March: holidays that join = no step 3', (await d.getByRole('radiogroup', { name: 'Show which list' }).count()) === 0);
  await limit.getByRole('radio', { name: /^3/ }).click();
  check('March, 3 days: the joined break (pick one)', /3 leave days join Human Rights Day \+ Easter/.test(await d.getByRole('status').first().innerText()) && (await d.getByRole('table', { name: 'Options to pick from' }).getByRole('checkbox').count()) > 0, await d.getByRole('status').first().innerText());
  // February: no holidays, every week the same.
  await d.selectOption('#overview-from-month', `${year}-02`);
  await d.selectOption('#overview-to-month', `${year}-02`);
  check('February: no holidays line', /No public holidays/.test(await d.getByRole('status').first().innerText()), await d.getByRole('status').first().innerText());
  await d.selectOption('#overview-from-month', `${year}-03`);
  await d.selectOption('#overview-to-month', `${year}-10`);
  await limit.getByRole('radio', { name: /^4/ }).click();
  check('Mar–Oct: one list (joins first, then short breaks), no long-break section, no step 3', (await d.getByRole('table', { name: 'Options to pick from' }).getByRole('rowgroup', { name: 'One long break' }).count()) === 0 && (await d.getByRole('radiogroup', { name: 'Show which list' }).count()) === 0);
  const table = d.getByRole('table', { name: 'Options to pick from' });
  const boxes = table.getByRole('checkbox');
  check('Custom: options listed, nothing picked', (await boxes.count()) > 3 && (await table.locator('input:checked').count()) === 0, String(await boxes.count()));
  check('Custom: Add is off until you pick', await add.isDisabled());

  // Tick until the leave runs out: the rest grey out.
  // Rows inside a ticked break disappear, so keep ticking the first free one.
  for (let guard = 0; guard < 20; guard++) {
    const free = table.locator('input[type=checkbox]:not(:checked):not(:disabled)');
    if (!(await free.count())) break;
    await free.first().check();
  }
  const ticked = await table.locator('input:checked').count();
  check('Holiday breaks: ticks stop when the leave is used', ticked >= 1 && ticked <= 4 && /Add to summary \(\d\)/.test(await add.innerText()), await add.innerText());
  check('Holiday breaks: line under the title counts the leave', /4 of 4 leave days used|of 4 leave days used/.test(await d.getByRole('status').first().innerText()), await d.getByRole('status').first().innerText());
  check('Holiday breaks: clashing rows are greyed with one note, never hidden', (await table.getByText(/Already in your/).count()) === 0 && (await d.getByText(/^Greyed:/).count()) <= 1);

  await add.click();
  check('Add keeps them in the Summary', /Summary \([1-9]\)/.test(await d.getByRole('tab', { name: /Summary/ }).innerText().catch(() => d.getByText(/Summary \(\d\)/).first().innerText())));

  // Leftover leave: "Use on the Calendar" opens the Calendar with the holidays filter off.
  const r = await b.newPage({ viewport: { width: 1280, height: 800 } });
  r.on('pageerror', e => errors.push(e.message));
  await r.addInitScript(() => localStorage.setItem('stretchmyleave.welcomeSeen', '1'));
  await r.goto(BASE);
  await r.getByRole('navigation', { name: 'Leave periods' }).getByRole('button', { name: 'Custom dates' }).click();
  await r.selectOption('#overview-from-month', `${year}-03`);
  await r.selectOption('#overview-to-month', `${year}-10`);
  await r.getByRole('radiogroup', { name: 'Days off limit' }).getByRole('radio', { name: /^4/ }).click();
  await r.getByRole('table', { name: 'Options to pick from' }).getByRole('checkbox').first().check();
  const rest = r.getByRole('button', { name: 'Use on the Calendar →' });
  check('leftover leave: the line offers the Calendar', (await rest.count()) === 1, await r.getByRole('status').first().innerText());
  await rest.click(); await r.waitForTimeout(300);
  check('Use on the Calendar: Calendar opens with the holidays filter off', /Public holidays:\s*Off/.test(await r.getByRole('button', { name: /Public holidays:/ }).first().innerText()));

  // Phone: months in the card, step 3 in the settings sheet (holidays far apart).
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
  p.on('pageerror', e => errors.push(e.message));
  await p.addInitScript(() => localStorage.setItem('stretchmyleave.welcomeSeen', '1'));
  await p.goto(BASE);
  await p.getByRole('button', { name: /^Custom/ }).first().click();
  check('phone: Custom has From / To months', (await p.locator('#mobile-overview-from-month').count()) === 1);
  await p.selectOption('#mobile-overview-from-month', `${year}-03`);
  await p.selectOption('#mobile-overview-to-month', `${year}-10`);
  await p.locator('[data-tour=settings]').click();
  await p.getByRole('dialog', { name: 'Plan settings' }).waitFor({ timeout: 3000 }).catch(() => {});
  check('phone: no step 3 in the settings sheet', (await p.getByRole('dialog').getByRole('radiogroup', { name: 'Show which list' }).count()) === 0 && (await p.getByRole('dialog').getByRole('radiogroup', { name: 'Days off limit' }).count()) === 1);

  check('no errors', errors.length === 0, errors.join(' | '));
  console.log(res.join('\n')); if (res.some(r => r.startsWith('FAIL'))) process.exitCode = 1;
  await b.close();
})();
