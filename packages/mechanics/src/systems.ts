/**
 * El libro de frutas, para `alg.sys.two_by_two`.
 *
 * Los siete niveles y qué endurece cada parámetro salen del documento del
 * minijuego y de `D1/16`, no de acá: este archivo los implementa, no los decide.
 *
 * La idea que sostiene todo: un sistema no es un par de ecuaciones que se
 * resuelven por turno, es **una fila que no se puede tocar sin que la otra
 * conteste**. Por eso el objeto del nodo no es una ecuación sino un cartel con
 * dos renglones y un solo diccionario de valores: la ficha que se suelta bajo
 * una fruta aparece bajo todas sus apariciones al mismo tiempo, y las dos filas
 * se vuelven a evaluar juntas. Ese es el segundo invariante del documento, el
 * silencioso: la misma fruta vale lo mismo en todas partes. No se rompe nunca
 * porque el modelo no tiene dónde guardar dos valores para la misma fruta.
 *
 * El primero, `equality_under_identical_actions` en su versión doble, sí se
 * rompe a la vista: cada fila se mantiene derecha por su cuenta y una acción
 * vale si al terminar las dos siguen derechas. De ahí sale el único error que el
 * catálogo declara sobre este nodo, `substitution_ignores_other_row`, que en el
 * modelo es una condición sobre el estado y no una lista de movimientos
 * prohibidos: una fila derecha y la otra inclinada.
 *
 * Los dos métodos son movimientos sobre objetos y no recetas. Sustituir es
 * cambiar una fruta por sus pesas en **las dos filas**, que en el modelo es
 * `sysSubstitute` aplicado a la lista entera. Eliminar es volcar un renglón
 * sobre el otro, que es `sysPour`: los coeficientes se suman término a término y
 * la fruta que aparece con signos opuestos desaparece sola, sin que ninguna
 * regla la borre.
 *
 * Sin texto visible: acá hay datos, claves y estructura. Los numerales y las
 * letras los dibuja la actividad, que es la que sabe componer glifos.
 */

import { makeRandom, type Random } from "./random.ts";
import { registerNode, type LevelBase } from "./node.ts";
import type { Evidence, Layer } from "./one-step.ts";

/** El nodo del grafo que este minijuego enseña. */
export const NODE = "alg.sys.two_by_two";

/**
 * El mismo id, sin ambigüedad. `index.ts` reúne quince minijuegos con `export *`
 * y cada uno declara su propio `NODE`, así que afuera del módulo se lo nombra
 * así. Todo lo demás de este archivo va prefijado por la misma razón.
 */
export const NODE_TWO_BY_TWO = NODE;

// --- El cartel ---------------------------------------------------------------

/** Las dos frutas, y no hay más. `fruits: 1` usa solo la primera. */
export type SysFruit = 0 | 1;

/** Un tramo de una fila: cuántas veces aparece una fruta, con su signo. */
export interface SysTerm {
  readonly fruit: SysFruit;
  readonly coef: number;
}

/**
 * Un renglón del cartel: los tramos a la izquierda, la línea en el medio y el
 * total a la derecha. La línea no está en el dato porque no es un dato: es el
 * igual, y se dibuja inclinada exactamente cuando la fila deja de ser cierta.
 */
export interface SysRow {
  readonly id: string;
  readonly terms: readonly SysTerm[];
  readonly total: number;
}

/** Qué está pasando con una fila. `open` es "todavía no se sabe", no "está mal". */
export type SysState = "open" | "straight" | "tilted";

/** El valor de cada fruta, o `null` mientras nadie lo dijo. */
export type SysValues = readonly (number | null)[];

/** Cuántas veces aparece una fruta en una fila, ya sumadas sus repeticiones. */
export const sysCoef = (row: SysRow, fruit: SysFruit): number =>
  row.terms.reduce((s, t) => s + (t.fruit === fruit ? t.coef : 0), 0);

/** Qué frutas siguen adentro de la fila. */
export const sysFruitsOf = (row: SysRow): SysFruit[] =>
  ([0, 1] as const).filter((f) => sysCoef(row, f) !== 0);

/**
 * Cuánto pesa el lado izquierdo. `null` cuando alguna fruta de la fila todavía
 * no tiene ficha: una fila incompleta no está mal, está abierta.
 */
export function sysEval(row: SysRow, values: SysValues): number | null {
  let total = 0;
  for (const t of row.terms) {
    const v = values[t.fruit];
    if (v === null || v === undefined) return null;
    total += t.coef * v;
  }
  return total;
}

export function sysState(row: SysRow, values: SysValues): SysState {
  const izquierda = sysEval(row, values);
  if (izquierda === null) return "open";
  return izquierda === row.total ? "straight" : "tilted";
}

/**
 * Para qué lado cae la línea: 1 si sobra peso a la izquierda, -1 si falta, 0 si
 * la fila está derecha o abierta. Es lo único que la escena necesita para
 * inclinar la barra, y sale del modelo para que la inclinación no sea un adorno.
 */
