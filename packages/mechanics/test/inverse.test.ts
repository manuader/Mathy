import { test } from "node:test";
import assert from "node:assert/strict";
import {
  INV_EVIDENCE,
  INV_LAYERS,
  INV_LEVELS,
  INV_MAX_VALUE,
  INV_MISCONCEPTION,
  INV_OPTION_SLOTS,
  INV_RING_SLOTS,
  KEY_INVERSE,
  NODE_INVERSE_FUNCTION,
  TOTAL_INV_LEVELS,
  generateInverse,
  invAccepts,
  invCallPieces,
  invCutWorks,
  invExistsFor,
  invFormulaPieces,
  invIdentity,
  invIdentityPieces,
  invInverse,
  invIsIdentity,
  invLevelByNumber,
  invLoops,
  invMachine,
  invMisconceptionFor,
  invMisconceptionForCut,
  invOpens,
  invReflect,
  invRestores,
  invReturns,
  invRulePieces,
  invRun,
  invSwap,
  invTrace,
  invUndoOrder,
  isNodeOpen,
  keyUndoOrder,
  nodeById,
  type InvCut,
  type InvExists,
  type InvLevel,
  type InvMachine,
  type InvProblem,
  type InvStep,
} from "../src/index.ts";

const seeds = (n: number): number[] => Array.from({ length: n }, (_, i) => i * 41 + 7);

/** Todas las rondas de un nivel, para todas las semillas de la muestra. */
function rondas(level: InvLevel, n = 12): InvProblem[] {
  const out: InvProblem[] = [];
  for (const seed of seeds(n)) {
    for (let r = 0; r < level.rounds; r++) out.push(generateInverse(level, seed + r, r));
  }
  return out;
}

const todas = (): InvProblem[] => INV_LEVELS.flatMap((l) => rondas(l, 8));

const nivel = (n: number): InvLevel => invLevelByNumber(n) as InvLevel;

const paso = (op: InvStep["op"], value: number): InvStep => ({ op, value });

// --- Los niveles como datos --------------------------------------------------

test("los ocho niveles del diseño están, en orden y sin repetir", () => {
  assert.equal(INV_LEVELS.length, 8);
  assert.equal(TOTAL_INV_LEVELS, 8);
  assert.deepEqual(
    INV_LEVELS.map((l) => l.n),
    [1, 2, 3, 4, 5, 6, 7, 8],
  );
});

test("cada nivel cambia la capa o endurece parámetros, nunca las dos cosas", () => {
  for (let i = 1; i < INV_LEVELS.length; i++) {
    const prev = INV_LEVELS[i - 1] as InvLevel;
    const cur = INV_LEVELS[i] as InvLevel;
    const cambioCapa = prev.layer !== cur.layer;
    const cambioParams = JSON.stringify(prev.params) !== JSON.stringify(cur.params);
    assert.ok(
      !(cambioCapa && cambioParams),
      `el nivel ${cur.n} cambia la capa y los parámetros a la vez`,
    );
    assert.ok(
      cambioCapa || cambioParams,
      `el nivel ${cur.n} no cambia nada respecto del anterior`,
    );
  }
});

test("los parámetros nunca se ablandan al avanzar de nivel", () => {
  for (let i = 1; i < INV_LEVELS.length; i++) {
    const prev = (INV_LEVELS[i - 1] as InvLevel).params;
    const cur = (INV_LEVELS[i] as InvLevel).params;
    assert.ok(cur.steps >= prev.steps, `el nivel ${i + 1} acorta la máquina`);
    assert.ok(cur.ops.length >= prev.ops.length, `el nivel ${i + 1} saca operaciones del juego`);
    assert.ok(cur.operand[1] >= prev.operand[1], `el nivel ${i + 1} achica el rango`);
    assert.ok(cur.input[1] >= prev.input[1], `el nivel ${i + 1} achica la bola`);
    assert.ok(cur.ring >= prev.ring, `el nivel ${i + 1} descuelga máquinas del llavero`);
  }
});

