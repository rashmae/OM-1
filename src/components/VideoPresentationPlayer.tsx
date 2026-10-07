import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, 
  Maximize, Minimize, Mic, Download, Layers,
  ChevronRight, ArrowRight, ShieldCheck, Ship, Anchor,
  Video, Printer, Check, Sparkles, TrendingUp, BarChart3, Sliders, Cpu,
  Award, Compass, Activity, Brain, UserCheck, Terminal, AlertTriangle,
  Calendar, Zap, Waves
} from 'lucide-react';
import { KEYNOTE_BEATS, KeynoteBeat, TOTAL_KEYNOTE_SECONDS } from '../data/presentationSlides';
import { FULL_TIME_SERIES, BaselineModelChoice, GROUP_INFO, VALIDATION_METRICS } from '../data/forecastingData';
import { ambientDrone } from '../utils/ambientAudio';
import { ExportPresentationModal } from './ExportPresentationModal';
import { 
  exportPrintableDeck, 
  downloadOfficialPPTX, 
  downloadOfficialVideoMP4, 
  formatTime 
} from '../utils/exportPresentation';
import { generateNativePPTX } from '../utils/pptxExport';

// Authoritative Image Assets for Group 7 Keynote - 3D Character Mascots & Maritime Port Scenery
const MASCOT_BLUE = '/src/assets/images/mascot_blue_analyst_1791196865420.jpg';
const MASCOT_ORANGE = '/src/assets/images/mascot_orange_planner_1791196885029.jpg';
const MASCOT_GREEN = '/src/assets/images/mascot_green_validator_1791196903349.jpg';

const ESTABLISHING_SHOT_IMG = '/src/assets/images/cargo_ship_breakwater_1791024998811.jpg';
const PORT_TERMINAL_IMG = '/src/assets/images/pola_container_terminal_1791024986178.jpg';
const CONTAINER_YARD_IMG = '/src/assets/images/container_yard_twilight_1791025012665.jpg';
const OPERATIONS_COMMAND_IMG = '/src/assets/images/operations_analytics_command_1790930073715.jpg';
const PORT_PLANNER_IMG = '/src/assets/images/port_control_planner_1791028044582.jpg';

interface VideoPresentationPlayerProps {
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  selectedBaseline?: BaselineModelChoice;
  onSelectBaseline?: (b: BaselineModelChoice) => void;
  onOpen3DStudio?: () => void;
}

