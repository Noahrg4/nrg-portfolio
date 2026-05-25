"use client";

/**
 * src/components/admin/MetricCard.tsx
 *
 * Stat card: big display number + mono label.
 * Optional hint text and accent highlight mode.
 * Replicates ServiceCard hover pattern from the public site.
 */

import { motion, useReducedMotion } from "framer-motion";

interface MetricCardProps {
  /** Mono uppercase label — what this number measures */
  label: string;
  /** The primary value — large display font */
  value: string | number;
  /** Small ink-subtle text below the value */
  hint?: string;
  /** @deprecated use hint — kept for backward compat */
  subtext?: string;
  /** When true, value renders in accent cyan; border also accented */
  accent?: boolean;
  delay?: number;
}

export default function MetricCard({
  label,
  value,
  hint,
  subtext,
  accent = false,
  delay = 0,
}: MetricCardProps) {
  const reduce = useReducedMotion();
  const helpText = hint ?? subtext;

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className={[
        "group flex flex-col gap-2 rounded-xl border p-6 transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,212,255,0.08)]",
        accent
          ? "border-accent/30 bg-surface-1 hover:border-accent/60"
          : "border-hairline bg-surface-1 hover:border-hairline-strong",
      ].join(" ")}
    >
      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-subtle">
        {label}
      </p>
      <p
        className={[
          "text-display text-3xl leading-none",
          accent ? "text-accent" : "text-ink",
        ].join(" ")}
      >
        {value}
      </p>
      {helpText && (
        <p className="font-mono text-[11px] text-ink-subtle">{helpText}</p>
      )}
    </motion.div>
  );
}
