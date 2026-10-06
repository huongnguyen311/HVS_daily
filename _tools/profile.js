// Profile page (TaiKhoan.html) + sidebar user block → link to profile + logout button.
// Run from the project root on the copies in _backup/truoc-profile:  node _tools/profile.js
const fs = require('fs');

// ---------- style idioms of the canvas screens (the theme layer keys off these) ----------
const CARD = 'background:#fff;border:1px solid #e2e8f0;box-shadow:0 1px 2px rgba(15,28,41,.04),0 1px 3px rgba(15,28,41,.06);border-radius:12px;display:flex;flex-direction:column;min-width:0;';
const HEAD = 'display:flex;justify-content:space-between;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid #e2e8f0';
const H3 = 'margin:0;font-size:16px;font-weight:600';
const BODY = 'padding:18px 20px;display:flex;flex-direction:column;gap:14px;min-width:0';
const LABEL = 'display:flex;flex-direction:column;gap:6px;font-size:14px;font-weight:500;min-width:0';
const INPUT = 'height:42px;box-sizing:border-box;padding:0 12px;border:1px solid #e2e8f0;border-radius:8px;font:inherit;font-weight:400;font-size:14px;background:#fff;width:100%';
const RO = INPUT.replace('background:#fff', 'background:#f8fafc;color:#4D6278');
const BTN = 'display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:40px;padding:0 16px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;white-space:nowrap;cursor:pointer;';
const PRIMARY = BTN + 'background:#0170C1;color:#fff;border:1px solid #0170C1';
const SECONDARY = BTN + 'background:#fff;color:#0f1c29;border:1px solid #e2e8f0';
const DANGER = BTN + 'background:#fff;color:#b42318;border:1px solid #f6c9c9';
const PILL = 'display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;font-size:13px;font-weight:600;line-height:18px;white-space:nowrap;';
const P_INFO = PILL + 'background:#E3F1FB;border:1px solid #B5DBF4;color:#015FA4';
const P_NEUTRAL = PILL + 'background:#fff;border:1px solid #e2e8f0;color:#4D6278';
const P_OK = PILL + 'background:#dcf5ea;border:1px solid #bfe9d6;color:#0f6b4f';
const DT = 'font-size:13px;color:#4D6278;margin-bottom:2px';
const DD = 'margin:0;font-size:14px;font-weight:500';
const MUTED = 'color:#4D6278;font-size:13px';

const LOGOUT_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>';

const card = (title, inner, aside = '') =>
  `<section style="${CARD}"><header style="${HEAD}"><h3 style="${H3}">${title}</h3><div style="display:flex;gap:8px;align-items:center">${aside}</div></header>${inner}</section>`;
const field = (label, input) => `<label style="${LABEL}">${label}${input}</label>`;
const sw = (id, label, hint, on) =>
  `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:10px 0;border-top:1px solid #e9eef3"><label for="${id}" style="display:flex;flex-direction:column;gap:2px;cursor:pointer"><span style="font-size:14px;font-weight:500">${label}</span><span style="${MUTED}">${hint}</span></label><input class="switch" type="checkbox" role="switch" id="${id}"${on ? ' checked' : ''}></div>`;

