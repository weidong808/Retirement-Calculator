import { APP_TAGLINE, SITE_SERIES_NAME } from "@/lib/brand";
import { Container } from "@/components/Container";
import { SeriesAppsStrip } from "@/components/SeriesAppsStrip";

interface PageHeroProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  showSeriesStrip?: boolean;
}

export function PageHero({
  eyebrow = `${SITE_SERIES_NAME} · Free US retirement planner`,
  title = APP_TAGLINE,
  subtitle = "Estimates only — not financial advice. Simplified US tax and Social Security rules.",
  showSeriesStrip = true,
}: PageHeroProps) {
  return (
    <section className="page-hero">
      <div
        aria-hidden
        className="page-hero-grid bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_90%_80%_at_25%_0%,black,transparent_75%)]"
      />
      <Container className="page-hero-inner">
        <p className="animate-fade-up page-hero-eyebrow">
          <span aria-hidden className="bg-accent animate-pulse-dot h-1.5 w-1.5 rounded-full" />
          {eyebrow}
        </p>
        <h1 className="animate-fade-up page-hero-title delay-1">{title}</h1>
        <p className="animate-fade-up page-hero-subtitle delay-2">{subtitle}</p>
        {showSeriesStrip ? (
          <div className="animate-fade-up delay-3">
            <SeriesAppsStrip />
          </div>
        ) : null}
      </Container>
    </section>
  );
}
