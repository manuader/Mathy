import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MIS_ENDPOINT,
  MIS_ORDER,
  TRACK,
  UNDO_LEVELS,
  distanceBetween,
  generateUndo,
  jams,
  opens,
  returnTo,
  undoLevelByNumber,
  type UndoLevel,
} from "../src/index.ts";

const seeds = (n: number): number[] => Array.from({ length: n }, (_, i) => i);

// --- Los niveles -------------------------------------------------------------

test("los siete niveles del diseño están, en orden y sin repetir", () => {
  assert.equal(UNDO_LEVELS.length, 7);
  assert.deepEqual(UNDO_LEVELS.map((l) => l.n), [1, 2, 3, 4, 5, 6, 7]);
});

test("cada nivel cambia la capa o endurece parámetros, nunca las dos cosas", () => {
  for (let i = 1; i < UNDO_LEVELS.length; i++) {
    const prev = UNDO_LEVELS[i - 1] as UndoLevel;
    const cur = UNDO_LEVELS[i] as UndoLevel;
    const cambioCapa = prev.layer !== cur.layer;
    const cambioParams = JSON.stringify(prev.params) !== JSON.stringify(cur.params);
    assert.ok(
      !(cambioCapa && cambioParams),
      `el nivel ${cur.n} cambia la capa y los parámetros a la vez`,
    );
  }
});

test("las capas y los verbos son los que declara el minijuego", () => {
  assert.deepEqual(
    UNDO_LEVELS.map((l) => l.layer),
    ["concrete", "concrete", "concrete", "visual", "symbolic", "symbolic", "visual"],
  );
  assert.deepEqual(
    UNDO_LEVELS.map((l) => l.evidence.join("+")),
    ["manipulate", "recognize", "explain", "apply", "manipulate+apply", "apply", "generalize"],
  );
});

test("el rango de pasos nunca se achica al avanzar de nivel", () => {
  for (let i = 1; i < UNDO_LEVELS.length; i++) {
    const prev = (UNDO_LEVELS[i - 1] as UndoLevel).params;
    const cur = (UNDO_LEVELS[i] as UndoLevel).params;
    assert.ok(cur.step[1] >= prev.step[1], `el nivel ${i + 1} achica el tramo`);
  }
});

test("el cero, la vuelta entera y el minuendo tapado llegan recién en el nivel 6", () => {
  for (const l of UNDO_LEVELS) {
    const tarde = l.n >= 6;
    assert.equal(l.params.allowZero, tarde, `nivel ${l.n}`);
    assert.equal(l.params.allowFullReturn, tarde, `nivel ${l.n}`);
    assert.equal(l.params.unknown === "minuend", tarde, `nivel ${l.n}`);
  }
});

test("la llave se distingue por forma solo en el primer nivel", () => {
  assert.equal((undoLevelByNumber(1) as UndoLevel).labeled, false);
  for (const l of UNDO_LEVELS.slice(1)) assert.ok(l.labeled, `nivel ${l.n}`);
});

test("la regla plegable aparece con los dos caminantes y no antes", () => {
  for (const l of UNDO_LEVELS) assert.equal(l.ruler, l.n >= 4 && l.n <= 6, `nivel ${l.n}`);
});

// --- El invariante -----------------------------------------------------------

test("el cofre abre con una sola llave: la que mide lo mismo que la ida", () => {
  for (let home = 0; home <= 8; home++) {
    for (let step = 0; step <= 8; step++) {
      const landing = home + step;
      for (let teeth = 0; teeth <= 14; teeth++) {
        assert.equal(
          opens(home, landing, teeth),
          teeth === step,
          `cofre en ${home}, caminante en ${landing}, llave de ${teeth}`,
        );
      }
    }
  }
});

test("la llave sin dientes no mueve al caminante", () => {
  for (let at = 0; at <= 10; at++) assert.equal(returnTo(at, 0), at);
});

