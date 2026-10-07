/**
 * Native PowerPoint (.pptx) Presentation Generator
 * Generates an authentic Microsoft PowerPoint widescreen 16:9 presentation (.pptx)
 * with Apple keynote aesthetics, dark theme, metric boxes, comparison tables,
 * and embedded slide speaker notes for Presenter View.
 */

import pptxgen from 'pptxgenjs';
import { KEYNOTE_BEATS } from '../data/presentationSlides';
import { GROUP_INFO, VALIDATION_METRICS } from '../data/forecastingData';

export async function generateNativePPTX(): Promise<void> {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Group 7 (Aligato, Ansay, Villagracia)';
  pptx.company = 'Cebu Technological University - Main Campus';
  pptx.subject = 'IE-PC 3112: Operations Management 1';
  pptx.title = 'The Forecast: Port of Los Angeles Monthly Export Volume (TEUs)';

  // Color Palette
  const BG_COLOR = '060B14';
  const CARD_BG = '0B2545';
  const BORDER_COLOR = '1B6CA8';
  const AMBER = 'F2A541';
  const SKY = '38BDF8';
  const WHITE = 'FFFFFF';
  const SLATE = '94A3B8';
  const LIGHT_SLATE = 'CBD5E1';
  const EMERALD = '10B981';
  const ROSE = 'F43F5E';

  // =========================================================================
  // SLIDE 0: Prologue — Meet Group 7 (Section D10 Forecasters Lineup)
  // =========================================================================
  {
    const s0 = pptx.addSlide();
    s0.background = { color: BG_COLOR };

    s0.addText('PROLOGUE: THE FORECASTERS · SECTION D10', {
      x: 0.8, y: 0.5, w: 8.5, h: 0.3,
      fontSize: 11, fontFace: 'Helvetica', color: SKY, bold: true, charSpacing: 2
    });

    s0.addText('Meet Group 7: Turning Port Data into Operations', {
      x: 0.8, y: 0.85, w: 10.0, h: 0.8,
      fontSize: 34, fontFace: 'Helvetica', color: WHITE, bold: false
    });

    s0.addText('Applied Study 1 · Port of Los Angeles Monthly Total Exports (TEUs) · BSIE 3-E', {
      x: 0.8, y: 1.65, w: 10.0, h: 0.3,
      fontSize: 13, fontFace: 'Helvetica', color: SLATE
    });

    // 3 Member Cards
    const members = [
      {
        name: 'Aligato, Elaiza Jane',
        role: 'Lead Analyst & Time-Series Specialist',
        motto: '“Sees the Signal & Seasonality”',
        badges: 'ARIMA (1,1,0) · ETS α=0.50 · Trend Decomposition',
        tag: 'SPECIALIST 1 OF 3',
        color: SKY
      },
      {
        name: 'Ansay, Rash Mae Crystelle C.',
        role: 'Port Operations & Logistics Planner',
        motto: '“Sees the Operational Capacity”',
        badges: 'Berth Scheduling · Yard Staging · TEU Throughput',
        tag: 'GROUP LEADER · SPECIALIST 2',
        color: AMBER
      },
      {
        name: 'Villagracia, Mylene Joy',
        role: 'Validation & ML Engineer',
        motto: '“Sees the Predictive Accuracy”',
        badges: 'MAE / RMSE · Random Forest · Lagged Regression',
        tag: 'SPECIALIST 3 OF 3',
        color: EMERALD
      }
    ];

    members.forEach((m, idx) => {
      const x = 0.8 + idx * 3.4;
      s0.addShape(pptx.ShapeType.roundRect, {
        x, y: 2.1, w: 3.2, h: 4.1,
        fill: { color: CARD_BG },
        line: { color: m.color === AMBER ? AMBER : BORDER_COLOR, width: m.color === AMBER ? 2 : 1.2 },
        rectRadius: 0.15
      });

      s0.addText(m.tag, {
        x: x + 0.2, y: 2.3, w: 2.8, h: 0.25,
        fontSize: 9, fontFace: 'Helvetica', color: m.color, bold: true, charSpacing: 1
      });

      s0.addText(m.name, {
        x: x + 0.2, y: 2.65, w: 2.8, h: 0.6,
        fontSize: 17, fontFace: 'Helvetica', color: WHITE, bold: true
      });

      s0.addText(m.role, {
        x: x + 0.2, y: 3.3, w: 2.8, h: 0.45,
        fontSize: 11, fontFace: 'Helvetica', color: m.color, bold: true
      });

      s0.addText(m.motto, {
        x: x + 0.2, y: 3.85, w: 2.8, h: 0.5,
        fontSize: 11, fontFace: 'Helvetica', color: LIGHT_SLATE, italic: true
      });

      s0.addText('CORE SKILL BADGES', {
        x: x + 0.2, y: 4.5, w: 2.8, h: 0.25,
        fontSize: 9, fontFace: 'Helvetica', color: SLATE, bold: true
      });

      s0.addText(m.badges, {
        x: x + 0.2, y: 4.8, w: 2.8, h: 1.1,
        fontSize: 10.5, fontFace: 'Helvetica', color: WHITE, lineSpacingMultiple: 1.2
      });
    });

    s0.addText('IE-PC 3112: Operations Management 1 · Cebu Technological University – Main Campus · Engr. Lyndrian Shalom R. Baclayon', {
      x: 0.8, y: 6.5, w: 10.0, h: 0.3,
      fontSize: 10, fontFace: 'Helvetica', color: SLATE
    });

    s0.addNotes(`[PROLOGUE NOTES - 25s - Speaker: ${KEYNOTE_BEATS[0].speaker}]\n${KEYNOTE_BEATS[0].livePresenterPrompt}`);
  }

  // =========================================================================
  // SLIDE 1: Title & Operational Problem (Feb 2023 Drop Anomaly)
  // =========================================================================
  {
    const s1 = pptx.addSlide();
    s1.background = { color: BG_COLOR };

    // Header badge
    s1.addText('ACT I: MARITIME TRADE & THE FEBRUARY 2023 SHOCK', {
      x: 0.8, y: 0.6, w: 8.5, h: 0.3,
      fontSize: 11, fontFace: 'Helvetica', color: SKY, bold: true, charSpacing: 2
    });

    s1.addText('36 Months. One Question.', {
      x: 0.8, y: 0.95, w: 10.0, h: 0.9,
      fontSize: 40, fontFace: 'Helvetica', color: WHITE, bold: false
    });

    s1.addText('Port of Los Angeles Monthly Export Volume (TEUs) · Jan 2022 to Dec 2024', {
      x: 0.8, y: 1.85, w: 10.0, h: 0.4,
      fontSize: 14, fontFace: 'Helvetica', color: SLATE
    });

    // Left Metric Box: Feb 2023 Drop
    s1.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 2.5, w: 4.8, h: 2.8,
      fill: { color: CARD_BG },
      line: { color: BORDER_COLOR, width: 1.5 },
      rectRadius: 0.15
    });

    s1.addText('STRUCTURAL SHOCK EVENT', {
      x: 1.1, y: 2.7, w: 4.2, h: 0.3,
      fontSize: 10, fontFace: 'Helvetica', color: AMBER, bold: true
    });

    s1.addText('236,264 TEUs', {
      x: 1.1, y: 3.0, w: 4.2, h: 0.7,
      fontSize: 32, fontFace: 'Helvetica', color: WHITE, bold: true
    });

    s1.addText('February 2023 recorded an unprecedented -32.0% volume collapse — the lowest in the entire 36-month series. Standard static forecasting fails during such post-shock rebounds.', {
      x: 1.1, y: 3.7, w: 4.2, h: 1.3,
      fontSize: 12, fontFace: 'Helvetica', color: LIGHT_SLATE, lineSpacingMultiple: 1.2
    });

    // Right Metric Box: Zero Linear Correlation
    s1.addShape(pptx.ShapeType.roundRect, {
      x: 6.0, y: 2.5, w: 4.8, h: 2.8,
      fill: { color: CARD_BG },
      line: { color: BORDER_COLOR, width: 1.5 },
      rectRadius: 0.15
    });

    s1.addText('LINEAR REGRESSION CORRELATION', {
      x: 6.3, y: 2.7, w: 4.2, h: 0.3,
      fontSize: 10, fontFace: 'Helvetica', color: SKY, bold: true
    });

    s1.addText('r = −0.39', {
      x: 6.3, y: 3.0, w: 4.2, h: 0.7,
      fontSize: 36, fontFace: 'Helvetica', color: AMBER, bold: true
    });

    s1.addText('Correlation between volume and time slopes downward (r = −0.39, −2,216 TEUs/month). It describes the 2022 decline and nothing that came after; projecting a straight line on this volatile series is an operational hazard.', {
      x: 6.3, y: 3.7, w: 4.2, h: 1.3,
      fontSize: 12, fontFace: 'Helvetica', color: LIGHT_SLATE, lineSpacingMultiple: 1.2
    });

    // Footer
    s1.addText(`IE-PC 3112: Operations Management 1 · Group 7 (BSIE 3-E) · Speaker: ${KEYNOTE_BEATS[1].speaker}`, {
      x: 0.8, y: 6.5, w: 10.0, h: 0.3,
      fontSize: 10, fontFace: 'Helvetica', color: SLATE
    });

    // Speaker Notes for PowerPoint Presenter View
    s1.addNotes(`[SLIDE 1 NOTES - 40s - Speaker: ${KEYNOTE_BEATS[1].speaker}]\n${KEYNOTE_BEATS[1].livePresenterPrompt}`);
  }

  // =========================================================================
  // SLIDE 2: Four Conventional Approaches (SMA, WMA, ETS, Trend)
  // =========================================================================
  {
    const s2 = pptx.addSlide();
    s2.background = { color: BG_COLOR };

    s2.addText('ACT I: CONVENTIONAL FORECASTING RESULTS', {
      x: 0.8, y: 0.6, w: 8.5, h: 0.3,
      fontSize: 11, fontFace: 'Helvetica', color: SKY, bold: true, charSpacing: 2
    });

    s2.addText('Four Conventional Contenders', {
      x: 0.8, y: 0.95, w: 10.0, h: 0.8,
      fontSize: 36, fontFace: 'Helvetica', color: WHITE, bold: false
    });

    s2.addText('Tested on the 30 Development Months (Jan 2022 – Jun 2024)', {
      x: 0.8, y: 1.75, w: 10.0, h: 0.3,
      fontSize: 13, fontFace: 'Helvetica', color: SLATE
    });

    // 4 Model Cards Grid
    const cards = [
      { name: '3-Period SMA', formula: 'Avg(t-1, t-2, t-3)', mae: '33,428', mape: '9.71%', tag: 'Simple Baseline', color: SKY },
      { name: '3-Period WMA', formula: 'Weights: 0.50, 0.30, 0.20', mae: '32,142', mape: '9.31%', tag: 'Weighted Buffer', color: SKY },
      { name: 'Exp. Smoothing', formula: 'Alpha = 0.50', mae: '30,596', mape: '8.80%', tag: 'Lowest Dev Error ★', color: AMBER },
      { name: 'Trend Projection', formula: 'y = 411,621 - 2,216*t', mae: '35,201', mape: '10.12%', tag: 'Eliminated (r = -0.39)', color: ROSE },
    ];

    cards.forEach((c, idx) => {
      const x = 0.8 + idx * 2.55;
      s2.addShape(pptx.ShapeType.roundRect, {
        x, y: 2.3, w: 2.4, h: 3.8,
        fill: { color: CARD_BG },
        line: { color: c.color === AMBER ? AMBER : BORDER_COLOR, width: c.color === AMBER ? 2 : 1 },
        rectRadius: 0.15
      });

      s2.addText(c.tag, {
        x: x + 0.15, y: 2.5, w: 2.1, h: 0.3,
        fontSize: 9.5, fontFace: 'Helvetica', color: c.color, bold: true
      });

      s2.addText(c.name, {
        x: x + 0.15, y: 2.85, w: 2.1, h: 0.6,
        fontSize: 16, fontFace: 'Helvetica', color: WHITE, bold: true
      });

      s2.addText(c.formula, {
        x: x + 0.15, y: 3.5, w: 2.1, h: 0.4,
        fontSize: 10, fontFace: 'Helvetica', color: LIGHT_SLATE
      });

      // MAE Box
      s2.addText('DEV MAE', {
        x: x + 0.15, y: 4.1, w: 2.1, h: 0.25,
        fontSize: 9, fontFace: 'Helvetica', color: SLATE
      });
      s2.addText(c.mae, {
        x: x + 0.15, y: 4.35, w: 2.1, h: 0.5,
        fontSize: 20, fontFace: 'Helvetica', color: c.color, bold: true
      });

      // MAPE Box
      s2.addText('DEV MAPE', {
        x: x + 0.15, y: 5.0, w: 2.1, h: 0.25,
        fontSize: 9, fontFace: 'Helvetica', color: SLATE
      });
      s2.addText(c.mape, {
        x: x + 0.15, y: 5.25, w: 2.1, h: 0.4,
        fontSize: 16, fontFace: 'Helvetica', color: LIGHT_SLATE, bold: true
      });
    });

    s2.addText(`IE-PC 3112: Operations Management 1 · Group 7 · Speaker: ${KEYNOTE_BEATS[2].speaker}`, {
      x: 0.8, y: 6.5, w: 10.0, h: 0.3,
      fontSize: 10, fontFace: 'Helvetica', color: SLATE
    });

    s2.addNotes(`[SLIDE 2 NOTES - 35s - Speaker: ${KEYNOTE_BEATS[2].speaker}]\n${KEYNOTE_BEATS[2].livePresenterPrompt}`);
  }

  // =========================================================================
  // SLIDE 3: Conventional Baseline Selection (ETS α=0.50 Locked)
  // =========================================================================
  {
    const s3 = pptx.addSlide();
    s3.background = { color: BG_COLOR };

    s3.addText('ACT II: CONVENTIONAL OM BASELINE SELECTION', {
      x: 0.8, y: 0.6, w: 8.5, h: 0.3,
      fontSize: 11, fontFace: 'Helvetica', color: SKY, bold: true, charSpacing: 2
    });

    s3.addText('The Conventional Call', {
      x: 0.8, y: 0.95, w: 10.0, h: 0.8,
      fontSize: 36, fontFace: 'Helvetica', color: WHITE, bold: false
    });

    // Amber Hero Callout Banner
    s3.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 2.0, w: 10.0, h: 1.5,
      fill: { color: CARD_BG },
      line: { color: AMBER, width: 2 },
      rectRadius: 0.15
    });

    s3.addText('OFFICIALLY LOCKED BASELINE BEFORE VALIDATION', {
      x: 1.1, y: 2.2, w: 9.4, h: 0.3,
      fontSize: 10, fontFace: 'Helvetica', color: AMBER, bold: true, charSpacing: 1
    });

    s3.addText('Exponential Smoothing (α = 0.50)', {
      x: 1.1, y: 2.5, w: 9.4, h: 0.7,
      fontSize: 30, fontFace: 'Helvetica', color: WHITE, bold: true
    });

    // 3 Metric Sub-Boxes
    const devMetrics = [
      { label: 'DEVELOPMENT MAE', val: '30,595.71 TEUs', desc: 'Lowest across all development contenders' },
      { label: 'DEVELOPMENT MAPE', val: '8.80%', desc: 'Superior tracking of post-shock trajectory' },
      { label: 'DECISION ADVANTAGE', val: 'Dynamic Adaptability', desc: 'Reacts fast to shifts without severe noise overfitting' }
    ];

    devMetrics.forEach((m, idx) => {
      const x = 0.8 + idx * 3.4;
      s3.addShape(pptx.ShapeType.roundRect, {
        x, y: 3.8, w: 3.2, h: 2.3,
        fill: { color: CARD_BG },
        line: { color: BORDER_COLOR, width: 1 },
        rectRadius: 0.15
      });

      s3.addText(m.label, {
        x: x + 0.2, y: 4.0, w: 2.8, h: 0.3,
        fontSize: 10, fontFace: 'Helvetica', color: SKY, bold: true
      });

      s3.addText(m.val, {
        x: x + 0.2, y: 4.35, w: 2.8, h: 0.5,
        fontSize: 18, fontFace: 'Helvetica', color: WHITE, bold: true
      });

      s3.addText(m.desc, {
        x: x + 0.2, y: 4.95, w: 2.8, h: 0.9,
        fontSize: 11, fontFace: 'Helvetica', color: LIGHT_SLATE
      });
    });

    s3.addText(`IE-PC 3112: Operations Management 1 · Group 7 · Speaker: ${KEYNOTE_BEATS[3].speaker}`, {
      x: 0.8, y: 6.5, w: 10.0, h: 0.3,
      fontSize: 10, fontFace: 'Helvetica', color: SLATE
    });

    s3.addNotes(`[SLIDE 3 NOTES - 30s - Speaker: ${KEYNOTE_BEATS[3].speaker}]\n${KEYNOTE_BEATS[3].livePresenterPrompt}`);
  }

  // =========================================================================
  // SLIDE 4: Advanced Statistical & ML Challengers (ARIMA, Lagged LR, Random Forest)
  // =========================================================================
  {
    const s4 = pptx.addSlide();
    s4.background = { color: BG_COLOR };

    s4.addText('ACT II: STATISTICAL & MACHINE LEARNING RESULTS', {
      x: 0.8, y: 0.6, w: 8.5, h: 0.3,
      fontSize: 11, fontFace: 'Helvetica', color: SKY, bold: true, charSpacing: 2
    });

    s4.addText('The Algorithmic Challengers', {
      x: 0.8, y: 0.95, w: 10.0, h: 0.8,
      fontSize: 36, fontFace: 'Helvetica', color: WHITE, bold: false
    });

    s4.addText('Python Implementations using Instructor Code 1–15 on Same 30/6 Split', {
      x: 0.8, y: 1.75, w: 10.0, h: 0.3,
      fontSize: 13, fontFace: 'Helvetica', color: SLATE
    });

    // 3 Advanced Model Cards
    const mlCards = [
      {
        name: 'ARIMA (1,1,0)',
        type: 'Statistical Time Series',
        stat: 'AIC: 701.43',
        desc: 'Evaluated 6 candidate orders; order (1,1,0) won with lowest AIC. Employs 1st differencing and 1 autoregressive lag to handle non-stationarity.',
        highlight: 'Optimal Order ★',
        color: AMBER
      },
      {
        name: 'Lagged Linear Reg.',
        type: 'Econometric Autoregression',
        stat: '3 Lagged Predictors',
        desc: 'Uses the three prior months (t-1, t-2, t-3) as independent features to forecast next month via rolling regression.',
        highlight: 'Feature Engineering',
        color: SKY
      },
      {
        name: 'Random Forest',
        type: 'Ensemble Machine Learning',
        stat: '100 Trees · Depth 3',
        desc: 'Non-linear decision tree ensemble with random_state=42. Built to capture intricate interactions across rolling historical lags.',
        highlight: 'Complex Ensemble',
        color: SLATE
      }
    ];

    mlCards.forEach((c, idx) => {
      const x = 0.8 + idx * 3.4;
      s4.addShape(pptx.ShapeType.roundRect, {
        x, y: 2.3, w: 3.2, h: 3.8,
        fill: { color: CARD_BG },
        line: { color: c.color === AMBER ? AMBER : BORDER_COLOR, width: c.color === AMBER ? 2 : 1 },
        rectRadius: 0.15
      });

      s4.addText(c.highlight, {
        x: x + 0.2, y: 2.5, w: 2.8, h: 0.3,
        fontSize: 10, fontFace: 'Helvetica', color: c.color, bold: true
      });

      s4.addText(c.name, {
        x: x + 0.2, y: 2.85, w: 2.8, h: 0.5,
        fontSize: 20, fontFace: 'Helvetica', color: WHITE, bold: true
      });

      s4.addText(c.type, {
        x: x + 0.2, y: 3.4, w: 2.8, h: 0.3,
        fontSize: 11, fontFace: 'Helvetica', color: SKY
      });

      s4.addText(c.stat, {
        x: x + 0.2, y: 3.8, w: 2.8, h: 0.5,
        fontSize: 20, fontFace: 'Helvetica', color: c.color, bold: true
      });

      s4.addText(c.desc, {
        x: x + 0.2, y: 4.4, w: 2.8, h: 1.4,
        fontSize: 11, fontFace: 'Helvetica', color: LIGHT_SLATE, lineSpacingMultiple: 1.15
      });
    });

    s4.addText(`IE-PC 3112: Operations Management 1 · Group 7 · Speaker: ${KEYNOTE_BEATS[4].speaker}`, {
      x: 0.8, y: 6.5, w: 10.0, h: 0.3,
      fontSize: 10, fontFace: 'Helvetica', color: SLATE
    });

    s4.addNotes(`[SLIDE 4 NOTES - 40s - Speaker: ${KEYNOTE_BEATS[4].speaker}]\n${KEYNOTE_BEATS[4].livePresenterPrompt}`);
  }

  // =========================================================================
  // SLIDE 5: Validation Reveal Across All 6 Metrics (MAE, MSE, RMSE, MAPE, SMAPE, MPE)
  // =========================================================================
  {
    const s5 = pptx.addSlide();
    s5.background = { color: BG_COLOR };

    s5.addText('ACT III: THE 6-METRIC EVIDENCE REVEAL', {
      x: 0.8, y: 0.5, w: 8.5, h: 0.3,
      fontSize: 11, fontFace: 'Helvetica', color: SKY, bold: true, charSpacing: 2
    });

    s5.addText('Validation Accuracy Across All 6 Metrics', {
      x: 0.8, y: 0.8, w: 10.0, h: 0.7,
      fontSize: 32, fontFace: 'Helvetica', color: WHITE, bold: false
    });

    s5.addText('Evaluation on Unseen Holdout Months 31–36 (Jul–Dec 2024 · Average: 445,126 TEUs)', {
      x: 0.8, y: 1.5, w: 10.0, h: 0.3,
      fontSize: 12, fontFace: 'Helvetica', color: SLATE
    });

    // Formatted Table of All Validation Metrics
    const headers = [
      { text: 'Rank & Model', options: { fill: { color: '1B6CA8' }, color: WHITE, bold: true, fontSize: 10 } },
      { text: 'Family', options: { fill: { color: '1B6CA8' }, color: WHITE, bold: true, fontSize: 10 } },
      { text: 'MAE (TEUs)', options: { fill: { color: '1B6CA8' }, color: WHITE, bold: true, fontSize: 10 } },
      { text: 'RMSE', options: { fill: { color: '1B6CA8' }, color: WHITE, bold: true, fontSize: 10 } },
      { text: 'MAPE (%)', options: { fill: { color: '1B6CA8' }, color: WHITE, bold: true, fontSize: 10 } },
      { text: 'SMAPE (%)', options: { fill: { color: '1B6CA8' }, color: WHITE, bold: true, fontSize: 10 } },
      { text: 'MPE (%)', options: { fill: { color: '1B6CA8' }, color: WHITE, bold: true, fontSize: 10 } }
    ];

    const rows = [
      ['#1 ARIMA (1,1,0) ★', 'Statistical', '20,919', '24,426', '4.71%', '4.82%', '+2.43%'],
      ['#2 ETS α = 0.80', 'Conventional', '22,952', '26,323', '5.17%', '5.31%', '+2.90%'],
      ['#3 ETS α = 0.50 (Selected)', 'Conventional', '27,725', '33,064', '6.22%', '6.49%', '+4.93%'],
      ['#4 3-Period WMA', 'Conventional', '28,473', '32,962', '6.41%', '6.66%', '+4.12%'],
      ['#5 3-Period SMA', 'Conventional', '31,927', '37,934', '7.19%', '7.53%', '+4.96%'],
      ['#6 Random Forest', 'Machine Learning', '37,138', '42,988', '8.31%', '8.79%', '+7.34%'],
      ['#7 Lagged Linear Reg.', 'Machine Learning', '37,990', '41,559', '8.48%', '8.93%', '+8.48%'],
      ['#8 Trend Projection', 'Conventional', '52,142', '53,363', '11.66%', '12.41%', '+11.66%']
    ];

    const tableData = [
      headers,
      ...rows.map((r, i) => r.map((cell, ci) => ({
        text: cell,
        options: {
          fill: { color: i === 0 ? '163860' : i % 2 === 0 ? '081528' : '0B2545' },
          color: i === 0 ? AMBER : ci === 0 ? WHITE : LIGHT_SLATE,
          bold: i === 0,
          fontSize: 9.5
        }
      })))
    ];

    s5.addTable(tableData, {
      x: 0.8, y: 1.9, w: 10.0,
      colW: [2.6, 1.4, 1.2, 1.2, 1.2, 1.2, 1.2],
      border: { pt: 0.5, color: '1E293B' },
      align: 'left'
    });

    // Key Finding Banner below table
    s5.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 5.5, w: 10.0, h: 0.8,
      fill: { color: '1E3A5F' },
      line: { color: AMBER, width: 1 },
      rectRadius: 0.1
    });

    s5.addText('KEY VALIDATION VERDICT: ARIMA (1,1,0) won on every metric by a ~25% error margin. Machine learning models overfit and landed behind four conventional baselines.', {
      x: 1.0, y: 5.6, w: 9.6, h: 0.6,
      fontSize: 11, fontFace: 'Helvetica', color: WHITE, bold: true
    });

    s5.addText(`IE-PC 3112: Operations Management 1 · Group 7 · Speaker: ${KEYNOTE_BEATS[5].speaker}`, {
      x: 0.8, y: 6.5, w: 10.0, h: 0.3,
      fontSize: 10, fontFace: 'Helvetica', color: SLATE
    });

    s5.addNotes(`[SLIDE 5 NOTES - 55s - Speaker: ${KEYNOTE_BEATS[5].speaker}]\n${KEYNOTE_BEATS[5].livePresenterPrompt}`);
  }

  // =========================================================================
  // SLIDE 6: Operations Management Recommendation & Human Oversight
  // =========================================================================
  {
    const s6 = pptx.addSlide();
    s6.background = { color: BG_COLOR };

    s6.addText('ACT III: OPERATIONAL DECISIONS & INDUSTRY 5.0', {
      x: 0.8, y: 0.5, w: 8.5, h: 0.3,
      fontSize: 11, fontFace: 'Helvetica', color: SKY, bold: true, charSpacing: 2
    });

    s6.addText('Operations Action & Human Oversight', {
      x: 0.8, y: 0.85, w: 10.0, h: 0.7,
      fontSize: 34, fontFace: 'Helvetica', color: WHITE, bold: false
    });

    // 3 Operational Pillars
    const pillars = [
      {
        step: '1. Capacity Floor',
        headline: 'Treat ARIMA as Minimum',
        body: 'Under-forecasting costs $50,000/day in vessel demurrage. Port management must treat ARIMA (1,1,0) as a hard operational floor.',
        color: AMBER
      },
      {
        step: '2. Contingency Buffer',
        headline: '+7% Longshore Gang Buffer',
        body: 'Management stages crane operators and yard equipment with a 7% buffer to absorb container trade shocks and vessel bunching.',
        color: EMERALD
      },
      {
        step: '3. Human Oversight',
        headline: 'Industry 5.0 Governance',
        body: 'Algorithms inform; humans decide. Revalidate quarterly. Human superintendents retain final sign-off during labor and tariff shocks.',
        color: SKY
      }
    ];

    pillars.forEach((p, idx) => {
      const x = 0.8 + idx * 3.4;
      s6.addShape(pptx.ShapeType.roundRect, {
        x, y: 1.7, w: 3.2, h: 2.7,
        fill: { color: CARD_BG },
        line: { color: BORDER_COLOR, width: 1.5 },
        rectRadius: 0.15
      });

      s6.addText(p.step, {
        x: x + 0.2, y: 1.85, w: 2.8, h: 0.3,
        fontSize: 11, fontFace: 'Helvetica', color: p.color, bold: true
      });

      s6.addText(p.headline, {
        x: x + 0.2, y: 2.15, w: 2.8, h: 0.5,
        fontSize: 15, fontFace: 'Helvetica', color: WHITE, bold: true
      });

      s6.addText(p.body, {
        x: x + 0.2, y: 2.7, w: 2.8, h: 1.6,
        fontSize: 10.5, fontFace: 'Helvetica', color: LIGHT_SLATE, lineSpacingMultiple: 1.15
      });
    });

    // Final Verdict & Recommendation Banner
    s6.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 4.6, w: 10.0, h: 1.4,
      fill: { color: '091728' },
      line: { color: AMBER, width: 1.5 },
      rectRadius: 0.12
    });

    s6.addText('“USE ARIMA (1,1,0) AS PRIMARY FORECAST · REVALIDATE QUARTERLY · HUMAN SIGN-OFF MANDATORY”', {
      x: 1.1, y: 4.75, w: 9.4, h: 0.5,
      fontSize: 13, fontFace: 'Helvetica', color: AMBER, bold: true, align: 'center'
    });

    s6.addText('IE-PC 3112: Operations Management 1 · Group 7 · BSIE 3-E · Cebu Technological University · Engr. Lyndrian Shalom R. Baclayon', {
      x: 1.1, y: 5.35, w: 9.4, h: 0.4,
      fontSize: 9.5, fontFace: 'Helvetica', color: SLATE, align: 'center'
    });

    s6.addNotes(`[SLIDE 6 NOTES - 45s - Speaker: ${KEYNOTE_BEATS[6].speaker}]\n${KEYNOTE_BEATS[6].livePresenterPrompt}`);
  }

  // Trigger browser download of real .pptx
  await pptx.writeFile({ fileName: `OM1_Group7_Forecasting_Presentation.pptx` });
}
