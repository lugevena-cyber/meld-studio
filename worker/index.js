import {transcriptionConfigured,transcribe} from './transcription.js';
import {ApiError,json,limitedBody,bodyJSON} from './http.js';
import {answerAssistantQuestion,generateSong,generateSingleTrack} from './assistant.js';
import {authRoute,effectiveUser,isSiteAdmin} from './auth.js';
import {enabledSocialProviders} from './social-auth.js';
import {aiConfigSummary,aiConfigured,loadAiConfig,saveAiConfig} from './ai-config.js';
const KINDS = new Set(['projects','patches','materials','drafts','settings','chats']);
const MAX_AUDIO = 25 * 1024 * 1024;
const ID = /^[\w.:-]{1,160}$/;
function audioKey(owner,id){return `users/${encodeURIComponent(owner)}/audio/${id}`;}
export async function api(request,env){
 const url=new URL(request.url),path=url.pathname,method=request.method;
 const auth=await authRoute(request,env);if(auth)return auth;
 const user=await effectiveUser(request,env);
 if(path==='/api/health'&&method==='GET')return json({ok:true,service:'meld-cloud',storage:{database:Boolean(env.DB),audio:Boolean(env.BUCKET)}});
 if(path==='/api/assistant/status'&&method==='GET'){const ready=await aiConfigured(env);return json({configured:ready,reason:ready?'':'尚未配置模型服务'});}

 if(path==='/api/transcription/status'&&method==='GET')return json({configured:transcriptionConfigured(env)});
 if(!user)throw new ApiError(401,'请先登录 Melohum 账户');
 if(!['GET','HEAD'].includes(method)){
  if(request.headers.get('Origin')!==url.origin||request.headers.get('Sec-Fetch-Site')==='cross-site')throw new ApiError(403,'不允许跨站修改数据');
 }
 if(path.startsWith('/api/admin/')&&!isSiteAdmin(user,env))throw new ApiError(403,'此设置仅对站点管理员开放');
 if(path==='/api/admin/overview'&&method==='GET'){
  const [documents,accounts,ai]=await Promise.all([
   env.DB.prepare("SELECT kind, COUNT(*) AS count FROM documents WHERE deleted=0 AND kind IN ('projects','patches','materials') GROUP BY kind").all(),
   env.DB.prepare('SELECT COUNT(*) AS count FROM email_users').all(),
   aiConfigured(env)
  ]);
  return json({emailAccounts:accounts.results[0]?.count??0,documents:documents.results,services:{ai,transcription:transcriptionConfigured(env),social:enabledSocialProviders(env)}});
 }
 if(path==='/api/admin/ai-config'){
  if(method==='GET')return json(await aiConfigSummary(env));
  if(method==='PUT')return json(await saveAiConfig(env,await bodyJSON(request,8192),user));
  throw new ApiError(405,'不支持此操作');
 }
 if(path==='/api/transcription'&&method==='POST')return transcribe(request,env,user);
 if(path==='/api/assistant/song'&&method==='POST')return generateSong(request,env,user);
 if(path==='/api/assistant/track'&&method==='POST')return generateSingleTrack(request,env,user);
 if(path==='/api/assistant/chat'&&method==='POST')return answerAssistantQuestion(request,env,user);
 if(path==='/api/data/status'&&method==='GET'){
  const result=await env.DB.prepare('SELECT kind, COUNT(*) AS count, MAX(updated_at) AS updatedAt FROM documents WHERE owner=? AND deleted=0 GROUP BY kind').bind(user.id).all();
  return json({provider:'sites',collections:result.results,limits:{audioBytes:MAX_AUDIO}});
 }
 if(path==='/api/data/account'&&method==='GET')return json({user,provider:'sites'});
 const audio=path.match(/^\/api\/data\/audio\/([^/]+)$/);
 if(audio){
  const id=decodeURIComponent(audio[1]);if(!ID.test(id))throw new ApiError(400,'无效的音频编号');
  const key=audioKey(user.id,id);
  if(method==='GET'||method==='HEAD'){
   const object=method==='HEAD'?await env.BUCKET.head(key):await env.BUCKET.get(key);
   if(!object)throw new ApiError(404,'未找到此账户的音频');
   const headers=new Headers({'Content-Type':object.httpMetadata?.contentType||'application/octet-stream','Content-Length':String(object.size),'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Vary':'Cookie'});
   return new Response(method==='HEAD'?null:object.body,{headers});
  }
  if(method==='PUT'){
   const type=(request.headers.get('Content-Type')||'application/octet-stream').split(';')[0].toLowerCase();
   if(!type.startsWith('audio/')&&!['application/octet-stream','video/webm'].includes(type))throw new ApiError(415,'仅支持音频文件');
   const bytes=await limitedBody(request,MAX_AUDIO);if(!bytes.length)throw new ApiError(400,'音频内容为空');
   const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
   const existing=await env.BUCKET.head(key);
   if(existing&&existing.customMetadata?.sha256!==digest)throw new ApiError(409,'该音频编号已使用，请保留原件并重新导入');
   await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:type},customMetadata:{sha256:digest},onlyIf:{etagDoesNotMatch:'*'}});
   // Conditional create keeps audio immutable, including simultaneous requests.
   const stored=await env.BUCKET.head(key);
   if(stored?.customMetadata?.sha256!==digest)throw new ApiError(409,'音频编号冲突，请重新导入');
   return json({id,size:bytes.length});
  }
  throw new ApiError(405,'不支持此操作');
 }
 const match=path.match(/^\/api\/data\/([a-z]+)(?:\/([^/]+))?$/);
 if(!match||!KINDS.has(match[1]))throw new ApiError(404,'接口不存在');
 const kind=match[1],id=match[2]?decodeURIComponent(match[2]):null;
 if(id&&!ID.test(id))throw new ApiError(400,'无效的数据编号');
 if(method==='GET'&&!id){
  const result=await env.DB.prepare('SELECT id,payload,revision FROM documents WHERE owner=? AND kind=? AND deleted=0 ORDER BY updated_at DESC').bind(user.id,kind).all();
  return json({items:result.results.map(row=>({...row,payload:JSON.parse(row.payload)}))});
 }
 if(method==='PUT'&&!id){
  const data=await bodyJSON(request);
  if(!Array.isArray(data?.items)||data.items.length>200)throw new ApiError(400,'每次最多保存 200 条记录');
  const seen=new Set(),rows=data.items.map(item=>{
   const payload=item?.payload,id=payload?.id,rev=item?.expectedRevision;
   if(!payload||typeof payload!=='object'||Array.isArray(payload)||typeof id!=='string'||!ID.test(id)||seen.has(id))throw new ApiError(400,'记录编号无效或重复');
   seen.add(id);if(rev!==null&&(!Number.isSafeInteger(rev)||rev<1))throw new ApiError(400,'缺少有效的数据版本');
   const serialized=JSON.stringify(payload);if(new TextEncoder().encode(serialized).length>512*1024)throw new ApiError(413,'单条记录超过 512 KB，请拆分作品');
   return {id,serialized,rev};
  });
  if(!rows.length)return json({items:[]});
  const now=Date.now();
  // A stale tab cannot overwrite a newer save or resurrect a deleted record.
  const results=await env.DB.batch(rows.map(row=>row.rev===null
   ?env.DB.prepare('INSERT INTO documents(owner,kind,id,payload,revision,deleted,updated_at) VALUES(?,?,?,?,1,0,?) ON CONFLICT(owner,kind,id) DO NOTHING').bind(user.id,kind,row.id,row.serialized,now)
   :env.DB.prepare('UPDATE documents SET payload=?,revision=revision+1,updated_at=? WHERE owner=? AND kind=? AND id=? AND revision=? AND deleted=0').bind(row.serialized,now,user.id,kind,row.id,row.rev)));
  const saved=await env.DB.batch(rows.map(r=>env.DB.prepare('SELECT id,revision FROM documents WHERE owner=? AND kind=? AND id=?').bind(user.id,kind,r.id)));
  const items=saved.map((r,i)=>results[i].meta.changes===1?r.results[0]:null).filter(Boolean);
  if(results.some(r=>r.meta.changes!==1))return json({error:'作品在其他窗口发生变化，请备份当前编辑后刷新，避免覆盖。',items},409);
  return json({items});
 }
 if(method==='DELETE'&&id){
  const data=await bodyJSON(request),rev=data?.expectedRevision;
  if(!Number.isSafeInteger(rev)||rev<1)throw new ApiError(409,'请先读取最新记录再删除');
  const result=await env.DB.prepare('UPDATE documents SET payload=NULL,deleted=1,revision=revision+1,updated_at=? WHERE owner=? AND kind=? AND id=? AND revision=? AND deleted=0').bind(Date.now(),user.id,kind,id,rev).run();
  if(result.meta.changes!==1)throw new ApiError(409,'记录已修改或删除，请刷新后重试');
  return json({id,revision:rev+1});
 }
 throw new ApiError(405,'不支持此操作');
}
export default {async fetch(request,env){
 try{
  if(new URL(request.url).pathname.replace(/\/+$/, '')==='/traceability.html')return new Response('页面已移除',{status:410,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});
  if(new URL(request.url).pathname.startsWith('/api/'))return await api(request,env);
  return await env.ASSETS.fetch(request);
 }catch(e){if(!(e instanceof ApiError))console.error('Melohum API failed',e.name,e.message);return json({error:e instanceof ApiError?e.message:'云端暂时不可用，请稍后重试'},e.status||503);}
}};
