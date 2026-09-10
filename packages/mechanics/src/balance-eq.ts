/**
 * Los dos platos, para `prealg.eq.balance`.
 *
 * Los siete niveles y qué endurece cada parámetro salen del documento del
 * minijuego y de `D1/11`, no de acá: este archivo los implementa, no los decide.
 *
 * La idea que sostiene todo: el igual no ordena calcular, afirma. Una igualdad
 * es un estado que sobrevive exactamente a las acciones idénticas en los dos
 * lados, y por eso el modelo no tiene "resultado": tiene dos platos, una barra
 * que contesta, y un movimiento que solo cuenta cuando recorrió los dos. Tocar
 * un solo plato no es un error de cuenta sino de naturaleza, y la barra
 * inclinada es el mensaje entero.
 *
 * Lo que no está y no debería estar: multiplicar o repartir los dos platos. No
 * tienen gesto físico, la analogía se rompe ahí y el diseño los manda al nodo
 * 12. Acá solo se suma y se quita.
 *
 * Sin texto visible: el nodo es `literacy: none` y acá solo hay claves y datos.
 */

import { makeRandom, type Random } from "./random.ts";
import { registerNode, type LevelBase } from "./node.ts";
import type { Evidence, Layer } from "./one-step.ts";

/** El nodo del grafo que este minijuego enseña. */
export const NODE = "prealg.eq.balance";

/**
 * El mismo id, sin ambigüedad. `index.ts` reúne los minijuegos con `export *` y
 * cada uno declara su propio `NODE`, así que afuera del módulo se lo nombra así.
 */
export const NODE_BALANCE_EQ = NODE;

export type BalSide = "left" | "right";

/**
 * Qué se pregunta en una ronda. No es dificultad: es qué gesto contesta, y
 * sobre todo qué papel juega la barra.
 *
 * - `level`: la barra empieza inclinada y hay que enderezarla. Tocar un solo
 *   plato es justamente lo que hace falta.
 * - `keep`: la barra empieza derecha y llega una tarea que la pone en riesgo.
 *   Conservar el nivel es la respuesta, y no hacer nada de un lado la rompe.
 * - `free`: hay un cajón en un plato. Quitar lo mismo de los dos hasta dejarlo
 *   solo, y entonces se abre.
 * - `repair`: la igualdad es falsa. Es el único caso en que tocar un solo lado
 *   es lo correcto, porque acá no hay nada que conservar sino algo que arreglar.
 * - `action`: acciones que no son aritmética —girar, pintar, agregar una
 *   figura— aplicadas a los dos platos. El invariante desnudo, sin números.
 */
export type BalAsk = "level" | "keep" | "free" | "repair" | "action";

/**
 * Cómo se dibuja. Son las etapas de desvanecimiento de `balance`: las pesas,
 * las barras proporcionales, y las fichas con la línea del igual al lado.
 */
export type BalSkin = "weights" | "bars" | "chips";

/**
 * Una acción que no tiene nada que ver con pesar. Las tres primeras conservan
 * la igualdad si recorren los dos platos; `pour` no conserva nada y está para
 * que el error tenga cuerpo: es el tobogán, el igual leído como flecha.
 */
export type BalActionKind = "turn" | "paint" | "addFigure" | "pour";

/**
 * Los dos errores del catálogo que este nodo puede clasificar, y ninguno más.
 * `L` declara los dos sobre `prealg.eq.balance` con mecánica `balance`, que es
 * la del nodo; cualquier otro id sería inventado.
 */
export const BAL_MISCONCEPTIONS = ["inverse_applied_one_side", "equals_as_operator"] as const;
export type BalMisconception = (typeof BAL_MISCONCEPTIONS)[number];

/** El cajón del nodo 10, puesto en un plato. Lo que tiene adentro solo lo sabe la barra. */
export interface BalBox {
  readonly side: BalSide;
  /** Lo que hay adentro. Es fijo mientras dure la ronda: por eso es incógnita. */
  readonly hidden: number;
}

