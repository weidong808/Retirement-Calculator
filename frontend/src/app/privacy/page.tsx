import type { Metadata } from "next";
import Link from "next/link";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { Container } from "@/components/Container";
import { PageHero } from "@/components/PageHero";
import { APP_NAME, APP_URL, SITE_HOME_URL } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Privacy · ${APP_NAME}`,
  description: `How ${APP_NAME} handles calculator inputs, results, and page analytics.`,
};

export default function PrivacyPage() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <AppHeader />
      <main id="main" className="page-wrap">
        <PageHero
          eyebrow={`${APP_NAME} · Privacy`}
          title="Privacy"
          subtitle="What we collect, what we do not store, and how estimates stay educational."
          showSeriesStrip={false}
        />
        <Container className="page-content">
          <div className="calculator-shell">
            <div className="about-main">
              <section className="about-section">
                <div className="about-section-header">
                  <h2>Calculator inputs</h2>
                  <p>
                    Numbers you enter are sent to the API so {APP_NAME} can compute
                    projections. They are used for that request only and are{" "}
                    <strong>not stored</strong> as a saved plan or user profile.
                    There is no account and no login.
                  </p>
                </div>
              </section>

              <section className="about-section about-section-alt">
                <div className="about-section-header">
                  <h2>Analytics</h2>
                  <p>
                    The live site at{" "}
                    <a href={APP_URL} target="_blank" rel="noopener noreferrer">
                      {APP_URL.replace("https://", "")}
                    </a>{" "}
                    may record privacy-friendly page views via Vercel Analytics.
                    Financial inputs are not sent as analytics events.
                  </p>
                </div>
              </section>

              <section className="about-section">
                <div className="about-section-header">
                  <h2>Educational use only</h2>
                  <p>
                    Results are estimates for education — not financial, tax, or
                    legal advice. Official Social Security information lives on{" "}
                    <a
                      href="https://www.ssa.gov/planners/retire/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      SSA.gov
                    </a>
                    .
                  </p>
                </div>
              </section>

              <section className="about-section about-section-alt">
                <div className="about-section-header">
                  <h2>Related</h2>
                  <p>
                    Parent site:{" "}
                    <a href={SITE_HOME_URL} target="_blank" rel="noopener noreferrer">
                      weidong-shi.com
                    </a>
                    . More about how the calculator works:{" "}
                    <Link href="/about">About</Link>.
                  </p>
                </div>
              </section>

              <p className="about-back-link">
                <Link href="/" className="about-cta-primary about-cta-inline">
                  Back to calculator
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </main>
      <AppFooter />
    </>
  );
}
