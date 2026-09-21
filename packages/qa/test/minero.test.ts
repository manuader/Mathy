import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Event } from "@mathy/progress";
import { REPO } from "../src/corpus.ts";
import {
  CATEGORIAS,
  NINGUNA,
  agrupar,
  cargarCatalogo,
  delNodo,
  firmaDe,
  informe,
  leerEventos,
  minar,
  preguntasDe,
  sueltos,
} from "../src/minero.ts";
import type { Answers, Decider, QuestionSet } from "../src/types.ts";

const NODE = "alg.eq.one_step";

const falla = (snapshot: string, extra: Partial<Extract<Event, { kind: "attempt" }>> = {}): Event => ({
  kind: "attempt",
  at: 1,
  node: NODE,
  level: 4,
  evidence: "apply",
  correct: false,
  latency: 3000,
  snapshot,
  ...extra,
});

/** Un decisor de mentira: contesta siempre lo mismo y cuenta cuántas veces lo preguntaron. */
function fingido(respuesta: Answers): Decider & { vistos: { state: unknown; questions: QuestionSet }[] } {
  const vistos: { state: unknown; questions: QuestionSet }[] = [];
  return {
    name: "rules",
    vistos,
    async ask(state, questions) {
      vistos.push({ state, questions });
      return respuesta;
    },
  };
}

const SIEMPRE: Answers = {
  misconception_mas_parecida: { value: NINGUNA, p: 0.81 },
  categoria: { value: "conceptual", p: 0.62 },
  parece_error_sistematico_y_no_dedazo: { value: true, p: 0.77 },
};

// --- El filtro -------------------------------------------------------------

test("sólo se mina el error que ninguna regla reconoció", () => {
  const eventos: Event[] = [
    falla("x + 5 = 12 · cerradura +5 · llave −4"),
    falla("x + 5 = 12 · cerradura +5 · llave +5", { misconception: "wrong_inverse_choice" }),
    { kind: "attempt", at: 2, node: NODE, level: 4, evidence: "apply", correct: true, latency: 900 },
    { kind: "levelDone", at: 3, node: NODE, level: 4 },
    { kind: "sawLayer", at: 4, node: NODE, layer: "symbolic" },
  ];
  const s = sueltos(eventos);
  assert.equal(s.length, 1, "el clasificado ya tiene entrada; el acierto no es evidencia de error");
  assert.equal(s[0]!.snapshot, "x + 5 = 12 · cerradura +5 · llave −4");
});

test("un intento fallido sin snapshot no se puede minar, y no rompe nada", () => {
  const viejo = JSON.parse(
    `{"kind":"attempt","at":1,"node":"${NODE}","level":4,"evidence":"apply","correct":false,"latency":3000}`,
  ) as Event;
  assert.deepEqual(sueltos([viejo]), []);
});

// --- La firma y los grupos -------------------------------------------------

test("dos rondas del mismo error son el mismo grupo: lo que cambia es el número", () => {
  assert.equal(
    firmaDe("x + 7 = 15 · cerradura +7 · llave −6"),
    firmaDe("x + 2 = 9 · cerradura +2 · llave −1"),
  );
});

test("un operador distinto es otro error, y no se mezcla", () => {
  assert.notEqual(
    firmaDe("x + 5 = 12 · cerradura +5 · llave −4"),
    firmaDe("x * 5 = 20 · cerradura ×5 · llave ÷6"),
  );
});

test("los grupos se ordenan por cuántas veces se vio cada uno", () => {
  const g = agrupar([
    falla("x + 5 = 12 · cerradura +5 · llave −4"),
    falla("x + 7 = 15 · cerradura +7 · llave −6"),
    falla("x + 2 = 9 · cerradura +2 · llave −1"),
    falla("x * 3 = 12 · cerradura ×3 · llave ÷4"),
  ]);
  assert.equal(g.length, 2);
  assert.equal(g[0]!.veces, 3);
  assert.equal(g[1]!.veces, 1);
  assert.equal(g[0]!.ejemplos.length, 3, "los ejemplos distintos se conservan para poder leerlos");
});

test("el mismo error en dos nodos son dos grupos: el vecindario decide qué es plausible", () => {
  const g = agrupar([
    falla("libro · fila de cajón marca 0 · soltó manzana suelta"),
    falla("libro · fila de cajón marca 1 · soltó manzana suelta", { node: "prealg.var.unknown_as_box" }),
  ]);
  assert.equal(g.length, 2);
});

test("agrupar es determinista: dos corridas dan el mismo informe", () => {
  const eventos = [
    falla("x + 5 = 12 · cerradura +5 · llave −4"),
    falla("x * 3 = 12 · cerradura ×3 · llave ÷4"),
    falla("x / 2 = 6 · cerradura ÷2 · llave ×3"),
  ];
  assert.deepEqual(agrupar(eventos), agrupar([...eventos]));
});

// --- Las preguntas ---------------------------------------------------------

test("las opciones son el catálogo del nodo, más `ninguna`", () => {
  const catalogo = cargarCatalogo();
  const vecindario = delNodo(catalogo, NODE);
  assert.ok(vecindario.length > 0, "el nodo tiene entradas en L");
  const q = preguntasDe(vecindario);
  const parecida = q["misconception_mas_parecida"]!;
  assert.equal(parecida.kind, "choice");
  const opciones = parecida.kind === "choice" ? parecida.options : {};
  assert.ok(NINGUNA in opciones, "sin `ninguna` no habría candidata posible");
  assert.ok("wrong_inverse_choice" in opciones);
  assert.ok(!("log_of_sum" in opciones), "una regla de otra área no es plausible acá");
});

