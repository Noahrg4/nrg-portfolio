"use client";

/**
 * src/components/admin/AddClientForm.tsx
 *
 * Form inside the "Add Client" modal.
 * POSTs to /api/admin/clients and calls onCreated with the new Client.
 */

import { useState } from "react";
import type { Client } from "@/lib/admin/types";

interface AddClientFormProps {
  onCreated: (client: Client) => void;
  onCancel: () => void;
}

const inputClass =
  "w-full rounded-md border border-hairline bg-surface-2 px-4 py-3 text-base text-ink placeholder:text-ink-subtle transition-colors duration-200 focus:border-accent focus:outline-none";

const labelClass = "font-mono text-[11px] uppercase tracking-wider text-ink-secondary block mb-1.5";

export default function AddClientForm({ onCreated, onCancel }: AddClientFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [monthlyCharge, setMonthlyCharge] = useState("0");
  const [oneTimeValue, setOneTimeValue] = useState("500");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim()) {
      setError("Business name is required.");
      return;
    }
    setError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          contactName: contactName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          siteUrl: siteUrl.trim(),
          monthlyCharge: Number(monthlyCharge) || 0,
          oneTimeValue: Number(oneTimeValue) || 0,
          startDate,
          status: "active",
          notes: notes.trim(),
          sourceLeadId: null,
          lastInvoicedAt: null,
          lastVerifiedAt: null,
        }),
      });

      if (res.ok) {
        const client = (await res.json()) as Client;
        onCreated(client);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to create client.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-0" noValidate>

      {/* ─── Business ─────────────────────────────────────────────────────── */}
      <div className="pb-6">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle mb-4">
          Business
        </p>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>
            Business name <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Martinez HVAC"
            required
            autoFocus
            className={inputClass}
          />
        </div>
      </div>

      {/* ─── Contact ──────────────────────────────────────────────────────── */}
      <div className="border-t border-hairline pt-5 pb-6">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle mb-4">
          Contact
        </p>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Contact name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Owner's name"
                className={inputClass}
              />
            </div>
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
          </div>

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

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Site URL</label>
            <input
              type="url"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://example.com"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* ─── Billing ──────────────────────────────────────────────────────── */}
      <div className="border-t border-hairline pt-5 pb-6">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle mb-4">
          Billing
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>One-time ($)</label>
            <input
              type="number"
              min={0}
              value={oneTimeValue}
              onChange={(e) => setOneTimeValue(e.target.value)}
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
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* ─── Notes ────────────────────────────────────────────────────────── */}
      <div className="border-t border-hairline pt-5 pb-6">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle mb-4">
          Notes
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Notes about this client…"
          className={`${inputClass} resize-y`}
        />
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 font-mono text-sm text-red-300">
          {error}
        </div>
      )}

      {/* ─── Actions ──────────────────────────────────────────────────────── */}
      <div className="border-t border-hairline pt-5 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex-1 rounded-md border border-hairline-strong px-4 py-3 font-mono text-sm uppercase tracking-wider text-ink-secondary transition-colors duration-200 hover:border-accent hover:text-accent disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 font-mono text-sm uppercase tracking-wider text-canvas transition-all duration-200 hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] active:scale-[0.98] disabled:opacity-60"
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
            "Add Client"
          )}
        </button>
      </div>
    </form>
  );
}
