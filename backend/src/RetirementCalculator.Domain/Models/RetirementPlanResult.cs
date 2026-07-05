namespace RetirementCalculator.Domain.Models;

public record AgeComparisonRow(
    int Age,
    decimal Portfolio,
    int YearsNeeded,
    decimal MonthlyIncome,
    int HealthcareGap,
    decimal SuccessRate,
    decimal Estate);

public record SsClaimingRow(
    int ClaimAge,
    decimal MonthlyBenefit,
    decimal AnnualBenefit,
    decimal LifetimeTo85,
    decimal LifetimeTo90,
    string Breakeven,
    string Vs70);

public record YearByYearRow(
    int Year,
    int Age,
    decimal PreTax,
    decimal Roth,
    decimal Taxable,
    decimal Total,
    decimal Rmd,
    decimal SsIncome,
    decimal RothConversion,
    decimal Spending,
    decimal FederalTax,
    decimal Irmaa,
    decimal NetCashFlow);

public record PercentileBand(
    decimal P10,
    decimal P25,
    decimal P50,
    decimal P75,
    decimal P90);

public record MonteCarloResult(
    decimal SuccessRate,
    Dictionary<int, PercentileBand> Percentiles);

public record StressTestPoint(int Year, decimal Base, decimal Stress);

public record InflationImpactRow(int Age, int Year, decimal PurchasingPower, decimal Decline);

public record DashboardSummary(
    string FirstName,
    int YourAge,
    decimal FullRetirementAge,
    string FullRetirementAgeLabel,
    int TargetRetirementAge,
    int LifeExpectancy,
    int ClaimAge,
    decimal SuccessRate,
    decimal AnnualSpending,
    decimal EstateAt90);

public record RetirementPlanResult
{
    public required DashboardSummary Summary { get; init; }
    public required IReadOnlyList<AgeComparisonRow> AgeComparison { get; init; }
    public required IReadOnlyList<SsClaimingRow> YourSsClaiming { get; init; }
    public required IReadOnlyList<SsClaimingRow> SpouseSsClaiming { get; init; }
    public required MonteCarloResult MonteCarlo { get; init; }
    public required IReadOnlyList<YearByYearRow> YearByYear { get; init; }
    public required decimal TotalFederalTax { get; init; }
    public required decimal TotalStateTax { get; init; }
    public required decimal TotalIrmaa { get; init; }
    public required decimal EffectiveTaxRate { get; init; }
    public required IReadOnlyList<StressTestPoint> StressTest { get; init; }
    public required IReadOnlyList<InflationImpactRow> InflationImpact { get; init; }
    public required decimal PortfolioAtRetirement { get; init; }
}
