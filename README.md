# FinPal

A local-first personal finance dashboard. Track your net worth, investments, debts, budget, and goals — with AI-powered analysis and real market data. AI analysis is powered by Anthropic (opt-in) — data may be processed per Anthropic's data handling policy.

## Features

- **Net Worth** — assets, liabilities, cash accounts, monthly snapshots, 10-year projection
- **Portfolio** — stocks, ETFs, crypto with lot-level cost basis; live prices via Finnhub/CoinGecko; manual price entry if no API key; macro indicators and stock news in the same tab
- **Debt** — track balances, APR, minimum payments; avalanche payoff simulation; payoff timeline
- **Budget** — monthly cash flow cascade: gross income → taxes → expenses → debt → goals → investable; 50/30/20 benchmark; goal savings auto-capped at what goals actually need so surplus flows to investable
- **Goals** — urgency-weighted allocation across goals from your budget; projected completion dates; on-time/late status; inline editing
- **Models (Monte Carlo)** — retirement simulation with 1,000 random market scenarios; career promotion milestones (multiplicative salary jumps); debt payoff and goal completion as automatic cashflow boosts; wired to live app data (net worth, investable/mo from Budget tab)
- **AI Agents** — six specialist advisors (portfolio, debt, tax, retirement, risk, macro) that run as a single health check and produce A–F grades with specific actions
- **AI Chat** — ask follow-up questions with full financial context injected

## Tabs

| Tab | What it does |
|-----|-------------|
| Net Worth | Overall wealth snapshot, allocation charts, history, liabilities breakdown |
| Portfolio | Holdings table, live prices, macro indicators, stock news |
| Debt | Debt list, avalanche payoff simulation |
| Budget | Income cascade, expense inputs, investable calculation |
| Goals | Goal cards with urgency-weighted budget allocation and projections |
| Models | Monte Carlo retirement simulation with career + financial milestones |
| AI Agents | Full financial health check across six specialist agents |

## Stack

- **Backend**: Node.js + Express, SQLite via `better-sqlite3`
- **Frontend**: Single-file React 18 app (Babel Standalone, no build step)
- **Auth**: Session-based with bcrypt password hashing
- **AI**: Anthropic Claude API (bring your own key)
- **Charts**: Recharts

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

| Key        | Used for                                  | Free tier                |
|------------|-------------------------------------------|--------------------------|
| Anthropic  | AI agents + chat                          | Pay-per-use              |
| Finnhub    | Stock/ETF prices + news                   | 60 req/min, no daily cap |
| CoinGecko  | Crypto prices                             | Free (no key needed)     |
| FRED       | Macro indicators (rates, inflation, etc.) | Free                     |

Finnhub and FRED are optional — the app works without them. Portfolio prices fall back to cost basis, and you can enter current prices manually in the Portfolio edit row.

## Project Structure

```
finpal/
├── server.js       # Express server + all API routes
├── db.js           # SQLite schema + all database functions
├── public/
│   └── index.html  # Entire React frontend (single file, no build)
├── electron/       # Electron wrapper for desktop builds
├── .env.example    # Environment variable template
└── data/           # SQLite databases (gitignored)
```

## Database

FinPal uses two SQLite files, both stored in `DATA_DIR` (`./data` by default):

| File          | Purpose                                      |
|---------------|----------------------------------------------|
| `finpal.db`   | All user data — accounts, assets, portfolios |
| `sessions.db` | Express session store                        |

Both files are created automatically on first run and are gitignored.

### Schema overview

| Table           | Contents                                              |
|-----------------|-------------------------------------------------------|
| `users`         | Accounts, profile (income, age, risk tolerance, etc.) |
| `api_keys`      | Per-user API keys (Anthropic, Finnhub, FRED)          |
| `assets`        | Holdings with weighted-average cost basis             |
| `asset_lots`    | Individual purchase lots per asset                    |
| `liabilities`   | Debts with APR and minimum payment                    |
| `cash_accounts` | Cash/savings accounts with APY                        |
| `goals`         | Financial goals with target amount and date           |
| `snapshots`     | Monthly net worth snapshots for trend tracking        |
| `agent_cache`   | Saved AI agent results and chat history               |
| `market_cache`  | Cached market/macro data (prices, news, FRED)         |

Schema changes are applied automatically at startup via idempotent `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE` statements — no manual migration step needed.

### Backup

```bash
cp data/finpal.db ~/finpal-backup.db
```

### Resetting data

```bash
rm data/finpal.db data/sessions.db
npm start   # recreates both files automatically
```

## Deployment

The app runs anywhere Node.js is available. Set `DATA_DIR` to a mounted volume path so the SQLite databases survive deploys:

```bash
DATA_DIR=/data SESSION_SECRET=<random> npm start
```

## Desktop App (Electron)

Pre-built installers are produced by GitHub Actions on every push to `master`. Download from the Actions tab → latest build → Artifacts.

To build locally:

```bash
npm run build:mac    # macOS DMG
npm run build:win    # Windows NSIS installer
npm run build:linux  # Linux AppImage
```

Note: installers are unsigned. macOS will show a Gatekeeper warning — right-click → Open to bypass.

## Screenshots

<img width="1231" height="748" alt="image" src="https://github.com/user-attachments/assets/3861fa27-8ba8-4e25-a5a6-9ea25a7ad3db" />

<img width="1440" height="769" alt="image" src="https://github.com/user-attachments/assets/80b77786-05ef-4a8b-bc46-80ef878baaf9" />

<img width="1440" height="766" alt="image" src="https://github.com/user-attachments/assets/5b60a814-c6e5-4d29-af87-85d8df76a95a" />

<img width="1440" height="769" alt="image" src="https://github.com/user-attachments/assets/5c9ea67f-be8e-48b5-93e2-fe8d1b92e95d" />

<img width="1440" height="771" alt="image" src="https://github.com/user-attachments/assets/b93cc499-ccaa-4529-899b-8744f01ff88b" />

<img width="1439" height="765" alt="image" src="https://github.com/user-attachments/assets/6559e7f4-769b-40db-b37a-ad0999a8cdb4" />

<img width="1440" height="662" alt="image" src="https://github.com/user-attachments/assets/631386af-9e03-4b07-9c34-78b6f3d13f11" />

<img width="1440" height="547" alt="image" src="https://github.com/user-attachments/assets/67996a91-2bc2-40cb-a3b6-578b6b4ffe86" />

---

Note: This project is for educational purposes only.
