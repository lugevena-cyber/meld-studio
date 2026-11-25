// Instrument presets shared by synthesis and recorded-sample engines.
const EXTRA_SOUND_SPECS = [
  ['bass','指弹贝斯','FINGER BASS','圆润低频 · 指弹触弦','#91ceb2',[8,220,35,180,1500,3,3], [['triangle',1,.7],['sine',1,.35],['sine',2,.13]]],
  ['pickedbass','拨片贝斯','PICKED BASS','清晰拨弦 · 颗粒低频','#aacd85',[5,160,28,150,2700,4,12], [['sawtooth',1,.32],['triangle',1,.5],['sine',2,.15]]],
  ['uprightbass','立式贝斯','UPRIGHT BASS','木质共鸣 · 温暖低音','#c7aa7c',[14,480,17,260,1100,10,0], [['triangle',1,.7],['sine',2,.2],['sine',3,.07]]],
  ['epiano','电钢琴','ELECTRIC PIANO','柔和钟鸣 · 复古琴键','#e9ca91',[6,700,18,800,3800,22,3], [['sine',1,.7],['sine',2,.25],['sine',3.99,.12]]],
  ['organ','风琴','DRAWBAR ORGAN','泛音叠加 · 绵长延音','#c8b8e8',[12,80,85,180,5200,20,5], [['sine',.5,.3],['sine',1,.55],['sine',2,.3],['sine',3,.16],['sine',4,.09]]],
  ['flute','长笛','FLUTE','清透气息 · 轻柔高音','#a8d4d8',[65,160,74,240,3400,24,0], [['sine',1,.8],['sine',2,.1],['sine',3,.035]]],
  ['clarinet','单簧管','CLARINET','木管共鸣 · 柔和奇次泛音','#d3b88d',[45,160,66,220,2800,16,0], [['sine',1,.7],['sine',3,.23],['sine',5,.1],['sine',7,.04]]],
  ['trumpet','小号','TRUMPET','明亮铜管 · 结实起音','#ebca70',[65,190,68,230,3900,18,8], [['sawtooth',1,.42],['sine',1,.4],['sine',2,.17]]],
  ['vibraphone','颤音琴','VIBRAPHONE','金属钟鸣 · 漫长余韵','#a8c8e7',[5,900,8,1500,6500,30,0], [['sine',1,.8],['sine',3.98,.18],['sine',10,.025]]],
  ['marimba','马林巴','MARIMBA','木质敲击 · 轻快弹跳','#e3ad86',[5,280,5,300,3000,12,0], [['sine',1,.8],['sine',4,.18],['sine',9,.05]]],
  ['harp','竖琴','HARP','清亮拨弦 · 流动琶音','#e9d7aa',[5,580,8,1100,5100,27,0], [['triangle',1,.55],['sine',2,.25],['sine',3,.1],['sine',4,.06]]],
  ['pad','氛围铺底','AMBIENT PAD','缓慢起音 · 宽阔声场','#b8b2e3',[800,1000,77,2200,1800,58,2], [['sawtooth',1,.24,-9],['sawtooth',1,.24,9],['triangle',.5,.25],['sine',2,.1]]],
];
const EXTRA_INSTRUMENTS = EXTRA_SOUND_SPECS.map(([id,name,en,desc,color],i)=>({
  id,name,en,desc,color,
  icon: i < 3 ? '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="m18 3 6 6-11 11-6-6L18 3Z"/><path d="M8 13c-5-1-7 4-4 8s8 4 10-1M17 6l5 5M6 20l12-12M9 23 21 11"/></svg>' : '<svg viewBox="0 0 28 28" aria-hidden="true"><rect x="3" y="6" width="22" height="17" rx="3"/><path d="M8 11v7M14 9v11M20 12v5M4 4h20"/></svg>'
}));
const EXTRA_LAB_DEFAULTS = Object.fromEntries(EXTRA_SOUND_SPECS.map(([id,,,,,p])=>[id,Object.fromEntries(['attack','decay','sustain','release','brightness','space','drive'].map((k,i)=>[k,p[i]]))]));
const EXTRA_VOICE_MAP = Object.fromEntries(EXTRA_SOUND_SPECS.map(([id,,,,,,voices])=>[id,voices.map(([type,ratio,gain,detune=0])=>({type,ratio,gain,detune}))]));

