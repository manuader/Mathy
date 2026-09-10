/**
 * Cajas en el libro de cuentas, para `prealg.var.unknown_as_box`.
 *
 * Los siete niveles y qué endurece cada parámetro salen del documento del
 * minijuego y de `D1/10`, no de acá: este archivo los implementa, no los decide.
 *
 * La idea que sostiene todo: una caja cerrada es una cantidad que existe, es
 * fija y no se conoce. Por eso el cajón entra en una fila como cualquier otro
 * objeto sin que nadie lo abra, por eso dos cajones con la misma marca pesan lo
 * mismo, y por eso el número que queda adelante cuenta filas y no ordena
 * multiplicar un nombre. La letra no llega como definición: llega como la marca
 * que el cajón ya tenía pintada.
 *
 * Sin texto visible: el nodo es `literacy: none` y acá solo hay claves y datos.
 */

import { makeRandom, type Random } from "./random.ts";
import { registerNode, type LevelBase } from "./node.ts";
import type { Evidence, Layer } from "./one-step.ts";

/** El nodo del grafo que este minijuego enseña. */
export const NODE = "prealg.var.unknown_as_box";

/**
 * El mismo id, sin ambigüedad. `index.ts` reúne los minijuegos con `export *` y
 * cada uno declara su propio `NODE`, así que afuera del módulo se lo nombra así.
 */
export const NODE_UNKNOWN_BOX = NODE;

/**
 * Qué se pregunta en una ronda. No es dificultad: es qué gesto contesta.
 *
 * - `sort`: dejar cada objeto en la fila que le corresponde. Es la mecánica
 *   principal y la superficie de todos los niveles.
 * - `weigh`: poner manzanas en el otro plato hasta que la barra queda derecha.
 *   Así se conoce el peso de la marca sin abrir nada.
 * - `leaf`: arrastrar el cajón a la hoja vacía del árbol del nodo 9. El árbol
 *   queda completo aunque el valor de esa hoja siga sin conocerse.
 */
export type BoxAsk = "sort" | "weigh" | "leaf";

/**
 * Cómo dibuja el libro. Son las etapas de desvanecimiento de `ledger`: el
 * objeto, la barra segmentada con su conteo, y la ficha con la letra y el
 * coeficiente adelante.
 */
export type BoxSkin = "objects" | "bars" | "chips";

/**
 * La forma de un objeto. Las tres primeras son fruta suelta, `crate` es el
 * cajón cerrado, y las tres últimas son las figuras inventadas del último
 * nivel: objetos que no son ni cajas ni frutas.
 */
export type BoxShape = "apple" | "pear" | "grape" | "crate" | "wedge" | "ring" | "star";

/** Los operadores que arma el árbol de cofres del nodo 9. */
export type BoxOp = "+" | "×";

/**
 * Una clase de objeto: lo que una fila acepta. Dos objetos son de la misma
 * clase cuando comparten forma y marca, que es exactamente la regla que el
 * jugador siente cuando la fila devuelve lo que no corresponde.
 */
export interface BoxKind {
  readonly id: string;
  readonly shape: BoxShape;
  /** La marca pintada en la tapa, o -1 si el objeto no es un cajón. */
  readonly mark: number;
  /** Un cajón cerrado: se cuenta y se mueve, pero nadie sabe qué tiene. */
  readonly closed: boolean;
  /**
   * Lo que hay adentro. Es fijo mientras dure el problema, que es lo que separa
   * una incógnita de una entrada de máquina. Solo lo miran la balanza y el
   * cajón que se abre al final; el libro no lo necesita nunca.
   */
  readonly hidden: number;
  /**
   * El nombre que la marca recibe al volverse letra. Está desde el dato porque
   * la letra sale de la marca y no de una tabla aparte; el libro lo dibuja
   * recién cuando la piel es de fichas.
   */
  readonly letter: string;
  /** Cuántos objetos de esta clase hay que anotar. */
  readonly count: number;
}

/** Un objeto sobre el mostrador, esperando su fila. */
export interface BoxToken {
  readonly id: string;
  readonly kind: number;
}

