import React from "react";
import { X, Loader2, Check } from "lucide-react";
import type { JobInfo } from "@lapor-bot/shared";

// Tone pair per job id; the web uses semantic token colors instead of the old
// per-job theme colors (job-utils getJobColor was pruned as dead code).
const JOB_TONES: Record<string, string> = {
  fighter: "text-danger bg-danger-soft",
  tank: "text-gold bg-gold-soft",
  assassin: "text-bronze bg-bronze-soft",
  mage: "text-warning bg-warning-soft",
  ranger: "text-info bg-info-soft",
  healer: "text-positive bg-positive-soft",
  necromancer: "text-silver bg-silver-soft",
};

const jobTone = (jobId: string) =>
  JOB_TONES[jobId?.toLowerCase()] ?? "text-ink-soft bg-page-sunken";

interface JobPickerModalProps {
  jobs: JobInfo[];
  loading: boolean;
  error: string | null;
  currentJobId: string;
  onSelect: (jobId: string) => Promise<void>;
  onClose: () => void;
  selecting: boolean;
}

export const JobPickerModal: React.FC<JobPickerModalProps> = ({
  jobs,
  loading,
  error,
  currentJobId,
  onSelect,
  onClose,
  selecting,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      {/* Backdrop click dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pilih job class"
        className="relative w-full max-w-lg overflow-hidden rounded-xl bg-panel border border-border shadow-lg max-h-[90vh] flex flex-col animate-scale-in z-10"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 sm:px-6 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-ink">Pilih Job</h2>
            <p className="text-xs text-ink-muted mt-1">
              Job menentukan peran dan side quest hunter kamu.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={selecting}
            aria-label="Tutup"
            className="h-10 w-10 shrink-0 inline-flex items-center justify-center rounded-md text-ink-muted hover:bg-panel-raised hover:text-ink transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5 flex-1 min-h-0 flex flex-col overflow-hidden">
          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-md bg-danger-soft border border-danger/25 text-sm text-danger shrink-0">
              {error}
            </div>
          )}

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <Loader2 size={28} className="animate-spin text-ink-muted" />
                <span className="text-sm text-ink-muted">
                  Memuat daftar job...
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {jobs.map((j) => {
                  const isCurrent = j.id === currentJobId;
                  const tone = jobTone(j.id);
                  const nameColor = tone.split(" ")[0] || "text-ink";
                  return (
                    <button
                      key={j.id}
                      disabled={selecting}
                      onClick={() => onSelect(j.id)}
                      className={`relative text-left p-4 rounded-lg border transition-colors ${
                        isCurrent
                          ? "border-accent bg-accent-soft"
                          : "border-border bg-panel hover:border-border-strong hover:bg-panel-raised"
                      } ${selecting ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {/* Selecting spinner overlay */}
                      {selecting && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-panel/80">
                          <Loader2
                            size={20}
                            className="animate-spin text-ink-soft"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl" aria-hidden="true">
                          {j.icon}
                        </span>
                        <span
                          className={`text-sm font-semibold ${nameColor}`}
                        >
                          {j.name}
                        </span>
                      </div>
                      <div className="text-xs text-ink-muted leading-relaxed mb-2">
                        {j.description}
                      </div>
                      {j.trait && (
                        <div
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tone}`}
                        >
                          Trait: {j.trait}
                        </div>
                      )}
                      {isCurrent && (
                        <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-positive">
                          <Check size={12} aria-hidden="true" />
                          Job aktif
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
