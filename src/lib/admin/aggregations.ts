/**
 * src/lib/admin/aggregations.ts
 *
 * Pure analytics aggregation functions.
 * Input: raw arrays of Lead + Client records.
 * Output: AnalyticsPayload (typed in types.ts).
 *
 * No I/O — this module is deterministic and unit-testable.
 * Node.js-only (imported only from API routes).
 */

import {
  type Lead,
  type Client,
  type AnalyticsPayload,
  PIPELINE_STAGES,
  ACTIVE_STAGES,
  STAGE_CLOSE_PROBABILITY,
  AVG_PROJECT_VALUE,
  SCORE_TIERS,
  todayIso,
  type PipelineStage,
} from '@/lib/admin/types';

export function computeAnalytics(
  leads: Lead[],
  clients: Client[]
): AnalyticsPayload {
  const today = todayIso();

  // ---------------------------------------------------------------------------
  // Revenue
  // ---------------------------------------------------------------------------

  const activeClients = clients.filter((c) => c.status === 'active');
  const pausedClients = clients.filter((c) => c.status === 'paused');
  const churnedClients = clients.filter((c) => c.status === 'churned');

  const totalMrr = activeClients.reduce((sum, c) => sum + (c.monthlyCharge ?? 0), 0);
  const totalOneTimeRevenue = clients.reduce((sum, c) => sum + (c.oneTimeValue ?? 0), 0);
  const avgOneTimeValue =
    clients.length > 0 ? totalOneTimeRevenue / clients.length : 0;

  // ---------------------------------------------------------------------------
  // Pipeline
  // ---------------------------------------------------------------------------

  // Count leads per stage — every stage key present (0 if none)
  const leadsByStage = PIPELINE_STAGES.reduce(
    (acc, stage) => {
      acc[stage] = leads.filter((l) => l.stage === stage).length;
      return acc;
    },
    {} as Record<PipelineStage, number>
  );

  const totalLeads = leads.length;
  const totalWon = leadsByStage['Won'];
  const totalLost = leadsByStage['Lost'];
  const winRate =
    totalWon + totalLost > 0 ? totalWon / (totalWon + totalLost) : 0;

  // Weighted pipeline value:
  // For each active-stage lead: AVG_PROJECT_VALUE * STAGE_CLOSE_PROBABILITY[stage]
  const activePipelineValue = leads
    .filter((l) => ACTIVE_STAGES.includes(l.stage))
    .reduce((sum, l) => {
      const prob = STAGE_CLOSE_PROBABILITY[l.stage] ?? 0;
      return sum + AVG_PROJECT_VALUE * prob;
    }, 0);

  // ---------------------------------------------------------------------------
  // Outreach
  // ---------------------------------------------------------------------------

  const totalTouches = leads.reduce((sum, l) => sum + (l.touchCount ?? 0), 0);
  const leadsEmailed = leads.filter((l) => l.emailedAt !== null).length;

  // Response rate: leads that progressed to Called, Follow-up, Proposal, or Won
  const RESPONDED_STAGES: PipelineStage[] = ['Called', 'Follow-up', 'Proposal', 'Won'];
  const responded = leads.filter((l) => RESPONDED_STAGES.includes(l.stage)).length;
  const emailResponseRate = leadsEmailed > 0 ? responded / leadsEmailed : null;

  // ---------------------------------------------------------------------------
  // Follow-up urgency
  // ---------------------------------------------------------------------------

  const openLeads = leads.filter((l) => l.stage !== 'Won' && l.stage !== 'Lost');

  const overdueFollowUps = openLeads.filter(
    (l) => l.followUpAt !== null && l.followUpAt < today
  ).length;

  const followUpsToday = openLeads.filter(
    (l) => l.followUpAt !== null && l.followUpAt === today
  ).length;

  // ---------------------------------------------------------------------------
  // Score distribution
  // ---------------------------------------------------------------------------

  const hotLeads = leads.filter((l) => l.score >= SCORE_TIERS.hot).length;
  const warmLeads = leads.filter(
    (l) => l.score >= SCORE_TIERS.warm && l.score < SCORE_TIERS.hot
  ).length;
  const coldLeads = leads.filter((l) => l.score < SCORE_TIERS.warm).length;

  // ---------------------------------------------------------------------------
  // Assemble payload
  // ---------------------------------------------------------------------------

  return {
    totalMrr,
    totalOneTimeRevenue,
    avgOneTimeValue,
    activePipelineValue,
    leadsByStage,
    totalLeads,
    totalWon,
    totalLost,
    winRate,
    totalTouches,
    leadsEmailed,
    emailResponseRate,
    activeClients: activeClients.length,
    pausedClients: pausedClients.length,
    churnedClients: churnedClients.length,
    overdueFollowUps,
    followUpsToday,
    hotLeads,
    warmLeads,
    coldLeads,
  };
}
