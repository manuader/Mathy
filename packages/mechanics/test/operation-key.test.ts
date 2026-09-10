import { test } from "node:test";
import assert from "node:assert/strict";
import {
  KEY_EVIDENCE,
  KEY_INVERSE,
  KEY_LEVELS,
  KEY_LOOP_SLOTS,
  KEY_MAX_FACTOR,
  KEY_MAX_VALUE,
  KEY_MISCONCEPTION,
  KEY_PARTNER,
  KEY_RING_SLOTS,
  KEY_TILE_SLOTS,
  NODE_OPERATION_KEY,
  TOTAL_KEY_LEVELS,
  generateOperationKey,
  isNodeOpen,
  keyApply,
  keyInverseOf,
  keyLevelByNumber,
  keyMisconceptionFor,
  keyMisconceptionForKey,
  keyMisconceptionForTrial,
  keyOpens,
  keyRestores,
  keyUndoOrder,
  nodeById,
  type KeyCandidate,
  type KeyLevel,
  type KeyLoop,
  type KeyOp,
  type KeyProblem,
} from "../src/index.ts";

const seeds = (n: number): number[] => Array.from({ length: n }, (_, i) => i * 37 + 5);

/** Todas las rondas de un nivel, para todas las semillas de la muestra. */
function rondas(level: KeyLevel, n = 16): KeyProblem[] {
  const out: KeyProblem[] = [];
  for (const seed of seeds(n)) {
    for (let r = 0; r < level.rounds; r++) out.push(generateOperationKey(level, seed + r, r));
  }
  return out;
}

const todas = (): KeyProblem[] => KEY_LEVELS.flatMap((l) => rondas(l, 10));

const nivel = (n: number): KeyLevel => keyLevelByNumber(n) as KeyLevel;

// --- Los niveles como datos --------------------------------------------------

test("los siete niveles del diseño están, en orden y sin repetir", () => {
  assert.equal(KEY_LEVELS.length, 7);
  assert.equal(TOTAL_KEY_LEVELS, 7);
  assert.deepEqual(
    KEY_LEVELS.map((l) => l.n),
    [1, 2, 3, 4, 5, 6, 7],
  );
});

test("cada nivel cambia la capa o endurece parámetros, nunca las dos cosas", () => {
  for (let i = 1; i < KEY_LEVELS.length; i++) {
    const prev = KEY_LEVELS[i - 1] as KeyLevel;
    const cur = KEY_LEVELS[i] as KeyLevel;
    const cambioCapa = prev.layer !== cur.layer;
    const cambioParams = JSON.stringify(prev.params) !== JSON.stringify(cur.params);
    assert.ok(
      !(cambioCapa && cambioParams),
      `el nivel ${cur.n} cambia la capa y los parámetros a la vez`,
    );
  }
});

test("los parámetros nunca se ablandan al avanzar de nivel", () => {
  for (let i = 1; i < KEY_LEVELS.length; i++) {
    const prev = (KEY_LEVELS[i - 1] as KeyLevel).params;
    const cur = (KEY_LEVELS[i] as KeyLevel).params;
    assert.ok(cur.ops.length >= prev.ops.length, `el nivel ${i + 1} saca cerraduras del juego`);
    assert.ok(cur.operand[1] >= prev.operand[1], `el nivel ${i + 1} achica el rango`);
    assert.ok(cur.start[1] >= prev.start[1], `el nivel ${i + 1} achica el objeto`);
    assert.ok(cur.ring >= prev.ring, `el nivel ${i + 1} descuelga llaves del llavero`);
    assert.ok(cur.chain >= prev.chain, `el nivel ${i + 1} acorta la cadena`);
    assert.ok(cur.negatives >= prev.negatives, `el nivel ${i + 1} se queda sin negativos`);
  }
});

