using RetirementCalculator.Domain.Models;

namespace RetirementCalculator.Domain.Services;

public static class TaxCalculator
{
    private record TaxBracket(decimal Rate, decimal Limit);

    private static readonly Dictionary<TaxLawScenario, Dictionary<FilingStatus, TaxBracket[]>> TaxBrackets = new()
    {
        [TaxLawScenario.TCJA] = new()
        {
            [FilingStatus.MFJ] =
            [
                new(0.10m, 23850), new(0.12m, 96950), new(0.22m, 206700),
                new(0.24m, 394600), new(0.32m, 501050), new(0.35m, 751600),
                new(0.37m, decimal.MaxValue)
            ],
            [FilingStatus.Single] =
            [
                new(0.10m, 11925), new(0.12m, 48475), new(0.22m, 103350),
                new(0.24m, 197300), new(0.32m, 250525), new(0.35m, 626350),
                new(0.37m, decimal.MaxValue)
            ]
        },
        [TaxLawScenario.PreTCJA] = new()
        {
            [FilingStatus.MFJ] =
            [
                new(0.10m, 19900), new(0.15m, 81050), new(0.25m, 154950),
                new(0.28m, 237950), new(0.33m, 424950), new(0.35m, 480050),
                new(0.396m, decimal.MaxValue)
            ],
            [FilingStatus.Single] =
            [
                new(0.10m, 9950), new(0.15m, 40525), new(0.25m, 86375),
                new(0.28m, 164925), new(0.33m, 209425), new(0.35m, 523600),
                new(0.396m, decimal.MaxValue)
            ]
        }
    };

    private static readonly Dictionary<TaxLawScenario, Dictionary<FilingStatus, decimal>> StandardDeductions = new()
    {
        [TaxLawScenario.TCJA] = new() { [FilingStatus.MFJ] = 30000, [FilingStatus.Single] = 15000 },
        [TaxLawScenario.PreTCJA] = new() { [FilingStatus.MFJ] = 14600, [FilingStatus.Single] = 7300 }
    };

    public static decimal CalculateFederalIncomeTax(decimal taxableIncome, FilingStatus filingStatus, TaxLawScenario taxLaw)
    {
        if (taxableIncome <= 0)
        {
            return 0;
        }

        var brackets = TaxBrackets[taxLaw][filingStatus];
        decimal tax = 0;
        decimal previousLimit = 0;

        foreach (var bracket in brackets)
        {
            if (taxableIncome <= previousLimit)
            {
                break;
            }

            var taxableInBracket = Math.Min(taxableIncome, bracket.Limit) - previousLimit;
            tax += taxableInBracket * bracket.Rate;
            previousLimit = bracket.Limit;
        }

        return tax;
    }

    public static string GetMarginalBracket(decimal taxableIncome, FilingStatus filingStatus, TaxLawScenario taxLaw)
    {
        var brackets = TaxBrackets[taxLaw][filingStatus];
        foreach (var bracket in brackets)
        {
            if (taxableIncome <= bracket.Limit)
            {
                return $"{bracket.Rate * 100:0}%";
            }
        }

        return "37%";
    }

    public static decimal CalculateTaxableSocialSecurity(decimal ssAmount, decimal otherIncome, FilingStatus filingStatus)
    {
        var provisionalIncome = otherIncome + (ssAmount * 0.5m);
        decimal taxableSs = 0;

        if (filingStatus == FilingStatus.MFJ)
        {
            if (provisionalIncome > 44000)
            {
                taxableSs = Math.Min(ssAmount, (provisionalIncome - 44000) * 0.85m);
                taxableSs += Math.Min(ssAmount - taxableSs, Math.Max(0, provisionalIncome - 32000) * 0.50m);
            }
            else if (provisionalIncome > 32000)
            {
                taxableSs = Math.Min(ssAmount, (provisionalIncome - 32000) * 0.50m);
            }
        }
        else
        {
            if (provisionalIncome > 34000)
            {
                taxableSs = Math.Min(ssAmount, (provisionalIncome - 34000) * 0.85m);
                taxableSs += Math.Min(ssAmount - taxableSs, Math.Max(0, provisionalIncome - 25000) * 0.50m);
            }
            else if (provisionalIncome > 25000)
            {
                taxableSs = Math.Min(ssAmount, (provisionalIncome - 25000) * 0.50m);
            }
        }

        return taxableSs;
    }

    public static decimal GetStandardDeduction(FilingStatus filingStatus, TaxLawScenario taxLaw) =>
        StandardDeductions[taxLaw][filingStatus];
}
