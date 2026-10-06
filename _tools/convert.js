// Convert canvas .dc.html artboards to standalone HTML pages, content unchanged.
const fs = require('fs'), path = require('path');
const SRC = process.argv[2], OUT = process.argv[3];
const canvas = JSON.parse(fs.readFileSync(path.join(SRC, 'canvas.json'), 'utf8'));

const outName = f => f.replace(/\.dc\.html$/, '.html');
const report = [];

for (const file of canvas.order) {
  let s = fs.readFileSync(path.join(SRC, file), 'utf8');
  const title = (s.match(/<title>([\s\S]*?)<\/title>/) || [, ''])[1];
  const lang = (s.match(/<html lang="([^"]+)"/) || [, 'vi'])[1];
  const xdc = s.match(/<x-dc>([\s\S]*)<\/x-dc>/)[1];
  const helmet = (xdc.match(/<helmet>([\s\S]*?)<\/helmet>/) || [, ''])[1].trim();
  let body = xdc.replace(/<helmet>[\s\S]*?<\/helmet>/, '').trim();
  const props = JSON.parse((s.match(/data-props='([^']*)'/) || [, '{}'])[1]);
  const pv = props.$preview || {};

  // links between artboards
  body = body.replace(/href="([A-Za-z0-9_]+)\.dc\.html"/g, (m, stem) => `href="${stem}.html"`);

  // TripLedger: <sc-if> panes + onClick tab switch → plain JS
  let extraHead = '', extraBody = '';
  if (/<sc-if/.test(body)) {
    body = body
      .replace(/<sc-if value="\{\{isTrip\}\}"[^>]*>/g, '<div class="dc-pane" data-pane="trip">')
      .replace(/<sc-if value="\{\{isCash\}\}"[^>]*>/g, '<div class="dc-pane" data-pane="cash" hidden>')
      .replace(/<\/sc-if>/g, '</div>')
      .replace(/onClick="\{\{showTrip\}\}"/g, 'data-set-tab="trip"')
      .replace(/onClick="\{\{showCash\}\}"/g, 'data-set-tab="cash"');
    extraHead = '<style>.dc-pane{display:contents}.dc-pane[hidden]{display:none}</style>';
    extraBody = `<script>
document.addEventListener('click', function (e) {
  var b = e.target.closest('[data-set-tab]');
  if (!b) return;
  var tab = b.getAttribute('data-set-tab');
  document.querySelectorAll('.dc-pane').forEach(function (p) { p.hidden = p.getAttribute('data-pane') !== tab; });
});
</script>`;
  }

  // phone artboards: centre the 390×844 frame on wider screens
  if (pv.width && pv.width < 600) {
    extraHead += `<style>@media (min-width:600px){body{min-height:100vh;display:flex;justify-content:center;align-items:flex-start;padding:32px 0;box-sizing:border-box;background:#cfd8e3}body>div{box-shadow:0 20px 50px rgba(15,28,41,.25);border-radius:24px}}</style>`;
  }

  const left = body.match(/\{\{|<sc-|<dc-import|onClick=/g);
  if (left) report.push(`${file}: unconverted ${left.join(',')}`);

  const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
${helmet}
${extraHead}
</head>
<body>
${body}
${extraBody}
</body>
</html>
`;
  fs.writeFileSync(path.join(OUT, outName(file)), html);
  report.push(`${outName(file)}  ${Buffer.byteLength(html)}B  "${title}"`);
}

// index → login (canvas entry of the flow)
fs.writeFileSync(path.join(OUT, 'index.html'),
  '<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=DangNhap.html"><title>HVS Đại lý</title></head><body><a href="DangNhap.html">Đăng nhập</a></body></html>\n');
console.log(report.join('\n'));
