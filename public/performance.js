// Polyphonic keyboard input and non-destructive per-track MIDI takes.
const performanceInput = { trackId:null, octave:3, keys:new Map(), recording:null, history:[], raf:null, keyboardOctave:null };
const performanceElement = id => document.getElementById(id);
function selectedPerformanceTrack() { return arrangement.tracks.find(track=>track.id===performanceInput.trackId); }
function renderPerformanceKeyboard() {
  const drum = Boolean(drumKitFromTrack(selectedPerformanceTrack()));
  performanceElement('arrangeDrumPads').hidden = !drum;
  performanceElement('arrangeKeyboardScroll').hidden = drum;
  performanceElement('arrangeOctaveControls').hidden = drum;
  const track=selectedPerformanceTrack(),sourcePads=window.MeldSourceInstruments?.drumPads?.(track?.instrumentBase||track?.instrument);
  const pads = (sourcePads||drumPadsForKit(drumKitFromTrack(track))).map(pad => `<button class="drum-pad" type="button" data-perform-midi="${pad.midi}" aria-label="演奏${pad.name}"><strong>${pad.name}</strong><span>${pad.key}</span><small>MIDI ${pad.midi}</small></button>`).join('');
  if(performanceElement('arrangeDrumPads').innerHTML !== pads) performanceElement('arrangeDrumPads').innerHTML = pads;
  if(performanceInput.keyboardOctave===performanceInput.octave)return;
  const base=(performanceInput.octave+1)*12,whites=[],blacks=[];
  let whiteCount=0;
  for(let step=0;step<=24;step++) {
    const midi=base+step,black=[1,3,6,8,10].includes(midi%12);
    if(black)blacks.push({midi,left:whiteCount/15*100});else{whites.push(midi);whiteCount++;}
  }
  const keyLabels=Object.fromEntries(Object.entries(LAB_KEY_MAP).map(([key,midi])=>[base+midi-60,key.toUpperCase()]));
  const keyHtml=(midi,black,left='')=>`<button type="button" class="performance-key ${black?'black':'white'}" data-perform-midi="${midi}" style="${black?`left:calc(${left}% - 2.1%);`:''}" aria-label="演奏 ${pitchLabel(midi)}"><span>${pitchLabel(midi)}</span><small>${keyLabels[midi]||''}</small></button>`;
  performanceElement('arrangeKeyboard').innerHTML=whites.map(midi=>keyHtml(midi,false)).join('')+blacks.map(({midi,left})=>keyHtml(midi,true,left)).join('');
  performanceInput.keyboardOctave=performanceInput.octave;
  performanceElement('arrangeKeyboardRange').textContent=`C${performanceInput.octave} — C${performanceInput.octave+2}`;
  performanceElement('arrangeOctaveDown').disabled=performanceInput.octave<=1;
  performanceElement('arrangeOctaveUp').disabled=performanceInput.octave>=5;
}
function renderPerformancePanel() {
  if(!performanceElement('arrangeInputTrack'))return;
  if(!selectedPerformanceTrack())performanceInput.trackId=arrangement.tracks[0]?.id||null;
  const track=selectedPerformanceTrack(),rec=performanceInput.recording,locked=Boolean(rec||performanceInput.preparing);
  const trackSelect=performanceElement('arrangeInputTrack');
  const choices=arrangement.tracks.map((t,i)=>`<option value="${escapeHtml(t.id)}">${String(i+1).padStart(2,'0')} · ${escapeHtml(t.name)}</option>`).join('');
  if(trackSelect.innerHTML!==choices)trackSelect.innerHTML=choices;
  trackSelect.value=track?.id||'';
  const instrumentSelect=performanceElement('arrangeInputInstrument');
  const instruments=instrumentSelectOptions();
  if(instrumentSelect.innerHTML!==instruments)instrumentSelect.innerHTML=instruments;
  instrumentSelect.value=track?.instrument||'piano';
  for(const id of ['arrangeInputTrack','arrangeInputInstrument','arrangeRecordBeat','arrangeRecordMode','arrangeRecordQuantize','arrangeRecordBacking'])performanceElement(id).disabled=locked||!track;
  performanceElement('arrangeRecordBtn').disabled=!track||Boolean(performanceInput.preparing);
  performanceElement('arrangeRecordBtn').textContent=rec?'■ 停止录制':'● 开始录制';
  performanceElement('arrangeRecordBtn').classList.toggle('recording',Boolean(rec));
  performanceElement('arrangeCancelTakeBtn').disabled=!rec;
  performanceElement('arrangeUndoTakeBtn').disabled=Boolean(rec)||!performanceInput.history.length;
  const hasNotes=arrangement.tracks.some(MeldMaterialCore.hasContent);
  performanceElement('arrangeSaveBtn').disabled=locked||!hasNotes;
  const canExport=!locked&&arrangement.tracks.some(t=>t.notes.length);
  performanceElement('arrangeExportBtn').disabled=!canExport;
  performanceElement('arrangementExportTopBtn').disabled=!canExport;
  for(const el of [els.tempoInput,els.arrangementTempoInput,els.addTrackBtn,els.arrangeAutoFillBtn])el.disabled=locked;
  document.querySelectorAll('[data-track-delete],[data-track-timbre]').forEach(el=>{el.disabled=locked;});
  syncArrangementTrackSelection();
  document.querySelectorAll('[data-track-arm]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.trackArm===track?.id)));
  document.querySelectorAll('[data-track-mute]').forEach(el=>{el.disabled=Boolean(performanceInput.preparing);});
  document.querySelectorAll('[data-track-solo]').forEach(button=>{
    const item=arrangement.tracks.find(track=>track.id===button.dataset.trackSolo);
    button.disabled=locked||!item||!MeldMaterialCore.hasContent(item);
  });
  const status=performanceInput.preparing?'正在准备音色与原声伴奏，可点击播放键取消':rec?`正在录制「${track?.name}」 · 已写入 ${rec.pending.length} 个音符`:track?`待录：「${track.name}」 · ${getInstrumentDefinition(track.instrument).name}`:'请先添加音轨';
  if(performanceElement('performanceStatus').textContent!==status)performanceElement('performanceStatus').textContent=status;
  renderPerformanceKeyboard();
  renderDrumSequencer();
  renderMaterialLibrary();
  renderTrackChannelStrip();
  window.MeldArrangementRoll?.render();
  window.MeldSourceInstruments?.refreshEditor?.();
}
function selectPerformanceTrack(trackId) {
  if(performanceInput.recording||performanceInput.preparing){showToast('请先停止当前录制，再切换音轨');return;}
  releasePerformanceKeys(); performanceInput.trackId=trackId;renderPerformancePanel();
}
function changePerformanceInstrument(id, track=selectedPerformanceTrack()) {
  if(!track || performanceInput.recording || performanceInput.preparing)return;
  releasePerformanceKeys();const definition=getInstrumentDefinition(id);
  Object.assign(track,{instrument:definition.id,instrumentName:definition.name,instrumentBase:definition.baseInstrument||definition.id,instrumentPatch:definition.params?{...definition.params}:null,color:track.customColor||definition.color});
  persistArrangement();renderArrangement();prepareSampledInstrument(track.instrumentBase,getAudioContext()).catch(error=>showToast(error.message));
}
function performanceSourceTime(time) {
  const rec=performanceInput.recording;return rec?rec.offset+Math.max(0,time-rec.startAt)/rec.speedScale:0;
}
function refreshPerformanceKeyLights() {
  const sounding=new Set([...performanceInput.keys.values()].map(key=>key.midi));
  document.querySelectorAll('[data-perform-midi]').forEach(key=>key.classList.toggle('active',sounding.has(Number(key.dataset.performMidi))));
}
function startPerformanceKey(token,midi,velocity=1,previewTrack=null) {
  if(performanceInput.keys.has(token))return;
  const track=performanceInput.recording?selectedPerformanceTrack():previewTrack||selectedPerformanceTrack();if(!track)return;
  const context=getAudioContext(),definition=getInstrumentDefinition(track.instrument);
  const base=track.instrumentBase||definition.baseInstrument||definition.id;
  if(!sampledInstrumentReady(base,context)){showToast('正在准备音色，请稍后再按键');prepareSampledInstrument(base,context).catch(error=>showToast(error.message));return;}
  const params={...LAB_DEFAULTS[base],...(track.instrumentPatch||definition.params||{})};
  const when=Math.max(context.currentTime+.01,performanceInput.recording?.startAt||0);
  const voice=schedulePatchVoice(base,midi,when,600,params,getArrangementDestination(track,midi,context),velocity);
  performanceInput.keys.set(token,{midi,velocity,trackId:track.id,when,start:performanceSourceTime(when),voice,recording:performanceInput.recording});
  refreshPerformanceKeyLights();
}
function finishPerformanceKey(token) {
  const key=performanceInput.keys.get(token);if(!key)return;
  performanceInput.keys.delete(token);
  const context=getAudioContext();key.voice.release(Math.max(context.currentTime,key.when+.08));
  const rec=performanceInput.recording;
  if(rec && key.recording===rec && key.trackId===rec.trackId) {
    let start=key.start,duration=Math.max(.04,performanceSourceTime(context.currentTime)-start);
    if(rec.quantize) {
      const grid=60/arrangement.baseBpm/4;
      start=Math.max(rec.offset,Math.round(start/grid)*grid);
      duration=Math.max(grid,Math.round(duration/grid)*grid);
    }
    const note={midi:key.midi,start:Math.round(start*1000)/1000,duration:Math.round(duration*1000)/1000,velocity:key.velocity,confidence:1,manualEdited:true};
    rec.pending.push(note);
    const track=arrangement.tracks.find(t=>t.id===rec.trackId);
    if(track)track.notes=[...(rec.mode==='replace'?[]:rec.before),...rec.pending].map(n=>({...n})).sort((a,b)=>a.start-b.start||a.midi-b.midi);
    renderArrangement();
  }
  refreshPerformanceKeyLights();
}
function releasePerformanceKeys() { for(const token of [...performanceInput.keys.keys()])finishPerformanceKey(token); }
function changePerformanceOctave(delta) {
  releasePerformanceKeys();performanceInput.octave=Math.max(1,Math.min(5,performanceInput.octave+delta));renderPerformanceKeyboard();
}
async function startPerformanceTake() {
  if(performanceInput.preparing)return;
  if(performanceInput.recording){stopPerformanceTake();return;}
  const track=selectedPerformanceTrack();if(!track){showToast('先添加并选择一条音轨');return;}
  stopMelodyPlayback();stopLabPlayback();stopArrangementPlayback();releasePerformanceKeys();
  const context=getAudioContext();
  const hasSolo=arrangement.tracks.some(t=>t.solo);
  const playbackTracks=performanceElement('arrangeRecordBacking').checked?arrangement.tracks.filter(t=>!t.muted&&(!hasSolo||t.solo)):[];
  const needed=[...playbackTracks,track];
  if(playbackTracks.some(MeldMaterialCore.hasAudio)||needed.some(t=>!sampledInstrumentReady(grandPianoTrackBase(t),context))) {
    const token=performanceInput.prepareToken=(performanceInput.prepareToken||0)+1;
    performanceInput.preparing=true;renderPerformancePanel();
    try { await Promise.all([prepareMaterialAudioTracks(playbackTracks,context),Promise.all([...new Set(needed.map(grandPianoTrackBase))].map(base=>prepareSampledInstrument(base,context)))]); }
    catch(error) { if(token===performanceInput.prepareToken) { performanceInput.preparing=false;renderPerformancePanel();showToast(error.message); } return; }
    if(token!==performanceInput.prepareToken)return;
    performanceInput.preparing=false;renderPerformancePanel();
  }
  const speedScale=arrangement.baseBpm/arrangement.bpm;
  const beat=Math.max(1,Math.min(999,Number(performanceElement('arrangeRecordBeat').value)||1));
  const offset=(beat-1)*60/arrangement.baseBpm,startAt=context.currentTime+.08;
  const rec={trackId:track.id,before:track.notes.map(note=>({...note})),pending:[],mode:performanceElement('arrangeRecordMode').value,quantize:performanceElement('arrangeRecordQuantize').checked,offset,startAt,speedScale};
  performanceInput.recording=rec;
  if(rec.mode==='replace')track.notes=[];
  state.playNodes=[];arrangement.nodes=[];
  if(performanceElement('arrangeRecordBacking').checked) {
    const hasSolo=arrangement.tracks.some(t=>t.solo);
    startArrangementScheduler(arrangement.tracks.filter(t=>!t.muted&&(!hasSolo||t.solo)),startAt,speedScale,offset);
  }

  if(state.metronome){metronomeNext=startAt;metronomeBeat=beat-1;scheduleMetronomeAhead();}
  const tick=()=>{
    if(performanceInput.recording!==rec)return;
    const position=performanceSourceTime(context.currentTime);
    arrangement.duration=Math.max(arrangement.duration,Math.ceil((position+2)/4)*4);
    updateArrangementPlayhead(position);
    els.arrangeStatus.textContent=`正在录制「${track.name}」`;
    performanceInput.raf=requestAnimationFrame(tick);
  };
  performanceInput.raf=requestAnimationFrame(tick);
  renderArrangement();showToast(`开始录制「${track.name}」，可同时按多个键弹奏和弦`);
}
function stopPerformanceTake(cancel=false) {
  const rec=performanceInput.recording;if(!rec)return;
  releasePerformanceKeys();performanceInput.recording=null;cancelAnimationFrame(performanceInput.raf);
  stopArrangementPlayback(false);
  const track=arrangement.tracks.find(t=>t.id===rec.trackId);
  if(track) {
    if(cancel || !rec.pending.length)track.notes=rec.before.map(note=>({...note}));
    else {
      performanceInput.history.push({trackId:track.id,before:rec.before});
      if(performanceInput.history.length>50)performanceInput.history.shift();
    }
  }
  calculateArrangementDuration();persistArrangement();renderArrangement();
  showToast(cancel?'已取消本次录制，原音符已恢复':rec.pending.length?`已录入 ${rec.pending.length} 个音符，可换轨继续录制`:'没有弹奏新音符，原音轨已保留');
}
function undoPerformanceTake() {
  if(performanceInput.recording)return;
  let entry=performanceInput.history.pop();while(entry&&!arrangement.tracks.some(t=>t.id===entry.trackId))entry=performanceInput.history.pop();
  if(!entry)return;
  stopArrangementPlayback();releasePerformanceKeys();
  arrangement.tracks.find(t=>t.id===entry.trackId).notes=entry.before.map(note=>({...note}));
  performanceInput.trackId=entry.trackId;persistArrangement();renderArrangement();showToast('已撤销该音轨的上一次录制');
}
function createArrangementMidi(source=arrangement) {
  const tracks=(source.tracks||[]).filter(track=>track.notes?.length);if(!tracks.length)return null;
  const vlq=value=>{let v=Math.max(0,Math.round(value)),bytes=[v&127];while(v>>=7)bytes.unshift((v&127)|128);return bytes;};
  const u32=n=>[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255];
  const text=s=>[...new TextEncoder().encode(s)];
  const chunk=bytes=>[77,84,114,107,...u32(bytes.length),...bytes];
  const bpm=Number(source.bpm)||84,baseBpm=Number(source.baseBpm)||bpm;
  const tempo=Math.round(60000000/bpm);
  const metadata=[0,255,81,3,(tempo>>16)&255,(tempo>>8)&255,tempo&255];
  let markerTick=0;
  for(const section of [...(source.sections||[])].sort((a,b)=>a.start-b.start)) {
    const tick=Math.round(section.start*baseBpm/60*480),name=text(section.name);
    metadata.push(...vlq(tick-markerTick),255,6,...vlq(name.length),...name);markerTick=tick;
  }
  metadata.push(0,255,47,0);
  const output=[77,84,104,100,0,0,0,6,0,1,((tracks.length+1)>>8)&255,(tracks.length+1)&255,1,224,...chunk(metadata)];
  const programs={piano:0,electric:27,acoustic:24,sax:65,strings:48,synth:81,bass:33,pickedbass:34,uprightbass:32,epiano:4,organ:16,flute:73,clarinet:71,trumpet:56,vibraphone:11,marimba:12,harp:46,pad:89,cleanguitar:27,mutedguitar:28,wideguitar:26,rockguitar:30,brightpiano:1,warmpiano:0,fmkeys:5,clav:7,digitalbell:14,synthbrass:62};
  let melodicChannel = 0;
  tracks.forEach((track,index)=>{
    const drum = Boolean(drumKitFromTrack(track));
    let channel = drum ? 9 : melodicChannel++ % 15;
    if (!drum && channel >= 9) channel++;
    const name=text(track.name),definition=getInstrumentDefinition(track.instrument)||{id:track.instrument||'piano',baseInstrument:track.instrumentBase||track.instrument||'piano'};
    const dx7 = window.MeldDx7?.parseId(track.instrumentBase) || window.MeldDx7?.parseId(track.instrument);
    const patchName = dx7 ? text(definition.name + " [" + dx7.bank + "/" + (dx7.slot + 1) + "]") : [];
    const program = dx7 ? dx7.slot : programs[track.instrumentBase||definition.baseInstrument||definition.id] ?? 0;
    const bytes=[0,255,3,...vlq(name.length),...name,...(dx7?[0,255,4,...vlq(patchName.length),...patchName]:[]),...(drum?[]:[0,192|channel,program]),0,176|channel,7,track.muted?0:Math.round(track.volume/100*127)];
    const events=[];
    track.notes.forEach(note=>{const start=Math.round(note.start*baseBpm/60*480),end=Math.max(start+1,Math.round((note.start+note.duration)*baseBpm/60*480));events.push({tick:start,type:144,note:note.midi,velocity:Number.isFinite(note.velocity)?Math.round(Math.max(.05,Math.min(1,note.velocity))*127):88},{tick:end,type:128,note:note.midi,velocity:0});});
    events.sort((a,b)=>a.tick-b.tick||a.type-b.type);let last=0;
    events.forEach(e=>{bytes.push(...vlq(e.tick-last),e.type|channel,drum ? drumMidi(e.note) : e.note,e.velocity);last=e.tick;});
    bytes.push(0,255,47,0);output.push(...chunk(bytes));
  });
  return new Blob([new Uint8Array(output)],{type:'audio/midi'});
}
function exportArrangementMidi() {
  const blob=createArrangementMidi();if(!blob)return;
  const url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download='Melohum-Arrangement.mid';anchor.click();window.setTimeout(()=>URL.revokeObjectURL(url),2000);
  showToast('已导出含独立音轨与乐器信息的 MIDI');
}
function exportSavedProjectMidi(project) {
  if(!project){showToast('找不到这首作品，请刷新作品列表');return;}
  let tracks=(project.arrangement||[]).filter(track=>track.notes?.length);
  if(!tracks.length&&project.notes?.length)tracks=[{id:'saved-melody',name:project.title||'旋律',instrument:project.instrument||'piano',instrumentBase:project.instrumentBase||project.instrument||'piano',volume:100,muted:false,notes:project.notes}];
  const source={tracks,bpm:Number(project.arrangementBpm)||Number(project.tempo)||84,baseBpm:Number(project.arrangementBaseBpm)||Number(project.arrangementBpm)||Number(project.tempo)||84,sections:project.arrangementSections||[]};
  const blob=createArrangementMidi(source);if(!blob){showToast('这首作品还没有可导出的音符');return;}
  const url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=`Melohum-${String(project.title||'作品').replace(/[\\/:*?"<>|]/g,'_')}.mid`;anchor.click();window.setTimeout(()=>URL.revokeObjectURL(url),2000);
  showToast('已从作品卡片导出分轨 MIDI');
}
window.MeldPerformanceExport={exportProjectMidi:exportSavedProjectMidi};
function setupPerformanceKeyboard() {
  const keyboard=performanceElement('performancePlayArea');
  setupDrumSequencer();
  keyboard.addEventListener('pointerdown',event=>{
    const key=event.target.closest('[data-perform-midi]');if(!key||event.button!==0)return;
    event.preventDefault();try{key.setPointerCapture(event.pointerId);}catch{}startPerformanceKey(`pointer:${event.pointerId}`,Number(key.dataset.performMidi));
  });
  keyboard.addEventListener('touchend',event=>{
    if(event.target.closest('[data-perform-midi]'))getAudioContext();
  },{passive:true});
  for(const eventName of ['pointerup','pointercancel','lostpointercapture'])keyboard.addEventListener(eventName,event=>finishPerformanceKey(`pointer:${event.pointerId}`));
  performanceElement('arrangeInputTrack').addEventListener('change',event=>selectPerformanceTrack(event.target.value));
  performanceElement('arrangeInputInstrument').addEventListener('change',event=>changePerformanceInstrument(event.target.value));
  performanceElement('arrangeRecordBtn').addEventListener('click',startPerformanceTake);
  performanceElement('arrangeCancelTakeBtn').addEventListener('click',()=>stopPerformanceTake(true));
  performanceElement('arrangeUndoTakeBtn').addEventListener('click',undoPerformanceTake);
  performanceElement('arrangeOctaveDown').addEventListener('click',()=>changePerformanceOctave(-1));
  performanceElement('arrangeOctaveUp').addEventListener('click',()=>changePerformanceOctave(1));
  performanceElement('arrangeSaveBtn').addEventListener('click',()=>openProjectDialog('save',state.activeProjectId));
  performanceElement('arrangeExportBtn').addEventListener('click',exportArrangementMidi);
  performanceElement('arrangementExportTopBtn').addEventListener('click',exportArrangementMidi);
  els.arrangementTrackHeaders.addEventListener('click',event=>{
    const edit=event.target.closest('[data-track-edit]');
    if(edit){window.MeldArrangementRoll.open(edit.dataset.trackEdit);return;}
    const arm=event.target.closest('[data-track-arm]');
    if(arm)selectPerformanceTrack(arm.dataset.trackArm);
  });
  document.addEventListener('keydown',event=>{
    if(state.currentView!=='arrangement'||event.target.closest('input,textarea,select,[contenteditable=true]')||document.querySelector('dialog[open]')||event.ctrlKey||event.metaKey||event.altKey)return;
    const key=String(event.key||'').toLowerCase();
    if(LAB_KEY_MAP[key]!==undefined){event.preventDefault();if(!event.repeat)startPerformanceKey(`key:${key}`,drumKitFromTrack(selectedPerformanceTrack()) ? DRUM_KEY_MAP[key] : LAB_KEY_MAP[key]-60+(performanceInput.octave+1)*12);}
    else if(key==='r'&&!event.repeat){event.preventDefault();startPerformanceTake();}
    else if((key==='z'||key==='x')&&!event.repeat){event.preventDefault();if(!drumKitFromTrack(selectedPerformanceTrack()))changePerformanceOctave(key==='z'?-1:1);}
    else if(event.key==='Escape'&&performanceInput.recording){event.preventDefault();stopPerformanceTake(true);}
    else if(event.code==='Space'&&performanceInput.recording){event.preventDefault();stopPerformanceTake();}
  });
  document.addEventListener('keyup',event=>finishPerformanceKey(`key:${String(event.key||'').toLowerCase()}`));
  window.addEventListener('blur',()=>{releasePerformanceKeys();if(performanceInput.recording)stopPerformanceTake();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){releasePerformanceKeys();if(performanceInput.recording)stopPerformanceTake();}});
  renderPerformanceKeyboard();
}
