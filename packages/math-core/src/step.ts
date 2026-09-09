/**
 * El motor de pasos.
 *
 * Un movimiento del jugador no devuelve solo la ecuación nueva: devuelve además
 * una traza que dice qué le pasó a cada término. La traza es el puente entre la
 * matemática y la animación. Sin ella habría que adivinar, comparando dos
 * árboles, qué se movió y qué nació, que es exactamente el problema que hace
 * frágil a `TransformMatchingParts` en Manim.
 */

import {
  type BinOp,
  type Equation,
  type MathNode,
  type NodeId,
  equation,
  evaluate,
  freshId,
  isClosed,
  num,
  op,
} from "./tree.ts";

/** El vocabulario cerrado de movimientos. El jugador no escribe texto libre. */
export type Move =
  | { readonly kind: "applyBothSides"; readonly op: BinOp; readonly value: number }
  | { readonly kind: "simplify" };

/** Qué le pasó a cada término entre un estado y el siguiente. */
export interface Trace {
  /** Términos que siguen existiendo con la misma identidad. */
  readonly kept: readonly NodeId[];
  /** Términos nuevos. `bornAt` es de dónde salen, para animar la entrada. */
  readonly created: readonly { readonly id: NodeId; readonly bornAt?: NodeId }[];
  /** Términos que dejan de existir sin dejar heredero. */
  readonly removed: readonly NodeId[];
  /** Términos que se funden en uno: `12` y `-5` se van, y queda `7`. */
  readonly merged: readonly { readonly into: NodeId; readonly from: readonly NodeId[] }[];
  /** Pares que se aniquilan: `+5` y `-5` desaparecen juntos. */
  readonly annihilated: readonly (readonly [NodeId, NodeId])[];
}

const emptyTrace = (): Trace => ({ kept: [], created: [], removed: [], merged: [], annihilated: [] });

export interface StepResult {
  readonly next: Equation;
  readonly trace: Trace;
  /** Movimiento válido: conserva la igualdad. */
  readonly valid: boolean;
  /** Distancia a la meta, para detectar movimientos válidos pero inútiles. */
  readonly cost: number;
}

/** Cuántos nodos acompañan a la incógnita. Cero significa despejada. */
export function goalCost(eq: Equation, unknown: string): number {
  const side = [eq.lhs, eq.rhs].find((s) => [...walkNodes(s)].some((n) => n.kind === "sym" && n.name === unknown));
  if (!side) return Number.POSITIVE_INFINITY;
  return [...walkNodes(side)].length - 1;
}

function* walkNodes(node: MathNode): Generator<MathNode> {
  yield node;
  if (node.kind === "op") for (const a of node.args) yield* walkNodes(a);
}

/** La operación que deshace a otra. Es la llave del diseño, en código. */
export const inverseOf = (o: BinOp): BinOp =>
  o === "+" ? "-" : o === "-" ? "+" : o === "*" ? "/" : "*";

/**
 * Aplica una operación a los dos lados y simplifica lo que quede cerrado.
 *
 * Reconoce dos situaciones que la animación necesita distinguir:
 * la aniquilación (`+5` con `-5` sobre el mismo lado) y la fusión (`12` con
 * `-5`, que dejan un `7` nuevo).
 */
export function applyBothSides(eq: Equation, o: BinOp, value: number, unknown: string): StepResult {
  const kept: NodeId[] = [];
  const created: { id: NodeId; bornAt?: NodeId }[] = [];
  const removed: NodeId[] = [];
  const merged: { into: NodeId; from: NodeId[] }[] = [];
  const annihilated: [NodeId, NodeId][] = [];

  const applySide = (side: MathNode): MathNode => {
    const token = num(value, freshId("tok"));
    created.push({ id: token.id });

    // Aniquilación: el lado es `algo <op> value` y la operación es la inversa.
    if (side.kind === "op" && side.args.length === 2 && side.op === inverseOf(o)) {
      const [head, tail] = side.args;
      if (head && tail && tail.kind === "num" && tail.value === value) {
        annihilated.push([tail.id, token.id]);
        removed.push(side.id);
        return head;
      }
    }

    // Fusión: el lado está cerrado, así que el resultado es un número nuevo.
    if (isClosed(side)) {
      const combined = op(o, [side, num(value, token.id)], freshId("op"));
      const v = evaluate(combined);
      if (v !== undefined && Number.isFinite(v)) {
        const out = num(v, freshId("num"));
        merged.push({ into: out.id, from: [side.id, token.id] });
        return out;
      }
    }

    // Caso general: el lado crece.
    const grown = op(o, [side, num(value, token.id)], freshId("op"));
    created.push({ id: grown.id, bornAt: side.id });
    return grown;
  };

  const next = equation(applySide(eq.lhs), applySide(eq.rhs), eq.id);

  const before = new Set([...walkNodes(eq.lhs), ...walkNodes(eq.rhs)].map((n) => n.id));
  const after = new Set([...walkNodes(next.lhs), ...walkNodes(next.rhs)].map((n) => n.id));
  for (const id of before) if (after.has(id)) kept.push(id);
  const accounted = new Set([
    ...removed,
    ...merged.flatMap((m) => m.from),
    ...annihilated.flat(),
  ]);
  for (const id of before) if (!after.has(id) && !accounted.has(id)) removed.push(id);

  return {
    next,
    trace: { kept, created, removed, merged, annihilated },
    valid: true, // aplicar lo mismo a los dos lados siempre conserva la igualdad
    cost: goalCost(next, unknown),
  };
}

/** Aplicar una operación a un solo lado. Rompe la igualdad: es el error clásico. */
export function applyOneSide(
  eq: Equation,
  side: "lhs" | "rhs",
  o: BinOp,
  value: number,
  unknown: string,
): StepResult {
  const token = num(value, freshId("tok"));
  const target = side === "lhs" ? eq.lhs : eq.rhs;
  const grown = op(o, [target, token], freshId("op"));
  const next = side === "lhs" ? equation(grown, eq.rhs, eq.id) : equation(eq.lhs, grown, eq.id);
  return {
    next,
    trace: {
      ...emptyTrace(),
      created: [{ id: token.id }, { id: grown.id, bornAt: target.id }],
      kept: [...walkNodes(target)].map((n) => n.id),
    },
    valid: false,
    cost: goalCost(next, unknown),
  };
}

/** ¿Está despejada la incógnita? */
export const isSolved = (eq: Equation, unknown: string): boolean =>
  (eq.lhs.kind === "sym" && eq.lhs.name === unknown && isClosed(eq.rhs)) ||
  (eq.rhs.kind === "sym" && eq.rhs.name === unknown && isClosed(eq.lhs));
