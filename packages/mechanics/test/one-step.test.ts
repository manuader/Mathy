import { test } from "node:test";
import assert from "node:assert/strict";
import { applyBothSides, equationToText, isSolved, evaluate } from "@mathy/math-core";
import { LEVELS, generateOneStep, levelByNumber, makeRandom } from "../src/index.ts";

test("los ocho niveles del diseño están, en orden y sin repetir", () => {
  assert.equal(LEVELS.length, 8);
  assert.deepEqual(LEVELS.map((l) => l.n), [1, 2, 3, 4, 5, 6, 7, 8]);
});

test("cada nivel cambia la capa o endurece parámetros, nunca las dos cosas", () => {
  for (let i = 1; i < LEVELS.length; i++) {
    const prev = LEVELS[i - 1]!;
    const cur = LEVELS[i]!;
    const cambioCapa = prev.layer !== cur.layer;
    const cambioParams = JSON.stringify(prev.params) !== JSON.stringify(cur.params);
    assert.ok(
      !(cambioCapa && cambioParams),
      `el nivel ${cur.n} cambia la capa y los parámetros a la vez`,
    );
  }
});

test("la llave correcta despeja la incógnita, en todos los niveles", () => {
  for (const level of LEVELS) {
    for (let seed = 0; seed < 40; seed++) {
      const p = generateOneStep(level, seed);
      const key = p.keys.find((k) => k.correct)!;
      const r = applyBothSides(p.equation, key.op, key.value, p.unknown);
      assert.ok(r.valid, `nivel ${level.n} semilla ${seed}: el paso no es válido`);
      assert.ok(
        isSolved(r.next, p.unknown),
        `nivel ${level.n} semilla ${seed}: ${equationToText(p.equation)} no quedó despejada, dio ${equationToText(r.next)}`,
      );
    }
  }
});

test("la solución que declara el problema es la que sale de resolverlo", () => {
  for (const level of LEVELS) {
    for (let seed = 0; seed < 30; seed++) {
      const p = generateOneStep(level, seed);
      const key = p.keys.find((k) => k.correct)!;
      const r = applyBothSides(p.equation, key.op, key.value, p.unknown);
      const lado = r.next.lhs.kind === "sym" ? r.next.rhs : r.next.lhs;
      assert.equal(
        evaluate(lado),
        p.solution,
        `nivel ${level.n} semilla ${seed}: ${equationToText(p.equation)}`,
      );
    }
  }
});

test("la llave correcta es la inversa de la cerradura", () => {
  const pares: Record<string, string> = { "+": "-", "-": "+", "*": "/", "/": "*" };
  for (const level of LEVELS) {
    for (let seed = 0; seed < 20; seed++) {
      const p = generateOneStep(level, seed);
      const key = p.keys.find((k) => k.correct)!;
      assert.equal(key.op, pares[p.lock.op]);
      assert.equal(key.value, p.lock.value);
    }
  }
});

test("el llavero tiene exactamente una llave correcta y el tamaño que pide el nivel", () => {
  for (const level of LEVELS) {
    for (let seed = 0; seed < 20; seed++) {
      const p = generateOneStep(level, seed);
      assert.equal(p.keys.filter((k) => k.correct).length, 1);
      assert.equal(p.keys.length, level.params.keyCount);
    }
  }
});

test("las llaves equivocadas son los errores del catálogo, no ruido", () => {
  const p = generateOneStep(levelByNumber(2)!, 7);
  for (const k of p.keys.filter((k) => !k.correct)) {
    assert.ok(k.lure, `la llave ${k.op}${k.value} no dice qué error representa`);
  }
  assert.ok(
    p.keys.some((k) => k.lure === "wrong_inverse_choice"),
    "el llavero tiene que ofrecer la misma operación en vez de la inversa",
  );
});

test("el nivel 1 solo usa sumar y restar; el 2 agrega multiplicar y dividir", () => {
  const l1 = new Set<string>();
  const l2 = new Set<string>();
  for (let s = 0; s < 60; s++) {
    l1.add(generateOneStep(levelByNumber(1)!, s).lock.op);
    l2.add(generateOneStep(levelByNumber(2)!, s).lock.op);
  }
  assert.deepEqual([...l1].sort(), ["+", "-"]);
  assert.ok(l2.has("*") && l2.has("/"), "el nivel 2 tiene que traer las cuatro cerraduras");
});

test("los negativos aparecen recién en el nivel 6", () => {
  const conNegativos = (n: number) => {
    for (let s = 0; s < 80; s++) if (generateOneStep(levelByNumber(n)!, s).solution < 0) return true;
    return false;
  };
  assert.equal(conNegativos(5), false, "hasta el 5 no hay soluciones negativas");
  assert.equal(conNegativos(6), true, "el 6 las introduce");
});

test("la incógnita se corre a la derecha recién en el nivel 7", () => {
  const aLaDerecha = (n: number) => {
    for (let s = 0; s < 40; s++) {
      const p = generateOneStep(levelByNumber(n)!, s);
      if (p.equation.rhs.kind === "op") return true;
    }
    return false;
  };
  assert.equal(aLaDerecha(6), false);
  assert.equal(aLaDerecha(7), true);
});

test("la misma semilla da el mismo problema", () => {
  const a = generateOneStep(levelByNumber(4)!, 123);
  const b = generateOneStep(levelByNumber(4)!, 123);
  assert.equal(equationToText(a.equation), equationToText(b.equation));
  assert.deepEqual(a.keys.map((k) => `${k.op}${k.value}`), b.keys.map((k) => `${k.op}${k.value}`));
});

test("semillas distintas dan problemas distintos", () => {
  const vistos = new Set<string>();
  for (let s = 0; s < 30; s++) vistos.add(equationToText(generateOneStep(levelByNumber(4)!, s).equation));
  assert.ok(vistos.size > 15, `poca variedad: solo ${vistos.size} problemas distintos en 30 semillas`);
});

test("el generador con semilla es reproducible", () => {
  const a = makeRandom(9);
  const b = makeRandom(9);
  for (let i = 0; i < 20; i++) assert.equal(a.int(0, 1000), b.int(0, 1000));
});
