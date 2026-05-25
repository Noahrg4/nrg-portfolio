/**
 * GET /api/admin/export
 *
 * Full data backup — returns leads.json + clients.json combined.
 * This is the owner's backup mechanism for the file-system data store.
 *
 * Response: { leads: Lead[], clients: Client[], exportedAt: ISO }
 * as a JSON attachment for download.
 *
 * Bookmark this URL and download periodically as your backup strategy.
 */

import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/auth';
import { listLeads, listClients } from '@/lib/admin/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session.ownerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [leads, clients] = await Promise.all([listLeads(), listClients()]);

  const payload = {
    leads,
    clients,
    exportedAt: new Date().toISOString(),
  };

  const datestamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="nrg-admin-export-${datestamp}.json"`,
    },
  });
}
