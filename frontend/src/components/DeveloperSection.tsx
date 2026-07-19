import { buildFeedbackMailto, developerInitials, getDeveloperProfile } from "@/lib/developer";
import {
  LINKEDIN_ARTICLE_LABEL,
  LINKEDIN_ARTICLE_URL,
  SITE_CASE_STUDY_LABEL,
  SITE_CASE_STUDY_URL,
  SITE_INSIGHT_LABEL,
  SITE_INSIGHT_URL,
  SITE_HOME_LABEL,
  SITE_HOME_URL,
  SITE_SERIES_NAME,
} from "@/lib/brand";

export function DeveloperSection() {
  const profile = getDeveloperProfile();

  return (
    <section className="about-developer" id="developer">
      <h2 className="about-developer-heading">Built by</h2>

      <div className="about-developer-card">
        <div className="about-developer-avatar" aria-hidden>
          {developerInitials(profile.name)}
        </div>
        <div className="about-developer-body">
          <h3>{profile.name}</h3>
          <p className="about-developer-title">{profile.title}</p>
          <p className="about-developer-bio">{profile.bio}</p>
          <p className="about-developer-series">
            <a
              href={SITE_HOME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="about-developer-series-link"
            >
              {SITE_SERIES_NAME} on {SITE_HOME_LABEL} ↗
            </a>
          </p>
        </div>
      </div>

      <h3 className="about-developer-connect-heading">Get in touch</h3>
      <div className="about-developer-links">
        <a
          href={SITE_HOME_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="about-developer-link"
        >
          {SITE_HOME_LABEL} ↗
        </a>
        <a
          href={SITE_CASE_STUDY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="about-developer-link"
        >
          {SITE_CASE_STUDY_LABEL} ↗
        </a>
        <a
          href={SITE_INSIGHT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="about-developer-link"
        >
          {SITE_INSIGHT_LABEL} ↗
        </a>
        <a
          href={LINKEDIN_ARTICLE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="about-developer-link"
        >
          {LINKEDIN_ARTICLE_LABEL} ↗
        </a>
        {profile.email && (
          <a
            href={`mailto:${profile.email}`}
            className="about-developer-link"
            aria-label={`Contact via email at ${profile.email}`}
          >
            ✉ Email
          </a>
        )}
        {profile.linkedIn && (
          <a
            href={profile.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            className="about-developer-link"
          >
            LinkedIn profile ↗
          </a>
        )}
        <a
          href={profile.githubProfile}
          target="_blank"
          rel="noopener noreferrer"
          className="about-developer-link"
        >
          GitHub profile ↗
        </a>
        {profile.email && (
          <a
            href={buildFeedbackMailto(profile.email)}
            className="about-developer-link about-developer-link-accent"
          >
            Send feedback
          </a>
        )}
      </div>

      {!profile.email && (
        <p className="about-developer-hint">
          Add your email in <code>frontend/.env.local</code> as{" "}
          <code>NEXT_PUBLIC_CONTACT_EMAIL</code> to show a contact link here.
        </p>
      )}
    </section>
  );
}
