/**
 * El rastro del caminante, para `alg.fn.graph_as_picture`.
 *
 * Los ocho niveles y qué endurece cada parámetro salen del documento del
 * minijuego y de `D1/18`, no de acá: este archivo los implementa, no los decide.
 *
 * La idea que sostiene todo: **la gráfica no acompaña a la función, es la
 * función vista de otra manera**. Por eso el objeto central de este módulo no
 * es una curva sino un rastro con la misma forma que la tabla de la máquina del
 * nodo 17: una altura por posición, y nada más. `GpTrace` no puede guardar dos
 * alturas para la misma posición, así que el invariante `same_input_same_output`
 * no es una regla que el juego vigile sino algo que el modelo no sabe romper.
 *
 * Romperlo requiere salir del tipo, y el nivel 8 lo hace a propósito: `GpCurve`
 * es una polilínea cualquiera, que puede cerrarse sobre sí misma o volver hacia
 * atrás. La prueba de la recta vertical, `gpVerticalLineTest`, es exactamente la
 * frontera entre los dos tipos, y por eso la definición formal del nodo se puede
 * comprobar con un test en vez de escribirse en un cartel.
 *
 * El terreno viaja aparte del rastro aunque los dos salgan de la misma máquina.
 * No es duplicación: el punto de ruptura del nodo es que el rastro **no es una
 * foto del terreno**, y con un solo objeto para los dos el error sería cierto.
 * Aplanar el terreno sin tocar el rastro tiene que ser posible.
 *
 * Sin texto visible: acá hay datos, claves y estructura. Los numerales y los
 * paréntesis los dibuja la actividad, que es la que sabe componer glifos.
 */

import { makeRandom, type Random } from "./random.ts";
import { registerNode, type LevelBase } from "./node.ts";
import type { Evidence, Layer } from "./one-step.ts";

/** El nodo del grafo que este minijuego enseña. */
export const NODE = "alg.fn.graph_as_picture";

/**
 * El mismo id, sin ambigüedad. `index.ts` reúne dieciséis minijuegos con
 * `export *` y cada uno declara su propio `NODE`, así que afuera del módulo se
 * lo nombra así. Todo lo demás de este archivo va prefijado por la misma razón.
 */
export const NODE_GRAPH_PICTURE = NODE;

// --- La hoja -----------------------------------------------------------------

/** Una gota de tinta: el par entrada y salida, guardado en un solo lugar. */
export interface GpPoint {
  readonly x: number;
  readonly y: number;
}

/**
 * Un rastro. Guarda la altura de cada posición entera desde `from`, y `null`
 * donde no hay ninguna.
 *
 * La forma del dato **es** el invariante: un arreglo indexado por posición no
 * tiene dónde poner dos alturas sobre el mismo lugar. Lo que el jugador ve como
 * "la segunda gota empuja a la primera fuera de la hoja" es el modelo negándose
 * a existir de otra manera.
 */
export interface GpTrace {
  readonly id: string;
  /** La primera posición del rastro. */
  readonly from: number;
  readonly heights: readonly (number | null)[];
  /**
   * Las posiciones después de las cuales la línea no se une: el salto. No es un
   * agujero en el dominio —sobre las dos hay altura— sino la línea que se corta.
   */
  readonly breaks: readonly number[];
}

/** La última posición del rastro. */
export const gpTo = (trace: GpTrace): number => trace.from + trace.heights.length - 1;

/** La altura sobre una posición, o `null` si no hay ninguna. */
export function gpHeightAt(trace: GpTrace, x: number): number | null {
  const i = x - trace.from;
  if (i < 0 || i >= trace.heights.length) return null;
  return trace.heights[i] ?? null;
}

/** Las gotas del rastro: todos los pares que la máquina devolvió. */
export function gpPoints(trace: GpTrace): GpPoint[] {
  const out: GpPoint[] = [];
  for (let i = 0; i < trace.heights.length; i++) {
    const y = trace.heights[i];
    if (y === null || y === undefined) continue;
    out.push({ x: trace.from + i, y });
  }
  return out;
}

/** Las posiciones del rastro donde la hoja quedó vacía. */
export function gpGaps(trace: GpTrace): number[] {
  const out: number[] = [];
  for (let i = 0; i < trace.heights.length; i++) {
    if (trace.heights[i] === null) out.push(trace.from + i);
  }
  return out;
}

/**
 * Si la línea se dibuja entre una posición y la siguiente. No se une cuando hay
 * un salto declarado o cuando a alguno de los dos lados le falta la altura.
 */
export function gpJoins(trace: GpTrace, x: number): boolean {
  if (trace.breaks.includes(x)) return false;
  return gpHeightAt(trace, x) !== null && gpHeightAt(trace, x + 1) !== null;
}

