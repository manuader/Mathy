/**
 * La cadena de máquinas, para `alg.fn.composition`.
 *
 * Los siete niveles y qué endurece cada parámetro salen del documento del
 * minijuego y de `D1/20`, no de acá: este archivo los implementa, no los decide.
 *
 * La idea que sostiene todo: **encadenar dos máquinas produce una máquina
 * nueva, y el orden en que se encadenan es parte de cuál máquina es**. Por eso
 * el objeto central no es una cuenta sino `CompMachine[]`, una lista **ordenada
 * de la boca al pico**: la primera de la lista es la que la bola atraviesa
 * primero, que es la que se escribe más adentro. La escritura va en un sentido y
 * el flujo en el otro, y esa oposición es la dificultad número uno del nodo, así
 * que vive en un solo lugar —`compNestPieces` y `compRingPieces` invierten la
 * lista— y no repartida por el código.
 *
 * La no conmutatividad no se enuncia: se corren las dos cadenas con la misma
 * bola. `compRun` es puro y no sabe de carriles; que dos órdenes den cosas
 * distintas lo dice `compOrderMatters`, que es una comparación entre dos
 * corridas y no una regla escrita a mano.
 *
 * La otra idea es que una cadena puede **no existir**. Si lo que sale de una
 * máquina no sirve como entrada de la siguiente, la cadena se traba antes de
 * dar un número, y eso no es un error del jugador: es la condición de existencia
 * de la composición. `compBlocks` la decide y `compRun` la propaga.
 *
 * Sin texto visible: acá hay datos, claves y `CompPiece`. Una expresión escrita
 * viaja como lista de piezas y la compone la app, porque un paquete de modelo
 * con cadenas adentro no se puede localizar.
 *
 * ## Dos desvíos del documento, y por qué
 *
 * 1. **El nivel 7 se queda en `symbolic` en vez de subir a `formal`.** El
 *    documento le pide las dos cosas a la vez —cambiar de capa y ensanchar los
 *    parámetros (tres máquinas, división, pares que conmutan, cadenas
 *    imposibles)— y la regla del repositorio dice que gana la regla y el
 *    ensanchamiento se corre al nivel siguiente. No hay nivel siguiente: es el
 *    último. Entre perder el ensanchamiento, que **es** el nivel, y perder el
 *    rótulo de la capa, que el nodo ya alcanzó en el 6, se pierde el rótulo. La
 *    definición corta del cierre viaja igual, en `definition`.
 * 2. **Los niveles 1 y 2 no usan el par de sumar y restar.** El documento le
 *    pide al nivel 3 ese par, y comparten parámetros con el 1 y el 2 porque
 *    entre ellos solo cambia la capa. Pero sumar y restar **conmutan**, y el
 *    nivel 2 pregunta justamente si dar vuelta las máquinas cambia el
 *    resultado: con ese par la respuesta sería "no" y el nivel diría lo
 *    contrario de lo que enseña. Por eso `ops` es el pozo de operaciones y el
 *    par lo elige la pregunta: `swap` y `watch` piden un par donde el orden se
 *    note, `connect` pide el par que conmuta —a propósito, porque el nivel 3
 *    trata de enganchar y no todavía de ordenar— y `order` vuelve a pedir el par
 *    que no conmuta.
 */

import { makeRandom, type Random } from "./random.ts";
import { registerNode, type LevelBase } from "./node.ts";
import type { Evidence, Layer } from "./one-step.ts";

/** El nodo del grafo que este minijuego enseña. */
export const NODE = "alg.fn.composition";

/**
 * El mismo id, sin ambigüedad. `index.ts` reúne diecinueve minijuegos con
 * `export *` y cada uno declara su propio `NODE`, así que afuera del módulo se
 * lo nombra así. Todo lo demás de este archivo va prefijado por la misma razón.
 */
export const NODE_COMPOSITION = NODE;

/** Lo que una máquina le hace a lo que entra. */
export type CompOp = "add" | "sub" | "mul" | "div";

/**
 * Una máquina de la cadena.
 *
 * El nombre viaja con la máquina y no con su lugar. Si el nombre fuera
 * posicional, dar vuelta el caño renombraría las cajas y `f∘g` contra `g∘f`
 * dejaría de querer decir nada: las dos etiquetas serían la misma.
 */
export interface CompMachine {
  readonly id: string;
  /** `f`, `g`, `h`. Se dibuja recién en `symbolic`, pero existe desde el principio. */
  readonly name: string;
  readonly op: CompOp;
  readonly value: number;
}

/** Por qué una cadena no se puede correr. */
export type CompBlock = "not_divisible" | "not_positive";

/**
 * Qué se pregunta en una ronda. No es dificultad: es qué gesto contesta.
 *
 * - `watch`: la cinta corre sola y hay que tocar la bola que salió.
 * - `swap`: la escena se detiene con la bola en el tubo; elegir qué sale si se
 *   dan vuelta las máquinas.
 * - `connect`: enganchar el tubo, o sea poner las dos máquinas en el caño.
 * - `which`: dos carriles con los dos órdenes; tocar el que da la salida pedida.
 * - `order`: las máquinas están en el orden que no da la salida pedida. Tocarlas
 *   las permuta.
 * - `predict`: anticipar la salida **antes** de soltar la bola, con la ficha del
 *   cajón. Es el tren de engranajes leído como número.
 * - `lasso`: lazar las dos máquinas para que se vuelvan una sola caja. Ahí nace
 *   `f∘g`.
 * - `nest`: evaluar `f(g(k))` escrito, sin tubos.
 * - `chain3`: tres máquinas y una salida pedida.
 * - `commutes`: decidir si un par da lo mismo en los dos órdenes.
 * - `reject`: entre varias cadenas escritas, la que no se puede correr.
 */
