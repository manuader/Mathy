import { test } from "node:test";
import assert from "node:assert/strict";
import {
  GP_CONTINUATION_SLOTS,
  GP_EVIDENCE,
  GP_LAYERS,
  GP_LEVELS,
  GP_MISCONCEPTION,
  GP_OPTION_SLOTS,
  NODE_GRAPH_PICTURE,
  TOTAL_GP_LEVELS,
  generateGraphPicture,
  gpCurveOf,
  gpGaps,
  gpHeightAt,
  gpJoins,
  gpLevelByNumber,
  gpMisconceptionFor,
  gpPoints,
  gpQuadrant,
  gpSame,
  gpSwap,
  gpTo,
  gpVerticalLineTest,
  isNodeOpen,
  nodeById,
  type GpCurve,
  type GpLevel,
  type GpProblem,
  type GpTrace,
} from "../src/index.ts";

const semillas = (n: number): number[] => Array.from({ length: n }, (_, i) => i * 53 + 11);

/** Todas las rondas de un nivel, para todas las semillas de la muestra. */
function rondas(level: GpLevel, n = 12): GpProblem[] {
  const out: GpProblem[] = [];
  for (const seed of semillas(n)) {
    for (let r = 0; r < level.rounds; r++) out.push(generateGraphPicture(level, seed + r, r));
  }
  return out;
}

const todas = (n = 8): GpProblem[] => GP_LEVELS.flatMap((l) => rondas(l, n));

const nivel = (n: number): GpLevel => gpLevelByNumber(n) as GpLevel;

/** Las rondas de un nivel que hacen una pregunta dada. */
const conPregunta = (n: number, ask: string, m = 12): GpProblem[] =>
  rondas(nivel(n), m).filter((p) => p.ask === ask);

// --- Los niveles como datos --------------------------------------------------

test("los ocho niveles del diseño están, en orden y sin repetir", () => {
  assert.equal(GP_LEVELS.length, 8);
  assert.equal(TOTAL_GP_LEVELS, 8);
  assert.deepEqual(
    GP_LEVELS.map((l) => l.n),
    [1, 2, 3, 4, 5, 6, 7, 8],
  );
});

test("cada nivel cambia la capa o endurece parámetros, nunca las dos cosas", () => {
  for (let i = 1; i < GP_LEVELS.length; i++) {
    const prev = GP_LEVELS[i - 1] as GpLevel;
    const cur = GP_LEVELS[i] as GpLevel;
    const cambioCapa = prev.layer !== cur.layer;
    const cambioParams = JSON.stringify(prev.params) !== JSON.stringify(cur.params);
    assert.ok(
      !(cambioCapa && cambioParams),
      `el nivel ${cur.n} cambia la capa y los parámetros a la vez`,
    );
    assert.ok(cambioCapa || cambioParams, `el nivel ${cur.n} no cambia nada respecto del anterior`);
  }
});

test("ningún parámetro se ablanda al avanzar de nivel", () => {
  for (let i = 1; i < GP_LEVELS.length; i++) {
    const prev = (GP_LEVELS[i - 1] as GpLevel).params;
    const cur = (GP_LEVELS[i] as GpLevel).params;
    assert.ok(cur.bumps >= prev.bumps, `el nivel ${i + 1} usa menos lomas`);
    assert.ok(cur.xRange[0] <= prev.xRange[0], `el nivel ${i + 1} acorta el camino hacia atrás`);
    assert.ok(cur.xRange[1] >= prev.xRange[1], `el nivel ${i + 1} acorta el camino hacia adelante`);
    assert.ok(cur.yRange[0] <= prev.yRange[0], `el nivel ${i + 1} sube el piso de las alturas`);
    assert.ok(cur.yRange[1] >= prev.yRange[1], `el nivel ${i + 1} baja el techo de las alturas`);
    assert.ok(!(prev.negatives && !cur.negatives), `el nivel ${i + 1} apaga los negativos`);
    assert.ok(!(prev.flats && !cur.flats), `el nivel ${i + 1} apaga los tramos planos`);
    assert.ok(cur.jumps >= prev.jumps, `el nivel ${i + 1} pide menos saltos`);
    assert.ok(cur.gaps >= prev.gaps, `el nivel ${i + 1} pide menos huecos`);
    assert.ok(cur.traces >= prev.traces, `el nivel ${i + 1} dibuja menos rastros`);
  }
});

