export interface RangeOption {
  label: string;
  value: number;
}

export const CUSTOM_RANGE_VALUE = -1;

/** Account balance ranges — midpoint used for estimates */
export const balanceRanges: RangeOption[] = [
  { label: "None / $0", value: 0 },
  { label: "Under $25,000", value: 12_500 },
  { label: "$25,000 – $50,000", value: 37_500 },
  { label: "$50,000 – $100,000", value: 75_000 },
  { label: "$100,000 – $250,000", value: 175_000 },
  { label: "$250,000 – $500,000", value: 375_000 },
  { label: "$500,000 – $750,000", value: 625_000 },
  { label: "$750,000 – $1 million", value: 875_000 },
  { label: "Over $1 million", value: 1_250_000 },
];

export const incomeRanges: RangeOption[] = [
  { label: "Under $50,000", value: 35_000 },
  { label: "$50,000 – $75,000", value: 62_500 },
  { label: "$75,000 – $100,000", value: 87_500 },
  { label: "$100,000 – $150,000", value: 125_000 },
  { label: "$150,000 – $200,000", value: 175_000 },
  { label: "$200,000 – $300,000", value: 250_000 },
  { label: "Over $300,000", value: 400_000 },
];

export const spendingRanges: RangeOption[] = [
  { label: "Under $40,000", value: 30_000 },
  { label: "$40,000 – $60,000", value: 50_000 },
  { label: "$60,000 – $80,000", value: 70_000 },
  { label: "$80,000 – $100,000", value: 90_000 },
  { label: "$100,000 – $150,000", value: 125_000 },
  { label: "Over $150,000", value: 175_000 },
];

export const contributionRanges: RangeOption[] = [
  { label: "None / $0", value: 0 },
  { label: "Under $5,000", value: 2_500 },
  { label: "$5,000 – $10,000", value: 7_500 },
  { label: "$10,000 – $15,000", value: 12_500 },
  { label: "$15,000 – $23,500", value: 19_000 },
  { label: "Over $23,500 (max area)", value: 30_000 },
];

export const ssBenefitRanges: RangeOption[] = [
  { label: "Not sure / skip for now", value: 0 },
  { label: "Under $1,500/month", value: 1_000 },
  { label: "$1,500 – $2,000/month", value: 1_750 },
  { label: "$2,000 – $2,500/month", value: 2_250 },
  { label: "$2,500 – $3,000/month", value: 2_750 },
  { label: "$3,000 – $3,500/month", value: 3_250 },
  { label: "Over $3,500/month", value: 4_000 },
];

export const pensionRanges: RangeOption[] = [
  { label: "None", value: 0 },
  { label: "Under $15,000/year", value: 10_000 },
  { label: "$15,000 – $30,000/year", value: 22_500 },
  { label: "$30,000 – $50,000/year", value: 40_000 },
  { label: "Over $50,000/year", value: 65_000 },
];

export const travelRanges: RangeOption[] = [
  { label: "None / minimal", value: 0 },
  { label: "Under $5,000/year", value: 2_500 },
  { label: "$5,000 – $10,000/year", value: 7_500 },
  { label: "$10,000 – $20,000/year", value: 15_000 },
  { label: "Over $20,000/year", value: 30_000 },
];

export function findMatchingRange(
  ranges: RangeOption[],
  value: string
): RangeOption | undefined {
  if (value === "") return undefined;
  const num = Number(value);
  if (Number.isNaN(num)) return undefined;
  return ranges.find((r) => r.value === num);
}

export function isCustomRangeValue(ranges: RangeOption[], value: string): boolean {
  if (value === "") return false;
  const num = Number(value);
  if (Number.isNaN(num)) return true;
  return !ranges.some((r) => r.value === num);
}

export const retirementAgeOptions = [55, 60, 62, 65, 67, 70, 72, 75];

export const lifeExpectancyOptions = [85, 88, 90, 93, 95, 100];

export const claimAgeOptions = [
  { age: 62, label: "62 — earliest (smaller monthly check)" },
  { age: 63, label: "63" },
  { age: 64, label: "64" },
  { age: 65, label: "65" },
  { age: 66, label: "66" },
  { age: 67, label: "67 — full retirement age for most" },
  { age: 68, label: "68" },
  { age: 69, label: "69" },
  { age: 70, label: "70 — maximum monthly benefit" },
];

export const returnPresets = [
  { id: "conservative", label: "Conservative (5% while working, 4% retired)", pre: "5", post: "4" },
  { id: "moderate", label: "Moderate (7% while working, 6% retired)", pre: "7", post: "6" },
  { id: "aggressive", label: "Aggressive (9% while working, 7% retired)", pre: "9", post: "7" },
  { id: "custom", label: "Custom amounts", pre: "", post: "" },
];

export const inflationPresets = [
  { label: "Low (2%)", value: "2" },
  { label: "Typical (2.5%)", value: "2.5" },
  { label: "Higher (3.5%)", value: "3.5" },
];

export const stateTaxPresets = [
  { label: "No state income tax", value: "0" },
  { label: "Low (~3%)", value: "3" },
  { label: "Moderate (~5%)", value: "5" },
  { label: "High (~8%)", value: "8" },
  { label: "Very high (~10%)", value: "10" },
];