test("la categoría se pregunta con las siete de L0", () => {
  assert.deepEqual(Object.keys(CATEGORIAS).sort(), [
    "conceptual",
    "invalid_property",
    "notation",
    "precedence",
    "procedural",
    "sign",
    "wrong_inverse",
  ]);
  const q = preguntasDe([])["categoria"]!;
  assert.equal(q.kind === "choice" ? Object.keys(q.options).length : 0, 7);
});

test("el noul viene con los dos lados explicados: sin eso contesta con la definición que se imagine", () => {
  const q = preguntasDe([])["parece_error_sistematico_y_no_dedazo"]!;
  assert.equal(q.kind, "noul");
  assert.ok(q.kind === "noul" && q.criteria?.true && q.criteria.false);
});

test("el catálogo trae el nombre del locale y la regla abreviada", () => {
  const m = cargarCatalogo().find((x) => x.id === "sign_flip_on_move");
  assert.ok(m);
  assert.equal(m.category, "sign");
  assert.notEqual(m.nombre, m.id, "el nombre sale del locale es, no del id");
  assert.match(m.regla, /→/);
});

// --- La corrida ------------------------------------------------------------

test("sin modelo agrupa igual y lo dice, en vez de no servir para nada", async () => {
  const propuestas = await minar([falla("x + 5 = 12 · cerradura +5 · llave −4")], cargarCatalogo(), null);
  assert.equal(propuestas.length, 1);
  assert.equal(propuestas[0]!.juicio, null);
  assert.match(informe(propuestas, 1), /sin modelo/);
});

test("se le pregunta una vez por grupo, no una vez por error", async () => {
  const d = fingido(SIEMPRE);
  await minar(
    [
      falla("x + 5 = 12 · cerradura +5 · llave −4"),
      falla("x + 7 = 15 · cerradura +7 · llave −6"),
      falla("x * 3 = 12 · cerradura ×3 · llave ÷4"),
    ],
    cargarCatalogo(),
    d,
  );
  assert.equal(d.vistos.length, 2);
  const estado = d.vistos[0]!.state as Record<string, unknown>;
  assert.equal(estado["veces_que_se_repitio"], 2);
  assert.equal(estado["nodo"], NODE);
});

test("el informe ordena por frecuencia y separa lo que no se parece a nada", async () => {
  const propuestas = await minar(
    [
      falla("x + 5 = 12 · cerradura +5 · llave −4"),
      falla("x + 7 = 15 · cerradura +7 · llave −6"),
      falla("x * 3 = 12 · cerradura ×3 · llave ÷4"),
    ],
    cargarCatalogo(),
    fingido(SIEMPRE),
  );
  const texto = informe(propuestas, 3);
  assert.match(texto, /3 errores que ninguna regla reconoció/);
  assert.match(texto, /candidata a entrada nueva/);
  assert.match(texto, /Para mirar primero/);
  assert.ok(texto.indexOf("llave −") < texto.indexOf("llave ÷"), "el grupo de 2 va antes que el de 1");
});

test("el minero no escribe reglas: propone y deja la decisión en una persona", async () => {
  const propuestas = await minar(
    [falla("x + 5 = 12 · cerradura +5 · llave −4"), falla("x + 7 = 15 · cerradura +7 · llave −6")],
    cargarCatalogo(),
    fingido(SIEMPRE),
  );
  const texto = informe(propuestas, 2);
  assert.match(texto, /trabajo de una persona/);
  assert.doesNotMatch(texto, /^\s*detect:/m, "un informe que trae una regla lista invita a pegarla sin pensarla");
});

// --- El fixture ------------------------------------------------------------

const RUTA = join(REPO, "packages/qa/test/fixtures/eventos-ejemplo.json");

test("el fixture se lee como la lista de eventos que exporta el juego", () => {
  const eventos = leerEventos(readFileSync(RUTA, "utf8"));
  assert.ok(eventos.length >= 40, `son ${eventos.length} eventos`);
  assert.ok(eventos.some((e) => e.kind === "attempt" && e.correct), "hay aciertos");
  assert.ok(
    eventos.some((e) => e.kind === "attempt" && e.misconception !== undefined),
    "hay errores que el clasificador sí reconoció",
  );
  assert.ok(eventos.some((e) => e.kind === "levelDone"));
});

test("la lista envuelta en { events: [...] } también se lee", () => {
  const pelada = leerEventos(readFileSync(RUTA, "utf8"));
  const envuelta = leerEventos(JSON.stringify({ events: pelada }));
  assert.equal(envuelta.length, pelada.length);
});

test("sobre el fixture, el grupo más grande es el de la llave con el número corrido", () => {
  const eventos = leerEventos(readFileSync(RUTA, "utf8"));
  const g = agrupar(eventos);
  assert.equal(g[0]!.node, NODE);
  assert.equal(g[0]!.veces, 6);
  assert.match(g[0]!.firma, /cerradura \+# · llave −#/);
  // Los tres nodos del fixture aparecen, y ninguno de los clasificados se coló.
  assert.deepEqual(
    [...new Set(g.map((x) => x.node))].sort(),
    ["alg.eq.one_step", "arith.frac.parts_and_ratio", "prealg.var.unknown_as_box"],
  );
});

test("el grupo de fracciones existe, que es el que esconde una misconception del catálogo", () => {
  const eventos = leerEventos(readFileSync(RUTA, "utf8"));
  const g = agrupar(eventos).find((x) => x.node === "arith.frac.parts_and_ratio");
  assert.ok(g);
  assert.equal(g.veces, 5);
  // `fraction_add_across` está en el catálogo de ese nodo: si el modelo mira
  // esas líneas y contesta otra cosa, la pregunta está mal armada.
  assert.ok(delNodo(cargarCatalogo(), g.node).some((m) => m.id === "fraction_add_across"));
});
