/**
 * La fábrica, para `alg.fn.function_as_machine`.
 *
 * Los seis niveles y qué endurece cada parámetro salen del documento del
 * minijuego y de `D1/17`, no de acá: este archivo los implementa, no los decide.
 *
 * La idea que sostiene todo: **una máquina da una sola salida por entrada**. Ese
 * invariante es lo único que separa una función de una regla cualquiera, y el
 * nodo no lo enuncia sino que lo rompe a la vista tres veces, que son tres
 * consecuencias del mismo problema: el desvío que manda la entrada a dos ramas y
 * hace caer la segunda salida por un tubo lateral, el punto de la red al que le
 * salen dos flechas, y la tabla donde la misma entrada aparece dos veces con
 * salidas distintas. Por eso el generador sabe construir reglas ambiguas: sin
 * ellas el jugador no tendría con qué comparar.
 *
 * La otra idea es de dónde nace `f(x)`. No nace de querer abreviar: nace en el
 * nivel 4, cuando hay **dos** máquinas en pantalla y la salida pedida no dice
 * cuál se usó. Ahí el nombre resuelve "cuál" y el paréntesis resuelve "a qué",
 * y esa es toda la historia del símbolo. Antes del nivel 4 el generador no
 * produce nunca dos máquinas a la vez, justamente para que la falta se sienta.
 *
 * Sin texto visible: acá solo hay claves, datos y `FnPiece`. Una expresión
 * escrita viaja como lista de piezas y la compone la app, porque un paquete de
 * modelo con cadenas adentro no se puede localizar.
 */

import { makeRandom, type Random } from "./random.ts";
import { registerNode, type LevelBase } from "./node.ts";
import type { Evidence, Layer } from "./one-step.ts";

/** El nodo del grafo que este minijuego enseña. */
export const NODE = "alg.fn.function_as_machine";

/**
 * El mismo id, sin ambigüedad. `index.ts` reúne los minijuegos con `export *` y
 * cada uno declara su propio `NODE`, así que afuera del módulo se lo nombra así.
 */
export const NODE_FUNCTION_AS_MACHINE = NODE;

/** Lo que una máquina le hace a lo que entra. */
export type FnOp = "add" | "sub" | "mul" | "div";

/** Con qué se evalúa: un número, una letra o una expresión entera. */
export type FnInputKind = "number" | "letter" | "expression";

/**
 * Qué se pregunta en una ronda. No es dificultad: es qué gesto contesta.
 *
 * - `guess`: la carcasa es opaca y hay una salida pedida. Se meten fichas hasta
 *   dar con la que sale como se pide; la placa vacía obliga a descubrir la regla
 *   probando, y la tabla es lo que se descubre.
 * - `build`: armar la cadena arrastrando fichas de operación al caño, contra una
 *   tabla objetivo.
 * - `broken`: lo mismo, con un desvío en el cajón que reproduce la tabla y
 *   además saca una segunda salida. Es la máquina rota.
 * - `network`: la red de flechas. Una flecha por punto de entrada, ni dos ni
 *   ninguna.
 * - `judge`: dos redes; tocar la que no es una máquina.
 * - `name`: dos máquinas y una salida pedida que no dice cuál se usó. Tocar una
 *   la contrae hasta su letra, y ahí nace el nombre.
 * - `evaluate`: `f(k)` con la máquina ya nombrada.
 * - `letters`: `f(a)` y `f(x + 1)`. La entrada deja de ser un número.
 * - `chain`: dos máquinas encadenadas; cambiar el orden hasta la salida pedida.
 * - `reject`: una máquina que escupe alguna entrada sin procesar.
 * - `sameRule`: dos escrituras distintas de la misma función.
 * - `fromTable`: encontrar la regla desde una tabla que dos reglas explican, con
 *   una entrada extra que las separa.
 * - `relation`: una tabla; decir si es una función o no.
 */
export type FnAsk =
  | "guess"
  | "build"
  | "broken"
  | "network"
  | "judge"
  | "name"
  | "evaluate"
  | "letters"
  | "chain"
  | "reject"
  | "sameRule"
  | "fromTable"
  | "relation";

/** Las cuatro etapas de desvanecimiento de `machine_pipe` en E0. */
export type FnSkin = "machines" | "pipes" | "arrow_diagram" | "function_notation";

/**
 * Lo único que endurece. La capa, la pregunta y las pieles viven afuera
 * justamente para que la regla del diseño —un nivel cambia de capa o endurece
 * parámetros, nunca las dos cosas— se pueda comprobar con un test.
 */
export interface FnParams {
  /** Máquinas en serie. Una en el nivel 1, dos desde el 2, tres desde el 5. */
  readonly stages: number;
  readonly ops: readonly FnOp[];
  readonly operandRange: readonly [number, number];
  readonly inputKinds: readonly FnInputKind[];
  /** Hay máquinas que escupen alguna entrada sin procesar. */
  readonly rejectsInput: boolean;
  /** Entran reglas ambiguas: el desvío, la flecha doble, la tabla repetida. */
  readonly ambiguous: boolean;
}

export interface FnLevel extends LevelBase {
  readonly params: FnParams;
  /** Qué pide cada ronda, ciclando. Un nivel con tres preguntas alterna. */
  readonly asks: readonly FnAsk[];
  readonly skin: FnSkin;
  /** La placa muestra la regla. En falso la carcasa es opaca. */
  readonly plate: boolean;
  /** Las máquinas llevan nombre de una letra. Nace en el nivel 4. */
  readonly named: boolean;
  readonly numerals: boolean;
  /** La tabla de entradas y salidas al costado. */
  readonly table: boolean;
  /** La definición corta con voz. Solo en `formal`. */
  readonly definition: boolean;
}

