/**
 * src/app/admin/(dashboard)/layout.tsx
 *
 * Dashboard shell — wraps all authenticated admin tabs.
 * Shows the admin tab bar + top header. No public Nav/Footer.
 */

export const dynamic = "force-dynamic";

import AdminShell from "@/components/admin/AdminShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
