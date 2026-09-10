/**
 * Los cuencos de fruta, la mecánica de `found.count.cardinality`.
 *
 * Los seis niveles y qué endurece cada parámetro salen del documento del
 * minijuego, no de acá: este archivo los implementa, no los decide.
 *
 * La idea que sostiene todo: contar no es recitar nombres, es darle a una
 * colección un solo número que no cambia si las cosas se mueven. Por eso el
 * modelo no guarda "cuántas dijo el jugador" sino la colección entera, con la
 * clase y el tamaño de cada objeto: es lo único que permite mostrar que dos
 * piedras grandes no cuentan por cuatro chicas.
 *
 * Las capas y los verbos son los de `one-step.ts`, que es donde viven los tipos
 * compartidos del registro. Acá no hay ni una cadena visible: solo claves.
 */

import { makeRandom, type Random } from "./random.ts";
import { registerNode, type LevelBase } from "./node.ts";
import type { Evidence, Layer } from "./one-step.ts";

/** El nodo del grafo que este minijuego enseña. */
export const NODE = "found.count.cardinality";

/**
 * El mismo id con nombre propio. El barril del paquete junta varios minijuegos
 * y cada uno tiene su `NODE`, así que hacia afuera cada nodo se nombra entero.
 */
export const NODE_CARDINALITY = NODE;

/** La piel de los objetos. La fruta se retira recién en el último nivel. */
export type Skin = "fruit" | "pebble" | "shell" | "mark";

/** Cómo están puestas las cosas dentro del cuenco antes de que el jugador toque nada. */
export type Arrangement = "row" | "pile" | "scattered";

/**
 * Qué se hace en el nivel. No es dificultad: es qué gesto contesta la pregunta.
 *
 * - `pair`   emparejar los dos cuencos llevando cada objeto a su fila.
 * - `fill`   llenar un cuenco vacío desde la canasta hasta igualar la tarjeta.
 * - `lie`    elegir, entre dos reordenamientos, el que le cambia la tarjeta.
 * - `carry`  la colección se tapa y hay que llevarle su tarjeta a otro cuenco.
 * - `label`  poner la tarjeta correcta sobre una colección desparramada.
 */
export type CardinalityMode = "pair" | "fill" | "lie" | "carry" | "label";

/** Qué muestra la tarjeta: nada, puntos, o el numeral en el que los puntos se contraen. */
export type CardFace = "none" | "dots" | "numeral";

/**
 * Por qué una tarjeta equivocada está sobre la mesa.
 *
 * Ninguno tiene entrada en `misconceptions.yaml`: el nodo declara
 * `misconceptions: []` y el diseño los prevé sin catalogarlos. Por eso son
 * `lure` y no `misconception`, y por eso la actividad no los reporta como
 * error clasificado: si el playtest los muestra sistemáticos, se catalogan.
 */
export type CountLure = "miscount_by_one" | "miscount_by_two" | "regrouping_changes_count";

export interface CardinalityParams {
  /** Cuántas cosas puede tener una colección. */
  readonly count: readonly [number, number];
  /** Cuánto puede sobrarle a un cuenco frente al otro; cero es emparejar sin sobrante. */
  readonly difference: readonly [number, number];
  /** Cuántas clases de objeto pueden mezclarse; mezclar obliga a decidir qué se cuenta. */
  readonly kinds: number;
  /** Desparramar rompe la lectura "la fila larga es la que tiene más". */
  readonly arrangements: readonly Arrangement[];
  readonly skins: readonly Skin[];
  /** Tamaños distintos dentro de una colección: separa cantidad de espacio ocupado. */
  readonly sizeVariance: boolean;
  /** Barras de distinto grosor: la misma cantidad de marcas se ve distinta. */
  readonly barThickness: boolean;
  /** A qué distancia del número verdadero están las tarjetas que no son. */
  readonly distractorOffsets: readonly number[];
}

export interface CardinalityLevel extends LevelBase {
  readonly params: CardinalityParams;
  readonly mode: CardinalityMode;
  readonly card: CardFace;
  /** La canasta de donde salen más objetos. */
  readonly basket: boolean;
}

/** Una colección: el cuenco con lo que tiene adentro. */
export interface Bowl {
  readonly id: string;
  readonly skin: Skin;
  readonly arrangement: Arrangement;
  /** El número de la colección. Es lo que el nodo enseña a nombrar. */
  readonly count: number;
  /** La clase de cada objeto, para que el cuenco pueda venir mezclado. */
  readonly kinds: readonly number[];
  /** El tamaño relativo de cada objeto, de 0.7 a 1.3. */
  readonly sizes: readonly number[];
  /** El grosor de la barra en la que la fila se aplana. */
  readonly thickness: number;
}

/**
 * Una tarjeta. `correct` dice si el número que muestra es el verdadero de la
 * colección, y eso vale en todos los modos; en `lie` la respuesta del jugador
 * es justamente la que no lo es, y para eso está `lying`.
 */
