"use client";

import { useMemo, useState } from "react";
import { WizardProgress } from "@/components/WizardProgress";
import { ResultsSection } from "@/components/ResultsSection";
import { RangeSelect } from "@/components/RangeSelect";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { Container } from "@/components/Container";
import { PageHero } from "@/components/PageHero";
import { ApiError, calculatePlan } from "@/lib/api";
import { calculateAgeFromBirthDate, getFraFromBirthDate } from "@/lib/fra";
import { getStateTaxRate } from "@/lib/stateTaxRates";
import { usStates } from "@/lib/states";
import {
  balanceRanges,
  claimAgeOptions,
  contributionRanges,
  incomeRanges,
  inflationPresets,
  lifeExpectancyOptions,
  pensionRanges,
  returnPresets,
  retirementAgeOptions,
  spendingRanges,
  ssBenefitRanges,
  stateTaxPresets,
  travelRanges,
} from "@/lib/ranges";
import { hasErrors, validateStep, type StepErrors } from "@/lib/validation";
import {
  defaultFormState,
  formToInput,
  type FormState,
  type RetirementPlanResult,
} from "@/types/retirement";

const TOTAL_STEPS = 4;

function localDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Realistic demo profile — lets visitors see full results in one click. */
function buildSampleForm(): FormState {
  const today = new Date();
  return {
    ...defaultFormState,
    birthDate: localDateString(today.getFullYear() - 55, today.getMonth() + 1, today.getDate()),
    maritalStatus: "Single",
    state: "California",
    targetRetirementAge: "65",
    lifeExpectancy: "90",
    traditional401k: "625000",
    roth401k: "175000",
    taxableBrokerage: "175000",
    hsa: "37500",
    annualPreTax401k: "19000",
    annualRothContribution: "7500",
    householdIncome: "175000",
    retirementSpending: "90000",
    travelBudget: "7500",
    pensionIncome: "0",
    yourMonthlySsFra: "2750",
    yourClaimAge: "67",
    stateIncomeTax: getStateTaxRate("California"),
  };
}

