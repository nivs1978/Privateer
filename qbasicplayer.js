/*
  QBasic PLAY command support in this implementation:
  - Tn tempo
  - On octave
  - Ln default length
  - ML, MN, MS articulation
  - < and > octave shift
  - Notes A-G with optional #, +, - and optional length with dots
  - Pn rest with optional dots
  - Nn note number (0=rest)
*/

class PlayStringPlayer {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.activeNodes = [];

    this.state = {
      tempo: 120,
      octave: 4,
      defaultLength: 4,
      articulation: "MN"
    };

    // Keep pitch alignment compatible with the reference C# conversion.
    this.csPitchOctaveOffset = 2;
  }

  async ensureAudio() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.12;
      this.masterGain.connect(this.audioContext.destination);
    }

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }

  resetState() {
    this.state = {
      tempo: 120,
      octave: 4,
      defaultLength: 4,
      articulation: "MN"
    };
  }

  stop() {
    for (const node of this.activeNodes) {
      try {
        node.stop();
      } catch (err) {
        // Node may already be stopped.
      }
      try {
        node.disconnect();
      } catch (err) {
        // Node may already be disconnected.
      }
    }
    this.activeNodes = [];
  }

  play(playString) {
    if (!playString || typeof playString !== "string") {
      return 0;
    }

    if (!this.audioContext) {
      // Call ensureAudio() first to initialize context from a user gesture.
      return 0;
    }

    this.stop();
    this.resetState();

    const s = playString.toUpperCase();
    let i = 0;
    let t = this.audioContext.currentTime + 0.02;

    const readNumber = () => {
      const start = i;
      while (i < s.length && /[0-9]/.test(s[i])) {
        i += 1;
      }
      if (start === i) {
        return null;
      }
      return parseInt(s.slice(start, i), 10);
    };

    const readDots = () => {
      let dots = 0;
      while (s[i] === ".") {
        dots += 1;
        i += 1;
      }
      return dots;
    };

    const dotMultiplier = (dots) => {
      let m = 1;
      let add = 0.5;
      for (let d = 0; d < dots; d += 1) {
        m += add;
        add /= 2;
      }
      return m;
    };

    const noteDurationSec = (lengthValue, dots) => {
      const denom = lengthValue || this.state.defaultLength;
      const quarter = 60 / this.state.tempo;
      const base = quarter * (4 / denom);
      return base * dotMultiplier(dots);
    };

    const articulationRatio = () => {
      switch (this.state.articulation) {
        case "ML":
          return 1.0;
        case "MS":
          return 0.75;
        case "MN":
        default:
          return 0.875;
      }
    };

    const semitoneForNote = (ch) => {
      switch (ch) {
        case "C": return 0;
        case "D": return 2;
        case "E": return 4;
        case "F": return 5;
        case "G": return 7;
        case "A": return 9;
        case "B": return 11;
        default: return null;
      }
    };

    const freqFromMidi = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

    const scheduleTone = (freq, duration) => {
      const playFor = duration * articulationRatio();

      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.setValueAtTime(0, t + Math.max(0, playFor));

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + Math.max(0.001, playFor));

      this.activeNodes.push(osc, gain);
    };

    while (i < s.length) {
      const ch = s[i];

      if (ch === " " || ch === "\t" || ch === "\n" || ch === "," || ch === ";") {
        i += 1;
        continue;
      }

      if (ch === ">") {
        this.state.octave = Math.min(this.state.octave + 1, 8);
        i += 1;
        continue;
      }

      if (ch === "<") {
        this.state.octave = Math.max(this.state.octave - 1, 0);
        i += 1;
        continue;
      }

      if (ch === "M") {
        i += 1;
        const mode = s[i];
        if (mode === "L" || mode === "N" || mode === "S") {
          this.state.articulation = `M${mode}`;
          i += 1;
          continue;
        }
        if (mode === "B" || mode === "F") {
          // MB/MF playback toggles are ignored in this implementation.
          i += 1;
        }
        continue;
      }

      if (ch === "T") {
        i += 1;
        const n = readNumber();
        if (n !== null && n > 0) {
          this.state.tempo = n;
        }
        continue;
      }

      if (ch === "O") {
        i += 1;
        const n = readNumber();
        if (n !== null) {
          this.state.octave = n;
        }
        continue;
      }

      if (ch === "L") {
        i += 1;
        const n = readNumber();
        if (n !== null && n > 0) {
          this.state.defaultLength = n;
        }
        continue;
      }

      if (ch === "P") {
        i += 1;
        const len = readNumber();
        const dots = readDots();
        t += noteDurationSec(len, dots);
        continue;
      }

      if (ch === "N") {
        i += 1;
        const n = readNumber();
        const dots = readDots();
        const dur = noteDurationSec(null, dots);

        if (n === null || n <= 0) {
          t += dur;
          continue;
        }

        const midi = 12 + (n - 1);
        const freq = freqFromMidi(midi);
        scheduleTone(freq, dur);
        t += dur;
        continue;
      }

      const semiBase = semitoneForNote(ch);
      if (semiBase !== null) {
        i += 1;
        let semitone = semiBase;
        let dots = 0;

        if (s[i] === "#" || s[i] === "+") {
          semitone += 1;
          i += 1;
        } else if (s[i] === "-") {
          semitone -= 1;
          i += 1;
        }

        if (s[i] === ".") {
          dots = 1;
          i += 1;
        }

        const len = readNumber();
        dots += readDots();
        const dur = noteDurationSec(len, dots);

        const midi = (this.state.octave + 1 + this.csPitchOctaveOffset) * 12 + semitone;
        const freq = freqFromMidi(midi);
        scheduleTone(freq, dur);
        t += dur;
        continue;
      }

      i += 1;
    }

    return Math.max(0, t - this.audioContext.currentTime);
  }
}
