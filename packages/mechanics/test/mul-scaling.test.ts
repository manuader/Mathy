import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MUL_LEVELS,
  MUL_MISCONCEPTION,
  MUL_OPTION_SLOTS,
  MUL_ROW_SLOTS,
  NODE_MUL_SCALING,
  TOTAL_MUL_LEVELS,
  factorValue,
  generateMulScaling,
  isNodeOpen,
  misconceptionFor,
  mulLevelByNumber,
  nodeById,
  type MulLevel,
  type MulProblem,
} from "../src/index.ts";

const seeds = (n: number): number[] => Array.from({ length: n }, (_, i) => i * 37 + 1);

/** Todas las rondas de un nivel, para todas las semillas de la muestra. */
function rounds(level: MulLevel, n = 24): MulProblem[] {
  const out: MulProblem[] = [];
  for (const seed of seeds(n)) {
    for (let r = 0; r < level.rounds; r++) out.push(generateMulScaling(level, seed + r, r));
  }
  return out;
}

// --- Los niveles como datos --------------------------------------------------

test("los ocho niveles del diseño están, en orden y sin repetir", () => {
  assert.equal(MUL_LEVELS.length, 8);
  assert.equal(TOTAL_MUL_LEVELS, 8);
  assert.deepEqual(MUL_LEVELS.map((l) => l.n), [1, 2, 3, 4, 5, 6, 7, 8]);
});

test("cada nivel cambia la capa o endurece parámetros, nunca las dos cosas", () => {
  for (let i = 1; i < MUL_LEVELS.length; i++) {
    const prev = MUL_LEVELS[i - 1] as MulLevel;
    const cur = MUL_LEVELS[i] as MulLevel;
    const cambioCapa = prev.layer !== cur.layer;
    const cambioParams = JSON.stringify(prev.params) !== JSON.stringify(cur.params);
    assert.ok(
      !(cambioCapa && cambioParams),
      `el nivel ${cur.n} cambia la capa y los parámetros a la vez`,
    );
  }
});

test("los parámetros nunca se ablandan al avanzar de nivel", () => {
  for (let i = 1; i < MUL_LEVELS.length; i++) {
    const prev = (MUL_LEVELS[i - 1] as MulLevel).params;
    const cur = (MUL_LEVELS[i] as MulLevel).params;
    assert.ok(cur.a[1] >= prev.a[1], `el nivel ${i + 1} achica el primer factor`);
    assert.ok(cur.b[1] >= prev.b[1], `el nivel ${i + 1} achica el segundo factor`);
    assert.ok(
      cur.special.length >= prev.special.length,
      `el nivel ${i + 1} saca factores que no agrandan`,
    );
  }
});

test("los factores que no agrandan aparecen recién en el nivel 7", () => {
  for (const l of MUL_LEVELS) {
    if (l.n < 7) assert.equal(l.params.special.length, 0, `el nivel ${l.n} los adelanta`);
    else assert.ok(l.params.special.length > 0, `el nivel ${l.n} debería traerlos`);
  }
});

test("el piso se retira antes que la banda", () => {
  // El diseño lo pide en ese orden: las baldosas compiten con la expresión y no
  // soportan el nivel siguiente; la banda se queda porque sostiene las fracciones.
  const primerPisoADemanda = MUL_LEVELS.find((l) => l.floorOnDemand)?.n ?? 99;
  const primeraBandaSinNumeros = MUL_LEVELS.find((l) => l.bandSkin === "drawings")?.n ?? 99;
  assert.ok(primerPisoADemanda < primeraBandaSinNumeros);
});

test("el corte del piso no existe hasta el nivel 5", () => {
  for (const l of MUL_LEVELS) {
    if (l.n <= 4) assert.equal(l.cut, 0, `el nivel ${l.n} deja cortar el piso antes de tiempo`);
  }
});

test("la manivela es la entrada y no vuelve a aparecer", () => {
  assert.deepEqual(MUL_LEVELS.filter((l) => l.gears).map((l) => l.n), [1]);
});

test("el nodo recorre las tres capas y termina fuera de los símbolos", () => {
  const capas = new Set(MUL_LEVELS.map((l) => l.layer));
  assert.deepEqual([...capas].sort(), ["concrete", "symbolic", "visual"]);
  assert.equal((MUL_LEVELS[7] as MulLevel).layer, "visual");
});