/** Lo que la ronda de conservar pide hacer, y hay que hacer en los dos platos. */
export interface BalTask {
  readonly kind: "remove" | "add";
  readonly value: number;
}

export interface BalProblem {
  readonly ask: BalAsk;
  /** Las pesas sueltas de cada plato al empezar. El cajón viaja aparte. */
  readonly left: readonly number[];
  readonly right: readonly number[];
  readonly box: BalBox | null;
  /** Las pesas de la reserva, abajo. Arrastrar una la agrega a un plato. */
  readonly reserve: readonly number[];
  /** La tarea, solo en las rondas de conservar. */
  readonly task: BalTask | null;
  /** Las acciones ofrecidas, solo en las rondas sin números. */
  readonly actions: readonly BalActionKind[];
}

/** Dónde puede aparecer el cajón. Es lo que endurece entre el nivel 2 y el 3. */
export type BalBoxSide = "none" | "left" | "any";

/**
 * Lo único que endurece. La piel, la línea simbólica, la definición y las
 * acciones sin números viven afuera justamente para que la regla del diseño —un
 * nivel cambia de capa o endurece parámetros, nunca las dos cosas— se pueda
 * comprobar con un test.
 */
export interface BalParams {
  /** Cuántas pesas sueltas puede llegar a tener un plato. */
  readonly pieces: number;
  /** El rango de las pesas y de lo que hay en el cajón. */
  readonly range: readonly [number, number];
  readonly boxSide: BalBoxSide;
}

export interface BalLevel extends LevelBase {
  readonly params: BalParams;
  /** Qué pide cada ronda, ciclando. Un nivel con dos preguntas alterna. */
  readonly asks: readonly BalAsk[];
  readonly skin: BalSkin;
  /** La línea con el `=` al lado de la balanza: nace al pasar a `symbolic`. */
  readonly line: boolean;
  /** La balanza se ve, o queda como fantasma que se pide tocando el `=`. */
  readonly balance: "shown" | "ghost";
  /**
   * Los errores del catálogo que este nivel clasifica. Un movimiento que el
   * nivel no declara se muestra igual —la barra se inclina— pero el `attempt`
   * va sin campo: anotar un error que el diseño todavía no está evaluando
   * ensucia la remediación.
   */
  readonly classifies: readonly BalMisconception[];
  /** La definición corta con voz. Solo en `formal`. */
  readonly definition: boolean;
}

/**
 * Los siete niveles del documento. Cada uno cambia la capa o endurece los
 * parámetros, nunca las dos cosas:
 *
 * 1 → 2 no toca nada y cambia lo que se pregunta —la barra pasa de enderezarse
 * a conservarse—, 2 → 3 endurece (entra el cajón del nodo 10), 3 → 4 y 4 → 5
 * cambian de capa con la misma dificultad numérica, 5 → 6 endurece dentro de la
 * misma capa (los dos lados compuestos y la caja de cualquier lado), y 6 → 7
 * cambia de capa sin tocar un parámetro.
 */