/**
 * Los seis niveles del documento. Cada uno cambia la capa o endurece los
 * parámetros, nunca las dos cosas:
 *
 * 1 → 2 endurece sin moverse de `concrete` (entra la segunda máquina y entra el
 * desvío), 2 → 3 cambia de capa con los mismos parámetros, 3 → 4 vuelve a
 * cambiar de capa sin tocarlos —y es donde nace el nombre—, 4 → 5 endurece sin
 * moverse de `symbolic` (tercera máquina, división, letras y expresiones,
 * máquinas que rechazan) y 5 → 6 se lleva el nodo a `formal` sin tocar nada.
 *
 * La piel y el nombre no son parámetros: acompañan al cambio de capa, que es
 * exactamente lo que hacen las cuatro etapas de desvanecimiento de E0.
 */
export const FN_LEVELS: readonly FnLevel[] = [
  {
    n: 1,
    titleKey: "level.guessTheMachine",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 4,
    params: {
      stages: 1,
      ops: ["add", "mul"],
      operandRange: [1, 9],
      inputKinds: ["number"],
      rejectsInput: false,
      ambiguous: false,
    },
    asks: ["guess"],
    skin: "machines",
    plate: false,
    named: false,
    numerals: true,
    table: true,
    definition: false,
  },
  {
    n: 2,
    titleKey: "level.buildTheMachine",
    layer: "concrete",
    evidence: ["recognize", "manipulate"],
    rounds: 4,
    params: {
      stages: 2,
      ops: ["add", "sub", "mul"],
      operandRange: [1, 9],
      inputKinds: ["number"],
      rejectsInput: false,
      ambiguous: true,
    },
    asks: ["build", "broken"],
    skin: "machines",
    plate: true,
    named: false,
    numerals: true,
    table: true,
    definition: false,
  },
  {
    n: 3,
    titleKey: "level.dotsAndArrows",
    layer: "visual",
    evidence: ["explain"],
    rounds: 4,
    params: {
      stages: 2,
      ops: ["add", "sub", "mul"],
      operandRange: [1, 9],
      inputKinds: ["number"],
      rejectsInput: false,
      ambiguous: true,
    },
    asks: ["network", "judge"],
    skin: "arrow_diagram",
    plate: true,
    named: false,
    numerals: true,
    table: false,
    definition: false,
  },
  {
    n: 4,
    titleKey: "level.theMachineHasAName",
    layer: "symbolic",
    evidence: ["manipulate", "apply"],
    rounds: 4,
    params: {
      stages: 2,
      ops: ["add", "sub", "mul"],
      operandRange: [1, 9],
      inputKinds: ["number"],
      rejectsInput: false,
      ambiguous: true,
    },
    asks: ["name", "evaluate"],
    skin: "function_notation",
    plate: true,
    named: true,
    numerals: true,
    table: true,
    definition: false,
  },
  {
    n: 5,
    titleKey: "level.inputsThatArentNumbers",
    layer: "symbolic",
    evidence: ["apply"],
    rounds: 6,
    params: {
      stages: 3,
      ops: ["add", "sub", "mul", "div"],
      operandRange: [1, 20],
      inputKinds: ["number", "letter", "expression"],
      rejectsInput: true,
      ambiguous: true,
    },
    asks: ["letters", "chain", "reject"],
    skin: "function_notation",
    plate: true,
    named: true,
    numerals: true,
    table: true,
    definition: false,
  },
  {
    n: 6,
    titleKey: "level.twoWritingsOneFunction",
    layer: "formal",
    evidence: ["generalize"],
    rounds: 6,
    params: {
      stages: 3,
      ops: ["add", "sub", "mul", "div"],
      operandRange: [1, 20],
      inputKinds: ["number", "letter", "expression"],
      rejectsInput: true,
      ambiguous: true,
    },
    asks: ["sameRule", "fromTable", "relation"],
    skin: "function_notation",
    plate: true,
    named: true,
    numerals: true,
    table: true,
    definition: true,
  },
];

// --- Las piezas de una ronda -------------------------------------------------

/** La segunda rama de un desvío: la que hace que la regla deje de ser una máquina. */
export interface FnBranch {
  readonly op: FnOp;
  readonly value: number;
}

/**
 * Una máquina de la cadena.
 *
 * `fork` es lo que convierte una máquina en un desvío: la misma entrada se va
 * por dos ramas y salen dos cosas. No es una máquina rota en el sentido de
 * "anda mal"; es que **no es una máquina**, y el nodo entero se apoya en esa
 * diferencia.
 */
export interface FnMachine {
  readonly id: string;
  readonly op: FnOp;
  readonly value: number;
  readonly fork: FnBranch | null;
  /** La entrada que esta máquina escupe sin procesar, o `null` si acepta todo. */
  readonly rejects: number | null;
}

/** Una fila de la tabla: lo que entró y lo que salió. */
export interface FnRow {
  readonly input: number;
  readonly output: number;
  /** La segunda salida, cuando la regla es ambigua. `null` cuando no lo es. */
  readonly second: number | null;
}

/** Una pieza de una expresión escrita. La app la compone; acá no hay texto. */
export type FnPiece =
  | { readonly kind: "num"; readonly value: number }
  | { readonly kind: "sym"; readonly name: string }
  | { readonly kind: "op"; readonly op: FnOp }
  | { readonly kind: "open" }
  | { readonly kind: "close" }
  | { readonly kind: "eq" };