test("los cinco verbos que el diseño pide tienen al menos un nivel", () => {
  const verbos = new Set(MUL_LEVELS.flatMap((l) => l.evidence));
  for (const v of ["recognize", "explain", "manipulate", "apply", "generalize"]) {
    assert.ok(verbos.has(v as never), `ningún nivel da evidencia de ${v}`);
  }
});

test("se puede pedir un nivel por su número", () => {
  assert.equal(mulLevelByNumber(5)?.titleKey, "level.keysAndCross");
  assert.equal(mulLevelByNumber(99), undefined);
});

// --- El registro -------------------------------------------------------------

test("el nodo queda anotado en el quinto lugar de la espina, detrás del desplazamiento", () => {
  const spec = nodeById(NODE_MUL_SCALING);
  assert.ok(spec);
  assert.equal(spec.n, 5);
  assert.deepEqual(spec.prereqs, ["arith.add.displacement"]);
  assert.equal(spec.levels.length, 8);
});

test("el nodo se abre cuando el desplazamiento quedó terminado", () => {
  assert.equal(isNodeOpen(NODE_MUL_SCALING, { "arith.add.displacement": 99 }), true);
});

// --- El generador ------------------------------------------------------------

test("la misma semilla y la misma ronda dan siempre el mismo problema", () => {
  for (const level of MUL_LEVELS) {
    for (const seed of seeds(6)) {
      for (let r = 0; r < level.rounds; r++) {
        assert.deepEqual(
          generateMulScaling(level, seed, r),
          generateMulScaling(level, seed, r),
          `el nivel ${level.n} no es reproducible`,
        );
      }
    }
  }
});

test("un nivel con dos preguntas las alterna en vez de sortearlas", () => {
  // Sorteadas, cuatro rondas pueden no dar nunca evidencia de uno de los verbos.
  for (const level of MUL_LEVELS) {
    if (level.asks.length < 2) continue;
    const pedidos = new Set(
      Array.from({ length: level.rounds }, (_, r) => generateMulScaling(level, 7, r).ask),
    );
    assert.deepEqual([...pedidos].sort(), [...level.asks].sort());
  }
});

test("el total es siempre el rectángulo: filas por columnas", () => {
  for (const level of MUL_LEVELS) {
    for (const p of rounds(level, 8)) {
      if (p.ask === "cover" || p.ask === "rotate" || p.ask === "total" || p.ask === "turn") {
        assert.equal(p.product, p.rows * p.cols, `el nivel ${level.n} miente sobre el total`);
      }
    }
  }
});

test("reacomodar no cambia el total: el marco girado pide las mismas baldosas", () => {
  const nivel = mulLevelByNumber(3) as MulLevel;
  for (const p of rounds(nivel, 12)) {
    if (p.ask !== "rotate") continue;
    assert.equal(p.frameRows * p.frameCols, p.product);
    assert.notEqual(p.rows, p.cols, "girar un cuadrado no muestra nada");
    assert.equal(p.frameRows, p.cols);
    assert.equal(p.frameCols, p.rows);
  }
});

test("el montón trae exactamente las filas que cubren el marco, y algunas que no", () => {
  for (const level of MUL_LEVELS) {
    for (const p of rounds(level, 8)) {
      if (p.ask !== "cover") continue;
      const entran = p.tileRows.filter((r) => r.fits);
      assert.equal(entran.length, p.frameRows, `el nivel ${level.n} no trae las filas justas`);
      for (const r of entran) assert.equal(r.cells, p.frameCols);
      for (const r of p.tileRows.filter((x) => !x.fits)) assert.notEqual(r.cells, p.frameCols);
      assert.ok(p.tileRows.length <= MUL_ROW_SLOTS, "no entran en las ranuras montadas");
    }
  }
});

test("estirar por el factor lleva el extremo justo a la marca objetivo", () => {
  for (const level of MUL_LEVELS) {
    for (const p of rounds(level, 12)) {
      if (p.ask === "cover" || p.ask === "rotate" || p.ask === "total") continue;
      assert.equal(
        p.target,
        Math.round(p.rest * factorValue(p.factor)),
        `el nivel ${level.n} pone la ficha donde el estirado no llega`,
      );
      assert.ok(p.length > p.target, "la regla se termina justo en el objetivo");
      assert.ok(Number.isInteger(p.target), "la marca objetivo cayó entre dos marcas");
    }
  }
});

