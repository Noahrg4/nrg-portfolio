# Admin Panel — Security Model

**Last updated:** 2026-05-25

---

## What's protected

Every request to `/admin/*` and `/api/admin/*` passes through `src/middleware.ts` before it reaches any page or API handler.

| Path pattern | Protection |
|---|---|
| `/admin/login` | Public (login form — no session required) |
| `/api/admin/auth/login` | Public (verifies credentials, sets session) |
| `/api/admin/auth/logout` | Public (destroys session — safe to call unauthenticated) |
| `/api/admin/auth/me` | Defense-in-depth session check inside handler |
| All other `/admin/*` pages | Middleware redirects to `/admin/login` if no session |
| All other `/api/admin/*` routes | Middleware returns 401 JSON if no session |

Defense-in-depth: every API route handler also calls `getAdminSession()` and checks `session.ownerId` independently. Middleware bypass (misconfiguration, Next.js regression) would still be blocked at the handler layer.

---

## Authentication

- **Library:** iron-session v8 — seals a JSON session payload in an AES-GCM httpOnly cookie using a symmetric secret
- **Cookie name:** `nrg_admin_session`
- **Cookie options:**

| Option | Value |
|---|---|
| `httpOnly` | `true` — not readable by JavaScript |
| `secure` | `true` in production, `false` in dev (allows http://localhost) |
| `sameSite` | `lax` — CSRF protection without breaking top-level navigations |
| `maxAge` | 604800 seconds (7 days) |
| `path` | `/` |

- **Single user:** `ownerId: 'noah'` in session payload — no multi-user, no roles
- **Password:** bcryptjs hash at cost factor 12, stored in env var `ADMIN_PASSWORD_HASH`
- **Session secret:** stored in env var `SESSION_SECRET` (minimum 32 characters)

---

## How credentials are set

See `docs/admin-setup.md` for the full step-by-step. Summary:

1. Generate a bcrypt hash of your password:
   ```bash
   node -e "require('bcryptjs').hash('yourpassword', 12).then(h => console.log(h))"
   ```

2. Generate a session secret:
   ```bash
   openssl rand -base64 32
   ```

3. Set these three env vars in Netlify's dashboard (Site → Configuration → Environment variables):
   - `ADMIN_USERNAME` = `noah`
   - `ADMIN_PASSWORD_HASH` = the hash from step 1
   - `SESSION_SECRET` = the secret from step 2

4. For local dev, set these in `.env.local`. **Important:** escape every `$` in the bcrypt hash as `\$` in `.env.local` (Next.js dotenv expansion treats bare `$` as a variable reference). No escaping needed in Netlify's UI.

---

## Fail-closed behavior

`src/middleware.ts` checks for all three required env vars (`ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`) at the top of every request before doing anything else.

- **Missing env var →** 503 on all `/admin/*` and `/api/admin/*` routes
- **No silent fallback** — there is no default password, no "dev mode" bypass
- **No unhandled exception** — the check is synchronous and returns before any session logic runs

The login API route (`/api/admin/auth/login`) performs the same env-var guard as a belt-and-suspenders check.

---

## Brute-force protection

Login attempts are rate-limited by client IP at `POST /api/admin/auth/login`.

- **Window:** 15 minutes (rolling)
- **Limit:** 5 failed attempts per IP per window
- **On 6th failed attempt:** 429 response with `Retry-After` header (seconds until window resets) and body `{ error: "Too many attempts. Try again in N minutes." }`
- **Successful login:** resets the counter for that IP
- **Only failed attempts count** — successful logins do not increment the counter

Implementation: `src/lib/admin/rate-limit.ts` — in-memory `Map<IP, failureTimestamps[]>` with rolling-window pruning on each check.

### Limitation

In-memory storage means each Netlify serverless function instance has its own independent counter. An attacker making requests across many concurrent cold-start containers would see separate 5-attempt limits per container, not a shared global limit.

**This is acceptable as a deterrent** for a single-owner admin panel accessed from known IPs. Production-grade brute-force protection against distributed attacks would require a shared external store (Redis/Upstash). For this use case, the rate limiter stops casual/automated single-source attacks.

---

## Timing-safe credential comparison

Both the username and password are compared using timing-safe operations to prevent enumeration via response-time analysis.

- **Username:** `crypto.timingSafeEqual` on `Buffer.from(input)` vs `Buffer.from(expected)`. Buffers are only compared when lengths match — a length mismatch returns `false` immediately (length is already leaked by network timing, but this is acceptable).
- **Dummy bcrypt on wrong username:** When the username does not match, `bcryptjs.compare()` is called against a dummy hash (`$2a$12$invalidhashpadding...`). This ensures the response time for a wrong-username attempt is approximately equal to a wrong-password attempt, preventing timing-based username enumeration.
- **Password:** `bcryptjs.compare()` is timing-safe by construction — it always runs the full bcrypt computation regardless of early character mismatches.

---

## Error messages

All error responses from auth endpoints are JSON. Messages are intentionally generic:

| Scenario | Status | Body |
|---|---|---|
| Missing env vars | 503 | `{ error: 'Admin not configured.' }` |
| Rate limited | 429 | `{ error: 'Too many attempts. Try again in N minutes.' }` |
| Wrong username or password | 401 | `{ error: 'Invalid credentials.' }` |
| Missing request fields | 400 | `{ error: 'Username and password are required.' }` |
| Unauthenticated API access | 401 | `{ error: 'Unauthorized' }` |

The 401 message is always "Invalid credentials." regardless of which field was wrong — no username enumeration via error message.

---

## Defense-in-depth summary

| Layer | Mechanism |
|---|---|
| Edge middleware | Session cookie verified via `unsealData()` on every request |
| API route handlers | `getAdminSession()` + `ownerId` check in every handler |
| Env var guard | `requireAdminEnv()` at top of login handler |
| Rate limiting | 5 failed attempts per IP per 15-minute window |
| Timing safety | `timingSafeEqual` for username, bcrypt for password, dummy bcrypt on wrong username |
| Cookie security | httpOnly, secure (prod), sameSite=lax, 7-day maxAge |
| Generic error messages | No field-level error disclosure |
| Search engine exclusion | `Disallow: /admin` in robots.txt; no admin URLs in sitemap.xml |
| No secrets in code | All credentials in env vars; no hardcoded hashes |

---

## What's NOT covered

| Feature | Reason not included |
|---|---|
| Multi-user / RBAC | Single-owner tool — one set of credentials |
| CSRF tokens | `sameSite: lax` provides same-origin protection without extra tokens |
| 2FA / TOTP | Not in scope for Phase 1 |
| Audit log of login attempts | Not stored; add in Phase 2 if needed |
| Global rate limiting (multi-instance) | Requires external Redis/Upstash — see Brute-force Limitation above |
| IP allowlist | Not in scope; would require Netlify Edge Functions or a WAF |

---

## Manual checks (Noah, after each Netlify deploy)

1. Visit `https://nrgwebsites.com/admin/login` — login form loads (not 503)
2. Enter wrong password 5 times — 6th attempt returns 429 with a retry message
3. Log in with correct credentials — land on `/admin/leads`
4. Refresh `/admin` while logged in — stays on `/admin/leads` (not redirected)
5. Log out — browser returns to `/admin/login`
6. After logout, refresh `/admin` — redirected back to `/admin/login`
7. Try `GET https://nrgwebsites.com/api/admin/leads` without session — returns 401 JSON
