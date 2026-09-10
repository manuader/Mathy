/**
 * La pizza y la barra, para `arith.frac.parts_and_ratio`.
 *
 * Los ocho niveles y qué endurece cada parámetro salen del documento del
 * minijuego y de `D1/08`, no de acá: este archivo los implementa, no los decide.
 *
 * La idea que sostiene todo: una fracción nombra una relación y no una
 * cantidad. Por eso el todo se fija antes de contar, por eso la misma ficha
 * entra en dos barras de distinto largo, y por eso el frasco cuenta como todo
 * aunque nadie haya cortado nada. El número de abajo no es una cantidad: es el
 * corte, y cuanto más grande, más chica cada parte.
 *
 * Sin texto visible: el nodo es `literacy: none` y acá solo hay claves y datos.
 */

import { makeRandom, type Random } from "./random.ts";
import { registerNode, type LevelBase } from "./node.ts";
import type { Evidence, Layer } from "./one-step.ts";

/** El nodo del grafo que este minijuego enseña. */
export const NODE = "arith.frac.parts_and_ratio";

/**
 * El mismo id, sin ambigüedad. `index.ts` reúne los minijuegos con `export *` y
 * cada uno declara su propio `NODE`, así que afuera del módulo se lo nombra así.
 */
export const NODE_FRAC_PARTS = NODE;

/**
 * Una fracción. Se guarda como par y nunca como cociente: `2/6` y `1/3` valen
 * lo mismo y no son la misma respuesta en este nodo, porque lo que se pregunta
 * es en cuántas partes se cortó y cuántas se tomaron.
 */
export interface FracValue {
  readonly num: number;
  readonly den: number;
}

export const fracValue = (f: FracValue): number => f.num / f.den;

/** Dos fracciones son la misma ficha cuando coinciden los dos numerales. */
export const sameFrac = (a: FracValue, b: FracValue): boolean =>
  a.num === b.num && a.den === b.den;

/**
 * Qué se pregunta en una ronda. No es dificultad: es qué gesto contesta.
 *
 * - `cut`: cortar el todo en partes iguales y encender las que pide la ficha.
 * - `pick`: varios todos cortados de formas distintas; tocar el que muestra la
 *   fracción exacta. Los distractores son los del diseño: partes desparejas,
 *   los dos numerales intercambiados y una parte de más.
 * - `draw`: sacar bolas del frasco y elegir la ficha que dice qué parte del
 *   total es de un color. Es el todo que no se corta.
 * - `which`: dos animaciones sobre las mismas dos barras; tocar la que suma
 *   cruzado. Es la única pregunta que clasifica una misconception.
 * - `share`: repartir barras en platos y elegir la ficha que le toca a cada uno.
 * - `pin`: clavar la ficha en la marca de la recta que le corresponde.
 * - `compare`: dos fracciones sin dibujo; tocar la más grande.
 * - `odd`: un todo que no es ni comida ni bolas —figuras giradas, un camino
 *   recorrido, un vaso lleno hasta cierta altura— y su ficha.
 */
export type FracAsk = "cut" | "pick" | "draw" | "which" | "share" | "pin" | "compare" | "odd";

/** Las etapas de desvanecimiento de `tiles` en E0. */
export type FracSkin = "loose_tiles" | "grid_rectangle" | "labeled_sides" | "product_notation";

/** Las etapas de desvanecimiento de `urn_dice` en E0. */
export type FracUrnSkin =
  | "physical_draws"
  | "tally_bars"
  | "fraction_of_total"
  | "probability_notation";

/**
 * Cómo se escribe la ficha. Hasta el nivel 4 el nodo es `literacy: none` y no
 * hay numerales: la ficha es una barra corta con puntos arriba y abajo.
 */
export type FracChip = "dots" | "numerals";

/**
 * La vía por la que se señala la parte cuando el todo no se corta. Es el
 * parámetro `part_marking` de `gen_arbitrary_whole`.
 */
export type FracMarking = "cut" | "fill" | "travel" | "figures";

