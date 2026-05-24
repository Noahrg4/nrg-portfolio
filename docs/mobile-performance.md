# NRG Portfolio — Mobile Performance Audit

**Date:** 2026-05-24
**Auditor:** Performance Agent (read-only pass)
**Scope:** Image optimization, font loading, animation perf, JS footprint, Core Web Vitals patterns

---

## Summary Counts

| Severity | Count |
|---|---|
| Critical | 3 |
| High | 5 |
| Medium | 3 |
| Low | 2 |

**Total issues: 13**

---

## Critical Issues

### C1 — gushow-excavating.png is 3.4 MB, served uncompressed to mobile
**File:** `public/work/gushow-excavating.png`
**Size:** 3,410,160 bytes (3.4 MB)

No compression, no WebP conversion, no srcset. A mobile visitor on 4G downloads the full 3.4 MB PNG to fill a `16/10` aspect-ratio content area that is perhaps 360px wide on their screen. The `<img>` tag in `BrowserMockup` has no `srcset`, no `sizes`, and no `loading="lazy"`. This single image can cost 5–10 seconds on a slow mobile connection and will tank LCP.

**Fix:**
- Convert to WebP (should compress to ~300–600 KB at equivalent quality)
- Add `loading="lazy"` to all `<img>` tags except the first visible one
- Use Next.js `<Image>` component with `sizes` prop to serve srcset, OR add manual srcset to the `<img>` tag

---

### C2 — rewilding-life.png is 3.9 MB, served uncompressed to mobile
**File:** `public/work/rewilding-life.png`
**Size:** 3,940,094 bytes (3.9 MB)

Same problem as C1. This is the largest file in the project. It is the second project shown on the homepage work grid. Even with `loading="lazy"` it will be eagerly fetched on most mobile viewports because the card is visible on initial scroll. On a 400ms RTT mobile connection this alone can add 3–4s to Time to Interactive.

**Fix:** Same as C1. WebP conversion expected to yield ~350–700 KB.

---

### C3 — All `<img>` tags in BrowserMockup bypass Next.js image optimization entirely
**File:** `src/components/BrowserMockup.tsx:68`

```tsx
// eslint-disable-next-line @next/next/no-img-element
<img
  src={imageSrc}
  alt={imageAlt ?? ""}
  className="block h-full w-full object-cover object-top"
/>
```

This plain `<img>` is used in every `HomepageProjectCard` and `ProjectCard` across the entire site. It receives:
- No `srcset` — mobile gets the same full-size asset as desktop
- No `sizes` — browser cannot select an appropriate source
- No `loading="lazy"` — every card image (including offscreen ones) fetches on page load
- No `width`/`height` — though CLS is avoided by the parent `aspect-[16/10]` wrapper

This affects all 5 project screenshots across the homepage work grid and /work page. Combined with C1/C2, total uncompressed image payload on the homepage is ~7.9 MB for images alone.

**Fix options (pick one):**
1. Replace `<img>` with Next.js `<Image>` inside BrowserMockup — add `fill` prop + `sizes` + `priority` on the first card
2. Keep `<img>` but manually add `srcset` pointing to WebP variants and `loading="lazy"`

---

## High Issues

### H1 — No `loading="lazy"` on offscreen project card images
**Files:** `src/components/BrowserMockup.tsx:68`, `src/components/LocationPage.tsx:254`, `src/components/pages/AboutPage.tsx:93`

All three `<img>` tags lack `loading="lazy"`. On the homepage, cards 2 and 3 (rewilding-life and rustic-table) are below the fold on mobile and will be eagerly loaded. On the /work page, all 5 cards load simultaneously. The browser fetches all images on page load regardless of scroll position.

**Fix:** Add `loading="lazy"` to all `<img>` tags except any that are immediately visible above the fold (the first homepage card may warrant `loading="eager"` + `fetchpriority="high"` as the LCP candidate).

---

### H2 — No `priority` / `fetchpriority` on the LCP image
**Files:** `src/components/BrowserMockup.tsx`, `src/components/HomepageProjectCard.tsx`

