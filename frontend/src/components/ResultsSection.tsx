"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { RetirementPlanResult } from "@/types/retirement";
import { formatCurrency, formatPercent } from "@/lib/format";

interface ResultsSectionProps {
  result: RetirementPlanResult;
  targetRetirementAge: number;
  maritalStatus: string;
}

const PIE_COLORS = ["#059669", "#f59e0b", "#f97316", "#dc2626"];

function successCategory(rate: number) {
  if (rate > 90) return { label: "Excellent", color: "success" as const };
  if (rate > 75) return { label: "Good", color: "warning" as const };
  return { label: "Fair", color: "danger" as const };
}

export function ResultsSection({
  result,
  targetRetirementAge,
  maritalStatus,
}: ResultsSectionProps) {
  const { summary, monteCarlo } = result;
  const success = successCategory(summary.successRate);

  const percentileData = Object.entries(monteCarlo.percentiles)
    .slice(0, 31)
    .map(([year, band]) => ({
      age: 45 + Number(year),
      p10: band.p10 / 1_000_000,
      p25: band.p25 / 1_000_000,
      p50: band.p50 / 1_000_000,
      p75: band.p75 / 1_000_000,
      p90: band.p90 / 1_000_000,
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
      irmaa: row.irmaa / 1000,
    }));

  const stressData = result.stressTest.map((row) => ({
    year: row.year,
    base: row.base / 1_000_000,
    stress: row.stress / 1_000_000,
  }));

  const pieData = [
    { name: "Success", value: summary.successRate },
    { name: "Remaining", value: Math.max(0, 100 - summary.successRate) },
  ];

  return (
    <div className="bg-[#f9fafb] p-6 sm:p-10">
      <h2 className="section-title">Your Retirement Plan Summary</h2>
      <div className="dashboard-cards">
        <div className="card success">
          <div className="card-label">Portfolio Longevity</div>
          <div className="card-value">{summary.lifeExpectancy}</div>
          <div className="card-subtext">Projected to last until age {summary.lifeExpectancy}</div>
        </div>
        <div className={`card ${success.color}`}>
          <div className="card-label">Success Probability</div>
          <div className="card-value">{formatPercent(summary.successRate)}</div>
          <div className="card-subtext">{success.label} success rate</div>
        </div>
        <div className="card success">
          <div className="card-label">Full Retirement Age</div>
          <div className="card-value">{summary.fullRetirementAgeLabel}</div>
          <div className="card-subtext">SSA FRA for your birth year · age {summary.yourAge} today</div>
        </div>
        <div className="card success">
          <div className="card-label">Optimal SS Claim</div>
          <div className="card-value">{summary.claimAge}</div>
          <div className="card-subtext">Your planned claiming age</div>
        </div>
        <div className="card success">
          <div className="card-label">Portfolio at Retirement</div>
          <div className="card-value">{formatCurrency(result.portfolioAtRetirement)}</div>
          <div className="card-subtext">Projected total balance</div>
        </div>
        <div className="card success">
          <div className="card-label">Annual Spending</div>
          <div className="card-value">{formatCurrency(summary.annualSpending)}</div>
          <div className="card-subtext">Projected retirement spending</div>
        </div>
        <div className="card success">
          <div className="card-label">Estate at 90</div>
          <div className="card-value">{formatCurrency(summary.estateAt90)}</div>
          <div className="card-subtext">Median portfolio projection</div>
        </div>
      </div>

      <h2 className="section-title">Age-Based Retirement Comparison</h2>
      <p className="text-[#666] mb-4">Explore how retiring at different ages affects your plan&apos;s success:</p>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Retire Age</th>
              <th>Portfolio at Retirement</th>
              <th>Years Funding Needed</th>
              <th>Monthly Income Available</th>
              <th>Healthcare Gap (yrs pre-65)</th>
              <th>Monte Carlo Success %</th>
              <th>Estate at Age 90</th>
            </tr>
          </thead>
          <tbody>
            {result.ageComparison.map((row) => (
              <tr key={row.age} className={row.age === targetRetirementAge ? "highlighted" : ""}>
                <td>{row.age}</td>
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

      <h2 className="section-title">Social Security Claiming Comparison</h2>
      <p className="text-[#666] mb-4">Your Social Security Benefits</p>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Claim Age</th>
              <th>Monthly Benefit</th>
              <th>Annual Benefit</th>
              <th>Lifetime to 85</th>
              <th>Lifetime to 90</th>
              <th>Breakeven vs FRA</th>
              <th>vs Age 70</th>
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
        Breakeven occurs when cumulative benefits from the earlier claim age equal the later claim age.
      </div>

      {maritalStatus === "Married" && result.spouseSsClaiming.length > 0 && (
        <>
          <p className="text-[#666] mb-4 mt-8">Spouse&apos;s Social Security Benefits</p>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Claim Age</th>
                  <th>Monthly Benefit</th>
                  <th>Annual Benefit</th>
                  <th>Lifetime to 85</th>
                  <th>Lifetime to 90</th>
                  <th>Breakeven vs FRA</th>
                  <th>vs Age 70</th>
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

      <h2 className="section-title">Monte Carlo Simulation Results</h2>
      <div className="chart-grid">
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatPercent(Number(v))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center text-sm text-[#666]">Success rate: {formatPercent(summary.successRate)}</p>
        </div>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={percentileData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="p90" stroke="#059669" dot={false} name="90th" />
              <Line type="monotone" dataKey="p50" stroke="#2563eb" dot={false} name="Median" strokeWidth={2} />
              <Line type="monotone" dataKey="p10" stroke="#dc2626" dot={false} name="10th" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h2 className="section-title">Portfolio Projection Over Time</h2>
      <div className="chart-box mb-8">
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={portfolioData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="age" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="preTax" stroke="#2563eb" dot={false} name="Pre-Tax" />
            <Line type="monotone" dataKey="roth" stroke="#059669" dot={false} name="Roth" />
            <Line type="monotone" dataKey="taxable" stroke="#f59e0b" dot={false} name="Taxable" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h2 className="section-title">Tax Burden Analysis</h2>
      <div className="chart-box mb-4">
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={taxData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="age" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="federal" stackId="a" fill="#2563eb" name="Federal Tax (k)" />
            <Bar dataKey="irmaa" stackId="a" fill="#f59e0b" name="IRMAA (k)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="table-wrap mb-8">
        <table className="data-table">
          <tbody>
            <tr><td><strong>Total Federal Tax (Lifetime)</strong></td><td>{formatCurrency(result.totalFederalTax)}</td></tr>
            <tr><td><strong>Total State Tax</strong></td><td>{formatCurrency(result.totalStateTax)}</td></tr>
            <tr><td><strong>Total IRMAA Surcharge</strong></td><td>{formatCurrency(result.totalIrmaa)}</td></tr>
            <tr><td><strong>Effective Tax Rate in Retirement</strong></td><td>{formatPercent(result.effectiveTaxRate, 1)}</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="section-title">Stress Test: Market Downturn Scenario</h2>
      <div className="chart-box mb-8">
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={stressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="base" stroke="#059669" dot={false} name="Base Case (M)" strokeWidth={2} />
            <Line type="monotone" dataKey="stress" stroke="#dc2626" dot={false} name="-30% Year 1 (M)" strokeDasharray="5 5" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h2 className="section-title">Inflation Impact: Purchasing Power</h2>
      <div className="table-wrap mb-8">
        <table className="data-table">
          <thead>
            <tr>
              <th>Age</th>
              <th>Year</th>
              <th>Purchasing Power</th>
              <th>Real Decline %</th>
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

      <div className="recommendations-grid">
        <div className="rec-box roth">
          <strong>Roth Conversion Opportunity</strong>
          <p>Consider converting to Roth IRA before RMD age (73) to reduce future tax burden.</p>
        </div>
        <div className="rec-box ss">
          <strong>Social Security Strategy</strong>
          <p>Claiming at {summary.claimAge} aligns with your portfolio projections. Each year of delay increases benefits by ~8%.</p>
        </div>
        <div className="rec-box healthcare">
          <strong>Healthcare Planning</strong>
          <p>Budget for healthcare costs pre-Medicare. Consider HSA as a tax-advantaged account.</p>
        </div>
      </div>

      <div className="disclaimer">
        <strong>Disclaimer:</strong> This calculator is for educational purposes only and does not constitute financial advice.
        All projections are based on your assumptions and are subject to significant changes. Consult a licensed financial advisor
        before making major financial decisions. See{" "}
        <a href="https://www.ssa.gov/planners/retire/" target="_blank" rel="noopener noreferrer" className="underline">
          SSA.gov
        </a>{" "}
        for official Social Security information.
      </div>
    </div>
  );
}
