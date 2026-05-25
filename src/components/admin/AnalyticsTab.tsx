"use client";

/**
 * src/components/admin/AnalyticsTab.tsx
 *
 * ANALYTICS tab — leading indicators first, revenue second.
 *
 * Top section (leading — most prominent):
 *  - This week activity: emails, calls, follow-ups due, follow-ups done
 *  - Pipeline by stage: count per stage
 *  - Weighted pipeline: single big number + stage breakdown
 *
 * Bottom section (lagging — revenue):
 *  - MRR, total one-time revenue
 *  - Founding spots progress (X of 5)
 *  - Score distribution: hot/warm/cold
 */

import { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { AnalyticsPayload } from "@/lib/admin/types";
import { PIPELINE_STAGES, STAGE_CLOSE_PROBABILITY, AVG_PROJECT_VALUE } from "@/lib/admin/types";
import MetricCard from "./MetricCard";
import StageChip from "./StageChip";

const FOUNDING_SPOTS = 5;

function formatCurrency(n: number): string {
  if (n === 0) return "$0";
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toLocaleString()}`;
}

function formatPct(n: number | null): string {
  if (n === null) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

// Stub/empty analytics for loading state
const EMPTY: AnalyticsPayload = {
  totalMrr: 0,
  totalOneTimeRevenue: 0,
  avgOneTimeValue: 0,
  activePipelineValue: 0,
  leadsByStage: {
    Found: 0, Researched: 0, Emailed: 0, Called: 0,
    "Follow-up": 0, Proposal: 0, Won: 0, Lost: 0,
  },
  totalLeads: 0,
  totalWon: 0,
  totalLost: 0,
  winRate: 0,
  totalTouches: 0,
  leadsEmailed: 0,
  emailResponseRate: null,
  activeClients: 0,
  pausedClients: 0,
  churnedClients: 0,
  overdueFollowUps: 0,
  followUpsToday: 0,
  hotLeads: 0,
  warmLeads: 0,
  coldLeads: 0,
};

export default function AnalyticsTab() {
  const reduce = useReducedMotion();
  const [data, setData] = useState<AnalyticsPayload>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) throw new Error("Failed to load analytics");
      const payload = (await res.json()) as AnalyticsPayload;
      setData(payload);
    } catch {
      setError("Could not load analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const activeStages = PIPELINE_STAGES.filter(
    (s) => s !== "Won" && s !== "Lost"
  );

  return (
    <div className="container-content py-8">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-display text-2xl text-ink">Analytics</h1>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle hover:text-ink transition-colors disabled:opacity-40"
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 font-mono text-sm text-red-400">
          {error}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — Leading indicators (outreach activity)               */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-wider text-accent">
          ▸ Outreach activity
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard
            label="Follow-ups due"
            value={data.followUpsToday + data.overdueFollowUps}
            subtext={data.overdueFollowUps > 0 ? `${data.overdueFollowUps} overdue` : "none overdue"}
            accent={(data.overdueFollowUps + data.followUpsToday) > 0}
            delay={0}
          />
          <MetricCard
            label="Total touches"
            value={data.totalTouches}
            subtext="all leads, all time"
            delay={0.06}
          />
          <MetricCard
            label="Leads emailed"
            value={data.leadsEmailed}
            delay={0.12}
          />
          <MetricCard
            label="Response rate"
            value={formatPct(data.emailResponseRate)}
            subtext="emailed → called / follow-up"
            delay={0.18}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — Pipeline by stage                                    */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-wider text-ink-secondary">
          Pipeline by stage
        </p>

        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-hairline bg-surface-1 overflow-hidden"
        >
          {PIPELINE_STAGES.map((stage, i) => {
            const count = data.leadsByStage[stage] ?? 0;
            const maxCount = Math.max(1, ...PIPELINE_STAGES.map((s) => data.leadsByStage[s] ?? 0));
            const barWidth = count === 0 ? 0 : Math.max(2, (count / maxCount) * 100);
            const prob = STAGE_CLOSE_PROBABILITY[stage];

            return (
              <div
                key={stage}
                className={[
                  "flex items-center gap-4 px-4 py-3 relative",
                  i < PIPELINE_STAGES.length - 1 ? "border-b border-hairline" : "",
                ].join(" ")}
              >
                {/* Bar fill */}
                <div
                  aria-hidden
                  className="absolute inset-y-0 left-0 bg-accent/5"
                  style={{ width: `${barWidth}%` }}
                />

                <div className="relative flex flex-1 items-center gap-3">
                  <StageChip stage={stage} size="sm" />
                  <span
                    className={[
                      "text-display text-lg leading-none",
                      count === 0 ? "text-ink-subtle" : "text-ink",
                    ].join(" ")}
                  >
                    {count}
                  </span>
                </div>

                <div className="relative flex items-center gap-3 shrink-0">
                  <span className="font-mono text-[10px] text-ink-subtle">
                    {(prob * 100).toFixed(0)}% close
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3 — Weighted pipeline                                    */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-wider text-ink-secondary">
          Weighted pipeline
          <span className="ml-2 text-ink-subtle normal-case">(estimate, not booked)</span>
        </p>

        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="rounded-xl border border-accent/20 bg-surface-1 p-6"
        >
          {/* Big number */}
          <div className="mb-6">
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-subtle mb-1">
              Total weighted value
            </p>
            <p className="text-display text-4xl text-accent">
              {formatCurrency(data.activePipelineValue)}
            </p>
            <p className="mt-1 font-mono text-[11px] text-ink-subtle">
              Based on {formatCurrency(AVG_PROJECT_VALUE)} avg project × stage probability
            </p>
          </div>

          {/* Stage breakdown */}
          <div className="flex flex-col gap-1">
            {activeStages
              .filter((s) => (data.leadsByStage[s] ?? 0) > 0)
              .map((stage) => {
                const count = data.leadsByStage[stage] ?? 0;
                const prob = STAGE_CLOSE_PROBABILITY[stage];
                const value = count * AVG_PROJECT_VALUE * prob;
                return (
                  <div key={stage} className="flex items-center justify-between font-mono text-[11px]">
                    <div className="flex items-center gap-2">
                      <StageChip stage={stage} size="sm" />
                      <span className="text-ink-subtle">{count} lead{count !== 1 ? "s" : ""}</span>
                    </div>
                    <span className="text-ink-secondary">{formatCurrency(value)}</span>
                  </div>
                );
              })}
            {activeStages.every((s) => (data.leadsByStage[s] ?? 0) === 0) && (
              <p className="font-mono text-[11px] text-ink-subtle">
                No active leads yet.
              </p>
            )}
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4 — Score distribution                                   */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-wider text-ink-secondary">
          Lead quality
        </p>
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            label="Hot leads"
            value={data.hotLeads}
            subtext="score ≥ 7"
            accent={data.hotLeads > 0}
            delay={0}
          />
          <MetricCard
            label="Warm leads"
            value={data.warmLeads}
            subtext="score 4–6"
            delay={0.06}
          />
          <MetricCard
            label="Cold leads"
            value={data.coldLeads}
            subtext="score 0–3"
            delay={0.12}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5 — Revenue (lagging, mostly $0 at first)                */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
          Revenue — lagging indicators
        </p>
        <p className="mb-4 font-mono text-[10px] text-ink-subtle/60">
          These will be zero until clients are added.
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard
            label="MRR"
            value={formatCurrency(data.totalMrr)}
            subtext="active clients"
            accent={data.totalMrr > 0}
            delay={0}
          />
          <MetricCard
            label="One-time revenue"
            value={formatCurrency(data.totalOneTimeRevenue)}
            subtext="all time"
            delay={0.06}
          />
          <MetricCard
            label="Avg project"
            value={formatCurrency(data.avgOneTimeValue)}
            subtext="one-time avg"
            delay={0.12}
          />
          <MetricCard
            label="Win rate"
            value={formatPct(data.winRate)}
            subtext={`${data.totalWon} won · ${data.totalLost} lost`}
            delay={0.18}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 6 — Founding spots                                       */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-hairline bg-surface-1 p-6"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-secondary">
              Founding client spots
            </p>
            <span className="font-mono text-[11px] text-accent">
              {data.activeClients} of {FOUNDING_SPOTS} filled
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 overflow-hidden rounded-full bg-surface-3">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{
                width: `${Math.min(100, (data.activeClients / FOUNDING_SPOTS) * 100)}%`,
              }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-accent"
            />
          </div>

          <p className="mt-2 font-mono text-[10px] text-ink-subtle">
            {FOUNDING_SPOTS - data.activeClients > 0
              ? `${FOUNDING_SPOTS - data.activeClients} spot${FOUNDING_SPOTS - data.activeClients !== 1 ? "s" : ""} remaining`
              : "All founding spots filled"}
          </p>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 7 — Client status breakdown                              */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section>
        <p className="mb-4 font-mono text-[11px] uppercase tracking-wider text-ink-secondary">
          Client roster
        </p>
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            label="Active"
            value={data.activeClients}
            accent={data.activeClients > 0}
            delay={0}
          />
          <MetricCard
            label="Paused"
            value={data.pausedClients}
            delay={0.06}
          />
          <MetricCard
            label="Churned"
            value={data.churnedClients}
            delay={0.12}
          />
        </div>
      </section>
    </div>
  );
}
