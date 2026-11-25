const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../public');
function fixture(search=''){
 const element=()=>({hidden:false,dataset:{},attributes:{},classList:{values:new Set(),toggle(k,on){if(on)this.values.add(k);else this.values.delete(k);}},setAttribute(k,v){this.attributes[k]=v;},removeAttribute(k){delete this.attributes[k];}});
 const views=Object.fromEntries(['studio','works','lab','arrangement','hongkong','dx7'].map(k=>[k+'View',element()]));
 const els={...views,saveProjectBtn:element(),exportBtn:element()};
 const nav=['studio','works','lab','arrangement'].map(view=>Object.assign(element(),{dataset:{view}}));
 const links=['arrangement','hongkong','dx7'].map(page=>Object.assign(element(),{dataset:{page}}));
 const location={href:'https://meld.test/'+search,get search(){return new URL(this.href).search;}};
 const calls=[],history={entries:[],replaceState(_,__,url){location.href=String(url);this.entries.push(['replace',String(url)]);},pushState(_,__,url){location.href=String(url);this.entries.push(['push',String(url)]);}};
 const listeners={},domListeners={};
 const tracks=[{id:'keep-me',notes:[{midi:60,start:.123,duration:.42}]}];
 const state={currentView:'studio',isRecording:false,metronome:false},arrangement={tracks};
 const context=vm.createContext({URL,URLSearchParams,console,document:{title:'',getElementById:id=>views[id],querySelectorAll:selector=>selector==='.nav-item'?nav:links,querySelector:()=>element(),addEventListener:(k,v)=>domListeners[k]=v},location,history,els,state,arrangement,performanceInput:{},window:{setTimeout(){},scrollTo(){}},addEventListener:(k,v)=>listeners[k]=v,MeldSourceInstruments:{stopPreview:()=>calls.push('stop-hk')},MeldDx7Library:{stop:()=>calls.push('stop-dx7')},cancelAnimationFrame(){},labAnimationFrame:null});
 for(const name of ['stopRecording','stopMelodyPlayback','stopLabPlayback','stopPerformanceTake','releasePerformanceKeys','stopArrangementPlayback','stopMetronome','renderProjects','renderLabKeyboard','syncLabControls','startLabVisualizer','ensureArrangementTracks','renderArrangement'])context[name]=()=>calls.push(name);
 const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
 vm.runInContext(app.slice(app.indexOf('function switchView(view)'),app.indexOf('function formatLabValue(')),context);
 vm.runInContext(fs.readFileSync(path.join(root,'workspace-pages.js'),'utf8'),context);
 return {context,state,views,nav,links,location,history,listeners,domListeners,calls,tracks};
}
test('the main page opens the arrangement without importing or replacing tracks; legacy stem URLs are safe',()=>{
 for(const search of ['', '?stems=hong-kong&library=1']){
  const f=fixture(search);assert.equal(f.state.currentView,'arrangement');assert.equal(f.views.arrangementView.hidden,false);assert.equal(f.views.hongkongView.hidden,true);assert.equal(f.context.arrangement.tracks,f.tracks);assert.equal(f.tracks[0].notes[0].start,.123);assert.equal(f.location.search,'?page=arrangement');assert.equal(f.history.entries.length,1);
 }
});
test('resource pages support direct links, page switching, and browser back without touching the session',()=>{
 const f=fixture('?page=hongkong');assert.equal(f.state.currentView,'hongkong');assert.equal(f.views.arrangementView.hidden,true);assert.equal(f.nav.at(-1).classList.values.has('active'),true);
 f.context.switchView('dx7');assert.equal(f.views.hongkongView.hidden,true);assert.equal(f.views.dx7View.hidden,false);assert.equal(f.calls.includes('stop-hk'),true);assert.equal(f.location.search,'?page=dx7');assert.equal(f.links[2].attributes['aria-current'],'page');
 const count=f.history.entries.length;f.location.href='https://meld.test/?page=hongkong';f.listeners.popstate();assert.equal(f.state.currentView,'hongkong');assert.equal(f.history.entries.length,count);assert.equal(f.calls.includes('stop-dx7'),true);
 f.context.switchView('arrangement');assert.equal(f.context.arrangement.tracks,f.tracks);assert.equal(f.views.dx7View.hidden,true);assert.equal(f.views.hongkongView.hidden,true);assert.equal(f.views.arrangementView.hidden,false);
});
test('ordinary resource links navigate in place while modified clicks keep native link behavior',()=>{
 const f=fixture();let prevented=false;const link={dataset:{page:'dx7'}},event={target:{closest:()=>link},button:0,preventDefault(){prevented=true;}};
 f.domListeners.click(event);assert.equal(prevented,true);assert.equal(f.state.currentView,'dx7');
 prevented=false;link.dataset.page='hongkong';f.domListeners.click({...event,ctrlKey:true});assert.equal(prevented,false);assert.equal(f.state.currentView,'dx7');
});
test('leaving the arrangement stops the current take and keys before entering a resource page',()=>{
 const f=fixture();f.context.switchView('hongkong');for(const call of ['stopPerformanceTake','releasePerformanceKeys','stopArrangementPlayback'])assert.ok(f.calls.includes(call));assert.equal(f.context.arrangement.tracks,f.tracks);
});
test('unavailable history APIs do not break offline page switching',()=>{
 const f=fixture();f.history.pushState=()=>{throw Error('file mode');};assert.doesNotThrow(()=>f.context.switchView('dx7'));assert.equal(f.views.dx7View.hidden,false);
});
