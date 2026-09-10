/**
 * La rampa del caminante, para `alg.fn.linear_slope`.
 *
 * Los ocho niveles y qué endurece cada parámetro salen del documento del
 * minijuego y de `D1/19`, no de acá: este archivo los implementa, no los decide.
 *
 * La idea que sostiene todo: **la pendiente no es un número que se calcula, es
 * una razón que no cambia**. Por eso el objeto central de este módulo no es un
 * número sino `SlRatio`, un par subida y avance que nunca se divide hasta que
 * alguien pide el valor. Dos escalones de anchos distintos apoyados sobre la
 * misma rampa dan razones **distintas como pares y iguales como razón**, y
 * `slSameRatio` lo decide con dos multiplicaciones y sin punto flotante: el
 * invariante `steepness_independent_of_step_size` se comprueba con un test en
 * vez de escribirse en un cartel.
 *
 * Guardar la pendiente como un cociente ya hecho la rompería en el único lugar
 * donde el nodo se juega: con `2/7` en punto flotante, el escalón de ancho 7 y
 * el de ancho 14 dejarían de dar exactamente lo mismo, y la escena tendría que
 * comparar con una tolerancia. La tolerancia sería una segunda fuente de verdad
 * sobre qué significa "la misma cuesta".
 *
 * La rampa se dibuja con el `GpTrace` del nodo 18 y no con un tipo nuevo. No es
 * atajo: el prerequisito dice que la pendiente se mide **entre dos puntos del
 * rastro**, y esos puntos son los pares que nacieron allá. Un tipo propio para
 * la recta diría que la rampa es otra cosa que un rastro, que es exactamente el
 * error que el nodo 18 pasó ocho niveles desarmando.
 *
 * Sin texto visible: acá hay datos, claves y estructura. Los numerales, la `m`
 * y la `Δ` los dibuja la actividad, que es la que sabe componer glifos.
 */

import { makeRandom, type Random } from "./random.ts";
import { registerNode, type LevelBase } from "./node.ts";
import type { Evidence, Layer } from "./one-step.ts";
import { gpTo, type GpPoint, type GpTrace } from "./graph-picture.ts";

/** El nodo del grafo que este minijuego enseña. */
export const NODE = "alg.fn.linear_slope";

/**
 * El mismo id, sin ambigüedad. `index.ts` reúne dieciocho minijuegos con
 * `export *` y cada uno declara su propio `NODE`, así que afuera del módulo se
 * lo nombra así. Todo lo demás de este archivo va prefijado por la misma razón.
 */
export const NODE_LINEAR_SLOPE = NODE;

// --- La razón ----------------------------------------------------------------

/**
 * Subida sobre avance, sin dividir.
 *
 * Es el objeto que el nodo enseña. Se guarda como par y no como cociente para
 * que "el mismo empinado" sea una igualdad exacta entre enteros y no una
 * comparación con tolerancia.
 */
export interface SlRatio {
  readonly rise: number;
  readonly run: number;
}

/** El valor de la razón. Se pide solo para mostrarlo, nunca para compararlo. */
export const slValue = (r: SlRatio): number => r.rise / r.run;

/**
 * Si dos razones son la misma cuesta. **Es el invariante del nodo**, y
 * multiplicar en cruz lo decide sin dividir: `2/1`, `6/3` y `14/7` son el mismo
 * empinado, y ninguna de las tres igualdades depende del punto flotante.
 *
 * Toma pares de enteros. La subida de un escalón que el dedo forzó llega en
 * píxeles convertidos y no es entera; para ese escalón la pregunta no es si la
 * razón es la misma sino si apoya, y la contesta `slRests`.
 */
export const slSameRatio = (a: SlRatio, b: SlRatio): boolean =>
  a.rise * b.run === b.rise * a.run;

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** La misma razón con el avance positivo y sin factor común. */
export function slReduce(r: SlRatio): SlRatio {
  const signo = r.run < 0 ? -1 : 1;
  const d = gcd(r.rise, r.run) || 1;
  return { rise: (signo * r.rise) / d, run: (signo * r.run) / d };
}

/** Si las dos razones son el mismo par, y no solo la misma cuesta. */
export const slSamePair = (a: SlRatio, b: SlRatio): boolean =>
  a.rise === b.rise && a.run === b.run;

// --- La rampa ----------------------------------------------------------------

/** Una rampa recta: dónde empieza y cuánto sube por cada paso. */
export interface SlRamp {
  readonly slope: SlRatio;
  /** La altura donde cruza el eje vertical. */
  readonly intercept: number;
}

/** La altura de la rampa sobre una posición. */
export const slHeightAt = (ramp: SlRamp, x: number): number =>
  ramp.intercept + (ramp.slope.rise * x) / ramp.slope.run;

/**
 * La rampa dibujada como el rastro del nodo 18, una altura por posición entera.
 * Con pendiente fraccionaria las alturas no caen en la grilla, y por eso el
 * nivel que las estrena apaga las gotas y deja solo la línea.
 *
 * Lo que se sale de la ventana viaja como `null` y no recortado contra el
 * techo: una altura recortada sería una rampa que se acuesta al llegar arriba, y
 * eso es exactamente lo que este nodo no puede dibujar.
 */
export function slTrace(
  ramp: SlRamp,
  from: number,
  to: number,
  reach = Number.POSITIVE_INFINITY,
  id = "ramp",
): GpTrace {
  const heights: (number | null)[] = [];
  for (let x = from; x <= to; x++) {
    const y = slHeightAt(ramp, x);
    heights.push(Math.abs(y) > reach ? null : y);
  }
  return { id, from, heights, breaks: [] };
}

