/**
 * Cofres dentro de cofres, para `arith.expr.precedence_tree`.
 *
 * Los ocho niveles y qué endurece cada parámetro salen del documento del
 * minijuego y de `D1/09`, no de acá: este archivo los implementa, no los decide.
 *
 * La idea que sostiene todo: una expresión no es una fila que se lee de
 * izquierda a derecha, es un encastre. Por eso la expresión vive como el árbol
 * de `@mathy/math-core` y no como una cadena: cada cofre **es** un nodo del
 * árbol, con la identidad estable que ese paquete garantiza, y la fila escrita
 * es solo una de sus vistas. Tocar un paréntesis y tocar la pared de un cofre
 * devuelven el mismo id, que es lo que permite que el árbol y los cofres laten
 * juntos sin que nadie los sincronice.
 *
 * La otra idea es la simetría de los dos órdenes: para calcular se abre desde
 * adentro, para deshacer se saca desde afuera. Los dos recorren el mismo árbol
 * en sentidos contrarios y confundirlos es la misconception del nodo.
 *
 * Sin texto visible: el nodo es `literacy: none` y acá solo hay claves y datos.
 */

import { num, op, type BinOp, type MathNode, type NodeId } from "@mathy/math-core";
import { makeRandom, type Random } from "./random.ts";
import { registerNode, type LevelBase } from "./node.ts";
import type { Evidence, Layer } from "./one-step.ts";

/** El nodo del grafo que este minijuego enseña. */
export const NODE = "arith.expr.precedence_tree";

/**
 * El mismo id, sin ambigüedad. `index.ts` reúne los minijuegos con `export *` y
 * cada uno declara su propio `NODE`, así que afuera del módulo se lo nombra así.
 */
export const NODE_PRECEDENCE_TREE = NODE;

/**
 * Qué se pregunta en una ronda. No es dificultad: es qué gesto contesta.
 *
 * - `open`: arrastrar la llave a la cerradura. La del cofre de afuera gira en el
 *   vacío hasta que el de adentro entrega su tesoro.
 * - `nest`: meter un cofre adentro de otro para reproducir un anidamiento
 *   mostrado. Es el gesto que le da nombre al nodo.
 * - `explain`: dos animaciones sobre el mismo cofre; tocar la que abre en orden
 *   invertido. Para `literacy: none` este es el formato de todo `explain`.
 * - `recognize`: tocar el nodo del árbol que corresponde al cofre de más
 *   adentro.
 * - `pipe`: dos máquinas y un caño; cambiar el orden hasta que la salida sea la
 *   mostrada. Es el contraste que aporta `machine_pipe`.
 * - `wrap`: la fila de fichas con las paredes vueltas paréntesis; tocar la
 *   operación que va adentro del cofre dibujado.
 * - `ghost`: sin cofres dibujados; tocar la operación que se calcula primero.
 * - `unwrap`: el nivel de vuelta. El tesoro está y el cofre entero cerrado, y
 *   hay que sacar desde afuera.
 * - `arbitrary`: cerraduras que no son aritméticas y dos órdenes por instancia;
 *   elegir el anidamiento que produce la figura mostrada.
 */
export type PrecAsk =
  | "open"
  | "nest"
  | "explain"
  | "recognize"
  | "pipe"
  | "wrap"
  | "ghost"
  | "unwrap"
  | "arbitrary";

/** Las etapas de desvanecimiento de `chest_key` en E0. */
export type PrecChestSkin = "chests" | "arrows" | "boxes" | "inverse_notation";

/** Las etapas de desvanecimiento de `machine_pipe` en E0. */
export type PrecPipeSkin = "machines" | "pipes" | "arrow_diagram" | "function_notation";

/**
 * Lo único que endurece. La capa, la pregunta y las pieles viven afuera
 * justamente para que la regla del diseño —un nivel cambia de capa o endurece
 * parámetros, nunca las dos cosas— se pueda comprobar con un test.
 */
export interface PrecParams {
  /** Cuántos cofres anidados. Dos al principio, tres desde el nivel 2. */
  readonly depth: number;
  /** De dónde salen los números que acompañan a cada cofre. */
  readonly operands: readonly [number, number];
  /** Qué cerraduras entran en juego. */
  readonly ops: readonly BinOp[];
  /**
   * Los cofres se dibujan alrededor de la fila. En falso son los cofres
   * invisibles: la jerarquía es lo único que dice qué está adentro de qué.
   */
  readonly drawnChests: boolean;
  /**
   * Entran pares de operaciones del mismo nivel, donde el acuerdo de izquierda
   * a derecha es lo único que decide.
   */
  readonly sameLevel: boolean;
  /** El nivel de vuelta: se saca desde afuera en vez de abrir desde adentro. */
  readonly undo: boolean;
}

