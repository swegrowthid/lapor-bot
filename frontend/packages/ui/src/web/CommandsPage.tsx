import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  CalendarClock,
  Check,
  ChevronLeft,
  CircleHelp,
  Copy,
  Dumbbell,
  Globe,
  Link2,
  MessageCircle,
  Send,
  Sparkles,
  Target,
  Terminal,
  Trophy,
  UserCircle2,
  XCircle,
  type LucideIcon,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Data - source of truth: internal/app/usecase/get_help_usecase.go            */
/* -------------------------------------------------------------------------- */

interface WhatsAppCommand {
  /** Primary syntax, e.g. "/lapor jalan kaki [jumlah]". */
  syntax: string;
  /** Equivalent forms, e.g. the "#" prefix variant. */
  aliases?: string[];
  description: string;
  examples?: string[];
  note?: string;
}

interface CommandCategory {
  id: string;
  icon: LucideIcon;
  title: string;
  summary: string;
  commands: WhatsAppCommand[];
}

const WHATSAPP_CATEGORIES: CommandCategory[] = [
  {
    id: "lapor",
    icon: Dumbbell,
    title: "Melaporkan Aktivitas",
    summary:
      "Cara utama mencatat workout. Laporan valid menambah streak mingguan, XP, dan total hari aktif.",
    commands: [
      {
        syntax: "/lapor",
        aliases: ["#lapor"],
        description:
          "Laporkan workout atau aktivitas harianmu. Posisi command fleksibel - bisa di awal, tengah, atau akhir kalimat.",
        examples: ["/lapor", "/lapor Push Day", "gym pagi ini /lapor"],
        note: "Max 3x laporan per hari. Laporan ke-2 dan ke-3 tetap dihitung 1 hari, tapi XP dibagi 2. Kamu punya 1 Streak Freeze gratis per season, +1 lagi setiap mencapai 4 minggu streak.",
      },
      {
        syntax: "/lapor-kemarin",
        aliases: ["#lapor-kemarin"],
        description:
          "Laporan khusus untuk hari kemarin - berguna kalau lupa lapor. Sama seperti /lapor, XP dibagi 2.",
        examples: ["/lapor-kemarin lari 5K", "/lapor-kemarin gym"],
        note: "Max 3x per hari, berbagi slot dengan laporan hari ini.",
      },
      {
        syntax: "/lapor jalan kaki [jumlah]",
        aliases: ["#lapor jalan kaki [jumlah]"],
        description:
          "Catat langkah harian sebagai laporan utama - masuk streak, XP, leaderboard, dan klasemen langkah di web.",
        examples: [
          "/lapor jalan kaki 5000",
          "/lapor jalan kaki 12.500",
          "/lapor jalan kaki 8rb",
          "walking 6500 steps /lapor",
        ],
        note: "Angka langkah WAJIB (min 100, max 250.000) - tanpa angka valid laporan tidak tercatat. Format bebas: 12.500, 12,500, 8rb, 8k, atau nempel 12500langkah. Durasi seperti `jalan 30 menit` dianggap laporan biasa.",
      },
    ],
  },
  {
    id: "sidequest",
    icon: Sparkles,
    title: "Side Quest Harian",
    summary:
      "Quest bonus harian untuk hunter yang sudah punya job - easy, medium, dan hard dengan XP bonus per difficulty.",
    commands: [
      {
        syntax: "/lapor sidequest",
        aliases: ["#lapor sidequest"],
        description:
          "Lihat daftar side quest easy, medium, dan hard hari ini untuk profilmu.",
        note: "Easy: jalan kaki min 4.000 langkah atau sepeda 5 km. Medium/hard: latihan ringan yang naik sedikit sesuai rank job.",
      },
      {
        syntax: "/lapor sidequest [kegiatan] [jumlah]",
        aliases: ["#lapor sidequest [kegiatan] [jumlah]"],
        description:
          "Lapor penyelesaian side quest. Nama kegiatan harus sama persis dengan yang tertera di daftar quest, dan target harus tercapai.",
        examples: [
          "/lapor sidequest jalan kaki 4000",
          "/lapor sidequest sepeda 5 km",
          "/lapor sidequest chair squat 18",
        ],
        note: "Slot side quest terpisah (3x/hari) dari laporan utama. Langkah dari side quest easy ikut masuk akumulasi jalan kaki di web.",
      },
    ],
  },
  {
    id: "cancel",
    icon: XCircle,
    title: "Membatalkan Laporan",
    summary:
      "Salah input? Batalkan laporanmu - hanya bisa pada hari yang sama dengan laporan.",
    commands: [
      {
        syntax: "/cancel",
        aliases: ["#cancel"],
        description:
          "Batalkan laporan utama terakhir hari ini. Kalau ada 2–3 laporan, hanya yang paling akhir yang dihapus.",
      },
      {
        syntax: "/cancel-all",
        aliases: ["#cancel-all"],
        description:
          "Hapus semua laporan utama hari ini dan hitung ulang progresmu.",
      },
      {
        syntax: "/cancel sidequest",
        aliases: ["#cancel sidequest"],
        description: "Batalkan side quest terakhir hari ini.",
      },
      {
        syntax: "/cancel-all sidequest",
        aliases: ["#cancel-all sidequest"],
        description: "Hapus semua side quest hari ini.",
      },
    ],
  },
  {
    id: "strava",
    icon: Link2,
    title: "Integrasi Strava",
    summary:
      "Hubungkan Strava sekali, aktivitas larimu otomatis terlapor tanpa command.",
    commands: [
      {
        syntax: "/strava",
        description:
          "Dapatkan link otorisasi Strava. Kalau dikirim di grup, bot akan mengarahkanmu ke chat private demi keamanan.",
        note: "Setelah terhubung, aktivitas Strava otomatis dilaporkan bot.",
      },
      {
        syntax: "/disconnect-strava",
        aliases: ["/disconnectstrava"],
        description: "Putuskan koneksi akun Strava dari profilmu.",
      },
    ],
  },
  {
    id: "bantuan",
    icon: CircleHelp,
    title: "Bantuan",
    summary: "Panduan langsung dari bot di dalam chat.",
    commands: [
      {
        syntax: "/help",
        aliases: ["#help"],
        description: "Tampilkan list command ringkas.",
      },
      {
        syntax: "/tutorial",
        aliases: ["#tutorial"],
        description:
          "Tampilkan panduan lengkap penggunaan bot, termasuk attribute RPG dan flow side quest.",
      },
    ],
  },
];

