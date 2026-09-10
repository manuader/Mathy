/**
 * La banda y el piso, para `arith.mul.scaling`.
 *
 * Los ocho niveles y qué endurece cada parámetro salen del documento del
 * minijuego y de `D1/05`, no de acá: este archivo los implementa, no los decide.
 *
 * La idea que sostiene todo: el factor es una razón y no una cantidad, y esa
 * razón se ve de dos maneras que son la misma. Estirar la banda multiplica cada
 * distancia al clavo; embaldosar el patio arma el rectángulo que tiene a un
 * número como filas y al otro como columnas. Por eso el nodo no entra por la
 * suma repetida: `3 × ½` no es sumar tres veces medio.
 *
 * Sin texto visible: el nodo es `literacy: none` y acá solo hay claves y datos.
 */

import { makeRandom, type Random } from "./random.ts";
import { registerNode, type LevelBase } from "./node.ts";
import type { Evidence, Layer } from "./one-step.ts";

/** El nodo del grafo que este minijuego enseña. */
export const NODE = "arith.mul.scaling";

/**
 * El mismo id, sin ambigüedad. `index.ts` reúne los minijuegos con `export *` y
 * cada uno declara su propio `NODE`, así que afuera del módulo se lo nombra así.
 */
export const NODE_MUL_SCALING = NODE;

/**
 * Un factor. Es una razón, no una cantidad, y por eso se guarda como par: el
 * `½` del nivel 7 tiene que sobrevivir a la ida y vuelta sin redondearse.
 */
export interface MulFactor {
  readonly num: number;
  readonly den: number;
}

export const factorValue = (f: MulFactor): number => f.num / f.den;

/**
 * Qué se pregunta en una ronda. No es dificultad: es qué gesto contesta.
 *
 * - `turn`: girar la manivela con el par de engranajes hasta la ficha objetivo.
 * - `cover`: arrastrar filas de baldosas hasta cubrir el marco.
 * - `rotate`: el toque sostenido que gira el piso; el marco viene transpuesto.
 * - `which`: dos animaciones de banda, tocar la que no escala.
 * - `stretch`: pellizcar la banda hasta que su extremo caiga en la ficha.
 * - `total`: con la expresión sola, elegir la ficha del total.
 * - `predict`: tocar la marca de llegada antes de estirar.
 * - `match`: llevar una banda de dibujos a la banda objetivo de un pellizco.
 * - `flip`: la banda se dio vuelta dos veces; decir dónde quedó la marca.
 */
export type MulAsk =
  | "turn"
  | "cover"
  | "rotate"
  | "which"
  | "stretch"
  | "total"
  | "predict"
  | "match"
  | "flip";

/** Las etapas de desvanecimiento de `tiles` en E0. */
export type MulFloorSkin = "loose_tiles" | "grid_rectangle" | "labeled_sides" | "product_notation";

/** Las etapas de desvanecimiento de `grid_stretch` en E0. */
export type MulBandSkin = "rubber_band" | "segment" | "drawings";

/**
 * Lo único que endurece. El modo, las pieles, el corte y las llaves viven
 * afuera justamente para que la regla del diseño —un nivel cambia de capa o
 * endurece parámetros, nunca las dos cosas— se pueda comprobar con un test.
 */
export interface MulParams {
  /** Filas del piso, o casillas por vuelta de manivela. */
  readonly a: readonly [number, number];
  /** Columnas del piso, o vueltas de manivela. */
  readonly b: readonly [number, number];
  /**
   * Los factores que no agrandan: 1, 0 y fracciones simples. Vacío hasta el
   * nivel 7, porque son los que rompen "multiplicar es hacer más".
   */
  readonly special: readonly MulFactor[];
}

export interface MulLevel extends LevelBase {
  readonly params: MulParams;
  /** Qué pide cada ronda, ciclando. Un nivel con dos preguntas alterna. */
  readonly asks: readonly MulAsk[];
  readonly floorSkin: MulFloorSkin;
  readonly bandSkin: MulBandSkin;
  /** El piso no se dibuja hasta que el jugador lo pide con un toque. */
  readonly floorOnDemand: boolean;
  /** En cuántas tiras se puede partir el piso. 0 hasta el nivel 4. */
  readonly cut: number;
  /** Las llaves con numeral sobre los lados, la ficha del total y la cruz. */
  readonly keys: boolean;
  /** El par de engranajes empuja la ficha: la entrada desde el desplazamiento. */
  readonly gears: boolean;
}

