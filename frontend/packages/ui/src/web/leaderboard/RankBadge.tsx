import React from "react";
import { Trophy } from "lucide-react";

interface RankBadgeProps {
  rank: number;
}

/** Top 3 get a calm medal pill (gold/silver/bronze); the ordinal itself plus
    the icon carries the rank, so color alone never conveys it. */
export const RankBadge: React.FC<RankBadgeProps> = ({ rank }) => {
  if (rank < 3) {
    const Medal = rank === 0 ? Trophy : null;
    const tone =
      rank === 0
        ? "bg-gold-soft text-gold"
        : rank === 1
          ? "bg-silver-soft text-silver"
          : "bg-bronze-soft text-bronze";
    return (
      <span
        title={`Peringkat ${rank + 1}`}
        className={`inline-flex items-center justify-center gap-1 h-7 w-7 rounded-full border border-border text-xs font-semibold tabular-nums animate-pop ${tone}`}
      >
        {Medal && <Medal size={13} strokeWidth={2.5} aria-hidden="true" />}
        <span aria-hidden="true">{rank + 1}</span>
        <span className="sr-only">Peringkat {rank + 1}</span>
      </span>
    );
  }
  return (
    <span className="text-sm text-ink-soft tabular-nums">{rank + 1}</span>
  );
};
