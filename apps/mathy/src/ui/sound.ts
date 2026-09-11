/**
 * El sonido del juego: pocos sonidos, y todos con significado físico (N §6).
 *
 * Cada sonido es lo que haría el objeto si fuera de verdad: la fruta que cae en
 * su lugar hace "toc" de madera, dos cosas que coinciden tintinean como un vidrio,
 * la llave entra al llavero con un clic de metal, la balanza se asienta con un
 * golpe grave. No hay música en las actividades, no hay fanfarria de acierto y no
 * hay sonido de error: lo que no avanzó no suena a nada.
 *
 * El sonido también explica: `drop` acepta un `pitch` en semitonos, y llenar una
 * fila sube la nota como sube el agua en una botella. Contar se escucha.
 *
 * Se sintetiza en el momento (WebAudio): no hay archivos que cargar ni esperar.
 * En el teléfono todavía no suena (pendiente: los mismos sonidos renderizados a
 * archivos con `expo-audio`); el juego no depende de ningún sonido para decir algo.
 *
 * Se llama desde JS. Desde un worklet (un gesto de Reanimated), con `runOnJS`.
 * Nada de acá puede romper el juego: si el navegador no deja sonar, no suena.
 */
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Sfx =
  /** Un botón de interfaz. Casi nada: confirma el toque. */
  | "tap"
  /** Algo se levanta del tablero: aire. */
  | "lift"
  /** Algo cae en su lugar: madera. Con `pitch`, la nota sube al llenar. */
  | "drop"
  /** Una pieza que encaja (una respuesta que entra): clic y golpe. */
  | "fit"
  /** Dos cosas que coinciden: vidrio. */
  | "join"
  /** La llave entra al llavero: metal. */
  | "keyIn"
  /** La guía da vuelta la hoja. */
  | "page"
  /** Se enciende la lamparita de Tomi. */
  | "hint"
  /** La balanza (o cualquier cosa pesada) se asienta. */
  | "settle";

// --- Tipos mínimos de WebAudio: la app no carga la librería `dom` de TypeScript.
interface Param {
  value: number;
  setValueAtTime(v: number, t: number): void;
  linearRampToValueAtTime(v: number, t: number): void;
  exponentialRampToValueAtTime(v: number, t: number): void;
}
interface AudioNodeLike {
  connect(n: AudioNodeLike): void;
}
interface Osc extends AudioNodeLike {
  type: string;
  frequency: Param;
  start(t: number): void;
  stop(t: number): void;
}
interface Gain extends AudioNodeLike {
  gain: Param;
}
interface Filter extends AudioNodeLike {
  type: string;
  frequency: Param;
  Q: Param;
}
interface Buf {
  getChannelData(i: number): Float32Array;
}
interface Src extends AudioNodeLike {
  buffer: Buf | null;
  start(t: number, offset?: number): void;
  stop(t: number): void;
}
interface Ctx {
  currentTime: number;
  state: string;
  sampleRate: number;
  destination: AudioNodeLike;
  resume(): Promise<void>;
  createOscillator(): Osc;
  createGain(): Gain;
  createBiquadFilter(): Filter;
  createBuffer(channels: number, length: number, rate: number): Buf;
  createBufferSource(): Src;
}

const KEY = "mathy.sound.v1";
const SILENCE = 0.0001;

let ctx: Ctx | null = null;
let master: Gain | null = null;
let noise: Buf | null = null;
let muted = false;
const listeners = new Set<(m: boolean) => void>();

void AsyncStorage.getItem(KEY)
  .then((v) => {
    if (v === "off") {
      muted = true;
      listeners.forEach((f) => f(true));
    }
  })
  .catch(() => undefined);

function audio(): Ctx | null {
  if (Platform.OS !== "web") return null;
  if (ctx) {
    // El navegador arranca el audio suspendido hasta el primer gesto: el primer
    // botón que se toca lo despierta.
    if (ctx.state === "suspended") void ctx.resume().catch(() => undefined);
    return ctx;
  }
  const g = globalThis as unknown as { AudioContext?: new () => unknown; webkitAudioContext?: new () => unknown };
  const C = g.AudioContext ?? g.webkitAudioContext;
  if (!C) return null;
  ctx = new C() as Ctx;
  master = ctx.createGain();
  master.gain.value = 0.8;
  master.connect(ctx.destination);
  const len = Math.floor(ctx.sampleRate * 0.5);
  noise = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return ctx;
}

/** Un tono con ataque corto y caída exponencial; `to` hace un glissando. */
function tone(
  c: Ctx,
  o: { freq: number; to?: number; type?: string; at: number; dur: number; gain: number; attack?: number },
): void {
  if (!master) return;
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, o.at);
  if (o.to !== undefined) osc.frequency.exponentialRampToValueAtTime(o.to, o.at + o.dur * 0.6);
  env.gain.setValueAtTime(SILENCE, o.at);
  env.gain.linearRampToValueAtTime(o.gain, o.at + (o.attack ?? 0.004));
  env.gain.exponentialRampToValueAtTime(SILENCE, o.at + o.dur);
  osc.connect(env);
  env.connect(master);
  osc.start(o.at);
  osc.stop(o.at + o.dur + 0.02);
}

