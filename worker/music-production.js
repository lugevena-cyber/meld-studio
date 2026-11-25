import {ScoreError} from './song-score.js';

const recorded = {
 melody: ['piano', 'brightpiano', 'warmpiano', 'cleanguitar', 'electric'],
 harmony: ['piano', 'warmpiano', 'brightpiano', 'cleanguitar', 'mutedguitar'],
 bass: ['bass', 'pickedbass', 'uprightbass'],
 drums: ['sample-funk-kit'],
 texture: ['piano', 'wideguitar', 'warmpiano'],
 countermelody: ['mutedguitar', 'cleanguitar', 'electric', 'piano'],
};
const recordedPitched = new Set(Object.entries(recorded).filter(([role])=>role!=='drums').flatMap(([,ids])=>ids).concat('rockguitar'));

export function productionProfile(request, preferRecorded, catalog) {
 const funk = /funk|disco|new\s*jack|放克|迪斯科|迈克尔[·・ ]?杰克逊|michael jackson|\bmj\b|火星哥|bruno mars/i.test(request);
 const recordedOnly = /真实采样|真实录音|录音乐器|real samples?|recorded instruments?/i.test(request);
 const specificSynth = /dx[ -]?7|dubstep|\b808\b|\b909\b|明确.*合成器|用合成器|电子合成/i.test(request);
 const useRecorded = !specificSynth && (recordedOnly || (preferRecorded ?? funk) === true) &&
   ['melody','harmony','bass','drums'].every(role=>recorded[role].some(id=>catalog.some(item=>item.id===id)));
 return {funk, useRecorded, recordedOnly, allowSparse:/留白|极简|故意停|只用长音|完全重复|minimal|breakdown|same loop/i.test(request)};
}

export function productionGuide(profile) {
 const directions = [
  'Before writing events, choose a tonic, mode, an identifiable two-bar motif, a coherent chord loop, and a contrasting full section. Return key as {tonic:integer 0=C through 11=B,mode:major|minor|dorian} when known. Keep the bass mostly on chord tones at strong positions; use passing notes near changes. Leave room between phrases; separate keyboard voicings and bass into different registers. Add energy by changing accompaniment density and voicing rather than assigning every part the same rhythm. Use different velocities for main accents, pickups and ghost notes; introduce a final cadence or clear ending.',
  'A smooth or connected lead means shaping note lengths and connecting different pitches within phrases. Preserve intentional rests, pickups and any delayed entry, especially on breath or flute sounds. Never pad gaps with repeated re-attacks of one pitch. If a continuous lead is explicitly requested, write evolving legato phrases in its active section. Keep support parts soft enough for the lead to speak.',
 ];
 if(profile.funk)directions.push(
  'Funk / retro dance production: when no track count is specified, choose five contrasting roles, with rhythm guitar or rhythm keys as the fifth role. Choose a syncopated bass motif with offbeats and short notes, 2/4 snare backbeats, and accented eighth hats with selective sixteenths. Kick and bass may share the downbeat, then alternate some attacks. For chords, use tight offbeat stabs and short guitar/keyboard responses; use sevenths or ninths when appropriate. A repeatable 2-bar lead hook with a changed ending should become clearest in the chorus. Use a lighter intro, fuller hook and an outro that lands on the tonic. Use only abstract production traits from named artists; do not transcribe a known riff.',
 );
 if(profile.useRecorded)directions.push(
  'Choose these recorded sources where possible: grand piano piano/brightpiano/warmpiano, bass bass/pickedbass/uprightbass, electric guitar mutedguitar/cleanguitar/electric, and sample-funk-kit for drums with 36 kick, 38 snare, 42 closed hat; 37 rimshot, 39 clap and 46 open hat are also available on this recorded kit. Name the parts by musical role. Do not describe unsupported sounds as recordings. Keep effects light on these sources and avoid synth LFO parameters.',
 );
 return directions.join('\n');
}

