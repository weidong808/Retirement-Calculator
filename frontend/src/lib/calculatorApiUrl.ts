/** Server-only URL for the .NET calculator API (used by Next.js route handlers). */
export function getCalculatorApiBase(): string | null {
  const url = process.env.CALCULATOR_API_URL?.trim();
  if (url) {
    return url.replace(/\/$/, "");
  }
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:5051";
  }
  return null;
}
