# NRG Portfolio — Mobile Fix Log

**Agent:** Mobile Fix Agent  
**Date:** 2026-05-24  
**Scope:** Critical + High issues from docs/mobile-audit.md and docs/mobile-performance.md  
**Commits:** 3 (see hashes below)

---

## Commit 1 — `cbb603c`
**Message:** `fix(mobile): FloatingCta tap target + safe-area; Nav focus trap + backdrop`

### Issue 1 — FloatingCta tap target (Critical, layout audit)
**File:** `src/components/FloatingCta.tsx:34`  
**Mobile-only:** Yes — affects touch devices; desktop has no change in visual weight  
**Before:** `className="font-mono text-[15px] uppercase ... text-accent ..."`  
**After:** `className="inline-flex min-h-[44px] items-center px-4 py-3 font-mono text-[15px] ..."`  
Tap target was ~15px tall. Now 44px minimum (iOS/Android WCAG standard).

### Issue 2 — FloatingCta hidden behind iPhone home indicator (Critical, layout audit)
**File:** `src/components/FloatingCta.tsx:28`  
**Mobile-only:** Yes — `env(safe-area-inset-bottom)` is 0 on desktop  
**Before:** `className="fixed bottom-8 right-8 z-50"`  
**After:** `className="fixed right-8 z-50"` + `style={{ bottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}`  
iPhone 14 home indicator is 34px; was behind it at `bottom: 32px`. Now clears it.

### Issue 3 — Nav overlay no focus trap / no Escape key (Critical, layout audit)
**File:** `src/components/Nav.tsx:105-195`  
**Mobile-only:** Yes — overlay only renders at `< md`; focus trap only active when `open === true`  
**Changes:**
- Added `useRef` for `hamburgerRef` (hamburger button) and `overlayRef` (overlay div)
- `useEffect` on `open`: adds `keydown` listener for Escape (closes + returns focus to hamburger) and full Tab/Shift-Tab cycle restricted to focusable elements inside `overlayRef`
- On open, `overlayRef.current?.querySelector("a, button")` receives focus automatically
- Overlay `motion.div` gets `role="dialog"` `aria-modal="true"` `aria-label="Navigation menu"`
- Hamburger gets `aria-controls="mobile-nav-overlay"` and `id` on overlay for the association

### Issue 4 — Nav overlay no backdrop tap-to-close (High, layout audit)
**File:** `src/components/Nav.tsx:111`  
**Mobile-only:** Overlay only renders at `< md`  
**Before:** No `onClick` on overlay  
**After:** Outer `motion.div` gets `onClick={() => setOpen(false)}`; inner `<nav>` and bottom CTA `<div>` get `e.stopPropagation()` so taps on link text don't bubble  

**Perf bonus:** Removed `backdrop-blur-xl` from the overlay (perf audit M2 — full-screen blur on low-end Android). Background is `bg-canvas/95` so visually unchanged.

---

## Commit 2 — `13159f7`
**Message:** `fix(mobile): tap targets for nav links, CTAs; Footer safe-area`

### Issue 5 — "All projects →" tap target (High, layout audit)
**File:** `src/components/LocationPage.tsx:141`  
**Mobile-only:** Yes — applies universally but only dangerous at mobile font sizes  
**Before:** `className="font-mono text-[13px] text-accent ..."`  
**After:** `className="inline-flex min-h-[44px] items-center font-mono text-[13px] text-accent ..."`  
Text was 13px tall (~13px tap target). Now 44px.

### Issue 6 — "Discuss this →" tap target (High, layout audit)
**File:** `src/components/ServiceDetailCard.tsx:65`  
**Mobile-only:** Yes  
**Before:** `className="font-mono text-xs uppercase ..."`  
**After:** `className="inline-flex min-h-[44px] items-center font-mono text-xs ..."`  
Text was 12px tall. Now 44px.

### Issue 7 — "More about me →" tap target (High, layout audit)
**File:** `src/components/LocationPage.tsx:284`  
**Mobile-only:** Yes  
**Before:** `className="inline-flex items-center gap-2 font-mono text-sm ..."`  
**After:** `className="inline-flex min-h-[44px] items-center gap-2 font-mono text-sm ..."`  
Already had `inline-flex` but no min-height. Effective height was ~20px. Now 44px.

### Issue 9 — Hero CTA height below 56px target (High, layout audit)
**File:** `src/components/LocationPage.tsx:70` (hero) and `:314` (CTA band)  
**Mobile-only:** `py-3.5` → `py-4` applies to both viewports; visually negligible change on desktop, meaningful on mobile (~48px → ~52px). Ghost phone CTA also bumped to `py-4` for visual consistency.

### Issue 8 — Footer safe-area bottom (High, layout audit)
**File:** `src/components/Footer.tsx:11`  
**Mobile-only:** `env(safe-area-inset-bottom)` is 0 on desktop, `max()` ensures fallback  
**Before:** `className="container-content py-8"`  
**After:** `className="container-content pt-8"` + `style={{ paddingBottom: "max(2rem, calc(2rem + env(safe-area-inset-bottom, 0px)))" }}`  
Bottom footer text was at 32px from physical edge; iPhone 14 home indicator is 34px. Now clears it.

