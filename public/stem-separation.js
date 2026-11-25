(() => {
  const el = id => document.getElementById(id);
  const groups = [
    ['vocals', '人声', 'piano'],
    ['drums', '鼓', 'drum80'],
    ['bass', '贝斯', 'bass'],
    ['other', '其他伴奏', 'acoustic'],
  ];
  const maxSeconds = 45;
  const maxBytes = 64 * 1024 * 1024;
  let source, result, activeJob, saving = false;
  const panel = el('stemPanel');

  function status(text) {
    el('stemStatus').textContent = text;
    el('stemStatus').hidden = !text;
  }

  function render() {
    el('stemFromStudio').hidden = !state.audioBlob;
    el('stemFromStudio').disabled = Boolean(activeJob) || saving;
    el('stemChoose').disabled = Boolean(activeJob) || saving;
    el('stemStart').disabled = !source || Boolean(activeJob) || saving;
    el('stemCancel').hidden = !activeJob;
    el('stemApply').hidden = !result;
    el('stemApply').disabled = saving || Boolean(activeJob);
  }

  function select(blob, name, buffer = null) {
    source = blob ? { blob, name, buffer } : null;
    result = null;
    status('');
    el('stemFileName').textContent = source?.name || '选择歌曲';
    render();
  }

  panel.addEventListener('toggle', render);
  el('stemChoose').addEventListener('click', () => el('stemFile').click());
  el('stemFile').addEventListener('change', event => {
    const file = event.target.files[0];
    if (file) select(file, file.name);
    event.target.value = '';
  });
  el('stemFromStudio').addEventListener('click', () => {
    if (!state.audioBlob) return;
    el('stemFile').value = '';
    select(state.audioBlob, state.sourceName || '创作台原声', state.audioBuffer);
  });
  el('stemCancel').addEventListener('click', () => {
    activeJob?.abort();
    activeJob = null;
    status('已取消分离');
    render();
  });

  el('stemStart').addEventListener('click', async () => {
    if (!source || activeJob || saving) return;
    if (source.blob.size > maxBytes) { status('文件超过 64 MiB，请先截取片段'); return; }
    const job = new AbortController();
    activeJob = job;
    result = null;
    status('正在读取音频…');
    render();
    const finish = (message) => {
      if (activeJob !== job) return;
      activeJob = null;
      status(message);
      render();
    };
    try {
      const context = getAudioContext(false);
      const isVideo = /\.(mp4|mov)$/i.test(source.name) || source.blob.type.startsWith('video/');
      const buffer = source.buffer || await decodeStudioUpload(context, source.blob, isVideo);
      if (activeJob !== job) return;
      if (buffer.duration > maxSeconds) { finish('歌曲超过 45 秒，请先截取要分离的片段'); return; }
      if (!buffer.length) { finish('文件中没有可分离的音频'); return; }
      status('正在加载分离模型…');
      const separated = await separateLocalAudio(buffer, job.signal, ({ chunk, totalChunks }) => {
        status(`正在分离第 ${chunk} / ${totalChunks} 段，请保持页面打开`);
      });
      if (activeJob !== job) return;
      if (!groups.every(([id]) => separated.stems?.[id]?.length === 2)) {
        finish('分离结果不完整');
        return;
      }
      result = separated;
      finish('分离完成 · 人声、鼓、贝斯、其他伴奏');
    } catch (error) {
      if (activeJob !== job) return;
      console.error(error);
      finish(error.name === 'TimeoutError'
        ? '分离超时 · ' + error.message
        : '分离失败，请尝试 WAV、M4A 或较短的录音');
    }
  });

  el('stemApply').addEventListener('click', async () => {
    if (!result || saving || activeJob || performanceInput.recording || performanceInput.preparing) return;
    if (arrangement.tracks.length + groups.length > 48) { status('编曲最多 48 条音轨，请先腾出空间'); return; }
    saving = true;
    render();
    status('正在保存原声音轨…');
    try {
      const tracks = [];
      const assets = [];
      for (const [key, name, instrument] of groups) {
        const channels = result.stems[key];
        const sampleRate = result.sampleRate;
        const length = channels[0].length;
        const buffer = { numberOfChannels: channels.length, sampleRate, length, getChannelData: i => channels[i] };
        const duration = length / sampleRate;
        const blob = encodeAudioWav(buffer);
        const asset = { id: makeId('audio'), blob, mime: blob.type, duration, size: blob.size, peaks: audioPeaks(buffer) };
        const track = createArrangementTrack(instrument, name);
        track.volume = 100;
        track.audioClips = [{ id: makeId('audio-clip'), audioAssetId: asset.id, name, start: 0, offset: 0, duration, peaks: asset.peaks }];
        tracks.push(track);
        assets.push(asset);
      }
      const db = await openMaterialDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction('audio', 'readwrite');
        tx.oncomplete = resolve;
        tx.onabort = () => reject(tx.error || Error('浏览器存储空间不足'));
        const store = tx.objectStore('audio');
        for (const asset of assets) store.put(asset);
      });
      if (performanceInput.recording || performanceInput.preparing || arrangement.tracks.length + tracks.length > 48) {
        throw Error('编曲正在录音或已没有足够音轨，请调整后重试');
      }
      const before = arrangementTemplateSnapshot();
      stopArrangementPlayback(false);
      stopMelodyPlayback();
      releasePerformanceKeys();
      stopSourcePlayback();
      arrangement.tracks.push(...tracks);
      performanceInput.trackId = tracks[0].id;
      const speed = arrangement.baseBpm / arrangement.bpm;
      arrangement.duration = Math.max(arrangement.duration, assets[0].duration / speed);
      persistArrangement();
      renderArrangement();
      materialLibrary.history.push({ before, after: MeldArrangementAI.fingerprint(arrangementTemplateSnapshot()) });
      result = null;
      status('已追加 4 轨。在音轨上点「独奏」可单独听其中一轨。');
    } catch (error) {
      status('追加失败 · ' + error.message);
    } finally {
      saving = false;
      render();
    }
  });
})();