function Field({
  label,
  children,
  hint,
  error,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
}) {
  return (
    <div className="form-group">
      <label>{label}</label>
      {hint && <p className="field-label-hint">{hint}</p>}
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="form-input" {...props} />;
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="form-input" {...props} />;
}

function StepIntro({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="step-intro">
      <h2 className="step-title">{title}</h2>
      <p className="step-subtitle">{subtitle}</p>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="form-section">
      <h3 className="form-section-title">{title}</h3>
      <div className="form-grid">{children}</div>
    </section>
  );
}

export function CalculatorApp() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [result, setResult] = useState<RetirementPlanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepErrors, setStepErrors] = useState<StepErrors>({});
  const [returnPreset, setReturnPreset] = useState("moderate");

  const isMarried = form.maritalStatus === "Married";
  const computedAge = useMemo(
    () => (form.birthDate ? calculateAgeFromBirthDate(form.birthDate) : null),
    [form.birthDate]
  );
  const fraInfo = useMemo(
    () => (form.birthDate ? getFraFromBirthDate(form.birthDate) : null),
    [form.birthDate]
  );

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setStepErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const updateState = (stateName: string) => {
    setForm((prev) => ({
      ...prev,
      state: stateName,
      stateIncomeTax: stateName ? getStateTaxRate(stateName) : prev.stateIncomeTax,
    }));
    setStepErrors((prev) => {
      const next = { ...prev };
      delete next.state;
      return next;
    });
  };

  const handleEditAnswers = () => {
    setStep(1);
    setStepErrors({});
    setError(null);
    window.scrollTo(0, 0);
  };

  const handleStartOver = () => {
    setForm(defaultFormState);
    setResult(null);
    setStep(1);
    setStepErrors({});
    setError(null);
    setReturnPreset("moderate");
    window.scrollTo(0, 0);
  };

  const applyReturnPreset = (presetId: string) => {
    setReturnPreset(presetId);
    const preset = returnPresets.find((p) => p.id === presetId);
    if (preset && presetId !== "custom") {
      setForm((prev) => ({
        ...prev,
        expectedReturnPre: preset.pre,
        expectedReturnPost: preset.post,
      }));
    }
  };

  const runStepValidation = (currentStep: number) => {
    const errors = validateStep(currentStep, form);
    setStepErrors(errors);
    return !hasErrors(errors);
  };

  const handleNext = () => {
    if (!runStepValidation(step)) return;
    setError(null);
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
    setStepErrors({});
    window.scrollTo(0, 0);
  };

  const runCalculation = async (formToRun: FormState) => {
    setLoading(true);
    setError(null);
    try {
      const input = formToInput(formToRun);
      const plan = await calculatePlan(input);
      setResult(plan);
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.errors.join(" "));
      } else {
        setError(e instanceof Error ? e.message : "Calculation failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    for (let s = 1; s <= TOTAL_STEPS; s++) {
      const errors = validateStep(s, form);
      if (hasErrors(errors)) {
        setStep(s);
        setStepErrors(errors);
        setError("Please fix the highlighted fields before calculating.");
        return;
      }
    }
    await runCalculation(form);
  };

  const handleSamplePlan = async () => {
    const sample = buildSampleForm();
    setForm(sample);
    setStepErrors({});
    await runCalculation(sample);
  };

  return (
    <>
      <AppHeader />
      <main className="page-wrap">
        <PageHero />
        <Container className="page-content">
          <div className="calculator-shell">
            <WizardProgress currentStep={step} />

      <div className="form-container">
        {loading && (
          <div className="loading-overlay" aria-live="polite">
            <div className="loading-spinner" />
            <p className="loading-title">Simulating 1,000 market scenarios…</p>
            <p className="loading-subtitle">Taxes · Social Security · RMDs · Medicare</p>
          </div>
        )}
        {step === 1 && (
          <div className="wizard-step">
            <StepIntro
              title="About you"
              subtitle="Basic details so we can estimate your timeline."
            />
            {!result && (
              <div className="sample-plan-banner">
                <span>Just curious? Skip the form —</span>
                <button type="button" className="sample-plan-button" onClick={handleSamplePlan} disabled={loading}>
                  See a sample result →
                </button>
              </div>
            )}
            <div className="form-grid">
              <Field label="When were you born?" error={stepErrors.birthDate}>
                <Input type="date" value={form.birthDate} onChange={(e) => update("birthDate", e.target.value)} />
                {computedAge !== null && (
                  <span className="field-hint">You are about {computedAge} years old today</span>
                )}
              </Field>
              <Field label="Marital status" error={stepErrors.maritalStatus}>
                <Select value={form.maritalStatus} onChange={(e) => update("maritalStatus", e.target.value)}>
                  <option value="">Choose…</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                </Select>
              </Field>
            </div>
            <div className="form-grid">
              {isMarried && (
                <Field label="Spouse's age" error={stepErrors.spouseAge}>
                  <Input type="number" min={18} max={100} value={form.spouseAge} onChange={(e) => update("spouseAge", e.target.value)} placeholder="e.g. 58" />
                </Field>
              )}
              <Field label="When do you plan to retire?" error={stepErrors.targetRetirementAge}>
                <Select value={form.targetRetirementAge} onChange={(e) => update("targetRetirementAge", e.target.value)}>
                  <option value="">Choose an age…</option>
                  {retirementAgeOptions.map((age) => (
                    <option key={age} value={age}>Age {age}</option>
                  ))}
                </Select>
              </Field>
              <Field
                label="How long should we plan for?"
                hint="A rough guess is fine — many people use age 90."
                error={stepErrors.lifeExpectancy}
              >
                <Select value={form.lifeExpectancy} onChange={(e) => update("lifeExpectancy", e.target.value)}>
                  {lifeExpectancyOptions.map((age) => (
                    <option key={age} value={age}>Plan through age {age}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="form-grid single">
              <Field label="State you live in (optional)" hint="We’ll estimate your state tax rate automatically.">
                <Select value={form.state} onChange={(e) => updateState(e.target.value)}>
                  <option value="">Choose a state…</option>
                  {usStates.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-step">
            <StepIntro
              title="Your money"
              subtitle="Pick the range closest to your situation — exact numbers aren't required."
            />

            <FormSection title="Savings & investments">
              <Field
                label="Work retirement accounts (401k, traditional IRA)"
                hint="Money you've saved pre-tax in employer or IRA accounts."
              >
                <RangeSelect ranges={balanceRanges} value={form.traditional401k} onChange={(v) => update("traditional401k", v)} />
              </Field>
              <Field
                label="Roth accounts (Roth 401k or Roth IRA)"
                hint="Already-taxed savings that can be withdrawn tax-free in retirement."
              >
                <RangeSelect ranges={balanceRanges} value={form.roth401k} onChange={(v) => update("roth401k", v)} />
              </Field>
              <Field label="Regular investment account" hint="Taxable brokerage or mutual fund accounts.">
                <RangeSelect ranges={balanceRanges} value={form.taxableBrokerage} onChange={(v) => update("taxableBrokerage", v)} />
              </Field>
              <Field label="Health savings account (HSA)" hint="Skip if you don't have one.">
                <RangeSelect ranges={balanceRanges} value={form.hsa} onChange={(v) => update("hsa", v)} />
              </Field>
            </FormSection>

            <FormSection title="How much you save each year">
              <Field label="Into 401k (before taxes)">
                <RangeSelect ranges={contributionRanges} value={form.annualPreTax401k} onChange={(v) => update("annualPreTax401k", v)} customStep={100} />
              </Field>
              <Field label="Into Roth IRA or Roth 401k">
                <RangeSelect ranges={contributionRanges} value={form.annualRothContribution} onChange={(v) => update("annualRothContribution", v)} customStep={100} />
              </Field>
            </FormSection>

            <FormSection title="Income & spending">
              <Field label="Household income today (before taxes)">
                <RangeSelect ranges={incomeRanges} value={form.householdIncome} onChange={(v) => update("householdIncome", v)} />
              </Field>
              {isMarried && (
                <Field label="Spouse's income (before taxes)">
                  <RangeSelect ranges={incomeRanges} value={form.spouseIncome} onChange={(v) => update("spouseIncome", v)} />
                </Field>
              )}
              <Field
                label="Yearly spending in retirement"
                hint="Everyday living costs — housing, food, healthcare, etc."
                error={stepErrors.retirementSpending}
              >
                <RangeSelect ranges={spendingRanges} value={form.retirementSpending} onChange={(v) => update("retirementSpending", v)} />
              </Field>
              <Field label="Extra for travel & fun each year">
                <RangeSelect ranges={travelRanges} value={form.travelBudget} onChange={(v) => update("travelBudget", v)} />
              </Field>
              <Field label="Pension income (if any)">
                <RangeSelect ranges={pensionRanges} value={form.pensionIncome} onChange={(v) => update("pensionIncome", v)} />
              </Field>
            </FormSection>
          </div>
        )}

        {step === 3 && (
          <div className="wizard-step">
            <StepIntro
              title="Social Security"
              subtitle="Check your estimate at ssa.gov — pick a range here if you're not sure."
            />

            {fraInfo && (
              <div className="info-banner">
                Your full retirement age (per SSA rules): <strong>{fraInfo.label}</strong>
              </div>
            )}

            <div className="form-grid">
              <Field
                label="Your expected monthly Social Security"
                hint="At full retirement age — from your SSA statement or ssa.gov."
              >
                <RangeSelect ranges={ssBenefitRanges} value={form.yourMonthlySsFra} onChange={(v) => update("yourMonthlySsFra", v)} customStep={100} />
              </Field>
              {isMarried && (
                <Field label="Spouse's expected monthly Social Security">
                  <RangeSelect ranges={ssBenefitRanges} value={form.spouseMonthlySsFra} onChange={(v) => update("spouseMonthlySsFra", v)} customStep={100} />
                </Field>
              )}
            </div>
            <div className="form-grid">
              <Field label="When will you start taking Social Security?" error={stepErrors.yourClaimAge}>
                <Select value={form.yourClaimAge} onChange={(e) => update("yourClaimAge", e.target.value)}>
                  {claimAgeOptions.map(({ age, label }) => (
                    <option key={age} value={age}>{label}</option>
                  ))}
                </Select>
              </Field>
              {isMarried && (
                <Field label="When will your spouse start?" error={stepErrors.spouseClaimAge}>
                  <Select value={form.spouseClaimAge} onChange={(e) => update("spouseClaimAge", e.target.value)}>
                    {claimAgeOptions.map(({ age, label }) => (
                      <option key={age} value={age}>{label}</option>
                    ))}
                  </Select>
                </Field>
              )}
            </div>

            <CollapsibleSection title="Advanced: Roth conversions before retirement" hint="Optional — moving money from traditional to Roth accounts">
              <Field label="Amount to convert each year (before you retire)">
                <RangeSelect ranges={contributionRanges} value={form.annualRothConversionPre} onChange={(v) => update("annualRothConversionPre", v)} />
              </Field>
            </CollapsibleSection>
          </div>
        )}

        {step === 4 && (
          <div className="wizard-step">
            <StepIntro
              title="Assumptions"
              subtitle="We've picked sensible defaults — adjust only if you want to explore different scenarios."
            />

            <Field label="How might your investments grow?">
              <Select value={returnPreset} onChange={(e) => applyReturnPreset(e.target.value)}>
                {returnPresets.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </Select>
            </Field>

            {returnPreset === "custom" && (
              <div className="form-grid">
                <Field label="Growth rate while working (% per year)" error={stepErrors.expectedReturnPre}>
                  <Input type="number" min={-10} max={20} step={0.5} value={form.expectedReturnPre} onChange={(e) => update("expectedReturnPre", e.target.value)} />
                </Field>
                <Field label="Growth rate in retirement (% per year)" error={stepErrors.expectedReturnPost}>
                  <Input type="number" min={-10} max={20} step={0.5} value={form.expectedReturnPost} onChange={(e) => update("expectedReturnPost", e.target.value)} />
                </Field>
              </div>
            )}

            <div className="form-grid">
              <Field label="Expected inflation">
                <Select value={form.inflationRate} onChange={(e) => update("inflationRate", e.target.value)}>
                  {inflationPresets.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="State income tax (rough estimate)" hint={form.state ? `Suggested for ${form.state} — adjust if needed.` : undefined}>
                <Select value={form.stateIncomeTax} onChange={(e) => update("stateIncomeTax", e.target.value)}>
                  {stateTaxPresets.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <CollapsibleSection title="Advanced settings" hint="Tax rules, Social Security raises, Roth conversions">
              <div className="form-grid">
                <Field label="Federal tax rules">
                  <Select value={form.taxLaw} onChange={(e) => update("taxLaw", e.target.value)}>
                    <option value="TCJA">Current rules (2018 and later)</option>
                    <option value="PreTCJA">Older, higher tax rates (pre-2018)</option>
                  </Select>
                </Field>
                <Field label="Social Security annual increase (COLA)">
                  <Select value={form.ssCola} onChange={(e) => update("ssCola", e.target.value)}>
                    {inflationPresets.map((p) => (
                      <option key={`cola-${p.value}`} value={p.value}>{p.label}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="form-grid single">
                <Field label="Roth conversion each year in retirement">
                  <RangeSelect ranges={contributionRanges} value={form.annualRothConversionPost} onChange={(v) => update("annualRothConversionPost", v)} />
                </Field>
              </div>
            </CollapsibleSection>
          </div>
        )}

        {error && (
          <div className="error-banner" role="alert">{error}</div>
        )}

        <div className="button-group">
          {step > 1 && (
            <button type="button" className="btn-secondary" onClick={() => { setStepErrors({}); setStep((s) => s - 1); }}>
              Back
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button type="button" className="btn-primary" onClick={handleNext}>
              Continue
            </button>
          ) : (
            <button type="button" className="btn-success" onClick={handleCalculate} disabled={loading}>
              {loading ? "Calculating…" : "See My Results"}
            </button>
          )}
        </div>
      </div>

      {result && (
        <div id="results">
          <ResultsSection
            result={result}
            targetRetirementAge={result.summary.targetRetirementAge}
            maritalStatus={form.maritalStatus || "Single"}
            onEditAnswers={handleEditAnswers}
            onStartOver={handleStartOver}
          />
        </div>
      )}

          </div>
        </Container>
      </main>
      <AppFooter />
    </>
  );
}
