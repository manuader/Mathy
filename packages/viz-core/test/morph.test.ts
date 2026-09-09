import { test } from "node:test";
import assert from "node:assert/strict";
import { applyBothSides, equation, num, op, resetIds, sym } from "@mathy/math-core";
import { layoutEquation, type GlyphMetrics } from "@mathy/typeset";
import { planMorph, sampleMorph, smooth, linear, rateFunctions } from "../src/index.ts";

const metrics = (): GlyphMetrics => ({ advance: 1, top: -0.7, bottom: 0 });

/** El paso de calibración: x + 5 = 12, se resta 5, queda x = 7. */
function calibration() {
  resetIds();
  const eq = equation(op("+", [sym("x", "X"), num(5, "FIVE")], "SUM"), num(12, "TWELVE"), "EQ");
  const step = applyBothSides(eq, "-", 5, "x");
  const before = layoutEquation(eq, metrics);
  const after = layoutEquation(step.next, metrics);
  return { plan: planMorph(before, after, step.trace), before, after };
}

test("la x se traslada: no nace ni muere", () => {
  const { plan } = calibration();
  const x = plan.steps.find((s) => s.char === "x")!;
  assert.equal(x.fate.kind, "move");
  assert.equal(x.from.opacity, 1);
  assert.equal(x.to.opacity, 1);
});

test("el 5 se aniquila contra su pareja", () => {
  const { plan } = calibration();
  const cinco = plan.steps.find((s) => s.nodeId === "FIVE")!;
  assert.equal(cinco.fate.kind, "annihilate");
  assert.equal(cinco.to.opacity, 0);
});

test("el 12 se funde y el 7 aparece donde llegó", () => {
  const { plan } = calibration();
  const doce = plan.steps.filter((s) => s.nodeId === "TWELVE");
  assert.equal(doce.length, 2, "el 12 son dos glifos");
  assert.ok(doce.every((s) => s.fate.kind === "mergeInto"));
  const siete = plan.steps.find((s) => s.fate.kind === "mergeResult")!;
  assert.equal(siete.char, "7");
  assert.equal(siete.from.opacity, 0);
  assert.equal(siete.to.opacity, 1);
});

test("todo glifo del estado final está en el plan", () => {
  const { plan, after } = calibration();
  const enPlan = new Set(plan.steps.filter((s) => s.to.opacity > 0).map((s) => s.char + s.nodeId));
  for (const g of after.glyphs) {
    assert.ok(enPlan.has(g.char + g.nodeId), `falta ${g.char} de ${g.nodeId} en el plan`);
  }
});

test("en t=0 se ve exactamente el estado inicial", () => {
  const { plan, before } = calibration();
  const frame = sampleMorph(plan, 0, linear).filter((f) => f.opacity > 0.001);
  assert.equal(frame.length, before.glyphs.length);
  const chars = frame.map((f) => f.char).sort().join("");
  assert.equal(chars, before.glyphs.map((g) => g.char).sort().join(""));
});

test("en t=1 se ve exactamente el estado final", () => {
  const { plan, after } = calibration();
  const frame = sampleMorph(plan, 1, linear).filter((f) => f.opacity > 0.001);
  assert.equal(frame.map((f) => f.char).sort().join(""), after.glyphs.map((g) => g.char).sort().join(""));
});

test("lo que entra no se encima con lo que sale", () => {
  const { plan } = calibration();
  // A la mitad, lo que se apaga ya se fue y lo que se enciende todavía no llegó.
  const frame = sampleMorph(plan, 0.5, linear);
  const siete = frame.find((f) => f.char === "7")!;
  const doce = frame.filter((f) => f.char === "1" || f.char === "2");
  assert.ok(siete.opacity < 0.01, "el 7 todavía no se ve a la mitad");
  assert.ok(doce.every((f) => f.opacity < 0.01), "y el 12 ya se apagó");
});

test("el suavizado arranca y termina quieto, como en Manim", () => {
  assert.equal(smooth(0), 0);
  assert.equal(smooth(1), 1);
  assert.ok(Math.abs(smooth(0.5) - 0.5) < 1e-9, "es simétrico");
  const d0 = smooth(0.001) - smooth(0);
  const dMid = smooth(0.501) - smooth(0.5);
  assert.ok(d0 < dMid / 10, "sale muy despacio");
});

test("las funciones de suavizado quedan en el rango", () => {
  for (const [name, fn] of Object.entries(rateFunctions)) {
    for (let t = 0; t <= 1.0001; t += 0.05) {
      const v = fn(t);
      assert.ok(Number.isFinite(v), `${name} devolvió algo que no es un número en t=${t}`);
    }
    assert.ok(Math.abs(fn(0)) < 1e-9 || name === "wiggle", `${name} debería arrancar en 0`);
  }
});
