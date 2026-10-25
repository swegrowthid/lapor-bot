import { useMemo, useState } from "react";
import type {
  EnrichedReport,
  LeaderboardTab,
  AttributeTab,
  StreakTab,
  LeaderboardSortKey,
} from "@lapor-bot/shared";
import {
  sortLeaderboard,
  hasSeasonActivity,
  hasStreakActivity,
  hasAttributeActivity,
  hasWalkActivity,
  currentDailyStreak,
  longestDailyStreak,
  getAttributeAverage,
  getAttributeValue,
  ATTRIBUTE_TAB_TO_SORT_KEY,
} from "@lapor-bot/shared";

const PAGE_SIZE = 15;

const TAB_SORT_KEY: Record<LeaderboardTab, LeaderboardSortKey> = {
  seasonal: "season_rank",
  streak: "weekly_streak",
  week: "weekly_activity",
  walk: "walk_steps",
  attributes: "attribute_overall",
};

const TAB_FILTER: Record<LeaderboardTab, (r: EnrichedReport) => boolean> = {
  seasonal: hasSeasonActivity,
  streak: hasStreakActivity,
  week: (r) => r.week_active_days > 0,
  walk: hasWalkActivity,
  attributes: hasAttributeActivity,
};

export type SortDir = "desc" | "asc";

/**
 * Sort getters keyed by the exact header label they sort (see
 * LeaderboardTable TABLE_HEADERS). Getters that depend on a sub-tab are
 * rebuilt reactively, so an active sort survives weekly <-> daily and
 * attribute sub-tab switches.
 */
function buildSortGetters(
  activeTab: LeaderboardTab,
  streakTab: StreakTab,
  attributeTab: AttributeTab,
): Record<string, (r: EnrichedReport) => number> {
  switch (activeTab) {
    case "seasonal":
      return {
        Streak: (r) => r.streak,
        "Hari Aktif": (r) => r.seasonal_activity_count,
        "Streak Terbaik": (r) => r.seasonal_max_streak,
        Freeze: (r) => r.streak_freezes,
        "Season Points + Progres": (r) => r.seasonal_points,
      };
    case "streak":
      return {
        "Streak Saat Ini": (r) =>
          streakTab === "daily" ? currentDailyStreak(r) : r.streak,
        "Streak Terbaik": (r) =>
          streakTab === "daily" ? longestDailyStreak(r) : r.max_streak,
        "Total Hari": (r) => r.total_active_days,
        Comeback: (r) => r.comeback_streak,
        Centurion: (r) => r.centurion_cycles,
      };
    case "week":
      return {
        "Hari Minggu Ini": (r) => r.week_active_days,
        "Streak Minggu": (r) => r.streak,
        "Est points": (r) => r.estimated_weekly_points,
      };
    case "walk":
      return {
        "Langkah Minggu Ini": (r) => r.week_walk_steps ?? 0,
        "Langkah Season": (r) => r.seasonal_walk_steps ?? 0,
        "Langkah Total": (r) => r.walk_steps_total ?? 0,
      };
    case "attributes":
      return {
        "Nilai Attribute": (r) =>
          attributeTab === "overall"
            ? getAttributeAverage(r)
            : getAttributeValue(r, attributeTab),
        STR: (r) => r.str,
        STA: (r) => r.sta,
        AGI: (r) => r.agi,
        VIT: (r) => r.vit,
        END: (r) => r.end,
        LUK: (r) => r.luk,
      };
  }
}

export interface LeaderboardData {
  search: string;
  setSearch: (v: string) => void;
  selectedJob: string;
  setSelectedJob: (v: string) => void;
  activeTab: LeaderboardTab;
  setActiveTab: (tab: LeaderboardTab) => void;
  attributeTab: AttributeTab;
  setAttributeTab: (tab: AttributeTab) => void;
  streakTab: StreakTab;
  setStreakTab: (tab: StreakTab) => void;
  sortColumn: string | null;
  sortDir: SortDir;
  sortKeys: string[];
  toggleSort: (key: string) => void;
  clearSort: () => void;
  safePage: number;
  totalPages: number;
  pageStartRank: number;
  totalCount: number;
  visibleHunters: EnrichedReport[];
  goToPage: (page: number) => void;
}

export function useLeaderboardData(hunters: EnrichedReport[]): LeaderboardData {
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState("all");
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("seasonal");
  const [attributeTab, setAttributeTab] = useState<AttributeTab>("overall");
  const [streakTab, setStreakTab] = useState<StreakTab>("weekly");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const sortGetters = useMemo(
    () => buildSortGetters(activeTab, streakTab, attributeTab),
    [activeTab, streakTab, attributeTab],
  );
  const sortKeys = useMemo(() => Object.keys(sortGetters), [sortGetters]);

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const jobFilter = selectedJob.toLowerCase();

    const matchesSearch = (h: EnrichedReport) =>
      !q || h.name.toLowerCase().includes(q);

    const matchesJob = (h: EnrichedReport) =>
      jobFilter === "all" || h.job_class?.toLowerCase() === jobFilter;

    const sortKey =
      activeTab === "attributes"
        ? ATTRIBUTE_TAB_TO_SORT_KEY[attributeTab]
        : activeTab === "streak" && streakTab === "daily"
          ? "daily_streak"
          : TAB_SORT_KEY[activeTab];

    const passesTabFilter =
      activeTab === "streak" && streakTab === "daily"
        ? (h: EnrichedReport) => currentDailyStreak(h) > 0
        : TAB_FILTER[activeTab];
    const filtered = hunters.filter(
      (h) => passesTabFilter(h) && matchesSearch(h) && matchesJob(h),
    );

    // Canonical tab ranking first; column sorting then stably reorders on
    // top of it, keeping the canonical order for ties.
    const canonical = sortLeaderboard(filtered, sortKey);
    if (!sortColumn) return canonical;
    const getter = sortGetters[sortColumn];
    if (!getter) return canonical;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...canonical].sort((a, b) => dir * (getter(a) - getter(b)));
  }, [
    hunters,
    activeTab,
    attributeTab,
    streakTab,
    search,
    selectedJob,
    sortColumn,
    sortDir,
    sortGetters,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSorted.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);

  const visibleHunters = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [filteredAndSorted, safePage]);

  const goToPage = (next: number) =>
    setPage(Math.min(Math.max(1, next), totalPages));

  // Cycle per column: desc -> asc -> back to the canonical tab ranking.
  const toggleSort = (key: string) => {
    if (sortColumn !== key) {
      setSortColumn(key);
      setSortDir("desc");
    } else if (sortDir === "desc") {
      setSortDir("asc");
    } else {
      setSortColumn(null);
    }
    setPage(1);
  };

  const clearSort = () => {
    setSortColumn(null);
    setPage(1);
  };

  return {
    search,
    setSearch,
    selectedJob,
    setSelectedJob,
    activeTab,
    setActiveTab,
    attributeTab,
    setAttributeTab,
    streakTab,
    setStreakTab,
    sortColumn,
    sortDir,
    sortKeys,
    toggleSort,
    clearSort,
    safePage,
    totalPages,
    totalCount: filteredAndSorted.length,
    pageStartRank: (safePage - 1) * PAGE_SIZE,
    visibleHunters,
    goToPage,
  };
}
