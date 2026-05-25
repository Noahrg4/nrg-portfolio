/**
 * src/app/admin/(dashboard)/clients/page.tsx
 *
 * /admin/clients — CLIENTS tab (server component shell).
 * Container-content bounds the width; admin-section provides vertical rhythm.
 */

export const dynamic = "force-dynamic";

import ClientsTab from "@/components/admin/ClientsTab";

export default function ClientsPage() {
  return (
    <div className="container-content admin-section">
      <ClientsTab />
    </div>
  );
}
