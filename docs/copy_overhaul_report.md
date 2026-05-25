# Copy Overhaul — QA Report

Date: 2026-05-24  
QA Agent: independent sweep (read-only on source files)  
Staged files verified: 20

---

## Build status

- **TypeScript:** PASS — `npx tsc --noEmit` exits 0, no errors
- Build skipped per workflow rule — dev server running; next build not run

---

## Verification per spec item

### G1 Testimonials per page

**Status: PASS**

`src/lib/testimonials.ts` refactored from flat exports to `testimonialsByLocation` record keyed by `LocationSlug`. Each location key has `{ featured, others[] }`.

`src/components/LocationPage.tsx` imports `{ testimonialsByLocation }` and reads `testimonialsByLocation[location]` — correctly passing `.featured` to the featured card and `.others` to the two-column grid.

Legacy exports (`featuredTestimonial`, `testimonials`) preserved as re-exports of `root` set on lines 106–107 — backward-compat intact.

**Attribution verification:**

| Location | Featured author | Featured business | PASS? |
|---|---|---|---|
| root | Marcus Williams | Williams HVAC · Houston, TX | PASS |
| houston | Marcus Williams | Williams HVAC · Houston, TX | PASS |
| texas | Marcus Williams | Williams HVAC · Houston, TX | PASS |
| michigan | Marcus Williams | Williams HVAC · Bay City, MI | PASS |

Michigan `others[]`:
- Brittany Alvarez → `Bloom Beauty Studio · Midland, MI` — PASS
- David Nguyen → `Nguyen Family Law · Saginaw, MI` — PASS

Houston/Texas/Root business names now fully spelled out (previously bare job titles):
- `Bloom Beauty Studio · Houston Heights, TX` — PASS
- `Nguyen Family Law · Sugar Land, TX` — PASS

**Note:** Marcus Williams's business name was previously `HVAC · Houston, TX` (no business name). It now reads `Williams HVAC · Houston, TX` — consistent with the spec.

---

### G2 Fortune 100

**Status: PASS**

- `grep "one of the largest companies" src/` — **0 hits** (old phrase fully removed)
- `grep "Fortune 100" src/` — **5 hits:**
  - `src/lib/locationContent.ts` lines 47, 84, 120, 156 — one per location's `aboutParagraph2`
  - `src/components/pages/AboutPage.tsx` line 69 — bio paragraph 2

All 5 are the correct replacement phrasing: "I spent two years building and running technology systems inside a Fortune 100 company."

---

### G3 Squarespace + corporate-speak

**Status: PASS**

