import { test } from "node:test";
import assert from "node:assert/strict";
import {
  type Equation,
  type MathNode,
  equationToText,
  evaluate,
  goalCost,
  inverseOf,
  num,
  op,
} from "@mathy/math-core";
import {
  MULTI_KEY_SLOTS,
  MULTI_LEVELS,
  MULTI_MISCONCEPTION,
  MULTI_TILE_SLOTS,
  MULTI_UNKNOWN,
  NODE_MULTI_STEP,
  TOTAL_MULTI_LEVELS,
  generateMultiStep,
  isNodeOpen,
  multiBringOut,
  multiCommutes,
  multiCorrectKey,
  multiDistribute,
  multiJudge,
  multiLevelByNumber,
  multiMisconceptionFor,
  multiOuterLayer,
  multiPending,
  multiSolved,
  multiUnwrapOrder,
  nodeById,
  type MultiKey,
  type MultiLevel,
  type MultiProblem,
} from "../src/index.ts";

const seeds = (n: number): number[] => Array.from({ length: n }, (_, i) => i * 53 + 11);

/** Todas las rondas de un nivel, para todas las semillas de la muestra. */
function rondas(level: MultiLevel, n = 12): MultiProblem[] {
  const out: MultiProblem[] = [];
  for (const seed of seeds(n)) {
    for (let r = 0; r < level.rounds; r++) out.push(generateMultiStep(level, seed + r, r));
  }
  return out;
}

const todas = (n = 8): MultiProblem[] => MULTI_LEVELS.flatMap((l) => rondas(l, n));

const nivel = (n: number): MultiLevel => multiLevelByNumber(n) as MultiLevel;

/** Reemplaza la incógnita por un valor, para poder evaluar los dos lados. */
function sustituir(node: MathNode, value: number): MathNode {
  if (node.kind === "sym") return num(value, node.id);
  if (node.kind === "op") return op(node.op, node.args.map((a) => sustituir(a, value)), node.id);
  return node;
}

/** ¿La igualdad es cierta para este valor de la incógnita? */
function cierta(eq: Equation, value: number): boolean {
  const a = evaluate(sustituir(eq.lhs, value));
  const b = evaluate(sustituir(eq.rhs, value));
  if (a === undefined || b === undefined) return false;
  return Math.abs(a - b) < 1e-9;
}

/**
 * La llave del llavero que deshace una capa dada. Se la busca por su cara —la
 * operación y el número— y no por el id de la capa, porque dos capas que piden
 * la misma llave la comparten.
 */
function llaveDe(p: MultiProblem, capa: { readonly op: string; readonly value: number }) {
  const inversa = inverseOf(capa.op as "+" | "-" | "*" | "/");
  return p.keys.find((k) => k.kind === "apply" && k.op === inversa && k.value === capa.value);
}

/** Abre los cofres en orden y devuelve la ecuación final. */
function resolver(p: MultiProblem): { readonly eq: Equation; readonly pasos: number } {
  let eq = p.equation;
  const opened: string[] = [];
  let pasos = 0;
  while (!multiSolved(p.layers, opened) && pasos < 8) {
    const capa = multiOuterLayer(p.layers, opened);
    if (!capa) break;
    if (capa.op === "*" && capa.value === 0) break;
    const key: MultiKey = llaveDe(p, capa) ?? {
      id: "armada",
      op: inverseOf(capa.op),
      value: capa.value,
      kind: "apply",
      layer: capa.id,
    };
    const m = multiJudge(eq, key, p, opened);
    assert.equal(m.verdict, "opens", `la llave de la capa expuesta no abrió en ${equationToText(eq)}`);
    eq = m.next;
    opened.push(capa.id);
    pasos++;
  }
  return { eq, pasos };
}

// --- Los niveles como datos --------------------------------------------------

test("los siete niveles del diseño están, en orden y sin repetir", () => {
  assert.equal(MULTI_LEVELS.length, 7);
  assert.equal(TOTAL_MULTI_LEVELS, 7);
  assert.deepEqual(
    MULTI_LEVELS.map((l) => l.n),
    [1, 2, 3, 4, 5, 6, 7],
  );
});