export type CompAsk =
  | "watch"
  | "swap"
  | "connect"
  | "which"
  | "order"
  | "predict"
  | "lasso"
  | "nest"
  | "chain3"
  | "commutes"
  | "reject";

/** Las cuatro etapas de desvanecimiento de `machine_pipe` en E0. */
export type CompSkin = "machines" | "pipes" | "arrow_diagram" | "function_notation";

/**
 * Lo único que endurece. La capa, la pregunta, la piel y los nombres viven
 * afuera justamente para que la regla del diseño —un nivel cambia de capa o
 * endurece parámetros, nunca las dos cosas— se pueda comprobar con un test.
 */
export interface CompParams {
  /** Máquinas de la cadena. Dos hasta el nivel 6, tres en el 7. */
  readonly length: number;
  /** El pozo de operaciones. Cuál par se arma con ellas lo decide la pregunta. */
  readonly ops: readonly CompOp[];
  readonly operandRange: readonly [number, number];
  readonly inputRange: readonly [number, number];
  /** Entran pares que **sí** conmutan, para que "nunca da igual" no se memorice. */
  readonly commutingPairs: boolean;
  /** Entra la máquina que no hace nada. */
  readonly includeIdentity: boolean;
  /** Entran cadenas cuya salida no sirve como entrada de la siguiente. */
  readonly incompatible: boolean;
}

export interface CompLevel extends LevelBase {
  readonly params: CompParams;
  /** Qué pide cada ronda, ciclando. Un nivel con tres preguntas alterna. */
  readonly asks: readonly CompAsk[];
  readonly skin: CompSkin;
  /** Las máquinas se dibujan como las de la fábrica: la que pinta y la que tapa. */
  readonly factory: boolean;
  /** Las bolas llevan cifra. Los tres primeros niveles se juegan sin leer. */
  readonly numerals: boolean;
  /** Las cajas llevan su letra. Nace en el nivel 6. */
  readonly named: boolean;
  /** Cuántos carriles pide el nivel: dos son la comparación de los dos órdenes. */
  readonly lanes: number;
  /** La definición corta con voz, en el cierre. */
  readonly definition: boolean;
}

// --- Los parámetros ----------------------------------------------------------

/** Niveles 1 a 3: dos máquinas y números chicos. */
const P1: CompParams = {
  length: 2,
  ops: ["add", "sub", "mul"],
  operandRange: [1, 6],
  inputRange: [1, 6],
  commutingPairs: false,
  includeIdentity: false,
  incompatible: false,
};

/** Niveles 4 a 6: los mismos gestos con números que ya no se cuentan con los dedos. */
const P2: CompParams = {
  ...P1,
  operandRange: [1, 9],
  inputRange: [1, 9],
};

/** Nivel 7: la tercera máquina, la división, los pares que conmutan y las cadenas rotas. */
const P3: CompParams = {
  length: 3,
  ops: ["add", "sub", "mul", "div"],
  operandRange: [1, 12],
  inputRange: [1, 12],
  commutingPairs: true,
  includeIdentity: true,
  incompatible: true,
};

/**
 * Los siete niveles del documento. Cada uno cambia la capa o endurece los
 * parámetros, nunca las dos cosas:
 *
 * 1 → 2 y 2 → 3 cambian de capa sin tocar nada; 3 → 4 endurece sin moverse de
 * `concrete` y es donde aparecen los dos carriles; 4 → 5 y 5 → 6 vuelven a
 * cambiar de capa con los mismos parámetros; 6 → 7 endurece sin moverse de
 * `symbolic`.
 *
 * La piel, los nombres y los carriles no son parámetros: acompañan al cambio de
 * capa, que es exactamente lo que hacen las cuatro etapas de desvanecimiento de
 * E0.
 */
export const COMP_LEVELS: readonly CompLevel[] = [
  {
    n: 1,
    titleKey: "level.paintAndCap",
    layer: "real",
    evidence: ["recognize"],
    rounds: 3,
    params: P1,
    asks: ["watch"],
    skin: "machines",
    factory: true,
    numerals: false,
    named: false,
    lanes: 1,
    definition: false,
  },
  {
    n: 2,
    titleKey: "level.whatIfWeSwapThem",
    layer: "intuition",
    evidence: ["explain"],
    rounds: 3,
    params: P1,
    asks: ["swap"],
    skin: "machines",
    factory: true,
    numerals: false,
    named: false,
    lanes: 1,
    definition: false,
  },
  {
    n: 3,
    titleKey: "level.hookUpThePipe",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 4,
    params: P1,
    asks: ["connect"],
    skin: "machines",
    factory: false,
    numerals: false,
    named: false,
    lanes: 1,
    definition: false,
  },
  {
    n: 4,
    titleKey: "level.orderMatters",
    layer: "concrete",
    evidence: ["explain", "manipulate"],
    rounds: 4,
    params: P2,
    asks: ["which", "order"],
    skin: "pipes",
    factory: false,
    numerals: true,
    named: false,
    lanes: 2,
    definition: false,
  },
  {
    n: 5,
    titleKey: "level.theGearTrain",
    layer: "visual",
    evidence: ["manipulate", "apply"],
    rounds: 4,
    params: P2,
    asks: ["predict", "order"],
    skin: "arrow_diagram",
    factory: false,
    numerals: true,
    named: false,
    lanes: 1,
    definition: false,
  },
  {
    n: 6,
    titleKey: "level.namesAndParentheses",
    layer: "symbolic",
    evidence: ["manipulate", "apply"],
    rounds: 4,
    params: P2,
    asks: ["lasso", "nest"],
    skin: "function_notation",
    factory: false,
    numerals: true,
    named: true,
    lanes: 1,
    definition: false,
  },
  {
    n: 7,
    titleKey: "level.chainsOfThree",
    layer: "symbolic",
    evidence: ["apply", "generalize"],
    rounds: 6,
    params: P3,
    asks: ["chain3", "commutes", "reject"],
    skin: "function_notation",
    factory: false,
    numerals: true,
    named: true,
    lanes: 2,
    definition: true,
  },
];