export function sysTilt(row: SysRow, values: SysValues): number {
  const izquierda = sysEval(row, values);
  if (izquierda === null) return 0;
  return Math.sign(izquierda - row.total);
}

/** Las dos filas derechas al mismo tiempo: el éxito del nodo, dicho en el modelo. */
export const sysSolved = (rows: readonly SysRow[], values: SysValues): boolean =>
  rows.length > 0 && rows.every((r) => sysState(r, values) === "straight");

// --- Los movimientos ---------------------------------------------------------

/**
 * Junta los tramos de la misma fruta y tira los que quedaron en cero. Es lo que
 * hace visible que una fruta con signos opuestos se cancela: no hay ninguna
 * regla que la borre, se suma con su opuesta y deja de estar.
 */
export function sysNormalize(row: SysRow): SysRow {
  const terms: SysTerm[] = [];
  for (const f of [0, 1] as const) {
    const c = sysCoef(row, f);
    if (c !== 0) terms.push({ fruit: f, coef: c });
  }
  return { ...row, terms };
}

/**
 * Volcar un renglón sobre otro: los dos lados se juntan. `sign` en -1 resta,
 * que es la otra manera de hacer desaparecer una fruta.
 *
 * La fila nueva es cierta porque sumar dos igualdades ciertas da una igualdad
 * cierta, y por eso la que recibe queda derecha sin que nadie la ajuste.
 */
export function sysPour(a: SysRow, b: SysRow, sign: 1 | -1, id: string): SysRow {
  const terms = [...a.terms, ...b.terms.map((t) => ({ fruit: t.fruit, coef: sign * t.coef }))];
  return sysNormalize({ id, terms, total: a.total + sign * b.total });
}

/** Escalar una fila: todos sus términos crecen juntos, incluido el total. */
export const sysScale = (row: SysRow, k: number): SysRow =>
  sysNormalize({ ...row, terms: row.terms.map((t) => ({ ...t, coef: t.coef * k })), total: row.total * k });

/**
 * Cambiar una fruta por sus pesas. Sale de la fila y su peso se descuenta del
 * total, que es exactamente lo que se ve cuando las pesas cruzan la línea.
 */
export function sysSubstitute(row: SysRow, fruit: SysFruit, value: number): SysRow {
  const c = sysCoef(row, fruit);
  if (c === 0) return row;
  return sysNormalize({
    ...row,
    terms: row.terms.filter((t) => t.fruit !== fruit),
    total: row.total - c * value,
  });
}

/** Sustituir en todas las filas a la vez. El reemplazo nunca ocurre en una sola. */
export const sysSubstituteAll = (
  rows: readonly SysRow[],
  fruit: SysFruit,
  value: number,
): SysRow[] => rows.map((r) => sysSubstitute(r, fruit, value));

/** Qué fruta se cancela al volcar, o `null` si no se cancela ninguna. */
export function sysCancels(a: SysRow, b: SysRow, sign: 1 | -1): SysFruit | null {
  for (const f of [0, 1] as const) {
    const ca = sysCoef(a, f);
    const cb = sysCoef(b, f);
    if (ca !== 0 && ca + sign * cb === 0) return f;
  }
  return null;
}

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/**
 * Por cuánto hay que escalar cada fila para que una fruta se cancele al
 * volcarlas. Es la distributiva del nodo 15 aplicada a una fila entera, y el
 * plan más chico es el que menos hincha los números.
 */
export interface SysPlan {
  readonly fruit: SysFruit;
  readonly factors: readonly [number, number];
  readonly sign: 1 | -1;
}

export function sysEliminationPlan(a: SysRow, b: SysRow): SysPlan | null {
  let mejor: SysPlan | null = null;
  for (const f of [0, 1] as const) {
    const ca = sysCoef(a, f);
    const cb = sysCoef(b, f);
    if (ca === 0 || cb === 0) continue;
    const comun = Math.abs(ca * cb) / gcd(Math.abs(ca), Math.abs(cb));
    const ka = Math.abs(comun / ca);
    const kb = Math.abs(comun / cb);
    // Con los signos ya opuestos alcanza con sumar; con el mismo signo, restar.
    const sign: 1 | -1 = Math.sign(ca) === Math.sign(cb) ? -1 : 1;
    const plan: SysPlan = { fruit: f, factors: [ka, kb], sign };
    if (!mejor || ka + kb < mejor.factors[0] + mejor.factors[1]) mejor = plan;
  }
  return mejor;
}

// --- La solución -------------------------------------------------------------

/** Las tres configuraciones de rectas, que son las tres clases de sistema. */
export type SysKind = "unique" | "none" | "infinite";

export interface SysSolution {
  readonly kind: SysKind;
  /** El par que cumple las dos filas, o `null` si no hay uno solo. */
  readonly at: readonly [number, number] | null;
}

