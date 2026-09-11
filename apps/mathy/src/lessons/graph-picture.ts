/**
 * La lección del rastro del caminante (`alg.fn.graph_as_picture`), nivel por
 * nivel.
 *
 * Seis niveles estrenan algo y traen una guía atada a eso: tocar la gota que
 * dejó el caminante (1), elegir por dónde sigue el rastro (2), arrastrar al
 * caminante (3), leer el par de una gota por sus hilos (5), soltar una gota en
 * la hoja (6) y bajar la recta vertical (8). El 4 repite el caminante bajo el
 * nivel del mar y el 7 repite leer y ubicar con rastros más difíciles: su guía
 * es un solo recordatorio de qué llave usar.
 *
 * Los niveles 5, 6 y 7 alternan dos preguntas y la guía acompaña sólo la
 * primera ronda; por eso su objetivo nombra las dos, y la actividad le dice a
 * Tomi qué paso vale en cada ronda (`preferHint`).
 */
import type { CoachStep, KeySpec, LessonModule } from "./types.ts";

const NODE = "alg.fn.graph_as_picture";

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

/** Lo que la actividad dice en la línea de abajo y no estaba escrito antes. */
const msg = (id: string): string => `lesson.${NODE}.msg.${id}`;

export const GP_MSG = {
  tapADrop: msg("tapADrop"),
  dropBack: msg("dropBack"),
  sweepFirst: msg("sweepFirst"),
} as const;

