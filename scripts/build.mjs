import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => readFileSync(path.join(root, name), 'utf8');
let page = read('src/pages/home.html');
for (const name of ['lead-offer', 'site-header', 'site-footer', 'float-actions']) {
  page = page.replace(`{{${name}}}`, () => read(`src/components/${name}.html`).trim());
}
const html = read('src/document.html').replace('{{page}}', () => page.trim());
if (/\{\{[\w-]+\}\}/.test(html)) throw new Error('Unresolved template placeholder');
writeFileSync(path.join(root, 'index.html'), html);
for (const [from, to] of [['src/styles/site.css', 'styles/site-v7.css'], ['src/scripts/site.js', 'scripts/site-v5.js']]) {
  mkdirSync(path.dirname(path.join(root, to)), { recursive: true });
  copyFileSync(path.join(root, from), path.join(root, to));
}
writeFileSync(path.join(root, '.nojekyll'), '');
console.log('Built index.html, styles/site-v7.css and scripts/site-v5.js. Commit these generated files with the source.');
