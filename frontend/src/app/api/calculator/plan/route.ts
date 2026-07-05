import { NextRequest, NextResponse } from "next/server";
import { getCalculatorApiBase } from "@/lib/calculatorApiUrl";

const LOCAL_API_HINT =
  "Start the API in another terminal: cd backend/src/RetirementCalculator.Api && dotnet run --launch-profile http";

function isBackendUnreachable(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const cause = (error as Error & { cause?: unknown }).cause;
  if (cause === "ECONNREFUSED") return true;
  if (cause && typeof cause === "object" && "code" in cause) {
    return (cause as NodeJS.ErrnoException).code === "ECONNREFUSED";
  }
  return error.message.includes("ECONNREFUSED") || error.message === "fetch failed";
}

export async function POST(request: NextRequest) {
  const apiBase = getCalculatorApiBase();
  if (!apiBase) {
    return NextResponse.json(
      {
        errors: [
          "The calculator is not connected to a backend yet. The site owner needs to set CALCULATOR_API_URL on Vercel.",
        ],
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.text();
    const response = await fetch(`${apiBase}/api/calculator/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const payload = await response.text();
    return new NextResponse(payload, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch (error) {
    const dev = process.env.NODE_ENV === "development";
    return NextResponse.json(
      {
        errors: [
          dev && isBackendUnreachable(error)
            ? `The calculator API is not running. ${LOCAL_API_HINT}`
            : "The calculator service is temporarily unavailable. Please try again in a few minutes.",
        ],
      },
      { status: 503 }
    );
  }
}
