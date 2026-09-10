/**
 * La mecánica de cofres y llaves, para ecuaciones de un paso.
 *
 * Los ocho niveles y qué endurece cada parámetro salen del documento del
 * minijuego, no de acá: este archivo los implementa, no los decide.
 *
 * La idea que sostiene todo: una cerradura es una operación y su llave es la
 * inversa. Que el llavero tenga llaves equivocadas no es un adorno de
 * dificultad; es lo que convierte "hacer la cuenta" en "elegir la operación",
 * que es la capacidad que el nodo desarrolla.
 */

import {
  type BinOp,
  type Equation,
  equation,
  freshId,
  inverseOf,
  num,
  op,
  sym,
} from "@mathy/math-core";
import { makeRandom, type Random } from "./random.ts";

/** El nodo del grafo que este minijuego enseña. */
export const NODE = "alg.eq.one_step";

export type Layer = "concrete" | "visual" | "symbolic" | "formal" | "abstract";
export type Evidence = "recognize" | "explain" | "manipulate" | "apply" | "generalize" | "transfer";

/** Una llave del llavero. Solo una abre. */
export interface Key {
  readonly id: string;
  readonly op: BinOp;
  readonly value: number;
  readonly correct: boolean;
  /** Por qué esta llave está en el llavero, si no es la correcta. */
  readonly lure?: "wrong_inverse_choice" | "sign_flip_on_move" | "near_value";
}

export interface Problem {
  readonly equation: Equation;
  readonly unknown: string;
  readonly solution: number;
  readonly keys: readonly Key[];
  /** La operación que acompaña a la incógnita: la cerradura. */
  readonly lock: { readonly op: BinOp; readonly value: number };
}

export interface LevelParams {
  readonly ops: readonly BinOp[];
  readonly range: readonly [number, number];
  readonly negatives: boolean;
  readonly unknownRight: boolean;
  readonly keyCount: number;
}

export interface Level {
  readonly n: number;
  readonly titleKey: string;
  readonly layer: Layer;
  readonly evidence: readonly Evidence[];
  /** Cuántos problemas hay que resolver para pasar. */
  readonly rounds: number;
  readonly params: LevelParams;
  /** Las llaves llevan etiqueta con el operador y el número, o se distinguen por forma. */
  readonly labeledKeys: boolean;
  /** La balanza se ve, se pide con un toque, o ya no está. */
  readonly balance: "shown" | "onDemand" | "hidden";
}

/**
 * Los ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca
 * las dos cosas, que es la regla del documento del minijuego.
 */
export const LEVELS: readonly Level[] = [
  {
    n: 1,
    titleKey: "level.oneKeyTwoPans",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 4,
    params: { ops: ["+", "-"], range: [1, 9], negatives: false, unknownRight: false, keyCount: 2 },
    labeledKeys: false,
    balance: "shown",
  },
  {
    n: 2,
    titleKey: "level.fourLocks",
    layer: "concrete",
    evidence: ["recognize", "manipulate"],
    rounds: 5,
    params: { ops: ["+", "-", "*", "/"], range: [2, 9], negatives: false, unknownRight: false, keyCount: 4 },
    labeledKeys: false,
    balance: "shown",
  },
  {
    n: 3,
    titleKey: "level.barsAndArrows",
    layer: "visual",
    evidence: ["explain", "manipulate"],
    rounds: 5,
    params: { ops: ["+", "-", "*", "/"], range: [2, 9], negatives: false, unknownRight: false, keyCount: 4 },
    labeledKeys: false,
    balance: "shown",
  },
  {
    n: 4,
    titleKey: "level.tokensBeside",
    layer: "symbolic",
    evidence: ["manipulate", "apply"],
    rounds: 5,
    params: { ops: ["+", "-", "*", "/"], range: [2, 9], negatives: false, unknownRight: false, keyCount: 4 },
    labeledKeys: true,
    balance: "shown",
  },
  {
    n: 5,
    titleKey: "level.ghostBalance",
    layer: "symbolic",
    evidence: ["apply"],
    rounds: 5,
    params: { ops: ["+", "-", "*", "/"], range: [2, 9], negatives: false, unknownRight: false, keyCount: 4 },
    labeledKeys: true,
    balance: "onDemand",
  },
  {
    n: 6,
    titleKey: "level.hardNumbers",
    layer: "symbolic",
    evidence: ["apply"],
    rounds: 6,
    params: { ops: ["+", "-", "*", "/"], range: [2, 40], negatives: true, unknownRight: false, keyCount: 4 },
    labeledKeys: true,
    balance: "onDemand",
  },
  {
    n: 7,
    titleKey: "level.boxOnTheRight",
    layer: "symbolic",
    evidence: ["apply"],
    rounds: 6,
    params: { ops: ["+", "-", "*", "/"], range: [2, 40], negatives: true, unknownRight: true, keyCount: 4 },
    labeledKeys: true,
    balance: "hidden",
  },
  {
    n: 8,
    titleKey: "level.locksNeverSeen",
    layer: "formal",
    evidence: ["generalize"],
    rounds: 5,
    params: { ops: ["+", "-", "*", "/"], range: [2, 40], negatives: true, unknownRight: true, keyCount: 4 },
    labeledKeys: true,
    balance: "hidden",
  },
];

