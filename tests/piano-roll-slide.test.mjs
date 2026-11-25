import assert from 'node:assert/strict';
import test from 'node:test';
import '../public/piano-roll.js';

const { applySlide, slideOffsets } = globalThis.MeldPianoRollCore;

test('Dorian retains the raised sixth and chromatic movement can land on any semitone', () => {
  const {inScale, snapPitch} = globalThis.MeldPianoRollCore;
  assert.equal(inScale(61,{tonic:4,mode:'dorian'}),true);
  assert.equal(inScale(61,{tonic:4,mode:'minor'}),false);
  assert.equal(snapPitch(61,{tonic:4,mode:'chromatic'}),61);
});

test('old notes and invalid or unchanged slide targets play normally', () => {
  for (const slideMidi of [undefined, 60, -1, 128, 63.5]) {
    assert.equal(slideOffsets({ midi: 60, slideMidi }), null);
  }
});

test('slide automation preserves oscillator detune and resumes mid-slide', () => {
  const events = [];
  const detune = {
    setValueAtTime: (...args) => events.push(['set', ...args]),
    linearRampToValueAtTime: (...args) => events.push(['ramp', ...args])
  };
  applySlide([{ detune, meldBaseDetune: 4 }], { midi: 60, slideMidi: 67 }, 5, 0.75, 0.25);
  assert.deepEqual(events, [['set', 179, 5], ['ramp', 704, 5.75]]);
  assert.deepEqual(slideOffsets({ midi: 60, slideMidi: 57 }, 0.5), { start: -150, end: -300 });
});
