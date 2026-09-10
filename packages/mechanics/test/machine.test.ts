import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FN_EVIDENCE,
  FN_LAYERS,
  FN_LEVELS,
  FN_MACHINE_SLOTS,
  FN_MAX_VALUE,
  FN_MISCONCEPTION,
  FN_NET_INPUT_SLOTS,
  FN_NET_OUTPUT_SLOTS,
  FN_OPTION_SLOTS,
  FN_TABLE_SLOTS,
  FN_TRAY_SLOTS,
  NODE_FUNCTION_AS_MACHINE,
  TOTAL_FN_LEVELS,
  fnApplyOp,
  fnArrowTarget,
  fnArrowsFrom,
  fnCallPieces,
  fnFormulaPieces,
  fnIsMachine,
  fnLevelByNumber,
  fnMisconceptionFor,
  fnNetworkIsFunction,
  fnRowsAreFunction,
  fnRulePieces,
  fnRun,
  generateMachine,
  isNodeOpen,
  nodeById,
  type FnAsk,
  type FnLevel,
  type FnMachine,
  type FnPiece,
  type FnProblem,
} from "../src/index.ts";

const seeds = (n: number): number[] => Array.from({ length: n }, (_, i) => i * 37 + 1);

/** Todas las rondas de un nivel, para todas las semillas de la muestra. */
function rounds(level: FnLevel, n = 24): FnProblem[] {
  const out: FnProblem[] = [];
  for (const seed of seeds(n)) {
    for (let r = 0; r < level.rounds; r++) out.push(generateMachine(level, seed + r, r));
  }
  return out;
}

const todas = (): FnProblem[] => FN_LEVELS.flatMap((l) => rounds(l, 12));

/** Las rondas de una pregunta, de cualquier nivel que la use. */
function conPregunta(ask: FnAsk): FnProblem[] {
  return todas().filter((p) => p.ask === ask);
}

// --- Los niveles como datos --------------------------------------------------

test("los seis niveles del diseño están, en orden y sin repetir", () => {
  assert.equal(FN_LEVELS.length, 6);
  assert.equal(TOTAL_FN_LEVELS, 6);
  assert.deepEqual(
    FN_LEVELS.map((l) => l.n),
    [1, 2, 3, 4, 5, 6],
  );
});

test("cada nivel cambia la capa o endurece parámetros, nunca las dos cosas", () => {
  for (let i = 1; i < FN_LEVELS.length; i++) {
    const prev = FN_LEVELS[i - 1] as FnLevel;
    const cur = FN_LEVELS[i] as FnLevel;
    const cambioCapa = prev.layer !== cur.layer;
    const cambioParams = JSON.stringify(prev.params) !== JSON.stringify(cur.params);
    assert.ok(
      !(cambioCapa && cambioParams),
      `el nivel ${cur.n} cambia la capa y los parámetros a la vez`,
    );
  }
});

test("los parámetros nunca se ablandan al avanzar de nivel", () => {
  for (let i = 1; i < FN_LEVELS.length; i++) {
    const prev = (FN_LEVELS[i - 1] as FnLevel).params;
    const cur = (FN_LEVELS[i] as FnLevel).params;
    assert.ok(cur.stages >= prev.stages, `el nivel ${i + 1} saca una máquina del caño`);
    assert.ok(cur.ops.length >= prev.ops.length, `el nivel ${i + 1} saca operaciones`);
    for (const o of prev.ops) assert.ok(cur.ops.includes(o), `el nivel ${i + 1} pierde ${o}`);
    assert.ok(cur.operandRange[1] >= prev.operandRange[1], `el nivel ${i + 1} achica los números`);
    for (const k of prev.inputKinds) {
      assert.ok(cur.inputKinds.includes(k), `el nivel ${i + 1} pierde las entradas ${k}`);
    }
    assert.ok(
      Number(cur.rejectsInput) >= Number(prev.rejectsInput),
      `el nivel ${i + 1} deja de rechazar entradas`,
    );
    assert.ok(
      Number(cur.ambiguous) >= Number(prev.ambiguous),
      `el nivel ${i + 1} saca las reglas ambiguas`,
    );
  }
});

