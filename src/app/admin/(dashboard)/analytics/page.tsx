/**
 * src/app/admin/(dashboard)/analytics/page.tsx
 *
 * /admin/analytics — ANALYTICS tab (server component shell).
 * Container-content bounds the width; admin-section provides vertical rhythm.
 */

export const dynamic = "force-dynamic";

import AnalyticsTab from "@/components/admin/AnalyticsTab";

export default function AnalyticsPage() {
  return (
    <div className="container-content admin-section">
      <AnalyticsTab />
    </div>
  );
}
