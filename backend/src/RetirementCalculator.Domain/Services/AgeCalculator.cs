namespace RetirementCalculator.Domain.Services;

public static class AgeCalculator
{
    public static int CalculateAge(DateOnly birthDate, DateOnly? asOf = null)
    {
        var today = asOf ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var age = today.Year - birthDate.Year;
        if (birthDate > today.AddYears(-age))
        {
            age--;
        }

        return age;
    }
}
