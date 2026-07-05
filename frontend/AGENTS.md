<!-- BEGIN:nextjs-agent-rules -->
# Next.js 16 (frontend)

This is NOT the Next.js you know. Breaking changes vs older versions — read guides in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Frontend agent notes

**Project context:** see root [`AGENTS.md`](../AGENTS.md) and [`ARCHITECTURE.md`](../ARCHITECTURE.md).

## Structure

```
frontend/src/
├── app/           # App Router, API proxy route, opengraph-image
├── components/    # CalculatorApp, ResultsSection, ScoreGauge, ShareCardButton
├── lib/           # api.ts, validation.ts, fra.ts, format.ts, calculatorApiUrl.ts
└── types/         # retirement.ts (DTOs)
```

## Rules

- `"use client"` on interactive wizard/results components.
- **API calls:** browser uses `fetch("/api/calculator/plan")` via `lib/api.ts` — not direct to .NET.
- **Server env:** `CALCULATOR_API_URL` in `.env.local` (from `.env.example`); dev fallback `http://127.0.0.1:5051`.
- Handle `ApiError` from `lib/api.ts` for validation error arrays.
- Charts: Recharts in `ResultsSection.tsx` (Monte Carlo fan chart uses `ComposedChart`).
- Do not duplicate C# calculation logic — use the API proxy.

## Commands

```bash
npm run dev      # development
npm run build    # production check
npm run lint     # eslint
```
