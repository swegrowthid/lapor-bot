import React from "react";
import type { EnrichedReport } from "@lapor-bot/shared";

interface WeekDotsProps {
  hunter: EnrichedReport;
}

export const WeekDots: React.FC<WeekDotsProps> = ({ hunter }) => (
  <div
    className="flex justify-center gap-1"
    aria-label={`${hunter.week_active_days} dari 7 hari aktif minggu ini`}
  >
    {hunter.week_activity.map((active, idx) => (
      <span
        key={`${hunter.user_id}-week-${idx}`}
        className={`h-3 w-3 rounded-full border ${
          active ? "bg-positive border-positive" : "bg-page-sunken border-border"
        }`}
        title={active ? "Aktif" : "Belum aktif"}
      />
    ))}
  </div>
);