test("el nodo recorre las seis capas del diseño y termina en la definición", () => {
  assert.deepEqual([...new Set(INV_LEVELS.map((l) => l.layer))], INV_LAYERS);
  const ultimo = INV_LEVELS[INV_LEVELS.length - 1] as InvLevel;
  assert.equal(ultimo.layer, "formal");
  assert.equal(ultimo.definition, true);
  for (const l of INV_LEVELS.slice(0, -1)) {
    assert.equal(l.definition, false, `el nivel ${l.n} define antes de tiempo`);
  }
});

test("los cinco verbos del diseño aparecen y ninguno se cuela de más", () => {
  const vistos = [...new Set(INV_LEVELS.flatMap((l) => l.evidence))];
  for (const e of vistos) {
    assert.ok(INV_EVIDENCE.includes(e), `el nivel usa un verbo que el nodo no declara: ${e}`);
  }
  for (const e of INV_EVIDENCE) {
    assert.ok(vistos.includes(e), `ningún nivel da evidencia de ${e}`);
  }
});

test("los numerales y el nombre escrito llegan cuando el diseño los pide", () => {
  // Los tres primeros niveles se juegan sin leer un solo número.
  for (const l of INV_LEVELS.filter((x) => x.n <= 3)) {
    assert.equal(l.numerals, false, `el nivel ${l.n} muestra números antes de tiempo`);
    assert.equal(l.named, false, `el nivel ${l.n} escribe el nombre antes de tiempo`);
  }
  // La marca nace en la capa simbólica, no antes.
  for (const l of INV_LEVELS) {
    if (l.named) assert.ok(l.layer === "symbolic" || l.layer === "formal");
    if (l.layer === "symbolic" || l.layer === "formal") assert.equal(l.named, true);
  }
});

test("solo el último nivel clasifica, y solo el error que el catálogo apunta acá", () => {
  for (const l of INV_LEVELS) {
    for (const id of l.classifies) {
      assert.equal(id, INV_MISCONCEPTION, `el nivel ${l.n} clasifica un error que no es del nodo`);
    }
  }
  assert.deepEqual((nivel(8) as InvLevel).classifies, [INV_MISCONCEPTION]);
  for (const l of INV_LEVELS.slice(0, -1)) {
    assert.deepEqual(l.classifies, [], `el nivel ${l.n} clasifica sin que el diseño se lo pida`);
  }
});

test("el nodo queda registrado con los prerequisitos del YAML de la espina", () => {
  const spec = nodeById(NODE_INVERSE_FUNCTION);
  assert.ok(spec);
  assert.equal(spec.n, 21);
  assert.deepEqual(spec.prereqs, [
    "alg.fn.composition",
    "prealg.inv.operation_as_key",
    "alg.fn.graph_as_picture",
  ]);
  assert.equal(spec.levels.length, 8);
});

test("el nodo se abre con los prerequisitos implementados terminados", () => {
  assert.equal(isNodeOpen(NODE_INVERSE_FUNCTION, {}), false);
  const hechos: Record<string, number> = {
    "prealg.inv.operation_as_key": 7,
    "alg.fn.graph_as_picture": 8,
    "alg.fn.composition": 99,
  };
  assert.equal(isNodeOpen(NODE_INVERSE_FUNCTION, hechos), true);
});

// --- La máquina y su vuelta --------------------------------------------------

test("correr la máquina deja lo que sale de cada paso, en orden", () => {
  const f = invMachine("f", "f", [paso("mul", 2), paso("add", 3)]);
  const corrida = invRun(f, 5);
  assert.equal(corrida.output, 13);
  assert.deepEqual(corrida.stages, [10, 13]);
  assert.equal(corrida.twin, null);
});

