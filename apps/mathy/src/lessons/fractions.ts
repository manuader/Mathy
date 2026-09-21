/**
 * La lección de la pizza y la barra, nivel por nivel.
 *
 * Es el primer nodo donde el jugador parte un entero, así que la guía del nivel
 * 1 no enseña un símbolo: hace cortar. Primero la barra es un todo, después el
 * dedo la corta en partes que miden lo mismo, después se enciende una, y recién
 * ahí se nombra lo que dice la ficha. Los niveles que estrenan un gesto o una
 * pregunta nueva (cortar, elegir una pizza, vaciar el frasco, encontrar la suma
 * cruzada, repartir, clavar en la recta) traen una guía de varios pasos atada a
 * ese gesto. El 5 y el 8 repiten gestos conocidos con más dificultad: su guía es
 * un recordatorio de qué llave usar.
 *
 * Las señales las emite `activities/FractionsGame.tsx`: `cut` cuando la barra
 * quedó cortada pareja en las partes que pide la ficha, `emptied` cuando el
 * frasco quedó vacío y `solved` cuando la ronda se resolvió.
 */
import type { CoachStep, KeySpec, LessonModule } from "./types.ts";

const NODE = "arith.frac.parts_and_ratio";

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
        key: key("frac.equal_parts", "frac.thirds"),
        // Tantas partes como puntos abajo: cada punto frente a una parte.
        uses: ["count.pair_compares"],
        coach: [
          step(1, "look", "tap"),
          step(1, "cut", { signal: "cut" }),
          step(1, "light", { signal: "solved" }),
          reveal(1),
        ],
      },
      {
        level: 2,
        whyKey: k(2, "why"),
        goalKey: k(2, "goal"),
        key: key("frac.two_counts", "frac.twoCounts"),
        uses: ["frac.equal_parts"],
        coach: [step(2, "look", "tap"), step(2, "pick", { signal: "solved" }), reveal(2)],
      },
      {
        level: 3,
        whyKey: k(3, "why"),
        goalKey: k(3, "goal"),
        key: key("frac.whole_first", "frac.jar"),
        uses: ["frac.two_counts", "count.one_by_one"],
        coach: [
          step(3, "look", "tap"),
          step(3, "draw", { signal: "emptied" }),
          step(3, "choose", { signal: "solved" }),
          reveal(3),
        ],
      },
      {
        level: 4,
        whyKey: k(4, "why"),
        goalKey: k(4, "goal"),
        key: key("frac.no_cross_add", "frac.twoSizes"),
        uses: ["frac.equal_parts", "frac.two_counts"],
        coach: [step(4, "look", "tap"), step(4, "choose", { signal: "solved" }), reveal(4)],
      },
      {
        level: 5,
        whyKey: k(5, "why"),
        goalKey: k(5, "goal"),
        key: key("frac.bar_is_cut", "frac.cutTurns"),
        uses: ["frac.equal_parts", "frac.two_counts"],
        coach: [step(5, "recall", "tap")],
      },
      {
        level: 6,
        whyKey: k(6, "why"),
        goalKey: k(6, "goal"),
        key: key("frac.share_divides", "frac.share"),
        uses: ["frac.bar_is_cut"],
        coach: [step(6, "look", "tap"), step(6, "choose", { signal: "solved" }), reveal(6)],
      },
      {
        level: 7,
        whyKey: k(7, "why"),
        goalKey: k(7, "goal"),
        key: key("frac.is_a_point", "frac.point"),
        uses: ["frac.bar_is_cut", "frac.equal_parts"],
        coach: [step(7, "look", "tap"), step(7, "pin", { signal: "solved" }), reveal(7)],
      },
      {
        level: 8,
        whyKey: k(8, "why"),
        goalKey: k(8, "goal"),
        key: key("frac.any_whole", "frac.glass"),
        uses: ["frac.whole_first", "frac.two_counts"],
        coach: [step(8, "recall", "tap")],
      },
    ],
  },
  texts: {
    // --- 1. Cortar parejo: el gesto que define el número de abajo -------------
    [k(1, "why")]:
      "Una fracción empieza por cortar el todo en partes que miden lo mismo. Si los pedazos no son iguales, contarlos no dice nada.",
    [k(1, "goal")]: "Cortá la barra en partes iguales y encendé las que pide la ficha.",
    [k(1, "coach.look")]:
      "Esta barra es un todo entero. Vas a cortarla en partes que midan lo mismo, y los puntos de la ficha dicen cuántas.",
    [k(1, "coach.cut")]:
      "Apoyá el dedo en la barra y arrastrá hacia abajo: cuanto más lejos, más partes. Pará al tener tantas como puntos abajo.",
    [k(1, "coach.light")]:
      "Tocá la barra para encender una parte. Es una de esas partes iguales, como el punto de arriba de la ficha.",
    [k(1, "coach.reveal")]:
      "Tomaste una de varias partes iguales, y eso dice la ficha: abajo, en cuántas iguales cortaste; arriba, cuántas tomaste.",

    // --- 2. Encender varias: leer las dos cuentas en un dibujo ----------------
    [k(2, "why")]:
      "Una fracción son dos cuentas del mismo todo: en cuántas partes iguales está y cuántas se tomaron. Si una no coincide, es otra fracción.",
    [k(2, "goal")]: "Tocá la pizza que muestra exactamente lo que dice la ficha.",
    [k(2, "coach.look")]:
      "Cuatro pizzas cortadas de formas distintas. La ficha dice abajo cuántas porciones iguales hay, y arriba cuántas están encendidas.",
    [k(2, "coach.pick")]:
      "Buscá la que tenga porciones iguales, tantas como puntos abajo, y encendidas tantas como puntos arriba. Tocala.",
    [k(2, "coach.reveal")]:
      "Esa coincide en las dos cuentas: porciones iguales y encendidas las justas. A cada una de las otras le fallaba una cuenta.",

    // --- 3. El frasco: un todo que no se corta ---------------------------------
    [k(3, "why")]:
      "Hay fracciones donde nadie cortó nada. En un frasco, el todo son todas las bolas, y la parte, las de un color.",
    [k(3, "goal")]: "Vaciá el frasco y elegí la ficha que dice qué parte del total son las azules.",
    [k(3, "coach.look")]:
      "Este frasco es el todo. Tiene bolas de dos colores mezcladas, y esta vez nadie va a cortar nada.",
    [k(3, "coach.draw")]: "Tocá el frasco para sacar bolas, una por toque, hasta vaciarlo. Se apilan por color.",
    [k(3, "coach.choose")]:
      "La línea de abajo junta las dos columnas: ese es el total. Elegí abajo la ficha con las azules arriba y todas abajo.",
    [k(3, "coach.reveal")]:
      "Arriba, las azules; abajo, todas las del frasco y no la columna más alta. Una fracción también cuenta cosas enteras.",

    // --- 4. Barras y contornos: la suma cruzada no llega ----------------------
    [k(4, "why")]:
      "Las partes de un todo cortado en tres no miden lo mismo que las de uno cortado en dos. Por eso no se suman juntando arriba con arriba y abajo con abajo.",
    [k(4, "goal")]:
      "Encontrá la ficha que sumó cruzado y, cuando toque, cortá la barra en partes iguales.",
    [k(4, "coach.look")]:
      "Dos barras del mismo largo, cada una con una parte encendida. Mirá: las partes de una son más grandes que las de la otra.",
    [k(4, "coach.choose")]:
      "Una ficha sumó arriba con arriba y abajo con abajo, como si las partes midieran igual. Encontrala y tocala.",
    [k(4, "coach.reveal")]:
      "Esa ficha juntó partes de dos tamaños, y por eso se queda corta: no llega adonde llegan las dos partes encendidas juntas.",

    // --- 5. Fichas al lado de la barra: los números ---------------------------
    [k(5, "why")]:
      "La ficha ahora se escribe con números. La raya del medio es un corte acostado: abajo, en cuántas partes iguales; arriba, cuántas encendidas.",
    [k(5, "goal")]:
      "Cortá la barra como dice el número de abajo y encendé las que dice el de arriba.",
    [k(5, "coach.recall")]:
      "Es el corte del nivel 1, con números en vez de puntos. Tu llave: primero, partes iguales; después contá.",

    // --- 6. El reparto: el ÷ es una fracción ----------------------------------
    [k(6, "why")]:
      "Repartir también da una fracción: tres barras entre cuatro platos le dan a cada plato tres partes de cuarto. El de arriba se reparte entre el de abajo.",
    [k(6, "goal")]: "Mirá cómo se reparten las barras y elegí la ficha que le toca a cada plato.",
    [k(6, "coach.look")]:
      "Cada barra está cortada en tantas partes como platos hay. Así cada plato recibe una parte de cada barra.",
    [k(6, "coach.choose")]:
      "Contá cuántas partes le llegan a un plato y de qué corte son. Elegí abajo esa ficha.",
    [k(6, "coach.reveal")]:
      "El ÷ estiró sus puntos hasta ser los dos números. Repartir el de arriba entre el de abajo da la misma ficha que cortar y encender.",

    // --- 7. La recta sola: la fracción es un número ---------------------------
    [k(7, "why")]:
      "Una fracción es un número: tiene su lugar en la recta, entre el cero y el uno. Y con el mismo de arriba, cuantas más partes, más chica cada una.",
    [k(7, "goal")]:
      "Clavá la fracción en su marca de la recta y, cuando toque, elegí la ficha más grande.",
    [k(7, "coach.look")]:
      "La barra de arriba y la recta miden lo mismo. La recta va del cero al uno, cortada en tantos tramos como dice el de abajo.",
    [k(7, "coach.pin")]: "Bajá con la vista desde donde termina la parte encendida y tocá esa marca de la recta.",
    [k(7, "coach.reveal")]:
      "La fracción quedó clavada en un punto: es un número, como el cero o el uno, sólo que vive entre los dos.",

    // --- 8. Todos que nunca viste ---------------------------------------------
    [k(8, "why")]:
      "Cualquier cosa puede ser el todo: una fila de figuras, un camino, un vaso. No hace falta cortar para que haya una fracción.",
    [k(8, "goal")]: "Mirá qué es el todo en cada dibujo y elegí la ficha que dice qué parte está tomada.",
    [k(8, "coach.recall")]:
      "Figuras, caminos y vasos, sin cortes a la vista. Tu llave: primero fijá el todo, y después contá las partes y las tomadas.",

    // --- Las llaves ------------------------------------------------------------
    "key.frac.equal_parts.title": "Primero, partes iguales",
    "key.frac.equal_parts.body":
      "Antes de contar partes, fijate que midan lo mismo. Si los pedazos son distintos, contarlos no dice qué parte del todo tenés.",
    "key.frac.two_counts.title": "Dos cuentas, una fracción",
    "key.frac.two_counts.body":
      "Arriba, cuántas partes se tomaron; abajo, en cuántas partes iguales está el todo. Para saber si un dibujo dice una fracción, revisá las dos cuentas.",
    "key.frac.whole_first.title": "Primero fijá el todo",
    "key.frac.whole_first.body":
      "Antes de nombrar una parte, decidí qué es el todo: el frasco entero, la barra entera. La parte se cuenta contra ese todo, no contra el montón más alto.",
    "key.frac.no_cross_add.title": "Tamaños distintos no se juntan",
    "key.frac.no_cross_add.body":
      "Una parte de tres y una de dos no miden lo mismo. Sumar arriba con arriba y abajo con abajo junta tamaños distintos y se queda corto.",
    "key.frac.bar_is_cut.title": "La raya es un corte",
    "key.frac.bar_is_cut.body":
      "Los números dicen lo mismo que los puntos: el de abajo es el corte y el de arriba lo que se toma. La raya de la ficha es una línea de corte acostada.",
    "key.frac.share_divides.title": "Repartir da una fracción",
    "key.frac.share_divides.body":
      "Repartir barras entre platos da una fracción: las barras van arriba y los platos abajo. La raya de la fracción hace lo mismo que el ÷.",
    "key.frac.is_a_point.title": "La fracción es un punto",
    "key.frac.is_a_point.body":
      "Cortá el tramo del cero al uno en tantas partes como dice el de abajo y contá desde el cero las de arriba: ahí está. Con el mismo de arriba, más partes queda más cerca del cero.",
    "key.frac.any_whole.title": "Cualquier cosa es un todo",
    "key.frac.any_whole.body":
      "Una fila de figuras, un camino, un vaso: todo lo que se parte en partes iguales sirve de todo. Contá las partes y las tomadas, igual que en la barra.",

    [`node.${NODE}.learned`]:
      "Una fracción son dos cuentas del mismo todo: en cuántas partes iguales se cortó y cuántas se tomaron. Es un número, y vive entre el cero y el uno.",
  },
  // Los dibujos de las llaves, sobre una caja de 40 × 40. Las barras son tinta
  // (contornos, cortes, rayas) y los puntos resaltados son lo tomado.
  glyphs: {
    // Una barra cortada en tres partes iguales, con la primera encendida.
    "frac.thirds": {
      dots: [[9.5, 20, 3.2, true]],
      bars: [
        [4, 13, 32, 2],
        [4, 25, 32, 2],
        [4, 13, 2, 14],
        [34, 13, 2, 14],
        [14, 13, 2, 14],
        [24, 13, 2, 14],
      ],
    },
    // La ficha de puntos: dos tomadas arriba, tres en total abajo.
    "frac.twoCounts": {
      dots: [
        [15.5, 12, 3.2, true],
        [24.5, 12, 3.2, true],
        [11, 28, 3.2],
        [20, 28, 3.2],
        [29, 28, 3.2],
      ],
      bars: [[8, 19, 24, 2]],
    },
    // Bolas de dos colores y la línea que junta el total por debajo.
    "frac.jar": {
      dots: [
        [9, 16, 3.5, true],
        [17, 16, 3.5, true],
        [25, 16, 3.5],
        [33, 16, 3.5],
        [21, 8, 3.5],
      ],
      bars: [
        [5, 24, 30, 2],
        [5, 21, 2, 5],
        [33, 21, 2, 5],
        [19, 25, 2, 6],
      ],
    },
    // Dos cortes distintos: las partes de arriba son más grandes que las de abajo.
    "frac.twoSizes": {
      dots: [
        [12, 11, 5, true],
        [28, 11, 5],
        [9, 29, 3.5, true],
        [20, 29, 3.5],
        [31, 29, 3.5],
      ],
      bars: [[4, 19, 32, 2]],
    },
    // La línea de corte parada y la misma línea acostada, con sus dos cuentas.
    "frac.cutTurns": {
      dots: [
        [27, 12, 3, true],
        [22.5, 28, 3],
        [31.5, 28, 3],
      ],
      bars: [
        [8, 8, 2, 24],
        [18, 19, 18, 2],
      ],
    },
    // El ÷ que ya es fracción: un punto arriba, uno abajo y la raya.
    "frac.share": {
      dots: [
        [20, 10, 3.5, true],
        [20, 30, 3.5],
      ],
      bars: [[9, 19, 22, 2]],
    },
    // La recta del cero al uno en tres tramos, con la fracción clavada.
    "frac.point": {
      dots: [[25, 25, 4, true]],
      bars: [
        [4, 24, 32, 2],
        [4, 19, 2, 12],
        [34, 19, 2, 12],
        [14, 21, 2, 8],
        [24, 21, 2, 8],
      ],
    },
    // Un vaso lleno hasta cierta altura: un todo que nadie cortó.
    "frac.glass": {
      dots: [
        [17, 29, 3, true],
        [23, 29, 3, true],
        [17, 23, 3, true],
        [23, 23, 3, true],
      ],
      bars: [
        [11, 6, 2, 29],
        [27, 6, 2, 29],
        [11, 33, 18, 2],
      ],
    },
  },
};
