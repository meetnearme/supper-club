import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

// Local preview server. Like Netlify, it serves clean routes such as /privacy, /thank-you, and /tickets from their .html files.
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};
const port = Number(process.env.PORT) || 8000;

async function resolve(pathname) {
  // Netlify serves /thank-you and /thank-you/ alike, so ignore trailing slashes.
  const path = normalize(join('.', decodeURIComponent(pathname).replace(/\/+$/, '')));
  if (path.startsWith('..')) return null;
  for (const candidate of [path, join(path, 'index.html'), `${path}.html`]) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {}
  }
  return null;
}

createServer(async (req, res) => {
  const file = await resolve(new URL(req.url, 'http://localhost').pathname);
  if (!file) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    return res.end('Not found');
  }
  res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
  res.end(await readFile(file));
}).listen(port, () => console.log(`Previewing on http://localhost:${port}`));
