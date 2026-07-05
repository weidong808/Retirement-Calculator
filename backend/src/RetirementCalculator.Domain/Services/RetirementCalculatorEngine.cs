using RetirementCalculator.Domain.Models;

namespace RetirementCalculator.Domain.Services;

public interface IRetirementCalculatorEngine
{
    RetirementPlanResult Calculate(RetirementPlanInput input);
}

public class RetirementCalculatorEngine : IRetirementCalculatorEngine
{
    public RetirementPlanResult Calculate(RetirementPlanInput input)
    {
        input = RetirementInputNormalizer.Normalize(input);

        var targetRetirementAge = input.TargetRetirementAge;
        var lifeExpectancy = input.LifeExpectancy;
        var yearsToRetirement = Math.Max(0, targetRetirementAge - input.YourAge);
        var yearsInRetirement = Math.Max(0, lifeExpectancy - targetRetirementAge);
        var totalSpending = input.RetirementSpending + input.TravelBudget;

        var (preRetireBalance, rothBalance, taxableBalance) = ProjectToRetirement(input, yearsToRetirement);
        var portfolioAtRetirement = preRetireBalance + rothBalance + taxableBalance;

        var mcResults = MonteCarloSimulator.Run(
            portfolioAtRetirement,
            input.ExpectedReturnPost,
            yearsInRetirement,
            1000);

        var yourSsNative = SocialSecurityCalculator.GetBenefit(
            input.YourMonthlySsFra, input.YourClaimAge, input.YourFra);
        var yourSsAnnual = yourSsNative * 12;

        var ageComparison = BuildAgeComparison(input, lifeExpectancy);
        var yourSsClaiming = BuildSsClaiming(
            input.YourMonthlySsFra, input.YourFra, input.YourClaimAge);
        var spouseSsClaiming = input.MaritalStatus == MaritalStatus.Married
            ? BuildSsClaiming(input.SpouseMonthlySsFra, 67, input.SpouseClaimAge, [62, 64, 66, 67, 68, 70])
            : [];

        var (yearByYear, totalFederalTax, totalIrmaa) = BuildYearByYearProjection(
            input, targetRetirementAge, yearsInRetirement, yearsToRetirement,
            preRetireBalance, rothBalance, taxableBalance, totalSpending, yourSsAnnual);

        var stressTest = BuildStressTest(portfolioAtRetirement, yearsInRetirement, input.ExpectedReturnPost, totalSpending, yearByYear);
        var inflationImpact = BuildInflationImpact(input.YourAge, input.InflationRate);

        var totalStateTax = yearByYear.Sum(row => row.FederalTax * (input.StateIncomeTax / 100m));
        var totalIncome = yearByYear.Sum(row => row.SsIncome);
        var totalTaxes = totalFederalTax + totalStateTax + totalIrmaa;
        var effectiveRate = totalIncome > 0 ? (totalTaxes / totalIncome) * 100m : 0;

        var estateAt90 = mcResults.Percentiles.TryGetValue(yearsInRetirement, out var band)
            ? band.P50
            : 0;

        return new RetirementPlanResult
        {
            Summary = new DashboardSummary(
                input.FirstName,
                input.YourAge,
                input.YourFra,
                FraCalculator.FormatFra(input.YourFra),
                targetRetirementAge,
                lifeExpectancy,
                input.YourClaimAge,
                mcResults.SuccessRate,
                yearByYear.FirstOrDefault()?.Spending ?? totalSpending,
                estateAt90),
            AgeComparison = ageComparison,
            YourSsClaiming = yourSsClaiming,
            SpouseSsClaiming = spouseSsClaiming,
            MonteCarlo = mcResults,
            YearByYear = yearByYear,
            TotalFederalTax = totalFederalTax,
            TotalStateTax = totalStateTax,
            TotalIrmaa = totalIrmaa,
            EffectiveTaxRate = effectiveRate,
            StressTest = stressTest,
            InflationImpact = inflationImpact,
            PortfolioAtRetirement = portfolioAtRetirement
        };
    }

