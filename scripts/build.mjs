import {build} from 'esbuild';
import {createHash} from 'node:crypto';
import {cpSync,mkdirSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
rmSync('dist',{recursive:true,force:true});
mkdirSync('dist/server',{recursive:true});mkdirSync('dist/.openai',{recursive:true});
cpSync('public','dist/client',{recursive:true});
// The workspace uses ordered classic scripts that share globals. Serve them
// together so an individual failed request cannot leave the workspace half initialized.
const workspacePage = readFileSync('public/index.html', 'utf8');
const workspaceScripts = /<script src="([^"?]+)(?:\?[^"]*)?"><\/script>/g;
const workspaceCode = [...workspacePage.matchAll(workspaceScripts)]
  .map(([, path]) => readFileSync(`public/${path}`, 'utf8'))
  .join('\n;\n');
const workspaceHash = createHash('sha256').update(workspaceCode).digest('hex').slice(0, 12);
const workspaceAsset = `workspace.${workspaceHash}.js`;
writeFileSync(`dist/client/${workspaceAsset}`, workspaceCode);
let workspaceScriptAdded = false;
writeFileSync('dist/client/index.html', workspacePage.replace(workspaceScripts, () => {
  if (workspaceScriptAdded) return '';
  workspaceScriptAdded = true;
  return `<script src="${workspaceAsset}"></script>`;
}));
await build({entryPoints:['worker/index.js'],outfile:'dist/server/index.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:false});
await build({entryPoints:['client/transcription-midi.js'],outfile:'dist/client/transcription-midi.js',bundle:true,format:'esm',platform:'browser',target:'es2022'});
await build({entryPoints:['client/stem-worker.js'],outfile:'dist/client/stem-worker.js',bundle:true,format:'esm',platform:'browser',target:'es2022',external:['node:*']});
await build({entryPoints:['client/local-transcription-worker.js'],outfile:'dist/client/local-transcription-worker.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true});
cpSync('node_modules/@spotify/basic-pitch/model','dist/client/basic-pitch',{recursive:true});
cpSync('node_modules/@spotify/basic-pitch/LICENSE','dist/client/basic-pitch/LICENSE');
cpSync('assets/stem-models','dist/client/stem-models',{recursive:true});
mkdirSync('dist/client/stem-runtime',{recursive:true});
for(const name of ['ort-wasm-simd-threaded.mjs','ort-wasm-simd-threaded.wasm']){
 cpSync('node_modules/onnxruntime-web/dist/'+name,'dist/client/stem-runtime/'+name);
}
cpSync('node_modules/@audio/neural-separate/NOTICE','dist/client/stem-runtime/NOTICE.txt');
cpSync('.openai/hosting.json','dist/.openai/hosting.json');
writeFileSync('dist/server/wrangler.json',JSON.stringify({name:'meld-studio',main:'index.js',compatibility_date:'2026-11-01',assets:{directory:'../client',binding:'ASSETS',run_worker_first:['/api/*']},d1_databases:[{binding:'DB',database_name:'meld',database_id:'00000000-0000-4000-8000-000000000000',migrations_dir:'../../drizzle'}],r2_buckets:[{binding:'BUCKET',bucket_name:'meld-audio'}]},null,2));
console.log('Built MELD Worker + existing music workspace assets');
