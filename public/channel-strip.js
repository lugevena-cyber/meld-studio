const trackChannelUI={timer:null,editing:null,ready:false};
const CHANNEL_GROUPS=[
 ['滤波 / FILTER',[['highpass','低切','Hz',1],['filterHz','截止频率','Hz',1],['filterQ','共振 Q','',.1]], 'eq'],
 ['三段均衡 / EQ',[['lowGain','低频 · 120 Hz','dB',.5],['midHz','中频中心','Hz',10],['midQ','中频带宽 Q','',.1],['midGain','中频增益','dB',.5],['highGain','高频 · 6 kHz','dB',.5]], 'eq'],
 ['压缩 / COMPRESSOR',[['threshold','阈值','dB',1],['ratio','压缩比',':1',.1],['attack','起音','ms',1],['release','释放','ms',5]], 'compressor'],
 ['声场 / OUTPUT',[['pan','声像','',.01],['trim','输出增益','dB',.5],['reverbWet','混响发送','%',1],['reverbSeconds','混响长度','s',.1]], 'basic']
];
function trackChannelTrack(){return selectedArrangementTrack()||selectedPerformanceTrack();}
function channelRange(key){return key==='reverbWet'?[0,80,0]:key==='reverbSeconds'?[.1,4,1.2]:MeldChannelCore.ranges[key];}
function channelIsLog(key){return ['highpass','filterHz','midHz'].includes(key);}
function channelSliderValue(key,value){const[min,max]=channelRange(key);return channelIsLog(key)?Math.round(Math.log(value/min)/Math.log(max/min)*1000):value;}
function channelFieldValue(key,value){const[min,max]=channelRange(key);return channelIsLog(key)?min*Math.pow(max/min,Number(value)/1000):Number(value);}
function flushTrackChannelSave(){window.clearTimeout(trackChannelUI.timer);if(trackChannelUI.timer!==null){trackChannelUI.timer=null;persistArrangement();}}
function scheduleTrackChannelSave(){window.clearTimeout(trackChannelUI.timer);trackChannelUI.timer=window.setTimeout(()=>{trackChannelUI.timer=null;persistArrangement();},180);}
function channelDisplay(key,value){if(key==='pan')return Math.abs(value)<.01?'中央':`${value<0?'左':'右'} ${Math.round(Math.abs(value)*100)}`;if(key==='reverbWet')return `${Math.round(value)}%`;if(key.endsWith('Hz')||key==='highpass')return value>=1000?`${(value/1000).toFixed(2)} kHz`:`${Math.round(value)} Hz`;if(key==='ratio')return `${value.toFixed(1)}:1`;if(key==='filterQ'||key==='midQ')return value.toFixed(2);if(key==='reverbSeconds')return `${value.toFixed(1)} s`;return `${value.toFixed(value%1?1:0)}${['attack','release'].includes(key)?' ms':' dB'}`;}
function renderTrackChannelStrip(){
 const panel=document.getElementById('trackChannelPanel');if(!panel||!trackChannelUI.ready)return;
 const track=trackChannelTrack(),select=document.getElementById('trackChannelSelect');select.innerHTML=arrangement.tracks.map((t,i)=>`<option value="${escapeHtml(t.id)}">${i+1} · ${escapeHtml(t.name)}</option>`).join('');select.value=track?.id||'';
 document.getElementById('trackChannelName').textContent=track?`${track.name} · ${track.sourceStem&&!track.notes.length?'分离音频':track.instrumentName||getInstrumentDefinition(track.instrument).name}`:'选择一条音轨';
 const locked=!track||Boolean(performanceInput.preparing),fx=MeldChannelCore.normalize(track?.channelFx);
 for(const key of ['bypass','compressor']){const el=document.getElementById('channel-'+key);el.checked=fx[key];el.disabled=locked;}
 const filter=document.getElementById('channel-filterType');filter.value=fx.filterType;filter.disabled=locked;
 for(const group of CHANNEL_GROUPS)for(const[key]of group[1]){const value=key==='reverbWet'?Math.round((track?.effects?.reverbWet||0)*100):key==='reverbSeconds'?(track?.effects?.reverbSeconds||1.2):fx[key];const range=document.querySelector(`[data-channel-range="${key}"]`),number=document.querySelector(`[data-channel-number="${key}"]`);if(document.activeElement!==range)range.value=channelSliderValue(key,value);if(document.activeElement!==number)number.value=Number(value.toFixed(3));range.disabled=number.disabled=locked;document.querySelector(`[data-channel-value="${key}"]`).textContent=channelDisplay(key,value);}
 document.getElementById('trackChannelReset').disabled=locked;document.getElementById('trackChannelPosition').disabled=locked||!MeldMaterialCore.hasContent(track);document.getElementById('trackChannelPosition').value=track?(1+trackContentStart(track)*arrangement.baseBpm/60).toFixed(2):'1';
 updateTrackChannelMeter();
}
function updateTrackChannelMeter(){const out=document.getElementById('trackChannelReduction');if(!out)return;const track=trackChannelTrack(),bus=track?arrangementChannels.get(track.id):null;out.textContent=bus&&track.channelFx?.compressor&&!track.channelFx?.bypass?`压缩衰减 ${Math.abs(Number(bus.nodes.compressor.reduction)||0).toFixed(1)} dB`:'压缩衰减 0.0 dB';}
function changeTrackChannelField(key,value,final=false){
 const track=trackChannelTrack();if(!track||performanceInput.preparing)return;
 if(key==='filterType'||key==='compressor'||key==='bypass'){track.channelFx=MeldChannelCore.normalize({...track.channelFx,[key]:value});}
 else if(channelRange(key)){const[min,max]=channelRange(key),v=Math.max(min,Math.min(max,Number(value)));if(!Number.isFinite(v))return;if(key==='reverbWet'||key==='reverbSeconds'){track.effects={...track.effects,[key]:key==='reverbWet'?v/100:v};}else track.channelFx=MeldChannelCore.normalize({...track.channelFx,[key]:v});}
 updateTrackEffectsLive(track);renderTrackChannelStrip();if(final){window.clearTimeout(trackChannelUI.timer);trackChannelUI.timer=null;persistArrangement();}else scheduleTrackChannelSave();
}
function setupTrackChannelStrip(){
 const container=document.getElementById('trackChannelGroups');trackChannelUI.ready=true;
 const details=document.getElementById('trackChannelDetails');
 const body=container.closest('.track-channel-body');
 const pages=Array.from(body.querySelectorAll('[data-channel-page]'));
 const portrait=window.matchMedia('(max-width: 620px) and (orientation: portrait)');
 const syncDisclosure=()=>{details.open=!portrait.matches;};
 syncDisclosure();
 portrait.addEventListener('change',syncDisclosure);
 for(const button of pages)button.addEventListener('click',()=>{
  body.dataset.channelSection=button.dataset.channelPage;
  for(const page of pages)page.setAttribute('aria-pressed',String(page===button));
 });
 container.innerHTML=CHANNEL_GROUPS.map(([title,fields,section])=>`<fieldset data-channel-category="${section}"><legend>${title}</legend>${fields.map(([key,label,unit,step])=>{const[min,max]=channelRange(key),log=channelIsLog(key);return `<label class="channel-field"><span>${label}<output data-channel-value="${key}"></output></span><input type="range" data-channel-range="${key}" min="${log?0:min}" max="${log?1000:max}" step="${log?1:step}" aria-label="${label}"/><span class="channel-precise"><input type="number" data-channel-number="${key}" min="${min}" max="${max}" step="${step}" aria-label="${label}精确值"/><small>${unit}</small></span></label>`;}).join('')}</fieldset>`).join('');
 container.addEventListener('input',event=>{const range=event.target.closest('[data-channel-range]');if(range)changeTrackChannelField(range.dataset.channelRange,channelFieldValue(range.dataset.channelRange,range.value));});
 container.addEventListener('change',event=>{const range=event.target.closest('[data-channel-range]'),number=event.target.closest('[data-channel-number]');if(range)changeTrackChannelField(range.dataset.channelRange,channelFieldValue(range.dataset.channelRange,range.value),true);if(number&&number.value!=='')changeTrackChannelField(number.dataset.channelNumber,Number(number.value),true);});
 for(const key of ['bypass','compressor','filterType'])document.getElementById('channel-'+key).addEventListener('change',event=>changeTrackChannelField(key,event.target.type==='checkbox'?event.target.checked:event.target.value,true));
 document.getElementById('trackChannelSelect').addEventListener('change',event=>{flushTrackChannelSave();selectArrangementTrack(event.target.value);});
 document.getElementById('trackChannelReset').addEventListener('click',()=>{const track=trackChannelTrack();if(!track)return;track.channelFx=MeldChannelCore.normalize();track.effects={...track.effects,reverbWet:0,reverbSeconds:1.2};updateTrackEffectsLive(track);persistArrangement();renderTrackChannelStrip();});
 document.getElementById('trackChannelPosition').addEventListener('change',event=>{const track=trackChannelTrack();if(track&&event.target.value!=='')moveTrackContentTo(track.id,(Math.max(1,Number(event.target.value))-1)*60/arrangement.baseBpm);});
 els.arrangementTrackHeaders.addEventListener('click',event=>{if(event.target.closest('[data-track-fx]')){document.getElementById('trackChannelDetails').open=true;document.getElementById('trackChannelPanel').scrollIntoView({block:'nearest',behavior:'smooth'});}});
 window.addEventListener('beforeunload',flushTrackChannelSave);
}
