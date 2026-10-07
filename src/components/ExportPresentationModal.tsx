import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  X, Download, FileText, Printer, Check, 
  Layers, Video, Play, FileCheck, CheckCircle2, MonitorPlay
} from 'lucide-react';
import { KEYNOTE_BEATS, TOTAL_KEYNOTE_SECONDS } from '../data/presentationSlides';
import { GROUP_INFO } from '../data/forecastingData';
import { generateNativePPTX } from '../utils/pptxExport';
import { 
  exportPrintableDeck, 
  downloadOfficialPPTX,
  downloadOfficialVideoMP4,
  downloadSpeakerScriptMarkdown, 
  downloadPresentationJSON, 
  copySpokenScriptToClipboard,
  formatTime 
} from '../utils/exportPresentation';

interface ExportPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'all' | 'slides' | 'video';
}

export const ExportPresentationModal: React.FC<ExportPresentationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activePreviewSlide, setActivePreviewSlide] = useState<number>(1);
  const [isGeneratingPPTX, setIsGeneratingPPTX] = useState<boolean>(false);
  const [pptxDone, setPptxDone] = useState<boolean>(false);
  const [videoDone, setVideoDone] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'video' | 'pptx' | 'pdf'>('video');

  const videoRef = useRef<HTMLVideoElement | null>(null);

  if (!isOpen) return null;

  // 1. Direct Instant Download of the real MP4 Video
  const handleDownloadMP4 = () => {
    downloadOfficialVideoMP4();
    setVideoDone(true);
    setTimeout(() => setVideoDone(false), 3500);
  };

  // 2. Direct Instant Download of the real PPTX Presentation
  const handleDownloadPPTX = async () => {
    setIsGeneratingPPTX(true);
    try {
      // First try generating fresh with pptxgenjs, fallback to verified pre-compiled file
      try {
        await generateNativePPTX();
      } catch {
        downloadOfficialPPTX();
      }
      setPptxDone(true);
      setTimeout(() => setPptxDone(false), 3500);
    } catch (err) {
      console.error('PPTX error:', err);
      downloadOfficialPPTX();
      setPptxDone(true);
      setTimeout(() => setPptxDone(false), 3500);
    } finally {
      setIsGeneratingPPTX(false);
    }
  };

  const handleCopyScript = async () => {
    const success = await copySpokenScriptToClipboard();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const previewBeat = KEYNOTE_BEATS.find(b => b.slideNumber === activePreviewSlide) || KEYNOTE_BEATS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-4xl bg-[#060B14] border border-[#1B6CA8]/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0B2545]/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B6CA8] to-sky-500 flex items-center justify-center text-white shadow-md">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Export Presentation: Real MP4 Video &amp; Real PPTX</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Verified Files
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                {GROUP_INFO.topicTitle} · {GROUP_INFO.groupName} ({GROUP_INFO.section})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto">
          {/* Left Column: Real File Download Actions */}
          <div className="md:col-span-6 flex flex-col gap-4">
            
            {/* ACTION 1: REAL MP4 VIDEO FILE */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/15 via-[#0B2545]/70 to-[#060B14] border-2 border-[#F2A541] shadow-xl">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-lg bg-[#F2A541] text-slate-950 font-black text-xs flex items-center gap-1 shadow-md">
                    <Video className="w-4 h-4" />
                    <span>MP4</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>Download Video (.mp4)</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">1080p HD</span>
                    </h3>
                    <span className="text-[11px] font-mono text-amber-300">Genuine Video File with Ambient Audio</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
                  Playable Video
                </span>
              </div>

              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                Authentic <strong>.mp4</strong> video (H.264 / AAC, 1920×1080, 4.9 MB). Plays natively in <strong>Windows Media Player, QuickTime, VLC, Chrome, iOS &amp; Android</strong> with the ambient drone soundtrack.
              </p>

              {/* Embedded Video Preview Player */}
              <div className="mb-3 rounded-lg overflow-hidden border border-slate-700 bg-black aspect-video relative group">
                <video
                  ref={videoRef}
                  src="/OM1_Group7_Keynote_Video.mp4"
                  controls
                  preload="metadata"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleDownloadMP4}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#F2A541] hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99]"
                >
                  {videoDone ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>OM1_Group7_Keynote_Video.mp4 Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-slate-950" />
                      <span>Download Keynote Video (.mp4 · 4.9 MB)</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
                  <span>File: OM1_Group7_Keynote_Video.mp4</span>
                  <a 
                    href="/OM1_Group7_Keynote_Video.mp4" 
                    download="OM1_Group7_Keynote_Video.mp4" 
                    className="text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Direct link</span>
                  </a>
                </div>
              </div>
            </div>

            {/* ACTION 2: REAL MICROSOFT POWERPOINT (.PPTX) */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/15 via-[#0B2545]/70 to-[#060B14] border-2 border-orange-500 shadow-xl">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-lg bg-orange-600 text-white font-black text-xs shadow-md">
                    PPTX
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>Download PowerPoint (.pptx)</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-200 font-mono">16:9 Deck</span>
                    </h3>
                    <span className="text-[11px] font-mono text-orange-300">Authentic Office OpenXML Slide Deck</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold uppercase">
                  PowerPoint
                </span>
              </div>

              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                Genuine <strong>.pptx</strong> file with 7 widescreen dark slides, formatted metric boxes, validation comparison tables, and <strong>slide speaker notes</strong> embedded for Presenter View.
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleDownloadPPTX}
                  disabled={isGeneratingPPTX}
                  className="w-full py-2.5 px-4 rounded-lg bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 active:scale-[0.99]"
                >
                  {isGeneratingPPTX ? (
                    <>
                      <Check className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Packaging PowerPoint (.pptx)...</span>
                    </>
                  ) : pptxDone ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>OM1_Group7_Forecasting_Presentation.pptx Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-slate-950" />
                      <span>Download PowerPoint (.pptx · 248 KB)</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
                  <span>File: OM1_Group7_Forecasting_Presentation.pptx</span>
                  <a 
                    href="/OM1_Group7_Forecasting_Presentation.pptx" 
                    download="OM1_Group7_Forecasting_Presentation.pptx" 
                    className="text-orange-400 hover:underline flex items-center gap-1"
                  >
                    <span>Direct link</span>
                  </a>
                </div>
              </div>
            </div>

            {/* ACTION 3: ADDITIONAL DOCUMENTATION EXPORTS */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={exportPrintableDeck}
                className="py-2.5 px-3 rounded-lg bg-[#1B6CA8] hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                title="Print or Save as Landscape PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Save PDF Deck</span>
              </button>

              <button
                onClick={downloadSpeakerScriptMarkdown}
                className="py-2.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                title="Download Spoken Script as Markdown"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Speaker Script (.md)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Slide Preview & Inspector */}
          <div className="md:col-span-6 flex flex-col gap-3 bg-slate-950/90 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>Slide {activePreviewSlide} of {KEYNOTE_BEATS.length}</span>
              </span>

              {/* Slide Selector Buttons */}
              <div className="flex items-center gap-1">
                {KEYNOTE_BEATS.map(b => (
                  <button
                    key={b.slideNumber}
                    onClick={() => setActivePreviewSlide(b.slideNumber)}
                    className={`w-6 h-6 rounded text-xs font-mono font-bold transition-all ${
                      activePreviewSlide === b.slideNumber
                        ? 'bg-[#F2A541] text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {b.slideNumber}
                  </button>
                ))}
              </div>
            </div>

            {/* Slide Preview Card */}
            <div className="p-4 rounded-xl bg-[#060B14] border border-slate-800 flex-1 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
                  <span className="text-sky-400 font-semibold">{previewBeat.actTitle}</span>
                  <span>{formatTime(previewBeat.cumulativeStartSeconds)} · {previewBeat.durationSeconds}s</span>
                </div>
                <h4 className="text-lg font-light text-white tracking-wide">
                  {previewBeat.title}
                </h4>

                {/* Key Metric Highlight */}
                {previewBeat.keyMetric && (
                  <div className="my-3 p-3 rounded-lg bg-[#0B2545]/60 border border-[#1B6CA8]/40 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-slate-400">{previewBeat.keyMetric.label}</div>
                      <div className="text-xl font-bold font-mono text-[#F2A541]">{previewBeat.keyMetric.value}</div>
                    </div>
                    {previewBeat.keyMetric.sublabel && (
                      <div className="text-xs text-slate-300 text-right max-w-[180px]">
                        {previewBeat.keyMetric.sublabel}
                      </div>
                    )}
                  </div>
                )}

                {/* On-screen visual elements */}
                <div className="space-y-1 my-2">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Slide Visuals:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {previewBeat.onScreenStoryCaptions.map((cap, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Speaker & Spoken Script */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] text-[#F2A541] font-mono mb-1">
                  <span>Speaker: {previewBeat.speaker} ({previewBeat.speakerRole})</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic line-clamp-3">
                  "{previewBeat.livePresenterPrompt}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
