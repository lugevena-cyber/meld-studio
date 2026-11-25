import test from 'node:test';
import assert from 'node:assert/strict';
import {generateSong,generateSingleTrack,validateSong} from '../worker/assistant.js';
import worker from '../worker/index.js';
const catalog=['melody','harmony','bass','drums'].map((id)=>({id,isDrum:id==='drums'}));
const clipPitches = {melody:[60,64], harmony:[55,57], bass:[36,43], drums:[36,42,38,42]};
const song = () => ({
 title:'测试曲', summary:'完整分轨', bpm:120, bars:16,
 sections:[
  {name:'前奏',firstBar:0,bars:4},
  {name:'主题',firstBar:4,bars:8},
  {name:'结尾',firstBar:12,bars:4},
 ],
 tracks:catalog.map(({id})=>({
  name:id, role:id, instrument:id, volume:70,
  clips:[{
   startBar:0, bars:4, repeat:4,
   notes:clipPitches[id].map((midi,beat)=>({midi,beat,duration:1,velocity:.8})),
  }],
 })),
});
test('rejects incomplete roles, invalid timing, wrong drum instruments and excess notes',()=>{
 for(const mutate of [s=>s.tracks.pop(),s=>s.sections[1].firstBar=7,s=>s.tracks[0].clips[0].repeat=5,s=>s.tracks[3].instrument='bass',s=>s.tracks[0].clips[0].notes[0].duration=17]){const s=song();mutate(s);assert.throws(()=>validateSong(s,catalog));}
 assert.equal(validateSong(song(),catalog).tracks.length,4);
});
test('generation requires login; missing model configuration fails clearly',async()=>{
 assert.equal((await worker.fetch(new Request('https://test/api/assistant/song',{method:'POST',headers:{Origin:'https://test'}}),{})).status,401);
 await assert.rejects(generateSong(new Request('https://test'),{},{}),e=>e.status===503);
});
test('model response is validated and credentials only go to the configured upstream',async()=>{
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async(url,opts)=>{calls++;assert.equal(url,'https://model.example/chat/completions');assert.equal(opts.headers.Authorization,'Bearer private-test');const body=JSON.parse(opts.body);assert.ok(body.messages[0].content.includes('ORIGINAL'));return Response.json({choices:[{message:{content:JSON.stringify(song())}}]});};
 const env={MUSIC_AI_URL:'https://model.example/chat/completions',MUSIC_AI_MODEL:'test',MUSIC_AI_KEY:'private-test',DB:{prepare:()=>({bind:()=>({all:async()=>({results:[{count:1}]})})})}};
 try{const result=await generateSong(new Request('https://test',{method:'POST',body:JSON.stringify({message:'写电子乐',catalog})}),env,{id:'one'});const data=await result.json();assert.equal(data.song.tracks.length,4);assert.equal(JSON.stringify(data).includes('private-test'),false);assert.equal(calls,1);}finally{globalThis.fetch=original;}
});

