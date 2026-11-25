import {test} from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';import worker from '../worker/index.js';import {DatabaseSync} from 'node:sqlite';
test('browser adapter restores platform session and saves revisions in order',async()=>{
 const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../drizzle/0000_meld_cloud.sql',import.meta.url),'utf8'));
 const DB={prepare(sql){let values=[];return {bind(...args){values=args;return this;},all:async()=>({results:db.prepare(sql).all(...values)}),run:async()=>({meta:{changes:Number(db.prepare(sql).run(...values).changes)}}),sql};},async batch(statements){const result=[];for(const statement of statements)result.push(statement.sql.startsWith('SELECT')?await statement.all():await statement.run());return result;}};
 const context=vm.createContext({window:{MELD_BACKEND_CONFIG:{enabled:true,provider:'sites',apiBase:''}},Blob,AbortSignal,Map,JSON,fetch:async(path,options={})=>worker.fetch(new Request('https://meld.test'+path,{...options,headers:{...options.headers,'Origin':'https://meld.test','oai-authenticated-user-id':'alice','oai-authenticated-user-email':'alice@test.local'}}),{DB})});
 vm.runInContext(readFileSync(new URL('../public/local-backend.js',import.meta.url),'utf8'),context);
 const cloud=context.window.MeldLocalCloud;assert.equal((await cloud.restoreSession()).user.id,'alice');assert.equal(cloud.provider,'sites');
 await cloud.fetchDocuments('projects');
 await Promise.all([cloud.upsertProjects([{id:'one',title:'first'}]),cloud.upsertProjects([{id:'one',title:'second'}])]);
 assert.equal((await cloud.fetchProjects())[0].title,'second');
 await cloud.deleteProject('one');assert.equal((await cloud.fetchProjects()).length,0);
});
