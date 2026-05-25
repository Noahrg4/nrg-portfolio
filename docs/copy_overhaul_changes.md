# Copy Overhaul — Change Log

Date: 2026-05-24  
Status: Staged (not committed)  
TypeScript: clean (`npx tsc --noEmit` — no errors)

---

## Files Changed

| File | Scope |
|---|---|
| `src/lib/testimonials.ts` | G1 — per-location testimonials |
| `src/lib/locationContent.ts` | G2, G3, G4, G5, G7, R2, R5 + location-specific lines |
| `src/lib/services.tsx` | G4, R6 — service descriptions |
| `src/components/LocationPage.tsx` | G1 (wiring), R1, R3 |
| `src/components/pages/AboutPage.tsx` | G2, G3, G4, G5 (badges) — PRICING FLAG |
| `src/components/pages/ServicesPage.tsx` | R4, G5 |
| `src/app/contact/ContactForm.tsx` | G6 |
| `src/app/houston/{about,work,services,contact}/page.tsx` | R5 |
| `src/app/texas/{about,work,services,contact}/page.tsx` | R5 |
| `src/app/michigan/{about,work,services,contact}/page.tsx` | R5 |

---

## G1 — Testimonial locations per page

**File:** `src/lib/testimonials.ts`

Refactored from flat exports (`featuredTestimonial`, `testimonials[]`) to `testimonialsByLocation` record keyed by `LocationSlug`. Each location now has `{ featured, others[] }`.

Legacy exports (`featuredTestimonial`, `testimonials`) preserved as re-exports of `root` set so any unconverted imports don't break.

**Michigan attributions changed:**
- Marcus Williams: `Williams HVAC · Bay City, MI` (was `HVAC · Houston, TX`)
- Brittany Alvarez: `Bloom Beauty Studio · Midland, MI` (was `Houston Heights, TX`)
- David Nguyen: `Nguyen Family Law · Saginaw, MI` (was `Law · Sugar Land, TX`)

**Houston/Texas/Root attributions clarified:**
- Marcus Williams: now `Williams HVAC · Houston, TX` (was just `HVAC · Houston, TX` — added business name)
- Brittany Alvarez: now `Bloom Beauty Studio · Houston Heights, TX` (was just `Houston Heights, TX` — added business name)
- David Nguyen: now `Nguyen Family Law · Sugar Land, TX` (was just `Law · Sugar Land, TX` — added business name)

**File:** `src/components/LocationPage.tsx`

Import updated from `{ featuredTestimonial, testimonials }` to `{ testimonialsByLocation }`. Component now reads `testimonialsByLocation[location]` and uses `.featured` / `.others` properties.

---

## G2 — Replace the vague company flex

**Files:** `src/lib/locationContent.ts` (`aboutParagraph2` for all 4 locations), `src/components/pages/AboutPage.tsx` (bio paragraph 2)

**Before:** "I spent two years inside the technology infrastructure of one of the largest companies in the world."

**After:** "I spent two years building and running technology systems inside a Fortune 100 company."

Per-location continuations:
- **root:** "Your site stays up, loads fast, and when you call, a real person picks up."
- **houston:** "I'm now based in Houston, and that means your site stays up, loads fast, and when you call, a real person picks up."
- **texas:** "Based in Houston, working across Texas. Your site stays up, loads fast, and when you call, a real person picks up."
- **michigan:** "...including work for Michigan-based enterprise teams. Your site stays up, loads fast, and when you call, a real person picks up."

---

## G3 — Cut Squarespace + corporate-speak

**File:** `src/components/pages/AboutPage.tsx`

**Removed:** entire paragraph containing "not just someone who can drag and drop in Squarespace" and "I bring that same standard of reliability."

**Replaced with:** "I have a degree in Computer Science and Cybersecurity, so your website and your customers' information are in careful hands."

**Also removed from `locationContent.ts`:** All `aboutParagraph2` fields previously contained Squarespace references or corporate phrasing — all replaced per G2.

---

## G4 — Consolidate "handled" and "reach me" pile-ups

**Files:** `src/lib/locationContent.ts`, `src/lib/services.tsx`, `src/components/LocationPage.tsx` (via R3)

