import { useState, type FormEvent } from "react";
import {
  LogIn,
  ArrowLeft,
  Phone,
  User,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@lapor-bot/shared";
import type { EnrichedReport } from "@lapor-bot/shared";

interface LoginPageProps {
  onLoginSuccess: (user: EnrichedReport) => void;
  onBack: () => void;
}

export function LoginPage({ onLoginSuccess, onBack }: LoginPageProps) {
  const [countryCode, setCountryCode] = useState("62");
  const [phone, setPhone] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const { login, loading, error: authError } = useAuth();

  const error = validationError || authError;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!countryCode || !/^\d+$/.test(countryCode)) {
      setValidationError("Kode negara wajib diisi (angka saja).");
      return;
    }

    const digits = phone.replace(/\D/g, "");
    if (!digits) {
      setValidationError("Nomor telepon wajib diisi.");
      return;
    }
    if (digits.length < 6 || digits.length > 14) {
      setValidationError("Nomor harus 6-14 digit (tanpa kode negara).");
      return;
    }

    const user = await login(`${countryCode}${digits}`);
    if (user) {
      onLoginSuccess(user);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-panel p-6 shadow-md sm:p-8 animate-scale-in">
        <div className="flex items-start gap-3 mb-6">
          <button
            onClick={onBack}
            className="h-10 w-10 shrink-0 inline-flex items-center justify-center rounded-md border border-border bg-panel text-ink-soft hover:bg-panel-raised hover:text-ink transition-colors"
            title="Kembali"
            aria-label="Kembali"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
              <User className="text-accent" size={18} />
              Akses Personal
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              Masuk dengan nomor HP yang sudah pernah lapor
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-phone"
              className="block text-xs font-medium text-ink-soft mb-1.5"
            >
              Nomor Telepon
            </label>
            <div className="flex gap-2">
              <div className="relative shrink-0">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted pointer-events-none">
                  +
                </span>
                <input
                  type="text"
                  value={countryCode}
                  onChange={(e) =>
                    setCountryCode(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="62"
                  maxLength={3}
                  aria-label="Kode negara"
                  className="w-16 min-h-[44px] pl-6 pr-2 rounded-md bg-panel border border-border text-sm text-ink tabular-nums placeholder:text-ink-faint focus:border-border-strong transition-colors"
                  disabled={loading}
                />
              </div>
              <div className="relative flex-1">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                  size={14}
                />
                <input
                  id="login-phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="8xxxxxx"
                  maxLength={14}
                  className="w-full min-h-[44px] pl-9 pr-3 rounded-md bg-panel border border-border text-sm text-ink placeholder:text-ink-faint focus:border-border-strong transition-colors"
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-danger-soft border border-danger/25 flex items-start gap-2">
              <AlertCircle
                className="text-danger mt-0.5 shrink-0"
                size={14}
              />
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 px-5 rounded-md bg-accent text-accent-fg text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <LogIn size={16} />
            )}
            {loading ? "Memeriksa nomor..." : "Masuk"}
          </button>
        </form>

        <p className="text-xs text-ink-muted mt-5 text-center">
          Nomor HP harus sudah pernah lapor di grup sebelumnya.
        </p>
      </div>
    </div>
  );
}
