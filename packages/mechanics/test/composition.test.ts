import { test } from "node:test";
import assert from "node:assert/strict";
import {
  COMP_EVIDENCE,
  COMP_LAYERS,
  COMP_LEVELS,
  COMP_MACHINE_SLOTS,
  COMP_MAX_VALUE,
  COMP_MISCONCEPTION,
  COMP_OPTION_SLOTS,
  COMP_TRAY_SLOTS,
  NODE_COMPOSITION,
  TOTAL_COMP_LEVELS,
  compApply,
  compBlocks,
  compChainPieces,
  compCommutes,
  compEvaluatedPieces,
  compLevelByNumber,
  compMisconceptionFor,
  compNestPieces,
  compOpPieces,
  compOrderMatters,
  compReverse,
  compRingPieces,
  compRun,
  compUnequalPieces,
  compUndoOrder,
  generateComposition,
  isNodeOpen,
  keyUndoOrder,
  nodeById,
  type CompAsk,
  type CompLevel,
  type CompMachine,
  type CompPiece,
  type CompProblem,
} from "../src/index.ts";

const seeds = (n: number): number[] => Array.from({ length: n }, (_, i) => i * 37 + 1);

/** Todas las rondas de un nivel, para todas las semillas de la muestra. */
function rounds(level: CompLevel, n = 24): CompProblem[] {
  const out: CompProblem[] = [];
  for (const seed of seeds(n)) {
    for (let r = 0; r < level.rounds; r++) out.push(generateComposition(level, seed + r, r));
  }
  return out;
}

const todas = (): CompProblem[] => COMP_LEVELS.flatMap((l) => rounds(l, 12));

/** Las rondas de una pregunta, de cualquier nivel que la use. */
const conPregunta = (ask: CompAsk): CompProblem[] => todas().filter((p) => p.ask === ask);

/** Una máquina escrita a mano, para los tests que no generan nada. */
const m = (id: string, name: string, op: CompMachine["op"], value: number): CompMachine => ({
  id,
  name,
  op,
  value,
});

/** Las piezas, como texto plano, para comparar sin mirar la forma del objeto. */
function texto(pieces: readonly CompPiece[]): string {
  const signo: Record<string, string> = { add: "+", sub: "−", mul: "×", div: "÷" };
  return pieces
    .map((p) =>
      p.kind === "num"
        ? String(p.value)
        : p.kind === "sym"
          ? p.name
          : p.kind === "op"
            ? signo[p.op] ?? "?"
            : p.kind === "ring"
              ? "∘"
              : p.kind === "neq"
                ? "≠"
                : p.kind === "open"
                  ? "("
                  : p.kind === "close"
                    ? ")"
                    : "=",
    )
    .join("");
}

// --- Los niveles como datos --------------------------------------------------

test("los siete niveles del diseño están, en orden y sin repetir", () => {
  assert.equal(COMP_LEVELS.length, 7);
  assert.equal(TOTAL_COMP_LEVELS, 7);
  assert.deepEqual(
    COMP_LEVELS.map((l) => l.n),
    [1, 2, 3, 4, 5, 6, 7],
  );
  for (const l of COMP_LEVELS) assert.equal(compLevelByNumber(l.n), l);
});

test("cada nivel cambia la capa o endurece parámetros, nunca las dos cosas", () => {
  for (let i = 1; i < COMP_LEVELS.length; i++) {
    const prev = COMP_LEVELS[i - 1] as CompLevel;
    const cur = COMP_LEVELS[i] as CompLevel;
    const cambioCapa = prev.layer !== cur.layer;
    const cambioParams = JSON.stringify(prev.params) !== JSON.stringify(cur.params);
    assert.ok(
      !(cambioCapa && cambioParams),
      `el nivel ${cur.n} cambia la capa y los parámetros a la vez`,
    );
  }
});

test("los parámetros nunca se ablandan al avanzar de nivel", () => {
  for (let i = 1; i < COMP_LEVELS.length; i++) {
    const prev = (COMP_LEVELS[i - 1] as CompLevel).params;
    const cur = (COMP_LEVELS[i] as CompLevel).params;
    assert.ok(cur.length >= prev.length, `el nivel ${i + 1} saca una máquina de la cadena`);
    for (const o of prev.ops) assert.ok(cur.ops.includes(o), `el nivel ${i + 1} pierde ${o}`);
    assert.ok(cur.operandRange[1] >= prev.operandRange[1], `el nivel ${i + 1} achica los operandos`);
    assert.ok(cur.inputRange[1] >= prev.inputRange[1], `el nivel ${i + 1} achica las entradas`);
    for (const clave of ["commutingPairs", "includeIdentity", "incompatible"] as const) {
      assert.ok(Number(cur[clave]) >= Number(prev[clave]), `el nivel ${i + 1} apaga ${clave}`);
    }
  }
});

