/**
 * La lección de cofres y llaves, nivel por nivel.
 *
 * El nivel 1 estrena el gesto del nodo (pasar la llave por los dos platos sin
 * torcer la barra), el 2 la pregunta de cuál llave (cuatro operaciones, una
 * contraria) y el 4 la ecuación escrita, donde la llave se lleva hacia arriba:
 * los tres traen una guía atada a eso. Los demás repiten un gesto conocido con
 * otra piel o números más difíciles, y su guía es un solo recordatorio de qué
 * llave usar.
 *
 * Todo lo del nodo vive acá: la lección, sus textos y los dibujos de sus llaves.
 */
import type { CoachStep, KeySpec, LessonModule } from "./types.ts";

const NODE = "alg.eq.one_step";

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
export const eq1Msg = (id: string): string => `lesson.${NODE}.msg.${id}`;

export const MODULE: LessonModule = {
  lesson: {
    node: NODE,
    learnedKey: `node.${NODE}.learned`,
    levels: [
      {
        level: 1,
        whyKey: k(1, "why"),
        goalKey: k(1, "goal"),
        key: key("eq1.key_through_both", "eq1.both"),
        uses: ["bal.same_to_both", "sub.undo_same"],
        coach: [
          step(1, "look", "tap"),
          step(1, "pass", { signal: "onePan" }),
          step(1, "both", { signal: "opened" }),
          reveal(1),
        ],
      },
      {
        level: 2,
        whyKey: k(2, "why"),
        goalKey: k(2, "goal"),
        key: key("eq1.contrary_opens", "eq1.contrary"),
        uses: ["sub.undo_same", "div.shrink_undoes"],
        coach: [step(2, "look", "tap"), step(2, "choose", { signal: "opened" }), reveal(2)],
      },
      {
        level: 3,
        whyKey: k(3, "why"),
        goalKey: k(3, "goal"),
        key: key("eq1.both_change_alike", "eq1.bars"),
        uses: ["eq1.key_through_both"],
        coach: [recall(3)],
      },
      {
        level: 4,
        whyKey: k(4, "why"),
        goalKey: k(4, "goal"),
        key: key("eq1.key_on_both_sides", "eq1.row"),
        uses: ["bal.equal_is_the_bar", "eq1.contrary_opens"],
        coach: [step(4, "look", "tap"), step(4, "lift", { signal: "opened" }), reveal(4)],
      },
      {
        level: 5,
        whyKey: k(5, "why"),
        goalKey: k(5, "goal"),
        key: key("eq1.rule_without_scale", "eq1.ghost"),
        uses: ["eq1.key_on_both_sides"],
        coach: [recall(5)],
      },
      {
        level: 6,
        whyKey: k(6, "why"),
        goalKey: k(6, "goal"),
        key: key("eq1.number_stays", "eq1.number"),
        uses: ["eq1.contrary_opens"],
        coach: [recall(6)],
      },
      {
        level: 7,
        whyKey: k(7, "why"),
        goalKey: k(7, "goal"),
        key: key("eq1.either_side", "eq1.right"),
        uses: ["eq1.key_on_both_sides"],
        coach: [recall(7)],
      },
      {
        level: 8,
        whyKey: k(8, "why"),
        goalKey: k(8, "goal"),
        key: key("eq1.undo_what_was_done", "eq1.undo"),
        uses: ["eq1.contrary_opens", "eq1.either_side"],
        coach: [recall(8)],
      },
    ],
  },
  texts: {
    [`node.${NODE}.learned`]:
      "Una ecuación de un paso es una caja con una cerradura: se abre con la operación contraria, aplicada a los dos lados del igual para que la barra no se tuerza.",

    [k(1, "why")]:
      "Para abrir la caja sin romper la igualdad, la llave tiene que hacer lo mismo en los dos platos. En uno solo, la barra se tuerce.",
    [k(1, "goal")]: "Arrastrá la llave que abre y pasala por los dos platos.",
    [k(1, "coach.look")]:
      "La caja tiene un broche: es lo que le sumaron o le sacaron. La barra está derecha y tiene que seguir así.",
    [k(1, "coach.pass")]:
      "Arrastrá una llave de abajo y pasala por encima de un plato. Mirá qué le pasa a ese plato.",
    [k(1, "coach.both")]:
      "Ahora pasala por el otro plato. Podés soltar en el medio: lo que ya hizo queda hecho.",
    [k(1, "coach.reveal")]:
      "La llave hizo lo mismo en los dos platos y la barra no se torció. Por eso la caja se abrió.",

    [k(2, "why")]:
      "La cerradura es lo que le hicieron a la caja, y la llave es su contraria: lo que suma se abre restando, lo que multiplica, dividiendo.",
    [k(2, "goal")]: "Elegí la llave contraria al broche y pasala por los dos platos.",
    [k(2, "coach.look")]:
      "Ahora hay cuatro llaves: más, menos, por y dividido. El broche de la caja dice qué le hicieron.",
    [k(2, "coach.choose")]:
      "Pasá por los dos platos la llave contraria al broche. Las otras no entran.",
    [k(2, "coach.reveal")]:
      "Abrió la contraria: la llave deshace lo que le hicieron a la caja. Elegiste la operación, no la cuenta.",

    [k(3, "why")]:
      "Con barras se ve que la llave cambia los dos platos en la misma medida. Por eso siguen parejos.",
    [k(3, "goal")]: "Pasá por los dos platos la llave que abre.",
    [k(3, "coach.recall")]:
      "Acordate de «La llave pasa por los dos». Ahora los platos son barras: mirá cómo cambian los dos a la vez.",

    [k(4, "why")]:
      "La balanza también se escribe: una ecuación. La llave se aplica a los dos lados del igual, como a los dos platos.",
    [k(4, "goal")]: "Arrastrá hacia la ecuación la llave que deja sola a la x.",
    [k(4, "coach.look")]:
      "Debajo de la balanza está la ecuación: lo mismo que los platos, escrito. Las llaves dicen su número.",
    [k(4, "coach.lift")]:
      "Arrastrá hacia arriba, hasta la ecuación, la llave contraria a lo que acompaña a la x.",
    [k(4, "coach.reveal")]:
      "La llave se aplicó a los dos lados del igual y la x quedó sola. La balanza cambió con la ecuación.",

    [k(5, "why")]:
      "La balanza puede estar guardada: la regla sigue. Si la querés ver, se pide con un toque.",
    [k(5, "goal")]: "Sin la balanza a la vista, llevá hasta la ecuación la llave que deja sola a la x.",
    [k(5, "coach.recall")]:
      "Acordate de «La llave va a los dos lados». La balanza está guardada; tocá «ver balanza» si la querés mirar.",

    [k(6, "why")]:
      "Con números grandes o negativos la llave es la misma: la contraria, con el mismo número que la cerradura.",
    [k(6, "goal")]: "Mirá el número que acompaña a la x y llevá la llave contraria, con ese mismo número.",
    [k(6, "coach.recall")]:
      "Acordate de «Abre la operación contraria». Los números cambiaron; la llave lleva el mismo número que la cerradura.",

    [k(7, "why")]:
      "La x puede estar a la derecha del igual. 12 = x + 5 dice lo mismo que x + 5 = 12.",
    [k(7, "goal")]: "La x está del otro lado del igual: llevá igual la llave que la deja sola.",
    [k(7, "coach.recall")]:
      "Acordate de «La llave va a los dos lados». La x está del otro lado del igual, y la regla es la misma.",

    [k(8, "why")]:
      "Cualquier cerradura se abre igual: se mira qué operación acompaña a la x y se aplica la contraria a los dos lados.",
    [k(8, "goal")]: "Fijate qué le hicieron a la x y llevá la llave que lo deshace.",
    [k(8, "coach.recall")]:
      "Acordate de «Abre la operación contraria». Mirá qué acompaña a la x y deshacelo en los dos lados.",

    // Lo que la actividad dice en la línea de abajo.
    [eq1Msg("tapHands")]: "Arrastrá la llave hasta los platos y pasala por encima de los dos.",
    [eq1Msg("tapSymbol")]: "Arrastrá la llave hacia arriba, hasta la ecuación.",
    [eq1Msg("missed")]: "La llave no pasó por ningún plato. Llevala por encima de ellos.",
    [eq1Msg("short")]: "La llave volvió. Llevala más arriba, hasta la ecuación.",

    "key.eq1.key_through_both.title": "La llave pasa por los dos",
    "key.eq1.key_through_both.body":
      "Para abrir la caja sin torcer la barra, la llave tiene que hacer lo mismo en los dos platos.",
    "key.eq1.contrary_opens.title": "Abre la operación contraria",
    "key.eq1.contrary_opens.body":
      "La cerradura es lo que le hicieron a la caja; la llave es su contraria: + se abre con −, × se abre con ÷.",
    "key.eq1.both_change_alike.title": "Los dos lados cambian igual",
    "key.eq1.both_change_alike.body":
      "La llave achica o agranda los dos platos en la misma medida. Si cambiara uno más que el otro, la barra se torcería.",
    "key.eq1.key_on_both_sides.title": "La llave va a los dos lados",
    "key.eq1.key_on_both_sides.body":
      "En una ecuación, la llave se aplica a los dos lados del igual, como a los dos platos. Queda la x sola.",
    "key.eq1.rule_without_scale.title": "La regla no necesita balanza",
    "key.eq1.rule_without_scale.body":
      "Aunque no veas la balanza, la regla es la misma: la contraria de la cerradura, aplicada a los dos lados.",
    "key.eq1.number_stays.title": "El número se queda",
    "key.eq1.number_stays.body":
      "Con números grandes o negativos, la llave lleva el mismo número que la cerradura. Lo único que cambia es la operación.",
    "key.eq1.either_side.title": "La x puede estar enfrente",
    "key.eq1.either_side.body":
      "12 = x + 5 dice lo mismo que x + 5 = 12: el igual no se lee en un solo sentido. La llave es la misma.",
    "key.eq1.undo_what_was_done.title": "Deshacé lo que le hicieron",
    "key.eq1.undo_what_was_done.body":
      "Para despejar la x, mirá qué operación la acompaña y aplicá la contraria a los dos lados. Sirve con cualquier cerradura.",
  },
  // Puntos y barras sobre 40 × 40. El punto resaltado es el que importa.
  glyphs: {
    // Una llave que recorre los dos platos: el camino por arriba.
    "eq1.both": {
      dots: [[7, 26, 3.5, true], [33, 26, 3.5, true]],
      bars: [[7, 12, 26, 2], [4, 30, 8, 2], [28, 30, 8, 2], [19, 14, 2, 10]],
    },
    // La cerradura y su contraria: + arriba, − abajo.
    "eq1.contrary": { dots: [], card: "±" },
    // Dos columnas que bajan juntas, a la misma altura.
    "eq1.bars": {
      dots: [],
      bars: [[7, 12, 9, 22], [24, 12, 9, 22], [7, 8, 9, 2], [24, 8, 9, 2]],
    },
    // Un renglón escrito: x, más, número, igual, número.
    "eq1.row": {
      dots: [[6, 20, 3.5, true], [23, 20, 2.5], [36, 20, 2.5]],
      bars: [[11, 19, 6, 2], [13, 17, 2, 6], [27, 17, 5, 1.5], [27, 22, 5, 1.5]],
    },
    // La balanza en fantasma y el renglón adelante.
    "eq1.ghost": {
      dots: [[8, 30, 3, true]],
      bars: [[4, 10, 32, 1], [19, 10, 1, 12], [14, 29, 7, 1.5], [24, 27, 6, 1.5], [24, 32, 6, 1.5]],
    },
    // El mismo número de los dos lados.
    "eq1.number": { dots: [], card: "−7" },
    // La x a la derecha del igual.
    "eq1.right": {
      dots: [[34, 20, 3.5, true], [6, 20, 2.5]],
      bars: [[13, 17, 6, 1.5], [13, 22, 6, 1.5], [24, 19, 6, 2], [26, 17, 2, 6]],
    },
    // Lo que se hizo y lo que lo deshace, con la x al medio.
    "eq1.undo": {
      dots: [[20, 20, 4.5, true]],
      bars: [[6, 12, 8, 2], [9, 9, 2, 8], [26, 28, 8, 2]],
    },
  },
};
