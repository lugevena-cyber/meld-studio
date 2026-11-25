import {test,mock} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker from '../worker/index.js';
function fixture({mail=true}={}){
 const db=new DatabaseSync(':memory:');for(const file of ['0000_meld_cloud','0001_email_auth','0003_social_auth'])db.exec(readFileSync(new URL('../drizzle/'+file+'.sql',import.meta.url),'utf8'));
 const DB={prepare(sql){let values=[];return {bind(...v){values=v;return this;},all:async()=>({results:db.prepare(sql).all(...values)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...values).changes)}}),sql};},async batch(statements){db.exec('BEGIN');try{const out=[];for(const s of statements)out.push(s.sql.startsWith('SELECT')?await s.all():await s.run());db.exec('COMMIT');return out;}catch(e){db.exec('ROLLBACK');throw e;}}};
 const env={DB,AUTH_CODE_SECRET:'test-only-code-secret-not-used-in-production',...(mail?{RESEND_API_KEY:'test-only',AUTH_EMAIL_FROM:'MELD <no-reply@meld.example>'}:{})};
 async function call(path,{method='GET',body,cookie,origin='https://meld.test',platform}={}){const headers={};if(cookie)headers.Cookie=cookie;if(platform){headers['oai-authenticated-user-id']=platform;headers['oai-authenticated-user-email']='owner@example.com';}if(method!=='GET'){headers.Origin=origin;headers['Content-Type']='application/json';}return worker.fetch(new Request('https://meld.test'+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)}),env);}
 const codes=[];const sender=mock.method(globalThis,'fetch',async(url,options)=>{assert.equal(url,'https://api.resend.com/emails');const body=JSON.parse(options.body);codes.push(body.text.match(/：([0-9]{6})/)[1]);return new Response('{"id":"test-message"}',{status:200});});
 const post=(path,body,extra)=>call('/api/auth/'+path,{method:'POST',body,...extra});
 return {db,env,call,post,codes,sender};
}
const email='pianist@example.com',password='Melody123';
test('Google and WeChat create independent sessions without email codes, and only the owner can view admin metrics',async()=>{
 const f=fixture();
 f.sender.mock.restore();
 Object.assign(f.env,{
  GOOGLE_OAUTH_CLIENT_ID:'test-client',GOOGLE_OAUTH_CLIENT_SECRET:'test-secret',
  WECHAT_OAUTH_APP_ID:'test-app',WECHAT_OAUTH_APP_SECRET:'test-wechat-secret',MELOHUM_ADMIN_EMAIL:'owner@example.com'
 });
 let calls=0;
 const provider=mock.method(globalThis,'fetch',async(url,options)=>{
  calls++;
  if(url==='https://oauth2.googleapis.com/token'){
   assert.equal(options.body.get('code'),'test-code');assert.match(options.body.get('code_verifier'),/^[a-f0-9]{64}$/);
   return Response.json({access_token:'google-access'});
  }
  if(url==='https://openidconnect.googleapis.com/v1/userinfo'){
   assert.equal(options.headers.Authorization,'Bearer google-access');
   return Response.json({sub:'google-player',email:'owner@example.com',email_verified:true});
  }
  assert.equal(new URL(url).origin,'https://api.weixin.qq.com');
  return Response.json({access_token:'wechat-access',openid:'wechat-player'});
 });
 const base='https://melohum.com';
 const call=(path,options)=>worker.fetch(new Request(base+path,options),f.env);
 try{
  assert.deepEqual((await (await call('/api/auth/config')).json()).socialProviders,['google','wechat']);
  const users=[];
  for(const name of ['google','wechat']){
   const start=await call(`/api/auth/${name}/start?page=lab`);
   assert.equal(start.status,303);
   const target=new URL(start.headers.get('Location'));
   assert.equal(target.searchParams.get('redirect_uri'),`${base}/api/auth/${name}/callback`);
   const cookies=start.headers.getSetCookie()[0].split(';')[0];
   const previous=calls;
   const forged=await call(`/api/auth/${name}/callback?code=test-code&state=wrong`,{headers:{Cookie:cookies}});
   assert.match(forged.headers.get('Location'),/login=failed/);
   assert.equal(calls,previous);
   const callback=await call(`/api/auth/${name}/callback?code=test-code&state=${target.searchParams.get('state')}`,{headers:{Cookie:cookies}});
   assert.equal(callback.headers.get('Location'),base+'/?page=lab');
   const sessionCookie=callback.headers.getSetCookie().find(cookie=>cookie.startsWith('__Host-meld_session=')).split(';')[0];
   const data=await (await call('/api/auth/session',{headers:{Cookie:sessionCookie}})).json();
   assert.equal(data.session.user.authMethod,name);
   assert.equal(data.session.user.isAdmin,false);
   users.push(data.session.user.id);
   assert.equal((await call('/api/admin/overview',{headers:{Cookie:sessionCookie}})).status,403);
   assert.equal((await call('/api/auth/signout',{method:'POST',headers:{Cookie:sessionCookie,Origin:base},body:'{}'})).status,200);
   assert.equal((await (await call('/api/auth/session',{headers:{Cookie:sessionCookie}})).json()).session,null);
  }
  assert.notEqual(...users);
  assert.equal(f.db.prepare('SELECT COUNT(*) AS n FROM email_challenges').get().n,0);
  const admin={headers:{'oai-authenticated-user-id':'owner','oai-authenticated-user-email':'owner@example.com'}};
  assert.equal((await (await call('/api/auth/session',admin)).json()).session.user.isAdmin,true);
  assert.equal((await call('/api/admin/overview',admin)).status,200);
 }finally{provider.mock.restore();f.db.close();}
});
async function register(f){assert.equal((await f.post('send-code',{email,purpose:'signup'})).status,200);const response=await f.post('signup',{email,password,code:f.codes.at(-1)});assert.equal(response.status,200);return {cookie:response.headers.get('Set-Cookie').split(';')[0],data:await response.json()};}
test('registration verifies email, hashes passwords, creates secure sessions and isolates existing ChatGPT records',async()=>{
 const f=fixture();try{
  assert.equal((await f.post('signup',{email,password,code:'123456'})).status,400);
  assert.equal(f.db.prepare('SELECT COUNT(*) AS n FROM email_users').get().n,0);
  const {cookie,data}=await register(f);assert.match(data.session.user.id,/^email:/);assert.equal(data.session.user.authMethod,'email');
  const row=f.db.prepare('SELECT * FROM email_users').get();assert.match(row.password_hash,/^scrypt\$32768\$8\$3\$/);assert.ok(!row.password_hash.includes(password));assert.equal(row.email,email);
  const session=await f.call('/api/auth/session',{cookie});assert.equal((await session.json()).session.user.id,data.session.user.id);
  assert.equal((await (await f.call('/api/auth/session',{platform:'legacy-owner'})).json()).session.user.id,'legacy-owner');
  assert.equal((await f.post('signup',{email,password,code:f.codes[0]})).status,400);
  const signed=await f.post('signin',{email:'PIANIST@EXAMPLE.COM',password});assert.equal(signed.status,200);assert.match(signed.headers.get('Set-Cookie'),/HttpOnly; Secure; SameSite=Lax/);
  assert.equal((await f.post('signin',{email,password:'Wrong1234'})).status,401);
  assert.equal((await f.post('signout',{}, {cookie})).status,200);
  assert.equal((await (await f.call('/api/auth/session',{cookie})).json()).session,null);
 }finally{f.sender.mock.restore();f.db.close();}
});
test('password reset requires separate one-time code, preserves records and revokes every email session',async()=>{
 const f=fixture();try{
  const {cookie,data}=await register(f);const second=await f.post('signin',{email,password}),secondCookie=second.headers.get('Set-Cookie').split(';')[0];
  f.db.prepare('INSERT INTO documents VALUES(?,?,?,?,1,0,?)').run(data.session.user.id,'projects','work','{"id":"work","title":"Keep"}',Date.now());
  assert.equal((await f.post('reset-password',{email,password:'NewSong456',code:f.codes[0]})).status,400);
  f.db.exec('UPDATE auth_rate_limits SET expires_at=0');
  assert.equal((await f.post('send-code',{email,purpose:'reset'})).status,200);
  const code=f.codes.at(-1);assert.equal((await f.post('reset-password',{email,password:'NewSong456',code})).status,200);
  for(const c of [cookie,secondCookie])assert.equal((await (await f.call('/api/auth/session',{cookie:c})).json()).session,null);
  assert.equal(f.db.prepare('SELECT COUNT(*) AS n FROM documents').get().n,1);
  assert.equal((await f.post('signin',{email,password})).status,401);
  assert.equal((await f.post('signin',{email,password:'NewSong456'})).status,200);
  assert.equal((await f.post('reset-password',{email,password:'Replay789',code})).status,400);
 }finally{f.sender.mock.restore();f.db.close();}
});
test('password rules are enforced by the server on signup, login and reset',async()=>{const f=fixture();try{
 for(const bad of ['12345678','abcdefgh','abc1234','abc12345678901234','Abcd123!','中文Ab1234','Abc 1234'])for(const route of ['signup','signin','reset-password'])assert.equal((await f.post(route,{email,password:bad,code:'123456'})).status,400);
 for(const good of ['Abcd1234','Abcd123456789012'])assert.equal((await f.post('signup',{email,password:good,code:'123456'})).status,400); // Valid password, but absent verification.
 assert.equal(f.db.prepare('SELECT COUNT(*) AS n FROM email_users').get().n,0);
 }finally{f.sender.mock.restore();f.db.close();}});
