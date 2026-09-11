/**
 * El arte ilustrado del juego: los paisajes de cada área, las dos mascotas y lo
 * que se mueve en la periferia del fondo.
 *
 * Nadie importa un PNG directo. Se pregunta acá, y si la imagen no existe se
 * contesta `undefined` y el que pregunta dibuja su reemplazo (o, para el
 * ambiente, no mueve nada). Es lo que permite que el juego ande entero antes,
 * durante y después de generar el arte.
 *
 * Los objetos matemáticos no están acá y no van a estar: son vectores dibujados
 * en código, porque tienen que poder fundirse en su símbolo (N §4).
 */
import { AMBIENT_ART, LUMI_ART, TOMI_ART, WORLD_ART } from "./manifest.ts";
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

/** Las poses de Tomi, el compañero que da pistas. `duo` es con Lumi. */
export type TomiPose = "hero" | "icon" | "idea" | "point" | "think" | "cheer" | "duo";

export type WorldKey = Area | "world";

/** Lo que se mueve en el fondo, siempre en la periferia. */
export type AmbientKey = "cloud" | "birds" | "lantern" | "butterfly" | "leaf" | "gear" | "boat" | "balloon";

type Sized = { readonly small?: number; readonly large?: number } | undefined;

function pick(entry: Sized, size: "small" | "large"): number | undefined {
  if (!entry) return undefined;
  return size === "small" ? (entry.small ?? entry.large) : (entry.large ?? entry.small);
}

/** La imagen de una pose; `small` para avatares, `large` para tarjetas. */
export function lumiArt(pose: LumiPose, size: "small" | "large"): number | undefined {
  return pick(LUMI_ART[pose], size);
}

export function tomiArt(pose: TomiPose, size: "small" | "large"): number | undefined {
  return pick(TOMI_ART[pose], size);
}

export function worldArt(key: WorldKey): number | undefined {
  return WORLD_ART[key];
}

export function ambientArt(key: AmbientKey): { readonly src: number; readonly aspect: number } | undefined {
  return AMBIENT_ART[key];
}
