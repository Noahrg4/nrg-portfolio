"use client";

/**
 * src/components/admin/Toast.tsx
 *
 * Individual toast item rendered by ToastProvider.
 * Slide-in from bottom-right, auto-dismiss after `duration` ms, manual ✕ close.
 *
 * Kinds:
 *   success — accent (cyan) left stripe
 *   error   — red-tint left stripe
 *   info    — ink-subtle left stripe
 */

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";

export type ToastKind = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  kind: ToastKind;
  /** Auto-dismiss delay in ms. Defaults to 3000 */
  duration?: number;
}

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const kindConfig: Record<ToastKind, { stripe: string; label: string; labelColor: string }> = {
  success: {
    stripe: "bg-accent",
    label: "Success",
    labelColor: "text-accent",
  },
  error: {
    stripe: "bg-red-500",
    label: "Error",
    labelColor: "text-red-400",
  },
  info: {
    stripe: "bg-ink-subtle",
    label: "Info",
    labelColor: "text-ink-subtle",
  },
};

export default function Toast({ toast, onDismiss }: ToastProps) {
  const reduce = useReducedMotion();
  const config = kindConfig[toast.kind];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const delay = toast.duration ?? 3000;
    timerRef.current = setTimeout(() => {
      onDismiss(toast.id);
    }, delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      role="alert"
      aria-live="polite"
      className="flex w-80 overflow-hidden rounded-xl border border-hairline bg-surface-1 shadow-2xl"
    >
      {/* Left color stripe */}
      <div className={["w-1 shrink-0", config.stripe].join(" ")} aria-hidden />

      {/* Content */}
      <div className="flex flex-1 items-start gap-3 px-4 py-3.5">
        <div className="flex flex-1 flex-col gap-0.5">
          <span
            className={[
              "font-mono text-[10px] uppercase tracking-wider",
              config.labelColor,
            ].join(" ")}
          >
            {config.label}
          </span>
          <p className="text-sm text-ink leading-snug">{toast.message}</p>
        </div>

        {/* Dismiss */}
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-ink-subtle transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span aria-hidden className="text-[12px] leading-none">✕</span>
        </button>
      </div>
    </motion.div>
  );
}
