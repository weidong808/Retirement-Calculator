namespace RetirementCalculator.Domain.Services;

public static class FraCalculator
{
    /// <summary>
    /// SSA full retirement age by birth year.
    /// See https://www.ssa.gov/benefits/retirement/planner/ageincrease.html
    /// </summary>
    public static decimal GetFullRetirementAge(int birthYear)
    {
        if (birthYear <= 1937) return 65m;
        if (birthYear <= 1942) return 65m + (birthYear - 1937) * (2m / 12m);
        if (birthYear <= 1954) return 66m;
        if (birthYear <= 1959) return 66m + (birthYear - 1954) * (2m / 12m);
        return 67m;
    }

    public static string FormatFra(decimal fra)
    {
        var wholeYears = (int)Math.Floor(fra);
        var months = (int)Math.Round((fra - wholeYears) * 12);
        if (months == 0) return wholeYears.ToString();
        return $"{wholeYears} years, {months} months";
    }
}
