# Visual QA Findings — NRG Portfolio Work Section
**Audit date:** 2026-05-23
**Files audited:** BrowserMockup.tsx, ProjectCard.tsx, HomepageProjectCard.tsx, page.tsx (home), work/page.tsx, projects.ts, globals.css, public/work/

---

## CRITICAL — BrowserMockup double-animates inside HomepageProjectCard
**File**: `src/components/HomepageProjectCard.tsx` (line 38) / `src/components/BrowserMockup.tsx` (lines 28–32)
**Problem**: `HomepageProjectCard` wraps everything in an outer `motion.div` with `whileInView` entry animation. However, `BrowserMockup` itself also contains a `motion.div` with its own `whileInView` entry animation (`initial={{ opacity: 0, y: 30 }}`, `whileInView={{ opacity: 1, y: 0 }}`). When `HomepageProjectCard` renders `BrowserMockup` **without** passing a `delay` prop, `BrowserMockup` still fires its own independent `whileInView` — resulting in a double entry animation: the outer card fades/slides up, and simultaneously the BrowserMockup frame inside it also fades/slides up from `y: 30`.
**Expected**: Entry animation should live only on the outer `motion.div` in `HomepageProjectCard`. `BrowserMockup` should not re-animate independently when used in that context. One approach: pass a flag to suppress BrowserMockup's entry animation, or remove BrowserMockup's `whileInView`/`initial` when no `delay` is intended.
**Actual**: `BrowserMockup` always runs `initial={{ opacity: 0, y: 30 }}` + `whileInView={{ opacity: 1, y: 0 }}` regardless of caller context. `HomepageProjectCard` does not pass `delay` so BrowserMockup uses `delay=0`, meaning both animations fire simultaneously — the frame pops in independently of the card wrapper.

---

## CRITICAL — ProjectCard passes `delay` to BrowserMockup, triggering a second entry animation
**File**: `src/components/ProjectCard.tsx` (line 39)
**Problem**: `ProjectCard` has its own `motion.article` entry animation. It also passes `delay={delay}` to `BrowserMockup`, which means `BrowserMockup` runs a second, separate `whileInView` entry animation (`y: 30 → 0`) staggered by the same delay. The article and the BrowserMockup inside it both animate in — the frame will slide up from `y: 30` *inside* the already-animating article, creating a visible double-lift.
**Expected**: Either remove BrowserMockup's `whileInView` entry animation (keeping only `whileHover`), or do not pass `delay` from `ProjectCard` so BrowserMockup animates with `delay=0` and the outer article drives the entry.
**Actual**: `<BrowserMockup url={url} delay={delay} ...>` at line 39 of `ProjectCard.tsx` propagates the stagger delay into BrowserMockup's own `whileInView`, causing two simultaneous staggered entry animations on the same visual element.

---

## HIGH — Category label has no hover state transition on HomepageProjectCard
**File**: `src/components/HomepageProjectCard.tsx` (line 54)
**Problem**: The standard specifies that the category label should transition from `text-white/40` to `text-white/70` on card hover. In `HomepageProjectCard`, the label is `<span className="... text-white/40">` with no hover variant class and no group-based transition.
**Expected**: Category label should brighten on card hover, e.g. `group-hover:text-white/70 transition-colors` (requires the wrapping `Link` or an ancestor to carry the `group` class).
**Actual**: Category span is statically `text-white/40` with no hover transition. The `Link` element at line 36 does not have a `group` class, so Tailwind group-hover utilities would not work even if added to the span.

---

## HIGH — Category label has no hover state transition on ProjectCard
**File**: `src/components/ProjectCard.tsx` (line 55)
**Problem**: Same issue as HomepageProjectCard. The category label is statically `text-white/40` with no hover state. The `motion.article` at line 31 has no `group` class.
**Expected**: Category label should transition to `text-white/70` on card hover. `motion.article` needs `group` class; category span needs `group-hover:text-white/70 transition-colors`.
**Actual**: `<span className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/40">` — no hover styling, no group.

---

## HIGH — Title has no hover state transition on HomepageProjectCard
**File**: `src/components/HomepageProjectCard.tsx` (line 57)
**Problem**: The standard specifies the title should transition to brighter on card hover. The `h3` at line 57 has `text-ink` with no hover variant.
**Expected**: Title should have something like `group-hover:text-white transition-colors` to brighten on hover (since `text-ink` is `#FFFFFF` it may already be full white — but the `Link` needs a `group` class for any group-hover to work, and an explicit hover style should be present).
**Actual**: `<h3 className="font-display text-base font-bold leading-snug tracking-tight text-ink">` — no hover transition, no group context.

---

## HIGH — Title has no hover state transition on ProjectCard
**File**: `src/components/ProjectCard.tsx` (line 58)
**Problem**: Same as above. The `h3` title has no hover state and `motion.article` has no `group` class.
**Expected**: Title should brighten on hover with a transition. `motion.article` needs `group` class.
**Actual**: `<h3 className="font-display font-bold leading-[1.25] tracking-tight text-ink" style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)" }}>` — no hover styling.

