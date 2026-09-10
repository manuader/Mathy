import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FRAC_BALL_SLOTS,
  FRAC_EVIDENCE,
  FRAC_LEVELS,
  FRAC_MAX_PARTS,
  FRAC_MISCONCEPTION,
  FRAC_OPTION_SLOTS,
  FRAC_WHOLE_SLOTS,
  NODE_FRAC_PARTS,
  TOTAL_FRAC_LEVELS,
  fracEvenCut,
  fracLevelByNumber,
  fracMisconceptionFor,
  fracValue,
  generateFractions,
  isNodeOpen,
  nodeById,
  sameFrac,
  type FracLevel,
  type FracProblem,
} from "../src/index.ts";

const seeds = (n: number): number[] => Array.from({ length: n }, (_, i) => i * 37 + 1);

/** Todas las rondas de un nivel, para todas las semillas de la muestra. */
function rounds(level: FracLevel, n = 24): FracProblem[] {
  const out: FracProblem[] = [];
  for (const seed of seeds(n)) {
    for (let r = 0; r < level.rounds; r++) out.push(generateFractions(level, seed + r, r));
  }
  return out;
}

const todas = (): FracProblem[] => FRAC_LEVELS.flatMap((l) => rounds(l, 12));

// --- Los niveles como datos --------------------------------------------------

test("los ocho niveles del diseño están, en orden y sin repetir", () => {
  assert.equal(FRAC_LEVELS.length, 8);
  assert.equal(TOTAL_FRAC_LEVELS, 8);
  assert.deepEqual(
    FRAC_LEVELS.map((l) => l.n),
    [1, 2, 3, 4, 5, 6, 7, 8],
  );
});

test("cada nivel cambia la capa o endurece parámetros, nunca las dos cosas", () => {
  for (let i = 1; i < FRAC_LEVELS.length; i++) {
    const prev = FRAC_LEVELS[i - 1] as FracLevel;
    const cur = FRAC_LEVELS[i] as FracLevel;
    const cambioCapa = prev.layer !== cur.layer;
    const cambioParams = JSON.stringify(prev.params) !== JSON.stringify(cur.params);
    assert.ok(
      !(cambioCapa && cambioParams),
      `el nivel ${cur.n} cambia la capa y los parámetros a la vez`,
    );
  }
});

test("los parámetros nunca se ablandan al avanzar de nivel", () => {
  for (let i = 1; i < FRAC_LEVELS.length; i++) {
    const prev = (FRAC_LEVELS[i - 1] as FracLevel).params;
    const cur = (FRAC_LEVELS[i] as FracLevel).params;
    assert.ok(cur.parts[1] >= prev.parts[1], `el nivel ${i + 1} achica el número de abajo`);
    assert.ok(cur.shaded[1] >= prev.shaded[1], `el nivel ${i + 1} achica el número de arriba`);
    assert.ok(cur.wholes >= prev.wholes, `el nivel ${i + 1} saca todos de la mesa`);
  }
});

test("el nodo recorre las cuatro capas del diseño y termina en la definición", () => {
  assert.deepEqual(
    [...new Set(FRAC_LEVELS.map((l) => l.layer))],
    ["concrete", "visual", "symbolic", "formal"],
  );
  assert.equal((FRAC_LEVELS.at(-1) as FracLevel).layer, "formal");
  assert.deepEqual(
    FRAC_LEVELS.filter((l) => l.definition).map((l) => l.n),
    [8],
  );
});

test("los cinco verbos que el nodo puede evidenciar aparecen en algún nivel", () => {
  const vistos = new Set(FRAC_LEVELS.flatMap((l) => l.evidence));
  for (const verbo of FRAC_EVIDENCE) {
    assert.ok(vistos.has(verbo), `ningún nivel da evidencia de ${verbo}`);
  }
  // `transfer` se mide en otro nodo, así que nunca puede salir de este.
  assert.ok(!vistos.has("transfer"));
});

test("los numerales llegan recién en el nivel 5 y antes la ficha son puntos", () => {
  for (const l of FRAC_LEVELS) {
    assert.equal(l.chip, l.n < 5 ? "dots" : "numerals", `el nivel ${l.n} escribe fuera de tiempo`);
  }
});

