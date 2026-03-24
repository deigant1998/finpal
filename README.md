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

## Screenshots

<img width="1437" height="766" alt="image" src="https://github.com/user-attachments/assets/d17d80ee-d76a-4cd5-9fc8-b0d63556a0e1" />

<img width="1440" height="735" alt="image" src="https://github.com/user-attachments/assets/fd8322d2-421d-433e-a777-5dda179cd2c6" />

<img width="1439" height="766" alt="image" src="https://github.com/user-attachments/assets/f22c99af-7efa-4b89-9b94-24b9d9292544" />

<img width="1440" height="761" alt="image" src="https://github.com/user-attachments/assets/84ca8576-109f-41b2-a015-c39d688e8731" />

<img width="1440" height="707" alt="image" src="https://github.com/user-attachments/assets/2b991117-fe64-45fc-957d-1fdab177aa0e" />

<img width="1440" height="756" alt="image" src="https://github.com/user-attachments/assets/27af76e3-8c06-4355-adc6-135bbbafc82b" />

<img width="1440" height="710" alt="image" src="https://github.com/user-attachments/assets/cdbd1a39-1f7e-4357-b26b-0d6e1a29ffac" />