export interface PrecLevel extends LevelBase {
  readonly params: PrecParams;
  /** Qué pide cada ronda, ciclando. Un nivel con dos preguntas alterna. */
  readonly asks: readonly PrecAsk[];
  readonly chestSkin: PrecChestSkin;
  readonly pipeSkin: PrecPipeSkin;
  /** El árbol al costado, con un nodo por cofre. */
  readonly tree: boolean;
  /** La fila de fichas con la expresión escrita. */
  readonly row: boolean;
  /**
   * Los numerales. Hasta el nivel 4 el nodo se juega sin un solo número: los
   * cofres se distinguen por tamaño, las cerraduras por forma y los tesoros por
   * color, y la tubería usa bolitas de distinto tamaño.
   */
  readonly numerals: boolean;
  /** La definición corta con voz. Solo en `formal`. */
  readonly definition: boolean;
}

/**
 * Los ocho niveles del documento. Cada uno cambia la capa o endurece los
 * parámetros, nunca las dos cosas:
 *
 * 1 → 2 endurece (entra el tercer cofre), 2 → 3 cambia de capa con los mismos
 * parámetros, 3 → 4 no toca nada y cambia de superficie —la tubería hace la
 * misma pregunta sin cofres—, 4 → 5 cambia de capa, 5 → 6 y 6 → 7 endurecen sin
 * moverse de `symbolic`, y 7 → 8 se lleva el nodo a `formal` sin tocar los
 * parámetros.
 *
 * DISCREPANCIA ANOTADA: el documento del minijuego dice, al describir
 * `gen_nested_chest`, que `depth` vale 2 en los niveles 1 y 3 y 3 desde el 2.
 * La tabla de niveles del mismo documento dice que el 3 tiene "misma
 * dificultad" que el 2, y volver a dos cofres ablandaría los parámetros, que la
 * regla prohíbe. Gana la tabla: el nivel 3 se queda en tres cofres.
 */
export const PREC_LEVELS: readonly PrecLevel[] = [
  {
    n: 1,
    titleKey: "level.oneChestInsideAnother",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 3,
    params: {
      depth: 2,
      operands: [2, 5],
      ops: ["+", "*"],
      drawnChests: true,
      sameLevel: false,
      undo: false,
    },
    asks: ["open"],
    chestSkin: "chests",
    pipeSkin: "machines",
    tree: false,
    row: false,
    numerals: false,
    definition: false,
  },
  {
    n: 2,
    titleKey: "level.buildTheNesting",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 3,
    params: {
      depth: 3,
      operands: [2, 5],
      ops: ["+", "*"],
      drawnChests: true,
      sameLevel: false,
      undo: false,
    },
    asks: ["nest"],
    chestSkin: "chests",
    pipeSkin: "machines",
    tree: false,
    row: false,
    numerals: false,
    definition: false,
  },
  {
    n: 3,
    titleKey: "level.chestsAndTree",
    layer: "visual",
    evidence: ["explain", "recognize"],
    rounds: 4,
    params: {
      depth: 3,
      operands: [2, 5],
      ops: ["+", "*"],
      drawnChests: true,
      sameLevel: false,
      undo: false,
    },
    asks: ["explain", "recognize"],
    chestSkin: "chests",
    pipeSkin: "machines",
    tree: true,
    row: false,
    numerals: false,
    definition: false,
  },
  {
    n: 4,
    titleKey: "level.thePipe",
    layer: "visual",
    evidence: ["apply"],
    rounds: 4,
    params: {
      depth: 3,
      operands: [2, 5],
      ops: ["+", "*"],
      drawnChests: true,
      sameLevel: false,
      undo: false,
    },
    asks: ["pipe"],
    chestSkin: "chests",
    pipeSkin: "machines",
    tree: true,
    row: false,
    numerals: false,
    definition: false,
  },
  {
    n: 5,
    titleKey: "level.chipsAndWalls",
    layer: "symbolic",
    evidence: ["manipulate"],
    rounds: 4,
    params: {
      depth: 3,
      operands: [2, 5],
      ops: ["+", "*"],
      drawnChests: true,
      sameLevel: false,
      undo: false,
    },
    asks: ["wrap"],
    chestSkin: "boxes",
    pipeSkin: "pipes",
    tree: true,
    row: true,
    numerals: true,
    definition: false,
  },
  {
    n: 6,
    titleKey: "level.invisibleChests",
    layer: "symbolic",
    evidence: ["generalize"],
    rounds: 4,
    params: {
      depth: 3,
      operands: [2, 9],
      ops: ["+", "-", "*", "/"],
      drawnChests: false,
      sameLevel: true,
      undo: false,
    },
    asks: ["ghost"],
    chestSkin: "boxes",
    pipeSkin: "pipes",
    tree: true,
    row: true,
    numerals: true,
    definition: false,
  },
  {
    n: 7,
    titleKey: "level.undoIt",
    layer: "symbolic",
    evidence: ["manipulate"],
    rounds: 3,
    params: {
      depth: 3,
      operands: [2, 9],
      ops: ["+", "-", "*", "/"],
      drawnChests: false,
      sameLevel: true,
      undo: true,
    },
    asks: ["unwrap"],
    chestSkin: "boxes",
    pipeSkin: "pipes",
    tree: true,
    row: true,
    numerals: true,
    definition: false,
  },
  {
    n: 8,
    titleKey: "level.nestingsNeverSeen",
    layer: "formal",
    evidence: ["generalize"],
    rounds: 3,
    params: {
      depth: 3,
      operands: [2, 9],
      ops: ["+", "-", "*", "/"],
      drawnChests: false,
      sameLevel: true,
      undo: true,
    },
    asks: ["arbitrary"],
    chestSkin: "inverse_notation",
    pipeSkin: "pipes",
    tree: true,
    row: true,
    numerals: true,
    definition: true,
  },
];