const UNKNOWN = "x";

/** Genera un problema del nivel dado. La semilla lo hace reproducible. */
export function generateOneStep(level: Level, seed: number): Problem {
  const rnd = makeRandom(seed);
  const p = level.params;
  const lockOp = rnd.pick(p.ops);
  const [lo, hi] = p.range;

  let lockValue = lockOp === "/" ? rnd.int(2, Math.min(9, hi)) : rnd.int(lo, hi);
  // Con la cerradura de dividir, la solución es un múltiplo del divisor: el
  // otro plato tiene que poder contarse en pesas enteras.
  let solution =
    lockOp === "/" ? rnd.int(Math.max(1, lo), Math.min(9, hi)) * lockValue : rnd.int(lo, hi);
  // Mientras los negativos no estén habilitados, restar no puede dejar al otro
  // plato vacío ni en deuda: las pesas negativas rompen la balanza física.
  if (lockOp === "-" && !p.negatives) {
    const bajo = Math.max(1, lo);
    lockValue = rnd.int(bajo, Math.max(bajo, hi - 1));
    solution = lockValue + rnd.int(bajo, Math.max(bajo, hi - lockValue));
  }
  if (p.negatives && rnd.bool()) solution = -solution;

  const x = sym(UNKNOWN, freshId("x"));
  const lockNum = num(lockValue, freshId("lock"));
  const lhs = op(lockOp, [x, lockNum], freshId("lock"));

  // El otro lado es lo que da la cerradura aplicada a la solución.
  const rhsValue =
    lockOp === "+" ? solution + lockValue
    : lockOp === "-" ? solution - lockValue
    : lockOp === "*" ? solution * lockValue
    : solution / lockValue;

  const rhs = num(rhsValue, freshId("rhs"));
  const eq = p.unknownRight
    ? equation(rhs, lhs, freshId("eq"))
    : equation(lhs, rhs, freshId("eq"));

  return {
    equation: eq,
    unknown: UNKNOWN,
    solution,
    lock: { op: lockOp, value: lockValue },
    keys: makeKeys(lockOp, lockValue, level, rnd),
  };
}

/**
 * El llavero. La llave correcta es la inversa de la cerradura; las otras son
 * los errores que el diseño cataloga, no ruido al azar.
 */
function makeKeys(lockOp: BinOp, lockValue: number, level: Level, rnd: Random): Key[] {
  const right = inverseOf(lockOp);
  const keys: Key[] = [{ id: "k0", op: right, value: lockValue, correct: true }];

  // El error central del nodo: usar la misma operación en vez de la inversa.
  if (level.params.keyCount > 1) {
    keys.push({ id: "k1", op: lockOp, value: lockValue, correct: false, lure: "wrong_inverse_choice" });
  }
  // Las otras dos operaciones, con el mismo número.
  const others = (["+", "-", "*", "/"] as const).filter((o) => o !== right && o !== lockOp);
  for (const o of others) {
    if (keys.length >= level.params.keyCount) break;
    keys.push({ id: `k${keys.length}`, op: o, value: lockValue, correct: false, lure: "wrong_inverse_choice" });
  }
  // Si todavía falta, una con el número corrido: obliga a mirar el número.
  while (keys.length < level.params.keyCount) {
    keys.push({
      id: `k${keys.length}`,
      op: right,
      value: lockValue + (rnd.bool() ? 1 : -1),
      correct: false,
      lure: "near_value",
    });
  }
  return rnd.shuffle(keys);
}

export const levelByNumber = (n: number): Level | undefined => LEVELS.find((l) => l.n === n);
export const TOTAL_LEVELS = LEVELS.length;
