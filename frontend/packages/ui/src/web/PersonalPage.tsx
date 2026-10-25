import {
  ArrowLeft,
  Shield,
  Swords,
  Zap,
  Heart,
  Mountain,
  Moon,
  LogOut,
  ScrollText,
  CheckCircle2,
  Circle,
  Flame,
  Target,
  Award,
  TrendingUp,
  Activity,
  Edit2,
} from "lucide-react";
import { useState, useRef } from "react";
import {
  useRepositories,
  clampAttribute,
  attributeBarWidth,
} from "@lapor-bot/shared";
import { QuickReport } from "../QuickReport";
import type { QuickReportCallbacks } from "../QuickReport";
import { StravaConnectPanel } from "../StravaConnectPanel";
import type {
  DailyActivity,
  EnrichedReport,
  QuestTask,
  JobInfo,
  PersonalGoal,
  GoalDay,
} from "@lapor-bot/shared";
import { JobPickerModal } from "./JobPickerModal";
import { Toast } from "./Toast";
import type { ToastData, ToastTone } from "./Toast";
interface PersonalPageProps {
  user: EnrichedReport;
  /**
   * Navigate back to the leaderboard without ending the session.
   * This is pure navigation - the user stays logged in.
   */
  onBack: () => void;
  /**
   * End the current session (clear token) and return to the leaderboard.
   */
  onLogout: () => void;
  onUserRefresh?: (user: EnrichedReport) => void;
}

function jobTone(jobId: string) {
  switch (jobId?.toLowerCase()) {
    case "fighter":
      return "bg-danger-soft text-danger";
    case "tank":
      return "bg-gold-soft text-gold";
    case "assassin":
      return "bg-info-soft text-info";
    case "mage":
      return "bg-danger-soft text-danger";
    case "ranger":
      return "bg-info-soft text-info";
    case "healer":
      return "bg-positive-soft text-positive";
    default:
      return "bg-panel-raised text-ink-soft";
  }
}

function formatQuestDifficulty(difficulty: string) {
  if (difficulty === "easy") return "🟢 Easy";
  if (difficulty === "medium") return "🟡 Medium";
  if (difficulty === "hard") return "🔴 Hard";
  return difficulty;
}

function formatQuestTarget(task: QuestTask) {
  if (task.id === "easycardio")
    return "jalan kaki 4000 langkah atau sepeda 5 km";
  if (task.unit === "100m") return `${(task.target / 10).toFixed(1)} km`;
  return `${task.target} ${task.unit}`;
}

function formatQuestProgress(task: QuestTask) {
  if (task.id === "easycardio")
    return task.progress >= task.target ? "selesai" : "belum selesai";
  if (task.unit === "100m")
    return `${(task.progress / 10).toFixed(1)} / ${(task.target / 10).toFixed(1)} km`;
  return `${task.progress} / ${task.target} ${task.unit}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${date}T00:00:00`));
}

function chunkWeeks(days: DailyActivity[]) {
  const weeks: DailyActivity[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

/** Build a best-effort optimistic PersonalGoal from form inputs.
 *  Used for instant UI feedback while the server round-trip completes. */
function buildOptimisticGoal(
  targetDays: number,
  activity: string,
  startDate?: string,
  startHour?: number,
): PersonalGoal {
  const now = new Date();
  const start = startDate
    ? new Date(`${startDate}T${String(startHour ?? 0).padStart(2, "0")}:00:00`)
    : new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        startHour ?? 0,
        0,
        0,
      );
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const dayLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const days: GoalDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      date: dateStr,
      day_label: dayLabels[d.getDay()],
      activity,
      active: false,
    });
  }

  return {
    target_days: targetDays,
    activity,
    start_at: start.toISOString(),
    end_at: end.toISOString(),
    completed_days: 0,
    remaining_days: targetDays,
    percent: 0,
    is_completed: false,
    days,
  };
}

function StatCard({
  label,
  value,
  tone = "text-ink",
}: {
  label: string;
  value: string | number;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-panel shadow-xs p-4">
      <div className={`text-xl font-bold tabular-nums ${tone}`}>{value}</div>
      <div className="mt-1 text-xs text-ink-muted">{label}</div>
    </div>
  );
}