    private static (decimal PreTax, decimal Roth, decimal Taxable) ProjectToRetirement(
        RetirementPlanInput input, int yearsToRetirement)
    {
        var preTax = input.Traditional401k;
        var roth = input.Roth401k + input.Hsa;
        var taxable = input.TaxableBrokerage;
        var returnRate = input.ExpectedReturnPre / 100m;

        for (var year = 0; year < yearsToRetirement; year++)
        {
            preTax = preTax * (1 + returnRate) + input.AnnualPreTax401k + input.AnnualRothConversionPre;
            roth = roth * (1 + returnRate) + input.AnnualRothContribution;
            taxable = taxable * (1 + returnRate);
        }

        return (preTax, roth, taxable);
    }

    private static List<AgeComparisonRow> BuildAgeComparison(RetirementPlanInput input, int lifeExpectancy)
    {
        var rows = new List<AgeComparisonRow>();
        int[] retireAges = [55, 58, 60, 62, 65, 67];

        foreach (var retireAge in retireAges)
        {
            var yearsToRetire = Math.Max(0, retireAge - input.YourAge);
            var yearsInRetire = Math.Max(0, lifeExpectancy - retireAge);

            var (preBal, rothBal, taxBal) = ProjectToRetirement(input, yearsToRetire);
            var portAtRet = preBal + rothBal + taxBal;
            var mc = MonteCarloSimulator.Run(portAtRet, input.ExpectedReturnPost, yearsInRetire, 200, seed: retireAge);
            var monthlyIncome = (portAtRet * 0.04m) / 12;
            var healthcareGap = Math.Max(0, 65 - retireAge);
            var estateAt90 = mc.Percentiles.TryGetValue(yearsInRetire, out var band) ? band.P50 : 0;

            rows.Add(new AgeComparisonRow(
                retireAge, portAtRet, yearsInRetire, monthlyIncome,
                healthcareGap, mc.SuccessRate, estateAt90));
        }

        return rows;
    }

    private static List<SsClaimingRow> BuildSsClaiming(
        decimal fraMonthly,
        decimal fra,
        int selectedClaimAge,
        int[]? claimAges = null)
    {
        claimAges ??= SocialSecurityCalculator.DefaultClaimAges(fra).ToArray();
        var rows = new List<SsClaimingRow>();

        foreach (var claimAge in claimAges)
        {
            var monthlyBenefit = SocialSecurityCalculator.GetBenefit(fraMonthly, claimAge, fra);
            var annualBenefit = monthlyBenefit * 12;
            var lifetimeTo85 = monthlyBenefit * 12 * Math.Max(0, 85 - claimAge);
            var lifetimeTo90 = monthlyBenefit * 12 * Math.Max(0, 90 - claimAge);
            var benefitAtFra = SocialSecurityCalculator.GetBenefit(fraMonthly, (int)Math.Floor(fra), fra);
            var benefitAt70 = SocialSecurityCalculator.GetBenefit(fraMonthly, 70, fra);

            rows.Add(new SsClaimingRow(
                claimAge,
                monthlyBenefit,
                annualBenefit,
                lifetimeTo85,
                lifetimeTo90,
                SocialSecurityCalculator.GetBreakeven(monthlyBenefit, benefitAtFra, claimAge, (int)Math.Floor(fra)),
                SocialSecurityCalculator.GetBreakeven(monthlyBenefit, benefitAt70, claimAge, 70, [75, 80, 85, 90, 95])));
        }

        return rows;
    }

