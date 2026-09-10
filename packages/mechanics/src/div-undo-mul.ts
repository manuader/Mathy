/**
 * La llave que encoge, para `arith.div.undo_mul`.
 *
 * Los ocho niveles y qué endurece cada parámetro salen del documento del
 * minijuego y de `D1/06`, no de acá: este archivo los implementa, no los decide.
 *
 * La idea que sostiene todo: dividir no es una operación nueva, es la llave del
 * estirado del nodo 5. La banda quedó estirada por un factor que nadie vio, y
 * dividir es encontrar el factor que la devuelve al clavo. Por eso el veredicto
 * no lo da una comparación de números sino la superposición de las marcas con
 * las de la banda testigo: la llave que devuelve exactamente lo que había es una
 * sola, y el largo no alcanza para reconocerla.
 *
 * De ahí sale la segunda cara, que el nodo trata como la misma cosa vista de
 * costado: el piso de baldosas con una pared que tapa un lado. Los mismos tres
 * números leídos en dos direcciones, y el hueco que el nodo abre y no cierra
 * —las baldosas que sobran, sin manera de anotarse— que es `arith.div.remainder`.
 *
 * Sin texto visible: el nodo es `literacy: none` y acá solo hay claves y datos.
 */

import { makeRandom, type Random } from "./random.ts";
import { registerNode, type LevelBase } from "./node.ts";
import type { Evidence, Layer } from "./one-step.ts";

/** El nodo del grafo que este minijuego enseña. */
export const NODE = "arith.div.undo_mul";

/**
 * El mismo id, sin ambigüedad. `index.ts` reúne los minijuegos con `export *` y
 * cada uno declara su propio `NODE`, así que afuera del módulo se lo nombra así.
 */
export const NODE_DIV_UNDO_MUL = NODE;

/**
 * Qué se pregunta en una ronda. No es dificultad: es qué gesto contesta.
 *
 * - `shrink`: arrastrar la llave a la cerradura y girarla hasta que las marcas
 *   de la banda caigan sobre las de la testigo.
 * - `which`: dos animaciones sobre la misma banda; tocar la que recorta el
 *   extremo en vez de encoger. El largo coincide y las marcas no.
 * - `wall`: el piso con un lado tapado por una pared; tocar la ficha del lado
 *   que falta sin desarmar el rectángulo.
 * - `ghost`: la expresión sola, con la banda a pedido; elegir la ficha del
 *   resultado.
 * - `leftover`: la división que no da exacta; decir cuántas filas enteras
 *   salieron, con las baldosas sueltas a la vista y sin nombre.
 * - `undo`: cerraduras que no son aritméticas pero tienen vuelta y dial, y una
 *   sin vuelta por instancia.
 */
export type DivAsk = "shrink" | "which" | "wall" | "ghost" | "leftover" | "undo";

/**
 * Las clases de llave del llavero. La forma se distingue mirando: la de encoger
 * junta, la de recortar corta, la de estirar separa.
 */
export type DivKeyKind = "shrink" | "cut" | "stretch";

/**
 * Las cerraduras del último nivel. `flat` es la banda aplastada contra el clavo:
 * el estirado por cero, que borró cuál marca era cuál y no tiene vuelta.
 */
export type DivLockKind = "turn" | "hat" | "color" | "flat";

/** Las etapas de desvanecimiento de `grid_stretch` en E0 que el nodo usa. */
export type DivBandSkin = "rubber_band" | "segment";

/** Las etapas de desvanecimiento de `tiles` en E0 que el nodo usa. */
export type DivFloorSkin = "loose_tiles" | "grid_rectangle" | "labeled_sides";

/**
 * Los dos errores del catálogo de L cuya regla `detect` apunta a este nodo.
 * Están escritos como constantes porque un id inventado no clasifica nada, y no
 * hay ningún otro: los demás errores que el diseño prevé corren sobre patrones
 * prestados y se muestran sin anotarse.
 */
export const MIS_DIV_ORDER = "division_order_swapped";
export const MIS_DIV_INVERSE = "wrong_inverse_choice";

/**
 * Lo único que endurece. El modo, las pieles, la testigo, las flechas y la
 * expresión viven afuera justamente para que la regla del diseño —un nivel
 * cambia de capa o endurece parámetros, nunca las dos cosas— se pueda comprobar
 * con un test.
 */
