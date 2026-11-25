import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
const ctx=vm.createContext({});
for(const path of ['pitch-detector','pitch-analysis'])vm.runInContext(readFileSync(`public/${path}.js`,'utf8'),ctx);
const detector=ctx.MeldPitchDetector,api=ctx.MeldPitchAnalysis;
const error=(hz,expected)=>1200*Math.log2(hz/expected);
let seed=7919;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296*2-1;};
const tone=(hz,rate,amp=.2,harm=0,noise=0,seconds=.064)=>Float32Array.from({length:Math.round(rate*seconds)},(_,i)=>amp*(Math.sin(2*Math.PI*hz*i/rate)+harm*Math.sin(4*Math.PI*hz*i/rate))+noise*random());
test('YIN standards, gain, strong harmonic and noise, using actual sample rate',()=>{
 let worstClean=0,worstNoise=0,octaves=0;const times=[];
 for(const rate of [44100,48000])for(const hz of [130.81,220,261.63,440,523.25])for(const [amp,harm,noise] of [[.005,0,0],[.2,0,0],[.7,0,0],[.06,3,0],[.2,0,.03]])for(let phase=0;phase<4;phase++){
  const input=tone(hz,rate,amp,harm,noise);const start=performance.now();const r=detector.detect(input,rate);times.push(performance.now()-start);
  assert.ok(r.frequency>0,`${rate}/${hz}: unvoiced`);const e=Math.abs(error(r.frequency,hz));
  if(Math.abs(e-1200)<100)octaves++;if(noise)worstNoise=Math.max(worstNoise,e);else worstClean=Math.max(worstClean,e);
  assert.ok(e<(noise?25:10),`${rate}/${hz} harm=${harm} noise=${noise} error=${e}`);
 }
 console.log(JSON.stringify({worstClean,worstNoise,octaves,meanMs:times.reduce((a,b)=>a+b)/times.length,p95Ms:times.sort((a,b)=>a-b)[Math.floor(times.length*.95)]}));
});
test('low E2, DC, silence, invalid samples and noise rejection',()=>{
 for(const rate of [44100,48000]){
  assert.ok(Math.abs(error(detector.detect(tone(65.406,rate),rate).frequency,65.406))<10);
  assert.equal(detector.detect(new Float32Array(4096),rate).frequency,-1);
  assert.equal(detector.detect(new Float32Array(4096).fill(.2),rate).frequency,-1);
  assert.equal(detector.detect(Float32Array.from({length:4096},random),rate).frequency,-1);
 }
 for(const [input,rate] of [[[],48000],[new Float32Array(2048).fill(NaN),48000],[tone(220,16000),0]]){
  const r=detector.detect(input,rate);assert.equal(r.frequency,-1);assert.ok(Number.isFinite(r.rms));
 }
});
function track(fn,seconds=1){let phase=0;const rate=16000,input=Float32Array.from({length:rate*seconds},(_,i)=>{const f=fn(i/rate);phase+=2*Math.PI*(f||220)/rate;return f?.2*Math.sin(phase):0;});return [...api.frames(input,rate,'vocal')];}
test('real octave jumps survive tracking and continuous segmentation',()=>{
 const frames=track(t=>t<.5?220:440);const notes=api.analyze(frames,'vocal').notes;
 assert.deepEqual(Array.from(notes,n=>n.midi),[57,69]);assert.ok(Math.abs(notes[1].start-.5)<.06);
});
test('brief same-pitch rearticulation, short notes, breath and no phantom notes',()=>{
 const frames=track(t=>t<.2?220:t<.24?0:t<.44?220:t<.55?0:t<.63?261.63:t<.71?293.66:0);
 const notes=api.analyze(frames,'vocal').notes;
 assert.deepEqual(Array.from(notes,n=>n.midi),[57,57,60,62]);
 assert.equal(api.analyze(track(()=>0),'vocal').notes.length,0);
});
test('glide and vibrato preserve continuous trajectory',()=>{
 for(const fn of [t=>220*2**(t/2),t=>220*2**(.2*Math.sin(2*Math.PI*5*t)/12)]){
  const frames=api.stabilize(track(fn)).filter(f=>f.t>.08&&f.t<.92);
  assert.ok(frames.every(f=>f.midi!==null&&Math.abs(f.midi-(69+12*Math.log2(fn(f.t)/440)))*100<10));
 }
});
test('isolated spike is smoothed but sustained octave is preserved',()=>{
 const values=[57,57,69,57,57,69,69,69];const frames=values.map((midi,i)=>({midi,t:i*.01,confidence:.99}));
 assert.equal(api.stabilize(frames)[2].midi,57);assert.equal(api.stabilize(frames)[6].midi,69);
});
test('worker protocol shares detector and analysis; reset and malformed input are safe',()=>{
 const messages=[],workerCtx=vm.createContext({postMessage:message=>messages.push(message)});
 workerCtx.importScripts=(...files)=>{for(const file of files)vm.runInContext(readFileSync('public/'+file.split('?')[0],'utf8'),workerCtx);};
 vm.runInContext(readFileSync('public/pitch-worker.js','utf8'),workerCtx);
 workerCtx.onmessage({data:{id:1,type:'detect',input:tone(220,48000),rate:48000}});
 assert.ok(Math.abs(error(messages[0].result.frequency,220))<10);
 workerCtx.onmessage({data:{id:2,type:'reset'}});assert.equal(messages[1].result,true);
 workerCtx.onmessage({data:{id:3,type:'analyze',input:tone(261.63,48000,.2,0,0,.3),rate:48000,profile:'vocal'}});
 assert.ok(messages[2].result.filter(f=>f.midi!==null).length>10);
 workerCtx.onmessage({data:{id:4,type:'analyze',input:new Float32Array(10),rate:0,profile:'vocal'}});
 assert.ok(messages[3].error);
});
test('ambiguous octave evidence may delay a jump but cannot lock it out',()=>{
 const tracker=detector.createTracker();tracker.update({frequency:220,confidence:.99,candidates:[]});
 const incoming={frequency:440,confidence:.9,candidates:[{frequency:440,confidence:.9,cost:.1},{frequency:220,confidence:.98,cost:.02}]};
 assert.equal(tracker.update(incoming).frequency,220);
 assert.equal(tracker.update(incoming).frequency,220);
 assert.equal(tracker.update(incoming).frequency,440);
 tracker.reset();assert.equal(tracker.update(incoming).frequency,440);
});
test('new vocal defaults preserve continuous notes; instrument articulation remains available',()=>{
 const values=new Map([['meld.recognition.onset-first.v1','true']]);
 const settings=vm.createContext({state:{recognitionProfile:'vocal'},window:{MeldPitchAnalysis:api},localStorage:{getItem:key=>values.has(key)?values.get(key):null}});
 vm.runInContext(readFileSync('public/recognition.js','utf8'),settings);
 assert.equal(settings.recognitionOnsetPreference(),false);
 settings.state.recognitionProfile='guitar';assert.equal(settings.recognitionOnsetPreference(),true);
 settings.state.recognitionProfile='vocal';values.set('meld.recognition.onset-first.v2.vocal','true');assert.equal(settings.recognitionOnsetPreference(),true);
});

