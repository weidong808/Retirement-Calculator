<!-- BEGIN:nextjs-agent-rules -->
# Next.js 16 (frontend)

This is NOT the Next.js you know. Breaking changes vs older versions — read guides in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Frontend agent notes

**Project context:** see root [`AGENTS.md`](../AGENTS.md) and [`ARCHITECTURE.md`](../ARCHITECTURE.md).

## Structure

```
frontend/src/
├── app/           # App Router (page, layout, globals.css)
├── components/    # CalculatorApp, ResultsSection, WizardProgress
├── lib/           # api.ts, validation.ts, fra.ts, format.ts
└── types/         # retirement.ts (DTOs)
```

## Rules

- `"use client"` on interactive wizard/results components.
- API base URL: `process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5051"`.
- Handle `ApiError` from `lib/api.ts` for validation error arrays.
- Charts: Recharts in `ResultsSection.tsx`.
- Do not duplicate C# calculation logic — use the API.

## Commands

```bash
npm run dev      # development
npm run build    # production check
npm run lint     # eslint
```