/** Hasta dónde llega la rampa sin salirse de la ventana, en posiciones. */
export function slVisibleRange(
  ramp: SlRamp,
  from: number,
  to: number,
  reach: number,
): readonly [number, number] {
  let lo = to;
  let hi = from;
  for (let x = from; x <= to; x++) {
    if (Math.abs(slHeightAt(ramp, x)) > reach) continue;
    if (x < lo) lo = x;
    if (x > hi) hi = x;
  }
  return lo <= hi ? [lo, hi] : [from, from];
}

/** El último lugar del rastro, para que la actividad no importe dos módulos. */
export const slTraceTo = (trace: GpTrace): number => gpTo(trace);

// --- El escalón --------------------------------------------------------------

/**
 * El escalón de medición: dónde se apoya, cuánto avanza y cuánto sube.
 *
 * La subida viaja en el escalón y no se deriva de la rampa a propósito: el
 * gesto central del nivel 4 es **forzar** una subida que no corresponde, y el
 * escalón despegado tiene que poder existir para que la consecuencia sea
 * visible en vez de imposible.
 */
export interface SlStep {
  readonly from: number;
  readonly run: number;
  readonly rise: number;
}

/** La razón que muestra un escalón, tal como se lo dibuja. */
export const slRatioOf = (step: SlStep): SlRatio => ({ rise: step.rise, run: step.run });

/**
 * La razón exacta de un escalón de ancho `run` apoyado sobre la rampa.
 *
 * **Es el invariante del nodo escrito de manera que se pueda probar.** La
 * subida de ese escalón es `rise · run` y su avance es `run · run`, así que el
 * factor común es el ancho y se va al reducir: la razón sale idéntica para
 * cualquier ancho, con enteros y sin dividir ni una vez. Dibujar el escalón sí
 * necesita el cociente, y por eso `slStepOn` lo hace; comprobar que la cuesta no
 * cambió, no.
 */
export const slRatioOn = (ramp: SlRamp, run: number): SlRatio =>
  slReduce({ rise: ramp.slope.rise * run, run: ramp.slope.run * run });

/** El escalón que apoya sobre la rampa desde una posición y con un ancho. */
export function slStepOn(ramp: SlRamp, from: number, run: number): SlStep {
  return { from, run, rise: slHeightAt(ramp, from + run) - slHeightAt(ramp, from) };
}

/**
 * Si el escalón apoya sobre la rampa. Se compara con tolerancia porque la
 * subida forzada por el dedo llega en píxeles convertidos y no en enteros; la
 * comparación que decide el invariante del nodo es `slSameRatio`, que no la usa.
 */
export function slRests(ramp: SlRamp, step: SlStep): boolean {
  const debido = slHeightAt(ramp, step.from + step.run) - slHeightAt(ramp, step.from);
  return Math.abs(step.rise - debido) < 1e-9;
}

/** Cuánto le falta al escalón para volver a tocar la rampa con su esquina. */
export function slGap(ramp: SlRamp, step: SlStep): number {
  return step.rise - (slHeightAt(ramp, step.from + step.run) - slHeightAt(ramp, step.from));
}

/** Los dos puntos de la rampa que el escalón toca, o tocaría si apoyara. */
export function slCorners(ramp: SlRamp, step: SlStep): readonly [GpPoint, GpPoint] {
  return [
    { x: step.from, y: slHeightAt(ramp, step.from) },
    { x: step.from + step.run, y: slHeightAt(ramp, step.from + step.run) },
  ];
}

/**
 * La pendiente entre dos puntos cualesquiera, sin dividir. Es la definición
 * formal del nodo, ejecutable: da el mismo par reducido con cualquier par de
 * puntos distintos de la misma recta, y `null` cuando no hay avance.
 */
export function slBetween(a: GpPoint, b: GpPoint): SlRatio | null {
  if (a.x === b.x) return null;
  return slReduce({ rise: b.y - a.y, run: b.x - a.x });
}

// --- La rampa escrita --------------------------------------------------------

/** Cómo viene escrita una recta: despejada, o con todo de un lado. */
export type SlForm = "solved" | "unsolved";

/**
 * Una recta escrita como `a x + b y = c`.
 *
 * Las dos formas del documento son la misma fila con distinto reparto, así que
 * son un solo tipo: despejada es `−m x + 1 y = b`, y sin despejar es cualquier
 * otra. Con `b = 0` la recta es vertical y no tiene pendiente, que es el caso
 * final del nodo y no un error.
 */
export interface SlWritten {
  readonly form: SlForm;
  readonly a: number;
  readonly b: number;
  readonly c: number;
}

/** La pendiente de una recta escrita, o `null` si es vertical. */
export function slSlopeOfWritten(w: SlWritten): SlRatio | null {
  if (w.b === 0) return null;
  return slReduce({ rise: -w.a, run: w.b });
}

/** La ordenada al origen de una recta escrita, o `null` si es vertical. */
export function slInterceptOfWritten(w: SlWritten): number | null {
  if (w.b === 0) return null;
  return w.c / w.b;
}

/** La misma rampa escrita en una forma o en la otra. */
export function slWrite(ramp: SlRamp, form: SlForm): SlWritten {
  const { rise, run } = slReduce(ramp.slope);
  if (form === "solved") return { form, a: -rise, b: run, c: ramp.intercept * run };
  // Sin despejar los dos lados se multiplican por el mismo entero, así que la
  // recta es la misma y la lectura posicional del renglón deja de servir.
  const k = 2;
  return { form, a: -rise * k, b: run * k, c: ramp.intercept * run * k };
}

