# Location Text Audit — NRG Portfolio

**Date:** 2026-05-24  
**Auditor:** Search Agent (read-only pass)  
**Scope:** All hardcoded location strings that bypass `locationContent.ts`

---

## Methodology

1. Grepped all `.tsx` / `.ts` under `src/` for `Houston|Texas|Michigan|Auburn`, excluding `locationContent.ts` and `testimonials.ts` (known-OK files).
2. Read every file in the grep output in full, plus all components, pages, and data files listed in the brief.
3. For each hit, evaluated: does this render for all 4 locations? Is the text correct for `/texas` and `/michigan` users?

---

## Issues

---

### ISSUE 1: LocationPage.tsx — Work section heading hardcodes "Houston"
**PAGE AFFECTED:** `/` (root), `/texas`, `/michigan` — all three show wrong text  
**WRONG TEXT:** `"Websites built for real Houston businesses."`  
**WHERE IT APPEARS:** Section heading above the 3-card work preview grid  
**ROOT CAUSE:** Hardcoded JSX string — not pulling from content map  
**FILE:** `src/components/LocationPage.tsx:112`  
**SEVERITY:** Critical — Michigan and Texas visitors see "Houston businesses" in a prominent H2  
**SUGGESTED CONTENT MAP FIELD:** `workSectionHeading`  
Values:
- root: `"Websites built for real businesses."`
- houston: `"Websites built for real Houston businesses."`
- texas: `"Websites built for real Texas businesses."`
- michigan: `"Websites built for real Michigan businesses."`

---

### ISSUE 2: LocationPage.tsx — About teaser heading hardcodes "Built for Houston."
**PAGE AFFECTED:** `/` (root), `/texas`, `/michigan`  
**WRONG TEXT:** `"Built for Houston. By someone you can reach."`  
**WHERE IT APPEARS:** Section heading in the About Teaser section  
**ROOT CAUSE:** Hardcoded JSX string — not pulling from content map  
**FILE:** `src/components/LocationPage.tsx:262-263`  
**SEVERITY:** Critical — Michigan and Texas visitors see "Built for Houston" as the bio headline  
**SUGGESTED CONTENT MAP FIELD:** `aboutTeaserHeadline`  
Values:
- root: `"Built for small business. By someone you can reach."`
- houston: `"Built for Houston. By someone you can reach."`
- texas: `"Built for Texas. By someone you can reach."`
- michigan: `"Built for Michigan. By someone you can reach."`

---

### ISSUE 3: Footer.tsx — "Houston, TX" hardcoded in both mobile and desktop layouts
**PAGE AFFECTED:** ALL 16 pages (all locations render `<Footer>`, including `/texas`, `/michigan`, `/`)  
**WRONG TEXT:** `"Houston, TX"` (appears twice — line 26 mobile, line 46 desktop)  
**WHERE IT APPEARS:** Footer tagline / location identifier  
**ROOT CAUSE:** Hardcoded string — `Footer` receives `logoHref` prop but no location prop  
**FILE:** `src/components/Footer.tsx:26` and `src/components/Footer.tsx:46`  
**SEVERITY:** Critical — Michigan visitors see "Houston, TX" in the footer on every single page  
**SUGGESTED CONTENT MAP FIELD:** `footerLocation`  
Values:
- root: `"Houston, TX"` (acceptable — business is actually based in Houston)
- houston: `"Houston, TX"`
- texas: `"Texas"` or `"Houston, TX"` (debatable — see note below)
- michigan: `"Michigan"`

**Note:** For `/texas` it may be acceptable to show "Houston, TX" since the operator is Houston-based. For `/michigan` it is clearly wrong. At minimum, add a `footerLocation` field with Michigan-appropriate text.

---

