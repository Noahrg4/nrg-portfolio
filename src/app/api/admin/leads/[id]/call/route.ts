/**
 * POST /api/admin/leads/[id]/call
 *
 * Stamps calledAt = now, increments touchCount.
 * Use whenever the owner makes or attempts a call to a lead.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/auth';
import { getLead, updateLead } from '@/lib/admin/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: { id: string } };

export async function POST(_req: NextRequest, { params }: RouteContext) {
  const session = await getAdminSession();
  if (!session.ownerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const lead = await getLead(params.id);
  if (!lead) {
    return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
  }

  const updated = await updateLead(params.id, {
    calledAt: new Date().toISOString(),
    touchCount: (lead.touchCount ?? 0) + 1,
  });

  return NextResponse.json(updated);
}
