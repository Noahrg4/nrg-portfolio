"use client";

/**
 * src/components/admin/AddLeadForm.tsx
 *
 * Form inside the "Add Lead" drawer.
 * Field order: Business Name → Niche → Neighborhood → Contact Name → Phone → Email
 *              → Source → Stage → Score factors → Note → Follow-up date → Next action
 *
 * Groups: Contact info / Pipeline / Scoring / Notes + Scheduling
 * POSTs to /api/admin/leads and calls onCreated with the new Lead.
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Lead, ExistingSiteStatus, ScoreFactor, ScoreFactors, LeadOwner } from "@/lib/admin/types";
import {
  PIPELINE_STAGES,
  SCORE_WEIGHTS,
  SCORE_LABELS,
  SCORE_ANCHORS,
  DEFAULT_SCORE_FACTORS,
  computeScore,
  isScoreCappedByNiche,
  getNicheFitFromNiche,
  getNicheTier,
  NICHE_TIER_LABEL,
  NICHE_OPTIONS,
} from "@/lib/admin/types";
import StageSegmentedControl from "./StageSegmentedControl";

interface AddLeadFormProps {
  onCreated: (lead: Lead) => void;
  onCancel: () => void;
}

// ─── Styling constants ──────────────────────────────────────────────────────
const inputClass =
  "w-full rounded-md border border-hairline bg-surface-2 px-4 py-3.5 text-base text-ink placeholder:text-ink-subtle transition-colors duration-200 focus:border-accent focus:outline-none";

const inputErrorClass =
  "border-red-500/60 focus:border-red-500";

const labelClass =
  "font-mono text-[11px] uppercase tracking-wider text-ink-secondary";

const sectionLabelClass =
  "font-mono text-[11px] uppercase tracking-wider text-ink-secondary mb-3";

// ─── Validation ─────────────────────────────────────────────────────────────
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

// ─── Phone formatter (on blur) ──────────────────────────────────────────────
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return value;
}

export default function AddLeadForm({ onCreated, onCancel }: AddLeadFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Field state ─────────────────────────────────────────────────────────
  const [businessName, setBusinessName] = useState("");
  const [niche, setNiche] = useState("");
  const [nicheOther, setNicheOther] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<(typeof PIPELINE_STAGES)[number]>("Found");
  const [scoreFactors, setScoreFactors] = useState<ScoreFactors>({ ...DEFAULT_SCORE_FACTORS });
  const [notes, setNotes] = useState("");
  const [needsFollowUp, setNeedsFollowUp] = useState(false);
  const [followUpAt, setFollowUpAt] = useState("");
  const [nextActionNote, setNextActionNote] = useState("");
  const [existingSiteStatus, setExistingSiteStatus] = useState<ExistingSiteStatus>("unknown");
  const [owner, setOwner] = useState<LeadOwner | null>(null);

  // ── Validation errors ───────────────────────────────────────────────────
  const [businessNameError, setBusinessNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // ── Focus management ────────────────────────────────────────────────────
  const businessNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    businessNameRef.current?.focus();
  }, []);

  // ── Score live preview ──────────────────────────────────────────────────
  // Niche fit (and the LOW-tier cap) follow whatever niche is currently
  // selected. "Other" with no free-text falls through to "Other" which is
  // medium-fit; once the user types a free-text niche it's treated as
  // medium-fit too (the niche-tier map defaults unknowns to medium).
  const resolvedNicheForScore =
    niche === "Other" ? nicheOther.trim() || "Other" : niche;
  const previewScore = computeScore(scoreFactors, resolvedNicheForScore);
  const scoreCapped = isScoreCappedByNiche(scoreFactors, resolvedNicheForScore);
  const nicheFitValue = getNicheFitFromNiche(resolvedNicheForScore);
  const nicheTier = getNicheTier(resolvedNicheForScore);

  function setFactor(key: keyof ScoreFactors, value: ScoreFactor) {
    setScoreFactors((prev) => ({ ...prev, [key]: value }));
  }

  // ── Focus-next on Enter for single-line inputs ──────────────────────────
  function onEnterNext(e: React.KeyboardEvent<HTMLInputElement>, nextId: string) {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById(nextId)?.focus();
    }
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate
    let hasError = false;
    if (!businessName.trim()) {
      setBusinessNameError("Business name is required.");
      hasError = true;
    } else {
      setBusinessNameError(null);
    }
    const eErr = validateEmail(email);
    setEmailError(eErr);
    if (eErr) hasError = true;

    const pErr = validatePhone(phone);
    setPhoneError(pErr);
    if (pErr) hasError = true;

    if (hasError) return;

    setError(null);
    setSaving(true);

    const resolvedNiche = niche === "Other" ? nicheOther.trim() || "Other" : niche;

    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          niche: resolvedNiche,
          neighborhood: neighborhood.trim(),
          phone: phone.trim(),
          email: email.trim(),
          contactName: contactName.trim(),
          stage,
          notes: notes.trim(),
          nextActionNote: nextActionNote.trim(),
          needsFollowUp,
          followUpAt: needsFollowUp ? (followUpAt || null) : null,
          emailedAt: null,
          calledAt: null,
          existingSiteStatus,
          owner,
          scoreFactors,
        }),
      });

      if (res.ok) {
        const lead = (await res.json()) as Lead;
        // Dispatch toast for Agent 5
        window.dispatchEvent(
          new CustomEvent("admin-toast", {
            detail: { message: `Lead "${lead.businessName}" added`, kind: "success" },
          })
        );
        onCreated(lead);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to create lead.");
      }
    } catch {
      setError("Network error — check your connection.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-0" noValidate>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION: Contact info
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-4 pb-6">
        <p className={sectionLabelClass}>Contact info</p>

        {/* Business name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-biz-name" className={labelClass}>
            Business name <span className="text-accent">*</span>
          </label>
          <input
            ref={businessNameRef}
            id="new-biz-name"
            type="text"
            value={businessName}
            onChange={(e) => {
              setBusinessName(e.target.value);
              if (e.target.value.trim()) setBusinessNameError(null);
            }}
            onKeyDown={(e) => onEnterNext(e, "new-niche")}
            placeholder="e.g. El Rey Restaurant"
            autoFocus
            aria-required="true"
            aria-invalid={!!businessNameError}
            aria-describedby={businessNameError ? "biz-name-error" : undefined}
            className={`${inputClass} text-lg font-medium ${businessNameError ? inputErrorClass : ""}`}
          />
          <AnimatePresence mode="wait">
            {businessNameError && (
              <motion.p
                key="biz-name-error"
                id="biz-name-error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="font-mono text-xs text-red-400"
              >
                {businessNameError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Niche + Neighborhood row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-niche" className={labelClass}>Niche</label>
            <select
              id="new-niche"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full rounded-md border border-hairline bg-surface-2 px-4 py-3.5 text-base text-ink transition-colors duration-200 focus:border-accent focus:outline-none"
            >
              <option value="">Select…</option>
              {NICHE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-neighborhood" className={labelClass}>Neighborhood</label>
            <input
              id="new-neighborhood"
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              onKeyDown={(e) => onEnterNext(e, "new-contact-name")}
              placeholder="e.g. Houston Heights, Sugar Land"
              className={inputClass}
            />
          </div>
        </div>

        {/* "Other" niche free-text */}
        <AnimatePresence>
          {niche === "Other" && (
            <motion.div
              key="niche-other"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-niche-other" className={labelClass}>
                  Specify niche
                </label>
                <input
                  id="new-niche-other"
                  type="text"
                  value={nicheOther}
                  onChange={(e) => setNicheOther(e.target.value)}
                  placeholder="e.g. Landscaping, Dentist…"
                  className={inputClass}
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-contact-name" className={labelClass}>Contact name</label>
          <input
            id="new-contact-name"
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            onKeyDown={(e) => onEnterNext(e, "new-phone")}
            placeholder="Decision-maker's name"
            className={inputClass}
          />
        </div>

        {/* Phone + Email row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-phone" className={labelClass}>Phone</label>
            <input
              id="new-phone"
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
              onKeyDown={(e) => onEnterNext(e, "new-email")}
              placeholder="(713) 555-1234"
              aria-invalid={!!phoneError}
              aria-describedby={phoneError ? "phone-error" : undefined}
              className={`${inputClass} ${phoneError ? inputErrorClass : ""}`}
            />
            <AnimatePresence mode="wait">
              {phoneError && (
                <motion.p
                  key="phone-error"
                  id="phone-error"
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
            <label htmlFor="new-email" className={labelClass}>Email</label>
            <input
              id="new-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(validateEmail(e.target.value));
              }}
              onBlur={(e) => setEmailError(validateEmail(e.target.value))}
              placeholder="owner@business.com"
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-error" : undefined}
              className={`${inputClass} ${emailError ? inputErrorClass : ""}`}
            />
            <AnimatePresence mode="wait">
              {emailError && (
                <motion.p
                  key="email-error"
                  id="email-error"
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

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION: Pipeline
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-4 pb-6">
        <p className={sectionLabelClass}>Pipeline</p>

        {/* Stage segmented control */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Stage</label>
          <StageSegmentedControl
            value={stage}
            onChange={setStage}
          />
        </div>

        {/* Owner — Unassigned / Noah / Bela */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Owner</label>
          <div
            className="inline-flex rounded-md border border-hairline bg-surface-2 p-1"
            role="radiogroup"
            aria-label="Lead owner"
          >
            {([
              { value: null,   label: "Unassigned" },
              { value: "Noah", label: "Noah" },
              { value: "Bela", label: "Bela" },
            ] as { value: LeadOwner | null; label: string }[]).map((opt) => {
              const active = owner === opt.value;
              return (
                <button
                  key={opt.label}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setOwner(opt.value)}
                  className={[
                    "flex-1 rounded px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors duration-150",
                    active
                      ? "bg-accent/10 text-accent"
                      : "text-ink-subtle hover:bg-surface-3 hover:text-ink",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Existing website */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Existing website</label>
          <div className="inline-flex rounded-md border border-hairline bg-surface-2 p-1" role="radiogroup" aria-label="Existing website status">
            {([
              { value: "unknown", label: "Unknown" },
              { value: "hasSite", label: "Has site — upgrade" },
              { value: "noSite", label: "No site" },
            ] as { value: ExistingSiteStatus; label: string }[]).map((opt) => {
              const active = existingSiteStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setExistingSiteStatus(opt.value)}
                  className={[
                    "flex-1 rounded px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors duration-150",
                    active
                      ? "bg-accent/10 text-accent"
                      : "text-ink-subtle hover:bg-surface-3 hover:text-ink",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-hairline mb-6" />

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION: Scoring
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-4 pb-6">
        {/* Header row: label + animated score badge */}
        <div className="flex items-center justify-between">
          <p className={sectionLabelClass} style={{ marginBottom: 0 }}>Scoring</p>
          <div className="flex items-center gap-2">
            {scoreCapped && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-red-400">
                Low niche fit — capped at 3
              </span>
            )}
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-subtle">Score</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={previewScore.toFixed(1)}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={[
                  "inline-flex h-8 w-10 items-center justify-center rounded-full font-mono text-sm font-semibold ring-2",
                  previewScore >= 7
                    ? "bg-accent/10 text-accent ring-accent/60"
                    : previewScore >= 4
                    ? "bg-[rgba(245,166,35,0.08)] text-[#F5A623] ring-[rgba(245,166,35,0.5)]"
                    : "bg-surface-3 text-ink-subtle ring-hairline",
                ].join(" ")}
              >
                {previewScore.toFixed(1)}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Three user-input factors as 0–3 segmented controls */}
        <div className="flex flex-col gap-3">
          {(Object.keys(SCORE_LABELS) as Array<keyof ScoreFactors>).map((key) => {
            const value = scoreFactors[key];
            return (
              <div key={key} className="flex flex-col gap-1.5">
                <label className={labelClass}>
                  {SCORE_LABELS[key]}{" "}
                  <span className="text-ink-subtle">· ×{SCORE_WEIGHTS[key]}</span>
                </label>
                <div
                  className="inline-flex rounded-md border border-hairline bg-surface-2 p-1"
                  role="radiogroup"
                  aria-label={SCORE_LABELS[key]}
                >
                  {([0, 1, 2, 3] as ScoreFactor[]).map((n) => {
                    const active = value === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setFactor(key, n)}
                        className={[
                          "flex-1 rounded px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors duration-150",
                          active
                            ? "bg-accent/10 text-accent"
                            : "text-ink-subtle hover:bg-surface-3 hover:text-ink",
                        ].join(" ")}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
                <p className="font-mono text-[10px] text-ink-subtle">
                  {SCORE_ANCHORS[key][value]}
                </p>
              </div>
            );
          })}

          {/* Read-only niche-fit row — derived from niche selection */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>
              Niche Fit <span className="text-ink-subtle">· auto from niche · ×{SCORE_WEIGHTS.nicheFit}</span>
            </label>
            <div
              className={[
                "inline-flex items-center gap-2 rounded-md border px-3 py-2 font-mono text-[11px]",
                nicheTier === "low"
                  ? "border-red-500/40 bg-red-500/5 text-red-400"
                  : nicheTier === "high"
                  ? "border-accent/30 bg-accent/5 text-accent"
                  : "border-hairline bg-surface-2 text-ink-secondary",
              ].join(" ")}
            >
              <span className="font-semibold">{nicheFitValue}</span>
              <span className="text-ink-subtle">/</span>
              <span>
                {resolvedNicheForScore || "no niche"} — {NICHE_TIER_LABEL[nicheTier]}
              </span>
              {nicheTier === "low" && (
                <span className="ml-auto uppercase tracking-wider">Gates score</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-hairline mb-6" />

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION: Notes + Scheduling
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-4 pb-6">
        <p className={sectionLabelClass}>Notes &amp; scheduling</p>

        {/* General notes */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-notes" className={labelClass}>General notes</label>
          <textarea
            id="new-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Context about this lead — what you know, what you saw…"
            className={`${inputClass} resize-y`}
          />
        </div>

        {/* Needs follow-up toggle */}
        <div>
          <label
            htmlFor="new-needs-followup"
            className={[
              "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5",
              "transition-colors duration-150 cursor-pointer",
              needsFollowUp
                ? "border-accent/40 bg-accent/5"
                : "border-hairline bg-surface-2 hover:border-hairline-strong",
            ].join(" ")}
          >
            <span className={[
              "font-mono text-[11px] transition-colors duration-150 select-none",
              needsFollowUp ? "text-ink" : "text-ink-secondary",
            ].join(" ")}>
              Needs follow-up
            </span>
            <div className="relative shrink-0">
              <input
                id="new-needs-followup"
                type="checkbox"
                checked={needsFollowUp}
                onChange={() => {
                  const next = !needsFollowUp;
                  setNeedsFollowUp(next);
                  if (!next) setFollowUpAt("");
                }}
                className="sr-only"
                aria-checked={needsFollowUp}
              />
              <div
                className={[
                  "h-6 w-10 rounded-full transition-colors duration-200",
                  needsFollowUp ? "bg-accent" : "bg-surface-3 border border-hairline-strong",
                ].join(" ")}
                aria-hidden="true"
              >
                <motion.div
                  layout
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className={[
                    "absolute top-[3px] h-[18px] w-[18px] rounded-full shadow-sm",
                    needsFollowUp ? "bg-canvas" : "bg-ink-subtle",
                  ].join(" ")}
                  style={{ left: needsFollowUp ? "19px" : "3px" }}
                />
              </div>
            </div>
          </label>
        </div>

        {/* Follow-up date — only visible when follow-up is needed */}
        <AnimatePresence>
          {needsFollowUp && (
            <motion.div
              key="new-followup-date"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-followup" className={labelClass}>Follow-up date</label>
                <input
                  id="new-followup"
                  type="date"
                  value={followUpAt}
                  onChange={(e) => setFollowUpAt(e.target.value)}
                  onKeyDown={(e) => onEnterNext(e, "new-next-action")}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next action */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-next-action" className={labelClass}>Next action</label>
          <textarea
            id="new-next-action"
            value={nextActionNote}
            onChange={(e) => setNextActionNote(e.target.value)}
            rows={3}
            placeholder="e.g. Send cold email via Gmail, call back Tuesday…"
            className={`${inputClass} resize-y`}
          />
        </div>
      </div>

      {/* API-level error */}
      <AnimatePresence>
        {error && (
          <motion.p
            key="api-error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 font-mono text-sm text-red-300"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="flex gap-3 pb-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex-1 rounded-md border border-hairline-strong px-4 py-3.5 font-mono text-sm uppercase tracking-wider text-ink-secondary hover:border-accent hover:text-accent transition-colors duration-200 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-3.5 font-mono text-sm font-medium uppercase tracking-wider text-canvas transition-shadow duration-200 hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? (
            <>
              <span
                aria-hidden
                className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-canvas border-r-transparent"
              />
              Adding…
            </>
          ) : (
            "Add Lead"
          )}
        </button>
      </div>
    </form>
  );
}
