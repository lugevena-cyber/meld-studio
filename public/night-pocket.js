(() => {
  "use strict";

  const demoId = "night-pocket-v1";
  const priorEditableId = "night-pocket-notes-v1";
  const editableId = "night-pocket-notes-v2";
  const demoKey = { tonic: 4, mode: "dorian" };
  const directory = "examples/night-pocket/";
  const assetPrefix = "night-pocket-v1:";
  const parts = {
    kick: { name: "底鼓", instrument: "drum80", color: "#efab7d" },
    snare: { name: "军鼓", instrument: "drum80", color: "#e4a998" },
    hat: { name: "闭合踩镲", instrument: "drum80", color: "#f0c785" },
    bass: { name: "电贝斯", instrument: "bass", color: "#94cfab" },
    guitar: { name: "切分电吉他", instrument: "electric", color: "#b5cf85" },
    keys: { name: "钢琴和弦", instrument: "piano", color: "#b6ace0" },
    lead: { name: "钢琴主旋律", instrument: "piano", color: "#c4b3ef" }
  };
  const mix = document.getElementById("nightPocketMix");
  const load = document.getElementById("loadNightPocketBtn");
  const edit = document.getElementById("editNightPocketBtn");
  const restore = document.getElementById("restoreNightPocketBtn");
  const undoPhrase = document.getElementById("undoNightPocketPhrase");
  const status = document.getElementById("nightPocketStatus");
  if (!mix || !load || !edit || !restore || !undoPhrase || !status) return;
  if (location.hash === "#nightPocketTitle") {
    document.getElementById("arrangementDemoDrawer").open = true;
  }

  const assets = new Map();
  let manifestPromise;
  let scorePromise;
  let loading = false;
  let phraseUndo;

  function validateManifest(manifest) {
    const valid = manifest?.format === "meld.night-pocket.v1" &&
      manifest.bpm === 113 && manifest.bars === 16 &&
      Number.isFinite(manifest.duration) && manifest.duration >= 34 && manifest.duration <= 35 &&
      Array.isArray(manifest.stems) && manifest.stems.length === Object.keys(parts).length;
    if (!valid) throw new Error("示范音轨清单不完整");
    const ids = new Set();
    for (const stem of manifest.stems) {
      if (!Object.hasOwn(parts, stem?.id) || ids.has(stem.id) ||
          stem.duration !== manifest.duration || !Number.isSafeInteger(stem.size) ||
          stem.size <= 0 || stem.size > 2_000_000 || !/^[a-f0-9]{64}$/.test(stem.sha256) ||
          !Array.isArray(stem.peaks) || stem.peaks.length !== 96 ||
          stem.peaks.some(value => !Number.isFinite(value) || value < 0 || value > 1)) {
        throw new Error("示范音轨信息不一致");
      }
      ids.add(stem.id);
    }
    return manifest;
  }

  function getManifest() {
    if (!manifestPromise) {
      manifestPromise = (async () => {
        const response = await fetch(directory + "manifest.json");
        if (!response.ok) throw new Error("找不到示范音轨清单");
        return validateManifest(await response.json());
      })().catch(error => {
        manifestPromise = undefined;
        throw error;
      });
    }
    return manifestPromise;
  }

  function hasAsset(assetId) {
    return typeof assetId === "string" && assetId.startsWith(assetPrefix) &&
      Object.hasOwn(parts, assetId.slice(assetPrefix.length));
  }

  function readAsset(assetId) {
    if (!assets.has(assetId)) {
      const pending = (async () => {
        const manifest = await getManifest();
        const stem = manifest.stems.find(item => assetPrefix + item.id === assetId);
        if (!stem) throw new Error("找不到这条示范音轨");
        const response = await fetch(directory + stem.id + ".mp3");
        if (!response.ok) throw new Error(parts[stem.id].name + "未能载入");
        const blob = await response.blob();
        const digest = await audioDigest(blob);
        if (blob.size !== stem.size || (digest && digest !== stem.sha256)) {
          throw new Error(parts[stem.id].name + "文件校验失败");
        }
        return { ...stem, id: assetId, blob, mime: "audio/mpeg" };
      })().catch(error => {
        assets.delete(assetId);
        throw error;
      });
      assets.set(assetId, pending);
    }
    return assets.get(assetId);
  }

  function makeTracks(manifest) {
    return manifest.stems.map(stem => {
      const part = parts[stem.id];
      const track = createArrangementTrack(part.instrument, part.name);
      track.color = part.color;
      track.volume = 100;
      track.audioClips = [{
        id: makeId("demo-clip"),
        audioAssetId: assetPrefix + stem.id,
        name: part.name,
        start: 0,
        offset: 0,
        duration: manifest.duration,
        peaks: stem.peaks.slice()
      }];
      return track;
    });
  }

  function getEditableScore() {
    if (!scorePromise) {
      scorePromise = (async () => {
        const response = await fetch(directory + "score.json");
        if (!response.ok) throw new Error("找不到原始曲谱");
        const score = await response.json();
        if (score?.format !== "meld.night-pocket.notes.v1" || score.bpm !== 113 ||
            score.bars !== 16 || !(score.duration >= 34 && score.duration <= 35)) {
          throw new Error("示范曲谱格式不正确");
        }
        for (const id of Object.keys(parts)) {
          const notes = score.tracks?.[id];
          if (!Array.isArray(notes) || notes.length < 1 || notes.length > 512 ||
              notes.some(note => !Number.isInteger(note.midi) || note.midi < 0 || note.midi > 127 ||
                !Number.isFinite(note.start) || note.start < 0 ||
                !Number.isFinite(note.duration) || note.duration <= 0 || note.start + note.duration > score.duration ||
                !Number.isFinite(note.velocity) || note.velocity <= 0 || note.velocity > 1)) {
            throw new Error(parts[id].name + "曲谱不完整");
          }
        }
        return score;
      })().catch(error => { scorePromise = undefined; throw error; });
    }
    return scorePromise;
  }

  function makeEditableTracks(score) {
    const drumIds = ["kick", "snare", "hat"];
    const volumes = {kick:78,snare:76,hat:67,bass:86,guitar:57,keys:56,lead:74};
    const pans = {hat:.22,guitar:-.39,keys:.27};
    return Object.entries(parts).map(([id, part]) => {
      const instrument = drumIds.includes(id) ? "sample-funk-kit" : id === "guitar" ? "mutedguitar" : part.instrument;
      const track = createArrangementTrack(instrument, part.name, score.tracks[id].map(note => ({
        ...note, confidence: 1, manualEdited: true
      })));
      track.sourceDemoPart = id;
      track.color = part.color;
      track.volume = volumes[id];
      if (Object.hasOwn(pans, id)) track.channelFx = { pan: pans[id] };
      if (!drumIds.includes(id)) track.noteEditKey = { ...demoKey };
      return phraseTrack(track, id, 60 / score.bpm);
    });
  }

  function phraseTrack(track, id, beat) {
    const preset = MeldNightPocketPhrasing.patches[id];
    if (!preset || !track.notes.length) return track;
    const params = track.instrumentPatch || {};
    const sampled = isSampledInstrument(track.instrumentBase || track.instrument);
    return {
      ...track,
      sourceDemoPart: id,
      notes: MeldNightPocketPhrasing.shape(track.notes, id, beat),
      instrumentPatch: sampled ? {
        ...preset, ...params, release: Math.max(preset.release, Number(params.release) || 0), phraseTail: true
      } : track.instrumentPatch
    };
  }

  function isDemo(id) { return id === demoId || id === priorEditableId || id === editableId; }

  function cannotLoad() {
    return state.isRecording || performanceInput.recording || performanceInput.preparing;
  }

  function upgradeCurrentPhrasing() {
    const before = arrangementTemplateSnapshot();
    const beat = 60 / arrangement.baseBpm;
    const tracks = arrangement.tracks.map(track => {
      const part = track.sourceDemoPart ||
        Object.keys(parts).find(id => parts[id].name === track.name);
      return phraseTrack(track, part, beat);
    });
    if (tracks.every((track, i) => track === arrangement.tracks[i])) {
      status.textContent = "当前编曲没有可识别的示范旋律、和弦或贝斯轨。";
      return;
    }
    pausePreview();
    releasePerformanceKeys();
    stopArrangementPlayback(false);
    arrangement.tracks = tracks;
    arrangement.templateMeta = { ...arrangement.templateMeta, id: editableId };
    phraseUndo = {
      before,
      account: accountStorageKey("meld.template-backup.v1"),
      after: MeldArrangementAI.fingerprint(arrangementTemplateSnapshot())
    };
    persistArrangement();
    renderArrangement();
    status.textContent = "已接顺当前乐句。音高、起拍和试听原声均保留。";
  }

  async function loadDemo(editable, focusAsset) {
    if (loading) return;
    if (cannotLoad()) {
      status.textContent = "请先结束录音，再载入示范曲。";
      return;
    }
    if (editable && arrangement.templateMeta?.id === priorEditableId) {
      upgradeCurrentPhrasing();
      return;
    }
    const targetId = editable ? editableId : demoId;
    const switchingDemo = isDemo(arrangement.templateMeta?.id);
    if (arrangement.templateMeta?.id === targetId) {
      status.textContent = "Night Pocket 已在编曲台，可以直接播放当前版本。";
      return;
    }
    if (arrangement.tracks.some(MeldMaterialCore.hasContent) &&
        !window.confirm("载入《Night Pocket》会替换当前编曲。载入前的编曲会保留，可一键恢复。继续载入？")) {
      return;
    }
    const backup = arrangementTemplateSnapshot();
    const fingerprint = MeldArrangementAI.fingerprint(backup);
    const backupKey = accountStorageKey("meld.template-backup.v1");
    loading = true;
    load.disabled = true;
    edit.disabled = true;
    restore.disabled = true;
    status.textContent = editable ? "正在载入原始音符…" : "正在下载并校验 7 条示范音轨…";

    try {
      const manifest = editable ? await getEditableScore() : await getManifest();
      if (!editable) await Promise.all(manifest.stems.map(stem => readAsset(assetPrefix + stem.id)));
      if (state.currentView !== "arrangement" || cannotLoad() ||
          accountStorageKey("meld.template-backup.v1") !== backupKey ||
          MeldArrangementAI.fingerprint(arrangementTemplateSnapshot()) !== fingerprint) {
        throw new Error("编曲、页面或账户刚有变化，请重新载入");
      }
      const tracks = editable ? makeEditableTracks(manifest) : makeTracks(manifest);
      try {
        if (!switchingDemo || !localStorage.getItem(backupKey)) {
          localStorage.setItem(backupKey, JSON.stringify(backup));
        }
      } catch {
        throw new Error("无法保存恢复副本");
      }
      pausePreview();
      stopPerformanceTake();
      releasePerformanceKeys();
      stopArrangementPlayback();
      Object.assign(arrangement, {
        tracks,
        bpm: manifest.bpm,
        baseBpm: manifest.bpm,
        duration: manifest.duration,
        playhead: 0,
        sections: [[0, "前奏"], [2, "主段"], [6, "过渡"], [8, "副歌"], [15, "收尾"]]
          .map(([bar, name]) => ({ name, start: bar * 240 / manifest.bpm })),
        templateMeta: {
          id: targetId,
          title: editable ? "Night Pocket · 可编辑曲谱" : "Night Pocket · 成品分轨",
          keyName: "E 多利亚",
          key: { ...demoKey },
          duration: manifest.duration,
          bars: manifest.bars,
          trackCount: tracks.length
        }
      });
      state.activeProjectId = null;
      performanceInput.history = [];
      phraseUndo = undefined;
      performanceInput.trackId = tracks[0].id;
      els.tempoInput.value = String(manifest.bpm);
      persistArrangement();
      renderArrangement();
      if (hasAsset(focusAsset)) {
        const index = Object.keys(parts).indexOf(focusAsset.slice(assetPrefix.length));
        if (tracks[index]) globalThis.MeldArrangementRoll?.open(tracks[index].id);
      }
      status.textContent = editable ? "7 条音符轨已载入。点音轨名编辑音高和音阶。" :
        "7 条成品音轨已载入。点击编曲台播放键合听，或用 S 逐轨独奏。";
    } catch (error) {
      status.textContent = `载入失败：${error.message}`;
    } finally {
      loading = false;
      load.disabled = false;
      edit.disabled = false;
      updateRestore(arrangement.templateMeta?.id, hasBackup());
    }
  }

  function pausePreview() {
    if (!mix.paused) mix.pause();
  }

  function updateRestore(activeId, hasBackup) {
    restore.disabled = loading || !isDemo(activeId) || !hasBackup;
    edit.textContent = activeId === priorEditableId ? "让当前音符更连贯" : "载入可编辑音符";
    undoPhrase.hidden = !phraseUndo || activeId !== editableId;
  }

  function hasBackup() {
    try {
      return Boolean(localStorage.getItem(accountStorageKey("meld.template-backup.v1")));
    } catch {
      return false;
    }
  }

  mix.addEventListener("play", () => stopArrangementPlayback(false));
  mix.addEventListener("error", () => {
    status.textContent = "成品试听未能打开，请刷新页面后再试。";
  });
  load.addEventListener("click", () => loadDemo(false));
  edit.addEventListener("click", () => loadDemo(true));
  restore.addEventListener("click", () => {
    if (cannotLoad()) {
      status.textContent = "请先结束录音，再恢复编曲。";
      return;
    }
    restoreBeforeTemplate();
    if (!isDemo(arrangement.templateMeta?.id)) status.textContent = "已恢复载入前的编曲。";
  });
  undoPhrase.addEventListener("click", () => {
    if (!phraseUndo || cannotLoad()) return;
    if (phraseUndo.account !== accountStorageKey("meld.template-backup.v1") ||
        phraseUndo.after !== MeldArrangementAI.fingerprint(arrangementTemplateSnapshot())) {
      status.textContent = "编曲已有后续修改，未覆盖当前音轨。";
      return;
    }
    stopArrangementPlayback(false);
    arrangement.tracks = phraseUndo.before.tracks;
    arrangement.templateMeta = phraseUndo.before.templateMeta;
    phraseUndo = undefined;
    persistArrangement();
    renderArrangement();
    status.textContent = "已撤销乐句调整。";
  });
  globalThis.MeldNightPocket = { hasAsset, readAsset, pausePreview, updateRestore,
    loadEditable: assetId => loadDemo(true, assetId),
    canUpgradePhrasing: () => arrangement.templateMeta?.id === priorEditableId };
})();