export interface DivParams {
  /** El estirado que hubo, que es el divisor. Es lo que hay que calibrar. */
  readonly factor: readonly [number, number];
  /** Cuánto medía la banda antes del estirado, que es el resultado. */
  readonly quotient: readonly [number, number];
  /**
   * Qué clases de llave trae el llavero, una por clase. Con una sola no hay
   * nada que elegir y el nivel es puro calibrado; con las tres, elegir la clase
   * es lo que separa deshacer de emparejar el largo.
   */
  readonly classes: readonly DivKeyKind[];
  /** El dial arranca cerca del valor correcto, o sin girar. */
  readonly dialStart: "near" | "zero";
  /** La división da exacta. Falso desde el nivel 7: ahí empiezan a sobrar. */
  readonly exact: boolean;
}

export interface DivLevel extends LevelBase {
  readonly params: DivParams;
  /** Qué pide cada ronda, ciclando. Un nivel con dos preguntas alterna. */
  readonly asks: readonly DivAsk[];
  readonly bandSkin: DivBandSkin;
  readonly floorSkin: DivFloorSkin;
  /** La banda testigo debajo: el estado que hay que recuperar. */
  readonly witness: boolean;
  /** El diagrama vertical: la flecha de ida y la de vuelta. */
  readonly arrows: boolean;
  /** La expresión `a ÷ b` escrita junto al objeto. */
  readonly expr: boolean;
  /** La llave lleva etiqueta con su dial. Sin ella se cuenta la forma. */
  readonly labeledKeys: boolean;
  /** La banda no se dibuja hasta que el jugador la pide con un toque. */
  readonly bandOnDemand: boolean;
  /** En cuántas tiras se puede partir el piso. 0: el corte no existe. */
  readonly cut: number;
}

/**
 * Los ocho niveles del documento. Cada uno cambia la capa o endurece los
 * parámetros, nunca las dos cosas:
 *
 * 1 → 2 endurece (entran las llaves de recortar y de estirar, y el dial deja de
 * arrancar cerca), 2 → 3 y 4 → 5 y 7 → 8 cambian de capa con los mismos
 * parámetros, 3 → 4 no toca nada y cambia lo que se pregunta, y 5 → 6 y 6 → 7
 * endurecen sin moverse de `symbolic`.
 */