async function exercise(t, responses, message='生成 32 小节 Dubstep，140 BPM', instruments=catalog){
 const prompts=[];
 t.mock.method(globalThis,'fetch',async(url,opts)=>{
  prompts.push(JSON.parse(opts.body).messages);
  const reply=responses[prompts.length-1];
  assert.ok(reply,'unexpected model request');
  return reply instanceof Response?reply:Response.json({choices:[reply]});
 });
 const env={MUSIC_AI_URL:'https://model.example/chat/completions',MUSIC_AI_MODEL:'test',MUSIC_AI_KEY:'test',DB:{prepare:()=>({bind:()=>({all:async()=>({results:[{count:1}]})})})}};
 const result=await generateSong(new Request('https://test',{method:'POST',body:JSON.stringify({message,catalog:instruments})}),env,{id:'one'});
 return {data:await result.json(),prompts};
}
const answer = value=>({message:{content:JSON.stringify(value)}});
test('single-track generation keeps the selected instrument and a late entry', async t=>{
 const instrument={id:'piano',name:'钢琴',isDrum:false};
 const notes=[{midi:64,beat:4.25,duration:1.5,velocity:.72}];
 const score={title:'雨夜',summary:'钢琴旋律',bpm:100,bars:2,sections:[{name:'主题',firstBar:0,bars:2}],
  tracks:[{name:'钢琴',role:'melody',instrument:'piano',volume:72,clips:[{startBar:0,bars:2,repeat:1,notes}]}]};
 let calls=0;
 t.mock.method(globalThis,'fetch',async()=>{
  calls++;const result=structuredClone(score);if(calls===1)result.tracks[0].instrument='bass';
  return Response.json({choices:[answer(result)]});
 });
 const env={MUSIC_AI_URL:'https://model.example/chat/completions',MUSIC_AI_MODEL:'test',MUSIC_AI_KEY:'test',DB:{prepare:()=>({bind:()=>({all:async()=>({results:[{count:1}]})})})}};
 const result=await generateSingleTrack(new Request('https://test',{method:'POST',body:JSON.stringify({message:'第一小节留白',instrument})}),env,{id:'one'});
 const data=await result.json();
 assert.equal(calls,2);
 assert.equal(data.song.tracks.length,1);
 assert.deepEqual(data.song.tracks[0].clips[0].notes,notes);
});

test('a connected flute phrase preserves its late entry, rests and named non-DX7 guitar',async t=>{
 const instruments=[...catalog,
  {id:'dx7-ROM1A-24',name:'DX7 · FLUTE 1',isDrum:false},
  {id:'dx7-ROM1A-04',name:'DX7 · STRINGS 1',isDrum:false},
  {id:'mutedguitar',name:'闷音 Funk 吉他',isDrum:false},
 ];
 const score=song();
 const phrase=[72,69,67,64,65,69,67,72].map((midi,i)=>({midi,beat:i*.75,duration:.42,velocity:.8}));
 Object.assign(score.tracks[0],{name:'DX7 Flute 1 主旋律',instrument:'dx7-ROM1A-24',clips:[{startBar:8,bars:2,repeat:1,notes:phrase}]});
 score.tracks[2].clips=[
  {startBar:0,bars:1,repeat:8,notes:[{midi:36,beat:0,duration:.4,velocity:.8},{midi:43,beat:1.5,duration:.4,velocity:.7}]},
  {startBar:8,bars:1,repeat:8,notes:[{midi:36,beat:0,duration:.4,velocity:.8},{midi:43,beat:2.5,duration:.4,velocity:.7}]},
 ];
 score.tracks.push({...score.tracks[1],role:'countermelody',name:'闷音 Funk 吉他 · 短击',instrument:'dx7-ROM1A-04',params:{release:1800}});
 const {data,prompts}=await exercise(t,[answer(score)],'用 DX7 长笛和闷音 Funk 吉他，旋律连贯，第 9 小节入场，保留休止',instruments);
 assert.equal(prompts.length,1);
 assert.equal(data.source,'model');
 assert.deepEqual(data.song.tracks[0].clips,[{startBar:8,bars:2,repeat:1,notes:phrase}]);
 assert.equal(data.song.tracks[4].instrument,'mutedguitar');
 assert.equal(data.song.tracks[4].params,undefined);
});

test('an alarm-like run across repeating clips is sent back for a different lead phrase',async t=>{
 const score=song();
 score.tracks[0].clips=[{startBar:0,bars:1,repeat:8,notes:Array.from({length:4},(_,i)=>({midi:72,beat:i,duration:.9,velocity:.8}))}];
 const {data,prompts}=await exercise(t,[answer(score),answer(song())],'写一段主旋律连贯的电子乐');
 assert.equal(prompts.length,2);
 assert.match(prompts[1].at(-1).content,/same-pitch attacks/);
 assert.equal(data.source,'model');
 assert.deepEqual(data.song.tracks[0].clips,song().tracks[0].clips);
});

