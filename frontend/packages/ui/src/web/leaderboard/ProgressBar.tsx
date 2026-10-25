import React from "react";
import type { TierProgress } from "@lapor-bot/shared";

type Tone = "gold" | "blue" | "red" | "green";

interface ProgressBarProps {
  progress: TierProgress;
  valueLabel: string;
  tone?: Tone;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  valueLabel,
}) => (
  <div className="min-w-[190px]">
    <div className="h-2 w-full rounded-full bg-page-sunken overflow-hidden">
      <div
        className="h-full rounded-full bg-accent transition-all duration-300"
        style={{ width: `${progress.percent}%` }}
      />
    </div>
    <div className="mt-1 flex justify-between text-xs text-ink-muted tabular-nums">
      <span>{valueLabel}</span>
      {progress.is_max ? (
        <span className="font-medium text-positive">Maksimal</span>
      ) : (
        <span className="tabular-nums">
          {progress.next_icon} {progress.next_name} ({progress.remaining} pts
          lagi)
        </span>
      )}
    </div>
  </div>
);
