// Non-destructive note editing; source samples and uploaded audio stay unchanged.
const melodyEditor = { source:null, selected:-1, drag:null, history:[], redo:[], geometry:null, bodies:[], handles:[], ends:[], mode:'move', blank:false, rebuild:true, fieldDraft:null, scaleSnap:true,viewport:null };
const editorElement = id => document.getElementById(id);
function pitchLabel(midi) {
  const note = noteNameFromMidi(midi,state.key ? usesFlatSpelling(state.key) : false);
  return `${note.name}${note.octave}`;
}
function syncPitchEditorSource() {
  if (melodyEditor.source === state.notes) return;
  melodyEditor.source=state.notes; melodyEditor.selected=-1; melodyEditor.drag=null;
  melodyEditor.history=[]; melodyEditor.redo=[]; melodyEditor.bodies=[]; melodyEditor.handles=[]; melodyEditor.ends=[];
  melodyEditor.viewport=null; melodyEditor.rebuild=true; melodyEditor.blank=Boolean(state.rhythmHits?.length); melodyEditor.fieldDraft=null;
  editorElement('noteHandles').replaceChildren();
}
function pitchEditingAvailable() { return state.view==='pitch' && !state.isRecording && !state.isAnalyzing; }
function editorSnapshot() { return {notes:state.notes.map(note=>({...note})),duration:state.duration,selected:melodyEditor.selected,edited:state.notesEdited,rhythmHits:(state.rhythmHits||[]).map(h=>({...h}))}; }
function editorChanged(before) { return JSON.stringify(before.notes)!==JSON.stringify(state.notes); }
function restoreEditorSnapshot(snapshot) {
  state.notes.splice(0,state.notes.length,...snapshot.notes.map(note=>({...note})));
  state.rhythmHits=(snapshot.rhythmHits||[]).map(h=>({...h}));
  state.duration=snapshot.duration; state.notesEdited=snapshot.edited;
  melodyEditor.selected=snapshot.selected; melodyEditor.rebuild=true;
}
function commitEditorChange(before) {
  if (!editorChanged(before)) return;
  melodyEditor.history.push(before); if (melodyEditor.history.length>100) melodyEditor.history.shift();
  melodyEditor.redo=[]; state.notesEdited=true; state.demoMode=false;
  state.duration=Math.max(before.duration||8,8,...state.notes.map(note=>note.start+note.duration+.35));
  updatePitchEditUI();
}
function isEditorScaleMidi(midi) { return !melodyEditor.scaleSnap || MeldPianoRollCore.inScale(midi,state.key); }
function clampEditorPitch(midi,chromatic=false,direction=0) {
  return melodyEditor.scaleSnap?MeldPianoRollCore.snapPitch(midi,state.key,direction,24,96):Math.max(24,Math.min(96,Math.round(midi)));
}
function editorDisplayMidi(note){return melodyEditor.drag?.note===note?melodyEditor.drag.visualMidi:note.midi;}
function applyEditorPitch(note,midi) {
  if(note.midi===midi)return;
  note.originalMidi??=note.midi; note.midi=midi; note.manualEdited=true;
}
function editorTime(time) {
  const step=60/(Number(els.tempoInput.value)||84)/4;
  return Math.max(0,Math.min(600,editorElement('noteTimeSnap').checked?Math.round(time/step)*step:time));
}
function renderPitchHandles(geometry) {
  melodyEditor.geometry=geometry;
  const layer=editorElement('noteHandles'), available=pitchEditingAvailable();
  layer.hidden=!available; editorElement('pitchEditor').hidden=!available;
  if(!available)return;
  if(melodyEditor.rebuild || melodyEditor.handles.length!==state.notes.length) {
    layer.replaceChildren(); melodyEditor.bodies=[]; melodyEditor.handles=[]; melodyEditor.ends=[];
    state.notes.forEach((note,index)=>{
      const body=document.createElement('button'); body.type='button'; body.className='note-body-handle'; body.dataset.noteIndex=String(index); body.dataset.editAction='move';
      const handle=document.createElement('button'); handle.type='button'; handle.className='note-pitch-handle';
      handle.dataset.noteIndex=String(index); handle.dataset.editAction='pitch';
      handle.innerHTML='<span class="pitch-handle-stem" aria-hidden="true"></span><span class="pitch-handle-dot" aria-hidden="true">↕</span>';
      const end=document.createElement('button'); end.type='button'; end.className='note-length-handle';
      end.dataset.noteIndex=String(index); end.dataset.editAction='resize'; end.textContent='↔';
      layer.append(body,handle,end); melodyEditor.bodies.push(body); melodyEditor.handles.push(handle); melodyEditor.ends.push(end);
    });
    melodyEditor.rebuild=false;
  }
  const {timeToX,midiToY,visibleDuration}=geometry;
  state.notes.forEach((note,index)=>{
    const body=melodyEditor.bodies[index],handle=melodyEditor.handles[index],end=melodyEditor.ends[index];
    const x1=timeToX(note.start),x2=timeToX(Math.min(visibleDuration,note.start+note.duration));
    handle.hidden=note.start>visibleDuration;
    body.hidden=note.start>visibleDuration; body.style.left=`${x1}px`; body.style.top=`${midiToY(editorDisplayMidi(note))-8}px`; body.style.width=`${Math.max(8,x2-x1)}px`;
    body.setAttribute('aria-label',`移动音符 ${index+1}：${pitchLabel(note.midi)}，左右移动时间，上下调整音高`); body.title='拖动音符本体：左右移动，上下调音高';
    handle.style.left=`${(x1+Math.max(x1+5,x2))/2-12}px`; handle.style.top=`${midiToY(editorDisplayMidi(note))+9}px`;
    const selected=index===melodyEditor.selected;
    body.classList.toggle('selected',selected); body.setAttribute('aria-pressed',String(selected));
    handle.classList.toggle('selected',selected); handle.setAttribute('aria-pressed',String(selected));
    handle.setAttribute('aria-label',`音符 ${index+1}：${pitchLabel(note.midi)}，上下拖动调音高`);
    handle.title=`音符 ${index+1} · ${pitchLabel(note.midi)} · 拖动手柄调音高，拖动音符本体移动`;
    end.hidden=!selected; end.style.left=`${Math.max(x1+8,x2)+4}px`; end.style.top=`${midiToY(editorDisplayMidi(note))-9}px`;
    end.setAttribute('aria-label',`调整音符 ${index+1} 时长`);
  });
  const select=editorElement('noteSelect');
  const options=state.notes.map((note,i)=>`<option value="${i}">${i+1} · ${pitchLabel(note.midi)} · ${note.start.toFixed(2)}s</option>`).join('');
  if(select.innerHTML!==options)select.innerHTML=options;
  select.value=String(melodyEditor.selected);
  els.canvasEmpty.classList.toggle('hidden',state.notes.length>0 || melodyEditor.blank);
  syncPitchEditorControls();
}
function syncPitchEditorControls() {
  const note=state.notes[melodyEditor.selected],selection=editorElement('pitchSelection');
  const text=note?`音符 ${melodyEditor.selected+1} / ${state.notes.length} · ${pitchLabel(note.midi)}`:'拖动音符移动，可与其他音符重叠';
  if(selection.textContent!==text)selection.textContent=text;
  editorElement('pitchDownBtn').disabled=!note || note.midi<=24;
  editorElement('pitchUpBtn').disabled=!note || note.midi>=96;
  editorElement('pitchDeleteBtn').disabled=!note;
  editorElement('pitchUndoBtn').disabled=!melodyEditor.history.length;
  editorElement('pitchRedoBtn').disabled=!melodyEditor.redo.length;
  const pitches=Array.from({length:73},(_,i)=>i+24).filter(midi=>isEditorScaleMidi(midi)||midi===note?.midi).map(midi=>`<option value="${midi}">${pitchLabel(midi)}${isEditorScaleMidi(midi)?'':'（原音·调外）'}</option>`).join('');if(editorElement('notePitch').innerHTML!==pitches)editorElement('notePitch').innerHTML=pitches;
  editorElement('editorKeyTonic').value=String(state.key?.tonic??0);editorElement('editorKeyMode').value=state.key?.mode||'major';
  MeldPianoRollCore.renderHarmonyReference(editorElement('studioHarmonyReference'),state.key);
  const fields={noteStart:note?.start,noteDuration:note?.duration,notePitch:note?.midi};
  for(const [id,value] of Object.entries(fields)) {
    const field=editorElement(id); field.disabled=!note;
    if(document.activeElement!==field)field.value=value===undefined?'':String(Math.round(value*1000)/1000);
  }
  editorElement('editScaleSnap').checked=melodyEditor.scaleSnap;
  editorElement('pitchDrawBtn').setAttribute('aria-pressed',String(melodyEditor.mode==='add'));
  editorElement('pitchDrawBtn').textContent=melodyEditor.mode==='add'?'✓ 点击画布写音符':'画笔添加';
  editorElement('noteHandles').classList.toggle('drawing',melodyEditor.mode==='add');
}
function updatePitchEditUI() {
  if(state.key && state.notes.length) updateAnalysisUI(state.key,state.notes,state.duration);
  if(!state.notes.length) { els.noteCount.textContent='0'; els.rangeStat.textContent='—'; }
  els.canvasEmpty.classList.add('hidden'); melodyEditor.blank=true;
  els.stageStateText.textContent='旋律已编辑'; els.stageDetail.textContent=`${state.notes.length} 个音符 · ${formatTime(state.duration)}`;
  els.analysisStatus.textContent='音符已修改 · 待保存'; els.analysisStatus.classList.add('ready');
  els.playBtn.disabled=!state.notes.length; renderRecognitionControls(); syncStudioActionState(); drawVisualizer(0);
}
function selectEditorNote(index) { melodyEditor.selected=index; drawVisualizer(0); }
function ensureEditorKey() {
  state.key ||= {tonic:0,mode:'major',confidence:.5,score:0,related:{tonic:9,mode:'minor'}};
  state.sourceName ||= '手写旋律'; state.sourceType ||= 'manual';
}
function addEditorNote(start=null,midi=null) {
  if(!pitchEditingAvailable())return;
  stopMelodyPlayback(); ensureEditorKey();
  const before=editorSnapshot(),selected=state.notes[melodyEditor.selected];
  const beat=60/(Number(els.tempoInput.value)||84);
  const note={midi:clampEditorPitch(midi??selected?.midi??60),start:editorTime(start??(selected?selected.start+selected.duration:0)),duration:Math.round(beat*1000)/1000,confidence:1,manualEdited:true};
  state.notes.push(note); melodyEditor.selected=state.notes.length-1; melodyEditor.rebuild=true;
  commitEditorChange(before);
}
function deleteEditorNote() {
  if(!pitchEditingAvailable() || melodyEditor.selected<0 || melodyEditor.drag)return;
  stopMelodyPlayback();const before=editorSnapshot();
  state.notes.splice(melodyEditor.selected,1); melodyEditor.selected=Math.min(melodyEditor.selected,state.notes.length-1);
  melodyEditor.rebuild=true; commitEditorChange(before);
}
function changeEditorField(id,final=false) {
  const note=state.notes[melodyEditor.selected]; if(!note || !pitchEditingAvailable())return;
  const input=editorElement(id);
  if(input.value==='')return;
  const value=Number(input.value); if(!Number.isFinite(value))return;
  melodyEditor.fieldDraft ||= {id,before:editorSnapshot()};
  stopMelodyPlayback(); const before=melodyEditor.fieldDraft.before;
  if(id==='notePitch')applyEditorPitch(note,clampEditorPitch(value));
  if(id==='noteStart')note.start=Math.round(Math.max(0,Math.min(600,value))*1000)/1000;
  if(id==='noteDuration')note.duration=Math.round(Math.max(.01,Math.min(60,value))*1000)/1000;
  note.manualEdited=true;
  if(final){melodyEditor.fieldDraft=null;commitEditorChange(before);}else updatePitchEditUI();
}
function stepEditorPitch(direction,chromatic=false,octave=false) {
  const note=state.notes[melodyEditor.selected];if(!note || !pitchEditingAvailable())return;
  stopMelodyPlayback();const before=editorSnapshot();
  let midi=Math.max(24,Math.min(96,note.midi+direction*(octave?12:1)));
  if(!chromatic && !octave)while(midi>24 && midi<96 && !isEditorScaleMidi(midi))midi+=direction;
  applyEditorPitch(note,clampEditorPitch(midi,chromatic||octave,direction));commitEditorChange(before);
}
function undoEditorPitch(redo=false) {
  if(!pitchEditingAvailable() || melodyEditor.drag)return;
  const from=redo?melodyEditor.redo:melodyEditor.history,to=redo?melodyEditor.history:melodyEditor.redo;
  const snapshot=from.pop();if(!snapshot)return;
  stopMelodyPlayback(); to.push(editorSnapshot());restoreEditorSnapshot(snapshot);updatePitchEditUI();
}
function beginPitchDrag(event,index,action='move') {
  if(event.button!==0 || !pitchEditingAvailable() || melodyEditor.drag)return;
  event.preventDefault();stopMelodyPlayback();stopArrangementPlayback();selectEditorNote(index);
  const target=event.currentTarget,note=state.notes[index];
  melodyEditor.drag={note,before:editorSnapshot(),original:{...note},pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,target,geometry:melodyEditor.geometry,action,visualMidi:note.midi,pitchMoved:false};
  target.setPointerCapture(event.pointerId);
  if(target===els.melodyCanvas)target.focus({preventScroll:true}); else (action==='move'?melodyEditor.bodies[index]:action==='resize'?melodyEditor.ends[index]:melodyEditor.handles[index]).focus({preventScroll:true});
  editorElement('noteHandles').classList.add('dragging');
}
function movePitchDrag(event) {
  const drag=melodyEditor.drag;if(!drag || event.pointerId!==drag.pointerId)return;
  const g=drag.geometry,dx=event.clientX-drag.startX,dy=drag.startY-event.clientY;
  if(drag.action==='resize') {
    drag.note.duration=Math.min(60,Math.max(.01,editorTime(drag.original.duration+dx*g.visibleDuration/g.plotWidth)));
  } else {
    if(drag.action==='move'&&dx!==0)drag.note.start=editorTime(drag.original.start+dx*g.visibleDuration/g.plotWidth);
    drag.pitchMoved ||= Math.abs(dy)>.01;
    drag.visualMidi=Math.max(24,Math.min(96,drag.original.midi+dy*(g.highMidi-g.lowMidi)/g.plotHeight));
    if(drag.pitchMoved)applyEditorPitch(drag.note,clampEditorPitch(drag.visualMidi,false,Math.sign(dy)));
  }
  if(drag.note.start!==drag.original.start || drag.note.duration!==drag.original.duration || drag.note.midi!==drag.original.midi)drag.note.manualEdited=true;
  drawVisualizer(0);
}
function endPitchDrag(event,cancelled=false) {
  const drag=melodyEditor.drag;if(!drag || (event && event.pointerId!==drag.pointerId))return;
  melodyEditor.drag=null;editorElement('noteHandles').classList.remove('dragging');
  if(drag.target.hasPointerCapture(drag.pointerId))drag.target.releasePointerCapture(drag.pointerId);
  if(cancelled)restoreEditorSnapshot(drag.before);else commitEditorChange(drag.before);
  drawVisualizer(0);
}
function editorPoint(event) {
  const rect=els.melodyCanvas.getBoundingClientRect(),g=melodyEditor.geometry;
  return {start:Math.max(0,(event.clientX-rect.left-g.pad.left)/g.plotWidth*g.visibleDuration),midi:g.lowMidi+(1-(event.clientY-rect.top-g.pad.top)/g.plotHeight)*(g.highMidi-g.lowMidi)};
}
function setupPitchEditor() {
  const layer=editorElement('noteHandles');
  editorElement('editScaleSnap').checked=melodyEditor.scaleSnap;
  editorElement('editorKeyTonic').innerHTML=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'].map((name,i)=>`<option value="${i}">${name}</option>`).join('');
  for(const id of ['editorKeyTonic','editorKeyMode'])editorElement(id).addEventListener('change',()=>{ensureEditorKey();Object.assign(state.key,MeldPianoRollCore.key({tonic:editorElement('editorKeyTonic').value,mode:editorElement('editorKeyMode').value}));updatePitchEditUI();});
  editorElement('editScaleSnap').addEventListener('change',event=>{
    melodyEditor.scaleSnap=event.target.checked;
    showToast(melodyEditor.scaleSnap?'拖动后落在当前调式内；时间默认连续调整':'已明确切换为十二平均律半音编辑');drawVisualizer(0);
  });
  editorElement('notePitch').innerHTML=Array.from({length:73},(_,i)=>`<option value="${i+24}">${pitchLabel(i+24)}</option>`).join('');
  window.addEventListener('blur',()=>endPitchDrag(null,true));
  layer.addEventListener('pointerdown',event=>{
    const handle=event.target.closest('[data-note-index]');
    if(handle)beginPitchDrag(event,Number(handle.dataset.noteIndex),handle.dataset.editAction);
  });
  layer.addEventListener('focusin',event=>{
    const handle=event.target.closest('[data-note-index]');if(handle && !melodyEditor.drag)selectEditorNote(Number(handle.dataset.noteIndex));
  });
  layer.addEventListener('click',event=>{
    const handle=event.target.closest('[data-note-index]');if(handle)selectEditorNote(Number(handle.dataset.noteIndex));
  });
  els.melodyCanvas.addEventListener('pointerdown',event=>{
    if(!pitchEditingAvailable() || event.button!==0)return;
    const g=melodyEditor.geometry;if(!g)return;
    if(melodyEditor.mode==='add') {const p=editorPoint(event);addEditorNote(p.start,p.midi);return;}
    const rect=els.melodyCanvas.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;
    const candidates=state.notes.map((note,index)=>({note,index})).filter(({note})=>x>=g.timeToX(note.start)-3 && x<=g.timeToX(note.start+note.duration)+3 && Math.abs(y-g.midiToY(editorDisplayMidi(note)))<=10);
    const hit=candidates.find(hit=>hit.index===melodyEditor.selected)||candidates[candidates.length-1];
    if(hit)beginPitchDrag(event,hit.index,'move');
  });
  els.melodyCanvas.addEventListener('dblclick',event=>{if(melodyEditor.mode==='add')return;const p=editorPoint(event);addEditorNote(p.start,p.midi);});
  for(const target of [layer,els.melodyCanvas]) {
    target.addEventListener('pointermove',movePitchDrag);
    target.addEventListener('pointerup',event=>endPitchDrag(event));
    target.addEventListener('pointercancel',event=>endPitchDrag(event,true));
    target.addEventListener('lostpointercapture',event=>endPitchDrag(event,true));
  }
  editorElement('pitchDownBtn').addEventListener('click',()=>stepEditorPitch(-1));
  editorElement('pitchUpBtn').addEventListener('click',()=>stepEditorPitch(1));
  editorElement('pitchUndoBtn').addEventListener('click',()=>undoEditorPitch());
  editorElement('pitchRedoBtn').addEventListener('click',()=>undoEditorPitch(true));
  editorElement('pitchDeleteBtn').addEventListener('click',deleteEditorNote);
  editorElement('pitchAddBtn').addEventListener('click',()=>addEditorNote());
  editorElement('pitchDrawBtn').addEventListener('click',()=>{melodyEditor.mode=melodyEditor.mode==='add'?'move':'add';melodyEditor.blank=true;drawVisualizer(0);});
  editorElement('startBlankBtn').addEventListener('click',()=>addEditorNote());
  editorElement('noteSelect').addEventListener('change',event=>selectEditorNote(Number(event.target.value)));
  for(const id of ['noteStart','noteDuration','notePitch']) {
    editorElement(id).addEventListener('input',()=>changeEditorField(id));
    editorElement(id).addEventListener('change',()=>changeEditorField(id,true));
    editorElement(id).addEventListener('blur',()=>{if(melodyEditor.fieldDraft?.id===id)changeEditorField(id,true);});
  }
  document.addEventListener('keydown',event=>{
    if(state.currentView!=='studio' || !pitchEditingAvailable() || event.target.closest('input,textarea,select,[contenteditable=true]') || document.querySelector('dialog[open]'))return;
    if(event.key==='Escape' && melodyEditor.drag){event.preventDefault();endPitchDrag(null,true);}
    else if((event.ctrlKey||event.metaKey)&&String(event.key||'').toLowerCase()==='z'){event.preventDefault();undoEditorPitch(event.shiftKey);}
    else if(['Delete','Backspace'].includes(event.key)){event.preventDefault();deleteEditorNote();}
    else if((event.key==='ArrowUp'||event.key==='ArrowDown')&&melodyEditor.selected>=0&&!melodyEditor.drag){event.preventDefault();stepEditorPitch(event.key==='ArrowUp'?1:-1,event.altKey,event.shiftKey);}
    else if((event.key==='ArrowLeft'||event.key==='ArrowRight')&&melodyEditor.selected>=0&&!melodyEditor.drag){
      event.preventDefault();stopMelodyPlayback();const before=editorSnapshot(),note=state.notes[melodyEditor.selected];
      const delta=(event.key==='ArrowRight'?1:-1)*60/(Number(els.tempoInput.value)||84)/4;
      if(event.shiftKey)note.duration=Math.max(.01,Math.round((note.duration+delta)*1000)/1000);else note.start=Math.max(0,Math.round((note.start+delta)*1000)/1000);
      note.manualEdited=true;commitEditorChange(before);
    }
  });
}
