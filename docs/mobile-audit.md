# NRG Portfolio — Mobile Audit

**Audited:** 2026-05-24  
**Auditor:** Mobile Audit Agent  
**Targets:** 375px (iPhone SE), 390px (iPhone 14), 430px (iPhone Plus), 768px (tablet)  
**Scope:** All 16 routes — `/`, `/houston`, `/texas`, `/michigan`, plus 12 location sub-pages (`/houston/{work,about,services,contact}`, `/texas/{work,about,services,contact}`, `/michigan/{work,about,services,contact}`)

---

## Summary Counts

| Severity | Count |
|---|---|
| Critical | 3 |
| High | 6 |
| Medium | 7 |
| Low | 4 |
| **Total** | **20** |

---

## Critical Issues

---

ISSUE 1: FloatingCta — Tap Target
VIEWPORT: all mobile
PROBLEM: The "Let's talk →" floating CTA is a bare text `<Link>` with zero padding. Its tap target is approximately 15px tall × ~100px wide — far below the 44×44px iOS minimum. On touch devices a user who misses the narrow text band gets no feedback and no navigation. This affects all 16 pages (the component is rendered on 15 of them — excluded only on /contact variants).
FIX: Add explicit min-height and padding to the link element. Change the className to include `inline-flex items-center px-4 py-3 min-h-[44px]`. To keep the visual appearance, add a transparent background: `bg-canvas/0`. Full replacement className: `"inline-flex min-h-[44px] items-center px-4 py-3 font-mono text-[15px] uppercase tracking-wider text-accent underline-offset-4 transition-all hover:underline md:text-sm"`.
FILE: src/components/FloatingCta.tsx — line 34 (the `<Link>` element)
SEVERITY: Critical

---

ISSUE 2: FloatingCta — Hidden Behind iPhone Home Indicator
VIEWPORT: 375px, 390px, 430px
PROBLEM: The FloatingCta is positioned `fixed bottom-8 right-8` — `bottom-8` = 32px from the physical bottom edge. iPhone 14/SE home indicator bar is 34px tall. At 375px and 390px the floating CTA may be entirely behind the home indicator, making it untappable even if the tap target were large enough. iPhone 14 Pro Max with gesture bar = 44px inset. At 430px the issue is even worse.
FIX: Use CSS environment variable to account for the safe area. Replace `bottom-8` with a dynamic value using `style={{ bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}` on the `motion.div`. Remove the `bottom-8` Tailwind class from the outer div's className and add it only as the fallback in the calc.  
Alternatively, add `pb-safe` support by updating globals.css: `.floating-cta-bottom { bottom: max(2rem, calc(2rem + env(safe-area-inset-bottom))); }` and apply that class.
FILE: src/components/FloatingCta.tsx — line 28 (`className="fixed bottom-8 right-8 z-50"`)
SEVERITY: Critical

---

ISSUE 3: Nav Mobile Overlay — No Focus Trap
VIEWPORT: all mobile (keyboard/switch-access users)
PROBLEM: The mobile full-screen overlay (AnimatePresence > motion.div in Nav.tsx) has no focus trap. When a keyboard or assistive-technology user opens the nav overlay, Tab focus can leave the overlay and reach the underlying page content (which is still in the DOM at full opacity, only visually hidden by the overlay). This violates WCAG 2.1 Success Criterion 2.1.2 (No Keyboard Trap / focus containment in dialog-equivalent patterns). Additionally, there is no Escape key handler to close the menu, violating the expected modal interaction pattern for screen readers and keyboard users.
FIX: In Nav.tsx, add a `useEffect` that listens for `keydown` events when `open === true`:  
```tsx
useEffect(() => {
  if (!open) return;
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
    // Focus trap: intercept Tab
  };
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
}, [open]);
```
For full focus trap, collect all focusable elements inside the overlay ref and cycle Tab/Shift-Tab among them only. Also add an `aria-modal="true"` attribute and `role="dialog"` to the overlay `motion.div`.
FILE: src/components/Nav.tsx — lines 105–139 (mobile overlay block)
SEVERITY: Critical

---

## High Issues

---