/**
 * Los ocho niveles del documento. Cada uno cambia la capa o endurece los
 * parámetros, nunca las dos cosas:
 *
 * 1 → 2 endurece (aparecen las baldosas), 2 → 3 no toca nada y cambia lo que se
 * pregunta, 3 → 4 y 4 → 5 cambian de capa con los mismos parámetros, 5 → 6 y
 * 6 → 7 endurecen sin moverse de `symbolic`, y 7 → 8 se lleva la banda a
 * `visual` sin tocar los parámetros.
 */
export const MUL_LEVELS: readonly MulLevel[] = [
  {
    n: 1,
    titleKey: "level.threeCellsPerTurn",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 3,
    params: { a: [2, 4], b: [2, 4], special: [] },
    asks: ["turn"],
    floorSkin: "loose_tiles",
    bandSkin: "rubber_band",
    floorOnDemand: false,
    cut: 0,
    keys: false,
    gears: true,
  },
  {
    n: 2,
    titleKey: "level.rowsThatMerge",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 4,
    params: { a: [2, 5], b: [2, 5], special: [] },
    asks: ["cover"],
    floorSkin: "loose_tiles",
    bandSkin: "rubber_band",
    floorOnDemand: false,
    cut: 0,
    keys: false,
    gears: false,
  },
  {
    n: 3,
    titleKey: "level.turnTheFloor",
    layer: "concrete",
    evidence: ["recognize", "explain"],
    rounds: 4,
    params: { a: [2, 5], b: [2, 5], special: [] },
    asks: ["rotate", "which"],
    floorSkin: "grid_rectangle",
    bandSkin: "rubber_band",
    floorOnDemand: false,
    cut: 0,
    keys: false,
    gears: false,
  },
  {
    n: 4,
    titleKey: "level.theBand",
    layer: "visual",
    evidence: ["manipulate"],
    rounds: 4,
    params: { a: [2, 5], b: [2, 5], special: [] },
    asks: ["stretch"],
    floorSkin: "grid_rectangle",
    bandSkin: "segment",
    floorOnDemand: false,
    cut: 0,
    keys: false,
    gears: false,
  },
  {
    n: 5,
    titleKey: "level.keysAndCross",
    layer: "symbolic",
    evidence: ["manipulate", "apply"],
    rounds: 4,
    params: { a: [2, 5], b: [2, 5], special: [] },
    asks: ["cover"],
    floorSkin: "labeled_sides",
    bandSkin: "segment",
    floorOnDemand: false,
    cut: 2,
    keys: true,
    gears: false,
  },
  {
    n: 6,
    titleKey: "level.ghostFloor",
    layer: "symbolic",
    evidence: ["apply"],
    rounds: 4,
    params: { a: [2, 5], b: [6, 12], special: [] },
    asks: ["total"],
    floorSkin: "product_notation",
    bandSkin: "segment",
    floorOnDemand: true,
    cut: 2,
    keys: true,
    gears: false,
  },
  {
    n: 7,
    titleKey: "level.oneZeroAndFractions",
    layer: "symbolic",
    evidence: ["generalize"],
    rounds: 4,
    params: {
      a: [2, 5],
      b: [6, 12],
      special: [
        { num: 1, den: 1 },
        { num: 0, den: 1 },
        { num: 1, den: 2 },
        { num: 1, den: 3 },
      ],
    },
    asks: ["predict"],
    floorSkin: "product_notation",
    bandSkin: "segment",
    floorOnDemand: true,
    cut: 2,
    keys: true,
    gears: false,
  },
  {
    n: 8,
    titleKey: "level.bandsWithoutNumbers",
    layer: "visual",
    evidence: ["generalize"],
    rounds: 4,
    params: {
      a: [2, 5],
      b: [6, 12],
      special: [
        { num: 1, den: 1 },
        { num: 0, den: 1 },
        { num: 1, den: 2 },
        { num: 1, den: 3 },
      ],
    },
    asks: ["match", "flip"],
    floorSkin: "product_notation",
    bandSkin: "drawings",
    floorOnDemand: true,
    cut: 2,
    keys: false,
    gears: false,
  },
];

