import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MIS_DOUBLE_FLIP,
  NEG_CHIP_SLOTS,
  NEG_LEVELS,
  NEG_ROW_LENGTH,
  NODE_NEGATIVES,
  generateNegatives,
  negDistance,
  negFacingAfter,
  negLevelByNumber,
  negNameAt,
  negNet,
  negOpposite,
  negRowAnswer,
  negWalk,
  nodeById,
  type NegLevel,
} from "../src/index.ts";

const semillas = (n: number): number[] => Array.from({ length: n }, (_, i) => i * 7 + 1);
const nivel = (n: number): NegLevel => negLevelByNumber(n) as NegLevel;

// --- Los niveles -------------------------------------------------------------

test("los ocho niveles del diseño están, en orden y sin repetir", () => {
  assert.equal(NEG_LEVELS.length, 8);
  assert.deepEqual(NEG_LEVELS.map((l) => l.n), [1, 2, 3, 4, 5, 6, 7, 8]);
});

test("cada nivel cambia la capa o endurece parámetros, nunca las dos cosas", () => {
  for (let i = 1; i < NEG_LEVELS.length; i++) {
    const prev = NEG_LEVELS[i - 1] as NegLevel;
    const cur = NEG_LEVELS[i] as NegLevel;
    const cambioCapa = prev.layer !== cur.layer;
    const cambioParams = JSON.stringify(prev.params) !== JSON.stringify(cur.params);
    assert.ok(
      !(cambioCapa && cambioParams),
      `el nivel ${cur.n} cambia la capa y los parámetros a la vez`,
    );
  }
});

test("las capas y los verbos son los que declara el YAML del minijuego", () => {
  assert.deepEqual(
    NEG_LEVELS.map((l) => l.layer),
    ["concrete", "concrete", "concrete", "visual", "symbolic", "symbolic", "symbolic", "formal"],
  );
  assert.deepEqual(NEG_LEVELS.map((l) => [...l.evidence]), [
    ["manipulate"],
    ["recognize"],
    ["manipulate"],
    ["explain", "manipulate"],
    ["manipulate", "apply"],
    ["apply"],
    ["apply"],
    ["generalize"],
  ]);
});

test("ningún parámetro se ablanda al avanzar de nivel", () => {
  for (let i = 1; i < NEG_LEVELS.length; i++) {
    const prev = (NEG_LEVELS[i - 1] as NegLevel).params;
    const cur = (NEG_LEVELS[i] as NegLevel).params;
    assert.ok(cur.range >= prev.range, `el nivel ${i + 1} achica la pista`);
    assert.ok(cur.step[1] >= prev.step[1], `el nivel ${i + 1} achica el tramo`);
    assert.ok(!prev.zeroOffset || cur.zeroOffset, `el nivel ${i + 1} devuelve el cero al medio`);
    assert.ok(!prev.bothBelow || cur.bothBelow, `el nivel ${i + 1} saca el caso de dos negativos`);
  }
});

test("hasta el nivel 4 no hay ningún numeral en pantalla", () => {
  for (const n of [1, 2, 3, 4]) assert.equal(nivel(n).numerals, false);
  for (const n of [5, 6, 7]) assert.equal(nivel(n).numerals, true);
  // La fila de dibujos vuelve a no llevar numerales: eso es lo que prueba.
  assert.equal(nivel(8).numerals, false);
});

test("el edificio entra en el 2, se pide con un toque en el 6 y ya no está en el 8", () => {
  assert.equal(nivel(1).building, "none");
  for (const n of [2, 3, 4, 5]) assert.equal(nivel(n).building, "shown");
  for (const n of [6, 7]) assert.equal(nivel(n).building, "onDemand");
  assert.equal(nivel(8).building, "none");
});

test("el tablero y la vuelta doble aparecen donde el diseño los pone", () => {
  assert.deepEqual(NEG_LEVELS.filter((l) => l.board).map((l) => l.n), [3]);
  assert.deepEqual(NEG_LEVELS.filter((l) => l.explain).map((l) => l.n), [4]);
  assert.deepEqual(NEG_LEVELS.filter((l) => l.flip).map((l) => l.n), [4]);
});

test("el nodo está registrado en la espina con su prerequisito", () => {
  const spec = nodeById(NODE_NEGATIVES);
  assert.ok(spec);
  assert.equal(spec.n, 7);
  assert.deepEqual([...spec.prereqs], ["arith.sub.undo_add"]);
  assert.equal(spec.levels.length, 8);
});