// --- Las piezas de una ronda -------------------------------------------------

/** Qué hay en un lado de una cerradura: un número, o el cofre de más adentro. */
export type PrecSlot =
  | { readonly kind: "num"; readonly value: number }
  | { readonly kind: "chest"; readonly id: NodeId };

/**
 * Un cofre. Es un nodo del árbol de `@mathy/math-core` visto como objeto: su
 * `id` es el del término, y por eso tocar el paréntesis, tocar la pared y tocar
 * el nodo del árbol devuelven lo mismo.
 */
export interface PrecChest {
  readonly id: NodeId;
  /** La cerradura: su forma es la operación. */
  readonly op: BinOp;
  /** 0 es el cofre de más afuera. */
  readonly depth: number;
  /** El tesoro de este cofre: lo que vale su subárbol. */
  readonly value: number;
  /** Los dos contenidos, en el orden en que se escriben. */
  readonly slots: readonly [PrecSlot, PrecSlot];
  /**
   * Los paréntesis de este cofre se escriben en la fila. Falso cuando la
   * jerarquía ya los da por sobreentendidos: ese cofre es el que no está
   * dibujado y nadie dibujó.
   */
  readonly written: boolean;
}

/**
 * Una llave del llavero. Su forma es la operación inversa de la cerradura, y
 * eso es todo lo que la distingue: no hay llaves equivocadas en este nodo, hay
 * cofres inaccesibles. Cuál muerde depende del estado, no de la llave.
 */
export interface PrecKey {
  readonly id: string;
  /** El cofre que esta llave abre. */
  readonly chestId: NodeId;
  /** La cerradura que tiene enfrente. */
  readonly lock: BinOp;
  /** La forma de la llave: la operación que deshace la cerradura. */
  readonly inverse: BinOp;
  readonly depth: number;
}

/**
 * Por qué una opción está en pantalla, si no es la correcta. Cada una es un
 * error que el diseño prevé, y ninguna es un número al azar.
 *
 * - `inner_first`: deshacer empezando por adentro. Es la única que clasifica.
 * - `outer_first`: calcular empezando por afuera, que es la llave girando en el
 *   vacío.
 * - `left_to_right`: la fila leída como un renglón.
 * - `neighbor`: el agrupamiento vecino.
 * - `paren_operates`: creer que los paréntesis hacen algo.
 */
export type PrecLure =
  | "inner_first"
  | "outer_first"
  | "left_to_right"
  | "neighbor"
  | "paren_operates";

export interface PrecOption {
  readonly id: string;
  /** El nodo del árbol que la opción señala. Vacío cuando no señala ninguno. */
  readonly nodeId: NodeId;
  /** El orden que la opción muestra. Vacío fuera de `explain` y `arbitrary`. */
  readonly order: readonly string[];
  readonly correct: boolean;
  readonly lure?: PrecLure;
}

/** Una máquina de la tubería. Su dibujo es la operación, nunca una palabra. */
export interface PrecMachine {
  readonly id: string;
  readonly op: BinOp;
  readonly value: number;
}

/** Una cerradura que no es aritmética, del último nivel. */
export type PrecLockKind = "turn" | "add" | "color";

export interface PrecLock {
  readonly id: string;
  readonly kind: PrecLockKind;
  /** Cuartos de vuelta, puntos que agrega, o el color. */
  readonly value: number;
}

/**
 * La figura sobre la que actúan las cerraduras arbitrarias. Los puntos se
 * guardan en cuartos de vuelta absolutos: girar los mueve a todos y agregar
 * pone uno arriba, así que girar-y-agregar y agregar-y-girar dejan el punto en
 * lugares distintos. Esa diferencia es todo el nivel.
 */
