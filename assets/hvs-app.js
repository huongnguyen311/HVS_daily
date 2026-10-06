/* HVS Agency Ops — shared prototype behaviour.
   Declarative hooks (add attributes in the HTML, no per-page script):
     data-confirm="Tiêu đề"          confirm dialog before an <a>/<button>; also data-confirm-body, data-confirm-ok,
                                      data-confirm-tone="danger" (red OK button), data-done="toast after OK"
     data-logout                     logout confirm (href = where to go)
     <form data-validate>            inline validation of required/minlength/pattern/data-match fields;
                                      on success: data-next="page.html" navigates, else data-done / data-toast-form toasts
     aria-disabled="true" + data-disabled-reason="…"   blocks the click and explains why
     data-toast="…"                  prototype stand-in: shows the message instead of navigating
     [role=tablist][data-tabs]       tabs: [role=tab][aria-controls] ↔ [role=tabpanel]; arrow keys; class .hvs-tab styles
     data-ack / data-requires-ack    checkbox gate; data-reject  reject-with-reason dialog */
(function () {
  function toast(msg) {
    let box = document.querySelector('.hvs-toasts');
    if (!box) {
      box = document.createElement('div');
      box.className = 'hvs-toasts';
      box.setAttribute('role', 'status');
      document.body.append(box);
    }
    const t = document.createElement('div');
    t.className = 'hvs-toast';
    t.textContent = msg;
    box.append(t);
    setTimeout(() => t.remove(), 3200);
  }

  // Toast that survives a page change (shown on the next page).
  function toastNext(msg) {
    try { sessionStorage.setItem('hvs-toast', msg); } catch (e) { /* storage blocked: skip */ }
  }
  try {
    const pending = sessionStorage.getItem('hvs-toast');
    if (pending) { sessionStorage.removeItem('hvs-toast'); toast(pending); }
  } catch (e) { /* storage blocked: skip */ }

  function go(href, doneMsg) {
    if (doneMsg) toastNext(doneMsg);
    location.href = href;
  }

  // ---------- confirm dialog (shared by data-confirm and data-logout) ----------
  let cdlg;
  function confirmDialog({ title, body, ok = 'Đồng ý', tone }, onOk) {
    if (!cdlg) {
      cdlg = document.createElement('dialog');
      cdlg.className = 'hvs-dialog';
      cdlg.setAttribute('aria-labelledby', 'hvs-confirm-title');
      cdlg.innerHTML = `
        <form method="dialog">
          <h2 id="hvs-confirm-title"></h2>
          <p></p>
          <div class="hvs-dialog__actions">
            <button value="cancel" class="hvs-btn" autofocus>Huỷ</button>
            <button value="ok" class="hvs-btn"></button>
          </div>
        </form>`;
      document.body.append(cdlg);
      cdlg.addEventListener('click', e => { if (e.target === cdlg) cdlg.close('cancel'); });
    }
    cdlg.querySelector('h2').textContent = title;
    const p = cdlg.querySelector('p');
    p.textContent = body || '';
    p.hidden = !body;
    const okBtn = cdlg.querySelector('button[value="ok"]');
    okBtn.textContent = ok;
    okBtn.className = 'hvs-btn ' + (tone === 'danger' ? 'hvs-btn--danger' : 'hvs-btn--primary');
    cdlg.onclose = () => { if (cdlg.returnValue === 'ok') onOk(); };
    cdlg.returnValue = '';
    cdlg.showModal();
  }

  // ---------- inline form validation ----------
  function fieldMessage(el) {
    const v = el.validity;
    if (v.valueMissing) {
      if (el.type === 'radio') return 'Hãy chọn một mục.';
      return el.tagName === 'SELECT' ? 'Hãy chọn một mục.' : 'Bắt buộc nhập.';
    }
    if (v.tooShort) return `Tối thiểu ${el.minLength} ký tự.`;
    if (v.patternMismatch || v.typeMismatch) return el.dataset.errorMsg || el.title || 'Sai định dạng.';
    if (v.customError) return el.validationMessage;
    return '';
  }
  function errorHost(el) {
    return el.closest('fieldset') && el.type === 'radio' ? el.closest('fieldset') : (el.closest('label') || el.parentElement);
  }
  function setError(el, msg) {
    const host = errorHost(el);
    const id = (el.id || el.name || 'f') + '-err';
    let span = host.querySelector(':scope > .field-error');
    if (!msg) {
      span?.remove();
      el.removeAttribute('aria-invalid');
      return;
    }
    if (!span) {
      span = document.createElement('span');
      span.className = 'field-error';
      span.id = id + '-' + Math.random().toString(36).slice(2, 6);
      host.append(span);
    }
    span.textContent = msg;
    el.setAttribute('aria-invalid', 'true');
    el.setAttribute('aria-describedby', [el.getAttribute('aria-describedby'), span.id].filter(Boolean).join(' '));
  }
  function validate(form) {
    let first = null;
    form.querySelectorAll('input, select, textarea').forEach(el => {
      if (el.dataset.match) {
        const other = form.querySelector(el.dataset.match);
        el.setCustomValidity(other && el.value && other.value !== el.value ? 'Không khớp với ô phía trên.' : '');
      }
      const msg = el.willValidate ? fieldMessage(el) : '';
      setError(el, msg);
      if (msg && !first) first = el;
    });
    if (first) first.focus();
    return !first;
  }
  document.querySelectorAll('form[data-validate]').forEach(f => f.setAttribute('novalidate', ''));
  document.addEventListener('input', e => {
    const el = e.target;
    if (el.getAttribute && el.getAttribute('aria-invalid') === 'true') {
      if (el.dataset.match) el.setCustomValidity('');
      if (!fieldMessage(el)) setError(el, '');
    }
  });
  document.addEventListener('change', e => {
    const el = e.target;
    if (el.type === 'radio' && el.closest('form[data-validate]')) {
      el.closest('form').querySelectorAll(`[name="${el.name}"]`).forEach(r => setError(r, ''));
    }
  });

  document.addEventListener('submit', e => {
    const f = e.target;
    if (f.matches('[data-validate]')) {
      if (!validate(f)) { e.preventDefault(); return; }
    }
    if (f.matches('[data-validate], [data-toast-form]') && f.method !== 'dialog') {
      e.preventDefault();
      const done = f.dataset.done || f.dataset.toastForm;
      if (f.dataset.next) { go(f.dataset.next, done); return; }
      if (done) toast(done);
    }
  });

  // ---------- click hooks ----------
  document.addEventListener('click', e => {
    // disabled with a reason
    const dis = e.target.closest('[aria-disabled="true"]');
    if (dis) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (dis.dataset.requiresAck) {
        document.querySelector(`[data-ack="${dis.dataset.requiresAck}"]`)?.focus();
        toast('Hãy so các ô có cảnh báo với bản gốc rồi tick xác nhận.');
      } else if (dis.dataset.disabledReason) {
        toast(dis.dataset.disabledReason);
      }
      return;
    }

    const out = e.target.closest('[data-logout]');
    if (out) {
      e.preventDefault();
      const href = out.getAttribute('href') || 'index.html';
      confirmDialog({ title: 'Đăng xuất?', body: 'Bạn cần đăng nhập lại để tiếp tục làm việc. Dữ liệu đã lưu không bị ảnh hưởng.', ok: 'Đăng xuất', tone: 'danger' },
        () => { location.href = href; });
      return;
    }

    const c = e.target.closest('[data-confirm]');
    if (c) {
      e.preventDefault();
      const d = c.dataset;
      confirmDialog({ title: d.confirm, body: d.confirmBody, ok: d.confirmOk, tone: d.confirmTone }, () => {
        const href = c.getAttribute('href');
        if (href && href !== '#') go(href, d.done);
        else if (c.form && c.type === 'submit') c.form.requestSubmit();
        else if (d.done) toast(d.done);
      });
      return;
    }

    const t = e.target.closest('[data-toast]');
    if (t) { e.preventDefault(); toast(t.dataset.toast); return; }

    if (e.target.closest('[data-reject]')) confirmReject();
  });

  document.addEventListener('change', e => {
    if (e.target.matches('.switch')) toast('Đã lưu cài đặt thông báo.');
    if (e.target.matches('[data-ack]')) syncAck(e.target.dataset.ack);
  });

  // ---------- tabs ----------
  document.querySelectorAll('[role="tablist"][data-tabs]').forEach(list => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const select = (tab, focus) => {
      tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    };
    select(tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0], false);
    list.addEventListener('click', e => {
      const tab = e.target.closest('[role="tab"]');
      if (tab && tabs.includes(tab)) select(tab, false);
    });
    list.addEventListener('keydown', e => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      select(tabs[(next + tabs.length) % tabs.length], true);
    });
  });

  // ---------- mobile drawer: below 760px the sidebar is off-canvas, opened from the top bar ----------
  const side = document.querySelector('.shell > .side');
  const bar = document.querySelector('.topbar');
  if (side && bar) {
    side.id = side.id || 'hvs-side';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-toggle';
    btn.setAttribute('aria-controls', side.id);
    btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
    bar.prepend(btn);
    const scrim = document.createElement('div');
    scrim.className = 'nav-scrim';
    document.body.append(scrim);

    const setNav = open => {
      document.documentElement.classList.toggle('nav-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
      if (open) side.querySelector('a')?.focus();
    };
    setNav(false);
    btn.addEventListener('click', () => setNav(!document.documentElement.classList.contains('nav-open')));
    scrim.addEventListener('click', () => setNav(false));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && document.documentElement.classList.contains('nav-open')) { setNav(false); btn.focus(); }
    });
    matchMedia('(min-width: 760px)').addEventListener('change', e => { if (e.matches) setNav(false); });

    // bell: notifications live on "Việc của tôi"
    const bell = bar.querySelector('button[aria-label^="Thông báo"]');
    bell?.addEventListener('click', () => { location.href = 'Main.html#thong-bao'; });
  }

  // ---------- acknowledge gate: [data-requires-ack="x"] stays disabled until [data-ack="x"] is ticked ----------
  function syncAck(key) {
    const box = document.querySelector(`[data-ack="${key}"]`);
    document.querySelectorAll(`[data-requires-ack="${key}"]`).forEach(el => {
      el.setAttribute('aria-disabled', String(!box.checked));
    });
  }
  document.querySelectorAll('[data-ack]').forEach(b => syncAck(b.dataset.ack));

  // ---------- reject a document: a reason is required so the uploader knows what to redo ----------
  let rej;
  function confirmReject() {
    if (!rej) {
      rej = document.createElement('dialog');
      rej.className = 'hvs-dialog';
      rej.setAttribute('aria-labelledby', 'hvs-reject-title');
      rej.innerHTML = `
        <form method="dialog">
          <h2 id="hvs-reject-title">Từ chối chứng từ?</h2>
          <p>Người tải lên sẽ nhận thông báo kèm lý do để chụp hoặc tải lại.</p>
          <fieldset>
            <legend>Lý do <span class="req" aria-hidden="true">*</span></legend>
            <label class="opt"><input type="radio" name="reason" value="Ảnh mờ, không đọc được" required>Ảnh mờ, không đọc được</label>
            <label class="opt"><input type="radio" name="reason" value="Thiếu trang">Thiếu trang</label>
            <label class="opt"><input type="radio" name="reason" value="Sai chuyến">Sai chuyến</label>
            <label class="opt"><input type="radio" name="reason" value="Trùng chứng từ đã ghi sổ">Trùng chứng từ đã ghi sổ</label>
            <label class="opt"><input type="radio" name="reason" value="Khác">Khác</label>
          </fieldset>
          <label class="field">Ghi chú cho người tải lên<textarea name="note" placeholder="VD: chụp lại trang 2, thấy rõ dòng tổng tiền"></textarea></label>
          <div class="hvs-dialog__actions">
            <button value="cancel" class="hvs-btn" formnovalidate autofocus>Huỷ</button>
            <button value="ok" class="hvs-btn hvs-btn--danger">Từ chối</button>
          </div>
        </form>`;
      document.body.append(rej);
      const note = rej.querySelector('textarea');
      rej.addEventListener('change', e => {
        if (e.target.name === 'reason') note.required = e.target.value === 'Khác';
      });
      rej.addEventListener('click', e => { if (e.target === rej) rej.close('cancel'); });
      rej.onclose = () => {
        if (rej.returnValue === 'ok') toast('Đã từ chối — đã gửi lý do cho người tải lên.');
        rej.querySelector('form').reset();
        note.required = false;
      };
    }
    rej.returnValue = '';
    rej.showModal();
  }
})();
