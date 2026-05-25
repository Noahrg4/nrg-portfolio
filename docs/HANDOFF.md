# Session Handoff — NRG Portfolio

**Last commit:** `4fecacc` (Netlify build fix — see §6 below)
**Live site:** https://nrgwebsites.com — deployed via Netlify auto-deploy on push to `main`
**Repo:** https://github.com/Noahrg4/nrg-portfolio
**Stack:** Next.js 14 App Router · TypeScript · Tailwind v3 · Framer Motion v12 · next/font · Netlify
**Routes live:** 20 public + `/admin` (auth-gated)

This doc supersedes any conflict with [CLAUDE.md](../CLAUDE.md) — that file was written early in the session and is now stale on several fronts (see §7).

---

## 1. What's actually built right now

### Public site (20 routes)
- **4 location homepages** — `/`, `/houston`, `/texas`, `/michigan` (location content via `src/lib/locationContent.ts`)
- **4 shared root pages** — `/work`, `/about`, `/services`, `/contact`
- **12 location sub-pages** — `/{houston,texas,michigan}/{work,about,services,contact}` — thin wrappers that pass `location="..."` into shared components
- Shared page components: `src/components/pages/{WorkPage,AboutPage,ServicesPage,ContactPage}.tsx`
- Location homepage template: `src/components/LocationPage.tsx`
- Content map (single source of truth for per-location copy): `src/lib/locationContent.ts` — has 20+ fields per location now

### Admin panel (`/admin`, env-gated)
- **Auth:** iron-session v8 sealed httpOnly cookie, bcryptjs hash, `src/middleware.ts` fail-closed if env vars missing, 5/15-min rate limit on login
- **Data:** file-system JSON (`data/leads.json`, `data/clients.json`) via `src/lib/admin/db.ts` (atomic temp-write + rename). **Caveat:** Netlify serverless containers are ephemeral — production writes don't persist across deploys. `/api/admin/export` is the backup mechanism.
- **3 tabs:** Leads / Clients / Analytics — see `src/components/admin/` and `src/app/admin/(dashboard)/`
- **API:** 16 routes under `/api/admin/` (CRUD + bulk + export + analytics aggregations)
- **Login URL:** https://nrgwebsites.com/admin/login
- **Owner credentials (env vars on Netlify, set this session):**
  - `ADMIN_USERNAME` = `rg`
  - `ADMIN_PASSWORD_HASH` = bcrypt hash of `Baseballtrack!101` (rotate if needed — see [docs/admin-setup.md](admin-setup.md))
  - `SESSION_SECRET` = 48-byte base64 random
- Full setup + threat model: [docs/admin-setup.md](admin-setup.md), [docs/admin-security.md](admin-security.md)

---

## 2. Pitfalls that cost real time — don't repeat

### 2.1 `npm run build` corrupts the dev cache
Running `npm run build` while a dev server is alive (the user usually has one on `:3001`) clobbers shared chunks in `.next/`. Next request to the dev server crashes with `Cannot find module './948.js'`. Fix is `rm -rf .next && restart dev server`.

**Use instead:**
- `npx tsc --noEmit` — type check
- `npm run lint` — ESLint check
- **Netlify build = real build check.** Don't try to validate `next build` locally if the user has dev running.

### 2.2 `npx tsc --noEmit` ≠ build verification
`next build` runs ESLint as a final gate. `npx tsc --noEmit` doesn't. Two Netlify deploys failed because agents only ran `tsc` and missed:
- Unused vars (even `_`-prefixed; fixed via project-wide `.eslintrc.json` rule update)
- A real Hooks Rule violation (`useRef`/`useEffect` called after an early return)

**Run both `npx tsc --noEmit` AND `npm run lint` before pushing.** Lint usually finishes in <5s.

### 2.3 Agents not committing
Several agents in earlier rounds wrote files to the working tree but forgot `git add` + commit. Orchestrator had to clean up after them. Subsequent agent prompts that explicitly say "commit each chunk and verify with `git log --oneline -5` before reporting" worked reliably.

