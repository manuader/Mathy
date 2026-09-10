/**
 * Dos habitaciones, para `alg.expr.distributive_tiles`.
 *
 * Los seis niveles y qué endurece cada parámetro salen del documento del
 * minijuego y de `D1/15`, no de acá: este archivo los implementa, no los decide.
 *
 * La idea que sostiene todo: la distributiva no es una regla, es **el mismo
 * piso contado de dos maneras**. Por eso el objeto del nodo no es una expresión
 * sino un rectángulo con un ancho compartido y una lista de largos, y las dos
 * escrituras —`a(b + c)` y `ab + ac`— son dos vistas del mismo dato y no dos
 * datos. El área no se recalcula al sacar la pared porque nunca cambia: es la
 * misma lista de bloques, agrupada distinto. Un test lo comprueba nivel por
 * nivel, que es la única manera de saber que el invariante está en el modelo y
 * no solo en el dibujo.
 *
 * La otra idea es que solo se suman piezas de la misma forma. Por eso una pieza
 * no lleva un valor sino una forma —baldosa unidad, tira de largo `x`, cuadrado
 * de lado `x`—, y el libro de cuentas tiene una columna por bloque. Dos
 * columnas se funden si cuentan la misma forma y se rechazan si no, que es de
 * dónde sale `variable_as_label` sin que nadie lo escriba.
 *
 * Sin texto visible: acá hay datos, claves y notación. La notación se emite
 * como términos —coeficiente y letras— y no como cadenas armadas: quien las
 * compone es la actividad, que es la que sabe dibujar glifos. Las letras salen
 * del atlas, igual que en el nodo 10.
 */

import { makeRandom, type Random } from "./random.ts";
import { registerNode, type LevelBase } from "./node.ts";
import type { Evidence, Layer } from "./one-step.ts";

/** El nodo del grafo que este minijuego enseña. */
export const NODE = "alg.expr.distributive_tiles";

/**
 * El mismo id, sin ambigüedad. `index.ts` reúne trece minijuegos con `export *`
 * y cada uno declara su propio `NODE`, así que afuera del módulo se lo nombra
 * así. Todo lo demás de este archivo va prefijado por la misma razón.
 */
export const NODE_DISTRIBUTIVE_TILES = NODE;

// --- Las piezas y la notación ------------------------------------------------

/** Las tres piezas de la bandeja, y no hay más. */
export type DistShape = "unit" | "x_strip" | "x_square";

/**
 * Un término escrito: el coeficiente y las letras yuxtapuestas, en orden.
 * `{coef: 3, letters: "x"}` es `3x`; `{coef: 12, letters: ""}` es `12`;
 * `{coef: 2, letters: "ab"}` es `2ab`.
 *
 * La yuxtaposición es la convención que el nodo estrena: acá no hay signo de
 * multiplicar entre el coeficiente y la letra porque en el renglón estorba.
 */
export interface DistTerm {
  readonly coef: number;
  readonly letters: string;
}

/**
 * Cómo se agrupa una escritura.
 *
 * - `sum`: los términos de `head`, sumados. `ab + ac`
 * - `product`: `head` pegado al paréntesis que encierra a `tail`. `a(b + c)`
 * - `pair`: dos paréntesis pegados. `(a + b)(a + b)`
 */
export type DistFormKind = "sum" | "product" | "pair";

export interface DistForm {
  readonly kind: DistFormKind;
  readonly head: readonly DistTerm[];
  readonly tail: readonly DistTerm[];
}

/**
 * Cuántas celdas del marco dibuja cada letra. Es una convención de dibujo y no
 * un valor: la `x` no vale cinco, se dibuja de cinco celdas para que la
 * habitación desconocida no se pueda contar de un vistazo y para que nunca mida
 * lo mismo que una habitación numérica, que en este nodo llega hasta tres.
 */
const LETTER_CELLS: Readonly<Record<string, number>> = { x: 5, y: 4, a: 2, b: 3 };

/** El largo de una letra que no está en la tabla. */
export const DIST_X_CELLS = 5;

/** Cuántas celdas del marco mide un lado. */
export function distCells(term: DistTerm): number {
  let cells = Math.abs(term.coef);
  for (const letra of term.letters) cells *= LETTER_CELLS[letra] ?? DIST_X_CELLS;
  return cells;
}

/** Multiplicar dos lados es pegar sus letras y multiplicar sus coeficientes. */
export const distTimes = (a: DistTerm, b: DistTerm): DistTerm => ({
  coef: a.coef * b.coef,
  letters: [...a.letters, ...b.letters].sort().join(""),
});

/** Qué pieza cubre un área: la forma sale de cuántas letras tiene. */
export const distShapeOf = (term: DistTerm): DistShape =>
  term.letters.length >= 2 ? "x_square" : term.letters.length === 1 ? "x_strip" : "unit";

// --- Lo que endurece ---------------------------------------------------------

/**
 * Lo único que endurece. La capa, la pregunta, las pieles, el libro y la
 * definición viven afuera justamente para que la regla del diseño —un nivel
 * cambia de capa o endurece parámetros, nunca las dos cosas— se pueda comprobar
 * con un test.
 */
export interface DistParams {
  /** Cuántos sumandos tiene el paréntesis. Dos, y tres desde el nivel 5. */
  readonly terms: number;
  /** Cuántos largos son desconocidos: la tira de largo `x`. */
  readonly unknowns: number;
  /** De dónde salen los coeficientes que el generador sortea. */
  readonly coefficients: readonly [number, number];
  /** Entra la resta adentro del paréntesis: el hueco recortado. */
  readonly subtraction: boolean;
  /** El ancho compartido puede ser negativo, y ahí la prótesis se rompe. */
  readonly negativeFactor: boolean;
}

