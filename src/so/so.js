// Sons generats amb Web Audio (sense fitxers) i veu del navegador en valencià/català.

let ctx = null;

function context() {
  const Classe = globalThis.AudioContext ?? globalThis.webkitAudioContext;
  if (!Classe) return null;
  if (!ctx) ctx = new Classe();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function nota(freq, inici = 0, durada = 0.18, tipus = 'sine', volum = 0.16) {
  const c = context();
  if (!c) return;
  const t = c.currentTime + inici;
  const osc = c.createOscillator();
  const guany = c.createGain();
  osc.type = tipus;
  osc.frequency.setValueAtTime(freq, t);
  guany.gain.setValueAtTime(0.0001, t);
  guany.gain.exponentialRampToValueAtTime(volum, t + 0.015);
  guany.gain.exponentialRampToValueAtTime(0.0001, t + durada);
  osc.connect(guany).connect(c.destination);
  osc.start(t);
  osc.stop(t + durada + 0.05);
}

/** El colp sec de la pilota de vaqueta contra la mà o la paret. */
function colp(inici = 0, volum = 0.3) {
  const c = context();
  if (!c) return;
  const t = c.currentTime + inici;
  const osc = c.createOscillator();
  const guany = c.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(190, t);
  osc.frequency.exponentialRampToValueAtTime(55, t + 0.09);
  guany.gain.setValueAtTime(volum, t);
  guany.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  osc.connect(guany).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.15);
}

export const sons = {
  quinze() {
    colp();
    nota(880, 0.06, 0.2);
    nota(1320, 0.14, 0.28);
  },
  doble() {
    colp();
    colp(0.13);
    nota(784, 0.08, 0.16);
    nota(1047, 0.2, 0.16);
    nota(1568, 0.32, 0.34);
  },
  avis() {
    nota(440, 0, 0.22, 'sine', 0.1);
    nota(392, 0.2, 0.3, 'sine', 0.1);
  },
  resta() {
    nota(392, 0, 0.2, 'sine', 0.11);
    nota(330, 0.18, 0.2, 'sine', 0.11);
    nota(262, 0.36, 0.34, 'sine', 0.11);
  },
  tic() {
    colp(0, 0.18);
  },
  rifa() {
    colp();
    [659, 784, 988, 1319].forEach((f, i) => nota(f, 0.08 + i * 0.09, 0.22));
  },
  nivell() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => nota(f, i * 0.11, 0.3, 'triangle'));
  },
  joc() {
    colp();
    [587, 740, 880, 1175].forEach((f, i) => nota(f, 0.1 + i * 0.12, 0.3, 'triangle'));
  },
  partida() {
    [523, 523, 659, 784, 659, 784, 1047].forEach((f, i) => nota(f, i * 0.16, 0.34, 'triangle', 0.2));
    colp(1.2, 0.35);
  },
  desfer() {
    nota(660, 0, 0.12, 'sine', 0.08);
    nota(520, 0.1, 0.16, 'sine', 0.08);
  },
};

function veuCatalana() {
  const veus = globalThis.speechSynthesis?.getVoices?.() ?? [];
  return (
    veus.find((v) => /ca[-_]ES[-_]valencia/i.test(v.lang)) ??
    veus.find((v) => /^ca/i.test(v.lang)) ??
    null
  );
}

/** True si el navegador té una veu en valencià/català instal·lada. */
export function hiHaVeu() {
  return veuCatalana() !== null;
}

/** Diu un text en veu alta. Si no hi ha veu catalana, calla (millor que parlar amb accent estrany). */
export function parla(text) {
  const sintesi = globalThis.speechSynthesis;
  const veu = veuCatalana();
  if (!sintesi || !veu) return;
  const frase = new SpeechSynthesisUtterance(text);
  frase.voice = veu;
  frase.lang = veu.lang;
  frase.rate = 1;
  frase.pitch = 1.1;
  sintesi.cancel();
  sintesi.speak(frase);
}
