"use client";

/**
 * src/components/admin/ClientDrawer.tsx
 *
 * Full client detail + edit drawer. Supports status update, invoiced date,
 * verify-still-operating button, notes, site URL, and charges.
 */

import { useState, useCallback } from "react";
import type { Client, ClientStatus } from "@/lib/admin/types";
import { lifetimeValue } from "@/lib/admin/types";
import Drawer from "./Drawer";

interface ClientDrawerProps {
  client: Client | null;
  open: boolean;
  onClose: () => void;
  onUpdated: (updated: Client) => void;
}

const inputClass =
  "w-full rounded-md border border-hairline bg-surface-2 px-4 py-3 text-base text-ink placeholder:text-ink-subtle transition-colors duration-200 focus:border-accent focus:outline-none";

const labelClass = "font-mono text-[11px] uppercase tracking-wider text-ink-secondary mb-3 block";

const STATUS_STYLES: Record<ClientStatus, string> = {
  active:  "border border-[rgba(40,202,65,0.4)] bg-[rgba(40,202,65,0.1)] text-[#28CA41]",
  paused:  "border border-[rgba(245,166,35,0.4)] bg-[rgba(245,166,35,0.08)] text-[#F5A623]",
  churned: "border border-red-500/30 bg-red-500/10 text-red-400",
};

function fmt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCurrency(n: number): string {
  return n === 0 ? "—" : `$${n.toLocaleString()}`;
}

