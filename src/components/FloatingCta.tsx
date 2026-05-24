"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export default function FloatingCta({ linkPrefix = "" }: { linkPrefix?: string }) {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const contactPath = `${linkPrefix}/contact`;
  const show = visible && pathname !== contactPath;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Link
            href={contactPath}
            className="font-mono text-[15px] uppercase tracking-wider text-accent underline-offset-4 transition-all hover:underline md:text-sm"
          >
            Let&apos;s talk →
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
