import { Howl } from "howler";

let audioCtx: AudioContext | null = null;
let music: Howl | null = null;
let muted = false;

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

// Navegadores só liberam áudio depois de um toque do usuário.
export function unlockAudio(): void {
  if (!audioCtx) {
    const Ctor = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
    if (Ctor) audioCtx = new Ctor();
  }
  void audioCtx?.resume();
}

function tone(freq: number, start: number, duration: number, volume = 0.08): void {
  if (!audioCtx || muted) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "square";
  osc.frequency.value = freq;
  const t0 = audioCtx.currentTime + start;
  gain.gain.setValueAtTime(volume, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0 + duration);
}

export function blip(): void {
  tone(988, 0, 0.08);
  tone(1319, 0.07, 0.12);
}

export function fanfare(): void {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.2, 0.09));
}

export function startMusic(url: string): void {
  if (!url || music) return;
  music = new Howl({ src: [url], loop: true, volume: 0.5, html5: true });
  if (!muted) music.play();
}

export function toggleMute(): boolean {
  muted = !muted;
  if (music) {
    if (muted) music.pause();
    else music.play();
  }
  return muted;
}

export function isMuted(): boolean {
  return muted;
}
