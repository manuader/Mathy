/**
 * La lección de la llave de vuelta, nivel por nivel.
 *
 * Los seis primeros niveles estrenan un gesto cada uno (soltar la llave y
 * girar, tocar la llave, tocar el regreso, estirar la regla, completar el
 * renglón, armar el número con dígitos) y traen una guía atada a ese gesto. El
 * último repite el toque de la llave del nivel 2 sobre cerraduras que no son
 * pasos: su guía es un solo recordatorio de qué llave usar.
 *
 * Todo lo del nodo vive acá: la lección, sus textos y los dibujos de sus llaves.
 */
import type { CoachStep, KeySpec, LessonModule } from "./types.ts";

const NODE = "arith.sub.undo_add";

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
        key: key("sub.undo_same", "sub.back"),
        uses: [],
        coach: [
          step(1, "look", "tap"),
          step(1, "mount", { signal: "mounted" }),
          step(1, "turn", { signal: "opened" }),
          reveal(1),
        ],
      },
      {
        level: 2,
        whyKey: k(2, "why"),
        goalKey: k(2, "goal"),
        key: key("sub.span_not_stone", "sub.span"),
        uses: ["sub.undo_same", "count.one_by_one"],
        coach: [step(2, "look", "tap"), step(2, "pick", { signal: "opened" }), reveal(2)],
      },
      {
        level: 3,
        whyKey: k(3, "why"),
        goalKey: k(3, "goal"),
        key: key("sub.one_return", "sub.overshoot"),
        uses: ["sub.undo_same"],
        coach: [step(3, "look", "tap"), step(3, "choose", { signal: "chosen" }), reveal(3)],
      },
      {
        level: 4,
        whyKey: k(4, "why"),
        goalKey: k(4, "goal"),
        key: key("sub.distance", "sub.ruler"),
        uses: ["sub.span_not_stone"],
        coach: [
          step(4, "look", "tap"),
          step(4, "stretch", { signal: "measured" }),
          step(4, "carry", { signal: "placed" }),
          reveal(4),
        ],
      },
      {
        level: 5,
        whyKey: k(5, "why"),
        goalKey: k(5, "goal"),
        key: key("sub.two_readings", "sub.row"),
        uses: ["sub.distance", "sub.undo_same"],
        coach: [
          step(5, "look", "tap"),
          step(5, "line", { signal: "line" }),
          step(5, "fill", { signal: "placed" }),
          reveal(5),
        ],
      },
      {
        level: 6,
        whyKey: k(6, "why"),
        goalKey: k(6, "goal"),
        key: key("sub.missing_first", "sub.box"),
        uses: ["sub.two_readings"],
        coach: [
          step(6, "look", "tap"),
          step(6, "type", { signal: "typed" }),
          step(6, "carry", { signal: "placed" }),
          reveal(6),
        ],
      },
      {
        level: 7,
        whyKey: k(7, "why"),
        goalKey: k(7, "goal"),
        key: key("sub.every_action", "sub.undo"),
        uses: ["sub.undo_same"],
        coach: [step(7, "recall", "tap")],
      },
    ],
  },
  texts: {
    [`node.${NODE}.learned`]:
      "Restar es deshacer un avance: se vuelve lo mismo que se avanzó. Y la misma resta dice cuántos pasos hay entre dos piedras.",

    [k(1, "why")]:
      "Restar es deshacer un avance: volver tantos pasos como se avanzó. Sólo esa vuelta devuelve al caminante al cofre.",
    [k(1, "goal")]: "Poné una llave en la manivela y girá hasta que el caminante vuelva al cofre.",
    [k(1, "coach.look")]: "El caminante salió del cofre y avanzó hasta acá. La flecha de arriba es ese viaje.",
    [k(1, "coach.mount")]:
      "Llevá la llave marcada hasta la manivela. Con una llave puesta, la manivela gira al revés.",
    [k(1, "coach.turn")]:
      "Ahora girá la manivela. El caminante vuelve tantos pasos como dientes tiene la llave.",
    [k(1, "coach.reveal")]:
      "La vuelta midió lo mismo que la ida: las dos flechas se apagaron juntas y el cofre abrió. Restaste.",

    [k(2, "why")]:
      "La llave que deshace mide lo mismo que el viaje. Se puede elegir mirando el tramo, antes de probar.",
    [k(2, "goal")]: "Tocá la llave que devuelve al caminante justo al cofre.",
    [k(2, "coach.look")]: "Contá los pasos de la flecha de arriba. Después contá los dientes de cada llave.",
    [k(2, "coach.pick")]:
      "Tocá la llave que tiene tantos dientes como pasos tiene la flecha. La manivela gira sola.",
    [k(2, "coach.reveal")]:
      "Esa llave medía lo mismo que el viaje y abrió al primer giro. Elegiste sin probar.",

    [k(3, "why")]:
      "Una vuelta de más no deshace: deja al caminante del otro lado del cofre. Sólo una vuelta devuelve justo.",
    [k(3, "goal")]: "Tocá el caminante que vuelve un paso de más.",
    [k(3, "coach.look")]: "Los dos caminantes deshacen el mismo viaje. Mirá en qué piedra termina cada uno.",
    [k(3, "coach.choose")]: "Tocá el que se pasa del cofre y termina del otro lado.",
    [k(3, "coach.reveal")]:
      "Ese volvió un paso más de lo que había avanzado. Con un paso de más, el viaje no se deshace.",

    [k(4, "why")]:
      "Restar también mide: dice cuántos pasos hay entre dos piedras. Acá nadie saca nada.",
    [k(4, "goal")]: "Estirá la regla de un caminante al otro y traé la ficha con esa distancia.",
    [k(4, "coach.look")]: "Dos caminantes y ningún cofre. La pregunta es cuántos pasos los separan.",
    [k(4, "coach.stretch")]: "Apoyá el dedo en un caminante y estirá la regla hasta el otro.",
    [k(4, "coach.carry")]: "Contá los pasos que cubre la regla y llevá esa ficha al hueco dorado.",
    [k(4, "coach.reveal")]:
      "La regla se volvió un número: la distancia entre las dos piedras. Es una resta, la de adelante menos la de atrás.",

    [k(5, "why")]:
      "La cuenta escrita guarda el viaje: el menos es la flecha de vuelta sin la punta. Los mismos tres números sirven para deshacer y para medir.",
    [k(5, "goal")]: "Completá el renglón con la ficha que falta.",
    [k(5, "coach.look")]: "Ahora el viaje está escrito en un renglón. El menos es la flecha de vuelta, sin la punta.",
    [k(5, "coach.line")]: "Si querés ver el viaje, tocá el tablero y aparece la recta.",
    [k(5, "coach.fill")]: "Llevá al hueco la ficha que completa el renglón.",
    [k(5, "coach.reveal")]:
      "El renglón quedó completo. Los mismos tres números deshacen un viaje y también miden entre dos piedras.",

    [k(6, "why")]:
      "El renglón sirve aunque los números no entren en la recta. Si falta el primero, se rehace el viaje: sumando.",
    [k(6, "goal")]: "Armá con los dígitos el número que falta y llevalo al hueco.",
    [k(6, "coach.look")]: "Ahora falta el primer número: desde dónde se volvió. Pensá el viaje al derecho.",
    [k(6, "coach.type")]: "Tocá los dígitos para armar el número que falta.",
    [k(6, "coach.carry")]: "Arrastrá tu número hasta el hueco del renglón.",
    [k(6, "coach.reveal")]:
      "Para saber desde dónde se volvió, rehiciste el viaje: sumaste lo que se volvió a donde quedó.",

    [k(7, "why")]:
      "Deshacer no es sólo de números: cada acción que tiene vuelta se deshace con su contraria. Algunas no tienen vuelta.",
    [k(7, "goal")]: "Tocá la llave que deshace lo que le pasó al cofre.",
    [k(7, "coach.recall")]:
      "Acordate de «Volver lo mismo deshace». Acá no hay pasos: buscá la acción contraria a la del cartel.",

    "key.sub.undo_same.title": "Volver lo mismo deshace",
    "key.sub.undo_same.body":
      "Para deshacer un avance, volvé tantos pasos como avanzaste. Ni uno más ni uno menos: sólo esa vuelta te deja donde empezaste.",
    "key.sub.span_not_stone.title": "El tramo, no la piedra",
    "key.sub.span_not_stone.body":
      "La llave que deshace mide el tramo recorrido, no el número de la piedra donde se llegó. Contá los pasos del viaje.",
    "key.sub.one_return.title": "Una sola vuelta devuelve",
    "key.sub.one_return.body":
      "Una vuelta de más te deja del otro lado; una de menos no llega. Si algo no volvió justo, compará los dos tramos.",
    "key.sub.distance.title": "Restar mide la distancia",
    "key.sub.distance.body":
      "La resta también dice cuántos pasos hay entre dos piedras: la de adelante menos la de atrás. Nadie saca nada.",
    "key.sub.two_readings.title": "Tres números, dos lecturas",
    "key.sub.two_readings.body":
      "8 − 3 = 5 deshace un viaje de 3 que terminó en el 8, y también dice que del 5 al 8 hay 3 pasos.",
    "key.sub.missing_first.title": "Si falta el primero, sumá",
    "key.sub.missing_first.body":
      "En □ − 3 = 2 falta desde dónde se volvió: rehacé el viaje, 2 + 3. Restar 0 no mueve; restar todo deja en 0.",
    "key.sub.every_action.title": "Cada acción tiene su vuelta",
    "key.sub.every_action.body":
      "Sacarse el sombrero deshace ponérselo, como volver deshace avanzar. Si una acción no tiene vuelta, ninguna llave la deshace.",
  },
  // Puntos y barras sobre 40 × 40. El punto resaltado es el que importa.
  glyphs: {
    // La ida arriba, la vuelta abajo, del mismo largo: el caminante vuelve al cofre.
    "sub.back": {
      dots: [[8, 20, 4, true], [32, 20, 4]],
      bars: [[8, 10, 24, 2.5], [8, 28, 24, 2.5], [29, 7.5, 2, 7], [8, 25.5, 2, 7]],
    },
    // Cinco piedras: el tramo resaltado entre dos, no el número de la última.
    "sub.span": {
      dots: [[5, 26, 2.5], [13, 26, 3, true], [21, 26, 2.5], [29, 26, 2.5], [37, 26, 3, true]],
      bars: [[13, 14, 24, 2.5], [13, 11, 2, 8], [35, 11, 2, 8]],
    },
    // Dos vueltas desde la misma piedra: la justa llega al cofre, la otra se pasa.
    "sub.overshoot": {
      dots: [[16, 20, 4, true], [34, 20, 3], [7, 32, 3]],
      bars: [[16, 9, 18, 2.5], [7, 31, 27, 2.5]],
    },
    // Dos caminantes y la regla entre los dos, con sus pasos marcados.
    "sub.ruler": {
      dots: [[7, 16, 4, true], [33, 16, 4, true]],
      bars: [[7, 25, 26, 3], [13, 23, 1.5, 7], [20, 23, 1.5, 7], [27, 23, 1.5, 7]],
    },
    // Un renglón: número, menos, número, igual, número.
    "sub.row": {
      dots: [[5, 20, 3.5], [21, 20, 3.5], [36, 20, 3.5, true]],
      bars: [[10, 19, 6, 2], [26, 16.5, 5, 1.5], [26, 22, 5, 1.5]],
    },
    // El renglón con el primer lugar vacío: la caja que se llena sumando.
    "sub.box": {
      dots: [[23, 20, 3.5], [37, 20, 3.5]],
      bars: [
        [2, 14, 11, 1.5],
        [2, 25, 11, 1.5],
        [2, 14, 1.5, 12.5],
        [11.5, 14, 1.5, 12.5],
        [15, 19, 5, 2],
        [28, 16.5, 5, 1.5],
        [28, 22, 5, 1.5],
      ],
    },
    // Algo cambia y vuelve a ser lo que era: el punto grande en el medio, los dos chicos iguales.
    "sub.undo": {
      dots: [[7, 20, 3.5, true], [20, 20, 6], [33, 20, 3.5, true]],
      bars: [[11, 12, 7, 2], [22, 28, 7, 2]],
    },
  },
};
