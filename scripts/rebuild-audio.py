"""Regenerate delivery MP3s and their manifest from retained lossless stems.
Pinned environment: soundfile==0.13.1, libsndfile==1.2.2.
Only run this when intentionally updating encoded assets.
"""
import hashlib,json
from pathlib import Path
import soundfile as sf
assert sf.__version__=='0.13.1' and sf.__libsndfile_version__=='1.2.2'
root=Path(__file__).resolve().parent.parent
path=root/'public/studies/hong-kong/stems/manifest.json'
manifest=json.loads(path.read_text())
for stem in manifest['stems']:
 data,rate=sf.read(root/'assets/stem-inputs'/(stem['id']+'.flac'),dtype='float32',always_2d=True)
 assert rate==stem['sampleRate'] and len(data)==stem['frames'] and data.shape[1]==stem['channels']
 target=root/'public'/stem['file']
 sf.write(target,data,rate,format='MP3',bitrate_mode='CONSTANT',compression_level=.45)
 info=sf.info(target)
 assert info.frames==stem['frames'] and info.samplerate==rate and info.channels==stem['channels']
 stem['size']=target.stat().st_size
 stem['sha256']=hashlib.sha256(target.read_bytes()).hexdigest()
path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('Regenerated six delivery files; verified frames, sample rates, and channels')