// --- Las piezas de una ronda -------------------------------------------------

/** Una pieza de una expresión escrita. La app la compone; acá no hay texto. */
export type CompPiece =
  | { readonly kind: "num"; readonly value: number }
  | { readonly kind: "sym"; readonly name: string }
  | { readonly kind: "op"; readonly op: CompOp }
  | { readonly kind: "ring" }
  | { readonly kind: "neq" }
  | { readonly kind: "open" }
  | { readonly kind: "close" }
  | { readonly kind: "eq" };

/**
 * Por qué una opción está en pantalla, si no es la correcta. Cada una es un
 * error que el diseño prevé, y ninguna es un número al azar.
 *
 * - `only_outer`: se aplicó la máquina de afuera y se olvidó la de adentro. Es
 *   el error catalogado del nodo.
 * - `only_inner`: se aplicó la de adentro y se dejó la cadena a mitad de camino.
 * - `same_either_way`: se dio por sentado que dar vuelta las máquinas no cambia
 *   nada, que es la costumbre que traen la suma y la multiplicación.
 * - `wrong_order`: se leyó `f(g(x))` de izquierda a derecha y se aplicó `f`
 *   primero.
 * - `ratios_added`: en el tren, las razones se sumaron en vez de multiplicarse.
 */
export type CompLure =
  | "only_outer"
  | "only_inner"
  | "same_either_way"
  | "wrong_order"
  | "ratios_added";

export interface CompOption {
  readonly id: string;
  /** El número que la ficha vale. En las fichas escritas es la salida de su cadena. */
  readonly value: number;
  /** Lo que la ficha muestra, ya como piezas. */
  readonly pieces: readonly CompPiece[];
  /** La cadena que la ficha propone. Vacía cuando la ficha es un número. */
  readonly chain: readonly CompMachine[];
  readonly correct: boolean;
  readonly lure?: CompLure;
}

export interface CompProblem {
  readonly ask: CompAsk;
  /** La cadena instalada en el caño, de la boca al pico. Vacía cuando se arma. */
  readonly chain: readonly CompMachine[];
  /** El otro orden, cuando hay dos carriles. Vacío cuando hay uno solo. */
  readonly other: readonly CompMachine[];
  /** La cadena que la ronda pide armar, o la que ya está y hay que ordenar. */
  readonly solution: readonly CompMachine[];
  /** El cajón de máquinas sueltas. Vacío cuando la cadena ya está puesta. */
  readonly tray: readonly CompMachine[];
  readonly input: number;
  /** La salida pedida. */
  readonly target: number;
  /** Lo que sale del otro carril. Es la prueba de que el orden importa. */
  readonly otherOutput: number;
  readonly options: readonly CompOption[];
  /** El par de la ronda da lo mismo en los dos órdenes. Solo en `commutes`. */
  readonly commutes: boolean;
  /** Cuál de las cadenas escritas se traba, y por qué. `null` si ninguna. */
  readonly blocked: CompBlock | null;
}

/** Máquinas montadas siempre por carril, para que el árbol no cambie entre rondas. */
export const COMP_MACHINE_SLOTS = 3;
/** Fichas del cajón montadas siempre. */
export const COMP_TRAY_SLOTS = 4;
/** Fichas de respuesta montadas siempre. */
export const COMP_OPTION_SLOTS = 4;
/** El techo de una salida. Más grande y el número deja de leerse de un vistazo. */
export const COMP_MAX_VALUE = 200;

/**
 * El error del catálogo que este nodo puede clasificar, y el único.
 *
 * `L/misconceptions.yaml` tiene exactamente una entrada que nombra a
 * `alg.fn.composition` en su lista de nodos, y es esta. La prosa de `F` y de
 * `D1/20` nombra además `matrix_multiplication_commutes` y
 * `unwrap_order_inverted`, pero el catálogo **no** lista este nodo en ninguna de
 * las dos, así que ningún movimiento de acá las puede llevar: un id inventado
 * ensucia la remediación para siempre. Los dos errores existen igual como
 * distractores —`same_either_way` y `wrong_order`— y se muestran; lo que no
 * hacen es anotarse.
 */
export const COMP_MISCONCEPTION = "chain_rule_missing_inner";

/**
 * Qué error catalogado corresponde a un movimiento, si hay alguno.
 *
 * Uno solo puede llevarlo, y siempre por la misma razón: el jugador evaluó la
 * cadena aplicando la máquina de afuera y olvidando la de adentro. Es lo que el
 * catálogo describe como `f'(g(x))` sin el factor de adentro, y acá aparece
 * antes de que exista la derivada.
 */
export const compMisconceptionFor = (lure: CompLure | undefined): string | undefined =>
  lure === "only_outer" ? COMP_MISCONCEPTION : undefined;

// --- La cadena como cuenta ---------------------------------------------------

/** Lo que una máquina le hace a un número. */
export function compApply(v: number, op: CompOp, k: number): number {
  if (op === "add") return v + k;
  if (op === "sub") return v - k;
  if (op === "mul") return v * k;
  return k === 0 ? NaN : v / k;
}

/**
 * Por qué esta máquina no puede recibir esto, o `null` si puede.
 *
 * Es la condición de existencia de la cadena: no hay composición si lo que sale
 * de una no sirve como entrada de la siguiente. Se mira sobre el valor y sobre
 * lo que produce, porque las dos maneras de romperse son distintas: una división
 * que no da entero y una resta que se lleva la bola por debajo de cero.
 */
