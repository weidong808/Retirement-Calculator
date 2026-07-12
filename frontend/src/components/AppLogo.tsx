"use client";

import { useId } from "react";
import { APP_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  size?: number;
  showWordmark?: boolean;
  layout?: "row" | "stacked";
  variant?: "light" | "dark";
}

export function AppLogo({
  size = 48,
  showWordmark = false,
  layout = "stacked",
  variant = "light",
}: AppLogoProps) {
  const gradId = useId();
  const sunId = useId();
  const textColor = variant === "light" ? "#ffffff" : "var(--foreground)";
  const subColor = variant === "light" ? "rgba(255,255,255,0.88)" : "var(--muted)";
  const accentColor = variant === "light" ? "#34d399" : "var(--accent)";

  return (
    <div
      className={cn(
        "app-logo",
        showWordmark && layout === "stacked" && "app-logo--stacked",
        showWordmark && layout === "row" && "app-logo--row"
      )}
      style={{ gap: showWordmark ? undefined : 0 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="app-logo-mark shrink-0"
      >
        <rect width="64" height="64" rx="14" fill={`url(#${gradId})`} />
        <path
          d="M6 42C16 38 26 40 34 36C42 32 50 34 58 30V50H6V42Z"
          fill="#059669"
          opacity="0.45"
        />
        <line x1="6" y1="42" x2="58" y2="42" stroke="#34d399" strokeWidth="1.5" opacity="0.6" />
        <circle cx="20" cy="42" r="9" fill="#f59e0b" />
        <circle cx="20" cy="42" r="9" fill={`url(#${sunId})`} opacity="0.35" />
        <path
          d="M10 44L22 36L34 32L46 24"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />
        <circle cx="48" cy="20" r="11" fill="#059669" />
        <path
          d="M42 20L46.5 24.5L54 16"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="64" y2="64">
            <stop stopColor="#1a3a5c" />
            <stop offset="1" stopColor="#0f6e56" />
          </linearGradient>
          <radialGradient id={sunId} cx="0.5" cy="0.5" r="0.5">
            <stop stopColor="#fef3c7" />
            <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
      {showWordmark && (
        <div className="app-logo-text">
          <span className="app-logo-title" style={{ color: textColor }}>
            Retire<span className="app-logo-accent" style={{ color: accentColor }}>Check</span>
          </span>
          {layout === "stacked" && (
            <span className="app-logo-tagline" style={{ color: subColor }}>
              {APP_TAGLINE}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
