import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BOX_EVIDENCE,
  BOX_LETTERS,
  BOX_LEVELS,
  BOX_MISCONCEPTION,
  BOX_ROW_SLOTS,
  BOX_TOKEN_SLOTS,
  BOX_TREE_SLOTS,
  NODE_UNKNOWN_BOX,
  TOTAL_BOX_LEVELS,
  boxLevelByNumber,
  boxMisconceptionFor,
  boxRowAccepts,
  boxTotal,
  boxUnknowns,
  generateUnknownBox,
  isNodeOpen,
  nodeById,
  type BoxKind,
  type BoxLevel,
  type BoxProblem,
  type BoxTreeNode,
} from "../src/index.ts";

const seeds = (n: number): number[] => Array.from({ length: n }, (_, i) => i * 41 + 3);

/** Todas las rondas de un nivel, para todas las semillas de la muestra. */
function rondas(level: BoxLevel, n = 16): BoxProblem[] {
  const out: BoxProblem[] = [];
  for (const seed of seeds(n)) {
    for (let r = 0; r < level.rounds; r++) out.push(generateUnknownBox(level, seed + r, r));
  }
  return out;
}

const todas = (): BoxProblem[] => BOX_LEVELS.flatMap((l) => rondas(l, 10));

// --- Los niveles como datos --------------------------------------------------

test("los siete niveles del diseño están, en orden y sin repetir", () => {
  assert.equal(BOX_LEVELS.length, 7);
  assert.equal(TOTAL_BOX_LEVELS, 7);
  assert.deepEqual(
    BOX_LEVELS.map((l) => l.n),
    [1, 2, 3, 4, 5, 6, 7],
  );
});

test("cada nivel cambia la capa o endurece parámetros, nunca las dos cosas", () => {
  for (let i = 1; i < BOX_LEVELS.length; i++) {
    const prev = BOX_LEVELS[i - 1] as BoxLevel;
    const cur = BOX_LEVELS[i] as BoxLevel;
    const cambioCapa = prev.layer !== cur.layer;
    const cambioParams = JSON.stringify(prev.params) !== JSON.stringify(cur.params);
    assert.ok(
      !(cambioCapa && cambioParams),
      `el nivel ${cur.n} cambia la capa y los parámetros a la vez`,
    );
  }
});

test("los parámetros nunca se ablandan al avanzar de nivel", () => {
  for (let i = 1; i < BOX_LEVELS.length; i++) {
    const prev = (BOX_LEVELS[i - 1] as BoxLevel).params;
    const cur = (BOX_LEVELS[i] as BoxLevel).params;
    assert.ok(cur.kinds >= prev.kinds, `el nivel ${i + 1} saca clases del mostrador`);
    assert.ok(cur.marks >= prev.marks, `el nivel ${i + 1} saca marcas del mostrador`);
    assert.ok(cur.counts[1] >= prev.counts[1], `el nivel ${i + 1} achica los conteos`);
  }
});

test("el nodo recorre las cuatro capas del diseño y termina en la definición", () => {
  assert.deepEqual(
    [...new Set(BOX_LEVELS.map((l) => l.layer))],
    ["concrete", "visual", "symbolic", "formal"],
  );
  assert.equal((BOX_LEVELS.at(-1) as BoxLevel).layer, "formal");
  assert.deepEqual(
    BOX_LEVELS.filter((l) => l.definition).map((l) => l.n),
    [7],
  );
});

test("los cinco verbos que el nodo puede evidenciar aparecen en algún nivel", () => {
  const vistos = new Set(BOX_LEVELS.flatMap((l) => l.evidence));
  for (const verbo of BOX_EVIDENCE) {
    assert.ok(vistos.has(verbo), `ningún nivel da evidencia de ${verbo}`);
  }
  // `transfer` se mide en otro nodo, así que nunca puede salir de este.
  assert.ok(!vistos.has("transfer"));
});

