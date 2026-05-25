/**
 * GET    /api/admin/leads/[id]  — single lead
 * PATCH  /api/admin/leads/[id]  — partial update
 * DELETE /api/admin/leads/[id]  — delete
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/auth';
import { getLead, updateLead, deleteLead } from '@/lib/admin/db';
import type { UpdateLeadBody } from '@/lib/admin/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: { id: string } };

// ---------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await getAdminSession();
  if (!session.ownerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const lead = await getLead(params.id);
  if (!lead) {
    return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
  }
  return NextResponse.json(lead);
}

// ---------------------------------------------------------------------------
// PATCH
// ---------------------------------------------------------------------------

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getAdminSession();
  if (!session.ownerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: UpdateLeadBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // Strip fields that must not be patched directly
  const { id: _id, createdAt: _createdAt, stageHistory: _sh, score: _sc, ...safePatch } = body as UpdateLeadBody & {
    id?: string;
    createdAt?: string;
    stageHistory?: unknown;
    score?: number;
  };

  const updated = await updateLead(params.id, safePatch);
  if (!updated) {
    return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
  }
  return NextResponse.json(updated);
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await getAdminSession();
  if (!session.ownerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const deleted = await deleteLead(params.id);
  if (!deleted) {
    return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
