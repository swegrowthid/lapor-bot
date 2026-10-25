import React from "react";

export const ActiveTodayBadge: React.FC = () => (
  <span className="inline-flex items-center gap-1 text-xs text-positive">
    <span className="h-1.5 w-1.5 rounded-full bg-positive animate-pulse" />
    hari ini
  </span>
);
