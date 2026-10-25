import React from "react";
import type { EnrichedReport } from "@lapor-bot/shared";
import { RankBadge } from "../RankBadge";
import { HunterCell } from "../HunterCell";
import { JobCell } from "../JobCell";
import { StreakCell } from "../StreakCell";
import { WeekDots } from "../WeekDots";

interface WeekRowProps {
  hunter: EnrichedReport;
  rank: number;
  rowClass: string;
  onSelectHunter: (hunter: EnrichedReport) => void;
}

export const WeekRow: React.FC<WeekRowProps> = ({
  hunter,
  rank,
  rowClass,
  onSelectHunter,
}) => (
  <tr
    tabIndex={0}
    role="button"
    onClick={() => onSelectHunter(hunter)}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelectHunter(hunter);
      }
    }}
    className={rowClass}
  >
    <td className="py-3 px-4 align-middle">
      <div className="flex justify-center">
        <RankBadge rank={rank} />
      </div>
    </td>
    <HunterCell hunter={hunter} />
    <JobCell hunter={hunter} />
    <td className="py-3 px-4 align-middle text-right tabular-nums">
      <span className="text-sm font-semibold text-ink">
        {hunter.week_active_days}
      </span>
      <span className="text-xs text-ink-muted"> / 7 hari minggu ini</span>
    </td>
    <td className="py-3 px-4 align-middle">
      <div className="flex justify-center">
        <WeekDots hunter={hunter} />
      </div>
    </td>
    <td className="py-3 px-4 align-middle">
      <div className="flex justify-end">
        <StreakCell weeks={hunter.streak} />
      </div>
    </td>
    <td className="py-3 pl-4 pr-4 align-middle text-right tabular-nums">
      <span className="text-sm font-semibold text-ink">
        {hunter.estimated_weekly_points}
      </span>
      <span className="text-xs text-ink-muted"> pts (est.)</span>
    </td>
  </tr>
);
