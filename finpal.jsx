<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FinPal – Personal Financial Advisor</title>
  <script src="https://unpkg.com/prop-types@15.8.1/prop-types.min.js"></script>
  <script src="https://unpkg.com/react@18.2.0/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone@7.23.5/babel.min.js"></script>
  <script src="https://unpkg.com/recharts@2.10.3/umd/Recharts.js"
    onerror="window._rechartsLoadFailed=true;console.error('Recharts CDN failed')"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0f1117; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; line-height: 1.5; }
    #root { min-height: 100vh; }
    .app { display: flex; flex-direction: column; min-height: 100vh; }
    .header { background: #1a1f2e; border-bottom: 1px solid #2d3748; padding: 10px 24px; display: flex; align-items: center; gap: 16px; }
    .header h1 { font-size: 18px; font-weight: 700; color: #63b3ed; letter-spacing: -0.5px; }
    .header-stats { display: flex; gap: 24px; margin-left: auto; }
    .header-stat .lbl { font-size: 10px; color: #718096; text-transform: uppercase; }
    .header-stat .val { font-size: 15px; font-weight: 600; }
    .tabs { background: #1a1f2e; border-bottom: 1px solid #2d3748; display: flex; overflow-x: auto; padding: 0 16px; }
    .tab { padding: 11px 16px; cursor: pointer; font-size: 13px; border-bottom: 2px solid transparent; color: #718096; white-space: nowrap; transition: all 0.15s; }
    .tab:hover { color: #e2e8f0; }
    .tab.active { color: #63b3ed; border-bottom-color: #63b3ed; }
    .content { flex: 1; padding: 24px; overflow-y: auto; max-width: 1400px; width: 100%; margin: 0 auto; }
    .card { background: #1a1f2e; border: 1px solid #2d3748; border-radius: 8px; padding: 20px; }
    .card-sm { padding: 14px; }
    .card-title { font-size: 11px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .card-value { font-size: 22px; font-weight: 700; }
    .grid { display: grid; gap: 16px; }
    .g2 { grid-template-columns: repeat(2, 1fr); }
    .g3 { grid-template-columns: repeat(3, 1fr); }
    .g4 { grid-template-columns: repeat(4, 1fr); }
    table { width: 100%; border-collapse: collapse; }
    th { font-size: 11px; color: #718096; text-transform: uppercase; padding: 8px 12px; text-align: left; border-bottom: 1px solid #2d3748; white-space: nowrap; }
    td { padding: 9px 12px; border-bottom: 1px solid #1e2536; font-size: 13px; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255,255,255,0.02); }
    .btn { padding: 7px 14px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; font-weight: 500; transition: opacity 0.15s; }
    .btn:hover { opacity: 0.82; }
    .btn-primary { background: #3182ce; color: #fff; }
    .btn-secondary { background: #2d3748; color: #e2e8f0; }
    .btn-danger { background: #9b2c2c; color: #fff; }
    .btn-success { background: #276749; color: #fff; }
    .btn-sm { padding: 4px 10px; font-size: 11px; }
    .btn-lg { padding: 10px 24px; font-size: 14px; }
    .form-group { margin-bottom: 14px; }
    label { display: block; font-size: 11px; color: #a0aec0; margin-bottom: 4px; }
    input, select, textarea { width: 100%; background: #0f1117; border: 1px solid #2d3748; border-radius: 6px; color: #e2e8f0; padding: 8px 10px; font-size: 13px; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: #3182ce; }
    select option { background: #1a1f2e; }
    .wizard-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .wizard-box { background: #1a1f2e; border: 1px solid #2d3748; border-radius: 12px; padding: 32px; width: 100%; max-width: 600px; }
    .wizard-title { font-size: 22px; font-weight: 700; color: #63b3ed; margin-bottom: 4px; }
    .wizard-sub { color: #718096; font-size: 13px; margin-bottom: 24px; }
    .progress-dots { display: flex; gap: 6px; margin-bottom: 28px; }
    .dot { width: 28px; height: 4px; border-radius: 2px; background: #2d3748; }
    .dot.done { background: #3182ce; }
    .dot.active { background: #63b3ed; }
    .agent-card { background: #1a1f2e; border: 1px solid #2d3748; border-radius: 8px; margin-bottom: 10px; overflow: hidden; }
    .agent-hdr { padding: 12px 16px; display: flex; align-items: center; gap: 10px; cursor: pointer; }
    .agent-icon { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
    .agent-body { padding: 4px 16px 16px; border-top: 1px solid #2d3748; }
    .agent-running { animation: pulse 1.4s ease-in-out infinite; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
    .chat-wrap { background: #1a1f2e; border: 1px solid #2d3748; border-radius: 8px; display: flex; flex-direction: column; height: 420px; }
    .chat-msgs { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
    .chat-msg { max-width: 78%; padding: 9px 13px; border-radius: 12px; font-size: 13px; line-height: 1.6; }
    .chat-msg.user { background: #2b4c7e; align-self: flex-end; border-radius: 12px 12px 3px 12px; }
    .chat-msg.ai { background: #1e2536; align-self: flex-start; border-radius: 12px 12px 12px 3px; }
    .chat-input { display: flex; gap: 8px; padding: 10px; border-top: 1px solid #2d3748; }
    .chat-input input { flex: 1; }
    .badge { display: inline-block; padding: 2px 7px; border-radius: 10px; font-size: 11px; font-weight: 500; }
    .b-green { background: #1c4532; color: #68d391; }
    .b-red { background: #4a1c1c; color: #fc8181; }
    .b-blue { background: #1a3a5c; color: #63b3ed; }
    .b-yellow { background: #4a3b1c; color: #f6ad55; }
    .b-purple { background: #322a5c; color: #b794f4; }
    .green { color: #68d391; } .red { color: #fc8181; } .blue { color: #63b3ed; }
    .yellow { color: #f6ad55; } .gray { color: #718096; } .bold { font-weight: 600; }
    .tr { text-align: right; } .tc { text-align: center; }
    .mb-2 { margin-bottom: 8px; } .mb-4 { margin-bottom: 16px; } .mb-6 { margin-bottom: 24px; }
    .mt-2 { margin-top: 8px; } .mt-4 { margin-top: 16px; }
    .flex { display: flex; } .flex-1 { flex: 1; } .items-center { align-items: center; }
    .justify-between { justify-content: space-between; } .gap-2 { gap: 8px; } .gap-4 { gap: 16px; }
    .progress-track { height: 7px; background: #2d3748; border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
    .section-title { font-size: 15px; font-weight: 600; margin-bottom: 14px; color: #e2e8f0; }
    .spinner { width: 18px; height: 18px; border: 2px solid #2d3748; border-top-color: #63b3ed; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .divider { border: none; border-top: 1px solid #2d3748; margin: 16px 0; }
    .chip { display: inline-block; padding: 4px 10px; background: #2d3748; border-radius: 14px; font-size: 12px; cursor: pointer; margin: 3px; transition: background 0.15s; }
    .chip:hover { background: #3182ce; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #2d3748; border-radius: 3px; }
    @media (max-width: 768px) { .g3,.g4 { grid-template-columns: repeat(2,1fr); } .content { padding: 12px; } }
    @media (max-width: 480px) { .g2,.g3,.g4 { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
<div id="root"></div>
<script type="text/babel" data-presets="react,env">
// =============================================================================
// FINPAL — Personal Financial Advisor  |  Single-file React app, no build step
// Open as HTML in browser or paste into a Claude artifact
// =============================================================================
const { useState, useEffect, useCallback, useMemo, useRef, useReducer } = React;

// Guard: if Recharts CDN failed to load, surface a clear error rather than crashing silently
if (typeof Recharts === 'undefined') {
  document.getElementById('root').innerHTML =
    '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#fc8181;background:#0f1117;flex-direction:column;gap:16px">' +
    '<div style="font-size:24px">⚠ Recharts failed to load</div>' +
    '<div style="color:#a0aec0;font-size:14px">Check your internet connection — the app uses CDN libraries.</div>' +
    '<div style="color:#718096;font-size:12px">Open the browser console (F12) for details.</div>' +
    '</div>';
  throw new Error('Recharts CDN failed to load');
}

const { ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
        LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } = Recharts;

// ─── Constants ──────────────────────────────────────────────────────────────
const MODEL = 'claude-sonnet-4-6';
const PIE_COLORS = ['#3182ce','#68d391','#f6ad55','#fc8181','#b794f4','#4fd1c5','#f687b3','#a0aec0'];
const TABS = ['Net Worth','Portfolio','Debt','Goals','Models','Market','AI Agents'];

// ─── Utilities ───────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));
let _id = 0;
const genId = () => `${Date.now()}_${_id++}`;

// Currency formatting: compact for headers, full for tables
const fmt = n => {
  if (n == null || isNaN(n)) return '—';
  const a = Math.abs(n), s = n < 0 ? '-' : '';
  if (a >= 1e9) return `${s}$${(a/1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${s}$${(a/1e6).toFixed(2)}M`;
  if (a >= 1e3) return `${s}$${(a/1e3).toFixed(1)}K`;
  return `${s}$${a.toFixed(0)}`;
};
const fmtFull = n => n == null || isNaN(n) ? '—' :
  new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const fmtPct = (n, showSign = true) => n == null || isNaN(n) ? '—' :
  `${showSign && n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US',{month:'short',year:'numeric'}) : '—';
const monthsBetween = (a, b) => {
  const d1 = new Date(a), d2 = new Date(b);
  return Math.max(0, (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth()));
};

// ─── API helpers ─────────────────────────────────────────────────────────────

/** Call Anthropic Claude API with retry via exponential backoff */
async function callAPI(messages, systemPrompt, apiKey, maxTokens = 1400) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system: systemPrompt, messages }),
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`${res.status}: ${t}`); }
  const data = await res.json();
  return data.content[0].text;
}

/** Alpha Vantage GLOBAL_QUOTE — returns { price, change, changePct } */
async function fetchStockPrice(ticker, apiKey) {
  const r = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(ticker)}&apikey=${apiKey}`);
  const d = await r.json();
  const q = d['Global Quote'];
  if (!q || !q['05. price']) throw new Error(`No quote for ${ticker}`);
  return { price: +q['05. price'], change: +q['09. change'], changePct: parseFloat((q['10. change percent']||'0').replace('%','')) };
}

/** CoinGecko free endpoint — coinId e.g. "bitcoin", "ethereum" */
async function fetchCryptoPrice(coinId) {
  const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`);
  const d = await r.json();
  if (!d[coinId]) throw new Error(`No data for ${coinId}`);
  return { price: d[coinId].usd, changePct: d[coinId].usd_24h_change || 0 };
}

/** FRED observations — requires free API key */
async function fetchFRED(seriesId, fredKey) {
  const r = await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${fredKey}&file_type=json&sort_order=desc&limit=24`);
  const d = await r.json();
  if (!d.observations) throw new Error(`FRED error for ${seriesId}`);
  return d.observations.map(o => ({ date: o.date, value: parseFloat(o.value) })).filter(o => !isNaN(o.value));
}

/** Finnhub company news */
async function fetchFinnhubNews(ticker, apiKey) {
  const to = new Date().toISOString().split('T')[0];
  const from = new Date(Date.now() - 7*86400000).toISOString().split('T')[0];
  const r = await fetch(`https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${from}&to=${to}&token=${apiKey}`);
  const d = await r.json();
  return Array.isArray(d) ? d.slice(0,6) : [];
}

// ─── Markdown renderer ────────────────────────────────────────────────────────
function RenderedText({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div style={{lineHeight:1.75,fontSize:13,color:'#e2e8f0'}}>
      {lines.map((line,i) => {
        if (line.startsWith('## ')) return <h4 key={i} style={{color:'#63b3ed',fontWeight:600,margin:'10px 0 4px'}}>{line.slice(3)}</h4>;
        if (line.startsWith('# '))  return <h3 key={i} style={{color:'#e2e8f0',fontWeight:700,margin:'12px 0 6px'}}>{line.slice(2)}</h3>;
        if (line.startsWith('- ') || line.startsWith('* '))
          return <div key={i} style={{display:'flex',gap:8,margin:'2px 0'}}><span style={{color:'#63b3ed',flexShrink:0}}>•</span><span>{line.slice(2)}</span></div>;
        if (line.trim() === '') return <div key={i} style={{height:6}}/>;
        // Inline bold (**text**)
        const parts = line.split(/\*\*(.*?)\*\*/);
        return <p key={i} style={{margin:'2px 0'}}>{parts.map((p,j) => j%2===1 ? <strong key={j}>{p}</strong> : p)}</p>;
      })}
    </div>
  );
}

// ─── Financial models ─────────────────────────────────────────────────────────

/** Monte Carlo retirement simulation — 1000 runs, returns percentile portfolio values */
function runMonteCarlo({ currentAge, retirementAge, currentSavings, monthlyContribution,
                         annualReturnMean=0.07, annualReturnStd=0.15, runs=1000 }) {
  const years = Math.max(1, retirementAge - currentAge);
  const results = new Array(runs);
  for (let r = 0; r < runs; r++) {
    let bal = currentSavings;
    for (let y = 0; y < years; y++) {
      // Box-Muller for normal distribution sample
      const u1 = Math.random() || 1e-10, u2 = Math.random();
      const z = Math.sqrt(-2*Math.log(u1)) * Math.cos(2*Math.PI*u2);
      bal = bal * (1 + annualReturnMean + annualReturnStd * z) + monthlyContribution * 12;
      if (bal < 0) bal = 0;
    }
    results[r] = bal;
  }
  results.sort((a,b) => a-b);
  const p = pct => results[Math.min(runs-1, Math.floor(pct/100*runs))];
  // Build year-by-year chart data for median path
  const chartData = [];
  let bal = currentSavings;
  for (let y = 0; y <= years; y++) {
    if (y > 0) bal = bal * (1 + annualReturnMean) + monthlyContribution * 12;
    chartData.push({ year: currentAge + y, median: Math.round(bal) });
  }
  return { p10:p(10), p25:p(25), p50:p(50), p75:p(75), p90:p(90), chartData, annualIncome4pct: p(50)*0.04 };
}

/** Avalanche payoff (highest APR first) — returns { months, totalInterest } */
function calcPayoff(debts, extraMonthly, sortFn) {
  let rem = debts.map(d => ({...d, bal: d.balance}));
  let month = 0, totalInterest = 0;
  const minTotal = rem.reduce((s,d) => s+d.minPayment, 0);
  while (rem.some(d => d.bal > 0.01) && month < 600) {
    month++;
    let budget = minTotal + extraMonthly;
    const sorted = [...rem].sort(sortFn);
    for (const d of sorted) {
      if (d.bal <= 0) continue;
      const interest = d.bal * (d.apr/100/12);
      totalInterest += interest;
      d.bal += interest;
      const pay = Math.min(d.bal, budget);
      d.bal -= pay;
      budget -= pay;
      if (budget <= 0.01) break;
    }
    rem = sorted;
  }
  return { months: month, totalInterest: Math.round(totalInterest) };
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS = 'finpal_v1';
const loadState = () => { try { const r=localStorage.getItem(LS); return r?JSON.parse(r):null; } catch{return null;} };
const saveState = s => { try{localStorage.setItem(LS,JSON.stringify(s));}catch{} };

// ─── State management ─────────────────────────────────────────────────────────
const BLANK = {
  setupComplete: false, activeTab: 'Net Worth',
  profile: { name:'', age:30, annualIncome:100000, marginalTaxRate:22, riskTolerance:3, primaryGoal:'retirement' },
  assets: [], liabilities: [], cash: [], goals: [],
  apiKeys: { anthropic:'', alphaVantage:'', finnhub:'', fred:'' },
  livePrices: {}, pricesFetching: false, pricesFetched: false,
};

function reducer(state, action) {
  let next;
  switch (action.type) {
    case 'SETUP_COMPLETE':    next = {...BLANK, ...action.payload, setupComplete:true, activeTab:'Net Worth'}; break;
    case 'SET_TAB':           next = {...state, activeTab:action.tab}; break;
    case 'SET_PRICES':        next = {...state, livePrices:action.prices, pricesFetching:false, pricesFetched:true}; break;
    case 'PRICES_FETCHING':   next = {...state, pricesFetching:true}; break;
    case 'ADD_ASSET':         next = {...state, assets:[...state.assets, action.item]}; break;
    case 'REMOVE_ASSET':      next = {...state, assets:state.assets.filter(a=>a.id!==action.id), livePrices:{...state.livePrices}}; break;
    case 'UPDATE_ASSET':      next = {...state, assets:state.assets.map(a=>a.id===action.id?{...a,...action.data}:a)}; break;
    case 'ADD_LIABILITY':     next = {...state, liabilities:[...state.liabilities, action.item]}; break;
    case 'REMOVE_LIABILITY':  next = {...state, liabilities:state.liabilities.filter(l=>l.id!==action.id)}; break;
    case 'ADD_CASH':          next = {...state, cash:[...state.cash, action.item]}; break;
    case 'REMOVE_CASH':       next = {...state, cash:state.cash.filter(c=>c.id!==action.id)}; break;
    case 'ADD_GOAL':          next = {...state, goals:[...state.goals, action.item]}; break;
    case 'REMOVE_GOAL':       next = {...state, goals:state.goals.filter(g=>g.id!==action.id)}; break;
    case 'RESET':             next = {...BLANK}; break;
    default:                  return state;
  }
  saveState(next);
  return next;
}

// =============================================================================
// SETUP WIZARD
// =============================================================================
function SetupWizard({ onComplete }) {
  const [step, setStep] = useState(0); // 0=Profile 1=APIKeys 2=Assets 3=Liabilities 4=Cash 5=Goals
  const STEPS = ['Profile','API Keys','Assets','Liabilities','Cash','Goals'];

  // Each section's data lives here during wizard
  const [profile, setProfile] = useState({ name:'', age:30, annualIncome:100000, marginalTaxRate:22, riskTolerance:3, primaryGoal:'retirement' });
  const [apiKeys, setApiKeys] = useState({ anthropic:'', alphaVantage:'', finnhub:'', fred:'' });
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [cash, setCash] = useState([]);
  const [goals, setGoals] = useState([]);

  // Temporary form state for adding items
  const [newAsset, setNewAsset] = useState({ ticker:'', name:'', shares:1, costBasis:0, accountType:'taxable', assetType:'stock' });
  const [newLiability, setNewLiability] = useState({ name:'', type:'mortgage', balance:0, apr:5, minPayment:0 });
  const [newCash, setNewCash] = useState({ name:'Checking', amount:0, apy:0 });
  const [newGoal, setNewGoal] = useState({ name:'', targetAmount:0, targetDate:'', currentSaved:0, priority:'medium' });

  const pf = (k,v) => setProfile(p => ({...p,[k]:v}));
  const ak = (k,v) => setApiKeys(p => ({...p,[k]:v}));

  const finish = () => onComplete({ profile, apiKeys, assets, liabilities, cash, goals });

  // ── Step renderers ──────────────────────────────────────────────────────────
  const renderProfile = () => (
    <div>
      <div className="grid g2 gap-4 mb-4">
        <div className="form-group"><label>Your Name</label>
          <input value={profile.name} onChange={e=>pf('name',e.target.value)} placeholder="Alex Smith" /></div>
        <div className="form-group"><label>Age</label>
          <input type="number" min="18" max="90" value={profile.age} onChange={e=>pf('age',+e.target.value)} /></div>
        <div className="form-group"><label>Annual Income (pre-tax)</label>
          <input type="number" value={profile.annualIncome} onChange={e=>pf('annualIncome',+e.target.value)} /></div>
        <div className="form-group"><label>Marginal Tax Rate (%)</label>
          <input type="number" min="0" max="60" value={profile.marginalTaxRate} onChange={e=>pf('marginalTaxRate',+e.target.value)} /></div>
      </div>
      <div className="form-group"><label>Risk Tolerance: <span className="blue">{['','Very Conservative','Conservative','Moderate','Aggressive','Very Aggressive'][profile.riskTolerance]}</span></label>
        <input type="range" min="1" max="5" value={profile.riskTolerance} onChange={e=>pf('riskTolerance',+e.target.value)} style={{width:'100%',accentColor:'#3182ce'}} /></div>
      <div className="form-group"><label>Primary Financial Goal</label>
        <select value={profile.primaryGoal} onChange={e=>pf('primaryGoal',e.target.value)}>
          <option value="retirement">Retirement</option>
          <option value="house">Buy a House</option>
          <option value="fi">Financial Independence</option>
          <option value="debt">Pay Off Debt</option>
          <option value="education">Save for Education</option>
          <option value="wealth">Build Wealth</option>
        </select></div>
    </div>
  );

  const renderApiKeys = () => (
    <div>
      <p style={{color:'#718096',fontSize:12,marginBottom:16}}>
        Keys are stored only in your browser's localStorage. They are sent directly to each provider's API — never stored on any server.
      </p>
      {[
        ['anthropic','Anthropic API Key (required for AI features)','sk-ant-...'],
        ['alphaVantage','Alpha Vantage Key (free — stock/ETF prices)','Your key'],
        ['finnhub','Finnhub Key (free — financial news)','Your key'],
        ['fred','FRED API Key (free — macro indicators)','Your key'],
      ].map(([k,label,ph]) => (
        <div key={k} className="form-group">
          <label>{label}</label>
          <input type="password" value={apiKeys[k]} onChange={e=>ak(k,e.target.value)} placeholder={ph} autoComplete="off" />
        </div>
      ))}
      <p style={{color:'#4a5568',fontSize:11}}>All four keys are optional except Anthropic for AI Agents. Free tiers are sufficient.</p>
    </div>
  );

  const addAsset = () => {
    if (!newAsset.ticker && !newAsset.name) return;
    setAssets(a => [...a, { id:genId(), ...newAsset, ticker:newAsset.ticker.toUpperCase(), shares:+newAsset.shares, costBasis:+newAsset.costBasis }]);
    setNewAsset({ ticker:'', name:'', shares:1, costBasis:0, accountType:'taxable', assetType:'stock' });
  };

  const renderAssets = () => (
    <div>
      <div className="grid g2 gap-4 mb-4" style={{alignItems:'end'}}>
        <div className="form-group" style={{marginBottom:0}}><label>Ticker / Symbol</label>
          <input value={newAsset.ticker} onChange={e=>setNewAsset(a=>({...a,ticker:e.target.value}))} placeholder="AAPL, BTC, VTI..." /></div>
        <div className="form-group" style={{marginBottom:0}}><label>Name (optional)</label>
          <input value={newAsset.name} onChange={e=>setNewAsset(a=>({...a,name:e.target.value}))} placeholder="Apple Inc." /></div>
        <div className="form-group" style={{marginBottom:0}}><label>Shares / Units</label>
          <input type="number" min="0" step="any" value={newAsset.shares} onChange={e=>setNewAsset(a=>({...a,shares:e.target.value}))} /></div>
        <div className="form-group" style={{marginBottom:0}}><label>Cost Basis (per share)</label>
          <input type="number" min="0" step="any" value={newAsset.costBasis} onChange={e=>setNewAsset(a=>({...a,costBasis:e.target.value}))} /></div>
        <div className="form-group" style={{marginBottom:0}}><label>Account Type</label>
          <select value={newAsset.accountType} onChange={e=>setNewAsset(a=>({...a,accountType:e.target.value}))}>
            <option value="taxable">Taxable</option><option value="ira">IRA</option>
            <option value="401k">401(k)</option><option value="roth">Roth IRA</option>
          </select></div>
        <div className="form-group" style={{marginBottom:0}}><label>Asset Type</label>
          <select value={newAsset.assetType} onChange={e=>setNewAsset(a=>({...a,assetType:e.target.value}))}>
            <option value="stock">Stock</option><option value="etf">ETF</option>
            <option value="crypto">Crypto</option><option value="other">Other</option>
          </select></div>
      </div>
      <button className="btn btn-primary btn-sm mb-4" onClick={addAsset}>+ Add Asset</button>
      {assets.length > 0 && (
        <table><thead><tr><th>Ticker</th><th>Shares</th><th>Cost Basis</th><th>Account</th><th>Type</th><th></th></tr></thead>
        <tbody>{assets.map(a => (
          <tr key={a.id}>
            <td className="bold">{a.ticker}</td><td>{a.shares}</td>
            <td>{fmtFull(a.costBasis * a.shares)}</td>
            <td><span className="badge b-blue">{a.accountType}</span></td>
            <td>{a.assetType}</td>
            <td><button className="btn btn-danger btn-sm" onClick={()=>setAssets(arr=>arr.filter(x=>x.id!==a.id))}>×</button></td>
          </tr>
        ))}</tbody></table>
      )}
    </div>
  );

  const addLiability = () => {
    if (!newLiability.name) return;
    setLiabilities(l => [...l, { id:genId(), ...newLiability, balance:+newLiability.balance, apr:+newLiability.apr, minPayment:+newLiability.minPayment }]);
    setNewLiability({ name:'', type:'mortgage', balance:0, apr:5, minPayment:0 });
  };

  const renderLiabilities = () => (
    <div>
      <div className="grid g2 gap-4 mb-4" style={{alignItems:'end'}}>
        <div className="form-group" style={{marginBottom:0}}><label>Debt Name</label>
          <input value={newLiability.name} onChange={e=>setNewLiability(l=>({...l,name:e.target.value}))} placeholder="Chase Mortgage" /></div>
        <div className="form-group" style={{marginBottom:0}}><label>Type</label>
          <select value={newLiability.type} onChange={e=>setNewLiability(l=>({...l,type:e.target.value}))}>
            <option value="mortgage">Mortgage</option><option value="auto">Auto Loan</option>
            <option value="student">Student Loan</option><option value="credit_card">Credit Card</option><option value="other">Other</option>
          </select></div>
        <div className="form-group" style={{marginBottom:0}}><label>Balance ($)</label>
          <input type="number" min="0" value={newLiability.balance} onChange={e=>setNewLiability(l=>({...l,balance:e.target.value}))} /></div>
        <div className="form-group" style={{marginBottom:0}}><label>APR (%)</label>
          <input type="number" min="0" step="0.1" value={newLiability.apr} onChange={e=>setNewLiability(l=>({...l,apr:e.target.value}))} /></div>
        <div className="form-group" style={{marginBottom:0}}><label>Min Monthly Payment ($)</label>
          <input type="number" min="0" value={newLiability.minPayment} onChange={e=>setNewLiability(l=>({...l,minPayment:e.target.value}))} /></div>
      </div>
      <button className="btn btn-primary btn-sm mb-4" onClick={addLiability}>+ Add Debt</button>
      {liabilities.length > 0 && (
        <table><thead><tr><th>Name</th><th>Type</th><th>Balance</th><th>APR</th><th>Min Pay</th><th></th></tr></thead>
        <tbody>{liabilities.map(l => (
          <tr key={l.id}>
            <td className="bold">{l.name}</td>
            <td><span className="badge b-red">{l.type.replace('_',' ')}</span></td>
            <td>{fmtFull(l.balance)}</td><td>{l.apr}%</td><td>{fmtFull(l.minPayment)}/mo</td>
            <td><button className="btn btn-danger btn-sm" onClick={()=>setLiabilities(arr=>arr.filter(x=>x.id!==l.id))}>×</button></td>
          </tr>
        ))}</tbody></table>
      )}
    </div>
  );

  const addCash = () => {
    if (!newCash.name) return;
    setCash(c => [...c, { id:genId(), ...newCash, amount:+newCash.amount, apy:+newCash.apy }]);
    setNewCash({ name:'', amount:0, apy:0 });
  };

  const renderCash = () => (
    <div>
      <div className="grid g2 gap-4 mb-4" style={{alignItems:'end'}}>
        <div className="form-group" style={{marginBottom:0}}><label>Account Name</label>
          <input value={newCash.name} onChange={e=>setNewCash(c=>({...c,name:e.target.value}))} placeholder="Marcus HYSA" /></div>
        <div className="form-group" style={{marginBottom:0}}><label>Balance ($)</label>
          <input type="number" min="0" value={newCash.amount} onChange={e=>setNewCash(c=>({...c,amount:e.target.value}))} /></div>
        <div className="form-group" style={{marginBottom:0}}><label>APY (%)</label>
          <input type="number" min="0" step="0.01" value={newCash.apy} onChange={e=>setNewCash(c=>({...c,apy:e.target.value}))} /></div>
      </div>
      <button className="btn btn-primary btn-sm mb-4" onClick={addCash}>+ Add Account</button>
      {cash.length > 0 && (
        <table><thead><tr><th>Account</th><th>Balance</th><th>APY</th><th></th></tr></thead>
        <tbody>{cash.map(c => (
          <tr key={c.id}>
            <td className="bold">{c.name}</td><td>{fmtFull(c.amount)}</td><td>{c.apy}%</td>
            <td><button className="btn btn-danger btn-sm" onClick={()=>setCash(arr=>arr.filter(x=>x.id!==c.id))}>×</button></td>
          </tr>
        ))}</tbody></table>
      )}
    </div>
  );

  const addGoal = () => {
    if (!newGoal.name || !newGoal.targetDate) return;
    setGoals(g => [...g, { id:genId(), ...newGoal, targetAmount:+newGoal.targetAmount, currentSaved:+newGoal.currentSaved }]);
    setNewGoal({ name:'', targetAmount:0, targetDate:'', currentSaved:0, priority:'medium' });
  };

  const renderGoals = () => (
    <div>
      <div className="grid g2 gap-4 mb-4" style={{alignItems:'end'}}>
        <div className="form-group" style={{marginBottom:0}}><label>Goal Name</label>
          <input value={newGoal.name} onChange={e=>setNewGoal(g=>({...g,name:e.target.value}))} placeholder="Down payment, emergency fund..." /></div>
        <div className="form-group" style={{marginBottom:0}}><label>Target Amount ($)</label>
          <input type="number" min="0" value={newGoal.targetAmount} onChange={e=>setNewGoal(g=>({...g,targetAmount:e.target.value}))} /></div>
        <div className="form-group" style={{marginBottom:0}}><label>Target Date</label>
          <input type="date" value={newGoal.targetDate} onChange={e=>setNewGoal(g=>({...g,targetDate:e.target.value}))} /></div>
        <div className="form-group" style={{marginBottom:0}}><label>Already Saved ($)</label>
          <input type="number" min="0" value={newGoal.currentSaved} onChange={e=>setNewGoal(g=>({...g,currentSaved:e.target.value}))} /></div>
        <div className="form-group" style={{marginBottom:0}}><label>Priority</label>
          <select value={newGoal.priority} onChange={e=>setNewGoal(g=>({...g,priority:e.target.value}))}>
            <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
          </select></div>
      </div>
      <button className="btn btn-primary btn-sm mb-4" onClick={addGoal}>+ Add Goal</button>
      {goals.length > 0 && (
        <table><thead><tr><th>Goal</th><th>Target</th><th>Saved</th><th>Date</th><th>Priority</th><th></th></tr></thead>
        <tbody>{goals.map(g => {
          const pct = Math.min(100, g.targetAmount > 0 ? (g.currentSaved / g.targetAmount * 100) : 0);
          return (
            <tr key={g.id}>
              <td className="bold">{g.name}</td><td>{fmtFull(g.targetAmount)}</td>
              <td>{fmtFull(g.currentSaved)} <span className="gray">({pct.toFixed(0)}%)</span></td>
              <td>{fmtDate(g.targetDate)}</td>
              <td><span className={`badge ${g.priority==='high'?'b-red':g.priority==='medium'?'b-yellow':'b-blue'}`}>{g.priority}</span></td>
              <td><button className="btn btn-danger btn-sm" onClick={()=>setGoals(arr=>arr.filter(x=>x.id!==g.id))}>×</button></td>
            </tr>
          );
        })}</tbody></table>
      )}
    </div>
  );

  const canNext = () => {
    if (step === 0) return profile.name.trim().length > 0;
    if (step === 1) return true; // API keys optional
    return true; // assets/liabilities/cash/goals all optional
  };

  const stepContent = [renderProfile, renderApiKeys, renderAssets, renderLiabilities, renderCash, renderGoals];

  return (
    <div className="wizard-wrap">
      <div className="wizard-box">
        <div className="wizard-title">FinPal</div>
        <div className="wizard-sub">Your personal financial advisor — no account, no bank sync, no stored data</div>
        <div className="progress-dots">
          {STEPS.map((s,i) => <div key={s} className={`dot ${i<step?'done':i===step?'active':''}`} title={s} />)}
        </div>
        <div className="section-title" style={{marginBottom:20}}>{STEPS[step]}</div>
        {stepContent[step]()}
        <div className="flex justify-between mt-4" style={{marginTop:24}}>
          <button className="btn btn-secondary" onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0}>Back</button>
          {step < STEPS.length - 1
            ? <button className="btn btn-primary" onClick={()=>setStep(s=>s+1)} disabled={!canNext()}>Next →</button>
            : <button className="btn btn-success btn-lg" onClick={finish}>Launch FinPal →</button>
          }
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// NET WORTH TAB
// =============================================================================
function NetWorthTab({ state }) {
  const { assets, liabilities, cash, livePrices, profile } = state;

  // Calculate current portfolio value using live prices where available
  const assetValue = assets.reduce((sum, a) => {
    const lp = livePrices[a.ticker];
    const price = lp ? lp.price : a.costBasis;
    return sum + price * a.shares;
  }, 0);
  const cashValue = cash.reduce((s,c) => s + c.amount, 0);
  const debtValue = liabilities.reduce((s,l) => s + l.balance, 0);
  const totalAssets = assetValue + cashValue;
  const netWorth = totalAssets - debtValue;
  const costBasisTotal = assets.reduce((s,a) => s + a.costBasis * a.shares, 0);
  const unrealizedGain = assetValue - costBasisTotal;

  // Allocation breakdown for pie chart
  const typeMap = {};
  assets.forEach(a => {
    const lp = livePrices[a.ticker];
    const val = (lp ? lp.price : a.costBasis) * a.shares;
    typeMap[a.assetType] = (typeMap[a.assetType] || 0) + val;
  });
  if (cashValue > 0) typeMap['cash'] = cashValue;
  const pieData = Object.entries(typeMap).map(([name, value]) => ({ name: name.charAt(0).toUpperCase()+name.slice(1), value: Math.round(value) }));

  // Account type breakdown
  const acctMap = {};
  assets.forEach(a => {
    const lp = livePrices[a.ticker];
    const val = (lp ? lp.price : a.costBasis) * a.shares;
    acctMap[a.accountType] = (acctMap[a.accountType] || 0) + val;
  });
  const acctData = Object.entries(acctMap).map(([name,value]) => ({name, value: Math.round(value)}));

  // 10-year net worth projection (simple linear savings rate assumption)
  const estimatedSavingsRate = 0.20;
  const monthlySavings = profile.annualIncome * estimatedSavingsRate / 12;
  const projData = Array.from({length:11},(_,i) => ({
    year: new Date().getFullYear()+i,
    projected: Math.round(netWorth + monthlySavings*12*i * Math.pow(1.07, i)),
  }));

  const statCard = (label, value, sub, color='#e2e8f0') => (
    <div className="card card-sm">
      <div className="card-title">{label}</div>
      <div className="card-value" style={{color}}>{value}</div>
      {sub && <div style={{fontSize:12,color:'#718096',marginTop:4}}>{sub}</div>}
    </div>
  );

  return (
    <div>
      {/* Summary row */}
      <div className="grid g4 gap-4 mb-6">
        {statCard('Net Worth', fmtFull(netWorth), `${fmtFull(totalAssets)} assets — ${fmtFull(debtValue)} debt`, netWorth>=0?'#68d391':'#fc8181')}
        {statCard('Investment Portfolio', fmtFull(assetValue), `Cost basis ${fmtFull(costBasisTotal)}`)}
        {statCard('Unrealized P&L', fmtFull(unrealizedGain), costBasisTotal>0?`${(unrealizedGain/costBasisTotal*100).toFixed(1)}% total return`:null, unrealizedGain>=0?'#68d391':'#fc8181')}
        {statCard('Cash & Savings', fmtFull(cashValue), cash.map(c=>c.name).join(', ')||'—')}
      </div>

      <div className="grid g2 gap-4 mb-6">
        {/* Asset allocation pie */}
        <div className="card">
          <div className="section-title">Asset Allocation</div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {pieData.map((entry,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v=>fmtFull(v)} contentStyle={{background:'#1a1f2e',border:'1px solid #2d3748',borderRadius:6,fontSize:12}} />
                <Legend iconSize={10} wrapperStyle={{fontSize:12}} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="gray" style={{textAlign:'center',padding:'40px 0',fontSize:13}}>No assets added yet</div>}
        </div>

        {/* Account type breakdown */}
        <div className="card">
          <div className="section-title">By Account Type</div>
          {acctData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={acctData} layout="vertical" margin={{left:10,right:20}}>
                <XAxis type="number" tickFormatter={v=>fmt(v)} tick={{fill:'#718096',fontSize:11}} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{fill:'#a0aec0',fontSize:12}} axisLine={false} tickLine={false} width={70} />
                <Tooltip formatter={v=>fmtFull(v)} contentStyle={{background:'#1a1f2e',border:'1px solid #2d3748',borderRadius:6,fontSize:12}} />
                <Bar dataKey="value" fill="#3182ce" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="gray" style={{textAlign:'center',padding:'40px 0',fontSize:13}}>No data</div>}
        </div>
      </div>

      {/* 10-year projection */}
      <div className="card">
        <div className="section-title">10-Year Net Worth Projection <span style={{fontSize:12,fontWeight:400,color:'#718096'}}>(20% savings rate, 7% annualized returns)</span></div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={projData} margin={{top:10,right:20,bottom:0,left:10}}>
            <defs>
              <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3182ce" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3182ce" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="year" tick={{fill:'#718096',fontSize:11}} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v=>fmt(v)} tick={{fill:'#718096',fontSize:11}} axisLine={false} tickLine={false} />
            <Tooltip formatter={v=>fmtFull(v)} contentStyle={{background:'#1a1f2e',border:'1px solid #2d3748',borderRadius:6,fontSize:12}} />
            <Area type="monotone" dataKey="projected" stroke="#3182ce" fill="url(#nwGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// =============================================================================
// PORTFOLIO TAB
// =============================================================================
// Maps common crypto tickers to CoinGecko IDs
const CRYPTO_IDS = {
  BTC:'bitcoin', ETH:'ethereum', SOL:'solana', ADA:'cardano',
  AVAX:'avalanche-2', DOT:'polkadot', DOGE:'dogecoin', MATIC:'matic-network',
  LINK:'chainlink', UNI:'uniswap', LTC:'litecoin', XRP:'ripple',
};

function PortfolioTab({ state, dispatch }) {
  const { assets, liabilities, cash, livePrices, pricesFetching, pricesFetched, apiKeys } = state;
  const [fetchError, setFetchError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  // Fetch live prices for all tracked assets
  const fetchPrices = useCallback(async () => {
    if (pricesFetching) return;
    dispatch({ type:'PRICES_FETCHING' });
    setFetchError('');
    // Start fresh each fetch — don't carry over stale prices
    const prices = {};
    const errors = [];

    for (const asset of assets) {
      try {
        if (asset.assetType === 'crypto') {
          const coinId = CRYPTO_IDS[asset.ticker.toUpperCase()] || asset.ticker.toLowerCase();
          const p = await fetchCryptoPrice(coinId);
          prices[asset.ticker] = p;
        } else if (asset.assetType !== 'other' && apiKeys.alphaVantage) {
          const p = await fetchStockPrice(asset.ticker, apiKeys.alphaVantage);
          prices[asset.ticker] = p;
          await sleep(500); // AV rate limit: ~2 req/sec on free tier
        }
      } catch (e) {
        errors.push(`${asset.ticker}: ${e.message}`);
      }
    }

    dispatch({ type:'SET_PRICES', prices });
    if (errors.length) setFetchError(errors.join(' | '));
  }, [assets, apiKeys, pricesFetching]);

  // Enrich assets with live data
  const enriched = useMemo(() => assets.map(a => {
    const lp = livePrices[a.ticker];
    const price = lp ? lp.price : a.costBasis;
    const value = price * a.shares;
    const costTotal = a.costBasis * a.shares;
    const gain = value - costTotal;
    const gainPct = costTotal > 0 ? (gain / costTotal * 100) : 0;
    return { ...a, currentPrice: price, value, gain, gainPct, changePct: lp?.changePct || null };
  }), [assets, livePrices]);

  const totalValue = enriched.reduce((s,a) => s + a.value, 0);

  // Sector-like grouping by assetType for heatmap bars
  const typeGroups = useMemo(() => {
    const m = {};
    enriched.forEach(a => {
      m[a.assetType] = (m[a.assetType] || 0) + a.value;
    });
    return Object.entries(m).map(([type,val]) => ({
      type, val, pct: totalValue > 0 ? val/totalValue*100 : 0
    })).sort((a,b) => b.val-a.val);
  }, [enriched, totalValue]);

  const startEdit = a => { setEditId(a.id); setEditData({ shares:a.shares, costBasis:a.costBasis, accountType:a.accountType }); };
  const saveEdit = id => {
    dispatch({ type:'UPDATE_ASSET', id, data:{ shares:+editData.shares, costBasis:+editData.costBasis, accountType:editData.accountType } });
    setEditId(null);
  };

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div style={{fontSize:12,color:'#718096'}}>Total Portfolio Value</div>
          <div style={{fontSize:26,fontWeight:700}}>{fmtFull(totalValue)}</div>
        </div>
        <div className="flex gap-2 items-center">
          {pricesFetching && <span className="spinner" />}
          {fetchError && <span style={{fontSize:11,color:'#fc8181',maxWidth:300}}>{fetchError}</span>}
          {!apiKeys.alphaVantage && <span style={{fontSize:11,color:'#718096'}}>Add Alpha Vantage key for live stock prices</span>}
          <button className="btn btn-secondary" onClick={fetchPrices} disabled={pricesFetching || assets.length===0}>
            {pricesFetching ? 'Fetching...' : pricesFetched ? '↻ Refresh Prices' : 'Fetch Live Prices'}
          </button>
        </div>
      </div>

      {/* Holdings table */}
      <div className="card mb-6" style={{padding:0,overflow:'hidden'}}>
        <table>
          <thead><tr>
            <th>Ticker</th><th>Name</th><th>Shares</th><th>Price</th>
            <th>Value</th><th>Cost Basis</th><th>Gain/Loss</th><th>Day %</th><th>Account</th><th>Weight</th><th></th>
          </tr></thead>
          <tbody>
            {enriched.length === 0 && (
              <tr><td colSpan="11" className="tc gray" style={{padding:24}}>No assets — add them in the setup wizard or use the button below</td></tr>
            )}
            {enriched.map(a => (
              editId === a.id ? (
                <tr key={a.id} style={{background:'#1e2536'}}>
                  <td className="bold">{a.ticker}</td>
                  <td colSpan="2"><input type="number" value={editData.shares} onChange={e=>setEditData(d=>({...d,shares:e.target.value}))} style={{width:80}} /></td>
                  <td colSpan="2"><input type="number" value={editData.costBasis} onChange={e=>setEditData(d=>({...d,costBasis:e.target.value}))} style={{width:100}} /></td>
                  <td><select value={editData.accountType} onChange={e=>setEditData(d=>({...d,accountType:e.target.value}))} style={{width:90}}>
                    <option value="taxable">Taxable</option><option value="ira">IRA</option>
                    <option value="401k">401(k)</option><option value="roth">Roth</option>
                  </select></td>
                  <td colSpan="4">
                    <button className="btn btn-success btn-sm" onClick={()=>saveEdit(a.id)}>Save</button>{' '}
                    <button className="btn btn-secondary btn-sm" onClick={()=>setEditId(null)}>Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={a.id}>
                  <td><span className="bold">{a.ticker}</span></td>
                  <td className="gray" style={{maxWidth:140,overflow:'hidden',textOverflow:'ellipsis'}}>{a.name||'—'}</td>
                  <td>{a.shares.toLocaleString()}</td>
                  <td>{a.currentPrice ? `$${a.currentPrice.toFixed(2)}` : <span className="gray">—</span>}</td>
                  <td className="bold">{fmtFull(a.value)}</td>
                  <td className="gray">{fmtFull(a.costBasis * a.shares)}</td>
                  <td className={a.gain>=0?'green':'red'}>{fmtFull(a.gain)} <span style={{fontSize:11}}>({fmtPct(a.gainPct)})</span></td>
                  <td className={a.changePct===null?'gray':a.changePct>=0?'green':'red'}>
                    {a.changePct===null?'—':fmtPct(a.changePct)}
                  </td>
                  <td><span className="badge b-blue">{a.accountType}</span></td>
                  <td className="gray">{totalValue>0?(a.value/totalValue*100).toFixed(1):0}%</td>
                  <td className="flex gap-2">
                    <button className="btn btn-secondary btn-sm" onClick={()=>startEdit(a)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={()=>dispatch({type:'REMOVE_ASSET',id:a.id})}>×</button>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>

      {/* Allocation heatmap bars */}
      {typeGroups.length > 0 && (
        <div className="card mb-6">
          <div className="section-title">Allocation by Asset Type</div>
          {typeGroups.map(g => (
            <div key={g.type} className="flex items-center gap-4 mb-2">
              <div style={{width:90,fontSize:12,color:'#a0aec0',textTransform:'capitalize'}}>{g.type}</div>
              <div className="progress-track flex-1">
                <div className="progress-fill" style={{width:`${g.pct}%`, background:'#3182ce'}} />
              </div>
              <div style={{width:120,textAlign:'right',fontSize:12}}>
                <span className="bold">{fmtFull(g.val)}</span>
                <span className="gray"> ({g.pct.toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart: portfolio value by ticker */}
      {enriched.length > 0 && (
        <div className="card">
          <div className="section-title">Holdings Distribution</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={enriched.map(a=>({name:a.ticker,value:Math.round(a.value)})).sort((a,b)=>b.value-a.value)} margin={{top:5,right:20,bottom:5,left:10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="name" tick={{fill:'#a0aec0',fontSize:11}} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v=>fmt(v)} tick={{fill:'#718096',fontSize:11}} axisLine={false} tickLine={false} />
              <Tooltip formatter={v=>fmtFull(v)} contentStyle={{background:'#1a1f2e',border:'1px solid #2d3748',borderRadius:6,fontSize:12}} />
              <Bar dataKey="value" fill="#3182ce" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// DEBT TAB
// =============================================================================
function DebtTab({ state, dispatch }) {
  const { liabilities } = state;
  const [extra, setExtra] = useState(0);

  const totalDebt = liabilities.reduce((s,l) => s+l.balance, 0);
  const totalMinPay = liabilities.reduce((s,l) => s+l.minPayment, 0);
  const weightedAPR = totalDebt > 0
    ? liabilities.reduce((s,l) => s + l.apr * l.balance, 0) / totalDebt
    : 0;

  // Calculate both payoff strategies
  const avalanche = useMemo(() => liabilities.length > 0
    ? (() => {
        let rem = liabilities.map(d=>({...d,bal:d.balance}));
        let month=0, totalInterest=0;
        while(rem.some(d=>d.bal>0.01) && month<600) {
          month++;
          let budget = liabilities.reduce((s,d)=>s+d.minPayment,0) + extra;
          rem = [...rem].sort((a,b)=>b.apr-a.apr);
          for(const d of rem) {
            if(d.bal<=0) continue;
            const int = d.bal*(d.apr/100/12);
            totalInterest+=int; d.bal+=int;
            const pay=Math.min(d.bal,budget); d.bal-=pay; budget-=pay;
            if(budget<=0.01) break;
          }
        }
        return {months:month, totalInterest:Math.round(totalInterest)};
      })()
    : {months:0,totalInterest:0},
  [liabilities, extra]);

  const snowball = useMemo(() => liabilities.length > 0
    ? (() => {
        let rem = liabilities.map(d=>({...d,bal:d.balance}));
        let month=0, totalInterest=0;
        while(rem.some(d=>d.bal>0.01) && month<600) {
          month++;
          let budget = liabilities.reduce((s,d)=>s+d.minPayment,0) + extra;
          rem = [...rem].sort((a,b)=>a.bal-b.bal);
          for(const d of rem) {
            if(d.bal<=0) continue;
            const int = d.bal*(d.apr/100/12);
            totalInterest+=int; d.bal+=int;
            const pay=Math.min(d.bal,budget); d.bal-=pay; budget-=pay;
            if(budget<=0.01) break;
          }
        }
        return {months:month, totalInterest:Math.round(totalInterest)};
      })()
    : {months:0,totalInterest:0},
  [liabilities, extra]);

  const compareData = [
    { name:'Avalanche (Optimal)', months: avalanche.months, interest: avalanche.totalInterest },
    { name:'Snowball (Motivating)', months: snowball.months, interest: snowball.totalInterest },
  ];

  const typeColors = { mortgage:'#3182ce', credit_card:'#fc8181', student:'#68d391', auto:'#f6ad55', other:'#b794f4' };

  return (
    <div>
      {/* Summary */}
      <div className="grid g3 gap-4 mb-6">
        <div className="card card-sm">
          <div className="card-title">Total Debt</div>
          <div className="card-value red">{fmtFull(totalDebt)}</div>
        </div>
        <div className="card card-sm">
          <div className="card-title">Weighted APR</div>
          <div className="card-value">{weightedAPR.toFixed(2)}%</div>
          <div style={{fontSize:12,color:'#718096'}}>Min payment {fmtFull(totalMinPay)}/mo</div>
        </div>
        <div className="card card-sm">
          <div className="card-title">Interest Saved (Avalanche)</div>
          <div className="card-value green">{fmtFull(snowball.totalInterest - avalanche.totalInterest)}</div>
          <div style={{fontSize:12,color:'#718096'}}>vs Snowball method</div>
        </div>
      </div>

      {/* Debt list */}
      <div className="card mb-6" style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'14px 16px'}} className="flex items-center justify-between">
          <span className="section-title" style={{marginBottom:0}}>Your Debts</span>
        </div>
        <table>
          <thead><tr><th>Name</th><th>Type</th><th>Balance</th><th>APR</th><th>Min Payment</th><th>Time to Payoff*</th><th></th></tr></thead>
          <tbody>
            {liabilities.length === 0 && (
              <tr><td colSpan="7" className="tc gray" style={{padding:20}}>No debts added</td></tr>
            )}
            {liabilities.map(l => {
              // Solo payoff estimate (min payment only)
              const moEst = l.balance > 0 && l.minPayment > 0
                ? Math.ceil(-Math.log(1 - (l.apr/100/12)*l.balance/l.minPayment) / Math.log(1 + l.apr/100/12))
                : null;
              return (
                <tr key={l.id}>
                  <td className="bold">{l.name}</td>
                  <td><span className="badge" style={{background:'#1e2536',color:typeColors[l.type]||'#a0aec0'}}>{l.type.replace('_',' ')}</span></td>
                  <td className="bold red">{fmtFull(l.balance)}</td>
                  <td className={l.apr>10?'red':l.apr>5?'yellow':'green'}>{l.apr}%</td>
                  <td>{fmtFull(l.minPayment)}/mo</td>
                  <td className="gray">{moEst&&moEst>0&&isFinite(moEst)?`${moEst} months`:'—'}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={()=>dispatch({type:'REMOVE_LIABILITY',id:l.id})}>×</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{padding:'8px 16px',fontSize:11,color:'#4a5568'}}>*At minimum payment only</div>
      </div>

      {/* Payoff strategy comparison */}
      {liabilities.length > 0 && (
        <div className="card">
          <div className="section-title">Payoff Strategy Comparison</div>
          <div className="flex items-center gap-4 mb-4">
            <label style={{fontSize:13,color:'#a0aec0',whiteSpace:'nowrap'}}>Extra monthly payment: </label>
            <input type="number" min="0" value={extra} onChange={e=>setExtra(+e.target.value)}
              style={{width:120}} placeholder="$0" />
          </div>
          <div className="grid g2 gap-4 mb-4">
            <div style={{background:'#0f1117',padding:16,borderRadius:8,border:'1px solid #2d3748'}}>
              <div style={{fontSize:12,color:'#718096',marginBottom:4}}>Avalanche (Pay Highest APR First)</div>
              <div style={{fontSize:20,fontWeight:700,color:'#68d391'}}>{avalanche.months} months</div>
              <div style={{fontSize:13,color:'#a0aec0'}}>{fmtFull(avalanche.totalInterest)} total interest</div>
            </div>
            <div style={{background:'#0f1117',padding:16,borderRadius:8,border:'1px solid #2d3748'}}>
              <div style={{fontSize:12,color:'#718096',marginBottom:4}}>Snowball (Pay Smallest Balance First)</div>
              <div style={{fontSize:20,fontWeight:700,color:'#f6ad55'}}>{snowball.months} months</div>
              <div style={{fontSize:13,color:'#a0aec0'}}>{fmtFull(snowball.totalInterest)} total interest</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={compareData} layout="vertical" margin={{left:10,right:40}}>
              <XAxis type="number" tickFormatter={v=>fmt(v)} tick={{fill:'#718096',fontSize:11}} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{fill:'#a0aec0',fontSize:11}} axisLine={false} tickLine={false} width={160} />
              <Tooltip formatter={(v,n)=>[n==='interest'?fmtFull(v):`${v} mo`,n==='interest'?'Interest Paid':'Months']}
                contentStyle={{background:'#1a1f2e',border:'1px solid #2d3748',borderRadius:6,fontSize:12}} />
              <Bar dataKey="interest" name="interest" fill="#fc8181" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// GOALS TAB
// =============================================================================
function GoalsTab({ state, dispatch }) {
  const { goals } = state;
  const today = new Date();

  return (
    <div>
      <div className="section-title">Financial Goals</div>
      {goals.length === 0 && (
        <div className="card tc gray" style={{padding:40}}>No goals set — add them in Settings or restart the wizard</div>
      )}
      <div className="grid g2 gap-4">
        {goals.map(g => {
          const months = monthsBetween(today, g.targetDate);
          const remaining = Math.max(0, g.targetAmount - g.currentSaved);
          const monthlyNeeded = months > 0 ? remaining / months : remaining;
          const pct = g.targetAmount > 0 ? Math.min(100, g.currentSaved / g.targetAmount * 100) : 0;
          const onTrack = monthlyNeeded < (state.profile.annualIncome / 12 * 0.2); // rough heuristic

          return (
            <div key={g.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="bold" style={{fontSize:15}}>{g.name}</div>
                  <div style={{fontSize:12,color:'#718096'}}>Target: {fmtDate(g.targetDate)} · {months} months away</div>
                </div>
                <div className="flex gap-2 items-center">
                  <span className={`badge ${g.priority==='high'?'b-red':g.priority==='medium'?'b-yellow':'b-blue'}`}>{g.priority}</span>
                  <button className="btn btn-danger btn-sm" onClick={()=>dispatch({type:'REMOVE_GOAL',id:g.id})}>×</button>
                </div>
              </div>
              <div className="progress-track mb-2">
                <div className="progress-fill" style={{width:`${pct}%`,background:pct>=100?'#68d391':'#3182ce'}} />
              </div>
              <div className="flex justify-between" style={{fontSize:12}}>
                <span className="gray">{fmtFull(g.currentSaved)} saved</span>
                <span className="bold">{pct.toFixed(0)}%</span>
                <span className="gray">{fmtFull(g.targetAmount)} goal</span>
              </div>
              <hr className="divider" />
              <div className="grid g2 gap-2" style={{fontSize:12}}>
                <div><span className="gray">Remaining: </span><span className="bold">{fmtFull(remaining)}</span></div>
                <div><span className="gray">Monthly needed: </span>
                  <span className={`bold ${onTrack?'green':'yellow'}`}>{fmtFull(monthlyNeeded)}/mo</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {goals.length > 0 && (
        <div className="card mt-4">
          <div className="section-title">Goals Progress Overview</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={goals.map(g=>({
              name: g.name.length>12?g.name.slice(0,12)+'…':g.name,
              saved: g.currentSaved,
              remaining: Math.max(0,g.targetAmount-g.currentSaved),
            }))} margin={{top:5,right:20,bottom:5,left:10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="name" tick={{fill:'#a0aec0',fontSize:11}} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v=>fmt(v)} tick={{fill:'#718096',fontSize:11}} axisLine={false} tickLine={false} />
              <Tooltip formatter={v=>fmtFull(v)} contentStyle={{background:'#1a1f2e',border:'1px solid #2d3748',borderRadius:6,fontSize:12}} />
              <Legend iconSize={10} wrapperStyle={{fontSize:11}} />
              <Bar dataKey="saved" name="Saved" stackId="a" fill="#68d391" radius={[0,0,0,0]} />
              <Bar dataKey="remaining" name="Remaining" stackId="a" fill="#2d3748" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MODELS TAB
// =============================================================================
function ModelsTab({ state }) {
  const { profile, assets, liabilities, cash, livePrices } = state;
  const [mcParams, setMcParams] = useState({
    retirementAge: 65,
    monthlyContribution: 2000,
    withdrawalRate: 4,
    extraReturn: 0,
  });
  const [mcResult, setMcResult] = useState(null);
  const [running, setRunning] = useState(false);

  const totalPortfolio = useMemo(() => assets.reduce((s,a) => {
    const p = livePrices[a.ticker]?.price || a.costBasis;
    return s + p * a.shares;
  }, 0) + cash.reduce((s,c)=>s+c.amount,0), [assets, livePrices, cash]);

  const runSim = () => {
    setRunning(true);
    // Run in next tick so UI updates
    setTimeout(() => {
      const result = runMonteCarlo({
        currentAge: profile.age,
        retirementAge: mcParams.retirementAge,
        currentSavings: totalPortfolio,
        monthlyContribution: mcParams.monthlyContribution,
        annualReturnMean: 0.07 + mcParams.extraReturn/100,
        annualReturnStd: 0.15,
        runs: 1000,
      });
      setMcResult(result);
      setRunning(false);
    }, 50);
  };

  // 4% SWR monthly income from each percentile
  const annualWR = mcParams.withdrawalRate / 100;

  // Scenario analysis: what happens at different return assumptions
  const scenarios = useMemo(() => [
    { label:'Bear (-2%)', mean:-0.02 },
    { label:'Conservative (4%)', mean:0.04 },
    { label:'Base (7%)', mean:0.07 },
    { label:'Bull (10%)', mean:0.10 },
    { label:'Optimistic (12%)', mean:0.12 },
  ].map(s => {
    const r = runMonteCarlo({
      currentAge:profile.age, retirementAge:mcParams.retirementAge,
      currentSavings:totalPortfolio, monthlyContribution:mcParams.monthlyContribution,
      annualReturnMean:s.mean, annualReturnStd:0.15, runs:500,
    });
    return { ...s, median:r.p50, income:r.p50*annualWR };
  }), [profile.age, mcParams, totalPortfolio, annualWR]);

  return (
    <div>
      <div className="grid g2 gap-6 mb-6">
        {/* Monte Carlo panel */}
        <div className="card">
          <div className="section-title">Monte Carlo Retirement Simulation</div>
          <div style={{fontSize:12,color:'#718096',marginBottom:16}}>
            1,000 random market scenarios · Current portfolio: <span className="bold">{fmtFull(totalPortfolio)}</span>
          </div>
          <div className="grid g2 gap-4 mb-4">
            <div className="form-group" style={{marginBottom:0}}>
              <label>Target Retirement Age</label>
              <input type="number" min={profile.age+1} max="85" value={mcParams.retirementAge}
                onChange={e=>setMcParams(p=>({...p,retirementAge:+e.target.value}))} />
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label>Monthly Contribution ($)</label>
              <input type="number" min="0" value={mcParams.monthlyContribution}
                onChange={e=>setMcParams(p=>({...p,monthlyContribution:+e.target.value}))} />
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label>Withdrawal Rate (% SWR)</label>
              <input type="number" min="1" max="10" step="0.5" value={mcParams.withdrawalRate}
                onChange={e=>setMcParams(p=>({...p,withdrawalRate:+e.target.value}))} />
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label>Extra Return Adj. (%)</label>
              <input type="number" min="-5" max="5" step="0.5" value={mcParams.extraReturn}
                onChange={e=>setMcParams(p=>({...p,extraReturn:+e.target.value}))} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={runSim} disabled={running}>
            {running ? 'Running 1,000 simulations…' : 'Run Simulation'}
          </button>

          {mcResult && (
            <div className="mt-4">
              <div className="grid g3 gap-3 mb-4">
                {[['P10 (Pessimistic)',mcResult.p10,'red'],['P50 (Median)',mcResult.p50,'blue'],['P90 (Optimistic)',mcResult.p90,'green']].map(([l,v,c])=>(
                  <div key={l} style={{background:'#0f1117',padding:12,borderRadius:8,border:'1px solid #2d3748'}}>
                    <div style={{fontSize:11,color:'#718096'}}>{l}</div>
                    <div style={{fontSize:18,fontWeight:700,color:c==='red'?'#fc8181':c==='green'?'#68d391':'#63b3ed'}}>{fmt(v)}</div>
                    <div style={{fontSize:11,color:'#718096'}}>{fmtFull(v*annualWR)}/yr income</div>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={mcResult.chartData} margin={{top:5,right:10,bottom:0,left:10}}>
                  <defs>
                    <linearGradient id="mcGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3182ce" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3182ce" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis dataKey="year" tick={{fill:'#718096',fontSize:10}} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v=>fmt(v)} tick={{fill:'#718096',fontSize:10}} axisLine={false} tickLine={false} />
                  <Tooltip formatter={v=>fmtFull(v)} contentStyle={{background:'#1a1f2e',border:'1px solid #2d3748',borderRadius:6,fontSize:11}} />
                  <Area type="monotone" dataKey="median" stroke="#3182ce" fill="url(#mcGrad)" strokeWidth={2} dot={false} name="Median Path" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Scenario analysis */}
        <div className="card">
          <div className="section-title">Scenario Analysis</div>
          <div style={{fontSize:12,color:'#718096',marginBottom:16}}>
            Median retirement balance at age {mcParams.retirementAge} under different market return assumptions
          </div>
          <table>
            <thead><tr><th>Scenario</th><th className="tr">Median Portfolio</th><th className="tr">Annual Income ({mcParams.withdrawalRate}% SWR)</th></tr></thead>
            <tbody>
              {scenarios.map(s => (
                <tr key={s.label}>
                  <td>{s.label}</td>
                  <td className="tr bold">{fmt(s.median)}</td>
                  <td className="tr">{fmt(s.income)}<span className="gray" style={{fontSize:11}}>/yr</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr className="divider" />
          <div className="section-title" style={{marginTop:8}}>Savings Rate Impact</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={[500,1000,1500,2000,3000,4000,5000].map(mc => {
              const r = runMonteCarlo({currentAge:profile.age,retirementAge:mcParams.retirementAge,currentSavings:totalPortfolio,monthlyContribution:mc,annualReturnMean:0.07,annualReturnStd:0.15,runs:200});
              return {mc:`$${mc/1000}K`,p50:r.p50};
            })} margin={{top:5,right:10,bottom:0,left:10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="mc" tick={{fill:'#718096',fontSize:10}} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v=>fmt(v)} tick={{fill:'#718096',fontSize:10}} axisLine={false} tickLine={false} />
              <Tooltip formatter={v=>fmtFull(v)} contentStyle={{background:'#1a1f2e',border:'1px solid #2d3748',borderRadius:6,fontSize:11}} />
              <Line type="monotone" dataKey="p50" stroke="#68d391" strokeWidth={2} dot={{fill:'#68d391',r:3}} name="Median at Retirement" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MARKET TAB
// =============================================================================
function MarketTab({ state }) {
  const { assets, apiKeys } = state;
  const [news, setNews] = useState({});   // { ticker: articles[] }
  const [macro, setMacro] = useState({}); // { seriesId: observations[] }
  const [loading, setLoading] = useState({ news:false, macro:false });
  const [errors, setErrors] = useState({});

  // FRED series to fetch
  const FRED_SERIES = [
    { id:'FEDFUNDS', label:'Fed Funds Rate', unit:'%' },
    { id:'CPIAUCSL', label:'CPI (Inflation)', unit:' index' },
    { id:'UNRATE',   label:'Unemployment Rate', unit:'%' },
    { id:'DGS10',    label:'10-Year Treasury', unit:'%' },
  ];

  const fetchNews = useCallback(async () => {
    if (!apiKeys.finnhub) return;
    setLoading(l => ({...l, news:true}));
    const results = {};
    const errs = {};
    const stockAssets = assets.filter(a => a.assetType !== 'crypto' && a.assetType !== 'other');
    for (const a of stockAssets.slice(0, 8)) { // cap at 8 tickers for rate limits
      try {
        results[a.ticker] = await fetchFinnhubNews(a.ticker, apiKeys.finnhub);
        await sleep(300);
      } catch(e) { errs[a.ticker] = e.message; }
    }
    setNews(results);
    setErrors(e => ({...e, ...errs}));
    setLoading(l => ({...l, news:false}));
  }, [assets, apiKeys.finnhub]);

  const fetchMacro = useCallback(async () => {
    if (!apiKeys.fred) return;
    setLoading(l => ({...l, macro:true}));
    const results = {};
    for (const s of FRED_SERIES) {
      try {
        const data = await fetchFRED(s.id, apiKeys.fred);
        results[s.id] = data.slice(0, 12).reverse(); // chronological order, last 12 pts
      } catch(e) {}
      await sleep(200);
    }
    setMacro(results);
    setLoading(l => ({...l, macro:false}));
  }, [apiKeys.fred]);

  return (
    <div>
      {/* Macro indicators */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="section-title" style={{marginBottom:0}}>Macro Indicators</div>
          <div className="flex gap-2 items-center">
            {loading.macro && <span className="spinner" />}
            {!apiKeys.fred && <span style={{fontSize:11,color:'#718096'}}>Add FRED API key to fetch live macro data</span>}
            <button className="btn btn-secondary btn-sm" onClick={fetchMacro} disabled={loading.macro||!apiKeys.fred}>
              {loading.macro?'Loading…':'Fetch Macro Data'}
            </button>
          </div>
        </div>
        <div className="grid g2 gap-4">
          {FRED_SERIES.map(s => {
            const obs = macro[s.id];
            const latest = obs?.[obs.length-1];
            const prev = obs?.[obs.length-2];
            const change = latest && prev ? latest.value - prev.value : null;
            return (
              <div key={s.id} style={{background:'#0f1117',borderRadius:8,padding:14,border:'1px solid #2d3748'}}>
                <div style={{fontSize:11,color:'#718096',marginBottom:4}}>{s.label}</div>
                <div style={{fontSize:20,fontWeight:700}}>
                  {latest ? `${latest.value.toFixed(2)}${s.unit}` : <span className="gray">—</span>}
                  {change !== null && <span style={{fontSize:13,marginLeft:8,color:change>=0?'#fc8181':'#68d391'}}>{change>=0?'+':''}{change.toFixed(2)}</span>}
                </div>
                {obs && obs.length > 1 && (
                  <ResponsiveContainer width="100%" height={50}>
                    <LineChart data={obs} margin={{top:4,right:4,bottom:0,left:4}}>
                      <Line type="monotone" dataKey="value" stroke="#3182ce" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* News feed */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="section-title" style={{marginBottom:0}}>News — Your Holdings</div>
          <div className="flex gap-2 items-center">
            {loading.news && <span className="spinner" />}
            {!apiKeys.finnhub && <span style={{fontSize:11,color:'#718096'}}>Add Finnhub API key for news</span>}
            <button className="btn btn-secondary btn-sm" onClick={fetchNews} disabled={loading.news||!apiKeys.finnhub||assets.length===0}>
              {loading.news?'Loading…':'Fetch News'}
            </button>
          </div>
        </div>

        {Object.keys(news).length === 0 && (
          <div className="gray tc" style={{padding:24,fontSize:13}}>
            {assets.length === 0 ? 'Add assets to see relevant news' : 'Click "Fetch News" to load articles for your holdings'}
          </div>
        )}

        {Object.entries(news).map(([ticker, articles]) => (
          <div key={ticker} className="mb-6">
            <div style={{fontSize:13,fontWeight:600,color:'#63b3ed',marginBottom:8}}>{ticker}</div>
            {articles.length === 0 && <div className="gray" style={{fontSize:12}}>No recent news</div>}
            {articles.map((a,i) => (
              <div key={i} style={{borderLeft:'2px solid #2d3748',paddingLeft:12,marginBottom:10}}>
                <div style={{fontSize:13,fontWeight:500,marginBottom:2}}>{a.headline}</div>
                <div style={{fontSize:11,color:'#718096'}}>
                  {a.source} · {new Date(a.datetime*1000).toLocaleDateString()}
                  {a.url && <> · <a href={a.url} target="_blank" rel="noopener" style={{color:'#63b3ed'}}>Read →</a></>}
                </div>
                {a.summary && <div style={{fontSize:12,color:'#a0aec0',marginTop:4,lineHeight:1.5}}>{a.summary.slice(0,200)}{a.summary.length>200?'…':''}</div>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// AI AGENTS TAB
// =============================================================================
// Build full financial context string for agent system prompts
function buildContext(state) {
  const { profile, assets, liabilities, cash, goals, livePrices } = state;
  const totalPortfolio = assets.reduce((s,a)=>s+(livePrices[a.ticker]?.price||a.costBasis)*a.shares,0);
  const totalCash = cash.reduce((s,c)=>s+c.amount,0);
  const totalDebt = liabilities.reduce((s,l)=>s+l.balance,0);
  const netWorth = totalPortfolio + totalCash - totalDebt;

  const assetLines = assets.map(a => {
    const price = livePrices[a.ticker]?.price || a.costBasis;
    const val = price * a.shares;
    const gain = val - a.costBasis * a.shares;
    const gainPct = a.costBasis > 0 ? (gain/(a.costBasis*a.shares)*100).toFixed(1) : 'N/A';
    return `  - ${a.ticker} (${a.assetType}): ${a.shares} shares @ $${price.toFixed(2)} = $${val.toFixed(0)} [${gainPct}% gain, ${a.accountType}]`;
  }).join('\n');

  const liabilityLines = liabilities.map(l =>
    `  - ${l.name} (${l.type}): $${l.balance.toFixed(0)} @ ${l.apr}% APR, min $${l.minPayment}/mo`
  ).join('\n');

  const cashLines = cash.map(c => `  - ${c.name}: $${c.amount.toFixed(0)} @ ${c.apy}% APY`).join('\n');

  const goalLines = goals.map(g => {
    const mo = monthsBetween(new Date(), g.targetDate);
    const rem = Math.max(0, g.targetAmount - g.currentSaved);
    return `  - ${g.name}: $${g.currentSaved.toFixed(0)}/$${g.targetAmount.toFixed(0)} saved (${mo} months to target), needs $${mo>0?(rem/mo).toFixed(0):rem}/mo`;
  }).join('\n');

  return `
USER FINANCIAL PROFILE:
Name: ${profile.name} | Age: ${profile.age} | Income: $${profile.annualIncome.toLocaleString()}/yr | Tax Rate: ${profile.marginalTaxRate}%
Risk Tolerance: ${profile.riskTolerance}/5 | Primary Goal: ${profile.primaryGoal}

NET WORTH: $${netWorth.toFixed(0)}
  Portfolio: $${totalPortfolio.toFixed(0)}
  Cash: $${totalCash.toFixed(0)}
  Total Debt: $${totalDebt.toFixed(0)}

INVESTMENT PORTFOLIO:
${assetLines || '  (none)'}

LIABILITIES:
${liabilityLines || '  (none)'}

CASH & SAVINGS:
${cashLines || '  (none)'}

FINANCIAL GOALS:
${goalLines || '  (none)'}
`.trim();
}

// Agent definitions
const AGENT_DEFS = [
  {
    id: 'portfolio',
    name: 'Portfolio Analyst',
    icon: '📊',
    color: '#3182ce',
    bg: '#1a3a5c',
    systemPrompt: ctx => `You are an expert portfolio analyst. Analyze the user's investment portfolio for diversification, concentration risk, allocation vs age-appropriate targets, and specific actionable recommendations.\n\n${ctx}`,
    prompt: 'Analyze my portfolio: diversification, concentration risk, allocation quality vs my age and risk tolerance. Give me 3 specific action items.',
  },
  {
    id: 'debt',
    name: 'Debt Strategist',
    icon: '💳',
    color: '#fc8181',
    bg: '#4a1c1c',
    systemPrompt: ctx => `You are a debt elimination expert. Analyze the user's debt situation and provide specific payoff strategies.\n\n${ctx}`,
    prompt: 'Analyze my debt: recommend avalanche vs snowball, flag any refinancing opportunities, and calculate how paying an extra $200/month would change my payoff timeline.',
  },
  {
    id: 'tax',
    name: 'Tax Efficiency',
    icon: '🏛️',
    color: '#68d391',
    bg: '#1c4532',
    systemPrompt: ctx => `You are a tax efficiency expert for personal finance. Analyze the user's holdings and accounts for tax optimization opportunities.\n\n${ctx}`,
    prompt: 'Analyze my tax situation: any tax-loss harvesting opportunities, asset location improvements (which assets in which accounts), Roth conversion candidates, and estimated annual tax drag.',
  },
  {
    id: 'retirement',
    name: 'Retirement Modeler',
    icon: '🎯',
    color: '#b794f4',
    bg: '#322a5c',
    systemPrompt: ctx => `You are a retirement planning expert. Use the 4% rule and Monte Carlo thinking to assess the user's retirement readiness.\n\n${ctx}`,
    prompt: 'Model my retirement: am I on track? What does my FIRE number look like? If I retire at 65, what monthly income can I expect at median market returns? What\'s my biggest gap?',
  },
  {
    id: 'risk',
    name: 'Risk Analyst',
    icon: '⚠️',
    color: '#f6ad55',
    bg: '#4a3b1c',
    systemPrompt: ctx => `You are a risk analyst specializing in personal portfolio risk assessment.\n\n${ctx}`,
    prompt: 'Analyze my portfolio risk: concentration risk by position and sector, what happens to my net worth in a 30% market drawdown, and how does my risk profile match my stated risk tolerance?',
  },
  {
    id: 'macro',
    name: 'Market & Macro',
    icon: '🌍',
    color: '#4fd1c5',
    bg: '#1a3d3a',
    systemPrompt: ctx => `You are a macroeconomic analyst. Analyze current macro conditions and their specific impact on this user's portfolio.\n\n${ctx}`,
    prompt: 'Given current macro conditions (rates, inflation, market cycle), what is the specific impact on my portfolio? Which of my holdings are most exposed? What tactical adjustments should I consider?',
  },
];

const SYNTHESIS_DEF = {
  id: 'synthesis',
  name: 'CIO Synthesis',
  icon: '🎖️',
  color: '#63b3ed',
  bg: '#1a3a5c',
};

function AgentsTab({ state }) {
  const { apiKeys } = state;
  const [agentResults, setAgentResults] = useState({});
  const [agentStatus, setAgentStatus] = useState({}); // 'idle'|'running'|'done'|'error'
  // Ref mirrors agentResults so runAll can read latest values without stale closure
  const agentResultsRef = useRef({});
  const [expanded, setExpanded] = useState({});
  const [runningAll, setRunningAll] = useState(false);

  // Chat state
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatRef = useRef(null);

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatHistory]);

  const ctx = useMemo(() => buildContext(state), [state]);

  /** Run a single agent with up to 3 retries, exponential backoff */
  const runAgent = useCallback(async (def) => {
    if (!apiKeys.anthropic) return;
    setAgentStatus(s => ({...s, [def.id]:'running'}));
    setExpanded(e => ({...e, [def.id]:true}));

    let attempt = 0, result = null;
    while (attempt < 3 && result === null) {
      if (attempt > 0) await sleep(attempt * 5000); // backoff: 5s, 10s
      try {
        result = await callAPI(
          [{ role:'user', content: def.prompt }],
          def.systemPrompt(ctx),
          apiKeys.anthropic,
          1400
        );
      } catch (e) {
        attempt++;
        if (attempt >= 3) {
          setAgentStatus(s => ({...s, [def.id]:'error'}));
          setAgentResults(r => ({...r, [def.id]:`Error: ${e.message}`}));
          return;
        }
      }
    }

    agentResultsRef.current = {...agentResultsRef.current, [def.id]: result};
    setAgentResults(r => ({...r, [def.id]: result}));
    setAgentStatus(s => ({...s, [def.id]:'done'}));
  }, [apiKeys.anthropic, ctx]);

  /** Run all 6 agents sequentially, then synthesis */
  const runAll = useCallback(async () => {
    if (!apiKeys.anthropic || runningAll) return;
    setRunningAll(true);
    agentResultsRef.current = {}; // clear ref before new run
    setAgentResults({});
    setAgentStatus({});

    for (let i = 0; i < AGENT_DEFS.length; i++) {
      await runAgent(AGENT_DEFS[i]);
      if (i < AGENT_DEFS.length - 1) await sleep(1500); // pause between agents
    }

    // Use ref (not state) to read latest results — avoids stale closure
    const agentSummaries = AGENT_DEFS.map(d =>
      `## ${d.name}\n${agentResultsRef.current[d.id] || '(not run)'}`
    ).join('\n\n');

    setAgentStatus(s => ({...s, synthesis:'running'}));
    setExpanded(e => ({...e, synthesis:true}));

    let attempt = 0, synthResult = null;
    while (attempt < 3 && synthResult === null) {
      if (attempt > 0) await sleep(attempt * 5000);
      try {
        synthResult = await callAPI(
          [{ role:'user', content: `Based on all specialist analyses below, provide a comprehensive financial health scorecard (A-F grades for each area) and exactly 3 specific, high-priority actions to take THIS MONTH.\n\n${agentSummaries}` }],
          `You are a Chief Investment Officer synthesizing specialist reports for ${state.profile.name}. Be direct, specific, and actionable. ${ctx}`,
          apiKeys.anthropic, 1600
        );
      } catch(e) {
        attempt++;
        if (attempt >= 3) {
          setAgentStatus(s => ({...s, synthesis:'error'}));
          setAgentResults(r => ({...r, synthesis:`Error: ${e.message}`}));
          setRunningAll(false);
          return;
        }
      }
    }

    setAgentResults(r => ({...r, synthesis:synthResult}));
    setAgentStatus(s => ({...s, synthesis:'done'}));
    setRunningAll(false);
  }, [apiKeys.anthropic, runningAll, runAgent, state.profile.name, ctx]);

  // Re-run synthesis after all agents complete
  // Note: using state ref here to capture latest results
  const runSynthesisOnly = useCallback(async () => {
    if (!apiKeys.anthropic) return;
    const agentSummaries = AGENT_DEFS.map(d =>
      `## ${d.name}\n${agentResults[d.id] || '(not run)'}`
    ).join('\n\n');
    setAgentStatus(s => ({...s, synthesis:'running'}));
    setExpanded(e => ({...e, synthesis:true}));
    try {
      const r = await callAPI(
        [{ role:'user', content:`Synthesize these specialist reports into a financial health scorecard and 3 immediate action items.\n\n${agentSummaries}`}],
        `You are a Chief Investment Officer. ${ctx}`,
        apiKeys.anthropic, 1600
      );
      setAgentResults(res => ({...res, synthesis:r}));
      setAgentStatus(s => ({...s, synthesis:'done'}));
    } catch(e) {
      setAgentStatus(s => ({...s, synthesis:'error'}));
    }
  }, [apiKeys.anthropic, agentResults, ctx]);

  /** Personal advisor chat */
  const sendChat = useCallback(async (msg) => {
    if (!msg.trim() || !apiKeys.anthropic || chatLoading) return;
    const userMsg = { role:'user', content:msg };
    const history = [...chatHistory, userMsg];
    setChatHistory(history);
    setChatInput('');
    setChatLoading(true);

    try {
      const systemPrompt = `You are FinPal, a personal financial advisor. You have full access to the user's financial data. Be specific, data-driven, and actionable. Always reference their actual numbers.\n\n${ctx}`;
      const reply = await callAPI(history, systemPrompt, apiKeys.anthropic, 1000);
      setChatHistory(h => [...h, { role:'assistant', content:reply }]);
    } catch(e) {
      setChatHistory(h => [...h, { role:'assistant', content:`Error: ${e.message}` }]);
    }
    setChatLoading(false);
  }, [apiKeys.anthropic, chatHistory, chatLoading, ctx]);

  const CHIPS = [
    'Am I on track for retirement?',
    'Which debt should I pay first?',
    'What should I invest $500/month in?',
    'How can I reduce my taxes?',
    'What is my biggest financial risk?',
  ];

  const statusBadge = id => {
    const s = agentStatus[id];
    if (s === 'running') return <span className="agent-running" style={{fontSize:12,color:'#63b3ed'}}>● Running…</span>;
    if (s === 'done')    return <span className="badge b-green">✓ Done</span>;
    if (s === 'error')   return <span className="badge b-red">✗ Error</span>;
    return <span className="badge" style={{background:'#2d3748',color:'#718096'}}>Idle</span>;
  };

  if (!apiKeys.anthropic) {
    return (
      <div className="card tc" style={{padding:40}}>
        <div style={{fontSize:32,marginBottom:12}}>🤖</div>
        <div className="bold" style={{fontSize:16,marginBottom:8}}>Anthropic API Key Required</div>
        <div className="gray" style={{fontSize:13}}>Add your Anthropic API key in Settings to use AI Agents and the personal advisor chat.</div>
      </div>
    );
  }

  return (
    <div>
      {/* Control bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="bold" style={{fontSize:15}}>AI Financial Advisory Team</div>
          <div style={{fontSize:12,color:'#718096'}}>6 specialist agents analyze your complete financial picture</div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={runSynthesisOnly} disabled={runningAll}>
            Synthesize Only
          </button>
          <button className="btn btn-primary" onClick={runAll} disabled={runningAll}>
            {runningAll ? <span className="flex items-center gap-2"><span className="spinner" />Running all agents…</span> : '▶ Run All Agents'}
          </button>
        </div>
      </div>

      {/* Agent cards */}
      {AGENT_DEFS.map(def => (
        <div key={def.id} className="agent-card">
          <div className="agent-hdr" onClick={()=>setExpanded(e=>({...e,[def.id]:!e[def.id]}))}>
            <div className="agent-icon" style={{background:def.bg}}>
              <span>{def.icon}</span>
            </div>
            <div className="flex-1">
              <div className="bold" style={{fontSize:13}}>{def.name}</div>
              <div style={{fontSize:11,color:'#718096'}}>{def.prompt.slice(0,80)}…</div>
            </div>
            {statusBadge(def.id)}
            <button className="btn btn-secondary btn-sm" style={{marginLeft:8}}
              onClick={e=>{e.stopPropagation();runAgent(def);}}
              disabled={runningAll || agentStatus[def.id]==='running'}>
              {agentStatus[def.id]==='running'?'…':'Run'}
            </button>
            <span style={{color:'#718096',marginLeft:8,fontSize:12}}>{expanded[def.id]?'▲':'▼'}</span>
          </div>
          {expanded[def.id] && agentResults[def.id] && (
            <div className="agent-body">
              <RenderedText text={agentResults[def.id]} />
            </div>
          )}
        </div>
      ))}

      {/* CIO Synthesis */}
      <div className="agent-card" style={{border:'1px solid #3182ce'}}>
        <div className="agent-hdr" onClick={()=>setExpanded(e=>({...e,synthesis:!e.synthesis}))}>
          <div className="agent-icon" style={{background:'#1a3a5c'}}>🎖️</div>
          <div className="flex-1">
            <div className="bold" style={{fontSize:13,color:'#63b3ed'}}>CIO Synthesis — Financial Health Report</div>
            <div style={{fontSize:11,color:'#718096'}}>Scorecard + 3 action items based on all specialist analyses</div>
          </div>
          {statusBadge('synthesis')}
          <span style={{color:'#718096',marginLeft:8,fontSize:12}}>{expanded.synthesis?'▲':'▼'}</span>
        </div>
        {expanded.synthesis && agentResults.synthesis && (
          <div className="agent-body">
            <RenderedText text={agentResults.synthesis} />
          </div>
        )}
      </div>

      {/* Personal Advisor Chat */}
      <div className="mt-4">
        <div className="section-title">Personal Advisor Chat</div>
        <div className="chat-wrap">
          <div className="chat-msgs" ref={chatRef}>
            {chatHistory.length === 0 && (
              <div className="gray tc" style={{fontSize:12,marginTop:20}}>Ask your personal advisor anything about your finances</div>
            )}
            {chatHistory.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role==='user'?'user':'ai'}`}>
                {m.role === 'assistant' ? <RenderedText text={m.content} /> : m.content}
              </div>
            ))}
            {chatLoading && <div className="chat-msg ai gray" style={{fontSize:12}}>Thinking…</div>}
          </div>
          {/* Quick chips */}
          <div style={{padding:'6px 10px',borderTop:'1px solid #2d3748',display:'flex',flexWrap:'wrap',gap:4}}>
            {CHIPS.map(chip => (
              <span key={chip} className="chip" onClick={()=>sendChat(chip)}>{chip}</span>
            ))}
          </div>
          <div className="chat-input">
            <input
              value={chatInput}
              onChange={e=>setChatInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&sendChat(chatInput)}
              placeholder="Ask about your finances… (Enter to send)"
              disabled={chatLoading}
            />
            <button className="btn btn-primary btn-sm" onClick={()=>sendChat(chatInput)} disabled={chatLoading||!chatInput.trim()}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN APP
// =============================================================================
// Settings modal to re-enter API keys or reset
function SettingsModal({ state, dispatch, onClose }) {
  const [keys, setKeys] = useState({...state.apiKeys});
  const save = () => {
    dispatch({ type:'SETUP_COMPLETE', payload:{ ...state, apiKeys:keys, setupComplete:true } });
    onClose();
  };
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="card" style={{width:480,maxWidth:'95vw'}}>
        <div className="flex items-center justify-between mb-4">
          <div className="section-title" style={{marginBottom:0}}>Settings</div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        {[['anthropic','Anthropic API Key'],['alphaVantage','Alpha Vantage Key'],['finnhub','Finnhub Key'],['fred','FRED Key']].map(([k,label])=>(
          <div key={k} className="form-group">
            <label>{label}</label>
            <input type="password" value={keys[k]} onChange={e=>setKeys(ks=>({...ks,[k]:e.target.value}))} autoComplete="off" />
          </div>
        ))}
        <div className="flex justify-between mt-4">
          <button className="btn btn-danger" onClick={()=>{ if(confirm('Reset all data? This cannot be undone.')) { dispatch({type:'RESET'}); onClose(); } }}>
            Reset All Data
          </button>
          <button className="btn btn-primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  // Initialize from localStorage or blank state
  const [state, dispatch] = useReducer(reducer, null, () => loadState() || BLANK);
  const [showSettings, setShowSettings] = useState(false);

  // If setup not complete, show wizard
  if (!state.setupComplete) {
    return (
      <SetupWizard onComplete={payload => dispatch({ type:'SETUP_COMPLETE', payload })} />
    );
  }

  // Compute header stats
  const totalPortfolio = state.assets.reduce((s,a) => {
    const p = state.livePrices[a.ticker]?.price || a.costBasis;
    return s + p * a.shares;
  }, 0);
  const totalCash = state.cash.reduce((s,c)=>s+c.amount,0);
  const totalDebt = state.liabilities.reduce((s,l)=>s+l.balance,0);
  const netWorth = totalPortfolio + totalCash - totalDebt;

  const tabContent = () => {
    switch (state.activeTab) {
      case 'Net Worth':   return <NetWorthTab state={state} />;
      case 'Portfolio':   return <PortfolioTab state={state} dispatch={dispatch} />;
      case 'Debt':        return <DebtTab state={state} dispatch={dispatch} />;
      case 'Goals':       return <GoalsTab state={state} dispatch={dispatch} />;
      case 'Models':      return <ModelsTab state={state} />;
      case 'Market':      return <MarketTab state={state} />;
      case 'AI Agents':   return <AgentsTab state={state} />;
      default:            return null;
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div style={{fontSize:20,marginRight:4}}>💰</div>
        <h1>FinPal</h1>
        {state.profile.name && <span style={{fontSize:13,color:'#718096'}}>— {state.profile.name}</span>}
        <div className="header-stats">
          <div className="header-stat">
            <div className="lbl">Net Worth</div>
            <div className="val" style={{color:netWorth>=0?'#68d391':'#fc8181'}}>{fmt(netWorth)}</div>
          </div>
          <div className="header-stat">
            <div className="lbl">Portfolio</div>
            <div className="val">{fmt(totalPortfolio)}</div>
          </div>
          <div className="header-stat">
            <div className="lbl">Debt</div>
            <div className="val red">{fmt(totalDebt)}</div>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" style={{marginLeft:8}} onClick={()=>setShowSettings(true)}>⚙ Settings</button>
      </div>

      {/* Tab navigation */}
      <div className="tabs">
        {TABS.map(t => (
          <div key={t} className={`tab ${state.activeTab===t?'active':''}`} onClick={()=>dispatch({type:'SET_TAB',tab:t})}>
            {t}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="content">
        {tabContent()}
      </div>

      {/* Settings modal */}
      {showSettings && <SettingsModal state={state} dispatch={dispatch} onClose={()=>setShowSettings(false)} />}
    </div>
  );
}

try {
  const rootEl = document.getElementById('root');
  ReactDOM.createRoot(rootEl).render(<App />);
} catch(e) {
  console.error('FinPal render error:', e);
  document.getElementById('root').innerHTML =
    '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#fc8181;background:#0f1117;flex-direction:column;gap:16px">' +
    '<div style="font-size:20px">⚠ App failed to start</div>' +
    '<div style="color:#a0aec0;font-size:13px">Error: ' + e.message + '</div>' +
    '<div style="color:#718096;font-size:11px">Open the browser console (F12) for full details.</div>' +
    '</div>';
}
</script>
</body>
</html>
