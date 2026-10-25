import React from "react";
import type { EnrichedReport, StreakTab } from "@lapor-bot/shared";
import { currentDailyStreak, longestDailyStreak } from "@lapor-bot/shared";
import { RankBadge } from "../RankBadge";
import { HunterCell } from "../HunterCell";
import { JobCell } from "../JobCell";
import { getStreakStatus } from "@lapor-bot/shared";

interface StreakRowProps {
  hunter: EnrichedReport;
  rank: number;
  rowClass: string;
  streakTab: StreakTab;
  onSelectHunter: (hunter: EnrichedReport) => void;
}

function numCell(value: string | number, unit: string, strong = true) {
  return (
    <td className="py-3 px-4 align-middle text-right tabular-nums">
      <span
        className={`text-sm ${strong ? "font-semibold text-ink" : "text-ink-soft"}`}
      >
        {value}
      </span>
      <span className="text-xs text-ink-muted"> {unit}</span>
    </td>
  );
}

export const StreakRow: React.FC<StreakRowProps> = ({
  hunter,
  rank,
  rowClass,
  streakTab,
  onSelectHunter,
}) => {
  const daily = streakTab === "daily";
  const current = daily ? currentDailyStreak(hunter) : hunter.streak;
  const best = daily ? longestDailyStreak(hunter) : hunter.max_streak;
  const unit = daily ? "hari" : "minggu";

  return (
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
      {numCell(current, `${unit} streak`)}
      {numCell(best, `terbaik`, false)}
      {numCell(hunter.total_active_days, "hari", false)}
      {numCell(hunter.comeback_streak, "comeback", false)}
      <td className="py-3 px-4 align-middle text-right tabular-nums">
        {hunter.centurion_cycles > 0 ? (
          <span className="text-sm font-semibold text-ink">
            {hunter.centurion_cycles}x{" "}
            <span className="text-xs text-ink-muted font-normal">centurion</span>
          </span>
        ) : (
          <span className="text-sm text-ink-faint">-</span>
        )}
      </td>
      <td className="py-3 px-4 align-middle text-right">
        <span className="text-xs text-ink-muted">{getStreakStatus(hunter)}</span>
      </td>
    </tr>
  );
};
