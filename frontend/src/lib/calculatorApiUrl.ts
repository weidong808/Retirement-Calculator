/** Server-only URL for the .NET calculator API (used by Next.js route handlers). */
export function getCalculatorApiBase(): string | null {
  const url = process.env.CALCULATOR_API_URL?.trim();
  if (url) {
    return url.replace(/\/$/, "");
  }
  if (process.env.NODE_ENV === "development") {
    // Use 127.0.0.1 — on Windows, "localhost" can resolve to IPv6 while Kestrel listens on IPv4.
    return "http://127.0.0.1:5051";
  }
  return null;
}
