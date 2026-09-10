import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BAL_DEFINITION_KEYS,
  BAL_EVIDENCE,
  BAL_LEVELS,
  BAL_MISCONCEPTIONS,
  BAL_PAN_SLOTS,
  BAL_RESERVE_SLOTS,
  NODE_BALANCE_EQ,
  TILT_FLOOR,
  TOTAL_BAL_LEVELS,
  balApply,
  balBoxAlone,
  balLevelByNumber,
  balLevelled,
  balMass,
  balMirrors,
  balMisconceptionFor,
  balOtherSide,
  balPairs,
  balSolved,
  balStart,
  balTilt,
  generateBalanceEq,
  isNodeOpen,
  nodeById,
  type BalLevel,
  type BalMove,
  type BalProblem,
  type BalSide,
  type BalState,
} from "../src/index.ts";

const seeds = (n: number): number[] => Array.from({ length: n }, (_, i) => i * 37 + 5);

/** Todas las rondas de un nivel, para todas las semillas de la muestra. */
function rondas(level: BalLevel, n = 12): BalProblem[] {
  const out: BalProblem[] = [];
  for (const seed of seeds(n)) {
    for (let r = 0; r < level.rounds; r++) out.push(generateBalanceEq(level, seed + r, r));
  }
  return out;
}

const todas = (): BalProblem[] => BAL_LEVELS.flatMap((l) => rondas(l, 8));

/** El nivel de un problema, para las funciones que lo piden. */
const nivelDe = (p: BalProblem): BalLevel =>
  BAL_LEVELS.find((l) => l.asks.includes(p.ask)) as BalLevel;

// --- Los niveles como datos --------------------------------------------------

test("los siete niveles del diseño están, en orden y sin repetir", () => {
  assert.equal(BAL_LEVELS.length, 7);
  assert.equal(TOTAL_BAL_LEVELS, 7);
  assert.deepEqual(
    BAL_LEVELS.map((l) => l.n),
    [1, 2, 3, 4, 5, 6, 7],
  );
});

test("cada nivel cambia la capa o endurece parámetros, nunca las dos cosas", () => {
  for (let i = 1; i < BAL_LEVELS.length; i++) {
    const prev = BAL_LEVELS[i - 1] as BalLevel;
    const cur = BAL_LEVELS[i] as BalLevel;
    const cambioCapa = prev.layer !== cur.layer;
    const cambioParams = JSON.stringify(prev.params) !== JSON.stringify(cur.params);
    assert.ok(
      !(cambioCapa && cambioParams),
      `el nivel ${cur.n} cambia la capa y los parámetros a la vez`,
    );
  }
});

test("los parámetros nunca se ablandan al avanzar de nivel", () => {
  const orden = { none: 0, left: 1, any: 2 };
  for (let i = 1; i < BAL_LEVELS.length; i++) {
    const prev = (BAL_LEVELS[i - 1] as BalLevel).params;
    const cur = (BAL_LEVELS[i] as BalLevel).params;
    assert.ok(cur.pieces >= prev.pieces, `el nivel ${i + 1} achica los platos`);
    assert.ok(cur.range[1] >= prev.range[1], `el nivel ${i + 1} achica el rango`);
    assert.ok(
      orden[cur.boxSide] >= orden[prev.boxSide],
      `el nivel ${i + 1} le saca lugares a la caja`,
    );
  }
});

test("el nodo recorre las cuatro capas del diseño y termina en la definición", () => {
  assert.deepEqual(
    [...new Set(BAL_LEVELS.map((l) => l.layer))],
    ["concrete", "visual", "symbolic", "formal"],
  );
  assert.equal((BAL_LEVELS.at(-1) as BalLevel).layer, "formal");
  assert.deepEqual(
    BAL_LEVELS.filter((l) => l.definition).map((l) => l.n),
    [7],
  );
  assert.equal(BAL_DEFINITION_KEYS.length, 3);
});

test("los cinco verbos que el nodo puede evidenciar aparecen en algún nivel", () => {
  const vistos = new Set(BAL_LEVELS.flatMap((l) => l.evidence));
  for (const verbo of BAL_EVIDENCE) {
    assert.ok(vistos.has(verbo), `ningún nivel da evidencia de ${verbo}`);
  }
  // `transfer` se mide en otro nodo, así que nunca puede salir de este.
  assert.ok(!vistos.has("transfer"));
});

