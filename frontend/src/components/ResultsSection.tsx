"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { CountUpValue, ScoreGauge } from "@/components/ScoreGauge";
import { ShareCardButton } from "@/components/ShareCardButton";
import type { RetirementPlanResult } from "@/types/retirement";
import { formatCurrency, formatPercent } from "@/lib/format";

/** Axis / tooltip helpers — values stored in millions or thousands. */
const tickM = (v: number) => `$${v}M`;
const tickK = (v: number) => `$${v}k`;
const tipM = (v: unknown) => formatCurrency(Number(v ?? 0) * 1_000_000);
const tipK = (v: unknown) => formatCurrency(Number(v ?? 0) * 1_000);
const fmtM = (v: unknown, name: unknown) => [tipM(v), String(name ?? "")] as [string, string];
const fmtK = (v: unknown, name: unknown) => [tipK(v), String(name ?? "")] as [string, string];
const chartTooltipStyle = {
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px rgba(15, 40, 70, 0.12)",
  fontSize: 13,
} as const;

interface ResultsSectionProps {
  result: RetirementPlanResult;
  targetRetirementAge: number;
  maritalStatus: string;
  onEditAnswers?: () => void;
  onStartOver?: () => void;
}

function successCategory(rate: number) {
  if (rate > 90) return { label: "Strong", headline: "Your plan looks solid", detail: "High chance your savings may last through your planning horizon." };
  if (rate > 75) return { label: "Good", headline: "Your plan looks reasonable", detail: "A decent chance of success, but small changes could help." };
  if (rate > 50) return { label: "Fair", headline: "Your plan may need adjustments", detail: "Consider saving more, spending less, or retiring later." };
  return { label: "At risk", headline: "Your plan may fall short", detail: "Review spending, savings rate, or retirement timing." };
}

