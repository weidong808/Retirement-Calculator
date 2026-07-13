import Link from "next/link";
import { Container } from "@/components/Container";
import { APP_NAME, SITE_HOME_URL } from "@/lib/brand";
import { getDeveloperProfile } from "@/lib/developer";

export function AppFooter() {
  const profile = getDeveloperProfile();
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <Container className="app-footer-inner">
        <div className="app-footer-top">
          <div>
            <p className="app-footer-brand">{APP_NAME}</p>
            <p className="app-footer-tagline">
              Free US retirement estimates — your data is not stored.
            </p>
          </div>
          <nav className="app-footer-nav" aria-label="Footer">
            <Link href="/about">About</Link>
            <Link href="/about#developer">Built by</Link>
            <a href={SITE_HOME_URL} target="_blank" rel="noopener noreferrer">
              weidong-shi.com
            </a>
            <a href="https://www.ssa.gov/planners/retire/" target="_blank" rel="noopener noreferrer">
              SSA.gov
            </a>
            {profile.email && (
              <a href={`mailto:${profile.email}`}>Contact</a>
            )}
            {profile.linkedIn && (
              <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            )}
            {profile.sourceRepo && (
              <a href={profile.sourceRepo} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            )}
          </nav>
        </div>
        <div className="app-footer-bottom">
          <p className="app-footer-disclaimer">
            Estimates only — not financial advice.
          </p>
          <p className="app-footer-copy">© {year} {APP_NAME}</p>
        </div>
      </Container>
    </footer>
  );
}
