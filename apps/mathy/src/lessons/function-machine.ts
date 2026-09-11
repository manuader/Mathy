/**
 * La lección de la fábrica (`alg.fn.function_as_machine`), nivel por nivel.
 *
 * Cinco niveles estrenan algo y traen una guía atada a eso: meter fichas en
 * una máquina tapada (1), armar la máquina con piezas (2), colgar flechas en la
 * red (3), tocar la máquina que hay que nombrar (4) y meter una letra o una suma
 * entera por la ranura (5). El 6 repite gestos conocidos con preguntas de
 * `formal`: su guía es un solo recordatorio de qué llaves usar.
 *
 * Los niveles 2 a 6 alternan preguntas y la guía acompaña sólo la primera
 * ronda; por eso su objetivo nombra todas, y la actividad le dice a Tomi qué
 * paso vale en cada ronda (`preferHint`).
 */
import type { CoachStep, KeySpec, LessonModule } from "./types.ts";

const NODE = "alg.fn.function_as_machine";

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

export const FN_MSG = {
  backToTray: msg("backToTray"),
  pieceBack: msg("pieceBack"),
  forkOff: msg("forkOff"),
  pickInputFirst: msg("pickInputFirst"),
  inputPicked: msg("inputPicked"),
  tapANetwork: msg("tapANetwork"),
  tapAMachine: msg("tapAMachine"),
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
        key: key("fn.try_reveals", "fn.table"),
        uses: [],
        coach: [
          step(1, "look", "tap"),
          step(1, "feed", { signal: "fed" }),
          step(1, "again", { signal: "repeated" }),
          step(1, "find", { signal: "solved" }),
          reveal(1),
        ],
      },
      {
        level: 2,
        whyKey: k(2, "why"),
        goalKey: k(2, "goal"),
        key: key("fn.one_output", "fn.box"),
        uses: ["fn.try_reveals", "prec.order_changes"],
        coach: [
          step(2, "look", "tap"),
          step(2, "place", { signal: "placed" }),
          step(2, "build", { signal: "built" }),
          reveal(2),
        ],
      },
      {
        level: 3,
        whyKey: k(3, "why"),
        goalKey: k(3, "goal"),
        key: key("fn.one_arrow_each", "fn.arrows"),
        uses: ["fn.one_output", "count.pair_compares"],
        coach: [
          step(3, "look", "tap"),
          step(3, "hang", { signal: "hung" }),
          step(3, "all", { signal: "solved" }),
          reveal(3),
        ],
      },
      {
        level: 4,
        whyKey: k(4, "why"),
        goalKey: k(4, "goal"),
        key: key("fn.name_says_which", "fn.name"),
        uses: ["fn.one_output", "prec.times_inside"],
        coach: [step(4, "look", "tap"), step(4, "pick", { signal: "named" }), reveal(4)],
      },
      {
        level: 5,
        whyKey: k(5, "why"),
        goalKey: k(5, "goal"),
        key: key("fn.slot_takes_all", "fn.slot"),
        uses: ["fn.name_says_which", "prec.order_changes"],
        coach: [step(5, "look", "tap"), step(5, "choose", { signal: "chosen" }), reveal(5)],
      },
      {
        level: 6,
        whyKey: k(6, "why"),
        goalKey: k(6, "goal"),
        key: key("fn.same_outputs", "fn.same"),
        uses: ["fn.try_reveals", "fn.one_output", "fn.slot_takes_all"],
        coach: [step(6, "recall", "tap")],
      },
    ],
  },
  texts: {
    [`node.${NODE}.learned`]:
      "Una función es una máquina: a cada entrada le da una sola salida, siempre la misma. Se la nombra con una letra, y lo que va entre paréntesis es lo que entra.",

    [k(1, "why")]:
      "Una máquina tapada no dice qué hace, pero contesta. Metiendo fichas y mirando qué sale, la tabla va contando la regla.",
    [k(1, "goal")]: "Meté fichas en la ranura hasta que salga la que se pide.",
    [k(1, "coach.look")]:
      "La máquina tiene la placa tapada. Al lado del caño espera la ficha que tiene que salir, y abajo están las fichas para meter.",
    [k(1, "coach.feed")]:
      "Tocá una ficha de abajo, o arrastrala hasta la boca del caño. Mirá qué sale y dónde se anota.",
    [k(1, "coach.again")]: "Meté otra vez la misma ficha. Fijate si sale algo distinto.",
    [k(1, "coach.find")]:
      "Misma ficha, misma salida: la fila se encendió en vez de repetirse. Ahora buscá la ficha que saca la pedida.",
    [k(1, "coach.reveal")]:
      "Sin abrir la máquina, la tabla te dijo qué hace. Descubriste la regla probando, y cada ficha sale siempre igual.",

    [k(2, "why")]:
      "Armar una máquina es elegir sus piezas y su orden hasta que saque lo que dice la tabla. Y aparece una pieza tramposa, que saca dos cosas.",
    [k(2, "goal")]: "Armá la máquina con las piezas de abajo hasta que coincida con la tabla.",
    [k(2, "coach.look")]:
      "La tabla dice qué tiene que salir con cada entrada. Abajo están las piezas, y cada una muestra lo que hace.",
    [k(2, "coach.place")]:
      "Tocá una pieza, o arrastrala hasta el caño. Entra en la primera ranura libre, de izquierda a derecha.",
    [k(2, "coach.build")]:
      "Seguí hasta que la tabla coincida. Si una pieza no da, rebota y podés probar otra.",
    [k(2, "coach.reveal")]:
      "La máquina saca lo que dice la tabla: una salida por cada entrada. Ojo en las próximas rondas: hay una pieza que saca dos.",

    [k(3, "why")]:
      "La máquina se aplana en puntos y flechas. La regla es una máquina si de cada punto sale una flecha: ni dos ni ninguna.",
    [k(3, "goal")]:
      "Colgá una flecha desde cada punto de la izquierda. En las otras rondas, tocá la red que no es una máquina.",
    [k(3, "coach.look")]:
      "Arriba está la regla. A la izquierda, lo que entra; a la derecha, lo que puede salir.",
    [k(3, "coach.hang")]:
      "Tocá un punto de la izquierda y después el de la derecha adonde lo manda la regla. También podés arrastrar.",
    [k(3, "coach.all")]:
      "Seguí hasta que cada punto de la izquierda tenga su flecha. Un punto sin flecha queda apagado.",
    [k(3, "coach.reveal")]:
      "Cada punto tiene una flecha y una sola: eso es una máquina. A la derecha sobró un punto, y eso no rompe nada.",

    [k(4, "why")]:
      "Con dos máquinas en pantalla, la salida sola no dice cuál se usó. De esa falta nace el nombre: f con su paréntesis dice qué máquina y qué entra.",
    [k(4, "goal")]:
      "Tocá la máquina que saca la salida pedida. En las otras rondas, elegí lo que sale.",
    [k(4, "coach.look")]:
      "Hay dos máquinas y las dos reciben la misma ficha. Al lado de cada una está la salida pedida: la saca una sola.",
    [k(4, "coach.pick")]: "Seguí la ficha por cada máquina y tocá la que saca la salida pedida.",
    [k(4, "coach.reveal")]:
      "La que tocaste se contrajo en su letra, f. Así, f con una ficha entre paréntesis dice qué máquina y qué le entra.",

    [k(5, "why")]:
      "La ranura acepta cualquier cosa: una letra o una suma entera. Además, el orden de las máquinas importa, y hay fichas que una máquina no acepta.",
    [k(5, "goal")]: "Elegí lo que sale, ordená las máquinas o encontrá la ficha que entra, según la ronda.",
    [k(5, "coach.look")]:
      "Ahora entra una letra, o una suma entera. La regla es la de la placa: no cambia con lo que entre.",
    [k(5, "coach.choose")]:
      "Poné lo de adentro del paréntesis en el lugar de la x, y elegí abajo lo que sale.",
    [k(5, "coach.reveal")]:
      "Lo de adentro entró entero por la ranura y la regla hizo lo de siempre. El paréntesis es la ranura.",

    [k(6, "why")]:
      "Una función es lo que hace, no cómo se escribe. Dos escrituras son la misma si dan igual con cualquier entrada, y una tabla corta puede engañar.",
    [k(6, "goal")]:
      "Encontrá la misma función escrita distinto, la regla de la tabla, o si la tabla es una máquina.",
    [k(6, "coach.recall")]:
      "Todo esto ya lo sabés hacer. Tus llaves: probar descubre la regla, y una entrada con dos salidas no es una máquina.",

    [FN_MSG.backToTray]: "La ficha volvió al cajón. Soltala sobre la boca del caño, o tocala.",
    [FN_MSG.pieceBack]: "La pieza volvió al cajón. Soltala sobre el caño, o tocala.",
    [FN_MSG.forkOff]:
      "Esa pieza sacó dos cosas de una sola entrada, y quedó apagada. Usá la otra que se le parece.",
    [FN_MSG.pickInputFirst]: "Primero tocá un punto de la izquierda: de ahí sale la flecha.",
    [FN_MSG.inputPicked]: "Ahora tocá el punto de la derecha adonde lo manda la regla.",
    [FN_MSG.tapANetwork]: "Tocá adentro de una de las dos redes.",
    [FN_MSG.tapAMachine]: "Tocá una de las máquinas.",

    "key.fn.try_reveals.title": "Probar descubre la regla",
    "key.fn.try_reveals.body":
      "Si no sabés qué hace una máquina, meté fichas y anotá qué sale. La misma ficha sale siempre igual, así que dos o tres filas ya muestran la regla.",
    "key.fn.one_output.title": "Una entrada, una salida",
    "key.fn.one_output.body":
      "Una máquina saca una sola cosa por cada ficha. Si algo saca dos a la vez, no es una máquina, aunque una de las dos coincida con la tabla.",
    "key.fn.one_arrow_each.title": "Una flecha por punto",
    "key.fn.one_arrow_each.body":
      "De cada punto de entrada sale exactamente una flecha. Dos desde el mismo punto, o ninguna, y ya no es una máquina. Que a una salida lleguen dos sí se puede.",
    "key.fn.name_says_which.title": "El nombre dice cuál",
    "key.fn.name_says_which.body":
      "Con varias máquinas, cada una lleva su letra. f(4) quiere decir: la máquina f, con 4 en la ranura. El paréntesis es la ranura, no una multiplicación.",
    "key.fn.slot_takes_all.title": "La ranura recibe todo",
    "key.fn.slot_takes_all.body":
      "Lo que está entre paréntesis entra entero a la máquina: un número, una letra o una suma. Va en el lugar de la x, y la regla hace lo de siempre.",
    "key.fn.same_outputs.title": "Mismas salidas, misma función",
    "key.fn.same_outputs.body":
      "Dos escrituras son la misma función si dan la misma salida con cualquier entrada. Una fila sola no alcanza: probá otra entrada y mirá si siguen de acuerdo.",
  },
  // Puntos y barras sobre una caja de 40 × 40. Resaltado (azul) es lo que la
  // llave enseña a mirar.
  glyphs: {
    // La tabla: tres filas, cada entrada con su salida.
    "fn.table": {
      dots: [[8, 10, 3], [32, 10, 3, true], [8, 20, 3], [32, 20, 3, true], [8, 30, 3], [32, 30, 3, true]],
      bars: [[13, 9, 14, 2], [13, 19, 14, 2], [13, 29, 14, 2]],
    },
    // La carcasa: una entra, una sale.
    "fn.box": {
      dots: [[5, 20, 3], [35, 20, 3.5, true]],
      bars: [[14, 11, 12, 2], [14, 27, 12, 2], [14, 11, 2, 18], [24, 11, 2, 18], [8, 19, 6, 2], [26, 19, 6, 2]],
    },
    // Dos columnas de puntos: de cada uno de la izquierda sale una flecha, y un
    // punto de la derecha se queda sin ninguna.
    "fn.arrows": {
      dots: [[7, 9, 3, true], [7, 20, 3, true], [7, 31, 3, true], [33, 9, 3], [33, 20, 3], [33, 31, 3], [33, 38, 2]],
      bars: [[11, 8, 18, 2], [11, 19, 18, 2], [11, 30, 18, 2]],
    },
    "fn.name": { dots: [], card: "f" },
    // La ranura abierta con algo adentro: el paréntesis recibe lo que sea.
    "fn.slot": {
      dots: [[20, 20, 4, true], [26, 20, 2.5, true]],
      bars: [[9, 8, 2, 24], [29, 8, 2, 24], [9, 8, 5, 2], [26, 8, 5, 2], [9, 30, 5, 2], [26, 30, 5, 2]],
    },
    // Dos escrituras con las mismas salidas: dos filas que terminan igual.
    "fn.same": {
      dots: [[6, 13, 3], [6, 27, 3], [34, 13, 3.5, true], [34, 27, 3.5, true]],
      bars: [[10, 12, 8, 2], [20, 12, 10, 2], [10, 26, 4, 2], [16, 26, 14, 2]],
    },
  },
};
