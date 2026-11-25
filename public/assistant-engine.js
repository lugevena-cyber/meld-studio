(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MeldArrangementAI=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const LIMITS={attack:[5,1200],decay:[20,2000],sustain:[5,100],release:[80,3500],brightness:[300,9000],space:[0,100],drive:[0,100],lfoRateHz:[0,12],lfoDepthHz:[0,5000]};
 const KINDS=['add_track','set_track','rhythm','effects','notes','tempo'];
 const clone=value=>JSON.parse(JSON.stringify(value));
 const fail=message=>{throw new Error(message);};
 const number=(v,min,max,label)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)fail(`${label}超出支持范围`);return v;};
 const text=(v,max,label)=>{if(typeof v!=='string'||!v.trim()||v.length>max)fail(`${label}不正确`);return v.trim();};
 const object=(v,label)=>{if(!v||typeof v!=='object'||Array.isArray(v))fail(`${label}格式不正确`);return v;};
 const keys=(v,allowed,label)=>{object(v,label);if(Object.keys(v).some(key=>!allowed.includes(key)))fail(`${label}包含不支持的字段`);};
 function action(kind,fields={}){return {kind,target:null,name:null,instrument:null,volume:null,muted:null,solo:null,bpm:null,params:null,rhythm:null,effects:null,notes:[],...fields};}
 const nullable=(schema)=>({...schema,type:Array.isArray(schema.type)?[...schema.type,'null']:[schema.type,'null']});
 const parameterProperties=Object.fromEntries(Object.keys(LIMITS).map(key=>[key,{type:['number','null']}]));
 const obj=properties=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
 const noteSchema=obj({midi:{type:'integer'},beat:{type:'number'},duration:{type:'number'},velocity:{type:'number'}});
 const actionSchema=obj({kind:{type:'string',enum:KINDS},target:{type:['string','null']},name:{type:['string','null']},instrument:{type:['string','null']},volume:{type:['number','null']},muted:{type:['boolean','null']},solo:{type:['boolean','null']},bpm:{type:['number','null']},params:nullable(obj(parameterProperties)),rhythm:nullable(obj({pattern:{type:'string',enum:['four_on_floor','funk','pop80','half_time']},bars:{type:'integer'},start_beat:{type:'number'},replace:{type:'boolean'},swing:{type:'number'}})),effects:nullable(obj({midi:{type:['integer','null']},reverb_wet:{type:'number'},reverb_seconds:{type:'number'},pre_delay:{type:'number'}})),notes:{type:'array',items:noteSchema}});
 const schema=obj({reply:{type:'string'},actions:{type:'array',items:actionSchema}});
 function validatePlan(plan){
  keys(plan,['reply','actions'],'方案');text(plan.reply,4000,'回复');if(!Array.isArray(plan.actions)||plan.actions.length>24)fail('每次方案最多 24 个操作');
  let notes=0;
  for(const item of plan.actions){
   keys(item,Object.keys(action('add_track')),'操作');if(!KINDS.includes(item.kind))fail('不支持的操作');
   if(item.target!==null&&item.target!==undefined)text(item.target,130,'目标音轨');
   if(item.name!==null&&item.name!==undefined)text(item.name,60,'音轨名');
   if(item.instrument!==null&&item.instrument!==undefined)text(item.instrument,130,'音色');
   if(item.volume!==null&&item.volume!==undefined)number(item.volume,0,100,'音量');
   if(item.bpm!==null&&item.bpm!==undefined)number(item.bpm,50,160,'速度');
   for(const field of ['muted','solo'])if(item[field]!==null&&item[field]!==undefined&&typeof item[field]!=='boolean')fail('静音/独奏必须是开关');
   if(item.params){keys(item.params,Object.keys(LIMITS),'音色参数');for(const [key,value] of Object.entries(item.params))if(value!==null)number(value,...LIMITS[key],key);}
   if(item.rhythm){const r=item.rhythm;keys(r,['pattern','bars','start_beat','replace','swing'],'节奏');if(!['four_on_floor','funk','pop80','half_time'].includes(r.pattern))fail('不支持的节奏类型');number(r.bars,1,32,'小节数');if(!Number.isInteger(r.bars))fail('小节数必须为整数');number(r.start_beat,0,4096,'起拍');number(r.swing,0,.35,'摇摆');if(typeof r.replace!=='boolean')fail('替换范围必须是开关');}
   if(item.effects){const fx=item.effects;keys(fx,['midi','reverb_wet','reverb_seconds','pre_delay'],'混响');if(fx.midi!==null){number(fx.midi,0,127,'鼓音号');if(!Number.isInteger(fx.midi))fail('鼓音号必须为整数');}number(fx.reverb_wet,0,.8,'混响量');number(fx.reverb_seconds,.1,4,'混响尾长');number(fx.pre_delay,0,.1,'预延迟');}
   if(!Array.isArray(item.notes||[]))fail('音符格式不正确');notes+=(item.notes||[]).length;if(notes>8192)fail('每次最多写入 8192 个音符');
   for(const n of item.notes||[]){keys(n,['midi','beat','duration','velocity'],'音符');number(n.midi,0,127,'音高');if(!Number.isInteger(n.midi))fail('音高必须是整数');number(n.beat,0,4096,'音符起拍');number(n.duration,1/64,64,'音符时长');number(n.velocity,.05,1,'力度');}
   if(item.kind==='rhythm'&&!item.rhythm)fail('缺少节奏参数');
   if(item.kind==='effects'&&!item.effects)fail('缺少混响参数');
   if(item.kind==='tempo'&&(item.bpm===null||item.bpm===undefined))fail('缺少速度');
  }
  return {reply:plan.reply,actions:plan.actions.map(item=>action(item.kind,item))};
 }
 const RHYTHMS={four_on_floor:{36:[0,4,8,12],38:[4,12],42:[0,2,4,6,8,10,12,14],46:[15]},funk:{36:[0,6,8,11],38:[4,12],42:[0,2,4,6,8,10,12,14],46:[7,15]},pop80:{36:[0,7,8,10],38:[4,12],39:[4,12],42:[0,2,4,6,8,10,12,14]},half_time:{36:[0,6,11],38:[8],42:[0,2,4,6,8,10,12,14]}};
 function prepare(session,raw,catalog,idFactory){
  const plan=validatePlan(raw),next=clone(session),byInstrument=new Map(catalog.map(item=>[item.id,item])),aliases=new Map(),affected=new Set(),changes=[];
  if(!Array.isArray(next.tracks))fail('编曲数据不正确');const beat=60/next.baseBpm;
  const create=(item)=>{const definition=byInstrument.get(item.instrument);if(!definition)fail('方案中包含不可用音色');if(next.tracks.length>=48)fail('最多支持 48 条音轨');const id=idFactory(),track={id,name:item.name||`${definition.name} · 实验`,instrument:definition.id,instrumentName:definition.name,instrumentBase:definition.baseInstrument||definition.id,instrumentPatch:clone(definition.params||definition.defaults),color:definition.color,notes:[],volume:item.volume??72,muted:false,solo:false};next.tracks.push(track);if(item.target?.startsWith('new:'))aliases.set(item.target,id);changes.push(`新增「${track.name}」，使用${definition.name}`);return track;};
  const find=(item,allowCreate=false)=>{const id=aliases.get(item.target)||item.target;let track=next.tracks.find(t=>t.id===id);if(!track&&allowCreate&&/^new:[a-z0-9_-]{1,40}$/i.test(item.target||''))track=create(item);if(!track)fail('目标音轨已不存在，请重新生成方案');affected.add(track.id);return track;};
  for(const item of plan.actions){
   if(item.kind==='tempo'){next.bpm=item.bpm;changes.push(`速度调为 ${item.bpm} BPM`);continue;}
   let track=item.kind==='add_track'?create(item):find(item,item.kind==='rhythm');affected.add(track.id);
   if(item.kind==='set_track'||item.kind==='add_track'){
    if(item.instrument){const definition=byInstrument.get(item.instrument);if(!definition)fail('音色不存在');Object.assign(track,{instrument:definition.id,instrumentName:definition.name,instrumentBase:definition.baseInstrument||definition.id,instrumentPatch:clone(definition.params||definition.defaults),color:definition.color});}
    if(item.name)track.name=item.name;
    for(const field of ['volume','muted','solo'])if(item[field]!==null&&item[field]!==undefined)track[field]=item[field];
    if(item.params){const definition=byInstrument.get(track.instrument);if(!definition)fail('当前音色不可用');track.instrumentPatch={...definition.defaults,...(track.instrumentPatch||definition.params||{}),...Object.fromEntries(Object.entries(item.params).filter(([,v])=>v!==null))};}
    if(item.kind==='set_track'){
     const labels={attack:['起音','ms'],decay:['衰减','ms'],sustain:['持续','%'],release:['释音','ms'],brightness:['亮度','Hz'],space:['空间','%'],drive:['驱动','%']};
     const details=Object.entries(item.params||{}).filter(([,value])=>value!==null).map(([key,value])=>`${labels[key][0]} ${value}${labels[key][1]}`);
     if(item.instrument)details.unshift(`音色：${track.instrumentName}`);
     if(item.volume!==null)details.push(`音量 ${item.volume}%`);
     if(item.muted!==null)details.push(item.muted?'静音':'取消静音');
     if(item.solo!==null)details.push(item.solo?'独奏':'取消独奏');
     changes.push(`调整「${track.name}」 · ${details.join(' · ')}`);
    }
   }
   if(item.kind==='rhythm'){
    const definition=byInstrument.get(track.instrument);if(!definition?.isDrum)fail('节奏应写入鼓组/鼓机音轨');const r=item.rhythm,from=r.start_beat*beat,end=from+r.bars*4*beat;
    if(r.replace)track.notes=track.notes.filter(note=>note.start<from-.001||note.start>=end-.001);
    for(let bar=0;bar<r.bars;bar++)for(const [midi,steps]of Object.entries(RHYTHMS[r.pattern]))for(const step of steps){const at=r.start_beat+bar*4+step/4+(step%2?r.swing/4:0);track.notes.push({midi:Number(midi),start:at*beat,duration:beat*.16,velocity:Number(midi)===42?.48+(step%4===0?.1:0):.86,confidence:1,manualEdited:true});}
    changes.push(`「${track.name}」写入 ${r.bars} 小节${r.pattern==='four_on_floor'?'四拍动次打次':r.pattern==='funk'?'Funk 切分':r.pattern==='half_time'?'半拍律动':'80s 流行'}节奏`);
   }
   if(item.kind==='effects'){
    const fx={reverbWet:item.effects.reverb_wet,reverbSeconds:item.effects.reverb_seconds,preDelay:item.effects.pre_delay};
    if(item.effects.midi===null)track.effects=fx;else{if(!byInstrument.get(track.instrument)?.isDrum)fail('单鼓混响需要鼓组音轨');track.drumEffects={...(track.drumEffects||{}),[String(item.effects.midi)]:fx};}
    changes.push(`「${track.name}」${item.effects.midi===38?'军鼓':item.effects.midi===null?'整轨':'指定鼓声'}混响 ${Math.round(fx.reverbWet*100)}% · 尾长 ${fx.reverbSeconds}s`);
   }
   if(item.kind==='notes'){
    for(const n of item.notes)track.notes.push({midi:n.midi,start:n.beat*beat,duration:n.duration*beat,velocity:n.velocity,confidence:1,manualEdited:true});
    changes.push(`「${track.name}」添加 ${item.notes.length} 个音符`);
   }
   track.notes.sort((a,b)=>a.start-b.start||a.midi-b.midi);
  }
  const beforeCount=session.tracks.reduce((sum,track)=>sum+track.notes.length,0),afterCount=next.tracks.reduce((sum,track)=>sum+track.notes.length,0);
  if(afterCount-beforeCount>8192)fail('一次实验生成的音符过多，请缩短小节范围');
  return {session:next,affected:[...affected],changes};
 }
 function demo(message,context){
  const selected=context.tracks.find(track=>track.id===context.selectedTrackId),tracks=context.tracks,actions=[],catalog=context.catalog;
  const start=context.startBeat||0,bars=context.bars||4;
  const findNamed=(regex)=>tracks.find(track=>regex.test(`${track.name} ${track.instrumentName} ${track.instrumentBase}`));
  const choose=regex=>(context.scope==='selected'?selected:null)||(selected&&regex.test(`${selected.name} ${selected.instrumentName} ${selected.instrumentBase}`)?selected:null)||findNamed(regex)||selected;
  const isNew=context.scope!=='selected';
  const rhythmWanted=/动次|咚次|打次|四拍|生成.*(鼓|节奏)|做.*节奏|来.*节奏|写.*(鼓|节奏)|funk.*节奏|放克.*节奏/i.test(message);
  let drumTarget=null;
  if(rhythmWanted){const target=!isNew&&selected?.isDrum?selected.id:'new:drum-experiment';drumTarget=target;actions.push(action('rhythm',{target,instrument:'drum80',name:'动次打次 · 鼓机实验',rhythm:{pattern:/funk|放克|切分/i.test(message)?'funk':/慢|半拍/.test(message)?'half_time':'four_on_floor',bars,start_beat:start,replace:Boolean(!isNew&&selected?.isDrum),swing:/摇摆|松弛/.test(message)?.15:0}}));}
  if(/混响|大房间|大厅|干声|干一点/.test(message)){
   const target=drumTarget||choose(/鼓|drum/i)?.id;
   if(target){const targetData=tracks.find(track=>track.id===target),lower=/小|少|干声|干一点|收一点|降低/.test(message);const midi=/军鼓/.test(message)?38:/底鼓/.test(message)?36:/拍手/.test(message)?39:/开镲/.test(message)?46:/踩镲|闭镲/.test(message)?42:!/整轨|全部|整体/.test(message)&&targetData?.drumEffects?.['38']?38:null;actions.push(action('effects',{target,effects:{midi,reverb_wet:lower?.12:.58,reverb_seconds:lower?.45:1.8,pre_delay:.025}}));}
  }
  const guitarWanted=/吉他/.test(message),bassWanted=/贝斯|bass/i.test(message),keysWanted=/钢琴|电钢|琴键/.test(message);
  let target= /当前/.test(message)?selected : bassWanted?choose(/贝斯|bass/i):guitarWanted?choose(/吉他|guitar/i):keysWanted?choose(/钢琴|琴键|keys|piano/i):selected;
  if(guitarWanted&&/新|加|来|一条/.test(message)){
   const instrument=/失真|摇滚/.test(message)?'rockguitar':/清/.test(message)?'cleanguitar':'mutedguitar';
   actions.push(action('add_track',{target:'new:guitar-experiment',name:'Funk 吉他 · 音色实验',instrument,volume:52}));
   const root=48+(context.tonic??0),minor=context.mode==='minor',notes=[];
   for(let b=0;b<bars;b++)for(const position of [.75,2.25,3.5])for(const interval of [0,minor?3:4,7])notes.push({midi:root+interval,beat:start+b*4+position,duration:.18,velocity:.7});
   actions.push(action('notes',{target:'new:guitar-experiment',notes}));target=null;
  }
  const params={};
  if(/亮|清脆|通透/.test(message))params.brightness=6500;
  if(/闷|暗|温暖|厚/.test(message))params.brightness=1100;
  if(/短|干脆/.test(message)&&!rhythmWanted){params.decay=150;params.release=180;params.sustain=16;}
  if(/失真|驱动/.test(message))params.drive=28;
  const specificDrumLevel=/踩镲|闭镲|开镲|军鼓|底鼓/.test(message);
  const volumeDown=!specificDrumLevel&&/音量.*(小|低)|轻一点|弱一点/.test(message),volumeUp=!specificDrumLevel&&/音量.*(大|高)|响一点/.test(message);
  if(target&&(Object.keys(params).length||volumeDown||volumeUp||/静音|独奏/.test(message))){
   actions.push(action('set_track',{target:target.id,params:Object.keys(params).length?params:null,volume:volumeDown?Math.max(0,target.volume-12):volumeUp?Math.min(100,target.volume+12):null,muted:/取消静音/.test(message)?false:/静音/.test(message)?true:null,solo:/取消独奏/.test(message)?false:/独奏/.test(message)?true:null}));
  }
  const bpm=message.match(/(\d{2,3})\s*(?:bpm|拍\/分)/i)||message.match(/(?:速度|BPM)\s*(\d{2,3})/i);
  if(bpm&&Number(bpm[1])>=50&&Number(bpm[1])<=160)actions.push(action('tempo',{bpm:Number(bpm[1])}));
  if(actions.length)return {reply:'示例方案已生成。点击“应用并试听”，可以听到实际的节奏与音色变化；修改后可撤销。',actions};
  return {reply:/怎么|为什么|是什么|建议/.test(message)?'示例说明：动次打次可由四拍底鼓、第二和第四拍军鼓及八分踩镲组成。军鼓单独加混响，可增加空间感并保留底鼓的清晰度。当前是本地示例模式，自由问答需要以后连接模型服务。':'当前为本地示例模式，暂时能演示动次打次/Funk 鼓点、单独军鼓混响、音色亮暗、音量、静音/独奏和新增吉他实验轨。可点击上方示例试用；接入模型后再使用自由问答。',actions:[]};
 }
 function trackEditRequest(message,tracks,selectedId){
  const compact=value=>String(value||'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
  const input=compact(message);
  const numbered=/(?:第\s*0*(\d{1,2})\s*(?:号|条)?\s*(?:音轨|轨道|轨)|(?:音轨|轨道|轨)\s*[#＃]?\s*0*(\d{1,2})(?!\d))/i.exec(message);
  const named=tracks.filter(track=>[track.name,track.instrumentName,track.instrument].some(value=>{
   const name=compact(value);
   return name.length>=2&&input.includes(name);
  }));
  const roleNames={lead:/主旋律|\bsaw\s*lead\b/i,bass:/贝斯|低音轨|\bbass\b/i,drums:/鼓组|鼓轨|\bdrums\b/i,harmony:/和声轨|和弦轨|\bharmony\b/i};
  const role=Object.values(roleNames).find(pattern=>pattern.test(message));
  const candidates=named.length?named:role?tracks.filter(track=>role.test([track.name,track.instrumentName,track.instrument].join(' '))):[];
  const local=/(?:只|仅)(?:想|要)?\s*(?:改|动|调整|修改|重写|换|替换)|(?:其他|其它|其余|剩余)[^，。！？\n]{0,18}(?:不变|别动|保留|保持|不要改|不动)|(?:这|该|当前|选中)(?:一|个|条|的)?\s*(?:音轨|轨道|轨)|\b(?:this|selected) track\b|\b(?:other tracks unchanged|only change|only edit)\b/i.test(message);
  const notes=/旋律|音符|音高|节奏|重写|重编|改写|\b(?:melody|notes|rhythm|rewrite)\b/i.test(message);
  const tone=/音色|换乐器|换成|\b(?:timbre|sound|instrument|preset)\b/i.test(message);
  const edit=/改|调|换|替换|重写|重编|\b(?:change|edit|replace|rewrite|swap)\b/i.test(message);
  if(!local&&!(edit&&(numbered||candidates.length)&&(notes||tone)&&!/(?:全曲|整首|全部音轨|重新生成一首|重做整)/.test(message)))return null;
  if(/(?:只|仅)(?:想)?\s*(?:用|使用)|单轨素材/.test(message)&&!edit)return null;
  const preserveNotes=/(?:旋律|音符|节奏)\s*(?:保持|别动|不变|不动|不改|不要改)|(?:只|仅)\s*(?:改|换|调整)\s*(?:乐器|音色)(?!\s*[、和与及]?(?:和|与|及)?\s*旋律)/.test(message);
  const preserveTone=/(?:音色|乐器)\s*(?:保持|别动|不变|不动|不改|不要改)|(?:只|仅)\s*(?:改|重写)\s*(?:旋律|音符)(?!\s*[、和与及]?(?:和|与|及)?\s*音色)/.test(message);
  const selected=tracks.find(track=>track.id===selectedId);
  const target=numbered?tracks[Number(numbered[1]||numbered[2])-1]:
   candidates.length===1?candidates[0]:!candidates.length||candidates.includes(selected)?selected:null;
  return {target,notes:notes&&!preserveNotes,tone:tone&&!preserveTone};
 }
 function prepareTrackEdit(session,targetId,edit,song,catalog){
  const target=session.tracks.find(track=>track.id===targetId);
  if(!target||!Array.isArray(song?.tracks)||song.tracks.length!==1)fail('单轨草稿无效，请重新生成');
  const part=song.tracks[0];
  const definition=catalog.find(item=>item.id===part.instrument);
  if(!definition)fail('草稿里的音色不可用');
  const track={...target};
  const changes=[];
  if(edit.tone){
   const defaults=definition.params||definition.defaults||{};
   Object.assign(track,{instrument:definition.id,instrumentBase:definition.baseInstrument||definition.id,
    instrumentName:definition.name,instrumentPatch:{...defaults,...part.params}});
   changes.push(`「${track.name}」音色改为 ${definition.name}`);
  }
  if(edit.notes){
   const beat=60/session.baseBpm;
   const notes=[];
   for(const clip of part.clips)for(let repeat=0;repeat<clip.repeat;repeat++)for(const note of clip.notes){
    const start=clip.startBar*4+repeat*clip.bars*4+note.beat;
    if(start+note.duration>edit.bars*4+.00001)fail('草稿超出目标音轨的编辑范围');
    notes.push({midi:note.midi,start:start*beat,duration:note.duration*beat,velocity:note.velocity,confidence:1,manualEdited:true});
   }
   if(!notes.length)fail('单轨草稿没有音符');
   const end=edit.bars*4*beat;
   track.notes=[...notes,...target.notes.filter(note=>note.start>=end-.00001)]
    .sort((a,b)=>a.start-b.start||a.midi-b.midi);
   changes.push(`「${track.name}」改写前 ${edit.bars} 小节的音符`);
  }
  if(!changes.length)fail('请指定需要修改的旋律或音色');
  return {session:{...session,tracks:session.tracks.map(item=>item.id===targetId?track:item)},affected:[targetId],changes};
 }
 function fingerprint(session){const value=JSON.stringify({tracks:session.tracks,bpm:session.bpm,baseBpm:session.baseBpm,templateMeta:session.templateMeta||null,sections:session.sections||[],activeProjectId:session.activeProjectId||null});let hash=2166136261;for(let i=0;i<value.length;i++)hash=Math.imul(hash^value.charCodeAt(i),16777619);return `${hash>>>0}:${value.length}`;}
 return {schema,validatePlan,prepare,demo,action,fingerprint,trackEditRequest,prepareTrackEdit,LIMITS};
});
