# Admin Panel — Plan

## Goal & non-negotiables

Build a private `/admin` operations hub directly inside the existing Next.js site (nrgwebsites.com). The owner logs in with a username + password, gets a three-tab dashboard (LEADS, CLIENTS, ANALYTICS), and can manage the full sales pipeline from cold prospect to paying client. Must be genuinely secure (no auth-bypass paths, fail-closed on missing env), visually identical to the public site (dark canvas, cyan accents, Syne/DM Sans/DM Mono fonts, grain overlay), and compatible with Netlify's free tier. No external database. No agency-level complexity.

---

## Auth choice

- **Library:** `iron-session` v8 (`iron-session` npm package)
- **Why:** Single-user use case — iron-session is purpose-built for exactly this. It seals a JSON session payload into an httpOnly cookie using a symmetric secret (AES-GCM via the `iron` algorithm). No OAuth dance, no database for sessions, no JWTs flying around in headers. Ships with Edge-runtime support, so middleware can read and verify the cookie without a Node.js runtime hop. Zero external service dependency. `next-auth` is overkill (OAuth providers, adapter layer, DB sessions); Lucia is newer and less battle-tested for this exact shape; custom JWT would mean implementing the sealing ourselves.

- **Env vars required:**
  - `ADMIN_USERNAME` — plaintext username (no discovery risk; username is not the secret)
  - `ADMIN_PASSWORD_HASH` — bcrypt hash of the owner's password (cost factor 12)
  - `SESSION_SECRET` — 32+ random bytes, base64 or hex — the iron-session sealing key

- **Cookie shape:**
  ```
  name:     "nrg_admin_session"
  httpOnly: true
  secure:   true  (NODE_ENV === 'production'; false in dev so http://localhost works)
  sameSite: "lax"
  maxAge:   60 * 60 * 24 * 7   // 7 days; re-login required after
  path:     "/"
  ```

