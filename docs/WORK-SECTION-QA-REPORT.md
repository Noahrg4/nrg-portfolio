# Work Section QA Report
*Date: 2026-05-23*

## Verdict: PASSED ✓

## Fixes Applied

### CRITICAL
- **Double-animation in both card components**: Added `noEntry?: boolean` prop to `BrowserMockup`. When `noEntry={true}`, `initial` is set to `false`, `whileInView`/`viewport`/`transition` are all `undefined`, so the frame renders at its final state immediately with no entry animation. Removed `whileHover` from BrowserMockup entirely. Both `HomepageProjectCard` and `ProjectCard` now pass `noEntry` to BrowserMockup, eliminating the second independent slide-up that was firing inside an already-animating card.

### HIGH
- **whileHover only lifted BrowserMockup frame, not full card**: Removed `whileHover` from `BrowserMockup.motion.div`. Added `whileHover={{ y: -4, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}` to the outer `motion.article` in `ProjectCard` and to the outer `motion.div` in `HomepageProjectCard`. The entire card unit (frame + text) now lifts together on hover. The cyan glow (`0 8px 32px rgba(0,212,255,0.12)`) is applied to the BrowserMockup frame via the `className` prop using `group-hover:shadow-[...]`.
- **No hover text brightening (group-hover missing)**: Added `group` class to the outer wrapper in both card components. Category spans now use `group-hover:text-white/70 transition-colors duration-200` (up from permanent `text-white/40`). Title `h3` elements now use `group-hover:text-white/90 transition-colors duration-200`. Hover feedback now covers the full card area including text.
- **"Selected work" label bright cyan**: Changed `text-accent` to `text-white/40` on the mono label above the project grid in `src/app/work/page.tsx`. Label is now subdued and consistent with category labels.

## Confirmed Passing (No Changes Needed)
- URL bars: all 5 show nrgwebsites.com/work/[slug] ✓
- Card structure: category below frame, title below category, no descriptions/tags ✓
- Grid gaps: gap-4 (16px) on both homepage and /work page ✓
- .section-pad: clamp(3rem, 8vw, 6rem) ✓
- Gushow title: no "Auburn, MI" suffix ✓
- All 5 outcomes: single sentence ✓
- All 5 screenshots: files exist in /public/work/ ✓
- "More work available on request." mono text present below /work grid ✓
- "All projects →" right-aligned accent link below homepage grid ✓
- TypeScript: zero errors ✓

## Issues Left Open (Intentional / Out of Scope)
- "More work available" appears twice on /work — intentional, different treatments (small mono caption below grid vs. prominent CTA section with button)
- Silently dropped props (outcome, tags, monogram) in ProjectCard — intentional with comments, not causing TS errors
