/**
 * La costura de idioma.
 *
 * El diseño manda que ninguna cadena visible esté escrita dentro de un
 * componente: todo pasa por una clave, para que localizar sea traducir un
 * archivo y no salir a buscar textos por el código. Esto es lo mínimo que
 * cumple esa regla hoy —un diccionario en memoria y una función—, y es el
 * lugar donde después entra i18next con ICU MessageFormat, la detección de
 * `expo-localization` y los bundles por locale.
 *
 * `es` es el locale fuente. Una clave sin traducción devuelve la clave, que se
 * ve horrible a propósito: un texto sin traducir tiene que doler.
 */

const es: Record<string, string> = {
  "app.name": "Mathy",
  "app.tagline": "Cada concepto se aprende manipulando algo antes de escribirlo.",
  "map.back": "‹ Conceptos",
  "map.progress": "recorridos",
  "game.back": "‹ Niveles",

  "node.alg.eq.one_step.name": "Cofres y llaves",
  "node.alg.eq.one_step.tagline": "Una cerradura, una llave",

  "level.oneKeyTwoPans": "Una llave, dos platos",
  "level.fourLocks": "Cuatro cerraduras",
  "level.barsAndArrows": "Barras y flechas",
  "level.tokensBeside": "Fichas al lado",
  "level.ghostBalance": "Balanza fantasma",
  "level.hardNumbers": "Números difíciles",
  "level.boxOnTheRight": "La caja a la derecha",
  "level.locksNeverSeen": "Cerraduras que nunca viste",

  "node.found.count.number_line.name": "El camino de piedras",
  "node.found.count.number_line.tagline": "Los números viven en fila",

  "level.oneToothOneStone": "Un diente, una piedra",
  "level.stonesHaveNames": "Las piedras tienen nombre",
  "level.stoneWithNoSteps": "La piedra donde no diste ningún paso",
  "level.gaps": "Huecos",
  "level.tracksThatResize": "Pistas que cambian de tamaño",
  "level.marksOnly": "Solo marcas",

  "node.found.count.cardinality.name": "Los cuencos de fruta",
  "node.found.count.cardinality.tagline": "Contar dice cuántas hay",

  "level.onePairPerFruit": "Un par por fruta",
  "level.tickAndCard": "El tic y la tarjeta",
  "level.movingChangesNothing": "Mover no cambia",
  "level.cardTravels": "La tarjeta viaja",
  "level.moreFruitMoreMix": "Más frutas, más mezcla",
  "level.pebblesShellsMarks": "Piedras, conchas, marcas",

  "layer.concrete": "manipulación",
  "layer.visual": "representación",
  "layer.symbolic": "notación",
  "layer.formal": "definición",
  "layer.abstract": "abstracción",
};

export function t(key: string): string {
  return es[key] ?? key;
}
