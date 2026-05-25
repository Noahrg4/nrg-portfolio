/**
 * GET    /api/admin/clients/[id]  — single client
 * PATCH  /api/admin/clients/[id]  — partial update
 * DELETE /api/admin/clients/[id]  — delete
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/auth';
import { getClient, updateClient, deleteClient } from '@/lib/admin/db';
import { lifetimeValue } from '@/lib/admin/types';
import type { UpdateClientBody } from '@/lib/admin/types';

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

  const client = await getClient(params.id);
  if (!client) {
    return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
  }

  return NextResponse.json({ ...client, lifetimeValue: lifetimeValue(client) });
}

// ---------------------------------------------------------------------------
// PATCH
// ---------------------------------------------------------------------------

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getAdminSession();
  if (!session.ownerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: UpdateClientBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // Strip immutable fields
  const { id: _id, createdAt: _createdAt, ...safePatch } = body as UpdateClientBody & {
    id?: string;
    createdAt?: string;
  };

  const updated = await updateClient(params.id, safePatch);
  if (!updated) {
    return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
  }

  return NextResponse.json({ ...updated, lifetimeValue: lifetimeValue(updated) });
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await getAdminSession();
  if (!session.ownerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const deleted = await deleteClient(params.id);
  if (!deleted) {
    return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
