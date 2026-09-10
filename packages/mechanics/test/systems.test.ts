import { test } from "node:test";
import assert from "node:assert/strict";
import {
  NODE_TWO_BY_TWO,
  SYS_CHIP_SLOTS,
  SYS_EVIDENCE,
  SYS_FACTOR_SLOTS,
  SYS_LAYERS,
  SYS_LEVELS,
  SYS_MAX_REPEAT,
  SYS_MISCONCEPTION,
  SYS_SCALING_ORDER,
  TOTAL_SYS_LEVELS,
  generateSystems,
  isNodeOpen,
  nodeById,
  sysCancels,
  sysCoef,
  sysEliminationPlan,
  sysEval,
  sysFruitsOf,
  sysLevelByNumber,
  sysLineOf,
  sysMisconceptionFor,
  sysNormalize,
  sysPour,
  sysScale,
  sysSolve,
  sysSolved,
  sysState,
  sysSubstitute,
  sysSubstituteAll,
  sysTilt,
  type SysFruit,
  type SysLevel,
  type SysProblem,
  type SysRow,
  type SysValues,
} from "../src/index.ts";

const semillas = (n: number): number[] => Array.from({ length: n }, (_, i) => i * 37 + 5);

/** Todas las rondas de un nivel, para todas las semillas de la muestra. */
function rondas(level: SysLevel, n = 12): SysProblem[] {
  const out: SysProblem[] = [];
  for (const seed of semillas(n)) {
    for (let r = 0; r < level.rounds; r++) out.push(generateSystems(level, seed + r, r));
  }
  return out;
}

const todas = (n = 8): SysProblem[] => SYS_LEVELS.flatMap((l) => rondas(l, n));

const nivel = (n: number): SysLevel => sysLevelByNumber(n) as SysLevel;

/** Las rondas de un nivel que hacen una pregunta dada. */
const conPregunta = (n: number, ask: string, m = 12): SysProblem[] =>
  rondas(nivel(n), m).filter((p) => p.ask === ask);

/** El par verdadero, listo para evaluar filas. */
const par = (p: SysProblem): SysValues => [p.solution[0] ?? null, p.solution[1] ?? null];

// --- Los niveles como datos --------------------------------------------------

test("los siete niveles del diseño están, en orden y sin repetir", () => {
  assert.equal(SYS_LEVELS.length, 7);
  assert.equal(TOTAL_SYS_LEVELS, 7);
  assert.deepEqual(
    SYS_LEVELS.map((l) => l.n),
    [1, 2, 3, 4, 5, 6, 7],
  );
});

test("cada nivel cambia la capa o endurece parámetros, nunca las dos cosas", () => {
  for (let i = 1; i < SYS_LEVELS.length; i++) {
    const prev = SYS_LEVELS[i - 1] as SysLevel;
    const cur = SYS_LEVELS[i] as SysLevel;
    const cambioCapa = prev.layer !== cur.layer;
    const cambioParams = JSON.stringify(prev.params) !== JSON.stringify(cur.params);
    assert.ok(
      !(cambioCapa && cambioParams),
      `el nivel ${cur.n} cambia la capa y los parámetros a la vez`,
    );
  }
});

test("ningún parámetro se ablanda al avanzar de nivel", () => {
  for (let i = 1; i < SYS_LEVELS.length; i++) {
    const prev = (SYS_LEVELS[i - 1] as SysLevel).params;
    const cur = (SYS_LEVELS[i] as SysLevel).params;
    assert.ok(cur.rows >= prev.rows, `el nivel ${i + 1} usa menos filas`);
    assert.ok(cur.fruits >= prev.fruits, `el nivel ${i + 1} usa menos frutas`);
    assert.ok(cur.coefficients[1] >= prev.coefficients[1], `el nivel ${i + 1} achica los coeficientes`);
    assert.ok(cur.solutions[1] >= prev.solutions[1], `el nivel ${i + 1} achica los valores`);
    assert.ok(!(prev.subtraction && !cur.subtraction), `el nivel ${i + 1} apaga la resta`);
    assert.ok(!(prev.shuffled && !cur.shuffled), `el nivel ${i + 1} vuelve a ordenar los términos`);
    assert.ok(!(prev.negatives && !cur.negatives), `el nivel ${i + 1} apaga los negativos`);
    assert.ok(
      SYS_SCALING_ORDER.indexOf(cur.scaling) >= SYS_SCALING_ORDER.indexOf(prev.scaling),
      `el nivel ${i + 1} pide menos escalado`,
    );
  }
});

