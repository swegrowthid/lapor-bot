import React from "react";
import {
  X,
  Award,
  Shield,
  Heart,
  Zap,
  Swords,
  Flame,
  Trophy,
  Compass,
  Mountain,
  Moon,
  CalendarCheck,
} from "lucide-react";
import { useEffect, useRef } from "react";
import type { EnrichedReport } from "@lapor-bot/shared";
import { clampAttribute } from "@lapor-bot/shared";

interface ProfileModalProps {
  hunter: EnrichedReport | null;
  onClose: () => void;
}

const Section = ({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-page-sunken border border-border rounded-md p-4 ${className}`}
  >
    <h3 className="text-sm font-semibold text-ink mb-3">{title}</h3>
    {children}
  </div>
);

export const ProfileModal: React.FC<ProfileModalProps> = ({
  hunter,
  onClose,
}) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!hunter) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKey);
  }, [hunter, onClose]);

  if (!hunter) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Profil hunter ${hunter.name}`}
        className="relative z-10 w-full max-w-2xl rounded-xl bg-panel border border-border shadow-lg p-5 md:p-7 max-h-[90vh] overflow-y-auto animate-scale-in"
      >
        <div className="flex items-start justify-between gap-3 mb-5 border-b border-border pb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl md:text-2xl font-bold text-ink break-words min-w-0">
                {hunter.name}
              </h2>
              <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft bg-page-sunken border border-border rounded-full px-2.5 py-1 whitespace-nowrap">
                {hunter.job_icon} {hunter.job_name}
              </span>
            </div>
            <p className="text-xs text-ink-muted tabular-nums mt-1">
              ID {hunter.user_id}
            </p>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Tutup profil"
            className="shrink-0 p-2 flex items-center justify-center text-ink-muted hover:text-ink hover:bg-panel-raised rounded-sm transition-colors"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <Section title="Season rank">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-2xl font-bold" aria-hidden="true">
                    {hunter.rank_icon}
                  </span>
                  <p className="text-sm font-semibold text-ink">
                    {hunter.rank_name}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-ink-muted block">
                    Season points
                  </span>
                  <span className="text-lg font-bold text-ink tabular-nums">
                    {hunter.seasonal_points} pts
                  </span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-panel rounded-full overflow-hidden border border-border">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-300"
                  style={{ width: `${hunter.season_rank_progress.percent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-ink-muted tabular-nums mt-2">
                <span>
                  {hunter.season_rank_progress.is_max
                    ? "Rank season ini sudah maksimal"
                    : `${hunter.season_rank_progress.remaining} pts lagi`}
                </span>
                <span className="font-semibold text-ink-soft">
                  {hunter.season_rank_progress.percent}%
                </span>
              </div>
            </Section>

            <Section title="Attributes">
              <div className="space-y-2.5">
                {[
                  { icon: Swords, label: "STR", value: clampAttribute(hunter.str) },
                  { icon: Zap, label: "STA", value: clampAttribute(hunter.sta) },
                  { icon: Shield, label: "AGI", value: clampAttribute(hunter.agi) },
                  { icon: Heart, label: "VIT", value: clampAttribute(hunter.vit) },
                  { icon: Mountain, label: "END", value: clampAttribute(hunter.end) },
                  { icon: Moon, label: "LUK", value: clampAttribute(hunter.luk) },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-1.5 text-ink-soft">
                      <Icon size={15} aria-hidden="true" />
                      <span className="text-xs font-medium">{label}</span>
                    </div>
                    <span className="text-sm font-bold text-ink tabular-nums">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </Section>

            <div className="grid grid-cols-2 gap-3">
              <Section title="Side quests">
                <p className="text-2xl font-bold text-ink tabular-nums">
                  {hunter.seasonal_side_quests}
                </p>
                <p className="text-xs text-ink-muted mt-1">Season ini</p>
              </Section>
              <Section title="Goals selesai">
                <p className="text-2xl font-bold text-ink tabular-nums">
                  {hunter.goals_completed}
                </p>
                <p className="text-xs text-ink-muted mt-1 inline-flex items-center gap-1">
                  <CalendarCheck size={11} aria-hidden="true" /> Goals mingguan
                </p>
              </Section>
            </div>
          </div>

          <div className="space-y-4">
            <Section title="Job profile">
              <p className="text-sm text-ink-soft leading-relaxed">
                {hunter.job_description}
              </p>
              {hunter.job_trait && (
                <div className="mt-3 rounded-sm bg-panel border border-border px-2.5 py-2 text-xs text-ink-soft">
                  <span className="font-semibold text-ink">Trait:</span>{" "}
                  {hunter.job_trait}
                </div>
              )}
            </Section>

            <Section title="Streak records">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-panel border border-border rounded-md py-3 flex flex-col items-center">
                  <Flame size={16} className="text-positive mb-1" aria-hidden="true" />
                  <span className="text-lg font-bold text-ink tabular-nums">
                    {hunter.streak}w
                  </span>
                  <span className="text-xs text-ink-muted">sekarang</span>
                </div>
                <div className="bg-panel border border-border rounded-md py-3 flex flex-col items-center">
                  <Trophy size={16} className="text-gold mb-1" aria-hidden="true" />
                  <span className="text-lg font-bold text-ink tabular-nums">
                    {hunter.max_streak}w
                  </span>
                  <span className="text-xs text-ink-muted">terbaik</span>
                </div>
                <div className="bg-panel border border-border rounded-md py-3 flex flex-col items-center">
                  <Compass size={16} className="text-info mb-1" aria-hidden="true" />
                  <span className="text-lg font-bold text-ink tabular-nums">
                    {hunter.seasonal_activity_count}d
                  </span>
                  <span className="text-xs text-ink-muted">hari aktif</span>
                </div>
              </div>
            </Section>

            <Section title="Koleksi badge">
              <div className="flex items-center gap-3 p-3 bg-panel border border-border rounded-md mb-3">
                <div className="text-2xl" aria-hidden="true">
                  {hunter.rank_icon}
                </div>
                <div className="min-w-0">
                  <span className="text-xs text-ink-muted block">Season rank</span>
                  <p className="text-sm font-semibold text-ink">
                    {hunter.rank_name}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <span className="text-xs text-ink-muted block">Season points</span>
                  <span className="text-sm font-semibold text-ink tabular-nums">
                    {hunter.seasonal_points} pts
                  </span>
                </div>
              </div>

              {hunter.achievements.length === 0 &&
              hunter.seasonal_achievements.length === 0 ? (
                <p className="text-xs text-ink-muted italic">
                  Belum ada badge yang diraih.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                  {hunter.achievements.map((badge, idx) => (
                    <span
                      key={`life-${idx}`}
                      className="inline-flex items-center gap-1 text-xs text-ink-soft bg-panel border border-border rounded-full px-2.5 py-1"
                      title="Badge all-time"
                    >
                      <Award size={11} className="text-gold" aria-hidden="true" />
                      {badge}
                    </span>
                  ))}
                  {hunter.seasonal_achievements.map((badge, idx) => (
                    <span
                      key={`season-${idx}`}
                      className="inline-flex items-center gap-1 text-xs text-gold bg-gold-soft border border-border rounded-full px-2.5 py-1"
                      title="Badge season ini"
                    >
                      <Award size={11} aria-hidden="true" />
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
};