---

## HIGH — BrowserMockup whileHover is on the frame, not the card — hover lift triggers on frame only
**File**: `src/components/HomepageProjectCard.tsx` (line 38) / `src/components/BrowserMockup.tsx` (lines 33–41)
**Problem**: In `HomepageProjectCard`, the entire card is a `<Link>` with `flex flex-col gap-3`. The `whileHover` (`y: -4`, cyan glow) lives inside `BrowserMockup`'s own `motion.div`. This means hovering over the text area below the frame (category label, title) does NOT trigger the lift — only hovering directly over the browser frame image triggers it.
**Expected**: The hover lift and glow should trigger whenever the user hovers anywhere on the card (frame or text). The `whileHover` should be on the outermost card wrapper, not nested inside `BrowserMockup`.
**Actual**: `BrowserMockup` contains `whileHover={{ y: -4, boxShadow: ... }}` on its internal `motion.div`. Hovering the text below the frame produces no visual feedback.

---

## HIGH — "Selected work" label is accent color, not mono text per standard
**File**: `src/app/work/page.tsx` (line 34)
**Problem**: The standard says `"Selected work"` should be a mono label. The element is `<p className="mb-5 font-mono text-[12px] uppercase tracking-[0.1em] text-accent">`. It uses `text-accent` (cyan `#00D4FF`) rather than the subdued mono label color used elsewhere (e.g. `text-white/40` or `text-ink-secondary`).
**Expected**: The "Selected work" label above the grid should be in a muted mono style consistent with other section labels. The standard does not specify it must be accent color — other section labels on the homepage use `text-accent` with a `▸` prefix, but this grid label has no prefix and reads as a header. The exact expected style is debatable, but the current `text-accent` treatment makes it compete visually with the CTA elements.
**Actual**: `text-accent` (bright cyan) on the grid label.

---

## HIGH — "More work available on request." appears twice on /work page
**File**: `src/app/work/page.tsx` (lines 59–63 and 70–71)
**Problem**: The mono caption `"More work available on request."` appears once as a small `font-mono text-[13px]` text below the grid (line 59), AND the same sentiment is repeated as a large `SectionHeading` in the CTA section below (lines 70–71: "More work available on request."). This is redundant and creates a confusing visual repetition.
**Expected**: The mono caption below the grid is correct per the standard. The CTA section heading should be differentiated — or one instance should be removed/reworded.
**Actual**: Two instances of nearly identical copy within the same page, one as small mono text and one as a large display heading.

---

## MEDIUM — BrowserMockup entry animation uses `y: 30` while card wrapper uses `y: 24`
**File**: `src/components/BrowserMockup.tsx` (line 29) vs `src/components/ProjectCard.tsx` (line 32) and `src/components/HomepageProjectCard.tsx` (line 30)
**Problem**: `BrowserMockup` initializes at `y: 30`, while both `ProjectCard` and `HomepageProjectCard` initialize at `y: 24`. These mismatched values mean the frame and the card text area travel different distances during entry, creating a subtle misalignment in the combined animation if both fire.
**Expected**: All entry animations should use a consistent `y` offset (e.g. `y: 24` everywhere).
**Actual**: `BrowserMockup`: `y: 30`. Card wrappers: `y: 24`.

---

## MEDIUM — ProjectCard title font size uses `clamp(1rem, 2vw, 1.2rem)` vs HomepageProjectCard uses `text-base`
**File**: `src/components/ProjectCard.tsx` (line 60) vs `src/components/HomepageProjectCard.tsx` (line 57)
**Problem**: The two card variants render the title with different sizing strategies. `ProjectCard` uses an inline `style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)" }}`, while `HomepageProjectCard` uses Tailwind `text-base` (1rem fixed). At narrow viewports both resolve to `1rem`, but at wider viewports `ProjectCard` scales to `1.2rem` while `HomepageProjectCard` stays at `1rem`. If cards from both components ever appear on the same breakpoint this creates visual inconsistency.
**Expected**: Title sizing should be consistent across card variants, or the difference should be intentional and documented.
**Actual**: Two different sizing approaches producing different results above ~800px viewport width.

---

## MEDIUM — HomepageProjectCard Link lacks `group` class — group-hover utilities non-functional
**File**: `src/components/HomepageProjectCard.tsx` (line 36)
**Problem**: `<Link href="/work" className="flex flex-col gap-3 cursor-pointer">` has no `group` class. Any future addition of `group-hover:` utilities to child elements (category label, title) will silently fail.
**Expected**: `<Link>` should carry `group` class: `className="group flex flex-col gap-3 cursor-pointer"`.
**Actual**: No `group` class on the Link wrapper.

---

## MEDIUM — ProjectCard motion.article lacks `group` class
**File**: `src/components/ProjectCard.tsx` (line 31)
**Problem**: Same issue as HomepageProjectCard — `motion.article` has no `group` class, making all group-hover utilities non-functional on children.
**Expected**: `motion.article` should have `group` in its className.
**Actual**: `className="flex flex-col gap-3"` — no `group`.

