/**
 * La lección de cofres dentro de cofres, nivel por nivel.
 *
 * Los niveles 1 a 6 estrenan un gesto o una superficie cada uno (llevar la
 * llave, meter un cofre en otro, el árbol y las fichas de orden, la tubería,
 * tocar la fila, mantener el dedo para ver el cofre que nadie dibujó) y traen
 * una guía atada a eso. El 7 repite el gesto del 1 con el orden al revés, y el 8
 * repite el toque de una ficha de orden: los dos llevan un solo recordatorio de
 * qué llave usar.
 *
 * Todo lo del nodo vive acá: la lección, sus textos y los dibujos de sus llaves.
 */
import type { CoachStep, KeySpec, LessonModule } from "./types.ts";

const NODE = "arith.expr.precedence_tree";

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

export const MODULE: LessonModule = {
  lesson: {
    node: NODE,
    learnedKey: `node.${NODE}.learned`,
    levels: [
      {
        level: 1,
        whyKey: k(1, "why"),
        goalKey: k(1, "goal"),
        key: key("prec.inside_first", "prec.inside"),
        uses: [],
        coach: [
          step(1, "look", "tap"),
          step(1, "vain", { signal: "vain" }),
          step(1, "inner", { signal: "bit" }),
          step(1, "outer", { signal: "solved" }),
          reveal(1),
        ],
      },
      {
        level: 2,
        whyKey: k(2, "why"),
        goalKey: k(2, "goal"),
        key: key("prec.nesting", "prec.nest"),
        uses: ["prec.inside_first"],
        coach: [
          step(2, "look", "tap"),
          step(2, "place", { signal: "placed" }),
          step(2, "fill", { signal: "solved" }),
          reveal(2),
        ],
      },
      {
        level: 3,
        whyKey: k(3, "why"),
        goalKey: k(3, "goal"),
        key: key("prec.tree", "prec.tree"),
        uses: ["prec.inside_first", "prec.nesting"],
        coach: [step(3, "look", "tap"), step(3, "choose", { signal: "chosen" }), reveal(3)],
      },
      {
        level: 4,
        whyKey: k(4, "why"),
        goalKey: k(4, "goal"),
        key: key("prec.order_changes", "prec.pipe"),
        uses: [],
        coach: [step(4, "look", "tap"), step(4, "swap", { signal: "solved" }), reveal(4)],
      },
      {
        level: 5,
        whyKey: k(5, "why"),
        goalKey: k(5, "goal"),
        key: key("prec.parens_are_walls", "prec.parens"),
        uses: ["prec.inside_first", "prec.tree"],
        coach: [step(5, "look", "tap"), step(5, "pick", { signal: "picked" }), reveal(5)],
      },
      {
        level: 6,
        whyKey: k(6, "why"),
        goalKey: k(6, "goal"),
        key: key("prec.times_inside", "prec.ghost"),
        uses: ["prec.parens_are_walls"],
        coach: [
          step(6, "look", "tap"),
          step(6, "hold", { signal: "ghost" }),
          step(6, "pick", { signal: "picked" }),
          reveal(6),
        ],
      },
      {
        level: 7,
        whyKey: k(7, "why"),
        goalKey: k(7, "goal"),
        key: key("prec.undo_outside", "prec.undo"),
        uses: ["prec.inside_first"],
        coach: [step(7, "recall", "tap")],
      },
      {
        level: 8,
        whyKey: k(8, "why"),
        goalKey: k(8, "goal"),
        key: key("prec.order_any", "prec.order"),
        uses: ["prec.order_changes"],
        coach: [step(8, "recall", "tap")],
      },
    ],
  },
  texts: {
    [`node.${NODE}.learned`]:
      "Una cuenta es un encastre: se calcula desde el cofre de más adentro y se deshace desde el de más afuera. Los paréntesis sólo dicen qué está adentro de qué.",

    [k(1, "why")]:
      "Una cuenta puede estar adentro de otra, como un cofre adentro de otro. Para calcular se abre primero el de más adentro.",
    [k(1, "goal")]: "Abrí los dos cofres llevando a cada uno la llave de su cerradura.",
    [k(1, "coach.look")]:
      "Hay un cofre adentro de otro. La tapa del grande tiene un hueco: espera el tesoro del chico.",
    [k(1, "coach.vain")]: "Probá primero con el cofre grande: llevá su llave a su cerradura y mirá qué pasa.",
    [k(1, "coach.inner")]: "La llave giró en el vacío: el hueco seguía vacío. Ahora abrí el cofre de adentro.",
    [k(1, "coach.outer")]: "El tesoro subió al hueco. Ahora sí: llevá la otra llave al cofre grande.",
    [k(1, "coach.reveal")]:
      "Abriste de adentro hacia afuera: el de afuera necesitaba lo que guardaba el de adentro. Así se calcula.",

    [k(2, "why")]:
      "Un cofre puede guardar otro, y ese otro, uno más. El tamaño dice cuál va adentro de cuál.",
    [k(2, "goal")]: "Meté los tres cofres en el contorno, del más grande al más chico.",
    [k(2, "coach.look")]: "El contorno muestra cómo van los cofres: uno adentro del otro. Abajo están sueltos.",
    [k(2, "coach.place")]: "Llevá el cofre más grande hasta el contorno.",
    [k(2, "coach.fill")]: "Ahora el que sigue, que entra adentro del que pusiste. Y después el más chico.",
    [k(2, "coach.reveal")]:
      "El tamaño guarda el orden: el más chico quedó más adentro, y es el primero que se abre.",

    [k(3, "why")]:
      "El encastre también se dibuja como un árbol: cada cofre cuelga de una rama. El de más adentro cuelga más abajo y se abre primero.",
    [k(3, "goal")]: "Tocá lo que se pide: el orden que abre al revés, o la rama del cofre de más adentro.",
    [k(3, "coach.look")]:
      "A la derecha está el mismo encastre como árbol: una rama por cofre, el de más adentro más abajo.",
    [k(3, "coach.choose")]: "Abajo hay dos órdenes de apertura. Tocá el que abre al revés: empieza por el cofre de afuera.",
    [k(3, "coach.reveal")]:
      "Ese empezaba por afuera, y la llave de afuera gira en el vacío. En el árbol se sube desde abajo.",

    [k(4, "why")]:
      "Las mismas dos máquinas en otro orden dan otra salida. El orden de las operaciones cambia el resultado.",
    [k(4, "goal")]: "Cambiá el orden de las máquinas hasta que la bolita salga del tamaño pedido.",
    [k(4, "coach.look")]:
      "La bolita pasa por dos máquinas. Al final se ve la que salió y, debajo, la que se pide.",
    [k(4, "coach.swap")]: "Tocá una máquina: cambian de lugar y la bolita vuelve a pasar.",
    [k(4, "coach.reveal")]:
      "Mismas máquinas, misma entrada, otra salida: cambió el orden. Por eso una cuenta tiene que decir qué va primero.",

    [k(5, "why")]:
      "Los paréntesis son las paredes del cofre de adentro. Lo que encierran se calcula primero.",
    [k(5, "goal")]: "Tocá en la fila la operación que se calcula primero.",
    [k(5, "coach.look")]:
      "La fila escribe el mismo encastre. Las paredes del cofre de adentro se volvieron paréntesis.",
    [k(5, "coach.pick")]: "Tocá en la fila la operación del cofre de más adentro: es la que se calcula primero.",
    [k(5, "coach.reveal")]:
      "Esa estaba más adentro y se calcula primero. Los paréntesis no hacen ninguna cuenta: sólo dicen qué está adentro.",

    [k(6, "why")]:
      "Sin paréntesis también hay cofres: por acuerdo, × y ÷ van más adentro que + y −. Entre dos iguales, primero la de la izquierda.",
    [k(6, "goal")]: "Tocá la operación que se calcula primero. Si dudás, mantené el dedo sobre la fila.",
    [k(6, "coach.look")]: "Esta fila no tiene paredes, pero el encastre sigue ahí: el árbol lo muestra.",
    [k(6, "coach.hold")]: "Mantené el dedo apoyado sobre la fila: aparece el cofre que nadie dibujó.",
    [k(6, "coach.pick")]: "Soltá y tocá la operación que quedó adentro de ese cofre.",
    [k(6, "coach.reveal")]:
      "Nadie dibujó ese cofre y está igual: es un acuerdo. Por y dividido van más adentro que más y menos.",

    [k(7, "why")]: "Deshacer recorre el encastre al revés: se saca primero el cofre de más afuera.",
    [k(7, "goal")]: "Sacá los cofres de afuera hacia adentro, llevando cada llave a su cerradura.",
    [k(7, "coach.recall")]:
      "Acordate de «Adentro primero»: sirve para calcular. Para deshacer, el recorrido va al revés, desde el cofre de afuera.",

    [k(8, "why")]:
      "El orden importa aunque no haya números: girar y después agregar un punto no es lo mismo que al revés.",
    [k(8, "goal")]: "Tocá el orden de cerraduras que deja la figura igual a la grande.",
    [k(8, "coach.recall")]:
      "Acordate de «El orden cambia el resultado». Probá cada orden en tu cabeza: ¿dónde queda el punto?",

    "key.prec.inside_first.title": "Adentro primero",
    "key.prec.inside_first.body":
      "Para calcular, abrí primero el cofre de más adentro: su tesoro es lo que espera el de afuera. Antes, la llave de afuera gira en el vacío.",
    "key.prec.nesting.title": "Un cofre guarda a otro",
    "key.prec.nesting.body":
      "Un cofre puede guardar otro que guarda otro. El más chico es el de más adentro, y es el primero que se abre.",
    "key.prec.tree.title": "El encastre es un árbol",
    "key.prec.tree.body":
      "Cada cofre cuelga de una rama; el de más adentro cuelga más abajo. Para calcular, el árbol se recorre de abajo hacia arriba.",
    "key.prec.order_changes.title": "El orden cambia el resultado",
    "key.prec.order_changes.body":
      "Las mismas operaciones en otro orden dan otro número. Por eso una cuenta tiene que decir qué va primero.",
    "key.prec.parens_are_walls.title": "Los paréntesis son paredes",
    "key.prec.parens_are_walls.body":
      "Los paréntesis son las paredes del cofre de adentro: lo que encierran se calcula primero. No hacen ninguna cuenta.",
    "key.prec.times_inside.title": "Por y dividido, más adentro",
    "key.prec.times_inside.body":
      "Sin paréntesis, × y ÷ están en un cofre más adentro que + y −. Entre dos del mismo tipo, primero la de la izquierda.",
    "key.prec.undo_outside.title": "Deshacer empieza por afuera",
    "key.prec.undo_outside.body":
      "Calcular abre de adentro hacia afuera; deshacer saca de afuera hacia adentro. Es el mismo árbol, recorrido al revés.",
    "key.prec.order_any.title": "El orden manda sin números",
    "key.prec.order_any.body":
      "Girar y después agregar no es agregar y después girar. Dos acciones cualesquiera pueden depender del orden.",
  },
  // Puntos y barras sobre 40 × 40. El punto resaltado es el que importa.
  glyphs: {
    // Un cofre adentro de otro, con el tesoro en el de adentro.
    "prec.inside": {
      dots: [[20, 22, 3.5, true]],
      bars: [
        [4, 6, 32, 2],
        [4, 33, 32, 2],
        [4, 6, 2, 29],
        [34, 6, 2, 29],
        [12, 14, 16, 1.5],
        [12, 28, 16, 1.5],
        [12, 14, 1.5, 15.5],
        [26.5, 14, 1.5, 15.5],
      ],
    },
    // Tres cofres, uno adentro del otro: el más chico es el de más adentro.
    "prec.nest": {
      dots: [[20, 21, 2.5, true]],
      bars: [
        [3, 4, 34, 1.5],
        [3, 35, 34, 1.5],
        [3, 4, 1.5, 32.5],
        [35.5, 4, 1.5, 32.5],
        [9, 10, 22, 1.5],
        [9, 30, 22, 1.5],
        [9, 10, 1.5, 21.5],
        [29.5, 10, 1.5, 21.5],
        [15, 16, 10, 1.5],
        [15, 25, 10, 1.5],
        [15, 16, 1.5, 10.5],
        [23.5, 16, 1.5, 10.5],
      ],
    },
    // Un árbol en escalones: la raíz arriba y el nodo de más adentro abajo.
    "prec.tree": {
      dots: [[28, 6, 3.5], [36, 18, 2.5], [18, 18, 3.5], [26, 31, 2.5], [8, 31, 3.5, true]],
      bars: [[18, 6, 10, 1.5], [18, 6, 1.5, 12], [28, 6, 1.5, 12], [28, 18, 8, 1.5], [8, 18, 10, 1.5], [8, 18, 1.5, 13], [18, 18, 1.5, 13], [18, 31, 8, 1.5]],
    },
    // El caño con dos máquinas y la bolita que sale.
    "prec.pipe": {
      dots: [[3, 20, 2.5], [36, 20, 4, true]],
      bars: [[3, 19, 32, 2], [8, 13, 9, 14], [22, 13, 9, 14]],
    },
    // Los paréntesis encierran las dos que van primero.
    "prec.parens": {
      dots: [[12, 20, 2.5, true], [19, 20, 2.5, true], [30, 20, 2.5], [37, 20, 2.5]],
      bars: [[6, 12, 2, 16], [23, 12, 2, 16], [8, 12, 2, 2], [8, 26, 2, 2], [21, 12, 2, 2], [21, 26, 2, 2]],
    },
    // Sin paredes, el cofre fantasma rodea igual a las dos de la derecha.
    "prec.ghost": {
      dots: [[5, 20, 2.5], [20, 20, 2.5, true], [33, 20, 2.5, true]],
      bars: [[15, 12, 3, 1.5], [21, 12, 3, 1.5], [27, 12, 3, 1.5], [33, 12, 3, 1.5], [15, 27, 3, 1.5], [21, 27, 3, 1.5], [27, 27, 3, 1.5], [33, 27, 3, 1.5], [9, 19, 3, 2]],
    },
    // El tesoro ya afuera: deshacer arranca por el cofre de más afuera.
    "prec.undo": {
      dots: [[20, 5, 3.5, true]],
      bars: [
        [4, 12, 32, 2],
        [4, 35, 32, 2],
        [4, 12, 2, 25],
        [34, 12, 2, 25],
        [12, 19, 16, 1.5],
        [12, 30, 16, 1.5],
        [12, 19, 1.5, 12.5],
        [26.5, 19, 1.5, 12.5],
      ],
    },
    // La misma figura con el punto en dos lugares: el orden decide dónde queda.
    "prec.order": {
      dots: [[10, 12, 3, true], [36, 24, 3, true]],
      bars: [
        [4, 18, 12, 1.5],
        [4, 29, 12, 1.5],
        [4, 18, 1.5, 12.5],
        [14.5, 18, 1.5, 12.5],
        [22, 18, 12, 1.5],
        [22, 29, 12, 1.5],
        [22, 18, 1.5, 12.5],
        [32.5, 18, 1.5, 12.5],
      ],
    },
  },
};