interface WebsiteStep {
  icon: LucideIcon;
  title: string;
  description: string;
}

const WEBSITE_STEPS: WebsiteStep[] = [
  {
    icon: Trophy,
    title: "Buka Leaderboard",
    description:
      "Klasemen season, ranking, streak, dan klasemen langkah bisa dilihat siapa saja - tanpa perlu login.",
  },
  {
    icon: UserCircle2,
    title: "Masuk dengan Nomor WhatsApp",
    description:
      "Klik tombol Masuk di kanan atas, lalu gunakan nomor WhatsApp yang kamu pakai untuk lapor di grup.",
  },
  {
    icon: BookOpen,
    title: "Lengkapi Profil & Pilih Job",
    description:
      "Atur nama tampilan dan pilih job RPG-mu. Job menentukan attribute yang naik dan isi side quest harianmu.",
  },
  {
    icon: Send,
    title: "Lapor Langsung dari Web",
    description:
      "Panel Lapor Hari Ini di halaman personal bekerja persis seperti /lapor - termasuk lapor sidequest. Berbagi kuota 3x/hari dengan WhatsApp.",
  },
  {
    icon: Target,
    title: "Atur Goals Mingguan",
    description:
      "Tentukan target aktivitas mingguanmu. Saat goal tercapai, bot mengirim notifikasi selebrasi ke grup WhatsApp.",
  },
  {
    icon: Link2,
    title: "Hubungkan Strava",
    description:
      "Dari halaman personal, hubungkan Strava agar aktivitas lari/sepedamu terlapor otomatis tanpa perlu command.",
  },
];

const WEBSITE_URL = "https://lapor-bot.web.id/";

/* -------------------------------------------------------------------------- */
/* Small building blocks                                                       */
/* -------------------------------------------------------------------------- */