### ISSUE 4: AboutPage.tsx — Page hero H1 hardcodes "Houston's small businesses"
**PAGE AFFECTED:** `/about`, `/texas/about`, `/michigan/about`, `/` (when navigating)  
**WRONG TEXT:** `"I build the web for Houston's small businesses."`  
**WHERE IT APPEARS:** Page H1 — the very first heading on the About page  
**ROOT CAUSE:** Hardcoded JSX string in `AboutPage` component  
**FILE:** `src/components/pages/AboutPage.tsx:53`  
**SEVERITY:** Critical — Texas and Michigan visitors see "Houston's small businesses" as the page headline  
**SUGGESTED CONTENT MAP FIELD:** `aboutPageHeadline`  
Values:
- root: `"I build the web for small businesses."`
- houston: `"I build the web for Houston's small businesses."`
- texas: `"I build the web for Texas small businesses."`
- michigan: `"I build the web for Michigan small businesses."`

---

### ISSUE 5: AboutPage.tsx — Bio paragraph hardcodes "Houston small businesses"
**PAGE AFFECTED:** `/about`, `/texas/about`, `/michigan/about`  
**WRONG TEXT:** `"I build websites and automation for Houston small businesses — restaurants, trades companies, law offices, salons..."`  
**WHERE IT APPEARS:** First body paragraph of the bio section  
**ROOT CAUSE:** Hardcoded JSX string  
**FILE:** `src/components/pages/AboutPage.tsx:70`  
**SEVERITY:** Critical — Texas and Michigan visitors see "Houston small businesses" in the bio  
**SUGGESTED CONTENT MAP FIELD:** `aboutBioParagraph1`  
Values:
- root: `"I build websites and automation for small businesses — restaurants, trades companies, law offices, salons, and anyone else who deserves a professional web presence without the agency price tag."`
- houston: `"I build websites and automation for Houston small businesses — restaurants, trades companies, law offices, salons, and anyone else who deserves a professional web presence without the agency price tag."`
- texas: `"I build websites and automation for Texas small businesses — restaurants, trades companies, law offices, salons, and anyone else who deserves a professional web presence without the agency price tag."`
- michigan: `"I build websites and automation for Michigan small businesses — restaurants, trades companies, law offices, salons, and anyone else who deserves a professional web presence without the agency price tag."`

---

### ISSUE 6: AboutPage.tsx — "Based in Houston." hardcoded in bio
**PAGE AFFECTED:** `/about`, `/texas/about`, `/michigan/about`  
**WRONG TEXT:** `"Based in Houston. Available for projects now."`  
**WHERE IT APPEARS:** Fourth/closing paragraph of the bio  
**ROOT CAUSE:** Hardcoded JSX string  
**FILE:** `src/components/pages/AboutPage.tsx:73`  
**SEVERITY:** Critical — Michigan visitors see "Based in Houston" as closing bio line  
**SUGGESTED CONTENT MAP FIELD:** `aboutBioClosingLine`  
Values:
- root: `"Available for projects now."`
- houston: `"Based in Houston. Available for projects now."`
- texas: `"Based in Houston, working across Texas. Available for projects now."`
- michigan: `"Michigan roots. Available for projects now."`

---

### ISSUE 7: AboutPage.tsx — "Houston-based" credential badge hardcoded
**PAGE AFFECTED:** `/about`, `/texas/about`, `/michigan/about`  
**WRONG TEXT:** `"Houston-based"` (one of the 4 credential pills below the bio)  
**WHERE IT APPEARS:** Credential pill badges row  
**ROOT CAUSE:** Hardcoded string in the `map()` array  
**FILE:** `src/components/pages/AboutPage.tsx:77`  
**SEVERITY:** High — Michigan and Texas visitors see a "Houston-based" badge  
**SUGGESTED CONTENT MAP FIELD:** `aboutLocationBadge`  
Values:
- root: `"Houston-based"`
- houston: `"Houston-based"`
- texas: `"Texas-based"` or `"Houston-based"` (operator is Houston-based — debatable)
- michigan: `"Michigan roots"`

---

