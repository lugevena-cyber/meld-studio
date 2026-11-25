// One stable channel per track. Every MIDI, sampled voice and original recording
// uses this path, so edits also affect voices that are already sounding.
const arrangementChannels=new Map();
function smoothChannelParam(param,value,context){if(!param)return;param.cancelScheduledValues(context.currentTime);param.setTargetAtTime(value,context.currentTime,.015);}
function updateArrangementChannel(track,immediate=false){
 const channel=arrangementChannels.get(track.id);if(!channel)return;
 const fx=MeldChannelCore.normalize(track.channelFx),c=channel.context,n=channel.nodes,set=(p,v)=>{if(immediate)p.value=v;else smoothChannelParam(p,v,c);};
 set(n.hp.frequency,fx.highpass);set(n.low.gain,fx.lowGain);set(n.mid.frequency,fx.midHz);set(n.mid.Q,fx.midQ);set(n.mid.gain,fx.midGain);set(n.high.gain,fx.highGain);
 n.filter.type=fx.filterType==='off'?'lowpass':fx.filterType;set(n.filter.frequency,Math.min(c.sampleRate*.49,fx.filterHz));set(n.filter.Q,fx.filterQ);set(n.filterDry.gain,fx.filterType==='off'?1:0);set(n.filterWet.gain,fx.filterType==='off'?0:1);
 set(n.compressor.threshold,fx.compressor?fx.threshold:0);set(n.compressor.ratio,fx.compressor?fx.ratio:1);set(n.compressor.knee,6);set(n.compressor.attack,fx.attack/1000);set(n.compressor.release,fx.release/1000);
 set(n.output.gain,Math.max(0,Math.min(1,(Number.isFinite(track.volume)?track.volume:78)/100)));set(n.pan.pan,fx.pan);set(n.trim.gain,Math.pow(10,fx.trim/20));set(n.processed.gain,fx.bypass?0:1);set(n.bypass.gain,fx.bypass?1:0);
}
function getArrangementChannelDestination(track,context=getAudioContext()){
 let channel=arrangementChannels.get(track.id);if(channel?.context===context)return channel.input;
 if(channel)for(const node of Object.values(channel.nodes))try{node.disconnect();}catch{}
 const input=context.createGain(),nodes={hp:context.createBiquadFilter(),low:context.createBiquadFilter(),mid:context.createBiquadFilter(),high:context.createBiquadFilter(),filter:context.createBiquadFilter(),filterDry:context.createGain(),filterWet:context.createGain(),compressor:context.createDynamicsCompressor(),pan:context.createStereoPanner(),trim:context.createGain(),processed:context.createGain(),bypass:context.createGain(),output:context.createGain()};
 nodes.hp.type='highpass';nodes.hp.Q.value=.707;nodes.low.type='lowshelf';nodes.low.frequency.value=120;nodes.mid.type='peaking';nodes.high.type='highshelf';nodes.high.frequency.value=6000;
 input.connect(nodes.hp);nodes.hp.connect(nodes.low);nodes.low.connect(nodes.mid);nodes.mid.connect(nodes.high);nodes.high.connect(nodes.filterDry);nodes.high.connect(nodes.filter);nodes.filter.connect(nodes.filterWet);nodes.filterDry.connect(nodes.compressor);nodes.filterWet.connect(nodes.compressor);nodes.compressor.connect(nodes.pan);nodes.pan.connect(nodes.trim);nodes.trim.connect(nodes.processed);nodes.processed.connect(nodes.output);input.connect(nodes.bypass);nodes.bypass.connect(nodes.output);nodes.output.connect(context.destination);
 channel={input,context,nodes};arrangementChannels.set(track.id,channel);updateArrangementChannel(track,true);return input;
}
function disposeArrangementChannels(){for(const channel of arrangementChannels.values())for(const node of [channel.input,...Object.values(channel.nodes)])try{node.disconnect();}catch{}arrangementChannels.clear();}