test("la caja cerrada no está en el primer nivel y no se va nunca más", () => {
  assert.equal((boxLevelByNumber(1) as BoxLevel).params.marks, 0);
  for (const l of BOX_LEVELS) {
    if (l.n > 1) assert.ok(l.params.marks >= 1, `el nivel ${l.n} se quedó sin incógnita`);
  }
});

test("la piel del libro sigue a la capa: objetos, barras y fichas en ese orden", () => {
  for (const l of BOX_LEVELS) {
    const esperada =
      l.layer === "concrete" ? "objects" : l.layer === "visual" ? "bars" : "chips";
    assert.equal(l.skin, esperada, `el nivel ${l.n} dibuja fuera de tiempo`);
  }
});

test("la balanza mide en un solo nivel y es el único donde el cajón se abre", () => {
  const conBalanza = BOX_LEVELS.filter((l) => l.asks.includes("weigh")).map((l) => l.n);
  assert.deepEqual(conBalanza, [3]);
  assert.deepEqual(
    BOX_LEVELS.filter((l) => l.openCrate).map((l) => l.n),
    conBalanza,
  );
});

test("el árbol del nodo 9 aparece con la capa visual y no antes", () => {
  const conArbol = BOX_LEVELS.filter((l) => l.asks.includes("leaf"));
  assert.deepEqual(
    conArbol.map((l) => l.n),
    [5],
  );
  for (const l of conArbol) assert.notEqual(l.layer, "concrete");
});

// --- El generador ------------------------------------------------------------

test("la misma semilla y la misma ronda dan el mismo problema", () => {
  for (const level of BOX_LEVELS) {
    for (let r = 0; r < level.rounds; r++) {
      const a = generateUnknownBox(level, 8080 + r, r);
      const b = generateUnknownBox(level, 8080 + r, r);
      assert.deepEqual(a, b);
    }
  }
});

test("un nivel con dos preguntas las alterna en vez de sortearlas", () => {
  for (const level of BOX_LEVELS) {
    if (level.asks.length < 2) continue;
    const vistas = new Set<string>();
    for (let r = 0; r < level.rounds; r++) vistas.add(generateUnknownBox(level, 11, r).ask);
    assert.equal(vistas.size, level.asks.length, `el nivel ${level.n} no llega a preguntar todo`);
  }
});

test("cada ronda pregunta algo que su nivel declara", () => {
  for (const level of BOX_LEVELS) {
    for (const p of rondas(level, 6)) {
      assert.ok(level.asks.includes(p.ask), `el nivel ${level.n} preguntó ${p.ask}`);
    }
  }
});

test("nada de lo que el mostrador pone pasa las ranuras montadas", () => {
  for (const p of todas()) {
    assert.ok(p.tokens.length <= BOX_TOKEN_SLOTS, "más objetos que ranuras");
    assert.ok(p.rows <= BOX_ROW_SLOTS, "más filas que ranuras");
    assert.ok(p.tree.length <= BOX_TREE_SLOTS, "el árbol no entra");
  }
});

test("el libro se puede terminar: hay una fila por clase y ninguna sobra", () => {
  for (const p of todas()) {
    if (p.ask !== "sort") continue;
    assert.equal(p.rows, p.kinds.length);
    for (let k = 0; k < p.kinds.length; k++) {
      const llegaron = p.tokens.filter((t) => t.kind === k).length;
      assert.equal(llegaron, (p.kinds[k] as BoxKind).count, "el conteo de la fila no cierra");
    }
  }
});

test("reagrupar no cambia cuántos hay: los conteos suman los objetos que llegaron", () => {
  for (const p of todas()) {
    if (p.ask !== "sort") continue;
    assert.equal(
      boxTotal(p.kinds.map((k) => k.count)),
      p.tokens.length,
      "el invariante del libro se rompió en el dato",
    );
  }
});

test("cada objeto del mostrador es de una clase que existe", () => {
  for (const p of todas()) {
    for (const t of p.tokens) {
      assert.ok(t.kind >= 0 && t.kind < p.kinds.length, `objeto de la clase ${t.kind}`);
    }
    const ids = new Set(p.tokens.map((t) => t.id));
    assert.equal(ids.size, p.tokens.length, "dos objetos con el mismo id");
  }
});

