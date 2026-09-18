// Web Audio API generator for calming ambient soundscapes
// Completely self-contained, no external mp3 files required.

class AmbientSoundManager {
  constructor() {
    this.ctx = null;
    this.currentTrack = null;
    this.isPlaying = false;
    this.nodes = [];
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  stop() {
    this.nodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {
        // ignore
      }
    });
    this.nodes = [];
    this.isPlaying = false;
    this.currentTrack = null;
  }

  play(trackName) {
    this.init();
    if (this.currentTrack === trackName && this.isPlaying) {
      this.stop();
      return false;
    }
    this.stop();

    if (trackName === 'rain') {
      this.playGentleRain();
    } else if (trackName === 'night') {
      this.playCalmNight();
    } else if (trackName === 'meditation') {
      this.playDeepChant();
    }
    this.currentTrack = trackName;
    this.isPlaying = true;
    return true;
  }

  // Gentle Pink Noise Rain simulation
  playGentleRain() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to sound like soft soothing rain
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(850, this.ctx.currentTime);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.35, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    whiteNoise.start();
    this.nodes.push(whiteNoise, filter, gainNode);
  }

  // Calm Night Drone / Wind
  playCalmNight() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 0.8;
    }

    const brownNoise = this.ctx.createBufferSource();
    brownNoise.buffer = noiseBuffer;
    brownNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    // Warm chord background (174 Hz Solfeggio frequency for healing & peace)
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(174, this.ctx.currentTime);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    brownNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    brownNoise.start();
    osc.start();
    this.nodes.push(brownNoise, filter, gain, osc, oscGain);
  }

  // Deep Meditative Harmonic Ambient (Warm Tibetan / Sufi harmony)
  playDeepChant() {
    const rootFreq = 108; // Sacred harmonic
    const harmonics = [1, 1.5, 2, 2.5]; // Fundamental, fifth, octave, major third

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    masterGain.connect(this.ctx.destination);
    this.nodes.push(masterGain);

    harmonics.forEach((h, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(rootFreq * h, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.1 + idx * 0.05, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

      const voiceGain = this.ctx.createGain();
      voiceGain.gain.setValueAtTime(0.05 / (idx + 1), this.ctx.currentTime);

      lfo.connect(lfoGain.gain);
      osc.connect(voiceGain);
      voiceGain.connect(masterGain);

      osc.start();
      lfo.start();
      this.nodes.push(osc, lfo, lfoGain, voiceGain);
    });
  }
}

export const ambientSound = new AmbientSoundManager();