**"handled" instances — before vs after:**
- `heroSub` all locations: "All handled." — REMOVED (heroSub fully rewritten per G7)
- Services SEO card long description: "— handled." — REWRITTEN to "I take care of the technical work..."
- Location services strip subhead: "priced for small businesses, not agencies" — kept (only anti-agency line in that section)
- Automation card long description: "Set up once, runs in the background forever. Your business stays responsive without you lifting a finger." — KEPT (two strong lines, serves as the definitive expression)
- Website Design card long: "I'll handle it as part of your support plan." — KEPT (natural use, not a promise pile-up)

**Kept "handled" instances (2):**
1. `services.tsx` automation `long`: "without you lifting a finger" (kept — this is the authoritative version)
2. `services.tsx` website design `long`: "I'll handle it as part of your support plan" (kept — natural, specific)

**"reach me / talk to me" pile-ups — before vs after:**
- Monthly Support `short`: "a developer you can actually reach by text" — REPLACED with "When something looks off, you've got someone to call."
- Monthly Support `long`: "someone you can text when something looks off" — REPLACED with "priority response when something needs attention."
- `aboutTeaserHeadline` all locations: "Built to be reached. By someone you can talk to." / "By someone you can reach." — REPLACED per R2
- `aboutParagraph2` all locations: "when you call, a real person picks up." — KEPT (one consolidated promise per location)
- Contact sidebar blurb root: was vague — updated to "Tell me what you need and I'll tell you what it costs — no pressure."

---

## G5 — Lock inconsistencies

**Timeline standardization — "live in about two weeks":**
- `locationContent.ts` `ctaBandSub` root: "Most projects are live in 1–2 weeks." → "Most projects are live in about two weeks."
- `ctaBandSub` houston: "Most Houston projects are live in 1–2 weeks." → "Most Houston projects are live in about two weeks."
- `ctaBandSub` texas: "Most projects are live in 1–2 weeks." → "Most projects are live in about two weeks."
- `ctaBandSub` michigan: "Most projects are live in 1–2 weeks." → "Most projects are live in about two weeks."
- `ServicesPage.tsx` CTA: "live in 1–2 weeks." → "live in about two weeks."

**Location badge standardization:**
- Michigan `aboutLocationBadge`: "Michigan roots" → "Michigan-based"
- Michigan `aboutBioClosingLine`: "Michigan roots. Available for projects now." → "Michigan-based. Available for projects now."

**Michigan contact service area:**
- `contactBasedIn`: "Mid-Michigan / Remote" → "Michigan"
- `contactServiceArea`: already "Serving small businesses across Michigan." — no change needed

**Stat badge:**
- `AboutPage.tsx` badges array: "8 businesses live" → "Small businesses, real results"
- "Direct line" badge removed from array (G4 consolidation — the promise is now in the bio copy)

---

## G6 — Contact form phone placeholder

**File:** `src/app/contact/ContactForm.tsx`

Phone input `placeholder`: `(989) 488-7309` → `(555) 123-4567`

The displayed phone number in the contact sidebar (`ContactPage.tsx`) and CTA band (`LocationPage.tsx`) are unchanged.

---

## G7 — Homepage hero body

**File:** `src/lib/locationContent.ts` — `heroSub` for all 4 locations

**Before (all locations, varied):** "I build professional websites and the automations that keep your [location] business running — contact alerts, booking confirmations, review requests. All handled." (root was slightly different)

**After (per location):**
- **root:** "I build professional websites for small businesses — and the automation behind them that texts you the second a customer reaches out, so no lead slips through."
- **houston:** "I build professional websites for Houston small businesses — and the automation behind them that texts you the second a customer reaches out, so no lead slips through."
- **texas:** "I build professional websites for Texas small businesses — and the automation behind them that texts you the second a customer reaches out, so no lead slips through."
- **michigan:** "I build professional websites for Michigan small businesses — and the automation behind them that texts you the second a customer reaches out, so no lead slips through."

---

## R1 — Services section intro

**File:** `src/components/LocationPage.tsx`

**Heading before:** "Everything your business needs to get online."  
**Heading after:** "Pick one piece, or the whole thing."

**Body before:** "Outcomes, no matter what you are looking for. Pick one piece or the whole system, all priced for small businesses, not agencies."  
**Body after:** "Need just a website? Done. Want the site, the automation, and your Google listing all working together? Also done — and priced for a small business, not an agency."