/**
 * La medición. Cajones de una marca en un plato, manzanas en el otro: cuando la
 * barra queda derecha, el peso de la marca quedó dicho sin abrir nada. Entre
 * las columnas no hay ningún signo, porque la balanza mide y no afirma.
 */
export interface BoxWeigh {
  readonly kind: number;
  readonly crates: number;
  /** Cuántas manzanas nivelan la barra. Es `crates` por lo que hay adentro. */
  readonly target: number;
}

/**
 * Un nodo del árbol de cofres del nodo 9, aplanado. El padre viaja como índice
 * y los hijos quedan implícitos en el orden, que es lo que necesitan tanto el
 * dibujo como los tests: un árbol recursivo se compara peor.
 */
export interface BoxTreeNode {
  readonly id: string;
  /** El padre, o -1 en la raíz. */
  readonly parent: number;
  /** El operador de una rama, o null en una hoja. */
  readonly op: BoxOp | null;
  /** El valor de una hoja conocida; null en la hoja vacía y en las ramas. */
  readonly value: number | null;
  /** La hoja donde va el cajón. Hay exactamente una por árbol. */
  readonly unknown: boolean;
}

export interface BoxProblem {
  readonly ask: BoxAsk;
  /** Las clases en juego. Las cerradas son las incógnitas. */
  readonly kinds: readonly BoxKind[];
  /** Los objetos sueltos, mezclados: llegan como llegan al mostrador. */
  readonly tokens: readonly BoxToken[];
  /** Cuántas filas tiene el libro. Empiezan todas vacías y sin dueño. */
  readonly rows: number;
  /** La medición, o null fuera del nivel que la usa. */
  readonly weigh: BoxWeigh | null;
  /** El árbol, o vacío fuera del nivel que lo usa. */
  readonly tree: readonly BoxTreeNode[];
}

/**
 * Lo único que endurece. La piel, las figuras inventadas y la definición viven
 * afuera justamente para que la regla del diseño —un nivel cambia de capa o
 * endurece parámetros, nunca las dos cosas— se pueda comprobar con un test.
 */
export interface BoxParams {
  /** Cuántas clases distintas hay sobre el mostrador. */
  readonly kinds: number;
  /**
   * Cuántas de esas clases son cajones cerrados con marca. Cero es un
   * mostrador sin ninguna incógnita, que es donde empieza el nodo.
   */
  readonly marks: number;
  /** Cuántos objetos puede tener una fila. Los conteos altos se cuentan y no se ven. */
  readonly counts: readonly [number, number];
}

export interface BoxLevel extends LevelBase {
  readonly params: BoxParams;
  /** Qué pide cada ronda, ciclando. Un nivel con dos preguntas alterna. */
  readonly asks: readonly BoxAsk[];
  readonly skin: BoxSkin;
  /**
   * El mostrador deja de tener fruta y cajones: todo son figuras inventadas y
   * todas son incógnitas. Es la última variante sin ayuda visual del diseño, y
   * no toca `params` a propósito: cambiar de capa y endurecer a la vez está
   * prohibido, y este nivel ya cambia de capa.
   */
  readonly arbitrary: boolean;
  /** El cajón se abre al final, para comprobar que había lo que la balanza decía. */
  readonly openCrate: boolean;
  /** La definición corta con voz. Solo en `formal`. */
  readonly definition: boolean;
}

/**
 * Los siete niveles del documento. Cada uno cambia la capa o endurece los
 * parámetros, nunca las dos cosas:
 *
 * 1 → 2 endurece (entra el cajón cerrado), 2 → 3 no toca nada y cambia lo que
 * se pregunta —la balanza es un instrumento y no una afirmación—, 3 → 4
 * endurece (llega la segunda marca), y 4 → 5, 5 → 6 y 6 → 7 cambian de capa con
 * los mismos parámetros.
 */