test("el nodo recorre las cuatro capas del diseño y termina en la definición", () => {
  assert.deepEqual([...new Set(FN_LEVELS.map((l) => l.layer))], FN_LAYERS);
  assert.equal((FN_LEVELS.at(-1) as FnLevel).layer, "formal");
  assert.ok((FN_LEVELS.at(-1) as FnLevel).definition);
  assert.ok(FN_LEVELS.filter((l) => l.definition).length === 1);
});

test("los verbos de cada nivel son los que declara el minijuego", () => {
  assert.deepEqual(
    FN_LEVELS.map((l) => [...l.evidence]),
    [
      ["manipulate"],
      ["recognize", "manipulate"],
      ["explain"],
      ["manipulate", "apply"],
      ["apply"],
      ["generalize"],
    ],
  );
  for (const l of FN_LEVELS) {
    for (const e of l.evidence) assert.ok(FN_EVIDENCE.includes(e), `verbo suelto: ${e}`);
  }
});

test("la máquina no tiene nombre hasta que hay dos en pantalla", () => {
  // Es la regla de oro de H: el símbolo aparece cuando el jugador sintió la
  // falta. La falta es el nivel 4, donde la salida pedida no dice cuál máquina.
  for (const l of FN_LEVELS) {
    assert.equal(l.named, l.n >= 4, `el nivel ${l.n} nombra la máquina fuera de lugar`);
  }
  const cuarto = fnLevelByNumber(4) as FnLevel;
  assert.ok(cuarto.asks.includes("name"));
  for (const p of conPregunta("name")) {
    assert.equal(p.other.length > 0, true, "la ronda que hace nacer el nombre trae una sola máquina");
  }
});

test("la placa está vacía solo en el primer nivel", () => {
  assert.equal((fnLevelByNumber(1) as FnLevel).plate, false);
  for (const l of FN_LEVELS.slice(1)) assert.ok(l.plate, `el nivel ${l.n} esconde la regla`);
});

test("cada nivel tiene rondas para todas sus preguntas", () => {
  for (const l of FN_LEVELS) {
    assert.ok(l.rounds >= l.asks.length, `el nivel ${l.n} no llega a preguntar todo`);
    assert.equal(l.rounds % l.asks.length, 0, `el nivel ${l.n} pregunta unas más que otras`);
  }
});

test("el nodo está registrado con los prerequisitos de la espina", () => {
  const spec = nodeById(NODE_FUNCTION_AS_MACHINE);
  assert.ok(spec);
  assert.equal(spec.n, 17);
  assert.deepEqual([...spec.prereqs], [
    "prealg.var.unknown_as_box",
    "arith.expr.precedence_tree",
  ]);
  assert.equal(spec.levels.length, 6);
});

test("el nodo se abre recién con los dos prerequisitos terminados", () => {
  const caja = nodeById("prealg.var.unknown_as_box");
  const arbol = nodeById("arith.expr.precedence_tree");
  assert.ok(caja && arbol);
  assert.equal(isNodeOpen(NODE_FUNCTION_AS_MACHINE, {}), false);
  assert.equal(
    isNodeOpen(NODE_FUNCTION_AS_MACHINE, { "prealg.var.unknown_as_box": caja.levels.length }),
    false,
  );
  assert.equal(
    isNodeOpen(NODE_FUNCTION_AS_MACHINE, {
      "prealg.var.unknown_as_box": caja.levels.length,
      "arith.expr.precedence_tree": arbol.levels.length,
    }),
    true,
  );
});

// --- El invariante: una salida por entrada -----------------------------------

test("la misma entrada por la misma cadena da siempre la misma salida", () => {
  for (const p of todas()) {
    if (p.solution.length === 0) continue;
    for (let v = 1; v <= 9; v++) {
      const a = fnRun(v, p.solution);
      const b = fnRun(v, p.solution);
      assert.deepEqual(a, b, "la cadena no es determinista");
    }
  }
});

