/**
 * La lección de los dos platos, nivel por nivel.
 *
 * Acá nace el igual, como balanza. Los niveles 1, 2, 3, 5 y 7 estrenan algo y
 * traen una guía atada a eso: enderezar tocando un solo plato, conservar la
 * barra con la misma acción en los dos, dejar la caja sola, jugar sobre la
 * línea con el `=`, y las acciones que no pesan. El 4 (las barras) y el 6 (la
 * balanza guardada detrás del igual) repiten el gesto del 3: su guía es un solo
 * recordatorio de qué llave usar.
 *
 * Todo lo del nodo vive acá: la lección, sus textos y los dibujos de sus llaves.
 */
import type { CoachStep, KeySpec, LessonModule } from "./types.ts";

const NODE = "prealg.eq.balance";

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

/** Lo que la actividad dice en la línea de abajo. */
export const balMsg = (id: string): string => `lesson.${NODE}.msg.${id}`;

export const MODULE: LessonModule = {
  lesson: {
    node: NODE,
    learnedKey: `node.${NODE}.learned`,
    levels: [
      {
        level: 1,
        whyKey: k(1, "why"),
        goalKey: k(1, "goal"),
        key: key("bal.straight_means_equal", "bal.level"),
        uses: ["box.scale_tells"],
        coach: [step(1, "look", "tap"), step(1, "fix", { signal: "levelled" }), reveal(1)],
      },
      {
        level: 2,
        whyKey: k(2, "why"),
        goalKey: k(2, "goal"),
        key: key("bal.same_to_both", "bal.both"),
        uses: ["bal.straight_means_equal"],
        coach: [
          step(2, "look", "tap"),
          step(2, "half", { signal: "half" }),
          step(2, "mirror", { signal: "solved" }),
          reveal(2),
        ],
      },
      {
        level: 3,
        whyKey: k(3, "why"),
        goalKey: k(3, "goal"),
        key: key("bal.leave_box_alone", "bal.box"),
        uses: ["bal.same_to_both", "box.count_it_closed"],
        coach: [
          step(3, "look", "tap"),
          step(3, "half", { signal: "half" }),
          step(3, "mirror", { signal: "solved" }),
          reveal(3),
        ],
      },
      {
        level: 4,
        whyKey: k(4, "why"),
        goalKey: k(4, "goal"),
        key: key("bal.every_step_equal", "bal.states"),
        uses: ["bal.leave_box_alone"],
        coach: [step(4, "recall", "tap")],
      },
      {
        level: 5,
        whyKey: k(5, "why"),
        goalKey: k(5, "goal"),
        key: key("bal.equal_is_the_bar", "bal.equal"),
        uses: ["bal.same_to_both", "bal.leave_box_alone"],
        coach: [
          step(5, "look", "tap"),
          step(5, "half", { signal: "half" }),
          step(5, "mirror", { signal: "solved" }),
          reveal(5),
        ],
      },
      {
        level: 6,
        whyKey: k(6, "why"),
        goalKey: k(6, "goal"),
        key: key("bal.line_is_enough", "bal.line"),
        uses: ["bal.equal_is_the_bar", "bal.leave_box_alone"],
        coach: [step(6, "recall", "tap")],
      },
      {
        level: 7,
        whyKey: k(7, "why"),
        goalKey: k(7, "goal"),
        key: key("bal.any_action_both", "bal.action"),
        uses: ["bal.same_to_both", "bal.straight_means_equal"],
        coach: [
          step(7, "look", "tap"),
          step(7, "fix", { signal: "levelled" }),
          step(7, "act", { signal: "acted" }),
          reveal(7),
        ],
      },
    ],
  },
  texts: {
    [`node.${NODE}.learned`]:
      "El igual no ordena calcular: afirma que los dos lados pesan lo mismo. Esa afirmación aguanta cualquier acción hecha en los dos lados, y en ninguna otra.",

    [k(1, "why")]:
      "La barra derecha dice que los dos platos pesan lo mismo, y eso es todo lo que dice el igual. Torcida, dice de qué lado sobra.",
    [k(1, "goal")]: "Dejá la barra derecha: sacá lo que sobra o agregá lo que falta.",
    [k(1, "coach.look")]:
      "La barra se hunde del lado que pesa más. En ese plato hay una pesa que el otro no tiene.",
    [k(1, "coach.fix")]:
      "Tocá la pesa que sobra y sale del plato. También podés arrastrar una de abajo al plato liviano.",
    [k(1, "coach.reveal")]:
      "La barra quedó derecha: los dos platos pesan lo mismo. Eso afirma el igual, nada más.",

    [k(2, "why")]:
      "Una igualdad aguanta si hacés lo mismo en los dos lados. Si lo hacés en uno solo, se rompe.",
    [k(2, "goal")]: "Hacé la tarea del cartel en los dos platos sin torcer la barra.",
    [k(2, "coach.look")]:
      "La barra ya está derecha. La tarea de abajo la pone en riesgo: hay que hacerla sin torcerla.",
    [k(2, "coach.half")]:
      "Hacé la tarea en un plato: arrastrá la pesa, o tocala. La barra se va a torcer.",
    [k(2, "coach.mirror")]:
      "Ahora lo mismo en el otro plato. La barra vuelve a quedar derecha.",
    [k(2, "coach.reveal")]:
      "Hiciste lo mismo en los dos platos y la igualdad aguantó. En uno solo, se torcía.",

    [k(3, "why")]:
      "Para saber qué tiene la caja, se saca lo mismo de los dos platos hasta dejarla sola. Lo que queda enfrente es lo que tiene adentro.",
    [k(3, "goal")]: "Sacá lo mismo de los dos platos hasta que la caja quede sola.",
    [k(3, "coach.look")]:
      "La caja está en un plato con una pesa. Esa misma pesa está también en el otro plato.",
    [k(3, "coach.half")]: "Tocá la pesa que acompaña a la caja. La barra se tuerce un momento.",
    [k(3, "coach.mirror")]:
      "Ahora tocá la misma pesa en el otro plato. La barra se endereza y la caja queda sola.",
    [k(3, "coach.reveal")]:
      "La caja quedó sola y se abrió: tenía lo mismo que el otro plato. Sacaste lo mismo de los dos lados.",

    [k(4, "why")]:
      "Después de cada acción doble los platos son otros, pero la igualdad sigue. El antes queda dibujado detrás para comparar.",
    [k(4, "goal")]: "Dejá la caja sola sacando lo mismo de los dos lados.",
    [k(4, "coach.recall")]:
      "Acordate de «Dejá la caja sola». Las pesas ahora son barras: tocá la misma en los dos platos.",

    [k(5, "why")]:
      "Debajo de la balanza aparece la línea con el =. El igual es la barra vista de canto: lo que hagas de un lado, hacelo del otro.",
    [k(5, "goal")]: "Dejá la caja sola tocando fichas de la línea, las mismas de los dos lados.",
    [k(5, "coach.look")]:
      "Abajo está la línea: lo del plato izquierdo, el igual, y lo del derecho. Cada ficha es una pesa.",
    [k(5, "coach.half")]: "Tocá en la línea la ficha que acompaña a la x. Sale de su plato.",
    [k(5, "coach.mirror")]: "Tocá la misma ficha del otro lado del igual. Mirá la barra.",
    [k(5, "coach.reveal")]:
      "La línea y la balanza cambiaron juntas. El igual se portó como la barra: lo mismo a los dos lados.",

    [k(6, "why")]:
      "Ya no hace falta mirar la balanza: la línea alcanza. Si la querés ver, está detrás del igual.",
    [k(6, "goal")]: "Dejá la x sola en la línea, sacando lo mismo de los dos lados.",
    [k(6, "coach.recall")]:
      "Acordate de «El igual es la barra». Tocá en la línea la misma ficha a los dos lados. Tocá el igual para ver la balanza.",

    [k(7, "why")]:
      "La igualdad aguanta cualquier acción hecha en los dos lados, aunque no sea una cuenta. Y si ya era falsa, se arregla de un solo lado.",
    [k(7, "goal")]: "Arreglá la igualdad falsa, o aplicá una misma acción a los dos platos.",
    [k(7, "coach.look")]:
      "Esta igualdad es falsa: un plato pesa más. Acá no hay nada que conservar, hay que arreglar.",
    [k(7, "coach.fix")]:
      "Tocá la pesa que sobra, o llevá al plato liviano la que le falta. Un solo plato alcanza.",
    [k(7, "coach.act")]:
      "Ahora las acciones no pesan. Tocá una acción de abajo y después los dos platos, de a uno.",
    [k(7, "coach.reveal")]:
      "Girar no pesa nada, y la barra igual aguantó: la misma acción a los dos lados conserva la igualdad.",

    // Lo que la actividad dice en la línea de abajo.
    [balMsg("dropOff")]: "Volvió a la reserva. Soltala encima de un plato.",
    [balMsg("held")]: "La levantaste. Tocá un plato para dejarla ahí.",
    [balMsg("heldAction")]: "Acción elegida. Tocá un plato para aplicarla.",
    [balMsg("ghost")]: "La balanza está guardada. Tocá las fichas de la línea, o el igual para verla.",
    [balMsg("box")]: "La caja no se saca: nadie sabe cuánto tiene. Sacá lo que la acompaña.",
    [balMsg("crossBack")]: "Volvió a su plato. Para pasarla al otro, soltala encima de él.",

    "key.bal.straight_means_equal.title": "Derecha quiere decir igual",
    "key.bal.straight_means_equal.body":
      "La barra derecha dice que los dos platos pesan lo mismo. Torcida, al plato liviano le falta lo que sobra en el otro.",
    "key.bal.same_to_both.title": "Lo mismo a los dos platos",
    "key.bal.same_to_both.body":
      "Si hacés lo mismo en los dos platos, la barra no se mueve. Hacerlo en uno solo la tuerce.",
    "key.bal.leave_box_alone.title": "Dejá la caja sola",
    "key.bal.leave_box_alone.body":
      "Sacá lo mismo de los dos platos hasta que la caja quede sola: lo que queda enfrente es lo que tiene adentro.",
    "key.bal.every_step_equal.title": "Cada paso sigue siendo igual",
    "key.bal.every_step_equal.body":
      "Después de cada acción doble los platos son otros, pero siguen pesando lo mismo: son estados distintos de la misma igualdad.",
    "key.bal.equal_is_the_bar.title": "El igual es la barra",
    "key.bal.equal_is_the_bar.body":
      "El = es la barra de la balanza vista de canto. Lo que hagas de un lado del igual, hacelo del otro.",
    "key.bal.line_is_enough.title": "La línea alcanza",
    "key.bal.line_is_enough.body":
      "No hace falta ver la balanza: sacando lo mismo de los dos lados de la línea, la igualdad aguanta y la x queda sola.",
    "key.bal.any_action_both.title": "Cualquier acción, en los dos",
    "key.bal.any_action_both.body":
      "La igualdad aguanta cualquier acción hecha en los dos lados, aunque no sea una cuenta. Si ya era falsa, se arregla de un solo lado.",
  },
  // Puntos y barras sobre 40 × 40. El punto resaltado es el que importa.
  glyphs: {
    // La barra derecha sobre su fiel, con un plato a cada lado.
    "bal.level": {
      dots: [[20, 12, 2.5, true], [8, 24, 3.5], [32, 24, 3.5]],
      bars: [[4, 11, 32, 2.5], [19, 12, 2, 20], [3, 28, 10, 2], [27, 28, 10, 2], [13, 32, 14, 2]],
    },
    // La misma pesa sale de los dos platos: las dos resaltadas.
    "bal.both": {
      dots: [[8, 22, 3.5, true], [32, 22, 3.5, true], [8, 14, 2.5], [32, 14, 2.5]],
      bars: [[4, 29, 32, 2.5], [19, 30, 2, 6], [3, 26, 10, 2], [27, 26, 10, 2]],
    },
    // La caja sola en un plato y su peso enfrente.
    "bal.box": {
      dots: [[28, 22, 3], [34, 22, 3], [31, 17, 3, true]],
      bars: [[4, 11, 32, 2.5], [19, 11, 2, 20], [5, 17, 10, 9], [5, 15, 10, 1.5]],
    },
    // El antes en fantasma y el después, los dos derechos.
    "bal.states": {
      dots: [[10, 22, 3], [30, 22, 3, true]],
      bars: [[4, 12, 14, 2], [22, 12, 14, 2], [4, 30, 14, 2], [22, 30, 14, 2]],
    },
    // El igual: dos barras, la de la balanza vista de canto.
    "bal.equal": { dots: [], card: "=" },
    // La línea: caja, igual, número; la balanza guardada.
    "bal.line": {
      dots: [[31, 20, 3.5, true]],
      bars: [[3, 15, 9, 10], [16, 17, 8, 2], [16, 22, 8, 2], [3, 30, 34, 1.5]],
    },
    // Una figura girada en los dos platos: la barra sigue derecha.
    "bal.action": {
      dots: [[8, 20, 4, true], [32, 20, 4, true]],
      bars: [[4, 11, 32, 2.5], [19, 12, 2, 20], [3, 27, 10, 2], [27, 27, 10, 2]],
    },
  },
};