export function ResultsSection({
  result,
  targetRetirementAge,
  maritalStatus,
  onEditAnswers,
  onStartOver,
}: ResultsSectionProps) {
  const { summary, monteCarlo } = result;
  const success = successCategory(summary.successRate);

  const percentileData = Object.entries(monteCarlo.percentiles)
    .slice(0, 31)
    .map(([year, band]) => ({
      age: summary.yourAge + Number(year),
      p10: band.p10 / 1_000_000,
      p50: band.p50 / 1_000_000,
      p90: band.p90 / 1_000_000,
      // stacked band: invisible base at p10, shaded height = p90 − p10
      bandBase: band.p10 / 1_000_000,
      bandHeight: (band.p90 - band.p10) / 1_000_000,
    }));

  const portfolioData = result.yearByYear.map((row) => ({
    age: row.age,
    preTax: row.preTax / 1_000_000,
    roth: row.roth / 1_000_000,
    taxable: row.taxable / 1_000_000,
  }));

  const taxData = result.yearByYear
    .filter((row) => row.federalTax > 0 || row.irmaa > 0)
    .slice(0, 30)
    .map((row) => ({
      age: row.age,
      federal: row.federalTax / 1000,
      medicare: row.irmaa / 1000,
    }));

  const stressData = result.stressTest.map((row) => ({
    year: row.year,
    base: row.base / 1_000_000,
    stress: row.stress / 1_000_000,
  }));

  return (
    <div className="results-section">
      <div className="results-toolbar">
        <ShareCardButton
          successRate={summary.successRate}
          outlookLabel={success.label}
          portfolioAtRetirement={result.portfolioAtRetirement}
          targetRetirementAge={targetRetirementAge}
          claimAge={summary.claimAge}
        />
        {onEditAnswers && (
          <button type="button" className="btn-outline" onClick={onEditAnswers}>
            Edit my answers
          </button>
        )}
        {onStartOver && (
          <button type="button" className="btn-secondary" onClick={onStartOver}>
            Start over
          </button>
        )}
      </div>

      <div className="results-hero">
        <div className="results-hero-top">
          <ScoreGauge rate={summary.successRate} />
          <div className="results-hero-headline">
            <span className="results-hero-badge">{success.label} outlook · 1,000 simulations</span>
            <h2>{success.headline}</h2>
            <p>{success.detail}</p>
          </div>
        </div>
        <div className="results-hero-stats">
          <div className="results-hero-stat">
            <div className="results-hero-stat-label">At retirement (age {targetRetirementAge})</div>
            <div className="results-hero-stat-value">
              <CountUpValue value={result.portfolioAtRetirement} format={formatCurrency} />
            </div>
          </div>
          <div className="results-hero-stat">
            <div className="results-hero-stat-label">Yearly spending</div>
            <div className="results-hero-stat-value">
              <CountUpValue value={summary.annualSpending} format={formatCurrency} />
            </div>
          </div>
          <div className="results-hero-stat">
            <div className="results-hero-stat-label">Left at age 90 (typical)</div>
            <div className="results-hero-stat-value">
              <CountUpValue value={summary.estateAt90} format={formatCurrency} />
            </div>
          </div>
          <div className="results-hero-stat">
            <div className="results-hero-stat-label">Social Security start</div>
            <div className="results-hero-stat-value">Age {summary.claimAge}</div>
          </div>
        </div>
      </div>

      <h2 className="section-title">Key numbers</h2>
      <p className="section-desc">A quick snapshot based on your inputs and assumptions.</p>
      <div className="dashboard-cards">
        <div className={`card ${success.label === "Strong" || success.label === "Good" ? "success" : success.label === "Fair" ? "warning" : "danger"}`}>
          <div className="card-label">Plan may last until</div>
          <div className="card-value">Age {summary.lifeExpectancy}</div>
          <div className="card-subtext">{success.label} outlook ({formatPercent(summary.successRate)} simulations)</div>
        </div>
        <div className="card success">
          <div className="card-label">Full Social Security age</div>
          <div className="card-value">{summary.fullRetirementAgeLabel}</div>
          <div className="card-subtext">Based on your birth year · you are {summary.yourAge} today</div>
        </div>
        <div className="card success">
          <div className="card-label">Savings at retirement</div>
          <div className="card-value">{formatCurrency(result.portfolioAtRetirement)}</div>
          <div className="card-subtext">All accounts combined</div>
        </div>
      </div>

      <CollapsibleSection title="Compare different retirement ages" hint="See how retiring earlier or later changes the picture">
        <p className="section-desc">The highlighted row is your chosen retirement age.</p>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Retire at</th>
                <th>Savings at retirement</th>
                <th>Years to fund</th>
                <th>Monthly from savings</th>
                <th>Years before Medicare</th>
                <th>Plan success</th>
                <th>Left at 90</th>
              </tr>
            </thead>
            <tbody>
              {result.ageComparison.map((row) => (
                <tr key={row.age} className={row.age === targetRetirementAge ? "highlighted" : ""}>
                  <td>Age {row.age}</td>
                  <td>{formatCurrency(row.portfolio)}</td>
                  <td>{row.yearsNeeded}</td>
                  <td>{formatCurrency(row.monthlyIncome)}</td>
                  <td>{row.healthcareGap}</td>
                  <td>{formatPercent(row.successRate)}</td>
                  <td>{formatCurrency(row.estate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Social Security: when to start?" hint="Compare monthly checks at different ages">
        <p className="section-desc">Your benefits at each claiming age. Highlighted row = your choice.</p>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Start at age</th>
                <th>Monthly check</th>
                <th>Yearly total</th>
                <th>Total by 85</th>
                <th>Total by 90</th>
                <th>Break-even vs full age</th>
                <th>vs waiting until 70</th>
              </tr>
            </thead>
            <tbody>
              {result.yourSsClaiming.map((row) => (
                <tr key={row.claimAge} className={row.claimAge === summary.claimAge ? "highlighted" : ""}>
                  <td>{row.claimAge}</td>
                  <td>{formatCurrency(row.monthlyBenefit)}</td>
                  <td>{formatCurrency(row.annualBenefit)}</td>
                  <td>{formatCurrency(row.lifetimeTo85)}</td>
                  <td>{formatCurrency(row.lifetimeTo90)}</td>
                  <td>{row.breakeven}</td>
                  <td>{row.vs70}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="breakeven-box">
          Break-even is when total benefits from starting earlier catch up to starting later.
        </div>

        {maritalStatus === "Married" && result.spouseSsClaiming.length > 0 && (
          <>
            <p className="section-desc">Spouse&apos;s benefits at each claiming age</p>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Start at age</th>
                    <th>Monthly check</th>
                    <th>Yearly total</th>
                    <th>Total by 85</th>
                    <th>Total by 90</th>
                    <th>Break-even vs full age</th>
                    <th>vs waiting until 70</th>
                  </tr>
                </thead>
                <tbody>
                  {result.spouseSsClaiming.map((row) => (
                    <tr key={row.claimAge}>
                      <td>{row.claimAge}</td>
                      <td>{formatCurrency(row.monthlyBenefit)}</td>
                      <td>{formatCurrency(row.annualBenefit)}</td>
                      <td>{formatCurrency(row.lifetimeTo85)}</td>
                      <td>{formatCurrency(row.lifetimeTo90)}</td>
                      <td>{row.breakeven}</td>
                      <td>{row.vs70}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="Market uncertainty (1,000 scenarios)"
        hint="How your savings might grow or shrink"
        defaultOpen
      >
        <p className="section-desc">
          In {formatPercent(summary.successRate)} of 1,000 simulated markets, your savings lasted
          through the plan. The shaded band covers the middle 80% of outcomes.
        </p>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={percentileData}>
              <defs>
                <linearGradient id="fanBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.06} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="age" tickLine={false} axisLine={{ stroke: "#e2e8f0" }} label={{ value: "Age", position: "insideBottomRight", offset: -4, fontSize: 12 }} />
              <YAxis tickFormatter={tickM} tickLine={false} axisLine={false} width={56} />
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(v: unknown, name: unknown) =>
                  String(name) === "Range (best–worst 10%)" ? fmtM(v, "Middle 80% band") : fmtM(v, name)
                }
                labelFormatter={(age) => `Age ${age}`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="bandBase"
                stackId="band"
                stroke="none"
                fill="transparent"
                legendType="none"
                isAnimationActive={false}
                name=" "
              />
              <Area
                type="monotone"
                dataKey="bandHeight"
                stackId="band"
                stroke="none"
                fill="url(#fanBand)"
                name="Range (best–worst 10%)"
              />
              <Line type="monotone" dataKey="p90" stroke="#10b981" dot={false} strokeWidth={1.5} strokeDasharray="4 4" name="Best 10%" />
              <Line type="monotone" dataKey="p50" stroke="#0f766e" dot={false} strokeWidth={2.5} name="Typical outcome" />
              <Line type="monotone" dataKey="p10" stroke="#ef4444" dot={false} strokeWidth={1.5} strokeDasharray="4 4" name="Worst 10%" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Savings over time" hint="How each account type may change">
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={portfolioData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="age" tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
              <YAxis tickFormatter={tickM} tickLine={false} axisLine={false} width={56} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={fmtM} labelFormatter={(age) => `Age ${age}`} />
              <Legend />
              <Line type="monotone" dataKey="preTax" stroke="#0f766e" dot={false} strokeWidth={2} name="401k / IRA" />
              <Line type="monotone" dataKey="roth" stroke="#10b981" dot={false} strokeWidth={2} name="Roth" />
              <Line type="monotone" dataKey="taxable" stroke="#f59e0b" dot={false} strokeWidth={2} name="Brokerage" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Taxes & Medicare surcharges" hint="Federal tax and higher Medicare costs (IRMAA)">
        <div className="chart-box mb-4">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={taxData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="age" tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
              <YAxis tickFormatter={tickK} tickLine={false} axisLine={false} width={56} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={fmtK} labelFormatter={(age) => `Age ${age}`} />
              <Legend />
              <Bar dataKey="federal" stackId="a" fill="#0f766e" name="Federal tax" radius={[0, 0, 0, 0]} />
              <Bar dataKey="medicare" stackId="a" fill="#f59e0b" name="Medicare surcharge" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <tbody>
              <tr><td><strong>Total federal tax (lifetime estimate)</strong></td><td>{formatCurrency(result.totalFederalTax)}</td></tr>
              <tr><td><strong>Total state tax</strong></td><td>{formatCurrency(result.totalStateTax)}</td></tr>
              <tr><td><strong>Medicare income surcharges (IRMAA)</strong></td><td>{formatCurrency(result.totalIrmaa)}</td></tr>
              <tr><td><strong>Overall tax rate in retirement</strong></td><td>{formatPercent(result.effectiveTaxRate, 1)}</td></tr>
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="What if the market drops 30%?" hint="Stress test in year one of retirement">
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={stressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="year" tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
              <YAxis tickFormatter={tickM} tickLine={false} axisLine={false} width={56} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={fmtM} labelFormatter={(y) => `Year ${y}`} />
              <Legend />
              <Line type="monotone" dataKey="base" stroke="#10b981" dot={false} name="Normal market" strokeWidth={2.5} />
              <Line type="monotone" dataKey="stress" stroke="#ef4444" dot={false} name="30% drop in year 1" strokeDasharray="5 5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Inflation: buying power over time" hint="How far your spending dollar may stretch">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Age</th>
                <th>Year</th>
                <th>Buying power of $100k today</th>
                <th>Decline</th>
              </tr>
            </thead>
            <tbody>
              {result.inflationImpact.map((row) => (
                <tr key={row.age}>
                  <td>{row.age}</td>
                  <td>{row.year}</td>
                  <td>{formatCurrency(row.purchasingPower)}</td>
                  <td>{formatPercent(row.decline, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      <h2 className="section-title">Things to consider</h2>
      <div className="recommendations-grid">
        <div className="rec-box roth">
          <strong>Roth conversions</strong>
          <p>Moving money from a traditional IRA to Roth before required withdrawals (age 73) may lower future taxes.</p>
        </div>
        <div className="rec-box ss">
          <strong>Social Security timing</strong>
          <p>Starting at age {summary.claimAge} fits your inputs. Each year you wait (up to 70) raises your monthly benefit by about 8%.</p>
        </div>
        <div className="rec-box healthcare">
          <strong>Healthcare before Medicare</strong>
          <p>Plan for health costs if you retire before 65. A health savings account (HSA) can help with tax-free medical spending.</p>
        </div>
      </div>

      <div className="disclaimer">
        <strong>Disclaimer:</strong> For educational purposes only — not financial advice.
        Projections depend on your assumptions and can change significantly.
        Talk to a licensed advisor before major decisions. Official Social Security info:{" "}
        <a href="https://www.ssa.gov/planners/retire/" target="_blank" rel="noopener noreferrer">
          SSA.gov
        </a>
        .
      </div>
    </div>
  );
}
