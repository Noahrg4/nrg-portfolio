"use client";

/**
 * src/components/admin/ClientsTab.tsx
 *
 * CLIENTS tab — paying roster.
 *
 * Data display improvements:
 *  - Header: 3 big metrics — Active count, Total MRR, Churned count
 *  - Status pill: green (active) / amber (paused) / red (churned)
 *  - MRR contribution: small badge "$X/mo" per row
 *  - Lifetime value: prominent "$X" per row (oneTimeValue + 12 × monthlyCharge)
 *  - Last-verified: StalenessIndicator (green ≤30d / amber ≤60d / red >60d)
 *  - Last-invoiced: StalenessIndicator (green ≤35d / amber ≤60d / red >60d)
 *  - Row layout: name + contact (left) | status | MRR | one-time | LTV |
 *               last verified | last invoiced
 */

import { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Client, ClientStatus } from "@/lib/admin/types";
import { lifetimeValue } from "@/lib/admin/types";
import ClientDrawer from "./ClientDrawer";
import Modal from "./Modal";
import AddClientForm from "./AddClientForm";
import StalenessIndicator from "./StalenessIndicator";
import { formatCurrency } from "@/lib/admin/format";

type SortKey = "status" | "monthlyCharge" | "startDate" | "updatedAt";

// ── Status pill styles ────────────────────────────────────────────────────────
// Active: green tint   Paused: amber tint   Churned: red tint
const STATUS_STYLES: Record<ClientStatus, { pill: string; dot: string; label: string }> = {
  active: {
    pill: "border border-[rgba(40,202,65,0.4)] bg-[rgba(40,202,65,0.08)] text-[#28CA41]",
    dot: "bg-[#28CA41]",
    label: "Active",
  },
  paused: {
    pill: "border border-[rgba(245,166,35,0.4)] bg-[rgba(245,166,35,0.08)] text-[#F5A623]",
    dot: "bg-[#F5A623]",
    label: "Paused",
  },
  churned: {
    pill: "border border-red-500/30 bg-red-500/10 text-red-400",
    dot: "bg-red-400",
    label: "Churned",
  },
};

const STATUS_ORDER: Record<ClientStatus, number> = { active: 0, paused: 1, churned: 2 };

