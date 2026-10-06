/* A · Kế hoạch tàu tháng — data from the wireframe "HVS Đại lý – Wireframe" (09/2026, Liner) */
(function () {
  // [carrier, service, vessel, voyage, startDay, days]
  const PLAN = {
    '2026-09': {
      liner: [
        { loc: 'Vũng Tàu – Cái Mép', term: 'TCIT B1,2', pic: 'Sơn', trip: 'Lan', board: 'Hoàng', ships: [
          ['ONE','FE5','ONE MEISHAN','0022W',5,2], ['ONE','FE5','ONE MANCHESTER','0037W',12,2], ['ONE','PS3','ONE HANGZHOU BAY','0052E',15,2],
          ['ONE','EC4','ONE MADRID','0021E',19,2], ['ONE','PS7','ONE AQUILA','0022E',21,2], ['ONE','EC5','ONE GRUS','0022E',23,2], ['ONE','PS3','CONTI CONTESSA','0115E',28,2] ]},
        { loc: 'Vũng Tàu – Cái Mép', term: 'TCIT B3', pic: 'Sơn', trip: 'Lan', board: 'Hoàng', ships: [
          ['ONE','EC5','ONE OWL','0024E',2,2], ['ONE','PS3','CONTI CRYSTAL','0133E',4,2], ['ONE','EC5','ONE SWAN','0025E',9,2], ['ONE','PS3','ONE COMMITMENT','0061E',11,2],
          ['ONE','EC5','ONE FALCON','0024E',15,2], ['ONE','FE5','ONE MACKINAC','0036W',17,2], ['ONE','PN2','SEASPAN BENEFACTOR','0067E',21,2], ['ONE','PS3','MOL CREATION','0089E',23,2],
          ['ONE','EC4','ONE MONACO','0022E',25,2], ['ONE','FE5','ONE MANHATTAN','0034E',28,2] ]},
        { loc: 'Vũng Tàu – Cái Mép', term: 'CMIT', pic: 'Quang', trip: 'Lan', board: 'Vx. Cương', ships: [] },
        { loc: 'Vũng Tàu – Cái Mép', term: 'TCTT', pic: 'Quang', trip: 'Lan', board: 'Vx. Cương', ships: [
          ['COSCO','AWES','COSCO SANTOS','078E',1,2], ['COSCO','AWES','COSCO JEDDAH','074E',9,2], ['COSCO','AWE4','COSCO FAITH','064W',11,1], ['COSCO','AAC','BEIJING','099E',12,1],
          ['COSCO','SEA','COSCO SHIPPING PEONY','024W',13,2], ['COSCO','SEA','COSCO SHIPPING DENALI','033W',21,1], ['COSCO','AAC','CSCL EAST CHINA SEA','059E',22,2],
          ['COSCO','SEA','COSCO SHIPPING JASMINE','024W',28,1], ['COSCO','AAC','CSCL SOUTH CHINA SEA','064E',29,2] ]},
        { loc: 'Vũng Tàu – Cái Mép', term: 'GEMALINK', pic: 'Quang', trip: 'Lan', board: 'Vx. Cương', ships: [ ['COSCO','AEU7','CSCL PACIFIC OCEAN','053W',8,2] ]},
        { loc: 'Vũng Tàu – Cái Mép', term: 'CMIT', pic: 'Thành', trip: 'Lan', board: 'Hoàng, Vx. Cương', ships: [] },
        { loc: 'Vũng Tàu – Cái Mép', term: 'GERMALINK', pic: 'Thành', trip: 'Lan', board: 'Vx. Cương', ships: [] },
        { loc: 'Vũng Tàu – Cái Mép', term: 'TCIT', pic: 'Thành', trip: 'Lan', board: 'Vx. Cương', ships: [] },
        { loc: 'Vũng Tàu – Cái Mép', term: 'SPCT', pic: 'Thành', trip: 'Lan', board: 'Quang', ships: [
          ['MOL','—','JUPITER SPIRIT','0072A',2,2], ['MOL','—','SANDERLING ACE','0111A',10,2] ]},
        { loc: 'Vũng Tàu – Cái Mép', term: 'SP-ITC', pic: 'Quang', trip: 'Lan', board: 'Thịnh', ships: [
          ['BENLINE','—','MOERSBY CHIEF','2305W',7,2], ['BENLINE','—','HONIARA CHIEF','2306W',23,2] ]},
        { loc: 'Vũng Tàu – Cái Mép', term: 'GERMALINK', pic: 'Thành', trip: 'Lan', board: 'Cương', ships: [] },
        { loc: 'Vũng Tàu – Cái Mép', term: 'SSIT', pic: 'Thành', trip: 'Lan', board: '—', ships: [] },
        { loc: 'Vũng Tàu – Cái Mép', term: 'CMIT', pic: 'Thành', trip: 'Lan', board: 'Cường', ships: [] },
        { loc: 'Hải Phòng', term: 'TC-HICT', pic: 'Thành', trip: 'Lan', board: 'Tiến', ships: [] },
      ],
      nonliner: [],
    },
  };
  const CARRIERS = ['ONE', 'COSCO', 'MAERSK', 'MOL', 'BENLINE'];
  const WD = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const state = { y: 2026, m: 9, tab: 'liner', q: '', pic: '', off: new Set(), collapsed: new Set() };

  const $ = s => document.querySelector(s);
  const pad = n => String(n).padStart(2, '0');
  const key = () => `${state.y}-${pad(state.m)}`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function rows() { return (PLAN[key()] || { liner: [], nonliner: [] })[state.tab]; }

  function render() {
    const daysIn = new Date(state.y, state.m, 0).getDate();
    $('#monthLabel').textContent = `Tháng ${pad(state.m)}/${state.y}`;

    const all = PLAN[key()] || { liner: [], nonliner: [] };
    const count = list => list.reduce((n, r) => n + r.ships.length, 0);
    $('#cntLiner').textContent = count(all.liner);
    $('#cntNon').textContent = count(all.nonliner);

    const data = rows();
    const wrap = $('#gridWrap');
    const empty = $('#empty');
    if (!data.length) {
      wrap.hidden = true; empty.hidden = false;
      $('#emptyTitle').textContent = state.tab === 'liner'
        ? `Chưa có kế hoạch Liner cho tháng ${pad(state.m)}/${state.y}`
        : `Chưa có lượt tàu Non-Liner trong tháng ${pad(state.m)}/${state.y}`;
      $('#summary').textContent = '';
      return;
    }
    wrap.hidden = false; empty.hidden = true;

    // header
    let head = '<tr><th class="col-term" scope="col">Cảng / terminal</th>';
    for (let d = 1; d <= daysIn; d++) {
      const wd = new Date(state.y, state.m - 1, d).getDay();
      head += `<th scope="col" class="day${wd === 0 ? ' is-sun' : ''}"><span class="num">${pad(d)}</span><small>${WD[wd]}</small></th>`;
    }
    head += '</tr>';

    // body, grouped by location
    const q = state.q.trim().toUpperCase();
    let body = '', shown = 0, matched = 0, terms = 0;
    const groups = [];
    data.forEach(r => { let g = groups.find(x => x.loc === r.loc); if (!g) groups.push(g = { loc: r.loc, rows: [] }); g.rows.push(r); });

    groups.forEach((g, gi) => {
      const gRows = g.rows.filter(r => !state.pic || r.pic === state.pic);
      if (!gRows.length) return;
      const n = gRows.reduce((a, r) => a + r.ships.length, 0);
      const closed = state.collapsed.has(g.loc);
      body += `<tr class="grp"><th colspan="${daysIn + 1}" scope="rowgroup">
        <button type="button" class="grp__btn" data-grp="${esc(g.loc)}" aria-expanded="${!closed}">
          ${HVS.icon('chevD')}<span>${esc(g.loc)}</span><small>${gRows.length} terminal · ${n} lượt tàu</small>
        </button></th></tr>`;
      if (closed) return;

      gRows.forEach(r => {
        terms++;
        body += `<tr><th scope="row" class="col-term">
          <span class="term mono">${esc(r.term)}</span>
          <span class="who"><span><i>PIC</i>${esc(r.pic)}</span><span><i>Trip</i>${esc(r.trip)}</span><span><i>Boarding</i>${esc(r.board)}</span></span>
        </th>`;
        const ships = r.ships.slice().sort((a, b) => a[4] - b[4]);
        let d = 1;
        while (d <= daysIn) {
          const s = ships.find(x => x[4] === d);
          if (s) {
            const [car, svc, name, voy, start, len] = s;
            const span = Math.min(len, daysIn - start + 1);
            const hit = !q || name.includes(q) || voy.toUpperCase().includes(q) || svc.toUpperCase().includes(q);
            const off = state.off.has(car);
            if (!off) shown++;
            if (q && hit && !off) matched++;
            const eta = `${pad(start)}/${pad(state.m)}`, etd = `${pad(start + len - 1)}/${pad(state.m)}`;
            body += `<td colspan="${span}" class="cell${sunIn(start, span) ? ' has-sun' : ''}">
              <a href="chuyen.html" class="ship carrier-${car}${off ? ' is-off' : ''}${q && !hit ? ' is-dim' : ''}${q && hit ? ' is-hit' : ''}"
                 data-screen="chuyen" data-label="Chuyến ${esc(name)} ${esc(voy)}"
                 data-tip='${esc(JSON.stringify({ car, svc, name, voy, eta, etd, term: r.term, pic: r.pic, board: r.board }))}'
                 aria-label="${esc(name)} chuyến ${esc(voy)}, ETA ${eta}, ETD ${etd}">
                <span class="ship__svc mono">${svc === '—' ? car : esc(svc)}</span>
                <span class="ship__name">${esc(name)}</span>
                <span class="ship__voy mono">${esc(voy)}</span>
              </a></td>`;
            d += span;
          } else {
            const wd = new Date(state.y, state.m - 1, d).getDay();
            body += `<td class="cell${wd === 0 ? ' is-sun' : ''}"></td>`;
            d++;
          }
        }
        body += '</tr>';
      });
    });

    const grid = $('#grid');
    const termW = matchMedia('(max-width: 960px)').matches ? 168 : 236;
    grid.style.width = (termW + daysIn * 54) + 'px';
    grid.innerHTML = `<thead>${head}</thead><tbody>${body}</tbody>`;
    $('#summary').textContent = q
      ? `${matched} tàu khớp “${state.q.trim()}”`
      : `${shown} lượt tàu · ${terms} terminal`;
  }

  function sunIn(start, span) {
    for (let d = start; d < start + span; d++) if (new Date(state.y, state.m - 1, d).getDay() === 0) return true;
    return false;
  }

  // ---------- tooltip ----------
  const tip = document.createElement('div');
  tip.className = 'tip';
  tip.setAttribute('role', 'tooltip');
  document.body.append(tip);
  function showTip(a) {
    const t = JSON.parse(a.dataset.tip);
    tip.innerHTML = `<b>${esc(t.name)} · ${esc(t.voy)}</b>
      <span>${esc(t.car)}${t.svc !== '—' ? ' · ' + esc(t.svc) : ''}</span>
      <dl><dt>ETA</dt><dd>${t.eta}</dd><dt>ETD</dt><dd>${t.etd}</dd>
      <dt>Terminal</dt><dd>${esc(t.term)}</dd><dt>PIC</dt><dd>${esc(t.pic)}</dd><dt>Boarding</dt><dd>${esc(t.board)}</dd></dl>`;
    const r = a.getBoundingClientRect();
    const w = 240;
    let x = Math.min(r.left, innerWidth - w - 12);
    let y = r.bottom + 8;
    tip.style.left = Math.max(12, x) + 'px';
    tip.style.top = y + 'px';
    tip.classList.add('is-on');
    const h = tip.offsetHeight;
    if (y + h > innerHeight - 12) tip.style.top = (r.top - h - 8) + 'px';
  }
  const hideTip = () => tip.classList.remove('is-on');

  // ---------- events ----------
  function bind() {
    const grid = $('#grid');
    grid.addEventListener('mouseover', e => { const a = e.target.closest('.ship'); if (a) showTip(a); });
    grid.addEventListener('mouseout', e => { if (e.target.closest('.ship')) hideTip(); });
    grid.addEventListener('focusin', e => { const a = e.target.closest('.ship'); if (a) showTip(a); });
    grid.addEventListener('focusout', hideTip);
    $('#gridWrap').addEventListener('scroll', hideTip, { passive: true });
    grid.addEventListener('click', e => {
      const b = e.target.closest('[data-grp]');
      if (!b) return;
      const g = b.dataset.grp;
      state.collapsed.has(g) ? state.collapsed.delete(g) : state.collapsed.add(g);
      render();
    });

    document.querySelectorAll('[role="tab"][data-tab]').forEach(btn => btn.addEventListener('click', () => {
      state.tab = btn.dataset.tab;
      document.querySelectorAll('[role="tab"][data-tab]').forEach(b => b.setAttribute('aria-selected', String(b === btn)));
      render();
    }));

    $('#prev').addEventListener('click', () => { state.m--; if (state.m < 1) { state.m = 12; state.y--; } render(); });
    $('#next').addEventListener('click', () => { state.m++; if (state.m > 12) { state.m = 1; state.y++; } render(); });
    $('#q').addEventListener('input', e => { state.q = e.target.value; render(); });
    $('#pic').addEventListener('change', e => { state.pic = e.target.value; render(); });

    $('#legend').innerHTML = CARRIERS.map(c =>
      `<button type="button" class="legend-chip carrier-${c}" aria-pressed="true" data-car="${c}"><i></i>${c}</button>`).join('');
    $('#legend').addEventListener('click', e => {
      const b = e.target.closest('[data-car]');
      if (!b) return;
      const on = b.getAttribute('aria-pressed') === 'true';
      b.setAttribute('aria-pressed', String(!on));
      on ? state.off.add(b.dataset.car) : state.off.delete(b.dataset.car);
      render();
    });
  }

  document.addEventListener('DOMContentLoaded', () => { bind(); render(); });
})();
