import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import worker from '../worker/index.js';
import {transcribe} from '../worker/transcription.js';
const context=vm.createContext({});vm.runInContext(readFileSync('public/transcription-core.js','utf8'),context);const create=()=>context.MelohumTranscription.createCollector();
test('interleaved instrument notes keep source timing and require completion',()=>{
 const c=create();for(const e of [{type:'start',index:1,pitch:40,start_time:.3,instrument:'electric_bass'},{type:'start',index:2,pitch:60,start_time:.4,instrument:'piano'},{type:'end',start_event_index:2,end_time:1},{type:'end',start_event_index:1,end_time:2}])c.push(e);
 assert.throws(()=>c.result());c.push({type:'transcription_complete',data:'TVRoZA==',beat_grid:{bpm:96}});const result=c.result();assert.equal(result.groups.length,2);assert.equal(result.count,2);assert.equal(result.groups.find(x=>x.name==='electric_bass').notes[0].start,.3);
});
test('malformed, incomplete and invalid pitch data are rejected',()=>{
 assert.throws(()=>create().push({type:'end',start_event_index:3,end_time:1}));assert.throws(()=>create().push({type:'start',index:0,pitch:128,start_time:0,instrument:'piano'}));const c=create();c.push({type:'start',index:0,pitch:60,start_time:0,instrument:'piano'});c.push({type:'transcription_complete'});assert.throws(()=>c.result());
});
test('route enforces login, origin and truthful unconfigured state',async()=>{
 const call=(path,method='GET',headers={})=>worker.fetch(new Request('https://test'+path,{method,headers}),{});
 assert.equal((await (await call('/api/transcription/status')).json()).configured,false);
 assert.equal((await call('/api/transcription','POST')).status,401);
 const identity={'oai-authenticated-user-id':'one','oai-authenticated-user-email':'one@test.com'};
 assert.equal((await call('/api/transcription','POST',{...identity,Origin:'https://evil.test'})).status,403);
 assert.equal((await call('/api/transcription','POST',{...identity,Origin:'https://test'})).status,503);
});
test('proxy keeps token upstream and relays real SSE without fabricating notes',async()=>{
 const original=globalThis.fetch;let called=false;
 const stream='data: {"type":"progress","completed":1,"total":2}\n\n';
 globalThis.fetch=async(url,opts)=>{called=true;assert.equal(url,'https://private.example/transcribe');assert.equal(opts.headers.Authorization,'Bearer private-secret');assert.equal(opts.body.get('file').size,3);return new Response(stream,{headers:{'Content-Type':'text/event-stream'}});};
 try{const form=new FormData();form.append('file',new Blob(['abc'],{type:'audio/wav'}),'recording.wav');const r=await transcribe(new Request('https://test',{method:'POST',body:form}),{MUSCRIPTOR_URL:'https://private.example',MUSCRIPTOR_TOKEN:'private-secret',DB:{prepare:()=>({bind:()=>({all:async()=>({results:[{count:1}]})})})}},{id:'one'});assert.equal(await r.text(),stream);assert.equal(r.headers.has('Authorization'),false);assert.ok(called);}finally{globalThis.fetch=original;}
});