test('codes expire, lock after five attempts, resend throttles, cross-site writes fail',async()=>{const f=fixture();try{
 assert.equal((await f.post('send-code',{email,purpose:'signup'})).status,200);const code=f.codes[0];
 assert.equal((await f.post('send-code',{email,purpose:'signup'})).status,429);
 for(let i=0;i<5;i++)assert.equal((await f.post('signup',{email,password,code:code==='000000'?'111111':'000000'})).status,400);
 assert.equal((await f.post('signup',{email,password,code})).status,400);
 f.db.exec('UPDATE auth_rate_limits SET expires_at=0');assert.equal((await f.post('send-code',{email,purpose:'signup'})).status,200);
 f.db.exec('UPDATE email_challenges SET expires_at=0');assert.equal((await f.post('signup',{email,password,code:f.codes.at(-1)})).status,400);
 assert.equal((await f.post('send-code',{email,purpose:'signup'},{origin:'https://evil.example'})).status,403);
 assert.equal(f.db.prepare('SELECT COUNT(*) AS n FROM email_users').get().n,0);
 }finally{f.sender.mock.restore();f.db.close();}});
test('mail unconfigured and provider failure never report success or register an account',async()=>{
 const f=fixture({mail:false});try{assert.equal((await (await f.call('/api/auth/config')).json()).mailConfigured,false);assert.equal((await f.post('send-code',{email,purpose:'signup'})).status,503);assert.equal(f.codes.length,0);}finally{f.sender.mock.restore();f.db.close();}
 const g=fixture();g.sender.mock.mockImplementation(async()=>new Response('{}',{status:403}));try{assert.equal((await g.post('send-code',{email,purpose:'signup'})).status,503);assert.equal(g.db.prepare('SELECT COUNT(*) AS n FROM email_challenges').get().n,0);}finally{g.sender.mock.restore();g.db.close();}
});
