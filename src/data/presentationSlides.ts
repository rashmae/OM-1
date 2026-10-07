/**
 * "The Forecast: Port of Los Angeles Monthly Export Volume (TEUs)"
 * Applied Study 1: Real-Data Forecasting Decision Challenge
 * IE-PC 3112: Operations Management 1 · BSIE 3-E · Group 7 · Cebu Technological University
 * 
 * Master Presentation Keynote: 7 Comprehensive Operational Beats (270 Seconds · 4:30 Minutes)
 * 
 * Beat 0 (25s): Prologue — Meet Group 7 & Port Background
 * Beat 1 (40s): Act I — The Maritime Signal, February 2023 Shock & 4-Way Decomposition
 * Beat 2 (35s): Act II — Conventional OM Models (SMA, WMA, ETS α=0.50 Baseline)
 * Beat 3 (30s): Act III — Integrity Partition & Blind Validation (30 Dev vs 6 Val)
 * Beat 4 (40s): Act IV — Advanced Algorithmic Arena (ARIMA 1,1,0, Lagged LR, Random Forest)
 * Beat 5 (55s): Act V — Model Tournament Leaderboard & Decisive Victory (ARIMA #1)
 * Beat 6 (45s): Act VI — Port Operations & Strategic Recommendations
 */

import { BaselineModelChoice } from './forecastingData';

export interface KeynoteBeat {
  id: string;
  beatNumber: number;
  slideNumber: number;
  title: string;
  beatTitle: string;
  actTitle: string;
  flowSection: string;
  durationSeconds: number;
  cumulativeStartSeconds: number;
  speaker: string;
  speakerRole: string;
  speakerInitials: string;
  livePresenterPrompt: string;
  liveSpeakerPrompt: string;
  onScreenStoryCaptions: string[];
  dataHighlight?: string;
  keyMetric?: {
    label: string;
    value: string;
    sublabel?: string;
  };
}

