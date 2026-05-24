export type Project = {
  slug: string;
  category: string;
  title: string;
  url: string;
  gradient: string;
  imageSrc?: string;
  imageAlt?: string;
  liveUrl?: string;
};

export const projects: Project[] = [
  // ── Real client work ──────────────────────────────────────────────────────
  {
    slug: "gushow-excavating",
    category: "Excavating & Trades",
    title: "Full Web Presence — Excavating Company",
    url: "nrgbuilds.co/work/excavating",
    gradient: "bg-gradient-to-br from-[#1e1a14] via-[#1a1208] to-[#0a0a0a]",
    imageSrc: "/work/gushow-excavating.png",
    imageAlt:
      "Anthony Gushow & Sons — excavating website hero with CAT excavator and trust strip",
  },
  {
    slug: "rewilding-life",
    category: "Media & Content",
    title: "Brand Site — Nature & Wellness Content Platform",
    url: "nrgbuilds.co/work/media",
    gradient: "bg-gradient-to-br from-[#141e10] via-[#101a14] to-[#0a0a0a]",
    imageSrc: "/work/rewilding-life.png",
    imageAlt:
      "ReWilding Life — nature and wellness content platform hero section",
  },

  // ── Spec / MVP work (replaced by screenshots as they're built) ────────────
  {
    slug: "houston-restaurant",
    category: "Restaurant",
    title: "Full Web Presence — Houston Restaurant",
    url: "nrgbuilds.co/work/restaurant",
    gradient: "bg-gradient-to-br from-[#1a1818] via-[#241a14] to-[#0a0a0a]",
    imageSrc: "/work/rustic-table.png",
    imageAlt: "The Rustic Table — restaurant website",
  },
  {
    slug: "houston-hvac",
    category: "HVAC & Trades",
    title: "Lead Generation Site — Houston HVAC Company",
    url: "nrgbuilds.co/work/hvac",
    gradient: "bg-gradient-to-br from-[#0d1b2a] via-[#0f1f2e] to-[#0a0a0a]",
    imageSrc: "/work/martinez-hvac.png",
    imageAlt: "Martinez Cooling & Heating — HVAC website",
  },
  {
    slug: "houston-law",
    category: "Law Office",
    title: "Client Acquisition Site — Houston Law Office",
    url: "nrgbuilds.co/work/law",
    gradient: "bg-gradient-to-br from-[#1b3a2d] via-[#152e22] to-[#0a0a0a]",
    imageSrc: "/work/reyes-law.png",
    imageAlt: "Reyes & Associates — law firm website",
  },
];
