"use client";

/**
 * src/components/admin/PipelineFunnel.tsx
 *
 * Horizontal bar chart showing lead counts per pipeline stage.
 * Each stage gets a bar whose width is proportional to its lead count
 * relative to the largest non-zero stage.
 *
 * Visual treatment:
 *   - Late stages (Follow-up, Proposal, Won): accent color bars
 *   - Mid stages (Emailed, Called): ink-secondary bars
 *   - Early stages (Found, Researched): surface-3 bars (barely visible)
 *   - Lost: red dim bar
 *
 * Each row shows: stage chip | bar | count | close probability hint
 */

import { motion, useReducedMotion } from "framer-motion";
import type { PipelineStage } from "@/lib/admin/types";
import { PIPELINE_STAGES, STAGE_CLOSE_PROBABILITY } from "@/lib/admin/types";
import StageChip from "./StageChip";

interface PipelineFunnelProps {
  leadsByStage: Record<PipelineStage, number>;
}

// Bar color classes per stage
const BAR_COLORS: Record<PipelineStage, string> = {
  Found:       "bg-surface-3",
  Researched:  "bg-surface-3",
  Emailed:     "bg-ink-subtle/30",
  Called:      "bg-[rgba(245,166,35,0.35)]",
  "Follow-up": "bg-accent/40",
  Proposal:    "bg-accent/70",
  Won:         "bg-[rgba(40,202,65,0.6)]",
  Lost:        "bg-red-500/25",
};

// Count text color per stage
const COUNT_COLORS: Record<PipelineStage, string> = {
  Found:       "text-ink-subtle",
  Researched:  "text-ink-subtle",
  Emailed:     "text-ink-secondary",
  Called:      "text-[#F5A623]",
  "Follow-up": "text-accent",
  Proposal:    "text-accent",
  Won:         "text-[#28CA41]",
  Lost:        "text-red-400",
};

export default function PipelineFunnel({ leadsByStage }: PipelineFunnelProps) {
  const reduce = useReducedMotion();

  const maxCount = Math.max(
    1,
    ...PIPELINE_STAGES.map((s) => leadsByStage[s] ?? 0)
  );

  return (
    <div className="rounded-xl border border-hairline bg-surface-1 overflow-hidden">
      {PIPELINE_STAGES.map((stage, i) => {
        const count = leadsByStage[stage] ?? 0;
        const prob = STAGE_CLOSE_PROBABILITY[stage];
        // Minimum 2% width so the bar is visible even at count=0
        const barPct = count === 0 ? 0 : Math.max(3, (count / maxCount) * 100);

        return (
          <div
            key={stage}
            className={[
              "relative flex items-center gap-3 px-4 py-3",
              i < PIPELINE_STAGES.length - 1 ? "border-b border-hairline" : "",
            ].join(" ")}
          >
            {/* Animated background bar */}
            {count > 0 && (
              <motion.div
                aria-hidden
                className={["absolute inset-y-0 left-0", BAR_COLORS[stage]].join(" ")}
                initial={{ width: 0 }}
                animate={{ width: `${barPct}%` }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }
                }
              />
            )}

            {/* Stage chip — fixed width so bars don't displace layout */}
            <div className="relative w-24 shrink-0">
              <StageChip stage={stage} size="sm" />
            </div>

            {/* Count */}
            <span
              className={[
                "relative text-display text-lg leading-none w-6 text-right shrink-0",
                COUNT_COLORS[stage],
              ].join(" ")}
            >
              {count}
            </span>

            {/* Close probability hint */}
            <span className="relative ml-auto font-mono text-[10px] text-ink-subtle shrink-0">
              {(prob * 100).toFixed(0)}% close
            </span>
          </div>
        );
      })}
    </div>
  );
}
