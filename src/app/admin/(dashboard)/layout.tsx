/**
 * src/app/admin/(dashboard)/layout.tsx
 *
 * Dashboard shell — wraps all authenticated admin tabs.
 * Renders AdminShell (sticky header + tab nav) around page content.
 * No public Nav/Footer.
 *
 * Visual contract for Agent 5 (AdminShell polish):
 *   - AdminShell's <main> wrapper should NOT add horizontal padding —
 *     each page's container-content div handles that independently.
 *   - The sticky header is 56px tall (h-14); inner content starts below it.
 *   - admin-section utility from globals.css provides the tighter vertical
 *     rhythm used across all dashboard pages.
 *
 * Agent 5 additions:
 *   - ToastProvider listens for "admin-toast" CustomEvents on window, renders
 *     the toast stack fixed bottom-right above all other layers.
 *   - KeyboardShortcutsListener wires global keyboard shortcuts (N, ?, Cmd+S).
 */

export const dynamic = "force-dynamic";

import AdminShell from "@/components/admin/AdminShell";
import ToastProvider from "@/components/admin/ToastProvider";
import { KeyboardShortcutsListener } from "@/components/admin/KeyboardShortcuts";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas">
      <ToastProvider>
        <AdminShell>{children}</AdminShell>
        {/* Global keyboard shortcut listener + cheat-sheet overlay */}
        <KeyboardShortcutsListener />
      </ToastProvider>
    </div>
  );
}
