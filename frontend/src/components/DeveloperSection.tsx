import { developerInitials, getDeveloperProfile } from "@/lib/developer";

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
        </div>
      </div>

      <h3 className="about-developer-connect-heading">Get in touch</h3>
      <div className="about-developer-links">
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
            LinkedIn ↗
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
        <a
          href={profile.githubRepo}
          target="_blank"
          rel="noopener noreferrer"
          className="about-developer-link"
        >
          View source ↗
        </a>
        <a
          href={profile.feedbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="about-developer-link about-developer-link-accent"
        >
          Send feedback ↗
        </a>
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
