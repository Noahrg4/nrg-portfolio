"use client";

/**
 * src/components/admin/AddLeadForm.tsx
 *
 * Form inside the "Add Lead" modal. Covers all Lead fields.
 * POSTs to /api/admin/leads and calls onCreated with the new Lead.
 */

import { useState } from "react";
import type { Lead } from "@/lib/admin/types";
import { PIPELINE_STAGES, SCORE_WEIGHTS, computeScore } from "@/lib/admin/types";

interface AddLeadFormProps {
  onCreated: (lead: Lead) => void;
  onCancel: () => void;
}

const inputClass =
  "w-full rounded-md border border-hairline bg-surface-2 px-4 py-3 text-base text-ink placeholder:text-ink-subtle transition-colors focus:border-accent focus:outline-none";

const labelClass = "font-mono text-[10px] uppercase tracking-wider text-ink-subtle";

export default function AddLeadForm({ onCreated, onCancel }: AddLeadFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [niche, setNiche] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [source, setSource] = useState("");
  const [stage, setStage] = useState<(typeof PIPELINE_STAGES)[number]>("Found");
  const [notes, setNotes] = useState("");
  const [nextActionNote, setNextActionNote] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [scoreFactors, setScoreFactors] = useState({
    badOrNoWebsite: false,
    clearlyMakingMoney: false,
    easyToReach: false,
    goodNicheFit: false,
  });

  function toggleFactor(key: keyof typeof scoreFactors) {
    setScoreFactors((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim()) {
      setError("Business name is required.");
      return;
    }
    setError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          niche: niche.trim(),
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
        onCreated(lead);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to create lead.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  const previewScore = computeScore(scoreFactors);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {/* Business name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-biz-name" className={labelClass}>
          Business name <span className="text-accent">*</span>
        </label>
        <input
          id="new-biz-name"
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="e.g. El Rey Restaurant"
          required
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Niche */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Niche</label>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="restaurant, HVAC…"
            className={inputClass}
          />
        </div>
        {/* Neighborhood */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Neighborhood</label>
          <input
            type="text"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder="Midtown, Heights…"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="713-555-0123"
            className={inputClass}
          />
        </div>
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="owner@business.com"
            className={inputClass}
          />
        </div>
      </div>

      {/* Contact name */}
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Contact name</label>
        <input
          type="text"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          placeholder="Decision-maker's name"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Stage */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Starting stage</label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as typeof stage)}
            className="rounded-md border border-hairline bg-surface-2 px-3 py-3 text-base text-ink focus:border-accent focus:outline-none"
          >
            {PIPELINE_STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        {/* Follow-up date */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Follow-up date</label>
          <input
            type="date"
            value={followUpAt}
            onChange={(e) => setFollowUpAt(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Source */}
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Source</label>
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Google Maps, referral, walk-in…"
          className={inputClass}
        />
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Anything worth noting…"
          className={`${inputClass} resize-y`}
        />
      </div>

      {/* Next action */}
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Next action</label>
        <input
          type="text"
          value={nextActionNote}
          onChange={(e) => setNextActionNote(e.target.value)}
          placeholder="e.g. Send cold email"
          className={inputClass}
        />
      </div>

      {/* Score factors */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className={labelClass}>Score factors</p>
          <span className="font-mono text-[11px] text-accent">Score: {previewScore}</span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(Object.keys(SCORE_WEIGHTS) as Array<keyof typeof SCORE_WEIGHTS>).map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-hairline bg-surface-2 px-3 py-2.5 hover:border-hairline-strong transition-colors"
            >
              <input
                type="checkbox"
                checked={scoreFactors[key]}
                onChange={() => toggleFactor(key)}
                className="h-4 w-4 accent-[#00D4FF] cursor-pointer"
              />
              <span className="flex flex-col gap-0.5">
                <span className="font-mono text-[11px] text-ink-secondary capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span className="font-mono text-[10px] text-ink-subtle">
                  +{SCORE_WEIGHTS[key]}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 font-mono text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex-1 rounded-md border border-hairline-strong px-4 py-3 font-mono text-sm uppercase tracking-wider text-ink-secondary hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 font-mono text-sm uppercase tracking-wider text-canvas transition-shadow hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] active:scale-[0.98] disabled:opacity-60"
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