/**
 * Por qué una opción está en pantalla, si no es la correcta. Cada una es un
 * error que el diseño prevé, y ninguna es un número al azar.
 *
 * - `only_first_step`: se aplicó la primera máquina y se olvidó el resto.
 * - `only_last_step`: se aplicó la última y se olvidó la primera.
 * - `outside_the_slot`: se operó con lo que salió en vez de con lo que entró,
 *   que es leer el paréntesis como una multiplicación.
 * - `other_rule`: la otra regla que explica la tabla, y que la entrada extra
 *   separa.
 */
export type FnLure =
  | "only_first_step"
  | "only_last_step"
  | "outside_the_slot"
  | "other_rule";

export interface FnOption {
  readonly id: string;
  /** Lo que la ficha muestra, ya como piezas. */
  readonly pieces: readonly FnPiece[];
  readonly correct: boolean;
  /** Elegirla es tomar una regla ambigua por una función. */
  readonly ambiguous: boolean;
  readonly lure?: FnLure;
}

/** Una flecha de la red: de qué punto de entrada a qué punto de salida. */
export interface FnArrow {
  readonly from: number;
  readonly to: number;
}

/**
 * Una red de puntos y flechas. Es la misma estructura mirada desde afuera: la
 * tubería dice qué hace la regla, la red dice qué la hace legítima.
 */
export interface FnNetwork {
  readonly id: string;
  readonly inputs: readonly number[];
  readonly outputs: readonly number[];
  /** Las flechas que llegan dibujadas. Vacía cuando el jugador las arrastra. */
  readonly arrows: readonly FnArrow[];
  /** De cada punto de entrada sale exactamente una flecha. */
  readonly isFunction: boolean;
}

export interface FnProblem {
  readonly ask: FnAsk;
  /** La cadena instalada en el caño. Vacía cuando el jugador la arma. */
  readonly machines: readonly FnMachine[];
  /** La segunda máquina en pantalla, la que obliga a nombrar. Vacía si no hay. */
  readonly other: readonly FnMachine[];
  /** La cadena que el nivel esconde o pide armar. */
  readonly solution: readonly FnMachine[];
  /** El cajón de fichas de operación. Vacío cuando la cadena ya está puesta. */
  readonly tray: readonly FnMachine[];
  /** Las fichas de entrada del cajón. Vacío cuando el cajón lleva operaciones. */
  readonly tokens: readonly number[];
  /** La entrada de esta ronda, cuando la ronda tiene una sola. */
  readonly input: number;
  /** La salida pedida. */
  readonly target: number;
  /** La tabla: objetivo en `build`, ya llena en `relation` y `fromTable`. */
  readonly rows: readonly FnRow[];
  /** La entrada extra que separa dos reglas que explican la misma tabla. */
  readonly extra: number;
  readonly options: readonly FnOption[];
  /** Las redes de la ronda: una en `network`, dos en `judge`, ninguna en el resto. */
  readonly networks: readonly FnNetwork[];
  /** Con qué se evalúa esta ronda. */
  readonly inputKind: FnInputKind;
  /** El argumento escrito, cuando no es un número: `a`, `x + 1`. */
  readonly argument: readonly FnPiece[];
}

/** Máquinas montadas siempre por carril, para que el árbol no cambie entre rondas. */
export const FN_MACHINE_SLOTS = 3;
/** Fichas del cajón montadas siempre. */
export const FN_TRAY_SLOTS = 4;
/** Fichas de respuesta montadas siempre. */
export const FN_OPTION_SLOTS = 3;
/** Puntos de entrada y de salida montados siempre en la red. */
export const FN_NET_INPUT_SLOTS = 5;
export const FN_NET_OUTPUT_SLOTS = 6;
/** Filas de la tabla montadas siempre. */
export const FN_TABLE_SLOTS = 5;
/** El techo de una salida. Más grande y el número deja de leerse de un vistazo. */
export const FN_MAX_VALUE = 200;

/**
 * El error del catálogo que este nodo puede clasificar, y el único.
 *
 * DISCREPANCIA ANOTADA: la prosa de `F` y de `D1/17` dice que el nodo declara la
 * lista de misconceptions vacía y que el error central de acá no está
 * catalogado. Los YAML dicen lo contrario: `graph/alg.yaml` le pone
 * `misconceptions: [machine_gives_two_outputs]` y `L/misconceptions.yaml` tiene
 * la entrada apuntando a este nodo, con patrón `two_paths_diverge` y mecánica
 * `machine_pipe`. Gana el dato, que es la regla del repositorio, y además es lo
 * que la prosa describe: tomar una regla ambigua por una función.
 *
 * Las otras dos que la prosa nombra —`variable_as_label` y
 * `unwrap_order_inverted`— **no** listan este nodo en el catálogo, así que
 * ningún movimiento de acá las puede llevar. Un id inventado ensucia la
 * remediación para siempre.
 */
export const FN_MISCONCEPTION = "machine_gives_two_outputs";

// --- La máquina como cuenta --------------------------------------------------

/** Lo que una máquina le hace a un número. */
export function fnApplyOp(v: number, op: FnOp, k: number): number {
  if (op === "add") return v + k;
  if (op === "sub") return v - k;
  if (op === "mul") return v * k;
  return k === 0 ? NaN : v / k;
}

/** Lo que sale del caño, y por dónde. La escena no calcula: recibe esto ya hecho. */
export interface FnRun {
  readonly output: number;
  /** La segunda salida, la que cae por el tubo lateral. `null` si no hay desvío. */
  readonly second: number | null;
  /** Lo que sale de cada máquina, tramo por tramo. */
  readonly stages: readonly number[];
  /** Qué máquina escupió la entrada sin procesarla, o -1. */
  readonly rejectedAt: number;
}