ISSUE 4: Nav Mobile Overlay — No Backdrop Tap-to-Close
VIEWPORT: all mobile
PROBLEM: The mobile overlay covers the full screen below the header but has no `onClick` handler on the outer div for tap-to-close. The only ways to close the menu are: (a) tap a nav link, (b) tap the hamburger button again. Tapping any empty space in the overlay (between nav items) does nothing. This violates the standard mobile nav UX pattern and will confuse users who try to dismiss the menu by tapping outside it.
FIX: The overlay motion.div already covers the full screen. Add an `onClick={() => setOpen(false)}` handler directly on it, then add `e.stopPropagation()` on the inner `<nav>` and `<div className="mt-auto">` to prevent click-through from closing when tapping a link area. Or add a separate transparent backdrop div behind the nav content that handles the tap.
FILE: src/components/Nav.tsx — line 107 (`<motion.div` opening tag of the overlay)
SEVERITY: High

---

ISSUE 5: "All projects →" Link — Tap Target Too Small
VIEWPORT: all mobile
PROBLEM: The "All projects →" link below the homepage work grid is `font-mono text-[13px]` with no padding. Its tap target is approximately 13px tall, well under the 44px iOS/Android minimum. It is right-aligned in the grid which also makes it harder to hit at the far right edge on small screens. This appears on all 4 location pages (/, /houston, /texas, /michigan) via LocationPage.tsx.
FIX: Add explicit padding to create a minimum tap area. Replace the current className with: `"inline-flex min-h-[44px] items-center font-mono text-[13px] text-accent transition-opacity duration-200 hover:opacity-80"`. The visual appearance (13px text + arrow) is unchanged; only the clickable area expands.
FILE: src/components/LocationPage.tsx — line 141 (the "All projects →" Link)
SEVERITY: High

---

ISSUE 6: ServiceDetailCard "Discuss this →" Link — Tap Target Too Small
VIEWPORT: all mobile
PROBLEM: The "Discuss this →" link inside ServiceDetailCard is `font-mono text-xs` (12px) with no padding. Its tap target is ~12px tall. This appears on `/services` and all 3 location-scoped `/services` pages (12 total across the 4 locations).
FIX: Add `inline-flex min-h-[44px] items-center` to the Link className in ServiceDetailCard. Replace `"font-mono text-xs uppercase tracking-wider text-accent transition-opacity duration-200 hover:opacity-80"` with `"inline-flex min-h-[44px] items-center font-mono text-xs uppercase tracking-wider text-accent transition-opacity duration-200 hover:opacity-80"`.
FILE: src/components/ServiceDetailCard.tsx — line 65 (the "Discuss this →" Link)
SEVERITY: High

---

ISSUE 7: "More about me →" Link — Tap Target Too Small
VIEWPORT: all mobile
PROBLEM: The "More about me →" link in the About Teaser section of LocationPage is `font-mono text-sm` with `inline-flex` but no explicit height or padding. The effective tap target height is ~20px (1 line of text-sm). This appears on all 4 location pages.
FIX: Add `min-h-[44px]` and `items-center` to the existing `inline-flex` wrapper: change `"inline-flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-accent transition-opacity duration-200 hover:opacity-80"` to `"inline-flex min-h-[44px] items-center gap-2 font-mono text-sm uppercase tracking-wider text-accent transition-opacity duration-200 hover:opacity-80"`.
FILE: src/components/LocationPage.tsx — line 285 (the "More about me →" Link)
SEVERITY: High

---

ISSUE 8: Footer — No Safe-Area Bottom Inset (iPhone Home Indicator)
VIEWPORT: 375px, 390px, 430px
PROBLEM: The footer `py-8` (32px top/bottom padding) has no `env(safe-area-inset-bottom)` adjustment. On iPhone SE 3rd gen, 14, and Plus — which all have a 34px home indicator — the bottom-most footer text (the email and copyright line at ~11px font size) sits at approximately 32px from the physical bottom edge, potentially overlapping with the home indicator gesture zone. The content is technically reachable but cramped and may be obscured by the OS chrome on some devices.
FIX: In Footer.tsx, change the container `py-8` to use a conditional bottom padding. Replace `className="container-content py-8"` with `className="container-content pt-8"` and add `style={{ paddingBottom: 'max(2rem, calc(2rem + env(safe-area-inset-bottom, 0px)))' }}` as an inline style on the container div. Alternatively, add the `pb-safe` pattern to globals.css as a utility class.
FILE: src/components/Footer.tsx — line 11 (`<div className="container-content py-8">`)
SEVERITY: High

