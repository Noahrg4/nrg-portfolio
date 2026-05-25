"use client";

/**
 * src/components/admin/QuickActionsRow.tsx
 *
 * Three quick-action icon buttons for each lead row in the LeadsTab list view.
 * Designed to be dropped into the lead row by Agent 2.
 *
 * Usage:
 *   import QuickActionsRow from "@/components/admin/QuickActionsRow";
 *
 *   <QuickActionsRow
 *     leadId={lead.id}
 *     onUpdated={(updated) => handleLeadUpdate(updated)}
 *   />
 *
 * The component calls the API directly and reports back via onUpdated.
 * Optionally accepts an onFollowUpSet callback for the date popover.
 */

import { useState, useRef, useEffect } from "react";
import type { Lead } from "@/lib/admin/types";

interface QuickActionsRowProps {
  leadId: string;
  onUpdated: (updated: Lead) => void;
  /** Called after a follow-up date is set, in addition to onUpdated */
  onFollowUpSet?: (date: string) => void;
  disabled?: boolean;
}

/** Envelope icon */
function IconEmail({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-4 w-4"}
      aria-hidden="true"
    >
      <rect x="1.5" y="3" width="13" height="10" rx="1.5" />
      <path d="M1.5 5.5 8 9l6.5-3.5" />
    </svg>
  );
}

/** Phone icon */
function IconPhone({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-4 w-4"}
      aria-hidden="true"
    >
      <path d="M3 2h2.5l1 3-1.5 1a8.5 8.5 0 0 0 3 3l1-1.5 3 1V11a1 1 0 0 1-1 1C5.5 12 2 6 2 3a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

/** Calendar icon */
function IconCalendar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-4 w-4"}
      aria-hidden="true"
    >
      <rect x="2" y="3" width="12" height="11" rx="1.5" />
      <path d="M5 1.5v3M11 1.5v3M2 7h12" />
    </svg>
  );
}

/** Spinner */
function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}

export default function QuickActionsRow({
  leadId,
  onUpdated,
  onFollowUpSet,
  disabled = false,
}: QuickActionsRowProps) {
  const [emailLoading, setEmailLoading] = useState(false);
  const [callLoading, setCallLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpSaving, setFollowUpSaving] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const calendarBtnRef = useRef<HTMLButtonElement>(null);

  // Close popover on outside click
  useEffect(() => {
    if (!calendarOpen) return;
    function handleOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        calendarBtnRef.current &&
        !calendarBtnRef.current.contains(e.target as Node)
      ) {
        setCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [calendarOpen]);

  // Close popover on Escape
  useEffect(() => {
    if (!calendarOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setCalendarOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [calendarOpen]);

  async function handleEmail() {
    setEmailLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/email`, { method: "POST" });
      if (res.ok) {
        const updated = (await res.json()) as Lead;
        onUpdated(updated);
        // Dispatch toast event for Agent 5
        window.dispatchEvent(
          new CustomEvent("admin-toast", {
            detail: { message: "Marked as emailed", kind: "success" },
          })
        );
      }
    } catch {
      window.dispatchEvent(
        new CustomEvent("admin-toast", {
          detail: { message: "Failed to mark emailed", kind: "error" },
        })
      );
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleCall() {
    setCallLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/call`, { method: "POST" });
      if (res.ok) {
        const updated = (await res.json()) as Lead;
        onUpdated(updated);
        window.dispatchEvent(
          new CustomEvent("admin-toast", {
            detail: { message: "Marked as called", kind: "success" },
          })
        );
      }
    } catch {
      window.dispatchEvent(
        new CustomEvent("admin-toast", {
          detail: { message: "Failed to mark called", kind: "error" },
        })
      );
    } finally {
      setCallLoading(false);
    }
  }

  async function handleFollowUpSave() {
    if (!followUpDate) return;
    setFollowUpSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpAt: followUpDate }),
      });
      if (res.ok) {
        const updated = (await res.json()) as Lead;
        onUpdated(updated);
        onFollowUpSet?.(followUpDate);
        setCalendarOpen(false);
        setFollowUpDate("");
        window.dispatchEvent(
          new CustomEvent("admin-toast", {
            detail: { message: "Follow-up date set", kind: "success" },
          })
        );
      }
    } catch {
      window.dispatchEvent(
        new CustomEvent("admin-toast", {
          detail: { message: "Failed to set follow-up", kind: "error" },
        })
      );
    } finally {
      setFollowUpSaving(false);
    }
  }

  const btnBase =
    "relative flex h-7 w-7 items-center justify-center rounded-md border border-hairline text-ink-subtle transition-colors duration-150 hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {/* Mark emailed */}
      <button
        type="button"
        onClick={handleEmail}
        disabled={disabled || emailLoading}
        title="Mark emailed"
        aria-label="Mark lead as emailed"
        className={btnBase}
      >
        {emailLoading ? <Spinner /> : <IconEmail />}
      </button>

      {/* Mark called */}
      <button
        type="button"
        onClick={handleCall}
        disabled={disabled || callLoading}
        title="Mark called"
        aria-label="Mark lead as called"
        className={btnBase}
      >
        {callLoading ? <Spinner /> : <IconPhone />}
      </button>

      {/* Set follow-up — opens inline date popover */}
      <div className="relative">
        <button
          ref={calendarBtnRef}
          type="button"
          onClick={() => setCalendarOpen((o) => !o)}
          disabled={disabled}
          title="Set follow-up date"
          aria-label="Set follow-up date"
          aria-expanded={calendarOpen}
          aria-haspopup="true"
          className={[btnBase, calendarOpen ? "border-accent text-accent" : ""].join(" ")}
        >
          <IconCalendar />
        </button>

        {/* Inline date popover */}
        {calendarOpen && (
          <div
            ref={popoverRef}
            role="dialog"
            aria-label="Set follow-up date"
            className={[
              "absolute right-0 top-full mt-2 z-50",
              "w-56 rounded-xl border border-hairline-strong bg-surface-1 p-3 shadow-2xl",
            ].join(" ")}
          >
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-ink-subtle">
              Follow-up date
            </p>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              autoFocus
              className="w-full rounded-md border border-hairline bg-surface-2 px-3 py-2 font-mono text-sm text-ink focus:border-accent focus:outline-none transition-colors"
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={handleFollowUpSave}
                disabled={!followUpDate || followUpSaving}
                className="flex-1 rounded-md bg-accent py-1.5 font-mono text-[11px] uppercase tracking-wider text-canvas transition-shadow hover:shadow-[0_0_16px_rgba(0,212,255,0.3)] disabled:opacity-50"
              >
                {followUpSaving ? "Saving…" : "Set"}
              </button>
              <button
                type="button"
                onClick={() => setCalendarOpen(false)}
                className="flex-1 rounded-md border border-hairline py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-secondary hover:border-accent hover:text-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
