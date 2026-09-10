/**
 * El ascensor y el caminante, para `arith.int.negatives`.
 *
 * Los ocho niveles y qué endurece cada parámetro salen del documento del
 * minijuego y de `F-minijuegos/minigames.yaml`, no de acá: este archivo los
 * implementa, no los decide.
 *
 * La idea que sostiene todo: el cero deja de ser el borde de la pista y pasa a
 * ser un punto con dos lados. Por eso una casilla no se guarda por su nombre
 * sino por su índice, y el nombre se calcula restándole el índice de la calle:
 * mudar el cero es cambiar un número y nada más. Que ninguna distancia cambie
 * al mudarlo no es una comprobación que el código hace, es que no se puede
 * expresar de otra manera, y esa imposibilidad es el contenido del nivel 7.
 *
 * El paso es el mismo de los dos lados: `negWalk` suma dientes enteros sin
 * mirar el signo de la casilla, así que la pista no se estira ni se comprime al
 * cruzar. Ese es `same_step_every_turn`.
 *
 * Sin texto visible: acá solo hay claves y datos.
 */

import { makeRandom, type Random } from "./random.ts";
import { registerNode, type LevelBase } from "./node.ts";
import type { Evidence, Layer } from "./one-step.ts";

/** El nodo del grafo que este minijuego enseña. */
export const NODE = "arith.int.negatives";

/**
 * El mismo id, sin ambigüedad. `index.ts` reúne los minijuegos con `export *` y
 * cada uno declara su propio `NODE`, así que afuera del módulo se lo nombra así.
 */
export const NODE_NEGATIVES = NODE;

/**
 * El único error del catálogo de L cuya regla `detect` apunta a este nodo. Está
 * escrito como constante porque un id inventado no clasifica nada.
 */
export const MIS_DOUBLE_FLIP = "negative_times_negative";

/**
 * Qué hace el jugador en el nivel. No es dificultad: es qué gesto contesta la
 * pregunta del nivel.
 *
 * - `cross`: girar la manivela hasta pasar el cero y llegar a la casilla.
 * - `floor`: con el tope ya puesto, tocar la casilla donde va a terminar.
 * - `ledger`: arrastrar monedas y vales al tablero hasta que el neto sea el pedido.
 * - `turn`: elegir cuál de las dos vueltas dobles miente, y después caminar.
 * - `compare`: arrastrar a la caja la ficha del piso que está más abajo.
 * - `distance`: elegir la ficha que dice cuántos pisos separan dos paradas.
 * - `moveZero`: mudar la calle y volver a comparar con los nombres nuevos.
 * - `arbitrary`: tocar el dibujo al que lleva una ficha de dirección sin numerales.
 */
export type NegMode =
  | "cross"
  | "floor"
  | "ledger"
  | "turn"
  | "compare"
  | "distance"
  | "moveZero"
  | "arbitrary";

/** Casillas y monedas, marcas y fichas huecas, numeral con trazo, o dibujos. */
export type NegSkin = "stone" | "mark" | "sign" | "drawing";

/** El edificio a la vista, a pedido de un toque, o ya retirado. */
export type NegBuilding = "none" | "shown" | "onDemand";

export interface NegParams {
  /** Cuántas casillas hay a cada lado del cero. */
  readonly range: number;
  /** El tramo de un tirón, y también el tamaño de las monedas y los vales. */
  readonly step: readonly [number, number];
  /** La calle deja de estar en el medio: el cero es una decisión, no un lugar. */
  readonly zeroOffset: boolean;
  /** Las dos fichas de piso pueden caer las dos abajo del cero. */
  readonly bothBelow: boolean;
}

export interface NegLevel extends LevelBase {
  readonly params: NegParams;
  readonly mode: NegMode;
  readonly skin: NegSkin;
  readonly building: NegBuilding;
  /** El tablero de monedas y vales está en pantalla. */
  readonly board: boolean;
  /** Hay numerales: hasta el nivel 4 no aparece ninguno. */
  readonly numerals: boolean;
  /** El toque que da vuelta al caminante sin moverlo. */
  readonly flip: boolean;
  /** Las dos animaciones de la vuelta doble, que es donde clasifica el error. */
  readonly explain: boolean;
}

