/**
 * src/lib/admin/types.ts
 *
 * Single source of truth for all admin panel types, constants, and pure
 * utility functions. Imported by both Backend (API routes, db layer) and
 * Frontend (admin UI components).
 *
 * Rules:
 *  - No Node.js-only imports (no 'fs', 'crypto', etc.) — this file must be
 *    importable in Edge runtime (middleware) and browser (client components).
 *  - No React imports — pure TypeScript.
 *  - No framer-motion or Tailwind — visual constants live in components.
 */

// ---------------------------------------------------------------------------
// Pipeline stages
// ---------------------------------------------------------------------------

/**
 * Ordered pipeline stages from first discovery to terminal state.
 * Order matters — UI renders columns in this order.
 */
export const PIPELINE_STAGES = [
  "Found",
  "Researched",
  "Emailed",
  "Called",
  "Follow-up",
  "Proposal",
  "Won",
  "Lost",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

/**
 * Probability that a lead in this stage closes as Won.
 * Used for weighted pipeline value in analytics.
 */
export const STAGE_CLOSE_PROBABILITY: Record<PipelineStage, number> = {
  Found: 0.03,
  Researched: 0.08,
  Emailed: 0.12,
  Called: 0.25,
  "Follow-up": 0.35,
  Proposal: 0.6,
  Won: 1.0,
  Lost: 0.0,
};

/**
 * Stages considered "active" for pipeline value calculation.
 * Won and Lost are terminal and excluded from the active pipeline.
 */
export const ACTIVE_STAGES: PipelineStage[] = [
  "Found",
  "Researched",
  "Emailed",
  "Called",
  "Follow-up",
  "Proposal",
];

/** Terminal stages — no further stage progression expected. */
export const TERMINAL_STAGES: PipelineStage[] = ["Won", "Lost"];

/**
 * Average project value used for pipeline weighting.
 * Midpoint of NRG's typical $500–$1,100 project range.
 */
export const AVG_PROJECT_VALUE = 800;

// ---------------------------------------------------------------------------
// Scoring (v2 — 0–3 weighted scale, normalized to /10, niche-tier gated)
// ---------------------------------------------------------------------------

export type ScoreFactor = 0 | 1 | 2 | 3;

/**
 * Per-factor weights. Three user-input factors + one niche-fit factor
 * (derived from `niche` via getNicheFitFromNiche).
 *
 * Raw max = 3*3 + 3*2.5 + 3*1.5 + 3*2 = 27.
 * Final score is normalized to /10 then gated when niche tier is low.
 */
export const SCORE_WEIGHTS = {
  webOpportunity: 3,
  provenMoney: 2.5,
  reachableDecisionMaker: 1.5,
  nicheFit: 2,
} as const satisfies Record<string, number>;

/** Raw max = 3*3 + 3*2.5 + 3*1.5 + 3*2 = 27 */
export const SCORE_RAW_MAX = 27;
/** Cap applied to the final /10 score when niche tier is LOW. */
export const NICHE_GATE_CAP = 3;

export type ScoreFactors = {
  /** 0 = good modern site · 1 = dated-but-works · 2 = FB-only/thin · 3 = none or broken/404 */
  webOpportunity: ScoreFactor;
  /** 0 = no signal · 1 = some reviews/activity · 2 = strong (100+ reviews) · 3 = clearly thriving */
  provenMoney: ScoreFactor;
  /** 0 = corporate/gatekept · 1 = generic contact · 2 = owner findable · 3 = owner direct (talked) */
  reachableDecisionMaker: ScoreFactor;
};

/** Anchor labels for each factor at each 0–3 level. Used by UI hints. */
export const SCORE_ANCHORS: Record<keyof ScoreFactors, [string, string, string, string]> = {
  webOpportunity: [
    "good modern site",
    "dated-but-works",
    "FB-only/thin",
    "none or broken/404",
  ],
  provenMoney: [
    "no signal",
    "some reviews/activity",
    "strong (100+ reviews)",
    "clearly thriving",
  ],
  reachableDecisionMaker: [
    "corporate/gatekept",
    "generic contact",
    "owner findable",
    "owner direct (talked)",
  ],
};

/** Human-readable label for each scoring factor. */
export const SCORE_LABELS: Record<keyof ScoreFactors, string> = {
  webOpportunity: "Web Opportunity",
  provenMoney: "Proven Money",
  reachableDecisionMaker: "Reachable Decision-Maker",
};

/**
 * Niche-fit value derived from niche selection.
 *   high → 3, medium → 2, low → 0 (also triggers the gate cap).
 *
 * Note: 1 is intentionally unused — niche fit is tier-derived, not graded.
 */
export function getNicheFitFromNiche(niche: string): 0 | 2 | 3 {
  const tier = getNicheTier(niche);
  if (tier === "high") return 3;
  if (tier === "medium") return 2;
  return 0; // low
}

/**
 * Compute the normalized /10 lead score from factors + niche.
 * If niche tier is LOW, caps the result at NICHE_GATE_CAP (3.0).
 *
 * Called on every Lead PATCH that touches scoreFactors or niche, and on
 * every read (via migrateLead) to keep stored scores current with the model.
 */
export function computeScore(factors: ScoreFactors, niche: string): number {
  const fit = getNicheFitFromNiche(niche);
  const raw =
    factors.webOpportunity * SCORE_WEIGHTS.webOpportunity +
    factors.provenMoney * SCORE_WEIGHTS.provenMoney +
    factors.reachableDecisionMaker * SCORE_WEIGHTS.reachableDecisionMaker +
    fit * SCORE_WEIGHTS.nicheFit;
  const normalized = (raw / SCORE_RAW_MAX) * 10;
  if (getNicheTier(niche) === "low") {
    return Math.min(normalized, NICHE_GATE_CAP);
  }
  return normalized;
}

/**
 * True when the score is being capped by the niche gate (low-tier niche).
 * UI uses this to display a "capped at 3" warning beside the score badge.
 */
export function isScoreCappedByNiche(factors: ScoreFactors, niche: string): boolean {
  if (getNicheTier(niche) !== "low") return false;
  const fit = getNicheFitFromNiche(niche);
  const raw =
    factors.webOpportunity * SCORE_WEIGHTS.webOpportunity +
    factors.provenMoney * SCORE_WEIGHTS.provenMoney +
    factors.reachableDecisionMaker * SCORE_WEIGHTS.reachableDecisionMaker +
    fit * SCORE_WEIGHTS.nicheFit;
  return (raw / SCORE_RAW_MAX) * 10 > NICHE_GATE_CAP;
}

/** Default factors for a brand-new lead. */
export const DEFAULT_SCORE_FACTORS: ScoreFactors = {
  webOpportunity: 0,
  provenMoney: 0,
  reachableDecisionMaker: 0,
};

/**
 * Score thresholds for the hot/warm/cold badge.
 * Inclusive lower bound. Still operates on the /10 score range.
 */
export const SCORE_TIERS = {
  hot: 7,   // score >= 7
  warm: 4,  // score >= 4
  // cold: anything below 4
} as const;

export type ScoreTier = "hot" | "warm" | "cold";

export function getScoreTier(score: number): ScoreTier {
  if (score >= SCORE_TIERS.hot) return "hot";
  if (score >= SCORE_TIERS.warm) return "warm";
  return "cold";
}

// ---- Legacy migration ------------------------------------------------------

/** Old boolean-toggle shape (kept ONLY for migrating data on read). */
type LegacyScoreFactors = {
  badOrNoWebsite: boolean;
  clearlyMakingMoney: boolean;
  easyToReach: boolean;
  goodNicheFit: boolean;
};

function isLegacyScoreFactors(sf: unknown): sf is LegacyScoreFactors {
  return (
    !!sf &&
    typeof sf === "object" &&
    "badOrNoWebsite" in (sf as object)
  );
}

/**
 * Convert a possibly-legacy scoreFactors blob to the new shape.
 *  - Old true → new 2 (the "moderate" middle value — safest assumption)
 *  - Old false → new 0
 *  - goodNicheFit (old) is dropped; niche fit is now derived from `niche`
 *  - If already new shape: clamp values to 0..3 ints
 *  - If garbage / undefined: return a copy of DEFAULT_SCORE_FACTORS
 */
export function migrateScoreFactors(sf: unknown): ScoreFactors {
  if (!sf || typeof sf !== "object") return { ...DEFAULT_SCORE_FACTORS };
  if (isLegacyScoreFactors(sf)) {
    return {
      webOpportunity: sf.badOrNoWebsite ? 2 : 0,
      provenMoney: sf.clearlyMakingMoney ? 2 : 0,
      reachableDecisionMaker: sf.easyToReach ? 2 : 0,
    };
  }
  const obj = sf as Record<string, unknown>;
  const clamp = (v: unknown): ScoreFactor => {
    const n = typeof v === "number" ? Math.round(v) : 0;
    if (n <= 0) return 0;
    if (n >= 3) return 3;
    return n as ScoreFactor;
  };
  return {
    webOpportunity: clamp(obj.webOpportunity),
    provenMoney: clamp(obj.provenMoney),
    reachableDecisionMaker: clamp(obj.reachableDecisionMaker),
  };
}

// ---------------------------------------------------------------------------
// Existing-website marker
// ---------------------------------------------------------------------------

export const EXISTING_SITE_STATUSES = ["unknown", "hasSite", "noSite"] as const;
export type ExistingSiteStatus = (typeof EXISTING_SITE_STATUSES)[number];

export const EXISTING_SITE_DEFAULT: ExistingSiteStatus = "unknown";

/**
 * Read a lead's existing-site marker, defaulting to "unknown" for legacy
 * records that don't have the field set.
 */
export function getExistingSiteStatus(lead: { existingSiteStatus?: ExistingSiteStatus }): ExistingSiteStatus {
  return lead.existingSiteStatus ?? EXISTING_SITE_DEFAULT;
}

// ---------------------------------------------------------------------------
// Niche
// ---------------------------------------------------------------------------

export const NICHE_OPTIONS = [
  "Restaurant",
  "Salon",
  "Retail",
  "Dental/Medical",
  "Lodging",
  "HVAC",
  "Trades",
  "Law",
  "Other",
  "B2B/Industrial",
  "Contractor (B2G)",
] as const;
export type Niche = (typeof NICHE_OPTIONS)[number];

export type NicheTier = "high" | "medium" | "low";

/**
 * Tier classification — does a website actually drive revenue for this niche?
 *   high   = web is core to revenue (Restaurant, Salon, Retail, Dental/Medical, Lodging)
 *   medium = web helps but isn't primary (HVAC, Trades, Law, Other)
 *   low    = web doesn't drive revenue; B2B/relationship/bid-driven sales
 *            (B2B/Industrial, Contractor (B2G))
 *
 * Used by the scoring system to gate leads where the niche fundamentally
 * doesn't fit NRG's value proposition.
 */
const NICHE_TIER_MAP: Record<string, NicheTier> = {
  Restaurant: "high",
  Salon: "high",
  Retail: "high",
  "Dental/Medical": "high",
  Lodging: "high",
  HVAC: "medium",
  Trades: "medium",
  Law: "medium",
  Other: "medium",
  "B2B/Industrial": "low",
  "Contractor (B2G)": "low",
};

export function getNicheTier(niche: string): NicheTier {
  return NICHE_TIER_MAP[niche] ?? "medium"; // unknown / legacy → medium
}

/** Per-tier label for chips / hints */
export const NICHE_TIER_LABEL: Record<NicheTier, string> = {
  high:   "High fit",
  medium: "Medium fit",
  low:    "Low fit — gated",
};

// ---------------------------------------------------------------------------
// Owner — who's working this lead (Noah / Bela / unassigned)
// ---------------------------------------------------------------------------

export const LEAD_OWNERS = ["Noah", "Bela"] as const;
export type LeadOwner = (typeof LEAD_OWNERS)[number];

/**
 * Read a lead's owner. Returns null when the lead is unassigned (existing
 * leads pre-dating this field; intentional null choice rather than a string
 * "unassigned" so type-checks can lean on it).
 */
export function getLeadOwner(lead: { owner?: LeadOwner | null }): LeadOwner | null {
  return lead.owner ?? null;
}

// ---------------------------------------------------------------------------
// Stage history
// ---------------------------------------------------------------------------

/**
 * Immutable record of a single stage transition.
 * Append-only — never mutate existing entries.
 * `at` is an ISO 8601 string (new Date().toISOString()).
 *
 * Used for Phase-2 velocity analytics:
 *   time-in-stage = stageHistory[i+1].at - stageHistory[i].at
 */
export type StageHistoryEntry = {
  stage: PipelineStage;
  at: string; // ISO 8601
};

// ---------------------------------------------------------------------------
// Lead
// ---------------------------------------------------------------------------

export type Lead = {
  /** UUID v4, generated by crypto.randomUUID() at creation. */
  id: string;

  /** Business trading name. */
  businessName: string;

  /**
   * Industry / niche category.
   * Free-text but encouraged to be consistent: restaurant, HVAC, law, salon,
   * trades, retail, medical, other.
   */
  niche: string;

  /**
   * Houston neighborhood or city area (e.g. "Midtown", "Sugar Land", "Heights").
   * Used to prioritize local outreach.
   */
  neighborhood: string;

  /** Business phone number — copied to Client on conversion. */
  phone: string;

  /** Business or contact email — copied to Client on conversion. */
  email: string;

  /** Name of the decision-maker, if known. */
  contactName: string;

  /**
   * Free-form notes about the lead.
   * Prepended to Client.notes on conversion.
   */
  notes: string;

  /**
   * How the lead was discovered.
   * Free-text, e.g.: "Google Maps cold", "walk-in", "referral from X",
   * "inbound /contact form".
   * Kept raw for Phase-2 source-channel bucketing.
   */
  source: string;

  /** Current pipeline stage. */
  stage: PipelineStage;

  /**
   * Append-only log of all stage transitions.
   * First entry is always the creation stage (typically "Found").
   * Never mutate — only push new entries.
   */
  stageHistory: StageHistoryEntry[];

  /** Boolean factors driving the computed score. */
  scoreFactors: ScoreFactors;

  /**
   * Computed score in [0.0, 9.0].
   * Denormalized for fast sort/filter. Must be recomputed via computeScore()
   * whenever scoreFactors changes.
   */
  score: number;

  /**
   * Total number of meaningful outreach touches.
   * Incremented manually by owner, or auto-incremented when emailedAt/calledAt
   * are set via PATCH.
   */
  touchCount: number;

  /** ISO timestamp of the last email sent to this lead. Null if not yet emailed. */
  emailedAt: string | null;

  /** ISO timestamp of the last phone call to this lead. Null if not yet called. */
  calledAt: string | null;

  /**
   * ISO date string (YYYY-MM-DD) for the next scheduled follow-up.
   * Null if no follow-up is scheduled.
   * Used by the analytics endpoint to surface overdue/today follow-ups.
   */
  followUpAt: string | null;

  /**
   * Explicit follow-up needed flag. Independent of a specific date.
   * - true  → follow-up needed (with or without a date)
   * - false → no follow-up needed (followUpAt should also be null)
   * - undefined (existing leads) → infer from followUpAt !== null for back-compat
   */
  needsFollowUp?: boolean;

  /**
   * Web presence marker — separate from scoring.
   *   "hasSite" → has an existing website (upgrade/replacement opportunity)
   *   "noSite"  → confirmed no website (greenfield)
   *   "unknown" → haven't checked yet (default for new + legacy leads)
   *
   * Optional for back-compat: existing leads without this field render as
   * "unknown" via the EXISTING_SITE_DEFAULT helper.
   */
  existingSiteStatus?: ExistingSiteStatus;

  /**
   * Short description of the next action to take.
   * E.g. "Send follow-up email", "Call back Tuesday", "Send proposal PDF".
   */
  nextActionNote: string;

  /**
   * Manual hotness rating — how likely this lead is to close, set after they
   * have responded to an email or call. Integer 1–5 (1 = lukewarm interest,
   * 5 = almost certain). Null means not yet rated.
   *
   * Distinct from the computed `score` (which is based on boolean research
   * factors). This is a subjective, post-contact signal.
   *
   * Optional for back-compat: existing leads without this field render as null.
   */
  hotness?: number | null;

  /**
   * Which team member is working this lead. Null = unassigned (default for
   * leads created before owner-tracking existed, and for new leads where
   * the user hasn't picked an owner yet).
   *
   * Optional for back-compat: existing leads without this field render as null.
   */
  owner?: LeadOwner | null;

  /**
   * Set to the Client.id after successful convert-to-client operation.
   * Null while lead is in pre-Won stages.
   * A non-null value does NOT mean the lead stage is Won — check stage too.
   */
  convertedClientId: string | null;

  /** ISO timestamp of lead creation. Set once at POST, never updated. */
  createdAt: string;

  /** ISO timestamp of last mutation. Updated on every PATCH. */
  updatedAt: string;
};

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export type ClientStatus = "active" | "paused" | "churned";

export type Client = {
  /** UUID v4, generated by crypto.randomUUID() at creation. */
  id: string;

  /** Business trading name. */
  businessName: string;

  /** Primary contact name. */
  contactName: string;

  /** Business phone number. */
  phone: string;

  /** Business or contact email. */
  email: string;

  /** Live URL of the site NRG built. Empty string if not yet live. */
  siteUrl: string;

  /**
   * Recurring monthly charge in USD.
   * 0 if client has no monthly retainer (one-time project only).
   */
  monthlyCharge: number;

  /**
   * One-time project value in USD.
   * Includes design, build, and any one-time setup fees.
   */
  oneTimeValue: number;

  /** ISO date string (YYYY-MM-DD) of project start / first invoice. */
  startDate: string;

  /** Current engagement status. */
  status: ClientStatus;

  /**
   * ISO timestamp of the last invoice sent.
   * Null if never invoiced (client just created, or one-time project not yet billed).
   */
  lastInvoicedAt: string | null;

  /**
   * ISO timestamp of the last time NRG checked that the client's site is
   * still live and healthy.
   */
  lastVerifiedAt: string | null;

  /**
   * Free-form notes.
   * Pre-populated on conversion: "Converted from lead — " + Lead.notes
   */
  notes: string;

  /**
   * The Lead.id that this client was converted from.
   * Null for clients added directly without a lead record.
   * Used for Phase-2 source-channel revenue attribution.
   */
  sourceLeadId: string | null;

  /** ISO timestamp of client record creation. Set once, never updated. */
  createdAt: string;

  /** ISO timestamp of last mutation. Updated on every PATCH. */
  updatedAt: string;
};

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

/**
 * Full analytics payload returned by GET /api/admin/analytics.
 * All numbers. No strings except ISO timestamps in deferred fields.
 */
export type AnalyticsPayload = {
  // --- Revenue ---

  /** Sum of monthlyCharge for all clients with status === "active". */
  totalMrr: number;

  /** Sum of oneTimeValue for all clients (all statuses, all time). */
  totalOneTimeRevenue: number;

  /**
   * Average one-time project value.
   * totalOneTimeRevenue / total client count. 0 if no clients.
   */
  avgOneTimeValue: number;

  // --- Pipeline ---

  /**
   * Weighted pipeline value.
   * Sum over ACTIVE_STAGES leads: AVG_PROJECT_VALUE * STAGE_CLOSE_PROBABILITY[stage]
   */
  activePipelineValue: number;

  /** Count of leads in each stage. Every stage key is present (0 if none). */
  leadsByStage: Record<PipelineStage, number>;

  /** Total lead records (all stages, all time). */
  totalLeads: number;

  /** Total leads with stage === "Won". */
  totalWon: number;

  /** Total leads with stage === "Lost". */
  totalLost: number;

  /**
   * Win rate as a decimal (0–1).
   * totalWon / (totalWon + totalLost). Returns 0 if both are 0.
   */
  winRate: number;

  // --- Outreach ---

  /** Sum of touchCount across all leads. */
  totalTouches: number;

  /** Count of leads with emailedAt !== null. */
  leadsEmailed: number;

  /**
   * Email response rate as a decimal (0–1).
   * Numerator: leads in stages Called, Follow-up, Proposal, Won.
   * Denominator: leadsEmailed.
   * Returns null if leadsEmailed === 0.
   *
   * Phase-2: compare against benchmarks 3.43% avg / 5% good / 10% great.
   */
  emailResponseRate: number | null;

  // --- Clients ---

  /** Count of clients with status === "active". */
  activeClients: number;

  /** Count of clients with status === "paused". */
  pausedClients: number;

  /** Count of clients with status === "churned". */
  churnedClients: number;

  // --- Follow-up urgency ---

  /**
   * Count of leads where followUpAt < today's date (ISO YYYY-MM-DD),
   * and stage is not Won or Lost.
   * These are overdue — owner should action them.
   */
  overdueFollowUps: number;

  /**
   * Count of leads where followUpAt === today's date (ISO YYYY-MM-DD),
   * and stage is not Won or Lost.
   */
  followUpsToday: number;

  // --- Score distribution ---

  /** Leads with score >= SCORE_TIERS.hot (7). */
  hotLeads: number;

  /** Leads with score >= SCORE_TIERS.warm (4) and < SCORE_TIERS.hot (7). */
  warmLeads: number;

  /** Leads with score < SCORE_TIERS.warm (4). */
  coldLeads: number;
};

// ---------------------------------------------------------------------------
// API request/response shapes
// ---------------------------------------------------------------------------

/** Body for POST /api/admin/leads */
export type CreateLeadBody = Omit<
  Lead,
  "id" | "score" | "stageHistory" | "touchCount" | "convertedClientId" | "createdAt" | "updatedAt"
>;

/** Body for PATCH /api/admin/leads/[id] — all fields optional */
export type UpdateLeadBody = Partial<
  Omit<Lead, "id" | "score" | "stageHistory" | "createdAt">
>;

/** Body for POST /api/admin/clients */
export type CreateClientBody = Omit<
  Client,
  "id" | "createdAt" | "updatedAt"
>;

/** Body for PATCH /api/admin/clients/[id] — all fields optional */
export type UpdateClientBody = Partial<Omit<Client, "id" | "createdAt">>;

/** Body for POST /api/admin/leads/[id]/convert */
export type ConvertLeadBody = {
  monthlyCharge: number;
  oneTimeValue: number;
  siteUrl: string;
  startDate: string; // ISO YYYY-MM-DD
};

/** Response from POST /api/admin/leads/[id]/convert */
export type ConvertLeadResponse = {
  lead: Lead;
  client: Client;
};

/** Generic API error response shape */
export type ApiError = {
  error: string;
  details?: string;
};

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Total lifetime value of a client.
 * One-time project value + (monthly charge * 12 months as proxy for a year).
 * Simple approximation — not account for churn date.
 */
export function lifetimeValue(client: Client): number {
  return client.oneTimeValue + client.monthlyCharge * 12;
}

/**
 * Returns true when a lead has an active follow-up requirement.
 * Respects the explicit `needsFollowUp` flag when set; otherwise infers
 * from `followUpAt !== null` for backward compatibility with existing leads.
 */
export function isFollowUpNeeded(lead: Lead): boolean {
  return lead.needsFollowUp ?? (lead.followUpAt !== null);
}

/**
 * Today's date as an ISO YYYY-MM-DD string (in local time).
 * Used for follow-up overdue/today calculations.
 * Note: runs in Node.js context — uses local server time zone.
 */
export function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