test("el nodo recorre las cuatro capas del diseño y termina en la definición", () => {
  assert.deepEqual([...new Set(SYS_LEVELS.map((l) => l.layer))], SYS_LAYERS);
  const ultimo = SYS_LEVELS.at(-1) as SysLevel;
  assert.equal(ultimo.layer, "formal");
  assert.equal(ultimo.definition, true);
  assert.equal(SYS_LEVELS.filter((l) => l.definition).length, 1);
});

test("los cinco verbos del diseño aparecen y ninguno se inventa", () => {
  const vistos = new Set(SYS_LEVELS.flatMap((l) => l.evidence));
  assert.deepEqual([...vistos].sort(), [...SYS_EVIDENCE].sort());
});

test("ningún nivel lleva texto: todos los títulos son claves", () => {
  for (const l of SYS_LEVELS) assert.match(l.titleKey, /^level\./);
});

test("la piel del cartel se desvanece en el orden de E0 y la llave nace con las letras", () => {
  assert.deepEqual(
    SYS_LEVELS.map((l) => l.skin),
    ["objects", "objects", "objects", "bars", "chips", "chips", "chips"],
  );
  for (const l of SYS_LEVELS) {
    // La fruta se va en el primer morph y no vuelve: donde hay letras no hay
    // objetos dibujados, y donde hay objetos no hay llave del sistema.
    assert.equal(l.letters, l.skin === "chips", `el nivel ${l.n} mezcla frutas y letras`);
    assert.equal(l.brace, l.letters, `el nivel ${l.n} desacopla la llave del morph`);
  }
});

test("la grilla entra en el penúltimo nivel y ya no se va", () => {
  assert.deepEqual(
    SYS_LEVELS.map((l) => l.grid),
    [false, false, false, false, false, true, true],
  );
});

// --- El registro de nodos ----------------------------------------------------

test("el nodo se registra con el número y los prerequisitos de spine.yaml", () => {
  const spec = nodeById(NODE_TWO_BY_TWO);
  assert.ok(spec, "el nodo no quedó registrado");
  assert.equal(spec.n, 16);
  assert.deepEqual(spec.prereqs, ["alg.eq.multi_step", "alg.expr.distributive_tiles"]);
  assert.equal(spec.levels.length, 7);
});

test("el nodo abre recién cuando los dos prerequisitos están completos", () => {
  const multi = nodeById("alg.eq.multi_step");
  const dist = nodeById("alg.expr.distributive_tiles");
  assert.ok(multi && dist, "los prerequisitos todavía no están construidos");
  assert.equal(isNodeOpen(NODE_TWO_BY_TWO, {}), false);
  assert.equal(
    isNodeOpen(NODE_TWO_BY_TWO, { "alg.eq.multi_step": multi.levels.length }),
    false,
  );
  assert.equal(
    isNodeOpen(NODE_TWO_BY_TWO, {
      "alg.eq.multi_step": multi.levels.length,
      "alg.expr.distributive_tiles": dist.levels.length,
    }),
    true,
  );
});

// --- El invariante silencioso ------------------------------------------------

test("la misma fruta vale lo mismo en todas partes: una sola tabla de valores", () => {
  for (const p of todas()) {
    const valores = par(p);
    for (const f of [0, 1] as const) {
      const v = valores[f];
      if (v === null || v === undefined) continue;
      // El valor entra una vez y todas las filas lo leen de ahí: no hay manera
      // de que una fila use un valor y otra use otro.
      for (const r of p.rows) {
        const propia = sysEval(r, valores);
        const copia = sysEval(r, [valores[0] ?? null, valores[1] ?? null]);
        assert.equal(propia, copia);
      }
    }
  }
});

test("el par verdadero deja derechas todas las filas de la ronda", () => {
  for (const p of todas()) {
    if (p.solution[0] === null || p.solution[1] === null) continue;
    assert.ok(sysSolved(p.rows, par(p)), `el par de ${p.ask} no deja derechas las dos filas`);
  }
});