/**
 * Qué se pregunta en una ronda. No es dificultad: es qué gesto contesta.
 *
 * - `cover`: arrastrar las tiras hasta cubrir las dos habitaciones, y después
 *   tocar la pared. Es el gesto que le da nombre al nodo.
 * - `pick`: tocar la ficha que mide el piso entero.
 * - `explain`: tres escrituras del mismo marco de lado `a + b`; tocar las dos
 *   que pierden baldosas.
 * - `wall`: sacar la pared y volver a ponerla, con el renglón al lado. La
 *   igualdad vale en los dos sentidos, y este nivel es esa frase hecha gesto.
 * - `tally`: llevar la ficha de cada bloque a su columna del libro.
 * - `expand`: sin piso; armar la suma llevando una ficha a cada ranura.
 * - `square`: el cuadrado de una suma. Es donde vive `missing_piece_tiles`.
 * - `recompose`: se da la suma y hay que encontrar el ancho compartido.
 * - `reject`: `a(bc)` no se reparte, porque es un bloque sin pared.
 */
export type DistAsk =
  | "cover"
  | "pick"
  | "explain"
  | "wall"
  | "tally"
  | "expand"
  | "square"
  | "recompose"
  | "reject";

/** Las etapas de desvanecimiento de `tiles` en E0, en orden. */
export type DistFloorSkin = "loose_tiles" | "grid_rectangle" | "labeled_sides" | "product_notation";

/** Las etapas de desvanecimiento de `ledger` en E0: el objeto, la barra, la ficha. */
export type DistLedgerSkin = "objects" | "bars" | "chips";

export interface DistLevel extends LevelBase {
  readonly params: DistParams;
  /** Qué pide cada ronda, ciclando. Un nivel con dos preguntas alterna. */
  readonly asks: readonly DistAsk[];
  readonly floorSkin: DistFloorSkin;
  readonly ledgerSkin: DistLedgerSkin;
  /** El piso se ve, o se pide con un toque sobre el producto. */
  readonly floor: "shown" | "onDemand";
  /** El libro al costado. Dura más que las baldosas y se retira en `formal`. */
  readonly ledger: boolean;
  /** El renglón con las dos escrituras al lado del piso. Nace en `symbolic`. */
  readonly row: boolean;
  /**
   * Los errores del catálogo que este nivel clasifica. Un movimiento que el
   * nivel no declara se muestra igual —el marco queda con un hueco, la columna
   * rebota— pero el `attempt` va sin campo: anotar un error que el diseño
   * todavía no está evaluando ensucia la remediación para siempre.
   */
  readonly classifies: readonly string[];
  /** La definición corta con voz. Solo en `formal`. */
  readonly definition: boolean;
}

/**
 * Los seis niveles del documento. Cada uno cambia la capa o endurece los
 * parámetros, nunca las dos cosas:
 *
 * 1 → 2 endurece (entra el largo desconocido y con él la tira de largo `x`),
 * 2 → 3 y 3 → 4 cambian de capa con la misma dificultad numérica, 4 → 5
 * endurece sin moverse de `symbolic` (tres sumandos, restas adentro, factor
 * común negativo y números más grandes) y 5 → 6 se lleva el nodo a `formal` sin
 * tocar un parámetro.
 *
 * DISCREPANCIA ANOTADA. El documento pide que el nivel 6 sea a la vez `formal`
 * y el que estrena el producto de dos paréntesis y el cuadrado de una suma, que
 * es cambiar de capa y ensanchar en el mismo escalón. La regla del repositorio
 * prohíbe las dos cosas juntas y manda correr el ensanchamiento al nivel
 * siguiente, que acá no existe. Gana la regla por otro camino: el cuadrado, la
 * recomposición y el contraejemplo entran como **preguntas** y no como
 * parámetros —`square`, `recompose` y `reject` arman su propio objeto y no leen
 * `params`—, igual que la tubería y las cerraduras arbitrarias del nodo 9. Así
 * el nivel 6 cambia de capa sin ablandar ni endurecer nada, y no se pierde el
 * caso `(a + b)²`, que es donde el nodo entrega `distribute_over_wrong_op` y lo
 * que `alg.expr.binomial_product` retoma entero.
 *
 * SEGUNDA DISCREPANCIA ANOTADA. El documento llama al nivel 6 `formal` y
 * `abstract`. `LevelBase` tiene una sola capa y ningún nodo construido usa
 * `abstract` como capa de nivel: en D1 `abstract` es el estado del nodo —el
 * jugador expande y recompone sin pedir baldosas— y no una pantalla. El nivel
 * queda en `formal`, que es la capa que sí tiene superficie propia.
 */
