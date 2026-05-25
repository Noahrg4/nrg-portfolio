"use client";

/**
 * src/components/admin/ScoreBadge.tsx
 *
 * Circular badge showing lead score 0–9.
 * Ring opacity/color scales with score:
 *   - Hot (≥7): cyan ring, cyan text
 *   - Warm (≥4): warm orange ring, warm text
 *   - Cold (<4): hairline ring, subtle text
 */

import { getScoreTier } from "@/lib/admin/types";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

export default function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const tier = getScoreTier(score);

  const ringClass =
    tier === "hot"
      ? "ring-2 ring-accent/80 bg-accent/10 text-accent"
      : tier === "warm"
      ? "ring-2 ring-[rgba(245,166,35,0.6)] bg-[rgba(245,166,35,0.08)] text-[#F5A623]"
      : "ring-1 ring-hairline bg-surface-3 text-ink-subtle";

  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-full font-mono font-medium",
        SIZE_CLASSES[size],
        ringClass,
      ].join(" ")}
      title={`Score: ${score} (${tier})`}
      aria-label={`Lead score ${score}, ${tier}`}
    >
      {score % 1 === 0 ? score : score.toFixed(1)}
    </span>
  );
}
