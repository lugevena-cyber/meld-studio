function runLocalAudioWorker(path, payload, transfers, signal, onProgress) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(signal.reason); return; }
    const worker = new Worker(path, { type: 'module' });
    let idleTimer;
    const finish = (error, data) => {
      clearTimeout(idleTimer);
      signal.removeEventListener('abort', cancel);
      worker.terminate();
      if (error) reject(error);
      else resolve(data);
    };
    const cancel = () => finish(signal.reason);
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        finish(new DOMException('两分钟没有收到处理进度。请检查网络后重试，或使用更短的音频。', 'TimeoutError'));
      }, 120_000);
    };
    signal.addEventListener('abort', cancel, { once: true });
    worker.onerror = () => finish(Error('当前浏览器未能启动音频处理，请用桌面浏览器重试'));
    worker.onmessage = ({ data }) => {
      if (data.error) finish(Error(data.error));
      else if (data.chunk || data.name) {
        resetIdleTimer();
        onProgress(data);
      }
      else finish(null, data);
    };
    resetIdleTimer();
    try { worker.postMessage(payload, transfers); } catch (error) { finish(error); }
  });
}

function separateLocalAudio(buffer, signal, onProgress) {
  const channels = [buffer.getChannelData(0).slice(), buffer.getChannelData(Math.min(1, buffer.numberOfChannels - 1)).slice()];
  const compact = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
    (navigator.deviceMemory > 0 && navigator.deviceMemory <= 4);
  return runLocalAudioWorker('stem-worker.js?v=2', { channels, sampleRate: buffer.sampleRate, compact },
    channels.map(channel => channel.buffer), signal, onProgress);
}
