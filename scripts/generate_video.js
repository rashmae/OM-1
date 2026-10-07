import sharp from 'sharp';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/tmp/keynote_frames';
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// 36 Months Data points
const DATA = [
  { p: 1,  date: '2022-01', v: 411621.25 },
  { p: 2,  date: '2022-02', v: 423650.00 },
  { p: 3,  date: '2022-03', v: 442500.00 },
  { p: 4,  date: '2022-04', v: 435200.00 },
  { p: 5,  date: '2022-05', v: 448100.00 },
  { p: 6,  date: '2022-06', v: 438900.00 },
  { p: 7,  date: '2022-07', v: 421000.00 },
  { p: 8,  date: '2022-08', v: 412500.00 },
  { p: 9,  date: '2022-09', v: 405300.00 },
  { p: 10, date: '2022-10', v: 395100.00 },
  { p: 11, date: '2022-11', v: 378400.00 },
  { p: 12, date: '2022-12', v: 362100.00 },
  { p: 13, date: '2023-01', v: 347200.00 },
  { p: 14, date: '2023-02', v: 236263.50 }, // Shock Anomaly
  { p: 15, date: '2023-03', v: 312400.00 },
  { p: 16, date: '2023-04', v: 335600.00 },
  { p: 17, date: '2023-05', v: 358900.00 },
  { p: 18, date: '2023-06', v: 371200.00 },
  { p: 19, date: '2023-07', v: 382400.00 },
  { p: 20, date: '2023-08', v: 391500.00 },
  { p: 21, date: '2023-09', v: 401200.00 },
  { p: 22, date: '2023-10', v: 415300.00 },
  { p: 23, date: '2023-11', v: 422100.00 },
  { p: 24, date: '2023-12', v: 430500.00 },
  { p: 25, date: '2024-01', v: 438200.00 },
  { p: 26, date: '2024-02', v: 425100.00 },
  { p: 27, date: '2024-03', v: 418300.00 },
  { p: 28, date: '2024-04', v: 429700.00 },
  { p: 29, date: '2024-05', v: 436400.00 },
  { p: 30, date: '2024-06', v: 441200.00 },
  { p: 31, date: '2024-07', v: 445800.00 }, // Validation holdouts
  { p: 32, date: '2024-08', v: 452100.00 },
  { p: 33, date: '2024-09', v: 448700.00 },
  { p: 34, date: '2024-10', v: 455200.00 },
  { p: 35, date: '2024-11', v: 458900.00 },
  { p: 36, date: '2024-12', v: 460304.25 }
];

const W = 1920;
const H = 1080;

// Coordinate helpers for chart
const chartX = (idx) => 120 + (idx / 35) * (W - 240);
const chartY = (val) => 820 - ((val - 200000) / 280000) * 440;

const pathActual = DATA.map((d, i) => `${i === 0 ? 'M' : 'L'} ${chartX(i).toFixed(1)} ${chartY(d.v).toFixed(1)}`).join(' ');

