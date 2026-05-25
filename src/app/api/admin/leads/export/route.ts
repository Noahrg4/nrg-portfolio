/**
 * GET /api/admin/leads/export
 *
 * Downloads the full leads dataset.
 *
 * Query param: ?format=json|csv (default: json)
 *
 * JSON response: application/json attachment
 * CSV response:  text/csv attachment
 *
 * This is the backup mechanism for the file-system data store.
 * The owner bookmarks this URL and downloads periodically.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/auth';
import { listLeads } from '@/lib/admin/db';
import type { Lead } from '@/lib/admin/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session.ownerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const format = req.nextUrl.searchParams.get('format') ?? 'json';
  const leads = await listLeads();

  if (format === 'csv') {
    return new NextResponse(buildCsv(leads), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leads-${datestamp()}.csv"`,
      },
    });
  }

  // Default: JSON
  return new NextResponse(JSON.stringify(leads, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="leads-${datestamp()}.json"`,
    },
  });
}

// ---------------------------------------------------------------------------
// CSV builder
// ---------------------------------------------------------------------------

const CSV_COLUMNS: (keyof Lead)[] = [
  'id',
  'businessName',
  'niche',
  'neighborhood',
  'contactName',
  'phone',
  'email',
  'stage',
  'score',
  'touchCount',
  'emailedAt',
  'calledAt',
  'followUpAt',
  'source',
  'nextActionNote',
  'notes',
  'convertedClientId',
  'createdAt',
  'updatedAt',
];

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  // Escape: wrap in quotes if contains comma, newline, or quote
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(leads: Lead[]): string {
  const header = CSV_COLUMNS.join(',');
  const rows = leads.map((l) =>
    CSV_COLUMNS.map((col) => csvCell(l[col])).join(',')
  );
  return [header, ...rows].join('\n');
}

function datestamp(): string {
  return new Date().toISOString().slice(0, 10);
}