/**
 * Los ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca
 * las dos cosas: el 4, el 5 y el 8 solo cambian de capa y por eso conservan los
 * parámetros del anterior; el 6 y el 7 solo aprietan los números.
 *
 * Lo que no es dificultad —el modo, la piel, el edificio, el tablero, los
 * numerales— vive afuera de `params` justamente para que la regla se pueda
 * comprobar: entra el ascensor en el 2 y el tablero en el 3 sin que ningún
 * número se endurezca.
 */
export const NEG_LEVELS: readonly NegLevel[] = [
  {
    n: 1,
    titleKey: "level.crossZero",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 4,
    params: { range: 3, step: [1, 3], zeroOffset: false, bothBelow: false },
    mode: "cross",
    skin: "stone",
    building: "none",
    board: false,
    numerals: false,
    flip: false,
    explain: false,
  },
  {
    n: 2,
    titleKey: "level.theElevator",
    layer: "concrete",
    evidence: ["recognize"],
    rounds: 4,
    params: { range: 3, step: [1, 3], zeroOffset: false, bothBelow: false },
    mode: "floor",
    skin: "stone",
    building: "shown",
    board: false,
    numerals: false,
    flip: false,
    explain: false,
  },
  {
    n: 3,
    titleKey: "level.coinsAndVouchers",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 3,
    params: { range: 3, step: [1, 3], zeroOffset: false, bothBelow: false },
    mode: "ledger",
    skin: "stone",
    building: "shown",
    board: true,
    numerals: false,
    flip: false,
    explain: false,
  },
  {
    n: 4,
    titleKey: "level.arrowsAndStairs",
    layer: "visual",
    evidence: ["explain", "manipulate"],
    rounds: 3,
    params: { range: 3, step: [1, 3], zeroOffset: false, bothBelow: false },
    mode: "turn",
    skin: "mark",
    building: "shown",
    board: false,
    numerals: false,
    flip: true,
    explain: true,
  },
  {
    n: 5,
    titleKey: "level.chipsBeside",
    layer: "symbolic",
    evidence: ["manipulate", "apply"],
    rounds: 4,
    params: { range: 3, step: [1, 3], zeroOffset: false, bothBelow: false },
    mode: "compare",
    skin: "sign",
    building: "shown",
    board: false,
    numerals: true,
    flip: false,
    explain: false,
  },
  {
    n: 6,
    titleKey: "level.noBuilding",
    layer: "symbolic",
    evidence: ["apply"],
    rounds: 4,
    params: { range: 20, step: [1, 9], zeroOffset: false, bothBelow: false },
    mode: "distance",
    skin: "sign",
    building: "onDemand",
    board: false,
    numerals: true,
    flip: false,
    explain: false,
  },
  {
    n: 7,
    titleKey: "level.theStreetMoves",
    layer: "symbolic",
    evidence: ["apply"],
    rounds: 4,
    params: { range: 20, step: [1, 9], zeroOffset: true, bothBelow: true },
    mode: "moveZero",
    skin: "sign",
    building: "onDemand",
    board: false,
    numerals: true,
    flip: false,
    explain: false,
  },
  {
    n: 8,
    titleKey: "level.directionsNeverSeen",
    layer: "formal",
    evidence: ["generalize"],
    rounds: 3,
    params: { range: 20, step: [1, 9], zeroOffset: true, bothBelow: true },
    mode: "arbitrary",
    skin: "drawing",
    building: "none",
    board: false,
    numerals: false,
    flip: false,
    explain: false,
  },
];

/**
 * Por qué una ficha está en el cajón, si no es la que hay que usar. Ninguna
 * tiene entrada en el catálogo de L apuntando a este nodo, así que ninguna
 * viaja en un `attempt`: se muestran y no se anotan.
 */
export type NegLure =
  /** La casilla simétrica del otro lado: el signo leído como decoración. */
  | "mirror"
  /** El piso de al lado: puntería, no una idea equivocada. */
  | "neighbor"
  /** Ordenar por tamaño y no por posición. */
  | "size_not_place"
  /** Restar los tamaños en vez de sumarlos al cruzar el cero. */
  | "sign_as_decoration";

/** Una moneda (positiva) o un vale de deuda (negativo). El módulo es el tamaño. */
export interface NegToken {
  readonly id: string;
  readonly value: number;
}

/** Una ficha: un piso, una distancia, o una respuesta del cajón. */
export interface NegChip {
  readonly id: string;
  readonly value: number;
  readonly correct: boolean;
  readonly lure?: NegLure;
}

