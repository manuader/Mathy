/**
 * El registro de lecciones.
 *
 * Una lección es opcional: el nivel que no la tiene se juega igual, sin tarjeta
 * de entrada y sin llave. Agregar la de un nodo es escribir su archivo y una
 * línea en `LESSONS`.
 */
import { playableNodes, type NodeSpec } from "@mathy/mechanics";
import { CARDINALITY_LESSON } from "./cardinality.ts";
import type { KeySpec, LevelLesson, NodeLesson } from "./types.ts";

const LESSONS: readonly NodeLesson[] = [CARDINALITY_LESSON];

const byNode = new Map<string, NodeLesson>(LESSONS.map((l) => [l.node, l]));

export const nodeLesson = (node: string): NodeLesson | undefined => byNode.get(node);

export const lessonFor = (node: string, level: number): LevelLesson | undefined =>
  byNode.get(node)?.levels.find((l) => l.level === level);

export interface EarnedKey {
  readonly key: KeySpec;
  readonly node: string;
  readonly level: number;
}

/** Las llaves ganadas, una por nivel superado, en el orden de la espina. */
export function earnedKeys(levelsDone: Readonly<Record<string, number>>): readonly EarnedKey[] {
  const out: EarnedKey[] = [];
  for (const spec of playableNodes()) {
    const lesson = byNode.get(spec.id);
    if (!lesson) continue;
    const done = levelsDone[spec.id] ?? 0;
    for (const l of lesson.levels) {
      if (l.level <= done) out.push({ key: l.key, node: spec.id, level: l.level });
    }
  }
  return out;
}

export function keyById(id: string): EarnedKey | undefined {
  for (const lesson of LESSONS) {
    for (const l of lesson.levels) {
      if (l.key.id === id) return { key: l.key, node: lesson.node, level: l.level };
    }
  }
  return undefined;
}

/** El concepto que sigue en la espina, entre los que ya tienen minijuego. */
export function nodeAfter(id: string): NodeSpec | undefined {
  const nodes = playableNodes();
  const i = nodes.findIndex((n) => n.id === id);
  return i >= 0 ? nodes[i + 1] : undefined;
}
