"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import BrowserMockup from "./BrowserMockup";

type Props = {
  category: string;
  title: string;
  url: string;
  gradient: string;
  imageSrc?: string;
  imageAlt?: string;
  delay?: number;
  linkPrefix?: string;
  priority?: boolean;
};

export default function HomepageProjectCard({
  category,
  title,
  url,
  gradient,
  imageSrc,
  imageAlt,
  delay = 0,
  linkPrefix = "",
  priority = false,
}: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className="group transition-transform duration-200 ease-out hover:-translate-y-1"
    >
      {/* Whole card is a link to /work */}
      <Link href={`${linkPrefix}/work`} className="flex flex-col gap-3 cursor-pointer">
        {/* Frame — entry animation suppressed (card handles it); hover glow via className */}
        <BrowserMockup
          url={url}
          imageSrc={imageSrc}
          imageAlt={imageAlt}
          noEntry
          priority={priority}
          className="group-hover:shadow-[0_8px_32px_rgba(0,212,255,0.12)] transition-shadow duration-200"
        >
          {!imageSrc && (
            <div className={`relative h-full w-full ${gradient}`}>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 30% 20%, rgba(0,212,255,0.12), transparent 60%), radial-gradient(circle at 80% 90%, rgba(255,255,255,0.05), transparent 50%)",
                }}
              />
            </div>
          )}
        </BrowserMockup>

        {/* Text below the frame — never overlapping */}
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/40 transition-colors duration-200 group-hover:text-white/70">
            {category}
          </span>
          <h3 className="font-display text-base font-bold leading-snug tracking-tight text-ink transition-colors duration-200 group-hover:text-white/90">
            {title}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
}
