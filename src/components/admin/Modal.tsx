"use client";

/**
 * src/components/admin/Modal.tsx
 *
 * Generic centered modal overlay. Used for Add Lead / Add Client forms.
 * Traps focus, closes on Escape, closes on backdrop click.
 */

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Width class — defaults to max-w-xl */
  width?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-xl",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Auto-focus first focusable element
  useEffect(() => {
    if (open && dialogRef.current) {
      const focusable = dialogRef.current.querySelector<HTMLElement>(
        'input, select, textarea, button:not([data-close])'
      );
      focusable?.focus();
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          {/* Dialog */}
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div
              ref={dialogRef}
              className={[
                "relative w-full rounded-2xl border border-hairline-strong bg-surface-1 shadow-2xl",
                "flex flex-col max-h-[90vh]",
                width,
              ].join(" ")}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
                <h2
                  id="modal-title"
                  className="font-mono text-[11px] uppercase tracking-wider text-ink-secondary"
                >
                  {title}
                </h2>
                <button
                  data-close
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-ink-subtle hover:text-ink transition-colors"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Body — scrollable */}
              <div className="overflow-y-auto px-6 py-5 flex-1">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
