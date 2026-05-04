// Ultra-minimal UI sound effects
// Web Audio API oscillators — zero network latency, no file downloads

const AudioContext = window.AudioContext || window.webkitAudioContext;
let ctx = null;

function getCtx() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tick(freq, type = 'sine', dur = 0.04, vol = 0.04) {
  try {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, c.currentTime);
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur + 0.01);
  } catch (_) { /* silent fail if audio blocked */ }
}

function noise(dur = 0.06, vol = 0.02) {
  try {
    const c = getCtx();
    const bufferSize = c.sampleRate * dur;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    const src = c.createBufferSource();
    src.buffer = buffer;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.setValueAtTime(3000, c.currentTime);
    f.frequency.exponentialRampToValueAtTime(800, c.currentTime + dur);
    src.connect(f);
    f.connect(g);
    g.connect(c.destination);
    src.start();
    src.stop(c.currentTime + dur + 0.01);
  } catch (_) {}
}

export const sounds = {
  // Haptic feedback (Vibration)
  vibrate: (pattern = 100) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch (e) {}
  },

  // Capacitive touch pop
  click: () => {}, // Silenced per request

  // Two-note ascending chime
  correct: () => {
    // Keeping a very soft chime for success
    tick(880, 'sine', 0.04, 0.02);
    setTimeout(() => tick(1320, 'sine', 0.04, 0.015), 45);
  },

  // Soft low thud
  wrong: () => tick(200, 'triangle', 0.08, 0.03),

  // Gentle select
  select: () => {}, // Silenced

  // Rising 4-note arpeggio
  complete: () => {
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => tick(f, 'sine', 0.06, 0.02), i * 80)
    );
  },

  // Task completion tick
  taskDone: () => tick(1000, 'sine', 0.03, 0.03),

  // Soft whoosh for page transitions
  navigate: () => {}, // Silenced
};