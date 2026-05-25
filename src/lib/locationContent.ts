export type LocationSlug = 'root' | 'houston' | 'texas' | 'michigan'

export type LocationContent = {
  heroLocationLine: string | null
  heroSub: string
  workSectionHeading: string
  aboutTeaserHeadline: string
  aboutOpener: string
  aboutParagraph2: string
  ctaBandHeadline: string
  ctaBandSub: string
  footerLocation: string
  metaTitle: string
  metaDescription: string
  navLogoHref: string
  // /about page fields
  aboutPageHeadline: string
  aboutBioParagraph1: string
  aboutBioClosingLine: string
  aboutLocationBadge: string
  aboutSeoSkillBody: string
  aboutHeadshotAlt: string
  // /contact page sidebar fields
  contactSidebarBlurb: string
  contactBasedIn: string
  contactServiceArea: string
  cardTitles: {
    gushow: string
    rewilding: string
    rusticTable: string
    martinezHvac: string
    reyesLaw: string
  }
}

export const locationContent: Record<LocationSlug, LocationContent> = {
  root: {
    heroLocationLine: null,
    // G7 — tightened hero sub
    heroSub: "I build professional websites for small businesses — and the automation behind them that texts you the second a customer reaches out, so no lead slips through.",
    workSectionHeading: "Websites built for real businesses.",
    // R2 — about teaser headline
    aboutTeaserHeadline: "You'll always know who's building your site. It's me.",
    // location-specific first line: root keeps generic opener (no local sentence prepended)
    aboutOpener: "I build websites for small businesses — the kind that show up on Google, look great on a phone, and bring in real customers.",
    // G2 — Fortune 100 replacement, G3 — cut Squarespace + corporate-speak
    aboutParagraph2: "Before starting NRG, I spent two years building and running technology systems inside a Fortune 100 company. Your site stays up, loads fast, and when you call, a real person picks up.",
    ctaBandHeadline: "Ready to get online?",
    // G5 — standardize on "live in about two weeks"
    ctaBandSub: "Most projects are live in about two weeks.",
    footerLocation: "Texas + Michigan",
    metaTitle: "NRG — Web Design + Automation",
    // R5 — rewrite meta description
    metaDescription: "Custom websites and automation for small businesses. Fast to launch, easy to update, built to bring in customers.",
    navLogoHref: "/",
    aboutPageHeadline: "I build websites for small businesses.",
    // R6 — keep one strong anti-agency line here
    aboutBioParagraph1: "I build websites and automation for small businesses — restaurants, trades companies, law offices, salons, and anyone else who deserves a professional web presence without the agency price tag.",
    aboutBioClosingLine: "Available for projects now.",
    aboutLocationBadge: "Independent",
    aboutSeoSkillBody: "Google Business Profile, local search optimization. Show up when customers in your area search for you.",
    aboutHeadshotAlt: "Noah Reuter-Gushow — NRG web designer",
    contactSidebarBlurb: "Currently taking on new projects. Tell me what you need and I'll tell you what it costs — no pressure.",
    contactBasedIn: "Independent operator",
    contactServiceArea: "Serving small businesses across the US.",
    cardTitles: {
      gushow: "Full Web Presence — Excavating Company",
      rewilding: "Brand Site — Nature & Wellness Content Platform",
      rusticTable: "Full Web Presence — Restaurant",
      martinezHvac: "Lead Generation Site — HVAC Company",
      reyesLaw: "Client Acquisition Site — Law Office",
    },
  },
  houston: {
    heroLocationLine: "for Houston small businesses.",
    // G7 — tightened hero sub
    heroSub: "I build professional websites for Houston small businesses — and the automation behind them that texts you the second a customer reaches out, so no lead slips through.",
    workSectionHeading: "Websites built for real Houston businesses.",
    // R2 — about teaser headline
    aboutTeaserHeadline: "You'll always know who's building your site. That's me — and I'm based here in Houston.",
    // location-specific first line: houston — G4 local sentence prepended
    aboutOpener: "I live here in Houston, so when you hire me you're hiring a neighbor, not a call center three time zones away. I build websites for Houston small businesses — the kind that show up on Google, look great on a phone, and bring in real customers from your neighborhood.",
    // G2 — Fortune 100 replacement, G3 — cut Squarespace; G4 — keep "real person picks up"
    aboutParagraph2: "Before starting NRG, I spent two years building and running technology systems inside a Fortune 100 company. I'm now based in Houston, and that means your site stays up, loads fast, and when you call, a real person picks up.",
    ctaBandHeadline: "Ready to get online, Houston?",
    // G5 — standardize on "live in about two weeks"
    ctaBandSub: "Most Houston projects are live in about two weeks.",
    footerLocation: "Houston, TX",
    metaTitle: "NRG — Web Design + Automation for Houston Small Businesses",
    // R5 — rewrite meta description
    metaDescription: "Custom websites and automation for Houston small businesses. Live in about two weeks. Built by someone local.",
    navLogoHref: "/houston",
    aboutPageHeadline: "I build the web for Houston's small businesses.",
    aboutBioParagraph1: "I build websites and automation for Houston small businesses — restaurants, trades companies, law offices, salons, and anyone else who deserves a professional web presence without the agency price tag.",
    aboutBioClosingLine: "Based in Houston. Available for projects now.",
    aboutLocationBadge: "Houston-based",
    aboutSeoSkillBody: "Google Business Profile, local search optimization. Show up when Houston customers search for you.",
    aboutHeadshotAlt: "Noah Reuter-Gushow — NRG web designer based in Houston, TX",
    contactSidebarBlurb: "Currently taking on new projects. Houston-based, so if you'd rather meet in person than trade emails, that works too.",
    contactBasedIn: "Houston, TX",
    contactServiceArea: "Serving the greater Houston area. In-person meetings available.",
    cardTitles: {
      gushow: "Full Web Presence — Excavating Company",
      rewilding: "Brand Site — Nature & Wellness Content Platform",
      rusticTable: "Full Web Presence — Houston Restaurant",
      martinezHvac: "Lead Generation Site — Houston HVAC Company",
      reyesLaw: "Client Acquisition Site — Houston Law Office",
    },
  },
  texas: {
    heroLocationLine: "for Texas small businesses.",
    // G7 — tightened hero sub
    heroSub: "I build professional websites for Texas small businesses — and the automation behind them that texts you the second a customer reaches out, so no lead slips through.",
    workSectionHeading: "Websites built for real Texas businesses.",
    // R2 — about teaser headline
    aboutTeaserHeadline: "You'll always know who's building your site. That's me — local to Texas.",
    // location-specific first line: texas — G4 local sentence prepended
    aboutOpener: "I live here in Texas, so when you hire me you're hiring a neighbor, not a call center three time zones away. I build websites for Texas small businesses — the kind that show up on Google, look great on a phone, and bring in real customers.",
    // G2 — Fortune 100 replacement; G3 — cut Squarespace
    aboutParagraph2: "Before starting NRG, I spent two years building and running technology systems inside a Fortune 100 company. Based in Houston, working across Texas. Your site stays up, loads fast, and when you call, a real person picks up.",
    ctaBandHeadline: "Ready to get your Texas business online?",
    // G5 — standardize on "live in about two weeks"
    ctaBandSub: "Most projects are live in about two weeks.",
    footerLocation: "Texas",
    metaTitle: "NRG — Web Design + Automation for Texas Small Businesses",
    // R5 — rewrite meta description
    metaDescription: "Custom websites and automation for Texas small businesses. Live in about two weeks. Houston-based, working across Texas.",
    navLogoHref: "/texas",
    aboutPageHeadline: "I build websites for Texas small businesses.",
    aboutBioParagraph1: "I build websites and automation for Texas small businesses — restaurants, trades companies, law offices, salons, and anyone else who deserves a professional web presence without the agency price tag.",
    aboutBioClosingLine: "Working across Texas. Available for projects now.",
    aboutLocationBadge: "Texas-based",
    aboutSeoSkillBody: "Google Business Profile, local search optimization. Show up when Texas customers search for you.",
    aboutHeadshotAlt: "Noah Reuter-Gushow — NRG web designer serving Texas",
    contactSidebarBlurb: "Currently taking on new projects across Texas. Houston-based — happy to meet in person if you're nearby, otherwise email or phone works.",
    contactBasedIn: "Texas",
    contactServiceArea: "Serving small businesses across Texas.",
    cardTitles: {
      gushow: "Full Web Presence — Excavating Company",
      rewilding: "Brand Site — Nature & Wellness Content Platform",
      rusticTable: "Full Web Presence — Texas Restaurant",
      martinezHvac: "Lead Generation Site — Texas HVAC Company",
      reyesLaw: "Client Acquisition Site — Texas Law Office",
    },
  },
  michigan: {
    heroLocationLine: "for Michigan small businesses.",
    // G7 — tightened hero sub
    heroSub: "I build professional websites for Michigan small businesses — and the automation behind them that texts you the second a customer reaches out, so no lead slips through.",
    workSectionHeading: "Websites built for real Michigan businesses.",
    // R2 — about teaser headline
    aboutTeaserHeadline: "You'll always know who's building your site. That's me — and I'm from here.",
    // location-specific first line: michigan — G4 local sentence prepended
    aboutOpener: "I grew up in Michigan, so I know this market — and the businesses in it. I build websites for Michigan small businesses — the kind that show up on Google, look great on a phone, and bring in real customers.",
    // G2 — Fortune 100 replacement; G3 — cut Squarespace; G5 — "live in about two weeks"
    aboutParagraph2: "Before starting NRG, I spent two years building and running technology systems inside a Fortune 100 company — including work for Michigan-based enterprise teams. Your site stays up, loads fast, and when you call, a real person picks up.",
    ctaBandHeadline: "Ready to get your Michigan business online?",
    // G5 — standardize on "live in about two weeks"
    ctaBandSub: "Most projects are live in about two weeks.",
    footerLocation: "Michigan",
    metaTitle: "NRG — Web Design + Automation for Michigan Small Businesses",
    // R5 — rewrite meta description; G5 — remove "Michigan roots"
    metaDescription: "Custom websites and automation for Michigan small businesses. Live in about two weeks. Built by someone from here.",
    navLogoHref: "/michigan",
    aboutPageHeadline: "I build websites for Michigan small businesses.",
    aboutBioParagraph1: "I build websites and automation for Michigan small businesses — restaurants, trades companies, law offices, salons, and anyone else who deserves a professional web presence without the agency price tag.",
    // G5 — replace "Michigan roots" with "Michigan-based"
    aboutBioClosingLine: "Michigan-based. Available for projects now.",
    // G5 — replace "Michigan roots" badge
    aboutLocationBadge: "Michigan-based",
    aboutSeoSkillBody: "Google Business Profile, local search optimization. Show up when Michigan customers search for you.",
    aboutHeadshotAlt: "Noah Reuter-Gushow — NRG web designer serving Michigan",
    contactSidebarBlurb: "Currently taking on new projects across Michigan. If you'd rather meet in person than trade emails, that can be arranged.",
    // G5 — fix "Mid-Michigan / Remote"
    contactBasedIn: "Michigan",
    contactServiceArea: "Serving small businesses across Michigan.",
    cardTitles: {
      gushow: "Full Web Presence — Excavating Company",
      rewilding: "Brand Site — Nature & Wellness Content Platform",
      rusticTable: "Full Web Presence — Michigan Restaurant",
      martinezHvac: "Lead Generation Site — Michigan HVAC Company",
      reyesLaw: "Client Acquisition Site — Michigan Law Office",
    },
  },
}
