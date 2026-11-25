// Synthesized kits and the recorded CC0 drum pieces from the sample library.
const RECORDED_DRUM_ID = 'sample-funk-kit';
const RECORDED_DRUMS = {
 36: {file:'heavy-kick.flac', level:.38},
 38: {file:'hard-snare.flac', level:.27},
 42: {file:'closed-hi-hat.flac', level:.14},
 37: {file:'tr808-rimshot.wav', level:.27},
 39: {file:'tr808-clap.wav', level:.22},
 46: {file:'tr808-open-hat.wav', level:.12},
};
const recordedDrumBanks = new WeakMap();
const DRUM_KITS = {
 [RECORDED_DRUM_ID]:{name:'真实采样鼓组',en:'RECORDED DRUM KIT',desc:'底鼓 · 军鼓 · 闭镲 · 808 边击、拍手与开镲',color:'#e7b189',kick:0,tail:0,tone:1},
 drumkit:{name:'流行原声鼓组',en:'POP ACOUSTIC KIT',desc:'结实底鼓 · 木质军鼓',color:'#d5b082',kick:155,tail:.32,tone:1},
 drum80:{name:'复古 80s 鼓机',en:'80s POP DRUM MACHINE',desc:'紧实底鼓 · 清脆军鼓与拍手',color:'#e8a18f',kick:145,tail:.27,tone:1.25},
 drum808:{name:'808 风格电子鼓',en:'808 STYLE ELECTRONIC',desc:'长尾低鼓 · 轻脆镲片',color:'#a8d7ae',kick:125,tail:.7,tone:.85},
 drum909:{name:'909 风格舞曲鼓',en:'909 STYLE DANCE KIT',desc:'硬朗击打 · 明亮开镲',color:'#aabfe6',kick:175,tail:.36,tone:1.45},
};
for(const [id,kit] of Object.entries(DRUM_KITS)) {
 EXTRA_INSTRUMENTS.push({id,...kit,icon:'<svg viewBox="0 0 28 28" aria-hidden="true"><ellipse cx="14" cy="11" rx="10" ry="4"/><path d="M4 11v10c0 5 20 5 20 0V11M8 14v8M20 14v8M6 3l12 8M22 3l-6 8"/></svg>'});
 EXTRA_LAB_DEFAULTS[id]={attack:5,decay:220,sustain:8,release:180,brightness:6000,space:id==='drum80'?16:7,drive:id==='drum909'?9:2};
 EXTRA_LAB_PRESETS.push({id:`${id}-preset`,instrument:id,name:kit.name,meta:`${kit.en} · GROOVE`,short:'鼓组与鼓机',params:EXTRA_LAB_DEFAULTS[id]});
}
const DRUM_PADS=[
 {midi:36,name:'底鼓',key:'A'},{midi:38,name:'军鼓',key:'S'},{midi:39,name:'拍手',key:'E'},
 {midi:42,name:'闭镲',key:'D'},{midi:46,name:'开镲',key:'T'},{midi:45,name:'低嗵鼓',key:'F'},
 {midi:50,name:'高嗵鼓',key:'G'},{midi:49,name:'吊镲',key:'H'},{midi:51,name:'叮叮镲',key:'J'},
 {midi:54,name:'沙锤',key:'U'},{midi:56,name:'牛铃',key:'Y'},{midi:37,name:'边击',key:'W'},
];
const DRUM_KEY_MAP=Object.fromEntries(DRUM_PADS.map(pad=>[pad.key.toLowerCase(),pad.midi]));
DRUM_KEY_MAP.k=36;
const DRUM_PITCH_ALIASES=[36,37,38,39,42,45,46,50,56,49,54,51];
const drumNoiseBuffers=new WeakMap();
function isDrumInstrument(id){return Boolean(DRUM_KITS[id]);}
function drumMidi(midi){return DRUM_PADS.some(pad=>pad.midi===midi)?midi:DRUM_PITCH_ALIASES[((Math.round(midi)-60)%12+12)%12];}
function drumName(midi){return DRUM_PADS.find(pad=>pad.midi===drumMidi(midi))?.name||'打击乐';}
function drumKitFromTrack(track){if(!track)return null;const definition=getInstrumentDefinition(track.instrument);const id=track.instrumentBase||definition.baseInstrument||definition.id;return isDrumInstrument(id)?id:null;}
function drumPadsForKit(id) {
 return id===RECORDED_DRUM_ID ? DRUM_PADS.filter(pad=>Object.hasOwn(RECORDED_DRUMS,pad.midi)) : DRUM_PADS;
}
function recordedDrumsReady(context) {return Boolean(recordedDrumBanks.get(context)?.buffers);}
function prepareRecordedDrums(context) {
 const existing=recordedDrumBanks.get(context);
 if(existing)return existing.promise;
 const entry={buffers:null,promise:null};
 entry.promise=Promise.all(Object.entries(RECORDED_DRUMS).map(async ([midi,piece])=>{
  const bytes=await fetchArrangementSample('open-samples/'+piece.file,piece.file,5000);
  const buffer=await context.decodeAudioData(bytes);
  return [Number(midi),buffer];
 })).then(buffers=>{entry.buffers=new Map(buffers);}).catch(error=>{
  recordedDrumBanks.delete(context);
  throw error;
 });
 recordedDrumBanks.set(context,entry);
 return entry.promise;
}
function scheduleRecordedDrum(midi,when,params,destination,volume) {
 const context=getAudioContext(),note=drumMidi(midi);
 const pitch=Object.hasOwn(RECORDED_DRUMS,note)?note:[45,50].includes(note)?36:[37,39,56].includes(note)?38:42;
 const buffer=recordedDrumBanks.get(context)?.buffers?.get(pitch);
 if(!buffer)return [];
 const source=context.createBufferSource(),gain=context.createGain();
 const start=Math.max(context.currentTime+.001,when);
 const end=start+buffer.duration,peak=RECORDED_DRUMS[pitch].level*volume;
 source.buffer=buffer;
 gain.gain.setValueAtTime(.0001,start);
 gain.gain.linearRampToValueAtTime(Math.max(.0001,peak),start+.0015);
 gain.gain.setValueAtTime(Math.max(.0001,peak),Math.max(start+.0015,end-.012));
 gain.gain.linearRampToValueAtTime(.0001,end);
 source.connect(gain);
 gain.connect(destination);
 source.onended=()=>{source.meldEnded=true;source.disconnect();gain.disconnect();};
 source.start(start);
 const voices=[source];
 voices.release=()=>{};
 return voices;
}
function getDrumNoise(context){
 if(drumNoiseBuffers.has(context))return drumNoiseBuffers.get(context);
 const buffer=context.createBuffer(1,Math.floor(context.sampleRate),context.sampleRate),data=buffer.getChannelData(0);let seed=782341;
 for(let i=0;i<data.length;i++){seed=(1664525*seed+1013904223)>>>0;data[i]=seed/2147483648-1;}
 drumNoiseBuffers.set(context,buffer);return buffer;
}
function scheduleDrumVoice(kitId,midi,when,duration,params,destination,volume=1){
 if(kitId===RECORDED_DRUM_ID)return scheduleRecordedDrum(midi,when,params,destination,volume);
 const context=getAudioContext(),kit=DRUM_KITS[kitId]||DRUM_KITS.drumkit,note=drumMidi(midi),sources=[],cleanup=[];
 const bus=context.createGain();bus.gain.value=.5*volume;cleanup.push(bus);
 let out=bus;
 if(params.drive>0){const drive=context.createWaveShaper();drive.curve=createDriveCurve(params.drive*.18);drive.oversample='2x';bus.connect(drive);out=drive;cleanup.push(drive);}
 out.connect(destination);
 const scale=Math.max(.3,Math.min(2.5,(params.decay||220)/220)),brightness=Math.max(.2,Math.min(1.5,(params.brightness||6000)/6000));
 const attack=Math.max(.002,Math.min(.025,(params.attack||5)/1000));
 const envelope=(tail,peak)=>{const gain=context.createGain();gain.gain.setValueAtTime(.0001,when);gain.gain.exponentialRampToValueAtTime(Math.max(.001,peak),when+attack);gain.gain.exponentialRampToValueAtTime(.0001,when+Math.max(attack+.01,tail*scale));gain.connect(bus);cleanup.push(gain);return gain;};
 const tone=(type,frequency,endFrequency,tail,peak)=>{const osc=context.createOscillator(),amp=envelope(tail,peak);osc.type=type;osc.frequency.setValueAtTime(frequency,when);if(endFrequency)osc.frequency.exponentialRampToValueAtTime(endFrequency,when+Math.min(.15,tail*scale*.7));osc.connect(amp);osc.start(when);osc.stop(when+Math.max(attack+.03,tail*scale)+.03);sources.push(osc);return osc;};
 const noise=(tail,peak,filterType,frequency,q=.7)=>{const source=context.createBufferSource(),filter=context.createBiquadFilter(),amp=envelope(tail,peak);source.buffer=getDrumNoise(context);source.loop=true;filter.type=filterType;filter.frequency.value=Math.min(context.sampleRate*.44,frequency*brightness);filter.Q.value=q;source.connect(filter);filter.connect(amp);source.start(when);source.stop(when+Math.max(attack+.03,tail*scale)+.03);sources.push(source);cleanup.push(filter);return amp;};
 if(note===36){tone('sine',kit.kick,kitId==='drum808'?42:48,kit.tail,.85);noise(.026,.11,'lowpass',1700);}
 else if(note===38){noise(kitId==='drum80'?.2:.15,.5,'highpass',1300*kit.tone);tone('triangle',195,125,.12,.28);}
 else if(note===39){const amp=noise(.19,.5,'bandpass',1700*kit.tone,.8);amp.gain.cancelScheduledValues(when);amp.gain.setValueAtTime(.0001,when);for(const t of [0,.014,.029]){amp.gain.setValueAtTime(.0001,when+t);amp.gain.linearRampToValueAtTime(.42,when+t+.003);amp.gain.exponentialRampToValueAtTime(.001,when+t+.012);}amp.gain.setValueAtTime(.22,when+.045);amp.gain.exponentialRampToValueAtTime(.0001,when+.2*scale);}
 else if(note===42||note===46){noise(note===42?.055:.32,.24,'highpass',6500*kit.tone);if(kitId==='drum909'){tone('square',6400,0,note===42?.04:.2,.025);tone('square',8370,0,note===42?.04:.18,.02);}}
 else if(note===45||note===50){const f=note===45?125:220;tone('sine',f,f*.62,.25,.65);noise(.025,.05,'bandpass',1700);}
 else if(note===49||note===51){noise(note===49?.85:.55,.29,'highpass',note===49?4200:6300);tone('triangle',note===49?3100:4700,0,.35,.03);}
 else if(note===54)noise(.075,.3,'highpass',5400);
 else if(note===56){tone('square',540,0,.17,.16);tone('square',805,0,.13,.12);}
 else if(note===37){tone('sine',1700,1100,.055,.23);tone('triangle',900,0,.045,.1);}
 if(params.space>0){const delay=context.createDelay(.5),wet=context.createGain();delay.delayTime.value=.11;wet.gain.value=Math.min(.22,params.space/180);out.connect(delay);delay.connect(wet);wet.connect(destination);cleanup.push(delay,wet);}
 let remaining=sources.length;sources.forEach(source=>{source.onended=()=>{source.meldEnded=true;if(--remaining===0)[...sources,...cleanup].forEach(node=>{try{node.disconnect();}catch{}});};});
 sources.release=()=>{};return sources;
}

