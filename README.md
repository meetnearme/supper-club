# The Redding Supper Club

A responsive, standalone HTML landing page with a custom North State identity, locally compiled Tailwind CSS, self-hosted fonts, and local image/logo assets. No framework, runtime CSS CDN, or application server is needed to view the page.

## View it

Open `index.html` in a browser, or serve the folder:

```sh
npm run dev
```

Visit **http://localhost:8000**.

## Edit and build

Edit `index.html`, `script.js`, and `styles.css`. The unlisted ticketing experience is in `tickets.html` and `tickets.js`. Tailwind’s palette and type settings live in `tailwind.config.cjs`.

```sh
npm install
npm run build
```

The build refreshes `assets/styles.css` and stages the complete static site in `dist/`. The compiled stylesheet is already included, so simply viewing the page does not require npm. `npm run watch` refreshes CSS while editing.

## Deployed routes

Netlify serves clean URLs directly; no static-site framework is required:

| URL | Served HTML |
| --- | --- |
| `/` | `index.html` |
| `/tickets` | `tickets.html` |
| `/thank-you` | `thank-you.html` |

The secondary routes use explicit `200` rewrites in `netlify.toml`, so the browser keeps the clean URL. Netlify matches these rules with or without a trailing slash. Root-relative asset and home links keep both URL forms working. The event fragment (`#event/…`) is handled by the Meet Near Me embed in the browser.

## Invitation requests

All invitation buttons open a keyboard-accessible native dialog. **Email is the only required field**; name, work, curiosity, and dietary requirements are optional. The form has native browser validation and a honeypot field.

The workflow is deliberately human-led:

1. A visitor requests an invitation using the public landing page.
2. **Netlify Forms** stores the request and emails it to **brian@meetnear.me** once the notification below is configured.
3. The visitor sees `/thank-you`, which confirms **pending personal review**. This page never links or redirects to ticketing.
4. Brian reviews the request and makes the approval decision manually.
5. Brian privately emails approved guests their invitation and the Meet Near Me ticket link.

Guest emails, approvals, and invitation delivery are manual. The page does not send automated guest acknowledgment emails or grant access following a submission.

### Required Netlify notification setting

Email recipients are account settings in Netlify; they cannot be configured by a hidden HTML input or `netlify.toml`. After connecting the GitHub repository and deploying:

1. Enable **form detection** in your Netlify site's Forms settings and deploy the site with the included `netlify.toml` (`npm run build`, publish directory `dist`).
2. Verify that **invitation-request** appears in the Forms dashboard.
3. Go to **Forms → Submission notifications → Add notification → Email notification**.
4. Select **invitation-request** and set the recipient to **brian@meetnear.me**.
5. Submit a request with an email address you control to verify receipt in your inbox and the pending-review confirmation page.

The hidden subject field sets **“New Redding Supper Club invitation request.”** The input is named `email`, so Netlify sets the notification’s **Reply-To** to the submitter. You can reply directly with your approval and private ticket link.