/** Si dos rectas escritas son la misma recta. */
export const slSameLine = (u: SlWritten, v: SlWritten): boolean =>
  u.a * v.b === v.a * u.b && u.a * v.c === v.a * u.c && u.b * v.c === v.b * u.c;

// --- Los casos del nivel formal ----------------------------------------------

/**
 * Lo que el nivel final pregunta. `flat` es una función y no un caso raro;
 * `vertical` no tiene pendiente porque el avance vale cero; `parallel` y
 * `crossing` se deciden mirando solo las dos pendientes.
 */
export type SlCase = "flat" | "vertical" | "parallel" | "crossing";

/** Si dos rampas se cruzan. Misma pendiente y distinto arranque: nunca. */
export function slCross(u: SlRamp, v: SlRamp): boolean {
  if (slSameRatio(u.slope, v.slope)) return false;
  return true;
}

// --- Lo que endurece ---------------------------------------------------------

/**
 * Lo único que endurece. La capa, la pregunta, la manivela y las fichas viven
 * afuera justamente para que la regla del diseño —un nivel cambia de capa o
 * endurece parámetros, nunca las dos cosas— se pueda comprobar con un test.
 */
export interface SlParams {
  /** La magnitud más grande que puede tener la pendiente. */
  readonly maxSlope: number;
  /** La rampa puede bajar. Rompe la lectura "más alto es más grande". */
  readonly negative: boolean;
  /** La pendiente puede ser fraccionaria. Vuelve inútil contar marcas. */
  readonly fractional: boolean;
  /** El arranque puede no ser cero. Separa `m` de `b`. */
  readonly intercept: boolean;
  /** Hasta cuánto se puede estirar el escalón. En 1 el ancho es fijo. */
  readonly maxRun: number;
  /** Hasta dónde llega el caminante, en posiciones. */
  readonly xRange: readonly [number, number];
  /**
   * Cuánto sube y baja la ventana. La grilla se dibuja cuadrada —una unidad de
   * altura mide lo mismo que una de avance— porque si no, una rampa que sube 3
   * por paso se vería igual de empinada que una que sube 1, y el nodo entero es
   * eso. Así que la rampa se recorta contra este alcance en vez de agrandar la
   * ventana, y los dos puntos marcados nunca caen fuera de la hoja.
   */
  readonly yReach: number;
}

/**
 * Qué se pregunta en una ronda. No es dificultad: es qué gesto contesta.
 *
 * - `pick_ramp`: tres rampas con sus caminantes; tocar la que sube tanto por
 *   paso como dice la ficha.
 * - `which_harder`: la escena se detiene y hay tres respuestas dibujadas.
 * - `place_step`: apoyar el escalón en dos lugares distintos de la rampa y ver
 *   que el color no cambia. Es el invariante hecho gesto.
 * - `stretch_step`: estirar el escalón. Con un vertical que no corresponde se
 *   despega y flota, y la ronda se cierra cuando vuelve a apoyar.
 * - `crank`: girar la manivela hasta la casilla marcada. Cada vuelta avanza un
 *   paso y sube lo mismo.
 * - `stretch_grid`: estirar la grilla hasta que la rampa pase por el punto. El
 *   color del escalón cambia con ella: la pendiente es del par recta y grilla.
 * - `set_sliders`: los dos deslizadores hasta que la rampa pase por los dos
 *   puntos marcados. Son independientes.
 * - `slope_between`: la pendiente entre dos puntos, elegida entre razones
 *   escritas. Los distractores son los dos errores del catálogo.
 * - `read_form`: tocar la ficha `m` en una recta escrita, despejada o no.
 * - `judge_slope`: la rampa plana, la vertical y dos rectas que se cruzan o no.
 */
export type SlAsk =
  | "pick_ramp"
  | "which_harder"
  | "place_step"
  | "stretch_step"
  | "crank"
  | "stretch_grid"
  | "set_sliders"
  | "slope_between"
  | "read_form"
  | "judge_slope";

/** Qué queda de la rampa de madera: se ve, se está yendo, ya no está. */
export type SlGround = "shown" | "faded" | "hidden";