export interface PrecFigure {
  readonly turn: number;
  readonly color: number;
  readonly dots: readonly number[];
}

export interface PrecProblem {
  readonly ask: PrecAsk;
  /** La expresión como árbol. Cada término con su identidad estable. */
  readonly tree: MathNode;
  /** El tesoro del cofre de más afuera. */
  readonly value: number;
  /** Los cofres, del más de afuera al más de adentro. */
  readonly chests: readonly PrecChest[];
  /** El orden en que las llaves muerden: adentro hacia afuera, o al revés. */
  readonly order: readonly NodeId[];
  readonly keys: readonly PrecKey[];
  readonly options: readonly PrecOption[];
  /** La tubería, en el orden en que llega dibujada. Vacía fuera de `pipe`. */
  readonly machines: readonly PrecMachine[];
  /** El orden de máquinas que produce la salida pedida. */
  readonly solution: readonly string[];
  readonly input: number;
  readonly output: number;
  /** Las cerraduras que no son aritméticas. Vacías fuera de `arbitrary`. */
  readonly locks: readonly PrecLock[];
  /** La figura que hay que conseguir. */
  readonly figure: PrecFigure;
}

/** Cofres montados siempre, para que el árbol de la escena no cambie entre rondas. */
export const PREC_CHEST_SLOTS = 3;
/** Llaves montadas siempre, por la misma razón. */
export const PREC_KEY_SLOTS = 3;
/** Fichas montadas siempre. */
export const PREC_OPTION_SLOTS = 3;
/** Máquinas montadas siempre en la tubería. */
export const PREC_MACHINE_SLOTS = 3;
/** Hasta dónde se anida. Con cuatro cofres la mesa deja de leerse de un vistazo. */
export const PREC_MAX_DEPTH = 3;
/** El techo del tesoro. Más grande y el número deja de contarse. */
export const PREC_MAX_VALUE = 200;

// --- El árbol como encastre --------------------------------------------------

/** La jerarquía, como acuerdo: la multiplicación vive en un cofre más adentro. */
export const precRank = (o: BinOp): number => (o === "*" || o === "/" ? 1 : 0);

/**
 * Si la fila escrita dice exactamente este árbol.
 *
 * `@mathy/typeset` escribe los paréntesis solo cuando una suma cae dentro de un
 * producto, que es la convención. Eso deja un caso mudo: un cofre del mismo
 * nivel colgado a la derecha —`12 ÷ (3 × 2)`— se escribiría igual que colgado a
 * la izquierda y la fila mentiría. El generador nunca arma esos árboles, y este
 * predicado es la regla que lo comprueba.
 */
export function precRowSaysTheTree(node: MathNode): boolean {
  if (node.kind !== "op") return true;
  const [left, right] = node.args as readonly [MathNode, MathNode];
  if (right && right.kind === "op" && precRank(right.op) <= precRank(node.op)) return false;
  return (left ? precRowSaysTheTree(left) : true) && (right ? precRowSaysTheTree(right) : true);
}

/** Los paréntesis de este cofre se escriben en la fila. */
const parensWritten = (inner: BinOp, outer: BinOp, side: "left" | "right"): boolean =>
  side === "left" && precRank(inner) < precRank(outer);

/** La operación que deshace una cerradura. */
export const precInverse = (o: BinOp): BinOp =>
  o === "+" ? "-" : o === "-" ? "+" : o === "*" ? "/" : "*";

/** El cofre de más adentro: el primero que se abre cuando se calcula. */
export const precInnermost = (problem: PrecProblem): PrecChest | undefined =>
  problem.chests[problem.chests.length - 1];

/**
 * Qué cofre muerde ahora. Calculando es el más de adentro sin abrir; deshaciendo
 * es el más de afuera sin sacar. Es la misma lista recorrida al revés, y esa
 * simetría es el nodo entero.
 */
export function precAccessible(problem: PrecProblem, opened: number): PrecChest | undefined {
  const id = problem.order[opened];
  if (id === undefined) return undefined;
  return problem.chests.find((c) => c.id === id);
}

/** La llave muerde, o gira en el vacío. */
export const precBites = (problem: PrecProblem, chestId: NodeId, opened: number): boolean =>
  precAccessible(problem, opened)?.id === chestId;

/**
 * El error del catálogo que este nodo puede clasificar, y el único. `L` declara
 * `unwrap_order_inverted` sobre `arith.expr.precedence_tree` con patrón
 * `tree_unwrap` y mecánica `chest_key`; ningún otro error del diseño tiene
 * entrada apuntando acá, así que ningún otro movimiento puede llevar
 * `misconception`.
 */
