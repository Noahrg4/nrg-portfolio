/**
 * src/app/admin/(dashboard)/leads/page.tsx
 *
 * /admin/leads — LEADS tab (server component shell).
 * Fetches initial data server-side, passes to client component.
 */

export const dynamic = "force-dynamic";

import LeadsTab from "@/components/admin/LeadsTab";

export default function LeadsPage() {
  return <LeadsTab />;
}
