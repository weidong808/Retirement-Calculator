import { AboutPageContent } from "@/components/AboutPageContent";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { Container } from "@/components/Container";
import { PageHero } from "@/components/PageHero";

export default function AboutPage() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <AppHeader />
      <main id="main" className="page-wrap">
        <PageHero
          eyebrow="AI in Action · About RetireCheck"
          title="How this calculator works"
          subtitle="Transparent estimates, clear disclaimers, and math you can trust in a tested domain layer."
          showSeriesStrip={false}
        />
        <Container className="page-content">
          <div className="calculator-shell">
            <AboutPageContent />
          </div>
        </Container>
      </main>
      <AppFooter />
    </>
  );
}