export const PREC_MISCONCEPTION = "unwrap_order_inverted";

/**
 * Qué error catalogado corresponde a un movimiento, si hay alguno.
 *
 * Solo el nivel de vuelta clasifica. Abrir el cofre de afuera antes de tiempo
 * cuando se calcula es la llave girando en el vacío: está previsto por el
 * diseño, se muestra con el objeto, y no tiene entrada en el catálogo.
 */
export function precMisconceptionFor(
  problem: PrecProblem,
  chestId: NodeId,
  opened: number,
): string | undefined {
  if (problem.ask !== "unwrap") return undefined;
  if (precBites(problem, chestId, opened)) return undefined;
  const elegido = problem.chests.find((c) => c.id === chestId);
  const abierto = precAccessible(problem, opened);
  if (!elegido || !abierto) return undefined;
  // Adentro en vez de afuera: el orden de calcular arrastrado a una situación
  // que pide el contrario. Es exactamente lo que el catálogo describe.
  return elegido.depth > abierto.depth ? PREC_MISCONCEPTION : undefined;
}

// --- La tubería --------------------------------------------------------------

/** Lo que sale del caño. La escena no calcula: recibe esto ya hecho. */
export function precPipeValue(input: number, machines: readonly PrecMachine[]): number {
  let v = input;
  for (const m of machines) {
    if (m.op === "+") v += m.value;
    else if (m.op === "-") v -= m.value;
    else if (m.op === "*") v *= m.value;
    else v = m.value === 0 ? NaN : v / m.value;
  }
  return v;
}

// --- Las cerraduras arbitrarias ----------------------------------------------

/** Lo que una cerradura le hace a la figura. Girar mueve todo; agregar pone arriba. */
export function precApplyLock(figure: PrecFigure, lock: PrecLock): PrecFigure {
  if (lock.kind === "turn") {
    return {
      ...figure,
      turn: (figure.turn + lock.value) % 4,
      dots: figure.dots.map((d) => (d + lock.value) % 4),
    };
  }
  if (lock.kind === "color") return { ...figure, color: lock.value };
  return { ...figure, dots: [...figure.dots, 0] };
}

/** La figura que sale de abrir los cofres en un orden dado. */
export function precFigureFor(
  start: PrecFigure,
  locks: readonly PrecLock[],
  order: readonly string[],
): PrecFigure {
  let f = start;
  for (const id of order) {
    const lock = locks.find((l) => l.id === id);
    if (lock) f = precApplyLock(f, lock);
  }
  return f;
}

/** Dos figuras son la misma cuando coinciden el giro, el color y los puntos. */
export const precSameFigure = (a: PrecFigure, b: PrecFigure): boolean =>
  a.turn === b.turn &&
  a.color === b.color &&
  a.dots.length === b.dots.length &&
  [...a.dots].sort().join(",") === [...b.dots].sort().join(",");

// --- El generador ------------------------------------------------------------

/**
 * Genera una ronda. La semilla la hace reproducible; la ronda decide cuál de
 * las preguntas del nivel toca, porque un nivel con dos preguntas tiene que
 * alternarlas y no sortearlas: sorteadas, cuatro rondas pueden no dar nunca
 * evidencia de uno de los dos verbos.
 */
export function generatePrecedence(level: PrecLevel, seed: number, round = 0): PrecProblem {
  const rnd = makeRandom(seed);
  const asks = level.asks;
  const ask = (asks[round % asks.length] ?? asks[0]) as PrecAsk;

  if (ask === "pipe") return pipeProblem(level, rnd);
  if (ask === "arbitrary") return arbitraryProblem(rnd);

  const chain = buildChain(level.params, ask, rnd);
  const base: PrecProblem = {
    ...empty(),
    ask,
    tree: chain.tree,
    value: chain.value,
    chests: chain.chests,
    order: openOrder(chain.chests, level.params.undo),
    keys: chain.chests.map((c, i) => ({
      id: `k${i}`,
      chestId: c.id,
      lock: c.op,
      inverse: precInverse(c.op),
      depth: c.depth,
    })),
  };

  switch (ask) {
    case "explain":
      return { ...base, options: explainOptions(base, rnd) };
    case "recognize":
    case "wrap":
    case "ghost":
      return { ...base, options: nodeOptions(base, ask, rnd) };
    default:
      // `open`, `nest` y `unwrap` se contestan con la mano sobre los cofres: no
      // hay fichas que elegir, hay un orden que descubrir.
      return base;
  }
}

/** El orden en que muerden las llaves. Es la misma lista recorrida al revés. */
function openOrder(chests: readonly PrecChest[], undo: boolean): NodeId[] {
  const ids = chests.map((c) => c.id);
  return undo ? ids : [...ids].reverse();
}

