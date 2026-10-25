import React from "react";

interface QuestBadgeProps {
  completed: number;
  sideQuests: number;
}

export const QuestBadge: React.FC<QuestBadgeProps> = ({
  completed,
  sideQuests,
}) => {
  if (completed === 0 && sideQuests === 0) {
    return (
      <span className="text-sm text-ink-faint" aria-label="Belum ada">
        -
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      {completed > 0 && (
        <span className="inline-flex items-center gap-1 text-sm text-positive tabular-nums">
          <span aria-hidden="true">🎯</span> {completed}
          <span className="text-xs text-ink-muted">goals</span>
        </span>
      )}
      {sideQuests > 0 && (
        <span className="inline-flex items-center gap-1 text-sm text-info tabular-nums">
          <span aria-hidden="true">⚡</span> {sideQuests}
          <span className="text-xs text-ink-muted">quests</span>
        </span>
      )}
    </div>
  );
};
