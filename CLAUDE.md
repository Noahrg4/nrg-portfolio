# NRG Portfolio — Claude Code Project Handbook

This file is auto-read by Claude Code at session start. It gives a new session everything needed to work on this codebase at full capacity.

---

## 1. Project Overview

**What this is:** Noah Reuter-Gushow's portfolio and lead-generation website for NRG — a one-person web design + automation business targeting small businesses in Houston, TX (primary), Texas (secondary), and Michigan (legacy market).

**Business context:**
- Owner: Noah Reuter-Gushow (nrgwebsites.com / noah@nrgwebsites.com)
- Target customers: Houston restaurants, HVAC companies, law offices, salons, trades
- Value proposition: No-agency, direct operator. Flat pricing ($500–$800 sites). Live in 1–2 weeks.
- Phone: (989) 488-7309 (placeholder — update when real number confirmed)

**Live domain:** `https://nrgwebsites.com` (pending GitHub push + Netlify deploy — see §13)

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS v3 + custom `globals.css` design tokens |
| Animation | Framer Motion v12 |
| Fonts | Syne (display/headings), DM Sans (body), DM Mono (mono/labels) — Google Fonts |
| Hosting | Netlify Free (Vercel Hobby prohibited for commercial use) |
| Email | noah@nrgwebsites.com via Zoho Mail Free |
| Contact form backend | `/api/contact` (Next.js API route) |

**Key package versions (do not upgrade without testing):**
- `framer-motion`: v12 — see §8 for a critical v12 animation rule

**Dev server:** `cd /Users/noahreuter-gushow/nrg-portfolio && npm run dev`
**Build check:** `npm run build`
**TypeScript check:** `npx tsc --noEmit`

---

## 3. File Structure

```
nrg-portfolio/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx                # Root layout — fonts, metadataBase
│   │   ├── globals.css               # Design tokens + global styles
│   │   ├── page.tsx                  # / (root homepage)
│   │   ├── houston/page.tsx          # /houston — location landing page
│   │   ├── texas/page.tsx            # /texas — location landing page
│   │   ├── michigan/page.tsx         # /michigan — location landing page
│   │   ├── work/page.tsx             # /work — portfolio grid
│   │   ├── about/page.tsx            # /about — bio + skills
│   │   ├── services/page.tsx         # /services — pricing
│   │   ├── contact/                  # /contact
│   │   │   ├── page.tsx
│   │   │   └── ContactForm.tsx
│   │   ├── api/contact/route.ts      # Contact form API handler
│   │   ├── sitemap.ts                # Auto-generates /sitemap.xml (8 URLs)
│   │   └── robots.ts                 # Auto-generates /robots.txt
│   │
│   ├── components/
│   │   ├── LocationPage.tsx          # ★ Shared template for all 4 location pages
│   │   ├── Nav.tsx                   # Fixed header — logoHref prop
│   │   ├── Footer.tsx                # Footer — logoHref prop
│   │   ├── HeroHeadline.tsx          # ★ Custom highlight-sweep animation
│   │   ├── BrowserMockup.tsx         # ★ Browser frame — noEntry prop critical
│   │   ├── HomepageProjectCard.tsx   # Project card for homepage grid
│   │   ├── ProjectCard.tsx           # Project card for /work page grid
│   │   ├── ServiceCard.tsx           # Service card for services strip
│   │   ├── TestimonialCard.tsx       # Testimonial — featured + standard variant
│   │   ├── FloatingCta.tsx           # Fixed "Let's talk →" bottom-right
│   │   ├── StatusPill.tsx            # "Available for projects" pulsing pill
│   │   ├── SectionHeading.tsx        # Heading wrapper with .text-display class
│   │   ├── StickyCtaBar.tsx          # Sticky mobile CTA bar
│   │   └── Icons.tsx                 # SVG icon set (IconWeb, IconAutomation, etc.)
│   │
│   └── lib/
│       ├── locationContent.ts        # ★ ALL location-specific copy (single source of truth)
│       ├── projects.ts               # Project data array (5 projects)
│       ├── services.tsx              # Services data array
│       └── testimonials.ts           # Testimonial data (placeholder — needs real quotes)
│
├── docs/
│   ├── LOCATION-CONTENT.md           # Full copy reference table for all 4 locations
│   ├── SEO-IMPLEMENTATION.md         # SEO audit log
│   ├── LINK-MAP.md                   # Internal link map (60 links audited)
│   └── LOCATION-LAUNCH.md            # Deployment checklist
│
├── public/
│   └── work/                         # Project screenshot images
│       ├── gushow-excavating.png
│       ├── rewilding-life.png
│       ├── rustic-table.png
│       ├── martinez-hvac.png
│       └── reyes-law.png
│
├── tailwind.config.ts
├── CLAUDE.md                         # ← You are here
└── package.json
```