/**
 * El nivel 7 se queda en `symbolic` a propósito: el documento le pide capa nueva
 * y parámetros nuevos, no hay nivel siguiente donde correr el ensanchamiento, y
 * la regla del repositorio manda que gane la regla. El test fija esa decisión
 * para que un cambio futuro tenga que discutirla en vez de tropezarse con ella.
 */
test("el nodo recorre las capas hasta symbolic y cierra con la definición", () => {
  assert.deepEqual([...new Set(COMP_LEVELS.map((l) => l.layer))], COMP_LAYERS);
  assert.equal((COMP_LEVELS.at(-1) as CompLevel).layer, "symbolic");
  assert.ok((COMP_LEVELS.at(-1) as CompLevel).definition);
  assert.equal(COMP_LEVELS.filter((l) => l.definition).length, 1);
});

test("los verbos de cada nivel son los que declara el minijuego", () => {
  assert.deepEqual(
    COMP_LEVELS.map((l) => [...l.evidence]),
    [
      ["recognize"],
      ["explain"],
      ["manipulate"],
      ["explain", "manipulate"],
      ["manipulate", "apply"],
      ["manipulate", "apply"],
      ["apply", "generalize"],
    ],
  );
  const vistos = new Set(COMP_LEVELS.flatMap((l) => l.evidence));
  assert.deepEqual([...vistos].sort(), [...COMP_EVIDENCE].sort());
});

test("las rondas alcanzan para dar evidencia de cada pregunta del nivel", () => {
  for (const l of COMP_LEVELS) {
    assert.ok(l.rounds >= l.asks.length, `el nivel ${l.n} no llega a preguntar todo`);
    assert.equal(l.rounds % l.asks.length, 0, `el nivel ${l.n} pregunta unas más que otras`);
  }
});

test("los nombres y los numerales aparecen donde el diseño los pide", () => {
  // Los tres primeros se juegan sin leer; las cifras entran en el 4 y las letras
  // en el 6, que es cuando hace falta hablar de la cadena sin evaluarla.
  assert.deepEqual(
    COMP_LEVELS.map((l) => l.numerals),
    [false, false, false, true, true, true, true],
  );
  assert.deepEqual(
    COMP_LEVELS.map((l) => l.named),
    [false, false, false, false, false, true, true],
  );
  assert.deepEqual(
    COMP_LEVELS.map((l) => l.factory),
    [true, true, false, false, false, false, false],
  );
});

test("ninguna cadena pide más ranuras de las que hay montadas", () => {
  for (const l of COMP_LEVELS) {
    assert.ok(l.params.length <= COMP_MACHINE_SLOTS, `el nivel ${l.n} no entra en el caño`);
  }
  for (const p of todas()) {
    assert.ok(p.chain.length <= COMP_MACHINE_SLOTS);
    assert.ok(p.solution.length <= COMP_MACHINE_SLOTS);
    assert.ok(p.tray.length <= COMP_TRAY_SLOTS);
    assert.ok(p.options.length <= COMP_OPTION_SLOTS);
  }
});

test("el nodo se registra con el prerequisito que declara spine.yaml", () => {
  const spec = nodeById(NODE_COMPOSITION);
  assert.ok(spec);
  assert.equal(spec.n, 20);
  assert.deepEqual([...spec.prereqs], ["alg.fn.function_as_machine"]);
  assert.equal(spec.levels.length, 7);
});

test("el nodo se abre recién con la fábrica terminada", () => {
  assert.equal(isNodeOpen(NODE_COMPOSITION, {}), false);
  assert.equal(isNodeOpen(NODE_COMPOSITION, { "alg.fn.function_as_machine": 3 }), false);
  assert.equal(isNodeOpen(NODE_COMPOSITION, { "alg.fn.function_as_machine": 6 }), true);
});

// --- La cadena como cuenta ---------------------------------------------------

