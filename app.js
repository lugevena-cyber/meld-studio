const NOTE_NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
const NOTE_NAMES_FLAT = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
const SCALE_STEPS = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
};

const INSTRUMENTS = [
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
    name: "钢琴",
    en: "GRAND PIANO",
    desc: "清澈颗粒 · 宽动态",
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
    release: 900,
    brightness: 4800,
    space: 8,
    drive: 2,
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
  {
    id: "reference-rubber-bass",
    instrument: "synth",
    name: "夜行橡胶贝斯",
    meta: "SYNTH BASS · RUBBER PULSE",
    short: "圆润 · 短促 · 有弹性",
    category: "reference",
    params: {
      ...LAB_DEFAULTS.synth,
      attack: 8,
      decay: 180,
      sustain: 38,
      release: 120,
      brightness: 900,
      space: 5,
      drive: 12,
    },
  },
  {
    id: "reference-glass-keys",
    instrument: "piano",
    name: "玻璃电钢",
    meta: "ELECTRIC PIANO · GLASS",
    short: "清脆 · 贴耳 · 宽动态",
    category: "reference",
    params: {
      ...LAB_DEFAULTS.piano,
      attack: 4,
      decay: 700,
      sustain: 25,
      release: 900,
      brightness: 4200,
      space: 10,
      drive: 2,
    },
  },
  {
    id: "reference-harbor-pad",
    instrument: "strings",
    name: "港夜玻璃 Pad",
    meta: "STRING PAD · HARBOR NIGHT",
    short: "深色 · 宽阔 · 缓慢呼吸",
    category: "reference",
    params: {
      ...LAB_DEFAULTS.strings,
      attack: 600,
      decay: 1200,
      sustain: 70,
      release: 2400,
      brightness: 1700,
      space: 55,
      drive: 8,
    },
  },
  {
    id: "reference-eastern-pluck",
    instrument: "acoustic",
    name: "东方拨弦",
    meta: "PLUCK · EASTERN ACCENT",
    short: "木质 · 金属泛音 · 短点缀",
    category: "reference",
    params: {
      ...LAB_DEFAULTS.acoustic,
      attack: 5,
      decay: 450,
      sustain: 20,
      release: 700,
      brightness: 3800,
      space: 12,
      drive: 4,
    },
  },
];

const DRUM_INSTRUMENT = {
  id: "drums",
  name: "复古鼓组",
  en: "ANALOG DRUM MACHINE",
  desc: "1980s 紧致鼓组",
  color: "#e8cf79",
  icon: `
    <svg viewBox="0 0 28 28" aria-hidden="true">
      <ellipse cx="9" cy="9" rx="5" ry="2.5"/>
      <path d="M4 9v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V9M4 12.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5"/>
      <ellipse cx="19" cy="16" rx="5" ry="2.5"/>
      <path d="M14 16v5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-5M14 19.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5"/>
      <path d="M19 5v5M17 7h4"/>
    </svg>`,
};

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
  scaleSnap: true,
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
  instrumentRail: document.getElementById("instrumentRail"),
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
  grooveDemoBtn: document.getElementById("grooveDemoBtn"),
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
  railCountLabel: document.getElementById("railCountLabel"),
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
  arrangeLoopBtn: document.getElementById("arrangeLoopBtn"),
  arrangementTrackCount: document.getElementById("arrangementTrackCount"),
  arrangementNoteCount: document.getElementById("arrangementNoteCount"),
  arrangementKey: document.getElementById("arrangementKey"),
  arrangementLength: document.getElementById("arrangementLength"),
  arrangementTrackHeaders: document.getElementById("arrangementTrackHeaders"),
  arrangementRuler: document.getElementById("arrangementRuler"),
  arrangementLanes: document.getElementById("arrangementLanes"),
  arrangementPlayhead: document.getElementById("arrangementPlayhead"),
  arrangementLoopRegion: document.getElementById("arrangementLoopRegion"),
  arrangementLoopLabel: document.getElementById("arrangementLoopLabel"),
  arrangementHint: document.getElementById("arrangementHint"),
  trackPitchEditor: document.getElementById("trackPitchEditor"),
  trackPitchTrackName: document.getElementById("trackPitchTrackName"),
  trackSelectedNote: document.getElementById("trackSelectedNote"),
  trackSelectedPosition: document.getElementById("trackSelectedPosition"),
  trackScaleSnapBtn: document.getElementById("trackScaleSnapBtn"),
  trackPitchCloseBtn: document.getElementById("trackPitchCloseBtn"),
  trackPitchRange: document.getElementById("trackPitchRange"),
  trackPiano: document.getElementById("trackPiano"),
  arrangementEmpty: document.getElementById("arrangementEmpty"),
  arrangementEmptyAddBtn: document.getElementById("arrangementEmptyAddBtn"),
  addTrackBtn: document.getElementById("addTrackBtn"),
  arrangeAutoFillBtn: document.getElementById("arrangeAutoFillBtn"),
  arrangeBackStudioBtn: document.getElementById("arrangeBackStudioBtn"),
  trackDialog: document.getElementById("trackDialog"),
  trackDialogCloseBtn: document.getElementById("trackDialogCloseBtn"),
  trackInstrumentChoices: document.getElementById("trackInstrumentChoices"),
};

let audioContext = null;
let analyser = null;
let microphoneStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let sourceNode = null;
let animationFrame = null;
let frameTimer = null;
let recordStartedAt = 0;
let lastPitchAt = 0;
let smoothedPitch = null;
let currentRms = 0;
let currentPitch = null;
let liveWaveImage = null;
let projects = [];
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
  key: null,
  selectedTrackId: null,
  selectedNoteIndex: 0,
  snapPitchToScale: true,
  loopEnabled: false,
  loopStart: 0,
  loopEnd: 8.2,
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
let drumNoiseBuffer = null;

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

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
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
            LAB_DEFAULTS[patch.instrument] &&
            patch.params
        )
      : [];
  } catch {
    customPatches = [];
  }
}

function persistCustomPatches() {
  if (cloudEnabled) {
    if (!cloudSession) {
      openAuthDialog("login");
      showToast("登录后即可同步自定义音色");
      return false;
    }
    updateCloudState("syncing");
    window.MeldCloud.upsertPatches(customPatches, cloudSession)
      .then(() => updateCloudState("connected"))
      .catch((error) => {
        updateCloudState("error");
        showToast(`音色同步失败：${error.message}`);
      });
    return true;
  }
  try {
    localStorage.setItem(CUSTOM_PATCHES_STORAGE_KEY, JSON.stringify(customPatches));
    return true;
  } catch {
    showToast("浏览器存储空间不足，无法保存音色");
    return false;
  }
}

function customPatchToInstrument(patch) {
  const base = INSTRUMENTS.find((instrument) => instrument.id === patch.instrument) || INSTRUMENTS[0];
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
  if (id === DRUM_INSTRUMENT.id) return DRUM_INSTRUMENT;
  return getAllInstrumentDefinitions().find((instrument) => instrument.id === id) || INSTRUMENTS[2];
}

function getInstrumentPatch(id) {
  return getInstrumentDefinition(id).params || null;
}

function renderInstruments() {
  els.instrumentRail.innerHTML = "";
  els.instrumentCards.innerHTML = "";
  const allInstruments = getAllInstrumentDefinitions();
  els.railCountLabel.textContent = String(allInstruments.length).padStart(2, "0") + " TRACKS";
  let customHeadingAdded = false;

  allInstruments.forEach((instrument, index) => {
    if (instrument.custom && !customHeadingAdded) {
      const label = document.createElement("div");
      label.className = "rail-section-label";
      label.textContent = "我的音色";
      els.instrumentRail.appendChild(label);
      customHeadingAdded = true;
    }
    const rail = document.createElement("button");
    rail.className = `rail-instrument${instrument.id === state.instrument ? " active" : ""}`;
    rail.type = "button";
    rail.dataset.instrument = instrument.id;
    rail.setAttribute("role", "option");
    rail.setAttribute("aria-selected", String(instrument.id === state.instrument));
    rail.innerHTML = `
      <span class="rail-icon">${instrument.icon}</span>
      <span class="rail-copy">
        <strong>${instrument.name}</strong>
        <small>${instrument.en}</small>
      </span>
      <span class="rail-index">${instrument.custom ? "MY" : String(index + 1).padStart(2, "0")}</span>
    `;
    rail.addEventListener("click", () => selectInstrument(instrument.id, true));
    els.instrumentRail.appendChild(rail);

    const card = document.createElement("button");
    card.className = `instrument-card${instrument.custom ? " custom" : ""}${instrument.id === state.instrument ? " active" : ""}`;
    card.type = "button";
    card.dataset.instrument = instrument.id;
    card.setAttribute("aria-pressed", String(instrument.id === state.instrument));
    card.innerHTML = `
      <span class="card-icon">${instrument.icon}</span>
      <strong>${instrument.name}</strong>
      <small>${instrument.desc}</small>
      <span class="card-bottom">
        <span class="card-bars"><i></i><i></i><i></i><i></i><i></i></span>
        <span class="card-check">✓</span>
      </span>
    `;
    card.addEventListener("click", () => selectInstrument(instrument.id, true));
    els.instrumentCards.appendChild(card);
  });
}

function selectInstrument(id, announce = false) {
  state.instrument = id;
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
  if (cloudEnabled && !cloudSession) {
    openAuthDialog("login");
    showToast("登录后才能保存到云端音色库");
    return;
  }
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
      energy > 0.2 ? (index > 17 ? "#ff8055" : index > 12 ? "#e8cf79" : "#c6ed8f") : "#3f4945";
  });
}

function calculateRms(buffer) {
  let sum = 0;
  for (let i = 0; i < buffer.length; i += 1) sum += buffer[i] * buffer[i];
  return Math.sqrt(sum / buffer.length);
}

function detectPitchYin(buffer, sampleRate) {
  const size = buffer.length;
  const rms = calculateRms(buffer);
  if (rms < 0.007) return { frequency: -1, confidence: 0, rms };

  let start = 0;
  while (start < size / 2 && Math.abs(buffer[start]) < 0.002) start += 1;
  let end = size - 1;
  while (end > size / 2 && Math.abs(buffer[end]) < 0.002) end -= 1;
  const usable = end - start;
  if (usable < sampleRate / 900) return { frequency: -1, confidence: 0, rms };

  const minLag = Math.max(2, Math.floor(sampleRate / 1200));
  const maxLag = Math.min(Math.floor(sampleRate / 70), Math.floor(usable / 2));
  if (maxLag <= minLag + 2) return { frequency: -1, confidence: 0, rms };

  const difference = new Float32Array(maxLag + 1);
  let runningSum = 0;
  let bestLag = -1;
  let bestValue = 1;

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let sum = 0;
    const count = Math.min(usable - lag, Math.floor(sampleRate * 0.045));
    for (let i = 0; i < count; i += 2) {
      const delta = buffer[start + i] - buffer[start + i + lag];
      sum += delta * delta;
    }
    difference[lag] = sum;
    runningSum += sum;
    if (runningSum <= 0) continue;

    const normalized = (difference[lag] * lag) / runningSum;
    if (normalized < 0.2) {
      if (bestLag === -1 || normalized < bestValue) {
        bestValue = normalized;
        bestLag = lag;
      }
    }
  }

  if (bestLag === -1) return { frequency: -1, confidence: 0, rms };

  const prev = difference[bestLag - 1] ?? difference[bestLag];
  const curr = difference[bestLag];
  const next = difference[bestLag + 1] ?? difference[bestLag];
  const denominator = prev - 2 * curr + next;
  const offset = denominator === 0 ? 0 : (prev - next) / (2 * denominator);
  const refinedLag = bestLag + Math.max(-0.5, Math.min(0.5, offset));
  const frequency = sampleRate / refinedLag;
  const confidence = Math.max(0, Math.min(1, 1 - bestValue));
  return { frequency, confidence, rms };
}

