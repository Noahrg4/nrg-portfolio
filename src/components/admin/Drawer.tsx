"use client";

/**
 * src/components/admin/Drawer.tsx
 *
 * Generic slide-in right drawer. Used for lead/client detail/edit views.
 * Slides in from the right, darkened backdrop.
 *
 * Accessibility:
 *   - ESC closes
 *   - Backdrop click closes
 *   - Focus is trapped inside (Tab / Shift+Tab cycle within the drawer)
 *   - First focusable element receives focus on open
 *   - Scroll lock on body while open
 *   - prefers-reduced-motion: no x-slide, opacity only
 */

import { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const FOCUSABLE_SELECTORS =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Width class — defaults to max-w-xl */
  width?: string;
}

export default function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = "max-w-xl",
}: DrawerProps) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLElement>(null);

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

  // Focus trap — Tab / Shift+Tab cycle inside drawer
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    // Focus first focusable element on open
    const firstFocusable = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
    firstFocusable?.focus();

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const focusable = Array.from(
        panel!.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    panel.addEventListener("keydown", handleTab);
    return () => panel.removeEventListener("keydown", handleTab);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-canvas/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer-panel"
            ref={panelRef}
            initial={reduce ? { opacity: 0 } : { x: "100%" }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={[
              "fixed right-0 top-0 bottom-0 z-50 flex flex-col",
              "border-l border-hairline-strong bg-surface-1 shadow-2xl",
              "w-full",
              width,
            ].join(" ")}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-hairline px-6 py-4 shrink-0">
              <div className="flex flex-col gap-0.5">
                <h2
                  id="drawer-title"
                  className="text-display text-lg text-ink"
                >
                  {title}
                </h2>
                {subtitle && (
                  <p className="font-mono text-[11px] text-ink-subtle">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-subtle hover:text-ink transition-colors mt-0.5"
                aria-label="Close drawer"
              >
                ✕
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
