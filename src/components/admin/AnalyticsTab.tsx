"use client";

/**
 * src/components/admin/AnalyticsTab.tsx
 *
 * ANALYTICS tab — two-tier layout:
 *
 * TOP (leading indicators — biggest numbers, first glance):
 *   1. Activity this week: Follow-ups due, Total touches, Leads emailed,
 *      Leads called — 4-col grid of large MetricCards
 *   2. Pipeline by stage: PipelineFunnel horizontal bar chart
 *   3. Weighted pipeline: single large currency + per-stage breakdown
 *
 * BOTTOM (lagging — revenue, will be $0 pre-launch):
 *   4. MRR + Booked one-time revenue + Founding spots (X of 5 dots)
 *   5. Client roster breakdown (active / paused / churned)
 *
 * Explicitly REMOVED (Phase-2 deferred per brief):
 *   - emailResponseRate / response rate benchmarks
 *   - winRate shown as Phase-1 metric (kept only as subtext on won count)
 *   - avgOneTimeValue as standalone card
 *   - score distribution cards (hotLeads / warmLeads / coldLeads)
 *     — these are available in leads tab filter; not decision-useful here
 */

import { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { AnalyticsPayload } from "@/lib/admin/types";
import { STAGE_CLOSE_PROBABILITY, AVG_PROJECT_VALUE, ACTIVE_STAGES } from "@/lib/admin/types";
import MetricCard from "./MetricCard";
import PipelineFunnel from "./PipelineFunnel";
import { formatCurrency, formatPercent } from "@/lib/admin/format";

const FOUNDING_SPOTS = 5;

// Empty/loading state
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

// Founding spots dots — filled circles visualize X of 5 progress
function FoundingDots({ filled, total }: { filled: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`${filled} of ${total} spots filled`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={[
            "inline-block h-3 w-3 rounded-full transition-colors duration-300",
            i < filled ? "bg-accent" : "bg-surface-3 border border-hairline",
          ].join(" ")}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

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

  const dueCount = data.followUpsToday + data.overdueFollowUps;
  const leadsCalledCount =
    (data.leadsByStage["Called"] ?? 0) +
    (data.leadsByStage["Follow-up"] ?? 0) +
    (data.leadsByStage["Proposal"] ?? 0) +
    (data.leadsByStage["Won"] ?? 0);

  return (
    <div className="container-content py-8">

      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-display text-2xl text-ink">Analytics</h1>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle hover:text-ink transition-colors disabled:opacity-40"
        >
          {loading ? "Loading…" : "↺ Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 font-mono text-sm text-red-400">
          {error}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TOP — LEADING INDICATORS                                            */}
      {/* ════════════════════════════════════════════════════════════════════ */}

      {/* ── Section 1: Activity this week ─────────────────────────────────── */}
      <section className="mb-10">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-wider text-accent">
          ▸ Activity this week
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Follow-ups due — most urgent, goes first */}
          <MetricCard
            label="Follow-ups due"
            value={dueCount}
            hint={
              data.overdueFollowUps > 0
                ? `${data.overdueFollowUps} overdue`
                : data.followUpsToday > 0
                ? "due today"
                : "all clear"
            }
            accent={dueCount > 0}
            delay={0}
          />
          {/* Follow-ups done = leads that progressed past emailed this week
              Proxy: leads in Called + Follow-up + Proposal + Won stages */}
          <MetricCard
            label="Leads reached"
            value={leadsCalledCount}
            hint="called or beyond"
            delay={0.06}
          />
          <MetricCard
            label="Leads emailed"
            value={data.leadsEmailed}
            hint="emailed at least once"
            delay={0.12}
          />
          <MetricCard
            label="Total touches"
            value={data.totalTouches}
            hint="all leads, all time"
            delay={0.18}
          />
        </div>
      </section>

      {/* ── Section 2: Pipeline by stage ──────────────────────────────────── */}
      <section className="mb-10">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-wider text-ink-secondary">
          Pipeline by stage
        </p>

        <PipelineFunnel leadsByStage={data.leadsByStage} />
      </section>

      {/* ── Section 3: Weighted pipeline ──────────────────────────────────── */}
      <section className="mb-12">
        <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-ink-secondary">
          Weighted pipeline
          <span className="ml-2 text-ink-subtle normal-case">(estimate, not booked)</span>
        </p>
        <p className="mb-4 font-mono text-[10px] text-ink-subtle/60">
          Sums each open lead&apos;s expected value ({formatCurrency(AVG_PROJECT_VALUE)} avg × stage close %). Excludes Won (booked) and Lost (closed).
        </p>

        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-accent/20 bg-surface-1 p-6"
        >
          {/* Big number */}
          <div className="mb-6">
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-subtle mb-1">
              Total weighted value
            </p>
            <p className="text-display text-5xl text-accent leading-none">
              {formatCurrency(data.activePipelineValue)}
            </p>
            <p className="mt-2 font-mono text-[11px] text-ink-subtle">
              Across {ACTIVE_STAGES.filter((s) => (data.leadsByStage[s] ?? 0) > 0).length} active stage{ACTIVE_STAGES.filter((s) => (data.leadsByStage[s] ?? 0) > 0).length !== 1 ? "s" : ""} · {formatCurrency(AVG_PROJECT_VALUE)} avg project
            </p>
          </div>

          {/* Per-stage breakdown */}
          <div className="flex flex-col gap-1.5 border-t border-hairline pt-4">
            {ACTIVE_STAGES.filter((s) => (data.leadsByStage[s] ?? 0) > 0).map((stage) => {
              const count = data.leadsByStage[stage] ?? 0;
              const prob = STAGE_CLOSE_PROBABILITY[stage];
              const value = count * AVG_PROJECT_VALUE * prob;
              return (
                <div key={stage} className="flex items-center justify-between font-mono text-[11px]">
                  <div className="flex items-center gap-2 text-ink-subtle">
                    <span className="w-20">{stage}</span>
                    <span>{count} lead{count !== 1 ? "s" : ""}</span>
                    <span className="text-ink-subtle/50">× {formatPercent(prob)}</span>
                  </div>
                  <span className="text-ink-secondary">{formatCurrency(value)}</span>
                </div>
              );
            })}
            {ACTIVE_STAGES.every((s) => (data.leadsByStage[s] ?? 0) === 0) && (
              <p className="font-mono text-[11px] text-ink-subtle">
                No active leads. Add leads to see pipeline value.
              </p>
            )}
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* BOTTOM — LAGGING INDICATORS (revenue; $0 pre-launch)               */}
      {/* ════════════════════════════════════════════════════════════════════ */}

      <div className="mb-3">
        <div className="flex items-center gap-3">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
            Revenue — lagging indicators
          </p>
          <span className="font-mono text-[10px] text-ink-subtle/50">
            · will be zero until clients are added
          </span>
        </div>
      </div>

      {/* ── Section 4: Revenue metrics + founding spots ───────────────────── */}
      <section className="mb-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MetricCard
            label="MRR"
            value={formatCurrency(data.totalMrr)}
            hint="active client retainers / mo"
            accent={data.totalMrr > 0}
            delay={0}
          />
          <MetricCard
            label="Booked one-time"
            value={formatCurrency(data.totalOneTimeRevenue)}
            hint={data.totalWon > 0 ? `${data.totalWon} project${data.totalWon !== 1 ? "s" : ""} won` : "no closed projects yet"}
            accent={data.totalOneTimeRevenue > 0}
            delay={0.06}
          />

          {/* Founding spots — custom card */}
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            className={[
              "group flex flex-col gap-3 rounded-xl border p-6 transition-all duration-200",
              "hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,212,255,0.08)]",
              data.activeClients >= FOUNDING_SPOTS
                ? "border-accent/30 bg-surface-1 hover:border-accent/60"
                : "border-hairline bg-surface-1 hover:border-hairline-strong",
            ].join(" ")}
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-subtle">
              Founding spots
            </p>
            <div className="flex items-baseline gap-2">
              <span
                className={[
                  "text-display text-3xl leading-none",
                  data.activeClients >= FOUNDING_SPOTS ? "text-accent" : "text-ink",
                ].join(" ")}
              >
                {data.activeClients}
              </span>
              <span className="font-mono text-[11px] text-ink-subtle">
                of {FOUNDING_SPOTS}
              </span>
            </div>
            <FoundingDots
              filled={Math.min(data.activeClients, FOUNDING_SPOTS)}
              total={FOUNDING_SPOTS}
            />
            <p className="font-mono text-[11px] text-ink-subtle">
              {data.activeClients >= FOUNDING_SPOTS
                ? "All founding spots filled"
                : `${FOUNDING_SPOTS - data.activeClients} spot${FOUNDING_SPOTS - data.activeClients !== 1 ? "s" : ""} remaining`}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Section 5: Client roster ──────────────────────────────────────── */}
      <section>
        <p className="mb-4 font-mono text-[11px] uppercase tracking-wider text-ink-secondary">
          Client roster
        </p>
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            label="Active"
            value={data.activeClients}
            hint="paying retainer"
            accent={data.activeClients > 0}
            delay={0}
          />
          <MetricCard
            label="Paused"
            value={data.pausedClients}
            hint="temporarily on hold"
            delay={0.06}
          />
          <MetricCard
            label="Churned"
            value={data.churnedClients}
            hint="no longer active"
            delay={0.12}
          />
        </div>
      </section>

    </div>
  );
}