test("cada nivel cambia la capa o endurece parámetros, nunca las dos cosas", () => {
  for (let i = 1; i < MULTI_LEVELS.length; i++) {
    const prev = MULTI_LEVELS[i - 1] as MultiLevel;
    const cur = MULTI_LEVELS[i] as MultiLevel;
    const cambioCapa = prev.layer !== cur.layer;
    const cambioParams = JSON.stringify(prev.params) !== JSON.stringify(cur.params);
    assert.ok(
      !(cambioCapa && cambioParams),
      `el nivel ${cur.n} cambia la capa y los parámetros a la vez`,
    );
  }
});

test("los parámetros nunca se ablandan al avanzar de nivel", () => {
  for (let i = 1; i < MULTI_LEVELS.length; i++) {
    const prev = (MULTI_LEVELS[i - 1] as MultiLevel).params;
    const cur = (MULTI_LEVELS[i] as MultiLevel).params;
    assert.ok(cur.depth >= prev.depth, `el nivel ${i + 1} saca capas`);
    assert.ok(cur.ops.length >= prev.ops.length, `el nivel ${i + 1} saca cerraduras del juego`);
    assert.ok(cur.operand[1] >= prev.operand[1], `el nivel ${i + 1} achica el rango`);
    assert.ok(cur.cap >= prev.cap, `el nivel ${i + 1} baja el tope`);
    assert.ok(cur.keyCount >= prev.keyCount, `el nivel ${i + 1} saca llaves del llavero`);
    assert.ok(!prev.fractions || cur.fractions, `el nivel ${i + 1} vuelve a los enteros`);
    assert.ok(
      prev.distributable || !cur.distributable,
      `el nivel ${i + 1} vuelve a pedirle a la cadena que se reparta en enteros`,
    );
    assert.ok(!prev.cross || cur.cross, `el nivel ${i + 1} saca la ficha que cruza`);
  }
});

test("las capas del recorrido de abstracción llegan en orden y terminan en formal", () => {
  assert.deepEqual(
    MULTI_LEVELS.map((l) => l.layer),
    ["concrete", "concrete", "visual", "symbolic", "symbolic", "symbolic", "formal"],
  );
});

test("la analogía se retira en dos tiempos: primero la balanza, después los cofres", () => {
  const balanza = MULTI_LEVELS.map((l) => l.balance);
  const cofres = MULTI_LEVELS.map((l) => l.chests);
  assert.deepEqual(balanza.slice(0, 4), ["shown", "shown", "shown", "shown"]);
  assert.equal(balanza[4], "onDemand");
  assert.deepEqual(balanza.slice(5), ["hidden", "hidden"]);
  assert.deepEqual(cofres, [
    "drawn",
    "drawn",
    "drawn",
    "drawn",
    "onDemand",
    "hidden",
    "hidden",
  ]);
});

test("cada nivel declara verbos de K, rondas y una clave de título", () => {
  for (const l of MULTI_LEVELS) {
    assert.ok(l.evidence.length > 0, `el nivel ${l.n} no da evidencia de ningún verbo`);
    assert.ok(l.rounds >= 3, `el nivel ${l.n} es demasiado corto`);
    assert.match(l.titleKey, /^level\./, `el nivel ${l.n} lleva texto en vez de una clave`);
    assert.ok(l.asks.length > 0, `el nivel ${l.n} no pregunta nada`);
  }
});

test("la tubería no se retira nunca una vez que apareció", () => {
  const conTuberia = MULTI_LEVELS.map((l) => l.pipe);
  const primera = conTuberia.indexOf(true);
  assert.ok(primera > 0);
  assert.ok(conTuberia.slice(primera).every((v) => v));
});

// --- El problema generado ----------------------------------------------------

