/**
 * POST /api/admin/auth/login
 *
 * Accepts { username, password }, verifies credentials, and seals the session.
 * Returns 204 on success, 401 on failure, 503 if env vars are missing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, verifyCredentials, requireAdminEnv } from '@/lib/admin/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Fail closed — env var guard
  try {
    requireAdminEnv();
  } catch {
    return NextResponse.json(
      { error: 'Service unavailable — admin panel is not configured.' },
      { status: 503 }
    );
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!username || !password) {
    return NextResponse.json(
      { error: 'Username and password are required.' },
      { status: 400 }
    );
  }

  let valid: boolean;
  try {
    valid = await verifyCredentials(username, password);
  } catch (err) {
    console.error('[admin/login] credential verification error:', err);
    return NextResponse.json(
      { error: 'Service unavailable.' },
      { status: 503 }
    );
  }

  if (!valid) {
    // Same message regardless of which field was wrong — no username enumeration
    return NextResponse.json(
      { error: 'Invalid credentials.' },
      { status: 401 }
    );
  }

  // Seal the session
  const session = await getAdminSession();
  session.ownerId = 'noah';
  await session.save();

  return new NextResponse(null, { status: 204 });
}
