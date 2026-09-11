/**
 * La lección de la rampa del caminante (`alg.fn.linear_slope`), nivel por nivel.
 *
 * Estrenan algo y traen guía de varios pasos: tocar la rampa que sube lo de la
 * ficha (1), elegir la que cuesta más (2), arrastrar el escalón (3), subir la
 * esquina del escalón ancho (4), la manivela y la grilla que se estira (5), los
 * deslizadores de la `m` y la `b` (6) y las respuestas del caso final (8). El 7
 * repite las fichas con la rampa escondida: su guía es un recordatorio.
 *
 * Los niveles 4, 5 y 6 alternan dos preguntas. En el 5 y el 6 la segunda es tan
 * nueva como la primera, así que la guía sigue un paso más después del `reveal`:
 * la ronda siguiente arranca con Lumi señalando el gesto nuevo, y el objetivo
 * nombra las dos. En el 4 la segunda es el gesto del 3 y no se vuelve a explicar.
 * La actividad le dice a Tomi qué paso vale en cada ronda (`preferHint`).
 *
 * Todo lo del nodo vive acá: la lección, sus textos y los dibujos de sus llaves.
 */
import type { CoachStep, KeySpec, LessonModule } from "./types.ts";

const NODE = "alg.fn.linear_slope";

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

