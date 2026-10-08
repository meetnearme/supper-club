import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';

// Stage only the static site for deployment; index.html also works directly from the project root.
await mkdir('dist', { recursive: true });
await Promise.all(
  ['index.html', 'thank-you.html', 'tickets.html', 'privacy.html', 'script.js', 'tickets.js', 'analytics.js', 'robots.txt', '_redirects', 'assets'].map((path) =>
    cp(path, `dist/${path}`, { recursive: true }),
  ),
);

// Link previews need absolute URLs. Netlify sets URL to the site's primary address; SITE_URL overrides it elsewhere.
const siteUrl = (process.env.SITE_URL || process.env.URL || '').replace(/\/+$/, '');
if (siteUrl) {
  const html = await readFile('dist/index.html', 'utf8');
  await writeFile(
    'dist/index.html',
    html.replace(/((?:rel="canonical"|property="og:(?:url|image)")\s+(?:href|content)=")\//g, `$1${siteUrl}/`),
  );
} else {
  console.warn('SITE_URL/URL not set: canonical, og:url, and og:image stay root-relative and link previews will not show.');
}
console.log('Static site ready in dist/');