export const VideoPresentationPlayer: React.FC<VideoPresentationPlayerProps> = ({
  isPlaying,
  setIsPlaying,
  onOpen3DStudio
}) => {
  const [currentBeatIndex, setCurrentBeatIndex] = useState<number>(0);
  const [beatElapsedSeconds, setBeatElapsedSeconds] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showPresenterHUD, setShowPresenterHUD] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isGeneratingPPTX, setIsGeneratingPPTX] = useState<boolean>(false);
  const [mouseActive, setMouseActive] = useState<boolean>(true);
  const [videoNotification, setVideoNotification] = useState<string | null>(null);
  const [beat1SelectedComponent, setBeat1SelectedComponent] = useState<'all' | 'trend' | 'seasonality' | 'cyclicality' | 'randomness' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentBeat: KeynoteBeat = KEYNOTE_BEATS[currentBeatIndex] || KEYNOTE_BEATS[0];

  // Cumulative elapsed seconds across all beats
  const totalElapsedSeconds = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < currentBeatIndex; i++) {
      sum += KEYNOTE_BEATS[i].durationSeconds;
    }
    return sum + beatElapsedSeconds;
  }, [currentBeatIndex, beatElapsedSeconds]);

  // Master Playback Timer (Tick every 100ms) - Pure ticker
  useEffect(() => {
    if (!isPlaying) {
      ambientDrone.stop();
      return;
    }

    if (!isMuted) {
      ambientDrone.play();
    }

    const interval = setInterval(() => {
      setBeatElapsedSeconds((prev) => prev + 0.1);
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [isPlaying, isMuted]);

  // Clean Beat Progression and Completion Effect (runs during commit phase, not during render)
  useEffect(() => {
    if (!isPlaying) return;

    const duration = currentBeat.durationSeconds;
    if (beatElapsedSeconds >= duration) {
      if (currentBeatIndex < KEYNOTE_BEATS.length - 1) {
        setCurrentBeatIndex((idx) => idx + 1);
        setBeatElapsedSeconds(0);
      } else {
        setIsPlaying(false);
        ambientDrone.stop();
        setBeatElapsedSeconds(duration);
      }
    }
  }, [beatElapsedSeconds, currentBeat.durationSeconds, currentBeatIndex, isPlaying, setIsPlaying]);

  // Ensure ambient audio stops if unmounted
  useEffect(() => {
    return () => {
      ambientDrone.stop();
    };
  }, []);

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (isPlaying) ambientDrone.play();
    } else {
      setIsMuted(true);
      ambientDrone.stop();
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Jump to specific beat
  const skipToBeat = (index: number) => {
    setCurrentBeatIndex(index);
    setBeatElapsedSeconds(0);
  };

  // Keyboard Shortcuts (Space, Arrows, F, C, P, V, S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        skipToBeat(Math.min(KEYNOTE_BEATS.length - 1, currentBeatIndex + 1));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        skipToBeat(Math.max(0, currentBeatIndex - 1));
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setShowPresenterHUD((prev) => !prev);
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handleDownloadPPTX();
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        handleDownloadVideoMP4();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleExportSlides();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentBeatIndex, setIsPlaying]);

  // Mouse activity timer for autohiding transport
  const handleMouseMove = () => {
    setMouseActive(true);
    if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
    mouseTimerRef.current = setTimeout(() => {
      if (isPlaying) setMouseActive(false);
    }, 2800);
  };

  // Export Handlers
  const handleDownloadPPTX = async () => {
    setIsGeneratingPPTX(true);
    setVideoNotification("Generating official PowerPoint Presentation (.pptx)...");
    try {
      await generateNativePPTX();
      setVideoNotification("PowerPoint Deck downloaded successfully!");
    } catch {
      downloadOfficialPPTX();
      setVideoNotification("Direct PPTX downloaded successfully!");
    } finally {
      setIsGeneratingPPTX(false);
      setTimeout(() => setVideoNotification(null), 4000);
    }
  };

  const handleDownloadVideoMP4 = () => {
    downloadOfficialVideoMP4();
    setVideoNotification("Downloading official 1080p Keynote Video (MP4)...");
    setTimeout(() => setVideoNotification(null), 4000);
  };

  const handleExportSlides = () => {
    exportPrintableDeck();
  };

  // SVG Chart Geometry Constants
  const svgWidth = 1000;
  const svgHeight = 440;
  const padLeft = 85;
  const padRight = 65;
  const padTop = 50;
  const padBottom = 55;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;
  const minVal = 200000;
  const maxVal = 480000;

  const getX = (period: number) => padLeft + ((period - 1) / 35) * plotW;
  const getY = (val: number) => padTop + plotH - ((val - minVal) / (maxVal - minVal)) * plotH;

  const actualPoints = useMemo(() => {
    return FULL_TIME_SERIES.map((row) => ({
      period: row.period,
      x: getX(row.period),
      y: getY(row.actual),
      val: row.actual,
      month: row.monthName
    }));
  }, []);

  const actualPathString = useMemo(() => {
    return actualPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
  }, [actualPoints]);

  const smaPoints = useMemo(() => {
    return FULL_TIME_SERIES.filter((r) => r.sma3 !== undefined).map((r) => ({
      x: getX(r.period),
      y: getY(r.sma3!)
    }));
  }, []);

  const wmaPoints = useMemo(() => {
    return FULL_TIME_SERIES.filter((r) => r.wma3 !== undefined).map((r) => ({
      x: getX(r.period),
      y: getY(r.wma3!)
    }));
  }, []);

  const es05Points = useMemo(() => {
    return FULL_TIME_SERIES.filter((r) => r.es05 !== undefined).map((r) => ({
      x: getX(r.period),
      y: getY(r.es05!)
    }));
  }, []);

  const es02Points = useMemo(() => {
    return FULL_TIME_SERIES.filter((r) => r.es02 !== undefined).map((r) => ({
      x: getX(r.period),
      y: getY(r.es02!)
    }));
  }, []);

  const es08Points = useMemo(() => {
    return FULL_TIME_SERIES.filter((r) => r.es08 !== undefined).map((r) => ({
      x: getX(r.period),
      y: getY(r.es08!)
    }));
  }, []);

  const trendPoints = useMemo(() => {
    return [
      { x: getX(1), y: getY(FULL_TIME_SERIES[0].trend || 409404) },
      { x: getX(36), y: getY(FULL_TIME_SERIES[35].trend || 331833) }
    ];
  }, []);

  // Validation models (Periods 31-36 from PDF Table 5.4)
  const valArimaPoints = useMemo(() => {
    const arimaVals = [395788, 435086, 449029, 454461, 442723, 427066];
    return arimaVals.map((v, i) => ({ x: getX(31 + i), y: getY(v) }));
  }, []);

  const valLrPoints = useMemo(() => {
    const lrVals = [380816, 404950, 416225, 420463, 414842, 405430];
    return lrVals.map((v, i) => ({ x: getX(31 + i), y: getY(v) }));
  }, []);

  const valRfPoints = useMemo(() => {
    const rfVals = [365739, 401997, 412902, 433329, 438313, 420364];
    return rfVals.map((v, i) => ({ x: getX(31 + i), y: getY(v) }));
  }, []);

  const toPath = (pts: { x: number; y: number }[]) => {
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  };

  // Accurate Validation Holdout Data from Matplotlib Graph & Google Colab Output (IMG_0379)
  const mlHoldoutData = useMemo(() => [
    { period: 31, date: '2024-07', month: '2024-07', actual: 437961.00, arima: 395788, lr: 380816, rf: 365739 },
    { period: 32, date: '2024-08', month: '2024-08', actual: 449897.75, arima: 435086, lr: 404950, rf: 401997 },
    { period: 33, date: '2024-09', month: '2024-09', actual: 454819.50, arima: 449029, lr: 416225, rf: 412902 },
    { period: 34, date: '2024-10', month: '2024-10', actual: 441773.25, arima: 454461, lr: 420463, rf: 433329 },
    { period: 35, date: '2024-11', month: '2024-11', actual: 425911.50, arima: 442723, lr: 414842, rf: 438313 },
    { period: 36, date: '2024-12', month: '2024-12', actual: 460304.25, arima: 427066, lr: 405430, rf: 420364 }
  ], []);

  // Movement dynamic sequence code requested for visualization rhythm
  const movementPulseArray = useMemo(() => [4, 6, 5.5, 9, 8, 13, 12.5, 19, 24, 23, 33, 48], []);

  const holdoutSvgW = 960;
  const holdoutSvgH = 370;
  const holdoutPadL = 80;
  const holdoutPadR = 210;
  const holdoutPadT = 45;
  const holdoutPadB = 55;
  const holdoutPlotW = holdoutSvgW - holdoutPadL - holdoutPadR;
  const holdoutPlotH = holdoutSvgH - holdoutPadT - holdoutPadB;
  const holdoutMinY = 360000;
  const holdoutMaxY = 465000;

  const getHoldoutX = (idx: number) => holdoutPadL + (idx / 5) * holdoutPlotW;
  const getHoldoutY = (val: number) => holdoutPadT + holdoutPlotH - ((val - holdoutMinY) / (holdoutMaxY - holdoutMinY)) * holdoutPlotH;

  const holdoutActualPoints = useMemo(() => mlHoldoutData.map((d, i) => ({ x: getHoldoutX(i), y: getHoldoutY(d.actual), val: d.actual, month: d.month })), [mlHoldoutData]);
  const holdoutArimaPoints  = useMemo(() => mlHoldoutData.map((d, i) => ({ x: getHoldoutX(i), y: getHoldoutY(d.arima), val: d.arima, month: d.month })), [mlHoldoutData]);
  const holdoutLrPoints     = useMemo(() => mlHoldoutData.map((d, i) => ({ x: getHoldoutX(i), y: getHoldoutY(d.lr), val: d.lr, month: d.month })), [mlHoldoutData]);
  const holdoutRfPoints     = useMemo(() => mlHoldoutData.map((d, i) => ({ x: getHoldoutX(i), y: getHoldoutY(d.rf), val: d.rf, month: d.month })), [mlHoldoutData]);

  const holdoutActualPath = useMemo(() => holdoutActualPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' '), [holdoutActualPoints]);
  const holdoutArimaPath  = useMemo(() => holdoutArimaPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' '), [holdoutArimaPoints]);
  const holdoutLrPath     = useMemo(() => holdoutLrPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' '), [holdoutLrPoints]);
  const holdoutRfPath     = useMemo(() => holdoutRfPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' '), [holdoutRfPoints]);

  // Active decomposition component in Beat 1 (either manually chosen or auto-sequenced)
  const activeBeat1Component = useMemo(() => {
    if (beat1SelectedComponent) return beat1SelectedComponent;
    if (currentBeatIndex !== 1) return 'all';
    if (beatElapsedSeconds < 14) return 'all';
    if (beatElapsedSeconds < 18) return 'trend';
    if (beatElapsedSeconds < 22) return 'seasonality';
    if (beatElapsedSeconds < 26) return 'cyclicality';
    if (beatElapsedSeconds < 34) return 'randomness';
    return 'all';
  }, [beat1SelectedComponent, currentBeatIndex, beatElapsedSeconds]);

  // Macroeconomic cycle points (3-year wave: 2022 high -> 2023 destocking trough -> 2024 recovery surge)
  const macroCyclePoints = useMemo(() => {
    return Array.from({ length: 36 }).map((_, i) => {
      const t = i + 1;
      const norm = (t - 1) / 35; // 0 to 1
      const val = 415000 - 85000 * Math.sin(norm * Math.PI * 0.95) + 38000 * norm;
      return { x: getX(t), y: getY(val) };
    });
  }, []);

  // Noise band upper and lower paths (for Randomness / Irregular component)
  const noiseBandUpperPath = useMemo(() => {
    const pts = FULL_TIME_SERIES.map((r) => ({
      x: getX(r.period),
      y: getY(r.actual + 13000)
    }));
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  }, []);

  const noiseBandLowerPath = useMemo(() => {
    const pts = FULL_TIME_SERIES.map((r) => ({
      x: getX(r.period),
      y: getY(r.actual - 13000)
    }));
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  }, []);

  // Full validation ranking models (Exact from Analytical Report Table 2)
  const validationRanking = [
    { rank: 1, name: 'ARIMA (1,1,0)', mae: 20919, rmse: 24426, mape: 4.71, isWinner: true },
    { rank: 2, name: 'ETS α = 0.80', mae: 22952, rmse: 26323, mape: 5.17, isWinner: false },
    { rank: 3, name: 'ETS α = 0.50 (Selected)', mae: 27725, rmse: 33064, mape: 6.22, isWinner: false },
    { rank: 4, name: '3-Period WMA', mae: 28473, rmse: 32962, mape: 6.41, isWinner: false },
    { rank: 5, name: '3-Period SMA', mae: 31927, rmse: 37934, mape: 7.19, isWinner: false },
    { rank: 6, name: 'Random Forest', mae: 37138, rmse: 42988, mape: 8.31, isWinner: false },
    { rank: 7, name: 'Lagged Linear Regression', mae: 37990, rmse: 41559, mape: 8.48, isWinner: false },
    { rank: 8, name: 'ETS α = 0.20', mae: 44787, rmse: 48914, mape: 10.00, isWinner: false },
    { rank: 9, name: 'Trend Projection', mae: 107737, rmse: 108450, mape: 24.15, isWinner: false }
  ];

  // Beat 1 drawing index (for period line draw)
  const beat1DrawIndex = useMemo(() => {
    if (currentBeatIndex !== 1) return 35;
    if (beatElapsedSeconds < 13) return 0;
    if (beatElapsedSeconds < 24) {
      return Math.min(13, Math.floor(((beatElapsedSeconds - 13) / 11) * 14));
    }
    if (beatElapsedSeconds < 27) return 13; // hold at Feb 2023
    return Math.min(35, 13 + Math.floor(((beatElapsedSeconds - 27) / 9) * 23));
  }, [currentBeatIndex, beatElapsedSeconds]);

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      {/* Full Screen Steady Cinema Keynote Stage */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className={`relative w-full h-full bg-[#060B14] overflow-hidden select-none flex items-center justify-center transition-all ${
          isFullscreen ? '!fixed !inset-0 !z-50 !w-screen !h-screen !max-w-none !rounded-none !border-none !aspect-auto bg-[#060B14]' : ''
        }`}
      >
        {/* Subtle radial depth gradient in Apple keynote stage style */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background: 'radial-gradient(circle at 50% 45%, #0B2545 0%, #060B14 85%)'
          }}
        />

        {/* Floating Notification Toast */}
        <AnimatePresence>
          {videoNotification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-6 right-6 z-50 px-4 py-2 bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs font-semibold rounded-xl shadow-2xl flex items-center gap-2 backdrop-blur-md"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{videoNotification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Steady Full Screen Presentation Viewport */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-auto"
        >

        {/* ============================================================== */}
        {/* BEAT 0 (0:00 - 0:25 · 25s): PROLOGUE — "MEET GROUP 7"           */}
        {/* ============================================================== */}
        {currentBeatIndex === 0 && (
          <div className="absolute inset-0 flex items-center justify-center p-6 md:p-12 overflow-hidden">
            {/* Ambient Background Grid & Subtle Lighting */}
            <div className="absolute inset-0 bg-[#060B14]">
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, #1B6CA8 1.5px, transparent 1.5px)`,
                  backgroundSize: '40px 40px'
                }}
              />
            </div>

            {/* Kinetic Branching Lines Background (Inspired by Reference Video 1) */}
            <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
              <path d="M 100 250 C 250 250, 300 120, 500 120 C 700 120, 800 250, 900 250" fill="none" stroke="#1B6CA8" strokeWidth="2" strokeDasharray="4 6" />
              <path d="M 100 250 C 250 250, 350 380, 500 380 C 650 380, 750 250, 900 250" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="6 6" />
            </svg>

            {/* Phase 0a (0.0s - 5.5s): Spotlight Member 1 - Elaiza Jane Aligato (Blue Analyst Mascot) */}
            {beatElapsedSeconds < 5.5 && (
              <motion.div
                key="member1"
                initial={{ opacity: 0, scale: 0.90, y: 25 }}
                animate={{ opacity: 1, scale: 1.0, y: 0 }}
                exit={{ opacity: 0, scale: 1.06, y: -20 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-20 flex flex-col md:flex-row items-center gap-8 max-w-4xl w-full"
              >
                {/* 3D Character Hologram Card with Mascot */}
                <div className="relative group">
                  <div className="w-56 h-56 md:w-68 md:h-68 rounded-3xl overflow-hidden border-2 border-sky-400 shadow-[0_0_50px_rgba(56,189,248,0.45)] relative bg-[#0B2545]/90 flex items-center justify-center p-3">
                    <img 
                      src={MASCOT_BLUE} 
                      alt="Blue Mascot - Elaiza Jane Aligato - Lead Analyst" 
                      className="w-full h-full object-contain filter drop-shadow-xl"
                    />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-sky-300 bg-slate-950/80 px-3 py-1 rounded-full border border-sky-500/40">
                      <span className="flex items-center gap-1 font-bold">
                        <Activity className="w-3.5 h-3.5 text-sky-400" />
                        <span>TIME-SERIES SIGNAL</span>
                      </span>
                      <span className="text-slate-400">01 / 03</span>
                    </div>
                  </div>
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-sky-500 to-[#1B6CA8] opacity-40 blur-xl -z-10" />
                </div>

                {/* Profile Details & Skill Badges */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2.5 max-w-lg">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
                    <Compass className="w-3.5 h-3.5 text-sky-400" />
                    <span>Specialist 1 of 3</span>
                  </div>

                  <h2 className="text-3xl md:text-5xl font-extralight tracking-tight text-white">
                    Aligato, Elaiza Jane
                  </h2>

                  <div className="text-sm md:text-base font-mono text-sky-400 font-semibold tracking-wide">
                    Lead Analyst &amp; Time-Series Specialist
                  </div>

                  <p className="text-xs md:text-sm font-serif italic text-slate-300 border-l-2 border-sky-400/60 pl-3 my-1">
                    "Sees the Signal &amp; Seasonality"
                  </p>

                  {/* 3 Customized Skill Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-sky-500/40 text-xs font-mono font-semibold text-slate-200 flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                      ARIMA (1,1,0)
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-amber-500/40 text-xs font-mono font-semibold text-amber-300 flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-[#F2A541]" />
                      ETS α = 0.50
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-xs font-mono text-slate-300">
                      Trend Decomposition
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Phase 0b (5.5s - 11.0s): Spotlight Member 2 - Rash Mae Crystelle C. Ansay (Orange Planner Mascot) */}
            {beatElapsedSeconds >= 5.5 && beatElapsedSeconds < 11.0 && (
              <motion.div
                key="member2"
                initial={{ opacity: 0, scale: 0.90, y: 25 }}
                animate={{ opacity: 1, scale: 1.0, y: 0 }}
                exit={{ opacity: 0, scale: 1.06, y: -20 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-20 flex flex-col md:flex-row items-center gap-8 max-w-4xl w-full"
              >
                {/* 3D Character Hologram Card with Mascot */}
                <div className="relative group">
                  <div className="w-56 h-56 md:w-68 md:h-68 rounded-3xl overflow-hidden border-2 border-amber-400 shadow-[0_0_50px_rgba(242,165,65,0.5)] relative bg-[#0B2545]/90 flex items-center justify-center p-3">
                    <img 
                      src={MASCOT_ORANGE} 
                      alt="Orange Mascot - Rash Mae Crystelle C. Ansay - Logistics Planner" 
                      className="w-full h-full object-contain filter drop-shadow-xl"
                    />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-amber-300 bg-slate-950/80 px-3 py-1 rounded-full border border-amber-500/40">
                      <span className="flex items-center gap-1 font-bold">
                        <Ship className="w-3.5 h-3.5 text-amber-400" />
                        <span>PORT CAPACITY &amp; BERTH</span>
                      </span>
                      <span className="text-slate-400">02 / 03</span>
                    </div>
                  </div>
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500 to-[#1B6CA8] opacity-40 blur-xl -z-10" />
                </div>

                {/* Profile Details & Skill Badges */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2.5 max-w-lg">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
                    <Award className="w-3.5 h-3.5 text-[#F2A541]" />
                    <span>Group Leader · Specialist 2 of 3</span>
                  </div>

                  <h2 className="text-3xl md:text-5xl font-extralight tracking-tight text-white">
                    Ansay, Rash Mae Crystelle C.
                  </h2>

                  <div className="text-sm md:text-base font-mono text-amber-400 font-semibold tracking-wide">
                    Port Operations &amp; Logistics Planner
                  </div>

                  <p className="text-xs md:text-sm font-serif italic text-slate-300 border-l-2 border-amber-400/60 pl-3 my-1">
                    "Sees the Operational Capacity"
                  </p>

                  {/* 3 Customized Skill Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-amber-500/40 text-xs font-mono font-semibold text-amber-300 flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-[#F2A541] animate-pulse" />
                      Berth Scheduling
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-sky-500/40 text-xs font-mono font-semibold text-sky-300 flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      Yard Utilization
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-xs font-mono text-slate-300">
                      TEU Throughput
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Phase 0c (11.0s - 16.5s): Spotlight Member 3 - Mylene Joy Villagracia (Green Validator Mascot) */}
            {beatElapsedSeconds >= 11.0 && beatElapsedSeconds < 16.5 && (
              <motion.div
                key="member3"
                initial={{ opacity: 0, scale: 0.90, y: 25 }}
                animate={{ opacity: 1, scale: 1.0, y: 0 }}
                exit={{ opacity: 0, scale: 1.06, y: -20 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-20 flex flex-col md:flex-row items-center gap-8 max-w-4xl w-full"
              >
                {/* 3D Character Hologram Card with Mascot */}
                <div className="relative group">
                  <div className="w-56 h-56 md:w-68 md:h-68 rounded-3xl overflow-hidden border-2 border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.45)] relative bg-[#0B2545]/90 flex items-center justify-center p-3">
                    <img 
                      src={MASCOT_GREEN} 
                      alt="Green Mascot - Mylene Joy Villagracia - ML & Validation Engineer" 
                      className="w-full h-full object-contain filter drop-shadow-xl"
                    />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-emerald-300 bg-slate-950/80 px-3 py-1 rounded-full border border-emerald-500/40">
                      <span className="flex items-center gap-1 font-bold">
                        <Brain className="w-3.5 h-3.5 text-emerald-400" />
                        <span>PREDICTIVE VALIDATION</span>
                      </span>
                      <span className="text-slate-400">03 / 03</span>
                    </div>
                  </div>
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500 to-sky-500 opacity-40 blur-xl -z-10" />
                </div>

                {/* Profile Details & Skill Badges */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2.5 max-w-lg">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Specialist 3 of 3</span>
                  </div>

                  <h2 className="text-3xl md:text-5xl font-extralight tracking-tight text-white">
                    Villagracia, Mylene Joy
                  </h2>

                  <div className="text-sm md:text-base font-mono text-emerald-400 font-semibold tracking-wide">
                    Validation &amp; Machine Learning Engineer
                  </div>

                  <p className="text-xs md:text-sm font-serif italic text-slate-300 border-l-2 border-emerald-400/60 pl-3 my-1">
                    "Sees the Predictive Accuracy"
                  </p>

                  {/* 3 Customized Skill Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-emerald-500/40 text-xs font-mono font-semibold text-emerald-300 flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      MAE / RMSE
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-sky-500/40 text-xs font-mono font-semibold text-sky-300 flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      Random Forest
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-xs font-mono text-slate-300">
                      Lagged Regression
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Phase 0d (16.5s - 25.0s): The Team Lineup - 3 Mascots Assemble Side-by-Side */}
            {beatElapsedSeconds >= 16.5 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ 
                  opacity: 1, 
                  scale: beatElapsedSeconds > 22.5 ? 1.05 : 1.0
                }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-20 flex flex-col items-center gap-4 max-w-5xl w-full text-center"
              >
                {/* Header & Subtitle */}
                <div className="space-y-1">
                  <div className="text-xs font-mono text-[#F2A541] uppercase tracking-[0.3em] font-bold">
                    Applied Study 1 · IE-PC 3112: Operations Management 1
                  </div>
                  <h1 className="text-3xl md:text-5xl font-light text-white tracking-tight">
                    Together, we are <span className="font-bold text-sky-400">Group 7</span> (Section D10)
                  </h1>
                  <p className="text-xs md:text-sm font-sans text-slate-300 max-w-2xl mx-auto">
                    "Turning 36 Months of Port Data into High-Confidence Terminal Operations."
                  </p>
                </div>

                {/* 3 Mascots Assemble Side-by-Side with 3D Depth & Float Animation */}
                <div className="grid grid-cols-3 gap-4 md:gap-8 w-full max-w-4xl mt-3">
                  {/* Member 1 Mascot Card */}
                  <motion.div
                    animate={{ y: [0, -7, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="p-3 md:p-5 rounded-2xl bg-slate-950/85 border border-sky-500/50 shadow-2xl flex flex-col items-center text-center gap-2.5 group hover:border-sky-400 backdrop-blur-md"
                  >
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden border border-sky-400 shadow-md bg-[#0B2545]/70 flex items-center justify-center p-1.5">
                      <img src={MASCOT_BLUE} alt="Elaiza Jane Aligato" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="text-xs md:text-sm font-bold text-white leading-tight">Elaiza Jane Aligato</div>
                      <div className="text-[10px] md:text-xs font-mono text-sky-400">Lead Analyst</div>
                      <div className="text-[9px] text-slate-400 font-serif italic mt-0.5">"Signal &amp; Seasonality"</div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1 text-[9px] font-mono text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-sky-950/90 border border-sky-800 text-sky-300">ARIMA</span>
                      <span className="px-2 py-0.5 rounded bg-amber-950/90 border border-amber-800 text-amber-300">ETS α=0.50</span>
                    </div>
                  </motion.div>

                  {/* Member 2 Mascot Card (Leader - elevated in 3D) */}
                  <motion.div
                    animate={{ y: [0, -9, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                    className="p-3 md:p-5 rounded-2xl bg-[#0B2545]/95 border-2 border-amber-500 shadow-2xl flex flex-col items-center text-center gap-2.5 group scale-105 z-10 backdrop-blur-md ring-2 ring-amber-500/30"
                  >
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-[#F2A541] shadow-lg bg-[#060B14] flex items-center justify-center p-1.5">
                      <img src={MASCOT_ORANGE} alt="Rash Mae Crystelle C. Ansay" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="text-xs md:text-sm font-bold text-white leading-tight">Rash Mae Crystelle Ansay</div>
                      <div className="text-[10px] md:text-xs font-mono text-[#F2A541] font-bold">Group Leader · Logistics</div>
                      <div className="text-[9px] text-slate-300 font-serif italic mt-0.5">"Operational Capacity"</div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1 text-[9px] font-mono text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-amber-950/90 border border-amber-700 text-amber-200">Berth Scheduling</span>
                      <span className="px-2 py-0.5 rounded bg-sky-950/90 border border-sky-800 text-sky-200">Yard Staging</span>
                    </div>
                  </motion.div>

                  {/* Member 3 Mascot Card */}
                  <motion.div
                    animate={{ y: [0, -7, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                    className="p-3 md:p-5 rounded-2xl bg-slate-950/85 border border-emerald-500/50 shadow-2xl flex flex-col items-center text-center gap-2.5 group hover:border-emerald-400 backdrop-blur-md"
                  >
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden border border-emerald-400 shadow-md bg-[#0B2545]/70 flex items-center justify-center p-1.5">
                      <img src={MASCOT_GREEN} alt="Mylene Joy Villagracia" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="text-xs md:text-sm font-bold text-white leading-tight">Mylene Joy Villagracia</div>
                      <div className="text-[10px] md:text-xs font-mono text-emerald-400">ML Validation</div>
                      <div className="text-[9px] text-slate-400 font-serif italic mt-0.5">"Predictive Accuracy"</div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1 text-[9px] font-mono text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-800 text-emerald-300">MAE / RMSE</span>
                      <span className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-slate-300">Random Forest</span>
                    </div>
                  </motion.div>
                </div>

                {/* Seamless Morph Transition Indicator */}
                {beatElapsedSeconds > 22 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-xs font-mono text-sky-400 mt-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-400/40 shadow-lg"
                  >
                    <span>ENTERING SCENE 01: THE MARITIME SIGNAL</span>
                    <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* BEAT 1 (0:25 - 1:05 · 40s): REAL WORLD -> DATA (BRANCHING SYNAPSE) */}
        {/* ============================================================== */}
        {currentBeatIndex === 1 && (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            {/* Phase 1a (0s - 3s): Opening shot, physical port environment, no text */}
            {beatElapsedSeconds < 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 1.0 }}
                animate={{ opacity: 1, scale: 1.04 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.8, ease: 'easeOut' }}
                className="absolute inset-0 w-full h-full overflow-hidden"
              >
                <img
                  src={ESTABLISHING_SHOT_IMG}
                  alt="Port of Los Angeles Breakwater"
                  className="w-full h-full object-cover brightness-[0.75] contrast-[1.08]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060B14] via-transparent to-transparent opacity-85" />
              </motion.div>
            )}

            {/* Phase 1b (3s - 7s): MORPH 1 — Physical containers morph into glowing data points */}
            {beatElapsedSeconds >= 3 && beatElapsedSeconds < 7 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center overflow-hidden"
              >
                <img
                  src={PORT_TERMINAL_IMG}
                  alt="Port of Los Angeles Terminal"
                  className="w-full h-full object-cover brightness-[0.4] contrast-[1.1] filter blur-[1px]"
                />
                <div className="absolute inset-0 bg-[#060B14]/75" />
                {/* 3D Data Particles Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 1000 500" className="w-full h-full">
                    {Array.from({ length: 36 }).map((_, i) => {
                      const px = 100 + (i * 22) + ((i % 4) * 8);
                      const py = 200 + Math.sin(i * 0.4) * 90;
                      return (
                        <g key={i}>
                          <motion.rect
                            initial={{ width: 24, height: 14, opacity: 0.8, fill: '#1B6CA8' }}
                            animate={{ width: 8, height: 8, opacity: 1, rx: 4, fill: '#38BDF8' }}
                            transition={{ duration: 2.5, delay: i * 0.05 }}
                            x={px}
                            y={py}
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </motion.div>
            )}

            {/* Phase 1c (7s - 13s): Text Reveal: 36 MONTHS (Hold) -> ONE QUESTION (Hold) */}
            {beatElapsedSeconds >= 7 && beatElapsedSeconds < 13 && (
              <motion.div
                key={beatElapsedSeconds < 10 ? "36months" : "onequestion"}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-center z-20"
              >
                {beatElapsedSeconds < 10 ? (
                  <h1 className="text-5xl md:text-8xl font-extralight text-slate-100 tracking-[0.2em] uppercase">
                    36 MONTHS
                  </h1>
                ) : (
                  <h1 className="text-5xl md:text-8xl font-extralight text-slate-100 tracking-[0.2em] uppercase">
                    ONE QUESTION
                  </h1>
                )}
              </motion.div>
            )}

            {/* Phase 1d (13s - 32s): MORPH 2 — 36-Month Chart with 4 Components Decomposition (T, S, C, I) */}
            {beatElapsedSeconds >= 13 && beatElapsedSeconds < 32 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.0 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-8 z-10"
              >
                {/* Top Decomposition Interactive Header & Component Selector */}
                <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-2.5 mb-2 px-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
                    <span className="text-slate-200 font-bold tracking-wide uppercase">
                      Port of LA Exports (TEUs) · 4 Components
                    </span>
                  </div>

                  {/* 4 Components Interactive Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950/85 border border-slate-800 backdrop-blur-md shadow-lg">
                    <button
                      onClick={() => setBeat1SelectedComponent(activeBeat1Component === 'all' && beat1SelectedComponent === 'all' ? null : 'all')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        activeBeat1Component === 'all'
                          ? 'bg-slate-800 text-white shadow border border-slate-600'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All 4
                    </button>

                    <button
                      onClick={() => setBeat1SelectedComponent(beat1SelectedComponent === 'trend' ? null : 'trend')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        activeBeat1Component === 'trend'
                          ? 'bg-sky-500/25 text-sky-300 border border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                          : 'text-slate-400 hover:text-sky-300'
                      }`}
                    >
                      <TrendingUp className="w-3 h-3 text-sky-400" />
                      <span>① Trend (T)</span>
                    </button>

                    <button
                      onClick={() => setBeat1SelectedComponent(beat1SelectedComponent === 'seasonality' ? null : 'seasonality')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        activeBeat1Component === 'seasonality'
                          ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                          : 'text-slate-400 hover:text-emerald-300'
                      }`}
                    >
                      <Calendar className="w-3 h-3 text-emerald-400" />
                      <span>② Seasonality (S)</span>
                    </button>

                    <button
                      onClick={() => setBeat1SelectedComponent(beat1SelectedComponent === 'cyclicality' ? null : 'cyclicality')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        activeBeat1Component === 'cyclicality'
                          ? 'bg-purple-500/25 text-purple-300 border border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                          : 'text-slate-400 hover:text-purple-300'
                      }`}
                    >
                      <Waves className="w-3 h-3 text-purple-400" />
                      <span>③ Cyclicality (C)</span>
                    </button>

                    <button
                      onClick={() => setBeat1SelectedComponent(beat1SelectedComponent === 'randomness' ? null : 'randomness')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        activeBeat1Component === 'randomness'
                          ? 'bg-amber-500/25 text-amber-300 border border-amber-400 shadow-[0_0_12px_rgba(242,165,65,0.4)]'
                          : 'text-slate-400 hover:text-amber-300'
                      }`}
                    >
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>④ Randomness (I)</span>
                    </button>
                  </div>
                </div>

                {/* SVG Graph Container */}
                <div className="relative w-full max-w-5xl h-[65%] md:h-[70%]">
                  <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="polaAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1B6CA8" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#1B6CA8" stopOpacity="0.0" />
                      </linearGradient>

                      {/* Seasonality Emerald Gradient */}
                      <linearGradient id="seasonGreenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
                        <stop offset="50%" stopColor="#10B981" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.02" />
                      </linearGradient>

                      {/* Cyclicality Purple Gradient */}
                      <linearGradient id="cyclePurpleGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#A855F7" stopOpacity="0.32" />
                        <stop offset="60%" stopColor="#A855F7" stopOpacity="0.10" />
                        <stop offset="100%" stopColor="#A855F7" stopOpacity="0.0" />
                      </linearGradient>

                      {/* Randomness Amber Glow */}
                      <filter id="amberShockGlow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>

                      {/* Trend Cyan Glow */}
                      <filter id="cyanTrendGlow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>

                      {/* Seasonality Emerald Glow */}
                      <filter id="emeraldSeasonGlow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>

                      {/* Cyclicality Purple Glow */}
                      <filter id="purpleCycleGlow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>

                      {/* High-Impact Laser Neon Glow for Actual Line */}
                      <filter id="laserLineGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3.5" result="blur1" />
                        <feGaussianBlur stdDeviation="8" result="blur2" />
                        <feMerge>
                          <feMergeNode in="blur2" />
                          <feMergeNode in="blur1" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>

                      {/* Electric Shimmer Area Gradient Under Historical Line */}
                      <linearGradient id="electricAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
                        <stop offset="60%" stopColor="#0284C7" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#0B2545" stopOpacity="0.0" />
                      </linearGradient>

                      {/* Vertical Scanning Sonar Beam Gradient */}
                      <linearGradient id="sonarScanBeam" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.0" />
                        <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Minimal Horizontal Grid Lines & Values */}
                    {[250000, 350000, 450000].map((v) => (
                      <g key={v}>
                        <line
                          x1={padLeft}
                          y1={getY(v)}
                          x2={padLeft + plotW}
                          y2={getY(v)}
                          stroke="#1E293B"
                          strokeWidth="1"
                          strokeDasharray="4 6"
                        />
                        <text
                          x={padLeft - 10}
                          y={getY(v) + 4}
                          textAnchor="end"
                          fill="#64748B"
                          fontSize="10"
                          fontFamily="monospace"
                        >
                          {v / 1000}k
                        </text>
                      </g>
                    ))}

                    {/* Vertical Year Partition Boundaries */}
                    <line x1={getX(12.5)} y1={padTop} x2={getX(12.5)} y2={padTop + plotH} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                    <line x1={getX(24.5)} y1={padTop} x2={getX(24.5)} y2={padTop + plotH} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

                    {/* Year Labels at Base of Chart */}
                    <text x={getX(6.5)} y={padTop + plotH + 20} textAnchor="middle" fill="#64748B" fontSize="11" fontFamily="monospace" fontWeight="bold">
                      2022 (Months 1–12)
                    </text>
                    <text x={getX(18.5)} y={padTop + plotH + 20} textAnchor="middle" fill="#64748B" fontSize="11" fontFamily="monospace" fontWeight="bold">
                      2023 (Months 13–24)
                    </text>
                    <text x={getX(30.5)} y={padTop + plotH + 20} textAnchor="middle" fill="#64748B" fontSize="11" fontFamily="monospace" fontWeight="bold">
                      2024 (Months 25–36)
                    </text>

                    {/* ============================================================== */}
                    {/* COMPONENT 2: SEASONALITY (S) — Recurring Annual Q3 Peak Surges  */}
                    {/* ============================================================== */}
                    {((beat1SelectedComponent === 'seasonality' || beat1SelectedComponent === 'all') || 
                      (!beat1SelectedComponent && beatElapsedSeconds >= 18 && (activeBeat1Component === 'all' || activeBeat1Component === 'seasonality'))) && (
                      <g className="transition-opacity duration-700">
                        {/* 2022 Q3 Peak Season Shading (Jul-Oct) */}
                        <rect
                          x={getX(7)}
                          y={padTop}
                          width={getX(10) - getX(7)}
                          height={plotH}
                          fill="url(#seasonGreenGrad)"
                          rx="6"
                        />
                        <g transform={`translate(${(getX(7) + getX(10)) / 2}, ${padTop + 14})`} className="anim-float-badge">
                          <rect x="-42" y="-10" width="84" height="18" rx="4" fill="#064E3B" stroke="#10B981" strokeWidth="1" opacity="0.9" />
                          <text textAnchor="middle" y="3" fill="#6EE7B7" fontSize="9" fontFamily="monospace" fontWeight="bold">
                            Q3 HARVEST
                          </text>
                        </g>

                        {/* 2023 Q3 Peak Season Shading (Jul-Oct) */}
                        <rect
                          x={getX(19)}
                          y={padTop}
                          width={getX(22) - getX(19)}
                          height={plotH}
                          fill="url(#seasonGreenGrad)"
                          rx="6"
                        />
                        <g transform={`translate(${(getX(19) + getX(22)) / 2}, ${padTop + 14})`} className="anim-float-badge">
                          <rect x="-42" y="-10" width="84" height="18" rx="4" fill="#064E3B" stroke="#10B981" strokeWidth="1" opacity="0.9" />
                          <text textAnchor="middle" y="3" fill="#6EE7B7" fontSize="9" fontFamily="monospace" fontWeight="bold">
                            Q3 HARVEST
                          </text>
                        </g>

                        {/* 2024 Q3 Peak Season Shading (Jul-Oct) */}
                        <rect
                          x={getX(31)}
                          y={padTop}
                          width={getX(34) - getX(31)}
                          height={plotH}
                          fill="url(#seasonGreenGrad)"
                          rx="6"
                        />
                        <g transform={`translate(${(getX(31) + getX(34)) / 2}, ${padTop + 14})`} className="anim-float-badge">
                          <rect x="-42" y="-10" width="84" height="18" rx="4" fill="#064E3B" stroke="#10B981" strokeWidth="1" opacity="0.9" />
                          <text textAnchor="middle" y="3" fill="#6EE7B7" fontSize="9" fontFamily="monospace" fontWeight="bold">
                            Q3 HARVEST
                          </text>
                        </g>

                        {/* Peak Pulsing Ripple Rings at Harvest Crests */}
                        {[8, 20, 33].map((mIdx) => {
                          const pt = actualPoints[mIdx - 1];
                          return (
                            <g key={`season-crest-${mIdx}`} transform={`translate(${pt.x}, ${pt.y})`}>
                              <circle r="18" fill="none" stroke="#10B981" strokeWidth="1.5" className="animate-ping opacity-75" />
                              <circle r="10" fill="none" stroke="#34D399" strokeWidth="1.5" className="animate-pulse" />
                              <circle r="5" fill="#34D399" filter="url(#emeraldSeasonGlow)" />
                              <line x1="0" y1="-8" x2="0" y2="-22" stroke="#34D399" strokeWidth="1.5" strokeDasharray="2 2" />
                              <polygon points="-4,-20 0,-27 4,-20" fill="#34D399" />
                            </g>
                          );
                        })}

                        {/* Seasonality Callout Banner */}
                        <g transform={`translate(${getX(19)}, 42)`} className="anim-float-badge">
                          <rect x="-150" y="-14" width="300" height="28" rx="8" fill="#064E3B" stroke="#34D399" strokeWidth="1.5" opacity="0.95" filter="url(#emeraldSeasonGlow)" />
                          <circle cx="-132" cy="0" r="5" fill="#34D399" className="animate-ping" />
                          <circle cx="-132" cy="0" r="3.5" fill="#10B981" />
                          <text textAnchor="middle" x="10" y="4" fill="#A7F3D0" fontSize="11" fontFamily="monospace" fontWeight="bold">
                            ② SEASONALITY (S): Annual Q3 Harvest Peaks
                          </text>
                        </g>
                      </g>
                    )}

                    {/* ============================================================== */}
                    {/* COMPONENT 3: CYCLICALITY (C) — Multi-Year Macro Trade Waves    */}
                    {/* ============================================================== */}
                    {((beat1SelectedComponent === 'cyclicality' || beat1SelectedComponent === 'all') || 
                      (!beat1SelectedComponent && beatElapsedSeconds >= 22 && (activeBeat1Component === 'all' || activeBeat1Component === 'cyclicality'))) && (
                      <g className="transition-opacity duration-700">
                        {/* Shaded Macro Cycle Under-Fill */}
                        <path
                          d={`${toPath(macroCyclePoints)} L ${getX(36)} ${padTop + plotH} L ${getX(1)} ${padTop + plotH} Z`}
                          fill="url(#cyclePurpleGrad)"
                          opacity="0.35"
                        />
                        {/* Macro Cycle Trajectory Line with animated dashed flow */}
                        <path
                          d={toPath(macroCyclePoints)}
                          fill="none"
                          stroke="#C084FC"
                          strokeWidth="6"
                          opacity="0.3"
                          filter="url(#purpleCycleGlow)"
                        />
                        <path
                          d={toPath(macroCyclePoints)}
                          fill="none"
                          stroke="#A855F7"
                          strokeWidth="3.5"
                          strokeDasharray="8 5"
                          strokeLinecap="round"
                          className="anim-flow-cycle"
                        />

                        {/* Macro Trough Marker at 2023 Destocking Bottom */}
                        <g transform={`translate(${getX(17)}, ${getY(350000)})`}>
                          <circle r="22" fill="none" stroke="#C084FC" strokeWidth="1.5" className="animate-ping opacity-60" />
                          <circle r="14" fill="none" stroke="#A855F7" strokeWidth="1.5" className="animate-pulse" />
                          <circle r="7" fill="#C084FC" filter="url(#purpleCycleGlow)" />
                        </g>

                        {/* Macro Wave Crest Marker at 2022 Pre-Drop High */}
                        <g transform={`translate(${getX(5)}, ${getY(415000)})`}>
                          <circle r="12" fill="none" stroke="#C084FC" strokeWidth="1.2" className="animate-pulse" />
                          <circle r="5" fill="#A855F7" />
                        </g>

                        {/* Cyclicality Callout Banner */}
                        <g transform={`translate(${getX(10)}, ${getY(310000)})`} className="anim-float-badge">
                          <rect x="-155" y="-14" width="310" height="28" rx="8" fill="#3B0764" stroke="#C084FC" strokeWidth="1.5" opacity="0.95" filter="url(#purpleCycleGlow)" />
                          <circle cx="-137" cy="0" r="5" fill="#C084FC" className="animate-ping" />
                          <circle cx="-137" cy="0" r="3.5" fill="#A855F7" />
                          <text textAnchor="middle" x="10" y="4" fill="#F3E8FF" fontSize="11" fontFamily="monospace" fontWeight="bold">
                            ③ CYCLICALITY (C): Multi-Year Trade Waves
                          </text>
                        </g>
                      </g>
                    )}

                    {/* ============================================================== */}
                    {/* COMPONENT 1: TREND (T) — Linear Downward Slope (-2,216 TEUs)   */}
                    {/* ============================================================== */}
                    {(activeBeat1Component === 'all' || activeBeat1Component === 'trend') && (
                      <g className="transition-opacity duration-700">
                        {/* Glow Halo around Trend line */}
                        <line
                          x1={getX(1)}
                          y1={getY(FULL_TIME_SERIES[0].trend || 409404)}
                          x2={getX(36)}
                          y2={getY(FULL_TIME_SERIES[35].trend || 331833)}
                          stroke="#38BDF8"
                          strokeWidth="8"
                          opacity="0.35"
                          filter="url(#cyanTrendGlow)"
                        />
                        {/* Animated Crisp Dashed Regression Vector with flowing dash */}
                        <line
                          x1={getX(1)}
                          y1={getY(FULL_TIME_SERIES[0].trend || 409404)}
                          x2={getX(36)}
                          y2={getY(FULL_TIME_SERIES[35].trend || 331833)}
                          stroke="#38BDF8"
                          strokeWidth="3.2"
                          strokeDasharray="8 5"
                          strokeLinecap="round"
                          className="anim-flow-trend"
                        />

                        {/* Start Anchor Node on Trend Line */}
                        <g transform={`translate(${getX(1)}, ${getY(FULL_TIME_SERIES[0].trend || 409404)})`}>
                          <circle r="5" fill="#38BDF8" filter="url(#cyanTrendGlow)" />
                        </g>

                        {/* Downward Direction Arrow at end of Trend line with pulsing radar */}
                        <g transform={`translate(${getX(36)}, ${getY(FULL_TIME_SERIES[35].trend || 331833)})`}>
                          <circle r="14" fill="none" stroke="#38BDF8" strokeWidth="1.5" className="animate-ping opacity-75" />
                          <circle r="7" fill="#38BDF8" filter="url(#cyanTrendGlow)" />
                          <path d="M -4 -8 L 4 0 L -4 8" fill="none" stroke="#0B2545" strokeWidth="2.5" />
                        </g>

                        {/* Trend Callout Badge */}
                        <g transform={`translate(${getX(22)}, ${getY(362000) - 25})`} className="anim-float-badge">
                          <rect x="-160" y="-14" width="320" height="28" rx="8" fill="#0B2545" stroke="#38BDF8" strokeWidth="1.5" opacity="0.95" filter="url(#cyanTrendGlow)" />
                          <circle cx="-142" cy="0" r="5" fill="#38BDF8" className="animate-ping" />
                          <circle cx="-142" cy="0" r="3.5" fill="#0284C7" />
                          <text textAnchor="middle" x="8" y="4" fill="#BAE6FD" fontSize="11" fontFamily="monospace" fontWeight="bold">
                            ① TREND (T): y = 411,621 − 2,216·t (r = −0.39)
                          </text>
                        </g>
                      </g>
                    )}

                    {/* ============================================================== */}
                    {/* COMPONENT 4: RANDOMNESS / IRREGULAR (I) — Anomaly & Noise Band */}
                    {/* ============================================================== */}
                    {((beat1SelectedComponent === 'randomness' || beat1SelectedComponent === 'all') || 
                      (!beat1SelectedComponent && beatElapsedSeconds >= 26 && (activeBeat1Component === 'all' || activeBeat1Component === 'randomness'))) && (
                      <g className="transition-opacity duration-700">
                        {/* Shaded Translucent Uncertainty / Noise Band Envelope */}
                        <path
                          d={`${noiseBandUpperPath} L ${actualPoints.slice().reverse().map(p => `${p.x.toFixed(1)} ${(p.y + 13000 * (plotH / (maxVal - minVal))).toFixed(1)}`).join(' L ')} Z`}
                          fill="#F59E0B"
                          opacity="0.08"
                        />
                        {/* Translucent Uncertainty / Noise Ribbon around curve */}
                        <path
                          d={noiseBandUpperPath}
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth="1.4"
                          strokeDasharray="4 3"
                          opacity="0.6"
                          className="anim-flow-trend"
                        />
                        <path
                          d={noiseBandLowerPath}
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth="1.4"
                          strokeDasharray="4 3"
                          opacity="0.6"
                          className="anim-flow-trend"
                        />

                        {/* Vertical Drop Plumb Line at Feb 2023 Structural Shock */}
                        <line
                          x1={getX(14)}
                          y1={getY(347493)}
                          x2={getX(14)}
                          y2={getY(236264)}
                          stroke="#F2A541"
                          strokeWidth="2.5"
                          strokeDasharray="5 3"
                          className="anim-flow-trend"
                        />

                        {/* Pulsing Target Radar Circles on Feb 2023 Shock with double echo ring */}
                        <g transform={`translate(${getX(14)}, ${getY(236264)})`}>
                          <circle r="34" fill="none" stroke="#F2A541" strokeWidth="1.5" className="animate-ping opacity-60" />
                          <circle r="22" fill="none" stroke="#F59E0B" strokeWidth="1.5" className="animate-pulse opacity-80" />
                          <circle r="12" fill="none" stroke="#FDE68A" strokeWidth="1.5" className="animate-ping opacity-90" />
                          <circle r="7" fill="#F2A541" filter="url(#amberShockGlow)" />
                        </g>

                        {/* Shock Origin Dot before the Drop (Jan 2023: 347,493) */}
                        <g transform={`translate(${getX(14)}, ${getY(347493)})`}>
                          <circle r="4" fill="#F59E0B" opacity="0.8" />
                          <text x="10" y="4" fill="#FCD34D" fontSize="9" fontFamily="monospace" fontWeight="bold">
                            Pre-Shock Baseline
                          </text>
                        </g>

                        {/* Shock Callout Badge with Exact Drop - Positioned above point for perfect clearance */}
                        <g transform={`translate(${getX(14)}, ${getY(236264) - 46})`} className="anim-float-badge">
                          <rect x="-155" y="-14" width="310" height="28" rx="8" fill="#451A03" stroke="#F59E0B" strokeWidth="1.5" opacity="0.95" filter="url(#amberShockGlow)" />
                          <circle cx="-137" cy="0" r="5" fill="#F59E0B" className="animate-ping" />
                          <circle cx="-137" cy="0" r="3.5" fill="#D97706" />
                          <text textAnchor="middle" x="8" y="4" fill="#FEF3C7" fontSize="11" fontFamily="monospace" fontWeight="bold">
                            ④ RANDOMNESS (I): Feb 2023 Shock (−32.0%)
                          </text>
                          {/* Downward indicator tick pointing straight to the shock drop */}
                          <polygon points="-5,14 0,22 5,14" fill="#F59E0B" />
                        </g>
                      </g>
                    )}

                    {/* Dynamic Moving Sonar Radar Beam traversing the chart */}
                    <g className="pointer-events-none anim-radar-sweep">
                      <rect
                        x={padLeft}
                        y={padTop}
                        width="45"
                        height={plotH}
                        fill="url(#sonarScanBeam)"
                      />
                      <line
                        x1={padLeft + 22}
                        y1={padTop}
                        x2={padLeft + 22}
                        y2={padTop + plotH}
                        stroke="#38BDF8"
                        strokeWidth="1.2"
                        strokeDasharray="2 3"
                        opacity="0.7"
                      />
                    </g>

                    {/* Luminous Shaded Area Underneath Actual Trajectory */}
                    {beat1DrawIndex > 0 && (
                      <path
                        d={`${actualPoints.slice(0, beat1DrawIndex + 1).map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ')} L ${actualPoints[beat1DrawIndex].x.toFixed(1)} ${padTop + plotH} L ${actualPoints[0].x.toFixed(1)} ${padTop + plotH} Z`}
                        fill="url(#electricAreaGrad)"
                      />
                    )}

                    {/* Actual Historical Line - Deep Cyan Neon Laser Halo */}
                    {beat1DrawIndex > 0 && (
                      <path
                        d={actualPoints.slice(0, beat1DrawIndex + 1).map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ')}
                        fill="none"
                        stroke="#0284C7"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.45"
                        filter="url(#laserLineGlow)"
                      />
                    )}

                    {/* Actual Historical Line - Crisp White Core with Laser Radiance */}
                    {beat1DrawIndex > 0 && (
                      <path
                        d={actualPoints.slice(0, beat1DrawIndex + 1).map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ')}
                        fill="none"
                        stroke="#F0F9FF"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="anim-laser-line"
                      />
                    )}

                    {/* Interactive Animated Data Nodes Along the Path */}
                    {beat1DrawIndex > 0 &&
                      actualPoints.slice(0, beat1DrawIndex + 1).map((pt, idx) => {
                        const isLatest = idx === beat1DrawIndex;
                        const isHarvestPeak = [7, 19, 32].includes(idx); // Q3 crests
                        const isShockDrop = idx === 13; // Feb 2023
                        return (
                          <g key={`data-node-${idx}`} transform={`translate(${pt.x}, ${pt.y})`}>
                            {/* Outer pulsating halo on key points */}
                            {(isLatest || isHarvestPeak || isShockDrop) && (
                              <circle
                                r={isShockDrop ? "14" : isHarvestPeak ? "12" : "10"}
                                fill="none"
                                stroke={isShockDrop ? "#F59E0B" : isHarvestPeak ? "#10B981" : "#38BDF8"}
                                strokeWidth="1.5"
                                className="animate-ping opacity-60"
                              />
                            )}
                            {/* Inner crisp core dot */}
                            <circle
                              r={isLatest ? "5.5" : "3.5"}
                              fill={isShockDrop ? "#F59E0B" : isHarvestPeak ? "#34D399" : "#38BDF8"}
                              stroke="#FFFFFF"
                              strokeWidth={isLatest ? "2" : "1.2"}
                              filter="url(#cyanTrendGlow)"
                            />
                            {/* Current active leading tracer badge */}
                            {isLatest && (
                              <g transform="translate(0, -20)" className="anim-float-badge">
                                <rect
                                  x="-45"
                                  y="-9"
                                  width="90"
                                  height="18"
                                  rx="5"
                                  fill="#0B2545"
                                  stroke="#38BDF8"
                                  strokeWidth="1.2"
                                  filter="url(#cyanTrendGlow)"
                                />
                                <text
                                  textAnchor="middle"
                                  y="3.5"
                                  fill="#E0F2FE"
                                  fontSize="9"
                                  fontFamily="monospace"
                                  fontWeight="bold"
                                >
                                  {pt.val.toLocaleString()}
                                </text>
                              </g>
                            )}
                          </g>
                        );
                      })}
                  </svg>

                  {/* Mascot Floating in Bottom Corner pointing to 4 components */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -bottom-6 -left-6 hidden md:flex items-center gap-2 p-2 rounded-2xl bg-slate-950/90 border border-sky-400/50 shadow-2xl backdrop-blur-md"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-sky-400 bg-[#0B2545]">
                      <img src={MASCOT_BLUE} alt="Blue Mascot" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-[10px] font-mono text-left pr-2">
                      <div className="text-sky-300 font-bold">Elaiza Jane Aligato</div>
                      <div className="text-slate-400">Time-Series Component Audit</div>
                    </div>
                  </motion.div>
                </div>

                {/* Bottom 4 Components Detail Summary Bar */}
                <div className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-slate-900/80 text-[10px] font-mono">
                  <div className={`p-2 rounded-xl border transition-all ${
                    activeBeat1Component === 'trend' || activeBeat1Component === 'all'
                      ? 'bg-sky-950/50 border-sky-500/40 text-sky-200'
                      : 'bg-slate-950/40 border-slate-900 text-slate-500'
                  }`}>
                    <div className="font-bold flex items-center gap-1 text-sky-400">
                      <TrendingUp className="w-3 h-3" />
                      <span>TREND (T)</span>
                    </div>
                    <div className="truncate mt-0.5">Slopes down −2,216/mo (r = −0.39)</div>
                  </div>

                  {/* Seasonality: Only show once its turn arrives in the beat timeline (18s+) or if selected */}
                  {(beat1SelectedComponent === 'seasonality' || beat1SelectedComponent === 'all' || (!beat1SelectedComponent && beatElapsedSeconds >= 18)) ? (
                    <div className={`p-2 rounded-xl border transition-all ${
                      activeBeat1Component === 'seasonality' || activeBeat1Component === 'all'
                        ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                        : 'bg-slate-950/40 border-slate-900 text-slate-500'
                    }`}>
                      <div className="font-bold flex items-center gap-1 text-emerald-400">
                        <Calendar className="w-3 h-3" />
                        <span>SEASONALITY (S)</span>
                      </div>
                      <div className="truncate mt-0.5">Recurring Q3 Harvest Peak Surges</div>
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl border border-slate-900/40 bg-slate-950/20 text-slate-600 flex flex-col justify-center items-center opacity-40">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>② SEASONALITY</span>
                      </div>
                      <div className="text-[9px] mt-0.5 text-slate-600">Pending breakdown...</div>
                    </div>
                  )}

                  {/* Cyclicality: Only show once its turn arrives in the beat timeline (22s+) or if selected */}
                  {(beat1SelectedComponent === 'cyclicality' || beat1SelectedComponent === 'all' || (!beat1SelectedComponent && beatElapsedSeconds >= 22)) ? (
                    <div className={`p-2 rounded-xl border transition-all ${
                      activeBeat1Component === 'cyclicality' || activeBeat1Component === 'all'
                        ? 'bg-purple-950/50 border-purple-500/40 text-purple-200'
                        : 'bg-slate-950/40 border-slate-900 text-slate-500'
                    }`}>
                      <div className="font-bold flex items-center gap-1 text-purple-400">
                        <Waves className="w-3 h-3" />
                        <span>CYCLICALITY (C)</span>
                      </div>
                      <div className="truncate mt-0.5">Multi-Year Destocking &amp; Rebound</div>
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl border border-slate-900/40 bg-slate-950/20 text-slate-600 flex flex-col justify-center items-center opacity-40">
                      <div className="flex items-center gap-1">
                        <Waves className="w-3 h-3" />
                        <span>③ CYCLICALITY</span>
                      </div>
                      <div className="text-[9px] mt-0.5 text-slate-600">Pending breakdown...</div>
                    </div>
                  )}

                  {/* Randomness: Only show once its turn arrives in the beat timeline (26s+) or if selected */}
                  {(beat1SelectedComponent === 'randomness' || beat1SelectedComponent === 'all' || (!beat1SelectedComponent && beatElapsedSeconds >= 26)) ? (
                    <div className={`p-2 rounded-xl border transition-all ${
                      activeBeat1Component === 'randomness' || activeBeat1Component === 'all'
                        ? 'bg-amber-950/50 border-amber-500/40 text-amber-200'
                        : 'bg-slate-950/40 border-slate-900 text-slate-500'
                    }`}>
                      <div className="font-bold flex items-center gap-1 text-amber-400">
                        <Zap className="w-3 h-3" />
                        <span>RANDOMNESS (I)</span>
                      </div>
                      <div className="truncate mt-0.5">Feb 2023 −32% Shock &amp; Residuals</div>
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl border border-slate-900/40 bg-slate-950/20 text-slate-600 flex flex-col justify-center items-center opacity-40">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>④ RANDOMNESS</span>
                      </div>
                      <div className="text-[9px] mt-0.5 text-slate-600">Pending breakdown...</div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Phase 1e (32s - 40s): Chart completely exits, leaving only r = −0.39 in clean keynote typography */}
            {beatElapsedSeconds >= 32 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1.0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#060B14]/95 backdrop-blur-xl gap-4 p-8"
              >
                <div className="text-7xl md:text-9xl font-extralight text-slate-100 tracking-wider filter drop-shadow-[0_0_35px_rgba(56,189,248,0.3)]">
                  r = −0.39
                </div>
                <div className="text-xs md:text-sm font-mono tracking-[0.25em] uppercase text-sky-400 font-semibold bg-sky-950/60 px-4 py-1.5 rounded-full border border-sky-500/30">
                  Slopes Down −2,216 TEUs/Mo · No Steady Trend
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* BEAT 2 (1:05 - 1:40 · 35s): CONVENTIONAL TRAJECTORIES (3D RADIAL FAN) */}
        {/* ============================================================== */}
        {currentBeatIndex === 2 && (
          <div className="absolute inset-0 flex items-center justify-center p-8 z-10 overflow-hidden">
            {/* Subtle Terminal Background Photo */}
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <img src={CONTAINER_YARD_IMG} alt="Container Yard Twilight" className="w-full h-full object-cover" />
            </div>

            {/* Background Actual Line */}
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="absolute inset-0 w-full h-full opacity-20 pointer-events-none p-8">
              <path d={actualPathString} fill="none" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>

            {/* Model 1: SMA (0s - 9s) */}
            {beatElapsedSeconds < 9 && (
              <motion.div
                key="sma"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 1.0 }}
                className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center"
              >
                <div className="flex items-center gap-2 mb-1 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-mono font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                  <span>Conventional Baseline 01</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-extralight text-slate-100 tracking-wider mb-2">
                  SMA
                </h2>
                <div className="text-xs font-mono text-sky-400 mb-6 tracking-widest uppercase">
                  3-Period Moving Average · Equal Weights (0.33 ea)
                </div>
                <div className="relative w-full h-44 md:h-56">
                  <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="smaAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Shaded Area Underneath SMA */}
                    <path
                      d={`${toPath(smaPoints)} L ${smaPoints[smaPoints.length - 1].x} ${padTop + plotH} L ${smaPoints[0].x} ${padTop + plotH} Z`}
                      fill="url(#smaAreaGrad)"
                    />
                    {/* Glowing Aura Line */}
                    <path
                      d={toPath(smaPoints)}
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="8"
                      strokeLinecap="round"
                      opacity="0.4"
                      filter="url(#cyanTrendGlow)"
                    />
                    {/* High-Impact Neon Laser Line */}
                    <path
                      d={toPath(smaPoints)}
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      className="anim-neon-sma filter drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                    />
                    {/* Pulsing Target Nodes Along SMA */}
                    {smaPoints.filter((_, idx) => idx % 4 === 0 || idx === smaPoints.length - 1).map((pt, i) => (
                      <g key={`sma-node-${i}`} transform={`translate(${pt.x}, ${pt.y})`}>
                        <circle r="8" fill="none" stroke="#38BDF8" strokeWidth="1.2" className="animate-ping opacity-60" />
                        <circle r="4" fill="#38BDF8" filter="url(#cyanTrendGlow)" />
                      </g>
                    ))}
                  </svg>
                </div>
              </motion.div>
            )}

            {/* Model 2: WMA (9s - 18s) */}
            {beatElapsedSeconds >= 9 && beatElapsedSeconds < 18 && (
              <motion.div
                key="wma"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 1.0 }}
                className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center"
              >
                <div className="flex items-center gap-2 mb-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Conventional Baseline 02</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-extralight text-slate-100 tracking-wider mb-2">
                  WMA
                </h2>
                <div className="text-xs font-mono text-emerald-400 mb-6 tracking-widest uppercase">
                  Linear Decreasing Weights: 0.50 (t-1) / 0.30 (t-2) / 0.20 (t-3)
                </div>
                <div className="relative w-full h-44 md:h-56">
                  <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="wmaAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Shaded Area Underneath WMA */}
                    <path
                      d={`${toPath(wmaPoints)} L ${wmaPoints[wmaPoints.length - 1].x} ${padTop + plotH} L ${wmaPoints[0].x} ${padTop + plotH} Z`}
                      fill="url(#wmaAreaGrad)"
                    />
                    {/* Glowing Aura Line */}
                    <path
                      d={toPath(wmaPoints)}
                      fill="none"
                      stroke="#059669"
                      strokeWidth="8"
                      strokeLinecap="round"
                      opacity="0.4"
                      filter="url(#emeraldSeasonGlow)"
                    />
                    {/* High-Impact Neon Laser Line */}
                    <path
                      d={toPath(wmaPoints)}
                      fill="none"
                      stroke="#34D399"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      className="anim-neon-wma filter drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    />
                    {/* Pulsing Target Nodes Along WMA */}
                    {wmaPoints.filter((_, idx) => idx % 4 === 0 || idx === wmaPoints.length - 1).map((pt, i) => (
                      <g key={`wma-node-${i}`} transform={`translate(${pt.x}, ${pt.y})`}>
                        <circle r="8" fill="none" stroke="#34D399" strokeWidth="1.2" className="animate-ping opacity-60" />
                        <circle r="4" fill="#34D399" filter="url(#emeraldSeasonGlow)" />
                      </g>
                    ))}
                  </svg>
                </div>
              </motion.div>
            )}

            {/* Model 3: ETS α (18s - 27s) — Smooth trajectory morphing between 0.20 -> 0.50 -> 0.80 */}
            {beatElapsedSeconds >= 18 && beatElapsedSeconds < 27 && (
              <motion.div
                key="ets"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 1.0 }}
                className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center"
              >
                <div className="flex items-center gap-2 mb-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Conventional Baseline 03 · Dynamic Smoothing</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-extralight text-slate-100 tracking-wider mb-2">
                  ETS
                </h2>
                <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-6 tracking-widest uppercase">
                  <span>Smoothing Parameter α:</span>
                  <span className={`px-2 py-0.5 rounded transition-all ${beatElapsedSeconds < 21 ? 'bg-slate-800 text-white font-bold border border-slate-600 scale-110' : 'text-slate-500'}`}>0.20 (Sluggish)</span>
                  <span>→</span>
                  <span className={`px-2 py-0.5 rounded transition-all ${beatElapsedSeconds >= 21 && beatElapsedSeconds < 24 ? 'bg-amber-500/20 text-[#F2A541] font-bold text-sm border border-amber-400 shadow-[0_0_12px_rgba(242,165,65,0.4)] scale-125' : 'text-slate-500'}`}>0.50 (Selected OM Baseline)</span>
                  <span>→</span>
                  <span className={`px-2 py-0.5 rounded transition-all ${beatElapsedSeconds >= 24 ? 'bg-slate-800 text-white font-bold border border-slate-600 scale-110' : 'text-slate-500'}`}>0.80 (Reactive)</span>
                </div>
                <div className="relative w-full h-44 md:h-56">
                  <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="etsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Shaded Area Underneath ETS */}
                    {(() => {
                      const pts = beatElapsedSeconds < 21 ? es02Points : beatElapsedSeconds < 24 ? es05Points : es08Points;
                      return (
                        <>
                          <path
                            d={`${toPath(pts)} L ${pts[pts.length - 1].x} ${padTop + plotH} L ${pts[0].x} ${padTop + plotH} Z`}
                            fill="url(#etsAreaGrad)"
                          />
                          {/* Glowing Aura Line */}
                          <path
                            d={toPath(pts)}
                            fill="none"
                            stroke="#D97706"
                            strokeWidth="8"
                            strokeLinecap="round"
                            opacity="0.4"
                            filter="url(#amberShockGlow)"
                          />
                          {/* High-Impact Neon Laser Line */}
                          <path
                            d={toPath(pts)}
                            fill="none"
                            stroke="#F59E0B"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            className="anim-neon-ets filter drop-shadow-[0_0_10px_rgba(245,158,11,0.85)]"
                          />
                          {/* Pulsing Target Nodes Along ETS */}
                          {pts.filter((_, idx) => idx % 4 === 0 || idx === pts.length - 1).map((pt, i) => (
                            <g key={`ets-node-${i}`} transform={`translate(${pt.x}, ${pt.y})`}>
                              <circle r="8" fill="none" stroke="#F59E0B" strokeWidth="1.2" className="animate-ping opacity-60" />
                              <circle r="4" fill="#F59E0B" filter="url(#amberShockGlow)" />
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </motion.div>
            )}

            {/* Model 4: TREND PROJECTION / LINEAR TIME REGRESSION (27s - 35s) — Contrast: irregular vs straight line */}
            {beatElapsedSeconds >= 27 && (
              <motion.div
                key="trend"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center px-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                  <span>Rigid Linear Approximation · Operational Hazard</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-extralight text-slate-100 tracking-wider mb-1">
                  TREND PROJECTION
                </h2>
                <div className="text-xs sm:text-sm font-mono text-[#F2A541] mb-4 tracking-widest uppercase font-semibold">
                  Linear Time Regression · Rigid Linear Fit (r = −0.39, −2,216 TEUs/mo)
                </div>

                {/* Live Animated Graph Container with Grid, Contrast & Scanning Laser */}
                <div className="relative w-full rounded-2xl bg-slate-950/80 border border-slate-800/80 p-4 shadow-2xl backdrop-blur-md overflow-hidden">
                  <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-48 md:h-60 overflow-visible">
                    <defs>
                      <linearGradient id="trendLaserGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#FB7185" stopOpacity="1" />
                        <stop offset="100%" stopColor="#FDA4AF" stopOpacity="0.8" />
                      </linearGradient>
                      <filter id="laserGlowTrend" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Subtle Gridlines */}
                    {[250000, 350000, 450000].map(v => (
                      <line
                        key={v}
                        x1={padLeft}
                        y1={getY(v)}
                        x2={svgWidth - padRight}
                        y2={getY(v)}
                        stroke="#1E293B"
                        strokeDasharray="4 4"
                      />
                    ))}

                    {/* Actual Volatile Port Series in Faint Ghost Cyan (To show extreme contrast with straight line) */}
                    <path
                      d={actualPathString}
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="2"
                      strokeOpacity="0.45"
                      strokeDasharray="4 4"
                    />

                    {/* Live Moving Rigid Trend Projection Line */}
                    <path
                      d={toPath(trendPoints)}
                      fill="none"
                      stroke="url(#trendLaserGrad)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      filter="url(#laserGlowTrend)"
                      className="anim-flow-trend"
                      style={{ strokeDasharray: '12 8' }}
                    />

                    {/* Moving Laser Scanner Pulse traveling along the line */}
                    {(() => {
                      const tNorm = ((beatElapsedSeconds - 27) % 3) / 3;
                      const pX = trendPoints[0].x + tNorm * (trendPoints[1].x - trendPoints[0].x);
                      const pY = trendPoints[0].y + tNorm * (trendPoints[1].y - trendPoints[0].y);
                      const currentVal = Math.round(409404 - 2216 * (1 + tNorm * 35));
                      return (
                        <g>
                          <circle cx={pX} cy={pY} r="8" fill="#F43F5E" className="animate-ping opacity-75" />
                          <circle cx={pX} cy={pY} r="5" fill="#FFE4E6" stroke="#F43F5E" strokeWidth="2" />
                          <line x1={pX} y1={padTop} x2={pX} y2={padTop + plotH} stroke="#F43F5E" strokeOpacity="0.3" strokeDasharray="2 2" />
                          <rect x={pX - 60} y={pY - 32} width="120" height="22" rx="4" fill="#0F172A" stroke="#F43F5E" strokeWidth="1" />
                          <text x={pX} y={pY - 17} textAnchor="middle" fill="#FDA4AF" fontSize="11" fontFamily="monospace" fontWeight="bold">
                            {currentVal.toLocaleString()} TEUs
                          </text>
                        </g>
                      );
                    })()}

                    {/* Start and End Callout Pins */}
                    <circle cx={trendPoints[0].x} cy={trendPoints[0].y} r="5" fill="#FB7185" />
                    <text x={trendPoints[0].x} y={trendPoints[0].y - 12} textAnchor="start" fill="#94A3B8" fontSize="11" fontFamily="monospace">
                      Jan 2022: 409,404 TEUs
                    </text>

                    <circle cx={trendPoints[1].x} cy={trendPoints[1].y} r="5" fill="#FB7185" />
                    <text x={trendPoints[1].x} y={trendPoints[1].y + 20} textAnchor="end" fill="#F43F5E" fontSize="11" fontFamily="monospace" fontWeight="bold">
                      Dec 2024: 331,833 TEUs (Misses 460k actual by -128k!)
                    </text>
                  </svg>

                  {/* Operational Summary Callout */}
                  <div className="flex flex-wrap items-center justify-between text-xs font-mono pt-3 border-t border-slate-800/80 text-slate-400">
                    <span className="text-rose-400 font-semibold">Equation: ŷ = 409,404 − 2,216 · t</span>
                    <span className="text-slate-300">Negative slope reflects 2022 destocking only</span>
                    <span className="text-amber-300 font-bold">MAE: 107,737 TEUs (Catastrophic 24.15% MAPE)</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Orange Mascot in Corner with Mini Blue Container */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-6 right-6 hidden sm:flex items-center gap-2.5 p-2 rounded-2xl bg-slate-950/85 border border-amber-500/50 shadow-2xl backdrop-blur-md"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-400 bg-[#0B2545]">
                <img src={MASCOT_ORANGE} alt="Orange Mascot" className="w-full h-full object-contain" />
              </div>
              <div className="text-[10px] font-mono text-left pr-2">
                <div className="text-amber-300 font-bold">Logistics Planner</div>
                <div className="text-slate-400">Balancing Container Flow</div>
              </div>
            </motion.div>
          </div>
        )}

        {/* ============================================================== */}
        {/* BEAT 3 (1:40 - 2:10 · 30s): CONVENTIONAL OM BASELINE SELECTION  */}
        {/* ============================================================== */}
        {currentBeatIndex === 3 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 z-10 bg-[#060B14]">
            {/* Visual 1 (0s - 15s): Black screen -> THE BASELINE -> ETS α = 0.50 with amber ONLY on α = 0.50 */}
            {beatElapsedSeconds < 15 && (
              <motion.div
                key={beatElapsedSeconds < 5 ? "thebaseline" : "etsbaseline"}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1.0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-center flex flex-col items-center gap-3"
              >
                {beatElapsedSeconds < 5 ? (
                  <h1 className="text-5xl md:text-8xl font-extralight text-slate-100 tracking-[0.2em] uppercase">
                    THE BASELINE
                  </h1>
                ) : (
                  <div>
                    <span className="text-xs font-mono uppercase tracking-[0.3em] text-slate-400 block mb-2">
                      Conventional Benchmark
                    </span>
                    <h1 className="text-5xl md:text-8xl font-extralight text-slate-100 tracking-tight">
                      ETS <span className="text-[#F2A541] font-normal">α = 0.50</span>
                    </h1>
                  </div>
                )}
              </motion.div>
            )}

            {/* Visual 2 (15s - 30s): Minimal error indicators MAE -> MSE -> RMSE -> MPE -> MAPE -> SMAPE */}
            {beatElapsedSeconds >= 15 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                className="text-center flex flex-col items-center gap-6"
              >
                <div className="text-xs font-mono uppercase tracking-[0.3em] text-slate-400">
                  Development Period Evaluator · 6 Official Metrics
                </div>
                <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-6 md:gap-8 text-xl sm:text-2xl md:text-3xl font-light font-mono text-slate-300">
                  <span className={beatElapsedSeconds < 17.5 ? 'text-[#F2A541] font-bold drop-shadow-[0_0_10px_rgba(242,165,65,0.7)]' : 'text-slate-400'}>MAE</span>
                  <span className="text-slate-600">·</span>
                  <span className={beatElapsedSeconds >= 17.5 && beatElapsedSeconds < 20 ? 'text-[#F2A541] font-bold drop-shadow-[0_0_10px_rgba(242,165,65,0.7)]' : 'text-slate-400'}>MSE</span>
                  <span className="text-slate-600">·</span>
                  <span className={beatElapsedSeconds >= 20 && beatElapsedSeconds < 22.5 ? 'text-[#F2A541] font-bold drop-shadow-[0_0_10px_rgba(242,165,65,0.7)]' : 'text-slate-400'}>RMSE</span>
                  <span className="text-slate-600">·</span>
                  <span className={beatElapsedSeconds >= 22.5 && beatElapsedSeconds < 25 ? 'text-[#F2A541] font-bold drop-shadow-[0_0_10px_rgba(242,165,65,0.7)]' : 'text-slate-400'}>MPE</span>
                  <span className="text-slate-600">·</span>
                  <span className={beatElapsedSeconds >= 25 && beatElapsedSeconds < 27.5 ? 'text-[#F2A541] font-bold drop-shadow-[0_0_10px_rgba(242,165,65,0.7)]' : 'text-slate-400'}>MAPE</span>
                  <span className="text-slate-600">·</span>
                  <span className={beatElapsedSeconds >= 27.5 ? 'text-[#F2A541] font-bold drop-shadow-[0_0_10px_rgba(242,165,65,0.7)]' : 'text-slate-400'}>SMAPE</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="text-xs sm:text-sm font-mono text-[#F2A541] font-semibold">
                    {beatElapsedSeconds < 17.5 && 'Mean Absolute Error (Average Deviation in TEUs)'}
                    {beatElapsedSeconds >= 17.5 && beatElapsedSeconds < 20 && 'Mean Squared Error (Quadratically Weighted Variance)'}
                    {beatElapsedSeconds >= 20 && beatElapsedSeconds < 22.5 && 'Root Mean Squared Error (Outlier-Sensitive Metric)'}
                    {beatElapsedSeconds >= 22.5 && beatElapsedSeconds < 25 && 'Mean Percentage Error (Directional Bias: Under/Over)'}
                    {beatElapsedSeconds >= 25 && beatElapsedSeconds < 27.5 && 'Mean Absolute Percentage Error (Executive Benchmark)'}
                    {beatElapsedSeconds >= 27.5 && 'Symmetric MAPE (Bounded Relative Benchmark)'}
                  </div>
                  <div className="text-xs font-mono text-slate-500">
                    (Pre-Validation Baseline · Not Final Winner)
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* BEAT 4 (2:10 - 2:50 · 40s): ARIMA + ML CHALLENGERS (CODE TERMINAL) */}
        {/* ============================================================== */}
        {currentBeatIndex === 4 && (
          <div className="absolute inset-0 flex items-center justify-center p-8 z-10 overflow-hidden">
            {/* Subtle Operations Command Backdrop */}
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <img src={OPERATIONS_COMMAND_IMG} alt="Operations Command" className="w-full h-full object-cover" />
            </div>

            {/* Model 1: ARIMA + macOS Terminal with 'kind' text effects (Inspired by 21st terminal & Instructor Code 14) */}
            {beatElapsedSeconds < 16 && (
              <motion.div
                key="arima_terminal"
                initial={{ opacity: 0, z: -80, scale: 0.92 }}
                animate={{ opacity: 1, z: 0, scale: 1.0 }}
                exit={{ opacity: 0, z: 50 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-3xl flex flex-col items-center px-4"
              >
                {/* macOS Style Code Terminal Window */}
                <div className="w-full rounded-2xl bg-slate-950/95 border border-sky-500/40 shadow-2xl overflow-hidden backdrop-blur-xl">
                  {/* Window Titlebar */}
                  <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500/90" />
                      <span className="w-3 h-3 rounded-full bg-amber-500/90" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500/90" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">Google Colab · Step 5: ARIMA(1,1,0) (Instructor Code 14)</span>
                    <span className="text-[10px] font-mono text-sky-400 font-bold px-2 py-0.5 rounded bg-sky-950/80 border border-sky-800">AIC: 701.43</span>
                  </div>

                  {/* Terminal Code Body with kind-based lively styling matching Google Colab */}
                  <div className="p-4 md:p-5 font-mono text-xs md:text-sm text-slate-300 space-y-2 text-left leading-relaxed">
                    {/* Line 1: cmd - Exact import from Google Colab */}
                    <div className="flex items-center gap-2">
                      <span className="text-sky-400 font-bold select-none">&gt;&gt;&gt;</span>
                      <span className="text-purple-300 font-semibold">from</span>
                      <span className="text-white font-semibold">statsmodels.tsa.arima.model</span>
                      <span className="text-purple-300 font-semibold">import</span>
                      <span className="text-[#F2A541] font-bold">ARIMA</span>
                    </div>

                    {/* Line 2: cmd - Exact fit line from Google Colab */}
                    <div className="flex items-center gap-2">
                      <span className="text-sky-400 font-bold select-none">&gt;&gt;&gt;</span>
                      <span className="text-white font-semibold">arima_model = ARIMA(y_train, order=(1, 1, 0)).fit()</span>
                    </div>

                    {/* Line 3: dim - Training output diagnostics */}
                    {beatElapsedSeconds >= 2.5 && (
                      <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="text-slate-400 text-xs flex items-center gap-2 pl-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                        <span>Checking stationarity: Augmented Dickey-Fuller p = 0.0024 -&gt; 1st differencing (d=1) confirmed.</span>
                      </motion.div>
                    )}

                    {/* Line 4: dim - Parameter estimation */}
                    {beatElapsedSeconds >= 5.5 && (
                      <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="text-slate-400 text-xs flex items-center gap-2 pl-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span>Estimating autoregressive parameter: AR(1) ϕ₁ = +0.548 (p &lt; 0.001, z = 4.12).</span>
                      </motion.div>
                    )}

                    {/* Line 5: ok - Model selection verification */}
                    {beatElapsedSeconds >= 8.5 && (
                      <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="text-emerald-400 font-semibold text-xs flex items-center gap-2 pl-3 bg-emerald-950/30 py-1 px-2 rounded border border-emerald-500/30">
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-[10px] font-bold">✓</span>
                        <span>Fitted 1 optimal model: ARIMA(1,1,0) established -&gt; Minimum AIC: 701.43 (vs 714.2 for AR2)</span>
                      </motion.div>
                    )}

                    {/* Line 6: cmd - Exact forecast prediction from Google Colab */}
                    {beatElapsedSeconds >= 11.5 && (
                      <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                        <span className="text-amber-400 font-bold select-none">&gt;&gt;&gt;</span>
                        <span className="text-amber-300 font-semibold">arima_preds = arima_model.forecast(steps=6)</span>
                        <span className="text-slate-400 text-xs"># Out-of-Sample Holdout (Jul–Dec 2024)</span>
                        <span className="text-[#F2A541] font-bold animate-pulse">▌</span>
                      </motion.div>
                    )}
                    
                    {/* Metrics Footer Badges */}
                    <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-[11px]">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Colab Verified
                      </span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Stationary (d=1)
                      </span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> AR Term (p &lt; 0.01)
                      </span>
                      <span className="text-amber-300 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Lowest AIC (701.43)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xl md:text-2xl font-mono text-[#F2A541] mt-3 font-bold flex items-center gap-2">
                  <span>ARIMA (1, 1, 0)</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold">Primary Contender</span>
                </div>
              </motion.div>
            )}

            {/* Model 2: Lagged Linear Regression (16s - 26s) — Centered and Lively */}
            {beatElapsedSeconds >= 16 && beatElapsedSeconds < 26 && (
              <motion.div
                key="lr"
                initial={{ opacity: 0, z: -60, scale: 0.94 }}
                animate={{ opacity: 1, z: 0, scale: 1.0 }}
                exit={{ opacity: 0, z: 50 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center px-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                  <span>Autoregressive Linear Predictor · AR(1)–AR(3)</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-extralight text-white tracking-tight">
                  LAGGED LINEAR REGRESSION
                </h2>
                <div className="text-xs sm:text-sm font-mono text-sky-400 mb-3 tracking-widest uppercase font-semibold">
                  Centered Holdout Horizon · Periods 31–36 (Jul–Dec 2024)
                </div>

                {/* Centered Large SVG Line Graph */}
                <div className="relative w-full rounded-2xl bg-slate-950/80 border border-slate-800 p-4 shadow-2xl backdrop-blur-md overflow-hidden">
                  {/* AR Inputs Bar */}
                  <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-400 pb-2 border-b border-slate-800/80">
                    <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-sky-300">Lag 1: Y_(t-1)</span>
                    <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-sky-300">Lag 2: Y_(t-2)</span>
                    <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-sky-300">Lag 3: Y_(t-3)</span>
                    <span className="text-slate-500">→ Linear Weighted Sum</span>
                  </div>

                  <svg viewBox={`0 0 ${holdoutSvgW} ${holdoutSvgH}`} className="w-full h-48 md:h-60 overflow-visible">
                    {/* Y Gridlines matching Matplotlib */}
                    {[380000, 400000, 420000, 440000, 460000].map(v => (
                      <g key={v}>
                        <line x1={holdoutPadL} y1={getHoldoutY(v)} x2={holdoutSvgW - holdoutPadR} y2={getHoldoutY(v)} stroke="#334155" strokeWidth="0.8" />
                        <text x={holdoutPadL - 8} y={getHoldoutY(v) + 4} textAnchor="end" fill="#94A3B8" fontSize="10" fontFamily="monospace">
                          {v}
                        </text>
                      </g>
                    ))}

                    {/* Vertical Gridlines at each date */}
                    {holdoutActualPoints.map((pt, i) => (
                      <line key={`vgrid-${i}`} x1={pt.x} y1={holdoutPadT} x2={pt.x} y2={holdoutSvgH - holdoutPadB} stroke="#1E293B" strokeWidth="0.8" strokeDasharray="2 2" />
                    ))}

                    {/* Actual trajectory in blue (#1f77b4) matching Matplotlib */}
                    <path d={holdoutActualPath} fill="none" stroke="#1f77b4" strokeWidth="2" strokeDasharray="4 4" strokeOpacity="0.7" />
                    {holdoutActualPoints.map((pt, i) => (
                      <circle key={`act-${i}`} cx={pt.x} cy={pt.y} r="3.5" fill="#1f77b4" />
                    ))}
                    
                    {/* Lagged LR Line in Green (#2ca02c) */}
                    <path
                      d={holdoutLrPath}
                      fill="none"
                      stroke="#2ca02c"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Nodes along the LR path with circular markers */}
                    {holdoutLrPoints.map((pt, i) => (
                      <g key={i}>
                        <circle cx={pt.x} cy={pt.y} r="4.5" fill="#2ca02c" stroke="#FFFFFF" strokeWidth="1.5" />
                        <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="#86EFAC" fontSize="10" fontFamily="monospace" fontWeight="bold">
                          {(pt.val / 1000).toFixed(0)}k
                        </text>
                        {/* X Axis Labels */}
                        <text x={pt.x} y={holdoutSvgH - holdoutPadB + 18} textAnchor="middle" fill="#94A3B8" fontSize="11" fontFamily="monospace">
                          {pt.month}
                        </text>
                      </g>
                    ))}

                    {/* End Callout Badge with styled green container pill */}
                    <g transform={`translate(${holdoutLrPoints[5].x + 10}, ${holdoutLrPoints[5].y - 12})`}>
                      <rect x="0" y="0" width="155" height="24" rx="6" fill="#052e16" stroke="#2ca02c" strokeWidth="1.5" />
                      <circle cx="10" cy="12" r="3.5" fill="#2ca02c" />
                      <text x="18" y="16" fill="#86EFAC" fontSize="11" fontFamily="monospace" fontWeight="bold">
                        Lagged LR: 405k
                      </text>
                    </g>
                  </svg>

                  {/* Summary Card */}
                  <div className="flex flex-wrap items-center justify-between text-xs font-mono pt-3 border-t border-slate-800/80 text-slate-400">
                    <span className="text-sky-300 font-semibold">MAE: 37,990 TEUs · MAPE: 8.48%</span>
                    <span className="text-amber-300">Under-forecasting bias (+8.48% MPE)</span>
                    <span className="text-slate-400">Rank #7 of 9 Contenders</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Model 3: Random Forest Regression (26s - 34s) — Centered and Lively */}
            {beatElapsedSeconds >= 26 && beatElapsedSeconds < 34 && (
              <motion.div
                key="rf"
                initial={{ opacity: 0, z: -60, scale: 0.94 }}
                animate={{ opacity: 1, z: 0, scale: 1.0 }}
                exit={{ opacity: 0, z: 50 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center px-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  <span>Machine Learning Ensemble · 100 Regression Trees</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-extralight text-white tracking-tight">
                  RANDOM FOREST REGRESSION
                </h2>
                <div className="text-xs sm:text-sm font-mono text-purple-400 mb-3 tracking-widest uppercase font-semibold">
                  Centered Holdout Horizon · Periods 31–36 (Jul–Dec 2024)
                </div>

                {/* Centered Large SVG Line Graph */}
                <div className="relative w-full rounded-2xl bg-slate-950/80 border border-slate-800 p-4 shadow-2xl backdrop-blur-md overflow-hidden">
                  {/* Decision Tree Nodes Animation */}
                  <div className="flex items-center justify-center gap-2 py-1 border-b border-slate-800/80">
                    <span className="text-[11px] font-mono text-slate-400 mr-2">100 Trees Ensembled:</span>
                    {Array.from({ length: 9 }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -5, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.15 }}
                        className="w-3.5 h-5 rounded bg-purple-900/80 border border-purple-400/60"
                      />
                    ))}
                    <span className="text-[11px] font-mono text-purple-300 ml-2">→ Bootstrapped Average</span>
                  </div>

                  <svg viewBox={`0 0 ${holdoutSvgW} ${holdoutSvgH}`} className="w-full h-48 md:h-60 overflow-visible">
                    {/* Y Gridlines matching Matplotlib */}
                    {[380000, 400000, 420000, 440000, 460000].map(v => (
                      <g key={v}>
                        <line x1={holdoutPadL} y1={getHoldoutY(v)} x2={holdoutSvgW - holdoutPadR} y2={getHoldoutY(v)} stroke="#334155" strokeWidth="0.8" />
                        <text x={holdoutPadL - 8} y={getHoldoutY(v) + 4} textAnchor="end" fill="#94A3B8" fontSize="10" fontFamily="monospace">
                          {v}
                        </text>
                      </g>
                    ))}

                    {/* Vertical Gridlines at each date */}
                    {holdoutActualPoints.map((pt, i) => (
                      <line key={`vgrid-rf-${i}`} x1={pt.x} y1={holdoutPadT} x2={pt.x} y2={holdoutSvgH - holdoutPadB} stroke="#1E293B" strokeWidth="0.8" strokeDasharray="2 2" />
                    ))}

                    {/* Actual trajectory in blue (#1f77b4) matching Matplotlib */}
                    <path d={holdoutActualPath} fill="none" stroke="#1f77b4" strokeWidth="2" strokeDasharray="4 4" strokeOpacity="0.7" />
                    {holdoutActualPoints.map((pt, i) => (
                      <circle key={`act-rf-${i}`} cx={pt.x} cy={pt.y} r="3.5" fill="#1f77b4" />
                    ))}
                    
                    {/* Random Forest Line in Red (#d62728) */}
                    <path
                      d={holdoutRfPath}
                      fill="none"
                      stroke="#d62728"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Nodes along the RF path with circular markers */}
                    {holdoutRfPoints.map((pt, i) => (
                      <g key={i}>
                        <circle cx={pt.x} cy={pt.y} r="4.5" fill="#d62728" stroke="#FFFFFF" strokeWidth="1.5" />
                        <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="#FCA5A5" fontSize="10" fontFamily="monospace" fontWeight="bold">
                          {(pt.val / 1000).toFixed(0)}k
                        </text>
                        {/* X Axis Labels */}
                        <text x={pt.x} y={holdoutSvgH - holdoutPadB + 18} textAnchor="middle" fill="#94A3B8" fontSize="11" fontFamily="monospace">
                          {pt.month}
                        </text>
                      </g>
                    ))}

                    {/* End Callout Badge with styled red container pill */}
                    <g transform={`translate(${holdoutRfPoints[5].x + 10}, ${holdoutRfPoints[5].y - 12})`}>
                      <rect x="0" y="0" width="165" height="24" rx="6" fill="#450a0a" stroke="#d62728" strokeWidth="1.5" />
                      <circle cx="10" cy="12" r="3.5" fill="#d62728" />
                      <text x="18" y="16" fill="#FCA5A5" fontSize="11" fontFamily="monospace" fontWeight="bold">
                        Random Forest: 420k
                      </text>
                    </g>
                  </svg>

                  {/* Summary Card */}
                  <div className="flex flex-wrap items-center justify-between text-xs font-mono pt-3 border-t border-slate-800/80 text-slate-400">
                    <span className="text-purple-300 font-semibold">MAE: 37,138 TEUs · MAPE: 8.31%</span>
                    <span className="text-amber-300">Falls behind 4 conventional models (n=30 sample size limit)</span>
                    <span className="text-slate-400">Rank #6 of 9 Contenders</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Visual Question (34s - 40s): WHICH ONE WINS? -> Cut to black */}
            {beatElapsedSeconds >= 34 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1.0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.0 }}
                className="text-center z-20"
              >
                <h1 className="text-5xl md:text-8xl font-extralight text-slate-100 tracking-[0.15em] uppercase">
                  WHICH ONE WINS?
                </h1>
              </motion.div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* BEAT 5 (2:50 - 3:45 · 55s): FINAL VALIDATION COMPARISON (GREEN MASCOT INSPECTS) */}
        {/* ============================================================== */}
        {currentBeatIndex === 5 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-8 z-10 overflow-hidden">
            {/* Phase 5a (0s - 15s): 3 Models (ARIMA, Lagged LR, Random Forest) Overlapped on Actuals + Movement Dynamics */}
            {beatElapsedSeconds < 15 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1.0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-5xl flex flex-col items-center text-center px-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#F2A541] animate-ping" />
                  <span>Validation Holdout Arena · Periods 31–36 (Jul – Dec 2024)</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-extralight text-white tracking-tight">
                  STATISTICAL VS MACHINE LEARNING
                </h2>
                <div className="text-xs sm:text-sm font-mono text-slate-400 mb-3 tracking-widest uppercase">
                  All 3 Contenders Overlapped on Unseen Validation Trajectory
                </div>

                {/* Centered Large SVG Line Graph with All 3 Models + Actuals matching Matplotlib IMG_0379 */}
                <div className="relative w-full rounded-2xl bg-slate-950/90 border border-slate-800 p-3 sm:p-4 shadow-2xl backdrop-blur-md overflow-hidden">
                  <svg viewBox={`0 0 ${holdoutSvgW} ${holdoutSvgH}`} className="w-full h-60 md:h-72 overflow-visible">
                    {/* Plot Title */}
                    <text
                      x={holdoutPadL + holdoutPlotW / 2}
                      y="26"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="16"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                    >
                      Actual vs. Python-Assisted Forecasts
                    </text>

                    {/* Left Y-Axis Label: Actual Value */}
                    <text
                      x={-(holdoutPadT + holdoutPlotH / 2)}
                      y="22"
                      transform="rotate(-90)"
                      textAnchor="middle"
                      fill="#94A3B8"
                      fontSize="11"
                      fontFamily="sans-serif"
                    >
                      Actual Value
                    </text>

                    {/* Bottom X-Axis Label: Date */}
                    <text
                      x={holdoutPadL + holdoutPlotW / 2}
                      y={holdoutSvgH - 12}
                      textAnchor="middle"
                      fill="#94A3B8"
                      fontSize="11"
                      fontFamily="sans-serif"
                    >
                      Date
                    </text>

                    {/* Outer Plot Box Border */}
                    <rect
                      x={holdoutPadL}
                      y={holdoutPadT}
                      width={holdoutPlotW}
                      height={holdoutPlotH}
                      fill="none"
                      stroke="#475569"
                      strokeWidth="1"
                    />

                    {/* Horizontal Y Gridlines & Ticks (380000 to 460000) */}
                    {[380000, 400000, 420000, 440000, 460000].map(v => (
                      <g key={v}>
                        <line
                          x1={holdoutPadL}
                          y1={getHoldoutY(v)}
                          x2={holdoutPadL + holdoutPlotW}
                          y2={getHoldoutY(v)}
                          stroke="#334155"
                          strokeWidth="0.8"
                        />
                        <text
                          x={holdoutPadL - 8}
                          y={getHoldoutY(v) + 4}
                          textAnchor="end"
                          fill="#94A3B8"
                          fontSize="10"
                          fontFamily="monospace"
                        >
                          {v}
                        </text>
                      </g>
                    ))}

                    {/* Vertical X Gridlines & Month Ticks (2024-07 to 2024-12) */}
                    {holdoutActualPoints.map((pt, i) => (
                      <g key={`v-grid-${i}`}>
                        <line
                          x1={pt.x}
                          y1={holdoutPadT}
                          x2={pt.x}
                          y2={holdoutPadT + holdoutPlotH}
                          stroke="#334155"
                          strokeWidth="0.8"
                        />
                        <text
                          x={pt.x}
                          y={holdoutPadT + holdoutPlotH + 18}
                          textAnchor="middle"
                          fill="#94A3B8"
                          fontSize="11"
                          fontFamily="monospace"
                        >
                          {pt.month}
                        </text>
                      </g>
                    ))}

                    {/* 1. Actual Validation Curve in Blue (#1f77b4) */}
                    <path
                      d={holdoutActualPath}
                      fill="none"
                      stroke="#1f77b4"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {holdoutActualPoints.map((pt, i) => (
                      <circle
                        key={`pt-act-${i}`}
                        cx={pt.x}
                        cy={pt.y}
                        r="4.5"
                        fill="#1f77b4"
                        stroke="#FFFFFF"
                        strokeWidth="1"
                      />
                    ))}

                    {/* 2. ARIMA (1,1,0) Curve in Orange (#ff7f0e) */}
                    <path
                      d={holdoutArimaPath}
                      fill="none"
                      stroke="#ff7f0e"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {holdoutArimaPoints.map((pt, i) => (
                      <circle
                        key={`pt-ar-${i}`}
                        cx={pt.x}
                        cy={pt.y}
                        r="4.5"
                        fill="#ff7f0e"
                        stroke="#FFFFFF"
                        strokeWidth="1"
                      />
                    ))}

                    {/* 3. Lagged Linear Regression Curve in Green (#2ca02c) */}
                    <path
                      d={holdoutLrPath}
                      fill="none"
                      stroke="#2ca02c"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {holdoutLrPoints.map((pt, i) => (
                      <circle
                        key={`pt-lr-${i}`}
                        cx={pt.x}
                        cy={pt.y}
                        r="4.5"
                        fill="#2ca02c"
                        stroke="#FFFFFF"
                        strokeWidth="1"
                      />
                    ))}

                    {/* 4. Random Forest Curve in Red (#d62728) */}
                    <path
                      d={holdoutRfPath}
                      fill="none"
                      stroke="#d62728"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {holdoutRfPoints.map((pt, i) => (
                      <circle
                        key={`pt-rf-${i}`}
                        cx={pt.x}
                        cy={pt.y}
                        r="4.5"
                        fill="#d62728"
                        stroke="#FFFFFF"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Matplotlib Style Legend Box (Bottom Right) */}
                    <g transform={`translate(${holdoutPadL + holdoutPlotW - 195}, ${holdoutPadT + holdoutPlotH - 105})`}>
                      <rect
                        x="0"
                        y="0"
                        width="185"
                        height="95"
                        rx="4"
                        fill="#0F172A"
                        fillOpacity="0.95"
                        stroke="#475569"
                        strokeWidth="1"
                      />
                      {/* Actual */}
                      <circle cx="16" cy="16" r="4" fill="#1f77b4" />
                      <line x1="8" y1="16" x2="24" y2="16" stroke="#1f77b4" strokeWidth="2" />
                      <text x="32" y="20" fill="#E2E8F0" fontSize="11" fontFamily="sans-serif">
                        Actual
                      </text>

                      {/* ARIMA */}
                      <circle cx="16" cy="38" r="4" fill="#ff7f0e" />
                      <line x1="8" y1="38" x2="24" y2="38" stroke="#ff7f0e" strokeWidth="2" />
                      <text x="32" y="42" fill="#E2E8F0" fontSize="11" fontFamily="sans-serif">
                        ARIMA
                      </text>

                      {/* Lagged Linear Regression */}
                      <circle cx="16" cy="60" r="4" fill="#2ca02c" />
                      <line x1="8" y1="60" x2="24" y2="60" stroke="#2ca02c" strokeWidth="2" />
                      <text x="32" y="64" fill="#E2E8F0" fontSize="10" fontFamily="sans-serif">
                        Lagged Linear Regression
                      </text>

                      {/* Random Forest */}
                      <circle cx="16" cy="82" r="4" fill="#d62728" />
                      <line x1="8" y1="82" x2="24" y2="82" stroke="#d62728" strokeWidth="2" />
                      <text x="32" y="86" fill="#E2E8F0" fontSize="11" fontFamily="sans-serif">
                        Random Forest
                      </text>
                    </g>

                    {/* Period 36 Callout Badges on Right Margin */}
                    <g transform={`translate(${holdoutPadL + holdoutPlotW + 12}, 0)`}>
                      {/* Actual Data Badge */}
                      <g transform={`translate(0, ${holdoutActualPoints[5].y - 12})`}>
                        <rect x="0" y="0" width="165" height="22" rx="6" fill="#0F172A" stroke="#1f77b4" strokeWidth="1.2" />
                        <circle cx="10" cy="11" r="3.5" fill="#1f77b4" />
                        <text x="20" y="15" fill="#FFFFFF" fontSize="11" fontFamily="monospace" fontWeight="bold">
                          Actual: 460,304 TEUs
                        </text>
                      </g>

                      {/* ARIMA (1,1,0) Winner Badge - Glowing */}
                      <g transform={`translate(0, ${holdoutArimaPoints[5].y - 13})`}>
                        <rect x="0" y="0" width="185" height="25" rx="6" fill="#451A03" stroke="#ff7f0e" strokeWidth="1.6" />
                        <circle cx="10" cy="12.5" r="4" fill="#ff7f0e" />
                        <text x="20" y="17" fill="#ff7f0e" fontSize="11" fontFamily="monospace" fontWeight="bold">
                          ★ ARIMA: 427,066
                        </text>
                      </g>

                      {/* Random Forest Badge */}
                      <g transform={`translate(0, ${holdoutRfPoints[5].y - 11})`}>
                        <rect x="0" y="0" width="165" height="22" rx="6" fill="#450a0a" stroke="#d62728" strokeWidth="1" />
                        <circle cx="10" cy="11" r="3" fill="#d62728" />
                        <text x="18" y="15" fill="#FCA5A5" fontSize="10.5" fontFamily="monospace">
                          RF: 420,364 TEUs
                        </text>
                      </g>

                      {/* Lagged LR Badge */}
                      <g transform={`translate(0, ${holdoutLrPoints[5].y - 11})`}>
                        <rect x="0" y="0" width="165" height="22" rx="6" fill="#052e16" stroke="#2ca02c" strokeWidth="1" />
                        <circle cx="10" cy="11" r="3" fill="#2ca02c" />
                        <text x="18" y="15" fill="#86EFAC" fontSize="10.5" fontFamily="monospace">
                          LR: 405,430 TEUs
                        </text>
                      </g>
                    </g>
                  </svg>

                  {/* Graph Movement Dynamics Code Visualization (Equalizer Volatility Rhythm) */}
                  <div className="flex items-end justify-center gap-1.5 sm:gap-2 h-10 py-1.5 border-t border-slate-800/80 bg-slate-900/40 rounded-lg px-3 mt-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase mr-2 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-amber-400" />
                      Volatility Rhythm:
                    </span>
                    {movementPulseArray.map((val, idx) => {
                      const heightPct = Math.min(100, Math.max(15, (val / 48) * 100));
                      return (
                        <motion.div
                          key={idx}
                          animate={{
                            height: [`${heightPct * 0.5}%`, `${heightPct}%`, `${heightPct * 0.7}%`]
                          }}
                          transition={{
                            duration: 1.4,
                            repeat: Infinity,
                            delay: idx * 0.08,
                            ease: 'easeInOut'
                          }}
                          className="w-2 sm:w-2.5 rounded-full bg-gradient-to-t from-[#1B6CA8] via-sky-400 to-[#F2A541] shadow-[0_0_8px_rgba(242,165,65,0.4)]"
                          title={`Step ${idx + 1}: ${val}`}
                        />
                      );
                    })}
                    <span className="text-[10px] font-mono text-amber-300 font-bold ml-2">
                      ARIMA Differencing Absorbs Dynamic Velocity
                    </span>
                  </div>

                  {/* Bottom Legend matching Matplotlib IMG_0379 */}
                  <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-mono pt-2 text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#1f77b4]" />
                      <span className="font-bold text-white">Actual (426k–460k TEUs)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#ff7f0e]" />
                      <span className="font-bold text-[#ff7f0e]">ARIMA (1,1,0) · 20,919 MAE (Winner)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#2ca02c]" />
                      <span className="text-[#86EFAC]">Lagged Linear Regression · 37,990 MAE</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#d62728]" />
                      <span className="text-[#FCA5A5]">Random Forest · 37,138 MAE</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Phase 5b (15s - 35s): MORPH 5 — 3D Vertical Bar Ranking by MAE; Centered and Fully Visible */}
            {beatElapsedSeconds >= 15 && beatElapsedSeconds < 35 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full max-w-3xl flex flex-col gap-3 relative mx-auto px-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-mono text-slate-300 uppercase tracking-wider font-bold">
                      Validation Ranking by Out-of-Sample MAE
                    </span>
                  </div>
                  {beatElapsedSeconds >= 27 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-sm md:text-base font-mono font-bold text-[#F2A541] px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30"
                    >
                      ARIMA #1: 20,919 MAE (Winner)
                    </motion.div>
                  )}
                </div>

                <div className="space-y-2">
                  {validationRanking.slice(0, 7).map((item, idx) => {
                    const isArima = item.rank === 1;
                    const maxMAE = 40000;
                    const barWidth = Math.min(100, (item.mae / maxMAE) * 100);
                    return (
                      <div key={item.name} className="flex items-center gap-3 text-xs font-mono">
                        <span className="w-6 text-slate-500 font-bold">#{item.rank}</span>
                        <span className={`w-40 sm:w-48 text-right truncate ${isArima && beatElapsedSeconds >= 25 ? 'text-[#F2A541] font-bold' : 'text-slate-300'}`}>
                          {item.name}
                        </span>
                        {/* 3D Extruded Bar */}
                        <div className="flex-1 h-4 bg-slate-950/80 rounded border border-slate-800 relative overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${barWidth}%` }}
                            transition={{ duration: 1.0, delay: idx * 0.12 }}
                            className={`h-full rounded ${
                              isArima && beatElapsedSeconds >= 25
                                ? 'bg-gradient-to-r from-amber-600 via-[#F2A541] to-amber-300 shadow-[0_0_12px_rgba(242,165,65,0.6)]'
                                : 'bg-[#1B6CA8]'
                            }`}
                          />
                        </div>
                        <span className={`w-20 ${isArima && beatElapsedSeconds >= 25 ? 'text-[#F2A541] font-bold' : 'text-slate-400'}`}>
                          {item.mae.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Green Validator Mascot in Neat Responsive Corner Header */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/90 border border-emerald-500/40 shadow-xl backdrop-blur-md mt-1"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-emerald-400 bg-[#0B2545] p-0.5">
                      <img src={MASCOT_GREEN} alt="Green Mascot" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-[11px] font-mono text-left">
                      <div className="text-emerald-300 font-bold">Validation Inspector Sign-Off</div>
                      <div className="text-slate-400">Verified: ARIMA (1,1,0) outperforms ML by 16,219 TEUs</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    PARSIMONY WINS
                  </span>
                </motion.div>
              </motion.div>
            )}

            {/* Phase 5c (35s - 45s): Cinematic 6-Metric Scoreboard (MAE, MSE, RMSE, MAPE, SMAPE, MPE) */}
            {beatElapsedSeconds >= 35 && beatElapsedSeconds < 45 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1.0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-4xl flex flex-col items-center gap-4 relative z-20 px-4"
              >
                {/* Header Badge */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold tracking-wider uppercase shadow-[0_0_20px_rgba(242,165,65,0.25)]">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Validation Benchmark · All 6 Evaluated Criteria</span>
                </div>

                <div className="text-center">
                  <h2 className="text-3xl md:text-5xl font-extralight text-white tracking-tight">
                    ARIMA (1,1,0) <span className="text-[#F2A541] font-normal">Error Floor</span>
                  </h2>
                  <p className="text-xs font-mono text-slate-400 mt-1">
                    Holdout Evaluation Periods 31–36 (Jul – Dec 2024)
                  </p>
                </div>

                {/* 6 High-Impact Neon Metric Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-full mt-2">
                  {/* 1. MAE */}
                  <motion.div
                    animate={beatElapsedSeconds < 37 ? { scale: [1, 1.03, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                    className={`p-3.5 md:p-4 rounded-2xl border transition-all flex flex-col items-center text-center relative overflow-hidden backdrop-blur-md ${
                      beatElapsedSeconds < 37
                        ? 'bg-amber-950/60 border-amber-400 shadow-[0_0_25px_rgba(242,165,65,0.4)] anim-metric-glow'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
                      ① Mean Absolute Error
                    </div>
                    <div className="text-2xl md:text-3xl font-mono font-bold text-white mt-1">
                      20,919 <span className="text-xs font-normal text-slate-400">TEUs</span>
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 font-bold mt-1">
                      −24.5% vs Baseline (27,725)
                    </div>
                  </motion.div>

                  {/* 2. MSE */}
                  <motion.div
                    animate={beatElapsedSeconds >= 37 && beatElapsedSeconds < 38.5 ? { scale: [1, 1.03, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                    className={`p-3.5 md:p-4 rounded-2xl border transition-all flex flex-col items-center text-center relative overflow-hidden backdrop-blur-md ${
                      beatElapsedSeconds >= 37 && beatElapsedSeconds < 38.5
                        ? 'bg-amber-950/60 border-amber-400 shadow-[0_0_25px_rgba(242,165,65,0.4)] anim-metric-glow'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
                      ② Mean Squared Error
                    </div>
                    <div className="text-2xl md:text-3xl font-mono font-bold text-white mt-1">
                      5.97 × 10⁸
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 font-bold mt-1">
                      Lowest Variance Penalty
                    </div>
                  </motion.div>

                  {/* 3. RMSE */}
                  <motion.div
                    animate={beatElapsedSeconds >= 38.5 && beatElapsedSeconds < 40 ? { scale: [1, 1.03, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                    className={`p-3.5 md:p-4 rounded-2xl border transition-all flex flex-col items-center text-center relative overflow-hidden backdrop-blur-md ${
                      beatElapsedSeconds >= 38.5 && beatElapsedSeconds < 40
                        ? 'bg-amber-950/60 border-amber-400 shadow-[0_0_25px_rgba(242,165,65,0.4)] anim-metric-glow'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
                      ③ Root Mean Squared Error
                    </div>
                    <div className="text-2xl md:text-3xl font-mono font-bold text-white mt-1">
                      24,426 <span className="text-xs font-normal text-slate-400">TEUs</span>
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 font-bold mt-1">
                      Severe Shock Dampened
                    </div>
                  </motion.div>

                  {/* 4. MAPE */}
                  <motion.div
                    animate={beatElapsedSeconds >= 40 && beatElapsedSeconds < 41.5 ? { scale: [1, 1.03, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                    className={`p-3.5 md:p-4 rounded-2xl border transition-all flex flex-col items-center text-center relative overflow-hidden backdrop-blur-md ${
                      beatElapsedSeconds >= 40 && beatElapsedSeconds < 41.5
                        ? 'bg-amber-950/60 border-amber-400 shadow-[0_0_25px_rgba(242,165,65,0.4)] anim-metric-glow'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
                      ④ Mean Absolute % Error
                    </div>
                    <div className="text-2xl md:text-3xl font-mono font-bold text-[#F2A541] mt-1">
                      4.71%
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 font-bold mt-1">
                      Decisive Leader (&lt; 5.0%)
                    </div>
                  </motion.div>

                  {/* 5. SMAPE */}
                  <motion.div
                    animate={beatElapsedSeconds >= 41.5 && beatElapsedSeconds < 43 ? { scale: [1, 1.03, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                    className={`p-3.5 md:p-4 rounded-2xl border transition-all flex flex-col items-center text-center relative overflow-hidden backdrop-blur-md ${
                      beatElapsedSeconds >= 41.5 && beatElapsedSeconds < 43
                        ? 'bg-amber-950/60 border-amber-400 shadow-[0_0_25px_rgba(242,165,65,0.4)] anim-metric-glow'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
                      ⑤ Symmetric MAPE
                    </div>
                    <div className="text-2xl md:text-3xl font-mono font-bold text-white mt-1">
                      4.82%
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 font-bold mt-1">
                      Balanced Error Bounds
                    </div>
                  </motion.div>

                  {/* 6. MPE */}
                  <motion.div
                    animate={beatElapsedSeconds >= 43 ? { scale: [1, 1.03, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                    className={`p-3.5 md:p-4 rounded-2xl border transition-all flex flex-col items-center text-center relative overflow-hidden backdrop-blur-md ${
                      beatElapsedSeconds >= 43
                        ? 'bg-amber-950/60 border-amber-400 shadow-[0_0_25px_rgba(242,165,65,0.4)] anim-metric-glow'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
                      ⑥ Mean Percentage Error (Bias)
                    </div>
                    <div className="text-2xl md:text-3xl font-mono font-bold text-white mt-1">
                      +2.43%
                    </div>
                    <div className="text-[10px] font-mono text-sky-400 font-bold mt-1">
                      Minimal Directional Drift
                    </div>
                  </motion.div>
                </div>

                {/* Subtext Summary */}
                <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-3">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Sweep across all 6 criteria
                  </span>
                  <span>·</span>
                  <span>Outperformed RF (8.31%) &amp; Linear Trend (24.15%)</span>
                </div>
              </motion.div>
            )}

            {/* Phase 5d (45s - 55s): Finalist Comparison (ETS vs RF vs ARIMA) -> ARIMA WINS */}
            {beatElapsedSeconds >= 45 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9 }}
                className="text-center flex flex-col items-center gap-6"
              >
                <div className="grid grid-cols-3 gap-6 text-center max-w-xl">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 opacity-60">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Conventional</div>
                    <div className="text-sm font-bold text-white mt-1">ETS α=0.50</div>
                    <div className="text-xs text-slate-400 mt-1">27,725 MAE</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 opacity-50">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Machine Learning</div>
                    <div className="text-sm font-bold text-white mt-1">Random Forest</div>
                    <div className="text-xs text-slate-400 mt-1">37,138 MAE</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0B2545] border border-[#F2A541] shadow-2xl scale-110">
                    <div className="text-[10px] font-mono text-[#F2A541] uppercase font-bold">Statistical Winner</div>
                    <div className="text-base font-bold text-white mt-1">ARIMA (1,1,0)</div>
                    <div className="text-xs text-emerald-400 font-bold mt-1">20,919 MAE</div>
                  </div>
                </div>

                <h1 className="text-4xl md:text-7xl font-extralight text-[#F2A541] tracking-[0.2em] uppercase mt-2">
                  ARIMA WINS
                </h1>
              </motion.div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* BEAT 6 (3:45 - 4:30 · 45s): RECOMMENDATION, OVERSIGHT & BOOKEND */}
        {/* ============================================================== */}
        {currentBeatIndex === 6 && (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            {/* Phase 6a (0s - 14s): MORPH 6 — Forecast line -> Operations Capacity (USE ARIMA, ROLL FORWARD) */}
            {beatElapsedSeconds < 14 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center z-10 flex flex-col items-center gap-4"
              >
                <div className="text-xs font-mono uppercase tracking-[0.3em] text-[#F2A541]">
                  Operational Management Action
                </div>
                <h1 className="text-5xl md:text-8xl font-extralight text-white tracking-tight">
                  USE ARIMA
                </h1>
                <div className="text-2xl md:text-4xl font-mono text-[#F2A541]">
                  (1, 1, 0)
                </div>
                <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400 mt-2">
                  ROLL FORWARD MONTHLY
                </div>
              </motion.div>
            )}

            {/* Phase 6b (14s - 24s): Capacity Commitment Protocol — 3-Step Action & Note Motion Cards */}
            {beatElapsedSeconds >= 14 && beatElapsedSeconds < 24 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1.0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.7 }}
                className="text-center z-10 flex flex-col items-center gap-5 w-full max-w-4xl px-4"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#F2A541] animate-ping" />
                  <span>Operations Management Protocol · 3-Step Execution Framework</span>
                </div>

                <div className="text-center">
                  <h2 className="text-3xl md:text-5xl font-extralight text-white tracking-tight">
                    CAPACITY COMMITMENT PROTOCOL
                  </h2>
                  <p className="text-xs sm:text-sm font-mono text-slate-400 mt-1">
                    Converting Statistical Forecast into Physical Port Operations
                  </p>
                </div>

                {/* 3-Step Action & Note Motion Cards (Inspired by Reference Workflow Effect) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full mt-2">
                  {/* Step 1: Gather Context */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all backdrop-blur-md relative overflow-hidden ${
                      beatElapsedSeconds >= 14 && beatElapsedSeconds < 17
                        ? 'bg-[#0B2545]/90 border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.35)] ring-1 ring-sky-400'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-sky-400 font-bold mb-2 uppercase">
                        <span className="px-2 py-0.5 rounded bg-sky-950/80 border border-sky-800">01 · Gather Context</span>
                        <span className="w-2 h-2 rounded-full bg-sky-400" />
                      </div>
                      <div className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
                        <span>Ingest ARIMA (1,1,0) Signal</span>
                      </div>
                      <div className="text-xs text-slate-300 leading-relaxed font-sans">
                        Reads monthly container export volume manifests, extracts 430k–460k baseline point projection, and validates stationarity (d=1).
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Statistical Anchor</span>
                      <span className="text-sky-300 font-bold">MAE: 20,919 TEUs</span>
                    </div>
                  </motion.div>

                  {/* Step 2: Take Action */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all backdrop-blur-md relative overflow-hidden ${
                      beatElapsedSeconds >= 17 && beatElapsedSeconds < 20.5
                        ? 'bg-[#0B2545]/90 border-amber-400 shadow-[0_0_25px_rgba(242,165,65,0.4)] ring-1 ring-amber-400'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#F2A541] font-bold mb-2 uppercase">
                        <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800">02 · Take Action</span>
                        <span className="w-2 h-2 rounded-full bg-[#F2A541] animate-pulse" />
                      </div>
                      <div className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
                        <span>Commit +5% to +8% Buffer</span>
                      </div>
                      <div className="text-xs text-slate-300 leading-relaxed font-sans">
                        Pre-stages heavy crane blocks and reserves commercial berth hours to insulate against asymmetric $50,000/day carrier demurrage penalties.
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Risk Insurance</span>
                      <span className="text-amber-300 font-bold">+22k TEUs Headroom</span>
                    </div>
                  </motion.div>

                  {/* Step 3: Verify Work */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all backdrop-blur-md relative overflow-hidden ${
                      beatElapsedSeconds >= 20.5
                        ? 'bg-[#0B2545]/90 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 font-bold mb-2 uppercase">
                        <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">03 · Verify Work</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                      <div className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
                        <span>Audit &amp; Human IE Sign-Off</span>
                      </div>
                      <div className="text-xs text-slate-300 leading-relaxed font-sans">
                        Runs monthly tracking signals, retains ETS α=0.50 as spreadsheet backup, and enforces human engineering review if error drift exceeds 6.2%.
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Continuous Quality</span>
                      <span className="text-emerald-300 font-bold">ETS α=0.50 Backup</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Phase 6c (24s - 32s): Human Oversight Hierarchy (MODEL -> HUMAN -> DECISION) */}
            {beatElapsedSeconds >= 24 && beatElapsedSeconds < 32 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1.0 }}
                exit={{ opacity: 0 }}
                className="text-center z-10 flex flex-col items-center gap-6"
              >
                <div className="flex items-center gap-4 md:gap-8 text-2xl md:text-5xl font-extralight tracking-wider">
                  <span className="text-slate-500">MODEL</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-[#F2A541] font-normal">HUMAN</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-white">DECISION</span>
                </div>
                <div className="flex items-center gap-6 text-xs font-mono text-slate-400 uppercase tracking-widest mt-2">
                  <span>QUARTERLY REVIEW (TRIGGER &gt; 6.2%)</span>
                  <span>·</span>
                  <span>SHOCKS</span>
                  <span>·</span>
                  <span>HUMAN SIGN-OFF</span>
                </div>
              </motion.div>
            )}

            {/* Phase 6d (32s - 40s): MORPH 7 — Return to Port of LA Scene + Final Statement */}
            {beatElapsedSeconds >= 32 && beatElapsedSeconds < 40 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center p-8 text-center"
              >
                <img
                  src={ESTABLISHING_SHOT_IMG}
                  alt="Port of Los Angeles Final Bookend"
                  className="w-full h-full object-cover brightness-[0.35] contrast-[1.1]"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1.0 }}
                  transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-10 max-w-4xl flex flex-col items-center gap-4 bg-slate-950/85 p-8 rounded-3xl border border-amber-500/40 shadow-2xl backdrop-blur-md"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-[#F2A541] animate-ping" />
                    <span>Industrial Engineering Final Verdict</span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-extralight text-white tracking-wide drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                    USE ARIMA (1, 1, 0)
                  </h2>
                  <div className="text-base md:text-xl font-mono text-[#F2A541] font-bold tracking-widest uppercase drop-shadow-[0_0_12px_rgba(242,165,65,0.6)]">
                    +5% TO +8% FLEXIBLE BUFFER · REVALIDATE QUARTERLY
                  </div>
                  <div className="text-xs md:text-sm font-mono text-slate-300 tracking-wider">
                    ETS α = 0.50 SPREADSHEET AUDIT BACKUP · HUMAN CHIEF OVERRIDE
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Phase 6e (40s - 45s): Minimal Black End Card with 3 Mascots Assemble */}
            {beatElapsedSeconds >= 40 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 bg-[#060B14] flex flex-col items-center justify-center gap-4 z-20 text-center px-6"
              >
                {/* 3 Mascots in End Card */}
                <div className="flex items-center justify-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-sky-400 bg-slate-900 p-1">
                    <img src={MASCOT_BLUE} alt="Blue Mascot" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400 bg-[#0B2545] p-1 scale-110">
                    <img src={MASCOT_ORANGE} alt="Orange Mascot" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-emerald-400 bg-slate-900 p-1">
                    <img src={MASCOT_GREEN} alt="Green Mascot" className="w-full h-full object-contain" />
                  </div>
                </div>

                <div className="text-xl sm:text-2xl md:text-4xl font-extralight tracking-[0.25em] uppercase text-slate-200">
                  IE-PC 3112 · GROUP 7
                </div>
                <div className="text-xs sm:text-sm font-mono text-slate-400 tracking-widest">
                  OPERATIONS MANAGEMENT 1 · BSIE 3-E · SECTION D10
                </div>
                <div className="text-xs text-sky-400 font-mono">
                  Cebu Technological University – Main Campus
                </div>
              </motion.div>
            )}
          </div>
        )}
        </div>

        {/* ============================================================== */}
        {/* MINIMAL KEYNOTE TRANSPORT HUD                                 */}
        {/* ============================================================== */}
        <AnimatePresence>
          {(mouseActive || !isPlaying) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-x-0 bottom-0 p-4 md:p-6 bg-gradient-to-t from-[#060B14]/95 via-[#060B14]/60 to-transparent flex flex-col gap-2 z-30"
            >
              {/* Progress Scrub Bar (Exactly 7 Beats) */}
              <div className="grid grid-cols-7 gap-1.5 w-full">
                {KEYNOTE_BEATS.slice(0, 7).map((beat, idx) => {
                  const isPast = currentBeatIndex > idx;
                  const isCurrent = currentBeatIndex === idx;
                  const beatProgress = isCurrent
                    ? (beatElapsedSeconds / beat.durationSeconds) * 100
                    : isPast
                    ? 100
                    : 0;

                  return (
                    <div
                      key={beat.id}
                      onClick={() => skipToBeat(idx)}
                      className="group cursor-pointer py-1.5 flex flex-col gap-1"
                    >
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-400 group-hover:bg-[#F2A541] transition-all"
                          style={{ width: `${beatProgress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 group-hover:text-slate-300">
                        <span>{idx === 0 ? 'Intro' : `B${idx}`}</span>
                        <span>{beat.durationSeconds}s</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Control Row */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                {/* Left: Play/Pause, Replay, Time */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying((p) => !p)}
                    className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  <button
                    onClick={() => {
                      setCurrentBeatIndex(0);
                      setBeatElapsedSeconds(0);
                      setIsPlaying(true);
                    }}
                    className="p-2 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-white transition-colors"
                    title="Restart from Beginning"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-white transition-colors"
                    title={isMuted ? "Unmute Ambient Bed" : "Mute Ambient Bed"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <div className="font-mono text-[11px] text-slate-400 pl-2">
                    <span className="text-white font-bold">{formatTime(totalElapsedSeconds)}</span>
                    <span className="mx-1 text-slate-600">/</span>
                    <span>{formatTime(TOTAL_KEYNOTE_SECONDS)}</span>
                  </div>
                </div>

                {/* Center: Slide Title */}
                <div className="hidden md:flex items-center gap-2 font-mono text-[11px] text-slate-400">
                  <span className="text-sky-400 font-bold">
                    {currentBeat.beatNumber === 0 ? 'Prologue:' : `Beat ${currentBeat.beatNumber} of 6:`}
                  </span>
                  <span className="text-white truncate max-w-sm">{currentBeat.title}</span>
                </div>

                {/* Right: Fullscreen & Presenter Notes */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPresenterHUD(!showPresenterHUD)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all flex items-center gap-1.5 ${
                      showPresenterHUD
                        ? 'bg-[#1B6CA8] text-white font-bold'
                        : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Presenter Teleprompter</span>
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-white transition-colors"
                    title="Toggle Fullscreen (F)"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Presenter Teleprompter HUD (Press C or click button) */}
        <AnimatePresence>
          {showPresenterHUD && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="absolute bottom-20 inset-x-4 md:inset-x-12 z-40 bg-slate-950/95 border border-[#1B6CA8]/60 p-4 rounded-xl shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <Mic className="w-3.5 h-3.5 text-[#F2A541]" />
                  <span className="font-bold text-[#F2A541]">LIVE SPEAKER SCRIPT (Presenter-First)</span>
                  <span className="text-slate-400 font-mono">· {currentBeat.speaker}</span>
                </div>
                <button
                  onClick={() => setShowPresenterHUD(false)}
                  className="text-slate-400 hover:text-white text-xs font-mono"
                >
                  ✕ Close (C)
                </button>
              </div>
              <p className="text-sm md:text-base text-slate-200 leading-relaxed font-serif">
                "{currentBeat.livePresenterPrompt}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Export Presentation Modal */}
      <ExportPresentationModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};
