# SEO Implementation Log

## Canonical Tags
- `/` → `alternates.canonical: https://nrgwebsites.com` ✓
- `/houston` → `alternates.canonical: https://nrgwebsites.com/houston` ✓
- `/texas` → `alternates.canonical: https://nrgwebsites.com/texas` ✓
- `/michigan` → `alternates.canonical: https://nrgwebsites.com/michigan` ✓

## Meta Titles (unique per page)
- `/` — "NRG — Web Design + Automation"
- `/houston` — "NRG — Web Design + Automation for Houston Small Businesses"
- `/texas` — "NRG — Web Design + Automation for Texas Small Businesses"
- `/michigan` — "NRG — Web Design + Automation for Michigan Small Businesses"

## Meta Descriptions (unique per page, under 160 chars)
- `/` — "Professional websites and automation for small businesses. Built fast. Wired to bring in customers." (98 chars) ✓
- `/houston` — "Professional websites and automation for Houston small businesses. Local operator. Fast delivery. Wired to bring in customers." (125 chars) ✓
- `/texas` — "Professional websites and automation for Texas small businesses. Houston-based operator. Fast delivery. Built to bring in customers." (132 chars) ✓
- `/michigan` — "Professional websites and automation for Michigan small businesses. Built fast. Wired to bring in customers. Michigan roots." (123 chars) ✓

## JSON-LD Structured Data
- `/houston`: LocalBusiness + ProfessionalService schema added ✓
  - areaServed: City "Houston" → State "Texas"
  - url: https://nrgwebsites.com/houston
- `/michigan`: LocalBusiness + ProfessionalService schema added ✓
  - areaServed: State "Michigan"
  - url: https://nrgwebsites.com/michigan

## Sitemap
- `src/app/sitemap.ts`: created with 8 URLs ✓
  - https://nrgwebsites.com (priority 1.0)
  - https://nrgwebsites.com/houston (priority 0.9)
  - https://nrgwebsites.com/texas (priority 0.9)
  - https://nrgwebsites.com/michigan (priority 0.9)
  - https://nrgwebsites.com/work (priority 0.8)
  - https://nrgwebsites.com/services (priority 0.7)
  - https://nrgwebsites.com/about (priority 0.6)
  - https://nrgwebsites.com/contact (priority 0.5)
- Served at: https://nrgwebsites.com/sitemap.xml (confirmed in build output)

## Robots
- `src/app/robots.ts`: created — all pages crawlable ✓
  - userAgent: * — allow: /
  - sitemap: https://nrgwebsites.com/sitemap.xml
- Served at: https://nrgwebsites.com/robots.txt (confirmed in build output)

## Additional Fix
- `src/app/layout.tsx`: corrected `metadataBase` from `https://nrg.example.com` to `https://nrgwebsites.com` ✓
  - This ensures OpenGraph and canonical URL resolution works correctly across all pages.

## Manual Steps Still Needed (Noah must do these)
1. Verify domain in Google Search Console (https://search.google.com/search-console)
2. Submit https://nrgwebsites.com/sitemap.xml to Search Console
3. Monitor each location page's indexing status after launch
4. Set up Google Business Profile with /houston as the primary URL
