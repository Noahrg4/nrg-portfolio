/**
 * src/app/admin/(dashboard)/leads/page.tsx
 *
 * /admin/leads — LEADS tab (server component shell).
 * Container-content bounds the width; admin-section provides vertical rhythm.
 */

export const dynamic = "force-dynamic";

import LeadsTab from "@/components/admin/LeadsTab";

export default function LeadsPage() {
  return (
    <div className="container-content admin-section">
      <LeadsTab />
    </div>
  );
}