/**
 * Correr la cadena. El desvío no se cuenta como un paso más: saca su segunda
 * salida de **lo mismo que entró**, que es lo que la hace ambigua. Una máquina
 * que transformara dos veces seguidas sería otra cadena, no una regla ambigua.
 */
export function fnRun(input: number, machines: readonly FnMachine[]): FnRun {
  const stages: number[] = [];
  let v = input;
  let second: number | null = null;
  for (let i = 0; i < machines.length; i++) {
    const m = machines[i] as FnMachine;
    if (m.rejects !== null && m.rejects === v) {
      return { output: NaN, second, stages, rejectedAt: i };
    }
    if (m.fork) second = fnApplyOp(v, m.fork.op, m.fork.value);
    v = fnApplyOp(v, m.op, m.value);
    stages.push(v);
  }
  return { output: v, second, stages, rejectedAt: -1 };
}

/** La cadena es una máquina: ninguna de sus piezas manda la entrada a dos ramas. */
export const fnIsMachine = (machines: readonly FnMachine[]): boolean =>
  machines.every((m) => m.fork === null);

/**
 * La tabla es una función: ninguna entrada aparece dos veces con salidas
 * distintas. Es el mismo criterio que la red y que el tubo lateral, escrito
 * sobre la representación que queda cuando ya no hay dibujo.
 */
export function fnRowsAreFunction(rows: readonly FnRow[]): boolean {
  const visto = new Map<number, number>();
  for (const r of rows) {
    if (r.second !== null && r.second !== r.output) return false;
    const antes = visto.get(r.input);
    if (antes !== undefined && antes !== r.output) return false;
    visto.set(r.input, r.output);
  }
  return true;
}

/** La red es una función: de cada punto de entrada sale exactamente una flecha. */
export function fnNetworkIsFunction(
  inputs: number,
  arrows: readonly FnArrow[],
): boolean {
  for (let i = 0; i < inputs; i++) {
    if (arrows.filter((a) => a.from === i).length !== 1) return false;
  }
  return true;
}

/** Cuántas flechas salen de un punto de entrada. Dos es la ruptura; cero también. */
export const fnArrowsFrom = (arrows: readonly FnArrow[], from: number): readonly FnArrow[] =>
  arrows.filter((a) => a.from === from);

/** A qué punto de salida manda la regla a la entrada `i`, o -1 si no está. */
export function fnArrowTarget(network: FnNetwork, i: number, rule: readonly FnMachine[]): number {
  const entrada = network.inputs[i];
  if (entrada === undefined) return -1;
  const salida = fnRun(entrada, rule).output;
  return network.outputs.indexOf(salida);
}

/**
 * Qué error catalogado corresponde a un movimiento, si hay alguno.
 *
 * Uno solo puede llevarlo, y siempre por la misma razón: el jugador aceptó como
 * máquina algo que da dos salidas para una entrada. Meter el desvío en el caño,
 * colgarle una segunda flecha a un punto, decir que la red ambigua es la buena y
 * decir que la tabla repetida es una función son cuatro formas del mismo error.
 */
export function fnMisconceptionFor(ask: FnAsk, tomoLaAmbigua: boolean): string | undefined {
  if (!tomoLaAmbigua) return undefined;
  const clasifica: readonly FnAsk[] = ["broken", "network", "judge", "relation"];
  return clasifica.includes(ask) ? FN_MISCONCEPTION : undefined;
}

// --- La regla escrita --------------------------------------------------------

const numPiece = (value: number): FnPiece => ({ kind: "num", value });
const symPiece = (name: string): FnPiece => ({ kind: "sym", name });
const opPiece = (op: FnOp): FnPiece => ({ kind: "op", op });

/**
 * La regla escrita a partir de la cadena.
 *
 * El generador arma las cadenas con las máquinas multiplicativas adelante y las
 * aditivas atrás, así que la escritura sale sin paréntesis y **dice el mismo
 * árbol que el caño**: `×3` seguida de `+1` se escribe `3x + 1` y se lee en ese
 * orden. Es la misma regla que el nodo 9 comprueba con `precRowSaysTheTree`, acá
 * garantizada por construcción en vez de por búsqueda.
 */
export function fnRulePieces(
  machines: readonly FnMachine[],
  argument: readonly FnPiece[],
): readonly FnPiece[] {
  const factores = machines.filter((m) => m.op === "mul");
  const divisores = machines.filter((m) => m.op === "div");
  const aditivas = machines.filter((m) => m.op === "add" || m.op === "sub");
  // El argumento compuesto necesita paréntesis en cuanto algo lo multiplica: sin
  // ellos `3(x + 1)` se escribiría `3x + 1`, que es otra función.
  const compuesto = argument.length > 1;
  const necesitaParentesis = compuesto && factores.length > 0;
  const out: FnPiece[] = [];
  for (const m of factores) out.push(numPiece(m.value));
  if (necesitaParentesis) out.push({ kind: "open" });
  out.push(...argument);
  if (necesitaParentesis) out.push({ kind: "close" });
  for (const m of divisores) {
    out.push(opPiece("div"));
    out.push(numPiece(m.value));
  }
  for (const m of aditivas) {
    out.push(opPiece(m.op));
    out.push(numPiece(m.value));
  }
  return out;
}

/** `f(x)`, `f(a)`, `f(x + 1)`: el nombre, la ranura vuelta paréntesis y adentro el argumento. */
export function fnCallPieces(name: string, argument: readonly FnPiece[]): readonly FnPiece[] {
  return [symPiece(name), { kind: "open" }, ...argument, { kind: "close" }];
}

