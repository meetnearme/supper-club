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

| URL          | Served HTML      |
| ------------ | ---------------- |
| `/`          | `index.html`     |
| `/tickets`   | `tickets.html`   |
| `/thank-you` | `thank-you.html` |
| `/privacy`   | `privacy.html`   |

The secondary routes use explicit `200` rewrites in `netlify.toml`, so the browser keeps the clean URL. Netlify matches these rules with or without a trailing slash. Root-relative asset and home links keep both URL forms working. The event fragment (`#event/…`) is handled by the Meet Near Me embed in the browser.

## Invitation requests

All invitation buttons open a keyboard-accessible native dialog. **Email, name, work, and curiosity are required**; dietary requirements are optional. The form has native browser validation, which also rejects answers made only of spaces, and a honeypot field.

The workflow is deliberately human-led:

1. A visitor requests an invitation using the public landing page.
2. **Netlify Forms** stores the verified request and triggers `netlify/functions/submission-created.mjs`.
3. **Resend** sends the request details to **brian@meetnear.me** and a separate pending-review acknowledgment to the applicant. Brian’s notification uses the applicant’s email as Reply-To; the applicant can reply to Brian.
4. The visitor sees `/thank-you`, which confirms **pending personal review**. This page never links or redirects to ticketing.
5. Brian reviews the request and makes the approval decision manually.
6. Brian privately emails approved guests their invitation and the Meet Near Me ticket link.

Request acknowledgments and organizer notifications are automatic once Resend is configured. **Approval and actual invitation delivery remain manual.** The acknowledgment is not an invitation or a reservation and includes no ticket URL.

### Required Resend and Netlify settings

The function uses Resend’s batch API to send two separate emails in one request. It uses the verified submission ID as an idempotency key, so retrying the same event does not duplicate the batch within Resend’s 24-hour window. No Resend SDK dependency is needed.

1. In **Resend → Domains**, verify the domain you want to send from, then create an API key with sending access.
2. In **Netlify → Project configuration → Environment variables**, set these variables with the **Functions** scope:

   | Variable | Value |
   | --- | --- |
   | `RESEND_API_KEY` | Your Resend API key |
   | `RESEND_FROM_EMAIL` | A verified sender, e.g. `Redding Supper Club <brian@meetnear.me>` |

   The example sender requires `meetnear.me` to be verified in your Resend account. `.env.example` documents the names without containing a key.

3. Deploy the updated repository. The build command is still **`npm run build`**, publish directory **`dist`**. The functions directory is now **`netlify/functions`**, configured in `netlify.toml`; Netlify bundles it separately from the static site.
4. Enable **form detection** and verify that **invitation-request** appears in the Forms dashboard.
5. If you enabled Netlify’s built-in email notification for this form previously, remove it from **Forms → Submission notifications** to avoid duplicate organizer emails now that Resend sends that message.
6. Submit a request with an email address you control. Confirm that the applicant receives an acknowledgment and Brian receives the full request with the correct Reply-To.

Netlify’s supported `submission-created` event-function convention invokes the handler for verified submissions and verifies event signatures before invocation. The browser submits to Netlify Forms, not to a public email-sending endpoint.

If delivery fails, the request remains available in Netlify Forms. Check **Functions → submission-created → Logs** and the Resend Emails dashboard. The function reports missing configuration and failed API calls; API acceptance does not guarantee inbox delivery. After correcting a failure, arrange delivery for the saved request; there is no custom queue or automatic backfill of older requests.

### Email checks

```sh
npm test
```

The tests mock Resend: they check both recipients, Reply-To, request details, HTML escaping, pending-review language, no ticket-link disclosure, idempotency, and failure handling. They send no real emails.

