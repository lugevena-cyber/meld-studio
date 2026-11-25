const NOTE_NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
const NOTE_NAMES_FLAT = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
const SCALE_STEPS = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
};

const INSTRUMENTS = [
  ...EXTRA_INSTRUMENTS,
  {
    id: "electric",
    name: "电吉他",
    en: "ELECTRIC GUITAR",
    desc: "温暖失真 · 轻延迟",
    color: "#ff8055",
    icon: `
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path d="m17.8 4.2 5.7 5.7-8.8 8.8-5.7-5.7 8.8-8.8Z"/>
        <path d="M9.3 13.3c-2.8-1.3-5.8.9-5.1 3.8.4 1.6 2.1 2.2 2.8 3.7.9 2 2.1 3.3 4.1 2.5 2-.8 3.4-3.6 3-5.7"/>
        <path d="m15.1 10.5 2.4 2.4M17.4 8.2l2.4 2.4"/>
      </svg>`,
  },
  {
    id: "acoustic",
    name: "木吉他",
    en: "ACOUSTIC GUITAR",
    desc: "指弹触弦 · 木质感",
    color: "#e8cf79",
    icon: `
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path d="m17.6 4.3 5.8 5.8-7.1 7.1-5.8-5.8 7.1-7.1Z"/>
        <path d="M11.1 12.1c-2.7-.8-5.7 1.5-4.9 4.5.3 1.1 1.1 1.8 1.6 2.9.6 1.3 1.2 2.7 2.6 3.2 1.6.6 3.5-.5 4.4-2.2 1-2 .6-3.3.7-5.1"/>
        <circle cx="12.4" cy="19.2" r="1.8"/>
        <path d="m15.1 10.1 2.4 2.4M17.5 7.7l2.4 2.4"/>
      </svg>`,
  },
  {
    id: "piano",
    name: "三角钢琴",
    en: "GRAND PIANO",
    desc: "真实采样 · 自然琴弦余韵",
    color: "#f4f0e7",
    icon: `
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path d="M3.5 7.5h21v15h-21z"/>
        <path d="M9.5 7.5v10M15.5 7.5v10M21 7.5v10M3.5 17.5h21"/>
        <path d="M7.9 7.5v6.5h1.9V7.5m4.1 0v6.5h1.9V7.5m4.2 0v6.5H22V7.5"/>
      </svg>`,
  },
  {
    id: "sax",
    name: "萨克斯",
    en: "ALTO SAX",
    desc: "呼吸感 · 微颤音",
    color: "#ff8055",
    icon: `
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path d="M9 4.5h7v3c0 5-1.3 8.5-4.3 11.6-1.7 1.8-1.2 5 1.2 5 3.6 0 5.6-3.3 5.6-6.5"/>
        <path d="M12 5v5.2M15.5 4.5v4.7M6.6 9.5H9M6.8 12.4H9M7.4 15.3h1.4"/>
        <path d="M16.6 13.6c3.2.5 5 2.2 5.2 4.7"/>
      </svg>`,
  },
  {
    id: "strings",
    name: "弦乐",
    en: "STRING ENSEMBLE",
    desc: "辽阔弓弦 · 长起音",
    color: "#8ed8bd",
    icon: `
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path d="M8.5 6.2c-2.5 3.6-2.5 12 0 15.6M13.2 4.8c-3 4.6-3 13.8 0 18.4M18 6.2c2.5 3.6 2.5 12 0 15.6M22.7 8.1c1.8 2.7 1.8 9.1 0 11.8"/>
        <path d="M5.5 10.3v7.4M25.5 10.3v7.4"/>
      </svg>`,
  },
  {
    id: "synth",
    name: "合成器",
    en: "ANALOG SYNTH",
    desc: "霓虹滤波 · 未来感",
    color: "#c6ed8f",
    icon: `
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <rect x="3.5" y="6" width="21" height="16" rx="2"/>
        <path d="M8 10v4M8 17v1M14 10v2M14 15v3M20 10v7M20 19v.1"/>
        <circle cx="8" cy="15.5" r="1.5"/><circle cx="14" cy="13.5" r="1.5"/><circle cx="20" cy="18.2" r="1.5"/>
      </svg>`,
  },
];

const LAB_DEFAULTS = {
  ...EXTRA_LAB_DEFAULTS,
  electric: {
    attack: 22,
    decay: 240,
    sustain: 42,
    release: 700,
    brightness: 2800,
    space: 18,
    drive: 24,
  },
  acoustic: {
    attack: 8,
    decay: 420,
    sustain: 30,
    release: 800,
    brightness: 4200,
    space: 10,
    drive: 0,
  },
  piano: {
    attack: 5,
    decay: 650,
    sustain: 26,
    release: 420,
    brightness: 6400,
    space: 8,
    drive: 0,
  },
  sax: {
    attack: 75,
    decay: 500,
    sustain: 60,
    release: 950,
    brightness: 3100,
    space: 20,
    drive: 12,
  },
  strings: {
    attack: 580,
    decay: 900,
    sustain: 72,
    release: 1800,
    brightness: 1900,
    space: 42,
    drive: 0,
  },
  synth: {
    attack: 35,
    decay: 320,
    sustain: 54,
    release: 1200,
    brightness: 5600,
    space: 25,
    drive: 31,
  },
};

const LAB_PRESETS = [
  ...EXTRA_LAB_PRESETS,
  {
    id: "night-drive",
    instrument: "electric",
    name: "夜航电吉他",
    meta: "ELECTRIC · WARM DRIVE",
    short: "温暖失真",
    params: LAB_DEFAULTS.electric,
  },
  {
    id: "old-wood",
    instrument: "acoustic",
    name: "旧木屋",
    meta: "ACOUSTIC · SOFT PICK",
    short: "木质指弹",
    params: { ...LAB_DEFAULTS.acoustic, brightness: 3500, space: 17 },
  },
  {
    id: "vinyl-keys",
    instrument: "piano",
    name: "黑胶钢琴",
    meta: "PIANO · DUSTY ROOM",
    short: "复古颗粒",
    params: { ...LAB_DEFAULTS.piano, brightness: 2500, release: 1300, space: 14 },
  },
  {
    id: "midnight-sax",
    instrument: "sax",
    name: "午夜萨克斯",
    meta: "SAX · CLOSE MIC",
    short: "呼吸与颤音",
    params: { ...LAB_DEFAULTS.sax, attack: 110, release: 1400, space: 30 },
  },
  {
    id: "tide-strings",
    instrument: "strings",
    name: "潮汐弦乐",
    meta: "STRINGS · WIDE HALL",
    short: "辽阔弓弦",
    params: { ...LAB_DEFAULTS.strings, attack: 950, release: 2600, space: 62 },
  },
  {
    id: "neon-analog",
    instrument: "synth",
    name: "霓虹合成器",
    meta: "SYNTH · POLY SAW",
    short: "未来滤波",
    params: { ...LAB_DEFAULTS.synth, drive: 46, space: 36 },
  },
];

const PROJECT_STORAGE_KEY = "meld.projects.v1";
const LAB_STORAGE_KEY = "meld.lab.settings.v1";
const CUSTOM_PATCHES_STORAGE_KEY = "meld.custom-patches.v1";
const ARRANGEMENT_STORAGE_KEY = "meld.arrangement.v1";
const LAB_KEY_MAP = {
  a: 60,
  w: 61,
  s: 62,
  e: 63,
  d: 64,
  f: 65,
  t: 66,
  g: 67,
  y: 68,
  h: 69,
  u: 70,
  j: 71,
  k: 72,
};

const state = {
  currentView: "studio",
  instrument: "piano",
  view: "pitch",
  scaleSnap: false,
  notesEdited: false,
  activeProjectId: null,
  samples: [],
  notes: [],
  key: null,
  duration: 8,
  audioBuffer: null,
  audioBlob: null,
  audioUrl: null,
  sourceName: "",
  sourceType: "",
  recognitionProfile: "vocal",
  analysisProfile: null,
  recognitionOnsetFirst: false,
  analysisOnsetFirst: null,
  rhythmHits: [],
  isRecording: false,
  isPreviewingSource: false,
  isPlaying: false,
  isAnalyzing: false,
  loop: false,
  metronome: false,
  playStartedAt: 0,
  playStartOffset: 0,
  playNodes: [],
  playTimer: null,
  demoMode: false,
};

const els = {
  headerKey: document.getElementById("headerKey"),
  headerKeyNote: document.getElementById("headerKeyNote"),
  keyConfidenceDial: document.getElementById("keyConfidenceDial"),
  keySummary: document.getElementById("keySummary"),
  instrumentCards: document.getElementById("instrumentCards"),
  melodyCanvas: document.getElementById("melodyCanvas"),
  canvasEmpty: document.getElementById("canvasEmpty"),
  pitchViewBtn: document.getElementById("pitchViewBtn"),
  waveViewBtn: document.getElementById("waveViewBtn"),
  stageStateText: document.getElementById("stageStateText"),
  stageDetail: document.getElementById("stageDetail"),
  liveStatus: document.querySelector(".live-status"),
  scaleSnapBtn: document.getElementById("scaleSnapBtn"),
  canvasScaleRail: document.getElementById("canvasScaleRail"),
  liveNote: document.getElementById("liveNote"),
  noteName: document.getElementById("noteName"),
  noteOctave: document.getElementById("noteOctave"),
  noteCents: document.getElementById("noteCents"),
  durationLabel: document.getElementById("durationLabel"),
  playBtn: document.getElementById("playBtn"),
  playLabel: document.getElementById("playLabel"),
  playSubLabel: document.getElementById("playSubLabel"),
  tempoInput: document.getElementById("tempoInput"),
  loopBtn: document.getElementById("loopBtn"),
  metronomeBtn: document.getElementById("metronomeBtn"),
  recordBtn: document.getElementById("recordBtn"),
  recordLabel: document.getElementById("recordLabel"),
  recordTime: document.getElementById("recordTime"),
  recordZone: document.querySelector(".record-zone"),
  levelMeter: document.getElementById("levelMeter"),
  uploadBtn: document.getElementById("uploadBtn"),
  audioInput: document.getElementById("audioInput"),
  sourcePlayer: document.getElementById("sourcePlayer"),
  sourceAudio: document.getElementById("sourceAudio"),
  sourcePlayBtn: document.getElementById("sourcePlayBtn"),
  sourceDeleteBtn: document.getElementById("sourceDeleteBtn"),
  sourceFileName: document.getElementById("sourceFileName"),
  sourceFileMeta: document.getElementById("sourceFileMeta"),
  processingSteps: document.getElementById("processingSteps"),
  keyName: document.getElementById("keyName"),
  scaleName: document.getElementById("scaleName"),
  keyFriendly: document.getElementById("keyFriendly"),
  scaleNotes: document.getElementById("scaleNotes"),
  noteCount: document.getElementById("noteCount"),
  rangeStat: document.getElementById("rangeStat"),
  confidenceStat: document.getElementById("confidenceStat"),
  relatedKey: document.getElementById("relatedKey"),
  analysisStatus: document.getElementById("analysisStatus"),
  analysisPanel: document.getElementById("analysisPanel"),
  demoBtn: document.getElementById("demoBtn"),
  exportBtn: document.getElementById("exportBtn"),
  helpBtn: document.getElementById("helpBtn"),
  helpDialog: document.getElementById("helpDialog"),
  helpCloseBtn: document.getElementById("helpCloseBtn"),
  toast: document.getElementById("toast"),
  cloudStatus: document.getElementById("cloudStatus"),
  authBtn: document.getElementById("authBtn"),
  authDialog: document.getElementById("authDialog"),
  authTitle: document.getElementById("authTitle"),
  authCopy: document.getElementById("authCopy"),
  authTabs: document.querySelector(".auth-tabs"),
  authForm: document.getElementById("authForm"),
  authEmailInput: document.getElementById("authEmailInput"),
  authPasswordInput: document.getElementById("authPasswordInput"),
  authMessage: document.getElementById("authMessage"),
  authSubmitBtn: document.getElementById("authSubmitBtn"),
  authCancelBtn: document.getElementById("authCancelBtn"),
  authCloseBtn: document.getElementById("authCloseBtn"),
  authLogoutBtn: document.getElementById("authLogoutBtn"),
  studioView: document.getElementById("studioView"),
  worksView: document.getElementById("worksView"),
  labView: document.getElementById("labView"),
  saveProjectBtn: document.getElementById("saveProjectBtn"),
  worksSaveBtn: document.getElementById("worksSaveBtn"),
  worksNewBtn: document.getElementById("worksNewBtn"),
  projectGrid: document.getElementById("projectGrid"),
  projectEmpty: document.getElementById("projectEmpty"),
  projectSearch: document.getElementById("projectSearch"),
  projectTotal: document.getElementById("projectTotal"),
  projectNotesTotal: document.getElementById("projectNotesTotal"),
  projectLatest: document.getElementById("projectLatest"),
  libraryStorageCopy: document.getElementById("libraryStorageCopy"),
  emptyBackBtn: document.getElementById("emptyBackBtn"),
  emptyDemoBtn: document.getElementById("emptyDemoBtn"),
  projectDialog: document.getElementById("projectDialog"),
  projectDialogTitle: document.getElementById("projectDialogTitle"),
  projectDialogCloseBtn: document.getElementById("projectDialogCloseBtn"),
  projectForm: document.getElementById("projectForm"),
  projectNameInput: document.getElementById("projectNameInput"),
  projectMemoInput: document.getElementById("projectMemoInput"),
  projectFormSummary: document.getElementById("projectFormSummary"),
  projectCancelBtn: document.getElementById("projectCancelBtn"),
  projectSubmitBtn: document.getElementById("projectSubmitBtn"),
  deleteDialog: document.getElementById("deleteDialog"),
  deleteDialogTitle: document.getElementById("deleteDialogTitle"),
  deleteDialogCopy: document.getElementById("deleteDialogCopy"),
  deleteCancelBtn: document.getElementById("deleteCancelBtn"),
  deleteConfirmBtn: document.getElementById("deleteConfirmBtn"),
  labInstrumentList: document.getElementById("labInstrumentList"),
  labKeyboard: document.getElementById("labKeyboard"),
  labCanvas: document.getElementById("labCanvas"),
  labPresetName: document.getElementById("labPresetName"),
  labPresetMeta: document.getElementById("labPresetMeta"),
  labNoteReadout: document.getElementById("labNoteReadout"),
  labStatusText: document.getElementById("labStatusText"),
  labArpBtn: document.getElementById("labArpBtn"),
  labResetBtn: document.getElementById("labResetBtn"),
  labSavePresetBtn: document.getElementById("labSavePresetBtn"),
  labPresetGrid: document.getElementById("labPresetGrid"),
  attackControl: document.getElementById("attackControl"),
  decayControl: document.getElementById("decayControl"),
  sustainControl: document.getElementById("sustainControl"),
  releaseControl: document.getElementById("releaseControl"),
  brightnessControl: document.getElementById("brightnessControl"),
  spaceControl: document.getElementById("spaceControl"),
  driveControl: document.getElementById("driveControl"),
  attackValue: document.getElementById("attackValue"),
  decayValue: document.getElementById("decayValue"),
  sustainValue: document.getElementById("sustainValue"),
  releaseValue: document.getElementById("releaseValue"),
  brightnessValue: document.getElementById("brightnessValue"),
  spaceValue: document.getElementById("spaceValue"),
  driveValue: document.getElementById("driveValue"),
  myPatchGrid: document.getElementById("myPatchGrid"),
  myPatchEmpty: document.getElementById("myPatchEmpty"),
  patchDialog: document.getElementById("patchDialog"),
  patchDialogCloseBtn: document.getElementById("patchDialogCloseBtn"),
  patchForm: document.getElementById("patchForm"),
  patchNameInput: document.getElementById("patchNameInput"),
  patchFormSummary: document.getElementById("patchFormSummary"),
  patchCancelBtn: document.getElementById("patchCancelBtn"),
  arrangementView: document.getElementById("arrangementView"),
  arrangePlayBtn: document.getElementById("arrangePlayBtn"),
  arrangeTime: document.getElementById("arrangeTime"),
  arrangeStatus: document.getElementById("arrangeStatus"),
  arrangementTempoInput: document.getElementById("arrangementTempoInput"),
  arrangeMetronomeBtn: document.getElementById("arrangeMetronomeBtn"),
  arrangementTrackCount: document.getElementById("arrangementTrackCount"),
  arrangementNoteCount: document.getElementById("arrangementNoteCount"),
  arrangementLength: document.getElementById("arrangementLength"),
  arrangementTrackHeaders: document.getElementById("arrangementTrackHeaders"),
  arrangementRuler: document.getElementById("arrangementRuler"),
  arrangementLanes: document.getElementById("arrangementLanes"),
  arrangementPlayhead: document.getElementById("arrangementPlayhead"),
  arrangementEmpty: document.getElementById("arrangementEmpty"),
  arrangementEmptyAddBtn: document.getElementById("arrangementEmptyAddBtn"),
  addTrackBtn: document.getElementById("addTrackBtn"),
  arrangeAutoFillBtn: document.getElementById("arrangeAutoFillBtn"),
  arrangeBackStudioBtn: document.getElementById("arrangeBackStudioBtn"),
  trackDialog: document.getElementById("trackDialog"),
  trackDialogCloseBtn: document.getElementById("trackDialogCloseBtn"),
  trackDialogTitle: document.getElementById("trackDialogTitle"),
  trackDialogCopy: document.getElementById("trackDialogCopy"),
  trackInstrumentSearch: document.getElementById("trackInstrumentSearch"),
  trackInstrumentStatus: document.getElementById("trackInstrumentStatus"),
  trackInstrumentChoices: document.getElementById("trackInstrumentChoices"),
};

let audioContext = null;
let analyser = null;
let microphoneStream = null;
let mediaRecorder = null;
let isRequestingMicrophone = false;
let recordedChunks = [];
let sourceNode = null;
let animationFrame = null;
let frameTimer = null;
let recordStartedAt = 0;
let lastPitchAt = 0;
let smoothedPitch = null;
let currentRms = 0;
let currentPitch = null;
let livePitchBusy=false,livePitchGeneration=0,lastLiveDetection=0;
let livePitchBuffer=null;
let fallbackPitchTracker=null;
let pendingDisplayMidi=null;
let liveWaveImage = null;
let projects = [];
let projectPreview = null;
let projectFilter = "all";
let projectDialogMode = "save";
let editingProjectId = null;
let pendingDeleteProjectId = null;
let pendingDeletePatchId = null;
let deleteDialogMode = "project";
let labState = {
  instrument: "electric",
  params: { ...LAB_DEFAULTS.electric },
  presetName: "夜航电吉他",
  presetMeta: "ELECTRIC · WARM DRIVE",
};
let labAnalyser = null;
let labOutput = null;
let labAnimationFrame = null;
let labTimeouts = [];
let labActiveSources = [];
let customPatches = [];
let cloudEnabled = false;
let cloudSession = null;
let legacyProjects = [];
let legacyCustomPatches = [];
let authMode = "login";
let arrangement = {
  tracks: [],
  bpm: 84,
  baseBpm: 84,
  duration: 12,
  isPlaying: false,
  startTime: 0,
  playhead: 0,
  nodes: [],
  raf: null,
  endTimer: null,
};
let metronomeTimer = null;
let metronomeNext = 0;
let metronomeBeat = 0;
let metronomeNodes = [];

function noteNameFromMidi(midi, preferFlat = false) {
  const rounded = Math.round(midi);
  const names = preferFlat ? NOTE_NAMES_FLAT : NOTE_NAMES;
  return {
    name: names[((rounded % 12) + 12) % 12],
    octave: Math.floor(rounded / 12) - 1,
    midi: rounded,
  };
}

function midiToFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function formatTime(seconds, tenths = false) {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  if (tenths) {
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${Math.floor((safe % 1) * 10)}`;
  }
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function normalizeNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function getAudioContext(resume = true) {
  if (!audioContext || audioContext.state === "closed") {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (resume && audioContext.state !== "running") {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

async function resumePlaybackAudio(context) {
  if (context.state === "running") return true;
  let timeout;
  try {
    await Promise.race([
      context.resume(),
      new Promise(resolve => { timeout = setTimeout(resolve, 1800); }),
    ]);
  } catch (error) {
    console.warn("音频输出未恢复", error);
  } finally {
    clearTimeout(timeout);
  }
  if (context.state === "running") return true;
  showToast("音频输出还没就绪，请再点一次播放");
  return false;
}

function showToast(message, duration = 2600) {
  els.toast.textContent = message;
  els.toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    els.toast.classList.remove("visible");
  }, duration);
}

function setStep(step) {
  [...els.processingSteps.children].forEach((item, index) => {
    item.classList.toggle("done", index < step);
    item.classList.toggle("active", index === step);
    if (index < step) item.classList.remove("active");
  });
}

function resetSteps() {
  [...els.processingSteps.children].forEach((item, index) => {
    item.classList.remove("done", "active");
    if (index === 0) item.classList.add("active");
  });
}

function loadCustomPatches() {
  try {
    const stored = JSON.parse(localStorage.getItem(CUSTOM_PATCHES_STORAGE_KEY) || "[]");
    customPatches = Array.isArray(stored)
      ? stored.filter(
          (patch) =>
            patch &&
            patch.id &&
            patch.name &&
            (LAB_DEFAULTS[patch.instrument] || /^hk-original-(bass|guitar|drums)$/.test(patch.instrument)) &&
            patch.params
        )
      : [];
  } catch {
    customPatches = [];
  }
}

function persistCustomPatches() {
  if (cloudEnabled && cloudSession) {
    updateCloudState("syncing");
    cacheBackendCollection('patches',customPatches);
    window.MeldCloud.upsertPatches(customPatches, cloudSession)
      .then(() => updateCloudState("connected"))
      .catch(error => { updateCloudState("error"); showToast(`音色同步失败：${error.message}`); });
    return true;
  }
  try {
    localStorage.setItem(CUSTOM_PATCHES_STORAGE_KEY, JSON.stringify(customPatches));
    if (cloudEnabled) legacyCustomPatches = customPatches.map(patch => ({ ...patch, params: { ...patch.params } }));
    return true;
  } catch {
    showToast("浏览器存储空间不足，无法保存音色");
    return false;
  }
}

function customPatchToInstrument(patch) {
  const base = INSTRUMENTS.find((instrument) => instrument.id === patch.instrument) || INSTRUMENTS.find(instrument => instrument.id === "electric");
  return {
    id: `custom:${patch.id}`,
    custom: true,
    patchId: patch.id,
    baseInstrument: patch.instrument,
    name: patch.name,
    en: `${base.en} · CUSTOM`,
    desc: `我的音色 · ${base.name}`,
    color: base.color,
    icon: base.icon,
    params: { ...patch.params },
  };
}

function getAllInstrumentDefinitions() {
  return [...INSTRUMENTS, ...customPatches.map(customPatchToInstrument)];
}

function getInstrumentDefinition(id) {
  return getAllInstrumentDefinitions().find((instrument) => instrument.id === id) || INSTRUMENTS.find(instrument => instrument.id === "piano");
}

function getInstrumentPatch(id) {
  return getInstrumentDefinition(id).params || null;
}

function renderInstruments() {
  els.instrumentCards.innerHTML = "";
  const allInstruments = getAllInstrumentDefinitions();
  updateStudioInstrumentLabel();
  allInstruments.forEach(instrument => {
    const card = document.createElement("button");
    card.className = `instrument-card${instrument.custom ? " custom" : ""}${instrument.id === state.instrument ? " active" : ""}`;
    card.type = "button";
    card.dataset.instrument = instrument.id;
    if (instrument.dx7) card.dataset.dx7 = "true";
    card.dataset.search = [instrument.name, instrument.en, instrument.desc, instrument.id, instrument.custom ? "我的音色" : ""].join(" ").toLowerCase();
    card.setAttribute("aria-pressed", String(instrument.id === state.instrument));
    card.innerHTML = `
      <span class="card-icon">${instrument.icon}</span>
      <strong>${escapeHtml(instrument.name)}</strong>
      <small>${escapeHtml(instrument.desc)}</small><span class="instrument-source-badge">${isSampledInstrument(instrument.baseInstrument||instrument.id)?"真实采样":"合成音色"}</span>
      <span class="card-bottom">
        <span class="card-bars"><i></i><i></i><i></i><i></i><i></i></span>
        <span class="card-check">✓</span>
      </span>
    `;
    card.addEventListener("click", () => selectInstrument(instrument.id, true));
    els.instrumentCards.appendChild(card);
  });
  filterStudioInstruments();
}

function filterStudioInstruments() {
  const query = document.getElementById("studioInstrumentSearch").value.trim().toLowerCase();
  let matches=0;
  for (const card of els.instrumentCards.children) {
    card.hidden = !card.dataset.search.includes(query) || (!query && card.dataset.dx7 && card.dataset.instrument !== state.instrument);
    if (!card.hidden) matches++;
  }
  document.getElementById("studioInstrumentEmpty").hidden = matches > 0;
}

function updateStudioInstrumentLabel() {
  const name = getInstrumentDefinition(state.instrument).name;
  document.getElementById("studioCurrentInstrument").textContent = name;
  document.getElementById("studioOpenInstruments").textContent = name + " · 换音色";
}

function selectInstrument(id, announce = false) {
  if(grandPianoBank.preview)stopMelodyPlayback();
  state.instrument = id;
  updateStudioInstrumentLabel();
  renderGrandPianoStatus();
  filterStudioInstruments();
  document.querySelectorAll("[data-instrument]").forEach((button) => {
    const active = button.dataset.instrument === id;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
    button.setAttribute("aria-pressed", String(active));
  });

  if (state.isPlaying) {
    stopMelodyPlayback(false);
    playMelody(0);
  }

  if (announce) {
    const instrument = getInstrumentDefinition(id);
    showToast(`已切换为${instrument.name}${state.notes.length ? "，正在用新音色播放" : ""}`);
    if (state.notes.length) {
      window.setTimeout(() => {
        if (!state.isPlaying) playMelody(0);
      }, 180);
    }
  }
}

function renderMyPatches() {
  if (!els.myPatchGrid) return;
  els.myPatchEmpty.hidden = customPatches.length > 0;
  els.myPatchGrid.innerHTML = customPatches
    .map((patch) => {
      const base = getInstrumentDefinition(`custom:${patch.id}`);
      return `
        <article class="my-patch-card${labState.presetName === patch.name ? " active" : ""}" style="--patch-color:${base.color}">
          <button class="my-patch-main" type="button" data-load-patch="${escapeHtml(patch.id)}">
            <span>${escapeHtml(base.name)}</span>
            <strong>${escapeHtml(patch.name)}</strong>
            <small>${escapeHtml(base.desc.replace("我的音色 · ", ""))} · ${formatLabValue("brightness", patch.params.brightness)}</small>
          </button>
          <button class="my-patch-delete" type="button" data-delete-patch="${escapeHtml(patch.id)}" aria-label="删除${escapeHtml(patch.name)}">×</button>
        </article>
      `;
    })
    .join("");
  els.myPatchGrid.querySelectorAll("[data-load-patch]").forEach((button) => {
    button.addEventListener("click", () => {
      const patch = customPatches.find((item) => item.id === button.dataset.loadPatch);
      if (!patch) return;
      labState.instrument = patch.instrument;
      labState.params = { ...LAB_DEFAULTS[patch.instrument], ...patch.params };
      labState.presetName = patch.name;
      labState.presetMeta = `${patch.instrument.toUpperCase()} · MY PATCH`;
      syncLabControls();
      renderLabPresets();
      saveLabSettings();
      els.labStatusText.textContent = `已载入我的音色「${patch.name}」`;
    });
  });
  els.myPatchGrid.querySelectorAll("[data-delete-patch]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      askDeletePatch(button.dataset.deletePatch);
    });
  });
}

function openPatchDialog() {
  const instrument = INSTRUMENTS.find((item) => item.id === labState.instrument);
  els.patchNameInput.value = labState.presetName.includes("自定义")
    ? `${instrument?.name || "我的音色"} ${customPatches.length + 1}`
    : labState.presetName;
  els.patchFormSummary.textContent = `${instrument?.name || "音色"} · 起音 ${formatLabValue("attack", labState.params.attack)} · 亮度 ${formatLabValue("brightness", labState.params.brightness)} · 空间 ${formatLabValue("space", labState.params.space)}`;
  els.patchDialog.showModal();
  window.setTimeout(() => {
    els.patchNameInput.focus();
    els.patchNameInput.select();
  }, 60);
}

function handlePatchFormSubmit(event) {
  event.preventDefault();
  const name = els.patchNameInput.value.trim();
  if (!name) {
    els.patchNameInput.focus();
    return;
  }
  const patch = {
    id: makeId("patch"),
    name,
    instrument: labState.instrument,
    params: { ...labState.params },
    createdAt: Date.now(),
  };
  customPatches.push(patch);
  if (!persistCustomPatches()) return;
  labState.presetName = name;
  labState.presetMeta = `${labState.instrument.toUpperCase()} · MY PATCH`;
  saveLabSettings();
  renderMyPatches();
  renderInstruments();
  syncLabControls();
  renderLabPresets();
  els.patchDialog.close();
  showToast(`「${name}」已保存，并同步到创作台与编曲台`);
}

function askDeletePatch(patchId) {
  const patch = customPatches.find((item) => item.id === patchId);
  if (!patch) return;
  pendingDeletePatchId = patchId;
  deleteDialogMode = "patch";
  els.deleteDialogTitle.textContent = "移除这个音色？";
  els.deleteDialogCopy.textContent = `「${patch.name}」会从创作台和编曲台的音色列表中移除，已保存作品中的音符不会丢失。`;
  els.deleteDialog.showModal();
}

function confirmDeletePatch() {
  const patch = customPatches.find((item) => item.id === pendingDeletePatchId);
  const deletedPatchId = pendingDeletePatchId;
  customPatches = customPatches.filter((item) => item.id !== pendingDeletePatchId);
  if (cloudEnabled && cloudSession && deletedPatchId) {
    window.MeldCloud.deletePatch(deletedPatchId).catch((error) => {
      updateCloudState("error");
      showToast(`云端音色删除失败：${error.message}`);
    });
  }
  persistCustomPatches();
  if (state.instrument === `custom:${pendingDeletePatchId}`) {
    state.instrument = "piano";
  }
  pendingDeletePatchId = null;
  els.deleteDialog.close();
  renderInstruments();
  renderMyPatches();
  renderArrangement();
  showToast(patch ? `已移除音色「${patch.name}」` : "音色已移除");
}

function openDeleteProjectDialog(projectId) {
  const project = projects.find((item) => item.id === projectId);
  if (!project) return;
  pendingDeleteProjectId = projectId;
  deleteDialogMode = "project";
  els.deleteDialogTitle.textContent = "移除这首作品？";
  els.deleteDialogCopy.textContent = `「${project.title}」会从${
    cloudEnabled && cloudSession ? "你的云端作品库" : "当前浏览器"
  }中删除，此操作无法撤销。`;
  els.deleteDialog.showModal();
}

function createLevelMeter() {
  for (let i = 0; i < 24; i += 1) {
    els.levelMeter.appendChild(document.createElement("i"));
  }
}

function updateLevelMeter(rms) {
  currentRms = rms;
  const bars = [...els.levelMeter.children];
  bars.forEach((bar, index) => {
    const wave = Math.abs(Math.sin(index * 1.47 + performance.now() * 0.009));
    const energy = Math.min(1, rms * 26) * (0.4 + wave * 0.8);
    const height = state.isRecording ? 3 + energy * 15 : 3;
    bar.style.height = `${height}px`;
    bar.style.background =
      energy > 0.65 ? "var(--ui-accent-hover)" : energy > 0.2 ? "var(--ui-accent)" : "var(--ui-line)";
  });
}

function calculateRms(buffer) {
  let sum = 0;
  for (let i = 0; i < buffer.length; i += 1) sum += buffer[i] * buffer[i];
  return Math.sqrt(sum / buffer.length);
}

function detectPitchYin(buffer, sampleRate) {
  const pitch = window.MeldPitchAnalysis.detectPitch(buffer, sampleRate);
  return fallbackPitchTracker ? fallbackPitchTracker.update(pitch) : pitch;
}

function frequencyToPitchData(frequency, confidence) {
  if (!Number.isFinite(frequency) || frequency < 65 || frequency > 1200) return null;
  const exactMidi = 69 + 12 * Math.log2(frequency / 440);
  if (smoothedPitch === null || Math.abs(exactMidi - smoothedPitch) > 0.45) {
    smoothedPitch = exactMidi;
  } else {
    smoothedPitch = smoothedPitch * 0.2 + exactMidi * 0.8;
  }
  const midi = Math.round(smoothedPitch);
  const cents = Math.round((smoothedPitch - midi) * 100);
  return { midi, exactMidi: smoothedPitch, cents, confidence, frequency };
}

function processLiveAudio() {
  if (!analyser || !state.isRecording) return;
  const now = (performance.now() - recordStartedAt) / 1000;
  if(livePitchBusy||now-lastLiveDetection<.025)return;
  lastLiveDetection=now;
  const buffer=livePitchBuffer?.length===analyser.fftSize?livePitchBuffer:(livePitchBuffer=new Float32Array(analyser.fftSize));
  analyser.getFloatTimeDomainData(buffer);
  const rms=calculateRms(buffer);updateLevelMeter(rms);
  const rate=audioContext.sampleRate,generation=livePitchGeneration;
  const time=Math.max(0,now-buffer.length/rate/2);
  if(window.MeldPitchClient&&!MeldPitchClient.legacy()){
    livePitchBusy=true;
    MeldPitchClient.detect(buffer.slice(),rate).then(pitch=>{
      if(state.isRecording&&generation===livePitchGeneration)acceptLivePitch(pitch,time,rms);
    }).catch(()=>{
      if(state.isRecording&&generation===livePitchGeneration)acceptLivePitch(detectPitchYin(buffer,rate),time,rms);
    }).finally(()=>{if(generation===livePitchGeneration)livePitchBusy=false;});
  }else acceptLivePitch(detectPitchYin(buffer,rate),time,rms);
  updateRecordingUI(now);drawVisualizer(now);
}
function acceptLivePitch(pitch, now, rms) {
  const frequency = pitch.frequency;
  const voiced = Number.isFinite(frequency) && frequency >= 65 &&
    frequency <= 1200 && pitch.confidence > 0.53;
  const exactMidi = voiced ? 69 + 12 * Math.log2(frequency / 440) : null;
  if (now - lastPitchAt >= 0.016) {
    state.samples.push({
      t: now,
      midi: exactMidi,
      rounded: voiced ? Math.round(exactMidi) : null,
      confidence: voiced ? pitch.confidence : 0,
      rms,
      frameStep: now - lastPitchAt,
    });
    lastPitchAt = now;
  }

  if (!voiced) {
    smoothedPitch = null;
    pendingDisplayMidi = null;
    currentPitch = null;
    els.liveNote.classList.remove("visible");
    return;
  }

  // Confirm large jumps before displaying them. Keep the measured frames for transcription.
  if (currentPitch && Math.abs(exactMidi - currentPitch.exactMidi) > 1.5 &&
      (pendingDisplayMidi === null || Math.abs(exactMidi - pendingDisplayMidi) > 0.65)) {
    pendingDisplayMidi = exactMidi;
    return;
  }
  pendingDisplayMidi = null;
  const data = frequencyToPitchData(frequency, pitch.confidence);
  currentPitch = data;
  const note = noteNameFromMidi(data.midi);
  els.noteName.textContent = note.name;
  els.noteOctave.textContent = note.octave;
  els.noteCents.textContent =
    Math.abs(data.cents) <= 8 ? "音准稳定" : `${data.cents > 0 ? "+" : ""}${data.cents} cents`;
  els.liveNote.classList.add("visible");
}

function startLiveFrameLoop() {
  cancelAnimationFrame(animationFrame);
  const loop = () => {
    if(studioRecordRaw)els.recordTime.textContent=formatTime((performance.now()-recordStartedAt)/1000,true);
    else processLiveAudio();
    animationFrame = requestAnimationFrame(loop);
  };
  animationFrame = requestAnimationFrame(loop);
}

function stopLiveFrameLoop() {
  cancelAnimationFrame(animationFrame);
  animationFrame = null;
}

let studioRecordRaw = false;

async function refreshStudioAudioInputs(requestPermission=false) {
  const devices = navigator.mediaDevices;
  if (!devices?.enumerateDevices) return;
  let permissionStream;
  try {
    let inputs = (await devices.enumerateDevices()).filter(device=>device.kind==="audioinput");
    if (requestPermission && !inputs.some(device=>device.label)) {
      permissionStream = await devices.getUserMedia({audio:true});
      inputs = (await devices.enumerateDevices()).filter(device=>device.kind==="audioinput");
    }
    const select = document.getElementById("studioAudioInput"), previous = select.value;
    select.replaceChildren(new Option("系统默认输入",""),...inputs.filter(device=>device.deviceId&&device.deviceId!=="default").map((device,index)=>new Option(device.label||`音频输入 ${index+1}`,device.deviceId)));
    if ([...select.options].some(option=>option.value===previous)) select.value=previous;
    if(requestPermission)select.focus();
  }catch(error){
    if(requestPermission)showToast("无法读取音频输入，请检查浏览器权限和设备连接");
  }finally{permissionStream?.getTracks().forEach(track=>track.stop());}
}

function createStudioRecorder(stream) {
  const Recorder = window.MediaRecorder;
  if (!Recorder) return null;
  const isAppleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isAppleMobile && Recorder.isTypeSupported?.("audio/mp4")) {
    try {
      return new Recorder(stream, { mimeType: "audio/mp4" });
    } catch {
      // Let the browser negotiate a format if its advertised format fails.
    }
  }
  return new Recorder(stream);
}

async function startRecording() {
  if (state.isAnalyzing || isRequestingMicrophone) return;
  if (state.isRecording) {
    stopRecording();
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    showToast("当前浏览器不支持麦克风录音，请尝试上传音频");
    return;
  }

  isRequestingMicrophone = true;
  stopSourcePlayback();
  stopMelodyPlayback();

  try {
    const context = getAudioContext();
    await context.resume();
    const input = document.getElementById("studioAudioInput").value;
    studioRecordRaw = document.getElementById("studioRawRecording").checked;
    microphoneStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        ...(input ? { deviceId: { exact: input } } : {}),
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: { ideal: studioRecordRaw ? 2 : 1 },
      },
    });

    void refreshStudioAudioInputs();
    sourceNode = context.createMediaStreamSource(microphoneStream);
    analyser = context.createAnalyser();
    analyser.fftSize = window.MELD_PITCH_CONFIG?.legacy?2048:4096;
    analyser.smoothingTimeConstant = 0.15;
    sourceNode.connect(analyser);

    recordedChunks = [];
    mediaRecorder = null;
    try {
      const recorder = createStudioRecorder(microphoneStream);
      if (recorder) {
        recorder.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0) recordedChunks.push(event.data);
        });
        recorder.addEventListener("stop", () => {
          if (state.isRecording) stopRecording();
          else finalizeRecording();
        }, { once: true });
        // Collect one complete audio file when this take stops.
        recorder.start();
        mediaRecorder = recorder;
      }
    } catch (error) {
      console.warn("原声录制不可用，仍可识别实时音高", error);
    }
    if(studioRecordRaw&&!mediaRecorder){stopMicrophone();showToast("此浏览器无法保存原声录音，可以改用音频上传");return;}

    clearSessionData(true, true);
    state.isRecording = true;
    state.samples = [];
    state.notes = [];
    state.key = null;
    smoothedPitch = null;
    currentPitch = null;
    lastPitchAt = 0;
    pendingDisplayMidi = null;
    fallbackPitchTracker = window.MELD_PITCH_CONFIG?.legacy
      ? null : window.MeldPitchDetector?.createTracker();
    livePitchGeneration++;livePitchBusy=false;lastLiveDetection=-1;
    window.MeldPitchClient?.reset();
    recordStartedAt = performance.now();
    setStep(1);

    els.recordBtn.classList.add("is-recording");
    els.recordBtn.setAttribute("aria-label", "停止录音");
    els.recordZone.classList.add("is-recording");
    renderRecognitionControls();
    els.recordLabel.textContent = "正在聆听 · 点击结束";
    els.liveStatus.classList.add("is-recording");
    els.stageStateText.textContent = "实时聆听";
    els.stageDetail.textContent = studioRecordRaw ? "正在录制原声" : mediaRecorder ? "音高识别中" : "音高识别中 · 本次仅保留旋律";
    els.canvasEmpty.classList.add("hidden");
    els.liveNote.classList.add("visible");
    els.analysisStatus.textContent = "正在聆听";
    els.analysisStatus.classList.remove("ready");
    els.exportBtn.disabled = true;
    drawVisualizer(0);
    startLiveFrameLoop();
  } catch (error) {
    console.error(error);
    stopMicrophone();
    const denied = error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError";
    showToast(denied ? "需要麦克风权限才能捕捉旋律" : "无法启动麦克风，请检查设备或改用上传");
    els.recordLabel.textContent = "点击开始哼唱";
    els.stageStateText.textContent = "准备录音";
  } finally {
    isRequestingMicrophone = false;
  }
}

function stopRecording() {
  if (!state.isRecording) return;
  const elapsed = (performance.now() - recordStartedAt) / 1000;
  state.duration = Math.max(0.5, elapsed);
  state.isRecording = false;
  state.isAnalyzing = true;
  renderRecognitionControls();
  stopLiveFrameLoop();
  livePitchGeneration++;livePitchBusy=false;
  els.recordBtn.classList.remove("is-recording");
  els.recordBtn.setAttribute("aria-label", "开始录音");
  els.recordZone.classList.remove("is-recording");
  els.recordLabel.textContent = "正在处理这段旋律";
  els.liveStatus.classList.remove("is-recording");
  els.stageStateText.textContent = "正在分析";
  els.analysisStatus.textContent = "分析中";
  updateLevelMeter(0);
  els.noteCents.textContent = "处理中";
  setStep(2);

  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  } else {
    finalizeRecording();
  }
}

async function finalizeRecording() {
  if (recordedChunks.length) {
    state.audioBlob = new Blob(recordedChunks, {
      type: recordedChunks.find(chunk => chunk.type)?.type || mediaRecorder?.mimeType || "",
    });
    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    state.audioUrl = URL.createObjectURL(state.audioBlob);
    state.sourceName = "录音 " + new Date().toLocaleString("zh-CN", {hour12:false});
    state.sourceType = "record";
    els.sourceAudio.src = state.audioUrl;
    els.sourceFileName.textContent = state.sourceName;
    els.sourceFileMeta.textContent = "原声录音";
    els.sourcePlayer.classList.add("visible");
  }

  stopMicrophone();
  syncMaterialCaptureState();
  state.isAnalyzing = true;
  renderRecognitionControls();
  els.recordBtn.disabled = true;
  try {
    let decoded = null;
    if (state.audioBlob?.size) {
      try { decoded = await getAudioContext().decodeAudioData(await state.audioBlob.arrayBuffer()); }
      catch (error) { console.warn('录音解码失败，使用实时音高记录', error); }
    }
    if (decoded) {
      state.audioBuffer = decoded;
      if(!studioRecordRaw)await analyzeAudioBuffer(decoded, 'record');
    } else if(!studioRecordRaw) {
      await analyzeSamples(state.samples, state.duration, 'record');
    }
  } finally {
    state.isAnalyzing = false;
    els.recordBtn.disabled = false;
    if(studioRecordRaw){
      els.recordLabel.textContent="点击开始录音";
      els.stageStateText.textContent=state.audioBlob?.size?"原声录音已就绪":"本次未取得音频";
      els.stageDetail.textContent=state.audioBlob?.size?"可试听、保存或下载原声":"请检查输入设备";
      els.analysisStatus.textContent="仅录原声";
      syncMaterialCaptureState();
    }
    syncStudioActionState();
  }
}

function stopMicrophone() {
  if (microphoneStream) {
    microphoneStream.getTracks().forEach((track) => track.stop());
    microphoneStream = null;
  }
  if (sourceNode) {
    try {
      sourceNode.disconnect();
    } catch {
      // The node may already be disconnected.
    }
    sourceNode = null;
  }
  analyser = null;
}

function clearSessionData(fullReset = true, preserveArrangement = false) {
  stopMaterialOriginal();
  stopPerformanceTake(true);
  releasePerformanceKeys();
  if (!preserveArrangement) { performanceInput.history = []; performanceInput.trackId = null; }
  stopArrangementPlayback(false);
  stopMelodyPlayback();
  stopSourcePlayback();
  state.activeProjectId = null;
  state.samples = [];
  state.notes = [];
  state.rhythmHits = [];
  state.analysisProfile = null;
  state.analysisOnsetFirst = null;
  state.notesEdited = false;
  state.key = null;
  state.duration = 8;
  state.audioBuffer = null;
  state.audioBlob = null;
  state.sourceName = "";
  state.sourceType = "";
  state.rhythmHits = [];
  state.analysisProfile = null;
  state.analysisOnsetFirst = null;
  recognitionUI.undo = null;
  state.demoMode = false;
  if (!preserveArrangement) {
    arrangement.tracks = []; arrangement.sections = []; arrangement.templateMeta = null;
    arrangement.duration = 12; arrangement.playhead = 0;
    try { localStorage.removeItem(arrangementStorageKey()); } catch {}
  }
  els.playBtn.disabled = true;
  syncStudioActionState();
  els.playLabel.textContent = "试听旋律";
  els.playSubLabel.textContent = "先录入一段哼唱";
  els.canvasEmpty.classList.remove("hidden");
  els.liveNote.classList.remove("visible");
  els.noteName.textContent = "—";
  els.noteOctave.textContent = "";
  els.noteCents.textContent = "等待音高";
  els.stageStateText.textContent = "准备录音";
  els.stageDetail.textContent = "尚无旋律片段";
  els.durationLabel.textContent = "00:08";
  els.recordLabel.textContent = "点击开始哼唱";
  resetSteps();
  if (fullReset) {
    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    state.audioUrl = null;
    els.sourceAudio.removeAttribute("src");
    els.sourcePlayer.classList.remove("visible");
    resetAnalysis();
  }
  drawVisualizer(0);
}

function resetAnalysis() {
  els.headerKey.textContent = "等待哼唱";
  els.headerKeyNote.textContent = "音高识别后自动填入";
  els.keyConfidenceDial.style.background = "conic-gradient(var(--accent) 0deg, rgba(18, 22, 21, 0.1) 0deg)";
  els.keyName.textContent = "—";
  els.scaleName.textContent = "调性与音阶将在这里出现";
  els.keyFriendly.textContent = "唱得越稳定，识别越准确";
  els.scaleNotes.innerHTML =
    "<span>—</span><span>—</span><span>—</span><span>—</span><span>—</span><span>—</span><span>—</span>";
  els.canvasScaleRail.innerHTML = "";
  els.canvasScaleRail.classList.remove("visible");
  els.noteCount.textContent = "0";
  els.rangeStat.textContent = "—";
  els.confidenceStat.textContent = "—";
  els.relatedKey.textContent = "等待旋律";
  els.analysisStatus.textContent = "等待分析";
  els.analysisStatus.classList.remove("ready");
}

function encodeAudioWav(audioBuffer) {
  const { numberOfChannels, sampleRate, length } = audioBuffer;
  const blockAlign = numberOfChannels * 2;
  const dataSize = length * blockAlign;
  const bytes = new DataView(new ArrayBuffer(44 + dataSize));
  const writeTag = (offset, tag) => {
    for (let i = 0; i < tag.length; i++) bytes.setUint8(offset + i, tag.charCodeAt(i));
  };
  writeTag(0, "RIFF");
  bytes.setUint32(4, 36 + dataSize, true);
  writeTag(8, "WAVE");
  writeTag(12, "fmt ");
  bytes.setUint32(16, 16, true);
  bytes.setUint16(20, 1, true); // PCM
  bytes.setUint16(22, numberOfChannels, true);
  bytes.setUint32(24, sampleRate, true);
  bytes.setUint32(28, sampleRate * blockAlign, true);
  bytes.setUint16(32, blockAlign, true);
  bytes.setUint16(34, 16, true);
  writeTag(36, "data");
  bytes.setUint32(40, dataSize, true);
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const samples = audioBuffer.getChannelData(channel);
    for (let frame = 0; frame < length; frame++) {
      const sample = Math.max(-1, Math.min(1, samples[frame]));
      bytes.setInt16(44 + frame * blockAlign + channel * 2, sample * (sample < 0 ? 32768 : 32767), true);
    }
  }
  return new Blob([bytes], { type: "audio/wav" });
}

function* mediaBoxes(view, start, end) {
  while (end - start >= 8) {
    let size = view.getUint32(start);
    const type = String.fromCharCode(...new Uint8Array(view.buffer, start + 4, 4));
    let header = 8;
    if (size === 1) {
      if (end - start < 16) return;
      size = Number(view.getBigUint64(start + 8));
      header = 16;
    } else if (size === 0) {
      size = end - start;
    }
    if (size < header || size > end - start) return;
    yield { type, start, data: start + header, end: start + size };
    start += size;
  }
}

function movieAudioOnly(bytes) {
  const view = new DataView(bytes);
  const findBox = (parent, type) =>
    [...mediaBoxes(view, parent.data, parent.end)].find(box => box.type === type);
  const slice = (box) => new Uint8Array(bytes, box.start, box.end - box.start);
  const root = { data: 0, end: bytes.byteLength };
  const top = [...mediaBoxes(view, 0, root.end)];
  const movie = findBox(root, "moov");
  if (!movie || top.some(box => box.type === "moof")) return null;

  const movieHeader = findBox(movie, "mvhd");
  const tracks = [...mediaBoxes(view, movie.data, movie.end)].filter(box => box.type === "trak");
  const audioTrack = tracks.find(track => {
    const media = findBox(track, "mdia");
    const handler = media && findBox(media, "hdlr");
    return handler && handler.end - handler.data >= 12 &&
      view.getUint32(handler.data + 8) === 0x736f756e; // soun
  });
  if (!movieHeader || !audioTrack) return null;

  const mediaInfo = findBox(findBox(audioTrack, "mdia"), "minf");
  const table = mediaInfo && findBox(mediaInfo, "stbl");
  if (!table) return null;
  const offsets = findBox(table, "stco") || findBox(table, "co64");
  const mapping = findBox(table, "stsc");
  const sizes = findBox(table, "stsz");
  if (!offsets || !mapping || !sizes || offsets.end - offsets.data < 8 ||
      mapping.end - mapping.data < 8 || sizes.end - sizes.data < 12) return null;

  const offsetWidth = offsets.type === "co64" ? 8 : 4;
  const chunkCount = view.getUint32(offsets.data + 4);
  const mappingCount = view.getUint32(mapping.data + 4);
  const constantSize = view.getUint32(sizes.data + 4);
  const sampleCount = view.getUint32(sizes.data + 8);
  if (!chunkCount || !mappingCount || !sampleCount ||
      chunkCount > (offsets.end - offsets.data - 8) / offsetWidth ||
      mappingCount > (mapping.end - mapping.data - 8) / 12 ||
      (!constantSize && sampleCount > (sizes.end - sizes.data - 12) / 4) ||
      view.getUint32(mapping.data + 8) !== 1) return null;

  // Write a standalone M4A with the original audio sample descriptions and timestamps.
  const fileType = new Uint8Array([
    0, 0, 0, 24, 102, 116, 121, 112, 77, 52, 65, 32, 0, 0, 0, 0,
    77, 52, 65, 32, 105, 115, 111, 109,
  ]);
  const boxHeader = (size, type) => {
    const header = new DataView(new ArrayBuffer(8));
    header.setUint32(0, size);
    header.setUint32(4, type);
    return header;
  };
  const trackBytes = slice(audioTrack).slice();
  const trackView = new DataView(trackBytes.buffer);
  const movieSize = 8 + movieHeader.end - movieHeader.start + trackBytes.length;
  const dataStart = fileType.length + movieSize + 8;
  const mediaData = top.filter(box => box.type === "mdat");
  const chunks = [];
  let sample = 0;
  let mapIndex = 0;
  let outputOffset = dataStart;
  for (let chunk = 1; chunk <= chunkCount; chunk++) {
    // stsc entries apply from their first chunk through the next entry.
    if (mapIndex + 1 < mappingCount &&
        view.getUint32(mapping.data + 8 + (mapIndex + 1) * 12) === chunk) mapIndex++;
    const samplesPerChunk = view.getUint32(mapping.data + 12 + mapIndex * 12);
    if (!samplesPerChunk || samplesPerChunk > sampleCount - sample) return null;
    let chunkSize = constantSize * samplesPerChunk;
    if (!constantSize) {
      for (let i = sample; i < sample + samplesPerChunk; i++) {
        chunkSize += view.getUint32(sizes.data + 12 + i * 4);
      }
    }
    const offsetEntry = offsets.data + 8 + (chunk - 1) * offsetWidth;
    const inputOffset = offsetWidth === 8 ? Number(view.getBigUint64(offsetEntry)) : view.getUint32(offsetEntry);
    if (!chunkSize || outputOffset + chunkSize > 0xffffffff ||
        !mediaData.some(box => inputOffset >= box.data && inputOffset + chunkSize <= box.end)) return null;
    chunks.push(new Uint8Array(bytes, inputOffset, chunkSize));
    const trackEntry = offsetEntry - audioTrack.start;
    if (offsetWidth === 8) trackView.setBigUint64(trackEntry, BigInt(outputOffset));
    else trackView.setUint32(trackEntry, outputOffset);
    sample += samplesPerChunk;
    outputOffset += chunkSize;
  }
  if (sample !== sampleCount || mapIndex !== mappingCount - 1) return null;
  const movieBox = boxHeader(movieSize, 0x6d6f6f76); // moov
  const dataBox = boxHeader(8 + outputOffset - dataStart, 0x6d646174); // mdat
  return new Blob([fileType, movieBox, slice(movieHeader), trackBytes, dataBox, ...chunks], { type: "audio/mp4" });
}

async function decodeStudioUpload(context, file, isVideo) {
  const source = await file.arrayBuffer();
  if (isVideo) {
    const audio = movieAudioOnly(source);
    if (audio) {
      try {
        return await context.decodeAudioData(await audio.arrayBuffer());
      } catch (error) {
        console.warn("独立音轨解码失败，改用原视频", error);
      }
    }
  }
  return await context.decodeAudioData(source);
}

async function handleAudioUpload(file) {
  if (!file || isRequestingMicrophone || state.isRecording || state.isAnalyzing) return;
  const isVideo = ["video/mp4", "video/quicktime"].includes(file.type) ||
    /\.(mp4|mov)$/i.test(file.name);
  if (!isVideo && !file.type.startsWith("audio/") && !/\.(m4a|mp3|wav|aac|flac|ogg|aiff?)$/i.test(file.name)) {
    showToast("请选择音频文件、MP4 或 MOV 视频");
    return;
  }

  stopSourcePlayback();
  stopMelodyPlayback();
  clearSessionData(true, true);
  state.isAnalyzing = true;
  state.sourceName = file.name;
  state.sourceType = "upload";
  els.sourceFileName.textContent = file.name;
  renderRecognitionControls();
  els.recordLabel.textContent = isVideo ? "正在提取视频音轨" : "正在分析音频";
  els.stageStateText.textContent = "正在读取";
  els.stageDetail.textContent = file.name;
  els.canvasEmpty.classList.add("hidden");
  els.analysisStatus.textContent = "分析中";
  setStep(1);

  try {
    const context = getAudioContext(false);
    const audioBuffer = await decodeStudioUpload(context, file, isVideo);
    state.audioBlob = isVideo ? encodeAudioWav(audioBuffer) : file;
    state.audioUrl = URL.createObjectURL(state.audioBlob);
    els.sourceAudio.src = state.audioUrl;
    els.sourcePlayer.classList.add("visible");
    if (audioBuffer.duration > 45) {
      showToast("音频较长，本次会分析前 45 秒");
    }
    state.audioBuffer = audioBuffer;
    state.duration = Math.min(45, audioBuffer.duration);
    const sourceLabel = isVideo ? "视频音轨 · " : "";
    els.sourceFileMeta.textContent = `${sourceLabel}${formatTime(audioBuffer.duration)} · ${Math.round(audioBuffer.sampleRate / 1000)} kHz`;
    const recognized = await analyzeAudioBuffer(audioBuffer);
    if (isVideo && !recognized) {
      els.sourceFileMeta.textContent += " · 音轨已提取，未识别到清晰旋律";
    }
  } catch (error) {
    console.error(error);
    state.isAnalyzing = false;
    syncMaterialCaptureState();
    els.recordLabel.textContent = "点击开始哼唱";
    els.stageStateText.textContent = "读取失败";
    els.analysisStatus.textContent = "无法解析";
    showToast(isVideo && !state.audioBlob
      ? "当前浏览器无法解码此视频的音轨，可改为导入 M4A 或 WAV"
      : "无法分析音频，请尝试 M4A、WAV 或 MP3 格式");
  }
}

function resampleMono(audioBuffer, targetRate = 16000) {
  const maxDuration = Math.min(audioBuffer.duration, 45);
  const sourceLength = Math.floor(maxDuration * audioBuffer.sampleRate);
  const targetLength = Math.floor(maxDuration * targetRate);
  const result = new Float32Array(targetLength);
  const channels = Array.from({ length: audioBuffer.numberOfChannels }, (_, i) =>
    audioBuffer.getChannelData(i)
  );
  const ratio = audioBuffer.sampleRate / targetRate;

  for (let i = 0; i < targetLength; i += 1) {
    const sourcePos = Math.min(sourceLength - 1, i * ratio);
    const lower = Math.floor(sourcePos);
    const upper = Math.min(sourceLength - 1, lower + 1);
    const mix = sourcePos - lower;
    let sample = 0;
    for (let channel = 0; channel < channels.length; channel += 1) {
      sample += channels[channel][lower] * (1 - mix) + channels[channel][upper] * mix;
    }
    result[i] = sample / channels.length;
  }
  return result;
}

async function analyzeAudioBuffer(audioBuffer, sourceType = 'upload') {
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const profileId = window.MeldPitchAnalysis.profile(state.recognitionProfile).id;
  let samples=[],voiced=0;
  if(window.MeldPitchClient&&!MeldPitchClient.legacy()){
    try{samples=await MeldPitchClient.analyze(resampleMono(audioBuffer,audioBuffer.sampleRate),audioBuffer.sampleRate,profileId);}catch(error){console.warn('后台音高分析不可用，使用兼容模式',error.message);}
  }
  if(!samples.length){
    const sampleRate=16000;
    const mono=window.MELD_PITCH_CONFIG?.legacy?resampleMono(audioBuffer,sampleRate):MeldPitchDetector.resample(resampleMono(audioBuffer,audioBuffer.sampleRate),audioBuffer.sampleRate,sampleRate);
    let count=0;
    for(const sample of MeldPitchAnalysis.frames(mono,sampleRate,profileId)){
      samples.push(sample);if(++count%8===0)await new Promise(resolve=>setTimeout(resolve,0));
    }
  }
  voiced=samples.filter(sample=>sample.midi!==null&&sample.confidence>=.55).length;
  if (voiced < 3 && profileId === 'vocal') {
    state.isAnalyzing = false;
    syncMaterialCaptureState();
    els.recordLabel.textContent = '点击重新哼唱';
    els.stageStateText.textContent = '未识别到主旋律';
    els.analysisStatus.textContent = '未识别';
    showToast('没有找到清晰的单音旋律，请尝试清唱或减小背景音乐');
    return false;
  }
  return await analyzeSamples(samples, Math.min(audioBuffer.duration, 45), sourceType);
}

function pitchClassDistance(first, second) {
  const distance = Math.abs(((first % 12) + 12) % 12 - (((second % 12) + 12) % 12));
  return Math.min(distance, 12 - distance);
}

function stabilizePitchSamples(samples) {
  return window.MeldPitchAnalysis.stabilize(samples);
}

function nearestScaleMidi(midi, key, maxDistance = 2) {
  const scalePitchClasses = new Set(
    SCALE_STEPS[key.mode].map((step) => (key.tonic + step) % 12)
  );
  let best = Math.round(midi);
  let bestDistance = Infinity;
  for (let candidate = Math.round(midi) - 6; candidate <= Math.round(midi) + 6; candidate += 1) {
    const pitchClass = ((candidate % 12) + 12) % 12;
    if (!scalePitchClasses.has(pitchClass)) continue;
    const distance = Math.abs(candidate - midi);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return bestDistance <= maxDistance ? best : Math.round(midi);
}

function snapNotesToScale(notes, key) {
  if (!key || !notes.length) return notes;
  // A scale correction changes pitch only; articulated notes keep their own boundaries.
  return notes.map(note => ({ ...note, midi: nearestScaleMidi(note.midi, key, 6) }));
}

function melodyNotesFromSamples(samples) {
  return window.MeldPitchAnalysis.segment(samples, state.analysisProfile || state.recognitionProfile, {onsetFirst:state.analysisOnsetFirst ?? (state.recognitionOnsetFirst!==false)});
}

function estimateKey(samples) {
  const histogram = new Array(12).fill(0);
  let total = 0;
  for (let i = 1; i < samples.length; i += 1) {
    const sample = samples[i];
    if (sample.midi === null || sample.confidence < 0.5) continue;
    const prev = samples[i - 1];
    const dt = Math.max(0.01, Math.min(0.15, sample.t - prev.t));
    const pitchClass = ((Math.round(sample.midi) % 12) + 12) % 12;
    histogram[pitchClass] += dt * sample.confidence;
    total += dt * sample.confidence;
  }
  if (total <= 0) return null;

  histogram.forEach((value, index) => {
    histogram[index] = value / total;
  });

  const results = [];
  for (let tonic = 0; tonic < 12; tonic += 1) {
    for (const mode of ["major", "minor"]) {
      const profile = mode === "major" ? MAJOR_PROFILE : MINOR_PROFILE;
      const rotated = profile.map((_, index) => profile[(index - tonic + 12) % 12]);
      const meanA = histogram.reduce((a, b) => a + b, 0) / 12;
      const meanB = rotated.reduce((a, b) => a + b, 0) / 12;
      let numerator = 0;
      let denomA = 0;
      let denomB = 0;
      for (let i = 0; i < 12; i += 1) {
        const x = histogram[i] - meanA;
        const y = rotated[i] - meanB;
        numerator += x * y;
        denomA += x * x;
        denomB += y * y;
      }
      const score = numerator / Math.sqrt(Math.max(0.000001, denomA * denomB));
      results.push({ tonic, mode, score });
    }
  }

  results.sort((a, b) => b.score - a.score);
  const best = results[0];
  const second = results[1];
  const confidence = Math.max(
    0.46,
    Math.min(0.96, 0.58 + Math.max(0, best.score - second.score) * 0.75 + best.score * 0.1)
  );
  const relativeTonic = (best.tonic + (best.mode === "major" ? 9 : 3)) % 12;
  const relativeMode = best.mode === "major" ? "minor" : "major";
  return {
    ...best,
    confidence,
    related: { tonic: relativeTonic, mode: relativeMode },
  };
}

async function analyzeSamples(rawSamples, duration, sourceType) {
  state.isAnalyzing = true;
  state.samples = stabilizePitchSamples(rawSamples);
  state.duration = Math.max(1, duration || rawSamples[rawSamples.length - 1]?.t + 0.4 || 8);
  els.liveNote.classList.remove("visible");
  els.stageStateText.textContent = "正在分析";
  els.recordLabel.textContent = "正在整理旋律";
  els.noteCents.textContent = "处理中";
  setStep(2);
  await new Promise((resolve) => setTimeout(resolve, 80));

  const profileId = window.MeldPitchAnalysis.profile(state.recognitionProfile).id;
  const result = window.MeldPitchAnalysis.analyze(rawSamples, profileId, {onsetFirst:state.recognitionOnsetFirst!==false});
  const extractedNotes = result.notes;
  const key = estimateKey(state.recognitionOnsetFirst!==false ? reconstructSamples(extractedNotes) : state.samples);
  const notes = makeMonophonicNotes(state.scaleSnap ? snapNotesToScale(extractedNotes, key) : extractedNotes);
  if ((!notes.length || !key) && !result.rhythmHits.length) {
    state.isAnalyzing = false;
    syncMaterialCaptureState();
    els.recordLabel.textContent = "点击重新哼唱";
    els.stageStateText.textContent = "未识别到稳定音高";
    els.analysisStatus.textContent = "未识别";
    showToast("未找到清晰的旋律，请尝试清唱或减小背景音乐");
    resetSteps();
    drawVisualizer(0);
    return false;
  }

  state.rhythmHits = result.rhythmHits;
  state.analysisProfile = profileId;
  state.analysisOnsetFirst = state.recognitionOnsetFirst!==false;
  state.notes = notes;
  state.notesEdited = false;
  state.key = key;
  state.isAnalyzing = false;
  state.demoMode = false;
  state.duration = Math.max(duration || 0, ...notes.map(n => n.start + n.duration + .35), ...state.rhythmHits.map(h => h.start + h.duration + .35));
  if(key) updateAnalysisUI(key, notes, state.duration); else resetAnalysis();
  setStep(3);
  [...els.processingSteps.children].forEach((item, index) => {
    item.classList.toggle("done", index <= 2);
    item.classList.remove("active");
  });
  els.recordLabel.textContent = "点击重新哼唱";
  els.stageStateText.textContent = sourceType === "demo" ? "示例已载入" : "旋律已识别";
  els.stageDetail.textContent = `${notes.length} 个音符 · ${formatTime(state.duration)}`;
  els.noteCents.textContent = "分析完成";
  els.playBtn.disabled = !notes.length;
  syncStudioActionState();
  els.playLabel.textContent = `用${getInstrumentDefinition(state.instrument).name}试听`;
  els.playSubLabel.textContent = key ? `${getKeyLabel(key)} · 点击播放` : "先为节奏标记补充音高";
  els.analysisStatus.textContent = "分析完成";
  els.analysisStatus.classList.add("ready");
  els.canvasEmpty.classList.add("hidden");
  if (sourceType === "upload") {
    els.recordLabel.textContent = "音频已分析";
    els.sourcePlayer.classList.add("visible");
  }
  if(!notes.length){els.stageStateText.textContent='已识别闷音节奏';els.stageDetail.textContent=`${state.rhythmHits.length} 个起音待补音高`;els.analysisStatus.textContent='节奏已识别 · 音高待指定';}
  renderRecognitionControls();
  drawVisualizer(0);
  window.setTimeout(() => {
    if (state.notes.length && !state.isPlaying) playMelody(0);
  }, 240);
  return true;
}

function getKeyLabel(key, preferFlat = false) {
  const name = (preferFlat ? NOTE_NAMES_FLAT : NOTE_NAMES)[key.tonic];
  return `${name} ${key.mode === "major" ? "大调" : "小调"}`;
}

function usesFlatSpelling(key) {
  if (key.mode === "major") return [1, 3, 5, 8, 10].includes(key.tonic);
  return [0, 2, 5, 7, 10].includes(key.tonic);
}

function updateAnalysisUI(key, notes, duration) {
  const keyLabel = getKeyLabel(key);
  const keyShort = `${NOTE_NAMES[key.tonic]}${key.mode === "major" ? "" : "m"}`;
  const noteNames = usesFlatSpelling(key) ? NOTE_NAMES_FLAT : NOTE_NAMES;
  const scaleData = SCALE_STEPS[key.mode].map((step) => {
    const pitchClass = (key.tonic + step) % 12;
    return { pitchClass, name: noteNames[pitchClass] };
  });
  const scale = scaleData.map((note) => note.name);
  const usedPitchClasses = new Set(
    notes.map((note) => ((Math.round(note.midi) % 12) + 12) % 12)
  );
  const low = noteNameFromMidi(notes.length ? Math.min(...notes.map((note) => note.midi)) : 60);
  const high = noteNameFromMidi(notes.length ? Math.max(...notes.map((note) => note.midi)) : 60);
  const confidencePercent = Math.round(key.confidence * 100);

  els.headerKey.textContent = keyShort;
  els.headerKeyNote.textContent = `${keyLabel} · ${
    key.mode === "major" ? "明亮自然音阶" : "内敛自然小调"
  }`;
  els.keyConfidenceDial.style.background =
    `conic-gradient(var(--accent) ${confidencePercent * 3.6}deg, rgba(18, 22, 21, 0.1) 0deg)`;
  els.keyName.textContent = keyShort;
  els.scaleName.textContent =
    `${key.mode === "major" ? "自然大调音阶" : "自然小调音阶"} · ${scale.join("  ")}`;
  els.keyFriendly.textContent =
    key.mode === "major" ? "适合明亮、叙事感的编曲" : "适合流动、情绪化的编曲";
  els.scaleNotes.innerHTML = scaleData
    .map(
      (note, index) =>
        `<span class="${usedPitchClasses.has(note.pitchClass) ? "detected " : ""}${index === 0 ? "root" : ""}" data-pitch-class="${note.pitchClass}">${note.name}</span>`
    )
    .join("");
  const editorHarmony=MeldPianoRollCore.harmonyData(key);
  els.canvasScaleRail.innerHTML = scaleData
    .map(
      (note, index) =>
        `<span class="${usedPitchClasses.has(note.pitchClass) ? "detected " : ""}${index === 0 ? "root" : ""}" data-pitch-class="${note.pitchClass}">${note.name}<b class="piano-chord-label">${MeldPianoRollCore.harmonyAt(editorHarmony,60+note.pitchClass).symbol}</b></span>`
    )
    .join("");
  els.canvasScaleRail.classList.add("visible");
  els.noteCount.textContent = String(notes.length);
  els.rangeStat.textContent = `${low.name}${low.octave}–${high.name}${high.octave}`;
  els.confidenceStat.textContent = `${confidencePercent}%`;
  els.relatedKey.textContent =
    `${NOTE_NAMES[key.related.tonic]} ${key.related.mode === "major" ? "大调" : "小调"} · 近关系调`;
  els.durationLabel.textContent = formatTime(Math.max(8, duration));
}

function highlightActiveScaleNote(midi) {
  document.querySelectorAll("[data-pitch-class].active").forEach((note) => {
    note.classList.remove("active");
  });
  if (midi === null || midi === undefined) return;
  const pitchClass = ((Math.round(midi) % 12) + 12) % 12;
  document
    .querySelectorAll(`[data-pitch-class="${pitchClass}"]`)
    .forEach((note) => note.classList.add("active"));
}

function createDemoData() {
  clearSessionData(false, true);
  const bpm = Number(els.tempoInput.value) || 84;
  const beat = 60 / bpm;
  const demoNotes = [
    [62, 0, 1],
    [65, 1, 0.5],
    [69, 1.5, 1],
    [67, 2.5, 0.5],
    [65, 3, 0.75],
    [64, 3.75, 0.5],
    [62, 4.25, 1.4],
    [60, 5.65, 0.5],
    [62, 6.15, 0.5],
    [65, 6.65, 1.6],
    [69, 8.25, 0.8],
    [67, 9.05, 0.6],
    [65, 9.65, 1.8],
  ].map(([midi, startBeat, durationBeats]) => ({
    midi,
    start: startBeat * beat,
    duration: durationBeats * beat,
    confidence: 0.9,
  }));

  const samples = [];
  demoNotes.forEach((note) => {
    const steps = Math.max(3, Math.floor(note.duration / 0.045));
    for (let i = 0; i < steps; i += 1) {
      const t = note.start + (note.duration * i) / steps;
      samples.push({
        t,
        midi: note.midi + Math.sin(i * 0.92) * 0.045,
        rounded: note.midi,
        confidence: 0.82 + Math.sin(i * 0.48) * 0.08,
      });
    }
    samples.push({
      t: note.start + note.duration,
      midi: null,
      confidence: 0,
    });
  });

  state.demoMode = true;
  state.samples = samples;
  state.notes = demoNotes;
  state.notesEdited = false;
  state.duration = demoNotes[demoNotes.length - 1].start + demoNotes[demoNotes.length - 1].duration + 0.6;
  state.key = {
    tonic: 2,
    mode: "minor",
    confidence: 0.86,
    score: 1,
    related: { tonic: 5, mode: "major" },
  };
  state.sourceName = "示例旋律 · D 小调";
  state.sourceType = "demo";
  els.sourcePlayer.classList.remove("visible");
  els.canvasEmpty.classList.add("hidden");
  els.liveNote.classList.remove("visible");
  updateAnalysisUI(state.key, demoNotes, state.duration);
  setStep(3);
  [...els.processingSteps.children].forEach((item, index) => {
    item.classList.toggle("done", index <= 2);
    item.classList.remove("active");
  });
  els.recordLabel.textContent = "点击开始哼唱";
  els.stageStateText.textContent = "示例已载入";
  els.stageDetail.textContent = `${demoNotes.length} 个音符 · ${formatTime(state.duration)}`;
  els.playBtn.disabled = false;
  syncStudioActionState();
  els.playLabel.textContent = `用${getInstrumentDefinition(state.instrument).name}试听`;
  els.playSubLabel.textContent = "D 小调 · 点击播放";
  els.analysisStatus.textContent = "分析完成";
  els.analysisStatus.classList.add("ready");
  drawVisualizer(0);
  window.setTimeout(() => playMelody(0), 160);
}

function drawVisualizer(playheadTime = 0) {
  syncPitchEditorSource();
  const canvas = els.melodyCanvas;
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) {
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const width = rect.width;
  const height = rect.height;
  ctx.clearRect(0, 0, width, height);

  const pad = { top: 28, right: 18, bottom: 24, left: 48 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const totalDuration = Math.max(8, state.duration || 8);
  let visibleDuration =
    state.isRecording ? Math.max(8, (performance.now() - recordStartedAt) / 1000) : totalDuration;
  const timeToX = (time) => pad.left + (time / visibleDuration) * plotWidth;
  let lowMidi = 48;
  let highMidi = 86;
  if (!state.isRecording && state.notes.length) {
    const noteLow = Math.min(...state.notes.map((note) => note.midi));
    const noteHigh = Math.max(...state.notes.map((note) => note.midi));
    lowMidi = Math.max(24, noteLow - 4);
    highMidi = Math.min(96, noteHigh + 4);
    if (highMidi - lowMidi < 14) {
      const center = (highMidi + lowMidi) / 2;
      lowMidi = Math.max(24, Math.floor(center - 7));
      highMidi = Math.min(96, Math.ceil(center + 7));
    }
  }
  if(!state.isRecording&&melodyEditor.viewport){
    lowMidi=melodyEditor.viewport.lowMidi;highMidi=melodyEditor.viewport.highMidi;
    if(!melodyEditor.drag&&state.notes.length){lowMidi=Math.min(lowMidi,Math.max(24,Math.min(...state.notes.map(n=>n.midi))-1));highMidi=Math.max(highMidi,Math.min(96,Math.max(...state.notes.map(n=>n.midi))+1));}
  }
  // Freeze the vertical scale while dragging so a note follows the pointer.
  if (melodyEditor.drag) {
    lowMidi = melodyEditor.drag.geometry.lowMidi;
    highMidi = melodyEditor.drag.geometry.highMidi;
    visibleDuration = melodyEditor.drag.geometry.visibleDuration;
  }
  if(!state.isRecording)melodyEditor.viewport={lowMidi,highMidi};
  const midiToY = (midi) =>
    pad.top + (1 - (midi - lowMidi) / (highMidi - lowMidi)) * plotHeight;

  ctx.lineWidth = 1;
  const horizontalGradient = ctx.createLinearGradient(0, 0, width, 0);
  horizontalGradient.addColorStop(0, "rgba(255,255,255,0.08)");
  horizontalGradient.addColorStop(1, "rgba(255,255,255,0.015)");
  ctx.strokeStyle = horizontalGradient;

  for (let midi = lowMidi; midi <= highMidi; midi += 1) {
    const y = midiToY(midi);
    const isC = midi % 12 === 0;
    ctx.strokeStyle = isC ? "rgba(198,237,143,0.13)" : "rgba(255,255,255,0.036)";
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
  }

  ctx.font = '8px "Avenir Next", sans-serif';
  ctx.textBaseline = "middle";
  const useFlats = state.key ? usesFlatSpelling(state.key) : false;
  const labelStep = highMidi - lowMidi > 22 ? 3 : 2;
  for (let midi = Math.ceil(lowMidi / labelStep) * labelStep; midi <= highMidi; midi += labelStep) {
    const y = midiToY(midi);
    const note = noteNameFromMidi(midi, useFlats);
    const isScaleNote =
      state.key &&
      SCALE_STEPS[state.key.mode].some(
        (step) => (state.key.tonic + step) % 12 === ((midi % 12) + 12) % 12
      );
    ctx.fillStyle = isScaleNote
      ? "rgba(198,237,143,0.72)"
      : midi % 12 === 0
        ? "rgba(255,255,255,0.3)"
        : "rgba(255,255,255,0.16)";
    ctx.fillText(`${note.name}${note.octave}`, 10, y);
    if (isScaleNote) {
      ctx.fillStyle = "rgba(198,237,143,0.7)";
      ctx.beginPath();
      ctx.arc(pad.left - 5, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const subdivisions = visibleDuration <= 12 ? 8 : 10;
  for (let i = 0; i <= subdivisions; i += 1) {
    const x = pad.left + (plotWidth * i) / subdivisions;
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.beginPath();
    ctx.moveTo(x, pad.top);
    ctx.lineTo(x, height - pad.bottom);
    ctx.stroke();
    if (i % 2 === 0) {
      ctx.fillStyle = "rgba(255,255,255,0.16)";
      ctx.fillText(formatTime((visibleDuration * i) / subdivisions), x + 3, height - 10);
    }
  }

  if (state.key) {
    const scalePitchClasses = SCALE_STEPS[state.key.mode].map(
      (step) => (state.key.tonic + step) % 12
    );
    for (let midi = lowMidi; midi <= highMidi; midi += 1) {
      if (scalePitchClasses.includes(midi % 12)) {
        const y = midiToY(midi);
        const rowHeight = plotHeight / (highMidi - lowMidi);
        ctx.fillStyle = midi % 12 === state.key.tonic
          ? "rgba(198,237,143,0.09)"
          : "rgba(198,237,143,0.042)";
        ctx.fillRect(pad.left, y - rowHeight / 2, plotWidth, rowHeight);
      }
    }
  }

  if (state.view === "wave") {
    drawWaveform(ctx, pad, plotWidth, plotHeight, visibleDuration, playheadTime);
  } else if (state.notes.length && !state.isRecording && !state.isAnalyzing) {
    if (!state.scaleSnap && !state.analysisOnsetFirst) drawPitchPath(ctx, pad, plotWidth, plotHeight, visibleDuration, timeToX, midiToY);
    drawMusicalNotes(ctx, pad, plotWidth, plotHeight, visibleDuration, timeToX, midiToY, playheadTime);
  } else {
    drawPitchPath(ctx, pad, plotWidth, plotHeight, visibleDuration, timeToX, midiToY);
  }

  renderPitchHandles({ lowMidi, highMidi, plotWidth, plotHeight, pad, visibleDuration, timeToX, midiToY });
  drawRecognitionRhythm(ctx, {pad, plotHeight, visibleDuration, timeToX});

  if (playheadTime > 0 && (state.isPlaying || playheadTime > 0.04)) {
    const x = timeToX(Math.min(playheadTime, visibleDuration));
    const glow = ctx.createLinearGradient(x - 18, 0, x + 18, 0);
    glow.addColorStop(0, "rgba(255,128,85,0)");
    glow.addColorStop(0.5, "rgba(255,128,85,0.08)");
    glow.addColorStop(1, "rgba(255,128,85,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - 18, pad.top, 36, plotHeight);
    ctx.strokeStyle = "rgba(255,128,85,0.72)";
    ctx.beginPath();
    ctx.moveTo(x, pad.top);
    ctx.lineTo(x, height - pad.bottom);
    ctx.stroke();
    ctx.fillStyle = "#ff8055";
    ctx.beginPath();
    ctx.arc(x, pad.top, 2.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMusicalNotes(ctx, pad, plotWidth, plotHeight, visibleDuration, timeToX, midiToY, playheadTime) {
  // Notes are already snapped by analysis. Keep intentional manual chromatic edits visible.
  const notes = state.notes
    .filter(note => note.start <= visibleDuration)
    .sort((a, b) => a.start - b.start);
  if (!notes.length) return;

  const rowHeight = Math.max(
    3.5,
    Math.min(11, plotHeight / Math.max(12, getVisibleMidiSpan()))
  );
  let previousNote = null;
  const externalLabels = [];
  const noteBounds = notes.map(note => ({
    x: timeToX(note.start), y: midiToY(editorDisplayMidi(note)) - rowHeight / 2,
    width: Math.max(5, timeToX(note.start + note.duration) - timeToX(note.start)), height: rowHeight,
  }));

  notes.forEach((note) => {
    const x1 = timeToX(note.start);
    const x2 = timeToX(Math.min(visibleDuration, note.start + note.duration));
    const y = midiToY(editorDisplayMidi(note));
    const width = Math.max(5, x2 - x1);
    const selected = note === state.notes[melodyEditor.selected];
    const active =
      state.isPlaying &&
      playheadTime >= note.start &&
      playheadTime <= note.start + note.duration;

    if (previousNote && note.start >= previousNote.start + previousNote.duration - 0.001 && note.start - (previousNote.start + previousNote.duration) < 0.32) {
      const previousX = timeToX(previousNote.start + previousNote.duration);
      const previousY = midiToY(editorDisplayMidi(previousNote));
      ctx.beginPath();
      ctx.moveTo(previousX, previousY);
      ctx.quadraticCurveTo(
        previousX + (x1 - previousX) * 0.5,
        previousY + (y - previousY) * 0.22,
        x1,
        y
      );
      ctx.strokeStyle = "rgba(255,128,85,0.38)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(x1, y - rowHeight / 2, width, rowHeight, rowHeight / 2);
    } else {
      ctx.rect(x1, y - rowHeight / 2, width, rowHeight);
    }
    ctx.fillStyle = active ? "rgba(255,166,136,0.85)" : "rgba(255,128,85,0.2)";
    ctx.fill();
    ctx.strokeStyle = selected ? "#c6ed8f" : active ? "#ffd3c4" : "#ff8055";
    ctx.lineWidth = selected || active ? 1.8 : 1.15;
    ctx.shadowColor = active ? "rgba(255,128,85,0.7)" : "rgba(255,128,85,0.18)";
    ctx.shadowBlur = active ? 11 : 3;
    ctx.stroke();
    ctx.shadowBlur = 0;

    const label = pitchLabel(note.midi);
    ctx.font = '10px "Avenir Next", sans-serif';
    const labelWidth = ctx.measureText(label).width;
    if (width >= labelWidth + 10) {
      ctx.fillStyle = active ? "#1a1f1e" : "#ffd3c4";
      ctx.fillText(label, x1 + 5, y);
    } else {
      // Keep the true note length and put short-note labels outside the bar.
      externalLabels.push({ text: label, x: x1 + width / 2, y, width: labelWidth + 8, selected });
    }
    previousNote = note;
  });

  const placedLabels = [];
  const overlaps = (a, b) => a.x < b.x + b.width + 3 && a.x + a.width + 3 > b.x && a.y < b.y + b.height + 2 && a.y + a.height + 2 > b.y;
  externalLabels.forEach(label => {
    const x = Math.max(pad.left, Math.min(pad.left + plotWidth - label.width, label.x - label.width / 2));
    let box = null;
    for (const offset of [-22, -40, -58, 24, 42, 60]) {
      const candidate = { x, y: label.y + offset - 7, width: label.width, height: 14 };
      if (candidate.y < pad.top + 4 || candidate.y + candidate.height > pad.top + plotHeight) continue;
      if (![...noteBounds, ...placedLabels].some(other => overlaps(candidate, other))) { box = candidate; break; }
    }
    box ||= { x, y: Math.max(pad.top + 4, label.y - 29), width: label.width, height: 14 };
    placedLabels.push(box);
    ctx.strokeStyle = "rgba(255,128,85,0.5)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(label.x, label.y - rowHeight / 2);
    ctx.lineTo(box.x + box.width / 2, box.y + box.height / 2);
    ctx.stroke();
    ctx.fillStyle = "#18201d";
    ctx.fillRect(box.x, box.y, box.width, box.height);
    ctx.font = '10px "Avenir Next", sans-serif';
    ctx.fillStyle = label.selected ? "#c6ed8f" : "#ffd3c4";
    ctx.fillText(label.text, box.x + 4, box.y + 7);
  });

  const activePoint = notes.find(
    (note) => playheadTime >= note.start && playheadTime <= note.start + note.duration
  );
  if (activePoint) {
    ctx.fillStyle = "#f4f0e7";
    ctx.beginPath();
    ctx.arc(timeToX(playheadTime), midiToY(activePoint.midi), 2.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function getVisibleMidiSpan() {
  if (!state.notes.length) return 24;
  return (
    Math.max(...state.notes.map((note) => note.midi)) -
    Math.min(...state.notes.map((note) => note.midi)) +
    8
  );
}

function drawPitchPath(ctx, pad, plotWidth, plotHeight, visibleDuration, timeToX, midiToY) {
  const visibleSamples = state.samples.filter(
    (sample) => sample.midi !== null && sample.t <= visibleDuration + 0.2
  );
  if (!visibleSamples.length) return;

  let segment = [];
  const segments = [];
  visibleSamples.forEach((sample, index) => {
    if (sample.midi === null) {
      if (segment.length) segments.push(segment);
      segment = [];
      return;
    }
    if (index && sample.t - visibleSamples[index - 1].t > 0.17) {
      if (segment.length) segments.push(segment);
      segment = [];
    }
    segment.push(sample);
  });
  if (segment.length) segments.push(segment);

  segments.forEach((points) => {
    if (points.length < 2) return;
    const areaGradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + plotHeight);
    areaGradient.addColorStop(0, "rgba(255,128,85,0.24)");
    areaGradient.addColorStop(0.65, "rgba(255,128,85,0.06)");
    areaGradient.addColorStop(1, "rgba(255,128,85,0)");
    ctx.beginPath();
    points.forEach((sample, index) => {
      const x = timeToX(sample.t);
      const y = midiToY(sample.midi);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    const last = points[points.length - 1];
    const first = points[0];
    ctx.lineTo(timeToX(last.t), pad.top + plotHeight);
    ctx.lineTo(timeToX(first.t), pad.top + plotHeight);
    ctx.closePath();
    ctx.fillStyle = areaGradient;
    ctx.fill();

    ctx.beginPath();
    points.forEach((sample, index) => {
      const x = timeToX(sample.t);
      const y = midiToY(sample.midi);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#ff8055";
    ctx.lineWidth = 1.7;
    ctx.shadowColor = "rgba(255,128,85,0.42)";
    ctx.shadowBlur = 7;
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (points.length < 90) {
      points.forEach((sample) => {
        ctx.fillStyle = "rgba(255,166,136,0.76)";
        ctx.beginPath();
        ctx.arc(timeToX(sample.t), midiToY(sample.midi), 1.25, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  });

  if (currentPitch && state.isRecording) {
    const lastSample = visibleSamples[visibleSamples.length - 1];
    const x = timeToX(lastSample.t);
    const y = midiToY(lastSample.midi);
    ctx.fillStyle = "#f4f0e7";
    ctx.beginPath();
    ctx.arc(x, y, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ff8055";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 6.5, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawWaveform(ctx, pad, plotWidth, plotHeight, visibleDuration, playheadTime) {
  let data = null;
  if (state.audioBuffer) {
    data = state.audioBuffer.getChannelData(0);
  } else if (state.samples.length) {
    data = new Float32Array(state.samples.length);
    state.samples.forEach((sample, index) => {
      data[index] = sample.midi === null ? 0 : Math.sin(index * 0.8) * (0.35 + sample.confidence * 0.3);
    });
  }
  if (!data) return;

  const center = pad.top + plotHeight / 2;
  const columns = Math.min(220, Math.floor(plotWidth));
  const maxDuration = Math.max(visibleDuration, 1);
  const stride = Math.max(1, Math.floor(data.length / columns));
  const barWidth = plotWidth / columns;
  const gradient = ctx.createLinearGradient(pad.left, 0, pad.left + plotWidth, 0);
  gradient.addColorStop(0, "rgba(198,237,143,0.5)");
  gradient.addColorStop(0.7, "#ff8055");
  gradient.addColorStop(1, "rgba(255,128,85,0.65)");
  ctx.fillStyle = gradient;

  for (let column = 0; column < columns; column += 1) {
    let peak = 0;
    const start = column * stride;
    const end = Math.min(data.length, start + stride);
    for (let i = start; i < end; i += 1) peak = Math.max(peak, Math.abs(data[i]));
    const time = (column / columns) * maxDuration;
    if (time > maxDuration) break;
    const amplitude = Math.max(1, Math.min(plotHeight / 2, peak * plotHeight * 1.6));
    ctx.globalAlpha = time <= Math.max(playheadTime, 0.001) ? 1 : 0.48;
    ctx.fillRect(pad.left + column * barWidth, center - amplitude, Math.max(1, barWidth * 0.55), amplitude * 2);
  }
  ctx.globalAlpha = 1;
}

function updateRecordingUI(elapsed) {
  els.recordTime.textContent = formatTime(elapsed, true);
  els.stageDetail.textContent = `已捕捉 ${state.samples.filter((s) => s.midi !== null).length} 个音高点`;
  els.durationLabel.textContent = formatTime(Math.max(8, elapsed));
  if (Math.floor(elapsed * 2) % 2 === 0 && currentPitch) {
    const note = noteNameFromMidi(currentPitch.midi);
    els.stageStateText.textContent = `${note.name}${note.octave} · 实时音高`;
  }
}

async function playMelody(offset = 0) {
  window.MeldDx7Library?.stop?.();
  window.MeldSourceInstruments?.stopPreview?.();
  if (!state.notes.length || state.isAnalyzing) return;
  stopSourcePlayback();
  const context = getAudioContext(false),instrument=state.instrument,notes=state.notes;
  stopMelodyPlayback(false);
  const token=state.melodyLoadToken=(state.melodyLoadToken||0)+1;
  if (context.state !== "running" && !(await resumePlaybackAudio(context))) return;
  if (token!==state.melodyLoadToken||instrument!==state.instrument||notes!==state.notes) return;
  const definition=getInstrumentDefinition(instrument),base=definition.baseInstrument||definition.id;
  if (!sampledInstrumentReady(base,context)) {
    els.playLabel.textContent="正在准备真实乐器采样…";
    try { await prepareSampledInstrument(base,context); } catch(error) { showToast(error.message);return; }
    if(token!==state.melodyLoadToken||instrument!==state.instrument||notes!==state.notes)return;
  }
  state.isPlaying = true;
  state.playStartedAt = context.currentTime - offset;
  els.playBtn.classList.add("is-playing");
  els.playBtn.setAttribute("aria-label", "暂停旋律");
  els.playLabel.textContent = "正在演奏";
  els.playSubLabel.textContent = `${getKeyLabel(state.key)} · ${getInstrumentDefinition(state.instrument).name}`;

  const now = context.currentTime + 0.05;
  state.notes.forEach((note) => {
    if (note.start + note.duration <= offset) return;
    const noteStart = Math.max(0, note.start - offset);
    scheduleSelectedInstrumentNote(state.instrument, note.midi, now + noteStart, note.duration);
  });

  drawVisualizer(offset);
  tickPlayback(offset);
  if (state.loop) {
    state.playTimer = window.setTimeout(() => {
      if (state.isPlaying && state.loop) playMelody(0);
    }, Math.max(300, (state.duration - offset) * 1000 + 80));
  } else {
    state.playTimer = window.setTimeout(() => {
      stopMelodyPlayback();
    }, Math.max(300, (state.duration - offset) * 1000 + 120));
  }
}

function tickPlayback(offset) {
  const startTime = performance.now() - offset * 1000;
  cancelAnimationFrame(tickPlayback.raf);
  const tick = () => {
    if (!state.isPlaying) return;
    const elapsed = (performance.now() - startTime) / 1000;
    const activeNote = state.notes.find(
      (note) => elapsed >= note.start && elapsed <= note.start + note.duration
    );
    highlightActiveScaleNote(activeNote?.midi ?? null);
    drawVisualizer(elapsed);
    if (elapsed < state.duration) {
      tickPlayback.raf = requestAnimationFrame(tick);
    }
  };
  tickPlayback.raf = requestAnimationFrame(tick);
}

function stopMelodyPlayback(resetUI = true) {
  state.melodyLoadToken=(state.melodyLoadToken||0)+1;
  stopGrandPianoAudition();
  state.isPlaying = false;
  cancelAnimationFrame(tickPlayback.raf);
  window.clearTimeout(state.playTimer);
  state.playTimer = null;
  state.playNodes.forEach((node) => {
    try {
      node.stop?.();
    } catch {
      // Note may have already ended.
    }
  });
  state.playNodes = [];
  if (resetUI) {
    highlightActiveScaleNote(null);
    els.playBtn.classList.remove("is-playing");
    els.playBtn.setAttribute("aria-label", "播放旋律");
    if (state.notes.length) {
      const instrument = getInstrumentDefinition(state.instrument);
      els.playLabel.textContent = `用${instrument.name}试听`;
      els.playSubLabel.textContent = state.key ? `${getKeyLabel(state.key)} · 点击播放` : "点击播放";
    }
    drawVisualizer(0);
  }
}

function createEnvelopeGain(context, when, duration, attack, release, peak = 0.15) {
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(peak, when + attack);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * 0.52), when + duration * 0.62);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration + release);
  return gain;
}

function createDriveCurve(amount = 10) {
  const samples = 44100;
  const curve = new Float32Array(samples);
  const k = amount;
  for (let i = 0; i < samples; i += 1) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

function scheduleInstrumentNote(instrumentId, midi, when, duration, volume = 1, destination = null) {
  const context = getAudioContext();
  destination ||= context.destination;
  if(window.MeldDx7?.has(instrumentId)){state.playNodes.push(...schedulePatchVoice(instrumentId,midi,when,duration,LAB_DEFAULTS[instrumentId],destination,volume));return;}
  if(isSampledInstrument(instrumentId)){state.playNodes.push(...schedulePatchVoice(instrumentId,midi,when,duration,LAB_DEFAULTS[instrumentId],destination,volume));return;}
  if (isDrumInstrument(instrumentId)) {
    state.playNodes.push(...scheduleDrumVoice(instrumentId, midi, when, duration, LAB_DEFAULTS[instrumentId], destination, volume));
    return;
  }
  if (EXTRA_VOICE_MAP[instrumentId]) {
    state.playNodes.push(...schedulePatchVoice(instrumentId, midi, when, duration, LAB_DEFAULTS[instrumentId], destination, volume));
    return;
  }
  const frequency = midiToFrequency(midi);
  const master = context.createGain();
  master.gain.value = 0.36 * volume;
  master.connect(destination);
  const nodes = [];

  const makeOsc = (type, detune = 0, level = 1) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, when);
    osc.meldBaseDetune = detune;
    osc.detune.value = detune;
    gain.gain.value = level;
    osc.connect(gain);
    nodes.push(osc);
    return { osc, gain };
  };

  if (instrumentId === "piano") {
    const release = 0.7;
    const envelope = createEnvelopeGain(context, when, duration, 0.008, release, 0.22);
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(4200, when);
    filter.frequency.exponentialRampToValueAtTime(900, when + duration + release);
    filter.Q.value = 0.7;
    [1, 2, 3, 4.02, 5.03].forEach((harmonic, index) => {
      const { osc, gain } = makeOsc(
        index % 2 === 0 ? "sine" : "triangle",
        (index - 2) * 1.5,
        0.68 / Math.pow(index + 1, 1.1)
      );
      osc.frequency.value = frequency * harmonic;
      osc.connect(gain);
      gain.connect(filter);
    });
    filter.connect(envelope);
    envelope.connect(master);
    nodes.forEach((osc) => {
      osc.start(when);
      osc.stop(when + duration + release + 0.08);
    });
  } else if (instrumentId === "electric") {
    const shaper = context.createWaveShaper();
    shaper.curve = createDriveCurve(15);
    shaper.oversample = "2x";
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2900, when);
    filter.Q.value = 0.9;
    const delay = context.createDelay(0.4);
    delay.delayTime.value = 0.16;
    const delayGain = context.createGain();
    delayGain.gain.value = 0.12;
    const envelope = createEnvelopeGain(context, when, duration, 0.012, 0.26, 0.17);
    [0, 7, -9].forEach((detune, index) => {
      const { osc, gain } = makeOsc("sawtooth", detune, index === 0 ? 0.76 : 0.36);
      osc.connect(gain);
      gain.connect(shaper);
    });
    shaper.connect(filter);
    filter.connect(envelope);
    envelope.connect(master);
    envelope.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(master);
    nodes.forEach((osc) => {
      osc.start(when);
      osc.stop(when + duration + 0.35);
    });
  } else if (instrumentId === "acoustic") {
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(3600, when);
    filter.frequency.exponentialRampToValueAtTime(740, when + 0.55);
    const envelope = createEnvelopeGain(context, when, duration, 0.006, 0.5, 0.15);
    [1, 2.01, 3.02, 4.05, 5.01].forEach((harmonic, index) => {
      const { osc, gain } = makeOsc(index < 2 ? "triangle" : "sine", index * 0.8, 0.55 / Math.pow(index + 1, 0.95));
      osc.frequency.value = frequency * harmonic;
      osc.connect(gain);
      gain.connect(filter);
    });
    filter.connect(envelope);
    envelope.connect(master);
    nodes.forEach((osc) => {
      osc.start(when);
      osc.stop(when + duration + 0.55);
    });
  } else if (instrumentId === "sax") {
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(frequency * 2.4, when);
    filter.Q.value = 0.8;
    const envelope = createEnvelopeGain(context, when, duration, 0.045, 0.22, 0.21);
    const { osc, gain } = makeOsc("sawtooth", 0, 0.78);
    const sub = context.createOscillator();
    const subGain = context.createGain();
    sub.type = "square";
    sub.frequency.value = frequency / 2;
    subGain.gain.value = 0.16;
    const lfo = context.createOscillator();
    const lfoGain = context.createGain();
    lfo.frequency.value = 5.4;
    lfoGain.gain.value = 3.2;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.detune);
    sub.connect(subGain);
    subGain.connect(filter);
    gain.connect(filter);
    filter.connect(envelope);
    envelope.connect(master);
    nodes.push(sub, lfo);
    nodes.forEach((node) => {
      node.start(when);
      node.stop(when + duration + 0.28);
    });
  } else if (instrumentId === "strings") {
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(900, when);
    filter.frequency.linearRampToValueAtTime(2600, when + 0.4);
    filter.Q.value = 0.7;
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0.0001, when);
    envelope.gain.linearRampToValueAtTime(0.17, when + Math.min(0.32, duration * 0.45));
    envelope.gain.setValueAtTime(0.17, when + Math.max(0.35, duration - 0.2));
    envelope.gain.exponentialRampToValueAtTime(0.0001, when + duration + 0.35);
    [0, -12, 7, 11].forEach((detune, index) => {
      const { osc, gain } = makeOsc(index < 2 ? "sawtooth" : "triangle", detune, index < 2 ? 0.4 : 0.22);
      osc.connect(gain);
      gain.connect(filter);
    });
    filter.connect(envelope);
    envelope.connect(master);
    nodes.forEach((osc) => {
      osc.start(when);
      osc.stop(when + duration + 0.4);
    });
  } else if (instrumentId === "synth") {
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(3000, when);
    filter.frequency.exponentialRampToValueAtTime(650, when + Math.min(0.7, duration));
    filter.Q.value = 5.5;
    const envelope = createEnvelopeGain(context, when, duration, 0.02, 0.22, 0.18);
    const { osc, gain } = makeOsc("sawtooth", 4, 0.38);
    const square = context.createOscillator();
    const squareGain = context.createGain();
    square.type = "square";
    square.frequency.value = frequency / 2;
    squareGain.gain.value = 0.14;
    gain.connect(filter);
    square.connect(squareGain);
    squareGain.connect(filter);
    filter.connect(envelope);
    envelope.connect(master);
    nodes.push(square);
    nodes.forEach((node) => {
      node.start(when);
      node.stop(when + duration + 0.3);
    });
  }

  state.playNodes.push(...nodes, master);
}

function scheduleSelectedInstrumentNote(instrumentId, midi, when, duration, volume = 1) {
  const definition = getInstrumentDefinition(instrumentId);
  if (definition.custom) {
    const context = getAudioContext();
    const sources = schedulePatchVoice(
      definition.baseInstrument,
      midi,
      when,
      duration,
      { ...LAB_DEFAULTS[definition.baseInstrument], ...definition.params },
      context.destination,
      volume
    );
    state.playNodes.push(...sources);
    return;
  }
  scheduleInstrumentNote(definition.id, midi, when, duration, volume);
}

function scheduleMetronomeClick(when, accent = false) {
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(accent ? 1560 : 1120, when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(accent ? 0.095 : 0.065, when + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.075);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(when);
  oscillator.stop(when + 0.09);
  metronomeNodes.push(oscillator, gain);
  window.setTimeout(() => {
    [els.metronomeBtn, els.arrangeMetronomeBtn].forEach((button) => {
      button.classList.add("beat-pulse");
      if (accent) button.classList.add("accent-beat");
    });
    window.setTimeout(() => {
      [els.metronomeBtn, els.arrangeMetronomeBtn].forEach((button) => {
        button.classList.remove("beat-pulse", "accent-beat");
      });
    }, 105);
  }, Math.max(0, (when - context.currentTime) * 1000));
  window.setTimeout(() => {
    metronomeNodes = metronomeNodes.filter((node) => node !== oscillator && node !== gain);
    try {
      oscillator.disconnect();
      gain.disconnect();
    } catch {
      // The click may already have been disconnected.
    }
  }, Math.max(150, (when - context.currentTime + 0.18) * 1000));
}

function scheduleMetronomeAhead() {
  if (!state.metronome) return;
  const context = getAudioContext();
  const bpm =
    state.currentView === "arrangement"
      ? Math.max(50, Math.min(160, Number(els.arrangementTempoInput.value) || 84))
      : Math.max(50, Math.min(160, Number(els.tempoInput.value) || 84));
  const interval = 60 / bpm;
  while (metronomeNext < context.currentTime + 0.14) {
    scheduleMetronomeClick(metronomeNext, metronomeBeat % 4 === 0);
    metronomeNext += interval;
    metronomeBeat += 1;
  }
}

function startMetronome() {
  const context = getAudioContext();
  context.resume();
  window.clearInterval(metronomeTimer);
  metronomeBeat = 0;
  metronomeNext = context.currentTime + 0.035;
  scheduleMetronomeAhead();
  metronomeTimer = window.setInterval(scheduleMetronomeAhead, 25);
  els.metronomeBtn.setAttribute("aria-pressed", "true");
  els.arrangeMetronomeBtn.setAttribute("aria-pressed", "true");
}

function stopMetronome() {
  window.clearInterval(metronomeTimer);
  metronomeTimer = null;
  metronomeNext = 0;
  metronomeBeat = 0;
  metronomeNodes.forEach((node) => {
    try {
      node.stop?.();
      node.disconnect();
    } catch {
      // Scheduled clicks may have already ended.
    }
  });
  metronomeNodes = [];
  els.metronomeBtn.setAttribute("aria-pressed", "false");
  els.arrangeMetronomeBtn.setAttribute("aria-pressed", "false");
}

function toggleMetronome() {
  state.metronome = !state.metronome;
  if (state.metronome) {
    startMetronome();
    showToast("节拍器已开启 · 每小节首拍加重音");
  } else {
    stopMetronome();
    showToast("节拍器已关闭");
  }
}

function toggleSourcePlayback() {
  if (!els.sourceAudio.src) return;
  if (state.isPreviewingSource) {
    stopSourcePlayback();
    return;
  }
  stopMelodyPlayback();
  state.isPreviewingSource = true;
  els.sourcePlayBtn.setAttribute("aria-label", "暂停原始人声");
  els.sourcePlayBtn.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3h2v10H5zm4 0h2v10H9z"/></svg>';
  els.sourceAudio.play().catch(() => {
    stopSourcePlayback();
    showToast("无法播放这段原始音频");
  });
}

function stopSourcePlayback() {
  if (!els.sourceAudio) return;
  els.sourceAudio.pause();
  els.sourceAudio.currentTime = 0;
  state.isPreviewingSource = false;
  els.sourcePlayBtn.setAttribute("aria-label", "播放原始人声");
  els.sourcePlayBtn.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m5 3 8 5-8 5V3Z"/></svg>';
}

function removeSource() {
  stopSourcePlayback();
  if (state.isRecording) stopRecording();
  clearSessionData(true, true);
  state.audioUrl = null;
  els.sourcePlayer.classList.remove("visible");
  showToast("已移除这段旋律");
}

function createMidiFile() {
  if (!state.notes.length) return null;
  const ticksPerBeat = 480;
  const tempo = 500000;
  const bpmScale = 84 / (Number(els.tempoInput.value) || 84);
  const events = [];

  state.notes.forEach((note) => {
    const startTick = Math.round(note.start * bpmScale * ticksPerBeat);
    const endTick = Math.max(startTick + 30, Math.round((note.start + note.duration) * bpmScale * ticksPerBeat));
    events.push({ tick: startTick, type: 0x90, note: note.midi, velocity: 88 });
    events.push({ tick: endTick, type: 0x80, note: note.midi, velocity: 0 });
  });
  events.sort((a, b) => a.tick - b.tick || a.type - b.type);

  const track = [];
  const vlq = (value) => {
    let buffer = value & 0x7f;
    const bytes = [];
    while ((value >>= 7)) {
      buffer <<= 8;
      buffer |= (value & 0x7f) | 0x80;
    }
    while (true) {
      bytes.push(buffer & 0xff);
      if (buffer & 0x80) buffer >>= 8;
      else break;
    }
    return bytes;
  };
  const pushText = (text) => [...text].map((char) => char.charCodeAt(0));

  const melodyName = pushText("Melohum Melody");
  track.push(0, 0xff, 0x03, melodyName.length, ...melodyName);
  track.push(0, 0xff, 0x51, 0x03, (tempo >> 16) & 0xff, (tempo >> 8) & 0xff, tempo & 0xff);
  let previousTick = 0;
  events.forEach((event) => {
    track.push(...vlq(event.tick - previousTick));
    track.push(event.type, event.note, event.velocity);
    previousTick = event.tick;
  });
  track.push(0, 0xff, 0x2f, 0);

  const header = [
    0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 0x01, 0xe0,
  ];
  const trackHeader = [
    0x4d, 0x54, 0x72, 0x6b,
    (track.length >> 24) & 0xff,
    (track.length >> 16) & 0xff,
    (track.length >> 8) & 0xff,
    track.length & 0xff,
  ];
  return new Blob([new Uint8Array([...header, ...trackHeader, ...track])], {
    type: "audio/midi",
  });
}

function exportMidi() {
  const blob = createMidiFile();
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `Melohum-${state.key ? getKeyLabel(state.key) : "melody"}.mid`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  showToast("MIDI 已导出，可导入 DAW 继续编曲");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadProjects() {
  try {
    const stored = JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY) || "[]");
    projects = Array.isArray(stored)
      ? stored.filter((project) => project && project.id && Array.isArray(project.notes))
      : [];
  } catch {
    projects = [];
  }
}

function persistProjects() {
  if (cloudEnabled && cloudSession) {
    cacheBackendCollection('projects',projects);
    updateCloudState("syncing");
    if(isLocalBackend())return window.MeldCloud.upsertProjects(projects,cloudSession).then(()=>{workspaceSync.lastSaved=Date.now();workspaceSync.error='';updateCloudState('connected');renderBackendStatus();return true;}).catch(error=>{workspaceSync.error=error.message;updateCloudState('error');renderBackendStatus();showToast('作品尚未保存到数据库：'+error.message);return false;});
    window.MeldCloud.upsertProjects(projects, cloudSession)
      .then(() => updateCloudState("connected"))
      .catch((error) => {
        updateCloudState("error");
        showToast(`作品同步失败：${error.message}`);
      });
    return true;
  }
  try {
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
    return true;
  } catch {
    showToast("本地存储空间不足，无法保存作品");
    return false;
  }
}

function makeId(prefix = "project") {
  if (window.crypto?.randomUUID) return `${prefix}-${window.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatProjectDate(timestamp, detailed = false) {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    ...(detailed ? { year: "numeric", hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

function syncStudioActionState() {
  const hasMelody = state.notes.length > 0 || state.rhythmHits?.length > 0 || arrangement.tracks.some(MeldMaterialCore.hasContent);
  els.saveProjectBtn.disabled = !hasMelody || Boolean(performanceInput.recording);
  els.exportBtn.disabled = !state.notes.length;
  syncMaterialCaptureState();
  renderRecognitionControls();
  queueBackendStudio();
}

function reconstructSamples(notes) {
  const samples = [];
  notes.forEach((note) => {
    const steps = Math.max(3, Math.ceil(note.duration / 0.045));
    for (let index = 0; index < steps; index += 1) {
      samples.push({
        t: note.start + (note.duration * index) / steps,
        midi: note.midi + Math.sin(index * 0.9) * 0.035,
        rounded: note.midi,
        confidence: note.confidence || 0.82,
      });
    }
    samples.push({ t: note.start + note.duration, midi: null, confidence: 0 });
  });
  return samples;
}

function projectNoteCount(project) {
  return project.notes?.length || (project.arrangement || []).reduce((sum, track) => sum + (track.notes?.length || 0), 0);
}

function projectWaveSvg(project) {
  const notes = project.notes?.length ? project.notes : (project.arrangement || []).flatMap(track => track.notes || []).sort((a,b) => a.start - b.start);
  if (!notes.length) return "";
  const maxTime = Math.max(1, ...notes.map((note) => note.start + note.duration));
  const minMidi = Math.min(...notes.map((note) => note.midi));
  const maxMidi = Math.max(...notes.map((note) => note.midi));
  const spread = Math.max(5, maxMidi - minMidi);
  const yFor = (midi) => 78 - ((midi - minMidi) / spread) * 50;
  const xFor = (time) => 14 + (time / maxTime) * 222;
  let line = "";
  notes.forEach((note, index) => {
    const y = yFor(note.midi);
    const x1 = xFor(note.start);
    const x2 = xFor(note.start + note.duration);
    if (index === 0) line += `M ${x1.toFixed(1)} ${y.toFixed(1)}`;
    else line += ` L ${x1.toFixed(1)} ${y.toFixed(1)}`;
    line += ` L ${x2.toFixed(1)} ${y.toFixed(1)}`;
  });
  const firstX = xFor(notes[0].start).toFixed(1);
  const lastX = xFor(notes[notes.length - 1].start + notes[notes.length - 1].duration).toFixed(1);
  const area = `${line} L ${lastX} 87 L ${firstX} 87 Z`;
  return `
    <svg class="project-wave" viewBox="0 0 250 100" preserveAspectRatio="none" aria-hidden="true">
      <path class="area" d="${area}" />
      <path class="line" d="${line}" />
    </svg>
  `;
}

function updateLibraryStats() {
  const totalNotes = projects.reduce((sum, project) => sum + projectNoteCount(project), 0);
  const latest = [...projects].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0];
  els.projectTotal.textContent = String(projects.length).padStart(2, "0");
  els.projectNotesTotal.textContent = String(totalNotes).padStart(3, "0");
  els.projectLatest.textContent = latest ? formatProjectDate(latest.updatedAt) : "—";
}

function getProjectPreviewPart(project) {
  if (project?.notes?.length) return project;
  return project?.arrangement?.find(track => !track.isDrum && track.notes?.length)
    || project?.arrangement?.find(track => track.notes?.length);
}

function updateProjectPreviewButtons() {
  els.projectGrid.querySelectorAll('[data-project-action="preview"]').forEach(button => {
    const active = button.closest("[data-project-id]").dataset.projectId === projectPreview?.id;
    button.textContent = active ? (projectPreview.loading ? "取消载入" : "停止试听") : "试听音符";
    button.setAttribute("aria-pressed", String(active));
  });
}

function stopProjectPreview() {
  if (!projectPreview) return;
  const preview = projectPreview;
  projectPreview = null;
  clearTimeout(preview.timer);
  for (const node of preview.nodes) {
    try { node.stop(); } catch { /* The voice may already have ended. */ }
  }
  preview.output?.disconnect();
  updateProjectPreviewButtons();
}

async function toggleProjectPreview(project) {
  const wasActive = projectPreview?.id === project.id;
  stopProjectPreview();
  const part = getProjectPreviewPart(project);
  if (wasActive || !part) return;
  const preview = { id: project.id, loading: true, nodes: [], output: null, timer: null };
  projectPreview = preview;
  updateProjectPreviewButtons();
  try {
    const context = getAudioContext(false);
    if (context.state !== "running" && !(await resumePlaybackAudio(context))) {
      if (preview === projectPreview) stopProjectPreview();
      return;
    }
    if (preview !== projectPreview) return;
    const definition = getInstrumentDefinition(part.instrument);
    const base = part.instrumentBase || definition.baseInstrument || definition.id;
    const params = { ...LAB_DEFAULTS.piano, ...LAB_DEFAULTS[base], ...(part.instrumentPatch || definition.params) };
    if (!sampledInstrumentReady(base, context)) await prepareSampledInstrument(base, context);
    if (preview !== projectPreview) return;
    const notes = part.notes.filter(note => Number.isFinite(note.midi) && Number.isFinite(note.start) && note.duration > 0)
      .sort((a, b) => a.start - b.start);
    if (!notes.length) { stopProjectPreview(); return; }
    const output = context.createGain();
    output.gain.value = 0.65;
    output.connect(context.destination);
    preview.output = output;
    const start = context.currentTime + 0.04;
    const first = notes[0].start;
    let duration = 0;
    for (const note of notes) {
      const offset = note.start - first;
      if (offset >= 12) break;
      const length = Math.min(note.duration, 12 - offset);
      duration = Math.max(duration, offset + length);
      const velocity = Math.max(0.08, Math.min(1, note.velocity ?? 0.8));
      preview.nodes.push(...schedulePatchVoice(base, note.midi, start + offset, length, params, output, velocity));
    }
    preview.loading = false;
    preview.timer = window.setTimeout(stopProjectPreview, (duration + 0.15) * 1000 + Math.min(1800, params.release));
    updateProjectPreviewButtons();
  } catch (error) {
    if (preview !== projectPreview) return;
    stopProjectPreview();
    showToast(error.message || "暂时无法试听此作品");
  }
}

function renderProjects() {
  updateLibraryStats();
  const query = (els.projectSearch.value || "").trim().toLowerCase();
  const filtered = [...projects]
    .filter((project) => {
      if (projectFilter === "major" && project.key?.mode !== "major") return false;
      if (projectFilter === "minor" && project.key?.mode !== "minor") return false;
      if (!query) return true;
      const instrument = getInstrumentDefinition(project.instrument);
      const haystack = [
        project.title,
        project.memo,
        project.key ? getKeyLabel(project.key) : "",
        instrument?.name || "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  els.projectGrid.innerHTML = filtered
    .map((project) => {
      const instrument = getInstrumentDefinition(project.instrument);
      const instrumentName = project.instrumentName || instrument.name;
      const keyLabel = project.key ? getKeyLabel(project.key) : "未识别调性";
      const memo = project.memo?.trim();
      return `
        <article class="project-card" data-project-id="${escapeHtml(project.id)}">
          <div
            class="project-art"
            style="--project-accent:${instrument.color};--project-accent-soft:${instrument.color}2b"
          >
            ${projectWaveSvg(project)}
          </div>
          <div class="project-body">
            <h3>${escapeHtml(project.title)}</h3>
            ${memo ? `<p>${escapeHtml(memo)}</p>` : ""}
            <div class="project-meta-row">
              <span><i></i>${escapeHtml(instrumentName)} · ${escapeHtml(keyLabel)} · ${Number(project.tempo) || 84} BPM</span>
              <span>${escapeHtml(formatProjectDate(project.updatedAt))} · ${projectNoteCount(project)} 音符</span>
            </div>
          </div>
          <div class="project-card-actions">
            <button type="button" data-project-action="preview" aria-pressed="false" title="试听最多 12 秒的已保存音符" ${getProjectPreviewPart(project) ? "" : "disabled"}>试听音符</button>
            <button class="project-open" type="button" data-project-action="open">继续创作</button>
            <button type="button" data-project-action="export-midi" ${projectNoteCount(project)?'':'disabled'}>导出 MIDI</button>
            <button type="button" data-project-action="rename">重命名</button>
            <button type="button" data-project-action="duplicate">复制</button>
            <button class="project-delete" type="button" data-project-action="delete">删除</button>
          </div>
        </article>
      `;
    })
    .join("");

  els.projectEmpty.hidden = filtered.length > 0;
  els.projectGrid.hidden = filtered.length === 0;
  if (projectPreview && !filtered.some(project => project.id === projectPreview.id)) stopProjectPreview();
  updateProjectPreviewButtons();
}

function openProjectDialog(mode, projectId = null) {
  if (mode !== "rename" && !state.notes.length && !state.rhythmHits?.length && !arrangement.tracks.some(MeldMaterialCore.hasContent)) {
    showToast("先录制或载入一段旋律，再保存为作品");
    return;
  }

  projectDialogMode = mode;
  editingProjectId = projectId;
  const project = projects.find((item) => item.id === projectId);

  if (mode === "rename") {
    els.projectDialogTitle.textContent = "重命名作品";
    els.projectNameInput.value = project?.title || "";
    els.projectMemoInput.value = project?.memo || "";
    els.projectSubmitBtn.textContent = "保存作品信息";
    els.projectFormSummary.textContent = "只修改作品名称与备注，不会改变已保存的旋律。";
  } else {
    const existing = projectId ? projects.find((item) => item.id === projectId) : null;
    els.projectDialogTitle.textContent = existing ? "更新这首作品" : "保存这段旋律";
    els.projectNameInput.value =
      existing?.title || (state.currentView === "arrangement" && arrangement.templateMeta?.title) || `未命名旋律 ${String(projects.length + 1).padStart(2, "0")}`;
    els.projectMemoInput.value = existing?.memo || "";
    els.projectSubmitBtn.textContent = existing ? "更新作品" : "保存到我的作品";
    const instrument = getInstrumentDefinition(state.instrument);
    els.projectFormSummary.textContent = [
      state.currentView === "arrangement" && arrangement.templateMeta ? arrangement.templateMeta.keyName : state.key ? getKeyLabel(state.key) : "未识别调性",
      `${state.currentView === "arrangement" ? arrangement.tracks.reduce((sum, track) => sum + track.notes.length, 0) : state.notes.length} 个音符`,
      instrument?.name || "钢琴",
      `${Number(els.tempoInput.value) || 84} BPM`,
      cloudEnabled ? (isLocalBackend()?"保存到云端账户":"保存到云端账户") : "保存在当前浏览器",
    ].join(" · ");
  }

  els.projectDialog.showModal();
  window.setTimeout(() => {
    els.projectNameInput.focus();
    els.projectNameInput.select();
  }, 60);
}

function closeProjectDialog() {
  els.projectDialog.close();
  projectDialogMode = "save";
  editingProjectId = null;
}

async function handleProjectFormSubmit(event) {
  event.preventDefault();
  if (cloudEnabled && !cloudSession) {
    openAuthDialog("login");
    showToast(isLocalBackend()?"登录后才能保存到云端账户作品库":"登录后才能保存到云端作品库");
    return;
  }
  const title = els.projectNameInput.value.trim();
  const memo = els.projectMemoInput.value.trim();
  if (!title) {
    els.projectNameInput.focus();
    return;
  }

  if (projectDialogMode === "rename") {
    const project = projects.find((item) => item.id === editingProjectId);
    if (!project) {
      closeProjectDialog();
      return;
    }
    project.title = title;
    project.memo = memo;
    project.updatedAt = Date.now();
    if(!(await persistProjects()))return;
    renderProjects();
    closeProjectDialog();
    showToast("作品信息已更新");
    return;
  }

  const existing = editingProjectId
    ? projects.find((project) => project.id === editingProjectId)
    : null;
  const template = state.currentView === "arrangement" ? arrangement.templateMeta : null;
  const templateLead = template ? arrangement.tracks.find(track => track.id === template.leadTrackId) : null;
  const selectedInstrument = getInstrumentDefinition(templateLead?.instrument || state.instrument);
  const projectNotes = templateLead?.notes || state.notes;
  const projectKey = template ? (template.key || {tonic:11,mode:"minor",confidence:1,score:1,related:{tonic:2,mode:"major"}}) : state.key;
  const project = {
    id: existing?.id || makeId(),
    title,
    memo,
    notes: projectNotes.map(note => ({ ...note })),
    notesEdited: Boolean(template || state.notesEdited),
    recognitionProfile: state.analysisProfile || state.recognitionProfile,
    recognitionOnsetFirst: state.analysisOnsetFirst ?? (state.recognitionOnsetFirst!==false),
    rhythmHits: template ? [] : (state.rhythmHits || []).map(h => ({...h})),
    key: projectKey ? { ...projectKey, related: { ...projectKey.related } } : null,
    instrument: selectedInstrument.id,
    instrumentName: selectedInstrument.name,
    instrumentBase: selectedInstrument.baseInstrument || selectedInstrument.id,
    instrumentPatch: templateLead?.instrumentPatch || getInstrumentPatch(state.instrument),
    tempo: state.currentView === "arrangement" ? arrangement.bpm : Number(els.tempoInput.value) || 84,
    duration: state.currentView === "arrangement" ? calculateArrangementDuration() * arrangement.baseBpm / arrangement.bpm : state.duration,
    openView: state.currentView,
    arrangementTemplate: arrangement.templateMeta || null,
    arrangementSections: arrangement.sections || [],
    arrangement: arrangement.tracks.map(cloneArrangementTrackData),
    arrangementBpm: arrangement.bpm,
    arrangementBaseBpm: arrangement.baseBpm,
    sourceName: template?.title || state.sourceName || "哼唱旋律",
    createdAt: existing?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  if (existing) {
    projects = projects.map((item) => (item.id === existing.id ? project : item));
  } else {
    projects.push(project);
  }
  if (!(await persistProjects())) return;
  state.activeProjectId = project.id;
  renderProjects();
  closeProjectDialog();
  showToast(existing ? "作品已更新" : "已保存到「我的作品」");
}

function openSavedProject(projectId) {
  const project = projects.find((item) => item.id === projectId);
  if (!project || (!project.notes?.length && !project.rhythmHits?.length && !project.arrangement?.some(track => track.notes?.length || track.audioClips?.length))) {
    showToast("这首作品暂时无法打开");
    return;
  }
  stopRecording();
  stopMelodyPlayback();
  clearSessionData(true);
  state.activeProjectId = project.id;
  state.notesEdited = Boolean(project.notesEdited || project.notes?.some(note => note.manualEdited));
  state.notes = (project.notes || []).map((note) => ({
    ...note,
    confidence: note.confidence || 0.82,
    duration: Math.max(0.04, note.duration),
  }));
  state.analysisProfile = window.MeldPitchAnalysis.profile(project.recognitionProfile).id;
  state.recognitionProfile = state.analysisProfile;
  state.analysisOnsetFirst = project.recognitionOnsetFirst===true;
  state.recognitionOnsetFirst = project.recognitionOnsetFirst!==false;
  state.rhythmHits = (project.rhythmHits || []).map(h => ({...h}));
  state.samples = reconstructSamples(state.notes);
  state.key = project.key || estimateKey(state.samples);
  if (!state.key && state.notes.length) {
    state.key = {
      tonic: 0,
      mode: "major",
      confidence: 0.5,
      score: 0,
      related: { tonic: 9, mode: "minor" },
    };
  }
  state.duration = Math.max(
    8, Number(project.duration) || 0,
    ...state.notes.map((note) => note.start + note.duration + 0.35)
  );
  state.sourceName = project.title;
  state.sourceType = "project";
  state.demoMode = false;
  els.tempoInput.value = String(Number(project.tempo) || 84);
  if (
    project.instrument?.startsWith("custom:") &&
    !customPatches.some((patch) => `custom:${patch.id}` === project.instrument) &&
    project.instrumentPatch
  ) {
    const restoredPatch = {
      id: project.instrument.replace("custom:", "") || makeId("patch"),
      name: project.instrumentName || "作品音色",
      instrument: project.instrumentBase || "piano",
      params: project.instrumentPatch,
      createdAt: Date.now(),
    };
    customPatches.push(restoredPatch);
    persistCustomPatches();
    renderMyPatches();
    renderInstruments();
  }
  selectInstrument(project.instrument || "piano", false);
  arrangement.tracks = Array.isArray(project.arrangement)
    ? project.arrangement.map(track => ({...cloneArrangementTrackData(track), notes:(track.notes || []).map(note => ({...note})), audioClips:(track.audioClips || []).map(clip => ({...clip,peaks:[...(clip.peaks||[])]}))}))
    : [];
  // Preserve embedded custom timbres when opening a project on another browser.
  let recoveredTrackPatch = false;
  arrangement.tracks.forEach(track => {
    if (!track.instrument?.startsWith("custom:") || !track.instrumentPatch || customPatches.some(patch => `custom:${patch.id}` === track.instrument)) return;
    customPatches.push({ id: track.instrument.slice(7), name: track.instrumentName || "作品音色", instrument: LAB_DEFAULTS[track.instrumentBase] ? track.instrumentBase : "piano", params: { ...track.instrumentPatch }, createdAt: Date.now() });
    recoveredTrackPatch = true;
  });
  if (recoveredTrackPatch) { persistCustomPatches(); renderMyPatches(); renderInstruments(); }
  arrangement.sections = project.arrangementSections || [];
  arrangement.templateMeta = project.arrangementTemplate || null;
  arrangement.bpm = Number(project.arrangementBpm) || Number(project.tempo) || 84;
  arrangement.baseBpm =
    Number(project.arrangementBaseBpm) || Number(project.tempo) || arrangement.bpm;
  arrangement.duration = Math.max(12, state.duration);
  persistArrangement();
  if(state.key) updateAnalysisUI(state.key, state.notes, state.duration); else resetAnalysis();
  els.playBtn.disabled = !state.notes.length;
  setStep(3);
  [...els.processingSteps.children].forEach((item, index) => {
    item.classList.toggle("done", index <= 2);
    item.classList.remove("active");
  });
  els.canvasEmpty.classList.add("hidden");
  els.liveNote.classList.remove("visible");
  els.playBtn.disabled = !state.notes.length;
  els.playLabel.textContent = `用${getInstrumentDefinition(state.instrument).name}试听`;
  els.playSubLabel.textContent = state.key ? `${getKeyLabel(state.key)} · 已从作品库打开` : "节奏已恢复 · 待补音高";
  els.stageStateText.textContent = "作品已打开";
  els.stageDetail.textContent = `${project.title} · ${state.notes.length} 个音符`;
  els.analysisStatus.textContent = "已保存";
  els.analysisStatus.classList.add("ready");
  els.recordLabel.textContent = "点击重新哼唱";
  syncStudioActionState();
  switchView(project.openView === "arrangement" || (!state.notes.length && !state.rhythmHits?.length) ? "arrangement" : "studio");
  if (state.notes.length || state.rhythmHits?.length) drawVisualizer(0);
  showToast(`已打开「${project.title}」`);
}

async function duplicateProject(projectId) {
  if (cloudEnabled && !cloudSession) {
    openAuthDialog("login");
    showToast("登录后才能复制到云端作品库");
    return;
  }
  const original = projects.find((project) => project.id === projectId);
  if (!original) return;
  const copy = {
    ...original,
    id: makeId(),
    title: `${original.title} · 副本`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    notes: original.notes.map((note) => ({ ...note })),
    key: original.key ? { ...original.key, related: { ...original.key.related } } : null,
    arrangement: (original.arrangement || []).map(cloneArrangementTrackData),
  };
  projects.push(copy);
  if (!(await persistProjects())) return;
  renderProjects();
  showToast("已创建一份作品副本");
}

function askDeleteProject(projectId) {
  openDeleteProjectDialog(projectId);
}

function confirmDeleteProject() {
  const deleted = projects.find((project) => project.id === pendingDeleteProjectId);
  const deletedId = pendingDeleteProjectId;
  projects = projects.filter((project) => project.id !== pendingDeleteProjectId);
  if (cloudEnabled && cloudSession && deletedId) {
    window.MeldCloud.deleteProject(deletedId).catch((error) => {
      updateCloudState("error");
      showToast(`云端删除失败：${error.message}`);
    });
  }
  persistProjects();
  if (state.activeProjectId === pendingDeleteProjectId) state.activeProjectId = null;
  pendingDeleteProjectId = null;
  deleteDialogMode = "project";
  els.deleteDialog.close();
  renderProjects();
  showToast(deleted ? `已移除「${deleted.title}」` : "作品已移除");
}

function updateCloudState(status = "signed-out") {
  if (!els.cloudStatus) return;
  document.getElementById('adminOpenBtn').hidden=cloudSession?.user?.isAdmin!==true;
  if (!cloudEnabled) {
    els.cloudStatus.className = "save-state cloud-unconfigured";
    const fileMode=typeof location!=='undefined'&&location.protocol==='file:';
    els.cloudStatus.innerHTML = fileMode?"<i></i> 离线文件模式":"<i></i> 云端未配置";
    els.authBtn.textContent = fileMode?"说明":"配置";
    els.authBtn.setAttribute("aria-label",fileMode?"离线文件模式说明":"云端配置");
    els.authBtn.classList.remove("user-connected");
    if (els.libraryStorageCopy) {
      els.libraryStorageCopy.innerHTML =
        fileMode?"离线文件模式<br><small>作品暂存浏览器；内置采样可用</small>":"本地预览模式<br><small>配置 Supabase 后启用云端同步</small>";
    }
    return;
  }
  const email = cloudSession?.user?.email || (cloudSession?.user?.authMethod==='wechat'?'微信账户':cloudSession?'云端账户':'');
  els.authBtn.textContent = email ? email.charAt(0).toUpperCase() : "登录";
  els.authBtn.classList.toggle("user-connected", Boolean(email));
  els.authBtn.setAttribute(
    "aria-label",
    email ? `已登录 ${email}，打开账户菜单` : "登录云端"
  );
  const labels = {
    connected: isLocalBackend()?"云端已保存":"云端已同步",
    syncing: "正在同步…",
    error: "同步异常",
    "signed-out": isLocalBackend()?"云端未登录":"云端未登录",
  };
  els.cloudStatus.className = `save-state cloud-${status}`;
  els.cloudStatus.innerHTML = `<i></i> ${labels[status] || labels["signed-out"]}`;
  if (els.libraryStorageCopy) {
    els.libraryStorageCopy.innerHTML = email
      ? `${isLocalBackend()?'已保存到云端数据库':'已同步到云端账户'}<br><small>${escapeHtml(email)}</small>`
      : isLocalBackend()?"登录后保存账户数据<br><small>邮箱 / ChatGPT 登录 · 云端保存</small>":"登录后跨设备同步<br><small>作品、音色和素材云端保存</small>";
  }
}

function setAuthMode(mode) {
  if(window.MeldCloud?.provider==='sites')return setEmailAuthMode(mode);
  authMode = mode === "signup" ? "signup" : "login";
  els.authTabs.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.authMode === authMode);
  });
  els.authTitle.textContent = authMode === "signup" ? "创建 Melohum 账户" : "登录 Melohum";
  els.authCopy.textContent =
    authMode === "signup"
      ? "注册后，你的作品、编曲与自定义音色会保存在云端。"
      : "登录后，作品、编曲和自定义音色会同步到你的云端账户。";
  els.authSubmitBtn.textContent = authMode === "signup" ? "创建账户" : "登录并同步";
  els.authPasswordInput.autocomplete =
    authMode === "signup" ? "new-password" : "current-password";
  if(isLocalBackend()){els.authCopy.textContent=authMode==='signup'?'创建云端账户后，作品、草稿、音色和录音会保存在云端数据库。':'登录云端账户，继续编辑并保存你的作品与录音素材。';els.authSubmitBtn.textContent=authMode==='signup'?'创建云端账户':'登录云端账户';els.authPasswordInput.minLength=8;els.authPasswordInput.placeholder='至少 8 位字符';}
  els.authMessage.textContent = "";
  els.authMessage.classList.remove("success");
}

function openAuthDialog(mode = "login") {
  if (!cloudEnabled) {
    if(typeof location!=='undefined'&&location.protocol==='file:'){showToast('离线模式可直接使用内置采样；账户数据库请通过“启动Melohum.cmd”开启本机服务',5000);return;}
    showToast("请先在 cloud-config.js 中填写 Supabase 项目 URL 和 anon key");
    return;
  }
  els.authDialog.classList.toggle("account-mode", Boolean(cloudSession));
  els.authLogoutBtn.hidden = !cloudSession;
  if (cloudSession) {
    els.authTitle.textContent = isLocalBackend()?"云端账户":"云端账户";
    els.authCopy.textContent = `已登录 ${cloudSession.user.email || '账户'}，${isLocalBackend()?'数据保存在云端数据库':'作品与音色会同步到该账户'}。`;
  } else {
    setAuthMode(mode);
  }
  if(window.MeldCloud?.provider==='sites'){
    if(cloudSession){els.authTitle.textContent='我的云端工作台';els.authCopy.textContent=`已登录 ${cloudSession.user.email || (cloudSession.user.authMethod==='wechat'?'微信账户':'云端账户')}，作品、草稿、音色和录音将保存到你的云端账户。`;}
    els.authTabs.hidden=Boolean(cloudSession);els.authForm.hidden=Boolean(cloudSession);
    document.getElementById('chatgptLoginLink').hidden=Boolean(cloudSession);
    document.getElementById('authSocial').hidden=true;
    document.getElementById('authServiceStatus').hidden=Boolean(cloudSession)||emailAuthUI.mailConfigured;
    refreshEmailAuthConfig();
  }
  renderBackendStatus();
  els.authDialog.showModal();
}

function closeAuthDialog() {
  els.authDialog.close();
  els.authMessage.textContent = "";
  els.authMessage.classList.remove("success");
}

function mergeCloudItems(remoteItems, localItems, dateKey) {
  const merged = new Map();
  [...localItems, ...remoteItems].forEach((item) => {
    const current = merged.get(item.id);
    if (!current || Number(item[dateKey] || 0) > Number(current[dateKey] || 0)) {
      merged.set(item.id, item);
    }
  });
  return [...merged.values()].sort(
    (a, b) => Number(b[dateKey] || 0) - Number(a[dateKey] || 0)
  );
}

async function loadCloudWorkspace() {
  if (!cloudSession || !cloudEnabled) return;
  if(isLocalBackend())return loadLocalWorkspace();
  updateCloudState("syncing");
  try {
    const [remoteProjects, remotePatches] = await Promise.all([
      window.MeldCloud.fetchProjects(),
      window.MeldCloud.fetchPatches(),
    ]);
    projects = mergeCloudItems(remoteProjects, legacyProjects, "updatedAt");
    customPatches = mergeCloudItems(remotePatches, legacyCustomPatches, "createdAt");
    if (legacyProjects.length || legacyCustomPatches.length) {
      await Promise.all([
        window.MeldCloud.upsertProjects(projects, cloudSession),
        window.MeldCloud.upsertPatches(customPatches, cloudSession),
      ]);
    }
    try {
      localStorage.removeItem(PROJECT_STORAGE_KEY);
      localStorage.removeItem(CUSTOM_PATCHES_STORAGE_KEY);
    } catch {
      // Cloud data is already loaded.
    }
    legacyProjects = [];
    legacyCustomPatches = [];
    renderProjects();
    renderMyPatches();
    renderInstruments();
    updateCloudState("connected");
  } catch (error) {
    updateCloudState("error");
    throw error;
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  if(isLocalBackend()&&(materialLibrary.busy||workspaceSync.importing||performanceInput.recording||state.isRecording||state.isAnalyzing)){els.authMessage.textContent='请先结束当前录制或素材保存，再切换账户';return;}
  if (!cloudEnabled) return;
  const email = els.authEmailInput.value.trim();
  const password = els.authPasswordInput.value;
  if(window.MeldCloud?.provider==='sites'){
    if(!validateEmailAuthForm())return;
  }else if(!email||password.length<8){els.authMessage.textContent='请输入有效邮箱和至少 8 位密码';return;}
  if(window.MeldCloud?.provider==='sites'){emailAuthUI.submitting=true;updateEmailAuthFields();}
  els.authSubmitBtn.disabled = true;
  els.authMessage.textContent =
    authMode === "signup" ? "正在验证邮箱并创建账户…" : authMode === "reset" ? "正在验证并重置密码…" : "正在登录…";
  els.authMessage.classList.remove("success");
  try {
    if(authMode==='reset'){
      const result=await window.MeldCloud.resetPassword(email,password,document.getElementById('authCodeInput').value.trim());
      setAuthMode('login');els.authPasswordInput.value='';document.getElementById('authConfirmInput').value='';els.authMessage.textContent=result.message;els.authMessage.classList.add('success');return;
    }
    if (authMode === "signup") {
      const result = await window.MeldCloud.signUp(email, password,document.getElementById('authCodeInput').value.trim());
      if (result.needsConfirmation) {
        setAuthMode("login");
        els.authMessage.textContent = "账户已创建，请先打开邮箱完成验证，再回来登录。";
        els.authMessage.classList.add("success");
        return;
      }
      cloudSession = result.session;
    } else {
      cloudSession = await window.MeldCloud.signIn(email, password);
    }
    await loadCloudWorkspace();
    closeAuthDialog();
    showToast(isLocalBackend()?"已连接云端数据库，账户数据已读取":"已连接云端，作品与音色同步完成");
  } catch (error) {
    els.authMessage.textContent = error.message || "登录失败，请稍后重试";
  } finally {
    els.authSubmitBtn.disabled = false;
    if(window.MeldCloud?.provider==='sites'){emailAuthUI.submitting=false;updateEmailAuthFields();}
  }
}

async function logoutCloud() {
  if(isLocalBackend()&&(materialLibrary.busy||workspaceSync.importing||performanceInput.recording||state.isRecording||state.isAnalyzing)){showToast('请先结束当前录制或素材保存，再退出');return;}
  if(isLocalBackend()){try{await flushBackendWorkspace();await window.MeldCloud.flush();}catch(error){cacheBackendCollection('projects',projects);cacheBackendCollection('patches',customPatches);showToast('部分修改未同步，已保留本机恢复数据：'+error.message);}}
  try{await window.MeldCloud?.signOut();}catch(error){showToast('退出未完成：'+error.message);return;}
  cloudSession = null;
  if(isLocalBackend()){await leaveLocalWorkspace();renderProjects();renderMyPatches();renderInstruments();renderArrangement();updateCloudState('signed-out');closeAuthDialog();showToast('已退出云端账户，访客内容已恢复');return;}
  projects = [];
  customPatches = [];
  renderProjects();
  renderMyPatches();
  renderInstruments();
  renderArrangement();
  updateCloudState("signed-out");
  closeAuthDialog();
  showToast("已退出云端账户");
}

async function initializeCloud() {
  cloudEnabled = Boolean(window.MeldCloud?.configured());
  if (!cloudEnabled) {
    updateCloudState("signed-out");
    return;
  }
  try {
    cloudSession = await window.MeldCloud.restoreSession();
    if (cloudSession) {
      await loadCloudWorkspace();
    } else {
      updateCloudState("signed-out");
    }
  } catch {
    cloudSession = null;
    updateCloudState("error");
  }
}

function switchView(view) {
  if (view === "hongkong") {
    view = "arrangement";
    document.getElementById("arrangementDemoDrawer").open = true;
  }
  if (view === "dx7") {
    view = "sounds";
    document.getElementById("dx7LibraryHost").closest("details").open = true;
  }
  if (!["studio", "works", "lab", "arrangement", "sounds"].includes(view)) return;
  if (state.currentView === "studio" && view !== "studio" && state.isRecording) {
    stopRecording();
  }
  if (state.currentView === "studio" && view !== "studio") stopMelodyPlayback();
  if (state.currentView === "lab" && view !== "lab") {
    stopLabRecording();
    stopLabPlayback();
  }
  if (state.currentView === "works" && view !== "works") stopProjectPreview();
  if (state.currentView === "arrangement" && view !== "arrangement") {
    globalThis.MeldNightPocket?.pausePreview();
    globalThis.MeldAfterglowDrive?.pausePreview();
    performanceInput.prepareToken = (performanceInput.prepareToken || 0) + 1;
    performanceInput.preparing = false;
    stopPerformanceTake(); releasePerformanceKeys(); stopArrangementPlayback();
  }
  if (
    (state.currentView === "studio" || state.currentView === "arrangement") &&
    view !== "studio" &&
    view !== "arrangement"
  ) {
    state.metronome = false;
    stopMetronome();
  }

  if (state.currentView === "sounds" && view !== "sounds") {
    globalThis.MeldSoundLibrary?.stop();
    globalThis.MeldSourceInstruments?.stopPreview();
    globalThis.MeldDx7Library?.stop();
  }
  state.currentView = view;
  document.body.classList.toggle("show-arrangement-studio", view === "arrangement");
  document.querySelectorAll(".nav-item").forEach((item) => {
    const active = item.dataset.view === view;
    item.classList.toggle("active", active);
    if (active) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });
  els.studioView.hidden = view !== "studio";
  els.worksView.hidden = view !== "works";
  els.labView.hidden = view !== "lab";
  els.arrangementView.hidden = view !== "arrangement";
  els.studioView.classList.toggle("active", view === "studio");
  els.worksView.classList.toggle("active", view === "works");
  els.labView.classList.toggle("active", view === "lab");
  els.arrangementView.classList.toggle("active", view === "arrangement");
  const sounds = document.getElementById("soundsView");
  sounds.hidden = view !== "sounds";
  sounds.classList.toggle("active", view === "sounds");
  placeArrangementAssistant(view);
  globalThis.MeldWorkspacePages?.onViewChange(view);
  els.saveProjectBtn.hidden = view !== "studio" && view !== "arrangement";
  els.exportBtn.hidden = view !== "studio";

  if (view === "works") renderProjects();
  if (view === "lab") {
    renderLabKeyboard();
    syncLabControls();
    startLabVisualizer();
  } else {
    cancelAnimationFrame(labAnimationFrame);
    labAnimationFrame = null;
  }
  if (view === "arrangement") {
    ensureArrangementTracks();
    renderArrangement();
  }
  const shortcut = document.querySelector(".site-footer span:last-child");
  if (shortcut) {
    shortcut.textContent =
      view === "studio"
        ? "SPACE 播放 · R 录音"
        : view === "lab"
          ? "A–K 演奏 · SPACE 琶音"
          : view === "arrangement"
            ? "A–K 演奏 · R 分轨录制 · SPACE 播放/停止"
            : "LOCAL LIBRARY";
  }
  if (view === "studio") window.setTimeout(() => drawVisualizer(0), 40);
  window.scrollTo({ top: 0, behavior: "auto" });
}

function formatLabValue(key, value) {
  const number = Number(value);
  if (key === "brightness") {
    return number >= 1000 ? `${(number / 1000).toFixed(1)} kHz` : `${Math.round(number)} Hz`;
  }
  if (key === "sustain" || key === "space" || key === "drive") {
    return `${Math.round(number)}%`;
  }
  return `${Math.round(number)} ms`;
}

function updateRangeFill(input) {
  const min = Number(input.min) || 0;
  const max = Number(input.max) || 100;
  const value = Number(input.value);
  input.style.setProperty("--range-value", `${((value - min) / (max - min)) * 100}%`);
}

function syncLabControls() {
  const map = {
    attack: [els.attackControl, els.attackValue],
    decay: [els.decayControl, els.decayValue],
    sustain: [els.sustainControl, els.sustainValue],
    release: [els.releaseControl, els.releaseValue],
    brightness: [els.brightnessControl, els.brightnessValue],
    space: [els.spaceControl, els.spaceValue],
    drive: [els.driveControl, els.driveValue],
  };
  Object.entries(map).forEach(([key, [input, output]]) => {
    input.value = String(labState.params[key]);
    output.textContent = formatLabValue(key, labState.params[key]);
    updateRangeFill(input);
  });
  els.labPresetName.textContent = labState.presetName;
  els.labPresetMeta.textContent = labState.presetMeta;
  syncLabLibrarySelection();
}

function syncLabLibrarySelection() {
  const instrument = getInstrumentDefinition(labState.instrument);
  document.getElementById("labBuiltinSelection").textContent = instrument.dx7 || instrument.samplePack ? "" : instrument.name;
  document.getElementById("labDx7Selection").textContent = instrument.dx7 ? labInstrumentLabel(instrument) : "256 个音色";
  const preset = LAB_PRESETS.find(item => item.name === labState.presetName && item.instrument === labState.instrument);
  document.getElementById("labPresetSelection").textContent = preset?.name || LAB_PRESETS.length + " 个预设";

  document.querySelectorAll("#labView [data-lab-instrument], #labView [data-lab-preset]").forEach((button) => {
    const active = button.dataset.labInstrument === labState.instrument ||
      Boolean(preset && button.dataset.labPreset === preset.id);
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function labInstrumentLabel(instrument) {
  if (!instrument.dx7) return instrument.name;
  return (instrument.name.split(" · ")[1] || instrument.name).replace(/\s+/g, " ");
}

function saveLabSettings() {
  queueBackendDocument("settings",{id:"lab",instrument:labState.instrument,params:labState.params,presetName:labState.presetName,presetMeta:labState.presetMeta});
  try {
    localStorage.setItem(
      labStorageKey(),
      JSON.stringify({
        instrument: labState.instrument,
        params: labState.params,
        presetName: labState.presetName,
        presetMeta: labState.presetMeta,
      })
    );
  } catch {
    // The instrument remains playable when storage is unavailable.
  }
}

function restoreLabSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(labStorageKey()) || "null");
    if (!stored || !LAB_DEFAULTS[stored.instrument] || !stored.params) return;
    labState.instrument = stored.instrument;
    labState.params = {
      ...LAB_DEFAULTS[stored.instrument],
      ...Object.fromEntries(
        Object.entries(stored.params).map(([key, value]) => [
          key,
          Number.isFinite(Number(value)) ? Number(value) : LAB_DEFAULTS[stored.instrument][key],
        ])
      ),
    };
    labState.presetName = stored.presetName || INSTRUMENTS.find((i) => i.id === stored.instrument).name;
    labState.presetMeta = stored.presetMeta || `${stored.instrument.toUpperCase()} · CUSTOM`;
  } catch {
    // Fall back to the built-in electric-guitar preset.
  }
}

function labInstrumentFamily(instrument) {
  if (instrument.sampleFamily) return instrument.sampleFamily;
  if (isDrumInstrument(instrument.id)) return "drums";
  const name = instrument.en.toLowerCase();
  if (/bass/.test(name)) return "bass";
  if (/synth|analog|pad/.test(name)) return "synth";
  if (/guitar|harp|string/.test(name)) return "strings";
  if (/sax|flute|clarinet|trumpet|brass/.test(name)) return "winds";
  if (/piano|organ|keys|clav|marimba|vibraphone|bell/.test(name)) return "keys";
  return "other";
}

function renderLabSamplePacks() {
  const rack = document.getElementById("labSamplePacks");
  const packs = new Map();
  for (const instrument of INSTRUMENTS) {
    if (!instrument.samplePack) continue;
    if (!packs.has(instrument.samplePack)) packs.set(instrument.samplePack, []);
    packs.get(instrument.samplePack).push(instrument);
  }
  for (const [pack, instruments] of packs) {
    let drawer = [...rack.children].find(item => item.dataset.samplePack === pack);
    if (!drawer) {
      drawer = document.createElement("details");
      drawer.className = "lab-rack-drawer";
      drawer.name = "lab-rack";
      drawer.dataset.samplePack = pack;
      rack.append(drawer);
    }
    const names = instruments.map(instrument => instrument.name.replace(pack + " · ", ""));
    drawer.innerHTML = `<summary><strong>${escapeHtml(pack)} 音色包</strong><span>${instruments.length} 个音色</span><small>${escapeHtml(names.join("、"))}</small></summary><div class="lab-instrument-list">${instruments.map(instrument => `<button type="button" class="lab-instrument-button" data-lab-instrument="${escapeHtml(instrument.id)}" aria-pressed="${instrument.id === labState.instrument}"><span class="rail-icon">${instrument.icon}</span><strong>${escapeHtml(instrument.name)}</strong></button>`).join("")}</div>`;
  }
}

function renderLabInstruments() {
  renderLabSamplePacks();
  const query = document.getElementById("labInstrumentSearch").value.trim().toLowerCase();
  const family = document.getElementById("labInstrumentFamily").value;
  const instruments = INSTRUMENTS.filter(instrument =>
    !instrument.dx7 && !instrument.samplePack && (family === "all" || labInstrumentFamily(instrument) === family)
    && [instrument.name, instrument.en, instrument.desc, instrument.id].join(" ").toLowerCase().includes(query)
  );
  document.getElementById("labInstrumentCount").textContent = instruments.length
    ? `${instruments.length} 个音色` : "没有匹配的音色";
  els.labInstrumentList.innerHTML = instruments.map(instrument => `
    <button
      class="lab-instrument-button${instrument.id === labState.instrument ? " active" : ""}"
      type="button"
      aria-pressed="${instrument.id === labState.instrument}"
      data-lab-instrument="${instrument.id}"
    >
      <span class="rail-icon">${instrument.icon}</span>
      <span>
        <strong>${escapeHtml(instrument.name)}</strong>
        <small>${escapeHtml(instrument.en)}</small>
      </span>
    </button>
  `).join("");
  els.labInstrumentList.querySelectorAll("[data-lab-instrument]").forEach((button) => {
    button.addEventListener("click", () => {
      loadLabInstrument(button.dataset.labInstrument);
    });
  });
}

function useLibraryInstrument(id, destination) {
  if (destination === "arrangement") {
    if (performanceInput.recording || performanceInput.preparing) {
      showToast("请先停止音轨录制");
      return;
    }
    const track = createArrangementTrack(id, getInstrumentDefinition(id).name);
    arrangement.tracks.push(track);
    performanceInput.trackId = track.id;
    persistArrangement();
    renderArrangement();
    switchView("arrangement");
    showToast("已加入音轨，可用键盘录制或在钢琴卷帘编辑");
  } else if (destination === "lab") {
    switchView("lab");
    loadLabInstrument(id);
    const drawer = document.getElementById("labSamplePacks").querySelector(`[data-lab-instrument="${CSS.escape(id)}"]`)?.closest("details")
      || (getInstrumentDefinition(id).dx7 ? document.getElementById("labDx7Drawer") : document.querySelector(".lab-rack-drawer"));
    if (drawer) drawer.open = true;
  } else if (destination === "studio") {
    switchView("studio");
    selectInstrument(id, true);
  }
}

function loadLabInstrument(id) {
  const instrument = getInstrumentDefinition(id);
  stopLabPlayback();
  labState.instrument = instrument.id;
  labState.params = { ...LAB_DEFAULTS[instrument.id] };
  labState.presetName = instrument.name;
  labState.presetMeta = instrument.dx7 ? "DX7 · " + instrument.bank : instrument.en + " · DEFAULT";
  renderLabKeyboard();
  syncLabControls();
  saveLabSettings();
  els.labStatusText.textContent = "已载入 " + instrument.name;
  prepareSampledInstrument(instrument.id, getAudioContext()).catch(error => showToast(error.message));
}

let labOctaveOverride=null, labKeyOverride=null;
const labChordShapes={
  major:['',[0,4,7]], minor:['m',[0,3,7]], dim:['dim',[0,3,6]], aug:['aug',[0,4,8]],
  7:['7',[0,4,7,10]], m7:['m7',[0,3,7,10]], maj7:['maj7',[0,4,7,11]],
  mMaj7:['mMaj7',[0,3,7,11]], m7b5:['m7♭5',[0,3,6,10]], dim7:['dim7',[0,3,6,9]]
};
function labKeyboardKey(){
  return MeldPianoRollCore.key(labKeyOverride||selectedArrangementTrack()?.noteEditKey||arrangement.templateMeta?.key||state.key);
}
function labKeyboardBase(octave=null){
  const defaultOctave=4+(window.MeldSourceInstruments?.labOffset?.(labState.instrument)||0)/12;
  const tonic=labKeyboardKey().tonic;
  const safeOctave=octave??Math.min(labOctaveOverride??defaultOctave,tonic>7?7:8);
  return (safeOctave+1)*12+tonic;
}
function labKeyboardOffset(){return labKeyboardBase()-60;}
function labChordNotes(){
  const shape=labChordShapes[document.getElementById('labChordShape').value];
  return shape?shape[1].map(interval=>labKeyboardBase()+interval):[];
}
function renderLabKeyboard() {
  const scale=labKeyboardKey(),harmony=MeldPianoRollCore.harmonyData(scale);
  const pads=window.MeldSourceInstruments?.drumPads?.(labState.instrument);
  const range=document.getElementById('labOctave'),tonic=document.getElementById('labTonic'),mode=document.getElementById('labScaleMode');
  const base=labKeyboardBase();
  const keyName=midi=>MeldPianoRollCore.harmonyAt(harmony,midi).note;
  if(!tonic.options.length)for(let i=0;i<12;i++)tonic.add(new Option(pitchLabel(60+i).slice(0,-1),i));
  tonic.value=String(scale.tonic);
  mode.value=scale.mode;
  const octaveOptions=Array.from({length:9},(_,octave)=>{
    const start=labKeyboardBase(octave);
    return start+12<=127?`<option value="${octave}">${keyName(start)} — ${keyName(start+12)}</option>`:'';
  }).join('');
  if(range.innerHTML!==octaveOptions)range.innerHTML=octaveOptions;
  range.value=String(Math.floor(base/12)-1);
  range.disabled=tonic.disabled=mode.disabled=Boolean(pads);
  document.getElementById('labChordGuide').hidden=Boolean(pads);
  if(pads){els.labKeyboard.style.paddingInline='';els.labKeyboard.innerHTML=pads.map(pad=>`<button type="button" class="drum-pad" data-midi="${pad.midi}">${escapeHtml(pad.name)}<small>${pad.key}</small></button>`).join('');els.labKeyboard.querySelectorAll('[data-midi]').forEach(key=>key.addEventListener('pointerdown',event=>{event.preventDefault();triggerLabNote(Number(key.dataset.midi),false);}));return;}
  const black=midi=>[1,3,6,8,10].includes(midi%12);
  const notes=Array.from({length:13},(_,i)=>base+i),whites=notes.filter(midi=>!black(midi));
  const inset=black(base)?4:0;
  const shortcuts=Object.fromEntries(Object.entries(LAB_KEY_MAP).map(([key,midi])=>[midi+base-60,key.toUpperCase()]));
  const chordNotes=labChordNotes(),shape=labChordShapes[document.getElementById('labChordShape').value];
  document.getElementById('labChordName').textContent=shape?keyName(base).replace(/\d+$/,'')+shape[0]:'';
  document.getElementById('labChordPlay').disabled=!shape;
  els.labKeyboard.style.paddingInline=`${inset}%`;
  els.labKeyboard.innerHTML=notes.map(midi=>{
    const isBlack=black(midi),position=inset+(100-2*inset)*whites.filter(white=>white<midi).length/whites.length;
    const {note,chord,symbol}=MeldPianoRollCore.harmonyAt(harmony,midi);
    return `<button class="piano-key ${isBlack?'black':'white'}${chordNotes.includes(midi)?' chord-tone':''}" type="button" data-midi="${midi}" ${isBlack?`style="left:${position}%"`:''}
      aria-label="${note}${chord?' · '+chord:''}" title="${chord||note}"><span class="piano-key-caption"><span>${note}</span>${symbol?`<b class="piano-chord-label">${symbol}</b>`:''}<small>${shortcuts[midi]}</small></span></button>`;
  }).join('');
  els.labKeyboard.querySelectorAll("[data-midi]").forEach((key) => {
    key.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      triggerLabNote(Number(key.dataset.midi),false);
    });
  });
}

function renderLabPresets() {
  els.labPresetGrid.innerHTML = LAB_PRESETS.map((preset) => {
    const active = preset.name === labState.presetName && preset.instrument === labState.instrument;
    return `
      <button
        class="lab-preset-card${active ? " active" : ""}"
        type="button"
        data-lab-preset="${preset.id}"
        aria-pressed="${active}"
      >
        <strong>${preset.name}</strong>
        <small>${preset.short}</small>
      </button>
    `;
  }).join("");
  els.labPresetGrid.querySelectorAll("[data-lab-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      const preset = LAB_PRESETS.find((item) => item.id === button.dataset.labPreset);
      stopLabPlayback();
      labState.instrument = preset.instrument;
      labState.params = { ...preset.params };
      labState.presetName = preset.name;
      labState.presetMeta = preset.meta;
      renderLabKeyboard();
      syncLabControls();
      saveLabSettings();
      els.labStatusText.textContent = `已载入预设「${preset.name}」`;
      triggerLabNote(60, 0.7);
    });
  });
}

function ensureLabEngine() {
  const context = getAudioContext();
  if (!labAnalyser || labAnalyser.context !== context) {
    labAnalyser = context.createAnalyser();
    labAnalyser.fftSize = 2048;
    labAnalyser.smoothingTimeConstant = 0.65;
    labOutput = context.createGain();
    labOutput.gain.value = 0.72;
    labOutput.connect(labAnalyser);
    labAnalyser.connect(context.destination);
  }
  return context;
}

function schedulePatchVoice(instrument, midi, when, duration, params, destination, volume = 1) {
  if (openSampleBanks.has(instrument)) return scheduleOpenSample(instrument, midi, when, duration, params, destination, volume);
  if(window.MeldDx7?.has(instrument))return window.MeldDx7.schedule(instrument,midi,when,duration,params,destination,volume);
  if(window.MeldSourceInstruments?.has(instrument))return window.MeldSourceInstruments.schedule(instrument,midi,when,duration,params,destination,volume);
  if(stringBankFor(instrument))return scheduleStringSampleVoice(instrument,midi,when,duration,params,destination,volume);
  if(isGrandPianoInstrument(instrument))return scheduleGrandPianoVoice(instrument,midi,when,duration,params,destination,volume);
  if (isDrumInstrument(instrument)) return scheduleDrumVoice(instrument, midi, when, duration, params, destination, volume);
  const context = getAudioContext();
  const attack = Math.max(0.005, params.attack / 1000);
  const decay = Math.max(0.02, params.decay / 1000);
  const release = Math.max(0.08, params.release / 1000);
  const holdEnd = when + Math.max(attack + decay + 0.04, duration);
  const end = holdEnd + release + 0.06;
  const frequency = midiToFrequency(midi);
  const frequencyMap = {
    ...EXTRA_VOICE_MAP,
    piano: [
      { type: "sine", ratio: 1, gain: 0.72, detune: 0 },
      { type: "sine", ratio: 2.01, gain: 0.25, detune: 1 },
      { type: "triangle", ratio: 3.01, gain: 0.1, detune: -1 },
    ],
    acoustic: [
      { type: "triangle", ratio: 1, gain: 0.64, detune: 0 },
      { type: "sine", ratio: 2.01, gain: 0.24, detune: 1.5 },
      { type: "sine", ratio: 3.02, gain: 0.1, detune: -2 },
    ],
    electric: [
      { type: "sawtooth", ratio: 1, gain: 0.55, detune: -6 },
      { type: "sawtooth", ratio: 1, gain: 0.34, detune: 7 },
    ],
    sax: [
      { type: "sawtooth", ratio: 1, gain: 0.54, detune: 0 },
      { type: "square", ratio: 0.5, gain: 0.11, detune: 0 },
    ],
    strings: [
      { type: "sawtooth", ratio: 1, gain: 0.34, detune: -8 },
      { type: "sawtooth", ratio: 1, gain: 0.33, detune: 8 },
      { type: "sawtooth", ratio: 0.5, gain: 0.2, detune: -12 },
      { type: "triangle", ratio: 2, gain: 0.09, detune: 4 },
    ],
    synth: [
      { type: "sawtooth", ratio: 1, gain: 0.4, detune: 4 },
      { type: "square", ratio: 1, gain: 0.17, detune: -6 },
      { type: "square", ratio: 0.5, gain: 0.11, detune: 0 },
    ],
  };
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(Math.max(300, params.brightness), when);
  filter.Q.value = instrument === "synth" ? 4.8 : instrument === "sax" ? 1.5 : 0.75;

  const amp = context.createGain();
  const peak = (instrument === "strings" ? 0.105 : 0.13) * volume;
  const sustain = Math.max(0.001, peak * (params.sustain / 100));
  amp.gain.setValueAtTime(0.0001, when);
  amp.gain.linearRampToValueAtTime(peak, when + attack);
  amp.gain.linearRampToValueAtTime(sustain, when + attack + decay);
  amp.gain.setValueAtTime(sustain, holdEnd);
  amp.gain.exponentialRampToValueAtTime(0.0001, end);

  let textureNode = filter;
  if (params.drive > 0) {
    const shaper = context.createWaveShaper();
    shaper.curve = createDriveCurve(2 + (params.drive / 100) * 24);
    shaper.oversample = "2x";
    filter.connect(shaper);
    textureNode = shaper;
  }
  textureNode.connect(amp);

  const dry = context.createGain();
  dry.gain.value = 1 - Math.min(0.35, params.space / 240);
  amp.connect(dry);
  dry.connect(destination);
  const cleanupNodes = [filter, amp, dry];
  const sources = [];

  // AI-created synth patches can add a tempo-like filter wobble without needing a sample pack.
  if (instrument === "synth" && params.lfoRateHz > 0 && params.lfoDepthHz > 0) {
    const wobble = context.createOscillator();
    const depth = context.createGain();
    wobble.type = "sine";
    wobble.frequency.setValueAtTime(Math.min(12, Math.max(0.1, params.lfoRateHz)), when);
    depth.gain.setValueAtTime(Math.min(5000, Math.max(0, params.lfoDepthHz)), when);
    wobble.connect(depth);
    depth.connect(filter.frequency);
    wobble.start(when);
    wobble.stop(end);
    sources.push(wobble);
    cleanupNodes.push(depth);
  }

  if (params.space > 0) {
    const delay = context.createDelay(1);
    delay.delayTime.value = instrument === "strings" ? 0.34 : 0.21;
    const feedback = context.createGain();
    feedback.gain.value = Math.min(0.34, params.space / 310);
    const wet = context.createGain();
    wet.gain.value = Math.min(0.32, params.space / 260);
    amp.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(destination);
    cleanupNodes.push(delay, feedback, wet);
  }

  frequencyMap[instrument].forEach((voice) => {
    const oscillator = context.createOscillator();
    const voiceGain = context.createGain();
    oscillator.type = voice.type;
    oscillator.frequency.setValueAtTime(frequency * voice.ratio, when);
    oscillator.meldBaseDetune = voice.detune;
    oscillator.detune.setValueAtTime(voice.detune, when);
    voiceGain.gain.value = voice.gain;
    oscillator.connect(voiceGain);
    voiceGain.connect(filter);
    oscillator.start(when);
    oscillator.stop(end);
    sources.push(oscillator);
    if ((instrument === "fmkeys" || instrument === "digitalbell") && voice === frequencyMap[instrument][0]) {
      const modulator = context.createOscillator(), depth = context.createGain();
      modulator.frequency.setValueAtTime(frequency * (instrument === "fmkeys" ? 2 : 2.76), when);
      depth.gain.setValueAtTime(frequency * (instrument === "fmkeys" ? 1.6 : 2.2), when);
      depth.gain.exponentialRampToValueAtTime(frequency * .025, when + .7);
      modulator.connect(depth); depth.connect(oscillator.frequency);
      modulator.start(when); modulator.stop(end); sources.push(modulator); cleanupNodes.push(depth);
    }

    if (instrument === "sax" && voice.type === "sawtooth") {
      const lfo = context.createOscillator();
      const lfoGain = context.createGain();
      lfo.frequency.value = 5.2;
      lfoGain.gain.value = 3.4;
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.detune);
      lfo.start(when + attack);
      lfo.stop(end);
      sources.push(lfo);
    }
  });

  let remainingVoices = sources.length;
  sources.forEach(source => { source.onended = () => {
    source.meldEnded = true;
    if (--remainingVoices === 0) [...sources, ...cleanupNodes].forEach(node => { try { node.disconnect(); } catch {} });
  }; });
  // Live keyboard voices share this timbre but release at the physical key-up.
  sources.release = (at = context.currentTime) => {
    const releaseAt = Math.max(when, at);
    if (amp.gain.cancelAndHoldAtTime) amp.gain.cancelAndHoldAtTime(releaseAt);
    else { amp.gain.cancelScheduledValues(releaseAt); amp.gain.setValueAtTime(Math.max(0.0001, amp.gain.value), releaseAt); }
    amp.gain.exponentialRampToValueAtTime(0.0001, releaseAt + Math.min(1.5, release));
    sources.forEach(source => { try { source.stop(releaseAt + Math.min(1.5, release) + .06); } catch {} });
  };
  return sources;
}

function playLabNote(midi, duration = 0.72) {
  if(midi<0)return;
  const context = ensureLabEngine();
  if(!sampledInstrumentReady(labState.instrument,context)){const selected=labState.instrument;els.labStatusText.textContent="正在准备音色…";prepareSampledInstrument(selected,context).then(()=>{if(labState.instrument===selected&&state.currentView==="lab")playLabNote(midi,duration);}).catch(error=>showToast(error.message));return;}
  const params = labState.params;
  const instrument = labState.instrument;
  const when = context.currentTime + 0.015;
  const release = Math.max(0.08, params.release / 1000);
  const end = when + Math.max(params.attack / 1000 + params.decay / 1000 + 0.04, duration) + release + 0.06;
  const sources = schedulePatchVoice(
    instrument,
    midi,
    when,
    duration,
    params,
    labOutput
  );
  labActiveSources.push(...sources);
  const readout = noteNameFromMidi(midi);
  els.labNoteReadout.innerHTML = `<strong>${readout.name}${readout.octave}</strong><span>LIVE NOTE</span>`;
  els.labStatusText.textContent = `${getInstrumentDefinition(instrument).name} · ${formatLabValue("brightness", params.brightness)} 亮度`;
  const miniMeter = document.querySelector(".lab-mini-meter");
  miniMeter?.classList.add("playing");
  const key = els.labKeyboard.querySelector(`[data-midi="${midi}"]`);
  key?.classList.add("active");

  const uiTimer = window.setTimeout(() => {
    key?.classList.remove("active");
    miniMeter?.classList.remove("playing");
    if (state.currentView === "lab") {
      els.labNoteReadout.innerHTML = "<strong>—</strong><span>PRESS A KEY</span>";
      els.labStatusText.textContent = "声音已释放，选择下一个音";
    }
  }, Math.max(520, (end - context.currentTime) * 1000));
  labTimeouts.push(uiTimer);

  const cleanupTimer = window.setTimeout(() => {
    labActiveSources = labActiveSources.filter((node) => !sources.includes(node));
    sources.forEach((node) => {
      try {
        node.disconnect();
      } catch {
        // The node may already have been disconnected.
      }
    });
  }, Math.max(800, (end - context.currentTime + 0.2) * 1000));
  labTimeouts.push(cleanupTimer);
}

function triggerLabNote(midi, relativeInput=true) {
  if (state.currentView !== "lab") return;
  const mapped=relativeInput?(window.MeldSourceInstruments?.drumPads?.(labState.instrument)?(window.MeldSourceInstruments.labMidi(labState.instrument,midi)):midi+labKeyboardOffset()):midi;
  if(mapped>=0)playLabNote(mapped, 0.72);
}

function stopLabPlayback() {
  labTimeouts.forEach((timer) => window.clearTimeout(timer));
  labTimeouts = [];
  labActiveSources.forEach((source) => {
    try {
      source.stop();
    } catch {
      // The source may already have ended.
    }
  });
  labActiveSources = [];
  document.querySelectorAll(".piano-key.active").forEach((key) => key.classList.remove("active"));
  document.querySelector(".lab-mini-meter")?.classList.remove("playing");
  if (els.labNoteReadout) {
    els.labNoteReadout.innerHTML = "<strong>—</strong><span>PRESS A KEY</span>";
  }
}

function startLabArpeggio() {
  if (state.currentView !== "lab") return;
  if(!sampledInstrumentReady(labState.instrument,getAudioContext())){prepareSampledInstrument(labState.instrument).then(()=>{if(state.currentView==="lab")startLabArpeggio();}).catch(error=>showToast(error.message));return;}
  stopLabPlayback();
  const source = window.MeldSourceInstruments;
  const pads = source?.drumPads?.(labState.instrument);
  const base = labKeyboardBase();
  const harmony = MeldPianoRollCore.harmonyData(labKeyboardKey());
  const intervals = harmony ? [0,harmony.scale[2],harmony.scale[4],harmony.scale[6]] : [0,3,7,10];
  const notes = pads ? [60,63,67,70,72,75,79,84].map(midi=>source.labMidi(labState.instrument,midi)) :
    [...intervals,...intervals.slice(0,3).map(interval=>interval+12),24].map(interval=>base+interval).filter(midi=>midi<=127);
  els.labStatusText.textContent = "琶音演奏中 · 让空间慢慢展开";
  notes.forEach((midi, index) => {
    const timer = window.setTimeout(() => {
      playLabNote(midi,0.34);
    }, index * 145);
    labTimeouts.push(timer);
  });
  const endTimer = window.setTimeout(() => {
    els.labStatusText.textContent = "琶音结束 · 再试一个声音";
  }, notes.length * 145 + 900);
  labTimeouts.push(endTimer);
}

function drawLabVisualizer() {
  if (state.currentView !== "lab") {
    labAnimationFrame = null;
    return;
  }
  const canvas = els.labCanvas;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    labAnimationFrame = requestAnimationFrame(drawLabVisualizer);
    return;
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) {
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);

  const data = new Float32Array(1024);
  let hasAudio = false;
  if (labAnalyser) {
    labAnalyser.getFloatTimeDomainData(data);
    hasAudio = data.some((value) => Math.abs(value) > 0.002);
  }
  const instrument = INSTRUMENTS.find((item) => item.id === labState.instrument);
  const center = rect.height / 2;
  const gradient = ctx.createLinearGradient(0, 0, rect.width, 0);
  gradient.addColorStop(0, "rgba(198,237,143,0.78)");
  gradient.addColorStop(0.58, instrument.color);
  gradient.addColorStop(1, "rgba(255,128,85,0.68)");

  ctx.beginPath();
  for (let x = 0; x <= rect.width; x += 2) {
    const progress = x / rect.width;
    const index = Math.min(data.length - 1, Math.floor(progress * data.length));
    const ambient =
      Math.sin(progress * Math.PI * 7 + performance.now() * 0.0011) * 0.028 +
      Math.sin(progress * Math.PI * 17 - performance.now() * 0.0006) * 0.012;
    const value = hasAudio ? data[index] * 3.1 : ambient;
    const y = center + value * rect.height * 0.74;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = gradient;
  ctx.lineWidth = hasAudio ? 1.7 : 1;
  ctx.shadowColor = hasAudio ? instrument.color : "rgba(198,237,143,0.2)";
  ctx.shadowBlur = hasAudio ? 10 : 4;
  ctx.stroke();
  ctx.shadowBlur = 0;

  if (hasAudio) {
    ctx.lineTo(rect.width, center);
    ctx.lineTo(0, center);
    ctx.closePath();
    const fill = ctx.createLinearGradient(0, 0, 0, rect.height);
    fill.addColorStop(0, "rgba(255,128,85,0.07)");
    fill.addColorStop(0.5, "rgba(198,237,143,0.02)");
    fill.addColorStop(1, "rgba(255,128,85,0.06)");
    ctx.fillStyle = fill;
    ctx.fill();
  }

  labAnimationFrame = requestAnimationFrame(drawLabVisualizer);
}

function startLabVisualizer() {
  cancelAnimationFrame(labAnimationFrame);
  labAnimationFrame = requestAnimationFrame(drawLabVisualizer);
}

function updateLabParameter(key, value) {
  if (!(key in labState.params)) return;
  labState.params[key] = Number(value);
  const outputMap = {
    attack: els.attackValue,
    decay: els.decayValue,
    sustain: els.sustainValue,
    release: els.releaseValue,
    brightness: els.brightnessValue,
    space: els.spaceValue,
    drive: els.driveValue,
  };
  const inputMap = {
    attack: els.attackControl,
    decay: els.decayControl,
    sustain: els.sustainControl,
    release: els.releaseControl,
    brightness: els.brightnessControl,
    space: els.spaceControl,
    drive: els.driveControl,
  };
  outputMap[key].textContent = formatLabValue(key, value);
  updateRangeFill(inputMap[key]);
  labState.presetName = `${INSTRUMENTS.find((item) => item.id === labState.instrument).name} · 自定义`;
  labState.presetMeta = `${labState.instrument.toUpperCase()} · CUSTOM PATCH`;
  els.labPresetName.textContent = labState.presetName;
  els.labPresetMeta.textContent = labState.presetMeta;
  syncLabLibrarySelection();
  saveLabSettings();
}

function loadArrangement() {
  try {
    const stored = JSON.parse(localStorage.getItem(arrangementStorageKey()) || "null");
    if (stored && Array.isArray(stored.tracks)) {
      arrangement.tracks = stored.tracks
        .filter((track) => track && track.id && Array.isArray(track.notes))
        .map((track, index) => ({
          ...track,
          name: track.name || `音轨 ${index + 1}`,
          volume: Number.isFinite(Number(track.volume)) ? Number(track.volume) : 78,
          muted: Boolean(track.muted),
          solo: Boolean(track.solo),
          audioClips: Array.isArray(track.audioClips) ? track.audioClips.map(clip => ({...clip,peaks:[...(clip.peaks||[])]})) : [],
        }));
      arrangement.bpm = Math.max(50, Math.min(160, Number(stored.bpm) || 84));
      arrangement.baseBpm = Math.max(
        50,
        Math.min(160, Number(stored.baseBpm || stored.bpm) || arrangement.bpm)
      );
      arrangement.duration = Math.max(8, Number(stored.duration) || 12);
      arrangement.sections = Array.isArray(stored.sections) ? stored.sections : [];
      arrangement.templateMeta = stored.templateMeta || null;
    }
  } catch {
    arrangement.tracks = [];
  }
}

function persistArrangement() {
  const payload = {
    tracks: arrangement.tracks.map(cloneArrangementTrackData),
    bpm: arrangement.bpm,
    baseBpm: arrangement.baseBpm,
    duration: arrangement.duration,
    sections: arrangement.sections || [],
    templateMeta: arrangement.templateMeta || null,
    activeProjectId: state.activeProjectId,
    updatedAt: Date.now(),
  };
  try { localStorage.setItem(arrangementStorageKey(), JSON.stringify(payload)); } catch {}
  queueBackendDocument('drafts',{id:'main',...payload});
  if (cloudEnabled) {
    if (state.activeProjectId && cloudSession) {
      const project = projects.find((item) => item.id === state.activeProjectId);
      if (project) {
        project.arrangement = payload.tracks;
        project.arrangementBpm = arrangement.bpm;
        project.arrangementBaseBpm = arrangement.baseBpm;
        project.arrangementSections = arrangement.sections || [];
        project.arrangementTemplate = arrangement.templateMeta || null;
        project.updatedAt = Date.now();
        persistProjects();
      }
    }
    return;
  }
  try {
    localStorage.setItem(arrangementStorageKey(), JSON.stringify(payload));
  } catch {
    // Arrangement remains usable for the current session.
  }
}

function createArrangementTrack(instrumentId, name, notes = []) {
  const instrument = getInstrumentDefinition(instrumentId);
  return {
    id: makeId("track"),
    name,
    instrument: instrument.id,
    instrumentName: instrument.name,
    instrumentBase: instrument.baseInstrument || instrument.id,
    instrumentPatch: instrument.params ? { ...instrument.params } : null,
    color: instrument.color,
    notes: notes.map((note) => ({ ...note })),
    audioClips: [],
    volume: 78,
    muted: false,
    solo: false,
  };
}

function ensureArrangementTracks() {
  if (arrangement.tracks.length) return;
  const mainInstrument = getInstrumentDefinition(state.instrument);
  const sourceNotes = state.notes.map((note) => ({ ...note }));
  arrangement.tracks = [
    createArrangementTrack(state.instrument, "主旋律", sourceNotes),
    createArrangementTrack("strings", "和声铺底", []),
    createArrangementTrack("bass", "低音", []),
  ];
  arrangement.tracks[0].color = mainInstrument.color;
  arrangement.bpm = Number(els.tempoInput.value) || 84;
  arrangement.baseBpm = arrangement.bpm;
  calculateArrangementDuration();
  persistArrangement();
}

function calculateArrangementDuration() {
  const maxEnd = Math.max(
    0,
    ...arrangement.tracks.map(track => MeldMaterialCore.endOf(track, arrangement.baseBpm, arrangement.bpm))
  );
  arrangement.duration = arrangement.templateMeta
    ? Math.max(arrangement.templateMeta.duration, Math.ceil(maxEnd / 4) * 4)
    : Math.max(12, Math.ceil((maxEnd + 1.5) / 4) * 4);
  return arrangement.duration;
}

function trackWaveSvg(track, duration) {
  const audioWave = materialAudioTrackSvg(track, duration);
  if (!track.notes.length) return audioWave;
  const minMidi = Math.min(38, ...track.notes.map((note) => note.midi));
  const maxMidi = Math.max(50, ...track.notes.map((note) => note.midi + 3));
  const spread = Math.max(8, maxMidi - minMidi);
  const x = (time) => 8 + (time / duration) * 984;
  const y = (midi) => 47 - ((midi - minMidi) / spread) * 34;
  const path = track.notes
    .map((note) => {
      const x1 = x(note.start);
      const x2 = x(note.start + note.duration);
      const noteY = y(note.midi);
      return `M ${x1.toFixed(1)} ${noteY.toFixed(1)} H ${Math.max(x1 + 2, x2).toFixed(1)}`;
    })
    .join(" ");
  return `
    <svg class="arrange-clip-wave" viewBox="0 0 1000 54" preserveAspectRatio="none" aria-hidden="true">
      <path d="${path}" vector-effect="non-scaling-stroke" />
    </svg>
  ` + audioWave;
}

function buildHarmonyNotes(sourceNotes) {
  const intervalByPitchClass = [3, 3, 4, 3, 4, 3, 4, 3, 3, 4, 3, 4];
  return sourceNotes.map((note) => ({
    midi: note.midi - intervalByPitchClass[((note.midi % 12) + 12) % 12],
    start: note.start,
    duration: Math.max(0.2, note.duration * 1.08),
    confidence: note.confidence || 0.8,
  }));
}

function buildBassNotes(duration) {
  const tonic = state.key?.tonic ?? 2;
  const rootMidi = 36 + tonic;
  const fifthMidi = rootMidi + 7;
  const notes = [];
  for (let start = 0; start < duration; start += 4) {
    notes.push({
      midi: start % 8 === 0 ? rootMidi : fifthMidi,
      start,
      duration: 1.65,
      confidence: 0.9,
    });
  }
  return notes;
}

function autoArrangeTracks() {
  if (!state.notes.length) {
    showToast("先录一段主旋律，再进行智能配器");
    return;
  }
  ensureArrangementTracks();
  const sourceNotes = state.notes.map((note) => ({ ...note }));
  if (!arrangement.tracks[0].notes.length) arrangement.tracks[0].notes = sourceNotes;

  const harmonyTrack =
    arrangement.tracks.find((track) => track.name === "和声铺底") ||
    arrangement.tracks[1];
  if (harmonyTrack && !harmonyTrack.notes.length) {
    harmonyTrack.notes = buildHarmonyNotes(sourceNotes);
  }

  const bassTrack =
    arrangement.tracks.find((track) => track.name === "低音") ||
    arrangement.tracks[2];
  if (bassTrack && !bassTrack.notes.length) {
    bassTrack.notes = buildBassNotes(calculateArrangementDuration());
  }
  calculateArrangementDuration();
  persistArrangement();
  renderArrangement();
  showToast("已生成主旋律、和声与低音三个声部");
}

function renderArrangementRuler(duration, tempoScale) {
  const measure = 240 / arrangement.baseBpm;
  const measures = Math.ceil(duration / measure);
  const stride = Math.max(1, Math.ceil(measures / 8));
  const rulerStep = measure * stride / duration * 100;
  els.arrangementRuler.parentElement.style.setProperty("--studio-timeline-step", `${rulerStep}%`);
  els.arrangementRuler.innerHTML = Array.from({ length: Math.ceil(measures / stride) }, (_, index) => {
    const time = index * stride * measure;
    const position = index * rulerStep;
    return `<span${position >= 87 ? ' class="ruler-trailing"' : ""} style="left:${position}%"><b>${index * stride + 1}</b><small>${formatTime(time * tempoScale, true)}</small></span>`;
  }).join("");
}

function renderArrangement() {
  if (!els.arrangementTrackHeaders) return;
  const duration = calculateArrangementDuration();
  const totalNotes = arrangement.tracks.reduce((sum, track) => sum + track.notes.length, 0);
  els.arrangementTrackCount.textContent = String(arrangement.tracks.length);
  els.arrangementNoteCount.textContent = String(totalNotes);
  const audioCount = arrangement.tracks.reduce((sum,track) => sum+(track.audioClips?.length||0),0);
  document.getElementById("arrangementAudioCount").textContent = String(audioCount);
  document.getElementById("arrangementAudioSummary").hidden = !audioCount;
  const tempoScale = arrangement.baseBpm / arrangement.bpm;
  els.arrangementLength.textContent = formatTime(duration * tempoScale);
  els.arrangementTempoInput.value = String(arrangement.bpm);
  els.arrangementEmpty.hidden = arrangement.tracks.length > 0;
  renderArrangementRuler(duration, tempoScale);
  els.arrangementTrackHeaders.innerHTML = arrangement.tracks
    .map(
      (track, index) => `
        <div class="arrange-track-header" data-track-id="${escapeHtml(track.id)}" style="--track-color:${track.color}">
          <button class="arrange-track-number track-order-grip" type="button" data-track-drag="${escapeHtml(track.id)}" aria-label="上下拖动排序 ${escapeHtml(track.name)}" title="拖动排序；方向键上下移动">⇅<small>${String(index + 1).padStart(2, "0")}</small></button>
          <button class="arrange-track-icon" type="button" data-track-timbre="${escapeHtml(track.id)}" aria-haspopup="dialog" aria-label="更换 ${escapeHtml(track.name)} 音色" title="更换音色 · ${escapeHtml(getInstrumentDefinition(track.instrument).name)}">${getInstrumentDefinition(track.instrument).icon}</button>
          <button class="arrange-track-copy" type="button" data-select-track aria-pressed="false">
            <strong>${escapeHtml(track.name)}</strong>
            <small>${escapeHtml(track.audioClips?.length && !track.notes.length ? "原声录音" : track.instrumentName || getInstrumentDefinition(track.instrument).name)}</small>
          </button>
          <input class="arrange-track-color" type="color" value="${/^#[0-9a-f]{6}$/i.test(track.color) ? track.color : "#9b8cff"}" data-track-color="${escapeHtml(track.id)}" aria-label="更换 ${escapeHtml(track.name)} 轨道颜色" title="更换轨道颜色" />
          <div class="arrange-track-buttons">
            <button type="button" data-track-edit="${escapeHtml(track.id)}">编辑</button>
            <button type="button" data-track-arm="${escapeHtml(track.id)}" aria-label="选择录制 ${escapeHtml(track.name)}" aria-pressed="${track.id === performanceInput.trackId}">R</button>
            <button type="button" data-track-mute="${escapeHtml(track.id)}" class="${track.muted ? "active" : ""}" aria-label="静音 ${escapeHtml(track.name)}">M</button>
            <button type="button" data-track-solo="${escapeHtml(track.id)}" class="${track.solo ? "active" : ""}" aria-label="独奏试听 ${escapeHtml(track.name)}" aria-pressed="${track.solo}" title="独奏试听 · 同时只听一轨">S</button>
            <button type="button" data-track-fx="${escapeHtml(track.id)}" aria-label="调整 ${escapeHtml(track.name)}通道效果">FX</button>
            <button type="button" data-track-delete="${escapeHtml(track.id)}" aria-label="删除 ${escapeHtml(track.name)}">×</button>
          </div>
          <label class="arrange-volume">
            <span>音量</span>
            <input type="range" min="0" max="100" value="${track.volume}" data-track-volume="${escapeHtml(track.id)}" aria-label="${escapeHtml(track.name)}音量" />
          </label>
        </div>
      `
    )
    .join("");

  els.arrangementLanes.innerHTML = arrangement.tracks
    .map(
      (track) => `
        <div class="arrange-lane" data-track-id="${escapeHtml(track.id)}" style="--track-color:${track.color}">
          ${arrangementTrackClipHtml(track, duration)}
        </div>
      `
    )
    .join("");
  updateArrangementPlayhead(arrangement.playhead);
  renderTrackLayoutState();
  renderPerformancePanel();
  renderTemplateShelf();
  renderAssistantState();
  renderMaterialLibrary();
  syncStudioActionState();
}

let trackInstrumentPicker = null;

function renderTrackInstrumentChoices() {
  const picker = trackInstrumentPicker;
  if (!picker || picker.busy) return;
  const query = els.trackInstrumentSearch.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const current = picker.track?.instrument;
  const instruments = getAllInstrumentDefinitions().filter(instrument => {
    const base = instrument.baseInstrument || instrument.id;
    const kind = instrument.custom ? "我的音色" : instrument.dx7 ? "DX7 FM" :
      isSampledInstrument(base) ? "真实采样" : "合成";
    const haystack = [instrument.name, instrument.en, instrument.id, instrument.desc, kind].join(" ").toLowerCase();
    return query.every(term => haystack.includes(term));
  });
  const index = instruments.findIndex(instrument => instrument.id === current);
  if (index > 0) instruments.unshift(...instruments.splice(index, 1));
  els.trackInstrumentChoices.innerHTML = instruments
    .map(
      (instrument) => `
        <button type="button" data-track-instrument="${escapeHtml(instrument.id)}" ${instrument.id === current ? 'aria-current="true"' : ''} style="--choice-color:${instrument.color}">
          <span aria-hidden="true">${instrument.icon}</span>
          <strong>${escapeHtml(instrument.name)}</strong>
          <small>${instrument.id === current ? "当前音色 · " : ""}${escapeHtml(instrument.custom ? "我的音色" : instrument.en || "")}</small>
        </button>
      `
    )
    .join("");
  els.trackInstrumentStatus.textContent = instruments.length ? "" : "没有找到匹配的音色。";
}

function openTrackDialog(track = null, opener = null) {
  if (els.trackDialog.open || performanceInput.recording || performanceInput.preparing) return;
  trackInstrumentPicker = { track, opener, busy: false };
  els.trackDialogTitle.textContent = track ? "更换音色" : "添加一条音轨";
  const hasAudio = Boolean(track?.audioClips?.length);
  els.trackDialogCopy.textContent = track
    ? `「${track.name}」当前音色：${getInstrumentDefinition(track.instrument).name}。` +
      (hasAudio ? "新音色用于本轨音符和之后的键盘录制，原声音频照常播放。" : "选择后应用于这条音轨的现有音符。")
    : "选一个音色，为新音轨录制或填写音符。";
  els.trackInstrumentSearch.value = "";
  els.trackInstrumentSearch.disabled = false;
  renderTrackInstrumentChoices();
  els.trackDialog.showModal();
}

async function chooseTrackInstrument(id) {
  const picker = trackInstrumentPicker;
  if (!picker || picker.busy || performanceInput.recording || performanceInput.preparing) return;
  const instrument = getAllInstrumentDefinitions().find(item => item.id === id);
  if (!instrument) return;
  const track = picker.track;
  if (!track) {
    addArrangementTrack(id);
    return;
  }
  if (!arrangement.tracks.includes(track)) {
    els.trackInstrumentStatus.textContent = "这条音轨已不在当前编曲。";
    return;
  }
  if (track.instrument === id) {
    els.trackDialog.close();
    return;
  }

  const previous = track.instrument;
  const base = instrument.baseInstrument || instrument.id;
  picker.busy = true;
  els.trackInstrumentSearch.disabled = true;
  for (const button of els.trackInstrumentChoices.querySelectorAll("button")) button.disabled = true;
  els.trackInstrumentStatus.textContent = "正在准备「" + instrument.name + "」…";
  try {
    const context = getAudioContext(false);
    if (!sampledInstrumentReady(base, context)) await prepareSampledInstrument(base, context);
    if (trackInstrumentPicker !== picker || !els.trackDialog.open) return;
    if (!arrangement.tracks.includes(track) || track.instrument !== previous ||
        performanceInput.recording || performanceInput.preparing || state.currentView !== "arrangement") {
      els.trackInstrumentStatus.textContent = "当前音轨或编曲状态已变化，请重新打开音色选择器。";
      return;
    }
    const playing = arrangement.isPlaying || arrangement.loadingAudio;
    const position = arrangement.playhead;
    if (playing) stopArrangementPlayback(false);
    changePerformanceInstrument(id, track);
    els.trackDialog.close();
    showToast(`「${track.name}」已切换为${instrument.name}` +
      (track.audioClips?.length && !track.notes.length ? "，用于之后录制的音符。" : "。"));
    if (playing) void playArrangement(position);
  } catch {
    if (trackInstrumentPicker === picker && els.trackDialog.open) {
      els.trackInstrumentStatus.textContent = "音色加载失败。可重试或选择其他音色。";
    }
  } finally {
    if (trackInstrumentPicker === picker && els.trackDialog.open) {
      picker.busy = false;
      els.trackInstrumentSearch.disabled = false;
      for (const button of els.trackInstrumentChoices.querySelectorAll("button")) button.disabled = false;
    }
  }
}

function addArrangementTrack(instrumentId) {
  const definition = getInstrumentDefinition(instrumentId);
  const number = arrangement.tracks.length + 1;
  const track = createArrangementTrack(
    instrumentId,
    `${definition.name} ${String(number).padStart(2, "0")}`,
    []
  );
  arrangement.tracks.push(track);
  performanceInput.trackId = track.id;
  calculateArrangementDuration();
  persistArrangement();
  renderArrangement();
  els.trackDialog.close();
  showToast("已添加空白音轨，选择音色后可用键盘录制");
}

function fillArrangementTrack(trackId) {
  const track = arrangement.tracks.find((item) => item.id === trackId);
  if (!track) return;
  if (!state.notes.length) {
    showToast("创作台里还没有可填入的旋律");
    return;
  }
  track.notes = state.notes.map((note) => ({ ...note }));
  calculateArrangementDuration();
  persistArrangement();
  renderArrangement();
}

function updateArrangementPlayhead(time) {
  arrangement.playhead = Math.max(0, Math.min(arrangement.duration, time));
  const progress = arrangement.duration ? (arrangement.playhead / arrangement.duration) * 100 : 0;
  els.arrangementPlayhead.style.left = `${progress}%`;
  const tempoScale = arrangement.baseBpm / arrangement.bpm;
  els.arrangeTime.textContent = formatTime(arrangement.playhead * tempoScale, true);
  updateTemplateSection(arrangement.playhead);
  updateArrangementSeekUI();
  updateTrackChannelMeter();
  window.MeldArrangementRoll?.setPlayhead(arrangement.playhead);
}

function stopArrangementPlayback(resetPlayhead = true) {
  if (performanceInput.preparing) { performanceInput.prepareToken=(performanceInput.prepareToken||0)+1; performanceInput.preparing=false;renderPerformancePanel(); }
  arrangement.isPlaying = false;
  arrangement.loadingAudio = false;
  arrangement.audioLoadToken = (arrangement.audioLoadToken || 0) + 1;
  cancelAnimationFrame(arrangement.raf);
  window.clearInterval(arrangement.scheduleTimer);
  arrangement.scheduleTimer = null;
  window.clearTimeout(arrangement.endTimer);
  arrangement.nodes.forEach((node) => {
    try {
      node.stop?.();
    } catch {
      // Notes may have ended already.
    }
  });
  arrangement.nodes = [];
  disposeArrangementEffects();
  window.dispatchEvent(new Event('meld:arrangement-stop'));
  els.arrangePlayBtn.classList.remove("is-playing");
  els.arrangePlayBtn.setAttribute("aria-label", "播放编曲");
  els.arrangeStatus.textContent = resetPlayhead ? "等待播放" : "已暂停";
  if (resetPlayhead) updateArrangementPlayhead(0);
}

function scheduleArrangementTrackNote(track, note, when) {
  const volume=Number.isFinite(note.velocity)?Math.max(.05,Math.min(1,note.velocity)):1;
  const definition=getInstrumentDefinition(track.instrument),context=getAudioContext(),destination=getArrangementDestination(track,note.midi,context);
  const start=state.playNodes.length;
  if(track.instrumentPatch||definition.custom){
    const base=track.instrumentBase||definition.baseInstrument||definition.id||'piano',params={...LAB_DEFAULTS[base],...(track.instrumentPatch||definition.params||{})};
    state.playNodes.push(...schedulePatchVoice(base,note.midi,when,note.duration,params,destination,volume));
  }else scheduleInstrumentNote(track.instrument,note.midi,when,note.duration,volume,destination);
  const voices=state.playNodes.slice(start);
  if(!drumKitFromTrack(track))MeldPianoRollCore.applySlide(voices,note,when,note.duration,note.slideProgress);
  arrangement.nodes.push(...voices);
}

async function playArrangement(offset) {
  globalThis.MeldNightPocket?.pausePreview();
  window.MeldDx7Library?.stop?.();
  window.MeldSourceInstruments?.stopPreview?.();
  stopMaterialOriginal();
  const explicitPosition = typeof offset === "number";
  if (!explicitPosition) offset = arrangement.playhead >= arrangement.duration - .02 ? 0 : arrangement.playhead || 0;
  if (performanceInput.recording) { stopPerformanceTake(); return; }
  if (arrangement.loadingAudio) { stopArrangementPlayback(false); if (!explicitPosition) return; }
  if (arrangement.isPlaying) { stopArrangementPlayback(false); if (!explicitPosition) return; }
  const loop = sectionLoopEnabled ? arrangementSectionRange() : null;
  const selected = loop ? selectedArrangementTrack() : null;
  const hasSolo = arrangement.tracks.some(track => track.solo);
  const tracks = arrangement.tracks.filter(track => !track.muted && (selected ? track === selected : !hasSolo || track.solo) && MeldMaterialCore.hasContent(track));
  if (!tracks.length && !selected) { showToast("编曲台还没有可播放的音符或原声"); return; }
  stopSourcePlayback(); stopMelodyPlayback(); stopLabPlayback();
  const loadToken = arrangement.audioLoadToken = (arrangement.audioLoadToken || 0) + 1;
  const audioContext = getAudioContext(false);
  if (audioContext.state !== "running" && !(await resumePlaybackAudio(audioContext))) return;
  if (loadToken !== arrangement.audioLoadToken) return;
  if (tracks.some(MeldMaterialCore.hasAudio) || tracks.some(track=>track.notes.length&&!sampledInstrumentReady(grandPianoTrackBase(track),audioContext))) {
    arrangement.loadingAudio = true; els.arrangeStatus.textContent = "正在准备音频素材与乐器采样";
    try { await Promise.all([prepareMaterialAudioTracks(tracks,audioContext),prepareSampledTracks(tracks,audioContext)]); }
    catch (error) { if (loadToken === arrangement.audioLoadToken) { arrangement.loadingAudio = false; els.arrangeStatus.textContent = "音频素材未能载入"; showToast(error.message); } return; }
    if (loadToken !== arrangement.audioLoadToken) return;
    arrangement.loadingAudio = false;
  }
  state.playNodes = []; arrangement.nodes = [];
  const context = audioContext, speedScale = arrangement.baseBpm / arrangement.bpm;
  const startAt = context.currentTime + .08;
  offset = Math.max(0, Math.min(arrangement.duration - .01, offset));
  const end = loop?.end ?? arrangement.duration;
  if (loop && (offset < loop.start || offset >= loop.end)) offset = loop.start;
  arrangement.isPlaying = true;
  updateArrangementPlayhead(offset);
  startArrangementScheduler(tracks, startAt, speedScale, offset, end);
  els.arrangePlayBtn.classList.add("is-playing");
  els.arrangePlayBtn.setAttribute("aria-label", "暂停编曲");
  els.arrangeStatus.textContent = selected
    ? `${selected.name} · ${selected.muted ? "已静音" : tracks.length ? "段落循环" : "空音轨"}`
    : `${tracks.length} 条音轨正在播放`;
  const finishPass = () => {
    if (!arrangement.isPlaying) return;
    stopArrangementPlayback(false);
    const nextLoop = sectionLoopEnabled ? arrangementSectionRange() : null;
    if (loop && nextLoop) {
      updateArrangementPlayhead(nextLoop.start);
      playArrangement(nextLoop.start);
    }
  };
  const tick = () => {
    if (!arrangement.isPlaying) return;
    const position = offset + Math.max(0, context.currentTime - startAt) / speedScale;
    updateArrangementPlayhead(Math.min(position,end));
    if (position < end) arrangement.raf = requestAnimationFrame(tick);
    else finishPass();
  };
  arrangement.raf = requestAnimationFrame(tick);
  arrangement.endTimer = window.setTimeout(finishPass, (end - offset) * speedScale * 1000 + (loop ? 80 : 480));
}

function toggleView(view) {
  state.view = view;
  els.pitchViewBtn.classList.toggle("active", view === "pitch");
  els.waveViewBtn.classList.toggle("active", view === "wave");
  drawVisualizer(0);
}

function setScaleSnap(enabled) {
  state.scaleSnap = enabled;
  els.scaleSnapBtn.classList.toggle("active", enabled);
  els.scaleSnapBtn.setAttribute("aria-pressed", String(enabled));

  if (!state.key || !state.samples.length) {
    showToast(enabled ? "已开启调内音模式" : "已切换为原始音高显示");
    return;
  }

  stopMelodyPlayback();
  const extractedNotes = melodyNotesFromSamples(state.samples);
  if (state.notesEdited || state.notes.some(note => note.manualEdited)) {
    els.analysisStatus.textContent = enabled ? "调内音吸附 · 手动音符保留" : "半音编辑 · 手动音符保留";
    drawVisualizer(0);
    return;
  }
  const hasManualEdits = false;
  const notes = hasManualEdits ? state.notes.map(note => {
    if (note.manualEdited) return { ...note };
    const source = extractedNotes.find(raw => Math.abs(raw.start - note.start) < 0.12);
    const midi = source?.midi ?? note.originalMidi ?? note.midi;
    return { ...note, midi: enabled ? nearestScaleMidi(midi, state.key) : midi };
  }) : enabled ? snapNotesToScale(extractedNotes, state.key) : extractedNotes;
  if (!notes.length) {
    showToast("当前旋律无法生成可显示的调内音");
    return;
  }
  state.notes = notes;
  updateAnalysisUI(state.key, notes, state.duration);
  els.noteCount.textContent = String(notes.length);
  els.stageDetail.textContent = `${notes.length} 个音符 · ${formatTime(state.duration)}`;
  els.analysisStatus.textContent = enabled ? "调内音模式" : "原始音高模式";
  els.analysisStatus.classList.add("ready");
  els.playLabel.textContent = `用${getInstrumentDefinition(state.instrument).name}试听`;
  syncStudioActionState();
  drawVisualizer(0);
  showToast(enabled ? "仅显示当前音阶内的音符" : "已显示未吸附的原始音符");
}

function setupEventListeners() {
  document.getElementById("studioRefreshInputs").addEventListener("click",()=>{if(!state.isRecording&&!isRequestingMicrophone)refreshStudioAudioInputs(true);});
  navigator.mediaDevices?.addEventListener?.("devicechange",()=>refreshStudioAudioInputs());
  void refreshStudioAudioInputs();
  document.getElementById("labOctave").addEventListener("change",event=>{
    stopLabPlayback();
    labOctaveOverride=Number(event.target.value);
    renderLabKeyboard();
  });
  for(const id of ['labTonic','labScaleMode'])document.getElementById(id).addEventListener('change',()=>{
    stopLabPlayback();
    labKeyOverride=MeldPianoRollCore.key({tonic:document.getElementById('labTonic').value,mode:document.getElementById('labScaleMode').value});
    renderLabKeyboard();
  });
  document.getElementById('labChordShape').addEventListener('change',renderLabKeyboard);
  document.getElementById('labChordPlay').addEventListener('click',()=>{
    stopLabPlayback();
    for(const midi of labChordNotes())playLabNote(midi,.85);
  });
  setupPitchEditor();
  setupRecognitionControls();
  setupTrackLayout();
  setupTrackChannelStrip();
  setupPerformanceKeyboard();
  setupArrangementTemplates();
  setupArrangementAssistant();
  setupLabRecording();
  document.getElementById("studioOpenAssistant").addEventListener("click", () => {
    const toggle = document.getElementById("assistantSidebarToggle");
    if (toggle.getAttribute("aria-expanded") !== "true") toggle.click();
    document.getElementById("assistantPrompt").focus();
  });
  document.getElementById("labInstrumentSearch").addEventListener("input", renderLabInstruments);
  document.getElementById("labSamplePacks").addEventListener("click", event => {
    const button = event.target.closest("[data-lab-instrument]");
    if (button) loadLabInstrument(button.dataset.labInstrument);
  });
  document.getElementById("labInstrumentFamily").addEventListener("change", renderLabInstruments);
  setupArrangementSeeking();
  setupMaterialLibrary();
  document.getElementById("studioInstrumentSearch").addEventListener("input", filterStudioInstruments);
  document.getElementById("studioOpenInstruments").addEventListener("click", () => {
    const drawer = document.getElementById("studioInstrumentDrawer");
    drawer.open = true;
    drawer.querySelector("summary").focus({preventScroll:true});
    drawer.scrollIntoView({block:"start"});
  });
  setupGrandPiano();
  setupStringSamples();
  setupBackendWorkspace();
  setupStandaloneAudioMode();
  els.recordBtn.addEventListener("click", startRecording);
  els.uploadBtn.addEventListener("click", () => els.audioInput.click());
  els.audioInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    handleAudioUpload(file);
    event.target.value = "";
  });
  els.playBtn.addEventListener("click", () => {
    if (state.isPlaying) stopMelodyPlayback();
    else playMelody(0);
  });
  els.demoBtn.addEventListener("click", createDemoData);
  els.exportBtn.addEventListener("click", exportMidi);
  els.loopBtn.addEventListener("click", () => {
    state.loop = !state.loop;
    els.loopBtn.setAttribute("aria-pressed", String(state.loop));
    showToast(state.loop ? "循环播放已开启" : "循环播放已关闭");
  });
  els.metronomeBtn.addEventListener("click", () => {
    toggleMetronome();
  });
  els.arrangeMetronomeBtn.addEventListener("click", toggleMetronome);
  els.pitchViewBtn.addEventListener("click", () => toggleView("pitch"));
  els.waveViewBtn.addEventListener("click", () => toggleView("wave"));
  els.scaleSnapBtn.addEventListener("click", () => setScaleSnap(!state.scaleSnap));
  els.sourcePlayBtn.addEventListener("click", toggleSourcePlayback);
  els.sourceDeleteBtn.addEventListener("click", removeSource);
  els.sourceAudio.addEventListener("ended", stopSourcePlayback);
  els.keySummary.addEventListener("click", () =>
    els.analysisPanel.scrollIntoView({ behavior: "smooth", block: "center" })
  );
  els.helpBtn.addEventListener("click", () => els.helpDialog.showModal());
  els.helpCloseBtn.addEventListener("click", () => els.helpDialog.close());
  els.helpDialog.addEventListener("click", (event) => {
    if (event.target === els.helpDialog) els.helpDialog.close();
  });
  els.authBtn.addEventListener("click", () => openAuthDialog("login"));
  els.authCloseBtn.addEventListener("click", closeAuthDialog);
  els.authCancelBtn.addEventListener("click", closeAuthDialog);
  els.authDialog.addEventListener("click", (event) => {
    if (event.target === els.authDialog) closeAuthDialog();
  });
  els.authTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-auth-mode]");
    if (button) setAuthMode(button.dataset.authMode);
  });
  els.authForm.addEventListener("submit", handleAuthSubmit);
  els.authLogoutBtn.addEventListener("click", logoutCloud);
  els.tempoInput.addEventListener("change", () => {
    const bpm = Math.max(50, Math.min(160, Number(els.tempoInput.value) || 84));
    els.tempoInput.value = String(bpm);
    if (state.demoMode) {
      const wasPlaying = state.isPlaying;
      stopMelodyPlayback();
      createDemoData();
      if (!wasPlaying) stopMelodyPlayback();
    }
    if (state.metronome && state.currentView === "studio") {
      startMetronome();
    }
  });

  els.saveProjectBtn.addEventListener("click", () => openProjectDialog("save", state.activeProjectId));
  els.worksSaveBtn.addEventListener("click", () => openProjectDialog("save", state.activeProjectId));
  els.worksNewBtn.addEventListener("click", () => {
    if (state.notes.length && !state.activeProjectId) {
      showToast("先保存当前旋律，再开始一首新作品");
      openProjectDialog("save");
      return;
    }
    clearSessionData(true);
    switchView("studio");
    showToast("已开始一首新作品");
  });
  els.emptyBackBtn.addEventListener("click", () => switchView("studio"));
  els.emptyDemoBtn.addEventListener("click", () => {
    switchView("studio");
    window.setTimeout(createDemoData, 120);
  });
  els.projectForm.addEventListener("submit", handleProjectFormSubmit);
  els.projectCancelBtn.addEventListener("click", closeProjectDialog);
  els.projectDialogCloseBtn.addEventListener("click", closeProjectDialog);
  els.projectDialog.addEventListener("click", (event) => {
    if (event.target === els.projectDialog) closeProjectDialog();
  });
  els.projectSearch.addEventListener("input", renderProjects);
  document.querySelectorAll("[data-project-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      projectFilter = button.dataset.projectFilter;
      document.querySelectorAll("[data-project-filter]").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      renderProjects();
    });
  });
  els.projectGrid.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-project-action]");
    const card = event.target.closest("[data-project-id]");
    if (!actionButton || !card) return;
    const projectId = card.dataset.projectId;
    const action = actionButton.dataset.projectAction;
    if (action === "preview") {
      const project = projects.find(item => item.id === projectId);
      if (project) void toggleProjectPreview(project);
    }
    if (action === "open") openSavedProject(projectId);
    if (action === "export-midi") window.MeldPerformanceExport?.exportProjectMidi(projects.find(project=>project.id===projectId));
    if (action === "rename") openProjectDialog("rename", projectId);
    if (action === "duplicate") duplicateProject(projectId);
    if (action === "delete") askDeleteProject(projectId);
  });
  els.deleteCancelBtn.addEventListener("click", () => {
    pendingDeleteProjectId = null;
    pendingDeletePatchId = null;
    deleteDialogMode = "project";
    els.deleteDialog.close();
  });
  els.deleteConfirmBtn.addEventListener("click", () => {
    if (deleteDialogMode === "patch") confirmDeletePatch();
    else confirmDeleteProject();
  });
  els.deleteDialog.addEventListener("click", (event) => {
    if (event.target === els.deleteDialog) {
      pendingDeleteProjectId = null;
      pendingDeletePatchId = null;
      deleteDialogMode = "project";
      els.deleteDialog.close();
    }
  });

  const labSliderBindings = [
    ["attack", els.attackControl],
    ["decay", els.decayControl],
    ["sustain", els.sustainControl],
    ["release", els.releaseControl],
    ["brightness", els.brightnessControl],
    ["space", els.spaceControl],
    ["drive", els.driveControl],
  ];
  labSliderBindings.forEach(([key, input]) => {
    input.addEventListener("input", () => updateLabParameter(key, input.value));
  });
  els.labResetBtn.addEventListener("click", () => {
    const instrument = INSTRUMENTS.find((item) => item.id === labState.instrument);
    labState.params = { ...LAB_DEFAULTS[labState.instrument] };
    labState.presetName = instrument.name;
    labState.presetMeta = `${instrument.en} · DEFAULT`;
    syncLabControls();
    renderLabPresets();
    saveLabSettings();
    showToast(`${instrument.name}参数已重置`);
  });
  els.labSavePresetBtn.addEventListener("click", openPatchDialog);
  els.patchForm.addEventListener("submit", handlePatchFormSubmit);
  els.patchCancelBtn.addEventListener("click", () => els.patchDialog.close());
  els.patchDialogCloseBtn.addEventListener("click", () => els.patchDialog.close());
  els.patchDialog.addEventListener("click", (event) => {
    if (event.target === els.patchDialog) els.patchDialog.close();
  });
  els.labArpBtn.addEventListener("click", startLabArpeggio);
  els.addTrackBtn.addEventListener("click", event => openTrackDialog(null, event.currentTarget));
  els.arrangementEmptyAddBtn.addEventListener("click", event => openTrackDialog(null, event.currentTarget));
  els.trackDialogCloseBtn.addEventListener("click", () => els.trackDialog.close());
  els.trackDialog.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    els.trackDialog.close();
  });
  els.trackDialog.addEventListener("close", () => {
    if (els.trackDialog.open || !trackInstrumentPicker) return;
    const { track, opener } = trackInstrumentPicker;
    trackInstrumentPicker = null;
    const replacement = track && [...els.arrangementTrackHeaders.querySelectorAll("[data-track-timbre]")]
      .find(button => button.dataset.trackTimbre === track.id);
    (replacement || opener)?.focus({ preventScroll: true });
  });
  els.trackDialog.addEventListener("click", (event) => {
    if (event.target === els.trackDialog) els.trackDialog.close();
  });
  els.trackInstrumentSearch.addEventListener("input", renderTrackInstrumentChoices);
  els.trackInstrumentChoices.addEventListener("click", (event) => {
    const button = event.target.closest("[data-track-instrument]");
    if (button) void chooseTrackInstrument(button.dataset.trackInstrument);
  });
  els.arrangePlayBtn.addEventListener("click", playArrangement);
  document.getElementById("arrangeReturnStart").addEventListener("click", () => seekArrangementTo(0));
  document.getElementById("arrangeBrowseDemo").addEventListener("click", () => {
    const drawer = document.getElementById("arrangementDemoDrawer");
    drawer.open = true;
    drawer.querySelector("summary").focus();
  });
  document.getElementById("arrangeOpenAssistant").addEventListener("click", () => {
    const assistant = document.getElementById("assistantSidebarToggle");
    if (assistant.getAttribute("aria-expanded") === "false") assistant.click();
    assistant.focus();
  });
  els.arrangeAutoFillBtn.addEventListener("click", autoArrangeTracks);
  els.arrangeBackStudioBtn.addEventListener("click", () => switchView("studio"));
  const applyArrangementTempo = (syncStudio = false) => {
    const wasPlaying = arrangement.isPlaying;
    if (syncStudio && wasPlaying) stopArrangementPlayback(false);
    arrangement.bpm = Math.max(
      50,
      Math.min(160, Number(els.arrangementTempoInput.value) || 84)
    );
    els.arrangementTempoInput.value = String(arrangement.bpm);
    if (syncStudio) els.tempoInput.value = String(arrangement.bpm);
    const tempoScale = arrangement.baseBpm / arrangement.bpm;
    const duration = calculateArrangementDuration();
    els.arrangementLength.textContent = formatTime(duration * tempoScale);
    renderArrangementRuler(duration, tempoScale);
    persistArrangement();
    if (state.metronome) startMetronome();
    renderArrangementSectionControls();
    updateArrangementSeekUI();
    if (syncStudio && wasPlaying) window.setTimeout(playArrangement, 30);
  };
  els.arrangementTempoInput.addEventListener("input", () => applyArrangementTempo(false));
  els.arrangementTempoInput.addEventListener("change", () => applyArrangementTempo(true));
  els.arrangementTrackHeaders.addEventListener("click", (event) => {
    const timbre = event.target.closest("[data-track-timbre]");
    if (timbre) {
      const track = arrangement.tracks.find(item => item.id === timbre.dataset.trackTimbre);
      if (track) openTrackDialog(track, timbre);
      return;
    }
    const mute = event.target.closest("[data-track-mute]");
    const solo = event.target.closest("[data-track-solo]");
    const remove = event.target.closest("[data-track-delete]");
    if(remove){window.MeldTrackActions?.openDelete(remove.dataset.trackDelete);return;}
    const wasPlaying = arrangement.isPlaying || arrangement.loadingAudio;
    if (mute) {
      const track = arrangement.tracks.find((item) => item.id === mute.dataset.trackMute);
      if (track) track.muted = !track.muted;
    }
    if (solo) {
      const track = arrangement.tracks.find((item) => item.id === solo.dataset.trackSolo);
      if (!track || !MeldMaterialCore.hasContent(track) || performanceInput.recording || performanceInput.preparing) return;
      const enableSolo = !track.solo;
      for (const item of arrangement.tracks) item.solo = item === track && enableSolo;
      if (enableSolo) track.muted = false;
    }
    if (mute || solo) {
      if (wasPlaying) stopArrangementPlayback(false);
      persistArrangement();
      renderArrangement();
      if (solo) {
        const replacement = [...els.arrangementTrackHeaders.querySelectorAll("[data-track-solo]")]
          .find(button => button.dataset.trackSolo === solo.dataset.trackSolo);
        replacement?.focus({ preventScroll: true });
      }
      if (wasPlaying) playArrangement(arrangement.playhead);
    }
  });
  els.arrangementTrackHeaders.addEventListener("input", (event) => {
    const picker = event.target.closest("[data-track-color]");
    if (picker) {
      const track = arrangement.tracks.find(item => item.id === picker.dataset.trackColor);
      if (!track) return;
      track.color = picker.value;
      track.customColor = picker.value;
      for (const container of [els.arrangementTrackHeaders, els.arrangementLanes]) {
        container.querySelector(`[data-track-id="${CSS.escape(track.id)}"]`)?.style.setProperty("--track-color", track.color);
      }
      return;
    }
    const input = event.target.closest("[data-track-volume]");
    if (!input) return;
    const track = arrangement.tracks.find((item) => item.id === input.dataset.trackVolume);
    if (track) {
      track.volume = Number(input.value);
      updateTrackEffectsLive(track);
      persistArrangement();
    }
  });
  els.arrangementTrackHeaders.addEventListener("change", event => {
    if (event.target.matches("[data-track-color]")) persistArrangement();
  });
  els.arrangementLanes.addEventListener("click", (event) => {
    const fill = event.target.closest("[data-fill-track]");
    if (fill) fillArrangementTrack(fill.dataset.fillTrack);
  });

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => switchView(item.dataset.view));
  });
  document.querySelector(".brand").addEventListener("click", (event) => {
    event.preventDefault();
    switchView("studio");
  });

  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented) return;
    const target = event.target;
    const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target.isContentEditable;
    if (isTyping || document.querySelector("dialog[open]")) return;

    if (state.currentView === "lab") {
      if (target.closest?.(".lab-rack-libraries, .lab-preset-drawer")) return;
      const key = String(event.key||'').toLowerCase();
      if (event.code === "Space") {
        event.preventDefault();
        startLabArpeggio();
        return;
      }
      if (LAB_KEY_MAP[key] !== undefined && !event.repeat) {
        event.preventDefault();
        triggerLabNote(LAB_KEY_MAP[key]);
      }
      return;
    }
    if (state.currentView === "arrangement") {
      if (target.closest?.("button, summary, #arrangementSectionControls, #assistantSidebar")) return;
      if (event.code === "Space") {
        event.preventDefault();
        playArrangement();
      }
      return;
    }
    if (state.currentView !== "studio") return;

    if (event.code === "Space") {
      event.preventDefault();
      if (state.notes.length) {
        if (state.isPlaying) stopMelodyPlayback();
        else playMelody(0);
      }
    }
    if (String(event.key||'').toLowerCase() === "r") {
      startRecording();
    }
  });
  document.addEventListener("keyup", (event) => {
    if (state.currentView !== "lab") return;
    const midi = LAB_KEY_MAP[String(event.key||'').toLowerCase()];
    if (midi !== undefined) {
      els.labKeyboard.querySelector(`[data-midi="${midi+labKeyboardOffset()}"]`)?.classList.remove("active");
    }
  });

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (state.currentView === "studio") drawVisualizer(0);
    }, 80);
  });

  window.addEventListener("beforeunload", () => {
    stopPerformanceTake(); releasePerformanceKeys();
    stopMicrophone();
    stopLabRecording();
    stopLabPlayback();
    stopArrangementPlayback();
    stopMetronome();
    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
  });
}

function init() {
  loadProjects();
  loadCustomPatches();
  cloudEnabled = Boolean(window.MeldCloud?.configured());
  if (cloudEnabled) {
    legacyProjects = projects;
    legacyCustomPatches = customPatches;
    projects = [];
  }
  loadArrangement();
  restoreLabSettings();
  renderInstruments();
  createLevelMeter();
  renderLabInstruments();
  renderLabKeyboard();
  renderLabPresets();
  renderMyPatches();
  syncLabControls();
  setupEventListeners();
  resetAnalysis();
  syncStudioActionState();
  renderProjects();
  renderArrangement();
  updateCloudState("signed-out");
  drawVisualizer(0);
  window.setTimeout(() => drawVisualizer(0), 120);
  initializeCloud();
}

init();
