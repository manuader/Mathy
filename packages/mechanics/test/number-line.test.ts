import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PATH_LEVELS,
  TEETH_PER_TURN,
  crankStep,
  generatePath,
  nearestStone,
  pathLevelByNumber,
  teethFromTurn,
  type PathLevel,
} from "../src/index.ts";

const seeds = (n: number): number[] => Array.from({ length: n }, (_, i) => i);

test("los seis niveles del diseño están, en orden y sin repetir", () => {
  assert.equal(PATH_LEVELS.length, 6);
  assert.deepEqual(PATH_LEVELS.map((l) => l.n), [1, 2, 3, 4, 5, 6]);
});

test("cada nivel cambia la capa o endurece parámetros, nunca las dos cosas", () => {
  for (let i = 1; i < PATH_LEVELS.length; i++) {
    const prev = PATH_LEVELS[i - 1] as PathLevel;
    const cur = PATH_LEVELS[i] as PathLevel;
    const cambioCapa = prev.layer !== cur.layer;
    const cambioParams = JSON.stringify(prev.params) !== JSON.stringify(cur.params);
    assert.ok(
      !(cambioCapa && cambioParams),
      `el nivel ${cur.n} cambia la capa y los parámetros a la vez`,
    );
  }
});

test("la pista nunca se acorta ni pierde huecos al avanzar de nivel", () => {
  for (let i = 1; i < PATH_LEVELS.length; i++) {
    const prev = (PATH_LEVELS[i - 1] as PathLevel).params;
    const cur = (PATH_LEVELS[i] as PathLevel).params;
    assert.ok(cur.length[1] >= prev.length[1], `el nivel ${i + 1} acorta la pista`);
    assert.ok(cur.gaps[1] >= prev.gaps[1], `el nivel ${i + 1} saca huecos`);
  }
});

test("el nodo termina en `visual` y no llega nunca a los símbolos", () => {
  for (const l of PATH_LEVELS) assert.ok(l.layer === "concrete" || l.layer === "visual");
  assert.equal((PATH_LEVELS[PATH_LEVELS.length - 1] as PathLevel).layer, "visual");
});

// --- La manivela -------------------------------------------------------------

test("la manivela nunca produce medio paso", () => {
  for (let from = 0; from < 8; from++) {
    // Un barrido fino del gesto: entre dos dientes no hay nada que expresar.
    for (let grados = -720; grados <= 720; grados += 3) {
      const dientes = teethFromTurn((grados * Math.PI) / 180);
      assert.ok(Number.isInteger(dientes), `${grados}° dieron ${dientes} dientes`);
      const piedra = crankStep(from, dientes, 9);
      assert.ok(Number.isInteger(piedra), `${grados}° dejaron al caminante en ${piedra}`);
    }
  }
});

test("un diente es una piedra, siempre", () => {
  const vuelta = (2 * Math.PI) / TEETH_PER_TURN;
  for (let d = 1; d <= TEETH_PER_TURN; d++) {
    assert.equal(teethFromTurn(vuelta * d), d);
  }
});

test("girando al revés desde la orilla la manivela se traba, no hay piedra negativa", () => {
  for (let dientes = -1; dientes >= -20; dientes--) {
    assert.equal(crankStep(0, dientes, 7), 0);
  }
});

test("la pista se acaba: la manivela no inventa piedras después de la última", () => {
  for (let dientes = 1; dientes <= 30; dientes++) {
    assert.equal(crankStep(6, dientes, 7), 6);
  }
});

test("el agua devuelve: soltar al caminante en cualquier lado lo deja en una piedra", () => {
  for (let x = -3; x <= 12; x += 0.1) {
    const piedra = nearestStone(x, 7);
    assert.ok(Number.isInteger(piedra));
    assert.ok(piedra >= 0 && piedra <= 6, `${x} dejó al caminante en ${piedra}`);
  }
});

// --- El generador ------------------------------------------------------------

test("la misma semilla da la misma pista", () => {
  for (const l of PATH_LEVELS) {
    const a = generatePath(l, 4242);
    const b = generatePath(l, 4242);
    assert.deepEqual(a, b, `el nivel ${l.n} no es reproducible`);
  }
});

test("semillas distintas dan pistas distintas", () => {
  const vistas = new Set<string>();
  for (const s of seeds(40)) vistas.add(JSON.stringify(generatePath(pathLevelByNumber(5)!, s)));
  assert.ok(vistas.size > 25, `poca variedad: solo ${vistas.size} pistas en 40 semillas`);
});

test("la pista respeta el largo que declara el nivel", () => {
  for (const l of PATH_LEVELS) {
    for (const s of seeds(60)) {
      const p = generatePath(l, s);
      assert.ok(
        p.length >= l.params.length[0] && p.length <= l.params.length[1],
        `nivel ${l.n} semilla ${s}: pista de ${p.length} piedras`,
      );
    }
  }
});

test("la bandera cae siempre en una piedra de la pista, y adelante del caminante", () => {
  for (const l of PATH_LEVELS) {
    for (const s of seeds(60)) {
      const p = generatePath(l, s);
      if (p.flag === null) continue;
      assert.ok(Number.isInteger(p.flag));
      assert.ok(p.flag > p.start && p.flag < p.length, `nivel ${l.n} semilla ${s}`);
      assert.equal(p.flag, p.start + p.teeth, "los dientes anunciados tienen que llevar hasta ahí");
    }
  }
});