test("la piel sigue a la capa: pesas, barras y fichas en ese orden", () => {
  for (const l of BAL_LEVELS) {
    const esperada = l.layer === "concrete" ? "weights" : l.layer === "visual" ? "bars" : "chips";
    assert.equal(l.skin, esperada, `el nivel ${l.n} dibuja fuera de tiempo`);
  }
});

test("la línea con el igual nace en `symbolic` y no antes", () => {
  for (const l of BAL_LEVELS) {
    const simbolica = l.layer === "symbolic" || l.layer === "formal";
    assert.equal(l.line, simbolica, `la línea del nivel ${l.n} llega a destiempo`);
  }
});

test("la balanza se retira como fantasma recién cuando el jugador no la necesita", () => {
  const fantasma = BAL_LEVELS.filter((l) => l.balance === "ghost").map((l) => l.n);
  assert.deepEqual(fantasma, [6]);
  for (const n of fantasma) assert.ok((balLevelByNumber(n) as BalLevel).line);
});

test("el cajón entra con el nivel 3 y no se va del diseño", () => {
  assert.equal((balLevelByNumber(1) as BalLevel).params.boxSide, "none");
  assert.equal((balLevelByNumber(2) as BalLevel).params.boxSide, "none");
  for (const l of BAL_LEVELS) {
    if (l.n >= 3) assert.notEqual(l.params.boxSide, "none", `el nivel ${l.n} perdió la caja`);
  }
});

test("cada error se empieza a clasificar en el nivel que el diseño dice", () => {
  // El documento fija dónde aparece cada uno: uno en el nivel 2, el otro en el 6.
  const desde = (id: string): number =>
    (BAL_LEVELS.find((l) => l.classifies.includes(id as never)) as BalLevel).n;
  assert.equal(desde("inverse_applied_one_side"), 2);
  assert.equal(desde("equals_as_operator"), 6);
  // Y una vez que aparece, ningún nivel posterior lo deja de mirar.
  for (const id of BAL_MISCONCEPTIONS) {
    const primero = desde(id);
    for (const l of BAL_LEVELS) {
      if (l.n > primero) assert.ok(l.classifies.includes(id), `el nivel ${l.n} soltó ${id}`);
    }
  }
});

test("el nivel 1 no clasifica nada, porque ahí tocar un solo plato es la jugada", () => {
  assert.deepEqual((balLevelByNumber(1) as BalLevel).classifies, []);
  assert.equal(balPairs("level"), false);
  assert.equal(balPairs("repair"), false);
  assert.equal(balPairs("keep"), true);
  assert.equal(balPairs("free"), true);
  assert.equal(balPairs("action"), true);
});

// --- El generador ------------------------------------------------------------

test("la misma semilla y la misma ronda dan el mismo problema", () => {
  for (const level of BAL_LEVELS) {
    for (let r = 0; r < level.rounds; r++) {
      const a = generateBalanceEq(level, 5150 + r, r);
      const b = generateBalanceEq(level, 5150 + r, r);
      assert.deepEqual(a, b);
    }
  }
});

test("un nivel con dos preguntas las alterna en vez de sortearlas", () => {
  for (const level of BAL_LEVELS) {
    if (level.asks.length < 2) continue;
    const vistas = new Set<string>();
    for (let r = 0; r < level.rounds; r++) vistas.add(generateBalanceEq(level, 23, r).ask);
    assert.equal(vistas.size, level.asks.length, `el nivel ${level.n} no llega a preguntar todo`);
  }
});

test("cada ronda pregunta algo que su nivel declara", () => {
  for (const level of BAL_LEVELS) {
    for (const p of rondas(level, 6)) {
      assert.ok(level.asks.includes(p.ask), `el nivel ${level.n} preguntó ${p.ask}`);
    }
  }
});

test("nada de lo que se pone en un plato pasa las ranuras montadas", () => {
  for (const level of BAL_LEVELS) {
    for (const p of rondas(level, 8)) {
      assert.ok(p.left.length <= BAL_PAN_SLOTS, "más pesas que ranuras a la izquierda");
      assert.ok(p.right.length <= BAL_PAN_SLOTS, "más pesas que ranuras a la derecha");
      assert.ok(p.reserve.length <= BAL_RESERVE_SLOTS, "la reserva no entra");
      assert.ok(p.left.length <= level.params.pieces, `el nivel ${level.n} carga de más`);
      assert.ok(p.right.length <= level.params.pieces, `el nivel ${level.n} carga de más`);
    }
  }
});

