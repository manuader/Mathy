import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculatorOps,
  calculatorTiers,
  cheatsheetEntries,
  cheatsheetTopics,
  contentScope,
  findOp,
  inverseOf,
  isEntryUnlocked,
  isOpUnlocked,
  opsOfTier,
  searchEntries,
  topicTree,
  unlockedEntries,
} from "../src/index.ts";

const ALL = new Set(contentScope.nodes);
const NADA: ReadonlySet<string> = new Set<string>();

const KINDS = ["formula", "rule", "definition", "theorem", "strategy", "example"];
const LITERACY = ["none", "icons", "short_text", "full_text"];

test("el alcance es alg.eq.one_step y sus prerequisitos", () => {
  assert.deepEqual(contentScope.roots, ["alg.eq.one_step"]);
  assert.ok(ALL.has("alg.eq.one_step"));
  assert.ok(ALL.has("prealg.eq.balance"), "falta un prerequisito directo");
  assert.ok(ALL.has("found.count.cardinality"), "falta la raíz de la clausura");
  assert.ok(!ALL.has("alg.eq.multi_step"), "el alcance se pasó de largo");
});

test("toda entrada nace de un nodo del alcance", () => {
  assert.ok(cheatsheetEntries.length > 0);
  for (const entry of cheatsheetEntries) {
    assert.ok(
      entry.addedBy.some((node) => ALL.has(node)),
      `${entry.id} no lo agrega ningún nodo compilado`,
    );
  }
});

test("toda entrada trae título y cuerpo en es", () => {
  for (const entry of cheatsheetEntries) {
    assert.ok(entry.title.length > 0, `${entry.id} sin título`);
    assert.ok(entry.body.length > 0, `${entry.id} sin cuerpo`);
    assert.ok(entry.title.split(/\s+/).length <= 8, `${entry.id} tiene el título largo`);
  }
});

test("los enums de las entradas son los de R0", () => {
  for (const entry of cheatsheetEntries) {
    assert.ok(KINDS.includes(entry.kind), `${entry.id}: kind ${entry.kind}`);
    assert.ok(LITERACY.includes(entry.literacyMin), `${entry.id}: literacy ${entry.literacyMin}`);
    assert.ok(["symbolic", "formal"].includes(entry.addedAtLayer), `${entry.id}: capa mala`);
  }
});

test("el display trae exactamente lo que su forma promete", () => {
  for (const entry of cheatsheetEntries) {
    if (entry.displayForm === "image") {
      assert.ok(entry.asset.length > 0, `${entry.id} dice imagen y no trae asset`);
      assert.equal(entry.latex, "");
    } else if (entry.displayForm === "formula") {
      assert.ok(entry.latex.length > 0, `${entry.id} dice fórmula y no trae fórmula`);
      assert.equal(entry.asset, "");
    } else {
      assert.equal(entry.displayForm, "text");
      assert.equal(entry.asset, "");
      assert.equal(entry.latex, "");
    }
  }
});

test("los temas y las relacionadas apuntan a algo compilado", () => {
  const topics = new Set(cheatsheetTopics.map((t) => t.id));
  const entries = new Set(cheatsheetEntries.map((e) => e.id));
  for (const entry of cheatsheetEntries) {
    assert.ok(topics.has(entry.topic), `${entry.id}: tema ${entry.topic} ausente`);
    for (const related of entry.related) {
      assert.ok(entries.has(related), `${entry.id}: relacionada ${related} ausente`);
    }
  }
  for (const topic of cheatsheetTopics) {
    if (topic.parent !== null) {
      assert.ok(topics.has(topic.parent), `${topic.id}: padre ${topic.parent} ausente`);
    }
  }
});

test("la cheatsheet empieza vacía y crece hasta tenerlo todo", () => {
  assert.equal(unlockedEntries(NADA).length, 0);
  assert.equal(unlockedEntries(ALL).length, cheatsheetEntries.length);
  const balanza = new Set(["prealg.eq.balance"]);
  const abiertas = unlockedEntries(balanza);
  assert.ok(abiertas.length > 0 && abiertas.length < cheatsheetEntries.length);
  for (const entry of abiertas) assert.ok(isEntryUnlocked(entry, balanza));
});

test("el árbol de temas se poda: sin entradas no hay rama", () => {
  assert.deepEqual(topicTree([]), []);
  const arbol = topicTree(cheatsheetEntries);
  assert.ok(arbol.length > 0);
  const contar = (nodes: ReturnType<typeof topicTree>): number =>
    nodes.reduce((n, node) => n + node.entries.length + contar(node.children), 0);
  assert.equal(contar(arbol), cheatsheetEntries.length);
  for (const raiz of arbol) assert.equal(raiz.topic.parent, null);
});