export function compBlocks(v: number, m: CompMachine): CompBlock | null {
  if (m.op === "div" && (m.value === 0 || v % m.value !== 0)) return "not_divisible";
  const out = compApply(v, m.op, m.value);
  return Number.isInteger(out) && out > 0 ? null : "not_positive";
}

/** Lo que sale del caño, tramo por tramo. La escena no calcula: recibe esto ya hecho. */
export interface CompRun {
  readonly output: number;
  /** Lo que sale de cada máquina, en el orden del caño. */
  readonly stages: readonly number[];
  /** En qué máquina la cadena se trabó, o -1. */
  readonly blockedAt: number;
  /** Por qué se trabó, o `null`. */
  readonly block: CompBlock | null;
}

/**
 * Correr la cadena, de la boca al pico. La lista está en el orden en que la bola
 * atraviesa las cajas, que es el orden inverso al de la escritura: `[g, f]` se
 * escribe `f∘g`.
 */
export function compRun(input: number, chain: readonly CompMachine[]): CompRun {
  const stages: number[] = [];
  let v = input;
  for (let i = 0; i < chain.length; i++) {
    const m = chain[i] as CompMachine;
    const traba = compBlocks(v, m);
    if (traba) return { output: NaN, stages, blockedAt: i, block: traba };
    v = compApply(v, m.op, m.value);
    stages.push(v);
  }
  return { output: v, stages, blockedAt: -1, block: null };
}

/** La cadena dada vuelta: la misma máquinas, el otro orden. */
export const compReverse = (chain: readonly CompMachine[]): readonly CompMachine[] =>
  [...chain].reverse();

/**
 * Los dos órdenes dan cosas distintas para esta entrada.
 *
 * Es la propiedad entera del nodo, y se decide corriendo las dos cadenas y no
 * mirando las operaciones: hay pares de sumar y multiplicar que conmutan para
 * una entrada concreta, y el juego tiene que poder distinguirlos.
 */
export function compOrderMatters(input: number, chain: readonly CompMachine[]): boolean {
  const a = compRun(input, chain);
  const b = compRun(input, compReverse(chain));
  if (a.block !== null || b.block !== null) return true;
  return a.output !== b.output;
}

/**
 * El par conmuta: da lo mismo en los dos órdenes **para toda entrada**, y no
 * solo para la de esta ronda. Se comprueba sobre un barrido chico porque el
 * jugador decide con un ejemplo y el juego no puede decidir con menos.
 */
export function compCommutes(chain: readonly CompMachine[], upTo = 24): boolean {
  const alReves = compReverse(chain);
  for (let v = 1; v <= upTo; v++) {
    const a = compRun(v, chain);
    const b = compRun(v, alReves);
    if (a.block !== null || b.block !== null) continue;
    if (a.output !== b.output) return false;
  }
  return true;
}

/**
 * En qué orden se deshace una cadena: desde la última máquina hacia la primera.
 *
 * Es lo mismo que `keyUndoOrder` dejó establecido en el nodo 12 para los cofres,
 * dicho ahora sobre las máquinas; el nodo 21 necesita las dos cosas juntas —la
 * cadena y el orden inverso— para construir la máquina que devuelve la bola como
 * estaba, así que se exporta desde acá y no se vuelve a escribir allá.
 */
export const compUndoOrder = (chain: readonly CompMachine[]): readonly string[] =>
  [...chain].reverse().map((m) => m.id);

// --- La cadena escrita -------------------------------------------------------

const numPiece = (value: number): CompPiece => ({ kind: "num", value });
const symPiece = (name: string): CompPiece => ({ kind: "sym", name });

/**
 * `f(g(3))`: la aplicación anidada.
 *
 * Los paréntesis crecen de afuera hacia adentro, en el sentido contrario al de
 * la bola. La lista viene en el orden del caño, así que se recorre al revés: la
 * última máquina del caño es la letra que queda más a la izquierda.
 */
export function compNestPieces(
  chain: readonly CompMachine[],
  argument: readonly CompPiece[],
): readonly CompPiece[] {
  let out = [...argument];
  for (const m of chain) out = [symPiece(m.name), { kind: "open" }, ...out, { kind: "close" }];
  return out;
}

/**
 * `(8 + 5) ÷ 3`: la cadena escrita con lo que hace cada máquina y no con sus
 * nombres. Es la escritura que hace falta cuando lo que se decide es si la
 * cadena **se puede correr**: con `f(g(8))` las dos candidatas se verían iguales
 * y la pregunta no tendría con qué contestarse.
 */
export function compChainPieces(
  chain: readonly CompMachine[],
  argument: readonly CompPiece[],
): readonly CompPiece[] {
  let out: CompPiece[] = [...argument];
  for (const m of chain) {
    if (out.length > 1) out = [{ kind: "open" }, ...out, { kind: "close" }];
    out = [...out, { kind: "op", op: m.op }, numPiece(m.value)];
  }
  return out;
}

/** `f∘g`: el nombre de la cadena, sin evaluarla. */
export function compRingPieces(chain: readonly CompMachine[]): readonly CompPiece[] {
  const out: CompPiece[] = [];
  compReverse(chain).forEach((m, i) => {
    if (i > 0) out.push({ kind: "ring" });
    out.push(symPiece(m.name));
  });
  return out;
}

/** `f∘g ≠ g∘f`: la advertencia, para el par que el jugador acaba de comprobar. */
export function compUnequalPieces(chain: readonly CompMachine[]): readonly CompPiece[] {
  return [...compRingPieces(chain), { kind: "neq" }, ...compRingPieces(compReverse(chain))];
}

/** `×3`, `+4`: lo que una máquina lleva escrito encima cuando no tiene nombre. */
export const compOpPieces = (m: CompMachine): readonly CompPiece[] => [
  { kind: "op", op: m.op },
  numPiece(m.value),
];

