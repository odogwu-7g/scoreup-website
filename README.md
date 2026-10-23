# Score UP Solutions

Complete responsive website for Score UP Solutions, ready to import into Vercel. Includes the homepage, three process pages, Our Team, privacy information, a thank-you page, and the selected logo, photos and local fonts.

## Deploy to Vercel

1. In Vercel, choose **Add New → Project** and import this GitHub repository.
2. Keep **Root Directory** at the repository root.
3. The included `vercel.json` configures **Framework: Other**, **Build Command: npm run build**, and **Output Directory: dist**.
4. Click **Deploy**. No npm dependencies, database, API key, or email password is required.

The build uses Vercel's `VERCEL_URL` for the form's absolute return URL. JavaScript also updates it to the current origin so custom domains and preview domains return visitors to the correct website.

If you use a custom domain and want it embedded as the no-JavaScript fallback, add the optional Vercel environment variable `SITE_URL=https://your-domain.co.za` and redeploy. Keep Vercel's automatic system environment variables enabled.

References: [Vercel project configuration](https://vercel.com/docs/project-configuration/vercel-json), [Vercel system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables).

## Callback email delivery

- Recipient: **moutloaliz@gmail.com**.
- Provider: **FormSubmit**; submissions are delivered as a table containing full name, mobile number, optional email address, and contact consent.
- FormSubmit's spam check stays enabled, with an additional honeypot.
- Visitors return to `/thank-you.html` after completing the submission.
- The mailbox owner must click **Activate Form** in FormSubmit's confirmation email before delivery is active. A new website domain may require another activation; test after deploying.
- The activation email was requested during setup. Inbox delivery still requires the mailbox owner's confirmation; do not assume it has been verified.
- No form entries are stored in the website database or browser storage. FormSubmit states it retains submissions for 30 days.

To change the email recipient, update the form action in `public/index.html`, and update the privacy notice and this README. Do not put a Gmail password or service secret in frontend code.

## Run locally

Use Node.js 22 or newer:

```sh
npm run build
npm run check
npm start
```

Open `http://localhost:4177`. Run `npm run build` again after editing source files. `PORT` can override the local server port; if doing so without JavaScript, set `SITE_URL` to match when building.

## Files

- `public/` — editable HTML, CSS, JavaScript and all assets used by the website.
- `scripts/build.mjs` — dependency-free static build and form return-URL configuration.
- `scripts/check.mjs` — verifies page headings, links, anchors, assets, form configuration and team names.
- `scripts/serve.mjs` — local preview server.
- `vercel.json` — deployment configuration.
- `dist/` — generated build output; ignored by Git.

The site includes responsive layouts, labelled form fields, inline validation, keyboard focus states, and scroll reveals that respect reduced-motion preferences. Native form submission still works when JavaScript is disabled.

The adviser photo is illustrative and is not a verified photograph of ScoreUp staff. Font licensing is included in `public/assets/FONT-LICENSE.txt`. No customer enquiries or hosting credentials are included in this repository.