export const DIV_LEVELS: readonly DivLevel[] = [
  {
    n: 1,
    titleKey: "level.bandComesBack",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 3,
    params: {
      factor: [2, 4],
      quotient: [2, 5],
      classes: ["shrink"],
      dialStart: "near",
      exact: true,
    },
    asks: ["shrink"],
    bandSkin: "rubber_band",
    floorSkin: "loose_tiles",
    witness: true,
    arrows: false,
    expr: false,
    labeledKeys: false,
    bandOnDemand: false,
    cut: 0,
  },
  {
    n: 2,
    titleKey: "level.theWholeKeyRing",
    layer: "concrete",
    evidence: ["recognize", "manipulate"],
    rounds: 4,
    params: {
      factor: [2, 4],
      quotient: [2, 5],
      classes: ["shrink", "cut", "stretch"],
      dialStart: "zero",
      exact: true,
    },
    asks: ["shrink"],
    bandSkin: "rubber_band",
    floorSkin: "loose_tiles",
    witness: true,
    arrows: false,
    expr: false,
    labeledKeys: false,
    bandOnDemand: false,
    cut: 0,
  },
  {
    n: 3,
    titleKey: "level.arrows",
    layer: "visual",
    evidence: ["explain", "manipulate"],
    rounds: 4,
    params: {
      factor: [2, 4],
      quotient: [2, 5],
      classes: ["shrink", "cut", "stretch"],
      dialStart: "zero",
      exact: true,
    },
    asks: ["which", "shrink"],
    bandSkin: "segment",
    floorSkin: "grid_rectangle",
    witness: true,
    arrows: true,
    expr: false,
    labeledKeys: false,
    bandOnDemand: false,
    cut: 0,
  },
  {
    n: 4,
    titleKey: "level.floorWithWall",
    layer: "visual",
    evidence: ["apply"],
    rounds: 4,
    params: {
      factor: [2, 4],
      quotient: [2, 5],
      classes: ["shrink", "cut", "stretch"],
      dialStart: "zero",
      exact: true,
    },
    asks: ["wall"],
    bandSkin: "segment",
    floorSkin: "grid_rectangle",
    witness: true,
    arrows: true,
    expr: false,
    labeledKeys: false,
    bandOnDemand: false,
    cut: 2,
  },
  {
    n: 5,
    titleKey: "level.tokensBesideTheBand",
    layer: "symbolic",
    evidence: ["manipulate", "apply"],
    rounds: 4,
    params: {
      factor: [2, 4],
      quotient: [2, 5],
      classes: ["shrink", "cut", "stretch"],
      dialStart: "zero",
      exact: true,
    },
    asks: ["shrink", "wall"],
    bandSkin: "segment",
    floorSkin: "labeled_sides",
    witness: true,
    arrows: true,
    expr: true,
    labeledKeys: true,
    bandOnDemand: false,
    cut: 2,
  },
  {
    n: 6,
    titleKey: "level.ghostBand",
    layer: "symbolic",
    evidence: ["apply"],
    rounds: 4,
    params: {
      factor: [2, 12],
      quotient: [2, 5],
      classes: ["shrink", "cut", "stretch"],
      dialStart: "zero",
      exact: true,
    },
    asks: ["ghost"],
    bandSkin: "segment",
    floorSkin: "labeled_sides",
    witness: true,
    arrows: false,
    expr: true,
    labeledKeys: true,
    bandOnDemand: true,
    cut: 2,
  },
  {
    n: 7,
    titleKey: "level.whatIsLeftOver",
    layer: "symbolic",
    evidence: ["apply"],
    rounds: 4,
    params: {
      factor: [2, 12],
      quotient: [2, 5],
      classes: ["shrink", "cut", "stretch"],
      dialStart: "zero",
      exact: false,
    },
    asks: ["leftover"],
    bandSkin: "segment",
    floorSkin: "labeled_sides",
    witness: true,
    arrows: false,
    expr: true,
    labeledKeys: true,
    bandOnDemand: false,
    cut: 2,
  },
  {
    n: 8,
    titleKey: "level.undosNeverSeen",
    layer: "formal",
    evidence: ["generalize"],
    rounds: 4,
    params: {
      factor: [2, 12],
      quotient: [2, 5],
      classes: ["shrink", "cut", "stretch"],
      dialStart: "zero",
      exact: false,
    },
    asks: ["undo"],
    bandSkin: "segment",
    floorSkin: "labeled_sides",
    witness: false,
    arrows: false,
    expr: false,
    labeledKeys: true,
    bandOnDemand: false,
    cut: 2,
  },
];

/**
 * Por qué una llave equivocada está en el llavero. Son las dos clases que no
 * deshacen: recortar empareja el largo sin tocar las separaciones, y estirar
 * hace más de lo que ya se hizo.
 */
export type DivKeyLure = "cut" | "stretch";

/**
 * Una llave del llavero. Su clase se ve en la forma y su dial en la posición:
 * hasta el nivel 5 no hay numerales, así que la llave se compara mirando.
 */
export interface DivKey {
  readonly id: string;
  readonly kind: DivKeyKind;
  /** Por cuánto encoge, recorta o estira. */
  readonly dial: number;
  readonly correct: boolean;
  readonly lure?: DivKeyLure;
  /** El error del catálogo de L que este señuelo clasifica, si lo hay. */
  readonly misconception?: string;
}

/** Por qué una ficha equivocada está en la bandeja. */
export type DivOptionLure = "subtracted" | "swapped" | "near" | "with_leftover";

export interface DivOption {
  readonly id: string;
  readonly value: number;
  readonly correct: boolean;
  readonly lure?: DivOptionLure;
  readonly misconception?: string;
}

/** Una cerradura que no es aritmética, y el parámetro que hay que calibrar. */
export interface DivLock {
  readonly kind: DivLockKind;
  readonly dial: number;
}

export interface DivAction {
  readonly id: string;
  readonly kind: DivLockKind;
  readonly dial: number;
  readonly correct: boolean;
  /** La acción que no tiene vuelta: no deshace nada y por eso no abre. */
  readonly uninvertible: boolean;
}

