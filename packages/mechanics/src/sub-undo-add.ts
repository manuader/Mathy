/**
 * La llave de vuelta, para `arith.sub.undo_add`.
 *
 * Los siete niveles y qué endurece cada parámetro salen del documento del
 * minijuego y de `F-minijuegos/minigames.yaml`, no de acá: este archivo los
 * implementa, no los decide.
 *
 * La idea que sostiene todo: restar no es quitar de un montón, es deshacer un
 * avance. Por eso el veredicto no lo da una comparación sino un cofre: la
 * cerradura tiene la forma del tramo de ida y solo abre con la llave que mide
 * lo mismo. Volver dos o volver cuatro también es volver, pero no devuelve.
 *
 * De ahí sale la segunda cara, que el nodo trata como la misma cosa escrita al
 * revés: los mismos tres números, `landing - step = home` y `landing - home =
 * step`. Uno deshace un viaje y el otro mide entre dos piedras.
 *
 * Sin texto visible: el nodo es `literacy: none` y acá solo hay claves y datos.
 */

import { makeRandom, type Random } from "./random.ts";
import { registerNode, type LevelBase } from "./node.ts";

/** El nodo del grafo que este minijuego enseña. */
export const NODE = "arith.sub.undo_add";

/**
 * El mismo id, sin ambigüedad. `index.ts` reúne los minijuegos con `export *` y
 * cada uno declara su propio `NODE`, así que afuera del módulo se lo nombra así.
 */
export const NODE_UNDO_ADD = NODE;

/** Cuántas piedras dibuja la pista: de la orilla `0` a la `10`. */
export const TRACK = 11;

/**
 * Qué hace el jugador en el nivel. No es dificultad: es qué gesto contesta la
 * pregunta del nivel.
 *
 * - `turn`: soltar la llave sobre la manivela y girar al revés.
 * - `pick`: elegir la llave antes de girar.
 * - `judge`: mirar dos regresos y tocar el que se pasa.
 * - `measure`: estirar la regla plegable entre dos caminantes.
 * - `write`: completar el renglón con la ficha que falta.
 * - `unlock`: elegir la llave de una cerradura que no es un tramo.
 */
export type UndoMode = "turn" | "pick" | "judge" | "measure" | "write" | "unlock";

/** Por qué una llave equivocada está en el llavero. */
export type KeyLure = "one_more" | "one_less" | "endpoint";

/**
 * Las cerraduras del último nivel. Las dos primeras son tramos; las otras tres
 * son acciones cualesquiera con vuelta, y `broken` es la que no la tiene.
 */
export type LockKind = "forward" | "back" | "turn" | "hat" | "color" | "broken";

/** La pista dibujada, aplanada, a pedido, o ya retirada. */
export type UndoSkin = "stone" | "mark" | "onDemand" | "hidden";

/** Cuál de las dos caras del nodo escribe este renglón. */
export type RowFace = "undo" | "distance";

/**
 * Los dos errores del catálogo de L cuya regla `detect` apunta a este nodo.
 * Están escritos como constantes porque un id inventado no clasifica nada.
 */
export const MIS_ENDPOINT = "endpoint_read_as_distance";
export const MIS_ORDER = "subtrahend_order_swapped";

export interface UndoParams {
  /** El tramo de ida, que es también la distancia entre las dos piedras. */
  readonly step: readonly [number, number];
  /** Cuántas llaves trae el llavero. */
  readonly keyRing: number;
  /** La llave sin dientes: restar `0` no mueve al caminante. */
  readonly allowZero: boolean;
  /** La vuelta entera: restar un número de sí mismo deja al caminante en el `0`. */
  readonly allowFullReturn: boolean;
  /** Qué dato falta en el renglón. */
  readonly unknown: "none" | "minuend";
  /** Con qué desvíos nacen las llaves que no abren. */
  readonly distractors: readonly KeyLure[];
}

