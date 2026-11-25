import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const readAsset = name => readFile(new URL('../public/' + name, import.meta.url));

test('DX7 retries a failed network module through an authenticated fetch and plays the same bank', async () => {
 const [loader,script,rom] = await Promise.all([
  readAsset('dx7-engine.js'), readAsset('dx7/meld-dx7-worklet.js'), readAsset('dx7/ROM1A.syx')
 ]);
 const base = 'https://melohum.example/?page=arrangement';
 const directUrl = 'https://melohum.example/dx7/meld-dx7-worklet.js?v=2';
 const loadAttempts = [];
 let reads = 0;
 let processorClass;
 const global = vm.createContext({
  URL, Blob, AbortSignal, document:{baseURI:base},
  fetch: async (url, options) => {
   if (url === 'dx7/ROM1A.syx') return new Response(rom);
   assert.equal(url,directUrl);
   assert.equal(options.credentials,'same-origin');
   reads++;
   return new Response(script);
  }
 });
 const dsp = vm.createContext({
  sampleRate:44100,currentFrame:0,
  AudioWorkletProcessor:class { constructor(){this.port={postMessage(){}};} },
  registerProcessor:(name,klass)=>{assert.equal(name,'meld-dx7');processorClass=klass;}
 });
 const context = {audioWorklet:{addModule: async (url,options) => {
  loadAttempts.push(url);
  if (url === directUrl) {
   assert.equal(options.credentials,'same-origin');
   throw new Error('Network error');
  }
  const resource = await fetch(url);
  vm.runInContext(await resource.text(),dsp);
 }}};
 vm.runInContext(loader.toString('utf8'),global);
 await Promise.all([global.MeldDx7.prepare('dx7-ROM1A-24',context),global.MeldDx7.prepare('dx7-ROM1A-11',context)]);
 assert.ok(global.MeldDx7.ready('dx7-ROM1A-24',context));
 assert.equal(loadAttempts.length,2);
 assert.equal(reads,1);
 await assert.rejects(fetch(loadAttempts[1]));
 const processor = new processorClass();
 processor.message({type:'start',id:1,bank:rom,slot:23,midi:76,velocity:90,start:0,off:8192,end:16384});
 const out = new Float32Array(64);
 let peak = 0;
 for (let frame=0;frame<8192;frame+=64) {
  dsp.currentFrame=frame;
  processor.process([],[[out]]);
  peak=Math.max(peak,...out.map(Math.abs));
 }
 assert.ok(peak>.001);
});
