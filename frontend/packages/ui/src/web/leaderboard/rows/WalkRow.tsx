import React from "react";
import type { EnrichedReport } from "@lapor-bot/shared";
import { RankBadge } from "../RankBadge";
import { HunterCell } from "../HunterCell";
import { JobCell } from "../JobCell";

interface WalkRowProps {
  hunter: EnrichedReport;
  rank: number;
  rowClass: string;
  onSelectHunter: (hunter: EnrichedReport) => void;
}

function formatStepsID(steps: number): string {
  return new Intl.NumberFormat("id-ID").format(steps);
}

export const WalkRow: React.FC<WalkRowProps> = ({
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
        {formatStepsID(hunter.week_walk_steps ?? 0)}
      </span>
      <span className="text-xs text-ink-muted"> langkah</span>
    </td>
    <td className="py-3 px-4 align-middle text-right tabular-nums">
      <span className="text-sm text-ink-soft">
        {formatStepsID(hunter.seasonal_walk_steps ?? 0)}
      </span>
      <span className="text-xs text-ink-muted"> langkah</span>
    </td>
    <td className="py-3 pl-4 pr-4 align-middle text-right tabular-nums">
      <span className="text-sm font-semibold text-ink">
        {formatStepsID(hunter.walk_steps_total ?? 0)}
      </span>
      <span className="text-xs text-ink-muted"> langkah</span>
    </td>
  </tr>
);