test("el nodo recorre las seis capas del diseño y termina en la definición", () => {
  assert.deepEqual([...new Set(GP_LEVELS.map((l) => l.layer))], GP_LAYERS);
  const ultimo = GP_LEVELS.at(-1) as GpLevel;
  assert.equal(ultimo.layer, "formal");
  assert.equal(ultimo.definition, true);
  assert.equal(GP_LEVELS.filter((l) => l.definition).length, 1);
});

test("los cinco verbos del diseño aparecen y ninguno se inventa", () => {
  const vistos = new Set(GP_LEVELS.flatMap((l) => l.evidence));
  assert.deepEqual([...vistos].sort(), [...GP_EVIDENCE].sort());
});

test("ningún nivel lleva texto: todos los títulos son claves", () => {
  for (const l of GP_LEVELS) assert.match(l.titleKey, /^level\./);
});

test("el terreno se retira una sola vez y no vuelve", () => {
  assert.deepEqual(
    GP_LEVELS.map((l) => l.terrain),
    ["shown", "shown", "shown", "shown", "faded", "hidden", "hidden", "hidden"],
  );
});

test("la hoja se abre a las cuatro regiones cuando entran los negativos", () => {
  for (const l of GP_LEVELS) {
    assert.equal(
      l.sheet === "quadrants",
      l.params.negatives,
      `el nivel ${l.n} desacopla la hoja de los negativos`,
    );
  }
});

test("los pares escritos y las letras de los ejes nacen juntos, en symbolic", () => {
  for (const l of GP_LEVELS) {
    assert.equal(l.pairs, l.axisLabels, `el nivel ${l.n} desacopla el par de los ejes`);
    assert.equal(
      l.pairs,
      l.layer === "symbolic" || l.layer === "formal",
      `el nivel ${l.n} escribe pares fuera de la notación`,
    );
  }
});

// --- El registro de nodos ----------------------------------------------------

test("el nodo se registra con el número y los prerequisitos de spine.yaml", () => {
  const spec = nodeById(NODE_GRAPH_PICTURE);
  assert.ok(spec, "el nodo no quedó registrado");
  assert.equal(spec.n, 18);
  assert.deepEqual(spec.prereqs, ["alg.fn.function_as_machine", "arith.int.negatives"]);
  assert.equal(spec.levels.length, 8);
});

test("un prerequisito sin minijuego no bloquea, y el que está sí", () => {
  const neg = nodeById("arith.int.negatives");
  assert.ok(neg, "el prerequisito de los negativos todavía no está construido");
  // La máquina del nodo 17 todavía puede no existir en el registro; mientras no
  // exista no bloquea, que es la regla pobre de `isNodeOpen`.
  assert.equal(isNodeOpen(NODE_GRAPH_PICTURE, {}), false);
  assert.equal(
    isNodeOpen(NODE_GRAPH_PICTURE, {
      "arith.int.negatives": neg.levels.length,
      "alg.fn.function_as_machine": 99,
    }),
    true,
  );
});

// --- El invariante: una sola altura por posición ------------------------------

test("el rastro no tiene dónde guardar dos alturas para la misma posición", () => {
  for (const p of todas()) {
    for (const t of p.traces) {
      const vistas = new Map<number, number>();
      for (const punto of gpPoints(t)) {
        assert.equal(vistas.has(punto.x), false, `la posición ${punto.x} apareció dos veces`);
        vistas.set(punto.x, punto.y);
      }
    }
  }
});

test("todo rastro pasa la prueba de la recta vertical, y por construcción", () => {
  for (const p of todas()) {
    for (const t of p.traces) {
      assert.equal(gpVerticalLineTest(gpCurveOf(t)).ok, true, `el rastro ${t.id} corta dos veces`);
    }
  }
});

