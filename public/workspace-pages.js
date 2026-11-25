(function(root){
 'use strict';
 if(typeof document==='undefined')return;
 const pages={studio:'创作台',works:'我的作品',lab:'音色实验室',arrangement:'编曲台',sounds:'开放采样库'};
 let restoring=false,started=false;
 function route(search){const q=new URLSearchParams(search);const page=q.get('page');return page==='dx7'?'sounds':Object.hasOwn(pages,page)?page:'arrangement';}
 function sync(view){
  if(!Object.hasOwn(pages,view))return;
  document.title=pages[view]+' — Melohum';
  document.querySelectorAll('[data-page]').forEach(link=>{if(link.dataset.page===view)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
  if(restoring)return;
  const url=new URL(location.href);for(const name of ['stems','study','library','preview'])url.searchParams.delete(name);url.searchParams.set('page',view);
  try{if(!started){history.replaceState(null,'',url);started=true;}else if(url.href!==location.href)history.pushState(null,'',url);}catch{/* File-mode browsers may restrict history changes. */}
 }
 root.MeldWorkspacePages={route,onViewChange:sync};
 document.addEventListener('click',event=>{const link=event.target.closest?.('a[data-page]');if(!link||event.defaultPrevented||event.button>0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();switchView(link.dataset.page);});
 root.addEventListener('popstate',()=>{restoring=true;try{switchView(route(location.search));}finally{restoring=false;}});
 const initial=new URLSearchParams(location.search);
 switchView(route(location.search));
 if(initial.get('page')==='dx7') document.getElementById('dx7LibraryHost').closest('details').open=true;
 if(initial.get('page')==='hongkong'||initial.get('study')==='hong-kong') document.getElementById('arrangementDemoDrawer').open=true;
})(globalThis);
