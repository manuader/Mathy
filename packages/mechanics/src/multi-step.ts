/**
 * Cofres anidados, para `alg.eq.multi_step`.
 *
 * Los siete niveles y qué endurece cada parámetro salen del documento del
 * minijuego y de `D1/14`, no de acá: este archivo los implementa, no los decide.
 *
 * La idea que sostiene todo: el jugador ya sabe elegir una llave y acá elige un
 * **orden**. Por eso el dato central no es la ecuación sino la lista de capas,
 * de afuera hacia adentro, y por eso hay tres desenlaces distintos y no dos.
 *
 * Las tres formas de fallar se sienten distinto porque son distintas:
 *
 * - la llave de una capa interior **rebota**: es la inversa correcta aplicada
 *   antes de tiempo, el movimiento es válido y la ecuación que produce es
 *   cierta, pero más larga. Eso es `unwrap_order_inverted`.
 * - la llave que no deshace ninguna capa **se traba**: no es la inversa de
 *   nada.
 * - la ficha que cruza el igual sin cambiar **inclina la barra**: no es un
 *   movimiento sobre los dos lados. Eso es `sign_flip_on_move`.
 *
 * La diferencia entre "acerca" y "es válido pero inútil" no la decide una tabla:
 * la decide `goalCost` de `@mathy/math-core`, que cuenta cuántos nodos
 * acompañan a la incógnita. Un movimiento acerca si y solo si esa cuenta baja.
 * La estructura de capas decide el *mensaje*; la cuenta decide el *veredicto*.
 *
 * Sin texto visible: acá solo hay claves y datos.
 */

import {
  type BinOp,
  type Equation,
  type MathNode,
  type NodeId,
  type Trace,
  applyBothSides,
  equation,
  freshId,
  goalCost,
  inverseOf,
  num,
  op,
  sym,
} from "@mathy/math-core";
import { makeRandom, type Random } from "./random.ts";
import { registerNode, type LevelBase } from "./node.ts";

/** El nodo del grafo que este minijuego enseña. */
export const NODE = "alg.eq.multi_step";

/**
 * El mismo id, sin ambigüedad. `index.ts` reúne trece minijuegos con `export *`
 * y cada uno declara su propio `NODE`, así que afuera del módulo se lo nombra
 * así.
 */
export const NODE_MULTI_STEP = NODE;

/** La incógnita del nodo. Una sola, y en un solo lugar del renglón. */
export const MULTI_UNKNOWN = "x";

/** Llaves colgadas del llavero. Es la cuenta de ranuras de la escena. */
export const MULTI_KEY_SLOTS = 4;
/** Fichas numéricas del cajón, para el nivel que arma la llave. */
export const MULTI_TILE_SLOTS = 5;

export type MultiOp = BinOp;

/**
 * Qué se pregunta en una ronda. No es dificultad: es qué gesto contesta.
 *
 * - `solve`: abrir los cofres en orden con las llaves del llavero. Es la
 *   mecánica central y la superficie de los cinco primeros niveles.
 * - `assemble`: el llavero deja de ofrecer llaves prearmadas y el jugador las
 *   construye con una ficha de operación y una de número.
 * - `commute`: todas las capas son la misma operación, así que los dos órdenes
 *   despejan. Es la única ronda donde una llave interior *no* rebota.
 * - `degenerate`: el cofre sin tesoro y el que abre con cualquier llave. No se
 *   contesta con una llave sino diciendo cuál de los dos es.
 */
export type MultiAsk = "solve" | "assemble" | "commute" | "degenerate";

/** Los dos casos especiales del último nivel. `none` es una ecuación normal. */
export type MultiDegenerate = "none" | "no_solution" | "identity";

/**
 * Una envoltura de la incógnita. `depth` 0 es la de más afuera, que es la
 * primera que se abre: la lista siempre viaja de afuera hacia adentro, que es el
 * orden en que se juega.
 */
export interface MultiLayer {
  /** El id del término numérico que la capa agrega. Es el id del árbol. */
  readonly id: NodeId;
  readonly op: MultiOp;
  readonly value: number;
  /** 0 es la capa de más afuera. */
  readonly depth: number;
}

/** Por qué una llave está en el llavero, si no es la que abre ahora. */
export type MultiLure =
  | "unwrap_order_inverted"
  | "sign_flip_on_move"
  | "wrong_inverse"
  | "near_value";

/**
 * Qué hace una llave. `apply` la aplica a los dos lados, que es la única acción
 * que conserva la igualdad; `cross` lleva la ficha al otro lado del igual sin
 * cambiarla, que es la acción que el jugador *cree* que es una sola.
 */
export type MultiKeyKind = "apply" | "cross";

export interface MultiKey {
  readonly id: string;
  readonly op: MultiOp;
  readonly value: number;
  readonly kind: MultiKeyKind;
  /** La capa que esta llave deshace, o null si no deshace ninguna. */
  readonly layer: NodeId | null;
  readonly lure?: MultiLure;
}

