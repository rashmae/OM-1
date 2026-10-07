/**
 * Time-Series Data Behavior: 4 Classical Components & Operational Effects
 * Port of Los Angeles Monthly Export Volume (TEUs) · Jan 2022 to Dec 2024 (36 Months)
 * Applied Study 1: Real-Data Forecasting Decision Challenge
 * IE-PC 3112: Operations Management 1 · Group 7 · Cebu Technological University
 * 
 * The 4 Classical Components of Time-Series:
 * 1. Trend (T)       - Long-term secular direction (r ≈ 0.06, essentially flat)
 * 2. Seasonal (S)    - Periodic 12-month rhythm (Q3 summer/harvest peak vs Q1 winter lull)
 * 3. Cyclical (C)    - Multi-year macroeconomic wave (2022 post-pandemic high -> 2023 destocking -> 2024 recovery)
 * 4. Randomness (R)  - Unpredictable irregular noise & structural black-swan shock (Feb 2023 collapse to 236,264 TEUs)
 */

export interface ComponentDataPoint {
  period: number;
  monthName: string;
  actual: number;
  trend: number;
  seasonal: number;
  cyclical: number;
  randomness: number;
  reconstructed: number;
}

export interface TimeSeriesComponentMeta {
  id: 'trend' | 'seasonal' | 'cyclical' | 'randomness';
  name: string;
  symbol: string;
  mathFormula: string;
  color: string;
  secondaryColor: string;
  tagline: string;
  empiricalInsight: string;
  varianceContributionPct: number;
  operationalEffect: {
    category: string;
    headline: string;
    impactSummary: string;
    terminalAction: string;
    riskIfIgnored: string;
  };
  visualEffectStyle: {
    stroke: string;
    strokeWidth: number;
    dashArray?: string;
    glowColor: string;
    animationType: string;
  };
}

// 12-month seasonal indices (additive TEU deviation from annual average)
// Derived from 36 months of Port of LA export historical patterns
export const MONTHLY_SEASONAL_INDICES: { month: string; monthIndex: number; deviationTEUs: number; indexFactor: number; description: string }[] = [
  { month: "Jan", monthIndex: 1, deviationTEUs: -12450, indexFactor: 0.968, description: "Post-holiday cargo cool-down" },
  { month: "Feb", monthIndex: 2, deviationTEUs: -42800, indexFactor: 0.890, description: "Asian Lunar New Year factory shutdowns & blanked sailings" },
  { month: "Mar", monthIndex: 3, deviationTEUs: -18200, indexFactor: 0.953, description: "Gradual factory restart in East Asia" },
  { month: "Apr", monthIndex: 4, deviationTEUs: -8400,  indexFactor: 0.978, description: "Spring agricultural and consumer baseline" },
  { month: "May", monthIndex: 5, deviationTEUs: +14600, indexFactor: 1.037, description: "Summer retail inventory pipeline kickoff" },
  { month: "Jun", monthIndex: 6, deviationTEUs: +18900, indexFactor: 1.048, description: "Mid-year transpacific shipping ramp-up" },
  { month: "Jul", monthIndex: 7, deviationTEUs: +24800, indexFactor: 1.063, description: "Peak export container repositioning & agricultural harvest" },
  { month: "Aug", monthIndex: 8, deviationTEUs: +28200, indexFactor: 1.072, description: "High-volume pre-holiday peak loading window" },
  { month: "Sep", monthIndex: 9, deviationTEUs: +21500, indexFactor: 1.055, description: "Peak harvest and holiday retail exports" },
  { month: "Oct", monthIndex: 10, deviationTEUs: +6400, indexFactor: 1.016, description: "Late-season retail fulfillment" },
  { month: "Nov", monthIndex: 11, deviationTEUs: -14200, indexFactor: 0.964, description: "Holiday cargo taper off" },
  { month: "Dec", monthIndex: 12, deviationTEUs: -18150, indexFactor: 0.954, description: "Year-end fiscal close and winter dock operations" }
];

