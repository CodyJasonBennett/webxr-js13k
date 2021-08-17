import notes from '../data/notes';

export const playNote = (audioContext, note, duration, type = 'square') => {
  // Create waveform
  const oscillator = audioContext.createOscillator();
  oscillator.type = type;

  // Get note frequency
  const frequency =
    (typeof note === 'string' ? notes[note] : Object.values(notes)[note]) || 0;
  oscillator.frequency.value = frequency;

  // Create gain stage/node
  const gain = audioContext.createGain();
  oscillator.connect(gain);

  // Connect audio graph
  gain.connect(audioContext.destination);
  oscillator.start(0);

  // Play audio (in seconds)
  gain.gain.value = 0.02;
  gain.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + duration);

  return audioContext;
};
