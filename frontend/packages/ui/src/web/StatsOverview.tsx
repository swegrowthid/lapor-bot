import React from "react";
import { Users, Flame, Activity, CalendarClock } from "lucide-react";
import type { GlobalSummary } from "@lapor-bot/shared";

interface StatsOverviewProps {
  summary: GlobalSummary | null;
  loading: boolean;
}

type StatTone = "accent" | "positive" | "info" | "gold";

interface StatItem {
  key: string;
  label: string;
  value: string;
  icon: React.ElementType;
  tone: StatTone;
  description: string;
}

const TONE_STYLES: Record<StatTone, { chip: string }> = {
  accent: { chip: "bg-accent-soft text-accent" },
  positive: { chip: "bg-positive-soft text-positive" },
  info: { chip: "bg-info-soft text-info" },
  gold: { chip: "bg-gold-soft text-gold" },
};

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  summary,
  loading,
}) => {
  const stats: StatItem[] = [
    {
      key: "hunters",
      label: "Total hunter aktif",
      value: loading ? "-" : (summary?.total_participants ?? 0).toString(),
      icon: Users,
      tone: "accent",
      description: "Melaporkan workout season ini, lebih baik dari kemarin.",
    },
    {
      key: "streak",
      label: "Streak pekan ini",
      value: loading ? "-" : `${summary?.active_streak_count ?? 0} players`,
      icon: Flame,
      tone: "positive",
      description: "Hunter dengan streak aktif minggu ini.",
    },
    {
      key: "workouts",
      label: "Total workout tercatat",
      value: loading ? "-" : (summary?.total_workouts_logged ?? 0).toString(),
      icon: Activity,
      tone: "info",
      description: "Semua laporan workout yang masuk.",
    },
    {
      key: "season",
      label: "Season berjalan",
      value: loading
        ? "-"
        : `Season ${summary?.current_season ?? 1} / Hari ${summary?.current_day ?? 1}`,
      icon: CalendarClock,
      tone: "gold",
      description: "Posisi hari pada season ini.",
    },
  ];

  return (
    <div className="stagger-children grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const tone = TONE_STYLES[stat.tone];
        return (
          <div
            key={stat.key}
            className="animate-fade-in-up rounded-lg border border-border bg-panel shadow-xs p-4 md:p-5"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-xs md:text-sm font-medium text-ink-muted leading-tight">
                {stat.label}
              </p>
              <div
                className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-md ${tone.chip}`}
              >
                <Icon size={18} aria-hidden="true" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-ink tabular-nums tracking-tight break-words">
              {stat.value}
            </p>
            <p className="text-xs text-ink-muted mt-2">
              {stat.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};