test("el generador es determinista: la misma semilla da el mismo problema", () => {
  for (const l of MULTI_LEVELS) {
    for (let r = 0; r < l.rounds; r++) {
      const a = generateMultiStep(l, 777 + r, r);
      const b = generateMultiStep(l, 777 + r, r);
      assert.equal(equationToText(a.equation), equationToText(b.equation));
      assert.deepEqual(
        a.keys.map((k) => `${k.kind}${k.op}${k.value}`),
        b.keys.map((k) => `${k.kind}${k.op}${k.value}`),
      );
    }
  }
});

test("la incógnita está envuelta en tantas capas como el nivel declara", () => {
  for (const l of MULTI_LEVELS) {
    for (const p of rondas(l, 6)) {
      const esperadas = p.ask === "commute" || p.degenerate !== "none" ? 2 : l.params.depth;
      assert.equal(p.layers.length, esperadas, `${equationToText(p.equation)} en el nivel ${l.n}`);
    }
  }
});

test("las capas viajan de afuera hacia adentro, que es el orden en que se abren", () => {
  for (const p of todas()) {
    p.layers.forEach((l, i) => assert.equal(l.depth, i));
    assert.deepEqual(multiUnwrapOrder(p.layers), p.layers.map((l) => l.id));
  }
});

test("la tubería es la ida: una máquina por capa, y su salida es el otro lado", () => {
  for (const p of todas()) {
    assert.equal(p.stages.length, p.layers.length);
    // Las máquinas van de adentro hacia afuera y las capas al revés: son la
    // misma lista leída en los dos sentidos, que es todo el contenido del nodo.
    assert.deepEqual(
      p.stages.map((s) => s.id),
      [...p.layers].reverse().map((l) => l.id),
    );
    const ultima = p.stages[p.stages.length - 1];
    assert.ok(ultima);
    const derecha = p.equation.rhs;
    assert.equal(derecha.kind, "num");
    // El cofre sin tesoro es el único donde la ida no llega al otro lado: eso
    // es exactamente lo que quiere decir que no tenga solución.
    if (derecha.kind === "num" && p.degenerate !== "no_solution") {
      assert.equal(ultima.out, derecha.value);
    }
  }
});

test("todo valor intermedio de la ida es un entero positivo y no pasa el tope", () => {
  for (const l of MULTI_LEVELS) {
    for (const p of rondas(l, 6)) {
      for (const s of p.stages) {
        assert.ok(Number.isInteger(s.out), `${equationToText(p.equation)} pasa por ${s.out}`);
        assert.ok(s.out >= 0, `${equationToText(p.equation)} pasa por ${s.out}`);
        assert.ok(s.out <= l.params.cap, `${equationToText(p.equation)} pasa por ${s.out}`);
      }
    }
  }
});

test("la ecuación de partida es cierta para la solución que el problema declara", () => {
  for (const p of todas()) {
    if (p.solution === null) continue;
    assert.ok(
      cierta(p.equation, p.solution),
      `${equationToText(p.equation)} no vale para x = ${p.solution}`,
    );
  }
});

test("las soluciones fraccionarias solo aparecen donde el nivel las declara", () => {
  for (const l of MULTI_LEVELS) {
    for (const p of rondas(l, 8)) {
      if (p.solution === null || Number.isInteger(p.solution)) continue;
      assert.ok(l.params.fractions, `el nivel ${l.n} soltó la fracción ${p.solution}`);
    }
  }
});

test("el nivel que las declara llega a soltar alguna solución fraccionaria", () => {
  const con = rondas(nivel(6), 12).filter((p) => p.solution !== null && !Number.isInteger(p.solution));
  assert.ok(con.length > 0, "el nivel de las fracciones nunca sacó una");
});

// --- El llavero --------------------------------------------------------------