/** Una máquina de la tubería: la ida, en el orden en que se fabricó el resultado. */
export interface MultiStage {
  readonly id: NodeId;
  readonly op: MultiOp;
  readonly value: number;
  /** Lo que sale de esta máquina. La escena no calcula: recibe. */
  readonly out: number;
}

export interface MultiProblem {
  readonly ask: MultiAsk;
  readonly equation: Equation;
  readonly unknown: string;
  /** El valor de la incógnita, o null cuando el cofre no tiene tesoro. */
  readonly solution: number | null;
  /** Las capas, de afuera hacia adentro. */
  readonly layers: readonly MultiLayer[];
  readonly keys: readonly MultiKey[];
  /** Las fichas de operación del llavero cuando la llave se arma. */
  readonly ops: readonly MultiOp[];
  /** Las fichas numéricas del cajón cuando la llave se arma. */
  readonly tiles: readonly number[];
  /** Todas las capas son la misma operación: los dos órdenes despejan. */
  readonly commuting: boolean;
  readonly degenerate: MultiDegenerate;
  /** La tubería de ida, de la incógnita al resultado. */
  readonly stages: readonly MultiStage[];
}

export interface MultiLevelParams {
  /** Cuántas capas envuelven a la incógnita. */
  readonly depth: number;
  readonly ops: readonly MultiOp[];
  readonly operand: readonly [number, number];
  /** Tope de los valores intermedios: con la balanza a la vista son pesas. */
  readonly cap: number;
  readonly keyCount: number;
  /** Soluciones fraccionarias. */
  readonly fractions: boolean;
  /**
   * La forma repartida `a·x + b` cae en enteros, así que la balanza testigo la
   * puede dibujar con cajas y pesas. Se suelta cuando la balanza ya se retiró:
   * `(x + 3) / 2 = 4` es una ecuación perfectamente legítima y un plato con dos
   * quintos de pesa no es un objeto que exista.
   */
  readonly distributable: boolean;
  /** La ficha que cruza el igual está en el llavero. */
  readonly cross: boolean;
}

export interface MultiLevel extends LevelBase {
  readonly params: MultiLevelParams;
  readonly asks: readonly MultiAsk[];
  /** Los cofres dibujados, pedidos con un toque, o ya retirados. */
  readonly chests: "drawn" | "onDemand" | "hidden";
  /** El renglón con la ecuación compuesta, y su pila de renglones. */
  readonly row: boolean;
  /** La escalera al costado. */
  readonly ladder: boolean;
  /** Las llaves llevan etiqueta con operador y número. */
  readonly labeledKeys: boolean;
  /** La balanza testigo se ve, se pide con un toque, o ya no está. */
  readonly balance: "shown" | "onDemand" | "hidden";
  /** La tubería plegada que se pide con un toque. */
  readonly pipe: boolean;
  /** La definición corta, escrita además de narrada. */
  readonly definition: boolean;
}

/**
 * Los siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca
 * las dos cosas, que es la regla del documento del minijuego. Lo que cambia
 * junto con la capa —la piel de los cofres, la escalera, la etiqueta de las
 * llaves— no es un parámetro: es cómo se ve lo mismo.
 */
