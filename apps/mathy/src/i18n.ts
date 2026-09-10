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

  "layer.concrete": "manipulación",
  "layer.visual": "representación",
  "layer.symbolic": "notación",
  "layer.formal": "definición",
  "layer.abstract": "abstracción",
};

export function t(key: string): string {
  return es[key] ?? key;
}