/** Una fila del montón. Solo entra en el marco si mide lo que el marco pide. */
export interface MulRow {
  readonly id: string;
  readonly cells: number;
  readonly fits: boolean;
}

/**
 * Una ficha para elegir. Las equivocadas no son ruido: cada una es un error que
 * el diseño prevé.
 *
 * - `added_factors`: sumar los dos factores en vez de multiplicarlos. No tiene
 *   entrada en el catálogo de L, así que no clasifica.
 * - `neighbor_product`: el factor vecino, que es puntería y no una idea.
 * - `double_flip`: darse vuelta dos veces y quedar del lado equivocado. Es la
 *   única que clasifica, como `negative_times_negative`.
 */
export type MulLure = "added_factors" | "neighbor_product" | "double_flip";

export interface MulOption {
  readonly id: string;
  readonly value: number;
  readonly correct: boolean;
  readonly lure?: MulLure;
}

export interface MulProblem {
  readonly ask: MulAsk;
  /** El piso: filas por columnas. En la manivela, casillas por vuelta y vueltas. */
  readonly rows: number;
  readonly cols: number;
  /** Lo que el marco pide. En `rotate` viene transpuesto y por eso hay que girar. */
  readonly frameRows: number;
  readonly frameCols: number;
  readonly product: number;
  /** El estirado de la banda. En la manivela, las casillas por vuelta. */
  readonly factor: MulFactor;
  /** Cuánto mide la banda en reposo, en marcas de la regla. */
  readonly rest: number;
  /** La marca donde tiene que caer el extremo: `rest` por el factor. */
  readonly target: number;
  /** Marcas que tiene la regla, del clavo hacia la derecha. */
  readonly length: number;
  /** La banda se dio vuelta dos veces: la regla se abre también hacia la izquierda. */
  readonly flipped: boolean;
  /** Cuál de las dos animaciones no escala: la que hay que tocar. */
  readonly liar: number;
  readonly tileRows: readonly MulRow[];
  readonly options: readonly MulOption[];
  /** Las marcas que llevan dibujo cuando la banda se queda sin numerales. */
  readonly drawings: readonly number[];
}

/** Filas montadas siempre, para que el árbol de la escena no cambie entre rondas. */
export const MUL_ROW_SLOTS = 7;
/** Fichas montadas siempre, por la misma razón. */
export const MUL_OPTION_SLOTS = 4;

/**
 * Cuánto puede medir la banda en reposo. El segundo factor crece hasta 12 para
 * el piso, pero una banda de doce marcas estirada por cinco no entra en ninguna
 * pantalla: acá la regla la acota y el parámetro sigue siendo el mismo.
 */
const MAX_REST = 6;
/**
 * Hasta dónde puede llegar la marca objetivo. Es la misma razón: una regla de
 * treinta marcas no se lee de un vistazo, y el nodo pide anticipar, no contar.
 */
const MAX_TARGET = 18;

/**
 * Genera una ronda. La semilla la hace reproducible; la ronda decide cuál de
 * las preguntas del nivel toca, porque un nivel con dos preguntas tiene que
 * alternarlas y no sortearlas: sorteadas, cuatro rondas pueden no dar nunca
 * evidencia de uno de los dos verbos.
 */
export function generateMulScaling(level: MulLevel, seed: number, round = 0): MulProblem {
  const rnd = makeRandom(seed);
  const asks = level.asks;
  const ask = (asks[round % asks.length] ?? asks[0]) as MulAsk;
  const p = level.params;

  if (ask === "turn") return crankProblem(p, rnd);
  if (ask === "cover") return floorProblem(p, rnd, ask, false);
  if (ask === "rotate") return floorProblem(p, rnd, ask, true);
  if (ask === "total") return floorProblem(p, rnd, ask, false);
  return bandProblem(p, rnd, ask);
}

