/**
 * El viaje de dos tramos, para `arith.add.displacement`.
 *
 * Los siete niveles y qué endurece cada parámetro salen del documento del
 * minijuego y de `F-minijuegos/minigames.yaml`, no de acá: este archivo los
 * implementa, no los decide.
 *
 * La idea que sostiene todo: los dos números no hacen lo mismo. El primero es
 * una piedra y el segundo es un tramo. Por eso el segundo número entra por la
 * manivela —donde se pone un tope, no una posición— y por eso el viaje se puede
 * deshacer girando al revés: si la llegada fuera un botón, no se podría.
 *
 * La manivela es la misma pieza del nodo 2: `crankStep` y `TEETH_PER_TURN` se
 * importan de ahí en vez de escribirse otra vez, porque un diente que midiera
 * distinto en dos nodos rompería el invariante que los dos enseñan.
 *
 * Sin texto visible: el nodo es `literacy: none` y acá solo hay claves y datos.
 */

import { makeRandom, type Random } from "./random.ts";
import { registerNode, type LevelBase } from "./node.ts";
import { crankStep } from "./number-line.ts";
import type { Evidence, Layer } from "./one-step.ts";

/** El nodo del grafo que este minijuego enseña. */
export const NODE = "arith.add.displacement";

/**
 * El mismo id, sin ambigüedad. `index.ts` reúne los minijuegos con `export *` y
 * cada uno declara su propio `NODE`, así que afuera del módulo se lo nombra así.
 */
export const NODE_ADD_DISPLACEMENT = NODE;

/** Las piedras del camino, las marcas de la recta, o dibujos sin numeral. */
export type TrackSkin = "stone" | "mark" | "arbitrary";

/**
 * Qué hace el jugador en el nivel. No es dificultad: es qué gesto contesta la
 * pregunta del nivel.
 *
 * - `walk`: soltar la ficha sobre la manivela y girar el tramo entero.
 * - `predict`: tocar la piedra de llegada antes de que la manivela gire.
 * - `chain`: dos tramos seguidos, con el libro anotando una fila por tramo.
 * - `row`: la pista ya no está; queda el renglón y hay que completarlo.
 */
export type TripMode = "walk" | "predict" | "chain" | "row";

/** Qué queda tapado en el renglón: la llegada, o uno de los dos tramos. */
export type Unknown = "none" | "addend";

export interface TripParams {
  /** La piedra donde empieza el caminante, entre estas dos. */
  readonly start: readonly [number, number];
  /** Cuántos tramos tiene el viaje. */
  readonly legs: readonly [number, number];
  /** Cuánto mide un tramo. */
  readonly stepRange: readonly [number, number];
  /** Un tramo de cero: la manivela gira y el caminante no se mueve. */
  readonly allowZeroStep: boolean;
  readonly unknown: Unknown;
}

export interface TripLevel extends LevelBase {
  readonly params: TripParams;
  readonly mode: TripMode;
  readonly skin: TrackSkin;
  /** El libro de cuentas, con una fila por tramo. */
  readonly ledger: boolean;
  /** El toque sostenido que intercambia las filas: el gesto de la conmutatividad. */
  readonly swap: boolean;
  /** La flecha con cola y punta, que se despega del tramo y conserva el largo. */
  readonly arrow: boolean;
  /** El renglón `3 + 2 = 5`, con la recta a pedido. */
  readonly row: boolean;
  /** Después del viaje hay que elegir la ficha que lo haría de un solo giro. */
  readonly pickTotal: boolean;
  /** Las dos animaciones de `explain`: una de ellas trata la llegada como botón. */
  readonly explain: boolean;
}

/**
 * Los siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca
 * las dos cosas: el 4 y el 5 solo cambian de capa, y el 6 y el 7 solo aprietan
 * los números. Lo que no es dificultad —el modo, la piel de la pista, el libro,
 * la flecha, el renglón— vive afuera de `params` justamente para que la regla se
 * pueda comprobar.
 */
