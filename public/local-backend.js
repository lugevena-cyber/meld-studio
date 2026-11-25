(function(){
 const config=window.MELD_BACKEND_CONFIG||{},base=String(config.apiBase||'').replace(/\/+$/,''),enabled=config.enabled===true;
 let current=null,epoch=0;const revisions=new Map(),queues=new Map();
 async function request(route,options={}){let response;try{response=await fetch(base+route,{credentials:'include',signal:AbortSignal.timeout(30000),...options,headers:{...(options.body instanceof Blob?{}:{'Content-Type':'application/json'}),...(options.headers||{})}});}catch{throw new Error('云端连接失败，请检查网络后重试；当前编辑仍在此设备保留');}if(options.binary){if(response.status===404)return null;if(!response.ok)throw new Error('原声读取失败');return response.blob();}const data=await response.json();if(!response.ok){const e=new Error(data.error||'本机数据操作未完成');e.status=response.status;e.items=data.items;throw e;}return data;}
 function changeSession(session){epoch++;current=session;revisions.clear();queues.clear();return session;}
 function enqueue(kind,job){const captured=epoch,owner=current?.user.id;const previous=queues.get(kind)||Promise.resolve(),next=previous.catch(()=>{}).then(async()=>{if(captured!==epoch||!owner||owner!==current?.user.id)throw new Error('账户已切换，未发送上一账户的保存');const result=await job();if(captured!==epoch)throw new Error('账户已切换');return result;});queues.set(kind,next);return next;}
 async function fetchDocuments(kind){const captured=epoch,data=await request('/api/data/'+kind);if(captured!==epoch)throw new Error('账户已切换');for(const key of revisions.keys())if(key.startsWith(kind+':'))revisions.delete(key);for(const item of data.items)revisions.set(kind+':'+item.id,item.revision);return data.items.map(item=>item.payload);}
 function saveDocuments(kind,items){const copy=JSON.parse(JSON.stringify(items));return enqueue(kind,async()=>{let data;try{data=await request('/api/data/'+kind,{method:'PUT',body:JSON.stringify({items:copy.map(payload=>({payload,expectedRevision:revisions.get(kind+':'+payload.id)??null}))})});}catch(error){for(const row of error.items||[])revisions.set(kind+':'+row.id,row.revision);throw error;}for(const row of data.items)revisions.set(kind+':'+row.id,row.revision);return data.items;});}
 function removeDocument(kind,id){return enqueue(kind,async()=>{const data=await request('/api/data/'+kind+'/'+encodeURIComponent(id),{method:'DELETE',body:JSON.stringify({expectedRevision:revisions.get(kind+':'+id)??null})});revisions.set(kind+':'+id,data.revision);return data;});}
 window.MeldLocalCloud={provider:config.provider||'local',configured:()=>enabled,
  async signIn(email,password){const data=await request('/api/auth/signin',{method:'POST',body:JSON.stringify({email,password})});return changeSession(data.session);},
  async signUp(email,password,code){const data=await request('/api/auth/signup',{method:'POST',body:JSON.stringify({email,password,code})});changeSession(data.session);return data;},
  async restoreSession(){const data=await request('/api/auth/session');return changeSession(data.session);},
  authConfig:()=>request('/api/auth/config'),
  sendCode:(email,purpose)=>request('/api/auth/send-code',{method:'POST',body:JSON.stringify({email,purpose})}),
  resetPassword:(email,password,code)=>request('/api/auth/reset-password',{method:'POST',body:JSON.stringify({email,password,code})}),
  async signOut(){const data=await request('/api/auth/signout',{method:'POST',body:'{}'});changeSession(null);if(config.provider==='sites'&&data.platformSignedIn)window.location.assign('/signout-with-chatgpt?return_to=%2F');},
  fetchProjects:()=>fetchDocuments('projects'),upsertProjects:items=>saveDocuments('projects',items),deleteProject:id=>removeDocument('projects',id),
  fetchPatches:()=>fetchDocuments('patches'),upsertPatches:items=>saveDocuments('patches',items),deletePatch:id=>removeDocument('patches',id),
  fetchDocuments,saveDocuments,removeDocument,
  async putAudioAsset(id,blob){return enqueue('audio',()=>request('/api/data/audio/'+encodeURIComponent(id),{method:'PUT',headers:{'Content-Type':blob.type||'application/octet-stream'},body:blob}));},
  fetchAudioAsset:id=>request('/api/data/audio/'+encodeURIComponent(id),{binary:true}),
  status:()=>request('/api/data/status'),account:()=>request('/api/data/account'),
  async flush(){const settled=await Promise.allSettled([...queues.values()]);const failed=settled.find(item=>item.status==='rejected');if(failed)throw failed.reason;},
 };
})();
