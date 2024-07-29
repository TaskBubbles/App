class AudioManager {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.soundBuffer = null;
    this.loadSound('Pop.wav');
  }

  async loadSound(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    this.soundBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
  }

  playPopSound() {
    if (!this.soundBuffer) {
      console.error("Sound not loaded yet");
      return;
    }
    const source = this.audioContext.createBufferSource();
    source.buffer = this.soundBuffer;
    const pitchVariations = [0.8, 1, 2];
    const randomPitch = pitchVariations[Math.floor(Math.random() * pitchVariations.length)];
    source.playbackRate.value = randomPitch;
    source.connect(this.audioContext.destination);
    source.start(0);
  }
}

// Create a global instance of AudioManager
const audioManager = new AudioManager();

// Function to play the pop sound
function PlayPopSound() {
  audioManager.playPopSound();
}