test("volver tantos pasos como se avanzó desde el cero deja al caminante en el cero", () => {
  for (let step = 1; step <= 10; step++) assert.equal(returnTo(step, step), 0);
});

test("volver más de lo que hay traba la manivela y deja al caminante en la orilla", () => {
  for (let at = 0; at <= 10; at++) {
    for (let teeth = 0; teeth <= 20; teeth++) {
      assert.equal(jams(at, teeth), teeth > at, `desde ${at} con ${teeth} dientes`);
      assert.ok(returnTo(at, teeth) >= 0, "el caminante se fue de la pista");
      if (jams(at, teeth)) assert.equal(returnTo(at, teeth), 0);
    }
  }
});

test("la resta dice la distancia y no depende de por dónde se la recorra", () => {
  for (let a = 0; a <= 10; a++) {
    for (let b = 0; b <= 10; b++) {
      assert.equal(distanceBetween(a, b), distanceBetween(b, a));
      if (b >= a) assert.equal(distanceBetween(a, b), b - a);
    }
  }
});

// --- El generador ------------------------------------------------------------

test("la misma semilla da siempre la misma instancia", () => {
  for (const level of UNDO_LEVELS) {
    for (const seed of seeds(12)) {
      assert.deepEqual(generateUndo(level, seed), generateUndo(level, seed));
    }
  }
});

test("el caminante siempre queda a un tramo del cofre, dentro de la pista", () => {
  for (const level of UNDO_LEVELS) {
    for (const seed of seeds(60)) {
      const p = generateUndo(level, seed);
      assert.equal(p.landing, p.home + p.step, `nivel ${level.n} semilla ${seed}`);
      assert.ok(p.home >= 0, `nivel ${level.n} semilla ${seed}: cofre en ${p.home}`);
      assert.ok(p.step >= 0, `nivel ${level.n} semilla ${seed}: tramo ${p.step}`);
      // Hasta el nivel 5 la pista dibujada tiene que alcanzar para el viaje.
      if (level.n < 6) {
        assert.ok(p.landing < TRACK, `nivel ${level.n} semilla ${seed}: llegada ${p.landing}`);
      }
    }
  }
});

test("sin permiso no hay llave sin dientes ni vuelta entera", () => {
  for (const level of UNDO_LEVELS) {
    if (level.params.allowZero && level.params.allowFullReturn) continue;
    for (const seed of seeds(60)) {
      const p = generateUndo(level, seed);
      if (!level.params.allowZero) assert.ok(p.step > 0, `nivel ${level.n} semilla ${seed}`);
      assert.ok(p.home > 0, `nivel ${level.n} semilla ${seed}: el cofre quedó en la orilla`);
    }
  }
});

test("los dos casos especiales aparecen cuando el nivel los habilita", () => {
  const level = undoLevelByNumber(6) as UndoLevel;
  const cero = seeds(60).some((s) => generateUndo(level, s).step === 0);
  const entera = seeds(60).some((s) => generateUndo(level, s).home === 0);
  assert.ok(cero, "nunca salió la llave sin dientes");
  assert.ok(entera, "nunca salió la vuelta entera hasta la orilla");
});

// --- El llavero --------------------------------------------------------------

test("el llavero tiene una sola llave que abre, y son todas distintas", () => {
  for (const level of UNDO_LEVELS) {
    for (const seed of seeds(60)) {
      const p = generateUndo(level, seed);
      const correctas = p.keys.filter((k) => k.correct);
      assert.equal(correctas.length, 1, `nivel ${level.n} semilla ${seed}`);
      assert.equal((correctas[0] as { teeth: number }).teeth, p.step);
      assert.equal(p.keys.length, level.params.keyRing, `nivel ${level.n} semilla ${seed}`);
      const dientes = new Set(p.keys.map((k) => k.teeth));
      assert.equal(dientes.size, p.keys.length, `nivel ${level.n} semilla ${seed}: llaves repetidas`);
      for (const k of p.keys) assert.ok(k.teeth >= 0, "una llave con dientes negativos");
    }
  }
});

