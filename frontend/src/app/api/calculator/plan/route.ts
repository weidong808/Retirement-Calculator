import { NextRequest, NextResponse } from "next/server";
import { getCalculatorApiBase } from "@/lib/calculatorApiUrl";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const response = await fetch(`${getCalculatorApiBase()}/api/calculator/plan`, {
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