export interface DotCard {
  readonly id: string;
  readonly value: number;
  readonly correct: boolean;
  readonly lure?: CountLure;
}

export interface CardinalityProblem {
  readonly mode: CardinalityMode;
  /** Uno o dos cuencos. El segundo aparece solo cuando hay algo con qué emparejar. */
  readonly bowls: readonly Bowl[];
  /**
   * El número que el problema pide nombrar: en `pair` cuántos sobran, en `fill`
   * cuántos pide la tarjeta objetivo, y en los demás cuántos tiene la colección.
   */
  readonly target: number;
  readonly cards: readonly DotCard[];
  /** En `lie`, cuál de los dos reordenamientos le cambia la tarjeta al cuenco. */
  readonly lying: number;
  /** Cuántos objetos ofrece la canasta. Siempre sobran: hay que saber cuándo parar. */
  readonly basket: number;
}

const FRUIT_ONLY: readonly Skin[] = ["fruit"];
const ROW_OR_PILE: readonly Arrangement[] = ["row", "pile"];
const ANY_ARRANGEMENT: readonly Arrangement[] = ["row", "pile", "scattered"];

/** Los parámetros de los cuatro primeros niveles: cantidades chicas, una sola clase. */
const SUAVE: CardinalityParams = {
  count: [1, 4],
  difference: [1, 2],
  kinds: 1,
  arrangements: ROW_OR_PILE,
  skins: FRUIT_ONLY,
  sizeVariance: false,
  barThickness: false,
  distractorOffsets: [-1, 1],
};

/** Cantidades mayores, mezcla de clases y desparramo: ya no se reconoce de un vistazo. */
const DURO: CardinalityParams = {
  count: [3, 9],
  difference: [0, 3],
  kinds: 3,
  arrangements: ANY_ARRANGEMENT,
  skins: FRUIT_ONLY,
  sizeVariance: false,
  barThickness: false,
  distractorOffsets: [-2, -1, 1, 2],
};

/** Sin fruta: la analogía ya no hace nada y el tamaño deja de decir cantidad. */
const SIN_FRUTA: CardinalityParams = {
  ...DURO,
  skins: ["fruit", "pebble", "shell", "mark"],
  sizeVariance: true,
  barThickness: true,
};

/**
 * Los seis niveles. Cada uno cambia la capa o endurece los parámetros, nunca
 * las dos cosas, que es la regla del documento del minijuego. Lo que cambia
 * solo el gesto —el modo, la cara de la tarjeta, la canasta— no cuenta como
 * endurecer: son la superficie, no la dificultad.
 */
export const CARDINALITY_LEVELS: readonly CardinalityLevel[] = [
  {
    n: 1,
    titleKey: "level.onePairPerFruit",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 4,
    params: SUAVE,
    mode: "pair",
    card: "none",
    basket: false,
  },
  {
    n: 2,
    titleKey: "level.tickAndCard",
    layer: "concrete",
    evidence: ["recognize", "manipulate"],
    rounds: 5,
    params: SUAVE,
    mode: "fill",
    card: "dots",
    basket: true,
  },
  {
    n: 3,
    titleKey: "level.movingChangesNothing",
    layer: "concrete",
    evidence: ["explain"],
    rounds: 4,
    params: SUAVE,
    mode: "lie",
    card: "dots",
    basket: false,
  },
  {
    n: 4,
    titleKey: "level.cardTravels",
    layer: "visual",
    evidence: ["apply"],
    rounds: 5,
    params: SUAVE,
    mode: "carry",
    card: "numeral",
    basket: false,
  },
  {
    n: 5,
    titleKey: "level.moreFruitMoreMix",
    layer: "visual",
    evidence: ["apply"],
    rounds: 5,
    params: DURO,
    mode: "pair",
    card: "numeral",
    basket: false,
  },
  {
    n: 6,
    titleKey: "level.pebblesShellsMarks",
    layer: "visual",
    evidence: ["generalize"],
    rounds: 5,
    params: SIN_FRUTA,
    mode: "label",
    card: "numeral",
    basket: false,
  },
];

/** Cuántas tarjetas se ofrecen cuando el jugador tiene que elegir una. */
const CARD_CHOICES = 3;

