/**
 * El camino de piedras, para `found.count.number_line`.
 *
 * Los seis niveles y qué endurece cada parámetro salen del documento del
 * minijuego y de `F-minijuegos/minigames.yaml`, no de acá: este archivo los
 * implementa, no los decide.
 *
 * La idea que sostiene todo: la piedra es el número y el paso es la unidad. Por
 * eso la manivela no tiene medio diente. No es una validación que rechaza un
 * movimiento inválido; es que el movimiento inválido no se puede expresar, y
 * esa imposibilidad es el contenido del nodo.
 *
 * Sin texto visible: el nodo es `literacy: none` y acá solo hay claves y datos.
 */

import { makeRandom, type Random } from "./random.ts";
import { registerNode, type LevelBase } from "./node.ts";
import type { Evidence, Layer } from "./one-step.ts";

/** El nodo del grafo que este minijuego enseña. */
export const NODE = "found.count.number_line";

/**
 * El mismo id, sin ambigüedad. `index.ts` reúne los minijuegos con `export *` y
 * cada uno declara su propio `NODE`, así que afuera del módulo se lo nombra así.
 */
export const NODE_NUMBER_LINE = NODE;

/** La pista corre a lo ancho, o hacia arriba, que rompe "el orden va a la derecha". */
export type Orientation = "horizontal" | "vertical";

/** Las piedras del camino, o las marcas de la recta en la que se aplanan. */
export type PathSkin = "stone" | "mark";

/**
 * Qué hace el jugador en el nivel. No es dificultad: es qué gesto contesta la
 * pregunta del nivel.
 *
 * - `walk`: girar la manivela hasta la bandera.
 * - `predict`: tocar la piedra de llegada antes de que la manivela gire.
 * - `compare`: elegir cuál de dos recorridos rompe la fila.
 * - `fill`: clavar la ficha del numeral que falta.
 */
export type PathMode = "walk" | "predict" | "compare" | "fill";

export interface PathParams {
  /** Cuántas piedras tiene la pista, entre estos dos. */
  readonly length: readonly [number, number];
  /** Cuántas piedras van sin tarjeta. */
  readonly gaps: readonly [number, number];
  /** La línea empieza antes de la primera piedra: el extremo deja de ser el cero. */
  readonly offsetZero: boolean;
  readonly orientations: readonly Orientation[];
  /** Factor de dibujo: la misma pista más larga o más corta, con los mismos números. */
  readonly stretch: readonly [number, number];
  /** Los desvíos con los que nacen las fichas equivocadas del cajón. */
  readonly tileOffsets: readonly number[];
}

export interface PathLevel extends LevelBase {
  readonly params: PathParams;
  readonly mode: PathMode;
  /** Las piedras llevan tarjeta con numeral, o todavía no. */
  readonly cards: boolean;
  /** La orilla deja de ser borde y recibe su tarjeta con `0`. */
  readonly zeroCard: boolean;
  readonly skin: PathSkin;
  /** En la capa `visual` la mitad de las instancias se juega sin caminante. */
  readonly walker: "always" | "sometimes";
}

/**
 * Los seis niveles. Cada uno cambia la capa o endurece los parámetros, nunca
 * las dos cosas: el 6 se lleva la pista a `visual` con los mismos parámetros
 * que el 5, y los otros cinco se quedan en `concrete` endureciendo.
 *
 * Lo que no es dificultad —el modo, las tarjetas, la piel de la pista— vive
 * afuera de `params` justamente para que la regla se pueda comprobar.
 */
