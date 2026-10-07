/**
 * AmbientDroneAudio - Minimalist, low-frequency ambient pad/drone synthesizer
 * Synthesizes a warm, barely-noticeable bed using standard Web Audio API.
 * Stops the silence from feeling like a technical glitch during held pauses.
 */

class AmbientDrone {
  private ctx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private osc3: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.08; // very low, subtle drone

  private init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    // Create low-pass filter for warm, dark sound
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(180, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(1.2, this.ctx.currentTime);

    // Master gain
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);

    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);
  }

  public play() {
    this.init();
    if (!this.ctx || !this.gainNode || !this.filterNode) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) return;

    const now = this.ctx.currentTime;

    // Oscillator 1: Fundamental A1 ~ 55 Hz (sine)
    this.osc1 = this.ctx.createOscillator();
    this.osc1.type = 'sine';
    this.osc1.frequency.setValueAtTime(55, now);

    // Oscillator 2: Slightly detuned 55.4 Hz for subtle organic movement
    this.osc2 = this.ctx.createOscillator();
    this.osc2.type = 'sine';
    this.osc2.frequency.setValueAtTime(55.4, now);

    // Oscillator 3: Soft harmonic at 110 Hz (A2)
    this.osc3 = this.ctx.createOscillator();
    this.osc3.type = 'triangle';
    this.osc3.frequency.setValueAtTime(110, now);

    // Connect to filter
    this.osc1.connect(this.filterNode);
    this.osc2.connect(this.filterNode);
    this.osc3.connect(this.filterNode);

    // Start oscillators
    this.osc1.start(now);
    this.osc2.start(now);
    this.osc3.start(now);

    // Smooth fade in
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(0, now);
    this.gainNode.gain.linearRampToValueAtTime(this.volume, now + 2.5);

    this.isPlaying = true;
  }

  public stop() {
    if (!this.ctx || !this.gainNode || !this.isPlaying) return;

    const now = this.ctx.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(0, now + 1.2);

    setTimeout(() => {
      try {
        this.osc1?.stop();
        this.osc2?.stop();
        this.osc3?.stop();
        this.osc1?.disconnect();
        this.osc2?.disconnect();
        this.osc3?.disconnect();
      } catch {
        // ignore already stopped
      }
      this.osc1 = null;
      this.osc2 = null;
      this.osc3 = null;
      this.isPlaying = false;
    }, 1300);
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.gainNode && this.isPlaying) {
      const now = this.ctx.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.linearRampToValueAtTime(this.volume, now + 0.1);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const ambientDrone = new AmbientDrone();