test("la altura de una posición es siempre la misma, se pregunte cuando se pregunte", () => {
  const t: GpTrace = { id: "t", from: -2, heights: [1, null, 3, 4], breaks: [] };
  assert.equal(gpHeightAt(t, -2), 1);
  assert.equal(gpHeightAt(t, -1), null);
  assert.equal(gpHeightAt(t, 0), 3);
  assert.equal(gpHeightAt(t, 9), null, "fuera del rastro no hay altura");
  assert.equal(gpTo(t), 1);
  assert.deepEqual(gpGaps(t), [-1]);
  assert.deepEqual(gpPoints(t), [
    { x: -2, y: 1 },
    { x: 0, y: 3 },
    { x: 1, y: 4 },
  ]);
});

test("la línea se corta en el salto y donde falta la altura, y no en otro lado", () => {
  const t: GpTrace = { id: "t", from: 0, heights: [1, 2, null, 4, 5], breaks: [3] };
  assert.equal(gpJoins(t, 0), true);
  assert.equal(gpJoins(t, 1), false, "no hay altura en la posición 2");
  assert.equal(gpJoins(t, 2), false, "tampoco viniendo desde el hueco");
  assert.equal(gpJoins(t, 3), false, "el salto corta la línea aunque haya altura a los dos lados");
  assert.notEqual(gpHeightAt(t, 3), null);
  assert.notEqual(gpHeightAt(t, 4), null);
});

// --- Las cuatro regiones -----------------------------------------------------

test("el signo de cada número dice en qué región cae la gota", () => {
  assert.equal(gpQuadrant({ x: 3, y: 5 }), 1);
  assert.equal(gpQuadrant({ x: -3, y: 5 }), 2);
  assert.equal(gpQuadrant({ x: -3, y: -5 }), 3);
  assert.equal(gpQuadrant({ x: 3, y: -5 }), 4);
  // Sobre un eje el signo no alcanza, y eso no es una de las cuatro regiones.
  assert.equal(gpQuadrant({ x: 0, y: 5 }), 0);
  assert.equal(gpQuadrant({ x: 3, y: 0 }), 0);
});

test("el orden dentro del par importa: dado vuelta es otro lugar", () => {
  assert.deepEqual(gpSwap({ x: 3, y: 5 }), { x: 5, y: 3 });
  assert.equal(gpSame({ x: 3, y: 5 }, gpSwap({ x: 3, y: 5 })), false);
  assert.notEqual(gpQuadrant({ x: -3, y: 5 }), gpQuadrant(gpSwap({ x: -3, y: 5 })));
  // Con las dos coordenadas iguales el par dado vuelta es el mismo par.
  assert.equal(gpSame({ x: 4, y: 4 }, gpSwap({ x: 4, y: 4 })), true);
});

// --- La recta vertical -------------------------------------------------------

test("una curva que vuelve sobre sí misma no es gráfica de ninguna máquina", () => {
  const cueva: GpCurve = {
    id: "c",
    points: [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 1, y: 3 },
    ],
    closed: false,
  };
  const prueba = gpVerticalLineTest(cueva);
  assert.equal(prueba.ok, false);
  // Falla en el primer lugar donde la recta la corta dos veces, que es donde la
  // curva empieza a volver: la posición 1, con altura 0 de ida y 3 de vuelta.
  assert.equal(prueba.at, 1);
});

test("una curva cerrada la corta dos veces, y por eso la circunferencia no es gráfica", () => {
  const anillo: GpCurve = {
    id: "c",
    points: [
      { x: -2, y: 0 },
      { x: 0, y: 2 },
      { x: 2, y: 0 },
      { x: 0, y: -2 },
    ],
    closed: true,
  };
  assert.equal(gpVerticalLineTest(anillo).ok, false);
  // La misma línea sin cerrar es media circunferencia, y sí es gráfica.
  assert.equal(gpVerticalLineTest({ ...anillo, closed: false, points: anillo.points.slice(0, 3) }).ok, true);
});