/** `f(x) = 3x + 1`: la tabla contraída en un renglón. */
export function fnFormulaPieces(
  name: string,
  machines: readonly FnMachine[],
): readonly FnPiece[] {
  return [
    ...fnCallPieces(name, [symPiece("x")]),
    { kind: "eq" },
    ...fnRulePieces(machines, [symPiece("x")]),
  ];
}

// --- El generador ------------------------------------------------------------

const machine = (
  id: string,
  op: FnOp,
  value: number,
  fork: FnBranch | null = null,
  rejects: number | null = null,
): FnMachine => ({ id, op, value, fork, rejects });

/**
 * Arma una cadena. Las multiplicativas van adelante y las aditivas atrás, para
 * que la placa se pueda escribir sin paréntesis y diga exactamente el caño.
 * Cuando hay divisor, el factor es un múltiplo suyo: así la cuenta cierra en
 * enteros sin que el nodo tenga que hablar de fracciones, que no son de acá.
 */
function buildChain(p: FnParams, rnd: Random, stages: number): FnMachine[] {
  const [, hi] = p.operandRange;
  const tope = Math.max(2, Math.min(9, hi));
  const aditivas = p.ops.filter((o) => o === "add" || o === "sub");
  const unaAditiva = (i: number): FnMachine =>
    machine(`m${i}`, aditivas.length > 0 ? rnd.pick(aditivas) : "add", rnd.int(1, tope));

  if (stages <= 1) {
    const sueltas = p.ops.filter((o) => o !== "div");
    const o = sueltas.length > 0 ? rnd.pick(sueltas) : "add";
    return [machine("m0", o, o === "mul" ? rnd.int(2, tope) : rnd.int(1, tope))];
  }

  const chain: FnMachine[] = [];
  const conDiv = p.ops.includes("div") && stages >= 3;
  const divisor = conDiv ? rnd.int(2, 3) : 1;
  if (p.ops.includes("mul")) {
    chain.push(machine(`m${chain.length}`, "mul", divisor * rnd.int(2, Math.max(2, Math.min(5, tope)))));
    if (conDiv) chain.push(machine(`m${chain.length}`, "div", divisor));
  }
  while (chain.length < stages) chain.push(unaAditiva(chain.length));
  return chain.slice(0, stages);
}

/** Unos cuantos números distintos para el cajón de fichas de entrada. */
function tokens(rnd: Random, cuantas: number, lo: number, hi: number): number[] {
  const pool: number[] = [];
  for (let v = lo; v <= hi; v++) pool.push(v);
  return rnd.shuffle(pool).slice(0, cuantas);
}

/** Las filas que salen de correr la cadena con estas entradas. */
function rowsFor(inputs: readonly number[], chain: readonly FnMachine[]): FnRow[] {
  return inputs.map((input) => {
    const run = fnRun(input, chain);
    return { input, output: run.output, second: run.second };
  });
}

/**
 * Genera una ronda. La semilla la hace reproducible; la ronda decide cuál de las
 * preguntas del nivel toca, porque un nivel con tres preguntas tiene que
 * alternarlas y no sortearlas: sorteadas, seis rondas pueden no dar nunca
 * evidencia de una de ellas.
 */
export function generateMachine(level: FnLevel, seed: number, round = 0): FnProblem {
  const rnd = makeRandom(seed);
  const asks = level.asks;
  const ask = (asks[round % asks.length] ?? asks[0]) as FnAsk;
  const p = level.params;

  switch (ask) {
    case "guess":
      return guessRound(p, rnd);
    case "build":
    case "broken":
      return buildRound(p, rnd, ask === "broken");
    case "network":
      return networkRound(p, rnd);
    case "judge":
      return judgeRound(p, rnd);
    case "name":
      return nameRound(p, rnd);
    case "evaluate":
      return evaluateRound(p, rnd);
    case "letters":
      return lettersRound(p, rnd);
    case "chain":
      return chainRound(p, rnd);
    case "reject":
      return rejectRound(p, rnd);
    case "sameRule":
      return sameRuleRound(rnd);
    case "fromTable":
      return fromTableRound(rnd);
    default:
      return relationRound(p, rnd);
  }
}

/** El esqueleto de una ronda: lo que ninguna pregunta usa queda vacío. */
function empty(ask: FnAsk): FnProblem {
  return {
    ask,
    machines: [],
    other: [],
    solution: [],
    tray: [],
    tokens: [],
    input: 0,
    target: 0,
    rows: [],
    extra: 0,
    options: [],
    networks: [],
    inputKind: "number",
    argument: [],
  };
}

/**
 * Adivinar la máquina. La carcasa es opaca y hay una salida pedida; la única
 * manera de saber cuál ficha la produce es meter otras y mirar la tabla. Meter
 * dos veces la misma no agrega fila: la ilumina, y eso es el determinismo visto.
 */
function guessRound(p: FnParams, rnd: Random): FnProblem {
  const chain = buildChain(p, rnd, 1);
  const fichas = tokens(rnd, FN_TRAY_SLOTS, 1, 9);
  const elegida = rnd.pick(fichas);
  return {
    ...empty("guess"),
    machines: chain,
    solution: chain,
    tokens: fichas,
    input: elegida,
    target: fnRun(elegida, chain).output,
  };
}

/**
 * Armar la máquina contra una tabla objetivo.
 *
 * En la ronda rota el cajón trae además un desvío cuya rama principal es
 * **exactamente** la máquina que corresponde: reproduce la tabla y encima saca
 * una segunda salida. Es la trampa que el diseño pide, porque el error no es
 * hacer mal la cuenta sino aceptar como máquina algo que da dos salidas.
 */
