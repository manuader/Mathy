import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DIV_LEVELS,
  DIV_OPTION_SLOTS,
  MIS_DIV_INVERSE,
  MIS_DIV_ORDER,
  NODE_DIV_UNDO_MUL,
  TOTAL_DIV_LEVELS,
  bandAfter,
  divLevelByNumber,
  generateDivUndoMul,
  hiddenSide,
  isNodeOpen,
  misconceptionForDial,
  nodeById,
  opensChest,
  shownSide,
  splitRows,
  type DivLevel,
  type DivProblem,
} from "../src/index.ts";

const seeds = (n: number): number[] => Array.from({ length: n }, (_, i) => i * 37 + 1);

/** Todas las rondas de un nivel, para todas las semillas de la muestra. */
function rounds(level: DivLevel, n = 24): DivProblem[] {
  const out: DivProblem[] = [];
  for (const seed of seeds(n)) {
    for (let r = 0; r < level.rounds; r++) out.push(generateDivUndoMul(level, seed + r, r));
  }
  return out;
}

// --- Los niveles como datos --------------------------------------------------

test("los ocho niveles del diseño están, en orden y sin repetir", () => {
  assert.equal(DIV_LEVELS.length, 8);
  assert.equal(TOTAL_DIV_LEVELS, 8);
  assert.deepEqual(DIV_LEVELS.map((l) => l.n), [1, 2, 3, 4, 5, 6, 7, 8]);
});

test("cada nivel cambia la capa o endurece parámetros, nunca las dos cosas", () => {
  for (let i = 1; i < DIV_LEVELS.length; i++) {
    const prev = DIV_LEVELS[i - 1] as DivLevel;
    const cur = DIV_LEVELS[i] as DivLevel;
    const cambioCapa = prev.layer !== cur.layer;
    const cambioParams = JSON.stringify(prev.params) !== JSON.stringify(cur.params);
    assert.ok(
      !(cambioCapa && cambioParams),
      `el nivel ${cur.n} cambia la capa y los parámetros a la vez`,
    );
  }
});

test("los parámetros nunca se ablandan al avanzar de nivel", () => {
  for (let i = 1; i < DIV_LEVELS.length; i++) {
    const prev = (DIV_LEVELS[i - 1] as DivLevel).params;
    const cur = (DIV_LEVELS[i] as DivLevel).params;
    assert.ok(cur.factor[1] >= prev.factor[1], `el nivel ${i + 1} achica el rango del divisor`);
    assert.ok(
      cur.classes.length >= prev.classes.length,
      `el nivel ${i + 1} saca clases de llave del llavero`,
    );
    assert.ok(!(cur.exact && !prev.exact), `el nivel ${i + 1} vuelve a garantizar división exacta`);
  }
});

test("las capas van de lo concreto a lo formal y ninguna se saltea hacia atrás", () => {
  const orden = ["concrete", "visual", "symbolic", "formal", "abstract"];
  let visto = 0;
  for (const level of DIV_LEVELS) {
    const i = orden.indexOf(level.layer);
    assert.ok(i >= visto, `el nivel ${level.n} retrocede de capa`);
    visto = i;
  }
});

test("el nodo se registra en el sexto lugar de la espina y cuelga de sus dos prerequisitos", () => {
  const spec = nodeById(NODE_DIV_UNDO_MUL);
  assert.ok(spec, "el nodo no quedó registrado");
  assert.equal(spec?.n, 6);
  assert.deepEqual([...(spec?.prereqs ?? [])].sort(), ["arith.mul.scaling", "arith.sub.undo_add"]);
  assert.equal(spec?.levels.length, 8);
});

test("el nodo no se abre hasta terminar los dos prerequisitos", () => {
  assert.equal(isNodeOpen(NODE_DIV_UNDO_MUL, {}), false);
  assert.equal(isNodeOpen(NODE_DIV_UNDO_MUL, { "arith.mul.scaling": 8 }), false);
  assert.equal(
    isNodeOpen(NODE_DIV_UNDO_MUL, { "arith.mul.scaling": 8, "arith.sub.undo_add": 7 }),
    true,
  );
});

