/**
 * El planificador de morph.
 *
 * Toma dos composiciones y la traza del paso matemático, y produce, por cada
 * glifo, de dónde sale y adónde va. Es el equivalente de
 * `TransformMatchingParts` de Manim, con una diferencia: Manim empareja
 * submobjects por posición dentro de la cadena y falla cuando la estructura
 * cambia; acá el emparejamiento viene del árbol, así que es exacto.
 *
 * El hallazgo que abarata todo: casi ningún glifo cambia de forma. La `x` de
 * `x + 5 = 12` es la misma `x` de `x = 7`, solo se traslada. Por eso el plan
 * es de transformaciones y opacidades, no de interpolación de trazos.
 */

import type { NodeId } from "@mathy/math-core";
import type { Trace } from "@mathy/math-core";
import type { Box, PlacedGlyph } from "@mathy/typeset";

/** Qué le pasa a un glifo durante el paso. */
export type GlyphFate =
  /** Estaba y sigue: se traslada. */
  | { readonly kind: "move" }
  /** Nace: entra desde un punto o desde la nada. */
  | { readonly kind: "enter"; readonly fromNode?: NodeId }
  /** Se va sin heredero. */
  | { readonly kind: "exit" }
  /** Se aniquila con su pareja: se juntan y se apagan. */
  | { readonly kind: "annihilate"; readonly withNode: NodeId }
  /** Se funde en un término nuevo: se mueve hasta él y se cruza en disolvencia. */
  | { readonly kind: "mergeInto"; readonly target: NodeId }
  /** Es el resultado de una fusión: aparece donde llegaron los que se fundieron. */
  | { readonly kind: "mergeResult"; readonly sources: readonly NodeId[] };

export interface GlyphStep {
  readonly key: string;
  readonly char: string;
  readonly nodeId: NodeId;
  readonly from: { readonly x: number; readonly y: number; readonly opacity: number };
  readonly to: { readonly x: number; readonly y: number; readonly opacity: number };
  readonly fate: GlyphFate;
}

export interface MorphPlan {
  readonly steps: readonly GlyphStep[];
  /** Ancho de la caja de salida y de la de llegada, para encuadrar la cámara. */
  readonly fromWidth: number;
  readonly toWidth: number;
}

/** Clave estable de un glifo: su término más su posición dentro del término. */
const keyOf = (g: PlacedGlyph, index: number): string => `${g.nodeId}#${index}`;

function indexGlyphs(box: Box): Map<string, PlacedGlyph> {
  const perNode = new Map<NodeId, number>();
  const out = new Map<string, PlacedGlyph>();
  for (const g of box.glyphs) {
    const i = perNode.get(g.nodeId) ?? 0;
    perNode.set(g.nodeId, i + 1);
    out.set(keyOf(g, i), g);
  }
  return out;
}

/** Centro horizontal de un término, para que lo que se funde apunte al lugar correcto. */
function nodeCenter(box: Box, nodeId: NodeId): { x: number; y: number } | undefined {
  const gs = box.glyphs.filter((g) => g.nodeId === nodeId);
  if (gs.length === 0) return undefined;
  const x = gs.reduce((acc, g) => acc + g.x, 0) / gs.length;
  const y = gs.reduce((acc, g) => acc + g.y, 0) / gs.length;
  return { x, y };
}

