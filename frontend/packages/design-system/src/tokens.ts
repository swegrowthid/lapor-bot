/**
 * Structural design tokens for the Lapor Bot design system.
 *
 * Single source of truth for: spacing, radius, typography, elevation, motion,
 * and the THEME ROLE NAME contract used by web components.
 *
 * Color VALUES for the light and dark themes live in ./tokens.css (one CSS
 * file, switched at runtime via [data-theme]). That file is the single source
 * for color; every variable block below points at the corresponding CSS
 * custom property name. If you rename a CSS custom property in tokens.css,
 * update `colorRole` here in the same change.
 *
 * Design principles encoded here:
 * - Light is the default theme; dark is a first-class tuned theme.
 * - 4px spacing grid; generous gutters beat tight density on a leaderboard.
 * - One workhorse sans (Inter); hierarchy via size + weight, never via a
 *   decorative display font. Numbers are rendered with tabular lining
 *   numerals by default in table/stat contexts (font-feature utilities).
 * - Flat surfaces: separation via border tokens + soft shadows, never neon
 *   glow.
 * - Semantic color only (positive/warning/danger/info + medal ranks); the
 *   accent green carries brand identity. Widget colors must pass >= 4.5:1
 *   contrast against their theme surface for text, >= 3:1 for large digits.
 */

export type ThemeName = "light" | "dark";

export const themeNames: ThemeName[] = ["light", "dark"];

/**
 * Theme variable role -> CSS custom property name. The web build maps these
 * into Tailwind theme namespaces (see apps/web/src/index.css).
 */
export const colorRole = {
  page: "--page",
  pageSunken: "--page-sunken",
  panel: "--panel",
  panelRaised: "--panel-raised",
  border: "--border",
  borderStrong: "--border-strong",
  ink: "--ink",
  inkSoft: "--ink-soft",
  inkMuted: "--ink-muted",
  inkFaint: "--ink-faint",
  accent: "--accent",
  accentFg: "--accent-fg",
  accentSoft: "--accent-soft",
  positive: "--positive",
  positiveSoft: "--positive-soft",
  warning: "--warning",
  warningSoft: "--warning-soft",
  danger: "--danger",
  dangerSoft: "--danger-soft",
  info: "--info",
  infoSoft: "--info-soft",
  gold: "--gold",
  goldSoft: "--gold-soft",
  silver: "--silver",
  silverSoft: "--silver-soft",
  bronze: "--bronze",
  bronzeSoft: "--bronze-soft",
} as const;

/** rem-based spacing scale on a 4px grid. index 0..6 common. */
export const spacing = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px",
} as const;

/** Corner radius tokens. `xl` is reserved for full-bleed panels. */
export const radii = {
  none: "0px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  full: "9999px",
} as const;

export const typography = {
  fontFamily: {
    sans: [
      "Inter",
      "ui-sans-serif",
      "system-ui",
      "-apple-system",
      "Segoe UI",
      "Roboto",
      "sans-serif",
    ],
    mono: [
      "ui-monospace",
      "SFMono-Regular",
      "Menlo",
      "Consolas",
      "monospace",
    ],
  },
  /** px sizes: body stays >= 14px per readability goal. */
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 44,
  },
  weight: { regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800 },
  /** Stat numerals may use `stat` line-height for tight big-number stacks. */
  lineHeight: { tight: 1.25, snug: 1.37, normal: 1.5 },
} as const;

/** Soft, non-glowing elevation. Dark theme relies mostly on borders. */
export const elevation = {
  none: "none",
  xs: "0 1px 2px rgba(16, 20, 28, 0.05)",
  sm: "0 1px 3px rgba(16, 20, 28, 0.07), 0 1px 2px rgba(16, 20, 28, 0.05)",
  md: "0 4px 12px rgba(16, 20, 28, 0.08)",
  lg: "0 12px 32px rgba(16, 20, 28, 0.14)",
} as const;

export const motion = {
  fast: "150ms",
  base: "200ms",
  slow: "300ms",
  immediate: "0ms",
  /** Verified spring-out ease used by pop/scale entrances. */
  easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
};

/** Minimum control height for touch targets (WCAG 2.5.5 friendly). */
export const minTouchTarget = 44;
