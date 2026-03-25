// =============================================================================
// server.js — FinPal Express server
// All routes inline — no separate routes/ directory needed at this scale
// =============================================================================
'use strict';

const express        = require('express');
const session        = require('express-session');
const bcrypt         = require('bcrypt');
const path           = require('path');
const db             = require('./db');

// ─── Init ─────────────────────────────────────────────────────────────────────

db.initDB();

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Session store ────────────────────────────────────────────────────────────

// connect-sqlite3 requires the session constructor — must be called with session
const SQLiteStore = require('connect-sqlite3')(session);
const DATA_DIR    = process.env.DATA_DIR || path.join(__dirname, 'data');

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  store: new SQLiteStore({ dir: DATA_DIR, db: 'sessions.db', table: 'sessions' }),
  secret: process.env.SESSION_SECRET || 'finpal-dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'finpal_session',
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
}));

// ─── Auth middleware ──────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ error: 'Not authenticated' });
}

// ─── Auth routes ─────────────────────────────────────────────────────────────

// GET /api/auth/me — check session (used on page load)
app.get('/api/auth/me', (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  const user = db.getUserById(req.session.userId);
  if (!user) {
    req.session.destroy(() => {});
    return res.json({ user: null });
  }
  res.json({ user: { id: user.id, username: user.username, setupComplete: !!user.setup_complete } });
});

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username?.trim() || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  if (username.trim().length < 2) {
    return res.status(400).json({ error: 'Username must be at least 2 characters' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  const existing = db.getUserByUsername(username.trim());
  if (existing) return res.status(400).json({ error: 'Username already taken' });

  try {
    const hash = await bcrypt.hash(password, 12);
    const user = db.createUser(username.trim(), hash);
    // Start session
    req.session.regenerate(err => {
      if (err) return res.status(500).json({ error: 'Session error' });
      req.session.userId = user.id;
      res.status(201).json({ user: { id: user.id, username: user.username, setupComplete: false } });
    });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: 'Internal error' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  const user = db.getUserByUsername(username.trim());
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  try {
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    req.session.regenerate(err => {
      if (err) return res.status(500).json({ error: 'Session error' });
      req.session.userId = user.id;

      // Record monthly snapshot after login (INSERT OR IGNORE — safe to call every time)
      try { db.maybeRecordSnapshot(user.id); } catch (e) { /* non-fatal */ }

      res.json({ user: { id: user.id, username: user.username, setupComplete: !!user.setup_complete } });
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Internal error' });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', requireAuth, (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout error' });
    res.clearCookie('finpal_session');
    res.json({ ok: true });
  });
});

// ─── Profile ─────────────────────────────────────────────────────────────────

app.get('/api/profile', requireAuth, (req, res) => {
  res.json(db.getProfile(req.session.userId) || {});
});

app.put('/api/profile', requireAuth, (req, res) => {
  db.updateProfile(req.session.userId, req.body);
  res.json({ ok: true });
});

// ─── Full data load ───────────────────────────────────────────────────────────

// Single endpoint to hydrate the entire frontend state — avoids 6 sequential fetches
app.get('/api/me/data', requireAuth, (req, res) => {
  res.json(db.getAllUserData(req.session.userId));
});

// ─── Assets ───────────────────────────────────────────────────────────────────

app.get('/api/assets', requireAuth, (req, res) => {
  res.json(db.getAssets(req.session.userId));
});

app.post('/api/assets', requireAuth, (req, res) => {
  try {
    const asset = db.insertAsset(req.session.userId, req.body);
    res.status(201).json(asset);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/assets/:id', requireAuth, (req, res) => {
  const updated = db.updateAsset(req.session.userId, +req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

app.delete('/api/assets/:id', requireAuth, (req, res) => {
  const deleted = db.deleteAsset(req.session.userId, +req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ─── Asset lots ───────────────────────────────────────────────────────────────

app.post('/api/assets/:id/lots', requireAuth, (req, res) => {
  const lot = db.insertLot(req.session.userId, +req.params.id, req.body);
  if (!lot) return res.status(404).json({ error: 'Asset not found' });
  // Return updated asset (with new weighted-avg shares/costBasis) + the new lot
  const asset = db.getAssets(req.session.userId).find(a => a.id === +req.params.id);
  res.status(201).json({ lot, asset });
});

app.put('/api/assets/:assetId/lots/:lotId', requireAuth, (req, res) => {
  const updated = db.updateLot(req.session.userId, +req.params.lotId, req.body);
  if (!updated) return res.status(404).json({ error: 'Lot not found' });
  const asset = db.getAssets(req.session.userId).find(a => a.id === +req.params.assetId);
  res.json({ lot: updated, asset });
});

app.delete('/api/assets/:assetId/lots/:lotId', requireAuth, (req, res) => {
  const ok = db.deleteLot(req.session.userId, +req.params.lotId);
  if (!ok) return res.status(400).json({ error: 'Cannot delete — lot not found or is the last lot' });
  const asset = db.getAssets(req.session.userId).find(a => a.id === +req.params.assetId);
  res.json({ ok: true, asset });
});

// ─── Liabilities ─────────────────────────────────────────────────────────────

app.get('/api/liabilities', requireAuth, (req, res) => {
  res.json(db.getLiabilities(req.session.userId));
});

app.post('/api/liabilities', requireAuth, (req, res) => {
  try {
    res.status(201).json(db.insertLiability(req.session.userId, req.body));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/liabilities/:id', requireAuth, (req, res) => {
  const updated = db.updateLiability(req.session.userId, +req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

app.delete('/api/liabilities/:id', requireAuth, (req, res) => {
  if (!db.deleteLiability(req.session.userId, +req.params.id))
    return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ─── Cash accounts ────────────────────────────────────────────────────────────

app.get('/api/cash', requireAuth, (req, res) => {
  res.json(db.getCash(req.session.userId));
});

app.post('/api/cash', requireAuth, (req, res) => {
  try {
    res.status(201).json(db.insertCash(req.session.userId, req.body));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/cash/:id', requireAuth, (req, res) => {
  const updated = db.updateCash(req.session.userId, +req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

app.delete('/api/cash/:id', requireAuth, (req, res) => {
  if (!db.deleteCash(req.session.userId, +req.params.id))
    return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ─── Goals ────────────────────────────────────────────────────────────────────

app.get('/api/goals', requireAuth, (req, res) => {
  res.json(db.getGoals(req.session.userId));
});

app.post('/api/goals', requireAuth, (req, res) => {
  try {
    res.status(201).json(db.insertGoal(req.session.userId, req.body));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/goals/:id', requireAuth, (req, res) => {
  const updated = db.updateGoal(req.session.userId, +req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

app.delete('/api/goals/:id', requireAuth, (req, res) => {
  if (!db.deleteGoal(req.session.userId, +req.params.id))
    return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ─── API keys ─────────────────────────────────────────────────────────────────

app.get('/api/keys', requireAuth, (req, res) => {
  res.json(db.getApiKeys(req.session.userId));
});

app.put('/api/keys', requireAuth, (req, res) => {
  db.upsertApiKeys(req.session.userId, req.body);
  res.json({ ok: true });
});

// ─── Snapshots ────────────────────────────────────────────────────────────────

app.get('/api/snapshots', requireAuth, (req, res) => {
  res.json(db.getSnapshots(req.session.userId));
});

// ─── Agent cache ──────────────────────────────────────────────────────────────

app.post('/api/agent-cache', requireAuth, (req, res) => {
  try {
    db.saveAgentCache(req.session.userId, req.body);
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// ─── Market data proxies ──────────────────────────────────────────────────────
// These proxy external APIs server-side to avoid CORS issues and hide API keys.

// In-memory price cache — 15 min TTL (Finnhub free tier: 60 req/min, no daily cap)
const priceCache = new Map(); // ticker → { price, changePct, fetchedAt }
const PRICE_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const finnhubCache = new Map(); // `news_${ticker}` → { data, fetchedAt }
const FINNHUB_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
const fredCache = new Map(); // seriesId → { data, fetchedAt }
const FRED_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

// GET /api/proxy/quote/:ticker — Finnhub quote (60 req/min free, no daily cap)
app.get('/api/proxy/quote/:ticker', requireAuth, async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  const cached = priceCache.get(ticker);
  if (cached && Date.now() - cached.fetchedAt < PRICE_CACHE_TTL) return res.json(cached);
  const keys = db.getApiKeys(req.session.userId);
  if (!keys.finnhub) return res.status(400).json({ error: 'No Finnhub API key set' });
  try {
    const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${keys.finnhub}`);
    const d = await r.json();
    if (!d.c || d.c === 0) return res.status(400).json({ error: `No quote for ${ticker}` });
    const result = { price: d.c, changePct: d.dp ?? 0, fetchedAt: Date.now() };
    priceCache.set(ticker, result);
    res.json(result);
  } catch (e) {
    res.status(502).json({ error: `Finnhub fetch failed: ${e.message}` });
  }
});

// GET /api/proxy/coingecko/:coinId — CoinGecko via server proxy (cache + hides nothing, but consistent with other proxies)
app.get('/api/proxy/coingecko/:coinId', requireAuth, async (req, res) => {
  const coinId = req.params.coinId.toLowerCase();
  const cacheKey = `crypto_${coinId}`;
  const cached = priceCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < PRICE_CACHE_TTL) return res.json(cached);
  try {
    const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`);
    const d = await r.json();
    if (!d[coinId]) return res.status(400).json({ error: `No data for ${coinId}` });
    const result = { price: d[coinId].usd, changePct: d[coinId].usd_24h_change || 0, fetchedAt: Date.now() };
    priceCache.set(cacheKey, result);
    res.json(result);
  } catch (e) {
    res.status(502).json({ error: `CoinGecko fetch failed: ${e.message}` });
  }
});

// GET /api/proxy/fred?series_id=DGS10&limit=24&sort_order=desc
app.get('/api/proxy/fred', requireAuth, async (req, res) => {
  const { series_id, limit = 24, sort_order = 'desc' } = req.query;
  if (!series_id) return res.status(400).json({ error: 'series_id required' });
  const cacheKey = `${series_id}_${limit}_${sort_order}`;
  const cached = fredCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < FRED_CACHE_TTL) return res.json(cached.data);
  const keys = db.getApiKeys(req.session.userId);
  if (!keys.fred) return res.status(400).json({ error: 'No FRED API key set' });
  try {
    const url = new URL('https://api.stlouisfed.org/fred/series/observations');
    url.searchParams.set('series_id', series_id);
    url.searchParams.set('api_key', keys.fred);
    url.searchParams.set('file_type', 'json');
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('sort_order', sort_order);
    const r = await fetch(url.toString());
    const data = await r.json();
    fredCache.set(cacheKey, { data, fetchedAt: Date.now() });
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: `FRED fetch failed: ${e.message}` });
  }
});

// GET /api/proxy/finnhub/news/:ticker — Finnhub company news via server (hides API key + 6h cache)
app.get('/api/proxy/finnhub/news/:ticker', requireAuth, async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  const cacheKey = `news_${ticker}`;
  const cached = finnhubCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < FINNHUB_CACHE_TTL) return res.json(cached.data);
  const keys = db.getApiKeys(req.session.userId);
  if (!keys.finnhub) return res.status(400).json({ error: 'No Finnhub API key set' });
  try {
    const to   = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const r = await fetch(`https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${from}&to=${to}&token=${keys.finnhub}`);
    const data = await r.json();
    const articles = Array.isArray(data) ? data.slice(0, 6) : [];
    finnhubCache.set(cacheKey, { data: articles, fetchedAt: Date.now() });
    res.json(articles);
  } catch (e) {
    res.status(502).json({ error: `Finnhub fetch failed: ${e.message}` });
  }
});

// ─── Market cache ─────────────────────────────────────────────────────────────

app.get('/api/market-cache', requireAuth, (req, res) => {
  res.json(db.getMarketCache(req.session.userId));
});

app.post('/api/market-cache', requireAuth, (req, res) => {
  const { type, data } = req.body;
  if (!type) return res.status(400).json({ error: 'type required' });
  try {
    db.saveMarketCache(req.session.userId, type, data);
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// ─── SPA catch-all — serve index.html for any non-API route ──────────────────

app.get('*', (req, res) => {
  // Only serve index.html for non-API routes (API 404s should return JSON)
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  FinPal running at http://localhost:${PORT}\n`);
});
