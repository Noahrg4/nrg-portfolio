# Sitewide Values Agent — Change Log

**Date:** 2026-05-24
**Agent:** Sitewide Values Agent (phone, timeline, pricing)

---

## Phone Replacements

All instances of `(713) 555-0000` / `tel:+17135550000` replaced with `(989) 488-7309` / `tel:+19894887309`.

- `src/components/LocationPage.tsx:318` — `href="tel:+17135550000"` → `href="tel:+19894887309"`
- `src/components/LocationPage.tsx:321` — `Or call (713) 555-0000` → `Or call (989) 488-7309`
- `src/components/pages/ContactPage.tsx:66` — `href="tel:+17135550000"` → `href="tel:+19894887309"`
- `src/components/pages/ContactPage.tsx:73` — `(713) 555-0000` → `(989) 488-7309`
- `src/app/contact/ContactForm.tsx:153` — `placeholder="(713) 555-0000"` → `placeholder="(989) 488-7309"`
- `docs/COPY-DECK.md:143` — `(XXX) XXX-XXXX` placeholder note updated to real number `(989) 488-7309`

---

## Timeline Replacements

All instances of `2–3 weeks` (en-dash) replaced with `1–2 weeks` (en-dash preserved).

- `src/lib/locationContent.ts:45` — root `ctaBandSub`: `"Most projects are live in 2–3 weeks."` → `"Most projects are live in 1–2 weeks."`
- `src/lib/locationContent.ts:75` — houston `ctaBandSub`: `"Most Houston projects are live in 2–3 weeks."` → `"Most Houston projects are live in 1–2 weeks."`
- `src/lib/locationContent.ts:105` — texas `ctaBandSub`: `"Most projects are live in 2–3 weeks."` → `"Most projects are live in 1–2 weeks."`
- `src/lib/locationContent.ts:135` — michigan `ctaBandSub`: `"Most projects are live in 2–3 weeks."` → `"Most projects are live in 1–2 weeks."`
- `src/components/pages/ServicesPage.tsx:79` — CTA section: `"Most projects are live in 2–3 weeks."` → `"Most projects are live in 1–2 weeks."`
- `docs/COPY-DECK.md:141` — CTA Band sub copy updated
- `docs/COPY-DECK.md:259` — Homepage meta description updated
- `docs/COPY-DECK.md:271` — /services meta description updated
- `docs/LOCATION-CONTENT.md:16` — root ctaBandSub updated
- `docs/LOCATION-CONTENT.md:45` — houston ctaBandSub updated
- `docs/LOCATION-CONTENT.md:74` — texas ctaBandSub updated
- `docs/LOCATION-CONTENT.md:103` — michigan ctaBandSub updated

---

## Pricing Replacements

`src/lib/services.tsx` `startingFrom` fields updated:

- `src/lib/services.tsx:22` — Website Design: `"Starting from $500"` → `"Starting from $100"`
- `src/lib/services.tsx:37` — Automation Setup: `"Starting from $300"` → `"Starting from $100"`
- `src/lib/services.tsx:52` — Google & Local SEO: `"Starting from $200"` → `"Starting from $50"`
- `src/lib/services.tsx:67` — Monthly Support: `"Starting from $75/month"` → `"Starting from $20/month"`

`docs/COPY-DECK.md` pricing section updated:

- `docs/COPY-DECK.md:206` — `WEBSITE DESIGN — Starting from $500` → `Starting from $100`
- `docs/COPY-DECK.md:210` — `AUTOMATION SETUP — Starting from $300` → `Starting from $100`
- `docs/COPY-DECK.md:214` — `GOOGLE & LOCAL SEO — Starting from $200` → `Starting from $50`
- `docs/COPY-DECK.md:218` — `MONTHLY SUPPORT — Starting from $75/month` → `Starting from $20/month`
- `docs/COPY-DECK.md:271` — /services meta description: `Websites from $500` → `Websites from $100`

---

## Grep Verification (zero-result confirmation)

```
=== Phone 555-0000 in src ===
ZERO RESULTS

=== Phone 7135550000 in src ===
ZERO RESULTS

=== Timeline 2-3 weeks in src ===
ZERO RESULTS

=== Old pricing in src ===
ZERO RESULTS
```

---

## TypeScript Check

`npx tsc --noEmit` — **exit 0, no errors.**

---

## Notes

- Docs files (`docs/COPY-DECK.md`, `docs/LOCATION-CONTENT.md`) also updated to keep them in sync with source truth, even though they are reference docs, not rendered code.
- `CLAUDE.md` still references the old phone/placeholder in its §1 business context and §14 known-placeholders entries. These are documentation notes about the codebase, not rendered values, so they were left for the lead to update as appropriate.
- The `ServicesPage.tsx` pricing note at line 58 (`"Most complete websites are $500–$800"`) was NOT changed — it describes project totals, not the `startingFrom` field values, and was outside the explicit scope of Change 3.
