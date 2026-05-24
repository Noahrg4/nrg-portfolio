"use client";

import { motion, useReducedMotion } from "framer-motion";

type Props = {
  quote: string;
  author: string;
  business: string;
  featured?: boolean;
  delay?: number;
};

export default function TestimonialCard({
  quote,
  author,
  business,
  featured = false,
  delay = 0,
}: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.figure
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className={`flex flex-col gap-6 border-l-2 border-accent/35 ${
        featured ? "pl-10 py-2 md:pl-14" : "pl-8 py-1"
      }`}
    >
      <blockquote
        className={`font-sans italic text-ink/85 ${
          featured
            ? "text-xl leading-[1.7] md:text-2xl"
            : "text-base leading-[1.7] md:text-lg"
        }`}
      >
        {quote}
      </blockquote>
      <figcaption className="flex flex-col gap-1">
        <span className="font-display text-base font-bold text-ink">
          {author}
        </span>
        <span className="font-mono text-xs uppercase tracking-wider text-ink-secondary">
          {business}
        </span>
      </figcaption>
    </motion.figure>
  );
}