export const BOX_LEVELS: readonly BoxLevel[] = [
  {
    n: 1,
    titleKey: "level.eachInItsRow",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 3,
    params: { kinds: 2, marks: 0, counts: [2, 3] },
    asks: ["sort"],
    skin: "objects",
    arbitrary: false,
    openCrate: false,
    definition: false,
  },
  {
    n: 2,
    titleKey: "level.theBoxIsARowToo",
    layer: "concrete",
    evidence: ["recognize", "manipulate"],
    rounds: 3,
    params: { kinds: 3, marks: 1, counts: [2, 3] },
    asks: ["sort"],
    skin: "objects",
    arbitrary: false,
    openCrate: false,
    definition: false,
  },
  {
    n: 3,
    titleKey: "level.howMuchWithoutOpening",
    layer: "concrete",
    evidence: ["apply"],
    rounds: 3,
    params: { kinds: 3, marks: 1, counts: [2, 3] },
    asks: ["weigh"],
    skin: "objects",
    arbitrary: false,
    openCrate: true,
    definition: false,
  },
  {
    n: 4,
    titleKey: "level.twoMarks",
    layer: "concrete",
    evidence: ["explain", "manipulate"],
    rounds: 3,
    params: { kinds: 3, marks: 2, counts: [2, 4] },
    asks: ["sort"],
    skin: "objects",
    arbitrary: false,
    openCrate: false,
    definition: false,
  },
  {
    n: 5,
    titleKey: "level.barsAndCounts",
    layer: "visual",
    evidence: ["manipulate"],
    rounds: 4,
    params: { kinds: 3, marks: 2, counts: [2, 4] },
    asks: ["sort", "leaf"],
    skin: "bars",
    arbitrary: false,
    openCrate: false,
    definition: false,
  },
  {
    n: 6,
    titleKey: "level.lettersBeside",
    layer: "symbolic",
    evidence: ["manipulate", "apply"],
    rounds: 3,
    params: { kinds: 3, marks: 2, counts: [2, 4] },
    asks: ["sort"],
    skin: "chips",
    arbitrary: false,
    openCrate: false,
    definition: false,
  },
  {
    n: 7,
    titleKey: "level.marksNeverSeen",
    layer: "formal",
    evidence: ["generalize"],
    rounds: 3,
    params: { kinds: 3, marks: 2, counts: [2, 4] },
    asks: ["sort"],
    skin: "chips",
    arbitrary: true,
    openCrate: false,
    definition: true,
  },
];

/** Filas montadas siempre, para que el árbol de la escena no cambie entre rondas. */
export const BOX_ROW_SLOTS = 4;
/** Objetos montados siempre, por la misma razón. */
export const BOX_TOKEN_SLOTS = 12;
/** Nodos del árbol montados siempre. Cinco son los que arma el generador. */
export const BOX_TREE_SLOTS = 5;

/**
 * Las letras que hay. Salen del atlas de glifos, que es de dónde salen todos
 * los símbolos del juego: una letra que el atlas no tiene deja un hueco.
 */
export const BOX_LETTERS: readonly string[] = ["x", "y", "a", "b"];

const FRUIT: readonly BoxShape[] = ["apple", "pear", "grape"];
const FIGURES: readonly BoxShape[] = ["wedge", "ring", "star"];

/**
 * Genera una ronda. La semilla la hace reproducible; la ronda decide cuál de
 * las preguntas del nivel toca, porque un nivel con dos preguntas tiene que
 * alternarlas y no sortearlas: sorteadas, cuatro rondas pueden no dar nunca
 * evidencia de las dos cosas.
 */
export function generateUnknownBox(level: BoxLevel, seed: number, round = 0): BoxProblem {
  const rnd = makeRandom(seed);
  const asks = level.asks;
  const ask = (asks[round % asks.length] ?? asks[0]) as BoxAsk;
  const kinds = makeKinds(level, ask, rnd);

  if (ask === "weigh") return weighProblem(kinds, rnd);
  if (ask === "leaf") return leafProblem(kinds, rnd);
  return sortProblem(kinds, rnd);
}

/**
 * Las clases sobre el mostrador. Las cerradas son las incógnitas: cuántas hay
 * lo dice el parámetro, salvo en el nivel de las figuras inventadas, donde no
 * queda nada abierto y todas se nombran con una letra.
 */