export function PersonalPage({
  user,
  onBack,
  onLogout,
  onUserRefresh,
}: PersonalPageProps) {
  const { reports: repo } = useRepositories();

  // inline edit states
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user.name || "");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [jobs, setJobs] = useState<JobInfo[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobLoading, setJobLoading] = useState(false);
  const [jobError, setJobError] = useState<string | null>(null);

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [targetDays, setTargetDays] = useState<number>(
    user.active_goal?.target_days || 3,
  );
  const [activity, setActivity] = useState<string>(
    user.active_goal?.activity || "Olahraga",
  );
  const [startDate, setStartDate] = useState<string>(""); // YYYY-MM-DD
  const [startHour, setStartHour] = useState<number>(0);
  const [goalLoading, setGoalLoading] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  const [localUser, setLocalUser] = useState<EnrichedReport>(user);
  const [prevUser, setPrevUser] = useState(user);

  // Confirmation toasts for mutation success/error feedback.
  const [toast, setToast] = useState<ToastData | null>(null);
  const toastIdRef = useRef(0);
  const showToast = (message: string, tone: ToastTone = "success") => {
    toastIdRef.current += 1;
    setToast({ id: toastIdRef.current, message, tone });
  };

  // Keep local state in sync when the parent pushes a new user object.
  // Render-phase adjustment (not an effect) avoids setState-in-effect
  // and re-renders immediately with the new values.
  if (user !== prevUser) {
    setPrevUser(user);
    setLocalUser(user);
    setNameValue(user.name || "");
  }

  const refreshUser = async () => {
    const MAX_ATTEMPTS = 2;
    let lastError: unknown = null;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        const refreshed = await repo.fetchUser();
        setLocalUser(refreshed);
        onUserRefresh?.(refreshed);
        return;
      } catch (err) {
        lastError = err;
        if (attempt < MAX_ATTEMPTS - 1) {
          await new Promise((r) => setTimeout(r, 300));
        }
      }
    }
    throw lastError;
  };

  const sideQuests = localUser.today_side_quests ?? [];
  const dailyActivity = localUser.daily_activity ?? [];
  const activeGoal = localUser.active_goal;
  const allBadges = [
    ...localUser.achievements,
    ...localUser.seasonal_achievements,
  ];
  const completedSideQuests = sideQuests.filter(
    (quest) => quest.progress >= quest.target,
  ).length;

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayActivity = dailyActivity.find((d) => d.date === todayStr);
  const reportCount = todayActivity?.count ?? 0;

  const quickReportCallbacks: QuickReportCallbacks = {
    createReport: (msg) =>
      repo.createReport
        ? repo.createReport(msg)
        : Promise.reject(new Error("createReport not available")),
    createSidequestReport: (activities) =>
      repo.createSidequestReport
        ? repo.createSidequestReport(activities)
        : Promise.reject(new Error("createSidequestReport not available")),
  };

  return (
    <div className="min-h-[60vh] px-3 sm:px-4 py-6 sm:py-8 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-3">
          {/* Navigation: back to leaderboard, session preserved */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-panel hover:bg-panel-raised text-xs text-ink-soft hover:text-ink transition-colors min-h-[44px]"
            title="Kembali ke leaderboard"
          >
            <ArrowLeft size={14} />
            Kembali
          </button>

          {/* Account action: end session - visually distinct from navigation */}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-danger/40 bg-danger-soft text-xs text-danger transition-colors min-h-[44px]"
            title="Keluar dari akun"
          >
            <LogOut size={14} />
            Keluar
          </button>
        </div>

        <section
          className="rounded-xl border border-border bg-panel shadow-xs p-4 sm:p-6 md:p-8 mb-6"
        >
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-page-sunken border border-border flex items-center justify-center text-3xl shrink-0">
                {localUser.job_icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-accent">
                  Personal Hunter Profile
                </p>
                <div className="flex items-center gap-2">
                  <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold text-ink tracking-tight truncate">
                    {localUser.name}
                  </h2>
                  <button
                    onClick={() => {
                      setEditingName(true);
                      setNameValue(localUser.name || "");
                      setNameError(null);
                    }}
                    className="mt-2 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-ink-muted hover:bg-panel-raised hover:text-ink transition-colors"
                    title="Ubah nama"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
                {editingName && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      className="min-w-0 flex-1 px-3 py-1.5 rounded-md bg-page-sunken border border-border text-sm text-ink placeholder:text-ink-muted focus:border-border-strong"
                      placeholder="Nama hunter"
                    />
                    <button
                      disabled={nameLoading}
                      onClick={async () => {
                        const v = nameValue.trim();
                        if (!v) return;
                        setNameLoading(true);
                        setNameError(null);
                        try {
                          const res = await repo.updateName(v);
                          await refreshUser();
                          setEditingName(false);
                          showToast(res.message || "Nama berhasil diperbarui");
                        } catch (e) {
                          setNameError(
                            e instanceof Error
                              ? e.message
                              : "Gagal update nama",
                          );
                        } finally {
                          setNameLoading(false);
                        }
                      }}
                      className="px-3 py-1.5 rounded-md bg-accent text-accent-fg text-xs font-semibold transition-colors hover:bg-accent/90"
                    >
                      {nameLoading ? "..." : "Simpan"}
                    </button>
                    <button
                      onClick={() => setEditingName(false)}
                      className="px-2 py-1.5 text-xs text-ink-muted hover:text-ink rounded-md"
                    >
                      Batal
                    </button>
                  </div>
                )}
                {nameError && (
                  <p className="text-xs text-danger mt-1">
                    {nameError}
                  </p>
                )}
                <p className="text-sm text-ink-soft mt-1">
                  {localUser.job_name} • {localUser.rank_icon}{" "}
                  {localUser.rank_name}
                </p>
                <p className="text-xs text-ink-muted mt-1 tabular-nums">
                  {localUser.user_id}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-panel-raised p-4">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div>
                  <p className="text-xs font-medium text-ink-muted">
                    Season Rank
                  </p>
                  <p className="text-lg font-bold text-ink">
                    {localUser.rank_icon} {localUser.rank_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-ink tabular-nums">
                    {localUser.seasonal_points}
                  </p>
                  <p className="text-xs text-ink-muted">
                    Season Points
                  </p>
                </div>
              </div>
              <div className="h-3 rounded-full bg-page-sunken overflow-hidden p-[2px]">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{
                    width: `${localUser.season_rank_progress.percent}%`,
                  }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-ink-muted tabular-nums">
                <span>{localUser.season_rank_progress.remaining} pts lagi</span>
                <span className="text-accent font-semibold">
                  {localUser.season_rank_progress.is_max
                    ? "MAX"
                    : `${localUser.season_rank_progress.percent}%`}
                </span>
                <span>
                  {localUser.season_rank_progress.is_max
                    ? ""
                    : `${localUser.season_rank_progress.next_icon} ${localUser.season_rank_progress.next_name}`}
                </span>
              </div>
            </div>
          </div>
        </section>

        <>
          {/* Quick Report Widget */}
          <QuickReport
            onReported={refreshUser}
            callbacks={quickReportCallbacks}
            dailyCount={reportCount}
            maxDaily={3}
          />

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard
              label="Season Points"
              value={localUser.seasonal_points}
              tone="text-gold"
            />
            <StatCard
              label="Daily Streak"
              value={`${localUser.current_daily_streak ?? 0} hari`}
              tone="text-positive"
            />
            <StatCard
              label="Weekly Streak"
              value={`${localUser.streak} minggu`}
              tone="text-positive"
            />
            <StatCard
              label="Active Window"
              value={`${localUser.active_days_in_window ?? 0}/${dailyActivity.length || 35}`}
              tone="text-info"
            />
          </section>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              {/* Streak Map - monthly view with day labels + weekly streak hero */}
              <div className="rounded-lg border border-border bg-panel shadow-xs p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                      <Flame className="text-accent" size={18} />
                      Streak Map
                    </h3>
                    <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                      <span className="text-positive font-semibold tabular-nums">
                        {localUser.streak} minggu
                      </span>{" "}
                      berturut-turut. Harimu mendukung streak mingguanmu.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold text-positive tabular-nums">
                      {localUser.streak}w
                    </div>
                    <div className="text-xs text-ink-muted">
                      Weekly Streak
                    </div>
                    <div className="mt-1 text-xs text-ink-muted tabular-nums">
                      Best: {localUser.longest_daily_streak ?? 0}d
                    </div>
                  </div>
                </div>

                {/* Monthly calendar heatmap with day labels */}
                {dailyActivity.length > 0 &&
                  (() => {
                    const DAY_LABELS = ["M", "S", "S", "R", "K", "J", "S"];
                    const startDate = new Date(
                      dailyActivity[0].date + "T00:00:00",
                    );
                    const startDay = startDate.getDay(); // 0=Sun
                    const rowLabels = Array.from(
                      { length: 7 },
                      (_, i) => DAY_LABELS[(startDay + i) % 7],
                    );
                    const weeks = chunkWeeks(dailyActivity);

                    return (
                      <div className="overflow-x-auto pb-2">
                        <div
                          className="inline-flex items-start gap-1.5 p-3 rounded-lg bg-page-sunken border border-border"
                          aria-label="Streak map - konsistensi mingguan"
                        >
                          {/* Day labels column */}
                          <div className="flex flex-col gap-[5px] pt-0 shrink-0">
                            {rowLabels.map((label, i) => (
                              <div
                                key={i}
                                className="h-[22px] w-[24px] flex items-center justify-center"
                              >
                                <span className="text-[10px] font-medium text-ink-muted">
                                  {label}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Week columns */}
                          {weeks.map((week, weekIdx) => {
                            const activeDays = week.filter(
                              (d) => d.active,
                            ).length;
                            return (
                              <div
                                key={`week-${weekIdx}`}
                                className="flex flex-col items-center gap-[3px]"
                              >
                                <div className="grid grid-rows-7 gap-[5px]">
                                  {week.map((day) => {
                                    const intensity =
                                      !day.active || day.count <= 0
                                        ? "empty"
                                        : day.count >= 3
                                          ? "high"
                                          : day.count === 2
                                            ? "mid"
                                            : "low";
                                    const cellClass =
                                      intensity === "high"
                                        ? "bg-positive border-positive"
                                        : intensity === "mid"
                                          ? "bg-positive/70 border-positive/60"
                                          : intensity === "low"
                                            ? "bg-positive/40 border-positive/40"
                                            : "bg-panel border-border";
                                    return (
                                      <span
                                        key={day.date}
                                        className={`h-[22px] w-[22px] rounded-[5px] border transition-transform hover:scale-110 hover:brightness-110 ${cellClass}`}
                                      />
                                    );
                                  })}
                                </div>
                                {/* Per-week active count */}
                                <span
                                  className={`text-[8px] leading-none tabular-nums ${activeDays > 0 ? "text-positive" : "text-ink-muted"}`}
                                >
                                  {activeDays}/7
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-ink-muted">
                  <div className="text-ink-soft tabular-nums">
                    {dailyActivity[0] ? formatDate(dailyActivity[0].date) : "-"}{" "}
                    →{" "}
                    {dailyActivity.at(-1)
                      ? formatDate(dailyActivity.at(-1)!.date)
                      : "-"}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 rounded-[3px] bg-page-sunken border border-border" />
                      <span>Rest</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 rounded-[3px] bg-positive border border-positive/60" />
                      <span>Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Goal - atur, lacak, raih */}
              <section className="rounded-lg border border-border bg-panel shadow-xs p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                      <Target className="text-accent" size={18} />
                      Weekly Goal
                    </h3>
                    <p className="text-xs text-ink-muted mt-1">
                      Goal mingguan pribadi - atur target, lacak progress, raih
                      streak.
                    </p>
                  </div>
                  {activeGoal && (
                    <div className="text-right shrink-0">
                      <div
                        className={`text-sm font-bold tabular-nums ${activeGoal.is_completed ? "text-gold" : "text-ink"}`}
                      >
                        {activeGoal.is_completed
                          ? "✅ Selesai"
                          : `${activeGoal.completed_days}/${activeGoal.target_days}`}
                      </div>
                      <div className="text-xs text-ink-muted">
                        {activeGoal.is_completed ? "Goal Tercapai" : "Progress"}
                      </div>
                    </div>
                  )}
                </div>

                {!activeGoal ? (
                  <div className="rounded-lg border border-border bg-page-sunken p-6 text-center">
                    <Target className="mx-auto mb-3 text-ink-muted" size={28} />
                    <p className="text-sm text-ink-soft">
                      Belum ada goal aktif.
                    </p>
                    <p className="text-xs text-ink-muted mt-1 mb-4 max-w-xs mx-auto">
                      Tentukan target mingguanmu dan lacak konsistensimu setiap
                      hari.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowGoalForm(true);
                        setGoalError(null);
                      }}
                      className="inline-flex items-center gap-2 px-4 rounded-md bg-accent text-accent-fg text-sm font-semibold hover:bg-accent/90 transition-colors min-h-[44px]"
                    >
                      <Target size={14} />
                      Atur Goal
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Completed celebration banner */}
                    {activeGoal.is_completed && (
                      <div className="mb-4 rounded-lg border border-gold/30 bg-gold-soft p-4 text-center">
                        <p className="text-base font-bold text-gold">
                          🎉 Goal tercapai! 🎉
                        </p>
                        <p className="text-sm text-ink-soft mt-1 tabular-nums">
                          {activeGoal.target_days}x {activeGoal.activity}{" "}
                          berhasil kamu selesaikan!
                        </p>
                        <p className="text-xs text-ink-muted mt-2">
                          Konsisten itu kunci 💪 Sekarang kamu bisa set goal
                          baru dan lanjutkan streak mingguanmu!
                        </p>
                      </div>
                    )}

                    {/* Progress bar (hidden when completed - replaced by banner) */}
                    {!activeGoal.is_completed && (
                      <div className="mb-4 rounded-lg border border-border bg-panel-raised p-4">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <p className="text-sm text-ink font-semibold">
                            {activeGoal.target_days}x {activeGoal.activity}
                          </p>
                          <p className="text-xs text-accent font-semibold tabular-nums">
                            {activeGoal.percent}%
                          </p>
                        </div>
                        <div className="h-3 rounded-full bg-page-sunken overflow-hidden p-[2px]">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${activeGoal.percent}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-ink-muted">
                          Sisa {activeGoal.remaining_days} hari lagi untuk
                          mencapai goal.
                        </p>
                      </div>
                    )}

                    {/* 7-day grid - hari dimulai dari tanggal start user */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                      {activeGoal.days.map((day) => (
                        <div
                          key={day.date}
                          className={`rounded-lg border p-1 sm:p-2 text-center ${
                            day.active
                              ? activeGoal.is_completed
                                ? "border-gold/30 bg-gold-soft"
                                : "border-positive/30 bg-positive-soft"
                              : "border-border bg-page-sunken"
                          }`}
                          title={day.activity}
                        >
                          <div className="text-xs text-ink-muted">
                            {day.day_label}
                          </div>
                          <div className="mt-1 flex justify-center">
                            {day.active ? (
                              <CheckCircle2
                                size={16}
                                className={
                                  activeGoal.is_completed
                                    ? "text-gold"
                                    : "text-positive"
                                }
                              />
                            ) : (
                              <Circle size={16} className="text-ink-faint" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Goal setter controls */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <button
                      onClick={() => {
                        setShowGoalForm((v) => !v);
                        setGoalError(null);
                        if (localUser.active_goal) {
                          setTargetDays(localUser.active_goal.target_days || 3);
                          setActivity(
                            localUser.active_goal.activity || "Olahraga",
                          );
                        }
                      }}
                      className="text-xs px-3 py-1.5 rounded-md border border-border bg-panel text-ink-soft hover:bg-panel-raised hover:text-ink transition-colors"
                    >
                      {showGoalForm
                        ? "Tutup"
                        : localUser.active_goal?.is_completed
                          ? "Set Goal Baru 🎯"
                          : "Atur / Ubah Goal"}
                    </button>
                    {localUser.active_goal &&
                      !localUser.active_goal.is_completed && (
                        <button
                          disabled={resetLoading}
                          onClick={async () => {
                            setResetLoading(true);
                            setGoalError(null);
                            try {
                              const res = await repo.resetGoal!();
                              await refreshUser();
                              showToast(res.message || "Goal berhasil direset");
                            } catch (e) {
                              setGoalError(
                                e instanceof Error
                                  ? e.message
                                  : "Gagal reset goal",
                              );
                            } finally {
                              setResetLoading(false);
                            }
                          }}
                          className="text-xs px-3 py-1.5 rounded-md border border-danger/40 text-danger hover:bg-danger-soft transition-colors"
                        >
                          {resetLoading ? "Reset..." : "Reset Goal"}
                        </button>
                      )}
                  </div>

                  {showGoalForm && (
                    <div className="rounded-lg border border-border bg-page-sunken p-4 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-ink-muted mb-1">
                          Target Hari (1-7)
                        </label>
                        <select
                          value={targetDays}
                          onChange={(e) =>
                            setTargetDays(parseInt(e.target.value))
                          }
                          className="w-full px-3 py-2 rounded-md bg-panel border border-border text-sm text-ink focus:border-border-strong"
                        >
                          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                            <option key={d} value={d}>
                              {d} hari / minggu
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ink-muted mb-1">
                          Aktivitas
                        </label>
                        <input
                          value={activity}
                          onChange={(e) => setActivity(e.target.value)}
                          className="w-full px-3 py-2 rounded-md bg-panel border border-border text-sm text-ink focus:border-border-strong"
                          placeholder="Olahraga"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-ink-muted mb-1">
                            Mulai Tanggal
                          </label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-panel border border-border text-sm text-ink focus:border-border-strong"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-ink-muted mb-1">
                            Jam Mulai
                          </label>
                          <select
                            value={startHour}
                            onChange={(e) =>
                              setStartHour(parseInt(e.target.value))
                            }
                            className="w-full px-3 py-2 rounded-md bg-panel border border-border text-sm text-ink focus:border-border-strong"
                          >
                            {Array.from({ length: 24 }, (_, i) => (
                              <option key={i} value={i}>
                                {i.toString().padStart(2, "0")}:00
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {goalError && (
                        <p className="text-xs text-danger">
                          {goalError}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <button
                          disabled={goalLoading}
                          onClick={async () => {
                            setGoalLoading(true);
                            setGoalError(null);
                            try {
                              const startPayload: {
                                startDate?: string;
                                startHour?: number;
                              } = {};
                              if (startDate) startPayload.startDate = startDate;
                              if (startHour || startHour === 0)
                                startPayload.startHour = startHour;
                              const res = await repo.setGoal(
                                targetDays,
                                activity || "Olahraga",
                                startPayload,
                              );
                              // Optimistic update: apply goal to local state
                              // immediately so the UI transitions from empty→active
                              // before the server round-trip completes.
                              const optimisticGoal = buildOptimisticGoal(
                                targetDays,
                                activity || "Olahraga",
                                startDate || undefined,
                                startHour,
                              );
                              const optimisticUser: EnrichedReport = {
                                ...localUser,
                                active_goal: optimisticGoal,
                              };
                              setLocalUser(optimisticUser);
                              onUserRefresh?.(optimisticUser);
                              setShowGoalForm(false);
                              showToast(
                                res.message || "Goal berhasil diperbarui",
                              );
                              // Sync with server in background - on success the
                              // server data (with real day statuses) replaces
                              // the optimistic goal. On failure we keep the
                              // optimistic state since the goal was saved.
                              try {
                                await refreshUser();
                              } catch {
                                // Goal saved, UI already showing it - silent
                                // background sync failure is acceptable.
                              }
                            } catch (e) {
                              setGoalError(
                                e instanceof Error
                                  ? e.message
                                  : "Gagal menyimpan goal (mungkin sudah ada goal aktif)",
                              );
                            } finally {
                              setGoalLoading(false);
                            }
                          }}
                          className="flex-1 px-4 py-2 rounded-md bg-accent text-accent-fg text-sm font-semibold transition-colors hover:bg-accent/90"
                        >
                          {goalLoading ? "Menyimpan..." : "Simpan Goal"}
                        </button>
                        <button
                          onClick={() => setShowGoalForm(false)}
                          className="px-4 py-2 rounded-md border border-border text-xs text-ink-soft hover:bg-panel-raised hover:text-ink transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                      <p className="text-xs text-ink-muted">
                        Goal berlaku 7 hari dari tanggal+jam yang dipilih.
                        Kosongkan tanggal untuk mulai hari ini.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Side Quest Hari Ini (kept intact) */}
              <section className="rounded-lg border border-border bg-panel shadow-xs p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                      <ScrollText className="text-accent" size={18} />
                      Side Quest Hari Ini
                    </h3>
                    <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                      Selesaikan via WhatsApp:{" "}
                      <span className="font-mono text-ink-soft">
                        /lapor sidequest &lt;kegiatan&gt; &lt;jumlah&gt;
                      </span>
                      .
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-ink tabular-nums">
                      {completedSideQuests}/{sideQuests.length}
                    </div>
                    <div className="text-xs text-ink-muted">
                      Selesai
                    </div>
                  </div>
                </div>

                {sideQuests.length === 0 ? (
                  <div className="rounded-lg border border-border bg-page-sunken p-4 text-center">
                    <p className="text-sm text-ink-soft">
                      Side quest belum terbuka.
                    </p>
                    <p className="text-xs text-ink-muted mt-1 tabular-nums">
                      Side quest tersedia untuk profil yang sudah punya job.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sideQuests.map((quest) => {
                      const done = quest.progress >= quest.target;
                      return (
                        <div
                          key={quest.id}
                          className="rounded-lg border border-border bg-page-sunken p-4"
                        >
                          <div className="flex items-start gap-3">
                            {done ? (
                              <CheckCircle2
                                className="text-positive shrink-0 mt-0.5"
                                size={18}
                              />
                            ) : (
                              <Circle
                                className="text-ink-faint shrink-0 mt-0.5"
                                size={18}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <p className="text-sm font-semibold text-ink">
                                  {quest.name}
                                </p>
                                <span className="text-xs text-ink-muted">
                                  {formatQuestDifficulty(quest.difficulty)}
                                </span>
                              </div>
                              <p className="text-xs text-ink-muted mt-1">
                                Target: {formatQuestTarget(quest)}
                              </p>
                              <p className="text-xs text-ink-muted mt-1 tabular-nums">
                                Progress: {formatQuestProgress(quest)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Right aside - attributes and achievements post incoming */}
            <aside className="space-y-6">
              <StravaConnectPanel onMessage={showToast} />

              {/* Job Profile - same layout as public leaderboard click (ProfileModal) */}
              <section className="rounded-lg border border-border bg-panel shadow-xs p-4 sm:p-5">
                <h3 className="text-xs font-medium text-ink-muted mb-3">
                  Job Profile
                </h3>
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-3">
                  <span className="text-2xl">{localUser.job_icon}</span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border border-border ${jobTone(localUser.job_class)}`}
                  >
                    {localUser.job_name}
                  </span>
                  <button
                    onClick={async () => {
                      setJobError(null);
                      setShowJobModal(true);
                      if (jobs.length === 0) {
                        setJobsLoading(true);
                        try {
                          const list = await repo.listJobs();
                          setJobs(list);
                        } catch (e) {
                          setJobError(
                            e instanceof Error
                              ? e.message
                              : "Gagal memuat jobs",
                          );
                        } finally {
                          setJobsLoading(false);
                        }
                      }
                    }}
                    className="ml-auto text-xs px-2 py-1 rounded-md border border-border text-ink-soft hover:bg-panel-raised hover:text-ink transition-colors"
                  >
                    Ganti
                  </button>
                </div>
                <p className="text-sm text-ink-soft leading-relaxed">
                  {localUser.job_description}
                </p>
                {localUser.job_trait && (
                  <div className="mt-3 p-2.5 rounded-lg bg-page-sunken border border-border text-xs text-ink-soft">
                    <span className="text-accent font-semibold">Trait:</span>{" "}
                    {localUser.job_trait}
                  </div>
                )}
              </section>

              <section className="rounded-lg border border-border bg-panel shadow-xs p-4 sm:p-5">
                <h3 className="text-lg font-bold text-ink flex items-center gap-2 mb-4">
                  <Activity className="text-accent" size={18} />
                  Attributes
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      icon: Swords,
                      label: "STR",
                      hint: "Strength / Gym",
                      value: clampAttribute(localUser.str),
                    },
                    {
                      icon: Zap,
                      label: "STA",
                      hint: "Stamina / Cardio",
                      value: clampAttribute(localUser.sta),
                    },
                    {
                      icon: Shield,
                      label: "AGI",
                      hint: "Agility / Sport",
                      value: clampAttribute(localUser.agi),
                    },
                    {
                      icon: Heart,
                      label: "VIT",
                      hint: "Vitality / Recovery",
                      value: clampAttribute(localUser.vit),
                    },
                    {
                      icon: Mountain,
                      label: "END",
                      hint: "Endurance / Hiking",
                      value: clampAttribute(localUser.end),
                    },
                    {
                      icon: Moon,
                      label: "LUK",
                      hint: "Luck / Resilience",
                      value: clampAttribute(localUser.luk),
                    },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    const width = attributeBarWidth(stat.value);
                    return (
                      <div key={stat.label}>
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <div
                            className="flex items-center gap-2"
                          >
                            <Icon size={16} />
                            <span className="text-xs font-semibold text-ink">
                              {stat.label}
                            </span>
                            <span className="text-[10px] text-ink-muted">
                              {stat.hint}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-ink tabular-nums">
                            {stat.value}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-page-sunken overflow-hidden">
                          <div
                            className="h-full rounded-full bg-accent transition-all duration-500"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-lg border border-border bg-panel shadow-xs p-4 sm:p-5">
                <h3 className="text-lg font-bold text-ink flex items-center gap-2 mb-4">
                  <TrendingUp className="text-accent" size={18} />
                  Rank Baseline
                </h3>
                <div className="rounded-lg border border-border bg-panel-raised p-4 mb-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div>
                      <p className="text-xs text-ink-muted">
                        Season Rank
                      </p>
                      <p className="text-lg font-bold text-ink">
                        {localUser.rank_icon} {localUser.rank_name}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-ink tabular-nums">
                      {localUser.seasonal_points} pts
                    </p>
                  </div>
                  <div className="h-3 rounded-full bg-page-sunken overflow-hidden p-[2px]">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: `${localUser.season_rank_progress.percent}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-ink-muted">
                    {localUser.season_rank_progress.is_max
                      ? "Max rank season ini"
                      : `Menuju ${localUser.season_rank_progress.next_icon} ${localUser.season_rank_progress.next_name}: ${localUser.season_rank_progress.remaining} pts lagi`}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    label="Goals Done"
                    value={localUser.goals_completed}
                    tone="text-gold"
                  />
                  <StatCard
                    label="Side Quests"
                    value={localUser.seasonal_side_quests}
                    tone="text-positive"
                  />
                  <StatCard
                    label="Season Days"
                    value={localUser.seasonal_activity_count}
                    tone="text-info"
                  />
                  <StatCard
                    label="Total Days"
                    value={localUser.total_active_days}
                  />
                </div>
              </section>

              <section className="rounded-lg border border-border bg-panel shadow-xs p-4 sm:p-5">
                <h3 className="text-lg font-bold text-ink flex items-center gap-2 mb-4">
                  <Award className="text-accent" size={18} />
                  Achievements
                </h3>
                {allBadges.length === 0 ? (
                  <p className="text-xs text-ink-muted">
                    Belum ada badge. Fokus ke streak, goal, dan side quest dulu.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {localUser.achievements.map((badge) => (
                      <span
                        key={`life-${badge}`}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-gold-soft px-2.5 py-1 text-xs font-medium text-gold"
                      >
                        <Award size={11} /> {badge}
                      </span>
                    ))}
                    {localUser.seasonal_achievements.map((badge) => (
                      <span
                        key={`season-${badge}`}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-info-soft px-2.5 py-1 text-xs font-medium text-info"
                      >
                        <Award size={11} /> {badge}
                      </span>
                    ))}
                  </div>
                )}
              </section>
            </aside>
          </div>
        </>
      </div>

      {showJobModal && (
        <JobPickerModal
          jobs={jobs}
          loading={jobsLoading}
          error={jobError}
          currentJobId={localUser.job_class}
          selecting={jobLoading}
          onSelect={async (jobId: string) => {
            setJobLoading(true);
            setJobError(null);
            try {
              const res = await repo.selectJob(jobId);
              await refreshUser();
              setShowJobModal(false);
              showToast(res.message || "Job berhasil diganti");
            } catch (e) {
              setJobError(
                e instanceof Error
                  ? e.message
                  : "Gagal memilih job (mungkin butuh >=50 poin)",
              );
            } finally {
              setJobLoading(false);
            }
          }}
          onClose={() => {
            setShowJobModal(false);
            setJobError(null);
          }}
        />
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
