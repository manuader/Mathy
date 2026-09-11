/**
 * La lección de las cajas en el libro de cuentas, nivel por nivel.
 *
 * Los niveles 1 a 5 estrenan algo cada uno y traen una guía atada a eso: llevar
 * cada cosa a su fila, anotar un cajón sin abrirlo, pesarlo con fruta en la
 * balanza, separar dos marcas, y poner la caja en la hoja vacía del árbol. El 6
 * y el 7 repiten el gesto de ordenar con otra piel (la letra, las figuras que
 * nunca se vieron): su guía es un solo recordatorio de qué llave usar.
 *
 * Todo lo del nodo vive acá: la lección, sus textos y los dibujos de sus llaves.
 */
import type { CoachStep, KeySpec, LessonModule } from "./types.ts";

const NODE = "prealg.var.unknown_as_box";

const k = (n: number, part: string): string => `lesson.${NODE}.${n}.${part}`;

const step = (n: number, id: string, advance: CoachStep["advance"]): CoachStep => ({
  id,
  textKey: k(n, `coach.${id}`),
  advance,
});

/** El paso que explica el resultado: la ronda espera a que se lea. */
const reveal = (n: number): CoachStep => ({ ...step(n, "reveal", "tap"), holds: true });

const key = (id: string, glyph: string): KeySpec => ({
  id,
  titleKey: `key.${id}.title`,
  bodyKey: `key.${id}.body`,
  glyph,
});

/** Lo que la actividad dice en la línea de abajo. */
export const boxMsg = (id: string): string => `lesson.${NODE}.msg.${id}`;