test("el nodo recorre las cuatro capas del diseño y termina en la definición", () => {
  assert.deepEqual(
    [...new Set(KEY_LEVELS.map((l) => l.layer))],
    ["concrete", "visual", "symbolic", "formal"],
  );
  assert.equal((KEY_LEVELS.at(-1) as KeyLevel).layer, "formal");
  assert.deepEqual(
    KEY_LEVELS.filter((l) => l.definition).map((l) => l.n),
    [7],
  );
});

test("los cinco verbos que el nodo puede evidenciar aparecen en algún nivel", () => {
  const vistos = new Set(KEY_LEVELS.flatMap((l) => l.evidence));
  for (const verbo of KEY_EVIDENCE) {
    assert.ok(vistos.has(verbo), `ningún nivel da evidencia de ${verbo}`);
  }
  // `transfer` se mide en otro nodo, así que nunca puede salir de este.
  assert.ok(!vistos.has("transfer"));
});

test("la piel del cofre sigue a la capa: cofre, flechas y fantasma en ese orden", () => {
  for (const l of KEY_LEVELS) {
    const esperada = l.layer === "concrete" ? "chest" : l.layer === "visual" ? "arrows" : null;
    if (esperada) assert.equal(l.skin, esperada, `el nivel ${l.n} dibuja fuera de tiempo`);
  }
  // La analogía se retira en `symbolic`: desde ahí el cofre es fantasma.
  assert.deepEqual(
    KEY_LEVELS.filter((l) => l.skin === "ghost").map((l) => l.n),
    [6, 7],
  );
});

test("las fichas y los numerales llegan cuando el diseño los deja entrar", () => {
  // La capa concreta se juega sin un solo número: forma y puntitos.
  for (const l of KEY_LEVELS) {
    if (l.layer === "concrete") {
      assert.equal(l.numerals, false, `el nivel ${l.n} muestra números en la capa concreta`);
      assert.equal(l.labeled, false, `el nivel ${l.n} etiqueta antes de tiempo`);
    }
  }
  // La ficha con operador y número nace en la capa simbólica, no antes.
  assert.deepEqual(
    KEY_LEVELS.filter((l) => l.labeled).map((l) => l.n),
    [5, 6, 7],
  );
});

test("la cadena y los negativos entran juntos y solo en la segunda mitad simbólica", () => {
  for (const l of KEY_LEVELS) {
    if (l.n < 6) {
      assert.equal(l.params.chain, 1, `el nivel ${l.n} encadena antes de tiempo`);
      assert.equal(l.params.negatives, false, `el nivel ${l.n} deja pasar negativos`);
    } else {
      assert.equal(l.params.chain, 2);
      assert.equal(l.params.negatives, true);
    }
  }
});

// --- El generador ------------------------------------------------------------

test("la misma semilla y la misma ronda dan el mismo problema", () => {
  for (const level of KEY_LEVELS) {
    for (let r = 0; r < level.rounds; r++) {
      const a = generateOperationKey(level, 4242 + r, r);
      const b = generateOperationKey(level, 4242 + r, r);
      assert.deepEqual(a, b);
    }
  }
});

test("un nivel con dos preguntas las alterna en vez de sortearlas", () => {
  for (const level of KEY_LEVELS) {
    if (level.asks.length < 2) continue;
    const vistas = new Set<string>();
    for (let r = 0; r < level.rounds; r++) vistas.add(generateOperationKey(level, 13, r).ask);
    assert.equal(vistas.size, level.asks.length, `el nivel ${level.n} no llega a preguntar todo`);
  }
});

test("cada ronda pregunta algo que su nivel declara", () => {
  for (const level of KEY_LEVELS) {
    for (const p of rondas(level, 6)) {
      assert.ok(level.asks.includes(p.ask), `el nivel ${level.n} preguntó ${p.ask}`);
    }
  }
});

