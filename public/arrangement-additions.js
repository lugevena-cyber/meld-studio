(() => {
 const el=id=>document.getElementById(id);
 const scroller=document.querySelector('#arrangementView .arrangement-editor');
 scroller.addEventListener('scroll',()=>scroller.style.setProperty('--track-scroll-top',`${scroller.scrollTop}px`),{passive:true});
 const deletion=el('deleteTracksDialog'), numbers=el('deleteTrackNumbers'), deleteStatus=el('deleteTracksStatus');
 let originalOrder=[];
 function openDelete(id){
  if(layoutLocked()){showToast('请先停止分轨录制');return;}
  if(!arrangement.tracks.length){showToast('当前没有音轨');return;}
  originalOrder=arrangement.tracks.map(track=>track.id);
  const index=originalOrder.indexOf(id);
  numbers.value=index<0?'':String(index+1).padStart(2,'0');
  deleteStatus.textContent='';
  deletion.showModal();
  numbers.select();
 }
 function parseNumbers(value){
  const indices=new Set();
  for(const part of value.split(/[,，、]/)){
   const match=part.trim().match(/^(\d{1,3})(?:\s*[-–－]\s*(\d{1,3}))?$/);
   if(!match)throw new Error('请输入有效编号，例如 01、07 或 01-03');
   const start=Number(match[1]),end=Number(match[2]??match[1]);
   if(start<1||end<start||end>originalOrder.length)throw new Error(`编号须在 1–${originalOrder.length} 内，范围从小到大`);
   for(let index=start;index<=end;index++)indices.add(index);
  }
  return new Set([...indices].map(index=>originalOrder[index-1]));
 }
 el('deleteTracksForm').addEventListener('submit',event=>{
  event.preventDefault();
  if(originalOrder.join(',')!==arrangement.tracks.map(track=>track.id).join(',')){
   deleteStatus.textContent='音轨顺序已变化，请关闭后重新选择';return;
  }
  try{
   const count=deleteArrangementTracks(parseNumbers(numbers.value));
   if(!count){deleteStatus.textContent='请先停止录制或拖动';return;}
   deletion.close();
   showToast(`已删除 ${count} 条音轨，可撤销音轨操作`);
  }catch(error){deleteStatus.textContent=error.message;}
 });
 el('cancelDeleteTracks').addEventListener('click',()=>deletion.close());
 el('removeTracks').addEventListener('click',()=>openDelete(selectedArrangementTrack()?.id));
 el('addEmptyTrack').addEventListener('click',event=>{
  if(layoutLocked()){showToast('请先停止分轨录制');return;}
  if(arrangement.tracks.length>=48){showToast('最多支持 48 条音轨');return;}
  openTrackDialog(null,event.currentTarget);
 });
 window.MeldTrackActions={openDelete};

 const panel=el('assistantSingleTrack'),instrumentInput=el('assistantTrackInstrument'),instrumentLabel=el('assistantTrackInstrumentLabel');
 const status=el('assistantTrackStatus'),choices=el('assistantTrackChoices'),prompt=el('assistantPrompt');
 let draft=null,busy=false,pickFor='';
 const aliases={
  piano:['钢琴','piano'],epiano:['电钢琴','电钢','electric piano','rhodes'],organ:['风琴','organ'],
  acoustic:['木吉他','原声吉他','acoustic guitar'],electric:['电吉他','electric guitar'],
  mutedguitar:['闷音吉他','切分吉他','muted guitar'],bass:['贝斯','低音吉他','bass'],sax:['萨克斯','saxophone','sax'],
  flute:['长笛','flute'],violin:['小提琴','violin'],strings:['弦乐','strings'],synth:['合成器','synth'],
  drum80:['鼓组','鼓机','drums','drum machine']
 };
 function resolveInstrument(catalog,description){
  const input=description.toLowerCase();
  const matches=[];
  for(const item of catalog)for(const term of [item.id,item.name,...(aliases[item.id]||[])]){
   const name=term.toLowerCase().trim();
   if(!name)continue;
   const safe=name.replace(/[.*+?^$${}()|[\]\\]/g,'\\$&');
   const pattern=/^[a-z0-9]/.test(name)?new RegExp(`\\b${safe}\\b`):new RegExp(safe);
   const match=pattern.exec(input);
   if(match)matches.push({item,index:match.index,length:name.length});
  }
  return matches.sort((a,b)=>a.index-b.index||b.length-a.length)[0]?.item;
 }
 function renderChoices(){
  if(draft&&draft.account!==assistantChatStorageKey()){draft=null;pickFor='';status.textContent='';}
  const current=draft?.account===assistantChatStorageKey();
  panel.hidden=assistantTask!=='compose'||(!current&&!status.textContent);
  instrumentLabel.hidden=!pickFor;
  choices.hidden=!current;
  for(const button of choices.querySelectorAll('button'))button.disabled=busy||(button.dataset.singleTrack==='save'&&draft?.saved);
 }
 function request(message){
  const scope=/(?:只|仅)(?:想)?\s*(?:用|使用|要)|单(?:一)?轨|独奏|\b(?:only|solo|single[ -]track)\b/i.exec(message);
  if(!scope)return false;
  if(busy)return true;
  if(!arrangementAssistant.connected){status.textContent='单轨生成需要连接在线 AI 服务。';renderChoices();return true;}
  if(arrangementAssistant.images.length){status.textContent='单轨生成使用文字描述，请先移除参考图。';renderChoices();return true;}
  const catalog=assistantCatalog();
  const instrument=resolveInstrument(catalog,message.slice(scope.index+scope[0].length))||resolveInstrument(catalog,message)
   ||(pickFor===message&&catalog.find(item=>item.id===instrumentInput.value));
  if(!instrument){
   if(pickFor!==message)instrumentInput.innerHTML='<option value="">请选择乐器</option>'+instrumentSelectOptions();
   pickFor=message;
   status.textContent='请选择想要的乐器，再点「生成草稿」。';
   renderChoices();instrumentInput.focus();
   return true;
  }
  pickFor='';
  void generateTrack(message,instrument);
  return true;
 }
 window.MeldSingleTrack={request,render:renderChoices,clear(){draft=null;pickFor='';status.textContent='';renderChoices();}};
 async function generateTrack(message,instrument){
  const account=assistantChatStorageKey();
  busy=true;arrangementAssistant.busy=true;status.textContent='正在生成单轨…';renderAssistantState();
  try{
   const response=await fetch('/api/assistant/track',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(100000),
    body:JSON.stringify({message,bpm:arrangement.bpm,instrument:{id:instrument.id,name:instrument.name,isDrum:instrument.isDrum}})});
   const data=await response.json();
   if(account!==assistantChatStorageKey())return;
   if(!response.ok)throw new Error(data.error||'暂时无法生成单轨');
   const song=data.song,part=song.tracks[0],notes=[],beatSeconds=60/song.bpm;
   for(const clip of part.clips)for(let repeat=0;repeat<clip.repeat;repeat++)for(const note of clip.notes){
    notes.push({midi:note.midi,start:(4*(clip.startBar+repeat*clip.bars)+note.beat)*beatSeconds,duration:Math.max(.01,note.duration*beatSeconds),velocity:note.velocity});
   }
   const material=MeldMaterialCore.validate({id:makeId('material'),name:song.title.slice(0,60),bpm:song.bpm,instrument:part.instrument,
    instrumentBase:instrument.baseInstrument,instrumentName:instrument.name.slice(0,60),instrumentPatch:part.params||{},key:song.key,notes});
   draft={account,song,material,saved:false};
   arrangementAssistant.pending=null;
   if(prompt.value.trim()===message)prompt.value='';
   status.textContent=`${song.title} · ${song.bpm} BPM · ${song.bars} 小节 · ${notes.length} 个音符`;
  }catch(error){
   if(account===assistantChatStorageKey())status.textContent=error.name==='TimeoutError'?'单轨生成超时，请重试':error.message;
  }finally{busy=false;arrangementAssistant.busy=false;renderAssistantState();}
 }
 choices.addEventListener('click',async event=>{
  const action=event.target.closest('[data-single-track]')?.dataset.singleTrack;
  if(!action||busy||!draft||draft.account!==assistantChatStorageKey())return;
  const {material,song}=draft;
  if(action==='save'){
   busy=true;renderChoices();
   try{
    await putMaterialRecord(material);
    draft.saved=true;
    await refreshMaterialLibrary();
    showToast('单轨素材已保存到素材库');
   }catch(error){showToast(error.message);}
   finally{busy=false;renderChoices();}
   return;
  }
  if(layoutLocked()){showToast('请先停止分轨录制');return;}
  if(arrangementAssistant.busy){showToast('请等待当前 AI 请求完成');return;}
  const replace=action==='replace';
  if(!replace&&arrangement.tracks.length>=48){showToast('最多支持 48 条音轨，请先删除一条');return;}
  if(replace&&arrangement.tracks.length&&!window.confirm('用这条素材替换当前全部音轨？可使用「撤销本次实验」恢复。'))return;
  const before=assistantSnapshot(),bpm=replace||!before.tracks.length?song.bpm:before.bpm;
  const baseBpm=replace||!before.tracks.length?song.bpm:before.baseBpm;
  const track=materialVoiceTrack(material);
  track.notes=MeldMaterialCore.placement(material,{kind:'notes',start:0,baseBpm,bpm},()=>makeId('clip')).notes;
  track.volume=song.tracks[0].volume;
  track.noteEditKey=song.key||null;
  stopArrangementPlayback(false);
  releasePerformanceKeys();
  const empty=replace||!before.tracks.length;
  const duration=Math.max(empty?0:before.duration,song.bars*240/baseBpm);
  const next={...before,tracks:empty?[track]:[...before.tracks,track],bpm,baseBpm,duration,
   sections:empty?[{name:material.name,start:0}]:before.sections,templateMeta:empty?null:before.templateMeta,
   activeProjectId:empty?null:before.activeProjectId};
  performanceInput.trackId=track.id;
  assignAssistantSnapshot(next);
  selectArrangementTrack(track.id);
  arrangementAssistant.history.push({before,after:MeldArrangementAI.fingerprint(assistantSnapshot())});
  if(arrangementAssistant.history.length>15)arrangementAssistant.history.shift();
  renderAssistantState();
  showToast(replace?'已替换当前音轨，可撤销':'已追加单轨，可撤销');
 });
})();