---

## 4. Design System

### Color Tokens
All colors are defined as CSS custom properties in `globals.css` AND as Tailwind theme extensions.

```css
--canvas:          #0A0A0A    /* bg-canvas      — page background (near-black) */
--surface-1:       #111111    /* bg-surface-1   — cards, panels */
--surface-2:       #161616    /* bg-surface-2   — elevated cards, browser chrome */
--surface-3:       #1C1C1C    /* bg-surface-3   — URL bar in BrowserMockup */
--accent:          #00D4FF    /* text-accent     — electric cyan, THE brand color */
--accent-glow:     rgba(0,212,255,0.15)  /* bg-accent/glow — glow halos */
--ink:             #FFFFFF    /* text-ink        — primary text */
--ink-secondary:   #888888    /* text-ink-secondary — body copy */
--ink-subtle:      #555555    /* text-ink-subtle — labels, meta text */
--hairline:        rgba(255,255,255,0.08)   /* border-hairline — subtle dividers */
--hairline-strong: rgba(255,255,255,0.16)  /* border-hairline-strong — visible borders */
--status-green:    #28CA41    /* bg-status-green — "available" dot */
```

**Key rule:** Always use semantic token names (`text-accent`, `bg-canvas`, `border-hairline`) instead of hardcoded hex values. This keeps the design consistent and easy to update.

### Typography
Three font families — each with a strict role:

| Family | Tailwind class | Role |
|---|---|---|
| **Syne** 700/800 | `font-display` | Page headings, hero text, card titles, nav logo, CTA band |
| **DM Sans** 400/500/700 | `font-sans` (default) | Body copy, paragraphs, form inputs |
| **DM Mono** 400/500 | `font-mono` | Labels, tags, CTAs, monogram, nav links, metadata, prices |

**Display heading style** — applied via `.text-display` utility class:
```css
font-family: Syne; font-weight: 800; letter-spacing: -0.04em; line-height: 0.95;
```

**Label style pattern** — always `font-mono text-[11px] uppercase tracking-wider text-ink-subtle` or `text-accent`.

### Spacing System
- `container-content` — max-width 1280px, auto margins, responsive padding with `clamp(1.25rem, 5vw, 2rem)`
- `section-pad` / `py-section` — fluid vertical padding: `clamp(3rem, 8vw, 6rem)` top and bottom
- `py-section-lg` — fluid: `clamp(4rem, 10vw, 8rem)` top and bottom

### Visual Texture
A fixed `body::before` pseudo-element adds a subtle fractalNoise SVG texture at 3.5% opacity with `mix-blend-mode: overlay`. This gives the dark background depth. **Never remove this.**

### Accent Glow Pattern
Used on CTA buttons and card hovers:
```
hover:shadow-[0_0_40px_rgba(0,212,255,0.5)]   /* button glow on hover */
hover:shadow-[0_8px_32px_rgba(0,212,255,0.12)] /* card image glow on hover */
shadow-card-hover: 0 20px 60px rgba(0,212,255,0.15)  /* ServiceCard hover */
```

### Hero Glow
Radial gradient orb behind hero content:
```
background: radial-gradient(circle, rgba(0,212,255,0.18), transparent 70%)
```
Applied as an `aria-hidden` div, `blur-3xl`, `opacity-40`, positioned at `-top-40 -left-40 h-[600px] w-[600px]`.

### CTA Band Glow
At the bottom of the full-page CTA section:
```
background: radial-gradient(ellipse at 50% 100%, rgba(0,212,255,0.18), transparent 60%)
```
Applied as `aria-hidden` with `opacity-60`.

### Selection Color
```css
::selection { background: var(--accent); color: var(--canvas); }
```
Cyan background, dark text on selected text.

---

## 5. Component Reference

### `LocationPage` — `src/components/LocationPage.tsx`
**The most important component.** Shared template for all 4 location pages (/, /houston, /texas, /michigan).

