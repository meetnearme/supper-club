import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';

// Stage only the static site for deployment; index.html also works directly from the project root.
// Start from an empty dist/: Netlify keeps it between builds, so files deleted from the repo would otherwise still deploy.
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await Promise.all(
  ['index.html', 'thank-you.html', 'tickets.html', 'privacy.html', 'script.js', 'tickets.js', 'analytics.js', 'robots.txt', '_redirects', 'assets', 'reports'].map((path) =>
    cp(path, `dist/${path}`, { recursive: true }),
  ),
);

// Link previews need absolute URLs. Netlify sets URL to the site's primary address; SITE_URL overrides it elsewhere.
const siteUrl = (process.env.SITE_URL || process.env.URL || '').replace(/\/+$/, '');
if (siteUrl) {
  const pages = ['index.html', ...(await readdir('reports')).filter((name) => name.endsWith('.html')).map((name) => `reports/${name}`)];
  await Promise.all(pages.map(async (path) => {
    const html = await readFile(`dist/${path}`, 'utf8');
    await writeFile(
      `dist/${path}`,
      html.replace(/((?:rel="canonical"|property="og:(?:url|image)")\s+(?:href|content)=")\//g, `$1${siteUrl}/`),
    );
  }));
} else {
  console.warn('SITE_URL/URL not set: canonical, og:url, and og:image stay root-relative and link previews will not show.');
}
console.log('Static site ready in dist/');