test("la barra a demanda y la recta llegan cuando la analogía se retira", () => {
  // El diseño retira la pizza primero, porque el corte radial no sostiene el
  // nivel donde la fracción es un punto de la recta.
  const primerDisco = FRAC_LEVELS.find((l) => l.disc)?.n ?? 99;
  const primeraRecta = FRAC_LEVELS.find((l) => l.line)?.n ?? 99;
  const primeraADemanda = FRAC_LEVELS.find((l) => l.barOnDemand)?.n ?? 99;
  assert.ok(primerDisco < primeraRecta);
  assert.ok(primeraADemanda <= primeraRecta);
  assert.ok(FRAC_LEVELS.every((l) => !(l.disc && l.line)));
});

test("el libro de cuentas acompaña al corte y se va cuando el corte se va", () => {
  for (const l of FRAC_LEVELS) {
    if (l.asks.includes("cut")) assert.ok(l.ledger, `el nivel ${l.n} corta sin libro`);
  }
});

// --- El generador ------------------------------------------------------------

test("la misma semilla y la misma ronda dan el mismo problema", () => {
  for (const level of FRAC_LEVELS) {
    for (let r = 0; r < level.rounds; r++) {
      const a = generateFractions(level, 4242 + r, r);
      const b = generateFractions(level, 4242 + r, r);
      assert.deepEqual(a, b);
    }
  }
});

test("un nivel con dos preguntas las alterna en vez de sortearlas", () => {
  for (const level of FRAC_LEVELS) {
    if (level.asks.length < 2) continue;
    const vistas = new Set<string>();
    for (let r = 0; r < level.rounds; r++) vistas.add(generateFractions(level, 9, r).ask);
    assert.equal(vistas.size, level.asks.length, `el nivel ${level.n} no llega a preguntar todo`);
  }
});

test("cada ronda pregunta algo que su nivel declara", () => {
  for (const level of FRAC_LEVELS) {
    for (const p of rounds(level, 8)) {
      assert.ok(level.asks.includes(p.ask), `el nivel ${level.n} preguntó ${p.ask}`);
    }
  }
});

test("la fracción pedida siempre es una parte del todo y nunca lo excede", () => {
  for (const p of todas()) {
    assert.ok(p.target.den >= 2, "el número de abajo no puede ser cero ni uno");
    assert.ok(p.target.num >= 1, "el número de arriba nunca es cero en este nodo");
    assert.ok(p.target.num <= p.target.den, "acá todavía no hay fracciones impropias");
  }
});

test("el número de abajo se queda dentro del rango del nivel", () => {
  for (const level of FRAC_LEVELS) {
    for (const p of rounds(level, 12)) {
      // El generador puede acotar hacia abajo cuando la superficie no lo
      // sostiene (un disco de doce radios, un vaso de doce tramos), pero nunca
      // puede pasarse del techo que el nivel declara. La suma cruzada es la
      // excepción y no una fuga: el de abajo del resultado correcto es el
      // producto de los dos, y ese número lo trae la unidad común, no el nivel.
      const dens = p.ask === "which" ? p.addends.map((f) => f.den) : [p.target.den];
      for (const den of dens) {
        assert.ok(den <= level.params.parts[1], `el nivel ${level.n} cortó en ${den} partes`);
        assert.ok(den <= FRAC_MAX_PARTS);
      }
    }
  }
});

test("los todos de un problema nunca pasan las ranuras montadas", () => {
  for (const p of todas()) {
    assert.ok(p.wholes.length <= FRAC_WHOLE_SLOTS);
    assert.ok(p.options.length <= FRAC_OPTION_SLOTS);
    assert.ok(p.urn.reduce((s, n) => s + n, 0) * 2 <= FRAC_BALL_SLOTS);
  }
});

test("las fichas de una ronda nunca se repiten y siempre traen una correcta", () => {
  for (const p of todas()) {
    if (p.options.length === 0) continue;
    const correctas = p.options.filter((o) => o.correct);
    assert.equal(correctas.length, 1, `la ronda ${p.ask} no tiene una única ficha correcta`);
    for (let i = 0; i < p.options.length; i++) {
      for (let j = i + 1; j < p.options.length; j++) {
        const a = p.options[i];
        const b = p.options[j];
        assert.ok(a && b && !sameFrac(a.value, b.value), "dos fichas dicen lo mismo");
      }
    }
  }
});

