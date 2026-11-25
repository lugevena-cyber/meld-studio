/* Shared geometry and editing rules for every MIDI piano roll. */
(function(root){
 'use strict';
 const modes={major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10],dorian:[0,2,3,5,7,9,10],chromatic:[0,1,2,3,4,5,6,7,8,9,10,11]},names=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 function key(value){return {tonic:((Math.round(Number(value?.tonic)||0)%12)+12)%12,mode:Object.hasOwn(modes,value?.mode)?value.mode:'major'};}
 function inScale(midi,value){const k=key(value);return modes[k.mode].includes(((Math.round(midi)-k.tonic)%12+12)%12);}
 function snapPitch(value,scale,direction=0,min=0,max=127){const raw=clamp(value,min,max);let best=min,distance=Infinity;for(let n=min;n<=max;n++)if(inScale(n,scale)){const d=Math.abs(n-raw);if(d<distance-1e-9||Math.abs(d-distance)<1e-9&&(direction>0?n>best:n<best)){distance=d;best=n;}}return best;}
 function label(midi){return names[((Math.round(midi)%12)+12)%12]+(Math.floor(Math.round(midi)/12)-1);}
 function moveNote(original,dx,dy,g,scale,options={}){
  const next={...original},limit=options.maxTime||7200;
  const time=value=>options.grid>0?Math.round(value/options.grid)*options.grid:value;
  if(options.resize)next.duration=clamp(time(original.duration+dx/g.width*g.duration),.01,Math.max(.01,limit-original.start));
  else{
   next.start=dx===0?original.start:clamp(time(original.start+dx/g.width*g.duration),0,Math.max(0,limit-original.duration));
   if(dy!==0||options.pitchMoved){const raw=original.midi-dy/g.height*(g.high-g.low);next.midi=options.lanes?options.lanes.reduce((best,n)=>Math.abs(n-raw)<Math.abs(best-raw)?n:best):snapPitch(raw,scale,-Math.sign(dy),options.minMidi??0,options.maxMidi??127);}
  }
  if(next.start!==original.start||next.duration!==original.duration||next.midi!==original.midi)next.manualEdited=true;if(next.midi!==original.midi)next.originalMidi??=original.midi;return next;
 }
 function slideOffsets(note,progress=0){
  if(!Number.isInteger(note.slideMidi)||note.slideMidi<0||note.slideMidi>127||note.slideMidi===note.midi)return null;
  const end=(note.slideMidi-note.midi)*100;
  return {start:end*clamp(progress,0,1),end};
 }
 function applySlide(sources,note,when,duration,progress=0){
  const offsets=slideOffsets(note,progress);
  if(!offsets)return;
  for(const source of sources){
   if(!source.detune||(!source.buffer&&source.meldBaseDetune===undefined&&!(source.frequency?.value>20)))continue;
   const base=source.meldBaseDetune??source.detune.value;
   source.detune.setValueAtTime(base+offsets.start,when);
   source.detune.linearRampToValueAtTime(base+offsets.end,when+duration);
  }
 }
 function harmonyData(value){
  const {tonic,mode}=key(value);
  if(mode==='chromatic')return null;
  const letters='CDEFGAB',natural=[0,2,4,5,7,9,11],scale=modes[mode];
  const first=letters.indexOf(names[tonic][0]);
  const pitches=scale.map((step,index)=>{
   const letter=(first+index)%7;
   const accidental=((tonic+step-natural[letter]+18)%12)-6;
   return letters[letter]+(accidental<0?'♭'.repeat(-accidental):'♯'.repeat(accidental));
  });
  const degrees=['I','II','III','IV','V','VI','VII'];
  const chords=scale.map((step,index)=>{
   const interval=n=>(scale[(index+n)%7]-step+12)%12;
   const shape=`${interval(2)}-${interval(4)}-${interval(6)}`;
   const suffix={'4-7-11':'maj7','4-7-10':'7','3-7-10':'m7','3-6-10':'m7♭5'}[shape];
   const degree=interval(2)===3?degrees[index].toLowerCase():degrees[index];
   return `${degree}${suffix==='m7'?'7':suffix==='m7♭5'?'ø7':suffix} ${pitches[index]}${suffix}`;
  });
  return {tonic,mode,scale,pitches,chords};
 }
 function harmonyReference(value){
  const data=harmonyData(value);
  if(!data)return '';
  const {mode,pitches,chords}=data;
  const progression=mode==='major'?[1,4,0,5]:mode==='minor'?[0,5,2,6]:[0,3,0,6];
  return `${pitches[0]} ${{major:'自然大调',minor:'自然小调',dorian:'多利亚'}[mode]} · ${pitches.join(' ')}\n和弦进行 · ${progression.map(index=>chords[index]).join(' → ')}`;
 }
 function renderHarmonyReference(element,scale){
  const reference=harmonyReference(scale);
  element.textContent=reference;
  element.hidden=!reference;
 }
 root.MeldPianoRollCore={key,inScale,snapPitch,label,moveNote,slideOffsets,applySlide,harmonyReference,renderHarmonyReference};
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let rollCount=0;
 function mount(host,initial){
  let opts=initial,owner=opts.owner,model=opts.getNotes(),selected=-1,drag=null,history=[],redo=[],windowStart=model.length?Math.max(0,Math.floor(Math.min(...model.map(n=>n.start)))):0,windowLength=4,geometry=null,viewportWindow=null,tool="move",playhead=NaN;
  host.classList.add('editable-piano-roll');
  host.innerHTML=`<div class="roll-toolbar">
   <strong data-roll-title></strong><div class="roll-tools" role="group" aria-label="编辑工具">
   <button type="button" data-roll-tool="move" aria-pressed="true">移动</button>
   <button type="button" data-roll-tool="draw" aria-pressed="false">画音符</button>
   <button type="button" data-roll-tool="pan" aria-pressed="false">浏览</button>
   <button type="button" data-roll-delete>删除</button><button type="button" data-roll-undo>撤销</button><button type="button" data-roll-redo>重做</button></div>
   <details><summary>音阶与吸附</summary><div class="roll-scale"><label>主音<select data-roll-tonic>${names.map((n,i)=>`<option value="${i}">${n}</option>`).join('')}</select></label>
   <label>调式<select data-roll-mode><option value="major">自然大调</option><option value="minor">自然小调</option><option value="dorian">多利亚</option><option value="chromatic">半音阶（自由音高）</option></select></label>
   <button type="button" data-roll-fit-scale>将本轨音符吸附到音阶</button>
   <label class="inline-check"><input type="checkbox" data-roll-grid>1/16 音符吸附</label></div></details></div>
   <div class="roll-window"><button type="button" data-roll-prev>上一段</button><button type="button" data-roll-next>下一段</button>
   <label>起点（秒）<input type="number" min="0" step="0.01" value="0" data-roll-from></label>
   <label>显示范围<select data-roll-span><option value="1">1 秒</option><option value="2">2 秒</option><option value="4" selected>4 秒</option><option value="8">8 秒</option><option value="16">16 秒</option><option value="32">32 秒</option><option value="64">64 秒</option></select></label></div>
   <output class="harmony-reference" data-roll-harmony></output>
   <div class="roll-ruler" aria-hidden="true"></div><div class="roll-grid" tabindex="0" aria-label="音高滚动区域"><svg class="editable-roll-canvas" tabindex="0" role="group" aria-label="可编辑钢琴卷帘"></svg></div>
   <output class="roll-status" aria-live="polite"></output>
   <div class="roll-inspector" hidden><label>音高<select data-roll-pitch></select></label><label>起点（秒）<input data-roll-start type="number" min="0" step=".01"></label>
   <label>时长（秒）<input data-roll-duration type="number" min=".01" step=".01"></label><label data-roll-slide-label>滑音目标<select data-roll-slide></select></label></div>`;
  const find=s=>host.querySelector(s),svg=find('svg'),status=find('.roll-status'),scroller=find('.roll-grid'),tonic=find('[data-roll-tonic]'),mode=find('[data-roll-mode]'),grid=find('[data-roll-grid]'),from=find('[data-roll-from]');
  const pitch=find('[data-roll-pitch]'),startField=find('[data-roll-start]'),durationField=find('[data-roll-duration]'),slide=find('[data-roll-slide]');
  const allPitches=Array.from({length:128},(_,i)=>127-i);
  const clipId='roll-grid-'+(++rollCount);
  const snapshot=()=>model.map(n=>({...n}));
  function replace(notes){model.splice(0,model.length,...notes.map(n=>({...n})));}
  function locked(){return Boolean(opts.locked?.());}
  function changed(before){if(JSON.stringify(before)===JSON.stringify(model))return;history.push(before);if(history.length>100)history.shift();redo=[];opts.onChange?.();}
  function windowRange(){return opts.getWindow?.()||{from:windowStart,duration:windowLength};}
  function render(){
   if(!drag&&model!==opts.getNotes()){model=opts.getNotes();history=[];redo=[];selected=-1;}
   const r=drag?.range||windowRange(),scale=key(opts.getKey?.()),lanes=opts.lanes,shown=model.map((n,i)=>({n,i})).filter(({n})=>n.start<r.from+r.duration&&n.start+n.duration>r.from&&(!opts.filter||opts.filter(n)));
   const widthPx=Math.max(220,scroller.clientWidth||340),rowHeight=opts.lanes?44:24;
   const rows=lanes?[...lanes].sort((a,b)=>b-a):allPitches;
   const harmony=lanes?null:harmonyData(scale);
   const low=rows.at(-1),high=rows[0],top=14,left=lanes?86:harmony?118:opts.auditionPitch?74:45,h=rows.length*rowHeight+36,w=widthPx,width=w-left-12;
   const height=(rows.length-1)*rowHeight,x=t=>left+(t-r.from)/r.duration*width,y=n=>top+(lanes?rows.indexOf(n):high-n)*rowHeight;
   geometry={low,high,width,height,duration:r.duration,w,h,left,top,x,y};
   svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.style.height=h+'px';find('[data-roll-title]').textContent=opts.title||'音符编辑';
   for(const el of [tonic,mode])el.closest('label').hidden=Boolean(lanes);
   tonic.value=String(scale.tonic);mode.value=scale.mode;
   renderHarmonyReference(find('[data-roll-harmony]'),lanes?{mode:'chromatic'}:scale);
   const fit=find('[data-roll-fit-scale]');
   fit.hidden=Boolean(lanes);fit.disabled=locked()||!model.length||scale.mode==='chromatic';
   find('.roll-window').hidden=Boolean(opts.getWindow);if(document.activeElement!==from)from.value=String(windowStart);
   let content=`<defs><clipPath id="${clipId}"><rect x="${left}" y="0" width="${width}" height="${h-22}"/></clipPath></defs>`;
   for(const midi of rows){
    const yy=y(midi),valid=lanes||inScale(midi,scale),black=!lanes&&[1,3,6,8,10].includes(midi%12);
    const name=esc(opts.laneNames?.[midi]||label(midi));
    const degree=harmony?.scale.indexOf((midi-harmony.tonic+120)%12);
    const chord=degree>=0?harmony.chords[degree]:'';
    const chordText=chord?`<text class="roll-key-harmony" x="5" y="${yy+4}" font-size="9">${esc(chord)}</text>`:'';
    content+=`<rect x="${left}" y="${yy-12}" width="${width}" height="${rowHeight}" fill="${valid?'#21332d':'#182622'}"/><path d="M${left} ${yy-12}H${left+width}" stroke="#afc5b6" opacity="${midi%12===0?.34:.12}"/>`;
    if(opts.auditionPitch){
     const keyWidth=black?Math.round(left*(harmony ? .88 : .69)):left-1;
     content+=`<g class="roll-audition-key${black?' black':''}${lanes?' drum':''}" data-roll-key="${midi}"><title>试听 ${name}${chord?' · '+esc(chord):''}</title><rect class="roll-key-base" x="0" y="${yy-12}" width="${left-1}" height="${rowHeight-1}"/><rect class="roll-key-face" x="0" y="${yy-12}" width="${keyWidth}" height="${rowHeight-1}" rx="${black?3:0}"/><text x="${keyWidth-6}" y="${yy+4}" text-anchor="end" font-size="12">${name}</text>${chordText}</g>`;
    }else{
     content+=`<g data-roll-pitch-label="${midi}" fill="${black?'#d8e9dc':'#13251c'}"><rect x="0" y="${yy-12}" width="${left-1}" height="${rowHeight-1}" fill="${black?'#30433c':'#bfd0c2'}"/><text x="${left-5}" y="${yy+4}" text-anchor="end" font-size="12">${name}</text>${chordText}</g>`;
    }
   }
   const divisions=width<440?4:8,ruler=find('.roll-ruler');
   ruler.style.paddingLeft=left+'px';ruler.style.paddingRight=(ruler.clientWidth-w+12)+'px';
   ruler.innerHTML=Array.from({length:divisions+1},(_,i)=>`<span>${(r.from+r.duration*i/divisions).toFixed(2)}s</span>`).join('');
   for(let i=0;i<=divisions;i++){const at=r.from+r.duration*i/divisions,xx=x(at);content+=`<path d="M${xx} 0V${h-22}" stroke="#b9cfbf" opacity=".22"/>`;}
   content+=`<g clip-path="url(#${clipId})">`;
   shown.sort((a,b)=>Number(a.i===selected)-Number(b.i===selected));
   for(const {n,i} of shown){
    const xx=x(Math.max(r.from,n.start)),end=x(Math.min(r.from+r.duration,n.start+n.duration)),yy=y(n.midi),chosen=i===selected;
    const noteWidth=Math.max(10,end-xx),target=n.slideMidi;
    const slideLine=!lanes&&Number.isInteger(target)&&target!==n.midi?`<path d="M${x(n.start)} ${yy}L${x(n.start+n.duration)} ${y(target)}" stroke="#ffbf9b" stroke-width="2" pointer-events="none"/>`:'';
    content+=`<g data-roll-index="${i}" aria-label="${esc(label(n.midi))} ${n.start.toFixed(3)} 秒"><rect x="${xx}" y="${yy-9}" width="${noteWidth}" height="18" rx="4" fill="${chosen?'#d5f596':'#77b69c'}"${chosen?' stroke="#fff0bd" stroke-width="2"':''}/>${slideLine}${noteWidth>=40?`<text x="${xx+5}" y="${yy+4}" fill="#12251c" font-size="12" pointer-events="none">${esc(label(n.midi))}</text>`:''}${chosen&&n.start+n.duration<=r.from+r.duration?`<rect data-roll-resize="${i}" x="${xx+noteWidth-6}" y="${yy-10}" width="12" height="20" rx="3" fill="#ffe2af"/>`:''}</g>`;
   }
   content+=`</g><path data-roll-cursor d="M${left} 0V${h-22}" stroke="#ffac87" stroke-width="2" visibility="hidden" pointer-events="none"/>`;svg.innerHTML=content;
   setPlayhead(playhead);
   const signature=owner+':'+r.from+':'+r.duration;
   if(!drag&&signature!==viewportWindow&&scroller.clientHeight){
    viewportWindow=signature;
    const pitches=shown.map(({n})=>n.midi).sort((a,b)=>a-b),center=model[selected]?.midi??pitches[Math.floor(pitches.length/2)]??60;
    scroller.scrollTop=lanes?0:Math.max(0,y(center)-scroller.clientHeight/2);
   }
   const note=model[selected];if(!drag){
    status.textContent=note?`${lanes?(opts.laneNames?.[note.midi]||label(note.midi)):label(note.midi)} · ${note.start.toFixed(3)} 秒 · 时长 ${note.duration.toFixed(3)} 秒`:`${shown.length} 个可见音符 · 拖动音符移动，选中后拖右端改时长。浏览模式可滑动音高网格。`;
    find('.roll-inspector').hidden=!note;
    if(note){
     const options=(list,names)=>list.map(m=>`<option value="${m}">${esc(names?.[m]||label(m))}</option>`).join('');
     pitch.innerHTML=options(rows,opts.laneNames);pitch.value=String(note.midi);
     startField.value=Number(note.start.toFixed(3));durationField.value=Number(note.duration.toFixed(3));
     find('[data-roll-slide-label]').hidden=Boolean(lanes||opts.disableSlide);
     if(!lanes){slide.innerHTML='<option value="">无滑音</option>'+options(rows.filter(m=>m!==note.midi));slide.value=note.slideMidi===note.midi?'':String(note.slideMidi??'');}
    }
   }
   find('[data-roll-delete]').disabled=selected<0||locked();find('[data-roll-undo]').disabled=!history.length||locked();find('[data-roll-redo]').disabled=!redo.length||locked();for(const el of host.querySelectorAll('input,select,[data-roll-tool]'))el.disabled=locked();
   tonic.disabled=locked()||Boolean(lanes)||scale.mode==='chromatic';
   mode.disabled=locked()||Boolean(lanes);
  }
  function point(event){const rect=svg.getBoundingClientRect();return {x:(event.clientX-rect.left)/rect.width*geometry.w,y:(event.clientY-rect.top)/rect.height*geometry.h};}
  function finish(cancel=false){if(!drag)return;const d=drag;drag=null;try{if(svg.hasPointerCapture(d.pointer))svg.releasePointerCapture(d.pointer);}catch{}if(cancel)d.ref.splice(0,d.ref.length,...d.before.map(n=>({...n})));else changed(d.before);render();}
  svg.addEventListener('pointerdown',e=>{
   if(e.button!==0||locked()||drag)return;
   const pianoKey=e.target.closest('[data-roll-key]');
   if(pianoKey){opts.auditionPitch?.(Number(pianoKey.dataset.rollKey));return;}
   const target=e.target.closest('[data-roll-index]');
   if(tool==='pan')return;
   if(!target){if(tool==='draw'&&point(e).x>=geometry.left)add(e);return;}
   const index=Number(target.dataset.rollIndex);selected=index;opts.onBegin?.();const p=point(e);drag={index,ref:model,original:{...model[index]},before:snapshot(),pointer:e.pointerId,start:p,range:{...windowRange()},geometry:{...geometry},visualMidi:model[index].midi,pitchMoved:false,resize:Boolean(e.target.closest('[data-roll-resize]'))};svg.setPointerCapture(e.pointerId);svg.focus({preventScroll:true});e.preventDefault();render();
  });
  svg.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.pointer)return;if(locked()){finish(true);return;}const p=point(e),dx=p.x-drag.start.x,dy=p.y-drag.start.y;if(!drag.moved&&Math.hypot(dx,dy)<4)return;drag.moved=true;drag.pitchMoved ||= Math.abs(dy)>.01;const next=moveNote(drag.original,dx,opts.lanes?0:dy,drag.geometry,opts.getKey?.(),{resize:drag.resize,maxTime:opts.maxTime||7200,grid:grid.checked?60/(opts.getBpm?.()||84)/4:0,lanes:opts.lanes,pitchMoved:drag.pitchMoved});if(opts.lanes&&!drag.resize){const ordered=[...opts.lanes].sort((a,b)=>b-a);next.midi=ordered[clamp(ordered.indexOf(drag.original.midi)+Math.round(dy/44),0,ordered.length-1)];if(next.midi!==drag.original.midi)next.manualEdited=true;}Object.assign(model[drag.index],next);status.textContent=`落音 ${opts.lanes?(opts.laneNames?.[next.midi]||label(next.midi)):label(next.midi)} · ${next.start.toFixed(3)} 秒`;render();});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(event,e=>{if(drag&&drag.pointer===e.pointerId)finish(event!=='pointerup');});
  const blur=()=>finish(true);window.addEventListener('blur',blur);
  function add(event){if(locked())return;opts.onBegin?.();const before=snapshot(),r=windowRange(),p=event?point(event):null,start=p?r.from+(p.x-geometry.left)/geometry.width*r.duration:r.from,midi=p?(opts.lanes?[...opts.lanes].sort((a,b)=>b-a)[clamp(Math.round((p.y-geometry.top)/44),0,opts.lanes.length-1)]:geometry.high-(p.y-geometry.top)/24):(opts.defaultMidi??60);const n={midi:opts.lanes?opts.lanes.reduce((b,v)=>Math.abs(v-midi)<Math.abs(b-midi)?v:b):snapPitch(midi,opts.getKey?.()),start:clamp(start,0,opts.maxTime||7200),duration:Math.min(.5,60/(opts.getBpm?.()||84)),confidence:1,manualEdited:true};if(grid.checked){const step=60/(opts.getBpm?.()||84)/4;n.start=Math.round(n.start/step)*step;}if(opts.lanes){n.category=({36:'kick',38:'snare',42:'hat'})[n.midi];n.name=opts.laneNames?.[n.midi]||label(n.midi);}n.start=Math.min(n.start,Math.max(0,(opts.maxTime||7200)-n.duration));model.push(n);selected=model.length-1;changed(before);render();}
  svg.addEventListener('dblclick',e=>{if(tool==='move'&&point(e).x>=geometry.left&&!e.target.closest('[data-roll-index]'))add(e);});
  for(const button of host.querySelectorAll('[data-roll-tool]'))button.onclick=()=>{
   tool=button.dataset.rollTool;scroller.dataset.tool=tool;
   for(const item of host.querySelectorAll('[data-roll-tool]'))item.setAttribute('aria-pressed',String(item===button));
  };
  for(const field of [pitch,startField,durationField,slide])field.onchange=()=>{
   const note=model[selected];if(locked()||!note)return;
   const before=snapshot(),limit=opts.maxTime||7200;
   opts.onBegin?.();
   if(field===pitch){note.originalMidi??=note.midi;note.midi=Number(field.value);}
   if(field===slide){if(field.value==='')delete note.slideMidi;else note.slideMidi=Number(field.value);}
   if(field===startField&&field.value!=='')note.start=clamp(Number(field.value),0,limit-note.duration);
   if(field===durationField&&field.value!=='')note.duration=clamp(Number(field.value),.01,Math.max(.01,limit-note.start));
   note.manualEdited=true;changed(before);render();
  };
  function remove(){if(locked()||selected<0)return;opts.onBegin?.();const before=snapshot();model.splice(selected,1);selected=Math.min(selected,model.length-1);changed(before);render();}
  function undo(forward=false){if(locked()||drag)return;const from=forward?redo:history,to=forward?history:redo,before=from.pop();if(!before)return;opts.onBegin?.();to.push(snapshot());replace(before);selected=Math.min(selected,model.length-1);opts.onChange?.();render();}
  find('[data-roll-delete]').onclick=remove;find('[data-roll-undo]').onclick=()=>undo();find('[data-roll-redo]').onclick=()=>undo(true);
  for(const el of [tonic,mode])el.addEventListener('change',()=>{opts.setKey?.(key({tonic:tonic.value,mode:mode.value}));render();});
  find('[data-roll-fit-scale]').onclick=()=>{
   if(locked()||opts.lanes)return;
   const before=snapshot(),scale=opts.getKey?.();
   let count=0;
   for(const note of model){
    const midi=snapPitch(note.midi,scale),slide=Number.isInteger(note.slideMidi)?snapPitch(note.slideMidi,scale):note.slideMidi;
    if(midi===note.midi&&slide===note.slideMidi)continue;
    note.originalMidi??=note.midi;
    note.midi=midi;
    if(Number.isInteger(slide))note.slideMidi=slide;
    note.manualEdited=true;
    count++;
   }
   if(count){opts.onBegin?.();changed(before);render();}
   status.textContent=count?`已调整 ${count} 个音符，可撤销。`:'本轨音符已在所选音阶中。';
  };
  from.onchange=()=>{windowStart=clamp(Number(from.value)||0,0,7200);render();};find('[data-roll-span]').onchange=e=>{const span=Number(e.target.value),n=model[selected];if(n&&n.start<windowStart+windowLength&&n.start+n.duration>windowStart)windowStart=Math.max(0,n.start-span*.25);windowLength=span;render();};find('[data-roll-prev]').onclick=()=>{windowStart=Math.max(0,windowStart-windowLength);render();};find('[data-roll-next]').onclick=()=>{windowStart=Math.min(7200-windowLength,windowStart+windowLength);render();};
  svg.addEventListener('keydown',e=>{if(locked())return;if(e.key==='Escape'){finish(true);return;}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo(e.shiftKey);return;}if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();remove();return;}if(selected<0||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const before=snapshot(),n=model[selected];opts.onBegin?.();if(e.key==='ArrowLeft'||e.key==='ArrowRight')n.start=clamp(n.start+(e.key==='ArrowRight'?1:-1)*.01,0,Math.max(0,(opts.maxTime||7200)-n.duration));else{const d=e.key==='ArrowUp'?1:-1;if(opts.lanes){const sorted=[...opts.lanes].sort((a,b)=>a-b);n.midi=sorted[clamp(sorted.indexOf(n.midi)+d,0,sorted.length-1)];}else{let next=n.midi+d;while(next>0&&next<127&&!inScale(next,opts.getKey?.()))next+=d;n.midi=snapPitch(next,opts.getKey?.(),d);}}n.manualEdited=true;changed(before);render();});
  function setPlayhead(time){
   playhead=time;const line=find('[data-roll-cursor]'),r=windowRange();
   if(line){line.setAttribute('visibility',time>=r.from&&time<=r.from+r.duration?'visible':'hidden');if(Number.isFinite(time))line.setAttribute('transform',`translate(${geometry.x(time)-geometry.left} 0)`);}
  }
  const resize=new ResizeObserver(()=>{if(!drag&&scroller.clientWidth&&geometry?.w!==Math.max(220,scroller.clientWidth))render();});
  resize.observe(scroller);
  function highlightMidi(midi,on){
   const row=find(`[data-roll-key="${midi}"],[data-roll-pitch-label="${midi}"]`);
   if(!row)return;
   row.classList.toggle('midi-playing',on);
   const top=geometry.y(midi);
   if(on&&(top<scroller.scrollTop+12||top>scroller.scrollTop+scroller.clientHeight-12))scroller.scrollTop=Math.max(0,top-scroller.clientHeight/2);
  }
  render();return {render,update(next){if(drag)finish(true);if(next.owner!==owner||next.getNotes()!==model){owner=next.owner;model=next.getNotes();selected=-1;history=[];redo=[];windowStart=model.length?Math.max(0,Math.floor(Math.min(...model.map(n=>n.start)))):0;viewportWindow=null;}opts=next;render();},setPlayhead,highlightMidi,visibleStart:()=>windowRange().from,focusNotes(){viewportWindow=null;render();},destroy(){finish(true);resize.disconnect();window.removeEventListener('blur',blur);host.replaceChildren();}};

 }
 root.MeldPianoRoll={mount};
})(globalThis);