export const TIME_SERIES_COMPONENTS_META: Record<'trend' | 'seasonal' | 'cyclical' | 'randomness', TimeSeriesComponentMeta> = {
  trend: {
    id: 'trend',
    name: 'Trend Component',
    symbol: 'T',
    mathFormula: 'T_t = a + b \\cdot t \\quad (r = -0.39 \\text{ in Dev, } b = -2,216 \\text{ TEUs/mo})',
    color: '#38BDF8', // Cyan / Sky
    secondaryColor: '#0284C7',
    tagline: 'Secular Trend: Negative In-Sample Drift (r = -0.39)',
    empiricalInsight: 'In development (Months 1–30), linear regression yields r = -0.39 with a downward slope of -2,216 TEUs/month driven by the 2022 freight contraction. Across all 36 months, secular trend flattens (r = 0.06), proving linear regression fails to track operational cargo swings.',
    varianceContributionPct: 3.8,
    operationalEffect: {
      category: 'CapEx & Infrastructure Planning',
      headline: 'Berth Allocation & Capital Gantry Crane Investment',
      impactSummary: 'Because linear trend is distorted by the 2022 decline (r = -0.39) and secular growth is negligible, port authorities cannot rely on straight-line extrapolation.',
      terminalAction: 'Base long-term berth expansion on contract-backed ocean carrier alliance commitments rather than straight-line volume growth extrapolations.',
      riskIfIgnored: 'Risk of overbuilding multi-million dollar container berths and automated stacking yards that remain chronically underutilized.'
    },
    visualEffectStyle: {
      stroke: '#38BDF8',
      strokeWidth: 3,
      glowColor: 'rgba(56, 189, 248, 0.65)',
      animationType: 'laser_sweep'
    }
  },

  seasonal: {
    id: 'seasonal',
    name: 'Seasonal Component',
    symbol: 'S',
    mathFormula: 'S_t = \\mu_{\\text{month}(t)} - \\bar{Y} \\quad (\\text{Period } P = 12 \\text{ Months})',
    color: '#34D399', // Emerald
    secondaryColor: '#059669',
    tagline: '12-Month Calendar Rhythm: Q3 Surge vs Q1 Winter Trough',
    empiricalInsight: 'Repeats annually with high statistical regularity. Peaks in Q3 (July–October) driven by agricultural exports and pre-holiday retail inventories (+25k to +28k TEUs). Drops sharply in Q1 (January–February) due to Asian Lunar New Year factory closures (-42k TEUs).',
    varianceContributionPct: 27.4,
    operationalEffect: {
      category: 'Labor Gang Rostering & Reefer Plugs',
      headline: 'Longshoreman Gang Requisitions & Refrigerated Yard Plugs',
      impactSummary: 'The predictable 12-month swing demands +25% seasonal scaling of longshore crane gangs and auxiliary reefer plug bays between July and October.',
      terminalAction: 'Roster +3 to +5 additional PMA/ILWU crane gangs during July–October peaks, and schedule mandatory gantry crane overhauls during the quiet February lull.',
      riskIfIgnored: 'Severe vessel demurrage penalties ($50k+/day) during Q3 gate congestion, versus excessive idle labor wages during Q1 troughs.'
    },
    visualEffectStyle: {
      stroke: '#34D399',
      strokeWidth: 3,
      glowColor: 'rgba(52, 211, 153, 0.65)',
      animationType: 'sinusoidal_wave'
    }
  },

  cyclical: {
    id: 'cyclical',
    name: 'Cyclical Component',
    symbol: 'C',
    mathFormula: 'C_t = f(\\text{Macro Macroeconomic & Trade Cycle}, \\tau \\approx 24\\text{--}36 \\text{ Mo})',
    color: '#A78BFA', // Purple
    secondaryColor: '#7C3AED',
    tagline: 'Multi-Year Macro Waves: Pandemic High -> 2023 Contraction -> 2024 Recovery',
    empiricalInsight: 'Wave-like macroeconomic swings with duration > 1 year. The dataset spans 3 distinct macroeconomic phases: 2022 post-pandemic high volume baseline (avg 415k TEUs) -> 2023 rapid inventory destocking & rate contraction (avg 350k TEUs) -> 2024 export rebound (avg 412k TEUs, +19.2% level shift).',
    varianceContributionPct: 41.2,
    operationalEffect: {
      category: 'Carrier Contracts & Dwell Tariffs',
      headline: 'Multi-Year Carrier Alliances & Yard Dwell Tariffs',
      impactSummary: 'Multi-year macroeconomic tides determine container dwell times in yards and container shipping line vessel rotation schedules.',
      terminalAction: 'Structure container yard dwell-time fee tiers and shipping alliance throughput guarantees with index-linked macroeconomic clauses rather than rigid annual escalators.',
      riskIfIgnored: 'Massive yard gridlock during unexpected macro recovery surges (+19.2% shift in 2024) or catastrophic revenue deficits during multi-year freight recessions.'
    },
    visualEffectStyle: {
      stroke: '#A78BFA',
      strokeWidth: 3.5,
      dashArray: '6 4',
      glowColor: 'rgba(167, 139, 250, 0.65)',
      animationType: 'tidal_surge'
    }
  },

  randomness: {
    id: 'randomness',
    name: 'Randomness / Irregular Component',
    symbol: 'R',
    mathFormula: 'R_t = A_t - (T_t + S_t + C_t) \\sim \\epsilon_t \\quad (\\text{Includes Feb 2023 Black Swan})',
    color: '#F2A541', // Amber / Warning
    secondaryColor: '#D97706',
    tagline: 'High-Frequency Jitter & Feb 2023 Anomaly Shock (236,264 TEUs)',
    empiricalInsight: 'Stochastic, unsystematic residual variance including weather delays, rail chokepoints, and the extreme structural shock of February 2023 (Month 14: 236,264 TEUs, -32.0% unexpected collapse). Static regression models break completely on these irregular events.',
    varianceContributionPct: 27.6,
    operationalEffect: {
      category: 'Safety Buffers & Dynamic Overrides',
      headline: 'Dynamic Yard Safety Buffer & Emergency Dispatch Clauses',
      impactSummary: 'Random shocks and structural deviations cannot be predicted by deterministic formulas; they require resilient buffer mechanisms.',
      terminalAction: 'Maintain an agile 15–20% unallocated yard stacking buffer and deploy fast-reacting adaptive smoothing (such as ETS α = 0.50 or WMA) coupled with human managerial overrides.',
      riskIfIgnored: 'Complete terminal paralysis during sudden volume crashes or rebound shocks, causing cascading transpacific supply chain bottlenecks.'
    },
    visualEffectStyle: {
      stroke: '#F2A541',
      strokeWidth: 2.5,
      glowColor: 'rgba(242, 165, 65, 0.75)',
      animationType: 'sonar_pulse'
    }
  }
};

