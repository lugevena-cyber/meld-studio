(function(root){
 'use strict';
 function createCollector(){
  const starts=new Map(),groups=new Map();let complete=null,count=0;
  return {push(e){
   if(e.type==='start'){
    if(starts.has(e.index)||starts.size>=20000||!Number.isInteger(e.index)||!Number.isInteger(e.pitch)||e.pitch<0||e.pitch>127||!Number.isFinite(e.start_time)||e.start_time<0||e.start_time>3600||typeof e.instrument!=='string'||e.instrument.length>100)throw Error('转写音符格式或数量无效');
    starts.set(e.index,e);
   }else if(e.type==='end'){
    const n=starts.get(e.start_event_index);if(!n||!Number.isFinite(e.end_time)||e.end_time<=n.start_time||e.end_time>3600)throw Error('转写音符时长无效');
    starts.delete(e.start_event_index);if(++count>20000)throw Error('转写音符过多，请使用更短片段');
    if(!groups.has(n.instrument))groups.set(n.instrument,[]);groups.get(n.instrument).push({midi:n.pitch,start:n.start_time,duration:e.end_time-n.start_time,velocity:.8,confidence:1,manualEdited:true});
   }else if(e.type==='transcription_complete'){complete=e;}
   else if(e.type==='error')throw Error('模型转写失败，请重试');
  },result(){
   if(!complete||starts.size||!count||groups.size>32)throw Error('转写未完整结束或没有识别到音符，请重试');
   // Keep original seconds, including rubato. Do not claim quantization or a fixed tempo map.
   return {groups:[...groups].map(([name,notes])=>({name,notes:notes.sort((a,b)=>a.start-b.start)})),bpm:complete.beat_grid?.bpm||null,midi:complete.data||null,count};
  }};
 }
 root.MelohumTranscription={createCollector};
})(globalThis);