### ISSUE 8: AboutPage.tsx — Local SEO skill card hardcodes "Houston customers"
**PAGE AFFECTED:** `/about`, `/texas/about`, `/michigan/about`  
**WRONG TEXT:** `"Show up when Houston customers search for you."` (Local SEO skill card body)  
**WHERE IT APPEARS:** Skill card grid — "Local SEO" card  
**ROOT CAUSE:** Hardcoded string in the `skills` array constant at top of component  
**FILE:** `src/components/pages/AboutPage.tsx:29`  
**SEVERITY:** High — Michigan/Texas visitors see "Houston customers" in a skill description  
**SUGGESTED CONTENT MAP FIELD:** `aboutSeoSkillBody`  
Values:
- root: `"Google Business Profile, local search optimization. Show up when local customers search for you."`
- houston: `"Google Business Profile, local search optimization. Show up when Houston customers search for you."`
- texas: `"Google Business Profile, local search optimization. Show up when Texas customers search for you."`
- michigan: `"Google Business Profile, local search optimization. Show up when Michigan customers search for you."`

---

### ISSUE 9: AboutPage.tsx — Image alt text hardcodes "Houston, TX"
**PAGE AFFECTED:** `/about`, `/texas/about`, `/michigan/about`  
**WRONG TEXT:** `"Noah Reuter-Gushow — NRG web designer based in Houston, TX"`  
**WHERE IT APPEARS:** `alt` attribute of headshot `<img>` element  
**ROOT CAUSE:** Hardcoded string  
**FILE:** `src/components/pages/AboutPage.tsx:95`  
**SEVERITY:** Medium — Not visible to sighted users; affects screen reader / SEO alt text on location pages. Michigan pages will have alt text saying "Houston, TX".  
**SUGGESTED CONTENT MAP FIELD:** `aboutHeadshotAlt`  
Values:
- root: `"Noah Reuter-Gushow — NRG web designer"`
- houston: `"Noah Reuter-Gushow — NRG web designer based in Houston, TX"`
- texas: `"Noah Reuter-Gushow — NRG web designer serving Texas"`
- michigan: `"Noah Reuter-Gushow — NRG web designer serving Michigan"`

---

### ISSUE 10: ContactPage.tsx — "Houston-based" in contact sidebar
**PAGE AFFECTED:** `/contact`, `/texas/contact`, `/michigan/contact`  
**WRONG TEXT:** `"Currently taking on new projects. Houston-based, so if you'd rather meet in person than trade emails, that works too."`  
**WHERE IT APPEARS:** Contact sidebar intro blurb  
**ROOT CAUSE:** Hardcoded JSX string  
**FILE:** `src/components/pages/ContactPage.tsx:46`  
**SEVERITY:** Critical — Michigan and Texas visitors see "Houston-based" as the availability blurb  
**SUGGESTED CONTENT MAP FIELD:** `contactSidebarBlurb`  
Values:
- root: `"Currently taking on new projects. If you'd rather meet in person than trade emails, that works too."`
- houston: `"Currently taking on new projects. Houston-based, so if you'd rather meet in person than trade emails, that works too."`
- texas: `"Currently taking on new projects. Based in Houston, available across Texas."`
- michigan: `"Currently taking on new projects. Michigan roots — remote-friendly, or we can meet in person."`

---

### ISSUE 11: ContactPage.tsx — "Houston, TX" hardcoded in "Based in" sidebar block
**PAGE AFFECTED:** `/contact`, `/texas/contact`, `/michigan/contact`  
**WRONG TEXT:** `"Houston, TX"` (the "Based in" label value)  
**WHERE IT APPEARS:** Contact sidebar — "Based in" section  
**ROOT CAUSE:** Hardcoded JSX string  
**FILE:** `src/components/pages/ContactPage.tsx:82`  
**SEVERITY:** Critical — Michigan visitors see "Based in: Houston, TX" on the contact page  
**SUGGESTED CONTENT MAP FIELD:** `contactBasedIn`  
Values:
- root: `"Houston, TX"`
- houston: `"Houston, TX"`
- texas: `"Houston, TX"` (operator is Houston-based; acceptable)
- michigan: `"Mid-Michigan / Remote"`

---

