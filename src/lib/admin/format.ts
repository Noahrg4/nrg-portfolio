/**
 * src/lib/admin/format.ts
 *
 * Pure formatting helpers for admin panel numbers and dates.
 * No React imports — safe in any context (server, client, edge).
 */

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------

/**
 * Formats a USD dollar amount without cents if whole, with cents if non-whole.
 * Examples: 1234 → "$1,234", 1234.56 → "$1,234.56", 0 → "$0"
 */
export function formatCurrency(n: number): string {
  if (!isFinite(n)) return "$—";
  const isWhole = Number.isInteger(n);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  }).format(n);
}

/**
 * Short currency for tight spaces: $1.2k instead of $1,200.
 * Whole dollars under 1000 are shown as-is: $650.
 */
export function formatCurrencyShort(n: number): string {
  if (!isFinite(n)) return "$—";
  if (n === 0) return "$0";
  if (n >= 1000) {
    const k = n / 1000;
    const isWholeK = Number.isInteger(k);
    return `$${isWholeK ? k : k.toFixed(1)}k`;
  }
  return formatCurrency(n);
}

// ---------------------------------------------------------------------------
// Percentage
// ---------------------------------------------------------------------------

/**
 * Formats a decimal (0–1) as a percentage with no decimal places.
 * Examples: 0.123 → "12%", null → "—"
 */
export function formatPercent(n: number | null): string {
  if (n === null || !isFinite(n)) return "—";
  return `${Math.round(n * 100)}%`;
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

/**
 * Formats a date/ISO string as a human-readable relative time.
 * Uses "today", "yesterday", "N days ago", "N weeks ago", "N months ago".
 * Returns "—" for null/empty input.
 *
 * `referenceDate` defaults to now — inject for testing.
 */
export function formatRelativeDate(
  isoOrNull: string | null,
  referenceDate?: Date
): string {
  if (!isoOrNull) return "—";
  const now = referenceDate ?? new Date();
  const then = new Date(isoOrNull);
  if (isNaN(then.getTime())) return "—";

  // Use day-level comparison (strip time component for YYYY-MM-DD strings)
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thenDay = new Date(then.getFullYear(), then.getMonth(), then.getDate());
  const diffMs = nowDay.getTime() - thenDay.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 0) {
    // Future date
    const futureDays = Math.abs(diffDays);
    if (futureDays === 1) return "tomorrow";
    if (futureDays < 7) return `in ${futureDays} days`;
    if (futureDays < 14) return "in 1 week";
    if (futureDays < 60) return `in ${Math.floor(futureDays / 7)} weeks`;
    return `in ${Math.floor(futureDays / 30)} months`;
  }
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 60) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Formats a date as an absolute human-readable string.
 * Used for title attributes (hover tooltip).
 * Examples: "May 25, 2026", "Jan 3, 2025"
 * Returns "—" for null/empty input.
 */
export function formatAbsoluteDate(isoOrNull: string | null): string {
  if (!isoOrNull) return "—";
  const d = new Date(isoOrNull);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Computes the number of days elapsed since an ISO date string.
 * Returns null for null/invalid input.
 * Returns negative values for future dates.
 */
export function daysSince(isoOrNull: string | null, referenceDate?: Date): number | null {
  if (!isoOrNull) return null;
  const now = referenceDate ?? new Date();
  const then = new Date(isoOrNull);
  if (isNaN(then.getTime())) return null;
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thenDay = new Date(then.getFullYear(), then.getMonth(), then.getDate());
  return Math.round((nowDay.getTime() - thenDay.getTime()) / (1000 * 60 * 60 * 24));
}
