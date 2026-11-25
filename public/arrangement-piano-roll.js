(function(root){
 if(typeof document==='undefined')return;
 let roll=null,currentId=null,trackChoices=null,auditionRequest=0;
 const inline=document.getElementById('inlineRollHost');
 const trackSelect=document.getElementById('inlineRollTrack');
 const expand=document.getElementById('inlineRollExpand');
 const empty=document.getElementById('inlineRollEmpty');
 const page=document.createElement('main');
 page.className='track-detail-page roll-workspace';
 page.hidden=true;
 const back=document.createElement('button');
 back.type='button';
 back.textContent='返回编曲台';
 const heading=document.createElement('h1');
 const play=document.createElement('button');
 play.type='button';
 play.textContent='播放编曲';
 play.onclick=()=>{if(arrangement.isPlaying||arrangement.loadingAudio)stopArrangementPlayback(false);else playArrangement(roll?.visibleStart());};
 const stop=document.createElement('button');
 stop.type='button';
 stop.textContent='停止';
 stop.onclick=()=>stopArrangementPlayback();
 const smoothDemo=document.createElement('button');
 smoothDemo.type='button';
 smoothDemo.textContent='让当前音符更连贯';
 smoothDemo.hidden=true;
 smoothDemo.onclick=()=>root.MeldNightPocket?.loadEditable();
 const header=document.createElement('header');
 header.className='roll-workspace-header';
 const connectMidi=document.createElement('button');
 connectMidi.type='button';connectMidi.dataset.midiConnect='';connectMidi.textContent='连接 MIDI 键盘';
 header.append(back,heading,play,stop,connectMidi,smoothDemo);
 const host=document.createElement('section');
 host.className='arrangement-note-editor';
 page.append(header,host);
 document.body.append(page);
 trackSelect.addEventListener('change',()=>selectArrangementTrack(trackSelect.value));
 expand.addEventListener('click',()=>open(trackSelect.value));
 function trackFromUrl(){
  return new URLSearchParams(location.hash.slice(1)).get('track');
 }
 function open(id){
  if(performanceInput.recording||performanceInput.preparing)return;
  selectArrangementTrack(id);
  const url=new URL(location.href);
  url.hash=new URLSearchParams({track:id}).toString();
  history.pushState({...history.state,melohumTrack:true},'',url);
  render();
  back.focus();
 }
 back.onclick=()=>{
  if(history.state?.melohumTrack)history.back();
  else {const url=new URL(location.href);url.hash='';history.replaceState(history.state,'',url);render();}
 };
 async function auditionRollKey(track,midi){
  const request=++auditionRequest;
  const context=getAudioContext();
  const definition=getInstrumentDefinition(track.instrument);
  const base=track.instrumentBase||definition.baseInstrument||definition.id;
  try{
   await prepareSampledInstrument(base,context);
   if(request!==auditionRequest||page.hidden||trackFromUrl()!==track.id||currentId!==track.id)return;
   const params={...LAB_DEFAULTS[base],...(track.instrumentPatch||definition.params||{})};
   schedulePatchVoice(base,midi,context.currentTime+.01,.26,params,context.destination,.65);
  }catch(error){
   if(request===auditionRequest&&!page.hidden)showToast(error.message);
  }
 }
 function render(){
  const id=trackFromUrl();
  const fullTrack=arrangement.tracks.find(item=>item.id===id);
  page.hidden=!fullTrack;
  document.body.classList.toggle('editing-track-detail',Boolean(fullTrack));
  const choices=arrangement.tracks.map(track=>`<option value="${escapeHtml(track.id)}">${escapeHtml(track.name)}</option>`).join('');
  if(choices!==trackChoices){trackSelect.innerHTML=choices;trackChoices=choices;}
  const selected=selectedArrangementTrack()||selectedPerformanceTrack();
  trackSelect.value=selected?.id||'';
  trackSelect.disabled=expand.disabled=!selected||Boolean(performanceInput.recording||performanceInput.preparing);
  if(!fullTrack&&state.currentView!=='arrangement')return;
  const track=fullTrack||selected;
  const destination=fullTrack?page:inline;
  if(host.parentElement!==destination)destination.append(host);
  empty.hidden=Boolean(track);
  if(!track){
   roll?.destroy();
   roll=null;currentId=null;host.replaceChildren();
   return;
  }
  heading.textContent=track.name;
  smoothDemo.hidden=!root.MeldNightPocket?.canUpgradePhrasing();
  if(currentId!==track.id){roll?.destroy();roll=null;host.replaceChildren();}
  currentId=track.id;
  if(track.audioClips?.length&&!track.notes.length){
   roll?.destroy();roll=null;
   const demo=track.audioClips.find(clip=>root.MeldNightPocket?.hasAsset(clip.audioAssetId));
   host.innerHTML=demo?'<h3>Night Pocket 成品音轨</h3><p>载入原始曲谱后，可在钢琴帘编辑本轨音高、音阶和节奏。</p>':'<h3>原声音轨</h3><p>这是录音波形。请在原曲声部钢琴帘校正候选音符，再将候选加入采样演奏轨。</p>';
   if(demo){
    const button=document.createElement('button');
    button.type='button';button.className='solid-action';button.textContent='载入可编辑音符';
    button.onclick=()=>root.MeldNightPocket.loadEditable(demo.audioAssetId);
    host.append(button);
   }
   return;
  }
  if(!roll)host.replaceChildren();
  const kit=drumKitFromTrack(track),pads=kit?(MeldSourceInstruments?.drumPads?.(kit)||drumPadsForKit(kit)):null;
  const options={owner:track.id,title:fullTrack?'钢琴卷帘':'',getNotes:()=>track.notes,getKey:()=>track.noteEditKey||arrangement.templateMeta?.key||(arrangement.templateMeta?.id==='midnight-groove-original'?{tonic:11,mode:'minor'}:state.key)||{tonic:0,mode:'major'},setKey:key=>{track.noteEditKey=key;persistArrangement();renderPerformanceKeyboard();},getBpm:()=>arrangement.baseBpm,locked:()=>Boolean(performanceInput.recording||performanceInput.preparing),disableSlide:Boolean(root.MeldDx7?.has(track.instrumentBase||track.instrument)),lanes:pads?.map(p=>p.midi),laneNames:pads?Object.fromEntries(pads.map(p=>[p.midi,p.name])):null,onBegin(){stopArrangementPlayback(false);stopLabPlayback();},onChange(){calculateArrangementDuration();persistArrangement();renderArrangement();}};
  if(fullTrack)options.auditionPitch=midi=>auditionRollKey(track,midi);
  if(!roll)roll=MeldPianoRoll.mount(host,options);else roll.update(options);roll.setPlayhead(arrangement.playhead);currentId=track.id;
 }
 root.MeldArrangementRoll={render,open,activeTrack(){return arrangement.tracks.find(item=>item.id===currentId);},highlightMidi(midi,on){roll?.highlightMidi(midi,on);},setPlayhead(time){roll?.setPlayhead(time);}};root.addEventListener('popstate',render);root.addEventListener('hashchange',render);render();
})(globalThis);