test("ningún nivel declara texto visible, solo claves", () => {
  for (const level of DIV_LEVELS) {
    assert.match(level.titleKey, /^level\.[a-zA-Z]+$/);
  }
});

test("los verbos que el nodo ejercita cubren los cinco del diseño", () => {
  const verbos = new Set(DIV_LEVELS.flatMap((l) => [...l.evidence]));
  assert.deepEqual(
    [...verbos].sort(),
    ["apply", "explain", "generalize", "manipulate", "recognize"],
  );
});

// --- El invariante -----------------------------------------------------------

test("solo la llave de encoger con el dial en el estirado devuelve la banda", () => {
  assert.equal(opensChest(3, "shrink", 3), true);
  assert.equal(opensChest(3, "shrink", 2), false);
  assert.equal(opensChest(3, "shrink", 4), false);
  assert.equal(opensChest(3, "cut", 3), false);
  assert.equal(opensChest(3, "stretch", 3), false);
});

test("recortar deja el largo y no toca las separaciones; encoger las divide", () => {
  // La llave de recortar es el error caro del nodo justamente porque el largo
  // que produce puede ser el correcto: lo que no vuelve son las marcas.
  assert.equal(bandAfter(12, "shrink", 3), 4);
  assert.equal(bandAfter(12, "stretch", 3), 36);
  assert.equal(bandAfter(12, "cut", 3), 12);
});

test("encoger por el total aplasta la banda contra el clavo", () => {
  assert.equal(bandAfter(12, "shrink", 12), 1);
});

test("partir el piso conserva las baldosas: filas por lado más el sobrante", () => {
  for (const [total, perRow] of [[12, 3], [13, 3], [20, 6], [7, 2]] as const) {
    const { rows, leftover } = splitRows(total, perRow);
    assert.equal(rows * perRow + leftover, total);
    assert.ok(leftover < perRow, `el sobrante de ${total} entre ${perRow} da otra fila entera`);
  }
});

// --- El generador ------------------------------------------------------------

test("la misma semilla y la misma ronda dan siempre el mismo problema", () => {
  for (const level of DIV_LEVELS) {
    const a = generateDivUndoMul(level, 4242, 1);
    const b = generateDivUndoMul(level, 4242, 1);
    assert.deepEqual(a, b);
  }
});

test("cada nivel recorre sus preguntas en orden y no las sortea", () => {
  for (const level of DIV_LEVELS) {
    for (let r = 0; r < level.rounds; r++) {
      const p = generateDivUndoMul(level, 99, r);
      assert.equal(p.ask, level.asks[r % level.asks.length]);
    }
  }
});

test("un nivel con dos preguntas da evidencia de las dos en sus rondas", () => {
  for (const level of DIV_LEVELS) {
    if (level.asks.length < 2) continue;
    const vistas = new Set(
      Array.from({ length: level.rounds }, (_, r) => generateDivUndoMul(level, 7, r).ask),
    );
    assert.equal(vistas.size, level.asks.length, `el nivel ${level.n} no alterna sus preguntas`);
  }
});

test("la banda estirada siempre entra en la regla", () => {
  for (const level of DIV_LEVELS) {
    for (const p of rounds(level)) {
      assert.ok(p.total <= 24, `el nivel ${level.n} estira la banda más allá de la regla`);
      assert.ok(p.length > p.total, `el nivel ${level.n} deja el extremo en el borde de la regla`);
      assert.ok(p.rest >= 2 && p.rest <= 6, `el nivel ${level.n} pide una banda que no se dibuja`);
    }
  }
});

test("el piso y la banda cuentan las mismas baldosas", () => {
  for (const level of DIV_LEVELS) {
    for (const p of rounds(level)) {
      assert.equal(p.rows * p.cols + p.leftover, p.total);
      assert.equal(p.rows, p.rest);
      assert.equal(p.cols, p.factor);
    }
  }
});

test("hasta el nivel 6 la división da exacta y desde el 7 sobra siempre algo", () => {
  for (const level of DIV_LEVELS) {
    for (const p of rounds(level)) {
      if (level.params.exact) {
        assert.equal(p.leftover, 0, `el nivel ${level.n} deja baldosas sueltas sin declararlo`);
      } else {
        assert.ok(p.leftover >= 1, `el nivel ${level.n} promete sobrante y da una división exacta`);
        assert.ok(p.leftover < p.cols, `el sobrante del nivel ${level.n} da otra fila entera`);
      }
    }
  }
});