test("una fila sin todas sus fichas está abierta, no equivocada", () => {
  const p = conPregunta(3, "substitute")[0] as SysProblem;
  const abajo = p.rows[1] as SysRow;
  assert.equal(sysState(abajo, [p.solution[0] ?? null, null]), "open");
  assert.equal(sysTilt(abajo, [p.solution[0] ?? null, null]), 0);
});

test("la línea se inclina para el lado que pesa más", () => {
  const fila: SysRow = { id: "r", terms: [{ fruit: 0, coef: 2 }], total: 10 };
  assert.equal(sysTilt(fila, [6, null]), 1);
  assert.equal(sysTilt(fila, [4, null]), -1);
  assert.equal(sysTilt(fila, [5, null]), 0);
  assert.equal(sysState(fila, [5, null]), "straight");
  assert.equal(sysState(fila, [4, null]), "tilted");
});

// --- Sustituir ---------------------------------------------------------------

test("sustituir cambia la fruta en las dos filas o en ninguna", () => {
  for (const p of conPregunta(3, "substitute")) {
    const x = p.solution[0] as number;
    const despues = sysSubstituteAll(p.rows, 0, x);
    for (const r of despues) assert.equal(sysCoef(r, 0), 0, "quedó una manzana sin reemplazar");
    // La fila de arriba se vacía y queda diciendo que cero pesa cero.
    const arriba = despues[0] as SysRow;
    assert.deepEqual(arriba.terms, []);
    assert.equal(arriba.total, 0);
  }
});

test("sustituir conserva la solución: la fila reemplazada sigue siendo cierta", () => {
  for (const p of todas(6)) {
    const x = p.solution[0];
    const y = p.solution[1];
    if (x === null || x === undefined || y === null || y === undefined) continue;
    for (const r of p.rows) {
      const reemplazada = sysSubstitute(r, 0, x);
      assert.equal(sysState(reemplazada, [x, y]), "straight");
    }
  }
});

test("la sustitución del nivel 3 resuelve el cartel entero", () => {
  for (const p of conPregunta(3, "substitute")) {
    const x = p.solution[0] as number;
    const y = p.solution[1] as number;
    // La fila de arriba tiene una sola fruta: es la que revela el valor.
    assert.deepEqual(sysFruitsOf(p.rows[0] as SysRow), [0]);
    const despues = sysSubstituteAll(p.rows, 0, x);
    const abajo = despues[1] as SysRow;
    assert.deepEqual(sysFruitsOf(abajo), [1]);
    assert.equal(abajo.total / sysCoef(abajo, 1), y);
  }
});

// --- Volcar ------------------------------------------------------------------

test("volcar sin escalar cancela una fruta a la vista", () => {
  for (const p of conPregunta(4, "pour")) {
    assert.notEqual(p.cancels, -1, "las dos filas no cancelan nada al volcarlas");
    const nueva = sysPour(p.rows[0] as SysRow, p.rows[1] as SysRow, 1, "r2");
    assert.equal(sysCoef(nueva, p.cancels as SysFruit), 0);
    assert.equal(sysFruitsOf(nueva).length, 1, "la fila nueva tiene que quedar con una sola fruta");
  }
});

test("volcar produce una fila cierta: la que recibe queda derecha", () => {
  for (const p of todas(6)) {
    if (p.rows.length < 2) continue;
    const x = p.solution[0];
    const y = p.solution[1];
    if (x === null || x === undefined || y === null || y === undefined) continue;
    for (const signo of [1, -1] as const) {
      const nueva = sysPour(p.rows[0] as SysRow, p.rows[1] as SysRow, signo, "r2");
      const estado = sysState(nueva, [x, y]);
      // Una fila que se queda sin frutas dice `0 = 0`, que también es cierta.
      assert.equal(estado, "straight", `volcar con signo ${signo} rompió la igualdad`);
    }
  }
});

