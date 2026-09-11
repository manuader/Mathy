/**
 * El registro de lecciones.
 *
 * Una lección es opcional: el nivel que no la tiene se juega igual, sin tarjeta
 * de entrada y sin llave. Agregar la de un nodo es escribir su archivo y una
 * línea en `LESSONS`.
 */
import { playableNodes, type NodeSpec } from "@mathy/mechanics";
import { CARDINALITY_LESSON } from "./cardinality.ts";
import { MODULE as NUMBER_LINE } from "./number-line.ts";
import { MODULE as ADD_DISPLACEMENT } from "./add-displacement.ts";
import { MODULE as MUL_SCALING } from "./mul-scaling.ts";
import { MODULE as SUB_UNDO_ADD } from "./sub-undo-add.ts";
import { MODULE as DIV_UNDO_MUL } from "./div-undo-mul.ts";
import { MODULE as NEGATIVES } from "./negatives.ts";
import { MODULE as FRACTIONS } from "./fractions.ts";
import { MODULE as PRECEDENCE } from "./precedence.ts";
import { MODULE as UNKNOWN_BOX } from "./unknown-box.ts";
import { MODULE as OPERATION_KEY } from "./operation-key.ts";
import { MODULE as BALANCE_EQ } from "./balance-eq.ts";
import { MODULE as ONE_STEP } from "./one-step.ts";
import { MODULE as MULTI_STEP } from "./multi-step.ts";
import { MODULE as DISTRIBUTIVE } from "./distributive.ts";
import { MODULE as SYSTEMS } from "./systems.ts";
import { MODULE as FUNCTION_MACHINE } from "./function-machine.ts";
import { MODULE as GRAPH_PICTURE } from "./graph-picture.ts";
import { MODULE as SLOPE } from "./slope.ts";
import { MODULE as COMPOSITION } from "./composition.ts";
import { MODULE as INVERSE } from "./inverse.ts";
import type { KeyDrawing, KeySpec, LessonModule, LevelLesson, NodeLesson } from "./types.ts";

/**
 * Un módulo por nodo, en el orden de la espina. El del nodo 1 es anterior a los
 * módulos y guarda sus textos en `i18n.ts`.
 */
const MODULES: readonly LessonModule[] = [
  { lesson: CARDINALITY_LESSON, texts: {} },
  NUMBER_LINE,
  ADD_DISPLACEMENT,
  MUL_SCALING,
  SUB_UNDO_ADD,
  DIV_UNDO_MUL,
  NEGATIVES,
  FRACTIONS,
  PRECEDENCE,
  UNKNOWN_BOX,
  OPERATION_KEY,
  BALANCE_EQ,
  ONE_STEP,
  MULTI_STEP,
  DISTRIBUTIVE,
  SYSTEMS,
  FUNCTION_MACHINE,
  GRAPH_PICTURE,
  SLOPE,
  COMPOSITION,
  INVERSE,
];

/** Sólo los nodos que ya tienen niveles: un módulo vacío es un nodo sin lección. */
const LESSONS: readonly NodeLesson[] = MODULES.map((m) => m.lesson).filter((l) => l.levels.length > 0);

/** Los textos de todas las lecciones. `t()` los busca después del diccionario. */
export const LESSON_TEXTS: Readonly<Record<string, string>> = Object.assign({}, ...MODULES.map((m) => m.texts));

/** Los dibujos de llaves que trae cada lección, además de los de `ui/KeyGlyph.tsx`. */
export const LESSON_GLYPHS: Readonly<Record<string, KeyDrawing>> = Object.assign(
  {},
  ...MODULES.map((m) => m.glyphs ?? {}),
);

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
