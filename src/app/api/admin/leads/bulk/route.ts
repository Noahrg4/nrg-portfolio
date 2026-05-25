/**
 * POST /api/admin/leads/bulk
 *
 * Bulk import leads from an external source.
 *
 * Query param: ?mode=replace|append (default: append)
 *   - replace: replaces the entire leads dataset with the imported data
 *   - append: adds new leads (deduplicates by id)
 *
 * Request body: { leads: Lead[] }
 * Response: { count: number, leads: Lead[] }
 *
 * WARNING: ?mode=replace is destructive. No undo.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/auth';
import { bulkImportLeads } from '@/lib/admin/db';
import type { Lead } from '@/lib/admin/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session.ownerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const mode = req.nextUrl.searchParams.get('mode') === 'replace' ? 'replace' : 'append';

  let body: { leads?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!Array.isArray(body.leads)) {
    return NextResponse.json(
      { error: 'Request body must have a "leads" array.' },
      { status: 400 }
    );
  }

  // Basic validation — each item must have at least a businessName
  const invalid = (body.leads as unknown[]).filter(
    (l) => typeof l !== 'object' || l === null || typeof (l as Record<string, unknown>).businessName !== 'string'
  );
  if (invalid.length > 0) {
    return NextResponse.json(
      { error: `${invalid.length} items are missing required field "businessName".` },
      { status: 400 }
    );
  }

  const result = await bulkImportLeads(body.leads as Lead[], mode);

  return NextResponse.json(
    { count: result.count, leads: result.leads },
    { status: 200 }
  );
}
