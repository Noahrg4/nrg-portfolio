# Content Map Fixes — Location-Aware Fields Added

**Date:** 2026-05-24
**Agent:** Content Map Agent
**Status:** Complete — ready for Fix Agent wiring

---

## Overview

Search Agent identified 19 hardcoded location strings across 8 files. This document records the 12 new fields added to `LocationContent` in `src/lib/locationContent.ts`. Fix Agent will use these fields to replace every hardcoded string in components.

---

## New Fields Added

### 1. `workSectionHeading`

Used in: `src/components/LocationPage.tsx` (line ~112) — the H2 above the 3-card work preview grid

| Location | Value |
|---|---|
| root | "Websites built for real businesses." |
| houston | "Websites built for real Houston businesses." |
| texas | "Websites built for real Texas businesses." |
| michigan | "Websites built for real Michigan businesses." |

---

### 2. `aboutTeaserHeadline`

Used in: `src/components/LocationPage.tsx` (line ~262) — the section heading in the About Teaser section

| Location | Value |
|---|---|
| root | "Built to be reached. By someone you can talk to." |
| houston | "Built for Houston. By someone you can reach." |
| texas | "Built for Texas. By someone you can reach." |
| michigan | "Built for Michigan. By someone you can reach." |

---

### 3. `footerLocation`

Used in: `src/components/Footer.tsx` (lines ~26 and ~46) — location label in both mobile and desktop footer layouts. Fix Agent must add a `footerLocation` prop to `Footer` and thread it from `LocationPage`.

| Location | Value |
|---|---|
| root | "Texas + Michigan" |
| houston | "Houston, TX" |
| texas | "Texas" |
| michigan | "Michigan" |

---

### 4. `aboutPageHeadline`

Used in: `src/components/pages/AboutPage.tsx` (line ~53) — the page H1

| Location | Value |
|---|---|
| root | "I build websites for small businesses." |
| houston | "I build the web for Houston's small businesses." |
| texas | "I build websites for Texas small businesses." |
| michigan | "I build websites for Michigan small businesses." |

---

### 5. `aboutBioParagraph1`

Used in: `src/components/pages/AboutPage.tsx` (line ~70) — first paragraph of the bio section

| Location | Value |
|---|---|
| root | "I build websites and automation for small businesses — restaurants, trades companies, law offices, salons, and anyone else who deserves a professional web presence without the agency price tag." |
| houston | "I build websites and automation for Houston small businesses — restaurants, trades companies, law offices, salons, and anyone else who deserves a professional web presence without the agency price tag." |
| texas | "I build websites and automation for Texas small businesses — restaurants, trades companies, law offices, salons, and anyone else who deserves a professional web presence without the agency price tag." |
| michigan | "I build websites and automation for Michigan small businesses — restaurants, trades companies, law offices, salons, and anyone else who deserves a professional web presence without the agency price tag." |

**Note:** Bio paragraphs 2 and 3 were audited and contain no location-specific text. Only paragraph 1 and the closing line need parameterization.

---

### 6. `aboutBioClosingLine`

Used in: `src/components/pages/AboutPage.tsx` (line ~73) — fourth/closing paragraph of the bio

| Location | Value |
|---|---|
| root | "Available for projects now." |
| houston | "Based in Houston. Available for projects now." |
| texas | "Working across Texas. Available for projects now." |
| michigan | "Michigan roots. Available for projects now." |

---

### 7. `aboutLocationBadge`

Used in: `src/components/pages/AboutPage.tsx` (line ~77) — the first item in the credential pills/badges array

| Location | Value |
|---|---|
| root | "Independent" |
| houston | "Houston-based" |
| texas | "Texas-based" |
| michigan | "Michigan roots" |

**Implementation note:** The existing code maps a static string array `["Houston-based", "Solo", "8 businesses live", "Direct line"]`. Fix Agent should change only the first item to `content.aboutLocationBadge`, keeping the other three static.

---

### 8. `aboutSeoSkillBody`

Used in: `src/components/pages/AboutPage.tsx` (line ~29) — the `body` field of the "Local SEO" entry in the `skills` array constant

| Location | Value |
|---|---|
| root | "Google Business Profile, local search optimization. Show up when customers in your area search for you." |
| houston | "Google Business Profile, local search optimization. Show up when Houston customers search for you." |
| texas | "Google Business Profile, local search optimization. Show up when Texas customers search for you." |
| michigan | "Google Business Profile, local search optimization. Show up when Michigan customers search for you." |

**Implementation note:** The `skills` constant is currently defined outside the component function. Fix Agent must move it inside the function body so it can access `content.aboutSeoSkillBody`.

---

### 9. `aboutHeadshotAlt`

Used in: `src/components/pages/AboutPage.tsx` (line ~95) — the `alt` attribute on the headshot `<img>`

| Location | Value |
|---|---|
| root | "Noah Reuter-Gushow — NRG web designer" |
| houston | "Noah Reuter-Gushow — NRG web designer based in Houston, TX" |
| texas | "Noah Reuter-Gushow — NRG web designer serving Texas" |
| michigan | "Noah Reuter-Gushow — NRG web designer serving Michigan" |

---

### 10. `contactSidebarBlurb`

Used in: `src/components/pages/ContactPage.tsx` (line ~46) — the sidebar intro blurb