test("el desvío saca dos salidas distintas de la misma entrada", () => {
  const desvio: FnMachine[] = [
    { id: "m0", op: "mul", value: 3, fork: { op: "add", value: 3 }, rejects: null },
  ];
  const run = fnRun(4, desvio);
  assert.equal(run.output, 12);
  assert.equal(run.second, 7);
  assert.notEqual(run.output, run.second);
  assert.equal(fnIsMachine(desvio), false);
  assert.equal(fnIsMachine([{ ...(desvio[0] as FnMachine), fork: null }]), true);
});

test("la tabla, la red y el caño dicen lo mismo sobre qué es una función", () => {
  assert.equal(
    fnRowsAreFunction([
      { input: 2, output: 7, second: null },
      { input: 3, output: 10, second: null },
    ]),
    true,
  );
  // La misma salida desde dos entradas distintas sigue siendo una función.
  assert.equal(
    fnRowsAreFunction([
      { input: 2, output: 7, second: null },
      { input: 3, output: 7, second: null },
    ]),
    true,
  );
  assert.equal(
    fnRowsAreFunction([
      { input: 2, output: 7, second: null },
      { input: 2, output: 9, second: null },
    ]),
    false,
  );
  assert.equal(fnRowsAreFunction([{ input: 2, output: 7, second: 5 }]), false);

  assert.equal(fnNetworkIsFunction(2, [{ from: 0, to: 0 }, { from: 1, to: 1 }]), true);
  assert.equal(fnNetworkIsFunction(2, [{ from: 0, to: 0 }, { from: 0, to: 1 }]), false);
  assert.equal(fnNetworkIsFunction(2, [{ from: 0, to: 0 }]), false);
});

test("el único error catalogado es el de las dos salidas, y solo donde clasifica", () => {
  assert.equal(FN_MISCONCEPTION, "machine_gives_two_outputs");
  for (const ask of ["broken", "network", "judge", "relation"] as const) {
    assert.equal(fnMisconceptionFor(ask, true), FN_MISCONCEPTION);
    assert.equal(fnMisconceptionFor(ask, false), undefined);
  }
  // Elegir mal en una ronda que no puede producir una regla ambigua no es este
  // error: un id inventado ensucia la remediación para siempre.
  for (const ask of ["guess", "build", "name", "evaluate", "letters", "chain", "reject", "sameRule", "fromTable"] as const) {
    assert.equal(fnMisconceptionFor(ask, true), undefined);
  }
});

// --- El generador ------------------------------------------------------------

test("la misma semilla da exactamente la misma ronda", () => {
  for (const level of FN_LEVELS) {
    for (let r = 0; r < level.rounds; r++) {
      const a = generateMachine(level, 4242 + r, r);
      const b = generateMachine(level, 4242 + r, r);
      assert.deepEqual(a, b, `el nivel ${level.n} no es reproducible`);
    }
  }
});

test("las rondas de un nivel alternan sus preguntas y no las sortean", () => {
  for (const level of FN_LEVELS) {
    const vistas = new Set<string>();
    for (let r = 0; r < level.rounds; r++) {
      vistas.add(generateMachine(level, 7, r).ask);
    }
    assert.deepEqual([...vistas].sort(), [...level.asks].sort());
  }
});

