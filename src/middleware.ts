/**
 * src/middleware.ts
 *
 * Edge-compatible middleware that protects all /admin/* and /api/admin/* routes.
 *
 * Edge rules:
 *  - NO Node.js-only imports (no fs, no bcryptjs, no db.ts)
 *  - Uses iron-session's unsealData() which works on the Web Crypto API (Edge-safe)
 *  - Reads the sealed cookie directly from request headers
 *
 * Behavior:
 *  - If any required env var is missing → 503 (fail closed, always)
 *  - /admin/login → allow through (public login page)
 *  - /api/admin/auth/login, /api/admin/auth/logout → allow through (auth endpoints)
 *  - /admin/* (not login) → redirect to /admin/login if no session
 *  - /api/admin/* (not auth) → 401 JSON if no session
 */

import { NextRequest, NextResponse } from 'next/server';
import { unsealData } from 'iron-session';
import type { AdminSessionData } from '@/lib/admin/auth';

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

// ---------------------------------------------------------------------------
// Env var check (fail-closed)
// ---------------------------------------------------------------------------

function checkEnvVars(): boolean {
  return Boolean(
    process.env.ADMIN_USERNAME &&
    process.env.ADMIN_PASSWORD_HASH &&
    process.env.SESSION_SECRET
  );
}

// ---------------------------------------------------------------------------
// Cookie extraction
// ---------------------------------------------------------------------------

const COOKIE_NAME = 'nrg_admin_session';

function getCookieValue(req: NextRequest): string | undefined {
  return req.cookies.get(COOKIE_NAME)?.value;
}

// ---------------------------------------------------------------------------
// Session verification (Edge-safe)
// ---------------------------------------------------------------------------

async function getSessionFromCookie(
  cookieValue: string
): Promise<AdminSessionData | null> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;

  try {
    const session = await unsealData<AdminSessionData>(cookieValue, {
      password: secret,
    });
    return session;
  } catch {
    // Cookie is invalid, tampered, or expired
    return null;
  }
}

// ---------------------------------------------------------------------------
// Middleware handler
// ---------------------------------------------------------------------------

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // Fail closed — if env vars are missing, return 503 for all /admin routes
  if (!checkEnvVars()) {
    return NextResponse.json(
      { error: 'Service unavailable — admin panel is not configured.' },
      { status: 503 }
    );
  }

  // Allow the login page through (public — renders the login form)
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Allow the auth API endpoints through (they handle auth themselves)
  if (
    pathname === '/api/admin/auth/login' ||
    pathname === '/api/admin/auth/logout' ||
    pathname === '/api/admin/auth/me'
  ) {
    return NextResponse.next();
  }

  // All other /admin/* and /api/admin/* require a valid session
  const cookieValue = getCookieValue(req);

  if (!cookieValue) {
    return handleUnauthenticated(req);
  }

  const session = await getSessionFromCookie(cookieValue);

  if (!session?.ownerId) {
    return handleUnauthenticated(req);
  }

  // Session is valid — allow through
  return NextResponse.next();
}

function handleUnauthenticated(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  // API routes return 401 JSON
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Unauthorized — please log in at /admin/login' },
      { status: 401 }
    );
  }

  // Page routes redirect to login
  const loginUrl = new URL('/admin/login', req.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}
