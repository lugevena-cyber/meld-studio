"""Build ignored delivery audio from tracked lossless inputs (soundfile/libsndfile)."""
import hashlib,json
from pathlib import Path
import soundfile as sf
assert sf.__version__ == "0.13.1" and sf.__libsndfile_version__ == "1.2.2", "Use soundfile==0.13.1 with libsndfile 1.2.2"

root=Path(__file__).resolve().parent
manifest=json.loads((root/'public/studies/hong-kong/stems/manifest.json').read_text(encoding='utf-8'))
for stem in manifest['stems']:
 target=root/'public'/stem['file']
 if target.is_file() and hashlib.sha256(target.read_bytes()).hexdigest()==stem['sha256']:
  continue
 data,rate=sf.read(root/'assets/stem-inputs'/(stem['id']+'.flac'),dtype='float32',always_2d=True)
 assert rate==stem['sampleRate'] and len(data)==stem['frames']
 sf.write(target,data,rate,format='MP3',bitrate_mode='CONSTANT',compression_level=.45)
 assert hashlib.sha256(target.read_bytes()).hexdigest()==stem['sha256'], 'Encoder output differs; use libsndfile 1.2.2'
print('PASS: six delivery files built from retained lossless sources and verified')
