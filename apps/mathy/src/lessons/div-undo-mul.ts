/**
 * La lección de la llave que encoge (`arith.div.undo_mul`), nivel por nivel.
 *
 * Seis niveles estrenan algo y traen una guía atada a eso: llevar la llave y
 * girarla (1), elegir entre tres clases de llave (2), tocar la animación que
 * miente (3), leer el lado hueco del piso (4), pedir la banda y elegir el
 * resultado (6) y tocar la acción que deshace (8). El 5 repite la llave y la
 * pared con números y el 7 repite la pared con baldosas que sobran: su guía es
 * un solo recordatorio de qué llave usar.
 *
 * Los niveles 3 y 5 alternan dos preguntas y la guía acompaña solo la primera
 * ronda; por eso su objetivo nombra las dos.
 */
import type { CoachStep, KeySpec, LessonModule } from "./types.ts";

const NODE = "arith.div.undo_mul";

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
        key: key("div.shrink_undoes", "div.shrink"),
        uses: ["mul.stretch_all"],
        coach: [
          step(1, "look", "tap"),
          step(1, "key", { signal: "keyIn" }),
          step(1, "turn", { signal: "opened" }),
          reveal(1),
        ],
      },
      {
        level: 2,
        whyKey: k(2, "why"),
        goalKey: k(2, "goal"),
        key: key("div.same_marks", "div.sameMarks"),
        uses: ["div.shrink_undoes"],
        coach: [step(2, "look", "tap"), step(2, "open", { signal: "opened" }), reveal(2)],
      },
      {
        level: 3,
        whyKey: k(3, "why"),
        goalKey: k(3, "goal"),
        key: key("div.back_arrow", "div.backArrow"),
        uses: ["div.same_marks"],
        coach: [step(3, "look", "tap"), step(3, "choose", { signal: "chosen" }), reveal(3)],
      },
      {
        level: 4,
        whyKey: k(4, "why"),
        goalKey: k(4, "goal"),
        key: key("div.hidden_side", "div.hiddenSide"),
        uses: ["mul.rows_make_rect", "mul.rect_counts"],
        coach: [step(4, "look", "tap"), step(4, "pick", { signal: "picked" }), reveal(4)],
      },
      {
        level: 5,
        whyKey: k(5, "why"),
        goalKey: k(5, "goal"),
        key: key("div.expr_writes", "div.divide"),
        uses: ["div.shrink_undoes", "div.hidden_side"],
        coach: [step(5, "recall", "tap")],
      },
      {
        level: 6,
        whyKey: k(6, "why"),
        goalKey: k(6, "goal"),
        key: key("div.back_to_start", "div.backToStart"),
        uses: ["div.expr_writes"],
        coach: [
          step(6, "look", "tap"),
          step(6, "summon", { signal: "summoned" }),
          step(6, "pick", { signal: "picked" }),
          reveal(6),
        ],
      },
      {
        level: 7,
        whyKey: k(7, "why"),
        goalKey: k(7, "goal"),
        key: key("div.leftover_stays", "div.leftover"),
        uses: ["div.hidden_side", "mul.rows_make_rect"],
        coach: [step(7, "recall", "tap")],
      },
      {
        level: 8,
        whyKey: k(8, "why"),
        goalKey: k(8, "goal"),
        key: key("div.no_undo_zero", "div.flat"),
        uses: ["div.back_arrow", "div.shrink_undoes"],
        coach: [step(8, "look", "tap"), step(8, "pick", { signal: "opened" }), reveal(8)],
      },
    ],
  },
  texts: {
    [`node.${NODE}.learned`]:
      "Dividir deshace multiplicar: devuelve lo estirado a su largo y parte un total en filas iguales. Lo que sobra queda afuera, y lo aplastado por cero no tiene vuelta.",

    [k(1, "why")]:
      "Una banda que alguien estiró vuelve a su largo con la llave que encoge. Dividir es deshacer un estirado.",
    [k(1, "goal")]: "Llevá la llave al cofre y girala hasta que las marcas caigan sobre las de la testigo.",
    [k(1, "coach.look")]:
      "La banda de arriba quedó estirada. La de abajo es la testigo: así era antes. El cofre se abre si la devolvés.",
    [k(1, "coach.key")]: "Arrastrá la llave del llavero hasta la cerradura del cofre.",
    [k(1, "coach.turn")]:
      "Ahora girá con el dedo alrededor de la cerradura. La banda se encoge o se estira mientras girás.",
    [k(1, "coach.reveal")]:
      "Cada marca volvió a caer sobre la testigo y el cofre se abrió. Encoger deshizo el estirado.",

    [k(2, "why")]:
      "Hay llaves que dejan la banda del largo justo pero con las marcas corridas. La que deshace es la que devuelve cada marca a su lugar.",
    [k(2, "goal")]: "Elegí la llave que encoge y girala hasta que las marcas coincidan con la testigo.",
    [k(2, "coach.look")]:
      "Ahora hay tres llaves: una encoge, otra recorta el extremo y otra estira. Se distinguen por la forma.",
    [k(2, "coach.open")]:
      "Probá una llave en la cerradura y girala. Si no es la que encoge, hace lo suyo y vuelve sola.",
    [k(2, "coach.reveal")]:
      "Solo la que encoge devuelve cada marca a su lugar. Recortar deja bien el largo, pero no las marcas.",

    [k(3, "why")]:
      "Deshacer es recorrer la misma flecha para atrás: si la ida estiró, la vuelta encoge lo mismo. Cortar el extremo parece igual, pero no es.",
    [k(3, "goal")]: "Tocá la animación que no devuelve la banda, y abrí el cofre con la llave justa.",
    [k(3, "coach.look")]:
      "Las dos bandas de arriba vuelven a su largo. Abajo está la testigo, quieta: así era la banda.",
    [k(3, "coach.choose")]:
      "En una, las marcas caen sobre la testigo. En la otra solo se corta el extremo. Tocá esa.",
    [k(3, "coach.reveal")]:
      "Cortar el extremo empareja el largo, no las marcas. Solo encoger recorre la flecha de vuelta.",

    [k(4, "why")]:
      "Un piso tiene tres números: filas, columnas y total. Con el total y un lado se sabe el otro, sin desarmar nada.",
    [k(4, "goal")]: "Tocá la ficha que dice cuánto mide el lado que no tiene número.",
    [k(4, "coach.look")]:
      "Un lado del piso tiene su número y el otro quedó hueco. Las baldosas están todas.",
    [k(4, "coach.pick")]: "Fijate cuánto mide el lado hueco y tocá abajo la ficha que lo dice.",
    [k(4, "coach.reveal")]:
      "Leíste un lado sin desarmar el piso. Repartir el total en filas iguales también es dividir.",

    [k(5, "why")]:
      "Los números llegan a la banda y al piso: la cuenta escrita al lado dice lo mismo que la llave y la pared.",
    [k(5, "goal")]: "Abrí el cofre con la llave que encoge, o tocá la ficha del lado que falta.",
    [k(5, "coach.recall")]:
      "Son los juegos de antes, ahora con números. Tu llave: encoger deshace el estirado. Mirá la cuenta escrita debajo de la banda.",

    [k(6, "why")]:
      "Con la cuenta sola ya se sabe el resultado: es el largo que, estirado por el segundo número, llega al primero.",
    [k(6, "goal")]: "Elegí la ficha con el resultado de la cuenta.",
    [k(6, "coach.look")]: "Quedó solo la cuenta: un número dividido otro. La banda está escondida.",
    [k(6, "coach.summon")]: "Tocá la cuenta para ver la banda estirada, con la testigo abajo.",
    [k(6, "coach.pick")]: "Elegí abajo la ficha con el resultado.",
    [k(6, "coach.reveal")]:
      "El resultado es cuánto medía la banda antes de estirarse. Lo leíste sin girar ninguna llave.",

    [k(7, "why")]:
      "No toda división cierra justa: a veces sobran baldosas que no alcanzan para otra fila. Se ven, pero todavía no tienen nombre.",
    [k(7, "goal")]: "Tocá la ficha que dice cuántas filas enteras salieron.",
    [k(7, "coach.recall")]:
      "Es el piso de antes, pero ahora sobran baldosas. Tu llave: un lado tapado se calcula. Contá solo filas enteras.",

    [k(8, "why")]:
      "Toda acción que tiene vuelta se deshace igual: la misma acción al revés y del mismo tamaño. Pero hay acciones que borran lo que había.",
    [k(8, "goal")]: "Tocá la acción que deshace la cerradura, o la banda aplastada si ninguna puede.",
    [k(8, "coach.look")]:
      "El cartel sobre el cofre muestra lo que le hicieron. Abajo hay acciones para deshacerlo.",
    [k(8, "coach.pick")]:
      "Tocá la acción que lo devuelve a como estaba. Si lo aplastaron contra el clavo, tocá la banda aplastada.",
    [k(8, "coach.reveal")]:
      "Deshacer es la misma acción al revés, del mismo tamaño. Si algo aplastó todo contra el clavo, no hay llave que lo devuelva.",

    // Lo que la actividad dice en la línea de abajo y no estaba escrito antes.
    [`lesson.${NODE}.msg.keyBack`]: "La llave volvió al llavero. Soltala sobre la cerradura del cofre.",
    [`lesson.${NODE}.msg.noKey`]: "Primero llevá una llave a la cerradura del cofre; después se gira.",

    "key.div.shrink_undoes.title": "Encoger deshace el estirado",
    "key.div.shrink_undoes.body":
      "Si algo se estiró por tres, encogerlo por tres lo devuelve a como estaba. Dividir deshace multiplicar.",
    "key.div.same_marks.title": "Mirá las marcas, no el largo",
    "key.div.same_marks.body":
      "Recortar deja la banda del largo justo con las marcas corridas. Deshacer de verdad devuelve cada marca a su lugar.",
    "key.div.back_arrow.title": "La vuelta es la misma flecha",
    "key.div.back_arrow.body":
      "Si la ida estiró por cuatro, la vuelta encoge por cuatro. Deshacer es hacer lo mismo al revés.",
    "key.div.hidden_side.title": "Un lado tapado se calcula",
    "key.div.hidden_side.body":
      "Si un piso de doce baldosas tiene filas de tres, tiene cuatro filas. El total y un lado dicen el otro.",
    "key.div.expr_writes.title": "El ÷ anota la vuelta",
    "key.div.expr_writes.body":
      "La barra con dos puntos anota la llave que encoge. Doce dividido tres es lo que medía la banda antes de estirarse por tres.",
    "key.div.back_to_start.title": "Dividir vuelve al principio",
    "key.div.back_to_start.body":
      "Veinte dividido cuatro pregunta qué largo, estirado por cuatro, llega a veinte. Es cinco: el largo que había antes.",
    "key.div.leftover_stays.title": "Lo que sobra queda afuera",
    "key.div.leftover_stays.body":
      "Si las baldosas no alcanzan para otra fila entera, quedan sueltas. Meterlas en una fila la haría más larga que las otras.",
    "key.div.no_undo_zero.title": "Lo aplastado no tiene vuelta",
    "key.div.no_undo_zero.body":
      "Una acción que no borra nada se deshace al revés y del mismo tamaño. Estirar por cero aplasta todo en el clavo, y eso no se deshace.",
  },
  // Puntos y barras sobre una caja de 40 × 40. Resaltado (azul) es lo que la
  // llave enseña a mirar.
  glyphs: {
    // La banda estirada arriba y, abajo, la misma encogida: vuelve a su largo.
    "div.shrink": {
      dots: [[6, 12, 3], [16, 12, 3], [26, 12, 3], [36, 12, 3], [6, 28, 3, true], [11, 28, 3, true], [16, 28, 3, true], [21, 28, 3, true]],
      bars: [[6, 11, 30, 2], [6, 27, 15, 2]],
    },
    // El mismo largo, con marcas distintas: recortar no es deshacer.
    "div.sameMarks": {
      dots: [[6, 13, 3], [30, 13, 3], [6, 29, 3, true], [12, 29, 3, true], [18, 29, 3, true], [24, 29, 3, true], [30, 29, 3, true]],
      bars: [[6, 12, 24, 2], [6, 28, 24, 2]],
    },
    // La flecha que baja y la misma que sube.
    "div.backArrow": {
      dots: [[14, 34, 3], [26, 6, 3, true]],
      bars: [[13, 6, 2, 26], [25, 8, 2, 26]],
    },
    // El piso con su lado de arriba lleno; el de la izquierda se cuenta.
    "div.hiddenSide": {
      dots: [
        [12, 14, 2.8, true], [19, 14, 2.8], [26, 14, 2.8], [33, 14, 2.8],
        [12, 22, 2.8, true], [19, 22, 2.8], [26, 22, 2.8], [33, 22, 2.8],
        [12, 30, 2.8, true], [19, 30, 2.8], [26, 30, 2.8], [33, 30, 2.8],
      ],
      bars: [[10, 6, 25, 2]],
    },
    "div.divide": { dots: [], card: "÷" },
    // El largo estirado arriba y el de antes abajo: la cuenta vuelve a ese.
    "div.backToStart": {
      dots: [[6, 13, 3], [36, 13, 3], [6, 29, 3], [16, 29, 3.5, true]],
      bars: [[6, 12, 30, 2], [6, 28, 10, 2]],
    },
    // Dos filas enteras y dos baldosas sueltas, afuera.
    "div.leftover": {
      dots: [
        [8, 13, 3], [15, 13, 3], [22, 13, 3], [29, 13, 3],
        [8, 21, 3], [15, 21, 3], [22, 21, 3], [29, 21, 3],
        [10, 33, 3, true], [18, 33, 3, true],
      ],
    },
    // Marcas separadas arriba; abajo, todas en el clavo: ya no se sabe cuál era cuál.
    "div.flat": {
      dots: [[8, 11, 3], [16, 11, 3], [24, 11, 3], [32, 11, 3], [8, 30, 4.5, true]],
      bars: [[8, 29, 26, 2]],
    },
  },
};
