/**
 * El arte que existe. GENERADO por `tools/art/sync_art.py`: no se edita a mano.
 *
 * Lo que no figura acá se dibuja con su reemplazo en código, así que un
 * manifiesto vacío es un juego que anda entero.
 */
import type { AmbientKey, LumiPose, TomiPose, WorldKey } from "./index.ts";

export const LUMI_ART: Partial<Record<LumiPose, { readonly small?: number; readonly large?: number }>> = {
  hero: { large: require("../../assets/art/lumi/lumi_hero_512.png"), small: require("../../assets/art/lumi/lumi_hero_192.png") },
  icon: { large: require("../../assets/art/lumi/lumi_icon_512.png"), small: require("../../assets/art/lumi/lumi_icon_192.png") },
  point: { large: require("../../assets/art/lumi/lumi_point_512.png"), small: require("../../assets/art/lumi/lumi_point_192.png") },
  cheer: { large: require("../../assets/art/lumi/lumi_cheer_512.png"), small: require("../../assets/art/lumi/lumi_cheer_192.png") },
  think: { large: require("../../assets/art/lumi/lumi_think_512.png"), small: require("../../assets/art/lumi/lumi_think_192.png") },
  wow: { large: require("../../assets/art/lumi/lumi_wow_512.png"), small: require("../../assets/art/lumi/lumi_wow_192.png") },
  key: { large: require("../../assets/art/lumi/lumi_key_512.png"), small: require("../../assets/art/lumi/lumi_key_192.png") },
  read: { large: require("../../assets/art/lumi/lumi_read_512.png"), small: require("../../assets/art/lumi/lumi_read_192.png") },
  sleep: { large: require("../../assets/art/lumi/lumi_sleep_512.png"), small: require("../../assets/art/lumi/lumi_sleep_192.png") },
  encourage: { large: require("../../assets/art/lumi/lumi_encourage_512.png"), small: require("../../assets/art/lumi/lumi_encourage_192.png") },
};

export const TOMI_ART: Partial<Record<TomiPose, { readonly small?: number; readonly large?: number }>> = {
  hero: { large: require("../../assets/art/tomi/tomi_hero_512.png"), small: require("../../assets/art/tomi/tomi_hero_192.png") },
  icon: { large: require("../../assets/art/tomi/tomi_icon_512.png"), small: require("../../assets/art/tomi/tomi_icon_192.png") },
  idea: { large: require("../../assets/art/tomi/tomi_idea_512.png"), small: require("../../assets/art/tomi/tomi_idea_192.png") },
  point: { large: require("../../assets/art/tomi/tomi_point_512.png"), small: require("../../assets/art/tomi/tomi_point_192.png") },
  think: { large: require("../../assets/art/tomi/tomi_think_512.png"), small: require("../../assets/art/tomi/tomi_think_192.png") },
  cheer: { large: require("../../assets/art/tomi/tomi_cheer_512.png"), small: require("../../assets/art/tomi/tomi_cheer_192.png") },
  duo: { large: require("../../assets/art/tomi/tomi_duo_512.png"), small: require("../../assets/art/tomi/tomi_duo_192.png") },
};

export const WORLD_ART: Partial<Record<WorldKey, number>> = {
  found: require("../../assets/art/mundos/bg_found.jpg"),
  arith: require("../../assets/art/mundos/bg_arith.jpg"),
  prealg: require("../../assets/art/mundos/bg_prealg.jpg"),
  alg: require("../../assets/art/mundos/bg_alg.jpg"),
  calc: require("../../assets/art/mundos/bg_calc.jpg"),
  linalg: require("../../assets/art/mundos/bg_linalg.jpg"),
  prob: require("../../assets/art/mundos/bg_prob.jpg"),
  graph: require("../../assets/art/mundos/bg_graph.jpg"),
  geom: require("../../assets/art/mundos/bg_geom.jpg"),
  disc: require("../../assets/art/mundos/bg_disc.jpg"),
  world: require("../../assets/art/mundos/bg_world.jpg"),
};

/** `aspect` es ancho sobre alto: el sprite se ubica por su alto y el ancho sale de ahí. */
export const AMBIENT_ART: Partial<Record<AmbientKey, { readonly src: number; readonly aspect: number }>> = {
  cloud: { src: require("../../assets/art/ambiente/amb_cloud.png"), aspect: 2.22 },
  birds: { src: require("../../assets/art/ambiente/amb_birds.png"), aspect: 1.488 },
  lantern: { src: require("../../assets/art/ambiente/amb_lantern.png"), aspect: 0.81 },
  butterfly: { src: require("../../assets/art/ambiente/amb_butterfly.png"), aspect: 1.401 },
  leaf: { src: require("../../assets/art/ambiente/amb_leaf.png"), aspect: 0.831 },
  gear: { src: require("../../assets/art/ambiente/amb_gear.png"), aspect: 1.041 },
  boat: { src: require("../../assets/art/ambiente/amb_boat.png"), aspect: 2.076 },
  balloon: { src: require("../../assets/art/ambiente/amb_balloon.png"), aspect: 0.703 },
};
