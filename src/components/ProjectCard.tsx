"use client";

import { motion, useReducedMotion } from "framer-motion";
import BrowserMockup from "./BrowserMockup";

type Props = {
  category: string;
  title: string;
  outcome?: string;  // data compat — not rendered on cards
  tags?: string[];   // data compat — not rendered on cards
  url: string;
  gradient: string;
  monogram?: string; // data compat — not rendered
  imageSrc?: string;
  imageAlt?: string;
  delay?: number;
};

export default function ProjectCard({
  category,
  title,
  url,
  gradient,
  imageSrc,
  imageAlt,
  delay = 0,
}: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      whileHover={reduce ? undefined : {
        y: -4,
        transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
      }}
      className="flex flex-col gap-3 group"
    >
      {/* Frame — entry animation suppressed (card handles it); hover glow via className */}
      <BrowserMockup
        url={url}
        delay={delay}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        noEntry
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
        <h3
          className="font-display font-bold leading-[1.25] tracking-tight text-ink transition-colors duration-200 group-hover:text-white/90"
          style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)" }}
        >
          {title}
        </h3>
      </div>
    </motion.article>
  );
}
