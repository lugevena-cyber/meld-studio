// Real acoustic piano recordings. Files and attribution are bundled locally.
const GRAND_PIANO_ROOTS=[{midi:21,file:'A0.mp3'},...Array.from({length:7},(_,i)=>[0,3,6,9].map((step,j)=>({midi:(i+2)*12+step,file:['C','Ds','Fs','A'][j]+(i+1)+'.mp3'}))).flat(),{midi:108,file:'C8.mp3'}];
const grandPianoBank={context:null,buffers:new Map(),promise:null,ready:false,loaded:0,error:'',preview:false,timer:null};
function isGrandPianoInstrument(id){return ['piano','brightpiano','warmpiano'].includes(id);}
function grandPianoTrackBase(track){const definition=getInstrumentDefinition(track.instrument);return track.instrumentBase||definition.baseInstrument||definition.id;}
function tracksNeedGrandPiano(tracks){return tracks.some(track=>track.notes?.length&&isGrandPianoInstrument(grandPianoTrackBase(track)));}
function grandPianoPlayable(context){return grandPianoBank.ready&&grandPianoBank.context===context;}
function renderGrandPianoStatus(){
 const output=document.getElementById('grandPianoStatus');if(!output)return;
 const selected=getInstrumentDefinition(state.instrument),base=selected.baseInstrument||selected.id,bank=typeof stringBankFor==='function'&&stringBankFor(base)||grandPianoBank,roots=bank.roots||GRAND_PIANO_ROOTS;
 document.getElementById('grandPianoPanel').hidden=!(isGrandPianoInstrument(base)||(typeof stringBankFor==='function'&&stringBankFor(base)));
 document.getElementById('sampleInstrumentTitle').textContent=(isGrandPianoInstrument(base)?'Grand Piano':bank.id==='guitar-electric'?'Electric Guitar':'Acoustic / Electric Bass')+' · '+selected.name;
 document.getElementById('sampleInstrumentDetail').textContent=isGrandPianoInstrument(base)?'真实琴槌起音、琴弦共鸣与自然余韵':'真实拨弦录音 · 按当前音色调整包络、亮度和效果';
 const credit=document.getElementById('sampleInstrumentCredit');credit.href=isGrandPianoInstrument(base)?'samples/grand-piano/ATTRIBUTION.txt':'samples/strings-ATTRIBUTION.txt';credit.textContent=isGrandPianoInstrument(base)?'Alexander Holm / Salamander · CC BY 3.0':'Karoryfer / VSCO / tonejs-instruments · 采样署名';
 output.textContent=bank.error?`采样未载入：${bank.error}。点击试听可重试。`:bank.ready?`真实录音采样已就绪 · ${roots.length} 个采样音位 · 可用于分轨录制`:`正在准备真实乐器采样 ${bank.loaded} / ${roots.length}…`;
 const embedded=window.MELD_EMBEDDED_SAMPLES?.[bank.id||'grand-piano'];if(bank.ready&&roots.every(root=>typeof embedded?.[root.file]==='string'))output.textContent='内置'+output.textContent;
 const button=document.getElementById('grandPianoAuditionBtn');button.textContent=grandPianoBank.preview?'■ 停止试听':bank.error?'重新载入并试听':isGrandPianoInstrument(base)?'▶ 试听 Grand Piano':'▶ 试听'+selected.name;button.disabled=Boolean(bank.promise)&&!bank.ready;
}
async function prepareGrandPiano(context=getAudioContext()){
 if(grandPianoPlayable(context))return;
 if(grandPianoBank.context!==context){grandPianoBank.context=context;grandPianoBank.buffers.clear();grandPianoBank.loaded=0;grandPianoBank.ready=false;grandPianoBank.promise=null;}
 if(grandPianoBank.promise)return grandPianoBank.promise;
 grandPianoBank.error='';const queue=GRAND_PIANO_ROOTS.filter(root=>!grandPianoBank.buffers.has(root.midi)),errors=[];
 const task=(async()=>{
  await Promise.all(Array.from({length:4},async()=>{while(queue.length){const root=queue.shift();try{const buffer=await loadInstrumentSample('grand-piano',root.file,context);grandPianoBank.buffers.set(root.midi,buffer);grandPianoBank.loaded=grandPianoBank.buffers.size;renderGrandPianoStatus();}catch(error){errors.push(error);}}}));
  if(errors.length)throw errors[0];grandPianoBank.ready=grandPianoBank.buffers.size===GRAND_PIANO_ROOTS.length;
 })();grandPianoBank.promise=task;renderGrandPianoStatus();
 try{await task;}catch(error){grandPianoBank.error=error.message||'请检查钢琴采样文件';throw error;}finally{grandPianoBank.promise=null;renderGrandPianoStatus();if(typeof renderPerformancePanel==='function')renderPerformancePanel();}
}
async function prepareGrandPianoForTracks(tracks,context=getAudioContext()){if(tracksNeedGrandPiano(tracks))await prepareGrandPiano(context);}
const sampledAttackOffsets=new WeakMap();
function sampleAttackOffset(buffer){
 if(sampledAttackOffsets.has(buffer))return sampledAttackOffsets.get(buffer);
 const channels=Array.from({length:buffer.numberOfChannels},(_,i)=>buffer.getChannelData(i));
 const limit=Math.min(buffer.length,Math.round(buffer.sampleRate*.24));
 let peak=0,first=0;
 for(let i=0;i<limit;i++)for(const data of channels)peak=Math.max(peak,Math.abs(data[i]));
 if(peak>0)for(;first<limit;first++)if(channels.some(data=>Math.abs(data[first])>=peak*.014))break;
 const offset=Math.max(0,Math.min(first/buffer.sampleRate-.003,.12));
 sampledAttackOffsets.set(buffer,offset);
 return offset;
}
function sampleRelease(gain,at,duration,level,phraseTail){
 if(phraseTail)gain.exponentialRampToValueAtTime(Math.max(.0001,level*.22),at+duration*.46);
 gain.exponentialRampToValueAtTime(.0001,at+duration);
}
function scheduleMultisampleVoice(instrument,midi,when,duration,params,destination,volume=1,bank=grandPianoBank,roots=GRAND_PIANO_ROOTS,level=.9){
 const context=getAudioContext();if(!bank.ready||bank.context!==context)throw new Error('真实乐器采样尚未准备好');
 const root=roots.reduce((best,candidate)=>Math.abs(candidate.midi-midi)<Math.abs(best.midi-midi)?candidate:best),buffer=bank.buffers.get(root.midi);
 const source=context.createBufferSource(),amp=context.createGain(),filter=context.createBiquadFilter(),dry=context.createGain();
 const rate=Math.pow(2,(midi-root.midi)/12),start=Math.max(context.currentTime+.001,when),length=Math.max(.025,instrument==='mutedguitar'?Math.min(.16,duration):duration),attack=Math.min(length,Math.max(.002,params.attack/1000)),release=Math.max(.08,Math.min(1.5,params.release/1800));
 const offset=params.phraseTail?sampleAttackOffset(buffer):0;
 const peak=level*Math.pow(Math.max(0,Math.min(1,volume)),.85),sustain=peak*(.65+.35*Math.max(0,Math.min(1,params.sustain/100))),keyOff=start+length,end=Math.min(start+(buffer.duration-offset)/rate+.01,keyOff+release+.015);
 source.buffer=buffer;source.playbackRate.setValueAtTime(rate,start);filter.type='lowpass';filter.frequency.setValueAtTime(Math.min(18000,Math.max(900,params.brightness*2.2)),start);filter.Q.value=.45;
 amp.gain.setValueAtTime(.0001,start);amp.gain.linearRampToValueAtTime(Math.max(.0001,peak),start+attack);amp.gain.linearRampToValueAtTime(Math.max(.0001,sustain),Math.min(keyOff,start+attack+Math.max(.02,params.decay/1000)));amp.gain.setValueAtTime(Math.max(.0001,sustain),keyOff);sampleRelease(amp.gain,keyOff,release,sustain,params.phraseTail);
 source.connect(filter);filter.connect(amp);dry.gain.value=1; amp.connect(dry);dry.connect(destination);const cleanup=[source,filter,amp,dry];
 if(params.drive>3){const shaper=context.createWaveShaper();shaper.curve=createDriveCurve(params.drive/4);shaper.oversample='2x';filter.disconnect();filter.connect(shaper);shaper.connect(amp);cleanup.push(shaper);}
 if(params.space>0){const delay=context.createDelay(.5),wet=context.createGain(),feedback=context.createGain();delay.delayTime.value=.14;wet.gain.value=Math.min(.2,params.space/500);feedback.gain.value=.15;amp.connect(delay);delay.connect(wet);wet.connect(destination);delay.connect(feedback);feedback.connect(delay);cleanup.push(delay,wet,feedback);}
 source.onended=()=>{source.meldEnded=true;window.setTimeout(()=>cleanup.forEach(node=>{try{node.disconnect();}catch{}}),350);};source.start(start,offset);source.stop(end);
 const sources=[source];sources.release=(at=context.currentTime)=>{const releaseAt=Math.max(start,at);if(amp.gain.cancelAndHoldAtTime)amp.gain.cancelAndHoldAtTime(releaseAt);else{amp.gain.cancelScheduledValues(releaseAt);amp.gain.setValueAtTime(Math.max(.0001,sustain),releaseAt);}amp.gain.exponentialRampToValueAtTime(.0001,releaseAt+release);try{source.stop(Math.min(end,releaseAt+release+.015));}catch{}};return sources;
}
function scheduleGrandPianoVoice(...args){return scheduleMultisampleVoice(...args);}
function stopGrandPianoAudition(){window.clearTimeout(grandPianoBank.timer);grandPianoBank.preview=false;renderGrandPianoStatus();}
async function auditionGrandPiano(){
 if(grandPianoBank.preview){stopMelodyPlayback();return;}
 stopArrangementPlayback(false);stopMaterialOriginal();stopMelodyPlayback();stopLabPlayback();
 const context=getAudioContext(),token=state.melodyLoadToken=(state.melodyLoadToken||0)+1;
 const instrument=state.instrument,definition=getInstrumentDefinition(instrument),base=definition.baseInstrument||definition.id;
 try{await prepareSampledInstrument(base,context);}catch(error){showToast(error.message);return;}if(token!==state.melodyLoadToken||instrument!==state.instrument)return;
 const params={...LAB_DEFAULTS[base],...(definition.params||{})};
 const notes=stringBankFor(base)?(base.includes('bass')?[[40,0,.45],[40,.75,.2],[43,1,.45],[45,1.75,.2],[47,2,.45],[43,2.75,.2],[40,3,.7],[40,4,.45],[43,4.75,.2],[45,5,.45],[47,5.75,.2],[40,6,1.6]]:[[52,0,.18],[59,0,.18],[64,0,.18],[55,.75,.18],[62,.75,.18],[67,.75,.18],[57,1.5,.18],[64,1.5,.18],[69,1.5,.18],[59,2.25,.3],[66,2.25,.3],[71,2.25,.3],[64,3,.6],[67,4,.4],[69,4.75,.4],[71,5.5,.4],[76,6,1.5]]):[[48,0,1.2],[60,.35,.7],[64,.7,.7],[67,1.05,.8],[72,1.4,1.3],[53,2,1.8],[60,2,1.8],[65,2,1.8],[69,2,1.8],[55,4,1.6],[62,4,1.6],[67,4,1.6],[71,4,1.6],[48,6,2],[60,6,2],[64,6,2],[67,6,2],[72,6,2]];
 const now=context.currentTime+.06;for(const [midi,time,length]of notes)state.playNodes.push(...schedulePatchVoice(base,midi,now+time,length,params,context.destination,.72));
 grandPianoBank.preview=true;renderGrandPianoStatus();grandPianoBank.timer=window.setTimeout(()=>{stopGrandPianoAudition();},9300);
}
function setupGrandPiano(){
 document.getElementById('grandPianoAuditionBtn').addEventListener('click',auditionGrandPiano);renderGrandPianoStatus();
 try{if(!audioContext)audioContext=new (window.AudioContext||window.webkitAudioContext)();prepareGrandPiano(audioContext).catch(()=>{});}catch(error){grandPianoBank.error=error.message;renderGrandPianoStatus();}
}
