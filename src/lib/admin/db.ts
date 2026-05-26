/**
 * src/lib/admin/db.ts
 *
 * JSON data layer for the admin panel. Two collections: leads + clients.
 *
 * Backend selection:
 *   - On Netlify (process.env.NETLIFY === 'true'): Netlify Blobs (durable
 *     key-value, persists across cold starts and deploys).
 *   - Locally (npm run dev): file-system JSON in ./data/ (atomic temp-write +
 *     rename). Easier to inspect during development.
 *
 * The Blobs path is required in production — Netlify Function runtimes have
 * a read-only filesystem outside /tmp, so FS writes fail with EROFS.
 *
 * Node.js only — do NOT import this in middleware or client components.
 */

import { readFile, writeFile, rename, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getStore } from '@netlify/blobs';
import {
  type Lead,
  type Client,
  type CreateLeadBody,
  type UpdateLeadBody,
  type CreateClientBody,
  type UpdateClientBody,
  computeScore,
  PIPELINE_STAGES,
  TERMINAL_STAGES,
} from '@/lib/admin/types';

// ---------------------------------------------------------------------------
// Storage backend
// ---------------------------------------------------------------------------

// Netlify Functions run on AWS Lambda, which always sets LAMBDA_TASK_ROOT
// (typically '/var/task'). Detecting this is more reliable than checking
// `NETLIFY === 'true'` — that's set at build time but not always exposed to
// the runtime. NETLIFY_BLOBS_CONTEXT is also a strong signal: it's injected
// by @netlify/blobs auto-detection inside Functions.
const USE_BLOBS =
  process.env.NETLIFY === 'true' ||
  !!process.env.LAMBDA_TASK_ROOT ||
  !!process.env.NETLIFY_BLOBS_CONTEXT;
const STORE_NAME = 'nrg-admin';

type CollectionKey = 'leads' | 'clients';

const DATA_DIR = path.join(process.cwd(), 'data');
const FS_PATHS: Record<CollectionKey, string> = {
  leads: path.join(DATA_DIR, 'leads.json'),
  clients: path.join(DATA_DIR, 'clients.json'),
};

async function readJson<T>(key: CollectionKey, defaultValue: T): Promise<T> {
  if (USE_BLOBS) {
    const store = getStore({ name: STORE_NAME });
    const v = (await store.get(key, { type: 'json' })) as T | null;
    return v ?? defaultValue;
  }

  // FS fallback (local dev)
  try {
    const raw = await readFile(FS_PATHS[key], 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return defaultValue;
    }
    throw err;
  }
}

