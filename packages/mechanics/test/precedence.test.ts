import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluate, toText, walk, type MathNode } from "@mathy/math-core";
import {
  NODE_PRECEDENCE_TREE,
  PREC_CHEST_SLOTS,
  PREC_EVIDENCE,
  PREC_KEY_SLOTS,
  PREC_LEVELS,
  PREC_MAX_DEPTH,
  PREC_MAX_VALUE,
  PREC_MISCONCEPTION,
  PREC_OPTION_SLOTS,
  TOTAL_PREC_LEVELS,
  generatePrecedence,
  isNodeOpen,
  nodeById,
  precAccessible,
  precApplyLock,
  precBites,
  precFigureFor,
  precInnermost,
  precInverse,
  precLevelByNumber,
  precMisconceptionFor,
  precPipeValue,
  precRank,
  precRowSaysTheTree,
  precSameFigure,
  type PrecChest,
  type PrecLevel,
  type PrecProblem,
} from "../src/index.ts";

const seeds = (n: number): number[] => Array.from({ length: n }, (_, i) => i * 37 + 1);

/** Todas las rondas de un nivel, para todas las semillas de la muestra. */
function rounds(level: PrecLevel, n = 24): PrecProblem[] {
  const out: PrecProblem[] = [];
  for (const seed of seeds(n)) {
    for (let r = 0; r < level.rounds; r++) out.push(generatePrecedence(level, seed + r, r));
  }
  return out;
}

const todas = (): PrecProblem[] => PREC_LEVELS.flatMap((l) => rounds(l, 12));

/** Las rondas que arman un encastre. La tubería y las figuras no tienen cofres. */
const conCofres = (): PrecProblem[] => todas().filter((p) => p.chests.length > 0);

// --- Los niveles como datos --------------------------------------------------

test("los ocho niveles del diseño están, en orden y sin repetir", () => {
  assert.equal(PREC_LEVELS.length, 8);
  assert.equal(TOTAL_PREC_LEVELS, 8);
  assert.deepEqual(
    PREC_LEVELS.map((l) => l.n),
    [1, 2, 3, 4, 5, 6, 7, 8],
  );
});

test("cada nivel cambia la capa o endurece parámetros, nunca las dos cosas", () => {
  for (let i = 1; i < PREC_LEVELS.length; i++) {
    const prev = PREC_LEVELS[i - 1] as PrecLevel;
    const cur = PREC_LEVELS[i] as PrecLevel;
    const cambioCapa = prev.layer !== cur.layer;
    const cambioParams = JSON.stringify(prev.params) !== JSON.stringify(cur.params);
    assert.ok(
      !(cambioCapa && cambioParams),
      `el nivel ${cur.n} cambia la capa y los parámetros a la vez`,
    );
  }
});

test("los parámetros nunca se ablandan al avanzar de nivel", () => {
  for (let i = 1; i < PREC_LEVELS.length; i++) {
    const prev = (PREC_LEVELS[i - 1] as PrecLevel).params;
    const cur = (PREC_LEVELS[i] as PrecLevel).params;
    assert.ok(cur.depth >= prev.depth, `el nivel ${i + 1} saca un cofre de la mesa`);
    assert.ok(cur.operands[1] >= prev.operands[1], `el nivel ${i + 1} achica los números`);
    assert.ok(cur.ops.length >= prev.ops.length, `el nivel ${i + 1} saca cerraduras`);
    // Los cofres dibujados se retiran y no vuelven; los pares del mismo nivel y
    // el recorrido de vuelta entran y no se van.
    assert.ok(
      !(cur.drawnChests && !prev.drawnChests),
      `el nivel ${i + 1} vuelve a dibujar los cofres`,
    );
    assert.ok(!(prev.sameLevel && !cur.sameLevel), `el nivel ${i + 1} saca los pares del mismo nivel`);
    assert.ok(!(prev.undo && !cur.undo), `el nivel ${i + 1} deja de pedir el recorrido de vuelta`);
  }
});

test("el nodo recorre las cuatro capas del diseño y termina en la definición", () => {
  assert.deepEqual(
    [...new Set(PREC_LEVELS.map((l) => l.layer))],
    ["concrete", "visual", "symbolic", "formal"],
  );
  assert.equal((PREC_LEVELS.at(-1) as PrecLevel).layer, "formal");
  assert.deepEqual(
    PREC_LEVELS.filter((l) => l.definition).map((l) => l.n),
    [8],
  );
});

