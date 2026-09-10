import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CHIP_SLOTS,
  MAX_TRACK,
  TRIP_LEVELS,
  generateTrip,
  jumpWith,
  legsTotal,
  tripLevelByNumber,
  type TripLevel,
} from "../src/index.ts";

const seeds = (n: number): number[] => Array.from({ length: n }, (_, i) => i);
const nivel = (n: number): TripLevel => tripLevelByNumber(n) as TripLevel;

// --- Los niveles -------------------------------------------------------------

test("los siete niveles del diseño están, en orden y sin repetir", () => {
  assert.equal(TRIP_LEVELS.length, 7);
  assert.deepEqual(TRIP_LEVELS.map((l) => l.n), [1, 2, 3, 4, 5, 6, 7]);
});

test("cada nivel cambia la capa o endurece parámetros, nunca las dos cosas", () => {
  for (let i = 1; i < TRIP_LEVELS.length; i++) {
    const prev = TRIP_LEVELS[i - 1] as TripLevel;
    const cur = TRIP_LEVELS[i] as TripLevel;
    const cambioCapa = prev.layer !== cur.layer;
    const cambioParams = JSON.stringify(prev.params) !== JSON.stringify(cur.params);
    assert.ok(
      !(cambioCapa && cambioParams),
      `el nivel ${cur.n} cambia la capa y los parámetros a la vez`,
    );
  }
});

test("el viaje nunca se acorta ni pierde tramos al avanzar de nivel", () => {
  for (let i = 1; i < TRIP_LEVELS.length; i++) {
    const prev = (TRIP_LEVELS[i - 1] as TripLevel).params;
    const cur = (TRIP_LEVELS[i] as TripLevel).params;
    assert.ok(cur.legs[1] >= prev.legs[1], `el nivel ${i + 1} saca tramos`);
    assert.ok(cur.stepRange[1] >= prev.stepRange[1], `el nivel ${i + 1} achica los tramos`);
    assert.ok(cur.start[1] >= prev.start[1], `el nivel ${i + 1} acerca la partida a la orilla`);
  }
});

test("el nodo recorre las tres capas y termina en símbolos, sin `formal` ni `abstract`", () => {
  for (const l of TRIP_LEVELS) {
    assert.ok(l.layer === "concrete" || l.layer === "visual" || l.layer === "symbolic");
  }
  assert.equal((TRIP_LEVELS[0] as TripLevel).layer, "concrete");
  assert.equal((TRIP_LEVELS[TRIP_LEVELS.length - 1] as TripLevel).layer, "symbolic");
});

test("el cero y el sumando desconocido llegan recién al final, y en niveles distintos", () => {
  for (const n of [1, 2, 3, 4, 5]) assert.equal(nivel(n).params.allowZeroStep, false);
  assert.equal(nivel(6).params.allowZeroStep, true);
  for (const n of [1, 2, 3, 4, 5, 6]) assert.equal(nivel(n).params.unknown, "none");
  assert.equal(nivel(7).params.unknown, "addend");
});

test("el libro aparece con la pista y se retira cuando queda el renglón", () => {
  for (const n of [1, 2, 3, 4]) assert.equal(nivel(n).ledger, true);
  for (const n of [5, 6, 7]) assert.equal(nivel(n).row, true);
  // El intercambio de filas necesita dos filas: no puede existir antes del 3.
  assert.deepEqual(TRIP_LEVELS.filter((l) => l.swap).map((l) => l.n), [3, 4]);
});

// --- La manivela -------------------------------------------------------------

test("un tirón de varios dientes deja al caminante donde lo dejarían los tirones de a uno", () => {
  for (let from = 0; from <= 8; from++) {
    for (let teeth = 0; teeth <= 9; teeth++) {
      let unoAUno = from;
      for (let i = 0; i < teeth; i++) unoAUno = jumpWith(unoAUno, 1, 20);
      assert.equal(jumpWith(from, teeth, 20), unoAUno, `${from} + ${teeth}`);
    }
  }
});

test("girar al revés deshace el viaje: el estado nunca se borra", () => {
  for (let from = 2; from <= 9; from++) {
    for (let teeth = 1; teeth <= 5; teeth++) {
      const ida = jumpWith(from, teeth, 20);
      assert.equal(jumpWith(ida, -teeth, 20), from, `${from} +${teeth} -${teeth}`);
    }
  }
});

test("un tramo de cero no mueve al caminante", () => {
  for (let from = 0; from <= 9; from++) assert.equal(jumpWith(from, 0, 20), from);
});

