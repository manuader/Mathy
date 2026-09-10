import { test } from "node:test";
import assert from "node:assert/strict";
import { atlas, getGlyph } from "../src/index.ts";

/** El juego de caracteres del primer hito. */
const CHARSET = [
  ..."0123456789",
  ..."xyabnfg",
  "+",
  "−",
  "×",
  "÷",
  "=",
  "(",
  ")",
  ".",
];

const DIGITS = [..."0123456789"];

test("están todos los caracteres del juego", () => {
  for (const char of CHARSET) {
    assert.ok(getGlyph(char), `falta el glifo de ${JSON.stringify(char)}`);
  }
  assert.equal(Object.keys(atlas).length, CHARSET.length);
});

test("cada glifo tiene contorno y arranca con un movimiento", () => {
  for (const char of CHARSET) {
    const g = getGlyph(char)!;
    assert.ok(g.path.length > 0, `${char} sin contorno`);
    assert.match(g.path, /^[Mm]/, `${char} no empieza con un comando de movimiento`);
  }
});

test("los avances son positivos", () => {
  for (const char of CHARSET) {
    const g = getGlyph(char)!;
    assert.ok(g.advance > 0, `${char} tiene avance ${g.advance}`);
  }
});

test("la clave y el char del glifo coinciden", () => {
  for (const [key, g] of Object.entries(atlas)) {
    assert.equal(g.char, key);
  }
});

test("la caja de tinta está bien orientada y entra en el avance", () => {
  for (const char of CHARSET) {
    const g = getGlyph(char)!;
    assert.ok(g.left < g.right, `${char} tiene la caja al revés en X`);
    assert.ok(g.top < g.bottom, `${char} tiene la caja al revés en Y`);
    assert.ok(g.left >= 0, `${char} se sale del avance por izquierda`);
    assert.ok(g.right <= g.advance + 1e-6, `${char} se sale del avance por derecha`);
  }
});

test("la x y el 0 tienen alturas plausibles y distintas", () => {
  const x = getGlyph("x")!;
  const zero = getGlyph("0")!;
  const altura = (g: { top: number; bottom: number }): number => g.bottom - g.top;
  // La x es una minúscula sin ascendente y el 0 tiene altura de versal: los dos
  // andan entre media línea y una línea completa, pero el 0 es más alto.
  assert.ok(altura(x) > 0.3 && altura(x) < 0.7, `altura de la x: ${altura(x)}`);
  assert.ok(altura(zero) > 0.5 && altura(zero) < 1, `altura del 0: ${altura(zero)}`);
  assert.ok(altura(zero) > altura(x), "el 0 tiene que ser más alto que la x");
});

test("la y baja de la línea de base y la x no", () => {
  const y = getGlyph("y")!;
  const x = getGlyph("x")!;
  // Con el eje Y hacia abajo, bajar de la línea de base es `bottom` positivo.
  assert.ok(y.bottom > 0.1, `la y tendría que tener descendente, y bottom=${y.bottom}`);
  assert.ok(x.bottom < 0.05, `la x no tendría que tener descendente, y bottom=${x.bottom}`);
  // Y estar sobre la línea de base es `top` negativo, para las dos.
  assert.ok(y.top < 0 && x.top < 0, "el techo de la tinta tiene que ser negativo");
});

test("los dígitos son de ancho tabular", () => {
  const anchos = new Set(DIGITS.map((d) => getGlyph(d)!.advance));
  assert.equal(anchos.size, 1, `los dígitos tienen avances distintos: ${[...anchos].join(", ")}`);
});

test("getGlyph devuelve undefined para lo que no está horneado", () => {
  assert.equal(getGlyph("ζ"), undefined);
  assert.equal(getGlyph(""), undefined);
});
