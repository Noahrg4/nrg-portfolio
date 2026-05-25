/**
 * src/app/admin/(dashboard)/clients/page.tsx
 *
 * /admin/clients — CLIENTS tab (server component shell).
 */

export const dynamic = "force-dynamic";

import ClientsTab from "@/components/admin/ClientsTab";

export default function ClientsPage() {
  return <ClientsTab />;
}
