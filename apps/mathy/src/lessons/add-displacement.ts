/**
 * La lección del viaje de dos tramos, nivel por nivel.
 *
 * Estrenan gesto y traen guía de varios pasos: la ficha sobre la manivela (1),
 * decir la llegada antes de girar (2), los dos tramos con el libro y las dos
 * pistas que se comparan (3), la ficha que hace el viaje de un tirón (4) y el
 * renglón con la recta a pedido (5). El 6 y el 7 repiten el renglón con números
 * más difíciles: su guía es un recordatorio de la llave que los resuelve.
 *
 * Todo lo del nodo vive acá: la lección, sus textos y los dibujos de sus llaves.
 */
import type { CoachStep, KeySpec, LessonModule } from "./types.ts";

const NODE = "arith.add.displacement";

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
        key: key("add.chip_is_a_jump", "add.jump"),
        uses: ["line.one_tooth_one_stone"],
        coach: [
          step(1, "look", "tap"),
          step(1, "load", { signal: "loaded" }),
          step(1, "pull", { signal: "arrived" }),
          reveal(1),
        ],
      },
      {
        level: 2,
        whyKey: k(2, "why"),
        goalKey: k(2, "goal"),
        key: key("add.count_from_start", "add.fromStart"),
        uses: ["line.count_the_jumps", "add.chip_is_a_jump"],
        coach: [
          step(2, "look", "tap"),
          step(2, "predict", { signal: "predicted" }),
          step(2, "pull", { signal: "arrived" }),
          reveal(2),
        ],
      },
      {
        level: 3,
        whyKey: k(3, "why"),
        goalKey: k(3, "goal"),
        key: key("add.order_does_not_matter", "add.order"),
        uses: ["add.chip_is_a_jump", "add.count_from_start"],
        coach: [
          step(3, "look", "tap"),
          step(3, "legs", { signal: "arrived" }),
          step(3, "swap", { signal: "swapped" }),
          step(3, "choose", { signal: "chosen" }),
          reveal(3),
        ],
      },
      {
        level: 4,
        whyKey: k(4, "why"),
        goalKey: k(4, "goal"),
        key: key("add.arrows_join", "add.arrows"),
        uses: ["add.order_does_not_matter", "add.chip_is_a_jump"],
        coach: [
          step(4, "look", "tap"),
          step(4, "legs", { signal: "arrived" }),
          step(4, "total", { signal: "answered" }),
          reveal(4),
        ],
      },
      {
        level: 5,
        whyKey: k(5, "why"),
        goalKey: k(5, "goal"),
        key: key("add.equals_says_where", "add.equals"),
        uses: ["add.arrows_join", "add.count_from_start"],
        coach: [
          step(5, "look", "tap"),
          step(5, "rail", { signal: "rail" }),
          step(5, "answer", { signal: "answered" }),
          reveal(5),
        ],
      },
      {
        level: 6,
        whyKey: k(6, "why"),
        goalKey: k(6, "goal"),
        key: key("add.zero_stays", "add.zero"),
        uses: ["add.equals_says_where", "add.order_does_not_matter"],
        coach: [step(6, "recall", "tap")],
      },
      {
        level: 7,
        whyKey: k(7, "why"),
        goalKey: k(7, "goal"),
        key: key("add.missing_leg", "add.missing"),
        uses: ["add.equals_says_where", "add.count_from_start"],
        coach: [step(7, "recall", "tap")],
      },
    ],
  },
  texts: {
    [`node.${NODE}.learned`]:
      "Sumar es avanzar: el primer número dice de dónde salís, el segundo cuántos pasos das, y el orden de los tramos no cambia dónde llegás.",

    [k(1, "why")]:
      "Sumar es avanzar. La ficha dice cuántos pasos da el caminante, y los da todos de un tirón.",
    [k(1, "goal")]: "Soltá la ficha sobre la manivela y girá hasta la bandera.",
    [k(1, "coach.look")]:
      "La bandera dice adónde tiene que llegar. Las fichas de abajo dicen cuántos pasos.",
    [k(1, "coach.load")]:
      "Arrastrá una ficha hasta la manivela. Se encienden tantos dientes como dice la ficha.",
    [k(1, "coach.pull")]:
      "Girá la manivela: salta el tramo entero de una vez. Si no cae en la bandera, girá al revés.",
    [k(1, "coach.reveal")]:
      "Hizo todos los pasos de un tirón. La estela muestra las piedras que saltó: eso es sumar.",

    [k(2, "why")]:
      "Si el tramo es un número de pasos, la llegada se sabe antes de caminar: se cuenta desde donde está el caminante.",
    [k(2, "goal")]: "Mirá los dientes encendidos, tocá la piedra donde va a caer y después girá.",
    [k(2, "coach.look")]:
      "Los dientes encendidos son el tramo que va a dar. Mirá de qué piedra sale el caminante.",
    [k(2, "coach.predict")]:
      "Contá los pasos desde el caminante, sin contar su piedra, y tocá la piedra donde va a caer.",
    [k(2, "coach.pull")]: "Ahora girá la manivela y mirá si cae ahí.",
    [k(2, "coach.reveal")]:
      "Cayó donde dijiste: la piedra de salida más el tramo. Sumaste antes de caminar.",

    [k(3, "why")]:
      "Un viaje puede tener dos tramos. El libro anota cada uno, y el orden de los tramos no cambia dónde se llega.",
    [k(3, "goal")]: "Llegá a la bandera con dos fichas, dejá el dedo en el libro y tocá la pista tramposa.",
    [k(3, "coach.look")]:
      "Ahora el viaje tiene dos tramos. El libro de la derecha anota una fila por cada tramo.",
    [k(3, "coach.legs")]:
      "Poné una ficha en la manivela y girá; después la otra. Con los dos tramos llega a la bandera.",
    [k(3, "coach.swap")]: "Dejá el dedo apoyado sobre el libro: las dos filas se dan vuelta.",
    [k(3, "coach.choose")]:
      "Cayó en la misma piedra. Ahora, en una de las dos pistas la llegada empuja al caminante: tocá esa.",
    [k(3, "coach.reveal")]:
      "La llegada no empuja a nadie: dice dónde terminó el viaje. Y el orden de los tramos no la cambia.",

    [k(4, "why")]:
      "En la recta, cada tramo es una flecha. Dos flechas encadenadas llegan donde llega una sola, tan larga como las dos juntas.",
    [k(4, "goal")]: "Hacé los dos tramos y después tocá la ficha que hace el mismo viaje de un solo tirón.",
    [k(4, "coach.look")]:
      "La pista ahora es una recta con marcas. Cada tramo que hagas deja una flecha arriba.",
    [k(4, "coach.legs")]: "Hacé los dos tramos: una ficha en la manivela y girar, dos veces.",
    [k(4, "coach.total")]:
      "La flecha verde es el viaje entero. Tocá la ficha que lo hace de un solo tirón.",
    [k(4, "coach.reveal")]:
      "Esa ficha mide lo mismo que las dos flechas juntas: es la suma de los dos tramos.",

    [k(5, "why")]:
      "El viaje se escribe en un renglón: primero la piedra de salida, después los tramos, y detrás del igual la llegada.",
    [k(5, "goal")]: "Tocá la ficha que va en el hueco del renglón.",
    [k(5, "coach.look")]:
      "El viaje ahora es un renglón: salida, más, tramo, igual. El hueco del final pide la llegada.",
    [k(5, "coach.rail")]:
      "Tocá el hueco del final: la recta vuelve un momento, con el viaje dibujado.",
    [k(5, "coach.answer")]: "Ahora tocá la ficha que va en el hueco.",
    [k(5, "coach.reveal")]:
      "La llegada quedó escrita detrás del igual. El renglón dice lo mismo que la recta, con números.",

    [k(6, "why")]:
      "Con números grandes ya no conviene contar piedras: se suman los tramos. Y un tramo de cero deja al caminante donde está.",
    [k(6, "goal")]: "Tocá la ficha que va en el hueco del renglón.",
    [k(6, "coach.recall")]:
      "Números grandes, a veces tres tramos y a veces un cero. Tu llave: el igual dice dónde termina el viaje.",

    [k(7, "why")]:
      "Ahora la llegada está escrita y lo que falta es un tramo: cuántos pasos hay que dar para llegar.",
    [k(7, "goal")]: "Tocá la ficha del tramo que falta.",
    [k(7, "coach.recall")]:
      "Ahora falta un tramo, no la llegada. Tu llave: el igual dice dónde termina el viaje.",

    "key.add.chip_is_a_jump.title": "La ficha es un tramo",
    "key.add.chip_is_a_jump.body":
      "El segundo número no es un lugar: es cuántos pasos se avanzan. Puesto en la manivela, el caminante los da de un tirón.",
    "key.add.count_from_start.title": "Se cuenta desde donde está",
    "key.add.count_from_start.body":
      "Para sumar, arrancá en el primer número y avanzá tantos pasos como dice el segundo. La piedra de salida no es un paso.",
    "key.add.order_does_not_matter.title": "El orden no cambia la llegada",
    "key.add.order_does_not_matter.body":
      "Dos tramos en cualquier orden llegan a la misma piedra. Si te conviene, hacé primero el más fácil.",
    "key.add.arrows_join.title": "Dos flechas, una flecha",
    "key.add.arrows_join.body":
      "Dos tramos seguidos, punta con cola, hacen el mismo viaje que uno solo del largo de los dos. Ese tramo es la suma.",
    "key.add.equals_says_where.title": "El igual dice dónde termina",
    "key.add.equals_says_where.body":
      "Lo que va detrás del igual no es una orden: es la piedra donde termina el viaje. Si dudás, tocala y vuelve la recta.",
    "key.add.zero_stays.title": "Sumar cero no mueve",
    "key.add.zero_stays.body":
      "Un tramo de cero deja al caminante en su piedra. Y con números grandes no hace falta caminar: se suman los tramos.",
    "key.add.missing_leg.title": "Lo que falta es la distancia",
    "key.add.missing_leg.body":
      "Si sabés de dónde sale y adónde llega, el tramo que falta es cuántos pasos hay entre las dos piedras. La llegada no va en el hueco.",
  },
  // Puntos y barras sobre una caja de 40 × 40: las barras largas son tramos, los
  // puntos resaltados son la piedra de llegada.
  glyphs: {
    // Un tramo de tres, de un tirón, por arriba de las piedras.
    "add.jump": {
      dots: [[6, 30, 3], [15, 30, 3], [24, 30, 3], [33, 30, 3, true]],
      bars: [[6, 17, 27, 2.5], [31, 13, 2.5, 9]],
    },
    // El tramo sale de la piedra donde está el caminante, que es grande.
    "add.fromStart": {
      dots: [[7, 27, 4.5, true], [18, 27, 3], [27, 27, 3], [36, 27, 3]],
      bars: [[7, 15, 29, 2], [34, 11, 2, 9]],
    },
    // Corto y largo, largo y corto: las dos filas terminan en el mismo lugar.
    "add.order": {
      dots: [[36, 12, 3, true], [36, 28, 3, true]],
      bars: [[3, 11, 10, 2.5], [15, 11, 18, 2.5], [3, 27, 18, 2.5], [23, 27, 10, 2.5]],
    },
    // Dos flechas cortas y una larga que hace lo mismo.
    "add.arrows": {
      dots: [[36, 14, 3, true], [36, 29, 3]],
      bars: [[4, 28, 14, 2.5], [20, 28, 14, 2.5], [4, 13, 30, 2.5]],
    },
    "add.equals": { dots: [], card: "=" },
    "add.zero": { dots: [], card: "+0" },
    // La salida y la llegada, y entre las dos lo que falta.
    "add.missing": {
      dots: [[6, 24, 4], [34, 24, 4, true]],
      bars: [[12, 23, 4, 2], [18, 23, 4, 2], [24, 23, 4, 2]],
    },
  },
};
