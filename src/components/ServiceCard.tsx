"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  name: string;
  description: string;
  startingFrom?: string;
  delay?: number;
};

export default function ServiceCard({
  icon,
  name,
  description,
  startingFrom,
  delay = 0,
}: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      className="group relative flex h-full flex-col gap-5 rounded-lg border border-accent/20 bg-surface-2 p-6 transition-all duration-300 hover:border-accent hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="flex h-10 w-10 items-center justify-center text-accent">
        {icon}
      </div>
      <div className="flex flex-1 flex-col gap-3">
        <h3 className="font-display text-xl font-bold tracking-tight text-ink">
          {name}
        </h3>
        <p className="text-sm leading-relaxed text-ink-secondary">
          {description}
        </p>
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-hairline pt-4">
        {startingFrom && (
          <p className="hidden font-mono text-[11px] uppercase tracking-wider text-ink-secondary sm:block">
            Starting from{" "}
            <span className="text-ink">{startingFrom}</span>
          </p>
        )}
        <span
          className="font-mono text-base text-accent transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden
        >
          →
        </span>
      </div>
    </motion.div>
  );
}
