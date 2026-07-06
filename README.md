# Retirement Calculator Pro

Full-stack retirement planning calculator — Next.js frontend + .NET Core backend.

## Stack

| Layer | Technology |
|-------|------------|
| UI | Next.js 16, React, TypeScript, Tailwind CSS, Recharts |
| API | ASP.NET Core 10 Web API |
| Logic | C# class library (`RetirementCalculator.Domain`) |
| Tests | xUnit |

## Project structure

```
Retirement Calculator/
├── frontend/                 # Next.js app
│   └── src/
│       ├── app/              # App router
│       ├── components/       # Wizard + results UI
│       ├── lib/              # API client, formatters
│       └── types/            # Shared TypeScript types
├── backend/
│   ├── src/
│   │   ├── RetirementCalculator.Api/       # REST API
│   │   └── RetirementCalculator.Domain/    # Pure calculation logic
│   └── tests/
│       ├── RetirementCalculator.Domain.Tests/
│       └── RetirementCalculator.Api.Tests/
├── AGENTS.md
└── .cursor/rules/
```

Agent onboarding: see `AGENTS.md` and `.cursor/rules/`.

## Run locally

### 1. Backend API

```bash
cd backend/src/RetirementCalculator.Api
dotnet run
```

API: http://localhost:5051  
Endpoint: `POST /api/calculator/plan`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:3000

### 3. Tests

```bash
cd backend
dotnet test
```

## API

**POST** `/api/calculator/plan`

Request body matches `RetirementPlanInput` (camelCase JSON). Returns `RetirementPlanResult` with:

- Dashboard summary
- Age comparison table
- Social Security claiming comparison
- Monte Carlo percentiles
- Year-by-year projection
- Tax summary, stress test, inflation impact

## Architecture notes

- All calculation logic lives in `RetirementCalculator.Domain` — no math in React components or API controllers.
- CORS allows `http://localhost:3000` by default (configurable in `appsettings.json`).
- Frontend mirrors the 5-step wizard and results layout from the HTML prototype.

## Disclaimer

Estimates only. Not financial advice. See [SSA.gov](https://www.ssa.gov/planners/retire/) for official Social Security information.
