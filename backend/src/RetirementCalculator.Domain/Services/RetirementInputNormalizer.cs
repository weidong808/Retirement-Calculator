using RetirementCalculator.Domain.Models;

namespace RetirementCalculator.Domain.Services;

public static class RetirementInputNormalizer
{
    public static RetirementPlanInput Normalize(RetirementPlanInput input)
    {
        var age = RetirementPlanValidator.ResolveAge(input);
        var fra = RetirementPlanValidator.ResolveFra(input);
        var targetAge = input.TargetRetirementAge > 0 ? input.TargetRetirementAge : age + 20;
        var lifeExpectancy = input.LifeExpectancy > 0 ? input.LifeExpectancy : 90;

        return input with
        {
            YourAge = age,
            YourFra = fra,
            TargetRetirementAge = targetAge,
            LifeExpectancy = lifeExpectancy,
            YourClaimAge = input.YourClaimAge is >= 62 and <= 70 ? input.YourClaimAge : 67,
            SpouseClaimAge = input.SpouseClaimAge is >= 62 and <= 70 ? input.SpouseClaimAge : 67
        };
    }
}
