let labRecording = null;

function stopLabRecording() {
  if (labRecording?.recorder.state === "recording") labRecording.recorder.stop();
}

function setupLabRecording() {
  const button = document.getElementById("labRecordButton");
  const save = document.getElementById("labSaveRecording");
  const download = document.getElementById("labDownloadRecording");
  const player = document.getElementById("labRecordingPlayer");
  const status = document.getElementById("labRecordingStatus");
  let finished = null;
  let previewURL = null;
  let saving = false;

  button.addEventListener("click", async () => {
    if (labRecording) {
      stopLabRecording();
      return;
    }
    button.disabled = true;
    let destination;
    let input;
    try {
      if (typeof MediaRecorder === "undefined") throw new Error("此浏览器不支持录制实验室音频");
      player.pause();
      const context = ensureLabEngine();
      if (context.state !== "running" && !(await resumePlaybackAudio(context))) return;
      if (state.currentView !== "lab") return;
      input = labOutput;
      destination = context.createMediaStreamDestination();
      const mimeType = ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus"]
        .find(type => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(destination.stream, mimeType ? {mimeType} : undefined);
      const chunks = [];
      const start = context.currentTime;
      const instrument = getInstrumentDefinition(labState.instrument);
      const params = {...labState.params};
      const owner = accountStorageKey("lab-recording");
      let timer;
      let failure = null;

      recorder.addEventListener("dataavailable", event => {
        if (event.data.size) chunks.push(event.data);
      });
      recorder.addEventListener("error", event => { failure = event.error || new Error("录音中断"); });
      recorder.addEventListener("stop", () => {
        clearTimeout(timer);
        input.disconnect(destination);
        destination.stream.getTracks().forEach(track => track.stop());
        labRecording = null;
        button.textContent = "开始录音";
        button.setAttribute("aria-pressed", "false");

        const blob = new Blob(chunks, {type: recorder.mimeType || chunks[0]?.type});
        if (failure || !blob.size) {
          status.textContent = failure?.message || "没有录到音频，可以重新录制";
          return;
        }
        if (previewURL) URL.revokeObjectURL(previewURL);
        previewURL = URL.createObjectURL(blob);
        finished = {blob, duration: Math.max(.01, context.currentTime - start), instrument, params, owner};
        player.src = previewURL;
        player.hidden = false;
        download.href = previewURL;
        download.download = "Melohum-即兴录音." + (blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm");
        download.hidden = save.hidden = false;
        status.textContent = "录音已完成，可试听、下载或保存到编曲素材库";
      });

      input.connect(destination);
      recorder.start(1000);
      labRecording = {recorder};
      timer = setTimeout(stopLabRecording, 10 * 60 * 1000);
      button.textContent = "停止录音";
      button.setAttribute("aria-pressed", "true");
      status.textContent = "正在录制键盘和琶音，单次最多 10 分钟";
    } catch (error) {
      if (destination) {
        try { input.disconnect(destination); } catch {}
        destination.stream.getTracks().forEach(track => track.stop());
      }
      status.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

  save.addEventListener("click", async () => {
    const take = finished;
    if (!take || saving) return;
    if (accountStorageKey("lab-recording") !== take.owner) {
      status.textContent = "账户已变更，请下载此录音，或切回开始录音时的账户";
      return;
    }
    saving = save.disabled = true;
    try {
      const {blob, instrument, params} = take;
      const context = getAudioContext(false);
      const buffer = await context.decodeAudioData(await blob.arrayBuffer()).catch(() => null);
      const id = makeId("audio");
      const audio = {id, duration: buffer?.duration || take.duration, mime: blob.type,
        size: blob.size, peaks: buffer ? audioPeaks(buffer) : [], sha256: await audioDigest(blob)};
      const material = MeldMaterialCore.validate({
        id: makeId("material"), name: ("实验室即兴 · " + new Date().toLocaleString("zh-CN")).slice(0,60),
        bpm: arrangement.bpm, instrument: instrument.id, instrumentBase: instrument.baseInstrument || instrument.id,
        instrumentName: instrument.name.slice(0,60), instrumentPatch: params, notes: [], audio,
        createdAt: Date.now(),
      });
      if (accountStorageKey("lab-recording") !== take.owner) throw new Error("账户已切换，请重新保存");
      await putMaterialRecord(material, {...audio, blob});
      await refreshMaterialLibrary();
      if (take === finished) {
        save.hidden = true;
        status.textContent = "已保存，可在编曲台的素材库中载入原声";
      }
    } catch (error) {
      if (take === finished) status.textContent = "保存失败：" + error.message;
    } finally {
      saving = save.disabled = false;
    }
  });
}