// ---------- page body ----------
const MAIN = `<main style="padding:32px 32px 48px;display:flex;flex-direction:column;gap:20px;min-width:0">

<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap"><div><h1 style="margin:0;font-size:26px;font-weight:700;letter-spacing:-0.01em;line-height:1.2">Tài khoản của tôi</h1><p style="margin:6px 0 0;color:#4D6278;font-size:14px">Thông tin cá nhân, quyền truy cập và cài đặt thông báo.</p></div></div>

<section class="profile-hero" style="${CARD}padding:24px;flex-direction:row;align-items:center;gap:20px;flex-wrap:wrap">
<div class="profile-avatar" aria-hidden="true">M</div>
<div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:220px">
<h2 style="margin:0;font-size:22px;font-weight:700">Minh</h2>
<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center"><span style="${P_INFO}">PIC</span><span style="${P_NEUTRAL}">Chi nhánh Nghi Sơn</span><span style="${P_NEUTRAL}">Phạm vi: own</span></div>
<span style="${MUTED}">[email công ty] · [chức vụ]</span>
</div>
<div style="display:flex;gap:8px;flex-wrap:wrap"><a href="#doi-mat-khau" style="${SECONDARY}">Đổi mật khẩu</a><a href="index.html" data-logout style="${DANGER}">${LOGOUT_SVG}Đăng xuất</a></div>
</section>

<div style="display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:16px;align-items:start;min-width:0" class="profile-grid">
<div style="display:flex;flex-direction:column;gap:16px;min-width:0">

${card('Thông tin cá nhân', `<form style="${BODY}" data-toast-form="Đã lưu thông tin cá nhân.">
<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 16px">
${field('Họ tên', `<input type="text" value="Minh" style="${INPUT}" autocomplete="name">`)}
${field('Email công ty', `<input type="email" placeholder="[email công ty]" style="${RO}" readonly>`)}
${field('Số điện thoại', `<input type="tel" placeholder="[số điện thoại]" style="${INPUT}" autocomplete="tel">`)}
${field('Chức vụ (từ Core)', `<input type="text" placeholder="[chức vụ]" style="${RO}" readonly>`)}
${field('Chi nhánh', `<input type="text" value="Nghi Sơn" style="${RO}" readonly>`)}
${field('Múi giờ hiển thị', `<select style="${INPUT}"><option>GMT+7 · Hà Nội</option></select>`)}
</div>
<span style="${MUTED}">Email, chức vụ và chi nhánh lấy từ Core; Admin sửa ở Quản trị.</span>
<div><button type="submit" style="${PRIMARY}">Lưu thay đổi</button></div>
</form>`)}

<div id="doi-mat-khau" style="scroll-margin-top:84px">
${card('Đổi mật khẩu', `<form style="${BODY}" data-toast-form="Đã đổi mật khẩu."><input type="text" name="username" value="Minh" autocomplete="username" hidden>
${field('Mật khẩu hiện tại', `<input type="password" style="${INPUT}" autocomplete="current-password">`)}
<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 16px">
${field('Mật khẩu mới', `<input type="password" style="${INPUT}" autocomplete="new-password">`)}
${field('Nhập lại mật khẩu mới', `<input type="password" style="${INPUT}" autocomplete="new-password">`)}
</div>
<span style="${MUTED}">Ít nhất 8 ký tự, có chữ và số.</span>
<div><button type="submit" style="${PRIMARY}">Cập nhật mật khẩu</button></div>
</form>`)}
</div>

</div>
<div style="display:flex;flex-direction:column;gap:16px;min-width:0">

${card('Quyền truy cập', `<div style="${BODY}">
<dl style="margin:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 20px">
<div><dt style="${DT}">Vai trò</dt><dd style="${DD}">PIC</dd></div>
<div><dt style="${DT}">Phạm vi dữ liệu</dt><dd style="${DD}">own</dd></div>
</dl>
<div style="display:flex;flex-direction:column">
<span style="${MUTED};margin-bottom:6px">Principal được phân công</span>
<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-top:1px solid #e9eef3"><div style="display:flex;flex-direction:column;gap:2px"><span style="font-size:14px;font-weight:500">Oldendorff Carriers</span><span style="${MUTED}">01/09/2026 → —</span></div><span style="${P_INFO}">Chính</span></div>
<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-top:1px solid #e9eef3"><div style="display:flex;flex-direction:column;gap:2px"><span style="font-size:14px;font-weight:500">Winning Shipping</span><span style="${MUTED}">01/09/2026 → —</span></div><span style="${P_INFO}">Chính</span></div>
<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-top:1px solid #e9eef3"><div style="display:flex;flex-direction:column;gap:2px"><span style="font-size:14px;font-weight:500">MAERSK</span><span style="${MUTED}">01/07/2026 → —</span></div><span style="${P_NEUTRAL}">Dự phòng</span></div>
</div>
<span style="${MUTED}">Trưởng phòng phân công principal; Admin gán vai trò và phạm vi.</span>
</div>`)}

${card('Thông báo', `<div style="padding:8px 20px 12px;display:flex;flex-direction:column;min-width:0">
${sw('n-eta', 'ETA / ETB / ETD thay đổi', 'Chuyến của tôi', true)}
${sw('n-due', 'Việc sắp đến hạn, quá hạn', 'Tính theo ETA hiện hành', true)}
${sw('n-doc', 'Chứng từ chờ xác nhận', 'Chụp từ mobile, tải lên', true)}
${sw('n-shift', 'Nhận bàn giao ca', 'Khi có người bàn giao việc cho tôi', true)}
${sw('n-mail', 'Gửi bản tóm tắt qua email', 'Đầu ca, 07:00', false)}
</div>`)}

${card('Phiên đăng nhập', `<div style="padding:8px 20px 18px;display:flex;flex-direction:column;gap:12px;min-width:0">
<div style="display:flex;flex-direction:column">
<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0"><div style="display:flex;flex-direction:column;gap:2px"><span style="font-size:14px;font-weight:500">Web · trình duyệt này</span><span style="${MUTED}">Đang dùng</span></div><span style="${P_OK}">Hiện tại</span></div>
<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-top:1px solid #e9eef3"><div style="display:flex;flex-direction:column;gap:2px"><span style="font-size:14px;font-weight:500">Mobile app</span><span style="${MUTED}">[thiết bị] · [lần cuối]</span></div></div>
</div>
<div style="display:flex;gap:8px;flex-wrap:wrap"><a href="index.html" data-logout style="${DANGER}">${LOGOUT_SVG}Đăng xuất</a><button type="button" data-logout-all style="${SECONDARY}">Đăng xuất mọi thiết bị</button></div>
</div>`)}

</div>
</div>

</main>`;