/** kbd-style command chip that copies itself on click (shadcn pattern). */
function SyntaxChip({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API blocked (non-secure context / permission) - fall back
      // to the legacy selection path so the feature still works everywhere.
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        // Give up silently - the chip is still readable text.
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? "Tersalin!" : `Salin ${text}`}
      aria-label={`Salin command ${text}`}
      className="group/chip inline-flex max-w-full items-center gap-1.5 min-h-[32px] rounded-md border border-border bg-page-sunken px-2.5 font-mono text-xs font-medium text-ink-soft hover:bg-panel-raised hover:border-border-strong transition-colors cursor-pointer"
    >
      <span className="truncate">{text}</span>
      {copied ? (
        <Check size={12} className="shrink-0 text-positive" aria-hidden="true" />
      ) : (
        <Copy
          size={12}
          className="shrink-0 text-ink-muted opacity-40 group-hover/chip:opacity-100 group-focus-visible/chip:opacity-100 transition-opacity"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

function CommandCard({ command }: { command: WhatsAppCommand }) {
  return (
    <article className="rounded-lg border border-border bg-panel shadow-xs p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <SyntaxChip text={command.syntax} />
        {command.aliases?.map((alias) => (
          <SyntaxChip key={alias} text={alias} />
        ))}
      </div>
      <p className="mt-3 text-sm text-ink-soft leading-relaxed">
        {command.description}
      </p>
      {command.examples && command.examples.length > 0 && (
        <div className="mt-3 rounded-md border border-border bg-page-sunken px-3 py-2.5">
          <p className="mb-1.5 text-xs font-medium text-ink-muted">Contoh</p>
          <ul className="space-y-1">
            {command.examples.map((example) => (
              <li
                key={example}
                className="flex items-center gap-2 font-mono text-xs text-ink-soft"
              >
                <span aria-hidden="true" className="select-none text-ink-muted">
                  ›
                </span>
                {example}
              </li>
            ))}
          </ul>
        </div>
      )}
      {command.note && (
        <p className="mt-3 border-l-2 border-border-strong pl-3 text-xs text-ink-muted leading-relaxed">
          {command.note}
        </p>
      )}
    </article>
  );
}

function CategorySection({
  category,
  index,
}: {
  category: CommandCategory;
  index: number;
}) {
  const Icon = category.icon;
  return (
    <section
      id={`command-${category.id}`}
      aria-labelledby={`command-${category.id}-heading`}
      className="scroll-mt-24"
    >
      <header>
        <h3
          id={`command-${category.id}-heading`}
          className="flex items-center gap-2.5 text-base sm:text-lg font-semibold text-ink"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border bg-page-sunken text-xs font-semibold text-ink-muted tabular-nums"
          >
            {index + 1}
          </span>
          <Icon size={18} className="shrink-0 text-ink-soft" aria-hidden="true" />
          {category.title}
        </h3>
        <p className="mt-1.5 text-sm text-ink-muted leading-relaxed max-w-2xl">
          {category.summary}
        </p>
      </header>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {category.commands.map((command) => (
          <CommandCard key={command.syntax} command={command} />
        ))}
      </div>
    </section>
  );
}

function WhatsAppGuide() {
  return (
    <div className="space-y-10">
      <div className="rounded-lg bg-accent-soft p-4 sm:p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Terminal
            size={14}
            className="shrink-0 text-accent"
            aria-hidden="true"
          />
          Quick Start
        </p>
        <ol className="mt-3 grid gap-2 text-sm text-ink-soft sm:grid-cols-3">
          <li className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className="shrink-0 font-semibold text-accent tabular-nums"
            >
              1.
            </span>
            Kirim <SyntaxChip text="/lapor" /> di grup WhatsApp
          </li>
          <li className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className="shrink-0 font-semibold text-accent tabular-nums"
            >
              2.
            </span>
            Bot membalas &amp; progresmu tercatat
          </li>
          <li className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className="shrink-0 font-semibold text-accent tabular-nums"
            >
              3.
            </span>
            Cek ranking-mu di leaderboard web
          </li>
        </ol>
        <p className="mt-3 text-xs text-ink-muted leading-relaxed">
          Semua command bisa pakai awalan{" "}
          <span className="font-medium text-ink">/</span> atau{" "}
          <span className="font-medium text-ink">#</span> - fungsinya identik.
          Bot hanya merespon di grup yang sudah dikonfigurasi.
        </p>
      </div>

      {WHATSAPP_CATEGORIES.map((category, i) => (
        <CategorySection key={category.id} category={category} index={i} />
      ))}
    </div>
  );
}

function WebsiteGuide() {
  return (
    <div className="space-y-10">
      <section aria-labelledby="website-steps-heading">
        <header>
          <h3
            id="website-steps-heading"
            className="flex items-center gap-2 text-base sm:text-lg font-semibold text-ink"
          >
            <Globe size={18} className="shrink-0 text-ink-soft" aria-hidden="true" />
            Dari Penonton Jadi Hunter
          </h3>
          <p className="mt-1.5 text-sm text-ink-muted leading-relaxed max-w-2xl">
            {WEBSITE_URL} - semua fitur di bawah berbagi data yang sama dengan
            bot WhatsApp.
          </p>
        </header>
        <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WEBSITE_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="rounded-lg border border-border bg-panel shadow-xs p-4 sm:p-5"
              >
                <div className="flex items-center justify-between">
                  <Icon size={20} className="text-ink-soft" aria-hidden="true" />
                  <span
                    aria-hidden="true"
                    className="text-xs font-semibold text-ink-muted tabular-nums"
                  >
                    {i + 1}
                  </span>
                </div>
                <h4 className="mt-3 text-sm font-semibold text-ink">
                  {step.title}
                </h4>
                <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="website-note-heading">
        <div className="flex items-start gap-3 rounded-lg border border-border bg-page-sunken p-4 sm:p-5">
          <CalendarClock
            size={18}
            className="mt-0.5 shrink-0 text-info"
            aria-hidden="true"
          />
          <div>
            <h4
              id="website-note-heading"
              className="text-sm font-semibold text-ink"
            >
              Satu Akun, Dua Pintu
            </h4>
            <p className="mt-1 text-sm text-ink-soft leading-relaxed">
              Laporan dari web dan WhatsApp masuk ke streak, XP, dan leaderboard
              yang sama. Kuota 3x/hari juga dibagi - lapor lewat mana pun,
              progresnya tetap satu.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

type Platform = "whatsapp" | "website";

const PLATFORMS: { id: Platform; label: string; icon: LucideIcon }[] = [
  { id: "whatsapp", label: "Bot WhatsApp", icon: MessageCircle },
  { id: "website", label: "Website", icon: Globe },
];

interface CommandsPageProps {
  /** Navigate back to the leaderboard dashboard. */
  onBack: () => void;
}

/**
 * Public "Panduan & Commands" page - reachable from the leaderboard so people
 * who have never used the bot can learn every WhatsApp command and website
 * feature before joining.
 */
export function CommandsPage({ onBack }: CommandsPageProps) {
  const [platform, setPlatform] = useState<Platform>("whatsapp");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <button
          type="button"
          onClick={onBack}
          className="flex min-h-[44px] items-center gap-1.5 rounded-md border border-border bg-panel px-4 text-sm text-ink-soft transition-colors hover:bg-panel-raised hover:text-ink"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          Kembali ke Leaderboard
        </button>
        <div className="mt-3 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
            <Terminal size={20} className="text-accent" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-ink sm:text-2xl">
              Panduan &amp; Commands
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              Semua cara memakai Lapor Bot - di WhatsApp dan di website. Klik
              command mana pun untuk menyalinnya.
            </p>
          </div>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Pilih platform panduan"
        className="mb-8 flex w-full flex-nowrap overflow-x-auto scrollbar-none rounded-md bg-page-sunken p-1 sm:w-auto sm:max-w-fit"
      >
        {PLATFORMS.map((p) => {
          const Icon = p.icon;
          const active = platform === p.id;
          return (
            <button
              key={p.id}
              role="tab"
              id={`commands-tab-${p.id}`}
              aria-selected={active}
              aria-controls={`commands-panel-${p.id}`}
              onClick={() => setPlatform(p.id)}
              className={`flex min-h-[40px] shrink-0 items-center gap-2 whitespace-nowrap rounded-sm px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-panel text-ink shadow-xs"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <Icon size={14} aria-hidden="true" />
              {p.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`commands-panel-${platform}`}
        aria-labelledby={`commands-tab-${platform}`}
      >
        {platform === "whatsapp" ? <WhatsAppGuide /> : <WebsiteGuide />}
      </div>

      <div className="mt-12 rounded-lg border border-border bg-panel p-5 text-center shadow-xs sm:p-6">
        <h3 className="text-base font-semibold text-ink">Siap Mulai?</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
          Kirim <span className="font-mono font-semibold text-ink">/lapor</span>{" "}
          pertamamu di grup WhatsApp, lalu kembali ke sini untuk melihat namamu
          naik di klasemen.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90"
        >
          <Trophy size={14} aria-hidden="true" />
          Lihat Leaderboard
        </button>
      </div>
    </div>
  );
}