// Applied only to fresh automatic recognition, never to manual edits or keyboard takes.
function makeMonophonicNotes(input) {
  const notes = input.map(note=>({...note})).sort((a,b)=>a.start-b.start || (b.confidence||0)-(a.confidence||0));
  const result = [];
  for (const note of notes) {
    if (!Number.isFinite(note.midi) || !Number.isFinite(note.start) || !Number.isFinite(note.duration) || note.duration <= 0) continue;
    const previous = result[result.length-1];
    if (previous && previous.start === note.start) continue;
    if (previous && previous.start+previous.duration > note.start) previous.duration = note.start-previous.start;
    result.push(note);
  }
  return result.filter(note=>note.duration >= .025);
}
// Original Funk / Pop presets. Sample-marked instruments use bundled single-note recordings.
const FUNK_POP_SPECS = [
 ['cleanguitar','清音节奏吉他','CLEAN RHYTHM GUITAR','明亮切分 · 干净拨弦','#d5e6b5',[5,180,17,180,4800,9,2],[['triangle',1,.6],['sine',2,.25],['sine',3,.13],['sine',4,.07]]],
 ['mutedguitar','闷音 Funk 吉他','MUTED FUNK GUITAR','短促制音 · 紧凑律动','#d8cb91',[5,80,5,90,3400,4,6],[['sawtooth',1,.28],['triangle',1,.5],['sine',2,.2]]],
 ['wideguitar','宽幅清音吉他','WIDE CLEAN GUITAR','错调叠层 · 立体空间','#94d7d2',[8,360,32,620,4200,38,3],[['triangle',1,.4,-7],['triangle',1,.4,7],['sine',2,.14]]],
 ['rockguitar','摇滚主奏吉他','ROCK LEAD GUITAR','厚实驱动 · 延音独奏','#f59b76',[8,220,69,480,3300,22,44],[['sawtooth',1,.43,-5],['sawtooth',1,.3,6],['square',.5,.08]]],
 ['brightpiano','明亮流行钢琴','BRIGHT POP PIANO','清晰起音 · 穿透混音','#eee2ad',[5,470,23,650,7200,12,1],[['sine',1,.67],['triangle',2,.22],['sine',3,.14],['sine',4.01,.07]]],
 ['warmpiano','温暖抒情钢琴','WARM GRAND PIANO','柔和击弦 · 温暖尾音','#dfc7af',[12,900,25,1300,2400,25,0],[['sine',1,.78],['sine',2,.21],['triangle',3,.055]]],
 ['fmkeys','数字电钢琴','DIGITAL FM KEYS','金属琴槌 · 80s 颗粒','#b3d8ec',[5,600,22,950,6200,24,0],[['sine',1,.72],['sine',2,.11]]],
 ['clav','Funk 击弦键盘','FUNK CLAV','短促颗粒 · 弹性切分','#b9d598',[5,170,8,140,4900,7,8],[['sawtooth',1,.25],['triangle',2,.3],['sine',3,.19],['sine',4,.09]]],
 ['digitalbell','数字钟鸣','DIGITAL BELL','清亮敲击 · 星点余韵','#a8dfe1',[5,850,5,1500,7800,40,0],[['sine',1,.7],['sine',2.76,.13]]],
 ['synthbrass','短刺合成铜管','SYNTH BRASS STAB','饱满齐奏 · 锐利切口','#e7bd73',[22,190,32,220,4600,13,9],[['sawtooth',1,.34,-4],['sawtooth',1,.34,4],['square',1,.1]]],
];
FUNK_POP_SPECS.forEach(([id,name,en,desc,color,params,voices])=>{
 EXTRA_INSTRUMENTS.push({id,name,en,desc,color,icon:'<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M4 20V8h20v12H4ZM9 8v12M14 8v12M19 8v12M4 5h20"/></svg>'});
 EXTRA_LAB_DEFAULTS[id]=Object.fromEntries(['attack','decay','sustain','release','brightness','space','drive'].map((key,index)=>[key,params[index]]));
 EXTRA_VOICE_MAP[id]=voices.map(([type,ratio,gain,detune=0])=>({type,ratio,gain,detune}));
});
const EXTRA_LAB_PRESETS = [
 ['tight-funk','mutedguitar','切分闷音吉他','80s FUNK · TIGHT RHYTHM'],
 ['night-clean','cleanguitar','夜色清音吉他','80s POP · CLEAN GROOVE'],
 ['wide-clean','wideguitar','宽幅闪烁吉他','80s POP · WIDE CLEAN'],
 ['rock-lead','rockguitar','舞台摇滚主奏','ROCK · SUSTAIN LEAD'],
 ['pop-piano','brightpiano','明亮流行琴键','POP · BRIGHT PIANO'],
 ['warm-ballad','warmpiano','温暖抒情琴键','BALLAD · WARM GRAND'],
 ['digital-keys','fmkeys','舞池数字电钢','80s POP · DIGITAL TINES'],
 ['clav-groove','clav','弹性 Funk 键盘','FUNK · CLAV GROOVE'],
 ['bell-intro','digitalbell','星光钟鸣引子','80s POP · BELL TEXTURE'],
 ['brass-stab','synthbrass','舞池铜管短刺','FUNK · BRASS STAB'],
 ['finger-groove','bass','紧实指弹贝斯','FUNK · FINGER BASS'],
].map(([id,instrument,name,meta])=>({id,instrument,name,meta,short:meta.split('·')[1].trim(),params:EXTRA_LAB_DEFAULTS[instrument]}));

function instrumentSelectOptions() {
 const families={dx7:'Yamaha DX7 · 原厂 FM',source:'原曲采样音色库',guitar:'吉他细分',keys:'钢琴与键盘',bass:'贝斯',orchestra:'管弦乐',synth:'合成器',drums:'鼓组与鼓机',custom:'我的音色'};
 const family=id=>['electric','acoustic','cleanguitar','mutedguitar','wideguitar','rockguitar'].includes(id)?'guitar':['piano','epiano','brightpiano','warmpiano','fmkeys','organ','clav','vibraphone','marimba','harp','digitalbell'].includes(id)?'keys':['bass','pickedbass','uprightbass'].includes(id)?'bass':isDrumInstrument(id)?'drums':['synth','pad','synthbrass'].includes(id)?'synth':'orchestra';
 const items=getAllInstrumentDefinitions();
 return Object.entries(families).map(([key,label])=>{
  const group=items.filter(item=>(item.dx7?'dx7':item.recordedSource?'source':item.custom?'custom':family(item.id))===key);
  return group.length?`<optgroup label="${label}">${group.map(item=>`<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)} · ${isSampledInstrument(item.baseInstrument||item.id)?"采样":"合成"}</option>`).join('')}</optgroup>`:'';
 }).join('');
}