### ISSUE 12: ContactPage.tsx — "Serving the greater Houston area." hardcoded
**PAGE AFFECTED:** `/contact`, `/texas/contact`, `/michigan/contact`  
**WRONG TEXT:** `"Serving the greater Houston area. In-person meetings available."`  
**WHERE IT APPEARS:** Contact sidebar — descriptive line under "Based in" block  
**ROOT CAUSE:** Hardcoded JSX string  
**FILE:** `src/components/pages/ContactPage.tsx:84`  
**SEVERITY:** Critical — Texas/Michigan visitors see "Serving the greater Houston area"  
**SUGGESTED CONTENT MAP FIELD:** `contactServiceArea`  
Values:
- root: `"Serving clients nationally. In-person meetings available in Houston."`
- houston: `"Serving the greater Houston area. In-person meetings available."`
- texas: `"Serving businesses across Texas. In-person meetings available in Houston."`
- michigan: `"Serving Michigan businesses. Remote-first, in-person available."`

---

### ISSUE 13: services.tsx data — Local SEO short description hardcodes "Houston"
**PAGE AFFECTED:** All 4 location homepages (via ServiceCard in LocationPage), all 4 `/services` sub-pages (via ServiceDetailCard in ServicesPage)  
**WRONG TEXT:** `"Show up when Houston customers search for what you do."` (short)  
**WHERE IT APPEARS:** ServiceCard in the homepage services strip + ServicesPage hero service card  
**ROOT CAUSE:** Hardcoded string in `src/lib/services.tsx` data array — not location-aware  
**FILE:** `src/lib/services.tsx:50`  
**SEVERITY:** High — Michigan and root visitors see "Houston customers" in a service description  
**SUGGESTED FIX:** Either make `services` a function that accepts `location`, or add a `locationContent` field `seoServiceShort` per location and pass it in from the component. Simpler fix: make the short description generic ("Show up when local customers search for what you do.") since no other service card has a city name.

---

### ISSUE 14: services.tsx data — Local SEO long description hardcodes "Houston" (twice)
**PAGE AFFECTED:** All 4 `/services` sub-pages (via ServiceDetailCard)  
**WRONG TEXT:** `"You show up when someone in Houston searches for what you do. Your Google Business Profile gets set up and optimized..."` (long description)  
**WHERE IT APPEARS:** ServicesPage full service detail card for "Google & Local SEO"  
**ROOT CAUSE:** Hardcoded string in `src/lib/services.tsx` data array  
**FILE:** `src/lib/services.tsx:51`  
**SEVERITY:** High — Michigan and Texas/root visitors see "in Houston" in service detail copy  
**SUGGESTED FIX:** Generic: `"You show up when someone nearby searches for what you do."` OR make services location-aware via a function.

---

### ISSUE 15: projects.ts — Project titles and imageAlt for 3 spec projects hardcode "Houston"
**PAGE AFFECTED:** `/work`, `/texas/work`, `/michigan/work`, `/` (root) homepage grid — all show project cards  
**WRONG TEXT:**
- `title: "Full Web Presence — Houston Restaurant"` (project slug: houston-restaurant)
- `imageAlt: "The Rustic Table — Houston Heights restaurant website"`
- `title: "Lead Generation Site — Houston HVAC Company"` (project slug: houston-hvac)
- `imageAlt: "Martinez Cooling & Heating — Houston HVAC website"`
- `title: "Client Acquisition Site — Houston Law Office"` (project slug: houston-law)
- `imageAlt: "Reyes & Associates — Houston law firm website"`
**WHERE IT APPEARS:** `title` field is used as **fallback only** if `cardKey` lookup fails — so title is not the primary rendering path (CardTitles in locationContent.ts overrides these). However, `imageAlt` is used directly from `projects.ts` in both `HomepageProjectCard` and `ProjectCard` with no location override.  
**ROOT CAUSE:** `imageAlt` is not overridden by `locationContent.cardTitles` — it comes straight from the project data array.  
**FILE:** `src/lib/projects.ts:43`, `:52`, `:61`  
**SEVERITY:** Medium — `imageAlt` (used in `<img alt="">`) says "Houston Heights restaurant" on Michigan pages. Not visible to sighted users but affects screen readers and alt-text SEO on non-Houston pages.  
**SUGGESTED FIX:** Add `imageAlt` overrides to `cardTitles` per location, or make the existing `imageAlt` values location-generic (e.g., "The Rustic Table — restaurant website hero").

