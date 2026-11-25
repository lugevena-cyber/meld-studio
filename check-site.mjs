import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';
const root=path.resolve('public'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){const ref=match[1].split('?')[0];if(/^(https?:|data:)/.test(ref)||ref==='/signin-with-chatgpt')continue;if(!fs.existsSync(path.join(root,ref)))throw Error('Missing entry asset '+ref);}
for(const name of fs.readdirSync(root).filter(f=>f.endsWith('.js'))){const r=spawnSync(process.execPath,['--check',path.join(root,name)],{encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);}
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(root,'stem-session.js'),'utf8'),ctx);const manifest=JSON.parse(fs.readFileSync(path.join(root,'studies/hong-kong/stems/manifest.json'),'utf8'));ctx.MeldStemSession.validateManifest(manifest);
for(const s of manifest.stems){const b=fs.readFileSync(path.join(root,s.file));if(b.length!==s.size||crypto.createHash('sha256').update(b).digest('hex')!==s.sha256)throw Error('Stem checksum failed '+s.id);if(b.length>25*1024*1024)throw Error('Asset too large');}
if(fs.existsSync(path.join(root,'server'))||fs.existsSync(path.join(root,'.env')))throw Error('Private runtime files included');
const src=fs.readFileSync(path.join(root,'source-instruments.js'),'utf8');if(src.includes("!['localhost','127.0.0.1'].includes(location.hostname)"))throw Error('Library still localhost only');
console.log('PASS: entry assets, JavaScript syntax, six stem checksums, hosted instrument library, private data exclusions');
