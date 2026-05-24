"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  body: string;
  delay?: number;
};

export default function AboutSkillCard({ icon, title, body, delay = 0 }: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className="flex flex-col gap-4 rounded-lg border border-hairline bg-surface-1 p-8 transition-colors duration-200 hover:border-accent/50"
    >
      <span className="text-accent">{icon}</span>
      <h3 className="font-display text-xl font-bold tracking-tight text-ink">
        {title}
      </h3>
      <p className="text-[15px] leading-relaxed text-ink-secondary">
        {body}
      </p>
    </motion.article>
  );
}