test("el llavero cuelga la inversa de cada capa, y ninguna llave está repetida", () => {
  for (const p of todas()) {
    if (p.ask === "assemble") continue;
    const conLlave = p.layers.filter((l) => llaveDe(p, l) !== undefined);
    // El cofre de los casos especiales tiene una capa sin llave: es el que
    // perdió el tesoro, y que no la tenga es la respuesta del nivel.
    assert.equal(conLlave.length, p.degenerate === "none" ? p.layers.length : 1);
    for (const l of conLlave) {
      const k = llaveDe(p, l) as MultiKey;
      assert.equal(k.op, inverseOf(l.op));
      assert.equal(k.value, l.value);
    }
    const caras = p.keys.map((k) => `${k.kind}${k.op}${k.value}`);
    assert.equal(new Set(caras).size, caras.length, `llaves repetidas en ${caras.join(",")}`);
  }
});

test("el llavero nunca pasa las ranuras que la escena tiene montadas", () => {
  for (const l of MULTI_LEVELS) {
    assert.ok(l.params.keyCount <= MULTI_KEY_SLOTS);
    for (const p of rondas(l, 6)) {
      assert.ok(p.keys.length <= MULTI_KEY_SLOTS);
      assert.ok(p.tiles.length <= MULTI_TILE_SLOTS);
    }
  }
});

test("la ficha que cruza el igual solo cuelga donde el nivel la declara", () => {
  for (const l of MULTI_LEVELS) {
    for (const p of rondas(l, 6)) {
      const cruces = p.keys.filter((k) => k.kind === "cross");
      if (!l.params.cross) assert.equal(cruces.length, 0, `el nivel ${l.n} colgó una ficha que cruza`);
      else if (p.ask !== "assemble") assert.equal(cruces.length, 1);
    }
  }
});

test("la llave que abre ahora es la inversa de la capa expuesta", () => {
  for (const p of todas()) {
    if (p.ask === "assemble") continue;
    const capa = multiOuterLayer(p.layers, []);
    assert.ok(capa);
    const k = multiCorrectKey(p, []);
    assert.ok(k, `sin llave para ${equationToText(p.equation)}`);
    assert.equal(k.op, inverseOf(capa.op));
    assert.equal(k.value, capa.value);
  }
});

test("armar la llave: sin llaves prearmadas, con las cuatro operaciones y los números de las capas", () => {
  for (const p of rondas(nivel(6), 8)) {
    assert.equal(p.ask, "assemble");
    assert.equal(p.keys.length, 0);
    assert.deepEqual([...p.ops], ["+", "-", "*", "/"]);
    for (const l of p.layers) {
      assert.ok(p.tiles.includes(l.value), `falta la ficha ${l.value} en ${p.tiles.join(",")}`);
    }
  }
});

// --- Abrir en orden ----------------------------------------------------------

test("abrir de afuera hacia adentro despeja la incógnita en tantos pasos como capas", () => {
  for (const l of MULTI_LEVELS) {
    for (const p of rondas(l, 6)) {
      if (p.degenerate !== "none") continue;
      const { eq, pasos } = resolver(p);
      assert.equal(pasos, p.layers.length);
      assert.equal(goalCost(eq, MULTI_UNKNOWN), 0, `${equationToText(eq)} no dejó sola a la x`);
      assert.equal(eq.lhs.kind, "sym");
      assert.equal(eq.rhs.kind, "num");
      if (eq.rhs.kind === "num" && p.solution !== null) {
        assert.ok(
          Math.abs(eq.rhs.value - p.solution) < 1e-9,
          `${equationToText(eq)} contra x = ${p.solution}`,
        );
      }
    }
  }
});

test("cada paso conserva la solución: las ecuaciones son equivalentes", () => {
  for (const p of todas(5)) {
    if (p.degenerate !== "none" || p.solution === null) continue;
    let eq = p.equation;
    const opened: string[] = [];
    while (!multiSolved(p.layers, opened)) {
      const capa = multiOuterLayer(p.layers, opened);
      assert.ok(capa);
      const key = llaveDe(p, capa) ?? {
        id: "armada",
        op: inverseOf(capa.op),
        value: capa.value,
        kind: "apply" as const,
        layer: capa.id,
      };
      eq = multiJudge(eq, key, p, opened).next;
      opened.push(capa.id);
      assert.ok(cierta(eq, p.solution), `${equationToText(eq)} dejó de valer para ${p.solution}`);
    }
  }
});