/**
 * En qué región cae una gota. Cero es sobre un eje, que no es ninguna de las
 * cuatro: el signo no alcanza para ubicarla y el jugador lo tiene que ver.
 */
export function gpQuadrant(p: GpPoint): 0 | 1 | 2 | 3 | 4 {
  if (p.x === 0 || p.y === 0) return 0;
  if (p.x > 0) return p.y > 0 ? 1 : 4;
  return p.y > 0 ? 2 : 3;
}

/** El mismo par leído al revés. Es el error del catálogo, dicho en el modelo. */
export const gpSwap = (p: GpPoint): GpPoint => ({ x: p.y, y: p.x });

export const gpSame = (a: GpPoint, b: GpPoint): boolean => a.x === b.x && a.y === b.y;

// --- Una curva cualquiera ----------------------------------------------------

/**
 * Una polilínea sin ninguna promesa: puede volver sobre sí misma, tener un tramo
 * vertical o cerrarse. Es lo contrario de `GpTrace` a propósito, porque el nivel
 * 8 pregunta justamente si una curva es o no el rastro de una máquina.
 */
export interface GpCurve {
  readonly id: string;
  readonly points: readonly GpPoint[];
  readonly closed: boolean;
}

/** Por qué una curva no puede ser rastro de una máquina. */
export type GpViolation = "two_heights" | "closed_curve" | "vertical_segment";

/** Los tramos de una curva, con el de cierre si la curva se cierra. */
function gpSegments(curve: GpCurve): readonly (readonly [GpPoint, GpPoint])[] {
  const out: (readonly [GpPoint, GpPoint])[] = [];
  for (let i = 0; i < curve.points.length - 1; i++) {
    const a = curve.points[i];
    const b = curve.points[i + 1];
    if (a && b) out.push([a, b]);
  }
  const first = curve.points[0];
  const last = curve.points[curve.points.length - 1];
  if (curve.closed && first && last && !gpSame(first, last)) out.push([last, first]);
  return out;
}

/**
 * La prueba de la recta vertical: la definición formal del nodo, ejecutable.
 *
 * Devuelve la posición donde la recta corta la curva dos veces, o `null` si no
 * la corta dos veces en ninguna. Un tramo vertical falla en el acto: sobre esa
 * posición hay infinitas alturas, que es más de una.
 *
 * Se prueba en los vértices y en el medio de cada par de vértices consecutivos,
 * que es donde una polilínea puede esconder un cruce: entre dos vértices los
 * tramos son rectos y no se pueden cruzar sin haberse cruzado ya en un extremo.
 */
export function gpVerticalLineTest(curve: GpCurve): { readonly ok: boolean; readonly at: number | null } {
  const segs = gpSegments(curve);
  const xs = [...new Set(curve.points.map((p) => p.x))].sort((a, b) => a - b);
  const candidatas: number[] = [];
  for (let i = 0; i < xs.length; i++) {
    const a = xs[i];
    const b = xs[i + 1];
    if (a !== undefined) candidatas.push(a);
    if (a !== undefined && b !== undefined) candidatas.push((a + b) / 2);
  }

  for (const x of candidatas) {
    const alturas: number[] = [];
    for (const [a, b] of segs) {
      if (a.x === b.x) {
        // Un tramo vertical: sobre esa posición la curva ocupa todo un intervalo.
        if (a.x === x && a.y !== b.y) return { ok: false, at: x };
        continue;
      }
      const lo = Math.min(a.x, b.x);
      const hi = Math.max(a.x, b.x);
      if (x < lo - 1e-9 || x > hi + 1e-9) continue;
      const y = a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x);
      if (!alturas.some((v) => Math.abs(v - y) < 1e-9)) alturas.push(y);
      if (alturas.length > 1) return { ok: false, at: x };
    }
  }
  return { ok: true, at: null };
}

/** Un rastro leído como curva, para poder pasarlo por la misma prueba. */
export function gpCurveOf(trace: GpTrace): GpCurve {
  return { id: trace.id, points: gpPoints(trace), closed: false };
}

// --- Lo que endurece ---------------------------------------------------------

/**
 * Lo único que endurece. La capa, la pregunta, el terreno, los hilos y la
 * máquina del costado viven afuera justamente para que la regla del diseño —un
 * nivel cambia de capa o endurece parámetros, nunca las dos cosas— se pueda
 * comprobar con un test.
 */
export interface GpParams {
  /** Cuántas lomas tiene el terreno. */
  readonly bumps: number;
  /** Hasta dónde llega el caminante, en posiciones. */
  readonly xRange: readonly [number, number];
  /** Entre qué alturas se mueve. */
  readonly yRange: readonly [number, number];
  /** Hay alturas bajo el nivel del mar y posiciones hacia atrás. */
  readonly negatives: boolean;
  /** El terreno puede tener tramos planos. */
  readonly flats: boolean;
  /** Cuántas veces se corta la línea sin que falte altura. */
  readonly jumps: number;
  /** Cuántas posiciones se quedan sin altura. */
  readonly gaps: number;
  /** Cuántos rastros hay en la misma hoja. */
  readonly traces: number;
}

