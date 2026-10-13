/**
 * "The Forecast: Port of Los Angeles Monthly Export Volume (TEUs)"
 * Applied Study 1: Real-Data Forecasting Decision Challenge
 * IE-PC 3112: Operations Management 1 · BSIE 3-E · Cebu Technological University
 * Dataset D10: Port of Los Angeles Monthly Exports (36 Observations: Jan 2022 – Dec 2024)
 *
 * Presentation Flow Structure (Exact Script & Timeframe):
 * Beat 0 (13s): The Hook — Title & Study Context (0:00 - 0:13) · All Speakers
 * Beat 1 (28s): The Problem — Operational Problem & Data Behavior (0:13 - 0:41) · Elaiza Jane Aligato
 * Beat 2 (44s): The First Contender — 4 Conventional Models Grid & Overlap (0:41 - 1:25) · Rash Mae Crystelle C. Ansay
 * Beat 3 (16s): The Fair Test — Pre-Validation Baseline Selection: ETS α = 0.50 (1:26 - 1:41) · Rash Mae Crystelle C. Ansay
 * Beat 4 (41s): The Challengers — Actual vs Statistical & ML Forecast + "Which One Wins?" (1:42 - 2:22) · Mylene Joy Villagracia
 * Beat 5 (8s):  The Twist — Validation Ranking Across All Models & ARIMA Decisive Performance (2:23 - 2:30) · Mylene Joy Villagracia
 * Beat 6 (60s): The Decision — USE ARIMA (1,1,0), Capacity Commitment, Final Verdict & Closing (2:31 - 3:30) · Rash Mae Crystelle C. Ansay & Team
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
  // BEAT 0 (0:00 - 0:13 · 13s) — THE HOOK: TITLE AND STUDY CONTEXT
  // =========================================================================
  {
    id: "beat-0",
    beatNumber: 0,
    slideNumber: 1,
    title: "Title & Study Context",
    beatTitle: "Beat 0: The Hook · Title and Study Context",
    actTitle: "Beat 0: The Hook",
    flowSection: "Dataset D10: Port of Los Angeles Monthly Exports · The Explainer",
    durationSeconds: 13,
    cumulativeStartSeconds: 0,
    speaker: "All Speakers",
    speakerRole: "Industrial Engineering Analytics Team · BSIE 3-E",
    speakerInitials: "ALL",
    livePresenterPrompt: "ELAIZA: Every month, a major port faces the same challenge. How many containers should it prepare to handle?\n\nRASH MAE: Too much capacity means wasted labor and equipment. Too little means delays, congestion, and missed opportunities.\n\nMYLENE: So, we analyzed export data from the Port of Los Angeles to find: Which forecasting model gives management the most reliable guide?",
    liveSpeakerPrompt: "ELAIZA: Every month, a major port faces the same challenge. How many containers should it prepare to handle?\n\nRASH MAE: Too much capacity means wasted labor and equipment. Too little means delays, congestion, and missed opportunities.\n\nMYLENE: So, we analyzed export data from the Port of Los Angeles to find: Which forecasting model gives management the most reliable guide?",
    onScreenStoryCaptions: [
      "THE EXPLAINER",
      "PORT OF LOS ANGELES",
      "DATASET D10",
      "WHICH FORECASTING MODEL WINS?"
    ],
    dataHighlight: "Dataset D10 · Port of Los Angeles Monthly Exports",
    keyMetric: {
      label: "Dataset D10",
      value: "PORT OF LA",
      sublabel: "Monthly Container Export Volume (TEUs)"
    }
  },

  // =========================================================================
  // BEAT 1 (0:13 - 0:41 · 28s) — THE PROBLEM: OPERATIONAL PROBLEM & DATA BEHAVIOR
  // =========================================================================
  {
    id: "beat-1",
    beatNumber: 1,
    slideNumber: 2,
    title: "Operational Problem & Data Behavior",
    beatTitle: "Beat 1: The Problem · Operational Problem & Data Behavior",
    actTitle: "Beat 1: The Problem",
    flowSection: "Data Shock, Question: How can you plan effectively if you cannot predict what comes next? & 4 Components (0:35 - 0:40)",
    durationSeconds: 28,
    cumulativeStartSeconds: 13,
    speaker: "Aligato, Elaiza Jane",
    speakerRole: "Speaker 1",
    speakerInitials: "EA",
    livePresenterPrompt: "ELAIZA: At first, we might expect export volumes to follow a clear pattern. But our data tells a different story. In May 2022, exports reached 466,221 TEUs. By November, they had fallen to 327,888. Then came February 2023. Exports dropped to only 236,264 TEUs, our lowest observation. We kept this unusual value because removing real observations would hide part of the operational problem. Our development data also showed a weak negative trend, with a correlation of negative 0.39. No clear seasonal pattern emerged. How can you plan effectively if you cannot predict what comes next?",
    liveSpeakerPrompt: "ELAIZA: At first, we might expect export volumes to follow a clear pattern. But our data tells a different story. In May 2022, exports reached 466,221 TEUs. By November, they had fallen to 327,888. Then came February 2023. Exports dropped to only 236,264 TEUs, our lowest observation. We kept this unusual value because removing real observations would hide part of the operational problem. Our development data also showed a weak negative trend, with a correlation of negative 0.39. No clear seasonal pattern emerged. How can you plan effectively if you cannot predict what comes next?",
    onScreenStoryCaptions: [
      "MAY 2022: 466,221 TEUs",
      "NOV 2022: 327,888 TEUs",
      "FEB 2023 LOW: 236,264 TEUs",
      "HOW CAN YOU PLAN EFFECTIVELY IF YOU CANNOT PREDICT WHAT COMES NEXT?"
    ],
    dataHighlight: "Core Operational Challenge: Demand Volatility & Shock",
    keyMetric: {
      label: "Series Low",
      value: "236,264 TEUs",
      sublabel: "February 2023 Structural Shock"
    }
  },

  // =========================================================================
  // BEAT 2 (0:41 - 1:25 · 44s) — THE FIRST CONTENDER: 4 CONVENTIONAL MODELS
  // =========================================================================
  {
    id: "beat-2",
    beatNumber: 2,
    slideNumber: 3,
    title: "Conventional Forecasting Results",
    beatTitle: "Beat 2: The First Contender · 4 Conventional Models Grid & Overlap",
    actTitle: "Beat 2: The First Contender",
    flowSection: "4 Conventional Models Grid (SMA, WMA, ETS α=0.50, SLR) & Overlapped View (0:41 - 1:25)",
    durationSeconds: 44,
    cumulativeStartSeconds: 41,
    speaker: "Ansay, Rash Mae Crystelle C.",
    speakerRole: "Speaker 2",
    speakerInitials: "RA",
    livePresenterPrompt: "RASH MAE: Before turning to advanced models, we tested four conventional methods using the first 30 months. We compared the three-month Simple Moving Average, Weighted Moving Average, Exponential Smoothing, and Trend Projection. For Exponential Smoothing, we tested three alpha values: 0.20, 0.50, and 0.80. The strongest development result came from alpha 0.50, with an MAE of 30,596 TEUs. So, we selected ETS alpha 0.50 as our conventional baseline. But here's the next question. Would this model remain the strongest when faced with data it had never seen?",
    liveSpeakerPrompt: "RASH MAE: Before turning to advanced models, we tested four conventional methods using the first 30 months. We compared the three-month Simple Moving Average, Weighted Moving Average, Exponential Smoothing, and Trend Projection. For Exponential Smoothing, we tested three alpha values: 0.20, 0.50, and 0.80. The strongest development result came from alpha 0.50, with an MAE of 30,596 TEUs. So, we selected ETS alpha 0.50 as our conventional baseline. But here's the next question. Would this model remain the strongest when faced with data it had never seen?",
    onScreenStoryCaptions: [
      "4 CONVENTIONAL MODELS IN ONE FRAME",
      "SMA (33,428 MAE) · WMA (32,142 MAE)",
      "ETS α = 0.50 (30,596 MAE BASELINE)",
      "OVERLAPPED CONVENTIONAL COMPARISON"
    ],
    dataHighlight: "4 Conventional Models Grid & Overlapped Comparison · ETS α=0.50 Baseline",
    keyMetric: {
      label: "Conventional Baseline",
      value: "ETS α = 0.50",
      sublabel: "Dev MAE: 30,596 TEUs · Aligned with Actual Demand"
    }
  },

  // =========================================================================
  // BEAT 3 (1:26 - 1:41 · 15s) — THE FAIR TEST: BASELINE MODEL SELECTION
  // =========================================================================
  {
    id: "beat-3",
    beatNumber: 3,
    slideNumber: 4,
    title: "Pre-Validation Baseline Selection: ETS α = 0.50",
    beatTitle: "Beat 3: The Fair Test · Baseline Model Selection",
    actTitle: "Beat 3: The Fair Test",
    flowSection: "Locked Baseline: ETS α = 0.50 · Blind Holdout Setup (1:26 - 1:41)",
    durationSeconds: 16,
    cumulativeStartSeconds: 85,
    speaker: "Ansay, Rash Mae Crystelle C.",
    speakerRole: "Speaker 2",
    speakerInitials: "RA",
    livePresenterPrompt: "RASH MAE: Before testing the challengers, we locked our baseline: Exponential Smoothing with alpha 0.50. We evaluated performance across rigorous metrics and reserved Periods 31 to 36 for validation, keeping those six months separate from model development. This gave us a fair comparison. The baseline was already chosen before the validation results were revealed.",
    liveSpeakerPrompt: "RASH MAE: Before testing the challengers, we locked our baseline: Exponential Smoothing with alpha 0.50. We evaluated performance across rigorous metrics and reserved Periods 31 to 36 for validation, keeping those six months separate from model development. This gave us a fair comparison. The baseline was already chosen before the validation results were revealed.",
    onScreenStoryCaptions: [
      "THE BASELINE",
      "ETS α = 0.50 LOCKED BASELINE",
      "FAIR BLIND VALIDATION HOLDOUT",
      "PERIODS 31–36 SEPARATED"
    ],
    dataHighlight: "Locked Pre-Validation Baseline: ETS α = 0.50 (MAE: 30,596 TEUs)",
    keyMetric: {
      label: "Baseline Model",
      value: "ETS α = 0.50",
      sublabel: "Pre-Validation Baseline Locked"
    }
  },

  // =========================================================================
  // BEAT 4 (1:42 - 2:22 · 40s) — THE CHALLENGERS: ACTUAL VS STATISTICAL & ML FORECAST
  // =========================================================================
  {
    id: "beat-4",
    beatNumber: 4,
    slideNumber: 5,
    title: "ARIMA and Machine-Learning Validation Results",
    beatTitle: "Beat 4: The Challengers · Actual vs Statistical & ML Forecast + Which One Wins?",
    actTitle: "Beat 4: The Challengers",
    flowSection: "Actual vs Statistical & Machine Learning Forecast (Holdout 31–36) & 'Which One Wins?' (1:42 - 2:22)",
    durationSeconds: 41,
    cumulativeStartSeconds: 101,
    speaker: "Villagracia, Mylene Joy",
    speakerRole: "Speaker 3",
    speakerInitials: "MV",
    livePresenterPrompt: "MYLENE: Now, three challengers entered the test. First, ARIMA 1,1,0, selected through AIC comparison across six candidate orders. Second, Lagged Linear Regression, using the previous three months to predict the next. Third, Random Forest, combining 100 regression trees. Each model learned from the first 30 months. We then forecast the final six months one step at a time, adding each actual observation to the history without retraining. Three models. Six unseen months. One question: which one wins?",
    liveSpeakerPrompt: "MYLENE: Now, three challengers entered the test. First, ARIMA 1,1,0, selected through AIC comparison across six candidate orders. Second, Lagged Linear Regression, using the previous three months to predict the next. Third, Random Forest, combining 100 regression trees. Each model learned from the first 30 months. We then forecast the final six months one step at a time, adding each actual observation to the history without retraining. Three models. Six unseen months. One question: which one wins?",
    onScreenStoryCaptions: [
      "ACTUAL VS STATISTICAL & ML FORECAST",
      "ARIMA (1,1,0) · LAGGED LR · RANDOM FOREST",
      "PERIODS 31–36 HOLDOUT EVALUATION",
      "WHICH ONE WINS?"
    ],
    dataHighlight: "Actual vs Statistical & Machine Learning Forecast · Contenders Lineup",
    keyMetric: {
      label: "Challengers",
      value: "3 MODELS",
      sublabel: "ARIMA (1,1,0) · Lagged LR · Random Forest"
    }
  },

  // =========================================================================
  // BEAT 5 (2:23 - 2:30 · 8s) — THE TWIST: VALIDATION RANKING ACROSS ALL MODELS
  // =========================================================================
  {
    id: "beat-5",
    beatNumber: 5,
    slideNumber: 6,
    title: "Validation Ranking Across All Models",
    beatTitle: "Beat 5: The Twist · Validation Ranking Across All Models & ARIMA Performance",
    actTitle: "Beat 5: The Twist",
    flowSection: "Validation Ranking Across All Models · ARIMA (1,1,0) Decisive Performance (2:23 - 2:30)",
    durationSeconds: 8,
    cumulativeStartSeconds: 142,
    speaker: "Villagracia, Mylene Joy",
    speakerRole: "Speaker 3",
    speakerInitials: "MV",
    livePresenterPrompt: "MYLENE: Here's where the results took a turn. Average exports rose from 377,268 TEUs during development to 445,111 during validation. That's an 18 percent increase. Random Forest recorded an MAE of 37,138 TEUs. Lagged Linear Regression reached 37,990. But ARIMA took first place among our tested models, with an MAE of 20,919 and a MAPE of 4.71 percent, reducing average error by 24.5 percent compared with our locked baseline.",
    liveSpeakerPrompt: "MYLENE: Here's where the results took a turn. Average exports rose from 377,268 TEUs during development to 445,111 during validation. That's an 18 percent increase. Random Forest recorded an MAE of 37,138 TEUs. Lagged Linear Regression reached 37,990. But ARIMA took first place among our tested models, with an MAE of 20,919 and a MAPE of 4.71 percent, reducing average error by 24.5 percent compared with our locked baseline.",
    onScreenStoryCaptions: [
      "VALIDATION RANKING ACROSS ALL MODELS",
      "ARIMA (1,1,0) DECISIVE PERFORMANCE",
      "20,919 MAE · 4.71% MAPE (#1 RANK)",
      "−24.5% ERROR vs LOCKED BASELINE"
    ],
    dataHighlight: "Validation Ranking Across All Models: ARIMA (1,1,0) #1 (20,919 MAE)",
    keyMetric: {
      label: "Top Rank",
      value: "ARIMA #1",
      sublabel: "20,919 MAE · 4.71% MAPE"
    }
  },

  // =========================================================================
  // BEAT 6 (2:31 - 3:30 · 60s) — THE DECISION: OPERATIONS RECOMMENDATION & OVERSIGHT
  // =========================================================================
  {
    id: "beat-6",
    beatNumber: 6,
    slideNumber: 7,
    title: "Operations Recommendation, Capacity Buffer & Final Verdict",
    beatTitle: "Beat 6: The Decision · USE ARIMA (1,1,0), Capacity Commitment, Final Verdict & Closing",
    actTitle: "Beat 6: The Decision",
    flowSection: "USE ARIMA (1,1,0) Primary, +5% Capacity Buffer, Human Final Verdict & Closing (2:31 - 3:30)",
    durationSeconds: 60,
    cumulativeStartSeconds: 150,
    speaker: "Rash Mae Crystelle C. Ansay & Team",
    speakerRole: "Speaker 2 & Team",
    speakerInitials: "TEAM",
    livePresenterPrompt: "RASH MAE: So, what should port management do with these findings? Use ARIMA 1,1,0 as the primary one-month-ahead forecast, updated monthly. Keep ETS alpha 0.50 as a spreadsheet backup. Plan labor, berth allocation, and equipment around the forecast. Arrange about five percent flexible capacity above the forecast. Review model performance quarterly. Most importantly, a human planner must approve every major capacity commitment.\n\nELAIZA: Because real demand never follows a perfect script.\n\nMYLENE: And even the best model has limits.\n\nRASH MAE: Our verdict: ARIMA leads our comparison, but sound operational decisions still require human judgment.\n\nALL: This is BSIE 3-E from Cebu Technological University. Thank you for watching The Explainer.",
    liveSpeakerPrompt: "RASH MAE: So, what should port management do with these findings? Use ARIMA 1,1,0 as the primary one-month-ahead forecast, updated monthly. Keep ETS alpha 0.50 as a spreadsheet backup. Plan labor, berth allocation, and equipment around the forecast. Arrange about five percent flexible capacity above the forecast. Review model performance quarterly. Most importantly, a human planner must approve every major capacity commitment.\n\nELAIZA: Because real demand never follows a perfect script.\n\nMYLENE: And even the best model has limits.\n\nRASH MAE: Our verdict: ARIMA leads our comparison, but sound operational decisions still require human judgment.\n\nALL: This is BSIE 3-E from Cebu Technological University. Thank you for watching The Explainer.",
    onScreenStoryCaptions: [
      "USE ARIMA (1, 1, 0) MONTHLY ROLL",
      "+5% FLEXIBLE CAPACITY BUFFER",
      "HUMAN PLANNER APPROVAL MANDATORY",
      "SOUND DECISIONS REQUIRE HUMAN JUDGMENT"
    ],
    dataHighlight: "USE ARIMA (1,1,0) Primary · +5% Buffer · Human Final Verdict",
    keyMetric: {
      label: "Final Verdict",
      value: "ARIMA (1,1,0)",
      sublabel: "+5% Flexible Buffer · Human Judgment"
    }
  }
];

export const TOTAL_KEYNOTE_SECONDS = KEYNOTE_BEATS.reduce((sum, b) => sum + b.durationSeconds, 0); // Exactly 210s (03:30 minutes)

// Compatibility exports
export type SlideBeat = KeynoteBeat;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getPresentationBeats = (_baseline?: BaselineModelChoice) => KEYNOTE_BEATS;
export const PRESENTATION_BEATS = KEYNOTE_BEATS;
export const TOTAL_PRESENTATION_SECONDS = TOTAL_KEYNOTE_SECONDS;
