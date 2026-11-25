importScripts('pitch-detector.js?v=yin3','pitch-analysis.js?v=vocal-body1');
const tracker=MeldPitchDetector.createTracker();
onmessage=({data})=>{
 const {id,type}=data;
 try{
  if(type==='reset'){tracker.reset();postMessage({id,result:true});return;}
  if(type==='detect'){postMessage({id,result:tracker.update(MeldPitchDetector.detect(data.input,data.rate))});return;}
  const rate=Math.min(data.rate,16000),mono=MeldPitchDetector.resample(data.input,data.rate,rate);
  postMessage({id,result:[...MeldPitchAnalysis.frames(mono,rate,data.profile)]});
 }catch(error){postMessage({id,error:error.message});}
};
