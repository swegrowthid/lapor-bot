import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

export function MotivationBanner() {
  const [quote, setQuote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/motivation")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.quote) setQuote(data.quote);
      })
      .catch(() => {
        if (!cancelled) setQuote(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!quote) return null;

  return (
    <div className="animate-fade-in rounded-lg border border-border bg-panel px-5 py-4 mb-6">
      <p className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
        <Sparkles size={12} className="text-gold" aria-hidden="true" />
        Pep talk hari ini
      </p>
      <p className="text-sm text-ink-soft mt-1.5">
        &ldquo;{quote}&rdquo;
      </p>
    </div>
  );
}
