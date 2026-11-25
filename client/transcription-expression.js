// Basic Pitch uses a 256-sample feature hop, with 15 overlapping frames
// discarded on either side of each model window.
export const modelSampleRate = 22050;
export const featureHop = 256;
export const modelWindow = 2 * modelSampleRate - featureHop;
export const modelOverlap = 15 * featureHop;
export const modelStride = modelWindow - 2 * modelOverlap;

export function frameTime(frame, framesPerWindow) {
  const window = Math.floor(frame / framesPerWindow);
  return (window * modelStride + (frame % framesPerWindow) * featureHop) / modelSampleRate;
}

function measureAttack(samples, note, windows, notesByPitch) {
  const frequency = 440 * 2 ** ((note.midi - 69) / 12);
  const windowSize = Math.round(modelSampleRate * Math.max(0.025, Math.min(0.075, 4 / frequency)));
  if (!windows.has(windowSize)) {
    windows.set(windowSize, Float32Array.from({ length: windowSize }, (_, i) =>
      0.5 - 0.5 * Math.cos(2 * Math.PI * i / (windowSize - 1))));
  }
  const weights = windows.get(windowSize);
  const windowCount = Math.max(1, Math.min(5, Math.ceil(note.duration / 0.025)));
  const harmonics = [];
  for (let number = 1; number <= 3 && number * frequency < modelSampleRate / 2; number++) {
    const pitch = note.midi + Math.round(12 * Math.log2(number));
    const overlaps = number > 1 && notesByPitch.get(pitch)?.some(other =>
      other.start < note.start + Math.min(note.duration, 0.13) && other.start + other.duration > note.start);
    if (!overlaps) {
      harmonics.push({ number, coefficient: 2 * Math.cos(2 * Math.PI * number * frequency / modelSampleRate) });
    }
  }

  const powers = [];
  for (let window = 0; window < windowCount; window++) {
    const center = note.start + Math.min(note.duration * 0.85, (window + 0.5) * 0.025);
    const start = Math.round(center * modelSampleRate) - Math.floor(windowSize / 2);
    let power = 0;
    // Measure the detected pitch and its lower harmonics so a louder
    // overlapping note does not set this note's velocity.
    for (const { number, coefficient } of harmonics) {
      let previous = 0, older = 0;
      for (let i = 0; i < windowSize; i++) {
        const next = (samples[start + i] || 0) * weights[i] + coefficient * previous - older;
        older = previous;
        previous = next;
      }
      power += Math.max(0, previous * previous + older * older - coefficient * previous * older) / number;
    }
    powers.push(power / (windowSize ** 2));
  }
  powers.sort((a, b) => a - b);
  return 10 * Math.log10(Math.max(1e-12, powers[Math.floor(powers.length * 0.7)]));
}

export function applyNoteVelocities(samples, notes) {
  const windows = new Map();
  const notesByPitch = new Map();
  for (const note of notes) {
    if (!notesByPitch.has(note.midi)) notesByPitch.set(note.midi, []);
    notesByPitch.get(note.midi).push(note);
  }
  const levels = notes.map(note => measureAttack(samples, note, windows, notesByPitch));
  const sorted = levels.filter(level => level > -100).sort((a, b) => a - b);
  const reference = sorted[Math.floor(sorted.length * 0.75)] ?? -60;
  return notes.map((note, i) => ({
    ...note,
    velocity: Math.min(1, Math.max(0.12, 0.76 + (levels[i] - reference) / 36)),
  }));
}