// ---------- sidebar user block ----------
const USER_RE = /<div class="nav-user" style="([^"]*)">(<div style="width:40px;height:40px;border-radius:50%[^"]*">M<\/div><div><div style="[^"]*">Minh<\/div><div style="[^"]*">[^<]*<\/div><\/div>)<\/div>/;
const userBlock = (style, inner, here) =>
  `<div class="nav-user" style="${style}"><a class="nav-user__link${here ? ' is-active' : ''}" href="TaiKhoan.html" title="Tài khoản của tôi"${here ? ' aria-current="page"' : ''}>${inner}</a><a class="nav-logout" href="index.html" data-logout aria-label="Đăng xuất" title="Đăng xuất">${LOGOUT_SVG}</a></div>`;

const APP_JS = '<script src="assets/hvs-app.js" defer></script>';

// 1) profile page from the Chỉ số shell
let tpl = fs.readFileSync('ChiSo.html', 'utf8');
tpl = tpl.replace(/<title>[^<]*<\/title>/, '<title>Tài khoản của tôi</title>');
tpl = tpl.replace(/ class="nav-link is-active" href="ChiSo.html" aria-current="page"/, ' class="nav-link" href="ChiSo.html"');
tpl = tpl.replace(/(<span style="font-weight:600;color:#0f1c29">)[^<]*(<\/span>)/, '$1Tài khoản của tôi$2');
tpl = tpl.slice(0, tpl.indexOf('<main')) + MAIN + tpl.slice(tpl.indexOf('</main>') + 7);
fs.writeFileSync('TaiKhoan.html', tpl);

// 2) every page with the sidebar
const report = [];
for (const f of fs.readdirSync('.').filter(x => x.endsWith('.html'))) {
  let s = fs.readFileSync(f, 'utf8');
  if (!s.includes('class="nav-user"')) continue;
  const m = s.match(USER_RE);
  if (m) s = s.replace(USER_RE, userBlock(m[1], m[2], f === 'TaiKhoan.html'));
  if (!s.includes('hvs-app.js')) s = s.replace('</head>', APP_JS + '\n</head>');
  fs.writeFileSync(f, s);
  report.push(`${f.padEnd(22)} user=${m ? 'ok' : 'MISS'}`);
}
console.log(report.join('\n'));
