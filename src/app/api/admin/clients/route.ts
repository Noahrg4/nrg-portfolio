/**
 * GET  /api/admin/clients  — list all clients with computed lifetimeValue
 * POST /api/admin/clients  — create a client
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/auth';
import { listClients, createClient } from '@/lib/admin/db';
import { lifetimeValue } from '@/lib/admin/types';
import type { CreateClientBody } from '@/lib/admin/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// GET /api/admin/clients
// ---------------------------------------------------------------------------

export async function GET() {
  const session = await getAdminSession();
  if (!session.ownerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clients = await listClients();
  // Augment each client with computed lifetimeValue for the UI
  const withLtv = clients.map((c) => ({
    ...c,
    lifetimeValue: lifetimeValue(c),
  }));

  return NextResponse.json(withLtv, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

// ---------------------------------------------------------------------------
// POST /api/admin/clients
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session.ownerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Partial<CreateClientBody>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!body.businessName?.trim()) {
    return NextResponse.json({ error: 'businessName is required.' }, { status: 400 });
  }

  const input: CreateClientBody = {
    businessName: body.businessName.trim(),
    contactName: body.contactName?.trim() ?? '',
    phone: body.phone?.trim() ?? '',
    email: body.email?.trim() ?? '',
    siteUrl: body.siteUrl?.trim() ?? '',
    monthlyCharge: typeof body.monthlyCharge === 'number' ? body.monthlyCharge : 0,
    oneTimeValue: typeof body.oneTimeValue === 'number' ? body.oneTimeValue : 0,
    startDate:
      typeof body.startDate === 'string'
        ? body.startDate
        : new Date().toISOString().slice(0, 10),
    status: body.status ?? 'active',
    lastInvoicedAt: body.lastInvoicedAt ?? null,
    lastVerifiedAt: body.lastVerifiedAt ?? null,
    notes: body.notes ?? '',
    sourceLeadId: body.sourceLeadId ?? null,
  };

  const client = await createClient(input);
  return NextResponse.json(client, { status: 201 });
}
