import Link from "next/link";
import { APP_NAME } from "@/lib/brand";
import { DeveloperSection } from "@/components/DeveloperSection";

const FEATURES = [
  {
    icon: "📊",
    title: "Will my money last?",
    text: "See how long your savings may support your lifestyle — with thousands of market scenarios, not just one guess.",
  },
  {
    icon: "🗓️",
    title: "When should I retire?",
    text: "Compare retiring at different ages side by side — savings at retirement, monthly income, and plan success.",
  },
  {
    icon: "💵",
    title: "Social Security timing",
    text: "Compare starting benefits at 62 vs 67 vs 70 and see lifetime totals and break-even ages.",
  },
  {
    icon: "🏛️",
    title: "Taxes & healthcare costs",
    text: "Rough estimates for federal tax, state tax, and Medicare surcharges so surprises are smaller.",
  },
];

const STEPS = [
  {
    num: 1,
    title: "About you",
    text: "Birth date, when you want to retire, and how long to plan for. Pick your state for tax estimates.",
  },
  {
    num: 2,
    title: "Your money",
    text: "Choose ranges for savings, income, and spending — exact numbers optional. Takes about a minute.",
  },
  {
    num: 3,
    title: "Social Security",
    text: "Your expected monthly benefit and when you plan to start. Not sure? Use a range or check ssa.gov.",
  },
  {
    num: 4,
    title: "See your results",
    text: "Review your plan summary, charts, and comparisons. Edit answers or start over anytime.",
  },
];

const WHY_ITEMS = [
  {
    stat: "49%",
    label: "of workers",
    text: "have tried to figure out how much they need for retirement — many still feel unsure (EBRI 2024).",
  },
  {
    stat: "10+ yrs",
    label: "of choices",
    text: "Retirement age, Social Security timing, and spending each shift outcomes by hundreds of thousands.",
  },
  {
    stat: "0",
    label: "accounts needed",
    text: "No sign-up, no credit card. Run a plan in minutes and nothing you enter is stored on our servers.",
  },
];

export function AboutPageContent() {
  return (
    <>
      <div className="about-main">
        <div className="about-cta-bar">
          <Link href="/" className="about-cta-primary">
            Run your {APP_NAME} →
          </Link>
        </div>

        <section className="about-section">
          <div className="about-section-header">
            <h2>What {APP_NAME} does</h2>
            <p>A practical snapshot of your retirement — not a 200-page financial plan.</p>
          </div>
          <div className="about-feature-grid">
            {FEATURES.map((f) => (
              <article key={f.title} className="about-feature-card">
                <span className="about-feature-icon" aria-hidden>{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section about-section-alt">
          <div className="about-section-header">
            <h2>How to use it</h2>
            <p>Four quick steps — most people finish in under 5 minutes.</p>
          </div>
          <ol className="about-steps">
            {STEPS.map((s) => (
              <li key={s.num} className="about-step">
                <div className="about-step-num">{s.num}</div>
                <div className="about-step-body">
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="about-steps-cta">
            <Link href="/" className="about-cta-secondary">
              Try the calculator
            </Link>
          </div>
        </section>

        <section className="about-section">
          <div className="about-section-header">
            <h2>Why planning matters</h2>
            <p>Retirement isn&apos;t one number — it&apos;s a set of choices that compound over decades.</p>
          </div>
          <div className="about-why-grid">
            {WHY_ITEMS.map((w) => (
              <article key={w.label} className="about-why-card">
                <div className="about-why-stat">{w.stat}</div>
                <div className="about-why-label">{w.label}</div>
                <p>{w.text}</p>
              </article>
            ))}
          </div>
          <div className="about-callout">
            <h3>You don&apos;t need to be an expert</h3>
            <p>
              Pick ranges if you&apos;re not sure of exact balances. Adjust assumptions later.
              Use results to ask better questions — with SSA.gov, your employer plan, or a
              licensed financial advisor.
            </p>
          </div>
        </section>

        <section className="about-trust-grid">
          <article className="about-trust-card about-trust-disclaimer">
            <h3>Estimates only</h3>
            <p>
              Not financial, tax, or legal advice. We use simplified US rules; real life is
              messier. Official Social Security info:{" "}
              <a href="https://www.ssa.gov/planners/retire/" target="_blank" rel="noopener noreferrer">
                SSA.gov
              </a>
              .
            </p>
          </article>
          <article className="about-trust-card about-trust-privacy">
            <h3>Your privacy</h3>
            <p>
              Inputs are used to run calculations and are <strong>not stored</strong> on our
              servers. No account, and financial details are not used as analytics events.
              The live site may record privacy-friendly page views (Vercel Analytics).{" "}
              <Link href="/privacy">Full privacy page</Link>.
            </p>
          </article>
        </section>

        <DeveloperSection />

        <p className="about-back-link">
          <Link href="/" className="about-cta-primary about-cta-inline">
            Back to calculator
          </Link>
        </p>
      </div>
    </>
  );
}
