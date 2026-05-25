/**
 * src/lib/admin/db.ts
 *
 * File-system JSON data layer for the admin panel.
 *
 * Two collections: leads (data/leads.json) and clients (data/clients.json).
 * Files are created lazily on first write.
 *
 * Atomicity: write to a temp file, then rename (atomic on POSIX; best-effort
 * on Windows — not a concern for Netlify/macOS).
 *
 * Node.js only — do NOT import this in middleware or client components.
 *
 * Netlify note: serverless function containers are ephemeral. Writes persist
 * only for the container's lifetime. For durable storage, swap this module
 * for a Netlify Blobs implementation — API routes are unaffected.
 */

import { readFile, writeFile, rename, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
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
// Paths
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');

// ---------------------------------------------------------------------------
// Low-level file I/O
// ---------------------------------------------------------------------------

async function ensureDataDir(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function readJson<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return defaultValue;
    }
    throw err;
  }
}

async function writeJson<T>(filePath: string, data: T): Promise<void> {
  await ensureDataDir();
  const tmpPath = `${filePath}.tmp.${Date.now()}`;
  try {
    await writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    await rename(tmpPath, filePath);
  } catch (err) {
    // Clean up temp file if rename fails
    try {
      const { unlink } = await import('fs/promises');
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
  let leads = await readJson<Lead[]>(LEADS_FILE, []);

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
  const leads = await readJson<Lead[]>(LEADS_FILE, []);
  return leads.find((l) => l.id === id) ?? null;
}

export async function createLead(input: CreateLeadBody): Promise<Lead> {
  const leads = await readJson<Lead[]>(LEADS_FILE, []);
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
    convertedClientId: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  leads.push(lead);
  await writeJson(LEADS_FILE, leads);
  return lead;
}

export async function updateLead(
  id: string,
  patch: UpdateLeadBody
): Promise<Lead | null> {
  const leads = await readJson<Lead[]>(LEADS_FILE, []);
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
  await writeJson(LEADS_FILE, leads);
  return updated;
}

export async function deleteLead(id: string): Promise<boolean> {
  const leads = await readJson<Lead[]>(LEADS_FILE, []);
  const before = leads.length;
  const filtered = leads.filter((l) => l.id !== id);
  if (filtered.length === before) return false;
  await writeJson(LEADS_FILE, filtered);
  return true;
}

export async function bulkImportLeads(
  incoming: Lead[],
  mode: 'replace' | 'append' = 'append'
): Promise<{ count: number; leads: Lead[] }> {
  const timestamp = now();

  // Normalize incoming leads — ensure required fields have defaults
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

  let result: Lead[];
  if (mode === 'replace') {
    result = normalized;
  } else {
    const existing = await readJson<Lead[]>(LEADS_FILE, []);
    // Append, deduplicating by id
    const existingIds = new Set(existing.map((l) => l.id));
    const newLeads = normalized.filter((l) => !existingIds.has(l.id));
    result = [...existing, ...newLeads];
  }

  await writeJson(LEADS_FILE, result);
  return { count: normalized.length, leads: result };
}

// ---------------------------------------------------------------------------
// CLIENTS
// ---------------------------------------------------------------------------

export async function listClients(): Promise<Client[]> {
  return readJson<Client[]>(CLIENTS_FILE, []);
}

export async function getClient(id: string): Promise<Client | null> {
  const clients = await readJson<Client[]>(CLIENTS_FILE, []);
  return clients.find((c) => c.id === id) ?? null;
}

export async function createClient(input: CreateClientBody): Promise<Client> {
  const clients = await readJson<Client[]>(CLIENTS_FILE, []);
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
  await writeJson(CLIENTS_FILE, clients);
  return client;
}

export async function updateClient(
  id: string,
  patch: UpdateClientBody
): Promise<Client | null> {
  const clients = await readJson<Client[]>(CLIENTS_FILE, []);
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
  await writeJson(CLIENTS_FILE, clients);
  return updated;
}

export async function deleteClient(id: string): Promise<boolean> {
  const clients = await readJson<Client[]>(CLIENTS_FILE, []);
  const before = clients.length;
  const filtered = clients.filter((c) => c.id !== id);
  if (filtered.length === before) return false;
  await writeJson(CLIENTS_FILE, filtered);
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
  const leads = await readJson<Lead[]>(LEADS_FILE, []);
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
  const clients = await readJson<Client[]>(CLIENTS_FILE, []);
  const updatedClients = [...clients, newClient];

  try {
    await writeJson(CLIENTS_FILE, updatedClients);
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
    await writeJson(LEADS_FILE, updatedLeads);
  } catch (err) {
    // Compensation: remove the client we just created
    console.error('[db] convertLeadToClient: failed to write leads file — compensating', err);
    try {
      const compensated = (await readJson<Client[]>(CLIENTS_FILE, [])).filter(
        (c) => c.id !== clientId
      );
      await writeJson(CLIENTS_FILE, compensated);
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
