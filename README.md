# FinPal

A local-first personal finance dashboard. Track your net worth, investments, debts, and goals — with AI-powered analysis and real market data. Everything runs on your machine; your financial data never leaves your server.

## Features

- **Net Worth tracking** — assets, liabilities, cash accounts, snapshots over time
- **Portfolio management** — stocks, crypto, and other holdings with lot-level cost basis tracking
- **Live prices** — Alpha Vantage (stocks/ETFs) and CoinGecko (crypto) via server-side proxy
- **AI Agents** — five specialist advisors (budget, investments, debt, tax, macro) plus synthesis, powered by Claude
- **AI Chat** — ask follow-up questions about your finances with full context
- **Market tab** — FRED macro indicators, stock news via Finnhub
- **Goals tracker** — savings and payoff goals with progress bars
- **Tax bracket calculator** — marginal rate derived from income + filing status (2024 IRS brackets)
- **Multi-user** — each account is isolated with its own data
- **Persistent caching** — market data, agent results, and chat history survive page refreshes

## Stack

- **Backend**: Node.js + Express, SQLite via `better-sqlite3`
- **Frontend**: Single-file React app (Babel Standalone, no build step)
- **Auth**: Session-based with bcrypt password hashing
- **AI**: Anthropic Claude API (bring your own key)

## Quick Start

```bash
git clone <repo-url>
cd finpal
npm install
npm start
```

Open `http://localhost:3000` and register an account.

### Optional: environment variables

Copy `.env.example` to `.env` and adjust if needed:

```bash
cp .env.example .env
```

| Variable         | Default                        | Description                        |
|------------------|--------------------------------|------------------------------------|
| `PORT`           | `3000`                         | HTTP port                          |
| `SESSION_SECRET` | `finpal-dev-secret-...`        | Change in production               |
| `DATA_DIR`       | `./data`                       | Where SQLite databases are stored  |

## API Keys

All keys are stored per-user in the database (never in source). Add them in **Settings** after logging in:

| Key            | Used for                                  | Free tier                        |
|----------------|-------------------------------------------|----------------------------------|
| Anthropic      | AI agents + chat                          | Pay-per-use                      |
| Alpha Vantage  | Stock/ETF prices                          | 25 req/day                       |
| CoinGecko      | Crypto prices                             | Free (no key needed for demo)    |
| Finnhub        | Stock news                                | 60 req/min free                  |
| FRED           | Macro indicators (rates, inflation, etc.) | Free                             |

## Project Structure

```
finpal/
├── server.js       # Express server + all API routes
├── db.js           # SQLite schema + all database functions
├── public/
│   └── index.html  # Entire React frontend (single file, no build)
├── .env.example    # Environment variable template
└── data/           # SQLite databases (gitignored)
```

## Deployment

The app runs anywhere Node.js is available. For platforms with persistent storage (Render, Railway, Fly.io), set `DATA_DIR` to a mounted volume path so the SQLite databases survive deploys.

```bash
DATA_DIR=/data SESSION_SECRET=<random> npm start
```
