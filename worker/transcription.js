import {ApiError,json,limitedBody} from './http.js';
export const transcriptionConfigured=env=>Boolean(env.MUSCRIPTOR_URL&&env.MUSCRIPTOR_TOKEN);
export async function transcribe(request,env,user){
 if(!transcriptionConfigured(env))throw new ApiError(503,'MuScriptor 转写服务尚未连接');
 let base;try{base=new URL(env.MUSCRIPTOR_URL);if(base.protocol!=='https:'||base.username||base.password||base.search||base.hash)throw 0;}catch{throw new ApiError(503,'转写服务配置无效');}
 const type=request.headers.get('Content-Type')||'';
 if(!type.startsWith('multipart/form-data;'))throw new ApiError(415,'请上传音频文件');
 const bytes=await limitedBody(request,25*1024*1024+8192);
 const form=await new Request('https://upload.invalid',{method:'POST',headers:{'Content-Type':type},body:bytes}).formData();
 const file=form.get('file');if(!file||typeof file==='string'||file.size===0||file.size>25*1024*1024)throw new ApiError(400,'音频应为非空文件，且不超过 25 MiB');
 const now=Date.now(),result=await env.DB.prepare(`INSERT INTO auth_rate_limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires_at<=? THEN 1 ELSE count+1 END,expires_at=CASE WHEN expires_at<=? THEN excluded.expires_at ELSE expires_at END RETURNING count`).bind('transcribe:'+user.id,now+3600000,now,now).all();
 if(result.results[0].count>5)throw new ApiError(429,'每账户每小时最多转写 5 次');
 const body=new FormData();body.append('file',file,'audio');body.append('detect_tempo','best-effort');
 let response;try{response=await fetch(base.href.replace(/\/$/,'')+'/transcribe',{method:'POST',headers:{Authorization:'Bearer '+env.MUSCRIPTOR_TOKEN,'X-Client-Id':user.id},body,signal:request.signal});}catch{throw new ApiError(502,'转写服务连接失败，请稍后重试');}
 if(!response.ok)throw new ApiError(response.status===409?409:502,response.status===409?'转写服务正在忙，请稍后重试':'转写未成功，请检查音频或稍后重试');
 if(!response.headers.get('Content-Type')?.includes('text/event-stream'))throw new ApiError(502,'转写服务返回格式不正确');
 return new Response(response.body,{headers:{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