test("volcar sin que se cancele nada es válido: la fila nueva trae las dos frutas", () => {
  const a: SysRow = { id: "a", terms: [{ fruit: 0, coef: 1 }, { fruit: 1, coef: 1 }], total: 14 };
  const b: SysRow = { id: "b", terms: [{ fruit: 0, coef: 2 }, { fruit: 1, coef: 3 }], total: 34 };
  const nueva = sysPour(a, b, 1, "c");
  assert.equal(sysFruitsOf(nueva).length, 2);
  assert.equal(nueva.total, 48);
  assert.equal(sysState(nueva, [8, 6]), "straight");
});

test("escalar una fila conserva sus soluciones", () => {
  const fila: SysRow = { id: "r", terms: [{ fruit: 0, coef: 2 }, { fruit: 1, coef: -1 }], total: 7 };
  for (const k of [2, 3, 5, -2]) {
    const grande = sysScale(fila, k);
    assert.equal(sysState(grande, [5, 3]), "straight");
    assert.equal(sysState(grande, [5, 2]), "tilted");
  }
});

test("juntar los tramos de la misma fruta no cambia lo que la fila pesa", () => {
  const fila: SysRow = {
    id: "r",
    terms: [{ fruit: 0, coef: 3 }, { fruit: 1, coef: 2 }, { fruit: 0, coef: -1 }],
    total: 16,
  };
  const junta = sysNormalize(fila);
  assert.equal(junta.terms.length, 2);
  assert.equal(sysCoef(junta, 0), 2);
  assert.equal(sysEval(junta, [4, 4]), sysEval(fila, [4, 4]));
});

// --- Eliminar con escalado ---------------------------------------------------

test("el plan de eliminación cancela de verdad la fruta que nombra", () => {
  for (const p of rondas(nivel(6))) {
    const plan = p.plan;
    assert.ok(plan, "el nivel del escalado no trajo plan");
    const a = sysScale(p.rows[0] as SysRow, plan.factors[0]);
    const b = sysScale(p.rows[1] as SysRow, plan.factors[1]);
    assert.equal(sysCancels(a, b, plan.sign), plan.fruit);
    const nueva = sysPour(a, b, plan.sign, "r2");
    assert.equal(sysCoef(nueva, plan.fruit), 0);
    assert.equal(sysState(nueva, par(p)), "straight");
  }
});

test("el nivel 6 pide escalar de verdad: el plan más barato agranda alguna fila", () => {
  for (const p of rondas(nivel(6))) {
    const plan = p.plan as { readonly factors: readonly [number, number] };
    assert.ok(
      plan.factors[0] > 1 || plan.factors[1] > 1,
      "el sistema se elimina sin escalar y el nivel no enseñaría nada",
    );
  }
});

test("el nivel 4 no pide escalar: el plan es de factores en uno", () => {
  for (const p of conPregunta(4, "pour")) {
    const plan = sysEliminationPlan(p.rows[0] as SysRow, p.rows[1] as SysRow);
    assert.ok(plan);
    assert.deepEqual(plan.factors, [1, 1]);
  }
});

// --- La solución y las tres clases -------------------------------------------

test("el cruce de las dos rectas es el par que deja las dos filas derechas", () => {
  for (const p of todas(6)) {
    if (p.rows.length < 2) continue;
    const s = sysSolve(p.rows[0] as SysRow, p.rows[1] as SysRow);
    if (p.kind !== "unique") continue;
    assert.equal(s.kind, "unique");
    const at = s.at as readonly [number, number];
    assert.equal(sysSolved(p.rows, [at[0], at[1]]), true);
  }
});

test("clasificar reconoce las tres configuraciones de rectas", () => {
  const vistas = new Set<string>();
  for (const p of rondas(nivel(7), 20)) {
    const s = sysSolve(p.rows[0] as SysRow, p.rows[1] as SysRow);
    assert.equal(s.kind, p.kind, "el sistema generado no es de la clase que declara");
    vistas.add(p.kind);
  }
  assert.deepEqual([...vistas].sort(), ["infinite", "none", "unique"]);
});

test("dos filas paralelas no tienen cruce y dos superpuestas tienen infinitos", () => {
  const base: SysRow = { id: "a", terms: [{ fruit: 0, coef: 2 }, { fruit: 1, coef: 3 }], total: 12 };
  const superpuesta = sysScale({ ...base, id: "b" }, 3);
  const paralela = { ...superpuesta, total: superpuesta.total + 1 };
  assert.equal(sysSolve(base, superpuesta).kind, "infinite");
  assert.equal(sysSolve(base, paralela).kind, "none");
  assert.equal(sysSolve(base, { id: "c", terms: [{ fruit: 0, coef: 1 }], total: 3 }).kind, "unique");
});

