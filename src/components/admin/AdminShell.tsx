"use client";

/**
 * src/components/admin/AdminShell.tsx
 *
 * Dashboard chrome — top header bar with NRG wordmark, logout, and the
 * three-tab nav (LEADS / CLIENTS / ANALYTICS). Wraps all dashboard pages.
 * Dark canvas, same visual language as the public site.
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const TABS = [
  { label: "Leads", href: "/admin/leads" },
  { label: "Clients", href: "/admin/clients" },
  { label: "Analytics", href: "/admin/analytics" },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // swallow — still redirect
    }
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      {/* ─── Top header bar ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/80 backdrop-blur-xl">
        <div className="container-content flex h-14 items-center justify-between gap-4">
          {/* Wordmark */}
          <Link
            href="/admin/leads"
            className="font-display text-lg font-extrabold tracking-tight text-ink"
          >
            NRG
            <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-ink-subtle">
              Admin
            </span>
          </Link>

          {/* Tab bar — desktop */}
          <nav aria-label="Admin navigation" className="hidden sm:flex items-center gap-1">
            {TABS.map((tab) => {
              const active =
                tab.href === "/admin/leads"
                  ? pathname === "/admin/leads" || pathname === "/admin"
                  : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={[
                    "rounded-md px-4 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors",
                    active
                      ? "bg-accent/10 text-accent"
                      : "text-ink-subtle hover:text-ink",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle transition-colors hover:text-ink disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Log out"
          >
            {loggingOut ? "…" : "Log out"}
          </button>
        </div>

        {/* Tab bar — mobile (below header row) */}
        <div className="flex sm:hidden border-t border-hairline">
          {TABS.map((tab) => {
            const active =
              tab.href === "/admin/leads"
                ? pathname === "/admin/leads" || pathname === "/admin"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={[
                  "flex-1 py-2.5 text-center font-mono text-[10px] uppercase tracking-wider transition-colors",
                  active
                    ? "border-b-2 border-accent text-accent"
                    : "text-ink-subtle",
                ].join(" ")}
                aria-current={active ? "page" : undefined}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* ─── Page content ────────────────────────────────────────────────────── */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