test("abrir es lo único que baja la cuenta de nodos que acompañan a la incógnita", () => {
  for (const p of todas(5)) {
    for (const key of p.keys) {
      const m = multiJudge(p.equation, key, p, []);
      if (m.verdict === "opens") {
        assert.ok(m.cost < m.costBefore, `abrió sin acercar en ${equationToText(p.equation)}`);
      } else {
        assert.ok(
          m.cost >= m.costBefore,
          `${key.op}${key.value} acercó sin abrir en ${equationToText(p.equation)}`,
        );
      }
    }
  }
});

test("la llave de una capa interior rebota: es válida, cierta y más larga", () => {
  let vistas = 0;
  for (const p of todas(6)) {
    if (p.solution === null || p.commuting) continue;
    for (const key of p.keys) {
      if (key.kind !== "apply") continue;
      const interior = p.layers.slice(1).some((l) => l.id === key.layer);
      if (!interior) continue;
      vistas++;
      const m = multiJudge(p.equation, key, p, []);
      assert.equal(m.verdict, "stalls");
      assert.equal(m.misconception, "unwrap_order_inverted");
      // Válido: la igualdad sigue siendo cierta. Inútil: el renglón creció.
      assert.ok(cierta(m.next, p.solution), `${equationToText(m.next)} dejó de ser cierta`);
      assert.ok(m.cost > m.costBefore, `${equationToText(m.next)} no quedó más largo`);
    }
  }
  assert.ok(vistas > 20, `solo se probaron ${vistas} llaves interiores`);
});

test("la llave que no deshace ninguna capa se traba, y se traba sin id inventado", () => {
  let vistas = 0;
  for (const p of todas(6)) {
    for (const key of p.keys) {
      if (key.kind !== "apply" || key.layer !== null) continue;
      vistas++;
      const m = multiJudge(p.equation, key, p, []);
      assert.ok(m.verdict === "jams" || m.verdict === "stalls");
      if (m.verdict === "jams") assert.equal(m.misconception, undefined);
    }
  }
  assert.ok(vistas > 20, `solo se probaron ${vistas} llaves sin capa`);
});

test("la ficha que cruza el igual inclina la barra y rompe la igualdad", () => {
  let vistas = 0;
  for (const p of todas(6)) {
    if (p.solution === null) continue;
    const cruce = p.keys.find((k) => k.kind === "cross");
    if (!cruce) continue;
    vistas++;
    const m = multiJudge(p.equation, cruce, p, []);
    assert.equal(m.verdict, "tilts");
    assert.equal(m.misconception, "sign_flip_on_move");
    assert.ok(
      !cierta(m.next, p.solution),
      `cruzar el igual dejó ${equationToText(m.next)}, que todavía vale`,
    );
  }
  assert.ok(vistas > 10, `solo se probaron ${vistas} fichas que cruzan`);
});

// --- Capas que conmutan ------------------------------------------------------

test("con capas que conmutan los dos órdenes despejan", () => {
  const con = rondas(nivel(7), 10).filter((p) => p.commuting);
  assert.ok(con.length > 0, "el último nivel nunca sacó una ronda de capas que conmutan");
  for (const p of con) {
    assert.ok(multiCommutes(p.layers, []));
    const interior = p.layers[1];
    assert.ok(interior);
    const key = llaveDe(p, interior);
    assert.ok(key, "la capa interior no tiene llave");
    const m = multiJudge(p.equation, key, p, []);
    assert.equal(m.verdict, "opens", `${equationToText(p.equation)} no dejó abrir por adentro`);
    assert.equal(m.layer, interior.id);
    assert.ok(p.solution !== null && cierta(m.next, p.solution));
  }
});