test("la cadena se recorre de la boca al pico, que es al revés de como se escribe", () => {
  // `[g, f]` con g la primera del caño se escribe `f(g(x))`: la bola atraviesa g
  // primero aunque f quede escrita más a la izquierda.
  const cadena = [m("m0", "g", "add", 1), m("m1", "f", "mul", 3)];
  const run = compRun(4, cadena);
  assert.equal(run.output, 15);
  assert.deepEqual([...run.stages], [5, 15]);
  assert.equal(compRun(4, compReverse(cadena)).output, 13);
  assert.equal(texto(compNestPieces(cadena, [{ kind: "num", value: 4 }])), "f(g(4))");
  assert.equal(texto(compRingPieces(cadena)), "f∘g");
});

test("componer no conmuta, y eso se decide corriendo las dos cadenas", () => {
  const cadena = [m("m0", "g", "add", 1), m("m1", "f", "mul", 3)];
  assert.ok(compOrderMatters(4, cadena));
  assert.equal(compCommutes(cadena), false);
  // Dos que escalan sí conmutan, y el juego tiene que poder decirlo: si no,
  // enseñaría que el orden nunca da igual, que es falso.
  const dos = [m("m0", "g", "mul", 2), m("m1", "f", "mul", 5)];
  assert.equal(compOrderMatters(7, dos), false);
  assert.ok(compCommutes(dos));
});

test("una cadena existe solo si lo que sale de una entra en la siguiente", () => {
  const rota = [m("m0", "g", "add", 1), m("m1", "f", "div", 4)];
  const run = compRun(5, rota);
  assert.ok(Number.isNaN(run.output));
  assert.equal(run.blockedAt, 1);
  assert.equal(run.block, "not_divisible");
  // Lo que alcanzó a salir de la primera queda registrado: el jugador tiene que
  // poder ver **qué** fue lo que no entró en la boca de la segunda.
  assert.deepEqual([...run.stages], [6]);
  // La misma cadena con otra entrada corre entera: lo que falla es el par
  // entrada y máquina, no la máquina sola.
  assert.equal(compRun(7, rota).output, 2);
  assert.equal(compBlocks(2, m("m1", "f", "sub", 5)), "not_positive");
  assert.equal(compBlocks(2, m("m1", "f", "sub", 1)), null);
});

test("aplicar una máquina es una sola cuenta, y dividir por cero no es ninguna", () => {
  assert.equal(compApply(4, "add", 3), 7);
  assert.equal(compApply(4, "sub", 3), 1);
  assert.equal(compApply(4, "mul", 3), 12);
  assert.equal(compApply(12, "div", 3), 4);
  assert.ok(Number.isNaN(compApply(4, "div", 0)));
});

/**
 * El puente con el nodo 12 y con el 21. El nodo 12 dejó establecido que una
 * cadena se deshace desde el final, y el 21 necesita las dos cosas juntas: la
 * cadena y el orden inverso. Acá se comprueba que las dos maneras de decirlo
 * —`keyUndoOrder` sobre los lazos y `compUndoOrder` sobre las máquinas— son la
 * misma, y que deshacer en ese orden devuelve la bola como estaba.
 */
test("deshacer una cadena invierte el orden, como los cofres del nodo 12", () => {
  const cadena = [m("m0", "g", "add", 4), m("m1", "f", "mul", 3)];
  assert.deepEqual([...compUndoOrder(cadena)], ["m1", "m0"]);
  assert.deepEqual(
    [...compUndoOrder(cadena)],
    [
      ...keyUndoOrder(
        cadena.map((x) => ({ id: x.id, action: { op: "add" as const, value: 1 }, from: 0, to: 1 })),
      ),
    ],
  );
  const inversas: Record<string, CompMachine> = {
    m0: m("u0", "g", "sub", 4),
    m1: m("u1", "f", "div", 3),
  };
  const vuelta = compUndoOrder(cadena).map((id) => inversas[id] as CompMachine);
  assert.equal(compRun(compRun(5, cadena).output, vuelta).output, 5);
});

