// Track-owned convolution sends. The impulse responses are synthesized locally.
const arrangementEffectBuses = new Map();
const arrangementImpulseCache = new WeakMap();
function arrangementImpulse(context,seconds) {
 let cache=arrangementImpulseCache.get(context);if(!cache){cache=new Map();arrangementImpulseCache.set(context,cache);}
 const duration=Math.round(Math.max(.1,Math.min(4,seconds))*20)/20;
 if(cache.has(duration))return cache.get(duration);
 const length=Math.ceil(context.sampleRate*duration),buffer=context.createBuffer(2,length,context.sampleRate);
 for(let channel=0;channel<2;channel++) {const data=buffer.getChannelData(channel);let seed=3413+channel*997;for(let i=0;i<length;i++){seed=(1664525*seed+1013904223)>>>0;const t=i/context.sampleRate;data[i]=(seed/2147483648-1)*Math.exp(-6*t/duration)*(1-Math.exp(-t*180));}}
 if(cache.size>=8)cache.delete(cache.keys().next().value);cache.set(duration,buffer);return buffer;
}
function updateArrangementReverbBus(bus,track){
 const base=track.instrumentBase||getInstrumentDefinition(track.instrument).baseInstrument||track.instrument;
 const drumFx=isDrumInstrument(base)&&bus.midi!==null?track.drumEffects?.[String(drumMidi(bus.midi))]:null,effect={...(track.effects||{}),...(drumFx||{})},c=bus.context;
 const wet=track.channelFx?.bypass?0:Math.max(0,Math.min(.8,Number(effect.reverbWet)||0)),seconds=Math.max(.1,Math.min(4,Number(effect.reverbSeconds)||1.2)),pre=Math.max(0,Math.min(.1,Number(effect.preDelay)||0));
 smoothChannelParam(bus.dry.gain,1-wet*.3,c);smoothChannelParam(bus.wet.gain,wet*.75,c);smoothChannelParam(bus.delay.delayTime,pre,c);
 if(bus.seconds!==seconds){bus.convolver.buffer=arrangementImpulse(c,seconds);bus.seconds=seconds;}
}
function updateTrackEffectsLive(track){updateArrangementChannel(track);for(const bus of arrangementEffectBuses.values())if(bus.trackId===track.id)updateArrangementReverbBus(bus,track);}
function getArrangementDestination(track,midi,context=getAudioContext()) {
 const base=track.instrumentBase||getInstrumentDefinition(track.instrument).baseInstrument||track.instrument,drumFx=isDrumInstrument(base)&&midi!==null?track.drumEffects?.[String(drumMidi(midi))]:null;
 const key=track.id+':'+(drumFx?String(drumMidi(midi)):'main'),cached=arrangementEffectBuses.get(key);
 if(cached?.context===context){updateArrangementReverbBus(cached,track);return cached.input;}
 const destination=getArrangementChannelDestination(track,context),input=context.createGain(),dry=context.createGain(),wet=context.createGain(),delay=context.createDelay(.15),convolver=context.createConvolver(),filter=context.createBiquadFilter();
 input.gain.value=1;wet.gain.value=0;filter.type='lowpass';filter.frequency.value=5200;convolver.normalize=true;
 input.connect(dry);dry.connect(destination);input.connect(delay);delay.connect(convolver);convolver.connect(filter);filter.connect(wet);wet.connect(destination);
 const bus={trackId:track.id,midi:drumFx?midi:null,input,context,dry,wet,delay,convolver,nodes:[input,dry,wet,delay,convolver,filter]};arrangementEffectBuses.set(key,bus);updateArrangementReverbBus(bus,track);return input;
}
function disposeArrangementEffects() {
 for(const bus of arrangementEffectBuses.values())for(const node of bus.nodes){try{node.disconnect();}catch{}}
 arrangementEffectBuses.clear();disposeArrangementChannels();
}