test("la inversa deshace en los dos sentidos", () => {
  const f = invMachine("f", "f", [paso("mul", 3), paso("sub", 4)]);
  const g = invInverse(f);
  assert.ok(g);
  for (let x = 2; x <= 20; x++) {
    const y = invRun(f, x).output;
    assert.equal(invRun(g, y).output, x, `f⁻¹(f(${x})) no devolvió ${x}`);
    assert.equal(invRun(f, invRun(g, y).output).output, y, `f(f⁻¹(${y})) no devolvió ${y}`);
  }
});

test("la inversa de la inversa es la original", () => {
  const f = invMachine("f", "f", [paso("add", 5), paso("div", 2)]);
  const g = invInverse(f);
  assert.ok(g);
  const h = invInverse(g);
  assert.ok(h);
  assert.deepEqual(h.steps, f.steps);
  assert.equal(h.inverted, f.inverted);
});

test("la inversa de una cadena invierte el orden, y el orden lo dice el nodo 12", () => {
  const f = invMachine("f", "f", [paso("mul", 2), paso("add", 3)]);
  const g = invInverse(f);
  assert.ok(g);
  // Primero se deshace lo último que tocó la bola: restar 3, después dividir.
  assert.deepEqual(g.steps, [paso("sub", 3), paso("div", 2)]);
  // Y el orden no lo decide este módulo: es `keyUndoOrder`, del nodo 12.
  assert.deepEqual(invUndoOrder(f), keyUndoOrder(invLoops(f, 0)));
  assert.deepEqual(invUndoOrder(f), ["s1", "s0"]);
});

test("el orden de deshacer no depende de la bola que entró", () => {
  const f = invMachine("f", "f", [paso("add", 2), paso("mul", 3)]);
  assert.deepEqual(invUndoOrder(f, 0), invUndoOrder(f, 17));
});

test("cada paso de la vuelta es la llave del suyo, con la tabla del nodo 12", () => {
  const f = invMachine("f", "f", [paso("div", 3), paso("sub", 1)]);
  const g = invInverse(f);
  assert.ok(g);
  const ida = [...f.steps].reverse();
  g.steps.forEach((s, i) => {
    const original = ida[i] as InvStep;
    assert.equal(s.op, KEY_INVERSE[original.op]);
    assert.equal(s.value, original.value);
  });
});

test("la máquina que no hace nada es su propia inversa", () => {
  const id = invIdentity("i", "f");
  assert.ok(invIsIdentity(id));
  const g = invInverse(id);
  assert.ok(g);
  assert.deepEqual(g.steps, []);
  assert.equal(invRun(g, 7).output, 7);
  assert.ok(invRestores(id, g, 7));
});

// --- Los dos predicados, y el tercero --------------------------------------

test("abrir mira solo las operaciones y devolver mira el objeto", () => {
  const f = invMachine("f", "f", [paso("mul", 4)]);
  const buena = invMachine("g", "g", [paso("div", 4)]);
  // La operación es la que abre y el número es el que devuelve: la separación
  // del nodo 12, enunciada sobre máquinas.
  const abreYNoDevuelve = invMachine("h", "h", [paso("div", 2)]);
  const noAbre = invMachine("p", "p", [paso("sub", 4)]);

  assert.equal(invOpens(f, buena), true);
  assert.equal(invOpens(f, abreYNoDevuelve), true);
  assert.equal(invOpens(f, noAbre), false);

  assert.equal(invReturns(f, buena, 3), true);
  assert.equal(invReturns(f, abreYNoDevuelve, 3), false);

  assert.equal(invRestores(f, buena, 3), true);
  assert.equal(invRestores(f, abreYNoDevuelve, 3), false);
  assert.equal(invRestores(f, noAbre, 3), false);
});

