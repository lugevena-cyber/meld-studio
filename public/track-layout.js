const trackEditing={drag:null,history:[],redo:[],suppressClick:false,projectId:undefined};
let arrangementTrackSelection=null;

function selectedArrangementTrack(){
 return arrangement.tracks.find(track=>track.id===arrangementTrackSelection);
}

function syncArrangementTrackSelection(){
 const id=selectedArrangementTrack()?.id;
 for(const container of [els.arrangementTrackHeaders,els.arrangementLanes]){
  for(const row of container.querySelectorAll('[data-track-id]')){
   const selected=row.dataset.trackId===id;
   row.classList.toggle('selected',selected);
   row.querySelector('[data-select-track]')?.setAttribute('aria-pressed',String(selected));
  }
 }
}

function selectArrangementTrack(id,{restartLoop=true}={}){
 if(id!==null&&!arrangement.tracks.some(track=>track.id===id))return;
 if(arrangementTrackSelection===id)return;
 arrangementTrackSelection=id;
 syncArrangementTrackSelection();
 renderPerformanceKeyboard();
 renderTrackChannelStrip();
 window.MeldArrangementRoll?.render();
 renderArrangementSectionControls();
 if(restartLoop && sectionLoopEnabled && !layoutLocked() && (arrangement.isPlaying||arrangement.loadingAudio)){
  playArrangement(arrangement.playhead);
 }
}
function trackContentStart(track){const times=[...(track.notes||[]).map(n=>n.start),...(track.audioClips||[]).map(c=>c.start)];return times.length?Math.min(...times):0;}
function trackContentSnapshot(track){return {notes:(track.notes||[]).map(n=>({...n})),audioClips:(track.audioClips||[]).map(c=>({...c,peaks:[...(c.peaks||[])]}))};}
function layoutLocked(){return Boolean(performanceInput.recording||performanceInput.preparing);}
function recordTrackLayout(action){if(trackEditing.projectId!==state.activeProjectId){trackEditing.history=[];trackEditing.redo=[];trackEditing.projectId=state.activeProjectId;}trackEditing.history.push(action);if(trackEditing.history.length>80)trackEditing.history.shift();trackEditing.redo=[];}
function reorderArrangementTrack(id,index,record=true){
 if(layoutLocked())return false;const from=arrangement.tracks.findIndex(t=>t.id===id);if(from<0)return false;
 const to=Math.max(0,Math.min(arrangement.tracks.length-1,Math.round(index)));if(to===from)return false;
 const before=arrangement.tracks.map(t=>t.id),[track]=arrangement.tracks.splice(from,1);arrangement.tracks.splice(to,0,track);
 if(record)recordTrackLayout({kind:'order',before,after:arrangement.tracks.map(t=>t.id)});persistArrangement();renderArrangement();return true;
}
function shiftedTrackContent(original,delta){const starts=[...original.notes.map(n=>n.start),...original.audioClips.map(c=>c.start)];const minimum=starts.length?Math.min(...starts):0;delta=Math.max(-minimum,Math.min(7200,delta));return {notes:original.notes.map(n=>({...n,start:delta===0?n.start:Math.round((n.start+delta)*10000)/10000})),audioClips:original.audioClips.map(c=>({...c,start:delta===0?c.start:Math.round((c.start+delta)*10000)/10000}))};}
function commitTrackShift(track,before,record=true){const after=trackContentSnapshot(track);if(JSON.stringify(before)===JSON.stringify(after))return false;if(record)recordTrackLayout({kind:'shift',trackId:track.id,before,after});calculateArrangementDuration();persistArrangement();renderArrangement();return true;}
function moveTrackContentTo(id,start){
 if(layoutLocked()||!Number.isFinite(start))return false;const track=arrangement.tracks.find(t=>t.id===id);if(!track||!MeldMaterialCore.hasContent(track))return false;
 const resume=arrangement.isPlaying||arrangement.loadingAudio,position=arrangement.playhead;stopArrangementPlayback(false);const before=trackContentSnapshot(track);Object.assign(track,shiftedTrackContent(before,Math.max(0,start)-trackContentStart(track)));const changed=commitTrackShift(track,before);if(resume)playArrangement(position);return changed;
}
function deleteArrangementTracks(ids){
 if(layoutLocked()||trackEditing.drag)return 0;
 const before=arrangement.tracks.map(track=>track.id);
 const removed=arrangement.tracks.filter(track=>ids.has(track.id)).map(cloneArrangementTrackData);
 if(!removed.length)return 0;
 releasePerformanceKeys();
 stopArrangementPlayback(false);
 arrangement.tracks=arrangement.tracks.filter(track=>!ids.has(track.id));
 recordTrackLayout({kind:'delete',before,removed});
 if(ids.has(arrangementTrackSelection))arrangementTrackSelection=null;
 calculateArrangementDuration();persistArrangement();renderArrangement();
 return removed.length;
}
function undoTrackLayout(redo=false){
 if(layoutLocked()||trackEditing.drag)return;const from=redo?trackEditing.redo:trackEditing.history,to=redo?trackEditing.history:trackEditing.redo,action=from.at(-1);if(!action)return;
 if(action.kind==='shift'){const track=arrangement.tracks.find(t=>t.id===action.trackId),expected=redo?action.before:action.after;if(!track||JSON.stringify(trackContentSnapshot(track))!==JSON.stringify(expected)){showToast('音轨内容已有后续修改，不能撤销这次移动');return;}stopArrangementPlayback(false);Object.assign(track,JSON.parse(JSON.stringify(redo?action.after:action.before)));}
 else if(action.kind==='delete'){
  releasePerformanceKeys();stopArrangementPlayback(false);
  const ids=new Set(action.removed.map(track=>track.id));
  if(redo){
   if(action.removed.some(saved=>JSON.stringify(arrangement.tracks.find(track=>track.id===saved.id))!==JSON.stringify(saved))){showToast('恢复的音轨已有修改，不能重做删除');return;}
   arrangement.tracks=arrangement.tracks.filter(track=>!ids.has(track.id));
   if(ids.has(arrangementTrackSelection))arrangementTrackSelection=null;
  }else{
   const tracks=new Map([...action.removed.map(cloneArrangementTrackData),...arrangement.tracks].map(track=>[track.id,track]));
   arrangement.tracks=[...action.before.filter(id=>tracks.has(id)).map(id=>tracks.get(id)),...arrangement.tracks.filter(track=>!action.before.includes(track.id))];
  }
 }
 else{const order=redo?action.after:action.before,map=new Map(arrangement.tracks.map(t=>[t.id,t]));arrangement.tracks=[...order.filter(id=>map.has(id)).map(id=>map.get(id)),...arrangement.tracks.filter(t=>!order.includes(t.id))];}
 from.pop();to.push(action);calculateArrangementDuration();persistArrangement();renderArrangement();
}
function beginTrackLayoutDrag(event){
 if(event.button!==0||trackEditing.drag)return;
 const order=event.target.closest('[data-track-drag]'),clip=event.target.closest('[data-track-shift]');if(!order&&!clip)return;
 if(event.pointerType==='touch'&&!order&&!event.target.closest('.track-shift-grip'))return;
 if(!order&&event.target.closest('button,input,select')&&!event.target.closest('button[data-track-shift]'))return;
 if(layoutLocked()){showToast('请先停止分轨录制，再移动音轨');return;}
 const id=order?order.dataset.trackDrag:clip.dataset.trackShift,track=arrangement.tracks.find(t=>t.id===id);if(!track||(!order&&!MeldMaterialCore.hasContent(track)))return;
 selectArrangementTrack(id,{restartLoop:Boolean(order)});
 event.preventDefault();event.stopPropagation();const target=order?els.arrangementTrackHeaders:els.arrangementLanes;
 const headers=[...els.arrangementTrackHeaders.querySelectorAll('[data-track-id]')],lane=clip?.closest('.arrange-lane');
 trackEditing.drag={kind:order?'order':'shift',pointerId:event.pointerId,target,id,track,startX:event.clientX,startY:event.clientY,before:trackContentSnapshot(track),duration:arrangement.duration,width:Math.max(1,(lane?.getBoundingClientRect().width||1)-14)*.984,headers:headers.map(h=>({id:h.dataset.trackId,center:h.getBoundingClientRect().top+h.getBoundingClientRect().height/2,element:h})),index:arrangement.tracks.indexOf(track),resume:!order&&(arrangement.isPlaying||arrangement.loadingAudio),position:arrangement.playhead,moved:false,lane};
 if(!order){releasePerformanceKeys();stopArrangementPlayback(false);}target.setPointerCapture(event.pointerId);target.classList.add('layout-dragging');
}
function moveTrackLayoutDrag(event){
 const drag=trackEditing.drag;if(!drag||event.pointerId!==drag.pointerId)return;event.preventDefault();
 if(drag.kind==='order'){if(Math.abs(event.clientY-drag.startY)<4)return;drag.moved=true;let index=0;for(let i=1;i<drag.headers.length;i++)if(Math.abs(event.clientY-drag.headers[i].center)<Math.abs(event.clientY-drag.headers[index].center))index=i;drag.index=index;drag.headers.forEach((h,i)=>h.element.classList.toggle('track-drop-target',i===index));document.getElementById('trackLayoutStatus').textContent=`放到第 ${index+1} 轨`;}
 else{const dx=event.clientX-drag.startX;if(Math.abs(dx)<3&&!drag.moved)return;drag.moved=true;let delta=dx/drag.width*drag.duration;const snap=document.getElementById('arrangementMoveSnap').checked&&!event.altKey,step=60/arrangement.baseBpm/4;if(snap)delta=Math.round(delta/step)*step;Object.assign(drag.track,shiftedTrackContent(drag.before,delta));drag.lane.innerHTML=arrangementTrackClipHtml(drag.track,drag.duration);document.getElementById('trackLayoutStatus').textContent=`起点 ${(1+trackContentStart(drag.track)*arrangement.baseBpm/60).toFixed(2)} 拍`;}
}
function endTrackLayoutDrag(event,cancel=false){
 const drag=trackEditing.drag;if(!drag||(event&&event.pointerId!==drag.pointerId))return;trackEditing.drag=null;drag.target.classList.remove('layout-dragging');drag.headers.forEach(h=>h.element.classList.remove('track-drop-target'));if(drag.target.hasPointerCapture(drag.pointerId))drag.target.releasePointerCapture(drag.pointerId);
 if(drag.kind==='shift'){if(cancel)Object.assign(drag.track,drag.before);if(!cancel&&drag.moved)commitTrackShift(drag.track,drag.before);else renderArrangement();if(drag.resume&&!cancel)playArrangement(drag.position);}
 else if(!cancel&&drag.moved)reorderArrangementTrack(drag.id,drag.index);
 trackEditing.suppressClick=true;window.setTimeout(()=>{trackEditing.suppressClick=false;},0);renderTrackLayoutState();
}
function renderTrackLayoutState(){if(trackEditing.projectId!==state.activeProjectId){trackEditing.history=[];trackEditing.redo=[];trackEditing.projectId=state.activeProjectId;}const undo=document.getElementById('trackLayoutUndo');if(!undo)return;undo.disabled=!trackEditing.history.length||layoutLocked();document.getElementById('trackLayoutRedo').disabled=!trackEditing.redo.length||layoutLocked();document.getElementById('trackLayoutStatus').textContent='左侧 ⇅ 拖动排序 · 轨内 ↔ 左右移动 · Alt 临时取消吸附';}
function arrangementTrackClipHtml(track,duration){return `<div class="arrange-clip ${MeldMaterialCore.hasContent(track)?'':'empty'}${track.muted?' muted':''}" data-track-shift="${escapeHtml(track.id)}"><div class="arrange-clip-heading"><span>${escapeHtml(track.name)}</span><small>${materialTrackLabel(track)}</small>${MeldMaterialCore.hasContent(track)?`<button type="button" class="track-shift-grip" data-track-shift="${escapeHtml(track.id)}" title="左右拖动整轨内容" aria-label="左右移动 ${escapeHtml(track.name)}">↔</button>`:''}</div>${trackWaveSvg(track,duration)}${MeldMaterialCore.hasContent(track)?'':`<button class="arrange-fill-track" type="button" data-fill-track="${escapeHtml(track.id)}">填入当前旋律</button>`}</div>`;}
function setupTrackLayout(){
 for(const target of [els.arrangementTrackHeaders,els.arrangementLanes]){target.addEventListener('pointerdown',beginTrackLayoutDrag);target.addEventListener('pointermove',moveTrackLayoutDrag);target.addEventListener('pointerup',event=>endTrackLayoutDrag(event));target.addEventListener('pointercancel',event=>endTrackLayoutDrag(event,true));target.addEventListener('lostpointercapture',event=>endTrackLayoutDrag(event,true));target.addEventListener('click',event=>{if(trackEditing.suppressClick){event.preventDefault();event.stopImmediatePropagation();}},true);}
 document.addEventListener('click',event=>{
  if(trackEditing.suppressClick||state.currentView!=='arrangement'||document.body.classList.contains('editing-track-detail'))return;
  const path=event.composedPath();
  const row=path.find(node=>node.matches?.('.arrange-track-header[data-track-id], .arrange-lane[data-track-id]'));
  if(row){
   const changesPlayback=event.target.closest('[data-track-mute],[data-track-solo],[data-track-delete]');
   selectArrangementTrack(row.dataset.trackId,{restartLoop:!changesPlayback});
  }else if(!path.some(node=>node.matches?.('button,input,select,textarea,label,a,summary,dialog,[contenteditable],.arrangement-ruler,.arrangement-playhead,.editable-piano-roll'))){
   selectArrangementTrack(null);
  }
 },true);
 els.arrangementTrackHeaders.addEventListener('keydown',event=>{const handle=event.target.closest('[data-track-drag]');if(handle&&['ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();selectArrangementTrack(handle.dataset.trackDrag);const index=arrangement.tracks.findIndex(t=>t.id===handle.dataset.trackDrag);reorderArrangementTrack(handle.dataset.trackDrag,index+(event.key==='ArrowUp'?-1:1));[...els.arrangementTrackHeaders.querySelectorAll('[data-track-drag]')].find(el=>el.dataset.trackDrag===handle.dataset.trackDrag)?.focus();}});
 document.getElementById('trackLayoutUndo').addEventListener('click',()=>undoTrackLayout());document.getElementById('trackLayoutRedo').addEventListener('click',()=>undoTrackLayout(true));
 window.addEventListener('blur',()=>endTrackLayoutDrag(null,true));document.addEventListener('keydown',event=>{if(event.key==='Escape'&&trackEditing.drag){event.preventDefault();endTrackLayoutDrag(null,true);}});
}
