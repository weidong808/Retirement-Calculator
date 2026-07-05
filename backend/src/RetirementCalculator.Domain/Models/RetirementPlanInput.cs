namespace RetirementCalculator.Domain.Models;

public enum MaritalStatus
{
    Single,
    Married
}

public enum TaxLawScenario
{
    TCJA,
    PreTCJA
}

public enum FilingStatus
{
    Single,
    MFJ
}

public record RetirementPlanInput
{
    public string FirstName { get; init; } = "Valued Client";
    public DateOnly? BirthDate { get; init; }
    public int YourAge { get; init; }
    public int SpouseAge { get; init; }
    public MaritalStatus MaritalStatus { get; init; } = MaritalStatus.Single;
    public string State { get; init; } = string.Empty;
    public int TargetRetirementAge { get; init; }
    public int LifeExpectancy { get; init; } = 90;

    public decimal Traditional401k { get; init; }
    public decimal Roth401k { get; init; }
    public decimal TaxableBrokerage { get; init; }
    public decimal Hsa { get; init; }
    public decimal AnnualPreTax401k { get; init; }
    public decimal AnnualRothContribution { get; init; }

    public decimal HouseholdIncome { get; init; }
    public decimal SpouseIncome { get; init; }
    public decimal RetirementSpending { get; init; }
    public decimal TravelBudget { get; init; }
    public decimal PensionIncome { get; init; }

    public decimal YourMonthlySsFra { get; init; }
    public decimal SpouseMonthlySsFra { get; init; }
    public int YourClaimAge { get; init; } = 67;
    public int SpouseClaimAge { get; init; } = 67;
    public decimal YourFra { get; init; } = 67m;
    public decimal AnnualRothConversionPre { get; init; }

    public decimal ExpectedReturnPre { get; init; } = 7m;
    public decimal ExpectedReturnPost { get; init; } = 6m;
    public decimal InflationRate { get; init; } = 2.5m;
    public decimal SsCola { get; init; } = 2.5m;
    public decimal StateIncomeTax { get; init; } = 5m;
    public TaxLawScenario TaxLaw { get; init; } = TaxLawScenario.TCJA;
    public decimal AnnualRothConversionPost { get; init; }

    public FilingStatus FilingStatus =>
        MaritalStatus == MaritalStatus.Married ? FilingStatus.MFJ : FilingStatus.Single;
}
