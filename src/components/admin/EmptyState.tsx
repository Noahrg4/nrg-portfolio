"use client";

/**
 * src/components/admin/EmptyState.tsx
 *
 * Centered empty-state card. Use when a list or table has no items.
 *
 * Usage:
 *   <EmptyState
 *     title="No leads yet"
 *     body="Add your first prospect to start the pipeline."
 *     action={{ label: "Add lead", onClick: () => setAddOpen(true) }}
 *   />
 *
 * The optional `icon` prop accepts a React element to place in the cyan-tinted
 * circle. Falls back to a subtle inbox SVG if not provided.
 */

import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";

interface EmptyStateProps {
  title: string;
  body?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/** Default inbox icon */
function DefaultIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-accent"
      aria-hidden
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 10h20M8 10V6M16 10V6" />
    </svg>
  );
}

export default function EmptyState({
  title,
  body,
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={["flex flex-col items-center justify-center gap-5 py-20 text-center", className].join(" ")}
    >
      {/* Icon circle */}
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 ring-1 ring-accent/20">
        {icon ?? <DefaultIcon />}
      </div>

      {/* Text */}
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-lg font-extrabold tracking-tight text-ink"
          style={{ letterSpacing: "-0.03em" }}>
          {title}
        </h3>
        {body && (
          <p className="max-w-xs text-sm text-ink-secondary">{body}</p>
        )}
      </div>

      {/* Optional action button */}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="rounded-md border border-accent/30 bg-accent/10 px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider text-accent transition-colors hover:bg-accent/15 hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
