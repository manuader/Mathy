import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DIST_COLUMN_SLOTS,
  DIST_EVIDENCE,
  DIST_LEVELS,
  DIST_MAX_COLUMN,
  DIST_MISCONCEPTIONS,
  DIST_OPTION_SLOTS,
  DIST_TRAY_SLOTS,
  NODE_DISTRIBUTIVE_TILES,
  TOTAL_DIST_LEVELS,
  distAreaTerms,
  distCells,
  distColumnsOf,
  distDropMisconceptionFor,
  distFits,
  distFolded,
  distLevelByNumber,
  distMerge,
  distMisconceptionFor,
  distShapeOf,
  distTimes,
  distTotalCells,
  generateDistributive,
  isNodeOpen,
  nodeById,
  type DistColumn,
  type DistLevel,
  type DistOption,
  type DistPiece,
  type DistProblem,
  type DistRoom,
  type DistTerm,
} from "../src/index.ts";

const seeds = (n: number): number[] => Array.from({ length: n }, (_, i) => i * 37 + 1);

/** Todas las rondas de un nivel, para todas las semillas de la muestra. */
function rounds(level: DistLevel, n = 16): DistProblem[] {
  const out: DistProblem[] = [];
  for (const seed of seeds(n)) {
    for (let r = 0; r < level.rounds; r++) out.push(generateDistributive(level, seed + r, r));
  }
  return out;
}

const todas = (n = 10): DistProblem[] => DIST_LEVELS.flatMap((l) => rounds(l, n));

/** Las rondas que dibujan un piso con dos habitaciones y baldosas para cubrirlo. */
const conBandeja = (): DistProblem[] => todas().filter((p) => p.ask === "cover");

// --- Los niveles como datos --------------------------------------------------

test("los seis niveles del diseño están, en orden y sin repetir", () => {
  assert.equal(DIST_LEVELS.length, 6);
  assert.equal(TOTAL_DIST_LEVELS, 6);
  assert.deepEqual(
    DIST_LEVELS.map((l) => l.n),
    [1, 2, 3, 4, 5, 6],
  );
});

test("cada nivel cambia la capa o endurece parámetros, nunca las dos cosas", () => {
  for (let i = 1; i < DIST_LEVELS.length; i++) {
    const prev = DIST_LEVELS[i - 1] as DistLevel;
    const cur = DIST_LEVELS[i] as DistLevel;
    const cambioCapa = prev.layer !== cur.layer;
    const cambioParams = JSON.stringify(prev.params) !== JSON.stringify(cur.params);
    assert.ok(
      !(cambioCapa && cambioParams),
      `el nivel ${cur.n} cambia la capa y los parámetros a la vez`,
    );
  }
});

test("los parámetros nunca se ablandan al avanzar de nivel", () => {
  for (let i = 1; i < DIST_LEVELS.length; i++) {
    const prev = (DIST_LEVELS[i - 1] as DistLevel).params;
    const cur = (DIST_LEVELS[i] as DistLevel).params;
    assert.ok(cur.terms >= prev.terms, `el nivel ${i + 1} saca un sumando del paréntesis`);
    assert.ok(cur.unknowns >= prev.unknowns, `el nivel ${i + 1} devuelve la medida que faltaba`);
    assert.ok(cur.coefficients[1] >= prev.coefficients[1], `el nivel ${i + 1} achica los números`);
    assert.ok(!(prev.subtraction && !cur.subtraction), `el nivel ${i + 1} saca la resta`);
    assert.ok(
      !(prev.negativeFactor && !cur.negativeFactor),
      `el nivel ${i + 1} saca el factor común negativo`,
    );
  }
});

test("el nodo recorre las cuatro capas del diseño y termina en la definición", () => {
  assert.deepEqual(
    [...new Set(DIST_LEVELS.map((l) => l.layer))],
    ["concrete", "visual", "symbolic", "formal"],
  );
  assert.equal((DIST_LEVELS.at(-1) as DistLevel).layer, "formal");
  assert.deepEqual(
    DIST_LEVELS.filter((l) => l.definition).map((l) => l.n),
    [6],
  );
});

