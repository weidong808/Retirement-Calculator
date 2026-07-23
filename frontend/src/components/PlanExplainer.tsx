"use client";

import { useEffect, useState } from "react";
import {
  buildSummary,
  parseStreamedExplanation,
  type PlanExplanation,
} from "@/lib/ai/explain";
import type { RetirementPlanResult } from "@/types/retirement";

/**
 * Optional AI narrative for a computed plan. The deterministic numbers stay
 * authoritative — this only explains them. Hidden unless the server reports
 * the explainer is configured.
 *
 * Remounts when the numeric summary changes so a fresh calculation clears the
 * previous narrative without a setState-in-effect reset.
 */
export function PlanExplainer({ result }: { result: RetirementPlanResult }) {
  const summaryKey = JSON.stringify(buildSummary(result));
  return <PlanExplainerInner key={summaryKey} result={result} />;
}

function PlanExplainerInner({ result }: { result: RetirementPlanResult }) {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<PlanExplanation | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/calculator/explain")
      .then((r) => r.json())
      .then((j: { ready?: boolean }) => {
        if (!cancelled) setReady(Boolean(j?.ready));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function explainOnce() {
    const res = await fetch("/api/calculator/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary: buildSummary(result) }),
    });
    const json = (await res.json()) as {
      ok?: boolean;
      error?: string;
      explanation?: PlanExplanation;
    };
    if (!res.ok || !json.ok || !json.explanation) {
      setError(json.error || "Could not generate an explanation.");
      return;
    }
    setExplanation(json.explanation);
  }

  async function explain() {
    setLoading(true);
    setError(null);
    setExplanation(null);
    try {
      const res = await fetch("/api/calculator/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: buildSummary(result), stream: true }),
      });

      if (!res.ok || !res.body) {
        await explainOnce();
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        const partial = parseStreamedExplanation(full);
        if (partial) setExplanation(partial);
      }

      const finalExplanation = parseStreamedExplanation(full);
      // Match JSON validation: overview alone is not enough — need drivers.
      if (!finalExplanation || finalExplanation.drivers.length === 0) {
        await explainOnce();
      }
    } catch {
      try {
        await explainOnce();
      } catch {
        setError("Could not generate an explanation.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white/60 p-5 dark:border-slate-700 dark:bg-slate-900/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Explain my plan in plain English
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            An AI summary of the numbers above. Educational only — it never
            changes your results.
          </p>
        </div>
        {!explanation && (
          <button
            type="button"
            onClick={explain}
            disabled={loading}
            className="inline-flex min-h-11 items-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            {loading ? "Thinking…" : "Explain"}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {explanation && (
        <div className="mt-4 space-y-4 text-sm text-slate-700 dark:text-slate-300">
          <p className="leading-relaxed">{explanation.overview}</p>

          {explanation.drivers.length > 0 && (
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                What most affects this plan
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {explanation.drivers.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}

          {explanation.nextSteps.length > 0 && (
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                Levers to explore
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {explanation.nextSteps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-slate-500 dark:text-slate-500">
            This is educational information, not financial advice.
          </p>
        </div>
      )}
    </section>
  );
}
