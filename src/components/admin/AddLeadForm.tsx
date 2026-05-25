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
import type { Lead } from "@/lib/admin/types";
import { PIPELINE_STAGES, SCORE_WEIGHTS, computeScore } from "@/lib/admin/types";
import StageSegmentedControl from "./StageSegmentedControl";
import ScoreToggleSwitch from "./ScoreToggleSwitch";

interface AddLeadFormProps {
  onCreated: (lead: Lead) => void;
  onCancel: () => void;
}

// ─── Niche options ─────────────────────────────────────────────────────────
const NICHE_OPTIONS = [
  "Restaurant",
  "HVAC",
  "Law",
  "Salon",
  "Trades",
  "Retail",
  "Other",
];

// ─── Source options ─────────────────────────────────────────────────────────
const SOURCE_OPTIONS = [
  "Google Maps cold",
  "Walk-in",
  "Referral",
  "Inbound",
  "Other",
];

// ─── Styling constants ──────────────────────────────────────────────────────
const inputClass =
  "w-full rounded-md border border-hairline bg-surface-2 px-4 py-3.5 text-base text-ink placeholder:text-ink-subtle transition-colors duration-200 focus:border-accent focus:outline-none";

const inputErrorClass =
  "border-red-500/60 focus:border-red-500";

const labelClass =
  "font-mono text-[11px] uppercase tracking-wider text-ink-secondary";

const sectionLabelClass =
  "font-mono text-[11px] uppercase tracking-wider text-ink-secondary mb-3";

// ─── Score factor display labels ────────────────────────────────────────────
const FACTOR_LABELS: Record<keyof typeof SCORE_WEIGHTS, string> = {
  badOrNoWebsite: "Bad/no website",
  clearlyMakingMoney: "Clearly making money",
  easyToReach: "Easy to reach",
  goodNicheFit: "Good niche fit",
};

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
  const [source, setSource] = useState("");
  const [stage, setStage] = useState<(typeof PIPELINE_STAGES)[number]>("Found");
  const [scoreFactors, setScoreFactors] = useState({
    badOrNoWebsite: false,
    clearlyMakingMoney: false,
    easyToReach: false,
    goodNicheFit: false,
  });
  const [notes, setNotes] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [nextActionNote, setNextActionNote] = useState("");

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
  const previewScore = computeScore(scoreFactors);

  function toggleFactor(key: keyof typeof scoreFactors) {
    setScoreFactors((prev) => ({ ...prev, [key]: !prev[key] }));
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
          source: source.trim(),
          stage,
          notes: notes.trim(),
          nextActionNote: nextActionNote.trim(),
          followUpAt: followUpAt || null,
          emailedAt: null,
          calledAt: null,
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
              onKeyDown={(e) => onEnterNext(e, "new-source")}
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

        {/* Source */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-source" className={labelClass}>Source</label>
          <select
            id="new-source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full rounded-md border border-hairline bg-surface-2 px-4 py-3.5 text-base text-ink transition-colors duration-200 focus:border-accent focus:outline-none"
          >
            <option value="">Select source…</option>
            {SOURCE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Stage segmented control */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Stage</label>
          <StageSegmentedControl
            value={stage}
            onChange={setStage}
          />
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
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-subtle">Score</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={previewScore}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={[
                  "inline-flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm font-semibold ring-2",
                  previewScore >= 7
                    ? "bg-accent/10 text-accent ring-accent/60"
                    : previewScore >= 4
                    ? "bg-[rgba(245,166,35,0.08)] text-[#F5A623] ring-[rgba(245,166,35,0.5)]"
                    : "bg-surface-3 text-ink-subtle ring-hairline",
                ].join(" ")}
              >
                {previewScore % 1 === 0 ? previewScore : previewScore.toFixed(1)}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Toggle switches */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(Object.keys(SCORE_WEIGHTS) as Array<keyof typeof SCORE_WEIGHTS>).map((key) => (
            <ScoreToggleSwitch
              key={key}
              id={`new-factor-${key}`}
              checked={scoreFactors[key]}
              onChange={() => toggleFactor(key)}
              label={FACTOR_LABELS[key]}
              weight={SCORE_WEIGHTS[key]}
            />
          ))}
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

        {/* Follow-up date */}
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