test("ninguna llave equivocada abre el cofre", () => {
  for (const level of UNDO_LEVELS) {
    for (const seed of seeds(40)) {
      const p = generateUndo(level, seed);
      for (const k of p.keys) {
        assert.equal(opens(p.home, p.landing, k.teeth), k.correct, `nivel ${level.n} llave ${k.id}`);
      }
    }
  }
});

test("la llave del numeral de llegada es la única del llavero que clasifica un error", () => {
  for (const level of UNDO_LEVELS) {
    for (const seed of seeds(40)) {
      for (const k of generateUndo(level, seed).keys) {
        if (k.lure === "endpoint") assert.equal(k.misconception, MIS_ENDPOINT);
        else assert.equal(k.misconception, undefined, `la llave ${k.lure} inventó un error`);
      }
    }
  }
});

// --- Las dos caras y el renglón ----------------------------------------------

test("el renglón siempre se cumple, escriba la vuelta o la distancia", () => {
  for (const level of UNDO_LEVELS) {
    for (const seed of seeds(60)) {
      const { row } = generateUndo(level, seed);
      assert.equal(
        row.minuend - row.subtrahend,
        row.result,
        `nivel ${level.n} semilla ${seed}: ${row.minuend} − ${row.subtrahend} = ${row.result}`,
      );
      assert.ok(row.result >= 0, "el renglón dejó al caminante sin piedras");
    }
  }
});

test("las dos caras usan los mismos tres números con los papeles cambiados", () => {
  for (const level of UNDO_LEVELS) {
    for (const seed of seeds(40)) {
      const p = generateUndo(level, seed);
      assert.equal(p.row.minuend, p.landing, `nivel ${level.n} semilla ${seed}`);
      if (p.row.face === "undo") {
        assert.equal(p.row.subtrahend, p.step);
        assert.equal(p.row.result, p.home);
      } else {
        assert.equal(p.row.subtrahend, p.home);
        assert.equal(p.row.result, p.step);
      }
    }
  }
});

test("el nivel que mide escribe siempre la cara de la distancia", () => {
  const level = undoLevelByNumber(4) as UndoLevel;
  for (const seed of seeds(40)) {
    const p = generateUndo(level, seed);
    assert.equal(p.row.face, "distance");
    assert.deepEqual(p.marks, [p.home, p.landing]);
    assert.equal(distanceBetween(p.home, p.landing), p.row.result);
  }
});

test("el nivel del renglón mezcla las dos caras", () => {
  const level = undoLevelByNumber(5) as UndoLevel;
  const caras = new Set(seeds(40).map((s) => generateUndo(level, s).row.face));
  assert.deepEqual([...caras].sort(), ["distance", "undo"]);
});

// --- El cajón ----------------------------------------------------------------

test("el cajón trae una sola ficha correcta y ninguna repetida", () => {
  for (const level of UNDO_LEVELS) {
    for (const seed of seeds(60)) {
      const p = generateUndo(level, seed);
      const esperada = p.row.hidden === "minuend" ? p.row.minuend : p.row.result;
      const correctas = p.tiles.filter((t) => t.correct);
      assert.equal(correctas.length, 1, `nivel ${level.n} semilla ${seed}`);
      assert.equal((correctas[0] as { value: number }).value, esperada);
      const valores = new Set(p.tiles.map((t) => t.value));
      assert.equal(valores.size, p.tiles.length, `nivel ${level.n} semilla ${seed}`);
      for (const t of p.tiles) assert.ok(t.value >= 0, "una ficha con numeral negativo");
    }
  }
});

test("las fichas equivocadas solo nombran errores que el catálogo apunta a este nodo", () => {
  const catalogados = new Set([MIS_ENDPOINT, MIS_ORDER, undefined]);
  for (const level of UNDO_LEVELS) {
    for (const seed of seeds(40)) {
      for (const t of generateUndo(level, seed).tiles) {
        assert.ok(catalogados.has(t.misconception), `error inventado: ${t.misconception}`);
        if (t.misconception !== undefined) assert.equal(t.correct, false);
      }
    }
  }
});