export const BAL_LEVELS: readonly BalLevel[] = [
  {
    n: 1,
    titleKey: "level.straighten",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 3,
    params: { pieces: 2, range: [1, 6], boxSide: "none" },
    asks: ["level"],
    skin: "weights",
    line: false,
    balance: "shown",
    // Enderezar es tocar un solo plato: acá eso no es un error, es la jugada.
    classifies: [],
    definition: false,
  },
  {
    n: 2,
    titleKey: "level.keepItStraight",
    layer: "concrete",
    evidence: ["recognize", "manipulate"],
    rounds: 4,
    params: { pieces: 2, range: [1, 6], boxSide: "none" },
    asks: ["keep"],
    skin: "weights",
    line: false,
    balance: "shown",
    classifies: ["inverse_applied_one_side"],
    definition: false,
  },
  {
    n: 3,
    titleKey: "level.boxInAPan",
    layer: "concrete",
    evidence: ["apply"],
    rounds: 3,
    params: { pieces: 2, range: [2, 6], boxSide: "left" },
    asks: ["free"],
    skin: "weights",
    line: false,
    balance: "shown",
    classifies: ["inverse_applied_one_side"],
    definition: false,
  },
  {
    n: 4,
    titleKey: "level.barsAndStates",
    layer: "visual",
    evidence: ["explain", "manipulate"],
    rounds: 3,
    params: { pieces: 2, range: [2, 6], boxSide: "left" },
    asks: ["free"],
    skin: "bars",
    line: false,
    balance: "shown",
    classifies: ["inverse_applied_one_side"],
    definition: false,
  },
  {
    n: 5,
    titleKey: "level.theBarBecomesEqual",
    layer: "symbolic",
    evidence: ["manipulate"],
    rounds: 3,
    params: { pieces: 2, range: [2, 6], boxSide: "left" },
    asks: ["free"],
    skin: "chips",
    line: true,
    balance: "shown",
    classifies: ["inverse_applied_one_side"],
    definition: false,
  },
  {
    n: 6,
    titleKey: "level.bothSidesComposed",
    layer: "symbolic",
    evidence: ["apply"],
    rounds: 4,
    params: { pieces: 3, range: [2, 9], boxSide: "any" },
    asks: ["free"],
    skin: "chips",
    line: true,
    // La balanza se retira acá: el jugador aplica la acción a los dos lados de
    // la línea sin mirar los platos, y los pide tocando el `=`.
    balance: "ghost",
    classifies: ["inverse_applied_one_side", "equals_as_operator"],
    definition: false,
  },
  {
    n: 7,
    titleKey: "level.actionsNeverSeen",
    layer: "formal",
    evidence: ["generalize"],
    rounds: 4,
    params: { pieces: 3, range: [2, 9], boxSide: "any" },
    asks: ["repair", "action"],
    skin: "chips",
    line: true,
    balance: "shown",
    classifies: ["inverse_applied_one_side", "equals_as_operator"],
    definition: true,
  },
];

/**
 * Pesas montadas por plato y en la reserva. El árbol de la escena no cambia
 * entre rondas, así que las ranuras se declaran una vez y sobran siempre.
 */
export const BAL_PAN_SLOTS = 6;
export const BAL_RESERVE_SLOTS = 4;

/** Las tres frases de la capa formal, por clave. El texto vive en la app. */
export const BAL_DEFINITION_KEYS: readonly string[] = [
  "bal.definition.sameWorth",
  "bal.definition.sameAction",
  "bal.definition.notAnOrder",
];

// --- Los movimientos ---------------------------------------------------------

/**
 * Un movimiento del jugador. Siempre nombra un plato: la pregunta del nodo es
 * "en cuántos platos", no "cuánto", y por eso ningún movimiento es de los dos
 * lados a la vez. La acción a los dos lados es un movimiento y su espejo.
 */
export type BalMove =
  | { readonly kind: "remove"; readonly side: BalSide; readonly value: number }
  | { readonly kind: "add"; readonly side: BalSide; readonly value: number }
  /** Una pesa que cruza la barra. Es la jugada que más inclina, y está permitida. */
  | { readonly kind: "cross"; readonly side: BalSide; readonly value: number }
  | { readonly kind: "act"; readonly side: BalSide; readonly action: BalActionKind };

/** El estado de los dos platos mientras se juega la ronda. */
export interface BalState {
  readonly left: readonly number[];
  readonly right: readonly number[];
  /** Las acciones que ya recibió cada plato, en orden. */
  readonly actedLeft: readonly BalActionKind[];
  readonly actedRight: readonly BalActionKind[];
  /** Si la tarea de conservar ya se hizo de cada lado. */
  readonly taskLeft: boolean;
  readonly taskRight: boolean;
}

export const balOtherSide = (side: BalSide): BalSide => (side === "left" ? "right" : "left");

