// Deterministic audit harness. Does not change the production detector.
import vm from 'node:vm';
import {readFileSync,writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
const ctx=vm.createContext({MELD_PITCH_CONFIG:{legacy:true}});
vm.runInContext(readFileSync('public/pitch-analysis.js','utf8'),ctx);
const api=ctx.MeldPitchAnalysis;
const cents=(a,b)=>1200*Math.log2(a/b);
let seed=7919;
const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296*2-1;};
function signal(rate,hz,amplitude=.2,harmonic=0,noise=0,length=Math.round(rate*.048)){
 return Float32Array.from({length},(_,i)=>amplitude*(Math.sin(2*Math.PI*hz*i/rate)+harmonic*Math.sin(4*Math.PI*hz*i/rate))+noise*random());
}
const rows=[];
for(const rate of [44100,48000])for(const [name,hz] of Object.entries({C3:130.81,A3:220,C4:261.63,A4:440,C5:523.25}))for(const [kind,amp,harmonic,noise] of [['clean',.2,0,0],['quiet',.005,0,0],['loud',.7,0,0],['harmonic',.06,3,0],['noise',.2,0,.03]]){
 const errors=[],times=[];let missing=0,octaves=0;
 for(let k=0;k<12;k++){
  const input=signal(rate,hz,amp,harmonic,noise);const t=performance.now();const r=api.detectPitch(input,rate);times.push(performance.now()-t);
  if(r.frequency<=0){missing++;continue;}const err=cents(r.frequency,hz);errors.push(Math.abs(err));if(Math.abs(Math.abs(err)-1200)<100)octaves++;
 }
 rows.push({rate,name,kind,maxAbsCents:errors.length?+Math.max(...errors).toFixed(3):null,missing,octaves,meanMs:+(times.reduce((a,b)=>a+b,0)/times.length).toFixed(3)});
}
const silence=[44100,48000].map(rate=>({rate,...api.detectPitch(new Float32Array(Math.round(rate*.048)),rate)}));
const invalid=[['empty',new Float32Array()],['NaN',new Float32Array(2048).fill(NaN)],['DC',new Float32Array(2048).fill(.2)]].map(([name,input])=>({name,...api.detectPitch(input,48000)}));
function trajectory(frequency){const rate=16000,length=rate,buf=new Float32Array(length);let phase=0;for(let i=0;i<length;i++){phase+=2*Math.PI*frequency(i/rate)/rate;buf[i]=.2*Math.sin(phase);}return [...api.frames(buf,rate,'vocal')];}
const changes=trajectory(t=>t<.5?220:440);
const syllable=api.analyze(changes,'vocal',{onsetFirst:true});
const continuous=api.analyze(changes,'vocal',{onsetFirst:false});
const trajectories={};
for(const [name,fn] of [['glide',t=>220*2**(t/2)],['vibrato',t=>220*2**(.2*Math.sin(2*Math.PI*5*t)/12)]]){
 const samples=trajectory(fn).filter(s=>s.t>.06&&s.t<.94&&s.midi!==null);
 trajectories[name]={frames:samples.length,maxAbsCents:+Math.max(...samples.map(s=>Math.abs((s.midi-(69+12*Math.log2(fn(s.t)/440)))*100))).toFixed(3)};
}
const result={runtime:process.version,baselineCommit:'46c32a9a2b5e82d88af12eaed157253a53979ce4',rows,silence,invalid,trajectories,legato:{onsetFirst:syllable.notes,continuous:continuous.notes},limitations:['Node CPU times are not browser UI or microphone latency.','No annotated human singing test fixture is present.','48 ms stable frames exclude attack and release.']};
writeFileSync('docs/pitch-baseline.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({cases:rows.length,maxCleanCents:Math.max(...rows.filter(r=>r.kind==='clean').map(r=>r.maxAbsCents)),missing:rows.reduce((n,r)=>n+r.missing,0),octaves:rows.reduce((n,r)=>n+r.octaves,0),silence,invalid,trajectories,legato:result.legato},null,2));