test("un tramo vertical falla en el acto: sobre esa posición hay infinitas alturas", () => {
  const pared: GpCurve = {
    id: "c",
    points: [
      { x: -3, y: -1 },
      { x: 1, y: -1 },
      { x: 1, y: 4 },
      { x: 4, y: 4 },
    ],
    closed: false,
  };
  const prueba = gpVerticalLineTest(pared);
  assert.equal(prueba.ok, false);
  assert.equal(prueba.at, 1);
});

test("un rastro con saltos y con huecos sigue siendo gráfica", () => {
  const t: GpTrace = { id: "t", from: -3, heights: [2, null, 0, 5, 5, -2], breaks: [0] };
  assert.equal(gpVerticalLineTest(gpCurveOf(t)).ok, true);
});

// --- El error del catálogo ---------------------------------------------------

test("el único error que viaja es el que el catálogo apunta a este nodo", () => {
  assert.equal(GP_MISCONCEPTION, "graph_read_axes_swapped");
  for (const l of GP_LEVELS) {
    for (const id of l.classifies) {
      assert.equal(id, GP_MISCONCEPTION, `el nivel ${l.n} clasifica un error que no es del nodo`);
    }
  }
});

test("el par leído al revés se anota, y cualquier otro par equivocado no", () => {
  const l = nivel(6);
  const objetivo = { x: 3, y: 5 };
  assert.equal(gpMisconceptionFor(l, { x: 5, y: 3 }, objetivo), GP_MISCONCEPTION);
  assert.equal(gpMisconceptionFor(l, { x: 3, y: 4 }, objetivo), undefined);
  assert.equal(gpMisconceptionFor(l, { x: -3, y: 5 }, objetivo), undefined);
  assert.equal(gpMisconceptionFor(l, objetivo, objetivo), undefined);
  // Con las dos coordenadas iguales no hay par dado vuelta que anotar.
  assert.equal(gpMisconceptionFor(l, { x: 4, y: 4 }, { x: 4, y: 4 }), undefined);
});

test("un nivel que no declara el error no lo anota nunca", () => {
  for (const n of [1, 2, 3, 4, 8]) {
    assert.equal(gpMisconceptionFor(nivel(n), { x: 5, y: 3 }, { x: 3, y: 5 }), undefined);
  }
});

// --- El generador ------------------------------------------------------------

test("la misma semilla y la misma ronda dan el mismo problema", () => {
  for (const l of GP_LEVELS) {
    for (let r = 0; r < l.rounds; r++) {
      const a = generateGraphPicture(l, 7070 + l.n, r);
      const b = generateGraphPicture(l, 7070 + l.n, r);
      assert.deepEqual(a, b, `el nivel ${l.n} no es reproducible`);
    }
  }
});

test("un nivel con dos preguntas las alterna en vez de sortearlas", () => {
  for (const l of GP_LEVELS) {
    if (l.asks.length < 2) continue;
    const vistas = new Set<string>();
    for (let r = 0; r < l.rounds; r++) vistas.add(generateGraphPicture(l, 77, r).ask);
    assert.equal(vistas.size, l.asks.length, `el nivel ${l.n} no recorre sus dos preguntas`);
  }
});

test("cada ronda respeta el camino, las alturas y los rastros que el nivel declara", () => {
  for (const l of GP_LEVELS) {
    for (const p of rondas(l)) {
      // `judge` arma su propia curva y por eso no lee `params`.
      if (p.ask === "judge") continue;
      assert.ok(p.traces.length <= l.params.traces, `el nivel ${l.n} dibujó rastros de más`);
      for (const t of p.traces) {
        assert.equal(t.from, l.params.xRange[0]);
        assert.equal(gpTo(t), l.params.xRange[1]);
        for (const punto of gpPoints(t)) {
          assert.ok(
            punto.y >= l.params.yRange[0] && punto.y <= l.params.yRange[1],
            `el nivel ${l.n} devolvió la altura ${punto.y}, fuera de rango`,
          );
        }
      }
    }
  }
});

test("sin negativos habilitados no hay alturas bajo el mar ni pasos hacia atrás", () => {
  for (const l of GP_LEVELS) {
    if (l.params.negatives) continue;
    for (const p of rondas(l)) {
      for (const t of p.traces) {
        for (const punto of gpPoints(t)) {
          assert.ok(punto.x >= 0, `el nivel ${l.n} mandó al caminante hacia atrás`);
          assert.ok(punto.y >= 0, `el nivel ${l.n} lo bajó del nivel del mar`);
        }
      }
    }
  }
});

