(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MeldMaterialCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const clone=value=>JSON.parse(JSON.stringify(value));
 const num=(value,min,max,label)=>{if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max)throw new Error(`${label}不正确`);return value;};
 const str=(value,max,label)=>{if(typeof value!=='string'||!value.trim()||value.length>max)throw new Error(`${label}不正确`);return value.trim();};
 function validate(input){
  if(!input||typeof input!=='object')throw new Error('素材格式不正确');
  const notes=Array.isArray(input.notes)?input.notes:[];if(notes.length>12000)throw new Error('素材音符过多');
  const result={id:str(input.id,160,'素材编号'),name:str(input.name,60,'素材名称'),bpm:num(input.bpm,30,300,'素材速度'),instrument:str(input.instrument||'piano',160,'音色编号'),instrumentBase:str(input.instrumentBase||'piano',60,'基底音色'),instrumentName:str(input.instrumentName||'钢琴',60,'音色名称'),instrumentPatch:{},key:null,notes:notes.map(note=>({midi:num(note.midi,0,127,'音高'),start:num(note.start,0,3600,'音符起点'),duration:num(note.duration,.01,3600,'音符时长'),confidence:Number.isFinite(note.confidence)?Math.max(0,Math.min(1,note.confidence)):.9,...(Number.isFinite(note.velocity)?{velocity:Math.max(.05,Math.min(1,note.velocity))}:{}),manualEdited:Boolean(note.manualEdited)})),audio:null,createdAt:Number.isFinite(input.createdAt)?input.createdAt:Date.now(),deletedAt:Number.isFinite(input.deletedAt)?input.deletedAt:null};
  result.recognitionProfile=['vocal','guitar','mutedguitar','bass','keyboard','wind'].includes(input.recognitionProfile)?input.recognitionProfile:'vocal';
  result.recognitionOnsetFirst=input.recognitionOnsetFirst===true;
  const hits=Array.isArray(input.rhythmHits)?input.rhythmHits:[];if(hits.length>2000)throw new Error('节奏标记过多');
  result.rhythmHits=hits.map(hit=>({start:num(hit.start,0,3600,'节奏起点'),duration:num(hit.duration,.01,1,'节奏时长'),strength:Number.isFinite(hit.strength)?Math.max(0,Math.min(1,hit.strength)):.5}));
  const ranges={attack:[5,1200],decay:[20,2000],sustain:[5,100],release:[80,3500],brightness:[300,9000],space:[0,100],drive:[0,100]};
  for(const [key,range]of Object.entries(ranges))if(input.instrumentPatch?.[key]!==undefined)result.instrumentPatch[key]=num(input.instrumentPatch[key],...range,'音色参数');
  if(input.key&&Number.isInteger(input.key.tonic)&&input.key.tonic>=0&&input.key.tonic<12&&['major','minor'].includes(input.key.mode))result.key={tonic:input.key.tonic,mode:input.key.mode};
  if(input.audio){const a=input.audio;const id=str(a.id,160,'原声编号');if(!/^[a-z0-9:_-]+$/i.test(id))throw new Error('原声编号不正确');result.audio={id,duration:num(a.duration,.01,7200,'原声时长'),mime:typeof a.mime==='string'?a.mime.slice(0,100):'audio/wav',size:Number.isFinite(a.size)?a.size:0,sha256:typeof a.sha256==='string'?a.sha256:'',peaks:(Array.isArray(a.peaks)?a.peaks:[]).slice(0,128).map(value=>Math.max(0,Math.min(1,Number(value)||0)))};}
  if(!result.notes.length&&!result.audio)throw new Error('素材中没有旋律或原声');
  return result;
 }
 function clipDuration(clip,baseBpm,bpm){return clip.duration/(baseBpm/bpm);}
 function hasAudio(track){return Array.isArray(track.audioClips)&&track.audioClips.length>0;}
 function hasContent(track){return Boolean(track.notes?.length||hasAudio(track));}
 function endOf(track,baseBpm,bpm){return Math.max(0,...(track.notes||[]).map(n=>n.start+n.duration),...(track.audioClips||[]).map(c=>c.start+clipDuration(c,baseBpm,bpm)));}
 function placement(material,{kind,start,baseBpm,bpm},idFactory){
  const m=validate(material);num(start,0,7200,'放入位置');num(baseBpm,30,300,'工程基准速度');num(bpm,30,300,'工程速度');
  if(kind==='audio'){
   if(!m.audio)throw new Error('这段素材没有原声录音');
   return {notes:[],audioClips:[{id:idFactory(),materialId:m.id,audioAssetId:m.audio.id,name:m.name,start,offset:0,duration:m.audio.duration,peaks:[...m.audio.peaks]}]};
  }
  if(!m.notes.length)throw new Error('这段素材没有可编辑旋律');
  const factor=m.bpm/baseBpm;
  return {notes:m.notes.map(note=>({...note,start:start+note.start*factor,duration:note.duration*factor,sourceMaterialId:m.id})),audioClips:[]};
 }
 function sourceWindow(clip,timelineOffset,speedScale){
  const elapsed=Math.max(0,timelineOffset-clip.start)*speedScale;
  if(elapsed>=clip.duration)return null;
  return {offset:(clip.offset||0)+elapsed,duration:clip.duration-elapsed,from:Math.max(timelineOffset,clip.start)};
 }
 return {clone,validate,clipDuration,hasAudio,hasContent,endOf,placement,sourceWindow};
});