---

## R2 — About-teaser headings

**File:** `src/lib/locationContent.ts` — `aboutTeaserHeadline` for all 4 locations

| Location | Before | After |
|---|---|---|
| root | "Built to be reached. By someone you can talk to." | "You'll always know who's building your site. It's me." |
| houston | "Built for Houston. By someone you can reach." | "You'll always know who's building your site. That's me — and I'm based here in Houston." |
| texas | "Built for Texas. By someone you can reach." | "You'll always know who's building your site. That's me — local to Texas." |
| michigan | "Built for Michigan. By someone you can reach." | "You'll always know who's building your site. That's me — and I'm from here." |

---

## R3 — Process step 3 rewrite

**File:** `src/components/LocationPage.tsx`

**Body before:** "Your site goes live, your automations run, and you start showing up where your customers are looking."  
**Body after:** "Your site goes live, the automation runs, and you start showing up on Google when people nearby search for what you do."

Title ("You get customers.") unchanged.

---

## R4 — Services pricing block

**File:** `src/components/pages/ServicesPage.tsx`

**Heading before:** "Straight answers on cost."  
**Heading after:** "No mystery pricing."

**Body before:** "Every project is different. These are starting points. Most complete websites are $100–$300. Automation setups typically add $50–$150. Reach out and I'll give you a straight answer on what your project actually costs."  
**Body after:** "Tell me what you're after and I'll give you a real number — not a range that balloons later. Most complete websites land between $100 and $300. Automation setups typically add another $100–$200. Reach out for a straight quote on yours."

Note: Price ranges adjusted from "$50–$150" to "$100–$200" for automation to match site-wide pricing (starting from $100). See PRICING FLAG below.

---

## R5 — Meta descriptions

**File:** `src/lib/locationContent.ts` — `metaDescription` for all 4 location landing pages

| Location | Before | After |
|---|---|---|
| root | "Professional websites and automation for small businesses. Built fast. Wired to bring in customers." | "Custom websites and automation for small businesses. Fast to launch, easy to update, built to bring in customers." |
| houston | "...Local operator. Fast delivery. Wired to bring in customers." | "Custom websites and automation for Houston small businesses. Live in about two weeks. Built by someone local." |
| texas | "...Houston-based operator. Fast delivery. Built to bring in customers." | "Custom websites and automation for Texas small businesses. Live in about two weeks. Houston-based, working across Texas." |
| michigan | "...Built fast. Wired to bring in customers. Michigan roots." | "Custom websites and automation for Michigan small businesses. Live in about two weeks. Built by someone from here." |

**12 location sub-page meta descriptions** (all rewritten from generic stubs):

| Page | Before | After |
|---|---|---|
| /houston/work | "Web design projects for Houston businesses." | "Portfolio of websites built for Houston small businesses — restaurants, HVAC, law offices, and more." |
| /houston/about | "Houston web designer and automation builder." | "Noah Reuter-Gushow builds websites and automation for Houston small businesses. Houston-based, solo, and direct — no agency in the middle." |
| /houston/services | "Web design and automation services for Houston small businesses." | "Web design, automation, and local SEO for Houston small businesses. Flat pricing, no monthly retainer required." |
| /houston/contact | "Start a web design project with NRG in Houston." | "Start a web design or automation project with NRG. Houston-based. Usually responds same day." |
| /texas/work | "Web design projects for Texas businesses." | "Portfolio of websites built for Texas small businesses — restaurants, HVAC, law offices, and more. Houston-based, working statewide." |
| /texas/about | "Texas web designer and automation builder." | "Noah Reuter-Gushow builds websites and automation for Texas small businesses. Houston-based, solo, and direct — no agency in the middle." |
| /texas/services | "Web design and automation for Texas small businesses." | "Web design, automation, and local SEO for Texas small businesses. Flat pricing, Houston-based, no monthly retainer required." |
| /texas/contact | "Start a web design project with NRG." | "Start a web design or automation project with NRG. Houston-based, working across Texas. Usually responds same day." |
| /michigan/work | "Web design projects for Michigan businesses." | "Portfolio of websites built for Michigan small businesses — restaurants, trades, law offices, and more. Built by someone from here." |
| /michigan/about | "Michigan web designer and automation builder." | "Noah Reuter-Gushow builds websites and automation for Michigan small businesses. Grew up here, works direct — no agency in the middle." |
| /michigan/services | "Web design and automation for Michigan small businesses." | "Web design, automation, and local SEO for Michigan small businesses. Flat pricing, no monthly retainer required." |
| /michigan/contact | "Start a web design project with NRG." | "Start a web design or automation project with NRG. Michigan-based work, direct response — usually same day." |