test("los cinco verbos del nodo aparecen en algún nivel", () => {
  const vistos = new Set(DIST_LEVELS.flatMap((l) => l.evidence));
  for (const verbo of DIST_EVIDENCE) {
    assert.ok(vistos.has(verbo), `ningún nivel da evidencia de ${verbo}`);
  }
});

test("la analogía se retira cuando el diseño dice y no antes", () => {
  // Las baldosas se piden con un toque desde `symbolic` segunda mitad, y el
  // libro dura más: se va recién en `formal`.
  assert.deepEqual(
    DIST_LEVELS.filter((l) => l.floor === "onDemand").map((l) => l.n),
    [5, 6],
  );
  assert.deepEqual(
    DIST_LEVELS.filter((l) => !l.ledger).map((l) => l.n),
    [6],
  );
  // El renglón con las dos escrituras nace al pasar a `symbolic`.
  assert.deepEqual(
    DIST_LEVELS.filter((l) => l.row).map((l) => l.n),
    [4, 5, 6],
  );
});

test("el nodo está en el registro con su número de espina y sus dos prerequisitos", () => {
  const spec = nodeById(NODE_DISTRIBUTIVE_TILES);
  assert.ok(spec);
  assert.equal(spec.n, 15);
  assert.deepEqual(spec.prereqs, ["arith.mul.scaling", "prealg.var.unknown_as_box"]);
  assert.equal(spec.levels.length, 6);
});

test("el nodo se abre recién cuando el estirado y la caja quedaron terminados", () => {
  const estirar = nodeById("arith.mul.scaling");
  const caja = nodeById("prealg.var.unknown_as_box");
  assert.ok(estirar);
  assert.ok(caja);
  assert.equal(isNodeOpen(NODE_DISTRIBUTIVE_TILES, {}), false);
  assert.equal(
    isNodeOpen(NODE_DISTRIBUTIVE_TILES, { "arith.mul.scaling": estirar.levels.length }),
    false,
  );
  assert.equal(
    isNodeOpen(NODE_DISTRIBUTIVE_TILES, {
      "arith.mul.scaling": estirar.levels.length,
      "prealg.var.unknown_as_box": caja.levels.length - 1,
    }),
    false,
  );
  assert.equal(
    isNodeOpen(NODE_DISTRIBUTIVE_TILES, {
      "arith.mul.scaling": estirar.levels.length,
      "prealg.var.unknown_as_box": caja.levels.length,
    }),
    true,
  );
});

// --- El generador ------------------------------------------------------------

test("el generador es determinista: la misma semilla da la misma ronda", () => {
  for (const level of DIST_LEVELS) {
    for (let r = 0; r < level.rounds; r++) {
      const a = generateDistributive(level, 4242 + r, r);
      const b = generateDistributive(level, 4242 + r, r);
      assert.deepEqual(a, b);
    }
  }
});

test("cada ronda pide lo que su nivel declara, ciclando", () => {
  for (const level of DIST_LEVELS) {
    for (let r = 0; r < level.rounds; r++) {
      const p = generateDistributive(level, 99 + r, r);
      assert.equal(p.ask, level.asks[r % level.asks.length]);
    }
  }
});

test("la letra llega en el nivel 2 y no antes", () => {
  const primero = distLevelByNumber(1) as DistLevel;
  for (const p of rounds(primero)) {
    for (const r of p.rooms) assert.equal(r.length.letters, "", "el nivel 1 tiene una letra");
    assert.equal(typeof p.area, "number", "el nivel 1 no puede contar su superficie");
  }
  const segundo = distLevelByNumber(2) as DistLevel;
  for (const p of rounds(segundo)) {
    if (p.ask !== "cover") continue;
    assert.equal(
      p.rooms.filter((r) => r.length.letters !== "").length,
      1,
      "el nivel 2 no trae exactamente una habitación sin medida",
    );
  }
});