```tsx
import { LocationPage } from '@/components/LocationPage'
<LocationPage location="root" | "houston" | "texas" | "michigan" />
```

**Sections in order:**
1. `<Nav logoHref={content.navLogoHref} />`
2. **Hero** — HeroHeadline + heroLocationLine (cyan, hidden on mobile, null for root) + heroSub + CTAs
3. **Featured Testimonial** — single `<TestimonialCard featured />`
4. **Work Preview** — 3-card grid using first 3 projects, titles from `content.cardTitles`
5. **Services Strip** — 4-column ServiceCard grid
6. **Process** — 3-step "We talk → I build → You get customers" numbered list
7. **More Testimonials** — 2-column TestimonialCard grid
8. **About Teaser** — photo + aboutOpener + aboutParagraph2 + skill tags + "More about me →" link
9. **CTA Band** — ctaBandHeadline + ctaBandSub + cyan button + phone link
10. `<Footer logoHref={content.navLogoHref} />`
11. `<FloatingCta />`

**Location line rendering:**
```tsx
{content.heroLocationLine !== null && (
  <p className="hidden ... text-accent md:block">{content.heroLocationLine}</p>
)}
```
Only shows on desktop (`md:block`). Only renders when not null (root page has null).

**Card title mapping:**
```typescript
const slugToCardKey = {
  "gushow-excavating": "gushow",
  "rewilding-life": "rewilding",
  "houston-restaurant": "rusticTable",
  "houston-hvac": "martinezHvac",
  "houston-law": "reyesLaw",
}
```
Each location can override project card titles via `content.cardTitles[key]`.

---

### `Nav` — `src/components/Nav.tsx`
```tsx
<Nav logoHref="/" />   // default "/"
```
- Fixed header, `z-50`
- Transparent on scroll=0, frosted glass (`bg-canvas/70 backdrop-blur-xl border-hairline`) when scrolled > 50px
- Desktop: inline links + "Get in touch" cyan button on right
- Mobile: hamburger → full-screen overlay with large nav links + "Start a project →" at bottom
- `logoHref` prop: where the NRG wordmark links. Set to `/houston` on /houston page, `/texas` on /texas, etc.

**Nav links** (always go to shared pages — never location-scoped):
```
/work  /about  /services  /contact
```

---

### `Footer` — `src/components/Footer.tsx`
```tsx
<Footer logoHref="/" />  // default "/"
```
- Mobile: centered NRG wordmark + "Houston, TX · © year · email"
- Desktop: horizontal row — NRG | Houston, TX | email | © year
- `logoHref` prop same as Nav — set per-location via `content.navLogoHref`

---

### `HeroHeadline` — `src/components/HeroHeadline.tsx`
```tsx
<HeroHeadline lines={[
  { text: "Real Clients." },
  { text: "Real Websites." },
  { text: "Real Results." },
]} />
```
**Custom two-phase animation — do not replace with framer-motion:**
- **Phase 1 (auto, on mount):** Each of the 3 lines gets a cyan highlight bar that sweeps left→right (scaleX 0→1), inverting text to black, then sweeps right→exit. Sequential, 500ms delay before start.
- **Phase 2 (hover, after P1 completes):** Hovering any line re-triggers the sweep on that line only.
- Respects `prefers-reduced-motion` — skips animation, jumps to final state.
- Implemented via `useRef` + `setTimeout` + CSS `transform: scaleX()` + `transition`. **Pure DOM manipulation, no framer-motion.**
- Font: `text-display text-[clamp(1.75rem,8vw,9rem)]`

---

### `BrowserMockup` — `src/components/BrowserMockup.tsx`
```tsx
<BrowserMockup
  url="nrgwebsites.com/work/restaurant"
  imageSrc="/work/rustic-table.png"
  imageAlt="..."
  delay={0.1}
  noEntry={false}           // ★ CRITICAL — see rule below
  className="..."
/>
```
Renders a macOS-style browser chrome (red/yellow/green dots + URL bar) with a `16/10` aspect-ratio content area.

**`noEntry` prop — CRITICAL RULE:**
When `BrowserMockup` is nested inside a `motion.div` or `motion.article` card that already has `whileInView`, pass `noEntry={true}`. This disables the mockup's own entry animation (`initial={false}`, no `whileInView`). Without `noEntry`, the mockup plays its own animation independently, causing a double-animation jitter.

