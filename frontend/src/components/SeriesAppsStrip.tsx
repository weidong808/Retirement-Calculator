import {
  HABITCHECK_URL,
  READINESS_URL,
  SITE_SERIES_NAME,
  SLEEPCHECK_URL,
} from "@/lib/brand";

const SIBLINGS = [
  { name: "HabitCheck", href: HABITCHECK_URL },
  { name: "SleepCheck", href: SLEEPCHECK_URL },
  { name: "Readiness", href: READINESS_URL },
] as const;

/** Compact series framing under the page hero. */
export function SeriesAppsStrip({ className = "" }: { className?: string }) {
  return (
    <nav
      aria-label={`Also in ${SITE_SERIES_NAME}`}
      className={`series-apps-strip ${className}`.trim()}
    >
      <p className="series-apps-strip-label">Also in {SITE_SERIES_NAME}</p>
      <ul className="series-apps-strip-list">
        {SIBLINGS.map((app, i) => (
          <li key={app.href}>
            {i > 0 ? <span aria-hidden>·</span> : null}
            <a href={app.href} target="_blank" rel="noopener noreferrer">
              {app.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
