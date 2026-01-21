// Audio service for chess move sounds
// Uses Web Audio API with real-time sound generation

type SoundType = 'move' | 'capture' | 'gameStart';

class AudioService {
  private audioContext: AudioContext | null = null;
  private volume = 0.35;
  private enabled = true;

  // Initialize audio context (must be called after user interaction)
  init(): void {
    if (this.audioContext) return;

    try {
      this.audioContext = new AudioContext();
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.audioContext) {
      this.init();
    }

    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }

    return this.audioContext;
  }

  // Gentle wooden click - warm and satisfying
  private playMoveClick(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Layer 1: Deep woody body (low sine with quick decay)
      const body = ctx.createOscillator();
      body.type = 'sine';
      body.frequency.setValueAtTime(150, now);
      body.frequency.exponentialRampToValueAtTime(80, now + 0.08);

      const bodyGain = ctx.createGain();
      bodyGain.gain.setValueAtTime(this.volume * 0.19, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      // Layer 2: Click transient (short high frequency tap)
      const click = ctx.createOscillator();
      click.type = 'sine';
      click.frequency.setValueAtTime(1200, now);
      click.frequency.exponentialRampToValueAtTime(400, now + 0.02);

      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(this.volume * 0.056, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      // Layer 3: Soft resonance (adds warmth)
      const resonance = ctx.createOscillator();
      resonance.type = 'triangle';
      resonance.frequency.setValueAtTime(250, now);

      const resGain = ctx.createGain();
      resGain.gain.setValueAtTime(this.volume * 0.075, now);
      resGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      // Low-pass filter to soften everything
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2000;
      filter.Q.value = 0.5;

      // Connect layers
      body.connect(bodyGain);
      click.connect(clickGain);
      resonance.connect(resGain);

      bodyGain.connect(filter);
      clickGain.connect(filter);
      resGain.connect(filter);

      filter.connect(ctx.destination);

      // Start and stop
      body.start(now);
      click.start(now);
      resonance.start(now);

      body.stop(now + 0.15);
      click.stop(now + 0.05);
      resonance.stop(now + 0.15);
    } catch (error) {
      console.warn('Failed to play move sound:', error);
    }
  }

  // Capture sound - wooden thud with a clink
  private playCaptureSound(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Base thud (similar to move but slightly stronger)
      const body = ctx.createOscillator();
      body.type = 'sine';
      body.frequency.setValueAtTime(180, now);
      body.frequency.exponentialRampToValueAtTime(60, now + 0.1);

      const bodyGain = ctx.createGain();
      bodyGain.gain.setValueAtTime(this.volume * 0.206, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      // Clink - higher pitched metallic tap
      const clink = ctx.createOscillator();
      clink.type = 'sine';
      clink.frequency.setValueAtTime(2400, now);
      clink.frequency.exponentialRampToValueAtTime(1800, now + 0.03);

      const clinkGain = ctx.createGain();
      clinkGain.gain.setValueAtTime(this.volume * 0.094, now);
      clinkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      // Second clink harmonic for richness
      const clink2 = ctx.createOscillator();
      clink2.type = 'sine';
      clink2.frequency.setValueAtTime(3200, now);
      clink2.frequency.exponentialRampToValueAtTime(2200, now + 0.025);

      const clink2Gain = ctx.createGain();
      clink2Gain.gain.setValueAtTime(this.volume * 0.045, now);
      clink2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      // Connect
      body.connect(bodyGain);
      clink.connect(clinkGain);
      clink2.connect(clink2Gain);

      bodyGain.connect(ctx.destination);
      clinkGain.connect(ctx.destination);
      clink2Gain.connect(ctx.destination);

      // Start and stop
      body.start(now);
      clink.start(now);
      clink2.start(now);

      body.stop(now + 0.15);
      clink.stop(now + 0.08);
      clink2.stop(now + 0.06);
    } catch (error) {
      console.warn('Failed to play capture sound:', error);
    }
  }

  // Quick chime for game start
  private playGameStartSound(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Two-note chime (ascending)
      const note1 = ctx.createOscillator();
      note1.type = 'sine';
      note1.frequency.value = 523.25; // C5

      const note1Gain = ctx.createGain();
      note1Gain.gain.setValueAtTime(0, now);
      note1Gain.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.01);
      note1Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      const note2 = ctx.createOscillator();
      note2.type = 'sine';
      note2.frequency.value = 659.25; // E5

      const note2Gain = ctx.createGain();
      note2Gain.gain.setValueAtTime(0, now + 0.08);
      note2Gain.gain.linearRampToValueAtTime(this.volume * 0.35, now + 0.09);
      note2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      // Soft high harmonic for shimmer
      const shimmer = ctx.createOscillator();
      shimmer.type = 'sine';
      shimmer.frequency.value = 1318.5; // E6

      const shimmerGain = ctx.createGain();
      shimmerGain.gain.setValueAtTime(0, now + 0.08);
      shimmerGain.gain.linearRampToValueAtTime(this.volume * 0.1, now + 0.1);
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      note1.connect(note1Gain);
      note2.connect(note2Gain);
      shimmer.connect(shimmerGain);

      note1Gain.connect(ctx.destination);
      note2Gain.connect(ctx.destination);
      shimmerGain.connect(ctx.destination);

      note1.start(now);
      note2.start(now + 0.08);
      shimmer.start(now + 0.08);

      note1.stop(now + 0.2);
      note2.stop(now + 0.3);
      shimmer.stop(now + 0.35);
    } catch (error) {
      console.warn('Failed to play game start sound:', error);
    }
  }

  play(soundType: SoundType): void {
    if (!this.enabled) return;

    switch (soundType) {
      case 'move':
        this.playMoveClick();
        break;
      case 'capture':
        this.playCaptureSound();
        break;
      case 'gameStart':
        this.playGameStartSound();
        break;
    }
  }

  playMoveSound(isCapture = false): void {
    this.play(isCapture ? 'capture' : 'move');
  }

  playGameStart(): void {
    this.play('gameStart');
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getVolume(): number {
    return this.volume;
  }
}

// Singleton instance
export const audioService = new AudioService();