function makeKinds(level: BoxLevel, ask: BoxAsk, rnd: Random): BoxKind[] {
  const p = level.params;
  const total = ask === "leaf" ? Math.min(p.kinds, 2) : p.kinds;
  const cerradas = level.arbitrary ? total : Math.min(p.marks, total);
  const formas = level.arbitrary ? FIGURES : FRUIT;
  const out: BoxKind[] = [];
  for (let i = 0; i < total; i++) {
    const closed = i < cerradas;
    // Con figuras inventadas la marca es la figura misma: no hay tapa donde
    // pintar nada, y por eso lo que distingue una clase de otra es la forma.
    const shape =
      closed && !level.arbitrary ? "crate" : ((formas[i % formas.length] ?? "apple") as BoxShape);
    out.push({
      id: `k${i}`,
      shape,
      mark: closed ? i : -1,
      closed,
      // Una caja puede valer cero sin dejar de ser caja, pero no en la balanza:
      // un plato vacío del lado de los cajones no mide nada.
      hidden: closed ? rnd.int(2, 4) : 0,
      letter: closed ? ((BOX_LETTERS[i % BOX_LETTERS.length] as string) ?? "x") : "",
      count: rnd.int(p.counts[0], p.counts[1]),
    });
  }
  return out;
}

/** Dejar cada cosa en su fila. El libro tiene una fila por clase, y ninguna más. */
function sortProblem(kinds: readonly BoxKind[], rnd: Random): BoxProblem {
  // El mostrador no puede pedir más objetos que ranuras montadas, y el conteo
  // de la clase tiene que seguir diciendo cuántos van a llegar: se recorta el
  // conteo, no la lista, o el libro nunca se completaría.
  const recortadas: BoxKind[] = [];
  let quedan = BOX_TOKEN_SLOTS;
  for (const k of kinds) {
    const count = Math.max(1, Math.min(k.count, quedan - (kinds.length - recortadas.length - 1)));
    quedan -= count;
    recortadas.push({ ...k, count });
  }

  const tokens: BoxToken[] = [];
  for (let k = 0; k < recortadas.length; k++) {
    const kind = recortadas[k] as BoxKind;
    for (let i = 0; i < kind.count; i++) tokens.push({ id: `t${k}_${i}`, kind: k });
  }
  return {
    ask: "sort",
    kinds: recortadas,
    // Mezclados: si llegaran ordenados, la fila se acierta por posición y no
    // por identidad, que es justo lo que el nodo evalúa.
    tokens: rnd.shuffle(tokens),
    rows: recortadas.length,
    weigh: null,
    tree: [],
  };
}

/**
 * La medición. Los cajones ya están en el plato; lo que el jugador pone son las
 * manzanas del otro lado, y sobran dos para que pasarse sea posible.
 */
function weighProblem(kinds: readonly BoxKind[], rnd: Random): BoxProblem {
  const kind = kinds.findIndex((k) => k.closed);
  const cerrada = kinds[Math.max(0, kind)] as BoxKind;
  const crates = rnd.int(1, 2);
  const target = crates * cerrada.hidden;
  // Una manzana es una manzana: la clase abierta que tenga el mostrador es la
  // que va al otro plato, y por eso las pesas no son una clase nueva.
  const suelta = Math.max(0, kinds.findIndex((k) => !k.closed));
  const tokens: BoxToken[] = Array.from({ length: Math.min(target + 2, BOX_TOKEN_SLOTS) }, (_, i) => ({
    id: `w${i}`,
    kind: suelta,
  }));
  return {
    ask: "weigh",
    kinds,
    tokens,
    rows: kinds.length,
    weigh: { kind: Math.max(0, kind), crates, target },
    tree: [],
  };
}

/** La hoja vacía del árbol del nodo 9. El cajón la ocupa sin abrirse. */
function leafProblem(kinds: readonly BoxKind[], rnd: Random): BoxProblem {
  const kind = Math.max(0, kinds.findIndex((k) => k.closed));
  return {
    ask: "leaf",
    kinds,
    tokens: [{ id: "leaf0", kind }],
    rows: kinds.length,
    weigh: null,
    tree: makeTree(rnd),
  };
}

/**
 * El árbol. Tres formas, y en cada una la incógnita cae en un lugar distinto:
 * hoja de la rama derecha, hoja profunda de la izquierda y hoja del fondo. Es
 * el `unknown_position` del generador del diseño, y es lo que rompe la lectura
 * "la incógnita está al final".
 */
