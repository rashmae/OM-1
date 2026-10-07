/**
 * Video Rendering & Recording Engine
 * Renders the 7 Apple Keynote beats onto an HTML5 Canvas with ambient audio
 * and records it into an authentic .mp4 / .webm video file using MediaRecorder.
 */

import { KEYNOTE_BEATS, KeynoteBeat } from '../data/presentationSlides';
import { FULL_TIME_SERIES } from '../data/forecastingData';

export interface RenderProgress {
  beatIndex: number;
  totalBeats: number;
  percent: number;
  statusText: string;
  isComplete: boolean;
  videoUrl?: string;
  blob?: Blob;
  fileName?: string;
}

export class KeynoteVideoRecorder {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 1280;
  private height: number = 720;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isCancelled: boolean = false;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    const context = this.canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public cancel(): void {
    this.isCancelled = true;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
    }
  }

  /**
   * Records the presentation and returns the downloadable video blob and file name.
   * Can run in standard or fast-render mode.
   */
  public async recordPresentation(
    onProgress: (p: RenderProgress) => void,
    fps: number = 30,
    timeScale: number = 4.0 // 4x speed render so a 280s video renders in ~70s!
  ): Promise<{ blob: Blob; fileName: string; url: string }> {
    this.isCancelled = false;
    this.recordedChunks = [];

    // Setup Web Audio stream for the ambient pad drone
    let audioStreamTrack: MediaStreamTrack | null = null;
    let audioCtx: AudioContext | null = null;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
        const dest = audioCtx.createMediaStreamDestination();
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 180;

        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.12;

        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 55;
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(dest);
        osc.start();

        const tracks = dest.stream.getAudioTracks();
        if (tracks.length > 0) audioStreamTrack = tracks[0];
      }
    } catch {
      // Audio stream optional if browser restricts
    }

    // Capture canvas stream
    const canvasStream = this.canvas.captureStream(fps);
    const combinedStream = new MediaStream();
    canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
    if (audioStreamTrack) combinedStream.addTrack(audioStreamTrack);

    // Determine supported mime type (prefer video/mp4 on Safari/iOS, fallback to video/webm)
    let selectedMime = 'video/mp4';
    if (!MediaRecorder.isTypeSupported('video/mp4')) {
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        selectedMime = 'video/webm;codecs=vp9,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        selectedMime = 'video/webm;codecs=vp8,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        selectedMime = 'video/webm';
      } else {
        selectedMime = '';
      }
    }

    const fileExtension = selectedMime.includes('mp4') ? 'mp4' : 'webm';
    const outputFileName = `OM1_Group7_Keynote_Video.${fileExtension}`;

    return new Promise<{ blob: Blob; fileName: string; url: string }>((resolve, reject) => {
      try {
        const options: MediaRecorderOptions = selectedMime ? { mimeType: selectedMime } : {};
        this.mediaRecorder = new MediaRecorder(combinedStream, options);

        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            this.recordedChunks.push(e.data);
          }
        };

        this.mediaRecorder.onstop = () => {
          if (audioCtx) {
            try { audioCtx.close(); } catch { /* ignore */ }
          }
          const blob = new Blob(this.recordedChunks, { type: selectedMime || 'video/webm' });
          const url = URL.createObjectURL(blob);
          onProgress({
            beatIndex: KEYNOTE_BEATS.length,
            totalBeats: KEYNOTE_BEATS.length,
            percent: 100,
            statusText: 'Rendering Complete! Video Ready.',
            isComplete: true,
            videoUrl: url,
            blob,
            fileName: outputFileName
          });
          resolve({ blob, fileName: outputFileName, url });
        };

        this.mediaRecorder.start(200); // 200ms slice chunks

        // Run frame by frame rendering loop across all beats
        this.runRenderLoop(onProgress, fps, timeScale).catch((err) => {
          if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
          }
          reject(err);
        });

      } catch (err) {
        reject(err);
      }
    });
  }

  private async runRenderLoop(
    onProgress: (p: RenderProgress) => void,
    fps: number,
    timeScale: number
  ): Promise<void> {
    const totalBeats = KEYNOTE_BEATS.length;
    let totalElapsedFrames = 0;
    const totalNominalSeconds = KEYNOTE_BEATS.reduce((s, b) => s + b.durationSeconds, 0);
    const totalSimulatedSeconds = totalNominalSeconds / timeScale;
    const totalExpectedFrames = Math.floor(totalSimulatedSeconds * fps);

    for (let beatIdx = 0; beatIdx < totalBeats; beatIdx++) {
      if (this.isCancelled) break;
      const beat = KEYNOTE_BEATS[beatIdx];
      const beatDurationSim = beat.durationSeconds / timeScale;
      const beatFrames = Math.floor(beatDurationSim * fps);

      for (let frame = 0; frame < beatFrames; frame++) {
        if (this.isCancelled) break;
        const progressInBeat = frame / beatFrames;
        const currentBeatSec = progressInBeat * beat.durationSeconds;

        // Render this specific frame on the canvas
        this.drawKeynoteFrame(beatIdx, beat, currentBeatSec);

        totalElapsedFrames++;
        const percent = Math.min(99, Math.round((totalElapsedFrames / totalExpectedFrames) * 100));

        if (frame % Math.floor(fps / 2) === 0) {
          onProgress({
            beatIndex: beatIdx + 1,
            totalBeats,
            percent,
            statusText: `Rendering Slide ${beatIdx + 1} of ${totalBeats}: ${beat.title}...`,
            isComplete: false
          });
        }

        // Wait for next frame timing (controlled by requestAnimationFrame or small delay)
        await new Promise(r => setTimeout(r, 1000 / fps));
      }
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }

  /**
   * Draws a pristine Apple Keynote frame on canvas matching the 7 presentation beats.
   */
  private drawKeynoteFrame(beatIndex: number, beat: KeynoteBeat, elapsedSeconds: number): void {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. Clear & Background Gradient (#060B14 to #0B2545)
    ctx.fillStyle = '#060B14';
    ctx.fillRect(0, 0, w, h);

    const radGrad = ctx.createRadialGradient(w / 2, h * 0.45, 50, w / 2, h * 0.45, w * 0.65);
    radGrad.addColorStop(0, '#0B2545');
    radGrad.addColorStop(1, '#060B14');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, w, h);

    // Top Header Badge
    ctx.fillStyle = 'rgba(27, 108, 168, 0.4)';
    ctx.strokeStyle = '#1B6CA8';
    ctx.lineWidth = 1;
    this.roundRect(ctx, 40, 30, 240, 28, 6, true, true);

    ctx.fillStyle = '#F2A541';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText(`${beat.speakerInitials} · ${beat.speaker}`, 50, 48);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Slide ${beatIndex + 1} of ${KEYNOTE_BEATS.length} · ${beat.flowSection}`, w - 40, 48);
    ctx.textAlign = 'left';

    // =======================================================================
    // SLIDE SPECIFIC MOTION GRAPHICS
    // =======================================================================
    if (beatIndex === 0) {
      // SLIDE 1: Anomaly & Line chart
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText('ACT I: MARITIME TRADE & THE FEBRUARY 2023 SHOCK', 60, 110);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '300 42px system-ui, sans-serif';
      ctx.fillText('36 Months. One Question.', 60, 160);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillText('Port of Los Angeles Export Volume (TEUs) · Jan 2022 to Dec 2024', 60, 190);

      // Draw SVG-style chart on canvas
      this.drawTimeChart(ctx, 60, 220, w - 120, 360, elapsedSeconds);

      // r = -0.39 callout box
      ctx.fillStyle = '#0B2545';
      ctx.strokeStyle = '#1B6CA8';
      this.roundRect(ctx, w - 280, 100, 220, 80, 8, true, true);

      ctx.fillStyle = '#F2A541';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('r = −0.39', w - 260, 140);
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillText('Down Slope −2,216 TEUs/mo', w - 260, 165);

    } else if (beatIndex === 1) {
      // SLIDE 2: Four Conventional Approaches
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText('ACT I: CONVENTIONAL FORECASTING RESULTS', 60, 110);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '300 38px system-ui, sans-serif';
      ctx.fillText('Four Conventional Contenders', 60, 160);

      const cards = [
        { name: '3-Period SMA', mae: '33,428', mape: '9.71%', tag: 'Simple Baseline', isWin: false },
        { name: '3-Period WMA', mae: '32,142', mape: '9.31%', tag: '0.50/0.30/0.20 Weights', isWin: false },
        { name: 'Exp. Smoothing', mae: '30,596', mape: '8.80%', tag: 'Alpha = 0.50 ★ Lowest Dev MAE', isWin: true },
        { name: 'Trend Projection', mae: '35,201', mape: '10.12%', tag: 'Ruled Out (r = −0.39)', isWin: false }
      ];

      cards.forEach((c, i) => {
        const cx = 60 + i * 290;
        ctx.fillStyle = '#0B2545';
        ctx.strokeStyle = c.isWin ? '#F2A541' : '#1B6CA8';
        ctx.lineWidth = c.isWin ? 2 : 1;
        this.roundRect(ctx, cx, 210, 265, 380, 12, true, true);

        ctx.fillStyle = c.isWin ? '#F2A541' : '#38BDF8';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillText(c.tag, cx + 20, 245);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.fillText(c.name, cx + 20, 280);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '12px system-ui, sans-serif';
        ctx.fillText('Development MAE:', cx + 20, 330);

        ctx.fillStyle = c.isWin ? '#F2A541' : '#FFFFFF';
        ctx.font = 'bold 32px monospace';
        ctx.fillText(c.mae, cx + 20, 370);

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '13px monospace';
        ctx.fillText(`MAPE: ${c.mape}`, cx + 20, 410);
      });

    } else if (beatIndex === 2) {
      // SLIDE 3: The Call (ETS α=0.50 Locked)
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText('ACT II: CONVENTIONAL OM BASELINE SELECTION', 60, 120);

      ctx.fillStyle = '#F2A541';
      ctx.font = '300 48px system-ui, sans-serif';
      ctx.fillText('We chose Exponential Smoothing, alpha 0.50.', 60, 190);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '16px system-ui, sans-serif';
      ctx.fillText('Officially Locked Baseline Before Receiving Holdout Validation Data', 60, 230);

      // 3 Feature Cards
      const feats = [
        { label: 'Lowest Development MAE', val: '30,596 TEUs', sub: 'Won across all conventional candidates' },
        { label: 'Optimal Noise Dampening', val: 'α = 0.50', sub: 'Absorbs shocks without bullwhip oscillations' },
        { label: 'Trend Elimination', val: 'r = −0.39', sub: 'Discarded straight line as operational hazard' }
      ];

      feats.forEach((f, i) => {
        const fx = 60 + i * 390;
        ctx.fillStyle = '#0B2545';
        ctx.strokeStyle = '#1B6CA8';
        ctx.lineWidth = 1;
        this.roundRect(ctx, fx, 280, 360, 240, 12, true, true);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '12px uppercase monospace';
        ctx.fillText(f.label, fx + 24, 320);

        ctx.fillStyle = '#F2A541';
        ctx.font = 'bold 30px monospace';
        ctx.fillText(f.val, fx + 24, 365);

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '14px system-ui, sans-serif';
        ctx.fillText(f.sub, fx + 24, 420);
      });

    } else if (beatIndex === 3) {
      // SLIDE 4: Algorithmic Challengers
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText('ACT II: STATISTICAL & MACHINE LEARNING RESULTS', 60, 110);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '300 38px system-ui, sans-serif';
      ctx.fillText('The Algorithmic Challengers', 60, 160);

      const algos = [
        { name: 'ARIMA (1,1,0)', desc: 'Order (1,1,0) won with AIC: 701.43 among 6 orders. 1st differencing + 1 AR lag.', stat: 'AIC: 701.43 ★', win: true },
        { name: 'Lagged Linear Reg.', desc: 'Uses 3 prior months as autoregressive predictors in rolling window.', stat: '3 Lagged Inputs', win: false },
        { name: 'Random Forest', desc: '100 decision trees, max depth 3, random_state=42 rolling predictor.', stat: '100 Trees', win: false }
      ];

      algos.forEach((a, i) => {
        const ax = 60 + i * 390;
        ctx.fillStyle = '#0B2545';
        ctx.strokeStyle = a.win ? '#F2A541' : '#1B6CA8';
        ctx.lineWidth = a.win ? 2 : 1;
        this.roundRect(ctx, ax, 210, 360, 380, 12, true, true);

        ctx.fillStyle = a.win ? '#F2A541' : '#38BDF8';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(a.stat, ax + 24, 250);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px system-ui, sans-serif';
        ctx.fillText(a.name, ax + 24, 295);

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '14px system-ui, sans-serif';
        ctx.fillText(a.desc, ax + 24, 340);
      });

    } else if (beatIndex === 4) {
      // SLIDE 5: Validation Reveal
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText('ACT III: THE 6-METRIC EVIDENCE REVEAL', 60, 100);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '300 34px system-ui, sans-serif';
      ctx.fillText('Validation Ranking (Shortest Error Wins)', 60, 145);

      const models = [
        { rank: 1, name: 'ARIMA (1,1,0) ★', mae: 20919, mape: '4.71%', win: true },
        { rank: 2, name: 'ETS α = 0.80', mae: 22952, mape: '5.17%', win: false },
        { rank: 3, name: 'ETS α = 0.50 (Selected)', mae: 27725, mape: '6.22%', win: false },
        { rank: 4, name: '3-Period WMA', mae: 28473, mape: '6.41%', win: false },
        { rank: 5, name: '3-Period SMA', mae: 31927, mape: '7.19%', win: false },
        { rank: 6, name: 'Random Forest', mae: 37138, mape: '8.31%', win: false },
        { rank: 7, name: 'Lagged Linear Reg.', mae: 37990, mape: '8.48%', win: false },
        { rank: 8, name: 'Trend Projection', mae: 52142, mape: '11.66%', win: false }
      ];

      models.forEach((m, idx) => {
        const my = 190 + idx * 48;
        const barW = (m.mae / 52142) * 580;

        ctx.fillStyle = m.win ? '#F2A541' : '#CBD5E1';
        ctx.font = m.win ? 'bold 14px system-ui, sans-serif' : '13px system-ui, sans-serif';
        ctx.fillText(`#${m.rank} ${m.name}`, 60, my + 16);

        // Track bar
        ctx.fillStyle = '#0F172A';
        this.roundRect(ctx, 320, my, 580, 24, 4, true, false);

        // Filled error bar
        ctx.fillStyle = m.win ? '#F2A541' : '#1B6CA8';
        this.roundRect(ctx, 320, my, barW, 24, 4, true, false);

        ctx.fillStyle = m.win ? '#F2A541' : '#FFFFFF';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`MAE: ${m.mae.toLocaleString()} · ${m.mape}`, 920, my + 16);
      });

    } else if (beatIndex === 5) {
      // SLIDE 6: Operations Action & Oversight
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText('ACT III: OPERATIONAL DECISIONS & INDUSTRY 5.0', 60, 110);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '300 38px system-ui, sans-serif';
      ctx.fillText('Capacity Floor & Human-in-the-Loop', 60, 160);

      const ops = [
        { num: '01', title: 'Treat ARIMA as Floor', desc: 'Under-forecasting costs >$50,000/day in vessel demurrage. Never schedule berth labor below ARIMA output.', color: '#F2A541' },
        { num: '02', title: '+7% Contingency Buffer', desc: 'Add a 7% longshore labor gang safety buffer to stage equipment and absorb sudden carrier vessel bunching.', color: '#10B981' },
        { num: '03', title: 'Industry 5.0 Sign-off', desc: 'Algorithms narrow uncertainty but never make final calls. Human terminal superintendents maintain override.', color: '#38BDF8' }
      ];

      ops.forEach((o, i) => {
        const ox = 60 + i * 390;
        ctx.fillStyle = '#0B2545';
        ctx.strokeStyle = '#1B6CA8';
        ctx.lineWidth = 1;
        this.roundRect(ctx, ox, 220, 360, 380, 12, true, true);

        ctx.fillStyle = o.color;
        ctx.font = 'bold 36px monospace';
        ctx.fillText(o.num, ox + 24, 275);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.fillText(o.title, ox + 24, 325);

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '14px system-ui, sans-serif';
        ctx.fillText(o.desc, ox + 24, 375);
      });

    } else if (beatIndex === 6) {
      // SLIDE 7: Final Verdict & Credentials
      ctx.fillStyle = '#F2A541';
      ctx.font = 'bold 14px uppercase monospace';
      ctx.fillText('FINAL OPERATIONAL RECOMMENDATION', 60, 140);

      ctx.fillStyle = '#0B2545';
      ctx.strokeStyle = '#F2A541';
      ctx.lineWidth = 2;
      this.roundRect(ctx, 60, 180, w - 120, 240, 12, true, true);

      ctx.fillStyle = '#F2A541';
      ctx.font = 'italic 300 22px system-ui, sans-serif';
      ctx.fillText('“Use ARIMA (1,1,0) as the primary export-volume forecast, re-validated quarterly', 90, 245);
      ctx.fillText('and reviewed by a human planner before it drives binding capacity decisions,', 90, 285);
      ctx.fillText('with ETS α=0.50 kept as a simple, spreadsheet-based backup.”', 90, 325);

      // Course Credentials Box
      ctx.fillStyle = '#060B14';
      ctx.strokeStyle = '#1B6CA8';
      ctx.lineWidth = 1;
      this.roundRect(ctx, 60, 460, w - 120, 130, 8, true, true);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillText('IE-PC 3112: Operations Management 1 · BSIE 3-E · Group 7 · Cebu Technological University', 90, 500);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText('Team Members: Aligato, Elaiza Jane · Ansay, Rash Mae Crystelle C. (Leader) · Villagracia, Mylene Joy', 90, 530);
      ctx.fillText('Instructor: Engr. Lyndrian Shalom R. Baclayon · Challenge: D10 Port of Los Angeles TEUs', 90, 555);
    }

    // Bottom timeline bar
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(0, h - 8, w, 8);
    const overallProgress = (beatIndex + elapsedSeconds / beat.durationSeconds) / KEYNOTE_BEATS.length;
    ctx.fillStyle = '#F2A541';
    ctx.fillRect(0, h - 8, w * overallProgress, 8);
  }

  private drawTimeChart(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, elapsed: number): void {
    const padL = 60;
    const padR = 40;
    const padT = 30;
    const padB = 40;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const minV = 200000;
    const maxV = 480000;
    const getPlotX = (p: number) => x + padL + ((p - 1) / 35) * plotW;
    const getPlotY = (v: number) => y + padT + plotH - ((v - minV) / (maxV - minV)) * plotH;

    // Gridlines
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    [250000, 300000, 350000, 400000, 450000].forEach(v => {
      const py = getPlotY(v);
      ctx.beginPath();
      ctx.moveTo(x + padL, py);
      ctx.lineTo(x + padL + plotW, py);
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = '10px monospace';
      ctx.fillText(`${v / 1000}k`, x + 15, py + 4);
    });

    // Draw active portion of the line based on elapsed time
    const maxPeriod = Math.min(36, Math.max(1, Math.floor((elapsed / 30) * 36)));

    ctx.strokeStyle = '#1B6CA8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < maxPeriod; i++) {
      const row = FULL_TIME_SERIES[i];
      const px = getPlotX(row.period);
      const py = getPlotY(row.actual);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Pulse at Feb 2023 (index 13)
    if (maxPeriod >= 14) {
      const febRow = FULL_TIME_SERIES[13];
      const fx = getPlotX(febRow.period);
      const fy = getPlotY(febRow.actual);

      ctx.fillStyle = '#F2A541';
      ctx.beginPath();
      ctx.arc(fx, fy, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#F2A541';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('Feb 2023 (-32%)', fx - 45, fy - 14);
    }
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill: boolean,
    stroke: boolean
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }
}