| Location | Value |
|---|---|
| root | "Currently taking on new projects. If you'd rather meet in person than trade emails, I'm happy to come to you." |
| houston | "Currently taking on new projects. Houston-based, so if you'd rather meet in person than trade emails, that works too." |
| texas | "Currently taking on new projects across Texas. Houston-based — happy to meet in person if you're nearby, otherwise email or phone works." |
| michigan | "Currently taking on new projects across Michigan. If you'd rather meet in person than trade emails, that can be arranged." |

---

### 11. `contactBasedIn`

Used in: `src/components/pages/ContactPage.tsx` (line ~82) — the value of the "Based in" label in the contact sidebar

| Location | Value |
|---|---|
| root | "Independent operator" |
| houston | "Houston, TX" |
| texas | "Texas" |
| michigan | "Mid-Michigan / Remote" |

---

### 12. `contactServiceArea`

Used in: `src/components/pages/ContactPage.tsx` (line ~84) — the descriptive line under the "Based in" block

| Location | Value |
|---|---|
| root | "Serving small businesses across the US." |
| houston | "Serving the greater Houston area. In-person meetings available." |
| texas | "Serving small businesses across Texas." |
| michigan | "Serving small businesses across Michigan." |

---

## Existing Fields — Leak Verification

All existing fields were verified for cross-location leaks:

| Field | texas block | michigan block | root block | Status |
|---|---|---|---|---|
| `heroLocationLine` | "for Texas small businesses." | "for Michigan small businesses." | null | Clean |
| `heroSub` | Texas-scoped | Michigan-scoped | Generic | Clean |
| `aboutOpener` | Texas-scoped | Michigan-scoped | Generic | Clean |
| `aboutParagraph2` | "Based in Houston and working across Texas" — intentional | Michigan-scoped | Generic | Clean* |
| `ctaBandHeadline` | Texas-scoped | Michigan-scoped | Generic | Clean |
| `ctaBandSub` | Generic | Generic | Generic | Clean |
| `metaTitle` | Texas-scoped | Michigan-scoped | Generic | Clean |
| `metaDescription` | "Houston-based operator" — intentional | Michigan-scoped | Generic | Clean* |
| `cardTitles.*` | Texas-scoped | Michigan-scoped | Generic | Clean |

*The texas block references "Houston" in `aboutParagraph2` ("Based in Houston and working across Texas") and `metaDescription` ("Houston-based operator") — these are factually correct geographic context, not misdirected location text. No correction needed.

**No existing field leaks found.**

---

## Components That Will Need Wiring (Fix Agent)

| Component / File | Fields to wire | Issue # |
|---|---|---|
| `src/components/LocationPage.tsx` | `workSectionHeading`, `aboutTeaserHeadline` | 1, 2 |
| `src/components/Footer.tsx` | `footerLocation` (needs new prop added) | 3 |
| `src/components/pages/AboutPage.tsx` | `aboutPageHeadline`, `aboutBioParagraph1`, `aboutBioClosingLine`, `aboutLocationBadge`, `aboutSeoSkillBody`, `aboutHeadshotAlt` | 4, 5, 6, 7, 8, 9 |
| `src/components/pages/ContactPage.tsx` | `contactSidebarBlurb`, `contactBasedIn`, `contactServiceArea` | 10, 11, 12 |

### Additional issues for Fix Agent (not resolved by new fields)

These issues from the audit require different fixes that don't involve new content-map fields:

| Issue # | File | Fix Type |
|---|---|---|
| 13, 14 | `src/lib/services.tsx` | Make Local SEO short/long descriptions generic (remove "Houston") |
| 15 | `src/lib/projects.ts` | Remove "Houston" from imageAlt on 3 spec projects |
| 16 | `src/app/layout.tsx` | Update root layout metadata to generic text |
| 17 | `src/app/about/page.tsx` | Update page metadata to generic "Web Designer" |
| 18 | `src/app/services/page.tsx` | Update page metadata to remove "Houston" |
| 19 | `src/app/contact/page.tsx` | Update page metadata to remove "Houston" |

---

## All Four Locations — Field Completeness Check

Every field in `LocationContent` has a value for all 4 locations:

| Field | root | houston | texas | michigan |
|---|---|---|---|---|
| `heroLocationLine` | null | set | set | set |
| `heroSub` | set | set | set | set |
| `workSectionHeading` | set | set | set | set |
| `aboutTeaserHeadline` | set | set | set | set |
| `aboutOpener` | set | set | set | set |
| `aboutParagraph2` | set | set | set | set |
| `ctaBandHeadline` | set | set | set | set |
| `ctaBandSub` | set | set | set | set |
| `footerLocation` | set | set | set | set |
| `metaTitle` | set | set | set | set |
| `metaDescription` | set | set | set | set |
| `navLogoHref` | set | set | set | set |
| `aboutPageHeadline` | set | set | set | set |
| `aboutBioParagraph1` | set | set | set | set |
| `aboutBioClosingLine` | set | set | set | set |
| `aboutLocationBadge` | set | set | set | set |
| `aboutSeoSkillBody` | set | set | set | set |
| `aboutHeadshotAlt` | set | set | set | set |
| `contactSidebarBlurb` | set | set | set | set |
| `contactBasedIn` | set | set | set | set |
| `contactServiceArea` | set | set | set | set |
| `cardTitles.*` (5 fields) | set | set | set | set |

All 26 fields (including 5 `cardTitles` sub-fields) have values for all 4 locations.

---

## TypeScript Status

`npx tsc --noEmit` — **clean, zero errors.**

The type and data are consistent. Expected: after Fix Agent wires components to read the new fields, a tsc run may temporarily show errors in components while partial wiring is in progress. Once all components are wired, tsc should remain clean.