test("la búsqueda filtra por título y no le importan los acentos", () => {
  assert.equal(searchEntries(cheatsheetEntries, "").length, cheatsheetEntries.length);
  assert.equal(searchEntries(cheatsheetEntries, "zzzz").length, 0);
  const conTilde = cheatsheetEntries.filter((e) => /[áéíóúÁÉÍÓÚ]/.test(e.title));
  assert.ok(conTilde.length > 0, "el corpus no tiene títulos con tilde para probar");
  const primera = conTilde[0]!;
  const sinTilde = primera.title.normalize("NFD").replace(/[̀-ͯ]/g, "");
  assert.ok(searchEntries(cheatsheetEntries, sinTilde).includes(primera));
  // El cuerpo no entra en la búsqueda, a propósito.
  const larga = cheatsheetEntries.find((e) => e.body.length > 40)!;
  const frase = larga.body.slice(10, 30);
  for (const hit of searchEntries(cheatsheetEntries, frase)) {
    assert.ok(hit.title.toLowerCase().includes(frase.toLowerCase()));
  }
});

test("toda operación trae etiqueta corta y pista narrable", () => {
  assert.ok(calculatorOps.length > 0);
  for (const op of calculatorOps) {
    assert.ok(op.label.length > 0 && op.label.length <= 12, `${op.id}: etiqueta ${op.label}`);
    assert.ok(op.hint.length > 0, `${op.id} sin pista`);
    assert.ok(!op.hint.toLowerCase().includes("incorrecto"), `${op.id}: la pista reta`);
    assert.ok(op.unlockedBy.length > 0);
  }
});

test("cada operación vive en un tier compilado", () => {
  const tiers = new Set(calculatorTiers.map((t) => t.id));
  for (const op of calculatorOps) assert.ok(tiers.has(op.tier), `${op.id}: tier ${op.tier}`);
  const ids = new Set(calculatorOps.map((o) => o.id));
  for (const tier of calculatorTiers) {
    for (const { lock, key } of tier.pairs) {
      assert.ok(ids.has(lock), `${tier.id}: ${lock} no está compilado`);
      assert.ok(ids.has(key), `${tier.id}: ${key} no está compilado`);
    }
  }
});

test("cada candado tiene su llave y la llave a su candado", () => {
  assert.equal(inverseOf("op_add"), "op_sub");
  assert.equal(inverseOf("op_sub"), "op_add");
  assert.equal(inverseOf("op_mul"), "op_div");
  assert.equal(inverseOf("op_div"), "op_mul");
  assert.equal(inverseOf("op_count"), undefined);
  for (const tier of calculatorTiers) {
    for (const { lock, key } of tier.pairs) {
      assert.equal(inverseOf(lock), key);
      assert.equal(inverseOf(key), lock);
    }
  }
});

test("el orden de un tier pone los pares juntos y no repite ni pierde nada", () => {
  for (const tier of calculatorTiers) {
    const ops = opsOfTier(tier);
    const ids = ops.map((o) => o.id);
    assert.equal(new Set(ids).size, ids.length, `${tier.id} repite una tecla`);
    const esperadas = calculatorOps.filter((o) => o.tier === tier.id).map((o) => o.id);
    assert.deepEqual([...ids].sort(), [...esperadas].sort());
    for (const { lock, key } of tier.pairs) {
      assert.equal(ids.indexOf(key), ids.indexOf(lock) + 1, `${lock} y ${key} quedaron separados`);
    }
  }
});

test("la calculadora empieza en siluetas y ninguna tecla se revoca", () => {
  for (const op of calculatorOps) assert.equal(isOpUnlocked(op, NADA), false);
  for (const op of calculatorOps) assert.equal(isOpUnlocked(op, ALL), true);
  // any_ready: alcanza con uno de los nodos, aunque los otros no existan.
  const suma = findOp("op_add")!;
  assert.ok(suma.unlockedBy.length > 1);
  assert.ok(isOpUnlocked(suma, new Set([suma.unlockedBy[0]!])));
});

test("resolver ecuaciones nace del nodo del minijuego", () => {
  const resolver = findOp("op_solve_linear");
  assert.ok(resolver, "falta la tecla que el minijuego desbloquea");
  assert.ok(resolver.unlockedBy.includes("alg.eq.one_step"));
});