/** El estado inicial de un problema. */
export function balStart(problem: BalProblem): BalState {
  return {
    left: [...problem.left],
    right: [...problem.right],
    actedLeft: [],
    actedRight: [],
    taskLeft: false,
    taskRight: false,
  };
}

/**
 * Dos movimientos son espejos cuando son la misma acción en el otro plato. Es
 * la única familia que conserva la igualdad, y por eso es la que hace avanzar.
 */
export function balMirrors(a: BalMove | null, b: BalMove | null): boolean {
  if (!a || !b) return false;
  if (a.kind !== b.kind || a.side === b.side) return false;
  if (a.kind === "act" && b.kind === "act") return a.action === b.action;
  if (a.kind === "act" || b.kind === "act") return false;
  // Cruzar no tiene espejo: pasar una pesa de un plato al otro ya son dos
  // acciones, y hacerlo de vuelta no la deja donde estaba.
  if (a.kind === "cross") return false;
  return a.value === b.value;
}

/**
 * Si en esta pregunta el nivel de la barra es un hecho a conservar. Donde no lo
 * es —enderezar una balanza inclinada, reparar una igualdad falsa— tocar un solo
 * plato es la respuesta y no puede llevar `misconception`.
 */
export const balPairs = (ask: BalAsk): boolean =>
  ask === "keep" || ask === "free" || ask === "action";

/**
 * Qué error catalogado corresponde a un movimiento, si hay alguno.
 *
 * Volcar un plato sobre el otro es leer el igual como flecha: es
 * `equals_as_operator`, el `detect` del catálogo en gesto. Dejar una acción a
 * medio camino y empezar otra es `inverse_applied_one_side`. Cualquier otra cosa
 * se muestra —la barra se inclina— y no se anota: el catálogo de L no tiene una
 * tercera entrada apuntando a este nodo y un id inventado ensucia para siempre.
 */
export function balMisconceptionFor(
  level: BalLevel,
  problem: BalProblem,
  /** El estado en que quedaron los platos después del movimiento. */
  after: BalState,
  move: BalMove,
  pending: BalMove | null,
): BalMisconception | undefined {
  // La barra derecha es el hecho, y manda sobre todo lo demás: un movimiento
  // que deja la igualdad en pie no puede ser ninguno de los dos errores, y eso
  // incluye deshacer el propio. Sin esta regla, arreglar lo que uno rompió se
  // anotaría como romperlo de nuevo.
  if (balLevelled(problem, after)) return undefined;
  const clasifica = (id: BalMisconception): BalMisconception | undefined =>
    level.classifies.includes(id) ? id : undefined;
  if (move.kind === "cross") return clasifica("equals_as_operator");
  if (move.kind === "act" && move.action === "pour") return clasifica("equals_as_operator");
  if (!balPairs(problem.ask)) return undefined;
  if (pending && !balMirrors(pending, move)) return clasifica("inverse_applied_one_side");
  return undefined;
}

/** Saca una pesa de un plato. Devuelve la lista igual si esa pesa no estaba. */
function sinUna(weights: readonly number[], value: number): number[] {
  const i = weights.indexOf(value);
  if (i < 0) return [...weights];
  return [...weights.slice(0, i), ...weights.slice(i + 1)];
}

const puestas = (state: BalState, side: BalSide): readonly number[] =>
  side === "left" ? state.left : state.right;

const actuadas = (state: BalState, side: BalSide): readonly BalActionKind[] =>
  side === "left" ? state.actedLeft : state.actedRight;

/**
 * Aplica un movimiento. Es una función pura del estado: nada se pierde y nada
 * se llama incorrecto, porque el estado que deja una acción a un solo plato es
 * exactamente desde donde el jugador la arregla.
 */