Local/file previews deliberately do not submit or claim to store a request. Other hosting platforms need a working form endpoint and a way to invoke the email handler after saving submissions. See [Netlify’s form-event documentation](https://docs.netlify.com/build/functions/trigger-on-events/) and [Resend’s batch API documentation](https://resend.com/docs/api-reference/emails/send-batch-emails).

## Analytics

`analytics.js` loads PostHog on the homepage, `/thank-you`, and `/privacy`, but not on the unlisted ticketing page. The project lives in the **Redding Supper Club** PostHog organization (US cloud). The token in the file is a client-side token and is public by design.

- **Events:** pageviews are automatic. `invitation_form_opened` fires when the request dialog opens (`script.js`), and `invitation_requested` fires when `/thank-you` loads, which only the form leads to.
- **Replay and heatmaps:** switched on in the PostHog project settings, not in code. PostHog masks form inputs in recordings by default.
- **Ad attribution:** UTM tags on the landing URL are kept for the rest of the visit, so `invitation_requested` carries the ad's `utm_campaign` and `utm_content`. Give Meta ads these URL parameters:

  ```text
  utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}
  ```

- **Proxy:** events go through `/relay/*` on the site's own domain, so ad blockers drop fewer of them. The rules are in `_redirects`, which `build.mjs` copies into `dist/`; the same rules in `netlify.toml` were not applied by the live deploy.
- **Live domain only:** analytics run only on `reddingsupper.club`, so local previews and Netlify deploy previews send nothing. Update the domain list in `analytics.js` if the site moves.
- **Gaps:** browser analytics miss some visitors. Netlify Forms remains the exact count of requests.
- **Ad spend:** to see Meta spend next to requests, turn on the Marketing Analytics beta in PostHog's feature previews, connect the Meta ad account, and set `invitation_requested` as the conversion goal.
- **Meta Pixel:** also loaded by `analytics.js` on the live domain only (pixel `1641371730822384`). It sends `PageView` on every page and `Lead` on `/thank-you`. Optimize Meta campaigns for landing page views; a few dozen Leads is too few to optimize for.
- **Privacy:** `privacy.html` describes this setup and is linked from the footer and the request form. Update it if tracking changes. It assumes the pixel's automatic advanced matching may send hashed name and email to Meta; if that setting is off in Events Manager, that paragraph can be softened.

## Unlisted ticketing page

Privately share this URL **only after approving a guest** (replace the domain):

```text
https://YOUR-DOMAIN/tickets#event/0ccbc1a9-7709-4dc2-aa59-6ec0bfb96c60
```

-   Netlify rewrites `/tickets` to `tickets.html` using the included configuration.
-   The supplied Meet Near Me embed uses publisher/owner ID `394007099018847381`, the Redding location, and the provided radius.
-   `tickets.js` opens the supplied event by default when no hash is present; an existing event hash is preserved.
-   The page is absent from public navigation, request responses, and thank-you links. It is marked `noindex, nofollow, noarchive` in both HTML and response headers, and excluded in `robots.txt`.
-   This is an **unlisted static page**, not an authenticated page. Anyone who already knows the URL can open it. Approval and distributing the link remain manual.
-   Locally, `npm run dev` serves the same clean routes as Netlify, so preview `http://localhost:8000/tickets#event/0ccbc1a9-7709-4dc2-aa59-6ec0bfb96c60`.

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

- **Date:** Tuesday, November 10, 2026 (moved from Sunday, November 1; the originally supplied date was `10/1/2026`).
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
- **Flux Footwear logo:** Supplied LinkedIn company image, stored locally as `assets/flux-footwear-logo.jpg` alongside Ben’s Former Co-Founder credential.
- **Salesforce logo:** [Supplied Wikimedia SVG](https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg), stored locally as `assets/salesforce-logo.svg` and used alongside Brian’s career credential.
- **Hosts:** Brian Feister and Ben Loschen. Brian’s supplied background includes his Engineering Lead role at Salesforce Commerce Cloud and founding the [Real Meet Podcast](https://realmeetpodcast.com/), with the bio emphasizing his investment in human connection. Ben’s background is based on [SmartLemon’s About page](https://www.smartlemon.io/about). The supplied portraits are stored as `assets/brian-feister.jpg` and `assets/loschen-no-bg.jpeg`, with circular masks and a slight zoom.
- **Photography:** Unsplash [table setting](https://images.unsplash.com/photo-1511795409834-ef04bbd61622) and [shared dinner](https://images.unsplash.com/photo-1414235077428-338989a2e8c0). These are mood images, not venue photography.
- **Fonts:** [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) and [DM Sans](https://fonts.google.com/specimen/DM+Sans). License notices are included in `assets/`.
- **Custom art:** Supper club emblem, invitation seal, plate-and-gear illustration, and utility icons are authored for this page.
- **Social profile images:** `assets/profile-forest.png` (Linen on Forest) and `assets/profile-white.png` (Forest on white) are 1080×1080 exports of the emblem for Facebook and Instagram, and `assets/emblem-white.png` is a 2048px white mark on a transparent background. They use heavier strokes than `assets/emblem.svg` so the mark reads at avatar sizes.

The Catskill Crew reference informed the idea of a dinner-club landing page; this site has its own original visual identity and copy.
