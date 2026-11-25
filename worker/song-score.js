// ScoreError messages go to the repair prompt and logs. Only include schema paths and rules.
export class ScoreError extends Error {}
const roles = ['melody', 'harmony', 'bass', 'drums', 'texture', 'countermelody'];
const limits = {attack:[5,1200], decay:[20,2000], sustain:[5,100], release:[80,3500], brightness:[300,9000], space:[0,100], drive:[0,100], lfoRateHz:[0,12], lfoDepthHz:[0,5000]};
const within = (v, lo, hi) => Number.isFinite(v) && v >= lo && v <= hi;
const integer = (v, lo, hi) => Number.isInteger(v) && within(v, lo, hi);
const list = (v, lo, hi) => Array.isArray(v) && within(v.length, lo, hi);
const text = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
function check(valid, field, rule) {
 if (!valid) throw new ScoreError(field + ': ' + rule);
}

export function validateSong(song, catalog, {singleTrack=false}={}) {
 check(text(song?.title,80), 'title', 'expected 1–80 characters');
 check(typeof song.summary === 'string' && song.summary.length <= 2000, 'summary', 'expected up to 2000 characters');
 check(within(song.bpm,50,160), 'bpm', 'expected 50–160');
 if(song.key!==undefined&&(!integer(song.key?.tonic,0,11)||!['major','minor','dorian'].includes(song.key?.mode)))delete song.key;
 check(integer(song.bars,singleTrack?1:16,singleTrack?32:64), 'bars', singleTrack?'expected 1–32 whole bars':'expected 16–64 whole bars');
 check(list(song.sections,singleTrack?1:3,singleTrack?1:12), 'sections', singleTrack?'expected one section':'expected 3–12 sections');
 let bar = 0;
 for (const [i, section] of song.sections.entries()) {
  const at = 'sections[' + i + ']';
  check(text(section?.name,40), at+'.name', 'expected a section name');
  check(section.firstBar === bar, at+'.firstBar', 'expected ' + bar);
  check(integer(section.bars,1,64), at+'.bars', 'expected positive whole bars');
  bar += section.bars;
 }
 check(bar === song.bars, 'sections', 'lengths must sum to bars');
 check(list(song.tracks,singleTrack?1:4,singleTrack?1:8), 'tracks', singleTrack?'expected one track':'expected 4–8 tracks');
 const instruments = new Map(catalog.map(x=>[x.id,x]));
 const counts = new Map();
 let total = 0;
 for (const [i,t] of song.tracks.entries()) {
  const at = 'tracks['+i+']';
  check(roles.includes(t?.role), at+'.role', 'unknown instrument role');
  check(text(t.name,60), at+'.name', 'expected 1–60 characters');
  check(instruments.has(t.instrument) && Boolean(instruments.get(t.instrument).isDrum) === (t.role === 'drums'), at+'.instrument', 'use a catalog ID matching the drum or pitched role');
  check(within(t.volume,0,100), at+'.volume', 'expected 0–100');
  t.volume = Math.max(40,t.volume);
  check(t.soundDesign === undefined || (typeof t.soundDesign === 'string' && t.soundDesign.length <= 240), at+'.soundDesign', 'expected up to 240 characters');
  if (t.params !== undefined) {
   check(t.params && typeof t.params === 'object' && !Array.isArray(t.params), at+'.params', 'expected parameter object');
   for (const [key,value] of Object.entries(t.params)) {
    check(Object.hasOwn(limits,key), at+'.params', 'unknown parameter');
    check(within(value,...limits[key]), at+'.params.'+key, 'outside '+limits[key].join('–'));
   }
  }
  check(list(t.clips,1,64), at+'.clips', 'expected 1–64 clips');
  for (const [j,c] of t.clips.entries()) {
   const clip = at+'.clips['+j+']';
   check(integer(c?.startBar,0,song.bars-1), clip+'.startBar', 'outside song');
   check(integer(c.bars,1,8), clip+'.bars', 'expected 1–8');
   check(integer(c.repeat,1,64) && c.startBar+c.bars*c.repeat <= song.bars, clip+'.repeat', 'repeats must fit inside song');
   check(list(c.notes,1,256), clip+'.notes', 'expected 1–256 notes');
   total += c.notes.length*c.repeat;
   counts.set(t.role,(counts.get(t.role)||0)+c.notes.length*c.repeat);
   check(total<=8192, 'tracks', 'more than 8192 expanded notes');
   for (const [k,n] of c.notes.entries()) {
    const note = clip+'.notes['+k+']';
    check(integer(n?.midi,0,127), note+'.midi', 'expected MIDI integer 0–127');
    check(Number.isFinite(n.beat) && n.beat>=0 && n.beat<c.bars*4, note+'.beat', 'use clip-relative beats');
    check(within(n.duration,1/64,64) && n.beat+n.duration <= c.bars*4+.001, note+'.duration', 'note must end within its clip');
    check(within(n.velocity,.05,1), note+'.velocity', 'expected 0.05–1');
   }
  }
 }
 if(singleTrack)return song;
 for (const [role,min] of Object.entries({melody:8,harmony:4,bass:8,drums:12})) {
  check((counts.get(role)||0)>=min,'tracks.'+role,'needs at least '+min+' expanded notes');
 }
 check(total>=40,'tracks','needs at least 40 expanded notes');
 return song;
}

// Normalize only unambiguous representations and playable note tails.
export function normalizeScore(song,catalog) {
 if (!list(song?.tracks,1,8)) return song;
 if (list(song.sections,3,12) && song.sections.every(s=>integer(s?.bars,1,64)) && song.sections.reduce((sum,s)=>sum+s.bars,0)===song.bars) {
  let bar=0;
  for (const section of song.sections) {section.firstBar=bar; bar+=section.bars;}
 }
 for (const t of song.tracks) {
  if (!list(t?.clips,1,64)) continue;
  if (!catalog.some(x=>x.id===t.instrument)) {
   const matches=catalog.filter(x=>x.name===t.instrument && Boolean(x.isDrum)===(t.role==='drums'));
   if(matches.length===1)t.instrument=matches[0].id;
  }
  for (const c of t.clips) {
   if (!integer(c?.bars,1,8) || !list(c.notes,1,256)) continue;
   for (const n of c.notes) {
    if (!n || typeof n !== 'object') continue;
    if (integer(n.velocity,2,127)) n.velocity=Math.max(.05,n.velocity/127);
    if (within(n.beat,0,c.bars*4-1/64) && within(n.duration,1/64,64)) n.duration=Math.min(n.duration,c.bars*4-n.beat);
   }
  }
 }
 return song;
}