test("los cinco verbos del nodo aparecen en algún nivel", () => {
  const vistos = new Set(PREC_LEVELS.flatMap((l) => l.evidence));
  for (const verbo of PREC_EVIDENCE) {
    assert.ok(vistos.has(verbo), `ningún nivel da evidencia de ${verbo}`);
  }
});

test("los numerales llegan recién con la fila, y no antes", () => {
  // El nodo es `literacy: none`: los niveles 1 a 4 se juegan sin un solo número.
  assert.deepEqual(
    PREC_LEVELS.filter((l) => l.numerals).map((l) => l.n),
    [5, 6, 7, 8],
  );
  for (const l of PREC_LEVELS) {
    assert.equal(l.row, l.numerals, `el nivel ${l.n} desacopla la fila de los numerales`);
  }
});

test("el nodo está en el registro con su número de espina y su prerequisito", () => {
  const spec = nodeById(NODE_PRECEDENCE_TREE);
  assert.ok(spec);
  assert.equal(spec.n, 9);
  assert.deepEqual(spec.prereqs, ["arith.mul.scaling"]);
  assert.equal(spec.levels.length, 8);
});

test("el nodo se abre recién cuando el estirado quedó terminado", () => {
  const prereq = nodeById("arith.mul.scaling");
  assert.ok(prereq);
  assert.equal(isNodeOpen(NODE_PRECEDENCE_TREE, {}), false);
  assert.equal(
    isNodeOpen(NODE_PRECEDENCE_TREE, { "arith.mul.scaling": prereq.levels.length - 1 }),
    false,
  );
  assert.equal(
    isNodeOpen(NODE_PRECEDENCE_TREE, { "arith.mul.scaling": prereq.levels.length }),
    true,
  );
});

// --- El encastre -------------------------------------------------------------

test("el generador es determinista: la misma semilla da la misma ronda", () => {
  for (const level of PREC_LEVELS) {
    for (let r = 0; r < level.rounds; r++) {
      const a = generatePrecedence(level, 4242 + r, r);
      const b = generatePrecedence(level, 4242 + r, r);
      assert.equal(toText(a.tree), toText(b.tree));
      assert.equal(a.value, b.value);
      assert.equal(a.ask, b.ask);
      assert.deepEqual(
        a.chests.map((c) => [c.op, c.depth, c.value]),
        b.chests.map((c) => [c.op, c.depth, c.value]),
      );
    }
  }
});

test("cada ronda pide lo que su nivel declara, ciclando", () => {
  for (const level of PREC_LEVELS) {
    for (let r = 0; r < level.rounds; r++) {
      const p = generatePrecedence(level, 99 + r, r);
      assert.equal(p.ask, level.asks[r % level.asks.length]);
    }
  }
});

test("el tesoro del cofre de afuera es lo que vale el árbol", () => {
  for (const p of conCofres()) {
    assert.equal(evaluate(p.tree), p.value, `${toText(p.tree)} no vale ${p.value}`);
  }
});

test("el tesoro de cada cofre es lo que vale su subárbol", () => {
  for (const p of conCofres()) {
    const porId = new Map<string, MathNode>();
    for (const n of walk(p.tree)) porId.set(n.id, n);
    for (const c of p.chests) {
      const nodo = porId.get(c.id);
      assert.ok(nodo, `el cofre ${c.id} no es un nodo del árbol`);
      assert.equal(evaluate(nodo), c.value);
    }
  }
});

test("los cofres son una cadena: cada uno tiene exactamente uno adentro", () => {
  for (const p of conCofres()) {
    assert.deepEqual(
      p.chests.map((c) => c.depth),
      p.chests.map((_, i) => i),
      "las profundidades no bajan de a uno desde el cofre de afuera",
    );
    for (let i = 0; i < p.chests.length - 1; i++) {
      const padre = p.chests[i] as PrecChest;
      const hijo = p.chests[i + 1] as PrecChest;
      const dentro = padre.slots.filter((s) => s.kind === "chest");
      assert.equal(dentro.length, 1, "un cofre tiene un solo cofre adentro");
      assert.equal((dentro[0] as { id: string }).id, hijo.id);
    }
    const ultimo = p.chests[p.chests.length - 1] as PrecChest;
    assert.ok(
      ultimo.slots.every((s) => s.kind === "num"),
      "el cofre de más adentro tiene dos números y ningún cofre",
    );
  }
});