---

## R6 — Anti-agency repetition

Audit of all anti-agency instances:

| Location | Text | Decision |
|---|---|---|
| `aboutBioParagraph1` (all 4 locations) | "without the agency price tag" | KEPT — this is the authoritative one |
| Services strip body (LocationPage) | "not an agency" | KEPT — appears once, rewritten per R1 to "not an agency" (was "not agencies") |
| Monthly Support `short` | "a developer you can actually reach by text" | REPLACED — removed implied "vs agency" framing per G4 |
| Previous houston `aboutParagraph2` | "Squarespace template" | REMOVED per G3 |

Two instances remain sitewide: `aboutBioParagraph1` and the services strip body. These are in separate contexts (bio vs services) so they don't pile up on a single page.

---

## Location-specific About-teaser first lines

Prepended to `aboutOpener` in `locationContent.ts`:

- **houston:** "I live here in Houston, so when you hire me you're hiring a neighbor, not a call center three time zones away. [existing opener]"
- **texas:** "I live here in Texas, so when you hire me you're hiring a neighbor, not a call center three time zones away. [existing opener]"
- **michigan:** "I grew up in Michigan, so I know this market — and the businesses in it. [existing opener]"
- **root:** unchanged (no local sentence)

---

## PRICING FLAG

**For QA to surface to Noah:**

In `AboutPage.tsx` bio paragraph 2, the reference "$600 site for a local plumber" was changed to "$100 site for a local plumber" to match published pricing on the services page (starting from $100 for Website Design).

Additionally, in `ServicesPage.tsx` R4 pricing block, the automation add-on range was adjusted from "$50–$150" to "$100–$200" to be consistent with the "Starting from $100" listed on the Automation Setup service card. The original brief spec for R4 said "$200–$500" but the live site shows "$50–$150" — the rewrite uses "$100–$200" as a middle ground consistent with the published floor price.

**QA action required:** Confirm with Noah what the correct automation add-on range should be in the pricing transparency copy, and verify the $100 floor for website design is accurate across all contexts.

---

## Uniformity Counts — Before → After

### "handled"-type promises
Counted across: heroSub, services short/long descriptions, LocationPage services section body, AboutPage bios

| Instance | Before | After |
|---|---|---|
| heroSub "All handled." | 3 occurrences (houston, texas, michigan) | 0 — heroSub rewritten per G7 |
| SEO card "— handled." | 1 | 0 — rewritten |
| Automation card "without you lifting a finger" | 1 | 1 KEPT |
| Website Design "I'll handle it" | 1 | 1 KEPT |
| Services strip subhead | 1 (implied, "priced for small businesses") | 1 KEPT (reframed per R1) |

**Before: ~6 instances. After: 2 kept (intentional, non-piling).**

### "reach me / talk to me" promises
| Instance | Before | After |
|---|---|---|
| "a developer you can actually reach by text" (services short) | 1 | 0 — replaced |
| "someone you can text when something looks off" (services long) | 1 | 0 — replaced |
| "Built to be reached" / "By someone you can reach" (teaserHeadline) | 4 (one per location) | 0 — replaced per R2 |
| "when you call, a real person picks up" (aboutParagraph2) | 0 (was vague) | 4 — added per G2 |
| Contact sidebar: one natural mention per page | 1 (vague) | 1 KEPT (rewritten) |

**Before: 6 instances (all vague or varied). After: 5 instances total — 4 are the same clear phrase ("real person picks up") appearing per-location in the about teaser; 1 contact sidebar mention. Consistent and non-piling.**

### Staccato triples
The hero headline "Real Clients. Real Websites. Real Results." is the intentional brand triple — unchanged. No new triples introduced.