/** Genera un problema del nivel dado. La semilla lo hace reproducible. */
export function generateCardinality(level: CardinalityLevel, seed: number): CardinalityProblem {
  const rnd = makeRandom(seed);
  const p = level.params;
  const [lo, hi] = p.count;
  const skin = rnd.pick(p.skins);

  if (level.mode === "pair") {
    const [dLo, dHi] = p.difference;
    const d = rnd.int(dLo, Math.min(dHi, hi - lo));
    const chico = rnd.int(lo, hi - d);
    const grande = chico + d;
    // De qué lado sobra se sortea: si sobrara siempre a la izquierda, el
    // jugador contestaría por costumbre y no por emparejar.
    const izqGrande = rnd.bool();
    const a = izqGrande ? grande : chico;
    const b = izqGrande ? chico : grande;
    return {
      mode: "pair",
      bowls: [makeBowl("a", a, p, skin, rnd), makeBowl("b", b, p, skin, rnd)],
      target: d,
      cards:
        level.card === "none"
          ? []
          : [
              { id: "a", value: a, correct: true },
              { id: "b", value: b, correct: true },
            ],
      lying: -1,
      basket: 0,
    };
  }

  if (level.mode === "fill") {
    const target = rnd.int(Math.max(lo, 2), hi);
    return {
      mode: "fill",
      // El cuenco arranca vacío: el número entra de a uno y cada tic lo sube.
      bowls: [makeBowl("a", 0, p, skin, rnd)],
      target,
      cards: [{ id: "objetivo", value: target, correct: true }],
      lying: -1,
      // Siempre sobra fruta en la canasta: parar a tiempo es parte del ítem.
      basket: target + 2,
    };
  }

  if (level.mode === "lie") {
    const count = rnd.int(Math.max(lo, 2), hi);
    const offset = rnd.pick(p.distractorOffsets.filter((o) => count + o >= 1));
    const mentirosa = rnd.bool() ? 1 : 0;
    const verdad: DotCard = { id: "c0", value: count, correct: true };
    const mentira: DotCard = {
      id: "c1",
      value: count + offset,
      correct: false,
      lure: "regrouping_changes_count",
    };
    return {
      mode: "lie",
      bowls: [makeBowl("a", count, p, skin, rnd)],
      target: count,
      // El orden en pantalla se sortea: la mentira no puede estar siempre a la
      // derecha, o el jugador acierta sin mirar la tarjeta.
      cards: mentirosa === 0 ? [mentira, verdad] : [verdad, mentira],
      lying: mentirosa,
      basket: 0,
    };
  }

  // `carry` y `label` comparten problema: una colección y tres tarjetas. Lo que
  // cambia es si la colección se queda a la vista mientras se elige.
  const count = rnd.int(Math.max(lo, 2), hi);
  return {
    mode: level.mode,
    bowls: [makeBowl("a", count, p, skin, rnd)],
    target: count,
    cards: makeCards(count, p, rnd),
    lying: -1,
    basket: 0,
  };
}

function makeBowl(
  id: string,
  count: number,
  p: CardinalityParams,
  skin: Skin,
  rnd: Random,
): Bowl {
  const kinds: number[] = [];
  const sizes: number[] = [];
  for (let i = 0; i < count; i++) {
    kinds.push(rnd.int(0, p.kinds - 1));
    sizes.push(p.sizeVariance ? 0.7 + rnd.int(0, 6) / 10 : 1);
  }
  return {
    id,
    skin,
    arrangement: rnd.pick(p.arrangements),
    count,
    kinds,
    sizes,
    thickness: p.barThickness ? 0.6 + rnd.int(0, 8) / 10 : 1,
  };
}

/**
 * Las tarjetas que no son no son ruido: son contar de más o de menos, que es
 * el desliz que el diseño prevé cuando el jugador saltea una cosa o cuenta dos
 * veces la misma.
 */
function makeCards(count: number, p: CardinalityParams, rnd: Random): DotCard[] {
  const cards: DotCard[] = [{ id: "c0", value: count, correct: true }];
  const usados = new Set<number>([count]);
  for (const offset of rnd.shuffle(p.distractorOffsets)) {
    if (cards.length >= CARD_CHOICES) break;
    const value = count + offset;
    if (value < 1 || usados.has(value)) continue;
    usados.add(value);
    cards.push({
      id: `c${cards.length}`,
      value,
      correct: false,
      lure: Math.abs(offset) === 1 ? "miscount_by_one" : "miscount_by_two",
    });
  }
  // Con cantidades chicas los desplazamientos posibles se agotan; el relleno
  // sigue siendo contar de más, nunca un número inventado.
  let extra = 2;
  while (cards.length < CARD_CHOICES) {
    const value = count + extra;
    if (!usados.has(value)) {
      usados.add(value);
      cards.push({
        id: `c${cards.length}`,
        value,
        correct: false,
        lure: extra === 1 ? "miscount_by_one" : "miscount_by_two",
      });
    }
    extra += 1;
  }
  return rnd.shuffle(cards);
}

export const cardinalityLevelByNumber = (n: number): CardinalityLevel | undefined =>
  CARDINALITY_LEVELS.find((l) => l.n === n);

export const TOTAL_CARDINALITY_LEVELS = CARDINALITY_LEVELS.length;

/** Las capas y los verbos que el nodo declara, para que nadie los recalcule. */
export const CARDINALITY_LAYERS: readonly Layer[] = ["concrete", "visual"];
export const CARDINALITY_EVIDENCE: readonly Evidence[] = [
  "recognize",
  "explain",
  "manipulate",
  "apply",
  "generalize",
];

registerNode({
  id: NODE,
  n: 1,
  prereqs: [],
  levels: CARDINALITY_LEVELS,
});
