"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function SectionHeading({ children, className = "" }: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.h2
      className={className}
      initial={
        reduce ? { opacity: 0 } : { clipPath: "inset(0 100% 0 0)", opacity: 1 }
      }
      whileInView={
        reduce ? { opacity: 1 } : { clipPath: "inset(0 0% 0 0)", opacity: 1 }
      }
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.h2>
  );
}
