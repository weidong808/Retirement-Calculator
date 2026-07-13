import { NextRequest, NextResponse } from "next/server";
import { getCalculatorApiBase } from "@/lib/calculatorApiUrl";

export async function GET(request: NextRequest) {
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

  const annualEarnings = request.nextUrl.searchParams.get("annualEarnings") ?? "";

  try {
    const response = await fetch(
      `${apiBase}/api/calculator/ss-estimate?annualEarnings=${encodeURIComponent(annualEarnings)}`
    );

    const payload = await response.text();
    return new NextResponse(payload, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      {
        errors: [
          "The calculator service is temporarily unavailable. Please try again in a few minutes.",
        ],
      },
      { status: 503 }
    );
  }
}
