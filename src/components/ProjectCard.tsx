"use client";

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
  liveUrl?: string;
};

function normalizeHref(input: string): string {
  return /^https?:\/\//i.test(input) ? input : `https://${input}`;
}

export default function ProjectCard({
  category,
  title,
  url,
  gradient,
  imageSrc,
  imageAlt,
  delay = 0,
  liveUrl,
}: Props) {
  const reduce = useReducedMotion();
  const href = liveUrl?.trim() ? normalizeHref(liveUrl.trim()) : null;

  const inner = (
    <>
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
    </>
  );

  const wrapperClass = `flex flex-col gap-3 group transition-transform duration-200 ease-out ${
    href ? "hover:-translate-y-1" : ""
  }`;

  return (
    <motion.article
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className={wrapperClass}
    >
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${title} — opens in new tab`}
          className="flex flex-col gap-3"
        >
          {inner}
        </a>
      ) : (
        inner
      )}
    </motion.article>
  );
}