---

ISSUE 9: Hero CTA "Start a project" — Height Below 56px Target
VIEWPORT: all mobile
PROBLEM: The primary hero CTA button uses `py-3.5` (14px top + 14px bottom = 28px padding) with `text-sm` (14px, line-height 20px) = total height ~48px. This meets the 44px iOS minimum but falls short of the 56px tall recommended for primary action buttons on landing pages. This is the single most important conversion button on the site (appears on all 4 location pages).
FIX: Increase to `py-4` (16px × 2 = 32px padding) + text-sm 20px = 52px. Or `py-[14px]` with `text-base` (16px, 24px line-height) = 52px. For full 56px: `py-[18px]`. Recommended: change `py-3.5` to `py-4` on the "Start a project" Link in the hero CTAs section and CTA band for a consistent upgrade.
FILE: src/components/LocationPage.tsx — lines 70 and 314 (hero + CTA band primary buttons)
SEVERITY: High

---

## Medium Issues

---

ISSUE 10: HeroHeadline — Potential Wrap Risk at 375px
VIEWPORT: 375px
PROBLEM: At 375px, `clamp(1.75rem, 8vw, 9rem)` resolves to `max(28px, 30px) = 30px`. The container is 335px wide (375px − 40px padding). "Real Websites." is the longest line at ~15 chars in Syne 800 (a wide display font). Estimated rendered width is approximately 195–240px depending on font load metrics — the range is wide because Syne 800 has a large cap-height and wide letterforms. The prior audit session flagged wrapping as a confirmed issue in a screenshot. If the line wraps mid-phrase within the `overflow-hidden` span, the highlight sweep animation will look broken (the bar animates the full width but only one line of text shows).
FIX: Add a lower clamp floor: change `text-[clamp(1.75rem,8vw,9rem)]` to `text-[clamp(1.5rem,7.5vw,9rem)]`. At 375px: 7.5vw = 28.1px, clamped to floor 1.5rem = 24px. This gives ~20% more width margin. Alternatively, keep the font size and add `whitespace-nowrap` + `overflow-visible` on the inner `<span ref={txt*}>` elements, but this risks viewport overflow if not paired with a smaller font floor.
FILE: src/components/HeroHeadline.tsx — line 215 (`text-[clamp(1.75rem,8vw,9rem)]`)
SEVERITY: Medium

---

ISSUE 11: Work Section Heading — Hard-coded Text at 36px on Mobile
VIEWPORT: 375px, 390px
PROBLEM: The "Websites built / for real Houston / businesses." heading in LocationPage uses `text-4xl` (36px) on mobile. The manual line breaks (`<br />`) force three lines at 36px each, consuming significant vertical real estate (36px × 3 lines × 0.95 line-height ≈ 103px for the heading alone, plus section padding). At 375px this is not a readability problem per se, but the rigid `<br />` tags mean the text cannot reflow naturally.
FIX: Remove the explicit `<br />` tags and let the text reflow naturally at narrow widths. The section heading in LocationPage.tsx lines 111–116 has hard-coded `<br />` inside SectionHeading. These should be removed. The text will fill to 2 lines naturally at 335px. Combined with setting `text-[clamp(2rem,5vw,3.75rem)]` instead of the fixed `text-4xl md:text-6xl`, this gives fluid scaling.
FILE: src/components/LocationPage.tsx — lines 110–117 (Work section SectionHeading)
SEVERITY: Medium

---

ISSUE 12: Process Section Step Cards — Oversized Step Numbers on Mobile
VIEWPORT: 375px, 390px
PROBLEM: The step numbers "01", "02", "03" use `font-display text-6xl font-extrabold text-accent` — 60px Syne 800 in cyan. Inside a card with `p-8` (32px padding) on a 335px wide container, the number occupies roughly 80–90px vertically on its own. This makes the process cards very tall (step number + title + body + padding ≈ 280px per card). Three cards at 280px each = 840px of vertical scroll for this section alone. The step numbers are decorative and visually loud at mobile size.
FIX: Reduce step number size on mobile: change `font-display text-6xl font-extrabold text-accent` to `font-display text-4xl md:text-6xl font-extrabold text-accent`. At 375px this drops from 60px to 36px, saving ~72px across three cards total.
FILE: src/components/LocationPage.tsx — line 211 (the step number `<span>`)
SEVERITY: Medium