test("nada de lo que el taller pone pasa las ranuras montadas", () => {
  for (const p of todas()) {
    assert.ok(p.keys.length <= KEY_RING_SLOTS, "más llaves que ranuras");
    assert.ok(p.actions.length <= KEY_RING_SLOTS, "más acciones que ranuras");
    assert.ok(p.tiles.length <= KEY_TILE_SLOTS, "más fichas que ranuras");
    assert.ok(p.ops.length <= KEY_RING_SLOTS, "más operaciones que ranuras");
    assert.ok(p.loops.length <= KEY_LOOP_SLOTS, "la cadena no entra");
  }
});

test("la acción del cofre lleva del objeto de partida al transformado", () => {
  for (const p of todas()) {
    for (const l of p.loops) {
      assert.equal(keyApply(l.from, l.action), l.to, "el lazo no cierra en el dato");
      assert.ok(Number.isInteger(l.to), "el cofre devolvió una fracción");
      assert.ok(Math.abs(l.to) <= KEY_MAX_VALUE + 10, "el objeto desbordó el diagrama");
    }
  }
});

test("una cerradura de multiplicar o dividir nunca usa cero ni uno", () => {
  for (const p of todas()) {
    for (const l of p.loops) {
      if (l.action.op !== "mul" && l.action.op !== "div") continue;
      assert.ok(l.action.value >= 2, `una cerradura de ${l.action.op} por ${l.action.value}`);
      assert.ok(l.action.value <= KEY_MAX_FACTOR, "el factor desborda el diagrama");
    }
  }
});

test("sin negativos declarados, nada de lo que el cofre devuelve baja del cero", () => {
  for (const level of KEY_LEVELS) {
    if (level.params.negatives) continue;
    for (const p of rondas(level, 12)) {
      for (const l of p.loops) {
        assert.ok(l.from >= 0 && l.to >= 0, `el nivel ${level.n} mostró un negativo`);
      }
    }
  }
});

test("la cadena encadena dos acciones distintas y se deshace desde la última", () => {
  const seis = nivel(6);
  for (const p of rondas(seis, 12)) {
    assert.equal(p.loops.length, 2);
    const [a, b] = p.loops as [KeyLoop, KeyLoop];
    assert.notEqual(a.action.op, b.action.op, "dos acciones iguales dejan la cadena sin orden");
    // Y la segunda tampoco puede ser la llave de la primera: la cadena se
    // desharía sola y el objeto de abajo ya sería el de arriba.
    assert.notEqual(b.action.op, KEY_INVERSE[a.action.op], "la cadena se deshace sola");
    assert.notEqual(a.from, b.to, "la cadena volvió al objeto de partida sin que nadie la abriera");
    // Lo que salió de la primera es lo que entró a la segunda: es una cadena y
    // no dos cofres al lado.
    assert.equal(a.to, b.from);
    assert.deepEqual(keyUndoOrder(p.loops), [b.id, a.id]);
  }
});

// --- El llavero --------------------------------------------------------------

test("el llavero trae la llave de cada lazo y ninguna repetida", () => {
  for (const p of todas()) {
    if (p.ask === "assemble" || p.ask === "arbitrary") continue;
    for (const l of p.loops) {
      const suya = p.keys.filter((k) => k.loop === l.id);
      assert.equal(suya.length, 1, `el lazo ${l.id} no tiene exactamente una llave`);
      assert.ok(keyRestores(l, suya[0] as KeyCandidate), "la llave del lazo no devuelve el objeto");
    }
    const firmas = p.keys.map((k) => `${k.op}${k.value}`);
    assert.equal(new Set(firmas).size, firmas.length, "dos llaves iguales en el llavero");
  }
});

test("el llavero cuelga las llaves que el nivel declara", () => {
  for (const level of KEY_LEVELS) {
    if (level.asks.includes("assemble") || level.asks.includes("arbitrary")) continue;
    for (const p of rondas(level, 10)) {
      assert.equal(
        p.keys.length,
        Math.min(level.params.ring, KEY_RING_SLOTS),
        `el nivel ${level.n} colgó ${p.keys.length} llaves`,
      );
    }
  }
});