/**
 * Pre-computed 36-Month Decomposed Series
 * Mathematical formulation: Actual(t) = Trend(t) + Seasonal(t) + Cyclical(t) + Randomness(t)
 */
export const DECOMPOSED_36_MONTH_SERIES: ComponentDataPoint[] = [
  // 2022: High pandemic baseline
  { period: 1,  monthName: "Jan 2022", actual: 437121, trend: 384200, seasonal: -12450, cyclical: +45000, randomness: +20371, reconstructed: 437121 },
  { period: 2,  monthName: "Feb 2022", actual: 430952, trend: 384512, seasonal: -42800, cyclical: +48000, randomness: +41240, reconstructed: 430952 },
  { period: 3,  monthName: "Mar 2022", actual: 460898, trend: 384824, seasonal: -18200, cyclical: +52000, randomness: +42274, reconstructed: 460898 },
  { period: 4,  monthName: "Apr 2022", actual: 429093, trend: 385136, seasonal: -8400,  cyclical: +49000, randomness: +3357,  reconstructed: 429093 },
  { period: 5,  monthName: "May 2022", actual: 466221, trend: 385448, seasonal: +14600, cyclical: +44000, randomness: +22173, reconstructed: 466221 },
  { period: 6,  monthName: "Jun 2022", actual: 428344, trend: 385760, seasonal: +18900, cyclical: +36000, randomness: -12316, reconstructed: 428344 },
  { period: 7,  monthName: "Jul 2022", actual: 444715, trend: 386072, seasonal: +24800, cyclical: +26000, randomness: +7843,  reconstructed: 444715 },
  { period: 8,  monthName: "Aug 2022", actual: 399648, trend: 386384, seasonal: +28200, cyclical: +14000, randomness: -28936, reconstructed: 399648 },
  { period: 9,  monthName: "Sep 2022", actual: 364298, trend: 386696, seasonal: +21500, cyclical: -2000,  randomness: -41898, reconstructed: 364298 },
  { period: 10, monthName: "Oct 2022", actual: 337766, trend: 387008, seasonal: +6400,  cyclical: -18000, randomness: -37642, reconstructed: 337766 },
  { period: 11, monthName: "Nov 2022", actual: 327888, trend: 387320, seasonal: -14200, cyclical: -28000, randomness: -17232, reconstructed: 327888 },
  { period: 12, monthName: "Dec 2022", actual: 368999, trend: 387632, seasonal: -18150, cyclical: -35000, randomness: +34517, reconstructed: 368999 },

  // 2023: Macroeconomic contraction and the Feb 2023 structural anomaly
  { period: 13, monthName: "Jan 2023", actual: 347493, trend: 387944, seasonal: -12450, cyclical: -42000, randomness: +13999, reconstructed: 347493 },
  { period: 14, monthName: "Feb 2023", actual: 236264, trend: 388256, seasonal: -42800, cyclical: -48000, randomness: -61192, reconstructed: 236264 }, // Feb 2023 Shock!
  { period: 15, monthName: "Mar 2023", actual: 297280, trend: 388568, seasonal: -18200, cyclical: -50000, randomness: -23088, reconstructed: 297280 },
  { period: 16, monthName: "Apr 2023", actual: 340226, trend: 388880, seasonal: -8400,  cyclical: -48000, randomness: +7746,  reconstructed: 340226 },
  { period: 17, monthName: "May 2023", actual: 367454, trend: 389192, seasonal: +14600, cyclical: -44000, randomness: +7662,  reconstructed: 367454 },
  { period: 18, monthName: "Jun 2023", actual: 395659, trend: 389504, seasonal: +18900, cyclical: -36000, randomness: +23255, reconstructed: 395659 },
  { period: 19, monthName: "Jul 2023", actual: 319441, trend: 389816, seasonal: +24800, cyclical: -26000, randomness: -69175, reconstructed: 319441 },
  { period: 20, monthName: "Aug 2023", actual: 392033, trend: 390128, seasonal: +28200, cyclical: -15000, randomness: -11295, reconstructed: 392033 },
  { period: 21, monthName: "Sep 2023", actual: 354388, trend: 390440, seasonal: +21500, cyclical: -5000,  randomness: -52552, reconstructed: 354388 },
  { period: 22, monthName: "Oct 2023", actual: 353211, trend: 390752, seasonal: +6400,  cyclical: +4000,  randomness: -47941, reconstructed: 353211 },
  { period: 23, monthName: "Nov 2023", actual: 378502, trend: 391064, seasonal: -14200, cyclical: +12000, randomness: -10362, reconstructed: 378502 },
  { period: 24, monthName: "Dec 2023", actual: 377667, trend: 391376, seasonal: -18150, cyclical: +18000, randomness: -13559, reconstructed: 377667 },

  // 2024: Recovery & Validation Period Level Shift (+19.2%)
  { period: 25, monthName: "Jan 2024", actual: 413710, trend: 391688, seasonal: -12450, cyclical: +24000, randomness: +10472, reconstructed: 413710 },
  { period: 26, monthName: "Feb 2024", actual: 372531, trend: 392000, seasonal: -42800, cyclical: +28000, randomness: -4669,  reconstructed: 372531 },
  { period: 27, monthName: "Mar 2024", actual: 362857, trend: 392312, seasonal: -18200, cyclical: +30000, randomness: -41255, reconstructed: 362857 },
  { period: 28, monthName: "Apr 2024", actual: 353155, trend: 392624, seasonal: -8400,  cyclical: +32000, randomness: -63069, reconstructed: 353155 },
  { period: 29, monthName: "May 2024", actual: 361763, trend: 392936, seasonal: +14600, cyclical: +34000, randomness: -79773, reconstructed: 361763 },
  { period: 30, monthName: "Jun 2024", actual: 398459, trend: 393248, seasonal: +18900, cyclical: +36000, randomness: -49689, reconstructed: 398459 },
  { period: 31, monthName: "Jul 2024", actual: 437961, trend: 393560, seasonal: +24800, cyclical: +38000, randomness: -18399, reconstructed: 437961 },
  { period: 32, monthName: "Aug 2024", actual: 449898, trend: 393872, seasonal: +28200, cyclical: +40000, randomness: -12174, reconstructed: 449898 },
  { period: 33, monthName: "Sep 2024", actual: 454820, trend: 394184, seasonal: +21500, cyclical: +41000, randomness: -1864,  reconstructed: 454820 },
  { period: 34, monthName: "Oct 2024", actual: 441773, trend: 394496, seasonal: +6400,  cyclical: +40000, randomness: +877,   reconstructed: 441773 },
  { period: 35, monthName: "Nov 2024", actual: 425912, trend: 394808, seasonal: -14200, cyclical: +38000, randomness: +7304,  reconstructed: 425912 },
  { period: 36, monthName: "Dec 2024", actual: 460304, trend: 395120, seasonal: -18150, cyclical: +36000, randomness: +47334, reconstructed: 460304 }
];
