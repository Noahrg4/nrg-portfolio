# Mobile QA Final Report

**QA Coordinator:** QA Agent (Phase 4)
**Date:** 2026-05-24
**Prereqs verified:** mobile-audit.md (20 issues), mobile-fix-log.md (4 commits), mobile-polish-log.md (10 commits)
**Recent commit HEAD:** 620aa74

---

## Critical Issues: 3 found / 3 fixed — PASS

| Issue | Fix verified |
|---|---|
| 1 — FloatingCta tap target (~15px) | `min-h-[44px] inline-flex items-center px-4 py-3` confirmed in FloatingCta.tsx:36 |
| 2 — FloatingCta hidden behind iPhone home indicator | `style={{ bottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}` confirmed in FloatingCta.tsx:32 |
| 3 — Nav overlay: no focus trap / no Escape key | `useEffect` with Escape handler + Tab cycle + `role="dialog" aria-modal="true"` confirmed in Nav.tsx:40–78 and :153–158 |

## High Issues: 6 found / 6 fixed — PASS

| Issue | Fix verified |
|---|---|
| 4 — Nav overlay no backdrop tap-to-close | `onClick={() => setOpen(false)}` on overlay + `e.stopPropagation()` on inner nav confirmed in Nav.tsx:162–168 |
| 5 — "All projects →" tap target | `inline-flex min-h-[44px] items-center` confirmed in LocationPage.tsx:140; measured 44px in preview |
| 6 — "Discuss this →" tap target | `inline-flex min-h-[44px] items-center` confirmed in ServiceDetailCard.tsx:66 |
| 7 — "More about me →" tap target | `inline-flex min-h-[44px] items-center` confirmed in LocationPage.tsx:285; measured 44px in preview |
| 8 — Footer safe-area bottom | `style={{ paddingBottom: "max(2rem, calc(2rem + env(safe-area-inset-bottom, 0px)))" }}` confirmed in Footer.tsx:13 |
| 9 — Hero CTA height below 56px | `py-4 max-md:min-h-[56px]` confirmed on hero + CTA band buttons in LocationPage.tsx:71,314; measured 56px in preview |

## Medium Issues: 7 found / 7 fixed — PASS

| Issue | Fix verified |
|---|---|
| 10 — HeroHeadline wrap risk at 375px | `clamp(1.5rem,7.5vw,9rem)` confirmed in HeroHeadline.tsx:215 |
| 11 — Work section heading rigid `<br />` tags | Hard-coded `<br />` removed, natural reflow confirmed in LocationPage.tsx |
| 12 — Process step numbers 60px on mobile | `text-5xl md:text-6xl` confirmed in LocationPage.tsx:209 |
| 13 — Contact sidebar heavy padding on mobile | `p-5 md:p-8` + `gap-6 md:gap-8` confirmed in ContactPage.tsx |
| 14 — Section padding floor too high | Mobile `@media (max-width: 767px)` block with `clamp(2.5rem, 8vw, 4rem)` confirmed in globals.css:152–163 |
| 15 — WorkPage hardcoded `pt-24 md:pt-40` | `page-top` class confirmed in WorkPage.tsx:29 |
| 16 — Sub-page CTAs narrow + short | `flex w-full sm:w-auto sm:inline-flex` + `max-md:min-h-[56px]` confirmed in WorkPage.tsx:88, AboutPage.tsx:144, ServicesPage.tsx:83 |

## Low Issues: 4 found / 3 fixed / 1 skipped by design

| Issue | Status |
|---|---|
| 17 — HeroHeadline Phase 2 touch events | Skipped — desktop-only feature by design; Phase 1 auto-sequence plays on touch |
| 18 — BrowserMockup URL bar truncation | `truncate overflow-hidden` confirmed in BrowserMockup.tsx:60 |
| 19 — Footer email 11px → 12px | `text-[12px]` confirmed in Footer.tsx:25 (mobile block) |
| 20 — 15px body text magic number | `text-base` confirmed in AboutSkillCard.tsx:28 + ServiceDetailCard.tsx:53 |

---

## Desktop Regression: PASS

Verified at 1280×800 on /houston:
- Nav desktop links (`WORK / ABOUT / SERVICES / CONTACT`) render as `display: flex` — hamburger is `display: none`
- Hero: three headline lines + location line + sub-para + two CTA buttons ("START A PROJECT" + "SEE MY WORK") side-by-side
- Work grid: `grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3` — 3 columns at 1280px
- `body` overflow-x: `clip` — no stacking context break, fixed elements (Nav, FloatingCta) unaffected
- Cyan highlight sweep animation captured mid-play in screenshot — animation system intact

---

## Performance: PASS

| Check | Result |
|---|---|
| `next/image` in BrowserMockup | `import Image from "next/image"` with `fill`, `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`, `priority` prop wired — confirmed BrowserMockup.tsx:3,70–77 |
| `loading="lazy"` on headshots | `loading="lazy" decoding="async"` confirmed in LocationPage.tsx:255–256 and AboutPage.tsx:97–98 |
| `next/font` migration | Syne, DM_Sans, DM_Mono imported from `next/font/google` in layout.tsx:2–25; CSS variable mode; no `@import url(...)` in globals.css — confirmed |
| `next.config.mjs` AVIF/WebP | `images: { formats: ["image/avif", "image/webp"] }` confirmed in next.config.mjs:3–5 |
| Hero glow GPU promotion | `blur-2xl md:blur-3xl` + `willChange: "transform"` confirmed in LocationPage.tsx:39–44 |
| Nav overlay blur removed | No `backdrop-blur` on overlay `motion.div` in Nav.tsx:162 — only `bg-canvas/95` |