test("sin capas que conmutan la de adentro rebota aunque el orden sea el único obstáculo", () => {
  for (const p of rondas(nivel(4), 8)) {
    if (multiCommutes(p.layers, [])) continue;
    const interior = p.layers[1];
    if (!interior) continue;
    const key = llaveDe(p, interior);
    if (!key) continue;
    assert.equal(multiJudge(p.equation, key, p, []).verdict, "stalls");
  }
});

test("traer una capa afuera conserva el valor y la identidad de cada término", () => {
  const con = rondas(nivel(7), 10).filter((p) => p.commuting);
  for (const p of con) {
    const interior = p.layers[1];
    assert.ok(interior && p.solution !== null);
    const movida = multiBringOut(p.equation, MULTI_UNKNOWN, interior.id);
    assert.ok(cierta(movida, p.solution), `${equationToText(movida)} cambió de valor`);
    const antes = new Set([...idsDe(p.equation.lhs)]);
    const despues = new Set([...idsDe(movida.lhs)]);
    assert.deepEqual([...despues].sort(), [...antes].sort());
  }
});

function* idsDe(node: MathNode): Generator<string> {
  yield node.id;
  if (node.kind === "op") for (const a of node.args) yield* idsDe(a);
}

// --- Los casos especiales ----------------------------------------------------

test("el cofre sin tesoro no tiene solución y el que abre con cualquier llave es identidad", () => {
  const casos = rondas(nivel(7), 10).filter((p) => p.degenerate !== "none");
  assert.ok(casos.length > 0, "el último nivel nunca sacó un caso especial");
  const vistos = new Set(casos.map((p) => p.degenerate));
  assert.ok(vistos.has("no_solution"));
  assert.ok(vistos.has("identity"));
  for (const p of casos) {
    assert.equal(p.solution, null);
    // La capa de adentro es la que perdió el tesoro: multiplicar por cero no
    // tiene llave, y por eso ninguna la cuelga.
    const dentro = p.layers[1];
    assert.ok(dentro);
    assert.equal(dentro.op, "*");
    assert.equal(dentro.value, 0);
    assert.equal(llaveDe(p, dentro), undefined);
    // Y las dos se distinguen jugando: la identidad vale para cualquier valor.
    const vale = [0, 1, 7, 13].every((v) => cierta(p.equation, v));
    assert.equal(vale, p.degenerate === "identity");
  }
});

test("abrir la capa que sí tiene llave deja el cofre vacío a la vista", () => {
  for (const p of rondas(nivel(7), 8)) {
    if (p.degenerate === "none") continue;
    const afuera = p.layers[0];
    const key = llaveDe(p, afuera as { op: string; value: number });
    assert.ok(key);
    const m = multiJudge(p.equation, key, p, []);
    assert.equal(m.verdict, "opens");
    assert.equal(multiPending(p.layers, [m.layer as string]).length, 1);
  }
});

// --- El catálogo de errores --------------------------------------------------

test("solo se emiten los dos ids que el catálogo de L apunta a este nodo", () => {
  // `unwrap_order_inverted` y `sign_flip_on_move` listan `alg.eq.multi_step` en
  // `misconceptions.yaml`. `wrong_inverse_choice` está catalogada pero **no**
  // lista este nodo, así que el movimiento va sin campo: un id inventado
  // ensucia la remediación para siempre.
  assert.deepEqual(
    Object.entries(MULTI_MISCONCEPTION)
      .filter(([, id]) => id !== null)
      .map(([, id]) => id)
      .sort(),
    ["sign_flip_on_move", "unwrap_order_inverted"],
  );
  assert.equal(multiMisconceptionFor("wrong_inverse"), undefined);
  assert.equal(multiMisconceptionFor("near_value"), undefined);
  assert.equal(multiMisconceptionFor(undefined), undefined);
  assert.equal(multiMisconceptionFor("unwrap_order_inverted"), "unwrap_order_inverted");
  assert.equal(multiMisconceptionFor("sign_flip_on_move"), "sign_flip_on_move");
});

