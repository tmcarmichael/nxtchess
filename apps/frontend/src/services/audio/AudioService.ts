import { DEBUG } from '../../shared/utils/debug';

// Audio service for chess move sounds
// Uses Web Audio API with real-time sound generation

type SoundType = 'move' | 'capture' | 'gameStart' | 'check' | 'illegalMove' | 'gameEnd' | 'lowTime';

class AudioService {
  private audioContext: AudioContext | null = null;
  private volume = 0.12;
  private enabled = true;
  private hasUserInteracted = false;
  private userInteractionListenerAdded = false;

  constructor() {
    this.setupUserInteractionListener();
  }

  /**
   * Listen for user interaction to enable audio.
   * AudioContext requires a user gesture to start.
   */
  private setupUserInteractionListener(): void {
    if (this.userInteractionListenerAdded || typeof window === 'undefined') return;

    const enableAudio = () => {
      this.hasUserInteracted = true;
      // Try to resume any suspended context
      if (this.audioContext?.state === 'suspended') {
        this.audioContext.resume().catch(() => {
          // Ignore resume errors
        });
      }
    };

    // Listen for common user interaction events
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach((event) => {
      window.addEventListener(event, enableAudio, { once: false, passive: true });
    });

    this.userInteractionListenerAdded = true;
  }

  // Initialize audio context (must be called after user interaction)
  init(): void {
    if (this.audioContext) return;

    // Don't create AudioContext until user has interacted
    if (!this.hasUserInteracted) return;

    try {
      this.audioContext = new AudioContext();
    } catch (error) {
      if (DEBUG) console.warn('Failed to initialize audio:', error);
    }
  }

  private ensureContext(): AudioContext | null {
    // Don't attempt to create/resume AudioContext before user interaction
    if (!this.hasUserInteracted) {
      return null;
    }

    if (!this.audioContext) {
      this.init();
    }

    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume().catch(() => {
        // Ignore resume errors - will retry on next sound
      });
    }

