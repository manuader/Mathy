/**
 * El árbol de expresión de Mathy.
 *
 * La diferencia con cualquier otra representación de una expresión es que cada
 * nodo tiene una identidad estable que sobrevive a las transformaciones. Eso es
 * lo que permite que `x` sea el mismo objeto en pantalla antes y después de
 * despejar, y es la condición para animar como anima Manim sin depender de
 * emparejar submobjects por posición.
 */

/** Identidad de un término. Estable a través de las transformaciones. */
export type NodeId = string;

export type BinOp = "+" | "-" | "*" | "/";

export type MathNode =
  | { readonly id: NodeId; readonly kind: "num"; readonly value: number }
  | { readonly id: NodeId; readonly kind: "sym"; readonly name: string }
  | { readonly id: NodeId; readonly kind: "op"; readonly op: BinOp; readonly args: readonly MathNode[] };

export interface Equation {
  readonly id: NodeId;
  readonly lhs: MathNode;
  readonly rhs: MathNode;
}

let counter = 0;
/** Genera una identidad nueva. El prefijo solo existe para leer los tests. */
export const freshId = (prefix = "n"): NodeId => `${prefix}${++counter}`;

/** Reinicia el contador. Solo para tests deterministas. */
export const resetIds = (): void => {
  counter = 0;
};

export const num = (value: number, id: NodeId = freshId("num")): MathNode => ({ id, kind: "num", value });
export const sym = (name: string, id: NodeId = freshId("sym")): MathNode => ({ id, kind: "sym", name });
export const op = (o: BinOp, args: readonly MathNode[], id: NodeId = freshId("op")): MathNode => ({
  id,
  kind: "op",
  op: o,
  args,
});
export const equation = (lhs: MathNode, rhs: MathNode, id: NodeId = freshId("eq")): Equation => ({ id, lhs, rhs });

/** Recorre el árbol en preorden. */
export function* walk(node: MathNode): Generator<MathNode> {
  yield node;
  if (node.kind === "op") {
    for (const arg of node.args) yield* walk(arg);
  }
}

export function nodesOf(eq: Equation): MathNode[] {
  return [...walk(eq.lhs), ...walk(eq.rhs)];
}

export function findById(eq: Equation, id: NodeId): MathNode | undefined {
  for (const n of nodesOf(eq)) if (n.id === id) return n;
  return undefined;
}

/** Evalúa un subárbol cerrado. Devuelve undefined si tiene símbolos. */
export function evaluate(node: MathNode): number | undefined {
  switch (node.kind) {
    case "num":
      return node.value;
    case "sym":
      return undefined;
    case "op": {
      const vals: number[] = [];
      for (const a of node.args) {
        const v = evaluate(a);
        if (v === undefined) return undefined;
        vals.push(v);
      }
      const [first, ...rest] = vals;
      if (first === undefined) return undefined;
      switch (node.op) {
        case "+":
          return rest.reduce((acc, v) => acc + v, first);
        case "-":
          return rest.reduce((acc, v) => acc - v, first);
        case "*":
          return rest.reduce((acc, v) => acc * v, first);
        case "/":
          return rest.reduce((acc, v) => (v === 0 ? NaN : acc / v), first);
      }
    }
  }
}

/** true si el nodo no contiene ningún símbolo. */
export const isClosed = (node: MathNode): boolean => [...walk(node)].every((n) => n.kind !== "sym");

/** Los símbolos que aparecen en la ecuación, sin repetir. */
export function symbolsOf(eq: Equation): string[] {
  const seen = new Set<string>();
  for (const n of nodesOf(eq)) if (n.kind === "sym") seen.add(n.name);
  return [...seen];
}

/** Serializa a una forma legible, para tests y para depurar. */
export function toText(node: MathNode): string {
  switch (node.kind) {
    case "num":
      return String(node.value);
    case "sym":
      return node.name;
    case "op": {
      const parts = node.args.map((a) => (a.kind === "op" ? `(${toText(a)})` : toText(a)));
      return parts.join(` ${node.op} `);
    }
  }
}

export const equationToText = (eq: Equation): string => `${toText(eq.lhs)} = ${toText(eq.rhs)}`;
