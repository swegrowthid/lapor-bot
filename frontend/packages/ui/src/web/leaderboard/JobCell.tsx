import React from "react";
import type { EnrichedReport } from "@lapor-bot/shared";

export const JobCell: React.FC<{ hunter: EnrichedReport }> = ({ hunter }) => (
  <td className="py-3 pl-3 align-middle">
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft bg-page-sunken border border-border rounded-full px-2.5 py-1 whitespace-nowrap">
      {hunter.job_icon} {hunter.job_name}
    </span>
  </td>
);
