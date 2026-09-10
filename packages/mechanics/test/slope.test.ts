import { test } from "node:test";
import assert from "node:assert/strict";
import {
  NODE_LINEAR_SLOPE,
  SL_EVIDENCE,
  SL_LAYERS,
  SL_LEVELS,
  SL_OPTION_SLOTS,
  SL_RAMP_SLOTS,
  SL_RISE_ONLY,
  SL_STEP_AS_RATE,
  TOTAL_SL_LEVELS,
  generateSlope,
  isNodeOpen,
  nodeById,
  slBetween,
  slCorners,
  slCross,
  slGap,
  slHeightAt,
  slInterceptOfWritten,
  slLevelByNumber,
  slMisconceptionFor,
  slRatioOf,
  slRatioOn,
  slReduce,
  slRests,
  slSameLine,
  slSamePair,
  slSameRatio,
  slSlopeOfWritten,
  slStepOn,
  slStretchMisconceptionFor,
  slTrace,
  slTraceTo,
  slValue,
  slVisibleRange,
  slWrite,
  type SlLevel,
  type SlProblem,
  type SlRamp,
} from "../src/index.ts";

const semillas = (n: number): number[] => Array.from({ length: n }, (_, i) => i * 53 + 11);

/** Todas las rondas de un nivel, para todas las semillas de la muestra. */
function rondas(level: SlLevel, n = 12): SlProblem[] {
  const out: SlProblem[] = [];
  for (const seed of semillas(n)) {
    for (let r = 0; r < level.rounds; r++) out.push(generateSlope(level, seed + r, r));
  }
  return out;
}

const todas = (n = 8): SlProblem[] => SL_LEVELS.flatMap((l) => rondas(l, n));

const nivel = (n: number): SlLevel => slLevelByNumber(n) as SlLevel;

/** Las rondas de un nivel que hacen una pregunta dada. */
const conPregunta = (n: number, ask: string, m = 16): SlProblem[] =>
  rondas(nivel(n), m).filter((p) => p.ask === ask);

// --- Los niveles como datos --------------------------------------------------

test("los ocho niveles del diseño están, en orden y sin repetir", () => {
  assert.equal(SL_LEVELS.length, 8);
  assert.equal(TOTAL_SL_LEVELS, 8);
  assert.deepEqual(
    SL_LEVELS.map((l) => l.n),
    [1, 2, 3, 4, 5, 6, 7, 8],
  );
});

