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
    heroSub: "I build professional websites and the automations that keep your business running — contact alerts, booking confirmations, review requests. All handled.",
    workSectionHeading: "Websites built for real businesses.",
    aboutTeaserHeadline: "Built to be reached. By someone you can talk to.",
    aboutOpener: "I build websites for small businesses — the kind that show up on Google, look great on a phone, and bring in real customers.",
    aboutParagraph2: "Before starting NRG, I spent two years inside the technology infrastructure of one of the largest companies in the world. I bring that same standard of reliability to every project, regardless of size.",
    ctaBandHeadline: "Ready to get online?",
    ctaBandSub: "Most projects are live in 2–3 weeks.",
    footerLocation: "Texas + Michigan",
    metaTitle: "NRG — Web Design + Automation",
    metaDescription: "Professional websites and automation for small businesses. Built fast. Wired to bring in customers.",
    navLogoHref: "/",
    aboutPageHeadline: "I build websites for small businesses.",
    aboutBioParagraph1: "I build websites and automation for small businesses — restaurants, trades companies, law offices, salons, and anyone else who deserves a professional web presence without the agency price tag.",
    aboutBioClosingLine: "Available for projects now.",
    aboutLocationBadge: "Independent",
    aboutSeoSkillBody: "Google Business Profile, local search optimization. Show up when customers in your area search for you.",
    aboutHeadshotAlt: "Noah Reuter-Gushow — NRG web designer",
    contactSidebarBlurb: "Currently taking on new projects. If you'd rather meet in person than trade emails, I'm happy to come to you.",
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
    heroSub: "I build professional websites and the automations that keep your Houston business running — contact alerts, booking confirmations, review requests. All handled.",
    workSectionHeading: "Websites built for real Houston businesses.",
    aboutTeaserHeadline: "Built for Houston. By someone you can reach.",
    aboutOpener: "I build websites for Houston small businesses — the kind that show up on Google, look great on a phone, and bring in real customers from your neighborhood.",
    aboutParagraph2: "Before starting NRG, I spent two years inside the technology infrastructure of one of the largest companies in the world. I'm now based in Houston, bringing that same standard of reliability to local businesses who deserve better than a Squarespace template.",
    ctaBandHeadline: "Ready to get online, Houston?",
    ctaBandSub: "Most Houston projects are live in 2–3 weeks.",
    footerLocation: "Houston, TX",
    metaTitle: "NRG — Web Design + Automation for Houston Small Businesses",
    metaDescription: "Professional websites and automation for Houston small businesses. Local operator. Fast delivery. Wired to bring in customers.",
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
    heroSub: "I build professional websites and the automations that keep your Texas business running — contact alerts, booking confirmations, review requests. All handled.",
    workSectionHeading: "Websites built for real Texas businesses.",
    aboutTeaserHeadline: "Built for Texas. By someone you can reach.",
    aboutOpener: "I build websites for Texas small businesses — the kind that show up on Google, look great on a phone, and bring in real customers.",
    aboutParagraph2: "Based in Houston and working across Texas. Before starting NRG, I spent two years inside the technology infrastructure of one of the largest companies in the world. I bring that same standard of reliability to Texas businesses who are ready to get online and get found.",
    ctaBandHeadline: "Ready to get your Texas business online?",
    ctaBandSub: "Most projects are live in 2–3 weeks.",
    footerLocation: "Texas",
    metaTitle: "NRG — Web Design + Automation for Texas Small Businesses",
    metaDescription: "Professional websites and automation for Texas small businesses. Houston-based operator. Fast delivery. Built to bring in customers.",
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
    heroSub: "I build professional websites and the automations that keep your Michigan business running — contact alerts, booking confirmations, review requests. All handled.",
    workSectionHeading: "Websites built for real Michigan businesses.",
    aboutTeaserHeadline: "Built for Michigan. By someone you can reach.",
    aboutOpener: "I build websites for Michigan small businesses — the kind that show up on Google, look great on a phone, and bring in real customers.",
    aboutParagraph2: "I grew up in Michigan and understand the market. Before starting NRG, I spent two years inside the technology infrastructure of one of the largest companies in the world — including work for Michigan-based enterprise teams. I bring that same reliability to Michigan small businesses who are ready to stop relying on a Facebook page.",
    ctaBandHeadline: "Ready to get your Michigan business online?",
    ctaBandSub: "Most projects are live in 2–3 weeks.",
    footerLocation: "Michigan",
    metaTitle: "NRG — Web Design + Automation for Michigan Small Businesses",
    metaDescription: "Professional websites and automation for Michigan small businesses. Built fast. Wired to bring in customers. Michigan roots.",
    navLogoHref: "/michigan",
    aboutPageHeadline: "I build websites for Michigan small businesses.",
    aboutBioParagraph1: "I build websites and automation for Michigan small businesses — restaurants, trades companies, law offices, salons, and anyone else who deserves a professional web presence without the agency price tag.",
    aboutBioClosingLine: "Michigan roots. Available for projects now.",
    aboutLocationBadge: "Michigan roots",
    aboutSeoSkillBody: "Google Business Profile, local search optimization. Show up when Michigan customers search for you.",
    aboutHeadshotAlt: "Noah Reuter-Gushow — NRG web designer serving Michigan",
    contactSidebarBlurb: "Currently taking on new projects across Michigan. If you'd rather meet in person than trade emails, that can be arranged.",
    contactBasedIn: "Mid-Michigan / Remote",
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
