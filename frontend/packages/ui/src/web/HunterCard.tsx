import React from "react";
import { Flame, Activity, Trophy } from "lucide-react";
import type { EnrichedReport } from "@lapor-bot/shared";

interface HunterCardProps {
  hunter: EnrichedReport;
  onClick: () => void;
}

export const HunterCard: React.FC<HunterCardProps> = ({ hunter, onClick }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    }}
    className="relative flex flex-col p-4 rounded-lg border border-border bg-panel shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-border-strong hover:-translate-y-0.5 focus-visible:outline-2"
  >
    <div className="flex justify-between items-center mb-2 min-h-5">
      <span className="text-xs text-ink-muted font-medium truncate">
        {hunter.rank_icon} {hunter.rank_name}
      </span>
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink tabular-nums">
        {hunter.seasonal_points}
        <span className="text-xs text-ink-muted font-normal">pts</span>
        {hunter.is_active_today && (
          <span
            className="inline-flex h-2 w-2 rounded-full bg-positive animate-pulse"
            title="Aktif hari ini"
          >
            <span className="sr-only">Aktif hari ini</span>
          </span>
        )}
      </span>
    </div>

    <h3 className="text-base font-semibold text-ink truncate">
      {hunter.name}
    </h3>
    <p className="text-xs text-ink-muted tabular-nums mt-0.5 mb-3">
      {hunter.user_id}
    </p>

    <div className="mb-4">
      <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft bg-page-sunken border border-border rounded-full px-2 py-0.5">
        {hunter.job_icon} {hunter.job_name}
      </span>
    </div>

    <div className="border-t border-border pt-3 flex justify-between items-center">
      <span className="inline-flex items-center gap-1 text-xs text-ink-soft tabular-nums">
        <Flame
          size={13}
          aria-hidden="true"
          className={hunter.streak > 0 ? "text-positive" : "text-ink-faint"}
        />
        {hunter.streak}w
      </span>
      <span className="inline-flex items-center gap-1 text-xs text-ink-soft tabular-nums">
        <Activity size={13} aria-hidden="true" />
        {hunter.seasonal_activity_count}d
      </span>
      <span className="inline-flex items-center gap-1 text-xs text-ink-soft tabular-nums">
        <Trophy size={13} aria-hidden="true" />
        {hunter.seasonal_points}p
      </span>
    </div>
  </div>
);
