/* HVS Agency Ops — shared shell: sidebar, topbar, toast, links to screens not built yet */
(function () {
  const ICONS = {
    calendar: '<path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="2"/>',
    tasks: '<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>',
    docs: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
    users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 3.5a4 4 0 0 1 0 7.5M22 21a7 7 0 0 0-4-6.3"/>',
    template: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    chevL: '<path d="M15 18l-6-6 6-6"/>',
    chevR: '<path d="M9 18l6-6-6-6"/>',
    chevD: '<path d="M6 9l6 6 6-6"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    ship: '<path d="M2 20c2 1 4 1 6 0s4-1 6 0 4 1 6 0"/><path d="M4 17l-1-5h18l-2 5"/><path d="M6 12V7h12v5M12 4v3"/>',
  };
  const icon = (name, attrs = '') =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${attrs}>${ICONS[name] || ''}</svg>`;

  // Screens of the prototype. built:false → link shows a toast instead of a 404.
  const SCREENS = {
    'dang-nhap':      { file: 'index.html',          built: true },
    'ke-hoach-thang': { file: 'ke-hoach-thang.html', built: true,  title: 'Kế hoạch tàu tháng' },
    'viec-cua-toi':   { file: 'viec-cua-toi.html',   built: false, title: 'Việc của tôi' },
    'chung-tu':       { file: 'chung-tu.html',       built: false, title: 'Chứng từ mọi chuyến' },
    'chi-so':         { file: 'chi-so.html',         built: false, title: 'Chỉ số quản lý' },
    'quan-tri':       { file: 'quan-tri.html',       built: false, title: 'Quản trị & phân công' },
    'mau-pda-fda':    { file: 'mau-pda-fda.html',    built: false, title: 'Mẫu PDA / FDA' },
    'tao-chuyen':     { file: 'tao-chuyen.html',     built: false, title: 'Tạo chuyến mới' },
    'chuyen':         { file: 'chuyen.html',         built: false, title: 'Chuyến' },
  };

  const NAV = [
    { label: 'Vận hành', items: [
      ['ke-hoach-thang', 'calendar'],
      ['viec-cua-toi', 'tasks', 4],
      ['chung-tu', 'docs'],
    ]},
    { label: 'Dành cho quản lý', items: [
      ['chi-so', 'chart'],
      ['quan-tri', 'users'],
      ['mau-pda-fda', 'template'],
    ]},
  ];

  const USER = { name: 'Minh', initial: 'M', role: 'PIC · Chi nhánh Nghi Sơn' };

  function href(key) { return SCREENS[key] ? SCREENS[key].file : '#'; }

  function renderShell(app) {
    const current = app.dataset.page;
    const crumb = app.dataset.crumb || (SCREENS[current] && SCREENS[current].title) || '';

    const nav = NAV.map(g => `
      <div class="nav__label">${g.label}</div>
      ${g.items.map(([key, ic, count]) => `
        <a href="${href(key)}" data-screen="${key}" ${key === current ? 'aria-current="page"' : ''}>
          ${icon(ic)}<span>${SCREENS[key].title}</span>
          ${count ? `<span class="nav__count" aria-label="${count} việc cần làm">${count}</span>` : ''}
        </a>`).join('')}
    `).join('');

    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    sidebar.setAttribute('aria-label', 'Điều hướng chính');
    sidebar.innerHTML = `
      <a class="sidebar__brand" href="${href('ke-hoach-thang')}" style="text-decoration:none">
        <img src="assets/img/hvs-logo.png" alt="HVS Group" width="150" height="30">
        <span>Agency Ops</span>
      </a>
      <nav class="nav">${nav}</nav>
      <div class="sidebar__user">
        <span class="avatar" aria-hidden="true">${USER.initial}</span>
        <div><b>${USER.name}</b><small>${USER.role}</small></div>
        <a class="icon-btn" href="index.html" aria-label="Đăng xuất" style="margin-left:auto">${icon('logout')}</a>
      </div>`;

    const main = app.querySelector('.main');
    const topbar = document.createElement('header');
    topbar.className = 'topbar';
    topbar.innerHTML = `
      <button class="icon-btn menu-btn" type="button" aria-label="Mở menu">${icon('menu')}</button>
      <div class="crumbs"><span>Agency</span>${icon('chevR', 'width="14" height="14"')}<b>${crumb}</b></div>
      <div class="topbar__right">
        <button class="icon-btn" type="button" aria-label="Thông báo, 4 mới" data-toast="4 thông báo mới: 2 chứng từ chờ xác nhận, 1 PDA chưa gửi, 1 ETA thay đổi.">
          ${icon('bell')}<span class="dot">4</span>
        </button>
      </div>`;

    app.prepend(sidebar);
    main.prepend(topbar);

    topbar.querySelector('.menu-btn').addEventListener('click', () => app.classList.toggle('nav-open'));
  }

  // toast
  function toast(msg) {
    let box = document.querySelector('.toasts');
    if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('role', 'status'); document.body.append(box); }
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    box.append(t);
    setTimeout(() => t.remove(), 3200);
  }

  // Links to screens not built yet + [data-toast] buttons
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-screen], [data-toast]');
    if (!el) return;
    if (el.dataset.toast) { e.preventDefault(); toast(el.dataset.toast); return; }
    const s = SCREENS[el.dataset.screen];
    if (s && !s.built) {
      e.preventDefault();
      toast(`${el.dataset.label || s.title} — màn này sẽ dựng ở bước tiếp theo.`);
    }
  });

  window.HVS = { icon, toast, href, SCREENS };

  document.addEventListener('DOMContentLoaded', () => {
    const app = document.querySelector('.app[data-page]');
    if (app) renderShell(app);
    document.querySelectorAll('[data-icon]').forEach(el => { el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon)); });
  });
})();