test("el dial arranca cerca del estirado pero nunca encima", () => {
  const level = divLevelByNumber(1) as DivLevel;
  for (const p of rounds(level)) {
    assert.notEqual(p.dialStart, p.factor, "el dial arranca resuelto y no hay nada que calibrar");
    assert.ok(Math.abs(p.dialStart - p.factor) <= 1, "el dial no arranca cerca");
  }
});

test("desde el nivel 2 el dial arranca sin girar", () => {
  for (const level of DIV_LEVELS.slice(1)) {
    for (const p of rounds(level)) assert.equal(p.dialStart, 1);
  }
});

// --- El llavero --------------------------------------------------------------

test("el llavero trae una llave por clase y exactamente una abre", () => {
  for (const level of DIV_LEVELS) {
    for (const p of rounds(level, 8)) {
      assert.equal(p.keys.length, level.params.classes.length);
      assert.equal(p.keys.filter((k) => k.correct).length, 1);
      assert.deepEqual(
        [...p.keys.map((k) => k.kind)].sort(),
        [...level.params.classes].sort(),
      );
    }
  }
});

test("el primer nivel no ofrece nada que elegir: solo hay que calibrar", () => {
  const level = divLevelByNumber(1) as DivLevel;
  for (const p of rounds(level, 8)) {
    assert.deepEqual(p.keys.map((k) => k.kind), ["shrink"]);
  }
});

test("la llave que abre encoge por el estirado", () => {
  for (const level of DIV_LEVELS) {
    for (const p of rounds(level, 8)) {
      const buena = p.keys.find((k) => k.correct);
      assert.ok(buena);
      assert.equal(buena?.kind, "shrink");
      assert.equal(buena?.dial, p.factor);
      assert.ok(opensChest(p.factor, "shrink", buena?.dial ?? 0));
    }
  }
});

test("recortar y estirar clasifican como elegir la acción que no es la inversa", () => {
  const level = divLevelByNumber(2) as DivLevel;
  for (const p of rounds(level, 8)) {
    for (const k of p.keys) {
      if (k.correct) {
        assert.equal(k.misconception, undefined);
      } else {
        assert.equal(k.misconception, MIS_DIV_INVERSE);
      }
    }
  }
});

test("las llaves equivocadas llevan el mismo numeral que la buena", () => {
  // Si la llave de recortar viniera con otro dial, el nivel se pasaría leyendo
  // numerales y no mirando qué le hace cada llave a la banda.
  const level = divLevelByNumber(5) as DivLevel;
  for (const p of rounds(level, 8)) {
    for (const k of p.keys) assert.equal(k.dial, p.factor);
  }
});

test("solo encoger por el total clasifica como dividir al revés", () => {
  assert.equal(misconceptionForDial(12, 12), MIS_DIV_ORDER);
  assert.equal(misconceptionForDial(12, 3), undefined);
  assert.equal(misconceptionForDial(12, 4), undefined);
});

// --- Las fichas --------------------------------------------------------------

test("las preguntas de ficha traen una sola correcta y ninguna repetida", () => {
  for (const level of DIV_LEVELS) {
    for (const p of rounds(level, 8)) {
      if (p.options.length === 0) continue;
      assert.ok(p.options.length <= DIV_OPTION_SLOTS);
      assert.equal(p.options.filter((o) => o.correct).length, 1);
      assert.equal(new Set(p.options.map((o) => o.value)).size, p.options.length);
      assert.ok(p.options.every((o) => o.value > 0));
    }
  }
});

test("la ficha correcta de la pared es el lado que la pared tapa", () => {
  const level = divLevelByNumber(4) as DivLevel;
  for (const p of rounds(level, 12)) {
    const buena = p.options.find((o) => o.correct);
    assert.equal(buena?.value, hiddenSide(p));
    assert.equal(shownSide(p) * hiddenSide(p), p.total);
  }
});