export const MULTI_LEVELS: readonly MultiLevel[] = [
  {
    n: 1,
    titleKey: "level.twoChestsTwoKeys",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 4,
    params: {
      depth: 2,
      ops: ["+", "*"],
      operand: [1, 9],
      cap: 40,
      keyCount: 3,
      fractions: false,
      distributable: true,
      cross: false,
    },
    asks: ["solve"],
    chests: "drawn",
    row: false,
    ladder: false,
    labeledKeys: false,
    balance: "shown",
    pipe: false,
    definition: false,
  },
  {
    n: 2,
    titleKey: "level.fourNestedLocks",
    layer: "concrete",
    evidence: ["recognize", "manipulate"],
    rounds: 5,
    params: {
      depth: 2,
      ops: ["+", "-", "*", "/"],
      operand: [1, 9],
      cap: 40,
      keyCount: 4,
      fractions: false,
      distributable: true,
      cross: false,
    },
    asks: ["solve"],
    chests: "drawn",
    row: false,
    ladder: false,
    labeledKeys: false,
    balance: "shown",
    pipe: false,
    definition: false,
  },
  {
    n: 3,
    titleKey: "level.boxesAndLadder",
    layer: "visual",
    evidence: ["explain", "manipulate"],
    rounds: 5,
    params: {
      depth: 2,
      ops: ["+", "-", "*", "/"],
      operand: [1, 9],
      cap: 40,
      keyCount: 4,
      fractions: false,
      distributable: true,
      cross: false,
    },
    asks: ["solve"],
    chests: "drawn",
    row: false,
    ladder: true,
    labeledKeys: false,
    balance: "shown",
    pipe: false,
    definition: false,
  },
  {
    n: 4,
    titleKey: "level.mixWithSymbols",
    layer: "symbolic",
    evidence: ["manipulate", "apply"],
    rounds: 5,
    params: {
      depth: 2,
      ops: ["+", "-", "*", "/"],
      operand: [1, 9],
      cap: 40,
      keyCount: 4,
      fractions: false,
      distributable: true,
      cross: false,
    },
    asks: ["solve"],
    chests: "drawn",
    row: true,
    ladder: true,
    labeledKeys: true,
    balance: "shown",
    pipe: true,
    definition: false,
  },
  {
    n: 5,
    titleKey: "level.ghostChests",
    layer: "symbolic",
    evidence: ["apply"],
    rounds: 5,
    params: {
      depth: 2,
      ops: ["+", "-", "*", "/"],
      operand: [1, 9],
      cap: 40,
      keyCount: 4,
      fractions: false,
      distributable: true,
      cross: true,
    },
    asks: ["solve"],
    chests: "onDemand",
    row: true,
    ladder: false,
    labeledKeys: true,
    balance: "onDemand",
    pipe: true,
    definition: false,
  },
  {
    n: 6,
    titleKey: "level.buildTheKey",
    layer: "symbolic",
    evidence: ["apply"],
    rounds: 6,
    params: {
      depth: 3,
      ops: ["+", "-", "*", "/"],
      operand: [1, 30],
      cap: 400,
      keyCount: 4,
      fractions: true,
      distributable: false,
      cross: true,
    },
    asks: ["assemble"],
    chests: "hidden",
    row: true,
    ladder: false,
    labeledKeys: true,
    balance: "hidden",
    pipe: true,
    definition: false,
  },
  {
    n: 7,
    titleKey: "level.newEquations",
    layer: "formal",
    evidence: ["generalize"],
    rounds: 6,
    params: {
      depth: 3,
      ops: ["+", "-", "*", "/"],
      operand: [1, 30],
      cap: 400,
      keyCount: 4,
      fractions: true,
      distributable: false,
      cross: true,
    },
    asks: ["solve", "commute", "degenerate"],
    chests: "hidden",
    row: true,
    ladder: false,
    labeledKeys: true,
    balance: "hidden",
    pipe: true,
    definition: true,
  },
];

export const multiLevelByNumber = (n: number): MultiLevel | undefined =>
  MULTI_LEVELS.find((l) => l.n === n);
export const TOTAL_MULTI_LEVELS = MULTI_LEVELS.length;

// --- Generación --------------------------------------------------------------

/**
 * El valor que puede tomar una capa sin sacar la cadena de los enteros
 * positivos. Devuelve null cuando esta operación no cabe acá: entonces el
 * generador prueba con otra, y por eso la cadena nunca necesita reintentos.
 */
function valorPara(
  o: MultiOp,
  value: number,
  cap: number,
  hi: number,
  rnd: Random,
): { readonly value: number; readonly next: number } | null {
  if (o === "+") {
    const max = Math.min(hi, cap - value);
    if (max < 1) return null;
    const v = rnd.int(1, max);
    return { value: v, next: value + v };
  }
  if (o === "-") {
    // La resta no puede dejar la cadena en cero ni en deuda: las pesas
    // negativas rompen la balanza física, que es el testigo del nodo.
    const max = Math.min(hi, value - 1);
    if (max < 1) return null;
    const v = rnd.int(1, max);
    return { value: v, next: value - v };
  }
  if (o === "*") {
    const max = Math.min(hi, Math.floor(cap / Math.max(value, 1)));
    if (max < 2) return null;
    const v = rnd.int(2, max);
    return { value: v, next: value * v };
  }
  // Dividir solo entra donde hay un divisor: si no lo hay, la cadena elige otra
  // operación en vez de inventar una fracción que la balanza no sabe dibujar.
  const divisores: number[] = [];
  for (let d = 2; d <= Math.min(hi, 9); d++) if (value % d === 0 && value / d >= 1) divisores.push(d);
  if (divisores.length === 0) return null;
  const v = rnd.pick(divisores);
  return { value: v, next: value / v };
}

/**
 * Una capa que sí cabe. El orden de reserva es fijo para que sea reproducible, y
 * la operación de la capa anterior queda al final de la fila: dos capas de sumar
 * son una sola suma disfrazada, y el nodo enseña a componer dos operaciones
 * distintas. Cuando las capas conmutan hay una sola operación permitida y esta
 * preferencia no tiene nada que evitar.
 */
function elegirCapa(
  permitidas: readonly MultiOp[],
  value: number,
  cap: number,
  hi: number,
  rnd: Random,
  evitar: MultiOp | null = null,
): { readonly op: MultiOp; readonly value: number; readonly next: number } {
  const otras = permitidas.filter((o) => o !== evitar);
  const pozo = otras.length > 0 ? otras : permitidas;
  const primera = rnd.pick(pozo);
  const orden: MultiOp[] = [
    primera,
    ...pozo.filter((o) => o !== primera),
    ...permitidas.filter((o) => !pozo.includes(o)),
  ];
  for (const o of orden) {
    const hecho = valorPara(o, value, cap, hi, rnd);
    if (hecho) return { op: o, value: hecho.value, next: hecho.next };
  }
  // Sumar uno siempre cabe salvo contra el tope, y ahí cabe restar uno.
  return value + 1 <= cap
    ? { op: "+", value: 1, next: value + 1 }
    : { op: "-", value: 1, next: value - 1 };
}

