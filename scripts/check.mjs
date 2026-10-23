import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const files = await readdir(root);
let references = 0;
for (const name of files.filter(file => file.endsWith('.html'))) {
  const html = await readFile(path.join(root, name), 'utf8');
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${name}: expected one primary heading`);
  assert.ok(!html.includes('__SITE_ORIGIN__') && !html.includes('chatgpt.site'), `${name}: unresolved hosting URL`);
  const urls = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(match => match[1]);
  const srcsets = [...html.matchAll(/srcset="([^"]+)"/g)].flatMap(match => match[1].split(',').map(part => part.trim().split(/\s+/)[0]));
  for (const url of [...urls, ...srcsets]) {
    if (/^(?:https?:|mailto:|tel:)/.test(url)) continue;
    const [pathname, fragment] = url.split('#');
    const target = pathname === '/' ? 'index.html' : pathname ? pathname.replace(/^\//, '') : name;
    const file = path.join(root, target);
    assert.ok((await stat(file)).isFile(), `${name}: missing ${url}`);
    if (fragment && target.endsWith('.html')) {
      const targetHtml = await readFile(file, 'utf8');
      assert.ok(targetHtml.includes(`id="${fragment}"`), `${name}: missing anchor ${url}`);
    }
    references++;
  }
}
const home = await readFile(path.join(root, 'index.html'), 'utf8');
assert.match(home, /action="https:\/\/formsubmit.co\/moutloaliz@gmail.com"/);
assert.match(home, /name="_template" value="table"/);
assert.match(home, /name="_next" value="https?:\/\/[^"\s]+\/thank-you.html"/);
for (const person of ['Zamuxolo Moutloali', 'Vuyani Nondabula', 'Siphoesihle Nkolwanas', 'Bulelani Hlabe']) assert.ok(home.includes(person));
const css = await readFile(path.join(root, 'styles.css'), 'utf8');
for (const match of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) {
  if (!match[1].startsWith('/')) continue;
  assert.ok((await stat(path.join(root, match[1].slice(1)))).isFile());
  references++;
}
console.log(`Checked ${files.filter(file => file.endsWith('.html')).length} pages and ${references} local links/assets. Form destination, return URL, and team names verified.`);