test("con el minuendo tapado el cajón ofrece la resta al revés", () => {
  const level = undoLevelByNumber(6) as UndoLevel;
  const visto = seeds(60).some((s) =>
    generateUndo(level, s).tiles.some((t) => t.misconception === MIS_ORDER),
  );
  assert.ok(visto, "nunca apareció la ficha de la resta al revés");
});

// --- Los dos regresos de `explain` -------------------------------------------

test("el regreso honesto pisa el cofre y el que miente se pasa", () => {
  const level = undoLevelByNumber(3) as UndoLevel;
  for (const seed of seeds(60)) {
    const p = generateUndo(level, seed);
    assert.equal(p.returns.length, 2, `semilla ${seed}`);
    const honesto = p.returns[1 - p.liar] as readonly number[];
    const miente = p.returns[p.liar] as readonly number[];
    assert.equal(honesto[0], p.landing);
    assert.equal(honesto[honesto.length - 1], p.home, `semilla ${seed}: el honesto no pisó el cofre`);
    assert.equal(miente[miente.length - 1], p.home - 1, `semilla ${seed}`);
    // Con el cofre en la orilla las dos animaciones terminarían en el mismo
    // lugar y el ítem no diría nada: por eso el cofre nunca está en el `0`.
    assert.notDeepEqual([...honesto], [...miente], `semilla ${seed}`);
    for (const pos of [...honesto, ...miente]) assert.ok(pos >= 0, "alguien se cayó de la pista");
  }
});

test("el que se pasa no está siempre en la misma fila", () => {
  const level = undoLevelByNumber(3) as UndoLevel;
  const filas = new Set(seeds(40).map((s) => generateUndo(level, s).liar));
  assert.deepEqual([...filas].sort(), [0, 1]);
});

// --- Las cerraduras que no son pasos -----------------------------------------

test("solo el último nivel trae cerraduras arbitrarias", () => {
  for (const level of UNDO_LEVELS) {
    for (const seed of seeds(20)) {
      const p = generateUndo(level, seed);
      if (level.mode === "unlock") assert.ok(p.actions.length > 0, `nivel ${level.n}`);
      else assert.equal(p.actions.length, 0, `nivel ${level.n}`);
    }
  }
});

test("cada cerradura arbitraria tiene una sola llave que la deshace y una acción sin vuelta", () => {
  const level = undoLevelByNumber(7) as UndoLevel;
  for (const seed of seeds(60)) {
    const p = generateUndo(level, seed);
    assert.equal(p.actions.length, level.params.keyRing, `semilla ${seed}`);
    assert.equal(p.actions.filter((a) => a.correct).length, 1, `semilla ${seed}`);
    assert.equal(p.actions.filter((a) => a.uninvertible).length, 1, `semilla ${seed}`);
    const llave = p.actions.find((a) => a.correct) as { kind: string; value: number };
    const esperada =
      p.lock.kind === "forward" ? "back" : p.lock.kind === "back" ? "forward" : p.lock.kind;
    assert.equal(llave.kind, esperada, `semilla ${seed}`);
    // Deshacer un tramo es volver el mismo tramo: los dientes tienen que medir igual.
    if (p.lock.value > 0) assert.equal(llave.value, p.lock.value, `semilla ${seed}`);
    assert.ok(p.actions.every((a) => !a.uninvertible || !a.correct));
  }
});

test("las dos clases de cerradura aparecen: las que son pasos y las que no", () => {
  const level = undoLevelByNumber(7) as UndoLevel;
  const clases = new Set(seeds(40).map((s) => generateUndo(level, s).lock.kind));
  assert.ok(clases.has("forward") || clases.has("back"), "nunca salió una cerradura de pasos");
  assert.ok(
    ["turn", "hat", "color"].some((k) => clases.has(k as never)),
    "nunca salió una cerradura que no es un tramo",
  );
});
