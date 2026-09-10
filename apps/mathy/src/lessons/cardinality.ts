/**
 * La lección de los cuencos de fruta, nivel por nivel.
 *
 * Es el primer nodo del juego, así que también es donde el jugador aprende a
 * jugar. Los cuatro primeros niveles estrenan un gesto cada uno y traen una
 * guía de varios pasos atada a ese gesto. Los dos últimos repiten un gesto
 * conocido con más dificultad: su guía es un solo recordatorio de qué llave
 * usar, porque volver a explicar lo que ya se hizo es ruido.
 */
import { NODE_CARDINALITY as NODE } from "@mathy/mechanics";
import type { CoachStep, KeyGlyphName, KeySpec, NodeLesson } from "./types.ts";

const k = (n: number, part: string): string => `lesson.${NODE}.${n}.${part}`;

const step = (n: number, id: string, advance: CoachStep["advance"]): CoachStep => ({
  id,
  textKey: k(n, `coach.${id}`),
  advance,
});

/** El paso que explica el resultado: la ronda espera a que se lea. */
const reveal = (n: number): CoachStep => ({ ...step(n, "reveal", "tap"), holds: true });

const key = (id: string, glyph: KeyGlyphName): KeySpec => ({
  id,
  titleKey: `key.${id}.title`,
  bodyKey: `key.${id}.body`,
  glyph,
});

export const CARDINALITY_LESSON: NodeLesson = {
  node: NODE,
  learnedKey: `node.${NODE}.learned`,
  levels: [
    {
      level: 1,
      whyKey: k(1, "why"),
      goalKey: k(1, "goal"),
      key: key("count.pair_compares", "pair"),
      uses: [],
      coach: [
        step(1, "look", "tap"),
        step(1, "drag", { signal: "placed" }),
        step(1, "bridge", { signal: "bridge" }),
        step(1, "pairAll", { signal: "solved" }),
        reveal(1),
      ],
    },
    {
      level: 2,
      whyKey: k(2, "why"),
      goalKey: k(2, "goal"),
      key: key("count.one_more", "plusOne"),
      uses: [],
      coach: [
        step(2, "look", "tap"),
        step(2, "drag", { signal: "added" }),
        step(2, "fill", { signal: "matched" }),
        reveal(2),
      ],
    },
    {
      level: 3,
      whyKey: k(3, "why"),
      goalKey: k(3, "goal"),
      key: key("count.moving_keeps", "shuffle"),
      uses: ["count.one_more"],
      coach: [
        step(3, "look", "tap"),
        step(3, "choose", { signal: "chosen" }),
        reveal(3),
      ],
    },
    {
      level: 4,
      whyKey: k(4, "why"),
      goalKey: k(4, "goal"),
      key: key("count.number_travels", "travel"),
      uses: ["count.one_more"],
      coach: [
        step(4, "look", "tap"),
        step(4, "carry", { signal: "cardPlaced" }),
        reveal(4),
      ],
    },
    {
      level: 5,
      whyKey: k(5, "why"),
      goalKey: k(5, "goal"),
      key: key("count.one_by_one", "oneByOne"),
      uses: ["count.pair_compares"],
      coach: [step(5, "recall", "tap")],
    },
    {
      level: 6,
      whyKey: k(6, "why"),
      goalKey: k(6, "goal"),
      key: key("count.shape_irrelevant", "sameCount"),
      uses: ["count.moving_keeps", "count.number_travels"],
      coach: [step(6, "recall", "tap")],
    },
  ],
};
