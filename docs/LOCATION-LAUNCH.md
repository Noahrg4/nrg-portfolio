# Location Pages — Launch Checklist

## Status: READY TO DEPLOY

All 5 agents completed. QA passed. Build clean (15 static pages, 0 TypeScript errors).

---

## What Was Built

| Route | Purpose | Status |
|---|---|---|
| `/` | Root homepage (generic) | ✓ Updated |
| `/houston` | Houston-specific landing page | ✓ New |
| `/texas` | Texas-specific landing page | ✓ New |
| `/michigan` | Michigan-specific landing page | ✓ New |

Each location page has:
- Location-scoped hero headline + subtext
- Location-scoped about section
- Location-scoped CTA band and contact section
- Location-scoped project card titles (Houston/Michigan)
- Unique meta title + meta description
- Canonical tag pointing to its own URL
- Logo (nav + footer) linking back to the location page

Houston + Michigan additionally have JSON-LD `LocalBusiness + ProfessionalService` structured data.

---

## Architecture

```
src/lib/locationContent.ts       — Single source of truth for all location copy
src/components/LocationPage.tsx  — Shared template used by all 4 pages
src/app/page.tsx                 — Root: <LocationPage location="root" />
src/app/houston/page.tsx         — Houston: <LocationPage location="houston" /> + JSON-LD
src/app/texas/page.tsx           — Texas: <LocationPage location="texas" />
src/app/michigan/page.tsx        — Michigan: <LocationPage location="michigan" /> + JSON-LD
src/app/sitemap.ts               — 8-URL sitemap (all routes)
src/app/robots.ts                — Allow all, sitemap declared
src/components/Nav.tsx           — logoHref prop added
src/components/Footer.tsx        — logoHref prop added
```

---

## SEO

- **Canonical tags**: all 4 location pages set correctly
- **Sitemap**: `/sitemap.xml` — 8 URLs (4 location + work, about, services, contact)
- **robots.txt**: `/robots.txt` — allow `*`, sitemap declared
- **metadataBase**: `https://nrgbuilds.com` (corrected from placeholder)
- **JSON-LD**: Houston (City-level), Michigan (State-level)

---

## Deploy Steps (Netlify)

1. Push this branch to GitHub (see hosting setup notes)
2. Netlify auto-deploys on push to main
3. After deploy, verify:
   - `https://nrgbuilds.com/houston` loads with "for Houston small businesses." headline
   - `https://nrgbuilds.com/texas` loads with "for Texas small businesses." headline  
   - `https://nrgbuilds.com/michigan` loads with "for Michigan small businesses." headline
   - `https://nrgbuilds.com/sitemap.xml` returns 8 URLs
   - `https://nrgbuilds.com/robots.txt` returns "allow /"

---

## Post-Launch SEO Steps (Noah must do these manually)

1. **Google Search Console** — verify domain at search.google.com/search-console
2. **Submit sitemap** — submit `https://nrgbuilds.com/sitemap.xml` in Search Console
3. **Monitor indexing** — check each location page's coverage status after 1–2 weeks
4. **Google Business Profile** — set primary URL to `https://nrgbuilds.com/houston`

---

## Docs Written This Build

- `docs/LOCATION-CONTENT.md` — Full copy reference for all 4 locations
- `docs/SEO-IMPLEMENTATION.md` — SEO audit log
- `docs/LINK-MAP.md` — Internal link audit (60 links, 0 broken)
- `docs/LOCATION-LAUNCH.md` — This file
