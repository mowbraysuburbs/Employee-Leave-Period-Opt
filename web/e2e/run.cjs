// Runs every journey test in this folder and prints a summary.
// Start the site first (npm run dev), then: npm run test:e2e
const { execFileSync } = require('node:child_process');
const { readdirSync } = require('node:fs');
const path = require('node:path');

const files = readdirSync(__dirname).filter(f => f.endsWith('.cjs') && f !== 'run.cjs').sort();
let pass = 0, fail = 0;
for (const f of files) {
  let out = '';
  try {
    out = execFileSync(process.execPath, [path.join(__dirname, f)], { encoding: 'utf8', env: process.env });
  } catch (e) {
    out = (e.stdout || '') + (e.stderr ? '\n' + e.stderr : '');
  }
  const p = (out.match(/^PASS /gm) || []).length
  // A file that crashed before checking anything counts as one failure.
  const x = (out.match(/^FAIL /gm) || []).length || (p ? 0 : 1)
  pass += p; fail += x;
  console.log(`${x || !p ? '✗' : '✓'} ${f}: ${p} passed${x ? `, ${x} failed` : ''}`);
  for (const line of out.split('\n')) if (line.startsWith('FAIL') || /Error/.test(line)) console.log('    ' + line);
}
console.log(`\n${pass} passed, ${fail} failed`);
if (fail || !pass) process.exitCode = 1;
