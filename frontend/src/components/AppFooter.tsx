import Link from "next/link";
import { APP_NAME } from "@/lib/brand";
import { getDeveloperProfile } from "@/lib/developer";

export function AppFooter() {
  const profile = getDeveloperProfile();

  return (
    <footer className="app-footer">
      <nav className="app-footer-nav" aria-label="Footer">
        <Link href="/about">About</Link>
        <Link href="/about#developer">Built by</Link>
        <a href="https://www.ssa.gov/planners/retire/" target="_blank" rel="noopener noreferrer">
          SSA.gov
        </a>
        {profile.email ? (
          <a href={`mailto:${profile.email}`}>Contact</a>
        ) : (
          <a href={profile.feedbackUrl} target="_blank" rel="noopener noreferrer">
            Feedback
          </a>
        )}
        {profile.linkedIn && (
          <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        )}
      </nav>
      <p className="app-footer-built">
        Built by{" "}
        {profile.linkedIn ? (
          <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer">
            {profile.name}
          </a>
        ) : (
          <a href={profile.githubProfile} target="_blank" rel="noopener noreferrer">
            {profile.name}
          </a>
        )}
      </p>
      <p className="app-footer-disclaimer">
        Estimates only — not financial advice. Your data is not stored.
      </p>
      <p className="app-footer-copy">© {new Date().getFullYear()} {APP_NAME}</p>
    </footer>
  );
}
