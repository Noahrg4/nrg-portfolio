# NRG Portfolio — QA Report
**QA Agent:** QA2 (independent adversarial audit)
**Date:** 2026-05-23
**Build:** `npm run build` — PASS (zero errors, all 5 pages + /api/contact compiled clean)

---

## Impeccable Audit

Tool not found at `~/.agents/skills/impeccable/src/audit.mjs` — path does not exist in this environment. Manual audit performed exhaustively in its place across all source files.

---

## CONVERSION CHECKS

| # | Check | Result | Notes |
|---|---|---|---|
| C1 | Sticky CTA bar exists and fixed-positioned after hero scroll | **PASS** | `StickyCtaBar.tsx` — fixed bottom-0 z-40, appears at `scrollY > 80vh` |
| C2 | Trust anchor "8 Houston businesses..." visible in hero | **PASS** | `page.tsx` line 79: `8 Houston businesses. Live websites. Real results.` |
| C3 | Featured testimonial section BEFORE work preview section | **PASS** | Order in `page.tsx`: Hero → Featured Testimonial (line 86) → Work Preview (line 106) |
| C4 | All testimonials mention a SPECIFIC OUTCOME (not vague praise) | **PASS** | Featured: "3 new customers call me directly from Google"; Alvarez: "booking out my Saturdays two weeks ahead"; Nguyen: "Two of them turned into clients in the first month" |
| C5 | Contact form: exactly 3 fields | **PASS** | `ContactForm.tsx`: name, phone, project (textarea) — exactly 3 |
| C6 | Phone/email visible on contact page without scrolling | **PASS** | Sidebar (right column, above fold on desktop): `hello@nrg.example.com` and `(989) 488-7309` — BUT these are placeholder values (see FAILS below) |
| C7 | "Usually responds same day" or equivalent on contact page | **FAIL** | The sidebar "Response time" block reads `[PLACEHOLDER: e.g. Within 1 business day]` — not filled in |
| C8 | "Start a project" CTA in hero | **FAIL** | Hero CTAs are "See my work" and "Get in touch" — "Start a project" does NOT appear in the hero. Count: hero band (line 341), sticky bar, work page, services page = 3 locations confirmed. Hero is missing it. |

---

## POSITIONING CHECKS

| # | Check | Result | Notes |
|---|---|---|---|
| P1 | Clear within 5 seconds what this person does | **PASS** | Hero: "Get online. Get found. Get customers. for Houston small businesses." + body copy below |
| P2 | Zero jargon on homepage visible to users | **PASS** | No n8n, webhook, SIEM, Splunk, Azure, Docker, pipeline, deploy, stack, Next.js, Vercel visible in user-facing homepage copy |
| P3 | About page leads with client benefit, NOT "Fortune 500" | **PASS** | Headline: "I build the web for Houston's small businesses." Sub: "Websites that show up on Google and actually bring in customers." Fortune 500 not mentioned. |
| P4 | Project cards show browser mockup frames — not text-only | **PASS** | All 3 `ProjectCard` components wrap content in `BrowserMockup`, which renders traffic lights + URL bar + content area |
| P5 | Services page has plain-English outcomes + visible pricing | **PASS** | All 4 service cards show "Starting from $X" and plain-English descriptions |
| P6 | No remaining [PLACEHOLDER] text in any TSX file | **FAIL** | `contact/page.tsx` has 6 live `[PLACEHOLDER]` strings (lines 24, 29, 42, 51, 90, 100). QA1 did NOT fix this page. |

---

## DESIGN CHECKS

