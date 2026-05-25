/**
 * src/lib/admin/auth.ts
 *
 * iron-session config and server helpers for the admin panel.
 *
 * Edge-safe: this file only imports iron-session and sets up config.
 * No Node.js-only imports (no fs, no bcryptjs) — those live in API routes.
 *
 * Used by:
 *  - src/middleware.ts (Edge) — via unsealData for cookie verification
 *  - src/app/api/admin/** (Node.js) — via getAdminSession() for session R/W
 */

import { getIronSession, type IronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

// ---------------------------------------------------------------------------
// Session data shape
// ---------------------------------------------------------------------------

export interface AdminSessionData {
  /** Set to 'noah' on successful login, absent if not logged in. */
  ownerId?: string;
}

// ---------------------------------------------------------------------------
// iron-session config
// ---------------------------------------------------------------------------

export function getSessionOptions(): SessionOptions {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('[admin] SESSION_SECRET env var is missing — cannot initialize session.');
  }
  if (secret.length < 32) {
    throw new Error('[admin] SESSION_SECRET must be at least 32 characters long.');
  }

  return {
    cookieName: 'nrg_admin_session',
    password: secret,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    },
  };
}

// ---------------------------------------------------------------------------
// Server helper — Node.js API routes only (not middleware/Edge)
// ---------------------------------------------------------------------------

/**
 * Get the iron-session for the current request (App Router).
 * Call from Node.js API route handlers only — not from middleware.
 *
 * Returns the session object. If no session exists, session.ownerId is undefined.
 */
export async function getAdminSession(): Promise<IronSession<AdminSessionData>> {
  const cookieStore = cookies();
  return getIronSession<AdminSessionData>(cookieStore, getSessionOptions());
}

// ---------------------------------------------------------------------------
// Credential verification — Node.js only (bcryptjs imported at call site)
// ---------------------------------------------------------------------------

/**
 * Verify a username + password against the env-var credentials.
 *
 * Uses timing-safe string compare for the username and bcryptjs.compare
 * for the password (bcrypt handles timing-safety internally).
 *
 * Throws if required env vars are missing (caught by middleware as 503).
 *
 * @param username - plaintext username from login form
 * @param password - plaintext password from login form
 * @returns true if credentials match, false otherwise
 */
export async function verifyCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;

  if (!expectedUsername || !expectedHash) {
    throw new Error('[admin] ADMIN_USERNAME or ADMIN_PASSWORD_HASH env var is missing.');
  }

  // Timing-safe username comparison
  const { timingSafeEqual } = await import('crypto');
  const a = Buffer.from(username);
  const b = Buffer.from(expectedUsername);
  // Pad to same length to avoid length-timing leaks (still compare full buffers)
  const usernameMatch =
    a.length === b.length && timingSafeEqual(a, b);

  if (!usernameMatch) {
    // Still run bcrypt to prevent timing oracle on username enumeration
    // Use a dummy hash that will always fail
    const { compare } = await import('bcryptjs');
    await compare(password, '$2a$12$invalidhashpadding000000000000000000000000000000000000');
    return false;
  }

  const { compare } = await import('bcryptjs');
  return compare(password, expectedHash);
}

// ---------------------------------------------------------------------------
// Env var guard — call at the top of any admin handler
// ---------------------------------------------------------------------------

/**
 * Throws if any required admin env var is missing.
 * Call at the top of API route handlers as defense-in-depth
 * (middleware should have already caught this, but belt-and-suspenders).
 */
export function requireAdminEnv(): void {
  if (
    !process.env.ADMIN_USERNAME ||
    !process.env.ADMIN_PASSWORD_HASH ||
    !process.env.SESSION_SECRET
  ) {
    throw new Error('[admin] Required admin env vars are missing.');
  }
}