test("las restas y el factor negativo solo aparecen donde el nivel los declara", () => {
  for (const level of DIST_LEVELS) {
    for (const p of rounds(level, 8)) {
      if (!level.params.subtraction) {
        for (const r of p.rooms) {
          assert.ok(r.length.coef > 0, `el nivel ${level.n} metió una resta adentro`);
        }
      }
      if (!level.params.negativeFactor) {
        for (const w of p.width) {
          assert.ok(w.coef > 0, `el nivel ${level.n} usó un ancho negativo`);
        }
      }
    }
  }
});

// --- El invariante: el mismo piso contado de dos maneras ---------------------

test("multiplicar dos lados multiplica lo que miden", () => {
  const a: DistTerm = { coef: 3, letters: "" };
  const b: DistTerm = { coef: 2, letters: "x" };
  assert.equal(distCells(distTimes(a, b)), distCells(a) * distCells(b));
  assert.deepEqual(distTimes(b, { coef: 1, letters: "y" }), { coef: 2, letters: "xy" });
});

test("el área no cambia al sacar la pared: las dos escrituras miden el mismo piso", () => {
  for (const p of todas()) {
    if (p.rooms.length === 0 || p.width.length === 0) continue;
    // Con la pared puesta: el ancho por el largo entero.
    const conPared = distTotalCells(p.width) * distTotalCells(p.rooms.map((r) => r.length));
    // Con la pared afuera: la suma de los bloques.
    const sinPared = distTotalCells(distAreaTerms(p.width, p.rooms));
    assert.equal(conPared, sinPared, `el piso de ${p.ask} cambia de tamaño al sacar la pared`);
  }
});

test("el producto y la suma son el mismo dato agrupado distinto", () => {
  for (const p of todas()) {
    if (p.rooms.length === 0) continue;
    assert.equal(p.sum.kind, "sum");
    assert.deepEqual(p.sum.head, distAreaTerms(p.width, p.rooms));
    // La pared partida en dos escrituras: un ancho da un paréntesis, un ancho
    // partido da dos.
    assert.equal(p.product.kind, p.width.length > 1 ? "pair" : "product");
    assert.deepEqual(p.product.head, p.width);
    assert.deepEqual(
      p.product.tail,
      p.rooms.map((r) => r.length),
    );
  }
});

test("el contador de superficie es un número solo cuando no hay letras", () => {
  for (const p of todas()) {
    if (p.rooms.length === 0) continue;
    const bloques = distAreaTerms(p.width, p.rooms);
    const hayLetras = bloques.some((b) => b.letters !== "");
    assert.equal(p.area === null, hayLetras);
    if (p.area !== null) {
      assert.equal(
        p.area,
        bloques.reduce((s, b) => s + b.coef, 0),
      );
    }
  }
});

// --- La bandeja --------------------------------------------------------------

test("las tiras de la bandeja cubren el marco exacto: ni un hueco ni una superposición", () => {
  for (const p of conBandeja()) {
    const marco = p.widthCells * distTotalCells(p.rooms.map((r) => r.length));
    const cubierto = p.tray.reduce((s, t) => s + t.cells * t.tall, 0);
    assert.equal(cubierto, marco, "la bandeja no mide lo que mide el marco");
    assert.equal(p.tray.length, p.widthCells * p.rooms.length);
  }
});

test("cada tira entra en su habitación y en ninguna otra", () => {
  for (const p of conBandeja()) {
    for (const piece of p.tray) {
      const suya = p.rooms[piece.room] as DistRoom;
      assert.ok(distFits(piece, suya), "una tira no entra en su propia habitación");
      for (let i = 0; i < p.rooms.length; i++) {
        if (i === piece.room) continue;
        assert.equal(
          distFits(piece, p.rooms[i] as DistRoom),
          false,
          "una tira entra en las dos habitaciones y la pared deja de decir nada",
        );
      }
    }
  }
});

