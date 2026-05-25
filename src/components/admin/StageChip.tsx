"use client";

/**
 * src/components/admin/StageChip.tsx
 *
 * Pill badge for pipeline stage. Color-coded by stage group:
 *
 *   Won        → cyan fill (bg-accent text-canvas) — strongest signal
 *   Proposal   → cyan outline (border-accent text-accent)
 *   Follow-up  → amber outline
 *   Lost       → dim hairline outline, ink-subtle text — de-emphasized
 *   Found / Researched / Emailed / Called
 *              → neutral pill (bg-surface-2, border-hairline, ink-secondary)
 *
 * Size variants: "sm" (tight) | "md" (default)
 */

import type { PipelineStage } from "@/lib/admin/types";

const STAGE_STYLES: Record<PipelineStage, string> = {
  // Terminal — won: most prominent
  Won:         "bg-accent text-canvas border-accent",

  // Late active — proposal: cyan outline
  Proposal:    "border border-accent text-accent bg-transparent",

  // Mid active — follow-up: amber outline
  "Follow-up": "border border-[rgba(245,166,35,0.5)] bg-[rgba(245,166,35,0.08)] text-[#F5A623]",

  // Early-mid active: neutral
  Called:      "border border-hairline bg-surface-2 text-ink-secondary",
  Emailed:     "border border-hairline bg-surface-2 text-ink-secondary",
  Researched:  "border border-hairline bg-surface-2 text-ink-secondary",
  Found:       "border border-hairline bg-surface-2 text-ink-secondary",

  // Terminal — lost: de-emphasized
  Lost:        "border border-hairline text-ink-subtle bg-transparent",
};

interface StageChipProps {
  stage: PipelineStage;
  size?: "sm" | "md";
}

export default function StageChip({ stage, size = "md" }: StageChipProps) {
  const sizeClass =
    size === "sm"
      ? "px-2 py-0.5 text-[9px]"
      : "px-2.5 py-1 text-[10px]";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full font-mono uppercase tracking-wider whitespace-nowrap",
        sizeClass,
        STAGE_STYLES[stage],
      ].join(" ")}
    >
      {stage}
    </span>
  );
}
