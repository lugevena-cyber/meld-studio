/* DX7 SysEx playback through the bundled webDX7/MSFA WebAssembly engine. */
(function(root){
 'use strict';
 const contexts=new WeakMap(),banks=new Map();let serial=0;
 function parseId(id){const match=/^dx7-(ROM[1-4][AB])-(\d{2})$/.exec(id||'');return match&&Number(match[2])>=1&&Number(match[2])<=32?{bank:match[1],slot:Number(match[2])-1}:null;}
 function validateBank(bytes){if(bytes.length!==4104||bytes[0]!==240||bytes[1]!==67||bytes[3]!==9||bytes[4]!==32||bytes[5]!==0||bytes[4103]!==247)throw Error('DX7 音色库格式不正确');let sum=bytes[4102];for(let i=6;i<4102;i++){if(bytes[i]>127)throw Error('DX7 音色数据无效');sum+=bytes[i];}if(sum%128)throw Error('DX7 音色库校验失败');return bytes;}
 async function loadBank(name){if(!banks.has(name))banks.set(name,(async()=>{const r=await fetch('dx7/'+name+'.syx');if(!r.ok)throw Error('DX7 原厂音色库未能载入');return validateBank(new Uint8Array(await r.arrayBuffer()));})().catch(e=>{banks.delete(name);throw e;}));return banks.get(name);}
 async function loadWorklet(context){
  if(!context.audioWorklet)throw Error('当前浏览器无法运行 DX7 音源，请通过 HTTPS 在支持 AudioWorklet 的浏览器中打开。');
  const url=new URL('dx7/meld-dx7-worklet.js?v=2',document.baseURI);
  try{
   await context.audioWorklet.addModule(url.href,{credentials:'same-origin'});
   return;
  }catch{
   // In-app browsers can use a separate network path for the worklet's module request.
  }
  let source;
  try{
   const response=await fetch(url.href,{credentials:'same-origin',signal:AbortSignal.timeout(12000)});
   if(!response.ok)throw Error();
   source=await response.text();
   if(!source.includes("registerProcessor('meld-dx7',MeldDx7Processor)"))throw Error();
  }catch{
   throw Error('DX7 音源文件未能下载，请刷新页面或检查网络后重试。');
  }
  const localUrl=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
  try{
   await context.audioWorklet.addModule(localUrl);
  }catch{
   throw Error('DX7 音源未能在当前浏览器启动，可在系统浏览器中打开 Melohum 再试。');
  }finally{
   URL.revokeObjectURL(localUrl);
  }
 }
 async function prepare(id,context){
  const spec=parseId(id);
  if(!spec)return;
  let state=contexts.get(context);
  if(!state){state={pool:[],ready:false,promise:null};contexts.set(context,state);}
  if(!state.promise&&!state.ready){
   state.promise=loadWorklet(context).then(()=>{state.ready=true;}).catch(error=>{state.promise=null;throw error;});
  }
  await Promise.all([state.promise,loadBank(spec.bank)]);
 }
 function ready(id,context){const spec=parseId(id);return !!(spec&&contexts.get(context)?.ready&&banks.has(spec.bank)&&bankData.has(spec.bank));}
 const bankData=new Map();
 async function prepareVoice(id,context){await prepare(id,context);const spec=parseId(id);if(spec)bankData.set(spec.bank,await loadBank(spec.bank));}
 function schedule(id,midi,when,duration,params,destination,volume=1){
  const context=getAudioContext(),spec=parseId(id),state=contexts.get(context);if(!ready(id,context))throw Error('DX7 发声引擎尚未准备好');
  let slot=state.pool.find(s=>!s.lease&&!s.failed);if(!slot&&state.pool.length<48){const node=new AudioWorkletNode(context,'meld-dx7',{numberOfInputs:0,numberOfOutputs:1,outputChannelCount:[1]});slot={node,lease:null};node.port.onmessage=e=>{if(e.data.type==='ended'&&slot.lease?.id===e.data.id)slot.lease.dispose();};node.onprocessorerror=()=>{slot.failed=true;slot.lease?.dispose();showToast('DX7 发声引擎出错，请刷新后重试');};state.pool.push(slot);}if(!slot){slot=state.pool.filter(s=>!s.failed).sort((a,b)=>a.lease.created-b.lease.created)[0];if(!slot)throw Error('DX7 引擎不可用，请刷新重试');slot.lease.dispose();}
  const token=++serial,start=Math.max(context.currentTime+.003,when),hold=Math.max(.025,duration),tail=Math.max(.25,Math.min(10,(Number(params.release)||2500)/1000)),end=start+hold+tail;
  const filter=context.createBiquadFilter(),gain=context.createGain(),nodes=[filter,gain];filter.type='lowpass';filter.frequency.value=Math.min(context.sampleRate*.45,Math.max(150,(Number(params.brightness)||9000)*2));filter.Q.value=.5;
  slot.node.connect(filter);let last=filter;
  if(params.drive>0){const shape=context.createWaveShaper();shape.curve=createDriveCurve(1+params.drive/8);shape.oversample='2x';last.connect(shape);last=shape;nodes.push(shape);}last.connect(gain);
  const peak=Math.max(0,Math.min(1,volume))*.65,attack=Math.min(hold,Math.max(.002,(Number(params.attack)||5)/1000)),sustain=peak*Math.max(0,Math.min(1,(Number.isFinite(params.sustain)?params.sustain:100)/100));gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(peak,start+attack);gain.gain.linearRampToValueAtTime(sustain,start+Math.min(hold,attack+Math.max(.01,(Number(params.decay)||150)/1000)));gain.gain.setValueAtTime(sustain,start+hold);gain.gain.linearRampToValueAtTime(0,end);gain.connect(destination);
  if(params.space>0){const delay=context.createDelay(1),feedback=context.createGain(),wet=context.createGain();delay.delayTime.value=.21;feedback.gain.value=Math.min(.35,params.space/240);wet.gain.value=Math.min(.4,params.space/180);gain.connect(delay);delay.connect(feedback);feedback.connect(delay);delay.connect(wet);wet.connect(destination);nodes.push(delay,feedback,wet);}
  let disposed=false;
  const lease={id:token,created:serial,meldEnded:false,dispose(){if(disposed)return;disposed=true;lease.meldEnded=true;slot.node.port.postMessage({type:'stop',id:token});try{slot.node.disconnect();}catch{}for(const node of nodes)try{node.disconnect();}catch{}if(slot.lease===lease)slot.lease=null;},stop(at=context.currentTime){if(disposed)return;const time=Math.max(context.currentTime,at);gain.gain.cancelScheduledValues(time);gain.gain.setTargetAtTime(0,time,.004);slot.node.port.postMessage({type:'release',id:token,at:Math.round(time*context.sampleRate),end:Math.round((time+.02)*context.sampleRate)});},disconnect(){lease.dispose();}};
  slot.lease=lease;slot.node.port.postMessage({type:'start',id:token,bank:bankData.get(spec.bank),slot:spec.slot,midi:Math.max(0,Math.min(127,Math.round(midi))),velocity:Math.max(1,Math.min(127,Math.round(Math.pow(Math.max(0,Math.min(1,volume)),.6)*110))),start:Math.round(start*context.sampleRate),off:Math.round((start+hold)*context.sampleRate),end:Math.round(end*context.sampleRate)});
  const sources=[lease];sources.release=(at=context.currentTime)=>{if(disposed)return;const time=Math.max(start,at);if(gain.gain.cancelAndHoldAtTime)gain.gain.cancelAndHoldAtTime(time);else gain.gain.cancelScheduledValues(time);gain.gain.linearRampToValueAtTime(0,time+tail);slot.node.port.postMessage({type:'release',id:token,at:Math.round(time*context.sampleRate),end:Math.round((time+tail)*context.sampleRate)});};return sources;
 }
 root.MeldDx7={has:id=>!!parseId(id),parseId,validateBank,ready,prepare:prepareVoice,schedule};
})(typeof window!=='undefined'?window:globalThis);
