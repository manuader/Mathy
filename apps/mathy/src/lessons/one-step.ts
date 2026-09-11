/**
 * La lección de `alg.eq.one_step`. Pendiente: la escribe el agente del nodo siguiendo
 * la skill `mathy-nivel`. Mientras `levels` esté vacío, el nodo se juega como
 * antes: sin tarjeta de entrada, sin guía y sin llaves.
 *
 * Todo lo del nodo vive acá: la lección, sus textos (`texts`, que `t()` lee
 * igual que el diccionario) y los dibujos de llaves que invente (`glyphs`).
 */
import type { LessonModule } from "./types.ts";

const NODE = "alg.eq.one_step";

export const MODULE: LessonModule = {
  lesson: { node: NODE, learnedKey: `node.${NODE}.learned`, levels: [] },
  texts: {},
  glyphs: {},
};
