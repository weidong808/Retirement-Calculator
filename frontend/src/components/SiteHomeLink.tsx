import Image from "next/image";
import {
  SITE_HOME_LABEL,
  SITE_HOME_URL,
  SITE_SERIES_NAME,
  WS_MARK_SRC,
} from "@/lib/brand";

type SiteHomeLinkProps = {
  /** Compact = mark + domain (header). Full = mark + series label (footer). */
  variant?: "compact" | "full";
  className?: string;
  markSize?: number;
};

/** Parent-brand link back to weidong-shi.com — same mark as the personal site. */
export function SiteHomeLink({
  variant = "compact",
  className,
  markSize = 16,
}: SiteHomeLinkProps) {
  return (
    <a
      href={SITE_HOME_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: variant === "full" ? "0.55rem" : "0.4rem",
        textDecoration: "none",
      }}
      aria-label={`${SITE_HOME_LABEL} — ${SITE_SERIES_NAME}`}
    >
      <Image
        src={WS_MARK_SRC}
        alt=""
        width={markSize}
        height={markSize}
        unoptimized
        style={{ borderRadius: 4, flexShrink: 0 }}
      />
      <span
        style={{
          display: "inline-flex",
          flexDirection: "column",
          lineHeight: 1.15,
          minWidth: 0,
        }}
      >
        <span>{SITE_HOME_LABEL}</span>
        {variant === "full" ? (
          <span
            style={{
              marginTop: 2,
              fontSize: "0.65rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              opacity: 0.75,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            {SITE_SERIES_NAME}
          </span>
        ) : null}
      </span>
    </a>
  );
}