/** La fila de dibujos sin numerales, con su origen marcado. */
export interface NegRow {
  readonly length: number;
  /** En qué dibujo de la fila cae el origen marcado. */
  readonly origin: number;
  /** Hacia el lado de la flecha (`1`) o hacia el otro (`-1`). */
  readonly dir: number;
  /** Cuántos pasos, dados por repetición de un ícono y no por un numeral. */
  readonly steps: number;
}

export interface NegProblem {
  readonly mode: NegMode;
  /** Cuántas casillas dibuja la pista, y cuántos pisos el edificio. */
  readonly slots: number;
  /** El índice de la calle. El nombre de una casilla es su índice menos esto. */
  readonly zeroAt: number;
  /** A qué índice hay que mudar la calle, o `null` si no se muda. */
  readonly moveTo: number | null;
  /** Dónde arranca el caminante, en índices. */
  readonly start: number;
  /** La casilla de la bandera, en índices. */
  readonly target: number;
  /** El tramo del tirón, con signo. Negativo es hacia la izquierda. */
  readonly step: number;
  /** El cajón de monedas y vales. */
  readonly tokens: readonly NegToken[];
  /** El neto que el tablero tiene que mostrar. */
  readonly netTarget: number;
  /** Las dos paradas, en índices. */
  readonly floors: readonly [number, number];
  readonly chips: readonly NegChip[];
  /**
   * Qué contesta la ronda, y no es lo mismo en todos los modos: una casilla en
   * `cross`, `floor` y `turn`; el neto en `ledger`; el nombre del piso más bajo
   * en `compare` y `moveZero`; los pisos de diferencia en `distance`; y el
   * dibujo de la fila en `arbitrary`.
   */
  readonly answer: number;
  /** Cuál de las dos vueltas dobles miente: la que sigue mirando hacia atrás. */
  readonly liar: number;
  readonly row: NegRow;
}

/** Cuántos dibujos tiene la fila del último nivel. */
export const NEG_ROW_LENGTH = 7;

/** Cuántas fichas entran en el cajón. */
export const NEG_CHIP_SLOTS = 5;

/** Cuántas monedas y vales entran en la bandeja. */
export const NEG_TOKEN_SLOTS = 6;

// --- El modelo ---------------------------------------------------------------

/**
 * El nombre de una casilla. Es lo único que cambia al mudar la calle, y por eso
 * el resto del modelo trabaja con índices: las distancias no se enteran.
 */
export const negNameAt = (index: number, zeroAt: number): number => index - zeroAt;

/**
 * A qué casilla lleva la manivela. Los dientes son enteros y se suman igual de
 * los dos lados del cero: eso es `same_step_every_turn`. El tope es el borde de
 * lo dibujado, no el cero.
 */
export const negWalk = (from: number, teeth: number, slots: number): number =>
  Math.max(0, Math.min(slots - 1, Math.trunc(from) + Math.trunc(teeth)));

/**
 * El opuesto: la misma distancia al cero, del otro lado. El `0` se devuelve
 * entero y no como `-0`, porque el cero es el único sin lado y el trazo del
 * signo se dibuja mirando este número.
 */
export const negOpposite = (n: number): number => (n === 0 ? 0 : -n);

/** Dos vueltas devuelven la dirección original, y por eso el opuesto del opuesto. */
export const negFacingAfter = (facing: number, turns: number): number =>
  turns % 2 === 0 ? facing : -facing;

/** La distancia entre dos pisos, que no depende de cuál se llame cero. */
export const negDistance = (a: number, b: number): number => Math.abs(a - b);

/** El neto del tablero: lo que queda sin pareja. Agregar pares no lo mueve. */
export const negNet = (tokens: readonly NegToken[]): number =>
  tokens.reduce((a, t) => a + t.value, 0);

// --- El generador ------------------------------------------------------------

/** Genera una instancia del nivel dado. La semilla la hace reproducible. */
export function generateNegatives(level: NegLevel, seed: number): NegProblem {
  const rnd = makeRandom(seed);
  const p = level.params;
  const slots = 2 * p.range + 1;
  const zeroAt = p.range;

  const viaje = plan(level, slots, zeroAt, rnd);
  const moveTo = p.zeroOffset && level.mode === "moveZero" ? pickStreet(zeroAt, p.range, rnd) : null;
  const zeroFinal = moveTo ?? zeroAt;
  const floors = pickFloors(level, slots, zeroFinal, rnd);
  const ledger = makeLedger(level, rnd);
  const row = makeRow(level, rnd);

  const answer = answerOf(level, viaje.target, floors, zeroFinal, ledger.netTarget, row);

  return {
    mode: level.mode,
    slots,
    zeroAt,
    moveTo,
    start: viaje.start,
    target: viaje.target,
    step: viaje.target - viaje.start,
    tokens: ledger.tokens,
    netTarget: ledger.netTarget,
    floors,
    chips: makeChips(level, floors, zeroFinal, answer, rnd),
    answer,
    // El que miente no puede estar siempre en la misma fila: si estuviera, el
    // jugador acertaría sin mirar la animación.
    liar: rnd.bool() ? 0 : 1,
    row,
  };
}