| # | Check | Result | Notes |
|---|---|---|---|
| D1 | Fonts: Syne display, DM Mono mono, DM Sans body — confirmed in globals.css and tailwind.config | **PASS** | `globals.css` line 1: Google Fonts import for all 3. `tailwind.config.ts` lines 33–36: `display: Syne`, `sans: DM Sans`, `mono: DM Mono` |
| D2 | No Inter, Roboto, Arial anywhere | **PASS** | Grep found only `system-ui` fallbacks (acceptable) — no Inter/Roboto/Arial |
| D3 | Background depth (#0A0A0A) — not flat black | **PASS** | `globals.css` line 8: `--canvas: #0A0A0A`. `tailwind.config.ts` line 12: `canvas: "#0A0A0A"` |
| D4 | Single cyan accent #00D4FF, used sparingly | **PASS** | `--accent: #00D4FF` — used for interactive elements only, not overused |
| D5 | Noise/grain texture on dark background | **PASS** | `globals.css` lines 46–55: `body::before` with SVG feTurbulence fractalNoise at 3.5% opacity |
| D6 | BrowserMockup: traffic light dots (red/yellow/green), URL bar, content area, hover lift+glow | **PASS** | `BrowserMockup.tsx`: FF5F57 (red), FFBD2E (yellow), 28CA41 (green); URL bar present; `whileHover` with y:-6 + cyan box-shadow |
| D7 | All 3 project cards use BrowserMockup | **PASS** | `ProjectCard.tsx` wraps in `<BrowserMockup url={url} delay={delay}>` — all 3 project data objects pass a url |
| D8 | ServiceCard hover: border opacity change, arrow slides right | **PASS** | `ServiceCard.tsx`: `hover:border-accent` (from `border-accent/20`); arrow span has `group-hover:translate-x-1` |
| D9 | Nav sticky on scroll >50px with backdrop-blur | **PASS** | `Nav.tsx` lines 21–23: `setScrolled(window.scrollY > 50)`. When scrolled: `bg-canvas/70 backdrop-blur-xl` |
| D10 | Mobile hamburger: exists, opens overlay, closes on link click | **PASS** | `Nav.tsx`: hamburger button (hidden md), `AnimatePresence` overlay, each link has `onClick={() => setOpen(false)}` |
| D11 | Status pill has pulsing green dot | **PASS** | `StatusPill.tsx`: span with class `pulse-dot` and `bg-status-green` |

---

## ANIMATION CHECKS

| # | Check | Result | Notes |
|---|---|---|---|
| A1 | Hero headline: word-by-word staggered entrance via Framer Motion | **PASS** | `HeroHeadline.tsx`: each word is a `motion.span` with `delay: globalIdx * 0.06` |
| A2 | All Framer Motion transitions use cubic-bezier arrays, NOT string "ease" or "linear" | **PASS** | All components use `ease: [0.16, 1, 0.3, 1]` arrays. No string "ease" or "linear" found in source. |
| A3 | pulse-dot uses cubic-bezier(0.4, 0, 0.2, 1) — NOT ease-in-out | **PARTIAL FAIL** | **`globals.css` line 90–91: PASS** — CSS `@keyframes` animation uses `cubic-bezier(0.4, 0, 0.2, 1)`. **`tailwind.config.ts` line 64: FAIL** — The Tailwind `animation` property still reads `"pulse-dot 2s ease-in-out infinite"`. This is a duplicate definition. The CSS class `.pulse-dot` will win (CSS specificity), but the Tailwind animation remains incorrect. QA1 fixed globals.css but did NOT fix tailwind.config.ts. |
| A4 | Project cards stagger in (0.1s delay between each) | **PASS** | `page.tsx` line 139: `delay={i * 0.1}`. `work/page.tsx` line 46: same. |
| A5 | prefers-reduced-motion: handled in globals.css AND Framer Motion components | **PASS** | `globals.css` lines 98–107: media query disables all animations. All 6 animated components import and use `useReducedMotion()`. |
| A6 | No animation longer than 300ms for UI interactions | **PASS** | `duration: 0.6` is used for entrance animations (not interactions). Hover and interactive transitions use `duration: 0.3` or shorter (`duration: 0.25` in Nav overlay). |

---

## COPY CHECKS

| # | Check | Result | Notes |
|---|---|---|---|
| CP1 | Zero Lorem ipsum | **PASS** | No lorem ipsum found in any source file |
| CP2 | Zero [PLACEHOLDER] text remaining in any page or component | **FAIL** | `contact/page.tsx` lines 24, 25, 29–31, 42, 51–52, 90–91, 100: 6 unfilled `[PLACEHOLDER]` blocks |
| CP3 | About page bio: all paragraphs filled with real copy | **PARTIAL FAIL** | 3 paragraphs are present in `about/page.tsx` (not 4 as COPY-DECK specifies). The 4th paragraph `"Based in Houston. Available for projects now."` is missing from the rendered bio. |
| CP4 | About page skill cards: all 4 have real descriptions | **PASS** | All 4 skills in `about/page.tsx` have real, non-placeholder body copy |
| CP5 | Services page: headline, sub, pricing philosophy all filled | **PASS** | All present and filled with real copy |
| CP6 | Work page: headline, sub, bottom section line all filled | **PASS** | All present and filled |
| CP7 | All testimonials flagged [REPLACE WITH REAL TESTIMONIAL] for Noah | **PASS** | `testimonials.ts` lines 7 and 15: comments flag all 3 testimonials for replacement |
| CP8 | No jargon visible to users | **PARTIAL FAIL** | `about/page.tsx` line 74 mentions "Squarespace" — a competitor brand name and implicit tech reference visible to users. Per audit brief's jargon rule, this is borderline but noteworthy. |

---

## TECHNICAL CHECKS

| # | Check | Result | Notes |
|---|---|---|---|
| T1 | /api/contact/route.ts exists with POST handler | **PASS** | File exists, exports `async function POST(req: NextRequest)` |
| T2 | Server-side validation for name, phone, message | **PASS** | `validate()` function checks name (min 2, max 100), phone (regex), message (min 10, max 500) |
| T3 | Rate limiting logic present | **PASS** | `isRateLimited()`: 5 max per IP per hour, sliding window via `Map<string, number[]>` |
| T4 | .env.example has all required vars (NOAH_EMAIL, NOAH_PHONE, RESEND_API_KEY) | **PASS** | `.env.example` has `NOAH_EMAIL`, `NOAH_PHONE`, `RESEND_API_KEY`, plus optional Twilio and analytics |
| T5 | No API keys hardcoded in source | **PASS** | All credentials accessed via `process.env.*` — no hardcoded keys found |
| T6 | SETUP.md exists in docs/ | **PASS** | `docs/SETUP.md` exists and is comprehensive |
| T7 | All 5 pages have generateMetadata/metadata exports | **PASS** | All 5 pages export `metadata: Metadata` constants |
| T8 | npm run build — zero errors | **PASS** | Build succeeds: 5 static pages + 1 dynamic API route, no TypeScript or lint errors |

---

## SUMMARY OF FAILURES

### CRITICAL — Blocks deployment

**FAIL 1: contact/page.tsx — 6 live [PLACEHOLDER] strings**
QA1 marked "all [PLACEHOLDER] content on about, services, and work pages" as fixed. The contact page was missed entirely.

- **Line 24–26:** `[PLACEHOLDER: contact page headline]` — headline reads verbatim in `<h1>`
- **Lines 29–31:** `[PLACEHOLDER: contact page sub-headline...]` — sub reads verbatim in `<p>`
- **Line 42:** Comment `{/* PLACEHOLDER: form wired by Backend Agent */}` — harmless comment, not rendered
- **Lines 51–52:** `[PLACEHOLDER: short paragraph reinforcing availability and Houston focus.]` — renders in sidebar
- **Lines 90–91:** `[PLACEHOLDER: small line — e.g. serving the greater Houston area...]` — renders in sidebar
- **Line 100:** `[PLACEHOLDER: e.g. Within 1 business day]` — renders in "Response time" block

**Required fix:** Replace all 5 rendered `[PLACEHOLDER]` strings in `src/app/contact/page.tsx` with copy from `docs/COPY-DECK.md` (contact page section):
- Headline → `Let's talk about your project.`
- Sub → `Tell me what you need. I'll tell you what it costs and how long it takes. No pressure.`
- Availability paragraph → write short: "I'm based in Houston and take on projects across the greater Houston area. In-person meetings available."
- Area note → (same as above, consolidate)
- Response time → `Usually responds same day.`

Also: placeholder email (`hello@nrg.example.com`) and phone (`(989) 488-7309`) are still on the contact page — these are placeholder values visible to users.

---

**FAIL 2: tailwind.config.ts line 64 — pulse-dot animation still uses ease-in-out**

```ts
animation: {
  "pulse-dot": "pulse-dot 2s ease-in-out infinite",  // ← WRONG
},
```

`globals.css` correctly uses `cubic-bezier(0.4, 0, 0.2, 1)`. The Tailwind definition is the stale version. While `.pulse-dot` CSS class wins in the browser, the Tailwind config is inconsistent and will cause the wrong easing if any component ever applies `animate-pulse-dot` via Tailwind class instead of the CSS class. Both must match.

**Required fix** in `tailwind.config.ts` line 64:
```ts
"pulse-dot": "pulse-dot 2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
```

---

### NON-CRITICAL — Flag for Noah before launch

**FAIL 3: "Start a project" CTA missing from hero**
The hero has "See my work" and "Get in touch" — but not "Start a project." The CTA band at the bottom has "Start a project," as do the sticky bar, work page, and services page. This is a conversion optimization miss — the hero is the highest-leverage location for the primary conversion CTA.

Recommendation: add a "Start a project →" button to the hero alongside or replacing "Get in touch."

**FAIL 4: About page bio has 3 paragraphs, COPY-DECK specifies 4**
The 4th paragraph (`"Based in Houston. Available for projects now."`) from COPY-DECK is missing from `about/page.tsx`.

---

## ITEMS REMAINING FOR NOAH (Not blocking build, blocking launch)

| Item | Location |
|---|---|
| `[PHOTO NEEDED]` — professional headshot | `about/page.tsx` line 106 (renders as visible label in monogram placeholder) |
| `[REPLACE WITH REAL TESTIMONIAL]` | `testimonials.ts` — all 3 testimonials flagged as placeholders |
| Real phone number | `page.tsx` CTA band (line 347), `contact/page.tsx` sidebar (line 79), `Footer.tsx` (line 59) — currently `(989) 488-7309` |
| Real email | `contact/page.tsx` sidebar and `Footer.tsx` — currently `hello@nrg.example.com` (also conflicts with `noah@nrgbuilds.com` referenced in `route.ts` error messages) |
| Project card screenshots | All 3 cards use gradient placeholders — `BrowserMockup` supports `imageSrc` prop for real screenshots |

---

## FINAL VERDICT

### NEEDS FIXES

**2 bugs must be resolved before deployment:**

1. **`src/app/contact/page.tsx`** — Fill 5 rendered `[PLACEHOLDER]` strings with real copy from COPY-DECK. Also update placeholder email/phone to real values.
2. **`tailwind.config.ts` line 64** — Change `ease-in-out` to `cubic-bezier(0.4, 0, 0.2, 1)` in the `pulse-dot` animation definition.

Once both are fixed and `npm run build` re-passes, the site can proceed to deploy — pending Noah supplying real testimonials, headshot, phone number, and real email address.

---

*QA2 sign-off — adversarial pass complete.*