export const DIST_LEVELS: readonly DistLevel[] = [
  {
    n: 1,
    titleKey: "level.coverTheFloor",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 3,
    params: {
      terms: 2,
      unknowns: 0,
      coefficients: [1, 4],
      subtraction: false,
      negativeFactor: false,
    },
    asks: ["cover"],
    floorSkin: "loose_tiles",
    ledgerSkin: "objects",
    floor: "shown",
    ledger: true,
    row: false,
    // Cubrir con baldosas cuadradas no puede confundir dos formas: hay una sola.
    classifies: [],
    definition: false,
  },
  {
    n: 2,
    titleKey: "level.theRoomWithNoMeasure",
    layer: "concrete",
    evidence: ["recognize", "manipulate"],
    rounds: 4,
    params: {
      terms: 2,
      unknowns: 1,
      coefficients: [1, 4],
      subtraction: false,
      negativeFactor: false,
    },
    asks: ["cover", "pick"],
    floorSkin: "loose_tiles",
    ledgerSkin: "objects",
    floor: "shown",
    ledger: true,
    row: false,
    classifies: ["variable_as_label"],
    definition: false,
  },
  {
    n: 3,
    titleKey: "level.barsAndBraces",
    layer: "visual",
    evidence: ["explain", "manipulate"],
    rounds: 4,
    params: {
      terms: 2,
      unknowns: 1,
      coefficients: [1, 4],
      subtraction: false,
      negativeFactor: false,
    },
    asks: ["explain", "cover"],
    floorSkin: "grid_rectangle",
    ledgerSkin: "bars",
    floor: "shown",
    ledger: true,
    row: false,
    classifies: ["variable_as_label"],
    definition: false,
  },
  {
    n: 4,
    // "Fichas al lado" ya está en el diccionario y dice exactamente esto. Una
    // clave repetida con el mismo texto es una traducción que después hay que
    // mantener dos veces.
    titleKey: "level.tokensBeside",
    layer: "symbolic",
    evidence: ["manipulate", "apply"],
    rounds: 4,
    params: {
      terms: 2,
      unknowns: 1,
      coefficients: [1, 4],
      subtraction: false,
      negativeFactor: false,
    },
    asks: ["wall", "tally"],
    floorSkin: "labeled_sides",
    ledgerSkin: "chips",
    floor: "shown",
    ledger: true,
    row: true,
    classifies: ["variable_as_label"],
    definition: false,
  },
  {
    n: 5,
    titleKey: "level.noFloor",
    layer: "symbolic",
    evidence: ["apply"],
    rounds: 4,
    params: {
      terms: 3,
      unknowns: 1,
      coefficients: [1, 9],
      subtraction: true,
      negativeFactor: true,
    },
    asks: ["expand"],
    floorSkin: "product_notation",
    ledgerSkin: "chips",
    floor: "onDemand",
    ledger: true,
    row: true,
    // Una ficha con el signo sin cambiar o con el ancho perdido no es ninguno de
    // los dos errores que el catálogo declara sobre el nodo: se muestra y no se
    // anota.
    classifies: [],
    definition: false,
  },
  {
    n: 6,
    titleKey: "level.theSquareThatGrows",
    layer: "formal",
    evidence: ["generalize"],
    rounds: 6,
    params: {
      terms: 3,
      unknowns: 1,
      coefficients: [1, 9],
      subtraction: true,
      negativeFactor: true,
    },
    asks: ["square", "recompose", "reject"],
    floorSkin: "product_notation",
    ledgerSkin: "chips",
    floor: "onDemand",
    // Contar por tipo sigue siendo cierto sin dibujo, pero en `formal` la fila
    // de coeficientes ya es la escritura y el libro sobra.
    ledger: false,
    row: true,
    classifies: ["distribute_over_wrong_op"],
    definition: true,
  },
];

// --- Las piezas de una ronda -------------------------------------------------

/**
 * Una habitación: un sumando del paréntesis con el bloque de piso que le toca.
 *
 * `area` es el bloque que produce el primer término del ancho. Con un ancho
 * partido —el cuadrado de una suma— una habitación produce más de un bloque, y
 * la lista completa la da `distAreaTerms`.
 */
export interface DistRoom {
  readonly id: string;
  /** El largo de la habitación: el sumando. */
  readonly length: DistTerm;
  readonly area: DistTerm;
  /** Cuántas celdas del marco ocupa a lo largo. */
  readonly cells: number;
  /** Qué forma tienen las piezas que la cubren. */
  readonly shape: DistShape;
}

/**
 * Una pieza de la bandeja. En las rondas de cubrir es una tira del largo de una
 * habitación; en el cuadrado de una suma es uno de los dos rectángulos que
 * faltan, y por eso tiene alto además de largo.
 */
export interface DistPiece {
  readonly id: string;
  /** La habitación a la que entra, o -1 si tapa un hueco del marco. */
  readonly room: number;
  readonly shape: DistShape;
  /** Cuántas celdas mide a lo largo del marco. */
  readonly cells: number;
  /** Cuántas celdas mide a lo alto. Una tira mide una. */
  readonly tall: number;
}

/**
 * Una columna del libro. Cuenta piezas de una sola forma, que es la regla
 * entera: `2x + 3x` se junta y `2x + 3` no.
 */
export interface DistColumn {
  readonly id: string;
  readonly shape: DistShape;
  /** Cuántas piezas de esa forma anotó. */
  readonly count: number;
  /** La letra que la marca, ya pegada al conteo. Vacía: cuenta baldosas unidad. */
  readonly letter: string;
}

/**
 * Por qué una ficha está en pantalla, si no dice el piso. Cada una es un error
 * que el diseño prevé, y ninguna es un número al azar.
 *
 * - `partial_distribution`: el ancho llegó a un solo sumando.
 * - `product_of_parts`: los dos bloques multiplicados en vez de sumados.
 * - `labels_merged`: las letras juntadas como si fueran nombres.
 * - `square_of_parts`: cada habitación elevada al cuadrado por separado.
 * - `sides_added`: los lados sumados, que es el contorno y no el piso.
 * - `sign_kept`: la resta no cambió de signo al repartir.
 * - `factor_dropped`: el ancho se perdió por el camino.
 * - `one_side_only`: el ancho propuesto divide a un solo sumando.
 * - `factor_into_both`: el ancho copiado adentro de los dos factores.
 * - `distributed_over_product`: se repartió sobre un producto, donde no hay pared.
 */
export type DistLure =
  | "partial_distribution"
  | "product_of_parts"
  | "labels_merged"
  | "square_of_parts"
  | "sides_added"
  | "sign_kept"
  | "factor_dropped"
  | "one_side_only"
  | "factor_into_both"
  | "distributed_over_product";