interface NegWalkPlan {
  readonly start: number;
  readonly target: number;
}

/**
 * El viaje. Sale siempre del lado derecho —o del cero, cuando el nivel pide que
 * la ficha caiga sobre la manivela— y termina del izquierdo: sin cruce no hay
 * nada que aprender, porque la pista de la derecha ya la sabe caminar.
 */
function plan(level: NegLevel, slots: number, zeroAt: number, rnd: Random): NegWalkPlan {
  const p = level.params;
  const alcance = Math.min(p.range, p.step[1]);
  if (level.mode === "floor") {
    // La ficha negativa cae sobre la manivela con el caminante en el cero: es
    // el ítem de `recognize` tal como lo pide el diseño.
    return { start: zeroAt, target: zeroAt - rnd.int(1, alcance) };
  }
  if (level.mode !== "cross" && level.mode !== "turn") {
    return { start: zeroAt, target: zeroAt };
  }
  const start = zeroAt + rnd.int(1, p.range);
  const target = zeroAt - rnd.int(1, alcance);
  return { start, target: Math.max(0, Math.min(slots - 1, target)) };
}

/** A qué altura se muda la calle. Nunca a la misma: mudarla a donde está no pregunta nada. */
function pickStreet(zeroAt: number, range: number, rnd: Random): number {
  const salto = rnd.int(1, Math.max(1, Math.floor(range / 3)));
  return rnd.bool() ? zeroAt + salto : zeroAt - salto;
}

/**
 * Las dos paradas. Una arriba y otra abajo del cero mientras el nivel no pida
 * otra cosa; con `bothBelow`, las dos abajo, que es donde el orden invertido
 * duele porque el numeral más grande nombra el piso más chico.
 */
function pickFloors(
  level: NegLevel,
  slots: number,
  zero: number,
  rnd: Random,
): readonly [number, number] {
  const p = level.params;
  const alcance = Math.max(1, Math.min(p.step[1], p.range));
  if (p.bothBelow && level.mode === "moveZero" && zero >= 2) {
    const hondo = Math.max(1, Math.min(zero, alcance + 1));
    const a = zero - rnd.int(1, hondo);
    let b = zero - rnd.int(1, hondo);
    if (b === a) b = a - 1 >= 0 ? a - 1 : a + 1;
    return rnd.bool() ? [a, b] : [b, a];
  }
  const arriba = Math.min(slots - 1, zero + rnd.int(1, alcance));
  const abajo = Math.max(0, zero - rnd.int(1, alcance));
  return rnd.bool() ? [arriba, abajo] : [abajo, arriba];
}

/**
 * Qué contesta la ronda. En `compare` y `moveZero` es el nombre del piso más
 * bajo, que con la calle mudada es un nombre nuevo para el mismo piso; en
 * `distance`, los pisos que separan las dos paradas, que no cambian nunca.
 */
function answerOf(
  level: NegLevel,
  target: number,
  floors: readonly [number, number],
  zero: number,
  netTarget: number,
  row: NegRow,
): number {
  switch (level.mode) {
    case "ledger":
      return netTarget;
    case "compare":
    case "moveZero":
      return negNameAt(Math.min(floors[0], floors[1]), zero);
    case "distance":
      return negDistance(floors[0], floors[1]);
    case "arbitrary":
      return negRowAnswer(row);
    default:
      return target;
  }
}

/**
 * El cajón. En los modos que comparan, las fichas son los dos pisos y lo que se
 * elige es cuál va a la caja; en el que mide, son números y la equivocada más
 * cara es restar los tamaños en vez de sumarlos al cruzar el cero.
 */