export interface DivProblem {
  readonly ask: DivAsk;
  /** El estirado que hubo, que es el divisor y la forma de la cerradura. */
  readonly factor: number;
  /** Cuánto medía la banda antes del estirado, que es el resultado. */
  readonly rest: number;
  /** La banda estirada, en marcas: `rest * factor` más lo que sobra. */
  readonly total: number;
  /** Marcas que tiene la regla, del clavo hacia la derecha. */
  readonly length: number;
  /** El piso: filas por columnas. `rows * cols + leftover === total`. */
  readonly rows: number;
  readonly cols: number;
  /** Qué lado tapa la pared. El otro se lee y el tapado se contesta. */
  readonly hidden: "rows" | "cols";
  /** Las baldosas que sobran. Se ven y no se escriben: ese hueco tiene dueño. */
  readonly leftover: number;
  /** Dónde arranca el dial de la llave que el jugador monta. */
  readonly dialStart: number;
  readonly keys: readonly DivKey[];
  readonly options: readonly DivOption[];
  /** Cuál de las dos animaciones recorta en vez de encoger: la que hay que tocar. */
  readonly liar: number;
  readonly lock: DivLock;
  readonly actions: readonly DivAction[];
}

/** Llaves y fichas montadas siempre, para que el árbol no cambie entre rondas. */
export const DIV_KEY_SLOTS = 4;
export const DIV_OPTION_SLOTS = 4;

/**
 * Hasta dónde puede llegar la banda estirada. Una banda de treinta marcas no se
 * lee de un vistazo, y el nodo pide calibrar, no contar.
 */
const MAX_TOTAL = 24;
/** Marcas de la banda en reposo. Más de seis no entran en el árbol de la escena. */
const MAX_REST = 6;

// --- El modelo ---------------------------------------------------------------

/**
 * El invariante del nodo, escrito como una función: la llave devuelve
 * exactamente lo que había si, y solo si, su dial mide lo mismo que el estirado.
 * Encoger de menos deja la banda a mitad de camino y encoger de más la pasa de
 * largo; en los dos casos las marcas no caen sobre las de la testigo.
 */
export function opensChest(factor: number, kind: DivKeyKind, dial: number): boolean {
  return kind === "shrink" && dial === factor;
}

/**
 * Cuánto mide la banda con la llave girada hasta `dial`. Con la llave de encoger
 * todas las distancias al clavo se dividen; con la de estirar se multiplican;
 * la de recortar no toca las separaciones, solo el largo.
 */
export function bandAfter(total: number, kind: DivKeyKind, dial: number): number {
  if (dial <= 0) return total;
  if (kind === "shrink") return total / dial;
  if (kind === "stretch") return total * dial;
  return total;
}

/**
 * Qué error catalogado corresponde a soltar la llave con el dial donde quedó.
 * Encoger por el total es dividir al revés: la banda se aplasta contra el clavo
 * y queda una sola marca. Los diales vecinos son puntería y no clasifican nada,
 * así que la función devuelve `undefined` y el movimiento se cuenta sin anotarse.
 */
export function misconceptionForDial(total: number, dial: number): string | undefined {
  return dial === total ? MIS_DIV_ORDER : undefined;
}

/** Cuántas filas enteras salen del piso, y cuántas baldosas quedan sueltas. */
export function splitRows(total: number, perRow: number): { rows: number; leftover: number } {
  if (perRow <= 0) return { rows: 0, leftover: total };
  return { rows: Math.floor(total / perRow), leftover: total % perRow };
}

/** El lado que la pared tapa: el que el jugador contesta sin desarmar el piso. */
export const hiddenSide = (problem: DivProblem): number =>
  problem.hidden === "rows" ? problem.rows : problem.cols;

/** El lado que se ve, y que es el divisor de la lectura del piso. */
export const shownSide = (problem: DivProblem): number =>
  problem.hidden === "rows" ? problem.cols : problem.rows;

// --- El generador ------------------------------------------------------------

/**
 * Genera una ronda. La semilla la hace reproducible; la ronda decide cuál de
 * las preguntas del nivel toca, porque un nivel con dos preguntas tiene que
 * alternarlas y no sortearlas: sorteadas, cuatro rondas pueden no dar nunca
 * evidencia de uno de los dos verbos.
 */
