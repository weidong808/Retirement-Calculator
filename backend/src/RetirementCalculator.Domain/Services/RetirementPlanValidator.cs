using RetirementCalculator.Domain.Models;

namespace RetirementCalculator.Domain.Services;

public record ValidationResult(bool IsValid, IReadOnlyList<string> Errors)
{
    public static ValidationResult Success() => new(true, []);
    public static ValidationResult Failure(params string[] errors) => new(false, errors);
}

public static class RetirementPlanValidator
{
    public static ValidationResult Validate(RetirementPlanInput input)
    {
        var errors = new List<string>();
        var age = ResolveAge(input);

        if (input.BirthDate.HasValue)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            if (input.BirthDate.Value > today)
            {
                errors.Add("Birth date cannot be in the future.");
            }

            if (age < 18)
            {
                errors.Add("You must be at least 18 years old.");
            }

            if (age > 100)
            {
                errors.Add("Age must be 100 or younger.");
            }
        }
        else if (input.YourAge < 18 || input.YourAge > 100)
        {
            errors.Add("Your age must be between 18 and 100, or provide a valid birth date.");
        }

        var targetAge = input.TargetRetirementAge > 0 ? input.TargetRetirementAge : age + 20;
        if (targetAge < age)
        {
            errors.Add("Target retirement age cannot be less than your current age.");
        }

        if (targetAge < 50 || targetAge > 85)
        {
            errors.Add("Target retirement age must be between 50 and 85.");
        }

        var lifeExpectancy = input.LifeExpectancy > 0 ? input.LifeExpectancy : 90;
        if (lifeExpectancy <= targetAge)
        {
            errors.Add("Life expectancy must be greater than target retirement age.");
        }

        if (input.MaritalStatus == MaritalStatus.Married)
        {
            if (input.SpouseAge < 18 || input.SpouseAge > 100)
            {
                errors.Add("Spouse age must be between 18 and 100 when married.");
            }
        }

        if (input.YourClaimAge is < 62 or > 70)
        {
            errors.Add("Your Social Security claiming age must be between 62 and 70.");
        }

        if (input.MaritalStatus == MaritalStatus.Married &&
            input.SpouseClaimAge is < 62 or > 70)
        {
            errors.Add("Spouse claiming age must be between 62 and 70.");
        }

        if (input.RetirementSpending + input.TravelBudget <= 0)
        {
            errors.Add("Choose your expected yearly spending in retirement.");
        }

        if (input.ExpectedReturnPre is < -10 or > 20)
        {
            errors.Add("Pre-retirement return must be between -10% and 20%.");
        }

        if (input.ExpectedReturnPost is < -10 or > 20)
        {
            errors.Add("Post-retirement return must be between -10% and 20%.");
        }

        return errors.Count == 0 ? ValidationResult.Success() : ValidationResult.Failure(errors.ToArray());
    }

    public static int ResolveAge(RetirementPlanInput input) =>
        input.BirthDate.HasValue ? AgeCalculator.CalculateAge(input.BirthDate.Value) : input.YourAge;

    public static decimal ResolveFra(RetirementPlanInput input) =>
        input.BirthDate.HasValue
            ? FraCalculator.GetFullRetirementAge(input.BirthDate.Value.Year)
            : input.YourFra > 0 ? input.YourFra : 67m;
}
