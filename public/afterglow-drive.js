(() => {
  "use strict";

  const mix = document.getElementById("afterglowDriveMix");
  const load = document.getElementById("loadAfterglowDriveBtn");
  const restore = document.getElementById("restoreAfterglowDriveBtn");
  const status = document.getElementById("afterglowDriveStatus");
  const templateId = "afterglow-drive-dx7-v1";
  const key = { tonic: 9, mode: "minor", confidence: 1, score: 1, related: { tonic: 0, mode: "major" } };
  const parts = {
    kick: { name: "底鼓", volume: 88, color: "#efab7d" },
    snare: { name: "军鼓", volume: 79, color: "#e4a998", reverb: [.31, .45, .019] },
    hat: { name: "闭合踩镲", volume: 53, color: "#f0c785", pan: .43 },
    bass: { name: "DX7 贝斯", volume: 84, color: "#94cfab" },
    strings: { name: "DX7 弦乐铺底", volume: 66, color: "#b5c6e7", reverb: [.35, 2.6, .038] },
    keys: { name: "DX7 电钢琴琶音", volume: 56, color: "#b6ace0", pan: -.17, reverb: [.22, 2.3, .038] },
    lead: { name: "DX7 Flute 1 主旋律", volume: 82, color: "#c4b3ef", pan: .03, reverb: [.28, 2.6, .038] },
    bells: { name: "DX7 钢片琴点缀", volume: 57, color: "#8edbd2", pan: .29, reverb: [.32, 2.6, .038] }
  };
  let loading = false;
  let scorePromise;

  function getScore() {
    if (!scorePromise) {
      scorePromise = (async () => {
        const response = await fetch("examples/afterglow-drive/score-v1.json");
        if (!response.ok) throw new Error("找不到示范曲谱");
        const score = await response.json();
        if (score?.format !== "meld.afterglow-drive.notes.v1" || score.bpm !== 108 ||
            score.bars !== 20 || !(score.duration >= 48 && score.duration <= 49)) {
          throw new Error("示范曲谱格式不正确");
        }
        for (const [id, part] of Object.entries(parts)) {
          const track = score.tracks?.[id];
          const instrument = track && getInstrumentDefinition(track.instrument);
          if (!instrument || instrument.id !== track.instrument ||
              (instrument.id !== RECORDED_DRUM_ID && !instrument.dx7) ||
              !Array.isArray(track.notes) || !track.notes.length || track.notes.length > 512 ||
              track.notes.some(note => !Number.isInteger(note?.midi) || note.midi < 0 || note.midi > 127 ||
                !Number.isFinite(note.start) || note.start < 0 || !Number.isFinite(note.duration) ||
                note.duration <= 0 || note.start + note.duration > score.duration ||
                !Number.isFinite(note.velocity) || note.velocity <= 0 || note.velocity > 1)) {
            throw new Error(part.name + "曲谱不完整");
          }
        }
        return score;
      })().catch(error => { scorePromise = undefined; throw error; });
    }
    return scorePromise;
  }

  function makeTracks(score) {
    return Object.entries(parts).map(([id, part]) => {
      const entry = score.tracks[id];
      const track = createArrangementTrack(entry.instrument, part.name, entry.notes.map(note => ({
        ...note, confidence: 1, manualEdited: true
      })));
      track.color = part.color;
      track.volume = part.volume;
      if (Number.isFinite(part.pan)) track.channelFx = { pan: part.pan };
      if (id === "lead") {
        Object.assign(track.channelFx, { filterType: "lowpass", filterHz: 3200 });
      }
      if (part.reverb) {
        const [reverbWet, reverbSeconds, preDelay] = part.reverb;
        track.effects = { reverbWet, reverbSeconds, preDelay };
      }
      if (entry.instrument !== RECORDED_DRUM_ID) {
        track.noteEditKey = { ...key };
        const release = Number.isFinite(entry.release) ? Math.max(250, Math.min(3000, entry.release)) : 750;
        track.instrumentPatch = { ...LAB_DEFAULTS[entry.instrument], release };
      }
      return track;
    });
  }

  function cannotLoad() {
    return state.isRecording || performanceInput.recording || performanceInput.preparing;
  }

  function pausePreview() {
    if (!mix.paused) mix.pause();
  }

  function updateRestore(activeId, hasBackup) {
    restore.disabled = loading || activeId !== templateId || !hasBackup;
  }

  async function loadTemplate() {
    if (loading || state.currentView !== "arrangement") return;
    if (cannotLoad()) {
      status.textContent = "请先结束录音，再载入示范曲。";
      return;
    }
    if (arrangement.templateMeta?.id === templateId) {
      switchView("arrangement");
      showToast("已打开《Afterglow Drive》的当前编曲");
      return;
    }
    if (arrangement.tracks.some(MeldMaterialCore.hasContent) &&
        !window.confirm("载入《Afterglow Drive》会替换当前编曲。载入前的编曲可以一键恢复。继续载入？")) return;

    const backup = arrangementTemplateSnapshot();
    const backupKey = accountStorageKey("meld.template-backup.v1");
    const fingerprint = MeldArrangementAI.fingerprint(backup);
    loading = true;
    load.disabled = true;
    restore.disabled = true;
    status.textContent = "正在载入原始音符…";
    try {
      const score = await getScore();
      if (state.currentView !== "arrangement" || cannotLoad() ||
          accountStorageKey("meld.template-backup.v1") !== backupKey ||
          MeldArrangementAI.fingerprint(arrangementTemplateSnapshot()) !== fingerprint) {
        throw new Error("编曲、页面或账户刚有变化，请重新载入");
      }
      const tracks = makeTracks(score);
      const lead = tracks.find(track => track.instrument === "dx7-ROM1A-24");
      try {
        localStorage.setItem(backupKey, JSON.stringify(backup));
      } catch {
        throw new Error("无法保存恢复副本");
      }
      pausePreview();
      stopPerformanceTake();
      releasePerformanceKeys();
      stopArrangementPlayback();
      Object.assign(arrangement, {
        tracks,
        bpm: score.bpm,
        baseBpm: score.bpm,
        duration: score.duration,
        playhead: 0,
        sections: [[0, "前奏"], [2, "鼓组进入"], [8, "主旋律"], [16, "尾声"]]
          .map(([bar, name]) => ({ name, start: bar * 240 / score.bpm })),
        templateMeta: {
          id: templateId, title: "Afterglow Drive · DX7 Synthwave", keyName: "A 小调", key,
          duration: score.duration, bars: score.bars, trackCount: tracks.length, leadTrackId: lead?.id
        }
      });
      state.activeProjectId = null;
      performanceInput.history = [];
      performanceInput.trackId = lead?.id || tracks[0].id;
      els.tempoInput.value = String(score.bpm);
      persistArrangement();
      status.textContent = "8 条音符轨已载入，点音轨的「编辑」可打开钢琴卷帘。";
      switchView("arrangement");
      showToast("已载入《Afterglow Drive》的 8 条可编辑音符轨");
    } catch (error) {
      status.textContent = `载入失败：${error.message}`;
    } finally {
      loading = false;
      load.disabled = false;
      updateRestore(arrangement.templateMeta?.id, templateBackupAvailable());
    }
  }

  mix.addEventListener("play", () => {
    globalThis.MeldDx7Library?.stop();
    stopArrangementPlayback(false);
  });
  mix.addEventListener("error", () => { status.textContent = "成品试听未能打开，请刷新页面后再试。"; });
  load.addEventListener("click", loadTemplate);
  restore.addEventListener("click", () => {
    if (loading || cannotLoad() || arrangement.templateMeta?.id !== templateId) return;
    pausePreview();
    restoreBeforeTemplate();
    if (arrangement.templateMeta?.id !== templateId) {
      status.textContent = "已恢复载入前的编曲。";
      switchView("arrangement");
    }
  });
  globalThis.MeldAfterglowDrive = { pausePreview, updateRestore };
})();
