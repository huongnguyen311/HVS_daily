// Makeover pass: unified sidebar with icons, compact brand block, sticky top bar,
// required-field fix, theme stylesheet. Idempotent-ish: run on the pre-makeover backup.
const fs = require('fs'), path = require('path');
const DIR = process.argv[2];

const ICON = {
  calendar: '<path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="2"/>',
  tasks: '<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>',
  docs: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 3.5a4 4 0 0 1 0 7.5M22 21a7 7 0 0 0-4-6.3"/>',
  template: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
};
const svg = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]}</svg>`;

const NAV = [
  ['Vận hành', [['KeHoachThang.html', 'Kế hoạch tàu tháng', 'calendar'], ['Main.html', 'Việc của tôi', 'tasks'], ['XacNhanChungTu.html', 'Chứng từ', 'docs']]],
  ['Dành cho quản lý', [['ChiSo.html', 'Chỉ số quản lý', 'chart'], ['QuanTri.html', 'Quản trị &amp; phân công', 'users'], ['MauFDA.html', 'Mẫu PDA / FDA', 'template']]],
];

const BRAND = '<div class="brand"><div class="brand__plate"><img src="assets/hvs-logo.png" alt="HVS Group" width="477" height="94"></div><div class="brand__sub">Agency Ops</div></div>';
const BRAND_RE = /<div style="display:flex;flex-direction:column;gap:8px;padding:0 4px 24px"><div style="background:#fff;border-radius:10px;[^"]*"><img src="assets\/hvs-logo\.png"[^>]*><\/div><div style="[^"]*">Agency Ops · Web<\/div><\/div>/;

const report = [];
for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.html') && x !== 'index.html')) {
  const p = path.join(DIR, f);
  let s = fs.readFileSync(p, 'utf8');
  const notes = [];

  // theme stylesheet, after the page's own <style>
  if (!s.includes('hvs-theme.css')) {
    s = s.replace('</head>', '<link rel="stylesheet" href="assets/hvs-theme.css">\n</head>');
    notes.push('theme');
  }

  // sidebar
  const navStart = s.indexOf('<nav class="side"');
  if (navStart >= 0) {
    const navEnd = s.indexOf('</nav>', navStart);
    let nav = s.slice(navStart, navEnd);
    const active = (nav.match(/<a href="([^"]+)" style="[^"]*background:#0B4374[^"]*"/) || [])[1] || '';
    nav = nav.replace(BRAND_RE, BRAND);
    const linksStart = nav.indexOf('<div style="font-size:11px;font-weight:600;letter-spacing:0.08em');
    const userStart = nav.indexOf('<div style="margin-top:auto');
    const links = NAV.map(([label, items]) =>
      `<div class="nav-label">${label}</div>` + items.map(([href, text, ic]) =>
        `<a class="nav-link${href === active ? ' is-active' : ''}" href="${href}"${href === active ? ' aria-current="page"' : ''}>${svg(ic)}<span>${text}</span></a>`).join('')
    ).join('');
    nav = nav.slice(0, linksStart) + links + '\n' + nav.slice(userStart).replace('<div style="margin-top:auto', '<div class="nav-user" style="margin-top:auto');
    s = s.slice(0, navStart) + nav + s.slice(navEnd);
    notes.push('nav:' + (active || 'none'));
  }

  // top bar
  s = s.replace('<header style="min-height:64px;', '<header class="topbar" style="min-height:64px;');
  s = s.replace('HAIVANSHIP · Agency <span', 'HVS Group · Agency <span');

  // required marker: keep "*" on the label line
  let req = 0;
  s = s.replace(/(<label[^>]*>)([^<]+?) <span style="color:#9a5b00">\*<\/span>/g, (m, open, text) => {
    req++;
    return `${open}<span class="lbl">${text}<span class="req" aria-hidden="true"> *</span></span>`;
  });
  if (req) notes.push('req:' + req);

  // Việc của tôi: main + aside grid stacks below 1400px
  if (f === 'Main.html') {
    s = s.replace('<div style="display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);', '<div class="grid-aside" style="display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);');
    notes.push('grid-aside');
  }

  // login: wave ground + brand block
  if (f === 'DangNhap.html') {
    s = s.replace('<div style="min-height:100vh;background:#062B4D;', '<div class="login-bg" style="min-height:100vh;background:#062B4D;');
    s = s.replace(/<div style="display:flex;flex-direction:column;gap:8px;padding:0 4px 24px"><div style="background:#fff;[^"]*"><img src="assets\/hvs-logo\.png"[^>]*><\/div><div style="[^"]*">Agency Ops · Web<\/div><\/div>/,
      '<div><div class="brand__plate"><img src="assets/hvs-logo.png" alt="HVS Group" width="477" height="94"></div><div class="brand__sub">Agency Ops</div></div>');
    notes.push('login');
  }

  fs.writeFileSync(p, s);
  report.push(`${f.padEnd(24)} ${notes.join(' ')}`);
}
console.log(report.join('\n'));
