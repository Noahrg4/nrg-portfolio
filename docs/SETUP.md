# NRG Portfolio — Setup & Deployment

This guide gets your site running locally and live on the internet. No prior coding experience needed — just follow each step in order.

---

## Quick Start (local)

1. **Clone the repo**
   ```bash
   git clone <your-repo-url> nrg-portfolio
   cd nrg-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` in any text editor and fill in your values (see sections below for where to get each one). At minimum, set `NOAH_EMAIL` so the contact form has somewhere to send inquiries.

4. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open <http://localhost:3000> in your browser. Changes to the code reload automatically.

---

## Getting your Resend API key

Resend handles the contact form emails. The free tier covers 100 emails/day — plenty for a portfolio site.

1. Go to <https://resend.com> and sign up with your email.
2. Verify your email address (check inbox).
3. From the dashboard sidebar, click **API Keys**.
4. Click **Create API Key**.
   - Name it something like "NRG Portfolio Production"
   - Permission: "Sending access"
   - Domain: "All domains" (for now)
5. Copy the key (starts with `re_...`) — **this is the only time it's shown**.
6. Paste it into `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
   ```

### Verifying your sending domain (recommended for production)
By default Resend sends from a shared address. To send from `noreply@nrgwebsites.com`:
1. In the Resend dashboard, click **Domains** → **Add Domain**.
2. Enter `nrgwebsites.com`.
3. Resend gives you DNS records (SPF, DKIM). Add them at your domain registrar (see the Vercel domain section below for where DNS lives).
4. Wait 5–30 minutes for verification.
5. Once verified, emails from the form will come from `noreply@nrgwebsites.com`.

If you haven't verified a domain yet, change the `from:` address in `src/app/api/contact/route.ts` to `onboarding@resend.dev` temporarily — that address works without a verified domain.

---

## Deploy to Vercel

Vercel is free for personal projects and is built by the team behind Next.js, so deploys are one-click.

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/nrg-portfolio.git
   git push -u origin main
   ```

2. **Import on Vercel**
   - Go to <https://vercel.com> and sign in with GitHub.
   - Click **Add New** → **Project**.
   - Find your `nrg-portfolio` repo and click **Import**.
   - Framework preset will auto-detect as **Next.js** — leave defaults.

3. **Add environment variables**
   Before clicking Deploy, expand the **Environment Variables** section and add each one from your `.env.local`:
   - `NOAH_EMAIL`
   - `NOAH_PHONE`
   - `RESEND_API_KEY`
   - (Optional) `TWILIO_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
   - (Optional) `NEXT_PUBLIC_GA_ID`

4. **Click Deploy.** First build takes about 90 seconds. When it finishes, your site is live at a `*.vercel.app` URL.

---

## Adding your custom domain

1. In Vercel, open your project → **Settings** → **Domains**.
2. Type your domain (e.g., `nrgwebsites.com`) and click **Add**.
3. Vercel shows you DNS records to add at your domain registrar (GoDaddy, Namecheap, Cloudflare, Google Domains, etc.).
   - **Apex domain** (`nrgwebsites.com`): add an `A` record pointing to `76.76.21.21`.
   - **www subdomain** (`www.nrgwebsites.com`): add a `CNAME` pointing to `cname.vercel-dns.com`.
4. Save at your registrar. Vercel auto-checks every minute — usually verified in 5–15 minutes.
5. Once verified, Vercel issues a free SSL certificate. Your site is live on your custom domain with HTTPS.

---

## Updating content

All content lives in code — change it, commit, push, and Vercel auto-deploys.

- **Testimonials**: edit `src/app/page.tsx`, find the `TestimonialCard` components. Replace the `quote`, `author`, and `business` props.
- **Project cards**: edit `src/app/work/page.tsx`, find the `ProjectCard` components. Each card has a `title`, `outcome`, `category`, and `tags`.
- **"Available for projects" status**: search the codebase for the string `Available for projects` — it appears in `src/components/Nav.tsx`, `src/components/Footer.tsx`, and `src/components/StickyCtaBar.tsx`. Change it to "Booked through [month]" when you want to pause inquiries.
- **Adding project mockup screenshots**: by default the `BrowserMockup` shows a colored gradient placeholder. To use a real screenshot, replace the placeholder `<div>` child with a Next.js `<Image src="/screenshots/project-name.png" alt="..." width={1200} height={800} />`. Save the image file under `public/screenshots/`.
- **Services pricing**: edit `src/app/services/page.tsx`, find the `ServiceCard` components, update the `priceFrom` prop.
- **Your email/phone shown publicly**: edit `src/app/contact/page.tsx` — the sidebar with direct contact info has them as plain text.

---

## Contact form testing

### Test without sending real emails
If `RESEND_API_KEY` is empty in your `.env.local`, the API logs the submission to the dev console instead of sending. You can submit the form locally and watch the terminal where `npm run dev` is running — you'll see a warning line confirming the email was skipped.

### Test with real emails
1. Set `RESEND_API_KEY` and `NOAH_EMAIL` in `.env.local`.
2. Restart `npm run dev` so it picks up the new env vars.
3. Submit the form at <http://localhost:3000/contact>.
4. Check the inbox at `NOAH_EMAIL`. Email should arrive within a few seconds.

### Test the rate limiter
Submit the form 6 times in a row from the same browser. The 6th submission should return a 429 error message asking you to email directly. The window resets after 1 hour.

### Test Twilio SMS (optional)
1. Sign up at <https://twilio.com>, buy a phone number (~$1/month).
2. From the Twilio console, copy your **Account SID** and **Auth Token**.
3. Add to `.env.local`:
   ```
   TWILIO_SID=ACxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
   TWILIO_FROM_NUMBER=+1XXXXXXXXXX
   NOAH_PHONE=+1XXXXXXXXXX
   ```
4. Submit the form — within seconds you should get a text on `NOAH_PHONE` summarizing the inquiry.
5. If `TWILIO_SID` is not set, SMS is silently skipped — email still sends.

---

## Troubleshooting

- **"Module not found: framer-motion"** — run `npm install framer-motion`.
- **Form submits but no email arrives** — check Vercel logs (Project → **Deployments** → click latest → **Functions** → `api/contact`). Look for the `[contact]` log lines.
- **Email lands in spam** — verify your sending domain in Resend (see above) so emails come from your domain instead of the shared sender.
- **Build fails on Vercel** — run `npm run build` locally first to see the error; usually a TypeScript or missing env var issue.

---

## Where to ask for help

- Next.js docs: <https://nextjs.org/docs>
- Vercel docs: <https://vercel.com/docs>
- Resend docs: <https://resend.com/docs>
- Twilio docs: <https://www.twilio.com/docs/sms>