---

ISSUE 13: Contact Page — Sidebar Renders Below Form on Mobile with Heavy Padding
VIEWPORT: 375px, 390px
PROBLEM: The contact page grid is `grid-cols-1 gap-12 md:grid-cols-[1.5fr_1fr]`. On mobile, the aside (info sidebar) renders below the form with `gap-12` (48px) separating them. The sidebar has `p-8` (32px padding), `rounded-xl`, `border`, and contains 4 stacked info blocks (availability, email, phone, location, response time) separated by bordered sections. This creates a heavy visual block that users must scroll past after submitting the form. Much of the sidebar info (phone, email, location) duplicates what a user already sees in the footer.
FIX: On mobile, collapse the sidebar to show only the most critical info. Wrap each sidebar block in a responsive utility: show only the availability blurb and the direct contact links on mobile, hiding the "Based in" and "Response time" blocks. Add `hidden sm:flex` to the `<aside>` entirely and surface only the phone/email links as an inline strip below the form — or keep the aside but reduce its padding to `p-5` on mobile with `sm:p-8`.
FILE: src/components/pages/ContactPage.tsx — line 43 (`<aside className="flex flex-col gap-8 rounded-xl border border-hairline bg-surface-1 p-8">`)
SEVERITY: Medium

---

ISSUE 14: Section Padding Floor Too High on Mobile
VIEWPORT: 375px
PROBLEM: `.section-pad` and `.py-section` use `clamp(3rem, 8vw, 6rem)`. At 375px: 8vw = 30px, so the clamp resolves to `max(48px, 30px) = 48px`. Each section has 48px top + 48px bottom = 96px of vertical padding. The homepage has approximately 8 sections, producing ~768px of padding alone. This creates excessive whitespace on small screens and pushes content apart more than necessary for a mobile-first portfolio.
FIX: Lower the mobile floor: change `clamp(3rem, 8vw, 6rem)` to `clamp(2.5rem, 8vw, 6rem)` in globals.css for both `.section-pad` and `.py-section`. At 375px this gives 40px per side (80px per section) instead of 96px — saves 16px per section × 8 sections = 128px of total scroll height. `py-section-lg` floor can drop from 4rem to 3rem similarly.
FILE: src/app/globals.css — lines 129–151 (`.section-pad`, `.py-section`, `.py-section-lg`)
SEVERITY: Medium

---

ISSUE 15: WorkPage — Hardcoded `pt-24` Instead of Fluid `page-top`
VIEWPORT: all mobile
PROBLEM: WorkPage.tsx uses `className="pt-24 md:pt-40"` while all other sub-pages (About, Services, Contact) use `className="page-top"` (which is `clamp(6rem, 14vw, 10rem)`). At 375px both resolve to 96px (pt-24 = 96px; clamp floor = 96px) so it's visually identical, but at other widths they diverge (e.g., at 640px: pt-24 = 96px but page-top = 14vw = 89.6px). The inconsistency is a maintenance debt.
FIX: Change `<main className="pt-24 md:pt-40">` to `<main className="page-top">` in WorkPage.tsx.
FILE: src/components/pages/WorkPage.tsx — line 29
SEVERITY: Medium

---

ISSUE 16: Services/About/Work CTA Buttons — Width Not Full on Mobile
VIEWPORT: 375px, 390px
PROBLEM: CTA buttons on `/services`, `/about`, and `/work` pages use `inline-flex` without `w-full`, making them auto-width (left-aligned, content-wide). This is inconsistent with the location page hero CTAs which use `flex` (full-width) on mobile. Small auto-width buttons on mobile are harder to tap than full-width buttons, especially the "Start a project" and "Get in touch" CTAs that are primary conversion actions. These buttons also have `py-3.5` (~44px height) rather than the recommended 56px.
FIX: For primary CTAs on these pages, change `inline-flex` to `flex w-full sm:w-auto sm:inline-flex` and increase height to `py-4`. This makes them full-width on mobile (easier to tap) while reverting to auto-width on small-tablet and above. Affects: WorkPage.tsx line 88, AboutPage.tsx line 142, ServicesPage.tsx line 82.
FILE: src/components/pages/WorkPage.tsx — line 88; src/components/pages/AboutPage.tsx — line 142; src/components/pages/ServicesPage.tsx — line 82
SEVERITY: Medium

