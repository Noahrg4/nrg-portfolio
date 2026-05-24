"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  name: string;
  long: string;
  startingFrom: string;
  includes: string[];
  delay?: number;
  linkPrefix?: string;
};

export default function ServiceDetailCard({
  icon,
  name,
  long,
  startingFrom,
  includes,
  delay = 0,
  linkPrefix = "",
}: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className="group relative flex flex-col gap-6 rounded-xl border border-accent/20 bg-surface-2 p-8 transition-colors duration-200 hover:border-accent md:p-10"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-accent">{icon}</span>
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-secondary">
          Starting from{" "}
          <span className="text-ink">{startingFrom}</span>
        </span>
      </div>
      <h2 className="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
        {name}
      </h2>
      <p className="text-base leading-relaxed text-ink-secondary">
        {long}
      </p>
      <ul className="flex flex-col gap-2.5 border-t border-hairline pt-5">
        {includes.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 text-[15px] text-ink-secondary"
          >
            <span
              className="mt-1.5 inline-block h-1 w-1 flex-shrink-0 rounded-full bg-accent"
              aria-hidden
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center justify-between border-t border-hairline pt-5">
        <Link
          href={`${linkPrefix}/contact`}
          className="font-mono text-xs uppercase tracking-wider text-accent transition-opacity duration-200 hover:opacity-80"
        >
          Discuss this →
        </Link>
      </div>
    </motion.article>
  );
}
