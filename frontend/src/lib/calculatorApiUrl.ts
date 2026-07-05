/** Server-only URL for the .NET calculator API (used by Next.js route handlers). */
export function getCalculatorApiBase(): string {
  return process.env.CALCULATOR_API_URL ?? "http://localhost:5051";
}