export function balApply(problem: BalProblem, state: BalState, move: BalMove): BalState {
  const izq = move.side === "left";
  const set = (side: BalSide, weights: readonly number[], base: BalState): BalState =>
    side === "left" ? { ...base, left: weights } : { ...base, right: weights };

  let next: BalState = state;

  if (move.kind === "remove") {
    next = set(move.side, sinUna(puestas(state, move.side), move.value), state);
  } else if (move.kind === "add") {
    next = set(move.side, [...puestas(state, move.side), move.value], state);
  } else if (move.kind === "cross") {
    const desde = sinUna(puestas(state, move.side), move.value);
    const hacia = [...puestas(state, balOtherSide(move.side)), move.value];
    next = set(balOtherSide(move.side), hacia, set(move.side, desde, state));
  } else if (move.action === "pour") {
    // El tobogán: todo lo del plato cae en el otro. No queda anotado como una
    // acción recibida, a propósito: si lo quedara, la ronda ya no se podría
    // arreglar, y el diseño pide que el jugador nivele desde el estado roto.
    const desde = puestas(state, move.side);
    const hacia = [...puestas(state, balOtherSide(move.side)), ...desde];
    return set(balOtherSide(move.side), hacia, set(move.side, [], state));
  } else {
    const accion = move.action;
    next = izq
      ? { ...state, actedLeft: [...state.actedLeft, accion] }
      : { ...state, actedRight: [...state.actedRight, accion] };
    // Agregar una figura es la única acción que además cambia lo que hay.
    if (accion === "addFigure") {
      next = set(move.side, [...puestas(next, move.side), 1], next);
    }
    return next;
  }

  const task = problem.task;
  if (task && move.kind === task.kind && move.value === task.value) {
    next = izq ? { ...next, taskLeft: true } : { ...next, taskRight: true };
  }
  return next;
}

// --- La barra ----------------------------------------------------------------

/** Lo que pesa un plato, con el cajón adentro si le tocó. */
export function balMass(problem: BalProblem, state: BalState, side: BalSide): number {
  const sueltas = puestas(state, side).reduce((s, w) => s + w, 0);
  const caja = problem.box && problem.box.side === side ? problem.box.hidden : 0;
  return sueltas + caja;
}

const mismasAcciones = (a: readonly BalActionKind[], b: readonly BalActionKind[]): boolean =>
  a.length === b.length && a.every((k, i) => k === b[i]);

/**
 * Cuánto se inclina la barra, de -1 a 1. Negativo es el plato izquierdo abajo.
 *
 * En las rondas sin números la barra no pesa: contesta si los dos platos
 * recibieron lo mismo, que es el invariante desnudo del final del nodo.
 */
export function balTilt(problem: BalProblem, state: BalState): number {
  if (problem.ask === "action" && !mismasAcciones(state.actedLeft, state.actedRight)) {
    // Lo que desnivela es la acción que le falta a un plato, no su peso.
    const d = state.actedLeft.length - state.actedRight.length;
    return d === 0 ? 1 : Math.max(-1, Math.min(1, d));
  }
  const l = balMass(problem, state, "left");
  const r = balMass(problem, state, "right");
  const d = l - r;
  if (d === 0) return 0;
  // Una diferencia chica sobre platos cargados daría una inclinación que no se
  // ve, y una barra que no se ve moverse no dice nada. Cualquier desequilibrio
  // arranca en un tercio del tope y crece desde ahí: la barra tiene que gritar.
  const escala = Math.max(1, (l + r) / 3);
  return Math.sign(d) * Math.min(1, TILT_FLOOR + (1 - TILT_FLOOR) * (Math.abs(d) / escala));
}

/** Lo mínimo que se inclina una barra que no está derecha, de 0 a 1. */
export const TILT_FLOOR = 0.34;

/** La barra quedó derecha. Es el hecho, no la tarea. */
export function balLevelled(problem: BalProblem, state: BalState): boolean {
  return balTilt(problem, state) === 0;
}

/** El cajón quedó solo en su plato: no hay nada más que quitar. */
export function balBoxAlone(problem: BalProblem, state: BalState): boolean {
  if (!problem.box) return false;
  return puestas(state, problem.box.side).length === 0;
}

