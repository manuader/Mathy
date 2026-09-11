/**
 * La lección de la banda y el piso (`arith.mul.scaling`), nivel por nivel.
 *
 * Cinco niveles estrenan un gesto y traen una guía atada a ese gesto: girar la
 * manivela (1), llevar filas al marco (2), sostener el dedo sobre el piso (3),
 * estirar la banda (4), pedir el piso y elegir el total (6) y anticipar tocando
 * una marca (7). El 5 repite las filas del 2 con números y el 8 repite el
 * estirado y la anticipación sin números: su guía es un solo recordatorio de
 * qué llave usar, porque volver a explicar un gesto conocido es ruido.
 *
 * Los niveles 3 y 8 alternan dos preguntas y la guía acompaña solo la primera
 * ronda; por eso su objetivo nombra las dos.
 */
import type { CoachStep, KeySpec, LessonModule } from "./types.ts";

const NODE = "arith.mul.scaling";

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
        key: key("mul.same_step", "mul.sameStep"),
        uses: ["count.one_more"],
        coach: [
          step(1, "look", "tap"),
          step(1, "turn", { signal: "turned" }),
          step(1, "land", { signal: "landed" }),
          reveal(1),
        ],
      },
      {
        level: 2,
        whyKey: k(2, "why"),
        goalKey: k(2, "goal"),
        key: key("mul.rows_make_rect", "mul.rows"),
        uses: ["count.pair_compares"],
        coach: [
          step(2, "look", "tap"),
          step(2, "drag", { signal: "merged" }),
          step(2, "fill", { signal: "covered" }),
          reveal(2),
        ],
      },
      {
        level: 3,
        whyKey: k(3, "why"),
        goalKey: k(3, "goal"),
        key: key("mul.order_free", "mul.turned"),
        uses: ["mul.rows_make_rect", "count.moving_keeps"],
        coach: [step(3, "look", "tap"), step(3, "hold", { signal: "rotated" }), reveal(3)],
      },
      {
        level: 4,
        whyKey: k(4, "why"),
        goalKey: k(4, "goal"),
        key: key("mul.stretch_all", "mul.stretch"),
        uses: ["mul.same_step"],
        coach: [
          step(4, "look", "tap"),
          step(4, "pull", { signal: "pulled" }),
          step(4, "land", { signal: "landed" }),
          reveal(4),
        ],
      },
      {
        level: 5,
        whyKey: k(5, "why"),
        goalKey: k(5, "goal"),
        key: key("mul.cross_writes", "mul.cross"),
        uses: ["mul.rows_make_rect", "mul.order_free"],
        coach: [step(5, "recall", "tap")],
      },
      {
        level: 6,
        whyKey: k(6, "why"),
        goalKey: k(6, "goal"),
        key: key("mul.rect_counts", "mul.rectCount"),
        uses: ["mul.cross_writes", "mul.order_free"],
        coach: [
          step(6, "look", "tap"),
          step(6, "summon", { signal: "summoned" }),
          step(6, "pick", { signal: "picked" }),
          reveal(6),
        ],
      },
      {
        level: 7,
        whyKey: k(7, "why"),
        goalKey: k(7, "goal"),
        key: key("mul.not_always_bigger", "mul.notBigger"),
        uses: ["mul.stretch_all"],
        coach: [step(7, "look", "tap"), step(7, "guess", { signal: "guessed" }), reveal(7)],
      },
      {
        level: 8,
        whyKey: k(8, "why"),
        goalKey: k(8, "goal"),
        key: key("mul.two_flips", "mul.twoFlips"),
        uses: ["mul.stretch_all", "mul.not_always_bigger"],
        coach: [step(8, "recall", "tap")],
      },
    ],
  },
  texts: {
    [`node.${NODE}.learned`]:
      "Multiplicar es estirar: todas las distancias al cero crecen por el mismo factor. Y es armar el rectángulo de filas por columnas, en el orden que quieras.",

    [k(1, "why")]:
      "Si cada vuelta mueve la ficha la misma cantidad de casillas, alcanza con contar vueltas. Así se llega lejos sin contar de a una.",
    [k(1, "goal")]: "Girá la manivela hasta que la ficha que camina quede debajo del número.",
    [k(1, "coach.look")]:
      "La manivela tiene un engranaje chico enganchado. Cada vuelta empuja la ficha blanca varias casillas, siempre las mismas.",
    [k(1, "coach.turn")]:
      "Agarrá la perilla y girá una vuelta entera alrededor de la manivela. Mirá cuántas casillas salta la ficha.",
    [k(1, "coach.land")]:
      "Seguí girando hasta que la ficha quede justo debajo del número. Contá vueltas, no casillas.",
    [k(1, "coach.reveal")]:
      "Cada vuelta movió lo mismo, así que contaste vueltas y no casillas. Repetir el mismo salto es multiplicar.",

    [k(2, "why")]:
      "Varias filas del mismo largo, pegadas, forman un rectángulo. El marco pide un largo justo, y solo entran las filas que lo miden.",
    [k(2, "goal")]: "Cubrí el marco con filas que midan lo mismo que su ancho.",
    [k(2, "coach.look")]:
      "El marco vacío pide filas de un largo justo. Abajo hay filas largas, cortas y justas.",
    [k(2, "coach.drag")]:
      "Arrastrá una fila hasta el marco. Si mide lo mismo que su ancho, entra y se funde.",
    [k(2, "coach.fill")]:
      "Seguí hasta cubrir el marco entero. Las filas que no miden lo justo vuelven solas al montón.",
    [k(2, "coach.reveal")]:
      "Las filas se fundieron en un rectángulo: tantas filas de tantas baldosas. Contarlo así es multiplicar.",

    [k(3, "why")]:
      "Girar un piso un cuarto de vuelta cambia filas por columnas y deja las mismas baldosas. También vas a cazar una banda que no estira de verdad.",
    [k(3, "goal")]: "Girá el piso para que entre en el marco, y tocá la banda que no estira.",
    [k(3, "coach.look")]:
      "El piso ya está armado, pero el marco lo pide acostado. No sobra ni falta ninguna baldosa.",
    [k(3, "coach.hold")]: "Tocá el piso. Se levanta y gira un cuarto de vuelta.",
    [k(3, "coach.reveal")]:
      "Las filas se volvieron columnas y el total no cambió. El orden de los dos lados no importa.",

    [k(4, "why")]:
      "Estirar una banda clavada es multiplicar: cada marca se aleja del clavo la misma cantidad de veces, y el clavo no se mueve.",
    [k(4, "goal")]: "Estirá la banda hasta que su extremo quede justo arriba de la ficha.",
    [k(4, "coach.look")]:
      "La banda está clavada a la izquierda. Su extremo libre tiene una manija, y abajo espera la ficha.",
    [k(4, "coach.pull")]:
      "Agarrá la manija y tirá hacia la derecha. Mirá: todas las marcas se separan a la vez.",
    [k(4, "coach.land")]:
      "Soltá cuando el extremo quede justo arriba de la ficha. Si te pasás, aflojá desde donde quedó.",
    [k(4, "coach.reveal")]:
      "Cada marca se alejó del clavo tantas veces como el extremo. Estirar multiplica todas las distancias a la vez.",

    [k(5, "why")]:
      "Dos números y una cruz alcanzan para volver a armar un piso que ya no está: tantas filas de tantas baldosas.",
    [k(5, "goal")]: "Cubrí el marco con filas justas y mirá qué queda escrito.",
    [k(5, "coach.recall")]:
      "Es el juego de las filas, ahora con números. Tu llave: filas iguales arman un rectángulo. Al cubrirlo, fijate qué aparece escrito.",

    [k(6, "why")]:
      "Con lo escrito ya sabés cuántas baldosas hay: filas por columnas. El piso aparece si lo pedís, pero no hace falta contarlo.",
    [k(6, "goal")]: "Elegí la ficha que dice cuántas baldosas tiene el piso.",
    [k(6, "coach.look")]: "Quedó solo lo escrito: los dos lados y la cruz. El piso está escondido.",
    [k(6, "coach.summon")]: "Tocá el marco para ver el piso, si querés. Contá filas, no baldosas.",
    [k(6, "coach.pick")]: "Elegí abajo la ficha con el total del piso.",
    [k(6, "coach.reveal")]:
      "El total salió de los dos números, sin contar de a una. La cruz guardó el piso por vos.",

    [k(7, "why")]:
      "Multiplicar no siempre agranda. Por uno la banda queda igual, por cero se aplasta contra el clavo, y por un medio queda a la mitad.",
    [k(7, "goal")]: "Antes de estirar, tocá la marca donde va a caer el extremo.",
    [k(7, "coach.look")]:
      "Debajo de la regla está escrita la cuenta: cuánto mide la banda y por cuánto se estira.",
    [k(7, "coach.guess")]:
      "Tocá en la regla la marca donde creés que va a caer el extremo. Después la banda se estira sola.",
    [k(7, "coach.reveal")]:
      "No siempre se agranda: por uno queda igual, por cero se aplasta y por un medio se achica.",

    [k(8, "why")]:
      "Sin números, un estirado se reconoce igual: los dibujos se alejan del clavo en la misma proporción. Y dos vueltas dejan la banda mirando como al principio.",
    [k(8, "goal")]: "Llevá la banda hasta el molde de un tirón, o marcá dónde cae si se da vuelta otra vez.",
    [k(8, "coach.recall")]:
      "Sin números, mirá los dibujos. Tu llave: estirar aleja todo por igual, así que cada dibujo tiene que caer sobre su pareja.",

    // Lo que la actividad dice en la línea de abajo y no estaba escrito antes.
    [`lesson.${NODE}.msg.rowBack`]: "La fila volvió al montón. Soltala encima del marco.",

    "key.mul.same_step.title": "Cada vuelta mueve lo mismo",
    "key.mul.same_step.body":
      "Si cada vuelta avanza lo mismo, contá vueltas y no casillas. Tres vueltas de cuatro casillas llegan a doce sin contar de a una.",
    "key.mul.rows_make_rect.title": "Filas iguales arman un rectángulo",
    "key.mul.rows_make_rect.body":
      "Para cubrir un rectángulo, todas las filas miden lo mismo. Una más larga se sale y una más corta deja un borde sin cubrir.",
    "key.mul.order_free.title": "El orden no cambia el total",
    "key.mul.order_free.body":
      "Girar el piso cambia filas por columnas y deja las mismas baldosas. Tres filas de cinco son cinco filas de tres.",
    "key.mul.stretch_all.title": "Estirar aleja todo por igual",
    "key.mul.stretch_all.body":
      "Estirar por tres aleja cada marca tres veces más del clavo. El clavo no se mueve: el cero se queda en su lugar.",
    "key.mul.cross_writes.title": "La cruz anota el piso",
    "key.mul.cross_writes.body":
      "Tres por cinco quiere decir tres filas de cinco. Con los dos lados y la cruz se vuelve a armar el piso sin dibujarlo.",
    "key.mul.rect_counts.title": "Filas por columnas cuenta todo",
    "key.mul.rect_counts.body":
      "El total de un rectángulo sale de sus dos lados: filas por columnas. Sirve aunque el piso no esté a la vista.",
    "key.mul.not_always_bigger.title": "Multiplicar no siempre agranda",
    "key.mul.not_always_bigger.body":
      "Por uno la banda queda igual, por cero se aplasta contra el clavo y por un medio queda a la mitad.",
    "key.mul.two_flips.title": "Dos vueltas miran adelante",
    "key.mul.two_flips.body":
      "Dar vuelta la banda una vez la deja mirando para atrás. Dos vueltas la dejan mirando para adelante, como al principio.",
  },
  // Puntos y barras sobre una caja de 40 × 40. Resaltado (azul) es lo que la
  // llave enseña a mirar.
  glyphs: {
    // La regla y dos saltos iguales: cada vuelta mueve lo mismo.
    "mul.sameStep": {
      dots: [[6, 28, 3.5], [18, 28, 3.5], [30, 28, 3.5, true]],
      bars: [[4, 27, 32, 2], [7, 18, 10, 2], [19, 18, 10, 2]],
    },
    // Tres filas de cuatro, todas del mismo largo.
    "mul.rows": {
      dots: [
        [8, 12, 3], [16, 12, 3], [24, 12, 3], [32, 12, 3],
        [8, 20, 3], [16, 20, 3], [24, 20, 3], [32, 20, 3],
        [8, 28, 3, true], [16, 28, 3, true], [24, 28, 3, true], [32, 28, 3, true],
      ],
    },
    // Dos columnas de tres y, al lado, tres columnas de dos: las mismas seis.
    "mul.turned": {
      dots: [
        [6, 12, 2.8], [13, 12, 2.8], [6, 20, 2.8], [13, 20, 2.8], [6, 28, 2.8], [13, 28, 2.8],
        [22, 16, 2.8, true], [29, 16, 2.8, true], [36, 16, 2.8, true],
        [22, 24, 2.8, true], [29, 24, 2.8, true], [36, 24, 2.8, true],
      ],
    },
    // La banda en reposo y la misma estirada: cada marca, más lejos del clavo.
    "mul.stretch": {
      dots: [[5, 13, 3], [11, 13, 3], [17, 13, 3], [5, 29, 3], [20, 29, 3, true], [35, 29, 3, true]],
      bars: [[5, 12, 12, 2], [5, 28, 30, 2]],
    },
    "mul.cross": { dots: [], card: "×" },
    // El contorno del piso y lo que se cuenta: sus dos lados.
    "mul.rectCount": {
      dots: [[12, 12, 3, true], [20, 12, 3, true], [28, 12, 3, true], [12, 20, 3, true], [12, 28, 3, true]],
      bars: [[6, 6, 28, 2], [6, 32, 28, 2], [6, 6, 2, 28], [32, 6, 2, 28]],
    },
    // Por uno queda igual, por cero se aplasta, por un medio se achica.
    "mul.notBigger": {
      dots: [[6, 10, 3], [14, 10, 3], [22, 10, 3], [6, 21, 4.5, true], [6, 32, 3, true], [10, 32, 3, true], [14, 32, 3, true]],
    },
    // Mirando adelante, atrás, y otra vez adelante.
    "mul.twoFlips": {
      dots: [[31, 9, 3.5], [9, 20, 3.5], [31, 31, 3.5, true]],
      bars: [[19, 4, 2, 32]],
    },
  },
};
