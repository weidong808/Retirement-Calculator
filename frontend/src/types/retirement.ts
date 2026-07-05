export type MaritalStatus = "Single" | "Married";
export type TaxLawScenario = "TCJA" | "PreTCJA";

export interface RetirementPlanInput {
  firstName?: string;
  birthDate?: string;
  yourAge?: number;
  spouseAge?: number;
  maritalStatus: MaritalStatus;
  state?: string;
  targetRetirementAge: number;
  lifeExpectancy?: number;
  traditional401k?: number;
  roth401k?: number;
  taxableBrokerage?: number;
  hsa?: number;
  annualPreTax401k?: number;
  annualRothContribution?: number;
  householdIncome?: number;
  spouseIncome?: number;
  retirementSpending?: number;
  travelBudget?: number;
  pensionIncome?: number;
  yourMonthlySsFra?: number;
  spouseMonthlySsFra?: number;
  yourClaimAge?: number;
  spouseClaimAge?: number;
  yourFra?: number;
  annualRothConversionPre?: number;
  expectedReturnPre?: number;
  expectedReturnPost?: number;
  inflationRate?: number;
  ssCola?: number;
  stateIncomeTax?: number;
  taxLaw?: TaxLawScenario;
  annualRothConversionPost?: number;
}

export interface AgeComparisonRow {
  age: number;
  portfolio: number;
  yearsNeeded: number;
  monthlyIncome: number;
  healthcareGap: number;
  successRate: number;
  estate: number;
}

export interface SsClaimingRow {
  claimAge: number;
  monthlyBenefit: number;
  annualBenefit: number;
  lifetimeTo85: number;
  lifetimeTo90: number;
  breakeven: string;
  vs70: string;
}

export interface YearByYearRow {
  year: number;
  age: number;
  preTax: number;
  roth: number;
  taxable: number;
  total: number;
  rmd: number;
  ssIncome: number;
  rothConversion: number;
  spending: number;
  federalTax: number;
  irmaa: number;
  netCashFlow: number;
}

export interface PercentileBand {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface MonteCarloResult {
  successRate: number;
  percentiles: Record<string, PercentileBand>;
}

export interface StressTestPoint {
  year: number;
  base: number;
  stress: number;
}

export interface InflationImpactRow {
  age: number;
  year: number;
  purchasingPower: number;
  decline: number;
}

export interface DashboardSummary {
  firstName: string;
  yourAge: number;
  fullRetirementAge: number;
  fullRetirementAgeLabel: string;
  targetRetirementAge: number;
  lifeExpectancy: number;
  claimAge: number;
  successRate: number;
  annualSpending: number;
  estateAt90: number;
}

export interface RetirementPlanResult {
  summary: DashboardSummary;
  ageComparison: AgeComparisonRow[];
  yourSsClaiming: SsClaimingRow[];
  spouseSsClaiming: SsClaimingRow[];
  monteCarlo: MonteCarloResult;
  yearByYear: YearByYearRow[];
  totalFederalTax: number;
  totalStateTax: number;
  totalIrmaa: number;
  effectiveTaxRate: number;
  stressTest: StressTestPoint[];
  inflationImpact: InflationImpactRow[];
  portfolioAtRetirement: number;
}

export interface FormState {
  firstName: string;
  birthDate: string;
  yourAge: string;
  spouseAge: string;
  maritalStatus: MaritalStatus | "";
  state: string;
  targetRetirementAge: string;
  lifeExpectancy: string;
  traditional401k: string;
  roth401k: string;
  taxableBrokerage: string;
  hsa: string;
  annualPreTax401k: string;
  annualRothContribution: string;
  householdIncome: string;
  spouseIncome: string;
  retirementSpending: string;
  travelBudget: string;
  pensionIncome: string;
  yourMonthlySsFra: string;
  spouseMonthlySsFra: string;
  yourClaimAge: string;
  spouseClaimAge: string;
  yourFra: string;
  annualRothConversionPre: string;
  expectedReturnPre: string;
  expectedReturnPost: string;
  inflationRate: string;
  ssCola: string;
  stateIncomeTax: string;
  taxLaw: TaxLawScenario;
  annualRothConversionPost: string;
}

export const defaultFormState: FormState = {
  firstName: "",
  birthDate: "",
  yourAge: "",
  spouseAge: "",
  maritalStatus: "",
  state: "",
  targetRetirementAge: "",
  lifeExpectancy: "90",
  traditional401k: "",
  roth401k: "",
  taxableBrokerage: "",
  hsa: "",
  annualPreTax401k: "",
  annualRothContribution: "",
  householdIncome: "",
  spouseIncome: "",
  retirementSpending: "",
  travelBudget: "",
  pensionIncome: "",
  yourMonthlySsFra: "",
  spouseMonthlySsFra: "",
  yourClaimAge: "67",
  spouseClaimAge: "67",
  yourFra: "67",
  annualRothConversionPre: "",
  expectedReturnPre: "7",
  expectedReturnPost: "6",
  inflationRate: "2.5",
  ssCola: "2.5",
  stateIncomeTax: "5",
  taxLaw: "TCJA",
  annualRothConversionPost: "",
};

export function formToInput(form: FormState): RetirementPlanInput {
  const num = (v: string) => (v === "" ? 0 : Number(v));
  const age = form.birthDate ? undefined : num(form.yourAge);
  const fra = form.birthDate ? undefined : num(form.yourFra) || 67;
  return {
    firstName: form.firstName || "Valued Client",
    birthDate: form.birthDate || undefined,
    yourAge: age ?? 0,
    spouseAge: num(form.spouseAge),
    maritalStatus: (form.maritalStatus || "Single") as MaritalStatus,
    state: form.state,
    targetRetirementAge: num(form.targetRetirementAge) || num(form.yourAge) + 20,
    lifeExpectancy: num(form.lifeExpectancy) || 90,
    traditional401k: num(form.traditional401k),
    roth401k: num(form.roth401k),
    taxableBrokerage: num(form.taxableBrokerage),
    hsa: num(form.hsa),
    annualPreTax401k: num(form.annualPreTax401k),
    annualRothContribution: num(form.annualRothContribution),
    householdIncome: num(form.householdIncome),
    spouseIncome: num(form.spouseIncome),
    retirementSpending: num(form.retirementSpending),
    travelBudget: num(form.travelBudget),
    pensionIncome: num(form.pensionIncome),
    yourMonthlySsFra: num(form.yourMonthlySsFra),
    spouseMonthlySsFra: num(form.spouseMonthlySsFra),
    yourClaimAge: num(form.yourClaimAge) || 67,
    spouseClaimAge: num(form.spouseClaimAge) || 67,
    yourFra: fra ?? 67,
    annualRothConversionPre: num(form.annualRothConversionPre),
    expectedReturnPre: num(form.expectedReturnPre) || 7,
    expectedReturnPost: num(form.expectedReturnPost) || 6,
    inflationRate: num(form.inflationRate) || 2.5,
    ssCola: num(form.ssCola) || 2.5,
    stateIncomeTax: num(form.stateIncomeTax) || 5,
    taxLaw: form.taxLaw,
    annualRothConversionPost: num(form.annualRothConversionPost),
  };
}