export const MODULE: LessonModule = {
  lesson: {
    node: NODE,
    learnedKey: `node.${NODE}.learned`,
    levels: [
      {
        level: 1,
        whyKey: k(1, "why"),
        goalKey: k(1, "goal"),
        key: key("box.same_goes_together", "box.rows"),
        uses: ["count.one_more"],
        coach: [
          step(1, "look", "tap"),
          step(1, "drag", { signal: "placed" }),
          step(1, "fill", { signal: "solved" }),
          reveal(1),
        ],
      },
      {
        level: 2,
        whyKey: k(2, "why"),
        goalKey: k(2, "goal"),
        key: key("box.count_it_closed", "box.crate"),
        uses: ["box.same_goes_together"],
        coach: [
          step(2, "look", "tap"),
          step(2, "crate", { signal: "crateIn" }),
          step(2, "fill", { signal: "solved" }),
          reveal(2),
        ],
      },
      {
        level: 3,
        whyKey: k(3, "why"),
        goalKey: k(3, "goal"),
        key: key("box.scale_tells", "box.scale"),
        uses: ["count.pair_compares", "box.count_it_closed"],
        coach: [
          step(3, "look", "tap"),
          step(3, "weigh", { signal: "weighed" }),
          step(3, "level", { signal: "levelled" }),
          reveal(3),
        ],
      },
      {
        level: 4,
        whyKey: k(4, "why"),
        goalKey: k(4, "goal"),
        key: key("box.other_mark_other_box", "box.marks"),
        uses: ["box.same_goes_together", "box.count_it_closed"],
        coach: [
          step(4, "look", "tap"),
          step(4, "fill", { signal: "solved" }),
          reveal(4),
        ],
      },
      {
        level: 5,
        whyKey: k(5, "why"),
        goalKey: k(5, "goal"),
        key: key("box.box_holds_the_place", "box.leaf"),
        uses: ["prec.tree", "box.count_it_closed"],
        coach: [
          step(5, "look", "tap"),
          step(5, "fill", { signal: "solved" }),
          step(5, "leaf", { signal: "leafed" }),
          reveal(5),
        ],
      },
      {
        level: 6,
        whyKey: k(6, "why"),
        goalKey: k(6, "goal"),
        key: key("box.letter_is_the_mark", "box.letter"),
        uses: ["box.other_mark_other_box"],
        coach: [step(6, "recall", "tap")],
      },
      {
        level: 7,
        whyKey: k(7, "why"),
        goalKey: k(7, "goal"),
        key: key("box.any_drawing_works", "box.figures"),
        uses: ["box.letter_is_the_mark", "box.same_goes_together"],
        coach: [step(7, "recall", "tap")],
      },
    ],
  },
  texts: {
    [`node.${NODE}.learned`]:
      "Una incógnita es una caja cerrada: una cantidad fija que nadie conoce. Se cuenta, se mueve y se pesa sin abrirla, y la letra es sólo el nombre de su marca.",

    [k(1, "why")]:
      "Anotar es juntar lo que es igual y contarlo. Cada fila del libro guarda una sola clase de cosa, y su número dice cuántas hay.",
    [k(1, "goal")]: "Llevá cada fruta del mostrador a la fila de su clase.",
    [k(1, "coach.look")]:
      "Abajo está el mostrador con la fruta suelta. Arriba, el libro: cada fila es para una sola clase.",
    [k(1, "coach.drag")]:
      "Arrastrá una fruta hasta una fila vacía. La fila queda para esa clase y cuenta uno.",
    [k(1, "coach.fill")]:
      "Seguí con las demás. Lo igual va a la misma fila; una fruta distinta abre la suya.",
    [k(1, "coach.reveal")]:
      "Cada fila guardó una clase y su número dice cuántas hay. Anotaste sin mezclar.",

    [k(2, "why")]:
      "Un cajón cerrado es una cantidad que nadie conoce, pero existe y se puede contar. No hace falta abrirlo para anotarlo.",
    [k(2, "goal")]: "Anotá todo el mostrador, cajones incluidos, sin abrir ninguno.",
    [k(2, "coach.look")]:
      "Ahora hay cajones cerrados con una marca en la tapa. Nadie sabe qué tienen adentro.",
    [k(2, "coach.crate")]:
      "Llevá un cajón a una fila vacía. Entra como cualquier fruta, cerrado.",
    [k(2, "coach.fill")]: "Anotá lo que queda. Los cajones con la misma marca van juntos.",
    [k(2, "coach.reveal")]:
      "La fila de los cajones cuenta cuántos hay, aunque nadie sepa qué tienen. Contaste sin abrir.",

    [k(3, "why")]:
      "Lo que tiene un cajón se puede saber sin abrirlo: poniendo fruta del otro lado de la balanza hasta que la barra quede derecha.",
    [k(3, "goal")]: "Poné fruta en el plato libre hasta que la barra quede derecha.",
    [k(3, "coach.look")]:
      "Los cajones están en un plato y la barra se hunde de su lado. El otro plato está vacío.",
    [k(3, "coach.weigh")]: "Arrastrá una fruta del mostrador al plato vacío. Mirá cómo contesta la barra.",
    [k(3, "coach.level")]:
      "Seguí hasta que la barra quede derecha. Si te pasás, tocá el plato y sale una.",
    [k(3, "coach.reveal")]:
      "La barra derecha dijo cuánto pesan los cajones, y al abrirse había eso. Lo supiste sin abrir.",

    [k(4, "why")]:
      "Dos marcas distintas son dos cantidades distintas que nadie conoce. Por eso no se juntan en una fila, aunque las dos sean cajones.",
    [k(4, "goal")]: "Anotá el mostrador: cada marca en su propia fila.",
    [k(4, "coach.look")]:
      "Hay cajones con dos marcas distintas. Mirá bien las tapas antes de mover.",
    [k(4, "coach.fill")]:
      "Anotá todo. Si juntás dos marcas, el libro te muestra que no son lo mismo.",
    [k(4, "coach.reveal")]:
      "Cada marca quedó en su fila. Dos cajones de una y tres de otra no son cinco de nada.",

    [k(5, "why")]:
      "Una caja puede ocupar el lugar de un número que falta. La cuenta queda armada aunque nadie sepa cuánto vale.",
    [k(5, "goal")]: "Anotá el mostrador y, cuando aparezca el árbol, llevá la caja a la hoja vacía.",
    [k(5, "coach.look")]:
      "Ahora las filas son barras y el conteo va adelante. Es el mismo libro, dicho más corto.",
    [k(5, "coach.fill")]: "Anotá el mostrador como siempre. Después viene un árbol con un hueco.",
    [k(5, "coach.leaf")]:
      "Al árbol le falta un número. Llevá la caja a la hoja que late: ocupa ese lugar cerrada.",
    [k(5, "coach.reveal")]:
      "El árbol quedó completo y la caja sigue cerrada. Una incógnita ocupa un lugar en la cuenta.",

    [k(6, "why")]:
      "La marca de la tapa ahora tiene nombre: una letra. 3x son tres cajas con la marca x; el número cuenta y la letra dice cuáles.",
    [k(6, "goal")]: "Anotá el mostrador: cada letra en su fila.",
    [k(6, "coach.recall")]:
      "Acordate de «Marca distinta, caja distinta». La letra es la marca con nombre: la misma letra va junta.",

    [k(7, "why")]:
      "No importa cómo se dibuje la marca: lo que se repite va junto y se cuenta. Una incógnita es una cantidad fija que no conocés.",
    [k(7, "goal")]: "Agrupá las figuras que se repiten, cada una en su fila.",
    [k(7, "coach.recall")]:
      "Acordate de «La letra es la marca». Estas figuras nunca las viste: agrupá las iguales y cada fila es una letra.",

    // Lo que la actividad dice en la línea de abajo.
    [boxMsg("rowBack")]: "Volvió al mostrador. Soltala encima de una fila.",
    [boxMsg("panBack")]: "Volvió al mostrador. Soltala encima del plato libre.",
    [boxMsg("leafBack")]: "La caja volvió al mostrador. Soltala sobre la hoja que late.",
    [boxMsg("noRow")]: "Todas las filas tienen dueño. Esa va en la de su clase.",
    [boxMsg("panEmpty")]: "El plato está vacío: no hay nada que sacar.",
    [boxMsg("pickedRow")]: "La levantaste. Tocá la fila donde va.",
    [boxMsg("pickedPan")]: "La levantaste. Tocá el plato libre para dejarla.",
    [boxMsg("pickedLeaf")]: "La levantaste. Tocá la hoja donde va.",

    "key.box.same_goes_together.title": "Lo igual va junto",
    "key.box.same_goes_together.body":
      "Para anotar, juntá en una fila lo que es igual y contalo. Una cosa distinta abre su propia fila; nunca se mezclan.",
    "key.box.count_it_closed.title": "Una caja se cuenta cerrada",
    "key.box.count_it_closed.body":
      "Un cajón cerrado se anota como cualquier cosa: no hace falta saber qué tiene para saber cuántos hay.",
    "key.box.scale_tells.title": "La balanza dice lo de adentro",
    "key.box.scale_tells.body":
      "Si la barra queda derecha, lo de un plato pesa lo mismo que lo del otro. Así sabés qué tiene la caja sin abrirla.",
    "key.box.other_mark_other_box.title": "Marca distinta, caja distinta",
    "key.box.other_mark_other_box.body":
      "Dos marcas son dos cantidades que no conocés, y pueden ser distintas. Dos de una y tres de otra no se juntan en cinco.",
    "key.box.box_holds_the_place.title": "La caja ocupa el lugar",
    "key.box.box_holds_the_place.body":
      "Donde falta un número podés poner una caja cerrada: la cuenta queda armada aunque todavía no sepas cuánto vale.",
    "key.box.letter_is_the_mark.title": "La letra es la marca",
    "key.box.letter_is_the_mark.body":
      "La letra es el nombre de una caja. 3x son tres cajas marcadas x: el número cuenta y la letra dice de cuáles.",
    "key.box.any_drawing_works.title": "Cualquier dibujo sirve",
    "key.box.any_drawing_works.body":
      "Una incógnita puede tener cualquier dibujo o cualquier letra. Lo que importa es que es fija y que la misma marca es la misma cantidad.",
  },
  // Puntos y barras sobre 40 × 40. El punto resaltado es el que importa.
  glyphs: {
    // Dos filas del libro: tres iguales arriba, dos iguales abajo, y su conteo.
    "box.rows": {
      dots: [[8, 13, 3.5], [16, 13, 3.5], [24, 13, 3.5], [8, 28, 3.5, true], [16, 28, 3.5, true]],
      bars: [[4, 19, 32, 1.5], [4, 34, 32, 1.5], [33, 10, 2, 7], [31, 25, 5, 2], [31, 29, 5, 2]],
    },
    // Tres cajones con su tapa en una fila, y el conteo al final.
    "box.crate": {
      dots: [[33, 20, 3, true]],
      bars: [
        [3, 15, 7, 10],
        [12, 15, 7, 10],
        [21, 15, 7, 10],
        [3, 13, 7, 1.5],
        [12, 13, 7, 1.5],
        [21, 13, 7, 1.5],
      ],
    },
    // La barra derecha: un cajón de un lado, tres frutas del otro.
    "box.scale": {
      dots: [[26, 22, 3], [32, 22, 3], [29, 17, 3, true]],
      bars: [[4, 11, 32, 2.5], [19, 11, 2, 20], [6, 17, 10, 8], [14, 32, 12, 2]],
    },
    // Dos filas con cajones distintos: no se juntan.
    "box.marks": {
      dots: [[7, 12, 2, true], [16, 12, 2, true], [7, 28, 2], [16, 28, 2], [25, 28, 2]],
      bars: [[3, 8, 8, 8], [12, 8, 8, 8], [3, 24, 8, 8], [12, 24, 8, 8], [21, 24, 8, 8], [3, 19, 32, 1.5]],
    },
    // El árbol con la caja en la hoja que faltaba.
    "box.leaf": {
      dots: [[20, 8, 4], [10, 22, 3.5], [30, 22, 4]],
      bars: [[10, 11, 20, 1.5], [9, 11, 1.5, 9], [29, 11, 1.5, 9], [5, 29, 10, 9]],
    },
    // La ficha con el número y la letra pegados: 3x.
    "box.letter": { dots: [], card: "3x" },
    // Tres figuras que nunca se vieron, cada una en su fila.
    "box.figures": {
      dots: [[8, 10, 3.5, true], [16, 10, 3.5, true], [8, 20, 3], [8, 30, 3.5], [16, 30, 3.5], [24, 30, 3.5]],
      bars: [[4, 15, 32, 1], [4, 25, 32, 1]],
    },
  },
};