test("con dos llaves colgadas la que sobra se distingue mirando la forma", () => {
  const uno = nivel(1);
  for (const p of rondas(uno, 16)) {
    assert.equal(p.keys.length, 2);
    const ops = new Set(p.keys.map((k) => k.op));
    assert.equal(ops.size, 2, "las dos llaves del primer nivel tienen la misma forma");
  }
});

test("solo la llave del lazo devuelve el objeto; ninguna otra lo hace de casualidad", () => {
  for (const p of todas()) {
    for (const l of p.loops) {
      for (const k of p.keys) {
        assert.equal(
          keyRestores(l, k),
          k.loop === l.id,
          `la llave ${k.id} devuelve un objeto que no le toca`,
        );
      }
    }
  }
});

test("una llave que entra nunca deja una fracción adentro del cofre", () => {
  for (const p of todas()) {
    const l = p.loops[0];
    if (!l) continue;
    for (const k of p.keys) {
      if (!keyOpens(l.action, k)) continue;
      const salido = keyApply(l.to, { op: k.op, value: k.value });
      assert.ok(Number.isInteger(salido), `la llave ${k.id} sacó una fracción del cofre`);
    }
  }
});

test("los tres distractores del diseño aparecen en el llavero de cuatro llaves", () => {
  const vistos = new Set<string>();
  for (const level of [nivel(2), nivel(4), nivel(5)]) {
    for (const p of rondas(level, 24)) {
      for (const k of p.keys) if (k.lure) vistos.add(k.lure);
    }
  }
  assert.ok(vistos.has("same_operation"), "falta la cerradura repetida");
  assert.ok(vistos.has("other_pair"), "falta la inversa de la otra pareja");
  assert.ok(vistos.has("near_value"), "falta el número cercano");
});

test("el número cercano entra en la cerradura y devuelve otra cosa", () => {
  let vistas = 0;
  for (const p of todas()) {
    const l = p.loops[0];
    if (!l) continue;
    for (const k of p.keys) {
      if (k.lure !== "near_value") continue;
      vistas++;
      assert.ok(keyOpens(l.action, k), "el número cercano tiene que abrir el cofre");
      assert.ok(!keyRestores(l, k), "el número cercano no puede devolver el objeto");
    }
  }
  assert.ok(vistas > 0, "el número cercano no salió nunca");
});

test("las llaves de la cerradura repetida y de la otra pareja ni siquiera entran", () => {
  for (const p of todas()) {
    const l = p.loops[0];
    if (!l) continue;
    for (const k of p.keys) {
      if (k.lure !== "same_operation" && k.lure !== "other_pair") continue;
      assert.ok(!keyOpens(l.action, k), `la llave ${k.lure} entró en la cerradura`);
    }
  }
});

// --- La tabla de parejas -----------------------------------------------------

test("la llave de la llave es la operación original", () => {
  for (const op of ["add", "sub", "mul", "div"] as const) {
    assert.equal(keyInverseOf(keyInverseOf(op)), op);
    assert.notEqual(KEY_INVERSE[op], op, "ninguna operación es su propia llave");
    // La inversa de la otra pareja conserva el número y cambia de pareja: es el
    // distractor central del nodo.
    assert.notEqual(KEY_PARTNER[op], KEY_INVERSE[op]);
    assert.notEqual(KEY_PARTNER[op], op);
  }
});

test("hacer y deshacer deja lo original, con cualquier operación y cualquier número", () => {
  for (const op of ["add", "sub", "mul", "div"] as const) {
    for (let v = 2; v <= 9; v++) {
      const from = 24;
      const to = keyApply(from, { op, value: v });
      assert.equal(keyApply(to, { op: KEY_INVERSE[op], value: v }), from);
    }
  }
});

// --- La misconception --------------------------------------------------------