```tsx
// ✅ Correct — card handles entry, mockup suppresses its own
<motion.div whileInView={{ opacity: 1, y: 0 }}>
  <BrowserMockup noEntry url="..." imageSrc="..." />
</motion.div>

// ❌ Wrong — both card AND mockup animate independently = jitter
<motion.div whileInView={{ opacity: 1, y: 0 }}>
  <BrowserMockup url="..." imageSrc="..." />
</motion.div>
```

---

### `HomepageProjectCard` — `src/components/HomepageProjectCard.tsx`
Used on the homepage work preview grid (3 cards). Wraps `BrowserMockup` in a `<Link href="/work">` — the whole card is clickable and goes to `/work`.

```tsx
<HomepageProjectCard
  category="Restaurant"
  title="Full Web Presence — Houston Restaurant"
  url="nrgwebsites.com/work/restaurant"
  gradient="bg-gradient-to-br from-[#1a1818] ..."
  imageSrc="/work/rustic-table.png"
  imageAlt="..."
  delay={0.1}
/>
```
- `framer-motion` entry: `opacity: 0, y: 24` → `opacity: 1, y: 0` via `whileInView`
- Hover: CSS `hover:-translate-y-1 transition-transform` — **no framer-motion `whileHover`**
- Text brightens on hover: `group-hover:text-white/90` and `group-hover:text-white/70`
- BrowserMockup always receives `noEntry` here

---

### `ProjectCard` — `src/components/ProjectCard.tsx`
Used on `/work` page grid (all 5 projects). Functionally identical to `HomepageProjectCard` but is a `<motion.article>` (not a Link). The project detail page structure is TBD.

---

### `ServiceCard` — `src/components/ServiceCard.tsx`
```tsx
<ServiceCard
  icon={<IconWeb />}
  name="Web Design"
  description="Custom, fast-loading websites..."
  startingFrom="$450"
  delay={0.08}
/>
```
- Dark card with `border-accent/20` that brightens to `border-accent` on hover
- Hover: `hover:-translate-y-1 hover:shadow-card-hover`
- Arrow `→` slides right on hover via `group-hover:translate-x-1`
- `startingFrom` label hidden on mobile (`sm:block`)

---

### `TestimonialCard` — `src/components/TestimonialCard.tsx`
```tsx
<TestimonialCard
  quote="..."
  author="Marcus Williams"
  business="Williams HVAC · Houston, TX"
  featured={false}    // true = larger text, wider left border padding
  delay={0}
/>
```
- Left `border-l-2 border-accent/35` (cyan left border)
- Featured variant: `pl-10 md:pl-14`, `text-xl md:text-2xl`
- Standard: `pl-8`, `text-base md:text-lg`
- Entry: `whileInView opacity + y:20 → 0`

**⚠️ Testimonials are placeholder data.** See `src/lib/testimonials.ts` — all 3 testimonials need to be replaced with real client quotes when available.

---

### `FloatingCta` — `src/components/FloatingCta.tsx`
- Fixed bottom-right, `z-50`
- Appears after scrolling 400px, hidden on `/contact` page
- "Let's talk →" in `text-accent font-mono uppercase`
- Entry/exit: framer-motion opacity fade

---

### `StatusPill` — `src/components/StatusPill.tsx`
```tsx
<StatusPill size="md" | "sm" />
```
Rounded pill: pulsing green dot + "Available for projects" in cyan mono text.
- Used on the hero section
- `pulse-dot` CSS animation defined in `globals.css`

---

### `SectionHeading` — `src/components/SectionHeading.tsx`
Thin wrapper that applies the `.text-display` class (Syne 800, tight tracking, 0.95 line-height) to an `<h2>`. Always used for section-level headings, never `<h3>`.

---

### `Icons` — `src/components/Icons.tsx`
SVG icons used in ServiceCards and AboutPage skills grid:
- `IconWeb` — browser/web icon
- `IconAutomation` — automation/workflow icon
- `IconSeo` — search/magnifier icon
- `IconSecurity` — lock/shield icon

---

## 6. Location Pages System

### Architecture
One TypeScript content map, one shared template, four thin page wrappers.

```
src/lib/locationContent.ts        ← edit copy here
     ↓
src/components/LocationPage.tsx   ← edit layout/structure here
     ↓
src/app/page.tsx                  → <LocationPage location="root" />
src/app/houston/page.tsx          → <LocationPage location="houston" /> + JSON-LD
src/app/texas/page.tsx            → <LocationPage location="texas" />
src/app/michigan/page.tsx         → <LocationPage location="michigan" /> + JSON-LD
```