/**
 * Lo único que endurece. La capa, la pregunta, las pieles y la ficha viven
 * afuera justamente para que la regla del diseño —un nivel cambia de capa o
 * endurece parámetros, nunca las dos cosas— se pueda comprobar con un test.
 */
export interface FracParams {
  /** El número de abajo: en cuántas partes iguales se corta el todo. */
  readonly parts: readonly [number, number];
  /** El número de arriba. Se acota al de abajo: acá no hay impropias. */
  readonly shaded: readonly [number, number];
  /**
   * Cuántos todos de distinto tamaño entran en juego. Con dos, la misma ficha
   * tiene que entrar en los dos: es la primera dificultad del nodo.
   */
  readonly wholes: number;
}

export interface FracLevel extends LevelBase {
  readonly params: FracParams;
  /** Qué pide cada ronda, ciclando. Un nivel con dos preguntas alterna. */
  readonly asks: readonly FracAsk[];
  readonly skin: FracSkin;
  readonly urnSkin: FracUrnSkin;
  readonly chip: FracChip;
  /** El libro de cuentas debajo del todo: una ficha por parte encendida. */
  readonly ledger: boolean;
  /** El todo se dibuja como disco con radios y no como barra. */
  readonly disc: boolean;
  /** La barra se pide con un toque en vez de estar dibujada. */
  readonly barOnDemand: boolean;
  /** La recta del nodo 7 aparece debajo y la fracción se clava en ella. */
  readonly line: boolean;
  /** La definición corta con voz. Solo en `formal`. */
  readonly definition: boolean;
}

/**
 * Los ocho niveles del documento. Cada uno cambia la capa o endurece los
 * parámetros, nunca las dos cosas:
 *
 * 1 → 2 endurece (entran varias partes encendidas y el disco), 2 → 3 no toca
 * nada y cambia lo que se pregunta —el frasco es un todo que no se corta—,
 * 3 → 4 y 4 → 5 cambian de capa con los mismos parámetros, 5 → 6 y 6 → 7
 * endurecen sin moverse de `symbolic`, y 7 → 8 se lleva el nodo a `formal` sin
 * tocar los parámetros.
 */
export const FRAC_LEVELS: readonly FracLevel[] = [
  {
    n: 1,
    titleKey: "level.cutEven",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 3,
    params: { parts: [2, 4], shaded: [1, 1], wholes: 1 },
    asks: ["cut"],
    skin: "loose_tiles",
    urnSkin: "physical_draws",
    chip: "dots",
    ledger: true,
    disc: false,
    barOnDemand: false,
    line: false,
    definition: false,
  },
  {
    n: 2,
    titleKey: "level.lightSeveral",
    layer: "concrete",
    evidence: ["recognize"],
    rounds: 4,
    params: { parts: [2, 6], shaded: [1, 5], wholes: 1 },
    asks: ["pick"],
    skin: "loose_tiles",
    urnSkin: "physical_draws",
    chip: "dots",
    ledger: true,
    disc: true,
    barOnDemand: false,
    line: false,
    definition: false,
  },
  {
    n: 3,
    titleKey: "level.theJar",
    layer: "concrete",
    evidence: ["manipulate", "apply"],
    rounds: 4,
    params: { parts: [2, 6], shaded: [1, 5], wholes: 1 },
    asks: ["draw"],
    skin: "loose_tiles",
    urnSkin: "physical_draws",
    chip: "dots",
    ledger: true,
    disc: false,
    barOnDemand: false,
    line: false,
    definition: false,
  },
  {
    n: 4,
    titleKey: "level.barsAndOutlines",
    layer: "visual",
    evidence: ["explain", "manipulate"],
    rounds: 4,
    params: { parts: [2, 6], shaded: [1, 5], wholes: 1 },
    asks: ["which", "cut"],
    skin: "grid_rectangle",
    urnSkin: "tally_bars",
    chip: "dots",
    ledger: true,
    disc: false,
    barOnDemand: false,
    line: false,
    definition: false,
  },
  {
    n: 5,
    titleKey: "level.chipsBesideTheBar",
    layer: "symbolic",
    evidence: ["manipulate"],
    rounds: 4,
    params: { parts: [2, 6], shaded: [1, 5], wholes: 1 },
    asks: ["cut"],
    skin: "labeled_sides",
    urnSkin: "fraction_of_total",
    chip: "numerals",
    ledger: true,
    disc: false,
    barOnDemand: false,
    line: false,
    definition: false,
  },
  {
    n: 6,
    titleKey: "level.theSharing",
    layer: "symbolic",
    evidence: ["apply"],
    rounds: 4,
    params: { parts: [2, 6], shaded: [1, 5], wholes: 2 },
    asks: ["share"],
    skin: "labeled_sides",
    urnSkin: "fraction_of_total",
    chip: "numerals",
    ledger: false,
    disc: false,
    barOnDemand: false,
    line: false,
    definition: false,
  },
  {
    n: 7,
    titleKey: "level.theLineAlone",
    layer: "symbolic",
    evidence: ["apply", "generalize"],
    rounds: 4,
    params: { parts: [2, 12], shaded: [1, 11], wholes: 2 },
    asks: ["pin", "compare"],
    skin: "product_notation",
    urnSkin: "fraction_of_total",
    chip: "numerals",
    ledger: false,
    disc: false,
    barOnDemand: true,
    line: true,
    definition: false,
  },
  {
    n: 8,
    titleKey: "level.wholesNeverSeen",
    layer: "formal",
    evidence: ["generalize"],
    rounds: 4,
    params: { parts: [2, 12], shaded: [1, 11], wholes: 2 },
    asks: ["odd"],
    skin: "product_notation",
    urnSkin: "probability_notation",
    chip: "numerals",
    ledger: false,
    disc: false,
    barOnDemand: true,
    line: false,
    definition: true,
  },
];

