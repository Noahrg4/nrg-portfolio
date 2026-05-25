/**
 * POST /api/admin/leads/[id]/convert
 *
 * Converts a lead to a client.
 *
 * Request body: { monthlyCharge, oneTimeValue, siteUrl, startDate }
 * Response: { lead, client } with status 201
 *
 * Side effects (atomic with compensation on failure):
 * 1. Creates a Client record from the lead's contact details
 * 2. Sets lead.stage = "Won", appends stageHistory, sets convertedClientId
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/auth';
import { convertLeadToClient } from '@/lib/admin/db';
import type { ConvertLeadBody } from '@/lib/admin/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: { id: string } };

export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await getAdminSession();
  if (!session.ownerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Partial<ConvertLeadBody>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // Provide sensible defaults — owner can edit the client record after creation
  const convertBody: ConvertLeadBody = {
    monthlyCharge: typeof body.monthlyCharge === 'number' ? body.monthlyCharge : 0,
    oneTimeValue: typeof body.oneTimeValue === 'number' ? body.oneTimeValue : 0,
    siteUrl: typeof body.siteUrl === 'string' ? body.siteUrl.trim() : '',
    startDate:
      typeof body.startDate === 'string'
        ? body.startDate
        : new Date().toISOString().slice(0, 10),
  };

  const result = await convertLeadToClient(params.id, convertBody);

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result, { status: 201 });
}