### Adding a New Location
1. Add a new slug to `LocationSlug` type in `locationContent.ts`
2. Add a new entry to the `locationContent` Record
3. Create `src/app/[newcity]/page.tsx` with metadata + `<LocationPage location="newcity" />`
4. Add the URL to `src/app/sitemap.ts`

### Editing Location Copy
All copy lives in `src/lib/locationContent.ts`. Each location has:

| Field | What it controls |
|---|---|
| `heroLocationLine` | Cyan subtitle line in hero (null = hidden; root = null) |
| `heroSub` | Hero body paragraph |
| `workSectionSub` | Small label above work grid |
| `aboutOpener` | First paragraph in about teaser |
| `aboutParagraph2` | Second paragraph in about teaser |
| `ctaBandHeadline` | Big centered headline in CTA band |
| `ctaBandSub` | Subtext below CTA band headline |
| `contactHeadline` | Heading on contact section |
| `contactSub` | Subtext on contact section |
| `metaTitle` | `<title>` tag for the page |
| `metaDescription` | Meta description (keep under 160 chars) |
| `internalLinkPrefix` | Prefix for location-scoped links (e.g. `/houston`) |
| `navLogoHref` | Where the NRG logo (nav + footer) links |
| `cardTitles` | Per-location override titles for the 5 project cards |

### SEO Per Location
Each location page file (`src/app/houston/page.tsx` etc.) exports:
```typescript
export const metadata: Metadata = {
  title: locationContent.houston.metaTitle,
  description: locationContent.houston.metaDescription,
  alternates: { canonical: 'https://nrgwebsites.com/houston' },
}
```
Houston and Michigan also have JSON-LD `<script type="application/ld+json">` in the page component JSX — `LocalBusiness + ProfessionalService` schema.

---

## 7. Data Layer

### `src/lib/projects.ts`
Array of 5 `Project` objects. **The first 3 are shown on the homepage grid** (`projects.slice(0, 3)`). All 5 show on `/work`.

```typescript
type Project = {
  slug: string;       // used for cardTitles mapping
  category: string;   // label above card title
  title: string;      // default title (overridden per location)
  outcome: string;    // used on /work detail pages (TBD)
  tags: string[];     // used on /work detail pages (TBD)
  url: string;        // shown in BrowserMockup URL bar
  gradient: string;   // Tailwind gradient classes — used when no imageSrc
  imageSrc?: string;  // path under /public/work/
  imageAlt?: string;
}
```

Project slugs (map to `cardTitles` keys):
- `"gushow-excavating"` → `cardTitles.gushow`
- `"rewilding-life"` → `cardTitles.rewilding`
- `"houston-restaurant"` → `cardTitles.rusticTable`
- `"houston-hvac"` → `cardTitles.martinezHvac`
- `"houston-law"` → `cardTitles.reyesLaw`

### `src/lib/services.tsx`
Array of 4 service objects used in ServiceCard grid and `/services` page.

### `src/lib/testimonials.ts`
1 `featuredTestimonial` + array of 2 `testimonials`. **All are placeholder copy** — marked with `[REPLACE WITH REAL TESTIMONIAL]` comments. Replace when Noah has real client quotes.

---

## 8. Animation System — Critical Rules

### The Framer Motion v12 `whileHover` + `whileInView` Conflict

**NEVER put `whileHover={{ y: ... }}` on the same `motion` element as `whileInView`.**

In Framer Motion v12, having both `whileHover` (which targets `y`) and `whileInView` (which also sets `y: 0`) on the same element causes the IntersectionObserver to never fire. The element stays at `opacity: 0` permanently — invisible on the page.

**The fix:** Use CSS for hover transforms, not framer-motion.
```tsx
// ✅ Correct
<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-60px" }}
  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
  className="group hover:-translate-y-1 transition-transform duration-200 ease-out"
>

// ❌ Wrong — cards will be invisible forever
<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  whileHover={{ y: -4 }}    // ← NEVER DO THIS
  ...
>
```

### Standard Entry Animation Pattern
All scrolling cards use this pattern:
```tsx
initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: "-60px" }}
transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
```
- `useReducedMotion()` hook — when true, only fade (no y movement)
- `once: true` — only animates once, not every scroll
- `margin: "-60px"` — triggers 60px before fully in view
- Ease `[0.16, 1, 0.3, 1]` — custom spring-like ease for a snappy feel