export interface DistOption {
  readonly id: string;
  /** La escritura que la ficha muestra. */
  readonly form: DistForm;
  /**
   * La escritura es cierta: mide el piso sin perder ni agregar una baldosa.
   * Una ficha tiene `lure` exactamente cuando no lo es.
   */
  readonly sound: boolean;
  /**
   * Tocarla es acertar. Coincide con `sound` en todas las preguntas menos en
   * `explain`, donde lo que se pide es señalar las que pierden baldosas y por
   * lo tanto se toca lo contrario.
   */
  readonly correct: boolean;
  readonly lure?: DistLure;
}

export interface DistProblem {
  readonly ask: DistAsk;
  /** El ancho compartido. Es una lista porque el cuadrado de una suma lo parte. */
  readonly width: readonly DistTerm[];
  /** Cuántas celdas mide el ancho: la altura del marco. */
  readonly widthCells: number;
  readonly rooms: readonly DistRoom[];
  /** Las piezas que esperan en la bandeja. */
  readonly tray: readonly DistPiece[];
  /** El producto: la pared puesta. */
  readonly product: DistForm;
  /**
   * La suma: la pared afuera. Los bloques se escriben uno por uno y en el orden
   * del piso; juntar dos que miden lo mismo es un movimiento del libro y no de
   * la escritura.
   */
  readonly sum: DistForm;
  /** Las columnas del libro con la pared afuera: una por bloque. */
  readonly columns: readonly DistColumn[];
  /** Las fichas que se tocan. Vacías cuando la ronda se juega con la mano. */
  readonly options: readonly DistOption[];
  /** Cuántas fichas hay que tocar o colocar para cerrar la ronda. */
  readonly picks: number;
  /** La ronda empieza con la pared puesta. */
  readonly wallIn: boolean;
  /** El contador de superficie, o `null` cuando hay letras y no es un número. */
  readonly area: number | null;
  /**
   * Las tiras que el patrón `missing_piece_tiles` deja puestas, izquierda desde
   * arriba y derecha desde abajo. Con eso el cuadrado `a × a` y el `b × b`
   * quedan en esquinas opuestas y los dos rectángulos `a × b` quedan vacíos.
   */
  readonly prefilled: readonly [number, number];
}

/** Piezas montadas siempre, para que el árbol de la escena no cambie entre rondas. */
export const DIST_TRAY_SLOTS = 6;
/** Fichas montadas siempre, por la misma razón. */
export const DIST_OPTION_SLOTS = 5;
/** Columnas montadas siempre. */
export const DIST_COLUMN_SLOTS = 4;
/** Cuánto puede medir el ancho en las rondas con baldosas. Más alto no se arrastra. */
export const DIST_MAX_WIDTH = 3;
/** Cuánto puede medir un largo numérico con baldosas. */
export const DIST_MAX_LENGTH = 3;
/**
 * Cuántas piezas puede llegar a contar una columna. El libro las dibuja de a
 * una hasta la capa simbólica, y una columna de doce no entra en el renglón.
 */
export const DIST_MAX_COLUMN = 6;

// --- El invariante -----------------------------------------------------------

/**
 * El área del piso, bloque por bloque. Es lo que no cambia al sacar la pared,
 * porque sacar la pared no toca esta lista: la agrupa.
 * `area_preserved_under_rearrangement`, dicho en el modelo.
 */
export function distAreaTerms(
  width: readonly DistTerm[],
  rooms: readonly DistRoom[],
): DistTerm[] {
  const out: DistTerm[] = [];
  for (const w of width) for (const r of rooms) out.push(distTimes(w, r.length));
  return out;
}

/** Cuántas celdas del marco cubre una lista de términos. */
export const distTotalCells = (terms: readonly DistTerm[]): number =>
  terms.reduce((s, t) => s + distCells(t), 0);

/** Una pieza entra en una habitación si mide lo mismo y es de la misma forma. */
export const distFits = (piece: DistPiece, room: DistRoom): boolean =>
  piece.cells === room.cells && piece.shape === room.shape;

/** Las columnas con la pared afuera: una por bloque, sin juntar nada. */
export const distColumnsOf = (terms: readonly DistTerm[]): DistColumn[] =>
  terms.map((t, i) => ({
    id: `c${i}`,
    shape: distShapeOf(t),
    count: Math.abs(t.coef),
    letter: t.letters,
  }));

/**
 * Dos columnas se funden si cuentan la misma forma, y ahí el coeficiente suma.
 * Si no, `null`: el libro las rechaza con un rebote corto.
 */
export function distMerge(a: DistColumn, b: DistColumn): DistColumn | null {
  if (a.shape !== b.shape || a.letter !== b.letter) return null;
  return { ...a, count: a.count + b.count };
}

/**
 * Las columnas con la pared puesta: las que cuentan la misma forma se juntan y
 * las demás quedan como estaban. La cantidad de piezas no cambia, que es
 * `count_preserved_under_regrouping` dicho en el modelo.
 */
export function distFolded(columns: readonly DistColumn[]): DistColumn[] {
  const out: DistColumn[] = [];
  for (const c of columns) {
    const i = out.findIndex((o) => o.shape === c.shape && o.letter === c.letter);
    const previa = i >= 0 ? out[i] : undefined;
    if (previa) out[i] = distMerge(previa, c) ?? previa;
    else out.push(c);
  }
  return out;
}

// --- Los errores del catálogo ------------------------------------------------

/**
 * Los dos errores que `L` declara sobre este nodo, y los únicos. Ningún otro
 * movimiento de este minijuego puede llevar `misconception`.
 */
export const DIST_MISCONCEPTIONS: readonly string[] = [
  "distribute_over_wrong_op",
  "variable_as_label",
];

