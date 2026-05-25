/**
 * POST /api/admin/auth/logout
 *
 * Destroys the session cookie. Returns 204 on success.
 * No auth check needed — destroying a session is always safe.
 */

import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await getAdminSession();
  session.destroy();
  return new NextResponse(null, { status: 204 });
}
