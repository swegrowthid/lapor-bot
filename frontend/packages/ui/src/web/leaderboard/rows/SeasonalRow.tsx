import React from "react";
import type { EnrichedReport } from "@lapor-bot/shared";
import { RankBadge } from "../RankBadge";
import { HunterCell } from "../HunterCell";
import { JobCell } from "../JobCell";
import { StreakCell } from "../StreakCell";
import { ActiveTodayBadge } from "../ActiveTodayBadge";
import { ProgressBar } from "../ProgressBar";
import { Snowflake } from "lucide-react";

interface SeasonalRowProps {
  hunter: EnrichedReport;
  rank: number;
  rowClass: string;
  onSelectHunter: (hunter: EnrichedReport) => void;
}

export const SeasonalRow: React.FC<SeasonalRowProps> = ({
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
    <td className="py-3 pl-4 pr-3 align-middle text-right">
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-sm font-semibold text-ink">
          {hunter.rank_icon} {hunter.rank_name}
        </span>
        {hunter.is_active_today && <ActiveTodayBadge />}
      </div>
    </td>
    <td className="py-3 px-4 align-middle text-right">
      <StreakCell weeks={hunter.streak} />
    </td>
    <td className="py-3 px-4 align-middle text-right tabular-nums">
      <span className="text-sm font-semibold text-ink">
        {hunter.seasonal_activity_count}
      </span>
      <span className="text-xs text-ink-muted"> hari</span>
    </td>
    <td className="py-3 px-4 align-middle text-right tabular-nums">
      <span className="text-sm text-ink-soft">{hunter.seasonal_max_streak}</span>
      <span className="text-xs text-ink-muted"> terbaik</span>
    </td>
    <td className="py-3 px-4 align-middle text-right">
      {hunter.streak_freezes > 0 ? (
        <span
          className="inline-flex items-center justify-end gap-1 text-sm text-info tabular-nums"
          title={`${hunter.streak_freezes} streak freeze tersisa`}
        >
          <Snowflake size={12} aria-hidden="true" />
          {hunter.streak_freezes}
        </span>
      ) : (
        <span className="text-sm text-ink-faint">-</span>
      )}
    </td>
    <td className="py-3 pl-4 pr-4 align-middle">
      <div className="flex justify-end">
        <ProgressBar
          progress={hunter.season_rank_progress}
          valueLabel={`${hunter.seasonal_points} season pts`}
        />
      </div>
    </td>
  </tr>
);
