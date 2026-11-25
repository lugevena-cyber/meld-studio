import {scryptAsync} from '@noble/hashes/scrypt';
import {ApiError,json,bodyJSON} from './http.js';
import {enabledSocialProviders,socialAuthRoute} from './social-auth.js';
const COOKIE='__Host-meld_session',TTL=7*86400000,OTP_TTL=10*60000;
const PASSWORD=/^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9]{8,16}$/;
const PASSWORD_MESSAGE='密码须为 8–16 位，仅限字母和数字，且两者都要包含';
const encoder=new TextEncoder();
let passwordWorkBusy=false;
async function passwordKey(password,salt){
 if(passwordWorkBusy)throw new ApiError(429,'账户服务正在处理其他登录，请稍后重试');
 passwordWorkBusy=true;try{return await scryptAsync(password,salt,{N:32768,r:8,p:3,dkLen:32,maxmem:48*1024*1024,asyncTick:20});}finally{passwordWorkBusy=false;}
}
const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
const randomToken=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
const sha=async text=>hex(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(text))));
function equal(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
function emailAddress(value){const email=String(value||'').trim().toLowerCase();if(email.length>254||!/^[-a-z0-9.!#$%&'*+\/=?^_`{|}~]+@[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,63}$/.test(email))throw new ApiError(400,'请输入有效的邮箱地址');return email;}
function checkPassword(password){if(typeof password!=='string'||!PASSWORD.test(password))throw new ApiError(400,PASSWORD_MESSAGE);}
function cookie(token,maxAge=TTL/1000){return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;}
function cookieToken(request){const values=(request.headers.get('Cookie')||'').split(';').map(s=>s.trim()).filter(s=>s.startsWith(COOKIE+'='));return values.length===1?values[0].slice(COOKIE.length+1):null;}
export function mailReady(env){return Boolean(env.RESEND_API_KEY&&env.AUTH_EMAIL_FROM&&env.AUTH_CODE_SECRET);}
export async function hashPassword(password){const salt=hex(crypto.getRandomValues(new Uint8Array(16)));const hash=await passwordKey(password,salt);return `scrypt$32768$8$3$${salt}$${hex(hash)}`;}
async function verifyPassword(password,stored){const parts=(stored||'').split('$');const salt=parts.length===6?parts[4]:'meld-unknown-user-fixed-salt';const hash=hex(await passwordKey(password,salt));return equal(hash,parts[5]||'0'.repeat(64));}
async function first(env,sql,...values){return (await env.DB.prepare(sql).bind(...values).all()).results[0]||null;}
async function limit(env,key,max,windowMs){
 const now=Date.now(),keyHash=await sha(key);
 const row=await first(env,`INSERT INTO auth_rate_limits(key,count,expires_at) VALUES(?,1,?)
 ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires_at<=? THEN 1 ELSE count+1 END,expires_at=CASE WHEN expires_at<=? THEN excluded.expires_at ELSE expires_at END RETURNING count`,keyHash,now+windowMs,now,now);
 if(row.count>max)throw new ApiError(429,'操作过于频繁，请稍后再试');
}
async function codeHash(env,email,purpose,challenge,code){
 const key=await crypto.subtle.importKey('raw',encoder.encode(env.AUTH_CODE_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return hex(new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(`${email}\n${purpose}\n${challenge}\n${code}`))));
}
function platformUser(request){const id=request.headers.get('oai-authenticated-user-id'),email=request.headers.get('oai-authenticated-user-email');return id&&email?{id,email,authMethod:'chatgpt'}:null;}
export async function effectiveUser(request,env){
 const token=cookieToken(request);if(!token)return platformUser(request);
 if(/^s-[a-f0-9]{64}$/.test(token)){
  const user=await first(env,'SELECT user_id AS id,email,provider AS authMethod,subject FROM social_sessions WHERE token_hash=? AND expires_at>?',await sha(token.slice(2)),Date.now());
  if(!user)return null;
  const {subject,...identity}=user;
  const adminSubject=identity.authMethod==='google'?env.MELOHUM_ADMIN_GOOGLE_SUB:env.MELOHUM_ADMIN_WECHAT_OPENID;
  return {...identity,isAdmin:Boolean(adminSubject&&subject===adminSubject)};
 }
 if(!/^[a-f0-9]{64}$/.test(token))return null;
 const user=await first(env,'SELECT u.id,u.email FROM email_sessions s JOIN email_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?',await sha(token),Date.now());
 return user?{...user,authMethod:'email'}:null;
}
export function isSiteAdmin(user,env){
 if(!user)return false;
 if(user.authMethod==='google'||user.authMethod==='wechat')return user.isAdmin===true;
 const owner=(env.MELOHUM_ADMIN_EMAIL||'').trim().toLowerCase();
 return Boolean(owner&&user.email?.trim().toLowerCase()===owner);
}
async function newSession(env,user,expectedHash){
 const token=randomToken(),now=Date.now();
 const saved=await env.DB.batch([
  env.DB.prepare('DELETE FROM email_sessions WHERE expires_at<=?').bind(now),
  env.DB.prepare('INSERT INTO email_sessions(token_hash,user_id,expires_at,created_at) SELECT ?,id,?,? FROM email_users WHERE id=? AND password_hash=?').bind(await sha(token),now+TTL,now,user.id,expectedHash)
 ]);
 if(saved[1].meta.changes!==1)throw new ApiError(401,'账户密码已更改，请重新登录');
 const identity={id:user.id,email:user.email,authMethod:'email'};
 return json({session:{user:{...identity,isAdmin:isSiteAdmin(identity,env)}}},200,{'Set-Cookie':cookie(token)});
}
async function sendCode(request,env,data){
 if(!mailReady(env))throw new ApiError(503,'邮箱验证码服务尚未开通，暂无法注册或重置密码；你可以使用 ChatGPT 登录');
 const email=emailAddress(data.email),purpose=data.purpose;
 if(!['signup','reset'].includes(purpose))throw new ApiError(400,'验证码用途无效');
 const ip=request.headers.get('CF-Connecting-IP')||'unknown';
 await limit(env,'send-ip:'+ip,10,3600000);await limit(env,'send-email:'+email,1,60000);await limit(env,'send-global',500,86400000);
 const now=Date.now(),challenge=randomToken();
 const value=new Uint32Array(1);let number;do{crypto.getRandomValues(value);number=value[0];}while(number>=4294000000);
 const code=String(number%1000000).padStart(6,'0'),hash=await codeHash(env,email,purpose,challenge,code);
 await env.DB.prepare(`INSERT INTO email_challenges(email,purpose,challenge_id,code_hash,expires_at,attempts,consumed,sent_at) VALUES(?,?,?,?,?,0,0,?)
 ON CONFLICT(email,purpose) DO UPDATE SET challenge_id=excluded.challenge_id,code_hash=excluded.code_hash,expires_at=excluded.expires_at,attempts=0,consumed=0,sent_at=excluded.sent_at`).bind(email,purpose,challenge,hash,now+OTP_TTL,now).run();
 // Use a generic reset response for registered and unregistered addresses.
 const user=await first(env,'SELECT id FROM email_users WHERE email=?',email);
 const subject=purpose==='signup'?'Melohum 注册验证码':'Melohum 找回密码验证码';
 const text=`${subject}：${code}\n\n验证码 10 分钟内有效，仅能使用一次。请勿向他人透露。${purpose==='signup'?'注册时请设置 Melohum 网站专用密码，不要填写邮箱本身的密码。':'验证码确认后可为 Melohum 设置新密码；邮箱本身的密码不会改变。'}\n\n如非本人操作，请忽略此邮件。`;
 try{
  if(purpose==='signup'||user){
   const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`meld-${purpose}-${challenge}`},body:JSON.stringify({from:env.AUTH_EMAIL_FROM,to:[email],subject,text}),signal:AbortSignal.timeout(10000)});
   if(!response.ok)throw new Error('provider-rejected');
  }
 }catch{
  await env.DB.prepare('DELETE FROM email_challenges WHERE email=? AND purpose=? AND challenge_id=?').bind(email,purpose,challenge).run();
  throw new ApiError(503,'验证码邮件暂时无法发送，请稍后重试');
 }
 return json({message:purpose==='signup'?'验证码已发送，请检查收件箱和垃圾邮件。':'如果该邮箱已注册，验证码邮件将发送到你的邮箱。',retryAfter:60,expiresIn:600});
}
async function verifiedChallenge(env,email,purpose,code){
 if(!env.AUTH_CODE_SECRET)throw new ApiError(503,'邮箱验证服务暂未就绪');
 if(typeof code!=='string'||!/^\d{6}$/.test(code))throw new ApiError(400,'请输入邮箱收到的 6 位验证码');
 const row=await first(env,`UPDATE email_challenges SET attempts=attempts+1 WHERE email=? AND purpose=? AND expires_at>? AND consumed=0 AND attempts<5 RETURNING challenge_id,code_hash`,email,purpose,Date.now());
 if(!row||!equal(row.code_hash,await codeHash(env,email,purpose,row.challenge_id,code)))throw new ApiError(400,'验证码不正确、已失效或尝试次数已用完，请重新获取');
 return row;
}
export async function authRoute(request,env){
 const {pathname:path,origin}=new URL(request.url),method=request.method;
 if(!path.startsWith('/api/auth/'))return null;
 const social=await socialAuthRoute(request,env,randomToken,sha,cookie);if(social)return social;
 if(method==='GET'&&path==='/api/auth/config')return json({emailEnabled:true,mailConfigured:mailReady(env),socialProviders:origin==='https://melohum.com'?enabledSocialProviders(env):[],password:{min:8,max:16,lettersAndDigits:true},codeDigits:6,codeExpiresIn:600});
 if(method==='GET'&&path==='/api/auth/session'){const user=await effectiveUser(request,env);return json({session:user?{user:{...user,isAdmin:isSiteAdmin(user,env)}}:null});}
 if(method!=='POST')throw new ApiError(405,'不支持此操作');
 if(request.headers.get('Origin')!==origin||request.headers.get('Sec-Fetch-Site')==='cross-site')throw new ApiError(403,'不允许跨站修改账户');
 const data=await bodyJSON(request,4096);
 if(path==='/api/auth/send-code')return sendCode(request,env,data);
 if(path==='/api/auth/signout'){
  const token=cookieToken(request);
  if(token&&/^[a-f0-9]{64}$/.test(token))await env.DB.prepare('DELETE FROM email_sessions WHERE token_hash=?').bind(await sha(token)).run();
  if(token&&/^s-[a-f0-9]{64}$/.test(token))await env.DB.prepare('DELETE FROM social_sessions WHERE token_hash=?').bind(await sha(token.slice(2))).run();
  return json({ok:true,platformSignedIn:Boolean(platformUser(request))},200,{'Set-Cookie':cookie('',0)});
 }
 if(!['/api/auth/signup','/api/auth/signin','/api/auth/reset-password'].includes(path))throw new ApiError(404,'账户接口不存在');
 const email=emailAddress(data.email),password=data.password;checkPassword(password);
 const ip=request.headers.get('CF-Connecting-IP')||'unknown';
 await limit(env,'auth-ip:'+ip,30,900000);await limit(env,'auth-email:'+email,10,900000);
 if(path==='/api/auth/signin'){
  const user=await first(env,'SELECT id,email,password_hash FROM email_users WHERE email=?',email);
  if(!await verifyPassword(password,user?.password_hash)||!user)throw new ApiError(401,'邮箱或 Melohum 密码不正确');
  return newSession(env,user,user.password_hash);
 }
 const purpose=path.endsWith('signup')?'signup':'reset',proof=await verifiedChallenge(env,email,purpose,data.code),now=Date.now();
 const hash=await hashPassword(password);
 if(purpose==='signup'){
  const id='email:'+crypto.randomUUID();
  const result=await env.DB.batch([
   env.DB.prepare(`INSERT INTO email_users(id,email,password_hash,created_at,password_changed_at) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM email_challenges WHERE email=? AND purpose='signup' AND challenge_id=? AND code_hash=? AND consumed=0 AND attempts<=5 AND expires_at>?) ON CONFLICT(email) DO NOTHING`).bind(id,email,hash,now,now,email,proof.challenge_id,proof.code_hash,Date.now()),
   env.DB.prepare(`UPDATE email_challenges SET consumed=1 WHERE email=? AND purpose='signup' AND challenge_id=? AND EXISTS(SELECT 1 FROM email_users WHERE id=?)`).bind(email,proof.challenge_id,id)
  ]);
  if(result[0].meta.changes!==1)throw new ApiError(409,'注册未完成：邮箱已注册或验证码失效，请登录或重新获取验证码');
  return newSession(env,{id,email},hash);
 }
 const result=await env.DB.batch([
  env.DB.prepare(`UPDATE email_users SET password_hash=?,password_changed_at=? WHERE email=? AND EXISTS(SELECT 1 FROM email_challenges WHERE email=? AND purpose='reset' AND challenge_id=? AND code_hash=? AND consumed=0 AND attempts<=5 AND expires_at>?)`).bind(hash,now,email,email,proof.challenge_id,proof.code_hash,Date.now()),
  env.DB.prepare(`UPDATE email_challenges SET consumed=1 WHERE email=? AND purpose='reset' AND challenge_id=? AND EXISTS(SELECT 1 FROM email_users WHERE email=? AND password_hash=?)`).bind(email,proof.challenge_id,email,hash),
  env.DB.prepare('DELETE FROM email_sessions WHERE user_id IN (SELECT id FROM email_users WHERE email=? AND password_hash=?)').bind(email,hash)
 ]);
 if(result[0].meta.changes!==1)throw new ApiError(400,'验证码无效或已过期，请重新获取');
 return json({ok:true,message:'密码已重置，所有设备上的邮箱登录已退出，请使用新密码登录'},200,{'Set-Cookie':cookie('',0)});
}