test("una candidata con los pasos correctos y el orden cambiado no devuelve", () => {
  const f = invMachine("f", "f", [paso("mul", 2), paso("add", 6)]);
  const g = invInverse(f) as InvMachine;
  const alReves = invMachine("h", "h", [...g.steps].reverse());
  // Abre —las operaciones son las de la vuelta— y no devuelve, que es
  // exactamente lo que el nivel de dos pasos pone a la vista.
  assert.equal(invOpens(f, alReves), true);
  assert.equal(invReturns(f, alReves, 5), false);
});

test("nadie abre una máquina que junta entradas, ni una que junta abre nada", () => {
  const f = invMachine("f", "f", [paso("add", 1)]);
  const junta = generateInverse(nivel(8), 11, 0).machine;
  assert.equal(junta.collapse, "mirror");
  assert.equal(invOpens(junta, invMachine("g", "g", [paso("sub", 1)])), false);
  assert.equal(invOpens(f, junta), false);
  assert.equal(invInverse(junta), null);
});

// --- No toda máquina tiene inversa -------------------------------------------

test("las tres confluencias dan una salida sola y dos entradas distintas", () => {
  const espejo = generateInverse(nivel(8), 3, 0).machine;
  assert.equal(espejo.collapse, "mirror");
  const corrida = invRun(espejo, 3);
  assert.equal(corrida.output, 9);
  assert.equal(corrida.twin, -3);
  assert.equal(invRun(espejo, -3).output, corrida.output);
});

test("qué se puede decir de la vuelta antes de intentarla", () => {
  assert.equal(invExistsFor(invMachine("f", "f", [paso("add", 3)])), "yes");
  assert.equal(invExistsFor(invIdentity("i", "f")), "yes");
  const espejo = generateInverse(nivel(8), 5, 0).machine;
  assert.equal(invExistsFor(espejo), "cut");
  const aplasta = generateInverse(nivel(8), 5, 4).machine;
  assert.equal(aplasta.collapse, "flat");
  assert.equal(invExistsFor(aplasta), "never");
});

test("el recorte deja una entrada por salida, y hay más de uno razonable", () => {
  assert.equal(invCutWorks("mirror", "nonNegative"), true);
  assert.equal(invCutWorks("mirror", "nonPositive"), true);
  assert.equal(invCutWorks("mirror", "none"), false);
  assert.equal(invCutWorks("periodic", "onePeriod"), true);
  assert.equal(invCutWorks("periodic", "nonNegative"), false);
  assert.equal(invCutWorks("flat", "onePoint"), true);
  assert.equal(invCutWorks("flat", "nonNegative"), false);
});

// --- Los errores -------------------------------------------------------------

test("el único error que clasifica es el que el catálogo apunta a este nodo", () => {
  assert.equal(INV_MISCONCEPTION, "sqrt_loses_negative_branch");
  const espejo = generateInverse(nivel(8), 3, 0).machine;
  assert.equal(invMisconceptionFor(espejo, "yes"), INV_MISCONCEPTION);
  assert.equal(invMisconceptionForCut(espejo, "none"), INV_MISCONCEPTION);
});

test("acertar no clasifica nunca, y el resto de los errores va sin campo", () => {
  const espejo = generateInverse(nivel(8), 3, 0).machine;
  for (const r of ["cut", "never"] as InvExists[]) {
    assert.equal(invMisconceptionFor(espejo, r), undefined);
  }
  for (const c of ["nonNegative", "nonPositive", "onePeriod"] as InvCut[]) {
    assert.equal(invMisconceptionForCut(espejo, c), undefined);
  }
  // La máquina periódica y la que aplasta también se contestan mal, y esos
  // movimientos el catálogo no los apunta acá.
  const periodica = generateInverse(nivel(8), 5, 3).machine;
  assert.equal(periodica.collapse, "periodic");
  assert.equal(invMisconceptionFor(periodica, "yes"), undefined);
  assert.equal(invMisconceptionForCut(periodica, "none"), undefined);
  const buena = invMachine("f", "f", [paso("add", 3)]);
  assert.equal(invMisconceptionFor(buena, "yes"), undefined);
});