test("cada nivel cambia la capa o endurece parámetros, nunca las dos cosas", () => {
  for (let i = 1; i < SL_LEVELS.length; i++) {
    const prev = SL_LEVELS[i - 1] as SlLevel;
    const cur = SL_LEVELS[i] as SlLevel;
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
  for (let i = 1; i < SL_LEVELS.length; i++) {
    const prev = (SL_LEVELS[i - 1] as SlLevel).params;
    const cur = (SL_LEVELS[i] as SlLevel).params;
    assert.ok(cur.maxSlope >= prev.maxSlope, `el nivel ${i + 1} achica la pendiente`);
    assert.ok(cur.maxRun >= prev.maxRun, `el nivel ${i + 1} achica el escalón`);
    assert.ok(cur.yReach >= prev.yReach, `el nivel ${i + 1} achica la ventana en alto`);
    assert.ok(
      cur.xRange[1] - cur.xRange[0] >= prev.xRange[1] - prev.xRange[0],
      `el nivel ${i + 1} achica la ventana en ancho`,
    );
    for (const bandera of ["negative", "fractional", "intercept"] as const) {
      assert.ok(
        Number(cur[bandera]) >= Number(prev[bandera]),
        `el nivel ${i + 1} apaga ${bandera}`,
      );
    }
  }
});

test("las capas van de lo real a lo formal sin saltear ni retroceder", () => {
  const orden = SL_LEVELS.map((l) => SL_LAYERS.indexOf(l.layer));
  assert.ok(orden.every((v) => v >= 0), "hay una capa fuera de las del nodo");
  for (let i = 1; i < orden.length; i++) {
    const paso = (orden[i] as number) - (orden[i - 1] as number);
    assert.ok(paso === 0 || paso === 1, `el nivel ${i + 1} salta de capa`);
  }
});

test("los cinco verbos del nodo aparecen y ninguno es de otro", () => {
  const vistos = new Set(SL_LEVELS.flatMap((l) => l.evidence));
  for (const verbo of SL_EVIDENCE) assert.ok(vistos.has(verbo), `falta evidencia de ${verbo}`);
  for (const verbo of vistos) assert.ok(SL_EVIDENCE.includes(verbo), `${verbo} no es del nodo`);
});

test("la definición corta llega sola en la capa formal", () => {
  for (const l of SL_LEVELS) assert.equal(l.definition, l.layer === "formal");
});

test("el escalón de ancho fijo es de las capas sin lectura", () => {
  // El ancho variable es la dificultad central y estrena el nivel 4: antes el
  // escalón mide uno, o el nodo pediría separar paso de pendiente sin haber
  // mostrado todavía que el paso puede cambiar.
  assert.equal(nivel(3).params.maxRun, 1);
  assert.ok(nivel(4).params.maxRun > 1);
});

test("el nodo está registrado con los prerequisitos de spine.yaml", () => {
  const spec = nodeById(NODE_LINEAR_SLOPE);
  assert.ok(spec, "el nodo no se registró");
  assert.equal(spec.n, 19);
  assert.deepEqual([...spec.prereqs].sort(), ["alg.fn.graph_as_picture", "arith.mul.scaling"]);
  assert.equal(spec.levels.length, 8);
});

test("el nodo se abre recién con los dos prerequisitos terminados", () => {
  assert.equal(isNodeOpen(NODE_LINEAR_SLOPE, {}), false);
  assert.equal(isNodeOpen(NODE_LINEAR_SLOPE, { "alg.fn.graph_as_picture": 8 }), false);
  assert.equal(
    isNodeOpen(NODE_LINEAR_SLOPE, { "alg.fn.graph_as_picture": 8, "arith.mul.scaling": 8 }),
    true,
  );
});

// --- La razón, que es el nodo entero -----------------------------------------

test("la misma cuesta se reconoce con anchos distintos y sin dividir", () => {
  assert.ok(slSameRatio({ rise: 2, run: 1 }, { rise: 6, run: 3 }));
  assert.ok(slSameRatio({ rise: 2, run: 7 }, { rise: 4, run: 14 }));
  assert.ok(!slSameRatio({ rise: 2, run: 1 }, { rise: 3, run: 1 }));
  // La misma cuesta con pares distintos: es la diferencia que el nodo enseña.
  assert.ok(!slSamePair({ rise: 2, run: 1 }, { rise: 6, run: 3 }));
});

test("reducir deja el avance positivo y sin factor común", () => {
  assert.deepEqual(slReduce({ rise: 6, run: 3 }), { rise: 2, run: 1 });
  assert.deepEqual(slReduce({ rise: -4, run: -6 }), { rise: 2, run: 3 });
  assert.deepEqual(slReduce({ rise: 4, run: -6 }), { rise: -2, run: 3 });
  assert.deepEqual(slReduce({ rise: 0, run: 5 }), { rise: 0, run: 1 });
});

test("EL INVARIANTE: la cuesta no cambia con el ancho del escalón", () => {
  // `steepness_independent_of_step_size`, ejecutable. Se prueba con enteros y
  // sin dividir ni una vez, así que ninguna igualdad depende del redondeo.
  for (const rampa of muestraDeRampas()) {
    const esperado = slReduce(rampa.slope);
    for (let run = 1; run <= 12; run++) {
      assert.ok(
        slSameRatio(slRatioOn(rampa, run), esperado),
        `con ancho ${run} la cuesta cambió en ${JSON.stringify(rampa.slope)}`,
      );
    }
  }
});

test("EL INVARIANTE: la cuesta no cambia con el lugar donde se apoya", () => {
  for (const rampa of muestraDeRampas()) {
    const esperado = slValue(rampa.slope);
    for (let from = -6; from <= 6; from++) {
      for (let run = 1; run <= 4; run++) {
        const escalon = slStepOn(rampa, from, run);
        assert.ok(slRests(rampa, escalon), "el escalón apoyado no apoya");
        assert.ok(
          Math.abs(slValue(slRatioOf(escalon)) - esperado) < 1e-9,
          `en ${from} con ancho ${run} la cuesta cambió`,
        );
      }
    }
  }
});

test("la pendiente entre dos puntos da lo mismo con cualquier par", () => {
  // La definición formal del nodo: la pendiente no depende del par elegido, y
  // esa es la definición de que la recta sea recta.
  for (const rampa of muestraDeRampas()) {
    const esperado = slReduce(rampa.slope);
    for (let a = -6; a <= 5; a++) {
      for (let b = a + 1; b <= 6; b++) {
        const entre = slBetween(
          { x: a, y: slHeightAt(rampa, a) },
          { x: b, y: slHeightAt(rampa, b) },
        );
        assert.ok(entre, "dos puntos con avance no dieron pendiente");
        assert.ok(
          Math.abs(slValue(entre) - slValue(esperado)) < 1e-9,
          `entre ${a} y ${b} la pendiente cambió`,
        );
      }
    }
  }
});

test("la pendiente leída al revés es la misma", () => {
  const a = { x: 1, y: 2 };
  const b = { x: 5, y: 10 };
  assert.deepEqual(slBetween(a, b), slBetween(b, a));
});

test("sin avance no hay pendiente: la recta vertical", () => {
  assert.equal(slBetween({ x: 3, y: -2 }, { x: 3, y: 5 }), null);
});

test("estirar el escalón duplica la subida cuando duplica el avance", () => {
  // La propiedad del documento: la pendiente es el factor de escala entre
  // avance y subida.
  for (const rampa of muestraDeRampas()) {
    for (let from = -3; from <= 3; from++) {
      const uno = slStepOn(rampa, from, 2);
      const dos = slStepOn(rampa, from, 4);
      assert.ok(Math.abs(dos.rise - 2 * uno.rise) < 1e-9);
    }
  }
});

test("dos tramos seguidos tienen la cuesta del tramo que los abarca", () => {
  for (const rampa of muestraDeRampas()) {
    const a = slStepOn(rampa, 0, 2);
    const b = slStepOn(rampa, 2, 3);
    const entero = slStepOn(rampa, 0, 5);
    assert.ok(Math.abs(a.rise + b.rise - entero.rise) < 1e-9);
  }
});

test("el escalón forzado se despega, y la sombra dice cuánto le falta", () => {
  const rampa: SlRamp = { slope: { rise: 2, run: 1 }, intercept: 0 };
  const apoyado = slStepOn(rampa, 1, 3);
  assert.ok(slRests(rampa, apoyado));
  assert.equal(slGap(rampa, apoyado), 0);

  // El error del documento hecho gesto: el escalón se ensancha y el jugador
  // deja la subida donde estaba.
  const forzado = { from: 1, run: 3, rise: 2 };
  assert.ok(!slRests(rampa, forzado));
  assert.equal(slGap(rampa, forzado), -4);
});

test("las esquinas del escalón son dos puntos de la rampa", () => {
  const rampa: SlRamp = { slope: { rise: 3, run: 2 }, intercept: 1 };
  const [a, b] = slCorners(rampa, slStepOn(rampa, 2, 4));
  assert.deepEqual(a, { x: 2, y: 4 });
  assert.deepEqual(b, { x: 6, y: 10 });
});

// --- La rampa dibujada -------------------------------------------------------

test("la rampa se dibuja como el rastro del nodo 18", () => {
  const rampa: SlRamp = { slope: { rise: 2, run: 1 }, intercept: -1 };
  const rastro = slTrace(rampa, 0, 4);
  assert.equal(rastro.from, 0);
  assert.equal(slTraceTo(rastro), 4);
  assert.deepEqual([...rastro.heights], [-1, 1, 3, 5, 7]);
  assert.deepEqual([...rastro.breaks], []);
});

test("lo que se sale de la ventana viaja como hueco y no recortado", () => {
  // Una altura recortada contra el techo sería una rampa que se acuesta al
  // llegar arriba, que es lo único que este nodo no puede dibujar.
  const rampa: SlRamp = { slope: { rise: 3, run: 1 }, intercept: 0 };
  const rastro = slTrace(rampa, 0, 5, 8);
  assert.deepEqual([...rastro.heights], [0, 3, 6, null, null, null]);
  assert.deepEqual([...slVisibleRange(rampa, 0, 5, 8)], [0, 2]);
});

test("con pendiente fraccionaria las alturas no caen en la grilla", () => {
  const rampa: SlRamp = { slope: { rise: 2, run: 7 }, intercept: 0 };
  const rastro = slTrace(rampa, 0, 7);
  assert.equal(rastro.heights[0], 0);
  assert.equal(rastro.heights[7], 2);
  assert.ok(!Number.isInteger(rastro.heights[1] as number));
});

// --- La rampa escrita --------------------------------------------------------

test("la misma recta despejada y sin despejar tiene la misma pendiente", () => {
  const rampa: SlRamp = { slope: { rise: 3, run: 2 }, intercept: -4 };
  const despejada = slWrite(rampa, "solved");
  const sinDespejar = slWrite(rampa, "unsolved");
  assert.ok(slSameLine(despejada, sinDespejar));
  for (const w of [despejada, sinDespejar]) {
    assert.ok(slSameRatio(slSlopeOfWritten(w) as never, slReduce(rampa.slope)));
    assert.equal(slInterceptOfWritten(w), -4);
  }
});

test("la recta vertical se escribe y no tiene pendiente ni ordenada", () => {
  const vertical = { form: "unsolved" as const, a: 1, b: 0, c: 3 };
  assert.equal(slSlopeOfWritten(vertical), null);
  assert.equal(slInterceptOfWritten(vertical), null);
});

test("misma pendiente y distinto arranque: no se cruzan nunca", () => {
  const m = { rise: 2, run: 3 };
  assert.equal(slCross({ slope: m, intercept: 0 }, { slope: m, intercept: 5 }), false);
  assert.equal(slCross({ slope: m, intercept: 0 }, { slope: { rise: 1, run: 3 }, intercept: 5 }), true);
  // La misma cuesta escrita con otro par tampoco cruza: es la razón y no el par.
  assert.equal(slCross({ slope: m, intercept: 0 }, { slope: { rise: 4, run: 6 }, intercept: 2 }), false);
});

// --- Los errores del catálogo ------------------------------------------------

test("la subida sola es el error del catálogo, y solo con avance distinto de uno", () => {
  const l6 = nivel(6);
  // `slope_as_rise_only`: la guarda del catálogo es `a != 1`.
  assert.equal(slMisconceptionFor(l6, { rise: 3, run: 1 }, { rise: 3, run: 2 }), SL_RISE_ONLY);
  // Con avance uno la subida sola **es** la pendiente: no hay error que anotar.
  assert.equal(slMisconceptionFor(l6, { rise: 3, run: 1 }, { rise: 3, run: 1 }), undefined);
});

test("el avance solo es el otro error, con la guarda del catálogo", () => {
  const l6 = nivel(6);
  // `slope_confuses_step_with_rate`: contestar el avance. La guarda `b != a*a`
  // impide anotarlo cuando el avance ya era la pendiente.
  assert.equal(slMisconceptionFor(l6, { rise: 2, run: 1 }, { rise: 5, run: 2 }), SL_STEP_AS_RATE);
  assert.equal(slMisconceptionFor(l6, { rise: 2, run: 1 }, { rise: 4, run: 2 }), undefined);
});

test("la guarda mira el par medido y no la pendiente reducida", () => {
  // Dos puntos separados por dos sobre una rampa que sube dos por paso: el
  // jugador midió `4 / 2`. Contestar `4` es la subida sola, que es el error del
  // catálogo. Reducir a `2 / 1` antes de mirar la guarda `a != 1` lo escondería,
  // y ese es exactamente el movimiento que el nivel tiene que clasificar.
  const l6 = nivel(6);
  assert.equal(slMisconceptionFor(l6, { rise: 4, run: 1 }, { rise: 4, run: 2 }), SL_RISE_ONLY);
  assert.equal(slMisconceptionFor(l6, { rise: 4, run: 1 }, { rise: 2, run: 1 }), undefined);
  // Y con `b = a · a` el avance solo **es** la pendiente: no hay error que anotar.
  assert.equal(slMisconceptionFor(l6, { rise: 2, run: 1 }, { rise: 4, run: 2 }), undefined);
});

test("un nivel que no declara el error no lo anota", () => {
  // La regla del repositorio: un movimiento que el nivel no está evaluando va
  // sin campo, aunque el catálogo tenga la entrada.
  assert.deepEqual(nivel(1).classifies, []);
  assert.equal(slMisconceptionFor(nivel(1), { rise: 3, run: 1 }, { rise: 3, run: 2 }), undefined);
  assert.deepEqual(nivel(8).classifies, []);
});

test("una respuesta correcta nunca viaja con error", () => {
  const l7 = nivel(7);
  assert.equal(slMisconceptionFor(l7, { rise: 6, run: 4 }, { rise: 3, run: 2 }), undefined);
});

test("un par equivocado por otro motivo va sin campo", () => {
  assert.equal(slMisconceptionFor(nivel(6), { rise: 9, run: 4 }, { rise: 3, run: 2 }), undefined);
});

test("estirar el escalón dejando la subida quieta es el error, dicho con el gesto", () => {
  const rampa: SlRamp = { slope: { rise: 2, run: 1 }, intercept: 0 };
  const unidad = slStepOn(rampa, 1, 1);
  const forzado = { from: 1, run: 3, rise: unidad.rise };
  assert.equal(slStretchMisconceptionFor(nivel(4), rampa, forzado, unidad), SL_RISE_ONLY);
  // Apoyado no hay error, y sin ensanchar tampoco: es la guarda `a != 1`.
  assert.equal(
    slStretchMisconceptionFor(nivel(4), rampa, slStepOn(rampa, 1, 3), unidad),
    undefined,
  );
  assert.equal(
    slStretchMisconceptionFor(nivel(4), rampa, { from: 1, run: 1, rise: 5 }, unidad),
    undefined,
  );
  // Y el nivel que no lo declara no lo anota.
  assert.equal(slStretchMisconceptionFor(nivel(3), rampa, forzado, unidad), undefined);
});

test("los ids de error son los dos que el catálogo apunta a este nodo", () => {
  const declarados = new Set(SL_LEVELS.flatMap((l) => l.classifies));
  assert.deepEqual([...declarados].sort(), [SL_RISE_ONLY, SL_STEP_AS_RATE].sort());
});

// --- El generador ------------------------------------------------------------

test("el generador es determinista", () => {
  for (const l of SL_LEVELS) {
    for (let r = 0; r < l.rounds; r++) {
      assert.deepEqual(generateSlope(l, 4242, r), generateSlope(l, 4242, r));
    }
  }
});

test("cada nivel hace todas sus preguntas, ciclando", () => {
  for (const l of SL_LEVELS) {
    const vistas = new Set(rondas(l).map((p) => p.ask));
    for (const ask of l.asks) assert.ok(vistas.has(ask), `el nivel ${l.n} nunca pregunta ${ask}`);
    for (const ask of vistas) assert.ok(l.asks.includes(ask), `el nivel ${l.n} preguntó ${ask}`);
  }
});

test("toda rampa generada respeta lo que su nivel habilita", () => {
  for (const l of SL_LEVELS) {
    for (const p of rondas(l)) {
      for (const rampa of p.ramps) {
        const v = slValue(rampa.slope);
        assert.ok(Math.abs(v) <= l.params.maxSlope + 1e-9, `pendiente ${v} en el nivel ${l.n}`);
        if (!l.params.negative) assert.ok(v >= 0, `el nivel ${l.n} bajó sin permiso`);
        if (!l.params.intercept) assert.equal(rampa.intercept, 0, `el nivel ${l.n} movió el arranque`);
        if (!l.params.fractional) {
          assert.equal(slReduce(rampa.slope).run, 1, `el nivel ${l.n} fraccionó sin permiso`);
        }
      }
    }
  }
});

test("toda rampa generada se puede medir dentro de la ventana", () => {
  // Una rampa que asoma por una esquina no se puede medir apoyando el escalón,
  // y medirla apoyando el escalón es el nodo entero.
  for (const l of SL_LEVELS) {
    for (const p of rondas(l)) {
      const [lo, hi] = slVisibleRange(p.ramp, p.xRange[0], p.xRange[1], l.params.yReach);
      assert.ok(hi - lo >= 1, `la rampa del nivel ${l.n} no entra en la ventana`);
    }
  }
});

test("el escalón de la ronda arranca apoyado y adentro de la ventana", () => {
  for (const l of SL_LEVELS) {
    for (const p of rondas(l)) {
      // El de `stretch_step` llega despegado a propósito: es el error ya
      // cometido, esperando al jugador.
      if (p.ask === "stretch_step") {
        assert.ok(!slRests(p.ramp, p.step), "el escalón del nivel 4 llegó apoyado");
        continue;
      }
      if (p.ramps.length === 0) continue;
      assert.ok(slRests(p.ramp, p.step), `el escalón del nivel ${l.n} no apoya`);
      // El de `slope_between` abarca los dos puntos marcados, que es lo que se
      // pregunta: su ancho lo decide el par y no el tope del estirado.
      if (p.ask !== "slope_between") {
        assert.ok(p.step.run >= 1 && p.step.run <= l.params.maxRun);
      }
    }
  }
});

test("las tres rampas candidatas tienen cuestas distintas", () => {
  for (const n of [1, 2]) {
    for (const p of rondas(nivel(n), 20)) {
      assert.equal(p.ramps.length, SL_RAMP_SLOTS);
      for (let i = 0; i < p.ramps.length; i++) {
        for (let j = i + 1; j < p.ramps.length; j++) {
          assert.ok(
            !slSameRatio((p.ramps[i] as SlRamp).slope, (p.ramps[j] as SlRamp).slope),
            "dos candidatas con la misma cuesta: elegir bien o mal sería lo mismo",
          );
        }
      }
      assert.ok(p.correct >= 0 && p.correct < p.ramps.length);
    }
  }
});

test("la pendiente correcta está entre las razones escritas, una sola vez", () => {
  for (const p of conPregunta(7, "slope_between")) {
    assert.equal(p.options.length, SL_OPTION_SLOTS);
    const verdadera = slReduce(p.ramp.slope);
    const iguales = p.options.filter((r) => slSameRatio(r, verdadera));
    assert.equal(iguales.length, 1, "la respuesta aparece más de una vez");
    assert.ok(slSameRatio(p.options[p.correct] as never, verdadera));
  }
});

test("los distractores de la pendiente son los errores del catálogo", () => {
  // Con avance distinto de uno, la subida sola y el avance solo tienen que
  // estar entre las opciones: son los dos errores que el nivel clasifica.
  let vistos = 0;
  for (const p of conPregunta(6, "slope_between", 24)) {
    const a = p.points[0];
    const b = p.points[1];
    if (!a || !b || b.x - a.x === 1) continue;
    vistos++;
    const subida = { rise: b.y - a.y, run: 1 };
    assert.ok(
      p.options.some((r) => slSameRatio(r, subida)),
      "falta la subida sola entre los distractores",
    );
  }
  assert.ok(vistos > 0, "ninguna ronda tuvo avance distinto de uno");
});

test("los dos puntos marcados caen en cruces de la grilla y adentro de la hoja", () => {
  for (const l of SL_LEVELS) {
    for (const p of rondas(l)) {
      if (p.ask !== "slope_between" && p.ask !== "set_sliders") continue;
      assert.equal(p.points.length, 2);
      for (const q of p.points) {
        assert.ok(Number.isInteger(q.x), "una posición rota");
        assert.ok(Number.isInteger(q.y), "una altura rota");
        assert.ok(Math.abs(q.y) <= l.params.yReach, "un punto fuera de la hoja");
        assert.ok(q.x >= p.xRange[0] && q.x <= p.xRange[1], "un punto fuera del recorrido");
      }
      const [a, b] = p.points;
      assert.ok((b?.x ?? 0) > (a?.x ?? 0), "los puntos vienen al revés");
    }
  }
});

test("los dos puntos están sobre la rampa de la ronda", () => {
  for (const p of todas(10)) {
    if (p.ask !== "slope_between" && p.ask !== "set_sliders") continue;
    for (const q of p.points) {
      assert.ok(Math.abs(slHeightAt(p.ramp, q.x) - q.y) < 1e-9, "un punto fuera de la rampa");
    }
  }
});

test("el escalón que hay que igualar está en otro lugar de la rampa", () => {
  for (const p of conPregunta(4, "stretch_step", 20)) {
    assert.ok(p.other, "la superposición no trajo el segundo escalón");
    assert.ok(slRests(p.ramp, p.other), "el segundo escalón no apoya");
    assert.ok(Math.abs(p.other.from - p.step.from) >= 1, "los dos escalones están en el mismo lugar");
  }
});

test("las formas escritas son la misma recta, salvo la que no lo es", () => {
  for (const p of conPregunta(7, "read_form")) {
    const [despejada, sinDespejar, ajena] = p.written;
    assert.ok(despejada && sinDespejar && ajena);
    assert.equal(despejada.form, "solved");
    assert.equal(sinDespejar.form, "unsolved");
    assert.ok(slSameLine(despejada, sinDespejar), "las dos formas no son la misma recta");
    assert.ok(!slSameLine(despejada, ajena), "la tercera forma es la misma recta");
    assert.ok(slSameRatio(p.options[p.correct] as never, slReduce(p.ramp.slope)));
  }
});

test("el nivel final recorre los cuatro casos del documento", () => {
  const casos = new Set(conPregunta(8, "judge_slope", 30).map((p) => p.kase));
  assert.deepEqual([...casos].sort(), ["crossing", "flat", "parallel", "vertical"]);
});

test("la rampa plana tiene pendiente cero y sigue siendo una función", () => {
  for (const p of conPregunta(8, "judge_slope", 30)) {
    if (p.kase !== "flat") continue;
    assert.equal(slValue(p.ramp.slope), 0);
    assert.ok(slRests(p.ramp, p.step));
    // Y nunca sobre el eje: acostada en el cero, la recta que se pregunta se
    // dibujaría encima del eje horizontal y desaparecería.
    assert.notEqual(p.ramp.intercept, 0);
  }
});

test("la vertical del nivel final no tiene pendiente y no viaja como rampa", () => {
  let vistas = 0;
  for (const p of conPregunta(8, "judge_slope", 30)) {
    if (p.kase !== "vertical") continue;
    vistas++;
    assert.equal(p.ramps.length, 0, "la vertical se dibujó como rampa");
    const escrita = p.written[0];
    assert.ok(escrita);
    assert.equal(slSlopeOfWritten(escrita), null);
    assert.notEqual(p.points[0]?.x, 0, "la vertical se paró encima del eje");
    const [a, b] = p.points;
    assert.equal(slBetween(a as never, b as never), null);
  }
  assert.ok(vistas > 0);
});

test("las dos rectas paralelas comparten la cuesta y no se cruzan", () => {
  for (const p of conPregunta(8, "judge_slope", 30)) {
    if (p.kase !== "parallel" && p.kase !== "crossing") continue;
    const [u, v] = p.ramps;
    assert.ok(u && v);
    assert.equal(slCross(u, v), p.kase === "crossing");
    if (p.kase === "parallel") assert.notEqual(u.intercept, v.intercept);
    // Ninguna de las dos es plana: la plana es el caso `flat`, que se pregunta
    // aparte, y dibujada acá se acostaría sobre el eje y desaparecería.
    assert.notEqual(slValue(u.slope), 0);
    assert.notEqual(slValue(v.slope), 0);
  }
});

test("estirar la grilla acuesta la rampa: la cuesta queda dividida por el factor", () => {
  for (const p of conPregunta(5, "stretch_grid", 20)) {
    assert.ok(p.stretch >= 2, "el estirado no estira");
    const objetivo = p.points[0];
    assert.ok(objetivo);
    // El punto al que hay que llevar la rampa está donde cae el paso uno
    // después de estirar: misma altura, avance multiplicado.
    assert.ok(Math.abs(slHeightAt(p.ramp, p.step.from + 1) - objetivo.y) < 1e-9);
    assert.equal(objetivo.x, p.stretch * (p.step.from + 1));
  }
});

test("la manivela pide al menos dos vueltas", () => {
  for (const p of conPregunta(5, "crank", 20)) {
    assert.ok(p.turns >= 2 && p.turns <= 5, `vueltas ${p.turns}`);
  }
});

test("ninguna ronda deja campos de otra pregunta encendidos", () => {
  for (const p of todas(10)) {
    if (p.ask !== "slope_between" && p.ask !== "read_form") assert.equal(p.options.length, 0);
    if (p.ask !== "stretch_step") assert.equal(p.other, null);
    if (p.ask !== "crank") assert.equal(p.turns, 0);
    if (p.ask !== "stretch_grid") assert.equal(p.stretch, 1);
  }
});

// --- Muestra -----------------------------------------------------------------

/** Rampas de todos los sabores que el nodo dibuja, para los invariantes. */
function muestraDeRampas(): readonly SlRamp[] {
  const out: SlRamp[] = [];
  for (const rise of [-4, -3, -1, 0, 1, 2, 5]) {
    for (const run of [1, 2, 3, 7]) {
      for (const intercept of [-3, 0, 4]) {
        out.push({ slope: slReduce({ rise, run }), intercept });
      }
    }
  }
  return out;
}
