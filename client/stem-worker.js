import separate from '@audio/neural-separate';

self.onmessage = async ({ data: { channels, sampleRate, compact } }) => {
  try {
    const weights = new URL('./stem-models/', self.location.href);
    const options = compact ? {
      model: { url: new URL('scnet/scnet-mobile.int8.onnx', weights).href, targets: ['drums', 'bass', 'other', 'vocals'] },
      modelType: 'complex',
      targetRate: 44100,
      n: 4096,
      hop: 1024,
      frames: 96,
      window: 'ones',
      segment: 95 * 1024,
    } : { model: 'scnet', weights: weights.href };
    const { stems } = await separate(channels, {
      ...options,
      sampleRate,
      device: 'wasm',
      wasmPaths: new URL('./stem-runtime/', self.location.href).href,
      step: 0.5,
      progress: ({ chunk, totalChunks }) => self.postMessage({ chunk, totalChunks }),
    });
    self.postMessage({ stems, sampleRate }, Object.values(stems).flat().map(channel => channel.buffer));
  } catch (error) {
    self.postMessage({ error: error.message || '原声分离失败' });
  }
};
