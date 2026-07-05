namespace RetirementCalculator.Domain.Services;

public static class RmdCalculator
{
    private static readonly Dictionary<int, decimal> RmdTable = new()
    {
        [72] = 27.4m, [73] = 26.5m, [74] = 25.5m, [75] = 24.6m, [76] = 23.7m,
        [77] = 22.9m, [78] = 22.0m, [79] = 21.1m, [80] = 20.2m, [81] = 19.4m,
        [82] = 18.5m, [83] = 17.7m, [84] = 16.8m, [85] = 16.0m, [86] = 15.2m,
        [87] = 14.4m, [88] = 13.7m, [89] = 12.9m, [90] = 12.2m, [91] = 11.5m,
        [92] = 10.8m, [93] = 10.1m, [94] = 9.5m, [95] = 8.9m, [96] = 8.4m,
        [97] = 7.8m, [98] = 7.3m, [99] = 6.8m, [100] = 6.4m
    };

    public static decimal GetRmd(int age, decimal balance)
    {
        if (age < 73 || balance <= 0)
        {
            return 0;
        }

        if (RmdTable.TryGetValue(age, out var divisor))
        {
            return balance / divisor;
        }

        return balance / 6.4m;
    }
}