/**
 * Qué se pregunta en una ronda. No es dificultad: es qué gesto contesta.
 *
 * - `spot`: el caminante ya dejó su rastro y se muestra una posición; tocar la
 *   gota que le corresponde entre las que están marcadas.
 * - `continue`: la escena se detiene a mitad de camino y hay tres
 *   continuaciones dibujadas; tocar la que sigue.
 * - `walk`: arrastrar al caminante hasta que la hoja tenga todas sus gotas.
 * - `read`: leer el par de una gota entre pares escritos, uno de ellos al revés.
 * - `place`: ubicar un par soltando un punto en la hoja.
 * - `judge`: decir si una curva puede ser rastro de una máquina. Arma su propia
 *   curva y no lee `params`.
 */
export type GpAsk = "spot" | "continue" | "walk" | "read" | "place" | "judge";

/** Qué queda del terreno: se ve, se está yendo, ya no está. */
export type GpTerrain = "shown" | "faded" | "hidden";

/** Cuánta hoja hay: un rincón de alturas positivas o las cuatro regiones. */
export type GpSheet = "corner" | "quadrants";

export interface GpLevel extends LevelBase {
  readonly params: GpParams;
  /** Qué pide cada ronda, ciclando. Un nivel con dos preguntas alterna. */
  readonly asks: readonly GpAsk[];
  readonly terrain: GpTerrain;
  readonly sheet: GpSheet;
  /** Las dos reglas con marcas y los hilos punteados desde cada gota. */
  readonly threads: boolean;
  /** La máquina del nodo 17 al costado. */
  readonly machine: "hidden" | "onDemand";
  /** Los pares se escriben. Es el símbolo que nace en este nodo. */
  readonly pairs: boolean;
  /** Los ejes llevan su letra, y `y = f(x)` aparece bajo el rastro. */
  readonly axisLabels: boolean;
  /**
   * Los errores del catálogo que este nivel clasifica. Un movimiento que el
   * nivel no declara se muestra igual, pero el `attempt` va sin campo: anotar un
   * error que el diseño todavía no está evaluando ensucia la remediación para
   * siempre.
   */
  readonly classifies: readonly string[];
  /** La definición corta con voz. Solo en `formal`. */
  readonly definition: boolean;
}

/**
 * El único error que el catálogo de L apunta a este nodo.
 *
 * `negative_times_negative`, que la ficha del minijuego nombra como heredada de
 * `arith.int.negatives`, **no lista a este nodo** en `misconceptions.yaml`, así
 * que ningún movimiento de acá puede viajar con ella: la regla del repositorio
 * manda que el `attempt` vaya sin campo cuando el catálogo no apunta al nodo.
 * Los otros dos que el documento describe están en minería y todavía no tienen
 * entrada, así que tampoco.
 */
export const GP_MISCONCEPTION = "graph_read_axes_swapped";

// --- Los niveles -------------------------------------------------------------

const P1: GpParams = {
  bumps: 1,
  xRange: [0, 6],
  yRange: [0, 5],
  negatives: false,
  flats: false,
  jumps: 0,
  gaps: 0,
  traces: 1,
};

const P2: GpParams = {
  bumps: 2,
  xRange: [-4, 6],
  yRange: [-3, 5],
  negatives: true,
  flats: false,
  jumps: 0,
  gaps: 0,
  traces: 1,
};

const P3: GpParams = {
  bumps: 3,
  xRange: [-6, 6],
  yRange: [-5, 6],
  negatives: true,
  flats: true,
  jumps: 1,
  gaps: 1,
  traces: 2,
};

/**
 * Los ocho niveles del documento. Cada uno cambia la capa o endurece los
 * parámetros, nunca las dos cosas:
 *
 * 1 → 2 y 2 → 3 cambian de capa con el mismo terreno, 3 → 4 endurece sin
 * moverse de `concrete`, 4 → 5 y 5 → 6 cambian de capa con la misma dificultad
 * numérica, 6 → 7 endurece sin moverse de `symbolic` y 7 → 8 se lleva el nodo a
 * `formal` sin tocar un parámetro.
 *
 * DISCREPANCIA ANOTADA. El documento le pide al nivel 1 una sola loma y al
 * nivel 3 dos, y entre los dos hay dos cambios de capa. La regla del repositorio
 * prohíbe las dos cosas juntas y manda correr el ensanchamiento al nivel
 * siguiente: los niveles 1 a 3 comparten el terreno de una loma y el 4 recibe la
 * segunda loma junto con los negativos, que ya eran suyos. No se pierde nada del
 * recorrido, se reparte distinto.
 *
 * SEGUNDA DISCREPANCIA ANOTADA. El documento llama al nivel 8 `formal` y
 * `abstract` a la vez. Gana la regla por el mismo camino que el nodo 16: la capa
 * queda en `formal`, que es la que tiene superficie propia, y `abstract` en D1
 * es el estado del nodo y no una pantalla. Las curvas que hay que descartar
 * entran como **pregunta** y no como parámetro: `judge` arma su propia curva y
 * no lee `params`, así que el nivel 8 cambia de capa sin endurecer nada.
 */