test("el único error catalogado del nodo es el de la vuelta doble", () => {
  assert.equal(MIS_DOUBLE_FLIP, "negative_times_negative");
});

// --- El modelo ---------------------------------------------------------------

test("el paso mide lo mismo de los dos lados del cero", () => {
  const slots = 13;
  const zero = 6;
  for (let from = 0; from < slots; from++) {
    for (let teeth = -4; teeth <= 4; teeth++) {
      const destino = negWalk(from, teeth, slots);
      if (destino !== from + teeth) continue;
      // El nombre se mueve exactamente lo mismo que el índice, esté del lado
      // que esté: la pista no se estira ni se comprime al cruzar.
      assert.equal(negNameAt(destino, zero) - negNameAt(from, zero), teeth);
    }
  }
});

test("un tirón de varios dientes deja al caminante donde lo dejarían los de a uno", () => {
  for (let from = 0; from <= 12; from++) {
    for (let teeth = -5; teeth <= 5; teeth++) {
      let unoAUno = from;
      for (let i = 0; i < Math.abs(teeth); i++) unoAUno = negWalk(unoAUno, Math.sign(teeth), 13);
      assert.equal(negWalk(from, teeth, 13), unoAUno, `${from} ${teeth}`);
    }
  }
});

test("la pista se termina donde se termina el dibujo, no en el cero", () => {
  // El tope del nodo 4 era la orilla; acá la orilla ya no existe y lo único que
  // frena es el borde de lo dibujado.
  assert.equal(negWalk(3, -9, 13), 0);
  assert.equal(negWalk(9, 9, 13), 12);
});

test("el opuesto está a la misma distancia del cero y del otro lado", () => {
  for (let n = -9; n <= 9; n++) {
    assert.equal(negDistance(negOpposite(n), 0), negDistance(n, 0));
    assert.equal(negOpposite(negOpposite(n)), n);
  }
  // El cero es su propio opuesto y el único sin lado.
  assert.equal(negOpposite(0), 0);
});

test("dos vueltas devuelven la dirección original", () => {
  for (const facing of [1, -1]) {
    assert.equal(negFacingAfter(facing, 1), -facing);
    assert.equal(negFacingAfter(facing, 2), facing);
    assert.equal(negFacingAfter(facing, 3), -facing);
    assert.equal(negFacingAfter(facing, 4), facing);
  }
});

test("la distancia entre dos pisos no depende de dónde esté el cero", () => {
  for (let zero = 0; zero <= 12; zero++) {
    for (const [a, b] of [[2, 9], [0, 12], [5, 5], [11, 3]] as const) {
      assert.equal(negDistance(negNameAt(a, zero), negNameAt(b, zero)), negDistance(a, b));
    }
  }
});

test("el neto no cambia si se agregan pares de moneda y vale", () => {
  const base = [
    { id: "a", value: -3 },
    { id: "b", value: 1 },
  ];
  assert.equal(negNet(base), -2);
  const conPar = [...base, { id: "c", value: 2 }, { id: "d", value: -2 }];
  assert.equal(negNet(conPar), -2);
});

// --- El generador ------------------------------------------------------------

test("la misma semilla da la misma instancia", () => {
  for (const l of NEG_LEVELS) {
    assert.deepEqual(generateNegatives(l, 99), generateNegatives(l, 99));
  }
});

test("todo lo que el generador ubica cae dentro de lo dibujado", () => {
  for (const l of NEG_LEVELS) {
    for (const s of semillas(60)) {
      const p = generateNegatives(l, s);
      const dentro = (i: number): boolean => i >= 0 && i < p.slots;
      assert.ok(dentro(p.start), `nivel ${l.n}: la partida se fue de la pista`);
      assert.ok(dentro(p.target), `nivel ${l.n}: la llegada se fue de la pista`);
      assert.ok(dentro(p.zeroAt), `nivel ${l.n}: la calle se fue de la pista`);
      assert.ok(p.moveTo === null || dentro(p.moveTo), `nivel ${l.n}: la mudanza se fue`);
      for (const f of p.floors) assert.ok(dentro(f), `nivel ${l.n}: un piso se fue del edificio`);
    }
  }
});

test("el viaje de los niveles que se caminan sale de un lado del cero y termina del otro", () => {
  for (const n of [1, 4]) {
    const l = nivel(n);
    for (const s of semillas(40)) {
      const p = generateNegatives(l, s);
      assert.ok(p.start > p.zeroAt, `nivel ${n}: no sale del lado derecho`);
      assert.ok(p.target < p.zeroAt, `nivel ${n}: no termina del lado izquierdo`);
      assert.ok(p.step < 0, `nivel ${n}: el tramo no va hacia la izquierda`);
    }
  }
});