test("las clases cerradas son las que el nivel declara, y traen letra y marca", () => {
  for (const level of BOX_LEVELS) {
    for (const p of rondas(level, 8)) {
      // La hoja del árbol juega con un mostrador chico: lo que importa ahí es
      // el lugar de la incógnita y no cuántas clases hay.
      const esperadas = level.arbitrary
        ? p.kinds.length
        : Math.min(level.params.marks, p.kinds.length);
      assert.equal(boxUnknowns(p.kinds), esperadas, `el nivel ${level.n} contó mal las marcas`);
      for (const k of p.kinds) {
        if (!k.closed) {
          assert.equal(k.mark, -1);
          assert.equal(k.letter, "");
          continue;
        }
        assert.ok(k.mark >= 0, "un cajón sin marca no se distingue de otro");
        assert.ok(BOX_LETTERS.includes(k.letter), `la letra ${k.letter} no está en el atlas`);
        assert.ok(k.hidden >= 2, "una caja que la balanza no puede medir");
      }
      // Dos marcas distintas son dos letras distintas. Que puedan valer lo
      // mismo es otra cosa, y no se decide acá.
      const letras = p.kinds.filter((k) => k.closed).map((k) => k.letter);
      assert.equal(new Set(letras).size, letras.length, "dos marcas con el mismo nombre");
    }
  }
});

test("el último nivel deja el mostrador sin fruta y con tres nombres", () => {
  const nivel = boxLevelByNumber(7) as BoxLevel;
  for (const p of rondas(nivel, 8)) {
    assert.ok(
      p.kinds.every((k) => k.closed),
      "quedó algo abierto en el nivel de las figuras inventadas",
    );
    assert.ok(
      p.kinds.every((k) => k.shape !== "crate" && k.shape !== "apple"),
      "las figuras inventadas no pueden ser cajones ni fruta",
    );
    assert.ok(boxUnknowns(p.kinds) >= 3, "el diseño pide tres o más letras acá");
  }
});

test("la balanza pide tantas manzanas como pesan los cajones, y sobran dos", () => {
  const nivel = boxLevelByNumber(3) as BoxLevel;
  for (const p of rondas(nivel, 16)) {
    const w = p.weigh;
    assert.ok(w, "el nivel de la balanza no trajo medición");
    const cajon = p.kinds[w.kind] as BoxKind;
    assert.ok(cajon.closed, "se está pesando algo que no es un cajón");
    // Dos cajones de la misma marca pesan lo mismo: el objetivo es el producto
    // y nunca una suma de contenidos distintos.
    assert.equal(w.target, w.crates * cajon.hidden);
    assert.ok(w.crates >= 1);
    assert.equal(p.tokens.length, Math.min(w.target + 2, BOX_TOKEN_SLOTS));
    // Lo que va al otro plato no es un cajón: medir con incógnitas no mide.
    for (const t of p.tokens) assert.ok(!(p.kinds[t.kind] as BoxKind).closed);
  }
});

test("el árbol tiene una sola hoja vacía y todas las ramas llevan operador", () => {
  const nivel = boxLevelByNumber(5) as BoxLevel;
  const posiciones = new Set<number>();
  for (const p of rondas(nivel, 16)) {
    if (p.ask !== "leaf") continue;
    const t = p.tree;
    assert.equal(t.length, BOX_TREE_SLOTS);
    const vacias = t.filter((n) => n.unknown);
    assert.equal(vacias.length, 1, "la incógnita tiene que estar en una sola hoja");
    posiciones.add(t.indexOf(vacias[0] as BoxTreeNode));
    assert.equal(t.filter((n) => n.parent === -1).length, 1, "el árbol tiene una sola raíz");
    for (const n of t) {
      const esRama = n.op !== null;
      if (esRama) {
        assert.equal(n.value, null, "una rama no tiene valor");
        assert.equal(t.filter((c) => c.parent === t.indexOf(n)).length, 2, "una rama sin dos hijos");
      } else if (!n.unknown) {
        // Los distractores del diseño son hojas con valor conocido: soltar el
        // cajón ahí es leer mal la estructura, no equivocarse de número.
        assert.ok((n.value as number) >= 2, "una hoja conocida sin valor");
      }
      assert.ok(n.parent >= -1 && n.parent < t.length);
    }
    // El cajón que se arrastra a la hoja es uno solo, y es un cajón.
    assert.equal(p.tokens.length, 1);
    assert.ok((p.kinds[(p.tokens[0] as { kind: number }).kind] as BoxKind).closed);
  }
  assert.ok(posiciones.size >= 2, "la incógnita cae siempre en el mismo lugar del árbol");
});

