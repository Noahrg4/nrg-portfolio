"use client";

/**
 * src/components/admin/StageChip.tsx
 *
 * Pill badge for pipeline stage. Color-coded:
 *   - Early stages (Found, Researched)  → ink-subtle
 *   - Mid stages (Emailed, Called)       → ink-secondary / yellow-ish
 *   - Late stages (Follow-up, Proposal)  → accent tint
 *   - Won                                → status-green tint
 *   - Lost                               → red tint
 */

import type { PipelineStage } from "@/lib/admin/types";

const STAGE_STYLES: Record<PipelineStage, string> = {
  Found:       "bg-surface-3 text-ink-subtle border-hairline",
  Researched:  "bg-surface-3 text-ink-secondary border-hairline",
  Emailed:     "bg-surface-2 text-ink-secondary border-hairline-strong",
  Called:      "border border-[rgba(245,166,35,0.3)] bg-[rgba(245,166,35,0.08)] text-[#F5A623]",
  "Follow-up": "border border-accent/30 bg-accent/10 text-accent",
  Proposal:    "border border-accent/50 bg-accent/15 text-accent",
  Won:         "border border-[rgba(40,202,65,0.4)] bg-[rgba(40,202,65,0.1)] text-[#28CA41]",
  Lost:        "border border-red-500/30 bg-red-500/10 text-red-400",
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
        "inline-flex items-center rounded-full border font-mono uppercase tracking-wider whitespace-nowrap",
        sizeClass,
        STAGE_STYLES[stage],
      ].join(" ")}
    >
      {stage}
    </span>
  );
}
