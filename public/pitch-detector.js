/* Small replaceable YIN detector. No network, audio devices or UI dependencies. */
(function(root){
 'use strict';
 const midi=hz=>Number.isFinite(hz)&&hz>0?69+12*Math.log2(hz/440):null;
 const filterBanks=new Map();
 // Windowed-sinc low-pass before rate reduction; cache fractional-delay kernels.
 function resample(input,rate,target=16000){
  if(!Number.isFinite(rate)||rate<=0||!Number.isFinite(target)||target<=0)throw new RangeError('Invalid sample rate');
  if(rate===target)return new Float32Array(input);
  const ratio=rate/target,cutoff=Math.min(1,target/rate)*.45,radius=24;
  const key=rate+':'+target;
  if(!filterBanks.has(key)){if(filterBanks.size>=8)filterBanks.clear();filterBanks.set(key,new Map());}
  const bank=filterBanks.get(key),output=new Float32Array(Math.floor(input.length/ratio));
  for(let i=0;i<output.length;i++){
   const at=i*ratio,center=Math.floor(at),phase=Math.round((at-center)*1024);
   let weights=bank.get(phase);
   if(!weights){
    weights=new Float64Array(radius*2+1);
    for(let k=-radius;k<=radius;k++){
     const x=k-phase/1024,z=2*Math.PI*cutoff*x;
     weights[k+radius]=Math.abs(x)>radius?0:(Math.abs(z)<1e-9?2*cutoff:Math.sin(z)/(Math.PI*x))*(.5+.5*Math.cos(Math.PI*x/radius));
    }
    bank.set(phase,weights);
   }
   let sum=0,weight=0;
   for(let k=Math.max(-radius,-center);k<=Math.min(radius,input.length-1-center);k++){
    const w=weights[k+radius];sum+=input[center+k]*w;weight+=w;
   }
   output[i]=weight?sum/weight:0;
  }
  return output;
 }
 function detect(input,rate,options={}){
  const none={frequency:-1,confidence:0,rms:0,candidates:[]};
  if(!input||!Number.isFinite(rate)||rate<8000||input.length<32)return none;
  let mean=0;for(const v of input){if(!Number.isFinite(v))return none;mean+=v;}mean/=input.length;
  let power=0;for(const v of input)power+=(v-mean)**2;
  const rms=Math.sqrt(power/input.length);none.rms=rms;
  if(rms<(options.minRms??.0012))return none;
  // Rate reduction bounds computation without dropping low-frequency periods.
  const data=rate>16000?resample(input,rate):new Float32Array(input),sr=Math.min(rate,16000);
  for(let i=0;i<data.length;i++)data[i]-=mean;
  const minHz=options.minHz??65,maxHz=options.maxHz??1200;
  const lo=Math.max(2,Math.floor(sr/maxHz)),hi=Math.min(Math.ceil(sr/minHz),Math.floor(data.length/2)-2);
  if(hi<=lo+2)return none;
  const count=data.length-hi-1,cmnd=new Float64Array(hi+2);let sum=0;
  cmnd[0]=1;
  for(let lag=1;lag<=hi+1;lag++){
   let d=0;for(let j=0;j<count;j++){const v=data[j]-data[j+lag];d+=v*v;}
   sum+=d;cmnd[lag]=sum>1e-20?d*lag/sum:1;
  }
  const candidates=[];
  for(let lag=lo;lag<=hi;lag++)if(cmnd[lag]<=cmnd[lag-1]&&cmnd[lag]<cmnd[lag+1]){
   const a=cmnd[lag-1],b=cmnd[lag],c=cmnd[lag+1],den=a-2*b+c;
   const offset=den?Math.max(-.5,Math.min(.5,(a-c)/(2*den))):0,hz=sr/(lag+offset);
   if(hz>=minHz&&hz<=maxHz)candidates.push({frequency:hz,confidence:Math.max(0,1-b),cost:b});
  }
  let best=candidates.find(c=>c.cost<(options.threshold??.15))||candidates.reduce((b,c)=>!b||c.cost<b.cost?c:b,null);
  if(!best||best.cost>.25)return none;
  // A strong second harmonic can pass the threshold before the full period.
  const fundamental=candidates.find(candidate=>
   Math.abs(midi(best.frequency)-midi(candidate.frequency)-12)<.5&&
   candidate.cost<.5*best.cost&&candidate.cost+.02<best.cost);
  if(fundamental)best=fundamental;
  return {frequency:best.frequency,confidence:best.confidence,rms,candidates};
 }
 function createTracker(){
  let previous=null,pendingMidi=null,pendingCount=0;
  return {reset(){previous=null;pendingMidi=null;pendingCount=0;},update(result){
   if(!(result.frequency>0)||result.confidence<.75){previous=null;pendingMidi=null;pendingCount=0;return {...result,frequency:-1,confidence:0};}
   let selected=result;
   if(previous!==null){
    const jump=Math.abs(midi(result.frequency)-previous);
    // Fold only ambiguous octave candidates; a strong new fundamental is accepted.
    if(result.confidence<.94&&Math.abs(jump-12)<.65){
     const near=result.candidates?.find(c=>Math.abs(midi(c.frequency)-previous)<.65&&c.confidence>=.85&&c.cost+.025<1-result.confidence);
     if(near){
      const incoming=midi(result.frequency);
      pendingCount=pendingMidi!==null&&Math.abs(incoming-pendingMidi)<.65?pendingCount+1:1;pendingMidi=incoming;
      if(pendingCount<3)selected={...result,frequency:near.frequency,confidence:near.confidence};
     }else {pendingMidi=null;pendingCount=0;}
    }
   }
   if(Math.abs(midi(result.frequency)-(previous??midi(result.frequency)))<.65||result.confidence>=.94){pendingMidi=null;pendingCount=0;}
   previous=midi(selected.frequency);return selected;
  }};
 }
 root.MeldPitchDetector={detect,resample,midi,createTracker};
})(globalThis);
