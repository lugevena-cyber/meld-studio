import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const ctx=vm.createContext({MELD_PITCH_CONFIG:{legacy:true}});vm.runInContext(readFileSync('public/pitch-analysis.js','utf8'),ctx);const api=ctx.MeldPitchAnalysis;
for(const rate of [44100,48000])test(`baseline clean single tones within 10 cents at ${rate}`,()=>{
 for(const hz of [130.81,220,261.63,440,523.25])for(const amp of [.005,.2,.7]){
  const input=Float32Array.from({length:Math.round(rate*.048)},(_,i)=>amp*Math.sin(2*Math.PI*hz*i/rate));
  const r=api.detectPitch(input,rate);assert.ok(r.frequency>0);assert.ok(Math.abs(1200*Math.log2(r.frequency/hz))<10,`${hz}: ${r.frequency}`);
 }
 assert.equal(api.detectPitch(new Float32Array(2048),rate).frequency,-1);
});
test('characterization: default articulation mode discards a continuous octave change',()=>{
 const rate=16000;let phase=0;const input=Float32Array.from({length:rate},(_,i)=>{phase+=2*Math.PI*(i<rate/2?220:440)/rate;return .2*Math.sin(phase);});
 const frames=[...api.frames(input,rate,'vocal')];
 assert.deepEqual(Array.from(api.analyze(frames,'vocal',{onsetFirst:false}).notes,n=>n.midi),[57,69]);
 // Known defect: this assertion records baseline behavior, not desired behavior.
 assert.deepEqual(Array.from(api.analyze(frames,'vocal',{onsetFirst:true}).notes,n=>n.midi),[57]);
});
