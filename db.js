// =============================================================================
// db.js — SQLite database module for FinPal
// Uses better-sqlite3 (synchronous API — no async/await needed)
// =============================================================================
'use strict';

const BetterSQLite3 = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Data directory: ./data locally, or process.env.DATA_DIR on cloud platforms
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_PATH  = path.join(DATA_DIR, 'finpal.db');

let db;

// ─── Init ─────────────────────────────────────────────────────────────────────

function initDB() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  db = new BetterSQLite3(DB_PATH);

  // Performance + safety settings
  db.pragma('journal_mode = WAL');      // concurrent reads while writing
  db.pragma('foreign_keys = ON');       // enforce FK constraints
  db.pragma('synchronous = NORMAL');    // safe with WAL

  // Create all tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      username          TEXT    NOT NULL UNIQUE COLLATE NOCASE,
      password_hash     TEXT    NOT NULL,
      name              TEXT,
      age               INTEGER,
      annual_income     REAL,
      marginal_tax_rate REAL,
      filing_status     TEXT    NOT NULL DEFAULT 'single',
      risk_tolerance    INTEGER,
      primary_goal      TEXT,
      setup_complete    INTEGER NOT NULL DEFAULT 0,
      created_at        TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS assets (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      ticker       TEXT    NOT NULL,
      name         TEXT,
      shares       REAL    NOT NULL DEFAULT 0,
      cost_basis   REAL    NOT NULL DEFAULT 0,
      account_type TEXT    NOT NULL DEFAULT 'taxable',
      asset_type   TEXT    NOT NULL DEFAULT 'stock',
      created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_assets_user ON assets(user_id);

    -- Purchase lots — each asset has one or more lots tracking individual buys
    CREATE TABLE IF NOT EXISTS asset_lots (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id      INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
      user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      shares        REAL    NOT NULL,
      cost_basis    REAL    NOT NULL,
      purchase_date TEXT,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_lots_asset ON asset_lots(asset_id);
    CREATE INDEX IF NOT EXISTS idx_lots_user  ON asset_lots(user_id);

    CREATE TABLE IF NOT EXISTS liabilities (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name        TEXT    NOT NULL,
      type        TEXT    NOT NULL DEFAULT 'other',
      balance     REAL    NOT NULL DEFAULT 0,
      apr         REAL    NOT NULL DEFAULT 0,
      min_payment REAL    NOT NULL DEFAULT 0,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_liabilities_user ON liabilities(user_id);

    CREATE TABLE IF NOT EXISTS cash_accounts (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name       TEXT    NOT NULL,
      amount     REAL    NOT NULL DEFAULT 0,
      apy        REAL    NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_cash_user ON cash_accounts(user_id);

    CREATE TABLE IF NOT EXISTS goals (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name          TEXT    NOT NULL,
      target_amount REAL    NOT NULL DEFAULT 0,
      target_date   TEXT,
      current_saved REAL    NOT NULL DEFAULT 0,
      priority      TEXT    NOT NULL DEFAULT 'medium',
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);

    -- API keys stored as plaintext per user (the DB file is the security boundary).
    -- Keys are only ever sent to their respective external providers by the browser.
    CREATE TABLE IF NOT EXISTS api_keys (
      user_id            INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      anthropic_key      TEXT,
      alpha_vantage_key  TEXT,
      finnhub_key        TEXT,
      fred_key           TEXT,
      updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Monthly net worth snapshots — auto-created on each login (first login per month only).
    -- Uses cost_basis * shares for portfolio value (live prices are browser-only state).
    CREATE TABLE IF NOT EXISTS snapshots (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      snapshot_month TEXT    NOT NULL,
      net_worth      REAL    NOT NULL,
      total_assets   REAL    NOT NULL,
      total_debt     REAL    NOT NULL,
      portfolio_value REAL   NOT NULL,
      cash_value     REAL    NOT NULL,
      created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, snapshot_month)
    );
    CREATE INDEX IF NOT EXISTS idx_snapshots_user ON snapshots(user_id);

    -- Agent result cache — persists AI agent output between sessions
    CREATE TABLE IF NOT EXISTS agent_cache (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
      results     TEXT    NOT NULL DEFAULT '{}',
      chat        TEXT    NOT NULL DEFAULT '[]',
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS market_cache (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      cache_type  TEXT    NOT NULL,
      data        TEXT    NOT NULL DEFAULT '{}',
      fetched_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, cache_type)
    );
  `);

  // ─── Migrations (idempotent, safe to run every startup) ──────────────────────

  // Add filing_status to existing DBs that pre-date this column
  try { db.prepare("ALTER TABLE users ADD COLUMN filing_status TEXT NOT NULL DEFAULT 'single'").run(); } catch(e) {}

  // Seed one lot per existing asset that has no lots yet (preserves existing data)
  db.prepare(`
    INSERT OR IGNORE INTO asset_lots (asset_id, user_id, shares, cost_basis)
    SELECT id, user_id, shares, cost_basis FROM assets
    WHERE shares > 0 AND id NOT IN (SELECT DISTINCT asset_id FROM asset_lots)
  `).run();

  return db;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

// Convert snake_case DB row to camelCase for the frontend
function toCamel(row) {
  if (!row) return null;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = v;
  }
  return out;
}

// ─── Users ────────────────────────────────────────────────────────────────────

function getUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function getUserByUsername(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

function createUser(username, passwordHash) {
  const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
  const result = stmt.run(username, passwordHash);
  // Also create an empty api_keys row for this user
  db.prepare('INSERT INTO api_keys (user_id) VALUES (?)').run(result.lastInsertRowid);
  return { id: result.lastInsertRowid, username, setupComplete: false };
}

function updateProfile(userId, { name, age, annualIncome, marginalTaxRate, filingStatus, riskTolerance, primaryGoal, setupComplete }) {
  db.prepare(`
    UPDATE users SET
      name = COALESCE(?, name),
      age = COALESCE(?, age),
      annual_income = COALESCE(?, annual_income),
      marginal_tax_rate = COALESCE(?, marginal_tax_rate),
      filing_status = COALESCE(?, filing_status),
      risk_tolerance = COALESCE(?, risk_tolerance),
      primary_goal = COALESCE(?, primary_goal),
      setup_complete = COALESCE(?, setup_complete)
    WHERE id = ?
  `).run(name ?? null, age ?? null, annualIncome ?? null, marginalTaxRate ?? null,
         filingStatus ?? null, riskTolerance ?? null, primaryGoal ?? null,
         setupComplete != null ? (setupComplete ? 1 : 0) : null,
         userId);
}

function getProfile(userId) {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!row) return null;
  return {
    name: row.name,
    age: row.age,
    annualIncome: row.annual_income,
    marginalTaxRate: row.marginal_tax_rate,
    filingStatus: row.filing_status || 'single',
    riskTolerance: row.risk_tolerance,
    primaryGoal: row.primary_goal,
    setupComplete: !!row.setup_complete,
  };
}

// ─── Assets ───────────────────────────────────────────────────────────────────

function getAssets(userId) {
  const rows = db.prepare('SELECT * FROM assets WHERE user_id = ? ORDER BY created_at').all(userId);
  const getLots = db.prepare('SELECT id, shares, cost_basis AS costBasis, purchase_date AS purchaseDate FROM asset_lots WHERE asset_id = ? ORDER BY created_at');
  return rows.map(r => ({
    id: r.id, ticker: r.ticker, name: r.name, shares: r.shares,
    costBasis: r.cost_basis, accountType: r.account_type, assetType: r.asset_type,
    lots: getLots.all(r.id),
  }));
}

// Recalculate and cache weighted-average shares + cost_basis on parent asset from its lots
function _recalcAsset(assetId) {
  const lots = db.prepare('SELECT shares, cost_basis FROM asset_lots WHERE asset_id = ?').all(assetId);
  const totalShares = lots.reduce((s, l) => s + l.shares, 0);
  const weightedCost = totalShares > 0
    ? lots.reduce((s, l) => s + l.shares * l.cost_basis, 0) / totalShares
    : 0;
  db.prepare('UPDATE assets SET shares = ?, cost_basis = ? WHERE id = ?').run(totalShares, weightedCost, assetId);
}

function insertAsset(userId, { ticker, name, shares, costBasis, accountType, assetType, purchaseDate }) {
  const stmt = db.prepare(`
    INSERT INTO assets (user_id, ticker, name, shares, cost_basis, account_type, asset_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(userId, ticker.toUpperCase(), name || null, +shares, +costBasis,
                           accountType || 'taxable', assetType || 'stock');
  const assetId = result.lastInsertRowid;
  // Create the first purchase lot
  db.prepare('INSERT INTO asset_lots (asset_id, user_id, shares, cost_basis, purchase_date) VALUES (?, ?, ?, ?, ?)')
    .run(assetId, userId, +shares, +costBasis, purchaseDate || null);
  const lots = [{ id: db.prepare('SELECT last_insert_rowid() AS id').get().id,
                  shares: +shares, costBasis: +costBasis, purchaseDate: purchaseDate || null }];
  return { id: assetId, ticker: ticker.toUpperCase(), name: name || null,
           shares: +shares, costBasis: +costBasis, accountType: accountType || 'taxable',
           assetType: assetType || 'stock', lots };
}

function updateAsset(userId, assetId, { ticker, name, shares, costBasis, accountType, assetType }) {
  const existing = db.prepare('SELECT * FROM assets WHERE id = ? AND user_id = ?').get(assetId, userId);
  if (!existing) return null;
  db.prepare(`
    UPDATE assets SET
      ticker = COALESCE(?, ticker), name = COALESCE(?, name),
      shares = COALESCE(?, shares), cost_basis = COALESCE(?, cost_basis),
      account_type = COALESCE(?, account_type), asset_type = COALESCE(?, asset_type)
    WHERE id = ? AND user_id = ?
  `).run(ticker ? ticker.toUpperCase() : null, name ?? null,
         shares != null ? +shares : null, costBasis != null ? +costBasis : null,
         accountType ?? null, assetType ?? null, assetId, userId);
  // When shares/costBasis are edited directly, consolidate all lots into one
  // to keep the lot table consistent with the manually-set aggregate values.
  if (shares != null || costBasis != null) {
    const newShares    = shares    != null ? +shares    : existing.shares;
    const newCostBasis = costBasis != null ? +costBasis : existing.cost_basis;
    db.prepare('DELETE FROM asset_lots WHERE asset_id = ?').run(assetId);
    db.prepare('INSERT INTO asset_lots (asset_id, user_id, shares, cost_basis) VALUES (?, ?, ?, ?)')
      .run(assetId, userId, newShares, newCostBasis);
  }
  return getAssets(userId).find(a => a.id === assetId);
}

function deleteAsset(userId, assetId) {
  const result = db.prepare('DELETE FROM assets WHERE id = ? AND user_id = ?').run(assetId, userId);
  return result.changes > 0;
}

// ─── Asset lots ───────────────────────────────────────────────────────────────

function getLotsForAsset(userId, assetId) {
  return db.prepare(`
    SELECT id, shares, cost_basis AS costBasis, purchase_date AS purchaseDate
    FROM asset_lots WHERE asset_id = ? AND user_id = ? ORDER BY created_at
  `).all(assetId, userId);
}

function insertLot(userId, assetId, { shares, costBasis, purchaseDate }) {
  const asset = db.prepare('SELECT id FROM assets WHERE id = ? AND user_id = ?').get(assetId, userId);
  if (!asset) return null;
  const result = db.prepare(
    'INSERT INTO asset_lots (asset_id, user_id, shares, cost_basis, purchase_date) VALUES (?, ?, ?, ?, ?)'
  ).run(assetId, userId, +shares, +costBasis, purchaseDate || null);
  _recalcAsset(assetId);
  return { id: result.lastInsertRowid, shares: +shares, costBasis: +costBasis, purchaseDate: purchaseDate || null };
}

function updateLot(userId, lotId, { shares, costBasis, purchaseDate }) {
  const lot = db.prepare('SELECT * FROM asset_lots WHERE id = ? AND user_id = ?').get(lotId, userId);
  if (!lot) return null;
  db.prepare(`
    UPDATE asset_lots SET
      shares = COALESCE(?, shares),
      cost_basis = COALESCE(?, cost_basis),
      purchase_date = COALESCE(?, purchase_date)
    WHERE id = ? AND user_id = ?
  `).run(shares != null ? +shares : null, costBasis != null ? +costBasis : null,
         purchaseDate ?? null, lotId, userId);
  _recalcAsset(lot.asset_id);
  return getLotsForAsset(userId, lot.asset_id).find(l => l.id === lotId);
}

function deleteLot(userId, lotId) {
  const lot = db.prepare('SELECT * FROM asset_lots WHERE id = ? AND user_id = ?').get(lotId, userId);
  if (!lot) return false;
  // Prevent deleting the last lot (asset must have at least one)
  const count = db.prepare('SELECT COUNT(*) AS c FROM asset_lots WHERE asset_id = ?').get(lot.asset_id).c;
  if (count <= 1) return false;
  db.prepare('DELETE FROM asset_lots WHERE id = ? AND user_id = ?').run(lotId, userId);
  _recalcAsset(lot.asset_id);
  return true;
}

// ─── Liabilities ──────────────────────────────────────────────────────────────

function getLiabilities(userId) {
  return db.prepare('SELECT * FROM liabilities WHERE user_id = ? ORDER BY created_at').all(userId)
    .map(r => ({ id: r.id, name: r.name, type: r.type, balance: r.balance, apr: r.apr, minPayment: r.min_payment }));
}

function insertLiability(userId, { name, type, balance, apr, minPayment }) {
  const result = db.prepare(`
    INSERT INTO liabilities (user_id, name, type, balance, apr, min_payment)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, name, type || 'other', +balance, +apr, +minPayment);
  return { id: result.lastInsertRowid, name, type: type || 'other', balance: +balance, apr: +apr, minPayment: +minPayment };
}

function updateLiability(userId, id, fields) {
  const existing = db.prepare('SELECT * FROM liabilities WHERE id = ? AND user_id = ?').get(id, userId);
  if (!existing) return null;
  db.prepare(`
    UPDATE liabilities SET
      name = COALESCE(?, name), type = COALESCE(?, type),
      balance = COALESCE(?, balance), apr = COALESCE(?, apr), min_payment = COALESCE(?, min_payment)
    WHERE id = ? AND user_id = ?
  `).run(fields.name ?? null, fields.type ?? null,
         fields.balance != null ? +fields.balance : null,
         fields.apr != null ? +fields.apr : null,
         fields.minPayment != null ? +fields.minPayment : null,
         id, userId);
  return getLiabilities(userId).find(l => l.id === id);
}

function deleteLiability(userId, id) {
  return db.prepare('DELETE FROM liabilities WHERE id = ? AND user_id = ?').run(id, userId).changes > 0;
}

// ─── Cash accounts ────────────────────────────────────────────────────────────

function getCash(userId) {
  return db.prepare('SELECT * FROM cash_accounts WHERE user_id = ? ORDER BY created_at').all(userId)
    .map(r => ({ id: r.id, name: r.name, amount: r.amount, apy: r.apy }));
}

function insertCash(userId, { name, amount, apy }) {
  const result = db.prepare('INSERT INTO cash_accounts (user_id, name, amount, apy) VALUES (?, ?, ?, ?)')
    .run(userId, name, +amount, +apy);
  return { id: result.lastInsertRowid, name, amount: +amount, apy: +apy };
}

function updateCash(userId, id, fields) {
  const existing = db.prepare('SELECT * FROM cash_accounts WHERE id = ? AND user_id = ?').get(id, userId);
  if (!existing) return null;
  db.prepare(`
    UPDATE cash_accounts SET
      name = COALESCE(?, name), amount = COALESCE(?, amount), apy = COALESCE(?, apy)
    WHERE id = ? AND user_id = ?
  `).run(fields.name ?? null, fields.amount != null ? +fields.amount : null,
         fields.apy != null ? +fields.apy : null, id, userId);
  return getCash(userId).find(c => c.id === id);
}

function deleteCash(userId, id) {
  return db.prepare('DELETE FROM cash_accounts WHERE id = ? AND user_id = ?').run(id, userId).changes > 0;
}

// ─── Goals ────────────────────────────────────────────────────────────────────

function getGoals(userId) {
  return db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at').all(userId)
    .map(r => ({ id: r.id, name: r.name, targetAmount: r.target_amount,
                 targetDate: r.target_date, currentSaved: r.current_saved, priority: r.priority }));
}

function insertGoal(userId, { name, targetAmount, targetDate, currentSaved, priority }) {
  const result = db.prepare(`
    INSERT INTO goals (user_id, name, target_amount, target_date, current_saved, priority)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, name, +targetAmount, targetDate || null, +currentSaved, priority || 'medium');
  return { id: result.lastInsertRowid, name, targetAmount: +targetAmount,
           targetDate: targetDate || null, currentSaved: +currentSaved, priority: priority || 'medium' };
}

function updateGoal(userId, id, fields) {
  const existing = db.prepare('SELECT * FROM goals WHERE id = ? AND user_id = ?').get(id, userId);
  if (!existing) return null;
  db.prepare(`
    UPDATE goals SET
      name = COALESCE(?, name), target_amount = COALESCE(?, target_amount),
      target_date = COALESCE(?, target_date), current_saved = COALESCE(?, current_saved),
      priority = COALESCE(?, priority)
    WHERE id = ? AND user_id = ?
  `).run(fields.name ?? null, fields.targetAmount != null ? +fields.targetAmount : null,
         fields.targetDate ?? null, fields.currentSaved != null ? +fields.currentSaved : null,
         fields.priority ?? null, id, userId);
  return getGoals(userId).find(g => g.id === id);
}

function deleteGoal(userId, id) {
  return db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?').run(id, userId).changes > 0;
}

// ─── API keys ─────────────────────────────────────────────────────────────────

function getApiKeys(userId) {
  const row = db.prepare('SELECT * FROM api_keys WHERE user_id = ?').get(userId);
  if (!row) return { anthropic: '', alphaVantage: '', finnhub: '', fred: '' };
  return {
    anthropic: row.anthropic_key || '',
    alphaVantage: row.alpha_vantage_key || '',
    finnhub: row.finnhub_key || '',
    fred: row.fred_key || '',
  };
}

function upsertApiKeys(userId, { anthropic, alphaVantage, finnhub, fred }) {
  db.prepare(`
    INSERT INTO api_keys (user_id, anthropic_key, alpha_vantage_key, finnhub_key, fred_key, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      anthropic_key = excluded.anthropic_key,
      alpha_vantage_key = excluded.alpha_vantage_key,
      finnhub_key = excluded.finnhub_key,
      fred_key = excluded.fred_key,
      updated_at = datetime('now')
  `).run(userId, anthropic || null, alphaVantage || null, finnhub || null, fred || null);
}

// ─── Snapshots ────────────────────────────────────────────────────────────────

function getSnapshots(userId) {
  return db.prepare(`
    SELECT snapshot_month AS month, net_worth AS netWorth, total_assets AS totalAssets,
           total_debt AS totalDebt, portfolio_value AS portfolioValue, cash_value AS cashValue
    FROM snapshots WHERE user_id = ? ORDER BY snapshot_month ASC
  `).all(userId);
}

// Called on every login — inserts at most one row per calendar month (INSERT OR IGNORE).
// Uses cost_basis * shares for portfolio value (live prices are browser-only).
function maybeRecordSnapshot(userId) {
  const month = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  const portfolioValue = db.prepare(
    'SELECT COALESCE(SUM(shares * cost_basis), 0) AS v FROM assets WHERE user_id = ?'
  ).get(userId).v;
  const cashValue = db.prepare(
    'SELECT COALESCE(SUM(amount), 0) AS v FROM cash_accounts WHERE user_id = ?'
  ).get(userId).v;
  const totalDebt = db.prepare(
    'SELECT COALESCE(SUM(balance), 0) AS v FROM liabilities WHERE user_id = ?'
  ).get(userId).v;
  const totalAssets = portfolioValue + cashValue;
  const netWorth = totalAssets - totalDebt;

  db.prepare(`
    INSERT OR IGNORE INTO snapshots
      (user_id, snapshot_month, net_worth, total_assets, total_debt, portfolio_value, cash_value)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, month, netWorth, totalAssets, totalDebt, portfolioValue, cashValue);
}

// ─── Agent cache ─────────────────────────────────────────────────────────────

function getAgentCache(userId) {
  const row = db.prepare('SELECT results, chat FROM agent_cache WHERE user_id = ?').get(userId);
  if (!row) return { results: {}, chat: [] };
  return { results: JSON.parse(row.results), chat: JSON.parse(row.chat) };
}

function saveAgentCache(userId, { results, chat }) {
  db.prepare(`
    INSERT INTO agent_cache (user_id, results, chat, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET results=excluded.results, chat=excluded.chat, updated_at=excluded.updated_at
  `).run(userId, JSON.stringify(results || {}), JSON.stringify(chat || []));
}

// ─── Market cache ─────────────────────────────────────────────────────────────

function getMarketCache(userId) {
  const rows = db.prepare('SELECT cache_type, data, fetched_at FROM market_cache WHERE user_id = ?').all(userId);
  const result = {};
  for (const row of rows) {
    result[row.cache_type] = { data: JSON.parse(row.data), fetchedAt: row.fetched_at };
  }
  return result;
}

function saveMarketCache(userId, type, data) {
  db.prepare(`
    INSERT INTO market_cache (user_id, cache_type, data, fetched_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, cache_type) DO UPDATE SET data=excluded.data, fetched_at=excluded.fetched_at
  `).run(userId, type, JSON.stringify(data));
}

// ─── Full data load (single round-trip for page load) ────────────────────────

function getAllUserData(userId) {
  return {
    profile:     getProfile(userId),
    assets:      getAssets(userId),
    liabilities: getLiabilities(userId),
    cash:        getCash(userId),
    goals:       getGoals(userId),
    apiKeys:     getApiKeys(userId),
    snapshots:   getSnapshots(userId),
    agentCache:  getAgentCache(userId),
    marketCache: getMarketCache(userId),
  };
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  initDB,
  // Users
  getUserById, getUserByUsername, createUser, updateProfile, getProfile,
  // Assets
  getAssets, insertAsset, updateAsset, deleteAsset,
  // Asset lots
  getLotsForAsset, insertLot, updateLot, deleteLot,
  // Liabilities
  getLiabilities, insertLiability, updateLiability, deleteLiability,
  // Cash
  getCash, insertCash, updateCash, deleteCash,
  // Goals
  getGoals, insertGoal, updateGoal, deleteGoal,
  // API keys
  getApiKeys, upsertApiKeys,
  // Snapshots
  getSnapshots, maybeRecordSnapshot,
  // Agent cache
  getAgentCache, saveAgentCache,
  // Market cache
  getMarketCache, saveMarketCache,
  // Aggregate
  getAllUserData,
};
