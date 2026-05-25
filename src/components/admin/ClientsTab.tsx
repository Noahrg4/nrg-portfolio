"use client";

/**
 * src/components/admin/ClientsTab.tsx
 *
 * CLIENTS tab — paying roster.
 * Features:
 *  - Header: active count + MRR + churned count
 *  - Add Client button → modal
 *  - Client list with status chip, charges, LTV, dates
 *  - Click row → ClientDrawer
 *  - Sort by status / MRR / start date
 */

import { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Client, ClientStatus } from "@/lib/admin/types";
import { lifetimeValue } from "@/lib/admin/types";
import ClientDrawer from "./ClientDrawer";
import Modal from "./Modal";
import AddClientForm from "./AddClientForm";

type SortKey = "status" | "monthlyCharge" | "startDate" | "updatedAt";

const STATUS_STYLES: Record<ClientStatus, string> = {
  active:  "border border-[rgba(40,202,65,0.4)] bg-[rgba(40,202,65,0.1)] text-[#28CA41]",
  paused:  "border border-[rgba(245,166,35,0.4)] bg-[rgba(245,166,35,0.08)] text-[#F5A623]",
  churned: "border border-red-500/30 bg-red-500/10 text-red-400",
};

const STATUS_ORDER: Record<ClientStatus, number> = {
  active: 0,
  paused: 1,
  churned: 2,
};

function fmt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCurrency(n: number): string {
  return n === 0 ? "—" : `$${n.toLocaleString()}`;
}

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
      const res = await fetch("/api/admin/clients");
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

  // Stats
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
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-display text-2xl text-ink">Clients</h1>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
            <span className="text-ink-subtle">
              <span className="text-[#28CA41]">{activeClients.length}</span> active
            </span>
            {totalMrr > 0 && (
              <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-accent">
                MRR {formatCurrency(totalMrr)}
              </span>
            )}
            {churnedCount > 0 && (
              <span className="text-red-400">{churnedCount} churned</span>
            )}
          </div>
        </div>

        <button
          onClick={() => setAddOpen(true)}
          className="rounded-md bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-canvas transition-shadow hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] active:scale-[0.98]"
        >
          + Add Client
        </button>
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
            <div key={i} className="h-20 rounded-xl border border-hairline bg-surface-1 animate-pulse" />
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
                className="group w-full rounded-xl border border-hairline bg-surface-1 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-hairline-strong"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  {/* Left */}
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-sans text-base font-medium text-ink group-hover:text-white truncate">
                        {client.businessName}
                      </span>
                      <span
                        className={[
                          "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider",
                          STATUS_STYLES[client.status],
                        ].join(" ")}
                      >
                        {client.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-ink-subtle">
                      {client.contactName && <span>{client.contactName}</span>}
                      {client.contactName && client.email && <span aria-hidden>·</span>}
                      {client.email && (
                        <span className="truncate max-w-[200px]">{client.email}</span>
                      )}
                    </div>
                    {client.siteUrl && (
                      <p className="font-mono text-[11px] text-accent/70 truncate max-w-xs">
                        {client.siteUrl}
                      </p>
                    )}
                  </div>

                  {/* Right: financials */}
                  <div className="flex flex-col items-end gap-1 shrink-0 font-mono text-[11px]">
                    {client.monthlyCharge > 0 && (
                      <span className="text-ink-secondary">
                        {formatCurrency(client.monthlyCharge)}/mo
                      </span>
                    )}
                    {client.oneTimeValue > 0 && (
                      <span className="text-ink-subtle">
                        {formatCurrency(client.oneTimeValue)} one-time
                      </span>
                    )}
                    {ltv > 0 && (
                      <span className="text-ink-subtle">
                        LTV {formatCurrency(ltv)}
                      </span>
                    )}
                    <span className="text-ink-subtle/60">
                      since {fmt(client.startDate)}
                    </span>
                    {client.lastVerifiedAt && (
                      <span className="text-[#28CA41]/80">
                        ✓ {fmt(client.lastVerifiedAt)}
                      </span>
                    )}
                  </div>
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
