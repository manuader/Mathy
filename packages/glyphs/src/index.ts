/**
 * El atlas de glifos horneado.
 *
 * Todo viene en em con el eje Y hacia abajo, así que dibujar un glifo a un
 * tamaño de fuente dado es multiplicar por ese tamaño y nada más. Ver el README
 * del paquete para las unidades.
 */

import data from "./atlas.json" with { type: "json" };

export interface Glyph {
  /** El carácter, igual que la clave del atlas. */
  readonly char: string;
  /** El contorno como `d` de SVG, en em y con Y hacia abajo. */
  readonly path: string;
  /** Avance horizontal, en em. */
  readonly advance: number;
  /** Caja de tinta, en em y con Y hacia abajo: `top` negativo está sobre la línea de base. */
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

export const atlas: Record<string, Glyph> = data;

export function getGlyph(char: string): Glyph | undefined {
  return atlas[char];
}
