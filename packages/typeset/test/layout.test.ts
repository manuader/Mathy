import { test } from "node:test";
import assert from "node:assert/strict";
import { equation, num, op, resetIds, sym } from "@mathy/math-core";
import { centered, glyphsByNode, layoutEquation, type GlyphMetrics } from "../src/index.ts";

/** Métricas de juguete: todo del mismo ancho, para que las cuentas sean exactas. */
const metrics = (char: string): GlyphMetrics | undefined =>
  ({ advance: 1, top: char === "y" ? -0.7 : -0.7, bottom: char === "y" ? 0.2 : 0 });

const xPlus5 = () => {
  resetIds();
  return equation(op("+", [sym("x", "X"), num(5, "FIVE")], "SUM"), num(12, "TWELVE"), "EQ");
};

test("cada glifo sabe de qué término salió", () => {
  const box = layoutEquation(xPlus5(), metrics);
  const chars = box.glyphs.map((g) => g.char).join("");
  assert.equal(chars, "x+5=12");
  const byNode = glyphsByNode(box);
  assert.deepEqual(byNode.get("X")!.map((g) => g.char), ["x"]);
  assert.deepEqual(byNode.get("FIVE")!.map((g) => g.char), ["5"]);
  assert.deepEqual(byNode.get("TWELVE")!.map((g) => g.char), ["1", "2"]);
  assert.deepEqual(byNode.get("SUM")!.map((g) => g.char), ["+"], "el signo pertenece a la suma");
  assert.deepEqual(byNode.get("EQ")!.map((g) => g.char), ["="], "el igual pertenece a la ecuación");
});

test("los glifos van de izquierda a derecha sin superponerse", () => {
  const box = layoutEquation(xPlus5(), metrics);
  for (let i = 1; i < box.glyphs.length; i++) {
    assert.ok(box.glyphs[i]!.x >= box.glyphs[i - 1]!.x, "el orden horizontal se conserva");
  }
});

test("el número de varias cifras se compone como un solo término", () => {
  const box = layoutEquation(xPlus5(), metrics);
  const doce = glyphsByNode(box).get("TWELVE")!;
  assert.equal(doce.length, 2);
  assert.equal(doce[1]!.x - doce[0]!.x, 1, "una cifra al lado de la otra, sin espacio de operador");
});

test("el operador binario lleva espacio a los dos lados y el igual lleva más", () => {
  const box = layoutEquation(xPlus5(), metrics);
  const g = Object.fromEntries(box.glyphs.map((gl, i) => [i, gl]));
  const x = box.glyphs.find((gl) => gl.char === "x")!;
  const mas = box.glyphs.find((gl) => gl.char === "+")!;
  const igual = box.glyphs.find((gl) => gl.char === "=")!;
  const cinco = box.glyphs.find((gl) => gl.char === "5")!;
  assert.ok(mas.x - (x.x + 1) > 0, "hay aire antes del +");
  assert.ok(igual.x - (cinco.x + 1) > mas.x - (x.x + 1), "el igual respira más que el +");
  assert.ok(g);
});

test("centrar no cambia el ancho ni el orden", () => {
  const box = layoutEquation(xPlus5(), metrics);
  const c = centered(box);
  assert.equal(c.width, box.width);
  assert.equal(c.glyphs.map((gl) => gl.char).join(""), box.glyphs.map((gl) => gl.char).join(""));
  assert.ok(Math.abs(c.glyphs[0]!.x + box.width / 2) < 1e-9, "arranca a la izquierda del centro");
});

test("una suma dentro de un producto se parentiza", () => {
  resetIds();
  const eq = equation(op("*", [num(2, "TWO"), op("+", [sym("x", "X"), num(3, "THREE")], "SUM")], "PROD"), num(10, "TEN"), "EQ");
  const box = layoutEquation(eq, metrics);
  assert.equal(box.glyphs.map((g) => g.char).join(""), "2×(x+3)=10");
});

test("la caja conoce su alto, incluido el descendente", () => {
  resetIds();
  const eq = equation(sym("y", "Y"), num(1, "ONE"), "EQ");
  const box = layoutEquation(eq, metrics);
  assert.ok(box.bottom > 0, "la y baja de la línea de base");
  assert.ok(box.top < 0, "y algo sube por encima");
});

test("el negativo usa el menos de la fuente, no el guion de ASCII", () => {
  resetIds();
  const eq = equation(num(-5, "NEG"), op("*", [sym("x", "X"), num(2, "TWO")], "PROD"), "EQ");
  const box = layoutEquation(eq, metrics);
  const chars = box.glyphs.map((g) => g.char).join("");
  assert.equal(chars, "−5=x×2");
  assert.ok(!chars.includes("-"), "el guion de ASCII no está en el atlas y dejaría un hueco");
});
