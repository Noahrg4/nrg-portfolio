"use client";

/**
 * src/components/admin/StalenessIndicator.tsx
 *
 * Colored dot + relative-date label that shows how stale a date is.
 * Used for last-verified and last-invoiced fields in the Clients tab.
 *
 * Props:
 *   iso         — ISO timestamp or null (never set)
 *   greenDays   — threshold (inclusive): up to this many days → green
 *   amberDays   — threshold (inclusive): up to this many days → amber
 *                 beyond amberDays → red
 *   label       — text prefix ("Verified", "Invoiced", etc.)
 *   neverLabel  — text shown when iso is null (e.g. "Never verified")
 *
 * Color tiers (dot + text):
 *   green  — within greenDays
 *   amber  — within amberDays (but beyond greenDays)
 *   red    — beyond amberDays OR null
 */

import { daysSince, formatRelativeDate, formatAbsoluteDate } from "@/lib/admin/format";

interface StalenessIndicatorProps {
  iso: string | null;
  greenDays?: number;
  amberDays?: number;
  label?: string;
  neverLabel?: string;
  className?: string;
}

type Tier = "green" | "amber" | "red";

function getTier(days: number | null, greenDays: number, amberDays: number): Tier {
  if (days === null) return "red";
  if (days <= greenDays) return "green";
  if (days <= amberDays) return "amber";
  return "red";
}

const DOT_COLORS: Record<Tier, string> = {
  green: "bg-[#28CA41]",
  amber: "bg-[#F5A623]",
  red: "bg-red-400",
};

const TEXT_COLORS: Record<Tier, string> = {
  green: "text-[#28CA41]/80",
  amber: "text-[#F5A623]/80",
  red: "text-red-400/80",
};

export default function StalenessIndicator({
  iso,
  greenDays = 30,
  amberDays = 60,
  label = "Verified",
  neverLabel,
  className,
}: StalenessIndicatorProps) {
  const days = daysSince(iso);
  const tier = getTier(days, greenDays, amberDays);

  const relative = iso ? formatRelativeDate(iso) : null;
  const absolute = iso ? formatAbsoluteDate(iso) : null;

  let displayText: string;
  if (!iso) {
    displayText = neverLabel ?? `Never ${label.toLowerCase()}`;
  } else if (tier === "amber") {
    displayText = `Stale — ${label.toLowerCase()} ${relative}`;
  } else if (tier === "red" && days !== null) {
    displayText = `Needs check — ${label.toLowerCase()} ${relative}`;
  } else {
    displayText = `${label} ${relative}`;
  }

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5",
        TEXT_COLORS[tier],
        className ?? "",
      ].join(" ")}
      title={absolute ?? undefined}
    >
      <span
        className={[
          "inline-block h-1.5 w-1.5 rounded-full flex-shrink-0",
          DOT_COLORS[tier],
        ].join(" ")}
        aria-hidden="true"
      />
      <span className="font-mono text-[10px]">{displayText}</span>
    </span>
  );
}