The first project card (gushow-excavating.png) is the probable LCP element on the homepage — it is the largest image in the initial viewport on desktop and near-viewport on mobile. It has no `priority` signal whatsoever. The browser discovers it late (after JS parses and renders the component tree) and gives it default priority.

**Fix:** Pass a `priority` prop through `HomepageProjectCard` → `BrowserMockup` → `<img>` and set `fetchpriority="high"` on the first card (delay=0). On the location pages, the first card passed `delay={0}` is the priority candidate.

---

### H3 — Hero glow orb uses `blur-3xl` with no mobile mitigation
**File:** `src/components/LocationPage.tsx:39–43`

```tsx
<div
  aria-hidden
  className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-40 blur-3xl"
  style={{
    background: "radial-gradient(circle, rgba(0,212,255,0.18), transparent 70%)",
  }}
/>
```

`blur-3xl` (= `filter: blur(64px)`) on a 600×600 element is GPU-intensive. On low-end Android devices (Snapdragon 400/600 tier) this filter requires compositing an off-screen surface. The element has no `will-change` so the browser may or may not promote it to its own layer. Without promotion it recalculates on every paint. There is no `@media (max-width)` breakpoint to reduce or eliminate the blur on mobile.

**Fix:**
- Add `will-change: transform` (promotes to compositor layer, preventing repaint on scroll)
- OR reduce to `blur-2xl` on mobile via responsive class: `blur-2xl md:blur-3xl`
- OR wrap in `@media (prefers-reduced-motion)` suppression at paint level

---

### H4 — Headshot `<img>` tags lack `loading="lazy"` and `fetchpriority`
**Files:** `src/components/LocationPage.tsx:254`, `src/components/pages/AboutPage.tsx:93`

Both headshot `<img>` tags for `/noah-headshot.jpg` have no `loading` attribute. The file doesn't exist yet (`/noah-headshot.jpg` is a placeholder), but when it does, it will be fetched eagerly. The about page has a large `aspect-[4/5]` container that could hold a high-res headshot. If the photo ends up being 1–2 MB (common for unoptimized JPEGs), it will load without lazy loading even though it is always below the fold.

**Fix:** Add `loading="lazy"` to both headshot `<img>` tags now, before the file is added.

---

### H5 — Google Fonts `@import` is render-blocking (FOIT risk)
**File:** `src/app/globals.css:1`

```css
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap');
```

A CSS `@import` at the top of the global stylesheet is render-blocking. The browser must:
1. Parse the CSS → encounter the `@import`
2. Pause rendering to fetch `fonts.googleapis.com`
3. Receive the CSS which references 8 font files
4. Fetch those font files (each is a separate HTTP request)

On mobile, with `display=swap` the browser _will_ show system fonts (FOUT), but the `@import` itself delays the _start_ of font loading and extends FCP. The modern fix is `next/font/google` which generates `<link rel="preload">` and inlines the critical CSS at build time, eliminating the network round-trip.

**Current font weight count:** 8 weights loaded:
- Syne: 700, 800
- DM Sans: 400, 500, 700, italic 400 (4 files)
- DM Mono: 400, 500

DM Sans italic 400 is loaded for `TestimonialCard` blockquote (`italic` class). This is used site-wide on every page with testimonials (all location pages). The weight is justified but should be noted — if testimonials are removed or restyled, drop `ital,wght@0,400;0,500;0,700;1,400` → `wght@400;500;700`.

---

## Medium Issues

### M1 — ServiceCard transitions `box-shadow` on hover (not GPU-composited)
**File:** `src/components/ServiceCard.tsx:29`

```tsx
className="... transition-[transform,border-color,box-shadow] duration-200 ..."
```

`box-shadow` transitions are not GPU-composited. The browser must repaint on every frame of the transition (60 fps = 60 repaints). On low-end mobile during scroll this can cause jank. The `border-color` transition has the same issue. Only `transform` in this list is composited.