export const KEYNOTE_BEATS: KeynoteBeat[] = [
  // =========================================================================
  // BEAT 0 (0:00 - 0:25 · 25s) — PROLOGUE: MEET GROUP 7
  // =========================================================================
  {
    id: "beat-0",
    beatNumber: 0,
    slideNumber: 1,
    title: "Prologue: Meet Group 7",
    beatTitle: "Prologue: Meet Group 7 · Section D10",
    actTitle: "Prologue: Applied Study 1",
    flowSection: "Group 7 Specialists & Port Introduction",
    durationSeconds: 25,
    cumulativeStartSeconds: 0,
    speaker: "Aligato, Ansay, Villagracia",
    speakerRole: "Industrial Engineering Analytics Team",
    speakerInitials: "G7",
    livePresenterPrompt: "Welcome to Group 7's Real-Data Forecasting Decision Presentation for Operations Management 1. We are Industrial Engineering students of BSIE 3-E, Section D10, at Cebu Technological University. In this study, we tackle thirty-six consecutive months of containerized export volumes from the Port of Los Angeles to determine the optimal forecasting model for port terminal decision-making.",
    liveSpeakerPrompt: "Welcome to Group 7's Real-Data Forecasting Decision Presentation for Operations Management 1. We are Industrial Engineering students of BSIE 3-E, Section D10, at Cebu Technological University. In this study, we tackle thirty-six consecutive months of containerized export volumes from the Port of Los Angeles to determine the optimal forecasting model for port terminal decision-making.",
    onScreenStoryCaptions: [
      "GROUP 7 (D10)",
      "BSIE 3-E · CTU MAIN",
      "PORT OF LOS ANGELES",
      "36 MONTHS DATASET"
    ],
    dataHighlight: "Physical Container → Data Particles → 36 Months Timeline",
    keyMetric: {
      label: "Dataset D10",
      value: "36 MONTHS",
      sublabel: "Jan 2022 – Dec 2024 Verified Export TEUs"
    }
  },

  // =========================================================================
  // BEAT 1 (0:25 - 1:05 · 40s) — ACT I: THE MARITIME SIGNAL & DATA BEHAVIOR
  // =========================================================================
  {
    id: "beat-1",
    beatNumber: 1,
    slideNumber: 2,
    title: "The Maritime Signal & Data Behavior",
    beatTitle: "Act I: Maritime Trade & February 2023 Shock",
    actTitle: "Act I: Physical Port to Data Space",
    flowSection: "Chronological Data Points, Feb 2023 Shock & 4-Way Decomposition",
    durationSeconds: 40,
    cumulativeStartSeconds: 25,
    speaker: "Aligato, Elaiza Jane",
    speakerRole: "Lead Analyst · Speaker 1",
    speakerInitials: "EA",
    livePresenterPrompt: "Our operational dataset spans thirty-six monthly export observations from January 2022 to December 2024. In early 2022, volumes were robust before entering a prolonged destocking decline. In February 2023, volume hit the series nadir of 236,264 TEUs — a thirty-two percent plunge. We decompose the series into Trend, Seasonality, Cyclicality, and Randomness. Linear correlation with time is downward at r = -0.39, proving that fitting a straight line on this volatile series is an operational hazard.",
    liveSpeakerPrompt: "Our operational dataset spans thirty-six monthly export observations from January 2022 to December 2024. In early 2022, volumes were robust before entering a prolonged destocking decline. In February 2023, volume hit the series nadir of 236,264 TEUs — a thirty-two percent plunge. We decompose the series into Trend, Seasonality, Cyclicality, and Randomness. Linear correlation with time is downward at r = -0.39, proving that fitting a straight line on this volatile series is an operational hazard.",
    onScreenStoryCaptions: [
      "36 MONTHS TIMELINE",
      "FEB 2023 LOW: 236,264",
      "4-WAY DECOMPOSITION",
      "r = −0.39 (DOWNWARD)"
    ],
    dataHighlight: "36 Months Verified TEUs · Historical Shock: 236,264 TEUs",
    keyMetric: {
      label: "Series Low",
      value: "236,264 TEUs",
      sublabel: "February 2023 Structural Shock"
    }
  },

  // =========================================================================
  // BEAT 2 (1:05 - 1:40 · 35s) — ACT II: CONVENTIONAL OM MODELS
  // =========================================================================
  {
    id: "beat-2",
    beatNumber: 2,
    slideNumber: 3,
    title: "Conventional OM Models",
    beatTitle: "Act II: Conventional OM Laboratory",
    actTitle: "Act II: Conventional OM Lab",
    flowSection: "SMA, WMA, ETS (α=0.20, 0.50, 0.80), & Trend Projection",
    durationSeconds: 35,
    cumulativeStartSeconds: 65,
    speaker: "Ansay, Rash Mae Crystelle C.",
    speakerRole: "Group Leader · Port Logistics Planner · Speaker 2",
    speakerInitials: "RA",
    livePresenterPrompt: "In our Operations Management laboratory, we evaluated four classical techniques across the development horizon: Simple Moving Average, Weighted Moving Average, Exponential Smoothing with multiple alphas, and Trend Projection. Moving averages exhibited notable lag following the February 2023 shock. Exponential Smoothing at alpha 0.50 struck the ideal balance between memory and recency, achieving the lowest training error and becoming our locked conventional baseline.",
    liveSpeakerPrompt: "In our Operations Management laboratory, we evaluated four classical techniques across the development horizon: Simple Moving Average, Weighted Moving Average, Exponential Smoothing with multiple alphas, and Trend Projection. Moving averages exhibited notable lag following the February 2023 shock. Exponential Smoothing at alpha 0.50 struck the ideal balance between memory and recency, achieving the lowest training error and becoming our locked conventional baseline.",
    onScreenStoryCaptions: [
      "3-PERIOD SMA LAG",
      "3-PERIOD WMA (0.50/0.30/0.20)",
      "ETS α = 0.50 (BASELINE ★)",
      "DEV MAE: 30,596 TEUs"
    ],
    dataHighlight: "Center-Stage Zooms · ETS α=0.50 Locked Baseline · Trend r = -0.39",
    keyMetric: {
      label: "Conventional Baseline",
      value: "ETS α = 0.50",
      sublabel: "Dev MAE: 30,596 · r = -0.39 down-slope"
    }
  },

  // =========================================================================
  // BEAT 3 (1:40 - 2:10 · 30s) — ACT III: INTEGRITY PARTITION & BLIND VALIDATION
  // =========================================================================
  {
    id: "beat-3",
    beatNumber: 3,
    slideNumber: 4,
    title: "Integrity Partition & Blind Validation",
    beatTitle: "Act III: Partition & Blind Validation",
    actTitle: "Act III: Integrity Partition",
    flowSection: "30 Development Months vs 6 Validation Months Holdout Horizon",
    durationSeconds: 30,
    cumulativeStartSeconds: 100,
    speaker: "Ansay, Rash Mae Crystelle C.",
    speakerRole: "Group Leader · Port Logistics Planner · Speaker 2",
    speakerInitials: "RA",
    livePresenterPrompt: "A core principle of industrial forecasting integrity is chronological partitioning. We separated the thirty-six months into thirty development periods — January 2022 to June 2024 — and reserved the final six months — July to December 2024 — as a strict, out-of-sample validation holdout. Models were parameterized strictly on development data and evaluated on genuinely unseen future actuals.",
    liveSpeakerPrompt: "A core principle of industrial forecasting integrity is chronological partitioning. We separated the thirty-six months into thirty development periods — January 2022 to June 2024 — and reserved the final six months — July to December 2024 — as a strict, out-of-sample validation holdout. Models were parameterized strictly on development data and evaluated on genuinely unseen future actuals.",
    onScreenStoryCaptions: [
      "30 DEV MONTHS (1–30)",
      "6 VAL MONTHS (31–36)",
      "CHRONOLOGICAL PARTITION",
      "BLIND OUT-OF-SAMPLE TEST"
    ],
    dataHighlight: "Chronological Split: Months 1–30 Development vs 31–36 Validation",
    keyMetric: {
      label: "Validation Split",
      value: "6 MONTHS",
      sublabel: "Blind Out-of-Sample Holdout (Jul–Dec 2024)"
    }
  },

  // =========================================================================
  // BEAT 4 (2:10 - 2:50 · 40s) — ACT IV: ADVANCED ALGORITHMIC ARENA
  // =========================================================================
  {
    id: "beat-4",
    beatNumber: 4,
    slideNumber: 5,
    title: "Advanced Algorithmic Arena",
    beatTitle: "Act IV: Statistical & ML Challengers",
    actTitle: "Act IV: Advanced Algorithmic Arena",
    flowSection: "ARIMA (1,1,0), Lagged Linear Regression, Random Forest 100 Trees",
    durationSeconds: 40,
    cumulativeStartSeconds: 130,
    speaker: "Villagracia, Mylene Joy",
    speakerRole: "Validation & ML Engineer · Speaker 3",
    speakerInitials: "MV",
    livePresenterPrompt: "Beyond conventional time-series models, we introduced three advanced methods: ARIMA (1,1,0), Lagged Linear Regression with autoregressive lags one to three, and a Random Forest ensemble of one hundred regression trees. First-differencing in ARIMA achieved stationarity and effectively absorbed post-shock recovery momentum, recording the lowest Akaike Information Criterion at 701.43.",
    liveSpeakerPrompt: "Beyond conventional time-series models, we introduced three advanced methods: ARIMA (1,1,0), Lagged Linear Regression with autoregressive lags one to three, and a Random Forest ensemble of one hundred regression trees. First-differencing in ARIMA achieved stationarity and effectively absorbed post-shock recovery momentum, recording the lowest Akaike Information Criterion at 701.43.",
    onScreenStoryCaptions: [
      "ARIMA (1,1,0) · AIC 701.43",
      "LAGGED REGRESSION (LAGS 1–3)",
      "RANDOM FOREST (100 TREES)",
      "STATISTICS VS ML"
    ],
    dataHighlight: "3 Advanced Contenders Emerge: ARIMA (1,1,0), Lagged LR, Random Forest",
    keyMetric: {
      label: "Contenders",
      value: "9 MODELS",
      sublabel: "Conventional vs ARIMA vs Machine Learning"
    }
  },

  // =========================================================================
  // BEAT 5 (2:50 - 3:45 · 55s) — ACT V: LEADERBOARD & DECISIVE VICTORY
  // =========================================================================
  {
    id: "beat-5",
    beatNumber: 5,
    slideNumber: 6,
    title: "Leaderboard & Decisive Victory",
    beatTitle: "Act V: Model Tournament & Decisive Victory",
    actTitle: "Act V: Validation Leaderboard",
    flowSection: "All 9 Models Ranked by Out-of-Sample MAE · ARIMA #1 Winner",
    durationSeconds: 55,
    cumulativeStartSeconds: 170,
    speaker: "Villagracia, Mylene Joy",
    speakerRole: "Validation & ML Engineer · Speaker 3",
    speakerInitials: "MV",
    livePresenterPrompt: "Evaluating all nine models across the six-month blind validation holdout yielded an unmistakable winner. ARIMA (1,1,0) achieved first place with a Mean Absolute Error of 20,919 TEUs and a MAPE of 4.71%. It outperformed our locked conventional baseline, ETS alpha 0.50 at 27,725 TEUs, delivering a twenty-four point five percent error reduction. Complex Machine Learning fell behind conventional smoothing due to sample size constraints, proving that parsimony and proper differencing win.",
    liveSpeakerPrompt: "Evaluating all nine models across the six-month blind validation holdout yielded an unmistakable winner. ARIMA (1,1,0) achieved first place with a Mean Absolute Error of 20,919 TEUs and a MAPE of 4.71%. It outperformed our locked conventional baseline, ETS alpha 0.50 at 27,725 TEUs, delivering a twenty-four point five percent error reduction. Complex Machine Learning fell behind conventional smoothing due to sample size constraints, proving that parsimony and proper differencing win.",
    onScreenStoryCaptions: [
      "ARIMA #1: 20,919 MAE",
      "MAPE: 4.71%",
      "ETS α=0.50: 27,725",
      "24.5% ERROR REDUCTION"
    ],
    dataHighlight: "Official Validation MAE Ranking: ARIMA #1 (20,919 TEUs)",
    keyMetric: {
      label: "Top Rank",
      value: "ARIMA #1",
      sublabel: "Outperforms all 8 alternative models"
    }
  },

  // =========================================================================
  // BEAT 6 (3:45 - 4:30 · 45s) — ACT VI: PORT OPERATIONS & STRATEGIC RECOMMENDATIONS
  // =========================================================================
  {
    id: "beat-6",
    beatNumber: 6,
    slideNumber: 7,
    title: "Port Operations & Recommendations",
    beatTitle: "Act VI: Port Operations & Strategic Recommendations",
    actTitle: "Act VI: Operations & Port Decision",
    flowSection: "Labor Gangs, Equipment Staging, Berth Capacity, & Modest Capacity Buffer",
    durationSeconds: 45,
    cumulativeStartSeconds: 225,
    speaker: "Ansay, Rash Mae Crystelle C.",
    speakerRole: "Group Leader · Port Logistics Planner · Speaker 2",
    speakerInitials: "RA",
    livePresenterPrompt: "Translating statistical output into port terminal operations: our monthly forecast directly governs three operational pillars: longshore gang scheduling, yard crane equipment staging, and container berth allocation. Because underforecasting causes severe asymmetric demurrage penalties exceeding fifty thousand dollars daily, we mandate a modest five to eight percent capacity buffer above the ARIMA forecast, paired with continuous human industrial engineering oversight.",
    liveSpeakerPrompt: "Translating statistical output into port terminal operations: our monthly forecast directly governs three operational pillars: longshore gang scheduling, yard crane equipment staging, and container berth allocation. Because underforecasting causes severe asymmetric demurrage penalties exceeding fifty thousand dollars daily, we mandate a modest five to eight percent capacity buffer above the ARIMA forecast, paired with continuous human industrial engineering oversight.",
    onScreenStoryCaptions: [
      "LABOR · EQUIPMENT · BERTH",
      "DEMURRAGE COST > $50K/DAY",
      "+5–8% CAPACITY BUFFER",
      "HUMAN IE OVERSIGHT"
    ],
    dataHighlight: "ARIMA (1,1,0) Primary · ETS α=0.50 Backup · Capacity Buffer",
    keyMetric: {
      label: "Final Verdict",
      value: "ARIMA (1,1,0)",
      sublabel: "Forecast Volume · Plan Capacity · Human Oversight"
    }
  }
];

export const TOTAL_KEYNOTE_SECONDS = KEYNOTE_BEATS.reduce((sum, b) => sum + b.durationSeconds, 0); // Exactly 270s (4:30 minutes)

// Compatibility exports
export type SlideBeat = KeynoteBeat;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getPresentationBeats = (_baseline?: BaselineModelChoice) => KEYNOTE_BEATS;
export const PRESENTATION_BEATS = KEYNOTE_BEATS;
export const TOTAL_PRESENTATION_SECONDS = TOTAL_KEYNOTE_SECONDS;