test('funk arrangement retries square bass and returns a labeled, recorded five-track draft if still weak',async t=>{
 const instruments=[...catalog,
  {id:'piano',isDrum:false},
  {id:'mutedguitar',isDrum:false},
  {id:'sample-funk-kit',isDrum:true},
 ];
 const {data,prompts}=await exercise(t,[answer(song()),answer(song())],
  '生成 16 小节，116 BPM，F# 小调，5 轨迈克尔·杰克逊风格放克，真实采样',instruments);
 assert.equal(prompts.length,2);
 assert.match(prompts[0][0].content,/2\/4 snare backbeats/);
 assert.match(prompts[1].at(-1).content,/tracks\.bass/);
 assert.equal(data.source,'rules');
 assert.deepEqual(data.song.key,{tonic:6,mode:'minor'});
 assert.equal(data.song.bpm,116);
 assert.equal(data.song.tracks.length,5);
 assert.equal(data.song.tracks.find(track=>track.role==='drums').instrument,'sample-funk-kit');
 assert.ok(data.song.tracks.every(track=>['piano','mutedguitar','sample-funk-kit','bass'].includes(track.instrument)));
 assert.ok(data.song.tracks.find(track=>track.role==='bass').clips.some(clip=>clip.notes.some(note=>note.beat%1!==0)));
});

test('intentional sparse funk avoids extra retries and an explicit synth request keeps its instrument',async t=>{
 const instruments=[...catalog,{id:'piano',isDrum:false},{id:'sample-funk-kit',isDrum:true}];
 const {data,prompts}=await exercise(t,[answer(song())],'用合成器写极简 Funk，16 小节',instruments);
 assert.equal(prompts.length,1);
 assert.equal(data.source,'model');
 assert.equal(data.song.tracks[0].instrument,'melody');
 assert.equal(data.song.tracks[3].instrument,'drums');
});

test('repairs one-based section starts, catalog names, MIDI velocities and note tails without a retry',async t=>{
 const original=song();
 original.sections.forEach(section=>section.firstBar++);
 original.tracks[0].instrument='钢琴';
 Object.assign(original.tracks[0].clips[0].notes[0],{beat:15.5,duration:1,velocity:96});
 const instruments=catalog.map(x=>({...x,name:x.id==='melody'?'钢琴':x.id}));
 const {data,prompts}=await exercise(t,[answer(original)],undefined,instruments);
 assert.equal(prompts.length,1);
 assert.equal(data.source,'model');
 assert.equal(data.song.sections[0].firstBar,0);
 assert.equal(data.song.tracks[0].instrument,'melody');
 assert.deepEqual(data.song.tracks[0].clips[0].notes[0],{midi:60,beat:15.5,duration:.5,velocity:96/127});
});
test('gives the model the exact bad note path and uses its corrected score',async t=>{
 const bad=song();bad.tracks[1].clips[0].notes[1].midi=128;
 const {data,prompts}=await exercise(t,[answer(bad),answer(song())]);
 assert.match(prompts[1].at(-1).content,/tracks\[1\]\.clips\[0\]\.notes\[1\]\.midi/);
 assert.equal(data.source,'model');
 assert.equal(data.song.title,'测试曲');
});
test('truncation followed by malformed JSON yields a labeled playable Dubstep draft',async t=>{
 const {data,prompts}=await exercise(t,[{finish_reason:'length',message:{content:'{"title":'}},{message:{content:'invalid JSON'}}]);
 assert.equal(prompts.length,2);
 assert.equal(data.source,'rules');
 assert.equal(data.song.bars,32);assert.equal(data.song.bpm,140);
 assert.deepEqual(data.song.sections.map(x=>x.name),['前奏','主题','Drop','结尾']);
 assert.equal(validateSong(data.song,catalog),data.song);
});
test('two rejected scores including null elements recover even with a continuous DX7 request',async t=>{
 const bad=song();bad.tracks[0].clips=[null];
 const instruments=[...catalog,{id:'dx7-ROM1A-01',name:'BRASS',isDrum:false}];
 const {data}=await exercise(t,[answer(bad),answer({})],'生成 17 小节 DX7，BPM 102，旋律连贯',instruments);
 assert.equal(data.source,'rules');assert.equal(data.song.bars,17);assert.equal(data.song.bpm,102);
 assert.ok(data.song.tracks.filter(t=>t.role!=='drums').every(t=>t.instrument==='dx7-ROM1A-01'));
 assert.equal(validateSong(data.song,instruments),data.song);
});
test('an upstream credential failure stays actionable',async t=>{
 await assert.rejects(exercise(t,[new Response('',{status:401})]),e=>e.status===502&&/配置/.test(e.message));
});
test('refusal does not become an arrangement',async t=>{
 await assert.rejects(exercise(t,[{message:{refusal:'refused'}}]),e=>e.status===422);
});
test('rule draft passes score validation at every supported length',async()=>{
 const {arrangementDraft}=await import('../worker/arrangement-draft.js');
 for(let bars=16;bars<=64;bars++){
  const draft=arrangementDraft(bars+' 小节，160 BPM',catalog,100);
  assert.equal(draft.bars,bars);assert.equal(draft.bpm,160);
  assert.equal(validateSong(draft,catalog),draft);
  assert.ok(draft.tracks.every(t=>t.clips.reduce((sum,c)=>sum+c.bars*c.repeat,0)===bars));
 }
});

