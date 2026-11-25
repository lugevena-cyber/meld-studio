// A single entry exposes each bundled sample in the library and all instrument pickers.
const openSamples = [
  {
    file: "upright-piano-c4.ogg",
    rootMidi: 60,
    name: "立式钢琴",
    category: "keys",
    detail: "C4 · 力度层 3 · OGG",
    use: "和弦或旋律",
    source: "Meta Open Sound",
    url: "https://github.com/facebookincubator/Meta-open-sound/releases/tag/meta-piano-v1.0.0",
    keywords: "piano 钢琴 琴键"
  },
  {
    file: "steel-guitar-a3.ogg",
    rootMidi: 57,
    name: "钢弦木吉他",
    category: "guitar",
    detail: "A3 · 力度层 1 · OGG",
    use: "切分节奏",
    source: "Meta Open Sound",
    url: "https://github.com/facebookincubator/Meta-open-sound/releases/tag/meta-steel-guitar-v1.0.0",
    keywords: "steel acoustic guitar 拨弦"
  },
  {
    file: "thick-synth-bass-c.flac",
    rootMidi: 36,
    name: "厚声合成贝斯",
    category: "bass",
    detail: "根音 C · FLAC",
    use: "低音动机",
    source: "Sample Pi / ani_music",
    url: "https://freesound.org/s/165314/",
    keywords: "synth bass 低频 放克 funk 切分"
  },
  {
    file: "heavy-kick.flac",
    name: "重底鼓",
    category: "drums",
    detail: "单击 · FLAC",
    use: "低频重拍",
    source: "Sample Pi / Zajo",
    url: "https://github.com/alex-esc/sample-pi/blob/f14596be37abf227bf77d198c9b0b60d9eb4dca9/drums/one-shots/kick/drum_heavy_kick.flac",
    keywords: "heavy kick drum 鼓组 鼓点"
  },
  {
    file: "hard-snare.flac",
    name: "重击军鼓",
    category: "drums",
    detail: "单击 · FLAC",
    use: "二、四拍反拍",
    source: "Sample Pi / menegass",
    url: "https://github.com/alex-esc/sample-pi/blob/f14596be37abf227bf77d198c9b0b60d9eb4dca9/drums/one-shots/snare/drum_snare_hard.flac",
    keywords: "hard snare drum 鼓组 小军鼓"
  },
  {
    file: "closed-hi-hat.flac",
    name: "闭合踩镲",
    category: "drums",
    detail: "单击 · FLAC",
    use: "八分或十六分音符律动",
    source: "Sample Pi / menegass",
    url: "https://freesound.org/s/100053/",
    keywords: "closed hat hihat cymbal hi-hat 鼓组 放克 funk"
  },
  {
    file: "tr808-rimshot.wav",
    name: "TR-808 边击",
    category: "drums",
    detail: "单击 · WAV · 44.1 kHz",
    use: "短切分与句尾应答",
    source: "Michael Fischer / Technopolis · TidalCycles",
    url: "https://github.com/tidalcycles/sounds-tr808-fischer/blob/main/rs8/RS.WAV",
    keywords: "rimshot 808 边击"
  },
  {
    file: "tr808-clap.wav",
    name: "TR-808 拍手",
    category: "drums",
    detail: "单击 · WAV · 44.1 kHz",
    use: "反拍与叠加军鼓",
    source: "Michael Fischer / Technopolis · TidalCycles",
    url: "https://github.com/tidalcycles/sounds-tr808-fischer/blob/main/cp8/CP.WAV",
    keywords: "clap 808 拍手"
  },
  {
    file: "tr808-open-hat.wav",
    name: "TR-808 开镲",
    category: "drums",
    detail: "单击 · WAV · 44.1 kHz",
    use: "反拍与过门",
    source: "Michael Fischer / Technopolis · TidalCycles",
    url: "https://github.com/tidalcycles/sounds-tr808-fischer/blob/main/oh8/OH50.WAV",
    keywords: "open hat 808 开镲"
  },
  {
    file: "ambient-drone.flac",
    name: "持续氛围音",
    category: "ambient",
    detail: "持续音 · FLAC",
    use: "段落留白与过渡",
    source: "Sample Pi / Autistic Lucario",
    url: "https://freesound.org/s/195341/",
    keywords: "ambient drone pad 铺底 背景"
  }
];

const openSampleBanks = new Map();
const openSampleFamilies = { keys: "keys", guitar: "strings", bass: "bass", drums: "drums", ambient: "other" };
for (const sample of openSamples) {
  sample.id = "sample-" + sample.file.replace(/\.[^.]+$/, "");
  EXTRA_INSTRUMENTS.push({
    id: sample.id, name: sample.name, en: sample.keywords, desc: sample.use, color: "#b3a8ff",
    icon: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M5 11v6m6-10v14m6-17v20m6-13v6"/></svg>',
    sampleFamily: openSampleFamilies[sample.category], recordedSource: true,
    samplePack: sample.source.startsWith("Michael Fischer /") ? "Fischer TR-808" : sample.source.split(" / ")[0],
  });
  EXTRA_LAB_DEFAULTS[sample.id] = { attack: 5, decay: 150, sustain: 92, release: 150, brightness: 8000, space: 0, drive: 0 };
  openSampleBanks.set(sample.id, { sample, contexts: new WeakMap() });
}

function openSampleReady(id, context) {
  return Boolean(openSampleBanks.get(id)?.contexts.get(context)?.buffer);
}

async function prepareOpenSample(id, context) {
  const bank = openSampleBanks.get(id);
  const existing = bank.contexts.get(context);
  if (existing) return existing.promise;
  const entry = {};
  bank.contexts.set(context, entry);
  entry.promise = (async () => {
    const file = bank.sample.file;
    const bytes = await fetchArrangementSample("open-samples/" + encodeURIComponent(file), file, 10000);
    entry.buffer = await context.decodeAudioData(bytes);
  })().catch(error => {
    bank.contexts.delete(context);
    throw error;
  });
  return entry.promise;
}

function scheduleOpenSample(id, midi, when, duration, params, destination, volume) {
  const bank = openSampleBanks.get(id);
  const context = destination.context;
  const buffer = bank.contexts.get(context)?.buffer;
  if (!buffer) throw new Error("采样尚未准备好，请重试。");
  const { rootMidi, category } = bank.sample;
  const oneShot = category === "drums";
  return window.MeldSourceInstruments.makeVoice(context, buffer, rootMidi ?? midi, midi, when, duration, destination, volume * (oneShot ? 0.48 : 0.8), oneShot, params);
}
