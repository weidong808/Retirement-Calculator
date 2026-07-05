# Retirement Calculator Pro — Agent Guide

Use this file at the start of new chats: `@AGENTS.md` (with `@ARCHITECTURE.md` for depth).

## Product

US-focused retirement planning calculator: **4-step wizard** → results (animated gauge, Monte Carlo fan chart, SS claiming, tax/RMD projections, share card). **Estimates only — not financial advice.** Link to [SSA.gov](https://www.ssa.gov/planners/retire/) in UI.

**Live:** https://retirecheck-wshi.vercel.app

## Stack

| Layer | Path | Tech |
|-------|------|------|
| UI | `frontend/` | Next.js 16, React, TypeScript, Tailwind, Recharts |
| API proxy | `frontend/src/app/api/calculator/plan/` | Next.js route → .NET backend |
| API | `backend/src/RetirementCalculator.Api/` | ASP.NET Core 10 Web API |
| Logic | `backend/src/RetirementCalculator.Domain/` | Pure C# services + models |
| Tests | `backend/tests/` | xUnit (domain + API integration) |

**Hard rule:** All financial math lives in `RetirementCalculator.Domain`. No calculation logic in React components or API controllers.

## Git & branches

| Branch | Purpose |
|--------|---------|
| `main` | Production (Vercel frontend + Render API) |
| `dev` | Day-to-day feature work |

- Repo: https://github.com/weidong808/Retirement-Calculator
- Do **not** commit secrets (`.env.local`, `appsettings.*.local.json`, keys, user exports). See `.gitignore`.
- Copy env from `frontend/.env.example` → `frontend/.env.local`.
- Only commit when the user asks.

## Run locally

```powershell
# Terminal 1 — API (required)
cd backend/src/RetirementCalculator.Api
dotnet run --launch-profile http

# Terminal 2 — Frontend
cd frontend
npm install   # first time only
npm run dev
```

- App: http://localhost:3000  
- API: http://127.0.0.1:5051  
- Tests: `cd backend && dotnet test`  
- Frontend build: `cd frontend && npm run build`

## API

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/calculator/plan` | Browser → Next.js proxy → .NET. Body: `RetirementPlanInput` (camelCase JSON) |
| GET | `/api/calculator/fra?birthDate=YYYY-MM-DD` | SSA FRA lookup (direct to API in dev tools) |

Server env: `CALCULATOR_API_URL` in `frontend/.env.local` (see `.env.example`).

Validation errors return `{ "errors": ["..."] }` with HTTP 400.

## Key files

| Area | Files |
|------|-------|
| Wizard UI | `frontend/src/components/CalculatorApp.tsx` |
| Results | `frontend/src/components/ResultsSection.tsx` |
| Score gauge | `frontend/src/components/ScoreGauge.tsx` |
| Share card | `frontend/src/components/ShareCardButton.tsx` |
| API proxy | `frontend/src/app/api/calculator/plan/route.ts` |
| Client validation | `frontend/src/lib/validation.ts` |
| FRA (client display) | `frontend/src/lib/fra.ts` |
| API client | `frontend/src/lib/api.ts` |
| DTOs (TS) | `frontend/src/types/retirement.ts` |
| Engine | `backend/.../Services/RetirementCalculatorEngine.cs` |
| SS / FRA | `SocialSecurityCalculator.cs`, `FraCalculator.cs` |
| Validation | `RetirementPlanValidator.cs`, `RetirementInputNormalizer.cs` |
| Controller | `backend/.../Controllers/CalculatorController.cs` |

## Conventions

1. **Domain change** → add/update tests in `RetirementCalculator.Domain.Tests` or `RetirementCalculator.Api.Tests`.
2. **New input fields** → update C# model, validator, TS types, `formToInput`, and wizard UI together.
3. **Birth date** drives age and SSA FRA; do not reintroduce manual FRA dropdown.
4. **UI** matches emerald/teal design system in `globals.css` (navy header, green accents, card layout).
5. **Scope:** minimal diffs; no unrelated refactors.
6. **Finance copy:** avoid guaranteed outcomes; keep disclaimers visible.

## Done (do not re-build unless fixing)

- Next.js wizard + results with Recharts (fan chart, not pie)  
- Animated score gauge, sample plan demo, share card PNG, OG image  
- C# domain port (SS, RMD, tax, IRMAA, Monte Carlo)  
- Birth-date FRA, step validation, API validation  
- Next.js API proxy + Vercel/Render deployment  
- CI: `.github/workflows/ci.yml`  
- Secret-safe `.gitignore` + `frontend/.env.example`  

## Backlog (good next tasks)

- [ ] Excel export (from old prototype behavior)  
- [ ] Docker Compose (API + frontend)  
- [ ] OpenAPI → TypeScript client generation  
- [ ] More domain tests (tax brackets, RMD edge cases)  
- [ ] UI polish: accessibility, mobile, clearer error copy  

## Frontend-specific

See `frontend/AGENTS.md` for Next.js 16 notes (read `node_modules/next/dist/docs/` before assuming APIs).