/** Qué error del catálogo encarna una ficha equivocada, si encarna alguno. */
function catalogOf(lure: DistLure | undefined): string | undefined {
  if (lure === "square_of_parts") return "distribute_over_wrong_op";
  if (lure === "factor_into_both") return "distribute_over_wrong_op";
  if (lure === "distributed_over_product") return "distribute_over_wrong_op";
  if (lure === "labels_merged") return "variable_as_label";
  return undefined;
}

/**
 * El error que corresponde a tocar una ficha, si el nivel lo está evaluando.
 *
 * Solo clasifica un movimiento equivocado. En `explain` las fichas que se tocan
 * son justamente las que encarnan los dos errores, y tocarlas es acertar: quien
 * las señala no los está cometiendo, así que ahí nunca se anota nada.
 */
export function distMisconceptionFor(
  level: DistLevel,
  option: DistOption | undefined,
): string | undefined {
  if (!option || option.correct) return undefined;
  const id = catalogOf(option.lure);
  return id && level.classifies.includes(id) ? id : undefined;
}

/**
 * El error que corresponde a dejar algo donde no va: una pieza en una
 * habitación, o la ficha de un bloque en una columna. Los dos movimientos son
 * la misma pregunta —¿estas dos cosas tienen la misma forma?— y por eso la
 * firma pide formas y no objetos.
 *
 * Solo clasifica cuando las formas difieren, que es exactamente lo que el
 * catálogo describe: dos piezas que no tienen la misma forma no se apilan en la
 * misma columna. Una tira del largo equivocado pero de la misma forma es un
 * error de medida y no una idea equivocada sobre las letras: el marco se
 * resiste y el `attempt` va sin campo.
 */
export function distDropMisconceptionFor(
  level: DistLevel,
  llevado: { readonly shape: DistShape },
  destino: { readonly shape: DistShape },
): string | undefined {
  if (llevado.shape === destino.shape) return undefined;
  return level.classifies.includes("variable_as_label") ? "variable_as_label" : undefined;
}

// --- El generador ------------------------------------------------------------

/**
 * Genera una ronda. La semilla la hace reproducible; la ronda decide cuál de
 * las preguntas del nivel toca, porque un nivel con dos preguntas tiene que
 * alternarlas y no sortearlas: sorteadas, cuatro rondas pueden no dar nunca
 * evidencia de uno de los dos verbos.
 */
export function generateDistributive(level: DistLevel, seed: number, round = 0): DistProblem {
  const rnd = makeRandom(seed);
  const asks = level.asks;
  const ask = (asks[round % asks.length] ?? asks[0]) as DistAsk;

  if (ask === "explain") return explainProblem(rnd);
  if (ask === "square") return squareProblem();
  if (ask === "recompose") return recomposeProblem(rnd);
  if (ask === "reject") return rejectProblem(rnd);
  if (ask === "expand") return expandProblem(level, rnd);
  return floorProblem(level, ask, rnd);
}

/** El esqueleto de una ronda: lo que ninguna pregunta usa queda vacío. */
function empty(): DistProblem {
  return {
    ask: "cover",
    width: [],
    widthCells: 0,
    rooms: [],
    tray: [],
    product: { kind: "sum", head: [], tail: [] },
    sum: { kind: "sum", head: [], tail: [] },
    columns: [],
    options: [],
    picks: 1,
    wallIn: true,
    area: null,
    prefilled: [0, 0],
  };
}

/** Las dos escrituras del mismo piso. Son vistas del mismo dato, no dos datos. */
function writings(
  width: readonly DistTerm[],
  rooms: readonly DistRoom[],
): { product: DistForm; sum: DistForm } {
  const lengths = rooms.map((r) => r.length);
  return {
    product:
      width.length > 1
        ? { kind: "pair", head: width, tail: lengths }
        : { kind: "product", head: width, tail: lengths },
    sum: { kind: "sum", head: distAreaTerms(width, rooms), tail: [] },
  };
}

/** El área como número, o `null` si algún bloque tiene letras. */
function areaOf(terms: readonly DistTerm[]): number | null {
  if (terms.some((t) => t.letters !== "")) return null;
  return terms.reduce((s, t) => s + t.coef, 0);
}

/** Las habitaciones que salen de un ancho y una lista de largos. */
function roomsOf(width: DistTerm, lengths: readonly DistTerm[]): DistRoom[] {
  return lengths.map((l, i) => {
    const area = distTimes(width, l);
    return { id: `r${i}`, length: l, area, cells: distCells(l), shape: distShapeOf(area) };
  });
}

/**
 * El piso de las rondas que se juegan con la mano: cubrir, reconocer, sacar la
 * pared y anotar en el libro.
 *
 * Dos habitaciones y no tres: el piso se parte en una sola pared, y con tres
 * sumandos habría dos. Los tres sumandos llegan en el nivel 5, que es
 * justamente donde el piso ya no se dibuja.
 *
 * El presupuesto de baldosas manda sobre los parámetros: una columna se dibuja
 * pieza por pieza hasta la capa simbólica, así que un bloque no puede pasar de
 * `DIST_MAX_COLUMN`. No es una decisión de dificultad, es lo que el libro puede
 * dibujar.
 */