### Group Hover Text Pattern
```tsx
className="group ..."                        // parent
// child text:
className="... group-hover:text-white/90"    // primary title
className="... group-hover:text-white/70"    // category label
```

### FloatingCta Animation (opacity only — no y)
```tsx
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
```

### `noEntry` Rule for BrowserMockup
Always pass `noEntry` to `BrowserMockup` when it's inside a card that already has `whileInView`. See §5 BrowserMockup entry.

---

## 9. Page-by-Page Reference

### `/` (root) — `src/app/page.tsx`
Thin wrapper: `<LocationPage location="root" />` + metadata with canonical `https://nrgwebsites.com`.

### `/houston` — `src/app/houston/page.tsx`
`<LocationPage location="houston" />` + JSON-LD `LocalBusiness` (City: Houston, State: Texas) + canonical `https://nrgwebsites.com/houston`.

### `/texas` — `src/app/texas/page.tsx`
`<LocationPage location="texas" />` + canonical `https://nrgwebsites.com/texas`.

### `/michigan` — `src/app/michigan/page.tsx`
`<LocationPage location="michigan" />` + JSON-LD `LocalBusiness` (State: Michigan) + canonical `https://nrgwebsites.com/michigan`.

### `/work` — `src/app/work/page.tsx`
Full 2-column `ProjectCard` grid. All 5 projects. "More work available on request" caption. CTA section linking to `/contact`.

### `/about` — `src/app/about/page.tsx`
Bio + 2-column skills grid (Web Design, Automation, Local SEO, Security & Hosting) + photo + credential badges. CTA section. **This page uses the standalone `<Nav />` (no logoHref), so its logo always goes to `/`.**

### `/services` — `src/app/services/page.tsx`
Full service cards (larger than strip version), pricing transparency section, CTA band. All service links → `/contact`.

### `/contact` — `src/app/contact/page.tsx` + `ContactForm.tsx`
Contact form. `ContactForm` is a client component. Form POST target: `/api/contact` route. `FloatingCta` is hidden on this page (pathname check in component).

---

## 10. SEO Infrastructure

### What's in place
- **`src/app/layout.tsx`** — global `metadataBase: new URL("https://nrgwebsites.com")`, OpenGraph title/description
- **`src/app/sitemap.ts`** — auto-generates `/sitemap.xml` with 8 URLs (priorities: / = 1.0, location pages = 0.9, /work = 0.8, /services = 0.7, /about = 0.6, /contact = 0.5)
- **`src/app/robots.ts`** — auto-generates `/robots.txt` with `allow: '/'` and sitemap reference
- **Canonical tags** — `alternates: { canonical: '...' }` on all 4 location pages
- **JSON-LD** — `LocalBusiness + ProfessionalService` on `/houston` (City level) and `/michigan` (State level)
- **Unique meta titles + descriptions** — per page, all under 160 chars

### Manual SEO steps still needed (Noah does these post-launch)
1. Verify domain in Google Search Console → submit `https://nrgwebsites.com/sitemap.xml`
2. Set up Google Business Profile with `/houston` as primary URL
3. Monitor location page indexing status after 2 weeks

---

## 11. Shared Pages vs Location Pages

**Shared pages** (always go to these from location pages):
- `/work` — same portfolio for all locations
- `/about` — same bio for all locations
- `/services` — same pricing for all locations
- `/contact` — same contact form for all locations

**Location pages** (each has unique copy):
- `/` — generic (no location line)
- `/houston` — Houston-specific
- `/texas` — Texas-wide
- `/michigan` — Michigan-specific

Nav links from ALL pages (including location pages) go to the shared pages. The only location-scoped link is the NRG logo (nav + footer), which is set via `logoHref` prop from `content.navLogoHref`.

---

## 12. What's Been Built — Full Commit History

| Commit | What it did |
|---|---|
| Initial commits | Next.js scaffold, Tailwind config, globals.css, design tokens |
| Component builds | All components created — Nav, Footer, Hero, BrowserMockup, cards, etc. |
| Page builds | /work, /about, /services, /contact pages created |
| QA Fix (da735f1) | Fixed framer-motion `whileHover`+`whileInView` conflict on cards; added `noEntry` to BrowserMockup; fixed "Selected work" label color |
| Location pages (d12b9a3) | Added `/houston`, `/texas`, `/michigan`; created `locationContent.ts` + `LocationPage.tsx`; added JSON-LD, sitemap, robots.ts; fixed `metadataBase`; made Footer logo location-aware |

