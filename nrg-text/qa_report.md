# Extraction QA Report

Source: https://nrgwebsites.com
Audited: 2026-05-24
Total files: 20

---

## Scope: MAIN

| URL | File | File exists? | Complete? | Verbatim? | Format OK? | Notes |
|---|---|---|---|---|---|---|
| / | main_home.md | yes | yes | yes | yes | |
| /work | main_work.md | yes | yes | yes | yes | CTA section heading duplicates caption text ("More work available on request." appears twice) — minor |
| /about | main_about.md | yes | yes | yes | yes | |
| /services | main_services.md | yes | yes | yes | yes | |
| /contact | main_contact.md | yes | yes | yes | yes | |

## Scope: HOUSTON

| URL | File | File exists? | Complete? | Verbatim? | Format OK? | Notes |
|---|---|---|---|---|---|---|
| /houston | houston_landing.md | yes | yes | yes | yes | |
| /houston/work | houston_work.md | yes | yes | yes | minor | Section named `## Section: More Work` instead of `## Section: CTA Band` per template |
| /houston/about | houston_about.md | yes | yes | yes | yes | |
| /houston/services | houston_services.md | yes | yes | yes | yes | |
| /houston/contact | houston_contact.md | yes | yes | yes | yes | |

## Scope: MICHIGAN

| URL | File | File exists? | Complete? | Verbatim? | Format OK? | Notes |
|---|---|---|---|---|---|---|
| /michigan | michigan_landing.md | yes | yes | yes | minor | Footer listed as "NRG Michigan · ©…" — live footer has NRG as separate logo element; footerLocation value is "Michigan" |
| /michigan/work | michigan_work.md | yes | yes | yes | minor | Same footer issue: "NRG Michigan · ©…" should be NRG (logo) + "Michigan · © 2026 · noah@nrgwebsites.com" |
| /michigan/about | michigan_about.md | yes | yes | yes | minor | Same footer issue; CTA section labeled `## Section: CTA` instead of `## Section: CTA Band` |
| /michigan/services | michigan_services.md | yes | yes | yes | minor | Same footer issue |
| /michigan/contact | michigan_contact.md | yes | yes | yes | minor | Same footer issue |

## Scope: TEXAS

| URL | File | File exists? | Complete? | Verbatim? | Format OK? | Notes |
|---|---|---|---|---|---|---|
| /texas | texas_landing.md | yes | yes | yes | minor | Footer listed as "NRG Texas · ©…" — same issue as Michigan scope |
| /texas/work | texas_work.md | yes | yes | yes | minor | Same footer issue; Section Header uses `**Subhead:**` instead of `**Label:**` for "Selected work" |
| /texas/about | texas_about.md | yes | yes | yes | minor | Same footer issue; CTA section labeled `## Section: CTA` instead of `## Section: CTA Band` |
| /texas/services | texas_services.md | yes | yes | yes | minor | Same footer issue; price fields listed as `**Starting from:** $100` (omits "Starting from" prefix in value) vs. other agents' `**Price:** Starting from $100` |
| /texas/contact | texas_contact.md | yes | partial | yes | no | Hero section merges `**Label:** ▸ Get in touch` and `**Heading:** Let's talk about your project.` into a single `**Heading:** ▸ Get in touch` field; body text also merged into `**Subhead:**` field |

---

## Fixes required per agent

### Agent MAIN
- `main_work.md`: The CTA section heading (`## Section: CTA Band`) repeats "More work available on request." which already appears as a caption in `## Section: Project Grid`. Not an error, but creates semantic duplication. Low priority.
- No other fixes needed.

### Agent HOUSTON
- `houston_work.md`: Rename `## Section: More Work` to `## Section: CTA Band` to match template convention used by all other work pages.
- No other fixes needed.

### Agent MICHIGAN
- All 5 Michigan files: Footer is incorrectly listed as `NRG Michigan · © 2026 · noah@nrgwebsites.com`. The live footer renders "NRG" as a standalone logo element and the footerLocation as "Michigan". The correct representation is:
  - `- NRG` (logo)
  - `- Michigan · © 2026 · noah@nrgwebsites.com`
- `michigan_about.md`: Rename `## Section: CTA` to `## Section: CTA Band` for template consistency.

### Agent TEXAS
- All 5 Texas files: Same footer correction as Michigan — `NRG Texas · © 2026 · noah@nrgwebsites.com` should be `- NRG` (logo) + `- Texas · © 2026 · noah@nrgwebsites.com`.
- `texas_contact.md` (REQUIRED fix): Hero section must separate the label from the heading:
  - Current (wrong): `**Heading:** ▸ Get in touch` / `**Subhead:** Let's talk about your project. Tell me what you need…`
  - Correct: `**Label:** ▸ Get in touch` / `**Heading:** Let's talk about your project.` / `**Body:** Tell me what you need. I'll tell you what it costs and how long it takes. No pressure.`
- `texas_work.md`: The page header section uses `**Subhead:** Selected work` — other files use `**Label:** Selected work`. Rename to `**Label:**` for consistency.
- `texas_about.md`: Rename `## Section: CTA` to `## Section: CTA Band`.
- `texas_services.md`: Price field format is `**Starting from:** $100`. Other agents (MAIN, HOUSTON, MICHIGAN) use `**Price:** Starting from $100` or `**Starting from:** Starting from $100`. Standardize to match other agents for consistency.

---

## Summary

- Total files audited: 20
- Files with no issues: 8 (main_home.md, main_about.md, main_services.md, main_contact.md, houston_landing.md, houston_about.md, houston_services.md, houston_contact.md)
- Files needing fix: 12
  - Minor/format only: 11 (main_work.md, houston_work.md, all 5 Michigan files, texas_landing.md, texas_work.md, texas_about.md, texas_services.md)
  - Required completeness fix: 1 (texas_contact.md — hero label/heading merge)
- Coverage gaps: none — all 20 sitemap URLs covered, no extra files
- Verbatim accuracy: PASS across all 20 files — no paraphrasing detected in any spot-check
- The most impactful fix: `texas_contact.md` hero section (label/heading/body incorrectly merged into two fields)
- The most widespread issue: Michigan and Texas footer format (10 files) — "NRG Michigan/Texas" prefix is incorrect; "NRG" logo is a separate DOM element not part of the footerLocation string