test("la cantidad de cofres es la profundidad que el nivel pide", () => {
  for (const level of PREC_LEVELS) {
    for (const p of rounds(level, 8)) {
      if (p.chests.length === 0) continue;
      assert.equal(p.chests.length, level.params.depth);
      assert.ok(p.chests.length <= PREC_MAX_DEPTH);
    }
  }
});

test("las cuentas cierran en enteros no negativos: no hay fracciones ni negativos adentro", () => {
  for (const p of conCofres()) {
    for (const c of p.chests) {
      assert.ok(Number.isInteger(c.value), `${toText(p.tree)} deja ${c.value} adentro`);
      assert.ok(c.value >= 1, `${toText(p.tree)} deja ${c.value} adentro`);
    }
    assert.ok(p.value <= PREC_MAX_VALUE);
  }
});

test("solo entran las cerraduras que el nivel declara", () => {
  for (const level of PREC_LEVELS) {
    for (const p of rounds(level, 8)) {
      for (const c of p.chests) {
        assert.ok(level.params.ops.includes(c.op), `el nivel ${level.n} usó ${c.op}`);
      }
    }
  }
});

// --- La fila escrita ---------------------------------------------------------

test("la fila escrita nunca miente sobre el árbol", () => {
  // `typeset` escribe paréntesis solo cuando una suma cae dentro de un
  // producto. Un cofre del mismo nivel colgado a la derecha se escribiría sin
  // paredes y la fila diría otro árbol; el generador no arma esos.
  for (const p of conCofres()) {
    assert.ok(precRowSaysTheTree(p.tree), `${toText(p.tree)} se escribe ambigua`);
  }
});

test("sin cofres dibujados la fila no lleva paréntesis: la jerarquía es todo lo que hay", () => {
  for (const level of PREC_LEVELS) {
    if (level.params.drawnChests) continue;
    for (const p of rounds(level, 12)) {
      for (const c of p.chests) {
        assert.equal(c.written, false, `el nivel ${level.n} escribió paredes en ${toText(p.tree)}`);
      }
    }
  }
});

test("el nivel de las paredes siempre tiene un par escrito para envolver", () => {
  const level = precLevelByNumber(5) as PrecLevel;
  for (const p of rounds(level, 16)) {
    assert.ok(
      p.chests.some((c) => c.written),
      `${toText(p.tree)} no tiene nada que envolver`,
    );
  }
});

test("los pares del mismo nivel llegan en su nivel y no antes", () => {
  for (const level of PREC_LEVELS) {
    if (level.params.sameLevel) continue;
    for (const p of rounds(level, 12)) {
      for (let i = 0; i < p.chests.length - 1; i++) {
        const fuera = p.chests[i] as PrecChest;
        const dentro = p.chests[i + 1] as PrecChest;
        const aLaIzquierda = fuera.slots[0]?.kind === "chest";
        assert.ok(
          !(aLaIzquierda && precRank(dentro.op) === precRank(fuera.op)),
          `el nivel ${level.n} armó ${toText(p.tree)}, que se decide por acuerdo`,
        );
      }
    }
  }
});

test("la jerarquía es la del acuerdo: multiplicar y dividir van más adentro", () => {
  assert.equal(precRank("*"), precRank("/"));
  assert.equal(precRank("+"), precRank("-"));
  assert.ok(precRank("*") > precRank("+"));
});

test("el predicado de ambigüedad reconoce el caso que lo motiva", () => {
  const { op: mk, num: n } = fabrica();
  // `12 ÷ (3 × 2)` se escribiría `12 ÷ 3 × 2`, que dice otro árbol.
  assert.equal(precRowSaysTheTree(mk("/", [n(12), mk("*", [n(3), n(2)])])), false);
  // `(12 ÷ 3) × 2` se escribe tal cual y no necesita paredes.
  assert.equal(precRowSaysTheTree(mk("*", [mk("/", [n(12), n(3)]), n(2)])), true);
  // `2 + 3 × 4`, el ejemplo del documento.
  assert.equal(precRowSaysTheTree(mk("+", [n(2), mk("*", [n(3), n(4)])])), true);
});

// --- Los dos órdenes opuestos ------------------------------------------------

test("para calcular se abre desde adentro y para deshacer desde afuera", () => {
  for (const level of PREC_LEVELS) {
    for (const p of rounds(level, 8)) {
      if (p.chests.length === 0) continue;
      const profundidades = p.order.map(
        (id) => (p.chests.find((c) => c.id === id) as PrecChest).depth,
      );
      const esperado = p.chests.map((c) => c.depth);
      assert.deepEqual(
        profundidades,
        level.params.undo ? esperado : [...esperado].reverse(),
        `el nivel ${level.n} abre en el orden equivocado`,
      );
    }
  }
});