export function generateDivUndoMul(level: DivLevel, seed: number, round = 0): DivProblem {
  const rnd = makeRandom(seed);
  const asks = level.asks;
  const ask = (asks[round % asks.length] ?? asks[0]) as DivAsk;
  const p = level.params;

  const factor = pickFactor(p, rnd);
  const rest = pickRest(p, factor, rnd);
  // La división que no da exacta reparte lo mismo y deja baldosas sueltas: el
  // sobrante nunca llega al lado, porque entonces habría una fila más.
  const leftover = p.exact ? 0 : rnd.int(1, Math.max(1, factor - 1));
  const total = rest * factor + leftover;
  const length = Math.max(total + 2, 6);

  // Las dos lecturas del mismo piso. Tapar a veces las filas y a veces las
  // columnas es lo que hace ver que un piso da dos divisiones y no una. Cuando
  // lo que se cuenta son las filas enteras que salieron, la pared no elige: el
  // lado que se lee es el de la fila.
  const hidden: "rows" | "cols" = ask === "wall" && !rnd.bool() ? "cols" : "rows";

  return {
    ask,
    factor,
    rest,
    total,
    length,
    rows: rest,
    cols: factor,
    hidden,
    leftover,
    dialStart: p.dialStart === "near" ? nearDial(factor) : 1,
    keys: makeKeys(factor, p, rnd),
    options: makeOptions(ask, rest, factor, total, leftover, hidden, rnd),
    liar: rnd.bool() ? 0 : 1,
    ...makeLock(ask, rnd),
  };
}

/**
 * El estirado que hubo. El rango es lo que obliga a calibrar en vez de
 * reconocer: con dos o tres factores posibles la llave se elige de memoria.
 */
function pickFactor(p: DivParams, rnd: Random): number {
  // Con sobrante el divisor se acota: la banda más corta que el nodo dibuja
  // tiene dos marcas, y `2 × 9 + 8` ya no entra en la regla. El parámetro del
  // nivel sigue siendo el mismo; lo que manda acá es cuánto se puede dibujar.
  const techo = p.exact ? p.factor[1] : Math.min(p.factor[1], 8);
  return rnd.int(Math.min(p.factor[0], techo), techo);
}

/**
 * Cuánto medía la banda antes. El factor manda: una banda larga estirada por
 * doce no entra en ninguna pantalla, así que el rango del nivel se acota contra
 * el largo máximo y el parámetro sigue siendo el mismo.
 */
function pickRest(p: DivParams, factor: number, rnd: Random): number {
  // Lo que sobra también ocupa lugar en la regla, así que el techo lo cuenta
  // antes de sortearlo: si no, la última fila incompleta se saldría del dibujo.
  const sobra = p.exact ? 0 : factor - 1;
  const cap = Math.max(2, Math.floor((MAX_TOTAL - sobra) / Math.max(factor, 1)));
  return Math.max(2, Math.min(MAX_REST, cap, rnd.int(p.quotient[0], p.quotient[1])));
}

/**
 * Dónde arranca el dial cuando el nivel lo deja cerca. No puede caer justo en el
 * valor correcto: entonces no habría nada que calibrar.
 */
function nearDial(factor: number): number {
  return factor <= 2 ? factor + 1 : factor - 1;
}

/**
 * El llavero: una llave por clase, porque lo que distingue a una llave de otra
 * no es cuánto encoge sino qué le hace a la banda. El dial no viene puesto en la
 * llave, se gira después: si viniera puesto, el nivel se pasaría eligiendo entre
 * numerales y la cuarta dificultad del nodo —calibrar— desaparecería.
 *
 * Las llaves equivocadas no son ruido: recortar y estirar son elegir una acción
 * que no es la inversa, que es `wrong_inverse_choice` en el catálogo de L. El
 * otro error catalogado, dividir al revés, no es una llave: es una posición del
 * dial, y por eso lo detecta el giro y no la elección.
 */
function makeKeys(factor: number, p: DivParams, rnd: Random): DivKey[] {
  const keys: DivKey[] = [{ id: "k0", kind: "shrink", dial: factor, correct: true }];
  for (const kind of p.classes) {
    if (kind === "shrink") continue;
    keys.push({
      id: `k${keys.length}`,
      kind,
      // La de recortar deja el largo correcto y las marcas separadas; la de
      // estirar hace más de lo que ya se hizo. Las dos usan el mismo numeral
      // que la correcta, así que el numeral no alcanza para elegir.
      dial: factor,
      correct: false,
      lure: kind,
      misconception: MIS_DIV_INVERSE,
    });
  }
  return rnd.shuffle(keys);
}

/**
 * Las fichas. La que resta en vez de dividir es el mismo error que la llave de
 * recortar escrito con numerales, y por eso lleva el mismo id; la que suma el
 * sobrante al resultado está prevista en el diseño y no tiene entrada, así que
 * se muestra y no se anota.
 */
