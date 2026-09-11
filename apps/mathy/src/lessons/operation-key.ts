/**
 * La lección del llavero, nivel por nivel.
 *
 * Estrenan un gesto o una pregunta, y traen su guía atada a eso, el 1 (llevar
 * la llave a la cerradura), el 3 (armar la llave con dos ranuras), el 4 (el
 * cofre vuelto flechas, y la vuelta que no entra) y el 6 (la cadena que se
 * deshace al revés). El 2 repite el gesto del 1 con cuatro cerraduras, el 5 el
 * del 4 con fichas escritas y el 7 el toque de la acción que deshace del nodo
 * 4: los tres llevan un solo recordatorio de qué llave usar.
 *
 * Todo lo del nodo vive acá: la lección, sus textos (también los de la línea de
 * abajo, `opkey.msg.*`) y los dibujos de sus llaves.
 */
import type { CoachStep, KeySpec, LessonModule } from "./types.ts";

const NODE = "prealg.inv.operation_as_key";

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
        key: key("opkey.opposite_key", "opkey.opposite"),
        uses: ["sub.undo_same"],
        coach: [step(1, "look", "tap"), step(1, "carry", { signal: "restored" }), reveal(1)],
      },
      {
        level: 2,
        whyKey: k(2, "why"),
        goalKey: k(2, "goal"),
        key: key("opkey.two_pairs", "opkey.pairs"),
        uses: ["opkey.opposite_key", "div.shrink_undoes"],
        coach: [step(2, "recall", "tap")],
      },
      {
        level: 3,
        whyKey: k(3, "why"),
        goalKey: k(3, "goal"),
        key: key("opkey.same_number", "opkey.number"),
        uses: ["opkey.two_pairs"],
        coach: [
          step(3, "look", "tap"),
          step(3, "op", { signal: "op" }),
          step(3, "count", { signal: "restored" }),
          reveal(3),
        ],
      },
      {
        level: 4,
        whyKey: k(4, "why"),
        goalKey: k(4, "goal"),
        key: key("opkey.round_trip", "opkey.circuit"),
        uses: ["opkey.same_number"],
        coach: [step(4, "look", "tap"), step(4, "carry", { signal: "restored" }), reveal(4)],
      },
      {
        level: 5,
        whyKey: k(5, "why"),
        goalKey: k(5, "goal"),
        key: key("opkey.chip_writes", "opkey.chip"),
        uses: ["opkey.round_trip"],
        coach: [step(5, "recall", "tap")],
      },
      {
        level: 6,
        whyKey: k(6, "why"),
        goalKey: k(6, "goal"),
        key: key("opkey.last_first", "opkey.last"),
        uses: ["opkey.round_trip", "prec.undo_outside"],
        coach: [
          step(6, "look", "tap"),
          step(6, "first", { signal: "first" }),
          step(6, "second", { signal: "restored" }),
          reveal(6),
        ],
      },
      {
        level: 7,
        whyKey: k(7, "why"),
        goalKey: k(7, "goal"),
        key: key("opkey.not_every_action", "opkey.none"),
        uses: ["sub.every_action", "div.no_undo_zero"],
        coach: [step(7, "recall", "tap")],
      },
    ],
  },
  texts: {
    [`node.${NODE}.learned`]:
      "Toda operación tiene llave: la contraria, con el mismo número. Una cadena se abre al revés, y lo que aplasta todo no tiene vuelta.",

    [k(1, "why")]:
      "Cada cerradura guarda una acción, y la llave que la abre es la acción contraria: lo que sumó se abre restando.",
    [k(1, "goal")]: "Llevá a la cerradura la llave que devuelve el objeto a su hueco.",
    [k(1, "coach.look")]:
      "El cofre guardó un objeto con una acción, y su forma está en la cerradura. Arriba, el hueco de lo que entró.",
    [k(1, "coach.carry")]: "Llevá hasta la cerradura la llave con la forma contraria. También podés tocarla.",
    [k(1, "coach.reveal")]:
      "Restar deshizo el sumar: la acción contraria devolvió el objeto tal cual. Así se abre toda cerradura.",

    [k(2, "why")]:
      "Ahora también hay cerraduras que multiplican y que dividen. Cada una se abre con su pareja: la otra de las dos.",
    [k(2, "goal")]: "Llevá o tocá la llave que abre el cofre y devuelve el objeto.",
    [k(2, "coach.recall")]:
      "Acordate de «La llave es la contraria». Multiplicar se abre dividiendo, y dividir, multiplicando. Contá los puntitos.",

    [k(3, "why")]:
      "Una llave tiene dos partes: la operación, que la hace entrar, y el número, que decide qué devuelve.",
    [k(3, "goal")]: "Armá la llave: tocá una operación y un número.",
    [k(3, "coach.look")]:
      "Esta vez la llave está vacía: una ranura para la operación y otra para el número.",
    [k(3, "coach.op")]: "Tocá la operación contraria a la de la cerradura. Va a la primera ranura.",
    [k(3, "coach.count")]:
      "Ahora tocá el número de la cerradura: contá sus puntitos. Con las dos ranuras llenas, la llave gira sola.",
    [k(3, "coach.reveal")]:
      "Operación contraria, mismo número: entró y devolvió. Con otro número entra igual, pero lo que sale no encaja.",

    [k(4, "why")]:
      "El cofre se vuelve dos flechas: una baja con la acción y la otra sube con la llave. Juntas cierran un circuito.",
    [k(4, "goal")]:
      "Llevá la llave a la flecha que sube, o tocá la vuelta que usa una llave que no entra.",
    [k(4, "coach.look")]:
      "Arriba está lo que entró y abajo lo que quedó. La flecha que baja lleva la cerradura.",
    [k(4, "coach.carry")]: "Llevá la llave contraria al costado derecho, donde tiene que subir la vuelta.",
    [k(4, "coach.reveal")]:
      "La vuelta subió hasta el número de arriba y cerró el circuito. La llave es la misma flecha, al revés.",

    [k(5, "why")]:
      "La cerradura y la llave ya se escriben: una ficha con la operación y su número sobre cada flecha.",
    [k(5, "goal")]: "Llevá a la flecha que sube la ficha que deshace la de la flecha que baja.",
    [k(5, "coach.recall")]:
      "Acordate de «La vuelta cierra el circuito». La ficha de la llave es la contraria, con el mismo número.",

    [k(6, "why")]:
      "Si se hicieron dos acciones, una después de la otra, se deshacen al revés: primero la última.",
    [k(6, "goal")]: "Deshacé las dos acciones: primero la de abajo, después la de arriba.",
    [k(6, "coach.look")]: "Dos flechas bajan: primero se hizo la de arriba y después la de abajo.",
    [k(6, "coach.first")]: "Llevá primero la llave de la última acción, la flecha de abajo.",
    [k(6, "coach.second")]: "Ahora la llave de la acción de arriba.",
    [k(6, "coach.reveal")]:
      "Deshiciste de abajo hacia arriba: la última acción fue la primera en volver. Al revés, la llave no entra.",

    [k(7, "why")]:
      "No sólo los números tienen llave: girar, ponerse sombreros o cambiar colores también se deshacen. Algunas acciones no.",
    [k(7, "goal")]: "Tocá lo que deshace la cerradura, o la cruz si nada la deshace.",
    [k(7, "coach.recall")]:
      "Acordate de «Cada acción tiene su vuelta» y de «Lo aplastado no tiene vuelta». Las marcas dicen cuántas veces.",

    "key.opkey.opposite_key.title": "La llave es la contraria",
    "key.opkey.opposite_key.body":
      "Lo que sumó se abre restando y lo que restó, sumando. Mirá la forma de la cerradura y buscá la llave con la forma contraria.",
    "key.opkey.two_pairs.title": "Dos parejas de llaves",
    "key.opkey.two_pairs.body":
      "Sumar y restar se abren entre sí; multiplicar y dividir, también. Una llave de la otra pareja ni siquiera entra.",
    "key.opkey.same_number.title": "Mismo número, operación contraria",
    "key.opkey.same_number.body":
      "La operación contraria hace entrar la llave; el mismo número hace que devuelva. Si abre y lo que sale no encaja, cambiá el número.",
    "key.opkey.round_trip.title": "La vuelta cierra el circuito",
    "key.opkey.round_trip.body":
      "La llave es la misma flecha recorrida al revés: si baja sumando 4, sube restando 4 y llega al número de arriba.",
    "key.opkey.chip_writes.title": "La ficha escribe la llave",
    "key.opkey.chip_writes.body":
      "−5 deshace +5 y ÷3 deshace ×3. La llave se escribe sola: la operación contraria y el mismo número.",
    "key.opkey.last_first.title": "La última se abre primero",
    "key.opkey.last_first.body":
      "Dos acciones seguidas se deshacen al revés: primero la llave de la última. Como sacarse primero el zapato y después la media.",
    "key.opkey.not_every_action.title": "No toda acción tiene llave",
    "key.opkey.not_every_action.body":
      "Lo que se puede deshacer tiene su llave, del mismo tamaño. Si una acción aplasta todo en un punto, no hay llave: se marca la cruz.",

    // La línea de abajo. Nunca dice "mal": cuenta lo que pasó y adónde mirar.
    "opkey.ask.fit": "Llevá a la cerradura la llave que devuelve el objeto como estaba.",
    "opkey.ask.arrows": "Llevá la llave a la flecha que sube.",
    "opkey.ask.assemble": "Armá la llave: elegí la operación y el número que devuelven el objeto.",
    "opkey.ask.judge": "Una de las dos vueltas usa una llave que no entra. Tocá esa vuelta.",
    "opkey.ask.chain": "Dos acciones, una después de la otra. Empezá por la última.",
    "opkey.ask.arbitrary": "Tocá lo que deshace la cerradura, o la cruz si nada la deshace.",
    "opkey.msg.dropOnLock": "La llave volvió al llavero. Soltala sobre la cerradura del cofre.",
    "opkey.msg.dropOnArrow": "La llave volvió al llavero. Soltala al costado derecho, donde sube la vuelta.",
    "opkey.msg.lastFirst": "Esa llave es de la acción de arriba, y todavía está tapada por la de abajo. Empezá por la última.",
    "opkey.msg.shape": "Esa llave no entra: mirá la forma de la cerradura. Su llave es la contraria.",
    "opkey.msg.noFit": "El cofre abrió, pero lo que salió no encaja en el hueco. Mirá el número de la llave.",
    "opkey.msg.noFitNumber": "El cofre abrió, pero lo que salió no encaja en el hueco. Cambiá el número.",
    "opkey.msg.restored": "La llave giró entera y el objeto volvió a encajar en su hueco.",
    "opkey.msg.circuit": "La vuelta llegó al número de arriba y cerró el circuito.",
    "opkey.msg.oneMore": "Esa acción quedó deshecha. Ahora la de arriba.",
    "opkey.msg.half": "Falta la otra mitad de la llave.",
    "opkey.msg.liar": "Esa llave ni siquiera entró: la vuelta no pudo subir.",
    "opkey.msg.notLiar": "Esa vuelta subió y devolvió el objeto. Mirá la otra.",
    "opkey.msg.noKeyRight": "Esa acción no tiene llave, y marcar la cruz es la respuesta.",
    "opkey.msg.bottomFirst":
      "Esa vuelta todavía no puede subir: la acción de abajo se hizo después. Empezá por la de abajo.",
    "opkey.msg.undone": "Esa es la que deshace: el cofre volvió a como estaba.",
    "opkey.msg.hasKey": "Esta cerradura sí tiene llave. Buscala en el llavero.",
    "opkey.msg.otherAction": "Esa es otra acción: no devuelve el cofre a como estaba.",
  },
  // Puntos y barras sobre 40 × 40. El punto resaltado es el que importa.
  glyphs: {
    // Un más y un menos enfrentados: la cerradura y su llave contraria.
    "opkey.opposite": {
      dots: [[20, 32, 3, true]],
      bars: [[4, 17, 12, 2.5], [8.75, 12.25, 2.5, 12], [24, 17, 12, 2.5], [18, 8, 4, 1.5]],
    },
    // Las dos parejas: más con menos arriba, por con dividido abajo.
    "opkey.pairs": {
      dots: [[10, 28, 2.6], [28, 24, 1.8, true], [28, 32, 1.8, true]],
      bars: [[4, 10, 11, 2], [8.5, 5.5, 2, 11], [23, 10, 11, 2], [23, 27, 11, 2]],
    },
    // La cerradura y la llave con los mismos puntitos: el número no cambia.
    "opkey.number": {
      dots: [[8, 28, 2.5], [14, 28, 2.5], [20, 28, 2.5], [22, 12, 2.5, true], [28, 12, 2.5, true], [34, 12, 2.5, true]],
      bars: [[4, 11, 12, 2.5], [8.75, 6.25, 2.5, 12], [24, 27, 12, 2.5]],
    },
    // El circuito: baja a la izquierda, sube a la derecha, y vuelve arriba.
    "opkey.circuit": {
      dots: [[20, 6, 3.5, true], [20, 34, 3.5]],
      bars: [[10, 9, 2, 22], [7, 28, 8, 2], [28, 9, 2, 22], [25, 10, 8, 2]],
    },
    // Una ficha con su signo y su número, como la que va sobre la flecha.
    "opkey.chip": {
      dots: [[24, 20, 2.5, true], [30, 20, 2.5, true]],
      bars: [[5, 12, 30, 1.5], [5, 27, 30, 1.5], [5, 12, 1.5, 16.5], [33.5, 12, 1.5, 16.5], [10, 19, 8, 2]],
    },
    // Tres extremos y dos vueltas: la de abajo sube primero.
    "opkey.last": {
      dots: [[12, 6, 3], [12, 20, 3], [12, 34, 3, true]],
      bars: [[26, 8, 2, 10], [26, 22, 3.5, 10], [23, 22, 9.5, 2]],
    },
    // El candado tachado: el cuerpo, el arco y la raya que lo cruza.
    "opkey.none": {
      dots: [[20, 26, 2.5, true]],
      bars: [[10, 18, 20, 1.8], [10, 33, 20, 1.8], [10, 18, 1.8, 16.8], [28.2, 18, 1.8, 16.8], [13, 9, 1.8, 9], [25.2, 9, 1.8, 9], [13, 8, 14, 1.8], [3, 25, 34, 2]],
    },
  },
};
