# Admin Panel Setup Guide

This document explains how to configure and log in to the `/admin` panel for nrgwebsites.com.

---

## Overview

The admin panel is protected by a username + password that you set yourself. The password is never stored in plain text — only a bcrypt hash is stored in environment variables. The session is sealed in an httpOnly cookie using iron-session.

**The panel will not load at all if any required env var is missing** (it returns 503, not a login page). This is intentional — fail closed.

---

## Step 1: Generate your password hash

Run this command in the project directory. Replace `yourpassword` with your actual password (at least 8 characters).

```bash
node -e "const b=require('bcryptjs'); b.hash('yourpassword', 12).then(h => console.log('ADMIN_PASSWORD_HASH=' + h))"
```

This takes about 1 second. Copy the output — it looks like:

```
ADMIN_PASSWORD_HASH=$2a$12$abc123...
```

> **Critical — escape every `$` sign in `.env.local`.**
> bcrypt hashes contain multiple `$` characters (e.g. `$2b$12$...`). Next.js uses
> dotenv with variable interpolation, so bare `$` signs are treated as env-var
> references and silently collapsed to empty strings, destroying the hash.
> In `.env.local` you **must** escape every `$` as `\$`:
>
> ```env
> ADMIN_PASSWORD_HASH=\$2b\$12\$abc123...
> ```
>
> This escaping is only needed in `.env.local` (local dev). On Netlify, paste the
> raw hash directly into the environment variable UI — no escaping required there.

Alternatively, use the included helper script:

```bash
npx ts-node src/lib/admin/seed-passwords.ts yourpassword
```

**Never commit your password or hash to git.** Environment variables only.

---

## Step 2: Generate a session secret

The session secret seals the session cookie. It must be at least 32 characters of random data.

```bash
openssl rand -base64 32
```

Or with Node.js:

```bash
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output.

---

## Step 3: Set environment variables

### For local development

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in the three admin values:

```env
ADMIN_USERNAME=noah
ADMIN_PASSWORD_HASH=\$2b\$12\$<rest of hash — escape every $ as \$>
SESSION_SECRET=<paste secret from Step 2>
```

> **Remember:** every `$` in the bcrypt hash must be written as `\$` in `.env.local`.
> See the note in Step 1 for details.

The `.env.local` file is already gitignored — it will not be committed.

### For Netlify (production)

1. Log in to [Netlify](https://app.netlify.com)
2. Select your site (nrg-portfolio)
3. Go to **Site → Configuration → Environment variables**
4. Add three variables:
   - `ADMIN_USERNAME` = `noah`
   - `ADMIN_PASSWORD_HASH` = the hash from Step 1
   - `SESSION_SECRET` = the secret from Step 2
5. Click **Save** and trigger a new deploy (the panel requires a redeploy to pick up new env vars)

---

## Step 4: Log in for the first time

1. Start the dev server: `npm run dev`
2. Visit `http://localhost:3001/admin/login` (or `http://localhost:3000/admin/login`)
3. Enter your username (`noah`) and the password you chose in Step 1
4. You will be redirected to `/admin` (the LEADS tab)

The session lasts 7 days. After 7 days, you will be redirected to the login page automatically.

---

## Changing your password

1. Generate a new hash with the command from Step 1
2. Update `ADMIN_PASSWORD_HASH` in your Netlify environment variables (or `.env.local` for local dev)
3. All existing sessions will still be valid until they expire (7 days) — iron-session does not invalidate old sessions on password change
4. To force all sessions invalid immediately: also rotate `SESSION_SECRET` to a new random value

---

## Backing up your data

The admin panel stores leads and clients in `data/leads.json` and `data/clients.json`. On Netlify, these files are ephemeral — they exist only for the lifetime of the serverless function container and are reset on each deploy.

**Backup strategy:** Visit `GET /api/admin/export` (while logged in) to download a full JSON backup:

```
https://nrgwebsites.com/api/admin/export
```

This returns `{ leads, clients, exportedAt }` as a downloadable `.json` file. Bookmark this URL and download periodically (weekly recommended).

To restore from a backup, use `POST /api/admin/leads/bulk?mode=replace` and `POST /api/admin/clients` (create each client individually, or add a bulk clients endpoint in Phase 2).

---

## Phase-2 deferred metrics

The data captured now enables these analytics to be switched on in Phase 2 without any schema changes:

| Metric | Data captured | Benchmark |
|---|---|---|
| Email reply rate | `emailedAt` + stage transitions (Called/Follow-up/Proposal/Won) | 3.43% avg / 5% good / 10% great |
| Sales velocity (avg days per stage) | `stageHistory` with ISO timestamps per stage change | — |
| Funnel drop-off by stage | `stageHistory` entries (append-only) | — |
| Source-channel ROI | `source` field (free-text, e.g. "Google Maps cold", "referral") | — |
| Touch-to-close ratio | `touchCount` per lead | — |

`stageHistory` is append-only — every stage change pushes `{ stage, at: ISO }`. Time-in-stage = `stageHistory[i+1].at - stageHistory[i].at`. Source-channel bucketing parses the `source` free-text field into categories.

---

## Security notes

- The session cookie is `httpOnly` (not readable by JavaScript), `sameSite: lax`, and `secure: true` in production
- The password is hashed with bcrypt at cost factor 12 (industry standard for interactive logins)
- Username comparison uses `crypto.timingSafeEqual` to prevent timing-based username enumeration
- The middleware checks env vars before anything else — if `SESSION_SECRET` is missing, the panel returns 503 rather than falling back to an insecure state
- `/admin` is excluded from `robots.txt` (Disallow: /admin) — search engines will not index it