/**
 * Si la ronda está resuelta. Cada pregunta tiene su hecho, y todos incluyen la
 * barra derecha: es lo único que el nodo evalúa siempre.
 */
export function balSolved(problem: BalProblem, state: BalState): boolean {
  if (!balLevelled(problem, state)) return false;
  switch (problem.ask) {
    case "keep":
      return state.taskLeft && state.taskRight;
    case "free":
      return balBoxAlone(problem, state);
    case "action": {
      // Conservar con una acción que no es aritmética: la misma, en los dos.
      const comunes = state.actedLeft.filter(
        (k) => k !== "pour" && state.actedRight.includes(k),
      );
      return comunes.length > 0;
    }
    default:
      return true;
  }
}

// --- El generador ------------------------------------------------------------

/**
 * Genera una ronda. La semilla la hace reproducible; la ronda decide cuál de
 * las preguntas del nivel toca, porque un nivel con dos preguntas tiene que
 * alternarlas y no sortearlas: sorteadas, cuatro rondas pueden no dar nunca
 * evidencia de las dos cosas.
 */
export function generateBalanceEq(level: BalLevel, seed: number, round = 0): BalProblem {
  const rnd = makeRandom(seed);
  const asks = level.asks;
  const ask = (asks[round % asks.length] ?? asks[0]) as BalAsk;
  switch (ask) {
    case "level":
      return nivelar(level, rnd);
    case "keep":
      return conservar(level, rnd, round);
    case "repair":
      return reparar(level, rnd);
    case "action":
      return accionar(rnd);
    default:
      return liberar(level, rnd);
  }
}

/** Pesas de relleno para la reserva: la que resuelve y dos que no. */
function reserva(justa: number, hi: number, rnd: Random): number[] {
  const out = new Set<number>([justa]);
  let guarda = 0;
  while (out.size < BAL_RESERVE_SLOTS && guarda++ < 40) {
    const v = rnd.int(1, Math.max(2, hi));
    if (v !== justa) out.add(v);
  }
  return rnd.shuffle([...out]);
}

/**
 * Enderezar. Un plato tiene lo mismo que el otro y una pesa de más, así que las
 * dos salidas existen: quitar la que sobra, o agregar una igual enfrente. La
 * balanza no dice cuál: dice cuánto falta.
 */
function nivelar(level: BalLevel, rnd: Random): BalProblem {
  const [lo, hi] = level.params.range;
  const comun = rnd.int(lo, hi);
  const sobra = rnd.int(Math.max(1, lo), hi);
  const pesado = rnd.bool() ? "left" : "right";
  const cargado = rnd.shuffle([comun, sobra]);
  return {
    ask: "level",
    left: pesado === "left" ? cargado : [comun],
    right: pesado === "left" ? [comun] : cargado,
    box: null,
    reserve: reserva(sobra, hi, rnd),
    task: null,
    actions: [],
  };
}

/**
 * Conservar. La balanza llega derecha y la tarea la pone en riesgo.
 *
 * Con la tarea de agregar, los dos lados se ven distintos y pesan lo mismo
 * —`a + b` contra `a + b` en una sola pesa—, que es la tercera dificultad del
 * nodo. Con la de quitar, los dos platos comparten la pesa que hay que sacar,
 * porque una pesa que no está en un plato no se puede quitar de ahí.
 */
function conservar(level: BalLevel, rnd: Random, round: number): BalProblem {
  const [lo, hi] = level.params.range;
  const quitar = round % 2 === 1;
  if (quitar) {
    const comun = rnd.int(lo, hi);
    const resto = rnd.int(lo, hi);
    const lado = rnd.shuffle([comun, resto]);
    return {
      ask: "keep",
      left: lado,
      right: rnd.shuffle([comun, resto]),
      box: null,
      reserve: reserva(comun, hi, rnd),
      task: { kind: "remove", value: comun },
      actions: [],
    };
  }
  const a = rnd.int(lo, Math.max(lo, hi - lo));
  const b = rnd.int(lo, Math.max(lo, hi - a));
  const v = rnd.int(1, Math.max(2, hi));
  return {
    ask: "keep",
    left: [a, b],
    right: [a + b],
    box: null,
    reserve: reserva(v, hi, rnd),
    task: { kind: "add", value: v },
    actions: [],
  };
}

