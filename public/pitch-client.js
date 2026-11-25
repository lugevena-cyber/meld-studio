(function(root){
 let worker=null,serial=0,failed=false;const pending=new Map();
 const legacy=()=>root.MELD_PITCH_CONFIG?.legacy===true;
 function dispose(error){worker?.terminate();worker=null;failed=true;for(const item of pending.values()){clearTimeout(item.timer);item.reject(error);}pending.clear();}
 function request(type,payload={}){
  if(legacy()||failed||typeof Worker==='undefined')return Promise.reject(new Error('Pitch worker unavailable'));
  if(!worker){try{worker=new Worker('pitch-worker.js?v=vocal-body1');worker.onmessage=({data})=>{const item=pending.get(data.id);if(!item)return;pending.delete(data.id);clearTimeout(item.timer);data.error?item.reject(new Error(data.error)):item.resolve(data.result);};worker.onerror=()=>dispose(new Error('Pitch worker failed'));}catch(error){failed=true;return Promise.reject(error);}}
  const id=++serial;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>dispose(new Error('Pitch analysis timed out')),type==='analyze'?60000:5000);pending.set(id,{resolve,reject,timer});worker.postMessage({id,type,...payload},payload.input?[payload.input.buffer]:[]);});
 }
 root.MeldPitchClient={legacy,detect:(input,rate)=>request('detect',{input,rate}),analyze:(input,rate,profile)=>request('analyze',{input,rate,profile}),reset:()=>request('reset').catch(()=>{}),dispose:()=>dispose(new Error('Stopped'))};
})(globalThis);
