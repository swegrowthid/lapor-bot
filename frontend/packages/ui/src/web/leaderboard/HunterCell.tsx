import React from "react";
import type { EnrichedReport } from "@lapor-bot/shared";

interface HunterCellProps {
  hunter: EnrichedReport;
  isActiveToday?: boolean;
}

export const HunterCell: React.FC<HunterCellProps> = ({
  hunter,
  isActiveToday,
}) => (
  <td className="py-3 pl-4 align-middle">
    <div className="flex items-center gap-3">
      <div className="relative shrink-0">
        <div className="w-9 h-9 rounded-full bg-page-sunken border border-border flex items-center justify-center text-sm font-semibold text-ink-soft">
          {hunter.name.charAt(0).toUpperCase()}
        </div>
        {isActiveToday && (
          <span
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-positive border-2 border-panel"
            title="Aktif hari ini"
          />
        )}
      </div>
      <div className="min-w-0">
        <div className="text-sm text-ink font-medium truncate group-hover:text-accent transition-colors">
          {hunter.name}
        </div>
        <div className="text-xs text-ink-muted tabular-nums">
          {hunter.user_id}
        </div>
      </div>
    </div>
  </td>
);
