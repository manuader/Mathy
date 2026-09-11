/**
 * La lección de cofres anidados, nivel por nivel.
 *
 * El nivel 1 estrena la pregunta del nodo (en qué orden se abren dos cofres), el
 * 4 la ecuación escrita con su pila de renglones y el 6 la llave que se arma con
 * dos piezas: los tres traen una guía atada a eso. Los demás repiten el gesto de
 * llevar una llave a la cerradura de afuera con otra piel, otra trampa o casos
 * raros, y su guía es un solo recordatorio de qué llave usar.
 *
 * Todo lo del nodo vive acá: la lección, sus textos y los dibujos de sus llaves.
 */
import type { CoachStep, KeySpec, LessonModule } from "./types.ts";

const NODE = "alg.eq.multi_step";

const k = (n: number, part: string): string => `lesson.${NODE}.${n}.${part}`;

const step = (n: number, id: string, advance: CoachStep["advance"]): CoachStep => ({
  id,
  textKey: k(n, `coach.${id}`),
  advance,
});

/** El paso que explica el resultado: la ronda espera a que se lea. */
const reveal = (n: number): CoachStep => ({ ...step(n, "reveal", "tap"), holds: true });

const recall = (n: number): CoachStep => step(n, "recall", "tap");

const key = (id: string, glyph: string): KeySpec => ({
  id,
  titleKey: `key.${id}.title`,
  bodyKey: `key.${id}.body`,
  glyph,
});

/** Lo que la actividad dice en la línea de abajo. */
export const eqnMsg = (id: string): string => `lesson.${NODE}.msg.${id}`;