- **Fail-closed behavior:** The middleware (`src/middleware.ts`) runs on EVERY request to `/admin/*`. At the top of the middleware it checks that `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, and `SESSION_SECRET` are all present in `process.env`. If any are missing it immediately returns `NextResponse.json({ error: "Service unavailable" }, { status: 503 })`. It never falls through to an "open" state. The login API route (`/api/admin/login`) performs the same check before doing anything.

- **Password hashing:** `bcryptjs` (pure-JS bcrypt, no native bindings — important for Netlify's build environment). Owner generates the hash locally:
  ```bash
  node -e "const b=require('bcryptjs'); b.hash('yourpassword', 12).then(h => console.log(h))"
  ```
  That hash goes into Netlify's environment variable UI as `ADMIN_PASSWORD_HASH`. Never committed to git.

- **Login flow:**
  1. POST `/api/admin/login` with `{ username, password }` — server-only route
  2. Server checks username match (constant-time string compare via `crypto.timingSafeEqual`)
  3. Server checks password with `bcryptjs.compare(password, hash)`
  4. On success: `req.session.admin = { loggedIn: true }`, `await req.session.save()`
  5. Return 200 with `{ ok: true }`; client redirects to `/admin`
  6. On failure: return 401 — same message regardless of which field was wrong

- **Logout flow:** POST `/api/admin/logout` → `req.session.destroy()` → redirect to `/admin/login`

---

## Data store choice

- **Store:** File-system JSON via Node.js `fs/promises` — two files: `data/leads.json` and `data/clients.json`
- **Why:** The site deploys to Netlify Free. Netlify Blobs IS the recommended native store — but it requires the `@netlify/blobs` package and the Netlify build environment's blob handles, which are unavailable during `npm run dev` locally (the dev fallback story becomes "install netlify-cli + netlify dev" which is a heavy prerequisite). Netlify's free tier also has function invocation limits that become a concern if the admin panel is actively used. For a solo operator with dozens of leads and a handful of clients, JSON files on the filesystem are perfectly reliable and have zero cold-start, zero external dependency, and zero cost.

  **Important caveat for Netlify:** Netlify's serverless functions run in ephemeral containers — filesystem writes do NOT persist across deploys or cold starts. The JSON files live in the repo and are deployed as part of the site. Writes made via the API routes persist only for the lifetime of that function container. This is acceptable for a solo operator: Noah keeps the data in git (or exports it periodically via the JSON export endpoint). The `data/` directory is gitignored for production data but seeded with empty arrays for local dev. If persistence across deploys becomes a concern, the data layer can be migrated to Netlify Blobs by changing only `src/lib/admin/db.ts` — the API routes and types are unchanged.

  **Alternative path to Netlify Blobs** (Backend Dev may implement this instead if Noah confirms he wants it): Replace `src/lib/admin/db.ts` with a Blobs implementation that uses `getStore('leads')` and `getStore('clients')`. The rest of the codebase is unaffected because nothing imports `db.ts` directly except the API routes.

- **Local-dev fallback:** Because the store is `fs/promises` JSON, `npm run dev` works out of the box with no additional tooling. `data/leads.json` and `data/clients.json` are created automatically on first write if they don't exist.

- **Backup story:** `GET /api/admin/export` returns the full `leads.json` + `clients.json` as a combined JSON download. Owner bookmarks this URL and downloads periodically. This is the complete backup mechanism.

---

## Route + file structure

```
src/
├── middleware.ts                          # Edge — protects /admin/* (reads iron-session cookie)
│
├── lib/
│   └── admin/
│       ├── types.ts                       # ★ Architect-owned — all types + scoring logic
│       ├── auth.ts                        # iron-session config + getSession() helper
│       └── db.ts                          # readLeads/writeLeads/readClients/writeClients (fs/promises)
│
├── app/
│   ├── admin/
│   │   ├── layout.tsx                     # Admin shell layout — dark sidebar + tab nav, NO public Nav/Footer
│   │   ├── page.tsx                       # /admin — redirects to /admin/leads
│   │   ├── login/
│   │   │   └── page.tsx                   # /admin/login — login form page (no layout wrapping)
│   │   ├── leads/
│   │   │   └── page.tsx                   # /admin/leads — LEADS tab (server component, fetches data)
│   │   ├── clients/
│   │   │   └── page.tsx                   # /admin/clients — CLIENTS tab
│   │   └── analytics/
│   │       └── page.tsx                   # /admin/analytics — ANALYTICS tab
│   │
│   └── api/
│       └── admin/
│           ├── login/route.ts             # POST — verify credentials, set session
│           ├── logout/route.ts            # POST — destroy session
│           ├── leads/
│           │   ├── route.ts               # GET (list) + POST (create)
│           │   └── [id]/
│           │       ├── route.ts           # GET + PATCH + DELETE
│           │       └── convert/route.ts   # POST — convert lead to client
│           ├── clients/
│           │   ├── route.ts               # GET (list) + POST (create)
│           │   └── [id]/route.ts          # GET + PATCH + DELETE
│           ├── analytics/route.ts         # GET — aggregated analytics payload
│           └── export/route.ts            # GET — full JSON dump for backup
│
└── components/
    └── admin/
        ├── AdminShell.tsx                 # Sidebar + tab bar wrapper (client component)
        ├── LeadsTab.tsx                   # LEADS tab UI — table + add/edit form (client)
        ├── ClientsTab.tsx                 # CLIENTS tab UI (client)
        ├── AnalyticsTab.tsx               # ANALYTICS tab UI — stat cards + pipeline view (client)
        ├── LeadDrawer.tsx                 # Slide-in drawer for lead detail/edit (client)
        ├── ClientDrawer.tsx               # Slide-in drawer for client detail/edit (client)
        ├── PipelineBoard.tsx              # Kanban-style stage columns for LEADS tab (client)
        ├── StageSelector.tsx              # Dropdown for changing a lead's pipeline stage (client)
        ├── ScoreDisplay.tsx               # Visual score badge (0–9 range) (client)
        └── LoginForm.tsx                  # Login form — email + password fields (client)