/**
 * Arma el encastre desde adentro hacia afuera, que es como se calcula.
 *
 * Cada capa elige una cerradura, de qué lado cuelga el cofre de adentro y qué
 * número lo acompaña, con tres restricciones que no son de gusto:
 *
 * 1. La fila escrita tiene que decir el árbol (`precRowSaysTheTree`), así que un
 *    cofre colgado a la derecha tiene que ser de un nivel más adentro.
 * 2. Sin cofres dibujados no puede haber paréntesis escritos: la fila es lo
 *    único que hay, y una fila con paréntesis sería un cofre con otro nombre.
 * 3. Sin pares del mismo nivel, dos cerraduras de la misma jerarquía no se
 *    encastran: el acuerdo de izquierda a derecha llega en su nivel.
 *
 * Y la aritmética tiene que cerrar en enteros no negativos, porque las
 * fracciones y los negativos dentro de una expresión no son de este nodo.
 */
function buildChain(
  p: PrecParams,
  ask: PrecAsk,
  rnd: Random,
): { tree: MathNode; chests: PrecChest[]; value: number } {
  const depth = Math.min(Math.max(p.depth, 2), PREC_MAX_DEPTH);
  for (let intento = 0; intento < 60; intento++) {
    const armado = tryChain(p, ask, depth, rnd);
    if (armado) return armado;
  }
  // Si la búsqueda no encontró nada, el nodo igual tiene que poder jugarse.
  return fallbackChain(depth);
}

function tryChain(
  p: PrecParams,
  ask: PrecAsk,
  depth: number,
  rnd: Random,
): { tree: MathNode; chests: PrecChest[]; value: number } | null {
  const [lo, hi] = p.operands;
  const innerOp = rnd.pick(p.ops);
  const a = rnd.int(lo, hi);
  const b = rnd.int(lo, hi);
  const inner = closeUp(innerOp, a, b);
  if (inner === null) return null;

  let tree: MathNode = op(innerOp, [num(inner.left), num(inner.right)]);
  let value = inner.value;
  let currentOp = innerOp;
  const chests: PrecChest[] = [
    {
      id: tree.id,
      op: innerOp,
      depth: depth - 1,
      value,
      slots: [
        { kind: "num", value: inner.left },
        { kind: "num", value: inner.right },
      ],
      written: false,
    },
  ];

  let yaEscribio = false;
  for (let capa = depth - 2; capa >= 0; capa--) {
    const paso = addLayer(p, ask, currentOp, value, yaEscribio, rnd);
    if (!paso) return null;
    if (parensWritten(currentOp, paso.op, paso.side)) yaEscribio = true;
    const otro = num(paso.other);
    const args: readonly MathNode[] = paso.side === "left" ? [tree, otro] : [otro, tree];
    const padre = op(paso.op, args);
    const dentro: PrecSlot = { kind: "chest", id: tree.id };
    const fuera: PrecSlot = { kind: "num", value: paso.other };
    chests.unshift({
      id: padre.id,
      op: paso.op,
      depth: capa,
      value: paso.value,
      slots: paso.side === "left" ? [dentro, fuera] : [fuera, dentro],
      written: parensWritten(currentOp, paso.op, paso.side),
    });
    // El cofre de adentro sabe recién ahora si sus paredes se escriben.
    const hijo = chests[1] as PrecChest;
    chests[1] = { ...hijo, written: parensWritten(currentOp, paso.op, paso.side) };
    tree = padre;
    value = paso.value;
    currentOp = paso.op;
  }

  if (!precRowSaysTheTree(tree)) return null;
  if (value < 1 || value > PREC_MAX_VALUE) return null;
  // `wrap` es el nivel donde las paredes se vuelven paréntesis: sin un par
  // escrito no hay nada que envolver.
  if (ask === "wrap" && !chests.some((c) => c.written)) return null;
  return { tree, chests, value };
}

/** Los dos números del cofre de más adentro, ya validados. */
function closeUp(
  o: BinOp,
  a: number,
  b: number,
): { left: number; right: number; value: number } | null {
  if (o === "+") return { left: a, right: b, value: a + b };
  if (o === "-") return a > b ? { left: a, right: b, value: a - b } : null;
  if (o === "*") return { left: a, right: b, value: a * b };
  // La división del cofre de más adentro se arma al revés: el dividendo es el
  // producto, así que el cociente es entero por construcción.
  return b > 1 ? { left: a * b, right: b, value: a } : null;
}

interface Capa {
  readonly op: BinOp;
  readonly side: "left" | "right";
  readonly other: number;
  readonly value: number;
}