test("la única misconception del nodo es la que el catálogo declara sobre él", () => {
  assert.equal(KEY_MISCONCEPTION, "wrong_inverse_choice");
  const clasifican = new Set<string>();
  for (const p of todas()) {
    const l = p.loops[0];
    if (!l) continue;
    for (const k of p.keys) {
      const m = keyMisconceptionFor(l.action, k);
      if (m) clasifican.add(m);
    }
  }
  assert.deepEqual([...clasifican], [KEY_MISCONCEPTION]);
});

test("elegir mal la operación clasifica; elegir mal el número, no", () => {
  const accion = { op: "mul" as KeyOp, value: 3 };
  const key = (op: KeyOp, value: number): KeyCandidate => ({ id: "k", op, value, loop: null });
  // La llave que sí abre: acierto.
  assert.equal(keyMisconceptionFor(accion, { ...key("div", 3), loop: "l0" }), undefined);
  // Restar tres frente a multiplicar por tres: el número tratado como acción.
  assert.equal(keyMisconceptionFor(accion, key("sub", 3)), KEY_MISCONCEPTION);
  // Multiplicar otra vez: la cerradura repetida, la otra regla `detect`.
  assert.equal(keyMisconceptionFor(accion, key("mul", 3)), KEY_MISCONCEPTION);
  // Dividir por cuatro: entra y devuelve otra cosa. Es válido y no clasifica.
  assert.equal(keyMisconceptionFor(accion, key("div", 4)), undefined);
  assert.equal(keyMisconceptionFor(undefined, key("div", 4)), undefined);
  assert.equal(keyMisconceptionFor(accion, undefined), undefined);
});

test("en una cadena, deshacer en el orden equivocado no clasifica", () => {
  const seis = nivel(6);
  let probadas = 0;
  for (const p of rondas(seis, 12)) {
    const [primero, segundo] = p.loops as [KeyLoop, KeyLoop];
    const suya = p.keys.find((k) => k.loop === segundo.id) as KeyCandidate;
    // La llave del lazo de adentro sobre el cofre de afuera: es orden, y el
    // catálogo pone ese error en `unwrap_order_inverted`, que no apunta acá.
    assert.equal(keyMisconceptionForKey(primero, suya), undefined);
    // La misma llave sobre el lazo que le toca tampoco clasifica: es un acierto.
    assert.equal(keyMisconceptionForKey(segundo, suya), undefined);
    const senuelo = p.keys.find((k) => k.lure === "same_operation" || k.lure === "other_pair");
    if (senuelo) {
      probadas++;
      assert.equal(keyMisconceptionForKey(primero, senuelo), KEY_MISCONCEPTION);
    }
  }
  assert.ok(probadas > 0, "no se probó ninguna llave que no deshaga nada");
});

test("en `explain`, señalar la vuelta que sí devuelve clasifica; acertar no", () => {
  assert.equal(keyMisconceptionForTrial(1, 1), undefined);
  assert.equal(keyMisconceptionForTrial(1, 0), KEY_MISCONCEPTION);
});

// --- Las preguntas que no son el llavero -------------------------------------

test("`explain` compara dos vueltas y solo una devuelve el objeto", () => {
  const cuatro = nivel(4);
  for (const p of rondas(cuatro, 16)) {
    if (p.ask !== "judge") continue;
    assert.equal(p.trials.length, 2);
    const l = p.loops[0] as KeyLoop;
    const buenas = p.trials.filter((t) => t.restores);
    assert.equal(buenas.length, 1, "las dos vueltas no pueden terminar igual");
    assert.ok(p.liar === 0 || p.liar === 1);
    const mentirosa = p.trials[p.liar];
    assert.ok(mentirosa);
    assert.equal(mentirosa.restores, false);
    // La que miente usa una llave que ni siquiera entra: `explain` evalúa la
    // primera forma de fallar, que es la que el catálogo clasifica.
    assert.equal(mentirosa.opens, false);
    for (const t of p.trials) {
      assert.equal(t.opens, keyOpens(l.action, t.key));
      assert.equal(t.restores, keyRestores(l, t.key));
    }
  }
});