test("elegir una ficha equivocada nunca es elegir la fracción pedida", () => {
  for (const p of todas()) {
    for (const o of p.options) {
      if (!o.correct) assert.ok(!sameFrac(o.value, p.target) || p.ask === "which");
    }
  }
});

test("el frasco tiene dos colores y el resaltado da exactamente la fracción", () => {
  const nivel = fracLevelByNumber(3) as FracLevel;
  for (const p of rounds(nivel, 16)) {
    assert.equal(p.ask, "draw");
    assert.equal(p.urn.length, 2);
    const total = p.urn.reduce((s, n) => s + n, 0);
    assert.equal(total, p.target.den, "el todo es el frasco, no la columna más alta");
    assert.equal(p.urn[p.highlighted], p.target.num);
    assert.ok(total >= 2 && (p.urn[0] as number) >= 1 && (p.urn[1] as number) >= 1);
  }
});

test("el frasco se llena al doble con la misma mezcla en una ronda del nivel", () => {
  const nivel = fracLevelByNumber(3) as FracLevel;
  const conRelleno = Array.from({ length: nivel.rounds }, (_, r) =>
    generateFractions(nivel, 77 + r, r),
  ).filter((p) => p.refill);
  assert.equal(conRelleno.length, 1, "el invariante de la proporción se juega una vez");
});

test("el reparto en platos da la misma ficha que la barra cortada en platos", () => {
  const nivel = fracLevelByNumber(6) as FracLevel;
  for (const p of rounds(nivel, 16)) {
    assert.equal(p.ask, "share");
    assert.ok(p.plates >= 2 && p.bars >= 1 && p.bars < p.plates);
    // `cs.arith.fraction_as_division`: repartir `bars` entre `plates` es la
    // barra cortada en `plates` con `bars` encendidas.
    assert.equal(p.target.num, p.bars);
    assert.equal(p.target.den, p.plates);
  }
});

test("comparar dos fracciones pone arriba la más grande y abajo el orden invertido", () => {
  const nivel = fracLevelByNumber(7) as FracLevel;
  for (const p of rounds(nivel, 16)) {
    if (p.ask !== "compare") continue;
    const buena = p.options.find((o) => o.correct);
    const mala = p.options.find((o) => !o.correct);
    assert.ok(buena && mala);
    assert.ok(fracValue(buena.value) >= fracValue(mala.value));
    // Las dos comparten el de arriba: decidir mirando ese numeral no alcanza.
    assert.equal(buena.value.num, mala.value.num);
    assert.equal(mala.lure, "bigger_denominator");
  }
});

test("la recta trae una marca por parte y la ficha cae en una de ellas", () => {
  const nivel = fracLevelByNumber(7) as FracLevel;
  for (const p of rounds(nivel, 16)) {
    if (p.ask !== "pin") continue;
    assert.equal(p.ticks, p.target.den);
    assert.ok(p.target.num < p.ticks, "la marca del uno no es lo que se pide clavar");
  }
});

test("con dos todos en juego los largos son distintos y la ficha es la misma", () => {
  for (const level of FRAC_LEVELS) {
    if (level.params.wholes < 2) continue;
    for (const p of rounds(level, 12)) {
      if (p.wholes.length < 2) continue;
      const spans = p.wholes.map((w) => w.span);
      if (p.ask === "share") continue;
      assert.notEqual(spans[0], spans[1], `el nivel ${level.n} dibujó dos todos iguales`);
      assert.equal(p.wholes[0]?.parts, p.wholes[1]?.parts);
      assert.equal(p.wholes[0]?.shaded, p.wholes[1]?.shaded);
    }
  }
});

test("los todos que nunca viste recorren las tres vías y ninguna se saltea", () => {
  const nivel = fracLevelByNumber(8) as FracLevel;
  const vistas = new Set(
    Array.from({ length: nivel.rounds }, (_, r) => generateFractions(nivel, 5, r).marking),
  );
  assert.deepEqual([...vistas].sort(), ["figures", "fill", "travel"]);
});

test("el corte de la barra solo llega entero cuando el nivel pide cortarlo", () => {
  for (const level of FRAC_LEVELS) {
    for (const p of rounds(level, 8)) {
      if (p.ask !== "cut") continue;
      for (const w of p.wholes) {
        assert.equal(w.parts, 0, "la barra ya venía cortada: no quedaba nada que hacer");
        assert.equal(w.shaded, 0);
      }
    }
  }
});

