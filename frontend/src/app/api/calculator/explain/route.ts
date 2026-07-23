import { NextResponse } from "next/server";
import { getExplainerConfig } from "@/lib/ai/config";
import { checkRateLimit } from "@/lib/ai/rateLimit";
import {
  buildExplainMessages,
  parseExplanation,
  type ExplainSummary,
} from "@/lib/ai/explain";

export const runtime = "nodejs";

function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

const NUMERIC_FIELDS: (keyof ExplainSummary)[] = [
  "successRate",
  "targetRetirementAge",
  "claimAge",
  "fullRetirementAge",
  "lifeExpectancy",
  "annualSpending",
  "portfolioAtRetirement",
  "estateAt90",
  "effectiveTaxRate",
  "totalFederalTax",
  "totalStateTax",
  "totalIrmaa",
];

/** Coerce the posted summary to numbers-only, dropping anything unexpected. */
function sanitizeSummary(raw: unknown): ExplainSummary | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const out = {} as ExplainSummary;
  for (const field of NUMERIC_FIELDS) {
    const value = obj[field];
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    out[field] = value;
  }
  return out;
}

export function GET() {
  const { configured, model } = getExplainerConfig();
  return NextResponse.json({ ok: true, ready: configured, model });
}

export async function POST(req: Request) {
  const config = getExplainerConfig();
  if (!config.configured) {
    return NextResponse.json(
      { ok: false, error: "The explainer is not available." },
      { status: 503 },
    );
  }

  if (!checkRateLimit(clientIp(req)).allowed) {
    return NextResponse.json(
      { ok: false, error: "Please wait a moment before asking again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const summary = sanitizeSummary((body as { summary?: unknown })?.summary);
  if (!summary) {
    return NextResponse.json(
      { ok: false, error: "Missing plan results." },
      { status: 400 },
    );
  }

  const { system, user } = buildExplainMessages(summary);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "Could not generate an explanation. Try again." },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const explanation = parseExplanation(
      data.choices?.[0]?.message?.content ?? "",
    );
    if (!explanation) {
      return NextResponse.json(
        { ok: false, error: "Could not generate an explanation. Try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, explanation });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not generate an explanation. Try again." },
      { status: 502 },
    );
  }
}