test("cada fila se lee como una recta con los coeficientes que tiene", () => {
  const fila: SysRow = { id: "r", terms: [{ fruit: 1, coef: -2 }, { fruit: 0, coef: 5 }], total: 9 };
  assert.deepEqual(sysLineOf(fila), { a: 5, b: -2, c: 9 });
});

// --- El error del catálogo ---------------------------------------------------

test("el único error que viaja es el que el catálogo apunta a este nodo", () => {
  assert.equal(SYS_MISCONCEPTION, "substitution_ignores_other_row");
  for (const l of SYS_LEVELS) {
    for (const id of l.classifies) {
      assert.equal(id, SYS_MISCONCEPTION, `el nivel ${l.n} clasifica un error que no es del nodo`);
    }
  }
});

test("una fila derecha y la otra inclinada es resolver una fila sin la otra", () => {
  const l = nivel(3);
  const rows: readonly SysRow[] = [
    { id: "a", terms: [{ fruit: 0, coef: 2 }], total: 10 },
    { id: "b", terms: [{ fruit: 0, coef: 1 }, { fruit: 1, coef: 1 }], total: 9 },
  ];
  // La manzana en 5 deja derecha la de arriba; la banana en 1 inclina la de abajo.
  assert.equal(sysMisconceptionFor(l, rows, [5, 1]), SYS_MISCONCEPTION);
  // Las dos inclinadas es un par equivocado, que es otra cosa y no lleva campo.
  assert.equal(sysMisconceptionFor(l, rows, [3, 1]), undefined);
  // Las dos derechas es haber terminado.
  assert.equal(sysMisconceptionFor(l, rows, [5, 4]), undefined);
  // Una abierta y la otra derecha todavía no es nada.
  assert.equal(sysMisconceptionFor(l, rows, [5, null]), undefined);
});

test("un nivel que no declara el error no lo anota nunca", () => {
  const rows: readonly SysRow[] = [
    { id: "a", terms: [{ fruit: 0, coef: 2 }], total: 10 },
    { id: "b", terms: [{ fruit: 0, coef: 1 }, { fruit: 1, coef: 1 }], total: 9 },
  ];
  for (const n of [1, 2, 7]) {
    assert.equal(sysMisconceptionFor(nivel(n), rows, [5, 1]), undefined);
  }
});

// --- El generador ------------------------------------------------------------

test("la misma semilla y la misma ronda dan el mismo problema", () => {
  for (const l of SYS_LEVELS) {
    for (let r = 0; r < l.rounds; r++) {
      const a = generateSystems(l, 4242 + l.n, r);
      const b = generateSystems(l, 4242 + l.n, r);
      assert.deepEqual(a, b, `el nivel ${l.n} no es reproducible`);
    }
  }
});

test("un nivel con dos preguntas las alterna en vez de sortearlas", () => {
  for (const l of SYS_LEVELS) {
    if (l.asks.length < 2) continue;
    const vistas = new Set<string>();
    for (let r = 0; r < l.rounds; r++) vistas.add(generateSystems(l, 99, r).ask);
    assert.equal(vistas.size, l.asks.length, `el nivel ${l.n} no recorre sus dos preguntas`);
  }
});

test("cada ronda respeta las filas y las frutas que el nivel declara", () => {
  for (const l of SYS_LEVELS) {
    for (const p of rondas(l)) {
      // `classify` arma su propio sistema y por eso no lee `params`; aun así
      // nunca puede traer más filas de las que el cartel dibuja.
      assert.ok(p.rows.length <= l.params.rows, `el nivel ${l.n} trajo filas de más`);
      const frutas = new Set(p.rows.flatMap((r) => sysFruitsOf(r)));
      assert.ok(frutas.size <= l.params.fruits, `el nivel ${l.n} trajo frutas de más`);
    }
  }
});

