import {ApiError} from './http.js';

const origin='https://melohum.com';
const pages=new Set(['studio','works','lab','arrangement','sounds']);
const statePattern=/^[a-f0-9]{64}$/;

function providerConfig(env,provider){
 const values=provider==='google'
  ? [env.GOOGLE_OAUTH_CLIENT_ID,env.GOOGLE_OAUTH_CLIENT_SECRET]
  : [env.WECHAT_OAUTH_APP_ID,env.WECHAT_OAUTH_APP_SECRET];
 return values.every(value=>typeof value==='string'&&value.trim())?values:null;
}
export function enabledSocialProviders(env){
 return ['google','wechat'].filter(provider=>providerConfig(env,provider));
}

function stateCookie(provider,value,maxAge){
 return `__Host-meld-oauth-${provider}=${value}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}
function redirect(location,...cookies){
 const headers=new Headers({Location:location,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'});
 for(const cookie of cookies)headers.append('Set-Cookie',cookie);
 return new Response(null,{status:303,headers});
}
async function fetchJson(url,options={}){
 const response=await fetch(url,{...options,redirect:'error',signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw new Error('provider error');
 return response.json();
}

export async function socialAuthRoute(request,env,randomToken,sha,sessionCookie){
 const url=new URL(request.url);
 const match=url.pathname.match(/^\/api\/auth\/(google|wechat)\/(start|callback)$/);
 if(!match)return null;
 if(request.method!=='GET')throw new ApiError(405,'不支持此操作');
 const [,provider,action]=match;
 const config=providerConfig(env,provider);
 if(!config)throw new ApiError(503,'此登录方式尚未配置');
 if(url.origin!==origin)throw new ApiError(400,'请在 melohum.com 使用此登录方式');
 const [clientId,secret]=config;
 const callback=`${origin}/api/auth/${provider}/callback`;
 if(action==='start'){
  if(request.headers.get('Sec-Fetch-Site')==='cross-site')throw new ApiError(403,'请从 Melohum 页面发起登录');
  const state=randomToken(),verifier=randomToken();
  const requested=url.searchParams.get('page');
  const page=pages.has(requested)?requested:'arrangement';
  const target=new URL(provider==='google'?'https://accounts.google.com/o/oauth2/v2/auth':'https://open.weixin.qq.com/connect/qrconnect');
  target.search=new URLSearchParams({
   [provider==='google'?'client_id':'appid']:clientId,redirect_uri:callback,
   response_type:'code',scope:provider==='google'?'openid email':'snsapi_login',state
  }).toString();
  if(provider==='google'){
   const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier));
   target.searchParams.set('code_challenge',btoa(String.fromCharCode(...new Uint8Array(hash))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''));
   target.searchParams.set('code_challenge_method','S256');
  }else target.hash='wechat_redirect';
  return redirect(target.href,stateCookie(provider,`${state}.${verifier}.${page}`,600));
 }
 const cookieName=`__Host-meld-oauth-${provider}=`;
 const values=(request.headers.get('Cookie')||'').split(';').map(value=>value.trim()).filter(value=>value.startsWith(cookieName));
 const [state,verifier,page]=(values.length===1?values[0].slice(cookieName.length):'').split('.');
 const home=new URL('/',origin);
 home.searchParams.set('page',pages.has(page)?page:'arrangement');
 const clear=stateCookie(provider,'',0);
 const code=url.searchParams.get('code');
 try{
  if(!statePattern.test(state)||!statePattern.test(verifier)||url.searchParams.get('state')!==state||!code||code.length>2048)throw new Error('invalid state');
  let subject,email='';
  if(provider==='google'){
   const token=await fetchJson('https://oauth2.googleapis.com/token',{
    method:'POST',body:new URLSearchParams({code,client_id:clientId,client_secret:secret,redirect_uri:callback,code_verifier:verifier,grant_type:'authorization_code'})
   });
   if(typeof token.access_token!=='string'||!token.access_token)throw new Error('no token');
   const profile=await fetchJson('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:`Bearer ${token.access_token}`}});
   subject=profile.sub;
   if(profile.email_verified===true&&typeof profile.email==='string'&&profile.email.length<=254)email=profile.email.trim().toLowerCase();
  }else{
   const endpoint=new URL('https://api.weixin.qq.com/sns/oauth2/access_token');
   endpoint.search=new URLSearchParams({appid:clientId,secret,code,grant_type:'authorization_code'}).toString();
   const profile=await fetchJson(endpoint.href);
   if(profile.errcode||typeof profile.access_token!=='string'||!profile.access_token)throw new Error('no token');
   subject=profile.openid;
  }
  if(typeof subject!=='string'||!subject||subject.length>160)throw new Error('invalid identity');
  const id=`${provider}:${await sha(subject)}`,token=randomToken(),now=Date.now();
  await env.DB.batch([
   env.DB.prepare('DELETE FROM social_sessions WHERE expires_at<=?').bind(now),
   env.DB.prepare('INSERT INTO social_sessions(token_hash,user_id,provider,subject,email,expires_at) VALUES (?,?,?,?,?,?)').bind(await sha(token),id,provider,subject,email,now+7*86400000)
  ]);
  return redirect(home.href,clear,sessionCookie('s-'+token));
 }catch{
  home.searchParams.set('login','failed');
  return redirect(home.href,clear);
 }
}