/**
 * Un todo, ya cortado o sin cortar. `span` es cuánto mide respecto del ancho
 * disponible: dos todos de distinto largo con la misma ficha son la prueba de
 * que la fracción no es una cantidad.
 */
export interface FracWhole {
  readonly id: string;
  /** En cuántas partes está cortado. 0: todavía sin cortar. */
  readonly parts: number;
  readonly shaded: number;
  /** Las partes son iguales. Falso solo en distractores. */
  readonly even: boolean;
  readonly span: number;
  readonly disc: boolean;
  /** Es el que hay que tocar, cuando la pregunta se contesta tocando un todo. */
  readonly correct: boolean;
  /** Por qué este todo está en pantalla, si no es el correcto. */
  readonly lure?: FracLure;
}

/**
 * Una ficha o un todo para elegir. Los equivocados no son ruido: cada uno es un
 * error que el diseño prevé.
 *
 * - `added_across`: sumar los de arriba entre sí y los de abajo entre sí. Es la
 *   única que clasifica, como `fraction_add_across`.
 * - `swapped`: los dos numerales intercambiados, que es leerlos por separado.
 * - `uneven_parts`: contar pedazos en vez de partes iguales.
 * - `one_more_part`: una parte de más, que es puntería y no una idea.
 * - `bigger_denominator`: creer que más partes es más grande.
 * - `wrong_whole`: el todo cambió de tamaño y la fracción no.
 */
export type FracLure =
  | "added_across"
  | "swapped"
  | "uneven_parts"
  | "one_more_part"
  | "bigger_denominator"
  | "wrong_whole";

export interface FracOption {
  readonly id: string;
  readonly value: FracValue;
  readonly correct: boolean;
  readonly lure?: FracLure;
}

