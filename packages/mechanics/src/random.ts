/**
 * Generador con semilla.
 *
 * Todo el contenido de Mathy se genera, nunca se lista: un nivel no tiene una
 * lista fija de ejercicios sino parámetros y una semilla. Eso exige que el
 * azar sea reproducible, para que un problema se pueda volver a mostrar igual
 * y para que los tests sean deterministas.
 */

export interface Random {
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
  bool(): boolean;
}

/** mulberry32: chico, rápido y suficiente para generar ejercicios. */
export function makeRandom(seed: number): Random {
  let s = seed >>> 0;
  const next = (): number => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number): number => min + Math.floor(next() * (max - min + 1));
  return {
    int,
    pick: <T,>(items: readonly T[]): T => items[int(0, items.length - 1)] as T,
    shuffle: <T,>(items: readonly T[]): T[] => {
      const out = [...items];
      for (let i = out.length - 1; i > 0; i--) {
        const j = int(0, i);
        [out[i], out[j]] = [out[j] as T, out[i] as T];
      }
      return out;
    },
    bool: () => next() < 0.5,
  };
}