interface Cadena {
  readonly solution: number;
  /** De adentro hacia afuera: el orden en que se fabricó el resultado. */
  readonly pasos: readonly { readonly op: MultiOp; readonly value: number; readonly out: number }[];
  readonly result: number;
}

/** La cadena de ida: de la incógnita al resultado, capa por capa. */
function cadena(
  depth: number,
  permitidas: readonly MultiOp[],
  p: MultiLevelParams,
  rnd: Random,
): Cadena {
  const [, hi] = p.operand;
  const techo = Math.min(hi, 9);
  let solution = rnd.int(2, techo);
  const pasos: { op: MultiOp; value: number; out: number }[] = [];
  let value = solution;

  // Una solución fraccionaria se consigue con la capa de más adentro: si la
  // primera máquina multiplica por `d`, la incógnita vale un `d`-avo de lo que
  // sale, y todo lo demás sigue siendo entero.
  if (p.fractions && rnd.bool() && permitidas.includes("*")) {
    // Solo divisores cuyo inverso termina en decimal: `x = 28 / 3` se escribiría
    // `9.333333`, y un número que se corta no es una solución fraccionaria sino
    // una redondeada. El árbol de `math-core` no tiene racionales.
    const d = rnd.pick([2, 4, 5]);
    const m = rnd.int(1, Math.max(1, techo));
    // Un múltiplo exacto de `d` daría un entero y el nivel no diría nada nuevo.
    const numerador = m * d + rnd.int(1, d - 1);
    solution = numerador / d;
    value = numerador;
    pasos.push({ op: "*", value: d, out: value });
  }

  // Dos capas con la misma operación y el mismo número serían la misma llave
  // colgada dos veces, y un llavero con dos llaves idénticas no pregunta nada.
  const usados = new Set(pasos.map((s) => `${s.op}${s.value}`));
  // Y una capa que deshaga a la anterior tampoco sirve: `x × 3 ÷ 3` es la
  // incógnita escrita con dos cofres que se cancelan.
  const vuelta = (c: { readonly op: MultiOp; readonly value: number }): string =>
    `${inverseOf(c.op)}${c.value}`;
  while (pasos.length < depth) {
    const previo = pasos[pasos.length - 1];
    const anterior = previo?.op ?? null;
    const repetida = (c: { readonly op: MultiOp; readonly value: number }): boolean =>
      usados.has(`${c.op}${c.value}`) ||
      (previo !== undefined && vuelta(c) === `${previo.op}${previo.value}`);
    let capa = elegirCapa(permitidas, value, p.cap, hi, rnd, anterior);
    for (let intento = 0; intento < 5 && repetida(capa); intento++) {
      capa = elegirCapa(permitidas, value, p.cap, hi, rnd, anterior);
    }
    usados.add(`${capa.op}${capa.value}`);
    value = capa.next;
    pasos.push({ op: capa.op, value: capa.value, out: value });
  }

  return { solution, pasos, result: value };
}

/**
 * La forma repartida de la cadena: cuántas cajas y cuántas pesas tiene el plato
 * de la incógnita. Es lo que la balanza testigo dibuja, y por eso hay cadenas
 * que un nivel con balanza no puede usar: `(x + 3) / 2` reparte en media caja y
 * pesa y media, y media pesa no es un objeto.
 */
export function multiDistribute(
  stages: readonly { readonly op: MultiOp; readonly value: number }[],
): { readonly boxes: number; readonly units: number } {
  let boxes = 1;
  let units = 0;
  for (const s of stages) {
    if (s.op === "+") units += s.value;
    else if (s.op === "-") units -= s.value;
    else if (s.op === "*") {
      boxes *= s.value;
      units *= s.value;
    } else {
      boxes /= s.value;
      units /= s.value;
    }
  }
  return { boxes, units };
}

/** ¿La balanza puede dibujar este plato con cajas enteras o partidas y pesas? */
function dibujable(stages: readonly { readonly op: MultiOp; readonly value: number }[]): boolean {
  const { boxes, units } = multiDistribute(stages);
  if (!Number.isInteger(units)) return false;
  return Number.isInteger(boxes) || Number.isInteger(1 / boxes);
}

