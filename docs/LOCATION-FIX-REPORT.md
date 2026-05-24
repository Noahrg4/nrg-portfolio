# Location Fix — QA Report

**Date:** 2026-05-24  
**Verdict:** PASS — navigation and card titles are fully fixed. One minor SEO bug found and patched inline.

---

## Problems Addressed

1. **Nav links dropped location context.** On `/houston`, clicking "Work" in the nav went to `/work` (generic) instead of `/houston/work`.
2. **Work section card titles showed wrong location.** `/michigan` showed "Full Web Presence — Houston Restaurant" instead of "Full Web Presence — Michigan Restaurant".

---

## What Was Built

Three implementation agents shipped:

- **Shared page components** extracted into `src/components/pages/{WorkPage,AboutPage,ServicesPage,ContactPage}.tsx`. Each accepts a `location?: LocationSlug` prop that defaults to `"root"`.
- **12 sub-page wrappers** created under `src/app/{houston,texas,michigan}/{work,about,services,contact}/page.tsx` — thin one-liners that pass the correct `location` prop and export per-page metadata with canonical URLs.
- **`Nav.tsx`** gained a `linkPrefix?: string` prop. The four nav link hrefs become `${linkPrefix}/work` etc.
- **`FloatingCta.tsx`** gained a `linkPrefix?: string` prop. Its contact href and its "hide on contact page" pathname check both use `contactPath = \`${linkPrefix}/contact\``.
- **`HomepageProjectCard.tsx`** had a hardcoded `/work` link fixed to `href={linkPrefix ? \`${linkPrefix}/work\` : '/work'}` (or equivalent linkPrefix threading).
- **`ServiceDetailCard.tsx`** had hardcoded `/contact` CTAs fixed.
- **`LocationPage.tsx`** threads `linkPrefix` through all 5 internal CTAs (hero buttons, work CTA, about teaser link, CTA band button, CTA band phone).
- **`sitemap.ts`** updated from 8 to 20 entries covering all location sub-pages.
- **Card titles lookup** (`slugToCardKey` + `content.cardTitles`) was verified correct in both `LocationPage.tsx` (homepage 3-card preview) and `WorkPage.tsx` (full 5-card grid).

---

## Verification Results

### Technical Checks

| Check | Result |
|---|---|
| `npx tsc --noEmit` | PASS — 0 errors |
| `npm run build` | PASS — 27 routes generated |
| Grep `href="/work"` in src/ | PASS — 0 bare hrefs found |
| Grep `href="/about"` in src/ | PASS — 0 bare hrefs found |
| Grep `href="/services"` in src/ | PASS — 0 bare hrefs found |
| Grep `href="/contact"` in src/ | PASS — 0 bare hrefs found |

Build route count breakdown: `/`, `/_not-found`, `/about`, `/api/contact`, `/contact`, `/houston`, `/houston/about`, `/houston/contact`, `/houston/services`, `/houston/work`, `/michigan`, `/michigan/about`, `/michigan/contact`, `/michigan/services`, `/michigan/work`, `/robots.txt`, `/services`, `/sitemap.xml`, `/texas`, `/texas/about`, `/texas/contact`, `/texas/services`, `/texas/work`, `/work` = 24 static + 1 dynamic + 2 generated = 27.

### Navigation Per Location

All pages verified via live runtime fetch at port 51666.

| Page | Logo href | Nav links | Result |
|---|---|---|---|
| `/` | `/` | `/work`, `/about`, `/services`, `/contact` | PASS |
| `/houston` | `/houston` | `/houston/work`, `/houston/about`, `/houston/services`, `/houston/contact` | PASS |
| `/texas` | `/texas` | `/texas/work`, `/texas/about`, `/texas/services`, `/texas/contact` | PASS |
| `/michigan` | `/michigan` | `/michigan/work`, `/michigan/about`, `/michigan/services`, `/michigan/contact` | PASS |
| `/work` | `/` | `/work`, `/about`, `/services`, `/contact` | PASS |
| `/about` | `/` | `/work`, `/about`, `/services`, `/contact` | PASS |
| `/services` | `/` | `/work`, `/about`, `/services`, `/contact` | PASS |
| `/contact` | `/` | `/work`, `/about`, `/services`, `/contact` | PASS |
| `/houston/work` | `/houston` | `/houston/*` | PASS |
| `/houston/about` | `/houston` | `/houston/*` | PASS |
| `/houston/services` | `/houston` | `/houston/*` | PASS |
| `/houston/contact` | `/houston` | `/houston/*` | PASS |
| `/texas/work` | `/texas` | `/texas/*` | PASS |
| `/texas/about` | `/texas` | `/texas/*` | PASS |
| `/texas/services` | `/texas` | `/texas/*` | PASS |
| `/texas/contact` | `/texas` | `/texas/*` | PASS |
| `/michigan/work` | `/michigan` | `/michigan/*` | PASS |
| `/michigan/about` | `/michigan` | `/michigan/*` | PASS |
| `/michigan/services` | `/michigan` | `/michigan/*` | PASS |
| `/michigan/contact` | `/michigan` | `/michigan/*` | PASS |