test("el orden de los dos tramos no cambia la piedra de llegada", () => {
  for (let start = 0; start <= 9; start++) {
    for (let a = 0; a <= 6; a++) {
      for (let b = 0; b <= 6; b++) {
        assert.equal(jumpWith(jumpWith(start, a, 40), b, 40), jumpWith(jumpWith(start, b, 40), a, 40));
      }
    }
  }
});

// --- El generador ------------------------------------------------------------

test("la misma semilla da el mismo viaje", () => {
  for (const l of TRIP_LEVELS) {
    assert.deepEqual(generateTrip(l, 4242), generateTrip(l, 4242), `el nivel ${l.n} no es reproducible`);
  }
});

test("semillas distintas dan viajes distintos", () => {
  const vistos = new Set(seeds(40).map((s) => JSON.stringify(generateTrip(nivel(6), s))));
  assert.ok(vistos.size > 25, `poca variedad: solo ${vistos.size} viajes en 40 semillas`);
});

test("la llegada es siempre la partida más los tramos, y cae dentro de la pista", () => {
  for (const l of TRIP_LEVELS) {
    for (const s of seeds(80)) {
      const t = generateTrip(l, s);
      assert.equal(t.arrival, t.start + legsTotal(t.steps), `nivel ${l.n} semilla ${s}`);
      assert.equal(t.flag, t.arrival, "la bandera de este nodo es la llegada");
      assert.ok(t.arrival < t.length, `nivel ${l.n} semilla ${s}: bandera fuera de la pista`);
      assert.ok(t.length <= MAX_TRACK, `nivel ${l.n} semilla ${s}: pista de ${t.length} piedras`);
      assert.ok(t.arrival > t.start, "un viaje que no avanza no tiene nada que mostrar");
    }
  }
});

test("cada nivel respeta los tramos que declara", () => {
  for (const l of TRIP_LEVELS) {
    for (const s of seeds(80)) {
      const t = generateTrip(l, s);
      assert.ok(
        t.steps.length >= l.params.legs[0] && t.steps.length <= l.params.legs[1],
        `nivel ${l.n} semilla ${s}: ${t.steps.length} tramos`,
      );
      for (const paso of t.steps) {
        assert.ok(Number.isInteger(paso), "un tramo es una cuenta de dientes, no una fracción");
        assert.ok(paso >= 0 && paso <= l.params.stepRange[1], `nivel ${l.n}: tramo de ${paso}`);
        if (!l.params.allowZeroStep) assert.ok(paso > 0, `nivel ${l.n}: tramo de cero antes de tiempo`);
      }
    }
  }
});

test("el caminante sale de la orilla en el primer nivel y de cualquier piedra después", () => {
  for (const s of seeds(40)) assert.equal(generateTrip(nivel(1), s).start, 0);
  const partidas = new Set(seeds(60).map((s) => generateTrip(nivel(2), s).start));
  assert.ok(partidas.size > 2, "en el nivel que anticipa la partida tiene que moverse");
  assert.ok([...partidas].some((p) => p > 0), "si siempre saliera del cero, el tramo sería la llegada");
});

test("el nivel de los números grandes trae ceros y tres tramos", () => {
  const vistos = { cero: false, tres: false, grande: false };
  for (const s of seeds(120)) {
    const t = generateTrip(nivel(6), s);
    if (t.steps.includes(0)) vistos.cero = true;
    if (t.steps.length === 3) vistos.tres = true;
    if (t.steps.some((x) => x > 9)) vistos.grande = true;
  }
  assert.deepEqual(vistos, { cero: true, tres: true, grande: true });
});

test("el tramo tapado existe solo en el último nivel, y nunca es un cero", () => {
  for (const n of [1, 2, 3, 4, 5, 6]) {
    for (const s of seeds(30)) assert.equal(generateTrip(nivel(n), s).hidden, -1);
  }
  for (const s of seeds(80)) {
    const t = generateTrip(nivel(7), s);
    assert.ok(t.hidden >= 0 && t.hidden < t.steps.length, `semilla ${s}: hueco fuera de los tramos`);
    assert.ok((t.steps[t.hidden] as number) > 0, "un hueco de cero no pregunta nada");
    assert.equal(t.answer, t.steps[t.hidden], "lo que falta es el tramo, no la llegada");
  }
});

