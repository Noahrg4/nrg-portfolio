"use client";

/**
 * src/components/admin/ScoreBadge.tsx
 *
 * Circular badge showing lead score (0–9).
 * Color tiers:
 *   hot  (≥7): cyan fill — bg-accent text-canvas
 *   warm (4–6): amber tint — bg-yellow-500/20 text-yellow-300
 *   cold (<4): dim — bg-surface-2 text-ink-subtle
 *
 * Size variants: "sm" (28px) | "md" (32px) | "lg" (40px)
 */

import { getScoreTier } from "@/lib/admin/types";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES: Record<"sm" | "md" | "lg", string> = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

const TIER_STYLES = {
  hot:  "bg-accent text-canvas",
  warm: "bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/30",
  cold: "bg-surface-2 text-ink-subtle ring-1 ring-hairline",
};

export default function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const tier = getScoreTier(score);
  const displayScore = score % 1 === 0 ? score : score.toFixed(1);

  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-full font-mono font-medium",
        SIZE_CLASSES[size],
        TIER_STYLES[tier],
      ].join(" ")}
      title={`Score: ${score} (${tier})`}
      aria-label={`Lead score ${score}, ${tier}`}
    >
      {displayScore}
    </span>
  );
}