---

### ISSUE 16: layout.tsx — Root layout global metadata hardcodes "Houston"
**PAGE AFFECTED:** All pages that inherit root layout metadata (OpenGraph fallback for any page without per-page metadata override)  
**WRONG TEXT:**
- `title: "NRG — Web Design & Automation for Houston Small Businesses"`
- `description: "Custom websites, automation, and local SEO built for Houston restaurants, trades, and salons. Real results, no agency fluff."`
- OpenGraph `title` and `description` repeat same Houston text  
**WHERE IT APPEARS:** `<title>` and `<meta name="description">` fallbacks; OpenGraph share cards for all pages  
**ROOT CAUSE:** Hardcoded strings in `src/app/layout.tsx` root metadata export  
**FILE:** `src/app/layout.tsx:37-44`  
**SEVERITY:** Medium — The individual location pages override this with their own metadata. However, the OpenGraph tags are used when the root layout's OG is the only one set, and the root `/` page itself inherits this before `page.tsx` overrides it. The bigger concern is that this is the social share fallback for any page missing its own OG metadata.  
**SUGGESTED FIX:** Update root layout metadata to be generic: `"NRG — Web Design & Automation for Small Businesses"` + `"Professional websites and automation. Real results, no agency fluff."` — matches the `root` location content map.

---

### ISSUE 17: app/about/page.tsx — Metadata hardcodes "Houston Web Designer"
**PAGE AFFECTED:** `/about` page (shared about page reached from root and location pages)  
**WRONG TEXT:**
- `title: "About — NRG / Noah Reuter-Gushow, Houston Web Designer"`
- `description: "Noah Reuter-Gushow builds websites and automation for Houston small businesses. Solo, direct, and accountable — not an agency."`  
**WHERE IT APPEARS:** `<title>` tag and meta description for `/about`  
**ROOT CAUSE:** Hardcoded strings in page metadata export  
**FILE:** `src/app/about/page.tsx:5-8`  
**SEVERITY:** Medium — SEO metadata visible to search engines. A Michigan visitor who finds `/about` via Google sees "Houston Web Designer" in the title.  
**SUGGESTED FIX:** The shared `/about` page always renders `<AboutPage />` with no location prop (defaults to "root"), so the metadata should also be generic: `"About — NRG / Noah Reuter-Gushow, Web Designer"`.

---

### ISSUE 18: app/services/page.tsx — Metadata hardcodes "NRG Houston Web Design"
**PAGE AFFECTED:** `/services` (shared services page)  
**WRONG TEXT:**
- `title: "Services & Pricing — NRG Houston Web Design"`
- `description: "Web design, automation, local SEO, and hosting for Houston small businesses. Flat pricing, no monthly retainer required."`  
**WHERE IT APPEARS:** `<title>` tag and meta description for `/services`  
**ROOT CAUSE:** Hardcoded strings in page metadata export  
**FILE:** `src/app/services/page.tsx:5-8`  
**SEVERITY:** Medium — Shared page accessed from all location funnels; title tag says "Houston Web Design"  
**SUGGESTED FIX:** `"Services & Pricing — NRG Web Design"` + `"Web design, automation, local SEO, and hosting for small businesses. Flat pricing, no monthly retainer required."`

---

### ISSUE 19: app/contact/page.tsx — Metadata hardcodes "Houston web designer"
**PAGE AFFECTED:** `/contact` (shared contact page)  
**WRONG TEXT:**
- `title: "Contact — NRG Houston Web Design & Automation"`
- `description: "Start a project, or just see if NRG is the right fit. Direct response from a Houston web designer — usually within one business day."`  
**WHERE IT APPEARS:** `<title>` tag and meta description for `/contact`  
**ROOT CAUSE:** Hardcoded strings  
**FILE:** `src/app/contact/page.tsx:5-8`  
**SEVERITY:** Medium — Shared contact page; title and description say "Houston" for Michigan/Texas visitors who navigate directly  
**SUGGESTED FIX:** `"Contact — NRG Web Design & Automation"` + `"Start a project, or just see if NRG is the right fit. Direct response — usually within one business day."`