export const GP_LEVELS: readonly GpLevel[] = [
  {
    n: 1,
    titleKey: "level.thePencilThatDrawsAlone",
    layer: "real",
    evidence: ["recognize"],
    rounds: 3,
    params: P1,
    asks: ["spot"],
    terrain: "shown",
    sheet: "corner",
    threads: false,
    machine: "hidden",
    pairs: false,
    axisLabels: false,
    // Tocar una gota no escribe ningún par, así que el error del catálogo, que
    // es sobre un par leído al revés, no se puede cometer acá.
    classifies: [],
    definition: false,
  },
  {
    n: 2,
    titleKey: "level.whereDoesItGoOn",
    layer: "intuition",
    evidence: ["explain"],
    rounds: 3,
    params: P1,
    asks: ["continue"],
    terrain: "shown",
    sheet: "corner",
    threads: false,
    machine: "hidden",
    pairs: false,
    axisLabels: false,
    classifies: [],
    definition: false,
  },
  {
    n: 3,
    titleKey: "level.dragTheWalker",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 3,
    params: P1,
    asks: ["walk"],
    terrain: "shown",
    sheet: "corner",
    threads: false,
    machine: "hidden",
    pairs: false,
    axisLabels: false,
    classifies: [],
    definition: false,
  },
  {
    n: 4,
    titleKey: "level.belowSeaLevel",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 3,
    params: P2,
    asks: ["walk"],
    terrain: "shown",
    sheet: "quadrants",
    threads: false,
    machine: "hidden",
    pairs: false,
    axisLabels: false,
    classifies: [],
    definition: false,
  },
  {
    n: 5,
    titleKey: "level.threadsAndRulers",
    layer: "visual",
    evidence: ["explain", "manipulate"],
    rounds: 4,
    params: P2,
    asks: ["read", "walk"],
    terrain: "faded",
    sheet: "quadrants",
    threads: true,
    machine: "onDemand",
    pairs: false,
    axisLabels: false,
    classifies: [GP_MISCONCEPTION],
    definition: false,
  },
  {
    n: 6,
    titleKey: "level.pairsAndAxes",
    layer: "symbolic",
    evidence: ["manipulate", "apply"],
    rounds: 4,
    params: P2,
    asks: ["place", "read"],
    terrain: "hidden",
    sheet: "quadrants",
    threads: true,
    machine: "onDemand",
    pairs: true,
    axisLabels: true,
    classifies: [GP_MISCONCEPTION],
    definition: false,
  },
  {
    n: 7,
    titleKey: "level.tracesNeverSeen",
    layer: "symbolic",
    evidence: ["apply", "generalize"],
    rounds: 4,
    params: P3,
    asks: ["read", "place"],
    terrain: "hidden",
    sheet: "quadrants",
    threads: true,
    machine: "onDemand",
    pairs: true,
    axisLabels: true,
    classifies: [GP_MISCONCEPTION],
    definition: false,
  },
  {
    n: 8,
    titleKey: "level.theVerticalLine",
    layer: "formal",
    evidence: ["generalize"],
    rounds: 4,
    params: P3,
    asks: ["judge"],
    terrain: "hidden",
    sheet: "quadrants",
    threads: false,
    machine: "onDemand",
    pairs: true,
    axisLabels: true,
    // Juzgar una curva no lee ningún par, así que el error del catálogo no
    // tiene dónde ocurrir.
    classifies: [],
    definition: true,
  },
];

// --- El error del catálogo ---------------------------------------------------

/**
 * El error que corresponde al movimiento, si el nivel lo está evaluando.
 *
 * Es el par leído al revés y nada más: un par equivocado por otro motivo es
 * otra cosa y va sin campo. Con las dos coordenadas iguales el par dado vuelta
 * es el mismo par, así que no hay error que anotar.
 */
export function gpMisconceptionFor(
  level: GpLevel,
  chosen: GpPoint,
  target: GpPoint,
): string | undefined {
  if (!level.classifies.includes(GP_MISCONCEPTION)) return undefined;
  if (target.x === target.y) return undefined;
  return gpSame(chosen, gpSwap(target)) ? GP_MISCONCEPTION : undefined;
}