export const TRIP_LEVELS: readonly TripLevel[] = [
  {
    n: 1,
    titleKey: "level.oneJump",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 4,
    params: {
      start: [0, 0],
      legs: [1, 1],
      stepRange: [2, 4],
      allowZeroStep: false,
      unknown: "none",
    },
    mode: "walk",
    skin: "stone",
    ledger: true,
    swap: false,
    arrow: false,
    row: false,
    pickTotal: false,
    explain: false,
  },
  {
    n: 2,
    titleKey: "level.guessBeforeTurning",
    layer: "concrete",
    evidence: ["recognize"],
    rounds: 4,
    params: {
      // Lo único que se aprieta es de dónde sale el caminante: en el nivel 1 la
      // partida es siempre la orilla, así que la llegada y el tramo coinciden y
      // el jugador puede acertar sin sumar nada.
      start: [0, 5],
      legs: [1, 1],
      stepRange: [2, 4],
      allowZeroStep: false,
      unknown: "none",
    },
    mode: "predict",
    skin: "stone",
    ledger: true,
    swap: false,
    arrow: false,
    row: false,
    pickTotal: false,
    explain: false,
  },
  {
    n: 3,
    titleKey: "level.twoLegsAndTheLedger",
    layer: "concrete",
    evidence: ["manipulate", "explain"],
    rounds: 3,
    params: {
      start: [0, 5],
      legs: [2, 2],
      stepRange: [2, 4],
      allowZeroStep: false,
      unknown: "none",
    },
    mode: "chain",
    skin: "stone",
    ledger: true,
    swap: true,
    arrow: false,
    row: false,
    pickTotal: false,
    explain: true,
  },
  {
    n: 4,
    titleKey: "level.theArrow",
    layer: "visual",
    evidence: ["manipulate", "apply"],
    rounds: 4,
    params: {
      start: [0, 5],
      legs: [2, 2],
      stepRange: [2, 4],
      allowZeroStep: false,
      unknown: "none",
    },
    mode: "chain",
    skin: "mark",
    ledger: true,
    swap: true,
    arrow: true,
    row: false,
    pickTotal: true,
    explain: false,
  },
  {
    n: 5,
    titleKey: "level.theRow",
    layer: "symbolic",
    evidence: ["apply"],
    rounds: 4,
    params: {
      start: [0, 5],
      legs: [2, 2],
      stepRange: [2, 4],
      allowZeroStep: false,
      unknown: "none",
    },
    mode: "row",
    skin: "mark",
    ledger: false,
    swap: false,
    arrow: true,
    row: true,
    pickTotal: false,
    explain: false,
  },
  {
    n: 6,
    titleKey: "level.bigNumbersAndZero",
    layer: "symbolic",
    evidence: ["apply"],
    rounds: 4,
    params: {
      start: [0, 9],
      legs: [2, 3],
      stepRange: [0, 12],
      allowZeroStep: true,
      unknown: "none",
    },
    mode: "row",
    skin: "mark",
    ledger: false,
    swap: false,
    arrow: true,
    row: true,
    pickTotal: false,
    explain: false,
  },
  {
    n: 7,
    titleKey: "level.theMissingLeg",
    layer: "symbolic",
    evidence: ["apply"],
    rounds: 4,
    params: {
      start: [0, 9],
      legs: [2, 3],
      stepRange: [0, 12],
      allowZeroStep: true,
      unknown: "addend",
    },
    mode: "row",
    skin: "arbitrary",
    ledger: false,
    swap: false,
    arrow: true,
    row: true,
    pickTotal: false,
    explain: false,
  },
];

/**
 * Por qué una ficha está en el cajón, si no es la que hay que usar. Solo
 * `equals_as_operator` tiene entrada en el catálogo de L apuntando a este nodo;
 * las otras dos son errores que el diseño prevé, que no clasifican y que por eso
 * nunca viajan en un `attempt`.
 */
export type ChipLure =
  /** La llegada puesta donde va un tramo: el doble trazo leído como botón. */
  | "equals_as_operator"
  /** Contar la piedra de partida, o la de la unión, una vez de más o de menos. */
  | "off_by_one"
  /** "El resultado es una de las dos fichas": lo que rompen los tres tramos. */
  | "answer_is_an_addend";

