/* Input interpretation is independent from the instrument chosen for playback. */
const recognitionUI={source:null,undo:null,lastInstrument:'guitar'};
function currentRecognitionProfile(){return window.MeldPitchAnalysis.profile(state.recognitionProfile).id;}
function recognitionSnapshot(){return JSON.parse(JSON.stringify({notes:state.notes,samples:state.samples,key:state.key,duration:state.duration,notesEdited:state.notesEdited,analysisProfile:state.analysisProfile,analysisOnsetFirst:state.analysisOnsetFirst,rhythmHits:state.rhythmHits,sourceType:state.sourceType,sourceName:state.sourceName}));}
function restoreRecognitionSnapshot(snapshot){Object.assign(state,JSON.parse(JSON.stringify(snapshot)));melodyEditor.rebuild=true;melodyEditor.blank=Boolean(state.rhythmHits?.length);if(state.key)updateAnalysisUI(state.key,state.notes,state.duration);else resetAnalysis();els.playBtn.disabled=!state.notes.length;els.stageStateText.textContent='已恢复上次解析';els.stageDetail.textContent=`${state.notes.length} 个音符 · ${state.rhythmHits?.length||0} 个节奏标记`;syncStudioActionState();drawVisualizer(0);}
function recognitionOnsetPreference(){
  const family=window.MeldPitchAnalysis.profile(state.recognitionProfile).family;
  try{const saved=localStorage.getItem('meld.recognition.onset-first.v2.'+family);if(saved!==null)return saved==='true';}catch{}
  return family==='instrument';
}
function setRecognitionProfile(id){
  state.recognitionProfile=window.MeldPitchAnalysis.profile(id).id;
  state.recognitionOnsetFirst=recognitionOnsetPreference();
  if(state.recognitionProfile!=='vocal')recognitionUI.lastInstrument=state.recognitionProfile;
  try{localStorage.setItem('meld.recognition.profile.v1',state.recognitionProfile);}catch{}
  renderRecognitionControls();
}
function renderRecognitionControls(){
  const mode=document.getElementById('recognitionMode');if(!mode)return;
  if(recognitionUI.source!==state.audioBlob){recognitionUI.source=state.audioBlob;recognitionUI.undo=null;}
  const cfg=window.MeldPitchAnalysis.profile(state.recognitionProfile),busy=state.isRecording||state.isAnalyzing;
  if(cfg.family==='instrument')recognitionUI.lastInstrument=cfg.id;
  mode.value=cfg.family;mode.disabled=busy;
  els.recordBtn.disabled=state.isAnalyzing;els.uploadBtn.disabled=busy;
  const instrument=document.getElementById('recognitionInstrument');instrument.value=cfg.family==='instrument'?cfg.id:recognitionUI.lastInstrument;instrument.disabled=busy;
  document.getElementById('recognitionInstrumentField').hidden=cfg.family!=='instrument';
  const onsetFirst=state.recognitionOnsetFirst!==false,onsetControl=document.getElementById('recognitionOnsetFirst');onsetControl.checked=onsetFirst;onsetControl.disabled=busy;
  document.getElementById('recognitionHint').textContent=onsetFirst
    ?cfg.family==='vocal'?'适合 Bang、Da 等重复断唱。每次发声取主要发声段的中位音高。':'按每次起音切分，取第一个稳定音高，延音保留在同一个音符里。'
    :cfg.hint;
  const current=state.analysisProfile?window.MeldPitchAnalysis.profile(state.analysisProfile).label:'尚未解析';
  document.getElementById('recognitionResultMode').textContent=`当前结果：${current}${state.analysisProfile?(state.analysisOnsetFirst?' · 每次发音一个音符':' · 按音高变化细分'):''}${state.analysisProfile&&(state.analysisProfile!==cfg.id||Boolean(state.analysisOnsetFirst)!==onsetFirst)?' · 重新解析后应用新设置':''}`;
  document.getElementById('recognitionReanalyze').disabled=busy||(!state.audioBlob&&!state.audioBuffer);
  document.getElementById('recognitionUndo').hidden=!recognitionUI.undo;
  document.getElementById('recognitionUndo').disabled=busy;
  document.getElementById('rhythmPitch').disabled=busy;
  renderRhythmReview();
}
function renderRhythmReview(){
  const panel=document.getElementById('rhythmReview');if(!panel)return;
  const hits=state.rhythmHits||[];panel.hidden=!hits.length;
  document.getElementById('rhythmReviewSummary').textContent=`${hits.length} 个节奏起音未检测到明确音高`;
  const list=document.getElementById('rhythmHitList');list.replaceChildren();
  hits.forEach((hit,index)=>{const button=document.createElement('button');button.type='button';button.dataset.rhythmIndex=String(index);button.textContent=`${hit.start.toFixed(2)}s ＋补音高`;button.disabled=state.isRecording||state.isAnalyzing;list.append(button);});
}
function assignRhythmPitch(index){
  const hit=state.rhythmHits?.[index];if(!hit||!pitchEditingAvailable())return;
  const midi=Number(document.getElementById('rhythmPitch').value);if(!Number.isInteger(midi)||midi<24||midi>96)return;
  stopMelodyPlayback();ensureEditorKey();syncPitchEditorSource();const before=editorSnapshot();
  state.notes.push({midi,start:hit.start,duration:Math.max(.04,hit.duration),confidence:1,manualEdited:true,velocity:Math.max(.25,Math.min(1,hit.strength||.7))});
  state.rhythmHits.splice(index,1);melodyEditor.selected=state.notes.length-1;melodyEditor.rebuild=true;commitEditorChange(before);renderRecognitionControls();
}
function drawRecognitionRhythm(ctx,g){
  if(state.view!=='pitch'||!state.rhythmHits?.length)return;
  ctx.save();ctx.fillStyle='#e8cf79';ctx.font='9px sans-serif';
  for(const hit of state.rhythmHits){if(hit.start>g.visibleDuration)continue;const x=g.timeToX(hit.start),y=g.pad.top+g.plotHeight-10;ctx.beginPath();ctx.moveTo(x,y-5);ctx.lineTo(x+4,y);ctx.lineTo(x,y+5);ctx.lineTo(x-4,y);ctx.closePath();ctx.fill();}
  ctx.fillText('◆ 未定音高的节奏起音',g.pad.left+5,g.pad.top+g.plotHeight-22);ctx.restore();
}
async function reanalyzeRecognition(){
  if(state.isRecording||state.isAnalyzing||(!state.audioBlob&&!state.audioBuffer))return;
  const before=recognitionSnapshot(),oldUndo=recognitionUI.undo,blob=state.audioBlob;
  stopMelodyPlayback();stopSourcePlayback();state.isAnalyzing=true;renderRecognitionControls();els.recordBtn.disabled=true;els.uploadBtn.disabled=true;
  try{
    const buffer=state.audioBuffer||(blob?await getAudioContext().decodeAudioData(await blob.arrayBuffer()):null);
    if(!buffer)throw new Error('没有可重新解析的原声');state.audioBuffer=buffer;
    const success=await analyzeAudioBuffer(buffer,state.sourceType||'record');
    if(success){recognitionUI.undo=before;showToast('已按所选模式重新解析；可以撤销本次解析');}
    else{restoreRecognitionSnapshot(before);recognitionUI.undo=oldUndo;}
  }catch(error){restoreRecognitionSnapshot(before);recognitionUI.undo=oldUndo;showToast('重新解析未完成：'+error.message);}
  finally{state.isAnalyzing=false;els.recordBtn.disabled=false;els.uploadBtn.disabled=false;renderRecognitionControls();syncStudioActionState();drawVisualizer(0);}
}
function setupRecognitionControls(){
  const select=document.getElementById('recognitionInstrument');
  select.replaceChildren();for(const cfg of Object.values(window.MeldPitchAnalysis.profiles))if(cfg.family==='instrument'){const option=document.createElement('option');option.value=cfg.id;option.textContent=cfg.label;select.append(option);}
  const pitches=document.getElementById('rhythmPitch');pitches.innerHTML=Array.from({length:73},(_,i)=>`<option value="${i+24}">${pitchLabel(i+24)}</option>`).join('');pitches.value='60';
  try{state.recognitionProfile=window.MeldPitchAnalysis.profile(localStorage.getItem('meld.recognition.profile.v1')).id;}catch{}
  state.recognitionOnsetFirst=recognitionOnsetPreference();
  document.getElementById('recognitionOnsetFirst').addEventListener('change',event=>{state.recognitionOnsetFirst=event.target.checked;try{localStorage.setItem('meld.recognition.onset-first.v2.'+window.MeldPitchAnalysis.profile(state.recognitionProfile).family,String(state.recognitionOnsetFirst));}catch{}renderRecognitionControls();});
  document.getElementById('recognitionMode').addEventListener('change',event=>setRecognitionProfile(event.target.value==='vocal'?'vocal':recognitionUI.lastInstrument));
  select.addEventListener('change',event=>setRecognitionProfile(event.target.value));
  document.getElementById('recognitionReanalyze').addEventListener('click',reanalyzeRecognition);
  document.getElementById('recognitionUndo').addEventListener('click',()=>{if(!recognitionUI.undo||state.isRecording||state.isAnalyzing)return;stopMelodyPlayback();const snapshot=recognitionUI.undo;recognitionUI.undo=null;restoreRecognitionSnapshot(snapshot);renderRecognitionControls();});
  document.getElementById('rhythmHitList').addEventListener('click',event=>{const button=event.target.closest('[data-rhythm-index]');if(button)assignRhythmPitch(Number(button.dataset.rhythmIndex));});
  renderRecognitionControls();
}