function frequencyToPitchData(frequency, confidence) {
  if (!Number.isFinite(frequency) || frequency < 70 || frequency > 1200) return null;
  const exactMidi = 69 + 12 * Math.log2(frequency / 440);
  if (smoothedPitch === null || Math.abs(exactMidi - smoothedPitch) > 1.4) {
    smoothedPitch = exactMidi;
  } else {
    smoothedPitch = smoothedPitch * 0.7 + exactMidi * 0.3;
  }
  const midi = Math.round(smoothedPitch);
  const cents = Math.round((smoothedPitch - midi) * 100);
  return { midi, exactMidi: smoothedPitch, cents, confidence, frequency };
}

function processLiveAudio() {
  if (!analyser || !state.isRecording) return;
  const buffer = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(buffer);
  const rms = calculateRms(buffer);
  updateLevelMeter(rms);

  const pitch = detectPitchYin(buffer, audioContext.sampleRate);
  const now = (performance.now() - recordStartedAt) / 1000;

  if (pitch.frequency > 0) {
    const data = frequencyToPitchData(pitch.frequency, pitch.confidence);
    if (data && pitch.confidence > 0.53) {
      currentPitch = data;
      const note = noteNameFromMidi(data.midi);
      els.noteName.textContent = note.name;
      els.noteOctave.textContent = note.octave;
      els.noteCents.textContent =
        Math.abs(data.cents) <= 8 ? "音准稳定" : `${data.cents > 0 ? "+" : ""}${data.cents} cents`;
      els.liveNote.classList.add("visible");

      if (now - lastPitchAt >= 0.04) {
        state.samples.push({
          t: now,
          midi: data.exactMidi,
          rounded: data.midi,
          confidence: pitch.confidence,
        });
        lastPitchAt = now;
      }
    }
  } else {
    const gap = state.samples.length ? state.samples[state.samples.length - 1] : null;
    if (gap && now - gap.t > 0.15) {
      state.samples.push({ t: now, midi: null, confidence: 0 });
    }
  }

  updateRecordingUI(now);
  drawVisualizer(now);
}

function startLiveFrameLoop() {
  cancelAnimationFrame(animationFrame);
  const loop = () => {
    processLiveAudio();
    animationFrame = requestAnimationFrame(loop);
  };
  animationFrame = requestAnimationFrame(loop);
}

function stopLiveFrameLoop() {
  cancelAnimationFrame(animationFrame);
  animationFrame = null;
}

async function startRecording() {
  if (state.isRecording) {
    stopRecording();
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    showToast("当前浏览器不支持麦克风录音，请尝试上传音频");
    return;
  }

  stopSourcePlayback();
  stopMelodyPlayback();

  try {
    const context = getAudioContext();
    await context.resume();
    microphoneStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1,
      },
    });

    sourceNode = context.createMediaStreamSource(microphoneStream);
    analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.15;
    sourceNode.connect(analyser);

    mediaRecorder = new MediaRecorder(microphoneStream);
    recordedChunks = [];
    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) recordedChunks.push(event.data);
    });
    mediaRecorder.addEventListener("stop", () => {
      finalizeRecording();
    });
    mediaRecorder.start(120);

    clearSessionData(true);
    state.isRecording = true;
    state.samples = [];
    state.notes = [];
    state.key = null;
    smoothedPitch = null;
    currentPitch = null;
    lastPitchAt = 0;
    recordStartedAt = performance.now();
    setStep(1);

    els.recordBtn.classList.add("is-recording");
    els.recordBtn.setAttribute("aria-label", "停止录音");
    els.recordZone.classList.add("is-recording");
    els.recordLabel.textContent = "正在聆听 · 点击结束";
    els.liveStatus.classList.add("is-recording");
    els.stageStateText.textContent = "实时聆听";
    els.stageDetail.textContent = "音高识别中";
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
  }
}

function stopRecording() {
  if (!state.isRecording) return;
  const elapsed = (performance.now() - recordStartedAt) / 1000;
  state.duration = Math.max(0.5, elapsed);
  state.isRecording = false;
  stopLiveFrameLoop();
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
      type: mediaRecorder?.mimeType || "audio/webm",
    });
    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    state.audioUrl = URL.createObjectURL(state.audioBlob);
    els.sourceAudio.src = state.audioUrl;
  }

  stopMicrophone();
  if (state.samples.length < 5) {
    showToast("没有捕捉到清晰的音高，请靠近麦克风再哼一次");
    els.recordLabel.textContent = "点击重新哼唱";
    els.stageStateText.textContent = "准备录音";
    els.stageDetail.textContent = "尝试用“嘟”或“啦”延续音高";
    setStep(0);
    drawVisualizer(0);
    return;
  }

  await analyzeSamples(state.samples, state.duration, "record");
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