test("ningún movimiento emite un id fuera de esos dos", () => {
  const permitidos = new Set(["unwrap_order_inverted", "sign_flip_on_move"]);
  for (const p of todas(5)) {
    for (const key of p.keys) {
      const m = multiJudge(p.equation, key, p, []);
      if (m.misconception === undefined) continue;
      assert.ok(permitidos.has(m.misconception), `id inventado: ${m.misconception}`);
    }
  }
});

// --- El registro -------------------------------------------------------------

test("el nodo se anota en el registro con su lugar en la espina y sus prerequisitos", () => {
  const spec = nodeById(NODE_MULTI_STEP);
  assert.ok(spec);
  assert.equal(spec.n, 14);
  assert.deepEqual([...spec.prereqs].sort(), ["alg.eq.one_step", "arith.expr.precedence_tree"]);
  assert.equal(spec.levels.length, TOTAL_MULTI_LEVELS);
});

test("el nodo se abre recién cuando los dos prerequisitos están terminados", () => {
  assert.equal(isNodeOpen(NODE_MULTI_STEP, {}), false);
  assert.equal(isNodeOpen(NODE_MULTI_STEP, { "alg.eq.one_step": 8 }), false);
  assert.equal(
    isNodeOpen(NODE_MULTI_STEP, { "alg.eq.one_step": 8, "arith.expr.precedence_tree": 8 }),
    true,
  );
});

test("multiLevelByNumber devuelve el nivel pedido y nada fuera de rango", () => {
  for (const l of MULTI_LEVELS) assert.equal(multiLevelByNumber(l.n), l);
  assert.equal(multiLevelByNumber(0), undefined);
  assert.equal(multiLevelByNumber(8), undefined);
});

test("con la balanza a la vista el plato de la incógnita cae en cajas y pesas enteras", () => {
  for (const l of MULTI_LEVELS) {
    if (!l.params.distributable) continue;
    for (const p of rondas(l, 10)) {
      const { boxes, units } = multiDistribute([...p.stages]);
      assert.ok(
        Number.isInteger(units),
        `${equationToText(p.equation)} deja ${units} pesas en el plato`,
      );
      assert.ok(
        Number.isInteger(boxes) || Number.isInteger(1 / boxes),
        `${equationToText(p.equation)} deja ${boxes} cajas en el plato`,
      );
    }
  }
});

test("el plato repartido dice lo mismo que la ecuación para la solución", () => {
  for (const p of todas(6)) {
    if (p.solution === null) continue;
    const { boxes, units } = multiDistribute([...p.stages]);
    const derecha = p.equation.rhs;
    if (derecha.kind !== "num") continue;
    assert.ok(
      Math.abs(boxes * p.solution + units - derecha.value) < 1e-9,
      `${equationToText(p.equation)} reparte en ${boxes}x + ${units}`,
    );
  }
});

test("dos capas seguidas nunca son la misma operación ni se deshacen entre sí", () => {
  for (const l of MULTI_LEVELS) {
    for (const p of rondas(l, 8)) {
      if (p.commuting || p.degenerate !== "none") continue;
      for (let i = 1; i < p.stages.length; i++) {
        const prev = p.stages[i - 1] as { op: string; value: number };
        const cur = p.stages[i] as { op: string; value: number };
        assert.notEqual(cur.op, prev.op, `${equationToText(p.equation)} repite ${cur.op}`);
        assert.ok(
          !(inverseOf(cur.op as "+" | "-" | "*" | "/") === prev.op && cur.value === prev.value),
          `${equationToText(p.equation)} tiene dos capas que se cancelan`,
        );
      }
    }
  }
});

test("una solución fraccionaria se escribe entera: nada de decimales que se cortan", () => {
  for (const p of todas(10)) {
    if (p.solution === null || Number.isInteger(p.solution)) continue;
    const escrito = String(Number(p.solution.toFixed(6)));
    assert.ok(
      Math.abs(Number(escrito) - p.solution) < 1e-12,
      `x = ${p.solution} se escribiría como ${escrito}`,
    );
  }
});
