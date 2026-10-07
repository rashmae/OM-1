import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RotateCcw, Sparkles, ExternalLink, Copy, Check, 
  BarChart3, LineChart, Network, Video, Layers, Sliders, ArrowRight,
  TrendingUp, CheckCircle2, AlertTriangle, ShieldCheck, Ship, Box
} from 'lucide-react';
import { 
  FULL_TIME_SERIES, 
  VALIDATION_METRICS, 
  RAW_POLA_DATA, 
  DEVELOPMENT_CONVENTIONAL_COMPARISON 
} from '../data/forecastingData';

export const MotionFXStudio: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'flourish' | 'napkin' | 'jitter' | 'embed_hub'>('flourish');
  
  // Flourish simulation state
  const [flourishMonthIndex, setFlourishMonthIndex] = useState<number>(36);
  const [isRacePlaying, setIsRacePlaying] = useState<boolean>(true);
  const [raceMetric, setRaceMetric] = useState<'mape' | 'rmse' | 'mae'>('mape');
  
  // Jitter simulation state
  const [jitterTrigger, setJitterTrigger] = useState<number>(0);
  const [selectedJitterPreset, setSelectedJitterPreset] = useState<'twist_reveal' | 'stagger_text' | 'counter_odometer' | 'amber_shockwave'>('twist_reveal');
  
  // Napkin interactive flow state
  const [activeNapkinNode, setActiveNapkinNode] = useState<string>('cliff');

  // Embed hub state
  const [flourishEmbedUrl, setFlourishEmbedUrl] = useState<string>('');
  const [activeEmbedMode, setActiveEmbedMode] = useState<'demo' | 'custom'>('demo');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Copy helper
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Flourish Race Animation Ticker
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRacePlaying) {
      interval = setInterval(() => {
        setFlourishMonthIndex(prev => {
          if (prev >= 36) return 4;
          return prev + 1;
        });
      }, 700);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRacePlaying]);

  // Current Flourish active slice
  const currentFlourishRow = FULL_TIME_SERIES[flourishMonthIndex - 1] || FULL_TIME_SERIES[35];

  // Flourish formatted data for copy
  const flourishCSVData = `Period,Month,Actual_TEUs,SMA3,WMA3,ExpSmoothing_08,TrendLine,ARIMA,RandomForest\n` + 
    FULL_TIME_SERIES.map(d => 
      `${d.period},"${d.monthName}",${d.actual},${d.sma3 || ''},${d.wma3 || ''},${d.es08 || ''},${d.trend || ''},${d.arima || ''},${d.randomForest || ''}`
    ).join('\n');

  // Napkin AI Prompt Template
  const napkinPromptText = `# Port of Los Angeles Container Forecasting Decision Architecture
Create an operational decision diagram with 4 progressive connected phases:
1. "Port Operations Stakes": 36 Months Port of LA TEU Export series (Jan 2022 - Dec 2024). Demurrage risk ($50k/day) vs Longshore labor ($42k/shift).
2. "Feb 2023 Anomaly": Sharp 24.8% drop to 82,404 TEUs due to post-COVID destocking and ILWU labor contract friction.
3. "The Trial & Occam's Razor": 3-Period WMA (Weights 0.5/0.3/0.2) delivers 4.12% MAPE. Random Forest overfits to 8.74% MAPE.
4. "Industry 5.0 Governance": Quantitative baseline runs automatically. Executive human override activates during labor strikes or tariff changes.`;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner introducing the Motion Design Suite */}
      <div className="p-6 rounded-2xl bg-[#0B2545]/90 border border-[#1B6CA8]/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>MOTION GRAPHICS & VISUALIZATION ENGINE</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white mt-1">
            Flourish · Napkin.ai · Jitter Motion Studio
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Enhance the presentation with motion effects inspired by industry leaders: <strong>App.flourish.studio</strong> (animated line & bar chart races), <strong>App.napkin.ai</strong> (conceptual flow & node diagrams), and <strong>Jitter.video</strong> (kinetic typography & spring choreography).
          </p>
        </div>

        {/* Platform Selection Switcher */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTool('flourish')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTool === 'flourish'
                ? 'bg-[#1B6CA8] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Flourish Races</span>
          </button>

          <button
            onClick={() => setActiveTool('napkin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTool === 'napkin'
                ? 'bg-[#1B6CA8] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Napkin System</span>
          </button>

          <button
            onClick={() => setActiveTool('jitter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTool === 'jitter'
                ? 'bg-[#1B6CA8] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Jitter Motion</span>
          </button>

          <button
            onClick={() => setActiveTool('embed_hub')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTool === 'embed_hub'
                ? 'bg-[#F2A541] text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Live Embed Hub</span>
          </button>
        </div>
      </div>

      {/* ================= SECTION 1: FLOURISH STUDIO RACING ENGINE ================= */}
      {activeTool === 'flourish' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Flourish Chart Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRacePlaying(!isRacePlaying)}
                className="px-3.5 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-sky-400 transition-all"
              >
                {isRacePlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isRacePlaying ? 'Pause Flourish Race' : 'Play Flourish Race'}</span>
              </button>

              <button
                onClick={() => setFlourishMonthIndex(4)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg"
                title="Reset to Month 4"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <div className="text-xs text-slate-300">
                Current Timeframe: <span className="text-white font-mono font-bold">{currentFlourishRow.monthName}</span> (Month {currentFlourishRow.period} of 36)
              </div>
            </div>

            {/* Metric Sort Switch */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Sort Ranking By:</span>
              <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
                {(['mape', 'rmse', 'mae'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setRaceMetric(m)}
                    className={`px-2.5 py-1 text-xs uppercase font-mono rounded-md ${
                      raceMetric === m ? 'bg-[#1B6CA8] text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleCopy(flourishCSVData, 'flourish')}
                className="ml-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                title="Copy dataset formatted specifically for Flourish Line Chart Race"
              >
                {copiedType === 'flourish' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'flourish' ? 'Flourish CSV Copied!' : 'Copy for Flourish'}</span>
              </button>
            </div>
          </div>

          {/* Flourish Dynamic Path Tracing Chart */}
          <div className="bg-[#0B2545]/90 border border-[#1B6CA8]/50 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider font-mono">
                  Flourish Motion Effect · Dynamic Path Tracing
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Port of Los Angeles Multi-Model Export Trajectory (TEUs)
                </h3>
              </div>
              <div className="text-xs text-slate-300 font-mono bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                Actual: <span className="text-sky-400 font-bold">{currentFlourishRow.actual.toLocaleString()} TEUs</span>
              </div>
            </div>

            {/* Live Animated SVG Line Chart */}
            <div className="h-64 w-full relative bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 overflow-hidden">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 720 180" preserveAspectRatio="none">
                {/* Horizontal Guide Grid */}
                {[40, 80, 120, 160].map(y => (
                  <line key={y} x1="0" y1={y} x2="720" y2={y} stroke="#1B6CA8" strokeOpacity="0.15" strokeDasharray="3 3" />
                ))}

                {/* Validation Boundary Line (Month 30 / Month 31) */}
                <line x1="600" y1="0" x2="600" y2="180" stroke="#F2A541" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                <text x="605" y="20" fill="#F2A541" fontSize="10" fontFamily="monospace">6-Month Blind Validation (Jul-Dec 2024)</text>

                {/* Feb 2023 Shock Zone (Period 14) */}
                <rect x="260" y="20" width="30" height="150" fill="#EF4444" fillOpacity="0.1" rx="4" />
                <text x="262" y="170" fill="#EF4444" fontSize="9" fontFamily="sans-serif">Feb 2023 Anomaly</text>

                {/* Actual Data Line (Glowing Sky Blue) */}
                {(() => {
                  const slice = FULL_TIME_SERIES.slice(0, flourishMonthIndex);
                  const points = slice.map((d, i) => {
                    const x = (i / 35) * 700 + 10;
                    // Actual range ~200,000 to ~500,000 -> scale to y: 170 to 20
                    const y = 170 - ((d.actual - 200000) / 300000) * 150;
                    return `${x},${y}`;
                  }).join(' ');

                  // Head tracker point
                  const lastPoint = slice[slice.length - 1];
                  const headX = ((slice.length - 1) / 35) * 700 + 10;
                  const headY = 170 - ((lastPoint.actual - 200000) / 300000) * 150;

                  return (
                    <g>
                      <polyline
                        points={points}
                        fill="none"
                        stroke="#38BDF8"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Flourish-style head pulse beacon */}
                      <circle cx={headX} cy={headY} r="7" fill="#38BDF8" className="animate-ping" opacity="0.7" />
                      <circle cx={headX} cy={headY} r="5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.5" />
                    </g>
                  );
                })()}

                {/* 3-Period WMA Line (Emerald Green) */}
                {(() => {
                  const slice = FULL_TIME_SERIES.slice(0, flourishMonthIndex).filter(d => d.wma3);
                  if (slice.length < 2) return null;
                  const points = slice.map(d => {
                    const x = ((d.period - 1) / 35) * 700 + 10;
                    const y = 170 - ((d.wma3! - 200000) / 300000) * 150;
                    return `${x},${y}`;
                  }).join(' ');

                  return (
                    <polyline
                      points={points}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                      opacity="0.9"
                    />
                  );
                })()}

                {/* Random Forest Line (Magenta) */}
                {(() => {
                  const slice = FULL_TIME_SERIES.slice(0, flourishMonthIndex).filter(d => d.randomForest);
                  if (slice.length < 2) return null;
                  const points = slice.map(d => {
                    const x = ((d.period - 1) / 35) * 700 + 10;
                    const y = 170 - ((d.randomForest! - 200000) / 300000) * 150;
                    return `${x},${y}`;
                  }).join(' ');

                  return (
                    <polyline
                      points={points}
                      fill="none"
                      stroke="#EC4899"
                      strokeWidth="2"
                      opacity="0.8"
                    />
                  );
                })()}
              </svg>
            </div>

            {/* Line Legend */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-1 bg-[#38BDF8] rounded-full inline-block" />
                  <span className="text-white font-semibold">Actual Exports</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-1 bg-[#10B981] rounded-full inline-block" />
                  <span className="text-emerald-400 font-semibold">3-Period WMA (Winner)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-1 bg-[#EC4899] rounded-full inline-block" />
                  <span className="text-pink-400 font-semibold">Random Forest (Overfit)</span>
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">
                Month {flourishMonthIndex} / 36
              </span>
            </div>
          </div>

          {/* Flourish Bar Chart Race (Reordering Smoothly with Motion) */}
          <div className="bg-[#0B2545]/90 border border-[#1B6CA8]/50 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider font-mono">
                  Flourish Motion Effect · Bar Chart Race
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Validation Models Ranked by {raceMetric.toUpperCase()} (Lowest Error = Top)
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                1st Place: 3-Period WMA
              </span>
            </div>

            <div className="space-y-3">
              {VALIDATION_METRICS.sort((a, b) => a[raceMetric] - b[raceMetric]).map((model, idx) => {
                const metricValue = model[raceMetric];
                const maxVal = Math.max(...VALIDATION_METRICS.map(m => m[raceMetric]));
                const barWidth = `${Math.max(15, (metricValue / maxVal) * 100)}%`;
                const isWinner = model.isRecommended;

                return (
                  <motion.div
                    key={model.name}
                    layout
                    transition={{ type: 'spring', damping: 20, stiffness: 220 }}
                    className="space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-medium">
                        <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${
                          idx === 0 ? 'bg-[#F2A541] text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>
                          #{idx + 1}
                        </span>
                        <span className={isWinner ? 'text-white font-bold' : 'text-slate-300'}>
                          {model.name}
                        </span>
                        <span className="text-[10px] text-slate-400">({model.category})</span>
                      </div>
                      <span className={`font-mono font-bold ${isWinner ? 'text-[#F2A541]' : 'text-slate-300'}`}>
                        {raceMetric === 'mape' ? `${metricValue.toFixed(2)}%` : metricValue.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full h-3.5 bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <motion.div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isWinner ? 'bg-gradient-to-r from-amber-400 to-[#F2A541]' : 'bg-gradient-to-r from-[#1B6CA8] to-sky-500'
                        }`}
                        style={{ width: barWidth }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 2: NAPKIN.AI CONCEPTUAL SYSTEM DIAGRAM ================= */}
      {activeTool === 'napkin' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider font-mono">
                App.napkin.ai Visual System Concept
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Port Operations & Forecasting Decision Flow
              </h3>
            </div>
            <button
              onClick={() => handleCopy(napkinPromptText, 'napkin')}
              className="px-3.5 py-2 rounded-xl bg-[#1B6CA8] hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              {copiedType === 'napkin' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'napkin' ? 'Prompt Copied!' : 'Copy Napkin.ai Prompt'}</span>
            </button>
          </div>

          {/* Interactive Napkin Style Diagram Canvas */}
          <div className="bg-[#0B2545]/90 border border-[#1B6CA8]/50 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="text-xs text-slate-300">
              Click any node in this interconnected operational pipeline to inspect the engineering trade-off:
            </div>

            {/* 4 Connected Nodes with pulsing connector lines */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Node 1 */}
              <div
                onClick={() => setActiveNapkinNode('berth')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  activeNapkinNode === 'berth'
                    ? 'bg-sky-500/20 border-sky-400 text-white shadow-lg'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 text-sky-300 flex items-center justify-center mb-3">
                  <Ship className="w-4 h-4" />
                </div>
                <div className="text-[10px] font-mono text-sky-400 uppercase">Phase 1</div>
                <h4 className="text-sm font-bold text-white mt-0.5">Berth & Labor Lock</h4>
                <p className="text-xs text-slate-300 mt-2">
                  Gantry crane crews ordered 24h prior. Capacity cannot scale instantly.
                </p>
              </div>

              {/* Node 2 */}
              <div
                onClick={() => setActiveNapkinNode('cliff')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  activeNapkinNode === 'cliff'
                    ? 'bg-red-500/20 border-red-400 text-white shadow-lg'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-400/40 text-red-300 flex items-center justify-center mb-3">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="text-[10px] font-mono text-red-400 uppercase">Phase 2</div>
                <h4 className="text-sm font-bold text-white mt-0.5">Feb 2023 TEU Cliff</h4>
                <p className="text-xs text-slate-300 mt-2">
                  -24.8% drop to 82,404 TEUs disrupts linear assumptions completely.
                </p>
              </div>

              {/* Node 3 */}
              <div
                onClick={() => setActiveNapkinNode('occam')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  activeNapkinNode === 'occam'
                    ? 'bg-amber-500/20 border-[#F2A541] text-white shadow-lg'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#F2A541]/20 border border-[#F2A541]/40 text-[#F2A541] flex items-center justify-center mb-3">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-[10px] font-mono text-[#F2A541] uppercase">Phase 3</div>
                <h4 className="text-sm font-bold text-white mt-0.5">Occam's Razor Verdict</h4>
                <p className="text-xs text-slate-300 mt-2">
                  3-Period WMA (4.12% MAPE) beats overfitted Random Forest (8.74%).
                </p>
              </div>

              {/* Node 4 */}
              <div
                onClick={() => setActiveNapkinNode('human')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  activeNapkinNode === 'human'
                    ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-[10px] font-mono text-emerald-400 uppercase">Phase 4</div>
                <h4 className="text-sm font-bold text-white mt-0.5">Industry 5.0 Override</h4>
                <p className="text-xs text-slate-300 mt-2">
                  Human managers step in when external labor negotiations or tariffs strike.
                </p>
              </div>
            </div>

            {/* Active Node Deep-Dive Panel */}
            <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider font-mono">
                  Napkin Visual Deep-Dive: {activeNapkinNode.toUpperCase()}
                </span>
                <span className="text-[11px] text-slate-400">Interactive Conceptual Architecture</span>
              </div>

              {activeNapkinNode === 'berth' && (
                <div className="space-y-2 text-xs text-slate-200">
                  <p>
                    <strong>Asymmetric Cost Imbalance:</strong> Under-forecasting results in ships waiting at anchor in San Pedro Bay, generating demurrage penalties exceeding $50,000 per day per vessel. Over-forecasting incurs unworked union longshore gang commitments at $42,000 per shift.
                  </p>
                </div>
              )}

              {activeNapkinNode === 'cliff' && (
                <div className="space-y-2 text-xs text-slate-200">
                  <p>
                    <strong>Structural Break Analysis:</strong> In Month 14 (February 2023), port throughput dropped from 102,723 TEUs to 82,404 TEUs. The subsequent V-shaped recovery exposed the failure of rigid linear trend lines, which permanently biased long-term estimates.
                  </p>
                </div>
              )}

              {activeNapkinNode === 'occam' && (
                <div className="space-y-2 text-xs text-slate-200">
                  <p>
                    <strong>Why Simplicity Prevailed:</strong> With only 30 monthly development observations, Random Forest decision trees partitioned feature space into fragmented leaves, failing to extrapolate out-of-distribution trends. 3-Period WMA's fixed 0.50/0.30/0.20 weighting captured immediate momentum while shedding older noise.
                  </p>
                </div>
              )}

              {activeNapkinNode === 'human' && (
                <div className="space-y-2 text-xs text-slate-200">
                  <p>
                    <strong>Human-in-the-Loop Protocol:</strong> Algorithmic forecasting operates as an automated baseline. Whenever the International Longshore and Warehouse Union (ILWU) approaches contract expirations or international maritime canals face geopolitical rerouting, executive human oversight must buffer inventory by +10%.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 3: JITTER.VIDEO MOTION & KINETIC CHOREOGRAPHY ================= */}
      {activeTool === 'jitter' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Preset Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Jitter Motion Preset:</span>
              <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
                <button
                  onClick={() => { setSelectedJitterPreset('twist_reveal'); setJitterTrigger(t => t + 1); }}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium ${
                    selectedJitterPreset === 'twist_reveal' ? 'bg-[#F2A541] text-slate-950 font-bold' : 'text-slate-300'
                  }`}
                >
                  Amber Twist Reveal
                </button>
                <button
                  onClick={() => { setSelectedJitterPreset('stagger_text'); setJitterTrigger(t => t + 1); }}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium ${
                    selectedJitterPreset === 'stagger_text' ? 'bg-[#1B6CA8] text-white font-bold' : 'text-slate-300'
                  }`}
                >
                  Kinetic Stagger
                </button>
                <button
                  onClick={() => { setSelectedJitterPreset('counter_odometer'); setJitterTrigger(t => t + 1); }}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium ${
                    selectedJitterPreset === 'counter_odometer' ? 'bg-[#1B6CA8] text-white font-bold' : 'text-slate-300'
                  }`}
                >
                  TEU Odometer
                </button>
              </div>
            </div>

            <button
              onClick={() => setJitterTrigger(t => t + 1)}
              className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Animation</span>
            </button>
          </div>

          {/* Jitter Kinetic Display Box */}
          <div className="bg-[#0B2545]/90 border border-[#1B6CA8]/50 rounded-2xl p-10 shadow-2xl flex flex-col items-center justify-center min-h-[340px] text-center relative overflow-hidden">
            
            {/* PRESET 1: AMBER TWIST REVEAL */}
            {selectedJitterPreset === 'twist_reveal' && (
              <motion.div
                key={`twist-${jitterTrigger}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className="space-y-4 max-w-xl"
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F2A541]/20 border border-[#F2A541] text-[#F2A541] text-xs font-black uppercase tracking-widest shadow-lg shadow-[#F2A541]/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Jitter Accent Twist</span>
                </motion.div>

                <motion.h2 
                  initial={{ letterSpacing: 'normal' }}
                  animate={{ letterSpacing: '-0.02em' }}
                  className="text-3xl md:text-5xl font-black text-white"
                >
                  The Algorithm Overfitted.
                </motion.h2>

                <motion.h3
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="text-3xl md:text-5xl font-black text-[#F2A541]"
                >
                  Simplicity Prevailed.
                </motion.h3>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="pt-2 text-sm text-slate-300 font-medium"
                >
                  3-Period WMA delivered <span className="text-[#F2A541] font-mono font-bold">6.41% Validation MAPE</span>, outperforming high-parameter machine learning ensembles.
                </motion.div>
              </motion.div>
            )}

            {/* PRESET 2: KINETIC WORD STAGGER */}
            {selectedJitterPreset === 'stagger_text' && (
              <div key={`stagger-${jitterTrigger}`} className="space-y-4 max-w-xl">
                <div className="flex flex-wrap items-center justify-center gap-2 text-2xl md:text-4xl font-extrabold text-white">
                  {["Every", "month,", "thousands", "of", "containers", "leave", "this", "port."].map((word, wIdx) => (
                    <motion.span
                      key={wIdx}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: wIdx * 0.08, type: 'spring', damping: 18 }}
                      className="inline-block"
                    >
                      {word}
                    </motion.span>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-lg md:text-2xl font-light text-sky-300 pt-2"
                >
                  How many will leave next month?
                </motion.div>
              </div>
            )}

            {/* PRESET 3: TEU ODOMETER COUNTER */}
            {selectedJitterPreset === 'counter_odometer' && (
              <div key={`odometer-${jitterTrigger}`} className="space-y-4">
                <div className="text-xs text-sky-400 font-mono uppercase tracking-widest">
                  Real Port Throughput Counter
                </div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="text-5xl md:text-7xl font-black font-mono text-white tracking-tight"
                >
                  460,304.25 <span className="text-2xl text-sky-400 font-sans">TEUs</span>
                </motion.div>
                <div className="text-xs text-slate-400">
                  December 2024 · Final Held-Out Validation Observation (Google Sheets)
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SECTION 4: LIVE EMBED HUB ================= */}
      {activeTool === 'embed_hub' && (
        <div className="bg-[#0B2545]/90 border border-[#1B6CA8]/50 rounded-2xl p-6 shadow-xl space-y-6 animate-fadeIn">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
              <ExternalLink className="w-4 h-4" />
              <span>THIRD-PARTY VISUAL EMBED ENGINE</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              Embed Flourish.studio, Jitter.video, or Napkin.ai Directly
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              If you have created custom animations on <strong>App.flourish.studio</strong>, <strong>Jitter.video</strong>, or <strong>App.napkin.ai</strong>, paste your embed URL or iframe below to preview and integrate it seamlessly with your presentation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Paste Flourish / Jitter / Napkin Embed URL or iframe code..."
              value={flourishEmbedUrl}
              onChange={(e) => setFlourishEmbedUrl(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-sky-400 font-mono"
            />
            <button
              onClick={() => setActiveEmbedMode('custom')}
              className="px-5 py-2.5 rounded-xl bg-[#1B6CA8] hover:bg-sky-500 text-white font-bold text-xs whitespace-nowrap transition-all shadow-md"
            >
              Render Live Embed
            </button>
          </div>

          {/* Embed Container Preview */}
          <div className="w-full aspect-video rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden relative">
            {flourishEmbedUrl.trim() ? (
              <iframe
                src={flourishEmbedUrl.startsWith('http') ? flourishEmbedUrl : 'https://flo.uri.sh/visualisation/placeholder'}
                className="w-full h-full border-0"
                title="Custom Visual Embed"
              />
            ) : (
              <div className="text-center p-6 space-y-3">
                <Box className="w-10 h-10 text-sky-400 mx-auto opacity-60" />
                <div className="text-sm font-bold text-white">Live Embed Frame Ready</div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Our native React & Motion engine generates all Flourish line races, Napkin flows, and Jitter kinetic typography in real-time. If you create an external visualization, paste the URL above to overlay it!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
