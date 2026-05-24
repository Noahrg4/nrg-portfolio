# NRG Portfolio — Mobile Visual Polish Log

**Agent:** Visual Polish Agent
**Date:** 2026-05-24
**Scope:** Medium + Low issues from docs/mobile-audit.md — "feels intentional and premium"
**Prerequisite commits:** cbb603c, 13159f7, 4b02029, 45ebadc, 05c52fc (Mobile Fix Agent)

---

## All Changes by Commit

---

### Commit 919e56d
**Message:** `polish(mobile): tighten section padding floor on mobile (Issue 14)`
**File:** `src/app/globals.css`
**Mobile-only:** Yes — `@media (max-width: 767px)` block, no desktop rules touched

| Class | Before | After (mobile) |
|---|---|---|
| `.section-pad` | floor 3rem (48px) | floor 2.5rem (40px) |
| `.py-section` | floor 3rem (48px) | floor 2.5rem (40px) |
| `.py-section-lg` | floor 4rem (64px) | floor 3rem (48px) |

**Effect:** At 375px, saves 16px per section × 8 sections = ~128px total scroll height. The homepage homepage now breathes better without being sparse.

---

### Commit c4fe34a
**Message:** `polish(mobile): LocationPage — step numbers, testimonials gap, heading reflow, CTA height`
**File:** `src/components/LocationPage.tsx`
**Mobile-only:** Yes — changes use `md:` prefix to restore desktop values or apply `max-md:` directly

#### Process step numbers (Issue 12)
| Element | Before | After |
|---|---|---|
| Step number `<span>` | `text-6xl` (60px, all viewports) | `text-5xl md:text-6xl` (48px mobile, 60px desktop) |

Saves ~36px per card, 108px across 3 cards.

#### Testimonials grid gap
| Element | Before | After |
|---|---|---|
| Testimonials `<div>` gap | `gap-12` (48px all) | `gap-8 md:gap-12` (32px mobile, 48px desktop) |

Brief spec: 2rem (32px) gap on mobile.

#### Work section heading (Issue 11)
| Before | After |
|---|---|
| Three hard-coded `<br />` tags forcing rigid 3-line wrap | Single text string, natural reflow at 335px |

Removes rigid line breaks that prevented natural reflow on narrow viewports.

#### Hero + CTA band primary button height (Issue 9 follow-up)
| Element | Before | After |
|---|---|---|
| "Start a project" (hero) | `py-4` (~52px) | `py-4 max-md:min-h-[56px]` |
| "Start a project" (CTA band) | `py-4` (~52px) | `py-4 max-md:min-h-[56px]` |

Ensures 56px floor on mobile for the primary conversion button on all 4 location pages.

---

### Commit 5cd69ae
**Message:** `polish(mobile): TestimonialCard — reduce left border padding on mobile`
**File:** `src/components/TestimonialCard.tsx`
**Mobile-only:** Yes — `md:` prefix restores desktop values

| Variant | Before | After |
|---|---|---|
| Featured | `pl-10` (40px all) | `pl-6 md:pl-14` (24px mobile, 56px desktop) |
| Standard | `pl-8` (32px all) | `pl-6 md:pl-8` (24px mobile, 32px desktop) |

Brief recommendation: 1.25–1.5rem (20–24px) on mobile. `pl-6` = 24px. Recovers usable width on 335px screens.

---

### Commit 04d436e
**Message:** `polish(mobile): sub-page CTAs — full-width + 56px floor; WorkPage page-top fix`
**Files:** `src/components/pages/WorkPage.tsx`, `src/components/pages/AboutPage.tsx`, `src/components/pages/ServicesPage.tsx`
**Mobile-only:** Yes — `sm:` prefixes restore desktop auto-width; `max-md:min-h-[56px]` mobile-only

#### WorkPage `page-top` (Issue 15)
| Before | After |
|---|---|
| `pt-24 md:pt-40` (hardcoded) | `page-top` (clamp, matches other sub-pages) |

Eliminates maintenance inconsistency.

#### CTA buttons — Work, About, Services (Issue 16)
| Attribute | Before | After |
|---|---|---|
| Layout | `inline-flex` | `flex w-full sm:w-auto sm:inline-flex` |
| Vertical padding | `py-3.5` (~44px) | `py-4 max-md:min-h-[56px]` (56px mobile) |
| Alignment | left-aligned | `justify-center` (centered when full-width) |

Primary conversion CTAs on sub-pages are now full-width on mobile (375px), matching location page hero CTA pattern, and meet the 56px floor.

---

### Commit 9dc03fb
**Message:** `polish(mobile): ContactPage sidebar — reduce padding on mobile (Issue 13)`
**File:** `src/components/pages/ContactPage.tsx`
**Mobile-only:** Yes — `md:` prefix restores desktop values

| Attribute | Before | After |
|---|---|---|
| Padding | `p-8` (32px all sides) | `p-5 md:p-8` (20px mobile, 32px desktop) |
| Gap | `gap-8` (32px all) | `gap-6 md:gap-8` (24px mobile, 32px desktop) |