export const SLOPE_MSG = {
  placeStep: msg("placeStep"),
  stretchStep: msg("stretchStep"),
  crank: msg("crank"),
  stretchGrid: msg("stretchGrid"),
  setSliders: msg("setSliders"),
  slopeBetween: msg("slopeBetween"),
  readForm: msg("readForm"),
  restAgain: msg("restAgain"),
  samePlace: msg("samePlace"),
  sameEveryTooth: msg("sameEveryTooth"),
  pastFlag: msg("pastFlag"),
  pastPoint: msg("pastPoint"),
  verticalNotFunction: msg("verticalNotFunction"),
  tapARamp: msg("tapARamp"),
  dragTheCorner: msg("dragTheCorner"),
  useTheCrank: msg("useTheCrank"),
  useTheKnob: msg("useTheKnob"),
  useTheSliders: msg("useTheSliders"),
  useTheChips: msg("useTheChips"),
  useTheAnswers: msg("useTheAnswers"),
  otherM: msg("otherM"),
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
        key: key("slope.rise_per_step", "slope.perStep"),
        uses: ["line.equal_steps"],
        coach: [step(1, "look", "tap"), step(1, "pick", { signal: "picked" }), reveal(1)],
      },
      {
        level: 2,
        whyKey: k(2, "why"),
        goalKey: k(2, "goal"),
        key: key("slope.steps_not_steepness", "slope.twoRamps"),
        uses: ["slope.rise_per_step"],
        coach: [step(2, "look", "tap"), step(2, "choose", { signal: "picked" }), reveal(2)],
      },
      {
        level: 3,
        whyKey: k(3, "why"),
        goalKey: k(3, "goal"),
        key: key("slope.same_everywhere", "slope.same"),
        uses: ["slope.rise_per_step", "line.equal_steps"],
        coach: [
          step(3, "look", "tap"),
          step(3, "move", { signal: "placed" }),
          step(3, "again", { signal: "rested" }),
          reveal(3),
        ],
      },
      {
        level: 4,
        whyKey: k(4, "why"),
        goalKey: k(4, "goal"),
        key: key("slope.double_run_double_rise", "slope.double"),
        uses: ["slope.same_everywhere", "mul.stretch_all"],
        coach: [step(4, "look", "tap"), step(4, "raise", { signal: "fit" }), reveal(4)],
      },
      {
        level: 5,
        whyKey: k(5, "why"),
        goalKey: k(5, "goal"),
        key: key("slope.grid_matters", "slope.stretch"),
        uses: ["mul.same_step", "slope.same_everywhere"],
        coach: [
          step(5, "look", "tap"),
          step(5, "turn", { signal: "turned" }),
          step(5, "arrive", { signal: "arrived" }),
          reveal(5),
          // La ronda siguiente es la grilla: Lumi la acompaña hasta el punto.
          step(5, "stretch", { signal: "stretched" }),
        ],
      },
      {
        level: 6,
        whyKey: k(6, "why"),
        goalKey: k(6, "goal"),
        key: key("slope.m_turns_b_moves", "slope.m"),
        uses: ["slope.rise_per_step", "slope.double_run_double_rise"],
        coach: [
          step(6, "look", "tap"),
          step(6, "tilt", { signal: "tilted" }),
          step(6, "through", { signal: "through" }),
          reveal(6),
          // La ronda siguiente es de fichas: Lumi señala el escalón y la fila.
          step(6, "choose", { signal: "chosen" }),
        ],
      },
      {
        level: 7,
        whyKey: k(7, "why"),
        goalKey: k(7, "goal"),
        key: key("slope.rise_over_run", "slope.riseOverRun"),
        uses: ["slope.m_turns_b_moves", "slope.double_run_double_rise", "neg.direction_and_size"],
        coach: [step(7, "recall", "tap")],
      },
      {
        level: 8,
        whyKey: k(8, "why"),
        goalKey: k(8, "goal"),
        key: key("slope.no_run_no_slope", "slope.vertical"),
        uses: ["slope.rise_over_run", "slope.m_turns_b_moves"],
        coach: [step(8, "look", "tap"), step(8, "answer", { signal: "judged" }), reveal(8)],
      },
    ],
  },
  texts: {
    [`node.${NODE}.learned`]:
      "La pendiente es cuánto sube una recta por cada paso que avanza: es la misma en toda la recta, se mide con cualquier escalón y es la m de y = mx + b.",

    [k(1, "why")]:
      "Una rampa recta sube lo mismo en cada paso. Cuánto sube en un paso es lo que dice qué tan empinada es.",
    [k(1, "goal")]: "Tocá la rampa que sube, en cada paso, lo que dice la ficha.",
    [k(1, "coach.look")]:
      "Las tres rampas salen del mismo lugar. La ficha de abajo dice cuántos cuadros sube una de ellas en cada paso.",
    [k(1, "coach.pick")]:
      "Seguí cada rampa un paso a la derecha y contá cuántos cuadros sube. Tocá la que sube lo de la ficha.",
    [k(1, "coach.reveal")]:
      "Esa sube lo mismo en cada paso, en toda la rampa. Ese número dice qué tan empinada es.",

    [k(2, "why")]:
      "La rampa por la que se dan más pasos no es la más empinada: es la que sube menos en cada uno.",
    [k(2, "goal")]: "Tocá la rampa que cuesta más subir.",
    [k(2, "coach.look")]:
      "Tres rampas desde el mismo lugar. Por una se dan muchos pasos antes de salir de la hoja; por otra, pocos.",
    [k(2, "coach.choose")]:
      "Mirá el primer paso de cada una: la que más sube en ese paso es la que más cuesta. Tocala.",
    [k(2, "coach.reveal")]:
      "Por esa se dan menos pasos, pero cada uno sube más. Lo empinado es la subida de un paso, no cuántos pasos hay.",

    [k(3, "why")]:
      "El escalón mide la rampa: su color dice qué tan empinada es. En una rampa recta, apoyado donde sea, el color es el mismo.",
    [k(3, "goal")]: "Arrastrá el escalón a dos lugares más de la rampa y mirá su color.",
    [k(3, "coach.look")]:
      "Este es el escalón: un paso adelante y lo que sube la rampa en ese paso. Su color dice qué tan empinada es.",
    [k(3, "coach.move")]: "Arrastralo a otro lugar de la rampa, más arriba o más abajo, y soltalo.",
    [k(3, "coach.again")]: "El color no cambió. Apoyalo en un lugar más.",
    [k(3, "coach.reveal")]:
      "En los tres lugares tuvo el mismo color: la rampa recta sube lo mismo en todas partes. Mediste la cuesta, no el lugar.",

    [k(4, "why")]:
      "Un escalón más ancho sube más, en la misma proporción: el doble de avance, el doble de subida. Por eso la cuesta no cambia.",
    [k(4, "goal")]: "Hacé que el escalón ancho apoye en la rampa. En las otras rondas, apoyá el angosto en dos lugares más.",
    [k(4, "coach.look")]:
      "Este escalón es más ancho que el apagado, pero sube lo mismo que él: quedó flotando. La sombra muestra dónde apoyaría.",
    [k(4, "coach.raise")]: "Arrastrá hacia arriba la esquina que late, hasta que toque la rampa.",
    [k(4, "coach.reveal")]:
      "Apoyó: avanza más y sube más, en la misma proporción. Mide la misma cuesta que el escalón apagado.",

    [k(5, "why")]:
      "La manivela sube al caminante lo mismo en cada diente. Y si se estira la grilla, la misma recta se acuesta: la cuesta depende de con qué se mide.",
    [k(5, "goal")]: "Girá la manivela hasta la bandera. Cuando haya un punto, estirá la grilla hasta que la rampa pase por él.",
    [k(5, "coach.look")]:
      "La manivela lleva al caminante por la pista. En la rampa, el mismo caminante sube a la vez.",
    [k(5, "coach.turn")]:
      "Girá la manivela, o tocala, de a un diente. Mirá cuánto sube el caminante en cada uno.",
    [k(5, "coach.arrive")]: "Seguí hasta la bandera. Si te pasás, girá para el otro lado.",
    [k(5, "coach.reveal")]:
      "Cada diente fue un paso adelante y la misma subida: por eso la rampa es recta.",
    [k(5, "coach.stretch")]:
      "Ahora arrastrá la perilla de abajo: la grilla se estira de costado. Llevala hasta que la rampa pase por el punto, y mirá el color.",

    [k(6, "why")]:
      "Una recta se arma con dos números: cuánto sube por paso y dónde arranca. Uno la gira y el otro la corre entera.",
    [k(6, "goal")]: "Mové las perillas hasta que la rampa pase por los dos puntos. En las rondas de fichas, tocá la pendiente.",
    [k(6, "coach.look")]:
      "Dos puntos marcados y dos perillas: la de la m y la de la b. Debajo de la rampa, la recta escrita.",
    [k(6, "coach.tilt")]:
      "Arrastrá la perilla de la m: la rampa gira desde donde arranca, y el escalón y el renglón cambian con ella.",
    [k(6, "coach.through")]:
      "Dejala pasando por los dos puntos. Si la cuesta ya está y no pasa, la b la sube o la baja entera.",
    [k(6, "coach.reveal")]:
      "La m dice cuánto sube por paso y la b dónde arranca. El renglón cambió con la rampa: dicen lo mismo.",
    [k(6, "coach.choose")]:
      "Ahora el escalón va de un punto al otro, con Δx y Δy. Tocá la ficha que es Δy dividido Δx.",

    [k(7, "why")]:
      "Sin la rampa a la vista, la pendiente sale igual de dos puntos: lo que sube dividido lo que avanza, aunque baje o no dé entero.",
    [k(7, "goal")]: "Tocá la ficha que es la pendiente: la de los dos puntos, o la de la recta escrita.",
    [k(7, "coach.recall")]:
      "Ahora la rampa se esconde y puede bajar. Dividí lo que sube por lo que avanza; en la recta escrita, buscá la m.",

    [k(8, "why")]:
      "La pendiente se mide por paso. La recta plana sube cero en cada paso; la parada no avanza, así que no tiene. Y dos rectas igual de empinadas no se cruzan.",
    [k(8, "goal")]: "Mirá la recta, o las dos, y elegí abajo lo que es cierto.",
    [k(8, "coach.look")]:
      "Mirá cuánto sube la recta en cada paso, y si avanza. Si hay dos, compará sus cuestas.",
    [k(8, "coach.answer")]: "Elegí abajo la respuesta que dice lo que ves.",
    [k(8, "coach.reveal")]:
      "Lo decidiste mirando la cuesta: cuánto sube por paso, y si hay paso. Sin avance no hay pendiente; con la misma cuesta, no hay cruce.",

    "key.slope.rise_per_step.title": "Cuánto sube en un paso",
    "key.slope.rise_per_step.body":
      "Una rampa recta sube lo mismo en cada paso. Para saber qué tan empinada es, avanzá un paso y contá cuánto sube.",
    "key.slope.steps_not_steepness.title": "Más pasos no es más empinada",
    "key.slope.steps_not_steepness.body":
      "La rampa por la que se dan muchos pasos es la más acostada: cada paso sube poco. Para ver cuál cuesta más, compará lo que sube un paso.",
    "key.slope.same_everywhere.title": "Misma cuesta en toda la rampa",
    "key.slope.same_everywhere.body":
      "En una rampa recta, el escalón tiene el mismo color donde lo apoyes. Por eso alcanza con medirla en un solo lugar.",
    "key.slope.double_run_double_rise.title": "Doble avance, doble subida",
    "key.slope.double_run_double_rise.body":
      "Si el escalón avanza el doble, sube el doble, y la cuesta no cambia. Un escalón ancho y uno angosto miden la misma rampa.",
    "key.slope.grid_matters.title": "La cuesta depende de la grilla",
    "key.slope.grid_matters.body":
      "Estirar la grilla de costado acuesta la misma recta y le cambia el color. Para comparar dos cuestas, medilas con la misma grilla.",
    "key.slope.m_turns_b_moves.title": "La m gira, la b corre",
    "key.slope.m_turns_b_moves.body":
      "En y = mx + b, la m es cuánto sube por paso y gira la recta; la b es dónde corta el eje y la corre entera sin cambiarle la cuesta.",
    "key.slope.rise_over_run.title": "Subida dividido avance",
    "key.slope.rise_over_run.body":
      "Entre dos puntos de la recta, la pendiente es lo que sube dividido lo que avanza. Si baja, lo que sube es negativo, y la pendiente también.",
    "key.slope.no_run_no_slope.title": "Sin avance no hay pendiente",
    "key.slope.no_run_no_slope.body":
      "La plana sube cero por paso: tiene pendiente cero y es una función. La parada no avanza, así que no tiene pendiente. Misma cuesta y distinto arranque: no se cruzan nunca.",

    [msg("placeStep")]: "Arrastrá el escalón a otro lugar de la rampa y mirá su color.",
    [msg("stretchStep")]: "El escalón ancho quedó flotando. Subí la esquina que late hasta que apoye.",
    [msg("crank")]: "Girá la manivela, o tocala, hasta la bandera.",
    [msg("stretchGrid")]: "Arrastrá la perilla hasta que la rampa pase por el punto.",
    [msg("setSliders")]: "Mové las perillas de la m y la b hasta que la rampa pase por los dos puntos.",
    [msg("slopeBetween")]: "Tocá la ficha que es lo que sube dividido lo que avanza, de un punto al otro.",
    [msg("readForm")]: "La misma recta, escrita de dos maneras. Tocá la ficha que es su pendiente.",
    [msg("restAgain")]: "Se movió y el color no cambió. Apoyalo en un lugar más.",
    [msg("samePlace")]: "Ahí ya estuvo. Probá en otro lugar de la rampa.",
    [msg("sameEveryTooth")]: "Cada diente avanzó un paso y subió lo mismo.",
    [msg("pastFlag")]: "Se pasó de la bandera. Girá para el otro lado.",
    [msg("pastPoint")]: "Se estiró de más: la rampa pasa por debajo del punto. Volvé un poco.",
    [msg("verticalNotFunction")]:
      "Tampoco es una función: en un mismo lugar tiene muchas alturas. Y no tiene pendiente, porque no avanza.",
    [msg("tapARamp")]: "Tocá sobre una de las tres rampas.",
    [msg("dragTheCorner")]: "Arrastrá la esquina que late, arriba del escalón.",
    [msg("useTheCrank")]: "El caminante se mueve con la manivela de arriba: girala o tocala.",
    [msg("useTheKnob")]: "La grilla se estira con la perilla de abajo.",
    [msg("useTheSliders")]: "La rampa se mueve con las dos perillas de abajo.",
    [msg("useTheChips")]: "Contestá tocando una de las fichas de abajo.",
    [msg("useTheAnswers")]: "Contestá con uno de los botones de abajo.",
    [msg("otherM")]:
      "Esa no. Con la y sola a la izquierda, la pendiente es el número que multiplica a la x.",
  },
  // Puntos y barras sobre una caja de 40 × 40. Los puntos son la rampa o sus
  // puntas; las barras, los tramos del escalón. El resaltado es lo que se mide.
  glyphs: {
    // Una rampa y, debajo de su primer tramo, un paso con lo que sube.
    "slope.perStep": {
      dots: [[6, 32, 3], [16, 24, 3], [26, 16, 3], [36, 8, 3.5, true]],
      bars: [[6, 31, 10, 2], [15, 24, 2, 9]],
    },
    // Dos rampas desde el mismo pie: la corta llega alto, la larga llega lejos.
    "slope.twoRamps": {
      dots: [[5, 34, 3], [12, 22, 3], [19, 10, 3.5, true], [17, 30, 2.5], [29, 26, 2.5], [37, 23, 2.5]],
    },
    // El mismo escalón en dos lugares de la rampa.
    "slope.same": {
      dots: [[4, 34, 3], [14, 27, 3], [24, 20, 3], [34, 13, 3]],
      bars: [[4, 33, 10, 2], [13, 27, 2, 8], [24, 19, 10, 2], [33, 13, 2, 8]],
    },
    // Un escalón y otro del doble de ancho y del doble de alto.
    "slope.double": {
      dots: [[12, 26, 3], [34, 18, 3.5, true]],
      bars: [[4, 32, 8, 2], [11, 26, 2, 8], [18, 32, 16, 2], [33, 18, 2, 16]],
    },
    // La misma recta, empinada y estirada de costado.
    "slope.stretch": {
      dots: [[4, 34, 3], [11, 24, 3], [18, 14, 3], [20, 30, 2.5], [36, 26, 3, true]],
      bars: [[4, 38, 32, 1.5]],
    },
    "slope.m": { dots: [], card: "m" },
    // Un escalón de punta a punta: la subida sobre el avance.
    "slope.riseOverRun": {
      dots: [[6, 32, 3.5], [34, 12, 3.5, true]],
      bars: [[6, 31, 28, 2], [33, 12, 2, 21]],
    },
    // La recta parada: no avanza, así que no hay escalón que apoyar.
    "slope.vertical": {
      dots: [[20, 6, 3], [20, 34, 3, true]],
      bars: [[19, 6, 2, 28]],
    },
  },
};