test("ninguna ronda se sale de las ranuras montadas", () => {
  for (const p of todas()) {
    assert.ok(p.tray.length <= FN_TRAY_SLOTS, `${p.ask}: cajón de ${p.tray.length}`);
    assert.ok(p.tokens.length <= FN_TRAY_SLOTS, `${p.ask}: ${p.tokens.length} fichas`);
    assert.ok(p.options.length <= FN_OPTION_SLOTS, `${p.ask}: ${p.options.length} opciones`);
    assert.ok(p.rows.length <= FN_TABLE_SLOTS, `${p.ask}: ${p.rows.length} filas`);
    assert.ok(p.machines.length <= FN_MACHINE_SLOTS, `${p.ask}: ${p.machines.length} máquinas`);
    assert.ok(p.solution.length <= FN_MACHINE_SLOTS, `${p.ask}: solución de ${p.solution.length}`);
    assert.ok(p.other.length <= FN_MACHINE_SLOTS, `${p.ask}: segunda cadena de ${p.other.length}`);
    for (const red of p.networks) {
      assert.ok(red.inputs.length <= FN_NET_INPUT_SLOTS, `${p.ask}: red de ${red.inputs.length}`);
      assert.ok(red.outputs.length <= FN_NET_OUTPUT_SLOTS, `${p.ask}: red de ${red.outputs.length}`);
    }
  }
});

test("las salidas son enteras y se leen de un vistazo", () => {
  for (const p of todas()) {
    if (p.solution.length === 0 || p.ask === "reject") continue;
    const run = fnRun(p.input === 0 ? 1 : p.input, p.solution);
    if (Number.isNaN(run.output)) continue;
    assert.ok(Number.isInteger(run.output), `${p.ask}: salida ${run.output}`);
    assert.ok(Math.abs(run.output) <= FN_MAX_VALUE, `${p.ask}: salida ${run.output}`);
  }
});

test("toda ronda con fichas de respuesta tiene una correcta y ninguna repetida", () => {
  for (const p of todas()) {
    if (p.options.length === 0) continue;
    assert.equal(
      p.options.filter((o) => o.correct).length,
      1,
      `${p.ask}: no hay exactamente una ficha correcta`,
    );
    const claves = p.options.map((o) => JSON.stringify(o.pieces));
    assert.equal(new Set(claves).size, claves.length, `${p.ask}: fichas repetidas`);
    for (const o of p.options) {
      assert.equal(o.correct, o.lure === undefined, `${p.ask}: un distractor sin motivo`);
    }
  }
});

// --- Las preguntas, una por una ----------------------------------------------

test("adivinar la máquina: la ficha pedida está en el cajón y es la única que da la salida", () => {
  const rondas = conPregunta("guess");
  assert.ok(rondas.length > 0);
  for (const p of rondas) {
    assert.ok(p.tokens.includes(p.input), "la ficha que resuelve no está en el cajón");
    assert.equal(fnRun(p.input, p.solution).output, p.target);
    const aciertan = p.tokens.filter((v) => fnRun(v, p.solution).output === p.target);
    assert.deepEqual(aciertan, [p.input], "más de una ficha da la salida pedida");
    assert.equal(p.solution.length, 1, "el primer nivel pide una sola operación");
    assert.equal(new Set(p.tokens).size, p.tokens.length, "el cajón repite fichas");
  }
});

test("armar la máquina: el cajón tiene la cadena entera y la tabla la describe", () => {
  const rondas = [...conPregunta("build"), ...conPregunta("broken")];
  assert.ok(rondas.length > 0);
  for (const p of rondas) {
    assert.ok(p.solution.length >= 2, "la cadena del segundo nivel tiene dos máquinas");
    for (const m of p.solution) {
      assert.ok(
        p.tray.some((t) => t.op === m.op && t.value === m.value && t.fork === null),
        "falta en el cajón una máquina de la solución",
      );
    }
    for (const fila of p.rows) {
      assert.equal(fnRun(fila.input, p.solution).output, fila.output, "la tabla no dice la cadena");
      assert.equal(fila.second, null, "la tabla objetivo no puede traer dos salidas");
    }
    assert.ok(fnRowsAreFunction(p.rows), "la tabla objetivo no es una función");
  }
});

