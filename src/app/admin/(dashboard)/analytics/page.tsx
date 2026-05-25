/**
 * src/app/admin/(dashboard)/analytics/page.tsx
 *
 * /admin/analytics — ANALYTICS tab (server component shell).
 */

export const dynamic = "force-dynamic";

import AnalyticsTab from "@/components/admin/AnalyticsTab";

export default function AnalyticsPage() {
  return <AnalyticsTab />;
}