test('the assistant offers the recovery draft, applies it on demand and can undo it',async t=>{
 const {data}=await exercise(t,[answer({}),answer({})]);
 const {readFile}=await import('node:fs/promises');
 const vm=await import('node:vm');
 const instruments=catalog.map(x=>({...x,name:x.id,defaults:{}}));
 const original={bpm:112,baseBpm:112,duration:8,sections:[],tracks:[{id:'existing',name:'原轨',notes:[]}]};
 let current=structuredClone(original),id=0;
 const nodes=new Map();
 const node=key=>{
  if(!nodes.has(key))nodes.set(key,{value:'',replaceChildren(){},append(){}});
  return nodes.get(key);
 };
 node('assistantMode').value='online';
 const ctx=vm.createContext({structuredClone,AbortSignal,document:{getElementById:node,createElement:()=>({})},
  fetch:async()=>Response.json(data),assistantChatStorageKey:()=>'test-account',readSnapshot:()=>structuredClone(current),writeSnapshot:s=>{current=structuredClone(s);},
  instruments,get arrangement(){return current;},makeId:()=>String(++id),performanceInput:{},drumKitFromTrack:()=>false,isSampledInstrument:()=>false,
  stopArrangementPlayback(){},stopMelodyPlayback(){},releasePerformanceKeys(){},renderPerformancePanel(){}});
 for(const file of ['assistant-engine.js','arrangement-assistant.js'])vm.runInContext(await readFile(new URL('../public/'+file,import.meta.url),'utf8'),ctx);
 vm.runInContext("assistantSnapshot=readSnapshot; assignAssistantSnapshot=writeSnapshot; assistantCatalog=()=>instruments; assistantContext=()=>({...readSnapshot(),catalog:instruments}); appendAssistantMessage=renderAssistantState=renderAssistantImages=previewAssistantExperiment=()=>{}; arrangementAssistant.connected=true;",ctx);
 await vm.runInContext("requestArrangementAssistance('生成 32 小节 Dubstep，140 BPM')",ctx);
 assert.match(node('assistantPlanLabel').textContent,/规则草稿/);
 assert.equal(node('assistantPlan').hidden,false);
 assert.deepEqual(current,original);
 vm.runInContext('applyAssistantExperiment()',ctx);
 assert.equal(current.bpm,140);assert.equal(current.tracks.length,4);
 assert.ok(current.tracks.every(track=>track.notes.length>=32));
 vm.runInContext('undoAssistantExperiment()',ctx);
 assert.deepEqual(current,original);
 assert.equal(vm.runInContext("isAssistantQuestion('能不能帮我生成一首 Funk？')",ctx),false);
 assert.equal(vm.runInContext("isAssistantQuestion('为什么生成的音乐没声音？')",ctx),true);
 assert.equal(vm.runInContext("isAssistantQuestion('换成小调呢','chat')",ctx),true);
 assert.equal(vm.runInContext("isAssistantQuestion('生成一首 Funk','chat')",ctx),false);
});
