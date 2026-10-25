import React from "react";
import { Flame } from "lucide-react";

interface StreakCellProps {
  weeks: number;
  label?: string;
}

export const StreakCell: React.FC<StreakCellProps> = ({
  weeks,
  label = "minggu",
}) => (
  <span className="inline-flex items-baseline justify-end gap-1">
    <Flame
      size={14}
      aria-hidden="true"
      className={weeks > 0 ? "text-positive" : "text-ink-faint"}
    />
    <span className="text-sm font-semibold text-ink tabular-nums">{weeks}</span>
    <span className="text-xs text-ink-muted">{label}</span>
  </span>
);
