"use client";

/**
 * src/components/admin/ToastProvider.tsx
 *
 * Global toast stack for the admin dashboard.
 *
 * ── Event contract ───────────────────────────────────────────────────────────
 * Any component anywhere in the dashboard can show a toast by dispatching:
 *
 *   window.dispatchEvent(
 *     new CustomEvent("admin-toast", {
 *       detail: {
 *         message: "Lead saved",           // required — string
 *         kind: "success",                 // required — "success" | "error" | "info"
 *         duration: 3000,                  // optional — ms before auto-dismiss (default 3000)
 *       },
 *     })
 *   );
 *
 * ToastProvider subscribes to this event and manages the visible stack.
 * Toast items stack bottom-to-top at position: fixed, bottom-right.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Mount at the root of the dashboard layout (not login) — once only.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Toast, { type ToastItem, type ToastKind } from "./Toast";

interface ToastDetail {
  message: string;
  kind?: ToastKind;
  duration?: number;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    function handleToastEvent(e: Event) {
      const detail = (e as CustomEvent<ToastDetail>).detail;
      if (!detail?.message) return;

      const id = `toast-${Date.now()}-${++counterRef.current}`;
      const item: ToastItem = {
        id,
        message: detail.message,
        kind: detail.kind ?? "info",
        duration: detail.duration ?? 3000,
      };

      setToasts((prev) => [...prev, item]);
    }

    window.addEventListener("admin-toast", handleToastEvent);
    return () => window.removeEventListener("admin-toast", handleToastEvent);
  }, []);

  return (
    <>
      {children}

      {/* Toast stack — fixed bottom-right, above all other z-layers */}
      <div
        aria-label="Notifications"
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col-reverse items-end gap-2"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast toast={toast} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