test("la etiqueta de la cadena se escribe de afuera hacia adentro", () => {
  const tres = [m("m0", "h", "add", 1), m("m1", "g", "mul", 2), m("m2", "f", "sub", 3)];
  assert.equal(texto(compRingPieces(tres)), "f∘g∘h");
  assert.equal(texto(compNestPieces(tres, [{ kind: "sym", name: "x" }])), "f(g(h(x)))");
  assert.equal(texto(compUnequalPieces([tres[0] as CompMachine, tres[2] as CompMachine])), "f∘h≠h∘f");
  assert.equal(texto(compOpPieces(tres[1] as CompMachine)), "×2");
  assert.equal(texto(compEvaluatedPieces(tres, 3, compRun(3, tres).output)), "f(g(h(3)))=5");
  // La escritura con las cuentas a la vista es la que hace falta para decidir si
  // la cadena se puede correr.
  // Cada paso se encierra antes de que llegue el siguiente: la escritura tiene
  // que decir el mismo árbol que el caño y no depender de la precedencia.
  assert.equal(texto(compChainPieces(tres, [{ kind: "num", value: 3 }])), "((3+1)×2)−3");
});

// --- El generador ------------------------------------------------------------

test("la misma semilla da la misma ronda", () => {
  for (const l of COMP_LEVELS) {
    for (let r = 0; r < l.rounds; r++) {
      assert.deepEqual(generateComposition(l, 909, r), generateComposition(l, 909, r));
    }
  }
});

test("cada nivel alterna sus preguntas en vez de sortearlas", () => {
  for (const l of COMP_LEVELS) {
    const vistas = new Set<CompAsk>();
    for (let r = 0; r < l.rounds; r++) vistas.add(generateComposition(l, 55, r).ask);
    assert.deepEqual([...vistas].sort(), [...l.asks].sort(), `el nivel ${l.n} se saltea preguntas`);
  }
});

test("ninguna ronda deja la cadena pedida sin poder correrse", () => {
  for (const p of todas()) {
    if (p.ask === "reject") continue;
    const run = compRun(p.input, p.solution);
    assert.equal(run.block, null, `${p.ask} entregó una cadena trabada`);
    assert.ok(Number.isInteger(run.output) && run.output > 0, `${p.ask} sacó ${run.output}`);
    assert.ok(run.output <= COMP_MAX_VALUE, `${p.ask} sacó un número que no se lee de un vistazo`);
    assert.equal(run.output, p.target, `${p.ask} pide una salida que su cadena no produce`);
  }
});

test("las rondas de elegir traen una sola respuesta correcta y ninguna repetida", () => {
  for (const p of todas()) {
    if (p.options.length === 0) continue;
    assert.equal(p.options.filter((o) => o.correct).length, 1, `${p.ask} sin respuesta única`);
    const claves = p.options.map((o) => (o.chain.length > 0 ? texto(o.pieces) : String(o.value)));
    assert.equal(new Set(claves).size, claves.length, `${p.ask} repite una ficha`);
  }
});

test("el orden importa en todas las rondas que lo ponen en juego", () => {
  for (const p of todas()) {
    if (p.ask !== "watch" && p.ask !== "swap" && p.ask !== "which" && p.ask !== "nest") continue;
    assert.notEqual(p.target, p.otherOutput, `${p.ask} muestra dos órdenes que dan lo mismo`);
    assert.ok(compOrderMatters(p.input, p.solution));
  }
});

test("las rondas de ordenar arrancan en un orden que no da la salida pedida", () => {
  for (const p of [...conPregunta("order"), ...conPregunta("chain3")]) {
    assert.notEqual(compRun(p.input, p.chain).output, p.target, "ya estaba resuelta");
    assert.equal(p.chain.length, p.solution.length);
    assert.deepEqual(
      [...p.chain].map((x) => x.id).sort(),
      [...p.solution].map((x) => x.id).sort(),
      "el orden inicial no lleva las mismas máquinas",
    );
  }
});

test("enganchar el tubo trae cuatro fichas y solo una pareja llega a la salida", () => {
  for (const p of conPregunta("connect")) {
    assert.equal(p.tray.length, COMP_TRAY_SLOTS);
    for (const s of p.solution) assert.ok(p.tray.some((x) => x.id === s.id), "falta una de las dos");
    let parejas = 0;
    for (const a of p.tray) {
      for (const b of p.tray) {
        if (a.id === b.id) continue;
        if (compRun(p.input, [a, b]).output === p.target) parejas++;
      }
    }
    // Sumar y restar conmutan, así que la pareja buena cuenta por sus dos
    // órdenes y por ninguno más: el nivel se gana eligiendo, no probando.
    assert.equal(parejas, 2, "hay otra pareja que también llega");
  }
});

