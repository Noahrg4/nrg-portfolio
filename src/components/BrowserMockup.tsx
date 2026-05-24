"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  url: string;
  children?: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  delay?: number;
  className?: string;
  noEntry?: boolean;
  priority?: boolean;
};

const EASE = [0.16, 1, 0.3, 1] as const;

export default function BrowserMockup({
  url,
  children,
  imageSrc,
  imageAlt,
  delay = 0,
  className = "",
  noEntry = false,
  priority = false,
}: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={noEntry ? false : (reduce ? { opacity: 0 } : { opacity: 0, y: 24 })}
      whileInView={noEntry ? undefined : { opacity: 1, y: 0 }}
      viewport={noEntry ? undefined : { once: true, margin: "-80px" }}
      transition={noEntry ? undefined : { duration: 0.6, ease: EASE, delay }}
      className={`relative overflow-hidden rounded-xl border border-hairline bg-surface-1 shadow-card-base ${className}`}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-3 border-b border-hairline bg-surface-2 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span
            className="block h-3 w-3 rounded-full"
            style={{ background: "#FF5F57" }}
            aria-hidden
          />
          <span
            className="block h-3 w-3 rounded-full"
            style={{ background: "#FFBD2E" }}
            aria-hidden
          />
          <span
            className="block h-3 w-3 rounded-full"
            style={{ background: "#28CA41" }}
            aria-hidden
          />
        </div>
        <div className="flex-1">
          <div className="mx-auto max-w-md rounded-md border border-hairline bg-surface-3 px-3 py-1 text-center font-mono text-[11px] text-ink-secondary">
            {url}
          </div>
        </div>
        <div className="h-3 w-12" aria-hidden />
      </div>

      {/* Content area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-2">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt ?? ""}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-top"
            priority={priority}
          />
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
}
