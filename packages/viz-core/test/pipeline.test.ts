/**
 * La cadena completa con los glifos reales, que es la mitad de la prueba
 * vertical del hito M0: árbol, traza, composición, plan de morph y muestreo.
 * Lo único que falta después de esto es dibujar.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { applyBothSides, equation, num, op, resetIds, sym } from "@mathy/math-core";
import { getGlyph } from "@mathy/glyphs";
import { layoutEquation, type GlyphMetrics } from "@mathy/typeset";
import { planMorph, sampleMorph, smooth } from "../src/index.ts";

/** Las métricas salen del atlas horneado, no de un mock. */
const metrics = (char: string): GlyphMetrics | undefined => {
  const g = getGlyph(char);
  return g ? { advance: g.advance, top: g.top, bottom: g.bottom } : undefined;
};

test("el atlas cubre todo lo que la composición necesita", () => {
  for (const c of "0123456789xyabn+−×÷=().") {
    assert.ok(getGlyph(c), `falta el glifo ${c} en el atlas`);
  }
});

test("x + 5 = 12 se compone con métricas reales y sin superposiciones", () => {
  resetIds();
  const eq = equation(op("+", [sym("x", "X"), num(5, "FIVE")], "SUM"), num(12, "TWELVE"), "EQ");
  const box = layoutEquation(eq, metrics);
  assert.equal(box.glyphs.map((g) => g.char).join(""), "x+5=12");
  for (let i = 1; i < box.glyphs.length; i++) {
    const prev = box.glyphs[i - 1]!;
    const cur = box.glyphs[i]!;
    const advance = getGlyph(prev.char)!.advance;
    assert.ok(cur.x >= prev.x + advance - 1e-9, `${prev.char} y ${cur.char} se pisan`);
  }
  assert.ok(box.width > 0 && box.width < 10, "el ancho es plausible en unidades de em");
});

test("el paso completo produce un morph muestreable en cualquier instante", () => {
  resetIds();
  const eq = equation(op("+", [sym("x", "X"), num(5, "FIVE")], "SUM"), num(12, "TWELVE"), "EQ");
  const step = applyBothSides(eq, "-", 5, "x");
  const plan = planMorph(layoutEquation(eq, metrics), layoutEquation(step.next, metrics), step.trace);

  for (let t = 0; t <= 1.0001; t += 0.05) {
    const frame = sampleMorph(plan, t, smooth);
    for (const f of frame) {
      assert.ok(Number.isFinite(f.x) && Number.isFinite(f.y), `posición inválida en t=${t}`);
      assert.ok(f.opacity >= -1e-9 && f.opacity <= 1 + 1e-9, `opacidad fuera de rango en t=${t}`);
      assert.ok(getGlyph(f.char), `el glifo ${f.char} no está en el atlas`);
    }
  }
});

test("la x llega al lugar donde la composición final la puso", () => {
  resetIds();
  const eq = equation(op("+", [sym("x", "X"), num(5, "FIVE")], "SUM"), num(12, "TWELVE"), "EQ");
  const step = applyBothSides(eq, "-", 5, "x");
  const after = layoutEquation(step.next, metrics);
  const plan = planMorph(layoutEquation(eq, metrics), after, step.trace);
  const destino = after.glyphs.find((g) => g.char === "x")!;
  const final = sampleMorph(plan, 1, smooth).find((f) => f.char === "x")!;
  assert.ok(Math.abs(final.x - destino.x) < 1e-9, "la x tiene que aterrizar donde la composición dice");
});

test("el 7 nace exactamente donde el 12 terminó de moverse", () => {
  resetIds();
  const eq = equation(op("+", [sym("x", "X"), num(5, "FIVE")], "SUM"), num(12, "TWELVE"), "EQ");
  const step = applyBothSides(eq, "-", 5, "x");
  const before = layoutEquation(eq, metrics);
  const plan = planMorph(before, layoutEquation(step.next, metrics), step.trace);
  const doce = plan.steps.filter((s) => s.nodeId === "TWELVE");
  const siete = plan.steps.find((s) => s.char === "7")!;
  // Los dos glifos del 12 convergen al mismo destino, que es donde aparece el 7.
  for (const d of doce) {
    assert.ok(Math.abs(d.to.x - siete.to.x) < 0.6, "el 12 viaja hacia donde nace el 7");
  }
});