test("la máquina rota: el desvío reproduce la tabla y aun así no es una máquina", () => {
  const rondas = conPregunta("broken");
  assert.ok(rondas.length > 0);
  for (const p of rondas) {
    const desvios = p.tray.filter((m) => m.fork !== null);
    assert.equal(desvios.length, 1, "la ronda rota tiene exactamente un desvío");
    const desvio = desvios[0] as FnMachine;
    const primera = p.solution[0] as FnMachine;
    // La trampa tiene que ser una trampa: por la rama principal el desvío hace
    // lo mismo que la máquina buena, así que la tabla objetivo se cumple igual.
    assert.equal(desvio.op, primera.op);
    assert.equal(desvio.value, primera.value);
    const conDesvio = [desvio, ...p.solution.slice(1)];
    for (const fila of p.rows) {
      assert.equal(fnRun(fila.input, conDesvio).output, fila.output);
    }
    assert.equal(fnIsMachine(conDesvio), false, "el desvío tendría que romper el invariante");
    for (const fila of p.rows) {
      const run = fnRun(fila.input, conDesvio);
      assert.notEqual(run.second, null, "el desvío no sacó su segunda salida");
      assert.notEqual(run.second, run.output, "las dos salidas del desvío coinciden");
    }
  }
});

test("la red: cada entrada tiene su salida en la columna y sobra un punto sin flecha", () => {
  const rondas = conPregunta("network");
  assert.ok(rondas.length > 0);
  for (const p of rondas) {
    const red = p.networks[0];
    assert.ok(red);
    assert.equal(red.arrows.length, 0, "la red llega con flechas ya colgadas");
    assert.ok(red.inputs.length >= 3, "la red tiene menos puntos de los que pide el diseño");
    const destinos = new Set<number>();
    for (let i = 0; i < red.inputs.length; i++) {
      const to = fnArrowTarget(red, i, p.solution);
      assert.ok(to >= 0, "una entrada no tiene a dónde ir");
      destinos.add(to);
    }
    assert.ok(
      red.outputs.length > destinos.size,
      "no quedó ningún punto de salida sin flecha que llegue",
    );
  }
});

test("las dos redes de la explicación: una es una máquina y la otra le cuelga dos flechas al mismo punto", () => {
  const rondas = conPregunta("judge");
  assert.ok(rondas.length > 0);
  for (const p of rondas) {
    assert.equal(p.networks.length, 2);
    const buenas = p.networks.filter((n) => n.isFunction);
    assert.equal(buenas.length, 1, "las dos redes son iguales de buenas");
    for (const red of p.networks) {
      assert.equal(
        fnNetworkIsFunction(red.inputs.length, red.arrows),
        red.isFunction,
        "la red no dice lo que declara",
      );
    }
    const mala = p.networks.find((n) => !n.isFunction);
    assert.ok(mala);
    const dobles = mala.inputs
      .map((_, i) => fnArrowsFrom(mala.arrows, i).length)
      .filter((c) => c === 2);
    assert.equal(dobles.length, 1, "la red rota no tiene exactamente un punto con dos flechas");
  }
});

test("nombrar la máquina: la salida pedida separa una máquina de la otra", () => {
  const rondas = conPregunta("name");
  assert.ok(rondas.length > 0);
  for (const p of rondas) {
    assert.equal(fnRun(p.input, p.machines).output, p.target);
    assert.notEqual(fnRun(p.input, p.other).output, p.target, "las dos máquinas dan lo mismo");
  }
});

test("evaluar: la ficha correcta es la salida y los distractores son pasos sueltos", () => {
  const rondas = conPregunta("evaluate");
  assert.ok(rondas.length > 0);
  for (const p of rondas) {
    const buena = p.options.find((o) => o.correct);
    assert.ok(buena);
    assert.deepEqual(buena.pieces, [{ kind: "num", value: p.target }]);
    assert.equal(fnRun(p.input, p.solution).output, p.target);
  }
});

test("las letras: el argumento compuesto queda entre paréntesis cuando algo lo multiplica", () => {
  const rondas = conPregunta("letters");
  assert.ok(rondas.length > 0);
  for (const p of rondas) {
    assert.ok(p.inputKind !== "number", "la ronda de letras evalúa con un número");
    assert.ok(p.argument.length > 0);
    const buena = p.options.find((o) => o.correct);
    assert.ok(buena);
    assert.deepEqual(buena.pieces, fnRulePieces(p.solution, p.argument));
    const conFactor = p.solution.some((m) => m.op === "mul");
    const compuesto = p.argument.length > 1;
    const abre = buena.pieces.some((x) => x.kind === "open");
    assert.equal(abre, conFactor && compuesto, "los paréntesis del argumento están mal puestos");
  }
});