export default function ClientsTab() {
  const reduce = useReducedMotion();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sort, setSort] = useState<SortKey>("status");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/clients", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load clients");
      const data = (await res.json()) as Client[];
      setClients(data);
    } catch {
      setError("Could not load clients.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  function handleUpdated(updated: Client) {
    setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedClient(updated);
  }

  function handleCreated(client: Client) {
    setClients((prev) => [client, ...prev]);
    setAddOpen(false);
  }

  // Header stats
  const activeClients = clients.filter((c) => c.status === "active");
  const totalMrr = activeClients.reduce((sum, c) => sum + c.monthlyCharge, 0);
  const churnedCount = clients.filter((c) => c.status === "churned").length;

  // Sort
  const sorted = [...clients].sort((a, b) => {
    let cmp = 0;
    if (sort === "status") {
      cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    } else if (sort === "monthlyCharge") {
      cmp = a.monthlyCharge - b.monthlyCharge;
    } else if (sort === "startDate") {
      cmp = a.startDate.localeCompare(b.startDate);
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
      setSortDir(key === "monthlyCharge" ? "desc" : "asc");
    }
  }

  const sortLabel = (key: SortKey) => {
    const active = sort === key;
    const arrow = active ? (sortDir === "desc" ? " ↓" : " ↑") : "";
    const labels: Record<SortKey, string> = {
      status: "Status",
      monthlyCharge: "MRR",
      startDate: "Start",
      updatedAt: "Updated",
    };
    return labels[key] + arrow;
  };

  return (
    <div className="container-content py-8">

      {/* ─── Header: 3 big metrics ──────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-display text-2xl text-ink">Clients</h1>
          <button
            onClick={() => setAddOpen(true)}
            className="rounded-md bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-canvas transition-shadow hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] active:scale-[0.98]"
          >
            + Add Client
          </button>
        </div>

        {/* 3-column metric strip */}
        <div className="grid grid-cols-3 gap-3">
          {/* Active clients */}
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0 }}
            className={[
              "flex flex-col gap-2 rounded-xl border p-5 transition-all duration-200",
              activeClients.length > 0
                ? "border-[rgba(40,202,65,0.25)] bg-surface-1"
                : "border-hairline bg-surface-1",
            ].join(" ")}
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-subtle">
              Active clients
            </p>
            <p
              className={[
                "text-display text-3xl leading-none",
                activeClients.length > 0 ? "text-[#28CA41]" : "text-ink",
              ].join(" ")}
            >
              {activeClients.length}
            </p>
          </motion.div>

          {/* Total MRR */}
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
            className={[
              "flex flex-col gap-2 rounded-xl border p-5 transition-all duration-200",
              totalMrr > 0
                ? "border-accent/30 bg-surface-1"
                : "border-hairline bg-surface-1",
            ].join(" ")}
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-subtle">
              Total MRR
            </p>
            <p
              className={[
                "text-display text-3xl leading-none",
                totalMrr > 0 ? "text-accent" : "text-ink",
              ].join(" ")}
            >
              {totalMrr > 0 ? formatCurrency(totalMrr) : "$0"}
            </p>
            <p className="font-mono text-[11px] text-ink-subtle">/mo</p>
          </motion.div>

          {/* Churned count */}
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            className={[
              "flex flex-col gap-2 rounded-xl border p-5 transition-all duration-200",
              churnedCount > 0
                ? "border-red-500/20 bg-surface-1"
                : "border-hairline bg-surface-1",
            ].join(" ")}
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-subtle">
              Churned
            </p>
            <p
              className={[
                "text-display text-3xl leading-none",
                churnedCount > 0 ? "text-red-400" : "text-ink",
              ].join(" ")}
            >
              {churnedCount}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ─── Sort ──────────────────────────────────────────────────────────── */}
      <div className="mb-5 flex flex-wrap gap-2 items-center">
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-subtle">Sort:</span>
        {(["status", "monthlyCharge", "startDate", "updatedAt"] as SortKey[]).map((key) => (
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

      {/* ─── Client list ───────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-xl border border-hairline bg-surface-1 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-8 text-center">
          <p className="font-mono text-sm text-red-400">{error}</p>
          <button
            onClick={fetchClients}
            className="mt-4 font-mono text-[11px] uppercase tracking-wider text-accent"
          >
            Retry
          </button>
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-xl border border-hairline bg-surface-1 px-6 py-12 text-center">
          <p className="font-mono text-sm text-ink-subtle">
            No clients yet. Add your first client to get started.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((client, i) => {
            const ltv = lifetimeValue(client);
            const status = STATUS_STYLES[client.status];

            return (
              <motion.button
                key={client.id}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
                onClick={() => {
                  setSelectedClient(client);
                  setDrawerOpen(true);
                }}
                className="group w-full rounded-xl border border-hairline bg-surface-1 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-hairline-strong hover:bg-surface-2/30"
              >
                {/* ── Main row ─────────────────────────────────────────────── */}
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">

                  {/* LEFT: name + contact info */}
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-sans text-base font-medium text-ink group-hover:text-white truncate">
                        {client.businessName}
                      </span>
                      {/* Status pill */}
                      <span
                        className={[
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider",
                          status.pill,
                        ].join(" ")}
                      >
                        <span className={["inline-block h-1.5 w-1.5 rounded-full", status.dot].join(" ")} aria-hidden />
                        {status.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 font-mono text-[11px] text-ink-subtle">
                      {client.contactName && <span>{client.contactName}</span>}
                      {client.contactName && client.email && (
                        <span aria-hidden>·</span>
                      )}
                      {client.email && (
                        <span className="truncate max-w-[200px]">{client.email}</span>
                      )}
                    </div>
                    {client.siteUrl && (
                      <p className="font-mono text-[11px] text-accent/60 truncate max-w-xs">
                        {client.siteUrl}
                      </p>
                    )}
                  </div>

                  {/* RIGHT: financials + staleness */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {/* MRR badge */}
                    {client.monthlyCharge > 0 && (
                      <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 font-mono text-[10px] text-accent">
                        {formatCurrency(client.monthlyCharge)}/mo
                      </span>
                    )}
                    {/* One-time value */}
                    {client.oneTimeValue > 0 && (
                      <span className="font-mono text-[11px] text-ink-secondary">
                        {formatCurrency(client.oneTimeValue)} one-time
                      </span>
                    )}
                    {/* Lifetime value — prominent */}
                    {ltv > 0 && (
                      <span className="font-mono text-[12px] font-medium text-ink">
                        LTV {formatCurrency(ltv)}
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-ink-subtle/60">
                      since {client.startDate}
                    </span>
                  </div>
                </div>

                {/* ── Staleness row ─────────────────────────────────────────── */}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-hairline/50 pt-2.5">
                  {/* Last verified */}
                  <StalenessIndicator
                    iso={client.lastVerifiedAt}
                    greenDays={30}
                    amberDays={60}
                    label="Verified"
                    neverLabel="Never verified"
                  />
                  {/* Last invoiced */}
                  <StalenessIndicator
                    iso={client.lastInvoicedAt}
                    greenDays={35}
                    amberDays={60}
                    label="Invoiced"
                    neverLabel="Never invoiced"
                  />
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ─── Drawers + modals ─────────────────────────────────────────────── */}
      <ClientDrawer
        client={selectedClient}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedClient(null);
        }}
        onUpdated={handleUpdated}
      />

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add new client"
        width="max-w-xl"
      >
        <AddClientForm
          onCreated={handleCreated}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>
    </div>
  );
}