test("la llave del cofre de afuera gira en el vacío hasta que el de adentro entrega", () => {
  const level = precLevelByNumber(1) as PrecLevel;
  for (const p of rounds(level, 8)) {
    const fuera = p.chests[0] as PrecChest;
    const dentro = precInnermost(p) as PrecChest;
    assert.equal(precBites(p, fuera.id, 0), false, "el de afuera mordió primero");
    assert.equal(precBites(p, dentro.id, 0), true, "el de adentro no mordió");
    assert.equal(precBites(p, fuera.id, 1), true, "el de afuera no mordió después");
  }
});

test("deshaciendo pasa lo contrario, con la misma lista al revés", () => {
  const level = precLevelByNumber(7) as PrecLevel;
  for (const p of rounds(level, 8)) {
    const fuera = p.chests[0] as PrecChest;
    const dentro = precInnermost(p) as PrecChest;
    assert.equal(precBites(p, dentro.id, 0), false, "el de adentro salió primero");
    assert.equal(precBites(p, fuera.id, 0), true, "el de afuera no salió primero");
    assert.equal((precAccessible(p, 0) as PrecChest).depth, 0);
  }
});

test("la llave es la operación que deshace la cerradura", () => {
  assert.equal(precInverse("+"), "-");
  assert.equal(precInverse("-"), "+");
  assert.equal(precInverse("*"), "/");
  assert.equal(precInverse("/"), "*");
  for (const p of conCofres()) {
    assert.equal(p.keys.length, p.chests.length);
    for (const k of p.keys) {
      const cofre = p.chests.find((c) => c.id === k.chestId) as PrecChest;
      assert.equal(k.lock, cofre.op);
      assert.equal(k.inverse, precInverse(cofre.op));
    }
  }
});

// --- La misconception --------------------------------------------------------

test("solo el nivel de vuelta clasifica, y solo cuando se empieza por adentro", () => {
  const vuelta = precLevelByNumber(7) as PrecLevel;
  for (const p of rounds(vuelta, 8)) {
    const dentro = precInnermost(p) as PrecChest;
    const fuera = p.chests[0] as PrecChest;
    assert.equal(precMisconceptionFor(p, dentro.id, 0), PREC_MISCONCEPTION);
    assert.equal(precMisconceptionFor(p, fuera.id, 0), undefined, "el movimiento correcto clasificó");
  }
});

test("calcular empezando por afuera no clasifica: es la llave girando en el vacío", () => {
  // El error existe y el diseño lo prevé, pero `L` no tiene entrada para él
  // sobre este nodo, así que el `attempt` va sin campo.
  for (const level of PREC_LEVELS) {
    if (level.params.undo) continue;
    for (const p of rounds(level, 8)) {
      for (const c of p.chests) {
        assert.equal(precMisconceptionFor(p, c.id, 0), undefined);
      }
    }
  }
});

test("el único id de misconception es el que el catálogo declara sobre el nodo", () => {
  assert.equal(PREC_MISCONCEPTION, "unwrap_order_inverted");
  const vistos = new Set<string>();
  for (const level of PREC_LEVELS) {
    for (const p of rounds(level, 6)) {
      for (const c of p.chests) {
        const m = precMisconceptionFor(p, c.id, 0);
        if (m) vistos.add(m);
      }
    }
  }
  assert.deepEqual([...vistos], [PREC_MISCONCEPTION]);
});

// --- Las fichas --------------------------------------------------------------

test("las preguntas que se tocan traen una sola ficha correcta y ninguna al azar", () => {
  for (const p of todas()) {
    if (p.options.length === 0) continue;
    assert.ok(p.options.length <= PREC_OPTION_SLOTS);
    assert.equal(p.options.filter((o) => o.correct).length, 1);
    for (const o of p.options) {
      if (o.correct) continue;
      assert.ok(o.lure, `una ficha equivocada llegó sin motivo en ${p.ask}`);
    }
  }
});

test("reconocer y generalizar señalan el cofre de más adentro", () => {
  for (const level of PREC_LEVELS) {
    for (const p of rounds(level, 8)) {
      if (p.ask !== "recognize" && p.ask !== "ghost" && p.ask !== "wrap") continue;
      const correcta = p.options.find((o) => o.correct);
      assert.ok(correcta);
      assert.equal(correcta.nodeId, (precInnermost(p) as PrecChest).id);
    }
  }
});