test("el nivel que anticipa pone al caminante en el cero y la llegada en un subsuelo", () => {
  const l = nivel(2);
  for (const s of semillas(40)) {
    const p = generateNegatives(l, s);
    assert.equal(negNameAt(p.start, p.zeroAt), 0);
    assert.ok(negNameAt(p.target, p.zeroAt) < 0);
    assert.equal(p.answer, p.target);
  }
});

test("el tablero siempre se puede resolver, y el neto pedido es una deuda", () => {
  const l = nivel(3);
  for (const s of semillas(60)) {
    const p = generateNegatives(l, s);
    assert.ok(p.netTarget < 0, "el neto pedido no es una deuda");
    assert.ok(p.tokens.length > 0);
    // Existe un subconjunto de la bandeja que da el neto pedido: si no, el
    // nivel sería injugable y ningún mensaje podría arreglarlo.
    const sumas = new Set<number>([0]);
    for (const t of p.tokens) {
      for (const acc of [...sumas]) sumas.add(acc + t.value);
    }
    assert.ok(sumas.has(p.netTarget), `no hay manera de llegar a ${p.netTarget}`);
  }
});

test("la bandeja trae una moneda y un vale del mismo tamaño, para que la cancelación exista", () => {
  const l = nivel(3);
  for (const s of semillas(40)) {
    const p = generateNegatives(l, s);
    const hayPar = p.tokens.some((a) => p.tokens.some((b) => b.value === -a.value && a.value > 0));
    assert.ok(hayPar, "no hay ningún par que se pueda apagar");
  }
});

test("comparar elige el piso más bajo, y la otra ficha es la del error de tamaño", () => {
  for (const n of [5, 7]) {
    const l = nivel(n);
    for (const s of semillas(40)) {
      const p = generateNegatives(l, s);
      assert.equal(p.chips.length, 2);
      const correcta = p.chips.filter((c) => c.correct);
      assert.equal(correcta.length, 1);
      assert.equal(correcta[0]?.value, p.answer);
      assert.equal(p.answer, Math.min(...p.chips.map((c) => c.value)));
    }
  }
});

test("el nivel de la calle mudada la manda a otra altura y deja las dos paradas abajo", () => {
  const l = nivel(7);
  for (const s of semillas(40)) {
    const p = generateNegatives(l, s);
    assert.ok(p.moveTo !== null);
    assert.notEqual(p.moveTo, p.zeroAt);
    const zero = p.moveTo as number;
    for (const f of p.floors) assert.ok(f < zero, "un piso no quedó abajo del cero nuevo");
  }
});

test("medir devuelve los pisos entre las dos paradas y nunca los confunde con el error", () => {
  const l = nivel(6);
  for (const s of semillas(60)) {
    const p = generateNegatives(l, s);
    assert.equal(p.answer, negDistance(p.floors[0], p.floors[1]));
    const correctas = p.chips.filter((c) => c.correct);
    assert.equal(correctas.length, 1, "hay más de una ficha correcta");
    assert.equal(correctas[0]?.value, p.answer);
    assert.ok(p.chips.length <= NEG_CHIP_SLOTS);
    // Ninguna ficha del cajón se repite: dos iguales harían que una correcta
    // pareciera equivocada.
    assert.equal(new Set(p.chips.map((c) => c.value)).size, p.chips.length);
  }
});

test("la fila de dibujos cae dentro de la fila y no usa ningún numeral", () => {
  const l = nivel(8);
  for (const s of semillas(60)) {
    const p = generateNegatives(l, s);
    assert.equal(p.row.length, NEG_ROW_LENGTH);
    assert.ok(p.row.steps >= 1);
    const destino = negRowAnswer(p.row);
    assert.ok(destino >= 0 && destino < p.row.length, "el dibujo pedido se fue de la fila");
    assert.notEqual(destino, p.row.origin);
    assert.equal(p.answer, destino);
  }
});

test("ninguna instancia inventa un error de catálogo: los señuelos no clasifican", () => {
  const catalogados = new Set([MIS_DOUBLE_FLIP]);
  for (const l of NEG_LEVELS) {
    for (const s of semillas(30)) {
      const p = generateNegatives(l, s);
      for (const c of p.chips) {
        if (c.lure === undefined) continue;
        assert.ok(!catalogados.has(c.lure), `el señuelo ${c.lure} se está haciendo pasar por L`);
      }
    }
  }
});