test("`explain` no siempre pone la mentirosa en el mismo lado", () => {
  const cuatro = nivel(4);
  const lados = new Set<number>();
  for (const p of rondas(cuatro, 24)) {
    if (p.ask === "judge") lados.add(p.liar);
  }
  assert.deepEqual([...lados].sort(), [0, 1]);
});

test("la llave que se arma ofrece la operación y el número que devuelven", () => {
  const tres = nivel(3);
  for (const p of rondas(tres, 16)) {
    assert.equal(p.ask, "assemble");
    assert.equal(p.keys.length, 0, "la llave se arma: no hay llavero que mirar");
    const l = p.loops[0] as KeyLoop;
    assert.ok(p.ops.includes(KEY_INVERSE[l.action.op]), "falta la operación que abre");
    assert.ok(p.tiles.includes(l.action.value), "falta el número que devuelve");
    // Y ofrecen más de una cosa: con una sola, armar la llave sería un botón.
    assert.ok(p.ops.length >= 2 && p.tiles.length >= 2);
    assert.equal(new Set(p.tiles).size, p.tiles.length, "dos fichas con el mismo número");
    for (const v of p.tiles) assert.ok(v >= 1, "una ficha que no es un número de contar");
  }
});

test("el último nivel trae una cerradura sin llave por tanda y el candado tachado siempre", () => {
  const siete = nivel(7);
  for (const seed of seeds(12)) {
    const tanda = Array.from({ length: siete.rounds }, (_, r) =>
      generateOperationKey(siete, seed + r, r),
    );
    const sinLlave = tanda.filter((p) => p.lock?.uninvertible === true);
    assert.equal(sinLlave.length, 1, "el diseño pide una cerradura sin llave por tanda");
    for (const p of tanda) {
      assert.equal(p.ask, "arbitrary");
      assert.ok(p.lock, "la ronda no trajo cerradura");
      assert.ok(
        p.actions.some((a) => a.kind === "broken"),
        "el candado tachado tiene que estar colgado siempre",
      );
      const correctas = p.actions.filter((a) => a.correct);
      assert.equal(correctas.length, 1, "tiene que haber una y solo una respuesta");
      const correcta = correctas[0];
      assert.ok(correcta);
      assert.equal(
        correcta.kind,
        p.lock.uninvertible ? "broken" : p.lock.kind,
        "la vuelta de una acción cualquiera se dibuja como la acción",
      );
      const kinds = p.actions.map((a) => a.kind);
      assert.equal(new Set(kinds).size, kinds.length, "dos acciones iguales en el llavero");
    }
  }
});

// --- El registro -------------------------------------------------------------

test("el nodo se anota en el registro con su lugar y sus tres prerequisitos", () => {
  const spec = nodeById(NODE_OPERATION_KEY);
  assert.ok(spec);
  assert.equal(spec.n, 12);
  assert.deepEqual(spec.prereqs, [
    "arith.sub.undo_add",
    "arith.div.undo_mul",
    "arith.int.negatives",
  ]);
  assert.equal(spec.levels.length, TOTAL_KEY_LEVELS);
});

test("el nodo se abre cuando sus tres prerequisitos quedaron terminados, y no antes", () => {
  const prereqs = (nodeById(NODE_OPERATION_KEY) as { prereqs: readonly string[] }).prereqs;
  const hechos: Record<string, number> = {};
  for (const id of prereqs) {
    const spec = nodeById(id);
    // Un prerequisito que todavía no tiene minijuego no bloquea, que es la
    // regla del registro.
    if (spec) hechos[id] = spec.levels.length;
  }
  const construidos = prereqs.filter((id) => nodeById(id));
  if (construidos.length > 0) {
    assert.ok(!isNodeOpen(NODE_OPERATION_KEY, {}));
  }
  assert.ok(isNodeOpen(NODE_OPERATION_KEY, hechos));
});
