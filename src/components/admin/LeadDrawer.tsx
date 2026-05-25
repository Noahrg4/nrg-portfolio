"use client";

/**
 * src/components/admin/LeadDrawer.tsx
 *
 * Full lead detail + edit drawer. Opens when a lead row is clicked.
 * Handles both VIEW (edit existing lead) and CREATE (unused path — create uses AddLeadForm).
 *
 * Sections:
 *   1. Header: "Edit — {businessName}" or "New lead"
 *   2. Status row: StageChip + ScoreBadge + touch count
 *   3. Action buttons: Mark emailed / called / Convert
 *   4. Contact info group (editable)
 *   5. Pipeline group: Stage (segmented) + Source
 *   6. Scoring group: 4 toggles + live score badge
 *   7. Notes & scheduling group
 *   8. Timestamps + Stage history (read-only)
 *   9. Save / Cancel buttons
 *
 * Keyboard:
 *   - Escape closes (handled by Drawer.tsx)
 *   - Tab / Shift+Tab trapped inside drawer
 *   - Enter in single-line inputs moves to next field
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Lead, PipelineStage, ConvertLeadBody } from "@/lib/admin/types";
import { SCORE_WEIGHTS, computeScore, TERMINAL_STAGES } from "@/lib/admin/types";
import Drawer from "./Drawer";
import StageChip from "./StageChip";
import ScoreBadge from "./ScoreBadge";
import Modal from "./Modal";
import StageSegmentedControl from "./StageSegmentedControl";
import ScoreToggleSwitch from "./ScoreToggleSwitch";

interface LeadDrawerProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onUpdated: (updated: Lead) => void;
  onConverted: (leadId: string) => void;
}

// ─── Niche / Source options ─────────────────────────────────────────────────
const NICHE_OPTIONS = ["Restaurant", "HVAC", "Law", "Salon", "Trades", "Retail", "Other"];
const SOURCE_OPTIONS = ["Google Maps cold", "Walk-in", "Referral", "Inbound", "Other"];

// ─── Score factor display labels ────────────────────────────────────────────
const FACTOR_LABELS: Record<keyof typeof SCORE_WEIGHTS, string> = {
  badOrNoWebsite: "Bad/no website",
  clearlyMakingMoney: "Clearly making money",
  easyToReach: "Easy to reach",
  goodNicheFit: "Good niche fit",
};

// ─── Styling ─────────────────────────────────────────────────────────────────
const inputClass =
  "w-full rounded-md border border-hairline bg-surface-2 px-4 py-3.5 text-base text-ink placeholder:text-ink-subtle transition-colors duration-200 focus:border-accent focus:outline-none";

const inputErrorClass = "border-red-500/60 focus:border-red-500";

const labelClass = "font-mono text-[11px] uppercase tracking-wider text-ink-secondary";

const sectionLabelClass =
  "font-mono text-[11px] uppercase tracking-wider text-ink-secondary mb-3";

// ─── Validation ──────────────────────────────────────────────────────────────
function validateEmail(v: string): string | null {
  if (!v.trim()) return null;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(v.trim()) ? null : "Invalid email address";
}

function validatePhone(v: string): string | null {
  if (!v.trim()) return null;
  const digits = v.replace(/\D/g, "");
  return digits.length >= 10 ? null : "Phone must have at least 10 digits";
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return value;
}

function fmt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Focus trap helper ───────────────────────────────────────────────────────
const FOCUSABLE_SELECTORS =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const focusable = Array.from(
        container!.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
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

    container.addEventListener("keydown", handleTab);
    return () => container.removeEventListener("keydown", handleTab);
  }, [active, containerRef]);
}

// ════════════════════════════════════════════════════════════════════════════
export default function LeadDrawer({
  lead,
  open,
  onClose,
  onUpdated,
  onConverted,
}: LeadDrawerProps) {
  const drawerBodyRef = useRef<HTMLDivElement>(null);
  useFocusTrap(drawerBodyRef, open);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Editable field state ────────────────────────────────────────────────
  const [businessName, setBusinessName] = useState("");
  const [niche, setNiche] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("");
  const [stage, setStage] = useState<PipelineStage>("Found");
  const [scoreFactors, setScoreFactors] = useState({
    badOrNoWebsite: false,
    clearlyMakingMoney: false,
    easyToReach: false,
    goodNicheFit: false,
  });
  const [notes, setNotes] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [nextActionNote, setNextActionNote] = useState("");

  // ── Inline validation errors ────────────────────────────────────────────
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // ── Action & convert state ──────────────────────────────────────────────
  const [actionLoading, setActionLoading] = useState<"email" | "call" | null>(null);
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertData, setConvertData] = useState<ConvertLeadBody>({
    monthlyCharge: 0,
    oneTimeValue: 500,
    siteUrl: "",
    startDate: new Date().toISOString().slice(0, 10),
  });
  const [convertSaving, setConvertSaving] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  // ── Sync local state from lead ──────────────────────────────────────────
  const syncLocal = useCallback((l: Lead) => {
    setBusinessName(l.businessName);
    setNiche(l.niche);
    setNeighborhood(l.neighborhood);
    setContactName(l.contactName);
    setPhone(l.phone);
    setEmail(l.email);
    setSource(l.source);
    setStage(l.stage);
    setFollowUpAt(l.followUpAt ?? "");
    setNotes(l.notes);
    setNextActionNote(l.nextActionNote);
    setScoreFactors({ ...l.scoreFactors });
    setEmailError(null);
    setPhoneError(null);
    setSaveError(null);
  }, []);

  // Sync when drawer opens with a new lead
  // We use a ref to track whether we've synced for the current open+lead combo
  const syncedForRef = useRef<string | null>(null);
  if (open && lead && syncedForRef.current !== lead.id) {
    syncedForRef.current = lead.id;
    syncLocal(lead);
  }
  if (!open && syncedForRef.current !== null) {
    syncedForRef.current = null;
  }

  // Wire Cmd+S: KeyboardShortcuts dispatches "admin-save" when drawer is open.
  // Use a ref so the listener always calls the latest handleSave closure.
  // IMPORTANT: these hooks must be called unconditionally (above any early
  // return) per the rules of hooks. handleSave is assigned to the ref later.
  const handleSaveRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (!open) return;
    function onAdminSave() {
      handleSaveRef.current();
    }
    window.addEventListener("admin-save", onAdminSave);
    return () => window.removeEventListener("admin-save", onAdminSave);
  }, [open]);

  if (!lead) return null;

  const currentScore = computeScore(scoreFactors);
  const isTerminal = TERMINAL_STAGES.includes(lead.stage);

  // ── Enter-to-next-field ─────────────────────────────────────────────────
  function onEnterNext(e: React.KeyboardEvent<HTMLInputElement>, nextId: string) {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById(nextId)?.focus();
    }
  }

  // ── Patch helper ────────────────────────────────────────────────────────
  async function patch(leadId: string, body: Record<string, unknown>): Promise<Lead | null> {
    const res = await fetch(`/api/admin/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to update lead");
    return (await res.json()) as Lead;
  }

  // ── Save ────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!lead) return;
    // Validate
    const eErr = validateEmail(email);
    const pErr = validatePhone(phone);
    setEmailError(eErr);
    setPhoneError(pErr);
    if (eErr || pErr) return;

    setSaving(true);
    setSaveError(null);
    try {
      const updated = await patch(lead.id, {
        businessName: businessName.trim(),
        niche: niche.trim(),
        neighborhood: neighborhood.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        source: source.trim(),
        stage,
        followUpAt: followUpAt || null,
        notes,
        nextActionNote,
        scoreFactors,
      });
      if (updated) {
        onUpdated(updated);
        syncLocal(updated);
        window.dispatchEvent(
          new CustomEvent("admin-toast", {
            detail: { message: "Lead saved", kind: "success" },
          })
        );
        onClose();
      }
    } catch {
      setSaveError("Failed to save — check your connection.");
    } finally {
      setSaving(false);
    }
  }

  // Keep the ref pointed at the latest handleSave closure (assignment only —
  // no hook call here; the useRef + useEffect live above the early return).
  handleSaveRef.current = handleSave;

  // ── Action buttons ──────────────────────────────────────────────────────
  async function handleAction(type: "email" | "call") {
    if (!lead) return;
    const leadId = lead.id;
    setActionLoading(type);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/${type}`, { method: "POST" });
      if (res.ok) {
        const updated = (await res.json()) as Lead;
        onUpdated(updated);
        syncLocal(updated);
        window.dispatchEvent(
          new CustomEvent("admin-toast", {
            detail: {
              message: type === "email" ? "Marked as emailed" : "Marked as called",
              kind: "success",
            },
          })
        );
      }
    } catch {
      /* silent */
    } finally {
      setActionLoading(null);
    }
  }

  // ── Convert ─────────────────────────────────────────────────────────────
  async function handleConvert() {
    if (!lead) return;
    const leadId = lead.id;
    const leadName = lead.businessName;
    setConvertSaving(true);
    setConvertError(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(convertData),
      });
      if (res.ok) {
        onConverted(leadId);
        setConvertOpen(false);
        window.dispatchEvent(
          new CustomEvent("admin-toast", {
            detail: { message: `${leadName} converted to client`, kind: "success" },
          })
        );
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        setConvertError(data.error ?? "Convert failed.");
      }
    } catch {
      setConvertError("Network error.");
    } finally {
      setConvertSaving(false);
    }
  }

  function toggleFactor(key: keyof typeof scoreFactors) {
    setScoreFactors((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // ════════════════════════════════════════════════════════════════════════
  return (
    <>
      <Drawer
        open={open}
        onClose={() => {
          syncedForRef.current = null;
          onClose();
        }}
        title={`Edit — ${lead.businessName}`}
        subtitle={[lead.niche, lead.neighborhood].filter(Boolean).join(" · ")}
        width="max-w-lg"
      >
        {/* Focus trap container — wraps everything inside the drawer body */}
        <div ref={drawerBodyRef} className="flex flex-col gap-0">

          {/* ─── Status row ──────────────────────────────────────────────── */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <StageChip stage={lead.stage} />
            <ScoreBadge score={currentScore} size="md" />
            <span className="font-mono text-[11px] text-ink-subtle">
              {lead.touchCount} touch{lead.touchCount !== 1 ? "es" : ""}
            </span>
            {lead.stage === "Won" && lead.convertedClientId && (
              <span className="font-mono text-[11px] text-[#28CA41]">
                ✓ Converted
              </span>
            )}
          </div>

          {/* ─── Quick action buttons ─────────────────────────────────────── */}
          {!isTerminal && (
            <div className="mb-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleAction("email")}
                disabled={!!actionLoading}
                aria-label="Mark lead as emailed"
                className="flex items-center gap-1.5 rounded-md border border-hairline px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-ink-secondary hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
              >
                {actionLoading === "email" ? (
                  <span
                    aria-hidden
                    className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent"
                  />
                ) : (
                  "✉"
                )}{" "}
                Mark Emailed
              </button>
              <button
                type="button"
                onClick={() => handleAction("call")}
                disabled={!!actionLoading}
                aria-label="Mark lead as called"
                className="flex items-center gap-1.5 rounded-md border border-hairline px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-ink-secondary hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
              >
                {actionLoading === "call" ? (
                  <span
                    aria-hidden
                    className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent"
                  />
                ) : (
                  "☎"
                )}{" "}
                Mark Called
              </button>
              {lead.stage === "Proposal" && (
                <button
                  type="button"
                  onClick={() => setConvertOpen(true)}
                  className="flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-accent hover:bg-accent/15 transition-colors"
                >
                  ★ Convert to Client
                </button>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-hairline mb-6" />

          {/* ═══════════════════════════════════════════════════════════════
              SECTION: Contact info
          ════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-4 pb-6">
            <p className={sectionLabelClass}>Contact info</p>

            {/* Business name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-biz-name" className={labelClass}>Business name</label>
              <input
                id="edit-biz-name"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                onKeyDown={(e) => onEnterNext(e, "edit-niche")}
                disabled={saving}
                className={`${inputClass} text-lg font-medium`}
              />
            </div>

            {/* Niche + Neighborhood */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-niche" className={labelClass}>Niche</label>
                <select
                  id="edit-niche"
                  value={NICHE_OPTIONS.includes(niche) ? niche : niche ? "Other" : ""}
                  onChange={(e) => setNiche(e.target.value)}
                  disabled={saving}
                  className="w-full rounded-md border border-hairline bg-surface-2 px-4 py-3.5 text-base text-ink transition-colors duration-200 focus:border-accent focus:outline-none disabled:opacity-50"
                >
                  <option value="">Select…</option>
                  {NICHE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                {/* If stored niche isn't in dropdown options, show it as free-text */}
                {niche && !NICHE_OPTIONS.includes(niche) && (
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="Niche"
                    disabled={saving}
                    className={`${inputClass} mt-1.5`}
                  />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-neighborhood" className={labelClass}>Neighborhood</label>
                <input
                  id="edit-neighborhood"
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  onKeyDown={(e) => onEnterNext(e, "edit-contact-name")}
                  placeholder="e.g. Houston Heights"
                  disabled={saving}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Contact name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-contact-name" className={labelClass}>Contact name</label>
              <input
                id="edit-contact-name"
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                onKeyDown={(e) => onEnterNext(e, "edit-phone")}
                placeholder="Decision-maker's name"
                disabled={saving}
                className={inputClass}
              />
            </div>

            {/* Phone + Email */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-phone" className={labelClass}>Phone</label>
                <input
                  id="edit-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError(validatePhone(e.target.value));
                  }}
                  onBlur={(e) => {
                    const formatted = formatPhone(e.target.value);
                    setPhone(formatted);
                    setPhoneError(validatePhone(formatted));
                  }}
                  onKeyDown={(e) => onEnterNext(e, "edit-email")}
                  placeholder="(713) 555-1234"
                  disabled={saving}
                  aria-invalid={!!phoneError}
                  aria-describedby={phoneError ? "edit-phone-error" : undefined}
                  className={`${inputClass} ${phoneError ? inputErrorClass : ""}`}
                />
                <AnimatePresence mode="wait">
                  {phoneError && (
                    <motion.p
                      key="edit-phone-error"
                      id="edit-phone-error"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="font-mono text-xs text-red-400"
                    >
                      {phoneError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-email" className={labelClass}>Email</label>
                <input
                  id="edit-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(validateEmail(e.target.value));
                  }}
                  onBlur={(e) => setEmailError(validateEmail(e.target.value))}
                  onKeyDown={(e) => onEnterNext(e, "edit-source")}
                  placeholder="owner@business.com"
                  disabled={saving}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "edit-email-error" : undefined}
                  className={`${inputClass} ${emailError ? inputErrorClass : ""}`}
                />
                <AnimatePresence mode="wait">
                  {emailError && (
                    <motion.p
                      key="edit-email-error"
                      id="edit-email-error"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="font-mono text-xs text-red-400"
                    >
                      {emailError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-hairline mb-6" />

          {/* ═══════════════════════════════════════════════════════════════
              SECTION: Pipeline
          ════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-4 pb-6">
            <p className={sectionLabelClass}>Pipeline</p>

            {/* Source */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-source" className={labelClass}>Source</label>
              <select
                id="edit-source"
                value={SOURCE_OPTIONS.includes(source) ? source : source ? "Other" : ""}
                onChange={(e) => setSource(e.target.value)}
                disabled={saving}
                className="w-full rounded-md border border-hairline bg-surface-2 px-4 py-3.5 text-base text-ink transition-colors duration-200 focus:border-accent focus:outline-none disabled:opacity-50"
              >
                <option value="">Select source…</option>
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {/* Show free-text if stored source doesn't match options */}
              {source && !SOURCE_OPTIONS.includes(source) && (
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Source"
                  disabled={saving}
                  className={`${inputClass} mt-1.5`}
                />
              )}
            </div>

            {/* Stage — segmented control */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Stage</label>
              <StageSegmentedControl
                value={stage}
                onChange={setStage}
                disabled={saving || isTerminal}
              />
              {isTerminal && (
                <p className="font-mono text-[10px] text-ink-subtle">
                  Stage locked — lead is in a terminal state.
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-hairline mb-6" />

          {/* ═══════════════════════════════════════════════════════════════
              SECTION: Scoring
          ════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-4 pb-6">
            <div className="flex items-center justify-between">
              <p className={sectionLabelClass} style={{ marginBottom: 0 }}>Scoring</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-subtle">Score</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentScore}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className={[
                      "inline-flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm font-semibold ring-2",
                      currentScore >= 7
                        ? "bg-accent/10 text-accent ring-accent/60"
                        : currentScore >= 4
                        ? "bg-[rgba(245,166,35,0.08)] text-[#F5A623] ring-[rgba(245,166,35,0.5)]"
                        : "bg-surface-3 text-ink-subtle ring-hairline",
                    ].join(" ")}
                  >
                    {currentScore % 1 === 0 ? currentScore : currentScore.toFixed(1)}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(Object.keys(SCORE_WEIGHTS) as Array<keyof typeof SCORE_WEIGHTS>).map((key) => (
                <ScoreToggleSwitch
                  key={key}
                  id={`edit-factor-${key}`}
                  checked={scoreFactors[key]}
                  onChange={() => toggleFactor(key)}
                  label={FACTOR_LABELS[key]}
                  weight={SCORE_WEIGHTS[key]}
                  disabled={saving}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-hairline mb-6" />

          {/* ═══════════════════════════════════════════════════════════════
              SECTION: Notes & Scheduling
          ════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-4 pb-6">
            <p className={sectionLabelClass}>Notes &amp; scheduling</p>

            {/* General notes */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-notes" className={labelClass}>General notes</label>
              <textarea
                id="edit-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Context about this lead…"
                disabled={saving}
                className={`${inputClass} resize-y`}
              />
            </div>

            {/* Follow-up date */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-followup" className={labelClass}>Follow-up date</label>
              <input
                id="edit-followup"
                type="date"
                value={followUpAt}
                onChange={(e) => setFollowUpAt(e.target.value)}
                onKeyDown={(e) => onEnterNext(e, "edit-next-action")}
                disabled={saving}
                className={`${inputClass} font-mono`}
              />
            </div>

            {/* Next action */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-next-action" className={labelClass}>Next action</label>
              <textarea
                id="edit-next-action"
                value={nextActionNote}
                onChange={(e) => setNextActionNote(e.target.value)}
                rows={3}
                placeholder="e.g. Send follow-up email, call back Tuesday…"
                disabled={saving}
                className={`${inputClass} resize-y`}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-hairline mb-6" />

          {/* ─── Timestamps (read-only) ──────────────────────────────────── */}
          <div className="mb-5 grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-surface-2 px-4 py-3 font-mono text-[11px]">
            <span className="text-ink-subtle">Last emailed</span>
            <span className="text-right text-ink-secondary">{fmt(lead.emailedAt)}</span>
            <span className="text-ink-subtle">Last called</span>
            <span className="text-right text-ink-secondary">{fmt(lead.calledAt)}</span>
            <span className="text-ink-subtle">Created</span>
            <span className="text-right text-ink-secondary">{fmt(lead.createdAt)}</span>
            <span className="text-ink-subtle">Updated</span>
            <span className="text-right text-ink-secondary">{fmt(lead.updatedAt)}</span>
          </div>

          {/* ─── Stage history ───────────────────────────────────────────── */}
          {lead.stageHistory.length > 0 && (
            <div className="mb-6 flex flex-col gap-2">
              <p className={labelClass}>Stage history</p>
              <div className="flex flex-col gap-1">
                {[...lead.stageHistory].reverse().map((entry, i) => (
                  <div key={i} className="flex items-center justify-between font-mono text-[11px]">
                    <StageChip stage={entry.stage} size="sm" />
                    <span className="text-ink-subtle">{fmt(entry.at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Save error ───────────────────────────────────────────────── */}
          <AnimatePresence>
            {saveError && (
              <motion.p
                key="save-error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 font-mono text-sm text-red-300"
              >
                {saveError}
              </motion.p>
            )}
          </AnimatePresence>

          {/* ─── Save / Cancel ────────────────────────────────────────────── */}
          <div className="flex gap-3 pb-2">
            <button
              type="button"
              onClick={() => {
                syncedForRef.current = null;
                onClose();
              }}
              disabled={saving}
              className="flex-1 rounded-md border border-hairline-strong px-4 py-3.5 font-mono text-sm uppercase tracking-wider text-ink-secondary hover:border-accent hover:text-accent transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-3.5 font-mono text-sm font-medium uppercase tracking-wider text-canvas transition-shadow duration-200 hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] active:scale-[0.98] disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span
                    aria-hidden
                    className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-canvas border-r-transparent"
                  />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </div>
      </Drawer>

      {/* ─── Convert to Client modal ───────────────────────────────────────── */}
      <Modal
        open={convertOpen}
        onClose={() => {
          setConvertOpen(false);
          setConvertError(null);
        }}
        title="Convert to client"
        width="max-w-md"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-secondary">
            Converting{" "}
            <strong className="text-ink">{lead.businessName}</strong> will create a client record
            and mark this lead as Won.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>One-time project value ($)</label>
            <input
              type="number"
              min={0}
              value={convertData.oneTimeValue}
              onChange={(e) =>
                setConvertData((d) => ({ ...d, oneTimeValue: Number(e.target.value) }))
              }
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Monthly retainer ($, 0 if none)</label>
            <input
              type="number"
              min={0}
              value={convertData.monthlyCharge}
              onChange={(e) =>
                setConvertData((d) => ({ ...d, monthlyCharge: Number(e.target.value) }))
              }
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Site URL (leave blank if not live yet)</label>
            <input
              type="url"
              value={convertData.siteUrl}
              onChange={(e) =>
                setConvertData((d) => ({ ...d, siteUrl: e.target.value }))
              }
              placeholder="https://example.com"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Start date</label>
            <input
              type="date"
              value={convertData.startDate}
              onChange={(e) =>
                setConvertData((d) => ({ ...d, startDate: e.target.value }))
              }
              className={`${inputClass} font-mono`}
            />
          </div>

          <AnimatePresence>
            {convertError && (
              <motion.p
                key="convert-error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 font-mono text-sm text-red-300"
              >
                {convertError}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={handleConvert}
            disabled={convertSaving}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-md bg-accent px-6 py-3.5 font-mono text-sm uppercase tracking-wider text-canvas transition-shadow hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] active:scale-[0.98] disabled:opacity-60"
          >
            {convertSaving ? "Converting…" : "Confirm Convert →"}
          </button>
        </div>
      </Modal>
    </>
  );
}
