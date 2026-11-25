(() => {
 const button=document.getElementById('adminOpenBtn');
 const dialog=document.getElementById('adminOverviewDialog');
 const status=document.getElementById('adminOverviewStatus');
 const metrics=document.getElementById('adminOverviewMetrics');
 button.addEventListener('click',async()=>{
  metrics.replaceChildren();
  status.textContent='正在读取站点状态…';
  dialog.showModal();
  try{
   const response=await fetch('/api/admin/overview',{cache:'no-store'});
   if(!response.ok)throw new Error(response.status===401||response.status===403?'当前账户没有管理权限':'暂时无法读取站点状态');
   const data=await response.json();
   const counts=Object.fromEntries(data.documents.map(row=>[row.kind,row.count]));
   const rows=[
    ['邮箱注册账户',data.emailAccounts],['已保存作品',counts.projects??0],
    ['已保存音色',counts.patches??0],['已保存素材',counts.materials??0],
    ['AI 服务',data.services.ai?'已配置':'待配置'],
    ['音频转录',data.services.transcription?'已配置':'待配置'],
    ['Google 登录',data.services.social.includes('google')?'已配置':'待配置'],
    ['微信登录',data.services.social.includes('wechat')?'已配置':'待配置'],
   ];
   status.textContent='';
   for(const [key,value] of rows){
    const label=document.createElement('dt'),item=document.createElement('dd');
    label.textContent=key;item.textContent=String(value);metrics.append(label,item);
   }
  }catch(error){status.textContent=error.message;}
 });
 const url=new URL(location.href);
 if(url.searchParams.get('login')==='failed'){
  url.searchParams.delete('login');
  history.replaceState(history.state,'',url);
  window.addEventListener('load',()=>showToast('授权登录未完成，请重新登录'),{once:true});
 }
})();