    private static (List<YearByYearRow> Rows, decimal TotalFederalTax, decimal TotalIrmaa) BuildYearByYearProjection(
        RetirementPlanInput input,
        int targetRetirementAge,
        int yearsInRetirement,
        int yearsToRetirement,
        decimal preTaxStart,
        decimal rothStart,
        decimal taxableStart,
        decimal totalSpending,
        decimal yourSsAnnual)
    {
        var rows = new List<YearByYearRow>();
        var projPreTax = preTaxStart;
        var projRoth = rothStart;
        var projTaxable = taxableStart;
        decimal totalFederalTax = 0;
        decimal totalIrmaa = 0;

        for (var year = 0; year <= yearsInRetirement; year++)
        {
            var age = targetRetirementAge + year;
            var rmd = RmdCalculator.GetRmd(age, projPreTax);
            var portValue = projPreTax + projRoth + projTaxable;

            var withdrawal = rmd;
            if (withdrawal < totalSpending && portValue > 0)
            {
                withdrawal = Math.Min(portValue * 0.04m, totalSpending);
            }

            var ssIncome = 0m;
            if (age >= input.YourClaimAge)
            {
                var yearsSinceClaim = age - input.YourClaimAge;
                ssIncome = yourSsAnnual * (decimal)Math.Pow(1 + (double)(input.SsCola / 100m), yearsSinceClaim);
            }

            var incomeForTax = withdrawal - rmd + ssIncome;
            var taxableSs = TaxCalculator.CalculateTaxableSocialSecurity(ssIncome, incomeForTax, input.FilingStatus);
            var totalTaxableIncome = incomeForTax + taxableSs;
            var standardDed = TaxCalculator.GetStandardDeduction(input.FilingStatus, input.TaxLaw);
            var taxableIncome = Math.Max(0, totalTaxableIncome - standardDed);
            var federalTax = TaxCalculator.CalculateFederalIncomeTax(taxableIncome, input.FilingStatus, input.TaxLaw);
            var stateTax = taxableIncome * (input.StateIncomeTax / 100m);

            var irmaa = 0m;
            if (age >= 65)
            {
                irmaa = IrmaaCalculator.Calculate(incomeForTax, input.FilingStatus).Total;
            }

            var totalTax = federalTax + stateTax + irmaa;
            totalFederalTax += federalTax;
            totalIrmaa += irmaa;

            var rothConversion = year < yearsToRetirement
                ? input.AnnualRothConversionPre
                : input.AnnualRothConversionPost;
            var netCashFlow = ssIncome + withdrawal - totalSpending - totalTax;

            var returnRate = input.ExpectedReturnPost / 100m;
            projPreTax = projPreTax * (1 + returnRate) - rmd - rothConversion;
            projRoth = projRoth * (1 + returnRate) + rothConversion;
            projTaxable = projTaxable * (1 + returnRate) - (withdrawal - rmd);

            projPreTax = Math.Max(0, projPreTax);
            projRoth = Math.Max(0, projRoth);
            projTaxable = Math.Max(0, projTaxable);

            rows.Add(new YearByYearRow(
                year, age, projPreTax, projRoth, projTaxable,
                projPreTax + projRoth + projTaxable,
                rmd, ssIncome, rothConversion, totalSpending,
                federalTax, irmaa, netCashFlow));
        }

        return (rows, totalFederalTax, totalIrmaa);
    }

    private static List<StressTestPoint> BuildStressTest(
        decimal portfolioAtRetirement,
        int yearsInRetirement,
        decimal expectedReturnPost,
        decimal totalSpending,
        List<YearByYearRow> yearByYear)
    {
        var points = new List<StressTestPoint>();
        var stressPortfolio = portfolioAtRetirement * 0.70m;
        points.Add(new StressTestPoint(0, portfolioAtRetirement, stressPortfolio));

        for (var year = 1; year <= yearsInRetirement; year++)
        {
            var returnRate = expectedReturnPost / 100m;
            stressPortfolio = stressPortfolio * (1 + returnRate) - (totalSpending * 12);
            var baseYear = year < yearByYear.Count ? yearByYear[year].Total : 0;
            points.Add(new StressTestPoint(year, baseYear, Math.Max(0, stressPortfolio)));
        }

        return points;
    }

    private static List<InflationImpactRow> BuildInflationImpact(int yourAge, decimal inflationRate)
    {
        var rows = new List<InflationImpactRow>();
        int[] ages = [70, 75, 80, 85, 90];

        foreach (var age in ages)
        {
            var yearsFromNow = age - yourAge;
            var purchasingPower = 1000m / (decimal)Math.Pow(1 + (double)(inflationRate / 100m), yearsFromNow);
            var decline = ((1000m - purchasingPower) / 1000m) * 100m;
            rows.Add(new InflationImpactRow(age, yearsFromNow, purchasingPower, decline));
        }

        return rows;
    }
}