export function applyRecordedPalette(song, profile, catalog) {
 if(!profile.useRecorded || !Array.isArray(song?.tracks))return song;
 const ids=new Set(catalog.map(item=>item.id));
 for(const track of song.tracks) {
  if(!track || !Object.hasOwn(recorded,track.role))continue;
  const choices=recorded[track.role];
  const playable=track.role==='bass'||track.role==='drums'?choices.includes(track.instrument):recordedPitched.has(track.instrument);
  if(!playable || !ids.has(track.instrument)){
   const instrument=choices.find(id=>ids.has(id));
   if(!instrument)continue;
   track.instrument=instrument;
   delete track.params;
   delete track.soundDesign;
  }
  if(track.instrument==='sample-funk-kit' && Array.isArray(track.clips)){
   for(const clip of track.clips)for(const note of Array.isArray(clip?.notes)?clip.notes:[]){
    if(!Number.isInteger(note?.midi)||note.midi<0||note.midi>127)continue;
    if(![36,37,38,39,42,46].includes(note.midi))note.midi=[35,41,43,45,47,48,50].includes(note.midi)?36:[37,39,40,56].includes(note.midi)?38:42;
   }
  }
 }
 return song;
}

export function reviewLeadPhrasing(song, request) {
 if (/刻意(?:让主旋律)?同音连打|同音震奏|intentional(?:ly)?\s+(?:same.note|repeated.note|stutter)/i.test(request)) return;
 for (const track of song.tracks.filter(track => track.role === 'melody')) {
  const events = track.clips.flatMap(clip => Array.from({length:clip.repeat}, (_,repeat) => {
   const offset = (clip.startBar + repeat * clip.bars) * 4;
   return clip.notes.map(note => ({midi:note.midi,start:offset + note.beat}));
  }).flat()).sort((a,b) => a.start-b.start || a.midi-b.midi);
  let first = events[0], previous = first, count = 1;
  for (const event of events.slice(1)) {
   if (event.midi !== previous.midi || event.start - previous.start > 1.01) {
    first = event;
    count = 0;
   }
   count++;
   if (count >= 8 && event.start - first.start >= 2) {
    throw new ScoreError('tracks.melody: avoid a long run of same-pitch attacks; keep rests and write a pitched phrase with a clear contour');
   }
   previous = event;
  }
 }
}

export function reviewFunkArrangement(song, profile) {
 if(!profile.funk || profile.allowSparse)return song;
 const notesFor=role=>song.tracks.filter(track=>track.role===role).flatMap(track=>track.clips.flatMap(clip=>clip.notes));
 const bass=notesFor('bass'), melody=notesFor('melody'), drums=notesFor('drums');
 const hasOffbeat=bass.some(note=>Math.abs(note.beat-Math.round(note.beat))>=.12);
 if(!hasOffbeat)throw new ScoreError('tracks.bass: add some eighth or sixteenth offbeat entries and space between bass attacks');
 if(new Set(melody.map(note=>note.midi)).size<4)throw new ScoreError('tracks.melody: use a short recognizable motif with at least four pitches and a variation');
 if(![36,38,42].every(midi=>drums.some(note=>note.midi===midi))){
  throw new ScoreError('tracks.drums: add kick, snare backbeat and closed hat with differentiated velocities');
 }
 if(!song.tracks.some(track=>['melody','bass','drums'].includes(track.role) &&
    new Set(track.clips.map(clip=>clip.notes.map(n=>[n.midi,Math.round(n.beat*8),Math.round(n.duration*8)].join(':')).join(','))).size>1)){
  throw new ScoreError('tracks: vary at least one motif or rhythm between theme and chorus');
 }
 return song;
}

