import { decode } from 'utils/data';
import notes from 'data/notes';

const BEAT_LENGTH = 0.15;

class Audio {
  play(song) {
    this.context = new (window.AudioContext || window.webkitAudioContext)();

    this.queue = decode(song).reduce((output, [note, offset, beats]) => {
      output.push({
        note,
        start: offset * BEAT_LENGTH,
        duration: beats * BEAT_LENGTH,
        playing: false,
      });

      return output;
    }, []);
  }

  playNote(note, duration, type = 'square') {
    // Create waveform
    const oscillator = this.context.createOscillator();
    oscillator.type = type;

    // Get note frequency
    const frequency =
      (typeof note === 'string' ? notes[note] : Object.values(notes)[note]) || 0;
    oscillator.frequency.value = frequency;

    // Create gain stage/node
    const gain = this.context.createGain();
    oscillator.connect(gain);

    // Connect audio graph
    gain.connect(this.context.destination);
    oscillator.start(0);

    // Play audio (in seconds)
    gain.gain.value = 0.02;
    gain.gain.exponentialRampToValueAtTime(0.00001, this.context.currentTime + duration);
  }

  update() {
    this.queue?.forEach(({ note, start, duration, playing = false }, index) => {
      const shouldPlay =
        this.context.currentTime > start && this.context.currentTime < start + duration;

      if (!playing && shouldPlay) {
        this.playNote(note, duration);
        this.queue[index].playing = true;
      }
    });

    if (this.queue?.every(({ isPlaying }) => isPlaying)) {
      this.dispose();
    }
  }

  dispose() {
    this.queue = null;
    this.context.close();
    this.context = null;
  }
}

export default Audio;
