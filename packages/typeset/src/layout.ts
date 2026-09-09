/**
 * Composición de expresiones.
 *
 * Se escribe propia y no se usa la de MathJax por una sola razón: la identidad
 * de cada glifo tiene que venir del árbol, no del tipógrafo. Si el layout es
 * nuestro, cada glifo en pantalla sabe de qué término salió, y el morph entre
 * dos estados es exacto por construcción en vez de aproximado por posición.
 *
 * Cubre la gramática de los primeros hitos: números, símbolos, operadores
 * binarios e igualdad. Crece por partes junto con el curriculum.
 */

import type { MathNode, NodeId, Equation } from "@mathy/math-core";

/** Métricas de un glifo, en unidades de em, con el eje Y hacia abajo. */
export interface GlyphMetrics {
  readonly advance: number;
  readonly top: number;
  readonly bottom: number;
}

export type MetricsLookup = (char: string) => GlyphMetrics | undefined;

/** Un glifo ya ubicado. `nodeId` es lo que hace posible el morph. */
export interface PlacedGlyph {
  readonly nodeId: NodeId;
  readonly char: string;
  /** Origen del glifo (izquierda, línea de base), en unidades de em. */
  readonly x: number;
  readonly y: number;
}

export interface Box {
  readonly glyphs: readonly PlacedGlyph[];
  readonly width: number;
  readonly top: number;
  readonly bottom: number;
}

/** Espacio alrededor de un operador binario, en em. Es el `\medmuskip` de TeX. */
const BINARY_SPACE = 0.222;
/** Espacio alrededor de una relación como el igual. Es el `\thickmuskip`. */
const RELATION_SPACE = 0.278;

const FALLBACK: GlyphMetrics = { advance: 0.5, top: -0.7, bottom: 0 };

/** El signo que se dibuja para cada operador. El menos es U+2212, no un guion. */
const OP_CHAR: Record<string, string> = { "+": "+", "-": "−", "*": "×", "/": "÷" };

function emptyBox(): Box {
  return { glyphs: [], width: 0, top: 0, bottom: 0 };
}

function concat(boxes: readonly Box[], gaps: readonly number[]): Box {
  const glyphs: PlacedGlyph[] = [];
  let x = 0;
  let top = 0;
  let bottom = 0;
  boxes.forEach((b, i) => {
    for (const g of b.glyphs) glyphs.push({ ...g, x: g.x + x });
    top = Math.min(top, b.top);
    bottom = Math.max(bottom, b.bottom);
    x += b.width + (gaps[i] ?? 0);
  });
  return { glyphs, width: x, top, bottom };
}

function runOfChars(chars: string, nodeId: NodeId, metrics: MetricsLookup): Box {
  const glyphs: PlacedGlyph[] = [];
  let x = 0;
  let top = 0;
  let bottom = 0;
  for (const char of chars) {
    const m = metrics(char) ?? FALLBACK;
    glyphs.push({ nodeId, char, x, y: 0 });
    x += m.advance;
    top = Math.min(top, m.top);
    bottom = Math.max(bottom, m.bottom);
  }
  return { glyphs, width: x, top, bottom };
}

/** ¿Hace falta envolver este hijo entre paréntesis dentro de su padre? */
function needsParens(child: MathNode, parentOp: string): boolean {
  if (child.kind !== "op") return false;
  const weak = child.op === "+" || child.op === "-";
  const strongParent = parentOp === "*" || parentOp === "/";
  return weak && strongParent;
}

export function layoutNode(node: MathNode, metrics: MetricsLookup): Box {
  switch (node.kind) {
    case "num":
      return runOfChars(formatNumber(node.value), node.id, metrics);
    case "sym":
      return runOfChars(node.name, node.id, metrics);
    case "op": {
      const boxes: Box[] = [];
      const gaps: number[] = [];
      node.args.forEach((arg, i) => {
        if (i > 0) {
          boxes.push(runOfChars(OP_CHAR[node.op] ?? node.op, node.id, metrics));
          gaps.push(BINARY_SPACE);
          gaps[gaps.length - 2] = BINARY_SPACE;
        }
        const inner = layoutNode(arg, metrics);
        boxes.push(needsParens(arg, node.op) ? parenthesize(inner, node.id, metrics) : inner);
        gaps.push(0);
      });
      return concat(boxes, gaps);
    }
  }
}

function parenthesize(inner: Box, nodeId: NodeId, metrics: MetricsLookup): Box {
  const open = runOfChars("(", nodeId, metrics);
  const close = runOfChars(")", nodeId, metrics);
  return concat([open, inner, close], [0, 0, 0]);
}

/** Los números se muestran sin notación exponencial y sin ceros de cola. */
function formatNumber(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(6)));
}

export function layoutEquation(eq: Equation, metrics: MetricsLookup): Box {
  const lhs = layoutNode(eq.lhs, metrics);
  const eqSign = runOfChars("=", eq.id, metrics);
  const rhs = layoutNode(eq.rhs, metrics);
  return concat([lhs, eqSign, rhs], [RELATION_SPACE, RELATION_SPACE, 0]);
}

/** Centra la caja en el origen, que es como se dibuja en pantalla. */
export function centered(box: Box): Box {
  const dx = -box.width / 2;
  return { ...box, glyphs: box.glyphs.map((g) => ({ ...g, x: g.x + dx })), width: box.width };
}

/** Los glifos de un término, agrupados por identidad. */
export function glyphsByNode(box: Box): Map<NodeId, PlacedGlyph[]> {
  const out = new Map<NodeId, PlacedGlyph[]>();
  for (const g of box.glyphs) {
    const list = out.get(g.nodeId);
    if (list) list.push(g);
    else out.set(g.nodeId, [g]);
  }
  return out;
}

export { emptyBox };