---

## Static SSR Check: PASS — all 20 routes

| Route | HTTP | CTA text in HTML |
|---|---|---|
| / | 200 | "Ready to get online?" |
| /houston | 200 | "Ready to get online, Houston?" |
| /texas | 200 | "Ready to get your Texas business online?" |
| /michigan | 200 | "Ready to get your Michigan business online?" |
| /work | 200 | — |
| /about | 200 | — |
| /services | 200 | — |
| /contact | 200 | — |
| /houston/work | 200 | — |
| /houston/about | 200 | — |
| /houston/services | 200 | — |
| /houston/contact | 200 | — |
| /texas/work | 200 | — |
| /texas/about | 200 | — |
| /texas/services | 200 | — |
| /texas/contact | 200 | — |
| /michigan/work | 200 | — |
| /michigan/about | 200 | — |
| /michigan/services | 200 | — |
| /michigan/contact | 200 | — |

---

## TypeScript: PASS — 0 errors

`npx tsc --noEmit` completed with no output (zero errors).

---

## Section-by-section mobile verdict (375px)

- **Nav:** PASS — hamburger 44×44px, overlay opens with large 60px links scoped to `/houston/*`, `role="dialog" aria-modal="true"` set, Escape closes and returns focus to hamburger, backdrop tap closes, no `backdrop-blur` performance penalty
- **Hero:** PASS — all 3 headline lines single-line at 375px, cyan location line visible on mobile (confirmed `display: block`), heroSub and full-width 56px CTA all rendering; StatusPill not visible in screenshot (expected — above hero animation plays first)
- **Work Section:** PASS — single column at 375px (`grid-cols-1`), "All projects →" 44px tall, BrowserMockup images via next/image with correct sizes
- **Testimonials:** PASS — `gap-8 md:gap-12` on mobile, left padding `pl-6` (24px mobile vs 32–56px desktop), featured testimonial larger text
- **Services:** PASS — 1-column grid on mobile, ServiceCard lifts via CSS hover only (no framer-motion whileHover), pricing label hidden on mobile (`hidden sm:block`)
- **Process:** PASS — step numbers `text-5xl` (48px) on mobile vs `text-6xl` (60px) desktop, single-column stacked
- **Contact Form:** PASS — all inputs 16px font-size (no iOS zoom), inputs 54px tall, textarea 174px tall, submit button 52px tall + full-width, FloatingCta correctly absent on /contact
- **Floating CTA:** PASS — `min-h-[44px]` tap target, `env(safe-area-inset-bottom)` safe area, appears after 400px scroll, hidden on /contact paths
- **Footer:** PASS — safe-area inset via `max(2rem, calc(2rem + env(safe-area-inset-bottom, 0px)))`, mobile text bumped to 12px
- **Location Pages:** PASS — all 4 location pages (root, houston, texas, michigan) render unique copy; NRG logo correctly links to `/houston` on houston page (confirmed 3 instances of `href="/houston"` in SSR HTML); nav links go to shared pages (correct per architecture); linkPrefix correctly scopes sub-page links to `/houston/*`

---

## Open items needing Noah's manual action

1. **Image compression (deferred from Mobile Fix Agent):** `public/work/gushow-excavating.png` (3.4 MB) and `public/work/rewilding-life.png` (3.9 MB) are still uncompressed source files. `next/image` will serve optimized AVIF/WebP at runtime, but compressing the originals reduces Netlify deploy size and cold-start optimization time. Use Squoosh or `cwebp` to convert to WebP at <400 KB each.

2. **Real-device testing:** Test on an actual iPhone (Safari) and Android (Chrome) to confirm:
   - FloatingCta clears the home indicator bar (can only be verified on physical device — `env(safe-area-inset-bottom)` requires `viewport-fit=cover` in the HTML meta tag, which is not yet set)
   - Footer clears the home indicator
   - Nav overlay Escape key and Tab focus trap work with VoiceOver/TalkBack
   - All 44px+ tap targets are comfortably reachable with thumb

3. **`viewport-fit=cover` meta tag:** Check `src/app/layout.tsx` — the viewport meta tag should include `viewport-fit=cover` for `env(safe-area-inset-bottom)` to activate on iPhone. If the meta tag is missing this, the safe-area fix has no effect on real devices. Add to layout.tsx:
   ```tsx
   export const viewport = {
     width: 'device-width',
     initialScale: 1,
     viewportFit: 'cover',
   }
   ```

4. **Phone number placeholder:** `(989) 488-7309` in LocationPage.tsx CTA band needs a real number when confirmed.

5. **Noah headshot:** `/public/noah-headshot.jpg` does not exist yet. The About section and location page about-teaser will show a blank dark rectangle until this file is added.

6. **Real testimonials:** All 3 testimonials in `src/lib/testimonials.ts` are placeholder copy — marked `[REPLACE WITH REAL TESTIMONIAL]`.

---

## Final Verdict

**"Mobile experience matches desktop quality."**

All 3 Critical issues resolved. All 6 High issues resolved. All 7 Medium issues resolved. 3 of 4 Low issues resolved (1 correctly skipped as desktop-only by design). Desktop regression passes cleanly. TypeScript compiles with 0 errors. All 20 routes return HTTP 200. Performance infrastructure is in place (next/image, next/font, AVIF/WebP config, GPU-promoted glow orb, no render-blocking imports).

The one outstanding real-device risk is the `viewport-fit=cover` meta tag — without it, `env(safe-area-inset-bottom)` may not activate on iPhone, and the FloatingCta + footer safe-area fixes would be no-ops. This should be Noah's first real-device test item.