function buildRound(p: FnParams, rnd: Random, rota: boolean): FnProblem {
  const chain = buildChain(p, rnd, p.stages);
  const primera = chain[0] as FnMachine;
  const entradas = tokens(rnd, 3, 1, 6).sort((a, b) => a - b);

  const cajon: FnMachine[] = chain.map((m, i) => machine(`t${i}`, m.op, m.value));
  if (rota && p.ambiguous) {
    const rama = forkThatShows(chain, entradas, rnd);
    cajon.push(machine("tf", primera.op, primera.value, rama));
  }
  const usadas = new Set(cajon.map((m) => `${m.op}${m.value}`));
  let i = cajon.length;
  while (cajon.length < FN_TRAY_SLOTS) {
    const o = rnd.pick(p.ops.filter((x) => x !== "div"));
    const k = rnd.int(1, 9);
    if (usadas.has(`${o}${k}`)) {
      i++;
      if (i > 40) break;
      continue;
    }
    usadas.add(`${o}${k}`);
    cajon.push(machine(`t${cajon.length}`, o, k));
  }

  return {
    ...empty(rota ? "broken" : "build"),
    solution: chain,
    tray: rnd.shuffle(cajon).slice(0, FN_TRAY_SLOTS),
    rows: rowsFor(entradas, chain),
    input: entradas[0] as number,
    target: fnRun(entradas[0] as number, chain).output,
  };
}

/**
 * La rama lateral del desvío.
 *
 * Tiene que dar algo **distinto de la salida del caño** para cada entrada de la
 * tabla: si en alguna fila las dos salidas coincidieran, esa fila no mostraría
 * nada y el jugador podría creer que el desvío es inofensivo justo ahí. La
 * ruptura se ve o no sirve.
 */
function forkThatShows(
  chain: readonly FnMachine[],
  entradas: readonly number[],
  rnd: Random,
): FnBranch {
  const candidatas: FnBranch[] = [];
  for (const op of ["add", "sub", "mul"] as const) {
    for (let k = 2; k <= 6; k++) candidatas.push({ op, value: k });
  }
  const primera = chain[0] as FnMachine;
  for (const rama of rnd.shuffle(candidatas)) {
    const conDesvio = [machine("tf", primera.op, primera.value, rama), ...chain.slice(1)];
    const sirve = entradas.every((v) => {
      const run = fnRun(v, conDesvio);
      return run.second !== null && run.second !== run.output && run.second > 0;
    });
    if (sirve) return rama;
  }
  return { op: "mul", value: 2 };
}

/** Una red con la regla ya escrita: el jugador cuelga una flecha por punto. */
function networkRound(p: FnParams, rnd: Random): FnProblem {
  const chain = buildChain(p, rnd, 1);
  const entradas = tokens(rnd, rnd.int(3, FN_NET_INPUT_SLOTS), 1, 8).sort((a, b) => a - b);
  const salidas = entradas.map((v) => fnRun(v, chain).output);
  // Un punto de salida de más: no tener flecha que llegue no rompe nada, y verlo
  // es la mitad de la definición de imagen que el nodo 18 va a necesitar.
  const huerfano = Math.max(...salidas) + rnd.int(1, 4);
  const columna = rnd.shuffle([...salidas, huerfano]).slice(0, FN_NET_OUTPUT_SLOTS);
  return {
    ...empty("network"),
    machines: chain,
    solution: chain,
    networks: [{ id: "n0", inputs: entradas, outputs: columna, arrows: [], isFunction: false }],
  };
}

/** Dos redes dibujadas; una le cuelga dos flechas al mismo punto y no es una máquina. */
function judgeRound(p: FnParams, rnd: Random): FnProblem {
  const chain = buildChain(p, rnd, 1);
  const entradas = tokens(rnd, 3, 1, 6).sort((a, b) => a - b);
  const salidas = entradas.map((v) => fnRun(v, chain).output);
  const extra = Math.max(...salidas) + rnd.int(1, 3);
  const columna = [...salidas, extra];

  const buenas: FnArrow[] = entradas.map((_, i) => ({ from: i, to: i }));
  const doble = rnd.int(0, entradas.length - 1);
  const rotas: FnArrow[] = [...buenas, { from: doble, to: columna.length - 1 }];

  const mala = rnd.bool() ? 0 : 1;
  const redes: FnNetwork[] = [0, 1].map((i) => ({
    id: `n${i}`,
    inputs: entradas,
    outputs: columna,
    arrows: i === mala ? rotas : buenas,
    isFunction: i !== mala,
  }));
  return { ...empty("judge"), machines: chain, solution: chain, networks: redes };
}

/**
 * Dos máquinas y una salida pedida. La salida no dice cuál se usó y por eso hace
 * falta el nombre: **acá nace `f(x)`**, y nace de una falta, no de un capricho
 * de notación.
 */
function nameRound(p: FnParams, rnd: Random): FnProblem {
  for (let intento = 0; intento < 40; intento++) {
    const f = buildChain(p, rnd, p.stages);
    const g = buildChain(p, rnd, p.stages);
    const entrada = rnd.int(1, 9);
    const a = fnRun(entrada, f).output;
    const b = fnRun(entrada, g).output;
    // Si las dos dieran lo mismo la pregunta no tendría respuesta: la salida
    // pedida tiene que separar una máquina de la otra.
    if (a === b || a > FN_MAX_VALUE || b > FN_MAX_VALUE) continue;
    return {
      ...empty("name"),
      machines: f,
      other: g,
      solution: f,
      input: entrada,
      target: a,
    };
  }
  const f = [machine("m0", "mul", 3), machine("m1", "add", 1)];
  const g = [machine("m0", "mul", 2), machine("m1", "add", 4)];
  return { ...empty("name"), machines: f, other: g, solution: f, input: 3, target: 10 };
}

