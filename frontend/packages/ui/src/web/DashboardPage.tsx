import { useState, useEffect, useMemo, type CSSProperties } from "react";
import {
  LayoutGrid,
  Table2,
  RefreshCw,
  AlertCircle,
  HeartPulse,
  Sun,
  Moon,
  LogIn,
  UserCircle2,
  Trophy,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Loader2,
} from "lucide-react";
import type { ThemeName } from "@lapor-bot/design-system";
import type { EnrichedReport } from "@lapor-bot/shared";
import { useReports } from "@lapor-bot/shared";
import { StatsOverview } from "./StatsOverview";
import { LeaderboardTable } from "./LeaderboardTable";
import { HunterCard } from "./HunterCard";
import { ProfileModal } from "./ProfileModal";
import { MotivationBanner } from "./MotivationBanner";

const PAGE_SIZE = 15;

export type DashboardRoute = "commands" | "login" | "personal";

export interface DashboardPageProps {
  theme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
  onNavigate: (route: DashboardRoute) => void;
  personalUser: EnrichedReport | null;
}

export function DashboardPage({
  theme,
  onThemeChange,
  onNavigate,
  personalUser,
}: DashboardPageProps) {
  const { summary, hunters, loading, refreshing, error, refresh } =
    useReports();
  const [selectedHunter, setSelectedHunter] = useState<EnrichedReport | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [cardPage, setCardPage] = useState(1);

  const seasonTitle = summary
    ? `SWEG Healthy Club - Season ${summary.current_season}`
    : "SWEG Healthy Club";
  const cardTotalPages = Math.max(1, Math.ceil(hunters.length / PAGE_SIZE));
  const safeCardPage = Math.min(cardPage, cardTotalPages);
  const visibleCardHunters = useMemo(() => {
    const start = (safeCardPage - 1) * PAGE_SIZE;
    return hunters.slice(start, start + PAGE_SIZE);
  }, [hunters, safeCardPage]);

  useEffect(() => {
    document.title = seasonTitle;
  }, [seasonTitle]);

  const goToCardPage = (page: number) => {
    setCardPage(Math.min(Math.max(1, page), cardTotalPages));
  };

  return (
    <div className="min-h-screen px-4 md:px-8">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-accent focus:text-accent-fg focus:font-semibold focus:text-sm focus:outline-none"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 -mx-4 md:-mx-8 px-4 md:px-8 mb-6 md:mb-8 bg-panel/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto py-3 md:py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
          <div className="min-w-0 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <HeartPulse className="text-accent shrink-0" size={20} aria-hidden="true" />
              <h1 className="text-lg md:text-xl font-bold text-ink truncate min-w-0">
                {seasonTitle}
              </h1>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              Klasemen consistency olahraga - di mana konsistensi jadi peringkat
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto md:justify-end">
            <button
              type="button"
              onClick={() => onNavigate("commands")}
              title="Panduan dan daftar command bot"
              className="flex items-center gap-2 min-h-[44px] px-3 rounded-md border border-border bg-panel text-sm text-ink-soft hover:bg-panel-raised hover:text-ink transition-colors"
            >
              <BookOpen size={14} aria-hidden="true" />
              Panduan
            </button>

            <div
              className="flex items-center bg-page-sunken p-1 rounded-md"
              role="group"
              aria-label="Mode tampilan klasemen"
            >
              <button
                type="button"
                onClick={() => setViewMode("table")}
                aria-pressed={viewMode === "table"}
                title="Tampilan tabel"
                className={`flex items-center justify-center min-h-[44px] min-w-[44px] rounded-sm transition-colors ${
                  viewMode === "table"
                    ? "bg-panel text-ink shadow-xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <Table2 size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode("cards");
                  setCardPage(1);
                }}
                aria-pressed={viewMode === "cards"}
                title="Tampilan kartu"
                className={`flex items-center justify-center min-h-[44px] min-w-[44px] rounded-sm transition-colors ${
                  viewMode === "cards"
                    ? "bg-panel text-ink shadow-xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <LayoutGrid size={16} aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-2 min-h-[44px] px-3 rounded-md border border-border bg-panel text-sm text-ink-soft hover:bg-panel-raised hover:text-ink transition-colors"
              title="Ganti tema terang/gelap"
              aria-label={`Aktifkan tema ${theme === "dark" ? "terang" : "gelap"}`}
            >
              {theme === "dark" ? (
                <Sun size={14} aria-hidden="true" />
              ) : (
                <Moon size={14} aria-hidden="true" />
              )}
              {theme === "dark" ? "Terang" : "Gelap"}
            </button>

            <button
              type="button"
              onClick={() => refresh()}
              disabled={loading || refreshing}
              className="flex items-center gap-2 min-h-[44px] px-3 rounded-md border border-border bg-panel text-sm text-ink-soft hover:bg-panel-raised hover:text-ink transition-colors disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                aria-hidden="true"
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            {personalUser ? (
              <button
                type="button"
                onClick={() => onNavigate("personal")}
                className="flex items-center gap-2 px-3 min-h-[44px] rounded-md border border-border bg-accent-soft text-sm font-medium text-accent hover:bg-accent hover:text-accent-fg transition-colors"
                title="Lihat profil saya"
                aria-label={`Buka profil ${personalUser.name || "saya"}`}
              >
                <UserCircle2 size={16} aria-hidden="true" />
                <span className="max-w-32 truncate">
                  {personalUser.name || "Profil"}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate("login")}
                className="flex items-center gap-2 px-4 min-h-[44px] rounded-md bg-accent text-accent-fg text-sm font-semibold hover:opacity-90 transition-opacity"
                title="Masuk ke akun"
              >
                <LogIn size={14} aria-hidden="true" />
                Masuk
              </button>
            )}
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-danger-soft border border-border flex items-start gap-3">
            <AlertCircle size={18} className="text-danger mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-danger">
                Gagal memuat klasemen
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                {error instanceof Error ? error.message : String(error)}
              </p>
              <button
                type="button"
                onClick={() => refresh()}
                className="mt-3 inline-flex items-center gap-2 min-h-[40px] px-3 rounded-md border border-border bg-panel text-sm font-medium text-ink hover:bg-panel-raised transition-colors"
              >
                <RefreshCw size={13} aria-hidden="true" />
                Coba lagi
              </button>
            </div>
          </div>
        )}

        <StatsOverview summary={summary ?? null} loading={loading} />

        {!loading && !error && hunters.length > 0 && <MotivationBanner />}

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3" role="status" aria-live="polite">
            <Loader2 size={28} className="animate-spin text-ink-faint" aria-hidden="true" />
            <p className="text-sm text-ink-muted">Memuat klasemen...</p>
          </div>
        ) : hunters.length === 0 ? (
          <div className="rounded-lg border border-border bg-panel p-12 text-center">
            <Trophy size={36} className="text-ink-faint mx-auto mb-3" aria-hidden="true" />
            <h3 className="text-base font-semibold text-ink">
              Belum ada laporan
            </h3>
            <p className="text-sm text-ink-muted mt-1.5 max-w-sm mx-auto">
              Belum ada laporan workout yang masuk. Kirim laporan dengan
              /lapor di grup WhatsApp untuk mulai masuk klasemen.
            </p>
          </div>
        ) : viewMode === "table" ? (
          <LeaderboardTable
            hunters={hunters}
            onSelectHunter={setSelectedHunter}
          />
        ) : (
          <>
            <div className="stagger-children grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {visibleCardHunters.map((hunter, i) => (
                <div
                  key={hunter.user_id}
                  style={{ "--stagger-i": i } as CSSProperties}
                  className="animate-fade-in-up"
                >
                  <HunterCard
                    hunter={hunter}
                    onClick={() => setSelectedHunter(hunter)}
                  />
                </div>
              ))}
            </div>
            <nav
              className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg border border-border bg-panel px-4 py-3"
              aria-label="Navigasi halaman kartu"
            >
              <p className="text-xs text-ink-muted tabular-nums">
                Menampilkan{" "}
                {visibleCardHunters.length === 0
                  ? 0
                  : (safeCardPage - 1) * PAGE_SIZE + 1}
                -{Math.min(safeCardPage * PAGE_SIZE, hunters.length)} dari{" "}
                {hunters.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToCardPage(safeCardPage - 1)}
                  disabled={safeCardPage <= 1}
                  className="flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-md border border-border bg-panel text-sm text-ink-soft hover:bg-panel-raised disabled:opacity-40 disabled:hover:bg-panel transition-colors"
                >
                  <ChevronLeft size={14} aria-hidden="true" />
                  Sebelumnya
                </button>
                <span className="px-2 text-xs text-ink-muted tabular-nums">
                  Halaman {safeCardPage} / {cardTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() => goToCardPage(safeCardPage + 1)}
                  disabled={safeCardPage >= cardTotalPages}
                  className="flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-md border border-border bg-panel text-sm text-ink-soft hover:bg-panel-raised disabled:opacity-40 disabled:hover:bg-panel transition-colors"
                >
                  Selanjutnya
                  <ChevronRight size={14} aria-hidden="true" />
                </button>
              </div>
            </nav>
          </>
        )}
      </main>

      {selectedHunter && (
        <ProfileModal
          hunter={selectedHunter}
          onClose={() => setSelectedHunter(null)}
        />
      )}

      <footer className="max-w-7xl mx-auto mt-12 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-ink-muted">
        <p>&copy; 2026 SWEG Healthy Club</p>
        <p>Healthy with sports consistency - Where consistency becomes rank</p>
      </footer>
    </div>
  );
}
