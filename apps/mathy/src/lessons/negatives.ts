/**
 * La lección del ascensor y el caminante, nivel por nivel.
 *
 * Estrenan gesto y traen guía de varios pasos: cruzar el cero girando (1), tocar
 * la casilla donde termina con el ascensor al lado (2), las monedas y los vales
 * (3), la vuelta doble y el toque que da vuelta al caminante (4), llevar la ficha
 * del piso más bajo a la caja (5) y mudar la calle (7). El 6 y el 8 repiten un
 * gesto conocido con otra pregunta: su guía es un recordatorio de la llave que
 * los resuelve.
 *
 * Todo lo del nodo vive acá: la lección, sus textos y los dibujos de sus llaves.
 */
import type { CoachStep, KeySpec, LessonModule } from "./types.ts";

const NODE = "arith.int.negatives";

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
        key: key("neg.zero_is_not_the_edge", "neg.edge"),
        uses: ["line.equal_steps", "line.one_tooth_one_stone"],
        coach: [
          step(1, "look", "tap"),
          step(1, "cross", { signal: "crossed" }),
          step(1, "arrive", { signal: "arrived" }),
          reveal(1),
        ],
      },
      {
        level: 2,
        whyKey: k(2, "why"),
        goalKey: k(2, "goal"),
        key: key("neg.other_side", "neg.side"),
        uses: ["neg.zero_is_not_the_edge", "line.count_the_jumps"],
        coach: [step(2, "look", "tap"), step(2, "predict", { signal: "predicted" }), reveal(2)],
      },
      {
        level: 3,
        whyKey: k(3, "why"),
        goalKey: k(3, "goal"),
        key: key("neg.opposites_cancel", "neg.cancel"),
        uses: ["count.pair_compares", "neg.other_side"],
        coach: [
          step(3, "look", "tap"),
          step(3, "drop", { signal: "placed" }),
          step(3, "net", { signal: "solved" }),
          reveal(3),
        ],
      },
      {
        level: 4,
        whyKey: k(4, "why"),
        goalKey: k(4, "goal"),
        key: key("neg.two_turns_back", "neg.turns"),
        uses: ["neg.zero_is_not_the_edge"],
        coach: [
          step(4, "look", "tap"),
          step(4, "choose", { signal: "chosen" }),
          step(4, "flip", { signal: "flippedTwice" }),
          step(4, "arrive", { signal: "arrived" }),
          reveal(4),
        ],
      },
      {
        level: 5,
        whyKey: k(5, "why"),
        goalKey: k(5, "goal"),
        key: key("neg.lower_is_less", "neg.lower"),
        uses: ["neg.other_side"],
        coach: [step(5, "look", "tap"), step(5, "drop", { signal: "boxed" }), reveal(5)],
      },
      {
        level: 6,
        whyKey: k(6, "why"),
        goalKey: k(6, "goal"),
        key: key("neg.distance_crosses_zero", "neg.distance"),
        uses: ["neg.zero_is_not_the_edge", "neg.lower_is_less"],
        coach: [step(6, "recall", "tap")],
      },
      {
        level: 7,
        whyKey: k(7, "why"),
        goalKey: k(7, "goal"),
        key: key("neg.zero_is_a_choice", "neg.choice"),
        uses: ["neg.lower_is_less", "neg.distance_crosses_zero"],
        coach: [
          step(7, "look", "tap"),
          step(7, "move", { signal: "moved" }),
          step(7, "drop", { signal: "boxed" }),
          reveal(7),
        ],
      },
      {
        level: 8,
        whyKey: k(8, "why"),
        goalKey: k(8, "goal"),
        key: key("neg.direction_and_size", "neg.direction"),
        uses: ["neg.other_side", "neg.two_turns_back"],
        coach: [step(8, "recall", "tap")],
      },
    ],
  },
  texts: {
    [`node.${NODE}.learned`]:
      "Cada número tiene un opuesto, a la misma distancia del cero y del otro lado. Un número con signo dice cuánto y hacia dónde.",

    [k(1, "why")]:
      "El cero no es el borde. La fila sigue del otro lado con pasos del mismo largo, y de ese lado se camina hacia el lado contrario.",
    [k(1, "goal")]: "Girá la manivela hasta la bandera, del otro lado del cero.",
    [k(1, "coach.look")]:
      "El caminante está a la derecha del cero, el punto grueso. La bandera está del otro lado.",
    [k(1, "coach.cross")]:
      "Girá la manivela hacia atrás. Mirá qué hace el caminante cuando pasa el cero.",
    [k(1, "coach.arrive")]: "Pasó el cero y siguió. Girá hasta la bandera: de este lado los pasos miden lo mismo.",
    [k(1, "coach.reveal")]:
      "Llegó. Su bandera se dio vuelta al pasar el cero: del otro lado se camina hacia el lado contrario.",

    [k(2, "why")]:
      "El ascensor cuelga del mismo eje: cada casilla es un piso. Los subsuelos, abajo de la calle, son el otro lado del cero.",
    [k(2, "goal")]: "Mirá los dientes encendidos y tocá la casilla donde va a terminar.",
    [k(2, "coach.look")]:
      "El caminante está en el cero. Los dientes encendidos dicen cuántos pasos da hacia atrás.",
    [k(2, "coach.predict")]:
      "Tocá la casilla donde va a terminar. Contá desde el cero, hacia la izquierda.",
    [k(2, "coach.reveal")]:
      "Terminó del lado izquierdo, tan lejos del cero como dientes había. El ascensor bajó los mismos pisos.",

    [k(3, "why")]:
      "Una moneda y un vale del mismo tamaño se anulan: juntos valen cero. Lo que queda sin pareja es el neto.",
    [k(3, "goal")]: "Arrastrá monedas y vales al tablero hasta que el neto sea el pedido.",
    [k(3, "coach.look")]:
      "Arriba, el neto pedido; abajo, el que hay. Las monedas suman y los vales son deuda.",
    [k(3, "coach.drop")]: "Arrastrá un vale al tablero y mirá cómo cambia el neto.",
    [k(3, "coach.net")]:
      "Seguí hasta llegar al neto pedido. Una moneda y un vale iguales se apagan: juntos valen cero.",
    [k(3, "coach.reveal")]:
      "El neto llegó al pedido. Lo que se apagó de a pares no contaba: un número y su opuesto suman cero.",

    [k(4, "why")]:
      "Darse vuelta dos veces deja mirando para el mismo lado que al principio. Por eso lo contrario de lo contrario es lo mismo.",
    [k(4, "goal")]: "Tocá la vuelta doble que se equivoca y después girá la manivela hasta la bandera.",
    [k(4, "coach.look")]:
      "Los dos caminantes se dan vuelta dos veces y después caminan. Mirá hacia dónde mira cada uno al final.",
    [k(4, "coach.choose")]: "Uno de los dos se equivoca. Tocá el que termina mirando al revés.",
    [k(4, "coach.flip")]:
      "Probalo vos: tocá dos veces al caminante. Gira sin moverse. ¿Hacia dónde mira después de dos vueltas?",
    [k(4, "coach.arrive")]: "Mira como al principio. Ahora girá la manivela hasta la bandera.",
    [k(4, "coach.reveal")]:
      "Dos vueltas lo dejaron mirando igual que al principio. Lo contrario de lo contrario es lo mismo.",

    [k(5, "why")]:
      "Ahora los pisos tienen número con signo. Abajo de la calle, el numeral más grande nombra el piso más bajo.",
    [k(5, "goal")]: "Arrastrá a la caja la ficha del piso que está más abajo.",
    [k(5, "coach.look")]:
      "Las fichas nombran los pisos marcados. El signo dice que el piso está abajo de la calle.",
    [k(5, "coach.drop")]: "Arrastrá hasta la caja la ficha del piso que está más abajo en el edificio.",
    [k(5, "coach.reveal")]:
      "Ese es el más bajo. Manda el lugar en el edificio, no el tamaño del numeral.",

    [k(6, "why")]:
      "La distancia entre dos pisos es cuántos pisos hay que pasar. Si están de los dos lados de la calle, se cuenta de un lado y del otro.",
    [k(6, "goal")]: "Tocá la ficha que dice cuántos pisos hay entre las dos paradas.",
    [k(6, "coach.recall")]:
      "Cuántos pisos hay entre dos paradas. Tu llave: el cero no es el borde. Tocá el edificio para verlo.",

    [k(7, "why")]:
      "El cero no es un lugar fijo del mundo: se puede poner a otra altura. Los nombres de los pisos cambian y las distancias no.",
    [k(7, "goal")]: "Mudá la calle a la altura marcada y después llevá a la caja el piso más bajo.",
    [k(7, "coach.look")]: "La calle es el cero. La línea a rayas marca adónde se va a mudar.",
    [k(7, "coach.move")]: "Arrastrá la calle hasta la línea a rayas y mirá los números de los pisos.",
    [k(7, "coach.drop")]:
      "Los pisos cambiaron de nombre, pero no de lugar. Arrastrá a la caja la ficha del más bajo.",
    [k(7, "coach.reveal")]:
      "Mover el cero cambia los nombres, no las distancias. El más bajo sigue siendo el de más abajo.",

    [k(8, "why")]:
      "Un número con signo dice cuántos pasos y hacia qué lado. Eso sirve en cualquier fila, aunque no tenga números.",
    [k(8, "goal")]: "Tocá el dibujo al que lleva la ficha, contando desde el dibujo marcado.",
    [k(8, "coach.recall")]:
      "Sin números: una flecha, unos puntos y dibujos. Tu llave: mismo tramo, otro lado. La flecha dice hacia dónde.",

    "key.neg.zero_is_not_the_edge.title": "El cero no es el borde",
    "key.neg.zero_is_not_the_edge.body":
      "La fila sigue a la izquierda del cero, con pasos iguales. Esos números miden lo mismo, pero hacia el otro lado.",
    "key.neg.other_side.title": "Mismo tramo, otro lado",
    "key.neg.other_side.body":
      "Un tramo hacia atrás desde el cero termina a la misma distancia que uno hacia adelante, pero del otro lado. Como el ascensor bajo la calle.",
    "key.neg.opposites_cancel.title": "Opuestos juntos suman cero",
    "key.neg.opposites_cancel.body":
      "Una moneda y un vale del mismo tamaño se anulan. Agregar un par así no cambia el neto; sacar un vale lo sube.",
    "key.neg.two_turns_back.title": "Dos vueltas te devuelven",
    "key.neg.two_turns_back.body":
      "Darse vuelta dos veces deja mirando para donde mirabas. Lo contrario de lo contrario es lo mismo.",
    "key.neg.lower_is_less.title": "Más abajo es menor",
    "key.neg.lower_is_less.body":
      "Entre dos números es menor el que está más abajo, o más a la izquierda, aunque su numeral parezca más grande: −5 es menor que −2.",
    "key.neg.distance_crosses_zero.title": "La distancia cruza el cero",
    "key.neg.distance_crosses_zero.body":
      "Entre un piso de arriba y uno de abajo, se cuentan los pisos hasta la calle y los de la calle para abajo. Se suman, no se restan.",
    "key.neg.zero_is_a_choice.title": "El cero se elige",
    "key.neg.zero_is_a_choice.body":
      "Correr el cero les cambia el nombre a todos los números, pero ninguna distancia cambia, y el orden tampoco.",
    "key.neg.direction_and_size.title": "Cuánto y hacia dónde",
    "key.neg.direction_and_size.body":
      "Un número con signo dice dos cosas: cuántos pasos y hacia qué lado. Sirve en cualquier fila, aunque no tenga números.",
  },
  // Puntos y barras sobre una caja de 40 × 40. El punto grueso es el cero; los
  // resaltados, el lugar al que se llega o del que se habla.
  glyphs: {
    // La recta con marcas de los dos lados del cero.
    "neg.edge": {
      dots: [[20, 25, 4.5, true]],
      bars: [[3, 24, 34, 2], [7, 19, 2, 12], [13, 19, 2, 12], [25, 19, 2, 12], [31, 19, 2, 12]],
    },
    // Dos lugares a la misma distancia del cero, uno de cada lado.
    "neg.side": {
      dots: [[20, 25, 3], [8, 25, 3.5, true], [32, 25, 3.5]],
      bars: [[4, 31, 32, 2], [9, 15, 10, 2], [21, 15, 10, 2]],
    },
    // Una moneda y su vale, con el puente que los anula.
    "neg.cancel": {
      dots: [[11, 20, 5], [29, 20, 5, true]],
      bars: [[15, 19, 10, 2]],
    },
    // Tres miradas: adelante, atrás, adelante.
    "neg.turns": {
      dots: [[32, 12, 3, true], [6, 20, 3], [32, 28, 3, true]],
      bars: [[8, 11, 22, 2], [9, 19, 22, 2], [8, 27, 22, 2]],
    },
    // Pisos apilados: el de más abajo es el menor.
    "neg.lower": {
      dots: [[20, 35, 3, true]],
      bars: [[10, 7, 20, 2], [10, 14, 20, 2], [10, 21, 20, 2], [10, 28, 20, 2]],
    },
    // Una parada arriba y otra abajo de la calle: se cruza.
    "neg.distance": {
      dots: [[20, 8, 3.5, true], [20, 32, 3.5, true]],
      bars: [[19, 4, 2, 32], [11, 19, 18, 3]],
    },
    // La calle mudada: el edificio es el mismo, el cero está en otra altura.
    "neg.choice": {
      dots: [[20, 28, 3.5, true]],
      bars: [[19, 4, 2, 32], [10, 13, 20, 3], [12, 22, 4, 1.5], [18, 22, 4, 1.5], [24, 22, 4, 1.5]],
    },
    // La flecha y sus pasos, sin ningún número.
    "neg.direction": {
      dots: [[12, 29, 3, true], [20, 29, 3, true], [28, 29, 3, true]],
      bars: [[6, 15, 26, 2.5], [28, 11, 2.5, 10]],
    },
  },
};
