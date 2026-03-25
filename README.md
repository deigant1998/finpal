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

<img width="1437" height="766" alt="image" src="https://github.com/user-attachments/assets/d17d80ee-d76a-4cd5-9fc8-b0d63556a0e1" />

<img width="1440" height="735" alt="image" src="https://github.com/user-attachments/assets/fd8322d2-421d-433e-a777-5dda179cd2c6" />

<img width="1439" height="766" alt="image" src="https://github.com/user-attachments/assets/f22c99af-7efa-4b89-9b94-24b9d9292544" />

<img width="1440" height="761" alt="image" src="https://github.com/user-attachments/assets/84ca8576-109f-41b2-a015-c39d688e8731" />

<img width="1440" height="707" alt="image" src="https://github.com/user-attachments/assets/2b991117-fe64-45fc-957d-1fdab177aa0e" />

<img width="1440" height="756" alt="image" src="https://github.com/user-attachments/assets/27af76e3-8c06-4355-adc6-135bbbafc82b" />

<img width="1440" height="710" alt="image" src="https://github.com/user-attachments/assets/cdbd1a39-1f7e-4357-b26b-0d6e1a29ffac" />

Note: This project is for educational purposes only.






