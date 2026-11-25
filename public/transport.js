// One cursor for paused positioning, ruler clicks, dragging, and resumed audio playback.
const arrangementSeek = { drag:null };
function updateArrangementSeekUI(){
 const handle=document.getElementById('arrangementSeekHandle');if(!handle)return;
 const scale=arrangement.baseBpm/arrangement.bpm,seconds=arrangement.playhead*scale;
 handle.setAttribute('aria-valuemin','0');handle.setAttribute('aria-valuemax',String(Math.round(arrangement.duration*scale*100)/100));handle.setAttribute('aria-valuenow',String(Math.round(seconds*100)/100));handle.setAttribute('aria-valuetext',formatTime(seconds,true));
 document.getElementById('arrangementSeekTime').textContent=formatTime(seconds,true);
}
function arrangementTimeAtPointer(event){
 const rect=els.arrangementRuler.getBoundingClientRect();
 return Math.max(0,Math.min(arrangement.duration,(event.clientX-rect.left)/Math.max(1,rect.width)*arrangement.duration));
}
function seekArrangementTo(time,resume=false){
 if(performanceInput.recording){showToast('先停止当前录制，再移动播放位置');return false;}
 const position=Math.max(0,Math.min(arrangement.duration,Number(time)||0));
 stopArrangementPlayback(false);updateArrangementPlayhead(position);
 if(resume&&position<arrangement.duration-.02)playArrangement(position);
 return true;
}
function beginArrangementSeek(event,fromRuler=false){
 if(event.button!==0||arrangementSeek.drag)return;
 if(performanceInput.recording){showToast('先停止当前录制，再移动播放位置');return;}
 event.preventDefault();event.stopPropagation();
 const target=event.currentTarget,wasPlaying=arrangement.isPlaying,start=arrangement.playhead;
 stopArrangementPlayback(false);
 arrangementSeek.drag={pointerId:event.pointerId,target,wasPlaying,start};
 target.setPointerCapture(event.pointerId);document.getElementById('arrangementSeekHandle').focus({preventScroll:true});
 els.arrangementPlayhead.classList.add('seeking');
 if(fromRuler)updateArrangementPlayhead(arrangementTimeAtPointer(event));
}
function moveArrangementSeek(event){
 const drag=arrangementSeek.drag;if(!drag||event.pointerId!==drag.pointerId)return;
 event.preventDefault();updateArrangementPlayhead(arrangementTimeAtPointer(event));
}
function endArrangementSeek(event,cancel=false){
 const drag=arrangementSeek.drag;if(!drag||(event&&event.pointerId!==drag.pointerId))return;
 if(event){event.preventDefault();event.stopPropagation();}
 const position=cancel?drag.start:arrangement.playhead;arrangementSeek.drag=null;els.arrangementPlayhead.classList.remove('seeking');
 if(drag.target.hasPointerCapture(drag.pointerId))drag.target.releasePointerCapture(drag.pointerId);
 seekArrangementTo(position,drag.wasPlaying);
}
function arrangementSeekKey(event){
 if(!['ArrowLeft','ArrowRight','Home','End','Escape'].includes(event.key))return;
 event.preventDefault();event.stopPropagation();
 if(event.key==='Escape'){endArrangementSeek(null,true);return;}
 const step=60/arrangement.baseBpm*(event.shiftKey?4:1);
 const next=event.key==='Home'?0:event.key==='End'?arrangement.duration:arrangement.playhead+(event.key==='ArrowRight'?step:-step);
 seekArrangementTo(next,arrangement.isPlaying);
}
function setupArrangementSeeking(){
 const line=els.arrangementPlayhead,ruler=els.arrangementRuler;
 line.addEventListener('pointerdown',event=>beginArrangementSeek(event));
 ruler.addEventListener('pointerdown',event=>beginArrangementSeek(event,true));
 for(const target of [line,ruler]){
  target.addEventListener('pointermove',moveArrangementSeek);
  target.addEventListener('pointerup',event=>endArrangementSeek(event));
  target.addEventListener('pointercancel',event=>endArrangementSeek(event,true));
  target.addEventListener('lostpointercapture',event=>endArrangementSeek(event,true));
 }
 document.getElementById('arrangementSeekHandle').addEventListener('keydown',arrangementSeekKey);
 window.addEventListener('blur',()=>{if(arrangementSeek.drag){arrangementSeek.drag.wasPlaying=false;endArrangementSeek(null,true);}});
 updateArrangementSeekUI();
}
