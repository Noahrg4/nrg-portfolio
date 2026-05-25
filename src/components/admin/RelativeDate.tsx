"use client";

/**
 * src/components/admin/RelativeDate.tsx
 *
 * Renders a relative time string ("3 days ago", "today", etc.) as a <time>
 * element. The absolute date is shown on hover via the `title` attribute.
 *
 * Usage:
 *   <RelativeDate iso={lead.emailedAt} className="text-ink-subtle" />
 *
 * Returns a visually quiet "—" for null/empty values.
 */

import { formatRelativeDate, formatAbsoluteDate } from "@/lib/admin/format";

interface RelativeDateProps {
  iso: string | null;
  className?: string;
  /** Override text for null values. Default: "—" */
  emptyText?: string;
}

export default function RelativeDate({
  iso,
  className,
  emptyText = "—",
}: RelativeDateProps) {
  if (!iso) {
    return <span className={className}>{emptyText}</span>;
  }

  const relative = formatRelativeDate(iso);
  const absolute = formatAbsoluteDate(iso);

  return (
    <time
      dateTime={iso}
      title={absolute}
      className={className}
    >
      {relative}
    </time>
  );
}