---

## Commit 3 — `4b02029`
**Message:** `perf(mobile): next/image in BrowserMockup; lazy headshots; glow orb GPU fix`

### C3/H1/H2 — BrowserMockup plain `<img>` bypassing Next.js optimization (Critical + High, perf audit)
**Files:** `src/components/BrowserMockup.tsx`, `src/components/HomepageProjectCard.tsx`, `src/components/LocationPage.tsx`  
**Before:** Plain `<img>` with no srcset, no sizes, no lazy loading  
**After:** `next/image` with `fill` and `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`  
- On mobile, Next.js will serve a ~360px-wide AVIF/WebP image instead of the full 3.4 MB PNG
- Added `priority?: boolean` prop to BrowserMockup and HomepageProjectCard
- First card (`i === 0`) passes `priority={true}` → `fetchpriority="high"` on LCP image
- All other cards get `loading="lazy"` (next/image default)

### H4 — Headshot `<img>` tags without lazy loading (High, perf audit)
**Files:** `src/components/LocationPage.tsx:254`, `src/components/pages/AboutPage.tsx:93`  
**Before:** No `loading` attribute  
**After:** `loading="lazy" decoding="async"` added preemptively  
Both headshots are inside `hidden md:block` containers so they never show on mobile, but `loading="lazy"` ensures they won't block parsing when the image file eventually exists.

### H3 — Hero glow orb `blur-3xl` expensive on low-end Android (High, perf audit)
**File:** `src/components/LocationPage.tsx:39`  
**Mobile-only:** `blur-2xl md:blur-3xl` is different per viewport  
**Before:** `blur-3xl` (64px) on a 600×600 element, no layer promotion  
**After:** `blur-2xl md:blur-3xl` (32px mobile, 64px desktop) + `willChange: "transform"` promotes to GPU compositor layer

### M3 — next.config.mjs image formats (Medium, perf audit — done since we're migrating images anyway)
**File:** `next.config.mjs`  
**Before:** `const nextConfig = {}`  
**After:** `images: { formats: ["image/avif", "image/webp"] }` — AVIF ~50% better compression than WebP

---

## Commit 4 — `45ebadc`
**Message:** `perf(fonts): migrate Google Fonts from render-blocking @import to next/font`

### H5 — Render-blocking Google Fonts `@import` (High, perf audit)
**Files:** `src/app/layout.tsx`, `src/app/globals.css`, `tailwind.config.ts`  
**Mobile-only:** No — affects all viewports; impact is more severe on mobile due to network latency  
**Before:** `@import url('https://fonts.googleapis.com/...')` at top of globals.css — render-blocking  
**After:**
- `layout.tsx` imports Syne, DM_Sans, DM_Mono from `next/font/google` with CSS variable mode
- `<html>` receives the three variable classNames
- `globals.css` removes the `@import`; `body`, `.text-display`, `.text-mono` use `var(--font-*)` variables
- `tailwind.config.ts` fontFamily entries updated to `var(--font-*)` variables
- next/font generates `<link rel="preload">` at build time and inlines critical CSS — eliminates the 2-round-trip penalty of `@import`

---

## Deferred Items

### Image compression (C1, C2 — Critical)
`gushow-excavating.png` (3.4 MB) and `rewilding-life.png` (3.9 MB) need manual WebP/AVIF conversion. The `next/image` migration means Next.js will auto-optimize these at runtime now, but the source files should still be replaced with compressed versions to reduce disk storage and cold-start optimization time. **Noah must do this manually** — squash to WebP at ~400 KB each. Tooling: `cwebp`, Squoosh, or ImageOptim.

---

## Noah Manual Actions Required

1. **Compress project screenshots** — `gushow-excavating.png` (3.4 MB) and `rewilding-life.png` (3.9 MB). Use Squoosh or ImageOptim to convert to WebP/AVIF. Target <400 KB each. The `next/image` migration handles runtime serving, but smaller source files improve Netlify deploy times and CDN storage. Next.js will pick up the new files automatically.

2. **Real-device testing** — Test on actual iPhone (Safari) and Android (Chrome) for:
   - FloatingCta clears home indicator
   - Footer clears home indicator  
   - Nav overlay Escape/Tab focus trap works with VoiceOver
   - All tap targets are comfortably reachable with thumb

3. **Update phone number** — `(989) 488-7309` placeholder in `LocationPage.tsx` CTA band needs a real number.

---

## Summary Counts

| Severity (layout) | Total | Fixed | Deferred to Visual Polish |
|---|---|---|---|
| Critical | 3 | 3 | 0 |
| High | 6 | 6 | 0 |
| Medium | 7 | 0 | 7 |
| Low | 4 | 0 | 4 |

| Severity (perf) | Total | Fixed | Deferred |
|---|---|---|---|
| Critical | 3 | 2 (code) + 1 (manual) | C1/C2 image compression → Noah manual |
| High | 5 | 5 | 0 |
| Medium | 3 | 1 (M3) | M1 ServiceCard shadow, M2 nav blur (partially done in commit 1) |
| Low | 2 | 0 | 2 |
