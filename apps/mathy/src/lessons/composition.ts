/**
 * La lección de la cadena de máquinas, nivel por nivel.
 *
 * Los seis primeros estrenan una pregunta cada uno (tocar la bola que salió,
 * adivinar la del otro orden, enganchar el tubo, elegir entre dos carriles,
 * anticipar el contador, lazar las cajas) y traen una guía atada a la pregunta
 * de su primera ronda. El 7 repite el toque que cambia el orden, con tres cajas:
 * lleva un solo recordatorio de qué llave usar.
 *
 * Los niveles que alternan preguntas guían la primera; en las rondas de la otra
 * la actividad le dice a Tomi que no hay gesto que señalar.
 *
 * Todo lo del nodo vive acá: la lección, sus textos (los de la línea de abajo
 * que no estaban en el diccionario van como `comp.msg.*`) y sus dibujos.
 */
import type { CoachStep, KeySpec, LessonModule } from "./types.ts";

const NODE = "alg.fn.composition";

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
        key: key("comp.through_both", "comp.both"),
        uses: [],
        coach: [step(1, "look", "tap"), step(1, "pick", { signal: "picked" }), reveal(1)],
      },
      {
        level: 2,
        whyKey: k(2, "why"),
        goalKey: k(2, "goal"),
        key: key("comp.swap_changes", "comp.swap"),
        uses: ["comp.through_both"],
        coach: [step(2, "look", "tap"), step(2, "pick", { signal: "picked" }), reveal(2)],
      },
      {
        level: 3,
        whyKey: k(3, "why"),
        goalKey: k(3, "goal"),
        key: key("comp.hook_output", "comp.hook"),
        uses: ["comp.through_both"],
        coach: [
          step(3, "look", "tap"),
          step(3, "place", { signal: "placed" }),
          step(3, "second", { signal: "solved" }),
          reveal(3),
        ],
      },
      {
        level: 4,
        whyKey: k(4, "why"),
        goalKey: k(4, "goal"),
        key: key("comp.input_first", "comp.lanes"),
        uses: ["prec.order_changes", "comp.swap_changes"],
        coach: [step(4, "look", "tap"), step(4, "lane", { signal: "picked" }), reveal(4)],
      },
      {
        level: 5,
        whyKey: k(5, "why"),
        goalKey: k(5, "goal"),
        key: key("comp.ratios_multiply", "comp.gears"),
        uses: ["comp.input_first", "mul.stretch_all"],
        coach: [step(5, "look", "tap"), step(5, "pick", { signal: "picked" }), reveal(5)],
      },
      {
        level: 6,
        whyKey: k(6, "why"),
        goalKey: k(6, "goal"),
        key: key("comp.ring_name", "comp.ring"),
        uses: ["prec.inside_first", "comp.input_first"],
        coach: [step(6, "look", "tap"), step(6, "name", { signal: "lassoed" }), reveal(6)],
      },
      {
        level: 7,
        whyKey: k(7, "why"),
        goalKey: k(7, "goal"),
        key: key("comp.check_it_runs", "comp.broken"),
        uses: ["comp.input_first", "comp.ring_name"],
        coach: [step(7, "recall", "tap")],
      },
    ],
  },
  texts: {
    [`node.${NODE}.learned`]:
      "Encadenar máquinas es componer: actúa primero la de la entrada y el orden cambia la salida. f∘g es el nombre de la cadena entera.",

    [k(1, "why")]:
      "Dos máquinas en fila hacen una cadena: lo que sale de la primera entra en la segunda.",
    [k(1, "goal")]: "Mirá la cinta y tocá, abajo, la bola que salió del final.",
    [k(1, "coach.look")]:
      "La bola entra por la izquierda, pasa por la primera máquina y después por la segunda.",
    [k(1, "coach.pick")]: "Mirá la bola que llegó al final. Tocá, abajo, la que tiene su mismo tamaño.",
    [k(1, "coach.reveal")]:
      "Esa salió: pasó por las dos máquinas, en orden. La salida lleva lo que hizo cada una.",

    [k(2, "why")]:
      "Si dos máquinas cambian de lugar, la misma bola puede salir distinta: el orden es parte de la cadena.",
    [k(2, "goal")]: "Tocá la bola que saldría si las dos máquinas se dan vuelta.",
    [k(2, "coach.look")]: "Esta bola ya pasó por las dos máquinas, en este orden. Mirá cómo salió.",
    [k(2, "coach.pick")]: "Imaginá las dos máquinas al revés. Tocá, abajo, la bola que saldría entonces.",
    [k(2, "coach.reveal")]:
      "Con las máquinas dadas vuelta salió otra bola. Misma entrada, otro camino, otra salida.",

    [k(3, "why")]: "Una cadena se arma enganchando la salida de una máquina con la entrada de otra.",
    [k(3, "goal")]: "Poné en el caño las dos máquinas que llevan la bola hasta la punteada.",
    [k(3, "coach.look")]:
      "La bola punteada, a la derecha, es la que tiene que salir. Abajo están las máquinas sueltas.",
    [k(3, "coach.place")]:
      "Tocá una máquina que ayude a llegar, o llevala al caño. Entra en la primera ranura vacía.",
    [k(3, "coach.second")]: "Ahora la otra que falta para llegar a la bola punteada.",
    [k(3, "coach.reveal")]:
      "La bola atravesó las dos y salió la punteada. Dos máquinas enganchadas son una máquina nueva.",

    [k(4, "why")]:
      "La misma bola pasa por las mismas dos cajas en los dos órdenes, y sale distinta: manda la que está pegada a la entrada.",
    [k(4, "goal")]:
      "Tocá el carril que saca la bola pedida, o cambiá las cajas de lugar hasta que salga.",
    [k(4, "coach.look")]:
      "Dos carriles con las mismas cajas, en distinto orden, y la misma bola. Mirá las dos salidas.",
    [k(4, "coach.lane")]: "Tocá el carril cuya salida es igual a la bola punteada.",
    [k(4, "coach.reveal")]:
      "Mismas cajas, misma bola, otra salida: actúa primero la caja pegada a la entrada.",

    [k(5, "why")]:
      "Dos máquinas que estiran, una detrás de otra: la segunda estira lo que ya estiró la primera.",
    [k(5, "goal")]:
      "Antes de soltar la bola, elegí cuánto va a marcar el contador. O ordená las cajas.",
    [k(5, "coach.look")]:
      "Las dos máquinas estiran. La bola todavía no salió: el contador está apagado.",
    [k(5, "coach.pick")]: "Pensá cuánto va a salir y tocá esa ficha. Recién ahí corre la bola.",
    [k(5, "coach.reveal")]:
      "Eso marcó: cada máquina estiró lo que le llegó. Los dos estirones se multiplican.",

    [k(6, "why")]:
      "La cadena entera merece un nombre: f∘g. Se lee al revés que la bola: actúa primero g.",
    [k(6, "goal")]: "Nombrá las dos cajas, o resolvé la cadena escrita.",
    [k(6, "coach.look")]: "Cada caja tiene su regla escrita. Van a tener nombre: f y g.",
    [k(6, "coach.name")]:
      "Tocá cada caja: su regla se vuelve una letra. Con las dos nombradas, se cierra el lazo.",
    [k(6, "coach.reveal")]:
      "El lazo metió las dos en una caja: f∘g. Actúa primero g, la pegada a la entrada.",

    [k(7, "why")]:
      "Con tres máquinas conviene escribir. Y antes de correr hay que mirar: si la cadena corre y si el orden importa.",
    [k(7, "goal")]:
      "Ordená las tres cajas, decidí si el orden da igual, o descartá la cadena que no corre.",
    [k(7, "coach.recall")]:
      "Acordate de «Primero actúa la de la entrada». Con tres cajas vale lo mismo: seguí la bola desde la boca.",

    "key.comp.through_both.title": "Atraviesa las dos máquinas",
    "key.comp.through_both.body":
      "Lo que entra en una cadena pasa por la primera máquina, y lo que sale de ahí entra en la segunda. La salida lleva las dos cosas.",
    "key.comp.swap_changes.title": "Dar vuelta cambia la salida",
    "key.comp.swap_changes.body":
      "Con las mismas dos máquinas en el otro orden, la misma bola suele salir distinta. Pintar y tapar no es tapar y pintar.",
    "key.comp.hook_output.title": "La salida entra en otra",
    "key.comp.hook_output.body":
      "Una cadena se arma enganchando la salida de una máquina con la entrada de la siguiente. Dos enganchadas son una máquina nueva.",
    "key.comp.input_first.title": "Primero actúa la de la entrada",
    "key.comp.input_first.body":
      "En una cadena manda el orden del caño: actúa primero la máquina pegada a la entrada. Cambiar el orden cambia la salida.",
    "key.comp.ratios_multiply.title": "Los estirones se multiplican",
    "key.comp.ratios_multiply.body":
      "Dos máquinas que estiran, una tras otra: la segunda estira lo ya estirado. Por 2 y después por 3 es por 6, no por 5.",
    "key.comp.ring_name.title": "f∘g empieza por g",
    "key.comp.ring_name.body":
      "f∘g nombra la cadena entera. Actúa primero g, la pegada a la entrada, aunque se escriba a la derecha: f(g(3)) se calcula desde adentro.",
    "key.comp.check_it_runs.title": "Mirá si la cadena corre",
    "key.comp.check_it_runs.body":
      "Una cadena existe si lo que sale de una máquina puede entrar en la siguiente. Y hay pares que dan igual en los dos órdenes: se prueba con un ejemplo.",

    "comp.msg.dropOnPipe": "La máquina volvió al cajón. Soltala sobre el caño.",
    "comp.msg.dropOnSpout": "La ficha volvió al cajón. Soltala en el pico, a la derecha, o tocala.",
    "comp.msg.ghost": "Así están las cajas, en ese orden. La bola no corre: la cuenta es tuya.",
    "comp.msg.pickAgain": "Esa no es. Mirá otra vez la bola del final: el tamaño la dice.",
  },
  // Puntos y barras sobre 40 × 40. El punto resaltado es el que importa.
  glyphs: {
    // La bola que entra chica, las dos cajas, y la que sale grande.
    "comp.both": {
      dots: [[3, 20, 2], [37, 20, 4, true]],
      bars: [[3, 19, 32, 2], [8, 13, 9, 14], [22, 13, 9, 14]],
    },
    // Las mismas dos cajas en los dos órdenes, y dos salidas distintas.
    "comp.swap": {
      dots: [[36, 11, 2.5], [36, 30, 4, true]],
      bars: [[2, 10, 30, 1.5], [6, 6, 8, 9], [18, 7, 8, 7], [2, 29, 30, 1.5], [6, 26, 8, 7], [18, 25, 8, 9]],
    },
    // El tubo que va de la salida de una caja a la entrada de la otra.
    "comp.hook": {
      dots: [[20, 20, 3, true]],
      bars: [[4, 12, 10, 16], [26, 12, 10, 16], [14, 19, 12, 2]],
    },
    // Dos carriles: la caja pegada a la entrada es la que manda.
    "comp.lanes": {
      dots: [[7, 11, 3, true], [7, 29, 3]],
      bars: [[4, 10, 32, 1.5], [12, 6, 8, 9], [24, 7, 6, 7], [4, 28, 32, 1.5], [12, 25, 6, 7], [24, 24, 8, 9]],
    },
    // Dos ruedas: la segunda gira más veces de lo que giró la primera.
    "comp.gears": {
      dots: [[11, 20, 7], [29, 20, 4, true], [11, 20, 2], [29, 20, 1.2]],
      bars: [[18, 19, 6, 2]],
    },
    // El lazo que rodea las dos cajas: la cadena vuelta una sola.
    "comp.ring": {
      dots: [[20, 7, 2.5, true]],
      bars: [[3, 12, 34, 1.5], [3, 32, 34, 1.5], [3, 12, 1.5, 21.5], [35.5, 12, 1.5, 21.5], [8, 17, 10, 11], [22, 17, 10, 11]],
    },
    // La cadena que se traba: la bola llega a la segunda caja y no entra.
    "comp.broken": {
      dots: [[20, 20, 3, true]],
      bars: [[2, 19, 14, 2], [4, 13, 8, 14], [26, 13, 10, 14], [22, 12, 1.5, 16]],
    },
  },
};
