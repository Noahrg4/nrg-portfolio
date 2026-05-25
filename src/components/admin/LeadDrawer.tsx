"use client";

/**
 * src/components/admin/LeadDrawer.tsx
 *
 * Full lead detail + edit drawer. Opens when a lead row is clicked.
 * Supports inline stage change, score factors, follow-up date,
 * email/call action logging, notes, and convert-to-client.
 */

import { useState, useCallback } from "react";
import type { Lead, PipelineStage, ConvertLeadBody } from "@/lib/admin/types";
import { SCORE_WEIGHTS, computeScore, TERMINAL_STAGES } from "@/lib/admin/types";
import Drawer from "./Drawer";
import StageChip from "./StageChip";
import ScoreBadge from "./ScoreBadge";
import StageSelector from "./StageSelector";
import Modal from "./Modal";

interface LeadDrawerProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onUpdated: (updated: Lead) => void;
  onConverted: (leadId: string) => void;
}

const inputClass =
  "w-full rounded-md border border-hairline bg-surface-2 px-4 py-3 text-base text-ink placeholder:text-ink-subtle transition-colors focus:border-accent focus:outline-none";

const labelClass = "font-mono text-[10px] uppercase tracking-wider text-ink-subtle";

function fmt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function LeadDrawer({
  lead,
  open,
  onClose,
  onUpdated,
  onConverted,
}: LeadDrawerProps) {
  const [saving, setSaving] = useState(false);
  const [stage, setStage] = useState<PipelineStage | null>(null);
  const [followUpAt, setFollowUpAt] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [nextActionNote, setNextActionNote] = useState<string>("");
  const [scoreFactors, setScoreFactors] = useState(lead?.scoreFactors ?? {
    badOrNoWebsite: false,
    clearlyMakingMoney: false,
    easyToReach: false,
    goodNicheFit: false,
  });
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertData, setConvertData] = useState<ConvertLeadBody>({
    monthlyCharge: 0,
    oneTimeValue: 500,
    siteUrl: "",
    startDate: new Date().toISOString().slice(0, 10),
  });
  const [convertSaving, setConvertSaving] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<"email" | "call" | null>(null);

  // Sync local state when lead changes
  const syncLocal = useCallback((l: Lead) => {
    setStage(l.stage);
    setFollowUpAt(l.followUpAt ?? "");
    setNotes(l.notes);
    setNextActionNote(l.nextActionNote);
    setScoreFactors({ ...l.scoreFactors });
  }, []);

  // When drawer opens with a new lead, sync
  if (lead && open && stage === null) {
    syncLocal(lead);
  }

  if (!lead) return null;

  const currentStage = stage ?? lead.stage;
  const currentScore = computeScore(scoreFactors);
  const isTerminal = TERMINAL_STAGES.includes(lead.stage);

  async function patch(body: Record<string, unknown>) {
    if (!lead) return null;
    const res = await fetch(`/api/admin/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to update lead");
    return (await res.json()) as Lead;
  }

  async function handleSave() {
    if (!lead) return;
    setSaving(true);
    try {
      const updated = await patch({
        stage: currentStage,
        followUpAt: followUpAt || null,
        notes,
        nextActionNote,
        scoreFactors,
      });
      if (updated) {
        onUpdated(updated);
        syncLocal(updated);
      }
    } catch {
      // save errors are silent (no toast system in Phase 1)
    } finally {
      setSaving(false);
    }
  }

  async function handleAction(type: "email" | "call") {
    if (!lead) return;
    setActionLoading(type);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/${type}`, { method: "POST" });
      if (res.ok) {
        const updated = (await res.json()) as Lead;
        onUpdated(updated);
        syncLocal(updated);
      }
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  }

  async function handleConvert() {
    if (!lead) return;
    setConvertSaving(true);
    setConvertError(null);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(convertData),
      });
      if (res.ok) {
        onConverted(lead.id);
        setConvertOpen(false);
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

  return (
    <>
      <Drawer
        open={open}
        onClose={() => {
          setStage(null);
          onClose();
        }}
        title={lead.businessName}
        subtitle={`${lead.niche} · ${lead.neighborhood}`}
        width="max-w-lg"
      >
        <div className="flex flex-col gap-6">
          {/* ─── Status row ─────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-3">
            <StageChip stage={currentStage} />
            <ScoreBadge score={currentScore} size="md" />
            <span className="font-mono text-[11px] text-ink-subtle">
              {lead.touchCount} touch{lead.touchCount !== 1 ? "es" : ""}
            </span>
          </div>

          {/* ─── Contact info ────────────────────────────────────────────── */}
          <div className="rounded-lg border-l-2 border-accent/35 bg-surface-2 pl-4 py-3 pr-4">
            <div className="grid grid-cols-1 gap-1.5 font-mono text-[11px]">
              {lead.contactName && (
                <span className="text-ink-secondary">{lead.contactName}</span>
              )}
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className="text-accent hover:text-accent/80">
                  {lead.phone}
                </a>
              )}
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="text-accent hover:text-accent/80 break-all">
                  {lead.email}
                </a>
              )}
              {lead.source && (
                <span className="text-ink-subtle">Source: {lead.source}</span>
              )}
            </div>
          </div>

          {/* ─── Action buttons ──────────────────────────────────────────── */}
          {!isTerminal && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleAction("email")}
                disabled={!!actionLoading}
                className="flex items-center gap-1.5 rounded-md border border-hairline px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-ink-secondary hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
              >
                {actionLoading === "email" ? "…" : "✉ Mark Emailed"}
              </button>
              <button
                onClick={() => handleAction("call")}
                disabled={!!actionLoading}
                className="flex items-center gap-1.5 rounded-md border border-hairline px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-ink-secondary hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
              >
                {actionLoading === "call" ? "…" : "☎ Mark Called"}
              </button>
              {lead.stage === "Proposal" && (
                <button
                  onClick={() => setConvertOpen(true)}
                  className="flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-accent hover:bg-accent/15 transition-colors"
                >
                  ★ Convert to Client
                </button>
              )}
            </div>
          )}

          {/* Won — already converted */}
          {lead.stage === "Won" && lead.convertedClientId && (
            <p className="font-mono text-[11px] text-[#28CA41]">
              ✓ Converted to client
            </p>
          )}

          {/* ─── Edit fields ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            {/* Stage */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Stage</label>
              <StageSelector
                value={currentStage}
                onChange={setStage}
                disabled={saving || isTerminal}
              />
            </div>

            {/* Follow-up date */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="followup-date" className={labelClass}>
                Follow-up date
              </label>
              <input
                id="followup-date"
                type="date"
                value={followUpAt}
                onChange={(e) => setFollowUpAt(e.target.value)}
                disabled={saving}
                className={inputClass}
              />
            </div>

            {/* Next action note */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="next-action" className={labelClass}>
                Next action
              </label>
              <input
                id="next-action"
                type="text"
                value={nextActionNote}
                onChange={(e) => setNextActionNote(e.target.value)}
                placeholder="e.g. Send follow-up email"
                disabled={saving}
                className={inputClass}
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lead-notes" className={labelClass}>
                Notes
              </label>
              <textarea
                id="lead-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Anything worth remembering…"
                disabled={saving}
                className={`${inputClass} resize-y`}
              />
            </div>
          </div>

          {/* ─── Score factors ──────────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <p className={labelClass}>Score factors</p>
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
                    disabled={saving}
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

          {/* ─── Timestamps ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-surface-2 px-4 py-3 font-mono text-[11px]">
            <span className="text-ink-subtle">Last emailed</span>
            <span className="text-ink-secondary text-right">{fmt(lead.emailedAt)}</span>
            <span className="text-ink-subtle">Last called</span>
            <span className="text-ink-secondary text-right">{fmt(lead.calledAt)}</span>
            <span className="text-ink-subtle">Created</span>
            <span className="text-ink-secondary text-right">{fmt(lead.createdAt)}</span>
            <span className="text-ink-subtle">Updated</span>
            <span className="text-ink-secondary text-right">{fmt(lead.updatedAt)}</span>
          </div>

          {/* ─── Stage history ──────────────────────────────────────────── */}
          {lead.stageHistory.length > 0 && (
            <div className="flex flex-col gap-2">
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

          {/* ─── Save button ────────────────────────────────────────────── */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-accent px-6 py-3.5 font-mono text-sm uppercase tracking-wider text-canvas transition-shadow hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] active:scale-[0.98] disabled:opacity-60"
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
      </Drawer>

      {/* ─── Convert to Client modal ──────────────────────────────────────── */}
      <Modal
        open={convertOpen}
        onClose={() => { setConvertOpen(false); setConvertError(null); }}
        title="Convert to client"
        width="max-w-md"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-secondary">
            Converting <strong className="text-ink">{lead.businessName}</strong> will create a
            client record and mark this lead as Won.
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
              className={inputClass}
            />
          </div>

          {convertError && (
            <p className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 font-mono text-sm text-red-300">
              {convertError}
            </p>
          )}

          <button
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