/** La manivela con el par de engranajes: cada vuelta mueve la ficha `rows` casillas. */
function crankProblem(p: MulParams, rnd: Random): MulProblem {
  const ratio = rnd.int(p.a[0], p.a[1]);
  const turns = rnd.int(p.b[0], p.b[1]);
  const product = ratio * turns;
  return {
    ask: "turn",
    rows: ratio,
    cols: turns,
    frameRows: ratio,
    frameCols: turns,
    product,
    // El puente con el nodo 3 escrito como estirado: la pista de `turns`
    // casillas queda multiplicada por las casillas que da cada vuelta.
    factor: { num: ratio, den: 1 },
    rest: turns,
    target: product,
    length: product + 2,
    flipped: false,
    liar: 0,
    tileRows: [],
    options: [],
    drawings: [],
  };
}

/** El patio. El marco pide un rectángulo y el montón trae filas de varios largos. */
function floorProblem(p: MulParams, rnd: Random, ask: MulAsk, transposed: boolean): MulProblem {
  let rows = rnd.int(p.a[0], p.a[1]);
  let cols = rnd.int(p.b[0], p.b[1]);
  // Girar un cuadrado no muestra nada: la conmutatividad se ve cuando los dos
  // lados son distintos.
  if (transposed && rows === cols) cols = cols === p.b[1] ? cols - 1 : cols + 1;
  if (cols < 1) cols = 2;
  if (rows < 1) rows = 2;
  const product = rows * cols;

  return {
    ask,
    rows,
    cols,
    frameRows: transposed ? cols : rows,
    frameCols: transposed ? rows : cols,
    product,
    factor: { num: cols, den: 1 },
    rest: rows,
    target: product,
    length: product + 2,
    flipped: false,
    liar: 0,
    tileRows: ask === "cover" ? makeRows(rows, cols, rnd) : [],
    options: ask === "total" ? makeTotals(rows, cols, rnd) : [],
    drawings: [],
  };
}

/**
 * El montón de baldosas. Las filas que no miden lo que el marco pide no son
 * ruido: son el error de contar de más y de menos, y el marco las devuelve sin
 * decir "mal".
 */
function makeRows(rows: number, cols: number, rnd: Random): MulRow[] {
  const out: MulRow[] = [];
  for (let i = 0; i < rows; i++) out.push({ id: `r${i}`, cells: cols, fits: true });
  const wrong = [cols + 1, Math.max(1, cols - 1)];
  for (let i = 0; i < wrong.length && out.length < MUL_ROW_SLOTS; i++) {
    out.push({ id: `w${i}`, cells: wrong[i] as number, fits: false });
  }
  return rnd.shuffle(out);
}

/**
 * Las fichas del total. La que suma los dos factores es el error que el diseño
 * prevé sin entrada en el catálogo; la vecina es puntería.
 */
function makeTotals(rows: number, cols: number, rnd: Random): MulOption[] {
  const product = rows * cols;
  const out: MulOption[] = [{ id: "o0", value: product, correct: true }];
  const push = (value: number, lure: MulLure): void => {
    if (value === product || value < 0) return;
    if (out.some((o) => o.value === value)) return;
    out.push({ id: `o${out.length}`, value, correct: false, lure });
  };
  push(rows + cols, "added_factors");
  push(product - rows, "neighbor_product");
  push(product + cols, "neighbor_product");
  return rnd.shuffle(out.slice(0, MUL_OPTION_SLOTS));
}

/** La banda: el factor, su largo en reposo y la marca donde tiene que caer. */
function bandProblem(p: MulParams, rnd: Random, ask: MulAsk): MulProblem {
  const factor = pickFactor(p, ask, rnd);
  const rest = pickRest(p, ask, factor, rnd);
  const target = Math.round(rest * factorValue(factor));
  const flipped = ask === "flip";
  // La regla siempre deja aire después de la marca objetivo: si terminara
  // justo ahí, el extremo sería el objetivo y no habría nada que buscar.
  const length = Math.max(target + 2, rest + 2, 6);

  return {
    ask,
    rows: factor.num,
    cols: rest,
    frameRows: factor.num,
    frameCols: rest,
    product: target,
    factor,
    rest,
    target,
    length,
    flipped,
    liar: rnd.bool() ? 0 : 1,
    tileRows: [],
    options: ask === "flip" || ask === "predict" ? markOptions(target, length, ask, rnd) : [],
    drawings: ask === "match" || ask === "flip" ? [1, rest - 1, rest] : [],
  };
}

