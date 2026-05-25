"use client";

/**
 * src/components/admin/AdminShell.tsx
 *
 * Dashboard chrome — sticky top header with NRG wordmark, tab nav, and logout.
 * Mobile: header stays (wordmark + logout), tabs move to a fixed bottom bar.
 *
 * Scroll behavior:
 *   - At scroll = 0: transparent header, no border
 *   - After scrolling 20px: frosted glass bg-canvas/70 backdrop-blur-xl, border-b
 *   This matches the public site Nav pattern.
 *
 * Logout:
 *   - POSTs to /api/admin/auth/logout
 *   - Shows loading spinner during in-flight
 *   - Redirects to /admin/login on completion
 *
 * Tab nav:
 *   - Desktop (sm+): inline links in header center
 *   - Mobile (<sm): fixed bottom bar, 3 tabs spread, 52px tall each, accent underline on active
 *
 * Bottom bar safe area: main content gets pb-[52px] on mobile to prevent
 * the bottom tab bar from overlapping last rows.
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TABS = [
  {
    label: "Leads",
    href: "/admin/leads",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}
        strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
        <circle cx="8" cy="5" r="3" />
        <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" />
      </svg>
    ),
  },
  {
    label: "Clients",
    href: "/admin/clients",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}
        strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
        <rect x="2" y="4" width="12" height="9" rx="1.5" />
        <path d="M5 7.5h6M5 10h4" />
      </svg>
    ),
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}
        strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
        <path d="M2 12L6 7l3 3 2-4 3 4" />
      </svg>
    ),
  },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Frosted glass threshold — 20px
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    // Run once on mount in case page starts scrolled
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  function isTabActive(tab: (typeof TABS)[number]) {
    if (tab.href === "/admin/leads") {
      return pathname === "/admin/leads" || pathname === "/admin";
    }
    return pathname.startsWith(tab.href);
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas">

      {/* ─── Top header bar ──────────────────────────────────────────────────── */}
      <header
        className={[
          "sticky top-0 z-40 transition-[background,border-color,backdrop-filter] duration-200",
          scrolled
            ? "border-b border-hairline bg-canvas/70 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        ].join(" ")}
      >
        <div className="container-content flex h-14 items-center justify-between gap-4">
          {/* Wordmark */}
          <Link
            href="/admin/leads"
            className="flex items-baseline gap-2 font-display text-lg font-extrabold tracking-tight text-ink transition-opacity hover:opacity-80"
          >
            NRG
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-subtle">
              Admin
            </span>
          </Link>

          {/* Tab bar — desktop (sm+) */}
          <nav
            aria-label="Admin navigation"
            className="hidden sm:flex items-center gap-1"
          >
            {TABS.map((tab) => {
              const active = isTabActive(tab);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={[
                    "rounded-md px-4 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors duration-150",
                    active
                      ? "bg-accent/10 text-accent"
                      : "text-ink-subtle hover:bg-surface-2 hover:text-ink",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-subtle transition-colors hover:text-ink disabled:opacity-50"
            aria-label="Log out"
          >
            {loggingOut ? (
              <span
                aria-hidden
                className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent"
              />
            ) : (
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden
              >
                <path d="M6 3H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3M10 11l3-3-3-3M13 8H6" />
              </svg>
            )}
            <span className="hidden sm:inline">{loggingOut ? "Logging out…" : "Log out"}</span>
          </button>
        </div>
      </header>

      {/* ─── Page content ────────────────────────────────────────────────────── */}
      {/* On mobile, add bottom padding so the fixed bottom tab bar doesn't
          overlap the last row of content (52px bar + 8px gap = 60px) */}
      <main className="flex-1 pb-[60px] sm:pb-0">
        {children}
      </main>

      {/* ─── Bottom tab bar — mobile only (<sm) ─────────────────────────────── */}
      <nav
        aria-label="Admin navigation"
        className={[
          "fixed bottom-0 inset-x-0 z-40 flex sm:hidden",
          "border-t bg-canvas/80 backdrop-blur-xl transition-[border-color] duration-200",
          scrolled ? "border-hairline" : "border-hairline",
        ].join(" ")}
      >
        {TABS.map((tab) => {
          const active = isTabActive(tab);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={[
                "flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors duration-150",
                "min-h-[52px]",
                active ? "text-accent" : "text-ink-subtle",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              {/* Icon */}
              {tab.icon}
              {/* Label */}
              <span className="font-mono text-[9px] uppercase tracking-wider">
                {tab.label}
              </span>
              {/* Active underline */}
              {active && (
                <span
                  aria-hidden
                  className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-accent"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
