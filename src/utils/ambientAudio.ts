/**
 * Harbor Soundscape & Paper-Craft Audio Engine
 * Pure Web Audio API synthesis for paper rustles, tape snaps, stamp thuds,
 * marker squeaks, fog horn, and quiet harbor bed.
 * Master volume default 25%, mute support.
 */

class HarborAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.25; // Default 25%
  private isRunning: boolean = false;
  private ambientGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private waterNoiseNode: AudioNode | null = null;

  private init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  public getContext(): AudioContext | null {
    this.init();
    return this.ctx;
  }

  public getMasterDestination(): AudioNode | null {
    this.init();
    return this.masterGain;
  }

  public play() {
    this.start();
  }

  public start() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isRunning) return;
    this.isRunning = true;

    const now = this.ctx.currentTime;

    // Ambient Sub-Gain
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.001, now);
    this.ambientGain.gain.linearRampToValueAtTime(0.18, now + 3);
    this.ambientGain.connect(this.masterGain);

    // Warm deep harbor drone (55Hz / 82.4Hz)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, now);
    filter.connect(this.ambientGain);

    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sine';
    this.droneOsc1.frequency.setValueAtTime(55, now);
    this.droneOsc1.connect(filter);
    this.droneOsc1.start(now);

    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'sine';
    this.droneOsc2.frequency.setValueAtTime(82.4, now);
    this.droneOsc2.connect(filter);
    this.droneOsc2.start(now);

    // Subtle harbor water ripple via filtered white noise
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const waterFilter = this.ctx.createBiquadFilter();
      waterFilter.type = 'bandpass';
      waterFilter.frequency.setValueAtTime(320, now);
      waterFilter.Q.setValueAtTime(0.8, now);

      const waterGain = this.ctx.createGain();
      waterGain.gain.setValueAtTime(0.02, now);

      whiteNoise.connect(waterFilter);
      waterFilter.connect(waterGain);
      waterGain.connect(this.ambientGain);

      whiteNoise.start(now);
      this.waterNoiseNode = whiteNoise;
    } catch {
      // White noise fallback
    }
  }

  public stop() {
    if (!this.ctx || !this.isRunning) return;
    const now = this.ctx.currentTime;
    if (this.ambientGain) {
      this.ambientGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
    }
    setTimeout(() => {
      try {
        this.droneOsc1?.stop();
        this.droneOsc2?.stop();
        this.droneOsc1?.disconnect();
        this.droneOsc2?.disconnect();
        (this.waterNoiseNode as AudioBufferSourceNode)?.stop();
        this.waterNoiseNode?.disconnect();
      } catch {}
      this.droneOsc1 = null;
      this.droneOsc2 = null;
      this.waterNoiseNode = null;
      this.isRunning = false;
    }, 900);
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // -------------------------------------------------------------
  // FX LIBRARY Web Audio Synthesizers
  // -------------------------------------------------------------

  /** Distant container ship horn (low, evocative dual-tone) */
  public playFogHorn() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const hornGain = this.ctx.createGain();
    hornGain.gain.setValueAtTime(0.0001, now);
    hornGain.gain.linearRampToValueAtTime(0.12, now + 0.6);
    hornGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

    const hornFilter = this.ctx.createBiquadFilter();
    hornFilter.type = 'lowpass';
    hornFilter.frequency.setValueAtTime(260, now);

    const f1 = this.ctx.createOscillator();
    f1.type = 'sawtooth';
    f1.frequency.setValueAtTime(65.4, now); // C2

    const f2 = this.ctx.createOscillator();
    f2.type = 'sawtooth';
    f2.frequency.setValueAtTime(77.78, now); // Eb2 (minor third nautical interval)

    f1.connect(hornFilter);
    f2.connect(hornFilter);
    hornFilter.connect(hornGain);
    hornGain.connect(this.masterGain);

    f1.start(now);
    f2.start(now);
    f1.stop(now + 3.3);
    f2.stop(now + 3.3);
  }

  /** Stamp Thump: Deep impact thud + crisp mechanical snap */
  public playStampThump() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const thumpOsc = this.ctx.createOscillator();
    thumpOsc.type = 'sine';
    thumpOsc.frequency.setValueAtTime(160, now);
    thumpOsc.frequency.exponentialRampToValueAtTime(42, now + 0.14);

    const thumpGain = this.ctx.createGain();
    thumpGain.gain.setValueAtTime(0.25, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    thumpOsc.connect(thumpGain);
    thumpGain.connect(this.masterGain);

    thumpOsc.start(now);
    thumpOsc.stop(now + 0.2);

    // Snap transient
    this.playPaperRustle(0.06, 0.08);
  }

  /** Tape Slap / Rip: Quick paper adhesion snap */
  public playTapeSlap() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.09);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.11);

    this.playPaperRustle(0.08, 0.06);
  }

  /** Marker Draw-On: Gentle dry-erase / felt-tip squeak */
  public playMarkerSqueak() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.linearRampToValueAtTime(1750, now + 0.06);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.14);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.035, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  /** Paper Rustle / Tear / Page Peel: Organic noise burst */
  public playPaperRustle(duration = 0.15, vol = 0.08) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    try {
      const bufLen = Math.floor(this.ctx.sampleRate * duration);
      const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.4));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buf;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.Q.setValueAtTime(1.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
    } catch {}
  }

  /** Distant Sea Gull Call: Rare, quiet touch */
  public playSeaGull() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.linearRampToValueAtTime(2900, now + 0.15);
    osc.frequency.linearRampToValueAtTime(1900, now + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.02, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.4);
  }
}

export const harborAudio = new HarborAudioEngine();
// Compatibility alias
export const ambientDrone = harborAudio;
