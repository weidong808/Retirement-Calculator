# RetireCheck

Free US retirement planning calculator — **live at [retirecheck.weidong-shi.com](https://retirecheck.weidong-shi.com)**

4-step wizard → Monte Carlo simulation (1,000 scenarios), Social Security timing, tax/RMD/IRMAA projections, and a downloadable readiness score card. **Estimates only — not financial advice.**

| | |
|--------|--------|
| **Live demo** | [retirecheck.weidong-shi.com](https://retirecheck.weidong-shi.com) |
| **Hub case study** | [weidong-shi.com/work/retirecheck](https://weidong-shi.com/work/retirecheck) |
| **Hub insight** | [AI in Action · RetireCheck](https://weidong-shi.com/insights/ai-in-action-retirecheck) |
| **Series** | [AI in Action](https://weidong-shi.com) |

## Stack

| Layer | Technology |
|-------|------------|
| UI | Next.js 16, React, TypeScript, Tailwind CSS, Recharts |
| API | ASP.NET Core 10 Web API |
| Logic | C# class library (`RetirementCalculator.Domain`) |
| Tests | xUnit (20 tests) |
| Deploy | Vercel (frontend) + Render (API) |

## Project structure

```
Retirement Calculator/
├── frontend/                 # Next.js app (Vercel)
│   └── src/
│       ├── app/              # App router + API proxy route
│       ├── components/       # Wizard, results, score gauge, share card
│       ├── lib/              # API client, validation, formatters
│       └── types/            # Shared TypeScript DTOs
├── backend/
│   ├── src/
│   │   ├── RetirementCalculator.Api/       # REST API (Render)
│   │   └── RetirementCalculator.Domain/    # Pure calculation logic
│   └── tests/
├── AGENTS.md                 # Agent onboarding
├── ARCHITECTURE.md           # System design + diagrams
└── .cursor/rules/            # Cursor context rules
```

## Run locally

**Start both** — calculations fail if the API is not running.

### 1. Backend API

```powershell
cd backend/src/RetirementCalculator.Api
dotnet run --launch-profile http
```

API: http://127.0.0.1:5051

### 2. Frontend

```powershell
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

App: http://localhost:3000

### 3. Tests

```powershell
cd backend
dotnet test
```

## Environment

Copy `frontend/.env.example` → `frontend/.env.local`:

| Variable | Purpose |
|----------|---------|
| `CALCULATOR_API_URL` | Server-only URL for the .NET API (local: `http://127.0.0.1:5051`) |

On Vercel, set `CALCULATOR_API_URL` to your Render API URL in **Project Settings → Environment Variables**.

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production (Vercel + Render) |

## Privacy

Calculator inputs are sent to the API to compute results and are **not stored** as a saved plan. There is no account. The live site uses privacy-friendly page-view analytics (Vercel Analytics); financial inputs are not used as analytics events. Live details: [Privacy](https://retirecheck.weidong-shi.com/privacy).

## API

**POST** `/api/calculator/plan` (via Next.js proxy in the browser)

Returns `RetirementPlanResult`: dashboard summary, age comparison, SS claiming table, Monte Carlo percentiles, year-by-year projection, tax summary, stress test, inflation impact.

All calculation logic lives in `RetirementCalculator.Domain` — no math in React or controllers.

## Disclaimer

Estimates only. Not financial, tax, or legal advice. See [SSA.gov](https://www.ssa.gov/planners/retire/) for official Social Security information.
