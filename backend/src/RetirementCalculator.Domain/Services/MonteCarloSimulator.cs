using RetirementCalculator.Domain.Models;

namespace RetirementCalculator.Domain.Services;

public static class MonteCarloSimulator
{
    public static MonteCarloResult Run(
        decimal startBalance,
        decimal annualReturn,
        int yearsToSimulate,
        int numSimulations = 1000,
        int? seed = null)
    {
        var random = seed.HasValue ? new Random(seed.Value) : Random.Shared;
        var results = new List<int>();
        var yearlyPercentiles = new Dictionary<int, List<decimal>>();

        for (var year = 0; year <= yearsToSimulate; year++)
        {
            yearlyPercentiles[year] = [];
        }

        for (var sim = 0; sim < numSimulations; sim++)
        {
            var balance = startBalance;
            var year = 0;

            while (year <= yearsToSimulate && balance > 0)
            {
                yearlyPercentiles[year].Add(balance);
                year++;

                if (year <= yearsToSimulate)
                {
                    var randomReturn = GaussianRandom(random, annualReturn / 100m, 0.14m);
                    balance *= 1 + randomReturn;
                }
            }

            results.Add(balance > 0 && year > yearsToSimulate ? 1 : 0);
        }

        var successRate = results.Count == 0
            ? 0
            : (decimal)results.Sum() / numSimulations * 100m;

        var percentiles = new Dictionary<int, PercentileBand>();
        for (var year = 0; year <= yearsToSimulate; year++)
        {
            var values = yearlyPercentiles[year].OrderBy(v => v).ToList();
            percentiles[year] = new PercentileBand(
                Percentile(values, 0.10),
                Percentile(values, 0.25),
                Percentile(values, 0.50),
                Percentile(values, 0.75),
                Percentile(values, 0.90));
        }

        return new MonteCarloResult(successRate, percentiles);
    }

    private static decimal Percentile(List<decimal> sorted, double p)
    {
        if (sorted.Count == 0)
        {
            return 0;
        }

        var index = (int)Math.Floor(sorted.Count * p);
        index = Math.Clamp(index, 0, sorted.Count - 1);
        return sorted[index];
    }

    private static decimal GaussianRandom(Random random, decimal mean, decimal stdDev)
    {
        double u1, u2;
        do
        {
            u1 = random.NextDouble();
            u2 = random.NextDouble();
        } while (u1 <= 1e-6);

        var mag = Math.Sqrt(-2.0 * Math.Log(u1));
        var z0 = mag * Math.Cos(2.0 * Math.PI * u2);
        return mean + stdDev * (decimal)z0;
    }
}