test("la caja aparece solo donde el parámetro la deja, y nunca vale menos de dos", () => {
  for (const level of BAL_LEVELS) {
    for (const p of rondas(level, 8)) {
      if (level.params.boxSide === "none") {
        assert.equal(p.box, null, `el nivel ${level.n} metió una caja de más`);
        continue;
      }
      if (p.ask !== "free") continue;
      assert.ok(p.box, `el nivel ${level.n} se quedó sin caja`);
      if (level.params.boxSide === "left") assert.equal(p.box.side, "left");
      assert.ok(p.box.hidden >= 2, "una caja que la balanza no puede medir");
    }
  }
});

test("la caja cae de los dos lados cuando el nivel lo permite", () => {
  const nivel = balLevelByNumber(6) as BalLevel;
  const lados = new Set(rondas(nivel, 16).map((p) => p.box?.side));
  assert.deepEqual([...lados].sort(), ["left", "right"]);
});

test("la balanza de conservar y la de liberar llegan derechas; la de enderezar no", () => {
  for (const p of todas()) {
    const derecha = balLevelled(p, balStart(p));
    if (p.ask === "keep" || p.ask === "free" || p.ask === "action") {
      assert.ok(derecha, `la ronda de ${p.ask} arranca inclinada`);
    } else {
      assert.ok(!derecha, `la ronda de ${p.ask} arranca sin nada que hacer`);
    }
  }
});

test("ninguna ronda arranca resuelta", () => {
  for (const p of todas()) assert.ok(!balSolved(p, balStart(p)), `la ronda de ${p.ask} viene hecha`);
});

test("la reserva siempre trae la pesa que hace falta", () => {
  for (const p of todas()) {
    if (p.ask === "action") continue;
    assert.ok(p.reserve.length >= 1, "una reserva vacía deja al jugador sin jugadas");
    assert.equal(new Set(p.reserve).size, p.reserve.length, "dos pesas iguales en la reserva");
  }
});

// --- El invariante -----------------------------------------------------------

test("la misma acción en los dos platos deja la barra donde estaba", () => {
  for (const p of todas()) {
    if (p.ask === "action" || !balLevelled(p, balStart(p))) continue;
    const v = p.reserve[0] as number;
    let s = balStart(p);
    s = balApply(p, s, { kind: "add", side: "left", value: v });
    assert.ok(!balLevelled(p, s), "agregar de un solo lado no inclinó la barra");
    s = balApply(p, s, { kind: "add", side: "right", value: v });
    assert.ok(balLevelled(p, s), "la misma acción en los dos platos rompió la igualdad");
  }
});

test("agregar lo mismo de los dos lados conserva y no acerca: es válido e inútil", () => {
  const nivel = balLevelByNumber(3) as BalLevel;
  const p = generateBalanceEq(nivel, 404, 0);
  let s = balStart(p);
  const v = (p.reserve[0] as number) + 100;
  s = balApply(p, s, { kind: "add", side: "left", value: v });
  s = balApply(p, s, { kind: "add", side: "right", value: v });
  assert.ok(balLevelled(p, s));
  assert.ok(!balSolved(p, s), "un movimiento inútil no puede cerrar la ronda");
});

test("volcar un plato sobre el otro rompe la igualdad y se puede deshacer", () => {
  const nivel = balLevelByNumber(7) as BalLevel;
  const p = rondas(nivel, 8).find((x) => x.ask === "action") as BalProblem;
  let s = balStart(p);
  assert.ok(balLevelled(p, s));
  s = balApply(p, s, { kind: "act", side: "left", action: "pour" });
  assert.equal(s.left.length, 0);
  assert.ok(!balLevelled(p, s), "el tobogán dejó la barra derecha");
  for (const _ of p.left) s = balApply(p, s, { kind: "cross", side: "right", value: 1 });
  assert.ok(balLevelled(p, s), "el estado roto tiene que poder arreglarse");
});