export function planMorph(before: Box, after: Box, trace: Trace): MorphPlan {
  const fromIdx = indexGlyphs(before);
  const toIdx = indexGlyphs(after);
  const steps: GlyphStep[] = [];

  const annihilPartner = new Map<NodeId, NodeId>();
  for (const [a, b] of trace.annihilated) {
    annihilPartner.set(a, b);
    annihilPartner.set(b, a);
  }
  const mergeTargetOf = new Map<NodeId, NodeId>();
  const mergeSourcesOf = new Map<NodeId, readonly NodeId[]>();
  for (const m of trace.merged) {
    mergeSourcesOf.set(m.into, m.from);
    for (const s of m.from) mergeTargetOf.set(s, m.into);
  }
  const bornAtOf = new Map<NodeId, NodeId | undefined>();
  for (const c of trace.created) bornAtOf.set(c.id, c.bornAt);

  // Glifos que estaban antes.
  for (const [key, g] of fromIdx) {
    const dest = toIdx.get(key);
    if (dest) {
      steps.push({
        key,
        char: g.char,
        nodeId: g.nodeId,
        from: { x: g.x, y: g.y, opacity: 1 },
        to: { x: dest.x, y: dest.y, opacity: 1 },
        fate: { kind: "move" },
      });
      continue;
    }
    const partner = annihilPartner.get(g.nodeId);
    if (partner) {
      // Los dos se juntan en el punto medio y se apagan.
      const other = nodeCenter(before, partner);
      const meet = other ? { x: (g.x + other.x) / 2, y: (g.y + other.y) / 2 } : { x: g.x, y: g.y };
      steps.push({
        key,
        char: g.char,
        nodeId: g.nodeId,
        from: { x: g.x, y: g.y, opacity: 1 },
        to: { x: meet.x, y: meet.y, opacity: 0 },
        fate: { kind: "annihilate", withNode: partner },
      });
      continue;
    }
    const target = mergeTargetOf.get(g.nodeId);
    if (target) {
      const landing = nodeCenter(after, target) ?? { x: g.x, y: g.y };
      steps.push({
        key,
        char: g.char,
        nodeId: g.nodeId,
        from: { x: g.x, y: g.y, opacity: 1 },
        to: { x: landing.x, y: landing.y, opacity: 0 },
        fate: { kind: "mergeInto", target },
      });
      continue;
    }
    steps.push({
      key,
      char: g.char,
      nodeId: g.nodeId,
      from: { x: g.x, y: g.y, opacity: 1 },
      to: { x: g.x, y: g.y, opacity: 0 },
      fate: { kind: "exit" },
    });
  }

  // Glifos que solo existen después.
  for (const [key, g] of toIdx) {
    if (fromIdx.has(key)) continue;
    const sources = mergeSourcesOf.get(g.nodeId);
    if (sources) {
      steps.push({
        key,
        char: g.char,
        nodeId: g.nodeId,
        from: { x: g.x, y: g.y, opacity: 0 },
        to: { x: g.x, y: g.y, opacity: 1 },
        fate: { kind: "mergeResult", sources },
      });
      continue;
    }
    const bornAt = bornAtOf.get(g.nodeId);
    const origin = bornAt ? nodeCenter(before, bornAt) : undefined;
    steps.push({
      key,
      char: g.char,
      nodeId: g.nodeId,
      from: { x: origin?.x ?? g.x, y: origin?.y ?? g.y, opacity: 0 },
      to: { x: g.x, y: g.y, opacity: 1 },
      fate: bornAt ? { kind: "enter", fromNode: bornAt } : { kind: "enter" },
    });
  }

  return { steps, fromWidth: before.width, toWidth: after.width };
}

/**
 * Evalúa el plan en un instante. Es una función pura de `t`, sin estado, para
 * que pueda correr dentro de un worklet en el hilo de UI.
 */
export interface GlyphFrame {
  readonly key: string;
  readonly char: string;
  readonly x: number;
  readonly y: number;
  readonly opacity: number;
}

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export function sampleMorph(plan: MorphPlan, t: number, ease: (t: number) => number): GlyphFrame[] {
  const e = ease(t);
  return plan.steps.map((s) => {
    // Lo que se apaga lo hace en la primera mitad; lo que se enciende, en la segunda.
    // Así nunca se ve el estado nuevo encimado sobre el viejo.
    const fadeOut = s.fate.kind === "annihilate" || s.fate.kind === "mergeInto" || s.fate.kind === "exit";
    const fadeIn = s.fate.kind === "enter" || s.fate.kind === "mergeResult";
    const o = fadeOut
      ? lerp(s.from.opacity, s.to.opacity, Math.min(1, e * 2))
      : fadeIn
        ? lerp(s.from.opacity, s.to.opacity, Math.max(0, e * 2 - 1))
        : lerp(s.from.opacity, s.to.opacity, e);
    return {
      key: s.key,
      char: s.char,
      x: lerp(s.from.x, s.to.x, e),
      y: lerp(s.from.y, s.to.y, e),
      opacity: o,
    };
  });
}
