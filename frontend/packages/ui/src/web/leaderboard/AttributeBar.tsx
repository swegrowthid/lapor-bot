import React from "react";
import { attributeBarWidth } from "@lapor-bot/shared";

interface AttributeBarProps {
  value: number;
  label: string;
  tone?: "str" | "sta" | "agi" | "vit" | "end" | "luk";
}

/** Kept for API compatibility; the clean system uses one neutral fill and
    lets the label + value carry the meaning. */
export const AttributeBar: React.FC<AttributeBarProps> = ({
  value,
  label,
}) => {
  const width = attributeBarWidth(value);

  return (
    <div className="min-w-[130px] inline-flex items-center gap-2">
      <span className="text-xs text-ink-muted font-medium w-8">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-page-sunken overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all duration-300"
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-ink tabular-nums w-7 text-right">
        {value}
      </span>
    </div>
  );
};