// --- El rastro y el doblez ---------------------------------------------------

test("el par dado vuelta es la reflexión sobre la diagonal", () => {
  assert.deepEqual(invSwap({ x: 2, y: 5 }), { x: 5, y: 2 });
  const f = invMachine("f", "f", [paso("add", 1)]);
  const rastro = invTrace(f, 0, 3);
  assert.deepEqual(rastro, [
    { x: 0, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: 4 },
  ]);
  // El rastro reflejado es el de la inversa: no se calcula dos veces.
  const g = invInverse(f) as InvMachine;
  assert.deepEqual(invReflect(rastro), invTrace(g, 1, 4));
});

// --- Lo que se escribe -------------------------------------------------------

test("la regla se escribe en el orden en que los pasos tocan la bola", () => {
  const suma = invMachine("f", "f", [paso("add", 3), paso("mul", 2)]);
  // Suma primero y escala después: el paréntesis dice justamente eso.
  assert.deepEqual(invRulePieces(suma, [{ kind: "sym", name: "x" }]), [
    { kind: "open" },
    { kind: "sym", name: "x" },
    { kind: "op", op: "add" },
    { kind: "num", value: 3 },
    { kind: "close" },
    { kind: "op", op: "mul" },
    { kind: "num", value: 2 },
  ]);
  const escala = invMachine("f", "f", [paso("mul", 2), paso("add", 3)]);
  assert.deepEqual(invRulePieces(escala, [{ kind: "sym", name: "x" }]), [
    { kind: "sym", name: "x" },
    { kind: "op", op: "mul" },
    { kind: "num", value: 2 },
    { kind: "op", op: "add" },
    { kind: "num", value: 3 },
  ]);
});

test("la marca viaja como pieza propia y solo en la máquina invertida", () => {
  const f = invMachine("f", "f", [paso("add", 5)]);
  const g = invInverse(f) as InvMachine;
  const ida = invCallPieces(f, [{ kind: "sym", name: "x" }]);
  const vuelta = invCallPieces(g, [{ kind: "sym", name: "y" }]);
  assert.equal(ida.some((p) => p.kind === "mark"), false);
  assert.equal(vuelta.filter((p) => p.kind === "mark").length, 1);
  assert.deepEqual(vuelta[0], { kind: "sym", name: "f" });
  assert.deepEqual(vuelta[1], { kind: "mark" });
});

test("la identidad escrita es la cadena, no una fórmula", () => {
  const f = invMachine("f", "f", [paso("mul", 3)]);
  const piezas = invIdentityPieces(f);
  // Termina en `= x`: lo que la cadena le hace a la bola es dejarla como estaba.
  assert.deepEqual(piezas[piezas.length - 2], { kind: "eq" });
  assert.deepEqual(piezas[piezas.length - 1], { kind: "sym", name: "x" });
  assert.equal(piezas.filter((p) => p.kind === "mark").length, 1);
  assert.equal(invFormulaPieces(f).some((p) => p.kind === "eq"), true);
});

// --- El generador ------------------------------------------------------------

test("el generador es determinista: la misma semilla da la misma ronda", () => {
  for (const l of INV_LEVELS) {
    for (let r = 0; r < l.rounds; r++) {
      assert.deepEqual(generateInverse(l, 99 + r, r), generateInverse(l, 99 + r, r));
    }
  }
});

test("cada nivel alterna sus preguntas en vez de sortearlas", () => {
  for (const l of INV_LEVELS) {
    for (let r = 0; r < l.rounds; r++) {
      const esperada = l.asks[r % l.asks.length];
      assert.equal(generateInverse(l, 7 + r, r).ask, esperada, `el nivel ${l.n}, ronda ${r}`);
    }
  }
  // Y un nivel con dos preguntas da evidencia de las dos en sus rondas.
  for (const l of INV_LEVELS.filter((x) => x.asks.length > 1)) {
    const vistas = new Set(
      Array.from({ length: l.rounds }, (_, r) => generateInverse(l, 13 + r, r).ask),
    );
    assert.equal(vistas.size, l.asks.length, `el nivel ${l.n} no llega a preguntar las dos cosas`);
  }
});