const DRUM_STEP_ROWS=[36,38,39,42,46,54];
const DRUM_PATTERNS={
 funk:{36:[0,6,8,11],38:[4,12],42:[0,2,4,6,8,10,12,14],46:[7,15],54:[2,6,10,14]},
 pop80:{36:[0,7,8,10],38:[4,12],39:[4,12],42:[0,2,4,6,8,10,12,14],54:[2,6,10,14]},
 dance:{36:[0,4,8,12],38:[4,12],39:[4,12],42:[0,4,8,12],46:[2,6,10,14]},
};
function drumBarPosition(){const beat=Math.max(1,Number(performanceElement('arrangeRecordBeat').value)||1);return {offset:(beat-1)*60/arrangement.baseBpm,grid:60/arrangement.baseBpm/4};}
function renderDrumSequencer(){
 const panel=performanceElement('drumStepPanel'),track=selectedPerformanceTrack(),kit=drumKitFromTrack(track);panel.hidden=!kit;
 if(!kit)return;
 const {offset,grid}=drumBarPosition(),disabled=performanceInput.recording?'disabled':'';
 const rows=kit===RECORDED_DRUM_ID?DRUM_STEP_ROWS.filter(midi=>Object.hasOwn(RECORDED_DRUMS,midi)):DRUM_STEP_ROWS;
 const activeSteps=new Map(rows.map(midi=>[midi,[]]));
 const html=rows.map(midi=>`<div class="drum-step-row"><span>${drumName(midi)}</span>${Array.from({length:16},(_,step)=>{
 const active=track.notes.some(note=>drumMidi(note.midi)===midi&&Math.abs(note.start-(offset+step*grid))<grid*.2);
 if(active)activeSteps.get(midi).push(step);
 return `<button type="button" class="drum-step ${active?'active':''} ${step%4===0?'beat-start':''}" data-drum-step="${step}" data-drum-midi="${midi}" aria-label="${drumName(midi)} 第 ${step+1} 步" aria-pressed="${active}" ${disabled}>${step+1}</button>`;
 }).join('')}</div>`).join('');
 const lanes=performanceElement('drumStepLanes');if(lanes.innerHTML!==html)lanes.innerHTML=html;
 panel.querySelectorAll('[data-drum-pattern],#previewDrumBar').forEach(button=>button.disabled=Boolean(performanceInput.recording));
 for(const button of panel.querySelectorAll('[data-drum-pattern]:not([data-drum-pattern="clear"])')){
  const pattern=DRUM_PATTERNS[button.dataset.drumPattern];
  const matches=rows.every(midi=>String(activeSteps.get(midi))===String(pattern[midi]||[]));
  button.setAttribute('aria-pressed',String(matches));
 }
}
function storeDrumEdit(track,before){performanceInput.history.push({trackId:track.id,before});if(performanceInput.history.length>100)performanceInput.history.shift();track.notes.sort((a,b)=>a.start-b.start||a.midi-b.midi);persistArrangement();renderArrangement();}
function toggleDrumStep(midi,step){
 const track=selectedPerformanceTrack();if(!track||!drumKitFromTrack(track)||performanceInput.recording)return;
 const before=track.notes.map(note=>({...note})),{offset,grid}=drumBarPosition(),start=offset+step*grid;
 const matches=note=>drumMidi(note.midi)===midi&&Math.abs(note.start-start)<grid*.2;
 if(track.notes.some(matches))track.notes=track.notes.filter(note=>!matches(note));else track.notes.push({midi,start,duration:grid*.8,confidence:1,manualEdited:true});
 storeDrumEdit(track,before);
}
function applyDrumPattern(pattern){
 const track=selectedPerformanceTrack(),kit=drumKitFromTrack(track);if(!kit||performanceInput.recording)return;
 const before=track.notes.map(note=>({...note})),{offset,grid}=drumBarPosition();
 track.notes=track.notes.filter(note=>note.start<offset-.001||note.start>=offset+16*grid-.001);
 for(const [midi,steps] of Object.entries(DRUM_PATTERNS[pattern]||{})){
  if(kit===RECORDED_DRUM_ID&&!Object.hasOwn(RECORDED_DRUMS,midi))continue;
  for(const step of steps)track.notes.push({midi:Number(midi),start:offset+step*grid,duration:grid*.8,confidence:1,manualEdited:true});
 }
 storeDrumEdit(track,before);showToast(pattern==='clear'?'已清空当前鼓轨的这一小节':'已写入原创 Funk / Pop 节奏，可继续逐步修改');
}
async function previewDrumBar(){
 const track=selectedPerformanceTrack();if(!track||performanceInput.recording)return;
 stopArrangementPlayback();stopMelodyPlayback();releasePerformanceKeys();const context=getAudioContext(),{offset,grid}=drumBarPosition(),speed=arrangement.baseBpm/arrangement.bpm;
 try{await prepareSampledInstrument(drumKitFromTrack(track),context);}catch(error){showToast(error.message);return;}
 if(selectedPerformanceTrack()!==track||performanceInput.recording)return;
 track.notes.filter(note=>note.start>=offset-.001&&note.start<offset+16*grid-.001).forEach(note=>scheduleArrangementTrackNote(track,{...note,duration:note.duration*speed},context.currentTime+.04+(note.start-offset)*speed));
 arrangement.isPlaying=true;els.arrangePlayBtn.classList.add('is-playing');els.arrangePlayBtn.setAttribute('aria-label','暂停编曲');els.arrangeStatus.textContent='正在试听当前鼓机小节';arrangement.endTimer=window.setTimeout(()=>stopArrangementPlayback(),16*grid*speed*1000+800);
}
function setupDrumSequencer(){
 performanceElement('drumStepLanes').addEventListener('click',event=>{const step=event.target.closest('[data-drum-step]');if(step)toggleDrumStep(Number(step.dataset.drumMidi),Number(step.dataset.drumStep));});
 performanceElement('drumStepPanel').addEventListener('click',event=>{const pattern=event.target.closest('[data-drum-pattern]');if(pattern)applyDrumPattern(pattern.dataset.drumPattern);});
 performanceElement('previewDrumBar').addEventListener('click',previewDrumBar);
 performanceElement('arrangeRecordBeat').addEventListener('input',renderDrumSequencer);
}
