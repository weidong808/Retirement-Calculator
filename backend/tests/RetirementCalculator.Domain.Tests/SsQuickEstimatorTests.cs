using RetirementCalculator.Domain.Services;
using Xunit;

namespace RetirementCalculator.Domain.Tests;

public class SsQuickEstimatorTests
{
    [Fact]
    public void ZeroEarnings_YieldsZeroBenefit()
    {
        var result = SsQuickEstimator.Estimate(0m);
        Assert.Equal(0m, result.MonthlyAtFra);
    }

    [Fact]
    public void NegativeEarnings_TreatedAsZero()
    {
        var result = SsQuickEstimator.Estimate(-50_000m);
        Assert.Equal(0m, result.MonthlyAtFra);
    }

    [Fact]
    public void EarningsBelowFirstBendPoint_Replaces90Percent()
    {
        // $12,000/yr → AIME $1,000, entirely below the $1,286 bend point.
        var result = SsQuickEstimator.Estimate(12_000m);
        Assert.Equal(1_000m, result.Aime);
        Assert.Equal(900m, result.MonthlyAtFra);
    }

    [Fact]
    public void EarningsBetweenBendPoints_UsesTieredFormula()
    {
        // $90,000/yr → AIME $7,500.
        // PIA = 0.90×1286 + 0.32×(7500−1286) = 1157.40 + 1988.48 = 3145.88 → $3,146.
        var result = SsQuickEstimator.Estimate(90_000m);
        Assert.Equal(7_500m, result.Aime);
        Assert.Equal(3_146m, result.MonthlyAtFra);
    }

    [Fact]
    public void EarningsAboveSecondBendPoint_Uses15PercentTier()
    {
        // At the 2026 taxable maximum ($184,500) → AIME $15,375.
        // PIA = 1157.40 + 0.32×(7749−1286) + 0.15×(15375−7749)
        //     = 1157.40 + 2068.16 + 1143.90 = 4369.46 → $4,369.
        var result = SsQuickEstimator.Estimate(184_500m);
        Assert.Equal(15_375m, result.Aime);
        Assert.Equal(4_369m, result.MonthlyAtFra);
    }

    [Fact]
    public void EarningsAboveTaxableMaximum_AreCapped()
    {
        var atCap = SsQuickEstimator.Estimate(184_500m);
        var aboveCap = SsQuickEstimator.Estimate(1_000_000m);
        Assert.Equal(atCap.MonthlyAtFra, aboveCap.MonthlyAtFra);
    }

    [Fact]
    public void ShorterCareer_ScalesAimeDown()
    {
        // 17.5 years is half the 35-year averaging period → AIME halves.
        var fullCareer = SsQuickEstimator.Estimate(90_000m, 35);
        var halfCareer = SsQuickEstimator.Estimate(90_000m, 17);
        Assert.True(halfCareer.Aime < fullCareer.Aime);
        Assert.True(halfCareer.MonthlyAtFra < fullCareer.MonthlyAtFra);
    }
}