export interface FracProblem {
  readonly ask: FracAsk;
  /** La fracción que la ronda pide. */
  readonly target: FracValue;
  /** Los todos en pantalla. El primero es con el que se juega. */
  readonly wholes: readonly FracWhole[];
  /** El frasco: cuántas bolas de cada color. Vacío fuera de `draw`. */
  readonly urn: readonly number[];
  /** Qué color nombra la ficha. */
  readonly highlighted: number;
  /** El frasco se llena al doble con la misma mezcla y la ficha no se mueve. */
  readonly refill: boolean;
  /** El reparto: cuántas barras entre cuántos platos. */
  readonly bars: number;
  readonly plates: number;
  /** Las marcas de la recta, del cero al uno. 0: no hay recta. */
  readonly ticks: number;
  /** Las dos fracciones que el jugador ve juntar en `which`. */
  readonly addends: readonly [FracValue, FracValue];
  /** Cuál de las dos animaciones suma cruzado: la que hay que tocar. */
  readonly liar: number;
  /** Cómo se señala la parte cuando el todo no se corta. */
  readonly marking: FracMarking;
  readonly options: readonly FracOption[];
}

/** Todos montados siempre, para que el árbol de la escena no cambie entre rondas. */
export const FRAC_WHOLE_SLOTS = 4;
/** Fichas montadas siempre, por la misma razón. */
export const FRAC_OPTION_SLOTS = 4;
/** Bolas montadas siempre. Con el relleno el frasco llega al doble. */
export const FRAC_BALL_SLOTS = 24;
/** Hasta dónde se puede cortar un todo. Más líneas no se leen de un vistazo. */
export const FRAC_MAX_PARTS = 12;

/**
 * Genera una ronda. La semilla la hace reproducible; la ronda decide cuál de
 * las preguntas del nivel toca, porque un nivel con dos preguntas tiene que
 * alternarlas y no sortearlas: sorteadas, cuatro rondas pueden no dar nunca
 * evidencia de uno de los dos verbos.
 */
export function generateFractions(level: FracLevel, seed: number, round = 0): FracProblem {
  const rnd = makeRandom(seed);
  const asks = level.asks;
  const ask = (asks[round % asks.length] ?? asks[0]) as FracAsk;
  const target = pickTarget(level.params, ask, rnd);

  switch (ask) {
    case "pick":
      return pickProblem(target, rnd);
    case "draw":
      return drawProblem(target, rnd, round);
    case "which":
      return crossProblem(level, rnd);
    case "share":
      return shareProblem(rnd);
    case "pin":
      return pinProblem(level, target, rnd);
    case "compare":
      return compareProblem(target, rnd);
    case "odd":
      return oddProblem(target, rnd, round);
    default:
      return cutProblem(level, target, rnd);
  }
}

/**
 * La fracción de la ronda. El de abajo sale del rango del nivel y el de arriba
 * nunca lo alcanza: con los dos iguales la fracción es el todo, que es un caso
 * del diseño y no un ejercicio de cortar.
 */
function pickTarget(p: FracParams, ask: FracAsk, rnd: Random): FracValue {
  const den = rnd.int(p.parts[0], p.parts[1]);
  const maxNum = Math.min(p.shaded[1], den - 1);
  const num = Math.max(p.shaded[0], Math.min(maxNum, rnd.int(p.shaded[0], maxNum)));
  // El disco con doce radios no se distingue de uno con once: la pregunta que
  // se contesta mirando necesita cortes que se cuenten de un vistazo.
  if (ask === "pick" && den > 8) return { num: Math.min(num, 7), den: 8 };
  return { num: Math.max(1, num), den };
}

/** Cortar y encender. El todo llega entero: el corte es todo el ejercicio. */
function cutProblem(level: FracLevel, target: FracValue, rnd: Random): FracProblem {
  const spans = wholeSpans(level, rnd);
  return {
    ...empty(),
    ask: "cut",
    target,
    wholes: spans.map((span, i) => ({
      id: `w${i}`,
      parts: 0,
      shaded: 0,
      even: true,
      span,
      disc: level.disc,
      correct: i === 0,
    })),
  };
}