export interface SlLevel extends LevelBase {
  readonly params: SlParams;
  /** Qué pide cada ronda, ciclando. Un nivel con dos preguntas alterna. */
  readonly asks: readonly SlAsk[];
  readonly ground: SlGround;
  /** El caminante está en pantalla. */
  readonly walker: boolean;
  /** La escalera de escalones iguales a lo largo de la rampa. */
  readonly stairs: boolean;
  /** La manivela de `gears_sequence` al costado. */
  readonly crank: boolean;
  /** Las fichas `Δx` y `Δy` sobre los dos tramos del escalón. */
  readonly deltas: boolean;
  /** Las fichas `m` y `b` y el renglón `y = mx + b` bajo la rampa. */
  readonly tiles: boolean;
  /** La rampa se pide con un toque y aparece como fantasma. */
  readonly ghostRamp: boolean;
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

// --- Los errores del catálogo ------------------------------------------------

/**
 * Los dos que `misconceptions.yaml` apunta a este nodo, con sus guardas.
 *
 * `slope_confuses_step_with_rate` es el paso confundido con la pendiente: el
 * jugador contesta el avance. `slope_as_rise_only` es la pendiente leída como
 * resta y no como cociente: contesta la subida sola. Los dos son `detect` sobre
 * `b / a`, y acá corren sobre el par que el jugador eligió.
 *
 * `negative_times_negative`, que el documento del minijuego nombra como
 * heredada de `arith.int.negatives`, **no lista a este nodo** en el catálogo,
 * así que ningún movimiento de acá puede viajar con ella.
 */
export const SL_STEP_AS_RATE = "slope_confuses_step_with_rate";
export const SL_RISE_ONLY = "slope_as_rise_only";

/**
 * El error que corresponde al movimiento, si el nivel lo está evaluando.
 *
 * Las guardas son las del catálogo, leídas sobre `b / a`. **`target` viaja sin
 * reducir a propósito**: `b` y `a` son la subida y el avance que el jugador
 * midió, no el par mínimo. Con dos puntos separados por dos, la pendiente `4/2`
 * y la pendiente `2/1` son la misma cuesta y no la misma pregunta: contestar `4`
 * es el error del catálogo en la primera y no existe en la segunda, y reducir
 * antes de mirar la guarda `a != 1` lo escondería. Un par equivocado por otro
 * motivo es otra cosa y va sin campo.
 */
export function slMisconceptionFor(
  level: SlLevel,
  chosen: SlRatio,
  target: SlRatio,
): string | undefined {
  if (slSameRatio(chosen, target)) return undefined;
  const { rise, run } = target;
  if (
    level.classifies.includes(SL_RISE_ONLY) &&
    run !== 1 &&
    slSameRatio(chosen, { rise, run: 1 })
  ) {
    return SL_RISE_ONLY;
  }
  if (
    level.classifies.includes(SL_STEP_AS_RATE) &&
    rise !== run * run &&
    slSameRatio(chosen, { rise: run, run: 1 })
  ) {
    return SL_STEP_AS_RATE;
  }
  return undefined;
}

/**
 * El mismo error, leído sobre el escalón que el jugador forzó.
 *
 * Estirar el escalón y dejar la subida donde estaba es el error del catálogo
 * dicho con el gesto en vez de con un número: el avance creció y el jugador
 * espera que la cuesta no dependa de él. Vale solo cuando el escalón se
 * ensanchó de verdad, que es la guarda `a != 1` del catálogo.
 */
export function slStretchMisconceptionFor(
  level: SlLevel,
  ramp: SlRamp,
  forced: SlStep,
  unit: SlStep,
): string | undefined {
  if (slRests(ramp, forced)) return undefined;
  if (!level.classifies.includes(SL_RISE_ONLY)) return undefined;
  if (forced.run === unit.run) return undefined;
  return Math.abs(forced.rise - unit.rise) < 1e-9 ? SL_RISE_ONLY : undefined;
}

// --- Los niveles -------------------------------------------------------------

const P1: SlParams = {
  maxSlope: 3,
  negative: false,
  fractional: false,
  intercept: false,
  maxRun: 1,
  xRange: [0, 8],
  yReach: 8,
};

const P2: SlParams = {
  maxSlope: 3,
  negative: false,
  fractional: false,
  intercept: false,
  maxRun: 4,
  xRange: [0, 8],
  yReach: 8,
};

const P3: SlParams = {
  maxSlope: 3,
  negative: true,
  fractional: true,
  intercept: true,
  maxRun: 4,
  xRange: [-7, 7],
  yReach: 8,
};

/**
 * Los ocho niveles del documento. Cada uno cambia la capa o endurece los
 * parámetros, nunca las dos cosas:
 *
 * 1 → 2, 2 → 3, 4 → 5, 5 → 6 y 7 → 8 cambian de capa con los mismos parámetros;
 * 3 → 4 le suelta el ancho al escalón sin moverse de `concrete`, y 6 → 7 trae
 * las negativas, las fraccionarias y el arranque sin moverse de `symbolic`.
 *
 * DISCREPANCIA ANOTADA. El documento llama al nivel 8 `formal` y `abstract` a la
 * vez. Gana la regla del repositorio por el mismo camino que los nodos 16 y 18:
 * la capa queda en `formal`, que es la que tiene superficie propia, y `abstract`
 * en D1 es el estado del nodo y no una pantalla. La rampa plana, la vertical y
 * la comparación de dos rectas entran como **pregunta** y no como parámetro:
 * `judge_slope` arma sus propias rectas y no lee `params`, así que el nivel 8
 * cambia de capa sin endurecer nada.
 */
export const SL_LEVELS: readonly SlLevel[] = [
  {
    n: 1,
    titleKey: "level.twoRamps",
    layer: "real",
    evidence: ["recognize"],
    rounds: 3,
    params: P1,
    asks: ["pick_ramp"],
    ground: "shown",
    walker: true,
    stairs: false,
    crank: false,
    deltas: false,
    tiles: false,
    ghostRamp: false,
    // Tocar una rampa no arma ninguna razón, así que los dos errores del
    // catálogo, que son sobre un cociente, no se pueden cometer acá.
    classifies: [],
    definition: false,
  },
  {
    n: 2,
    titleKey: "level.whichCostsMore",
    layer: "intuition",
    evidence: ["explain"],
    rounds: 3,
    params: P1,
    asks: ["which_harder"],
    ground: "shown",
    walker: true,
    stairs: false,
    crank: false,
    deltas: false,
    tiles: false,
    ghostRamp: false,
    // El distractor del caminante que da más pasos es exactamente el error del
    // catálogo, y acá se elige entre respuestas dibujadas.
    classifies: [SL_STEP_AS_RATE],
    definition: false,
  },
  {
    n: 3,
    titleKey: "level.restTheStep",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 3,
    params: P1,
    asks: ["place_step"],
    ground: "shown",
    walker: true,
    stairs: true,
    crank: false,
    deltas: false,
    tiles: false,
    ghostRamp: false,
    classifies: [],
    definition: false,
  },
  {
    n: 4,
    titleKey: "level.stepsOfAnyWidth",
    layer: "concrete",
    evidence: ["explain", "manipulate"],
    rounds: 4,
    params: P2,
    asks: ["stretch_step", "place_step"],
    ground: "shown",
    walker: true,
    stairs: true,
    crank: false,
    deltas: false,
    tiles: false,
    ghostRamp: false,
    classifies: [SL_RISE_ONLY],
    definition: false,
  },
  {
    n: 5,
    titleKey: "level.crankAndGrid",
    layer: "visual",
    evidence: ["explain", "manipulate"],
    rounds: 4,
    params: P2,
    asks: ["crank", "stretch_grid"],
    ground: "faded",
    walker: true,
    stairs: true,
    crank: true,
    deltas: false,
    tiles: false,
    ghostRamp: false,
    classifies: [],
    definition: false,
  },
  {
    n: 6,
    titleKey: "level.tilesBeside",
    layer: "symbolic",
    evidence: ["manipulate", "apply"],
    rounds: 4,
    params: P2,
    asks: ["set_sliders", "slope_between"],
    ground: "hidden",
    walker: true,
    stairs: false,
    crank: false,
    deltas: true,
    tiles: true,
    ghostRamp: false,
    classifies: [SL_STEP_AS_RATE, SL_RISE_ONLY],
    definition: false,
  },
  {
    n: 7,
    titleKey: "level.ghostRamp",
    layer: "symbolic",
    evidence: ["apply"],
    rounds: 4,
    params: P3,
    asks: ["slope_between", "read_form"],
    ground: "hidden",
    walker: false,
    stairs: false,
    crank: false,
    deltas: true,
    tiles: true,
    ghostRamp: true,
    classifies: [SL_STEP_AS_RATE, SL_RISE_ONLY],
    definition: false,
  },
  {
    n: 8,
    titleKey: "level.theRampWithoutSlope",
    layer: "formal",
    evidence: ["generalize"],
    rounds: 4,
    params: P3,
    asks: ["judge_slope"],
    ground: "hidden",
    walker: false,
    stairs: false,
    crank: false,
    deltas: true,
    tiles: true,
    ghostRamp: true,
    // Decidir si dos rectas se cruzan no arma ningún cociente: el movimiento no
    // tiene dónde cometer los errores del catálogo.
    classifies: [],
    definition: true,
  },
];

// --- Lo que trae una ronda ---------------------------------------------------

export interface SlProblem {
  readonly ask: SlAsk;
  /** La rampa de la ronda. */
  readonly ramp: SlRamp;
  /** Las rampas dibujadas: una, o las tres entre las que se elige. */
  readonly ramps: readonly SlRamp[];
  readonly correct: number;
  /** El escalón con el que arranca la ronda. */
  readonly step: SlStep;
  /** El escalón que hay que igualar al superponer, o `null`. */
  readonly other: SlStep | null;
  /** Los dos puntos marcados de `set_sliders` y `slope_between`. */
  readonly points: readonly GpPoint[];
  /** Las razones escritas entre las que se elige. Vacío fuera de la pregunta. */
  readonly options: readonly SlRatio[];
  /** Las rectas escritas de `read_form`. La primera es la de la ronda. */
  readonly written: readonly SlWritten[];
  /** El caso del nivel final. */
  readonly kase: SlCase;
  /** Cuánto hay que estirar la grilla para que la rampa pase por el punto. */
  readonly stretch: number;
  /** Cuántas vueltas de manivela pide la ronda. */
  readonly turns: number;
  readonly xRange: readonly [number, number];
}

/** Rampas candidatas montadas siempre, para que el árbol no cambie. */
export const SL_RAMP_SLOTS = 3;
/** Razones escritas montadas siempre. */
export const SL_OPTION_SLOTS = 4;
/** Formas escritas montadas siempre: la despejada y la que no lo está. */
export const SL_FORM_SLOTS = 3;

// --- El generador ------------------------------------------------------------

/**
 * Genera una ronda. La semilla la hace reproducible; la ronda decide cuál de las
 * preguntas del nivel toca, porque un nivel con dos preguntas tiene que
 * alternarlas y no sortearlas: sorteadas, cuatro rondas pueden no dar nunca
 * evidencia de uno de los dos verbos.
 */
export function generateSlope(level: SlLevel, seed: number, round = 0): SlProblem {
  const rnd = makeRandom(seed);
  const asks = level.asks;
  const ask = (asks[round % asks.length] ?? asks[0]) as SlAsk;
  const p = level.params;

  // Cuánto tramo visible necesita la pregunta. Apoyar el escalón en dos lugares
  // distintos, girar la manivela unas cuantas vueltas y superponer dos
  // escalones anchos piden rampa larga; una que asoma por una esquina volvería
  // el gesto imposible en vez de difícil.
  const ramp = rampOf(p, rnd, spanNeeded(ask, p));
  const run = ask === "stretch_step" ? rnd.int(2, Math.max(2, p.maxRun)) : 1;
  const desde = anchorFor(p, ramp, run, rnd);
  const apoyado = slStepOn(ramp, desde, run);
  /** El pie de la rampa dentro de la ventana: donde arrancan el caminante y la escalera. */
  const pie = slVisibleRange(ramp, p.xRange[0], p.xRange[1], p.yReach)[0];

  const base: SlProblem = {
    ask,
    ramp,
    ramps: [ramp],
    correct: 0,
    step: apoyado,
    other: null,
    points: [],
    options: [],
    written: [],
    kase: "crossing",
    stretch: 1,
    turns: 0,
    xRange: p.xRange,
  };

  if (ask === "pick_ramp" || ask === "which_harder") {
    const tres = rivalRamps(ramp, p, rnd);
    return { ...base, ramps: tres.ramps, correct: tres.correct, step: slStepOn(ramp, 0, 1) };
  }

  if (ask === "place_step") {
    // El escalón arranca apoyado en el borde: moverlo es el gesto entero, y
    // arrancar en el medio dejaría la mitad de la rampa sin invitar a nada.
    return { ...base, step: slStepOn(ramp, pie, 1) };
  }

  if (ask === "stretch_step") {
    // El escalón llega ensanchado y con la subida del de ancho uno: despegado,
    // que es el error del catálogo ya cometido y esperando al jugador.
    const unidad = slStepOn(ramp, desde, 1);
    return {
      ...base,
      step: { from: desde, run, rise: unidad.rise },
      other: slStepOn(ramp, otherAnchor(p, ramp, desde, 1, rnd), 1),
    };
  }

  if (ask === "crank") {
    const largo = slVisibleRange(ramp, p.xRange[0], p.xRange[1], p.yReach)[1] - pie;
    // La bandera nunca cae más allá de donde llega la rampa: pedir vueltas que
    // el caminante no puede dar no es dificultad, es un error.
    return { ...base, turns: Math.min(rnd.int(2, 5), Math.max(2, largo)), step: slStepOn(ramp, pie, 1) };
  }

  if (ask === "stretch_grid") {
    // Estirar la grilla acuesta la rampa: la misma recta leída contra una regla
    // que no se estiró tiene la pendiente dividida por el factor.
    const k = rnd.int(2, 3);
    const objetivo = { x: k * (pie + 1), y: slHeightAt(ramp, pie + 1) };
    return { ...base, stretch: k, points: [objetivo], step: slStepOn(ramp, pie, 1) };
  }

  if (ask === "set_sliders") {
    const dos = twoPoints(ramp, p, rnd);
    return { ...base, points: dos, step: slStepOn(ramp, dos[0]?.x ?? 0, 1) };
  }

  if (ask === "slope_between") {
    const dos = twoPoints(ramp, p, rnd);
    const objetivo = slReduce(ramp.slope);
    const opciones = ratioOptions(objetivo, dos, rnd);
    return {
      ...base,
      points: dos,
      options: opciones,
      correct: opciones.findIndex((r) => slSameRatio(r, objetivo)),
      step: slStepOn(ramp, dos[0]?.x ?? 0, Math.max(1, (dos[1]?.x ?? 1) - (dos[0]?.x ?? 0))),
    };
  }

  if (ask === "read_form") {
    const formas = writtenOptions(ramp, rnd);
    return {
      ...base,
      written: formas.written,
      options: formas.options,
      correct: formas.correct,
    };
  }

  return judgeProblem(p, rnd, base);
}

/**
 * Las posiciones donde la rampa pasa por un cruce de la grilla **y** entra en la
 * ventana. Con pendiente `rise/run` reducida, la altura sobre `x` es entera solo
 * si el avance divide a `x`. Es de dónde salen los dos puntos que se miden, y
 * también la condición que una rampa tiene que cumplir para ser medible: con
 * menos de dos, no hay ningún par de puntos que el jugador pueda leer.
 */
function gridPoints(ramp: SlRamp, p: SlParams): number[] {
  const [x0, x1] = p.xRange;
  const { run } = slReduce(ramp.slope);
  const out: number[] = [];
  for (let x = Math.ceil(x0 / run) * run; x <= x1; x += run) {
    if (Math.abs(slHeightAt(ramp, x)) <= p.yReach) out.push(x);
  }
  return out;
}

/**
 * Una rampa de la ronda, con lo que el nivel habilite.
 *
 * Se descarta y se vuelve a sortear la que no deja al menos tres cruces de
 * grilla adentro de la ventana, o la que no da el tramo visible que la pregunta
 * necesita. No es cosmética: una rampa que asoma por una esquina no se puede
 * medir apoyando el escalón, y medirla apoyando el escalón es el nodo entero.
 * La ronda que superpone dos escalones anchos pide todavía más tramo, porque
 * tiene que haber dos lugares distintos donde apoyarlos.
 */
function rampOf(p: SlParams, rnd: Random, minSpan = 2): SlRamp {
  for (let intento = 0; intento < 24; intento++) {
    const candidata = sortearRampa(p, rnd);
    if (gridPoints(candidata, p).length < 3) continue;
    const [lo, hi] = slVisibleRange(candidata, p.xRange[0], p.xRange[1], p.yReach);
    if (hi - lo >= minSpan) return candidata;
  }
  // Ninguna entró: la de un paso por paso desde el cero cabe en cualquier
  // ventana que este nodo dibuje.
  return { slope: { rise: p.negative && rnd.bool() ? -1 : 1, run: 1 }, intercept: 0 };
}

function sortearRampa(p: SlParams, rnd: Random): SlRamp {
  const signo = p.negative && rnd.bool() ? -1 : 1;
  if (p.fractional && rnd.bool()) {
    // Fraccionaria de verdad: el avance no divide a la subida, así que contar
    // marcas deja de servir y hay que hacer el cociente. El techo de la subida
    // es la pendiente máxima por el avance, para que el valor no se pase.
    const run = rnd.pick([2, 3, 4, 5, 7]);
    let rise = rnd.int(1, Math.max(1, p.maxSlope * run - 1));
    if (rise % run === 0) rise = rise === 1 ? 1 : rise - 1;
    return {
      slope: slReduce({ rise: signo * rise, run }),
      intercept: p.intercept ? rnd.int(-3, 3) : 0,
    };
  }
  const rise = rnd.int(1, Math.max(1, p.maxSlope));
  return {
    slope: { rise: signo * rise, run: 1 },
    intercept: p.intercept ? rnd.int(-3, 3) : 0,
  };
}

/** Cuánto tramo visible pide cada pregunta, en posiciones. */
function spanNeeded(ask: SlAsk, p: SlParams): number {
  if (ask === "stretch_step") return p.maxRun + 3;
  if (ask === "place_step" || ask === "crank") return 4;
  return 2;
}

/** Desde dónde apoyar el escalón sin que se salga de la ventana. */
function anchorFor(p: SlParams, ramp: SlRamp, run: number, rnd: Random): number {
  const [lo, hi] = slVisibleRange(ramp, p.xRange[0], p.xRange[1], p.yReach);
  return rnd.int(lo, Math.max(lo, hi - run));
}

/** Otro lugar de la rampa, distinto del primero. */
function otherAnchor(p: SlParams, ramp: SlRamp, taken: number, run: number, rnd: Random): number {
  const [lo, hi] = slVisibleRange(ramp, p.xRange[0], p.xRange[1], p.yReach);
  const alto = Math.max(lo, hi - run);
  for (let intento = 0; intento < 12; intento++) {
    const x = rnd.int(lo, alto);
    if (Math.abs(x - taken) >= 2) return x;
  }
  return taken + 2 <= alto ? taken + 2 : Math.max(lo, taken - 2);
}

/**
 * Las tres rampas entre las que se elige. Las dos rivales no son ruido: una
 * sube más por paso y la otra menos, y las tres se dibujan sobre la misma
 * ventana, así que compararlas es mirar lo empinado y no lo largo.
 */
function rivalRamps(
  ramp: SlRamp,
  p: SlParams,
  rnd: Random,
): { readonly ramps: readonly SlRamp[]; readonly correct: number } {
  const usadas = [slReduce(ramp.slope)];
  const otras: SlRamp[] = [];
  let intento = 0;
  while (otras.length < SL_RAMP_SLOTS - 1 && intento < 40) {
    intento++;
    const rival = rampOf(p, rnd);
    const r = slReduce(rival.slope);
    if (usadas.some((u) => slSameRatio(u, r))) continue;
    usadas.push(r);
    otras.push({ slope: r, intercept: ramp.intercept });
  }
  // Con pocas cuestas posibles el sorteo puede no dar dos rivales distintas: se
  // completan enumerando las enteras que el nivel permite y todavía no
  // salieron. Nunca se inventa una más empinada de lo que el nivel habilita,
  // que sería endurecer el nivel por la puerta de atrás.
  const signos = p.negative ? [1, -1] : [1];
  for (let rise = 1; rise <= p.maxSlope && otras.length < SL_RAMP_SLOTS - 1; rise++) {
    for (const signo of signos) {
      if (otras.length >= SL_RAMP_SLOTS - 1) break;
      const r: SlRatio = { rise: signo * rise, run: 1 };
      if (usadas.some((u) => slSameRatio(u, r))) continue;
      usadas.push(r);
      otras.push({ slope: r, intercept: ramp.intercept });
    }
  }
  const orden = rnd.shuffle([0, 1, 2]);
  const todas = [ramp, ...otras];
  return { ramps: orden.map((i) => todas[i] as SlRamp), correct: orden.indexOf(0) };
}

/**
 * Dos puntos de la rampa con avance distinto de uno. El avance uno haría que la
 * pendiente se leyera sin dividir, que es justo lo que el nivel quiere impedir.
 */
function twoPoints(ramp: SlRamp, p: SlParams, rnd: Random): readonly GpPoint[] {
  const x0 = p.xRange[0];
  const { run } = slReduce(ramp.slope);
  // Con pendiente fraccionaria un punto cae en la grilla solo si el avance
  // divide a su posición, y además tiene que entrar en la ventana: dos puntos
  // con coordenadas rotas o fuera de la hoja no se pueden leer, y leerlos es lo
  // que el nivel pide.
  const candidatos = gridPoints(ramp, p);
  const punto = (x: number): GpPoint => ({ x, y: slHeightAt(ramp, x) });
  if (candidatos.length < 2) {
    // No puede pasar con una rampa sorteada por `rampOf`, que descarta las que
    // no dejan tres cruces adentro; queda por si alguien arma una a mano.
    const desde = candidatos[0] ?? Math.ceil(x0 / run) * run;
    return [punto(desde), punto(desde + run)];
  }
  // Los dos puntos se eligen separados por más de un cruce siempre que la rampa
  // dé para eso: con avance uno la pendiente se leería sin dividir, y los dos
  // errores del catálogo —la subida sola y el avance solo— dejarían de ser
  // respuestas distintas de la verdadera.
  const salto = candidatos.length >= 3 ? 2 : 1;
  const i = rnd.int(0, candidatos.length - 1 - salto);
  const j = rnd.int(i + salto, candidatos.length - 1);
  return [punto(candidatos[i] as number), punto(candidatos[j] as number)];
}

/**
 * Las razones escritas de `slope_between`. Llevan la verdadera y los dos
 * errores del catálogo —la subida sola y el avance solo— más la razón dada
 * vuelta. Ninguna es ruido al azar: cada distractor es una lectura concreta.
 */
function ratioOptions(target: SlRatio, points: readonly GpPoint[], rnd: Random): readonly SlRatio[] {
  const a = points[0];
  const b = points[1];
  const subida = a && b ? b.y - a.y : target.rise;
  const avance = a && b ? b.x - a.x : target.run;

  const out: SlRatio[] = [target];
  const agregar = (r: SlRatio): void => {
    if (r.run === 0) return;
    if (out.length >= SL_OPTION_SLOTS) return;
    const red = slReduce(r);
    if (out.some((o) => slSameRatio(o, red))) return;
    out.push(red);
  };

  agregar({ rise: subida, run: 1 });
  agregar({ rise: avance, run: 1 });
  agregar({ rise: avance, run: subida });
  let k = 1;
  while (out.length < SL_OPTION_SLOTS && k < 6) {
    agregar({ rise: target.rise + k, run: target.run });
    agregar({ rise: target.rise, run: target.run + k });
    k++;
  }
  return rnd.shuffle(out);
}

/**
 * Las formas escritas del nivel 7: la misma recta despejada y sin despejar, más
 * una tercera que no es la misma. Se pregunta cuál es la pendiente, y las
 * opciones son la verdadera, la ordenada al origen leída como pendiente y el
 * coeficiente copiado sin su signo, que son los distractores del documento.
 */
function writtenOptions(
  ramp: SlRamp,
  rnd: Random,
): {
  readonly written: readonly SlWritten[];
  readonly options: readonly SlRatio[];
  readonly correct: number;
} {
  const m = slReduce(ramp.slope);
  const written: SlWritten[] = [slWrite(ramp, "solved"), slWrite(ramp, "unsolved")];
  written.push(
    slWrite({ slope: { rise: m.rise + m.run, run: m.run }, intercept: ramp.intercept }, "solved"),
  );

  const out: SlRatio[] = [m];
  const agregar = (r: SlRatio): void => {
    if (r.run === 0 || out.length >= SL_OPTION_SLOTS) return;
    const red = slReduce(r);
    if (out.some((o) => slSameRatio(o, red))) return;
    out.push(red);
  };
  // La ordenada leída como pendiente: el error de la lectura posicional.
  agregar({ rise: ramp.intercept, run: 1 });
  // El coeficiente copiado sin su signo, que es el otro distractor del diseño.
  agregar({ rise: -m.rise, run: m.run });
  agregar({ rise: m.run, run: m.rise });
  let k = 1;
  while (out.length < SL_OPTION_SLOTS && k < 6) {
    agregar({ rise: m.rise + k, run: m.run });
    k++;
  }
  const mezcladas = rnd.shuffle(out);
  return {
    written,
    options: mezcladas,
    correct: mezcladas.findIndex((r) => slSameRatio(r, m)),
  };
}

/**
 * El nivel final. Los cuatro casos son los del documento y ninguno se inventa:
 * la rampa plana, que es una función; la vertical, que no tiene pendiente
 * porque el avance vale cero; y dos rectas que se cruzan o que nunca lo hacen.
 */
function judgeProblem(p: SlParams, rnd: Random, base: SlProblem): SlProblem {
  const kase = rnd.pick<SlCase>(["flat", "vertical", "parallel", "crossing"]);
  const m = slReduce(rampOf({ ...p, fractional: false }, rnd).slope);
  /**
   * Nunca cero. Una rampa plana sobre el cero se acuesta encima del eje
   * horizontal y una vertical sobre el cero se para encima del vertical: en los
   * dos casos la recta que se pregunta desaparece del dibujo.
   */
  const b0 = rnd.pick([-3, -2, -1, 1, 2, 3]);

  if (kase === "flat") {
    const plana: SlRamp = { slope: { rise: 0, run: 1 }, intercept: b0 };
    return { ...base, ramp: plana, ramps: [plana], step: slStepOn(plana, 0, 1), kase };
  }

  if (kase === "vertical") {
    // La vertical no es una rampa: se escribe con avance cero y por eso viaja
    // como recta escrita y no como `SlRamp`, que no la puede representar.
    const at = b0;
    return {
      ...base,
      ramps: [],
      written: [{ form: "unsolved", a: 1, b: 0, c: at }],
      points: [
        { x: at, y: -3 },
        { x: at, y: 3 },
      ],
      kase,
    };
  }

  const u: SlRamp = { slope: m, intercept: b0 };
  // La que cruza sube un escalón más, salvo que ese escalón se pase del tope
  // del nivel: ahí sube uno menos. Nunca más empinada de lo que el nivel
  // habilita, que sería endurecerlo por la puerta de atrás.
  const arriba = slReduce({ rise: m.rise + m.run, run: m.run });
  const abajo = slReduce({ rise: m.rise - m.run, run: m.run });
  // Y nunca plana: la rampa plana es el caso `flat`, que se pregunta aparte, y
  // dibujada acá se acostaría sobre el eje y desaparecería del dibujo.
  const sirve = (r: SlRatio): boolean => r.rise !== 0 && Math.abs(slValue(r)) <= p.maxSlope;
  const otra = sirve(arriba) ? arriba : sirve(abajo) ? abajo : slReduce({ rise: m.rise * 2, run: m.run });
  const v: SlRamp =
    kase === "parallel"
      ? { slope: m, intercept: b0 + rnd.int(2, 4) }
      : { slope: otra, intercept: b0 };
  return {
    ...base,
    ramp: u,
    ramps: [u, v],
    written: [slWrite(u, "solved"), slWrite(v, "solved")],
    step: slStepOn(u, 0, 1),
    kase,
  };
}

export const slLevelByNumber = (n: number): SlLevel | undefined => SL_LEVELS.find((l) => l.n === n);
export const TOTAL_SL_LEVELS = SL_LEVELS.length;

registerNode({
  id: NODE,
  n: 19,
  prereqs: ["alg.fn.graph_as_picture", "arith.mul.scaling"],
  levels: SL_LEVELS,
});

/** Las capas y los verbos que el nodo recorre, para los tests y el mapa. */
export const SL_LAYERS: readonly Layer[] = [
  "real",
  "intuition",
  "concrete",
  "visual",
  "symbolic",
  "formal",
];
export const SL_EVIDENCE: readonly Evidence[] = [
  "recognize",
  "explain",
  "manipulate",
  "apply",
  "generalize",
];
