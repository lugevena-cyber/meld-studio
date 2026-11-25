/* Local separated recordings: audio stems, never synthesized substitute parts. */
(function(root){
 'use strict';
 const ids=['vocals','drums','bass','guitar','piano','other'];
 function validateManifest(data){
  if(data?.format!=='meld.stems.v1'||!Array.isArray(data.stems)||data.stems.length!==6||!Number.isFinite(data.duration)||data.duration<=0||data.duration>7200)throw new Error('分轨清单不完整');
  const seen=new Set();for(const s of data.stems){if(!ids.includes(s.id)||seen.has(s.id)||![`studies/hong-kong/stems/${s.id}.wav`,`studies/hong-kong/stems/${s.id}.flac`,`studies/hong-kong/stems/${s.id}.mp3`].includes(s.file)||!Number.isFinite(s.duration)||Math.abs(s.duration-data.duration)>.001||s.frames!==data.frames||s.sampleRate!==data.sampleRate||!/^[a-f0-9]{64}$/.test(s.sha256)||!Array.isArray(s.peaks))throw new Error('分轨时长、编号或文件信息不一致');seen.add(s.id);}
  return data;
 }
 function shouldAutoImport(tracks){return !tracks.some(t=>t.notes?.length||t.audioClips?.length);}
 root.MeldStemSession={validateManifest,shouldAutoImport};
 if(typeof document==='undefined')return;
 if(!document.getElementById('hongKongSessionHost'))return;
 const panel=document.createElement('section');panel.className='stem-session';panel.setAttribute('aria-label','原曲分轨研习');
 panel.className='night-pocket-demo';
 panel.innerHTML='<div class="night-pocket-info"><p class="night-pocket-meta">AI 分轨 · 六条原声音轨</p><h2>Hong Kong</h2><p>载入人声、鼓、贝斯、吉他、钢琴和其他伴奏，逐轨独奏查看分离效果。分轨可能有串音。</p><p>也可以上传自己喜欢的音乐，听听分轨后的样子。</p></div><div class="night-pocket-controls"><div class="night-pocket-actions"><button class="solid-action" id="stemSessionLoad" type="button" disabled>载入六条原声音轨</button><button class="outline-action" id="stemSessionRestore" type="button" disabled>恢复载入前编曲</button><button class="outline-action" id="stemSessionUpload" type="button">上传歌曲分轨</button></div><output id="stemSessionStatus" aria-live="polite">正在检查分轨文件…</output><button class="text-button" id="stemSessionRefresh" type="button" hidden>重试检查</button></div>';
 const host=document.getElementById('hongKongSessionHost');host.append(panel);
 const el=id=>document.getElementById(id),status=message=>{el('stemSessionStatus').textContent=message;},backupKey=()=>accountStorageKey('meld.stems-backup.v1');let manifest=null,busy=false;
 async function refresh(){
  el('stemSessionRefresh').hidden=true;
  try{const response=await fetch('studies/hong-kong/stems/manifest.json',{cache:'no-store'});if(!response.ok){const progress=await fetch('studies/hong-kong/stems/status.json',{cache:'no-store'}).then(r=>r.ok?r.json():null);el('stemSessionRefresh').hidden=false;status(progress?.stage?`本机进度：${progress.stage}${progress.bytes&&progress.total?' · '+Math.round(progress.bytes/progress.total*100)+'%':''}`:'分轨尚未完成');return;}
   manifest=validateManifest(await response.json());status(`六条原曲声部已就绪 · ${Math.floor(manifest.duration/60)}:${String(Math.floor(manifest.duration%60)).padStart(2,'0')} · 同步起点 · 可逐轨独奏、静音、调效果`);el('stemSessionLoad').disabled=false;
  }catch(error){el('stemSessionRefresh').hidden=false;status('分轨未就绪：'+error.message);}
 }
 async function load(options={}){
  if(options.automatic&&!shouldAutoImport(arrangement.tracks)){switchView('arrangement');status('已保留现有编曲、原声音轨和音色调整；需要重新载入时可点击“载入六条原声音轨”，载入前会备份。');return;}
  if(busy||!manifest)return;if(performanceInput.recording||performanceInput.preparing||state.isRecording){showToast('先停止录音，再载入分轨');return;}
  busy=true;el('stemSessionLoad').disabled=true;const before=arrangementTemplateSnapshot(),signature=MeldArrangementAI.fingerprint(before),owner=cloudSession?.user?.id||'guest',pending=[];
  try{
   const expected=new Set(manifest.stems.map(s=>'hk6s:'+s.sha256.slice(0,28)));
   const present=new Set(arrangement.tracks.flatMap(t=>(t.audioClips||[]).map(c=>c.audioAssetId)));
   if([...expected].every(id=>present.has(id))||ids.every(id=>arrangement.tracks.some(t=>t.sourceStem===id&&t.audioClips?.some(c=>String(c.audioAssetId).startsWith('hk6s:'))))){switchView('arrangement');status('六条原曲音轨已在编曲中，同时保留新增的采样演奏轨、音符和效果修改。');return;}
   for(const [index,s]of manifest.stems.entries()){
    status(`准备原曲音轨 ${index+1}/6：${s.name}`);const assetId='hk6s:'+s.sha256.slice(0,28),materialId='hk6s-material:'+s.sha256.slice(0,28);let asset=await materialRead('audio',assetId);
    if(!asset?.blob){const response=await fetch(s.file);if(!response.ok)throw new Error(s.name+' 文件缺失');const blob=await response.blob();if(blob.size!==s.size||await audioDigest(blob)!==s.sha256)throw new Error(s.name+' 文件校验未通过');asset={id:assetId,blob,mime:s.mime||'audio/flac',duration:s.duration,size:blob.size,peaks:s.peaks,sha256:s.sha256};}
    if((cloudSession?.user?.id||'guest')!==owner)throw new Error('账户已切换，请重新载入');
    const instrument=getInstrumentDefinition(s.instrument),meta=MeldMaterialCore.validate({id:materialId,name:'Hong Kong · '+s.name,bpm:manifest.bpm,instrument:instrument.id,instrumentBase:instrument.baseInstrument||instrument.id,instrumentName:s.name,instrumentPatch:{},notes:[],audio:{id:asset.id,mime:s.mime||'audio/flac',duration:s.duration,size:s.size,sha256:s.sha256,peaks:s.peaks},createdAt:Date.now()});
    await putMaterialRecord(meta,asset);const track=createArrangementTrack(instrument.id,s.name,[]);track.color=s.color;track.volume=100;track.sourceStem=s.id;track.audioClips=MeldMaterialCore.placement(meta,{kind:'audio',start:0,baseBpm:manifest.bpm,bpm:manifest.bpm},()=>makeId('stem-clip')).audioClips;pending.push(track);
   }
   if((cloudSession?.user?.id||'guest')!==owner||MeldArrangementAI.fingerprint(arrangementTemplateSnapshot())!==signature)throw new Error('编曲或账户刚有变化，原编曲已保留，请重新载入');
   localStorage.setItem(backupKey(),JSON.stringify(before));stopPerformanceTake();releasePerformanceKeys();stopSourcePlayback();stopMelodyPlayback();stopArrangementPlayback(false);
   arrangement.tracks=pending;arrangement.bpm=manifest.bpm;arrangement.baseBpm=manifest.bpm;arrangement.duration=manifest.duration;arrangement.playhead=0;arrangement.sections=Array.from({length:Math.ceil(manifest.duration/30)},(_,i)=>({name:`${Math.floor(i*30/60)}:${String(i*30%60).padStart(2,'0')}`,start:i*30}));arrangement.templateMeta={id:'hong-kong-separated',title:manifest.title,keyName:'AI分离原声',duration:manifest.duration,bars:Math.ceil(manifest.duration*manifest.bpm/240),trackCount:6};state.activeProjectId=null;performanceInput.history=[];performanceInput.trackId=pending[0].id;els.tempoInput.value=String(manifest.bpm);persistArrangement();renderArrangement();await refreshMaterialLibrary();switchView('arrangement');el('stemSessionRestore').disabled=false;status('已载入 6 条同步原曲音频轨。点 S 独奏、M 静音、FX 调效果；六条分离音频也已存入素材库。');showToast('原曲六声部已载入编曲台');
  }catch(error){status('载入未完成：'+error.message);}finally{busy=false;el('stemSessionLoad').disabled=false;}
 }
 el('stemSessionUpload').addEventListener('click',()=>{
  el('stemPanel').open=true;
  el('stemPanel').querySelector('summary').focus();
  el('stemFile').click();
 });
 el('stemSessionLoad').addEventListener('click',load);el('stemSessionRefresh').addEventListener('click',refresh);
 el('stemSessionRestore').addEventListener('click',()=>{if(busy||performanceInput.recording)return;try{const old=JSON.parse(localStorage.getItem(backupKey()));if(!old)return;stopArrangementPlayback(false);Object.assign(arrangement,old);state.activeProjectId=old.activeProjectId||null;performanceInput.trackId=arrangement.tracks[0]?.id||null;persistArrangement();renderArrangement();status('已恢复载入前的编曲；分离音频仍在素材库，可再次调用。');}catch(error){status('恢复失败：'+error.message);}});
 el('stemSessionRestore').disabled=!localStorage.getItem(backupKey());
 const link=document.createElement('button');link.type='button';link.className='text-button';link.textContent='打开原曲六声部分轨编曲台 ↗';link.addEventListener('click',()=>{switchView('arrangement');el('arrangementDemoDrawer').open=true;el('stemSessionLoad').focus();});document.querySelector('.song-study')?.append(link);
 refresh();
})(typeof window!=='undefined'?window:globalThis);