/** `f(k)` con la máquina ya nombrada: la ficha entra por el paréntesis. */
function evaluateRound(p: FnParams, rnd: Random): FnProblem {
  const f = buildChain(p, rnd, p.stages);
  const entrada = rnd.int(1, 9);
  const salida = fnRun(entrada, f).output;
  const primera = fnRun(entrada, f.slice(0, 1)).output;
  const ultima = fnRun(entrada, f.slice(-1)).output;
  const opciones: FnOption[] = [
    { id: "o0", pieces: [numPiece(salida)], correct: true, ambiguous: false },
    {
      id: "o1",
      pieces: [numPiece(primera)],
      correct: false,
      ambiguous: false,
      lure: "only_first_step",
    },
    {
      id: "o2",
      pieces: [numPiece(ultima)],
      correct: false,
      ambiguous: false,
      lure: "only_last_step",
    },
  ];
  return {
    ...empty("evaluate"),
    machines: f,
    solution: f,
    input: entrada,
    target: salida,
    argument: [numPiece(entrada)],
    options: dedupe(opciones, rnd),
  };
}

/** `f(a)` y `f(x + 1)`: la entrada deja de ser un número y la regla no cambia. */
function lettersRound(p: FnParams, rnd: Random): FnProblem {
  const f = buildChain(p, rnd, Math.max(2, p.stages - 1));
  const conExpresion = p.inputKinds.includes("expression") && rnd.bool();
  const paso = rnd.int(1, 4);
  const argumento: FnPiece[] = conExpresion
    ? [symPiece("x"), opPiece("add"), numPiece(paso)]
    : [symPiece("a")];
  const correcta = fnRulePieces(f, argumento);
  // El error que el diseño describe: operar con lo que sale en vez de con lo que
  // entra, que es leer el paréntesis como una multiplicación.
  const afuera: FnPiece[] = conExpresion
    ? [...fnRulePieces(f, [symPiece("x")]), opPiece("add"), numPiece(paso)]
    : [...fnRulePieces(f, [symPiece("a")]).slice(0, -2)];
  const sinUltimo = fnRulePieces(f.slice(0, -1), argumento);
  const opciones: FnOption[] = [
    { id: "o0", pieces: correcta, correct: true, ambiguous: false },
    { id: "o1", pieces: afuera, correct: false, ambiguous: false, lure: "outside_the_slot" },
    { id: "o2", pieces: sinUltimo, correct: false, ambiguous: false, lure: "only_first_step" },
  ];
  return {
    ...empty("letters"),
    machines: f,
    solution: f,
    inputKind: conExpresion ? "expression" : "letter",
    argument: argumento,
    options: dedupe(opciones, rnd),
  };
}

/**
 * Dos máquinas encadenadas, en el orden que no da la salida pedida. Dar vuelta
 * el caño la cambia, y eso prepara `alg.fn.composition`.
 */
function chainRound(p: FnParams, rnd: Random): FnProblem {
  for (let intento = 0; intento < 40; intento++) {
    const a = machine("m0", "mul", rnd.int(2, 5));
    const b = machine("m1", rnd.bool() ? "add" : "sub", rnd.int(1, 8));
    const entrada = rnd.int(2, 9);
    const bien = rnd.bool() ? [a, b] : [b, a];
    const mal = [bien[1] as FnMachine, bien[0] as FnMachine];
    const salida = fnRun(entrada, bien).output;
    if (salida === fnRun(entrada, mal).output) continue;
    if (salida < 1 || salida > FN_MAX_VALUE || !Number.isInteger(salida)) continue;
    return {
      ...empty("chain"),
      machines: mal,
      solution: bien,
      input: entrada,
      target: salida,
    };
  }
  const bien = [machine("m0", "mul", 3), machine("m1", "add", 2)];
  return {
    ...empty("chain"),
    machines: [bien[1] as FnMachine, bien[0] as FnMachine],
    solution: bien,
    input: 4,
    target: 14,
  };
}

/**
 * Una máquina que escupe alguna entrada sin procesarla. No es un error del
 * jugador ni de la máquina: es que esa entrada no es del dominio, y así se
 * prepara `alg.rat.division_by_zero_hole` sin nombrar la palabra.
 */
function rejectRound(p: FnParams, rnd: Random): FnProblem {
  const divisor = rnd.int(2, 4);
  const suma = rnd.int(1, 6);
  const multiplos = [1, 2, 3, 4, 5].map((k) => k * divisor);
  const buenas = rnd.shuffle(multiplos).slice(0, 2);
  const malas = rnd
    .shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((v) => v % divisor !== 0))
    .slice(0, FN_TRAY_SLOTS - 2);
  const fichas = rnd.shuffle([...buenas, ...malas]);
  const elegida = buenas[0] as number;
  // La máquina no acepta lo que no divide entero: la regla es la máquina, y el
  // dominio es lo que la regla puede recibir.
  const cadena = [
    machine("m0", "div", divisor, null, null),
    machine("m1", p.ops.includes("add") ? "add" : "sub", suma),
  ];
  return {
    ...empty("reject"),
    machines: cadena,
    solution: cadena,
    tokens: fichas,
    input: elegida,
    target: fnRun(elegida, cadena).output,
  };
}