/**
 * Una capa más de cofre alrededor de lo que ya hay.
 *
 * `yaEscribio` dice si alguna capa de más adentro ya dejó un par de paredes
 * escrito. Envolver necesita exactamente uno, y no puede exigirse en todas las
 * capas: las paredes se escriben cuando una suma cae dentro de un producto, y
 * dos veces seguidas eso es imposible. Con el par ya conseguido, la capa
 * siguiente vuelve a elegir libre.
 */
function addLayer(
  p: PrecParams,
  ask: PrecAsk,
  innerOp: BinOp,
  v: number,
  yaEscribio: boolean,
  rnd: Random,
): Capa | null {
  const [lo, hi] = p.operands;
  const candidatos: Capa[] = [];
  for (const o of p.ops) {
    for (const side of ["left", "right"] as const) {
      // La fila tiene que decir el árbol: a la derecha solo cuelga un cofre de
      // un nivel más adentro.
      if (side === "right" && precRank(innerOp) <= precRank(o)) continue;
      const escribe = parensWritten(innerOp, o, side);
      // Sin cofres dibujados, la fila es lo único que hay y no lleva paredes.
      if (!p.drawnChests && escribe) continue;
      // El acuerdo de izquierda a derecha llega en su nivel y no antes.
      if (!p.sameLevel && side === "left" && precRank(innerOp) === precRank(o)) continue;
      // Envolver pide algo que envolver, y esta es la última capa que puede
      // dárselo si todavía no lo tiene.
      if (ask === "wrap" && !yaEscribio && !escribe) continue;
      for (let k = lo; k <= hi; k++) {
        const value = layerValue(o, side, v, k);
        if (value === null) continue;
        candidatos.push({ op: o, side, other: k, value });
      }
    }
  }
  if (candidatos.length === 0) return null;
  return rnd.pick(candidatos);
}

/** Cuánto vale la capa, o `null` si la cuenta no cierra en enteros. */
function layerValue(o: BinOp, side: "left" | "right", v: number, k: number): number | null {
  const izq = side === "left" ? v : k;
  const der = side === "left" ? k : v;
  if (o === "+") return izq + der;
  if (o === "-") return izq > der ? izq - der : null;
  if (o === "*") {
    const r = izq * der;
    return r <= PREC_MAX_VALUE ? r : null;
  }
  if (der <= 1 || izq % der !== 0) return null;
  const r = izq / der;
  return r >= 1 ? r : null;
}

/**
 * `(2 + 3) × 4`, y con un cofre más `(2 + 3) × 4 + 1`, para cuando la búsqueda
 * no encuentra nada. Es la forma que sirve a todas las preguntas: tiene un par
 * de paredes escrito, la profundidad que el nivel pidió y una fila que dice
 * exactamente el árbol.
 */
function fallbackChain(depth: number): { tree: MathNode; chests: PrecChest[]; value: number } {
  const dentro = op("+", [num(2), num(3)]);
  const medio = op("*", [dentro, num(4)]);
  const interno: PrecChest = {
    id: dentro.id,
    op: "+",
    depth: depth - 1,
    value: 5,
    slots: [
      { kind: "num", value: 2 },
      { kind: "num", value: 3 },
    ],
    written: true,
  };
  const externo: PrecChest = {
    id: medio.id,
    op: "*",
    depth: depth - 2,
    value: 20,
    slots: [
      { kind: "chest", id: dentro.id },
      { kind: "num", value: 4 },
    ],
    written: false,
  };
  if (depth <= 2) return { tree: medio, chests: [externo, interno], value: 20 };
  const tree = op("+", [medio, num(1)]);
  const raiz: PrecChest = {
    id: tree.id,
    op: "+",
    depth: 0,
    value: 21,
    slots: [
      { kind: "chest", id: medio.id },
      { kind: "num", value: 1 },
    ],
    written: false,
  };
  return { tree, chests: [raiz, externo, interno], value: 21 };
}

// --- Las preguntas que se contestan tocando ----------------------------------

/**
 * Las dos animaciones de `explain`. Una abre desde adentro y el tesoro sube
 * hasta la tapa del siguiente; la otra intenta desde afuera y la llave gira en
 * el vacío. Tocar la del orden invertido es acertar: lo que se pide es señalar
 * el error, y quien toca la otra está diciendo que ese orden estaba bien.
 */
function explainOptions(problem: PrecProblem, rnd: Random): PrecOption[] {
  const desdeAdentro = [...problem.chests].map((c) => c.id).reverse();
  const desdeAfuera = problem.chests.map((c) => c.id);
  const invertida = rnd.bool() ? 0 : 1;
  return [0, 1].map((i) =>
    i === invertida
      ? { id: `a${i}`, nodeId: "", order: desdeAfuera, correct: true }
      : {
          id: `a${i}`,
          nodeId: "",
          order: desdeAdentro,
          correct: false,
          lure: "outer_first" as const,
        },
  );
}