export const PATH_LEVELS: readonly PathLevel[] = [
  {
    n: 1,
    titleKey: "level.oneToothOneStone",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 4,
    params: {
      length: [5, 6],
      gaps: [0, 0],
      offsetZero: false,
      orientations: ["horizontal"],
      stretch: [1, 1],
      tileOffsets: [],
    },
    mode: "walk",
    cards: false,
    zeroCard: false,
    skin: "stone",
    walker: "always",
  },
  {
    n: 2,
    titleKey: "level.stonesHaveNames",
    layer: "concrete",
    evidence: ["manipulate", "recognize"],
    rounds: 4,
    params: {
      length: [7, 9],
      gaps: [0, 0],
      offsetZero: false,
      orientations: ["horizontal"],
      stretch: [1, 1],
      tileOffsets: [],
    },
    mode: "predict",
    cards: true,
    zeroCard: false,
    skin: "stone",
    walker: "always",
  },
  {
    n: 3,
    titleKey: "level.stoneWithNoSteps",
    layer: "concrete",
    evidence: ["explain"],
    rounds: 3,
    params: {
      length: [7, 9],
      gaps: [0, 0],
      offsetZero: false,
      orientations: ["horizontal"],
      stretch: [1, 1],
      tileOffsets: [],
    },
    mode: "compare",
    cards: true,
    zeroCard: true,
    skin: "stone",
    walker: "always",
  },
  {
    n: 4,
    titleKey: "level.gaps",
    layer: "concrete",
    evidence: ["apply"],
    rounds: 4,
    params: {
      length: [7, 9],
      gaps: [1, 1],
      offsetZero: false,
      orientations: ["horizontal"],
      stretch: [1, 1],
      tileOffsets: [1, -1],
    },
    mode: "fill",
    cards: true,
    zeroCard: true,
    skin: "stone",
    walker: "always",
  },
  {
    n: 5,
    titleKey: "level.tracksThatResize",
    layer: "concrete",
    evidence: ["apply"],
    rounds: 4,
    params: {
      length: [10, 20],
      gaps: [1, 3],
      offsetZero: true,
      orientations: ["horizontal", "vertical"],
      stretch: [0.6, 1],
      tileOffsets: [1, -1, 2],
    },
    mode: "fill",
    cards: true,
    zeroCard: true,
    skin: "stone",
    walker: "always",
  },
  {
    n: 6,
    titleKey: "level.marksOnly",
    layer: "visual",
    evidence: ["generalize"],
    rounds: 4,
    params: {
      length: [10, 20],
      gaps: [1, 3],
      offsetZero: true,
      orientations: ["horizontal", "vertical"],
      stretch: [0.6, 1],
      tileOffsets: [1, -1, 2],
    },
    mode: "fill",
    cards: true,
    zeroCard: true,
    skin: "mark",
    walker: "sometimes",
  },
];

/** Una ficha del cajón. Se clava si su numeral es el de la piedra. */
export interface Tile {
  readonly id: string;
  readonly value: number;
  /** Si le corresponde a alguno de los huecos de esta pista. */
  readonly correct: boolean;
}

export interface PathProblem {
  /** Cuántas piedras hay. El valor de una piedra es su índice: la orilla es la 0. */
  readonly length: number;
  /**
   * Cuánta línea se dibuja antes de la piedra 0. Con esto el extremo de la
   * pista deja de ser el cero, que es la lectura que el nivel 5 rompe.
   */
  readonly leadIn: number;
  /** Dónde arranca el caminante. */
  readonly start: number;
  /** La piedra de la bandera, o `null` cuando el nivel no pide llegar a ninguna. */
  readonly flag: number | null;
  /** Los dientes que la manivela anuncia antes de girar. */
  readonly teeth: number;
  /** Las piedras sin tarjeta. */
  readonly gaps: readonly number[];
  readonly orientation: Orientation;
  readonly stretch: number;
  readonly tiles: readonly Tile[];
  /**
   * Los dos recorridos de `compare`, en posiciones acumuladas. Uno pisa todas
   * las piedras; el otro tiene saltos de distinto tamaño y cae entre dos.
   */
  readonly walks: readonly (readonly number[])[];
  /** Cuál de los dos recorridos miente: el que hay que tocar. */
  readonly liar: number;
  readonly showWalker: boolean;
}

/** Cuántos dientes tiene una vuelta entera de la manivela. */
export const TEETH_PER_TURN = 12;

/**
 * A qué piedra lleva la manivela. Es la forma matemática del diente: la cuenta
 * de dientes es entera, así que el resultado también, y el tope en la orilla
 * es un `max` y no un mensaje de error.
 */
export function crankStep(from: number, teeth: number, length: number): number {
  const target = Math.trunc(from) + Math.trunc(teeth);
  return Math.max(0, Math.min(length - 1, target));
}

/**
 * Cuántos dientes giró la manivela. Redondear acá es lo que hace imposible el
 * medio paso: entre dos dientes no hay nada que el gesto pueda expresar.
 */
export function teethFromTurn(radians: number): number {
  return Math.round((radians * TEETH_PER_TURN) / (2 * Math.PI));
}

/** La piedra más cercana a una posición cualquiera: el agua siempre devuelve. */
export function nearestStone(at: number, length: number): number {
  return Math.max(0, Math.min(length - 1, Math.round(at)));
}

/** Genera una pista del nivel dado. La semilla la hace reproducible. */
export function generatePath(level: PathLevel, seed: number): PathProblem {
  const rnd = makeRandom(seed);
  const p = level.params;
  const length = rnd.int(p.length[0], p.length[1]);
  const orientation = rnd.pick(p.orientations);
  const stretch = pickStretch(p.stretch, rnd);
  const leadIn = p.offsetZero ? rnd.int(1, 2) : 0;

  const walk = plan(level, length, rnd);
  const gaps = pickGaps(level, length, rnd);
  const tiles = makeTiles(gaps, length, p.tileOffsets, rnd);
  const pair = level.mode === "compare" ? compareWalks(walk.flag ?? length - 1, rnd) : [];
  // El que miente no puede estar siempre en la misma fila: si estuviera, el
  // jugador acertaría sin mirar el recorrido.
  const liarFirst = pair.length === 2 && rnd.bool();
  const walks = liarFirst ? [pair[1] as number[], pair[0] as number[]] : pair;

  return {
    length,
    leadIn,
    start: walk.start,
    flag: walk.flag,
    teeth: walk.teeth,
    gaps,
    orientation,
    stretch,
    tiles,
    walks,
    liar: liarFirst ? 0 : 1,
    showWalker: level.walker === "always" ? true : rnd.bool(),
  };
}

