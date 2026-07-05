"use client";

import { useState } from "react";
import { gaugeColor } from "@/components/ScoreGauge";
import { APP_URL } from "@/lib/brand";
import { formatCurrency } from "@/lib/format";

interface ShareCardButtonProps {
  successRate: number;
  outlookLabel: string;
  portfolioAtRetirement: number;
  targetRetirementAge: number;
  claimAge: number;
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Builds a 1200×630 score card as pure SVG, rasterizes it to PNG, and downloads it. */
export function ShareCardButton({
  successRate,
  outlookLabel,
  portfolioAtRetirement,
  targetRetirementAge,
  claimAge,
}: ShareCardButtonProps) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      const W = 1200;
      const H = 630;
      const color = gaugeColor(successRate);
      const r = 120;
      const c = 2 * Math.PI * r;
      const dash = (c * successRate) / 100;

      const siteLabel = new URL(APP_URL).host;
      const stats: Array<[string, string]> = [
        ["Savings at retirement", formatCurrency(portfolioAtRetirement)],
        ["Retiring at", `Age ${targetRetirementAge}`],
        ["Social Security at", `Age ${claimAge}`],
      ];

      const statBlocks = stats
        .map(
          ([label, value], i) => `
        <g transform="translate(${90 + i * 340}, 470)">
          <rect width="310" height="110" rx="16" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.2)"/>
          <text x="24" y="42" font-size="20" fill="rgba(255,255,255,0.75)" font-family="Segoe UI, sans-serif">${esc(label)}</text>
          <text x="24" y="84" font-size="34" font-weight="700" fill="#ffffff" font-family="Segoe UI, sans-serif">${esc(value)}</text>
        </g>`
        )
        .join("");

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1f38"/>
      <stop offset="0.55" stop-color="#123c5e"/>
      <stop offset="1" stop-color="#0f766e"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <text x="90" y="96" font-size="34" font-weight="800" fill="#ffffff" font-family="Segoe UI, sans-serif">Retire<tspan fill="#34d399">Check</tspan></text>
  <text x="90" y="190" font-size="52" font-weight="800" fill="#ffffff" font-family="Segoe UI, sans-serif">My Retirement Readiness</text>
  <text x="90" y="250" font-size="30" fill="rgba(255,255,255,0.8)" font-family="Segoe UI, sans-serif">Outlook: ${esc(outlookLabel)} — based on 1,000 market simulations</text>
  <g transform="translate(960, 315)">
    <circle r="${r}" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="26"/>
    <circle r="${r}" fill="none" stroke="${color}" stroke-width="26" stroke-linecap="round"
      stroke-dasharray="${dash} ${c}" transform="rotate(-90)"/>
    <text y="8" text-anchor="middle" font-size="72" font-weight="800" fill="#ffffff" font-family="Segoe UI, sans-serif">${Math.round(successRate)}%</text>
    <text y="48" text-anchor="middle" font-size="20" fill="rgba(255,255,255,0.75)" font-family="Segoe UI, sans-serif">chance it lasts</text>
  </g>
  ${statBlocks}
  <text x="90" y="330" font-size="24" fill="rgba(255,255,255,0.6)" font-family="Segoe UI, sans-serif">Estimates only — not financial advice.</text>
  <text x="90" y="368" font-size="24" fill="#34d399" font-family="Segoe UI, sans-serif">${esc(siteLabel)}</text>
</svg>`;

      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Could not render share card"));
        img.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = W * 2;
      canvas.height = H * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!png) throw new Error("Could not create image");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(png);
      a.download = "retirecheck-score.png";
      a.click();
      URL.revokeObjectURL(a.href);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" className="btn-outline" onClick={download} disabled={busy}>
      {busy ? "Preparing…" : "⬇ Download score card"}
    </button>
  );
}