// --- Lo que trae una ronda ---------------------------------------------------

export interface GpProblem {
  readonly ask: GpAsk;
  /** Los rastros de la hoja. El primero es el de la máquina del jugador. */
  readonly traces: readonly GpTrace[];
  /**
   * El terreno bajo el caminante. Sale de la misma máquina que el primer rastro
   * y viaja aparte a propósito: aplanarlo sin tocar el rastro es la respuesta a
   * "el rastro es una foto del terreno".
   */
  readonly terrain: GpTrace;
  /** La posición que se pregunta. */
  readonly asked: number;
  /** El par que hay que tocar o ubicar, o `null` cuando no se pregunta uno. */
  readonly target: GpPoint | null;
  /** Las gotas marcadas (`spot`) o los pares escritos (`read`). */
  readonly options: readonly GpPoint[];
  readonly correct: number;
  /** Las tres continuaciones dibujadas. Vacío fuera de `continue`. */
  readonly continuations: readonly GpCurve[];
  /** Hasta dónde llegó el caminante solo, en posiciones. */
  readonly drawnTo: number;
  /** La curva que hay que juzgar, o `null`. */
  readonly curve: GpCurve | null;
  /** Si la curva de `judge` puede ser rastro de una máquina. */
  readonly isGraph: boolean;
  /** Por qué no puede serlo, o `null`. */
  readonly violation: GpViolation | null;
}

/** Gotas marcadas y pares escritos montados siempre, para que el árbol no cambie. */
export const GP_OPTION_SLOTS = 4;
/** Continuaciones montadas siempre. */
export const GP_CONTINUATION_SLOTS = 3;
/** Cuántos pasos dibuja una continuación. */
export const GP_CONTINUATION_STEPS = 4;

// --- El generador ------------------------------------------------------------

/**
 * Genera una ronda. La semilla la hace reproducible; la ronda decide cuál de las
 * preguntas del nivel toca, porque un nivel con dos preguntas tiene que
 * alternarlas y no sortearlas: sorteadas, cuatro rondas pueden no dar nunca
 * evidencia de uno de los dos verbos.
 */
export function generateGraphPicture(level: GpLevel, seed: number, round = 0): GpProblem {
  const rnd = makeRandom(seed);
  const asks = level.asks;
  const ask = (asks[round % asks.length] ?? asks[0]) as GpAsk;

  if (ask === "judge") return judgeProblem(rnd);

  const terreno = terrainOf(level.params, rnd);
  const rastro: GpTrace = { ...terreno, id: "t0" };
  const traces: GpTrace[] = [rastro];
  // El segundo rastro obliga a usar el par como identificador y no como
  // ubicación aproximada: con dos líneas, señalar con el dedo deja de alcanzar.
  if (level.params.traces > 1) traces.push(otherTrace(level.params, rastro, rnd));

  const puntos = gpPoints(rastro);
  const base: GpProblem = {
    ask,
    traces,
    terrain: terreno,
    asked: rastro.from,
    target: null,
    options: [],
    correct: 0,
    continuations: [],
    drawnTo: gpTo(rastro),
    curve: null,
    isGraph: true,
    violation: null,
  };

  if (ask === "walk") {
    // Caminar cubre el rastro entero, así que no hay una posición preguntada:
    // la hoja arranca vacía y el objetivo es que no le falte ninguna gota.
    return { ...base, drawnTo: rastro.from };
  }

  if (ask === "continue") {
    const corte = Math.max(
      rastro.from + 1,
      Math.min(gpTo(rastro) - GP_CONTINUATION_STEPS, rastro.from + Math.floor(rastro.heights.length / 2)),
    );
    const opciones = continuationsOf(rastro, corte, rnd);
    return { ...base, drawnTo: corte, continuations: opciones.curvas, correct: opciones.correct };
  }

  const objetivo = puntos[rnd.int(0, Math.max(0, puntos.length - 1))] as GpPoint;

  if (ask === "spot") {
    const otras = rnd.shuffle(puntos.filter((p) => !gpSame(p, objetivo))).slice(0, GP_OPTION_SLOTS - 1);
    const opciones = rnd.shuffle([objetivo, ...otras]);
    return {
      ...base,
      asked: objetivo.x,
      target: objetivo,
      options: opciones,
      correct: opciones.findIndex((p) => gpSame(p, objetivo)),
    };
  }

  if (ask === "read") {
    // El objetivo tiene que poder leerse al revés, o el error del catálogo no
    // tendría dónde aparecer y el nivel dejaría de clasificarlo.
    const legible = puntos.filter((p) => p.x !== p.y);
    const elegido = (legible[rnd.int(0, Math.max(0, legible.length - 1))] ?? objetivo) as GpPoint;
    const opciones = pairOptions(elegido, level.params, rnd);
    return {
      ...base,
      asked: elegido.x,
      target: elegido,
      options: opciones,
      correct: opciones.findIndex((p) => gpSame(p, elegido)),
    };
  }

  // `place`: el par se pide escrito y la hoja está vacía en esa posición. La
  // gota que el jugador suelta es la que faltaba, no una copia de la que está.
  const libre = puntos.filter((p) => p.x !== p.y);
  const elegido = (libre[rnd.int(0, Math.max(0, libre.length - 1))] ?? objetivo) as GpPoint;
  return {
    ...base,
    asked: elegido.x,
    target: elegido,
    // La gota pedida se saca de la hoja: ubicarla es completar el rastro.
    traces: traces.map((t, i) => (i === 0 ? withoutHeight(t, elegido.x) : t)),
    drawnTo: gpTo(rastro),
  };
}