test("encadenar: el orden que llega no da la salida pedida y el otro sí", () => {
  const rondas = conPregunta("chain");
  assert.ok(rondas.length > 0);
  for (const p of rondas) {
    assert.equal(fnRun(p.input, p.solution).output, p.target);
    assert.notEqual(fnRun(p.input, p.machines).output, p.target, "el caño ya llega resuelto");
    assert.equal(p.machines.length, p.solution.length);
  }
});

test("rechazar: la ficha que resuelve entra y alguna otra la máquina la escupe", () => {
  const rondas = conPregunta("reject");
  assert.ok(rondas.length > 0);
  for (const p of rondas) {
    assert.ok(p.tokens.includes(p.input));
    const salida = fnRun(p.input, p.solution).output;
    assert.ok(Number.isInteger(salida), "la ficha que resuelve no sale entera");
    assert.equal(salida, p.target);
    const rechazadas = p.tokens.filter((v) => !Number.isInteger(fnRun(v, p.solution).output));
    assert.ok(rechazadas.length > 0, "ninguna ficha queda fuera del dominio");
  }
});

test("dos escrituras: la ficha correcta vale lo mismo que la regla para toda entrada", () => {
  const rondas = conPregunta("sameRule");
  assert.ok(rondas.length > 0);
  for (const p of rondas) {
    for (const o of p.options) {
      const igual = [...Array(12).keys()].every(
        (x) => evalPieces(p.argument, x) === evalPieces(o.pieces, x),
      );
      assert.equal(igual, o.correct, "una ficha dice ser la misma función y no lo es");
    }
  }
});

test("la regla desde la tabla: las dos reglas explican la fila y la entrada extra las separa", () => {
  const rondas = conPregunta("fromTable");
  assert.ok(rondas.length > 0);
  for (const p of rondas) {
    assert.equal(p.rows.length, 1);
    const fila = p.rows[0];
    assert.ok(fila);
    for (const o of p.options) {
      assert.equal(evalPieces(o.pieces, fila.input), fila.output, "una regla no explica la tabla");
    }
    const valores = p.options.map((o) => evalPieces(o.pieces, p.extra));
    assert.equal(new Set(valores).size, p.options.length, "la entrada extra no separa las reglas");
    assert.deepEqual([...p.tokens], [p.extra]);
    const buena = p.options.find((o) => o.correct);
    assert.ok(buena);
    assert.equal(evalPieces(buena.pieces, p.extra), fnRun(p.extra, p.solution).output);
  }
});

test("la relación: las dos tablas repiten una entrada y solo una repite la salida", () => {
  const rondas = conPregunta("relation");
  assert.ok(rondas.length > 0);
  let ambiguas = 0;
  for (const p of rondas) {
    const esFuncion = fnRowsAreFunction(p.rows);
    if (!esFuncion) ambiguas++;
    // Lo que decide no es que una entrada aparezca dos veces: eso pasa en las
    // dos tablas. Decide que las dos veces salga lo mismo.
    const repetidas = p.rows.filter((r) => r.input === p.input);
    assert.equal(repetidas.length, 2, "la tabla no repite ninguna entrada");
    const salidas = new Set(repetidas.map((r) => r.output));
    assert.equal(salidas.size === 1, esFuncion, "la tabla no dice lo que el criterio dice");
    // Decir que la tabla ambigua es una máquina es el error del catálogo; decir
    // que la buena no lo es, no lo es.
    assert.equal(fnMisconceptionFor(p.ask, !esFuncion), esFuncion ? undefined : FN_MISCONCEPTION);
  }
  assert.ok(ambiguas > 0, "ninguna tabla rompe el invariante");
  assert.ok(ambiguas < rondas.length, "todas las tablas rompen el invariante");
});