export function grooveDraft(song, catalog, request) {
 const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
 const names=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
 const choices={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
 const requested=/\b([A-G])([#♯b♭]?)\s*(大调|小调|major\b|minor\b|多利亚|dorian\b)/i.exec(request);
 const sign=requested?.[2]||'';
 const tonic=requested?(choices[requested[1].toUpperCase()]+(sign?(/[b♭]/.test(sign)?-1:1):0)+12)%12:4;
 const mode=/大调|major/i.test(requested?.[3]||'')?'major':/小调|minor/i.test(requested?.[3]||'')?'minor':'dorian';
 const shift=tonic-4,major=mode==='major',size=Number(request.match(/(\d+)\s*(?:轨|tracks?\b)/i)?.[1]);
 const requestedTracks=Number.isInteger(size)?clamp(size,4,8):catalog.some(item=>item.id==='mutedguitar')?5:4;
 for(let i=song.tracks.length;i<requestedTracks;i++){
  const instrument=catalog.find(item=>item.id===['mutedguitar','brightpiano','cleanguitar','warmpiano'][i-4])||
    catalog.find(item=>!item.isDrum);
  song.tracks.push({role:i%2?'texture':'countermelody',name:['切分吉他','节奏键盘','应答吉他','和声叠层'][i-4],instrument:instrument.id,volume:50,clips:[]});
 }
 const root=28+shift,third=major?4:3,sixth=mode==='minor'?8:9;
 const note=(midi,beat,duration,velocity)=>({midi,beat,duration,velocity});
 const sections=song.sections;
 song.title='切分律动草稿';
 song.summary=`${names[tonic]} ${{major:'大调',minor:'小调',dorian:'多利亚'}[mode]}。短促贝斯和底鼓交错，吉他或琴键反拍应答，副歌抬高主旋律。规则草稿可在钢琴帘继续修改。`;
 song.key={tonic,mode};
 for(const track of song.tracks){
  track.clips=[];
  for(const [sectionIndex,section] of sections.entries()){
   for(let offset=0;offset<section.bars;offset++){
    const bar=section.firstBar+offset,hook=sectionIndex===2,ending=bar===song.bars-1;
    const pickup=[0,5,3,7][(offset+(hook?1:0))%4],bassRoot=ending?root:root+pickup;
    const isTonic=bassRoot===root,chordThird=isTonic?third:pickup===7?5:4;
    let notes=[];
    if(track.role==='bass'){
     notes=(ending?[[0,0,1.5,.93],[2,0,1.8,.85]]:hook?[[0,0,.49,.94],[.75,12,.16,.7],[1.48,7,.26,.79],[2.25,0,.24,.86],[2.74,7,.23,.72],[3.5,0,.29,.83]]:[[0,0,.57,.9],[1.23,7,.19,.7],[1.75,12,.26,.82],[2.48,0,.45,.86],[3.52,7,.21,.74]])
       .map(([beat,degree,len,v])=>note(bassRoot+degree,beat,len,v));
    }else if(track.role==='drums'){
     notes=(hook?[0,.75,1.75,2.5,3.5]:[0,1.5,2.5]).map((beat,i)=>note(36,beat,.18,i===0?.96:.74));
     notes.push(note(38,1.02,.17,.9),note(38,3.02,.18,.95));
     if(hook&&offset%2===1)notes.push(note(38,3.75,.14,.48));
     for(let i=0;i<(ending?5:8);i++)notes.push(note(42,i*.5,.12,i%2?.65:.47));
     if(hook)notes.push(note(42,1.75,.09,.42),note(42,2.75,.1,.5));
    }else if(track.role==='melody'){
     const motif=ending?[[0,7,.45],[.75,5,.33],[1.5,third,.4],[2.25,0,1.5]]:
      hook?[[0,7,.32],[.5,12,.18],[.76,10,.17],[1.49,sixth,.38],[2.26,7,.25],[2.75,5,.19],[3.28,third,.48]]:
       offset%2?[[.53,third,.31],[1.25,7,.29],[2.52,5,.3],[3.28,2,.32]]:[[.76,0,.35],[1.5,third,.43],[2.76,7,.4]];
     notes=motif.map(([beat,pitch,len],i)=>note(root+36+pitch,beat,len,[.88,.72,.8,.67][i%4]));
    }else{
     const positions=ending?[0,2.25]:track.role==='harmony'?hook?[0,1.75,2.5]:[.51,2.51]:[1.25,3.48];
     notes=positions.flatMap((beat,i)=>[chordThird,7,isTonic?(major?11:10):12].map((degree,j)=>
       note(bassRoot+24+degree,beat+j*.008,ending?.9:track.role==='harmony'?.36:.15,(i%2?.61:.72)-j*.036)));
    }
    track.clips.push({startBar:bar,bars:1,repeat:1,notes});
   }
  }
 }
 return song;
}
