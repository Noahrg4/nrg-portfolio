"use client";

/**
 * src/components/admin/KeyboardShortcuts.tsx
 *
 * Two exports:
 *
 *   1. <KeyboardShortcutsListener />
 *      Mount once at the dashboard root (inside ToastProvider, inside layout.tsx).
 *      Wires up ALL global keyboard shortcuts:
 *        N         → dispatch CustomEvent("open-new-lead")   [only on /admin/leads]
 *        Cmd/Ctrl+S→ dispatch CustomEvent("admin-save")      [skipped when no input focused]
 *        ?         → open keyboard shortcuts overlay
 *
 *   2. <KeyboardShortcutsOverlay open onClose />
 *      Cheat sheet modal. Shows all shortcuts. Toggle with `?`.
 *
 * ── Adding shortcuts ─────────────────────────────────────────────────────────
 * 1. Add a new row to the SHORTCUTS array (display only).
 * 2. Add the handler inside KeyboardShortcutsListener's useKeyboardShortcuts call.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

// ─── Shortcut display registry ───────────────────────────────────────────────
const SHORTCUTS = [
  { keys: ["N"], description: "New lead", context: "Leads tab" },
  { keys: ["⌘", "S"], description: "Save open drawer", context: "Anywhere" },
  { keys: ["Esc"], description: "Close drawer / modal", context: "Anywhere" },
  { keys: ["?"], description: "Toggle this cheat sheet", context: "Anywhere" },
];

// ─── KeyboardShortcutsOverlay ─────────────────────────────────────────────────
interface OverlayProps {
  open: boolean;
  onClose: () => void;
}

function KeyboardShortcutsOverlay({ open, onClose }: OverlayProps) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="shortcuts-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-canvas/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          {/* Panel */}
          <motion.div
            key="shortcuts-panel"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-hairline-strong bg-surface-1 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
                <h2 className="font-mono text-[11px] uppercase tracking-wider text-ink-secondary">
                  Keyboard shortcuts
                </h2>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-ink-subtle transition-colors hover:text-ink"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Shortcuts list */}
              <div className="flex flex-col gap-0 px-6 py-4">
                {SHORTCUTS.map(({ keys, description, context }) => (
                  <div
                    key={description}
                    className="flex items-center justify-between border-b border-hairline py-3 last:border-0"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm text-ink">{description}</span>
                      <span className="font-mono text-[10px] text-ink-subtle">{context}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {keys.map((key) => (
                        <kbd
                          key={key}
                          className="inline-flex h-6 min-w-6 items-center justify-center rounded border border-hairline-strong bg-surface-2 px-1.5 font-mono text-[11px] text-ink-secondary"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer hint */}
              <div className="border-t border-hairline px-6 py-3">
                <p className="font-mono text-[10px] text-ink-subtle">
                  Press <kbd className="font-mono">?</kbd> or{" "}
                  <kbd className="font-mono">Esc</kbd> to close
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── KeyboardShortcutsListener ────────────────────────────────────────────────
/**
 * Mount once in the dashboard layout. Registers all global shortcuts and renders
 * the overlay when `?` is pressed.
 */
export function KeyboardShortcutsListener() {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const pathname = usePathname();

  useKeyboardShortcuts({
    // N → open new lead modal (only when on /admin/leads)
    n: () => {
      if (pathname === "/admin/leads" || pathname === "/admin") {
        window.dispatchEvent(new CustomEvent("open-new-lead"));
      }
    },
    N: () => {
      if (pathname === "/admin/leads" || pathname === "/admin") {
        window.dispatchEvent(new CustomEvent("open-new-lead"));
      }
    },
    // Cmd/Ctrl+S → save open drawer
    s: (e) => {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("admin-save"));
      }
    },
    // ? → toggle shortcuts overlay
    "?": () => {
      setOverlayOpen((o) => !o);
    },
    // Esc → close overlay if open (Drawer/Modal handle their own Esc)
    Escape: () => {
      if (overlayOpen) setOverlayOpen(false);
    },
  });

  return (
    <KeyboardShortcutsOverlay
      open={overlayOpen}
      onClose={() => setOverlayOpen(false)}
    />
  );
}

export default KeyboardShortcutsOverlay;
