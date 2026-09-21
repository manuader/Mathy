/**
 * Los nodos que el barrido revisa.
 *
 * Es lo único que hay que tocar para sumar el sexto: un archivo al lado de
 * estos y una línea acá. El motor de `../generadores.ts` no sabe cuántos son ni
 * qué mecánica tiene cada uno.
 */

import { definirNodo, type NodoUniforme } from "../generadores.ts";
import { COMPOSICION } from "./composicion.ts";
import { DIVISION } from "./division.ts";
import { MAQUINA } from "./maquina.ts";
import { PENDIENTE } from "./pendiente.ts";
import { SISTEMAS } from "./sistemas.ts";

export const REGISTRO: readonly NodoUniforme[] = [
  definirNodo(COMPOSICION),
  definirNodo(PENDIENTE),
  definirNodo(SISTEMAS),
  definirNodo(MAQUINA),
  definirNodo(DIVISION),
];
