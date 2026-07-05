export interface DeveloperProfile {
  name: string;
  title: string;
  bio: string;
  email: string;
  linkedIn: string;
  githubProfile: string;
  sourceRepo: string;
}

const DEFAULT_NAME = "Weidong";
const DEFAULT_TITLE = "Software engineer · RetireCheck creator";
const DEFAULT_BIO =
  "I built RetireCheck to help everyday Americans answer one question: will my money last in retirement? No jargon, no sign-up — just clear estimates you can act on.";
const DEFAULT_GITHUB_PROFILE = "https://github.com/weidong808";
const DEFAULT_SOURCE_REPO = "https://github.com/weidong808/Retirement-Calculator";

function trim(v: string | undefined): string {
  return v?.trim() ?? "";
}

function normalizeUrl(url: string): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

/** Pre-filled mailto for feedback. */
export function buildFeedbackMailto(email: string): string {
  const subject = encodeURIComponent("RetireCheck feedback");
  return `mailto:${email}?subject=${subject}`;
}

export function getDeveloperProfile(): DeveloperProfile {
  const githubProfile =
    normalizeUrl(trim(process.env.NEXT_PUBLIC_DEVELOPER_GITHUB_PROFILE)) ||
    DEFAULT_GITHUB_PROFILE;

  return {
    name: trim(process.env.NEXT_PUBLIC_DEVELOPER_NAME) || DEFAULT_NAME,
    title: trim(process.env.NEXT_PUBLIC_DEVELOPER_TITLE) || DEFAULT_TITLE,
    bio: trim(process.env.NEXT_PUBLIC_DEVELOPER_BIO) || DEFAULT_BIO,
    email: trim(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
    linkedIn: normalizeUrl(trim(process.env.NEXT_PUBLIC_DEVELOPER_LINKEDIN)),
    githubProfile,
    sourceRepo:
      normalizeUrl(trim(process.env.NEXT_PUBLIC_SOURCE_REPO_URL)) ||
      DEFAULT_SOURCE_REPO,
  };
}

export function developerInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