### 2.4 File-ownership conflicts in multi-agent runs
The "5 parallel agents" pattern works ONLY when files are truly disjoint. When briefs assign agents overlapping editorial authority (e.g., "Agent 1: all /admin UI" + "Agent 2: data tabs" + "Agent 5: shared primitives" — all overlapping in `src/components/admin/`), they race on the Edit tool. **Default to sequential** for UI work; reserve parallel for genuinely disjoint scopes (auth backend vs UI; multiple URL extraction scopes).

### 2.5 Native bcrypt fails Netlify build
Use `bcryptjs` (pure JS), not `bcrypt` (native bindings). Documented in [docs/admin-security.md](admin-security.md).

---

## 3. Major work shipped this session

In rough chronological order:

| # | Theme | Key commits |
|---|---|---|
| 1 | Project card link logic + dead-code cleanup | `247b609`, `f2a6908` |
| 2 | Mobile hero visibility on location pages | `d701a3c` |
| 3 | Location sub-pages (12 new) + Nav `linkPrefix` + Card titles per location | `5ead41f`, `94138f6`, `caf369b` |
| 4 | SectionHeading fragility fix (CTA band heading disappearing) | `8b82465` |
| 5 | Mobile UX + performance pass (5 agents) — tap targets, safe-area, next/image, next/font | `cbb603c` through `2a20fe5` |
| 6 | Location-text accuracy (Houston references on Texas/Michigan pages) | `fbb6af9`, `08d1ec5`, `53f0af3`, `c68f0fe`, `79f5651`, `34904e5` |
| 7 | Domain migration `nrgbuilds.com` → `nrgwebsites.com` | `74d5c93` |
| 8 | Site text extraction (live-site snapshot in `/nrg-text/`) | `b359e9c` |
| 9 | Copy overhaul (Fortune 100 line, "about two weeks" timeline, no city in shared copy, etc.) | `969e29c` |
| 10 | Testimonial attribution cleanup (no business names in secondaries; "Williams HVAC" out of featured) | `daae281` |
| 11 | `/admin` panel build (auth + 3 tabs + 16 API routes + docs) | `17fab87` |
| 12 | Admin polish pass (6 agents — visual, data display, auth hardening, lead UX, UI patterns + final QA) | `956032b` |
| 13 | Netlify build fix (ESLint + Hooks Rule violation) | `4fecacc` |

Full commit log: `git log --oneline` (40+ commits this session).

---

## 4. Architecture quick map

```
src/
├── app/
│   ├── (public routes — all under root)
│   │   ├── page.tsx                  # / — root location homepage
│   │   ├── houston/page.tsx          # /houston
│   │   ├── texas/page.tsx
│   │   ├── michigan/page.tsx
│   │   ├── work/page.tsx             # shared, defaults to root location
│   │   ├── about/, services/, contact/
│   │   ├── houston/{work,about,services,contact}/page.tsx   # thin wrappers
│   │   ├── texas/...                                         # 4 each
│   │   └── michigan/...
│   ├── admin/                        # AUTH-GATED
│   │   ├── layout.tsx                # outer shell — no public Nav/Footer
│   │   ├── (auth)/login/page.tsx
│   │   └── (dashboard)/{layout,page,leads,clients,analytics}/
│   ├── api/admin/                    # 16 routes — auth + leads + clients + analytics
│   ├── api/contact/                  # public contact form → Resend
│   ├── sitemap.ts, robots.ts         # /admin disallowed; 20 public URLs
│   └── layout.tsx                    # root layout + next/font
├── components/
│   ├── (public)                      # Nav, Footer, LocationPage, BrowserMockup, etc.
│   ├── pages/                        # WorkPage, AboutPage, ServicesPage, ContactPage (shared)
│   └── admin/                        # admin-only UI components (~25 files)
├── lib/
│   ├── locationContent.ts            # SINGLE SOURCE OF TRUTH for per-location copy
│   ├── projects.ts, services.tsx, testimonials.ts  # public site data
│   └── admin/
│       ├── types.ts                  # Lead, Client, AnalyticsPayload
│       ├── auth.ts, db.ts, rate-limit.ts, aggregations.ts, format.ts
├── middleware.ts                     # admin route protection (Edge)
└── hooks/useKeyboardShortcuts.ts

data/                                 # leads.json, clients.json (gitignored data area)
docs/                                 # 20+ docs — see §5
public/                               # work screenshots, headshot
```

