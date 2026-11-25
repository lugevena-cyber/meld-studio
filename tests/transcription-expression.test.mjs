import test from 'node:test';
import assert from 'node:assert/strict';
import { applyNoteVelocities, frameTime, modelSampleRate, modelStride } from '../client/transcription-expression.js';

test('model frame times retain the original sample position across windows', () => {
  assert.equal(frameTime(0, 142), 0);
  assert.equal(frameTime(142 * 4, 142), modelStride * 4 / modelSampleRate);
  assert.equal(frameTime(142 * 4 + 9, 142), (modelStride * 4 + 9 * 256) / modelSampleRate);
  assert.ok(frameTime(142, 142) > frameTime(141, 142));
});

test('velocities follow the corresponding pitch without changing note timing or confidence', () => {
  const notes = [
    { midi: 60, start: 0.12, duration: 0.15, confidence: 0.92, gain: 0.13 },
    { midi: 72, start: 0.12, duration: 0.3, confidence: 0.72, gain: 0.5 },
    { midi: 60, start: 0.7, duration: 0.21, confidence: 0.63, gain: 0.55 },
  ];
  const samples = new Float32Array(modelSampleRate);
  for (const note of notes) {
    const frequency = 440 * 2 ** ((note.midi - 69) / 12);
    for (let i = Math.round(note.start * modelSampleRate); i < (note.start + note.duration) * modelSampleRate; i++) {
      samples[i] += note.gain * Math.sin(2 * Math.PI * frequency * i / modelSampleRate);
    }
  }
  const result = applyNoteVelocities(samples, notes);
  assert.ok(result[1].velocity > result[0].velocity + 0.25);
  assert.ok(result[2].velocity > result[0].velocity + 0.25);
  assert.deepEqual(result.map(({ velocity, ...note }) => note), notes);
});