test("con los negativos encendidos el caminante baja del mar de verdad", () => {
  for (const l of GP_LEVELS) {
    if (!l.params.negatives) continue;
    for (const p of rondas(l)) {
      if (p.ask === "judge") continue;
      const primero = p.traces[0] as GpTrace;
      assert.ok(
        gpPoints(primero).some((punto) => punto.y < 0),
        `el nivel ${l.n} abrió la hoja hacia abajo sin ninguna altura negativa`,
      );
    }
  }
});

test("los saltos y los huecos aparecen solo donde el nivel los habilita", () => {
  for (const l of GP_LEVELS) {
    for (const p of rondas(l)) {
      if (p.ask === "judge") continue;
      const primero = p.traces[0] as GpTrace;
      assert.ok(primero.breaks.length <= l.params.jumps, `el nivel ${l.n} cortó la línea de más`);
      // `place` saca una gota de la hoja a propósito: es la que el jugador
      // ubica, y por eso ese hueco no cuenta como los que el nivel declara.
      const huecos = gpGaps(primero).length - (p.ask === "place" ? 1 : 0);
      assert.ok(huecos <= l.params.gaps, `el nivel ${l.n} dejó huecos de más`);
    }
  }
});

test("el terreno y el rastro nacen de la misma máquina: la misma altura en cada lugar", () => {
  for (const p of todas()) {
    if (p.ask === "judge") continue;
    const rastro = p.traces[0] as GpTrace;
    for (let x = rastro.from; x <= gpTo(rastro); x++) {
      // En `place` falta la gota que el jugador ubica; en todo lo demás las dos
      // superficies dicen exactamente lo mismo.
      if (p.ask === "place" && p.target && x === p.target.x) continue;
      assert.equal(
        gpHeightAt(rastro, x),
        gpHeightAt(p.terrain, x),
        `el rastro y el terreno no coinciden en ${x}`,
      );
    }
  }
});

test("tocar la gota: la correcta está en el rastro y las opciones no se repiten", () => {
  for (const p of conPregunta(1, "spot")) {
    const rastro = p.traces[0] as GpTrace;
    const objetivo = p.target;
    assert.ok(objetivo, "la ronda no trajo gota preguntada");
    assert.equal(gpHeightAt(rastro, objetivo.x), objetivo.y);
    assert.equal(p.options.length, GP_OPTION_SLOTS);
    assert.ok(gpSame(p.options[p.correct] as { x: number; y: number }, objetivo));
    const claves = new Set(p.options.map((o) => `${o.x}:${o.y}`));
    assert.equal(claves.size, p.options.length, "hay dos gotas marcadas iguales");
    for (const o of p.options) assert.equal(gpHeightAt(rastro, o.x), o.y, "una opción no es del rastro");
  }
});

test("elegir la continuación: hay tres, una sola sigue y la tercera no es rastro", () => {
  for (const p of conPregunta(2, "continue")) {
    assert.equal(p.continuations.length, GP_CONTINUATION_SLOTS);
    const buena = p.continuations[p.correct] as GpCurve;
    const rastro = p.traces[0] as GpTrace;
    for (const punto of buena.points) {
      assert.equal(gpHeightAt(rastro, punto.x), punto.y, "la continuación buena se aparta del rastro");
    }
    // Alguna de las otras dos vuelve sobre sí misma: es el punto de ruptura de
    // la analogía, y por eso no puede pasar la prueba de la recta vertical.
    const malas = p.continuations.filter((_, i) => i !== p.correct);
    assert.ok(
      malas.some((c) => !gpVerticalLineTest(c).ok),
      "ninguna continuación equivocada rompe el invariante",
    );
    assert.equal(gpVerticalLineTest(buena).ok, true);
    // Ninguna candidata puede quedar dibujada encima de otra: dos líneas
    // iguales harían que elegir bien y elegir mal sean el mismo dedo.
    const dibujos = p.continuations.map((c) => c.points.map((q) => `${q.x}:${q.y}`).join(" "));
    assert.equal(new Set(dibujos).size, dibujos.length, "dos continuaciones se dibujan igual");
    const buenaDibujo = buena.points.map((q) => `${q.x}:${q.y}`).join(" ");
    for (const mala of malas) {
      const trozo = mala.points.map((q) => `${q.x}:${q.y}`).join(" ");
      assert.ok(!buenaDibujo.startsWith(trozo), "una candidata equivocada empieza como la buena");
    }
    assert.ok(p.drawnTo > (p.traces[0] as GpTrace).from, "la escena no se detuvo a mitad de camino");
    assert.ok(p.drawnTo < gpTo(p.traces[0] as GpTrace), "la escena mostró el rastro entero");
  }
});