---

## 5. Where to look in `docs/` for each topic

- [CLAUDE.md](../CLAUDE.md) — **partially stale**, see §7
- [docs/admin-plan.md](admin-plan.md) — admin architecture decisions
- [docs/admin-setup.md](admin-setup.md) — owner setup for /admin
- [docs/admin-security.md](admin-security.md) — auth threat model
- [docs/admin-qa-report.md](admin-qa-report.md), [docs/admin-qa-final.md](admin-qa-final.md) — admin QA passes
- [docs/MOBILE-QA-REPORT.md](MOBILE-QA-REPORT.md) — mobile pass results
- [docs/LOCATION-FIX-REPORT.md](LOCATION-FIX-REPORT.md) — nav + card title scoping fix
- [docs/LOCATION-TEXT-QA-REPORT.md](LOCATION-TEXT-QA-REPORT.md) — location-text accuracy verification
- [docs/copy_overhaul_report.md](copy_overhaul_report.md), [docs/copy_overhaul_changes.md](copy_overhaul_changes.md) — copy overhaul
- [nrg-text/nrg-text-full.md](../nrg-text/nrg-text-full.md) — full site text snapshot from extraction

**Stale, do not trust without verifying against current code:**
- [docs/QA-REPORT.md](QA-REPORT.md) — early QA, references components no longer present
- [docs/COPY-DECK.md](COPY-DECK.md) — pre-overhaul copy spec
- [docs/SETUP.md](SETUP.md) — references Vercel; we're on Netlify
- [docs/LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md) — pre-deploy
- [docs/LINK-MAP.md](LINK-MAP.md) — generated before sub-page linkPrefix work

---

## 6. Open items the next agent might pick up

### Code-side (next agent can do these)
- **Tokenize amber color** — `#F5A623` is hardcoded in ~9 admin components. Add `amber: "#F5A623"` to `tailwind.config.ts` `status` object, then replace `text-[#F5A623]` → `text-status-amber` etc. Pure refactor, no user-visible change. (Flagged in `docs/admin-qa-final.md` as deferred.)
- **EmptyState/LoadingState adoption** — primitives built in `src/components/admin/` but the 3 tabs still use inline empty/loading patterns. Swap them in.
- **Login form error copy** — API returns "Invalid credentials." but form shows "Invalid username or password." Trivial one-line fix in `src/components/admin/LoginForm.tsx`.
- **Project liveUrl values** — `src/lib/projects.ts` has an optional `liveUrl?: string` field for clickable project cards on `/work`. None set yet — cards are non-clickable.
- **Phase-2 analytics** — `src/lib/admin/types.ts` `AnalyticsPayload` already exposes the data needed for reply-rate vs benchmarks, sales velocity, funnel drop-off, source-channel ROI. UI just doesn't render them. Brief deferred this; activate when there's enough lead volume to be meaningful.

### Content-side (needs Noah's input — don't invent)
- **Real testimonials.** All 3 are placeholders in `src/lib/testimonials.ts` (Marcus Williams / Brittany Alvarez / David Nguyen). Live on the site since the most recent push. **FTC risk** — replace before serious outreach.
- **Real phone number.** `(989) 488-7309` is Noah's real number. Verify before assuming it should stay.
- **Service-page prices.** Currently $100 / $100 / $50 / $20/mo on `/services`. Copy QA flagged these as "likely needs upward revision" — separate business call.
- **"8 businesses live"** badge — removed during copy overhaul (replaced with "Small businesses, real results"). If/when a real count exists, decide whether to add it back.

### Netlify config (Noah owns)
- Env vars are set (`ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`). On free tier, secrets are scoped to Builds + Functions + Runtime (forced bundle — fine).
- Backup discipline: `data/leads.json` and `data/clients.json` are ephemeral on Netlify. Use `/api/admin/export` (admin auth required) to download a backup before any significant deploy.

---

## 7. CLAUDE.md is stale on these points