function makeChips(
  level: NegLevel,
  floors: readonly [number, number],
  zero: number,
  answer: number,
  rnd: Random,
): NegChip[] {
  if (level.mode === "compare" || level.mode === "moveZero") {
    const bajo = Math.min(floors[0], floors[1]);
    return floors.map((f, i) => ({
      id: `f${i}`,
      value: negNameAt(f, zero),
      correct: f === bajo,
      // Ordenar por tamaño y no por posición: el juego lo dibuja y no lo anota.
      ...(f === bajo ? {} : { lure: "size_not_place" as NegLure }),
    }));
  }
  if (level.mode !== "distance") return [];

  const a = negNameAt(floors[0], zero);
  const b = negNameAt(floors[1], zero);
  const chips: NegChip[] = [{ id: "c0", value: answer, correct: true }];
  const vistos = new Set<number>([answer]);
  const add = (value: number, lure: NegLure): void => {
    if (value < 0 || vistos.has(value) || chips.length >= NEG_CHIP_SLOTS) return;
    vistos.add(value);
    chips.push({ id: `c${chips.length}`, value, correct: false, lure });
  };
  // Tratar el signo como decoración: restar los tamaños en vez de sumarlos.
  add(Math.abs(Math.abs(a) - Math.abs(b)), "sign_as_decoration");
  add(Math.abs(a), "mirror");
  add(Math.abs(b), "mirror");
  for (const d of rnd.shuffle([1, -1, 2])) add(answer + d, "neighbor");
  return rnd.shuffle(chips);
}

/**
 * El tablero. El neto pedido es siempre una deuda, porque un neto positivo se
 * consigue sin mirar los vales. Los vales que lo consiguen están garantizados,
 * y además hay una moneda y un vale del mismo tamaño: tirarlos juntos no mueve
 * el neto, que es `count_preserved_under_regrouping` en un solo gesto.
 */
function makeLedger(level: NegLevel, rnd: Random): {
  tokens: readonly NegToken[];
  netTarget: number;
} {
  if (!level.board) return { tokens: [], netTarget: 0 };
  const maxSize = Math.max(1, Math.min(3, level.params.step[1]));
  const netTarget = -rnd.int(1, Math.min(4, maxSize + 1));
  const falta = -netTarget;

  const vales: number[] = [];
  // Un vale de cero no es un vale: cuando la deuda entra en uno solo y no se
  // puede partir en dos, va entero.
  if (falta === 1 || (falta <= maxSize && rnd.bool())) {
    vales.push(falta);
  } else {
    const primero = Math.max(1, Math.min(maxSize, falta - 1));
    vales.push(primero, falta - primero);
  }

  const par = rnd.int(1, maxSize);
  const valores = [...vales.map((v) => -v), par, -par, rnd.int(1, maxSize)];
  const tokens = rnd
    .shuffle(valores)
    .slice(0, NEG_TOKEN_SLOTS)
    .map((value, i) => ({ id: `t${i}`, value }));
  return { tokens, netTarget };
}

/**
 * La fila de dibujos con su origen marcado. No lleva ningún numeral: los pasos
 * se dicen repitiendo un ícono y el lado, con una flecha. Es la pista que
 * prueba que la dirección se entendió sin la pista graduada.
 */
function makeRow(level: NegLevel, rnd: Random): NegRow {
  if (level.mode !== "arbitrary") {
    return { length: NEG_ROW_LENGTH, origin: 0, dir: 1, steps: 0 };
  }
  const origin = rnd.int(1, NEG_ROW_LENGTH - 2);
  const dir = rnd.bool() ? 1 : -1;
  const margen = dir > 0 ? NEG_ROW_LENGTH - 1 - origin : origin;
  const steps = rnd.int(1, Math.max(1, Math.min(3, margen)));
  return { length: NEG_ROW_LENGTH, origin, dir, steps };
}

/** El dibujo al que lleva la ficha de dirección. */
export const negRowAnswer = (row: NegRow): number => row.origin + row.dir * row.steps;

export const negLevelByNumber = (n: number): NegLevel | undefined =>
  NEG_LEVELS.find((l) => l.n === n);
export const TOTAL_NEG_LEVELS = NEG_LEVELS.length;

/** Las capas y los verbos que el nodo recorre, para que un test los afirme. */
export const NEG_LAYERS: readonly Layer[] = ["concrete", "visual", "symbolic", "formal"];
export const NEG_EVIDENCE: readonly Evidence[] = [
  "manipulate",
  "recognize",
  "explain",
  "apply",
  "generalize",
];

registerNode({
  id: NODE,
  n: 7,
  prereqs: ["arith.sub.undo_add"],
  levels: NEG_LEVELS,
});