function floorProblem(level: DistLevel, ask: DistAsk, rnd: Random): DistProblem {
  const p = level.params;
  const [lo, hi] = p.coefficients;
  const anchoMax = Math.max(2, Math.min(DIST_MAX_WIDTH, hi));
  const largoMax = Math.max(1, Math.min(DIST_MAX_LENGTH, hi));

  let width: DistTerm = { coef: 2, letters: "" };
  let lengths: readonly DistTerm[] = [
    { coef: 1, letters: "x" },
    { coef: 2, letters: "" },
  ];
  for (let intento = 0; intento < 80; intento++) {
    const ancho: DistTerm = { coef: rnd.int(Math.max(2, lo), anchoMax), letters: "" };
    const desconocida = p.unknowns > 0 ? rnd.int(0, 1) : -1;
    const candidatos: DistTerm[] = [0, 1].map((i) =>
      i === desconocida
        ? { coef: 1, letters: "x" }
        : { coef: rnd.int(Math.max(1, lo), largoMax), letters: "" },
    );
    // Dos habitaciones numéricas del mismo largo se ven como una sola partida
    // por la mitad, y ahí la pared deja de decir nada.
    if (desconocida < 0 && candidatos[0]?.coef === candidatos[1]?.coef) continue;
    const areas = candidatos.map((l) => distTimes(ancho, l));
    if (areas.some((a) => Math.abs(a.coef) > DIST_MAX_COLUMN)) continue;
    width = ancho;
    lengths = candidatos;
    break;
  }

  const rooms = roomsOf(width, lengths);
  const widthCells = distCells(width);
  const { product, sum } = writings([width], rooms);
  const bloques = distAreaTerms([width], rooms);

  // La bandeja: una tira por fila de cada habitación. Mezcladas, porque elegir
  // en qué habitación entra cada tira es la mitad del gesto.
  const tray: DistPiece[] = [];
  for (let i = 0; i < rooms.length; i++) {
    const r = rooms[i] as DistRoom;
    for (let k = 0; k < widthCells; k++) {
      tray.push({ id: `${r.id}-${k}`, room: i, shape: r.shape, cells: r.cells, tall: 1 });
    }
  }

  return {
    ...empty(),
    ask,
    width: [width],
    widthCells,
    rooms,
    tray: ask === "cover" ? rnd.shuffle(tray) : [],
    product,
    sum,
    columns: distColumnsOf(bloques),
    options: ask === "pick" ? pickOptions(width, rooms, rnd) : [],
    // Sacar la pared y volver a ponerla: la igualdad vale en los dos sentidos.
    picks: ask === "wall" ? 2 : ask === "tally" ? rooms.length : 1,
    // Anotar en el libro se hace con la pared afuera: cada bloque ya se contrajo
    // en su ficha y lo que falta es llevarla a su columna. En las demás la pared
    // llega puesta, salvo en la de la pared, que se sortea para que el nivel
    // pida repartir y también volver a juntar.
    wallIn: ask === "tally" ? false : ask === "wall" ? rnd.bool() : true,
    area: areaOf(bloques),
  };
}

/**
 * Las fichas de reconocer. Los distractores son los del diseño: el ancho que
 * llegó a un solo sumando, los dos bloques multiplicados y el ancho repetido
 * adentro de dos paréntesis.
 *
 * Ninguna lleva error del catálogo, y no es un olvido: `distribute_over_wrong_op`
 * es repartir sobre la operación equivocada, y acá adentro del paréntesis hay
 * una suma, que es la operación correcta. El error llega en el nivel 6, donde
 * adentro hay un producto y un cuadrado.
 */
function pickOptions(width: DistTerm, rooms: readonly DistRoom[], rnd: Random): DistOption[] {
  const a = rooms[0] as DistRoom;
  const b = rooms[1] as DistRoom;
  return rnd.shuffle([
    {
      id: "o0",
      form: { kind: "product", head: [width], tail: [a.length, b.length] } as DistForm,
      sound: true,
      correct: true,
    },
    {
      id: "o1",
      form: { kind: "sum", head: [a.area, b.length], tail: [] } as DistForm,
      sound: false,
      correct: false,
      lure: "partial_distribution" as const,
    },
    {
      id: "o2",
      form: { kind: "pair", head: [a.area], tail: [b.area] } as DistForm,
      sound: false,
      correct: false,
      lure: "product_of_parts" as const,
    },
    {
      id: "o3",
      form: { kind: "pair", head: [width, a.length], tail: [width, b.length] } as DistForm,
      sound: false,
      correct: false,
      lure: "sides_added" as const,
    },
  ]);
}

/** El marco del cuadrado de una suma: lados `a` y `b`, sin un solo número. */
function squareFloor(): { width: DistTerm[]; rooms: DistRoom[] } {
  const a: DistTerm = { coef: 1, letters: "a" };
  const b: DistTerm = { coef: 1, letters: "b" };
  return { width: [a, b], rooms: roomsOf(a, [a, b]) };
}

/** Las tres escrituras que se ponen en juego alrededor del cuadrado. */
const SQUARE_FULL: DistTerm[] = [
  { coef: 1, letters: "aa" },
  { coef: 2, letters: "ab" },
  { coef: 1, letters: "bb" },
];
const SQUARE_PARTS: DistTerm[] = [
  { coef: 1, letters: "aa" },
  { coef: 1, letters: "bb" },
];

/**
 * Explicar: tres escrituras del mismo marco de lado `a + b`, y hay que tocar
 * las dos que pierden baldosas.
 *
 * El marco es el cuadrado y no el piso de dos habitaciones numéricas porque los
 * dos distractores del diseño lo piden: uno eleva al cuadrado cada habitación
 * por separado y el otro multiplica las etiquetas como si fueran nombres, y con
 * una sola letra ninguno de los dos se puede escribir. Es una pregunta y no un
 * parámetro: no lee `params`, y por eso el nivel 3 sigue cambiando solo de capa.
 */
