async function fetchArrangementSample(path, filename, timeout) {
 const attempts = 3;
 for (let attempt = 1; attempt <= attempts; attempt++) {
  const response = await fetch(path, {signal: AbortSignal.timeout(timeout)}).catch(error => {
   if (attempt === attempts) throw error;
   return null;
  });
  if (response?.ok) return response.arrayBuffer();
  if (attempt === attempts || (response && response.status < 500 && response.status !== 429)) {
   throw new Error(`采样未能读取：${filename}${response ? `（HTTP ${response.status}）` : ''}`);
  }
  await new Promise(resolve => setTimeout(resolve, attempt * 200));
 }
}

// Classic scripts can load from file://. Decode embedded bytes instead of fetching local audio files.
async function loadInstrumentSample(bankId,file,context){
 if(!/^[a-z0-9-]+$/.test(bankId)||!/^[A-Za-z0-9]+\.mp3$/.test(file))throw new Error('采样名称不正确');
 const packed=window.MELD_EMBEDDED_SAMPLES?.[bankId]?.[file];let bytes;
 if(typeof packed==='string'){
  const binary=atob(packed),data=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)data[i]=binary.charCodeAt(i);bytes=data.buffer;
 }else{
  if(typeof location!=='undefined'&&location.protocol==='file:')throw new Error('内置采样脚本缺失，请完整解压项目，保留 samples 文件夹');
  bytes=await fetchArrangementSample('samples/'+bankId+'/'+file,file,8000);
 }
 const buffer=await context.decodeAudioData(bytes);if(!buffer?.duration)throw new Error(file+' 无法解码');return buffer;
}
function setupStandaloneAudioMode(){
 const notice=document.getElementById('standaloneModeNote');if(!notice)return;
 notice.hidden=!(typeof location!=='undefined'&&location.protocol==='file:');
}
