import React from 'react';
import { Play, Shield, Database, FileText, CheckSquare, Ship, Sparkles, BookOpen, SlidersHorizontal, Download, Box } from 'lucide-react';
import { BaselineModelChoice, BASELINE_MODELS } from '../data/forecastingData';

export type AppTab = 'presentation' | 'morph3d' | 'motion' | 'manual' | 'defense' | 'data' | 'scripts' | 'checklist';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onLaunchPresentation: () => void;
  isPlaying: boolean;
  selectedBaseline: BaselineModelChoice;
  onSelectBaseline: (baseline: BaselineModelChoice) => void;
  onExportPresentation?: () => void;
  onDownloadPPTX?: () => void;
}

// Authoritative mascot image assets for Group 7
const MASCOT_BLUE = '/src/assets/images/mascot_blue_analyst_1791196865420.jpg';
const MASCOT_ORANGE = '/src/assets/images/mascot_orange_planner_1791196885029.jpg';
const MASCOT_GREEN = '/src/assets/images/mascot_green_validator_1791196903349.jpg';

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onLaunchPresentation,
  isPlaying,
  selectedBaseline,
  onSelectBaseline,
  onExportPresentation,
  onDownloadPPTX
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0B2545]/95 backdrop-blur-md border-b border-[#1B6CA8]/40 px-4 md:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Zone 1: Wordmark & Group 7 Details with Mascot Avatars */}
        <div className="flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1B6CA8] to-sky-500 flex items-center justify-center font-black text-white shadow-md shadow-[#1B6CA8]/30">
              <Ship className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base md:text-lg font-black tracking-tight text-white leading-tight">
                  D10: The Forecasting Challenge
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-[#1B6CA8]/40 text-sky-200 border border-sky-400/30">
                  Port of Los Angeles TEUs
                </span>
              </div>
              <div className="text-xs text-slate-300 hidden sm:flex items-center gap-2">
                <div>
                  <span className="font-bold text-sky-400">Group 7</span> · BSIE 3-E · Cebu Technological University
                </div>
                {/* 3 Mascots Avatar Pill */}
                <div className="flex items-center -space-x-1.5 pl-1.5 border-l border-slate-700">
                  <img 
                    src={MASCOT_BLUE} 
                    alt="Elaiza Jane Aligato" 
                    title="Elaiza Jane Aligato · Lead Analyst & Time-Series Specialist" 
                    className="w-5 h-5 rounded-full border border-sky-400 object-cover bg-slate-900" 
                  />
                  <img 
                    src={MASCOT_ORANGE} 
                    alt="Rash Mae Crystelle Ansay" 
                    title="Rash Mae Crystelle Ansay (Leader) · Port Operations Planner" 
                    className="w-5 h-5 rounded-full border border-amber-400 object-cover bg-slate-900" 
                  />
                  <img 
                    src={MASCOT_GREEN} 
                    alt="Mylene Joy Villagracia" 
                    title="Mylene Joy Villagracia · ML Validation Engineer" 
                    className="w-5 h-5 rounded-full border border-emerald-400 object-cover bg-slate-900" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Play Button for Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onLaunchPresentation}
              className={`p-2 text-xs font-bold rounded-lg transition-all ${
                isPlaying
                  ? 'bg-[#F2A541] text-slate-950 ring-2 ring-[#F2A541]/50'
                  : 'bg-[#1B6CA8] text-white'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('presentation')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'presentation'
                ? 'bg-[#1B6CA8] text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Keynote Video</span>
          </button>

          <button
            onClick={() => setActiveTab('morph3d')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'morph3d'
                ? 'bg-gradient-to-r from-amber-500 to-sky-500 text-slate-950 font-black shadow-md'
                : 'text-amber-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-amber-400" />
            <span>3D Morph Studio</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-200 border border-amber-400/40 font-bold">
              3D FX
            </span>
          </button>

          <button
            onClick={() => setActiveTab('motion')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'motion'
                ? 'bg-[#1B6CA8] text-white shadow-sm'
                : 'text-sky-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Motion FX</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
              Flourish
            </span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'manual'
                ? 'bg-[#1B6CA8] text-white shadow-sm'
                : 'text-amber-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Activity Manual</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
              Part I–XIV
            </span>
          </button>

          <button
            onClick={() => setActiveTab('defense')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'defense'
                ? 'bg-[#1B6CA8] text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Defense (10m)</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'data'
                ? 'bg-[#1B6CA8] text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Data Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('scripts')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'scripts'
                ? 'bg-[#1B6CA8] text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Scripts</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'checklist'
                ? 'bg-[#1B6CA8] text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Rubric</span>
          </button>
        </nav>

        {/* Zone 3: Interactive Workbook Model Switcher & Presentation Launch */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          {/* Workbook Model Switcher Pill */}
          <div className="flex items-center bg-slate-950/90 border border-slate-800 rounded-xl p-1 text-[11px]">
            <span className="text-[10px] text-slate-400 font-mono px-2 hidden sm:inline flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-sky-400" />
              <span>Workbook Model:</span>
            </span>
            <button
              onClick={() => onSelectBaseline('wma3')}
              title="3-Period Weighted Moving Average (0.50, 0.30, 0.20) — 6.41% Validation MAPE"
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                selectedBaseline === 'wma3'
                  ? 'bg-[#1B6CA8] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3-Period WMA <span className="text-[9px] opacity-80">(6.41%)</span>
            </button>
            <button
              onClick={() => onSelectBaseline('es05')}
              title="Exponential Smoothing (α = 0.50) — 6.22% Validation MAPE"
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                selectedBaseline === 'es05'
                  ? 'bg-[#1B6CA8] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ETS (α=0.50) <span className="text-[9px] opacity-80">(6.22%)</span>
            </button>
          </div>

          {onDownloadPPTX && (
            <button
              onClick={onDownloadPPTX}
              className="px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 bg-orange-600/90 hover:bg-orange-500 text-white shadow-md shadow-orange-950/40"
              title="Download Genuine PowerPoint Presentation (.pptx)"
            >
              <span className="font-mono text-[10px] font-black bg-orange-950/60 px-1 py-0.5 rounded text-orange-200">PPTX</span>
              <span className="hidden sm:inline">Slides</span>
            </button>
          )}

          {onExportPresentation && (
            <button
              onClick={onExportPresentation}
              className="px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 bg-slate-900/90 hover:bg-[#F2A541] hover:text-slate-950 text-slate-200 border border-slate-800 shadow-md"
              title="Export Keynote Presentation (PDF / Script / Data)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          <button
            onClick={onLaunchPresentation}
            className={`hidden md:flex px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all items-center gap-2 shadow-lg whitespace-nowrap ${
              isPlaying
                ? 'bg-[#F2A541] hover:bg-[#F2A541]/90 text-slate-950 ring-2 ring-[#F2A541]/50'
                : 'bg-[#1B6CA8] hover:bg-sky-500 text-white shadow-[#1B6CA8]/30'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isPlaying ? 'Playing' : 'Play Video'}</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex lg:hidden overflow-x-auto gap-1 mt-2 pt-2 border-t border-slate-800/60 no-scrollbar">
        <button
          onClick={() => setActiveTab('presentation')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-md ${activeTab === 'presentation' ? 'bg-[#1B6CA8] text-white font-bold' : 'text-slate-400'}`}
        >
          Presentation
        </button>
        <button
          onClick={() => setActiveTab('morph3d')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-md ${activeTab === 'morph3d' ? 'bg-[#F2A541] text-slate-950 font-black' : 'text-amber-300'}`}
        >
          3D Morph
        </button>
        <button
          onClick={() => setActiveTab('motion')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-md ${activeTab === 'motion' ? 'bg-[#1B6CA8] text-white font-bold' : 'text-sky-300'}`}
        >
          Motion FX
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-md ${activeTab === 'manual' ? 'bg-[#1B6CA8] text-white font-bold' : 'text-amber-300'}`}
        >
          Manual
        </button>
        <button
          onClick={() => setActiveTab('defense')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-md ${activeTab === 'defense' ? 'bg-[#1B6CA8] text-white font-bold' : 'text-slate-400'}`}
        >
          Defense
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-md ${activeTab === 'data' ? 'bg-[#1B6CA8] text-white font-bold' : 'text-slate-400'}`}
        >
          Data Lab
        </button>
        <button
          onClick={() => setActiveTab('scripts')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-md ${activeTab === 'scripts' ? 'bg-[#1B6CA8] text-white font-bold' : 'text-slate-400'}`}
        >
          Scripts
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-md ${activeTab === 'checklist' ? 'bg-[#1B6CA8] text-white font-bold' : 'text-slate-400'}`}
        >
          Rubric
        </button>
      </div>
    </header>
  );
};
