export type LocationSlug = 'root' | 'houston' | 'texas' | 'michigan'

export type LocationContent = {
  heroLocationLine: string | null
  heroSub: string
  workSectionSub: string
  aboutOpener: string
  aboutParagraph2: string
  ctaBandHeadline: string
  ctaBandSub: string
  contactHeadline: string
  contactSub: string
  metaTitle: string
  metaDescription: string
  internalLinkPrefix: string
  navLogoHref: string
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
    workSectionSub: "A selection of recent work.",
    aboutOpener: "I build websites for small businesses — the kind that show up on Google, look great on a phone, and bring in real customers.",
    aboutParagraph2: "Before starting NRG, I spent two years inside the technology infrastructure of one of the largest companies in the world. I bring that same standard of reliability to every project, regardless of size.",
    ctaBandHeadline: "Ready to get online?",
    ctaBandSub: "Most projects are live in 2–3 weeks.",
    contactHeadline: "Let's talk about your project.",
    contactSub: "Tell me what you need. I'll tell you what it costs and how long it takes.",
    metaTitle: "NRG — Web Design + Automation",
    metaDescription: "Professional websites and automation for small businesses. Built fast. Wired to bring in customers.",
    internalLinkPrefix: "",
    navLogoHref: "/",
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
    workSectionSub: "Websites built for Houston businesses.",
    aboutOpener: "I build websites for Houston small businesses — the kind that show up on Google, look great on a phone, and bring in real customers from your neighborhood.",
    aboutParagraph2: "Before starting NRG, I spent two years inside the technology infrastructure of one of the largest companies in the world. I'm now based in Houston, bringing that same standard of reliability to local businesses who deserve better than a Squarespace template.",
    ctaBandHeadline: "Ready to get online, Houston?",
    ctaBandSub: "Most Houston projects are live in 2–3 weeks.",
    contactHeadline: "Let's talk about your Houston project.",
    contactSub: "Tell me about your business. I'll tell you what it costs and how long it takes. No agencies, no runaround.",
    metaTitle: "NRG — Web Design + Automation for Houston Small Businesses",
    metaDescription: "Professional websites and automation for Houston small businesses. Local operator. Fast delivery. Wired to bring in customers.",
    internalLinkPrefix: "/houston",
    navLogoHref: "/houston",
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
    workSectionSub: "Websites built for Texas businesses.",
    aboutOpener: "I build websites for Texas small businesses — the kind that show up on Google, look great on a phone, and bring in real customers.",
    aboutParagraph2: "Based in Houston and working across Texas. Before starting NRG, I spent two years inside the technology infrastructure of one of the largest companies in the world. I bring that same standard of reliability to Texas businesses who are ready to get online and get found.",
    ctaBandHeadline: "Ready to get your Texas business online?",
    ctaBandSub: "Most projects are live in 2–3 weeks.",
    contactHeadline: "Let's talk about your project.",
    contactSub: "Tell me about your business. I'll tell you what it costs and how long it takes.",
    metaTitle: "NRG — Web Design + Automation for Texas Small Businesses",
    metaDescription: "Professional websites and automation for Texas small businesses. Houston-based operator. Fast delivery. Built to bring in customers.",
    internalLinkPrefix: "/texas",
    navLogoHref: "/texas",
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
    workSectionSub: "Websites built for Michigan businesses.",
    aboutOpener: "I build websites for Michigan small businesses — the kind that show up on Google, look great on a phone, and bring in real customers.",
    aboutParagraph2: "I grew up in Michigan and understand the market. Before starting NRG, I spent two years inside the technology infrastructure of one of the largest companies in the world — including work for Michigan-based enterprise teams. I bring that same reliability to Michigan small businesses who are ready to stop relying on a Facebook page.",
    ctaBandHeadline: "Ready to get your Michigan business online?",
    ctaBandSub: "Most projects are live in 2–3 weeks.",
    contactHeadline: "Let's talk about your project.",
    contactSub: "Tell me about your business. I'll tell you what it costs and how long it takes.",
    metaTitle: "NRG — Web Design + Automation for Michigan Small Businesses",
    metaDescription: "Professional websites and automation for Michigan small businesses. Built fast. Wired to bring in customers. Michigan roots.",
    internalLinkPrefix: "/michigan",
    navLogoHref: "/michigan",
    cardTitles: {
      gushow: "Full Web Presence — Excavating Company",
      rewilding: "Brand Site — Nature & Wellness Content Platform",
      rusticTable: "Full Web Presence — Restaurant",
      martinezHvac: "Lead Generation Site — HVAC Company",
      reyesLaw: "Client Acquisition Site — Law Office",
    },
  },
}