function clearSessionData(fullReset = true) {
  stopMelodyPlayback();
  stopSourcePlayback();
  state.activeProjectId = null;
  state.samples = [];
  state.notes = [];
  state.key = null;
  state.duration = 8;
  state.audioBuffer = null;
  state.audioBlob = null;
  state.sourceName = "";
  state.sourceType = "";
  state.demoMode = false;
  arrangement.tracks = [];
  arrangement.duration = 12;
  arrangement.playhead = 0;
  arrangement.loopEnabled = false;
  arrangement.loopStart = 0;
  arrangement.loopEnd = 8.2;
  arrangement.key = null;
  arrangement.selectedTrackId = null;
  arrangement.selectedNoteIndex = 0;
  if (els.trackPitchEditor) els.trackPitchEditor.hidden = true;
  try {
    localStorage.removeItem(ARRANGEMENT_STORAGE_KEY);
  } catch {
    // A new take still starts with an empty arrangement.
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

async function handleAudioUpload(file) {
  if (!file) return;
  if (!file.type.startsWith("audio/")) {
    showToast("请选择 MP3、WAV、M4A 等音频文件");
    return;
  }

  stopRecording();
  stopSourcePlayback();
  stopMelodyPlayback();
  clearSessionData(true);
  state.isAnalyzing = true;
  state.sourceName = file.name;
  state.sourceType = "upload";
  state.audioBlob = file;
  if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
  state.audioUrl = URL.createObjectURL(file);
  els.sourceAudio.src = state.audioUrl;
  els.sourceFileName.textContent = file.name;
  els.sourceFileMeta.textContent = "正在读取音频…";
  els.sourcePlayer.classList.add("visible");
  els.recordLabel.textContent = "正在分析音频";
  els.stageStateText.textContent = "正在读取";
  els.stageDetail.textContent = file.name;
  els.canvasEmpty.classList.add("hidden");
  els.analysisStatus.textContent = "分析中";
  setStep(1);

  try {
    const arrayBuffer = await file.arrayBuffer();
    const context = getAudioContext();
    const audioBuffer = await context.decodeAudioData(arrayBuffer.slice(0));
    if (audioBuffer.duration > 46) {
      showToast("音频较长，本次会分析前 45 秒");
    }
    state.audioBuffer = audioBuffer;
    state.duration = Math.min(45, audioBuffer.duration);
    els.sourceFileMeta.textContent = `${formatTime(audioBuffer.duration)} · ${Math.round(audioBuffer.sampleRate / 1000)} kHz`;
    await analyzeAudioBuffer(audioBuffer);
  } catch (error) {
    console.error(error);
    state.isAnalyzing = false;
    els.recordLabel.textContent = "点击开始哼唱";
    els.stageStateText.textContent = "读取失败";
    els.analysisStatus.textContent = "无法解析";
    showToast("无法解析这个音频文件，请尝试 WAV 或 MP3 格式");
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

async function analyzeAudioBuffer(audioBuffer) {
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const sampleRate = 16000;
  const mono = resampleMono(audioBuffer, sampleRate);
  const frameSize = 1024;
  const hop = 512;
  const samples = [];
  let lastPitch = null;

  for (let offset = 0; offset + frameSize < mono.length; offset += hop) {
    const frame = mono.subarray(offset, offset + frameSize);
    const pitch = detectPitchYin(frame, sampleRate);
    const time = offset / sampleRate;
    if (pitch.frequency > 0 && pitch.confidence > 0.5) {
      smoothedPitch = lastPitch && Math.abs(pitch.frequency - lastPitch) < 2 ? (lastPitch + pitch.frequency) / 2 : pitch.frequency;
      lastPitch = smoothedPitch;
      const exactMidi = 69 + 12 * Math.log2(smoothedPitch / 440);
      samples.push({
        t: time,
        midi: exactMidi,
        rounded: Math.round(exactMidi),
        confidence: pitch.confidence,
      });
    } else if (lastPitch && samples.length) {
      const last = samples[samples.length - 1];
      if (time - last.t > 0.1 && samples[samples.length - 1].midi !== null) {
        samples.push({ t: time, midi: null, confidence: 0 });
      }
      lastPitch = null;
    }
    if (offset % (hop * 24) === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  if (samples.length < 5) {
    state.isAnalyzing = false;
    els.recordLabel.textContent = "点击开始哼唱";
    els.stageStateText.textContent = "未识别到主旋律";
    els.analysisStatus.textContent = "未识别";
    showToast("没有找到稳定的单音旋律，请尝试更清晰的清唱音频");
    return;
  }

  await analyzeSamples(samples, state.duration, "upload");
}

function pitchClassDistance(first, second) {
  const distance = Math.abs(((first % 12) + 12) % 12 - (((second % 12) + 12) % 12));
  return Math.min(distance, 12 - distance);
}

function stabilizePitchSamples(samples) {
  const result = samples.map((sample) => ({ ...sample }));
  const voicedIndices = [];
  result.forEach((sample, index) => {
    if (sample.midi !== null && sample.confidence > 0.45) voicedIndices.push(index);
  });

  const chunks = [];
  let indices = [];
  voicedIndices.forEach((index, position) => {
    const previousIndex = voicedIndices[position - 1];
    if (
      indices.length &&
      previousIndex !== undefined &&
      result[index].t - result[previousIndex].t > 0.14
    ) {
      chunks.push(indices);
      indices = [];
    }
    indices.push(index);
  });
  if (indices.length) chunks.push(indices);

  chunks.forEach((chunk) => {
    if (chunk.length < 3) return;
    const values = chunk.map((index) => result[index].midi);
    const medianOf = (source) => {
      const sorted = [...source].sort((a, b) => a - b);
      return sorted[Math.floor(sorted.length / 2)];
    };
    const medianFiltered = values.map((value, index) =>
      medianOf(values.slice(Math.max(0, index - 2), Math.min(values.length, index + 3)))
    );
    const despiked = medianFiltered.map((value, index) => {
      const windowValues = medianFiltered.slice(
        Math.max(0, index - 3),
        Math.min(medianFiltered.length, index + 4)
      );
      const center = medianOf(windowValues);
      return Math.abs(value - center) > 3.4 ? center : value;
    });

    let previous = despiked[0];
    const continuous = despiked.map((value, index) => {
      let adjusted = value;
      const jump = adjusted - previous;
      if (Math.abs(jump) >= 8 && pitchClassDistance(adjusted, previous) <= 1.5) {
        const octaveShift = -12 * Math.round(jump / 12);
        const shifted = adjusted + octaveShift;
        if (Math.abs(shifted - previous) < Math.abs(adjusted - previous)) adjusted = shifted;
      }
      if (index > 0 && Math.abs(adjusted - previous) > 6.5) {
        adjusted = previous * 0.72 + adjusted * 0.28;
      } else {
        adjusted = index === 0 ? adjusted : previous * 0.42 + adjusted * 0.58;
      }
      previous = adjusted;
      return adjusted;
    });

    chunk.forEach((sampleIndex, index) => {
      result[sampleIndex].midi = continuous[index];
      result[sampleIndex].rounded = Math.round(continuous[index]);
    });
  });
  return result;
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
  const mapped = notes.map((note) => ({
    ...note,
    midi: nearestScaleMidi(note.midi, key, 6),
  }));
  const constrained = [];
  mapped.forEach((note) => {
    const previous = constrained[constrained.length - 1];
    let midi = note.midi;
    if (previous && Math.abs(midi - previous.midi) > 10) {
      const shifted = midi + (midi > previous.midi ? -12 : 12);
      if (nearestScaleMidi(shifted, key, 0.1) === shifted) midi = shifted;
    }
    if (
      previous &&
      midi === previous.midi &&
      note.start - (previous.start + previous.duration) < 0.12
    ) {
      previous.duration = Math.max(previous.duration, note.start + note.duration - previous.start);
      previous.confidence = Math.max(previous.confidence, note.confidence);
      return;
    }
    constrained.push({ ...note, midi });
  });
  return constrained.filter((note) => note.duration >= 0.14);
}

function melodyNotesFromSamples(samples) {
  const voiced = samples.filter((sample) => sample.midi !== null && sample.confidence > 0.48);
  if (!voiced.length) return [];
  const median = (values) => {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  };

  const chunks = [];
  let chunk = [];
  voiced.forEach((sample, index) => {
    const previous = voiced[index - 1];
    if (chunk.length && (!previous || sample.t - previous.t > 0.16)) {
      chunks.push(chunk);
      chunk = [];
    }
    chunk.push(sample);
  });
  if (chunk.length) chunks.push(chunk);

  const notes = [];
  const minimumStableTime = 0.17;
  chunks.forEach((samplesInChunk) => {
    if (samplesInChunk.length < 3) return;
    const smoothed = samplesInChunk.map((sample, index, all) => {
      const from = Math.max(0, index - 2);
      const to = Math.min(all.length, index + 3);
      return {
        ...sample,
        midi: median(all.slice(from, to).map((item) => item.midi)),
      };
    });

    let currentMidi = Math.round(smoothed[0].midi);
    let currentStart = smoothed[0].t;
    let currentPitches = [smoothed[0].midi];
    let currentConfidences = [smoothed[0].confidence];
    let candidate = null;

    const commitNote = (endTime) => {
      const duration = endTime - currentStart;
      if (duration < 0.11 || !currentPitches.length) return;
      const center = Math.round(median(currentPitches));
      const confidence =
        currentConfidences.reduce((sum, value) => sum + value, 0) / currentConfidences.length;
      const previous = notes[notes.length - 1];
      if (
        previous &&
        previous.midi === center &&
        currentStart - (previous.start + previous.duration) < 0.09
      ) {
        previous.duration = endTime - previous.start;
        previous.confidence = Math.max(previous.confidence, confidence);
      } else {
        notes.push({
          midi: center,
          start: currentStart,
          duration,
          confidence,
        });
      }
    };

    for (let index = 1; index < smoothed.length; index += 1) {
      const sample = smoothed[index];
      const rounded = Math.round(sample.midi);
      const deviation = Math.abs(sample.midi - currentMidi);

      if (deviation <= 0.72 || rounded === currentMidi) {
        currentPitches.push(sample.midi);
        currentConfidences.push(sample.confidence);
        candidate = null;
        continue;
      }

      if (!candidate || candidate.midi !== rounded) {
        candidate = {
          midi: rounded,
          start: sample.t,
          pitches: [sample.midi],
          confidences: [sample.confidence],
        };
      } else {
        candidate.pitches.push(sample.midi);
        candidate.confidences.push(sample.confidence);
      }

      if (candidate && sample.t - candidate.start >= minimumStableTime) {
        const boundary = Math.max(currentStart + 0.06, candidate.start - 0.025);
        commitNote(boundary);
        currentMidi = candidate.midi;
        currentStart = candidate.start;
        currentPitches = [...candidate.pitches];
        currentConfidences = [...candidate.confidences];
        candidate = null;
      }
    }
    const frameStep = smoothed.length > 1
      ? smoothed[smoothed.length - 1].t - smoothed[smoothed.length - 2].t
      : 0.04;
    commitNote(smoothed[smoothed.length - 1].t + Math.min(0.08, frameStep + 0.025));
  });

  notes.sort((a, b) => a.start - b.start);
  const cleaned = [];
  notes.forEach((note) => {
    const duration = Math.max(0.1, note.duration);
    if (duration < 0.14) {
      const previous = cleaned[cleaned.length - 1];
      if (previous && note.start - (previous.start + previous.duration) < 0.14) {
        previous.duration = Math.max(
          previous.duration,
          note.start + duration - previous.start
        );
        return;
      }
    }
    const previous = cleaned[cleaned.length - 1];
    if (
      previous &&
      previous.midi === note.midi &&
      note.start - (previous.start + previous.duration) < 0.1
    ) {
      previous.duration = note.start + duration - previous.start;
      previous.confidence = Math.max(previous.confidence, note.confidence);
      return;
    }
    cleaned.push({ ...note, duration });
  });

  return cleaned
    .filter((note) => note.duration >= 0.14)
    .map((note) => ({
      ...note,
      midi: Math.max(36, Math.min(96, note.midi)),
      duration: Math.min(3.2, Math.max(0.14, note.duration)),
    }));
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

  const key = estimateKey(state.samples);
  const extractedNotes = melodyNotesFromSamples(state.samples);
  const notes = state.scaleSnap ? snapNotesToScale(extractedNotes, key) : extractedNotes;
  if (!notes.length || !key) {
    state.isAnalyzing = false;
    els.recordLabel.textContent = "点击重新哼唱";
    els.stageStateText.textContent = "未识别到稳定音高";
    els.analysisStatus.textContent = "未识别";
    showToast("音高不够稳定，请放松喉咙并延长每个音节");
    resetSteps();
    drawVisualizer(0);
    return;
  }

  state.notes = notes;
  state.key = key;
  state.isAnalyzing = false;
  state.demoMode = false;
  state.duration = Math.max(duration, notes[notes.length - 1].start + notes[notes.length - 1].duration + 0.35);
  updateAnalysisUI(key, notes, state.duration);
  setStep(3);
  [...els.processingSteps.children].forEach((item, index) => {
    item.classList.toggle("done", index <= 2);
    item.classList.remove("active");
  });
  els.recordLabel.textContent = "点击重新哼唱";
  els.stageStateText.textContent = sourceType === "demo" ? "示例已载入" : "旋律已识别";
  els.stageDetail.textContent = `${notes.length} 个音符 · ${formatTime(state.duration)}`;
  els.noteCents.textContent = "分析完成";
  els.playBtn.disabled = false;
  syncStudioActionState();
  els.playLabel.textContent = `用${getInstrumentDefinition(state.instrument).name}试听`;
  els.playSubLabel.textContent = `${getKeyLabel(key)} · 点击播放`;
  els.analysisStatus.textContent = "分析完成";
  els.analysisStatus.classList.add("ready");
  els.canvasEmpty.classList.add("hidden");
  if (sourceType === "upload") {
    els.recordLabel.textContent = "音频已分析";
    els.sourcePlayer.classList.add("visible");
  }
  drawVisualizer(0);
  window.setTimeout(() => {
    if (state.notes.length && !state.isPlaying) playMelody(0);
  }, 240);
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
  const low = noteNameFromMidi(Math.min(...notes.map((note) => note.midi)));
  const high = noteNameFromMidi(Math.max(...notes.map((note) => note.midi)));
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
  els.canvasScaleRail.innerHTML = scaleData
    .map(
      (note, index) =>
        `<span class="${usedPitchClasses.has(note.pitchClass) ? "detected " : ""}${index === 0 ? "root" : ""}" data-pitch-class="${note.pitchClass}">${note.name}</span>`
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
  clearSessionData(false);
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

function createGrooveStudyData() {
  clearSessionData(false);
  const bpm = 117;
  const beat = 60 / bpm;
  els.tempoInput.value = String(bpm);

  const melodyPattern = [
    [62, 0, 0.72],
    [69, 0.78, 0.26],
    [67, 1.24, 0.58],
    [65, 1.92, 0.52],
    [64, 2.54, 0.38],
    [62, 3.0, 0.94],
    [65, 4.0, 0.46],
    [69, 4.55, 0.34],
    [72, 5.0, 0.76],
    [70, 5.9, 0.68],
    [69, 6.72, 0.65],
    [67, 7.46, 0.5],
    [65, 8.05, 0.68],
    [64, 8.82, 0.58],
    [62, 9.48, 1.16],
    [65, 11.65, 0.52],
    [64, 12.26, 0.42],
    [62, 12.78, 0.62],
    [60, 13.48, 1.32],
  ];
  const melodyNotes = melodyPattern.map(([midi, startBeat, durationBeats]) => ({
    midi,
    start: startBeat * beat,
    duration: durationBeats * beat,
    confidence: 0.94,
  }));

  const chordRoots = [38, 36, 34, 33];
  const bassNotes = [];
  const chordNotes = [];
  chordRoots.forEach((root, chordIndex) => {
    const startBeat = chordIndex * 4;
    const bassPattern = [
      [0, 0.46],
      [0.75, 0.24],
      [1.5, 0.34],
      [2.25, 0.24],
      [3.0, 0.48],
      [3.55, 0.2],
    ];
    bassPattern.forEach(([offset, duration]) => {
      bassNotes.push({
        midi: root,
        start: (startBeat + offset) * beat,
        duration: duration * beat,
        confidence: 0.94,
      });
    });
    const [third, fifth] = [
      [50, 53, 57],
      [48, 52, 55],
      [46, 50, 53],
      [45, 49, 52],
    ][chordIndex];
    [third, fifth].forEach((midi) => {
      chordNotes.push({
        midi,
        start: startBeat * beat,
        duration: 1.45 * beat,
        confidence: 0.9,
      });
    });
  });

  const drumNotes = [];
  const drumPattern = [
    [36, 0],
    [42, 0],
    [38, 1],
    [42, 1.5],
    [36, 2],
    [42, 2.5],
    [38, 3],
    [42, 3.5],
  ];
  for (let bar = 0; bar < 4; bar += 1) {
    drumPattern.forEach(([midi, offset]) => {
      drumNotes.push({
        midi,
        start: (bar * 4 + offset) * beat,
        duration: 0.12,
        confidence: 1,
      });
    });
  }

  const preset = (id) => LAB_PRESETS.find((item) => item.id === id);
  const makePresetTrack = (presetId, name, notes, volume = 78) => {
    const definition = preset(presetId);
    const track = createArrangementTrack(definition.instrument, name, notes);
    track.instrumentName = definition.name;
    track.instrumentBase = definition.instrument;
    track.instrumentPatch = { ...definition.params };
    track.color = INSTRUMENTS.find((item) => item.id === definition.instrument)?.color || track.color;
    track.volume = volume;
    return track;
  };

  const drumTrack = createArrangementTrack("drums", "1983 鼓机", drumNotes);
  drumTrack.volume = 82;

  arrangement.tracks = [
    makePresetTrack("reference-glass-keys", "玻璃电钢", melodyNotes, 82),
    makePresetTrack("reference-rubber-bass", "夜行橡胶贝斯", bassNotes, 88),
    makePresetTrack("reference-harbor-pad", "港夜玻璃 Pad", chordNotes, 56),
    drumTrack,
  ];
  arrangement.bpm = bpm;
  arrangement.baseBpm = bpm;

  state.demoMode = true;
  state.samples = reconstructSamples(melodyNotes);
  state.notes = melodyNotes;
  state.key = {
    tonic: 2,
    mode: "minor",
    confidence: 0.92,
    score: 1,
    related: { tonic: 5, mode: "major" },
  };
  state.duration = 15.2 * beat;
  state.sourceName = "1983 暗夜律动";
  state.sourceType = "groove-demo";
  els.sourcePlayer.classList.remove("visible");
  els.canvasEmpty.classList.add("hidden");
  els.liveNote.classList.remove("visible");
  updateAnalysisUI(state.key, melodyNotes, state.duration);
  setStep(3);
  [...els.processingSteps.children].forEach((item, index) => {
    item.classList.toggle("done", index <= 2);
    item.classList.remove("active");
  });
  els.recordLabel.textContent = "点击开始哼唱";
  els.stageStateText.textContent = "1983 暗夜律动已载入";
  els.stageDetail.textContent = `${melodyNotes.length} 个音符 · 80s 多轨编曲`;
  els.playBtn.disabled = false;
  syncStudioActionState();
  els.playLabel.textContent = "用玻璃电钢试听";
  els.playSubLabel.textContent = "D 小调 · 1983 暗夜律动";
  els.analysisStatus.textContent = "风格分析完成";
  els.analysisStatus.classList.add("ready");
  calculateArrangementDuration();
  persistArrangement();
  renderArrangement();
  switchView("arrangement");
  window.setTimeout(() => playArrangement(), 260);
  showToast("已创建原创 80s 致敬编曲，不包含原曲旋律");
}

function drawVisualizer(playheadTime = 0) {
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
  const visibleDuration =
    state.isRecording ? Math.max(8, (performance.now() - recordStartedAt) / 1000) : totalDuration;
  const timeToX = (time) => pad.left + (time / visibleDuration) * plotWidth;
  let lowMidi = 48;
  let highMidi = 86;
  if (!state.isRecording && state.notes.length && state.scaleSnap) {
    const noteLow = Math.min(...state.notes.map((note) => note.midi));
    const noteHigh = Math.max(...state.notes.map((note) => note.midi));
    lowMidi = Math.max(36, noteLow - 4);
    highMidi = Math.min(96, noteHigh + 4);
    if (highMidi - lowMidi < 14) {
      const center = (highMidi + lowMidi) / 2;
      lowMidi = Math.max(36, Math.floor(center - 7));
      highMidi = Math.min(96, Math.ceil(center + 7));
    }
  }
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
  } else if (state.key && state.scaleSnap && state.notes.length && !state.isRecording) {
    drawMusicalNotes(ctx, pad, plotWidth, plotHeight, visibleDuration, timeToX, midiToY, playheadTime);
  } else {
    drawPitchPath(ctx, pad, plotWidth, plotHeight, visibleDuration, timeToX, midiToY);
  }

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
  if (!state.key) return;
  const scalePitchClasses = new Set(
    SCALE_STEPS[state.key.mode].map((step) => (state.key.tonic + step) % 12)
  );
  const notes = state.notes
    .filter(
      (note) =>
        scalePitchClasses.has(((Math.round(note.midi) % 12) + 12) % 12) &&
        note.start <= visibleDuration
    )
    .sort((a, b) => a.start - b.start);
  if (!notes.length) return;

  const rowHeight = Math.max(
    3.5,
    Math.min(11, plotHeight / Math.max(12, getVisibleMidiSpan()))
  );
  let previousNote = null;

  notes.forEach((note) => {
    const x1 = timeToX(note.start);
    const x2 = timeToX(Math.min(visibleDuration, note.start + note.duration));
    const y = midiToY(note.midi);
    const width = Math.max(5, x2 - x1);
    const active =
      state.isPlaying &&
      playheadTime >= note.start &&
      playheadTime <= note.start + note.duration;

    if (previousNote && note.start - (previousNote.start + previousNote.duration) < 0.32) {
      const previousX = timeToX(previousNote.start + previousNote.duration);
      const previousY = midiToY(previousNote.midi);
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
    ctx.strokeStyle = active ? "#ffd3c4" : "#ff8055";
    ctx.lineWidth = active ? 1.8 : 1.15;
    ctx.shadowColor = active ? "rgba(255,128,85,0.7)" : "rgba(255,128,85,0.18)";
    ctx.shadowBlur = active ? 11 : 3;
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (width > 30) {
      const noteLabel = noteNameFromMidi(note.midi, state.key ? usesFlatSpelling(state.key) : false);
      ctx.font = '7px "Avenir Next", sans-serif';
      ctx.fillStyle = active ? "#1a1f1e" : "rgba(255,196,174,0.72)";
      ctx.fillText(`${noteLabel.name}${noteLabel.octave}`, x1 + 5, y);
    }
    previousNote = note;
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

function playMelody(offset = 0) {
  if (!state.notes.length || state.isAnalyzing) return;
  const context = getAudioContext();
  stopMelodyPlayback(false);
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

function scheduleInstrumentNote(instrumentId, midi, when, duration, volume = 1) {
  const context = getAudioContext();
  const frequency = midiToFrequency(midi);
  const master = context.createGain();
  master.gain.value = 0.36 * volume;
  master.connect(context.destination);
  const nodes = [];

  const makeOsc = (type, detune = 0, level = 1) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, when);
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
  clearSessionData(true);
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

  track.push(0, 0xff, 0x03, 11, ...pushText("MELD Melody"));
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
  anchor.download = `MELD-${state.key ? getKeyLabel(state.key) : "melody"}.mid`;
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
  if (cloudEnabled) {
    if (!cloudSession) {
      openAuthDialog("login");
      showToast("登录后即可保存到云端作品库");
      return false;
    }
    updateCloudState("syncing");
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
  const hasMelody = state.notes.length > 0;
  els.saveProjectBtn.disabled = !hasMelody;
  els.exportBtn.disabled = !hasMelody;
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

function projectWaveSvg(project) {
  const notes = project.notes || [];
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
  const totalNotes = projects.reduce((sum, project) => sum + (project.notes?.length || 0), 0);
  const latest = [...projects].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0];
  els.projectTotal.textContent = String(projects.length).padStart(2, "0");
  els.projectNotesTotal.textContent = String(totalNotes).padStart(3, "0");
  els.projectLatest.textContent = latest ? formatProjectDate(latest.updatedAt) : "—";
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
    .map((project, index) => {
      const instrument = getInstrumentDefinition(project.instrument);
      const instrumentName = project.instrumentName || instrument.name;
      const keyLabel = project.key ? getKeyLabel(project.key) : "未识别调性";
      const memo = project.memo?.trim() || "还没有创作备注，打开作品继续编写下一段。";
      return `
        <article class="project-card" data-project-id="${escapeHtml(project.id)}">
          <div
            class="project-art"
            style="--project-accent:${instrument.color};--project-accent-soft:${instrument.color}2b"
          >
            ${projectWaveSvg(project)}
            <span class="project-badge">${escapeHtml(keyLabel)} · ${escapeHtml(instrumentName)}</span>
            <span class="project-art-index">${String(index + 1).padStart(2, "0")}</span>
          </div>
          <div class="project-body">
            <h3>${escapeHtml(project.title)}</h3>
            <p>${escapeHtml(memo)}</p>
            <div class="project-meta-row">
              <span><i></i>${escapeHtml(instrumentName)} · ${Number(project.tempo) || 84} BPM</span>
              <span>${escapeHtml(formatProjectDate(project.updatedAt))} · ${project.notes.length} 音符</span>
            </div>
          </div>
          <div class="project-card-actions">
            <button class="project-open" type="button" data-project-action="open">继续创作</button>
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
}

function openProjectDialog(mode, projectId = null) {
  if (mode !== "rename" && !state.notes.length) {
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
      existing?.title || `未命名旋律 ${String(projects.length + 1).padStart(2, "0")}`;
    els.projectMemoInput.value = existing?.memo || "";
    els.projectSubmitBtn.textContent = existing ? "更新作品" : "保存到我的作品";
    const instrument = getInstrumentDefinition(state.instrument);
    els.projectFormSummary.textContent = [
      state.key ? getKeyLabel(state.key) : "未识别调性",
      `${state.notes.length} 个音符`,
      instrument?.name || "钢琴",
      `${Number(els.tempoInput.value) || 84} BPM`,
      "仅保存在当前浏览器",
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

function handleProjectFormSubmit(event) {
  event.preventDefault();
  if (cloudEnabled && !cloudSession) {
    openAuthDialog("login");
    showToast("登录后才能保存到云端作品库");
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
    persistProjects();
    renderProjects();
    closeProjectDialog();
    showToast("作品信息已更新");
    return;
  }

  const existing = editingProjectId
    ? projects.find((project) => project.id === editingProjectId)
    : null;
  const selectedInstrument = getInstrumentDefinition(state.instrument);
  const project = {
    id: existing?.id || makeId(),
    title,
    memo,
    notes: state.notes.map((note) => ({ ...note })),
    key: state.key ? { ...state.key, related: { ...state.key.related } } : null,
    instrument: state.instrument,
    instrumentName: selectedInstrument.name,
    instrumentBase: selectedInstrument.baseInstrument || selectedInstrument.id,
    instrumentPatch: getInstrumentPatch(state.instrument),
    tempo: Number(els.tempoInput.value) || 84,
    duration: state.duration,
    arrangement: arrangement.tracks.map((track) => ({
      ...track,
      notes: track.notes.map((note) => ({ ...note })),
    })),
    arrangementBpm: arrangement.bpm,
    arrangementBaseBpm: arrangement.baseBpm,
    arrangementLoopEnabled: arrangement.loopEnabled,
    arrangementLoopStart: arrangement.loopStart,
    arrangementLoopEnd: arrangement.loopEnd,
    sourceName: state.sourceName || "哼唱旋律",
    createdAt: existing?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  if (existing) {
    projects = projects.map((item) => (item.id === existing.id ? project : item));
  } else {
    projects.push(project);
  }
  if (!persistProjects()) return;
  state.activeProjectId = project.id;
  renderProjects();
  closeProjectDialog();
  showToast(existing ? "作品已更新" : "已保存到「我的作品」");
}

function openSavedProject(projectId) {
  const project = projects.find((item) => item.id === projectId);
  if (!project || !project.notes?.length) {
    showToast("这首作品暂时无法打开");
    return;
  }
  stopRecording();
  stopMelodyPlayback();
  clearSessionData(true);
  state.activeProjectId = project.id;
  state.notes = project.notes.map((note) => ({
    ...note,
    confidence: note.confidence || 0.82,
    duration: Math.max(0.08, note.duration),
  }));
  state.samples = reconstructSamples(state.notes);
  state.key = project.key || estimateKey(state.samples);
  if (!state.key) {
    state.key = {
      tonic: 0,
      mode: "major",
      confidence: 0.5,
      score: 0,
      related: { tonic: 9, mode: "minor" },
    };
  }
  state.duration = Math.max(
    Number(project.duration) || 0,
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
    ? project.arrangement.map((track) => ({
        ...track,
        notes: (track.notes || []).map((note) => ({ ...note })),
      }))
    : [];
  arrangement.bpm = Number(project.arrangementBpm) || Number(project.tempo) || 84;
  arrangement.baseBpm =
    Number(project.arrangementBaseBpm) || Number(project.tempo) || arrangement.bpm;
  arrangement.loopEnabled = Boolean(project.arrangementLoopEnabled);
  arrangement.loopStart = Math.max(0, Number(project.arrangementLoopStart) || 0);
  arrangement.loopEnd = Math.max(
    arrangement.loopStart + arrangementBarDuration(),
    Number(project.arrangementLoopEnd) || arrangement.loopStart + arrangementBarDuration() * 4
  );
  arrangement.duration = Math.max(12, state.duration);
  persistArrangement();
  updateAnalysisUI(project.key, state.notes, state.duration);
  setStep(3);
  [...els.processingSteps.children].forEach((item, index) => {
    item.classList.toggle("done", index <= 2);
    item.classList.remove("active");
  });
  els.canvasEmpty.classList.add("hidden");
  els.liveNote.classList.remove("visible");
  els.playBtn.disabled = false;
  els.playLabel.textContent = `用${getInstrumentDefinition(state.instrument).name}试听`;
  els.playSubLabel.textContent = `${getKeyLabel(state.key)} · 已从作品库打开`;
  els.stageStateText.textContent = "作品已打开";
  els.stageDetail.textContent = `${project.title} · ${state.notes.length} 个音符`;
  els.analysisStatus.textContent = "已保存";
  els.analysisStatus.classList.add("ready");
  els.recordLabel.textContent = "点击重新哼唱";
  syncStudioActionState();
  switchView("studio");
  drawVisualizer(0);
  showToast(`已打开「${project.title}」`);
}

function duplicateProject(projectId) {
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
    arrangement: (original.arrangement || []).map((track) => ({
      ...track,
      notes: (track.notes || []).map((note) => ({ ...note })),
    })),
  };
  projects.push(copy);
  if (!persistProjects()) return;
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
  if (!cloudEnabled) {
    els.cloudStatus.className = "save-state cloud-unconfigured";
    els.cloudStatus.innerHTML = "<i></i> 云端未配置";
    els.authBtn.textContent = "配置";
    els.authBtn.classList.remove("user-connected");
    if (els.libraryStorageCopy) {
      els.libraryStorageCopy.innerHTML =
        "本地预览模式<br><small>配置 Supabase 后启用云端同步</small>";
    }
    return;
  }
  const email = cloudSession?.user?.email || "";
  els.authBtn.textContent = email ? email.charAt(0).toUpperCase() : "登录";
  els.authBtn.classList.toggle("user-connected", Boolean(email));
  els.authBtn.setAttribute(
    "aria-label",
    email ? `已登录 ${email}，打开账户菜单` : "登录云端"
  );
  const labels = {
    connected: "云端已同步",
    syncing: "正在同步…",
    error: "同步异常",
    "signed-out": "云端未登录",
  };
  els.cloudStatus.className = `save-state cloud-${status}`;
  els.cloudStatus.innerHTML = `<i></i> ${labels[status] || labels["signed-out"]}`;
  if (els.libraryStorageCopy) {
    els.libraryStorageCopy.innerHTML = email
      ? `已同步到云端账户<br><small>${escapeHtml(email)}</small>`
      : "登录后跨设备同步<br><small>作品与音色保存在 Supabase</small>";
  }
}

function setAuthMode(mode) {
  authMode = mode === "signup" ? "signup" : "login";
  els.authTabs.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.authMode === authMode);
  });
  els.authTitle.textContent = authMode === "signup" ? "创建 MELD 账户" : "登录 MELD";
  els.authCopy.textContent =
    authMode === "signup"
      ? "注册后，你的作品、编曲与自定义音色会保存在云端。"
      : "登录后，作品、编曲和自定义音色会同步到你的云端账户。";
  els.authSubmitBtn.textContent = authMode === "signup" ? "创建账户" : "登录并同步";
  els.authPasswordInput.autocomplete =
    authMode === "signup" ? "new-password" : "current-password";
  els.authMessage.textContent = "";
  els.authMessage.classList.remove("success");
}

function openAuthDialog(mode = "login") {
  if (!cloudEnabled) {
    showToast("请先在 cloud-config.js 中填写 Supabase 项目 URL 和 anon key");
    return;
  }
  els.authDialog.classList.toggle("account-mode", Boolean(cloudSession));
  els.authLogoutBtn.hidden = !cloudSession;
  if (cloudSession) {
    els.authTitle.textContent = "云端账户";
    els.authCopy.textContent = `已登录 ${cloudSession.user.email || "云端账户"}，作品与音色会同步到该账户。`;
  } else {
    setAuthMode(mode);
  }
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
      localStorage.removeItem(ARRANGEMENT_STORAGE_KEY);
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
  if (!cloudEnabled) return;
  const email = els.authEmailInput.value.trim();
  const password = els.authPasswordInput.value;
  if (!email || password.length < 6) {
    els.authMessage.textContent = "请输入有效邮箱和至少 6 位密码";
    return;
  }
  els.authSubmitBtn.disabled = true;
  els.authMessage.textContent =
    authMode === "signup" ? "正在创建账户…" : "正在登录…";
  els.authMessage.classList.remove("success");
  try {
    if (authMode === "signup") {
      const result = await window.MeldCloud.signUp(email, password);
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
    showToast("已连接云端，作品与音色同步完成");
  } catch (error) {
    els.authMessage.textContent = error.message || "登录失败，请稍后重试";
  } finally {
    els.authSubmitBtn.disabled = false;
  }
}

async function logoutCloud() {
  await window.MeldCloud?.signOut();
  cloudSession = null;
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
  if (!["studio", "works", "lab", "arrangement"].includes(view)) return;
  if (state.currentView === "studio" && view !== "studio" && state.isRecording) {
    stopRecording();
  }
  if (state.currentView === "studio" && view !== "studio") stopMelodyPlayback();
  if (state.currentView === "lab" && view !== "lab") stopLabPlayback();
  if (state.currentView === "arrangement" && view !== "arrangement") stopArrangementPlayback();
  if (
    (state.currentView === "studio" || state.currentView === "arrangement") &&
    view !== "studio" &&
    view !== "arrangement"
  ) {
    state.metronome = false;
    stopMetronome();
  }

  state.currentView = view;
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === view);
  });
  els.studioView.hidden = view !== "studio";
  els.worksView.hidden = view !== "works";
  els.labView.hidden = view !== "lab";
  els.arrangementView.hidden = view !== "arrangement";
  els.studioView.classList.toggle("active", view === "studio");
  els.worksView.classList.toggle("active", view === "works");
  els.labView.classList.toggle("active", view === "lab");
  els.arrangementView.classList.toggle("active", view === "arrangement");
  els.saveProjectBtn.hidden = view !== "studio";
  els.exportBtn.hidden = view !== "studio";

  if (view === "works") renderProjects();
  if (view === "lab") {
    syncLabControls();
    startLabVisualizer();
  } else {
    cancelAnimationFrame(labAnimationFrame);
    labAnimationFrame = null;
  }
  if (view === "arrangement") {
    ensureArrangementTracks();
    arrangement.bpm = Number(els.tempoInput.value) || arrangement.bpm;
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
            ? "M 静音 · S 独奏"
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
  document.querySelectorAll(".lab-instrument-button").forEach((button) => {
    const active = button.dataset.labInstrument === labState.instrument;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
}

function saveLabSettings() {
  try {
    localStorage.setItem(
      LAB_STORAGE_KEY,
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
    const stored = JSON.parse(localStorage.getItem(LAB_STORAGE_KEY) || "null");
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

function renderLabInstruments() {
  els.labInstrumentList.innerHTML = INSTRUMENTS.map((instrument, index) => `
    <button
      class="lab-instrument-button${instrument.id === labState.instrument ? " active" : ""}"
      type="button"
      role="option"
      aria-selected="${instrument.id === labState.instrument}"
      data-lab-instrument="${instrument.id}"
    >
      <span class="rail-icon">${instrument.icon}</span>
      <span>
        <strong>${instrument.name}</strong>
        <small>${instrument.en}</small>
      </span>
      <b>0${index + 1}</b>
    </button>
  `).join("");
  els.labInstrumentList.querySelectorAll("[data-lab-instrument]").forEach((button) => {
    button.addEventListener("click", () => {
      const instrument = INSTRUMENTS.find((item) => item.id === button.dataset.labInstrument);
      labState.instrument = instrument.id;
      labState.params = { ...LAB_DEFAULTS[instrument.id] };
      labState.presetName = instrument.name;
      labState.presetMeta = `${instrument.en} · DEFAULT`;
      syncLabControls();
      renderLabPresets();
      saveLabSettings();
      els.labStatusText.textContent = `已载入${instrument.name}默认音色`;
    });
  });
}

function renderLabKeyboard() {
  const whiteNotes = [60, 62, 64, 65, 67, 69, 71, 72];
  const blackNotes = [
    { midi: 61, left: 12.5, key: "W" },
    { midi: 63, left: 25, key: "E" },
    { midi: 66, left: 50, key: "T" },
    { midi: 68, left: 62.5, key: "Y" },
    { midi: 70, left: 75, key: "U" },
  ];
  const whiteKeys = ["A", "S", "D", "F", "G", "H", "J", "K"];
  els.labKeyboard.innerHTML =
    whiteNotes
      .map((midi, index) => {
        const note = noteNameFromMidi(midi);
        return `
          <button class="piano-key white" type="button" data-midi="${midi}" aria-label="${note.name}${note.octave}">
            ${note.name}${note.octave}<br /><small>${whiteKeys[index]}</small>
          </button>
        `;
      })
      .join("") +
    blackNotes
      .map(({ midi, left, key }) => {
        const note = noteNameFromMidi(midi);
        return `
          <button
            class="piano-key black"
            type="button"
            data-midi="${midi}"
            style="left:${left}%"
            aria-label="${note.name}${note.octave}"
          >${key}</button>
        `;
      })
      .join("");
  els.labKeyboard.querySelectorAll("[data-midi]").forEach((key) => {
    key.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      triggerLabNote(Number(key.dataset.midi));
    });
  });
}

function renderLabPresets() {
  els.labPresetGrid.innerHTML = LAB_PRESETS.map((preset) => {
    const instrument = INSTRUMENTS.find((item) => item.id === preset.instrument);
    const active = preset.name === labState.presetName;
    return `
      <button
        class="lab-preset-card${preset.category === "reference" ? " reference" : ""}${active ? " active" : ""}"
        type="button"
        data-lab-preset="${preset.id}"
        style="--preset-color:${instrument.color}"
      >
        <span>${String(LAB_PRESETS.indexOf(preset) + 1).padStart(2, "0")}</span>
        <strong>${preset.name}</strong>
        <small>${preset.category === "reference" ? "REFERENCE PACK · " : ""}${preset.short}</small>
        <span class="preset-lines" aria-hidden="true">
          <i style="height:5px"></i><i style="height:11px"></i><i style="height:7px"></i>
          <i style="height:14px"></i><i style="height:9px"></i><i style="height:4px"></i>
          <i style="height:12px"></i><i style="height:6px"></i>
        </span>
      </button>
    `;
  }).join("");
  els.labPresetGrid.querySelectorAll("[data-lab-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      const preset = LAB_PRESETS.find((item) => item.id === button.dataset.labPreset);
      labState.instrument = preset.instrument;
      labState.params = { ...preset.params };
      labState.presetName = preset.name;
      labState.presetMeta = preset.meta;
      syncLabControls();
      renderLabPresets();
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
  const context = getAudioContext();
  const attack = Math.max(0.005, params.attack / 1000);
  const decay = Math.max(0.02, params.decay / 1000);
  const release = Math.max(0.08, params.release / 1000);
  const holdEnd = when + Math.max(attack + decay + 0.04, duration);
  const end = holdEnd + release + 0.06;
  const frequency = midiToFrequency(midi);
  const frequencyMap = {
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
  }

  const sources = [];
  frequencyMap[instrument].forEach((voice) => {
    const oscillator = context.createOscillator();
    const voiceGain = context.createGain();
    oscillator.type = voice.type;
    oscillator.frequency.setValueAtTime(frequency * voice.ratio, when);
    oscillator.detune.setValueAtTime(voice.detune, when);
    voiceGain.gain.value = voice.gain;
    oscillator.connect(voiceGain);
    voiceGain.connect(filter);
    oscillator.start(when);
    oscillator.stop(end);
    sources.push(oscillator);

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

  return sources;
}

function playLabNote(midi, duration = 0.72) {
  const context = ensureLabEngine();
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
  els.labStatusText.textContent = `${INSTRUMENTS.find((item) => item.id === instrument).name} · ${formatLabValue("brightness", params.brightness)} 亮度`;
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

function triggerLabNote(midi) {
  if (state.currentView !== "lab") return;
  playLabNote(midi, 0.72);
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
  stopLabPlayback();
  const notes = [60, 63, 67, 70, 72, 75, 79, 84];
  els.labStatusText.textContent = "琶音演奏中 · 让空间慢慢展开";
  notes.forEach((midi, index) => {
    const timer = window.setTimeout(() => playLabNote(midi, 0.34), index * 145);
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
  saveLabSettings();
}

function loadArrangement() {
  if (cloudEnabled) return;
  try {
    const stored = JSON.parse(localStorage.getItem(ARRANGEMENT_STORAGE_KEY) || "null");
    if (stored && Array.isArray(stored.tracks)) {
      arrangement.tracks = stored.tracks
        .filter((track) => track && track.id && Array.isArray(track.notes))
        .map((track, index) => ({
          ...track,
          name: track.name || `音轨 ${index + 1}`,
          volume: Number.isFinite(Number(track.volume)) ? Number(track.volume) : 78,
          muted: Boolean(track.muted),
          solo: Boolean(track.solo),
        }));
      arrangement.bpm = Math.max(50, Math.min(160, Number(stored.bpm) || 84));
      arrangement.baseBpm = Math.max(
        50,
        Math.min(160, Number(stored.baseBpm || stored.bpm) || arrangement.bpm)
      );
      arrangement.duration = Math.max(8, Number(stored.duration) || 12);
      arrangement.key = stored.key || null;
      arrangement.loopEnabled = Boolean(stored.loopEnabled);
      arrangement.loopStart = Math.max(0, Number(stored.loopStart) || 0);
      arrangement.loopEnd = Math.min(
        arrangement.duration,
        Math.max(
          arrangement.loopStart + 1,
          Number(stored.loopEnd) || Math.min(arrangement.duration, arrangement.loopStart + 8.2)
        )
      );
    }
  } catch {
    arrangement.tracks = [];
  }
}

function persistArrangement() {
  const payload = {
    tracks: arrangement.tracks.map((track) => ({
      ...track,
      notes: track.notes.map((note) => ({ ...note })),
    })),
    bpm: arrangement.bpm,
    baseBpm: arrangement.baseBpm,
    duration: arrangement.duration,
    key: state.key || arrangement.key,
    loopEnabled: arrangement.loopEnabled,
    loopStart: arrangement.loopStart,
    loopEnd: arrangement.loopEnd,
    updatedAt: Date.now(),
  };
  if (cloudEnabled) {
    if (state.activeProjectId && cloudSession) {
      const project = projects.find((item) => item.id === state.activeProjectId);
      if (project) {
        project.arrangement = payload.tracks;
        project.arrangementBpm = arrangement.bpm;
        project.arrangementBaseBpm = arrangement.baseBpm;
        project.arrangementLoopEnabled = arrangement.loopEnabled;
        project.arrangementLoopStart = arrangement.loopStart;
        project.arrangementLoopEnd = arrangement.loopEnd;
        project.updatedAt = Date.now();
        persistProjects();
      }
    }
    return;
  }
  try {
    localStorage.setItem(ARRANGEMENT_STORAGE_KEY, JSON.stringify(payload));
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
    createArrangementTrack("piano", "低音", []),
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
    ...arrangement.tracks.flatMap((track) =>
      track.notes.map((note) => note.start + note.duration)
    )
  );
  arrangement.duration = Math.max(12, Math.ceil((maxEnd + 1.5) / 4) * 4);
  const barDuration = (4 * 60) / Math.max(50, arrangement.baseBpm);
  if (
    !Number.isFinite(arrangement.loopEnd) ||
    arrangement.loopEnd <= arrangement.loopStart + 0.1 ||
    arrangement.loopEnd > arrangement.duration
  ) {
    arrangement.loopEnd = Math.min(
      arrangement.duration,
      arrangement.loopStart + barDuration * 4
    );
  }
  return arrangement.duration;
}

function trackWaveSvg(track, duration) {
  if (!track.notes.length) return "";
  const minMidi = Math.min(38, ...track.notes.map((note) => note.midi));
  const maxMidi = Math.max(50, ...track.notes.map((note) => note.midi + 3));
  const spread = Math.max(8, maxMidi - minMidi);
  const x = (time) => 8 + (time / duration) * 984;
  const y = (midi) => 47 - ((midi - minMidi) / spread) * 34;
  const analysisKey = state.key || arrangement.key;
  const useFlats = analysisKey ? usesFlatSpelling(analysisKey) : false;
  const scalePitchClasses = analysisKey
    ? new Set(SCALE_STEPS[analysisKey.mode].map((step) => (analysisKey.tonic + step) % 12))
    : new Set();
  const path = track.notes
    .map((note, index) => {
      const x1 = x(note.start);
      const x2 = x(note.start + note.duration);
      const noteY = y(note.midi);
      return `${index === 0 ? "M" : "L"} ${x1.toFixed(1)} ${noteY.toFixed(1)} L ${x2.toFixed(1)} ${noteY.toFixed(1)}`;
    })
    .join(" ");
  const notes = track.notes
    .map((note, noteIndex) => {
      const x1 = x(note.start);
      const x2 = x(note.start + note.duration);
      const noteY = y(note.midi);
      const labelY = Math.max(8, Math.min(49, noteY - 4));
      const pitchClass = ((Math.round(note.midi) % 12) + 12) % 12;
      const inScale = !analysisKey || scalePitchClasses.has(pitchClass);
      const noteInfo = noteNameFromMidi(note.midi, useFlats);
      const drumLabels = { 36: "Kick", 38: "Snare", 39: "Clap", 42: "Hat", 46: "Open" };
      const label =
        track.instrument === "drums"
          ? drumLabels[Math.round(note.midi)] || "Perc"
          : `${noteInfo.name}${noteInfo.octave}`;
      const noteColor = track.instrument === "drums"
        ? track.color
        : inScale
          ? track.color
          : "#ff8055";
      const editable =
        track.instrument !== "drums" &&
        arrangement.selectedTrackId === track.id;
      return `
        <g
          class="arrange-note ${inScale ? "in-scale" : "chromatic"}${editable ? " editable" : ""}"
          data-track-id="${escapeHtml(track.id)}"
          data-note-index="${noteIndex}"
        >
          <title>${escapeHtml(label)} · ${formatTime(note.start, true)}</title>
          <rect
            class="arrange-note-hit"
            x="${(x1 - 5).toFixed(1)}"
            y="${(noteY - 7).toFixed(1)}"
            width="${Math.max(12, x2 - x1 + 10).toFixed(1)}"
            height="14"
          />
          <line x1="${x1.toFixed(1)}" y1="${noteY.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${noteY.toFixed(1)}" style="--note-color:${noteColor}" />
          <circle cx="${x1.toFixed(1)}" cy="${noteY.toFixed(1)}" r="2.15" style="--note-color:${noteColor}" />
          <text x="${((x1 + x2) / 2).toFixed(1)}" y="${labelY.toFixed(1)}" style="--note-color:${noteColor}">${escapeHtml(label)}</text>
        </g>
      `;
    })
    .join("");
  return `
    <svg class="arrange-clip-wave" viewBox="0 0 1000 54" preserveAspectRatio="none" aria-hidden="true">
      <path d="${path}" />
      ${notes}
    </svg>
  `;
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

function arrangementBarDuration() {
  return (4 * 60) / Math.max(50, arrangement.baseBpm);
}

function snapArrangementTime(time) {
  const barDuration = arrangementBarDuration();
  return Math.max(
    0,
    Math.min(
      arrangement.duration,
      Math.round(time / barDuration) * barDuration
    )
  );
}

function updateArrangementLoopUI() {
  if (!els.arrangementLoopRegion) return;
  const duration = Math.max(0.1, arrangement.duration);
  const start = Math.max(0, Math.min(duration - 0.1, arrangement.loopStart));
  const end = Math.max(start + 0.1, Math.min(duration, arrangement.loopEnd));
  const left = (start / duration) * 100;
  const width = ((end - start) / duration) * 100;
  els.arrangementLoopRegion.style.left = `${left}%`;
  els.arrangementLoopRegion.style.width = `${width}%`;
  els.arrangementLoopRegion.classList.toggle("disabled", !arrangement.loopEnabled);
  els.arrangeLoopBtn.setAttribute("aria-pressed", String(arrangement.loopEnabled));
  els.arrangeLoopBtn.classList.toggle("active", arrangement.loopEnabled);
  const barDuration = arrangementBarDuration();
  const startBar = Math.floor(start / barDuration + 0.001) + 1;
  const endBar = Math.max(
    startBar,
    Math.ceil(end / barDuration - 0.001)
  );
  els.arrangementLoopLabel.textContent = `${startBar}–${endBar} 小节 · ${formatTime(end - start)}`;
  els.arrangementHint.textContent = arrangement.loopEnabled
    ? `循环 ${startBar}–${endBar} 小节 · 拖动时间尺可重新框选`
    : "拖动时间尺选择循环乐段 · 音符标签显示调内音高";
}

function setArrangementLoop(startTime, endTime, enable = true) {
  const barDuration = arrangementBarDuration();
  const start = Math.max(0, Math.min(arrangement.duration - barDuration, snapArrangementTime(startTime)));
  const minimumEnd = Math.min(arrangement.duration, start + barDuration);
  const end = Math.max(minimumEnd, Math.min(arrangement.duration, snapArrangementTime(endTime)));
  arrangement.loopStart = start;
  arrangement.loopEnd = end;
  arrangement.loopEnabled = enable;
  persistArrangement();
  updateArrangementLoopUI();
  if (arrangement.isPlaying) {
    stopArrangementPlayback(false);
    playArrangement();
  }
}

function toggleArrangementLoop() {
  if (!arrangement.loopEnabled) {
    const barDuration = arrangementBarDuration();
    const start = Math.min(
      arrangement.duration - barDuration,
      snapArrangementTime(arrangement.playhead || 0)
    );
    arrangement.loopStart = Math.max(0, start);
    arrangement.loopEnd = Math.min(
      arrangement.duration,
      Math.max(arrangement.loopStart + barDuration, arrangement.loopStart + barDuration * 4)
    );
  }
  arrangement.loopEnabled = !arrangement.loopEnabled;
  persistArrangement();
  updateArrangementLoopUI();
  if (arrangement.isPlaying) {
    stopArrangementPlayback(false);
    playArrangement();
  }
  showToast(arrangement.loopEnabled ? "循环乐段已开启" : "循环乐段已关闭");
}

function renderArrangement() {
  if (!els.arrangementTrackHeaders) return;
  const duration = calculateArrangementDuration();
  const totalNotes = arrangement.tracks.reduce((sum, track) => sum + track.notes.length, 0);
  els.arrangementTrackCount.textContent = String(arrangement.tracks.length);
  els.arrangementNoteCount.textContent = String(totalNotes);
  const tempoScale = arrangement.baseBpm / arrangement.bpm;
  els.arrangementLength.textContent = formatTime(duration * tempoScale);
  els.arrangementTempoInput.value = String(arrangement.bpm);
  els.arrangementEmpty.hidden = arrangement.tracks.length > 0;
  const analysisKey = state.key || arrangement.key;
  els.arrangementKey.textContent = analysisKey
    ? `${NOTE_NAMES[analysisKey.tonic]}${analysisKey.mode === "major" ? "" : "m"}`
    : "—";

  const barDuration = arrangementBarDuration();
  const barCount = Math.max(1, Math.ceil(duration / barDuration));
  els.arrangementRuler.innerHTML = Array.from({ length: barCount + 1 }, (_, index) => {
    const time = Math.min(duration, index * barDuration);
    return `<span style="left:${(time / duration) * 100}%"><b>${index + 1}</b><small>${formatTime(time)}</small></span>`;
  }).join("");

  els.arrangementTrackHeaders.innerHTML = arrangement.tracks
    .map(
      (track, index) => `
        <div class="arrange-track-header${arrangement.selectedTrackId === track.id ? " selected" : ""}" data-track-id="${escapeHtml(track.id)}" style="--track-color:${track.color}">
          <span class="arrange-track-number">${String(index + 1).padStart(2, "0")}</span>
          <span class="arrange-track-icon">${getInstrumentDefinition(track.instrument).icon}</span>
          <span class="arrange-track-copy">
            <strong>${escapeHtml(track.name)}</strong>
            <small>${escapeHtml(track.instrumentName || getInstrumentDefinition(track.instrument).name)}</small>
          </span>
          <div class="arrange-track-buttons">
            <button type="button" data-track-mute="${escapeHtml(track.id)}" class="${track.muted ? "active" : ""}" aria-label="静音 ${escapeHtml(track.name)}">M</button>
            <button type="button" data-track-solo="${escapeHtml(track.id)}" class="${track.solo ? "active" : ""}" aria-label="独奏 ${escapeHtml(track.name)}">S</button>
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
          <div class="arrange-clip ${track.notes.length ? "" : "empty"}${track.muted ? " muted" : ""}">
            <div class="arrange-clip-heading">
              <span>${escapeHtml(track.name)}</span>
              <small>${track.notes.length ? `${track.notes.length} NOTES` : "EMPTY"}</small>
            </div>
            ${trackWaveSvg(track, duration)}
            ${
              track.notes.length
                ? ""
                : `<button class="arrange-fill-track" type="button" data-fill-track="${escapeHtml(track.id)}">填入当前旋律</button>`
            }
          </div>
        </div>
      `
    )
    .join("");
  updateArrangementLoopUI();
  updateArrangementPlayhead(arrangement.playhead);
}

function getSelectedArrangementTrack() {
  return arrangement.tracks.find((track) => track.id === arrangement.selectedTrackId) || null;
}

function renderTrackPitchEditor() {
  const track = getSelectedArrangementTrack();
  if (!track || track.instrument === "drums" || !track.notes.length) {
    els.trackPitchEditor.hidden = true;
    return;
  }
  els.trackPitchEditor.hidden = false;
  arrangement.selectedNoteIndex = Math.max(
    0,
    Math.min(track.notes.length - 1, arrangement.selectedNoteIndex)
  );
  const note = track.notes[arrangement.selectedNoteIndex];
  const useFlats = state.key ? usesFlatSpelling(state.key) : false;
  const noteInfo = noteNameFromMidi(note.midi, useFlats);
  const instrumentName = track.instrumentName || getInstrumentDefinition(track.instrument).name;
  els.trackPitchTrackName.textContent =
    track.name === instrumentName ? track.name : `${track.name} · ${instrumentName}`;
  els.trackSelectedNote.textContent = `${noteInfo.name}${noteInfo.octave}`;
  els.trackSelectedPosition.textContent = `第 ${arrangement.selectedNoteIndex + 1} 个音符 · ${formatTime(note.start, true)}`;
  els.trackScaleSnapBtn.classList.toggle("active", arrangement.snapPitchToScale);
  els.trackScaleSnapBtn.setAttribute("aria-pressed", String(arrangement.snapPitchToScale));
  els.trackPitchRange.min = "24";
  els.trackPitchRange.max = "96";
  els.trackPitchRange.value = String(note.midi);
  updateRangeFill(els.trackPitchRange);

  const startMidi = Math.floor(note.midi / 12) * 12 - 12;
  const endMidi = Math.min(96, startMidi + 24);
  const midiNotes = Array.from(
    { length: endMidi - startMidi + 1 },
    (_, index) => startMidi + index
  ).filter((midi) => midi >= 24);
  const whitePitchClasses = new Set([0, 2, 4, 5, 7, 9, 11]);
  const whiteNotes = midiNotes.filter((midi) => whitePitchClasses.has(midi % 12));
  els.trackPiano.innerHTML =
    whiteNotes
      .map((midi) => {
        const info = noteNameFromMidi(midi, useFlats);
        return `<button type="button" class="track-piano-key white${Math.round(note.midi) === midi ? " active" : ""}" data-piano-midi="${midi}"><span>${info.name}${info.octave}</span></button>`;
      })
      .join("") +
    midiNotes
      .filter((midi) => !whitePitchClasses.has(midi % 12))
      .map((midi) => {
        const whiteBefore = whiteNotes.filter((whiteMidi) => whiteMidi < midi).length;
        const left = (whiteBefore / Math.max(1, whiteNotes.length)) * 100;
        const info = noteNameFromMidi(midi, useFlats);
        return `<button type="button" class="track-piano-key black${Math.round(note.midi) === midi ? " active" : ""}" data-piano-midi="${midi}" style="left:${left}%"><span>${info.name}</span></button>`;
      })
      .join("");
  els.trackPiano.querySelectorAll("[data-piano-midi]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      setSelectedNotePitch(Number(button.dataset.pianoMidi), true);
    });
  });
}

function openTrackPitchEditor(trackId) {
  const track = arrangement.tracks.find((item) => item.id === trackId);
  if (!track) return;
  if (track.instrument === "drums") {
    showToast("鼓组不使用音高键盘，可编辑旋律、贝斯和 Pad 轨道");
    return;
  }
  if (!track.notes.length) {
    showToast("这条轨道还没有音符");
    return;
  }
  arrangement.selectedTrackId = trackId;
  arrangement.selectedNoteIndex = 0;
  renderArrangement();
  renderTrackPitchEditor();
  els.trackPitchEditor.scrollIntoView({ behavior: "smooth", block: "nearest" });
  showToast("键盘模式已开启，可上下拖动轨道音符");
}

function previewEditedTrackNote(track, midi) {
  if (performance.now() - previewEditedTrackNote.lastAt < 80) return;
  previewEditedTrackNote.lastAt = performance.now();
  const context = getAudioContext();
  scheduleArrangementTrackNote(
    track,
    { midi, start: 0, duration: 0.24 },
    context.currentTime + 0.01
  );
}

function setSelectedNotePitch(midi, preview = false) {
  const track = getSelectedArrangementTrack();
  if (!track) return;
  const note = track.notes[arrangement.selectedNoteIndex];
  if (!note) return;
  let nextMidi = Math.round(midi);
  if (arrangement.snapPitchToScale && state.key) {
    nextMidi = nearestScaleMidi(nextMidi, state.key, 6);
  }
  note.midi = Math.max(24, Math.min(96, nextMidi));
  persistArrangement();
  renderArrangement();
  renderTrackPitchEditor();
  if (preview) previewEditedTrackNote(track, note.midi);
}

function transposeSelectedTrack(semitones) {
  const track = getSelectedArrangementTrack();
  if (!track || track.instrument === "drums") return;
  track.notes = track.notes.map((note) => ({
    ...note,
    midi: Math.max(24, Math.min(96, note.midi + semitones)),
  }));
  persistArrangement();
  renderArrangement();
  renderTrackPitchEditor();
  const note = track.notes[arrangement.selectedNoteIndex];
  if (note) previewEditedTrackNote(track, note.midi);
}

function openTrackDialog() {
  const instruments = [...getAllInstrumentDefinitions(), DRUM_INSTRUMENT];
  els.trackInstrumentChoices.innerHTML = instruments
    .map(
      (instrument) => `
        <button type="button" data-track-instrument="${escapeHtml(instrument.id)}" style="--choice-color:${instrument.color}">
          <span>${instrument.icon}</span>
          <strong>${escapeHtml(instrument.name)}</strong>
          <small>${instrument.custom ? "我的音色" : instrument.en}</small>
        </button>
      `
    )
    .join("");
  els.trackDialog.showModal();
}

function addArrangementTrack(instrumentId) {
  const definition = getInstrumentDefinition(instrumentId);
  const number = arrangement.tracks.length + 1;
  const track = createArrangementTrack(
    instrumentId,
    `${definition.name} ${String(number).padStart(2, "0")}`,
    instrumentId === "drums" ? [] : state.notes
  );
  arrangement.tracks.push(track);
  calculateArrangementDuration();
  persistArrangement();
  renderArrangement();
  els.trackDialog.close();
  showToast(state.notes.length ? "已添加音轨并复制当前旋律" : "已添加空白音轨");
}

function fillArrangementTrack(trackId) {
  const track = arrangement.tracks.find((item) => item.id === trackId);
  if (!track) return;
  if (track.instrument === "drums") {
    showToast("鼓组轨不能直接填入旋律音高");
    return;
  }
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
}

function stopArrangementPlayback(resetPlayhead = true) {
  arrangement.isPlaying = false;
  cancelAnimationFrame(arrangement.raf);
  window.clearTimeout(arrangement.endTimer);
  arrangement.nodes.forEach((node) => {
    try {
      node.stop?.();
    } catch {
      // Notes may have ended already.
    }
  });
  arrangement.nodes = [];
  els.arrangePlayBtn.classList.remove("is-playing");
  els.arrangePlayBtn.setAttribute("aria-label", "播放编曲");
  els.arrangeStatus.textContent = resetPlayhead ? "等待播放" : "已暂停";
  if (resetPlayhead) updateArrangementPlayhead(0);
}

function scheduleDrumHit(midi, when, volume = 0.8) {
  const context = getAudioContext();
  const nodes = [];
  const destination = context.destination;
  const output = context.createGain();
  output.gain.value = Math.max(0, Math.min(1, volume));
  output.connect(destination);
  nodes.push(output);

  if (midi <= 36) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(145, when);
    oscillator.frequency.exponentialRampToValueAtTime(43, when + 0.18);
    gain.gain.setValueAtTime(0.62, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.3);
    oscillator.connect(gain);
    gain.connect(output);
    oscillator.start(when);
    oscillator.stop(when + 0.32);
    nodes.push(oscillator, gain);
    return nodes;
  }

  if (!drumNoiseBuffer || drumNoiseBuffer.sampleRate !== context.sampleRate) {
    drumNoiseBuffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.24), context.sampleRate);
    const data = drumNoiseBuffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }
  }
  const source = context.createBufferSource();
  source.buffer = drumNoiseBuffer;
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  if (midi === 38 || midi === 39) {
    filter.type = "bandpass";
    filter.frequency.value = midi === 39 ? 1350 : 1850;
    filter.Q.value = 0.7;
    gain.gain.setValueAtTime(0.3, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.13);
    source.start(when);
    source.stop(when + 0.15);
  } else {
    filter.type = "highpass";
    filter.frequency.value = 6800;
    const open = midi >= 46;
    gain.gain.setValueAtTime(open ? 0.13 : 0.08, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + (open ? 0.18 : 0.045));
    source.start(when);
    source.stop(when + (open ? 0.2 : 0.06));
  }
  source.connect(filter);
  filter.connect(gain);
  gain.connect(output);
  nodes.push(source, filter, gain);
  return nodes;
}

function scheduleArrangementTrackNote(track, note, when) {
  const volume = Math.max(0, Math.min(1, track.volume / 100));
  if (track.instrument === "drums") {
    const nodes = scheduleDrumHit(note.midi, when, volume);
    state.playNodes.push(...nodes);
    arrangement.nodes.push(...nodes);
    return;
  }
  const definition = getInstrumentDefinition(track.instrument);
  if (track.instrumentPatch || definition.custom) {
    const baseInstrument = track.instrumentBase || definition.baseInstrument || "piano";
    const params = {
      ...LAB_DEFAULTS[baseInstrument],
      ...(track.instrumentPatch || definition.params || {}),
    };
    const context = getAudioContext();
    const sources = schedulePatchVoice(
      baseInstrument,
      note.midi,
      when,
      note.duration,
      params,
      context.destination,
      volume
    );
    state.playNodes.push(...sources);
    arrangement.nodes.push(...sources);
    return;
  }
  const startIndex = state.playNodes.length;
  scheduleInstrumentNote(track.instrument, note.midi, when, note.duration, volume);
  const added = state.playNodes.slice(startIndex);
  arrangement.nodes.push(...added);
}

function playArrangement() {
  if (arrangement.isPlaying) {
    stopArrangementPlayback();
    return;
  }
  const hasSolo = arrangement.tracks.some((track) => track.solo);
  const activeTracks = arrangement.tracks.filter(
    (track) => !track.muted && (!hasSolo || track.solo) && track.notes.length
  );
  if (!activeTracks.length) {
    showToast("编曲台还没有可播放的音符");
    return;
  }
  stopMelodyPlayback();
  stopLabPlayback();
  state.playNodes = [];
  arrangement.nodes = [];
  const context = getAudioContext();
  const startAt = context.currentTime + 0.08;
  const speedScale = arrangement.baseBpm / arrangement.bpm;
  const playStart = arrangement.loopEnabled
    ? Math.max(0, Math.min(arrangement.duration, arrangement.loopStart))
    : 0;
  const playEnd = arrangement.loopEnabled
    ? Math.max(playStart + 0.1, Math.min(arrangement.duration, arrangement.loopEnd))
    : arrangement.duration;
  activeTracks.forEach((track) => {
    track.notes.forEach((note) => {
      const noteStart = Math.max(note.start, playStart);
      const noteEnd = Math.min(note.start + note.duration, playEnd);
      if (noteEnd <= noteStart) return;
      scheduleArrangementTrackNote(
        track,
        {
          ...note,
          start: (noteStart - playStart) * speedScale,
          duration: (noteEnd - noteStart) * speedScale,
        },
        startAt + (noteStart - playStart) * speedScale
      );
    });
  });
  arrangement.isPlaying = true;
  arrangement.startTime = performance.now();
  arrangement.playhead = playStart;
  els.arrangePlayBtn.classList.add("is-playing");
  els.arrangePlayBtn.setAttribute("aria-label", "暂停编曲");
  const loopLength = Math.max(0.1, playEnd - playStart);
  els.arrangeStatus.textContent = arrangement.loopEnabled
    ? `循环播放 · ${activeTracks.length} 条音轨`
    : `${activeTracks.length} 条音轨正在播放`;
  updateArrangementPlayhead(playStart);

  const tick = () => {
    if (!arrangement.isPlaying) return;
    const elapsed = (performance.now() - arrangement.startTime) / 1000 / speedScale;
    const logicalTime = playStart + (arrangement.loopEnabled ? elapsed % loopLength : elapsed);
    updateArrangementPlayhead(logicalTime);
    if (arrangement.loopEnabled || elapsed < playEnd - playStart) {
      arrangement.raf = requestAnimationFrame(tick);
    } else {
      stopArrangementPlayback();
    }
  };
  arrangement.raf = requestAnimationFrame(tick);
  arrangement.endTimer = window.setTimeout(() => {
    if (arrangement.loopEnabled && arrangement.isPlaying) {
      stopArrangementPlayback(false);
      playArrangement();
    } else {
      stopArrangementPlayback();
    }
  }, loopLength * speedScale * 1000 + 40);
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
  const notes = enabled ? snapNotesToScale(extractedNotes, state.key) : extractedNotes;
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
  els.grooveDemoBtn.addEventListener("click", createGrooveStudyData);
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
    if (action === "open") openSavedProject(projectId);
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
  els.addTrackBtn.addEventListener("click", openTrackDialog);
  els.arrangementEmptyAddBtn.addEventListener("click", openTrackDialog);
  els.trackDialogCloseBtn.addEventListener("click", () => els.trackDialog.close());
  els.trackDialog.addEventListener("click", (event) => {
    if (event.target === els.trackDialog) els.trackDialog.close();
  });
  els.trackInstrumentChoices.addEventListener("click", (event) => {
    const button = event.target.closest("[data-track-instrument]");
    if (button) addArrangementTrack(button.dataset.trackInstrument);
  });
  els.arrangePlayBtn.addEventListener("click", playArrangement);
  els.arrangeAutoFillBtn.addEventListener("click", autoArrangeTracks);
  els.arrangeLoopBtn.addEventListener("click", toggleArrangementLoop);
  els.arrangeBackStudioBtn.addEventListener("click", () => switchView("studio"));
  let loopDrag = null;
  const loopTimeFromPointer = (event) => {
    const rect = els.arrangementRuler.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    return ratio * arrangement.duration;
  };
  els.arrangementRuler.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    const anchor = snapArrangementTime(loopTimeFromPointer(event));
    loopDrag = { anchor, moved: false };
    arrangement.loopStart = anchor;
    arrangement.loopEnd = Math.min(
      arrangement.duration,
      anchor + arrangementBarDuration()
    );
    els.arrangementRuler.setPointerCapture?.(event.pointerId);
    updateArrangementLoopUI();
  });
  els.arrangementRuler.addEventListener("pointermove", (event) => {
    if (!loopDrag) return;
    const current = snapArrangementTime(loopTimeFromPointer(event));
    if (current !== loopDrag.anchor) loopDrag.moved = true;
    arrangement.loopStart = Math.min(loopDrag.anchor, current);
    arrangement.loopEnd = Math.max(
      arrangement.loopStart + arrangementBarDuration(),
      Math.max(loopDrag.anchor, current)
    );
    arrangement.loopEnd = Math.min(arrangement.duration, arrangement.loopEnd);
    arrangement.loopEnabled = true;
    updateArrangementLoopUI();
  });
  const finishLoopDrag = (event) => {
    if (!loopDrag) return;
    const barDuration = arrangementBarDuration();
    if (!loopDrag.moved) {
      arrangement.loopStart = Math.min(
        arrangement.duration - barDuration,
        loopDrag.anchor
      );
      arrangement.loopEnd = Math.min(
        arrangement.duration,
        arrangement.loopStart + barDuration * 4
      );
    }
    loopDrag = null;
    setArrangementLoop(arrangement.loopStart, arrangement.loopEnd, true);
    els.arrangementRuler.releasePointerCapture?.(event.pointerId);
  };
  els.arrangementRuler.addEventListener("pointerup", finishLoopDrag);
  els.arrangementRuler.addEventListener("pointercancel", finishLoopDrag);
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
    els.arrangementLength.textContent = formatTime(
      calculateArrangementDuration() * tempoScale
    );
    persistArrangement();
    if (state.metronome) startMetronome();
    if (syncStudio && wasPlaying) window.setTimeout(playArrangement, 30);
  };
  els.arrangementTempoInput.addEventListener("input", () => applyArrangementTempo(false));
  els.arrangementTempoInput.addEventListener("change", () => applyArrangementTempo(true));
  els.arrangementTrackHeaders.addEventListener("click", (event) => {
    const mute = event.target.closest("[data-track-mute]");
    const solo = event.target.closest("[data-track-solo]");
    const remove = event.target.closest("[data-track-delete]");
    const wasPlaying = arrangement.isPlaying;
    if (mute) {
      const track = arrangement.tracks.find((item) => item.id === mute.dataset.trackMute);
      if (track) track.muted = !track.muted;
    }
    if (solo) {
      const track = arrangement.tracks.find((item) => item.id === solo.dataset.trackSolo);
      if (track) track.solo = !track.solo;
    }
    if (remove) {
      stopArrangementPlayback();
      arrangement.tracks = arrangement.tracks.filter(
        (item) => item.id !== remove.dataset.trackDelete
      );
      if (arrangement.selectedTrackId === remove.dataset.trackDelete) {
        arrangement.selectedTrackId = null;
        els.trackPitchEditor.hidden = true;
      }
    }
    if (mute || solo || remove) {
      if (wasPlaying && !remove) stopArrangementPlayback(false);
      persistArrangement();
      renderArrangement();
      if (wasPlaying && !remove) window.setTimeout(playArrangement, 30);
    }
  });
  els.arrangementTrackHeaders.addEventListener("click", (event) => {
    if (event.target.closest("button, input")) return;
    const header = event.target.closest(".arrange-track-header");
    if (header) openTrackPitchEditor(header.dataset.trackId);
  });
  els.arrangementTrackHeaders.addEventListener("input", (event) => {
    const input = event.target.closest("[data-track-volume]");
    if (!input) return;
    const track = arrangement.tracks.find((item) => item.id === input.dataset.trackVolume);
    if (track) {
      track.volume = Number(input.value);
      persistArrangement();
    }
  });
  els.arrangementLanes.addEventListener("click", (event) => {
    const fill = event.target.closest("[data-fill-track]");
    if (fill) fillArrangementTrack(fill.dataset.fillTrack);
  });
  let pitchDrag = null;
  els.arrangementLanes.addEventListener("pointerdown", (event) => {
    const noteElement = event.target.closest(".arrange-note");
    if (!noteElement) return;
    const track = arrangement.tracks.find(
      (item) => item.id === noteElement.dataset.trackId
    );
    if (!track || track.instrument === "drums") return;
    const noteIndex = Number(noteElement.dataset.noteIndex);
    if (arrangement.selectedTrackId !== track.id) {
      arrangement.selectedTrackId = track.id;
      arrangement.selectedNoteIndex = noteIndex;
      renderArrangement();
      renderTrackPitchEditor();
      showToast("已选中音符；再次上下拖动即可改变音高");
      return;
    }
    event.preventDefault();
    arrangement.selectedNoteIndex = noteIndex;
    const note = track.notes[noteIndex];
    pitchDrag = {
      pointerId: event.pointerId,
      startY: event.clientY,
      originalMidi: note.midi,
      track,
      note,
      element: noteElement,
    };
    noteElement.classList.add("dragging");
    els.arrangementLanes.setPointerCapture?.(event.pointerId);
    renderTrackPitchEditor();
  });
  els.arrangementLanes.addEventListener("pointermove", (event) => {
    if (!pitchDrag) return;
    const semitoneDelta = Math.round((pitchDrag.startY - event.clientY) / 7);
    let midi = pitchDrag.originalMidi + semitoneDelta;
    if (arrangement.snapPitchToScale && state.key) {
      midi = nearestScaleMidi(midi, state.key, 6);
    }
    midi = Math.max(24, Math.min(96, midi));
    pitchDrag.note.midi = midi;
    const label = noteNameFromMidi(midi, state.key ? usesFlatSpelling(state.key) : false);
    const text = pitchDrag.element.querySelector("text");
    if (text) text.textContent = `${label.name}${label.octave}`;
    pitchDrag.element.style.transform = `translateY(${(pitchDrag.originalMidi - midi) * 5}px)`;
    els.trackSelectedNote.textContent = `${label.name}${label.octave}`;
    previewEditedTrackNote(pitchDrag.track, midi);
  });
  const finishPitchDrag = (event) => {
    if (!pitchDrag) return;
    const finished = pitchDrag;
    pitchDrag = null;
    finished.element.classList.remove("dragging");
    els.arrangementLanes.releasePointerCapture?.(event.pointerId);
    persistArrangement();
    renderArrangement();
    renderTrackPitchEditor();
    previewEditedTrackNote(finished.track, finished.note.midi);
  };
  els.arrangementLanes.addEventListener("pointerup", finishPitchDrag);
  els.arrangementLanes.addEventListener("pointercancel", finishPitchDrag);
  els.trackPitchCloseBtn.addEventListener("click", () => {
    arrangement.selectedTrackId = null;
    els.trackPitchEditor.hidden = true;
    renderArrangement();
  });
  els.trackScaleSnapBtn.addEventListener("click", () => {
    arrangement.snapPitchToScale = !arrangement.snapPitchToScale;
    els.trackScaleSnapBtn.classList.toggle("active", arrangement.snapPitchToScale);
    els.trackScaleSnapBtn.setAttribute("aria-pressed", String(arrangement.snapPitchToScale));
    if (arrangement.snapPitchToScale) {
      const note = getSelectedArrangementTrack()?.notes[arrangement.selectedNoteIndex];
      if (note && state.key) setSelectedNotePitch(note.midi, true);
    }
  });
  els.trackPitchRange.addEventListener("input", () => {
    setSelectedNotePitch(Number(els.trackPitchRange.value), true);
  });
  document.querySelectorAll("[data-track-transpose]").forEach((button) => {
    button.addEventListener("click", () => {
      transposeSelectedTrack(Number(button.dataset.trackTranspose));
    });
  });

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => switchView(item.dataset.view));
  });
  document.querySelector(".brand").addEventListener("click", (event) => {
    event.preventDefault();
    switchView("studio");
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
    if (isTyping) return;

    if (state.currentView === "lab") {
      const key = event.key.toLowerCase();
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
    if (event.key.toLowerCase() === "r") {
      startRecording();
    }
  });
  document.addEventListener("keyup", (event) => {
    if (state.currentView !== "lab") return;
    const midi = LAB_KEY_MAP[event.key.toLowerCase()];
    if (midi !== undefined) {
      els.labKeyboard.querySelector(`[data-midi="${midi}"]`)?.classList.remove("active");
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
    stopMicrophone();
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
    customPatches = [];
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