function explainProblem(rnd: Random): DistProblem {
  const { width, rooms } = squareFloor();
  const { product, sum } = writings(width, rooms);

  return {
    ...empty(),
    ask: "explain",
    width,
    widthCells: distTotalCells(width),
    rooms,
    product,
    sum,
    columns: distColumnsOf(distAreaTerms(width, rooms)),
    options: rnd.shuffle([
      {
        // La que dice el piso entero. No se toca: no pierde una sola baldosa.
        id: "o0",
        form: { kind: "sum", head: SQUARE_FULL, tail: [] } as DistForm,
        sound: true,
        correct: false,
      },
      {
        id: "o1",
        form: { kind: "sum", head: SQUARE_PARTS, tail: [] } as DistForm,
        sound: false,
        correct: true,
        lure: "square_of_parts" as const,
      },
      {
        id: "o2",
        form: { kind: "sum", head: [{ coef: 4, letters: "ab" }], tail: [] } as DistForm,
        sound: false,
        correct: true,
        lure: "labels_merged" as const,
      },
    ]),
    picks: 2,
    area: null,
  };
}

/**
 * El cuadrado que crece. El marco es un cuadrado de lado `a + b` y las fichas
 * dicen cuánto mide.
 *
 * `prefilled` y `tray` son lo que el patrón `missing_piece_tiles` necesita: si
 * el jugador elige `aa + bb`, el juego coloca las piezas que nombró —el
 * cuadrado `a × a` arriba a la izquierda y el `b × b` abajo a la derecha— y
 * quedan los dos rectángulos `a × b` vacíos en las esquinas opuestas, que son
 * los dos que esperan en la bandeja. Están acostados al revés uno del otro
 * porque ocupan esquinas opuestas.
 *
 * No sortea nada: con dos letras y un cuadrado no hay parámetro que variar, y
 * una ronda que cambia por cambiar diría que el caso es uno entre muchos.
 */
function squareProblem(): DistProblem {
  const { width, rooms } = squareFloor();
  const { product, sum } = writings(width, rooms);
  const a = width[0] as DistTerm;
  const b = width[1] as DistTerm;
  const ca = distCells(a);
  const cb = distCells(b);

  return {
    ...empty(),
    ask: "square",
    width,
    widthCells: ca + cb,
    rooms,
    tray: [
      { id: "m0", room: -1, shape: "x_square", cells: cb, tall: ca },
      { id: "m1", room: -1, shape: "x_square", cells: ca, tall: cb },
    ],
    product,
    sum,
    columns: distColumnsOf(distAreaTerms(width, rooms)),
    options: [
      {
        id: "o0",
        form: { kind: "sum", head: SQUARE_FULL, tail: [] } as DistForm,
        sound: true,
        correct: true,
      },
      {
        id: "o1",
        form: { kind: "sum", head: SQUARE_PARTS, tail: [] } as DistForm,
        sound: false,
        correct: false,
        lure: "square_of_parts" as const,
      },
      {
        id: "o2",
        form: {
          kind: "sum",
          head: [
            { coef: 2, letters: "a" },
            { coef: 2, letters: "b" },
          ],
          tail: [],
        } as DistForm,
        sound: false,
        correct: false,
        lure: "sides_added" as const,
      },
    ],
    picks: 1,
    area: null,
    prefilled: [ca, cb],
  };
}

/**
 * Recomponer: se da la suma y hay que encontrar el ancho compartido. Es la
 * distributiva al revés, que es el movimiento que `alg.expr.factor_common`
 * termina.
 *
 * Los dos sumandos comparten exactamente el ancho y nada más, así que la
 * respuesta es única: los otros dos coeficientes se eligen coprimos. Los
 * distractores son anchos que dividen a un solo sumando, que es el error de
 * quien mira un término y no los dos.
 */
function recomposeProblem(rnd: Random): DistProblem {
  let k = 3;
  let p = 2;
  let q = 5;
  for (let intento = 0; intento < 120; intento++) {
    const kk = rnd.int(2, 6);
    const pp = rnd.int(2, 5);
    const qq = rnd.int(2, 5);
    if (pp === qq || gcd(pp, qq) !== 1) continue;
    if (pp === kk || qq === kk) continue;
    // Los dos distractores tienen que dividir a un solo sumando: si uno
    // dividiera a los dos sería un ancho compartido de verdad, más chico, y la
    // pregunta tendría dos respuestas.
    if ((kk * qq) % pp === 0 || (kk * pp) % qq === 0) continue;
    k = kk;
    p = pp;
    q = qq;
    break;
  }

  const width: DistTerm = { coef: k, letters: "" };
  const rooms = roomsOf(width, [
    { coef: p, letters: "x" },
    { coef: q, letters: "" },
  ]);
  const { product, sum } = writings([width], rooms);
  const ficha = (coef: number): DistForm => ({
    kind: "sum",
    head: [{ coef, letters: "" }],
    tail: [],
  });

  return {
    ...empty(),
    ask: "recompose",
    width: [width],
    widthCells: k,
    rooms,
    product,
    sum,
    columns: distColumnsOf(distAreaTerms([width], rooms)),
    // La ronda llega con la pared afuera: lo que se da es la suma, y encontrar
    // el ancho compartido es volver a ponerla.
    wallIn: false,
    options: rnd.shuffle([
      { id: "o0", form: ficha(k), sound: true, correct: true },
      { id: "o1", form: ficha(p), sound: false, correct: false, lure: "one_side_only" as const },
      { id: "o2", form: ficha(q), sound: false, correct: false, lure: "one_side_only" as const },
      { id: "o3", form: ficha(1), sound: false, correct: false, lure: "factor_dropped" as const },
    ]),
    picks: 1,
    area: null,
  };
}

/**
 * El contraejemplo propio: `a(bc)` es un bloque sin pared, y no hay nada que
 * repartir. Las dos fichas equivocadas son las dos maneras de repartir sobre la
 * operación que no corresponde, y las dos las declara el catálogo.
 */