/**
 * Qué factor toca. Los enteros salen del rango del nivel; el 1, el 0 y las
 * fracciones simples solo aparecen cuando el nivel los declara, que es la
 * cuarta dificultad del nodo: aceptar factores que no agrandan.
 */
function pickFactor(p: MulParams, ask: MulAsk, rnd: Random): MulFactor {
  // El estirado arbitrario del último nivel no lleva numerales, así que un
  // factor grande no se puede contar: dos o tres alcanzan y se ven.
  if (ask === "match" || ask === "flip") return { num: rnd.int(2, 3), den: 1 };
  if (ask === "predict" && p.special.length > 0) {
    // Acá el contenido son el 1, el 0 y las fracciones; los enteros quedan como
    // control, para que el jugador no pueda contestar siempre lo mismo.
    return rnd.pick([...p.special, { num: 2, den: 1 }, { num: 3, den: 1 }]);
  }
  const pool: MulFactor[] = [];
  for (let n = p.a[0]; n <= p.a[1]; n++) pool.push({ num: n, den: 1 });
  return rnd.pick(pool);
}

/**
 * Cuánto mide la banda en reposo. El factor manda: uno grande obliga a una
 * banda corta para que el estirado entre en la regla, y una fracción exige que
 * la banda se pueda partir en esa cantidad de partes iguales.
 */
function pickRest(p: MulParams, ask: MulAsk, factor: MulFactor, rnd: Random): number {
  const v = factorValue(factor);
  const cap = v > 1 ? Math.max(2, Math.floor(MAX_TARGET / v)) : MAX_REST;
  let rest = Math.max(2, Math.min(MAX_REST, cap, rnd.int(p.b[0], p.b[1])));
  if (factor.den > 1) rest = Math.max(factor.den, rest - (rest % factor.den));
  // Tres dibujos separados necesitan tres marcas donde apoyarse.
  if (ask === "match" || ask === "flip") rest = Math.max(3, rest);
  return rest;
}

/**
 * Las marcas candidatas. En `flip` la marca espejada es el error del catálogo:
 * darse vuelta dos veces y quedar del lado equivocado.
 */
function markOptions(target: number, length: number, ask: MulAsk, rnd: Random): MulOption[] {
  const out: MulOption[] = [{ id: "m0", value: target, correct: true }];
  const push = (value: number, lure: MulLure): void => {
    if (out.some((o) => o.value === value)) return;
    if (Math.abs(value) > length) return;
    out.push({ id: `m${out.length}`, value, correct: false, lure });
  };
  if (ask === "flip") push(-target, "double_flip");
  push(target + 1, "neighbor_product");
  push(Math.max(0, target - 1), "neighbor_product");
  return rnd.shuffle(out.slice(0, MUL_OPTION_SLOTS));
}

/**
 * El error del catálogo que este nodo puede clasificar, y el único. `L`
 * declara `negative_times_negative` sobre `arith.mul.scaling` con patrón
 * `double_flip`; ningún otro error del diseño tiene entrada, así que ningún
 * otro movimiento puede llevar `misconception`.
 */
export const MUL_MISCONCEPTION = "negative_times_negative";

/** Qué error catalogado corresponde a una ficha, si hay alguno. */
export function misconceptionFor(option: MulOption): string | undefined {
  return option.lure === "double_flip" ? MUL_MISCONCEPTION : undefined;
}

export const mulLevelByNumber = (n: number): MulLevel | undefined => MUL_LEVELS.find((l) => l.n === n);
export const TOTAL_MUL_LEVELS = MUL_LEVELS.length;

registerNode({
  id: NODE,
  n: 5,
  prereqs: ["arith.add.displacement"],
  levels: MUL_LEVELS,
});

/** Las capas y los verbos que el nodo recorre, para los tests y el mapa. */
export const MUL_LAYERS: readonly Layer[] = ["concrete", "visual", "symbolic"];
export const MUL_EVIDENCE: readonly Evidence[] = [
  "recognize",
  "explain",
  "manipulate",
  "apply",
  "generalize",
];