/** Arma la ecuación y las capas a partir de la cadena de ida. */
function armar(
  c: Cadena,
  unknownRight: boolean,
): { readonly equation: Equation; readonly layers: readonly MultiLayer[]; readonly stages: readonly MultiStage[] } {
  const x = sym(MULTI_UNKNOWN, freshId("x"));
  let node: MathNode = x;
  const stages: MultiStage[] = [];
  for (const paso of c.pasos) {
    const hoja = num(paso.value, freshId("capa"));
    node = op(paso.op, [node, hoja], freshId("cofre"));
    stages.push({ id: hoja.id, op: paso.op, value: paso.value, out: paso.out });
  }
  const rhs = num(c.result, freshId("rhs"));
  const eq = unknownRight
    ? equation(rhs, node, freshId("eq"))
    : equation(node, rhs, freshId("eq"));

  // Las capas viajan de afuera hacia adentro, que es el orden en que se abren:
  // la última que se aplicó es la primera que se desarma.
  const layers: MultiLayer[] = [];
  for (let i = stages.length - 1; i >= 0; i--) {
    const s = stages[i] as MultiStage;
    layers.push({ id: s.id, op: s.op, value: s.value, depth: stages.length - 1 - i });
  }
  return { equation: eq, layers, stages };
}

/**
 * El llavero. Las llaves equivocadas no son ruido: cada una es un error que el
 * diseño cataloga, y la más importante es la inversa correcta de una capa
 * interior, que es la que produce `unwrap_order_inverted`.
 */
function armarLlavero(
  layers: readonly MultiLayer[],
  p: MultiLevelParams,
  rnd: Random,
): readonly MultiKey[] {
  const keys: MultiKey[] = [];
  const afuera = layers[0] as MultiLayer;

  layers.forEach((l, i) => {
    if (keys.length >= p.keyCount) return;
    // Dos capas que piden la misma llave la comparten: colgarla dos veces sería
    // dibujar la misma llave dos veces y no agregaría ninguna pregunta.
    if (keys.some((k) => k.op === inverseOf(l.op) && k.value === l.value)) return;
    keys.push({
      id: `k${keys.length}`,
      op: inverseOf(l.op),
      value: l.value,
      kind: "apply",
      layer: l.id,
      // La llave de una capa interior es correcta, pero todavía no: la capa que
      // envuelve está cerrada y la llave rebota contra la tapa.
      ...(i === 0 ? {} : { lure: "unwrap_order_inverted" as MultiLure }),
    });
  });

  // La ficha que cruza el igual sin cambiar: dos acciones donde el jugador vio
  // una sola.
  if (p.cross && keys.length < p.keyCount) {
    keys.push({
      id: `k${keys.length}`,
      op: afuera.op,
      value: afuera.value,
      kind: "cross",
      layer: afuera.id,
      lure: "sign_flip_on_move",
    });
  }

  // La misma operación de una cerradura en vez de su inversa. Con la ficha que
  // cruza el igual ya colgada no entra: serían dos llaves con el mismo signo y
  // el mismo número, indistinguibles en el llavero y distintas al soltarlas.
  const relleno = (layers[1] ?? afuera) as MultiLayer;
  // Cuando la cerradura de adentro ya es la inversa de la de afuera —`x × 3 ÷ 3`—
  // esta llave sería la misma que una de las buenas dibujada dos veces.
  const repetida = keys.some((k) => k.op === relleno.op && k.value === relleno.value);
  if (!p.cross && !repetida && keys.length < p.keyCount) {
    keys.push({
      id: `k${keys.length}`,
      op: relleno.op,
      value: relleno.value,
      kind: "apply",
      layer: null,
      lure: "wrong_inverse",
    });
  }

  // La llave con el número corrido: obliga a mirar el número y no solo el signo.
  // Nunca cae sobre el número de una capa, porque entonces sería una llave buena.
  const prohibidos = new Set(layers.map((l) => l.value));
  const candidatos: number[] = [];
  for (let paso = 1; paso <= 8; paso++) {
    candidatos.push(afuera.value + paso, afuera.value - paso);
  }
  for (const v of candidatos) {
    if (keys.length >= p.keyCount) break;
    if (v < 1 || prohibidos.has(v)) continue;
    prohibidos.add(v);
    keys.push({
      id: `k${keys.length}`,
      op: inverseOf(afuera.op),
      value: v,
      kind: "apply",
      layer: null,
      lure: "near_value",
    });
  }

  return rnd.shuffle(keys);
}

/** Las fichas numéricas del cajón: las que sirven y las que no. */
function armarFichas(layers: readonly MultiLayer[], rnd: Random): readonly number[] {
  const vistos = new Set<number>();
  const tiles: number[] = [];
  for (const l of layers) {
    if (tiles.length >= MULTI_TILE_SLOTS || vistos.has(l.value)) continue;
    vistos.add(l.value);
    tiles.push(l.value);
  }
  let intento = 0;
  while (tiles.length < MULTI_TILE_SLOTS && intento < 40) {
    intento++;
    const base = (layers[intento % layers.length] as MultiLayer).value;
    const v = base + rnd.int(1, 3) * (rnd.bool() ? 1 : -1);
    if (v < 1 || vistos.has(v)) continue;
    vistos.add(v);
    tiles.push(v);
  }
  return rnd.shuffle(tiles);
}