test("el mismo piso se lee en las dos direcciones a lo largo de las rondas", () => {
  const level = divLevelByNumber(4) as DivLevel;
  const lados = new Set(rounds(level, 24).map((p) => p.hidden));
  assert.equal(lados.size, 2, "la pared tapa siempre el mismo lado");
});

test("con sobrante la ficha correcta cuenta filas enteras y no baldosas", () => {
  const level = divLevelByNumber(7) as DivLevel;
  for (const p of rounds(level, 12)) {
    const buena = p.options.find((o) => o.correct);
    assert.equal(buena?.value, splitRows(p.total, p.cols).rows);
    // Meter las sueltas en una fila más está a la vista y no se anota: el
    // catálogo de L no nombra ese error sobre este nodo.
    const demas = p.options.find((o) => o.lure === "with_leftover");
    if (demas) assert.equal(demas.misconception, undefined);
  }
});

test("restar el lado conocido en vez de dividir clasifica; el vecino no", () => {
  for (const n of [4, 5, 6, 7]) {
    const level = divLevelByNumber(n) as DivLevel;
    for (const p of rounds(level, 8)) {
      for (const o of p.options) {
        if (o.lure === "subtracted") assert.equal(o.misconception, MIS_DIV_INVERSE);
        if (o.lure === "near") assert.equal(o.misconception, undefined);
        if (o.correct) assert.equal(o.misconception, undefined);
      }
    }
  }
});

test("ninguna ficha ni llave inventa un id de error fuera del catálogo", () => {
  const catalogo = new Set([MIS_DIV_ORDER, MIS_DIV_INVERSE]);
  for (const level of DIV_LEVELS) {
    for (const p of rounds(level, 8)) {
      for (const k of p.keys) {
        if (k.misconception) assert.ok(catalogo.has(k.misconception), k.misconception);
      }
      for (const o of p.options) {
        if (o.misconception) assert.ok(catalogo.has(o.misconception), o.misconception);
      }
    }
  }
});

// --- Las vueltas arbitrarias -------------------------------------------------

test("el último nivel trae cerraduras con parámetro y una sin vuelta por instancia", () => {
  const level = divLevelByNumber(8) as DivLevel;
  for (const p of rounds(level, 12)) {
    assert.equal(p.actions.filter((a) => a.correct).length, 1);
    assert.equal(p.actions.filter((a) => a.uninvertible).length, 1);
    assert.ok(p.actions.length >= 3 && p.actions.length <= 4);
  }
});

test("la banda aplastada se contesta con la ficha de cofre sin llave", () => {
  const level = divLevelByNumber(8) as DivLevel;
  const vistas = new Set<string>();
  for (const p of rounds(level, 24)) {
    vistas.add(p.lock.kind);
    const buena = p.actions.find((a) => a.correct);
    if (p.lock.kind === "flat") {
      assert.equal(buena?.uninvertible, true, "el cofre sin llave se abre con una llave");
      assert.equal(p.lock.dial, 0);
    } else {
      assert.equal(buena?.uninvertible, false);
      assert.equal(buena?.kind, p.lock.kind, "la vuelta no es de la clase de la cerradura");
      assert.equal(buena?.dial, p.lock.dial, "la vuelta no quedó calibrada como la ida");
    }
  }
  assert.ok(vistas.has("flat"), "la cerradura sin vuelta nunca aparece");
  assert.ok(vistas.size > 1, "todas las cerraduras del nivel son la misma");
});

test("con la cerradura calibrada hay siempre otra de la misma clase mal calibrada", () => {
  const level = divLevelByNumber(8) as DivLevel;
  for (const p of rounds(level, 12)) {
    if (p.lock.kind === "flat") continue;
    const mismaClase = p.actions.filter((a) => a.kind === p.lock.kind);
    assert.ok(mismaClase.length >= 2, "elegir la clase alcanza y no hace falta calibrar");
  }
});

test("solo las rondas de piso y de expresión traen fichas", () => {
  for (const level of DIV_LEVELS) {
    for (const p of rounds(level, 6)) {
      const conFichas = p.ask === "wall" || p.ask === "ghost" || p.ask === "leftover";
      assert.equal(p.options.length > 0, conFichas, `las fichas de ${p.ask} no corresponden`);
      assert.equal(p.actions.length > 0, p.ask === "undo");
    }
  }
});
