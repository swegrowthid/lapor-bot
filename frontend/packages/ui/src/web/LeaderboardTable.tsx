import React, { useCallback } from "react";
import {
  Search,
  SlidersHorizontal,
  Flame,
  Trophy,
  CalendarDays,
  Swords,
  Footprints,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
} from "lucide-react";
import type {
  EnrichedReport,
  LeaderboardTab,
  AttributeTab,
  StreakTab,
} from "@lapor-bot/shared";

import { SeasonalRow } from "./leaderboard/rows/SeasonalRow";
import { StreakRow } from "./leaderboard/rows/StreakRow";
import { WalkRow } from "./leaderboard/rows/WalkRow";
import { WeekRow } from "./leaderboard/rows/WeekRow";
import { AttributeRow } from "./leaderboard/rows/AttributeRow";
import { useLeaderboardData } from "./leaderboard/useLeaderboardData";

interface LeaderboardTableProps {
  hunters: EnrichedReport[];
  onSelectHunter: (hunter: EnrichedReport) => void;
}

const JOB_FILTER_OPTIONS = [
  { id: "all", name: "Semua job" },
  { id: "fighter", name: "Fighter" },
  { id: "tank", name: "Tanker" },
  { id: "assassin", name: "Assassin" },
  { id: "mage", name: "Mage" },
  { id: "ranger", name: "Ranger" },
  { id: "healer", name: "Healer" },
  { id: "necromancer", name: "Necromancer" },
] as const;

const LEADERBOARD_TABS: {
  id: LeaderboardTab;
  label: string;
  icon: typeof Trophy;
}[] = [
  { id: "seasonal", label: "Season Rank", icon: Trophy },
  { id: "streak", label: "Streak", icon: Flame },
  { id: "walk", label: "Langkah", icon: Footprints },
  { id: "week", label: "Minggu Ini", icon: CalendarDays },
  { id: "attributes", label: "Attributes", icon: Swords },
];

const ATTRIBUTE_SUB_TABS: { id: AttributeTab; label: string }[] = [
  { id: "overall", label: "Overall" },
  { id: "str", label: "STR" },
  { id: "sta", label: "STA" },
  { id: "agi", label: "AGI" },
  { id: "vit", label: "VIT" },
  { id: "end", label: "END" },
  { id: "luk", label: "LUK" },
];

const STREAK_SUB_TABS: { id: StreakTab; label: string }[] = [
  { id: "weekly", label: "Mingguan" },
  { id: "daily", label: "Harian" },
];

const TABLE_HEADERS: Record<LeaderboardTab, string[]> = {
  walk: ["Rank", "Hunter", "Job", "Langkah Minggu Ini", "Langkah Season", "Langkah Total"],
  seasonal: [
    "Rank",
    "Hunter",
    "Job",
    "Season Rank",
    "Streak",
    "Hari Aktif",
    "Streak Terbaik",
    "Freeze",
    "Season Points + Progres",
  ],
  streak: [
    "Rank",
    "Hunter",
    "Job",
    "Streak Saat Ini",
    "Streak Terbaik",
    "Total Hari",
    "Comeback",
    "Centurion",
    "Status",
  ],
  week: [
    "Rank",
    "Hunter",
    "Job",
    "Hari Minggu Ini",
    "Hari Aktif (7)",
    "Streak Minggu",
    "Est points",
  ],
  attributes: [
    "Rank",
    "Hunter",
    "Job",
    "Nilai Attribute",
    "STR",
    "STA",
    "AGI",
    "VIT",
    "END",
    "LUK",
  ],
};

