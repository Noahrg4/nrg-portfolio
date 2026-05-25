"use client";

/**
 * src/components/admin/ScoreToggleSwitch.tsx
 *
 * Animated toggle switch for score factor fields.
 * Track: 40×24px rounded pill. Circle: 18px slides on click.
 * Cyan fill when on, surface-3 when off.
 */

import { motion } from "framer-motion";

interface ScoreToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  weight: number;
  disabled?: boolean;
}

export default function ScoreToggleSwitch({
  id,
  checked,
  onChange,
  label,
  weight,
  disabled = false,
}: ScoreToggleSwitchProps) {
  return (
    <label
      htmlFor={id}
      className={[
        "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5",
        "transition-colors duration-150 cursor-pointer",
        checked
          ? "border-accent/40 bg-accent/5"
          : "border-hairline bg-surface-2 hover:border-hairline-strong",
        disabled ? "cursor-not-allowed opacity-50" : "",
      ].join(" ")}
    >
      {/* Text */}
      <span className="flex flex-col gap-0.5 select-none">
        <span
          className={[
            "font-mono text-[11px] capitalize transition-colors duration-150",
            checked ? "text-ink" : "text-ink-secondary",
          ].join(" ")}
        >
          {label}
        </span>
        <span className="font-mono text-[10px] text-ink-subtle">
          +{weight} pts
        </span>
      </span>

      {/* Toggle track */}
      <div className="relative shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
          aria-checked={checked}
        />
        {/* Track */}
        <div
          onClick={!disabled ? onChange : undefined}
          className={[
            "h-6 w-10 rounded-full transition-colors duration-200",
            checked ? "bg-accent" : "bg-surface-3 border border-hairline-strong",
          ].join(" ")}
          aria-hidden="true"
        >
          {/* Circle */}
          <motion.div
            layout
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={[
              "absolute top-[3px] h-[18px] w-[18px] rounded-full shadow-sm",
              checked ? "bg-canvas" : "bg-ink-subtle",
            ].join(" ")}
            style={{ left: checked ? "19px" : "3px" }}
          />
        </div>
      </div>
    </label>
  );
}