export interface UndoLevel extends LevelBase {
  readonly params: UndoParams;
  readonly mode: UndoMode;
  /** Los dientes se cuentan de a uno, o la llave se distingue por su forma. */
  readonly labeled: boolean;
  readonly skin: UndoSkin;
  /** La regla plegable está disponible. */
  readonly ruler: boolean;
  /** El cajón deja de traer la ficha armada: el jugador la compone con dígitos. */
  readonly keyboard: boolean;
}

/**
 * Los siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca
 * las dos cosas.
 *
 * Lo que no es dificultad —el modo, si los dientes se cuentan, la piel de la
 * pista, la regla, el teclado— vive afuera de `params` justamente para que la
 * regla se pueda comprobar. Por eso los niveles 4 y 5, que cambian de capa,
 * conservan el rango del 3: endurecerlo ahí rompería la regla, y el rango grande
 * entra entero en el 6, que es el nivel que endurece y no cambia de capa.
 */
export const UNDO_LEVELS: readonly UndoLevel[] = [
  {
    n: 1,
    titleKey: "level.backInOneTug",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 4,
    params: {
      step: [2, 4],
      keyRing: 3,
      allowZero: false,
      allowFullReturn: false,
      unknown: "none",
      distractors: ["one_more", "one_less", "endpoint"],
    },
    mode: "turn",
    labeled: false,
    skin: "stone",
    ruler: false,
    keyboard: false,
  },
  {
    n: 2,
    titleKey: "level.chooseWithoutTrying",
    layer: "concrete",
    evidence: ["recognize"],
    rounds: 4,
    params: {
      step: [2, 4],
      keyRing: 3,
      allowZero: false,
      allowFullReturn: false,
      unknown: "none",
      distractors: ["one_more", "one_less", "endpoint"],
    },
    mode: "pick",
    labeled: true,
    skin: "stone",
    ruler: false,
    keyboard: false,
  },
  {
    n: 3,
    titleKey: "level.theReturnThatOvershoots",
    layer: "concrete",
    evidence: ["explain"],
    rounds: 3,
    params: {
      step: [2, 4],
      keyRing: 3,
      allowZero: false,
      allowFullReturn: false,
      unknown: "none",
      distractors: ["one_more", "one_less", "endpoint"],
    },
    mode: "judge",
    labeled: true,
    skin: "stone",
    ruler: false,
    keyboard: false,
  },
  {
    n: 4,
    titleKey: "level.twoWalkers",
    layer: "visual",
    evidence: ["apply"],
    rounds: 4,
    params: {
      step: [2, 4],
      keyRing: 3,
      allowZero: false,
      allowFullReturn: false,
      unknown: "none",
      distractors: ["one_more", "one_less", "endpoint"],
    },
    mode: "measure",
    labeled: true,
    skin: "mark",
    ruler: true,
    keyboard: false,
  },
  {
    n: 5,
    titleKey: "level.minusRow",
    layer: "symbolic",
    evidence: ["manipulate", "apply"],
    rounds: 5,
    params: {
      step: [2, 4],
      keyRing: 3,
      allowZero: false,
      allowFullReturn: false,
      unknown: "none",
      distractors: ["one_more", "one_less", "endpoint"],
    },
    mode: "write",
    labeled: true,
    skin: "onDemand",
    ruler: true,
    keyboard: false,
  },
  {
    n: 6,
    titleKey: "level.bigNumbersZeroAndBack",
    layer: "symbolic",
    evidence: ["apply"],
    rounds: 5,
    params: {
      step: [0, 30],
      keyRing: 4,
      allowZero: true,
      allowFullReturn: true,
      unknown: "minuend",
      distractors: ["one_more", "one_less", "endpoint"],
    },
    mode: "write",
    labeled: true,
    skin: "onDemand",
    ruler: true,
    keyboard: true,
  },
  {
    n: 7,
    titleKey: "level.locksThatArentSteps",
    layer: "visual",
    evidence: ["generalize"],
    rounds: 4,
    params: {
      step: [0, 30],
      keyRing: 4,
      allowZero: true,
      allowFullReturn: true,
      unknown: "minuend",
      distractors: ["one_more", "one_less", "endpoint"],
    },
    mode: "unlock",
    labeled: true,
    skin: "hidden",
    ruler: false,
    keyboard: false,
  },
];