/** `f(4) = 13`: la cadena evaluada, para el renglón de notación. */
export function compEvaluatedPieces(
  chain: readonly CompMachine[],
  input: number,
  output: number,
): readonly CompPiece[] {
  return [
    ...compNestPieces(chain, [numPiece(input)]),
    { kind: "eq" },
    numPiece(output),
  ];
}

// --- El generador ------------------------------------------------------------

/** Los nombres, de la máquina más de adentro a la más de afuera. */
const NAMES = ["h", "g", "f"] as const;

/**
 * Bautiza una cadena. El nombre se reparte por la posición en el caño y después
 * viaja con la máquina: la del pico es `f`, la anterior `g`, la anterior `h`.
 * Así `f∘g` se lee sobre la cadena que el jugador armó y no sobre la que el
 * generador tenía en la cabeza.
 */
function named(chain: readonly Omit<CompMachine, "name">[]): CompMachine[] {
  const n = chain.length;
  return chain.map((m, i) => ({ ...m, name: NAMES[NAMES.length - n + i] ?? "f" }));
}

const raw = (id: string, op: CompOp, value: number): Omit<CompMachine, "name"> => ({
  id,
  op,
  value,
});

/**
 * Las operaciones del pozo que escalan, y las que corren. Nunca devuelven vacío:
 * un pozo sin ninguna de las dos familias dejaría al generador sin par que armar
 * y la ronda saldría sin máquinas, que es un error mudo.
 */
function escala(ops: readonly CompOp[]): readonly CompOp[] {
  const out = ops.filter((o) => o === "mul" || o === "div");
  return out.length > 0 ? out : ["mul"];
}
function corre(ops: readonly CompOp[]): readonly CompOp[] {
  const out = ops.filter((o) => o === "add" || o === "sub");
  return out.length > 0 ? out : ["add"];
}

/**
 * Un par donde el orden **se nota**: una que escala y una que corre. Escalar
 * después de correr no es correr después de escalar, y esa es toda la
 * demostración que el nodo necesita.
 */
function pairThatMatters(p: CompParams, rnd: Random): CompMachine[] {
  const [, hi] = p.operandRange;
  const tope = Math.max(2, Math.min(9, hi));
  const factor = raw("m0", "mul", rnd.int(2, Math.max(2, Math.min(4, tope))));
  const suma = raw("m1", rnd.pick(corre(p.ops)), rnd.int(1, tope));
  // Cuál va primero también se sortea: si la que escala fuera siempre la
  // primera, el jugador aprendería la posición y no la cadena.
  const orden = rnd.bool() ? [factor, suma] : [suma, factor];
  return named(orden.map((m, i) => ({ ...m, id: `m${i}` })));
}

/**
 * Un par que **sí** conmuta: dos que escalan, o dos que corren. Existe para que
 * el jugador no concluya que el orden nunca da igual, que es la otra mitad de la
 * regla y la que el diseño pide mezclar desde el nivel 7.
 */
function pairThatCommutes(p: CompParams, rnd: Random): CompMachine[] {
  const [, hi] = p.operandRange;
  const tope = Math.max(2, Math.min(9, hi));
  // Las dos tienen que ser **distintas**. Dos máquinas iguales conmutan por una
  // razón que no es la del nodo —son la misma— y los dos carriles quedarían
  // dibujados idénticos: la pregunta se contestaría sin mirar las salidas.
  const conEscala = rnd.bool() && escala(p.ops).includes("mul");
  for (let intento = 0; intento < 40; intento++) {
    const par = conEscala
      ? named([raw("m0", "mul", rnd.int(2, 5)), raw("m1", "mul", rnd.int(2, 5))])
      : named([
          raw("m0", rnd.pick(corre(p.ops)), rnd.int(1, tope)),
          raw("m1", rnd.pick(corre(p.ops)), rnd.int(1, tope)),
        ]);
    const [a, b] = par as [CompMachine, CompMachine];
    if (a.op !== b.op || a.value !== b.value) return par;
  }
  return named([raw("m0", "add", 2), raw("m1", "sub", 1)]);
}

/**
 * El par de sumar y restar del nivel 3. Conmuta, y eso es deliberado: ese nivel
 * trata de enganchar el tubo, y meterle además la sorpresa del orden le sacaría
 * el gesto que viene a enseñar.
 */
function pairThatAdds(p: CompParams, rnd: Random): CompMachine[] {
  const [, hi] = p.operandRange;
  const tope = Math.max(2, Math.min(9, hi));
  const dos = corre(p.ops);
  return named([
    raw("m0", "add", rnd.int(2, tope)),
    raw("m1", rnd.pick(dos), rnd.int(1, tope)),
  ]);
}

/** Una entrada con la que la cadena y su vuelta corren enteras y en positivo. */
function chainAndInput(
  p: CompParams,
  rnd: Random,
  armar: () => CompMachine[],
): { readonly chain: readonly CompMachine[]; readonly input: number } {
  const [lo, hi] = p.inputRange;
  const rango: number[] = [];
  for (let v = lo; v <= hi; v++) rango.push(v);
  for (let intento = 0; intento < 80; intento++) {
    const chain = armar();
    for (const v of rnd.shuffle(rango)) {
      const salidas = permutations(chain).map((c) => compRun(v, c));
      if (salidas.some((r) => r.block !== null || r.output > COMP_MAX_VALUE)) continue;
      return { chain, input: v };
    }
  }
  // El par de respaldo corre con cualquier entrada positiva y en los dos
  // órdenes da cosas distintas, que es lo único que toda ronda necesita.
  return { chain: named([raw("m0", "mul", 2), raw("m1", "add", 3)]), input: 3 };
}

/** El esqueleto de una ronda: lo que ninguna pregunta usa queda vacío. */
function empty(ask: CompAsk): CompProblem {
  return {
    ask,
    chain: [],
    other: [],
    solution: [],
    tray: [],
    input: 0,
    target: 0,
    otherOutput: 0,
    options: [],
    commutes: false,
    blocked: null,
  };
}

