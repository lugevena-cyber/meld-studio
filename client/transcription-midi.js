import { Midi } from '@tonejs/midi';

export async function readTranscriptionMidi(file) {
  if (file.size > 2 * 1024 * 1024) throw Error('MIDI 文件不能超过 2 MiB');
  let midi;
  try {
    midi = new Midi(await file.arrayBuffer());
  } catch {
    throw Error('无法读取这个 MIDI 文件');
  }

  const groups = [];
  let count = 0;
  for (const track of midi.tracks) {
    if (!track.notes.length) continue;
    count += track.notes.length;
    if (groups.length >= 32 || count > 20000) throw Error('MIDI 音轨或音符过多，请导入较短的片段');

    const instrument = track.instrument.percussion ? 'drums' : track.instrument.name;
    const name = track.name.trim() || (track.instrument.percussion ? '鼓组' : instrument);
    const notes = track.notes.flatMap(note => {
      if (!Number.isFinite(note.time) || !Number.isFinite(note.duration) ||
          note.time < 0 || note.duration <= 0 || note.time + note.duration > 3600) {
        return [];
      }
      return [{
        midi: note.midi,
        start: note.time,
        duration: note.duration,
        velocity: note.velocity,
        confidence: 1,
        manualEdited: true,
      }];
    });
    if (notes.length) groups.push({ name, instrument, notes });
  }
  if (!groups.length) throw Error('这个 MIDI 文件没有可导入的音符');
  return { groups, count: groups.reduce((total, group) => total + group.notes.length, 0) };
}