/** Una llave del llavero. Sus dientes son los pasos que vuelve. */
export interface UndoKey {
  readonly id: string;
  /** Cuántos pasos vuelve. Cero es la llave sin dientes. */
  readonly teeth: number;
  readonly correct: boolean;
  readonly lure?: KeyLure;
  /** El error del catálogo de L que este señuelo clasifica, si lo hay. */
  readonly misconception?: string;
}

/** Una ficha del cajón, para el renglón y para la regla. */
export interface RowTile {
  readonly id: string;
  readonly value: number;
  readonly correct: boolean;
  readonly misconception?: string;
}

/** Una cerradura que no es un tramo, y la acción que la deshace. */
export interface Lock {
  readonly kind: LockKind;
  /** Los pasos, cuando la cerradura sí es un tramo. */
  readonly value: number;
}

export interface ActionKey {
  readonly id: string;
  readonly kind: LockKind;
  readonly value: number;
  readonly correct: boolean;
  /** La acción que no tiene vuelta: no abre ningún cofre. */
  readonly uninvertible: boolean;
}

/**
 * El renglón. Los tres números son siempre los mismos y lo único que cambia es
 * qué papel juega cada uno: eso es lo que el nodo afirma cuando dice que sus
 * dos caras son una.
 */
export interface Row {
  readonly minuend: number;
  readonly subtrahend: number;
  readonly result: number;
  /** Qué casilla está vacía. */
  readonly hidden: "result" | "minuend";
  readonly face: RowFace;
}

export interface UndoProblem {
  readonly mode: UndoMode;
  /** Cuántas piedras dibuja la pista. */
  readonly track: number;
  /** La piedra del cofre: de donde salió el viaje, y el resultado de la resta. */
  readonly home: number;
  /** El tramo de ida, que es el sustraendo. */
  readonly step: number;
  /** La piedra donde quedó el caminante: `home + step`. Es el minuendo. */
  readonly landing: number;
  readonly keys: readonly UndoKey[];
  /** Los dos regresos de `judge`, piedra por piedra. */
  readonly returns: readonly (readonly number[])[];
  /** Cuál de los dos regresos se pasa: el que hay que tocar. */
  readonly liar: number;
  /** Las dos piedras de la regla plegable, cuando el nivel mide en vez de deshacer. */
  readonly marks: readonly [number, number] | null;
  readonly row: Row;
  readonly tiles: readonly RowTile[];
  readonly lock: Lock;
  readonly actions: readonly ActionKey[];
}

// --- El modelo ---------------------------------------------------------------

/**
 * Dónde queda el caminante al girar la manivela hacia atrás. El `max` es la
 * orilla: en esta pista no hay piedras antes del `0`, y ese tope no es un error
 * sino la promesa de `arith.int.negatives`.
 */
export function returnTo(from: number, teeth: number): number {
  return Math.max(0, Math.trunc(from) - Math.trunc(teeth));
}

/** La manivela se traba cuando la vuelta pide piedras que la pista no tiene. */
export function jams(from: number, teeth: number): boolean {
  return Math.trunc(teeth) > Math.trunc(from);
}

/**
 * El invariante del nodo, escrito como una función: la vuelta devuelve al punto
 * exacto si, y solo si, mide lo mismo que la ida.
 */
export function opens(home: number, landing: number, teeth: number): boolean {
  return !jams(landing, teeth) && returnTo(landing, teeth) === home;
}

/** La segunda cara: la resta también dice cuántos pasos separan dos piedras. */
export function distanceBetween(a: number, b: number): number {
  return Math.abs(b - a);
}

// --- El generador ------------------------------------------------------------