- `grep "Squarespace" src/` — **0 hits**
- `grep "same standard of reliability" src/` — **0 hits**
- `grep "real person picks up" src/` — **4 hits** (one per location's `aboutParagraph2` in `locationContent.ts`) — the consolidated replacement phrase is present

`AboutPage.tsx` paragraph that formerly contained "not just someone who can drag and drop in Squarespace" and "I bring that same standard of reliability" has been replaced with: "I have a degree in Computer Science and Cybersecurity, so your website and your customers' information are in careful hands." — confirmed at line 70.

---

### G4 "handled" / "reach me" pile-ups — uniformity audit

**Status: PASS**

Independent grep counts (see Uniformity table below for full BEFORE/AFTER breakdown).

**"handled"-type pile-up patterns — AFTER state in src/:**
Remaining instances are intentional, non-piling, and in separate contexts:
1. `services.tsx` line 36 — automation `long`: "without you lifting a finger" (kept — authoritative)
2. `services.tsx` line 21 — website design `long`: "I'll handle it as part of your support plan" (kept — specific, natural)
3. `services.tsx` line 35 — automation `short`: "Zero extra work." (kept — part of the same authoritative automation card)

The heroSub "All handled." (3 locations) is **gone** — confirmed by G7 heroSub rewrite. The SEO card "— handled." is **gone** — replaced with "I take care of the technical work that makes Google trust your site" (confirmed at `services.tsx` line 51).

**"reach me / talk to me" pile-ups — AFTER state in src/:**
- "you can actually reach" — **0 hits** (removed from Monthly Support short)
- "you can text" — **0 hits** (removed from Monthly Support long)
- "Direct line" — **0 hits** (badge removed)
- "Built to be reached" — **0 hits** (teaserHeadline rewritten per R2)
- "real person picks up" — **4 hits** (one per location `aboutParagraph2`) — consolidated, consistent, non-piling
- "No agency in the middle" — appears in 3 location `/about` sub-page meta descriptions and 1 standalone `/about` meta — these are metadata, not rendered body copy; considered acceptable

---

### G5 Inconsistencies

**Status: PASS**

- `grep "1–2 weeks\|1-2 weeks\|2–3 weeks\|2-3 weeks" src/` — **0 hits**
- All `ctaBandSub` values in `locationContent.ts` use "live in about two weeks" — confirmed lines 50, 87, 123, 159
- `ServicesPage.tsx` line 79: "Most projects are live in about two weeks." — confirmed
- `grep "Michigan roots" src/` — **0 hits in values** (appears only in inline comments on lines 162, 167, 169 — not rendered)
- `grep "Mid-Michigan" src/` — **0 hits**
- `grep "8 businesses live" src/` — **0 hits**
- `grep "Small businesses, real results" src/` — **1 hit** at `AboutPage.tsx` line 77 in the badges array — confirmed

Michigan `aboutLocationBadge` is now `"Michigan-based"` (line 170), `aboutBioClosingLine` is `"Michigan-based. Available for projects now."` (line 168) — confirmed.
Michigan `contactBasedIn` is now `"Michigan"` (line 175) — confirmed.

---

### G6 Phone placeholder

**Status: PASS**

`ContactForm.tsx` line 153: `placeholder="(555) 123-4567"` — confirmed, real number is not the placeholder.

Real number `(989) 488-7309` is preserved in `LocationPage.tsx` lines 318–321 (CTA band `tel:` href and display text) — confirmed, unchanged.

---

### G7 Hero body

**Status: PASS**

All four `heroSub` values in `locationContent.ts` end with "so no lead slips through." Confirmed:

- root (line 40): "...so no lead slips through."
- houston (line 77): "...so no lead slips through."
- texas (line 113): "...so no lead slips through."
- michigan (line 149): "...so no lead slips through."

---

### R1 Services section intro

**Status: PASS**

`LocationPage.tsx` services section:
- Heading (lines 157–159): "Pick one piece, or the whole thing." — confirmed
- Body (line 162): "Need just a website? Done. Want the site, the automation, and your Google listing all working together? Also done — and priced for a small business, not an agency." — confirmed

---

### R2 About-teaser headings

**Status: PASS**

All four `aboutTeaserHeadline` values confirmed in `locationContent.ts`:

| Location | Headline |
|---|---|
| root | "You'll always know who's building your site. It's me." |
| houston | "You'll always know who's building your site. That's me — and I'm based here in Houston." |
| texas | "You'll always know who's building your site. That's me — local to Texas." |
| michigan | "You'll always know who's building your site. That's me — and I'm from here." |

---

### R3 Process step 3 body

**Status: PASS**

`LocationPage.tsx` line 202: "Your site goes live, the automation runs, and you start showing up on Google when people nearby search for what you do."

"Google" is named specifically. Previous "where your customers are looking" is gone.

---

### R4 Pricing block

**Status: PASS**

`ServicesPage.tsx`:
- Heading (lines 53–55): "No mystery pricing." — confirmed
- Body (line 58): "Tell me what you're after and I'll give you a real number — not a range that balloons later. Most complete websites land between $100 and $300. Automation setups typically add another $100–$200. Reach out for a straight quote on yours." — confirmed

---

### R5 Meta descriptions

**Status: PASS**

- `grep "Wired to bring in customers" src/` — **0 hits**

All four landing page `metaDescription` values in `locationContent.ts` confirmed unique:

| Location | Meta description (char count) |
|---|---|
| root | "Custom websites and automation for small businesses. Fast to launch, easy to update, built to bring in customers." (112 chars) |
| houston | "Custom websites and automation for Houston small businesses. Live in about two weeks. Built by someone local." (108 chars) |
| texas | "Custom websites and automation for Texas small businesses. Live in about two weeks. Houston-based, working across Texas." (119 chars) |
| michigan | "Custom websites and automation for Michigan small businesses. Live in about two weeks. Built by someone from here." (113 chars) |

All 4 are well under 160 chars. All are unique. All include the timeline "about two weeks" for the location variants.

All 12 sub-page meta descriptions verified present and unique:

| Sub-page | Unique location-included? |
|---|---|
| /houston/work | Yes — "Houston small businesses" |
| /houston/about | Yes — "Houston small businesses. Houston-based" |
| /houston/services | Yes — "Houston small businesses. Flat pricing" |
| /houston/contact | Yes — "Houston-based. Usually responds same day." |
| /texas/work | Yes — "Texas small businesses" + "Houston-based, working statewide" |
| /texas/about | Yes — "Texas small businesses. Houston-based" |
| /texas/services | Yes — "Texas small businesses. Flat pricing, Houston-based" |
| /texas/contact | Yes — "Houston-based, working across Texas" |
| /michigan/work | Yes — "Michigan small businesses" + "Built by someone from here" |
| /michigan/about | Yes — "Michigan small businesses. Grew up here" |
| /michigan/services | Yes — "Michigan small businesses. Flat pricing" |
| /michigan/contact | Yes — "Michigan-based work, direct response" |

---

### R6 Anti-agency

**Status: PASS WITH NOTE**

All anti-agency instances in src/:

| Location | Text | Context |
|---|---|---|
| `locationContent.ts` lines 58, 94, 130, 166 | "without the agency price tag" | `aboutBioParagraph1` — 4 locations, same field |
| `LocationPage.tsx` line 162 | "not an agency" | Services strip body — shared component, renders once per page |
| `src/app/about/page.tsx` meta | "not an agency" | Meta description only — not rendered body |
| `src/app/houston/about/page.tsx` meta | "no agency in the middle" | Meta description only — not rendered body |
| `src/app/texas/about/page.tsx` meta | "no agency in the middle" | Meta description only — not rendered body |
| `src/app/michigan/about/page.tsx` meta | "no agency in the middle" | Meta description only — not rendered body |

**Rendered body copy:** At most 2 anti-agency phrases appear on any single page — one in `aboutBioParagraph1` and one in the services strip. These are in clearly separate sections (bio vs services), so they do not pile up visually. Meets the spec's ≤2 rendered instances target.

**Meta descriptions:** "no agency in the middle" appears in 3 location /about sub-page metas and the root /about meta. This is metadata, not visible copy — no visitor reads it. Acceptable.

---

### Location-specific first lines

**Status: PASS**

`aboutOpener` first lines confirmed in `locationContent.ts`:

- houston (line 82): "I live here in Houston, so when you hire me you're hiring a neighbor, not a call center three time zones away." — PASS
- texas (line 118): "I live here in Texas, so when you hire me you're hiring a neighbor, not a call center three time zones away." — PASS
- michigan (line 154): "I grew up in Michigan, so I know this market — and the businesses in it." — PASS
- root (line 45): Generic opener, no local sentence prepended — correct per spec (root has null `heroLocationLine`)

---

### Pricing flag

**Status: PASS — SURFACED FOR NOAH**

`AboutPage.tsx` line 69: "...whether it's a $100 site for a local plumber or a full automation setup for a growing service business..." — $600 is gone, $100 is in place.

Service starting prices in `services.tsx` are unchanged:
- Website Design: Starting from $100
- Automation Setup: Starting from $100
- Google & Local SEO: Starting from $50
- Monthly Support: Starting from $20/month

The bio reference now matches the floor price on the services page. The automation pricing block in `ServicesPage.tsx` was updated from "$50–$150" to "$100–$200" to be consistent with the $100 automation floor. See Pricing Flag section below for Noah's decision item.

---

## Uniformity habits — BEFORE vs AFTER

Methodology: BEFORE counted from `nrg-text/nrg-text-full.md` (pre-change extraction); AFTER counted from staged `src/` files via grep.

### "handled"-type promise patterns

| Pattern | BEFORE (nrg-text-full.md) | AFTER (src/) |
|---|---|---|
| "All handled." | 3 | 0 |
| "All in one package" | 1 | 0 |
| "— handled." (SEO card) | 4 (once per location in extraction) | 0 |
| "Zero extra work." | 4 | 1 (single services.tsx source) |
| "runs in the background forever" | 4 | 1 (single services.tsx source) |
| "without you lifting a finger" | 4 | 1 (single services.tsx source) |
| "I handle website" (heroSub) | 1 | 0 |
| **Distinct unique pile-up instances** | **~6 distinct prompts per page** | **2 kept (intentional, same card)** |

The 4 BEFORE counts for automation-card patterns reflect the extraction tool duplicating shared content per location. In the actual source, these were always 1 instance each — now they are still 1 instance each. The net reduction is in the *heroSub* instances (3 pages × "All handled." gone) and the SEO card ("— handled." gone).

**BEFORE: ~6 distinct handled-type promises encountered across a single page visit. AFTER: 2 (both on the automation service card, intentional and reinforcing each other).**

### "reach me / talk to me" promise patterns

| Pattern | BEFORE (nrg-text-full.md count) | AFTER (src/ count) |
|---|---|---|
| "you can actually reach" | 4 | 0 |
| "you can text" | 4 | 0 |
| "Direct line" (badge) | 4 | 0 |
| "Built to be reached" (teaserHeadline) | 1 | 0 |
| "real person picks up" | 0 | 4 (one per location in locationContent.ts) |
| "no agency in the middle" (rendered body) | 0 | 0 (meta only) |

**BEFORE: 6 distinct phrasings, scattered. AFTER: 1 single consolidated phrase ("real person picks up"), appearing once per location in the same field. No pile-up on any single page.**

Copy Agent's reported figures (handled 6→2, reach me 6→5) are substantively correct. The "5" for reach-me counts the 4 `locationContent.ts` field instances plus 1 contact sidebar mention — these are data-layer entries, not pile-ups on a rendered page. On any single rendered page, the reach-me promise appears exactly once (in `aboutParagraph2`).

### Staccato triples

The hero headline "Real Clients. Real Websites. Real Results." is the intentional brand triple — unchanged and the only triple in the codebase. The grep pattern for sentence-ending staccato found 0 hits both before and after in normal copy. No new triples introduced.

**BEFORE staccato triples in body copy: 0. AFTER: 0.**

---

## Contradiction sweep

| Fact | Consistent across all staged pages? | Notes |
|---|---|---|
| Pricing | YES | Services page: $100/$100/$50/$20/month. Bio: "$100 site for a local plumber." Pricing transparency block: "$100–$300" website, "$100–$200" automation. No contradiction; bio now matches floor. |
| Timeline | YES | Every occurrence is "about two weeks" or "in two weeks" (testimonials). No "1–2 weeks" or "2–3 weeks" remain. |
| Location badge format | YES | Houston: "Houston-based", Texas: "Texas-based", Michigan: "Michigan-based", root: "Independent". All follow `[Location]-based` pattern. |
| Stat number | YES | "8 businesses live" is gone. Badge now reads "Small businesses, real results". No stale number anywhere. |
| Phone | YES | Real number `(989) 488-7309` displays in LocationPage CTA band (tel href + text). Placeholder in ContactForm input is `(555) 123-4567`. No leakage of real number into form placeholder. |
| Email | YES | All email references in src/ use `nrgwebsites.com` (`noah@nrgwebsites.com`). Zero `nrgbuilds.com` email references found. Domain is clean sitewide. |

---

## Pricing flag for Noah

**Action required — business decision, not a code change.**

The Copy Agent made two pricing-related updates that need Noah's review:

**1. Bio reference: $600 → $100**
`AboutPage.tsx` bio previously said "$600 site for a local plumber." This was updated to "$100 site for a local plumber" to match the published services page floor price ($100 starting). If the real floor price is higher, both the bio and the services page need to be updated together.

**2. Automation add-on range: $50–$150 → $100–$200**
The pricing transparency block in `ServicesPage.tsx` previously said "Automation setups typically add $50–$150." It now reads "$100–$200" to match the "Starting from $100" listed on the Automation Setup service card. If the correct range is different, update `ServicesPage.tsx` line 58.

**The Copy Agent did not change service card starting prices.** Those remain:
- Website Design: Starting from $100
- Automation Setup: Starting from $100
- Google & Local SEO: Starting from $50
- Monthly Support: Starting from $20/month

---

## Files changed (20)

| File | Spec items |
|---|---|
| `docs/copy_overhaul_changes.md` | Change log (new file) |
| `src/lib/testimonials.ts` | G1 |
| `src/lib/locationContent.ts` | G2, G3, G4, G5, G7, R2, R5 + location lines |
| `src/lib/services.tsx` | G3, G4, R6 |
| `src/components/LocationPage.tsx` | G1 (wiring), R1, R3 |
| `src/components/pages/AboutPage.tsx` | G2, G3, G5 (badges), pricing flag |
| `src/components/pages/ServicesPage.tsx` | R4, G5 |
| `src/app/contact/ContactForm.tsx` | G6 |
| `src/app/houston/about/page.tsx` | R5 |
| `src/app/houston/work/page.tsx` | R5 |
| `src/app/houston/services/page.tsx` | R5 |
| `src/app/houston/contact/page.tsx` | R5 |
| `src/app/texas/about/page.tsx` | R5 |
| `src/app/texas/work/page.tsx` | R5 |
| `src/app/texas/services/page.tsx` | R5 |
| `src/app/texas/contact/page.tsx` | R5 |
| `src/app/michigan/about/page.tsx` | R5 |
| `src/app/michigan/work/page.tsx` | R5 |
| `src/app/michigan/services/page.tsx` | R5 |
| `src/app/michigan/contact/page.tsx` | R5 |

---

## Final verdict

**Copy overhaul complete — staged, ready for review and commit.**

All 13 spec items pass (G1–G7, R1–R6). TypeScript is clean. No contradictions found across the 20 staged files. Two uniformity habit patterns reduced substantially (handled-type: ~6→2 per page; reach-me: 6 scattered phrases→1 consolidated per page). One pricing flag surfaced for Noah's decision (bio + automation range).

Nothing was committed. All 20 source changes and this report are staged only.
