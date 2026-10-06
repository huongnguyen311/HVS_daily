// One-off: card titles h3 → h2 (no h1→h3 skip), aria-current="page" only on the real current page.
// Idempotent: re-running finds nothing to change.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

for (const file of fs.readdirSync(root).filter(f => f.endsWith('.html'))) {
  const p = path.join(root, file);
  const before = fs.readFileSync(p, 'utf8');
  let s = before;

  s = s.replace(/<h3( style="margin:0;font-size:16px;font-weight:600">)/g, '<h2$1').replace(/<\/h3>/g, '</h2>');

  // sidebar: a parent section that is not this page is "true", not "page"
  s = s.replace(/(class="nav-link is-active" href="([^"]+)") aria-current="page"/g,
    (m, head, href) => href === file ? m : `${head} aria-current="true"`);

  // trip section tabs: mark the selected tab as the current page
  s = s.replace(new RegExp(`<a href="${file.replace('.', '\\.')}" (style="[^"]*border-bottom:2px solid #0170C1[^"]*")`, 'g'),
    `<a href="${file}" aria-current="page" $1`);

  if (s !== before) { fs.writeFileSync(p, s); console.log('updated', file); }
}