// SVG generator functions for each slide
function getSlide1SVG(subProgress) {
  const visibleCount = Math.max(3, Math.min(36, Math.floor(subProgress * 36)));
  const visibleData = DATA.slice(0, visibleCount);
  const visiblePath = visibleData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${chartX(i).toFixed(1)} ${chartY(d.v).toFixed(1)}`).join(' ');
  const feb = DATA[13];
  const febX = chartX(13);
  const febY = chartY(feb.v);

  return `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="#0B2545"/>
        <stop offset="100%" stop-color="#060B14"/>
      </radialGradient>
      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#1B6CA8"/>
        <stop offset="100%" stop-color="#38BDF8"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>

    <!-- Header bar -->
    <rect x="80" y="50" width="360" height="38" rx="8" fill="#1B6CA8" fill-opacity="0.3" stroke="#1B6CA8"/>
    <text x="96" y="74" fill="#F2A541" font-size="14" font-weight="bold" font-family="system-ui, sans-serif">EJ · Elaiza Jane Aligato</text>
    <text x="${W - 80}" y="74" fill="#94A3B8" font-size="14" font-family="monospace" text-anchor="end">SLIDE 1 OF 7 · OPERATIONAL PROBLEM &amp; REAL DATASET</text>

    <!-- Main Title -->
    <text x="80" y="150" fill="#38BDF8" font-size="16" font-weight="bold" letter-spacing="2" font-family="system-ui, sans-serif">ACT I: MARITIME TRADE &amp; THE FEBRUARY 2023 SHOCK</text>
    <text x="80" y="215" fill="#FFFFFF" font-size="52" font-weight="300" font-family="system-ui, sans-serif">36 Months. One Question.</text>
    <text x="80" y="255" fill="#94A3B8" font-size="18" font-family="system-ui, sans-serif">Port of Los Angeles Monthly Export Volume (TEUs) · Jan 2022 to Dec 2024</text>

    <!-- Callout r = 0.06 -->
    <rect x="${W - 420}" y="140" width="340" height="120" rx="12" fill="#0B2545" fill-opacity="0.8" stroke="#1B6CA8" stroke-width="1.5"/>
    <text x="${W - 390}" y="195" fill="#F2A541" font-size="44" font-weight="bold" font-family="monospace">r = 0.06</text>
    <text x="${W - 390}" y="235" fill="#E2E8F0" font-size="14" font-weight="600" font-family="system-ui, sans-serif">Zero Linear Trend (Cyclical Dynamics)</text>

    <!-- Chart Box -->
    <rect x="80" y="300" width="${W - 160}" height="640" rx="16" fill="#060B14" fill-opacity="0.7" stroke="#1E293B"/>

    <!-- Grid lines -->
    <line x1="120" y1="380" x2="${W - 120}" y2="380" stroke="#1E293B" stroke-dasharray="4 4"/>
    <text x="100" y="385" fill="#64748B" font-size="12" font-family="monospace" text-anchor="end">460k</text>
    <line x1="120" y1="600" x2="${W - 120}" y2="600" stroke="#1E293B" stroke-dasharray="4 4"/>
    <text x="100" y="605" fill="#64748B" font-size="12" font-family="monospace" text-anchor="end">350k</text>
    <line x1="120" y1="820" x2="${W - 120}" y2="820" stroke="#1E293B" stroke-dasharray="4 4"/>
    <text x="100" y="825" fill="#64748B" font-size="12" font-family="monospace" text-anchor="end">236k</text>

    <!-- Actual Data Line -->
    <path d="${visiblePath}" fill="none" stroke="url(#lineGrad)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>

    ${visibleCount >= 14 ? `
    <!-- Feb 2023 Shock Pulse -->
    <circle cx="${febX}" cy="${febY}" r="22" fill="#F2A541" fill-opacity="0.2"/>
    <circle cx="${febX}" cy="${febY}" r="8" fill="#F2A541"/>
    <rect x="${febX - 90}" y="${febY - 75}" width="180" height="50" rx="8" fill="#0B2545" stroke="#F2A541" stroke-width="1.5"/>
    <text x="${febX}" y="${febY - 54}" fill="#F2A541" font-size="13" font-weight="bold" font-family="monospace" text-anchor="middle">FEB 2023: 236,264</text>
    <text x="${febX}" y="${febY - 36}" fill="#CBD5E1" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle">-32% Structural Shock</text>
    ` : ''}

    <!-- Validation Zone Shading -->
    <rect x="${chartX(30)}" y="320" width="${chartX(35) - chartX(30) + 40}" height="580" fill="#38BDF8" fill-opacity="0.08"/>
    <text x="${chartX(30) + 15}" y="350" fill="#38BDF8" font-size="12" font-weight="bold" font-family="monospace">HOLDOUT M31-M36</text>

    <!-- Footer -->
    <text x="80" y="1020" fill="#64748B" font-size="13" font-family="monospace">IE-PC 3112: Operations Management 1 · Group 7 · Port of Los Angeles Export Decision Challenge</text>
    <text x="${W - 80}" y="1020" fill="#F2A541" font-size="13" font-family="monospace" text-anchor="end">Cebu Technological University · BSIE 3-E</text>
  </svg>
  `;
}

function getSlide2SVG() {
  const cards = [
    { name: '3-Period SMA', formula: 'Average(t-1, t-2, t-3)', mae: '33,428', mape: '9.71%', tag: 'Simple Baseline', isWin: false, x: 80 },
    { name: '3-Period WMA', formula: 'Weights: 0.50, 0.30, 0.20', mae: '32,142', mape: '9.50%', tag: 'Weighted Buffer', isWin: false, x: 520 },
    { name: 'Exp. Smoothing', formula: 'Alpha = 0.50', mae: '30,596', mape: '8.80%', tag: 'Lowest Dev Error ★', isWin: true, x: 960 },
    { name: 'Trend Projection', formula: 'y = 411,621 - 2,216*t', mae: '41,175', mape: '11.76%', tag: 'Eliminated (r=0.06)', isWin: false, x: 1400 },
  ];

  return `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="#0B2545"/>
        <stop offset="100%" stop-color="#060B14"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>

    <rect x="80" y="50" width="360" height="38" rx="8" fill="#1B6CA8" fill-opacity="0.3" stroke="#1B6CA8"/>
    <text x="96" y="74" fill="#F2A541" font-size="14" font-weight="bold" font-family="system-ui, sans-serif">EJ · Elaiza Jane Aligato</text>
    <text x="${W - 80}" y="74" fill="#94A3B8" font-size="14" font-family="monospace" text-anchor="end">SLIDE 2 OF 7 · CONVENTIONAL FORECASTING RESULTS</text>

    <text x="80" y="150" fill="#38BDF8" font-size="16" font-weight="bold" letter-spacing="2" font-family="system-ui, sans-serif">ACT I: CONVENTIONAL FORECASTING RESULTS</text>
    <text x="80" y="215" fill="#FFFFFF" font-size="52" font-weight="300" font-family="system-ui, sans-serif">Four Conventional Contenders</text>
    <text x="80" y="255" fill="#94A3B8" font-size="18" font-family="system-ui, sans-serif">Evaluated on 30 Development Months (Jan 2022 to Jun 2024)</text>

    ${cards.map(c => `
      <g transform="translate(${c.x}, 310)">
        <rect width="400" height="600" rx="16" fill="#0B2545" fill-opacity="0.8" stroke="${c.isWin ? '#F2A541' : '#1B6CA8'}" stroke-width="${c.isWin ? '3' : '1.5'}"/>
        
        <rect x="24" y="24" width="180" height="28" rx="6" fill="${c.isWin ? 'rgba(242,165,65,0.2)' : 'rgba(56,189,248,0.15)'}"/>
        <text x="34" y="43" fill="${c.isWin ? '#F2A541' : '#38BDF8'}" font-size="12" font-weight="bold" font-family="monospace">${c.tag}</text>

        <text x="24" y="110" fill="#FFFFFF" font-size="28" font-weight="bold" font-family="system-ui, sans-serif">${c.name}</text>
        <text x="24" y="145" fill="#94A3B8" font-size="14" font-family="monospace">${c.formula}</text>

        <line x1="24" y1="180" x2="376" y2="180" stroke="#1E293B"/>

        <text x="24" y="240" fill="#94A3B8" font-size="13" font-family="system-ui, sans-serif">DEVELOPMENT MAE</text>
        <text x="24" y="295" fill="${c.isWin ? '#F2A541' : '#FFFFFF'}" font-size="44" font-weight="bold" font-family="monospace">${c.mae}</text>
        <text x="24" y="325" fill="#CBD5E1" font-size="14" font-family="system-ui, sans-serif">TEUs error per month</text>

        <text x="24" y="390" fill="#94A3B8" font-size="13" font-family="system-ui, sans-serif">DEVELOPMENT MAPE</text>
        <text x="24" y="445" fill="${c.isWin ? '#F2A541' : '#38BDF8'}" font-size="40" font-weight="bold" font-family="monospace">${c.mape}</text>

        <rect x="24" y="490" width="352" height="75" rx="8" fill="#060B14" fill-opacity="0.8"/>
        <text x="40" y="525" fill="#CBD5E1" font-size="13" font-family="system-ui, sans-serif">
          ${c.isWin ? 'Achieved superior accuracy across' : c.name === 'Trend Projection' ? 'Structural mismatch: zero slope' : 'Lagged response behind sudden volume'}
        </text>
        <text x="40" y="545" fill="#CBD5E1" font-size="13" font-family="system-ui, sans-serif">
          ${c.isWin ? 'all 30 historical training months.' : c.name === 'Trend Projection' ? 'makes linear fit unusable.' : 'rebounds and cyclical surges.'}
        </text>
      </g>
    `).join('')}

    <text x="80" y="1020" fill="#64748B" font-size="13" font-family="monospace">IE-PC 3112: Operations Management 1 · Group 7 · Port of Los Angeles Export Decision Challenge</text>
    <text x="${W - 80}" y="1020" fill="#F2A541" font-size="13" font-family="monospace" text-anchor="end">Cebu Technological University · BSIE 3-E</text>
  </svg>
  `;
}

function getSlide3SVG() {
  return `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="#0B2545"/>
        <stop offset="100%" stop-color="#060B14"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>

    <rect x="80" y="50" width="400" height="38" rx="8" fill="#1B6CA8" fill-opacity="0.3" stroke="#1B6CA8"/>
    <text x="96" y="74" fill="#F2A541" font-size="14" font-weight="bold" font-family="system-ui, sans-serif">RC · Rash Mae Crystelle C. Ansay (Leader)</text>
    <text x="${W - 80}" y="74" fill="#94A3B8" font-size="14" font-family="monospace" text-anchor="end">SLIDE 3 OF 7 · CONVENTIONAL OM BASELINE SELECTION</text>

    <text x="80" y="150" fill="#38BDF8" font-size="16" font-weight="bold" letter-spacing="2" font-family="system-ui, sans-serif">ACT II: CONVENTIONAL OM BASELINE SELECTION</text>
    <text x="80" y="215" fill="#FFFFFF" font-size="52" font-weight="300" font-family="system-ui, sans-serif">The Conventional Call</text>

    <!-- Amber Hero Banner -->
    <rect x="80" y="280" width="${W - 160}" height="180" rx="16" fill="#0B2545" stroke="#F2A541" stroke-width="3"/>
    <text x="120" y="325" fill="#F2A541" font-size="14" font-weight="bold" letter-spacing="2" font-family="monospace">OFFICIALLY LOCKED BASELINE BEFORE VALIDATION</text>
    <text x="120" y="390" fill="#FFFFFF" font-size="48" font-weight="bold" font-family="system-ui, sans-serif">Exponential Smoothing (α = 0.50)</text>
    <text x="120" y="430" fill="#94A3B8" font-size="16" font-family="system-ui, sans-serif">Locked into the official manual decision record prior to opening holdout validation data.</text>

    <!-- 3 Justification Columns -->
    <g transform="translate(80, 500)">
      <rect width="560" height="440" rx="16" fill="#060B14" stroke="#1B6CA8" stroke-width="1.5"/>
      <text x="40" y="60" fill="#F2A541" font-size="36" font-weight="bold" font-family="monospace">30,596 MAE</text>
      <text x="40" y="110" fill="#FFFFFF" font-size="22" font-weight="bold" font-family="system-ui, sans-serif">Lowest Historical Error</text>
      <text x="40" y="150" fill="#CBD5E1" font-size="16" font-family="system-ui, sans-serif" line-height="1.5">
        Achieved lowest MAE (30,596 TEUs) and lowest MAPE (8.80%) across all 30 development periods, decisively beating SMA (33,428) and WMA (32,142).
      </text>
    </g>

    <g transform="translate(680, 500)">
      <rect width="560" height="440" rx="16" fill="#060B14" stroke="#1B6CA8" stroke-width="1.5"/>
      <text x="40" y="60" fill="#38BDF8" font-size="36" font-weight="bold" font-family="monospace">α = 0.50</text>
      <text x="40" y="110" fill="#FFFFFF" font-size="22" font-weight="bold" font-family="system-ui, sans-serif">Shock Responsiveness</text>
      <text x="40" y="150" fill="#CBD5E1" font-size="16" font-family="system-ui, sans-serif">
        Balanced smoothing parameter: provides fast recovery from structural volume crashes (such as Feb 2023) while preventing noise over-amplification.
      </text>
    </g>

    <g transform="translate(1280, 500)">
      <rect width="560" height="440" rx="16" fill="#060B14" stroke="#1B6CA8" stroke-width="1.5"/>
      <text x="40" y="60" fill="#F43F5E" font-size="36" font-weight="bold" font-family="monospace">r = 0.06</text>
      <text x="40" y="110" fill="#FFFFFF" font-size="22" font-weight="bold" font-family="system-ui, sans-serif">Elimination of Trend</text>
      <text x="40" y="150" fill="#CBD5E1" font-size="16" font-family="system-ui, sans-serif">
        With near-zero linear correlation, Trend Projection was eliminated as structurally flawed for port export capacity planning.
      </text>
    </g>

    <text x="80" y="1020" fill="#64748B" font-size="13" font-family="monospace">IE-PC 3112: Operations Management 1 · Group 7 · Port of Los Angeles Export Decision Challenge</text>
    <text x="${W - 80}" y="1020" fill="#F2A541" font-size="13" font-family="monospace" text-anchor="end">Cebu Technological University · BSIE 3-E</text>
  </svg>
  `;
}

function getSlide4SVG() {
  const ml = [
    {
      name: 'ARIMA (1,1,0)',
      cat: 'Statistical Time Series',
      stat: 'AIC: 701.43',
      desc: 'Selected as optimal order among 6 evaluated candidates. Utilizes 1st differencing for stationarity and 1 autoregressive lag to model volume momentum.',
      badge: 'Optimal Statistical Model ★',
      color: '#F2A541',
      x: 80
    },
    {
      name: 'Lagged Linear Reg.',
      cat: 'Econometric Autoregression',
      stat: '3 Lag Predictors',
      desc: 'Formulates export volume as a linear function of prior 3 consecutive months (t-1, t-2, t-3). Tested with rolling training windows.',
      badge: 'Feature-Engineered Regression',
      color: '#38BDF8',
      x: 680
    },
    {
      name: 'Random Forest',
      cat: 'Ensemble Machine Learning',
      stat: '100 Trees · Depth 3',
      desc: 'Non-linear tree ensemble trained with random_state=42. Engineered to capture complex lag interactions without linear assumptions.',
      badge: 'Non-Linear ML Ensemble',
      color: '#94A3B8',
      x: 1280
    }
  ];

  return `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="#0B2545"/>
        <stop offset="100%" stop-color="#060B14"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>

    <rect x="80" y="50" width="400" height="38" rx="8" fill="#1B6CA8" fill-opacity="0.3" stroke="#1B6CA8"/>
    <text x="96" y="74" fill="#F2A541" font-size="14" font-weight="bold" font-family="system-ui, sans-serif">RC · Rash Mae Crystelle C. Ansay (Leader)</text>
    <text x="${W - 80}" y="74" fill="#94A3B8" font-size="14" font-family="monospace" text-anchor="end">SLIDE 4 OF 7 · STATISTICAL &amp; ML RESULTS</text>

    <text x="80" y="150" fill="#38BDF8" font-size="16" font-weight="bold" letter-spacing="2" font-family="system-ui, sans-serif">ACT II: STATISTICAL &amp; MACHINE LEARNING RESULTS</text>
    <text x="80" y="215" fill="#FFFFFF" font-size="52" font-weight="300" font-family="system-ui, sans-serif">The Algorithmic Challengers</text>
    <text x="80" y="255" fill="#94A3B8" font-size="18" font-family="system-ui, sans-serif">Implemented in Python using Instructor Codes 1–15 on Same 30/6 Development/Validation Split</text>

    ${ml.map(m => `
      <g transform="translate(${m.x}, 310)">
        <rect width="560" height="600" rx="16" fill="#0B2545" fill-opacity="0.85" stroke="${m.color}" stroke-width="${m.color === '#F2A541' ? '3' : '1.5'}"/>
        
        <rect x="30" y="30" width="260" height="32" rx="6" fill="${m.color === '#F2A541' ? 'rgba(242,165,65,0.2)' : 'rgba(56,189,248,0.15)'}"/>
        <text x="42" y="52" fill="${m.color}" font-size="13" font-weight="bold" font-family="monospace">${m.badge}</text>

        <text x="30" y="125" fill="#FFFFFF" font-size="36" font-weight="bold" font-family="system-ui, sans-serif">${m.name}</text>
        <text x="30" y="165" fill="#38BDF8" font-size="16" font-family="system-ui, sans-serif">${m.cat}</text>

        <line x1="30" y1="200" x2="530" y2="200" stroke="#1E293B"/>

        <text x="30" y="260" fill="#94A3B8" font-size="14" font-family="system-ui, sans-serif">MODEL SPECIFICATION</text>
        <text x="30" y="320" fill="${m.color}" font-size="44" font-weight="bold" font-family="monospace">${m.stat}</text>

        <rect x="30" y="370" width="500" height="180" rx="12" fill="#060B14" fill-opacity="0.8"/>
        <text x="50" y="420" fill="#E2E8F0" font-size="16" font-family="system-ui, sans-serif">
          ${m.desc}
        </text>
      </g>
    `).join('')}

    <text x="80" y="1020" fill="#64748B" font-size="13" font-family="monospace">IE-PC 3112: Operations Management 1 · Group 7 · Port of Los Angeles Export Decision Challenge</text>
    <text x="${W - 80}" y="1020" fill="#F2A541" font-size="13" font-family="monospace" text-anchor="end">Cebu Technological University · BSIE 3-E</text>
  </svg>
  `;
}

function getSlide5SVG() {
  const ranking = [
    { rank: '1', name: 'ARIMA (1,1,0)', mae: '20,919', rmse: '24,426', mape: '4.71%', smape: '4.82%', mpe: '+2.43%', isWin: true, w: 280 },
    { rank: '2', name: 'ETS (α = 0.80)', mae: '22,952', rmse: '26,323', mape: '5.17%', smape: '5.31%', mpe: '+2.90%', isWin: false, w: 310 },
    { rank: '3', name: 'ETS (α = 0.50) Selected', mae: '27,725', rmse: '33,064', mape: '6.22%', smape: '6.49%', mpe: '+4.93%', isWin: false, w: 370 },
    { rank: '4', name: '3-Period WMA', mae: '28,473', rmse: '32,962', mape: '6.41%', smape: '6.66%', mpe: '+4.12%', isWin: false, w: 380 },
    { rank: '5', name: '3-Period SMA', mae: '31,927', rmse: '37,934', mape: '7.19%', smape: '7.53%', mpe: '+4.96%', isWin: false, w: 430 },
    { rank: '6', name: 'Random Forest', mae: '37,138', rmse: '42,988', mape: '8.31%', smape: '8.79%', mpe: '+7.34%', isWin: false, w: 500 },
    { rank: '7', name: 'Lagged Linear Reg.', mae: '37,990', rmse: '41,559', mape: '8.48%', smape: '8.93%', mpe: '+8.48%', isWin: false, w: 510 },
    { rank: '8', name: 'Trend Projection', mae: '52,142', rmse: '53,363', mape: '11.66%', smape: '12.41%', mpe: '+11.66%', isWin: false, w: 700 }
  ];

  return `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="#0B2545"/>
        <stop offset="100%" stop-color="#060B14"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>

    <rect x="80" y="50" width="360" height="38" rx="8" fill="#1B6CA8" fill-opacity="0.3" stroke="#1B6CA8"/>
    <text x="96" y="74" fill="#F2A541" font-size="14" font-weight="bold" font-family="system-ui, sans-serif">MV · Mylene Joy Villagracia</text>
    <text x="${W - 80}" y="74" fill="#94A3B8" font-size="14" font-family="monospace" text-anchor="end">SLIDE 5 OF 7 · VALIDATION &amp; FINAL COMPARISON</text>

    <text x="80" y="150" fill="#38BDF8" font-size="16" font-weight="bold" letter-spacing="2" font-family="system-ui, sans-serif">ACT III: THE 6-METRIC EVIDENCE REVEAL</text>
    <text x="80" y="215" fill="#FFFFFF" font-size="52" font-weight="300" font-family="system-ui, sans-serif">The Numbers Don't Lie: Validation Ranking</text>
    <text x="80" y="255" fill="#94A3B8" font-size="18" font-family="system-ui, sans-serif">Evaluation on Unseen Holdout Months 31–36 (Jul–Dec 2024 · Mean: 445,126 TEUs)</text>

    <!-- Table of 8 models -->
    <g transform="translate(80, 290)">
      <!-- Table Header -->
      <rect width="${W - 160}" height="42" fill="#1B6CA8" rx="8"/>
      <text x="24" y="27" fill="#FFFFFF" font-size="13" font-weight="bold" font-family="monospace">RANK &amp; MODEL</text>
      <text x="360" y="27" fill="#FFFFFF" font-size="13" font-weight="bold" font-family="monospace">MAE (TEUs)</text>
      <text x="560" y="27" fill="#FFFFFF" font-size="13" font-weight="bold" font-family="monospace">RMSE</text>
      <text x="760" y="27" fill="#FFFFFF" font-size="13" font-weight="bold" font-family="monospace">MAPE</text>
      <text x="960" y="27" fill="#FFFFFF" font-size="13" font-weight="bold" font-family="monospace">SMAPE</text>
      <text x="1160" y="27" fill="#FFFFFF" font-size="13" font-weight="bold" font-family="monospace">MPE (BIAS)</text>
      <text x="1400" y="27" fill="#FFFFFF" font-size="13" font-weight="bold" font-family="monospace">ERROR BAR (SHORTEST WINS)</text>

      ${ranking.map((r, i) => `
        <g transform="translate(0, ${52 + i * 62})">
          <rect width="${W - 160}" height="54" rx="8" fill="${r.isWin ? '#163860' : i % 2 === 0 ? '#0B2545' : '#060B14'}" stroke="${r.isWin ? '#F2A541' : '#1E293B'}" stroke-width="${r.isWin ? '2' : '1'}"/>
          <text x="24" y="34" fill="${r.isWin ? '#F2A541' : '#FFFFFF'}" font-size="16" font-weight="${r.isWin ? 'bold' : 'normal'}" font-family="system-ui, sans-serif">#${r.rank} ${r.name}</text>
          <text x="360" y="34" fill="${r.isWin ? '#F2A541' : '#FFFFFF'}" font-size="16" font-weight="bold" font-family="monospace">${r.mae}</text>
          <text x="560" y="34" fill="#CBD5E1" font-size="15" font-family="monospace">${r.rmse}</text>
          <text x="760" y="34" fill="${r.isWin ? '#F2A541' : '#CBD5E1'}" font-size="15" font-weight="bold" font-family="monospace">${r.mape}</text>
          <text x="960" y="34" fill="#CBD5E1" font-size="15" font-family="monospace">${r.smape}</text>
          <text x="1160" y="34" fill="#38BDF8" font-size="15" font-family="monospace">${r.mpe}</text>

          <!-- Error Bar -->
          <rect x="1400" y="18" width="${r.w}" height="18" rx="4" fill="${r.isWin ? '#F2A541' : '#1B6CA8'}"/>
        </g>
      `).join('')}
    </g>

    <!-- Key Finding Box -->
    <rect x="80" y="850" width="${W - 160}" height="110" rx="12" fill="#0B2545" stroke="#F2A541" stroke-width="1.5"/>
    <text x="110" y="890" fill="#F2A541" font-size="14" font-weight="bold" font-family="monospace">KEY VALIDATION FINDING &amp; OVERFITTING PHENOMENON</text>
    <text x="110" y="930" fill="#FFFFFF" font-size="18" font-family="system-ui, sans-serif">
      ARIMA (1,1,0) won on every single metric with 20,919 MAE (4.71% MAPE). Machine Learning models overfit, lagging behind 4 conventional methods.
    </text>

    <text x="80" y="1020" fill="#64748B" font-size="13" font-family="monospace">IE-PC 3112: Operations Management 1 · Group 7 · Port of Los Angeles Export Decision Challenge</text>
    <text x="${W - 80}" y="1020" fill="#F2A541" font-size="13" font-family="monospace" text-anchor="end">Cebu Technological University · BSIE 3-E</text>
  </svg>
  `;
}

function getSlide6SVG() {
  const pillars = [
    {
      step: '1. Capacity Floor',
      head: 'Staff to ARIMA Minimum',
      body: 'All models under-forecasted validation periods (+18% volume shift). Because vessel demurrage exceeds $50,000/day, under-forecasting is catastrophic. Treat the ARIMA forecast as a hard operational floor.',
      color: '#F2A541'
    },
    {
      step: '2. Contingency Buffer',
      head: '+7% Longshore Gang Buffer',
      body: 'Terminal superintendents must stage a 7% equipment and crane buffer on top of the ARIMA projection to absorb transpacific vessel bunching and empty container repositioning.',
      color: '#10B981'
    },
    {
      step: '3. Industry 5.0 Human Oversight',
      head: 'Human-in-the-Loop Sign-off',
      body: 'Algorithms narrow uncertainty but do not hold legal or terminal liability. Terminal superintendents must retain final override authority during tariff adjustments, labor negotiations, and severe weather.',
      color: '#38BDF8'
    }
  ];

  return `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="#0B2545"/>
        <stop offset="100%" stop-color="#060B14"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>

    <rect x="80" y="50" width="360" height="38" rx="8" fill="#1B6CA8" fill-opacity="0.3" stroke="#1B6CA8"/>
    <text x="96" y="74" fill="#F2A541" font-size="14" font-weight="bold" font-family="system-ui, sans-serif">MV · Mylene Joy Villagracia</text>
    <text x="${W - 80}" y="74" fill="#94A3B8" font-size="14" font-family="monospace" text-anchor="end">SLIDE 6 OF 7 · OPERATIONS RECOMMENDATION &amp; HUMAN OVERSIGHT</text>

    <text x="80" y="150" fill="#38BDF8" font-size="16" font-weight="bold" letter-spacing="2" font-family="system-ui, sans-serif">ACT III: OPERATIONAL ACTIONS &amp; INDUSTRY 5.0</text>
    <text x="80" y="215" fill="#FFFFFF" font-size="52" font-weight="300" font-family="system-ui, sans-serif">Operations Action &amp; Human Oversight</text>
    <text x="80" y="255" fill="#94A3B8" font-size="18" font-family="system-ui, sans-serif">Translating Forecast Precision into High-Stakes Maritime Terminal Execution</text>

    <g transform="translate(80, 310)">
      ${pillars.map((p, i) => `
        <g transform="translate(${i * 600}, 0)">
          <rect width="560" height="630" rx="16" fill="#0B2545" fill-opacity="0.85" stroke="#1B6CA8" stroke-width="1.5"/>
          
          <rect x="36" y="36" width="220" height="32" rx="6" fill="rgba(27,108,168,0.3)"/>
          <text x="48" y="58" fill="${p.color}" font-size="13" font-weight="bold" font-family="monospace">${p.step}</text>

          <text x="36" y="130" fill="#FFFFFF" font-size="30" font-weight="bold" font-family="system-ui, sans-serif">${p.head}</text>

          <line x1="36" y1="165" x2="524" y2="165" stroke="#1E293B"/>

          <text x="36" y="220" fill="#E2E8F0" font-size="17" font-family="system-ui, sans-serif">
            ${p.body}
          </text>
        </g>
      `).join('')}
    </g>

    <text x="80" y="1020" fill="#64748B" font-size="13" font-family="monospace">IE-PC 3112: Operations Management 1 · Group 7 · Port of Los Angeles Export Decision Challenge</text>
    <text x="${W - 80}" y="1020" fill="#F2A541" font-size="13" font-family="monospace" text-anchor="end">Cebu Technological University · BSIE 3-E</text>
  </svg>
  `;
}

function getSlide7SVG() {
  return `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="#0B2545"/>
        <stop offset="100%" stop-color="#060B14"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>

    <rect x="80" y="50" width="400" height="38" rx="8" fill="#1B6CA8" fill-opacity="0.3" stroke="#1B6CA8"/>
    <text x="96" y="74" fill="#F2A541" font-size="14" font-weight="bold" font-family="system-ui, sans-serif">RC · Rash Mae Crystelle C. Ansay (Leader)</text>
    <text x="${W - 80}" y="74" fill="#94A3B8" font-size="14" font-family="monospace" text-anchor="end">SLIDE 7 OF 7 · FINAL RECOMMENDATION</text>

    <text x="80" y="160" fill="#38BDF8" font-size="16" font-weight="bold" letter-spacing="2" font-family="system-ui, sans-serif">ACT III: DEFINITIVE GROUP DECISION</text>
    <text x="80" y="230" fill="#FFFFFF" font-size="52" font-weight="300" font-family="system-ui, sans-serif">The Final Recommendation</text>

    <!-- Amber Hero Card -->
    <rect x="80" y="300" width="${W - 160}" height="320" rx="20" fill="#0B2545" stroke="#F2A541" stroke-width="3"/>
    <text x="140" y="390" fill="#F2A541" font-size="34" font-weight="bold" font-style="italic" font-family="system-ui, sans-serif">
      “Use ARIMA (1,1,0) as the primary export-volume forecast,
    </text>
    <text x="140" y="450" fill="#F2A541" font-size="34" font-weight="bold" font-style="italic" font-family="system-ui, sans-serif">
      re-validated quarterly and reviewed by a human planner
    </text>
    <text x="140" y="510" fill="#F2A541" font-size="34" font-weight="bold" font-style="italic" font-family="system-ui, sans-serif">
      before it drives binding capacity decisions, with ETS α=0.50
    </text>
    <text x="140" y="570" fill="#F2A541" font-size="34" font-weight="bold" font-style="italic" font-family="system-ui, sans-serif">
      kept as a simple, spreadsheet-based backup.”
    </text>

    <!-- Academic Credits End Card -->
    <rect x="80" y="660" width="${W - 160}" height="260" rx="16" fill="#060B14" stroke="#1B6CA8" stroke-width="1.5"/>
    <text x="120" y="720" fill="#FFFFFF" font-size="22" font-weight="bold" letter-spacing="1" font-family="system-ui, sans-serif">IE-PC 3112: OPERATIONS MANAGEMENT 1 · APPLIED STUDY 1</text>
    <text x="120" y="765" fill="#38BDF8" font-size="18" font-family="system-ui, sans-serif">BSIE 3-E · Group 7 · Cebu Technological University – Main Campus</text>
    <text x="120" y="815" fill="#CBD5E1" font-size="16" font-family="system-ui, sans-serif">
      Team Members: Elaiza Jane Aligato • Rash Mae Crystelle C. Ansay (Leader) • Mylene Joy Villagracia
    </text>
    <text x="120" y="860" fill="#94A3B8" font-size="15" font-family="system-ui, sans-serif">
      Course Instructor: Engr. Lyndrian Shalom R. Baclayon · Academic Year 2024–2025
    </text>

    <text x="80" y="1020" fill="#64748B" font-size="13" font-family="monospace">IE-PC 3112: Operations Management 1 · Group 7 · Port of Los Angeles Export Decision Challenge</text>
    <text x="${W - 80}" y="1020" fill="#F2A541" font-size="13" font-family="monospace" text-anchor="end">Cebu Technological University · BSIE 3-E</text>
  </svg>
  `;
}

async function renderVideo() {
  console.log('Rendering SVG frames to PNG...');

  // Slide durations in seconds (total = 4:40 = 280 seconds)
  // For the video, we can render key animation frames per slide
  const slides = [
    { id: 1, duration: 45, getSvg: (p) => getSlide1SVG(p), animated: true },
    { id: 2, duration: 45, getSvg: () => getSlide2SVG(), animated: false },
    { id: 3, duration: 35, getSvg: () => getSlide3SVG(), animated: false },
    { id: 4, duration: 45, getSvg: () => getSlide4SVG(), animated: false },
    { id: 5, duration: 55, getSvg: () => getSlide5SVG(), animated: false },
    { id: 6, duration: 35, getSvg: () => getSlide6SVG(), animated: false },
    { id: 7, duration: 20, getSvg: () => getSlide7SVG(), animated: false },
  ];

  let frameIdx = 0;
  const frameList = [];

  for (const slide of slides) {
    console.log(`Processing Slide ${slide.id}...`);
    if (slide.animated) {
      // 5 progressive steps for line tracing
      for (let s = 1; s <= 5; s++) {
        const svg = slide.getSvg(s / 5);
        const pngPath = path.join(OUT_DIR, `frame_${String(frameIdx).padStart(5, '0')}.png`);
        await sharp(Buffer.from(svg)).png().toFile(pngPath);
        frameList.push({ file: pngPath, duration: slide.duration / 5 });
        frameIdx++;
      }
    } else {
      const svg = slide.getSvg(1.0);
      const pngPath = path.join(OUT_DIR, `frame_${String(frameIdx).padStart(5, '0')}.png`);
      await sharp(Buffer.from(svg)).png().toFile(pngPath);
      frameList.push({ file: pngPath, duration: slide.duration });
      frameIdx++;
    }
  }

  // Create concat demuxer file for ffmpeg
  const concatText = frameList.map(f => `file '${f.file}'\nduration ${f.duration}`).join('\n') + `\nfile '${frameList[frameList.length - 1].file}'\n`;
  const concatPath = '/tmp/ffmpeg_concat.txt';
  fs.writeFileSync(concatPath, concatText);

  // Generate 55Hz ambient sine wave audio pad with lowpass
  const audioPath = '/tmp/ambient_drone.aac';
  console.log('Generating low ambient pad audio track...');
  execSync(`ffmpeg -y -f lavfi -i "sine=frequency=55:duration=280" -af "volume=0.15,lowpass=f=180" -c:a aac -b:a 128k ${audioPath}`);

  // Render final MP4
  const outMp4 = '/app/applet/public/OM1_Group7_Keynote_Video.mp4';
  console.log('Encoding final MP4 video with ffmpeg...');
  execSync(`ffmpeg -y -f concat -safe 0 -i ${concatPath} -i ${audioPath} -c:v libx264 -pix_fmt yuv420p -r 30 -c:a copy -shortest -movflags +faststart ${outMp4}`);

  console.log('MP4 Video generated successfully at:', outMp4);
  const stat = fs.statSync(outMp4);
  console.log(`Size: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
}

renderVideo().catch(err => {
  console.error('Video generation failed:', err);
  process.exit(1);
});
