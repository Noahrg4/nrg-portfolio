/**
 * POST /api/admin/auth/login
 *
 * Accepts { username, password }, verifies credentials, and seals the session.
 * Returns 204 on success, 401 on failure, 429 if rate-limited, 503 if env vars are missing.
 *
 * Rate limiting: max 5 failed attempts per IP per 15-minute window.
 * Only failed attempts increment the counter; a successful login resets it.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, verifyCredentials, requireAdminEnv } from '@/lib/admin/auth';
import { checkRateLimit, recordFailure, resetFailures, getClientIp } from '@/lib/admin/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Fail closed — env var guard
  try {
    requireAdminEnv();
  } catch {
    return NextResponse.json(
      { error: 'Admin not configured.' },
      { status: 503 }
    );
  }

  // Rate-limit check — before parsing body to save work on hammered endpoints
  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(ip);
  if (rateCheck.limited) {
    const minutes = Math.ceil(rateCheck.retryAfterSeconds / 60);
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.` },
      {
        status: 429,
        headers: { 'Retry-After': String(rateCheck.retryAfterSeconds) },
      }
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
      { error: 'Admin not configured.' },
      { status: 503 }
    );
  }

  if (!valid) {
    // Record failure for rate limiting before returning
    recordFailure(ip);
    // Same message regardless of which field was wrong — no username enumeration
    return NextResponse.json(
      { error: 'Invalid credentials.' },
      { status: 401 }
    );
  }

  // Successful login — reset failure counter, then seal the session
  resetFailures(ip);
  const session = await getAdminSession();
  session.ownerId = 'noah';
  await session.save();

  return new NextResponse(null, { status: 204 });
}