/**
 * Genera una ronda. La semilla la hace reproducible; la ronda decide cuál de las
 * preguntas del nivel toca, porque un nivel con tres preguntas tiene que
 * alternarlas y no sortearlas: sorteadas, seis rondas pueden no dar nunca
 * evidencia de una de ellas.
 */
export function generateComposition(level: CompLevel, seed: number, round = 0): CompProblem {
  const rnd = makeRandom(seed);
  const asks = level.asks;
  const ask = (asks[round % asks.length] ?? asks[0]) as CompAsk;
  const p = level.params;

  switch (ask) {
    case "watch":
      return watchRound(p, rnd);
    case "swap":
      return swapRound(p, rnd);
    case "connect":
      return connectRound(p, rnd);
    case "which":
      return whichRound(p, rnd);
    case "order":
      return orderRound(p, rnd, 2);
    case "predict":
      return predictRound(p, rnd);
    case "lasso":
      return lassoRound(p, rnd);
    case "nest":
      return nestRound(p, rnd);
    case "chain3":
      return orderRound(p, rnd, p.length);
    case "commutes":
      return commutesRound(p, rnd);
    default:
      return rejectRound(p, rnd);
  }
}

/**
 * Las opciones, sin repetidas y barajadas. Dos distractores pueden coincidir
 * —con la máquina que no hace nada, "solo la de afuera" y "el otro orden" dan lo
 * mismo— y una ficha duplicada convierte la ronda en una trampa boba.
 */
function dedupe(options: readonly CompOption[], rnd: Random): CompOption[] {
  const vistas = new Set<string>();
  const out: CompOption[] = [];
  // La correcta se mira primero, para que ni el recorte ni un distractor que
  // coincide con ella se la lleven puesta.
  const orden = [...options].sort((a, b) => Number(b.correct) - Number(a.correct));
  for (const o of orden) {
    const clave = o.chain.length > 0 ? JSON.stringify(o.pieces) : String(o.value);
    if (vistas.has(clave)) continue;
    if (o.chain.length === 0 && (!Number.isFinite(o.value) || o.value <= 0)) continue;
    vistas.add(clave);
    out.push(o);
  }
  return rnd.shuffle(out.slice(0, COMP_OPTION_SLOTS));
}

/** Una ficha que es un número suelto: la bola que salió. */
const ballOption = (
  id: string,
  value: number,
  correct: boolean,
  lure?: CompLure,
): CompOption => ({
  id,
  value,
  pieces: [numPiece(value)],
  chain: [],
  correct,
  ...(lure ? { lure } : {}),
});

/**
 * La cinta corre sola y hay que tocar la bola que salió. Los distractores no son
 * números al azar: son la primera máquina sola, la segunda máquina sola y el
 * otro orden, que son las tres maneras de mirar la cadena sin recorrerla entera.
 */
function watchRound(p: CompParams, rnd: Random): CompProblem {
  const { chain, input } = chainAndInput(p, rnd, () => pairThatMatters(p, rnd));
  const run = compRun(input, chain);
  const adentro = compRun(input, chain.slice(0, 1)).output;
  const afuera = compRun(input, chain.slice(1)).output;
  const alReves = compRun(input, compReverse(chain)).output;
  return {
    ...empty("watch"),
    chain,
    solution: chain,
    input,
    target: run.output,
    otherOutput: alReves,
    options: dedupe(
      [
        ballOption("o0", run.output, true),
        ballOption("o1", afuera, false, "only_outer"),
        ballOption("o2", adentro, false, "only_inner"),
        ballOption("o3", alReves, false, "wrong_order"),
      ],
      rnd,
    ),
  };
}

/**
 * La escena se detiene con la bola en el tubo: si damos vuelta las máquinas,
 * ¿sale lo mismo? El distractor que importa es el que dice que sí, porque es la
 * costumbre que traen la suma y la multiplicación, donde el orden no importaba.
 */
function swapRound(p: CompParams, rnd: Random): CompProblem {
  const { chain, input } = chainAndInput(p, rnd, () => pairThatMatters(p, rnd));
  const alReves = compReverse(chain);
  const antes = compRun(input, chain).output;
  const despues = compRun(input, alReves).output;
  const afuera = compRun(input, alReves.slice(1)).output;
  return {
    ...empty("swap"),
    chain,
    other: alReves,
    solution: alReves,
    input,
    target: despues,
    otherOutput: antes,
    options: dedupe(
      [
        ballOption("o0", despues, true),
        ballOption("o1", antes, false, "same_either_way"),
        ballOption("o2", afuera, false, "only_outer"),
      ],
      rnd,
    ),
  };
}

/**
 * Enganchar el tubo: las dos máquinas están sueltas y el caño tiene dos ranuras.
 * El cajón trae dos que no van, y ninguna de las cuatro combinaciones sobrantes
 * llega a la salida pedida: si llegara, el nivel se ganaría sin mirar.
 */
function connectRound(p: CompParams, rnd: Random): CompProblem {
  const { chain, input } = chainAndInput(p, rnd, () => pairThatAdds(p, rnd));
  const target = compRun(input, chain).output;
  const [, hi] = p.operandRange;

  const sobras: CompMachine[] = [];
  for (let intento = 0; intento < 60 && sobras.length < 2; intento++) {
    const m: CompMachine = {
      id: `t${sobras.length + 2}`,
      name: "",
      op: rnd.pick(corre(p.ops)),
      value: rnd.int(1, Math.max(2, Math.min(9, hi))),
    };
    const candidatas = [...chain, ...sobras, m];
    const repetida = candidatas.filter((x) => x.op === m.op && x.value === m.value).length > 1;
    if (repetida) continue;
    // Ninguna pareja que incluya una sobra puede dar la salida pedida.
    const engania = candidatas.some(
      (a) =>
        a.id !== m.id &&
        (compRun(input, [a, m]).output === target || compRun(input, [m, a]).output === target),
    );
    if (engania) continue;
    sobras.push(m);
  }

  return {
    ...empty("connect"),
    solution: chain,
    tray: rnd.shuffle([...chain, ...sobras]),
    input,
    target,
    otherOutput: compRun(input, compReverse(chain)).output,
  };
}