test("explicar se contesta tocando la animación que abre en orden invertido", () => {
  const level = precLevelByNumber(3) as PrecLevel;
  for (const p of rounds(level, 8)) {
    if (p.ask !== "explain") continue;
    assert.equal(p.options.length, 2);
    const correcta = p.options.find((o) => o.correct) as { order: readonly string[] };
    const otra = p.options.find((o) => !o.correct) as { order: readonly string[] };
    // La correcta es la que empieza por el cofre de afuera: es la que se pide
    // señalar justamente porque es la que no calcula.
    assert.equal(correcta.order[0], (p.chests[0] as PrecChest).id);
    assert.equal(otra.order[0], (precInnermost(p) as PrecChest).id);
  }
});

// --- La tubería --------------------------------------------------------------

test("la tubería llega dada vuelta: si llegara bien no habría nada que hacer", () => {
  const level = precLevelByNumber(4) as PrecLevel;
  for (const p of rounds(level, 12)) {
    assert.equal(p.machines.length, 2);
    assert.notDeepEqual(
      p.machines.map((m) => m.id),
      p.solution,
    );
    const ordenada = p.solution.map((id) => p.machines.find((m) => m.id === id));
    assert.ok(ordenada.every(Boolean));
    assert.equal(precPipeValue(p.input, ordenada as never), p.output);
  }
});

test("dar vuelta el caño cambia la salida: ese es el contenido del nivel", () => {
  const level = precLevelByNumber(4) as PrecLevel;
  for (const p of rounds(level, 12)) {
    assert.notEqual(
      precPipeValue(p.input, p.machines),
      p.output,
      "las dos máquinas conmutan y el nivel no enseña nada",
    );
  }
});

test("la misma entrada por el mismo camino da siempre la misma salida", () => {
  const level = precLevelByNumber(4) as PrecLevel;
  for (const p of rounds(level, 8)) {
    assert.equal(precPipeValue(p.input, p.machines), precPipeValue(p.input, p.machines));
  }
});

// --- Las cerraduras que no son aritméticas -----------------------------------

test("girar y agregar no conmutan, y por eso el último nivel se puede jugar", () => {
  const level = precLevelByNumber(8) as PrecLevel;
  for (const p of rounds(level, 12)) {
    assert.equal(p.locks.length, 2);
    assert.equal(p.options.length, 2);
    const inicio = { turn: 0, color: 0, dots: [] as readonly number[] };
    const figuras = p.options.map((o) => precFigureFor(inicio, p.locks, o.order));
    assert.equal(
      precSameFigure(figuras[0] as never, figuras[1] as never),
      false,
      "los dos órdenes dieron la misma figura",
    );
    const correcta = p.options.findIndex((o) => o.correct);
    assert.ok(precSameFigure(figuras[correcta] as never, p.figure));
  }
});

test("girar mueve los puntos que ya están y agregar pone uno arriba", () => {
  const inicio = { turn: 0, color: 0, dots: [] as readonly number[] };
  const conPunto = precApplyLock(inicio, { id: "l1", kind: "add", value: 1 });
  assert.deepEqual(conPunto.dots, [0]);
  const girado = precApplyLock(conPunto, { id: "l0", kind: "turn", value: 1 });
  assert.deepEqual(girado.dots, [1]);
  const alReves = precApplyLock(precApplyLock(inicio, { id: "l0", kind: "turn", value: 1 }), {
    id: "l1",
    kind: "add",
    value: 1,
  });
  assert.deepEqual(alReves.dots, [0]);
});

// --- Modo retained -----------------------------------------------------------

test("nada de lo que se dibuja pasa de las ranuras montadas", () => {
  for (const p of todas()) {
    assert.ok(p.chests.length <= PREC_CHEST_SLOTS);
    assert.ok(p.keys.length <= PREC_KEY_SLOTS);
    assert.ok(p.options.length <= PREC_OPTION_SLOTS);
    assert.ok(p.machines.length <= PREC_MAX_DEPTH);
  }
});

/** Un constructor de árboles con ids propios, para los casos escritos a mano. */
function fabrica(): {
  op: (o: "+" | "-" | "*" | "/", args: readonly MathNode[]) => MathNode;
  num: (v: number) => MathNode;
} {
  let i = 0;
  return {
    num: (v: number) => ({ id: `t${++i}`, kind: "num", value: v }),
    op: (o, args) => ({ id: `t${++i}`, kind: "op", op: o, args }),
  };
}