---

## MEDIUM — `section-pad` value is correct but `.py-section` duplicates it unnecessarily
**File**: `src/app/globals.css` (lines 129–151)
**Problem**: `.section-pad` correctly uses `clamp(3rem, 8vw, 6rem)`. `.py-section` also uses the identical value `clamp(3rem, 8vw, 6rem)`. This is a redundant CSS class pair doing the same thing. The `/work` page's grid section uses neither — it uses an inline `style` with `clamp(2rem, 5vw, 3rem)`. This inconsistency makes spacing maintenance fragile.
**Expected**: One canonical spacing utility (`.section-pad` or `.py-section`, not both) for standard section rhythm. The `/work` grid section's inline style should use the class instead.
**Actual**: Two identical classes + one inline style override across pages.

---

## MEDIUM — `/work` grid section uses inline style instead of section utility class
**File**: `src/app/work/page.tsx` (line 31)
**Problem**: `<section style={{ paddingTop: "clamp(2rem, 5vw, 3rem)", paddingBottom: "clamp(2rem, 5vw, 3rem)" }}>` — the grid section bypasses the design system spacing tokens and hardcodes its own `clamp` values in an inline style.
**Expected**: Use a Tailwind utility or a CSS class (`section-pad` variant) for consistency.
**Actual**: Inline style with custom clamp values not present in globals.css.

---

## LOW — Homepage work preview shows only 3 of 5 projects; no indication more exist except "All projects →"
**File**: `src/app/page.tsx` (line 111)
**Problem**: `projects.slice(0, 3)` shows only the first 3 projects. This is intentional by design but the "All projects →" link is the only affordance communicating there are more. If a user does not notice the link, they may assume the portfolio has only 3 entries.
**Expected**: Acceptable as-is per the standard (standard says show 3 on homepage), but the link should be visually prominent. Currently `font-mono text-[13px] text-accent` — it is accent-colored which helps, but small.
**Actual**: Three cards + small right-aligned link. No secondary cue (e.g. count badge, "5 total").

---

## LOW — `gushow-excavating` title contains no location reference — confirmed correct
**File**: `src/lib/projects.ts` (line 19)
**Problem**: None — this is a PASS. Title is `"Full Web Presence — Excavating Company"` with no "Auburn, MI" substring.
**Expected**: No location in title.
**Actual**: Correct. No finding.

---

## LOW — Outcome descriptions: all 5 are single sentences — confirmed correct
**File**: `src/lib/projects.ts` (lines 21, 34, 49, 61, 73)
**Problem**: None — all 5 `outcome` strings are single sentences ending with a period, no mid-string period. PASS.
**Expected**: One sentence per outcome.
**Actual**: All correct.

---

## LOW — All 5 imageSrc files confirmed present in /public/work/
**File**: `public/work/`
**Problem**: None — all 5 files exist: `gushow-excavating.png`, `rewilding-life.png`, `rustic-table.png`, `martinez-hvac.png`, `reyes-law.png`. PASS.
**Expected**: All 5 files present.
**Actual**: All 5 confirmed.

---

## LOW — All 5 URL slugs confirmed correct
**File**: `src/lib/projects.ts` (lines 23, 36, 51, 63, 75)
**Problem**: None — all 5 `url` fields use `nrgwebsites.com/work/[slug]` format with correct slugs: `excavating`, `media`, `restaurant`, `hvac`, `law`. PASS.
**Expected**: `nrgwebsites.com/work/excavating`, `nrgwebsites.com/work/media`, `nrgwebsites.com/work/restaurant`, `nrgwebsites.com/work/hvac`, `nrgwebsites.com/work/law`.
**Actual**: All correct.

---

## LOW — `section-pad` clamp value is correct
**File**: `src/app/globals.css` (lines 129–132)
**Problem**: None — `.section-pad` is `clamp(3rem, 8vw, 6rem)`. PASS.
**Expected**: `clamp(3rem, 8vw, 6rem)`.
**Actual**: Correct.

---

## SUMMARY

| Severity | Count | Items |
|----------|-------|-------|
| CRITICAL | 2 | Double entry animation in HomepageProjectCard; double entry animation in ProjectCard |
| HIGH | 6 | Category label no hover transition (×2 components); Title no hover transition (×2 components); whileHover on frame only; "Selected work" label color; "More work available" duplicate copy |
| MEDIUM | 6 | Mismatched y-offset values; Title font size inconsistency; Missing `group` class on Link (HomepageProjectCard); Missing `group` class on motion.article (ProjectCard); Redundant `.section-pad`/`.py-section` classes; inline style on /work grid section |
| LOW | 5 | Small "All projects →" link (acceptable); gushow title PASS; outcome sentences PASS; screenshot files PASS; URL slugs PASS |

**Total actionable findings: 14** (2 critical, 6 high, 6 medium; 5 low entries are confirmations/passes)