---

## Low Issues

---

ISSUE 17: HeroHeadline — Phase 2 Hover Only Triggered by Mouse Events
VIEWPORT: all mobile
PROBLEM: HeroHeadline's Phase 2 sweep animation registers `mouseenter`/`mouseleave` on the headline line containers. On touch devices there is no hover state — `mouseenter` fires once on tap then immediately `mouseleave`. The sweep animation starts but the exit sweep fires so quickly after the entry that it's effectively invisible. Users on touch devices never see the Phase 2 interactive animation. This is by design (the Phase 1 auto-sequence still plays on load) but is worth documenting.
FIX: Add `touchstart` listeners that trigger `onEnter` on touch, and listen for `touchend` on `document` to trigger `onLeave` if the touch moves outside the element. This gives a "tap to highlight, tap elsewhere to unhighlight" interaction. Alternatively, document this as a known desktop-only feature and ensure Phase 1 is compelling enough on mobile.
FILE: src/components/HeroHeadline.tsx — lines 125–175 (addEventListener calls)
SEVERITY: Low

---

ISSUE 18: BrowserMockup URL Bar — Text Potentially Clipped on Narrow Cards
VIEWPORT: 375px
PROBLEM: The BrowserMockup URL bar has `mx-auto max-w-md` containing `font-mono text-[11px]` URL text. URLs like `nrgwebsites.com/work/restaurant` are long (28 chars at 11px mono ≈ 176px). At 375px, the URL bar flex container (`flex-1`) is approximately 335px wide minus the traffic-light dots (~36px) and right spacer (~48px) = ~251px. The URL text should fit centered at 176px. However on the 2-column grid at md breakpoint, cards are narrower and URL bars are tighter. This is a cosmetic issue only — the URL is decorative.
FIX: Add `truncate` to the URL text div to prevent any overflow: change `className="mx-auto max-w-md rounded-md border border-hairline bg-surface-3 px-3 py-1 text-center font-mono text-[11px] text-ink-secondary"` to include `truncate overflow-hidden`.
FILE: src/components/BrowserMockup.tsx — line 57
SEVERITY: Low

---

ISSUE 19: Footer — Email Address Renders at 11px on Mobile
VIEWPORT: all mobile
PROBLEM: The mobile footer has `font-mono text-[11px] uppercase tracking-wider text-ink-secondary` for the one-liner containing "Houston, TX · © year · noah@nrgwebsites.com". At 11px, `noah@nrgwebsites.com` in uppercase mono is very small. The `<a>` mailto link is technically tappable but the tap target is ~11px tall × ~160px wide (the email portion). This is a low-severity issue because the email is also available in the sidebar of the contact page and via the floating CTA.
FIX: Split the footer mobile layout into two lines: NRG wordmark on line 1, then "Houston, TX · © year" on line 2 at text-[11px], then the email on its own line at `text-[13px]` with explicit `py-2` padding for tap target. This is a cosmetic/UX polish change.
FILE: src/components/Footer.tsx — lines 14–31 (mobile footer block)
SEVERITY: Low

---

ISSUE 20: AboutSkillCard and ServiceDetailCard — Body Text at 15px
VIEWPORT: all mobile
PROBLEM: Both `AboutSkillCard` and `ServiceDetailCard` use `text-[15px]` for body copy. While 15px is technically above the 14px minimum label floor, it falls 1px below the 16px standard body text floor recommended for mobile readability. This is a minor issue since 15px is functionally equivalent to 16px on high-DPI screens.
FIX: Change `text-[15px]` to `text-base` (16px) in both components. This also removes a magic pixel size in favor of the design system token.
FILE: src/components/AboutSkillCard.tsx — line 28; src/components/ServiceDetailCard.tsx — line 53
SEVERITY: Low

---

## Checklist Notes (Pass Items)

The following checklist items were verified as passing:

