"use client";

/**
 * src/components/admin/LeadsTab.tsx
 *
 * LEADS tab — the main working surface.
 * Features:
 *  - Follow-ups due/overdue banner (pinned, only shown when relevant)
 *  - Header: total count, due-now badge
 *  - Add Lead button → modal
 *  - Search + filter chips + sort
 *  - Lead list (card-based rows)
 *  - Click row → LeadDrawer
 *  - Import/Export actions
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import type { Lead, PipelineStage } from "@/lib/admin/types";
import { PIPELINE_STAGES, todayIso, TERMINAL_STAGES } from "@/lib/admin/types";
import StageChip from "./StageChip";
import ScoreBadge from "./ScoreBadge";
import LeadDrawer from "./LeadDrawer";
import Modal from "./Modal";
import AddLeadForm from "./AddLeadForm";

type SortKey = "score" | "stage" | "followUpAt" | "updatedAt";
type FilterMode = "all" | "due" | "hot" | PipelineStage;

const STAGE_ORDER: Record<PipelineStage, number> = {
  Found: 0,
  Researched: 1,
  Emailed: 2,
  Called: 3,
  "Follow-up": 4,
  Proposal: 5,
  Won: 6,
  Lost: 7,
};

function fmt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function LeadsTab() {
  const reduce = useReducedMotion();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [sort, setSort] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const [importLoading, setImportLoading] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const today = todayIso();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/leads");
      if (!res.ok) throw new Error("Failed to load leads");
      const data = (await res.json()) as Lead[];
      setLeads(data);
    } catch {
      setError("Could not load leads. Are you logged in?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  function handleUpdated(updated: Lead) {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSelectedLead(updated);
  }

  function handleConverted(leadId: string) {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage: "Won" as PipelineStage } : l))
    );
    setDrawerOpen(false);
    setSelectedLead(null);
  }

  function handleCreated(lead: Lead) {
    setLeads((prev) => [lead, ...prev]);
    setAddOpen(false);
  }

  // Derive overdue + today leads
  const overdueLeads = leads.filter(
    (l) =>
      l.followUpAt &&
      l.followUpAt < today &&
      !TERMINAL_STAGES.includes(l.stage)
  );
  const todayLeads = leads.filter(
    (l) =>
      l.followUpAt &&
      l.followUpAt === today &&
      !TERMINAL_STAGES.includes(l.stage)
  );
  const dueCount = overdueLeads.length + todayLeads.length;

  // Filter
  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      l.businessName.toLowerCase().includes(q) ||
      l.contactName.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.notes.toLowerCase().includes(q) ||
      l.niche.toLowerCase().includes(q);

    let matchesFilter = true;
    if (filter === "due") {
      matchesFilter =
        !!l.followUpAt &&
        l.followUpAt <= today &&
        !TERMINAL_STAGES.includes(l.stage);
    } else if (filter === "hot") {
      matchesFilter = l.score >= 7;
    } else if (filter !== "all" && PIPELINE_STAGES.includes(filter as PipelineStage)) {
      matchesFilter = l.stage === filter;
    }

    return matchesSearch && matchesFilter;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sort === "score") {
      cmp = a.score - b.score;
    } else if (sort === "stage") {
      cmp = STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage];
    } else if (sort === "followUpAt") {
      const aVal = a.followUpAt ?? "9999-99-99";
      const bVal = b.followUpAt ?? "9999-99-99";
      cmp = aVal.localeCompare(bVal);
    } else {
      cmp = a.updatedAt.localeCompare(b.updatedAt);
    }
    return sortDir === "desc" ? -cmp : cmp;
  });

  function toggleSort(key: SortKey) {
    if (sort === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSort(key);
      setSortDir("desc");
    }
  }

  // Import JSON
  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportLoading(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Lead[];
      if (!Array.isArray(parsed)) throw new Error("Expected array");
      const res = await fetch("/api/admin/leads/bulk?mode=append", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: parsed }),
      });
      if (res.ok) {
        await fetchLeads();
      }
    } catch {
      // silent
    } finally {
      setImportLoading(false);
      if (importRef.current) importRef.current.value = "";
    }
  }

  const sortLabel = (key: SortKey) => {
    const active = sort === key;
    const arrow = active ? (sortDir === "desc" ? " ↓" : " ↑") : "";
    const labels: Record<SortKey, string> = { score: "Score", stage: "Stage", followUpAt: "Follow-up", updatedAt: "Updated" };
    return labels[key] + arrow;
  };

  return (
    <div className="container-content py-8">
      {/* ─── Follow-up banner ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {dueCount > 0 && (
          <motion.div
            key="due-banner"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 rounded-xl border border-accent/30 bg-accent/10 p-4"
          >
            <div className="flex flex-wrap items-start gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
                  ▸ {dueCount} follow-up{dueCount !== 1 ? "s" : ""} need attention
                </p>
                <div className="mt-2 flex flex-col gap-1.5">
                  {overdueLeads.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => {
                        setSelectedLead(l);
                        setDrawerOpen(true);
                      }}
                      className="flex items-center gap-2 text-left hover:text-ink transition-colors"
                    >
                      <span className="font-mono text-[10px] text-red-400 uppercase">
                        overdue {l.followUpAt && fmtDate(l.followUpAt)}
                      </span>
                      <span className="text-sm text-ink-secondary">
                        {l.businessName}
                      </span>
                      <StageChip stage={l.stage} size="sm" />
                    </button>
                  ))}
                  {todayLeads.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => {
                        setSelectedLead(l);
                        setDrawerOpen(true);
                      }}
                      className="flex items-center gap-2 text-left hover:text-ink transition-colors"
                    >
                      <span className="font-mono text-[10px] text-accent uppercase">
                        today
                      </span>
                      <span className="text-sm text-ink-secondary">
                        {l.businessName}
                      </span>
                      <StageChip stage={l.stage} size="sm" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-display text-2xl text-ink">Leads</h1>
          <span className="font-mono text-[11px] text-ink-subtle">
            {leads.length} total
          </span>
          {dueCount > 0 && (
            <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 font-mono text-[10px] text-accent">
              {dueCount} due now
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Import */}
          <label
            className={[
              "cursor-pointer rounded-md border border-hairline-strong px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-ink-secondary",
              "hover:border-accent hover:text-accent transition-colors",
              importLoading ? "opacity-50 pointer-events-none" : "",
            ].join(" ")}
          >
            <input
              ref={importRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportFile}
            />
            {importLoading ? "Importing…" : "Import JSON"}
          </label>

          {/* Export */}
          <a
            href="/api/admin/leads/export?format=json"
            className="rounded-md border border-hairline-strong px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-ink-secondary hover:border-accent hover:text-accent transition-colors"
          >
            Export JSON
          </a>
          <a
            href="/api/admin/leads/export?format=csv"
            className="rounded-md border border-hairline-strong px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-ink-secondary hover:border-accent hover:text-accent transition-colors"
          >
            Export CSV
          </a>

          {/* Add Lead */}
          <button
            onClick={() => setAddOpen(true)}
            className="rounded-md bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-canvas transition-shadow hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] active:scale-[0.98]"
          >
            + Add Lead
          </button>
        </div>
      </div>

      {/* ─── Search + Filter + Sort ──────────────────────────────────────────── */}
      <div className="mb-5 flex flex-col gap-3">
        {/* Search */}
        <input
          type="search"
          placeholder="Search leads…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-hairline bg-surface-2 px-4 py-3 text-base text-ink placeholder:text-ink-subtle transition-colors focus:border-accent focus:outline-none"
        />

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          {(["all", "due", "hot", ...PIPELINE_STAGES] as const).map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f as FilterMode)}
                className={[
                  "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors",
                  active
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-hairline text-ink-subtle hover:border-hairline-strong hover:text-ink",
                ].join(" ")}
              >
                {f === "all" ? "All" : f === "due" ? "Due now" : f === "hot" ? "Hot ≥7" : f}
              </button>
            );
          })}
        </div>

        {/* Sort buttons */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-subtle">
            Sort:
          </span>
          {(["score", "stage", "followUpAt", "updatedAt"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => toggleSort(key)}
              className={[
                "rounded-md border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors",
                sort === key
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-hairline text-ink-subtle hover:text-ink",
              ].join(" ")}
            >
              {sortLabel(key)}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Lead list ───────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl border border-hairline bg-surface-1 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-8 text-center">
          <p className="font-mono text-sm text-red-400">{error}</p>
          <button
            onClick={fetchLeads}
            className="mt-4 font-mono text-[11px] uppercase tracking-wider text-accent hover:text-accent/80"
          >
            Retry
          </button>
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-xl border border-hairline bg-surface-1 px-6 py-12 text-center">
          <p className="font-mono text-sm text-ink-subtle">
            {leads.length === 0 ? "No leads yet. Add one to get started." : "No leads match your filters."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((lead, i) => {
            const isOverdue =
              lead.followUpAt &&
              lead.followUpAt < today &&
              !TERMINAL_STAGES.includes(lead.stage);
            const isDueToday =
              lead.followUpAt &&
              lead.followUpAt === today &&
              !TERMINAL_STAGES.includes(lead.stage);

            return (
              <motion.button
                key={lead.id}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
                onClick={() => {
                  setSelectedLead(lead);
                  setDrawerOpen(true);
                }}
                className={[
                  "group w-full rounded-xl border p-4 text-left transition-all duration-200",
                  "hover:-translate-y-0.5 hover:border-hairline-strong hover:bg-surface-1",
                  isOverdue
                    ? "border-red-500/20 bg-surface-1"
                    : isDueToday
                    ? "border-accent/20 bg-surface-1"
                    : "border-hairline bg-surface-1",
                ].join(" ")}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  {/* Left: name + meta */}
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-sans text-base font-medium text-ink group-hover:text-white truncate">
                        {lead.businessName}
                      </span>
                      <StageChip stage={lead.stage} size="sm" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-ink-subtle">
                      {lead.niche && <span>{lead.niche}</span>}
                      {lead.neighborhood && (
                        <>
                          <span aria-hidden>·</span>
                          <span>{lead.neighborhood}</span>
                        </>
                      )}
                      {lead.touchCount > 0 && (
                        <>
                          <span aria-hidden>·</span>
                          <span>{lead.touchCount} touch{lead.touchCount !== 1 ? "es" : ""}</span>
                        </>
                      )}
                    </div>
                    {lead.nextActionNote && (
                      <p className="font-mono text-[11px] text-ink-subtle truncate max-w-xs">
                        → {lead.nextActionNote}
                      </p>
                    )}
                  </div>

                  {/* Right: score + follow-up */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <ScoreBadge score={lead.score} size="sm" />
                    {lead.followUpAt && (
                      <span
                        className={[
                          "font-mono text-[10px]",
                          isOverdue ? "text-red-400" : isDueToday ? "text-accent" : "text-ink-subtle",
                        ].join(" ")}
                      >
                        {isOverdue ? "overdue " : isDueToday ? "today " : ""}
                        {fmtDate(lead.followUpAt)}
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-ink-subtle">
                      {fmt(lead.updatedAt)}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ─── Lead drawer ──────────────────────────────────────────────────────── */}
      <LeadDrawer
        lead={selectedLead}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedLead(null);
        }}
        onUpdated={handleUpdated}
        onConverted={handleConverted}
      />

      {/* ─── Add Lead modal ───────────────────────────────────────────────────── */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add new lead"
        width="max-w-2xl"
      >
        <AddLeadForm
          onCreated={handleCreated}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>
    </div>
  );
}