// --- La regla del libro y la misconception -----------------------------------

test("una fila acepta lo que comparte forma y marca, y nada más", () => {
  const nivel = boxLevelByNumber(4) as BoxLevel;
  const p = generateUnknownBox(nivel, 99, 0);
  for (let i = 0; i < p.kinds.length; i++) {
    for (let j = 0; j < p.kinds.length; j++) {
      assert.equal(boxRowAccepts(p.kinds[i], p.kinds[j]), i === j);
    }
  }
  assert.equal(boxRowAccepts(undefined, p.kinds[0]), false);
  assert.equal(boxRowAccepts(p.kinds[0], undefined), false);
});

test("la única misconception del nodo es la que el catálogo declara sobre él", () => {
  assert.equal(BOX_MISCONCEPTION, "variable_as_label");
  const clasifican = new Set<string>();
  for (const p of todas()) {
    for (const fila of p.kinds) {
      for (const objeto of p.kinds) {
        const m = boxMisconceptionFor(fila, objeto);
        if (m) clasifican.add(m);
      }
    }
  }
  assert.deepEqual([...clasifican], ["variable_as_label"]);
});

test("juntar dos marcas distintas clasifica; dejar una fruta donde no va, no", () => {
  const nivel = boxLevelByNumber(4) as BoxLevel;
  const p = generateUnknownBox(nivel, 7, 0);
  const cajones = p.kinds.filter((k) => k.closed);
  const sueltos = p.kinds.filter((k) => !k.closed);
  assert.ok(cajones.length >= 2 && sueltos.length >= 1);
  // `2x + 3y` que sale `5xy`: la letra tratada como etiqueta pegable.
  assert.equal(boxMisconceptionFor(cajones[0], cajones[1]), BOX_MISCONCEPTION);
  // Una fruta en la fila de otra fruta es un error y no una idea equivocada
  // sobre las letras: no está catalogado y el `attempt` va sin campo.
  assert.equal(boxMisconceptionFor(sueltos[0], cajones[0]), undefined);
  assert.equal(boxMisconceptionFor(cajones[0], sueltos[0]), undefined);
  // Acertar nunca clasifica.
  assert.equal(boxMisconceptionFor(cajones[0], cajones[0]), undefined);
});

// --- El registro -------------------------------------------------------------

test("el nodo se anota en el registro con su lugar y su prerequisito", () => {
  const spec = nodeById(NODE_UNKNOWN_BOX);
  assert.ok(spec);
  assert.equal(spec.n, 10);
  assert.deepEqual(spec.prereqs, ["arith.expr.precedence_tree"]);
  assert.equal(spec.levels.length, TOTAL_BOX_LEVELS);
});

test("el nodo se abre cuando el árbol de la expresión quedó terminado, y no antes", () => {
  const arbol = nodeById("arith.expr.precedence_tree");
  if (!arbol) {
    // El nodo 9 lo construye otro agente: mientras no exista, un prerequisito
    // sin minijuego no bloquea, que es la regla del registro.
    assert.ok(isNodeOpen(NODE_UNKNOWN_BOX, {}));
    return;
  }
  assert.ok(!isNodeOpen(NODE_UNKNOWN_BOX, {}));
  assert.ok(isNodeOpen(NODE_UNKNOWN_BOX, { "arith.expr.precedence_tree": arbol.levels.length }));
});