function makeOptions(
  ask: DivAsk,
  rest: number,
  factor: number,
  total: number,
  leftover: number,
  hidden: "rows" | "cols",
  rnd: Random,
): DivOption[] {
  if (ask !== "wall" && ask !== "ghost" && ask !== "leftover") return [];
  // Con la pared, el lado tapado es la respuesta y el otro es el divisor. Con la
  // expresión sola y con el sobrante, la pregunta ya viene escrita como
  // `total ÷ factor`, así que la respuesta es siempre el resultado.
  const tapaFilas = ask !== "wall" || hidden === "rows";
  const answer = tapaFilas ? rest : factor;
  const known = tapaFilas ? factor : rest;

  const out: DivOption[] = [{ id: "o0", value: answer, correct: true }];
  const push = (value: number, lure: DivOptionLure, misconception?: string): void => {
    if (value <= 0 || value === answer) return;
    if (out.some((o) => o.value === value)) return;
    if (out.length >= DIV_OPTION_SLOTS) return;
    out.push({
      id: `o${out.length}`,
      value,
      correct: false,
      lure,
      ...(misconception ? { misconception } : {}),
    });
  };

  // Restar el lado conocido del total en vez de dividir: la regla `detect` de
  // `wrong_inverse_choice` escrita sobre el piso.
  push(total - known, "subtracted", MIS_DIV_INVERSE);
  if (ask === "leftover" && leftover > 0) {
    // Meter las baldosas sueltas en una fila más. El diseño lo prevé y el
    // catálogo no lo nombra: se ejecuta a la vista y no se anota.
    push(answer + 1, "with_leftover");
  }
  for (const d of rnd.shuffle([1, -1, 2])) push(answer + d, "near");
  return rnd.shuffle(out);
}

/**
 * Las cerraduras del último nivel. Alternar acciones cualesquiera con la banda
 * aplastada es lo que separa la estructura de los números: la misma pregunta,
 * con y sin cuenta, y una cerradura que ninguna llave abre.
 */
function makeLock(ask: DivAsk, rnd: Random): { lock: DivLock; actions: readonly DivAction[] } {
  if (ask !== "undo") return { lock: { kind: "flat", dial: 0 }, actions: [] };

  // El estirado por cero aplastó todas las marcas contra el clavo: la
  // información ya no está y por eso no hay vuelta. Es la primera acción
  // irreversible de la espina y aparece una vez cada tres cerraduras.
  const sinVuelta = rnd.int(0, 2) === 0;
  const kind: DivLockKind = sinVuelta ? "flat" : rnd.pick(["turn", "hat", "color"] as const);
  const dial = sinVuelta ? 0 : rnd.int(1, 4);

  const actions: DivAction[] = [
    // La ficha de "cofre sin llave", que es la respuesta cuando la cerradura es
    // la banda aplastada y el señuelo caro cuando no lo es.
    { id: "a0", kind: "flat", dial: 0, correct: sinVuelta, uninvertible: true },
  ];
  if (!sinVuelta) {
    actions.push({ id: "a1", kind, dial, correct: true, uninvertible: false });
    // La misma clase con el dial corrido: la vuelta existe pero está mal
    // calibrada, que es la cuarta dificultad del nodo sin números de por medio.
    actions.push({ id: "a2", kind, dial: dial === 4 ? 1 : dial + 1, correct: false, uninvertible: false });
  }
  for (const k of rnd.shuffle(["turn", "hat", "color"] as const)) {
    if (actions.length >= DIV_KEY_SLOTS) break;
    if (k === kind) continue;
    actions.push({ id: `a${actions.length}`, kind: k, dial: rnd.int(1, 4), correct: false, uninvertible: false });
  }
  return { lock: { kind, dial }, actions: rnd.shuffle(actions) };
}

export const divLevelByNumber = (n: number): DivLevel | undefined => DIV_LEVELS.find((l) => l.n === n);
export const TOTAL_DIV_LEVELS = DIV_LEVELS.length;

/** Las capas y los verbos que el nodo recorre, para los tests y el mapa. */
export const DIV_LAYERS: readonly Layer[] = ["concrete", "visual", "symbolic", "formal"];
export const DIV_EVIDENCE: readonly Evidence[] = [
  "recognize",
  "explain",
  "manipulate",
  "apply",
  "generalize",
];

registerNode({
  id: NODE,
  n: 6,
  prereqs: ["arith.mul.scaling", "arith.sub.undo_add"],
  levels: DIV_LEVELS,
});
