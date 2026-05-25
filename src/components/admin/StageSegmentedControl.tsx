"use client";

/**
 * src/components/admin/StageSegmentedControl.tsx
 *
 * Connected pill segments showing all 8 pipeline stages.
 * Active stage is filled with accent color. Click any segment to set stage.
 * Mobile: horizontally scrollable strip. Desktop: fully visible inline row.
 */

import { PIPELINE_STAGES, type PipelineStage } from "@/lib/admin/types";

interface StageSegmentedControlProps {
  value: PipelineStage;
  onChange: (stage: PipelineStage) => void;
  disabled?: boolean;
}

/** Short labels that fit in tight segments */
const SHORT_LABELS: Record<PipelineStage, string> = {
  Found: "Found",
  Researched: "Research",
  Emailed: "Emailed",
  Called: "Called",
  "Follow-up": "Follow-up",
  Proposal: "Proposal",
  Won: "Won",
  Lost: "Lost",
};

/** Stage index for left-to-right progress indicator */
const STAGE_INDEX: Record<PipelineStage, number> = {
  Found: 0,
  Researched: 1,
  Emailed: 2,
  Called: 3,
  "Follow-up": 4,
  Proposal: 5,
  Won: 6,
  Lost: 7,
};

export default function StageSegmentedControl({
  value,
  onChange,
  disabled = false,
}: StageSegmentedControlProps) {
  const activeIdx = STAGE_INDEX[value];

  return (
    <div
      role="radiogroup"
      aria-label="Pipeline stage"
      className="flex w-full overflow-x-auto rounded-lg border border-hairline-strong bg-surface-2 p-1 gap-0.5 scrollbar-none"
      style={{ scrollbarWidth: "none" }}
    >
      {PIPELINE_STAGES.map((stage, idx) => {
        const isActive = stage === value;
        const isPast = idx < activeIdx && value !== "Lost";
        const isLost = stage === "Lost";
        const isWon = stage === "Won";

        let segmentClass: string;
        if (isActive && isWon) {
          // Won: solid green tint
          segmentClass =
            "bg-[#28CA41]/20 text-[#28CA41] border border-[#28CA41]/40 shadow-[0_0_12px_rgba(40,202,65,0.2)]";
        } else if (isActive && isLost) {
          // Lost: muted red
          segmentClass =
            "bg-red-500/15 text-red-400 border border-red-500/30";
        } else if (isActive) {
          // Normal active: cyan fill
          segmentClass =
            "bg-accent/20 text-accent border border-accent/50 shadow-[0_0_12px_rgba(0,212,255,0.2)]";
        } else if (isPast && !disabled) {
          // Past stages: slightly brighter than inactive
          segmentClass =
            "bg-accent/5 text-ink-subtle border border-transparent hover:border-hairline hover:text-ink-secondary";
        } else {
          // Inactive
          segmentClass =
            "bg-transparent text-ink-subtle border border-transparent hover:border-hairline hover:text-ink-secondary";
        }

        return (
          <button
            key={stage}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => !disabled && onChange(stage)}
            disabled={disabled}
            title={stage}
            className={[
              "relative flex shrink-0 items-center justify-center rounded-md",
              "px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider",
              "transition-all duration-150",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
              "disabled:cursor-not-allowed disabled:opacity-40",
              segmentClass,
            ].join(" ")}
          >
            {SHORT_LABELS[stage]}
          </button>
        );
      })}
    </div>
  );
}
