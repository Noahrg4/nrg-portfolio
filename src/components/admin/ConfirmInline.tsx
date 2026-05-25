"use client";

/**
 * src/components/admin/ConfirmInline.tsx
 *
 * Inline confirmation pattern for destructive actions.
 * The button renders normally; on first click it enters confirm mode showing
 * "Sure?" and "Cancel" side-by-side. If the user doesn't confirm within 3s,
 * it auto-reverts.
 *
 * Usage:
 *   <ConfirmInline
 *     label="Delete"
 *     confirmLabel="Sure?"
 *     onConfirm={() => handleDelete(lead.id)}
 *     loading={deleting}
 *     className="..."
 *   />
 *
 * Props:
 *   label        — idle button text
 *   confirmLabel — confirmation prompt text (default "Sure?")
 *   onConfirm    — called when the user confirms
 *   loading      — renders spinner + disables while in-flight
 *   revertDelay  — ms before auto-revert (default 3000)
 *   className    — applied to the idle button
 *   disabled     — disables the idle button
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface ConfirmInlineProps {
  label: string;
  confirmLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** ms before confirm mode auto-reverts. Default 3000. */
  revertDelay?: number;
  className?: string;
}

export default function ConfirmInline({
  label,
  confirmLabel = "Sure?",
  onConfirm,
  loading = false,
  disabled = false,
  revertDelay = 3000,
  className = "",
}: ConfirmInlineProps) {
  const [confirming, setConfirming] = useState(false);
  const reduce = useReducedMotion();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function enterConfirm() {
    setConfirming(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setConfirming(false);
    }, revertDelay);
  }

  function cancel() {
    setConfirming(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  function confirm() {
    cancel();
    onConfirm();
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const baseBtn =
    "rounded-md font-mono text-[11px] uppercase tracking-wider transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed";

  if (confirming) {
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key="confirm"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-1.5"
        >
          {/* Confirm button */}
          <button
            type="button"
            onClick={confirm}
            disabled={loading}
            autoFocus
            className={[
              baseBtn,
              "border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-red-400 hover:border-red-500 hover:bg-red-500/15",
            ].join(" ")}
          >
            {loading ? (
              <span
                aria-hidden
                className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent"
              />
            ) : (
              confirmLabel
            )}
          </button>

          {/* Cancel button */}
          <button
            type="button"
            onClick={cancel}
            disabled={loading}
            className={[
              baseBtn,
              "border border-hairline px-3 py-1.5 text-ink-subtle hover:border-hairline-strong hover:text-ink",
            ].join(" ")}
          >
            Cancel
          </button>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.button
        key="idle"
        type="button"
        onClick={enterConfirm}
        disabled={disabled || loading}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className={[baseBtn, className].join(" ")}
      >
        {label}
      </motion.button>
    </AnimatePresence>
  );
}