/**
 * El cruce de las dos rectas. Con el determinante en cero las filas son
 * proporcionales: o dicen lo mismo, y entonces sobran infinitos pares, o se
 * contradicen, y entonces no hay ninguno.
 */
export function sysSolve(a: SysRow, b: SysRow): SysSolution {
  const a1 = sysCoef(a, 0);
  const b1 = sysCoef(a, 1);
  const a2 = sysCoef(b, 0);
  const b2 = sysCoef(b, 1);
  const det = a1 * b2 - a2 * b1;
  if (det !== 0) {
    return {
      kind: "unique",
      at: [(a.total * b2 - b.total * b1) / det, (a1 * b.total - a2 * a.total) / det],
    };
  }
  const mismaRecta = a1 * b.total === a2 * a.total && b1 * b.total === b2 * a.total;
  return { kind: mismaRecta ? "infinite" : "none", at: null };
}

/** La recta que dibuja una fila en la grilla: `a x + b y = c`. */
export interface SysLine {
  readonly a: number;
  readonly b: number;
  readonly c: number;
}

export const sysLineOf = (row: SysRow): SysLine => ({
  a: sysCoef(row, 0),
  b: sysCoef(row, 1),
  c: row.total,
});

// --- Lo que endurece ---------------------------------------------------------

/** Cuántas filas hay que escalar antes de que una fruta se cancele. */
export type SysScaling = "none" | "one_row" | "both_rows";

/** El orden en que las tres exigen más, para poder comprobarlo con un test. */
export const SYS_SCALING_ORDER: readonly SysScaling[] = ["none", "one_row", "both_rows"];

/**
 * Lo único que endurece. La capa, la pregunta, la piel, la balanza fantasma y
 * la grilla viven afuera justamente para que la regla del diseño, un nivel
 * cambia de capa o endurece parámetros pero nunca las dos cosas, se pueda
 * comprobar con un test.
 */
export interface SysParams {
  /** Cuántos renglones tiene el cartel. Uno, y dos desde el nivel 3. */
  readonly rows: number;
  /** Cuántas frutas distintas hay. Una o dos, nunca más. */
  readonly fruits: number;
  /** Cuántas veces puede repetirse una fruta en una fila. */
  readonly coefficients: readonly [number, number];
  /** Cuánto puede valer una fruta. */
  readonly solutions: readonly [number, number];
  /** Una fila puede restar una fruta, apoyada en `arith.int.negatives`. */
  readonly subtraction: boolean;
  readonly scaling: SysScaling;
  /** Los términos vienen en distinto orden en cada fila. */
  readonly shuffled: boolean;
  /** Una fruta puede valer un número negativo. */
  readonly negatives: boolean;
}

/**
 * Qué se pregunta en una ronda. No es dificultad: es qué gesto contesta.
 *
 * - `share`: repartir el total entre las frutas repetidas de una fila sola. Es
 *   la etapa 1 del ejemplo de frutas de H, 🍎 + 🍎 + 🍎 = 30.
 * - `pairs`: encontrar varios pares que dejan derecha una fila con dos frutas,
 *   y descubrir que ninguno es "la" respuesta.
 * - `substitute`: una fila revela una fruta y la otra la recibe. El toque
 *   cambia la fruta por sus pesas en las dos filas al mismo tiempo.
 * - `pour`: volcar un renglón sobre el otro hasta que una fruta se cancela.
 * - `choose`: el sistema no favorece a ninguno de los dos métodos y el jugador
 *   elige, que es lo que el nodo llama estar en `abstract`.
 * - `classify`: decir de qué clase es el sistema antes de resolverlo, con la
 *   grilla desplegada. Arma su propio sistema y no lee `params`.
 */
export type SysAsk = "share" | "pairs" | "substitute" | "pour" | "choose" | "classify";

/** Las etapas de desvanecimiento del cartel: el objeto, la barra, la ficha. */
export type SysSkin = "objects" | "bars" | "chips";

export interface SysLevel extends LevelBase {
  readonly params: SysParams;
  /** Qué pide cada ronda, ciclando. Un nivel con dos preguntas alterna. */
  readonly asks: readonly SysAsk[];
  readonly skin: SysSkin;
  /** La balanza al costado: el fantasma que dice que la fila es una balanza acostada. */
  readonly balance: "hidden" | "onDemand";
  /** La grilla plegada al costado. Nace en el penúltimo nivel y ya no se va. */
  readonly grid: boolean;
  /** La llave que abraza los dos renglones. Es el símbolo que nace acá. */
  readonly brace: boolean;
  /** Las frutas ya cedieron su lugar a las letras. */
  readonly letters: boolean;
  /**
   * Los errores del catálogo que este nivel clasifica. Un movimiento que el
   * nivel no declara se muestra igual, la línea se inclina, pero el `attempt`
   * va sin campo: anotar un error que el diseño todavía no está evaluando
   * ensucia la remediación para siempre.
   */
  readonly classifies: readonly string[];
  /** La definición corta con voz. Solo en `formal`. */
  readonly definition: boolean;
}

