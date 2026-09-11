/**
 * La lección de las dos habitaciones (`alg.expr.distributive_tiles`), nivel por nivel.
 *
 * Cinco niveles estrenan un gesto o una pregunta y traen una guía atada a eso:
 * cubrir el piso y sacar la pared (1), la tira de largo `x` (2), señalar las
 * escrituras que pierden baldosas (3), sacar y volver a poner la pared con el
 * renglón al lado (4), repartir el ancho sin piso (5) y el cuadrado de una suma
 * (6). Los niveles 2, 3, 4 y 6 alternan preguntas: la guía acompaña sólo la
 * primera ronda, y por eso su objetivo nombra las dos.
 *
 * Las señales las emite `activities/DistributiveGame.tsx`: `stripIn` cuando una
 * tira entra en su habitación, `covered` cuando el marco quedó cubierto,
 * `wallOut` cuando la pared sale, `wallToggled` en cada toque de la pared,
 * `picked` con cada ficha que acierta y `solved` cuando la ronda se resolvió.
 */
import type { CoachStep, KeySpec, LessonModule } from "./types.ts";

const NODE = "alg.expr.distributive_tiles";

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
        key: key("dist.count_two_ways", "dist.twoWays"),
        uses: ["mul.rows_make_rect", "mul.rect_counts"],
        coach: [
          step(1, "look", "tap"),
          step(1, "drag", { signal: "stripIn" }),
          step(1, "fill", { signal: "covered" }),
          step(1, "wall", { signal: "wallOut" }),
          reveal(1),
        ],
      },
      {
        level: 2,
        whyKey: k(2, "why"),
        goalKey: k(2, "goal"),
        key: key("dist.paren_joins", "dist.paren"),
        uses: ["dist.count_two_ways", "mul.cross_writes"],
        coach: [
          step(2, "look", "tap"),
          step(2, "fill", { signal: "covered" }),
          step(2, "wall", { signal: "wallOut" }),
          reveal(2),
        ],
      },
      {
        level: 3,
        whyKey: k(3, "why"),
        goalKey: k(3, "goal"),
        key: key("dist.same_shape_adds", "dist.sameShape"),
        uses: ["dist.paren_joins", "dist.count_two_ways"],
        coach: [step(3, "look", "tap"), step(3, "choose", { signal: "solved" }), reveal(3)],
      },
      {
        level: 4,
        whyKey: k(4, "why"),
        goalKey: k(4, "goal"),
        key: key("dist.both_ways", "dist.bothWays"),
        uses: ["dist.count_two_ways", "dist.same_shape_adds"],
        coach: [
          step(4, "look", "tap"),
          step(4, "wall", { signal: "wallToggled" }),
          step(4, "back", { signal: "solved" }),
          reveal(4),
        ],
      },
      {
        level: 5,
        whyKey: k(5, "why"),
        goalKey: k(5, "goal"),
        key: key("dist.width_to_each", "dist.toEach"),
        uses: ["dist.both_ways", "dist.same_shape_adds"],
        coach: [
          step(5, "look", "tap"),
          step(5, "pick", { signal: "picked" }),
          step(5, "fill", { signal: "solved" }),
          reveal(5),
        ],
      },
      {
        level: 6,
        whyKey: k(6, "why"),
        goalKey: k(6, "goal"),
        key: key("dist.only_over_sums", "dist.square"),
        uses: ["dist.width_to_each", "dist.same_shape_adds"],
        coach: [step(6, "look", "tap"), step(6, "choose", { signal: "solved" }), reveal(6)],
      },
    ],
  },
  texts: {
    [`node.${NODE}.learned`]:
      "Multiplicar por una suma es contar el mismo piso de dos maneras: el ancho llega a cada sumando y los pedazos se suman. Vale en los dos sentidos, y solo sobre una suma.",

    // --- 1. Cubrir el piso: el mismo piso, dos cuentas -------------------------
    [k(1, "why")]:
      "Un piso de dos habitaciones con el mismo ancho se puede contar entero o de a una habitación. Las dos cuentas miden el mismo piso, así que dan lo mismo.",
    [k(1, "goal")]: "Cubrí las dos habitaciones con tiras y después sacá la pared.",
    [k(1, "coach.look")]:
      "Dos habitaciones del mismo ancho, separadas por una pared. Abajo esperan las tiras: cada una mide lo largo de una habitación.",
    [k(1, "coach.drag")]:
      "Arrastrá una tira hasta la habitación que mide lo mismo que ella. Si no es la suya, vuelve sola.",
    [k(1, "coach.fill")]: "Seguí hasta cubrir las dos habitaciones. Mirá cómo el libro anota cada tira.",
    [k(1, "coach.wall")]: "Tocá el piso para sacar la pared. Las baldosas no cambian: fijate qué pasa con la cuenta.",
    [k(1, "coach.reveal")]:
      "El piso se partió en dos bloques y no perdió ni una baldosa. Contaste el mismo piso de dos maneras.",

    // --- 2. La habitación sin medida: el paréntesis junta largos ---------------
    [k(2, "why")]:
      "Cuando un largo no se puede medir se nombra con una letra, x. El piso entero es el ancho por todo el largo, y el paréntesis dice que x y el número son un solo largo.",
    [k(2, "goal")]: "Cubrí el piso con la tira de largo x, y cuando toque, elegí la ficha que mide el piso entero.",
    [k(2, "coach.look")]:
      "Una habitación no tiene número: su largo es x. Su tira es una sola pieza, sin baldosas para contar.",
    [k(2, "coach.fill")]:
      "Cubrí las dos habitaciones. La tira larga va donde no hay número, y las cortas donde lo hay.",
    [k(2, "coach.wall")]: "Ahora tocá el piso para sacar la pared, y mirá cómo cambia lo escrito abajo.",
    [k(2, "coach.reveal")]:
      "Con la pared, el piso es el ancho por el largo entero, x más el número. Sin la pared, cada bloque se escribe solo.",

    // --- 3. Barras y llaves: sólo se juntan piezas iguales ---------------------
    [k(3, "why")]:
      "Un piso se escribe sumando sus piezas, y sólo se juntan las de la misma forma. Una escritura que olvida piezas, o que junta letras como si fueran nombres, pierde baldosas.",
    [k(3, "goal")]: "Tocá las escrituras que pierden baldosas, y cuando toque, cubrí el piso.",
    [k(3, "coach.look")]:
      "Un cuadrado de lado a más b: mirá las llaves de arriba y del costado. Abajo, tres maneras de escribir cuánto mide.",
    [k(3, "coach.choose")]:
      "Una sola dice el piso entero. Tocá las otras dos: las que se olvidan piezas o las juntan mal.",
    [k(3, "coach.reveal")]:
      "Una perdió los dos rectángulos y la otra juntó piezas de formas distintas. Sólo se suman piezas iguales.",

    // --- 4. Fichas al lado: la igualdad en los dos sentidos --------------------
    [k(4, "why")]:
      "Sacar la pared reparte el ancho sobre cada largo; ponerla vuelve a juntar los bloques. Es el mismo piso, así que la igualdad vale para los dos lados.",
    [k(4, "goal")]: "Sacá y poné la pared mirando el renglón, y cuando toque, anotá cada bloque en su columna.",
    [k(4, "coach.look")]:
      "Debajo del piso está escrito cómo se cuenta. Con la pared es un producto; sin la pared, una suma.",
    [k(4, "coach.wall")]: "Tocá el piso para mover la pared. El piso no cambia y la escritura sí.",
    [k(4, "coach.back")]: "Tocalo otra vez. La escritura vuelve a ser la de antes.",
    [k(4, "coach.reveal")]:
      "Ida y vuelta sobre el mismo piso: repartir y juntar dan lo mismo. Podés ir para el lado que te sirva.",

    // --- 5. Sin piso: el ancho llega a cada sumando ----------------------------
    [k(5, "why")]:
      "Sin dibujo, el piso sigue ahí: el de afuera multiplica a cada sumando del paréntesis, con su signo. Si adentro hay una resta, el bloque también resta.",
    [k(5, "goal")]: "Elegí una ficha por cada sumando del paréntesis: el de afuera por cada uno.",
    [k(5, "coach.look")]:
      "Quedó sólo lo escrito: el de afuera y el paréntesis. Si querés ver el piso, tocá el tablero.",
    [k(5, "coach.pick")]:
      "Multiplicá el de afuera por el primer sumando, con su signo, y tocá esa ficha abajo.",
    [k(5, "coach.fill")]: "Seguí con los otros sumandos. Cada uno recibe al de afuera.",
    [k(5, "coach.reveal")]:
      "El de afuera llegó a todos los sumandos, y ninguno quedó sin multiplicar. Eso es repartir.",

    // --- 6. El cuadrado que crece: sólo se reparte sobre una suma --------------
    [k(6, "why")]:
      "Repartir funciona sobre una suma, porque una suma tiene pared. Por eso el cuadrado de una suma tiene cuatro piezas, y un producto no se reparte.",
    [k(6, "goal")]:
      "Elegí lo que mide cada piso: el cuadrado entero, el ancho que se comparte o el bloque sin pared.",
    [k(6, "coach.look")]:
      "Un cuadrado de lado a más b. Arriba y al costado mide lo mismo: a más b.",
    [k(6, "coach.choose")]:
      "Tocá la ficha que dice cuánto mide el cuadrado entero. Si le falta un pedazo, lo vas a ver.",
    [k(6, "coach.reveal")]:
      "Cuatro piezas: el cuadrado de a, el de b y dos rectángulos iguales. Cada lado se repartió sobre el otro.",

    // --- La línea de abajo -----------------------------------------------------
    // Lo primero que se ve, sin lección: el cartel del objetivo no está.
    [msg("open.cover")]: "Llevá las tiras al marco hasta cubrir las dos habitaciones.",
    [msg("open.pick")]: "Tocá la ficha que mide el piso entero.",
    [msg("open.explain")]: "Tres maneras de escribir el mismo cuadrado. Tocá las dos que pierden baldosas.",
    [msg("open.wall")]: "Tocá el piso: la pared sale, el piso no cambia de tamaño y la escritura sí.",
    [msg("open.tally")]: "Llevá la ficha de cada bloque a su columna del libro.",
    [msg("open.expand")]: "Repartí el de afuera: una ficha por cada sumando del paréntesis.",
    [msg("open.square")]: "Un cuadrado de lado a más b. Tocá la ficha que dice cuánto mide.",
    [msg("open.recompose")]: "Los dos sumandos comparten un ancho. Tocá cuál es.",
    [msg("open.reject")]: "Adentro del paréntesis hay un producto y no una suma. Tocá lo que mide.",

    // Las tiras y la pared.
    [msg("stripIn")]: "Entró. Seguí cubriendo.",
    [msg("stripBack")]: "La tira volvió a la bandeja. Soltala encima del marco.",
    [msg("stripShort")]: "Esa tira no mide lo que esa habitación pide. Queda un borde sin cubrir.",
    [msg("notSameShape")]:
      "Estas dos piezas no tienen la misma forma. ¿Se pueden apilar en la misma columna?",
    [msg("roomFull")]: "Esa habitación ya está cubierta. Falta la otra.",
    [msg("covered")]: "El marco quedó cubierto y los lados se etiquetaron solos. Tocá el piso para sacar la pared.",
    [msg("wallFirst")]: "Primero cubrí el piso: la pared se saca cuando el marco está cubierto.",
    [msg("wallNotHere")]: "En esta ronda la pared no se mueve: la respuesta está en las fichas.",
    [msg("wallSplit")]: "El mismo piso, partido en dos bloques. Las dos escrituras miden lo mismo.",
    [msg("wallJoined")]: "La pared volvió y los dos bloques son otra vez un solo piso.",
    [msg("wallSplitMore")]: "Repartido. Ahora volvé a poner la pared: la igualdad vale para los dos lados.",
    [msg("wallJoinMore")]: "Juntado. Sacala de nuevo para verlo repartido.",
    [msg("noFloor")]: "Ese piso no se puede dibujar: una habitación no mide menos que nada.",
    [msg("floorHere")]: "Ahí está el piso. El ancho cubre todos los largos.",

    // El libro.
    [msg("chipBack")]: "La ficha volvió a su bloque. Soltala sobre una columna del libro.",
    [msg("tallyOne")]: "Anotado. Falta el otro bloque.",
    [msg("tallyDone")]: "Cada bloque quedó anotado en su columna, y el renglón dice el total.",

    // Las fichas de abajo.
    [msg("pickOne")]: "Esa sí. Falta una más.",
    [msg("expandOne")]: "Ese va. Falta repartir sobre el resto.",
    [msg("expandDone")]: "Repartido: el de afuera llegó a cada sumando y ninguno quedó afuera.",
    [msg("ok.pick")]: "Ese es el piso entero: un ancho y un largo compuesto.",
    [msg("ok.explain")]:
      "Esas dos pierden piezas: una deja dos rectángulos vacíos y la otra junta piezas de formas distintas.",
    [msg("ok.square")]: "Cuatro piezas: el cuadrado de a, el de b y dos rectángulos iguales.",
    [msg("ok.recompose")]: "Ese es el ancho que las dos comparten. La pared vuelve a su lugar.",
    [msg("ok.reject")]: "Sobre un producto no hay pared que sacar: es un bloque solo.",
    [msg("lure.sound")]: "Esa dice el piso entero: no pierde una sola baldosa. Buscá las otras.",
    [msg("lure.partial_distribution")]: "El ancho llegó a un sumando solo: el otro bloque queda sin cubrir.",
    [msg("lure.product_of_parts")]: "Los dos bloques se suman, no se multiplican: son dos pedazos del mismo piso.",
    [msg("lure.labels_merged")]: "Esas letras no son nombres que se junten: son lados de piezas distintas.",
    [msg("lure.square_of_parts")]: "Con esas dos piezas el cuadrado queda con dos rectángulos vacíos.",
    [msg("lure.sides_added")]: "Eso mide el contorno, no el piso.",
    [msg("lure.sign_kept")]: "Adentro había una resta: al repartir, ese bloque también resta.",
    [msg("lure.factor_dropped")]: "Ese sumando llegó sin multiplicar: le falta el de afuera.",
    [msg("lure.factor_dropped_recompose")]: "El uno divide a todos y no comparte nada: no hay pared que poner.",
    [msg("lure.one_side_only")]: "Ese ancho divide a un sumando y al otro no, así que no lo comparten.",
    [msg("lure.factor_into_both")]: "El ancho se copió en los dos factores: el bloque queda del doble.",
    [msg("lure.distributed_over_product")]: "Adentro hay un producto, y un producto no tiene pared que sacar.",

    // El cuadrado con huecos.
    [msg("missing")]: "Al cuadrado le falta un pedazo. ¿Qué rectángulos faltan?",
    [msg("holeBack")]: "La pieza volvió a la bandeja. Soltala sobre uno de los huecos del cuadrado.",
    [msg("holeTurned")]: "Esa pieza está acostada al revés: no tapa ese hueco.",
    [msg("holeOne")]: "Uno tapado. Falta el otro rectángulo.",
    [msg("squareWhole")]: "Ahí está el cuadrado entero: dos cuadrados y dos rectángulos iguales.",

    // La definición de la capa formal, de a una por ronda.
    [msg("definition.0")]: "Multiplicar por una suma es multiplicar por cada sumando y sumar los resultados.",
    [msg("definition.1")]: "La igualdad vale en los dos sentidos: repartir el producto y volver a juntarlo.",

    // --- Las llaves ------------------------------------------------------------
    "key.dist.count_two_ways.title": "El mismo piso, dos cuentas",
    "key.dist.count_two_ways.body":
      "Un ancho por dos largos se cuenta entero o por habitación, y da lo mismo. Tres por dos más uno es tres por dos más tres por uno.",
    "key.dist.paren_joins.title": "El paréntesis junta largos",
    "key.dist.paren_joins.body":
      "Si un largo no tiene medida, el piso entero se escribe ancho por el largo compuesto: 3(x + 2). El paréntesis dice que x + 2 es un solo largo.",
    "key.dist.same_shape_adds.title": "Sólo se juntan piezas iguales",
    "key.dist.same_shape_adds.body":
      "Dos tiras y tres tiras son cinco tiras: 2x + 3x es 5x. Pero una tira y una baldosa tienen formas distintas: 2x + 3 queda así.",
    "key.dist.both_ways.title": "Repartir y juntar dan igual",
    "key.dist.both_ways.body":
      "Sacar la pared reparte: 3(x + 2) es 3x + 6. Ponerla junta: 3x + 6 es 3(x + 2). Es el mismo piso, así que elegí el lado que te sirva.",
    "key.dist.width_to_each.title": "El de afuera llega a todos",
    "key.dist.width_to_each.body":
      "Multiplicá el de afuera por cada sumando del paréntesis, con su signo. Si adentro hay una resta, el bloque también resta: 3(x − 2) es 3x − 6.",
    "key.dist.only_over_sums.title": "Se reparte sobre una suma",
    "key.dist.only_over_sums.body":
      "Sólo una suma tiene pared. Por eso (a + b)(a + b) tiene cuatro piezas, aa + 2ab + bb, y un producto como 3(xy) es un bloque solo: 3xy.",
  },
  // Puntos y barras sobre una caja de 40 × 40. Las barras son contornos y
  // paredes; los puntos resaltados son lo que la llave enseña a mirar.
  glyphs: {
    // El piso con la pared: la habitación de la izquierda y la de la derecha,
    // el mismo ancho para las dos.
    "dist.twoWays": {
      dots: [
        [11, 15, 2.6, true], [17, 15, 2.6, true], [11, 23, 2.6, true], [17, 23, 2.6, true],
        [26, 15, 2.6], [32, 15, 2.6], [26, 23, 2.6], [32, 23, 2.6],
      ],
      bars: [[6, 9, 31, 2], [6, 28, 31, 2], [6, 9, 2, 21], [35, 9, 2, 21], [21, 7, 2, 25]],
    },
    // La tira de largo desconocido y las baldosas, bajo una llave que las junta.
    "dist.paren": {
      dots: [[29, 24, 2.6], [35, 24, 2.6]],
      bars: [[4, 12, 32, 2], [4, 12, 2, 5], [34, 12, 2, 5], [5, 22, 19, 5]],
    },
    // Dos tiras con dos tiras se apilan; la baldosa suelta queda aparte.
    "dist.sameShape": {
      dots: [[32, 30, 3.2]],
      bars: [[5, 8, 22, 4], [5, 15, 22, 4], [5, 22, 22, 4], [5, 29, 22, 4]],
    },
    // El mismo piso con la pared y sin ella: dos flechas, ida y vuelta.
    "dist.bothWays": {
      dots: [[20, 8, 3, true], [20, 32, 3, true]],
      bars: [[5, 15, 30, 2], [5, 24, 30, 2], [19, 13, 2, 14]],
    },
    // El de afuera y tres sumandos: llega a cada uno.
    "dist.toEach": {
      dots: [[6, 20, 3.6, true], [22, 10, 2.8], [30, 20, 2.8], [22, 30, 2.8]],
      bars: [[9, 11, 10, 2], [9, 19, 18, 2], [9, 27, 10, 2]],
    },
    // El cuadrado de una suma en cuatro piezas: dos cuadrados y dos rectángulos.
    "dist.square": {
      dots: [[12, 12, 3.2], [29, 29, 4], [29, 12, 2.6, true], [12, 29, 2.6, true]],
      bars: [[4, 4, 32, 2], [4, 34, 32, 2], [4, 4, 2, 32], [34, 4, 2, 32], [19, 4, 2, 32], [4, 19, 32, 2]],
    },
  },
};
