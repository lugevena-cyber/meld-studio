/* Monophonic vocal analysis shared by microphone takes and uploaded audio. */
(function(root){
  'use strict';
  const median=values=>{const s=[...values].sort((a,b)=>a-b);return s[Math.floor(s.length/2)];};
  const profiles = {
    vocal: {label:'人声哼唱', family:'vocal', hint:'以连贯音高为主，保留自然延音与颤音。', half:.024, minNote:.044, minFrames:3, stableFrames:3, stableTime:.018, valley:.45, rebound:1.9, refractory:.075, quietGap:.018},
    guitar: {label:'吉他拨弦', family:'instrument', hint:'用“当、噔、哒”模仿拨弦；每次发音取第一个稳定音高，延音不拆成碎音。', half:.024, minNote:.028, minFrames:2, stableFrames:2, stableTime:.009, valley:.72, rebound:1.3, refractory:.055, quietGap:.012, attackRatio:1.45, attackWindow:.085},
    mutedguitar: {label:'闷音 / Funk 吉他', family:'instrument', hint:'用“咔、嚓、噔”表现闷音；每次发音保留一次起音，纯闷音先标记节奏。', half:.022, minNote:.025, minFrames:2, stableFrames:2, stableTime:.009, valley:.8, rebound:1.22, refractory:.045, quietGap:.012, attackRatio:1.35, attackWindow:.07, release:.42},
    bass: {label:'贝斯律动', family:'instrument', hint:'用“嘟、崩、咚”模仿贝斯；平衡低音稳定度与重复触弦，不自动移低八度。', half:.032, minNote:.038, minFrames:3, stableFrames:3, stableTime:.018, valley:.65, rebound:1.4, refractory:.065, quietGap:.018, attackRatio:1.5, attackWindow:.09},
    keyboard: {label:'键盘敲击', family:'instrument', hint:'用“叮、当、哒”表现琴键起音，连续敲同一音也分别保留。', half:.024, minNote:.028, minFrames:2, stableFrames:2, stableTime:.009, valley:.7, rebound:1.35, refractory:.055, quietGap:.012, attackRatio:1.5, attackWindow:.075},
    wind: {label:'吹管连奏', family:'instrument', hint:'用“呜、嘟”表现吹管连奏；保留气息延音，减少把颤动切成碎音。', half:.028, minNote:.05, minFrames:3, stableFrames:3, stableTime:.02, valley:.38, rebound:2.1, refractory:.09, quietGap:.025}
  };
  for(const [id,cfg] of Object.entries(profiles))cfg.id=id;
  function profile(id='vocal'){return Object.prototype.hasOwnProperty.call(profiles,id)?profiles[id]:profiles.vocal;}
  function rms(data,from=0,to=data.length){let sum=0;for(let i=from;i<to;i++)sum+=data[i]*data[i];return Math.sqrt(sum/Math.max(1,to-from));}
  function detectPitchLegacy(buffer,sampleRate){
    const level=rms(buffer),none={frequency:-1,confidence:0,rms:level};
    if(level<.0012)return none;
    const minLag=Math.max(2,Math.floor(sampleRate/1200)),maxLag=Math.min(Math.floor(sampleRate/65),Math.floor(buffer.length/2)-1);
    if(maxLag<=minLag+2)return none;
    const count=buffer.length-maxLag,difference=new Float64Array(maxLag+1),normalized=new Float64Array(maxLag+1);
    let sum=0,best=-1;
    // Include lags below the vocal range in the cumulative normalization.
    for(let lag=1;lag<=maxLag;lag++){
      let d=0;for(let i=0;i<count;i+=2){const v=buffer[i]-buffer[i+lag];d+=v*v;}
      difference[lag]=d;sum+=d;normalized[lag]=sum>1e-20?d*lag/sum:1;
    }
    // The first reliable trough is the fundamental; later multiples cause octave drops.
    for(let lag=minLag;lag<maxLag;lag++)if(normalized[lag]<.18){while(lag+1<=maxLag&&normalized[lag+1]<normalized[lag])lag++;best=lag;break;}
    if(best<0){for(let lag=minLag;lag<=maxLag;lag++)if(best<0||normalized[lag]<normalized[best])best=lag;if(normalized[best]>.3)return none;}
    const a=normalized[best-1],b=normalized[best],c=normalized[best+1]??b,den=a-2*b+c;
    const offset=den?Math.max(-.5,Math.min(.5,(a-c)/(2*den))):0,frequency=sampleRate/(best+offset);
    return frequency>=65&&frequency<=1200?{frequency,confidence:Math.max(0,1-b),rms:level}:none;
  }
  function detectPitch(buffer,sampleRate){
    if(root.MELD_PITCH_CONFIG?.legacy||!root.MeldPitchDetector)return detectPitchLegacy(buffer,sampleRate);
    return root.MeldPitchDetector.detect(buffer,sampleRate);
  }
  function* frames(mono,sampleRate=16000,profileId='vocal'){
    const cfg=profile(profileId);
    const hop=Math.round(sampleRate*.01),half=Math.round(sampleRate*(root.MELD_PITCH_CONFIG?.legacy?cfg.half:(cfg.family==='vocal'?Math.max(cfg.half,.032):cfg.half))),shortHalf=Math.round(sampleRate*.005),frame=new Float32Array(half*2);
    const tracker=root.MeldPitchDetector?.createTracker();
    let peak=0;for(let i=0;i<mono.length;i+=hop)peak=Math.max(peak,rms(mono,i,Math.min(mono.length,i+hop)));
    const gate=Math.max(.0012,Math.min(.006,peak*.025));
    let localPeak=0,valley=null,lastOnset=-1,lastVoiced=-1,previousLevel=0,averageLevel=0,averageBrightness=.01;
    for(let center=0;center<mono.length;center+=hop){
      const t=center/sampleRate,level=rms(mono,Math.max(0,center-shortHalf),Math.min(mono.length,center+shortHalf));
      frame.fill(0);const from=Math.max(0,center-half),to=Math.min(mono.length,center+half);frame.set(mono.subarray(from,to),from-center+half);
      let pitch=level>=gate?detectPitch(frame,sampleRate):{frequency:-1,confidence:0};
      if(tracker&&!root.MELD_PITCH_CONFIG?.legacy)pitch=tracker.update(pitch);
      let onset=false,brightness=0,power=0;
      if(cfg.attackRatio){for(let i=Math.max(1,center-shortHalf);i<Math.min(mono.length,center+shortHalf);i++){const d=mono[i]-mono[i-1];brightness+=d*d;power+=mono[i]*mono[i];}brightness/=Math.max(1e-12,power);}

      if(level>=gate){
        if(t-lastVoiced>.025){onset=true;localPeak=level;valley=null;}
        else{
          localPeak=Math.max(level,localPeak*.997);
          if(level<localPeak*cfg.valley&&(!valley||level<valley.level))valley={level,t};
          if(valley&&t-valley.t>.008&&t-valley.t<.14&&level>Math.max(gate*1.5,valley.level*cfg.rebound,localPeak*.55)&&t-lastOnset>cfg.refractory){onset=true;valley=null;localPeak=level;}
          if(valley&&t-valley.t>=.14)valley=null;
        }
        lastVoiced=t;
      }
      if(cfg.attackRatio&&t-lastOnset>=cfg.refractory&&level>gate*2.5&&
        ((level>previousLevel*cfg.attackRatio&&level>averageLevel*1.2)||(brightness>.35&&brightness>averageBrightness*2.2&&level>averageLevel*.9)))onset=true;
      if(onset)lastOnset=t;
      previousLevel=level;averageLevel=averageLevel*.8+level*.2;averageBrightness=averageBrightness*.85+brightness*.15;
      const midi=pitch.frequency>0?69+12*Math.log2(pitch.frequency/440):null;
      yield {t,midi,rounded:midi===null?null:Math.round(midi),confidence:pitch.confidence,rms:level,onset,strength:Math.min(1,level/Math.max(gate,peak)),frameStep:hop/sampleRate};
    }
  }
  function stabilize(samples){
    return samples.map((sample,i)=>{
      const prev=samples[i-1],next=samples[i+1];
      // Remove only an isolated 10 ms spike. Keep real short runs and octave leaps.
      if(sample.midi!==null&&prev?.midi!=null&&next?.midi!=null&&!sample.onset&&!next.onset&&next.t-prev.t<=.027&&Math.abs(prev.midi-next.midi)<.45&&Math.abs(sample.midi-(prev.midi+next.midi)/2)>1.5){const midi=(prev.midi+next.midi)/2;return {...sample,midi,rounded:Math.round(midi)};}
      return {...sample};
    });
  }
  function prepareAttacks(input,cfg){
    const samples=input.map(s=>({...s})),rhythmHits=[];
    if(!cfg.attackRatio)return {samples,rhythmHits};
    for(let i=0;i<samples.length;i++){
      const attack=samples[i];if(!attack.onset||attack.attackTime!==undefined)continue;
      let voiced=-1;
      for(let j=i;j<samples.length&&samples[j].t-attack.t<=cfg.attackWindow;j++){
        if(j>i&&samples[j].onset)break;
        const p=samples[j],next=samples[j+1];
        if(p.midi!==null&&p.confidence>=.55&&next?.midi!=null&&next.confidence>=.55&&Math.abs(p.midi-next.midi)<1){voiced=j;break;}
      }
      if(voiced>=0){samples[voiced].onset=true;samples[voiced].attackTime=attack.t;}
      else{
        // Only a bounded percussive burst becomes an unpitched rhythm marker.
        // Never manufacture a MIDI pitch from a consonant or background noise.
        const span=[];let peak=attack.rms||0,end=null;
        for(let j=i;j<samples.length&&samples[j].t-attack.t<=.18;j++){
          const f=samples[j];if(j>i&&f.onset){end=f.t;break;}peak=Math.max(peak,f.rms||0);span.push(f);
          if(j>i&&(f.rms||0)<peak*.42){end=f.t;break;}
        }
        if(end!==null&&end-attack.t>=.012&&span.filter(f=>(f.rms||0)>=peak*.42).length>=2)
          rhythmHits.push({start:attack.t,duration:Math.max(.025,Math.min(.16,end-attack.t)),strength:attack.strength||.5});
      }
    }
    return {samples,rhythmHits};
  }
  function segmentCore(samples,cfg){
    const notes=[],chunks=[];let chunk=[],previous=null,quietAt=null;
    const maxLevel=Math.max(.0001,...samples.map(s=>s.rms||0));
    for(const sample of samples){
      if(sample.midi===null||!Number.isFinite(sample.midi)||sample.confidence<.55){quietAt??=sample.t;continue;}
      const gap=previous?sample.t-previous.t:0,boundary=sample.attackTime??sample.t;
      const split=chunk.length&&(gap>.045||(quietAt!==null&&sample.t-quietAt>=cfg.quietGap)||(sample.onset&&boundary-(chunk[0].attackTime??chunk[0].t)>=cfg.minNote));
      if(split){chunks.push({samples:chunk,end:Math.min(quietAt??boundary,boundary)});chunk=[];}
      chunk.push(sample);previous=sample;quietAt=null;
    }
    if(chunk.length)chunks.push({samples:chunk,end:quietAt??chunk.at(-1).t+(chunk.at(-1).frameStep||.01)/2});
    const hasSparseVocalPair=(first,second)=>cfg.family==='vocal'&&second?.frameStep>=.02&&
      second.t-first.t>=.02&&second.t-first.t<=.045;
    for(const part of chunks){
      let current=[part.samples[0]],candidate=[],currentMidi=Math.round(current[0].midi),start=current[0].attackTime??current[0].t;
      const commit=givenEnd=>{
        let end=givenEnd;const level=Math.max(0,...current.map(f=>f.rms||0));
        if(cfg.release&&level>0){const peakIndex=current.findIndex(f=>f.rms===level),tail=current.slice(peakIndex+1);for(let i=0;i<tail.length-1;i++)if(tail[i].rms<level*cfg.release&&tail[i+1].rms<level*cfg.release){end=Math.min(end,tail[i].t+.005);break;}}
        const enoughFrames=current.length>=cfg.minFrames||hasSparseVocalPair(current[0],current[1]);
        if(end-start<cfg.minNote-.0001||!enoughFrames)return;
        const midi=Math.round(median(current.map(s=>s.midi))),confidence=current.reduce((n,s)=>n+s.confidence,0)/current.length;
        notes.push({midi,start,duration:end-start,confidence,...(cfg.family==='instrument'?{velocity:Math.max(.25,Math.min(1,.25+.7*level/maxLevel))}:{})});
      };
      for(const sample of part.samples.slice(1)){
        const midi=Math.round(sample.midi);
        if(midi===currentMidi||Math.abs(sample.midi-currentMidi)<.62){current.push(sample);candidate=[];continue;}
        if(!candidate.length||Math.round(candidate[0].midi)!==midi)candidate=[];
        candidate.push(sample);
        // The recording fallback uses sparse live frames instead of the 10 ms offline hop.
        const candidateSpan=sample.t-candidate[0].t;
        const sparseVocalFrames=candidate.length===2&&hasSparseVocalPair(candidate[0],sample);
        if((candidate.length>=cfg.stableFrames||sparseVocalFrames)&&candidateSpan>=cfg.stableTime){
          commit(candidate[0].t);start=candidate[0].t;currentMidi=midi;current=candidate;candidate=[];
        }
      }
      commit(part.end);
    }
    return notes.map(note=>({...note,midi:Math.max(24,Math.min(96,note.midi))}));
  }
  function syllableOnsets(samples){
    // Re-arm only after silence or a substantial dip, not changes in pitch/timbre.
    const peak=Math.max(.0001,...samples.map(s=>s.rms||0)),gate=Math.max(.0012,Math.min(.006,peak*.025));
    const starts=[];let lastOnset=-Infinity,quietAt=null,localPeak=0,valley=null;
    for(let i=0;i<samples.length;i++){
      const sample=samples[i],level=sample.rms||0,t=sample.t;
      if(level<gate){quietAt??=t;continue;}
      const silence=quietAt===null?0:t-quietAt;
      let onset=!starts.length||(silence>=.009&&t-lastOnset>=.055);
      if(!onset){
        localPeak=Math.max(level,localPeak*.999);
        if(level<localPeak*.45&&(!valley||level<valley.level))valley={level,t};
        if(valley&&t-valley.t>=.015&&t-valley.t<.2&&level>Math.max(gate*2,valley.level*1.8,localPeak*.65)&&t-lastOnset>=.11)onset=true;
        if(valley&&t-valley.t>=.2)valley=null;
      }
      if(onset){starts.push(i);lastOnset=t;localPeak=level;valley=null;}
      quietAt=null;
    }
    return {starts,gate,peak};
  }
  function vocalBodyPitch(samples,start,end,gate,level){
    const voiced=samples.filter(f=>Number.isFinite(f.midi)&&f.confidence>=.72&&f.rms>=Math.max(gate,level*.15));
    if(voiced.length<3)return null;
    const body=voiced.filter(f=>f.t>=start+.045&&f.t<=end-.025&&f.rms>=level*.24);
    const region=body.length>=3?body:voiced;
    // Use the actual pitch of the sustained voice before rounding to a key.
    // The first few voiced frames can still be sliding into the intended note.
    const frequencies=region.map(f=>440*2**((f.midi-69)/12)).sort((a,b)=>a-b);
    const middle=Math.floor(frequencies.length/2);
    const frequency=frequencies.length%2?frequencies[middle]:(frequencies[middle-1]+frequencies[middle])/2;
    return {
      midi:Math.max(24,Math.min(96,Math.round(69+12*Math.log2(frequency/440)))),
      confidence:region.reduce((sum,f)=>sum+f.confidence,0)/region.length
    };
  }
  function segmentSyllables(samples,cfg){
    const {starts,gate,peak}=syllableOnsets(samples),notes=[],rhythmHits=[];
    for(let index=0;index<starts.length;index++){
      const from=starts[index],to=starts[index+1]??samples.length,start=samples[from].t,part=samples.slice(from,to);
      const active=part.filter(f=>(f.rms||0)>=gate);if(!active.length)continue;
      let end=Math.min(samples[to]?.t??Infinity,active.at(-1).t+(active.at(-1).frameStep||.01)/2);
      const level=Math.max(...active.map(f=>f.rms||0));
      if(cfg.family==='vocal'&&!root.MELD_PITCH_CONFIG?.legacy){
        const pitch=vocalBodyPitch(part,start,end,gate,level);
        if(pitch&&end-start>=cfg.minNote-.0001)notes.push({...pitch,start,duration:end-start});
        else if(!pitch&&active.length>=2&&end-start>=.012&&end-start<=.18)
          rhythmHits.push({start,duration:Math.max(.025,end-start),strength:Math.min(1,level/peak)});
        continue;
      }
      // Plucked instruments and legacy recognition retain the first stable cluster.
      let stable=[],picked=null;
      for(const f of part){
        if(f.t-start>.14)break;
        if(f.midi===null||!Number.isFinite(f.midi)||f.confidence<.65){stable=[];continue;}
        const prev=stable.at(-1);
        if(prev&&(f.t-prev.t>.025||Math.abs(f.midi-prev.midi)>.65))stable=[];
        stable.push(f);
        if(stable.length>=3&&f.t-stable[0].t>=.018){picked=stable.slice(0,4);break;}
      }
      if(!picked){
        if(active.length>=2&&end-start>=.012&&end-start<=.18)
          rhythmHits.push({start,duration:Math.max(.025,end-start),strength:Math.min(1,Math.max(...active.map(f=>f.rms||0))/peak)});
        continue;
      }
      if(cfg.release){const peakIndex=part.findIndex(f=>f.rms===level),tail=part.slice(peakIndex+1);for(let i=0;i<tail.length-1;i++)if(tail[i].rms<level*cfg.release&&tail[i+1].rms<level*cfg.release){end=Math.min(end,tail[i].t+.005);break;}}
      if(end-start<cfg.minNote-.0001)continue;
      const midi=Math.max(24,Math.min(96,Math.round(median(picked.map(f=>f.midi))))),confidence=picked.reduce((n,f)=>n+f.confidence,0)/picked.length;
      notes.push({midi,start,duration:end-start,confidence,...(cfg.family==='instrument'?{velocity:Math.max(.25,Math.min(1,.25+.7*level/peak))}:{})});
    }
    return {notes,rhythmHits};
  }
  function analyze(samples,profileId='vocal',options={}){
    const cfg=profile(profileId),clean=stabilize(samples);
    const onsetFirst=options.onsetFirst??cfg.family==='instrument';
    if(onsetFirst&&clean.some(f=>Number.isFinite(f.rms)&&f.rms>0))return segmentSyllables(clean,cfg);
    const prepared=prepareAttacks(clean,cfg),notes=segmentCore(prepared.samples,cfg);
    const rhythmHits=prepared.rhythmHits.filter(hit=>!notes.some(note=>Math.abs(note.start-hit.start)<.035));
    return {notes,rhythmHits};
  }
  function segment(samples,profileId='vocal',options={}){return analyze(samples,profileId,options).notes;}
  const api={detectPitch,detectPitchLegacy,frames,stabilize,segment,analyze,profiles,profile,rms};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.MeldPitchAnalysis=api;
})(typeof window==='undefined'?globalThis:window);
