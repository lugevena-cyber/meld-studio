/* Optional local song study. Audio and derived candidates stay outside release packages. */
(function(root){
 'use strict';
 function sliceNotes(notes,start,end){return notes.filter(n=>n.start<end&&n.start+n.duration>start).map(n=>({...n,start:Math.max(n.start,start)-start,duration:Math.min(n.start+n.duration,end)-Math.max(n.start,start)})).filter(n=>n.duration>=.025);}
 function wavBlob(buffer){
  const pcm=buffer.getChannelData(0),bytes=new ArrayBuffer(44+pcm.length*2),v=new DataView(bytes),word=(at,s)=>{for(let i=0;i<s.length;i++)v.setUint8(at+i,s.charCodeAt(i));};
  word(0,'RIFF');v.setUint32(4,36+pcm.length*2,true);word(8,'WAVE');word(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,buffer.sampleRate,true);v.setUint32(28,buffer.sampleRate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);word(36,'data');v.setUint32(40,pcm.length*2,true);
  for(let i=0;i<pcm.length;i++){const x=Math.max(-1,Math.min(1,pcm[i]));v.setInt16(44+i*2,x<0?x*32768:x*32767,true);}return new Blob([bytes],{type:'audio/wav'});
 }
 root.MeldSongStudy={sliceNotes,wavBlob};
 if(typeof document==='undefined'||new URLSearchParams(location.search).get('study')!=='hong-kong')return;
 const panel=document.createElement('section');panel.className='song-study';panel.setAttribute('aria-label','歌曲研习');
 panel.innerHTML=`<p class="eyebrow">SONG STUDY / 歌曲研习</p><h2>Hong Kong · 看见旋律</h2><p>中高声部与低音的音高候选来自整首混音，尚未分离人声；它们不是已确认的主唱谱或原曲分轨。下方乐器用于换音色试听。</p><div class="song-study-controls"><label>起点（秒）<input id="studyStart" type="number" min="0" step="1" value="0"></label><label>片段长度<select id="studyLength"><option value="20">20 秒</option><option value="10">10 秒</option><option value="40">40 秒</option></select></label><label>查看声部<select id="studyLayer"><option value="melody">中高声部候选</option><option value="bass">低音候选</option></select></label><button id="studyPrev" type="button">← 上一段</button><button id="studyNext" type="button">下一段 →</button><button id="studyLoad" type="button">载入片段</button></div><div class="song-study-controls"><button id="studyOriginal" type="button">▶ 原曲片段 / 暂停</button><button type="button" data-study-instrument="piano">▶ 钢琴试听</button><button type="button" data-study-instrument="electric">▶ 电吉他试听</button><button type="button" data-study-instrument="bass">▶ 贝斯试听</button><button id="studyStop" type="button">停止</button></div><output id="studyStatus" aria-live="polite">正在准备本机音频…</output><p class="song-study-help">横轴是当前片段内的时间，纵轴是音高；音符可拖动、增删。调性为片段参考；编辑默认遵循当前调式，可切换主音和调式。切换片段会暂存本页的音符修改；需要长期保留时，请用“存入素材库”。</p>`;
 (document.getElementById('hongKongLibraryHost')||document.querySelector('.main-stage')).after(panel);
 const el=id=>document.getElementById(id),saved=new Map();let analysis=null,full=null,current=null,busy=false;
 const buttons=[...panel.querySelectorAll('button,input,select')];
 const lock=value=>{busy=value;buttons.forEach(b=>b.disabled=value);};
 function remember(){if(current&&state.notes===current.ref)saved.set(current.id,state.notes.map(n=>({...n})));}
 async function load(start=null){
  if(busy||!full||state.isRecording||state.isAnalyzing){if(state.isRecording||state.isAnalyzing)showToast('先结束录音或分析，再查看歌曲片段');return;}
  lock(true);
  try{
   remember();stopSourcePlayback();stopMelodyPlayback();
   const from=Math.max(0,Math.min(full.duration-.05,Number(start??el('studyStart').value)||0)),length=Number(el('studyLength').value),end=Math.min(full.duration,from+length),layer=el('studyLayer').value,id=`${from}:${end}:${layer}`;
   const c=getAudioContext(),first=Math.floor(from*full.sampleRate),last=Math.min(full.length,Math.floor(end*full.sampleRate)),buffer=c.createBuffer(1,last-first,full.sampleRate),pcm=buffer.getChannelData(0);
   for(let ch=0;ch<full.numberOfChannels;ch++){const source=full.getChannelData(ch);for(let i=0;i<pcm.length;i++)pcm[i]+=source[first+i]/full.numberOfChannels;}
   const notes=saved.get(id)?.map(n=>({...n}))||sliceNotes(analysis.layers[layer],from,end);
   clearSessionData(true,true);state.notes=notes;state.samples=reconstructSamples(notes);state.key=estimateKey(state.samples)||{tonic:2,mode:'major',confidence:0,score:0,related:{tonic:11,mode:'minor'}};state.duration=buffer.duration;state.audioBuffer=buffer;state.audioBlob=wavBlob(buffer);state.audioUrl=URL.createObjectURL(state.audioBlob);state.sourceName=`Hong Kong · ${from.toFixed(1)}–${end.toFixed(1)} 秒 · ${layer==='bass'?'低音':'中高声部'}候选`;state.sourceType='upload';state.analysisProfile='vocal';state.analysisOnsetFirst=false;state.notesEdited=saved.has(id);state.scaleSnap=false;melodyEditor.scaleSnap=true;els.scaleSnapBtn.classList.remove('active');els.scaleSnapBtn.setAttribute('aria-pressed','false');
   els.sourceAudio.src=state.audioUrl;els.sourceFileName.textContent=state.sourceName;els.sourceFileMeta.textContent='原曲截取片段 · 对应下方音高候选';els.sourcePlayer.classList.add('visible');els.tempoInput.value=String(analysis.bpm);updateAnalysisUI(state.key,notes,state.duration);els.headerKeyNote.textContent='片段调性候选 · 主音尚未人工确认';els.keyFriendly.textContent='混音音高统计参考，可对照原曲校正';els.playBtn.disabled=!notes.length;els.canvasEmpty.classList.add('hidden');els.analysisStatus.textContent='混音候选 · 可编辑';els.stageStateText.textContent='歌曲研习';els.stageDetail.textContent=state.sourceName;els.playLabel.textContent=`用${getInstrumentDefinition(state.instrument).name}试听`;els.playSubLabel.textContent='候选旋律，不代表原曲乐器或准确人声谱';setStep(3);syncStudioActionState();renderRecognitionControls();toggleView('pitch');switchView('studio');drawVisualizer(0);
   current={id,ref:state.notes,from,end};el('studyStart').value=String(Math.round(from*10)/10);el('studyStatus').textContent=`全曲 ${Math.floor(full.duration/60)}:${String(Math.floor(full.duration%60)).padStart(2,'0')} · 当前 ${from.toFixed(1)}–${end.toFixed(1)} 秒 · ${notes.length} 个候选音符 · 约 69 BPM`;
  }catch(error){el('studyStatus').textContent='片段未载入：'+error.message;}finally{lock(false);}
 }
 el('studyLoad').addEventListener('click',()=>load());
 el('studyPrev').addEventListener('click',()=>load(Math.max(0,(current?.from||0)-Number(el('studyLength').value))));
 el('studyNext').addEventListener('click',()=>load(current?.end>=full.duration?0:current?.end||0));
 el('studyLayer').addEventListener('change',()=>load());el('studyLength').addEventListener('change',()=>load());
 el('studyOriginal').addEventListener('click',()=>toggleSourcePlayback());
 panel.querySelectorAll('[data-study-instrument]').forEach(button=>button.addEventListener('click',async()=>{stopSourcePlayback();selectInstrument(button.dataset.studyInstrument,false);await getAudioContext().resume();await playMelody(0);}));
 el('studyStop').addEventListener('click',()=>{stopSourcePlayback();stopMelodyPlayback();drawVisualizer(0);});
 els.sourceAudio.addEventListener('timeupdate',()=>{if(state.isPreviewingSource&&current?.ref===state.notes)drawVisualizer(els.sourceAudio.currentTime);});
 lock(true);
 Promise.all([fetch('studies/hong-kong/analysis.json').then(r=>{if(!r.ok)throw new Error('本机分析文件不存在');return r.json();}),fetch('studies/hong-kong/source.mp3').then(r=>{if(!r.ok)throw new Error('本机歌曲不存在');return r.arrayBuffer();})]).then(async([data,bytes])=>{analysis=data;full=await getAudioContext().decodeAudioData(bytes);el('studyStart').max=String(full.duration-.1);lock(false);el('studyStatus').textContent='混音候选已准备；点击“载入片段”在创作台编辑。';}).catch(error=>{el('studyStatus').textContent=error.message+'。歌曲研习文件仅保存在本机，不随公开版本分发。';});
})(typeof window!=='undefined'?window:globalThis);