/**
 * Dos escrituras, una función. `k(x + b)` y `kx + kb` son la misma máquina
 * escrita de dos maneras, y decidirlo sin evaluar todas las entradas es lo que
 * el nodo pide en `formal`.
 */
function sameRuleRound(rnd: Random): FnProblem {
  const k = rnd.int(2, 5);
  const b = rnd.int(1, 6);
  const regla: FnPiece[] = [
    numPiece(k),
    { kind: "open" },
    symPiece("x"),
    opPiece("add"),
    numPiece(b),
    { kind: "close" },
  ];
  const opciones: FnOption[] = [
    {
      id: "o0",
      pieces: [numPiece(k), symPiece("x"), opPiece("add"), numPiece(k * b)],
      correct: true,
      ambiguous: false,
    },
    {
      id: "o1",
      pieces: [numPiece(k), symPiece("x"), opPiece("add"), numPiece(b)],
      correct: false,
      ambiguous: false,
      lure: "only_first_step",
    },
    {
      id: "o2",
      pieces: [symPiece("x"), opPiece("add"), numPiece(k * b)],
      correct: false,
      ambiguous: false,
      lure: "only_last_step",
    },
  ];
  return {
    ...empty("sameRule"),
    argument: regla,
    input: k,
    target: b,
    options: dedupe(opciones, rnd),
  };
}

/**
 * La regla desde una tabla que dos reglas explican. `2x` y `x + c` coinciden en
 * `x = c` y en ninguna otra entrada, así que la fila que se muestra no alcanza y
 * la entrada extra es la que decide. Es el argumento de que una función no es su
 * tabla parcial.
 */
function fromTableRound(rnd: Random): FnProblem {
  const c = rnd.int(2, 8);
  const extra = rnd.int(1, 9) === c ? c + 1 : rnd.int(1, 9);
  const separadora = extra === c ? c + 1 : extra;
  const doble = [machine("m0", "mul", 2)];
  const suma = [machine("m0", "add", c)];
  const esDoble = rnd.bool();
  const verdadera = esDoble ? doble : suma;
  const opciones: FnOption[] = [
    {
      id: "o0",
      pieces: fnRulePieces(doble, [symPiece("x")]),
      correct: esDoble,
      ambiguous: false,
      ...(esDoble ? {} : { lure: "other_rule" as const }),
    },
    {
      id: "o1",
      pieces: fnRulePieces(suma, [symPiece("x")]),
      correct: !esDoble,
      ambiguous: false,
      ...(esDoble ? { lure: "other_rule" as const } : {}),
    },
  ];
  return {
    ...empty("fromTable"),
    machines: verdadera,
    solution: verdadera,
    rows: rowsFor([c], verdadera),
    extra: separadora,
    tokens: [separadora],
    options: rnd.shuffle(opciones),
  };
}

/**
 * Una tabla y una pregunta: ¿es una función?
 *
 * Las dos tablas se diferencian en una sola fila, y es a propósito: la que sí es
 * función **también repite una entrada**, con la misma salida, que es lo que el
 * jugador vio iluminarse desde el primer nivel. Lo que decide no es que una
 * entrada aparezca dos veces sino que las dos veces salga lo mismo, y el par de
 * tablas obliga a mirar exactamente eso.
 *
 * La ronda no trae fichas: la pregunta es sí o no, y las dos respuestas son
 * palabras que pone la app. Cuál es la correcta lo dice `fnRowsAreFunction`
 * sobre las filas, así que el criterio vive en un solo lugar.
 */
function relationRound(p: FnParams, rnd: Random): FnProblem {
  const chain = buildChain(p, rnd, 1);
  const entradas = tokens(rnd, 3, 1, 8).sort((a, b) => a - b);
  const filas = rowsFor(entradas, chain);
  const esFuncion = rnd.bool();
  const repetida = entradas[rnd.int(0, entradas.length - 1)] as number;
  const salida = fnRun(repetida, chain).output;
  const ultima: FnRow = {
    input: repetida,
    output: esFuncion ? salida : salida + rnd.int(1, 5),
    second: null,
  };
  return {
    ...empty("relation"),
    machines: chain,
    solution: chain,
    rows: [...filas, ultima],
    input: repetida,
  };
}

/**
 * Las opciones, sin repetidas y barajadas. Dos distractores pueden coincidir
 * —una máquina de un paso hace que "solo el primero" y "solo el último" sean lo
 * mismo— y una ficha duplicada convierte la ronda en una trampa boba.
 */
function dedupe(options: readonly FnOption[], rnd: Random): FnOption[] {
  const vistas = new Set<string>();
  const out: FnOption[] = [];
  for (const o of options) {
    const clave = JSON.stringify(o.pieces);
    if (vistas.has(clave)) continue;
    vistas.add(clave);
    out.push(o);
  }
  return rnd.shuffle(out);
}

export const fnLevelByNumber = (n: number): FnLevel | undefined =>
  FN_LEVELS.find((l) => l.n === n);
export const TOTAL_FN_LEVELS = FN_LEVELS.length;

registerNode({
  id: NODE,
  n: 17,
  prereqs: ["prealg.var.unknown_as_box", "arith.expr.precedence_tree"],
  levels: FN_LEVELS,
});

/** Las capas y los verbos que el nodo recorre, para los tests y el mapa. */
export const FN_LAYERS: readonly Layer[] = ["concrete", "visual", "symbolic", "formal"];
export const FN_EVIDENCE: readonly Evidence[] = [
  "recognize",
  "explain",
  "manipulate",
  "apply",
  "generalize",
];
