import React, { useState } from 'react';
import { 
  Shield, HelpCircle, CheckCircle, ChevronRight, UserCheck, Shuffle, 
  BookOpen, Calculator, AlertOctagon, Sparkles, Terminal, FileCode, Award, Ship 
} from 'lucide-react';
import { TECHNICAL_DEFENSE_QUESTIONS, DefenseQuestion } from '../data/technicalDefenseQnA';
import { TEAM_MEMBERS, BaselineModelChoice, BASELINE_MODELS } from '../data/forecastingData';

interface TechnicalDefenseSimulatorProps {
  selectedBaseline?: BaselineModelChoice;
}

export const TechnicalDefenseSimulator: React.FC<TechnicalDefenseSimulatorProps> = ({
  selectedBaseline = 'wma3'
}) => {
  const activeModelConfig = BASELINE_MODELS[selectedBaseline] || BASELINE_MODELS.wma3;
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeQuestion, setActiveQuestion] = useState<DefenseQuestion>(TECHNICAL_DEFENSE_QUESTIONS[0]);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(true);
  const [calledMember, setCalledMember] = useState<typeof TEAM_MEMBERS[0] | null>(null);

  // Interactive Sandbox state for testing port error sensitivity
  const [sandboxActual, setSandboxActual] = useState<number>(449897.75);
  const [sandboxForecast, setSandboxForecast] = useState<number>(410870.83);

  const categories = ['All', 'Dataset & Operations', 'Conventional Methods', 'Validation & Metrics', 'Advanced ML', 'Human Oversight'];

  const filteredQuestions = selectedCategory === 'All'
    ? TECHNICAL_DEFENSE_QUESTIONS
    : TECHNICAL_DEFENSE_QUESTIONS.filter(q => q.category === selectedCategory);

  const handleRandomQuestion = () => {
    const randomQ = TECHNICAL_DEFENSE_QUESTIONS[Math.floor(Math.random() * TECHNICAL_DEFENSE_QUESTIONS.length)];
    const randomMember = TEAM_MEMBERS[Math.floor(Math.random() * TEAM_MEMBERS.length)];
    setActiveQuestion(randomQ);
    setCalledMember(randomMember);
    setIsAnswerRevealed(false);
  };

  // Sandbox metrics calculation
  const error = sandboxActual - sandboxForecast;
  const absError = Math.abs(error);
  const squaredError = Math.pow(error, 2);
  const percentageError = (error / sandboxActual) * 100;
  const absPercentageError = Math.abs(percentageError);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner: Defense Protocol & Random Call Simulator */}
      <div className="p-5 md:p-6 rounded-2xl bg-[#0B2545]/90 border border-[#1B6CA8]/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
            <Shield className="w-4 h-4" />
            <span>10-MINUTE TECHNICAL DEFENSE DRILL · GROUP 7</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
            D10 Technical Defense & Random Member Caller
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Per the instructions, any member may be randomly called during the 10-minute technical defense with Engr. Baclayon. Rehearse defending dataset characteristics, the Feb 2023 anomaly, SMA/WMA formulas, 6 validation metrics, and Random Forest overfitting.
          </p>
        </div>

        <button
          onClick={handleRandomQuestion}
          className="px-4 py-2.5 rounded-xl bg-[#1B6CA8] hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 whitespace-nowrap transition-all"
        >
          <Shuffle className="w-4 h-4" />
          <span>Call Random Group 7 Member</span>
        </button>
      </div>

      {/* Randomly Called Member Banner */}
      {calledMember && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F2A541] text-slate-950 flex items-center justify-center font-black text-sm">
              {calledMember.initials}
            </div>
            <div>
              <div className="text-xs font-semibold text-[#F2A541] uppercase tracking-wider">
                Randomly Selected Defender:
              </div>
              <div className="text-base font-bold text-white">
                {calledMember.name} <span className="text-xs font-normal text-slate-300">({calledMember.role})</span>
              </div>
            </div>
          </div>
          <div className="text-right text-xs text-slate-300 hidden sm:block">
            <span>Core Focus: {calledMember.topic}</span>
          </div>
        </div>
      )}

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[#1B6CA8] text-white font-bold shadow-sm'
                : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Two Column Layout: Questions List + Active Flashcard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Question Directory */}
        <div className="lg:col-span-5 flex flex-col gap-2.5 max-h-[620px] overflow-y-auto pr-1">
          {filteredQuestions.map((q) => {
            const isSelected = activeQuestion.id === q.id;
            return (
              <div
                key={q.id}
                onClick={() => {
                  setActiveQuestion(q);
                  setIsAnswerRevealed(true);
                }}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#1B6CA8]/20 border-sky-400 text-white shadow-md'
                    : 'bg-[#0B2545]/60 border-slate-800 text-slate-300 hover:bg-[#0B2545] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                    isSelected ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {q.category}
                  </span>
                  <span className="text-slate-400 text-[10px]">{q.targetedConcept}</span>
                </div>
                <h4 className="text-xs font-semibold leading-snug">
                  {q.question}
                </h4>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Question & Defense Script */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-[#0B2545]/90 border border-[#1B6CA8]/50 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
            {/* Question Header */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-mono text-sky-400 uppercase tracking-wider">{activeQuestion.category}</span>
                <span className="text-slate-400">{activeQuestion.rubricCriterion}</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white leading-snug">
                "{activeQuestion.question}"
              </h3>
            </div>

            {/* Core Bullet Points */}
            <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/80 space-y-2">
              <div className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                Key Industrial Engineering Talking Points:
              </div>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {activeQuestion.shortBulletSummary.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reveal Script Toggle */}
            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-slate-400 font-semibold">
                Word-for-Word Technical Defense Response:
              </div>
              <button
                onClick={() => setIsAnswerRevealed(!isAnswerRevealed)}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                <span>{isAnswerRevealed ? 'Hide Response' : 'Reveal Response'}</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isAnswerRevealed ? 'rotate-90' : ''}`} />
              </button>
            </div>

            {isAnswerRevealed && (
              <div className="p-4 rounded-xl bg-[#07192F] border border-[#1B6CA8]/40 text-xs text-slate-200 leading-relaxed font-sans animate-fadeIn space-y-3">
                <p className="italic text-sky-100">
                  "{activeQuestion.detailedDefenseScript}"
                </p>

                {activeQuestion.keyFormulas && activeQuestion.keyFormulas.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      Underlying Formulas & Bounds:
                    </span>
                    {activeQuestion.keyFormulas.map((formula, fIdx) => (
                      <div key={fIdx} className="font-mono text-xs text-amber-300 bg-slate-950/60 p-2 rounded border border-slate-800">
                        {formula}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactive Metric Sandbox for Port TEUs */}
          <div className="bg-[#0B2545]/80 border border-[#1B6CA8]/40 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-sky-400" />
                <h4 className="text-sm font-bold text-white">
                  Port TEU Error Metric Calculator & Bias Sandbox
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">Live Formula Validation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Actual TEU Export (A_t):
                </label>
                <input
                  type="number"
                  value={sandboxActual}
                  onChange={(e) => setSandboxActual(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Model Forecast TEU (F_t):
                </label>
                <input
                  type="number"
                  value={sandboxForecast}
                  onChange={(e) => setSandboxForecast(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Computed Metric Outputs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Absolute Error (|e_t|)</div>
                <div className="font-bold text-sky-300 mt-0.5">{absError.toLocaleString()} TEUs</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Percentage Error (PE)</div>
                <div className="font-bold text-white mt-0.5">{percentageError.toFixed(2)}%</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Abs % Error (|PE|)</div>
                <div className="font-bold text-[#F2A541] mt-0.5">{absPercentageError.toFixed(2)}%</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Directional Bias (MPE)</div>
                <div className={`font-bold mt-0.5 ${percentageError >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {percentageError >= 0 ? 'Under-forecast (Safe)' : 'Over-forecast (Idle Labor)'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
