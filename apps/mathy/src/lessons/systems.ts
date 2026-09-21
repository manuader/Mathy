/**
 * La lección del libro de frutas (`alg.sys.two_by_two`), nivel por nivel.
 *
 * Seis niveles estrenan un gesto o una pregunta y traen una guía atada a eso:
 * soltar una ficha bajo la fruta (1), buscar varios pares (2), reemplazar una
 * fruta en las dos filas (3), volcar un renglón sobre el otro (4), agrandar una
 * fila entera (6) y decir de qué clase es el sistema mirando las rectas (7). El
 * 5 repite los dos métodos con letras: su guía es un recordatorio. El 4 y el 5
 * alternan preguntas y la guía acompaña sólo la primera ronda.
 *
 * Las señales las emite `activities/SystemsGame.tsx`: `placed` cuando una ficha
 * cae bajo una fruta, `pairFound` con cada par nuevo, `substituted` cuando una
 * fruta se va de las filas, `rowHeld` y `poured` al agarrar y volcar un
 * renglón, `scaled` cuando una fila crece entera y `solved` cuando la ronda se
 * resolvió.
 */
import type { CoachStep, KeySpec, LessonModule } from "./types.ts";

const NODE = "alg.sys.two_by_two";

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

/** Lo que la actividad dice en la línea de abajo, con la clave del nodo. */
const msg = (id: string): string => `lesson.${NODE}.msg.${id}`;

