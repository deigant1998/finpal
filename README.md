# FinPal

A local-first personal finance dashboard. Track your net worth, investments, debts, and goals — with AI-powered analysis and real market data. AI analysis is powered by Anthropic (and is opt-in) - the data might be processed as per Anthropic's data handling policy.

## Features

- **Net Worth tracking** — assets, liabilities, cash accounts, snapshots over time
- **Portfolio management** — stocks, crypto, and other holdings with lot-level cost basis tracking
- **Live prices** — Finnhub (stocks/ETFs, 60 req/min) and CoinGecko (crypto) via server-side proxy
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
| Finnhub        | Stock/ETF prices + news                   | 60 req/min, no daily cap         |
| CoinGecko      | Crypto prices                             | Free (no key needed)             |
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

## Database

FinPal uses two SQLite files, both stored in `DATA_DIR` (`./data` by default):

| File           | Purpose                                      |
|----------------|----------------------------------------------|
| `finpal.db`    | All user data — accounts, assets, portfolios |
| `sessions.db`  | Express session store                        |

The directory and both files are created automatically on first run. They are gitignored — never commit them.

### Schema overview

| Table          | Contents                                              |
|----------------|-------------------------------------------------------|
| `users`        | Accounts, profile (income, age, risk tolerance, etc.) |
| `api_keys`     | Per-user API keys (Anthropic, Finnhub, FRED)          |
| `assets`       | Holdings with weighted-average cost basis             |
| `asset_lots`   | Individual purchase lots per asset                    |
| `liabilities`  | Debts with APR and minimum payment                    |
| `cash_accounts`| Cash/savings accounts with APY                        |
| `goals`        | Financial goals with target amount and date           |
| `snapshots`    | Monthly net worth snapshots for trend tracking        |
| `agent_cache`  | Saved AI agent results and chat history               |
| `market_cache` | Cached market/macro data (prices, news, FRED)         |

### Migrations

Schema changes are applied automatically at startup via `CREATE TABLE IF NOT EXISTS` and idempotent `ALTER TABLE` statements in `db.js`. No manual migration step is needed.

### Backup

Copy `finpal.db` — that's your entire dataset. For automated backups on Linux/macOS:

```bash
# Daily backup to ~/finpal-backups/
0 2 * * * cp /path/to/data/finpal.db ~/finpal-backups/finpal-$(date +%Y%m%d).db
```

### Resetting data

To wipe everything and start fresh:

```bash
rm data/finpal.db data/sessions.db
npm start   # recreates both files automatically
```

To remove a single user's data, delete their row from the `users` table — cascading deletes handle the rest:

```bash
sqlite3 data/finpal.db "DELETE FROM users WHERE username = 'alice';"
```

### Production notes

- **WAL mode** is enabled by default — safe for concurrent reads with a single writer
- **Foreign keys** are enforced — cascading deletes keep data consistent
- SQLite is suitable for single-server personal use. If you need multi-server or high concurrency, swap `db.js` for a Postgres adapter

## Deployment

The app runs anywhere Node.js is available. For platforms with persistent storage (Render, Railway, Fly.io), set `DATA_DIR` to a mounted volume path so the SQLite databases survive deploys.

```bash
DATA_DIR=/data SESSION_SECRET=<random> npm start
```

## Screenshots

<img width="1231" height="748" alt="image" src="https://github.com/user-attachments/assets/3861fa27-8ba8-4e25-a5a6-9ea25a7ad3db" />

<img width="1440" height="769" alt="image" src="https://github.com/user-attachments/assets/80b77786-05ef-4a8b-bc46-80ef878baaf9" />

<img width="1440" height="766" alt="image" src="https://github.com/user-attachments/assets/5b60a814-c6e5-4d29-af87-85d8df76a95a" />

<img width="1440" height="769" alt="image" src="https://github.com/user-attachments/assets/5c9ea67f-be8e-48b5-93e2-fe8d1b92e95d" />

<img width="1440" height="771" alt="image" src="https://github.com/user-attachments/assets/b93cc499-ccaa-4529-899b-8744f01ff88b" />

<img width="1439" height="765" alt="image" src="https://github.com/user-attachments/assets/6559e7f4-769b-40db-b37a-ad0999a8cdb4" />

<img width="1440" height="662" alt="image" src="https://github.com/user-attachments/assets/631386af-9e03-4b07-9c34-78b6f3d13f11" />

<img width="1440" height="547" alt="image" src="https://github.com/user-attachments/assets/67996a91-2bc2-40cb-a3b6-578b6b4ffe86" />



Note: This project is for educational purposes only.






