"use client";

/**
 * src/components/admin/LoadingState.tsx
 *
 * Lightweight loading indicator. Uses the existing `.pulse-dot` animation
 * defined in globals.css (same as StatusPill on the public site).
 *
 * Usage:
 *   <LoadingState />
 *   <LoadingState label="Loading leads…" />
 *   <LoadingState label="Fetching…" className="py-10" />
 */

interface LoadingStateProps {
  label?: string;
  className?: string;
}

export default function LoadingState({
  label = "Loading…",
  className = "",
}: LoadingStateProps) {
  return (
    <div
      className={["flex items-center justify-center gap-2.5 py-20", className].join(" ")}
      role="status"
      aria-label={label}
    >
      {/* Pulsing cyan dot — reuses globals.css .pulse-dot keyframe */}
      <span
        aria-hidden
        className="pulse-dot h-2 w-2 rounded-full bg-accent"
      />
      <span className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
        {label}
      </span>
    </div>
  );
}