/**
 * El único error que el catálogo de L declara sobre este nodo. Los tres que la
 * ficha del minijuego nombra, `variable_as_label`, `inverse_applied_one_side` y
 * `sign_flip_on_move`, son heredados de los prerequisitos y **no listan a este
 * nodo** en `misconceptions.yaml`, así que ningún movimiento de acá puede
 * viajar con ellos: la regla del repositorio manda que el `attempt` vaya sin
 * campo cuando el catálogo no apunta al nodo.
 */
export const SYS_MISCONCEPTION = "substitution_ignores_other_row";

/**
 * Los siete niveles del documento. Cada uno cambia la capa o endurece los
 * parámetros, nunca las dos cosas:
 *
 * 1 → 2 endurece (entra la segunda fruta), 2 → 3 endurece (entra el segundo
 * renglón y con él la resta), 3 → 4 y 4 → 5 cambian de capa con la misma
 * dificultad numérica, 5 → 6 endurece sin moverse de `symbolic` y 6 → 7 se
 * lleva el nodo a `formal` sin tocar un parámetro.
 *
 * DISCREPANCIA ANOTADA. El documento pide que el nivel 5 sea a la vez el que
 * cambia a `symbolic` y el que estrena los coeficientes distintos de uno y el
 * escalado. La regla del repositorio prohíbe las dos cosas juntas y manda
 * correr el ensanchamiento al nivel siguiente: el nivel 5 hace el morph con la
 * dificultad numérica del 4 y el 6 recibe los coeficientes, el escalado de las
 * dos filas, los negativos y las filas desordenadas de una sola vez. No se
 * pierde nada del recorrido, se reparte distinto.
 *
 * SEGUNDA DISCREPANCIA ANOTADA. El documento llama al nivel 7 `formal` y
 * `abstract`, y además le pide los sistemas sin solución y con infinitas, que
 * son parámetros. Gana la regla por el mismo camino que el nodo 15: los casos
 * degenerados entran como **pregunta** y no como parámetro. `classify` arma su
 * propio sistema y no lee `params`, así que el nivel 7 cambia de capa sin
 * endurecer nada y no se pierde el punto de ruptura del nodo,
 * `contradictory_or_redundant_balances`, que es la puerta a
 * `alg.sys.parallel_or_same_line`. La capa queda en `formal`, que es la que
 * tiene superficie propia; `abstract` en D1 es el estado del nodo y no una
 * pantalla.
 */
export const SYS_LEVELS: readonly SysLevel[] = [
  {
    n: 1,
    titleKey: "level.oneFruitAlone",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 3,
    params: {
      rows: 1,
      fruits: 1,
      coefficients: [1, 3],
      solutions: [2, 9],
      subtraction: false,
      scaling: "none",
      shuffled: false,
      negatives: false,
    },
    asks: ["share"],
    skin: "objects",
    balance: "hidden",
    grid: false,
    brace: false,
    letters: false,
    // Con una sola fila no hay otra que se pueda inclinar, así que el error del
    // catálogo no se puede cometer acá.
    classifies: [],
    definition: false,
  },
  {
    n: 2,
    titleKey: "level.twoFruitsOneRow",
    layer: "concrete",
    evidence: ["recognize", "explain"],
    rounds: 4,
    params: {
      rows: 1,
      fruits: 2,
      coefficients: [1, 3],
      solutions: [2, 9],
      subtraction: false,
      scaling: "none",
      shuffled: false,
      negatives: false,
    },
    asks: ["pairs"],
    skin: "objects",
    balance: "hidden",
    grid: false,
    brace: false,
    letters: false,
    classifies: [],
    definition: false,
  },
  {
    n: 3,
    titleKey: "level.twoRows",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 4,
    params: {
      rows: 2,
      fruits: 2,
      coefficients: [1, 3],
      solutions: [2, 9],
      subtraction: true,
      scaling: "none",
      shuffled: false,
      negatives: false,
    },
    asks: ["substitute"],
    skin: "objects",
    balance: "onDemand",
    grid: false,
    brace: false,
    letters: false,
    classifies: [SYS_MISCONCEPTION],
    definition: false,
  },
  {
    n: 4,
    titleKey: "level.barsAndSegments",
    layer: "visual",
    evidence: ["explain", "manipulate"],
    rounds: 4,
    params: {
      rows: 2,
      fruits: 2,
      coefficients: [1, 3],
      solutions: [2, 9],
      subtraction: true,
      scaling: "none",
      shuffled: false,
      negatives: false,
    },
    asks: ["pour", "substitute"],
    skin: "bars",
    balance: "onDemand",
    grid: false,
    brace: false,
    letters: false,
    classifies: [SYS_MISCONCEPTION],
    definition: false,
  },
  {
    n: 5,
    titleKey: "level.lettersAndBrace",
    layer: "symbolic",
    evidence: ["manipulate", "apply"],
    rounds: 4,
    params: {
      rows: 2,
      fruits: 2,
      coefficients: [1, 3],
      solutions: [2, 9],
      subtraction: true,
      scaling: "none",
      shuffled: false,
      negatives: false,
    },
    asks: ["substitute", "pour"],
    skin: "chips",
    balance: "onDemand",
    grid: false,
    brace: true,
    letters: true,
    classifies: [SYS_MISCONCEPTION],
    definition: false,
  },
  {
    n: 6,
    titleKey: "level.chooseTheMethod",
    layer: "symbolic",
    evidence: ["apply"],
    rounds: 4,
    params: {
      rows: 2,
      fruits: 2,
      coefficients: [1, 4],
      solutions: [2, 12],
      subtraction: true,
      scaling: "both_rows",
      shuffled: true,
      negatives: true,
    },
    asks: ["choose"],
    skin: "chips",
    balance: "onDemand",
    grid: true,
    brace: true,
    letters: true,
    classifies: [SYS_MISCONCEPTION],
    definition: false,
  },
  {
    n: 7,
    titleKey: "level.whenThereIsNoCross",
    layer: "formal",
    evidence: ["generalize"],
    rounds: 5,
    params: {
      rows: 2,
      fruits: 2,
      coefficients: [1, 4],
      solutions: [2, 12],
      subtraction: true,
      scaling: "both_rows",
      shuffled: true,
      negatives: true,
    },
    asks: ["classify"],
    skin: "chips",
    balance: "hidden",
    grid: true,
    brace: true,
    letters: true,
    // Clasificar antes de resolver no reemplaza nada en una sola fila: el error
    // del catálogo es sobre el reemplazo y acá no se reemplaza.
    classifies: [],
    definition: true,
  },
];