---

## 13. Hosting Setup — IN PROGRESS

**Status:** All code is local only. Not yet on GitHub. Not yet on Netlify.

### Plan
1. **Domain:** Buy `nrgwebsites.com` + `nrgwebsites.com` (used in project card URL bars)
2. **GitHub:** Create new public repo `nrg-portfolio`, push local `main` branch
3. **Netlify:** Connect Netlify account (Noah has one) → "Add new site from Git" → pick the GitHub repo → auto-deploy
4. **Build settings for Netlify:**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18+
5. **Email:** Zoho Mail Free for noah@nrgwebsites.com
6. **Contact form:** Resend (free tier) for transactional email from the `/api/contact` route

### GitHub Push (what was interrupted)
- `gh` CLI is not installed
- Plan was: Chrome MCP → navigate to github.com/new → create repo → terminal git push
- Commands to run once repo exists:
  ```bash
  git remote add origin https://github.com/[username]/nrg-portfolio.git
  git push -u origin main
  ```

---

## 14. Known Placeholders (need real content)

| Location | What needs updating |
|---|---|
| `src/lib/testimonials.ts` | All 3 testimonials are placeholder copy |
| `src/components/LocationPage.tsx` line ~316 | Phone number `(989) 488-7309` is placeholder |
| `src/app/contact/ContactForm.tsx` | Needs real email handler wired to Resend |
| `public/` | `noah-headshot.jpg` needs to exist |
| `/about` page | CompTIA certifications listed — verify these are accurate |

---

## 15. Design Decisions & Rules — "Never Do This"

1. **Never add `whileHover={{ y: ... }}` to a `motion` element that also has `whileInView`.** Use CSS `hover:-translate-y-1 transition-transform` instead.

2. **Never skip the `noEntry` prop** on `BrowserMockup` when it's inside an animating card wrapper.

3. **Never use hardcoded hex colors** in Tailwind classes. Always use the token (`text-accent`, not `text-[#00D4FF]`), except in inline `style={}` objects for radial gradient orbs where tokens aren't available in CSS `background:` values.

4. **Never add a new location page** without also:
   - Adding it to `locationContent.ts`
   - Adding a `canonical` in the page metadata
   - Adding it to `sitemap.ts`
   - Setting the correct `navLogoHref` to point back to the location page

5. **Never put inline navigation links to `/houston/contact`** or any location-scoped sub-route. Those pages don't exist. All sub-routes (/work, /about, /services, /contact) are always shared.

6. **Never change `overflow-x: hidden` to `overflow-x: clip` accidentally** — the body uses `clip` intentionally. `hidden` creates a new stacking context and breaks `position: fixed` elements (Nav, FloatingCta).

7. **The noise texture (`body::before`)** is intentional — don't remove it, don't increase its opacity above ~5%.

8. **Font loading** is via Google Fonts `@import` in `globals.css`. Do not add `<link>` tags to `layout.tsx` — they'd conflict.

---

## 16. Quick Start for a New Session

```bash
# 1. Start dev server
cd /Users/noahreuter-gushow/nrg-portfolio && npm run dev

# 2. TypeScript check
npx tsc --noEmit

# 3. Production build check
npm run build
```

**Key files to read before making changes:**
- `src/lib/locationContent.ts` — all copy
- `src/components/LocationPage.tsx` — homepage/location page structure
- `tailwind.config.ts` — all design tokens as Tailwind extensions
- `src/app/globals.css` — CSS custom properties + utility classes

**Where to make common changes:**

| Task | File |
|---|---|
| Change hero copy | `src/lib/locationContent.ts` |
| Change homepage layout | `src/components/LocationPage.tsx` |
| Add a project | `src/lib/projects.ts` + add screenshot to `public/work/` |
| Change service offerings | `src/lib/services.tsx` |
| Update testimonials | `src/lib/testimonials.ts` |
| Add a new location page | New `src/app/[city]/page.tsx` + new entry in `locationContent.ts` + add to `sitemap.ts` |
| Change brand color | `tailwind.config.ts` `colors.accent.DEFAULT` + `globals.css` `--accent` |
| Change nav links | `src/components/Nav.tsx` `links` array |
| Update phone number | `src/components/LocationPage.tsx` CTA band section |