Local/file previews deliberately do not submit or claim to store a request. Other hosting platforms need a working form endpoint. See [Netlify’s notification documentation](https://docs.netlify.com/manage/forms/notifications/) for the dashboard settings.

## Unlisted ticketing page

Privately share this URL **only after approving a guest** (replace the domain):

```text
https://YOUR-DOMAIN/tickets#event/c5fc0d53-08e2-4171-aa6d-2ee393ebb66c
```

- Netlify rewrites `/tickets` to `tickets.html` using the included configuration.
- The supplied Meet Near Me embed uses publisher/owner ID `394007099018847381`, the Redding location, and the provided radius.
- `tickets.js` opens the supplied event by default when no hash is present; an existing event hash is preserved.
- The page is absent from public navigation, request responses, and thank-you links. It is marked `noindex, nofollow, noarchive` in both HTML and response headers, and excluded in `robots.txt`.
- This is an **unlisted static page**, not an authenticated page. Anyone who already knows the URL can open it. Approval and distributing the link remain manual.
- With the basic local Python server, preview `http://localhost:8000/tickets.html#event/c5fc0d53-08e2-4171-aa6d-2ee393ebb66c`; the extensionless `/tickets` route is provided by Netlify.

Example approval email:

> Hi [name], we'd love to have you at the Redding Supper Club. Here are the final dinner details: [date, start time, price]. Please reserve your seat within 48 hours using this private invitation link: [ticket URL]. Looking forward to sharing the table! — Brian

## GitHub

Repository: [meetnearme/supper-club](https://github.com/meetnearme/supper-club).

The Git remote uses the supplied SSH host alias so Git selects `~/.ssh/id_rsa_github2`:

```text
git@github-brianfeister:meetnearme/supper-club.git
```

Generated `dist/`, dependencies, local environment files, editor state, and ZIP archives are excluded from Git. The precompiled stylesheet and local assets are included so the static page also works without a build.

## Event details to finalize

- **Date:** Sunday, November 1, 2026 (corrected from the originally supplied `10/1/2026`).
- **Time:** Not supplied. The page says the exact start time will arrive with the invitation.
- **Venue:** Trilogy Guild, Redding. No street address or menu has been invented.
- **Price:** The page transparently treats $45–$75 as the estimated dinner cost plus the supplied $15 hosting fee, for an estimated $60–$90 total. Confirm whether the original $45–$75 range was meant to include that fee, then update the FAQ and request form.
- **Confirmation policy:** 48 hours after receiving an invitation is a proposed policy; confirm it with the hosts. It is a guest confirmation window, not a promised host response time.
- **Discussion topic:** “Less busywork. More meaningful work.” / “Where can AI and automation actually give us time back—and what should stay human?” is proposed copy, based on the supplied automation idea.
- **Social metadata:** `index.html` keeps root-relative canonical, `og:url`, and `og:image` values; `build.mjs` prefixes them with Netlify's `URL` build variable (the site's primary domain), or `SITE_URL` if set. The preview image is `assets/og-image.jpg` (1200×630, cropped from the hero photo). After a deploy or domain change, run the homepage through Meta's [Sharing Debugger](https://developers.facebook.com/tools/debug/) and click **Scrape Again** to refresh cached previews.

## Brand and assets

See `BRAND.md` for the identity, palette, typography, voice, and draft advertisement copy.

- **Meet Near Me logo:** [Supplied SVG](https://static.meetnear.me/static/assets/logo.svg), stored locally without altering the mark.
- **SmartLemon logo:** Supplied LinkedIn company image, stored locally to avoid the expiring asset URL.
- **Flux Footwear logo:** Supplied LinkedIn company image, stored locally as `assets/flux-footwear-logo.jpg` alongside Benji’s Co-Founder credential.
- **Salesforce logo:** [Supplied Wikimedia SVG](https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg), stored locally as `assets/salesforce-logo.svg` and used alongside Brian’s career credential.
- **Hosts:** Brian Feister and Benji Loschen. Brian’s supplied background includes his Engineering Lead role at Salesforce Commerce Cloud and founding the [Real Meet Podcast](https://realmeetpodcast.com/), with the bio emphasizing his investment in human connection. Benji’s background is based on [SmartLemon’s About page](https://www.smartlemon.io/about). The supplied portraits are stored as `assets/brian-feister.jpg` and `assets/ben-loschen.jpg`, with circular masks. Benji’s portrait is zoomed and positioned to exclude the surrounding award graphic and red logos.
- **Photography:** Unsplash [table setting](https://images.unsplash.com/photo-1511795409834-ef04bbd61622) and [shared dinner](https://images.unsplash.com/photo-1414235077428-338989a2e8c0). These are mood images, not venue photography.
- **Fonts:** [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) and [DM Sans](https://fonts.google.com/specimen/DM+Sans). License notices are included in `assets/`.
- **Custom art:** Supper club emblem, invitation seal, plate-and-gear illustration, and utility icons are authored for this page.
- **Social profile images:** `assets/profile-forest.png` (Linen on Forest) and `assets/profile-white.png` (Forest on white) are 1080×1080 exports of the emblem for Facebook and Instagram, and `assets/emblem-white.png` is a 2048px white mark on a transparent background. They use heavier strokes than `assets/emblem.svg` so the mark reads at avatar sizes.

The Catskill Crew reference informed the idea of a dinner-club landing page; this site has its own original visual identity and copy.
