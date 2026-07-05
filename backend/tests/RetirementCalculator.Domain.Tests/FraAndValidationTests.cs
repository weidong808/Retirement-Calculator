using RetirementCalculator.Domain.Models;
using RetirementCalculator.Domain.Services;

namespace RetirementCalculator.Domain.Tests;

public class FraCalculatorTests
{
    [Theory]
    [InlineData(1937, 65)]
    [InlineData(1943, 66)]
    [InlineData(1954, 66)]
    [InlineData(1960, 67)]
    [InlineData(1957, 66.5)]
    public void GetFullRetirementAge_MatchesSsaTable(int birthYear, double expectedFra)
    {
        var fra = FraCalculator.GetFullRetirementAge(birthYear);
        Assert.Equal((decimal)expectedFra, fra);
    }

    [Fact]
    public void FormatFra_WholeYears()
    {
        Assert.Equal("67", FraCalculator.FormatFra(67));
    }

    [Fact]
    public void FormatFra_WithMonths()
    {
        Assert.Equal("66 years, 6 months", FraCalculator.FormatFra(66.5m));
    }
}

public class RmdCalculatorTests
{
    [Theory]
    [InlineData(72, 100_000, 0)]
    [InlineData(73, 100_000, 100_000 / 26.5)]
    [InlineData(90, 100_000, 100_000 / 12.2)]
    public void GetRmd_ReturnsExpected(int age, decimal balance, double expected)
    {
        var rmd = RmdCalculator.GetRmd(age, balance);
        Assert.Equal((decimal)expected, rmd, precision: 2);
    }
}

public class RetirementPlanValidatorTests
{
    [Fact]
    public void Validate_RejectsFutureBirthDate()
    {
        var input = ValidInput() with
        {
            BirthDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            YourAge = 0
        };

        var result = RetirementPlanValidator.Validate(input);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.Contains("future", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void Validate_RequiresRetirementSpending()
    {
        var input = ValidInput() with { RetirementSpending = 0, TravelBudget = 0 };
        var result = RetirementPlanValidator.Validate(input);
        Assert.False(result.IsValid);
    }

    [Fact]
    public void Validate_AcceptsValidInput()
    {
        var result = RetirementPlanValidator.Validate(ValidInput());
        Assert.True(result.IsValid);
    }

    [Fact]
    public void Normalize_DerivesAgeAndFraFromBirthDate()
    {
        var birthDate = new DateOnly(1960, 6, 15);
        var input = ValidInput() with { BirthDate = birthDate, YourAge = 0, YourFra = 0 };
        var normalized = RetirementInputNormalizer.Normalize(input);

        Assert.Equal(RetirementPlanValidator.ResolveAge(input), normalized.YourAge);
        Assert.Equal(67m, normalized.YourFra);
    }

    private static RetirementPlanInput ValidInput() => new()
    {
        YourAge = 45,
        TargetRetirementAge = 65,
        LifeExpectancy = 90,
        RetirementSpending = 80_000,
        YourClaimAge = 67,
        YourFra = 67
    };
}
