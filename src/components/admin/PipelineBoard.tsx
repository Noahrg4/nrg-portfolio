"use client";

/**
 * src/components/admin/PipelineBoard.tsx
 *
 * Compact kanban-style stage column view for the LEADS tab.
 * Shows lead counts per stage as horizontally scrollable columns.
 * Primarily used as a status summary; not a drag-and-drop board.
 * Can be embedded anywhere — receives leads as prop.
 */

import type { Lead, PipelineStage } from "@/lib/admin/types";
import { PIPELINE_STAGES } from "@/lib/admin/types";
import StageChip from "./StageChip";
import ScoreBadge from "./ScoreBadge";

interface PipelineBoardProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

export default function PipelineBoard({ leads, onLeadClick }: PipelineBoardProps) {
  const byStage = PIPELINE_STAGES.reduce<Record<PipelineStage, Lead[]>>(
    (acc, stage) => {
      acc[stage] = leads.filter((l) => l.stage === stage);
      return acc;
    },
    {} as Record<PipelineStage, Lead[]>
  );

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {PIPELINE_STAGES.map((stage) => {
        const stageLeads = byStage[stage];
        return (
          <div
            key={stage}
            className="flex min-w-[180px] flex-col gap-2"
          >
            {/* Column header */}
            <div className="flex items-center justify-between gap-2">
              <StageChip stage={stage} size="sm" />
              <span className="font-mono text-[10px] text-ink-subtle">
                {stageLeads.length}
              </span>
            </div>

            {/* Lead cards */}
            <div className="flex flex-col gap-1.5">
              {stageLeads.length === 0 ? (
                <div className="h-10 rounded-lg border border-dashed border-hairline" />
              ) : (
                stageLeads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => onLeadClick(lead)}
                    className="group w-full rounded-lg border border-hairline bg-surface-2 px-3 py-2 text-left transition-colors hover:border-hairline-strong hover:bg-surface-1"
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="font-sans text-xs font-medium text-ink-secondary group-hover:text-ink line-clamp-2">
                        {lead.businessName}
                      </span>
                      <ScoreBadge score={lead.score} size="sm" />
                    </div>
                    {lead.niche && (
                      <p className="mt-0.5 font-mono text-[9px] text-ink-subtle truncate">
                        {lead.niche}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