test("leer el par: el par dado vuelta siempre está entre las opciones", () => {
  for (const n of [5, 6, 7]) {
    for (const p of conPregunta(n, "read")) {
      const objetivo = p.target;
      assert.ok(objetivo, "la ronda no trajo par preguntado");
      assert.notEqual(objetivo.x, objetivo.y, "un par simétrico no distingue el orden");
      assert.equal(p.options.length, GP_OPTION_SLOTS);
      assert.ok(gpSame(p.options[p.correct] as { x: number; y: number }, objetivo));
      assert.ok(
        p.options.some((o) => gpSame(o, gpSwap(objetivo))),
        `el nivel ${n} ofreció el par sin su lectura al revés`,
      );
      const claves = new Set(p.options.map((o) => `${o.x}:${o.y}`));
      assert.equal(claves.size, p.options.length, "hay dos pares iguales");
    }
  }
});

test("ubicar el par: la gota pedida es justo la que falta en la hoja", () => {
  for (const n of [6, 7]) {
    for (const p of conPregunta(n, "place")) {
      const objetivo = p.target;
      assert.ok(objetivo, "la ronda no trajo par pedido");
      const rastro = p.traces[0] as GpTrace;
      assert.equal(gpHeightAt(rastro, objetivo.x), null, "la gota pedida ya estaba en la hoja");
      assert.equal(gpHeightAt(p.terrain, objetivo.x), objetivo.y, "el terreno no confirma la altura");
      assert.notEqual(objetivo.x, objetivo.y, "un par simétrico no distingue el orden");
    }
  }
});

test("juzgar la curva: la respuesta sale de la prueba y no de una etiqueta", () => {
  const vistas = new Set<string>();
  for (const p of rondas(nivel(8), 24)) {
    const curva = p.curve as GpCurve;
    assert.ok(curva, "la ronda no trajo curva");
    assert.equal(gpVerticalLineTest(curva).ok, p.isGraph, "la etiqueta y la prueba no coinciden");
    assert.equal(p.isGraph, p.violation === null);
    vistas.add(p.violation ?? "graph");
  }
  // Las tres maneras de fallar del documento, y la curva que sí es gráfica.
  assert.deepEqual(
    [...vistas].sort(),
    ["closed_curve", "graph", "two_heights", "vertical_segment"],
  );
});

test("el nivel de los dos rastros trae dos, y no se pisan en ninguna posición", () => {
  for (const p of rondas(nivel(7))) {
    assert.equal(p.traces.length, 2);
    const a = p.traces[0] as GpTrace;
    const b = p.traces[1] as GpTrace;
    for (const punto of gpPoints(a)) {
      assert.notEqual(
        gpHeightAt(b, punto.x),
        punto.y,
        `en ${punto.x} los dos rastros dan la misma altura y el par dejaría de identificar`,
      );
    }
  }
});

test("caminar arranca con la hoja vacía y el rastro entero por delante", () => {
  for (const n of [3, 4, 5]) {
    for (const p of conPregunta(n, "walk")) {
      const rastro = p.traces[0] as GpTrace;
      assert.equal(p.drawnTo, rastro.from, `el nivel ${n} regaló gotas antes de caminar`);
      assert.ok(gpPoints(rastro).length >= 4, "el rastro es demasiado corto para caminarlo");
    }
  }
});