test("los distractores del nivel de reconocer son los tres del diseño", () => {
  const nivel = fracLevelByNumber(2) as FracLevel;
  const lures = new Set<string>();
  for (const p of rounds(nivel, 24)) {
    assert.equal(p.wholes.filter((w) => w.correct).length, 1);
    for (const w of p.wholes) if (w.lure) lures.add(w.lure);
    const buena = p.wholes.find((w) => w.correct);
    assert.equal(buena?.parts, p.target.den);
    assert.equal(buena?.shaded, p.target.num);
    assert.ok(buena?.even, "el todo correcto siempre tiene partes iguales");
  }
  assert.ok(lures.has("uneven_parts"), "faltan las porciones desparejas");
  assert.ok(lures.has("one_more_part"), "falta la porción de más");
});

// --- La misconception --------------------------------------------------------

test("la única misconception del nodo es la que el catálogo declara sobre él", () => {
  assert.equal(FRAC_MISCONCEPTION, "fraction_add_across");
  const clasifican = new Set<string>();
  for (const p of todas()) {
    for (const o of p.options) {
      const m = fracMisconceptionFor(o);
      if (m) clasifican.add(m);
    }
  }
  assert.deepEqual([...clasifican], ["fraction_add_across"]);
});

test("suma cruzada: la animación que hay que tocar es la que junta mal", () => {
  const nivel = fracLevelByNumber(4) as FracLevel;
  for (const p of rounds(nivel, 16)) {
    if (p.ask !== "which") continue;
    const [a, b] = p.addends;
    const cruzada = { num: a.num + b.num, den: a.den + b.den };
    const tocable = p.options[p.liar];
    assert.ok(tocable?.correct, "tocar la que suma cruzado tiene que ser acertar");
    assert.ok(sameFrac(tocable.value, cruzada));
    // Quien toca la otra está diciendo que cruzar estaba bien: eso clasifica.
    const otra = p.options[1 - p.liar];
    assert.ok(otra);
    assert.equal(fracMisconceptionFor(otra), FRAC_MISCONCEPTION);
    assert.equal(a.den === b.den, false, "con el mismo de abajo cruzar no falla y no se ve nada");
  }
});

test("ninguna ficha que no sea la suma cruzada clasifica", () => {
  for (const p of todas()) {
    for (const o of p.options) {
      if (o.lure !== "added_across") assert.equal(fracMisconceptionFor(o), undefined);
    }
  }
});

// --- El invariante que el juego ejecuta con la mano --------------------------

test("un corte parejo chasquea y uno desparejo no", () => {
  assert.ok(fracEvenCut([]));
  assert.ok(fracEvenCut([0.5]));
  assert.ok(fracEvenCut([0.25, 0.5, 0.75]));
  assert.ok(!fracEvenCut([0.2, 0.5, 0.75]));
  assert.ok(!fracEvenCut([0.7]));
  // La tolerancia existe porque el dedo no es exacto: cortar a mano tiene que
  // poder salir bien.
  assert.ok(fracEvenCut([0.51]));
});

// --- El registro -------------------------------------------------------------

test("el nodo se anota en el registro con su lugar y su prerequisito", () => {
  const spec = nodeById(NODE_FRAC_PARTS);
  assert.ok(spec);
  assert.equal(spec.n, 8);
  assert.deepEqual(spec.prereqs, ["arith.div.undo_mul"]);
  assert.equal(spec.levels.length, TOTAL_FRAC_LEVELS);
});

test("el nodo se abre cuando la división quedó terminada, y no antes", () => {
  const div = nodeById("arith.div.undo_mul");
  if (!div) {
    // El nodo 6 lo construye otro agente: mientras no exista, un prerequisito
    // sin minijuego no bloquea, que es la regla del registro.
    assert.ok(isNodeOpen(NODE_FRAC_PARTS, {}));
    return;
  }
  assert.ok(!isNodeOpen(NODE_FRAC_PARTS, {}));
  assert.ok(isNodeOpen(NODE_FRAC_PARTS, { "arith.div.undo_mul": div.levels.length }));
});