/** Un soplo de ruido filtrado: el aire, el papel, el roce del metal. */
function burst(
  c: Ctx,
  o: { at: number; dur: number; gain: number; type: string; freq: number; to?: number; q?: number },
): void {
  if (!master || !noise) return;
  const src = c.createBufferSource();
  src.buffer = noise;
  const f = c.createBiquadFilter();
  f.type = o.type;
  f.frequency.setValueAtTime(o.freq, o.at);
  if (o.to !== undefined) f.frequency.exponentialRampToValueAtTime(o.to, o.at + o.dur);
  f.Q.value = o.q ?? 1;
  const env = c.createGain();
  env.gain.setValueAtTime(SILENCE, o.at);
  env.gain.linearRampToValueAtTime(o.gain, o.at + 0.003);
  env.gain.exponentialRampToValueAtTime(SILENCE, o.at + o.dur);
  src.connect(f);
  f.connect(env);
  env.connect(master);
  src.start(o.at, Math.random() * 0.3);
  src.stop(o.at + o.dur + 0.02);
}

/** Cada receta recibe el instante de inicio y la razón de altura (2 elevado a semitonos/12). */
const RECIPES: Record<Sfx, (c: Ctx, t: number, k: number) => void> = {
  tap: (c, t) => {
    tone(c, { freq: 1400, to: 900, at: t, dur: 0.05, gain: 0.05 });
  },
  lift: (c, t) => {
    burst(c, { at: t, dur: 0.11, gain: 0.05, type: "bandpass", freq: 500, to: 1800, q: 1.4 });
  },
  drop: (c, t, k) => {
    // Madera: un parcial que cae apenas de altura, un armónico corto y el clic del golpe.
    tone(c, { freq: 540 * k, to: 400 * k, at: t, dur: 0.16, gain: 0.2 });
    tone(c, { freq: 1480 * k, at: t, dur: 0.05, gain: 0.05, type: "triangle" });
    burst(c, { at: t, dur: 0.02, gain: 0.08, type: "highpass", freq: 2500 });
  },
  fit: (c, t) => {
    burst(c, { at: t, dur: 0.012, gain: 0.1, type: "highpass", freq: 3000 });
    burst(c, { at: t + 0.045, dur: 0.012, gain: 0.08, type: "highpass", freq: 2400 });
    tone(c, { freq: 190, to: 130, at: t + 0.04, dur: 0.14, gain: 0.16 });
  },
  join: (c, t, k) => {
    // Vidrio: dos parciales altos, en quinta, que se apagan despacio.
    tone(c, { freq: 1318.5 * k, at: t, dur: 0.5, gain: 0.06 });
    tone(c, { freq: 1975.5 * k, at: t + 0.01, dur: 0.4, gain: 0.035 });
  },
  keyIn: (c, t) => {
    // Metal: parciales inarmónicos, dos golpes (entra y gira).
    tone(c, { freq: 2210, at: t, dur: 0.28, gain: 0.05, type: "triangle" });
    tone(c, { freq: 3170, at: t, dur: 0.2, gain: 0.03 });
    burst(c, { at: t, dur: 0.03, gain: 0.07, type: "bandpass", freq: 4000, q: 3 });
    tone(c, { freq: 1620, at: t + 0.11, dur: 0.3, gain: 0.05, type: "triangle" });
    burst(c, { at: t + 0.11, dur: 0.03, gain: 0.06, type: "bandpass", freq: 3000, q: 3 });
  },
  page: (c, t) => {
    burst(c, { at: t, dur: 0.16, gain: 0.035, type: "lowpass", freq: 3500, to: 900 });
  },
  hint: (c, t) => {
    tone(c, { freq: 880, to: 1760, at: t, dur: 0.32, gain: 0.06 });
    tone(c, { freq: 2640, at: t + 0.05, dur: 0.2, gain: 0.02 });
  },
  settle: (c, t) => {
    tone(c, { freq: 150, to: 95, at: t, dur: 0.24, gain: 0.2 });
    burst(c, { at: t, dur: 0.05, gain: 0.05, type: "lowpass", freq: 900 });
  },
};

/** Suena un efecto. `pitch` en semitonos (para `drop`, `join`). No hace nada con el sonido apagado. */
export function play(name: Sfx, opts: { readonly pitch?: number } = {}): void {
  if (muted) return;
  try {
    const c = audio();
    if (!c) return;
    RECIPES[name](c, c.currentTime + 0.005, Math.pow(2, (opts.pitch ?? 0) / 12));
  } catch {
    // Un navegador sin audio no es un error del juego.
  }
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(m: boolean): void {
  muted = m;
  void AsyncStorage.setItem(KEY, m ? "off" : "on").catch(() => undefined);
  listeners.forEach((f) => f(m));
}

/** El estado del sonido, para el botón que lo apaga. */
export function useMuted(): boolean {
  const [m, setM] = useState(muted);
  useEffect(() => {
    listeners.add(setM);
    setM(muted);
    return () => {
      listeners.delete(setM);
    };
  }, []);
  return m;
}
