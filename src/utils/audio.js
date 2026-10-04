/**
 * AegisIndoor 3D - Native Web Audio Synthesis Module
 * Zero external audio files: All sounds generated in real-time via AudioContext oscillators.
 */

let audioCtx = null;
let muted = false;

// Initialize mute state from localStorage if available
try {
  const saved = localStorage.getItem('navi_3d_audio_muted');
  if (saved !== null) {
    muted = JSON.parse(saved);
  }
} catch (e) {
  // Ignore localStorage failure in restricted contexts
}

/**
 * Returns or initializes the shared AudioContext.
 * Automatically handles browser autoplay suspension policy.
 */
export function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Check if audio is currently muted
 */
export function isMuted() {
  return muted;
}

/**
 * Update mute state
 */
export function setMuted(value) {
  muted = Boolean(value);
  try {
    localStorage.setItem('navi_3d_audio_muted', JSON.stringify(muted));
  } catch (e) {}
  return muted;
}

/**
 * Toggle mute state
 */
export function toggleMute() {
  return setMuted(!muted);
}

/**
 * Play a synthesized multi-tone harmonic arrival celebration chime.
 * Staggered crystal notes: E5 (659Hz) -> G#5 (831Hz) -> B5 (988Hz) -> E6 (1319Hz)
 */
export function playArrivalChime() {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [
    { freq: 659.25, timeOffset: 0.00, gain: 0.18, duration: 1.2 }, // E5
    { freq: 830.61, timeOffset: 0.08, gain: 0.16, duration: 1.3 }, // G#5
    { freq: 987.77, timeOffset: 0.16, gain: 0.18, duration: 1.4 }, // B5
    { freq: 1318.51, timeOffset: 0.24, gain: 0.22, duration: 1.6 }, // E6
  ];

  const now = ctx.currentTime;

  notes.forEach((note) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(note.freq, now + note.timeOffset);

    // Warm overtone: slight vibrato
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    vibrato.frequency.setValueAtTime(5.0, now + note.timeOffset); // 5Hz vibrato
    vibratoGain.gain.setValueAtTime(2.5, now + note.timeOffset);
    vibrato.connect(osc.frequency);
    vibrato.start(now + note.timeOffset);
    vibrato.stop(now + note.timeOffset + note.duration);

    // Envelope: quick gentle attack, long exponential release
    gainNode.gain.setValueAtTime(0.0001, now + note.timeOffset);
    gainNode.gain.exponentialRampToValueAtTime(note.gain, now + note.timeOffset + 0.025);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + note.timeOffset + note.duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now + note.timeOffset);
    osc.stop(now + note.timeOffset + note.duration + 0.05);
  });
}

/**
 * Play a low synthesized warning buzz for inaccessible routing / stair obstacles.
 * Descending pitch 140Hz -> 85Hz with warm lowpass filter.
 */
export function playWarningBuzz() {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gainNode = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.28);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(450, now);

  gainNode.gain.setValueAtTime(0.001, now);
  gainNode.gain.linearRampToValueAtTime(0.14, now + 0.03);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.35);
}

/**
 * Play an uplifting two-tone chime when navigation begins
 */
export function playNavigationStart() {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const tones = [
    { freq: 523.25, timeOffset: 0.0, gain: 0.12, dur: 0.25 }, // C5
    { freq: 783.99, timeOffset: 0.1, gain: 0.15, dur: 0.45 }, // G5
  ];

  tones.forEach((tone) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(tone.freq, now + tone.timeOffset);

    gainNode.gain.setValueAtTime(0.0001, now + tone.timeOffset);
    gainNode.gain.exponentialRampToValueAtTime(tone.gain, now + tone.timeOffset + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + tone.timeOffset + tone.dur);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now + tone.timeOffset);
    osc.stop(now + tone.timeOffset + tone.dur + 0.05);
  });
}

/**
 * Play a subtle high-frequency acoustic click for UI interactions
 */
export function playUiClick() {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.035);

  gainNode.gain.setValueAtTime(0.08, now);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.05);
}