/** Genera una instancia del nivel dado. La semilla la hace reproducible. */
export function generateUndo(level: UndoLevel, seed: number): UndoProblem {
  const rnd = makeRandom(seed);
  const p = level.params;
  const [lo, hi] = p.step;
  // El alcance de los numerales puede pasarse de la pista dibujada: que se pase
  // es justo lo que endurece el nivel 6, donde la recta deja de alcanzar.
  const reach = Math.max(TRACK - 1, hi);
  const bajo = Math.max(lo, 1);

  // Los dos casos que rompen las lecturas fáciles, cuando el nivel los habilita:
  // la llave sin dientes rompe "restar siempre mueve" y la vuelta entera hace
  // aparecer el `0` como resultado.
  const special = rnd.int(0, 3);
  let step = rnd.int(bajo, Math.max(bajo, hi));
  let home: number;
  if (p.allowZero && special === 0) {
    step = 0;
    home = rnd.int(1, reach);
  } else if (p.allowFullReturn && special === 1) {
    home = 0;
  } else if (level.mode === "judge") {
    // El cofre cerca de la orilla, pero nunca en ella: con el cofre en el `0` la
    // vuelta de un paso de más se topa con el borde, termina donde termina la
    // exacta, y las dos animaciones dejarían de distinguirse.
    home = rnd.int(1, Math.max(1, Math.min(3, reach - step)));
  } else {
    home = rnd.int(1, Math.max(1, reach - step));
  }
  const landing = home + step;

  // El que se pasa no puede estar siempre en la misma fila: si estuviera, el
  // jugador acertaría sin mirar la animación.
  const pair = level.mode === "judge" ? returnPair(home, landing) : [];
  const liarFirst = pair.length === 2 && rnd.bool();

  const face: RowFace =
    level.mode === "measure" ? "distance"
    : level.mode === "write" ? (rnd.bool() ? "undo" : "distance")
    : "undo";
  const row = buildRow(face, home, step, landing, p.unknown);

  return {
    mode: level.mode,
    track: TRACK,
    home,
    step,
    landing,
    keys: makeKeys(step, landing, p, rnd),
    returns: liarFirst ? [pair[1] as number[], pair[0] as number[]] : pair,
    liar: liarFirst ? 0 : 1,
    marks: step > 0 ? [home, landing] : null,
    row,
    tiles: makeTiles(row, landing, rnd),
    ...makeLock(level, rnd),
  };
}

function buildRow(
  face: RowFace,
  home: number,
  step: number,
  landing: number,
  unknown: UndoParams["unknown"],
): Row {
  const hidden = unknown === "minuend" ? "minuend" : "result";
  // Los mismos tres números y los papeles cambiados: deshacer un viaje escribe
  // `landing - step = home`, y medir entre dos piedras, `landing - home = step`.
  return face === "undo"
    ? { minuend: landing, subtrahend: step, result: home, hidden, face }
    : { minuend: landing, subtrahend: home, result: step, hidden, face };
}

/**
 * El llavero. Las llaves equivocadas no son ruido: son los tres desvíos que el
 * diseño nombra, y la del numeral de la piedra de llegada es la única que
 * corresponde a un error con entrada en el catálogo.
 */
function makeKeys(step: number, landing: number, p: UndoParams, rnd: Random): UndoKey[] {
  const keys: UndoKey[] = [{ id: "k0", teeth: step, correct: true }];
  const seen = new Set<number>([step]);

  for (const lure of rnd.shuffle([...p.distractors])) {
    if (keys.length >= p.keyRing) break;
    const teeth = lure === "one_more" ? step + 1 : lure === "one_less" ? step - 1 : landing;
    if (teeth < 0 || seen.has(teeth)) continue;
    seen.add(teeth);
    keys.push({
      id: `k${keys.length}`,
      teeth,
      correct: false,
      lure,
      // Leer el numeral de la piedra de llegada como si fuera el tramo es
      // `endpoint_read_as_distance`; los desvíos de una unidad son puntería y
      // no tienen entrada en L, así que no clasifican nada.
      ...(lure === "endpoint" ? { misconception: MIS_ENDPOINT } : {}),
    });
  }
  // Si los desvíos se pisaron entre sí, se completa con dientes que no se repitan.
  for (let d = 2; keys.length < p.keyRing; d++) {
    const teeth = step + d;
    if (seen.has(teeth)) continue;
    seen.add(teeth);
    keys.push({ id: `k${keys.length}`, teeth, correct: false });
  }
  return rnd.shuffle(keys);
}