test("el mostrador está lleno, sin fichas repetidas y con los valores verdaderos", () => {
  for (const l of SYS_LEVELS) {
    for (const p of rondas(l)) {
      if (p.ask === "classify") continue;
      assert.equal(p.chips.length, SYS_CHIP_SLOTS, `el nivel ${l.n} no llenó el mostrador`);
      assert.equal(new Set(p.chips).size, p.chips.length, "hay dos fichas iguales");
      for (const v of p.solution) {
        if (v === null) continue;
        assert.ok(p.chips.includes(v), `falta la ficha ${v} en el nivel ${l.n}`);
      }
    }
  }
});

test("sin negativos habilitados no hay fichas ni totales en deuda", () => {
  for (const l of SYS_LEVELS) {
    if (l.params.negatives) continue;
    for (const p of rondas(l)) {
      for (const c of p.chips) assert.ok(c > 0, `el nivel ${l.n} ofreció una ficha negativa`);
      for (const r of p.rows) assert.ok(r.total > 0, `el nivel ${l.n} dibujó un total en deuda`);
    }
  }
});

test("sin la resta habilitada ningún tramo se resta", () => {
  for (const l of SYS_LEVELS) {
    if (l.params.subtraction) continue;
    for (const p of rondas(l)) {
      for (const r of p.rows) {
        for (const t of r.terms) assert.ok(t.coef > 0, `el nivel ${l.n} restó una fruta`);
      }
    }
  }
});

test("una fruta no se repite más de lo que el renglón puede dibujar", () => {
  // El tope es de dibujo y no de dificultad, así que rige solo mientras la
  // fruta se dibuje: desde `chips` el coeficiente es un numeral y un doce ocupa
  // lo mismo que un dos.
  for (const l of SYS_LEVELS) {
    if (l.skin === "chips") continue;
    for (const p of rondas(l)) {
      for (const r of p.rows) {
        for (const f of [0, 1] as const) {
          assert.ok(
            Math.abs(sysCoef(r, f)) <= SYS_MAX_REPEAT,
            `el nivel ${l.n} pide más frutas de las que entran en el renglón`,
          );
        }
      }
    }
  }
});

test("repartir arma una fila con la misma fruta repetida y un total que se reparte", () => {
  for (const p of rondas(nivel(1))) {
    assert.equal(p.rows.length, 1);
    const fila = p.rows[0] as SysRow;
    assert.deepEqual(sysFruitsOf(fila), [0]);
    const k = sysCoef(fila, 0);
    assert.ok(k >= 2 && k <= SYS_MAX_REPEAT);
    assert.equal(fila.total % k, 0, "el total no se reparte en partes iguales");
    assert.equal(fila.total / k, p.solution[0]);
  }
});

test("una fila con dos frutas no determina un par, y el mostrador ofrece varios", () => {
  for (const p of rondas(nivel(2))) {
    assert.deepEqual(p.solution, [null, null]);
    const fila = p.rows[0] as SysRow;
    let pares = 0;
    for (const x of p.chips) {
      for (const y of p.chips) {
        if (sysState(fila, [x, y]) === "straight") pares++;
      }
    }
    assert.ok(pares >= p.picks, `el mostrador da ${pares} pares y el nivel pide ${p.picks}`);
  }
});

test("la bandeja de factores está llena justo cuando el nivel pide escalar", () => {
  for (const l of SYS_LEVELS) {
    for (const p of rondas(l)) {
      if (l.params.scaling === "none" || p.plan === null) {
        assert.deepEqual(p.factors, [], `el nivel ${l.n} ofrece factores sin nada que escalar`);
        continue;
      }
      assert.equal(p.factors.length, SYS_FACTOR_SLOTS);
      assert.ok(p.factors.includes(p.plan.factors[0]));
      assert.ok(p.factors.includes(p.plan.factors[1]));
    }
  }
});

test("el nivel 6 desordena los términos y el 5 no", () => {
  const ordenado = (p: SysProblem): boolean =>
    p.rows.every((r) => r.terms.every((t, i) => (r.terms[i - 1]?.fruit ?? -1) < t.fruit));
  assert.ok(rondas(nivel(5)).every(ordenado), "el nivel 5 desordenó los términos");
  assert.ok(
    rondas(nivel(6), 20).some((p) => !ordenado(p)),
    "el nivel 6 nunca desordenó los términos",
  );
});