/**
 * Las fichas que señalan un nodo del árbol. Los distractores son los del
 * diseño: el agrupamiento vecino y la fila leída de izquierda a derecha.
 */
function nodeOptions(problem: PrecProblem, ask: PrecAsk, rnd: Random): PrecOption[] {
  const dentro = precInnermost(problem);
  if (!dentro) return [];
  const out: PrecOption[] = [
    { id: "o0", nodeId: dentro.id, order: [], correct: true },
  ];
  for (const c of problem.chests) {
    if (c.id === dentro.id) continue;
    if (out.length >= PREC_OPTION_SLOTS) break;
    // El cofre de afuera es el agrupamiento vecino cuando está pegado, y la
    // lectura de izquierda a derecha cuando es el que abre la fila.
    const primeroEnLaFila = c.slots[0]?.kind === "num";
    out.push({
      id: `o${out.length}`,
      nodeId: c.id,
      order: [],
      correct: false,
      lure: primeroEnLaFila && ask === "ghost" ? "left_to_right" : "neighbor",
    });
  }
  return rnd.shuffle(out);
}

// --- La tubería como ronda ---------------------------------------------------

/**
 * Dos máquinas y un caño. Llegan en el orden que no da la salida pedida: si
 * llegaran bien no habría nada que hacer, y lo que el nivel enseña es que dar
 * vuelta el caño cambia el número.
 */
function pipeProblem(level: PrecLevel, rnd: Random): PrecProblem {
  const [lo, hi] = level.params.operands;
  const a: PrecMachine = { id: "m0", op: "*", value: rnd.int(2, Math.max(2, hi)) };
  const b: PrecMachine = { id: "m1", op: "+", value: rnd.int(lo, hi) };
  const input = rnd.int(1, Math.max(2, hi));
  const bien = rnd.bool() ? [a, b] : [b, a];
  const mal = [bien[1] as PrecMachine, bien[0] as PrecMachine];
  return {
    ...empty(),
    ask: "pipe",
    machines: mal,
    solution: bien.map((m) => m.id),
    input,
    output: precPipeValue(input, bien),
    value: precPipeValue(input, bien),
  };
}

// --- Los encastres que nunca vio ---------------------------------------------

/**
 * Dos cerraduras que no son aritméticas y no conmutan: girar la figura y
 * agregarle un punto arriba. Girar y después agregar deja el punto arriba;
 * agregar y después girar lo deja de costado. El jugador elige el anidamiento
 * que produce la figura mostrada.
 */
function arbitraryProblem(rnd: Random): PrecProblem {
  const giro: PrecLock = { id: "l0", kind: "turn", value: rnd.int(1, 3) };
  const punto: PrecLock = { id: "l1", kind: "add", value: 1 };
  const locks = [giro, punto];
  const start: PrecFigure = { turn: 0, color: 0, dots: [] };
  const ordenes: readonly (readonly string[])[] = [
    [giro.id, punto.id],
    [punto.id, giro.id],
  ];
  const elegido = rnd.bool() ? 0 : 1;
  const objetivo = precFigureFor(start, locks, ordenes[elegido] as readonly string[]);
  const options: PrecOption[] = ordenes.map((orden, i) => ({
    id: `o${i}`,
    nodeId: "",
    order: orden,
    correct: i === elegido,
    ...(i === elegido ? {} : { lure: "left_to_right" as const }),
  }));
  return {
    ...empty(),
    ask: "arbitrary",
    locks,
    figure: objetivo,
    options,
    solution: ordenes[elegido] as readonly string[],
  };
}

/** El esqueleto de una ronda: lo que ninguna pregunta usa queda vacío. */
function empty(): PrecProblem {
  const tree = num(0);
  return {
    ask: "open",
    tree,
    value: 0,
    chests: [],
    order: [],
    keys: [],
    options: [],
    machines: [],
    solution: [],
    input: 0,
    output: 0,
    locks: [],
    figure: { turn: 0, color: 0, dots: [] },
  };
}

export const precLevelByNumber = (n: number): PrecLevel | undefined =>
  PREC_LEVELS.find((l) => l.n === n);
export const TOTAL_PREC_LEVELS = PREC_LEVELS.length;

registerNode({
  id: NODE,
  n: 9,
  prereqs: ["arith.mul.scaling"],
  levels: PREC_LEVELS,
});

/** Las capas y los verbos que el nodo recorre, para los tests y el mapa. */
export const PREC_LAYERS: readonly Layer[] = ["concrete", "visual", "symbolic", "formal"];
export const PREC_EVIDENCE: readonly Evidence[] = [
  "recognize",
  "explain",
  "manipulate",
  "apply",
  "generalize",
];
