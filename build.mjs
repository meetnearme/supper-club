import { cp, mkdir } from 'node:fs/promises';

// Stage only the static site for deployment; index.html also works directly from the project root.
await mkdir('dist', { recursive: true });
await Promise.all(
  ['index.html', 'thank-you.html', 'tickets.html', 'script.js', 'tickets.js', 'robots.txt', 'assets'].map((path) =>
    cp(path, `dist/${path}`, { recursive: true }),
  ),
);
console.log('Static site ready in dist/');