export const MODULE: LessonModule = {
  lesson: {
    node: NODE,
    learnedKey: `node.${NODE}.learned`,
    levels: [
      {
        level: 1,
        whyKey: k(1, "why"),
        goalKey: k(1, "goal"),
        key: key("eqn.outside_first", "eqn.nest"),
        uses: ["prec.undo_outside", "eq1.contrary_opens"],
        coach: [
          step(1, "look", "tap"),
          step(1, "outer", { signal: "opened" }),
          step(1, "inner", { signal: "solved" }),
          reveal(1),
        ],
      },
      {
        level: 2,
        whyKey: k(2, "why"),
        goalKey: k(2, "goal"),
        key: key("eqn.each_lock_contrary", "eqn.locks"),
        uses: ["eqn.outside_first", "eq1.contrary_opens"],
        coach: [recall(2)],
      },
      {
        level: 3,
        whyKey: k(3, "why"),
        goalKey: k(3, "goal"),
        key: key("eqn.last_done_first", "eqn.ladder"),
        uses: ["eqn.outside_first", "prec.tree"],
        coach: [recall(3)],
      },
      {
        level: 4,
        whyKey: k(4, "why"),
        goalKey: k(4, "goal"),
        key: key("eqn.each_row_a_step", "eqn.rows"),
        uses: ["eq1.key_on_both_sides", "eqn.outside_first"],
        // El paso de hacer espera la ronda entera y no el primer cofre: la
        // explicación habla de la pila de renglones y de la x sola, y con un
        // solo cofre abierto todavía no hay ninguna de las dos cosas.
        coach: [step(4, "look", "tap"), step(4, "open", { signal: "solved" }), reveal(4)],
      },
      {
        level: 5,
        whyKey: k(5, "why"),
        goalKey: k(5, "goal"),
        key: key("eqn.crossing_tilts", "eqn.cross"),
        uses: ["eqn.each_row_a_step", "bal.same_to_both"],
        coach: [recall(5)],
      },
      {
        level: 6,
        whyKey: k(6, "why"),
        goalKey: k(6, "goal"),
        key: key("eqn.build_the_key", "eqn.build"),
        uses: ["eqn.outside_first", "eq1.contrary_opens"],
        coach: [
          step(6, "look", "tap"),
          step(6, "op", { signal: "opPicked" }),
          step(6, "number", { signal: "opened" }),
          reveal(6),
        ],
      },
      {
        level: 7,
        whyKey: k(7, "why"),
        goalKey: k(7, "goal"),
        key: key("eqn.some_have_no_key", "eqn.zero"),
        uses: ["eqn.outside_first", "eqn.each_row_a_step"],
        coach: [recall(7)],
      },
    ],
  },
  texts: {
    [`node.${NODE}.learned`]:
      "Una ecuación de varios pasos es un cofre adentro de otro: se abre de afuera hacia adentro, cada capa con su contraria y siempre en los dos lados del igual.",

    [k(1, "why")]:
      "Cuando a la x le hicieron dos cosas, quedan dos cofres, uno adentro del otro. Sólo el de afuera tiene la cerradura a mano.",
    [k(1, "goal")]: "Abrí los cofres en orden, del de afuera al de adentro.",
    [k(1, "coach.look")]:
      "La x está en el cofre chico, adentro del grande. La cerradura del grande es la única que se alcanza.",
    [k(1, "coach.outer")]:
      "Llevá a la cerradura del cofre de afuera la llave que la abre, o tocá esa llave.",
    [k(1, "coach.inner")]: "El cofre de adentro quedó a mano. Llevale su llave.",
    [k(1, "coach.reveal")]:
      "Abriste de afuera hacia adentro: lo último que le hicieron a la x fue lo primero en deshacerse.",

    [k(2, "why")]:
      "Cada cofre se abre con la operación contraria a su cerradura, y el orden lo sigue diciendo el encastre.",
    [k(2, "goal")]: "Abrí los cofres en orden, cada uno con su contraria.",
    [k(2, "coach.recall")]:
      "Acordate de «Primero el de afuera». Ahora las cerraduras pueden ser por o dividido: la llave es la contraria.",

    [k(3, "why")]:
      "El árbol del costado dice en qué orden se armó la cuenta. Se deshace al revés: lo último que se hizo, primero.",
    [k(3, "goal")]: "Abrí los cofres en orden; el árbol te dice cuál va primero.",
    [k(3, "coach.recall")]:
      "Acordate de «Primero el de afuera». El árbol del costado lo muestra: arriba está el cofre de afuera.",

    [k(4, "why")]:
      "La ecuación escrita guarda los cofres. Cada llave escribe un renglón nuevo, más corto, y todos dicen la misma igualdad.",
    [k(4, "goal")]: "Abrí los cofres en orden y mirá cómo se escribe cada paso.",
    [k(4, "coach.look")]:
      "Abajo de los cofres está su ecuación. Cada llave que uses va a dejar un renglón escrito arriba.",
    [k(4, "coach.open")]:
      "Abrí los dos cofres, de afuera hacia adentro. Mirá qué renglón escribe cada llave.",
    [k(4, "coach.reveal")]:
      "Cada llave escribió un renglón más corto. Leídos de arriba abajo, cuentan cómo se despejó la x.",

    [k(5, "why")]:
      "Pasar un número al otro lado del igual sin cambiarlo no despeja: tuerce la barra. Lo que despeja es la contraria en los dos lados.",
    [k(5, "goal")]: "Despejá la x con las llaves que se aplican a los dos lados.",
    [k(5, "coach.recall")]:
      "Acordate de «Cada renglón, una llave». La llave con el mismo signo que la cerradura pasa el número sin cambiarlo: tuerce la barra.",

    [k(6, "why")]:
      "Una llave es una operación y un número. Ya no vienen armadas: se arman con la contraria de la cerradura de afuera.",
    [k(6, "goal")]: "Armá cada llave con una operación y un número, y abrí los cofres.",
    [k(6, "coach.look")]:
      "Ya no hay cofres dibujados: está la ecuación. Las piezas de operación y los números están abajo.",
    [k(6, "coach.op")]: "Tocá la operación contraria a la de afuera de la ecuación.",
    [k(6, "coach.number")]: "Ahora tocá su número. La llave queda armada y prueba la cerradura.",
    [k(6, "coach.reveal")]:
      "Armaste la llave con la contraria y su número. Así se abre cualquier cerradura, aunque no te la den hecha.",

    [k(7, "why")]:
      "Dos capas de la misma operación se abren en cualquier orden. Y si a la x la multiplicaron por cero, no hay llave: o no hay tesoro o abre con cualquiera.",
    [k(7, "goal")]: "Despejá la x, o decí qué clase de cofre es.",
    [k(7, "coach.recall")]:
      "Acordate de «Primero el de afuera». Si los cofres son del mismo tamaño, cualquiera va primero; si uno es raro, abrilo y mirá.",

    // Lo que la actividad dice en la línea de abajo.
    [eqnMsg("dropOff")]: "La llave volvió al llavero. Soltala sobre la cerradura de afuera, o tocala.",
    [eqnMsg("tileBack")]: "La ficha volvió. Tocala, o soltala sobre la ecuación.",
    [eqnMsg("pipeOpen")]: "Con la tubería abierta las llaves descansan. Ocultala para seguir.",

    "key.eqn.outside_first.title": "Primero el de afuera",
    "key.eqn.outside_first.body":
      "Con un cofre adentro de otro, sólo el de afuera tiene la cerradura a mano. Abrilo primero y el de adentro queda libre.",
    "key.eqn.each_lock_contrary.title": "Cada cofre, su contraria",
    "key.eqn.each_lock_contrary.body":
      "Cada cerradura se abre con su operación contraria: ×3 con ÷3, −2 con +2. El orden lo dice el encastre.",
    "key.eqn.last_done_first.title": "Lo último, primero",
    "key.eqn.last_done_first.body":
      "La cuenta se armó de adentro hacia afuera y se deshace al revés: la última operación que se hizo es la primera llave.",
    "key.eqn.each_row_a_step.title": "Cada renglón, una llave",
    "key.eqn.each_row_a_step.body":
      "Cada llave escribe un renglón nuevo, más corto, y todos son la misma igualdad. De arriba abajo cuentan el despeje.",
    "key.eqn.crossing_tilts.title": "Cruzar el igual tuerce",
    "key.eqn.crossing_tilts.body":
      "Pasar un número al otro lado sin cambiarlo tuerce la barra. Lo que despeja es aplicar la contraria a los dos lados.",
    "key.eqn.build_the_key.title": "La llave se arma",
    "key.eqn.build_the_key.body":
      "Una llave es una operación y un número: la contraria de la cerradura de afuera, con su mismo número.",
    "key.eqn.some_have_no_key.title": "Hay cofres sin llave",
    "key.eqn.some_have_no_key.body":
      "Capas de la misma operación se abren en cualquier orden. Si a la x la multiplicaron por cero, no hay llave: no hay tesoro o abre con cualquiera.",
  },
  // Puntos y barras sobre 40 × 40. El punto resaltado es el que importa.
  glyphs: {
    // Un cofre adentro de otro; la cerradura de afuera resaltada.
    "eqn.nest": {
      dots: [[20, 22, 3], [32, 30, 2.5, true]],
      bars: [
        [4, 8, 32, 2],
        [4, 34, 32, 2],
        [4, 8, 2, 28],
        [34, 8, 2, 28],
        [12, 16, 16, 1.5],
        [12, 28, 16, 1.5],
        [12, 16, 1.5, 13],
        [26.5, 16, 1.5, 13],
      ],
    },
    // Dos cerraduras con su contraria al lado.
    "eqn.locks": { dots: [], card: "÷×" },
    // El árbol: arriba lo último que se hizo, abajo la x.
    "eqn.ladder": {
      dots: [[20, 7, 3.5, true], [20, 20, 3], [20, 33, 3]],
      bars: [[19, 10, 2, 7], [19, 23, 2, 7], [24, 5, 8, 2], [24, 18, 8, 2]],
    },
    // Tres renglones que se acortan.
    "eqn.rows": {
      dots: [[35, 33, 2.5, true]],
      bars: [[4, 8, 32, 2], [8, 17, 24, 2], [12, 26, 16, 2], [14, 32, 12, 2]],
    },
    // Una ficha cruza el igual y la barra se tuerce.
    "eqn.cross": {
      dots: [[30, 12, 3.5, true]],
      bars: [[4, 26, 32, 2.5], [18, 18, 4, 1.5], [18, 22, 4, 1.5], [10, 12, 14, 1.5]],
    },
    // Una operación y un número que se juntan en una llave.
    "eqn.build": {
      dots: [[30, 20, 4, true]],
      bars: [[5, 18, 10, 3], [8.5, 14.5, 3, 10], [18, 19, 6, 1.5]],
    },
    // Por cero: el cofre queda vacío.
    "eqn.zero": { dots: [], card: "×0" },
  },
};