/**
 * El cofre sin tesoro y el que abre con cualquier llave.
 *
 * El diseño los escribe como `2(x + 3) = 2x + 7`, con la incógnita en los dos
 * lados. Acá se construyen con una capa `×0`, que dice lo mismo sin traer la
 * ruptura `unknown_in_two_chests`: el nodo declara que esa imagen se fuerza y
 * que por eso `alg.eq.variable_both_sides` vuelve a la balanza pura. Multiplicar
 * por cero es un cofre que perdió lo que tenía y no hay llave que lo devuelva.
 */
function armarDegenerado(
  p: MultiLevelParams,
  sinSolucion: boolean,
  rnd: Random,
): {
  readonly equation: Equation;
  readonly layers: readonly MultiLayer[];
  readonly stages: readonly MultiStage[];
  readonly degenerate: MultiDegenerate;
} {
  const [, hi] = p.operand;
  const c = rnd.int(2, Math.min(hi, 12));
  const x = sym(MULTI_UNKNOWN, freshId("x"));
  const cero = num(0, freshId("capa"));
  const dentro = op("*", [x, cero], freshId("cofre"));
  const hoja = num(c, freshId("capa"));
  const lhs = op("+", [dentro, hoja], freshId("cofre"));
  const derecha = sinSolucion ? c + rnd.int(1, Math.min(hi, 9)) : c;
  const eq = equation(lhs, num(derecha, freshId("rhs")), freshId("eq"));

  const layers: readonly MultiLayer[] = [
    { id: hoja.id, op: "+", value: c, depth: 0 },
    { id: cero.id, op: "*", value: 0, depth: 1 },
  ];
  const stages: readonly MultiStage[] = [
    { id: cero.id, op: "*", value: 0, out: 0 },
    { id: hoja.id, op: "+", value: c, out: c },
  ];
  return {
    equation: eq,
    layers,
    stages,
    degenerate: sinSolucion ? "no_solution" : "identity",
  };
}

/**
 * Genera un problema del nivel dado. La semilla lo hace reproducible y `round`
 * elige qué se pregunta, porque un nivel puede alternar entre dos gestos.
 */
export function generateMultiStep(level: MultiLevel, seed: number, round = 0): MultiProblem {
  const rnd = makeRandom(seed);
  const p = level.params;
  const ask = level.asks[round % level.asks.length] as MultiAsk;

  if (ask === "degenerate") {
    const sinSolucion = Math.floor(round / level.asks.length) % 2 === 0;
    const d = armarDegenerado(p, sinSolucion, rnd);
    return {
      ask,
      equation: d.equation,
      unknown: MULTI_UNKNOWN,
      solution: null,
      layers: d.layers,
      // El cofre `×0` no tiene llave: el llavero cuelga la del `+c` y las que no
      // deshacen nada, y la respuesta del nivel no es una llave sino cuál de los
      // dos cofres es.
      keys: armarLlavero([d.layers[0] as MultiLayer], { ...p, keyCount: 3 }, rnd),
      ops: [],
      tiles: [],
      commuting: false,
      degenerate: d.degenerate,
      stages: d.stages,
    };
  }

  // Con capas que conmutan todas son la misma operación, y por eso los dos
  // órdenes despejan: son dos cofres del mismo tamaño y no uno adentro del otro.
  const conmutan = ask === "commute";
  // Con una sola operación permitida la cadena nunca cae en el reemplazo de
  // reserva, y sumar siempre cabe: si la ronda que enseña la conmutación se
  // armara con dos operaciones distintas, no enseñaría nada.
  const permitidas: readonly MultiOp[] = conmutan ? ["+"] : p.ops;
  const depth = conmutan ? 2 : p.depth;
  // Con la balanza a la vista la cadena tiene que caer en enteros al repartirse.
  // Se vuelve a tirar en vez de corregirse a mano: la semilla la hace igual de
  // reproducible y no hay ninguna cadena privilegiada.
  let c = cadena(depth, permitidas, p, rnd);
  for (let intento = 0; intento < 12 && p.distributable && !dibujable(c.pasos); intento++) {
    c = cadena(depth, permitidas, p, rnd);
  }
  const { equation: eq, layers, stages } = armar(c, false);

  return {
    ask,
    equation: eq,
    unknown: MULTI_UNKNOWN,
    solution: c.solution,
    layers,
    keys: ask === "assemble" ? [] : armarLlavero(layers, p, rnd),
    ops: ask === "assemble" ? (["+", "-", "*", "/"] as const) : [],
    tiles: ask === "assemble" ? armarFichas(layers, rnd) : [],
    commuting: conmutan,
    degenerate: "none",
    stages,
  };
}

// --- Jugar -------------------------------------------------------------------

/** El orden en que hay que abrir: los ids de las capas, de afuera hacia adentro. */
export const multiUnwrapOrder = (layers: readonly MultiLayer[]): readonly NodeId[] =>
  layers.map((l) => l.id);

/** Las capas que todavía envuelven a la incógnita, de afuera hacia adentro. */
export const multiPending = (
  layers: readonly MultiLayer[],
  opened: readonly NodeId[],
): readonly MultiLayer[] => layers.filter((l) => !opened.includes(l.id));

