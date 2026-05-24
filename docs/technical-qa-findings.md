# Technical QA Findings — NRG Portfolio Work Section
**Audit date:** 2026-05-23  
**Auditor:** Technical QA Agent  
**Scope:** BrowserMockup, ProjectCard, HomepageProjectCard, page.tsx, work/page.tsx, projects.ts, globals.css

---

## HIGH — Double-animation: ProjectCard passes `delay` into BrowserMockup creating stacked entry animations
**File**: `src/components/ProjectCard.tsx` (line 39)  
**Problem**: `ProjectCard` is itself a `motion.article` with `whileInView` entry animation and a staggered `delay`. It then passes that same `delay` value directly into `<BrowserMockup delay={delay}>`. BrowserMockup is also a `motion.div` with its own `whileInView` entry animation and uses the `delay` prop in its transition. This means BrowserMockup fires its own entry animation independently of — and in addition to — the parent `motion.article`. Both the wrapper card and the browser frame animate on viewport entry with the same stagger delay, producing a double-animation.  
**Expected**: BrowserMockup inside ProjectCard should not trigger its own independent `whileInView` entry animation. Either (a) a `noEntry` prop on BrowserMockup should disable its `initial`/`whileInView`/`viewport` when the parent handles entry, or (b) ProjectCard should not forward `delay` into BrowserMockup.  
**Actual**: `delay={delay}` is passed to BrowserMockup on line 39 of ProjectCard, causing both `motion.article` and the inner `motion.div` (BrowserMockup) to run independent staggered whileInView entry animations.

---

## HIGH — BrowserMockup `whileHover` lifts only the frame, not the full card unit
**File**: `src/components/BrowserMockup.tsx` (line 33–41), `src/components/HomepageProjectCard.tsx` (line 38), `src/components/ProjectCard.tsx` (line 39)  
**Problem**: The `whileHover` (y: -4, box-shadow glow) is applied to the BrowserMockup `motion.div` only. The text below the frame (category label and title `<h3>`) sits outside BrowserMockup in a sibling `<div>`. When the user hovers, only the browser frame lifts; the text label and title stay in place. This creates a visually broken "partial lift" where the mockup floats away from its caption.  
**Expected**: The entire card unit — browser frame AND the text below — should lift together on hover. This requires `whileHover` to be on the outermost card wrapper (`motion.article` in ProjectCard, `motion.div` in HomepageProjectCard), not inside BrowserMockup.  
**Actual**: In both ProjectCard and HomepageProjectCard, `whileHover` is scoped to BrowserMockup's internal `motion.div`. Neither component adds any `whileHover` or `group-hover` logic to the outer wrapper to move the text in sync.

---

## MEDIUM — Missing `group-hover:` text brightening on category label and title
**File**: `src/components/ProjectCard.tsx` (lines 55, 59), `src/components/HomepageProjectCard.tsx` (lines 54, 57)  
**Problem**: The card spec calls for the category label to transition from `text-white/40` → `text-white/70` on card hover, and for the title to brighten correspondingly. Neither ProjectCard nor HomepageProjectCard has a `group` class on the outer wrapper, and neither the `<span>` (category) nor the `<h3>` (title) has any `group-hover:` Tailwind class for color or opacity transition.  
**Expected**: Outer wrapper should carry `group` class. Category `<span>` should include something like `group-hover:text-white/70 transition-colors`. Title `<h3>` should include a brightening class on hover.  
**Actual**: Category spans use `text-white/40` (ProjectCard line 55, HomepageProjectCard line 54) with no hover variant. Titles use `text-ink` with no hover variant. No `group` class is present on any wrapper in either component.

---

## MEDIUM — HomepageProjectCard does not pass `delay` to BrowserMockup — stagger does not apply to the frame
**File**: `src/components/HomepageProjectCard.tsx` (line 38)  
**Problem**: HomepageProjectCard receives a `delay` prop (passed as `delay={i * 0.1}` from `page.tsx` line 120) and uses it on the outer `motion.div` transition. However, `<BrowserMockup>` is called without forwarding `delay` — BrowserMockup therefore uses its default `delay=0`. The frame's own whileInView animation fires immediately with no stagger while the outer wrapper animates with the stagger delay.  
**Note**: This is the inverse of finding #1. HomepageProjectCard avoids the double-stagger problem but at the cost of the frame entry not being synchronized with the wrapper. Since BrowserMockup has its own whileInView, it will fire on `delay=0` regardless of when the outer div animates.  
**Expected**: HomepageProjectCard should either (a) use a `noEntry` prop on BrowserMockup to fully suppress BrowserMockup's own whileInView, letting the outer motion.div handle everything, or (b) forward `delay` so both animate in sync (with awareness that this introduces finding #1's double-animation issue).  
**Actual**: `<BrowserMockup url={url} imageSrc={imageSrc} imageAlt={imageAlt}>` — no `delay` prop passed. BrowserMockup fires its whileInView at delay=0.

---