// --- El error del catálogo ---------------------------------------------------

/**
 * El error que corresponde al estado del cartel, si el nivel lo está evaluando.
 *
 * No mira qué movimiento se hizo sino cómo quedaron las filas, porque eso es lo
 * que el catálogo describe: una fila resuelta sin la otra deja **una derecha y
 * la otra inclinada**. Dos filas inclinadas es un par equivocado, que es otra
 * cosa y no lleva campo; dos derechas es haber terminado.
 */
export function sysMisconceptionFor(
  level: SysLevel,
  rows: readonly SysRow[],
  values: SysValues,
): string | undefined {
  if (!level.classifies.includes(SYS_MISCONCEPTION)) return undefined;
  const estados = rows.map((r) => sysState(r, values));
  const derechas = estados.filter((e) => e === "straight").length;
  const inclinadas = estados.filter((e) => e === "tilted").length;
  return derechas > 0 && inclinadas > 0 ? SYS_MISCONCEPTION : undefined;
}

// --- Lo que trae una ronda ---------------------------------------------------

export interface SysProblem {
  readonly ask: SysAsk;
  readonly rows: readonly SysRow[];
  /** Lo que vale cada fruta, o `null` cuando la fila sola no lo determina. */
  readonly solution: readonly (number | null)[];
  /** Las fichas numéricas del mostrador. */
  readonly chips: readonly number[];
  /** Los factores de escalado que hay en la bandeja, en `choose`. */
  readonly factors: readonly number[];
  /** Cuántos pares distintos hay que encontrar. Uno salvo en `pairs`. */
  readonly picks: number;
  /** De qué clase es el sistema. Se pregunta en `classify`. */
  readonly kind: SysKind;
  /** Qué fruta se cancela al volcar tal como vienen las filas, o -1. */
  readonly cancels: number;
  /** El plan de eliminación, cuando hay que escalar antes de volcar. */
  readonly plan: SysPlan | null;
}

/** Fichas montadas siempre, para que el árbol de la escena no cambie entre rondas. */
export const SYS_CHIP_SLOTS = 6;
/** Renglones montados siempre: los dos del cartel más el que nace al volcar. */
export const SYS_ROW_SLOTS = 3;
/** Tramos montados siempre en cada renglón: las dos frutas. */
export const SYS_TERM_SLOTS = 2;
/** Fichas de factor montadas siempre. */
export const SYS_FACTOR_SLOTS = 3;
/**
 * Cuántas veces puede repetirse una fruta dibujada en un renglón. No es una
 * decisión de dificultad: es lo que el renglón del cartel puede dibujar sin que
 * las frutas se monten unas sobre otras.
 */
export const SYS_MAX_REPEAT = 4;

// --- El generador ------------------------------------------------------------

/**
 * Genera una ronda. La semilla la hace reproducible; la ronda decide cuál de
 * las preguntas del nivel toca, porque un nivel con dos preguntas tiene que
 * alternarlas y no sortearlas: sorteadas, cuatro rondas pueden no dar nunca
 * evidencia de uno de los dos verbos.
 */
export function generateSystems(level: SysLevel, seed: number, round = 0): SysProblem {
  const rnd = makeRandom(seed);
  const asks = level.asks;
  const ask = (asks[round % asks.length] ?? asks[0]) as SysAsk;

  if (ask === "share") return shareProblem(level, rnd);
  if (ask === "pairs") return pairsProblem(level, rnd);
  if (ask === "substitute") return substituteProblem(level, rnd);
  if (ask === "classify") return classifyProblem(rnd);
  return pourProblem(level, ask, rnd);
}

