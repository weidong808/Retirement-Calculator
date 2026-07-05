"use client";

const STEPS = [
  "Personal Profile",
  "Account Balances",
  "Income & Spending",
  "Social Security",
  "Market & Tax",
];

export function WizardProgress({ currentStep }: { currentStep: number }) {
  const percent = (currentStep / STEPS.length) * 100;

  return (
    <div className="relative flex flex-wrap justify-between items-center bg-[#f0f4f8] px-5 py-5">
      <div className="absolute top-5 left-0 right-0 h-[3px] bg-[#ddd] z-0 mx-5">
        <div
          className="h-full bg-[#059669] transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      {STEPS.map((label, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;
        return (
          <div key={label} className="relative z-10 flex-1 min-w-[80px] text-center mb-2 sm:mb-0">
            <div
              className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all ${
                isActive || isCompleted
                  ? "bg-[#059669] text-white"
                  : "bg-[#ddd] text-[#666]"
              }`}
            >
              {stepNum}
            </div>
            <div className="text-xs sm:text-sm font-medium text-[#666]">{label}</div>
          </div>
        );
      })}
    </div>
  );
}
