"use client";

import { useState } from "react";
import { ApiError, estimateSsBenefit } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

interface SsQuickEstimateProps {
  /** Pre-fills the earnings input, e.g. from income entered in step 2. */
  defaultEarnings?: string;
  /** Called with the estimated monthly benefit (whole dollars) when the user applies it. */
  onApply: (monthlyAtFra: number) => void;
}

/**
 * Inline helper that estimates the monthly Social Security benefit from annual
 * earnings, so users don't have to log in to ssa.gov mid-wizard. Uses the
 * backend SsQuickEstimator (SSA Quick Calculator-style approximation).
 */
export function SsQuickEstimate({ defaultEarnings = "", onApply }: SsQuickEstimateProps) {
  const [open, setOpen] = useState(false);
  const [earnings, setEarnings] = useState(defaultEarnings);
  const [estimate, setEstimate] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runEstimate = async () => {
    const amount = Number(earnings);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter your annual work income (before taxes).");
      setEstimate(null);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const monthly = await estimateSsBenefit(amount);
      setEstimate(monthly);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Estimate failed — please try again.");
      setEstimate(null);
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        className="ss-estimate-link"
        onClick={() => {
          setEarnings((prev) => prev || defaultEarnings);
          setOpen(true);
        }}
      >
        Don&apos;t know your number? Estimate it from your income →
      </button>
    );
  }

  return (
    <div className="ss-estimate">
      <p className="ss-estimate-title">Quick estimate from your income</p>
      <div className="ss-estimate-row">
        <input
          className="form-input"
          type="number"
          min={1}
          step={1000}
          placeholder="Annual work income, e.g. 85000"
          value={earnings}
          onChange={(e) => {
            setEarnings(e.target.value);
            setEstimate(null);
            setError(null);
          }}
        />
        <button
          type="button"
          className="btn-outline ss-estimate-btn"
          onClick={runEstimate}
          disabled={busy}
        >
          {busy ? "Estimating…" : "Estimate"}
        </button>
      </div>

      {error && <span className="field-error">{error}</span>}

      {estimate !== null && (
        <div className="ss-estimate-result">
          <span>
            ≈ <strong>{formatCurrency(estimate)}/month</strong> at full retirement age
          </span>
          <button type="button" className="btn-primary ss-estimate-btn" onClick={() => onApply(estimate)}>
            Use this
          </button>
        </div>
      )}

      <p className="ss-estimate-disclaimer">
        Rough estimate using SSA&apos;s quick-calculator method — it assumes steady lifetime
        earnings similar to today&apos;s. Your official estimate at{" "}
        <a href="https://www.ssa.gov/myaccount/" target="_blank" rel="noopener noreferrer">
          ssa.gov
        </a>{" "}
        is more accurate.
      </p>
    </div>
  );
}
