/**
 * GET  /api/admin/leads       — list leads (with optional filters)
 * POST /api/admin/leads       — create a lead
 *
 * Query params for GET:
 *   ?stage=Found|Researched|...  filter by stage
 *   ?due=true                    only leads with followUpAt <= today
 *   ?search=...                  fuzzy match on name/email/niche/neighborhood
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/auth';
import { listLeads, createLead } from '@/lib/admin/db';
import type { CreateLeadBody } from '@/lib/admin/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// GET /api/admin/leads
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session.ownerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const stage = searchParams.get('stage') ?? undefined;
  const due = searchParams.get('due') === 'true';
  const search = searchParams.get('search') ?? undefined;

  const leads = await listLeads({ stage, due: due || undefined, search });
  return NextResponse.json(leads, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

// ---------------------------------------------------------------------------
// POST /api/admin/leads
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session.ownerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Partial<CreateLeadBody>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // Required field validation
  if (!body.businessName?.trim()) {
    return NextResponse.json({ error: 'businessName is required.' }, { status: 400 });
  }

  const input: CreateLeadBody = {
    businessName: body.businessName.trim(),
    niche: body.niche?.trim() ?? '',
    neighborhood: body.neighborhood?.trim() ?? '',
    phone: body.phone?.trim() ?? '',
    email: body.email?.trim() ?? '',
    contactName: body.contactName?.trim() ?? '',
    notes: body.notes ?? '',
    source: body.source ?? '',
    stage: body.stage ?? 'Found',
    scoreFactors: body.scoreFactors ?? {
      webOpportunity: 0,
      provenMoney: 0,
      reachableDecisionMaker: 0,
    },
    emailedAt: body.emailedAt ?? null,
    calledAt: body.calledAt ?? null,
    followUpAt: body.followUpAt ?? null,
    nextActionNote: body.nextActionNote ?? '',
    owner: body.owner ?? null,
  };

  const lead = await createLead(input);
  return NextResponse.json(lead, { status: 201 });
}