test("la máquina de cada ronda acepta su bola y no se pasa del techo", () => {
  for (const p of todas()) {
    if (p.machine.collapse !== null) continue;
    assert.ok(invAccepts(p.machine, p.input), `la máquina no acepta ${p.input}`);
    assert.equal(invRun(p.machine, p.input).output, p.output);
    assert.ok(Math.abs(p.output) <= INV_MAX_VALUE);
  }
});

test("la máquina de cada ronda tiene los pasos que el nivel pide", () => {
  for (const l of INV_LEVELS) {
    for (const p of rondas(l)) {
      if (p.machine.collapse !== null || p.ask === "exists" || p.ask === "cut") continue;
      assert.equal(p.machine.steps.length, l.params.steps, `el nivel ${l.n}`);
      for (const s of p.machine.steps) {
        assert.ok(l.params.ops.includes(s.op), `el nivel ${l.n} usa una operación de más`);
        assert.ok(s.value >= 1, `el nivel ${l.n} pone un paso que no hace nada`);
      }
    }
  }
});

test("ninguna máquina generada deja la bola como estaba", () => {
  for (const p of todas()) {
    if (p.machine.collapse !== null || p.machine.steps.length === 0) continue;
    assert.notEqual(p.output, p.input, "la máquina no hizo nada y no hay nada que deshacer");
  }
});

test("la vuelta que el generador entrega devuelve siempre la bola", () => {
  for (const p of todas()) {
    if (!p.inverse) {
      assert.notEqual(p.machine.collapse, null, "una máquina sin confluencia se quedó sin vuelta");
      continue;
    }
    assert.ok(invRestores(p.machine, p.inverse, p.input), `no devolvió ${p.input}`);
  }
});

test("el llavero trae la que deshace, y una sola", () => {
  for (const l of INV_LEVELS.filter((x) => x.asks.some((a) => a === "ring" || a === "order"))) {
    for (const p of rondas(l)) {
      assert.ok(p.ring.length >= 2, `el nivel ${l.n} cuelga menos de dos máquinas`);
      assert.ok(p.ring.length <= Math.min(l.params.ring, INV_RING_SLOTS));
      const buenas = p.ring.filter((c) => c.correct);
      assert.equal(buenas.length, 1, `el nivel ${l.n} tiene ${buenas.length} máquinas que deshacen`);
      const buena = buenas[0];
      assert.ok(buena);
      assert.ok(invRestores(p.machine, buena.machine, p.input));
      for (const c of p.ring) {
        if (c.correct) continue;
        assert.ok(c.lure, "una candidata está colgada sin motivo");
        assert.equal(
          invRestores(p.machine, c.machine, p.input),
          false,
          `la candidata ${c.lure} también devuelve`,
        );
      }
    }
  }
});

test("las candidatas del llavero no se repiten", () => {
  for (const l of INV_LEVELS.filter((x) => x.asks.some((a) => a === "ring" || a === "order"))) {
    for (const p of rondas(l)) {
      const vistas = p.ring.map((c) =>
        c.machine.steps.map((s) => `${s.op}${s.value}`).join("·"),
      );
      assert.equal(new Set(vistas).size, vistas.length, "dos candidatas son la misma máquina");
    }
  }
});

test("el señuelo del orden aparece justo donde el orden importa", () => {
  for (const p of rondas(nivel(7))) {
    assert.ok(
      p.ring.some((c) => c.lure === "wrong_order"),
      "el nivel de dos pasos tiene que ofrecer siempre la cadena sin invertir",
    );
  }
  const unPaso = rondas(nivel(4));
  assert.equal(
    unPaso.some((p) => p.ring.some((c) => c.lure === "wrong_order")),
    false,
    "el nivel de un paso ofrece un señuelo de orden que no existe",
  );
});

