/**
 * El arte ilustrado del juego: los paisajes de cada área y Lumi.
 *
 * Nadie importa un PNG directo. Se pregunta acá, y si la imagen no existe se
 * contesta `undefined` y el que pregunta dibuja su reemplazo. Es lo que permite
 * que el juego ande entero antes, durante y después de generar el arte.
 *
 * Los objetos matemáticos no están acá y no van a estar: son vectores dibujados
 * en código, porque tienen que poder fundirse en su símbolo (N §4).
 */
import { LUMI_ART, WORLD_ART } from "./manifest.ts";
import type { Area } from "../ui/theme.ts";

/** Las poses de Lumi, una por momento del juego. */
export type LumiPose =
  | "hero"
  | "icon"
  | "point"
  | "cheer"
  | "think"
  | "wow"
  | "key"
  | "read"
  | "sleep"
  | "encourage";

export type WorldKey = Area | "world";

/** La imagen de una pose; `small` para avatares, `large` para tarjetas. */
export function lumiArt(pose: LumiPose, size: "small" | "large"): number | undefined {
  const entry = LUMI_ART[pose];
  if (!entry) return undefined;
  return size === "small" ? (entry.small ?? entry.large) : (entry.large ?? entry.small);
}

export function worldArt(key: WorldKey): number | undefined {
  return WORLD_ART[key];
}
