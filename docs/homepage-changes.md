# Homepage Copy Agent — Change Log

Date: 2026-05-24

---

## Hero Sub (root only)

**File:** `src/lib/locationContent.ts` — `root.heroSub`

**Before:**
> I build professional websites and the automations that keep your business running — contact alerts, booking confirmations, review requests. All handled.

**After:**
> I build professional websites and the automations that keep your business running. I handle website development, contact alerts, booking confirmations, review requests, and more. All in one package.

---

## Services Intro (shared — affects all 4 pages)

**File:** `src/components/LocationPage.tsx` (lines ~160–162)

**Before:**
> Outcomes, not jargon. Pick one piece or the whole system —
> priced for small businesses, not agencies.

**After:**
> Outcomes, no matter what you are looking for. Pick one piece or the whole system, all priced for small businesses, not agencies.

---

## Testimonial 1 — Featured (Marcus Williams)

**File:** `src/lib/testimonials.ts` — `featuredTestimonial`

**Before:**
- quote: "I had a Facebook page and nothing else. Noah built me a real site in two weeks. I've had 3 new customers call me directly from Google since it went live. My phone hasn't stopped."
- author: "Marcus Williams"
- business: "Williams HVAC · Houston, TX"

**After:**
- quote: "I had a Facebook page and nothing else. Noah built me a real site in two weeks. I've had 3 new customers call me directly from Google since it went live."
- author: "Marcus Williams"
- business: "HVAC · Houston, TX"

---

## Testimonial 2 — Standard (Brittany Alvarez)

**File:** `src/lib/testimonials.ts` — `testimonials[0]`

**Before:**
- quote: "I run a salon and I'm not a tech person. Noah set everything up — my website, my Google listing, and a system that texts me every time someone books online. I went from missing calls to booking out my Saturdays two weeks ahead."
- author: "Brittany Alvarez"
- business: "Bloom Beauty Studio · Houston Heights, TX"

**After:**
- quote: "I run a salon and I'm not a tech person. Noah set everything up including my website, my Google listing, and a system that texts me every time someone books online."
- author: "Brittany Alvarez"
- business: "Houston Heights, TX"

---

## Testimonial 3 — Standard (David Nguyen)

**File:** `src/lib/testimonials.ts` — `testimonials[1]`

**Before:**
- quote: "Our old site looked like it was built in 2008. Noah rebuilt it in three weeks and now we get inquiries through the contact form almost every day. Two of them turned into clients in the first month."
- author: "David Nguyen"
- business: "Nguyen Family Law · Sugar Land, TX"

**After:**
- quote: "Our old site looked like it was built in 2008. Noah rebuilt it in two weeks and now we get inquiries through the contact form almost every day."
- author: "David Nguyen"
- business: "Law · Sugar Land, TX"

---

## CTA Timeline — Verification

**File:** `src/lib/locationContent.ts` — `root.ctaBandSub`

**Status:** Verified correct — already reads `"Most projects are live in 1–2 weeks."` No edit required.

---

## TypeScript

`npx tsc --noEmit` — exited zero, no errors.
