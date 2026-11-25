import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import '../public/night-pocket-phrasing.js';

const {shape} = globalThis.MeldNightPocketPhrasing;
const score = JSON.parse(readFileSync(new URL('../public/examples/night-pocket/score.json',import.meta.url),'utf8'));
const beat = 60 / score.bpm;

function medianGap(notes) {
  const gaps = notes.slice(0,-1).map((note,i)=>notes[i+1].start-note.start-note.duration);
  gaps.sort((a,b)=>a-b);
  return gaps[Math.floor(gaps.length/2)];
}

test('Night Pocket expresses legato in notes and MIDI without changing pitches, onsets or accents',()=>{
  const lead=score.tracks.lead;
  const keys=score.tracks.keys;
  const revised=shape(lead,'lead',beat);
  assert.ok(medianGap(lead)>.10);
  assert.ok(Math.abs(medianGap(revised))<.02);
  for(const [part,notes] of Object.entries(score.tracks)){
    const result=shape(notes,part,beat);
    assert.deepEqual(result.map(({midi,start,velocity})=>[midi,start,velocity]),
                     notes.map(({midi,start,velocity})=>[midi,start,velocity]));
    if(['kick','snare','hat','guitar'].includes(part))assert.deepEqual(result,notes);
  }
  assert.ok(shape(keys,'keys',beat).some((note,i)=>note.duration>keys[i].duration));
});

test('phrasing preserves deliberate rests and avoids overlapping consecutive hits on the same pitch',()=>{
  const notes=[{midi:60,start:0,duration:.10},{midi:60,start:.25,duration:.10},{midi:64,start:1,duration:.12}];
  const result=shape(notes,'lead',beat);
  assert.ok(result[0].duration>.20&&result[0].duration<.25);
  assert.equal(result[1].duration,notes[1].duration);
  assert.equal(result[2].duration,notes[2].duration);
});
