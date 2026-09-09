import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyBothSides,
  applyOneSide,
  equation,
  equationToText,
  evaluate,
  inverseOf,
  isSolved,
  num,
  op,
  resetIds,
  sym,
} from "../src/index.ts";

/** x + 5 = 12, el nodo de calibración del diseño. */
const xPlus5 = () => {
  resetIds();
  const x = sym("x", "X");
  const five = num(5, "FIVE");
  const twelve = num(12, "TWELVE");
  return { eq: equation(op("+", [x, five], "SUM"), twelve, "EQ"), x, five, twelve };
};

test("restar 5 a los dos lados despeja la x", () => {
  const { eq } = xPlus5();
  const r = applyBothSides(eq, "-", 5, "x");
  assert.equal(equationToText(r.next), "x = 7");
  assert.ok(r.valid);
  assert.ok(isSolved(r.next, "x"));
});

test("la x conserva su identidad a través del paso", () => {
  const { eq } = xPlus5();
  const r = applyBothSides(eq, "-", 5, "x");
  assert.ok(r.trace.kept.includes("X"), "la x tiene que estar en kept");
  assert.equal(r.next.lhs.id, "X", "y seguir siendo el mismo nodo");
});

test("el +5 y el -5 se aniquilan, no desaparecen sin explicación", () => {
  const { eq } = xPlus5();
  const r = applyBothSides(eq, "-", 5, "x");
  assert.equal(r.trace.annihilated.length, 1);
  const pair = r.trace.annihilated[0]!;
  assert.ok(pair.includes("FIVE"), "el 5 original participa de la aniquilación");
});

test("el 12 y el -5 se funden en un 7 nuevo", () => {
  const { eq } = xPlus5();
  const r = applyBothSides(eq, "-", 5, "x");
  assert.equal(r.trace.merged.length, 1);
  const m = r.trace.merged[0]!;
  assert.ok(m.from.includes("TWELVE"), "el 12 se funde");
  const seven = [r.next.lhs, r.next.rhs].find((n) => n.id === m.into);
  assert.ok(seven && seven.kind === "num" && seven.value === 7);
});

test("cada término del resultado tiene procedencia: nada aparece de la nada", () => {
  const { eq } = xPlus5();
  const r = applyBothSides(eq, "-", 5, "x");
  const explained = new Set([
    ...r.trace.kept,
    ...r.trace.created.map((c) => c.id),
    ...r.trace.merged.map((m) => m.into),
  ]);
  const collect = (n: any): string[] => [n.id, ...(n.args ?? []).flatMap(collect)];
  for (const id of [...collect(r.next.lhs), ...collect(r.next.rhs)]) {
    assert.ok(explained.has(id), `el término ${id} apareció sin traza`);
  }
});

test("aplicar a un solo lado rompe la igualdad y el motor lo sabe", () => {
  const { eq } = xPlus5();
  const r = applyOneSide(eq, "lhs", "-", 3, "x");
  assert.equal(r.valid, false);
  assert.equal(equationToText(r.next), "(x + 5) - 3 = 12");
});

test("restar 3 a los dos lados es válido pero no acerca a la meta", () => {
  const { eq } = xPlus5();
  const bien = applyBothSides(eq, "-", 5, "x");
  const inutil = applyBothSides(eq, "-", 3, "x");
  assert.ok(inutil.valid, "sigue siendo un movimiento legítimo");
  assert.ok(inutil.cost > bien.cost, "pero deja más nodos junto a la x");
  assert.equal(equationToText(inutil.next), "(x + 5) - 3 = 9");
});

test("la llave de cada operación es su inversa", () => {
  assert.equal(inverseOf("+"), "-");
  assert.equal(inverseOf("-"), "+");
  assert.equal(inverseOf("*"), "/");
  assert.equal(inverseOf("/"), "*");
});

test("dividir por 3 despeja 3x = 12", () => {
  resetIds();
  const eq = equation(op("*", [num(3), sym("x", "X")], "PROD"), num(12), "EQ");
  const r = applyBothSides(eq, "/", 3, "x");
  assert.ok(r.valid);
  assert.equal(evaluate(r.next.rhs), 4);
});
