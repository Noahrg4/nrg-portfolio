/**
 * GET /api/admin/analytics
 *
 * Returns the full AnalyticsPayload — all numbers, no strings.
 * See src/lib/admin/types.ts for the type definition.
 * See src/lib/admin/aggregations.ts for the computation logic.
 */

import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/auth';
import { listLeads, listClients } from '@/lib/admin/db';
import { computeAnalytics } from '@/lib/admin/aggregations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session.ownerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [leads, clients] = await Promise.all([listLeads(), listClients()]);
  const analytics = computeAnalytics(leads, clients);

  return NextResponse.json(analytics);
}