test("las fichas de respuesta traen una correcta y ninguna de más", () => {
  for (const p of todas()) {
    if (p.options.length === 0) continue;
    assert.ok(p.options.length <= INV_OPTION_SLOTS + 1);
    const buenas = p.options.filter((o) => o.correct);
    if (p.ask === "cut" && p.machine.collapse === "mirror") {
      // Los dos lados de la confluencia simétrica sirven los dos: el documento
      // pide que haya más de una elección razonable.
      assert.equal(buenas.length, 2, "el recorte simétrico tiene que tener dos salidas");
      continue;
    }
    assert.equal(buenas.length, 1, `la ronda ${p.ask} tiene ${buenas.length} fichas correctas`);
  }
});

test("la ficha del recíproco está una vez y no es la respuesta", () => {
  const conNombre = rondas(nivel(6)).filter((p) => p.ask === "name");
  assert.ok(conNombre.length > 0);
  for (const p of conNombre) {
    const reciprocas = p.options.filter((o) => o.lure === "reciprocal");
    assert.equal(reciprocas.length, 1, "la marca no significa elevado a menos uno, y hay que verlo");
    assert.equal(reciprocas[0]?.correct, false);
  }
});

test("el doblez ofrece la reflexión sobre la diagonal y dos que no lo son", () => {
  for (const p of rondas(nivel(5)).filter((x) => x.ask === "fold")) {
    assert.equal(p.curves.length, 3);
    const buenas = p.curves.filter((c) => c.correct);
    assert.equal(buenas.length, 1);
    assert.deepEqual(buenas[0]?.points, p.mirror);
    for (const c of p.curves) {
      if (!c.correct) assert.ok(c.lure, "una curva candidata está sin motivo");
    }
  }
});

test("los dos rastros caben enteros en la hoja", () => {
  for (const p of rondas(nivel(5))) {
    assert.ok(p.trace.length >= 3, "el rastro quedó demasiado corto para verse");
    for (const punto of [...p.trace, ...p.mirror]) {
      assert.ok(punto.x >= p.window.x0 && punto.x <= p.window.x1, "una gota se fue de la hoja");
      assert.ok(punto.y >= p.window.y0 && punto.y <= p.window.y1, "una gota se fue de la hoja");
    }
  }
});

test("la gota encendida nunca cae sobre la diagonal", () => {
  for (const p of rondas(nivel(5)).filter((x) => x.ask === "swap")) {
    assert.ok(p.lit);
    assert.notEqual(p.lit.x, p.lit.y, "sobre la diagonal el par dado vuelta es el mismo par");
    const buena = p.marked.filter((m) => m.x === (p.lit as { y: number }).y);
    assert.ok(buena.length >= 1, "la gota del par dado vuelta no está marcada");
  }
});

test("el último nivel recorre las cuatro clases de máquina del documento", () => {
  const clases = new Set(
    rondas(nivel(8)).map((p) => (invIsIdentity(p.machine) ? "identity" : p.machine.collapse)),
  );
  assert.deepEqual([...clases].sort(), ["flat", "identity", "mirror", "periodic"]);
});

test("la máquina que junta entradas saca dos bolas por la boca de entrada", () => {
  for (const p of rondas(nivel(8))) {
    if (p.machine.collapse === null) {
      assert.deepEqual(p.branches, []);
      continue;
    }
    assert.equal(p.branches.length, 2, "la confluencia tiene que mostrar dos entradas");
    const [a, b] = p.branches as [number, number];
    assert.notEqual(a, b);
    assert.equal(invRun(p.machine, a).output, invRun(p.machine, b).output);
  }
});
