import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker from '../worker/index.js';
function fixture(){
 const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../drizzle/0000_meld_cloud.sql',import.meta.url),'utf8'));
 const DB={prepare(sql){let values=[];return {bind(...v){values=v;return this;},async all(){return {results:db.prepare(sql).all(...values)};},async run(){return {meta:{changes:Number(db.prepare(sql).run(...values).changes)}};},sql,get values(){return values;}};},async batch(statements){db.exec('BEGIN');try{const out=[];for(const s of statements){out.push(s.sql.trim().startsWith('SELECT')?await s.all():await s.run());}db.exec('COMMIT');return out;}catch(e){db.exec('ROLLBACK');throw e;}}};
 const blobs=new Map();const BUCKET={async head(k){const b=blobs.get(k);return b?{...b,body:undefined}:null;},async get(k){const b=blobs.get(k);return b?{...b,body:b.bytes}:null;},async put(k,bytes,options){if(blobs.has(k)&&options.onlyIf)return null;blobs.set(k,{bytes,size:bytes.length,...options});return {};}};
 async function call(path,{user='alice',method='GET',body,origin='https://meld.test',type='application/json'}={}){const headers={};if(user){headers['oai-authenticated-user-id']=user;headers['oai-authenticated-user-email']=user+'@test.local';}if(method!=='GET'){headers.Origin=origin;headers['Content-Type']=type;}return worker.fetch(new Request('https://meld.test'+path,{method,headers,body:body===undefined?undefined:typeof body==='string'||body instanceof Uint8Array?body:JSON.stringify(body)}),{DB,BUCKET,ASSETS:{fetch:()=>new Response('assets')}});}
 return {call,db};
}
const item=(id,revision=null,title='first')=>({payload:{id,title},expectedRevision:revision});
test('session and protected endpoints require platform identity',async()=>{const {call}=fixture();assert.equal((await (await call('/api/auth/session',{user:null})).json()).session,null);for(const method of ['GET','PUT','DELETE'])assert.equal((await call('/api/data/projects',{user:null,method,body:method==='GET'?undefined:{items:[]}})).status,401);});
test('all six collections persist, stay separate by user, and enforce revisions',async()=>{const {call}=fixture();for(const kind of ['projects','patches','materials','drafts','settings','chats']){
 const path='/api/data/'+kind;
 assert.equal((await call(path,{method:'PUT',body:{items:[item('one')]}})).status,200);
 assert.equal((await (await call(path,{user:'bob'})).json()).items.length,0);
 let rows=(await (await call(path)).json()).items;assert.equal(rows[0].revision,1);
 assert.equal((await call(path,{method:'PUT',body:{items:[item('one',1,'second')]}})).status,200);
 assert.equal((await call(path,{method:'PUT',body:{items:[item('one',1,'stale')]}})).status,409);
 rows=(await (await call(path)).json()).items;assert.equal(rows[0].payload.title,'second');assert.equal(rows[0].revision,2);
 assert.equal((await call(path+'/one',{method:'DELETE',user:'bob',body:{expectedRevision:2}})).status,409);
 assert.equal((await call(path+'/one',{method:'DELETE',body:{expectedRevision:2}})).status,200);
 assert.equal((await call(path,{method:'PUT',body:{items:[item('one')]}})).status,409);
 assert.equal((await (await call(path)).json()).items.length,0);
 }});
test('cross origin writes and malformed records are rejected',async()=>{const {call}=fixture();assert.equal((await call('/api/data/projects',{method:'PUT',origin:'https://evil.test',body:{items:[item('one')]}})).status,403);for(const body of ['invalid',{items:[item('../bad')]},{items:[item('one'),item('one')]},{items:[item('one',-1)]},{items:[item('one',null,'x'.repeat(513*1024))]}])assert.ok([400,413].includes((await call('/api/data/projects',{method:'PUT',body})).status));});
test('audio is private, immutable and retryable; invalid uploads fail',async()=>{const {call}=fixture(),path='/api/data/audio/hk6s:recording-1',opts={method:'PUT',type:'audio/wav',body:new Uint8Array([1,2,3])};assert.equal((await call(path,opts)).status,200);assert.equal((await call(path,opts)).status,200);assert.equal((await call(path,{...opts,body:new Uint8Array([4])})).status,409);assert.equal((await call(path,{user:'bob'})).status,404);assert.deepEqual([...new Uint8Array(await (await call(path)).arrayBuffer())],[1,2,3]);assert.equal((await call(path,{...opts,type:'text/html'})).status,415);assert.equal((await call(path,{...opts,body:new Uint8Array(25*1024*1024+1)})).status,413);});
