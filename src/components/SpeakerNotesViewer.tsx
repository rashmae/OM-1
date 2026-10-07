import React, { useState, useEffect } from 'react';
import { 
  FileText, Users, Clock, Play, Pause, RotateCcw, 
  CheckCircle2, Volume2, ArrowRight, Printer, Copy, Check, Ship, Mic
} from 'lucide-react';
import { TEAM_MEMBERS, TeamMember, BaselineModelChoice } from '../data/forecastingData';
import { getPresentationBeats, SlideBeat, TOTAL_PRESENTATION_SECONDS } from '../data/presentationSlides';
import { exportPrintableDeck, downloadOfficialPPTX } from '../utils/exportPresentation';

// Authoritative mascot image assets for Group 7
const MASCOT_BLUE = '/src/assets/images/mascot_blue_analyst_1791196865420.jpg';
const MASCOT_ORANGE = '/src/assets/images/mascot_orange_planner_1791196885029.jpg';
const MASCOT_GREEN = '/src/assets/images/mascot_green_validator_1791196903349.jpg';

const MASCOT_MAP: Record<string, string> = {
  "Aligato, Elaiza Jane": MASCOT_BLUE,
  "Ansay, Rash Mae Crystelle C.": MASCOT_ORANGE,
  "Villagracia, Mylene Joy": MASCOT_GREEN,
};

interface SpeakerNotesViewerProps {
  selectedBaseline?: BaselineModelChoice;
}

export const SpeakerNotesViewer: React.FC<SpeakerNotesViewerProps> = ({
  selectedBaseline = 'es05'
}) => {
  const [selectedMemberName, setSelectedMemberName] = useState<string>(TEAM_MEMBERS[0].name);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const presentationBeats = getPresentationBeats(selectedBaseline);

  const activeMember = TEAM_MEMBERS.find(m => m.name === selectedMemberName) || TEAM_MEMBERS[0];
  const memberBeats = presentationBeats.filter(b => b.speaker === activeMember.name);
  const memberTotalDuration = memberBeats.reduce((sum, b) => sum + b.durationSeconds, 0);

  // Rehearsal stopwatch
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const handleCopyScript = () => {
    const fullText = memberBeats.map(b => `[${b.beatTitle} - ${b.durationSeconds}s]\n${b.liveSpeakerPrompt}`).join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#0B2545]/90 border border-[#1B6CA8]/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
            <Users className="w-4 h-4" />
            <span>INDIVIDUAL SPEAKING TIME AUDIT & REHEARSAL SUITE · GROUP 7</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
            Equal Group 7 Speech Allocation (~70–100 Seconds Each · 4:30 Total)
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Per Engr. Baclayon's rubric: <em>"Every member needs to speak for an equal amount of time during the 3–5 minute presentation."</em> Total presentation runtime is 270 seconds (4 minutes 30 seconds) across 7 keynote beats, precisely structured for the 3 specialists of Group 7.
          </p>
        </div>

        {/* Stopwatch & Speed Tracker */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Rehearsal Stopwatch</div>
              <div className="text-2xl font-black font-mono text-sky-400">
                {formatTimer(timerSeconds)}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`p-2 rounded-xl text-xs font-bold transition-all ${
                  isTimerRunning 
                    ? 'bg-amber-500 text-slate-950' 
                    : 'bg-[#1B6CA8] hover:bg-sky-500 text-white'
                }`}
              >
                {isTimerRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(0);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Member Selector Bar (3 Group 7 Members) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TEAM_MEMBERS.map((member) => {
          const isSelected = selectedMemberName === member.name;
          return (
            <div
              key={member.name}
              onClick={() => {
                setSelectedMemberName(member.name);
                setTimerSeconds(0);
                setIsTimerRunning(false);
              }}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#1B6CA8]/25 border-sky-400 text-white shadow-lg ring-1 ring-sky-400/50'
                  : 'bg-[#0B2545]/60 border-slate-800 text-slate-300 hover:bg-[#0B2545] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border-2 ${
                  isSelected ? 'border-sky-400 shadow-md ring-2 ring-sky-400/40' : 'border-slate-700 bg-slate-900'
                }`}>
                  <img 
                    src={MASCOT_MAP[member.name] || MASCOT_BLUE} 
                    alt={member.name} 
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>
                <div className="overflow-hidden">
                  <div className="text-sm font-bold text-white truncate">{member.name}</div>
                  <div className="text-xs text-sky-300 truncate">{member.role}</div>
                  <div className="text-[11px] text-amber-300 font-mono mt-0.5">{member.timeAllotment}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Speaker Deep Dive Panel */}
      <div className="bg-[#0B2545]/90 border border-[#1B6CA8]/50 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-sky-400 shadow-lg bg-slate-900 p-1 flex-shrink-0">
              <img 
                src={MASCOT_MAP[activeMember.name] || MASCOT_BLUE} 
                alt={activeMember.name} 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-sky-400 font-bold">{activeMember.role}</span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-300 font-mono">{activeMember.timeAllotment} ({memberTotalDuration}s total)</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-0.5">
                {activeMember.name}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Topic Focus: <span className="text-sky-300 font-medium">{activeMember.topic}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadOfficialPPTX}
              className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
              title="Download Genuine PowerPoint Presentation (.pptx)"
            >
              <span className="font-mono text-[9px] font-black bg-orange-950/60 px-1 py-0.5 rounded text-orange-200">PPTX</span>
              <span>Download Slides</span>
            </button>
            <button
              onClick={exportPrintableDeck}
              className="px-3.5 py-1.5 rounded-xl bg-[#1B6CA8] hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF Deck</span>
            </button>
            <button
              onClick={handleCopyScript}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-2 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Script'}</span>
            </button>
          </div>
        </div>

        {/* Assigned Beats List */}
        <div className="space-y-4">
          {/* Team Introduction Prompt (Beat 0) */}
          {presentationBeats[0] && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-amber-300">
                <span className="font-bold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#F2A541]" />
                  <span>PROLOGUE: ALL-TEAM INTRODUCTION (Slide 1 · 25s)</span>
                </span>
                <span className="text-slate-400">Team Opening Script</span>
              </div>
              <p className="text-xs md:text-sm text-slate-200 italic font-sans leading-relaxed">
                "{presentationBeats[0].liveSpeakerPrompt}"
              </p>
            </div>
          )}

          <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Assigned Slide Beats ({memberBeats.length} beats):
          </div>

          {memberBeats.map((beat) => (
            <div 
              key={beat.id}
              className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
                    Slide {beat.slideNumber}
                  </span>
                  <span className="text-sm font-bold text-white">
                    {beat.beatTitle}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ({beat.actTitle})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Target: {beat.durationSeconds}s</span>
                </div>
              </div>

              {/* On-screen bullet points */}
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">On-Screen Captions:</span>
                {beat.onScreenStoryCaptions.map((cap, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    {cap}
                  </span>
                ))}
              </div>

              {/* Spoken cue */}
              <div className="p-3.5 rounded-lg bg-[#0B2545]/60 border border-[#1B6CA8]/30 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold flex items-center gap-1.5">
                  <Mic className="w-3 h-3 text-sky-400" />
                  <span>Spoken Cue (Say This Over Slide):</span>
                </div>
                <p className="text-sm text-slate-100 leading-relaxed font-sans font-medium italic">
                  "{beat.liveSpeakerPrompt}"
                </p>
              </div>

              {beat.dataHighlight && (
                <div className="text-xs text-amber-300 font-mono flex items-center gap-1.5">
                  <span className="text-slate-400">Key Metric Highlight:</span>
                  <span className="font-bold">{beat.dataHighlight}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