/** El esqueleto de una ronda: lo que ninguna pregunta usa queda vacío. */
function empty(): SysProblem {
  return {
    ask: "share",
    rows: [],
    solution: [null, null],
    chips: [],
    factors: [],
    picks: 1,
    kind: "unique",
    cancels: -1,
    plan: null,
  };
}

const row = (id: string, terms: readonly SysTerm[], total: number): SysRow => ({ id, terms, total });

/** Un valor de fruta dentro del rango del nivel, con su signo si el nivel lo permite. */
function valorDeFruta(p: SysParams, rnd: Random): number {
  const [lo, hi] = p.solutions;
  const v = rnd.int(lo, hi);
  return p.negatives && rnd.bool() ? -v : v;
}

/**
 * El mostrador. Lleva los valores verdaderos y unos vecinos: una ficha lejana
 * no se prueba nunca, y sin vecinos el jugador acierta por descarte en vez de
 * mirar las filas.
 */
function chipsCon(buenas: readonly number[], rnd: Random, p: SysParams): number[] {
  const set = new Set<number>(buenas);
  let intento = 0;
  while (set.size < SYS_CHIP_SLOTS && intento < 200) {
    intento++;
    const base = buenas[rnd.int(0, Math.max(0, buenas.length - 1))] ?? 1;
    const cerca = base + rnd.int(-3, 3);
    if (cerca === 0) continue;
    if (cerca < 0 && !p.negatives) continue;
    set.add(cerca);
  }
  // Si los vecinos no alcanzaron, se completa hacia arriba desde el rango.
  let extra = p.solutions[1] + 1;
  while (set.size < SYS_CHIP_SLOTS) set.add(extra++);
  return rnd.shuffle([...set]);
}

/** Los términos de una fila, en el orden del cartel o desordenados. */
function ordenar(terms: readonly SysTerm[], p: SysParams, rnd: Random): SysTerm[] {
  return p.shuffled ? rnd.shuffle(terms) : [...terms];
}

/**
 * Repartir: una fila con la misma fruta repetida y un total. Es la etapa 1 del
 * ejemplo de frutas de H y el único nivel donde no hay nada que compartir entre
 * filas, porque hay una sola.
 */
function shareProblem(level: SysLevel, rnd: Random): SysProblem {
  const p = level.params;
  const k = rnd.int(2, Math.max(2, Math.min(SYS_MAX_REPEAT, p.coefficients[1])));
  const v = valorDeFruta(p, rnd);
  return {
    ...empty(),
    ask: "share",
    rows: [row("r0", [{ fruit: 0, coef: k }], k * v)],
    solution: [v, null],
    chips: chipsCon([v], rnd, p),
  };
}

/**
 * Dos frutas en una sola fila. La fila no determina un par y ese es el punto:
 * el jugador encuentra varios y ninguno es "la" respuesta.
 *
 * Los coeficientes se eligen en uno para que los pares que cumplen sean muchos
 * y estén cerca unos de otros: con `2🍎 + 3🍌 = t` la mayoría de las fichas del
 * mostrador no forma ningún par y el nivel se vuelve un acertijo de divisores,
 * que es otra cosa.
 */
function pairsProblem(level: SysLevel, rnd: Random): SysProblem {
  const p = level.params;
  const [lo, hi] = p.solutions;

  // El total tiene que dejar varios pares adentro del rango: con `9 + 9 = 18`
  // hay uno solo y el nivel diría lo contrario de lo que enseña.
  const paresDe = (t: number): number[] => {
    const out: number[] = [];
    for (let x = Math.max(lo, t - hi); x <= Math.min(hi, t - lo); x++) out.push(x);
    return out;
  };
  let total = lo + hi;
  for (let intento = 0; intento < 60; intento++) {
    const t = rnd.int(lo * 2 + 2, hi * 2 - 2);
    if (paresDe(t).length < 4) continue;
    total = t;
    break;
  }

  const fila = row("r0", ordenar([
    { fruit: 0, coef: 1 },
    { fruit: 1, coef: 1 },
  ], p, rnd), total);

  // El mostrador tiene que dar por lo menos tres pares distintos: si diera dos,
  // encontrarlos sería resolver y no explorar.
  const elegidas = rnd.shuffle(paresDe(total)).slice(0, SYS_CHIP_SLOTS);
  // Cada ficha elegida necesita su complemento en el mostrador para servir.
  const set = new Set<number>();
  for (const x of elegidas) {
    if (set.size >= SYS_CHIP_SLOTS) break;
    set.add(x);
    if (set.size < SYS_CHIP_SLOTS) set.add(total - x);
  }
  let extra = 1;
  while (set.size < SYS_CHIP_SLOTS) set.add(extra++);

  return {
    ...empty(),
    ask: "pairs",
    rows: [fila],
    // Ninguna fruta tiene un valor: es exactamente lo que el nivel enseña.
    solution: [null, null],
    chips: rnd.shuffle([...set]),
    picks: 3,
    kind: "infinite",
  };
}

