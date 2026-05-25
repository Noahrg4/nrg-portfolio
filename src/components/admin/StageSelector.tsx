"use client";

/**
 * src/components/admin/StageSelector.tsx
 *
 * Dropdown for changing a lead's pipeline stage.
 * Styled to match the site's input pattern.
 */

import { PIPELINE_STAGES, type PipelineStage } from "@/lib/admin/types";

interface StageSelectorProps {
  value: PipelineStage;
  onChange: (stage: PipelineStage) => void;
  disabled?: boolean;
  className?: string;
}

export default function StageSelector({
  value,
  onChange,
  disabled,
  className,
}: StageSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as PipelineStage)}
      disabled={disabled}
      className={[
        "rounded-md border border-hairline bg-surface-2 px-3 py-2 text-base text-ink",
        "focus:border-accent focus:outline-none transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className ?? "",
      ].join(" ")}
      aria-label="Pipeline stage"
    >
      {PIPELINE_STAGES.map((stage) => (
        <option key={stage} value={stage}>
          {stage}
        </option>
      ))}
    </select>
  );
}