/** La capa expuesta: la única que tiene cerradura al alcance. */
export const multiOuterLayer = (
  layers: readonly MultiLayer[],
  opened: readonly NodeId[],
): MultiLayer | undefined => multiPending(layers, opened)[0];

/**
 * Las capas pendientes conmutan cuando todas son la misma operación. Con eso
 * los dos órdenes despejan y ninguna llave rebota, que es exactamente lo que el
 * último nivel pide descubrir.
 */
export function multiCommutes(
  layers: readonly MultiLayer[],
  opened: readonly NodeId[],
): boolean {
  const pendientes = multiPending(layers, opened);
  if (pendientes.length < 2) return false;
  const primera = pendientes[0] as MultiLayer;
  return pendientes.every((l) => l.op === primera.op);
}

/** La llave que abre ahora, si el llavero la tiene colgada. */
export function multiCorrectKey(
  problem: MultiProblem,
  opened: readonly NodeId[],
): MultiKey | undefined {
  const capa = multiOuterLayer(problem.layers, opened);
  if (!capa) return undefined;
  return problem.keys.find(
    (k) => k.kind === "apply" && k.op === inverseOf(capa.op) && k.value === capa.value,
  );
}

/**
 * Los ids del catálogo de [L](../../docs/L-modelo-errores/misconceptions.yaml)
 * que apuntan a este nodo. Los otros dos señuelos no tienen entrada acá, y por
 * eso su movimiento va sin campo: `wrong_inverse_choice` está catalogada pero
 * **no lista este nodo**, y cambiar el número de la llave no es una idea
 * equivocada sino puntería. Un id inventado ensucia la remediación para siempre.
 */
export const MULTI_MISCONCEPTION = {
  unwrap_order_inverted: "unwrap_order_inverted",
  sign_flip_on_move: "sign_flip_on_move",
  wrong_inverse: null,
  near_value: null,
} as const satisfies Readonly<Record<MultiLure, string | null>>;

export const multiMisconceptionFor = (lure: MultiLure | undefined): string | undefined =>
  lure ? (MULTI_MISCONCEPTION[lure] ?? undefined) : undefined;

/**
 * Los cuatro desenlaces de un movimiento.
 *
 * - `opens`: la capa de afuera cedió y la incógnita quedó más sola.
 * - `stalls`: movimiento válido pero inútil. La ecuación que produce es cierta y
 *   más larga, así que la llave rebota y el renglón no cambia.
 * - `jams`: la llave no deshace ninguna capa. Gira un cuarto y se traba.
 * - `tilts`: la ficha cruzó el igual sin cambiar. La barra se hunde.
 */
export type MultiVerdict = "opens" | "stalls" | "jams" | "tilts";

export interface MultiMove {
  readonly verdict: MultiVerdict;
  /** La ecuación que el movimiento produce. Solo `opens` la deja puesta. */
  readonly next: Equation;
  readonly trace: Trace;
  /** Cuántos nodos acompañaban a la incógnita, y cuántos la acompañan después. */
  readonly costBefore: number;
  readonly cost: number;
  /** La capa que quedó abierta, o null. */
  readonly layer: NodeId | null;
  readonly misconception?: string;
}

/**
 * Lleva una capa que conmuta al lugar de más afuera, conservando la identidad de
 * cada término.
 *
 * Solo se llama cuando todas las capas pendientes son la misma operación, así
 * que permutar las hojas no cambia el valor: `x + 2 + 3` y `x + 3 + 2` son la
 * misma cadena leída en otro orden. Los ids de los nodos de operación se quedan
 * en su posición y los numerales viajan, que es lo que hace que la animación
 * muestre las dos fichas intercambiándose en vez de nacer y morir.
 */
export function multiBringOut(
  eq: Equation,
  unknown: string,
  layerId: NodeId,
): Equation {
  const enIzquierda = ladoConIncognita(eq, unknown) === "lhs";
  const lado = enIzquierda ? eq.lhs : eq.rhs;
  const pelado = pelar(lado, unknown);
  if (!pelado) return eq;
  const { root, wraps } = pelado;
  const objetivo = wraps.findIndex((w) => w.leaf.id === layerId);
  if (objetivo <= 0) return eq;

  const orden = [wraps[objetivo] as Wrap, ...wraps.filter((_, i) => i !== objetivo)];
  let node: MathNode = root;
  for (let i = orden.length - 1; i >= 0; i--) {
    const puesto = orden[i] as Wrap;
    const posicion = wraps[i] as Wrap;
    node = op(puesto.op, [node, puesto.leaf], posicion.id);
  }
  return enIzquierda ? equation(node, eq.rhs, eq.id) : equation(eq.lhs, node, eq.id);
}

interface Wrap {
  readonly id: NodeId;
  readonly op: MultiOp;
  readonly leaf: MathNode;
}

