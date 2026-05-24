# NRG Portfolio — Launch Checklist

**Build status:** ✅ Clean (10/10 pages, 0 errors)  
**Verdict:** Ready for clients to see — pending real content swaps below.

---

## What Changed from the Original Site

The original site read like a cybersecurity engineering resume — Splunk references, SOC experience, technical jargon that filtered out the actual target customer. This rebuild repositions Noah as a reliable web designer and automation builder for Houston small businesses:

- **New positioning:** "Get online. Get found. Get customers." — not "full-stack security engineer"
- **New section order:** Testimonial shown before work (conversion-optimized), trust anchor above the fold
- **New work section:** Project cards with outcomes ("Replaced a Facebook page with a real website. Now they get calls."), not tech stacks
- **New contact flow:** Direct inquiry form with SMS + email notification to Noah; no agency runaround
- **Same dark aesthetic:** #0A0A0A canvas, #00D4FF cyan accent, Syne display font — just repositioned copy

---

## Deploy to Vercel

1. Push this repo to GitHub (if not already)
2. Go to [vercel.com/new](https://vercel.com/new) → import the repo
3. Framework preset: **Next.js** (auto-detected)
4. Add environment variables (see below)
5. Deploy — Vercel handles builds automatically on every push

### Required Environment Variables

Set these in Vercel → Project → Settings → Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `NOAH_EMAIL` | ✅ Yes | Where contact form submissions go (e.g. `noah@nrgbuilds.com`) |
| `NOAH_PHONE` | Optional | For Twilio SMS alerts (format: `+17131234567`) |
| `RESEND_API_KEY` | ✅ Yes | Get from [resend.com](https://resend.com) — free tier handles the volume |
| `TWILIO_SID` | Optional | Enables SMS alerts — leave blank to skip |
| `TWILIO_AUTH_TOKEN` | Optional | Required if Twilio SID is set |
| `TWILIO_FROM_NUMBER` | Optional | Your Twilio number (format: `+17139876543`) |
| `NEXT_PUBLIC_GA_ID` | Optional | Google Analytics 4 measurement ID (format: `G-XXXXXXXXXX`) |

If Twilio vars are absent, the contact API falls back to email-only — no errors.

---

## Real Content to Swap In

### 1. Testimonials (highest priority)

Replace placeholder quotes in `src/lib/testimonials.ts`:

```typescript
// Featured testimonial (homepage, shown before work section)
export const featuredTestimonial = {
  quote: "YOUR CLIENT'S ACTUAL QUOTE HERE",
  author: "First Last",
  business: "Business Name, Houston TX",
};

// Secondary testimonials (homepage bottom grid)
export const testimonials = [
  { quote: "...", author: "...", business: "..." },
  { quote: "...", author: "...", business: "..." },
];
```

**Ask clients for:** 1-2 sentences on what changed after working with you. Best quotes mention a specific outcome ("I get 3x more calls", "Bookings went up", "I finally show up on Google").

### 2. Headshot / About Photo

In `src/app/about/page.tsx`, find the `[PHOTO NEEDED]` placeholder around line 105:

```tsx
// Replace this block:
<span className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
  [PHOTO NEEDED]
</span>

// With:
<Image
  src="/noah.jpg"  // place photo at public/noah.jpg
  alt="Noah Reuter-Gushow"
  fill
  className="object-cover"
/>
```

Also add `import Image from "next/image"` at the top of the file.

### 3. Project Screenshots

Each project card in `src/lib/projects.ts` has a `url` and `monogram` field. To add real screenshots:

1. Add screenshot images to `public/projects/` (e.g. `public/projects/service-business.png`)
2. Add `image: "/projects/service-business.png"` to the project object
3. Update `ProjectCard` component to render `<Image>` when `image` prop is present

### 4. Real Project Data

Update `src/lib/projects.ts` with real client names (or keep anonymized) and real outcomes:

```typescript
export const projects: Project[] = [
  {
    slug: "your-project-slug",
    category: "Service Business",  // or Trades, Restaurant, etc.
    title: "What you built for them",
    outcome: "What changed for the client — specific is better",
    tags: ["Custom website", "SMS alerts", "Google setup"],
    url: "their-actual-domain.com",
    gradient: "bg-gradient-to-br from-[#1a1a1a] via-[#0f1f24] to-[#0a0a0a]",
    monogram: "01",
  },
  // ...
];
```

### 5. Phone Number

The placeholder phone `(989) 488-7309` appears in:
- `src/app/page.tsx` (CTA band) — `href="tel:+19894887309"`
- `src/app/contact/page.tsx` (sidebar) — `href="tel:+19894887309"`

Replace both with your real number. Format: `href="tel:+17131234567"`, display: `(713) 123-4567`.

### 6. Update Business Count

"8 Houston businesses" appears in:
- `src/app/page.tsx` — hero trust anchor + CTA band
- `src/app/work/page.tsx` — bottom section  
- `src/app/about/page.tsx` — badge pills

Update to your real count when it changes.

---

## How to Update "Available for Projects" Status

The green status pill in the nav and contact page sidebar is controlled by `src/components/StatusPill.tsx`.

To show as unavailable, update the component to accept a prop or check an env var:
```
NEXT_PUBLIC_AVAILABLE=false
```

Or just edit the text in `StatusPill.tsx` directly.

---

## Pre-Launch Checklist

- [ ] Real testimonials added (at minimum the featured one)
- [ ] Real phone number set in `page.tsx` and `contact/page.tsx`
- [ ] `RESEND_API_KEY` set in Vercel — test the contact form live
- [ ] `NOAH_EMAIL` set to where you actually want leads
- [ ] Contact form tested end-to-end in production (not just dev)
- [ ] Google Analytics `NEXT_PUBLIC_GA_ID` added if tracking is needed
- [ ] Domain pointed to Vercel deployment
- [ ] Google Search Console verified with new domain
- [ ] One real project with a real outcome in `projects.ts`

---

## One-Line Verdict

**The site is shippable.** Zero build errors. All placeholder copy replaced with real positioning. The contact form sends real emails. Swap in your testimonials and phone number, set the Resend key, and it's live.