test("el cuadrado de una suma deja vacíos exactamente los dos rectángulos de la bandeja", () => {
  const level = distLevelByNumber(6) as DistLevel;
  const p = rounds(level).find((r) => r.ask === "square") as DistProblem;
  const [izquierda, derecha] = p.prefilled;
  const lado = p.widthCells;
  // Las dos esquinas puestas y el marco entero, en celdas.
  const puesto = izquierda * izquierda + derecha * derecha;
  assert.equal(izquierda + derecha, lado);
  const faltante = lado * lado - puesto;
  assert.equal(
    p.tray.reduce((s, t) => s + t.cells * t.tall, 0),
    faltante,
    "las piezas de la bandeja no tapan el hueco que el error deja",
  );
  assert.equal(p.tray.length, 2);
  // Están acostadas al revés una de la otra: ocupan esquinas opuestas.
  const [m0, m1] = p.tray as [DistPiece, DistPiece];
  assert.equal(m0.cells, m1.tall);
  assert.equal(m0.tall, m1.cells);
});

// --- El libro de cuentas -----------------------------------------------------

test("el libro tiene una columna por bloque, con la forma y la marca del bloque", () => {
  for (const p of todas()) {
    if (p.rooms.length === 0) continue;
    const bloques = distAreaTerms(p.width, p.rooms);
    assert.equal(p.columns.length, bloques.length);
    for (let i = 0; i < bloques.length; i++) {
      const b = bloques[i] as DistTerm;
      const c = p.columns[i] as DistColumn;
      assert.equal(c.count, Math.abs(b.coef));
      assert.equal(c.letter, b.letters);
      assert.equal(c.shape, distShapeOf(b));
    }
  }
});

test("juntar columnas conserva la cantidad de piezas", () => {
  for (const p of todas()) {
    if (p.columns.length === 0) continue;
    const antes = p.columns.reduce((s, c) => s + c.count, 0);
    const despues = distFolded(p.columns).reduce((s, c) => s + c.count, 0);
    assert.equal(despues, antes, `el libro de ${p.ask} pierde piezas al juntar columnas`);
  }
});

test("dos columnas se funden solo si cuentan la misma forma", () => {
  const [unidad, otraUnidad, tira] = distColumnsOf([
    { coef: 2, letters: "" },
    { coef: 3, letters: "" },
    { coef: 3, letters: "x" },
  ]) as [DistColumn, DistColumn, DistColumn];
  const juntas = distMerge(unidad, otraUnidad);
  assert.ok(juntas);
  assert.equal(juntas.count, 5);
  assert.equal(distMerge(unidad, tira), null, "`2x + 3` no se junta y se juntó");
});

test("con las dos habitaciones numéricas las columnas se funden en una sola", () => {
  const level = distLevelByNumber(1) as DistLevel;
  for (const p of rounds(level)) {
    assert.equal(p.columns.length, 2);
    assert.equal(distFolded(p.columns).length, 1, "el nivel 1 no junta sus dos columnas");
  }
});

test("con una habitación sin medida las columnas se rechazan", () => {
  const level = distLevelByNumber(2) as DistLevel;
  for (const p of rounds(level)) {
    if (p.ask !== "cover") continue;
    assert.equal(distFolded(p.columns).length, 2, "una tira y una baldosa se apilaron juntas");
  }
});

test("ninguna columna pasa de lo que el libro puede dibujar pieza por pieza", () => {
  for (const level of DIST_LEVELS) {
    if (level.ledgerSkin === "chips") continue;
    for (const p of rounds(level, 8)) {
      for (const c of p.columns) {
        assert.ok(c.count <= DIST_MAX_COLUMN, `el nivel ${level.n} dibuja ${c.count} piezas`);
      }
    }
  }
});

// --- Las fichas --------------------------------------------------------------

test("una ficha lleva motivo exactamente cuando no dice el piso", () => {
  for (const p of todas()) {
    for (const o of p.options) {
      assert.equal(
        o.lure !== undefined,
        !o.sound,
        `una ficha de ${p.ask} desacopla el motivo de lo que dice`,
      );
    }
  }
});

