// This library belongs to the browser, independently of the currently open project.
const materialLibrary={db:null,opening:null,items:[],selected:null,showTrash:false,busy:false,error:'',previewURL:null,previewKind:null,buffers:new Map(),decoding:new Map(),bufferContext:null,history:[]};
const materialElement=id=>document.getElementById(id);
let savedStudioBlob=null;
function openMaterialDB(){
 if(materialLibrary.opening)return materialLibrary.opening;
 materialLibrary.opening=new Promise((resolve,reject)=>{
  if(!window.indexedDB){reject(new Error('当前浏览器不支持本机素材存储'));return;}
  const request=window.indexedDB.open(materialLibrary.databaseName||'meld.materials.v1',1);
  request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains('materials'))db.createObjectStore('materials',{keyPath:'id'});if(!db.objectStoreNames.contains('audio'))db.createObjectStore('audio',{keyPath:'id'});};
  request.onerror=()=>reject(request.error||new Error('素材库无法打开'));
  request.onblocked=()=>{materialLibrary.error='请关闭占用旧素材库的页面后重试';renderMaterialLibrary();};
  request.onsuccess=()=>{materialLibrary.db=request.result;materialLibrary.db.onversionchange=()=>{materialLibrary.db.close();materialLibrary.db=null;materialLibrary.opening=null;};resolve(materialLibrary.db);};
 });return materialLibrary.opening;
}
async function materialStoreAudio(asset,db=null){db=db||await openMaterialDB();return new Promise((resolve,reject)=>{const tx=db.transaction('audio','readwrite');tx.objectStore('audio').put(asset);tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);});}
async function materialRead(store,id){if(store==='audio'&&globalThis.MeldNightPocket?.hasAsset(id))return globalThis.MeldNightPocket.readAsset(id);const db=await openMaterialDB();const found=await new Promise((resolve,reject)=>{const request=db.transaction(store,'readonly').objectStore(store).get(id);request.onsuccess=()=>resolve(request.result||null);request.onerror=()=>reject(request.error);});if(found||store!=='audio'||!isLocalBackend()||!cloudSession)return found;const owner=cloudSession.user.id,blob=await window.MeldCloud.fetchAudioAsset(id);if(!blob||cloudSession?.user.id!==owner)return null;const asset={id,blob,mime:blob.type,size:blob.size};await materialStoreAudio(asset,db);return asset;}
async function materialRows(){const db=await openMaterialDB();return new Promise((resolve,reject)=>{const request=db.transaction('materials','readonly').objectStore('materials').getAll();request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
async function putMaterialRecord(meta,asset=null,options={}){const db=await openMaterialDB();return new Promise((resolve,reject)=>{const tx=db.transaction(asset?['materials','audio']:['materials'],'readwrite');tx.objectStore('materials').put(meta);if(asset)tx.objectStore('audio').put(asset);tx.oncomplete=()=>{if(options.sync!==false)queueBackendMaterial(meta,asset);resolve();};tx.onabort=()=>reject(tx.error||new Error('素材未能保存'));tx.onerror=()=>{};});}
async function refreshMaterialLibrary(){
 try{const rows=await materialRows();materialLibrary.items=rows.map(row=>{try{return MeldMaterialCore.validate(row);}catch{return null;}}).filter(Boolean).sort((a,b)=>b.createdAt-a.createdAt);materialLibrary.error='';}
 catch(error){materialLibrary.error=error.message||'无法读取本机素材库';}
 renderMaterialLibrary();syncMaterialCaptureState();
}
function currentMaterial(){return materialLibrary.items.find(item=>item.id===materialLibrary.selected)||null;}
function syncMaterialCaptureState(){
 renderRecognitionControls();
 if(!materialElement('saveMaterialBtn'))return;
 const hasAudio=Boolean(state.audioBlob?.size),duplicate=hasAudio&&savedStudioBlob===state.audioBlob&&!materialElement('materialNameInput').value.trim();
 const saveButton=materialElement('saveMaterialBtn');
 saveButton.disabled=!materialLibrary.db||materialLibrary.busy||state.isRecording||state.isAnalyzing||duplicate||(!state.notes.length&&!hasAudio);
 saveButton.textContent=hasAudio?(duplicate?'已保存录音':state.sourceType==='upload'?'保存原声':'保存录音'):'保存旋律';
 materialElement('downloadStudioAudio').hidden=!hasAudio;
 const label=materialElement('studioMaterialStatus');if(!label)return;
 label.textContent=materialLibrary.busy?'正在保存素材…':materialLibrary.error|| (duplicate?'已存入素材库':hasAudio?'保存后可在「已存素材」中再次打开':state.notes.length?'可保存当前旋律和音色':'录音后可保存原声');
}
function materialWaveSvg(item){
 const peaks=item.audio?.peaks;
 if(peaks?.length)return `<svg class="material-wave" viewBox="0 0 240 36" aria-hidden="true">${peaks.map((peak,i)=>`<path d="M${(i+.5)*240/peaks.length} ${18-peak*16}v${Math.max(1,peak*32)}"/>`).join('')}</svg>`;
 const notes=item.notes;if(!notes.length)return '';
 const duration=Math.max(1,...notes.map(note=>note.start+note.duration)),min=Math.min(...notes.map(note=>note.midi)),span=Math.max(12,Math.max(...notes.map(note=>note.midi))-min);
 return `<svg class="material-wave" viewBox="0 0 240 36" aria-hidden="true">${notes.slice(0,200).map(note=>`<path d="M${note.start/duration*240} ${29-(note.midi-min)/span*23}h${Math.max(2,note.duration/duration*240)}"/>`).join('')}</svg>`;
}
function renderMaterialLibrary(){
 if(!materialElement('materialList'))return;
 if(materialElement('materialStorageNote'))materialElement('materialStorageNote').textContent=backendCanSave()?'素材保存在此浏览器，并在联网时同步到当前账户。可导出素材备份。':'素材保存在此浏览器。换设备或清理浏览器前，请导出素材备份。';
 const query=(materialElement('materialSearch').value||'').trim().toLowerCase(),visible=materialLibrary.items.filter(item=>Boolean(item.deletedAt)===materialLibrary.showTrash&&item.name.toLowerCase().includes(query));
 if(!visible.some(item=>item.id===materialLibrary.selected))materialLibrary.selected=visible[0]?.id||null;
 materialElement('materialLibraryCount').textContent=String(materialLibrary.items.filter(item=>!item.deletedAt).length);
 materialElement('materialTrashToggle').setAttribute('aria-pressed',String(materialLibrary.showTrash));materialElement('materialTrashToggle').textContent=materialLibrary.showTrash?'返回素材库':'回收站';
 materialElement('materialList').innerHTML=visible.map(item=>`<button type="button" class="material-card ${item.id===materialLibrary.selected?'selected':''}" data-material-id="${escapeHtml(item.id)}" aria-pressed="${item.id===materialLibrary.selected}"><span class="material-card-type">${item.audio?'原声 + 素材':'旋律素材'}${item.deletedAt?' · 回收站':''}</span><strong>${escapeHtml(item.name)}</strong>${materialWaveSvg(item)}<small>${item.audio?`原声 ${formatTime(item.audio.duration)} · `:''}${item.notes.length} 音符 · ${item.bpm} BPM · ${escapeHtml(item.instrumentName)}</small></button>`).join('');
 materialElement('materialEmpty').hidden=visible.length>0;materialElement('materialEmpty').textContent=materialLibrary.error?materialLibrary.error:!materialLibrary.db?'正在打开本机素材库…':query?'没有匹配的素材':materialLibrary.showTrash?'回收站为空':'素材库还没有片段。可从创作台“存入素材库”，或导入素材备份。';
 const item=currentMaterial(),blocked=materialLibrary.busy||Boolean(performanceInput.recording)||Boolean(performanceInput.preparing);
 const mode=materialElement('materialInsertMode');mode.querySelector('[value=audio]').disabled=!item?.audio;mode.querySelector('[value=melody]').disabled=!item?.notes.length;
 if(item&&((mode.value==='audio'&&!item.audio)||(mode.value==='melody'&&!item.notes.length)))mode.value=item.notes.length?'melody':'audio';
 materialElement('materialSelected').textContent=item?`已选：${item.name}`:'先选择一段素材';
 materialElement('materialPreviewOriginal').disabled=!item?.audio||blocked;
 materialElement('materialToMidi').hidden=!item?.audio||Boolean(item.deletedAt);
 materialElement('materialToMidi').disabled=blocked;
 materialElement('materialPreviewMelody').disabled=!item?.notes.length||blocked;
 materialElement('materialInsertBtn').disabled=!item||Boolean(item.deletedAt)||blocked;
 materialElement('materialExportBtn').disabled=!item||blocked;
 materialElement('materialRemoveBtn').disabled=!item||blocked;materialElement('materialRemoveBtn').textContent=item?.deletedAt?'恢复素材':'移入回收站';
 materialElement('materialUndoInsert').disabled=!materialLibrary.history.length||blocked;
 const track=selectedPerformanceTrack();materialElement('materialInsertTarget').querySelector('[value=current]').textContent=track?`当前轨：${track.name}`:'当前音轨（未选择）';materialElement('materialInsertTarget').querySelector('[value=current]').disabled=!track;
 materialElement('materialUseTimbre').disabled=mode.value==='audio';
 renderPlacedAudioClips();
}
function renderPlacedAudioClips(){
 const track=selectedPerformanceTrack(),element=materialElement('placedAudioClips');if(!element)return;
 element.innerHTML=(track?.audioClips||[]).map(clip=>`<span class="placed-audio-clip">${escapeHtml(clip.name)} · ${formatTime(clip.start*arrangement.baseBpm/arrangement.bpm)} 起<button type="button" data-remove-audio="${escapeHtml(clip.id)}" aria-label="移除原声片段 ${escapeHtml(clip.name)}" ${performanceInput.recording?'disabled':''}>×</button></span>`).join('');
}
function audioPeaks(buffer){const data=buffer.getChannelData(0),count=96,step=Math.max(1,Math.floor(data.length/count)),result=[];for(let i=0;i<count;i++){let peak=0;const end=Math.min(data.length,(i+1)*step);for(let j=i*step;j<end;j+=Math.max(1,Math.floor(step/250)))peak=Math.max(peak,Math.abs(data[j]||0));result.push(Math.min(1,peak));}return result;}
async function audioDigest(blob){if(!crypto.subtle)return '';const bytes=await crypto.subtle.digest('SHA-256',await blob.arrayBuffer());return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');}
async function captureStudioMaterial(){
 if(materialLibrary.busy||state.isRecording||state.isAnalyzing||(!state.notes.length&&!state.audioBlob))return;
 const definition=getInstrumentDefinition(state.instrument),snapshot={id:makeId('material'),name:(materialElement('materialNameInput').value.trim()||state.sourceName||`旋律片段 ${new Date().toLocaleString('zh-CN')}`).slice(0,60),bpm:Number(els.tempoInput.value)||84,instrument:state.instrument,instrumentBase:definition.baseInstrument||definition.id,instrumentName:definition.name,instrumentPatch:{...LAB_DEFAULTS[definition.baseInstrument||definition.id],...(definition.params||{})},key:state.key?{tonic:state.key.tonic,mode:state.key.mode}:null,notes:state.notes.map(note=>({...note})),recognitionProfile:state.analysisProfile||state.recognitionProfile,recognitionOnsetFirst:state.analysisOnsetFirst??(state.recognitionOnsetFirst!==false),rhythmHits:(state.rhythmHits||[]).map(h=>({...h})),audio:null,createdAt:Date.now(),deletedAt:null},blob=state.audioBlob,existingBuffer=state.audioBuffer,duration=state.duration;
 materialLibrary.busy=true;syncMaterialCaptureState();renderMaterialLibrary();
 try{
  let asset=null;
  if(blob?.size){
   let buffer=existingBuffer;
   const context=getAudioContext(false);
   if(!buffer)try{buffer=await context.decodeAudioData(await blob.arrayBuffer());}catch{}
   const id=makeId('audio');
   asset={id,blob,mime:blob.type||'application/octet-stream',duration:buffer?.duration||Math.max(.01,duration),size:blob.size,peaks:buffer?audioPeaks(buffer):[],sha256:await audioDigest(blob)};
   snapshot.audio={id,duration:asset.duration,mime:asset.mime,size:asset.size,peaks:asset.peaks,sha256:asset.sha256};
   if(buffer){materialLibrary.bufferContext=context;materialLibrary.buffers.set(id,buffer);}
  }
  const meta=MeldMaterialCore.validate(snapshot);
  await putMaterialRecord(meta,asset);
  savedStudioBlob=asset?blob:null;
  materialLibrary.selected=meta.id;materialLibrary.showTrash=false;materialElement('materialSearch').value='';materialElement('materialNameInput').value='';
  await refreshMaterialLibrary();
  showToast(asset?(meta.notes.length?'原声和旋律已存入素材库':'录音已存入素材库'):'旋律已存入素材库');
 }catch(error){showToast(`素材未能保存：${error.message||'请检查本机存储空间'}`);}
 finally{materialLibrary.busy=false;syncMaterialCaptureState();renderMaterialLibrary();}
}
function downloadStudioAudio(){
 const blob=state.audioBlob;
 if(!blob?.size)return;
 const type=blob.type.split(';')[0].split('/')[1];
 const extension={mpeg:'mp3',mp4:'m4a','x-m4a':'m4a','x-wav':'wav'}[type]||type?.match(/^(wav|webm|ogg|flac|aac|aiff|opus)$/)?.[0]||'audio';
 const link=document.createElement('a'),url=URL.createObjectURL(blob);
 const name=(state.sourceName||'Melohum 录音').replace(/\.[^./\\]+$/,'').replace(/[<>:"/\\|?*]/g,'-');
 link.href=url;link.download=name+'.'+extension;link.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
function stopMaterialOriginal(){const player=materialElement('materialOriginalAudio');if(player){player.pause();player.removeAttribute('src');}if(materialLibrary.previewURL){URL.revokeObjectURL(materialLibrary.previewURL);materialLibrary.previewURL=null;}if(materialLibrary.previewKind==='audio')materialLibrary.previewKind=null;}
async function previewMaterialOriginal(){
 const item=currentMaterial();if(!item?.audio)return;
 try{const asset=await materialRead('audio',item.audio.id);if(!asset?.blob)throw new Error('这份原声不在当前浏览器，可导入素材备份恢复');stopArrangementPlayback(false);stopMelodyPlayback();releasePerformanceKeys();stopMaterialOriginal();materialLibrary.previewURL=URL.createObjectURL(asset.blob);const player=materialElement('materialOriginalAudio');player.src=materialLibrary.previewURL;player.hidden=false;materialLibrary.previewKind='audio';await player.play();}catch(error){showToast(error.message||'原声暂时无法试听');}
}
function recoverMaterialInstrument(item){
 if(item.instrument.startsWith('custom:')&&!customPatches.some(patch=>`custom:${patch.id}`===item.instrument)){
  customPatches.push({id:item.instrument.slice(7),name:item.instrumentName,instrument:LAB_DEFAULTS[item.instrumentBase]?item.instrumentBase:'piano',params:{...item.instrumentPatch},createdAt:Date.now()});persistCustomPatches();renderInstruments();renderMyPatches();
 }
}
function materialVoiceTrack(item,name=item.name){recoverMaterialInstrument(item);const id=getAllInstrumentDefinitions().some(def=>def.id===item.instrument)?item.instrument:'piano',track=createArrangementTrack(id,name,[]);track.instrumentName=item.instrumentName;track.instrumentBase=LAB_DEFAULTS[item.instrumentBase]?item.instrumentBase:'piano';track.instrumentPatch={...LAB_DEFAULTS[track.instrumentBase],...item.instrumentPatch};track.audioClips=[];return track;}
async function previewMaterialMelody(){
 const item=currentMaterial();if(!item?.notes.length)return;
 stopArrangementPlayback(false);stopMelodyPlayback();releasePerformanceKeys();stopMaterialOriginal();const track=materialVoiceTrack(item);track.notes=item.notes.map(note=>({...note}));
 const context=getAudioContext();
 if(!sampledInstrumentReady(grandPianoTrackBase(track),context)){const token=arrangement.audioLoadToken=(arrangement.audioLoadToken||0)+1;arrangement.loadingAudio=true;try{await prepareSampledTracks([track],context);}catch(error){if(token===arrangement.audioLoadToken){arrangement.loadingAudio=false;showToast(error.message);}return;}if(token!==arrangement.audioLoadToken)return;arrangement.loadingAudio=false;}
 const duration=Math.max(.1,...track.notes.map(note=>note.start+note.duration));arrangement.isPlaying=true;materialLibrary.previewKind='melody';startArrangementScheduler([track],context.currentTime+.05,1,0);els.arrangePlayBtn.classList.add('is-playing');els.arrangePlayBtn.setAttribute('aria-label','暂停编曲');els.arrangeStatus.textContent='正在按素材原速度试听旋律';arrangement.endTimer=window.setTimeout(()=>stopArrangementPlayback(false),(duration+1.8)*1000);
}
function materialInsertionStart(){return materialElement('materialInsertAt').value==='cursor'?arrangement.playhead:(Math.max(1,Number(materialElement('materialInsertBar').value)||1)-1)*4*60/arrangement.baseBpm;}
async function insertSelectedMaterial(){
 const item=currentMaterial();if(!item||item.deletedAt||materialLibrary.busy||performanceInput.recording||performanceInput.preparing)return;
 const before=arrangementTemplateSnapshot(),kind=materialElement('materialInsertMode').value,start=materialInsertionStart(),useTimbre=materialElement('materialUseTimbre').checked;
 materialLibrary.busy=true;renderMaterialLibrary();
 try{
  if(kind==='audio')await loadMaterialAudioBuffer(item.audio.id,getAudioContext());
  if(MeldArrangementAI.fingerprint(before)!==MeldArrangementAI.fingerprint(arrangementTemplateSnapshot()))throw new Error('编曲刚有新改动，请重新放入以保留这些编辑');
  const placed=MeldMaterialCore.placement(item,{kind,start,baseBpm:arrangement.baseBpm,bpm:arrangement.bpm},()=>makeId('audio-clip'));
  stopArrangementPlayback(false);stopMelodyPlayback();releasePerformanceKeys();stopMaterialOriginal();
  let track=materialElement('materialInsertTarget').value==='current'?selectedPerformanceTrack():null;
  if(!track){track=kind==='melody'?materialVoiceTrack(item):createArrangementTrack('piano',`${item.name} · 原声`,[]);track.audioClips=[];arrangement.tracks.push(track);}
  else if(kind==='melody'&&useTimbre){const voice=materialVoiceTrack(item);Object.assign(track,{instrument:voice.instrument,instrumentName:voice.instrumentName,instrumentBase:voice.instrumentBase,instrumentPatch:voice.instrumentPatch,color:voice.color});}
  track.notes.push(...placed.notes);track.notes.sort((a,b)=>a.start-b.start||a.midi-b.midi);track.audioClips=[...(track.audioClips||[]),...placed.audioClips];
  performanceInput.trackId=track.id;persistArrangement();renderArrangement();materialLibrary.history.push({before,after:MeldArrangementAI.fingerprint(arrangementTemplateSnapshot())});if(materialLibrary.history.length>30)materialLibrary.history.shift();showToast(kind==='audio'?'原声已放入音轨，保留原速与原音高':'旋律已放入音轨，可按工程速度播放和换音色');
 }catch(error){showToast(`未能放入：${error.message}`);}finally{materialLibrary.busy=false;renderMaterialLibrary();}
}
function undoMaterialOperation(){const entry=materialLibrary.history[materialLibrary.history.length-1];if(!entry||performanceInput.recording)return;if(MeldArrangementAI.fingerprint(arrangementTemplateSnapshot())!==entry.after){showToast('放入后已有其他编辑，暂不覆盖这些新改动');return;}stopArrangementPlayback(false);releasePerformanceKeys();materialLibrary.history.pop();Object.assign(arrangement,entry.before);state.activeProjectId=entry.before.activeProjectId||null;performanceInput.trackId=arrangement.tracks[0]?.id||null;persistArrangement();renderArrangement();showToast('已撤销本次素材操作');}
function removePlacedAudio(id){const track=selectedPerformanceTrack();if(!track||performanceInput.recording)return;const before=arrangementTemplateSnapshot();stopArrangementPlayback(false);track.audioClips=(track.audioClips||[]).filter(clip=>clip.id!==id);persistArrangement();renderArrangement();materialLibrary.history.push({before,after:MeldArrangementAI.fingerprint(arrangementTemplateSnapshot())});renderMaterialLibrary();showToast('已从音轨移除此段原声，素材库仍保留原件');}
async function toggleMaterialTrash(){const item=currentMaterial();if(!item||materialLibrary.busy)return;try{await putMaterialRecord({...item,deletedAt:item.deletedAt?null:Date.now()});await refreshMaterialLibrary();showToast(item.deletedAt?'素材已恢复':'已移入回收站，现有音轨不受影响');}catch(error){showToast(`操作未完成：${error.message}`);}}
function materialBlobDataURL(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);});}
async function exportMaterial(){const item=currentMaterial();if(!item)return;try{const asset=item.audio?await materialRead('audio',item.audio.id):null;if(item.audio&&!asset?.blob)throw new Error('原声缺失，请先恢复素材备份');const packet={format:'meld.material.v1',material:item,audio:asset?{dataURL:await materialBlobDataURL(asset.blob)}:null},blob=new Blob([JSON.stringify(packet)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=item.name.replace(/[\\/:*?"<>|]/g,'_')+'.meldclip';link.click();window.setTimeout(()=>URL.revokeObjectURL(url),2000);showToast('已导出素材备份，包含旋律与已有原声');}catch(error){showToast(`导出未完成：${error.message}`);}}
async function importMaterial(file){
 if(!file||materialLibrary.busy)return;materialLibrary.busy=true;syncMaterialCaptureState();renderMaterialLibrary();
 try{
  if(file.size>120000000)throw new Error('素材备份过大');const packet=JSON.parse(await file.text());if(packet.format!=='meld.material.v1')throw new Error('不是 Melohum 素材备份');const meta=MeldMaterialCore.validate(packet.material);meta.deletedAt=null;
  if(materialLibrary.items.some(item=>item.id===meta.id))meta.id=makeId('material');let asset=null;
  if(meta.audio){const data=packet.audio?.dataURL;if(typeof data!=='string'||!/^data:(audio\/[^;,]+|video\/webm|application\/octet-stream)(?:;codecs=[a-z0-9. _=\"-]+)?;base64,[a-z0-9+/=\r\n]+$/i.test(data))throw new Error('原声备份格式不正确');const comma=data.indexOf(','),binary=atob(data.slice(comma+1));if(binary.length>80000000)throw new Error('原声音频过大');const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0)),blob=new Blob([bytes],{type:meta.audio.mime}),context=getAudioContext(),buffer=await context.decodeAudioData(await blob.arrayBuffer()),sha256=await audioDigest(blob),existing=await materialRead('audio',meta.audio.id);if(existing&&(!sha256||existing.sha256!==sha256))meta.audio.id=makeId('audio');asset={id:meta.audio.id,blob,mime:blob.type,duration:buffer.duration,size:blob.size,peaks:audioPeaks(buffer),sha256};meta.audio={id:asset.id,duration:asset.duration,mime:asset.mime,size:asset.size,peaks:asset.peaks,sha256};materialLibrary.bufferContext=context;materialLibrary.buffers.set(asset.id,buffer);}
  await putMaterialRecord(MeldMaterialCore.validate(meta),asset);materialLibrary.selected=meta.id;materialLibrary.showTrash=false;materialElement('materialSearch').value='';await refreshMaterialLibrary();showToast('素材备份已导入，可放入任意音轨');
 }catch(error){showToast(`导入未完成：${error.message}`);}finally{materialLibrary.busy=false;syncMaterialCaptureState();renderMaterialLibrary();}
}
async function loadMaterialAudioBuffer(id,context=getAudioContext()){
 if(materialLibrary.bufferContext!==context){materialLibrary.buffers.clear();materialLibrary.decoding.clear();materialLibrary.bufferContext=context;}
 if(materialLibrary.buffers.has(id))return materialLibrary.buffers.get(id);if(materialLibrary.decoding.has(id))return materialLibrary.decoding.get(id);
 const promise=(async()=>{const asset=await materialRead('audio',id);if(!asset?.blob)throw new Error('这份原声不在当前浏览器，请先导入素材备份');const buffer=await context.decodeAudioData(await asset.blob.arrayBuffer());materialLibrary.buffers.set(id,buffer);return buffer;})();materialLibrary.decoding.set(id,promise);try{return await promise;}finally{materialLibrary.decoding.delete(id);}
}
async function prepareMaterialAudioTracks(tracks,context=getAudioContext()){
 const ids=new Set(tracks.flatMap(track=>(track.audioClips||[]).map(clip=>clip.audioAssetId)));for(const id of materialLibrary.buffers.keys())if(!ids.has(id))materialLibrary.buffers.delete(id);await Promise.all([...ids].map(id=>loadMaterialAudioBuffer(id,context)));
}
function scheduleMaterialAudio(track,clip,when,timelineOffset,speedScale,end=Infinity){
 const context=getAudioContext(),buffer=materialLibrary.buffers.get(clip.audioAssetId),window=MeldMaterialCore.sourceWindow(clip,timelineOffset,speedScale);if(!buffer||!window)return;
 const duration=Math.min(window.duration,buffer.duration-window.offset,(end-window.from)*speedScale);if(duration<=0)return;
 const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;source.playbackRate.value=1;gain.gain.value=1;source.connect(gain);gain.connect(getArrangementDestination(track,null,context));source.onended=()=>{source.meldEnded=true;try{source.disconnect();gain.disconnect();}catch{}};source.start(when,window.offset,duration);source.stop(when+duration+.02);arrangement.nodes.push(source);state.playNodes.push(source);
}
function setupMaterialLibrary(){
 materialElement('saveMaterialBtn').addEventListener('click',captureStudioMaterial);
 materialElement('downloadStudioAudio').addEventListener('click',downloadStudioAudio);
 materialElement('materialNameInput').addEventListener('input',syncMaterialCaptureState);
 materialElement('materialToMidi').addEventListener('click',async()=>{
  const item=currentMaterial(),owner=materialLibrary.databaseName;
  if(!item?.audio||item.deletedAt)return;
  try{
   const asset=await materialRead('audio',item.audio.id);
   if(materialLibrary.databaseName!==owner||currentMaterial()?.id!==item.id)return;
   if(!asset?.blob)throw Error('找不到这段原声');
   window.MeldOpenTranscription(asset.blob,item.name);
  }catch(error){showToast(error.message);}
 });
 const open=()=>{switchView('arrangement');materialElement('materialLibraryDetails').open=true;materialElement('arrangementLibrary').scrollIntoView({behavior:'smooth',block:'start'});};
 materialElement('studioOpenLibraryBtn').addEventListener('click',open);materialElement('arrangeOpenLibraryBtn').addEventListener('click',()=>{materialElement('materialLibraryDetails').open=true;materialElement('arrangementLibrary').scrollIntoView({behavior:'smooth',block:'start'});});
 materialElement('materialList').addEventListener('click',event=>{const button=event.target.closest('[data-material-id]');if(button){stopMaterialOriginal();materialLibrary.selected=button.dataset.materialId;renderMaterialLibrary();}});
 materialElement('materialSearch').addEventListener('input',renderMaterialLibrary);materialElement('materialTrashToggle').addEventListener('click',()=>{materialLibrary.showTrash=!materialLibrary.showTrash;stopMaterialOriginal();renderMaterialLibrary();});
 materialElement('materialPreviewOriginal').addEventListener('click',previewMaterialOriginal);materialElement('materialPreviewMelody').addEventListener('click',previewMaterialMelody);
 materialElement('materialInsertBtn').addEventListener('click',insertSelectedMaterial);materialElement('materialUndoInsert').addEventListener('click',undoMaterialOperation);materialElement('materialRemoveBtn').addEventListener('click',toggleMaterialTrash);materialElement('materialExportBtn').addEventListener('click',exportMaterial);
 materialElement('materialImportBtn').addEventListener('click',()=>materialElement('materialImportInput').click());materialElement('materialImportInput').addEventListener('change',event=>{const file=event.target.files?.[0];importMaterial(file);event.target.value='';});
 materialElement('materialInsertAt').addEventListener('change',()=>{materialElement('materialInsertBar').disabled=materialElement('materialInsertAt').value!=='bar';});
 materialElement('materialInsertMode').addEventListener('change',renderMaterialLibrary);materialElement('materialInsertTarget').addEventListener('change',event=>{materialElement('materialUseTimbre').checked=event.target.value==='new';renderMaterialLibrary();});
 materialElement('placedAudioClips').addEventListener('click',event=>{const button=event.target.closest('[data-remove-audio]');if(button)removePlacedAudio(button.dataset.removeAudio);});
 window.addEventListener('beforeunload',stopMaterialOriginal);refreshMaterialLibrary();syncMaterialCaptureState();
}
function cloneArrangementTrackData(track){return MeldMaterialCore.clone(track);}
function materialAudioTrackSvg(track,duration){
 const clips=track.audioClips||[];if(!clips.length)return '';
 return `<svg class="arrange-clip-wave audio-clip-wave" viewBox="0 0 1000 54" preserveAspectRatio="none" aria-hidden="true">${clips.map(clip=>{const x=8+clip.start/duration*984,width=Math.max(2,MeldMaterialCore.clipDuration(clip,arrangement.baseBpm,arrangement.bpm)/duration*984),peaks=clip.peaks||[];return `<rect x="${x}" y="2" width="${width}" height="49" rx="4"/><g>${peaks.map((peak,i)=>`<path d="M${x+(i+.5)*width/Math.max(1,peaks.length)} ${27-peak*20}v${Math.max(1,peak*40)}"/>`).join('')}</g>`;}).join('')}</svg>`;
}
function materialTrackLabel(track){const clips=track.audioClips?.length||0;return [track.notes.length?`${track.notes.length} NOTES`:'',clips?`${clips} AUDIO`:''].filter(Boolean).join(' + ')||'EMPTY';}
