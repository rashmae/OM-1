import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, Calendar, AlertTriangle, Layers, Eye, Sparkles, 
  HelpCircle, ArrowUpRight, CheckCircle2, ChevronRight, Maximize2, 
  Download, Sun, Moon, Filter
} from 'lucide-react';
import { RAW_POLA_DATA, FULL_TIME_SERIES } from '../data/forecastingData';

export type ChartDisplayMode = 'decomposition' | 'partition' | 'hybrid';
export type HighlightComponent = 'all' | 'trend' | 'seasonal' | 'cyclical' | 'random' | 'validation';

interface DetailedDecompositionChartProps {
  initialMode?: ChartDisplayMode;
  compact?: boolean;
  interactive?: boolean;
  onPointSelect?: (period: number) => void;
  className?: string;
}

export const DetailedDecompositionChart: React.FC<DetailedDecompositionChartProps> = ({
  initialMode = 'decomposition',
  compact = false,
  interactive = true,
  onPointSelect,
  className = ''
}) => {
  const [displayMode, setDisplayMode] = useState<ChartDisplayMode>(initialMode);
  const [activeHighlight, setActiveHighlight] = useState<HighlightComponent>('all');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const clipId = useId();

  // Chart Geometry
  const width = 1000;
  const height = compact ? 420 : 540;
  const padLeft = 85;
  const padRight = 50;
  const padTop = compact ? 40 : 55;
  const padBottom = compact ? 65 : 85;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const minVal = 180000;
  const maxVal = 520000;

  const getX = (periodIndex: number): number => {
    // periodIndex is 0 to 35
    return padLeft + (periodIndex / 35) * plotW;
  };

  const getY = (val: number): number => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    return padTop + plotH - ((clamped - minVal) / (maxVal - minVal)) * plotH;
  };

  // Coordinates of all 36 points
  const points = RAW_POLA_DATA.map((d, i) => ({
    ...d,
    index: i,
    x: getX(i),
    y: getY(d.actual)
  }));

  // Build SVG path string for actual series
  const fullActualPath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  // Development points (months 1-30, index 0-29)
  const devPoints = points.slice(0, 30);
  const devPath = devPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  // Validation points (months 30-36, including connection from month 30 to 31)
  const valPoints = points.slice(29);
  const valPath = valPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  // Trend line points: slight upward trend from ~392,000 at Jan 2022 to ~452,000 at Dec 2024
  // Exactly matching Reference Image 1 & 2
  const trendStartY = getY(392000);
  const trendEndY = getY(452000);
  const trendStartX = getX(0) - 10;
  const trendEndX = getX(35) + 20;

  // Cyclical Arc Coordinates (Reference Image 1: broad valley from mid-2022 to early-2024)
  const cycleStart = { x: getX(6), y: getY(400000) }; // Jul 2022
  const cycleBottom = { x: getX(14), y: getY(285000) }; // Feb 2023 dip region
  const cycleEnd = { x: getX(24), y: getY(365000) }; // Jan 2024 recovery
  const cyclicalArcPath = `M ${cycleStart.x} ${cycleStart.y} Q ${cycleBottom.x} ${cycleBottom.y + 60} ${cycleEnd.x} ${cycleEnd.y}`;

  // Theme-dependent colors
  const isDark = themeMode === 'dark';
  const bgColor = isDark ? '#060B14' : '#FFFFFF';
  const gridColor = isDark ? '#1E293B' : '#E2E8F0';
  const textColor = isDark ? '#94A3B8' : '#64748B';
  const axisColor = isDark ? '#334155' : '#CBD5E1';

  const hoveredData = hoveredIndex !== null ? RAW_POLA_DATA[hoveredIndex] : null;

  return (
    <div className={`flex flex-col gap-4 rounded-2xl border transition-all ${
      isDark 
        ? 'bg-[#0B1528]/90 border-[#1B6CA8]/40 shadow-2xl text-slate-100' 
        : 'bg-white border-slate-200 shadow-xl text-slate-800'
    } ${className}`}>
      {/* Chart Control Header */}
      <div className={`p-4 md:p-6 border-b flex flex-wrap items-center justify-between gap-4 ${
        isDark ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#1B6CA8]/20 text-sky-400 border border-sky-400/30">
              Reference Graph Architecture
            </span>
            <span className="text-xs font-mono text-slate-400">
              36 Months · Jan 2022 – Dec 2024
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold tracking-tight">
            {displayMode === 'decomposition' && 'Time-Series Decomposition (Trend, Seasonal, Cyclical, Random)'}
            {displayMode === 'partition' && 'Data Partitioning: Development vs Validation Horizon'}
            {displayMode === 'hybrid' && 'Comprehensive Port Forecast Decomposition & Partition Overlay'}
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl">
            {displayMode === 'decomposition' 
              ? 'Detailed breakdown of the 4 structural components across the 36-month Port of Los Angeles export series.'
              : displayMode === 'partition'
              ? 'Rigorous 30-month Development (Jan 2022 – Jun 2024) and 6-month Held-Out Validation (Jul – Dec 2024) partitioning.'
              : 'Full pedagogical overlay uniting empirical data points, structural shock, seasonal oscillation, and validation testing.'}
          </p>
        </div>

        {/* View Mode & Theme Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Tabs */}
          <div className={`p-1 rounded-xl border flex items-center gap-1 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setDisplayMode('decomposition')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                displayMode === 'decomposition'
                  ? 'bg-[#1B6CA8] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. 4-Component Decomposition
            </button>
            <button
              onClick={() => setDisplayMode('partition')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                displayMode === 'partition'
                  ? 'bg-[#1B6CA8] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Dev / Validation Split
            </button>
            <button
              onClick={() => setDisplayMode('hybrid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                displayMode === 'hybrid'
                  ? 'bg-[#F2A541] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Hybrid Detail View
            </button>
          </div>

          {/* Theme Toggle (Dark vs Light mode like original diagram) */}
          <button
            onClick={() => setThemeMode(prev => prev === 'dark' ? 'light' : 'dark')}
            title="Toggle between Keynote Dark and Clean Diagram White theme"
            className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
              isDark 
                ? 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800' 
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline">{isDark ? 'Paper White' : 'Keynote Dark'}</span>
          </button>
        </div>
      </div>

      {/* Component Filter Bar (Allows isolating components like in Image 1) */}
      <div className={`px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b ${
        isDark ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50/70 border-slate-100'
      }`}>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-mono">Highlight Component:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveHighlight('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeHighlight === 'all'
                ? 'bg-slate-700 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Components
          </button>
          <button
            onClick={() => setActiveHighlight('trend')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeHighlight === 'trend'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-400/40 font-bold'
                : 'text-blue-400/70 hover:text-blue-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Trend (~437k → ~460k)</span>
          </button>
          <button
            onClick={() => setActiveHighlight('seasonal')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeHighlight === 'seasonal'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 font-bold'
                : 'text-emerald-400/70 hover:text-emerald-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Seasonal (Weak / Irregular)</span>
          </button>
          <button
            onClick={() => setActiveHighlight('cyclical')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeHighlight === 'cyclical'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-400/40 font-bold'
                : 'text-purple-400/70 hover:text-purple-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Cyclical (Multi-Month Valley)</span>
          </button>
          <button
            onClick={() => setActiveHighlight('random')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeHighlight === 'random'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-400/40 font-bold'
                : 'text-amber-400/70 hover:text-amber-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Random (Feb 2023 Shock)</span>
          </button>
          <button
            onClick={() => setActiveHighlight('validation')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeHighlight === 'validation'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/40 font-bold'
                : 'text-yellow-400/70 hover:text-yellow-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            <span>Validation Horizon (6 Mo)</span>
          </button>
        </div>
      </div>

      {/* Main SVG Graph Canvas */}
      <div className="relative px-4 md:px-6 py-2 overflow-hidden flex flex-col items-center justify-center">
        {/* SVG Drawing Area */}
        <div className="w-full aspect-[16/9] max-h-[560px] relative select-none">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible font-sans"
          >
            <defs>
              {/* Drop Shadow Filter */}
              <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity={isDark ? '0.5' : '0.1'} />
              </filter>
              <filter id="glowPulse" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              {/* Arrow Markers */}
              <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M 1 1 L 7 4 L 1 7 Z" fill="#3B82F6" />
              </marker>
              <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M 1 1 L 7 4 L 1 7 Z" fill="#22C55E" />
              </marker>
              <marker id="arrowGreenBidirectional" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                <path d="M 1 1 L 7 4 L 1 7 Z" fill="#22C55E" />
              </marker>
              <marker id="arrowPurple" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M 1 1 L 7 4 L 1 7 Z" fill="#8B5CF6" />
              </marker>
              <marker id="arrowAmber" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M 1 1 L 7 4 L 1 7 Z" fill="#F59E0B" />
              </marker>
              <marker id="arrowRed" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M 1 1 L 7 4 L 1 7 Z" fill="#EF4444" />
              </marker>
            </defs>

            {/* Background Canvas */}
            <rect width={width} height={height} rx="12" fill={bgColor} />

            {/* ============================================================== */}
            {/* TOP LEGEND (Strictly matching reference images)                */}
            {/* ============================================================== */}
            {displayMode === 'decomposition' ? (
              // Legend 1: Trend, Seasonal, Cyclical, Random (Reference Image 1)
              <g transform="translate(320, 24)" className="text-xs font-medium font-sans">
                {/* Trend */}
                <g transform="translate(0, 0)">
                  <circle cx="0" cy="0" r="5.5" fill="#3B82F6" />
                  <text x="12" y="4" fill={isDark ? '#E2E8F0' : '#1E293B'} className="text-xs font-semibold">
                    Trend
                  </text>
                </g>
                {/* Seasonal */}
                <g transform="translate(85, 0)">
                  <circle cx="0" cy="0" r="5.5" fill="#22C55E" />
                  <text x="12" y="4" fill={isDark ? '#E2E8F0' : '#1E293B'} className="text-xs font-semibold">
                    Seasonal
                  </text>
                </g>
                {/* Cyclical */}
                <g transform="translate(180, 0)">
                  <circle cx="0" cy="0" r="5.5" fill="#8B5CF6" />
                  <text x="12" y="4" fill={isDark ? '#E2E8F0' : '#1E293B'} className="text-xs font-semibold">
                    Cyclical
                  </text>
                </g>
                {/* Random */}
                <g transform="translate(280, 0)">
                  <circle cx="0" cy="0" r="5.5" fill="#F59E0B" />
                  <text x="12" y="4" fill={isDark ? '#E2E8F0' : '#1E293B'} className="text-xs font-semibold">
                    Random
                  </text>
                </g>
              </g>
            ) : displayMode === 'partition' ? (
              // Legend 2: Date, Development, Validation (Reference Image 2)
              <g transform="translate(320, 24)" className="text-xs font-medium font-sans">
                {/* Date */}
                <g transform="translate(0, 0)">
                  <rect x="-6" y="-6" width="12" height="12" rx="2" fill="#3B82F6" />
                  <text x="14" y="4" fill={isDark ? '#E2E8F0' : '#1E293B'} className="text-xs font-semibold">
                    Date
                  </text>
                </g>
                {/* Development */}
                <g transform="translate(90, 0)">
                  <circle cx="0" cy="0" r="5.5" fill="#EF4444" />
                  <text x="14" y="4" fill={isDark ? '#E2E8F0' : '#1E293B'} className="text-xs font-semibold">
                    Development (Months 1–30)
                  </text>
                </g>
                {/* Validation */}
                <g transform="translate(270, 0)">
                  <circle cx="0" cy="0" r="5.5" fill="#F59E0B" />
                  <text x="14" y="4" fill={isDark ? '#E2E8F0' : '#1E293B'} className="text-xs font-semibold">
                    Validation (Months 31–36)
                  </text>
                </g>
              </g>
            ) : (
              // Hybrid Legend: Combined
              <g transform="translate(180, 24)" className="text-xs font-medium font-sans">
                <g transform="translate(0, 0)">
                  <circle cx="0" cy="0" r="5" fill="#EF4444" />
                  <text x="10" y="4" fill={isDark ? '#CBD5E1' : '#334155'} className="text-[11px] font-semibold">
                    Dev Actual
                  </text>
                </g>
                <g transform="translate(95, 0)">
                  <circle cx="0" cy="0" r="5" fill="#F59E0B" />
                  <text x="10" y="4" fill={isDark ? '#CBD5E1' : '#334155'} className="text-[11px] font-semibold">
                    Validation Actual
                  </text>
                </g>
                <g transform="translate(225, 0)">
                  <line x1="-8" y1="0" x2="8" y2="0" stroke="#3B82F6" strokeWidth="2.5" strokeDasharray="3 3" />
                  <text x="12" y="4" fill={isDark ? '#CBD5E1' : '#334155'} className="text-[11px] font-semibold">
                    Trend Line
                  </text>
                </g>
                <g transform="translate(325, 0)">
                  <circle cx="0" cy="0" r="5" fill="#22C55E" />
                  <text x="10" y="4" fill={isDark ? '#CBD5E1' : '#334155'} className="text-[11px] font-semibold">
                    Seasonality
                  </text>
                </g>
                <g transform="translate(425, 0)">
                  <circle cx="0" cy="0" r="5" fill="#8B5CF6" />
                  <text x="10" y="4" fill={isDark ? '#CBD5E1' : '#334155'} className="text-[11px] font-semibold">
                    Cyclical Wave
                  </text>
                </g>
              </g>
            )}

            {/* ============================================================== */}
            {/* GRID LINES & Y-AXIS LABELS                                     */}
            {/* ============================================================== */}
            {[200000, 300000, 400000, 500000].map((v) => {
              const y = getY(v);
              return (
                <g key={v}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={padLeft + plotW}
                    y2={y}
                    stroke={gridColor}
                    strokeWidth={v === 200000 ? 1.5 : 1}
                  />
                  <text
                    x={padLeft - 14}
                    y={y + 4}
                    textAnchor="end"
                    fill={textColor}
                    className="text-xs font-mono select-none"
                  >
                    {v.toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Y-Axis Title: "Actual Value" */}
            <text
              transform={`translate(26, ${padTop + plotH / 2}) rotate(-90)`}
              textAnchor="middle"
              fill={isDark ? '#94A3B8' : '#475569'}
              className="text-xs font-semibold tracking-wider font-sans select-none"
            >
              Actual Value
            </text>

            {/* ============================================================== */}
            {/* PARTITION DIVIDERS & SHADINGS (Reference Image 2)               */}
            {/* ============================================================== */}
            {/* Year partition lines for 2022, 2023, 2024 */}
            {displayMode !== 'decomposition' && (
              <>
                {/* Jan 2023 Boundary (Between period 12 and 13) */}
                <line
                  x1={(getX(11) + getX(12)) / 2}
                  y1={padTop}
                  x2={(getX(11) + getX(12)) / 2}
                  y2={padTop + plotH}
                  stroke={axisColor}
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />

                {/* Jan 2024 Boundary (Between period 24 and 25) */}
                <line
                  x1={(getX(23) + getX(24)) / 2}
                  y1={padTop}
                  x2={(getX(23) + getX(24)) / 2}
                  y2={padTop + plotH}
                  stroke={axisColor}
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />

                {/* Development vs Validation Partition Line (Between period 30 and 31) */}
                <g>
                  <line
                    x1={(getX(29) + getX(30)) / 2}
                    y1={padTop - 10}
                    x2={(getX(29) + getX(30)) / 2}
                    y2={padTop + plotH + 5}
                    stroke="#F59E0B"
                    strokeWidth="1.8"
                    strokeDasharray="5 5"
                    className="animate-pulse"
                  />
                  <rect
                    x={(getX(29) + getX(30)) / 2 - 40}
                    y={padTop - 26}
                    width="80"
                    height="18"
                    rx="4"
                    fill={isDark ? '#0B2545' : '#FEF3C7'}
                    stroke="#F59E0B"
                    strokeWidth="1"
                  />
                  <text
                    x={(getX(29) + getX(30)) / 2}
                    y={padTop - 14}
                    textAnchor="middle"
                    fill={isDark ? '#FCD34D' : '#92400E'}
                    className="text-[9px] font-mono font-bold"
                  >
                    HOLDOUT SPLIT
                  </text>
                </g>
              </>
            )}

            {/* Light blue shaded ellipse on late 2024 validation surge (Reference Image 1) */}
            {(displayMode === 'decomposition' || displayMode === 'hybrid' || activeHighlight === 'validation') && (
              <g
                opacity={activeHighlight === 'validation' ? 1.0 : 0.8}
                className="transition-opacity duration-300"
              >
                <ellipse
                  cx={(getX(30) + getX(35)) / 2 + 5}
                  cy={getY(446000)}
                  rx="68"
                  ry="26"
                  transform={`rotate(-8, ${(getX(30) + getX(35)) / 2 + 5}, ${getY(446000)})`}
                  fill={isDark ? '#0284C7' : '#BAE6FD'}
                  fillOpacity={isDark ? '0.25' : '0.45'}
                  stroke="#38BDF8"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
              </g>
            )}

            {/* Light blue shaded oval for Cyclical Component (Reference Image 2) */}
            {(displayMode === 'partition' || displayMode === 'hybrid' || activeHighlight === 'cyclical') && (
              <g
                opacity={activeHighlight === 'cyclical' ? 1.0 : 0.75}
                className="transition-opacity duration-300"
              >
                <ellipse
                  cx={(getX(8) + getX(18)) / 2}
                  cy={getY(350000)}
                  rx="125"
                  ry="65"
                  transform={`rotate(-6, ${(getX(8) + getX(18)) / 2}, ${getY(350000)})`}
                  fill={isDark ? '#1E3A8A' : '#DBEAFE'}
                  fillOpacity={isDark ? '0.3' : '0.55'}
                  stroke="#60A5FA"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              </g>
            )}

            {/* ============================================================== */}
            {/* TREND LINE (Blue in Img 1, Green in Img 2)                     */}
            {/* ============================================================== */}
            {(activeHighlight === 'all' || activeHighlight === 'trend') && (
              <g>
                <line
                  x1={trendStartX}
                  y1={trendStartY}
                  x2={trendEndX}
                  y2={trendEndY}
                  stroke={displayMode === 'partition' ? '#16A34A' : '#3B82F6'}
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  className="transition-colors duration-300"
                />
              </g>
            )}

            {/* ============================================================== */}
            {/* CYCLICAL CURVED ARROW (Reference Image 1)                       */}
            {/* ============================================================== */}
            {(displayMode === 'decomposition' || displayMode === 'hybrid' || activeHighlight === 'cyclical') && (
              <g opacity={activeHighlight === 'all' || activeHighlight === 'cyclical' ? 1.0 : 0.3}>
                <path
                  d={cyclicalArcPath}
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  markerEnd="url(#arrowPurple)"
                  className="transition-all duration-300"
                />
              </g>
            )}

            {/* ============================================================== */}
            {/* ACTUAL SERIES LINES & NODES                                    */}
            {/* ============================================================== */}
            {displayMode === 'decomposition' ? (
              // Single continuous red line as in Reference Image 1
              <g>
                <path
                  d={fullActualPath}
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {points.map((p) => {
                  const isFeb2023 = p.period === 14;
                  return (
                    <g key={p.period} className="cursor-pointer">
                      {isFeb2023 ? (
                        // Halo around Feb 2023 (Reference Image 1: Yellow Halo)
                        <g>
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="16"
                            fill="#F59E0B"
                            fillOpacity={isDark ? '0.35' : '0.4'}
                            stroke="#F59E0B"
                            strokeWidth="1.5"
                          />
                          <circle cx={p.x} cy={p.y} r="5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" />
                        </g>
                      ) : (
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={hoveredIndex === p.index ? 6 : 4}
                          fill="#EF4444"
                          stroke={isDark ? '#060B14' : '#FFFFFF'}
                          strokeWidth="1"
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            ) : (
              // Development (Red) vs Validation (Yellow/Amber) as in Reference Image 2
              <g>
                {/* Development Line */}
                <path
                  d={devPath}
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={activeHighlight === 'validation' ? 0.35 : 1.0}
                />
                {/* Validation Line */}
                <path
                  d={valPath}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={activeHighlight !== 'all' && activeHighlight !== 'validation' ? 0.4 : 1.0}
                />
                {/* Data Points */}
                {points.map((p) => {
                  const isVal = p.period > 30;
                  const isFeb2023 = p.period === 14;
                  const color = isVal ? '#F59E0B' : '#EF4444';

                  return (
                    <g key={p.period} className="cursor-pointer">
                      {isFeb2023 && (
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="18"
                          fill="none"
                          stroke="#EF4444"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          className="animate-spin-slow"
                        />
                      )}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={hoveredIndex === p.index ? 6.5 : isVal ? 5 : 4}
                        fill={color}
                        stroke={isDark ? '#060B14' : '#FFFFFF'}
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })}
              </g>
            )}

            {/* ============================================================== */}
            {/* ANNOTATION BOXES (Strictly matching user's reference images)    */}
            {/* ============================================================== */}

            {/* 1. SEASONAL BOX (Top-Left) */}
            {(activeHighlight === 'all' || activeHighlight === 'seasonal') && (
              <g transform="translate(95, 26)" className="transition-all duration-300">
                {displayMode === 'decomposition' || displayMode === 'hybrid' ? (
                  // Image 1 Style: Green Box with Subtitle & Green Bracket/Arrows
                  <g>
                    {/* Green Box */}
                    <rect
                      x="0"
                      y="0"
                      width="195"
                      height="74"
                      rx="8"
                      fill={isDark ? '#052E16' : '#DCFCE7'}
                      stroke="#22C55E"
                      strokeWidth="1.5"
                      filter="url(#cardShadow)"
                    />
                    <text x="97.5" y="20" textAnchor="middle" fill={isDark ? '#4ADE80' : '#15803D'} className="text-xs font-bold">
                      Seasonal
                    </text>
                    <text x="97.5" y="34" textAnchor="middle" fill={isDark ? '#86EFAC' : '#166534'} className="text-[9.5px]">
                      Weak/irregular seasonal pattern
                    </text>
                    <text x="97.5" y="47" textAnchor="middle" fill={isDark ? '#86EFAC' : '#166534'} className="text-[9px]">
                      (e.g., some months are higher
                    </text>
                    <text x="97.5" y="60" textAnchor="middle" fill={isDark ? '#86EFAC' : '#166534'} className="text-[9px]">
                      or lower, but not consistent
                    </text>
                    <text x="97.5" y="70" textAnchor="middle" fill={isDark ? '#86EFAC' : '#166534'} className="text-[9px]">
                      across all years)
                    </text>

                    {/* Curly Green Bracket above Jan - Jul 2022 */}
                    <g transform="translate(0, 75)">
                      <path
                        d={`M ${getX(0)} 8 Q ${getX(0) + 30} 8 ${(getX(0) + getX(6)) / 2} 0 Q ${getX(6) - 30} 8 ${getX(6)} 8`}
                        fill="none"
                        stroke="#22C55E"
                        strokeWidth="2"
                      />
                      {/* Vertical green arrows pointing to peaks and valleys in 2022 */}
                      {[0, 2, 4, 6].map((pIdx) => (
                        <line
                          key={pIdx}
                          x1={getX(pIdx)}
                          y1={14}
                          x2={getX(pIdx)}
                          y2={getY(RAW_POLA_DATA[pIdx].actual) - 80}
                          stroke="#22C55E"
                          strokeWidth="1.5"
                          markerEnd="url(#arrowGreen)"
                        />
                      ))}
                    </g>
                  </g>
                ) : (
                  // Image 2 Style: Purple Box "Seasonal Component" with Purple Dashed Ellipse
                  <g transform="translate(0, -2)">
                    <rect
                      x="0"
                      y="0"
                      width="215"
                      height="48"
                      rx="6"
                      fill={isDark ? '#2E1065' : '#F3E8FF'}
                      stroke="#8B5CF6"
                      strokeWidth="1.5"
                      filter="url(#cardShadow)"
                    />
                    <text x="107.5" y="19" textAnchor="middle" fill={isDark ? '#C084FC' : '#6B21A8'} className="text-xs font-bold">
                      Seasonal Component
                    </text>
                    <text x="107.5" y="36" textAnchor="middle" fill={isDark ? '#DDD6FE' : '#7E22CE'} className="text-[10px]">
                      (repeated within a year)
                    </text>

                    {/* Dashed Purple Ellipse around early 2022 */}
                    <ellipse
                      cx={(getX(0) + getX(5)) / 2}
                      cy={getY(445000)}
                      rx="72"
                      ry="28"
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="1.8"
                      strokeDasharray="4 4"
                    />
                    {/* Purple pointer arrows */}
                    <line
                      x1={getX(2)}
                      y1={48}
                      x2={getX(2)}
                      y2={getY(RAW_POLA_DATA[2].actual) - 18}
                      stroke="#8B5CF6"
                      strokeWidth="1.5"
                      markerEnd="url(#arrowPurple)"
                    />
                  </g>
                )}
              </g>
            )}

            {/* 2. TREND BOX (Top-Center) */}
            {(activeHighlight === 'all' || activeHighlight === 'trend') && (
              <g transform="translate(425, 60)" className="transition-all duration-300">
                {displayMode === 'partition' ? (
                  // Image 2 Style: Green Box "Trend Component (slight upward trend from 2022 to 2024)"
                  <g transform="translate(90, 10)">
                    <rect
                      x="0"
                      y="0"
                      width="200"
                      height="48"
                      rx="6"
                      fill={isDark ? '#052E16' : '#DCFCE7'}
                      stroke="#16A34A"
                      strokeWidth="1.5"
                      filter="url(#cardShadow)"
                    />
                    <text x="100" y="20" textAnchor="middle" fill={isDark ? '#4ADE80' : '#15803D'} className="text-xs font-bold">
                      Trend Component
                    </text>
                    <text x="100" y="36" textAnchor="middle" fill={isDark ? '#86EFAC' : '#166534'} className="text-[9.5px]">
                      (slight upward trend from 2022 to 2024)
                    </text>
                    {/* Pointer arrow to trend line */}
                    <line
                      x1="60"
                      y1="48"
                      x2="5"
                      y2="88"
                      stroke="#16A34A"
                      strokeWidth="1.8"
                      markerEnd="url(#arrowGreen)"
                    />
                  </g>
                ) : (
                  // Image 1 Style: Blue Box "Trend: Slight upward trend (from ~437k in Jan 2022 to ~460k in Dec 2024)"
                  <g>
                    <rect
                      x="0"
                      y="0"
                      width="210"
                      height="64"
                      rx="8"
                      fill={isDark ? '#082F49' : '#E0F2FE'}
                      stroke="#0284C7"
                      strokeWidth="1.5"
                      filter="url(#cardShadow)"
                    />
                    <text x="105" y="20" textAnchor="middle" fill={isDark ? '#38BDF8' : '#0369A1'} className="text-xs font-bold">
                      Trend
                    </text>
                    <text x="105" y="36" textAnchor="middle" fill={isDark ? '#7DD3FC' : '#0284C7'} className="text-[10px]">
                      Slight upward trend
                    </text>
                    <text x="105" y="50" textAnchor="middle" fill={isDark ? '#7DD3FC' : '#0284C7'} className="text-[9.5px]">
                      (from ~437k in Jan 2022 to
                    </text>
                    <text x="105" y="60" textAnchor="middle" fill={isDark ? '#7DD3FC' : '#0284C7'} className="text-[9.5px]">
                      ~460k in Dec 2024)
                    </text>
                    {/* Pointer arrow down to blue dashed trend line */}
                    <line
                      x1="105"
                      y1="64"
                      x2="105"
                      y2="128"
                      stroke="#0284C7"
                      strokeWidth="1.8"
                      markerEnd="url(#arrowBlue)"
                    />
                  </g>
                )}
              </g>
            )}

            {/* 3. CYCLICAL BOX (Bottom-Left / Mid-Timeline) */}
            {(activeHighlight === 'all' || activeHighlight === 'cyclical') && (
              <g transform={`translate(${padLeft + 85}, ${height - padBottom - 110})`} className="transition-all duration-300">
                {displayMode === 'partition' ? (
                  // Image 2 Style: Blue Box "Cyclical Component"
                  <g transform="translate(-60, 20)">
                    <rect
                      x="0"
                      y="0"
                      width="225"
                      height="58"
                      rx="6"
                      fill={isDark ? '#082F49' : '#E0F2FE'}
                      stroke="#0284C7"
                      strokeWidth="1.5"
                      filter="url(#cardShadow)"
                    />
                    <text x="112.5" y="22" textAnchor="middle" fill={isDark ? '#38BDF8' : '#0369A1'} className="text-xs font-bold">
                      Cyclical Component
                    </text>
                    <text x="112.5" y="38" textAnchor="middle" fill={isDark ? '#7DD3FC' : '#0284C7'} className="text-[9.5px]">
                      (longer-term rise and fall
                    </text>
                    <text x="112.5" y="50" textAnchor="middle" fill={isDark ? '#7DD3FC' : '#0284C7'} className="text-[9.5px]">
                      over several months)
                    </text>
                    <line
                      x1="170"
                      y1="0"
                      x2="195"
                      y2="-38"
                      stroke="#0284C7"
                      strokeWidth="1.6"
                      markerEnd="url(#arrowBlue)"
                    />
                  </g>
                ) : (
                  // Image 1 Style: Purple Box "Cyclical: Possible cyclical fluctuations"
                  <g>
                    <rect
                      x="0"
                      y="0"
                      width="200"
                      height="74"
                      rx="8"
                      fill={isDark ? '#2E1065' : '#F3E8FF'}
                      stroke="#8B5CF6"
                      strokeWidth="1.5"
                      filter="url(#cardShadow)"
                    />
                    <text x="100" y="20" textAnchor="middle" fill={isDark ? '#C084FC' : '#6B21A8'} className="text-xs font-bold">
                      Cyclical
                    </text>
                    <text x="100" y="35" textAnchor="middle" fill={isDark ? '#DDD6FE' : '#7E22CE'} className="text-[9.5px]">
                      Possible cyclical fluctuations
                    </text>
                    <text x="100" y="48" textAnchor="middle" fill={isDark ? '#DDD6FE' : '#7E22CE'} className="text-[9px]">
                      (longer rises and falls over several
                    </text>
                    <text x="100" y="60" textAnchor="middle" fill={isDark ? '#DDD6FE' : '#7E22CE'} className="text-[9px]">
                      months, e.g., decline in 2022,
                    </text>
                    <text x="100" y="70" textAnchor="middle" fill={isDark ? '#DDD6FE' : '#7E22CE'} className="text-[9px]">
                      recovery in 2023–2024)
                    </text>
                  </g>
                )}
              </g>
            )}

            {/* 4. RANDOM BOX (Bottom-Center / Pointing to Feb 2023 Shock) */}
            {(activeHighlight === 'all' || activeHighlight === 'random') && (
              <g transform={`translate(${getX(14) + 65}, ${getY(236264) - 25})`} className="transition-all duration-300">
                {displayMode === 'partition' ? (
                  // Image 2 Style: Red Box "Random Component (irregular, unexpected change)"
                  <g>
                    <rect
                      x="0"
                      y="0"
                      width="250"
                      height="48"
                      rx="6"
                      fill={isDark ? '#450A0A' : '#FEE2E2'}
                      stroke="#EF4444"
                      strokeWidth="1.5"
                      filter="url(#cardShadow)"
                    />
                    <text x="125" y="20" textAnchor="middle" fill={isDark ? '#F87171' : '#991B1B'} className="text-xs font-bold">
                      Random Component
                    </text>
                    <text x="125" y="36" textAnchor="middle" fill={isDark ? '#FECACA' : '#B91C1C'} className="text-[10px]">
                      (irregular, unexpected change)
                    </text>
                    {/* Pointer arrow to red dashed circle around Feb 2023 */}
                    <line
                      x1="0"
                      y1="24"
                      x2="-40"
                      y2="24"
                      stroke="#EF4444"
                      strokeWidth="1.8"
                      markerEnd="url(#arrowRed)"
                    />
                  </g>
                ) : (
                  // Image 1 Style: Amber Box "Random: Irregular variation (e.g., sharp drop in Feb 2023...)"
                  <g>
                    <rect
                      x="0"
                      y="0"
                      width="170"
                      height="65"
                      rx="8"
                      fill={isDark ? '#451A03' : '#FEF3C7'}
                      stroke="#F59E0B"
                      strokeWidth="1.5"
                      filter="url(#cardShadow)"
                    />
                    <text x="85" y="19" textAnchor="middle" fill={isDark ? '#FBBF24' : '#92400E'} className="text-xs font-bold">
                      Random
                    </text>
                    <text x="85" y="34" textAnchor="middle" fill={isDark ? '#FDE68A' : '#B45309'} className="text-[9.5px]">
                      Irregular variation
                    </text>
                    <text x="85" y="46" textAnchor="middle" fill={isDark ? '#FDE68A' : '#B45309'} className="text-[9px]">
                      (e.g., sharp drop in Feb 2023
                    </text>
                    <text x="85" y="58" textAnchor="middle" fill={isDark ? '#FDE68A' : '#B45309'} className="text-[9px]">
                      and other sudden changes)
                    </text>
                    {/* Amber arrow pointing to Feb 2023 point */}
                    <line
                      x1="0"
                      y1="32"
                      x2="-42"
                      y2="32"
                      stroke="#F59E0B"
                      strokeWidth="1.8"
                      markerEnd="url(#arrowAmber)"
                    />
                  </g>
                )}
              </g>
            )}

            {/* ============================================================== */}
            {/* X-AXIS LABELS & BRACKETS (Strictly matching reference images)   */}
            {/* ============================================================== */}
            {displayMode === 'decomposition' ? (
              // Reference Image 1 X-Axis: Jan 2022, Jul 2022, Jan 2023, Jul 2023, Jan 2024, Jul 2024, Dec 2024
              <g transform={`translate(0, ${padTop + plotH + 18})`}>
                <line x1={padLeft} y1="0" x2={padLeft + plotW} y2="0" stroke={axisColor} strokeWidth="1.5" />
                {[
                  { idx: 0, label: 'Jan 2022' },
                  { idx: 6, label: 'Jul 2022' },
                  { idx: 12, label: 'Jan 2023' },
                  { idx: 18, label: 'Jul 2023' },
                  { idx: 24, label: 'Jan 2024' },
                  { idx: 30, label: 'Jul 2024' },
                  { idx: 35, label: 'Dec 2024' }
                ].map((item) => (
                  <g key={item.idx} transform={`translate(${getX(item.idx)}, 0)`}>
                    <line x1="0" y1="0" x2="0" y2="6" stroke={axisColor} strokeWidth="1" />
                    <text x="0" y="20" textAnchor="middle" fill={textColor} className="text-xs font-mono font-medium">
                      {item.label}
                    </text>
                  </g>
                ))}
              </g>
            ) : (
              // Reference Image 2 X-Axis: All 36 individual months with year brackets (2022, 2023, 2024)
              <g transform={`translate(0, ${padTop + plotH + 14})`}>
                <line x1={padLeft} y1="0" x2={padLeft + plotW} y2="0" stroke={axisColor} strokeWidth="1.5" />
                
                {/* 36 Month Name Ticks: Jan, Feb, Mar... */}
                {RAW_POLA_DATA.map((d, i) => {
                  const shortName = d.monthName.split(' ')[0];
                  return (
                    <g key={d.period} transform={`translate(${getX(i)}, 0)`}>
                      <line x1="0" y1="0" x2="0" y2="4" stroke={axisColor} strokeWidth="1" />
                      <text
                        x="0"
                        y="14"
                        textAnchor="middle"
                        fill={i > 29 ? '#F59E0B' : textColor}
                        className={`text-[9px] font-mono ${i > 29 ? 'font-bold' : ''}`}
                      >
                        {shortName}
                      </text>
                    </g>
                  );
                })}

                {/* Year Grouping Brackets */}
                {/* 2022 Bracket */}
                <g transform="translate(0, 24)">
                  <path
                    d={`M ${getX(0)} 4 L ${getX(0)} 10 L ${(getX(0) + getX(11)) / 2} 10 L ${(getX(0) + getX(11)) / 2} 14 L ${(getX(0) + getX(11)) / 2} 10 L ${getX(11)} 10 L ${getX(11)} 4`}
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth="1.8"
                  />
                  <text
                    x={(getX(0) + getX(11)) / 2}
                    y="32"
                    textAnchor="middle"
                    fill={isDark ? '#38BDF8' : '#0369A1'}
                    className="text-sm font-bold tracking-wider"
                  >
                    2022
                  </text>
                </g>

                {/* 2023 Bracket */}
                <g transform="translate(0, 24)">
                  <path
                    d={`M ${getX(12)} 4 L ${getX(12)} 10 L ${(getX(12) + getX(23)) / 2} 10 L ${(getX(12) + getX(23)) / 2} 14 L ${(getX(12) + getX(23)) / 2} 10 L ${getX(23)} 10 L ${getX(23)} 4`}
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth="1.8"
                  />
                  <text
                    x={(getX(12) + getX(23)) / 2}
                    y="32"
                    textAnchor="middle"
                    fill={isDark ? '#38BDF8' : '#0369A1'}
                    className="text-sm font-bold tracking-wider"
                  >
                    2023
                  </text>
                </g>

                {/* 2024 Bracket */}
                <g transform="translate(0, 24)">
                  <path
                    d={`M ${getX(24)} 4 L ${getX(24)} 10 L ${(getX(24) + getX(35)) / 2} 10 L ${(getX(24) + getX(35)) / 2} 14 L ${(getX(24) + getX(35)) / 2} 10 L ${getX(35)} 10 L ${getX(35)} 4`}
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth="1.8"
                  />
                  <text
                    x={(getX(24) + getX(35)) / 2}
                    y="32"
                    textAnchor="middle"
                    fill={isDark ? '#38BDF8' : '#0369A1'}
                    className="text-sm font-bold tracking-wider"
                  >
                    2024
                  </text>
                </g>
              </g>
            )}

            {/* ============================================================== */}
            {/* INVISIBLE INTERACTION HIT AREAS FOR ALL 36 POINTS              */}
            {/* ============================================================== */}
            {interactive && points.map((p) => (
              <circle
                key={`hit-${p.period}`}
                cx={p.x}
                cy={p.y}
                r="14"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(p.index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onPointSelect && onPointSelect(p.period)}
              />
            ))}

            {/* Hover Tooltip Rendered in SVG */}
            {hoveredData && (
              <g transform={`translate(${getX(hoveredData.period - 1)}, ${getY(hoveredData.actual) - 22})`}>
                <rect
                  x="-75"
                  y="-34"
                  width="150"
                  height="34"
                  rx="6"
                  fill="#0B2545"
                  stroke="#38BDF8"
                  strokeWidth="1.5"
                  filter="url(#cardShadow)"
                />
                <text x="0" y="-18" textAnchor="middle" fill="#FFFFFF" className="text-[11px] font-bold">
                  {hoveredData.monthName}: {Math.round(hoveredData.actual).toLocaleString()} TEUs
                </text>
                <text x="0" y="-6" textAnchor="middle" fill="#38BDF8" className="text-[9px] font-mono">
                  {hoveredData.period > 30 ? 'Validation Holdout' : hoveredData.period === 14 ? '⚠️ Anomaly Shock' : 'Development Series'}
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Analytical Narrative & Methodology Callout Cards */}
      <div className={`p-4 md:p-6 border-t grid grid-cols-1 md:grid-cols-4 gap-4 ${
        isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50'
      }`}>
        {/* Trend Summary */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
          isDark ? 'bg-sky-950/20 border-sky-500/30 text-sky-200' : 'bg-sky-50 border-sky-200 text-sky-900'
        }`}>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trend Component</span>
            </div>
            <div className="text-sm font-bold mt-1">Slight Upward Drift</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Drifts from ~437,121 TEUs in Jan 2022 to ~460,304 TEUs in Dec 2024. However, simple linear regression yields correlation r = 0.06, proving linear models cannot capture operational cargo swings.
            </p>
          </div>
          <div className="mt-2 text-[10px] font-mono text-sky-400">Equation: y_t = 411,621 - 2,216·t</div>
        </div>

        {/* Seasonal Summary */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
          isDark ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Seasonal Component</span>
            </div>
            <div className="text-sm font-bold mt-1">Weak & Irregular</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Early 2022 exhibits peak-and-trough oscillations between March and July, but this intra-year rhythm does not repeat consistently in 2023 or 2024 due to macro supply disruptions.
            </p>
          </div>
          <div className="mt-2 text-[10px] font-mono text-emerald-400">No strict 12-month periodicity</div>
        </div>

        {/* Cyclical Summary */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
          isDark ? 'bg-purple-950/20 border-purple-500/30 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-900'
        }`}>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-400">
              <Layers className="w-3.5 h-3.5" />
              <span>Cyclical Component</span>
            </div>
            <div className="text-sm font-bold mt-1">Multi-Month U-Turn</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Extended decline throughout late 2022 caused by inventory destocking, reaching terminal bottom in early 2023, followed by a steady 18-month cargo volume recovery into 2024.
            </p>
          </div>
          <div className="mt-2 text-[10px] font-mono text-purple-400">Cycle Duration: ~20 Months</div>
        </div>

        {/* Random / Structural Anomaly */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
          isDark ? 'bg-amber-950/20 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Random Shock</span>
            </div>
            <div className="text-sm font-bold mt-1">Feb 2023: 236,264 TEUs</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Catastrophic -32.0% single-month drop driven by ILWU West Coast contract friction and shipper diversions to Gulf ports. Represents an external shock that tests model adaptability.
            </p>
          </div>
          <div className="mt-2 text-[10px] font-mono text-amber-400">Exogenous operational shock</div>
        </div>
      </div>
    </div>
  );
};