/**
 * Las dos filas del cartel del puesto: la primera dice cuánto vale una fruta y
 * la segunda la usa. Es la escena de D1 §4, tres manzanas y un total arriba,
 * una manzana y una banana abajo.
 *
 * La sustitución se puede hacer porque la fruta de arriba es la misma que la de
 * abajo, y esa es la única razón por la que un sistema se puede resolver.
 */
function substituteProblem(level: SysLevel, rnd: Random): SysProblem {
  const p = level.params;
  const [, hi] = p.coefficients;
  const tope = Math.max(2, Math.min(SYS_MAX_REPEAT, hi));

  let x = 1;
  let y = 1;
  let k = 2;
  let a = 1;
  let b = 1;
  for (let intento = 0; intento < 120; intento++) {
    const xx = valorDeFruta(p, rnd);
    const yy = valorDeFruta(p, rnd);
    const kk = rnd.int(2, tope);
    const aa = rnd.int(1, tope);
    const signo = p.subtraction && rnd.bool() ? -1 : 1;
    const bb = signo * rnd.int(1, tope);
    // Sin negativos habilitados, un total en deuda no se puede dibujar con
    // pesas: el renglón mostraría un número que el nivel todavía no enseñó.
    if (!p.negatives && aa * xx + bb * yy <= 0) continue;
    if (xx === yy) continue;
    x = xx;
    y = yy;
    k = kk;
    a = aa;
    b = bb;
    break;
  }

  const arriba = row("r0", [{ fruit: 0, coef: k }], k * x);
  const abajo = row(
    "r1",
    ordenar([
      { fruit: 0, coef: a },
      { fruit: 1, coef: b },
    ], p, rnd),
    a * x + b * y,
  );

  return {
    ...empty(),
    ask: "substitute",
    rows: [arriba, abajo],
    solution: [x, y],
    chips: chipsCon([x, y], rnd, p),
  };
}

/**
 * Volcar: las dos filas tienen las dos frutas y ninguna se lee sola. Con el
 * escalado apagado, una fruta ya viene con signos opuestos y sumar las filas la
 * cancela a la vista; con el escalado encendido hay que agrandar una fila o las
 * dos antes, que es la distributiva del nodo 15 sobre una fila entera.
 *
 * `choose` usa el mismo armado y solo cambia qué se le pide al jugador: el
 * sistema no favorece a ningún método y el nivel 6 lo endurece por parámetros.
 */
function pourProblem(level: SysLevel, ask: SysAsk, rnd: Random): SysProblem {
  const p = level.params;
  const [, hi] = p.coefficients;

  let a1 = 1;
  let b1 = 1;
  let a2 = 1;
  let b2 = -1;
  let x = 1;
  let y = 1;
  for (let intento = 0; intento < 200; intento++) {
    const xx = valorDeFruta(p, rnd);
    const yy = valorDeFruta(p, rnd);
    const ca1 = rnd.int(1, hi);
    const ca2 = rnd.int(1, hi);
    const cb1 = rnd.int(1, hi);
    let cb2 = rnd.int(1, hi);
    // Sin escalado, la fruta que se va tiene que venir ya cancelada: los dos
    // coeficientes iguales y con signos opuestos.
    if (p.scaling === "none") cb2 = cb1;
    const s1 = 1;
    const s2: 1 | -1 = p.subtraction && (p.scaling === "none" || rnd.bool()) ? -1 : 1;
    if (p.scaling === "none" && s2 === 1) continue;
    const t1 = ca1 * xx + s1 * cb1 * yy;
    const t2 = ca2 * xx + s2 * cb2 * yy;
    const det = ca1 * (s2 * cb2) - ca2 * (s1 * cb1);
    if (det === 0) continue;
    if (xx === yy) continue;
    if (!p.negatives && (t1 <= 0 || t2 <= 0)) continue;
    // Con el escalado encendido el sistema tiene que pedirlo de verdad: el plan
    // más barato tiene que agrandar por lo menos una fila, o el nivel estaría
    // enseñando a escalar con un sistema que no lo necesita. `both_rows` es el
    // techo y no una obligación: el documento lo lista como variante junto con
    // `one_row`, así que un plan que escala una sola fila también entra.
    if (p.scaling !== "none") {
      const prueba = sysEliminationPlan(
        row("a", [{ fruit: 0, coef: ca1 }, { fruit: 1, coef: s1 * cb1 }], t1),
        row("b", [{ fruit: 0, coef: ca2 }, { fruit: 1, coef: s2 * cb2 }], t2),
      );
      if (!prueba || (prueba.factors[0] === 1 && prueba.factors[1] === 1)) continue;
    }
    a1 = ca1;
    b1 = s1 * cb1;
    a2 = ca2;
    b2 = s2 * cb2;
    x = xx;
    y = yy;
    break;
  }

  const arriba = row("r0", ordenar([
    { fruit: 0, coef: a1 },
    { fruit: 1, coef: b1 },
  ], p, rnd), a1 * x + b1 * y);
  const abajo = row("r1", ordenar([
    { fruit: 0, coef: a2 },
    { fruit: 1, coef: b2 },
  ], p, rnd), a2 * x + b2 * y);

  const cancela = sysCancels(arriba, abajo, 1);
  const plan = sysEliminationPlan(arriba, abajo);

  return {
    ...empty(),
    ask,
    rows: [arriba, abajo],
    solution: [x, y],
    chips: chipsCon([x, y], rnd, p),
    // La bandeja de factores aparece cuando hay algo que escalar. Con el
    // escalado apagado sería una bandeja de fichas que no cambian nada, y una
    // herramienta inerte en pantalla se lee como un movimiento que falta hacer.
    factors: p.scaling === "none" ? [] : factoresDe(plan, rnd),
    cancels: cancela === null ? -1 : cancela,
    plan,
  };
}