test("la barra de las acciones no pesa: contesta si los dos platos recibieron lo mismo", () => {
  const nivel = balLevelByNumber(7) as BalLevel;
  const p = rondas(nivel, 8).find((x) => x.ask === "action") as BalProblem;
  const accion = p.actions.find((a) => a !== "pour" && a !== "addFigure") as "turn" | "paint";
  let s = balStart(p);
  s = balApply(p, s, { kind: "act", side: "left", action: accion });
  // Girar no cambia lo que pesa un plato, y aun así la barra se inclina.
  assert.equal(balMass(p, s, "left"), balMass(p, s, "right"));
  assert.ok(!balLevelled(p, s));
  s = balApply(p, s, { kind: "act", side: "right", action: accion });
  assert.ok(balLevelled(p, s));
  assert.ok(balSolved(p, s), "aplicar la misma acción a los dos platos cierra la ronda");
});

test("dos acciones distintas, una por plato, no son la misma acción", () => {
  const nivel = balLevelByNumber(7) as BalLevel;
  const p = rondas(nivel, 8).find((x) => x.ask === "action") as BalProblem;
  const sinVolcar = p.actions.filter((a) => a !== "pour");
  let s = balStart(p);
  s = balApply(p, s, { kind: "act", side: "left", action: sinVolcar[0] as never });
  s = balApply(p, s, { kind: "act", side: "right", action: sinVolcar[1] as never });
  assert.ok(!balLevelled(p, s), "dos acciones distintas no conservan nada");
});

// --- Que cada ronda se pueda ganar -------------------------------------------

/** El camino que el diseño describe, jugado sobre el modelo. */
function jugar(p: BalProblem): BalState {
  let s = balStart(p);
  if (p.ask === "level" || p.ask === "repair") {
    // Tocar el plato liviano, que es lo correcto en las dos preguntas donde no
    // hay nada que conservar.
    const falta = balMass(p, s, "left") - balMass(p, s, "right");
    const liviano: BalSide = falta > 0 ? "right" : "left";
    s = balApply(p, s, { kind: "add", side: liviano, value: Math.abs(falta) });
    return s;
  }
  if (p.ask === "keep") {
    const task = p.task as { kind: "remove" | "add"; value: number };
    s = balApply(p, s, { kind: task.kind, side: "left", value: task.value });
    s = balApply(p, s, { kind: task.kind, side: "right", value: task.value });
    return s;
  }
  if (p.ask === "action") {
    const accion = p.actions.find((a) => a !== "pour") as never;
    s = balApply(p, s, { kind: "act", side: "left", action: accion });
    s = balApply(p, s, { kind: "act", side: "right", action: accion });
    return s;
  }
  // Liberar la caja: quitar de los dos platos lo que está en los dos, hasta que
  // del lado de la caja no quede nada suelto.
  const caja = (p.box as { side: BalSide }).side;
  for (let paso = 0; paso < BAL_PAN_SLOTS; paso++) {
    const desde = caja === "left" ? s.left : s.right;
    const v = desde[0];
    if (v === undefined) break;
    s = balApply(p, s, { kind: "remove", side: "left", value: v });
    s = balApply(p, s, { kind: "remove", side: "right", value: v });
  }
  return s;
}

test("toda ronda se puede ganar con el camino que el diseño describe", () => {
  for (const p of todas()) {
    const s = jugar(p);
    assert.ok(balSolved(p, s), `la ronda de ${p.ask} no se puede terminar`);
  }
});

test("liberar la caja deja enfrente lo que la caja tenía adentro", () => {
  for (const p of todas()) {
    if (p.ask !== "free") continue;
    const s = jugar(p);
    const box = p.box as { side: BalSide; hidden: number };
    assert.ok(balBoxAlone(p, s), "la caja no quedó sola");
    const enfrente = balOtherSide(box.side);
    assert.equal(
      balMass(p, s, enfrente),
      box.hidden,
      "lo que quedó enfrente no es lo que la caja tenía",
    );
  }
});

test("quitar del plato de la caja sin quitar del otro no la abre", () => {
  const nivel = balLevelByNumber(3) as BalLevel;
  const p = generateBalanceEq(nivel, 777, 0);
  const box = p.box as { side: BalSide };
  const v = (box.side === "left" ? p.left : p.right)[0] as number;
  const s = balApply(p, balStart(p), { kind: "remove", side: box.side, value: v });
  assert.ok(!balLevelled(p, s), "la caja cedió con un solo plato tocado");
  assert.ok(!balSolved(p, s));
});

// --- Los dos errores del catálogo --------------------------------------------