test("los dibujos arbitrarios aparecen solo en el último nivel", () => {
  for (const n of [1, 2, 3, 4, 5, 6]) {
    for (const s of seeds(20)) assert.equal(generateTrip(nivel(n), s).numerals, true);
  }
  const sinNumerales = seeds(40).filter((s) => !generateTrip(nivel(7), s).numerals);
  assert.ok(sinNumerales.length > 5, "el nivel 7 tiene que jugarse a veces sin numerales");
});

// --- El cajón de fichas ------------------------------------------------------

test("el nivel que anticipa no trae cajón: se contesta tocando una piedra", () => {
  for (const s of seeds(30)) assert.deepEqual(generateTrip(nivel(2), s).tiles, []);
});

test("el cajón nunca repite un numeral ni pasa de sus ranuras", () => {
  for (const l of TRIP_LEVELS) {
    for (const s of seeds(60)) {
      const t = generateTrip(l, s);
      assert.equal(new Set(t.tiles.map((c) => c.value)).size, t.tiles.length, `nivel ${l.n}`);
      assert.ok(t.tiles.length <= CHIP_SLOTS, `nivel ${l.n}: ${t.tiles.length} fichas`);
      for (const c of t.tiles) assert.ok(c.value >= 0, "no hay fichas negativas hasta el nodo 7");
    }
  }
});

test("en los niveles que se caminan el cajón tiene la ficha de cada tramo", () => {
  for (const n of [1, 3, 4]) {
    for (const s of seeds(60)) {
      const t = generateTrip(nivel(n), s);
      for (const paso of t.steps) {
        assert.ok(
          t.tiles.some((c) => c.value === paso && c.correct),
          `nivel ${n} semilla ${s}: falta la ficha del tramo ${paso}`,
        );
      }
      assert.ok(t.tiles.some((c) => !c.correct), "sin distractores no hay nada que elegir");
    }
  }
});

test("el tramo único que hace el viaje de un tirón aparece recién con la flecha", () => {
  for (const s of seeds(60)) {
    const t3 = generateTrip(nivel(3), s);
    assert.ok(
      !t3.tiles.some((c) => c.value === legsTotal(t3.steps) && c.correct && !t3.steps.includes(c.value)),
      `semilla ${s}: el nivel de los dos tramos ofrece el atajo`,
    );
    const t4 = generateTrip(nivel(4), s);
    assert.equal(t4.answer, legsTotal(t4.steps));
    assert.ok(t4.tiles.some((c) => c.value === t4.answer && c.correct));
  }
});

test("en el renglón se contesta la llegada, salvo cuando lo que falta es un tramo", () => {
  for (const n of [5, 6]) {
    for (const s of seeds(60)) {
      const t = generateTrip(nivel(n), s);
      assert.equal(t.answer, t.arrival);
      assert.equal(t.tiles.filter((c) => c.correct).length, 1, "el renglón tiene una sola respuesta");
      assert.ok(t.tiles.some((c) => c.value === t.answer && c.correct));
    }
  }
});

test("la ficha de la llegada es el señuelo del sumando faltante, y es la que clasifica", () => {
  let clasificadas = 0;
  for (const s of seeds(80)) {
    const t = generateTrip(nivel(7), s);
    const llegada = t.tiles.find((c) => c.value === t.arrival);
    if (t.arrival === t.answer) continue;
    assert.ok(llegada, `semilla ${s}: sin la ficha de la llegada no se puede cometer el error`);
    assert.equal(llegada.correct, false);
    assert.equal(llegada.lure, "equals_as_operator");
    clasificadas++;
  }
  assert.ok(clasificadas > 60, "el señuelo del nodo tiene que estar casi siempre");
});

test("`equals_as_operator` es el único señuelo catalogado: los otros no clasifican", () => {
  for (const l of TRIP_LEVELS) {
    for (const s of seeds(40)) {
      for (const c of generateTrip(l, s).tiles) {
        if (c.correct) continue;
        assert.ok(
          c.lure === "equals_as_operator" || c.lure === "off_by_one" || c.lure === "answer_is_an_addend",
          `nivel ${l.n}: señuelo desconocido ${String(c.lure)}`,
        );
        if (c.lure === "equals_as_operator") {
          assert.equal(l.params.unknown, "addend", "la llegada solo engaña donde falta un tramo");
        }
      }
    }
  }
});

// --- Las dos animaciones de `explain` ----------------------------------------

test("el que miente no está siempre en la misma fila", () => {
  const filas = new Set(seeds(40).map((s) => generateTrip(nivel(3), s).liar));
  assert.deepEqual([...filas].sort(), [0, 1]);
});
