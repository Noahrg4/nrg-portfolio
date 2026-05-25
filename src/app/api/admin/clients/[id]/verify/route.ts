/**
 * POST /api/admin/clients/[id]/verify
 *
 * Stamps lastVerifiedAt = now.
 * Use whenever the owner checks that a client's site is still live and healthy.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/auth';
import { getClient, updateClient } from '@/lib/admin/db';
import { lifetimeValue } from '@/lib/admin/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: { id: string } };

export async function POST(_req: NextRequest, { params }: RouteContext) {
  const session = await getAdminSession();
  if (!session.ownerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await getClient(params.id);
  if (!client) {
    return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
  }

  const updated = await updateClient(params.id, {
    lastVerifiedAt: new Date().toISOString(),
  });

  if (!updated) {
    return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
  }

  return NextResponse.json({ ...updated, lifetimeValue: lifetimeValue(updated) });
}
