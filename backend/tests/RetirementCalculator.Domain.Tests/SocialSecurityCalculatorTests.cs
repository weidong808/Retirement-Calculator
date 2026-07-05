using RetirementCalculator.Domain.Models;
using RetirementCalculator.Domain.Services;

namespace RetirementCalculator.Domain.Tests;

public class SocialSecurityCalculatorTests
{
    [Theory]
    [InlineData(3000, 67, 67, 3000)]
    [InlineData(3000, 62, 67, 2100)]
    public void GetBenefit_MatchesPrototypeLogic(decimal fraMonthly, int claimAge, decimal fra, decimal expectedApprox)
    {
        var benefit = SocialSecurityCalculator.GetBenefit(fraMonthly, claimAge, fra);
        Assert.InRange(benefit, expectedApprox - 50, expectedApprox + 50);
    }

    [Fact]
    public void Engine_ReturnsResult_ForValidInput()
    {
        var engine = new RetirementCalculatorEngine();
        var input = new RetirementPlanInput
        {
            YourAge = 45,
            TargetRetirementAge = 65,
            LifeExpectancy = 90,
            Traditional401k = 500_000,
            YourMonthlySsFra = 3000,
            YourClaimAge = 67,
            YourFra = 67,
            RetirementSpending = 80_000
        };

        var result = engine.Calculate(input);

        Assert.True(result.PortfolioAtRetirement > 500_000);
        Assert.NotEmpty(result.YourSsClaiming);
        Assert.NotEmpty(result.YearByYear);
    }
}