## MEDIUM — `outcome`, `tags`, and `monogram` props declared in ProjectCard but silently dropped
**File**: `src/components/ProjectCard.tsx` (lines 9–10, 13)  
**Problem**: The Props type declares `outcome?: string`, `tags?: string[]`, and `monogram?: string` with comments indicating they are "data compat — not rendered on cards." However, these props are not destructured in the function signature (line 19–27). They are accepted, passed at the call site in `work/page.tsx` (lines 45–49), and silently discarded. While this is intentional per the comments, there is no runtime or TypeScript signal to future maintainers that these fields are inert.  
**Expected**: If the fields are truly permanent no-ops, they should either be removed from the Props type and call sites, or the comments should be more explicit (e.g., a `@deprecated` JSDoc). As-is this is a maintenance hazard.  
**Actual**: `outcome`, `tags`, and `monogram` are typed in Props (lines 9, 10, 13), absent from destructuring (lines 19–27), and passed from `work/page.tsx` (lines 45–49). TypeScript does not flag this as an error because the props are optional.

---

## MEDIUM — Work page h1 section has no padding — visual breathing room relies entirely on main's `pt-24 md:pt-40`
**File**: `src/app/work/page.tsx` (lines 22–28)  
**Problem**: The `<section>` containing the `<h1>` has no padding class and no inline style. All vertical spacing above the h1 comes from `<main className="pt-24 md:pt-40">`. On mobile `pt-24` = 6rem; on desktop `md:pt-40` = 10rem. There is no padding below the h1 section either — the gap between h1 and the "Selected work" grid section is handled by the second section's `clamp(2rem, 5vw, 3rem)` top padding. The h1 section itself contributes no bottom spacing, so on small screens the h1 and the grid label can feel visually compressed.  
**Expected**: The h1 `<section>` should carry its own bottom padding (e.g., `pb-8` or `pb-10`) to provide consistent breathing room between the page title and the grid, independent of the grid section's own top padding.  
**Actual**: `<section>` on line 22 has no padding classes. Bottom gap is entirely implied by the next `<section>`'s `paddingTop: clamp(2rem, 5vw, 3rem)`.

---

## LOW — "More work available" appears twice in work/page.tsx with different styling
**File**: `src/app/work/page.tsx` (lines 58–63, lines 70–85)  
**Problem**: The /work page contains two separate "More work available" copy instances: (1) a faint mono caption `"More work available on request."` below the grid (lines 58–63), and (2) a full CTA section with a `SectionHeading`, a subline, and a CTA button (lines 68–85). The two are visually differentiated (one is 13px mono at 30% opacity; the other is a prominent display heading) but they communicate the same message. This creates redundancy that could confuse visitors.  
**Expected**: Intentional duplication is acceptable if both are retained by design, but the distinction should be documented or one should be removed if it is not adding distinct value.  
**Actual**: Both exist. The mono caption at line 58 is subtle/understated; the CTA section at line 68 is the primary prominent call-to-action. Both confirmed present in the file.

---

## LOW — Framer Motion `ease` type: `readonly` tuple may cause type narrowing issue
**File**: `src/components/BrowserMockup.tsx` (line 15, 39)  
**Problem**: `const EASE = [0.16, 1, 0.3, 1] as const` produces type `readonly [0.16, 1, 0.3, 1]`. Framer Motion's `transition.ease` accepts `number[]` or specific named eases. A `readonly` tuple is not directly assignable to a mutable `number[]` in strict TypeScript. The `whileHover` transition on line 39 passes `ease: EASE`.  
**Note**: `npx tsc --noEmit` produced no output (zero errors), which means the current framer-motion version's type definitions are permissive enough to accept `readonly` tuples here. This is not currently a build-blocking issue, but it is a fragile pattern — a framer-motion version bump that tightens types could break this without any code change.  
**Expected**: Cast `ease` explicitly or use a mutable copy: `ease: [...EASE]` or `ease: EASE as number[]` to be forward-safe.  
**Actual**: `ease: EASE` is used in `whileHover` transition (line 39). TypeScript does not currently error.

---

## LOW — `cursor-pointer` on Link in HomepageProjectCard is redundant but harmless
**File**: `src/components/HomepageProjectCard.tsx` (line 36)  
**Problem**: `<Link href="/work" className="flex flex-col gap-3 cursor-pointer">` includes `cursor-pointer`. `globals.css` line 67 already applies `cursor: pointer` to all `a` elements globally (`a, button { cursor: pointer; }`). Since `next/link` renders as an `<a>` tag, the global rule covers it and the Tailwind class is redundant.  
**Expected**: `cursor-pointer` class can be removed without any behavioral change. Its presence is harmless but represents unnecessary duplication.  
**Actual**: `cursor-pointer` is present on the Link className (line 36) and also covered by globals.css line 67.

---

## LOW — `eslint-disable-next-line` comment confirmed present (no issue — for completeness)
**File**: `src/components/BrowserMockup.tsx` (line 74)  
**Problem**: None. The `// eslint-disable-next-line @next/next/no-img-element` comment is present on line 74 immediately before the `<img>` tag on line 75.  
**Expected**: Present.  
**Actual**: Present and correct. No finding.

---

## SUMMARY

| Severity | Count | Items |
|----------|-------|-------|
| CRITICAL | 0 | — |
| HIGH | 2 | Double-animation (ProjectCard + BrowserMockup); Hover lift applies to frame only, not full card |
| MEDIUM | 4 | Missing group-hover text brightening; HomepageProjectCard frame entry not stagger-synced; Silently dropped props; h1 section has no self-contained padding |
| LOW | 3 | "More work available" duplication; `readonly` EASE tuple type fragility; redundant `cursor-pointer` |
| **TOTAL** | **9** | |

**TypeScript check:** Zero errors (`npx tsc --noEmit` produced no output).  
**Build check:** Clean. All 10 static pages generated successfully. No warnings in build output.
