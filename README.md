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

## Invitation requests

All invitation buttons open a keyboard-accessible native dialog. **Email is the only required field**; name, work, curiosity, and dietary requirements are optional. The form has native browser validation and a honeypot field.

The workflow is deliberately human-led:

1. A visitor requests an invitation using the public landing page.
2. **Netlify Forms** stores the request and emails it to **brian@meetnear.me** once the notification below is configured.
3. The visitor sees `thank-you.html`, which confirms **pending personal review**. This page never links or redirects to ticketing.
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

- **Date:** The supplied `10/1/2026` is rendered as Thursday, October 1, 2026. This date is already past as of October 6, 2026; confirm the intended date before publishing. No alternative date has been invented.
- **Time:** Not supplied. The page says the exact start time will arrive with the invitation.
- **Venue:** Trilogy Guild, Redding. No street address or menu has been invented.
- **Price:** The page transparently treats $45–$75 as the estimated dinner cost plus the supplied $15 hosting fee, for an estimated $60–$90 total. Confirm whether the original $45–$75 range was meant to include that fee, then update the FAQ and request form.
- **Confirmation policy:** 48 hours after receiving an invitation is a proposed policy; confirm it with the hosts. It is a guest confirmation window, not a promised host response time.
- **Discussion topic:** “Less busywork. More meaningful work.” / “Where can AI and automation actually give us time back—and what should stay human?” is proposed copy, based on the supplied automation idea.
- **Social metadata:** Set `og:image` to an absolute image URL on the final domain, and add the final canonical URL when the domain is known.

## Brand and assets

See `BRAND.md` for the identity, palette, typography, voice, and draft advertisement copy.

- **Meet Near Me logo:** [Supplied SVG](https://static.meetnear.me/static/assets/logo.svg), stored locally without altering the mark.
- **SmartLemon logo:** Supplied LinkedIn company image, stored locally to avoid the expiring asset URL.
- **Hosts:** Brian Feister and Benji Loschen. Brian’s copy describes his role in this dinner; Benji’s background is based on [SmartLemon’s About page](https://www.smartlemon.io/about). Initials are used instead of invented host portraits.
- **Photography:** Unsplash [table setting](https://images.unsplash.com/photo-1511795409834-ef04bbd61622) and [shared dinner](https://images.unsplash.com/photo-1414235077428-338989a2e8c0). These are mood images, not venue photography.
- **Fonts:** [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) and [DM Sans](https://fonts.google.com/specimen/DM+Sans). License notices are included in `assets/`.
- **Custom art:** Supper club emblem, invitation seal, plate-and-gear illustration, and utility icons are authored for this page.

The Catskill Crew reference informed the idea of a dinner-club landing page; this site has its own original visual identity and copy.
