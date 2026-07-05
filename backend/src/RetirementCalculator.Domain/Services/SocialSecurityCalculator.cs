namespace RetirementCalculator.Domain.Services;

public static class SocialSecurityCalculator
{
    public static decimal GetBenefit(decimal fraMonthly, int claimAge, decimal fra)
    {
        var adjustment = 1.0m;

        if (claimAge < fra)
        {
            var monthsEarly = (int)((fra - claimAge) * 12);
            if (monthsEarly <= 36)
            {
                adjustment = 1.0m - (monthsEarly * (5m / 9m) / 100m);
            }
            else
            {
                adjustment = 1.0m - (36 * (5m / 9m) / 100m) - ((monthsEarly - 36) * (5m / 12m) / 100m);
            }
        }
        else if (claimAge > fra)
        {
            var yearsLate = claimAge - fra;
            adjustment = 1.0m + (yearsLate * 0.08m);
        }

        return fraMonthly * adjustment;
    }

    public static string GetBreakeven(
        decimal benefit1,
        decimal benefit2,
        int claimAge1,
        int claimAge2,
        int[]? ages = null)
    {
        ages ??= [70, 75, 80, 85, 90];

        decimal cumulative1 = 0;
        decimal cumulative2 = 0;
        int? breakeven = null;

        foreach (var age in ages.OrderBy(a => a))
        {
            if (age >= claimAge1)
            {
                cumulative1 += benefit1 * 12;
            }

            if (age >= claimAge2)
            {
                cumulative2 += benefit2 * 12;
            }

            if (cumulative1 > cumulative2 && breakeven is null)
            {
                breakeven = age;
            }
        }

        return breakeven?.ToString() ?? "Never";
    }

    public static IReadOnlyList<int> DefaultClaimAges(decimal fra) =>
        [62, 64, 66, (int)Math.Floor(fra), (int)Math.Floor(fra) + 1, 70];
}
