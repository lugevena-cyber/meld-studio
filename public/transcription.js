(()=>{
 const el=id=>document.getElementById(id);let pending=null,controller=null,last=null,studioAudio=null,configured=false,readingMidi=false,previewing=false;
 const previewLimit=30;
 const status=text=>{
  const output=el('transcriptionStatus');
  output.textContent=text;
  output.hidden=!text;
 };
 const selectedFile=()=>el('transcriptionFile').files[0]||studioAudio?.blob;
 function syncStart(){
  const busy=Boolean(controller)||readingMidi;
  el('transcriptionChoose').disabled=busy;
  el('transcriptionMode').disabled=busy;
  el('transcriptionStart').disabled=busy||!selectedFile();
 }
 function updateModeDescription(){
  el('transcriptionServiceStatus').textContent=el('transcriptionMode').value==='quick'
   ?'适合哼唱、独奏和简单录音。在设备上识别，无需加载分离模型。'
   :configured?'支持的音频上传到云端识别。视频及其他文件在设备上处理。':'先在设备上分离人声、贝斯和伴奏，再识别音符。';
 }
 async function check(){
  try{
   const response=await fetch('/api/transcription/status');
   if(response.ok)configured=(await response.json()).configured===true;
  }catch{
   configured=false;
  }
  updateModeDescription();
 }
 el('transcriptionChoose').addEventListener('click',()=>el('transcriptionFile').click());

 async function transcribeLocally(file, name, signal, quick){
  const isVideo=/\.(mp4|mov)$/i.test(name)||file.type.startsWith('video/');
  status('正在读取音频…');
  const audio=await decodeStudioUpload(getAudioContext(false),file,isVideo);
  if(signal.aborted)throw signal.reason;
  const duration=Math.min(45,audio.duration);
  if(duration<0.25)throw Error('请使用至少 0.25 秒的录音');
  const onProgress=({name,progress})=>status(`正在识别${name}音符 · ${progress}%`);
  if(quick){
   const mix=resampleMono(audio,audio.sampleRate);
   status('正在加载音符识别模型…');
   return runLocalAudioWorker('local-transcription-worker.js?v=4',{mix,sampleRate:audio.sampleRate,duration},[mix.buffer],signal,onProgress);
  }
  const length=Math.floor(duration*audio.sampleRate);
  const clip={ numberOfChannels:audio.numberOfChannels, sampleRate:audio.sampleRate,
   getChannelData:i=>audio.getChannelData(i).subarray(0,length) };
  status('正在加载原声分离模型…');
  const {stems,sampleRate}=await separateLocalAudio(clip,signal,({chunk,totalChunks})=>{
   status(`正在分离声部 · ${chunk} / ${totalChunks}`);
  });
  const melodic={vocals:stems.vocals,bass:stems.bass,other:stems.other};
  status('正在加载音符识别模型…');
  return runLocalAudioWorker('local-transcription-worker.js?v=4',{stems:melodic,sampleRate,duration},
   Object.values(melodic).flat().map(channel=>channel.buffer),signal,onProgress);
 }

 if(typeof IntersectionObserver==='function'){
  const body=el('transcriptionPanel').querySelector('.transcription-body');
  const observer=new IntersectionObserver(([entry])=>{
   document.body.classList.toggle('transcription-in-view',entry.isIntersecting);
  },{threshold:0});
  observer.observe(body);
 }

 function clearResult(){
  if(previewing)stopArrangementPlayback(false);
  pending=null;
  el('transcriptionResults').hidden=true;
  el('transcriptionApply').disabled=true;
 }
 window.MeldOpenTranscription=(blob,name)=>{
  if(controller||readingMidi){showToast('请等待当前的识别或导入完成');return;}
  if(blob){
   clearResult();
   studioAudio={blob,name};
   el('transcriptionFile').value='';
   el('transcriptionFileName').textContent=name;
   el('transcriptionMode').value='quick';
   updateModeDescription();
   status('');
  }
  syncStart();
  switchView('arrangement');
  el('transcriptionPanel').open=true;
  el('transcriptionPanel').scrollIntoView({block:'start'});
 };
 el('studioSongTranscription').addEventListener('click',()=>window.MeldOpenTranscription(state.audioBlob,state.sourceName||'创作台原声'));
 el('transcriptionMode').addEventListener('change',updateModeDescription);
 el('transcriptionPanel').addEventListener('toggle',()=>{
  if(previewing&&!el('transcriptionPanel').open)stopArrangementPlayback(false);
 });
 el('transcriptionFile').addEventListener('change',()=>{
  const file=el('transcriptionFile').files[0];
  if(file){
   clearResult();
   studioAudio=null;
  }
  el('transcriptionFileName').textContent=file?.name||(studioAudio?'更换音频':'选择音频');
  status('');
  syncStart();
 });
 function instrumentFor(name){const n=name.toLowerCase();return /drum|percussion/.test(n)?'drum80':/bass/.test(n)?'bass':/guitar/.test(n)?'acoustic':/sax|brass|trumpet/.test(n)?'sax':/string|violin|cello/.test(n)?'strings':/synth/.test(n)?'synth':'piano';}
 function showResults(result,label){
  pending={result};
  renderResults();
  status(label+' · '+result.groups.length+' 组，'+result.count+' 个音符');
 }

 function renderResults(trackIds=[]){
  const {result}=pending;
  const soundOptions=trackIds.length?instrumentSelectOptions():'';
  const groups=result.groups.map((group,index)=>{
   const item=document.createElement('li');
   const name=document.createElement('strong');
   const count=document.createElement('span');
   name.textContent=group.name;
   count.textContent=group.notes.length+' 个音符';
   item.append(name,count);
   const trackId=trackIds[index];
   const track=arrangement.tracks.find(entry=>entry.id===trackId);
   if(track){
    const label=document.createElement('label');
    const select=document.createElement('select');
    label.textContent='音色';
    select.setAttribute('aria-label',group.name+'音色');
    select.innerHTML=soundOptions;
    select.value=track.instrument;
    select.addEventListener('change',()=>{
     const current=arrangement.tracks.find(entry=>entry.id===trackId);
     if(!current||performanceInput.recording||performanceInput.preparing){
      select.value=current?.instrument||'';
      status(current?'请先停止录音，再更换音色':'这条音轨已不在当前编曲台');
      return;
     }
     const canUpdateUndo=last&&MeldArrangementAI.fingerprint(assistantSnapshot())===last.after;
     stopArrangementPlayback(false);
     changePerformanceInstrument(select.value,current);
     if(canUpdateUndo)last.after=MeldArrangementAI.fingerprint(assistantSnapshot());
    });
    label.append(select);
    item.append(label);
   }
   return item;
  });
  el('transcriptionSummary').replaceChildren(...groups);
  el('transcriptionResults').hidden=false;
  const apply=el('transcriptionApply');
  apply.hidden=apply.disabled=Boolean(trackIds.length);
  renderRoll(result);
  el('transcriptionPreview').disabled=!result.count;
  el('transcriptionDownload').hidden=!result.midi;
 }

 function renderRoll(result){
  const canvas=el('transcriptionRoll'),ctx=canvas.getContext('2d');
  if(!ctx)return;
  const {width,height}=canvas;
  const notes=result.groups.flatMap(group=>group.notes).filter(note=>note.start<previewLimit);
  ctx.fillStyle='#f1f5f1';ctx.fillRect(0,0,width,height);
  if(!notes.length)return;
  const end=Math.min(previewLimit,Math.max(.25,...notes.map(note=>note.start+note.duration)));
  const min=Math.min(...notes.map(note=>note.midi)),max=Math.max(...notes.map(note=>note.midi));
  const row=(height-16)/Math.max(12,max-min+1);
  const x=time=>8+time*(width-16)/end;
  ctx.strokeStyle='#d8e2d8';
  for(let i=1;i<8;i++){ctx.beginPath();ctx.moveTo(x(end*i/8),0);ctx.lineTo(x(end*i/8),height);ctx.stroke();}
  const colors=['#226044','#455d8a','#906333','#805080'];
  result.groups.forEach((group,index)=>{
   ctx.fillStyle=colors[index%colors.length];
   for(const note of group.notes){
    if(note.start>=end)continue;
    ctx.fillRect(x(note.start),height-8-(note.midi-min+1)*row,Math.max(2,x(Math.min(end,note.start+note.duration))-x(note.start)),Math.max(2,row-1));
   }
  });
 }

 function resultTrack(group){
  const id=group.instrument||group.name;
  const definitions=getAllInstrumentDefinitions();
  const definition=definitions.find(entry=>entry.id===id)||definitions.find(entry=>entry.id===instrumentFor(id));
  return createArrangementTrack(definition?.id||'piano',group.name.slice(0,60),group.notes);
 }

 const previewButton=el('transcriptionPreview');
 window.addEventListener('meld:arrangement-stop',()=>{
  previewing=false;
  previewButton.textContent='试听 MIDI';
 });
 previewButton.onclick=async()=>{
  if(previewing){stopArrangementPlayback(false);return;}
  if(!pending||performanceInput.recording||performanceInput.preparing){status('请先停止录音，再试听');return;}
  stopArrangementPlayback(false);stopMelodyPlayback();stopSourcePlayback();stopMaterialOriginal();releasePerformanceKeys();
  const current=pending,token=arrangement.audioLoadToken;
  const tracks=current.result.groups.map(resultTrack);
  for(const track of tracks)track.notes=track.notes.filter(note=>note.start<previewLimit)
   .map(note=>({...note,duration:Math.min(note.duration,previewLimit-note.start)}));
  const end=Math.max(0,...tracks.flatMap(track=>track.notes.map(note=>note.start+note.duration)));
  if(!end){status('前 30 秒没有可试听的音符');return;}
  previewing=true;previewButton.textContent='停止试听';
  try{
   const context=getAudioContext(false);
   if(!await resumePlaybackAudio(context))throw Error('音频尚未开启，请再点击一次试听');
   await prepareSampledTracks(tracks,context);
   if(pending!==current||token!==arrangement.audioLoadToken)return;
   arrangement.isPlaying=true;
   startArrangementScheduler(tracks,context.currentTime+.05,1);
   arrangement.endTimer=window.setTimeout(()=>stopArrangementPlayback(false),(end+1)*1000);
   status('正在试听 MIDI（最多 30 秒）');
  }catch(error){
   if(token!==arrangement.audioLoadToken)return;
   stopArrangementPlayback(false);status('试听失败 · '+error.message);
  }
 };

 el('transcriptionImport').addEventListener('click',()=>el('transcriptionMidiFile').click());
 el('transcriptionMidiFile').addEventListener('change',async event=>{
  const file=event.target.files[0];
  event.target.value='';
  if(!file||controller||readingMidi)return;
  clearResult();
  readingMidi=true;
  el('transcriptionImport').disabled=true;
  syncStart();
  status('正在读取 MIDI…');
  try{
   const {readTranscriptionMidi}=await import('./transcription-midi.js?v=1');
   showResults(await readTranscriptionMidi(file),'MIDI 已读取');
  }catch(error){
   status('MIDI 导入失败 · '+error.message);
  }finally{
   readingMidi=false;
   el('transcriptionImport').disabled=false;
   syncStart();
  }
 });

 el('transcriptionForm').addEventListener('submit',async event=>{
  event.preventDefault();if(controller||readingMidi)return;
  const selection=el('transcriptionFile').files[0];
  const file=selection||studioAudio?.blob;
  if(!file){status('请先选择音频');return;}
  const name=selection?.name||studioAudio.name;
  if(file.size>64*1024*1024){status('文件超过 64 MiB，请先截取片段');return;}
  const quick=el('transcriptionMode').value==='quick';
  const remote=!quick&&configured&&file.size<=25*1024*1024&&!/\.(mp4|mov)$/i.test(name)&&file.type.startsWith('audio/');
  clearResult();
  controller=new AbortController();el('transcriptionImport').disabled=true;syncStart();el('transcriptionCancel').hidden=false;
  try{
   if(!remote){
    const result=await transcribeLocally(file,name,controller.signal,quick);
    if(controller.signal.aborted)throw controller.signal.reason;
    showResults(result,'识别完成');
    return;
   }
   status('正在上传并识别音符…');
   const body=new FormData();body.append('file',file,name);const r=await fetch('/api/transcription',{method:'POST',body,signal:controller.signal});
   if(!r.ok){const data=await r.json();throw Error(data.error||'转写未完成');}if(!r.body)throw Error('浏览器不支持流式读取');
   const reader=r.body.getReader(),decoder=new TextDecoder(),collector=MelohumTranscription.createCollector();let buffer='',bytes=0;
   try{while(true){const {value,done}=await reader.read();if(done)break;bytes+=value.length;if(bytes>12*1024*1024)throw Error('转写结果过大，请缩短片段');buffer+=decoder.decode(value,{stream:true}).replace(/\r/g,'');let at;while((at=buffer.indexOf('\n\n'))>=0){const block=buffer.slice(0,at);buffer=buffer.slice(at+2);const payload=block.split('\n').filter(x=>x.startsWith('data:')).map(x=>x.slice(5).trim()).join('\n');if(!payload)continue;const e=JSON.parse(payload);collector.push(e);if(e.type==='progress')status('模型转写进度：'+e.completed+' / '+e.total+' 个片段');}}}catch(e){await reader.cancel();throw e;}finally{reader.releaseLock();}
   if(controller.signal.aborted)throw controller.signal.reason;
   showResults(collector.result(),'识别完成');
  }catch(e){status(e.name==='AbortError'?'已取消，当前编曲未改动':'转写失败：'+e.message);}finally{controller=null;el('transcriptionImport').disabled=false;syncStart();el('transcriptionCancel').hidden=true;}
 });
 el('transcriptionCancel').onclick=()=>controller?.abort();
 function applyResult(){
  if(!pending)return;
  const {result}=pending;
  if(performanceInput.recording||performanceInput.preparing){
   status('请先停止录音，再应用转写结果');
   return;
  }
  if(!result.groups.length){status('未检测到可编辑的音符');return;}
  if(arrangement.tracks.length+result.groups.length>48){status('总音轨不能超过 48 条');return;}
  const newTracks=result.groups.map(resultTrack);

  const before=assistantSnapshot();
  const trackId=performanceInput.trackId,playhead=arrangement.playhead;
  let duration=before.duration||0;
  for(const track of newTracks){
   for(const note of track.notes)duration=Math.max(duration,note.start+note.duration);
  }
  stopArrangementPlayback();stopMelodyPlayback();releasePerformanceKeys();
  const next={...before,tracks:[...before.tracks,...newTracks],duration};
  performanceInput.trackId=newTracks[0].id;
  assignAssistantSnapshot(next);
  last={before,trackId,playhead,applied:pending,after:MeldArrangementAI.fingerprint(assistantSnapshot())};
  el('transcriptionUndo').hidden=false;
  el('transcriptionUndo').textContent='撤销本次导入';
  renderResults(newTracks.map(track=>track.id));
  status(`已加入编曲 · ${newTracks.length} 条新音轨`);
 }
 el('transcriptionApply').onclick=applyResult;
 el('transcriptionUndo').onclick=()=>{
  if(!last)return;
  if(performanceInput.recording||performanceInput.preparing){status('请先停止录音');return;}
  if(MeldArrangementAI.fingerprint(assistantSnapshot())!==last.after){status('编曲台已有其他编辑，请先撤销这些编辑');return;}
  stopArrangementPlayback();stopMelodyPlayback();releasePerformanceKeys();
  performanceInput.trackId=last.trackId;
  assignAssistantSnapshot(last.before);
  updateArrangementPlayhead(last.playhead);
  const applied=last.applied;
  last=null;
  el('transcriptionUndo').hidden=true;
  if(pending===applied)renderResults();
  status('已撤销本次导入');
 };
 el('transcriptionDownload').onclick=()=>{const midi=pending?.result.midi;if(!midi)return;const bytes=typeof midi==='string'?Uint8Array.from(atob(midi),c=>c.charCodeAt(0)):midi,url=URL.createObjectURL(new Blob([bytes],{type:'audio/midi'})),a=document.createElement('a');a.href=url;a.download='Melohum-Transcription.mid';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 updateModeDescription();
 check();
})();