test('strong second harmonics resolve to the fundamental on the first frame',()=>{
 for(const rate of [44100,48000])for(const harmonic of [4,6,8]){
  const result=detector.detect(tone(220,rate,.06,harmonic),rate);
  assert.ok(Math.abs(error(result.frequency,220))<10,`${rate}/${harmonic}: ${result.frequency} Hz`);
 }
});

test('sparse live fallback preserves a two-frame note and rejects a one-frame octave spike',()=>{
 const step=.033;
 const frames=Array.from({length:10},(_,i)=>({
  t:i*step,midi:i===2?69:i<4?57:i<6?60:62,confidence:.99,rms:.1,frameStep:step,
 }));
 assert.deepEqual(Array.from(api.segment(frames,'vocal'),note=>note.midi),[57,60,62]);
});

test('vocal articulation uses the main voiced body instead of the leading pitch',()=>{
 const rate=16000,spacing=.34,starts=[.12,.46,.80,1.14],targets=[306,325,325,302];
 let phase=0;
 const audio=Float32Array.from({length:rate*1.55},(_,index)=>{
  const time=index/rate,take=Math.floor((time-starts[0])/spacing);
  if(take<0||take>=targets.length)return 0;
  const offset=time-starts[take];
  if(offset<0||offset>=.24)return 0;
  const frequency=offset<.07?targets[take]/2**(3/12):targets[take];
  phase+=2*Math.PI*frequency/rate;
  const envelope=Math.min(1,offset/.012,(.24-offset)/.035);
  return .17*envelope*(Math.sin(phase)+.55*Math.sin(2*phase));
 });
 const frames=[...api.frames(audio,rate,'vocal')];
 const notes=api.segment(frames,'vocal',{onsetFirst:true});
 assert.deepEqual(Array.from(notes,note=>note.midi),[63,64,64,62]);
 notes.forEach((note,index)=>assert.ok(Math.abs(note.start-starts[index])<=.025));
});