/** Cinco tamaños de dibujo y no un continuo: la misma pista tiene que repetirse. */
function pickStretch(range: readonly [number, number], rnd: Random): number {
  const [lo, hi] = range;
  if (lo === hi) return lo;
  return lo + (rnd.int(0, 4) * (hi - lo)) / 4;
}

interface Walk {
  readonly start: number;
  readonly flag: number | null;
  readonly teeth: number;
}

function plan(level: PathLevel, length: number, rnd: Random): Walk {
  if (level.mode === "walk") {
    const flag = rnd.int(3, length - 1);
    return { start: 0, flag, teeth: flag };
  }
  if (level.mode === "predict") {
    const start = rnd.int(0, length - 4);
    const teeth = rnd.int(2, Math.min(4, length - 1 - start));
    return { start, flag: start + teeth, teeth };
  }
  if (level.mode === "compare") {
    return { start: 0, flag: length - 1, teeth: length - 1 };
  }
  // Rellenar huecos: el caminante espera y la manivela queda para pasear.
  return { start: 0, flag: null, teeth: 0 };
}

/**
 * Qué piedras van sin tarjeta. Desde el nivel 5 los huecos pueden quedar
 * pegados, que es lo que rompe la lectura "miro la de al lado y le sumo", y la
 * orilla puede ser uno de ellos, que es lo que obliga a ubicar el `0`.
 */
function pickGaps(level: PathLevel, length: number, rnd: Random): number[] {
  const [lo, hi] = level.params.gaps;
  const count = Math.min(rnd.int(lo, hi), Math.max(0, length - 2));
  if (count === 0) return [];
  const first = level.params.offsetZero ? 0 : 1;
  const last = length - 2;
  const pool: number[] = [];
  for (let i = first; i <= last; i++) pool.push(i);
  return rnd.shuffle(pool).slice(0, count).sort((a, b) => a - b);
}

/**
 * El cajón. Las fichas equivocadas no son ruido: son el numeral de al lado, que
 * es el error de contar la piedra de salida como un paso.
 */
function makeTiles(
  gaps: readonly number[],
  length: number,
  offsets: readonly number[],
  rnd: Random,
): Tile[] {
  if (gaps.length === 0) return [];
  const values = new Set<number>(gaps);
  const wanted = Math.min(gaps.length + 2, 5);
  for (const d of rnd.shuffle([...offsets])) {
    if (values.size >= wanted) break;
    for (const g of gaps) {
      const v = g + d;
      if (v >= 0 && v < length && !values.has(v)) {
        values.add(v);
        break;
      }
    }
  }
  // Si los desvíos no alcanzaron, cualquier piedra que ya tenga tarjeta sirve.
  for (let v = 0; v < length && values.size < wanted; v++) values.add(v);

  const tiles = [...values].map((value, i) => ({
    id: `t${i}`,
    value,
    correct: gaps.includes(value),
  }));
  return rnd.shuffle(tiles);
}

/**
 * Los dos recorridos de `explain`. El honesto pisa todas las piedras; el que
 * miente da saltos de distinto tamaño y en algún momento cae entre dos, que es
 * exactamente lo que el jugador tiene que señalar.
 */
function compareWalks(flag: number, rnd: Random): number[][] {
  const honest: number[] = [];
  for (let i = 0; i <= flag; i++) honest.push(i);

  const sizes = [1, 1.5, 2, 2.5];
  const liar: number[] = [0];
  let at = 0;
  while (at < flag - 1) {
    at = Math.min(flag - 1, at + (sizes[rnd.int(0, sizes.length - 1)] as number));
    liar.push(at);
  }
  liar.push(flag);
  // Sin una caída al agua no hay nada que señalar, así que se garantiza una.
  if (liar.every((x) => Number.isInteger(x))) liar.splice(1, 0, 0.5);

  return [honest, liar];
}

export const pathLevelByNumber = (n: number): PathLevel | undefined => PATH_LEVELS.find((l) => l.n === n);
export const TOTAL_PATH_LEVELS = PATH_LEVELS.length;

registerNode({
  id: NODE,
  n: 2,
  prereqs: ["found.count.cardinality"],
  levels: PATH_LEVELS,
});
