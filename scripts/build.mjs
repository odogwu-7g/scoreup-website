import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
if (process.env.VERCEL && !process.env.SITE_URL && !process.env.VERCEL_URL) {
  throw new Error('Enable Vercel system environment variables or set SITE_URL to the deployed website origin.');
}
const configured = process.env.SITE_URL || process.env.VERCEL_URL || 'http://localhost:4177';
const url = new URL(configured.includes('://') ? configured : `https://${configured}`);
if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
  throw new Error('SITE_URL must be a website origin, such as https://www.example.co.za');
}
if (url.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
  throw new Error('Use HTTPS for a hosted SITE_URL. HTTP is allowed only for local previews.');
}
// Only the generated output directory beneath this project is replaced.
if (path.dirname(output) !== path.resolve(root) || path.basename(output) !== 'dist') throw new Error('Invalid output directory');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, 'public'), output, { recursive: true });
const file = path.join(output, 'index.html');
const html = (await readFile(file, 'utf8')).replaceAll('__SITE_ORIGIN__', url.origin);
await writeFile(file, html);
console.log(`ScoreUp built to dist; form return URL: ${url.origin}/thank-you.html`);
