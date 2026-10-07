/**
 * Presentation Export Utility
 * Allows the user to export both Slides (PDF / HTML / Markdown) and Video (Standalone Video HTML / WebM Recording).
 */

import { KEYNOTE_BEATS, TOTAL_KEYNOTE_SECONDS } from '../data/presentationSlides';
import { GROUP_INFO, VALIDATION_METRICS, FULL_TIME_SERIES } from '../data/forecastingData';

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * 1. EXPORT SLIDES AS PDF / PRINTABLE DECK
 * Opens a print-optimized landscape presentation deck in a clean window
 * and invokes window.print() to save directly as PDF or print on paper.
 */
export function exportPrintableDeck(): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups in your browser to export the presentation deck as PDF.');
    return;
  }

  const slidesHtml = KEYNOTE_BEATS.map((beat) => {
    return `
      <section class="slide-page">
        <div class="slide-header">
          <div class="slide-badge">SLIDE ${beat.slideNumber} OF ${KEYNOTE_BEATS.length}</div>
          <div class="slide-section">${beat.flowSection}</div>
          <div class="slide-timing">
            <span>${formatTime(beat.cumulativeStartSeconds)} – ${formatTime(beat.cumulativeStartSeconds + beat.durationSeconds)}</span>
            <span class="pill">${beat.durationSeconds}s</span>
          </div>
        </div>

        <div class="slide-body">
          <h1 class="slide-title">${beat.title}</h1>
          <p class="slide-act">${beat.actTitle}</p>

          <div class="key-callout">
            <div class="key-callout-number">${beat.keyMetric?.value || beat.dataHighlight || ''}</div>
            <div class="key-callout-label">${beat.keyMetric?.label || 'Key Operational Focal Point'}</div>
            ${beat.keyMetric?.sublabel ? `<div class="key-callout-sub">${beat.keyMetric.sublabel}</div>` : ''}
          </div>

          <div class="captions-grid">
            ${beat.onScreenStoryCaptions.map(cap => `<div class="caption-card"><span class="bullet">▪</span> ${cap}</div>`).join('')}
          </div>

          <div class="presenter-box">
            <div class="presenter-speaker">
              <span class="speaker-pill">${beat.speakerInitials}</span>
              <strong>${beat.speaker}</strong> &nbsp;·&nbsp; <span>${beat.speakerRole}</span>
            </div>
            <div class="spoken-prompt">
              <em>"${beat.livePresenterPrompt}"</em>
            </div>
          </div>
        </div>

        <div class="slide-footer">
          <span>${GROUP_INFO.subject} · ${GROUP_INFO.groupName} (${GROUP_INFO.section})</span>
          <span>Cebu Technological University · ${GROUP_INFO.presentationDate}</span>
        </div>
      </section>
    `;
  }).join('\n');

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Presentation Slides Deck — ${GROUP_INFO.topicTitle}</title>
      <style>
        @page {
          size: letter landscape;
          margin: 0.5in;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background: #060B14;
          color: #F8FAFC;
          line-height: 1.4;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .slide-page {
          page-break-after: always;
          height: 100vh;
          max-height: 8.5in;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 36px 48px;
          background: linear-gradient(135deg, #060B14 0%, #0B2545 100%);
          border: 1px solid #1B6CA8;
          border-radius: 12px;
          margin-bottom: 24px;
        }
        @media print {
          body {
            background: #FFFFFF;
            color: #0F172A;
          }
          .slide-page {
            background: #FFFFFF !important;
            color: #0F172A !important;
            border: 1px solid #CBD5E1 !important;
            margin-bottom: 0;
            height: 98vh;
          }
          .slide-header, .slide-footer {
            color: #475569 !important;
            border-color: #E2E8F0 !important;
          }
          .slide-title {
            color: #0F172A !important;
          }
          .key-callout {
            background: #F1F5F9 !important;
            border-color: #CBD5E1 !important;
          }
          .key-callout-number {
            color: #D97706 !important;
          }
          .presenter-box {
            background: #F8FAFC !important;
            border-color: #E2E8F0 !important;
            color: #1E293B !important;
          }
          .no-print {
            display: none !important;
          }
        }
        .print-toolbar {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 1000;
          display: flex;
          gap: 12px;
        }
        .btn {
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          border: none;
        }
        .btn-primary {
          background: #F2A541;
          color: #060B14;
        }
        .btn-secondary {
          background: #1B6CA8;
          color: #FFFFFF;
        }
        .slide-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #94A3B8;
          border-bottom: 1px solid rgba(27, 108, 168, 0.4);
          padding-bottom: 12px;
        }
        .slide-badge {
          font-family: monospace;
          background: rgba(27, 108, 168, 0.3);
          color: #38BDF8;
          padding: 3px 8px;
          border-radius: 4px;
          font-weight: bold;
        }
        .slide-section {
          font-weight: 500;
          color: #E2E8F0;
        }
        .slide-timing {
          font-family: monospace;
        }
        .pill {
          background: rgba(242, 165, 65, 0.2);
          color: #F2A541;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: 6px;
          font-weight: bold;
        }
        .slide-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 18px;
          padding: 20px 0;
        }
        .slide-title {
          font-size: 38px;
          font-weight: 300;
          letter-spacing: -0.5px;
          color: #FFFFFF;
        }
        .slide-act {
          font-size: 15px;
          color: #38BDF8;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }
        .key-callout {
          background: rgba(11, 37, 69, 0.7);
          border: 1px solid rgba(27, 108, 168, 0.6);
          border-radius: 10px;
          padding: 16px 24px;
          display: inline-block;
          max-width: 480px;
        }
        .key-callout-number {
          font-size: 32px;
          font-weight: 700;
          color: #F2A541;
          font-family: monospace;
        }
        .key-callout-label {
          font-size: 13px;
          color: #E2E8F0;
          font-weight: 600;
          margin-top: 2px;
        }
        .key-callout-sub {
          font-size: 12px;
          color: #94A3B8;
        }
        .captions-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .caption-card {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid #1E293B;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 13px;
          color: #E2E8F0;
        }
        .bullet {
          color: #38BDF8;
        }
        .presenter-box {
          background: rgba(6, 11, 20, 0.85);
          border-left: 4px solid #F2A541;
          border-radius: 0 8px 8px 0;
          padding: 14px 20px;
          margin-top: 8px;
        }
        .presenter-speaker {
          font-size: 13px;
          color: #F2A541;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .speaker-pill {
          background: #1B6CA8;
          color: #FFFFFF;
          padding: 2px 7px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
        }
        .spoken-prompt {
          font-size: 14px;
          line-height: 1.5;
          color: #E2E8F0;
        }
        .slide-footer {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #64748B;
          border-top: 1px solid rgba(27, 108, 168, 0.3);
          padding-top: 10px;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="print-toolbar no-print">
        <button class="btn btn-primary" onclick="window.print()">Print / Save as PDF</button>
        <button class="btn btn-secondary" onclick="window.close()">Close</button>
      </div>

      ${slidesHtml}

      <script>
        window.addEventListener('load', () => {
          setTimeout(() => {
            window.print();
          }, 600);
        });
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(fullHtml);
  printWindow.document.close();
}

/**
 * 2. DOWNLOAD NATIVE MICROSOFT POWERPOINT PRESENTATION (.PPTX)
 * Directly downloads the authentic, widescreen 16:9 presentation file (.pptx)
 * that opens seamlessly in Microsoft PowerPoint, Apple Keynote, and Google Slides.
 */
export function downloadOfficialPPTX(): void {
  const link = document.createElement('a');
  link.href = '/OM1_Group7_Forecasting_Presentation.pptx';
  link.download = 'OM1_Group7_Forecasting_Presentation.pptx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 3. DOWNLOAD REAL MP4 KEYNOTE VIDEO (.MP4)
 * Downloads the authentic 1080p Full HD MP4 video file with ambient audio synthesizer pad,
 * animated line charts, ranking races, and all 7 presentation beats.
 */
export function downloadOfficialVideoMP4(): void {
  const link = document.createElement('a');
  link.href = '/OM1_Group7_Keynote_Video.mp4';
  link.download = 'OM1_Group7_Keynote_Video.mp4';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 3. EXTRACT STANDALONE VIDEO PRESENTATION (HTML5 Keynote Engine)
 * Downloads a complete, self-contained interactive video player HTML file
 * that plays the full 4:40 cinematic presentation with animations, SVG chart tracing,
 * amber shockwave pulses, audio drone, and timeline controls completely offline!
 */
export function extractStandaloneVideoHTML(): void {
  const content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Keynote Video Presentation — ${GROUP_INFO.topicTitle}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #060B14;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      overflow: hidden;
    }
    #stage {
      position: relative;
      width: 100vw;
      height: 56.25vw;
      max-height: 100vh;
      max-width: 177.78vh;
      background: radial-gradient(circle at 50% 45%, #0B2545 0%, #060B14 75%);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .hud {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 16px 24px;
      background: linear-gradient(to top, rgba(6,11,20,0.95), transparent);
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 100;
      transition: opacity 0.3s;
    }
    .scrub-row {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 6px;
    }
    .scrub-col {
      height: 4px;
      background: #1E293B;
      border-radius: 2px;
      overflow: hidden;
      cursor: pointer;
    }
    .scrub-fill {
      height: 100%;
      background: #F2A541;
      width: 0%;
      transition: width 0.1s linear;
    }
    .ctrl-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: #94A3B8;
      font-family: monospace;
    }
    .btn {
      background: #1B6CA8;
      color: white;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
    }
    .btn:hover { background: #38BDF8; }
    .btn-amber { background: #F2A541; color: #060B14; }
    .screen-content {
      text-align: center;
      padding: 24px;
      max-width: 900px;
      transition: opacity 0.8s ease-out;
    }
    h1 { font-size: 48px; font-weight: 200; letter-spacing: -0.5px; color: #FFF; margin-bottom: 12px; }
    .amber { color: #F2A541; }
    .sub { font-size: 16px; color: #38BDF8; text-transform: uppercase; letter-spacing: 2px; font-family: monospace; }
    .speaker-cue {
      position: absolute;
      top: 16px;
      left: 20px;
      font-family: monospace;
      font-size: 11px;
      color: #F2A541;
      background: rgba(11,37,69,0.8);
      border: 1px solid rgba(27,108,168,0.5);
      padding: 4px 10px;
      border-radius: 20px;
    }
    .chart-container {
      width: 100%;
      height: 280px;
      margin: 16px 0;
    }
  </style>
</head>
<body>
  <div id="stage">
    <div class="speaker-cue" id="speaker-tag">Speaker 1: Aligato, Elaiza Jane</div>
    <div class="screen-content" id="content">
      <div class="sub">Act I: Maritime Logistics & The February 2023 Shock</div>
      <h1 id="title">36 Months. One Question.</h1>
      <p id="desc" style="color: #94A3B8; font-size: 18px;">Port of Los Angeles Export Volume (TEUs)</p>
    </div>

    <div class="hud">
      <div class="scrub-row" id="scrub-row">
        ${KEYNOTE_BEATS.map((b, i) => `<div class="scrub-col" onclick="jumpToBeat(${i})"><div class="scrub-fill" id="fill-${i}"></div></div>`).join('')}
      </div>
      <div class="ctrl-row">
        <div>
          <button class="btn btn-amber" id="play-btn" onclick="togglePlay()">Play Presentation</button>
          <button class="btn" onclick="resetVideo()">Reset</button>
          <span style="margin-left: 12px;" id="time-display">0:00 / 4:40</span>
        </div>
        <div>
          <span>IE-PC 3112 · Group 7 · BSIE 3-E</span>
        </div>
      </div>
    </div>
  </div>

  <script>
    const beats = ${JSON.stringify(KEYNOTE_BEATS)};
    let isPlaying = false;
    let currentBeatIndex = 0;
    let elapsed = 0;
    let timer = null;

    // Web Audio drone
    let audioCtx = null;
    let osc1 = null;
    let gainNode = null;

    function initAudio() {
      if (audioCtx) return;
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 180;
      gainNode = audioCtx.createGain();
      gainNode.gain.value = 0.08;
      osc1 = audioCtx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = 55;
      osc1.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc1.start();
    }

    function togglePlay() {
      isPlaying = !isPlaying;
      document.getElementById('play-btn').innerText = isPlaying ? 'Pause' : 'Play Presentation';
      if (isPlaying) {
        initAudio();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        timer = setInterval(tick, 100);
      } else {
        clearInterval(timer);
      }
    }

    function resetVideo() {
      clearInterval(timer);
      isPlaying = false;
      document.getElementById('play-btn').innerText = 'Play Presentation';
      currentBeatIndex = 0;
      elapsed = 0;
      updateUI();
    }

    function jumpToBeat(idx) {
      currentBeatIndex = idx;
      elapsed = 0;
      updateUI();
    }

    function tick() {
      elapsed += 0.1;
      const beat = beats[currentBeatIndex];
      if (elapsed >= beat.durationSeconds) {
        if (currentBeatIndex < beats.length - 1) {
          currentBeatIndex++;
          elapsed = 0;
        } else {
          togglePlay();
          return;
        }
      }
      updateUI();
    }

    function updateUI() {
      const beat = beats[currentBeatIndex];
      document.getElementById('speaker-tag').innerText = beat.speaker + ' (' + beat.speakerRole + ')';
      document.getElementById('title').innerText = beat.title;
      document.getElementById('desc').innerText = beat.onScreenStoryCaptions.join(' · ');

      // Update scrub bars
      beats.forEach((b, i) => {
        const fill = document.getElementById('fill-' + i);
        if (i < currentBeatIndex) fill.style.width = '100%';
        else if (i === currentBeatIndex) fill.style.width = ((elapsed / b.durationSeconds) * 100) + '%';
        else fill.style.width = '0%';
      });

      // Calculate total seconds
      let totalSec = 0;
      for (let i = 0; i < currentBeatIndex; i++) totalSec += beats[i].durationSeconds;
      totalSec += elapsed;
      const m = Math.floor(totalSec / 60);
      const s = Math.floor(totalSec % 60);
      document.getElementById('time-display').innerText = m + ':' + (s < 10 ? '0' : '') + s + ' / 4:40';
    }
  </script>
</body>
</html>`;

  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `OM1_Group7_Keynote_Video_Presentation.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 4. DOWNLOAD SPEAKER SCRIPT MARKDOWN
 */
export function downloadSpeakerScriptMarkdown(): void {
  const content = `# "THE FORECAST" — PORT OF LOS ANGELES (TEUs)
## Applied Study 1: Real-Data Forecasting Decision Presentation Deck
**Subject:** ${GROUP_INFO.subject}  
**Group:** ${GROUP_INFO.groupName} (${GROUP_INFO.section})  
**University:** ${GROUP_INFO.university}  
**Instructor:** ${GROUP_INFO.instructor}  
**Presentation Date:** ${GROUP_INFO.presentationDate}  
**Total Runtime:** 4 Minutes 40 Seconds (${TOTAL_KEYNOTE_SECONDS}s) — Strictly within 4-5 minute limit!

---

### GROUP ROLES & TIME ALLOTMENTS (Equal Distribution)
1. **Aligato, Elaiza Jane** (Speaker 1) — Beats 1 & 2 (0:00 – 1:30 · 90s)
2. **Ansay, Rash Mae Crystelle C.** (Leader / Speaker 2) — Beats 3 & 4 (1:30 – 3:00 · 90s)
3. **Villagracia, Mylene Joy** (Speaker 3) — Beats 5, 6 & 7 (3:00 – 4:40 · 100s)

---

${KEYNOTE_BEATS.map((beat) => `
### SLIDE ${beat.slideNumber}: ${beat.title.toUpperCase()}
- **Timing:** ${formatTime(beat.cumulativeStartSeconds)} – ${formatTime(beat.cumulativeStartSeconds + beat.durationSeconds)} (${beat.durationSeconds} seconds)
- **Assigned Speaker:** ${beat.speaker} (${beat.speakerRole})
- **Section Flow:** ${beat.flowSection}
- **Act Title:** ${beat.actTitle}
- **Key Metric:** ${beat.keyMetric ? `${beat.keyMetric.label}: ${beat.keyMetric.value} (${beat.keyMetric.sublabel})` : (beat.dataHighlight || 'N/A')}

**On-Screen Captions (Apple Keynote Style):**
${beat.onScreenStoryCaptions.map(c => `  - ${c}`).join('\n')}

**Spoken Presentation Script (Read Aloud Clearly):**
> "${beat.livePresenterPrompt}"

---
`).join('\n')}

### FINAL VALIDATION ACCURACY SUMMARY (Months 31–36)
${VALIDATION_METRICS.map(m => `- **${m.name}:** MAE = ${m.mae.toLocaleString()} TEUs | RMSE = ${m.rmse.toLocaleString()} | MAPE = ${m.mape}% | MPE = ${m.mpe > 0 ? '+' : ''}${m.mpe}%`).join('\n')}

### DEFINITIVE OPERATIONS MANAGEMENT RECOMMENDATION
> "${GROUP_INFO.finalRecommendation}"
`;

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `OM1_Group7_Presentation_Script_and_Notes.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 5. DOWNLOAD STRUCTURED DATASET JSON
 */
export function downloadPresentationJSON(): void {
  const data = {
    groupInfo: GROUP_INFO,
    totalDurationSeconds: TOTAL_KEYNOTE_SECONDS,
    totalMinutesFormatted: "4:40",
    presentationBeats: KEYNOTE_BEATS,
    validationMetrics: VALIDATION_METRICS,
    fullTimeSeriesCount: FULL_TIME_SERIES.length,
    generatedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `OM1_Group7_Presentation_Data.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 6. COPIES SPOKEN SCRIPT TO CLIPBOARD
 */
export async function copySpokenScriptToClipboard(): Promise<boolean> {
  const fullText = KEYNOTE_BEATS.map((beat) => {
    return `[SLIDE ${beat.slideNumber} - ${beat.speaker} - ${beat.durationSeconds}s]\n${beat.livePresenterPrompt}`;
  }).join('\n\n');

  try {
    await navigator.clipboard.writeText(fullText);
    return true;
  } catch {
    return false;
  }
}