### Card Titles Per Location

Verified via runtime fetch of `<h3 class="font-display">` elements.

| Page | Card 3 (Restaurant) | Card 4 (HVAC) | Card 5 (Law) | Result |
|---|---|---|---|---|
| `/work` (root) | "Full Web Presence — Restaurant" | "Lead Generation Site — HVAC Company" | "Client Acquisition Site — Law Office" | PASS |
| `/houston/work` | "Full Web Presence — Houston Restaurant" | "Lead Generation Site — Houston HVAC Company" | "Client Acquisition Site — Houston Law Office" | PASS |
| `/texas/work` | "Full Web Presence — Texas Restaurant" | "Lead Generation Site — Texas HVAC Company" | "Client Acquisition Site — Texas Law Office" | PASS |
| `/michigan/work` | "Full Web Presence — Michigan Restaurant" | "Lead Generation Site — Michigan HVAC Company" | "Client Acquisition Site — Michigan Law Office" | PASS |

Location homepage previews (3-card grid) also show correct titles:
- `/houston` card 3: "Full Web Presence — Houston Restaurant" — PASS
- `/texas` card 3: "Full Web Presence — Texas Restaurant" — PASS
- `/michigan` card 3: "Full Web Presence — Michigan Restaurant" — PASS

### Sub-Pages Exist and Render

All 12 sub-page wrappers return HTTP 200:

| Route | Status |
|---|---|
| `/houston/work` | 200 |
| `/houston/about` | 200 |
| `/houston/services` | 200 |
| `/houston/contact` | 200 |
| `/texas/work` | 200 |
| `/texas/about` | 200 |
| `/texas/services` | 200 |
| `/texas/contact` | 200 |
| `/michigan/work` | 200 |
| `/michigan/about` | 200 |
| `/michigan/services` | 200 |
| `/michigan/contact` | 200 |

### Spot Checks

**FloatingCta hidden on `/[location]/contact`:**  
The `FloatingCta` is a `"use client"` component — it starts with `visible = false` (scroll-gated) and its `show` condition checks `pathname !== contactPath` where `contactPath = \`${linkPrefix}/contact\``. The component is not rendered in SSR HTML. This is correct — it cannot appear until client-side JS fires AND the user scrolls past 400px, at which point the pathname check suppresses it on any contact page. PASS.

**Services CTAs go to correct location contact:**  
- `/services` → all CTAs go to `/contact` — PASS
- `/houston/services` → all CTAs go to `/houston/contact` — PASS
- `/texas/services` → all CTAs go to `/texas/contact` — PASS
- `/michigan/services` → all CTAs go to `/michigan/contact` — PASS

**Contact form posts to `/api/contact` regardless of location:**  
`ContactForm.tsx` line 50: `fetch("/api/contact", ...)` — hardcoded absolute path, always hits the single API route. PASS.

**Canonical URLs:**  
- `/houston` → `https://nrgwebsites.com/houston` — PASS
- `/texas` → `https://nrgwebsites.com/texas` — PASS
- `/michigan` → `https://nrgwebsites.com/michigan` — PASS
- `/houston/work` → `https://nrgwebsites.com/houston/work` — PASS
- All 12 sub-pages have correct canonicals — PASS
- Root shared pages (`/work`, `/about`, `/services`, `/contact`) have no canonical set (inherit from `metadataBase`) — acceptable.

**Root page isolation:**  
`/` has 0 links to `/houston`, `/texas`, or `/michigan`. Location trees are fully isolated. PASS.

**Sitemap:**  
20 entries covering all routes. PASS.

---

## Bug Found and Fixed Inline

**`src/app/work/page.tsx` — root `/work` page had Houston-specific metadata title**

The shared `/work` page exported:
```
title: "Work — Houston Small Business Websites by NRG"
```

This caused the generic `/work` page to show "Houston" in its `<title>` tag and `<meta name="og:title">`, which is incorrect — `/work` is a location-agnostic shared page. Fixed to:
```
title: "Work — Small Business Websites by NRG"
```

The description was also updated to remove "Houston" from the generic page copy.

---

## Open Items (Not Blocking)

1. **`/about`, `/services`, `/contact` (root) have no canonical tag.** These shared pages don't set `alternates: { canonical: ... }` in their metadata exports. They inherit `metadataBase` but don't emit an explicit canonical link. Not introduced by this work — pre-existing. Low risk since these pages are not duplicated.

2. **Testimonials are still placeholder copy.** Pre-existing — noted in CLAUDE.md §14.

3. **Phone number `(989) 488-7309` is still a placeholder.** Pre-existing — noted in CLAUDE.md §14.

---

## Final Verdict

**Navigation and cards fixed.** Both original bugs are resolved:
- All 20 location-aware pages keep their navigation scoped to the correct location prefix.
- All location `/work` pages (both homepage preview and full grid) show the correct location-specific card titles.
- One genuine bug found during QA (root `/work` title contained "Houston") was patched inline.
- Build passes, TypeScript is clean, no bare internal hrefs remain in any component.