    return this.audioContext;
  }

  // Classic wooden piece placement - dry "tok" sound
  private playMoveClick(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Woody thump - short and dry
      const thump = ctx.createOscillator();
      thump.type = 'sine';
      thump.frequency.setValueAtTime(180, now);
      thump.frequency.exponentialRampToValueAtTime(100, now + 0.04);

      const thumpGain = ctx.createGain();
      thumpGain.gain.setValueAtTime(this.volume * 0.12, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      // Subtle attack click - very brief
      const attack = ctx.createOscillator();
      attack.type = 'triangle';
      attack.frequency.setValueAtTime(400, now);
      attack.frequency.exponentialRampToValueAtTime(200, now + 0.015);

      const attackGain = ctx.createGain();
      attackGain.gain.setValueAtTime(this.volume * 0.04, now);
      attackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      // Low-pass filter for natural wood character
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      filter.Q.value = 0.7;

      thump.connect(thumpGain);
      attack.connect(attackGain);
      thumpGain.connect(filter);
      attackGain.connect(filter);
      filter.connect(ctx.destination);

      thump.start(now);
      attack.start(now);
      thump.stop(now + 0.08);
      attack.stop(now + 0.03);
    } catch (error) {
      if (DEBUG) console.warn('Failed to play move sound:', error);
    }
  }

  // Capture sound - sharp click of pieces colliding
  private playCaptureSound(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Primary click - sharp and defined
      const click = ctx.createOscillator();
      click.type = 'sine';
      click.frequency.setValueAtTime(700, now);
      click.frequency.exponentialRampToValueAtTime(250, now + 0.015);

      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(this.volume * 0.12, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      // Subtle body - just enough weight, not a thud
      const body = ctx.createOscillator();
      body.type = 'sine';
      body.frequency.setValueAtTime(200, now);
      body.frequency.exponentialRampToValueAtTime(120, now + 0.025);

      const bodyGain = ctx.createGain();
      bodyGain.gain.setValueAtTime(this.volume * 0.06, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      // Bandpass filter to keep it snappy
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 500;
      filter.Q.value = 0.8;

      click.connect(clickGain);
      body.connect(bodyGain);
      clickGain.connect(filter);
      bodyGain.connect(ctx.destination);
      filter.connect(ctx.destination);

      click.start(now);
      body.start(now);

      click.stop(now + 0.04);
      body.stop(now + 0.05);
    } catch (error) {
      if (DEBUG) console.warn('Failed to play capture sound:', error);
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
      if (DEBUG) console.warn('Failed to play game start sound:', error);
    }
  }

  // Check sound - muted click to alert player they're in check
  private playCheckSound(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Low, muted thud - subtle but alerting
      const thud = ctx.createOscillator();
      thud.type = 'sine';
      thud.frequency.setValueAtTime(200, now);
      thud.frequency.exponentialRampToValueAtTime(100, now + 0.06);

      const thudGain = ctx.createGain();
      thudGain.gain.setValueAtTime(this.volume * 0.15, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      // Soft click transient
      const click = ctx.createOscillator();
      click.type = 'sine';
      click.frequency.setValueAtTime(800, now);
      click.frequency.exponentialRampToValueAtTime(300, now + 0.02);

      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(this.volume * 0.06, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      // Low-pass filter to muffle
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1200;
      filter.Q.value = 0.5;

      thud.connect(thudGain);
      click.connect(clickGain);
      thudGain.connect(filter);
      clickGain.connect(filter);
      filter.connect(ctx.destination);

      thud.start(now);
      click.start(now);
      thud.stop(now + 0.1);
      click.stop(now + 0.06);
    } catch (error) {
      if (DEBUG) console.warn('Failed to play check sound:', error);
    }
  }

  // Illegal move sound - knock/error sound
  private playIllegalMoveSound(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Dull wooden knock - error indicator
      const knock = ctx.createOscillator();
      knock.type = 'sine';
      knock.frequency.setValueAtTime(120, now);
      knock.frequency.exponentialRampToValueAtTime(60, now + 0.08);

      const knockGain = ctx.createGain();
      knockGain.gain.setValueAtTime(this.volume * 0.18, now);
      knockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      // Short percussive tap
      const tap = ctx.createOscillator();
      tap.type = 'triangle';
      tap.frequency.setValueAtTime(300, now);
      tap.frequency.exponentialRampToValueAtTime(150, now + 0.03);

      const tapGain = ctx.createGain();
      tapGain.gain.setValueAtTime(this.volume * 0.08, now);
      tapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      // Low-pass filter for muffled knock
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      filter.Q.value = 0.7;

      knock.connect(knockGain);
      tap.connect(tapGain);
      knockGain.connect(filter);
      tapGain.connect(filter);
      filter.connect(ctx.destination);

      knock.start(now);
      tap.start(now);
      knock.stop(now + 0.12);
      tap.stop(now + 0.06);
    } catch (error) {
      if (DEBUG) console.warn('Failed to play illegal move sound:', error);
    }
  }

  // Low time warning - descending two-note chime (inverse of game start)
  private playLowTimeSound(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Two-note chime (descending) - signals "winding down"
      const note1 = ctx.createOscillator();
      note1.type = 'sine';
      note1.frequency.value = 659.25; // E5 (starts high)

      const note1Gain = ctx.createGain();
      note1Gain.gain.setValueAtTime(0, now);
      note1Gain.gain.linearRampToValueAtTime(this.volume * 0.28, now + 0.01);
      note1Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      const note2 = ctx.createOscillator();
      note2.type = 'sine';
      note2.frequency.value = 523.25; // C5 (descends to)

      const note2Gain = ctx.createGain();
      note2Gain.gain.setValueAtTime(0, now + 0.1);
      note2Gain.gain.linearRampToValueAtTime(this.volume * 0.32, now + 0.11);
      note2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      // Soft low harmonic for weight (opposite of shimmer)
      const weight = ctx.createOscillator();
      weight.type = 'sine';
      weight.frequency.value = 261.63; // C4 (octave below)

      const weightGain = ctx.createGain();
      weightGain.gain.setValueAtTime(0, now + 0.1);
      weightGain.gain.linearRampToValueAtTime(this.volume * 0.08, now + 0.12);
      weightGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      note1.connect(note1Gain);
      note2.connect(note2Gain);
      weight.connect(weightGain);

      note1Gain.connect(ctx.destination);
      note2Gain.connect(ctx.destination);
      weightGain.connect(ctx.destination);

      note1.start(now);
      note2.start(now + 0.1);
      weight.start(now + 0.1);

      note1.stop(now + 0.2);
      note2.stop(now + 0.35);
      weight.stop(now + 0.4);
    } catch (error) {
      if (DEBUG) console.warn('Failed to play low time sound:', error);
    }
  }

  // Game end sound - minimal crisp knock against wood/stone
  private playGameEndSound(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Deep resonant knock
      const body = ctx.createOscillator();
      body.type = 'sine';
      body.frequency.setValueAtTime(180, now);
      body.frequency.exponentialRampToValueAtTime(70, now + 0.15);

      const bodyGain = ctx.createGain();
      bodyGain.gain.setValueAtTime(this.volume * 0.03, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      // Sharp attack transient for crispness
      const attack = ctx.createOscillator();
      attack.type = 'sine';
      attack.frequency.setValueAtTime(1800, now);
      attack.frequency.exponentialRampToValueAtTime(600, now + 0.015);

      const attackGain = ctx.createGain();
      attackGain.gain.setValueAtTime(this.volume * 0.012, now);
      attackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      // Wooden resonance
      const resonance = ctx.createOscillator();
      resonance.type = 'triangle';
      resonance.frequency.setValueAtTime(280, now);
      resonance.frequency.exponentialRampToValueAtTime(200, now + 0.1);

      const resGain = ctx.createGain();
      resGain.gain.setValueAtTime(this.volume * 0.01, now);
      resGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      body.connect(bodyGain);
      attack.connect(attackGain);
      resonance.connect(resGain);

      bodyGain.connect(ctx.destination);
      attackGain.connect(ctx.destination);
      resGain.connect(ctx.destination);

      body.start(now);
      attack.start(now);
      resonance.start(now);

      body.stop(now + 0.2);
      attack.stop(now + 0.05);
      resonance.stop(now + 0.15);
    } catch (error) {
      if (DEBUG) console.warn('Failed to play game end sound:', error);
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
      case 'check':
        this.playCheckSound();
        break;
      case 'illegalMove':
        this.playIllegalMoveSound();
        break;
      case 'gameEnd':
        this.playGameEndSound();
        break;
      case 'lowTime':
        this.playLowTimeSound();
        break;
    }
  }

  playMoveSound(isCapture = false): void {
    this.play(isCapture ? 'capture' : 'move');
  }

  playGameStart(): void {
    this.play('gameStart');
  }

  playCheck(): void {
    this.play('check');
  }

  playIllegalMove(): void {
    this.play('illegalMove');
  }

  playGameEnd(): void {
    this.play('gameEnd');
  }

  playLowTime(): void {
    this.play('lowTime');
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