test("cada ronda de fichas trae una sola respuesta, salvo explicar que pide dos", () => {
  for (const p of todas()) {
    if (p.options.length === 0) continue;
    assert.ok(p.options.length <= DIST_OPTION_SLOTS);
    const aciertos = p.options.filter((o) => o.correct).length;
    if (p.ask === "explain") {
      assert.equal(aciertos, 2, "explicar no pide señalar dos escrituras");
      assert.equal(p.picks, 2);
    } else if (p.ask === "expand") {
      // Armar la suma pide una ficha por sumando, y todas son respuestas.
      assert.equal(aciertos, p.rooms.length);
      assert.equal(p.picks, p.rooms.length);
    } else {
      assert.equal(aciertos, 1, `${p.ask} no trae una sola respuesta`);
    }
  }
});

test("explicar señala las que pierden baldosas, no la que dice el piso", () => {
  const level = distLevelByNumber(3) as DistLevel;
  for (const p of rounds(level)) {
    if (p.ask !== "explain") continue;
    assert.equal(p.options.length, 3);
    for (const o of p.options) {
      assert.equal(o.correct, !o.sound, "explicar no invirtió lo que se toca");
    }
    const motivos = p.options.filter((o) => o.correct).map((o) => o.lure);
    assert.deepEqual([...motivos].sort(), ["labels_merged", "square_of_parts"]);
  }
});

test("armar la suma ofrece los bloques buenos y ningún señuelo que sea uno de ellos", () => {
  const level = distLevelByNumber(5) as DistLevel;
  for (const p of rounds(level)) {
    const bloques = distAreaTerms(p.width, p.rooms);
    const buenas = p.options.filter((o) => o.correct).map((o) => o.form.head[0] as DistTerm);
    assert.deepEqual(
      [...buenas].sort(porTermino),
      [...bloques].sort(porTermino),
      "las fichas buenas no son los bloques del piso",
    );
    for (const o of p.options) {
      if (o.correct) continue;
      const t = o.form.head[0] as DistTerm;
      assert.ok(
        !bloques.some((b) => b.coef === t.coef && b.letters === t.letters),
        "un señuelo es en realidad un bloque del piso",
      );
    }
  }
});

test("recomponer tiene una sola respuesta: el ancho que divide a los dos sumandos", () => {
  const level = distLevelByNumber(6) as DistLevel;
  for (const p of rounds(level)) {
    if (p.ask !== "recompose") continue;
    const bloques = distAreaTerms(p.width, p.rooms);
    const maximo = bloques.reduce((g, b) => mcd(g, Math.abs(b.coef)), 0);
    assert.equal(maximo, (p.width[0] as DistTerm).coef, "el ancho no es el máximo compartido");
    for (const o of p.options) {
      const k = (o.form.head[0] as DistTerm).coef;
      // El uno divide a todos y no es la respuesta: lo que se pide es el ancho
      // compartido, y el uno no comparte nada.
      assert.equal(o.correct, k === maximo, `${k} clasificó mal`);
      if (o.lure === "one_side_only") {
        assert.equal(
          bloques.filter((b) => Math.abs(b.coef) % k === 0).length,
          1,
          `${k} divide a los dos sumandos y entonces no es un señuelo`,
        );
      }
    }
  }
});

test("rechazar: sobre un producto no hay pared que sacar", () => {
  const level = distLevelByNumber(6) as DistLevel;
  for (const p of rounds(level)) {
    if (p.ask !== "reject") continue;
    assert.equal(p.rooms.length, 1, "un producto no tiene dos habitaciones");
    const buena = p.options.find((o) => o.correct) as DistOption;
    assert.equal(buena.form.kind, "sum");
    assert.equal(buena.form.head.length, 1);
    const motivos = p.options.filter((o) => !o.correct).map((o) => o.lure);
    assert.deepEqual([...motivos].sort(), ["distributed_over_product", "factor_into_both"]);
  }
});

// --- Los errores del catálogo ------------------------------------------------

test("los dos únicos ids son los que el catálogo declara sobre el nodo", () => {
  assert.deepEqual([...DIST_MISCONCEPTIONS].sort(), [
    "distribute_over_wrong_op",
    "variable_as_label",
  ]);
  for (const level of DIST_LEVELS) {
    for (const id of level.classifies) {
      assert.ok(DIST_MISCONCEPTIONS.includes(id), `el nivel ${level.n} inventó ${id}`);
    }
  }
});

