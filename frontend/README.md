# Frontend — RetireCheck

Next.js 16 app for the retirement calculator wizard and results UI.

**Live:** https://retirecheck.weidong-shi.com · **Root docs:** [`../README.md`](../README.md), [`../AGENTS.md`](../AGENTS.md)

## Run

Requires the .NET API running separately (see root README).

```powershell
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Open http://localhost:3000

## Structure

```
src/
├── app/
│   ├── api/calculator/plan/   # Proxies to .NET API (CALCULATOR_API_URL)
│   ├── opengraph-image.tsx    # LinkedIn/social preview image
│   └── globals.css            # Emerald/teal design system
├── components/
│   ├── CalculatorApp.tsx      # 4-step wizard + sample plan
│   ├── ResultsSection.tsx     # Charts, tables, fan chart
│   ├── ScoreGauge.tsx         # Animated success-rate ring
│   └── ShareCardButton.tsx    # Downloadable score card PNG
├── lib/                       # api.ts, validation.ts, format.ts
└── types/retirement.ts        # DTOs matching C# models
```

## Commands

```bash
npm run dev      # development
npm run build    # production check
npm run lint     # eslint
```

## Deploy (Vercel)

- **Production branch:** `main`
- **Env var:** `CALCULATOR_API_URL` → Render API URL
- Config: `vercel.json`

See [`../ARCHITECTURE.md`](../ARCHITECTURE.md) for the full system diagram.