async function writeJson<T>(key: CollectionKey, data: T): Promise<void> {
  if (USE_BLOBS) {
    const store = getStore({ name: STORE_NAME });
    await store.setJSON(key, data);
    return;
  }

  // FS fallback (local dev) — atomic temp-write + rename
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  const filePath = FS_PATHS[key];
  const tmpPath = `${filePath}.tmp.${Date.now()}`;
  try {
    await writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    await rename(tmpPath, filePath);
  } catch (err) {
    try {
      await unlink(tmpPath);
    } catch {
      // best effort
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Timestamps
// ---------------------------------------------------------------------------

function now(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// LEADS
// ---------------------------------------------------------------------------

export async function listLeads(opts?: {
  stage?: string;
  due?: boolean;
  search?: string;
}): Promise<Lead[]> {
  let leads = await readJson<Lead[]>('leads', []);

  if (opts?.stage) {
    const stageFilter = opts.stage;
    // Validate it's a known stage
    if (PIPELINE_STAGES.includes(stageFilter as Lead['stage'])) {
      leads = leads.filter((l) => l.stage === stageFilter);
    }
  }

  if (opts?.due) {
    const today = todayIsoLocal();
    leads = leads.filter(
      (l) =>
        l.followUpAt !== null &&
        l.followUpAt <= today &&
        !TERMINAL_STAGES.includes(l.stage)
    );
  }

  if (opts?.search) {
    const q = opts.search.toLowerCase();
    leads = leads.filter(
      (l) =>
        l.businessName.toLowerCase().includes(q) ||
        l.contactName.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.niche.toLowerCase().includes(q) ||
        l.neighborhood.toLowerCase().includes(q)
    );
  }

  return leads;
}

export async function getLead(id: string): Promise<Lead | null> {
  const leads = await readJson<Lead[]>('leads', []);
  return leads.find((l) => l.id === id) ?? null;
}

export async function createLead(input: CreateLeadBody): Promise<Lead> {
  const leads = await readJson<Lead[]>('leads', []);
  const timestamp = now();

  const lead: Lead = {
    id: crypto.randomUUID(),
    businessName: input.businessName,
    niche: input.niche,
    neighborhood: input.neighborhood,
    phone: input.phone,
    email: input.email,
    contactName: input.contactName,
    notes: input.notes ?? '',
    source: input.source ?? '',
    stage: input.stage ?? 'Found',
    stageHistory: [{ stage: input.stage ?? 'Found', at: timestamp }],
    scoreFactors: input.scoreFactors ?? {
      badOrNoWebsite: false,
      clearlyMakingMoney: false,
      easyToReach: false,
      goodNicheFit: false,
    },
    score: computeScore(
      input.scoreFactors ?? {
        badOrNoWebsite: false,
        clearlyMakingMoney: false,
        easyToReach: false,
        goodNicheFit: false,
      }
    ),
    touchCount: 0,
    emailedAt: input.emailedAt ?? null,
    calledAt: input.calledAt ?? null,
    followUpAt: input.followUpAt ?? null,
    nextActionNote: input.nextActionNote ?? '',
    existingSiteStatus: input.existingSiteStatus ?? 'unknown',
    convertedClientId: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  leads.push(lead);
  await writeJson('leads', leads);
  return lead;
}

export async function updateLead(
  id: string,
  patch: UpdateLeadBody
): Promise<Lead | null> {
  const leads = await readJson<Lead[]>('leads', []);
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) return null;

  const existing = leads[idx];
  const timestamp = now();

  // Detect stage change — append to history
  const stageChanged =
    patch.stage !== undefined && patch.stage !== existing.stage;

  // Detect score factor change — recompute score
  const newFactors = patch.scoreFactors
    ? { ...existing.scoreFactors, ...patch.scoreFactors }
    : existing.scoreFactors;

  const updated: Lead = {
    ...existing,
    ...patch,
    scoreFactors: newFactors,
    score: computeScore(newFactors),
    stageHistory: stageChanged
      ? [
          ...existing.stageHistory,
          { stage: patch.stage!, at: timestamp },
        ]
      : existing.stageHistory,
    updatedAt: timestamp,
    // Never allow overwriting id, createdAt, stageHistory via patch directly
    id: existing.id,
    createdAt: existing.createdAt,
  };

  leads[idx] = updated;
  await writeJson('leads', leads);
  return updated;
}

export async function deleteLead(id: string): Promise<boolean> {
  const leads = await readJson<Lead[]>('leads', []);
  const before = leads.length;
  const filtered = leads.filter((l) => l.id !== id);
  if (filtered.length === before) return false;
  await writeJson('leads', filtered);
  return true;
}

/**
 * Normalized dedup key for a lead: lowercased trimmed businessName + digits-
 * only phone. Two leads with the same key are treated as the same lead.
 *
 *   "El Rey Restaurant" + "(713) 555-1234"  →  "el rey restaurant|7135551234"
 *   "El Rey Restaurant" + "713-555-1234"    →  "el rey restaurant|7135551234"
 *   "El Rey Restaurant" + ""                →  "el rey restaurant|"
 *
 * Trade-off: two genuinely different businesses with the same name AND no
 * phone collide. Acceptable for a solo operator's CRM; rare in practice.
 */
export function leadDedupKey(l: { businessName: string; phone: string }): string {
  const name = (l.businessName || '').trim().toLowerCase();
  const digits = (l.phone || '').replace(/\D/g, '');
  return `${name}|${digits}`;
}

export async function bulkImportLeads(
  incoming: Lead[],
  mode: 'replace' | 'append' = 'append'
): Promise<{ added: number; skipped: number; leads: Lead[] }> {
  const timestamp = now();

  // 1. Normalize incoming leads — fill in defaults the API caller may have omitted
  const normalized: Lead[] = incoming.map((l) => ({
    ...l,
    id: l.id ?? crypto.randomUUID(),
    score: computeScore(
      l.scoreFactors ?? {
        badOrNoWebsite: false,
        clearlyMakingMoney: false,
        easyToReach: false,
        goodNicheFit: false,
      }
    ),
    stageHistory: l.stageHistory ?? [{ stage: l.stage ?? 'Found', at: timestamp }],
    touchCount: l.touchCount ?? 0,
    convertedClientId: l.convertedClientId ?? null,
    createdAt: l.createdAt ?? timestamp,
    updatedAt: l.updatedAt ?? timestamp,
  }));

  // 2. Dedup within the batch (keep first occurrence)
  const seenKeys = new Set<string>();
  const seenIds = new Set<string>();
  const withinBatch: Lead[] = [];
  let skippedWithinBatch = 0;
  for (const lead of normalized) {
    const key = leadDedupKey(lead);
    if (seenKeys.has(key) || seenIds.has(lead.id)) {
      skippedWithinBatch++;
      continue;
    }
    seenKeys.add(key);
    seenIds.add(lead.id);
    withinBatch.push(lead);
  }

  // 3. Apply dedup against existing DB (append mode only)
  let result: Lead[];
  let skippedAgainstExisting = 0;
  if (mode === 'replace') {
    result = withinBatch;
  } else {
    const existing = await readJson<Lead[]>('leads', []);
    const existingIds = new Set(existing.map((l) => l.id));
    const existingKeys = new Set(existing.map(leadDedupKey));
    const toAdd: Lead[] = [];
    for (const lead of withinBatch) {
      if (existingIds.has(lead.id) || existingKeys.has(leadDedupKey(lead))) {
        skippedAgainstExisting++;
        continue;
      }
      toAdd.push(lead);
    }
    result = [...existing, ...toAdd];
  }

  await writeJson('leads', result);

  const added = mode === 'replace' ? withinBatch.length : withinBatch.length - skippedAgainstExisting;
  return {
    added,
    skipped: skippedWithinBatch + skippedAgainstExisting,
    leads: result,
  };
}

// ---------------------------------------------------------------------------
// CLIENTS
// ---------------------------------------------------------------------------

export async function listClients(): Promise<Client[]> {
  return readJson<Client[]>('clients', []);
}

export async function getClient(id: string): Promise<Client | null> {
  const clients = await readJson<Client[]>('clients', []);
  return clients.find((c) => c.id === id) ?? null;
}

export async function createClient(input: CreateClientBody): Promise<Client> {
  const clients = await readJson<Client[]>('clients', []);
  const timestamp = now();

  const client: Client = {
    id: crypto.randomUUID(),
    businessName: input.businessName,
    contactName: input.contactName,
    phone: input.phone,
    email: input.email,
    siteUrl: input.siteUrl ?? '',
    monthlyCharge: input.monthlyCharge ?? 0,
    oneTimeValue: input.oneTimeValue ?? 0,
    startDate: input.startDate ?? timestamp.slice(0, 10),
    status: input.status ?? 'active',
    lastInvoicedAt: input.lastInvoicedAt ?? null,
    lastVerifiedAt: input.lastVerifiedAt ?? null,
    notes: input.notes ?? '',
    sourceLeadId: input.sourceLeadId ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  clients.push(client);
  await writeJson('clients', clients);
  return client;
}

export async function updateClient(
  id: string,
  patch: UpdateClientBody
): Promise<Client | null> {
  const clients = await readJson<Client[]>('clients', []);
  const idx = clients.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  const existing = clients[idx];
  const updated: Client = {
    ...existing,
    ...patch,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: now(),
  };

  clients[idx] = updated;
  await writeJson('clients', clients);
  return updated;
}

export async function deleteClient(id: string): Promise<boolean> {
  const clients = await readJson<Client[]>('clients', []);
  const before = clients.length;
  const filtered = clients.filter((c) => c.id !== id);
  if (filtered.length === before) return false;
  await writeJson('clients', filtered);
  return true;
}

// ---------------------------------------------------------------------------
// Convert lead to client (atomic with compensation)
// ---------------------------------------------------------------------------

export async function convertLeadToClient(
  leadId: string,
  body: {
    monthlyCharge: number;
    oneTimeValue: number;
    siteUrl: string;
    startDate: string;
  }
): Promise<{ lead: Lead; client: Client } | { error: string; status: number }> {
  const leads = await readJson<Lead[]>('leads', []);
  const leadIdx = leads.findIndex((l) => l.id === leadId);

  if (leadIdx === -1) {
    return { error: 'Lead not found', status: 404 };
  }

  const lead = leads[leadIdx];

  if (lead.stage === 'Won' || lead.stage === 'Lost') {
    return { error: 'Lead is already in a terminal stage', status: 409 };
  }

  const timestamp = now();
  const clientId = crypto.randomUUID();

  const newClient: Client = {
    id: clientId,
    businessName: lead.businessName,
    contactName: lead.contactName,
    phone: lead.phone,
    email: lead.email,
    siteUrl: body.siteUrl,
    monthlyCharge: body.monthlyCharge,
    oneTimeValue: body.oneTimeValue,
    startDate: body.startDate,
    status: 'active',
    lastInvoicedAt: null,
    lastVerifiedAt: null,
    notes: lead.notes ? `Converted from lead — ${lead.notes}` : 'Converted from lead',
    sourceLeadId: lead.id,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  // Write client first
  const clients = await readJson<Client[]>('clients', []);
  const updatedClients = [...clients, newClient];

  try {
    await writeJson('clients', updatedClients);
  } catch (err) {
    console.error('[db] convertLeadToClient: failed to write clients file', err);
    return { error: 'Failed to create client record', status: 500 };
  }

  // Write lead second (mark as Won)
  const updatedLead: Lead = {
    ...lead,
    stage: 'Won',
    stageHistory: [...lead.stageHistory, { stage: 'Won', at: timestamp }],
    convertedClientId: clientId,
    updatedAt: timestamp,
  };
  const updatedLeads = leads.map((l) => (l.id === leadId ? updatedLead : l));

  try {
    await writeJson('leads', updatedLeads);
  } catch (err) {
    // Compensation: remove the client we just created
    console.error('[db] convertLeadToClient: failed to write leads file — compensating', err);
    try {
      const compensated = (await readJson<Client[]>('clients', [])).filter(
        (c) => c.id !== clientId
      );
      await writeJson('clients', compensated);
      console.info('[db] convertLeadToClient: compensation succeeded');
    } catch (compErr) {
      console.error('[db] convertLeadToClient: compensation FAILED', compErr);
    }
    return { error: 'Failed to update lead record', status: 500 };
  }

  return { lead: updatedLead, client: newClient };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayIsoLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