function rejectProblem(rnd: Random): DistProblem {
  const w = rnd.int(2, 9);
  const width: DistTerm = { coef: w, letters: "" };
  const bloque: DistTerm = { coef: 1, letters: "xy" };
  const rooms = roomsOf(width, [bloque]);

  return {
    ...empty(),
    ask: "reject",
    width: [width],
    widthCells: w,
    rooms,
    product: { kind: "product", head: [width], tail: [bloque] },
    sum: { kind: "sum", head: [distTimes(width, bloque)], tail: [] },
    columns: distColumnsOf(distAreaTerms([width], rooms)),
    options: rnd.shuffle([
      {
        id: "o0",
        form: { kind: "sum", head: [{ coef: w, letters: "xy" }], tail: [] } as DistForm,
        sound: true,
        correct: true,
      },
      {
        id: "o1",
        form: {
          kind: "pair",
          head: [{ coef: w, letters: "x" }],
          tail: [{ coef: w, letters: "y" }],
        } as DistForm,
        sound: false,
        correct: false,
        lure: "factor_into_both" as const,
      },
      {
        id: "o2",
        form: {
          kind: "sum",
          head: [
            { coef: w, letters: "x" },
            { coef: w, letters: "y" },
          ],
          tail: [],
        } as DistForm,
        sound: false,
        correct: false,
        lure: "distributed_over_product" as const,
      },
    ]),
    picks: 1,
    area: null,
  };
}

/**
 * Sin piso: el renglón queda solo y la suma se arma llevando una ficha a cada
 * ranura. Acá entran el factor común negativo, las restas adentro del
 * paréntesis y los tres sumandos, que es lo que el nivel 5 endurece.
 *
 * Las fichas equivocadas son la resta que no cambió de signo y el ancho que se
 * sumó en vez de multiplicar. Ninguna de las dos tiene entrada en el catálogo
 * apuntando a este nodo, así que se muestran y no se anotan.
 */
function expandProblem(level: DistLevel, rnd: Random): DistProblem {
  const p = level.params;
  const [lo, hi] = p.coefficients;
  const signo = p.negativeFactor && rnd.bool() ? -1 : 1;
  const width: DistTerm = { coef: signo * rnd.int(Math.max(2, lo), hi), letters: "" };

  const cuantos = Math.max(2, p.terms);
  const conLetra = rnd.int(0, cuantos - 1);
  const lengths: DistTerm[] = [];
  for (let i = 0; i < cuantos; i++) {
    const coef = rnd.int(Math.max(1, lo), hi);
    // La resta no abre el paréntesis: `(−3 + x)` se escribe `(x − 3)`, y el
    // primer sumando llega siempre en positivo.
    const negativo = p.subtraction && i > 0 && rnd.bool();
    lengths.push({ coef: (negativo ? -1 : 1) * coef, letters: i === conLetra ? "x" : "" });
  }

  const rooms = roomsOf(width, lengths);
  const { product, sum } = writings([width], rooms);
  const bloques = distAreaTerms([width], rooms);
  const ficha = (t: DistTerm): DistForm => ({ kind: "sum", head: [t], tail: [] });
  const iguales = (t: DistTerm): boolean =>
    bloques.some((b) => b.coef === t.coef && b.letters === t.letters);

  const buenas: DistOption[] = rooms.map((r, i) => ({
    id: `o${i}`,
    form: ficha(r.area),
    sound: true,
    correct: true,
  }));

  // El señuelo del signo: la resta repartida como si fuera una suma. Si el
  // término dado vuelta coincidiera con un bloque bueno, la ficha sería correcta
  // por accidente, así que en ese caso el señuelo es el sumando sin multiplicar.
  const objetivo = rooms[rnd.int(0, rooms.length - 1)] as DistRoom;
  const volteada: DistTerm = { coef: -objetivo.area.coef, letters: objetivo.area.letters };
  const sumado: DistTerm = {
    coef: width.coef + objetivo.length.coef,
    letters: objetivo.length.letters,
  };
  const candidatos: DistOption[] = [];
  const agregar = (id: string, t: DistTerm, lure: DistLure): void => {
    if (iguales(t)) return;
    const repetido = candidatos.some((c) => {
      const u = c.form.head[0] as DistTerm;
      return u.coef === t.coef && u.letters === t.letters;
    });
    if (repetido) return;
    candidatos.push({ id, form: ficha(t), sound: false, correct: false, lure });
  };
  agregar("oa", volteada, "sign_kept");
  agregar("ob", sumado, "partial_distribution");
  agregar("oc", objetivo.length, "factor_dropped");
  for (const otro of rooms) agregar(`od${otro.id}`, otro.length, "factor_dropped");
  // Dos señuelos y no más: con la ranura de cada sumando ocupada, la bandeja
  // tiene que entrar en la pantalla.
  const senuelos = candidatos.slice(0, 2);

  return {
    ...empty(),
    ask: "expand",
    width: [width],
    widthCells: Math.abs(width.coef),
    rooms,
    product,
    sum,
    columns: distColumnsOf(bloques),
    options: rnd.shuffle([...buenas, ...senuelos]),
    picks: rooms.length,
    area: null,
  };
}

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

export const distLevelByNumber = (n: number): DistLevel | undefined =>
  DIST_LEVELS.find((l) => l.n === n);
export const TOTAL_DIST_LEVELS = DIST_LEVELS.length;

registerNode({
  id: NODE,
  n: 15,
  prereqs: ["arith.mul.scaling", "prealg.var.unknown_as_box"],
  levels: DIST_LEVELS,
});

/** Las capas y los verbos que el nodo recorre, para los tests y el mapa. */
export const DIST_LAYERS: readonly Layer[] = ["concrete", "visual", "symbolic", "formal"];
export const DIST_EVIDENCE: readonly Evidence[] = [
  "recognize",
  "explain",
  "manipulate",
  "apply",
  "generalize",
];
