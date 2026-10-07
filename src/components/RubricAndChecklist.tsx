import React, { useState } from 'react';
import { 
  CheckSquare, Award, AlertCircle, FileCheck, ClipboardList, 
  Download, Printer, CheckCircle2, ShieldCheck, Calendar, Clock, Ship, UserCheck
} from 'lucide-react';
import { TEAM_MEMBERS, GROUP_INFO } from '../data/forecastingData';

export const RubricAndChecklist: React.FC = () => {
  const [checklistState, setChecklistState] = useState<{ [key: string]: boolean }>({
    csv: true,
    workbook: true,
    selectionRecord: true,
    colab: true,
    resultsCsv: true,
    comparisonCsv: true,
    report: true,
    presentationFile: true,
    declaration: true,
  });

  const toggleChecklist = (key: string) => {
    setChecklistState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const checklistItems = [
    { id: 'csv', label: 'Assigned real-data CSV (D10_PortOfLA_Exports_Jan2022_Dec2024.csv with Date & Actual Value headers)', required: true },
    { id: 'workbook', label: 'Conventional forecasting workbook with formulas (Sheets 01 to 09, no static hardcoded values)', required: true },
    { id: 'selectionRecord', label: 'Completed Model Selection Record (Part V signed before validation data released)', required: true },
    { id: 'colab', label: 'Executed Google Colab notebook (.ipynb with sequential outputs for Codes 1 to 15)', required: true },
    { id: 'resultsCsv', label: 'Python_Forecasting_Results.csv (Code 14 validation forecast table)', required: true },
    { id: 'comparisonCsv', label: 'Python_Model_Comparison.csv (Code 11 & Part IX 6-metric summary table)', required: true },
    { id: 'report', label: 'Analytical report (5–7 pages synthesized OM analysis, no code dumps)', required: true },
    { id: 'presentationFile', label: 'Presentation file (Concise deck for 3–5 minute presentation limit)', required: true },
    { id: 'declaration', label: 'Signed Academic Integrity & Responsible Technology Declaration (All Group 7 signatures: Aligato, Ansay, Villagracia)', required: true },
  ];

  const rubricCriteria = [
    {
      criterion: "Conventional Forecasting Analysis",
      weight: 25,
      evidence: "Correct fixed 3-period SMA, fixed 3-period WMA (0.50, 0.30, 0.20), exponential smoothing (α = 0.2, 0.5, 0.8), trend analysis, and transparent formulas in workbook.",
      status: "Excellent (4/4)"
    },
    {
      criterion: "Validation and Comparative Analysis",
      weight: 20,
      evidence: "Correct MAE, MSE, RMSE, MAPE, SMAPE, and MPE calculations on held-out 6 periods; rolling 1-period-ahead forecasts; meaningful cross-model synthesis.",
      status: "Excellent (4/4)"
    },
    {
      criterion: "Operations Recommendation and Judgment",
      weight: 15,
      evidence: "Evidence-based recommendation tied to real Port of LA TEU decisions: crane berth scheduling, longshore gang labor shifts ($42k/gang), and demurrage risk ($50k+/day).",
      status: "Excellent (4/4)"
    },
    {
      criterion: "Real-Data Understanding and Integrity",
      weight: 10,
      evidence: "Correct source (Port of Los Angeles), physical units (TEUs), 36-month timeline (Jan 2022 - Dec 2024), Feb 2023 anomaly pattern recognition, and preservation of raw data.",
      status: "Excellent (4/4)"
    },
    {
      criterion: "Statistical & Machine Learning Rigor",
      weight: 10,
      evidence: "Proper chronological train/validation split (Months 1-30 vs 31-36, no shuffle), ARIMA(1,1,0), lagged regression, and diagnosis of Random Forest overfitting on small samples.",
      status: "Excellent (4/4)"
    },
    {
      criterion: "Workbook Completeness & Integrity",
      weight: 10,
      evidence: "Full dynamic Excel formula linking, professional sheet formatting, no broken references (#REF!), and adherence to workbook architecture.",
      status: "Excellent (4/4)"
    },
    {
      criterion: "Presentation and Defense Quality",
      weight: 10,
      evidence: "Strict compliance with 3-5 minute presentation limit (4:30 total); balanced speaking distribution across all 3 members (75s–100s each); crisp technical defense against random questions.",
      status: "Excellent (4/4)"
    }
  ];

  const completedCount = Object.values(checklistState).filter(Boolean).length;
  const isAllComplete = completedCount === checklistItems.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Google Classroom Critical Instructions Banner */}
      <div className="p-6 rounded-2xl bg-amber-500/10 border-2 border-amber-500/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>CRITICAL GOOGLE CLASSROOM SUBMISSION PROTOCOL · GROUP 7</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Pre-Presentation Submission Rules · Group Leader Action
          </h2>
          <p className="text-xs md:text-sm text-slate-200 max-w-3xl leading-relaxed">
            All groups must submit their complete requirements in Google Classroom <strong>BEFORE</strong> the presentation starts on <strong>October 8, 2026 (9:00 AM)</strong>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Only <strong>Rash Mae Crystelle C. Ansay (Group Leader)</strong> will upload files and click "Turn In".</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Other 2 members (Aligato, Villagracia) must <strong>NOT</strong> submit duplicate copies.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Ensure all 9 files are complete and properly named before turning in.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Submission must already be completed before Group 7 presents.</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0B2545] p-4 rounded-xl border border-[#1B6CA8] text-right shrink-0">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Presentation Schedule</div>
          <div className="text-sm font-bold text-white mt-1">October 8, 2026</div>
          <div className="text-xs text-sky-300 font-mono">9:00 AM – 12:00 PM</div>
          <div className="text-[10px] text-slate-400 mt-1">Room 304 · BSIE 3-E</div>
        </div>
      </div>

      {/* Two Column Layout: Submission Checklist & 100-Point Rubric */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Submission Checklist */}
        <div className="lg:col-span-6 bg-[#0B2545]/90 border border-[#1B6CA8]/50 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
                <FileCheck className="w-4 h-4" />
                <span>MANDATORY DELIVERABLES</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Submission Checklist (9 Deliverables)
              </h3>
            </div>
            <div className="text-right">
              <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full ${
                isAllComplete ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {completedCount} / {checklistItems.length} Verified
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {checklistItems.map((item) => {
              const checked = checklistState[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    checked
                      ? 'bg-slate-950/70 border-slate-800 text-slate-200'
                      : 'bg-red-500/5 border-red-500/30 text-red-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {}}
                    className="mt-1 w-4 h-4 rounded text-sky-500 focus:ring-sky-400 focus:ring-offset-slate-950 bg-slate-900 border-slate-700"
                  />
                  <div className="text-xs leading-relaxed select-none">
                    <span className={checked ? 'line-through text-slate-400' : 'font-semibold text-white'}>
                      {item.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span className="font-semibold">Academic Integrity Declaration:</span>
            <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Signed by 5 Members</span>
            </span>
          </div>
        </div>

        {/* Right Column: 100-Point Scoring Rubric Breakdown */}
        <div className="lg:col-span-6 bg-[#0B2545]/90 border border-[#1B6CA8]/50 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
                <Award className="w-4 h-4" />
                <span>OFFICIAL EVALUATION CRITERIA</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Engr. Baclayon 100-Point Scoring Rubric
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-sky-300 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-400/20">
              Total: 100 Points
            </span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {rubricCriteria.map((rc, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{rc.criterion}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-sky-400">{rc.weight} pts</span>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {rc.status}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  {rc.evidence}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-[#1B6CA8]/20 to-[#0B2545] border border-[#1B6CA8]/40 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-white">Target Group Score: 100 / 100</div>
              <div className="text-[11px] text-slate-300">Operations Management 1 Excellence</div>
            </div>
            <span className="px-3 py-1 rounded-lg bg-[#1B6CA8] text-white font-bold text-xs">
              Grade: 1.0 (Highest)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
