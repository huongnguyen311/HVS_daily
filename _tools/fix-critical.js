// One-off: fixes the 4 critical review findings (OCR values, PDA VAT, trip data consistency, reject reason).
// Every replacement asserts its match count so a drifted file fails loudly instead of silently.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const pending = [];
function edit(file, steps) {
  const p = path.join(root, file);
  const staged = pending.find(e => e[0] === p);
  let s = staged ? staged[1] : fs.readFileSync(p, 'utf8');
  for (const [from, to, count = 1] of steps) {
    const re = from instanceof RegExp ? new RegExp(from.source, from.flags.includes('g') ? from.flags : from.flags + 'g')
                                      : new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const n = (s.match(re) || []).length;
    if (n !== count) throw new Error(`${file}: expected ${count} match(es) for ${from}, found ${n}`);
    s = s.replace(re, to);
  }
  if (staged) staged[1] = s; else pending.push([p, s]);
  console.log('ok', file, steps.length, 'edits');
}

const hint = 'font-weight:400;font-size:13px;color:#4D6278';

// 1 + 4 — OCR values are real values, low-confidence field is gated, reject asks for a reason
edit('XacNhanChungTu.html', [
  ['placeholder="CV-2026-09-118" style=', 'value="CV-2026-09-118" data-ocr style='],
  ['placeholder="09/09/2026" style=', 'value="09/09/2026" data-ocr style='],
  ['placeholder="Cảng vụ HH Thanh Hoá" style=', 'value="Cảng vụ HH Thanh Hoá" data-ocr style='],
  ['placeholder="[MST]" style=', 'placeholder="OCR chưa đọc được — nhập tay" style='],
  ['placeholder="42,500,000" style=', 'value="42,500,000" data-ocr="low" aria-describedby="ocr-warn-total" style='],
  [`<span style="${hint}">⚠ Độ tin cậy thấp — kiểm lại</span>`,
   '<span id="ocr-warn-total" class="ocr-warn">⚠ Độ tin cậy thấp — so lại với bản gốc</span>'],
  ['color:#9a5b00">1 cảnh báo</span></div>',
   'color:#9a5b00">1 cảnh báo</span></div><span class="ocr-legend"><i aria-hidden="true"></i>Nền xanh: OCR đã điền, sửa trực tiếp nếu sai</span>'],
  [/(<button type="button") (style="[^"]*">Từ chối<\/button>)/, '$1 data-reject $2'],
  [/(<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">)(<button type="button" data-reject)/,
   '<label class="ocr-ack"><input type="checkbox" data-ack="ghiso">Tôi đã so các ô có cảnh báo với bản gốc</label>$1$2'],
  ['<a href="TripLedger.html" style=', '<a href="TripLedger.html" data-requires-ack="ghiso" style='],
]);

edit('XacNhanTaiLen.html', [
  ['placeholder="Cảng vụ HH Thanh Hoá"', 'placeholder="VD: Cảng vụ HH Thanh Hoá"'],
  ['>MV SEA PIONEER</dd>', '>MV OLDENDORFF TRADER</dd>'],
]);

// 3 — the PDA tab of the OLDENDORFF trip now shows the OLDENDORFF trip (before arrival), like LapFDA does after departure
edit('LapPDA.html', [
  ['NS2PC-2611', 'NS2PC-2609', 2],
  ['MV SEA PIONEER', 'MV OLDENDORFF TRADER'],
  ['Winning Shipping', 'Oldendorff Carriers', 3],
  ['>38,000 MT · dỡ<', '>Than (Coal) 45,000 MT · dỡ<'],
  ['>11/09 06:00 · nguồn Master<', '>08/09 06:00 · nguồn Master<'],
  ['10/09 21:50 · Minh', '06/09 21:50 · Minh'],
  ['08/09 15:20 · Minh', '05/09 15:20 · Minh'],
  [/(<div role="tablist")/,
   '<div style="padding:10px 14px;border-radius:8px;font-size:14px;background:#fff;border:1px solid #e2e8f0;color:#4D6278">Ví dụ cùng chuyến ở thời điểm trước khi tàu đến (ETA 08/09), PDA đã gửi version 2.</div>$1'],
  // 2 — VAT 8% on the agency fee: $1,250.00 → +$100.00
  ['<tr><td>Sub total</td><td>72,200,000</td><td>1,250.00</td></tr><tr><td>Grand total</td><td><b>72,200,000</b></td><td><b>1,250.00</b></td></tr>',
   '<tr><td>Sub total</td><td>72,200,000</td><td>1,250.00</td></tr><tr><td>VAT</td><td>—</td><td>100.00</td></tr><tr><td>Grand total</td><td><b>72,200,000</b></td><td><b>1,350.00</b></td></tr>'],
  ['<tr><td>Balance due</td><td><b>72,200,000</b></td><td><b>1,250.00</b></td></tr>',
   '<tr><td>Balance due</td><td><b>72,200,000</b></td><td><b>1,350.00</b></td></tr>'],
  ['Chưa gồm Freight Tax. Không cộng gộp hai loại tiền.',
   'Chưa gồm Freight Tax. VAT VND tính khi các dòng có %VAT. Crew change chưa định giá, chưa tính vào tổng. Không cộng gộp hai loại tiền.'],
]);

edit('ThemDichVu.html', [
  ['MV SEA PIONEER · <span class="mono">NS2PC-2611</span>', 'MV OLDENDORFF TRADER · <span class="mono">NS2PC-2609</span>'],
]);

// payer: one value for the trip everywhere (matches the PDA payer tabs)
for (const f of ['ChuyenTongQuan.html', 'LapFDA.html', 'DichVu.html', 'TripLedger.html']) {
  edit(f, [[/(>Bên trả<\/dt><dd[^>]*>)Oldendorff Carriers/, '$1NS2 · OCVN']]);
}

edit('ChuyenTongQuan.html', [
  ['>Bản 1 · Nháp<', '>Version 2 · Đã gửi<'],
  ['>Chưa gửi</dd>', '>06/09 21:50 · Minh</dd>'],
  ['72,200,000 đ<br>$1,250.00', '72,200,000 đ<br>$1,350.00', 2],
  // ledger: 7 lines need an invoice (khối 1 ×5, khối 2, khối 3); khối 2 and 3 are still missing
  ['>5 / 6 dòng trip<', '>5 / 7 dòng cần HĐ<'],
  ['>1 hoá đơn<', '>2 hoá đơn<'],
]);

edit('TripLedger.html', [
  ['<td>Haivanship</td><td>—</td><td>$1,250.00</td>', '<td>Haivanship</td><td>—</td><td>$1,350.00</td>'],
  ['Tổng USD: <b>$1,250.00</b>', 'Tổng USD: <b>$1,350.00</b>'],
]);

edit('LapFDA.html', [
  ['>Tổng PDA</dt><dd style="margin:0;font-size:14px;font-weight:500">$4,094.75<', '>Tổng PDA</dt><dd style="margin:0;font-size:14px;font-weight:500">$4,194.75<'],
  [/(>Tổng thực tế<\/dt><dd[^>]*>)\$4,197\.20/, '$1$4,297.20'],
  ['<tr><td>Đại lý phí</td><td>$1,250.00</td><td>$1,250.00</td><td>$0.00</td><td>—</td><td>$1,250.00</td></tr>',
   '<tr><td>Đại lý phí</td><td>$1,250.00</td><td>$1,250.00</td><td>$0.00</td><td>—</td><td>$1,250.00</td></tr><tr><td>VAT đại lý phí (8%)</td><td>$100.00</td><td>$100.00</td><td>$0.00</td><td>—</td><td>$100.00</td></tr>'],
  ['<tr><td>Đại lý phí</td><td>$1,250.00</td></tr><tr><td>Grand total</td><td><b>$4,197.20</b></td>',
   '<tr><td>Đại lý phí</td><td>$1,250.00</td></tr><tr><td>VAT đại lý phí (8%)</td><td>$100.00</td></tr><tr><td>Grand total</td><td><b>$4,297.20</b></td>'],
  ['<td>Balance due</td><td><b>$3,197.20</b></td>', '<td>Balance due</td><td><b>$3,297.20</b></td>'],
]);

const c = 'padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:13px';
edit('XemTruocFDA.html', [
  [`$1,250.00</td></tr></tbody></table>`,
   `$1,250.00</td></tr><tr><td style="${c}">7</td><td style="${c}">VAT đại lý phí (8%)</td><td style="${c}"><span class="mono">—</span></td><td style="${c};text-align:right">$100.00</td><td style="${c};text-align:right">$100.00</td></tr></tbody></table>`],
  ['<span>Grand total</span><b>$4,197.20</b>', '<span>Grand total</span><b>$4,297.20</b>'],
  ['Balance due</span><b>$3,197.20</b>', 'Balance due</span><b>$3,297.20</b>'],
]);

edit('KeHoachThang.html', [
  ['Liner · 29 lượt tàu', 'Liner · 31 lượt tàu'],
  ['<span style="display:inline-flex;align-items:center;gap:6px"><span style="width:14px;height:14px;border-radius:4px;background:#ccfbf1;border:1px solid #5eead4"></span>MAERSK</span>', ''],
]);

// write only after every file matched
for (const [p, s] of pending) fs.writeFileSync(p, s);
console.log('written', pending.length, 'files');
