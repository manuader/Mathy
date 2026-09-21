/**
 * Las preguntas del linter, y con qué estado se las hace.
 *
 * Una por juicio, y cada una con sus respuestas posibles descriptas: lo que el
 * modelo no puede contestar es lo que no está en el estado. Por eso el estado
 * es chico a propósito —el texto, qué papel cumple, qué dibuja su escena y qué
 * pide el nivel— y no el nodo entero: la documentación de Jev dice que la
 * precisión cae cuando el estado crece con material que no hace a la decisión.
 *
 * Las reglas de `rules.ts` ya contestaron lo que se decide mirando letras. Acá
 * sólo va lo que necesita entender la frase.
 */

import type { Entry, QuestionSet } from "./types.ts";
import type { Objetos } from "./corpus.ts";

const PAPEL: Readonly<Record<Entry["role"], string>> = {
  por_que: "explica qué idea enseña el nivel, antes de jugarlo",
  objetivo: "dice qué hay que hacer para superar el nivel, y queda a la vista mientras se juega",
  paso_de_guia: "es un paso de la guía: se lee mientras el jugador tiene el tablero delante",
  llave_titulo: "es el título de la llave que queda guardada en la chuleta: una idea corta",
  llave_cuerpo: "es el cuerpo de la llave: la idea en una o dos frases",
  concepto: "resume lo que deja el concepto entero, al terminar el último nivel",
  mensaje: "es una respuesta a un movimiento del jugador",
};

/** El estado: campos con nombre, como pide la documentación. */
export function estadoDe(entry: Entry, objetos: Objetos, objetivo: string): Record<string, unknown> {
  const escena = objetos.escenas[entry.scene];
  return {
    texto: entry.text,
    papel_del_texto: PAPEL[entry.role],
    objetivo_del_nivel: objetivo,
    escena: {
      nombre: entry.scene,
      objetos_que_dibuja: escena?.dibuja ?? [],
    },
    reglas_del_juego: [
      "El juego habla de vos (voseo rioplatense), nunca de tú.",
      "El juego nunca califica un movimiento de incorrecto: muestra qué hizo.",
      "Lo lee alguien que puede tener ocho años y estar aprendiendo el concepto por primera vez.",
    ],
  };
}

export const PREGUNTAS: QuestionSet = {
  esta_en_voseo: {
    kind: "noul",
    instructions:
      "¿Cada orden que `texto` le da al jugador está en voseo rioplatense? Sólo importan los verbos que le piden algo a quien lee.",
    criteria: {
      true: "Todas las órdenes están en voseo ('arrastrá', 'mirá', 'tocá', 'fijate', 'contá', 'mové', 'arrastrala'), o el texto no da ninguna orden porque describe o explica algo.",
      false: "Al menos una orden está en tuteo: 'arrastra', 'mira', 'toca', 'fíjate', 'cuenta', 'mueve', 'haz', 'pon', o aparece 'tú', 'tienes', 'puedes'.",
    },
  },
  nombra_un_objeto_con_otro_nombre: {
    kind: "noul",
    instructions:
      "¿`texto` nombra algún objeto del tablero con una palabra distinta de la que usa `escena.objetos_que_dibuja` para esa misma cosa?",
    criteria: {
      true: "Sí: le da otro nombre a algo que está dibujado, por ejemplo llamar 'rueda' a una máquina, 'candado' a una cerradura o 'ladrillo' a una baldosa.",
      false: "No: todo objeto del tablero que nombra usa la palabra de la lista, o es una parte de uno de ellos, o el texto habla de números, ideas o acciones y no de objetos del tablero.",
    },
  },
  dice_incorrecto_o_equivalente: {
    kind: "noul",
    instructions: "¿`texto` califica de incorrecto o de equivocado lo que hizo el jugador?",
    criteria: {
      true: "Sí: dice que está mal, que es incorrecto, que se equivocó, que falló, o lo descalifica con otras palabras.",
      false: "No: cuenta qué pasó con los objetos del tablero, o le dice qué mirar o qué le falta, sin juzgarlo.",
    },
  },
  tipo_de_mensaje: {
    kind: "choice",
    instructions: "¿Qué está haciendo `texto` con quien lo lee?",
    options: {
      objetivo: "le dice qué tiene que lograr en este nivel",
      paso_de_guia: "le pide un gesto concreto sobre el tablero, ahora",
      rechazo: "le contesta a un movimiento que no avanzó, diciéndole qué mirar",
      acierto: "le cuenta qué pasó cuando el movimiento salió bien",
      llave: "le deja una idea corta para acordarse, sin pedirle nada",
    },
  },
  claridad_para_un_chico_de_ocho_anios: {
    kind: "score",
    instructions:
      "¿Qué tan claro es `texto` para alguien de ocho años que ve la escena por primera vez y todavía no sabe el concepto?",
    levels: [
      "No se entiende qué quiere decir, o usa palabras del concepto que todavía no aprendió.",
      "Se entiende a medias: hay que releerlo, o nombra algo del tablero sin decir cuál.",
      "Se entiende de una: nombra objetos que están a la vista y pide una sola cosa.",
    ],
  },
};
