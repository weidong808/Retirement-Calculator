"use client";

import { useEffect, useRef, useState } from "react";

/** Ease-out cubic for a satisfying settle. */
function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/** Animate a number from 0 to `target` once on mount. */
export function useCountUp(target: number, durationMs = 1400): number {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      setValue(target * easeOut(progress));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, durationMs]);

  return value;
}

/** Number that counts up on mount, rendered through a formatter. */
export function CountUpValue({
  value,
  format,
}: {
  value: number;
  format: (v: number) => string;
}) {
  const animated = useCountUp(value);
  return <span>{format(animated)}</span>;
}

export function gaugeColor(rate: number): string {
  if (rate > 90) return "#10b981"; // strong — emerald
  if (rate > 75) return "#34d399"; // good — light emerald
  if (rate > 50) return "#f59e0b"; // fair — amber
  return "#ef4444"; // at risk — red
}

interface ScoreGaugeProps {
  /** Success rate, 0–100 */
  rate: number;
  label?: string;
  size?: number;
}

/**
 * Animated radial gauge — the centerpiece of the results hero.
 * Pure SVG, no dependencies.
 */
export function ScoreGauge({ rate, label = "chance it lasts", size = 148 }: ScoreGaugeProps) {
  const animated = useCountUp(rate);
  const stroke = 11;
  const r = (size - stroke) / 2 - 2;
  const c = 2 * Math.PI * r;
  const color = gaugeColor(rate);

  return (
    <div className="score-gauge" style={{ width: size, height: size }} role="img" aria-label={`${Math.round(rate)}% ${label}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * animated) / 100}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      </svg>
      <div className="score-gauge-center">
        <span className="score-gauge-value">{Math.round(animated)}%</span>
        <span className="score-gauge-label">{label}</span>
      </div>
    </div>
  );
}
