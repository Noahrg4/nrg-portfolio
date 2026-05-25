/**
 * src/app/admin/(dashboard)/page.tsx
 *
 * /admin — redirects to /admin/leads.
 */

export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

export default function AdminRoot() {
  redirect("/admin/leads");
}