/**
 * Los dos carriles, con la misma bola y las mismas cajas invertidas. No hay
 * nada que leer: las dos salidas quedan una debajo de la otra y son distintas, y
 * eso **es** la no conmutatividad.
 */
function whichRound(p: CompParams, rnd: Random): CompProblem {
  const { chain, input } = chainAndInput(p, rnd, () => pairThatMatters(p, rnd));
  const alReves = compReverse(chain);
  const arriba = compRun(input, chain).output;
  const abajo = compRun(input, alReves).output;
  // Cuál carril tiene razón se sortea dando vuelta el par, no marcando uno: si
  // el de arriba fuera siempre el bueno, el nivel se ganaría con la posición.
  const buenoArriba = rnd.bool();
  return {
    ...empty("which"),
    chain: buenoArriba ? chain : alReves,
    other: buenoArriba ? alReves : chain,
    solution: buenoArriba ? chain : alReves,
    input,
    target: buenoArriba ? arriba : abajo,
    otherOutput: buenoArriba ? abajo : arriba,
  };
}

/**
 * Las máquinas están en el orden que no da la salida pedida. Tocarlas las
 * permuta; con tres, tocar dos veces la misma alcanza para recorrer los seis
 * órdenes.
 */
function orderRound(p: CompParams, rnd: Random, largo: number): CompProblem {
  // `chainAndInput` ya garantiza que **todos** los órdenes corren enteros y en
  // positivo: si alguno se trabara, el jugador podría llegar a él tocando y la
  // ronda se quedaría sin número que mostrar, que se lee como un juego roto y no
  // como una cadena imposible. Las cadenas imposibles son el asunto de `reject`,
  // y ahí se presentan como tales.
  const { chain: base, input } = chainAndInput(p, rnd, () =>
    largo >= 3 ? chainOfThree(p, rnd) : pairThatMatters(p, rnd),
  );

  const target = compRun(input, base).output;
  // El orden con el que arranca no puede ser el bueno, o no habría nada que
  // mover. Se busca uno que dé otra cosa, y con tres máquinas siempre hay.
  const barajados = permutations(base).filter((c) => compRun(input, c).output !== target);
  const puestas = barajados.length > 0 ? (rnd.pick(barajados) as CompMachine[]) : compReverse(base);
  return {
    ...empty(largo >= 3 ? "chain3" : "order"),
    chain: puestas,
    solution: base,
    input,
    target,
    otherOutput: compRun(input, puestas).output,
  };
}

/**
 * Tres máquinas. Con `includeIdentity` una de ellas puede no hacer nada, que es
 * la propiedad del diseño puesta a jugar: la cadena sigue dando lo mismo y el
 * jugador descubre que sobraba.
 */
function chainOfThree(p: CompParams, rnd: Random): CompMachine[] {
  const [, hi] = p.operandRange;
  const tope = Math.max(2, Math.min(9, hi));
  const partes: Omit<CompMachine, "name">[] = [
    raw("m0", "mul", rnd.int(2, 4)),
    raw("m1", rnd.pick(corre(p.ops)), rnd.int(1, tope)),
    p.includeIdentity && rnd.int(0, 3) === 0
      ? raw("m2", "add", 0)
      : raw("m2", rnd.pick(corre(p.ops)), rnd.int(1, tope)),
  ];
  return named(rnd.shuffle(partes).map((m, i) => ({ ...m, id: `m${i}` })));
}

/** Todos los órdenes posibles de una cadena. Con tres máquinas son seis. */
function permutations(chain: readonly CompMachine[]): CompMachine[][] {
  if (chain.length <= 1) return [[...chain]];
  const out: CompMachine[][] = [];
  for (let i = 0; i < chain.length; i++) {
    const resto = [...chain.slice(0, i), ...chain.slice(i + 1)];
    for (const cola of permutations(resto)) out.push([chain[i] as CompMachine, ...cola]);
  }
  return out;
}

/**
 * El tren de engranajes leído como número: dos ruedas que escalan, y la razón
 * total es el producto. Hay que anticiparlo antes de soltar la bola, así que la
 * ficha se elige con el contador todavía apagado.
 *
 * El distractor que clasifica es la rueda de afuera sola: es exactamente
 * `chain_rule_missing_inner` dicho sobre el tren, que es la mecánica con la que
 * el catálogo lo declara.
 */
function predictRound(p: CompParams, rnd: Random): CompProblem {
  const a = rnd.int(2, 4);
  // Las dos razones tienen que ser distintas: iguales, "solo la de afuera" y
  // "solo la de adentro" son la misma ficha y el tren pierde un distractor.
  const b = rnd.pick([2, 3, 4, 5].filter((k) => k !== a));
  const chain = named([raw("m0", "mul", a), raw("m1", "mul", b)]);
  const [lo, hi] = p.inputRange;
  const input = rnd.int(Math.max(lo, 1), Math.max(2, Math.min(hi, 6)));
  const total = input * a * b;
  return {
    ...empty("predict"),
    chain,
    solution: chain,
    input,
    target: total,
    otherOutput: total,
    options: dedupe(
      [
        ballOption("o0", total, true),
        ballOption("o1", input * b, false, "only_outer"),
        ballOption("o2", input * a, false, "only_inner"),
        ballOption("o3", input * (a + b), false, "ratios_added"),
      ],
      rnd,
    ),
  };
}