---

## Acceptable Cases (Not Bugs)

The following grep hits were reviewed and are **not bugs**:

| File | Text | Reason |
|---|---|---|
| `src/lib/testimonials.ts` | `"Williams HVAC · Houston, TX"`, `"Bloom Beauty Studio · Houston Heights, TX"`, `"Nguyen Family Law · Sugar Land, TX"` | Testimonial attribution text — real client locations, always acceptable |
| `src/lib/projects.ts` | `"Anthony Gushow & Sons — excavating website hero"` (imageAlt) | Real client — Gushow IS in Auburn, MI. The imageAlt doesn't actually say Auburn or Michigan. No violation. |
| `src/app/houston/page.tsx` | JSON-LD `"Houston"`, `"Texas"` | Houston-only page, JSON-LD structured data, correct |
| `src/app/michigan/page.tsx` | JSON-LD `"Michigan"` | Michigan-only page, JSON-LD structured data, correct |
| `src/app/sitemap.ts` | Comments `// Houston sub-pages`, etc. | Code comments, never rendered |
| `src/lib/locationContent.ts` | All location strings | The source of truth itself — correct |
| `src/app/houston/*` wrappers | All Houston references in metadata | Houston-specific pages, correct |
| `src/app/texas/*` wrappers | Texas references | Texas-specific, correct |
| `src/app/michigan/*` wrappers | Michigan references | Michigan-specific, correct |
| `ContactPage.tsx:67` | `tel:+19894887309` | Placeholder phone number — unrelated to location text accuracy, tracked separately in CLAUDE.md §14 |

---

## Summary Counts

| Severity | Count |
|---|---|
| Critical | 8 (Issues 1, 2, 3, 4, 5, 6, 10, 11, 12) |
| High | 4 (Issues 7, 8, 13, 14) |
| Medium | 6 (Issues 9, 15, 16, 17, 18, 19) |
| **Total** | **19** |

> Note: Issues are numbered 1–19 but "Critical" count above groups Issues 1, 2, 3, 4, 5, 6, 10, 11, 12 = 9 critical. Recount: Critical=9, High=4, Medium=6. Total=19.

---

## Worst Offender

**`src/components/pages/AboutPage.tsx`** — 5 issues (Issues 4, 5, 6, 7, 8, 9). The entire bio section, the page H1, the skill card, the credential badge, and the image alt text are all hardcoded to Houston. This file alone accounts for 6 issues and needs the most rewiring.

**Second worst:** `src/components/pages/ContactPage.tsx` — 3 issues (Issues 10, 11, 12). The sidebar intro blurb, "Based in" value, and "Serving" line are all hardcoded to Houston.

**Third worst:** `src/components/LocationPage.tsx` — 2 issues (Issues 1, 2). Both are prominent section headings rendered on the homepage for all 4 locations.

---

## Components With No Location Issues (Clean — Fix Agent Can Skip)