export default function ClientDrawer({
  client,
  open,
  onClose,
  onUpdated,
}: ClientDrawerProps) {
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [status, setStatus] = useState<ClientStatus | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [siteUrl, setSiteUrl] = useState<string>("");
  const [monthlyCharge, setMonthlyCharge] = useState<string>("");
  const [oneTimeValue, setOneTimeValue] = useState<string>("");
  const [lastInvoicedAt, setLastInvoicedAt] = useState<string>("");

  const syncLocal = useCallback((c: Client) => {
    setStatus(c.status);
    setNotes(c.notes);
    setSiteUrl(c.siteUrl);
    setMonthlyCharge(String(c.monthlyCharge));
    setOneTimeValue(String(c.oneTimeValue));
    setLastInvoicedAt(c.lastInvoicedAt ? c.lastInvoicedAt.slice(0, 10) : "");
  }, []);

  if (client && open && status === null) {
    syncLocal(client);
  }

  if (!client) return null;

  const currentStatus = status ?? client.status;
  const ltv = lifetimeValue(client);

  async function patch(body: Record<string, unknown>) {
    if (!client) return null;
    const res = await fetch(`/api/admin/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to update client");
    return (await res.json()) as Client;
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await patch({
        status: currentStatus,
        notes,
        siteUrl,
        monthlyCharge: Number(monthlyCharge) || 0,
        oneTimeValue: Number(oneTimeValue) || 0,
        lastInvoicedAt: lastInvoicedAt ? new Date(lastInvoicedAt).toISOString() : null,
      });
      if (updated) {
        onUpdated(updated);
        syncLocal(updated);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  async function handleVerify() {
    if (!client) return;
    setVerifying(true);
    try {
      const res = await fetch(`/api/admin/clients/${client.id}/verify`, { method: "POST" });
      if (res.ok) {
        const updated = (await res.json()) as Client;
        onUpdated(updated);
        syncLocal(updated);
      }
    } catch {
      // silent
    } finally {
      setVerifying(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={() => {
        setStatus(null);
        onClose();
      }}
      title={client.businessName}
      subtitle={client.email || client.phone || undefined}
      width="max-w-lg"
    >
      <div className="flex flex-col gap-0">

        {/* ─── Status + LTV summary row ───────────────────────────────────── */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span
            className={[
              "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider",
              STATUS_STYLES[currentStatus],
            ].join(" ")}
          >
            {currentStatus}
          </span>
          <span className="font-mono text-[11px] text-ink-subtle">
            LTV: <span className="text-ink-secondary">{formatCurrency(ltv)}</span>
          </span>
          {client.siteUrl && (
            <a
              href={client.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] text-accent transition-colors hover:text-accent/80 underline break-all"
            >
              {client.siteUrl}
            </a>
          )}
        </div>

        {/* ─── Contact (read-only) ────────────────────────────────────────── */}
        <div className="border-t border-hairline pt-5 pb-6">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle mb-3">
            Contact
          </p>
          <div className="rounded-lg border-l-2 border-accent/35 bg-surface-2 px-4 py-3">
            <div className="grid grid-cols-1 gap-1.5 font-mono text-[11px]">
              {client.contactName && (
                <span className="text-ink-secondary">{client.contactName}</span>
              )}
              {client.phone && (
                <a href={`tel:${client.phone}`} className="text-accent transition-colors hover:text-accent/80">
                  {client.phone}
                </a>
              )}
              {client.email && (
                <a href={`mailto:${client.email}`} className="text-accent transition-colors hover:text-accent/80 break-all">
                  {client.email}
                </a>
              )}
              {!client.contactName && !client.phone && !client.email && (
                <span className="text-ink-subtle italic">No contact info on file</span>
              )}
            </div>
          </div>
        </div>

        {/* ─── Status + Site URL ──────────────────────────────────────────── */}
        <div className="border-t border-hairline pt-5 pb-6">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle mb-4">
            Status &amp; Site
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Status</label>
              <select
                value={currentStatus}
                onChange={(e) => setStatus(e.target.value as ClientStatus)}
                disabled={saving}
                className="w-full rounded-md border border-hairline bg-surface-2 px-3 py-3 text-base text-ink transition-colors duration-200 focus:border-accent focus:outline-none appearance-none"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23555' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="churned">Churned</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="client-site-url" className={labelClass}>
                Site URL
              </label>
              <input
                id="client-site-url"
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={saving}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* ─── Billing ────────────────────────────────────────────────────── */}
        <div className="border-t border-hairline pt-5 pb-6">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle mb-4">
            Billing
          </p>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>One-time ($)</label>
                <input
                  type="number"
                  min={0}
                  value={oneTimeValue}
                  onChange={(e) => setOneTimeValue(e.target.value)}
                  disabled={saving}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Monthly ($)</label>
                <input
                  type="number"
                  min={0}
                  value={monthlyCharge}
                  onChange={(e) => setMonthlyCharge(e.target.value)}
                  disabled={saving}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="last-invoiced" className={labelClass}>
                Last invoiced
              </label>
              <input
                id="last-invoiced"
                type="date"
                value={lastInvoicedAt}
                onChange={(e) => setLastInvoicedAt(e.target.value)}
                disabled={saving}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* ─── Notes ──────────────────────────────────────────────────────── */}
        <div className="border-t border-hairline pt-5 pb-6">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle mb-4">
            Notes
          </p>
          <textarea
            id="client-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Notes about this client…"
            disabled={saving}
            className={`${inputClass} resize-y`}
          />
        </div>

        {/* ─── Verify operating ───────────────────────────────────────────── */}
        <div className="border-t border-hairline pt-5 pb-6">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle mb-3">
            Verification
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="flex items-center gap-1.5 rounded-md border border-hairline px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-ink-secondary transition-colors duration-200 hover:border-accent hover:text-accent disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <span aria-hidden className="inline-block h-2.5 w-2.5 animate-spin rounded-full border-2 border-ink-secondary border-r-transparent" />
                  Verifying…
                </>
              ) : (
                "✓ Mark as verified"
              )}
            </button>
            {client.lastVerifiedAt && (
              <span className="font-mono text-[11px] text-ink-subtle">
                Last verified: {fmt(client.lastVerifiedAt)}
              </span>
            )}
          </div>
        </div>

        {/* ─── Timestamps (read-only) ─────────────────────────────────────── */}
        <div className="border-t border-hairline pt-5 pb-6">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle mb-3">
            Record info
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-surface-2 px-4 py-3 font-mono text-[11px]">
            <span className="text-ink-subtle">Start date</span>
            <span className="text-ink-secondary text-right">{fmt(client.startDate)}</span>
            <span className="text-ink-subtle">Created</span>
            <span className="text-ink-secondary text-right">{fmt(client.createdAt)}</span>
            <span className="text-ink-subtle">Updated</span>
            <span className="text-ink-secondary text-right">{fmt(client.updatedAt)}</span>
          </div>
        </div>

        {/* ─── Save button ────────────────────────────────────────────────── */}
        <div className="border-t border-hairline pt-5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-6 py-3.5 font-mono text-sm uppercase tracking-wider text-canvas transition-all duration-200 hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] active:scale-[0.98] disabled:opacity-60"
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
  );
}