/** Una ficha del cajón. Se suelta sobre la manivela, o se elige como respuesta. */
export interface Chip {
  readonly id: string;
  readonly value: number;
  /** Si sirve para lo que el nivel pide: hacer los tramos, o contestar. */
  readonly correct: boolean;
  readonly lure?: ChipLure;
}

export interface Trip {
  /** La piedra de partida. */
  readonly start: number;
  /** Los tramos, en el orden en que el enunciado los ofrece. */
  readonly steps: readonly number[];
  /** La piedra de llegada: la suma. */
  readonly arrival: number;
  /** Cuántas piedras se dibujan. El valor de una piedra es su índice. */
  readonly length: number;
  /** La bandera, que en este nodo siempre está en la llegada. */
  readonly flag: number;
  readonly tiles: readonly Chip[];
  /** Qué número contesta la ronda: la llegada, o el tramo que falta. */
  readonly answer: number;
  /** El tramo tapado en el renglón, o -1 cuando no hay ninguno. */
  readonly hidden: number;
  /** Cuál de las dos animaciones de `explain` trata la llegada como botón. */
  readonly liar: number;
  /** Las fichas llevan numeral, o son dibujos arbitrarios. */
  readonly numerals: boolean;
}

/** Cuántas fichas tiene el cajón como mucho. */
export const CHIP_SLOTS = 6;

/** Techo de piedras dibujadas: más allá la recta deja de poder leerse. */
export const MAX_TRACK = 30;

/** La suma de los tramos: cuánto avanza el viaje entero. */
export const legsTotal = (steps: readonly number[]): number =>
  steps.reduce((a, b) => a + b, 0);

/**
 * Dónde cae el caminante al girar la manivela con un tope de `teeth` dientes.
 * Es la misma cuenta del nodo 2, y a propósito: un tirón de tres dientes tiene
 * que dejar al caminante donde lo dejarían tres tirones de uno.
 */
export const jumpWith = (from: number, teeth: number, length: number): number =>
  crankStep(from, teeth, length);

/** Genera un viaje del nivel dado. La semilla lo hace reproducible. */
export function generateTrip(level: TripLevel, seed: number): Trip {
  const rnd = makeRandom(seed);
  const p = level.params;

  const start = rnd.int(p.start[0], p.start[1]);
  const steps = pickSteps(level, MAX_TRACK - 2 - start, rnd);
  const arrival = start + legsTotal(steps);
  // Un colchón después de la bandera: si la pista terminara justo en la llegada,
  // pasarse sería imposible y el error dejaría de poder cometerse.
  const length = Math.min(MAX_TRACK, arrival + rnd.int(1, 3) + 1);

  const hidden = p.unknown === "addend" ? pickHidden(steps, rnd) : -1;
  const answer = answerOf(level, steps, arrival, hidden);

  return {
    start,
    steps,
    arrival,
    length,
    flag: arrival,
    tiles: makeChips(level, steps, arrival, answer, hidden, rnd),
    answer,
    hidden,
    liar: rnd.bool() ? 0 : 1,
    // Los dibujos arbitrarios solo aparecen en el nivel que separa la estructura
    // de los numerales, y ni siquiera en todas sus instancias.
    numerals: level.skin === "arbitrary" ? rnd.bool() : true,
  };
}

/**
 * Los tramos. `budget` es lo que queda de pista después de la partida, y no es
 * un detalle de dibujo: una bandera fuera de la pista sería una llegada que el
 * jugador no puede tocar.
 *
 * Con el cero habilitado se garantiza que no todos los tramos lo sean: un viaje
 * que no se mueve no tiene nada que mostrar, y el caso del `0` se ve justamente
 * contra un tramo que sí avanza.
 */
function pickSteps(level: TripLevel, budget: number, rnd: Random): number[] {
  const p = level.params;
  const lo = p.allowZeroStep ? p.stepRange[0] : Math.max(1, p.stepRange[0]);
  const count = rnd.int(p.legs[0], p.legs[1]);
  const steps: number[] = [];
  let used = 0;
  for (let i = 0; i < count; i++) {
    const queda = budget - used - (count - 1 - i) * lo;
    const hi = Math.max(lo, Math.min(p.stepRange[1], queda));
    const s = rnd.int(lo, hi);
    steps.push(s);
    used += s;
  }
  if (used === 0) {
    const i = rnd.int(0, count - 1);
    steps.splice(i, 1, Math.max(1, Math.min(p.stepRange[1], budget)));
  }
  return steps;
}