/**
 * Desarma el lado de la incógnita en sus envolturas, de afuera hacia adentro:
 * el recorrido arranca en el nodo de más afuera, que es el primero que se abre.
 */
function pelar(
  side: MathNode,
  unknown: string,
): { readonly root: MathNode; readonly wraps: readonly Wrap[] } | null {
  const wraps: Wrap[] = [];
  let node = side;
  while (node.kind === "op" && node.args.length === 2) {
    const head = node.args[0];
    const tail = node.args[1];
    if (!head || !tail) break;
    wraps.push({ id: node.id, op: node.op, leaf: tail });
    node = head;
  }
  if (node.kind !== "sym" || node.name !== unknown) return null;
  return { root: node, wraps };
}

const ladoConIncognita = (eq: Equation, unknown: string): "lhs" | "rhs" =>
  [...walkSym(eq.lhs)].includes(unknown) ? "lhs" : "rhs";

function* walkSym(node: MathNode): Generator<string> {
  if (node.kind === "sym") yield node.name;
  if (node.kind === "op") for (const a of node.args) yield* walkSym(a);
}

/**
 * Qué pasa cuando el jugador prueba una llave.
 *
 * El veredicto no sale de una tabla de casos: sale de `goalCost`. Un movimiento
 * acerca si y solo si la incógnita queda con menos nodos encima, y todo lo demás
 * —aunque sea una igualdad perfectamente cierta— es válido pero inútil. La
 * estructura de capas solo decide **qué se le muestra al jugador**: rebote si la
 * llave era de una capa tapada, traba si no era de ninguna.
 */
export function multiJudge(
  eq: Equation,
  key: MultiKey,
  problem: MultiProblem,
  opened: readonly NodeId[],
): MultiMove {
  const unknown = problem.unknown;
  const costBefore = goalCost(eq, unknown);

  if (key.kind === "cross") {
    return {
      verdict: "tilts",
      next: multiCross(eq, key, unknown),
      trace: { kept: [], created: [], removed: [], merged: [], annihilated: [] },
      costBefore,
      cost: costBefore,
      layer: null,
      misconception: MULTI_MISCONCEPTION.sign_flip_on_move,
    };
  }

  const pendientes = multiPending(problem.layers, opened);
  const capa = pendientes.find((l) => inverseOf(l.op) === key.op && l.value === key.value);
  const conmutan = problem.commuting && multiCommutes(problem.layers, opened);
  const alcanzable = capa !== undefined && (capa === pendientes[0] || conmutan);

  const base = alcanzable && capa !== pendientes[0] ? multiBringOut(eq, unknown, capa.id) : eq;
  const res = applyBothSides(base, key.op, key.value, unknown);

  // La cuenta manda: si la incógnita no quedó más sola, el movimiento no acerca
  // por más que la igualdad siga siendo cierta.
  if (alcanzable && res.cost < costBefore) {
    return {
      verdict: "opens",
      next: res.next,
      trace: res.trace,
      costBefore,
      cost: res.cost,
      layer: (capa as MultiLayer).id,
    };
  }

  const rebota = capa !== undefined;
  return {
    verdict: rebota ? "stalls" : "jams",
    next: res.next,
    trace: res.trace,
    costBefore,
    cost: res.cost,
    layer: null,
    ...(rebota ? { misconception: MULTI_MISCONCEPTION.unwrap_order_inverted } : {}),
  };
}

/**
 * La ficha que cruza el igual sin cambiar. No es un movimiento sobre los dos
 * lados: es sacar de un plato y poner en el otro, y por eso la barra se hunde.
 * La ecuación que devuelve **no** es equivalente, y esa es toda la explicación.
 */
export function multiCross(eq: Equation, key: MultiKey, unknown: string): Equation {
  const enIzquierda = ladoConIncognita(eq, unknown) === "lhs";
  const lado = enIzquierda ? eq.lhs : eq.rhs;
  const otro = enIzquierda ? eq.rhs : eq.lhs;
  if (lado.kind !== "op" || lado.args.length !== 2) return eq;
  const head = lado.args[0];
  const tail = lado.args[1];
  if (!head || !tail) return eq;
  const crecido = op(key.op, [otro, tail], freshId("cruz"));
  return enIzquierda
    ? equation(head, crecido, eq.id)
    : equation(crecido, head, eq.id);
}

/** La incógnita quedó sola: no queda ninguna capa que abrir. */
export const multiSolved = (
  layers: readonly MultiLayer[],
  opened: readonly NodeId[],
): boolean => multiPending(layers, opened).length === 0;

/**
 * Qué contesta el nivel de los casos especiales cuando ya no hay llave: el cofre
 * perdió el tesoro, o abre con cualquier valor.
 */
export function multiDegenerateAnswer(problem: MultiProblem): MultiDegenerate {
  return problem.degenerate;
}

registerNode({
  id: NODE,
  n: 14,
  prereqs: ["alg.eq.one_step", "arith.expr.precedence_tree"],
  levels: MULTI_LEVELS,
});