/**
 * Los dos regresos de `explain`, piedra por piedra. El honesto pisa la piedra
 * del cofre; el que miente vuelve un paso de más y queda del otro lado, o se
 * traba en la orilla si el cofre estaba ahí.
 */
function returnPair(home: number, landing: number): number[][] {
  const honest: number[] = [];
  for (let i = landing; i >= home; i--) honest.push(i);
  const liar: number[] = [];
  for (let i = landing; i >= Math.max(0, home - 1); i--) liar.push(i);
  // Sin al menos dos posiciones no hay animación que mirar.
  if (honest.length < 2) honest.push(home);
  if (liar.length < 2) liar.push(liar[0] as number);
  return [honest, liar];
}

/**
 * El cajón. La ficha equivocada más cara es el numeral de la piedra de llegada,
 * que es leer el extremo como si fuera la distancia; con el minuendo tapado
 * aparece además la resta al revés, que es el otro error catalogado del nodo.
 */
function makeTiles(row: Row, landing: number, rnd: Random): RowTile[] {
  const answer = row.hidden === "minuend" ? row.minuend : row.result;
  const tiles: RowTile[] = [{ id: "t0", value: answer, correct: true }];
  const seen = new Set<number>([answer]);

  const push = (value: number, misconception?: string): void => {
    if (value < 0 || seen.has(value) || tiles.length >= 5) return;
    seen.add(value);
    tiles.push({
      id: `t${tiles.length}`,
      value,
      correct: false,
      ...(misconception ? { misconception } : {}),
    });
  };

  if (row.hidden === "minuend") {
    // `x - 3 = 2` resuelto al revés da `3 - 2`: es `subtrahend_order_swapped`.
    push(row.subtrahend - row.result, MIS_ORDER);
    push(row.result, MIS_ENDPOINT);
  } else {
    push(landing, MIS_ENDPOINT);
  }
  for (const d of rnd.shuffle([1, -1, 2])) push(answer + d);
  return rnd.shuffle(tiles);
}

/** Las cerraduras del último nivel, arbitrarias o no, con su llavero. */
function makeLock(
  level: UndoLevel,
  rnd: Random,
): { lock: Lock; actions: readonly ActionKey[] } {
  if (level.mode !== "unlock") {
    return { lock: { kind: "forward", value: 0 }, actions: [] };
  }
  // Alternar tramos y acciones cualesquiera es lo que separa la estructura de
  // los números: la misma pregunta, con y sin cuenta.
  const kind = rnd.pick(["forward", "back", "turn", "hat", "color"] as const);
  const aritmetica = kind === "forward" || kind === "back";
  const value = aritmetica ? rnd.int(1, 4) : 0;
  const inverse: LockKind = kind === "forward" ? "back" : kind === "back" ? "forward" : kind;

  const actions: ActionKey[] = [
    { id: "a0", kind: inverse, value, correct: true, uninvertible: false },
    // La acción sin vuelta, una por instancia: no deshace nada y por eso no abre.
    { id: "a1", kind: "broken", value: 0, correct: false, uninvertible: true },
  ];
  const otras = (["forward", "back", "turn", "hat", "color"] as const).filter(
    (k) => k !== inverse,
  );
  for (const k of rnd.shuffle([...otras])) {
    if (actions.length >= level.params.keyRing) break;
    // Con la cerradura que es un tramo, la trampa central es la misma dirección.
    const v = k === "forward" || k === "back" ? (aritmetica ? value : rnd.int(1, 4)) : 0;
    actions.push({ id: `a${actions.length}`, kind: k, value: v, correct: false, uninvertible: false });
  }
  return { lock: { kind, value }, actions: rnd.shuffle(actions) };
}

export const undoLevelByNumber = (n: number): UndoLevel | undefined =>
  UNDO_LEVELS.find((l) => l.n === n);
export const TOTAL_UNDO_LEVELS = UNDO_LEVELS.length;

registerNode({
  id: NODE,
  n: 4,
  prereqs: ["arith.add.displacement"],
  levels: UNDO_LEVELS,
});
