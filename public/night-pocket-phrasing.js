/* Phrasing for Night Pocket's editable score and MIDI. Note onsets and pitches are fixed. */
(function (root) {
  "use strict";

  const parts = {
    lead: { maxInterval: 1.02, gate: 1.016, maxExtension: .29 },
    keys: { maxInterval: 2.8, gate: .89, maxExtension: .23 },
    bass: { maxInterval: .78, gate: .85, maxExtension: .10 }
  };
  const patches = {
    lead: { attack: 5, release: 720, sustain: 43, space: 13, phraseTail: true },
    keys: { attack: 7, release: 790, sustain: 38, space: 13, phraseTail: true },
    bass: { attack: 6, release: 255, sustain: 41, space: 0, phraseTail: true }
  };

  function shape(notes, part, beat) {
    const settings = parts[part];
    const result = notes.map(note => ({ ...note }));
    if (!settings || !Number.isFinite(beat) || beat <= 0) return result;

    const ordered = [...result].sort((a, b) => a.start - b.start);
    const groups = [];
    for (const note of ordered) {
      const last = groups.at(-1);
      if (part === "keys" && last && note.start - last.start < .04) {
        last.notes.push(note);
      } else {
        groups.push({ start: note.start, notes: [note] });
      }
    }

    const nextSamePitch = new Map();
    const samePitchStarts = new WeakMap();
    for (let i = ordered.length - 1; i >= 0; i--) {
      const note = ordered[i];
      samePitchStarts.set(note, nextSamePitch.get(note.midi) ?? Infinity);
      nextSamePitch.set(note.midi, note.start);
    }
    for (let i = 0; i + 1 < groups.length; i++) {
      const group = groups[i];
      const following = groups[i + 1].start;
      const interval = following - group.start;
      if (interval > settings.maxInterval * beat) continue;
      const targetEnd = group.start + interval * settings.gate;
      for (const note of group.notes) {
        const currentEnd = note.start + note.duration;
        const samePitchEnd = samePitchStarts.get(note) - .008;
        const end = Math.min(targetEnd, samePitchEnd, currentEnd + settings.maxExtension);
        if (end > currentEnd + .004) note.duration = Number((end - note.start).toFixed(6));
      }
    }
    return result;
  }

  root.MeldNightPocketPhrasing = { shape, patches };
})(globalThis);