- Nav: wordmark + hamburger only visible at 375px; desktop links hidden (`md:flex` / `md:hidden`) — PASS
- Nav: hamburger button is `h-11 w-11` = 44×44px — meets minimum — PASS
- Nav: mobile overlay links have `min-h-[60px]` — PASS
- Nav: links close overlay on tap (`onClick={() => setOpen(false)}`) — PASS
- Nav: body scroll locked when overlay open — PASS
- HeroHeadline: cyan sweep animation is pure DOM/CSS, runs at mobile — PASS
- Hero: ghost "See my work" CTA hidden on mobile (`hidden md:inline-flex`) — PASS
- Hero: location line visible on mobile (no `hidden` class in current code) — PASS
- Hero: CTA flex column on mobile → full width stack — PASS
- Work grid: single column at 375px (`grid-cols-1 ... lg:grid-cols-3`) — PASS
- Work grid gap: `gap-4` = 16px — PASS
- Card text: category 11px, title text-base (16px) — PASS
- Testimonials: single column at 375px (`grid-cols-1 md:grid-cols-2`) — PASS
- Testimonials: left border visible; quote ≥ 16px; featured ≥ 20px — PASS
- Services: single column on mobile (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) — PASS
- ServiceCard pricing label hidden on mobile (`hidden ... sm:block`) — PASS
- Process section: single-column stacked (`grid-cols-1 md:grid-cols-3`) — PASS
- About photo hidden on mobile (`hidden ... md:block`) — PASS
- About skills grid: 1-column at 375px (`grid-cols-1 sm:grid-cols-2`) — PASS
- ContactForm inputs: `text-base` (16px) — iOS Safari auto-zoom NOT triggered — PASS
- ContactForm inputs: `py-3.5` = 28px padding + 24px line-height = ~52px tall — meets 48px minimum — PASS
- ContactForm: phone field uses `type="tel"` — PASS
- ContactForm: labels visible above inputs — PASS
- ContactForm submit button: `w-full md:w-auto` — full width on mobile — PASS
- ContactForm: success/error messages visible — PASS
- FloatingCta: hidden on `/contact` and `/[location]/contact` (pathname check) — PASS
- Body: `overflow-x: clip` prevents horizontal scroll — PASS
- Design tokens: no hardcoded hex in Tailwind classes (inline style objects allowed) — PASS
- HeroHeadline: no framer-motion whileHover + whileInView conflict — PASS (pure DOM animation)
- All cards: CSS hover (`hover:-translate-y-1`) not framer-motion whileHover — PASS
- BrowserMockup: `noEntry` prop used correctly in HomepageProjectCard and ProjectCard — PASS
- Location pages: navLogoHref and linkPrefix correctly scoped per location — PASS
- Location sub-pages: correct `location` prop passed (e.g. `<WorkPage location="houston" />`) — PASS
- Sitemap: 8 root URLs; sub-pages not in sitemap (correct, they use canonical) — PASS
- No fixed-height sections causing voids — PASS
- No horizontal scroll triggers found — PASS
- `body::before` noise texture present — PASS

---

## Priority Fix Order for Mobile Fix Agent

1. **ISSUE 3** — Focus trap in nav overlay (WCAG compliance)
2. **ISSUE 1** — FloatingCta tap target (affects 15 of 16 pages)
3. **ISSUE 2** — FloatingCta safe-area bottom (hidden behind home indicator)
4. **ISSUE 8** — Footer safe-area bottom
5. **ISSUE 4** — Nav overlay backdrop tap-to-close
6. **ISSUE 5** — "All projects →" tap target (all 4 location pages)
7. **ISSUE 6** — "Discuss this →" tap target (/services pages)
8. **ISSUE 7** — "More about me →" tap target (all 4 location pages)
9. **ISSUE 9** — Hero CTA height (primary conversion button)
10. **ISSUE 16** — Sub-page CTA buttons (full-width + height)
11. **ISSUE 10** — HeroHeadline wrap risk at 375px
12. **ISSUE 14** — Section padding floor reduction
13. **ISSUE 12** — Process step numbers oversized on mobile
14. **ISSUE 13** — Contact sidebar weight on mobile
15. **ISSUE 11** — Work heading manual line breaks
16. **ISSUE 15** — WorkPage pt-24 → page-top
17. **ISSUE 20** — 15px body copy → text-base
18. **ISSUE 18** — BrowserMockup URL bar truncation
19. **ISSUE 19** — Footer email tap target
20. **ISSUE 17** — HeroHeadline touch events (Phase 2)