/** El rastro sin la altura de una posición: el hueco que el jugador completa. */
function withoutHeight(trace: GpTrace, x: number): GpTrace {
  const i = x - trace.from;
  return { ...trace, heights: trace.heights.map((h, k) => (k === i ? null : h)) };
}

/**
 * El terreno de una ronda: una suma de lomas muestreada en cada posición
 * entera. Las lomas se suman en vez de encadenarse para que la altura de cada
 * posición salga de una sola cuenta, que es lo que hace que el rastro no tenga
 * manera de contradecir al terreno.
 */
function terrainOf(p: GpParams, rnd: Random): GpTrace {
  const [x0, x1] = p.xRange;
  const [ylo, yhi] = p.yRange;
  const largo = x1 - x0 + 1;

  let heights: (number | null)[] = [];
  for (let intento = 0; intento < 80; intento++) {
    const lomas = Array.from({ length: Math.max(1, p.bumps) }, () => ({
      c: rnd.int(x0, x1),
      // Con los negativos habilitados una loma puede ser una hondonada, que es
      // lo que manda la tinta del otro lado de la línea del nivel del mar.
      a: (p.negatives && rnd.bool() ? -1 : 1) * rnd.int(2, Math.max(2, yhi)),
      w: rnd.int(2, 3),
    }));
    const crudo: number[] = [];
    for (let i = 0; i < largo; i++) {
      const x = x0 + i;
      let h = 0;
      for (const l of lomas) h += l.a * Math.max(0, 1 - Math.abs(x - l.c) / l.w);
      crudo.push(Math.max(ylo, Math.min(yhi, Math.round(h))));
    }
    // Un terreno chato no enseña nada: el rastro tiene que subir y bajar para
    // que "tramo que sube" y "tramo plano" sean cosas distintas.
    const alto = Math.max(...crudo);
    const bajo = Math.min(...crudo);
    if (alto - bajo < 2) continue;
    // Con los negativos encendidos, el caminante tiene que bajar del nivel del
    // mar de verdad: sin una altura negativa la hoja no se abriría hacia abajo.
    if (p.negatives && bajo >= 0) continue;
    heights = crudo;
    break;
  }
  if (heights.length === 0) {
    // Ninguno de los intentos sirvió: una rampa cumple todo lo que se pedía.
    heights = Array.from({ length: largo }, (_, i) =>
      Math.max(ylo, Math.min(yhi, (p.negatives ? ylo : 0) + i)),
    );
  }

  if (p.flats) {
    // Un tramo plano: la máquina devuelve lo mismo para posiciones distintas, y
    // eso no rompe nada. Es la mitad que el jugador suele creer prohibida.
    const desde = rnd.int(1, Math.max(1, largo - 3));
    const valor = heights[desde] ?? 0;
    for (let i = desde; i < Math.min(desde + 3, largo); i++) heights[i] = valor;
  }

  const breaks: number[] = [];
  for (let k = 0; k < p.jumps; k++) {
    // El salto corre todo lo que viene después: la línea se corta y sobre las
    // dos posiciones sigue habiendo una sola altura.
    const corte = x0 + rnd.int(2, Math.max(2, largo - 3));
    const delta = (rnd.bool() ? 1 : -1) * rnd.int(3, 4);
    for (let i = corte - x0 + 1; i < largo; i++) {
      const h = heights[i];
      if (h !== null && h !== undefined) heights[i] = Math.max(ylo, Math.min(yhi, h + delta));
    }
    if (!breaks.includes(corte)) breaks.push(corte);
  }

  // El tramo plano, el salto y los huecos pueden haberse llevado la única altura
  // bajo el nivel del mar. Sin ninguna, la hoja no tendría por qué abrirse hacia
  // abajo y el nivel dejaría de enseñar lo que dice enseñar, así que el terreno
  // entero baja hasta que la haya. Cabe siempre: si el mínimo era positivo, el
  // máximo no llegaba al techo y bajar no lo hunde por debajo del piso.
  if (p.negatives) {
    const bajo = Math.min(...heights.filter((h): h is number => h !== null));
    if (bajo >= 0) {
      heights = heights.map((h) => (h === null ? null : Math.max(ylo, h - bajo - 1)));
    }
  }

  for (let k = 0; k < p.gaps; k++) {
    // Una posición sin altura: la máquina no devuelve nada ahí y la hoja queda
    // vacía. Rompe la idea de que toda posición tiene altura.
    const hueco = rnd.int(1, Math.max(1, largo - 2));
    if (breaks.includes(x0 + hueco) || breaks.includes(x0 + hueco - 1)) continue;
    heights[hueco] = null;
  }

  return { id: "terrain", from: x0, heights, breaks };
}