test("el tren de engranajes multiplica las razones, y el señuelo las suma", () => {
  for (const p of conPregunta("predict")) {
    const razones = p.solution.map((x) => x.value);
    assert.ok(p.solution.every((x) => x.op === "mul"), "el tren tiene una rueda que no escala");
    assert.equal(p.target, razones.reduce((a, b) => a * b, p.input));
    const sumada = p.options.find((o) => o.lure === "ratios_added");
    if (sumada) assert.equal(sumada.value, p.input * razones.reduce((a, b) => a + b, 0));
  }
});

test("la ronda de descartar trae exactamente una cadena que no se puede correr", () => {
  for (const p of conPregunta("reject")) {
    assert.ok(p.options.length >= 3);
    const trabadas = p.options.filter((o) => compRun(p.input, o.chain).block !== null);
    assert.equal(trabadas.length, 1, "hay dos cadenas imposibles o ninguna");
    assert.equal(trabadas[0]?.correct, true, "la correcta no es la que se traba");
    assert.notEqual(p.blocked, null);
  }
});

test("la ronda de conmutar mezcla pares que sí y pares que no", () => {
  const rondas = conPregunta("commutes");
  const si = rondas.filter((p) => p.commutes);
  const no = rondas.filter((p) => !p.commutes);
  assert.ok(si.length > 0, "nunca aparece un par que conmuta");
  assert.ok(no.length > 0, "nunca aparece un par que no conmuta");
  for (const p of rondas) {
    assert.equal(p.commutes, compCommutes(p.solution));
    assert.equal(p.commutes, p.target === p.otherOutput);
    assert.deepEqual([...p.other], [...compReverse(p.chain)]);
  }
});

/**
 * El nombre viaja con la máquina y no con su lugar. Por eso una cadena dada
 * vuelta tiene la `g` en el pico: es lo que hace que `f∘g` y `g∘f` sean dos
 * etiquetas distintas y no la misma leída dos veces.
 */
test("cada máquina lleva su letra puesta, y no la pierde al cambiar de lugar", () => {
  const letras = new Set(["f", "g", "h"]);
  for (const p of todas()) {
    const cadena = p.solution.length > 0 ? p.solution : p.chain;
    if (cadena.length === 0) continue;
    for (const x of cadena) assert.ok(letras.has(x.name), `letra rara: ${x.name}`);
    assert.equal(new Set(cadena.map((x) => x.name)).size, cadena.length, "dos máquinas con la misma letra");
    assert.equal(new Set(cadena.map((x) => x.id)).size, cadena.length, "dos máquinas con el mismo id");
    if (p.other.length > 0) {
      assert.deepEqual(
        [...p.other].map((x) => x.name).sort(),
        [...p.chain].map((x) => x.name).sort(),
        "el otro carril renombró las cajas",
      );
      assert.notDeepEqual(
        [...p.other].map((x) => x.name),
        [...p.chain].map((x) => x.name),
        "los dos carriles están en el mismo orden",
      );
    }
  }
});

// --- El error del catálogo ---------------------------------------------------

test("el único error que se anota es el que el catálogo apunta a este nodo", () => {
  assert.equal(COMP_MISCONCEPTION, "chain_rule_missing_inner");
  assert.equal(compMisconceptionFor("only_outer"), COMP_MISCONCEPTION);
  for (const lure of ["only_inner", "same_either_way", "wrong_order", "ratios_added"] as const) {
    assert.equal(compMisconceptionFor(lure), undefined, `${lure} no está en el catálogo de este nodo`);
  }
  assert.equal(compMisconceptionFor(undefined), undefined);
});

test("el señuelo que clasifica es aplicar solo la máquina de afuera", () => {
  for (const p of todas()) {
    const señuelo = p.options.find((o) => o.lure === "only_outer");
    if (!señuelo || p.solution.length < 2) continue;
    const soloAfuera = compRun(p.input, p.solution.slice(1)).output;
    const soloAfueraDelOtro = compRun(p.input, compReverse(p.solution).slice(1)).output;
    assert.ok(
      señuelo.value === soloAfuera || señuelo.value === soloAfueraDelOtro,
      `${p.ask}: el señuelo no es la máquina de afuera sola`,
    );
  }
});
