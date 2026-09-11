/**
 * La lección de la máquina en reversa, nivel por nivel.
 *
 * Estrenan una pregunta o un gesto, y traen su guía, el 1 (mirar la máquina ir
 * y volver), el 2 (anticipar qué sale del otro lado), el 3 (la palanca, que es
 * el gesto del nodo), el 5 (el doblez por la diagonal), el 6 (el nombre con su
 * marca), el 7 (la cadena de dos pasos) y el 8 (la máquina que no vuelve). El 4
 * repite el llavero del nodo 12 con máquinas: lleva un solo recordatorio.
 *
 * Los niveles que alternan preguntas guían la primera; en las rondas de la otra
 * la actividad le dice a Tomi que no hay gesto que señalar.
 *
 * Todo lo del nodo vive acá: la lección, sus textos (los de la línea de abajo
 * que no estaban en el diccionario van como `inv.msg.*`) y sus dibujos.
 */
import type { CoachStep, KeySpec, LessonModule } from "./types.ts";

const NODE = "alg.fn.inverse_function";

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
        key: key("inv.back_undoes", "inv.back"),
        uses: ["opkey.opposite_key"],
        coach: [step(1, "look", "tap"), step(1, "pick", { signal: "picked" }), reveal(1)],
      },
      {
        level: 2,
        whyKey: k(2, "why"),
        goalKey: k(2, "goal"),
        key: key("inv.not_twice", "inv.twice"),
        uses: ["inv.back_undoes"],
        coach: [step(2, "look", "tap"), step(2, "pick", { signal: "picked" }), reveal(2)],
      },
      {
        level: 3,
        whyKey: k(3, "why"),
        goalKey: k(3, "goal"),
        key: key("inv.lever", "inv.lever"),
        uses: ["inv.back_undoes"],
        coach: [
          step(3, "look", "tap"),
          step(3, "feed", { signal: "fed" }),
          step(3, "lever", { signal: "lever" }),
          step(3, "back", { signal: "returned" }),
          reveal(3),
        ],
      },
      {
        level: 4,
        whyKey: k(4, "why"),
        goalKey: k(4, "goal"),
        key: key("inv.machine_key", "inv.key"),
        uses: ["opkey.same_number", "opkey.round_trip"],
        coach: [step(4, "recall", "tap")],
      },
      {
        level: 5,
        whyKey: k(5, "why"),
        goalKey: k(5, "goal"),
        key: key("inv.mirror", "inv.mirror"),
        uses: ["inv.machine_key"],
        coach: [step(5, "look", "tap"), step(5, "pick", { signal: "picked" }), reveal(5)],
      },
      {
        level: 6,
        whyKey: k(6, "why"),
        goalKey: k(6, "goal"),
        key: key("inv.mark_names", "inv.mark"),
        uses: ["inv.machine_key", "comp.ring_name"],
        coach: [step(6, "look", "tap"), step(6, "pick", { signal: "picked" }), reveal(6)],
      },
      {
        level: 7,
        whyKey: k(7, "why"),
        goalKey: k(7, "goal"),
        key: key("inv.reverse_chain", "inv.order"),
        uses: ["opkey.last_first", "inv.mark_names"],
        coach: [step(7, "look", "tap"), step(7, "pick", { signal: "picked" }), reveal(7)],
      },
      {
        level: 8,
        whyKey: k(8, "why"),
        goalKey: k(8, "goal"),
        key: key("inv.one_per_output", "inv.fork"),
        uses: ["opkey.not_every_action", "inv.mirror"],
        coach: [step(8, "look", "tap"), step(8, "pick", { signal: "picked" }), reveal(8)],
      },
    ],
  },
  texts: {
    [`node.${NODE}.learned`]:
      "La inversa es la máquina de vuelta: deshace en los dos sentidos, su rastro es el espejo en la diagonal, y existe sólo si cada salida viene de una sola entrada.",

    [k(1, "why")]:
      "Una máquina que corre al revés deshace lo que hizo: la bola cambiada vuelve a ser la de antes.",
    [k(1, "goal")]: "Mirá la máquina ir y volver, y tocá la bola que volvió a ser la que era.",
    [k(1, "coach.look")]:
      "La bola entra y sale cambiada. Después la máquina corre al revés con la bola cambiada.",
    [k(1, "coach.pick")]: "Tocá, abajo, la bola que salió cuando la máquina corrió al revés.",
    [k(1, "coach.reveal")]:
      "Volvió la de antes: correr al revés deshizo lo que la máquina había hecho.",

    [k(2, "why")]:
      "Correr al revés no es correr otra vez: una vuelta deshace, y correrla de nuevo para adelante la cambia más.",
    [k(2, "goal")]: "Tocá lo que va a salir cuando la bola cambiada entre por la salida.",
    [k(2, "coach.look")]:
      "La palanca está girada: la máquina va a correr al revés con la bola cambiada.",
    [k(2, "coach.pick")]:
      "Tocá el final que va a pasar: la bola de antes, una más cambiada, o la máquina trabada.",
    [k(2, "coach.reveal")]: "Sale la de antes. Al revés, el cambio no se repite: se deshace.",

    [k(3, "why")]:
      "Con la palanca girada, la salida se vuelve entrada: por ahí se mete la bola cambiada para deshacer.",
    [k(3, "goal")]: "Soltá la bola, tirá de la palanca y metela de nuevo por donde salió.",
    [k(3, "coach.look")]: "La bola espera abajo. La máquina tiene una palanca que la da vuelta.",
    [k(3, "coach.feed")]: "Tocá la bola, o llevala a la boca de la izquierda. Va a salir cambiada.",
    [k(3, "coach.lever")]: "Ahora tirá de la palanca: tocá la máquina o el botón de abajo.",
    [k(3, "coach.back")]:
      "La máquina quedó al revés. Meté la bola cambiada: tocala o llevala a la boca de la derecha.",
    [k(3, "coach.reveal")]:
      "Volvió a ser la que era. La máquina al revés es la máquina de vuelta.",

    [k(4, "why")]:
      "La vuelta de una máquina es otra máquina: se elige del llavero como en el cofre, pero es una máquina entera.",
    [k(4, "goal")]: "Llevá a la flecha de vuelta la máquina que devuelve la bola.",
    [k(4, "coach.recall")]:
      "Acordate de «Mismo número, operación contraria». Acá la llave es una máquina: la que deshace, con su número.",

    [k(5, "why")]:
      "El rastro de la máquina de vuelta es el mismo rastro doblado por la diagonal: cada par se da vuelta.",
    [k(5, "goal")]:
      "Tocá el rastro que queda del otro lado de la diagonal, o la gota con el par dado vuelta.",
    [k(5, "coach.look")]:
      "La línea punteada es la diagonal. El rastro marca qué hace la máquina con cada entrada.",
    [k(5, "coach.pick")]:
      "Imaginá la hoja doblada por la diagonal. Tocá la curva que cae justo encima del rastro.",
    [k(5, "coach.reveal")]:
      "La hoja se dobló y los dos rastros quedaron espejados: cada par (a, b) quedó (b, a).",

    [k(6, "why")]:
      "La máquina de vuelta necesita un nombre: f⁻¹. La marca no es dividir: dice «la que deshace a f».",
    [k(6, "goal")]: "Tocá la regla de la máquina de vuelta, o lo que deja la cadena de las dos.",
    [k(6, "coach.look")]: "Arriba está f con su regla escrita. Su vuelta se va a llamar f⁻¹.",
    [k(6, "coach.pick")]: "Tocá la ficha que hace lo contrario de f, con el mismo número.",
    [k(6, "coach.reveal")]:
      "Esa es f⁻¹: la operación contraria con el mismo número. La marca es un nombre, no una cuenta.",

    [k(7, "why")]:
      "Si la máquina hace dos pasos, la vuelta los deshace al revés: primero el último.",
    [k(7, "goal")]: "Tocá la cadena que deja la bola como entró.",
    [k(7, "coach.look")]:
      "Esta máquina hace dos pasos, uno después del otro. Tocá el tablero si querés verla.",
    [k(7, "coach.pick")]: "Tocá la cadena que deshace primero el último paso.",
    [k(7, "coach.reveal")]:
      "Esa deshace de atrás hacia adelante: el último paso que tocó la bola es el primero que se da vuelta.",

    [k(8, "why")]:
      "Si dos entradas caen en la misma salida, al revés no se sabe a cuál volver. A veces se arregla admitiendo menos entradas.",
    [k(8, "goal")]:
      "Decidí si la máquina tiene vuelta, o elegí qué entradas admitir para que la tenga.",
    [k(8, "coach.look")]:
      "Abajo está el rastro de la máquina. Bajá la recta con el dedo: ¿cuántas gotas toca a cada altura?",
    [k(8, "coach.pick")]:
      "Tocá la respuesta: se puede correr al revés, hay que recortar las entradas, o no se puede.",
    [k(8, "coach.reveal")]:
      "Una gota por altura, hay vuelta; dos a la misma altura, hay que recortar; todas en una, no hay vuelta.",

    "key.inv.back_undoes.title": "Al revés, deshace",
    "key.inv.back_undoes.body":
      "Una máquina corrida al revés deshace su trabajo: la bola cambiada entra por la salida y sale la que había entrado.",
    "key.inv.not_twice.title": "Al revés no es otra vez",
    "key.inv.not_twice.body":
      "Correr la máquina al revés no la corre dos veces: deshace. Lo que sale es lo que había entrado.",
    "key.inv.lever.title": "La palanca da vuelta la máquina",
    "key.inv.lever.body":
      "Con la palanca girada, la bola entra por la salida y sale por la entrada. Así se deshace sin buscar otra máquina.",
    "key.inv.machine_key.title": "La llave es una máquina",
    "key.inv.machine_key.body":
      "La vuelta de una máquina es otra máquina: la operación contraria con el mismo número. Se reconoce porque la bola vuelve igual.",
    "key.inv.mirror.title": "La vuelta es el espejo",
    "key.inv.mirror.body":
      "El rastro de la máquina de vuelta es el mismo rastro doblado por la diagonal: el par (a, b) pasa a ser (b, a).",
    "key.inv.mark_names.title": "f⁻¹ nombra la vuelta",
    "key.inv.mark_names.body":
      "f⁻¹ es el nombre de la máquina que deshace a f, no «uno dividido f». Por eso f⁻¹(f(x)) = x: la cadena deja todo igual.",
    "key.inv.reverse_chain.title": "La vuelta invierte el orden",
    "key.inv.reverse_chain.body":
      "Si la máquina suma y después multiplica, la vuelta divide y después resta. El último paso que tocó la bola es el primero que se deshace.",
    "key.inv.one_per_output.title": "Una entrada por salida",
    "key.inv.one_per_output.body":
      "Una máquina tiene vuelta si cada salida viene de una sola entrada. Si dos caen juntas, se recortan entradas; si caen todas, no hay vuelta.",

    "inv.msg.dropOnMouth": "La bola volvió a la bandeja. Soltala en la boca de entrada, o tocala.",
    "inv.msg.dropOnArrow": "La máquina volvió al llavero. Soltala al costado derecho, donde sube la vuelta.",
    "inv.msg.ghost": "Así es la máquina, paso por paso. La vuelta la elegís vos.",
    "inv.msg.sweep": "Bajá la recta con el dedo y contá cuántas gotas toca a cada altura.",
    "inv.msg.leverFirst": "Primero soltá la bola: la máquina tiene que cambiarla antes de deshacer.",
  },
  // Puntos y barras sobre 40 × 40. El punto resaltado es el que importa.
  glyphs: {
    // La bola que va y la que vuelve, del mismo tamaño, con la máquina en el medio.
    "inv.back": {
      dots: [[5, 12, 3, true], [35, 12, 4.5], [5, 29, 3, true]],
      bars: [[12, 8, 14, 24], [8, 12, 26, 1.5], [8, 28, 26, 1.5]],
    },
    // Una vuelta devuelve la chica; dos para adelante, una más grande.
    "inv.twice": {
      dots: [[7, 20, 3, true], [20, 20, 4.5], [34, 20, 6]],
      bars: [[11, 12, 5, 1.5], [25, 12, 5, 1.5]],
    },
    // La máquina con la palanca arriba, girada.
    "inv.lever": {
      dots: [[29, 7, 3, true], [4, 25, 2.5], [36, 25, 3.5]],
      bars: [[10, 18, 20, 14], [19, 8, 2, 11], [19, 7, 10, 2]],
    },
    // El diagrama de ida y vuelta, con una máquina en la flecha que sube.
    "inv.key": {
      dots: [[20, 6, 3.5, true], [20, 34, 3.5]],
      bars: [[10, 9, 2, 22], [25, 14, 10, 12], [29, 9, 2, 5], [29, 26, 2, 5]],
    },
    // La diagonal y dos gotas espejadas a cada lado.
    "inv.mirror": {
      dots: [[10, 10, 3], [15, 15, 1.2], [20, 20, 1.2], [25, 25, 1.2], [30, 30, 1.2], [10, 28, 3.5, true], [28, 10, 3.5, true]],
    },
    // La f con la marca levantada: un nombre, no una cuenta.
    "inv.mark": {
      dots: [[31, 11, 2.5, true]],
      bars: [[12, 8, 2.5, 26], [12, 8, 9, 2.5], [8, 17, 10, 2.5], [25, 11, 5, 1.8]],
    },
    // Dos pasos de ida arriba y los mismos al revés abajo.
    "inv.order": {
      dots: [[36, 10, 2.5], [4, 30, 2.5, true]],
      bars: [[4, 5, 12, 10], [20, 6, 12, 8], [8, 26, 12, 8], [23, 25, 12, 10]],
    },
    // Dos entradas que caen en la misma salida: la vuelta no sabe a cuál ir.
    "inv.fork": {
      dots: [[6, 8, 3], [6, 32, 3], [34, 20, 3.5, true]],
      bars: [[9, 9, 14, 1.5], [9, 31, 14, 1.5], [22, 9, 1.5, 23], [23, 19.5, 9, 1.5]],
    },
  },
};
