import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Box, Layers, Play, Pause, RotateCcw, Sparkles, Sliders, 
  ArrowRight, Ship, Compass, Maximize2, Check, RefreshCw
} from 'lucide-react';
import { 
  FULL_TIME_SERIES, 
  VALIDATION_METRICS,
  BaselineModelChoice 
} from '../data/forecastingData';

export const Morph3DStudioSection: React.FC = () => {
  // 3D Camera & Orbit Controls
  const [pitch, setPitch] = useState<number>(24);
  const [yaw, setYaw] = useState<number>(-20);
  const [zoom, setZoom] = useState<number>(1.0);
  const [depthExtrusion, setDepthExtrusion] = useState<number>(45);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; pitch: number; yaw: number }>({ x: 0, y: 0, pitch: 0, yaw: 0 });

  // Morph Engine State
  const [morphModelA, setMorphModelA] = useState<'actual' | 'sma' | 'wma' | 'ets' | 'trend'>('actual');
  const [morphModelB, setMorphModelB] = useState<'actual' | 'sma' | 'wma' | 'ets' | 'arima' | 'trend'>('ets');
  const [morphT, setMorphT] = useState<number>(50); // 0 to 100%
  const [isMorphLooping, setIsMorphLooping] = useState<boolean>(false);

  // 3D Container Terminal State
  const [containerMonth, setContainerMonth] = useState<number>(14); // default Feb 2023 shock
  const [isContainerPlaying, setIsContainerPlaying] = useState<boolean>(false);

  // Active view mode within 3D studio
  const [activeSubTab, setActiveSubTab] = useState<'morph' | 'spatial_stage' | 'containers' | 'prism_bars'>('morph');

  // Auto-morph looping ticker
  useEffect(() => {
    let animId: number;
    let forward = true;
    if (isMorphLooping) {
      const step = () => {
        setMorphT((prev) => {
          let next = forward ? prev + 1.2 : prev - 1.2;
          if (next >= 100) {
            next = 100;
            forward = false;
          } else if (next <= 0) {
            next = 0;
            forward = true;
          }
          return +next.toFixed(1);
        });
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isMorphLooping]);

  // Container month ticker
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isContainerPlaying) {
      timer = setInterval(() => {
        setContainerMonth(prev => prev >= 36 ? 1 : prev + 1);
      }, 700);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isContainerPlaying]);

  // Mouse drag handlers for full 3D orbital camera control
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, pitch, yaw };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setYaw(+Math.max(-75, Math.min(75, dragStartRef.current.yaw + dx * 0.4)).toFixed(1));
    setPitch(+Math.max(-50, Math.min(50, dragStartRef.current.pitch - dy * 0.4)).toFixed(1));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Helper to get series array
  const getModelValues = (model: string): number[] => {
    return FULL_TIME_SERIES.map((r, i) => {
      if (model === 'sma') return r.sma3 || r.actual;
      if (model === 'wma') return r.wma3 || r.actual;
      if (model === 'ets') return r.es05 || r.actual;
      if (model === 'trend') return r.trend || (411621 - 2216 * i);
      if (model === 'arima') {
        const arimaVals = [395788, 435086, 449029, 454461, 442723, 427066];
        if (i >= 30) return arimaVals[i - 30];
        return r.actual;
      }
      return r.actual;
    });
  };

  const valuesA = useMemo(() => getModelValues(morphModelA), [morphModelA]);
  const valuesB = useMemo(() => getModelValues(morphModelB), [morphModelB]);

  // Interpolate intermediate values
  const tNorm = morphT / 100;
  const morphedValues = useMemo(() => {
    return valuesA.map((vA, i) => {
      const vB = valuesB[i];
      return vA * (1 - tNorm) + vB * tNorm;
    });
  }, [valuesA, valuesB, tNorm]);

  // SVG dimensions
  const svgW = 900;
  const svgH = 340;
  const padL = 70;
  const padR = 40;
  const padT = 30;
  const padB = 40;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;
  const minV = 200000;
  const maxV = 480000;

  const toX = (idx: number) => padL + (idx / 35) * plotW;
  const toY = (val: number) => padT + plotH - ((val - minV) / (maxV - minV)) * plotH;

  const morphedPath = useMemo(() => {
    return morphedValues.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(' ');
  }, [morphedValues]);

  const pathA = useMemo(() => {
    return valuesA.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(' ');
  }, [valuesA]);

  const pathB = useMemo(() => {
    return valuesB.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(' ');
  }, [valuesB]);

  const currentRow = FULL_TIME_SERIES[containerMonth - 1] || FULL_TIME_SERIES[13];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 3D Engine Header & Subtabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Box className="w-4 h-4 text-amber-400" />
            <span>3D SPATIAL &amp; MATHEMATICAL MORPH ENGINE</span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Experience spatial perspective camera sweeps, bezier spline morphing, 3D container stacking, and extruded volumetric prisms.
          </p>
        </div>

        {/* Subtabs */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab('morph')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              activeSubTab === 'morph' ? 'bg-[#F2A541] text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Spline Morph
          </button>
          <button
            onClick={() => setActiveSubTab('spatial_stage')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              activeSubTab === 'spatial_stage' ? 'bg-[#F2A541] text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            3D Spatial Orbit
          </button>
          <button
            onClick={() => setActiveSubTab('containers')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              activeSubTab === 'containers' ? 'bg-[#F2A541] text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            3D TEU Yard
          </button>
          <button
            onClick={() => setActiveSubTab('prism_bars')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              activeSubTab === 'prism_bars' ? 'bg-[#F2A541] text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            3D Prism Race
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUBTAB 1: BEZIER PATH MORPH ENGINE                             */}
      {/* ============================================================== */}
      {activeSubTab === 'morph' && (
        <div className="bg-[#0B2545]/90 border border-[#1B6CA8]/50 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Mathematical Curve Morphing</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  Spline Interpolation
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Drag the slider or click auto-loop to morph the Port of LA trajectory between competing mathematical formulations.
              </p>
            </div>

            {/* Auto-Morph Loop Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMorphLooping(!isMorphLooping)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all ${
                  isMorphLooping
                    ? 'bg-[#F2A541] text-slate-950'
                    : 'bg-[#1B6CA8] hover:bg-sky-500 text-white'
                }`}
              >
                {isMorphLooping ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isMorphLooping ? 'Pause Morph Loop' : 'Play Auto-Morph Loop'}</span>
              </button>

              <button
                onClick={() => setMorphT(50)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                title="Reset to 50%"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Morph Model Pickers & Slider */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            {/* Model A */}
            <div className="md:col-span-3 space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Source Model (0%):</span>
              <select
                value={morphModelA}
                onChange={(e) => setMorphModelA(e.target.value as any)}
                className="w-full bg-[#060B14] border border-[#1B6CA8] rounded-lg px-3 py-2 text-xs text-white font-bold outline-none"
              >
                <option value="actual">Actual Volume (36 Months Raw)</option>
                <option value="sma">3-Period SMA (33,428 MAE)</option>
                <option value="wma">3-Period WMA (32,142 MAE)</option>
                <option value="ets">Exponential Smoothing α=0.50 (30,596 MAE)</option>
                <option value="trend">Trend Line (r = -0.39)</option>
              </select>
            </div>

            {/* Slider */}
            <div className="md:col-span-6 flex flex-col gap-1 text-center">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-sky-400 font-bold">{morphModelA.toUpperCase()} ({100 - morphT}%)</span>
                <span className="text-[#F2A541] font-bold text-sm bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800">
                  Morph: {morphT}%
                </span>
                <span className="text-amber-400 font-bold">{morphModelB.toUpperCase()} ({morphT}%)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={morphT}
                onChange={(e) => setMorphT(parseFloat(e.target.value))}
                className="w-full accent-[#F2A541] cursor-pointer"
              />
            </div>

            {/* Model B */}
            <div className="md:col-span-3 space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Target Model (100%):</span>
              <select
                value={morphModelB}
                onChange={(e) => setMorphModelB(e.target.value as any)}
                className="w-full bg-[#060B14] border border-[#F2A541] rounded-lg px-3 py-2 text-xs text-white font-bold outline-none"
              >
                <option value="ets">Exponential Smoothing α=0.50 (Conventional Winner)</option>
                <option value="arima">ARIMA (1,1,0) (Overall Winner · 20,919 MAE)</option>
                <option value="wma">3-Period WMA (0.5/0.3/0.2)</option>
                <option value="sma">3-Period SMA</option>
                <option value="actual">Actual Volume Data</option>
                <option value="trend">Trend Projection Line</option>
              </select>
            </div>
          </div>

          {/* Morphing Visual Canvas */}
          <div className="relative bg-[#060B14] rounded-xl border border-slate-800 p-4 overflow-hidden aspect-[16/8] flex items-center justify-center">
            {/* Background Grid */}
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="morphLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="50%" stopColor="#F2A541" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {[250000, 300000, 350000, 400000, 450000].map(v => (
                <g key={v}>
                  <line x1={padL} y1={toY(v)} x2={svgW - padR} y2={toY(v)} stroke="#1E293B" strokeDasharray="3 4" />
                  <text x={padL - 10} y={toY(v) + 4} textAnchor="end" fill="#64748B" className="text-[10px] font-mono">
                    {(v / 1000).toFixed(0)}k
                  </text>
                </g>
              ))}

              {/* Ghosted Source Path A */}
              <path d={pathA} fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3" />

              {/* Ghosted Target Path B */}
              <path d={pathB} fill="none" stroke="#F2A541" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3" />

              {/* LIVE MORPHING SPLINE PATH */}
              <motion.path
                d={morphedPath}
                fill="none"
                stroke="url(#morphLineGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Live Morphing Points */}
              {morphedValues.map((v, i) => {
                if (i % 3 !== 0 && i !== 13 && i !== 35) return null;
                const px = toX(i);
                const py = toY(v);
                return (
                  <g key={i}>
                    <circle cx={px} cy={py} r="4" fill="#F2A541" stroke="#060B14" strokeWidth="1.5" />
                    {i === 13 && (
                      <text x={px} y={py - 12} textAnchor="middle" fill="#F2A541" className="text-[9px] font-mono font-bold">
                        Feb 2023 Shock
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Morph Mathematical Formula Interpretation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-sky-500/30">
              <div className="text-[10px] font-mono uppercase text-sky-400 font-bold">Source Formula A</div>
              <div className="text-xs font-mono text-white mt-1">
                {morphModelA === 'actual' ? 'Y(t) = Raw Observed TEUs' : morphModelA === 'ets' ? 'F(t) = 0.50·Y(t-1) + 0.50·F(t-1)' : 'F(t) = (Y(t-1) + Y(t-2) + Y(t-3)) / 3'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 text-center">
              <div className="text-[10px] font-mono uppercase text-amber-400 font-bold">Linear Spline Morph Equation</div>
              <div className="text-xs font-mono text-white mt-1">
                M(t) = (1 - {tNorm.toFixed(2)})·A(t) + ({tNorm.toFixed(2)})·B(t)
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-orange-500/30">
              <div className="text-[10px] font-mono uppercase text-orange-400 font-bold">Target Formula B</div>
              <div className="text-xs font-mono text-white mt-1">
                {morphModelB === 'arima' ? 'ΔY(t) = c + 0.42·ΔY(t-1) + ε(t)' : morphModelB === 'ets' ? 'F(t) = 0.50·Y(t-1) + 0.50·F(t-1)' : 'Non-Linear Regression Ensemble'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 2: 3D SPATIAL ORBIT STAGE                               */}
      {/* ============================================================== */}
      {activeSubTab === 'spatial_stage' && (
        <div className="bg-[#0B2545]/90 border border-[#1B6CA8]/50 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>3D Spatial Orbit &amp; Camera Depth Sandbox</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Interactive Drag
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Click and drag on the stage below to orbit the camera in 3D space, or adjust the pitch, yaw, and zoom sliders.
              </p>
            </div>

            {/* Camera Presets */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-slate-400 hidden sm:inline">Preset:</span>
              <button
                onClick={() => { setPitch(24); setYaw(-20); setZoom(1.0); }}
                className="px-2.5 py-1 rounded bg-[#1B6CA8] hover:bg-sky-500 text-white font-bold"
              >
                Isometric 45°
              </button>
              <button
                onClick={() => { setPitch(0); setYaw(0); setZoom(1.0); }}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
              >
                Flat 2D
              </button>
              <button
                onClick={() => { setPitch(45); setYaw(0); setZoom(0.9); }}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
              >
                Top Perspective
              </button>
            </div>
          </div>

          {/* Interactive Sliders Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs font-mono">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Pitch: {pitch}°</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={pitch}
                onChange={(e) => setPitch(parseInt(e.target.value))}
                className="w-full accent-[#F2A541]"
              />
            </div>
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Yaw: {yaw}°</span>
              </div>
              <input
                type="range"
                min="-75"
                max="75"
                value={yaw}
                onChange={(e) => setYaw(parseInt(e.target.value))}
                className="w-full accent-[#F2A541]"
              />
            </div>
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Zoom: {zoom.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-[#F2A541]"
              />
            </div>
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Z-Depth: {depthExtrusion}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={depthExtrusion}
                onChange={(e) => setDepthExtrusion(parseInt(e.target.value))}
                className="w-full accent-[#F2A541]"
              />
            </div>
          </div>

          {/* 3D Orbit Stage Canvas */}
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className={`w-full aspect-video bg-[#060B14] rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden cursor-grab select-none relative ${
              isDragging ? 'cursor-grabbing' : ''
            }`}
            style={{ perspective: '1200px' }}
          >
            {/* Background 3D Perspective Plane */}
            <div
              className="w-[85%] h-[80%] relative flex items-center justify-center transition-transform duration-75"
              style={{
                transform: `rotateX(${pitch}deg) rotateY(${yaw}deg) scale(${zoom})`,
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Perspective Ground Grid */}
              <div 
                className="absolute inset-0 border border-sky-900/40 rounded-2xl bg-gradient-to-br from-[#0B2545]/60 to-[#060B14]/80 shadow-2xl"
                style={{ transform: 'translateZ(-30px)' }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293B_1px,transparent_1px),linear-gradient(to_bottom,#1E293B_1px,transparent_1px)] bg-[size:40px_40px] opacity-25" />
              </div>

              {/* 3D Floating Holographic Chart Ribbon */}
              <div 
                className="absolute inset-4 flex items-center justify-center"
                style={{ transform: `translateZ(${depthExtrusion}px)`, transformStyle: 'preserve-3d' }}
              >
                <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full overflow-visible">
                  <path
                    d={morphedPath}
                    fill="none"
                    stroke="#F2A541"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="drop-shadow-[0_10px_20px_rgba(242,165,65,0.4)]"
                  />

                  {/* 3D Pillars for key events */}
                  {[
                    { idx: 0, label: 'Jan 2022 Start', val: 411621, color: '#38BDF8' },
                    { idx: 13, label: 'Feb 2023 Shock (-32%)', val: 236264, color: '#F2A541' },
                    { idx: 30, label: 'Jul 2024 Validation Holdout', val: 445800, color: '#10B981' },
                    { idx: 35, label: 'Dec 2024 Peak', val: 460304, color: '#38BDF8' }
                  ].map(pin => {
                    const px = toX(pin.idx);
                    const py = toY(pin.val);
                    return (
                      <g key={pin.idx}>
                        <line x1={px} y1={py} x2={px} y2={svgH - padB} stroke={pin.color} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                        <circle cx={px} cy={py} r="6" fill={pin.color} stroke="#060B14" strokeWidth="2" />
                        <rect x={px - 60} y={py - 30} width="120" height="22" rx="4" fill="#0B2545" stroke={pin.color} strokeWidth="1" />
                        <text x={px} y={py - 16} textAnchor="middle" fill="#FFFFFF" className="text-[9px] font-mono font-bold">
                          {pin.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* 3D Floating Header HUD */}
              <div
                className="absolute top-2 left-4 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-[#1B6CA8] text-xs font-mono text-white flex items-center gap-2 shadow-xl"
                style={{ transform: `translateZ(${depthExtrusion + 25}px)` }}
              >
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                <span>3D Stage Orbit Active</span>
                <span className="text-[10px] text-amber-400">({pitch}°, {yaw}°)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 3: 3D ISOMETRIC CONTAINER TERMINAL YARD                 */}
      {/* ============================================================== */}
      {activeSubTab === 'containers' && (
        <div className="bg-[#0B2545]/90 border border-[#1B6CA8]/50 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>3D Isometric Container Terminal Yard</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Real TEU Heights
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Visualizes the physical reality of Port of Los Angeles monthly TEUs: container stacks physically drop and rise across the 36-month timeline.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsContainerPlaying(!isContainerPlaying)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                {isContainerPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isContainerPlaying ? 'Pause Timeline' : 'Play Timeline'}</span>
              </button>

              <button
                onClick={() => setContainerMonth(14)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold hover:bg-amber-500 hover:text-slate-950 transition-all"
              >
                Jump to Feb 2023 Shock
              </button>
            </div>
          </div>

          {/* Month Timeline Scrubber */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Selected Timeline Month:</span>
              <span className="text-white font-bold text-sm">
                Month {currentRow.period} of 36 · {currentRow.monthName} ({Math.round(currentRow.actual).toLocaleString()} TEUs)
              </span>
              <span className={currentRow.period === 14 ? 'text-rose-400 font-bold' : 'text-sky-400'}>
                {currentRow.period === 14 ? 'Lowest Recorded Month' : currentRow.period > 30 ? 'Validation Holdout' : 'Historical Data'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="36"
              value={containerMonth}
              onChange={(e) => setContainerMonth(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* 3D Isometric Terminal Yard Stage */}
          <div className="w-full aspect-[16/8] bg-[#060B14] rounded-xl border border-slate-800 p-6 flex items-center justify-center relative overflow-hidden">
            <svg viewBox="0 0 900 360" className="w-full h-full overflow-visible">
              {/* Wharf Ground Grid */}
              <g opacity="0.3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <line
                    key={i}
                    x1={30 + i * 105}
                    y1={320}
                    x2={130 + i * 105}
                    y2={220}
                    stroke="#334155"
                    strokeWidth="1"
                  />
                ))}
              </g>

              {/* Cargo Ship at Berth Silhouette */}
              <g transform="translate(680, 50)" opacity="0.4">
                <path d="M 0 160 L 180 160 L 160 210 L 20 210 Z" fill="#1E293B" stroke="#475569" />
                <rect x="30" y="100" width="80" height="60" fill="#0F172A" />
                <rect x="50" y="70" width="40" height="30" fill="#1E293B" />
                <text x="90" y="190" textAnchor="middle" fill="#64748B" className="text-[10px] font-mono">
                  BERTH 100 · POLA
                </text>
              </g>

              {/* 12 Key Period Stacks in Isometric 3D */}
              {[1, 4, 7, 10, 13, 14, 17, 20, 23, 26, 29, 36].map((p, idx) => {
                const row = FULL_TIME_SERIES[p - 1];
                const isSelected = row.period === containerMonth;
                const isFeb = row.period === 14;
                const stackH = ((row.actual - 200000) / 280000) * 150 + 40;
                const bx = 50 + idx * 68;
                const by = 280;

                return (
                  <g 
                    key={p} 
                    onClick={() => setContainerMonth(p)}
                    className="cursor-pointer group transition-all"
                  >
                    {/* Shadow */}
                    <ellipse cx={bx + 20} cy={by + 8} rx={26} ry={9} fill="#000" opacity="0.6" />

                    {/* Front Face */}
                    <rect
                      x={bx}
                      y={by - stackH}
                      width={38}
                      height={stackH}
                      rx={2}
                      fill={isFeb ? '#B45309' : isSelected ? '#F2A541' : '#1B6CA8'}
                      stroke={isFeb ? '#F2A541' : isSelected ? '#FFF' : '#38BDF8'}
                      strokeWidth={isSelected ? 2.5 : 1}
                    />

                    {/* Ribbing */}
                    {Array.from({ length: Math.floor(stackH / 16) }).map((_, li) => (
                      <line
                        key={li}
                        x1={bx + 3}
                        y1={by - stackH + 9 + li * 16}
                        x2={bx + 35}
                        y2={by - stackH + 9 + li * 16}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Top Face */}
                    <polygon
                      points={`${bx},${by - stackH} ${bx + 14},${by - stackH - 9} ${bx + 52},${by - stackH - 9} ${bx + 38},${by - stackH}`}
                      fill={isFeb ? '#F59E0B' : isSelected ? '#FDE68A' : '#38BDF8'}
                    />

                    {/* Right Face */}
                    <polygon
                      points={`${bx + 38},${by - stackH} ${bx + 52},${by - stackH - 9} ${bx + 52},${by - 9} ${bx + 38},${by}`}
                      fill={isFeb ? '#78350F' : isSelected ? '#B45309' : '#0F3858'}
                    />

                    {/* Month Label */}
                    <text
                      x={bx + 19}
                      y={by + 24}
                      textAnchor="middle"
                      fill={isSelected ? '#F2A541' : '#94A3B8'}
                      className={`text-[9px] font-mono ${isSelected ? 'font-bold' : ''}`}
                    >
                      {row.monthName.split(' ')[0].slice(0, 3)}
                    </text>

                    {/* TEU Figure on Hover or Select */}
                    {isSelected && (
                      <g transform={`translate(${bx - 20}, ${by - stackH - 50})`}>
                        <rect width="78" height="28" rx="6" fill="#0B2545" stroke="#F2A541" strokeWidth="1.5" />
                        <text x="39" y="18" textAnchor="middle" fill="#FFFFFF" className="text-[10px] font-mono font-bold">
                          {(row.actual / 1000).toFixed(0)}k TEUs
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 4: 3D VOLUMETRIC EXTENDED PRISM BARS                    */}
      {/* ============================================================== */}
      {activeSubTab === 'prism_bars' && (
        <div className="bg-[#0B2545]/90 border border-[#1B6CA8]/50 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>3D Volumetric Extruded Prism Race</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                Shortest Bar Wins
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Rendered with 3D isometric extrusion, specular highlight bevels, and ground shadows to showcase true comparative depth.
            </p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto py-4">
            {VALIDATION_METRICS.sort((a, b) => a.mae - b.mae).map((model, idx) => {
              const maxMae = 52142;
              const barWidthPct = (model.mae / maxMae) * 100;
              const isWinner = model.validationRank === 1 || idx === 0;

              return (
                <div key={model.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className={`flex items-center gap-2 ${isWinner ? 'text-amber-400 font-bold text-sm' : 'text-slate-300'}`}>
                      <span>#{idx + 1} {model.name}</span>
                      {isWinner && <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black">WINNER ★</span>}
                    </span>
                    <span className={isWinner ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                      {model.mae.toLocaleString()} TEUs (MAPE: {model.mape.toFixed(2)}%)
                    </span>
                  </div>

                  {/* 3D Prism Bar Container */}
                  <div className="h-6 relative flex items-center" style={{ perspective: '800px', transformStyle: 'preserve-3d' }}>
                    {/* Shadow */}
                    <div
                      className="absolute -bottom-1 left-2 h-2 rounded-full blur-[2px] opacity-40 transition-all"
                      style={{
                        width: `${barWidthPct}%`,
                        background: isWinner ? '#F2A541' : '#1B6CA8',
                        transform: 'translateZ(-10px) rotateX(40deg)'
                      }}
                    />

                    {/* Front Face */}
                    <div className="w-full h-4 bg-slate-950 rounded-sm overflow-visible relative border border-slate-800">
                      <div
                        className={`h-full relative rounded-sm ${
                          isWinner
                            ? 'bg-gradient-to-r from-amber-600 via-[#F2A541] to-amber-300 shadow-[0_0_15px_rgba(242,165,65,0.6)]'
                            : 'bg-gradient-to-r from-[#0B2545] via-[#1B6CA8] to-sky-400'
                        }`}
                        style={{ width: `${barWidthPct}%` }}
                      >
                        {/* Top Isometric Plane */}
                        <div
                          className="absolute -top-1.5 left-0 right-0 h-1.5 opacity-80 rounded-t-sm"
                          style={{
                            background: isWinner ? 'linear-gradient(90deg, #FDE68A, #F59E0B)' : 'linear-gradient(90deg, #BAE6FD, #0284C7)',
                            transform: 'skewX(-35deg) translateY(-0.5px)'
                          }}
                        />

                        {/* End Cap Plane */}
                        <div
                          className="absolute top-0 -right-2 w-2 h-full opacity-90 rounded-r-sm"
                          style={{
                            background: isWinner ? '#B45309' : '#075985',
                            transform: 'skewY(-35deg)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
