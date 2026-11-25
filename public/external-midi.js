(() => {
  let access, connecting=false;
  const ports=new Set(), notes=new Map();

  function release(token){
    const note=notes.get(token);
    if(!note)return;
    notes.delete(token);
    note.release?.();
    if(note.view==='arrangement'){
      finishPerformanceKey(token);
      MeldArrangementRoll.highlightMidi(note.midi,false);
    }else{
      els.labKeyboard.querySelector(`[data-midi="${note.midi}"]`)?.classList.remove('active');
    }
  }

  async function playLabMidi(note,token,velocity){
    const context=ensureLabEngine(),instrument=labState.instrument;
    await prepareSampledInstrument(instrument,context);
    if(notes.get(token)!==note||state.currentView!=='lab'||labState.instrument!==instrument)return;
    const voice=schedulePatchVoice(instrument,note.midi,context.currentTime+.015,600,labState.params,labOutput,velocity);
    labActiveSources.push(...voice);
    note.release=()=>{
      try{voice.release(context.currentTime);}catch{}
      labActiveSources=labActiveSources.filter(source=>!voice.includes(source));
    };
    const pitch=noteNameFromMidi(note.midi);
    els.labNoteReadout.querySelector('strong').textContent=pitch.name+pitch.octave;
    els.labStatusText.textContent=`MIDI · ${pitch.name}${pitch.octave}`;
    els.labKeyboard.querySelector(`[data-midi="${note.midi}"]`)?.classList.add('active');
  }

  function receive(event){
    const [status,midi,value]=event.data;
    const command=status&0xf0, channel=status&15;
    const prefix=`midi:${event.currentTarget.id}:${channel}:`;
    const token=prefix+midi;
    if(command===0xb0&&(midi===120||midi===123)){
      for(const key of notes.keys())if(key.startsWith(prefix))release(key);
      return;
    }
    if(command===0x80||(command===0x90&&value===0)){release(token);return;}
    if(command!==0x90||value===undefined||document.querySelector('dialog[open]'))return;
    const view=state.currentView;
    if(view!=='lab'&&view!=='arrangement')return;
    release(token);
    const note={midi,view};
    notes.set(token,note);
    const velocity=Math.max(.05,value/127);
    if(view==='lab'){
      playLabMidi(note,token,velocity).catch(error=>{release(token);showToast(error.message);});
    }else{
      startPerformanceKey(token,midi,velocity,MeldArrangementRoll.activeTrack());
      MeldArrangementRoll.highlightMidi(midi,true);
    }
  }

  function refresh(){
    const inputs=new Set([...access.inputs.values()].filter(port=>port.state==='connected'));
    for(const port of ports){
      if(inputs.has(port))continue;
      port.removeEventListener('midimessage',receive);
      for(const token of notes.keys())if(token.startsWith(`midi:${port.id}:`))release(token);
      ports.delete(port);
    }
    for(const port of inputs){
      if(ports.has(port))continue;
      port.addEventListener('midimessage',receive);
      ports.add(port);
    }
    for(const button of document.querySelectorAll('[data-midi-connect]')){
      button.textContent=ports.size?`MIDI 已连接 · ${ports.size} 台`:'连接 MIDI 键盘';
    }
  }

  document.addEventListener('click',async event=>{
    if(!event.target.closest('[data-midi-connect]')||connecting)return;
    if(!navigator.requestMIDIAccess){showToast('此浏览器不支持 Web MIDI，请使用支持 MIDI 的浏览器');return;}
    connecting=true;
    try{
      const context=getAudioContext();
      const resume=context.resume();
      if(!access){
        access=await navigator.requestMIDIAccess({sysex:false});
        access.addEventListener('statechange',refresh);
      }
      await resume;
      refresh();
      showToast(ports.size?'MIDI 输入已就绪，编曲台可用分轨录制写入音符':'还没有检测到 MIDI 输入，请连接设备并确认系统已识别');
    }catch{showToast('无法连接 MIDI，请检查浏览器权限和设备连接');}
    finally{connecting=false;}
  });
  window.addEventListener('blur',()=>{for(const token of notes.keys())release(token);});
})();
