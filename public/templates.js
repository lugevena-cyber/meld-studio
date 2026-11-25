function arrangementTemplateSnapshot(){return {tracks:arrangement.tracks.map(cloneArrangementTrackData),bpm:arrangement.bpm,baseBpm:arrangement.baseBpm,duration:arrangement.duration,sections:arrangement.sections||[],templateMeta:arrangement.templateMeta||null,activeProjectId:state.activeProjectId};}
function restoreBeforeTemplate(){
 const raw=localStorage.getItem(accountStorageKey('meld.template-backup.v1'));if(!raw)return;
 try{const backup=JSON.parse(raw);globalThis.MeldNightPocket?.pausePreview();stopPerformanceTake();releasePerformanceKeys();stopArrangementPlayback();Object.assign(arrangement,backup);state.activeProjectId=backup.activeProjectId||null;performanceInput.history=[];performanceInput.trackId=arrangement.tracks[0]?.id||null;els.tempoInput.value=String(arrangement.bpm);persistArrangement();renderArrangement();showToast('已恢复载入模板前的编曲');}catch{showToast('恢复副本无法读取');}
}
let loopSelection = null;
let sectionLoopEnabled = false;
let renderedSectionChips = null;
function arrangementSectionRange(){
 const sections = arrangement.sections;
 if (!loopSelection || loopSelection.sections !== sections) return null;
 const start = Number(sections[loopSelection.index]?.start);
 const end = sections.reduce((boundary, section) => {
  const next = Number(section.start);
  return next > start ? Math.min(boundary, next) : boundary;
 }, arrangement.duration);
 return Number.isFinite(start) && start >= 0 && end - start >= .02 ? {start, end} : null;
}
function renderArrangementSectionControls(){
 const range = arrangementSectionRange();
 if (!range) {
  loopSelection = null;
  sectionLoopEnabled = false;
 }
 const scale = arrangement.baseBpm / arrangement.bpm;
 const sections = arrangement.sections || [];
 const chips = performanceElement('arrangementSections');
 const html = sections.map((section, index) => `<button type="button" data-arrange-section="${index}">${escapeHtml(section.name)}<small>${formatTime(section.start * scale,true)}</small></button>`).join('');
 if (renderedSectionChips !== html) {
  chips.innerHTML = html;
  renderedSectionChips = html;
 }
 for (const [index, chip] of Array.from(chips.children).entries()) {
  chip.setAttribute('aria-pressed', String(index === loopSelection?.index));
 }
 const button = performanceElement('arrangementLoopBtn');
 button.disabled = !range;
 button.setAttribute('aria-pressed',String(sectionLoopEnabled));
 button.textContent = sectionLoopEnabled ? '段落循环 · 开' : '段落循环';
 const status = performanceElement('arrangementLoopRange');
 if (range) {
  const track = sectionLoopEnabled ? selectedArrangementTrack() : null;
  status.textContent = `${formatTime(range.start * scale,true)} – ${formatTime(range.end * scale,true)}${track ? ` · 仅试听：${track.name}` : ''}`;
 } else {
  status.textContent = sections.length ? '请选择下方段落' : '当前编曲没有段落，可从下方载入示范曲';
 }
}
function templateBackupAvailable(){
 try{return Boolean(localStorage.getItem(accountStorageKey('meld.template-backup.v1')));}
 catch{return false;}
}
function renderTemplateShelf(){
 const id=arrangement.templateMeta?.id,hasBackup=templateBackupAvailable();
 globalThis.MeldNightPocket?.updateRestore(id,hasBackup);
 globalThis.MeldAfterglowDrive?.updateRestore(id,hasBackup);
 renderArrangementSectionControls();
}
function updateTemplateSection(time){
 const section=[...(arrangement.sections||[])].reverse().find(section=>time>=section.start);
 const label=section?`当前段落：${section.name}`:'';
 if(performanceElement('templateNowPlaying').textContent!==label)performanceElement('templateNowPlaying').textContent=label;
}
function setupArrangementTemplates(){
 performanceElement('arrangementSections').addEventListener('click',event=>{
  const button=event.target.closest('[data-arrange-section]');
  if(!button || performanceInput.recording || performanceInput.preparing)return;
  loopSelection = {sections: arrangement.sections, index: Number(button.dataset.arrangeSection)};
  const range = arrangementSectionRange();
  renderArrangementSectionControls();
  if (range) seekArrangementTo(range.start, true);
 });
 performanceElement('arrangementLoopBtn').addEventListener('click',()=>{
  const range=arrangementSectionRange();
  if(!range || performanceInput.recording || performanceInput.preparing)return;
  sectionLoopEnabled=!sectionLoopEnabled;
  renderArrangementSectionControls();
  if(arrangement.isPlaying || arrangement.loadingAudio){
   const offset=arrangement.playhead;
   stopArrangementPlayback(false);
   playArrangement(offset);
  }
 });
}

// Schedule a short window of notes rather than allocating an entire song's voices at once.
function startArrangementScheduler(tracks,startAt,speedScale,offset=0,end=Infinity){
 window.clearInterval(arrangement.scheduleTimer);
 const streams=tracks.map(track=>({track,notes:track.notes.filter(note=>note.start<end&&note.start+note.duration>offset).map(note=>({...note})).sort((a,b)=>a.start-b.start),index:0}));
 const audioStreams = tracks.map(track => ({track,clips:(track.audioClips||[]).filter(clip => clip.start<end&&clip.start+MeldMaterialCore.clipDuration(clip,arrangement.baseBpm,arrangement.bpm)>offset).map(clip=>({...clip})).sort((a,b)=>a.start-b.start),index:0}));
 const context=getAudioContext();
 const schedule=()=>{
  const now=offset+Math.max(0,context.currentTime-startAt)/speedScale,horizon=offset+(context.currentTime+.35-startAt)/speedScale;
  for(const stream of streams)while(stream.index<stream.notes.length && stream.notes[stream.index].start<=horizon){
   const note=stream.notes[stream.index++];if(note.start+note.duration<now-.05)continue;
   const from=Math.max(offset,note.start),when=Math.max(context.currentTime+.005,startAt+(from-offset)*speedScale);
   scheduleArrangementTrackNote(stream.track,{...note,slideProgress:(from-note.start)/note.duration,duration:Math.min(end-from,Math.max(.025,note.start+note.duration-from))*speedScale},when);
  }
  for (const stream of audioStreams) while (stream.index<stream.clips.length && stream.clips[stream.index].start<=horizon) {
   const clip=stream.clips[stream.index++];
   const window=MeldMaterialCore.sourceWindow(clip,offset,speedScale);
   if (!window || clip.start+MeldMaterialCore.clipDuration(clip,arrangement.baseBpm,arrangement.bpm)<now-.05) continue;
   const when=Math.max(context.currentTime+.005,startAt+(window.from-offset)*speedScale);
   scheduleMaterialAudio(stream.track,clip,when,offset,speedScale,end);
  }
  arrangement.nodes=arrangement.nodes.filter(node=>!node.meldEnded);
  state.playNodes=state.playNodes.filter(node=>!node.meldEnded);
 };
 schedule();arrangement.scheduleTimer=window.setInterval(schedule,25);
}