/**
 * La caja sola. Del lado del cajón hay pesas que también están enfrente: sacar
 * la misma de los dos platos es lo único que acerca, y cuando el cajón queda
 * solo lo que hay enfrente es lo que tiene adentro.
 *
 * Con los dos lados compuestos entra una pesa más que está en los dos platos:
 * quitarla también conserva y no acerca, que es el movimiento válido pero
 * inútil que el diseño pide que exista.
 */
function liberar(level: BalLevel, rnd: Random): BalProblem {
  const [lo, hi] = level.params.range;
  const oculto = rnd.int(Math.max(2, lo), hi);
  const comun = rnd.int(Math.max(1, lo), hi);
  const side: BalSide = level.params.boxSide === "any" && rnd.bool() ? "right" : "left";
  const extra = level.params.pieces >= 3 ? [rnd.int(Math.max(1, lo), hi)] : [];

  const conCaja = rnd.shuffle([comun, ...extra]);
  const sinCaja = rnd.shuffle([comun, oculto, ...extra]);
  return {
    ask: "free",
    left: side === "left" ? conCaja : sinCaja,
    right: side === "left" ? sinCaja : conCaja,
    box: { side, hidden: oculto },
    reserve: reserva(comun, hi, rnd),
    task: null,
    actions: [],
  };
}

/**
 * Reparar. La igualdad es falsa y no hay nada que conservar: el plato liviano
 * necesita lo que le falta, y tocar un solo lado es por una vez lo correcto.
 */
function reparar(level: BalLevel, rnd: Random): BalProblem {
  const [lo, hi] = level.params.range;
  const falta = rnd.int(Math.max(1, lo), hi);
  const base = Array.from({ length: Math.max(2, level.params.pieces - 1) }, () =>
    rnd.int(lo, hi),
  );
  const pesado = rnd.bool() ? "left" : "right";
  const cargado = rnd.shuffle([...base, falta]);
  return {
    ask: "repair",
    left: pesado === "left" ? cargado : [...base],
    right: pesado === "left" ? [...base] : cargado,
    box: null,
    reserve: reserva(falta, hi, rnd),
    task: null,
    actions: [],
  };
}

/**
 * Acciones que no son aritmética. Los dos platos empiezan con las mismas
 * figuras y la barra deja de pesar: contesta si los dos recibieron lo mismo.
 * Una de las acciones ofrecidas no conserva nada, y es la que el catálogo
 * llama leer el igual como flecha.
 */
function accionar(rnd: Random): BalProblem {
  const figuras = rnd.int(2, 3);
  const iguales = Array.from({ length: figuras }, () => 1);
  const ofrecidas = rnd.shuffle(["turn", "paint", "addFigure"] as BalActionKind[]);
  return {
    ask: "action",
    left: iguales,
    right: [...iguales],
    box: null,
    reserve: [],
    task: null,
    actions: [...ofrecidas, "pour"],
  };
}

export const balLevelByNumber = (n: number): BalLevel | undefined =>
  BAL_LEVELS.find((l) => l.n === n);
export const TOTAL_BAL_LEVELS = BAL_LEVELS.length;

registerNode({
  id: NODE,
  n: 11,
  prereqs: ["prealg.var.unknown_as_box"],
  levels: BAL_LEVELS,
});

/** Las capas y los verbos que el nodo recorre, para los tests y el mapa. */
export const BAL_LAYERS: readonly Layer[] = ["concrete", "visual", "symbolic", "formal"];
export const BAL_EVIDENCE: readonly Evidence[] = [
  "recognize",
  "explain",
  "manipulate",
  "apply",
  "generalize",
];
