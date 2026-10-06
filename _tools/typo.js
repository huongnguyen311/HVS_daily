// Readability pass: collapse the font-size scale, raise the floor, and swap slate
// greys for navy-tinted greys from the HVS logo (all text >= WCAG AA on canvas).
// Run on the pre-pass copies in _backup/truoc-typo:  node _tools/typo.js <dir>
const fs = require('fs'), path = require('path');
const DIR = process.argv[2] || '.';

// desktop scale: 12 caption · 13 meta · 14 body · 16 subhead · 18 · 20 · 24+
const DESK = { 10: 11, 11: 12, 11.5: 12, 12: 13, 12.5: 13, 13: 14, 13.5: 14, 15: 16, 17: 18 };
// mobile (field staff, outdoors): one step larger, body 16
const MOB = { 11: 12, 11.5: 13, 12: 13, 12.5: 14, 13: 15, 13.5: 15, 14: 16, 17: 18 };
const MOBILE = /^Mobile.*\.html$/;

const COLOR = [
  [/#64748b/gi, '#4D6278'],  // muted text   4.35 -> 5.76 on canvas
  [/#33475b/gi, '#2B4058'],  // secondary text
];

for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.html') && x !== 'index.html')) {
  const p = path.join(DIR, f);
  let s = fs.readFileSync(p, 'utf8');
  const map = MOBILE.test(f) ? MOB : DESK;
  s = s.replace(/font-size:\s*([\d.]+)px/g, (m, n) => map[n] ? `font-size:${map[n]}px` : m);
  for (const [re, to] of COLOR) s = s.replace(re, to);
  // light slate: lighter tint on the navy sidebar, darker grey on white
  const a = s.indexOf('<nav class="side"'), b = a >= 0 ? s.indexOf('</nav>', a) : -1;
  const fix = t => t.replace(/color:#94a3b8/gi, 'color:#6B7F94');
  s = a >= 0 ? fix(s.slice(0, a)) + s.slice(a, b).replace(/#94a3b8/gi, '#9DB4CC') + fix(s.slice(b)) : fix(s);
  fs.writeFileSync(path.join('.', f), s);
}