/**
 * El segundo rastro de la hoja: el primero dado vuelta contra el medio del
 * rango. Se refleja en vez de correrse porque correr y después recortar contra
 * el techo junta las dos líneas justo en las alturas extremas, y dos rastros que
 * comparten una gota dejarían de poder distinguirse por su par, que es
 * exactamente lo que el nivel enseña.
 */
function otherTrace(p: GpParams, base: GpTrace, _rnd: Random): GpTrace {
  const [ylo, yhi] = p.yRange;
  const medio = ylo + yhi;
  return {
    id: "t1",
    from: base.from,
    heights: base.heights.map((h) => {
      if (h === null || h === undefined) return null;
      const espejo = medio - h;
      // Con un rango de suma impar el reflejo nunca cae sobre su original; el
      // desvío cubre el otro caso sin salirse del rango.
      return espejo === h ? (h === yhi ? h - 1 : h + 1) : espejo;
    }),
    breaks: base.breaks,
  };
}

/**
 * Las tres continuaciones del nivel 2, que son las del documento: la que sigue
 * el terreno, la que sube cuando el terreno baja y la que vuelve atrás sobre sí
 * misma. La tercera no es un rastro y por eso es una `GpCurve`: hacerla con el
 * tipo del rastro sería imposible, que es exactamente lo que el nivel enseña.
 */
function continuationsOf(
  trace: GpTrace,
  corte: number,
  rnd: Random,
): { readonly curvas: readonly GpCurve[]; readonly correct: number } {
  const desde = gpHeightAt(trace, corte) ?? 0;
  const pasos = Math.min(GP_CONTINUATION_STEPS, gpTo(trace) - corte);

  const buena: GpPoint[] = [{ x: corte, y: desde }];
  for (let i = 1; i <= pasos; i++) {
    const y = gpHeightAt(trace, corte + i);
    if (y === null) break;
    buena.push({ x: corte + i, y });
  }

  // La espejada: cada paso va para el lado contrario del que va el terreno.
  const espejada: GpPoint[] = [{ x: corte, y: desde }];
  for (let i = 1; i < buena.length; i++) {
    const real = buena[i] as GpPoint;
    const previo = buena[i - 1] as GpPoint;
    const anterior = espejada[i - 1] as GpPoint;
    espejada.push({ x: real.x, y: anterior.y - (real.y - previo.y) });
  }
  // Sobre un tramo plano no hay lado contrario y la espejada saldría idéntica a
  // la buena: dos opciones iguales harían que elegir bien o mal sea lo mismo.
  if (espejada.every((q, i) => gpSame(q, buena[i] as GpPoint))) {
    for (let i = 1; i < espejada.length; i++) {
      espejada[i] = { x: (buena[i] as GpPoint).x, y: desde - i };
    }
  }

  /**
   * La que vuelve atrás: dos alturas sobre la misma posición, que es el punto de
   * ruptura de la analogía y no el rastro de ninguna máquina.
   *
   * No se arma repitiendo la buena y volviendo sobre ella, que sería lo obvio:
   * así su mitad de ida **queda dibujada encima de la buena** y las dos se
   * vuelven imposibles de distinguir con el dedo. Sube por su propio camino y
   * recién después vuelve.
   */
  const largo = Math.max(2, buena.length - 1);
  const vuelta: GpPoint[] = [
    { x: corte, y: desde },
    { x: corte + largo, y: desde + 3 },
    { x: corte + Math.max(1, largo - 1), y: desde + 4 },
    { x: corte + 1, y: desde + 1 },
  ];

  const curvas: GpCurve[] = [
    { id: "c0", points: buena, closed: false },
    { id: "c1", points: espejada, closed: false },
    { id: "c2", points: vuelta, closed: false },
  ];
  const orden = rnd.shuffle([0, 1, 2]);
  return {
    curvas: orden.map((i, k) => ({ ...(curvas[i] as GpCurve), id: `c${k}` })),
    correct: orden.indexOf(0),
  };
}

