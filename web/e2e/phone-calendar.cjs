// Run with the dev server up (npm run dev), then: npm run test:e2e
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:5173/';
const res = []; const check = (n, ok, x = '') => res.push((ok ? 'PASS ' : 'FAIL ') + n + (x !== '' ? '  [' + x + ']' : ''));
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[390, 844], [360, 740]]) {
    const t = w + 'px: ';
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true });
    const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => m.type() === 'error' && errors.push(m.text()));
    await p.addInitScript(() => { localStorage.setItem('stretchmyleave.welcomeSeen', '1'); localStorage.removeItem('stretchmyleave.desktopBreaks'); localStorage.removeItem('stretchmyleave.settings') });
    await p.goto(BASE); await p.waitForTimeout(400);
    // add 2 breaks from the Overview (Christmas) so there is leave in the Summary
    await p.getByRole('navigation', { name: 'Leave periods' }).getByRole('button', { name: 'Christmas' }).click();
    await p.locator('[data-tour=settings]').click();
    await p.getByRole('dialog', { name: 'Plan settings' }).getByRole('radio', { name: '4' }).click();
    await p.getByRole('dialog', { name: 'Plan settings' }).getByRole('button', { name: 'Show results' }).click();
    await p.getByRole('button', { name: /Add to summary/ }).click(); await p.waitForTimeout(200);
    await p.getByRole('navigation', { name: 'Pages' }).getByRole('button', { name: 'Calendar' }).click(); await p.waitForTimeout(300);
    // the Overview limit (4) is shared: raise it to 10 so there is leave left
    await p.getByRole('button', { name: /Leave limit/ }).click(); await p.getByRole('dialog', { name: 'Your leave limit' }).getByRole('button', { name: '10' }).click();
    const strip = p.getByRole('slider', { name: 'Leave days' });
    const val = async () => Number(await strip.getAttribute('aria-valuenow'));
    const left = p.locator('[data-tour=snap]');
    const filt = p.getByRole('button', { name: /^Filters/ });
    const fx0 = Math.round((await filt.boundingBox()).x);
    const leftN = Number((await left.innerText()).match(/\d+/)[0]);
    check(t + '"N left" shows what is left after the Summary', leftN === 10 - 4, await left.innerText());
    const fill = await left.locator('span').first().evaluate(e => e.style.width);
    check(t + 'progress fill = share used (4 of 10)', fill === '40%', fill);
    const v0 = await val();
    // swipe left 2 steps (drag finger right-to-left)
    const box = await strip.boundingBox();
    await p.mouse.move(box.x + box.width / 2 + 30, box.y + box.height / 2); await p.mouse.down();
    await p.mouse.move(box.x + box.width / 2 - 25, box.y + box.height / 2, { steps: 6 }); await p.mouse.up();
    check(t + 'swiping left raises the leave days', (await val()) === v0 + 2, v0 + ' → ' + (await val()));
    await p.mouse.move(box.x + box.width / 2 - 30, box.y + box.height / 2); await p.mouse.down();
    await p.mouse.move(box.x + box.width / 2 + 2, box.y + box.height / 2, { steps: 6 }); await p.mouse.up();
    check(t + 'swiping right lowers it', (await val()) === v0 + 1, String(await val()));
    // tap a faded neighbour
    await strip.locator('[data-n]').last().click();
    check(t + 'tapping the faded next number selects it', (await val()) === v0 + 2, String(await val()));
    await strip.focus(); await p.keyboard.press('ArrowLeft');
    check(t + 'arrow keys work', (await val()) === v0 + 1);
    // limit
    await p.getByRole('button', { name: /Leave limit/ }).click();
    const pop = p.getByRole('dialog', { name: 'Your leave limit' });
    const pb = await pop.boundingBox();
    check(t + 'limit pop-up opens on screen', pb.x >= 0 && pb.x + pb.width <= w, Math.round(pb.x) + '..' + Math.round(pb.x + pb.width));
    await pop.getByRole('button', { name: '5' }).click();
    check(t + 'limit 5: leave days capped at 5', (await strip.getAttribute('aria-valuemax')) === '5');
    for (let i = 0; i < 4; i++) { await strip.focus(); await p.keyboard.press('ArrowRight') }
    check(t + 'cannot go past the limit', (await val()) <= 5, String(await val()));
    const left5 = Number((await left.innerText()).match(/\d+/)[0]);
    await p.getByRole('button', { name: /Leave limit/ }).click(); await p.getByRole('dialog', { name: 'Your leave limit' }).getByRole('button', { name: '10' }).click();
    // quick tap = hint, not snapped
    await left.click();
    check(t + 'a quick tap shows the hint and does not snap', (await p.getByRole('status').filter({ hasText: /Hold to use all/ }).count()) === 1 && (await left.getAttribute('aria-pressed')) === 'false');
    // long-press = snap
    const lb = await left.boundingBox();
    await p.mouse.move(lb.x + lb.width / 2, lb.y + lb.height / 2); await p.mouse.down(); await p.waitForTimeout(700); await p.mouse.up();
    check(t + 'long-press snaps to what is left', (await left.getAttribute('aria-pressed')) === 'true' && (await val()) === leftN, 'value ' + (await val()));
    const fill2 = await left.locator('span').first().evaluate(e => e.style.width);
    check(t + 'snapping does not change the progress fill', fill2 === '40%', fill2);
    check(t + 'snapped label keeps its words', /^\d+ left$/.test((await left.innerText()).trim()), await left.innerText());
    await strip.focus(); await p.keyboard.press('ArrowLeft');
    check(t + 'choosing a number turns snap off', (await left.getAttribute('aria-pressed')) === 'false');
    check(t + 'Filters button never moved', Math.round((await filt.boundingBox()).x) === fx0);
    const overflow = await p.locator('[data-tour=leave]').evaluate(e => e.scrollWidth > e.clientWidth + 1);
    check(t + 'the Leave pill fits (no overflow)', !overflow);
    // row 1
    await p.getByRole('button', { name: /Show only days with/ }).first().click();
    check(t + 'a colour chip filters (badge)', /1 on/.test(await filt.getAttribute('aria-label')));
    check(t + 'a red ✕ appears on the chips row', (await p.getByRole('button', { name: 'Clear the days-off filter' }).count()) === 1);
    const xBefore = await p.getByRole('button', { name: 'Clear the days-off filter' }).boundingBox();
    await p.locator('[data-tour=colours]').evaluate(e => { e.scrollLeft = 200 });
    const xAfter = await p.getByRole('button', { name: 'Clear the days-off filter' }).boundingBox();
    check(t + 'the ✕ stays put when the chips scroll', Math.round(xBefore.x) === Math.round(xAfter.x));
    await p.getByRole('button', { name: 'Clear the days-off filter' }).click();
    check(t + 'the ✕ clears the chip filter', !/on\./.test(await filt.getAttribute('aria-label')) && (await p.getByRole('button', { name: 'Clear the days-off filter' }).count()) === 0);
    // quick filters: tap Filters
    await filt.click();
    const q = p.getByRole('group', { name: 'Quick filters' });
    check(t + 'tapping Filters shows the quick filters', await q.isVisible());
    await q.getByRole('button', { name: 'Selected breaks only' }).click();
    await q.getByRole('button', { name: /public holiday/ }).click();
    check(t + 'two quick filters on (badge 2)', /2 on/.test(await filt.getAttribute('aria-label')), await filt.getAttribute('aria-label'));
    await filt.click();
    check(t + 'tapping Filters again brings back the colours', (await q.count()) === 0 && /2 on/.test(await filt.getAttribute('aria-label')));
    // hold Filters = remove all
    const fb = await filt.boundingBox();
    await p.mouse.move(fb.x + fb.width / 2, fb.y + fb.height / 2); await p.mouse.down(); await p.waitForTimeout(700); await p.mouse.up();
    check(t + 'holding Filters removes all filters', !/on\./.test(await filt.getAttribute('aria-label')) && (await p.getByRole('status').filter({ hasText: 'All filters cleared' }).count()) === 1);
    check(t + 'holding did not open the quick filters', (await q.count()) === 0);
    await p.getByRole('button', { name: /Show only days with/ }).first().click();
    await p.getByRole('button', { name: /Colouring by total days off/ }).click();
    check(t + 'Total days switches to Multiplier', (await p.getByRole('button', { name: /Colouring by multiplier/ }).count()) === 1);
    await p.getByRole('button', { name: /Colouring by multiplier/ }).click();
    await filt.click();
    await p.getByRole('button', { name: 'More…' }).click();
    const fs = p.getByRole('dialog', { name: 'More filters' });
    await fs.getByRole('button', { name: /Clear all filters/ }).click();
    check(t + 'More filters: Clear all', !/on\./.test(await filt.getAttribute('aria-label')), await filt.getAttribute('aria-label'));
    await fs.getByRole('button', { name: 'Close' }).click();
    // day sheet, help, tour
    await p.getByRole('button', { name: /^Sat 12 Dec:/ }).click(); await p.waitForTimeout(300);
    check(t + 'day sheet opens with 4 tiles', (await p.getByRole('dialog', { name: 'Day details' }).locator('.grid-cols-4 > *').count()) === 4);
    await p.getByRole('dialog', { name: 'Day details' }).getByRole('button', { name: 'Close' }).click();
    await p.locator('[data-tour=help]').click();
    await p.getByRole('dialog', { name: 'Help' }).getByRole('tab', { name: 'How it works' }).click();
    await p.getByRole('dialog', { name: 'Help' }).getByRole('button', { name: /Take the tour/ }).click(); await p.waitForTimeout(400);
    const tour = [];
    for (let i = 0; i < 8; i++) {
      const dlg = p.getByRole('dialog', { name: 'Tour' }); if (!(await dlg.count())) break;
      tour.push(await dlg.locator('h2').innerText()); await dlg.locator('button.bg-sky-700').last().click(); await p.waitForTimeout(250);
    }
    check(t + 'Calendar tour runs (mentions swipe + hold)', tour.length >= 5, tour.join(' → '));
    check(t + 'no console errors', errors.length === 0, errors.join(' | ').slice(0, 200));
    await p.close();
  }
  console.log(res.join('\n')); if (res.some(r => r.startsWith('FAIL'))) process.exitCode = 1;
  await b.close();
})();