- `src/components/Nav.tsx` — Clean. All links use `linkPrefix` prop. No location strings.
- `src/components/HeroHeadline.tsx` — Clean. Static text "Real Clients. Real Websites. Real Results." — no location names.
- `src/components/BrowserMockup.tsx` — Clean. No location strings.
- `src/components/HomepageProjectCard.tsx` — Clean. No location strings (receives title as prop).
- `src/components/ProjectCard.tsx` — Clean. No location strings (receives title as prop).
- `src/components/ServiceCard.tsx` — Clean. No location strings (receives description as prop).
- `src/components/ServiceDetailCard.tsx` — Clean. No location strings (receives `long` as prop from services data).
- `src/components/TestimonialCard.tsx` — Clean. No location strings (renders props only).
- `src/components/SectionHeading.tsx` — Clean. Pure wrapper component.
- `src/components/FloatingCta.tsx` — Clean. No location strings.
- `src/components/StatusPill.tsx` — Clean (if it exists — not present in `src/components/`; likely removed).
- `src/components/AboutSkillCard.tsx` — Clean. Receives all text as props.
- `src/components/Icons.tsx` — Clean. SVG only.
- `src/app/page.tsx` (root) — Clean. Passes `location="root"` to LocationPage; metadata uses `locationContent.root`.
- `src/app/houston/page.tsx` — Clean. Houston-specific page, all Houston references correct.
- `src/app/texas/page.tsx` — Clean. Texas-specific page.
- `src/app/michigan/page.tsx` — Clean. Michigan-specific page.
- `src/app/work/page.tsx` — Clean. Metadata is generic ("Small Business Websites by NRG").
- All 12 location sub-page wrappers (`/houston/work`, `/texas/about`, etc.) — Clean. Metadata is location-correct, all render shared components with `location` prop.
- `src/components/pages/ServicesPage.tsx` — Clean. No hardcoded location strings; uses `linkPrefix` for links.
- `src/components/pages/WorkPage.tsx` — Clean. No hardcoded location strings.
- `src/lib/locationContent.ts` — Clean. Source of truth; each location's content is correctly scoped.
- `src/lib/projects.ts` — Partially clean: `imageAlt` for 3 Houston-named spec projects contains "Houston" (Issue 15, Medium severity). The fallback `title` fields also contain "Houston" but are not the primary render path (overridden by `cardTitles`).
- `src/lib/testimonials.ts` — Clean per rules (attribution text is always acceptable).
- `src/app/robots.ts` — Clean. No location strings.
- `src/app/sitemap.ts` — Clean. URL paths only, no rendered text.

---

## New Content Map Fields Recommended

The following fields need to be added to `locationContent.ts` (and the `LocationContent` type):

| Field Name | Used In | Notes |
|---|---|---|
| `workSectionHeading` | `LocationPage.tsx:112` | Replaces hardcoded "Websites built for real Houston businesses." |
| `aboutTeaserHeadline` | `LocationPage.tsx:262` | Replaces hardcoded "Built for Houston. By someone you can reach." |
| `footerLocation` | `Footer.tsx:26,46` | Replaces hardcoded "Houston, TX" — needs `Footer` to accept `location` or `footerLocation` prop |
| `aboutPageHeadline` | `AboutPage.tsx:53` | Replaces hardcoded "I build the web for Houston's small businesses." |
| `aboutBioParagraph1` | `AboutPage.tsx:70` | Replaces hardcoded first bio paragraph with "Houston small businesses" |
| `aboutBioClosingLine` | `AboutPage.tsx:73` | Replaces hardcoded "Based in Houston. Available for projects now." |
| `aboutLocationBadge` | `AboutPage.tsx:77` | Replaces hardcoded "Houston-based" credential pill |
| `aboutSeoSkillBody` | `AboutPage.tsx:29` | Replaces hardcoded "Show up when Houston customers search for you." in skill card |
| `aboutHeadshotAlt` | `AboutPage.tsx:95` | Replaces hardcoded image alt with "Houston, TX" |
| `contactSidebarBlurb` | `ContactPage.tsx:46` | Replaces hardcoded "Houston-based, so if you'd rather meet in person..." |
| `contactBasedIn` | `ContactPage.tsx:82` | Replaces hardcoded "Houston, TX" in "Based in" block |
| `contactServiceArea` | `ContactPage.tsx:84` | Replaces hardcoded "Serving the greater Houston area." |

**Additionally, for `services.tsx`:** The `short` and `long` descriptions for the Local SEO service contain "Houston". Recommended fix: make them generic rather than adding per-location service descriptions (simpler, and service descriptions don't need to be location-personalized as strongly as page headings). Alternative: add `seoServiceShort` and `seoServiceLong` to content map.

**And for `projects.ts`:** Add `imageAltOverride` per card key to `cardTitles` structure in `locationContent.ts`, or make the base `imageAlt` in `projects.ts` location-generic by removing "Houston Heights" / "Houston" from the alt text.
