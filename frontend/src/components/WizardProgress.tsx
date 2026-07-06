"use client";

const STEPS = ["About You", "Your Money", "Social Security", "Assumptions"];

export function WizardProgress({ currentStep }: { currentStep: number }) {
  const percent = (currentStep / STEPS.length) * 100;

  return (
    <nav className="wizard-progress" aria-label="Progress">
      <p className="wizard-progress-text">
        Step {currentStep} of {STEPS.length}: <strong>{STEPS[currentStep - 1]}</strong>
      </p>
      <div className="wizard-progress-bar">
        <div className="wizard-progress-track">
          <div className="wizard-progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <div className="wizard-progress-steps">
          {STEPS.map((label, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;
            return (
              <div
                key={label}
                className={`wizard-step-item${isActive ? " active" : ""}${isCompleted ? " completed" : ""}`}
              >
                <div className="wizard-step-circle">
                  {isCompleted ? "✓" : stepNum}
                </div>
                <span className="wizard-step-label">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
