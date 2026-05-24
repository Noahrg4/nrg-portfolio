export type Project = {
  slug: string;
  category: string;
  title: string;
  outcome: string;
  tags: string[];
  url: string;
  gradient: string;
  monogram?: string;
  imageSrc?: string;
  imageAlt?: string;
};

export const projects: Project[] = [
  // ── Real client work ──────────────────────────────────────────────────────
  {
    slug: "gushow-excavating",
    category: "Excavating & Trades",
    title: "Full Web Presence — Excavating Company",
    outcome:
      "Took an 80-year family business from Facebook-only to a full web presence that now ranks locally across three counties.",
    tags: ["Custom website", "Local SEO", "Quote automation"],
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
    outcome:
      "Built a content hub that matches the warmth of the brand with clean navigation across multiple content categories.",
    tags: ["Custom website", "Content platform", "Editorial design"],
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
    outcome:
      "Built a site that fills reservation slots and surfaces the restaurant in local Google searches.",
    tags: ["Custom website", "Local SEO", "Reservation ready"],
    url: "nrgbuilds.co/work/restaurant",
    gradient: "bg-gradient-to-br from-[#1a1818] via-[#241a14] to-[#0a0a0a]",
    imageSrc: "/work/rustic-table.png",
    imageAlt: "The Rustic Table — Houston Heights restaurant website",
  },
  {
    slug: "houston-hvac",
    category: "HVAC & Trades",
    title: "Lead Generation Site — Houston HVAC Company",
    outcome:
      "A trust-forward site that puts the phone number front and center — quotes come in while the owner is on the job.",
    tags: ["Custom website", "Lead capture", "Contact automation"],
    url: "nrgbuilds.co/work/hvac",
    gradient: "bg-gradient-to-br from-[#0d1b2a] via-[#0f1f2e] to-[#0a0a0a]",
    imageSrc: "/work/martinez-hvac.png",
    imageAlt: "Martinez Cooling & Heating — Houston HVAC website",
  },
  {
    slug: "houston-law",
    category: "Law Office",
    title: "Client Acquisition Site — Houston Law Office",
    outcome:
      "A consultation-focused site that answers the first questions every potential client has before deciding to call.",
    tags: ["Custom website", "Local SEO", "Consultation funnel"],
    url: "nrgbuilds.co/work/law",
    gradient: "bg-gradient-to-br from-[#1b3a2d] via-[#152e22] to-[#0a0a0a]",
    imageSrc: "/work/reyes-law.png",
    imageAlt: "Reyes & Associates — Houston law firm website",
  },
];