/**
 * Lazar las dos máquinas: el trazo que las rodea las mete en una caja sola con
 * un tubo de entrada y uno de salida, y la caja pide un nombre. Ahí nace `f∘g`,
 * y nace de necesitar hablar de la cadena sin evaluarla.
 */
function lassoRound(p: CompParams, rnd: Random): CompProblem {
  const { chain, input } = chainAndInput(p, rnd, () => pairThatMatters(p, rnd));
  return {
    ...empty("lasso"),
    chain,
    solution: chain,
    input,
    target: compRun(input, chain).output,
    otherOutput: compRun(input, compReverse(chain)).output,
  };
}

/**
 * `f(g(k))` escrito, sin tubos. Los cuatro números en pantalla son las cuatro
 * maneras de leerlo: entera, solo la de afuera, solo la de adentro y de
 * izquierda a derecha.
 */
function nestRound(p: CompParams, rnd: Random): CompProblem {
  const { chain, input } = chainAndInput(p, rnd, () => pairThatMatters(p, rnd));
  const entera = compRun(input, chain).output;
  const afuera = compRun(input, chain.slice(1)).output;
  const adentro = compRun(input, chain.slice(0, 1)).output;
  const alReves = compRun(input, compReverse(chain)).output;
  return {
    ...empty("nest"),
    chain,
    solution: chain,
    input,
    target: entera,
    otherOutput: alReves,
    options: dedupe(
      [
        ballOption("o0", entera, true),
        ballOption("o1", afuera, false, "only_outer"),
        ballOption("o2", adentro, false, "only_inner"),
        ballOption("o3", alReves, false, "wrong_order"),
      ],
      rnd,
    ),
  };
}

/**
 * ¿Este par da lo mismo en los dos órdenes? La mitad de las veces sí, y esa
 * mitad es lo que impide memorizar "nunca da igual". Los dos carriles corren y
 * el jugador decide mirando las dos salidas, que es exactamente decidir con un
 * ejemplo.
 */
function commutesRound(p: CompParams, rnd: Random): CompProblem {
  const conmuta = p.commutingPairs && rnd.bool();
  const { chain, input } = chainAndInput(p, rnd, () =>
    conmuta ? pairThatCommutes(p, rnd) : pairThatMatters(p, rnd),
  );
  const alReves = compReverse(chain);
  return {
    ...empty("commutes"),
    chain,
    other: alReves,
    solution: chain,
    input,
    target: compRun(input, chain).output,
    otherOutput: compRun(input, alReves).output,
    commutes: compCommutes(chain),
  };
}

/**
 * Una de las cadenas escritas no se puede correr: lo que sale de la primera no
 * entra en la segunda. Hay que descartarla **antes** de evaluar, que es la
 * condición de existencia de la composición puesta a jugar.
 */
function rejectRound(p: CompParams, rnd: Random): CompProblem {
  const [lo, hi] = p.inputRange;
  const input = rnd.int(Math.max(lo, 2), Math.max(3, Math.min(hi, 9)));
  const opciones: CompOption[] = [];

  // La que se traba: un divisor que no divide lo que le llega.
  for (let intento = 0; intento < 60 && opciones.length === 0; intento++) {
    const k = rnd.int(1, 6);
    const d = rnd.int(2, 5);
    const rota = named([raw("m0", "add", k), raw("m1", "div", d)]);
    if (compRun(input, rota).block === null) continue;
    opciones.push({
      id: "o0",
      value: Number.NaN,
      pieces: compChainPieces(rota, [numPiece(input)]),
      chain: rota,
      correct: true,
    });
  }
  if (opciones.length === 0) {
    const rota = named([raw("m0", "add", 1), raw("m1", "div", input + 2)]);
    opciones.push({
      id: "o0",
      value: Number.NaN,
      pieces: compChainPieces(rota, [numPiece(input)]),
      chain: rota,
      correct: true,
    });
  }

  // Las que sí corren. Se comprueban antes de ofrecerlas: una segunda cadena
  // trabada haría que la ronda tuviera dos respuestas.
  for (let intento = 0; intento < 80 && opciones.length < 3; intento++) {
    const sana = named([
      raw("m0", "mul", rnd.int(2, 4)),
      raw("m1", rnd.pick(corre(p.ops)), rnd.int(1, 6)),
    ]);
    const run = compRun(input, sana);
    if (run.block !== null || run.output > COMP_MAX_VALUE) continue;
    if (opciones.some((o) => JSON.stringify(o.pieces) === JSON.stringify(compChainPieces(sana, [numPiece(input)])))) {
      continue;
    }
    opciones.push({
      id: `o${opciones.length}`,
      value: run.output,
      pieces: compChainPieces(sana, [numPiece(input)]),
      chain: sana,
      correct: false,
    });
  }

  const rota = opciones[0] as CompOption;
  return {
    ...empty("reject"),
    chain: rota.chain,
    solution: rota.chain,
    input,
    target: Number.NaN,
    otherOutput: Number.NaN,
    options: rnd.shuffle(opciones),
    blocked: compRun(input, rota.chain).block,
  };
}

export const compLevelByNumber = (n: number): CompLevel | undefined =>
  COMP_LEVELS.find((l) => l.n === n);
export const TOTAL_COMP_LEVELS = COMP_LEVELS.length;

registerNode({
  id: NODE,
  n: 20,
  prereqs: ["alg.fn.function_as_machine"],
  levels: COMP_LEVELS,
});

/** Las capas y los verbos que el nodo recorre, para los tests y el mapa. */
export const COMP_LAYERS: readonly Layer[] = [
  "real",
  "intuition",
  "concrete",
  "visual",
  "symbolic",
];
export const COMP_EVIDENCE: readonly Evidence[] = [
  "recognize",
  "explain",
  "manipulate",
  "apply",
  "generalize",
];