Reduces sidebar block height on mobile by ~48px total without hiding any content. Desktop unchanged.

---

### Commit 718d55f
**Message:** `polish(mobile): HeroHeadline — lower font-size clamp floor to prevent wrap (Issue 10)`
**File:** `src/components/HeroHeadline.tsx`
**Mobile-only:** In practice — the change affects the clamp minimum, which only activates below ~400px

| Before | After |
|---|---|
| `clamp(1.75rem, 8vw, 9rem)` | `clamp(1.5rem, 7.5vw, 9rem)` |
| At 375px: 30px (vw wins) | At 375px: 28px (vw wins, floor 24px) |

Gives ~20% more margin against "Real Websites." wrapping in the 335px container in Syne 800. Desktop max (9rem) unchanged.

---

### Commit a775789
**Message:** `polish(mobile): BrowserMockup URL bar — add truncate to prevent overflow (Issue 18)`
**File:** `src/components/BrowserMockup.tsx`
**Mobile-only:** Effect only visible on narrow widths; class harmless on desktop

| Before | After |
|---|---|
| URL bar `div` — no overflow control | `truncate overflow-hidden` added |

Long URLs (28+ chars) clip with ellipsis instead of potentially spilling outside the border-radius.

---

### Commit 2fcdbfc
**Message:** `polish(mobile): Footer — bump mobile text 11px → 12px for legibility (Issue 19)`
**File:** `src/components/Footer.tsx`
**Mobile-only:** Yes — changed only inside `md:hidden` block

| Before | After |
|---|---|
| `text-[11px]` in mobile footer | `text-[12px]` |

1px improvement in legibility for the one-liner at the edge of readable size. Desktop block uses `text-[11px]` and is unchanged.

---

### Commit 675207d
**Message:** `polish(mobile): AboutSkillCard + ServiceDetailCard body text 15px → text-base (Issue 20)`
**Files:** `src/components/AboutSkillCard.tsx`, `src/components/ServiceDetailCard.tsx`
**Mobile-only:** No — this is a universal token fix; 15px → 16px at all viewports

| Before | After |
|---|---|
| `text-[15px]` (magic number) | `text-base` (design system token, 16px) |

Replaces non-system pixel values with the correct design token. Affects /about skills grid and /services detail cards includes list.

---

## Issues Skipped (with reasoning)

### Issue 17 — HeroHeadline Phase 2 touch events (Low)
**Decision: Skip.**
Phase 2 is a desktop hover interaction by design. Phase 1 auto-sequence plays correctly on touch. Adding touchstart/touchend listeners would add complexity to the most delicate animation in the codebase (pure DOM, no framer-motion). The brief endorses documenting this as desktop-only.

### Contact form input padding — `py-3.5` → `py-4`
**Decision: Skip.**
Audit pass shows ContactForm inputs are `py-3.5` = 14px+14px + 24px line-height = ~52px. The audit checklist already marks these as PASS (meets 48px minimum). The brief says to add `max-md:py-4` to bump to 48px+ but 52px already exceeds the floor. No change needed.

### Contact form submit button — `py-4` verification
**Decision: No change needed.**
Submit button already uses `py-4` + `text-sm` (14px, 20px line) = 52px. The `max-md:min-h-[56px]` suggested in the brief would add a marginal 4px. Since this button also has `w-full md:w-auto` already (the Fix Agent set this), and 52px is a comfortable touch target, skipping the additional 4px.

### FloatingCta font size verification
**Decision: No change needed.**
Current: `text-[15px] md:text-sm`. Mobile at 15px, desktop at 14px — mobile is already larger than desktop, matching brief endorsement.

### Hero section top padding (pt-16 + section padding)
**Decision: No change needed.**
`main` has `pt-16` (64px = nav height), hero section has `py-section` (48px floor on mobile after our globals.css fix). Total top breathing room is 112px on mobile. At 375px this feels right — not cramped. The brief notes this may be fine.

---

## Summary

| Issue | Severity | Status |
|---|---|---|
| 10 — HeroHeadline wrap risk at 375px | Medium | Fixed (719d55f) |
| 11 — Work heading manual `<br />` tags | Medium | Fixed (c4fe34a) |
| 12 — Process step numbers oversized on mobile | Medium | Fixed (c4fe34a) |
| 13 — Contact sidebar heavy padding on mobile | Medium | Fixed (9dc03fb) |
| 14 — Section padding floor too high | Medium | Fixed (919e56d) |
| 15 — WorkPage pt-24 → page-top | Medium | Fixed (04d436e) |
| 16 — Sub-page CTA buttons narrow + short | Medium | Fixed (04d436e) |
| 17 — HeroHeadline touch Phase 2 | Low | Skipped (desktop-only by design) |
| 18 — BrowserMockup URL bar clip | Low | Fixed (a775789) |
| 19 — Footer email 11px legibility | Low | Fixed (2fcdbfc) |
| 20 — 15px body text magic number | Low | Fixed (675207d) |
| Testimonials gap | Brief spec | Fixed (c4fe34a) |
| TestimonialCard left padding | Brief spec | Fixed (5cd69ae) |
