/**
 * Las funciones de suavizado de ManimGL, portadas tal cual.
 *
 * Son quince y caben en cincuenta líneas. Portarlas en vez de usar las de
 * cualquier librería de animación es lo que hace que el movimiento se sienta
 * como un video de 3Blue1Brown y no como una transición de interfaz.
 */

export type RateFunc = (t: number) => number;

const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);

/** El suavizado por defecto de Manim: un sigmoide con derivada nula en los extremos. */
export const smooth: RateFunc = (t) => {
  const x = clamp01(t);
  return x * x * x * (10 - 15 * x + 6 * x * x);
};

export const linear: RateFunc = clamp01;
export const rushInto: RateFunc = (t) => 2 * smooth(clamp01(t) / 2);
export const rushFrom: RateFunc = (t) => 2 * smooth(clamp01(t) / 2 + 0.5) - 1;
export const slowInto: RateFunc = (t) => Math.sqrt(1 - (1 - clamp01(t)) ** 2);
export const doubleSmooth: RateFunc = (t) => {
  const x = clamp01(t);
  return x < 0.5 ? 0.5 * smooth(2 * x) : 0.5 * (1 + smooth(2 * x - 1));
};
export const thereAndBack: RateFunc = (t) => {
  const x = clamp01(t);
  return smooth(x < 0.5 ? 2 * x : 2 * (1 - x));
};
export const thereAndBackWithPause = (pauseRatio = 1 / 3): RateFunc => {
  const a = 1 / pauseRatio;
  return (t) => {
    const x = clamp01(t);
    if (x < 0.5 - pauseRatio / 2) return smooth(a * x);
    if (x > 0.5 + pauseRatio / 2) return smooth(a - a * x);
    return 1;
  };
};
export const runningStart: RateFunc = (t) => {
  const x = clamp01(t);
  // Bézier con un punto de control negativo: retrocede antes de salir.
  return 3 * x * (1 - x) ** 2 * -0.5 + 3 * x * x * (1 - x) * 1.5 + x ** 3;
};
export const overshoot: RateFunc = (t) => {
  const x = clamp01(t);
  const s = 1.5;
  return 1 + (x - 1) ** 2 * ((s + 1) * (x - 1) + s);
};
export const notQuiteThere = (proportion = 0.7): RateFunc => (t) => proportion * smooth(t);
export const wiggle: RateFunc = (t) => thereAndBack(clamp01(t)) * Math.sin(6 * Math.PI * clamp01(t));
export const lingering: RateFunc = (t) => smooth(clamp01(t) * 0.8);
export const exponentialDecay = (halfLife = 0.1): RateFunc => (t) => 1 - Math.exp(-clamp01(t) / halfLife);

/** Comprime una función de suavizado en un tramo del intervalo. */
export const squish = (fn: RateFunc, a: number, b: number): RateFunc => (t) => {
  if (a === b) return a;
  const x = clamp01(t);
  return fn(clamp01((x - a) / (b - a)));
};

export const rateFunctions = {
  linear,
  smooth,
  rushInto,
  rushFrom,
  slowInto,
  doubleSmooth,
  thereAndBack,
  runningStart,
  overshoot,
  wiggle,
  lingering,
} as const satisfies Record<string, RateFunc>;

export type RateFuncName = keyof typeof rateFunctions;