test("hasta el nivel 4 la pista va a lo ancho, sin estirar y con el cero en el extremo", () => {
  for (const n of [1, 2, 3, 4]) {
    for (const s of seeds(40)) {
      const p = generatePath(pathLevelByNumber(n)!, s);
      assert.equal(p.orientation, "horizontal");
      assert.equal(p.stretch, 1);
      assert.equal(p.leadIn, 0);
    }
  }
});

test("del nivel 5 en adelante la pista se para, se encoge y corre el cero", () => {
  const vistos = { vertical: false, encogida: false, corrida: false };
  for (const s of seeds(80)) {
    const p = generatePath(pathLevelByNumber(5)!, s);
    if (p.orientation === "vertical") vistos.vertical = true;
    if (p.stretch < 1) vistos.encogida = true;
    if (p.leadIn > 0) vistos.corrida = true;
  }
  assert.deepEqual(vistos, { vertical: true, encogida: true, corrida: true });
});

test("los huecos aparecen recién en el nivel 4 y se multiplican en el 5", () => {
  const maxHuecos = (n: number) =>
    Math.max(...seeds(60).map((s) => generatePath(pathLevelByNumber(n)!, s).gaps.length));
  assert.equal(maxHuecos(3), 0);
  assert.equal(maxHuecos(4), 1);
  assert.ok(maxHuecos(5) >= 2, "el nivel 5 tiene que traer huecos seguidos");
});

test("un hueco es siempre una piedra de la pista y nunca se repite", () => {
  for (const l of PATH_LEVELS) {
    for (const s of seeds(60)) {
      const p = generatePath(l, s);
      assert.equal(new Set(p.gaps).size, p.gaps.length, `nivel ${l.n} semilla ${s}: hueco repetido`);
      for (const g of p.gaps) {
        assert.ok(Number.isInteger(g) && g >= 0 && g < p.length, `hueco fuera de la pista: ${g}`);
      }
      assert.ok(p.gaps.length <= p.length - 2, "una pista sin tarjetas no se puede leer");
    }
  }
});

test("el cajón tiene una ficha por hueco y ninguna de más que sirva", () => {
  for (const n of [4, 5, 6]) {
    for (const s of seeds(60)) {
      const p = generatePath(pathLevelByNumber(n)!, s);
      const correctas = p.tiles.filter((t) => t.correct).map((t) => t.value).sort((a, b) => a - b);
      assert.deepEqual(correctas, [...p.gaps].sort((a, b) => a - b));
      assert.ok(p.tiles.length > p.gaps.length, "sin distractores no hay nada que elegir");
      assert.equal(new Set(p.tiles.map((t) => t.value)).size, p.tiles.length);
    }
  }
});

test("las fichas equivocadas son el numeral de al lado, no un número cualquiera", () => {
  const nivel = pathLevelByNumber(4)!;
  for (const s of seeds(40)) {
    const p = generatePath(nivel, s);
    for (const t of p.tiles.filter((t) => !t.correct)) {
      const cerca = p.gaps.some((g) => nivel.params.tileOffsets.some((d) => g + d === t.value));
      const enLaPista = t.value >= 0 && t.value < p.length;
      assert.ok(cerca || enLaPista, `la ficha ${t.value} no representa ningún error del diseño`);
    }
  }
});

test("los niveles sin fichas no traen cajón", () => {
  for (const n of [1, 2, 3]) {
    for (const s of seeds(20)) assert.deepEqual(generatePath(pathLevelByNumber(n)!, s).tiles, []);
  }
});

// --- Las dos animaciones de `explain` ----------------------------------------

test("el recorrido que miente cae al agua; el honesto pisa todas las piedras", () => {
  const nivel = pathLevelByNumber(3)!;
  for (const s of seeds(60)) {
    const p = generatePath(nivel, s);
    assert.equal(p.walks.length, 2, "explain necesita dos recorridos");
    const miente = p.walks[p.liar]!;
    const honesto = p.walks[1 - p.liar]!;
    assert.ok(
      miente.some((x) => !Number.isInteger(x)),
      `semilla ${s}: el recorrido que miente nunca cae entre dos piedras`,
    );
    assert.deepEqual(
      honesto,
      honesto.map((_, i) => i),
      "el honesto avanza una piedra por paso",
    );
    for (const w of p.walks) {
      assert.equal(w[0], 0, "los dos salen de la orilla");
      assert.equal(w[w.length - 1], p.flag, "los dos llegan a la bandera");
    }
  }
});

test("el que miente no está siempre en la misma fila", () => {
  const filas = new Set(seeds(40).map((s) => generatePath(pathLevelByNumber(3)!, s).liar));
  assert.deepEqual([...filas].sort(), [0, 1]);
});

// --- El caminante ------------------------------------------------------------

test("el caminante se va de la pista en la mitad de las instancias recién en `visual`", () => {
  for (const n of [1, 2, 3, 4, 5]) {
    for (const s of seeds(30)) assert.equal(generatePath(pathLevelByNumber(n)!, s).showWalker, true);
  }
  const sin = seeds(40).filter((s) => !generatePath(pathLevelByNumber(6)!, s).showWalker);
  assert.ok(sin.length > 5, "el nivel 6 tiene que jugarse a veces sin caminante");
});