These are things the project handbook (`CLAUDE.md`) gets wrong as of this session. The next agent should NOT trust CLAUDE.md alone:

| CLAUDE.md says | Reality |
|---|---|
| "Hosting Setup — IN PROGRESS" | Deployed on Netlify weeks ago; live at nrgwebsites.com |
| Domain is `nrgbuilds.com` | Migrated to `nrgwebsites.com` (`74d5c93`) |
| "`noah-headshot.jpg` needs to exist" | It exists; rendered on /about and homepage about-teaser |
| ContactForm needs Resend wiring | Already wired; needs env vars set (also done) |
| `workSectionSub`, `contactHeadline`, `contactSub`, `internalLinkPrefix` are LocationContent fields | Removed in dead-code cleanup. New fields exist instead: `aboutTeaserHeadline`, `footerLocation`, `aboutPageHeadline`, `aboutBioParagraph1`, `aboutBioClosingLine`, `aboutLocationBadge`, `aboutSeoSkillBody`, `aboutHeadshotAlt`, `contactSidebarBlurb`, `contactBasedIn`, `contactServiceArea`, `workSectionHeading` |
| `StatusPill`, `StickyCtaBar` components | Deleted in dead-code cleanup |
| Project `outcome`, `tags`, `monogram` fields | Removed from Project type |
| Hero `clamp(1.75rem, 8vw, 9rem)` headline | Lowered floor to `clamp(1.5rem, 7.5vw, 9rem)` in mobile pass — prevents "Real Websites." wrap at 375px |
| `.section-pad` is `clamp(3rem, 8vw, 6rem)` | Mobile-only override tightens floor to 2.5rem |
| SectionHeading uses clipPath reveal via framer-motion | Replaced with plain `<h2>` — framer animation was unreliable, headings disappeared in CTA band |
| Various copy examples ("Built for Houston. By someone you can reach.") | All rewritten in copy overhaul — see `docs/copy_overhaul_changes.md` |

A focused CLAUDE.md rewrite is reasonable next work but not done in this session.

---

## 8. Useful conventions / patterns

- **Token-only colors.** All public-site colors come from `tailwind.config.ts` + `globals.css` CSS variables. Never use raw hex in Tailwind classes (`text-[#00D4FF]`). Exception: inline `style={}` for radial gradient orbs (CSS variables can't go inside `background: radial-gradient(...)` values).
- **CSS hover, framer entry.** Hover effects use Tailwind CSS (`hover:-translate-y-1 transition-transform duration-200`). Entry animations use framer-motion `whileInView`. Never combine `whileHover` + `whileInView` on the same motion element in v12 — IntersectionObserver fails silently and the element stays invisible.
- **noEntry on BrowserMockup.** When `<BrowserMockup>` is inside an animating wrapper (every card use), pass `noEntry={true}` so it doesn't run its own entry animation on top.
- **Mobile-only changes.** Use `max-md:` prefix or `@media (max-width: 767px)`. Never alter a desktop style during a mobile pass.
- **Admin polish:** `text-display` class doesn't include the admin's slightly looser `-0.03em` tracking — use `admin-page-title` from globals.css for admin headings if you want that.
- **Animations respect prefers-reduced-motion** — `useReducedMotion()` from framer-motion + the global media query in `globals.css`. Don't trust `useReducedMotion` to return a boolean on first render — it returns `null` initially, which can break conditional initial states in framer-motion (see SectionHeading history for what went wrong here).

---

## 9. The "if I were the next agent" first 10 minutes

1. `git log --oneline -20` — see what's recent
2. Read this file end-to-end
3. Skim [CLAUDE.md](../CLAUDE.md) but treat §7 of THIS doc as the diff
4. `/usr/bin/curl -sI https://nrgwebsites.com/` — confirm live
5. Open [docs/admin-plan.md](admin-plan.md) if anything admin-side comes up
6. **Don't run `npm run build`** if the user has dev running. Use `npx tsc --noEmit` + `npm run lint`.
7. If multi-agent: default to sequential unless files are genuinely disjoint.
8. Commit each chunk. Push only on explicit user instruction.

Good luck.
