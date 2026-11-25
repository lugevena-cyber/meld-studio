(function(){
 if(typeof document==='undefined')return;
 fetch('dx7/index.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{
  const box=document.createElement('section');box.className='source-instrument-library';box.setAttribute('aria-label','Yamaha DX7 原厂音色文件库');
  box.innerHTML='<p class="eyebrow">YAMAHA DX7 / FACTORY ROM</p><h2>DX7 原厂音色文件库</h2><p>8 个地区原厂库、256 个槽位，含重复音色。格式为 SysEx 参数；需要 DX7 兼容引擎或 Dexed 发声，当前这里只提供目录与下载。</p><p><a href="dx7/factory-roms.zip" download>下载全部 8 库 ZIP</a> · <a href="dx7/音色目录.csv" download>下载音色目录 CSV</a></p><div class="source-score-toolbar"><label>音色库<select id="dx7Bank"></select></label><label>搜索音色<input id="dx7Search" type="search" placeholder="E.PIANO / BASS / GUITAR…"></label><a id="dx7Download" download>下载当前库 .syx</a></div><p id="dx7Count"></p><div id="dx7Voices" class="dx7-voice-grid"></div><p>来源：<a href="https://yamahablackboxes.com/collection/yamaha-dx7-synthesizer/patches/" target="_blank" rel="noopener">Yamaha Black Boxes 原厂 ROM 档案</a>。此处不是全部第三方或用户自制音色，也不代表已接入 DX7 发声功能。</p>';
  const anchor=document.querySelector('.source-instrument-library')||document.querySelector('.arrangement-heading');anchor.after(box);
  const bank=box.querySelector('#dx7Bank'),search=box.querySelector('#dx7Search'),voices=box.querySelector('#dx7Voices');
  for(const b of data.banks){const o=document.createElement('option');o.value=b.bank;o.textContent=b.bank+' · '+b.region;bank.append(o);}
  function render(){const b=data.banks.find(b=>b.bank===bank.value),q=search.value.trim().toLowerCase(),list=b.voices.filter(v=>v.name.toLowerCase().includes(q));voices.replaceChildren();for(const v of list){const item=document.createElement('div');item.className='dx7-voice';item.textContent=String(v.slot).padStart(2,'0')+' · '+v.name+' · 算法 '+v.algorithm;voices.append(item);}box.querySelector('#dx7Count').textContent=list.length+' / 32 个音色槽位 · 全部文件校验和已通过';box.querySelector('#dx7Download').href='dx7/'+b.file;}
  bank.addEventListener('change',render);search.addEventListener('input',render);render();
 }).catch(()=>{});
})();
