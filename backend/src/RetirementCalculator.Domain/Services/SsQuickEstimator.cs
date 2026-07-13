namespace RetirementCalculator.Domain.Services;

/// <summary>
/// Rough Social Security benefit estimate in the spirit of SSA's Quick Calculator
/// (https://www.ssa.gov/OACT/quickcalc/).
///
/// Steady-earner approximation: assumes the person's current earnings are
/// representative of their career-average wage-indexed earnings over a full
/// 35-year career, so AIME ≈ capped current earnings / 12. The PIA is then
/// computed with the standard bend-point formula.
///
/// This is intentionally simple. SSA's official estimate (ssa.gov) uses the
/// person's actual earnings record and is more accurate.
/// </summary>
public static class SsQuickEstimator
{
    /// <summary>PIA formula bend points for workers first eligible (age 62) in 2026.
    /// Source: https://www.ssa.gov/oact/cola/bendpoints.html</summary>
    private const decimal BendPoint1 = 1_286m;
    private const decimal BendPoint2 = 7_749m;

    /// <summary>2026 contribution and benefit base (taxable maximum).
    /// Source: https://www.ssa.gov/oact/cola/cbb.html</summary>
    private const decimal TaxableMaximumAnnual = 184_500m;

    /// <param name="annualEarnings">Current gross annual earnings from work, in dollars.</param>
    /// <param name="yearsWorked">Career length assumption; capped at the 35 years SSA averages over.</param>
    public static SsQuickEstimateResult Estimate(decimal annualEarnings, int yearsWorked = 35)
    {
        if (annualEarnings < 0m)
        {
            annualEarnings = 0m;
        }

        var capped = Math.Min(annualEarnings, TaxableMaximumAnnual);
        var careerFactor = Math.Clamp(yearsWorked, 1, 35) / 35m;
        var aime = decimal.Floor(capped / 12m * careerFactor);

        var pia =
            0.90m * Math.Min(aime, BendPoint1) +
            0.32m * Math.Max(0m, Math.Min(aime, BendPoint2) - BendPoint1) +
            0.15m * Math.Max(0m, aime - BendPoint2);

        // SSA rounds the PIA down to the nearest dime; we report whole dollars.
        var piaDime = decimal.Floor(pia * 10m) / 10m;
        var monthlyAtFra = Math.Round(piaDime, 0, MidpointRounding.AwayFromZero);

        return new SsQuickEstimateResult(monthlyAtFra, aime);
    }
}

/// <param name="MonthlyAtFra">Estimated monthly benefit at full retirement age, whole dollars.</param>
/// <param name="Aime">The approximated Average Indexed Monthly Earnings used.</param>
public record SsQuickEstimateResult(decimal MonthlyAtFra, decimal Aime);
