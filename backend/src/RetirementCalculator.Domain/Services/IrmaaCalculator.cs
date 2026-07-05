using RetirementCalculator.Domain.Models;

namespace RetirementCalculator.Domain.Services;

public record IrmaaResult(decimal PartB, decimal PartD, decimal Total);

public static class IrmaaCalculator
{
    public static IrmaaResult Calculate(decimal magi, FilingStatus filingStatus)
    {
        decimal surchargeB = 0;
        decimal surchargeD = 0;

        if (filingStatus == FilingStatus.MFJ)
        {
            if (magi > 750000) { surchargeB = 5327; surchargeD = 983; }
            else if (magi > 386000) { surchargeB = 4891; surchargeD = 904; }
            else if (magi > 322000) { surchargeB = 3556; surchargeD = 655; }
            else if (magi > 258000) { surchargeB = 2220; surchargeD = 407; }
            else if (magi > 206000) { surchargeB = 884; surchargeD = 158; }
        }
        else
        {
            if (magi > 375000) { surchargeB = 5327; surchargeD = 983; }
            else if (magi > 193000) { surchargeB = 4891; surchargeD = 904; }
            else if (magi > 161000) { surchargeB = 3556; surchargeD = 655; }
            else if (magi > 129000) { surchargeB = 2220; surchargeD = 407; }
            else if (magi > 103000) { surchargeB = 884; surchargeD = 158; }
        }

        return new IrmaaResult(surchargeB, surchargeD, surchargeB + surchargeD);
    }
}
