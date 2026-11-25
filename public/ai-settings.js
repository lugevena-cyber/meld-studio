(()=>{
 const form=document.getElementById('settingsForm'),access=document.getElementById('accessState'),saveState=document.getElementById('saveState'),keyInput=document.getElementById('proxyKey'),keyState=document.getElementById('keyState'),saveButton=document.getElementById('saveButton');
 const endpoint=document.getElementById('endpoint'),model=document.getElementById('model');
 function showAccess(message,error=false){access.textContent=message;access.classList.toggle('error',error);}
 async function readJson(response){let data;try{data=await response.json();}catch{throw new Error('服务器返回了无法识别的响应');}if(!response.ok)throw new Error(data.error||'请求失败，请稍后重试');return data;}
 async function initialize(){
  try{
   const response=await fetch('/api/admin/ai-config',{credentials:'same-origin',cache:'no-store'});
   if(response.status===401){showAccess('请先登录 Melohum 账户，再回到此页。');const link=document.createElement('a');link.href='/?page=arrangement';link.textContent='打开 Melohum 登录';link.className='back-link';access.append(document.createElement('br'),link);return;}
   if(response.status===403){showAccess('当前账户不是站点所有者，无法管理 AI 服务设置。',true);return;}
   const data=await readJson(response);
   if(!data.encryptionReady){showAccess('站点加密配置尚未就绪，请稍后重试。',true);return;}
   endpoint.value=data.url;model.value=data.model;keyState.textContent=data.hasKey?'（已保存；留空保持不变）':'（尚未设置）';
   keyInput.required=!data.hasKey;
   form.hidden=false;access.hidden=true;
  }catch(error){showAccess(error.message||'无法读取设置，请稍后重试。',true);}
 }
 form.addEventListener('submit',async event=>{
  event.preventDefault();saveState.textContent='';saveState.classList.remove('error');saveButton.disabled=true;
  try{
   const payload={url:endpoint.value.trim(),model:model.value.trim(),key:keyInput.value};
   const response=await fetch('/api/admin/ai-config',{method:'PUT',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
   const data=await readJson(response);keyInput.value='';keyInput.required=false;keyState.textContent='（已保存；留空保持不变）';
   saveState.textContent='配置已加密保存，可以返回编曲台测试 AI 生成。';
  }catch(error){saveState.textContent=error.message||'保存失败，请稍后重试。';saveState.classList.add('error');}
  finally{saveButton.disabled=false;}
 });
 initialize();
})();