// --- La regla escrita --------------------------------------------------------

test("la regla se escribe sin paréntesis cuando el argumento es una sola pieza", () => {
  const f: FnMachine[] = [
    { id: "m0", op: "mul", value: 3, fork: null, rejects: null },
    { id: "m1", op: "add", value: 1, fork: null, rejects: null },
  ];
  assert.deepEqual(fnRulePieces(f, [{ kind: "sym", name: "x" }]), [
    { kind: "num", value: 3 },
    { kind: "sym", name: "x" },
    { kind: "op", op: "add" },
    { kind: "num", value: 1 },
  ]);
  // Y con paréntesis cuando el argumento es una expresión, porque `3x + 1 + 1`
  // sería otra función.
  const conParentesis = fnRulePieces(f, [
    { kind: "sym", name: "x" },
    { kind: "op", op: "add" },
    { kind: "num", value: 1 },
  ]);
  assert.equal(conParentesis[1]?.kind, "open");
  assert.equal(evalPieces(conParentesis, 5), 19);
});

test("la fórmula es el nombre, la ranura vuelta paréntesis y la regla del otro lado del igual", () => {
  const f: FnMachine[] = [
    { id: "m0", op: "mul", value: 3, fork: null, rejects: null },
    { id: "m1", op: "add", value: 1, fork: null, rejects: null },
  ];
  const piezas = fnFormulaPieces("f", f);
  assert.deepEqual(piezas.slice(0, 4), [
    { kind: "sym", name: "f" },
    { kind: "open" },
    { kind: "sym", name: "x" },
    { kind: "close" },
  ]);
  assert.equal(piezas[4]?.kind, "eq");
  assert.deepEqual(fnCallPieces("f", [{ kind: "num", value: 2 }]), [
    { kind: "sym", name: "f" },
    { kind: "open" },
    { kind: "num", value: 2 },
    { kind: "close" },
  ]);
});

test("las cuatro operaciones hacen lo que dicen", () => {
  assert.equal(fnApplyOp(5, "add", 3), 8);
  assert.equal(fnApplyOp(5, "sub", 3), 2);
  assert.equal(fnApplyOp(5, "mul", 3), 15);
  assert.equal(fnApplyOp(6, "div", 3), 2);
  assert.ok(Number.isNaN(fnApplyOp(6, "div", 0)));
});

// --- Un evaluador mínimo de piezas, para los tests ---------------------------

/**
 * Cuánto vale una expresión escrita, con `x` valiendo lo que se le pase. Es de
 * los tests y no del paquete: el modelo no lee expresiones, las escribe.
 */
function evalPieces(pieces: readonly FnPiece[], x: number): number {
  let i = 0;
  const factor = (): number => {
    const p = pieces[i];
    if (!p) return NaN;
    if (p.kind === "open") {
      i++;
      const v = suma();
      if (pieces[i]?.kind === "close") i++;
      return v;
    }
    if (p.kind === "num") {
      i++;
      // La yuxtaposición es multiplicar: `3x` y `3(x + 1)`.
      const sig = pieces[i];
      if (sig && (sig.kind === "sym" || sig.kind === "open")) return p.value * factor();
      return p.value;
    }
    if (p.kind === "sym") {
      i++;
      return x;
    }
    i++;
    return NaN;
  };
  const producto = (): number => {
    let v = factor();
    while (pieces[i]?.kind === "op") {
      const p = pieces[i] as { kind: "op"; op: string };
      if (p.op !== "mul" && p.op !== "div") break;
      i++;
      const otro = factor();
      v = p.op === "mul" ? v * otro : v / otro;
    }
    return v;
  };
  const suma = (): number => {
    let v = producto();
    while (pieces[i]?.kind === "op") {
      const p = pieces[i] as { kind: "op"; op: string };
      if (p.op !== "add" && p.op !== "sub") break;
      i++;
      const otro = producto();
      v = p.op === "add" ? v + otro : v - otro;
    }
    return v;
  };
  return suma();
}
