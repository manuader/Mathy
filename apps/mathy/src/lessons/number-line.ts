/**
 * La lección del camino de piedras, nivel por nivel.
 *
 * Tres niveles estrenan un gesto y traen guía de varios pasos: girar la
 * manivela (1), tocar la piedra antes de girar (2) y tocar la pista que rompe la
 * fila (3). El 4 estrena la ficha que se clava en un hueco. El 5 y el 6 repiten
 * los huecos en pistas que cambian de forma: su guía es un recordatorio de la
 * llave que los resuelve, porque volver a explicar el gesto sería ruido.
 *
 * Todo lo del nodo vive acá: la lección, sus textos (`texts`, que `t()` lee
 * igual que el diccionario) y los dibujos de sus llaves (`glyphs`).
 */
import type { CoachStep, KeySpec, LessonModule } from "./types.ts";

const NODE = "found.count.number_line";

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
        key: key("line.one_tooth_one_stone", "line.teeth"),
        uses: ["count.one_more"],
        coach: [
          step(1, "look", "tap"),
          step(1, "turn", { signal: "stepped" }),
          step(1, "arrive", { signal: "arrived" }),
          reveal(1),
        ],
      },
      {
        level: 2,
        whyKey: k(2, "why"),
        goalKey: k(2, "goal"),
        key: key("line.count_the_jumps", "line.jumps"),
        uses: ["line.one_tooth_one_stone"],
        coach: [
          step(2, "look", "tap"),
          step(2, "predict", { signal: "predicted" }),
          step(2, "arrive", { signal: "arrived" }),
          reveal(2),
        ],
      },
      {
        level: 3,
        whyKey: k(3, "why"),
        goalKey: k(3, "goal"),
        key: key("line.equal_steps", "line.equal"),
        uses: ["line.one_tooth_one_stone"],
        coach: [step(3, "look", "tap"), step(3, "choose", { signal: "chosen" }), reveal(3)],
      },
      {
        level: 4,
        whyKey: k(4, "why"),
        goalKey: k(4, "goal"),
        key: key("line.neighbors_tell", "line.neighbors"),
        uses: ["count.one_more", "line.equal_steps"],
        coach: [step(4, "look", "tap"), step(4, "fill", { signal: "pinned" }), reveal(4)],
      },
      {
        level: 5,
        whyKey: k(5, "why"),
        goalKey: k(5, "goal"),
        key: key("line.size_does_not_change", "line.stretch"),
        uses: ["line.neighbors_tell", "line.equal_steps"],
        coach: [step(5, "recall", "tap")],
      },
      {
        level: 6,
        whyKey: k(6, "why"),
        goalKey: k(6, "goal"),
        key: key("line.marks_are_numbers", "line.marks"),
        uses: ["line.neighbors_tell", "line.size_does_not_change"],
        coach: [step(6, "recall", "tap")],
      },
    ],
  },
  texts: {
    [`node.${NODE}.learned`]:
      "Los números viven en una fila que empieza en cero: cada uno tiene un siguiente, y todos están a un paso del mismo largo.",

    [k(1, "why")]:
      "Los números viven en fila, a la misma distancia uno de otro. Cada diente de la manivela mueve al caminante exactamente una piedra.",
    [k(1, "goal")]: "Girá la manivela hasta que el caminante llegue a la bandera.",
    [k(1, "coach.look")]: "El caminante está en la orilla. La bandera marca la piedra adonde tiene que llegar.",
    [k(1, "coach.turn")]:
      "Agarrá la perilla de la manivela y dala vuelta. Cada diente que pasa es una piedra.",
    [k(1, "coach.arrive")]:
      "Seguí girando hasta la bandera. Si te pasás, girá para el otro lado: la pista vuelve.",
    [k(1, "coach.reveal")]:
      "Llegó. Cada diente fue un paso igual, y la orilla no contó: ahí todavía no había caminado.",

    [k(2, "why")]:
      "Cada piedra tiene un número: cuántos pasos hay desde la orilla. Por eso se puede saber dónde vas a caer antes de caminar.",
    [k(2, "goal")]: "Mirá los dientes encendidos y tocá la piedra donde va a caer. Después girá.",
    [k(2, "coach.look")]:
      "Los dientes encendidos dicen cuántos pasos va a dar. El caminante arranca en esta piedra.",
    [k(2, "coach.predict")]:
      "Contá los saltos desde el caminante, sin contar su piedra, y tocá donde va a caer.",
    [k(2, "coach.arrive")]: "Ahora girá la manivela y mirá si cae ahí.",
    [k(2, "coach.reveal")]:
      "Cayó donde dijiste. Su número es el de salida más los saltos: contaste pasos, no piedras.",

    [k(3, "why")]:
      "La orilla también es una piedra: la del cero, donde todavía no diste ningún paso. Desde ahí, todos los pasos miden lo mismo.",
    [k(3, "goal")]: "Mirá los dos caminantes y tocá la pista del que rompe la fila.",
    [k(3, "coach.look")]:
      "Los dos salen del cero, la orilla, hacia la bandera. Mirá dónde pisa cada uno.",
    [k(3, "coach.choose")]: "Uno de los dos da saltos de distinto largo. Tocá su pista.",
    [k(3, "coach.reveal")]:
      "Ese cayó al agua: sus saltos no medían lo mismo. En la fila, todos los pasos son iguales.",

    [k(4, "why")]:
      "Como todos los pasos son iguales, cada piedra es una más que la de atrás. Una piedra sin tarjeta se nombra mirando a sus vecinas.",
    [k(4, "goal")]: "Llevá a cada hueco la ficha con su número.",
    [k(4, "coach.look")]: "Esta piedra perdió su tarjeta. Sus vecinas sí la tienen.",
    [k(4, "coach.fill")]:
      "Arrastrá hasta el hueco la ficha que va ahí: una más que la vecina de atrás.",
    [k(4, "coach.reveal")]:
      "Se clavó, y no hizo falta caminar: el número de una piedra sale de sus vecinas.",

    [k(5, "why")]:
      "La fila puede estar estirada, encogida o parada, y el cero puede no estar en la punta. Los números no cambian: se cuentan pasos desde el cero.",
    [k(5, "goal")]: "Llevá a cada hueco la ficha con su número. Buscá primero dónde está el cero.",
    [k(5, "coach.recall")]:
      "Son huecos otra vez, en pistas estiradas, encogidas o paradas. Tu llave: los vecinos dicen el número.",

    [k(6, "why")]:
      "Las piedras se aplanan en marcas sobre una recta. Sin dibujos y a veces sin caminante, la fila sigue diciendo dónde va cada número.",
    [k(6, "goal")]: "Poné cada ficha en la marca que le toca.",
    [k(6, "coach.recall")]:
      "Ya no hay piedras: marcas sobre una recta. Tu llave sigue sirviendo: los vecinos dicen el número.",

    "key.line.one_tooth_one_stone.title": "Un diente, un paso",
    "key.line.one_tooth_one_stone.body":
      "Cada diente mueve al caminante una piedra, siempre la misma distancia. Para llegar lejos se suman dientes, de a uno.",
    "key.line.count_the_jumps.title": "Se cuentan los saltos",
    "key.line.count_the_jumps.body":
      "La piedra de llegada es la de salida más los saltos. La piedra donde estás no cuenta: ahí todavía no diste ningún paso.",
    "key.line.equal_steps.title": "Todos los pasos miden igual",
    "key.line.equal_steps.body":
      "La fila empieza en el cero, la piedra donde no diste ningún paso, y cada paso mide lo mismo. Un salto más largo cae en el agua.",
    "key.line.neighbors_tell.title": "Los vecinos dicen el número",
    "key.line.neighbors_tell.body":
      "Una piedra sin número es uno más que la de atrás y uno menos que la de adelante. No hace falta caminar para nombrarla.",
    "key.line.size_does_not_change.title": "Estirar no cambia los números",
    "key.line.size_does_not_change.body":
      "La misma fila, más larga, más corta o parada, tiene los mismos números. Importa cuántos pasos hay desde el cero, no cuánto mide el dibujo.",
    "key.line.marks_are_numbers.title": "Cada marca es un número",
    "key.line.marks_are_numbers.body":
      "Sin piedras ni caminante, la recta con marcas guarda lo mismo: cada marca es un número y está a un paso de la siguiente.",
  },
  // Puntos y barras sobre una caja de 40 × 40. Los puntos resaltados son el
  // lugar al que se llega; las barras, dientes, saltos o la recta.
  glyphs: {
    // Tres dientes, tres pasos: la cuarta piedra es la de llegada.
    "line.teeth": {
      dots: [[6, 27, 3.5], [15, 27, 3.5], [24, 27, 3.5], [33, 27, 3.5, true]],
      bars: [[9.5, 11, 2, 7], [18.5, 11, 2, 7], [27.5, 11, 2, 7]],
    },
    // Los saltos entre piedras, y ninguno sobre la de salida.
    "line.jumps": {
      dots: [[6, 28, 3.5], [16, 28, 3.5], [26, 28, 3.5], [35, 28, 3.5, true]],
      bars: [[8, 18, 6, 2], [18, 18, 6, 2], [28, 18, 6, 2]],
    },
    // La recta con marcas iguales, y el cero grueso en la punta.
    "line.equal": {
      dots: [[5, 25, 4.5, true]],
      bars: [[4, 24, 32, 2], [14, 19, 2, 12], [24, 19, 2, 12], [34, 19, 2, 12]],
    },
    // La del medio se nombra con las dos de al lado.
    "line.neighbors": {
      dots: [[8, 20, 4], [20, 20, 4, true], [32, 20, 4]],
      bars: [[5, 29, 6, 2], [29, 29, 6, 2]],
    },
    // La misma fila, suelta y apretada: la última es la misma en las dos.
    "line.stretch": {
      dots: [[5, 12, 3], [15, 12, 3], [25, 12, 3], [35, 12, 3, true], [11, 28, 3], [17, 28, 3], [23, 28, 3], [29, 28, 3, true]],
    },
    // Marcas sobre la recta, y una de ellas es la que se busca.
    "line.marks": {
      dots: [[26, 14, 3.5, true]],
      bars: [[4, 30, 32, 2], [5, 25, 2, 11], [15, 25, 2, 11], [25, 25, 2, 11], [35, 25, 2, 11]],
    },
  },
};