**Fix (two options):**
1. Drop `box-shadow` from the transition list and instead toggle the shadow class instantly (`hover:shadow-card-hover` without transition). The lift (`-translate-y-1`) gives enough visual feedback on its own.
2. Replace the `box-shadow` with a pseudo-element (`::after`) that has `opacity` transition — opacity is composited.

---

### M2 — Nav mobile overlay uses `backdrop-blur-xl` on a full-screen fixed element
**File:** `src/components/Nav.tsx:111`

```tsx
className="fixed inset-0 top-16 z-40 ... bg-canvas/95 backdrop-blur-xl md:hidden"
```

`backdrop-blur-xl` (= `backdrop-filter: blur(24px)`) on a full-screen fixed overlay is very expensive on mobile. It blurs the entire page content behind the nav. On low-end devices this can drop to under 30 fps while the overlay is open and animating. Since the background is `bg-canvas/95` (95% opaque near-black), the blur is barely perceptible. It adds cost with essentially no visual benefit.

**Fix:** Remove `backdrop-blur-xl` from the mobile nav overlay and rely solely on `bg-canvas/95`. The visual result is indistinguishable at 95% opacity.

---

### M3 — No `next.config.mjs` image optimization config
**File:** `next.config.mjs`

```js
const nextConfig = {};
```

The Next.js image optimizer is enabled by default, but with no custom config:
- No `formats: ['image/avif', 'image/webp']` specified (Next.js default is `webp` only; AVIF gives ~50% better compression than WebP for photos)
- No `deviceSizes` customization (default is `[640, 750, 828, 1080, 1200, 1920, 2048, 3840]` — fine, but worth documenting)
- No `imageSizes` for small images

This is only relevant when the `<img>` tags are converted to `<Image>` (C3 fix). Document now so the fix agent knows to add the config.

**Fix:** Add to `next.config.mjs`:
```js
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};
```

---

## Low Issues

### L1 — `body::before` noise texture SVG is inline data URI (re-parsed each page)
**File:** `src/app/globals.css:53`

