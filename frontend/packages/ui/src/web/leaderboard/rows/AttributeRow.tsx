import React from "react";
import type { EnrichedReport, AttributeTab } from "@lapor-bot/shared";
import { getAttributeAverage, getAttributeValue } from "@lapor-bot/shared";
import { RankBadge } from "../RankBadge";
import { HunterCell } from "../HunterCell";
import { JobCell } from "../JobCell";
import { AttributeBar } from "../AttributeBar";

interface AttributeRowProps {
  hunter: EnrichedReport;
  rank: number;
  rowClass: string;
  attributeTab: AttributeTab;
  onSelectHunter: (hunter: EnrichedReport) => void;
}

export const AttributeRow: React.FC<AttributeRowProps> = ({
  hunter,
  rank,
  rowClass,
  attributeTab,
  onSelectHunter,
}) => {
  const isOverall = attributeTab === "overall";
  const primaryValue = isOverall
    ? getAttributeAverage(hunter)
    : getAttributeValue(hunter, attributeTab);

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
      <td className="py-3 px-4 align-middle">
        <AttributeBar
          value={primaryValue}
          label={
            isOverall ? "AVG" : attributeTab.charAt(0).toUpperCase() + attributeTab.slice(1)
          }
        />
      </td>
      {(["str", "sta", "agi", "vit", "end", "luk"] as const).map((key) => (
        <td
          key={key}
          className="py-3 px-4 align-middle text-right tabular-nums"
        >
          <span
            className={`text-sm ${
              key === attributeTab ? "font-semibold text-ink" : "text-ink-soft"
            }`}
          >
            {hunter[key]}
          </span>
        </td>
      ))}
    </tr>
  );
};