test("los dos ids son los que el catálogo de L declara sobre este nodo", () => {
  assert.deepEqual([...BAL_MISCONCEPTIONS], [
    "inverse_applied_one_side",
    "equals_as_operator",
  ]);
});

test("dejar una acción a medio camino y empezar otra es aplicar a un solo lado", () => {
  const nivel = balLevelByNumber(3) as BalLevel;
  const p = generateBalanceEq(nivel, 31, 0);
  const v = p.left[0] as number;
  const primera: BalMove = { kind: "remove", side: "left", value: v };
  const espejo: BalMove = { kind: "remove", side: "right", value: v };
  const otra: BalMove = { kind: "add", side: "left", value: (p.reserve[0] as number) + 7 };
  const medio = balApply(p, balStart(p), primera);
  // Sin nada pendiente, el primer toque a un plato no es un error: es medio par.
  assert.equal(balMisconceptionFor(nivel, p, medio, primera, null), undefined);
  // El espejo cierra el par y no clasifica nada: es el movimiento que conserva.
  const cerrado = balApply(p, medio, espejo);
  assert.equal(balMisconceptionFor(nivel, p, cerrado, espejo, primera), undefined);
  const desviado = balApply(p, medio, otra);
  assert.equal(
    balMisconceptionFor(nivel, p, desviado, otra, primera),
    "inverse_applied_one_side",
  );
});

test("deshacer lo que uno rompió nunca se anota como romperlo de nuevo", () => {
  const nivel = balLevelByNumber(3) as BalLevel;
  const p = generateBalanceEq(nivel, 31, 0);
  const v = p.left[0] as number;
  const primera: BalMove = { kind: "remove", side: "left", value: v };
  const medio = balApply(p, balStart(p), primera);
  const vuelta: BalMove = { kind: "add", side: "left", value: v };
  const restaurado = balApply(p, medio, vuelta);
  assert.ok(balLevelled(p, restaurado));
  assert.equal(balMisconceptionFor(nivel, p, restaurado, vuelta, primera), undefined);
});

test("cruzar una pesa es leer el igual como flecha, y recién el nivel 6 lo anota", () => {
  const tres = balLevelByNumber(3) as BalLevel;
  const seis = balLevelByNumber(6) as BalLevel;
  const p = generateBalanceEq(tres, 12, 0);
  const cruce: BalMove = { kind: "cross", side: "left", value: p.left[0] as number };
  const cruzado = balApply(p, balStart(p), cruce);
  assert.ok(!balLevelled(p, cruzado), "cruzar una pesa tiene que romper la igualdad");
  assert.equal(balMisconceptionFor(tres, p, cruzado, cruce, null), undefined);
  assert.equal(balMisconceptionFor(seis, p, cruzado, cruce, null), "equals_as_operator");

  const acc = rondas(balLevelByNumber(7) as BalLevel, 8).find(
    (x) => x.ask === "action",
  ) as BalProblem;
  const volcar: BalMove = { kind: "act", side: "left", action: "pour" };
  const volcado = balApply(acc, balStart(acc), volcar);
  assert.equal(balMisconceptionFor(seis, acc, volcado, volcar, null), "equals_as_operator");
});

test("donde no hay nada que conservar, tocar un solo plato nunca clasifica", () => {
  const siete = balLevelByNumber(7) as BalLevel;
  const rep = rondas(siete, 8).find((x) => x.ask === "repair") as BalProblem;
  const acc = rondas(siete, 8).find((x) => x.ask === "action") as BalProblem;
  const primera: BalMove = { kind: "add", side: "left", value: 2 };
  const otra: BalMove = { kind: "add", side: "left", value: 40 };
  const repDesviado = balApply(rep, balApply(rep, balStart(rep), primera), otra);
  assert.equal(balMisconceptionFor(siete, rep, repDesviado, otra, primera), undefined);
  const accDesviado = balApply(acc, balApply(acc, balStart(acc), primera), otra);
  assert.equal(
    balMisconceptionFor(siete, acc, accDesviado, otra, primera),
    "inverse_applied_one_side",
  );
});

