/**
 * Lo que estos tests cuidan es el guardrail, no los generadores: que un
 * invariante marque una instancia defectuosa fabricada a mano, que no marque
 * una limpia, y que cada nodo sepa contar cómo se contesta su ronda. Sin red y
 * sin Jev: todo esto tiene que correr en el CI de cada push.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  COMP_LEVELS,
  DIV_LEVELS,
  FN_LEVELS,
  SL_LEVELS,
  SYS_LEVELS,
  type CompLevel,
  type DivLevel,
  type FnLevel,
  type SlLevel,
  type SysLevel,
} from "@mathy/mechanics";
import { barrer, definirNodo, semillaDe, type Estado } from "../src/generadores.ts";
import { REGISTRO } from "../src/generadores/registro.ts";
import { COMPOSICION } from "../src/generadores/composicion.ts";
import { DIVISION } from "../src/generadores/division.ts";
import { MAQUINA } from "../src/generadores/maquina.ts";
import { PENDIENTE } from "../src/generadores/pendiente.ts";
import { SISTEMAS } from "../src/generadores/sistemas.ts";

const nivel = <L extends { readonly n: number }>(tabla: readonly L[], n: number): L => {
  const l = tabla.find((x) => x.n === n);
  if (!l) throw new Error(`no hay nivel ${n}`);
  return l;
};

const comp = (n: number, ronda: number, semilla = 7): ReturnType<typeof COMPOSICION.generar> =>
  COMPOSICION.generar(nivel<CompLevel>(COMP_LEVELS, n), semilla, ronda);
const pend = (n: number, ronda: number, semilla = 7): ReturnType<typeof PENDIENTE.generar> =>
  PENDIENTE.generar(nivel<SlLevel>(SL_LEVELS, n), semilla, ronda);
const sist = (n: number, ronda: number, semilla = 7): ReturnType<typeof SISTEMAS.generar> =>
  SISTEMAS.generar(nivel<SysLevel>(SYS_LEVELS, n), semilla, ronda);
const maq = (n: number, ronda: number, semilla = 7): ReturnType<typeof MAQUINA.generar> =>
  MAQUINA.generar(nivel<FnLevel>(FN_LEVELS, n), semilla, ronda);
const divi = (n: number, ronda: number, semilla = 7): ReturnType<typeof DIVISION.generar> =>
  DIVISION.generar(nivel<DivLevel>(DIV_LEVELS, n), semilla, ronda);

const reglasComp = (p: ReturnType<typeof COMPOSICION.generar>, n: number): readonly string[] =>
  COMPOSICION.invariantes(p, nivel<CompLevel>(COMP_LEVELS, n)).map((f) => f.regla);
const reglasPend = (p: ReturnType<typeof PENDIENTE.generar>, n: number): readonly string[] =>
  PENDIENTE.invariantes(p, nivel<SlLevel>(SL_LEVELS, n)).map((f) => f.regla);
const reglasSist = (p: ReturnType<typeof SISTEMAS.generar>, n: number): readonly string[] =>
  SISTEMAS.invariantes(p, nivel<SysLevel>(SYS_LEVELS, n)).map((f) => f.regla);
const reglasMaq = (p: ReturnType<typeof MAQUINA.generar>, n: number): readonly string[] =>
  MAQUINA.invariantes(p, nivel<FnLevel>(FN_LEVELS, n)).map((f) => f.regla);
const reglasDiv = (p: ReturnType<typeof DIVISION.generar>, n: number): readonly string[] =>
  DIVISION.invariantes(p, nivel<DivLevel>(DIV_LEVELS, n)).map((f) => f.regla);

// --- Lo limpio no se marca ---------------------------------------------------

test("un barrido corto de los cinco nodos no encuentra ninguna ronda rota", () => {
  const corrida = barrer(REGISTRO, 5);
  assert.equal(corrida.instancias, corrida.limpias.length + corrida.fallas.length);
  assert.deepEqual(
    corrida.fallas.map((f) => `${f.nodo} nivel ${f.nivel} semilla ${f.semilla}: ${f.regla} (${f.detalle})`),
    [],
  );
  assert.ok(corrida.instancias > 500, `sólo se generaron ${corrida.instancias} rondas`);
});

test("el barrido reporta dónde está la ronda rota, con nodo, nivel, semilla y ronda", () => {
  // Un nodo de mentira con un invariante que siempre falla: lo que se comprueba
  // acá es la cañería, que es lo que nadie ve hasta que hace falta.
  const inventado = definirNodo<{ readonly n: number }, { readonly ronda: number }>({
    id: "nodo.de.mentira",
    niveles: [{ n: 2 }],
    rondas: () => 1,
    generar: (_nivel, _semilla, ronda) => ({ ronda }),
    ask: () => "inventado",
    conEleccion: () => true,
    describir: () => ({ escena: { como_se_contesta: "no se contesta" } }),
    invariantes: (p) => [{ regla: "siempre falla", detalle: `ronda ${p.ronda}` }],
  });
  const corrida = barrer([inventado], 2);
  assert.equal(corrida.limpias.length, 0);
  assert.deepEqual(
    corrida.fallas.map((f) => `${f.nodo} nivel ${f.nivel} semilla ${f.semilla} ronda ${f.ronda}: ${f.regla}`),
    [
      "nodo.de.mentira nivel 2 semilla 2 ronda 0: siempre falla",
      "nodo.de.mentira nivel 2 semilla 3 ronda 0: siempre falla",
    ],
  );
});

test("las rondas que los generadores producen pasan sus propios invariantes", () => {
  assert.deepEqual(reglasComp(comp(1, 0), 1), []);
  assert.deepEqual(reglasComp(comp(4, 0), 4), []);
  assert.deepEqual(reglasPend(pend(7, 1), 7), []);
  assert.deepEqual(reglasSist(sist(3, 0), 3), []);
  assert.deepEqual(reglasMaq(maq(4, 0), 4), []);
  assert.deepEqual(reglasDiv(divi(4, 0), 4), []);
});

// --- La cadena de máquinas ---------------------------------------------------

test("dos fichas que se leen igual no pasan, y la ronda limpia sí", () => {
  const p = comp(1, 0);
  const [a, b] = [p.options[0], p.options[1]];
  assert.ok(a && b, "la ronda de mirar la bola trae fichas");
  const rotas = { ...p, options: [a, { ...b, pieces: a.pieces, value: a.value }, ...p.options.slice(2)] };
  const reglas = reglasComp(rotas, 1);
  assert.ok(reglas.includes("dos fichas dicen lo mismo"), reglas.join(", "));
  assert.ok(reglas.includes("dos fichas valen lo mismo"), reglas.join(", "));
});

test("dos carriles que dan lo mismo dejan la ronda con dos respuestas", () => {
  const p = comp(4, 0);
  assert.equal(p.ask, "which");
  assert.deepEqual(reglasComp(p, 4), []);
  assert.deepEqual(reglasComp({ ...p, otherOutput: p.target }, 4), ["los dos carriles dan lo mismo"]);
});

test("la salida pedida tiene que ser la que da la cadena", () => {
  const p = comp(1, 0);
  const reglas = reglasComp({ ...p, target: p.target + 1 }, 1);
  assert.ok(reglas.includes("la salida pedida no es la que da la cadena"), reglas.join(", "));
});

test("si los dos carriles dan lo mismo, la ronda no puede contestar que el orden importa", () => {
  const p = comp(7, 1);
  assert.equal(p.ask, "commutes");
  assert.deepEqual(reglasComp(p, 7), []);
  assert.deepEqual(reglasComp({ ...p, commutes: !p.commutes }, 7), [
    "la respuesta no es la que muestran los carriles",
  ]);
});

// --- La rampa ----------------------------------------------------------------

test("dos razones que son la misma cuesta son una sola respuesta con dos caras", () => {
  const p = pend(6, 1);
  assert.equal(p.ask, "slope_between");
  const rotas = { ...p, options: [{ rise: 2, run: 1 }, { rise: 4, run: 2 }, { rise: 1, run: 3 }], correct: 0 };
  const reglas = reglasPend(rotas, 6);
  assert.ok(reglas.includes("dos fichas son la misma cuesta"), reglas.join(", "));
});

test("una recta de más a la vista vuelve ambigua la pregunta por la pendiente", () => {
  // Es el bug real del nivel 7: la actividad dibuja `written.slice(0, 2)`, y con
  // dos rectas que no son la misma, "la pendiente de la recta escrita" no nombra
  // una sola cosa.
  const p = pend(7, 1);
  assert.equal(p.ask, "read_form");
  assert.deepEqual(reglasPend(p, 7), []);
  const rotas = {
    ...p,
    written: [
      { form: "solved" as const, a: -2, b: 1, c: 0 },
      { form: "solved" as const, a: -3, b: 1, c: 0 },
    ],
    options: [{ rise: 2, run: 1 }, { rise: 5, run: 1 }],
    correct: 0,
  };
  assert.deepEqual(reglasPend(rotas, 7), ["hay dos rectas a la vista con pendientes distintas"]);
});

test("dos rampas dibujadas con la misma cuesta no se pueden distinguir", () => {
  const p = pend(1, 0);
  assert.equal(p.ask, "pick_ramp");
  const primera = p.ramps[0];
  assert.ok(primera);
  const rotas = { ...p, ramps: p.ramps.map((r) => ({ ...r, slope: primera.slope })) };
  const reglas = reglasPend(rotas, 1);
  assert.ok(reglas.includes("dos rampas dibujadas son la misma cuesta"), reglas.join(", "));
});

// --- El cartel de las frutas -------------------------------------------------

test("la respuesta declarada tiene que dejar derechos los renglones", () => {
  const p = sist(3, 0);
  const [x, y] = [p.solution[0], p.solution[1]];
  assert.ok(typeof x === "number" && typeof y === "number");
  const reglas = reglasSist({ ...p, solution: [x + 1, y] }, 3);
  assert.ok(reglas.includes("la respuesta declarada no deja derecho el renglón"), reglas.join(", "));
});

test("la respuesta tiene que estar en el mostrador", () => {
  const p = sist(3, 0);
  const rotas = { ...p, chips: p.chips.filter((c) => c !== p.solution[0]) };
  const reglas = reglasSist(rotas, 3);
  assert.ok(reglas.includes("la respuesta no está en el mostrador"), reglas.join(", "));
});

test("la clase declarada tiene que ser la que dan las dos filas", () => {
  const p = sist(7, 0);
  assert.equal(p.ask, "classify");
  assert.deepEqual(reglasSist(p, 7), []);
  const otra = p.kind === "unique" ? "none" : "unique";
  assert.deepEqual(reglasSist({ ...p, kind: otra }, 7), ["la clase declarada no es la que dan las filas"]);
});

// --- La máquina --------------------------------------------------------------

test("dos máquinas que dan la misma salida dejan la ronda con dos respuestas", () => {
  const p = maq(4, 0);
  assert.equal(p.ask, "name");
  assert.deepEqual(reglasMaq(p, 4), []);
  assert.deepEqual(reglasMaq({ ...p, other: p.machines }, 4), ["las dos máquinas dan la misma salida"]);
});

test("una tabla que la máquina no produce no pasa", () => {
  const p = maq(2, 0);
  assert.equal(p.ask, "build");
  const fila = p.rows[0];
  assert.ok(fila);
  const reglas = reglasMaq({ ...p, rows: [{ ...fila, output: fila.output + 3 }, ...p.rows.slice(1)] }, 2);
  assert.ok(reglas.includes("la tabla no es la que da la máquina"), reglas.join(", "));
});

test("sin las piezas en el cajón la ronda de armar no se puede ganar", () => {
  const p = maq(2, 0);
  const reglas = reglasMaq({ ...p, tray: [] }, 2);
  assert.ok(reglas.includes("el cajón no tiene con qué armar la máquina"), reglas.join(", "));
});

// --- La banda y el llavero ---------------------------------------------------

test("una llave que dice abrir y no abre no pasa", () => {
  const p = divi(1, 0);
  assert.deepEqual(reglasDiv(p, 1), []);
  const rotas = { ...p, keys: p.keys.map((k) => ({ ...k, kind: "cut" as const })) };
  const reglas = reglasDiv(rotas, 1);
  assert.ok(reglas.includes("no hay una sola llave que abra"), reglas.join(", "));
  assert.ok(reglas.includes("una llave dice abrir y no abre"), reglas.join(", "));
});

test("la ficha correcta tiene que valer lo que da la cuenta", () => {
  const p = divi(4, 0);
  assert.equal(p.ask, "wall");
  const rotas = { ...p, options: p.options.map((o) => (o.correct ? { ...o, value: o.value + 100 } : o)) };
  assert.deepEqual(reglasDiv(rotas, 4), ["la ficha correcta no es la que da la mecánica"]);
});

test("el piso tiene que dar el total, con lo que sobra incluido", () => {
  const p = divi(7, 0);
  const reglas = reglasDiv({ ...p, leftover: p.leftover + p.factor }, 7);
  assert.ok(reglas.includes("el piso no da el total"), reglas.join(", "));
  assert.ok(reglas.includes("sobran más baldosas que las que entran en una fila"), reglas.join(", "));
});

test("dos fichas de acción que se ven iguales dejan la ronda con dos respuestas", () => {
  const p = divi(8, 0);
  assert.equal(p.ask, "undo");
  const primera = p.actions[0];
  assert.ok(primera);
  const rotas = { ...p, actions: p.actions.map((a) => ({ ...a, kind: primera.kind, dial: primera.dial })) };
  const reglas = reglasDiv(rotas, 8);
  assert.ok(reglas.includes("dos fichas de acción se ven iguales"), reglas.join(", "));
});

// --- Lo que Jev va a leer ----------------------------------------------------

test("cada nodo cuenta cómo se contesta cada una de sus rondas", () => {
  for (const nodo of REGISTRO) {
    for (const l of nodo.niveles) {
      for (let ronda = 0; ronda < l.rondas; ronda += 1) {
        const estado = nodo.describir(l.n, semillaDe(3, l.n, ronda), ronda, "Consigna de prueba.");
        const escena = estado["escena"] as Estado | undefined;
        assert.ok(escena, `${nodo.id} nivel ${l.n} ronda ${ronda} no describe la escena`);
        const gesto = escena["como_se_contesta"];
        assert.equal(
          typeof gesto,
          "string",
          `${nodo.id} nivel ${l.n} ronda ${ronda} no dice cómo se contesta`,
        );
        assert.ok(
          typeof gesto === "string" && gesto.length > 10,
          `${nodo.id} nivel ${l.n} ronda ${ronda} lo dice demasiado corto: "${String(gesto)}"`,
        );
        assert.equal(estado["consigna"], "Consigna de prueba.");
        // Una ronda sin fichas tiene que decirlo, porque una lista de fichas
        // vacía se lee como una ronda sin respuesta posible.
        const fichas = escena["fichas_para_elegir"];
        if (fichas !== undefined) {
          assert.ok(Array.isArray(fichas) && fichas.length > 0, `${nodo.id} nivel ${l.n}: lista de fichas vacía`);
        }
      }
    }
  }
});
