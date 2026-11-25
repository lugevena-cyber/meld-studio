import * as tf from '@tensorflow/tfjs';
import { BasicPitch, outputToNotesPoly } from '@spotify/basic-pitch';
import { Midi } from '@tonejs/midi';
import '../public/pitch-detector.js';
import { applyNoteVelocities, frameTime, modelOverlap, modelSampleRate, modelStride, modelWindow } from './transcription-expression.js';

const groups = [
  { key: 'vocals', name: '人声', instrument: 'piano', program: 0 },
  { key: 'bass', name: '贝斯', instrument: 'bass', program: 33 },
  { key: 'other', name: '其他伴奏', instrument: 'acoustic', program: 24 },
];
const mixGroup = { name: '整段音频', instrument: 'piano', program: 0 };

self.onmessage = async ({ data: { mix, stems, sampleRate, duration } }) => {
  try {
    await tf.setBackend('cpu');
    const model = await tf.loadGraphModel(new URL('./basic-pitch/model.json', self.location.href).href);
    const pitch = new BasicPitch(model);
    const midi = new Midi();
    const results = [];
    for (const group of mix ? [mixGroup] : groups) {
      const mono = mix || stems[group.key][0].map((value, i) => (value + stems[group.key][1][i]) * 0.5);
      if (!mono.some(sample => Math.abs(sample) >= 0.001)) continue;
      const samples = self.MeldPitchDetector.resample(mono, sampleRate, modelSampleRate);
      const frames = [], onsets = [];
      let framesPerWindow;
      const window = new Float32Array(modelWindow);
      for (let start = 0; start < samples.length; start += modelStride) {
        // Each inference sees the neighboring audio while the model's trimmed
        // output is appended once. Dispose tensors after each window on mobile.
        const firstSample = start - modelOverlap;
        const from = Math.max(0, firstSample);
        window.fill(0);
        window.set(samples.subarray(from, firstSample + modelWindow), from - firstSample);
        tf.engine().startScope();
        try {
          const input = tf.tensor3d(window, [1, modelWindow, 1]);
          const [frameTensor, onsetTensor] = await pitch.evaluateSingleFrame(input, 0);
          const modelFrames = await pitch.unwrapOutput(frameTensor).array();
          const modelOnsets = await pitch.unwrapOutput(onsetTensor).array();
          framesPerWindow = modelFrames.length;
          for (let i = 0; i < framesPerWindow; i++) {
            if (frameTime(frames.length, framesPerWindow) >= duration) break;
            frames.push(modelFrames[i]);
            onsets.push(modelOnsets[i]);
          }
        } finally {
          tf.engine().endScope();
        }
        self.postMessage({ progress: Math.min(100, Math.round((start + modelStride) / samples.length * 100)), name: group.name });
      }

      // Limit how long a drop in pitch activation can be bridged across a rest.
      const detected = outputToNotesPoly(frames, onsets, 0.35, 0.35, 6, true, null, null, true, 8)
        .flatMap(note => {
          const start = frameTime(note.startFrame, framesPerWindow);
          const end = Math.min(duration, frameTime(note.startFrame + note.durationFrames, framesPerWindow));
          if (end - start < 0.04) return [];
          return [{
            midi: note.pitchMidi, start, duration: end - start,
            confidence: Math.max(0, Math.min(1, note.amplitude)),
            manualEdited: true,
          }];
        })
        .sort((a, b) => a.start - b.start || a.midi - b.midi);
      const notes = applyNoteVelocities(samples, detected);
      if (!notes.length) continue;
      const track = midi.addTrack();
      track.name = group.name;
      track.instrument.number = group.program;
      for (const note of notes) track.addNote({ midi: note.midi, time: note.start, duration: note.duration, velocity: note.velocity });
      results.push({ name: group.name, instrument: group.instrument, notes });
    }
    model.dispose();
    if (!results.length) throw Error('未找到可转写的音符，请换一段更清晰的录音');
    const output = midi.toArray();
    self.postMessage({ groups: results, count: results.reduce((n, group) => n + group.notes.length, 0), midi: output }, [output.buffer]);
  } catch (error) {
    self.postMessage({ error: error.message || '音符识别失败' });
  }
};