const renderSubStrip = (
  items: { id: string; label: string }[],
  active: string,
  onChange: (id: string) => void,
) => (
  <div
    className="flex flex-wrap gap-0.5 bg-page-sunken p-1 rounded-md max-w-fit"
    role="group"
  >
    {items.map((sub) => {
      const isActive = active === sub.id;
      return (
        <button
          key={sub.id}
          type="button"
          aria-pressed={isActive}
          onClick={() => onChange(sub.id)}
          className={`whitespace-nowrap px-3 py-1.5 min-h-[36px] rounded-sm text-xs font-medium transition-colors ${
            isActive
              ? "bg-panel text-ink shadow-xs"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          {sub.label}
        </button>
      );
    })}
  </div>
);

const rowClass = (rank: number) => {
  const podium =
    rank === 0
      ? "tr-podium-1"
      : rank === 1
        ? "tr-podium-2"
        : rank === 2
          ? "tr-podium-3"
          : "";
  return `group cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-panel-raised ${podium}`;
};

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  hunters,
  onSelectHunter,
}) => {
  const {
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
    pageStartRank,
    totalCount,
    visibleHunters,
    goToPage,
  } = useLeaderboardData(hunters);

  const handleTabChange = useCallback(
    (tab: LeaderboardTab) => {
      setActiveTab(tab);
      setSearch("");
      setSelectedJob("all");
      // Column getters are tab-specific, so a stale label must not survive.
      clearSort();
    },
    [setActiveTab, setSearch, setSelectedJob, clearSort],
  );

  const handleAttributeSubTabChange = useCallback(
    (sub: AttributeTab) => {
      setAttributeTab(sub);
      goToPage(1);
    },
    [setAttributeTab, goToPage],
  );

  const handleStreakSubTabChange = useCallback(
    (sub: StreakTab) => {
      setStreakTab(sub);
      goToPage(1);
    },
    [setStreakTab, goToPage],
  );

  const renderRows = () =>
    visibleHunters.map((hunter, idx) => {
      const rank = pageStartRank + idx;
      const rc = rowClass(rank);
      switch (activeTab) {
        case "seasonal":
          return (
            <SeasonalRow
              key={hunter.user_id}
              hunter={hunter}
              rank={rank}
              rowClass={rc}
              onSelectHunter={onSelectHunter}
            />
          );
        case "streak":
          return (
            <StreakRow
              key={hunter.user_id}
              hunter={hunter}
              rank={rank}
              rowClass={rc}
              streakTab={streakTab}
              onSelectHunter={onSelectHunter}
            />
          );
        case "walk":
          return (
            <WalkRow
              key={hunter.user_id}
              hunter={hunter}
              rank={rank}
              rowClass={rc}
              onSelectHunter={onSelectHunter}
            />
          );
        case "week":
          return (
            <WeekRow
              key={hunter.user_id}
              hunter={hunter}
              rank={rank}
              rowClass={rc}
              onSelectHunter={onSelectHunter}
            />
          );
        case "attributes":
          return (
            <AttributeRow
              key={hunter.user_id}
              hunter={hunter}
              rank={rank}
              rowClass={rc}
              attributeTab={attributeTab}
              onSelectHunter={onSelectHunter}
            />
          );
        default:
          return null;
      }
    });

  const tableHeaders = TABLE_HEADERS[activeTab];

  const renderTabStrip = (
    items: { id: string; label: string; icon?: typeof Trophy }[],
    active: string,
    onChange: (id: string) => void,
  ) => (
    <div
      className="flex flex-nowrap overflow-x-auto scrollbar-none gap-0.5 bg-page-sunken p-1 rounded-md w-full lg:w-auto lg:max-w-fit"
      role="tablist"
    >
      {items.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={(e) => {
              onChange(tab.id);
              e.currentTarget.scrollIntoView({
                behavior: "smooth",
                inline: "center",
                block: "nearest",
              });
            }}
            className={`flex shrink-0 whitespace-nowrap items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-sm text-sm font-medium transition-colors ${
              isActive
                ? "bg-panel text-ink shadow-xs"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {Icon && <Icon size={14} aria-hidden="true" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <section
      aria-label="Klasemen"
      className="rounded-lg border border-border bg-panel shadow-xs mb-8"
    >
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between p-4 md:px-6 md:pt-5 border-b border-border">
        {renderTabStrip(
          LEADERBOARD_TABS,
          activeTab,
          (id) => handleTabChange(id as LeaderboardTab),
        )}

        <div className="flex gap-2 items-center w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none min-w-0">
            <Search
              size={14}
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama..."
              aria-label="Cari hunter"
              className="w-full lg:w-44 pl-9 pr-3 py-2 min-h-[40px] rounded-md bg-page-sunken border border-border text-sm text-ink placeholder:text-ink-faint focus:border-border-strong focus:outline-none transition-colors"
            />
          </div>
          <div className="relative shrink-0">
            <SlidersHorizontal
              size={14}
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"
            />
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              aria-label="Filter job"
              className="pl-9 pr-7 py-2 min-h-[40px] rounded-md bg-page-sunken border border-border text-sm text-ink focus:border-border-strong focus:outline-none appearance-none cursor-pointer transition-colors"
            >
              {JOB_FILTER_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 pt-4 flex flex-wrap gap-1">
        {activeTab === "attributes" &&
          renderSubStrip(ATTRIBUTE_SUB_TABS, attributeTab, (id) =>
            handleAttributeSubTabChange(id as AttributeTab),
          )}
        {activeTab === "streak" &&
          renderSubStrip(STREAK_SUB_TABS, streakTab, (id) =>
            handleStreakSubTabChange(id as StreakTab),
          )}
      </div>

      <div className="p-2 md:p-4">
        <div key={activeTab} className="overflow-x-auto animate-fade-in">
          <table className="w-full tabular-nums" aria-label="Tabel klasemen">
            <thead>
              <tr className="border-b border-border">
                {tableHeaders.map((header, i) => {
                  const sortable = i > 0 && sortKeys.includes(header);
                  const isSorted = sortColumn === header;
                  return (
                    <th
                      key={`${activeTab}-${i}`}
                      scope="col"
                      aria-sort={
                        isSorted
                          ? sortDir === "desc"
                            ? "descending"
                            : "ascending"
                          : undefined
                      }
                      className={`py-3 px-4 text-xs font-medium whitespace-nowrap ${
                        isSorted ? "text-accent" : "text-ink-muted"
                      } ${i === 0 ? "text-center" : i <= 2 ? "text-left" : "text-right"}`}
                    >
                      {sortable ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(header)}
                          title={`Urutkan ${header} (klik lagi untuk berbalik arah)`}
                          aria-label={`Urutkan kolom ${header}, saat ini ${
                            isSorted
                              ? sortDir === "desc"
                                ? "terbesar dulu"
                                : "terkecil dulu"
                              : "mengikuti peringkat default"
                          }`}
                          className={`inline-flex items-center gap-1 min-h-[36px] text-xs font-medium transition-colors ${
                            isSorted
                              ? "text-accent hover:text-accent"
                              : "text-ink-muted hover:text-ink"
                          }`}
                        >
                          {header}
                          {isSorted ? (
                            sortDir === "desc" ? (
                              <ArrowDown size={12} aria-hidden="true" />
                            ) : (
                              <ArrowUp size={12} aria-hidden="true" />
                            )
                          ) : (
                            <ArrowUpDown
                              size={12}
                              className="opacity-40"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      ) : (
                        header
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>{renderRows()}</tbody>
          </table>
        </div>
      </div>

      {totalCount === 0 && (
        <div className="text-center py-16 text-sm text-ink-muted px-6">
          {search || selectedJob !== "all"
            ? "Tidak ada hunter yang cocok dengan filter ini."
            : "Belum ada hunter aktif untuk kategori ini."}
        </div>
      )}

      {totalPages > 1 && (
        <nav
          className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 md:px-6 border-t border-border"
          aria-label="Navigasi halaman klasemen"
        >
          <p className="text-xs text-ink-muted tabular-nums">
            Menampilkan {pageStartRank + 1}-
            {Math.min(pageStartRank + visibleHunters.length, totalCount)} dari{" "}
            {totalCount} hunters
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage <= 1}
              className="flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-md border border-border bg-panel text-sm text-ink-soft hover:bg-panel-raised disabled:opacity-40 disabled:hover:bg-panel transition-colors"
            >
              <ChevronLeft size={14} aria-hidden="true" />
              Sebelumnya
            </button>
            <span className="px-2 text-xs text-ink-muted tabular-nums">
              Halaman {safePage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage >= totalPages}
              className="flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-md border border-border bg-panel text-sm text-ink-soft hover:bg-panel-raised disabled:opacity-40 disabled:hover:bg-panel transition-colors"
            >
              Selanjutnya
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </section>
  );
};
