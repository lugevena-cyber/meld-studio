const arrangementAssistant = {busy:false,connected:false,pending:null,messages:[],history:[],lastAffected:[],images:[]};
let assistantTask='chat';
const assistantElement=id=>document.getElementById(id);
function assistantSnapshot(){return arrangementTemplateSnapshot();}
function assistantCatalog(){return getAllInstrumentDefinitions().map(item=>({id:item.id,name:item.name,baseInstrument:item.baseInstrument||item.id,color:item.color,isDrum:isDrumInstrument(item.baseInstrument||item.id),defaults:{...LAB_DEFAULTS[item.baseInstrument||item.id]},params:item.params?{...item.params}:null}));}
function assistantContext(){
 const snapshot=assistantSnapshot(),baseBeat=60/arrangement.baseBpm;
 const meta=arrangement.templateMeta;
 return {bpm:arrangement.bpm,baseBpm:arrangement.baseBpm,tonic:meta?.id==='midnight-groove-original'?11:state.key?.tonic??0,mode:meta?.id==='midnight-groove-original'?'minor':state.key?.mode||'major',scope:assistantElement('assistantScope').value,selectedTrackId:performanceInput.trackId,startBeat:(Math.max(1,Number(assistantElement('assistantStartBar').value)||1)-1)*4,bars:Math.max(1,Math.min(16,Number(assistantElement('assistantBars').value)||4)),sections:snapshot.sections,catalog:assistantCatalog(),tracks:snapshot.tracks.map(track=>({id:track.id,name:track.name,instrument:track.instrument,instrumentBase:track.instrumentBase,instrumentName:track.instrumentName,isDrum:Boolean(drumKitFromTrack(track)),volume:track.volume,muted:track.muted,solo:track.solo,params:track.instrumentPatch||LAB_DEFAULTS[track.instrumentBase||track.instrument],effects:track.effects||null,drumEffects:track.drumEffects||null,audioClipCount:track.audioClips?.length||0,noteCount:track.notes.length,sampleNotes:track.notes.slice(0,32).map(note=>({midi:note.midi,beat:Math.round(note.start/baseBeat*1000)/1000,duration:Math.round(note.duration/baseBeat*1000)/1000}))}))};
}
function isAssistantQuestion(message,previousKind){
 const text=String(message||'').trim();
 if(/^(?:(?:你好|那)[，,\s]*)?(?:你)?(?:能不能|能否|可以|可不可以|能|请)?(?:帮我|给我|替我|为我)?\s*(?:再)?(?:生成|创作|写(?:一[段首个]|歌|曲)|做(?:一[段首个]|歌)|编(?:一[段首个]曲|一段)|create\b|compose\b)/i.test(text))return false;
 if(/^(?:请|帮我|把|给我)*\s*(?:改编|重编|重新生成|重新写|调整当前编曲|修改当前编曲|应用到当前编曲)/.test(text))return false;
 return previousKind==='chat'||/[?？]|为什么|怎么|如何|哪里|在哪|什么是|是什么|什么样|(?:常用|多用|适合|用)(?:什么|哪些)|有哪些|能不能|可不可以|是否|请问|帮我看|解释|讲解|介绍|教我|告诉我|报错|错误|失败|无法|不能|没反应|没声音|无声|没音乐|空音符|太慢|不对|不见了|找不到/.test(text);
}
function assistantHelpContext(){
 const active=document.querySelector('.view-panel.active');
 return {page:active?.id?.replace(/View$/,'')||'unknown',bpm:arrangement.bpm,tracks:arrangement.tracks.slice(0,12).map(track=>({name:track.name,instrument:track.instrumentName||track.instrument,muted:Boolean(track.muted),solo:Boolean(track.solo),volume:track.volume,noteCount:track.notes?.length||0,audioClipCount:track.audioClips?.length||0})),trackCount:arrangement.tracks.length};
}
function appendAssistantMessage(role,text,mode='demo',kind){
 arrangementAssistant.messages.push({role,text:String(text).slice(0,4000),mode,kind});
 if(arrangementAssistant.messages.length>20)arrangementAssistant.messages.shift();
 renderAssistantMessages();
 try{sessionStorage.setItem(assistantChatStorageKey(),JSON.stringify(arrangementAssistant.messages));}catch{}
 queueBackendDocument('chats',{id:'main',messages:arrangementAssistant.messages});
}
function renderAssistantImages(){
 const host=assistantElement('assistantImagePreview');host.replaceChildren();host.hidden=!arrangementAssistant.images.length;
 arrangementAssistant.images.forEach((image,index)=>{const card=document.createElement('div'),preview=document.createElement('img'),remove=document.createElement('button');card.className='assistant-image-thumb';preview.src=image.dataUrl;preview.alt=image.name||`参考图片 ${index+1}`;remove.type='button';remove.textContent='×';remove.setAttribute('aria-label',`移除参考图 ${index+1}`);remove.addEventListener('click',()=>{arrangementAssistant.images.splice(index,1);renderAssistantImages();});card.append(preview,remove);host.append(card);});
 const total=arrangementAssistant.images.length;assistantElement('assistantImagePick').textContent=total?`＋ 添加参考图（${total}/3）`:'＋ 添加参考图';
}
function readImageDataUrl(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('读取图片失败，请重新粘贴'));reader.readAsDataURL(blob);});}
function canvasBlob(canvas,type,quality){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('图片压缩失败，请换一张图片')),type,quality));}
async function prepareAssistantImage(file){
 if(!/^image\/(png|jpeg|webp|gif)$/i.test(file.type||''))throw new Error('支持 PNG、JPG、WebP 或 GIF 图片');
 let blob=file;
 if(file.size>1.5*1024*1024){
  if(!window.createImageBitmap)throw new Error('图片较大，请先缩小到 1.5 MB 以内');
  const bitmap=await createImageBitmap(file);let scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const context=canvas.getContext('2d');context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height);
  blob=await canvasBlob(canvas,'image/webp',.88);
  if(blob.size>1.5*1024*1024){const reduce=Math.min(.8,1280/Math.max(bitmap.width,bitmap.height));canvas.width=Math.max(1,Math.round(bitmap.width*reduce));canvas.height=Math.max(1,Math.round(bitmap.height*reduce));const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);blob=await canvasBlob(canvas,'image/jpeg',.78);}
  bitmap.close();
 }
 if(blob.size>1.5*1024*1024)throw new Error('图片压缩后仍太大，请换一张较小的图片');
 return {name:file.name||'剪贴板图片',dataUrl:await readImageDataUrl(blob),bytes:blob.size};
}
async function addAssistantImageFiles(files){
 const incoming=[...files].filter(file=>file.type?.startsWith('image/'));if(!incoming.length)return;
 if(arrangementAssistant.images.length+incoming.length>3){showToast('一次最多附加 3 张参考图');return;}
 for(const file of incoming){try{const image=await prepareAssistantImage(file);const bytes=arrangementAssistant.images.reduce((sum,item)=>sum+item.bytes,0);if(bytes+image.bytes>3*1024*1024)throw new Error('参考图片总大小不能超过 3 MB');arrangementAssistant.images.push(image);}catch(error){showToast(error.message);}}
 renderAssistantImages();
}
function renderAssistantMessages(){
 const log=assistantElement('assistantMessages');log.replaceChildren();
 for(const message of arrangementAssistant.messages){const item=document.createElement('article'),label=document.createElement('small'),body=document.createElement('p');item.className=`assistant-message ${message.role==='user'?'user':'reply'}`;label.textContent=message.role==='user'?'你的想法':message.mode==='online'?'AI 编曲助手':'示例助手';body.textContent=message.text;item.append(label,body);log.append(item);}
 log.scrollTop=log.scrollHeight;
 if(assistantElement('assistantReadingDialog')?.open)renderAssistantReading();
}
function renderAssistantReading(opening=false){
 const source=assistantElement('assistantMessages'),reader=assistantElement('assistantReadingMessages');
 const position=reader.scrollTop;
 const follow=reader.scrollHeight-reader.clientHeight-position<24;
 reader.replaceChildren(...Array.from(source.children,item=>item.cloneNode(true)));
 if(opening){
  const latest=reader.lastElementChild;
  reader.scrollTop=latest ? latest.offsetTop : 0;
 }else reader.scrollTop=follow?reader.scrollHeight:position;
}
function renderAssistantState(){
 if(!assistantElement('assistantStatus'))return;
 const mode=assistantElement('assistantMode').value;
 assistantElement('assistantStatus').textContent=arrangementAssistant.busy?'正在处理…':mode==='online'?'AI 已连接 · 可答音乐与页面问题，或生成完整分轨':'本地示例模式 · 音乐问答和 AI 成曲需在线服务';
 const composing=assistantTask==='compose';
 const prompt=assistantElement('assistantPrompt');
 const readyToApply=composing&&Boolean(arrangementAssistant.pending)&&!prompt.value.trim();
 const send=assistantElement('assistantSend');
 send.hidden=readyToApply;
 send.disabled=arrangementAssistant.busy;
 send.textContent=arrangementAssistant.busy?'正在处理…':!composing?'提交':mode==='online'?'生成草稿':'生成示例';
 prompt.placeholder=composing?'例如：只用电钢琴写 8 小节 Synthwave，前两小节留白。也可以描述整首编曲。':'例如：Synthwave 常用哪些和弦？';
 for(const tab of document.querySelectorAll('[data-assistant-task]')){
  tab.setAttribute('aria-pressed',String(tab.dataset.assistantTask===assistantTask));
  tab.disabled=arrangementAssistant.busy;
 }
 assistantElement('assistantApply').hidden=!readyToApply;
 assistantElement('assistantPlan').hidden=!composing||!arrangementAssistant.pending;
 globalThis.MeldSingleTrack?.render();
 assistantElement('assistantUndo').disabled=!arrangementAssistant.history.length||arrangementAssistant.busy;
 const selected=selectedPerformanceTrack();
 assistantElement('assistantSelectedTrack').textContent=selected?`当前轨：${selected.name}`:'当前还没有音轨，可先生成鼓点实验';
 assistantElement('assistantApply').disabled=!arrangementAssistant.pending||arrangementAssistant.busy||Boolean(performanceInput.recording);
 const readingApply=assistantElement('assistantReadingApply');
 readingApply.hidden=!composing||!arrangementAssistant.pending;
 readingApply.disabled=assistantElement('assistantApply').disabled;
 assistantElement('assistantPreview').disabled=!arrangementAssistant.lastAffected.length||Boolean(performanceInput.recording);
 const fx=selected?.drumEffects?.['38']||selected?.effects;
 assistantElement('assistantEffectReadout').textContent=fx?`${selected?.drumEffects?.['38']?'军鼓':'整轨'}混响 ${Math.round(fx.reverbWet*100)}% · 尾长 ${fx.reverbSeconds}s`:'可让示例助手单独调整军鼓混响，或改变音色亮暗与音量';
}
async function checkAssistantConnection(){
 if(typeof location!=='undefined'&&location.protocol==='file:'){arrangementAssistant.connected=false;}else{
 try{const response=await fetch((window.MELD_AI_CONFIG?.apiBase||'')+'/api/assistant/status',{signal:AbortSignal.timeout(2500)});if(!response.ok)throw new Error('unavailable');const data=await response.json();arrangementAssistant.connected=data.configured===true;}catch{arrangementAssistant.connected=false;}
 }
 const option=assistantElement('assistantMode').querySelector('[value=online]');option.disabled=!arrangementAssistant.connected;option.textContent=arrangementAssistant.connected?'AI 成曲 · 服务已配置':'AI 成曲 · 待配置服务';
 assistantElement('assistantMode').value=arrangementAssistant.connected?'online':'demo';renderAssistantState();
}
async function requestArrangementAssistance(message,intent){
 message=String(message||'').trim();if(!message||arrangementAssistant.busy)return;
 if(intent==='chat'&&/^(?:请|帮我)?\s*(?:应用|使用)(?:到编曲|这个方案|草稿|方案|它)?[。！!\s]*$/.test(message)){
  showToast(arrangementAssistant.pending?'请点「应用到编曲」确认':'请先点击「生成编曲」，草稿就绪后可以应用');
  return;
 }
 const recent=arrangementAssistant.messages.filter(item=>item.mode==='online'&&item.kind!=='error').slice(-12);
 const lastReply=recent.findLast(item=>item.role==='assistant');
 const lastRequest=recent.slice(0,recent.lastIndexOf(lastReply)).findLast(item=>item.role==='user');
 const previousKind=lastReply?.kind||(lastRequest&&isAssistantQuestion(lastRequest.text)?'chat':undefined);
 const history=recent.map(({role,text})=>({role,text}));
 const account=assistantChatStorageKey();
 const attachedImages=[...arrangementAssistant.images];
 const mode=assistantElement('assistantMode').value,context=assistantContext(),snapshot=assistantSnapshot(),revision=MeldArrangementAI.fingerprint(snapshot);
 arrangementAssistant.busy=true;
 appendAssistantMessage('user',message+(attachedImages.length?`\n（已附 ${attachedImages.length} 张参考图）`:''),mode);assistantElement('assistantPrompt').value='';renderAssistantState();
 try{
  let plan;
  if(mode==='online'){
   if(!arrangementAssistant.connected)throw new Error('模型尚未连接，请先使用示例模式');
   if(intent==='chat'||(!intent&&isAssistantQuestion(message,previousKind))){
    const context=assistantHelpContext();
    const response=await fetch('/api/assistant/chat',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(50000),body:JSON.stringify({message,history,page:context.page,context:{...context,hasApplicableDraft:Boolean(arrangementAssistant.pending)},images:attachedImages.map(image=>image.dataUrl)})});
    if(account!==assistantChatStorageKey())return;
    const data=await response.json();if(!response.ok)throw new Error(data.error||'AI 助手暂时无法响应');
    arrangementAssistant.images=[];renderAssistantImages();appendAssistantMessage('assistant',data.answer,'online','chat');return;
   }
   const response=await fetch('/api/assistant/song',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(120000),body:JSON.stringify({message,history,preferRecorded:assistantElement('assistantPreferRecorded')?.checked===true,images:attachedImages.map(image=>image.dataUrl),currentArrangement:{bpm:context.bpm,bars:Math.max(1,Math.round(snapshot.duration*context.bpm/240)),tracks:context.tracks.map(track=>({name:track.name,instrument:track.instrument,instrumentName:track.instrumentName,volume:track.volume,muted:track.muted,solo:track.solo,noteCount:track.noteCount,audioClipCount:track.audioClipCount}))},catalog:context.catalog.map(x=>({id:x.id,name:x.name,baseInstrument:x.baseInstrument,isDrum:x.isDrum}))})});
   if(account!==assistantChatStorageKey())return;
   const data=await response.json();if(!response.ok)throw new Error(data.error||'模型服务暂时无法响应');
   const song=data.song,actions=[];
   const rulesDraft=data.source==='rules';
   for(let i=0;i<song.tracks.length;i++){
    const t=song.tracks[i],target='new:song-'+i,notes=[];
    for(const clip of t.clips)for(let r=0;r<clip.repeat;r++)for(const n of clip.notes)notes.push({midi:n.midi,beat:clip.startBar*4+r*clip.bars*4+n.beat,duration:n.duration,velocity:n.velocity});
    actions.push(MeldArrangementAI.action('add_track',{target,name:t.name,instrument:t.instrument,volume:t.volume,params:t.params||null}));
    actions.push(MeldArrangementAI.action('notes',{target,notes}));
   }
   const soundNotes=song.tracks.filter(track=>track.soundDesign).map(track=>`${track.name}：${track.soundDesign}`).join('；');
   const notice=rulesDraft?'AI 曲谱未能通过检查。这里提供一份规则草稿。'+(attachedImages.length?'此草稿仅采用文字参数。':'')+'\n':'';
   const recordedCount=song.tracks.filter(track=>isSampledInstrument(track.instrument)).length;
   plan={reply:(notice+song.title+' · '+song.bpm+' BPM · '+song.bars+' 小节\n'+song.summary+(recordedCount?'\n真实采样：'+recordedCount+'/'+song.tracks.length+' 轨':'')+(soundNotes?'\n音色设计：'+soundNotes:'')).slice(0,4000),actions};
   const duration=song.bars*4*60/song.bpm;
   const keyName=song.key?`${MeldPianoRollCore.label(60+song.key.tonic).slice(0,-1)} ${{major:'大调',minor:'小调',dorian:'多利亚'}[song.key.mode]}`:'调式未标注';
   const clean={...snapshot,tracks:[],bpm:song.bpm,baseBpm:song.bpm,duration,sections:song.sections.map(x=>({...x,start:x.firstBar*4*60/song.bpm})),templateMeta:{id:'assistant-song',title:song.title,key:song.key||null,keyName,duration,bars:song.bars,trackCount:song.tracks.length},activeProjectId:null};
   const prepared=MeldArrangementAI.prepare(clean,plan,assistantCatalog(),()=>makeId('ai-track'));
   if (/无空拍|不留静音|所有小节.*有鼓|鼓和贝斯.*不要停/i.test(message)) {
    const filled=repairGrooveBars(prepared.session);
    if(filled) prepared.changes.push('鼓与贝斯已衔接 '+filled+' 个空小节');
   }
   prepared.changes.unshift('应用后替换当前编曲：'+song.title+'，'+song.bars+' 小节；可撤销恢复。');
   arrangementAssistant.pending={plan,prepared,revision,context:{startBeat:0,bars:16}};
   globalThis.MeldSingleTrack?.clear();
   arrangementAssistant.images=[];renderAssistantImages();
   appendAssistantMessage('assistant',plan.reply,mode,'song');
   const changes=assistantElement('assistantChanges');changes.replaceChildren();for(const change of prepared.changes){const li=document.createElement('li');li.textContent=change;changes.append(li);}
   assistantElement('assistantPlan').hidden=false;assistantElement('assistantPlanLabel').textContent=rulesDraft?'规则草稿 · 应用将替换当前编曲':'完整分轨已生成 · 应用将替换当前编曲';
   assistantElement('assistantApply').textContent='应用到编曲';
   return;
  }else{
   if(intent==='chat')throw new Error('在线 AI 就绪后可发送问题。现在可点击「生成示例方案」体验编曲。');
   if(attachedImages.length)throw new Error('图片参考需要切换到“AI 成曲”模式，示例模式不能识图');
   plan=MeldArrangementAI.demo(message,context);
  }
  plan=MeldArrangementAI.validatePlan(plan);
  appendAssistantMessage('assistant',plan.reply,mode);
  if(plan.actions.length){
   const prepared=MeldArrangementAI.prepare(snapshot,plan,assistantCatalog(),()=>makeId('ai-track'));
   arrangementAssistant.pending={plan,prepared,revision,context};
   globalThis.MeldSingleTrack?.clear();
   const changes=assistantElement('assistantChanges');changes.replaceChildren();for(const change of prepared.changes){const li=document.createElement('li');li.textContent=change;changes.append(li);}
   assistantElement('assistantPlan').hidden=false;
   assistantElement('assistantPlanLabel').textContent='示例实验方案';assistantElement('assistantApply').textContent='应用并试听这个方案';
  }
 }catch(error){if(account!==assistantChatStorageKey())return;if(!assistantElement('assistantPrompt').value)assistantElement('assistantPrompt').value=message;appendAssistantMessage('assistant',error.name==='TimeoutError'?'请求超时，可以重新发送。':error.message,mode,'error');}
 finally{arrangementAssistant.busy=false;renderAssistantState();}
}
// Use the project clock: arrangement note positions are stored in seconds at baseBpm.
function repairGrooveBars(session) {
 const bar = 240 / session.baseBpm;
 if (!Number.isFinite(bar) || bar <= 0) return 0;
 const count = Math.min(256, Math.floor(session.duration / bar + .00001));
 const tracks = session.tracks.filter(t => t.notes?.length && !t.audioClips?.length &&
  (drumKitFromTrack(t) || /bass|低音|贝斯|drum|鼓/i.test([t.name,t.instrumentName,t.instrument].join(' '))));
 const filled = new Set();
 for (const track of tracks) {
  const notes = track.notes.slice();
  const bars = Array.from({length:count}, (_,i) => notes.filter(n => n.start < (i+1)*bar-.00001 && n.start+n.duration > i*bar+.00001));
  const active = bars.flatMap((events,i) => events.length ? [i] : []);
  for (let i=active[0]+1; i<count; i++) {
   if (bars[i].length) continue;
   const previous = active.filter(index => index<i).pop();
   const next = active.find(index => index>i);
   // Preserve the ending unless the last empty bar completes an alternating loop.
   if (next===undefined && !(i===count-1 && previous===i-1 && bars[i-2]?.length===0 && bars[i-3]?.length)) continue;
   const pattern = bars[previous];
   for (const n of pattern) {
    const start=Math.max(n.start,previous*bar), end=Math.min(n.start+n.duration,(previous+1)*bar);
    if(end>start) track.notes.push({...n,start:start+(i-previous)*bar,duration:end-start});
   }
   filled.add(i);
  }
  track.notes.sort((a,b)=>a.start-b.start);
 }
 return filled.size;
}
function assignAssistantSnapshot(snapshot){
 Object.assign(arrangement,{tracks:snapshot.tracks,bpm:snapshot.bpm,baseBpm:snapshot.baseBpm,duration:snapshot.duration,sections:snapshot.sections||[],templateMeta:snapshot.templateMeta||null});
 state.activeProjectId=snapshot.activeProjectId||null;
 els.tempoInput.value=String(arrangement.bpm);persistArrangement();renderArrangement();
}
function applyAssistantExperiment(){
 const pending=arrangementAssistant.pending;if(!pending||arrangementAssistant.busy)return;
 if(performanceInput.recording||performanceInput.preparing){showToast('先停止当前录制，再应用编曲方案');return;}
 if(MeldArrangementAI.fingerprint(assistantSnapshot())!==pending.revision){appendAssistantMessage('assistant','编曲在生成方案后已有新改动，请重新生成，以保留你刚才的编辑。');return;}
 const before=assistantSnapshot();stopArrangementPlayback();stopMelodyPlayback();releasePerformanceKeys();
 assignAssistantSnapshot(pending.prepared.session);
 arrangementAssistant.lastAffected=pending.prepared.affected;
 if(arrangementAssistant.lastAffected.length)performanceInput.trackId=arrangementAssistant.lastAffected[0];
 renderPerformancePanel();
 arrangementAssistant.history.push({before,after:MeldArrangementAI.fingerprint(assistantSnapshot())});if(arrangementAssistant.history.length>15)arrangementAssistant.history.shift();
 arrangementAssistant.pending=null;assistantElement('assistantPlan').hidden=true;
 appendAssistantMessage('assistant','实验已应用。可以单独试听这次修改，也可以播放全曲比较；“撤销本次实验”会恢复应用前的编曲。',assistantElement('assistantMode').value);
 arrangementAssistant.previewRange={startBeat:pending.context.startBeat,bars:pending.context.bars};renderAssistantState();
 previewAssistantExperiment();
}
function undoAssistantExperiment(){
 const entry=arrangementAssistant.history[arrangementAssistant.history.length-1];if(!entry||performanceInput.recording)return;
 if(MeldArrangementAI.fingerprint(assistantSnapshot())!==entry.after){appendAssistantMessage('assistant','这次实验后已有其他编辑，暂不覆盖这些新改动。可用对应编辑器的撤销，或重新生成实验方案。');return;}
 stopArrangementPlayback();stopMelodyPlayback();releasePerformanceKeys();arrangementAssistant.history.pop();assignAssistantSnapshot(entry.before);arrangementAssistant.lastAffected=[];performanceInput.trackId=arrangement.tracks[0]?.id||null;renderPerformancePanel();renderAssistantState();appendAssistantMessage('assistant','已撤销本次实验，恢复原音符、音色、音量与混响。');
}
async function previewAssistantExperiment(){
 if(performanceInput.recording||!arrangementAssistant.lastAffected.length)return;
 stopArrangementPlayback();stopMaterialOriginal();stopMelodyPlayback();releasePerformanceKeys();
 const range=arrangementAssistant.previewRange||{startBeat:0,bars:4},offset=range.startBeat*60/arrangement.baseBpm,end=offset+Math.min(16,range.bars)*4*60/arrangement.baseBpm;
 const tracks=arrangement.tracks.filter(track=>arrangementAssistant.lastAffected.includes(track.id)).map(track=>({...track,notes:track.notes.filter(note=>note.start+note.duration>offset&&note.start<end).map(note=>({...note,duration:Math.min(note.start+note.duration,end)-note.start}))}));
 for(const track of tracks)track.audioClips=(track.audioClips||[]).filter(clip=>clip.start+MeldMaterialCore.clipDuration(clip,arrangement.baseBpm,arrangement.bpm)>offset&&clip.start<end);
 if(!tracks.some(MeldMaterialCore.hasContent)){showToast('本范围没有音符或原声，可用键盘演奏调整后的音色');return;}
 if(tracks.some(MeldMaterialCore.hasAudio)||tracks.some(track=>track.notes.length&&!sampledInstrumentReady(grandPianoTrackBase(track),getAudioContext()))){
  const token=arrangement.audioLoadToken=(arrangement.audioLoadToken||0)+1;arrangement.loadingAudio=true;
  try{await Promise.all([prepareMaterialAudioTracks(tracks,getAudioContext()),prepareSampledTracks(tracks,getAudioContext())]);}catch(error){if(token===arrangement.audioLoadToken){arrangement.loadingAudio=false;showToast(error.message);}return;}
  if(token!==arrangement.audioLoadToken)return;arrangement.loadingAudio=false;
 }
 const context=getAudioContext(),startAt=context.currentTime+.06,speed=arrangement.baseBpm/arrangement.bpm;
 arrangement.isPlaying=true;startArrangementScheduler(tracks,startAt,speed,offset);
 els.arrangePlayBtn.classList.add('is-playing');els.arrangePlayBtn.setAttribute('aria-label','暂停编曲');els.arrangeStatus.textContent='正在单独试听本次实验';
 const tick=()=>{if(!arrangement.isPlaying)return;const at=offset+Math.max(0,context.currentTime-startAt)/speed;updateArrangementPlayhead(Math.min(at,end));if(at<end)arrangement.raf=requestAnimationFrame(tick);};arrangement.raf=requestAnimationFrame(tick);
 arrangement.endTimer=window.setTimeout(()=>stopArrangementPlayback(),(end-offset)*speed*1000+Math.max(.3,...tracks.flatMap(track=>[track.effects,...Object.values(track.drumEffects||{})]).filter(Boolean).map(fx=>fx.reverbWet>0?fx.reverbSeconds:0))*1000+150);renderAssistantState();
}
let placeArrangementAssistant = () => {};
function setupArrangementAssistant(){
 const reader=assistantElement('assistantReadingDialog');
 const expandReading=assistantElement('assistantExpandReading');
 expandReading.addEventListener('click',()=>{
  reader.showModal();
  renderAssistantReading(true);
 });
 reader.addEventListener('close',()=>expandReading.focus({preventScroll:true}));
 assistantElement('assistantReadingApply').addEventListener('click',()=>{
  applyAssistantExperiment();
  if(!arrangementAssistant.pending)reader.close();
 });
 const sidebar=document.getElementById('assistantSidebar');
 const toggle=document.getElementById('assistantSidebarToggle');
 const close=document.getElementById('assistantSidebarClose');
 const dock=document.getElementById('arrangementAssistantDock');
 const lab=document.querySelector('#labView .lab-heading');
 const studio=document.querySelector('#studioView .page-heading');
 const works=document.querySelector('#worksView .collection-heading');
 const headings={lab,studio,works};
 const expanded=new Map([['arrangement',!window.matchMedia('(max-width: 900px)').matches]]);
 let location=null;

 function setExpanded(open){
  sidebar.classList.toggle('collapsed',!open);
  toggle.setAttribute('aria-expanded',String(open));
  toggle.setAttribute('aria-label',open?'收起 AI 编曲助手':'打开 AI 编曲助手');
  expanded.set(location,open);
 }
 placeArrangementAssistant=view=>{
  if(view===location)return;
  location=view;
  sidebar.hidden=!headings[view]&&view!=='arrangement';
  sidebar.classList.remove('assistant-floating');
  sidebar.classList.toggle('assistant-docked',view==='arrangement');
  sidebar.classList.toggle('assistant-inline',Boolean(headings[view]));
  if(view==='arrangement')dock.append(sidebar);
  else if(headings[view])headings[view].after(sidebar);
  setExpanded(Boolean(expanded.get(view)));
 };
 toggle.addEventListener('click',()=>setExpanded(toggle.getAttribute('aria-expanded')!=='true'));
 close.addEventListener('click',()=>{setExpanded(false);toggle.focus();});
 sidebar.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){
   setExpanded(false);
   toggle.focus();
  }
 });
 placeArrangementAssistant(state.currentView);

 try{const stored=JSON.parse(sessionStorage.getItem(assistantChatStorageKey())||'[]');arrangementAssistant.messages=stored.filter(item=>['user','assistant'].includes(item.role)&&typeof item.text==='string').slice(-20);}catch{}
 if(!arrangementAssistant.messages.length)arrangementAssistant.messages=[{role:'assistant',mode:'demo',text:'描述风格、情绪、乐器和段落，例如：生成一首 32 小节的电子乐，前奏—主题—Drop—结尾，主旋律、和声、低音与鼓组分轨。AI 服务配置完成后可生成可编辑音符；未配置时仅提供本地预设演示。'}];
 renderAssistantMessages();renderAssistantState();
 const prompt=assistantElement('assistantPrompt');
 const drafts={chat:'',compose:''};
 function switchTask(task){
  if(arrangementAssistant.busy||assistantTask===task)return;
  drafts[assistantTask]=prompt.value;
  assistantTask=task;
  prompt.value=drafts[task];
  renderAssistantState();
 }
 function submitPrompt(){
  const message=prompt.value.trim();
  if(!message||arrangementAssistant.busy)return;
  if(assistantTask==='compose'&&globalThis.MeldSingleTrack?.request(message))return;
  requestArrangementAssistance(message,assistantTask==='chat'?'chat':'song');
 }
 document.querySelectorAll('[data-assistant-task]').forEach(button=>button.addEventListener('click',()=>switchTask(button.dataset.assistantTask)));
 assistantElement('assistantForm').addEventListener('submit',event=>{event.preventDefault();submitPrompt();});
 prompt.addEventListener('input',renderAssistantState);
 prompt.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing&&event.keyCode!==229){event.preventDefault();submitPrompt();}});
 assistantElement('assistantExamples').addEventListener('click',event=>{
  const button=event.target.closest('[data-assistant-example]');if(!button)return;
  switchTask('compose');prompt.value=button.dataset.assistantExample;submitPrompt();
 });
 assistantElement('assistantApply').addEventListener('click',applyAssistantExperiment);
 assistantElement('assistantUndo').addEventListener('click',undoAssistantExperiment);
 assistantElement('assistantPreview').addEventListener('click',previewAssistantExperiment);
 assistantElement('assistantMode').addEventListener('change',renderAssistantState);
 assistantElement('assistantReconnect').addEventListener('click',checkAssistantConnection);
 assistantElement('assistantImagePick').addEventListener('click',()=>assistantElement('assistantImageInput').click());
 assistantElement('assistantImageInput').addEventListener('change',event=>{addAssistantImageFiles(event.target.files);event.target.value='';});
 assistantElement('assistantPrompt').addEventListener('paste',event=>{const files=[...event.clipboardData.items].filter(item=>item.type.startsWith('image/')).map(item=>item.getAsFile()).filter(Boolean);if(!files.length)return;event.preventDefault();const text=event.clipboardData.getData('text/plain');if(text)event.target.setRangeText(text,event.target.selectionStart,event.target.selectionEnd,'end');addAssistantImageFiles(files);});
 renderAssistantImages();
 checkAssistantConnection();
}