test("dos movimientos son espejos solo si son la misma acción en el otro plato", () => {
  const izq: BalMove = { kind: "remove", side: "left", value: 5 };
  assert.ok(balMirrors(izq, { kind: "remove", side: "right", value: 5 }));
  assert.ok(!balMirrors(izq, { kind: "remove", side: "left", value: 5 }));
  assert.ok(!balMirrors(izq, { kind: "remove", side: "right", value: 4 }));
  assert.ok(!balMirrors(izq, { kind: "add", side: "right", value: 5 }));
  assert.ok(!balMirrors(izq, null));
  // Cruzar no tiene espejo: ya son dos acciones en un solo gesto.
  assert.ok(
    !balMirrors({ kind: "cross", side: "left", value: 5 }, { kind: "cross", side: "right", value: 5 }),
  );
  assert.ok(
    balMirrors(
      { kind: "act", side: "left", action: "turn" },
      { kind: "act", side: "right", action: "turn" },
    ),
  );
  assert.ok(
    !balMirrors(
      { kind: "act", side: "left", action: "turn" },
      { kind: "act", side: "right", action: "paint" },
    ),
  );
});

// --- La barra ----------------------------------------------------------------

test("la inclinación tiene el signo del plato que pesa más y no se pasa de uno", () => {
  for (const p of todas()) {
    const s = balStart(p);
    const t = balTilt(p, s);
    assert.ok(t >= -1 && t <= 1, "la barra se pasó de vuelta");
    const d = balMass(p, s, "left") - balMass(p, s, "right");
    if (p.ask !== "action") assert.equal(Math.sign(t), Math.sign(d));
  }
});

test("cualquier desequilibrio se ve: la barra nunca se tuerce un poquito", () => {
  for (const p of todas()) {
    const s = balStart(p);
    const t = balTilt(p, s);
    if (t !== 0) assert.ok(Math.abs(t) >= TILT_FLOOR, `una inclinación de ${t} no se ve`);
  }
  // Y más diferencia inclina más, hasta el tope.
  const p = generateBalanceEq(balLevelByNumber(3) as BalLevel, 61, 0);
  const base = balStart(p);
  const chico = Math.abs(balTilt(p, balApply(p, base, { kind: "add", side: "left", value: 1 })));
  const grande = Math.abs(balTilt(p, balApply(p, base, { kind: "add", side: "left", value: 9 })));
  assert.ok(chico >= TILT_FLOOR, "una pesa de más ya tiene que verse");
  assert.ok(grande > chico, "nueve de más tienen que inclinar más que una");
});

test("quitar una pesa que no está no cambia nada", () => {
  const nivel = balLevelByNumber(2) as BalLevel;
  const p = generateBalanceEq(nivel, 88, 0);
  const s = balStart(p);
  const igual = balApply(p, s, { kind: "remove", side: "left", value: 999 });
  assert.deepEqual(igual.left, s.left);
  assert.deepEqual(igual.right, s.right);
});

// --- El registro -------------------------------------------------------------

test("el nodo se anota en el registro con su lugar y su prerequisito", () => {
  const spec = nodeById(NODE_BALANCE_EQ);
  assert.ok(spec);
  assert.equal(spec.n, 11);
  assert.deepEqual(spec.prereqs, ["prealg.var.unknown_as_box"]);
  assert.equal(spec.levels.length, TOTAL_BAL_LEVELS);
});

test("el nodo se abre cuando la caja cerrada quedó terminada, y no antes", () => {
  const caja = nodeById("prealg.var.unknown_as_box");
  assert.ok(caja, "el nodo 10 tiene que estar construido antes que este");
  assert.ok(!isNodeOpen(NODE_BALANCE_EQ, {}));
  assert.ok(isNodeOpen(NODE_BALANCE_EQ, { "prealg.var.unknown_as_box": caja.levels.length }));
});

test("el nodo 13 sigue pidiendo esta balanza como prerequisito", () => {
  const uno = nodeById("alg.eq.one_step");
  assert.ok(uno);
  assert.ok(uno.prereqs.includes(NODE_BALANCE_EQ), "la espina se cortó entre el 11 y el 13");
});

test("nivelDe encuentra el nivel de cada pregunta del diseño", () => {
  for (const ask of ["level", "keep", "free", "repair", "action"] as const) {
    const l = BAL_LEVELS.find((x) => x.asks.includes(ask));
    assert.ok(l, `ninguna pregunta ${ask} en el diseño`);
  }
  assert.ok(nivelDe(generateBalanceEq(balLevelByNumber(1) as BalLevel, 1, 0)));
});