function makeTree(rnd: Random): BoxTreeNode[] {
  const a = rnd.int(2, 5);
  const b = rnd.int(2, 5);
  const forma = rnd.int(0, 2);
  const leaf = (id: string, parent: number, value: number | null): BoxTreeNode => ({
    id,
    parent,
    op: null,
    value,
    unknown: value === null,
  });
  const branch = (id: string, parent: number, op: BoxOp): BoxTreeNode => ({
    id,
    parent,
    op,
    value: null,
    unknown: false,
  });

  // `a × (□ + b)`
  if (forma === 0) {
    return [
      branch("n0", -1, "×"),
      leaf("n1", 0, a),
      branch("n2", 0, "+"),
      leaf("n3", 2, null),
      leaf("n4", 2, b),
    ];
  }
  // `(□ + a) × b`
  if (forma === 1) {
    return [
      branch("n0", -1, "×"),
      branch("n1", 0, "+"),
      leaf("n2", 1, null),
      leaf("n3", 1, a),
      leaf("n4", 0, b),
    ];
  }
  // `a + (b × □)`
  return [
    branch("n0", -1, "+"),
    leaf("n1", 0, a),
    branch("n2", 0, "×"),
    leaf("n3", 2, b),
    leaf("n4", 2, null),
  ];
}

/**
 * Si una fila acepta un objeto. Es toda la regla del libro: comparte forma y
 * marca, o la fila lo devuelve. No hay ningún otro criterio, y no hay cartel.
 */
export function boxRowAccepts(row: BoxKind | undefined, token: BoxKind | undefined): boolean {
  if (!row || !token) return false;
  return row.id === token.id;
}

/**
 * El error del catálogo que este nodo puede clasificar, y el único. `L` declara
 * `variable_as_label` sobre `prealg.var.unknown_as_box` con patrón
 * `replay_on_mechanic` sobre el `ledger`; ningún otro error del diseño tiene
 * entrada apuntando acá, así que ningún otro movimiento puede llevar
 * `misconception`.
 */
export const BOX_MISCONCEPTION = "variable_as_label";

/**
 * Qué error catalogado corresponde a un movimiento, si hay alguno.
 *
 * Juntar la fila de una marca con la de otra es tratar la letra como etiqueta
 * pegable: de `2x + 3y` sale `5xy`, que es exactamente el `detect` del
 * catálogo. Dejar una manzana en la fila de las peras es del mismo modo un
 * error, pero no es una idea equivocada sobre las letras: no está catalogado y
 * el `attempt` va sin campo.
 */
export function boxMisconceptionFor(
  row: BoxKind | undefined,
  token: BoxKind | undefined,
): string | undefined {
  if (!row || !token) return undefined;
  if (boxRowAccepts(row, token)) return undefined;
  return row.closed && token.closed ? BOX_MISCONCEPTION : undefined;
}

/**
 * El invariante del libro, `count_preserved_under_regrouping`: reagrupar no
 * cambia cuántos hay. Es lo que hace legítimo escribir `3x` en lugar de
 * `x + x + x`, y por eso la suma de los conteos de las filas tiene que ser
 * siempre la cantidad de objetos que llegaron al mostrador.
 */
export const boxTotal = (counts: readonly number[]): number =>
  counts.reduce((s, n) => s + n, 0);

/** Cuántas filas de cajones hay: cuántas incógnitas distintas están en juego. */
export const boxUnknowns = (kinds: readonly BoxKind[]): number =>
  kinds.filter((k) => k.closed).length;

export const boxLevelByNumber = (n: number): BoxLevel | undefined =>
  BOX_LEVELS.find((l) => l.n === n);
export const TOTAL_BOX_LEVELS = BOX_LEVELS.length;

registerNode({
  id: NODE,
  n: 10,
  prereqs: ["arith.expr.precedence_tree"],
  levels: BOX_LEVELS,
});

/** Las capas y los verbos que el nodo recorre, para los tests y el mapa. */
export const BOX_LAYERS: readonly Layer[] = ["concrete", "visual", "symbolic", "formal"];
export const BOX_EVIDENCE: readonly Evidence[] = [
  "recognize",
  "explain",
  "manipulate",
  "apply",
  "generalize",
];