/** Varios todos cortados de formas distintas; uno muestra la fracción exacta. */
function pickProblem(target: FracValue, rnd: Random): FracProblem {
  const wholes: FracWhole[] = [
    { id: "w0", parts: target.den, shaded: target.num, even: true, span: 1, disc: true, correct: true },
  ];
  const push = (parts: number, shaded: number, even: boolean, lure: FracLure): void => {
    if (wholes.length >= FRAC_WHOLE_SLOTS) return;
    if (parts < 2 || parts > FRAC_MAX_PARTS || shaded < 0 || shaded > parts) return;
    if (wholes.some((w) => w.parts === parts && w.shaded === shaded && w.even === even)) return;
    wholes.push({
      id: `w${wholes.length}`,
      parts,
      shaded,
      even,
      span: 1,
      disc: true,
      correct: false,
      lure,
    });
  };
  // Los tres distractores del diseño, en su orden: partes desparejas, los dos
  // numerales leídos al revés y una porción de más.
  //
  // El intercambio literal de los dos numerales no se puede dibujar en un
  // disco: `4/5` dado vuelta es `5/4`, que no entra en un todo. Lo que se
  // dibuja es el mismo error visto desde el dibujo —contar las porciones que
  // quedaron afuera en vez de las tomadas—, que es la forma que toma leer los
  // dos números por separado cuando hay un disco delante.
  push(target.den, target.num, false, "uneven_parts");
  push(target.den, target.den - target.num, true, "swapped");
  push(target.den, target.num + 1, true, "one_more_part");
  push(target.den + 1, target.num, true, "one_more_part");

  return { ...empty(), ask: "pick", target, wholes: rnd.shuffle(wholes) };
}

/**
 * El frasco. La composición no se sortea libre: el color resaltado tiene que
 * dar exactamente la fracción pedida, porque lo que se aprende es que el todo
 * es el frasco y no la columna más alta.
 */
function drawProblem(target: FracValue, rnd: Random, round: number): FracProblem {
  // Un frasco de doce bolas ya no se cuenta de un vistazo, y el nodo pide
  // contar el total: el de abajo se acota aunque el parámetro sea más grande.
  const den = Math.min(target.den, 8);
  const num = Math.max(1, Math.min(target.num, den - 1));
  const value: FracValue = { num, den };
  const urn = [num, den - num];
  // El invariante `proportion_stable_in_long_run` se juega una vez por nivel:
  // el frasco se llena al doble con la misma mezcla y la ficha no se mueve.
  const refill = round === 1;
  return {
    ...empty(),
    ask: "draw",
    target: value,
    urn,
    highlighted: 0,
    refill,
    options: fractionOptions(value, rnd, ["swapped", "wrong_whole", "one_more_part"]),
    wholes: [],
  };
}

/**
 * La suma cruzada. Las dos barras se juntan y el jugador elige cuál de las dos
 * animaciones es la que suma los de arriba entre sí y los de abajo entre sí.
 */
function crossProblem(level: FracLevel, rnd: Random): FracProblem {
  const p = level.params;
  const den = rnd.int(Math.max(2, p.parts[0]), Math.min(6, p.parts[1]));
  const other = den === 2 ? 3 : den - 1;
  const a: FracValue = { num: 1, den };
  const b: FracValue = { num: 1, den: other };
  const across: FracValue = { num: a.num + b.num, den: a.den + b.den };
  const right: FracValue = { num: a.num * b.den + b.num * a.den, den: a.den * b.den };
  const liar = rnd.bool() ? 0 : 1;
  // Tocar la animación que suma cruzado es acertar: lo que se pide es señalar
  // el error. Quien toca la otra está diciendo que cruzar estaba bien, y esa
  // elección es la que clasifica.
  const options: FracOption[] = [0, 1].map((i) => {
    const value = i === liar ? across : right;
    return i === liar
      ? { id: `o${i}`, value, correct: true }
      : { id: `o${i}`, value, correct: false, lure: "added_across" as const };
  });
  return {
    ...empty(),
    ask: "which",
    target: right,
    addends: [a, b],
    liar,
    wholes: [
      { id: "w0", parts: a.den, shaded: a.num, even: true, span: 1, disc: false, correct: false },
      { id: "w1", parts: b.den, shaded: b.num, even: true, span: 1, disc: false, correct: false },
    ],
    options,
  };
}