/**
 * Los pares escritos de `read`. Llevan el verdadero, el mismo dado vuelta y dos
 * vecinos: los distractores del documento, y no ruido al azar. El par dado
 * vuelta es el que el catálogo apunta a este nodo.
 */
function pairOptions(target: GpPoint, p: GpParams, rnd: Random): readonly GpPoint[] {
  const [ylo, yhi] = p.yRange;
  const dentro = (q: GpPoint): boolean =>
    q.x >= p.xRange[0] - 1 && q.x <= p.xRange[1] + 1 && q.y >= ylo - 1 && q.y <= yhi + 1;

  const out: GpPoint[] = [target];
  const agregar = (q: GpPoint): void => {
    if (out.some((o) => gpSame(o, q))) return;
    if (out.length >= GP_OPTION_SLOTS) return;
    out.push(q);
  };

  agregar(gpSwap(target));
  // El signo cambiado en uno solo: manda la gota a otra región sin cambiar los
  // numerales, que es el distractor de `gen_coordinate_pair`.
  if (dentro({ x: -target.x, y: target.y })) agregar({ x: -target.x, y: target.y });
  if (dentro({ x: target.x, y: -target.y })) agregar({ x: target.x, y: -target.y });
  let paso = 1;
  while (out.length < GP_OPTION_SLOTS && paso < 6) {
    agregar({ x: target.x, y: target.y + paso });
    agregar({ x: target.x + paso, y: target.y });
    paso++;
  }
  return rnd.shuffle(out);
}

/**
 * La curva del nivel 8. Es una pregunta y no un parámetro: arma su propia curva
 * y no lee `params`, y por eso el nivel cambia de capa sin endurecer nada.
 *
 * Las tres maneras de fallar son las del documento y ninguna se inventa: dos
 * alturas sobre una posición, una curva cerrada y un tramo vertical. Una sola
 * violación por instancia, para que el jugador pueda decir cuál es.
 */
function judgeProblem(rnd: Random): GpProblem {
  const clases: readonly (GpViolation | null)[] = [null, "two_heights", "closed_curve", "vertical_segment"];
  const violation = rnd.pick(clases);
  const puntos: GpPoint[] = [];
  let closed = false;

  if (violation === null) {
    // Un rastro cualquiera, con alturas que suben y bajan y una sola por lugar.
    let y = rnd.int(-3, 3);
    for (let x = -5; x <= 5; x++) {
      puntos.push({ x, y });
      y = Math.max(-5, Math.min(5, y + rnd.int(-2, 2)));
    }
  } else if (violation === "two_heights") {
    // La cueva: la curva vuelve sobre sí misma y sobre esas posiciones hay dos
    // alturas. Es el punto de ruptura `two_heights_at_one_place`.
    const alto = rnd.int(2, 4);
    puntos.push({ x: -5, y: -alto }, { x: -1, y: -alto }, { x: 3, y: alto }, { x: -2, y: alto + 1 }, { x: -5, y: 1 });
  } else if (violation === "closed_curve") {
    // Una curva cerrada, dibujada como un polígono alrededor del origen.
    const r = rnd.int(3, 5);
    const lados = 8;
    for (let i = 0; i < lados; i++) {
      const a = (i * 2 * Math.PI) / lados;
      puntos.push({ x: Math.round(r * Math.cos(a)), y: Math.round(r * Math.sin(a)) });
    }
    closed = true;
  } else {
    // Un tramo vertical: sobre esa posición la curva ocupa un intervalo entero.
    const x = rnd.int(-2, 2);
    puntos.push({ x: -5, y: -2 }, { x, y: -2 }, { x, y: 3 }, { x: 5, y: 3 });
  }

  const curve: GpCurve = { id: "j", points: puntos, closed };
  const prueba = gpVerticalLineTest(curve);
  return {
    ask: "judge",
    traces: [],
    terrain: { id: "terrain", from: 0, heights: [], breaks: [] },
    asked: 0,
    target: null,
    options: [],
    correct: 0,
    continuations: [],
    drawnTo: 0,
    curve,
    isGraph: prueba.ok,
    violation: prueba.ok ? null : violation,
  };
}

export const gpLevelByNumber = (n: number): GpLevel | undefined => GP_LEVELS.find((l) => l.n === n);
export const TOTAL_GP_LEVELS = GP_LEVELS.length;

registerNode({
  id: NODE,
  n: 18,
  prereqs: ["alg.fn.function_as_machine", "arith.int.negatives"],
  levels: GP_LEVELS,
});

/** Las capas y los verbos que el nodo recorre, para los tests y el mapa. */
export const GP_LAYERS: readonly Layer[] = [
  "real",
  "intuition",
  "concrete",
  "visual",
  "symbolic",
  "formal",
];
export const GP_EVIDENCE: readonly Evidence[] = [
  "recognize",
  "explain",
  "manipulate",
  "apply",
  "generalize",
];
