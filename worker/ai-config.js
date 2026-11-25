import {ApiError} from './http.js';

const encoder=new TextEncoder();
const table='ai_service_config';
function b64(bytes){let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary);}
function fromB64(value){const binary=atob(value);return Uint8Array.from(binary,char=>char.charCodeAt(0));}
async function encryptionKey(env){
 if(typeof env.AI_CONFIG_ENCRYPTION_KEY!=='string'||env.AI_CONFIG_ENCRYPTION_KEY.length<32)throw new ApiError(503,'AI 配置加密服务尚未就绪');
 const material=await crypto.subtle.importKey('raw',encoder.encode(env.AI_CONFIG_ENCRYPTION_KEY),'HKDF',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'HKDF',hash:'SHA-256',salt:encoder.encode('melohum-ai-config-v1'),info:encoder.encode('provider-secret')},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
async function storedRow(env){return env.DB.prepare(`SELECT ciphertext,iv,updated_at FROM ${table} WHERE config_id=?`).bind('default').first();}
async function decryptRow(env,row){
 try{
  const plaintext=await crypto.subtle.decrypt({name:'AES-GCM',iv:fromB64(row.iv)},await encryptionKey(env),fromB64(row.ciphertext));
  const value=JSON.parse(new TextDecoder().decode(plaintext));
  if(typeof value.url!=='string'||typeof value.model!=='string'||typeof value.key!=='string')throw new Error('invalid');
  return {...value,updatedAt:row.updated_at};
 }catch{throw new ApiError(503,'AI 配置无法解密，请检查站点加密密钥');}
}
export async function loadAiConfig(env){
 if(env.DB&&env.AI_CONFIG_ENCRYPTION_KEY){
  const row=await storedRow(env);
  if(row)return decryptRow(env,row);
 }
 if(env.MUSIC_AI_URL&&env.MUSIC_AI_MODEL&&env.MUSIC_AI_KEY)return {url:env.MUSIC_AI_URL,model:env.MUSIC_AI_MODEL,key:env.MUSIC_AI_KEY,updatedAt:null};
 return null;
}
export async function aiConfigured(env){
 if(env.DB&&env.AI_CONFIG_ENCRYPTION_KEY&&await storedRow(env))return true;
 return Boolean(env.MUSIC_AI_URL&&env.MUSIC_AI_MODEL&&env.MUSIC_AI_KEY);
}
export async function aiConfigSummary(env){
 if(env.DB&&env.AI_CONFIG_ENCRYPTION_KEY){
  const row=await storedRow(env);
  if(row){const config=await decryptRow(env,row);return {configured:true,encryptionReady:true,url:config.url,model:config.model,hasKey:true,updatedAt:config.updatedAt};}
 }
 return {configured:Boolean(env.MUSIC_AI_URL&&env.MUSIC_AI_MODEL&&env.MUSIC_AI_KEY),encryptionReady:Boolean(env.AI_CONFIG_ENCRYPTION_KEY),url:env.MUSIC_AI_URL||'https://melohum-ai.lugevena.workers.dev/chat/completions',model:env.MUSIC_AI_MODEL||'deepseek-flash',hasKey:Boolean(env.MUSIC_AI_KEY),updatedAt:null};
}
function validateUrl(value){
 let url;try{url=new URL(value);}catch{throw new ApiError(400,'请输入有效的服务地址');}
 if(url.protocol!=='https:'||url.hostname!=='melohum-ai.lugevena.workers.dev'||url.pathname!=='/chat/completions'||url.username||url.password||url.search||url.hash)throw new ApiError(400,'目前仅支持 Melohum 的 HTTPS AI 代理地址');
 return url.href;
}
export async function saveAiConfig(env,data,user){
 if(!env.DB)throw new ApiError(503,'配置数据库尚未就绪');
 const previous=await loadAiConfig(env);
 const url=validateUrl(typeof data?.url==='string'?data.url.trim():'');
 const model=typeof data?.model==='string'?data.model.trim():'';
 if(!/^[A-Za-z0-9._-]{1,80}$/.test(model))throw new ApiError(400,'模型名称格式无效');
 const key=typeof data?.key==='string'&&data.key.trim()?data.key.trim():previous?.key;
 if(typeof key!=='string'||key.length<24||key.length>512)throw new ApiError(400,'首次配置请填写有效的代理密钥');
 if(/[\r\n\0]/.test(key))throw new ApiError(400,'代理密钥格式无效');
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv},await encryptionKey(env),encoder.encode(JSON.stringify({url,model,key})));
 const now=Date.now();
 await env.DB.prepare(`INSERT INTO ${table}(config_id,ciphertext,iv,updated_at,updated_by) VALUES('default',?,?,?,?) ON CONFLICT(config_id) DO UPDATE SET ciphertext=excluded.ciphertext,iv=excluded.iv,updated_at=excluded.updated_at,updated_by=excluded.updated_by`).bind(b64(new Uint8Array(ciphertext)),b64(iv),now,user.id).run();
 return {configured:true,url,model,hasKey:true,updatedAt:now};
}