test("ningún movimiento anota un id que no esté en el catálogo", () => {
  const vistos = new Set<string>();
  for (const level of DIST_LEVELS) {
    for (const p of rounds(level, 6)) {
      for (const o of p.options) {
        const id = distMisconceptionFor(level, o);
        if (id) vistos.add(id);
      }
      for (const piece of p.tray) {
        for (const room of p.rooms) {
          const id = distDropMisconceptionFor(level, piece, room);
          if (id) vistos.add(id);
        }
      }
    }
  }
  for (const id of vistos) assert.ok(DIST_MISCONCEPTIONS.includes(id), `apareció ${id}`);
  assert.ok(vistos.size > 0, "ningún nivel llegó a anotar nada");
});

test("un nivel que no declara un error lo muestra y no lo anota", () => {
  for (const level of DIST_LEVELS) {
    for (const p of rounds(level, 6)) {
      for (const o of p.options) {
        const id = distMisconceptionFor(level, o);
        if (id) assert.ok(level.classifies.includes(id), `el nivel ${level.n} anotó ${id}`);
      }
    }
  }
  // El nivel 1 no clasifica nada: con una sola forma de pieza no hay dos formas
  // que confundir, y adentro del paréntesis hay una suma.
  const primero = distLevelByNumber(1) as DistLevel;
  for (const p of rounds(primero)) {
    for (const o of p.options) assert.equal(distMisconceptionFor(primero, o), undefined);
    for (const piece of p.tray) {
      for (const room of p.rooms) {
        assert.equal(distDropMisconceptionFor(primero, piece, room), undefined);
      }
    }
  }
});

test("explicar nunca anota: quien señala el error no lo está cometiendo", () => {
  const level = distLevelByNumber(3) as DistLevel;
  for (const p of rounds(level)) {
    if (p.ask !== "explain") continue;
    for (const o of p.options) assert.equal(distMisconceptionFor(level, o), undefined);
  }
});

test("dejar una pieza de otra forma es lo único que clasifica sobre el piso", () => {
  const level = distLevelByNumber(2) as DistLevel;
  for (const p of rounds(level)) {
    if (p.ask !== "cover") continue;
    for (const piece of p.tray) {
      for (let i = 0; i < p.rooms.length; i++) {
        const room = p.rooms[i] as DistRoom;
        const id = distDropMisconceptionFor(level, piece, room);
        assert.equal(
          id,
          piece.shape === room.shape ? undefined : "variable_as_label",
          "una pieza de la misma forma clasificó, o una de otra forma no",
        );
      }
    }
  }
});

test("el cuadrado entrega el error en su forma más frecuente", () => {
  const level = distLevelByNumber(6) as DistLevel;
  const p = rounds(level).find((r) => r.ask === "square") as DistProblem;
  const partido = p.options.find((o) => o.lure === "square_of_parts") as DistOption;
  assert.equal(distMisconceptionFor(level, partido), "distribute_over_wrong_op");
  const contorno = p.options.find((o) => o.lure === "sides_added") as DistOption;
  assert.equal(distMisconceptionFor(level, contorno), undefined, "sumar los lados no está en L");
});

// --- Modo retained -----------------------------------------------------------

test("nada de lo que se dibuja pasa de las ranuras montadas", () => {
  for (const p of todas()) {
    assert.ok(p.tray.length <= DIST_TRAY_SLOTS, `${p.ask} trae ${p.tray.length} piezas`);
    assert.ok(p.options.length <= DIST_OPTION_SLOTS);
    assert.ok(p.columns.length <= DIST_COLUMN_SLOTS);
  }
});

const mcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : mcd(b, a % b));

/** Orden estable para comparar listas de términos sin que importe el sorteo. */
const porTermino = (a: DistTerm, b: DistTerm): number =>
  a.letters === b.letters ? a.coef - b.coef : a.letters < b.letters ? -1 : 1;