/**
 * El reparto en platos. Tres barras entre cuatro platos dan la misma ficha que
 * una barra cortada en cuatro con tres encendidas: es `fraction_as_division`.
 */
function shareProblem(rnd: Random): FracProblem {
  const plates = rnd.int(2, 5);
  const bars = rnd.int(1, plates - 1);
  const value: FracValue = { num: bars, den: plates };
  return {
    ...empty(),
    ask: "share",
    target: value,
    bars,
    plates,
    wholes: Array.from({ length: bars }, (_, i) => ({
      id: `w${i}`,
      parts: plates,
      shaded: 0,
      even: true,
      span: 1,
      disc: false,
      correct: i === 0,
    })),
    options: fractionOptions(value, rnd, ["swapped", "one_more_part", "bigger_denominator"]),
  };
}

/** Clavar la ficha en la recta. La barra está, pero hay que pedirla. */
function pinProblem(level: FracLevel, target: FracValue, rnd: Random): FracProblem {
  const spans = wholeSpans(level, rnd);
  return {
    ...empty(),
    ask: "pin",
    target,
    ticks: target.den,
    wholes: spans.map((span, i) => ({
      id: `w${i}`,
      parts: target.den,
      shaded: target.num,
      even: true,
      span,
      disc: false,
      correct: i === 0,
    })),
  };
}

/**
 * Comparar dos fracciones sin dibujo. El distractor es el orden invertido: el
 * de abajo más grande leído como la fracción más grande.
 */
function compareProblem(target: FracValue, rnd: Random): FracProblem {
  const a = target;
  // La rival comparte el de arriba y cambia el de abajo: así la única manera de
  // decidir es pensar el tamaño de la parte.
  const den = a.den + rnd.int(1, 4);
  const b: FracValue = { num: a.num, den: Math.min(FRAC_MAX_PARTS + 4, den) };
  const bigger = fracValue(a) >= fracValue(b) ? a : b;
  const smaller = bigger === a ? b : a;
  const options: FracOption[] = [
    { id: "o0", value: bigger, correct: true },
    { id: "o1", value: smaller, correct: false, lure: "bigger_denominator" },
  ];
  return {
    ...empty(),
    ask: "compare",
    target: bigger,
    options: rnd.shuffle(options),
    wholes: [],
  };
}

/**
 * Un todo que no es ni comida ni bolas. Las tres vías de `gen_arbitrary_whole`
 * se recorren en orden y no se sortean: sorteadas, cuatro rondas pueden no
 * mostrar nunca el vaso, que es la que más se aleja del corte.
 */
function oddProblem(target: FracValue, rnd: Random, round: number): FracProblem {
  const markings: readonly FracMarking[] = ["figures", "travel", "fill"];
  const marking = markings[round % markings.length] as FracMarking;
  // Un vaso o un camino sin marcas de corte no se leen con doce partes: lo que
  // se pregunta es la parte, y para eso el todo tiene que caber en la vista.
  const den = marking === "figures" ? Math.min(target.den, 8) : Math.min(target.den, 6);
  const num = Math.max(1, Math.min(target.num, den - 1));
  const value: FracValue = { num, den };
  return {
    ...empty(),
    ask: "odd",
    target: value,
    marking,
    wholes: [
      {
        id: "w0",
        parts: den,
        shaded: num,
        even: true,
        span: 1,
        disc: false,
        correct: true,
      },
    ],
    options: fractionOptions(value, rnd, ["swapped", "wrong_whole", "bigger_denominator"]),
  };
}

/**
 * Las fichas para elegir. Cada distractor es un error del diseño y nunca un
 * número al azar: el jugador que se equivoca tiene que poder ver por qué.
 */
