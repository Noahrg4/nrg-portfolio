/**
 * GET /api/admin/auth/me
 *
 * Returns { ownerId } if logged in, 401 otherwise.
 * Middleware already guards /api/admin/* but this provides defense-in-depth
 * and lets the frontend check session status.
 */

import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();

  if (!session.ownerId) {
    return NextResponse.json(
      { error: 'Unauthorized — please log in at /admin/login' },
      { status: 401 }
    );
  }

  return NextResponse.json({ ownerId: session.ownerId });
}