test("el clavo no se mueve: la marca cero va a parar al cero con cualquier factor", () => {
  for (const level of MUL_LEVELS) {
    for (const p of rounds(level, 8)) {
      assert.equal(0 * factorValue(p.factor), 0);
    }
  }
});

test("hasta el nivel 6 ningún factor deja la banda igual ni la aplasta", () => {
  for (const level of MUL_LEVELS) {
    if (level.n > 6) continue;
    for (const p of rounds(level, 12)) {
      assert.ok(factorValue(p.factor) >= 2, `el nivel ${level.n} adelantó el 1 o el 0`);
      assert.equal(p.factor.den, 1, `el nivel ${level.n} adelantó las fracciones`);
    }
  }
});

test("el nivel 7 llega al 1, al 0 y a las fracciones, y la fracción parte la banda entera", () => {
  const nivel = mulLevelByNumber(7) as MulLevel;
  const vistos = new Set<string>();
  for (const p of rounds(nivel, 40)) {
    vistos.add(`${p.factor.num}/${p.factor.den}`);
    assert.equal(p.rest % p.factor.den, 0, "la banda no se puede partir en esas partes");
  }
  assert.ok(vistos.has("1/1"), "nunca apareció el factor 1");
  assert.ok(vistos.has("0/1"), "nunca apareció el factor 0");
  assert.ok(vistos.has("1/2"), "nunca apareció la mitad");
});

test("el factor 0 aplasta la banda contra el clavo", () => {
  const nivel = mulLevelByNumber(7) as MulLevel;
  for (const p of rounds(nivel, 40)) {
    if (factorValue(p.factor) !== 0) continue;
    assert.equal(p.target, 0);
  }
});

test("la regla nunca queda tan larga que haya que contarla en vez de anticiparla", () => {
  for (const level of MUL_LEVELS) {
    for (const p of rounds(level, 12)) {
      // El piso no dibuja regla: sus campos de banda son la lectura equivalente.
      if (p.ask === "cover" || p.ask === "rotate" || p.ask === "total") continue;
      assert.ok(p.length <= 22, `el nivel ${level.n} dibujó una regla de ${p.length} marcas`);
    }
  }
});

// --- Los errores -------------------------------------------------------------

test("darse vuelta dos veces es el único error que clasifica, y clasifica siempre", () => {
  const nivel = mulLevelByNumber(8) as MulLevel;
  let vistas = 0;
  for (const p of rounds(nivel, 24)) {
    if (p.ask !== "flip") continue;
    const espejada = p.options.find((o) => o.value === -p.target);
    if (!espejada) continue;
    vistas++;
    assert.equal(espejada.correct, false);
    assert.equal(misconceptionFor(espejada), MUL_MISCONCEPTION);
  }
  assert.ok(vistas > 0, "el nivel 8 nunca ofreció la marca del lado equivocado");
});

test("sumar los dos factores no clasifica: no tiene entrada en el catálogo", () => {
  const nivel = mulLevelByNumber(6) as MulLevel;
  let vistas = 0;
  for (const p of rounds(nivel, 24)) {
    for (const o of p.options) {
      if (o.lure !== "added_factors") continue;
      vistas++;
      assert.equal(o.value, p.rows + p.cols);
      assert.equal(misconceptionFor(o), undefined);
    }
  }
  assert.ok(vistas > 0, "nunca apareció la ficha que suma los factores");
});

test("siempre hay una sola ficha correcta y ninguna repetida", () => {
  for (const level of MUL_LEVELS) {
    for (const p of rounds(level, 12)) {
      if (p.options.length === 0) continue;
      assert.equal(p.options.filter((o) => o.correct).length, 1, `nivel ${level.n}`);
      const valores = p.options.map((o) => o.value);
      assert.equal(new Set(valores).size, valores.length, `nivel ${level.n}: ficha repetida`);
      assert.ok(p.options.length <= MUL_OPTION_SLOTS, "no entran en las ranuras montadas");
    }
  }
});

test("la ficha correcta del total es el producto y la de la marca es el objetivo", () => {
  for (const level of MUL_LEVELS) {
    for (const p of rounds(level, 12)) {
      const buena = p.options.find((o) => o.correct);
      if (!buena) continue;
      assert.equal(buena.value, p.ask === "total" ? p.product : p.target);
    }
  }
});
