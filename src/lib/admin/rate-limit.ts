/**
 * src/lib/admin/rate-limit.ts
 *
 * In-memory rate limiter for the admin login endpoint.
 *
 * Behavior:
 *  - Tracks FAILED login attempts per client IP
 *  - Max 5 failed attempts per 15-minute window
 *  - On 6th failed attempt: caller should return 429 with Retry-After header
 *  - Successful login resets the counter for that IP
 *
 * Limitation:
 *  - In-memory — each Netlify serverless cold start gets a fresh counter.
 *    An attacker hitting many concurrent containers could bypass the limit.
 *    This is a deterrent for the common case, not a cryptographic guarantee.
 *    See docs/admin-security.md §Brute-force protection for details.
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILURES = 5;

type FailureRecord = {
  timestamps: number[]; // epoch-ms timestamps of failed attempts within the window
};

const failureMap: Map<string, FailureRecord> = new Map();

/**
 * Purge stale entries to prevent unbounded memory growth.
 * Called on every check — O(n) but the map stays small in practice.
 */
function pruneStaleEntries(): void {
  const cutoff = Date.now() - WINDOW_MS;
  Array.from(failureMap.entries()).forEach(([ip, record]) => {
    const fresh = record.timestamps.filter((t: number) => t > cutoff);
    if (fresh.length === 0) {
      failureMap.delete(ip);
    } else {
      record.timestamps = fresh;
    }
  });
}

/**
 * Check whether an IP is currently rate-limited (has >= MAX_FAILURES failures
 * within the rolling window).
 *
 * Does NOT record a new failure — call recordFailure() if the attempt fails.
 *
 * @returns An object:
 *   - { limited: false }                           — under the limit, may proceed
 *   - { limited: true, retryAfterSeconds: number } — over limit, include Retry-After
 */
export function checkRateLimit(
  ip: string
): { limited: false } | { limited: true; retryAfterSeconds: number } {
  pruneStaleEntries();

  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const record = failureMap.get(ip);

  if (!record) return { limited: false };

  const fresh = record.timestamps.filter((t) => t > cutoff);
  if (fresh.length < MAX_FAILURES) return { limited: false };

  // IP is rate-limited — compute how long until the oldest failure expires
  const oldest = Math.min(...fresh);
  const retryAfterMs = oldest + WINDOW_MS - now;
  const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);

  return { limited: true, retryAfterSeconds };
}

/**
 * Record a failed login attempt for an IP.
 * Call AFTER verifying credentials return false (NOT on every request).
 */
export function recordFailure(ip: string): void {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const record = failureMap.get(ip);

  if (!record) {
    failureMap.set(ip, { timestamps: [now] });
    return;
  }

  // Keep only timestamps within the window, then append the new one
  record.timestamps = record.timestamps.filter((t) => t > cutoff);
  record.timestamps.push(now);
}

/**
 * Reset the failure counter for an IP.
 * Call AFTER a successful login to clear the slate.
 */
export function resetFailures(ip: string): void {
  failureMap.delete(ip);
}

/**
 * Extract the best available client IP from the request headers.
 * Works with Netlify's edge network (x-forwarded-for) and direct connections.
 */
export function getClientIp(req: { headers: { get(name: string): string | null } }): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}