export const MODULE: LessonModule = {
  lesson: {
    node: NODE,
    learnedKey: `node.${NODE}.learned`,
    levels: [
      {
        level: 1,
        whyKey: k(1, "why"),
        goalKey: k(1, "goal"),
        key: key("sys.equal_share", "sys.share"),
        uses: ["div.back_to_start"],
        coach: [
          step(1, "look", "tap"),
          step(1, "place", { signal: "placed" }),
          step(1, "level", { signal: "solved" }),
          reveal(1),
        ],
      },
      {
        level: 2,
        whyKey: k(2, "why"),
        goalKey: k(2, "goal"),
        key: key("sys.one_row_many", "sys.manyPairs"),
        uses: ["sys.equal_share"],
        coach: [
          step(2, "look", "tap"),
          step(2, "pair", { signal: "pairFound" }),
          step(2, "more", { signal: "solved" }),
          reveal(2),
        ],
      },
      {
        level: 3,
        whyKey: k(3, "why"),
        goalKey: k(3, "goal"),
        key: key("sys.same_everywhere", "sys.shared"),
        uses: ["sys.equal_share", "sys.one_row_many"],
        coach: [
          step(3, "look", "tap"),
          step(3, "place", { signal: "placed" }),
          step(3, "swap", { signal: "substituted" }),
          step(3, "solve", { signal: "solved" }),
          reveal(3),
        ],
      },
      {
        level: 4,
        whyKey: k(4, "why"),
        goalKey: k(4, "goal"),
        key: key("sys.pour_cancels", "sys.pour"),
        uses: ["sys.same_everywhere"],
        coach: [
          step(4, "look", "tap"),
          step(4, "hold", { signal: "rowHeld" }),
          step(4, "pour", { signal: "poured" }),
          step(4, "solve", { signal: "solved" }),
          reveal(4),
        ],
      },
      {
        level: 5,
        whyKey: k(5, "why"),
        goalKey: k(5, "goal"),
        key: key("sys.brace_both", "sys.brace"),
        uses: ["sys.same_everywhere", "sys.pour_cancels"],
        coach: [step(5, "recall", "tap")],
      },
      {
        level: 6,
        whyKey: k(6, "why"),
        goalKey: k(6, "goal"),
        key: key("sys.scale_row", "sys.scale"),
        uses: ["sys.pour_cancels", "dist.width_to_each"],
        coach: [
          step(6, "look", "tap"),
          step(6, "scale", { signal: "scaled" }),
          step(6, "pour", { signal: "poured" }),
          step(6, "solve", { signal: "solved" }),
          reveal(6),
        ],
      },
      {
        level: 7,
        whyKey: k(7, "why"),
        goalKey: k(7, "goal"),
        key: key("sys.lines_count", "sys.lines"),
        uses: ["sys.one_row_many", "sys.brace_both"],
        coach: [step(7, "look", "tap"), step(7, "classify", { signal: "solved" }), reveal(7)],
      },
    ],
  },
  texts: {
    [`node.${NODE}.learned`]:
      "Un sistema son dos filas que hablan de las mismas frutas: un par es solución si deja las dos derechas a la vez. Se busca reemplazando o volcando, y las rectas dicen si hay uno, ninguno o infinitos.",

    // --- 1. Una fruta sola: repartir el total ----------------------------------
    [k(1, "why")]:
      "Si varias frutas iguales pesan juntas un total, cada una pesa lo mismo: el total repartido en partes iguales. La línea del cartel dice si acertaste.",
    [k(1, "goal")]: "Soltá bajo la fruta la ficha que deja la línea derecha.",
    [k(1, "coach.look")]:
      "Un renglón del cartel: frutas iguales a la izquierda, la línea en el medio y el total a la derecha.",
    [k(1, "coach.place")]:
      "Llevá una ficha de abajo hasta la fruta, o tocá la ficha y después la fruta. Su valor aparece bajo todas.",
    [k(1, "coach.level")]:
      "Si la línea se inclinó, el valor no alcanza o sobra. Probá otra ficha hasta que quede derecha.",
    [k(1, "coach.reveal")]:
      "Todas las frutas iguales valen lo mismo, así que el total se repartió parejo. La línea derecha lo confirma.",

    // --- 2. Dos frutas, una fila: muchos pares ---------------------------------
    [k(2, "why")]:
      "Con dos frutas distintas en una sola fila, muchos pares la dejan derecha. Una fila sola no alcanza para saber cuánto vale cada una.",
    [k(2, "goal")]: "Encontrá tres pares distintos que dejen la línea derecha.",
    [k(2, "coach.look")]:
      "Ahora hay dos frutas en la fila, y el total es de las dos juntas.",
    [k(2, "coach.pair")]:
      "Poné una ficha bajo cada fruta. Si la línea queda derecha, encontraste un par.",
    [k(2, "coach.more")]: "Buscá otro par distinto. Las fichas se despejan solas para que pruebes de nuevo.",
    [k(2, "coach.reveal")]:
      "Tres pares distintos y los tres dejan la fila derecha. Con una fila sola, ninguno es la respuesta.",

    // --- 3. Dos filas: la misma fruta, el mismo valor --------------------------
    [k(3, "why")]:
      "Dos filas que comparten una fruta hablan de la misma fruta: lo que una dice, vale en la otra. Por eso una fila puede ayudar a resolver la otra.",
    [k(3, "goal")]: "Averiguá cuánto vale cada fruta hasta que las dos líneas queden derechas.",
    [k(3, "coach.look")]:
      "La fila de arriba tiene una sola fruta: ahí se puede saber cuánto vale. La de abajo la comparte.",
    [k(3, "coach.place")]:
      "Soltá bajo la fruta de arriba la ficha que la deja derecha. Mirá: el valor aparece también abajo.",
    [k(3, "coach.swap")]:
      "Con las manos vacías, tocá esa fruta. Se va de las dos filas a la vez y su peso cruza la línea.",
    [k(3, "coach.solve")]: "Queda una fruta sola en la fila de abajo. Buscale su ficha.",
    [k(3, "coach.reveal")]:
      "Las dos líneas quedaron derechas. La fruta valía lo mismo en las dos filas, y eso resolvió la de abajo.",

    // --- 4. Barras y segmentos: volcar cancela ---------------------------------
    [k(4, "why")]:
      "Sumar dos filas ciertas da otra fila cierta. Si una fruta está sumada en una y restada en la otra, al juntarlas se va sola.",
    [k(4, "goal")]: "Volcá un renglón sobre el otro, o reemplazá, hasta que las dos líneas queden derechas.",
    [k(4, "coach.look")]:
      "Una fruta aparece sumada en una fila y restada en la otra, las mismas veces.",
    [k(4, "coach.hold")]: "Tocá la perilla al final de un renglón para agarrarlo.",
    [k(4, "coach.pour")]: "Ahora tocá la perilla del otro renglón: el primero se vuelca encima.",
    [k(4, "coach.solve")]:
      "La fila nueva tiene una sola fruta. Buscale su ficha, y después la de la otra fruta.",
    [k(4, "coach.reveal")]:
      "Al volcar, la fruta sumada y la restada se cancelaron solas. Nadie la borró: sumaron cero.",

    // --- 5. Letras y llave: las dos a la vez -----------------------------------
    [k(5, "why")]:
      "Las frutas se volvieron letras, x e y, y una llave junta los dos renglones. La llave dice que un par tiene que cumplir los dos a la vez.",
    [k(5, "goal")]: "Reemplazá o volcá hasta que x e y muestren su valor y las dos líneas queden derechas.",
    [k(5, "coach.recall")]:
      "Son los mismos gestos con letras. Tus llaves: la misma letra vale lo mismo en las dos filas, y volcar cancela lo opuesto.",

    // --- 6. Elegir el método: agrandar una fila entera -------------------------
    [k(6, "why")]:
      "Si ninguna letra se cancela, se agranda una fila entera, total incluido. La fila sigue siendo cierta, y ahora sí algo se cancela al volcar.",
    [k(6, "goal")]: "Elegí cómo resolverlo: agrandá filas y volcá, o probá fichas, hasta dejar las dos derechas.",
    [k(6, "coach.look")]:
      "Ninguna letra aparece igual y con signo opuesto en las dos filas: volcar ahora no cancela nada.",
    [k(6, "coach.scale")]:
      "Tocá una ficha de factor y después la perilla de una fila. Crece entera, también el total.",
    [k(6, "coach.pour")]:
      "Cuando una letra quede igual y con signo opuesto, tocá una perilla y después la otra para volcar.",
    [k(6, "coach.solve")]: "Buscá la ficha de la letra que quedó sola, y después la de la otra.",
    [k(6, "coach.reveal")]:
      "Agrandar la fila entera no cambió lo que dice, y dejó una letra lista para cancelarse al volcar.",

    // --- 7. Cuando no hay cruce: las rectas cuentan los pares ------------------
    [k(7, "why")]:
      "Cada fila es una recta, y un par que la cumple es un punto de la recta. Si se cruzan hay un solo par; si son paralelas, ninguno; si son la misma, infinitos.",
    [k(7, "goal")]: "Mirá las dos rectas y decí cuántos pares cumplen las dos filas.",
    [k(7, "coach.look")]:
      "A la derecha, cada fila es una recta en la grilla. Fijate si se cruzan, si no se tocan o si son una sola.",
    [k(7, "coach.classify")]: "Tocá abajo cuántos pares cumplen las dos filas a la vez.",
    [k(7, "coach.reveal")]:
      "El par que cumple las dos está donde las rectas se cruzan. Sin cruce no hay par, y si son la misma, hay infinitos.",

    // --- La línea de abajo -----------------------------------------------------
    [msg("chipBack")]: "La ficha volvió al mostrador. Soltala encima de una fruta.",
    [msg("dropOnFruit")]: "Soltá la ficha sobre una fruta del cartel, no sobre el total.",
    // El veredicto que no coincide muestra qué mirar, sin calificar.
    [msg("wrongClass")]: "Mirá otra vez las dos rectas: ¿se cruzan en un punto, no se tocan o son la misma?",
    // Desde `symbolic` las frutas ya son letras: lo que las nombra cambia con ellas.
    [msg("chipBackLetter")]: "La ficha volvió al mostrador. Soltala encima de una letra.",
    [msg("pickChipLetter")]: "Elegí una ficha del mostrador y soltala bajo una letra.",
    [msg("chipHeldLetter")]: "Ahora soltala bajo una letra. Va a aparecer bajo todas.",
    [msg("needValueLetter")]: "Esa incógnita todavía no mostró su valor.",
    [msg("alreadyGoneLetter")]: "Esa incógnita ya se reemplazó en todas las filas.",
    [msg("pouredLetter")]: "Las dos filas se juntaron y una incógnita se canceló sola.",
    [msg("pouredNothingLetter")]: "Se juntaron, pero no se canceló nada: la fila nueva trae las dos incógnitas.",

    // --- Las llaves ------------------------------------------------------------
    "key.sys.equal_share.title": "Frutas iguales, partes iguales",
    "key.sys.equal_share.body":
      "Si tres manzanas iguales pesan 30, cada una pesa 30 repartido en tres: 10. Probá un valor y mirá si la línea queda derecha.",
    "key.sys.one_row_many.title": "Una fila no alcanza",
    "key.sys.one_row_many.body":
      "Con dos frutas en una sola fila hay muchos pares que la dejan derecha. Para saber cuánto vale cada una hace falta otra fila.",
    "key.sys.same_everywhere.title": "Misma fruta, mismo valor",
    "key.sys.same_everywhere.body":
      "Lo que una fila dice de una fruta vale en todas. Averiguala donde está sola y reemplazala en las dos filas a la vez.",
    "key.sys.pour_cancels.title": "Volcar cancela lo opuesto",
    "key.sys.pour_cancels.body":
      "Sumar dos filas ciertas da otra cierta. Si una fruta está sumada en una y restada en la otra, las mismas veces, al volcarlas se va.",
    "key.sys.brace_both.title": "La llave pide las dos",
    "key.sys.brace_both.body":
      "La llave junta dos igualdades sobre las mismas x e y. Un par es solución sólo si deja derechas las dos a la vez.",
    "key.sys.scale_row.title": "Agrandá la fila entera",
    "key.sys.scale_row.body":
      "Si nada se cancela, multiplicá una fila entera, total incluido, hasta que una letra quede igual y con signo opuesto en la otra. Después volcá.",
    "key.sys.lines_count.title": "Las rectas cuentan los pares",
    "key.sys.lines_count.body":
      "Cada fila es una recta. Si se cruzan hay un par; si son paralelas, ninguno; si son la misma recta, infinitos.",
  },
  // Puntos y barras sobre una caja de 40 × 40. Los puntos resaltados son lo que
  // la llave enseña a mirar; las barras, líneas y renglones.
  glyphs: {
    // Tres frutas iguales, la línea derecha y el total del otro lado.
    "sys.share": {
      dots: [[7, 18, 3.4, true], [15, 18, 3.4, true], [23, 18, 3.4, true], [33, 18, 3.4]],
      bars: [[4, 26, 32, 2]],
    },
    // Una fila y muchos pares que la cumplen: una recta llena de puntos.
    "sys.manyPairs": {
      dots: [[7, 33, 2.8, true], [14, 26, 2.8, true], [21, 19, 2.8, true], [28, 12, 2.8, true], [35, 5, 2.8, true]],
      bars: [[4, 36, 32, 1.5], [4, 4, 1.5, 32]],
    },
    // Dos renglones que comparten la misma fruta.
    "sys.shared": {
      dots: [[9, 12, 3.4, true], [9, 28, 3.4, true], [19, 28, 3.4]],
      bars: [[4, 18, 32, 2], [4, 34, 32, 2], [8, 15, 2, 10]],
    },
    // Dos renglones que se juntan en uno: la fruta opuesta se va.
    "sys.pour": {
      dots: [[9, 8, 3, true], [21, 8, 3], [9, 20, 3, true], [21, 20, 3], [21, 33, 3]],
      bars: [[4, 13, 32, 1.5], [4, 25, 32, 1.5], [4, 29, 32, 2]],
    },
    // La llave que abraza dos renglones.
    "sys.brace": {
      dots: [[20, 12, 3], [20, 28, 3]],
      bars: [[5, 6, 2, 28], [5, 6, 6, 2], [5, 32, 6, 2], [3, 19, 3, 2], [14, 17, 22, 2], [14, 33, 22, 2]],
    },
    // Una fila y la misma fila más larga: todo creció junto.
    "sys.scale": {
      dots: [[8, 10, 2.8], [16, 10, 2.8], [8, 26, 2.8, true], [16, 26, 2.8, true], [24, 26, 2.8, true], [32, 26, 2.8, true]],
      bars: [[4, 15, 16, 1.5], [4, 31, 32, 1.5]],
    },
    // Dos rectas que se cruzan en un punto.
    "sys.lines": {
      dots: [[20, 20, 3.6, true]],
      bars: [[4, 19, 32, 2], [19, 4, 2, 32]],
    },
  },
};
