import type { RetirementPlanInput, RetirementPlanResult } from "@/types/retirement";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly errors: string[] = []
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function calculatePlan(
  input: RetirementPlanInput
): Promise<RetirementPlanResult> {
  const response = await fetch("/api/calculator/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const errors: string[] = Array.isArray(body.errors)
      ? body.errors
      : body.error
        ? [body.error]
        : ["Calculation failed"];
    throw new ApiError(errors[0] ?? "Calculation failed", errors);
  }

  return response.json();
}