function fractionOptions(
  value: FracValue,
  rnd: Random,
  lures: readonly FracLure[],
): FracOption[] {
  const out: FracOption[] = [{ id: "o0", value, correct: true }];
  const push = (candidate: FracValue, lure: FracLure): void => {
    if (out.length >= FRAC_OPTION_SLOTS) return;
    if (candidate.den < 2 || candidate.num < 0 || candidate.num > candidate.den) return;
    if (out.some((o) => sameFrac(o.value, candidate))) return;
    out.push({ id: `o${out.length}`, value: candidate, correct: false, lure });
  };
  for (const lure of lures) {
    if (lure === "swapped") push({ num: value.den - value.num, den: value.den }, lure);
    // El todo cambiado de tamaño: la parte es la misma y el total no.
    else if (lure === "wrong_whole") push({ num: value.num, den: value.den + value.num }, lure);
    else if (lure === "one_more_part") push({ num: value.num + 1, den: value.den }, lure);
    else if (lure === "bigger_denominator") push({ num: value.num, den: value.den + 2 }, lure);
    else if (lure === "added_across") push({ num: value.num + 1, den: value.den + 1 }, lure);
  }
  // Si los errores previstos colisionaron entre sí, la ronda igual necesita más
  // de una ficha: la vecina es puntería y el diseño la admite como relleno.
  push({ num: Math.max(1, value.num - 1), den: value.den }, "one_more_part");
  push({ num: value.num, den: value.den + 1 }, "bigger_denominator");
  return rnd.shuffle(out);
}

/**
 * Cuánto mide cada todo. Con dos todos los largos son distintos a propósito: la
 * misma ficha tiene que entrar en los dos, y eso es lo que separa una relación
 * de una cantidad.
 */
function wholeSpans(level: FracLevel, rnd: Random): number[] {
  if (level.params.wholes < 2) return [1];
  const small = [0.55, 0.62, 0.7][rnd.int(0, 2)] as number;
  return [1, small];
}

/** El esqueleto de una ronda: lo que ninguna pregunta usa queda vacío. */
function empty(): FracProblem {
  return {
    ask: "cut",
    target: { num: 1, den: 2 },
    wholes: [],
    urn: [],
    highlighted: 0,
    refill: false,
    bars: 0,
    plates: 0,
    ticks: 0,
    addends: [
      { num: 1, den: 2 },
      { num: 1, den: 3 },
    ],
    liar: 0,
    marking: "cut",
    options: [],
  };
}

/**
 * El error del catálogo que este nodo puede clasificar, y el único. `L` declara
 * `fraction_add_across` sobre `arith.frac.parts_and_ratio` con patrón
 * `missing_piece_tiles`; ningún otro error del diseño tiene entrada apuntando
 * acá, así que ningún otro movimiento puede llevar `misconception`.
 */
export const FRAC_MISCONCEPTION = "fraction_add_across";

/** Qué error catalogado corresponde a una ficha, si hay alguno. */
export function fracMisconceptionFor(option: FracOption): string | undefined {
  return option.lure === "added_across" ? FRAC_MISCONCEPTION : undefined;
}

/**
 * Si el corte del jugador deja partes iguales. Es el invariante que el
 * minijuego ejecuta con la mano en vez de decirlo: sin partes iguales, contar
 * no significa nada y la barra no chasquea.
 */
export const fracEvenCut = (cuts: readonly number[], tolerance = 0.04): boolean => {
  if (cuts.length === 0) return true;
  const marks = [0, ...cuts, 1];
  const first = (marks[1] as number) - (marks[0] as number);
  for (let i = 1; i < marks.length; i++) {
    if (Math.abs((marks[i] as number) - (marks[i - 1] as number) - first) > tolerance) return false;
  }
  return true;
};

export const fracLevelByNumber = (n: number): FracLevel | undefined =>
  FRAC_LEVELS.find((l) => l.n === n);
export const TOTAL_FRAC_LEVELS = FRAC_LEVELS.length;

registerNode({
  id: NODE,
  n: 8,
  prereqs: ["arith.div.undo_mul"],
  levels: FRAC_LEVELS,
});

/** Las capas y los verbos que el nodo recorre, para los tests y el mapa. */
export const FRAC_LAYERS: readonly Layer[] = ["concrete", "visual", "symbolic", "formal"];
export const FRAC_EVIDENCE: readonly Evidence[] = [
  "recognize",
  "explain",
  "manipulate",
  "apply",
  "generalize",
];