The fractalNoise SVG is a large inline `data:image/svg+xml` URI. While it is cached by the browser after the first load (it's in the stylesheet), the SVG filter (`feTurbulence`, `feColorMatrix`) runs in software on every page. It is `position: fixed` and `mix-blend-mode: overlay` — the blend mode requires compositing with the layer below. This is a known pattern and the opacity (3.5%) is intentionally minimal. This is low severity but worth noting: on very old Android devices the fixed + blend-mode combination can cause repaints on scroll.

**Recommendation:** No urgent action. If scroll jank is reported on low-end devices, consider replacing with a static `/noise.png` file (served as a proper image, cached by CDN) and dropping `mix-blend-mode` in favor of a pre-composited dark-tinted version.

---

### L2 — Framer Motion bundle loaded on every page including purely static sections
**File:** `package.json` + all `"use client"` components

`framer-motion` v12 is used in: `BrowserMockup`, `HomepageProjectCard`, `ProjectCard`, `ServiceCard`, `TestimonialCard`, `FloatingCta`, `Nav`. The bundle adds approximately 40–60 KB gzipped to the client JS payload. All of the motion components are marked `"use client"`, which is correct and required. However there is no lazy loading of motion components — they are all in the initial bundle.

This is low severity because Next.js App Router already code-splits by page, so non-homepage components (e.g. ProjectCard from /work) are not loaded on the homepage. The impact is bounded.

**Recommendation:** No action needed unless Lighthouse JS payload score drops. If it does, consider `dynamic(() => import('./ServiceCard'), { ssr: false })` for below-fold sections.

---

## Animation Correctness Verification

All motion components verified to use only GPU-composited properties for entry animations:

| Component | Entry animation | Status |
|---|---|---|
| `BrowserMockup` | `opacity: 0, y: 24` → `opacity: 1, y: 0` | GPU-composited (transform + opacity) |
| `HomepageProjectCard` | `opacity: 0, y: 24` → `opacity: 1, y: 0` | GPU-composited |
| `ProjectCard` | `opacity: 0, y: 24` → `opacity: 1, y: 0` | GPU-composited |
| `ServiceCard` | `opacity: 0, y: 24` → `opacity: 1, y: 0` | GPU-composited |
| `TestimonialCard` | `opacity: 0, y: 24` → `opacity: 1, y: 0` | GPU-composited |
| `FloatingCta` | `opacity: 0, y: 8` → `opacity: 1, y: 0` | GPU-composited |
| `Nav` overlay | `opacity: 0` → `opacity: 1` | GPU-composited |
| `HeroHeadline` | CSS `transform: scaleX()` + `transition` | GPU-composited (no framer-motion) |

No `width`, `height`, `top`, `left`, or layout-triggering properties are animated. The framer-motion v12 `whileHover`/`whileInView` conflict is correctly avoided everywhere — hover uses CSS `hover:-translate-y-1` not framer-motion `whileHover`.

`will-change: "transform"` is correctly applied to the HeroHeadline highlight bars (`HeroHeadline.tsx:201`). No other components use `will-change`, which is appropriate — overuse of `will-change` wastes GPU memory.

No canvas, WebGL, particle systems, or heavy third-party scripts were found. No analytics, no chat widgets, no pixel trackers on any page.

`prefers-reduced-motion` is respected in: `HeroHeadline` (skips animation, shows final state), `BrowserMockup`, `HomepageProjectCard`, `ProjectCard`, `ServiceCard`, `TestimonialCard`, `FloatingCta` (all use `useReducedMotion()` hook from framer-motion). Global CSS also applies `animation-duration: 0.01ms` blanket reduction.

---

## Core Web Vitals Assessment

| Metric | Status | Notes |
|---|---|---|
| **LCP** | At risk | gushow-excavating.png (3.4 MB, no priority hint) is likely LCP on homepage. No `fetchpriority="high"`. |
| **CLS** | Pass | All images wrapped in aspect-ratio containers (`aspect-[16/10]`, `aspect-square`, `aspect-[4/5]`). No layout shift from images. Font FOUT possible but swap prevents layout shift. |
| **FID/INP** | Likely fine | No heavy synchronous JS. Framer Motion runs in RAF. Scroll listeners use `{ passive: true }`. |
| **FCP** | At risk | Google Fonts `@import` delays font load. System font fallback shown initially (FOUT). Switching to `next/font` would improve FCP. |
| **TTFB** | Unknown | Depends on Netlify edge. No SSR bottlenecks in code. |

---

## File Size Reference

| File | Size | Status |
|---|---|---|
| `gushow-excavating.png` | 3.4 MB | Critical — must compress |
| `rewilding-life.png` | 3.9 MB | Critical — must compress |
| `rustic-table.png` | 340 KB | Acceptable but convert to WebP |
| `martinez-hvac.png` | 111 KB | Good |
| `reyes-law.png` | 92 KB | Good |
| `noah-headshot.jpg` | Not created yet | Add `loading="lazy"` preemptively |

---

## Prioritized Fix List for Mobile Fix Agent

**Critical (fix first):**
1. [C1/C2] Compress gushow-excavating.png and rewilding-life.png to WebP — target <400 KB each
2. [C3] Add `loading="lazy"` to all `<img>` tags in BrowserMockup, LocationPage, AboutPage
3. [H2] Add `fetchpriority="high"` to first card image (delay=0) as LCP hint

**High (fix second):**
4. [H1] Verify lazy loading applied to all below-fold images (covered by C3 fix)
5. [H3] Add `will-change: transform` to hero glow orb; reduce to `blur-2xl` on mobile
6. [H4] Add `loading="lazy"` to headshot `<img>` tags preemptively
7. [H5] Migrate fonts from CSS `@import` to `next/font/google` in `layout.tsx`

**Medium (fix third):**
8. [M1] Remove `box-shadow` from ServiceCard transition list
9. [M2] Remove `backdrop-blur-xl` from mobile nav overlay
10. [M3] Add `images: { formats: ['image/avif', 'image/webp'] }` to `next.config.mjs`
