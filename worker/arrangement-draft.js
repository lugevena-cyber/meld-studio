// A deterministic, editable starting point when the model produces unusable notation.
export function arrangementDraft(message,catalog,currentBpm) {
 const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
 const dubstep=/dubstep|半拍|回响贝斯/i.test(message);
 const barMatch=message.match(/(\d+)\s*(?:小节|bars?\b)/i);
 const tempoMatch=message.match(/(\d+(?:\.\d+)?)\s*bpm\b/i)||message.match(/(?:bpm|速度|每分钟)\s*[:：]?\s*(\d+(?:\.\d+)?)/i);
 const bars=clamp(Number(barMatch?.[1]||32),16,64);
 const bpm=clamp(Number(tempoMatch?.[1]||(dubstep?140:currentBpm||112)),50,160);
 const sizes=[Math.floor(bars/4),Math.floor(bars/4),Math.floor(bars/4)];
 sizes.push(bars-sizes.reduce((sum,n)=>sum+n,0));
 let firstBar=0;
 const sections=['前奏','主题',dubstep?'Drop':'副歌','结尾'].map((name,i)=>{
  const section={name,firstBar,bars:sizes[i]};firstBar+=sizes[i];return section;
 });
 const pitched=catalog.filter(i=>!i.isDrum);
 const choose=pattern=>(pitched.find(i=>pattern.test(i.id+' '+i.name))||pitched[0]).id;
 const tracks=[
  {role:'melody',name:'主旋律',instrument:choose(dubstep?/synth|合成/i:/piano|钢琴|melody/i),volume:76},
  {role:'harmony',name:'和声',instrument:choose(/keys|strings|piano|harmony|电钢|弦乐/i),volume:54},
  {role:'bass',name:'贝斯',instrument:choose(/bass|贝斯/i),volume:72},
  {role:'drums',name:'鼓组',instrument:catalog.find(i=>i.isDrum).id,volume:68}
 ];
 const note=(midi,beat,duration,velocity)=>({midi,beat,duration,velocity});
 const minor=dubstep||/小调|minor/i.test(message);
 for (const t of tracks) {
  t.clips=sections.map((s,i)=>{
   const root=(minor?[45,41,43,45]:[48,41,43,48])[i];
   const third=minor && (i===0||i===3)?3:4;
   let notes;
   if(t.role==='melody') notes=(i===2?[7,12,7,third]:[0,third,7,i===3?0:third]).map((v,b)=>note(root+12+v,b,1,.78));
   if(t.role==='harmony') notes=[0,third,7].map(v=>note(root+v,0,3.8,.6));
   if(t.role==='bass') notes=(i===2?[0,1.5,2.5,3]:[0,2]).map((b,k)=>note(root-12+(k%2?7:0),b,.45,.8));
   if(t.role==='drums') {
    notes=[note(36,0,.2,.92),note(38,dubstep?2:1,.2,.85)];
    if(!dubstep)notes.push(note(38,3,.2,.8));
    if(i===2)notes.push(note(36,1.5,.2,.76));
    for(let beat=0;beat<4;beat+=i===2?.5:1)notes.push(note(42,beat,.12,.55));
   }
   return {startBar:s.firstBar,bars:1,repeat:s.bars,notes};
  });
 }
 return {title:dubstep?'半拍律动草稿':'四轨编曲草稿',summary:'按规则生成的基础分轨，可继续编辑。',bpm,bars,sections,tracks};
}