/** Cuál de los tramos se tapa. Nunca uno de cero: un hueco de cero no pregunta nada. */
function pickHidden(steps: readonly number[], rnd: Random): number {
  const candidatos = steps.map((s, i) => (s > 0 ? i : -1)).filter((i) => i >= 0);
  return candidatos.length === 0 ? 0 : (rnd.pick(candidatos) as number);
}

/**
 * Qué número contesta la ronda, que no es el mismo en todos los niveles.
 *
 * En el renglón con hueco es el tramo tapado; en el renglón entero, la llegada;
 * en el nivel de la flecha, el tramo único que haría el viaje de un solo giro,
 * que no es la llegada salvo que se salga de la orilla; y en los que se caminan,
 * la piedra de llegada.
 */
function answerOf(
  level: TripLevel,
  steps: readonly number[],
  arrival: number,
  hidden: number,
): number {
  if (hidden >= 0) return steps[hidden] as number;
  if (level.pickTotal) return legsTotal(steps);
  return arrival;
}

/**
 * El cajón. Las fichas equivocadas no son ruido: cada una es un error del
 * diseño. La de la llegada puesta donde va un tramo es `equals_as_operator`, la
 * única que el catálogo de L declara para este nodo.
 */
function makeChips(
  level: TripLevel,
  steps: readonly number[],
  arrival: number,
  answer: number,
  hidden: number,
  rnd: Random,
): Chip[] {
  // En el nivel que anticipa, el tope ya está puesto en la manivela y lo que se
  // toca es una piedra: un cajón sería una segunda manera de contestar.
  if (level.mode === "predict") return [];

  const lures = new Map<number, ChipLure>();
  const correctas = new Set<number>();
  const add = (value: number, lure: ChipLure): void => {
    if (value < 0 || value > MAX_TRACK || correctas.has(value)) return;
    if (!lures.has(value)) lures.set(value, lure);
  };

  if (level.mode === "row") {
    correctas.add(answer);
    if (hidden >= 0) {
      // El error del nodo: contestar con la llegada, como si el doble trazo
      // mandara ejecutar en vez de decir dónde terminó el viaje.
      add(arrival, "equals_as_operator");
    }
    // "El resultado es una de las dos fichas", que es lo que rompen tres tramos.
    for (const s of steps) add(s, "answer_is_an_addend");
  } else {
    // Los tramos que el viaje necesita, y en el nivel de la flecha también el
    // tramo único: hacer el viaje de un tirón es una manera legítima de hacerlo.
    for (const s of steps) correctas.add(s);
    if (level.pickTotal) correctas.add(answer);
  }

  add(answer + 1, "off_by_one");
  add(answer - 1, "off_by_one");
  for (const s of steps) {
    add(s + 1, "off_by_one");
    add(s - 1, "off_by_one");
  }

  const chips: Chip[] = [...correctas].map((value, i) => ({
    id: `c${i}`,
    value,
    correct: true,
  }));
  for (const [value, lure] of lures) {
    if (chips.length >= CHIP_SLOTS) break;
    chips.push({ id: `c${chips.length}`, value, correct: false, lure });
  }
  return rnd.shuffle(chips);
}

export const tripLevelByNumber = (n: number): TripLevel | undefined =>
  TRIP_LEVELS.find((l) => l.n === n);
export const TOTAL_TRIP_LEVELS = TRIP_LEVELS.length;

/** Las capas y los verbos que el nodo recorre, para que un test los afirme. */
export const TRIP_LAYERS: readonly Layer[] = ["concrete", "visual", "symbolic"];
export const TRIP_EVIDENCE: readonly Evidence[] = [
  "manipulate",
  "recognize",
  "explain",
  "apply",
];

registerNode({
  id: NODE,
  n: 3,
  prereqs: ["found.count.number_line"],
  levels: TRIP_LEVELS,
});