/**
 * Las fichas de factor de la bandeja. Llevan los dos del plan y un vecino, para
 * que elegir el factor sea mirar los coeficientes y no tomar la única que hay.
 */
function factoresDe(plan: SysPlan | null, rnd: Random): number[] {
  if (!plan) return [];
  const set = new Set<number>([plan.factors[0], plan.factors[1]]);
  let intento = 0;
  while (set.size < SYS_FACTOR_SLOTS && intento < 40) {
    intento++;
    const base = plan.factors[rnd.int(0, 1)] ?? 2;
    const cerca = base + rnd.int(1, 2);
    set.add(cerca);
  }
  let extra = 2;
  while (set.size < SYS_FACTOR_SLOTS) set.add(extra++);
  return rnd.shuffle([...set]);
}

/**
 * Las tres configuraciones de rectas. Es una pregunta y no un parámetro: arma
 * su propio sistema y no lee `params`, y por eso el nivel 7 cambia de capa sin
 * endurecer nada.
 *
 * Las dos degeneradas se construyen desde una fila y no se sortean sueltas: la
 * paralela es la misma fila escalada con otro total, y la superpuesta es la
 * misma fila escalada entera. Así el jugador ve de dónde salen.
 */
function classifyProblem(rnd: Random): SysProblem {
  const clases: readonly SysKind[] = ["unique", "none", "infinite"];
  const kind = rnd.pick(clases);
  const a1 = rnd.int(1, 4);
  const b1 = rnd.bool() ? rnd.int(1, 4) : -rnd.int(1, 4);
  const x = rnd.int(1, 6);
  const y = rnd.int(1, 6);
  const t1 = a1 * x + b1 * y;
  const k = rnd.int(2, 3);

  const arriba = row("r0", [
    { fruit: 0, coef: a1 },
    { fruit: 1, coef: b1 },
  ], t1);

  if (kind === "infinite") {
    const abajo = sysScale({ ...arriba, id: "r1" }, k);
    return { ...empty(), ask: "classify", rows: [arriba, abajo], kind, solution: [null, null] };
  }
  if (kind === "none") {
    const escalada = sysScale({ ...arriba, id: "r1" }, k);
    const abajo = { ...escalada, total: escalada.total + rnd.int(1, 5) };
    return { ...empty(), ask: "classify", rows: [arriba, abajo], kind, solution: [null, null] };
  }

  // Única: la segunda fila no puede ser proporcional a la primera.
  let a2 = a1 + 1;
  let b2 = b1;
  for (let intento = 0; intento < 60; intento++) {
    const ca = rnd.int(1, 4);
    const cb = rnd.bool() ? rnd.int(1, 4) : -rnd.int(1, 4);
    if (a1 * cb - ca * b1 === 0) continue;
    a2 = ca;
    b2 = cb;
    break;
  }
  const abajo = row("r1", [
    { fruit: 0, coef: a2 },
    { fruit: 1, coef: b2 },
  ], a2 * x + b2 * y);
  return { ...empty(), ask: "classify", rows: [arriba, abajo], kind, solution: [x, y] };
}

export const sysLevelByNumber = (n: number): SysLevel | undefined => SYS_LEVELS.find((l) => l.n === n);
export const TOTAL_SYS_LEVELS = SYS_LEVELS.length;

registerNode({
  id: NODE,
  n: 16,
  prereqs: ["alg.eq.multi_step", "alg.expr.distributive_tiles"],
  levels: SYS_LEVELS,
});

/** Las capas y los verbos que el nodo recorre, para los tests y el mapa. */
export const SYS_LAYERS: readonly Layer[] = ["concrete", "visual", "symbolic", "formal"];
export const SYS_EVIDENCE: readonly Evidence[] = [
  "recognize",
  "explain",
  "manipulate",
  "apply",
  "generalize",
];
