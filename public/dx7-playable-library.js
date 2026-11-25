(function(){
 if(typeof document==='undefined')return;
 window.MeldDx7Library={stop};
 const esc=value=>escapeHtml(String(value));let preview=[],previewToken=0;
 function stop(){previewToken++;preview.forEach(n=>n.stop?.());preview=[];}
 async function audition(id){globalThis.MeldSoundLibrary?.stop();globalThis.MeldSourceInstruments?.stopPreview();globalThis.MeldAfterglowDrive?.pausePreview();stop();stopLabPlayback();stopArrangementPlayback(false);const token=previewToken,c=getAudioContext();status.textContent='正在准备 DX7 发声引擎…';try{await MeldDx7.prepare(id,c);if(token!==previewToken)return;for(const [i,midi]of [60,64,67].entries())preview.push(...MeldDx7.schedule(id,midi,c.currentTime+.04+i*.18,.6,LAB_DEFAULTS[id],c.destination,.75));status.textContent='正在演奏 '+getInstrumentDefinition(id).name+' · 原厂 FM 参数发声';}catch(error){status.textContent=error.message;}}
 function laboratory(id){
  stop();
  loadLabInstrument(id);
  labFilter.value=getInstrumentDefinition(id).bank;
  labSearch.value='';
  renderLabVoices();
  switchView('lab');
 }
 function addTrack(id){if(performanceInput.recording||performanceInput.preparing){showToast('请先停止录制');return;}stop();const track=createArrangementTrack(id,getInstrumentDefinition(id).name,[]);arrangement.tracks.push(track);performanceInput.trackId=track.id;persistArrangement();renderArrangement();switchView('arrangement');MeldDx7.prepare(id,getAudioContext()).catch(error=>showToast(error.message));showToast('DX7 音轨已加入，可用编曲键盘弹奏和录制');}
 const box=document.createElement('section');box.className='source-instrument-library';box.setAttribute('aria-label','Yamaha DX7 可演奏音色库');
 box.innerHTML='<p class="eyebrow">YAMAHA DX7 / SIX OPERATOR FM</p><h2>DX7 原厂音色 · 现在可以弹奏</h2><p>8 库、256 个槽位，含重复。使用 webDX7 / MSFA 引擎读取原厂参数；可试听、进入音色实验室，或添加音轨分轨录制。</p><div class="source-score-toolbar"><label>音色库<select id="dx7Bank"></select></label><label>搜索<input id="dx7Search" type="search" placeholder="E.PIANO / BASS / GUITAR…"></label><button type="button" id="dx7Stop">停止试听</button></div><output id="dx7Status" aria-live="polite">选择一个音色试听，或加入编曲。</output><div id="dx7Voices" class="dx7-voice-grid"></div><p><a href="dx7/factory-roms.zip" download>下载原厂参数 ZIP</a> · <a href="dx7/ENGINE-ATTRIBUTION.txt">引擎与开源署名</a> · <a href="https://yamahablackboxes.com/collection/yamaha-dx7-synthesizer/patches/" target="_blank" rel="noopener">原厂 ROM 档案</a></p>';
 const host=document.getElementById('dx7LibraryHost');if(!host)return;host.append(box);
 const bank=box.querySelector('#dx7Bank'),search=box.querySelector('#dx7Search'),voices=box.querySelector('#dx7Voices'),status=box.querySelector('#dx7Status');
 const names=[...new Set(DX7_FACTORY_VOICES.map(v=>v.bank))];bank.innerHTML=names.map(name=>'<option>'+name+'</option>').join('');
 function render(){voices.innerHTML=DX7_FACTORY_VOICES.filter(v=>v.bank===bank.value&&v.name.toLowerCase().includes(search.value.trim().toLowerCase())).map(v=>'<article class="dx7-voice"><strong>'+esc(v.name)+'</strong><small>算法 '+v.algorithm+'</small><div class="source-tone-actions"><button type="button" data-dx7-play="'+v.id+'">▶ 试听</button><button type="button" data-dx7-studio="'+v.id+'">创作台</button><button type="button" data-dx7-lab="'+v.id+'">实验室调整</button><button type="button" data-dx7-track="'+v.id+'">＋ 音轨</button></div></article>').join('');}
 box.addEventListener('click',e=>{const b=e.target.closest('button');if(b?.dataset.dx7Play)audition(b.dataset.dx7Play);if(b?.dataset.dx7Lab)laboratory(b.dataset.dx7Lab);if(b?.dataset.dx7Studio)useLibraryInstrument(b.dataset.dx7Studio,"studio");if(b?.dataset.dx7Track)addTrack(b.dataset.dx7Track);});bank.addEventListener('change',render);search.addEventListener('input',render);box.querySelector('#dx7Stop').addEventListener('click',stop);render();
 const drawer=document.getElementById('labDx7Drawer');
 const labFilter=document.getElementById('dx7LabBank');
 const labSearch=document.getElementById('dx7LabSearch');
 const labVoices=document.getElementById('dx7LabVoices');
 const labCount=document.getElementById('dx7LabCount');
 labFilter.innerHTML=bank.innerHTML+'<option value="">全部原厂库</option>';
 labFilter.value=getInstrumentDefinition(labState.instrument).bank||names[0];
 function renderLabVoices(){
  const query=labSearch.value.trim().toLowerCase().replace(/\s+/g,' ');
  const selectedBank=labFilter.value;
  const matches=DX7_FACTORY_VOICES.filter(voice=>
   (!selectedBank||voice.bank===selectedBank)&&voice.name.toLowerCase().replace(/\s+/g,' ').includes(query));
  labCount.textContent=matches.length?matches.length+' 个音色':'没有匹配的音色';
  labVoices.innerHTML=matches.map(voice=>{
   const active=voice.id===labState.instrument;
   return '<button type="button" class="lab-dx7-voice'+(active?' active':'')+'" data-lab-instrument="'+voice.id+'" aria-pressed="'+active+'"><strong>'+esc(labInstrumentLabel({...voice,dx7:true}))+'</strong><small>'+esc(voice.bank)+' · '+String(voice.slot).padStart(2,'0')+'</small></button>';
  }).join('');
  labVoices.scrollTop=0;
 }
 labFilter.addEventListener('change',renderLabVoices);
 labSearch.addEventListener('input',renderLabVoices);
 labVoices.addEventListener('click',event=>{
  const button=event.target.closest('[data-lab-instrument]');
  if(button)loadLabInstrument(button.dataset.labInstrument);
 });
 renderLabVoices();
 drawer.hidden=false;
 const use=document.createElement('button');use.type='button';use.id='labUseInArrangement';use.className='primary-button';use.textContent='＋ 将当前音色加入编曲';document.querySelector('.lab-transport').append(use);
 use.addEventListener('click',()=>{if(performanceInput.recording||performanceInput.preparing){showToast('请先停止录制');return;}const track=createArrangementTrack(labState.instrument,labState.presetName,[]);track.instrumentBase=labState.instrument;track.instrumentPatch={...labState.params};arrangement.tracks.push(track);performanceInput.trackId=track.id;persistArrangement();renderArrangement();switchView('arrangement');showToast('已将当前音色与调整参数加入新音轨');});
 window.addEventListener('beforeunload',stop);
})();