export const MODULE: LessonModule = {
  lesson: {
    node: NODE,
    learnedKey: `node.${NODE}.learned`,
    levels: [
      {
        level: 1,
        whyKey: k(1, "why"),
        goalKey: k(1, "goal"),
        key: key("graph.drop_above_place", "graph.above"),
        uses: ["line.marks_are_numbers"],
        coach: [step(1, "look", "tap"), step(1, "spot", { signal: "spotted" }), reveal(1)],
      },
      {
        level: 2,
        whyKey: k(2, "why"),
        goalKey: k(2, "goal"),
        key: key("graph.one_height", "graph.oneHeight"),
        uses: ["fn.one_output"],
        coach: [step(2, "look", "tap"), step(2, "pick", { signal: "picked" }), reveal(2)],
      },
      {
        level: 3,
        whyKey: k(3, "why"),
        goalKey: k(3, "goal"),
        key: key("graph.walk_writes", "graph.trace"),
        uses: ["graph.drop_above_place"],
        coach: [
          step(3, "look", "tap"),
          step(3, "walk", { signal: "stepped" }),
          step(3, "cover", { signal: "covered" }),
          reveal(3),
        ],
      },
      {
        level: 4,
        whyKey: k(4, "why"),
        goalKey: k(4, "goal"),
        key: key("graph.below_zero", "graph.below"),
        uses: ["graph.walk_writes", "neg.other_side"],
        coach: [step(4, "recall", "tap")],
      },
      {
        level: 5,
        whyKey: k(5, "why"),
        goalKey: k(5, "goal"),
        key: key("graph.two_threads", "graph.threads"),
        uses: ["graph.drop_above_place", "line.marks_are_numbers"],
        coach: [step(5, "look", "tap"), step(5, "read", { signal: "read" }), reveal(5)],
      },
      {
        level: 6,
        whyKey: k(6, "why"),
        goalKey: k(6, "goal"),
        key: key("graph.pair_order", "graph.order"),
        uses: ["graph.two_threads", "neg.direction_and_size"],
        coach: [step(6, "look", "tap"), step(6, "drag", { signal: "placed" }), reveal(6)],
      },
      {
        level: 7,
        whyKey: k(7, "why"),
        goalKey: k(7, "goal"),
        key: key("graph.pair_names", "graph.twoTraces"),
        uses: ["graph.pair_order", "graph.one_height"],
        coach: [step(7, "recall", "tap")],
      },
      {
        level: 8,
        whyKey: k(8, "why"),
        goalKey: k(8, "goal"),
        key: key("graph.vertical_test", "graph.vertical"),
        uses: ["graph.one_height", "fn.one_output"],
        coach: [
          step(8, "look", "tap"),
          step(8, "sweep", { signal: "swept" }),
          step(8, "answer", { signal: "judged" }),
          reveal(8),
        ],
      },
    ],
  },
  texts: {
    [`node.${NODE}.learned`]:
      "La gráfica es la máquina entera, vista de una vez: una gota por entrada, a la altura de su salida. Cada gota se nombra con un par, primero la posición y después la altura.",

    [k(1, "why")]:
      "El caminante lleva un lápiz: en cada lugar deja una gota a la altura en que estaba. La hoja guarda todas sus alturas juntas.",
    [k(1, "goal")]: "Tocá la gota que el caminante dejó en el lugar marcado.",
    [k(1, "coach.look")]:
      "El caminante ya cruzó el terreno y la hoja quedó escrita. Abajo de la hoja, un triángulo marca un lugar.",
    [k(1, "coach.spot")]:
      "Subí derecho desde el triángulo y tocá la gota que encontrás. Las gotas con anillo son las que se pueden elegir.",
    [k(1, "coach.reveal")]:
      "Esa gota está justo arriba del lugar: es la altura que tenía el caminante ahí. La hoja es su recorrido, gota por gota.",

    [k(2, "why")]:
      "El rastro copia la altura del terreno, lugar por lugar. Por eso se puede adivinar cómo sigue, y hay líneas que ningún caminante puede dejar.",
    [k(2, "goal")]: "Tocá la línea por donde va a seguir el rastro.",
    [k(2, "coach.look")]:
      "El caminante se detuvo a mitad de camino. Mirá el terreno que le queda: sube, baja o sigue plano.",
    [k(2, "coach.pick")]:
      "Hay tres líneas de colores que siguen el rastro. Tocá la que copia el terreno que viene.",
    [k(2, "coach.reveal")]:
      "Por ahí sigue: la línea copia el terreno, sube y baja con él. La que volvía para atrás ponía dos alturas en un mismo lugar.",

    [k(3, "why")]:
      "Ahora el caminante lo movés vos. Cada paso deja su gota, y la hoja completa es la gráfica: todas las alturas, cada una en su lugar.",
    [k(3, "goal")]: "Arrastrá al caminante por todo el terreno hasta que la hoja tenga todas sus gotas.",
    [k(3, "coach.look")]:
      "A la izquierda está el caminante sobre el terreno. A la derecha, la hoja vacía donde cae la tinta.",
    [k(3, "coach.walk")]:
      "Arrastrá al caminante un paso hacia la derecha, o tocá el terreno más adelante. Mirá dónde cae la gota.",
    [k(3, "coach.cover")]:
      "Seguí hasta el final del terreno. Si volvés sobre tus pasos, esa gota ya estaba y no se repite.",
    [k(3, "coach.reveal")]:
      "La hoja quedó completa: una gota por lugar, ninguna repetida. Esa línea es la gráfica, y la escribiste caminando.",

    [k(4, "why")]:
      "El terreno baja del nivel del mar y el camino empieza antes del cero. La hoja se abre hacia abajo y hacia la izquierda.",
    [k(4, "goal")]: "Arrastrá al caminante por todo el terreno, también bajo el nivel del mar.",
    [k(4, "coach.recall")]:
      "Es el mismo caminante. Tu llave: caminar escribe la gráfica. Bajo el nivel del mar, fijate de qué lado de la línea cae la gota.",

    [k(5, "why")]:
      "Desde cada gota bajan dos hilos: uno hasta la regla de abajo y otro hasta la del costado. Esos dos números nombran la gota.",
    [k(5, "goal")]:
      "Tocá el par que nombra la gota encendida. En las otras rondas, caminá hasta completar la hoja.",
    [k(5, "coach.look")]:
      "La gota encendida tiene dos hilos. El de abajo llega a la posición; el del costado, a la altura.",
    [k(5, "coach.read")]:
      "Abajo hay pares escritos. Tocá el que dice primero la posición y después la altura de esa gota.",
    [k(5, "coach.reveal")]:
      "Ese par es la gota: el primer número es dónde está, el segundo qué tan alto. Leíste la gráfica con sus dos hilos.",

    [k(6, "why")]:
      "El terreno ya no está: queda la hoja con sus ejes. Con un par escrito se puede poner una gota en su lugar sin caminar.",
    [k(6, "goal")]:
      "Soltá la gota en el lugar que dice el par. En las otras rondas, tocá el par de la gota encendida.",
    [k(6, "coach.look")]:
      "Abajo a la izquierda hay una gota y, al lado, su par. En la hoja falta justo esa gota.",
    [k(6, "coach.drag")]:
      "Arrastrá la gota hasta la hoja. Primer número, cuántos pasos hacia el costado; segundo, cuánto hacia arriba.",
    [k(6, "coach.reveal")]:
      "La gota entró en el hueco del rastro. Posición primero, altura después: dado vuelta, el par cae en otro lugar.",

    [k(7, "why")]:
      "Rastros con saltos, con huecos y dos rastros en la misma hoja. Señalar con el dedo ya no alcanza: el par dice exactamente cuál gota es.",
    [k(7, "goal")]: "Tocá el par de la gota encendida, o soltá la gota donde dice el par.",
    [k(7, "coach.recall")]:
      "Ya sabés leer y ubicar gotas. Tu llave: primero la posición, después la altura. Con dos rastros, el par dice de cuál es.",

    [k(8, "why")]:
      "No toda curva puede ser el rastro de una máquina. Una recta vertical lo decide: si corta la curva dos veces en algún lugar, hay dos alturas ahí.",
    [k(8, "goal")]: "Pasá la recta vertical por la curva y decí si puede ser un rastro.",
    [k(8, "coach.look")]:
      "Ésta es una curva cualquiera, dibujada a mano. La pregunta es si algún caminante pudo dejarla.",
    [k(8, "coach.sweep")]:
      "Arrastrá el dedo sobre la hoja de un lado al otro: la recta vertical te sigue. Mirá cuántas veces corta la curva.",
    [k(8, "coach.answer")]:
      "Si en algún lugar la cortó dos veces, no puede ser un rastro. Elegí abajo tu respuesta.",
    [k(8, "coach.reveal")]:
      "La recta vertical es un lugar: donde corta dos veces, hay dos alturas. Una máquina da una sola, y su rastro también.",

    [GP_MSG.tapADrop]: "Tocá una de las gotas con anillo.",
    [GP_MSG.dropBack]: "La gota volvió al borde. Soltala adentro de la hoja.",
    [GP_MSG.sweepFirst]: "Antes de decidir, pasá la recta vertical por toda la curva.",

    "key.graph.drop_above_place.title": "Subí derecho hasta la gota",
    "key.graph.drop_above_place.body":
      "Para saber qué altura tuvo el caminante en un lugar, subí derecho desde ese lugar hasta la gota. Cada lugar tiene la suya.",
    "key.graph.one_height.title": "Una altura por lugar",
    "key.graph.one_height.body":
      "Sobre cada lugar hay una sola gota. Una línea que vuelve para atrás pone dos alturas en el mismo lugar, y ningún caminante deja ese rastro.",
    "key.graph.walk_writes.title": "Caminar escribe la gráfica",
    "key.graph.walk_writes.body":
      "Cada paso deja una gota; todas juntas son la gráfica. Volver sobre tus pasos no agrega nada, porque esa gota ya estaba.",
    "key.graph.below_zero.title": "Bajo el mar, altura negativa",
    "key.graph.below_zero.body":
      "Bajo el nivel del mar la gota cae debajo de la línea del cero: altura negativa. Caminar para atrás del arranque la pone a la izquierda.",
    "key.graph.two_threads.title": "Dos hilos, dos números",
    "key.graph.two_threads.body":
      "Desde una gota bajan dos hilos: el de abajo dice la posición y el del costado, la altura. Con esos dos números la gota se nombra sin señalarla.",
    "key.graph.pair_order.title": "Primero dónde, después cuánto",
    "key.graph.pair_order.body":
      "(3, 5) es posición 3 y altura 5. Dado vuelta, (5, 3) es otra gota en otro lugar: el orden del par importa.",
    "key.graph.pair_names.title": "El par dice cuál gota",
    "key.graph.pair_names.body":
      "Con dos rastros en la hoja, o con saltos y huecos, el par nombra la gota exacta. Un salto no rompe la regla: sigue habiendo una altura por lugar, o ninguna.",
    "key.graph.vertical_test.title": "La recta vertical decide",
    "key.graph.vertical_test.body":
      "Pasá una recta vertical por toda la curva. Si en algún lugar la corta dos veces, ahí hay dos alturas y no es el rastro de una máquina.",
  },
  // Puntos y barras sobre una caja de 40 × 40. Resaltado (azul) es lo que la
  // llave enseña a mirar.
  glyphs: {
    // Un lugar marcado en la regla y su gota, derecho arriba.
    "graph.above": {
      dots: [[20, 11, 4, true], [9, 22, 2.5], [31, 17, 2.5]],
      bars: [[4, 32, 32, 2], [19, 28, 2, 7], [19.5, 16, 1, 3], [19.5, 21, 1, 3]],
    },
    // Una recta vertical que atraviesa el rastro en una sola gota.
    "graph.oneHeight": {
      dots: [[7, 26, 3], [13, 21, 3], [20, 17, 4, true], [27, 20, 3], [33, 24, 3]],
      bars: [[19, 4, 2, 32]],
    },
    // Las gotas del rastro, una por paso, subiendo y bajando.
    "graph.trace": {
      dots: [[6, 28, 3], [13, 22, 3], [20, 15, 3], [27, 19, 3], [34, 25, 3.5, true]],
      bars: [[4, 34, 32, 2]],
    },
    // La línea del cero y una gota que cae debajo.
    "graph.below": {
      dots: [[8, 12, 3], [16, 16, 3], [24, 26, 3.5, true], [32, 30, 3.5, true]],
      bars: [[4, 20, 32, 2]],
    },
    // Una gota con sus dos hilos hasta las reglas.
    "graph.threads": {
      dots: [[27, 13, 4, true]],
      bars: [[4, 33, 32, 2], [4, 6, 2, 29], [26.5, 17, 1.5, 16], [6, 12.5, 17, 1.5]],
    },
    // Dos gotas con los mismos números en otro orden: dos lugares distintos.
    "graph.order": {
      dots: [[14, 10, 4, true], [30, 26, 3.5]],
      bars: [[4, 34, 32, 2], [4, 4, 2, 32]],
    },
    // Dos rastros en la misma hoja y una gota elegida.
    "graph.twoTraces": {
      dots: [[6, 10, 2.5], [14, 14, 2.5], [22, 18, 2.5], [30, 22, 2.5], [6, 30, 2.5], [14, 26, 2.5], [22, 22, 2.5], [30, 18, 4, true]],
    },
    // Una curva que se cierra y la recta que la corta dos veces.
    "graph.vertical": {
      dots: [[20, 9, 3.5, true], [20, 31, 3.5, true], [10, 14, 2.5], [8, 22, 2.5], [12, 29, 2.5], [30, 13, 2.5], [32, 22, 2.5], [28, 30, 2.5]],
      bars: [[19, 3, 2, 34]],
    },
  },
};