data/
├── leads.json                             # gitignored in production; seeded empty [] locally
└── clients.json                           # gitignored in production; seeded empty [] locally
```

**Admin layout exclusion from public layout:** `src/app/admin/layout.tsx` does NOT import `Nav`, `Footer`, or `FloatingCta`. It is a completely separate layout. The root `src/app/layout.tsx` wraps everything with fonts, so fonts are available in admin for free.

**Login page exclusion from admin layout:** `src/app/admin/login/page.tsx` uses `export const metadata` and renders a standalone centered form. It must NOT be wrapped by `src/app/admin/layout.tsx`. Accomplish this by having the login page export its own standalone layout or by using a route group: `src/app/admin/(auth)/login/page.tsx` with no layout.tsx in the `(auth)` group. This way the main admin layout only wraps the authenticated tabs.

Recommended route group structure:
```
src/app/admin/
├── (auth)/
│   └── login/page.tsx       # standalone — no sidebar
├── (dashboard)/
│   ├── layout.tsx           # sidebar + tab nav
│   ├── page.tsx             # → redirect to leads
│   ├── leads/page.tsx
│   ├── clients/page.tsx
│   └── analytics/page.tsx
```

---

## Data models

See `src/lib/admin/types.ts` (Architect-owned file, written alongside this plan).

Key design decisions documented here for Backend/Frontend context:

- **`stageHistory`** is an append-only log. Every time the stage changes, a new `StageHistoryEntry` is pushed. Never mutate history. This enables Phase-2 velocity analytics (time-in-stage, funnel drop-off) without any schema changes.

- **`scoreFactors`** are booleans — the owner checks boxes, the server computes `score` via `computeScore()`. The computed `score` is stored (denormalized) for fast sorting. When factors change, score must be recomputed on every PATCH.

- **`touchCount`** is incremented by the owner manually (or automatically when `emailedAt`/`calledAt` are set via PATCH). It counts total meaningful contacts.

- **`convertedClientId`** links a won lead to the client record. Archived leads (stage=Won) stay in `leads.json` for historical reporting; they are not deleted.

- **`sourceLeadId`** on `Client` links back to the originating lead. Enables LTV-by-source analytics in Phase 2.

---

## Pipeline stages + scoring formula

**Stages (ordered):**
```
Found → Researched → Emailed → Called → Follow-up → Proposal → Won → Lost
```

- **Found:** Spotted on Google Maps / walk-in / referral. Business name + basic info added.
- **Researched:** Noah has looked at their current web presence, confirmed bad/no site, confirmed they seem to be making money.
- **Emailed:** First outreach sent.
- **Called:** Phone conversation attempted or completed.
- **Follow-up:** Sent second touch; waiting on response.
- **Proposal:** Active quote discussion in progress.
- **Won:** Closed. Client record created.
- **Lost:** Dead end — no response after multiple touches, or explicitly declined.

**Close probability by stage** (used for weighted pipeline value):
```
Found:      3%
Researched: 8%
Emailed:   12%
Called:    25%
Follow-up: 35%
Proposal:  60%
Won:      100%
Lost:       0%
```

**Scoring formula — 4 factors, max score 9.0:**
```
badOrNoWebsite:     +3.0   (highest weight — clearest buying signal)
clearlyMakingMoney: +2.5   (they can afford it)
easyToReach:        +2.0   (contact info found; likely responsive)
goodNicheFit:       +1.5   (restaurant / HVAC / law / salon — Noah's sweet spot)

Total range: 0.0 – 9.0
```

Score 7–9 = hot lead (badge: cyan). Score 4–6 = warm (badge: yellow-ish `#F5A623`). Score 0–3 = cold (badge: ink-subtle).

---

## Convert-to-client operation

Endpoint: `POST /api/admin/leads/[id]/convert`
Request body: `{ monthlyCharge: number, oneTimeValue: number, siteUrl: string, startDate: string }`

**Side effects (atomic — both writes must succeed or neither is committed):**
1. Read `leads.json`, find lead by `id` — 404 if not found
2. Verify lead stage is not already `Won` or `Lost` — 409 if already converted
3. Generate new `clientId = crypto.randomUUID()`
4. Create `Client` record:
   - `id`: clientId
   - `businessName`, `contactName`, `phone`, `email`: copied from Lead
   - `siteUrl`, `monthlyCharge`, `oneTimeValue`, `startDate`: from request body
   - `status`: `"active"`
   - `sourceLeadId`: lead.id
   - `notes`: `"Converted from lead — " + lead.notes` (prepend context)
   - `lastInvoicedAt`: null
   - `lastVerifiedAt`: null
   - `createdAt` / `updatedAt`: now ISO
5. Append client to `clients.json`
6. Mutate lead: `stage = "Won"`, push `stageHistory` entry, `convertedClientId = clientId`, `updatedAt = now`
7. Write `leads.json`
8. Return `{ client, lead }` with 201

**Atomicity note:** `fs/promises` is not transactional. Write clients first, then leads. If the second write fails, run a compensation: re-read clients, remove the new entry, re-write. Log both failure and compensation result.

---

## Analytics aggregations

`GET /api/admin/analytics` returns:

```typescript
type AnalyticsPayload = {
  // Revenue
  totalMrr: number;               // sum of monthlyCharge for all active clients
  totalOneTimeRevenue: number;    // sum of oneTimeValue for all clients (ever)
  avgOneTimeValue: number;        // totalOneTimeRevenue / total client count

  // Pipeline
  activePipelineValue: number;    // sum over non-Won/Lost leads: averageProjectValue * stageProbability
  leadsByStage: Record<PipelineStage, number>;  // count per stage
  totalLeads: number;
  totalWon: number;
  totalLost: number;
  winRate: number;                // totalWon / (totalWon + totalLost), 0 if both 0

  // Outreach performance
  totalTouches: number;           // sum of touchCount across all leads
  leadsEmailed: number;           // leads with emailedAt !== null
  emailResponseRate: number | null;  // (Called + Follow-up + Proposal + Won) / Emailed; null if 0 emailed
  // Phase-2 deferred: compare emailResponseRate to 3.43% avg / 5% good / 10% great benchmarks

  // Clients
  activeClients: number;
  pausedClients: number;
  churnedClients: number;

  // Follow-up urgency
  overdueFollowUps: number;       // leads with followUpAt < today's ISO date, stage not Won/Lost
  followUpsToday: number;         // followUpAt === today's ISO date

  // Score distribution
  hotLeads: number;               // score >= 7
  warmLeads: number;              // score >= 4 && < 7
  coldLeads: number;              // score < 4
}
```

`averageProjectValue` for pipeline calculation: use `800` (midpoint of $500–$1100 typical project range — Backend Dev should make this a constant in `db.ts` or `types.ts`, named `AVG_PROJECT_VALUE`).

---

## Components reused from public site

**Design tokens (always use these, never hardcode hex):**
- `bg-canvas` (#0A0A0A) — page/panel backgrounds
- `bg-surface-1` (#111111) — cards, sidebar background
- `bg-surface-2` (#161616) — elevated cards, input backgrounds
- `bg-surface-3` (#1C1C1C) — URL bar, sub-section fills
- `text-accent` / `border-accent` (#00D4FF) — active tabs, badges, CTAs, focus rings
- `border-hairline` / `border-hairline-strong` — dividers, card borders
- `text-ink` / `text-ink-secondary` / `text-ink-subtle` — text hierarchy
- `font-display` (Syne 800) — headings, stat numbers, dashboard title
- `font-mono` (DM Mono) — labels, table headers, tags, breadcrumbs
- `font-sans` (DM Sans) — body, form inputs, table cells

**CSS utility classes from `globals.css`:**
- `.text-display` — Syne 800, -0.04em tracking, 0.95 line-height — use for tab headings + stat cards
- `.page-top` — top padding for non-hero pages — use on the admin dashboard main area
- `.container-content` — max-width 1280px with responsive padding — use inside admin layout
- `.section-pad` / `.py-section` — consistent vertical rhythm — use for panel sections

**Component patterns to replicate (not import) in admin components:**
- `ServiceCard.tsx` hover pattern: `border-accent/20 → border-accent` on hover + `hover:-translate-y-1 hover:shadow-card-hover` — reuse for stat cards in AnalyticsTab
- `TestimonialCard.tsx` left-border pattern: `border-l-2 border-accent/35 pl-6` — reuse for lead detail cards in LeadDrawer
- `ContactForm.tsx` input style: `rounded-md border border-hairline bg-surface-2 px-4 py-3.5 text-base text-ink placeholder:text-ink-subtle transition-colors focus:border-accent focus:outline-none` — copy this class string verbatim for all admin form inputs
- `globals.css` focus-visible style: already covers `input:focus-visible` with 2px cyan outline — admin inputs get this for free

**Components NOT imported into admin (avoid creating dependencies):**
- `Nav.tsx` — admin has its own sidebar nav
- `Footer.tsx` — no footer in admin
- `FloatingCta.tsx` — not relevant in admin
- `HeroHeadline.tsx` — animation component for public hero only
- `BrowserMockup.tsx` — no mockups in admin

---

## File ownership between Backend and Frontend

**Backend Dev owns:**
- `src/middleware.ts`
- `src/lib/admin/auth.ts`
- `src/lib/admin/db.ts`
- `src/app/api/admin/login/route.ts`
- `src/app/api/admin/logout/route.ts`
- `src/app/api/admin/leads/route.ts`
- `src/app/api/admin/leads/[id]/route.ts`
- `src/app/api/admin/leads/[id]/convert/route.ts`
- `src/app/api/admin/clients/route.ts`
- `src/app/api/admin/clients/[id]/route.ts`
- `src/app/api/admin/analytics/route.ts`
- `src/app/api/admin/export/route.ts`
- `data/leads.json` (create empty `[]`)
- `data/clients.json` (create empty `[]`)
- `.env.example` additions: `ADMIN_USERNAME=`, `ADMIN_PASSWORD_HASH=`, `SESSION_SECRET=`
- `package.json` additions: `iron-session`, `bcryptjs`, `@types/bcryptjs`

**Frontend Dev owns:**
- `src/app/admin/(auth)/login/page.tsx`
- `src/app/admin/(dashboard)/layout.tsx`
- `src/app/admin/(dashboard)/page.tsx`
- `src/app/admin/(dashboard)/leads/page.tsx`
- `src/app/admin/(dashboard)/clients/page.tsx`
- `src/app/admin/(dashboard)/analytics/page.tsx`
- `src/components/admin/AdminShell.tsx`
- `src/components/admin/LeadsTab.tsx`
- `src/components/admin/ClientsTab.tsx`
- `src/components/admin/AnalyticsTab.tsx`
- `src/components/admin/LeadDrawer.tsx`
- `src/components/admin/ClientDrawer.tsx`
- `src/components/admin/PipelineBoard.tsx`
- `src/components/admin/StageSelector.tsx`
- `src/components/admin/ScoreDisplay.tsx`
- `src/components/admin/LoginForm.tsx`

**Shared (Architect-owned, written now):**
- `src/lib/admin/types.ts` — all types, constants, `computeScore()`, `lifetimeValue()`

**Coordination note:** Frontend Dev will call the API routes via `fetch('/api/admin/...')` from client components. The contract is the types in `types.ts` — both sides must import from there, never inline their own type definitions.

---

## Robots/sitemap

**`src/app/robots.ts` — add Disallow for /admin:**
```typescript
// Existing: rules: { userAgent: '*', allow: '/' }
// Change to:
rules: [
  { userAgent: '*', allow: '/', disallow: '/admin' },
]
```

**`src/app/sitemap.ts` — no changes needed.** `/admin` is not added. Sitemap currently has 20 URLs, all public. Do not add any `/admin/*` URLs.

---

## Build & deploy compatibility

**Static generation:** The admin pages use `export const dynamic = 'force-dynamic'` (Backend/Frontend must add this to each admin page file). Without it, Next.js 14 App Router may attempt to statically generate the page at build time, which will fail because it reads session cookies.

**Netlify runtime:**
- All `/api/admin/*` routes must have `export const runtime = 'nodejs'` (matching the existing `/api/contact/route.ts` pattern). They use `fs/promises` which is not available on the Edge.
- `src/middleware.ts` runs on the Edge runtime (default for middleware). `iron-session` supports Edge via its Web Crypto API path. **The middleware must NOT import `db.ts` or `bcryptjs`** — those are Node.js-only. The middleware only reads and verifies the session cookie (iron-session handles this on Edge).
- `src/lib/admin/auth.ts` is used in both Edge (middleware, session read) and Node.js (API routes, session write) contexts. Keep it to iron-session config + `getSession()` only — no `fs`, no `bcryptjs`.

**No `netlify.toml` exists.** Netlify auto-detects Next.js via `@netlify/plugin-nextjs` (installed automatically). No manual config needed for the standard case. If the Backend Dev needs to set function timeout for the export endpoint, a `netlify.toml` can be created then:
```toml
[functions]
  node_bundler = "nft"
[functions."api/admin/export"]
  external_node_modules = ["fs"]
```

**`data/` directory:** Add `data/*.json` to `.gitignore` for production data. BUT commit `data/leads.json` and `data/clients.json` as empty arrays (`[]`) so the directory exists at deploy time. Netlify's build will include these files. Runtime writes will work for the container's lifetime.

---

## Phase-2 deferred metrics

The following analytics are deferred to Phase 2 but the **data is captured now**:

| Metric | Data captured now | What's deferred |
|---|---|---|
| Reply rate vs benchmark (3.43% avg / 5% good / 10% great) | `emailedAt`, stage transitions | Benchmark comparison UI, color-coded badge |
| Sales velocity (avg days per stage) | `stageHistory` with ISO timestamps | Aggregation endpoint + chart |
| Funnel drop-off by stage | `stageHistory` entries | Drop-off % calculation + visualization |
| Source-channel ROI | `source` field (free-text) | Parsing `source` into buckets + revenue attribution |
| Touch-to-close ratio | `touchCount` | Avg touches-per-won calculation |

**`stageHistory` is the key.** Every stage change appends `{ stage, at: new Date().toISOString() }`. Time-in-stage is `stageHistory[i+1].at - stageHistory[i].at`. This enables full velocity analytics in Phase 2 without any data migration.
