import React, { useState, useEffect } from "react";
import {
  User,
  Compass,
  Target,
  ChevronRight,
  Check,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useRepositories } from "@lapor-bot/shared";
import type { EnrichedReport } from "@lapor-bot/shared";

interface JobInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  trait: string;
}

interface ProfileSetupProps {
  user: EnrichedReport;
  onComplete: (user: EnrichedReport) => void;
  onBack: () => void;
}

const STEPS = [
  { step: 1, label: "Nama", icon: User },
  { step: 2, label: "Job", icon: Compass },
  { step: 3, label: "Goal", icon: Target },
] as const;

export function ProfileSetup({ user, onComplete, onBack }: ProfileSetupProps) {
  const { reports: repo } = useRepositories();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState(user.name ?? "");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    user.job_class || null,
  );
  const [targetDays, setTargetDays] = useState(3);
  const [activity, setActivity] = useState("Olahraga");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobInfo[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    repo
      .listJobs()
      .then((data) => {
        if (!cancelled) setJobs(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Gagal memuat daftar job",
          );
      })
      .finally(() => {
        if (!cancelled) setJobsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [repo]);

  const handleStep1 = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setError(null);
    setLoading(true);
    try {
      await repo.updateName(trimmed);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui nama");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async () => {
    setError(null);
    setLoading(true);
    try {
      if (selectedJobId) {
        await repo.selectJob(selectedJobId);
      }
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memilih job");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Skip = () => {
    setStep(3);
  };

  const handleStep3 = async () => {
    setError(null);
    setLoading(true);
    try {
      await repo.setGoal(targetDays, activity.trim() || "Olahraga");
      const refreshedUser = await repo.fetchUser();
      onComplete(refreshedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan goal");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      onBack();
    } else {
      setStep((prev) => (prev - 1) as 1 | 2 | 3);
      setError(null);
    }
  };

  return (
    <div className="min-h-[60vh] px-4 py-8">
      <div className="max-w-lg mx-auto">
        <button
          onClick={handleBack}
          disabled={loading}
          className="flex items-center gap-2 min-h-[44px] px-3 -ml-1 mb-6 rounded-md text-sm text-ink-soft hover:bg-panel-raised hover:text-ink transition-colors disabled:opacity-50"
        >
          <ArrowLeft size={16} />
          {step === 1 ? "Kembali ke Login" : "Sebelumnya"}
        </button>

        <div className="flex items-center justify-center gap-3 mb-8">
          {STEPS.map((s, idx) => (
            <React.Fragment key={s.step}>
              <div
                aria-current={step === s.step ? "step" : undefined}
                className="flex flex-col items-center gap-2"
              >
                <div
                  aria-hidden="true"
                  className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors duration-300 ${
                    step > s.step
                      ? "border-accent bg-accent text-accent-fg"
                      : step === s.step
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border bg-panel text-ink-muted"
                  }`}
                >
                  {step > s.step ? <Check size={18} /> : <s.icon size={18} />}
                </div>
                <span
                  className={`text-xs font-medium transition-colors duration-300 ${
                    step >= s.step ? "text-ink" : "text-ink-muted"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`w-12 sm:w-16 h-0.5 rounded-full mt-[-18px] transition-colors duration-300 ${
                    step > s.step ? "bg-accent" : "bg-border"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-danger-soft border border-danger/25 flex items-start gap-3">
            <AlertCircle className="text-danger mt-0.5 shrink-0" size={16} />
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {step === 1 && (
          <div className="rounded-xl border border-border bg-panel p-6 shadow-xs md:p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 shrink-0 rounded-md bg-accent-soft text-accent flex items-center justify-center">
                <User size={20} />
              </div>
              <h2 className="text-lg font-semibold text-ink">Nama Hunter</h2>
            </div>
            <p className="text-sm text-ink-soft mb-6">
              Nama ini akan tampil di leaderboard dan profil personal kamu.
            </p>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="hunter-name"
                  className="block text-xs font-medium text-ink-soft mb-1.5"
                >
                  Nama Kamu
                </label>
                <input
                  id="hunter-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && name.trim()) handleStep1();
                  }}
                  placeholder="Masukkan nama hunter..."
                  className="w-full min-h-[44px] px-4 rounded-md bg-panel border border-border text-sm text-ink placeholder:text-ink-faint focus:border-border-strong transition-colors"
                  autoFocus
                />
              </div>
              <button
                onClick={handleStep1}
                disabled={loading || !name.trim()}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 px-6 rounded-md bg-accent text-accent-fg text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Lanjut
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="rounded-xl border border-border bg-panel p-6 shadow-xs md:p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 shrink-0 rounded-md bg-accent-soft text-accent flex items-center justify-center">
                <Compass size={20} />
              </div>
              <h2 className="text-lg font-semibold text-ink">Pilih Job</h2>
            </div>
            <p className="text-sm text-ink-soft mb-6">
              Job menentukan peran hunter kamu. Pilih satu, atau skip untuk
              melanjutkan.
            </p>

            {jobsLoading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12">
                <Loader2 size={28} className="animate-spin text-ink-muted" />
                <span className="text-sm text-ink-muted">
                  Memuat daftar job...
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {jobs.map((job) => {
                  const isSelected = selectedJobId === job.id;
                  return (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      aria-pressed={isSelected}
                      className={`relative text-left p-4 rounded-lg border transition-colors ${
                        isSelected
                          ? "border-accent bg-accent-soft"
                          : "border-border bg-panel hover:bg-panel-raised hover:border-border-strong"
                      }`}
                    >
                      {isSelected && (
                        <Check
                          size={16}
                          aria-hidden="true"
                          className="absolute right-3 top-3 text-accent"
                        />
                      )}
                      <div className="text-2xl mb-1.5">{job.icon}</div>
                      <div className="text-sm font-semibold text-ink">
                        {job.name}
                      </div>
                      <div className="text-xs text-ink-muted leading-relaxed mt-1 mb-2">
                        {job.description}
                      </div>
                      <div className="text-xs font-medium text-accent">
                        {job.trait}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleStep2Skip}
                disabled={loading}
                className="flex-1 min-h-[44px] px-6 rounded-md border border-border bg-panel text-sm font-medium text-ink-soft hover:bg-panel-raised hover:text-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Skip
              </button>
              <button
                onClick={handleStep2}
                disabled={loading || jobsLoading}
                className="flex-1 min-h-[44px] flex items-center justify-center gap-2 px-6 rounded-md bg-accent text-accent-fg text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Lanjut
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-xl border border-border bg-panel p-6 shadow-xs md:p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 shrink-0 rounded-md bg-accent-soft text-accent flex items-center justify-center">
                <Target size={20} />
              </div>
              <h2 className="text-lg font-semibold text-ink">Goal Mingguan</h2>
            </div>
            <p className="text-sm text-ink-soft mb-6">
              Tetapkan target mingguan untuk konsistensi latihan kamu.
            </p>

            <div className="space-y-5 mb-6">
              <div>
                <label
                  htmlFor="target-days"
                  className="block text-xs font-medium text-ink-soft mb-1.5"
                >
                  Target Hari per Minggu
                </label>
                <select
                  id="target-days"
                  value={targetDays}
                  onChange={(e) => setTargetDays(Number(e.target.value))}
                  className="w-full min-h-[44px] px-4 rounded-md bg-panel border border-border text-sm text-ink focus:border-border-strong transition-colors"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <option key={d} value={d}>
                      {d} hari / minggu
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="goal-activity"
                  className="block text-xs font-medium text-ink-soft mb-1.5"
                >
                  Aktivitas
                </label>
                <input
                  id="goal-activity"
                  type="text"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleStep3();
                  }}
                  placeholder="Contoh: Olahraga, Lari, Gym"
                  className="w-full min-h-[44px] px-4 rounded-md bg-panel border border-border text-sm text-ink placeholder:text-ink-faint focus:border-border-strong transition-colors"
                />
              </div>
            </div>

            <button
              onClick={handleStep3}
              disabled={loading}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 px-6 rounded-md bg-accent text-accent-fg text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Check size={18} />
                  Selesai
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
