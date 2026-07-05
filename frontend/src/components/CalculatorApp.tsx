"use client";

import { useMemo, useState } from "react";
import { WizardProgress } from "@/components/WizardProgress";
import { ResultsSection } from "@/components/ResultsSection";
import { ApiError, calculatePlan } from "@/lib/api";
import { calculateAgeFromBirthDate, getFraFromBirthDate } from "@/lib/fra";
import { hasErrors, validateStep, type StepErrors } from "@/lib/validation";
import {
  defaultFormState,
  formToInput,
  type FormState,
  type RetirementPlanResult,
} from "@/types/retirement";

function Field({
  label,
  children,
  tooltip,
  error,
}: {
  label: string;
  children: React.ReactNode;
  tooltip?: string;
  error?: string;
}) {
  return (
    <div className="form-group">
      <label className="flex items-center gap-2">
        {label}
        {tooltip && (
          <span className="tooltip-icon" title={tooltip}>?</span>
        )}
      </label>
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

export function CalculatorApp() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [result, setResult] = useState<RetirementPlanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepErrors, setStepErrors] = useState<StepErrors>({});

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

  const runStepValidation = (currentStep: number) => {
    const errors = validateStep(currentStep, form);
    setStepErrors(errors);
    return !hasErrors(errors);
  };

  const handleNext = () => {
    if (!runStepValidation(step)) return;
    setError(null);
    setStep((s) => Math.min(5, s + 1));
    setStepErrors({});
    window.scrollTo(0, 0);
  };

  const handleCalculate = async () => {
    for (let s = 1; s <= 5; s++) {
      const errors = validateStep(s, form);
      if (hasErrors(errors)) {
        setStep(s);
        setStepErrors(errors);
        setError("Fix the highlighted fields before calculating.");
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const input = formToInput(form);
      const plan = await calculatePlan(input);
      setResult(plan);
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (e) {
      if (e instanceof ApiError && e.errors.length > 1) {
        setError(e.errors.join(" "));
      } else {
        setError(e instanceof Error ? e.message : "Calculation failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="calculator-shell">
      <header className="app-header">
        <h1>Retirement Calculator Pro</h1>
        <p>Comprehensive Plan for Your Retirement Future</p>
      </header>

      <div className="disclaimer disclaimer-top">
        <strong>Estimates only.</strong> Not financial advice. Results use your assumptions and simplified US tax/SS rules.
      </div>

      <WizardProgress currentStep={step} />

      <div className="form-container">
        {step === 1 && (
          <div className="wizard-step">
            <h2 className="step-title">Step 1: Personal Profile</h2>
            <div className="form-grid">
              <Field label="First Name (Optional)">
                <Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Enter your first name" />
              </Field>
              <Field label="Birth Date" error={stepErrors.birthDate}>
                <Input type="date" value={form.birthDate} onChange={(e) => update("birthDate", e.target.value)} />
                {computedAge !== null && (
                  <span className="field-hint">Current age: {computedAge}</span>
                )}
              </Field>
            </div>
            <div className="form-grid">
              <Field label="Marital Status" error={stepErrors.maritalStatus}>
                <Select value={form.maritalStatus} onChange={(e) => update("maritalStatus", e.target.value)}>
                  <option value="">-- Select --</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                </Select>
              </Field>
              {isMarried && (
                <Field label="Spouse Age" error={stepErrors.spouseAge}>
                  <Input type="number" min={18} max={100} value={form.spouseAge} onChange={(e) => update("spouseAge", e.target.value)} placeholder="e.g., 44" />
                </Field>
              )}
            </div>
            <div className="form-grid">
              <Field label="State of Residence">
                <Input value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="e.g., California" />
              </Field>
              <Field label="Target Retirement Age" error={stepErrors.targetRetirementAge}>
                <Input type="number" min={50} max={85} value={form.targetRetirementAge} onChange={(e) => update("targetRetirementAge", e.target.value)} placeholder="e.g., 65" />
              </Field>
            </div>
            <div className="form-grid single">
              <Field label="Life Expectancy" error={stepErrors.lifeExpectancy}>
                <Input type="number" min={65} max={110} value={form.lifeExpectancy} onChange={(e) => update("lifeExpectancy", e.target.value)} placeholder="e.g., 90" />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-step">
            <h2 className="step-title">Step 2: Account Balances</h2>
            <div className="form-grid">
              <Field label="Traditional 401k/IRA Balance">
                <Input type="number" min={0} step={1000} value={form.traditional401k} onChange={(e) => update("traditional401k", e.target.value)} placeholder="e.g., 500000" />
              </Field>
              <Field label="Roth 401k/IRA Balance">
                <Input type="number" min={0} step={1000} value={form.roth401k} onChange={(e) => update("roth401k", e.target.value)} placeholder="e.g., 100000" />
              </Field>
            </div>
            <div className="form-grid">
              <Field label="Taxable Brokerage Balance">
                <Input type="number" min={0} step={1000} value={form.taxableBrokerage} onChange={(e) => update("taxableBrokerage", e.target.value)} placeholder="e.g., 200000" />
              </Field>
              <Field label="HSA Balance">
                <Input type="number" min={0} step={1000} value={form.hsa} onChange={(e) => update("hsa", e.target.value)} placeholder="e.g., 50000" />
              </Field>
            </div>
            <div className="form-grid">
              <Field label="Annual 401k Pre-tax Contribution">
                <Input type="number" min={0} step={100} value={form.annualPreTax401k} onChange={(e) => update("annualPreTax401k", e.target.value)} placeholder="e.g., 23500" />
              </Field>
              <Field label="Annual Roth Contribution">
                <Input type="number" min={0} step={100} value={form.annualRothContribution} onChange={(e) => update("annualRothContribution", e.target.value)} placeholder="e.g., 7000" />
              </Field>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="wizard-step">
            <h2 className="step-title">Step 3: Income &amp; Spending</h2>
            <div className="form-grid">
              <Field label="Current Household Income">
                <Input type="number" min={0} step={1000} value={form.householdIncome} onChange={(e) => update("householdIncome", e.target.value)} placeholder="e.g., 150000" />
              </Field>
              {isMarried && (
                <Field label="Spouse Income">
                  <Input type="number" min={0} step={1000} value={form.spouseIncome} onChange={(e) => update("spouseIncome", e.target.value)} placeholder="e.g., 80000" />
                </Field>
              )}
            </div>
            <div className="form-grid">
              <Field label="Estimated Annual Retirement Spending" error={stepErrors.retirementSpending}>
                <Input type="number" min={0} step={1000} value={form.retirementSpending} onChange={(e) => update("retirementSpending", e.target.value)} placeholder="e.g., 100000" />
              </Field>
              <Field label="Travel &amp; Discretionary Budget">
                <Input type="number" min={0} step={1000} value={form.travelBudget} onChange={(e) => update("travelBudget", e.target.value)} placeholder="e.g., 20000" />
              </Field>
            </div>
            <div className="form-grid single">
              <Field label="Pension Income (if any)">
                <Input type="number" min={0} step={1000} value={form.pensionIncome} onChange={(e) => update("pensionIncome", e.target.value)} placeholder="e.g., 30000" />
              </Field>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="wizard-step">
            <h2 className="step-title">Step 4: Social Security</h2>
            <div className="form-grid">
              <Field label="Your Estimated Monthly Benefit at FRA" tooltip="Full Retirement Age benefit amount">
                <Input type="number" min={0} step={100} value={form.yourMonthlySsFra} onChange={(e) => update("yourMonthlySsFra", e.target.value)} placeholder="e.g., 3000" />
              </Field>
              {isMarried && (
                <Field label="Spouse Estimated Monthly Benefit at FRA">
                  <Input type="number" min={0} step={100} value={form.spouseMonthlySsFra} onChange={(e) => update("spouseMonthlySsFra", e.target.value)} placeholder="e.g., 2500" />
                </Field>
              )}
            </div>
            <div className="form-grid">
              <Field label="Your Planned Claiming Age" error={stepErrors.yourClaimAge}>
                <Input type="number" min={62} max={70} value={form.yourClaimAge} onChange={(e) => update("yourClaimAge", e.target.value)} placeholder="e.g., 67" />
              </Field>
              {isMarried && (
                <Field label="Spouse Planned Claiming Age" error={stepErrors.spouseClaimAge}>
                  <Input type="number" min={62} max={70} value={form.spouseClaimAge} onChange={(e) => update("spouseClaimAge", e.target.value)} placeholder="e.g., 67" />
                </Field>
              )}
            </div>
            <div className="form-grid">
              <Field label="Your Full Retirement Age (FRA)" tooltip="Derived from birth date per SSA rules">
                <Input
                  readOnly
                  value={fraInfo?.label ?? "Enter birth date in Step 1"}
                  className="form-input form-input-readonly"
                />
              </Field>
              <Field label="Annual Roth Conversion Amount (Pre-Retirement)">
                <Input type="number" min={0} step={1000} value={form.annualRothConversionPre} onChange={(e) => update("annualRothConversionPre", e.target.value)} placeholder="e.g., 50000" />
              </Field>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="wizard-step">
            <h2 className="step-title">Step 5: Market &amp; Tax Settings</h2>
            <div className="form-grid">
              <Field label="Expected Annual Return (Pre-Retirement)" error={stepErrors.expectedReturnPre}>
                <Input type="number" min={-10} max={20} step={0.5} value={form.expectedReturnPre} onChange={(e) => update("expectedReturnPre", e.target.value)} />
              </Field>
              <Field label="Expected Annual Return (Post-Retirement)" error={stepErrors.expectedReturnPost}>
                <Input type="number" min={-10} max={20} step={0.5} value={form.expectedReturnPost} onChange={(e) => update("expectedReturnPost", e.target.value)} />
              </Field>
            </div>
            <div className="form-grid">
              <Field label="Inflation Rate (%)">
                <Input type="number" min={0} max={10} step={0.1} value={form.inflationRate} onChange={(e) => update("inflationRate", e.target.value)} />
              </Field>
              <Field label="Social Security COLA Rate (%)">
                <Input type="number" min={0} max={10} step={0.1} value={form.ssCola} onChange={(e) => update("ssCola", e.target.value)} />
              </Field>
            </div>
            <div className="form-grid">
              <Field label="State Income Tax Rate (%)">
                <Input type="number" min={0} max={15} step={0.1} value={form.stateIncomeTax} onChange={(e) => update("stateIncomeTax", e.target.value)} />
              </Field>
              <Field label="Tax Law Scenario">
                <Select value={form.taxLaw} onChange={(e) => update("taxLaw", e.target.value)}>
                  <option value="TCJA">TCJA Extended (Current)</option>
                  <option value="PreTCJA">Pre-TCJA Rates</option>
                </Select>
              </Field>
            </div>
            <div className="form-grid single">
              <Field label="Annual Roth Conversion Amount (Post-Retirement)">
                <Input type="number" min={0} step={1000} value={form.annualRothConversionPost} onChange={(e) => update("annualRothConversionPost", e.target.value)} placeholder="e.g., 30000" />
              </Field>
            </div>
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
          {step < 5 ? (
            <button type="button" className="btn-primary" onClick={handleNext}>
              Next
            </button>
          ) : (
            <button type="button" className="btn-success" onClick={handleCalculate} disabled={loading}>
              {loading ? "Calculating…" : "Calculate My Plan"}
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
          />
        </div>
      )}
    </div>
  );
}
