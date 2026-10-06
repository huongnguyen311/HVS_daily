// Apply HVS Group logo + brand colours (from appicon.png) to the converted screens.
const fs = require('fs'), path = require('path');
const DIR = process.argv[2];

const COLORS = {
  '#2563eb': '#0170C1', // primary
  '#1d4ed8': '#015FA4', // hover / active text
  '#e4edfd': '#E3F1FB', // info badge fill
  '#c7d9fb': '#B5DBF4', // info badge border
  '#0b1b2b': '#062B4D', // sidebar / login ground
  '#17304a': '#0B4374', // active nav item
};

const LOGO_RE = /<div style="[^"]*"><div style="[^"]*">H<\/div><div><div style="[^"]*">HAIVANSHIP<\/div><div style="[^"]*">Agency Ops · Web<\/div><\/div><\/div>/g;
const LOGO = '<div style="display:flex;flex-direction:column;gap:8px;padding:0 4px 24px">'
  + '<div style="background:#fff;border-radius:10px;padding:10px 14px;display:flex;align-items:center;max-width:220px">'
  + '<img src="assets/hvs-logo.png" alt="HVS Group" width="477" height="94" style="width:100%;height:auto;display:block"></div>'
  + '<div style="font-size:11px;color:#94a3b8;padding:0 8px">Agency Ops · Web</div></div>';

const out = [];
for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.html') && x !== 'index.html')) {
  const p = path.join(DIR, f);
  let s = fs.readFileSync(p, 'utf8');
  const logos = (s.match(LOGO_RE) || []).length;
  s = s.replace(LOGO_RE, LOGO);
  let n = 0;
  for (const [from, to] of Object.entries(COLORS)) {
    s = s.replace(new RegExp(from, 'gi'), () => { n++; return to; });
  }
  fs.writeFileSync(p, s);
  out.push(`${f.padEnd(24)} logo=${logos} colors=${n}`);
}
console.log(out.join('\n'));
